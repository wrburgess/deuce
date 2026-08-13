// The `--snapshot <file>` seam: a literal pull request, read the way the live
// fetch would hand one over, so every decision downstream is measurable
// without the network (ADR 0014).

import { test } from "node:test";
import assert from "node:assert/strict";
import { parseSnapshot } from "./snapshot.ts";

const whole = JSON.stringify({
  number: 119,
  title: "a change",
  url: "https://github.com/wrburgess/deuce/pull/119",
  comments: [{ body: "## Verification", url: "u1", createdAt: "2026-08-12T15:02:00Z" }],
  closes: [{ number: 117, createdAt: "2026-08-12T05:55:00Z" }],
});

test("a whole snapshot parses into the shape the pure modules read", () => {
  const s = parseSnapshot(whole);
  assert.equal(s.number, 119);
  assert.equal(s.comments[0]!.body, "## Verification");
  assert.equal(s.closes[0]!.number, 117);
});

test("a snapshot carrying no closes parses — closing nothing is a real state", () => {
  const s = parseSnapshot(JSON.stringify({ ...JSON.parse(whole), closes: [] }));
  assert.deepEqual(s.closes, []);
});

test("text that is not JSON is refused, named", () => {
  assert.throws(() => parseSnapshot("not json"), /not JSON/);
});

test("a list where the object should be is refused", () => {
  assert.throws(() => parseSnapshot("[]"), /not an object/);
});

test("a missing comments list is refused rather than read as an empty thread", () => {
  const { comments, ...rest } = JSON.parse(whole);
  void comments;
  assert.throws(() => parseSnapshot(JSON.stringify(rest)), /'comments' is not a list/);
});

test("a comment missing its stamp is refused — throughput would silently lose it", () => {
  const broken = JSON.parse(whole);
  delete broken.comments[0].createdAt;
  assert.throws(() => parseSnapshot(JSON.stringify(broken)), /comment 1's 'createdAt'/);
});

test("a closed issue with a non-numeric number is refused, not coerced", () => {
  const broken = JSON.parse(whole);
  broken.closes[0].number = "117";
  assert.throws(() => parseSnapshot(JSON.stringify(broken)), /closed issue 1's 'number'/);
});
