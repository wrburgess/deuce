import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { parseDeclaration } from "./declaration.ts";
import { checkGateWorkflow } from "./workflow.ts";

// The scenarios the Plan on #126 fixed before any of this was written. Every
// branch is measured against a literal document, so none of them needs the
// network, a checkout, or a workflow run.

const WORKFLOW = ".github/workflows/gate.yml";
const DECLARATION = "config/checks.md";

const COMMANDS = ["npm run typecheck", "npm test", "npm run lint:tracker"];

function conforming(overrides: string = ""): string {
  return `name: gate
on:
  pull_request:
  push:
    branches: [main]
permissions:
  contents: read
  issues: read
  pull-requests: read
jobs:
  gate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@abc
      - run: bash bin/setup
      - run: npm run gate
${overrides}`;
}

test("the live workflow conforms, read against the live declaration", () => {
  const declared = parseDeclaration(readFileSync(DECLARATION, "utf8")).checks.map((c) => c.command);
  const result = checkGateWorkflow(readFileSync(WORKFLOW, "utf8"), declared);
  assert.equal(result.guard, null, `guard: ${result.guard}`);
  assert.deepEqual(result.violations, []);
  assert.ok(result.runStepsScanned > 0, "the live workflow declares at least one run step");
});

test("a conforming workflow carries no violation", () => {
  const result = checkGateWorkflow(conforming(), COMMANDS);
  assert.equal(result.guard, null);
  assert.deepEqual(result.violations, []);
  assert.equal(result.runStepsScanned, 2);
});

// The property ADR 0015 owns: config/checks.md is the only place a check joins
// the gate. A second list in CI is the drift, and this is where it dies.
test("a step running a declared check directly is rejected, naming the command", () => {
  const result = checkGateWorkflow(conforming("      - run: npm run typecheck\n"), COMMANDS);
  assert.equal(result.violations.length, 1);
  assert.match(result.violations[0]!, /npm run typecheck/);
  assert.match(result.violations[0]!, /ADR 0015/);
});

// A `run:` block is usually several commands. Reading per step rather than per
// line would see the first and miss everything under it.
test("a declared check hidden on the second line of a run block is still seen", () => {
  const workflow = conforming("      - run: |\n          echo building\n          npm test\n");
  const result = checkGateWorkflow(workflow, COMMANDS);
  assert.equal(result.violations.length, 1);
  assert.match(result.violations[0]!, /npm test/);
});

test("a workflow that runs no gate is rejected — it must never read as one that does", () => {
  const workflow = `name: gate
on: [pull_request]
permissions:
  contents: read
jobs:
  gate:
    steps:
      - run: echo nothing to see here
`;
  const result = checkGateWorkflow(workflow, COMMANDS);
  assert.equal(result.guard, null);
  assert.equal(result.violations.length, 1);
  assert.match(result.violations[0]!, /npm run gate/);
});

// ADR 0014's guard, in this module's terms: an input with nothing in it is a
// document that was not read, never a document that passed.
test("a workflow with no jobs is guarded, not passed", () => {
  const result = checkGateWorkflow("name: gate\non: [pull_request]\n", COMMANDS);
  assert.notEqual(result.guard, null);
  assert.match(result.guard!, /no jobs/);
  assert.deepEqual(result.violations, []);
});

test("a workflow whose jobs declare no run step is guarded, not passed", () => {
  const workflow = `name: gate
on: [pull_request]
jobs:
  gate:
    steps:
      - uses: actions/checkout@abc
`;
  const result = checkGateWorkflow(workflow, COMMANDS);
  assert.notEqual(result.guard, null);
  assert.match(result.guard!, /no .run:. step/);
});

test("an empty document is guarded, not passed", () => {
  const result = checkGateWorkflow("", COMMANDS);
  assert.notEqual(result.guard, null);
  assert.deepEqual(result.violations, []);
});

