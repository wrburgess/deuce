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
import { missingFromPath, NEEDED_ON_PATH } from "./executables.ts";
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
  const uid = process.getuid?.();
  if (uid === undefined) {
    // `gui/` with nothing after it is a domain launchctl would reject in a way
    // that reads as a launchctl problem. Refused here, where the cause is named.
    console.error("nothing installed — this platform reports no user id, so there is no gui domain");
    process.exitCode = EXIT_CANNOT_RUN;
    return;
  }
  const domain = `gui/${uid}`;

  // Every arming guard runs before anything is booted out, and that order is the
  // whole point rather than tidiness. Booting out first meant a *refused* run
  // still disarmed the schedule that was working: the command printed "nothing
  // installed" and left the machine with no trigger at all — a failed guard
  // turning the trigger into a silent non-trigger (PR #136's second read).
  //
  // Arming binds a checkout, and the declaration names which one. Without this
  // the agent points wherever `factory-install` happened to run, and run.ts only
  // *logs* the mismatch — so an unattended trigger could work a checkout nobody
  // declared, holding the factory credential.
  //
  // Not simply forbidden: proving a branch before it merges means arming that
  // branch's checkout, which is how every pass to date was proven. So the
  // override exists, is named at the call site, and says so in the log — the
  // difference between a decision and an accident.
  const elsewhere = process.argv.includes("--this-checkout");
  const path = process.env["PATH"] ?? "";
  if (!remove) {
    if (cwd !== declaration.checkout && !elsewhere) {
      console.error(
        `nothing installed — this is ${cwd}, and the declared checkout is ${declaration.checkout}.\n` +
          "Arm the declared one, or pass --this-checkout to arm this one deliberately (a proving run).\n" +
          "Whatever was armed before is untouched.",
      );
      process.exitCode = EXIT_CANNOT_RUN;
      return;
    }

    const missing = missingFromPath(NEEDED_ON_PATH, path);
    if (missing.length > 0) {
      console.error(
        `nothing installed — the agent would carry this PATH, and ${missing.join(" and ")} ` +
          "cannot be found on it as an executable file. A trigger that cannot start its wrapper " +
          "fails before anything can report it.\n" +
          "Whatever was armed before is untouched.",
      );
      process.exitCode = EXIT_CANNOT_RUN;
      return;
    }
  }

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

  if (elsewhere) {
    console.log(`arming ${cwd}, which is not the declared ${declaration.checkout} — a proving run`);
  }

  const xml = renderPlist(declaration.trigger, {
    program: resolve(cwd, "bin/factory"),
    workingDirectory: cwd,
    // launchd's own environment holds neither the version-managed node nor the
    // homebrew claude, so the PATH that works interactively is captured here.
    path,
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
