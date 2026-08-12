import { test } from "node:test";
import assert from "node:assert/strict";
import { checkReferences, scannableText } from "./references.ts";
import type { TrackerSnapshot } from "./snapshot.ts";

const REPO = "https://github.com/example/deuce";

const snapshot = (over: Partial<TrackerSnapshot>): TrackerSnapshot => ({
  issues: [
    { number: 5, title: "EPIC: umbrella", body: "", labels: ["type:epic"] },
    { number: 12, title: "TASK: leaf", body: "", labels: ["type:task"] },
  ],
  pullRequests: [{ number: 77, title: "a change", body: "", comments: [] }],
  repoUrl: REPO,
  ...over,
});

const withIssueBody = (body: string): TrackerSnapshot =>
  snapshot({
    issues: [
      { number: 5, title: "EPIC: umbrella", body: "", labels: ["type:epic"] },
      { number: 12, title: "TASK: leaf", body, labels: ["type:task"] },
    ],
  });

test("a bare reference that resolves to a pull request is rejected", () => {
  const result = checkReferences(withIssueBody("Fixed alongside #77 last week."));
  assert.equal(result.bareViolations.length, 1);
  assert.match(result.bareViolations[0]!, /#12 \(body\): bare #77 resolves to a pull request/);
});

test("the PR-prefixed form passes, and a reference to an issue passes bare", () => {
  const result = checkReferences(withIssueBody("See PR #77 and #5 for context."));
  assert.deepEqual(result.bareViolations, []);
});

test("a soft line wrap between PR and the number still reads as one reference", () => {
  const result = checkReferences(withIssueBody("Landed in PR\n#77 yesterday."));
  assert.deepEqual(result.bareViolations, []);
});

test("a reference inside a code span is not a reference", () => {
  const result = checkReferences(withIssueBody("The lint flags `#77` when bare."));
  assert.deepEqual(result.bareViolations, []);
});

test("a link out of this repository is skipped whole — its text may cite another repo's numbers", () => {
  const result = checkReferences(
    withIssueBody("Prior art at [ace #77](https://github.com/example/ace/issues/77)."),
  );
  assert.deepEqual(result.bareViolations, []);
});

test("a link inside this repository is still scanned", () => {
  const result = checkReferences(
    withIssueBody(`Raised in [#77](${REPO}/pull/77).`),
  );
  assert.equal(result.bareViolations.length, 1);
});

test("a closing keyword immediately before an epic reference is rejected", () => {
  const result = checkReferences(withIssueBody("This closes #5 when it merges."));
  assert.equal(result.adjacencyViolations.length, 1);
  assert.match(result.adjacencyViolations[0]!, /closing keyword "closes" immediately before epic #5/);
});

test("the negated form is rejected too — does not close still closes", () => {
  const result = checkReferences(withIssueBody("This does not close #5."));
  assert.equal(result.adjacencyViolations.length, 1);
});

test("every closing keyword variant adjacent to an epic is rejected", () => {
  for (const kw of ["close", "closed", "fix", "fixes", "fixed", "resolve", "resolves", "resolved"]) {
    const result = checkReferences(withIssueBody(`${kw} #5`));
    assert.equal(result.adjacencyViolations.length, 1, kw);
  }
});

test("a closing keyword before a task reference passes — the rule is epic adjacency", () => {
  const result = checkReferences(withIssueBody("Closes #12."));
  assert.deepEqual(result.adjacencyViolations, []);
});

test("pull request bodies and titles are scanned, not only issues", () => {
  const result = checkReferences(
    snapshot({
      pullRequests: [
        { number: 77, title: "mentions #77 itself", body: "and closes #5 in the body", comments: [] },
      ],
    }),
  );
  assert.equal(result.bareViolations.length, 1);
  assert.match(result.bareViolations[0]!, /PR #77 \(title\)/);
  assert.equal(result.adjacencyViolations.length, 1);
  assert.match(result.adjacencyViolations[0]!, /PR #77 \(body\)/);
});

test("text on either side of an exclusion never becomes adjacent", () => {
  // "PR" then a code span then "#77": without the boundary marker the
  // assembled text would read "PR #77" and wrongly pass the bare check.
  const text = scannableText("PR `gate` #77", REPO);
  const result = checkReferences(withIssueBody("PR `gate` #77"));
  assert.match(text, /\x00/);
  assert.equal(result.bareViolations.length, 1);
});
