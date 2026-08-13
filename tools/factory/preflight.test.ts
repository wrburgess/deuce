import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { claim, release, takenAt } from "./lock.ts";
import { deathNotice, decide, describeAge, type Observation } from "./preflight.ts";

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