test("malformed YAML is refused by name, never an unhandled throw", () => {
  const result = checkGateWorkflow("name: gate\n  - this: [is\n", COMMANDS);
  assert.notEqual(result.guard, null);
  assert.match(result.guard!, /did not parse as YAML/);
});

// What makes config/credentials.md's entry for the per-run token enforceable
// rather than a sentence about what the workflow is meant to hold.
test("a write grant is rejected, naming the scope", () => {
  const workflow = conforming().replace("contents: read", "contents: write");
  const result = checkGateWorkflow(workflow, COMMANDS);
  assert.equal(result.violations.length, 1);
  assert.match(result.violations[0]!, /contents: write/);
});

test("write-all is rejected", () => {
  const workflow = conforming().replace(
    "permissions:\n  contents: read\n  issues: read\n  pull-requests: read",
    "permissions: write-all",
  );
  const result = checkGateWorkflow(workflow, COMMANDS);
  assert.equal(result.violations.length, 1);
  assert.match(result.violations[0]!, /write-all/);
});

test("read-all is accepted — it grants no write", () => {
  const workflow = conforming().replace(
    "permissions:\n  contents: read\n  issues: read\n  pull-requests: read",
    "permissions: read-all",
  );
  assert.deepEqual(checkGateWorkflow(workflow, COMMANDS).violations, []);
});

test("`none` is accepted alongside `read` — it grants less, not more", () => {
  const workflow = conforming().replace("issues: read", "issues: none");
  assert.deepEqual(checkGateWorkflow(workflow, COMMANDS).violations, []);
});

test("an absent permissions block is rejected — it inherits a default nothing here binds", () => {
  const workflow = conforming().replace(
    "permissions:\n  contents: read\n  issues: read\n  pull-requests: read\n",
    "",
  );
  const result = checkGateWorkflow(workflow, COMMANDS);
  assert.equal(result.violations.length, 1);
  assert.match(result.violations[0]!, /no .permissions:. block/);
});

test("a workflow that stops watching pull requests is rejected", () => {
  const workflow = `name: gate
on:
  push:
    branches: [main]
permissions:
  contents: read
jobs:
  gate:
    steps:
      - run: npm run gate
`;
  const result = checkGateWorkflow(workflow, COMMANDS);
  assert.equal(result.violations.length, 1);
  assert.match(result.violations[0]!, /pull_request/);
});

test("the trigger is found whichever way `on` survives the parse", () => {
  // A 1.1-flavored reader hands back the boolean key. Both spellings resolve.
  const asBoolean = `name: gate
true:
  pull_request:
permissions:
  contents: read
jobs:
  gate:
    steps:
      - run: npm run gate
`;
  assert.deepEqual(checkGateWorkflow(asBoolean, COMMANDS).violations, []);
  assert.deepEqual(checkGateWorkflow(conforming(), COMMANDS).violations, []);
});

test("a list-form trigger is read too", () => {
  const workflow = `name: gate
on: [pull_request, push]
permissions:
  contents: read
jobs:
  gate:
    steps:
      - run: npm run gate
`;
  assert.deepEqual(checkGateWorkflow(workflow, COMMANDS).violations, []);
});

// Stated so that the absence of a violation here is a decision on the record
// rather than a branch nobody considered.
test("running the gate twice is wasteful, not a second definition — no violation", () => {
  const result = checkGateWorkflow(conforming("      - run: npm run gate\n"), COMMANDS);
  assert.deepEqual(result.violations, []);
  assert.equal(result.runStepsScanned, 3);
});

test("every violation is reported, not just the first", () => {
  const workflow = `name: gate
on:
  push:
    branches: [main]
permissions:
  contents: write
jobs:
  gate:
    steps:
      - run: npm run typecheck
`;
  const result = checkGateWorkflow(workflow, COMMANDS);
  assert.equal(result.violations.length, 4, result.violations.join(" | "));
});
