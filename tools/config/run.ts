// The dated-and-sourced check, as one command: `npm run lint:config`.
//
// This file is the wiring only — read the declarations, check them, report.
// Every decision lives in dated.ts, where it can be measured without touching
// the filesystem (ADR 0014). The directory argument exists for the empty-input
// deletion measurement; the gate always runs the default.

import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { checkDated } from "./dated.ts";

const EXIT_OK = 0;
const EXIT_REJECTED = 1;
const EXIT_CANNOT_RUN = 2;

// An asynchronous EPIPE arrives after the write returns, so no try/catch
// reaches it, and it would replace a classified exit with a crash. Installed
// once, before anything writes — the same fix PR #46 landed for summon.ts.
process.stdout.on("error", () => {});
process.stderr.on("error", () => {});

function main(): void {
  const dir = process.argv[2] ?? "config";

  // A directory or file that cannot be read is the check failing to run, not
  // the state it rejects — different outcomes, different exits (Chapter 3,
  // *The tooling contract*).
  let files;
  try {
    files = readdirSync(dir)
      .filter((name) => name.endsWith(".md"))
      .sort()
      .map((name) => ({
        path: join(dir, name),
        content: readFileSync(join(dir, name), "utf8"),
      }));
  } catch (err) {
    console.error(`the check could not run — ${dir}: ${(err as Error).message}`);
    process.exitCode = EXIT_CANNOT_RUN;
    return;
  }

  const errors = checkDated(files);
  if (errors.length > 0) {
    for (const e of errors) console.error(e);
    process.exitCode = EXIT_REJECTED;
    return;
  }
  console.log(
    `dated-and-sourced green — ${files.length} declarations read: ${files
      .map((f) => f.path)
      .join(", ")}`,
  );
  process.exitCode = EXIT_OK;
}

main();
