import { test } from "node:test";
import assert from "node:assert/strict";
import { EXIT_CANNOT_RUN, EXIT_CHECK_FAILED, EXIT_OK, runChecks } from "./gate.ts";
import type { CheckSpec } from "./declaration.ts";

const present = () => true;
const absent = () => false;
const passing = () => 0;

function spy() {
  const calls: string[][] = [];
  return { calls, exec: (argv: string[]) => (calls.push(argv), 0) };
}

const twoChecks: CheckSpec[] = [
  { name: "typecheck", command: "npm run typecheck", requires: "node_modules" },
  { name: "tests", command: "npm test" },
];

test("every check passing is exit 0, with every check reported", () => {
  const r = runChecks(twoChecks, passing, present);
  assert.equal(r.code, EXIT_OK);
  assert.deepEqual(r.outcomes.map((o) => o.name), ["typecheck", "tests"]);
});

test("a failing check is exit 1, and the failing check is named", () => {
  const r = runChecks(twoChecks, (argv) => (argv.includes("test") ? 1 : 0), present);
  assert.equal(r.code, EXIT_CHECK_FAILED);
  assert.deepEqual(r.outcomes.filter((o) => o.code !== 0).map((o) => o.name), ["tests"]);
});

// The #40 lesson: "a check failed" and "the gate never ran" are different
// outcomes, and a caller cannot tell them apart from a bare non-zero.
test("an unmet prerequisite is exit 2, not exit 1 — it is not a failing check", () => {
  const r = runChecks(twoChecks, passing, absent);
  assert.equal(r.code, EXIT_CANNOT_RUN);
  assert.notEqual(r.code, EXIT_CHECK_FAILED);
});

test("an unmet prerequisite names what is missing and how to fix it", () => {
  const r = runChecks(twoChecks, passing, absent);
  assert.ok(r.unmet.some((u) => u.includes("node_modules")), "the missing prerequisite is not named");
  assert.ok(r.unmet.some((u) => u.includes("bin/setup")), "the fix is not named");
});

// The gate reports its own unreadiness; it never repairs the tree it measures.
// Resolved at Devise against this issue's original wording.
//
// Asserted differentially on purpose. "Nothing ran" is an absence, and an
// absence passes against an implementation that never runs anything at all —
// which is precisely how this test passed against its own stub. The control
// arm is what makes the empty arm mean something.
test("an unmet prerequisite runs nothing — while the same checks do run when it is met", () => {
  const blocked = spy();
  runChecks(twoChecks, blocked.exec, absent);
  assert.deepEqual(blocked.calls, [], "the gate executed something despite an unmet prerequisite");

  const ready = spy();
  runChecks(twoChecks, ready.exec, present);
  assert.equal(ready.calls.length, twoChecks.length, "the control arm ran nothing either — the empty arm proves nothing");
});

// Defence in depth: declaration.ts already refuses this, so this asserts the
// runner does not quietly disagree with the parser about the vacuous case.
test("zero checks is exit 2 — a gate that ran nothing never reports green", () => {
  const r = runChecks([], passing, present);
  assert.equal(r.code, EXIT_CANNOT_RUN);
  assert.notEqual(r.code, EXIT_OK);
});

test("a command carrying a shell metacharacter is refused, and nothing runs", () => {
  const s = spy();
  const r = runChecks([{ name: "sneaky", command: "npm test && rm -rf /" }], s.exec, present);
  assert.equal(r.code, EXIT_CANNOT_RUN);
  assert.deepEqual(s.calls, []);
});

// Enforcing one direction while the other leaks is class four in the index.
// Checking only that every declared check ran would miss a runner that also
// ran something nobody declared.
test("declared and executed are the same set, in both directions", () => {
  const s = spy();
  runChecks(twoChecks, s.exec, present);
  const executed = s.calls.map((argv) => argv.join(" ")).sort();
  const declared = twoChecks.map((c) => c.command).sort();
  assert.deepEqual(executed, declared);
});

test("a check is executed as tokens, never through a shell", () => {
  const s = spy();
  runChecks([{ name: "tests", command: "npm test" }], s.exec, present);
  assert.deepEqual(s.calls, [["npm", "test"]]);
});

// Differential for the same reason as above: a stub that consults nothing
// satisfies the negative arm by doing nothing.
test("the prerequisite probe is consulted only for a check that declares one", () => {
  let withoutRequires = false;
  runChecks([{ name: "tests", command: "npm test" }], passing, () => ((withoutRequires = true), true));
  assert.equal(withoutRequires, false, "a check declaring no prerequisite still probed for one");

  let withRequires = false;
  runChecks(
    [{ name: "typecheck", command: "npm run typecheck", requires: "node_modules" }],
    passing,
    () => ((withRequires = true), true),
  );
  assert.equal(withRequires, true, "a check declaring a prerequisite never probed for it");
});
