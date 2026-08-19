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

import { readFileSync, rmSync, writeFileSync } from "node:fs";
import { spawnSync, type SpawnSyncOptions } from "node:child_process";
import { homedir, tmpdir } from "node:os";
import { join } from "node:path";
import { parseFactoryDeclaration } from "./declaration.ts";
import { readSwitch } from "./killswitch.ts";
import { claim, reapGroup, release, takenAt } from "./lock.ts";
import {
  decide,
  deathNotice,
  parseRemote,
  type Observation,
  type TokenState,
} from "./preflight.ts";

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

// One probe, called from all three doors: the observation before the lock, the
// re-check after it, and tokenState below. Kept as one function so they cannot
// drift into testing different things — which is exactly how a re-check comes to
// certify something the first check did not (PR #136's review).
function works(token: string, cwd: string): boolean {
  // Probe the repository, not the account. The minted credential is scoped to
  // this repository only, so `gh api user` could 401 a token that works
  // perfectly for every call a pass makes — and a false refusal on a good
  // credential is the most confusing failure this door could produce.
  const remote = git(cwd, ["remote", "get-url", "origin"]);
  const target = remote === null ? null : parseRemote(remote);
  const probe = spawnSync(
    "gh",
    target === null ? ["api", "user", "--jq", ".login"] : ["api", `repos/${target}`, "--jq", ".full_name"],
    { encoding: "utf8", env: { ...process.env, GH_TOKEN: token } },
  );
  return !probe.error && probe.status === 0;
}

// Presence is not usability, and a pass needs the second. One call at the door
// costs a round trip and saves a whole pass — the receipt is this build's first
// proving run, which reached the queue read before learning the keychain held a
// placeholder (#108).
function tokenState(cwd: string, service: string, account: string): TokenState {
  const token = readToken(service, account);
  if (token === null) return "absent";
  return works(token, cwd) ? "usable" : "unusable";
}

function observe(
  cwd: string,
  killSwitch: string,
  lock: string,
  service: string,
  account: string,
): Observation {
  const lockTakenAt = takenAt(lock);

  const status = git(cwd, ["status", "--porcelain"]);
  const branch = git(cwd, ["rev-parse", "--abbrev-ref", "HEAD"]);

  return {
    killSwitch: readSwitch(killSwitch),
    lockTakenAt,
    checkoutClean: status === null ? null : status.trim() === "",
    branch: branch === null ? null : branch.trim(),
    // Reading the keychain needs the login keychain unlocked; with the HC
    // logged out it fails, and failing closed is the declared behavior
    // (config/factory.md).
    token: tokenState(cwd, service, account),
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

  // Everything below re-decides after the claim, on the state that will actually
  // be used. The observation above ran before the lock existed, so each of these
  // covers the window between the two — small, and the contractor review on
  // PR #136 was right that small is not none.
  // The switch is an emergency act; "thrown while the wrapper was starting" is
  // exactly when it will be thrown, and a pass that spawned anyway would have
  // read the guarantee (config/factory.md, *The kill switch*) as covering only
  // the tidy case. Read through the same three-state reader as the observation,
  // so this door cannot be more permissive than that one.
  const switchNow = readSwitch(declaration.killSwitch);
  if (switchNow !== "absent") {
    release(declaration.lock);
    log(
      switchNow === "present"
        ? "the kill switch appeared while this wrapper was starting — nothing started"
        : "the kill switch stopped being readable while this wrapper was starting — nothing started",
    );
    process.exitCode = switchNow === "present" ? EXIT_OK : EXIT_CANNOT_RUN;
    return;
  }

  const token = readToken(declaration.keychainService, account);
  if (token === null) {
    release(declaration.lock);
    log("the tracker credential vanished between the check and the start — nothing started");
    process.exitCode = EXIT_CANNOT_RUN;
    return;
  }
  // Presence is not usability, and the earlier probe tested a value this one may
  // no longer be: a rotation or a revocation in the window would otherwise start
  // an unattended pass on a credential that does not work, which is the state
  // "starts nothing" was written against. Probes the exact value being handed on.
  if (!works(token, cwd)) {
    release(declaration.lock);
    log(
      "the tracker credential stopped working between the check and the start — " +
        "nothing started, and no pass was spent finding out",
    );
    process.exitCode = EXIT_CANNOT_RUN;
    return;
  }

  const startedAt = new Date();
  log(`pass starting — deadline ${declaration.deadlineSeconds}s`);
  try {
    // `detached` puts the pass in its own process group, so the deadline can
    // reach the whole pass rather than only the process this wrapper spawned. A
    // stage leaves children — git, gh, npm — and node's timeout signals the
    // direct child alone: those children would outlive the kill, keep acting in
    // the checkout with the credential they inherited, and do it after the lock
    // was released. That is the no-overlap floor broken by the very guard meant
    // to hold it (PR #136's review).
    //
    // The type says otherwise, and the type is what is wrong: node documents
    // `detached` for spawn() and omits it from spawnSync()'s options, while
    // libuv passes it through either way. Measured rather than assumed — a
    // spawnSync child with this flag reports a different process group id than
    // its parent, and without it the same one — and pinned by a test so a node
    // upgrade that stops honoring it fails loudly here rather than silently
    // there. The cast is kept to this one named place.
    //
    // If it ever were ignored, the reap fails closed rather than wrong: the
    // child would share this wrapper's group, no group with the child's pid
    // would exist, and reapGroup's signal-0 probe would find nothing to kill.
    const passOptions: SpawnSyncOptions & { detached: boolean } = {
      cwd,
      stdio: "inherit",
      timeout: declaration.deadlineSeconds * 1000,
      detached: true,
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
    };
    const pass = spawnSync(
      "claude",
      ["-p", "/execute", "--permission-mode", "bypassPermissions"],
      passOptions,
    );

    const endedAt = new Date();

    // Reap the group before anything else, and unconditionally: whatever ended
    // the pass, its children are what would still be running when the lock is
    // released in the `finally` below. Killing the group we created cannot
    // reach this wrapper — it is not in it, because `detached` put the pass in
    // its own. An ESRCH here is the ordinary case and says the group is already
    // gone.
    if (reapGroup(pass.pid)) {
      log("the pass's process group outlived it and was reaped");
    }

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
    // Never "its run record is the account of what it did": this wrapper does
    // not read the tracker, and a pass that stopped on an unreachable input
    // also exits 0 having posted nothing. Claiming the record existed is the
    // blur between *finished* and *gone* that Chapter 6 refuses — and the log
    // line that made exactly that false claim is this comment's receipt (#108).
    log("pass ended, exit 0 — the wrapper reads no tracker and claims no run record");
    process.exitCode = EXIT_OK;
  } finally {
    release(declaration.lock);
    log("lock released");
  }
}

main();
