import { test } from "node:test";
import assert from "node:assert/strict";
import { chmodSync, mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { formatUnpostedRecord, postComment, PostFailure } from "./record.ts";

// The poster is driven with real but harmless commands, per dispatch.test.ts:
// `true` stands in for a post that succeeded, `false` for one that did not.

test("a post that succeeds does not throw", () => {
  assert.doesNotThrow(() => postComment(1, "a body", "a label", ["true"]));
});

test("a post that fails throws PostFailure, never an untyped crash", () => {
  assert.throws(
    () => postComment(7, "a body", "the summons", ["false"]),
    (err: unknown) => err instanceof PostFailure,
  );
});

test("the un-posted body survives on the failure, whole and unaltered", () => {
  // Multi-line, because every real record is: losing the tail would be as bad
  // as losing all of it, and a single-line body would not catch that.
  const body = "## Contractor review — unreachable\n\n- **Outcome:** unreachable now.\n\nthe last line";
  try {
    postComment(7, body, "the readiness-failure record", ["false"]);
    assert.fail("the post should have failed");
  } catch (err) {
    assert.ok(err instanceof PostFailure);
    assert.equal(err.body, body);
    assert.equal(err.prNumber, 7);
    assert.equal(err.label, "the readiness-failure record");
  }
});

test("the failure carries a detail saying why the post failed", () => {
  try {
    postComment(7, "a body", "a label", ["false"]);
    assert.fail("the post should have failed");
  } catch (err) {
    assert.ok(err instanceof PostFailure);
    assert.ok(err.detail.length > 0, "a failure with no detail cannot be acted on");
  }
});

test("a poster binary that does not exist is a post failure, not a different crash", () => {
  // The spawn itself fails here rather than the command exiting non-zero — a
  // distinct path, and the one an uninstalled or renamed `gh` takes.
  assert.throws(
    () => postComment(7, "a body", "a label", ["deuce-no-such-binary-exists"]),
    (err: unknown) => err instanceof PostFailure && err.detail.length > 0,
  );
});

test("a failure while staging the post is a post failure too, not a raw crash", () => {
  // Staging is part of posting: if the temp directory cannot be made, or the
  // body cannot be written, the record is lost exactly as surely as when `gh`
  // rejects it. Forced without a mock by pointing the temp directory somewhere
  // that does not exist — `tmpdir()` reads TMPDIR at call time.
  // Raised as must-fix by the contractor review of 3d466c3 on PR #46.
  const saved = process.env.TMPDIR;
  process.env.TMPDIR = "/deuce-no-such-temp-dir-exists";
  try {
    assert.throws(
      () => postComment(7, "a body", "the summons", ["true"]),
      (err: unknown) =>
        err instanceof PostFailure && err.body === "a body" && err.detail.length > 0,
    );
  } finally {
    if (saved === undefined) delete process.env.TMPDIR;
    else process.env.TMPDIR = saved;
  }
});

test("a cleanup failure cannot replace the PostFailure it would mask", () => {
  // An exception thrown from `finally` supersedes the one in flight, so a failing
  // `rmSync` would swallow the PostFailure and lose the record — the defect this
  // file exists to prevent, arriving through the cleanup path.
  //
  // Forced without a mock: the poster itself makes the temp parent read-only as
  // a side effect and then exits non-zero. The post fails, and the cleanup that
  // follows cannot remove its directory.
  // Raised as must-fix by the contractor review of e595042 on PR #46.
  const parent = mkdtempSync(join(tmpdir(), "deuce-cleanup-test-"));
  const saved = process.env.TMPDIR;
  process.env.TMPDIR = parent;
  try {
    assert.throws(
      () =>
        postComment(7, "a body", "the summons", [
          "sh",
          "-c",
          `chmod 500 '${parent}'; exit 1`,
        ]),
      (err: unknown) => err instanceof PostFailure && err.body === "a body",
    );
  } finally {
    if (saved === undefined) delete process.env.TMPDIR;
    else process.env.TMPDIR = saved;
    chmodSync(parent, 0o700);
    rmSync(parent, { recursive: true, force: true });
  }
});

test("the formatted report carries the label, the number, and the whole body", () => {
  const body = "line one\nline two\nline three";
  const report = formatUnpostedRecord(
    new PostFailure(42, "the conforming review", body, "gh exited 1"),
  );
  assert.match(report, /42/);
  assert.match(report, /the conforming review/);
  assert.match(report, /gh exited 1/);
  for (const line of body.split("\n")) {
    assert.ok(report.includes(line), `the report dropped a body line: ${line}`);
  }
});
