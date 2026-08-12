import { test } from "node:test";
import assert from "node:assert/strict";
import { checkClasses } from "./classes.ts";

const index = (entries: string) =>
  `# The class index\n\nPreamble prose, allowed.\n\n## Entries\n\nThe admission rule, also allowed.\n\n${entries}`;

const goodEntry = `### A defect shape

2 instances, across 2 pull requests — PR #10, PR #20.

- **PR #10, finding 1** — what occurred.
- **PR #20, finding 3** — what occurred, with a delta.
`;

test("a conforming entry passes, preamble prose untouched", () => {
  const result = checkClasses(index(goodEntry));
  assert.deepEqual(result.violations, []);
  assert.equal(result.guard, null);
  assert.equal(result.entries, 1);
});

test("singular forms are accepted — 1 instance, across 1 pull request", () => {
  const entry = `### A young class

1 instance, across 1 pull request — PR #10.

- **PR #10, finding 1** — what occurred.
`;
  assert.deepEqual(checkClasses(index(entry)).violations, []);
});

test("an instance count off by one is rejected, naming both numbers", () => {
  const off = goodEntry.replace("2 instances", "3 instances");
  const violations = checkClasses(index(off)).violations;
  assert.equal(violations.length, 1);
  assert.match(violations[0]!, /says 3 instances; 2 instance lines/);
});

test("a pull-request count that does not match the instance span is rejected", () => {
  const off = goodEntry.replace("across 2 pull requests", "across 3 pull requests");
  const violations = checkClasses(index(off)).violations;
  assert.ok(violations.some((v) => /says 3 pull requests; the instance lines span 2/.test(v)));
});

test("an enumerated pull request no instance line names is rejected, and vice versa", () => {
  const off = goodEntry.replace("PR #10, PR #20.", "PR #10, PR #30.");
  const violations = checkClasses(index(off)).violations;
  assert.ok(violations.some((v) => /instance lines name PR #20, which the count line does not enumerate/.test(v)));
  assert.ok(violations.some((v) => /enumerates PR #30, which no instance line names/.test(v)));
});

test("a count line that does not follow the grammar is rejected", () => {
  const entry = `### A defect shape

Two instances across two pull requests.

- **PR #10, finding 1** — what occurred.
`;
  const violations = checkClasses(index(entry)).violations;
  assert.equal(violations.length, 1);
  assert.match(violations[0]!, /count line does not follow/);
});

test("an entry with no count line at all is rejected by position", () => {
  const entry = `### A defect shape

- **PR #10, finding 1** — what occurred.
`;
  const violations = checkClasses(index(entry)).violations;
  assert.equal(violations.length, 1);
  assert.match(violations[0]!, /first block is not the count line/);
});

test("a paragraph after the instance list is prose with nowhere to be", () => {
  const entry = goodEntry + "\nA stray closing thought.\n";
  const violations = checkClasses(index(entry)).violations;
  assert.equal(violations.length, 1);
  assert.match(violations[0]!, /nowhere to be/);
});

test("an instance line without a bold lead is rejected by position", () => {
  const entry = `### A defect shape

1 instance, across 1 pull request — PR #10.

- PR #10, finding 1 — no bold lead.
`;
  const violations = checkClasses(index(entry)).violations;
  assert.ok(violations.some((v) => /instance 1 does not open with a bold lead/.test(v)));
});

test("an instance lead that names no finding is rejected — a pull request alone is not an instance", () => {
  const entry = `### A defect shape

1 instance, across 1 pull request — PR #10.

- **PR #10, prose** — a lead with no finding named.
`;
  const violations = checkClasses(index(entry)).violations;
  assert.ok(violations.some((v) => /does not name a finding/.test(v)));
});

test("both finding shapes the index uses are accepted — numbered, and descriptor-led", () => {
  const entry = `### A defect shape

2 instances, across 2 pull requests — PR #10, PR #98.

- **PR #10, finding 4** — the numbered shape.
- **PR #98, posture-pass finding** — the descriptor shape.
`;
  assert.deepEqual(checkClasses(index(entry)).violations, []);
});

test("an instance lead naming two pull requests is rejected — reference plus delta keeps counting cheap", () => {
  const entry = `### A defect shape

1 instance, across 1 pull request — PR #10.

- **PR #10, finding 1 and PR #11, finding 2** — a double claim.
`;
  const violations = checkClasses(index(entry)).violations;
  assert.ok(violations.some((v) => /does not name exactly one pull request/.test(v)));
});

test("zero entries under '## Entries' is the fail-open guard, never a green", () => {
  const result = checkClasses(index(""));
  assert.notEqual(result.guard, null);
  assert.match(result.guard!, /zero entries/);
});

test("a file with no '## Entries' section cannot green", () => {
  const result = checkClasses("# Some other file\n\nProse.\n");
  assert.notEqual(result.guard, null);
  assert.match(result.guard!, /'## Entries'/);
});
