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
    return { outcomes, unmet, code: EXIT_CANNOT_RUN };
  }

  for (let i = 0; i < checks.length; i++) {
    const check = checks[i]!;
    outcomes.push({ name: check.name, command: check.command, code: exec(argvs[i]!) });
  }

  return {
    outcomes,
    unmet,
    code: outcomes.some((o) => o.code !== EXIT_OK) ? EXIT_CHECK_FAILED : EXIT_OK,
  };
}
