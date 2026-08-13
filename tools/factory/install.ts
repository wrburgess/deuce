// Arms and disarms the trigger: `bash bin/factory-install`, and
// `bash bin/factory-install --remove`.
//
// Wiring only — the schedule comes from config/factory.md and the XML from
// plist.ts. This file adds the three facts that are true of an installation
// rather than of a declaration: which copy of the repository is being armed,
// what PATH launchd should hand the wrapper, and where the log goes.
//
// It is the only sanctioned writer of the installed agent (config/factory.md).

import { mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { homedir } from "node:os";
import { join, resolve } from "node:path";
import { parseFactoryDeclaration } from "./declaration.ts";
import { renderPlist } from "./plist.ts";

const DECLARATION = "config/factory.md";

const EXIT_OK = 0;
const EXIT_CANNOT_RUN = 2;

process.stdout.on("error", () => {});
process.stderr.on("error", () => {});

function main(): void {
  const remove = process.argv.includes("--remove");
  const cwd = process.cwd();

  let declaration;
  try {
    declaration = parseFactoryDeclaration(readFileSync(DECLARATION, "utf8"), homedir());
  } catch (err) {
    console.error(`nothing installed — ${DECLARATION}: ${(err as Error).message}`);
    process.exitCode = EXIT_CANNOT_RUN;
    return;
  }

  const label = declaration.trigger.label;
  const target = join(homedir(), "Library", "LaunchAgents", `${label}.plist`);
  const domain = `gui/${process.getuid?.() ?? ""}`;

  // Booting out an agent that is not loaded exits non-zero, which is not a
  // failure of this script: both paths want the same end state, loaded or gone.
  spawnSync("launchctl", ["bootout", `${domain}/${label}`], { stdio: "ignore" });

  if (remove) {
    rmSync(target, { force: true });
    console.log(`disarmed — ${label} booted out and ${target} removed`);
    console.log("the kill switch is a separate act and is unaffected by this one");
    process.exitCode = EXIT_OK;
    return;
  }

  const xml = renderPlist(declaration.trigger, {
    program: resolve(cwd, "bin/factory"),
    workingDirectory: cwd,
    // launchd's own environment holds neither the version-managed node nor the
    // homebrew claude, so the PATH that works interactively is captured here.
    path: process.env["PATH"] ?? "",
    stdoutPath: declaration.logPath,
    stderrPath: declaration.logPath,
  });

  try {
    mkdirSync(join(homedir(), "Library", "LaunchAgents"), { recursive: true });
    writeFileSync(target, xml, "utf8");
  } catch (err) {
    console.error(`nothing installed — ${target}: ${(err as Error).message}`);
    process.exitCode = EXIT_CANNOT_RUN;
    return;
  }

  const bootstrap = spawnSync("launchctl", ["bootstrap", domain, target], { encoding: "utf8" });
  if (bootstrap.error || bootstrap.status !== 0) {
    console.error(
      `the agent was written to ${target} but not loaded — ` +
        `launchctl bootstrap exited ${bootstrap.status}: ${bootstrap.stderr?.trim() ?? ""}`,
    );
    process.exitCode = EXIT_CANNOT_RUN;
    return;
  }

  const days = declaration.trigger.weekdays.join(", ");
  const time = `${String(declaration.trigger.hour).padStart(2, "0")}:${String(
    declaration.trigger.minute,
  ).padStart(2, "0")}`;
  console.log(`armed — ${label} loaded in ${domain}`);
  console.log(`  fires: weekdays ${days} at ${time}, running ${resolve(cwd, "bin/factory")}`);
  console.log(`  log:   ${declaration.logPath}`);
  console.log(`  stop:  touch ${declaration.killSwitch}`);
  process.exitCode = EXIT_OK;
}

main();
