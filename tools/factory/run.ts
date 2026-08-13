// The factory's trigger, as one command: `bash bin/factory`, which is what the
// launchd agent runs (config/factory.md, *The trigger*).
//
// This file is the wiring only — read the declaration, observe, decide, start,
// release. Every decision lives in preflight.ts and declaration.ts, where it can
// be measured without a filesystem, a keychain, or an agent (ADR 0014).
//
// What it deliberately does not do: judge the queue, choose cargo, or write any
// tracker artifact except the notice for a pass that died. The pass is the
// `execute` Skill's, and a wrapper that decided anything about the work would be
// a second authority beside the artifacts (ADR 0024).

import { readFileSync, rmSync, statSync, writeFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { homedir, tmpdir } from "node:os";
import { join } from "node:path";
import { parseFactoryDeclaration } from "./declaration.ts";
import { claim, release, takenAt } from "./lock.ts";
import { decide, deathNotice, type Observation } from "./preflight.ts";

const DECLARATION = "config/factory.md";

const EXIT_OK = 0;
const EXIT_PASS_FAILED = 1;
const EXIT_CANNOT_RUN = 2;

// An asynchronous EPIPE arrives after the write returns, so no try/catch
// reaches it, and it would replace a classified exit with a crash. Installed
// once, before anything writes — the same fix PR #46 landed for summon.ts.
process.stdout.on("error", () => {});
process.stderr.on("error", () => {});

function log(message: string): void {
  console.log(`[${new Date().toISOString()}] ${message}`);
}

function git(cwd: string, args: string[]): string | null {
  const run = spawnSync("git", args, { cwd, encoding: "utf8" });
  if (run.error || run.status !== 0) return null;
  return run.stdout;
}

// The token is read into memory and passed to one child's environment. It is
// never logged, never written to a file, and never placed on a command line
// where `ps` would carry it.
function readToken(service: string, account: string): string | null {
  const run = spawnSync("security", ["find-generic-password", "-s", service, "-a", account, "-w"], {
    encoding: "utf8",
  });
  if (run.error || run.status !== 0) return null;
  const token = run.stdout.trim();
  return token === "" ? null : token;
}

function observe(
  cwd: string,
  killSwitch: string,
  lock: string,
  service: string,
  account: string,
): Observation {
  const lockTakenAt = takenAt(lock);

  let killSwitchPresent = false;
  try {
    statSync(killSwitch);
    killSwitchPresent = true;
  } catch {
    killSwitchPresent = false;
  }

  const status = git(cwd, ["status", "--porcelain"]);
  const branch = git(cwd, ["rev-parse", "--abbrev-ref", "HEAD"]);

  return {
    killSwitchPresent,
    lockTakenAt,
    checkoutClean: status === null ? null : status.trim() === "",
    branch: branch === null ? null : branch.trim(),
    // Reading the keychain is a side effect only in the sense that it needs the
    // login keychain unlocked; with the HC logged out it fails, and failing
    // closed is the declared behavior (config/factory.md).
    tokenPresent: readToken(service, account) !== null,
  };
}

function postDeathNotice(recordHome: string, body: string, token: string, cwd: string): void {
  const file = join(tmpdir(), `deuce-factory-death-${process.pid}.md`);
  try {
    writeFileSync(file, body, "utf8");
    const run = spawnSync("gh", ["issue", "comment", recordHome, "--body-file", file], {
      cwd,
      encoding: "utf8",
      env: { ...process.env, GH_TOKEN: token },
    });
    if (run.error || run.status !== 0) {
      // The notice failing is not the pass failing, and it must not be silent:
      // the body goes to the log so the HC can place it by hand, exactly as
      // tools/review/summon.ts does for an unposted review record.
      log(`the death notice could not be posted — place it by hand:\n${body}`);
      return;
    }
    log(`death notice posted at #${recordHome}`);
  } finally {
    rmSync(file, { force: true });
  }
}

function main(): void {
  const cwd = process.cwd();

  let declaration;
  try {
    declaration = parseFactoryDeclaration(readFileSync(DECLARATION, "utf8"), homedir());
  } catch (err) {
    log(`the trigger could not run — ${DECLARATION}: ${(err as Error).message}`);
    process.exitCode = EXIT_CANNOT_RUN;
    return;
  }

  if (cwd !== declaration.checkout) {
    // Not refused: proving runs are run from the branch under test, which is
    // how every factory pass to date was proven. Said out loud so a log never
    // implies the declared checkout when it was somewhere else.
    log(`running from ${cwd}; the declared checkout is ${declaration.checkout}`);
  }

  const account = process.env["USER"] ?? "";
  const verdict = decide(
    observe(cwd, declaration.killSwitch, declaration.lock, declaration.keychainService, account),
    new Date(),
  );
  log(verdict.message);
  if (verdict.kind === "killed" || verdict.kind === "busy") {
    process.exitCode = EXIT_OK;
    return;
  }
  if (verdict.kind === "refused") {
    process.exitCode = EXIT_CANNOT_RUN;
    return;
  }

  // The claim is the check: two triggers racing here cannot both proceed. The
  // observation above only produces the friendly message; this is the guarantee.
  if (!claim(declaration.lock)) {
    log("the lock was taken between the check and the claim — nothing started");
    process.exitCode = EXIT_OK;
    return;
  }

  const token = readToken(declaration.keychainService, account);
  if (token === null) {
    release(declaration.lock);
    log("the tracker credential vanished between the check and the start — nothing started");
    process.exitCode = EXIT_CANNOT_RUN;
    return;
  }

  const startedAt = new Date();
  log(`pass starting — deadline ${declaration.deadlineSeconds}s`);
  try {
    const pass = spawnSync("claude", ["-p", "/execute", "--permission-mode", "bypassPermissions"], {
      cwd,
      stdio: "inherit",
      timeout: declaration.deadlineSeconds * 1000,
      env: {
        ...process.env,
        GH_TOKEN: token,
        // Reaches every git the session runs without editing the checkout's
        // config. CLAUDE.md's own note is the receipt: the signer hangs when it
        // is invoked with nobody to answer it, and a hang holds the lock and
        // posts nothing.
        GIT_CONFIG_COUNT: "1",
        GIT_CONFIG_KEY_0: "commit.gpgsign",
        GIT_CONFIG_VALUE_0: "false",
      },
    });

    const endedAt = new Date();
    const died = (detail: string, reason: "deadline" | "exit"): void => {
      log(`pass died — ${detail}`);
      postDeathNotice(
        declaration.recordHome,
        deathNotice({
          label: declaration.trigger.label,
          startedAt,
          endedAt,
          reason,
          detail,
          logPath: declaration.logPath,
        }),
        token,
        cwd,
      );
      process.exitCode = EXIT_PASS_FAILED;
    };

    // The deadline is decided by the code node sets, never by "a signal
    // arrived": a pass the HC killed by hand also arrives here with a signal,
    // and a notice claiming the deadline for it would be a false account of the
    // run — which is the one thing a death notice exists to avoid.
    const failure = pass.error as NodeJS.ErrnoException | undefined;
    if (failure?.code === "ETIMEDOUT") {
      died(
        `killed with ${pass.signal} at the declared deadline of ${declaration.deadlineSeconds}s`,
        "deadline",
      );
      return;
    }
    if (failure) {
      log(`the pass could not be started: ${failure.message}`);
      process.exitCode = EXIT_CANNOT_RUN;
      return;
    }
    if (pass.signal !== null) {
      died(`killed with ${pass.signal}, which was not the deadline`, "exit");
      return;
    }
    if (pass.status !== 0) {
      died(`exited ${pass.status}`, "exit");
      return;
    }
    log("pass ended — its run record is the account of what it did");
    process.exitCode = EXIT_OK;
  } finally {
    release(declaration.lock);
    log("lock released");
  }
}

main();
