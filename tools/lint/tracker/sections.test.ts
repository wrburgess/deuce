import { test } from "node:test";
import assert from "node:assert/strict";
import { checkSections } from "./sections.ts";
import type { TrackerIssue } from "./snapshot.ts";

const issue = (number: number, type: string | null, body: string): TrackerIssue => ({
  number,
  title: "whatever",
  body,
  labels: type === null ? ["status:ready"] : [`type:${type}`, "status:ready", "area:tooling"],
});

const SUMMARY = "## Summary (HC)\n\n- What is wrong, plainly.\n";

test("a conforming issue of each type passes", () => {
  const result = checkSections([
    issue(1, "task", `${SUMMARY}\n- **Done when:** the thing exists.\n`),
    issue(2, "bug", `${SUMMARY}\n## Reproduction\n\n- run the command\n`),
    issue(3, "spike", `${SUMMARY}\n## The question\n\nWhich way?\n`),
    issue(
      4,
      "epic",
      `${SUMMARY}\n### Problem\n\nx\n### Target solution\n\nx\n### Goals\n\nx\n### Constraints\n\nx\n### Expectations\n\nx\n### Risks\n\nx\n### Edge cases\n\nx\n### Punted paths\n\nx\n`,
    ),
    issue(5, "chore", SUMMARY),
  ]);
  assert.deepEqual(result.violations, []);
  assert.equal(result.issuesChecked, 5);
});

test("a missing Summary (HC) heading is rejected on every type", () => {
  const violations = checkSections([issue(6, "chore", "just prose")]).violations;
  assert.equal(violations.length, 1);
  assert.match(violations[0]!, /#6: no `Summary \(HC\)` heading/);
});

test("a TASK without done-when is rejected", () => {
  const violations = checkSections([issue(7, "task", SUMMARY)]).violations;
  assert.equal(violations.length, 1);
  assert.match(violations[0]!, /#7: a TASK carries done-when/);
});

test("done-when inside a code span still counts — presence, not placement", () => {
  const violations = checkSections([
    issue(8, "task", `${SUMMARY}\nDone when: it runs.\n`),
  ]).violations;
  assert.deepEqual(violations, []);
});

test("a BUG without a Reproduction heading is rejected", () => {
  const violations = checkSections([
    issue(9, "bug", `${SUMMARY}\nSteps are described in prose but never as a section.\n`),
  ]).violations;
  assert.equal(violations.length, 1);
  assert.match(violations[0]!, /#9: a BUG carries a Reproduction heading/);
});

test("a SPIKE names its question as a heading or bold leader", () => {
  const bold = checkSections([
    issue(10, "spike", `${SUMMARY}\n- **The question:** which parser?\n`),
  ]).violations;
  assert.deepEqual(bold, []);
  const none = checkSections([issue(11, "spike", SUMMARY)]).violations;
  assert.equal(none.length, 1);
  assert.match(none[0]!, /#11: a SPIKE names the question/);
});

test("an epic brief missing fields is rejected and the fields are named", () => {
  const violations = checkSections([
    issue(12, "epic", `${SUMMARY}\n### Problem\n\nx\n### Goals\n\nx\n`),
  ]).violations;
  assert.equal(violations.length, 1);
  assert.match(violations[0]!, /#12: the epic brief is missing 6 of its eight fields/);
  assert.match(violations[0]!, /Target solution, Constraints, Expectations, Risks, Edge cases, Punted paths/);
});

test("an epic brief with all eight fields out of schema order is rejected", () => {
  const body = `${SUMMARY}\n### Target solution\n\nx\n### Problem\n\nx\n### Goals\n\nx\n### Constraints\n\nx\n### Expectations\n\nx\n### Risks\n\nx\n### Edge cases\n\nx\n### Punted paths\n\nx\n`;
  const violations = checkSections([issue(13, "epic", body)]).violations;
  assert.equal(violations.length, 1);
  assert.match(violations[0]!, /#13: the epic brief's eight fields appear out of schema order/);
});

test("an empty body is rejected for the Summary, not crashed on", () => {
  const violations = checkSections([issue(14, "task", "")]).violations;
  assert.equal(violations.length, 2);
});

test("an issue without exactly one type label gets no type-specific check — the labels check names it", () => {
  const result = checkSections([issue(15, null, SUMMARY)]);
  assert.deepEqual(result.violations, []);
});

test("a heading matching a brief field inside a non-epic body is not the brief's business", () => {
  const violations = checkSections([
    issue(16, "task", `${SUMMARY}\n### Risks\n\nsome risks\n- **Done when:** done.\n`),
  ]).violations;
  assert.deepEqual(violations, []);
});
