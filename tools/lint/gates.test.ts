import { test } from "node:test";
import assert from "node:assert/strict";
import { checkGates, BLIND_SPOT } from "./gates.ts";
import type { MarkdownFile } from "./markdown.ts";

const files = (entries: Record<string, string>): MarkdownFile[] =>
  Object.entries(entries).map(([path, content]) => ({ path, content }));

// Every fixture set carries one gate name somewhere, so the repo-wide guard
// is exercised only by the test written for it.
const canon = { "sds/00-x.md": "The Ship gate is defined here, `attested` included.\n" };

test("a setting token in a Skill is rejected — the pointer is the fix", () => {
  const set = files({
    ...canon,
    "skills/x/SKILL.md": "The gate runs `required` today.\n",
  });
  const result = checkGates(set);
  assert.equal(result.violations.length, 1);
  assert.match(result.violations[0]!, /skills\/x\/SKILL\.md/);
  assert.match(result.violations[0]!, /`required`/);
});

test("setting tokens in the allowed homes are not scanned", () => {
  const set = files({
    "config/gates.md": "`required` in force.\n",
    "sds/00-x.md": "`attested` defined, at the Ship gate.\n",
    "GLOSSARY.md": "`delegated` — see config/gates.md.\n",
    "adr/0005-x.md": "`attested` recorded.\n",
    "findings/accepted.md": "`attested` held.\n",
    "docs/sds-outline.md": "`required` historical.\n",
  });
  assert.deepEqual(checkGates(set).violations, []);
});

test("the setting word bare in prose is not a token — code spans only", () => {
  const set = files({
    ...canon,
    "skills/x/SKILL.md": "Approval is required before the work is delegated onward.\n",
  });
  assert.deepEqual(checkGates(set).violations, []);
});

test("a setting word inside a fenced block is not an inline token", () => {
  const set = files({
    ...canon,
    "skills/x/SKILL.md": "```\nrequired\nattested\n```\n",
  });
  assert.deepEqual(checkGates(set).violations, []);
});

test("an enforced file naming a gate with no resolving reference is rejected", () => {
  const set = files({
    ...canon,
    "rules/x.md": "Hold at the Direction gate before writing.\n",
  });
  const result = checkGates(set);
  assert.equal(result.violations.length, 1);
  assert.match(result.violations[0]!, /rules\/x\.md/);
  assert.match(result.violations[0]!, /references neither/);
});

test("naming a gate resolves through config/gates.md", () => {
  const set = files({
    ...canon,
    "rules/x.md": "Hold at the Direction gate per `config/gates.md`.\n",
  });
  assert.deepEqual(checkGates(set).violations, []);
});

test("naming a gate resolves through a defining chapter", () => {
  const set = files({
    ...canon,
    "config/capacity.md": "source: the Direction gate on #13; see [Chapter 1](../sds/01-lifecycle-and-skills.md).\n",
  });
  assert.deepEqual(checkGates(set).violations, []);
});

test("zero gate names across every document is the fail-open guard, never a green", () => {
  const set = files({ "skills/x/SKILL.md": "No gates here.\n" });
  const result = checkGates(set);
  assert.notEqual(result.guard, null);
  assert.match(result.guard!, /no document names either gate/);
});

test("the blind spot ships with the result on every run, green or red", () => {
  const green = checkGates(files({ ...canon }));
  const red = checkGates(files({ ...canon, "skills/x/SKILL.md": "`attested`\n" }));
  assert.deepEqual(green.blindSpot, BLIND_SPOT);
  assert.deepEqual(red.blindSpot, BLIND_SPOT);
  assert.equal(BLIND_SPOT.length, 2);
  assert.match(BLIND_SPOT[0]!, /naming neither a gate nor a value/);
  assert.match(BLIND_SPOT[1]!, /not scanned/);
});
