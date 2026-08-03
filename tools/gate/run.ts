// The quality gate, as one command: `npm run gate`.
//
// This file is the wiring only — read the declaration, run what it declares,
// report. Every decision lives in gate.ts and declaration.ts, where it can be
// measured without spawning anything (ADR 0014). It is kept separate from
// gate.ts so that importing the logic in a test does not run the gate.

import { existsSync, readFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { parseDeclaration } from "./declaration.ts";
import { EXIT_CANNOT_RUN, EXIT_OK, runChecks } from "./gate.ts";

const DECLARATION = "config/checks.md";

// An asynchronous EPIPE arrives after the write returns, so no try/catch
// reaches it, and it would replace a classified exit with a crash. Installed
// once, before anything writes — the same fix PR #46 landed for summon.ts.
process.stdout.on("error", () => {});
process.stderr.on("error", () => {});

function main(): void {
  let checks;
  try {
    checks = parseDeclaration(readFileSync(DECLARATION, "utf8")).checks;
  } catch (err) {
    console.error(`the gate could not run — ${DECLARATION}: ${(err as Error).message}`);
    process.exitCode = EXIT_CANNOT_RUN;
    return;
  }

  let result;
  try {
    result = runChecks(
      checks,
      (argv) => {
        const run = spawnSync(argv[0]!, argv.slice(1), { stdio: "inherit" });
        // A binary that is not there is the gate failing to run, not a check
        // failing. Thrown so it lands in the branch below rather than being
        // averaged into a non-zero exit that reads as a real failure.
        if (run.error) {
          throw new Error(`could not execute \`${argv.join(" ")}\`: ${run.error.message}`);
        }
        // status is null when a signal killed the child; that is a check that
        // did not pass, and it is reported as one.
        return run.status ?? EXIT_CANNOT_RUN;
      },
      existsSync,
    );
  } catch (err) {
    console.error(`the gate could not run: ${(err as Error).message}`);
    process.exitCode = EXIT_CANNOT_RUN;
    return;
  }

  for (const line of result.unmet) console.error(line);
  for (const outcome of result.outcomes) {
    console.log(
      `${outcome.code === EXIT_OK ? "pass" : "FAIL"}  ${outcome.name}  (${outcome.command})`,
    );
  }
  if (result.code === EXIT_OK) {
    console.log(`gate green — ${result.outcomes.length} checks, declared in ${DECLARATION}`);
  }
  process.exitCode = result.code;
}

main();
