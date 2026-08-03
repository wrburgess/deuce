// The orchestrated path — readiness, compose, dispatch, validate, record — as
// one command, so it cannot be half-run silently. Exit codes: 0 conforming
// review recorded · 2 unreachable · 3 unresponsive · 4 nonconforming after the
// one re-summons. 2, 3, and 4 are stops: the run asks the HC and never
// certifies unreviewed work as reviewed.

import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { parseArgs } from "node:util";
import { parseRoster } from "./roster.ts";
import {
  composeSummons,
  extractSeverityFramework,
  parseAcceptedRegister,
  PERMANENT_LENS,
} from "./compose.ts";
import { validateReview } from "./validate.ts";
import { checkLensSelection, parseLensMenu, parseLensSetSize } from "./lenses.ts";
import { argvFromCommand, dispatch, runReadiness } from "./dispatch.ts";
import { postComment } from "./record.ts";

const MAX_POSTED_CHARS = 60_000;

function sh(cmd: string, args: string[]): string {
  return execFileSync(cmd, args, { encoding: "utf8", maxBuffer: 64 * 1024 * 1024 });
}

function elideDiffForPosting(summons: string, base: string, commit: string): string {
  if (summons.length <= MAX_POSTED_CHARS) return summons;
  return summons.replace(
    /## Diff\n[\s\S]*$/,
    `## Diff\n\nElided from this posted copy for length; the dispatched summons carried it inline, byte-identical to:\n\n\`\`\`\ngit diff ${base}...${commit}\n\`\`\`\n`,
  );
}

const { values } = parseArgs({
  options: {
    pr: { type: "string" },
    commit: { type: "string" },
    base: { type: "string", default: "origin/main" },
    lens: { type: "string", multiple: true, default: [] },
    subject: { type: "string" },
    prose: { type: "boolean", default: false },
    "dry-run": { type: "boolean", default: false },
  },
});

if (!values.pr || !values.commit) {
  console.error(
    'usage: node tools/review/summon.ts --pr <n> --commit <sha> [--base <ref>] [--lens "..."]... [--subject "..."] [--dry-run]',
  );
  process.exit(1);
}

const prNumber = Number(values.pr);
const commit = values.commit;
const base = values.base!;

const reviewConfig = readFileSync("config/review.md", "utf8");
const roster = parseRoster(reviewConfig);

// The declared bounds are enforced at dispatch, not trusted to the caller.
const lensErrors = checkLensSelection(
  values.lens ?? [],
  parseLensMenu(reviewConfig),
  parseLensSetSize(reviewConfig),
  values.prose ?? false,
);
if (lensErrors.length > 0) {
  for (const e of lensErrors) console.error(e);
  process.exit(1);
}
const severityFramework = extractSeverityFramework(
  readFileSync("sds/02-review-and-findings.md", "utf8"),
);
const acceptedEntries = parseAcceptedRegister(
  readFileSync("findings/accepted.md", "utf8"),
);
const subject =
  values.subject ??
  sh("gh", ["pr", "view", String(prNumber), "--json", "title", "-q", ".title"]).trim();
const diff = sh("git", ["diff", `${base}...${commit}`]);

const summonedLenses = [...(values.lens ?? []), PERMANENT_LENS];

const summons = composeSummons({
  prNumber,
  subject,
  commit,
  lenses: values.lens ?? [],
  severityFramework,
  acceptedEntries,
  diff,
  reviewerName: roster.name,
});

if (values["dry-run"]) {
  process.stdout.write(summons);
  process.exit(0);
}

// Readiness before any dispatch: a failing check is unreachable now — recorded
// immediately, no waiting window, and the summons is never sent.
const readiness = runReadiness(roster.readinessCommand);
if (!readiness.ok) {
  postComment(
    prNumber,
    `## Review summons — not dispatched\n\n- **Reviewer:** ${roster.name}\n- **Readiness check:** \`${roster.readinessCommand}\` **failed** — ${readiness.detail}\n- **Outcome:** unreachable now. The summons was not dispatched and no waiting window was consumed.\n\nThis run stops here and asks the HC; it does not certify unreviewed work as reviewed.`,
  );
  console.error(`unreachable now: ${readiness.detail}`);
  process.exit(2);
}

postComment(
  prNumber,
  `## Review summons — ${roster.name}\n\n- **Mechanism:** \`${roster.mechanismCommand}\`, sandboxed read-only\n- **Readiness check:** \`${roster.readinessCommand}\` passed\n- **Bound to commit:** \`${commit}\`\n\n---\n\n${elideDiffForPosting(summons, base, commit)}`,
);

// Tokenized and executed without a shell — the configured command is data.
const mechanismArgv = argvFromCommand(roster.mechanismCommand);
const buildArgv = (outFile: string): string[] => [
  ...mechanismArgv,
  "--sandbox",
  "read-only",
  "--ephemeral",
  "--output-last-message",
  outFile,
  "-",
];

interface WaveResult {
  code: number;
  missing: string[];
}

function runWave(waveSummons: string, label: string): WaveResult {
  const outcome = dispatch({
    readinessCommand: roster.readinessCommand,
    buildArgv,
    summons: waveSummons,
  });

  if (outcome.kind === "unreachable") {
    postComment(
      prNumber,
      `## Contractor review — ${label}: reviewer unreachable\n\n- **Readiness check:** failed at dispatch — ${outcome.detail}\n- **Outcome:** unreachable now, recorded. This run stops and asks the HC.`,
    );
    console.error(`unreachable at dispatch: ${outcome.detail}`);
    return { code: 2, missing: [] };
  }
  if (outcome.kind === "unresponsive") {
    postComment(
      prNumber,
      `## Contractor review — ${label}: reviewer unresponsive\n\n- **Dispatched:** yes, readiness passed and the summons was sent\n- **Came back:** nothing — ${outcome.detail}\n- **Outcome:** unresponsive, recorded as a distinct outcome from unreachable. This run stops and asks the HC.`,
    );
    console.error(`unresponsive: ${outcome.detail}`);
    return { code: 3, missing: [] };
  }

  const validation = validateReview(outcome.output, commit, summonedLenses);
  if (validation.conforming) {
    postComment(
      prNumber,
      `## Contractor review — ${roster.name} (${label})\n\n- **Validation on return: conforming.** Severity vocabulary, findings fields, and commit binding all check.\n\n---\n\n${outcome.output}`,
    );
    console.log("conforming review recorded");
    return { code: 0, missing: [] };
  }

  postComment(
    prNumber,
    `## Contractor review — ${roster.name} (${label}): nonconforming\n\n- **Validation on return failed.** Missing, named:\n${validation.missing.map((m) => `  - ${m}`).join("\n")}\n\n---\n\n${outcome.output}`,
  );
  return { code: 4, missing: validation.missing };
}

const first = runWave(summons, "first response");
let code = first.code;
if (code === 4) {
  const reSummons =
    `# Re-summons — your previous response did not conform\n\n` +
    `Your previous response was validated against the contract in the summons and did not\n` +
    `conform. Missing, named:\n\n` +
    `${first.missing.map((m) => `- ${m}`).join("\n")}\n\n` +
    `Respond again, conforming, to the original summons below.\n\n---\n\n${summons}`;
  code = runWave(reSummons, "re-summons").code;
}

process.exit(code);
