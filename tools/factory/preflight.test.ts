import { test } from "node:test";
import assert from "node:assert/strict";
import { spawn, spawnSync } from "node:child_process";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { claim, reapGroup, release, takenAt } from "./lock.ts";
import { deathNotice, decide, describeAge, parseRemote, type Observation } from "./preflight.ts";

const NOW = new Date("2026-08-13T07:47:00Z");

const clear: Observation = {
  killSwitchPresent: false,
  lockTakenAt: null,
  checkoutClean: true,
  branch: "main",
  token: "usable",
};

test("a clear observation starts a pass", () => {
  assert.equal(decide(clear, NOW).kind, "start");
});

test("the kill switch outranks every other state", () => {
  const worst: Observation = {
    killSwitchPresent: true,
    lockTakenAt: new Date("2026-08-13T07:00:00Z"),
    checkoutClean: false,
    branch: "task/108",
    token: "absent",
  };
  const verdict = decide(worst, NOW);
  assert.equal(verdict.kind, "killed");
  assert.match(verdict.message, /re-arm/i);
});

test("a held lock is busy, never a failure, and carries the lock's age", () => {
  const verdict = decide({ ...clear, lockTakenAt: new Date("2026-08-13T05:47:00Z") }, NOW);
  assert.equal(verdict.kind, "busy");
  assert.match(verdict.message, /2\.0 hours old/);
  assert.match(verdict.message, /by hand/);
});

test("a checkout that could not be read and a dirty one are different refusals", () => {
  const unreadable = decide({ ...clear, checkoutClean: null, branch: null }, NOW);
  assert.equal(unreadable.kind, "refused");
  assert.match(unreadable.message, /could not be read/);

  const dirty = decide({ ...clear, checkoutClean: false, branch: "task/108" }, NOW);
  assert.equal(dirty.kind, "refused");
  assert.match(dirty.message, /uncommitted changes \(on task\/108\)/);
});

test("a branch that is not main is not a condition — proving runs run from the branch", () => {
  assert.equal(decide({ ...clear, branch: "task/108-arm-the-factory" }, NOW).kind, "start");
});

test("an unreadable credential refuses rather than falling back to the ambient login", () => {
  const verdict = decide({ ...clear, token: "absent" }, NOW);
  assert.equal(verdict.kind, "refused");
  assert.match(verdict.message, /never falls back/);
});

// The first proving run on #108 spent a whole pass to discover at the queue
// read that the keychain held a placeholder. Presence and usability are
// different facts, and each gets its own refusal.
test("a credential that is present but does not work is its own refusal", () => {
  const verdict = decide({ ...clear, token: "unusable" }, NOW);
  assert.equal(verdict.kind, "refused");
  assert.match(verdict.message, /read but did not work/);
  assert.match(verdict.message, /no pass was spent/);
  assert.notEqual(
    verdict.message,
    decide({ ...clear, token: "absent" }, NOW).message,
    "absent and unusable must not share a message — they have different fixes",
  );
});

test("an unusable credential names the tracker's reachability too, never only the token", () => {
  // One failed call cannot tell a rejected token from an unreachable tracker,
  // so the message must not send the reader to the wrong one.
  const verdict = decide({ ...clear, token: "unusable" }, NOW);
  assert.match(verdict.message, /rejected it, or the tracker is unreachable/);
});

test("the lock's age reads in minutes, in hours, and backwards", () => {
  assert.match(describeAge(new Date("2026-08-13T07:32:00Z"), NOW), /15 minutes old/);
  assert.match(describeAge(new Date("2026-08-13T04:17:00Z"), NOW), /3\.5 hours old/);
  assert.match(describeAge(new Date("2026-08-13T08:47:00Z"), NOW), /clock moved/);
});

