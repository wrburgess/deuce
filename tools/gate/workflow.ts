// The independent re-run's workflow, held to what it is allowed to be (#126;
// Chapter 3, *One definition, two runners*; ADR 0029, which permits the runner
// to be software at all).
//
// The runner is independent of the AC in one respect only: GitHub records the
// verdict where neither party can edit it. The workflow file itself is written
// by the AC, and #127 carries that residue as a named risk. This module is what
// narrows it — three properties of the workflow, decided mechanically rather
// than asserted in a declaration:
//
//   1. It invokes the gate and enumerates no check of its own (ADR 0015 — one
//      definition, in config/checks.md and nowhere else). A second list in CI
//      is the exact drift that ADR forbids, arriving where nobody would look.
//   2. It grants no write. config/credentials.md's entry for the per-run token
//      claims read-only reach; this is what makes that claim enforceable
//      instead of a sentence.
//   3. It still watches pull requests. A workflow that quietly loses its
//      trigger stops checking anything while continuing to look like it does.
//
// This is a pure function over one document, in the shape tools/lint/tracker's
// checks use — violations for what it decided, a guard for what it refused to
// decide (ADR 0014: an empty input must never read as a pass).
//
// It rides in `npm test` rather than joining config/checks.md as a ninth check.
// Nothing about the gate's contents needs to move for this property to be
// enforced, and a check row would say the gate grew when it did not.
//
// ---------------------------------------------------------------------------
// Declared blind spot (Chapter 3, *Every check declares its blind spot*)
//
// It reads the `run:` strings of the workflow's steps. A step that calls a
// shell script, a composite action, or any `uses:` action that runs checks of
// its own is not reached — nothing short of executing the workflow decides
// that, and a deeper probe would only move the proxy, which is the reasoning
// config/checks.md already records for the prerequisite probe. Whether the
// verdict GitHub records is the verdict this file describes is likewise out of
// reach from here; the run on the pull request is what shows that.

import { parse as parseYaml } from "yaml";

export interface WorkflowResult {
  violations: string[];
  // A document this module refused to read, as distinct from one it read and
  // rejected. Collapsing the two lets a malformed workflow pass as a clean one.
  guard: string | null;
  runStepsScanned: number;
}

const GATE_COMMAND = "npm run gate";

interface Step {
  run?: unknown;
}

function jobSteps(doc: Record<string, unknown>): Step[] | string {
  const jobs = doc["jobs"];
  if (jobs === undefined || jobs === null || typeof jobs !== "object") {
    return "the workflow declares no jobs — refusing to read a workflow that runs nothing as one that runs the gate";
  }
  const steps: Step[] = [];
  for (const [name, job] of Object.entries(jobs as Record<string, unknown>)) {
    const declared = (job as { steps?: unknown })?.steps;
    if (declared === undefined) continue;
    if (!Array.isArray(declared)) {
      return `job "${name}" declares a steps key that is not a list`;
    }
    for (const step of declared) steps.push(step as Step);
  }
  return steps;
}

// `on` is a boolean in YAML 1.1 and a plain string key in YAML 1.2. The parser
// here is 1.2, so the key arrives as "on" — but a 1.1-flavored reader would
// hand back `true`, and a lookup that only knew one of them would report a
// missing trigger on a workflow that has one. Both are accepted, and the
// asymmetry is written down rather than left to be rediscovered.
function triggers(doc: Record<string, unknown>): unknown {
  return doc["on"] ?? doc["true"];
}

function triggerNames(on: unknown): string[] {
  if (typeof on === "string") return [on];
  if (Array.isArray(on)) return on.filter((t): t is string => typeof t === "string");
  if (on !== null && typeof on === "object") return Object.keys(on as Record<string, unknown>);
  return [];
}

// One block, wherever it sits. A job-level block overrides the workflow-level
// one, so reading only the top would certify a read-only workflow that hands a
// job write — the shape that makes the credentials entry false while it still
// reads as true. Raised against this module's own first draft, which read the
// top level and nothing else.
function grantViolations(where: string, permissions: unknown): string[] {
  if (typeof permissions === "string") {
    return permissions === "read-all"
      ? []
      : [`${where} grants \`permissions: ${permissions}\` — the entry in config/credentials.md declares reads only`];
  }
  if (permissions === null || typeof permissions !== "object") {
    return [`${where} carries a \`permissions:\` block that is neither a scope map nor a known keyword`];
  }
  const violations: string[] = [];
  for (const [scope, grant] of Object.entries(permissions as Record<string, unknown>)) {
    if (grant !== "read" && grant !== "none") {
      violations.push(
        `${where} grants \`${scope}: ${String(grant)}\` — the entry in config/credentials.md declares reads only`,
      );
    }
  }
  return violations;
}

