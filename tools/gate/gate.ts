// The gate's decision logic, kept free of the filesystem and the process table
// so every rejecting branch can be measured (ADR 0014). tools/gate/run.ts is
// the executable that wires this to spawnSync and existsSync.
//
// Exit codes are classified, and the distinction that matters is between 1 and
// 2: a check that ran and failed is not the same outcome as a gate that never
// ran, and a caller cannot tell them apart from a bare non-zero. #40 is the
// receipt — a failed post exiting unclassified was a defect, not a detail.

import { argvFromCommand } from "../review/dispatch.ts";
import type { CheckSpec } from "./declaration.ts";

export const EXIT_OK = 0;
export const EXIT_CHECK_FAILED = 1;
export const EXIT_CANNOT_RUN = 2;

export interface Outcome {
  name: string;
  command: string;
  code: number;
}

export interface GateResult {
  outcomes: Outcome[];
  code: number;
  unmet: string[];
  /**
   * Declared checks that were never attempted. The invariant every branch
   * below holds: each declared check is accounted for exactly once, across
   * outcomes, an unmet entry, or here. A report that says which checks ran
   * without saying which ones did not lets a short run read as a whole one.
   */
  skipped: string[];
}

export function runChecks(
  checks: CheckSpec[],
  exec: (argv: string[]) => number,
  present: (path: string) => boolean,
): GateResult {
  const outcomes: Outcome[] = [];
  const unmet: string[] = [];

  // The vacuous case. declaration.ts already refuses it; this is here so the
  // runner cannot quietly disagree with the parser about what zero checks
  // means, and so the guard sits on the unit being measured — checks — rather
  // than on whatever happened to be iterated to find them.
  if (checks.length === 0) {
    return {
      outcomes,
      unmet: ["no checks to run — a gate that ran nothing must never report green"],
      skipped: [],
      code: EXIT_CANNOT_RUN,
    };
  }

  // Everything is resolved before anything is executed, so a malformed command
  // or a missing prerequisite stops the gate instead of leaving it half-run
  // with no way to say which half.
  const argvs: string[][] = [];
  for (const check of checks) {
    try {
      argvs.push(argvFromCommand(check.command));
    } catch (err) {
      argvs.push([]);
      unmet.push(`check '${check.name}': ${(err as Error).message}`);
    }
    if (check.requires !== undefined && !present(check.requires)) {
      unmet.push(
        `check '${check.name}' requires '${check.requires}', which is missing — ` +
          "run `bash bin/setup`. The gate reports its own unreadiness and never installs: " +
          "a gate that repairs the tree it measures is measuring something else.",
      );
    }
  }
  if (unmet.length > 0) {
    // Nothing ran, so every declared check is unattempted — including the ones
    // whose own prerequisites were fine.
    return { outcomes, unmet, skipped: checks.map((c) => c.name), code: EXIT_CANNOT_RUN };
  }

  // Resolution above is all-or-nothing; execution below cannot be, because a
  // binary can go missing between one check and the next. When that happens
  // the gate has partly run, and the outcomes already collected are returned
  // alongside the failure — a report that says "could not run" while silently
  // dropping the half that did run tells a reader less than nothing.
  // Raised by the contractor review of cafb202.
  for (let i = 0; i < checks.length; i++) {
    const check = checks[i]!;
    let code: number;
    try {
      code = exec(argvs[i]!);
    } catch (err) {
      unmet.push(`check '${check.name}' could not be executed: ${(err as Error).message}`);
      return {
        outcomes,
        unmet,
        skipped: checks.slice(i + 1).map((c) => c.name),
        code: EXIT_CANNOT_RUN,
      };
    }
    outcomes.push({ name: check.name, command: check.command, code });
  }

  return {
    outcomes,
    unmet,
    skipped: [],
    code: outcomes.some((o) => o.code !== EXIT_OK) ? EXIT_CHECK_FAILED : EXIT_OK,
  };
}
