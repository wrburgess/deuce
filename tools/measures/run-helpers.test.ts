// Argument handling and issue selection: both are decisions, and both fail in
// the same expensive way — a confident block computed about the wrong thing.

import { test } from "node:test";
import assert from "node:assert/strict";
import { parseArgs, selectIssue } from "./run-helpers.ts";
import type { MeasuresIssue } from "./snapshot.ts";

const issue = (number: number): MeasuresIssue => ({
  number,
  createdAt: "2026-08-12T05:55:00Z",
});

test("a bare number is the pull request", () => {
  assert.equal(parseArgs(["119"]).pr, 119);
});

test("a #-prefixed number is the same pull request", () => {
  assert.equal(parseArgs(["#119"]).pr, 119);
});

test("no argument at all is refused with the usage, never a default", () => {
  assert.match(parseArgs([]).error!, /no pull request named/);
});

test("--issue takes a number and is carried through", () => {
  const a = parseArgs(["119", "--issue", "117"]);
  assert.equal(a.pr, 119);
  assert.equal(a.issue, 117);
  assert.equal(a.error, null);
});

test("--issue without a number is refused rather than ignored", () => {
  assert.match(parseArgs(["119", "--issue"]).error!, /--issue needs an issue number/);
});

test("--issue with a non-number is refused, not coerced", () => {
  assert.match(parseArgs(["119", "--issue", "later"]).error!, /--issue needs an issue number/);
});

test("--snapshot takes a path and needs no pull request number", () => {
  const a = parseArgs(["--snapshot", "/tmp/pr.json"]);
  assert.equal(a.snapshotPath, "/tmp/pr.json");
  assert.equal(a.error, null);
});

test("--snapshot without a path is refused", () => {
  assert.match(parseArgs(["--snapshot"]).error!, /needs a file path/);
});

test("an unrecognized argument is named rather than skipped", () => {
  assert.match(parseArgs(["119", "--post"]).error!, /unrecognized argument: --post/);
});

// The contractor review's should-fix on PR #125: a repeated argument was
// resolved last-one-wins, so `119 120` measured PR #120 in silence. An
// ambiguous invocation is refused rather than resolved.
test("two pull request numbers are refused, not resolved to the last one", () => {
  assert.match(parseArgs(["119", "120"]).error!, /named twice|more than one pull request/i);
});

test("--issue given twice is refused", () => {
  assert.match(parseArgs(["119", "--issue", "1", "--issue", "2"]).error!, /--issue/);
});

test("--snapshot given twice is refused", () => {
  assert.match(parseArgs(["--snapshot", "a.json", "--snapshot", "b.json"]).error!, /--snapshot/);
});

test("one linked issue is the one measured from", () => {
  const chosen = selectIssue([issue(117)], null, 119);
  assert.equal(chosen.issue!.number, 117);
  assert.equal(chosen.error, null);
});

test("no linked issue is refused by name — never measured from a guess", () => {
  const chosen = selectIssue([], null, 102);
  assert.equal(chosen.issue, null);
  assert.match(chosen.error!, /links no issue/);
  assert.match(chosen.error!, /--issue/);
});

test("several linked issues are refused, and all of them named", () => {
  const chosen = selectIssue([issue(1), issue(2)], null, 50);
  assert.equal(chosen.issue, null);
  assert.match(chosen.error!, /#1, #2/);
});

test("--issue picks among several", () => {
  const chosen = selectIssue([issue(1), issue(2)], 2, 50);
  assert.equal(chosen.issue!.number, 2);
});

test("--issue naming an issue the pull request does not link is refused", () => {
  const chosen = selectIssue([issue(1)], 999, 50);
  assert.equal(chosen.issue, null);
  assert.match(chosen.error!, /does not link issue #999/);
});

test("--issue on a pull request that links nothing says so, rather than accepting it", () => {
  const chosen = selectIssue([], 42, 102);
  assert.equal(chosen.issue, null);
  assert.match(chosen.error!, /its links are none/);
});
