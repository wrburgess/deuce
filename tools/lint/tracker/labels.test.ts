import { test } from "node:test";
import assert from "node:assert/strict";
import { checkLabels } from "./labels.ts";
import type { TrackerIssue } from "./snapshot.ts";

const LABELS_YML = `
axes:
  type:
    - {name: "type:task", color: "0E8A16", description: "One unit of work"}
    - {name: "type:epic", color: "5319E7", description: "Umbrella"}
  status:
    - {name: "status:ready", color: "C2E0C6", description: "May be picked up"}
    - {name: "status:review", color: "BFDADC", description: "In review"}
  area:
    - {name: "area:tooling", color: "76428A", description: "Ch 3"}
`;

const issue = (number: number, labels: string[]): TrackerIssue => ({
  number,
  title: `TASK: something`,
  body: "",
  labels,
});

test("a conforming issue passes", () => {
  const result = checkLabels(LABELS_YML, [
    issue(1, ["type:task", "status:ready", "area:tooling"]),
  ]);
  assert.deepEqual(result.violations, []);
  assert.equal(result.guard, null);
  assert.equal(result.issuesChecked, 1);
});

test("a missing status label is rejected, the axis named", () => {
  const violations = checkLabels(LABELS_YML, [issue(7, ["type:task", "area:tooling"])]).violations;
  assert.equal(violations.length, 1);
  assert.match(violations[0]!, /#7: no `status:` label/);
});

test("a doubled status label is rejected, both values named", () => {
  const violations = checkLabels(LABELS_YML, [
    issue(8, ["type:task", "status:ready", "status:review", "area:tooling"]),
  ]).violations;
  assert.equal(violations.length, 1);
  assert.match(violations[0]!, /#8: 2 `status:` labels \(status:ready, status:review\)/);
});

test("an undeclared axis value is rejected", () => {
  const violations = checkLabels(LABELS_YML, [
    issue(9, ["type:task", "status:someday", "area:tooling"]),
  ]).violations;
  assert.equal(violations.length, 1);
  assert.match(violations[0]!, /`status:someday` is not a value labels.yml declares/);
});

test("an issue with no labels at all carries three violations, one per axis", () => {
  const violations = checkLabels(LABELS_YML, [issue(10, [])]).violations;
  assert.equal(violations.length, 3);
});

test("a label outside every axis is not this check's business", () => {
  const result = checkLabels(LABELS_YML, [
    issue(11, ["type:task", "status:ready", "area:tooling", "good first issue"]),
  ]);
  assert.deepEqual(result.violations, []);
});

test("malformed YAML is a guard, never an empty axis set that passes everything", () => {
  const result = checkLabels("axes: [unclosed", [issue(1, [])]);
  assert.notEqual(result.guard, null);
  assert.deepEqual(result.violations, []);
});

test("a declaration with no axes section is a guard", () => {
  const result = checkLabels("other: thing\n", [issue(1, [])]);
  assert.match(result.guard!, /no axes section/);
});

test("an axis declaring no values is a guard", () => {
  const result = checkLabels("axes:\n  type: []\n", [issue(1, [])]);
  assert.match(result.guard!, /axis "type" declares no values/);
});
