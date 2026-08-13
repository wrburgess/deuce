// The decisions `run.ts` would otherwise make inline, kept here so they are
// testable — the pattern `tools/sync/run-helpers.ts` set: wiring is exercised
// by live runs, decisions by tests, and nothing that decides anything hides in
// the wiring.

import type { MeasuresIssue } from "./snapshot.ts";

export interface Args {
  pr: number | null;
  snapshotPath: string | null;
  issue: number | null;
  error: string | null;
}

// A command that misreads its arguments computes the wrong pull request and
// prints a confident block about it, so every unrecognized form is refused by
// name rather than skipped.
export function parseArgs(argv: string[]): Args {
  const args: Args = { pr: null, snapshotPath: null, issue: null, error: null };
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i]!;
    if (arg === "--snapshot") {
      const value = argv[++i];
      if (value === undefined) return { ...args, error: "--snapshot needs a file path" };
      args.snapshotPath = value;
      continue;
    }
    if (arg === "--issue") {
      const value = argv[++i];
      if (value === undefined || !/^\d+$/.test(value)) {
        return { ...args, error: "--issue needs an issue number" };
      }
      args.issue = Number(value);
      continue;
    }
    if (/^#?\d+$/.test(arg)) {
      args.pr = Number(arg.replace("#", ""));
      continue;
    }
    return { ...args, error: `unrecognized argument: ${arg}` };
  }
  if (args.pr === null && args.snapshotPath === null) {
    return { ...args, error: "no pull request named — usage: npm run measures -- <pr> [--issue <n>]" };
  }
  return args;
}

export interface IssueChoice {
  issue: MeasuresIssue | null;
  error: string | null;
}

// Which issue the elapsed runs from is the platform's own link, never a guess
// from a title or a body. None and several are both states the caller
// resolves with --issue; picking one silently is the fail-silent class this
// repository names in its own findings index.
export function selectIssue(
  closes: MeasuresIssue[],
  named: number | null,
  prNumber: number,
): IssueChoice {
  const links = closes.length === 0 ? "none" : closes.map((i) => `#${i.number}`).join(", ");

  if (named !== null) {
    const issue = closes.find((i) => i.number === named);
    if (issue === undefined) {
      return {
        issue: null,
        error: `PR #${prNumber} does not link issue #${named} — its links are ${links}, and an unlinked issue's opening time is not this pull request's throughput`,
      };
    }
    return { issue, error: null };
  }

  if (closes.length === 0) {
    return {
      issue: null,
      error: `PR #${prNumber} links no issue, so there is no opening time to measure from — name one with --issue <n> if the link is missing`,
    };
  }
  if (closes.length > 1) {
    return {
      issue: null,
      error: `PR #${prNumber} links ${closes.length} issues (${links}) — name the one to measure from with --issue <n>`,
    };
  }
  return { issue: closes[0]!, error: null };
}
