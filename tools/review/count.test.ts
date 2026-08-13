// Counting what a findings record carries (#57). The count is the computed
// half of the Quality health measure, so every case here is a case where a
// wrong count would put a wrong number in the baseline.

import { test } from "node:test";
import assert from "node:assert/strict";
import { countFindings } from "./validate.ts";

const finding = (lens: string, severity: string): string =>
  [
    `- **Lens:** ${lens}`,
    "- **Type:** defect",
    `- **Severity:** ${severity}`,
    "- **Location:** tools/review/roster.ts:10",
    "- **Defect:** the parser ignores a second roster row silently",
    "",
  ].join("\n");

const record = (...blocks: string[]): string =>
  [
    "## Contractor review — Codex CLI (first response)",
    "",
    "- **Validation on return: conforming.**",
    "",
    ...blocks,
    "**Commit reviewed:** `abc123`",
    "**Signed:** Codex CLI, GPT-5",
    "",
  ].join("\n");

test("findings are counted, and the must-fix ones counted again", () => {
  const c = countFindings(
    record(
      finding("a fail-open guard?", "must-fix"),
      finding("what the invariant does not cover?", "should-fix"),
      finding("the permanent lens", "must-fix"),
    ),
  );
  assert.equal(c.raised, 3);
  assert.equal(c.mustFix, 2);
  assert.deepEqual(c.unknownSeverity, []);
});

test("a record with no findings at all counts zero, not one", () => {
  const c = countFindings(record("- **Lens:** the permanent lens — no findings\n"));
  assert.equal(c.raised, 0);
  assert.equal(c.mustFix, 0);
});

test("an explicit no-findings answer beside real findings is not counted as one", () => {
  const c = countFindings(
    record(
      "- **Lens:** a fail-open guard? — no findings\n",
      finding("what the invariant does not cover?", "must-fix"),
    ),
  );
  assert.equal(c.raised, 1);
  assert.equal(c.mustFix, 1);
});

test("a record carrying no lens blocks at all counts zero", () => {
  assert.deepEqual(countFindings("## Contractor review — Codex CLI (first response)\n\nnothing here\n"), {
    raised: 0,
    mustFix: 0,
    unknownSeverity: [],
  });
});

test("the empty string counts zero rather than throwing", () => {
  assert.equal(countFindings("").raised, 0);
});

test("a severity outside the vocabulary is counted as raised and named, never dropped", () => {
  const c = countFindings(record(finding("a fail-open guard?", "critical")));
  assert.equal(c.raised, 1);
  assert.equal(c.mustFix, 0);
  assert.deepEqual(c.unknownSeverity, ["critical"]);
});

test("a finding with no severity field at all is counted as raised and named", () => {
  const block = [
    "- **Lens:** a fail-open guard?",
    "- **Type:** defect",
    "- **Location:** tools/review/roster.ts:10",
    "- **Defect:** the parser ignores a second roster row silently",
    "",
  ].join("\n");
  const c = countFindings(record(block));
  assert.equal(c.raised, 1);
  assert.equal(c.mustFix, 0);
  assert.equal(c.unknownSeverity.length, 1);
  assert.match(c.unknownSeverity[0]!, /no severity/i);
});

test("severity is read through its markup, not around it", () => {
  const c = countFindings(record(finding("a fail-open guard?", "`must-fix`")));
  assert.equal(c.mustFix, 1);
  assert.deepEqual(c.unknownSeverity, []);
});

test("a second severity field inside one finding does not count the finding twice", () => {
  const block = [
    "- **Lens:** a fail-open guard?",
    "- **Type:** defect",
    "- **Severity:** must-fix",
    "- **Severity:** must-fix",
    "- **Location:** tools/review/roster.ts:10",
    "- **Defect:** the parser ignores a second roster row silently",
    "",
  ].join("\n");
  const c = countFindings(record(block));
  assert.equal(c.raised, 1);
  assert.equal(c.mustFix, 1);
});