test("the lock is atomic — a second claim on the same path fails", () => {
  const dir = mkdtempSync(join(tmpdir(), "deuce-lock-"));
  const path = join(dir, "lock");
  try {
    assert.equal(claim(path), true);
    assert.equal(claim(path), false, "a second pass must not get the lock");
    assert.notEqual(takenAt(path), null);
    release(path);
    assert.equal(takenAt(path), null);
    assert.equal(claim(path), true, "the released lock is claimable again");
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test("a lock nobody released is reported with its age, never stolen", () => {
  const dir = mkdtempSync(join(tmpdir(), "deuce-lock-"));
  const path = join(dir, "lock");
  try {
    claim(path);
    const taken = takenAt(path)!;
    const verdict = decide({ ...clear, lockTakenAt: taken }, new Date(taken.getTime() + 86_400_000));
    assert.equal(verdict.kind, "busy");
    assert.match(verdict.message, /24\.0 hours old/);
    assert.notEqual(takenAt(path), null, "deciding must not remove the lock");
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

// The defect this pins, from PR #136's review: node's spawn timeout signals the
// direct child only, so a stage's own children outlive the kill and keep running
// after the lock is released — two passes acting at once, through the guard
// meant to prevent it. Tested against real processes because the claim is about
// what the operating system does, not about what the code says it does.
test("a grandchild of the pass does not outlive the reap", async () => {
  const alive = (pid: number): boolean => {
    try {
      process.kill(pid, 0);
      return true;
    } catch {
      return false;
    }
  };

  // A shell that spawns a long sleep and then waits: the sleep is the
  // grandchild, and killing the shell alone would leave it running.
  const child = spawn("/bin/sh", ["-c", "sleep 300 & echo $!; wait"], {
    detached: true,
    stdio: ["ignore", "pipe", "ignore"],
  });
  const grandchild = await new Promise<number>((done) => {
    child.stdout.on("data", (chunk: Buffer) => done(Number(chunk.toString().trim())));
  });

  try {
    assert.equal(alive(grandchild), true, "the grandchild should be running before the reap");

    // Kill only the direct child, the way a bare timeout would.
    child.kill("SIGKILL");
    await new Promise((done) => child.on("exit", done));
    assert.equal(
      alive(grandchild),
      true,
      "killing the direct child must leave the grandchild — if this fails the test proves nothing",
    );

    assert.equal(reapGroup(child.pid), true, "the group was not empty, so the reap should say so");
    // The signal is delivered asynchronously; poll briefly rather than assume.
    for (let i = 0; i < 100 && alive(grandchild); i++) {
      await new Promise((done) => setTimeout(done, 10));
    }
    assert.equal(alive(grandchild), false, "the grandchild must not outlive the reap");
  } finally {
    spawnSync("kill", ["-9", String(grandchild)], { stdio: "ignore" });
  }
});

// The reap above is only reachable because spawnSync honors `detached` and puts
// the pass in its own process group. Node documents that flag for spawn() and
// omits it from spawnSync()'s types, so this is undocumented behavior the
// wrapper depends on — pinned here, on the exact call shape run.ts uses, so a
// node upgrade that stops honoring it fails in the gate rather than at 07:47 on
// a morning nobody is watching.
test("spawnSync honors detached — the pass leads its own process group", () => {
  const pgidOf = (pid: number): string =>
    spawnSync("ps", ["-o", "pgid=", "-p", String(pid)], { encoding: "utf8" }).stdout.trim();

  const mine = pgidOf(process.pid);
  const options = { encoding: "utf8" as const, detached: true };
  const detachedChild = spawnSync("/bin/sh", ["-c", "ps -o pgid= -p $$"], options).stdout.trim();
  const plainChild = spawnSync("/bin/sh", ["-c", "ps -o pgid= -p $$"], {
    encoding: "utf8",
  }).stdout.trim();

  assert.equal(plainChild, mine, "without the flag a child shares this group — the control case");
  assert.notEqual(
    detachedChild,
    mine,
    "with the flag the child must lead its own group, or reapGroup has nothing it can safely kill",
  );
});

test("reaping refuses the pids that would signal everything the user owns", () => {
  // -0 signals this process's own group; -1 signals every process the user owns.
  // Neither may ever be reachable from a pid this function was handed.
  assert.equal(reapGroup(0), false);
  assert.equal(reapGroup(1), false);
  assert.equal(reapGroup(-1), false);
  assert.equal(reapGroup(undefined), false);
  assert.equal(reapGroup(1.5), false);
});

test("reaping a group that is already gone reports nothing to reap", () => {
  const done = spawnSync("/bin/sh", ["-c", "exit 0"]);
  assert.equal(done.status, 0);
  // A pid that has exited and been reaped: no group, so nothing to kill.
  assert.equal(reapGroup(999_999), false);
});

test("the credential probe targets the repository, parsed from either remote form", () => {
  assert.equal(parseRemote("git@github.com:wrburgess/deuce.git\n"), "wrburgess/deuce");
  assert.equal(parseRemote("https://github.com/wrburgess/deuce.git"), "wrburgess/deuce");
  assert.equal(parseRemote("https://github.com/wrburgess/deuce"), "wrburgess/deuce");
});

test("an unparseable remote yields no target rather than a wrong one", () => {
  // The caller falls back to an account probe; a half-parsed target would
  // probe some other repository and call the answer this one's.
  assert.equal(parseRemote("/some/local/path"), null);
  assert.equal(parseRemote("git@github.com:deuce"), null);
  assert.equal(parseRemote(""), null);
});

test("the death notice names how the pass ended and never claims no record exists", () => {
  const body = deathNotice({
    label: "com.wrburgess.deuce.factory",
    startedAt: new Date("2026-08-13T07:47:00Z"),
    endedAt: new Date("2026-08-13T09:47:00Z"),
    reason: "deadline",
    detail: "killed with SIGTERM after the declared 7200s",
    logPath: "/Users/test/Library/Logs/deuce-factory.log",
  });
  assert.match(body, /killed by the wrapper's deadline/);
  assert.match(body, /com\.wrburgess\.deuce\.factory/);
  assert.match(body, /2026-08-13T07:47:00\.000Z/);
  assert.match(body, /deuce-factory\.log/);
  assert.match(body, /If no run record from this pass appears above/);
});

test("an abnormal exit is reported as one, not as a deadline", () => {
  const body = deathNotice({
    label: "com.wrburgess.deuce.factory",
    startedAt: new Date("2026-08-13T07:47:00Z"),
    endedAt: new Date("2026-08-13T07:49:00Z"),
    reason: "exit",
    detail: "exited 1",
    logPath: "/Users/test/Library/Logs/deuce-factory.log",
  });
  assert.match(body, /ended abnormally/);
  assert.doesNotMatch(body, /deadline/);
  assert.match(body, /exited 1/);
});