function permissionViolations(doc: Record<string, unknown>): string[] {
  const violations: string[] = [];
  const top = doc["permissions"];
  // Absent is not "the default is fine" — an absent block inherits whatever the
  // repository's default happens to be, which no declaration here controls.
  if (top === undefined) {
    violations.push(
      "the workflow declares no `permissions:` block — an absent block inherits the repository default, which config/credentials.md does not bind",
    );
  } else {
    violations.push(...grantViolations("the workflow", top));
  }

  const jobs = doc["jobs"];
  if (jobs !== null && typeof jobs === "object") {
    for (const [name, job] of Object.entries(jobs as Record<string, unknown>)) {
      const own = (job as { permissions?: unknown })?.permissions;
      if (own !== undefined) violations.push(...grantViolations(`job "${name}"`, own));
    }
  }
  return violations;
}

/**
 * `declaredCommands` is config/checks.md's command list, passed in rather than
 * read, so every branch below is measurable against a literal document. The
 * gate's own command is deliberately not among them: config/checks.md declares
 * the checks the gate runs, never the gate itself.
 */
export function checkGateWorkflow(workflowYaml: string, declaredCommands: string[]): WorkflowResult {
  let doc: unknown;
  try {
    doc = parseYaml(workflowYaml);
  } catch (err) {
    return {
      violations: [],
      guard: `the workflow did not parse as YAML: ${(err as Error).message}`,
      runStepsScanned: 0,
    };
  }
  if (doc === undefined || doc === null || typeof doc !== "object") {
    return {
      violations: [],
      guard: "the workflow is empty or is not a mapping — refusing to treat it as a conforming one",
      runStepsScanned: 0,
    };
  }
  const workflow = doc as Record<string, unknown>;

  const steps = jobSteps(workflow);
  if (typeof steps === "string") {
    return { violations: [], guard: steps, runStepsScanned: 0 };
  }
  const runs = steps
    .map((s) => s.run)
    .filter((r): r is string => typeof r === "string");
  if (runs.length === 0) {
    return {
      violations: [],
      guard: "the workflow declares no `run:` step — refusing to read a workflow that runs nothing as one that runs the gate",
      runStepsScanned: 0,
    };
  }

  const violations: string[] = [];

  // Per line, not per step: a `run:` block is often several commands, and a
  // second check hidden on the second line is the shape this exists to catch.
  // Comment lines are dropped, and that cuts both ways — it stops a comment
  // mentioning a check from reading as a second check, and it stops a
  // commented-out `npm run gate` from satisfying the requirement that the gate
  // is invoked. The second is the one that mattered: without this, a workflow
  // could disable itself with a single `#` and still pass.
  const lines = runs
    .flatMap((run) => run.split("\n"))
    .map((l) => l.trim())
    .filter((l) => l !== "" && !l.startsWith("#"));

  if (!lines.some((line) => line.includes(GATE_COMMAND))) {
    violations.push(
      `no step runs \`${GATE_COMMAND}\` — the re-run's whole contract is that it invokes the one command`,
    );
  }

  for (const line of lines) {
    for (const command of declaredCommands) {
      if (line.includes(command)) {
        violations.push(
          `a step runs \`${command}\` directly — a check joins the gate only in config/checks.md, and CI never enumerates a second list (ADR 0015)`,
        );
      }
    }
  }

  violations.push(...permissionViolations(workflow));

  const on = triggers(workflow);
  if (!triggerNames(on).includes("pull_request")) {
    violations.push(
      "the workflow does not trigger on `pull_request` — the merge candidate is what the re-run exists to read",
    );
  } else {
    // Present is not the same as covering. A branch filter narrows the trigger
    // to some pull requests while the trigger name still reads as there, which
    // is the silent-narrowing shape one level down from removing it outright.
    const settings = (on as Record<string, unknown> | null)?.["pull_request"];
    if (settings !== null && typeof settings === "object") {
      for (const key of ["branches", "branches-ignore"]) {
        if (key in (settings as Record<string, unknown>)) {
          violations.push(
            `the \`pull_request\` trigger carries a \`${key}\` filter — the re-run covers every pull request, not a subset`,
          );
        }
      }
    }
  }

  return { violations, guard: null, runStepsScanned: runs.length };
}
