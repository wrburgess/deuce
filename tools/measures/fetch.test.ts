// The edge's own decidable half: shaping a fetched pull request, and the guard
// that refuses to compute over links the fetch cannot see. The network half is
// exercised by the live demonstration recorded on the pull request.

import { test } from "node:test";
import assert from "node:assert/strict";
import { nextCursor, shapePullRequest, type PullRequestNode } from "./fetch.ts";

const node = (over: Partial<PullRequestNode> = {}): PullRequestNode => ({
  number: 119,
  title: "feat(sync): the sync retires what the manifest no longer names",
  url: "https://github.com/wrburgess/deuce/pull/119",
  comments: {
    pageInfo: { hasNextPage: false, endCursor: null },
    nodes: [{ body: "## Verification", url: "u1", createdAt: "2026-08-12T15:02:00Z" }],
  },
  closingIssuesReferences: {
    pageInfo: { hasNextPage: false },
    nodes: [{ number: 117, createdAt: "2026-08-12T05:55:00Z" }],
  },
  ...over,
});

test("a fetched pull request shapes into the snapshot the pure modules read", () => {
  const s = shapePullRequest(node());
  assert.equal(s.number, 119);
  assert.equal(s.comments.length, 1);
  assert.equal(s.comments[0]!.createdAt, "2026-08-12T15:02:00Z");
  assert.deepEqual(s.closes, [{ number: 117, createdAt: "2026-08-12T05:55:00Z" }]);
});

test("closing links overflowing the fetched page are refused loudly", () => {
  assert.throws(
    () =>
      shapePullRequest(
        node({
          closingIssuesReferences: {
            pageInfo: { hasNextPage: true },
            nodes: [{ number: 1, createdAt: "2026-08-01T00:00:00Z" }],
          },
        }),
      ),
    /refusing to compute throughput over links the fetch cannot see/,
  );
});

// The contractor review's must-fix on PR #125: a page claiming another page
// while carrying no cursor ended the walk normally, because null was also the
// loop's termination value — a truncated thread computed as a whole one.
test("a page with another page and no cursor is refused, never read as the end", () => {
  assert.throws(
    () => nextCursor({ hasNextPage: true, endCursor: null }, "PR #119's comments"),
    /claims another page and carries no cursor/,
  );
});

test("a page with another page and no cursor field at all is refused the same way", () => {
  assert.throws(() => nextCursor({ hasNextPage: true }, "PR #119's comments"), /no cursor/);
});

test("a last page ends the walk", () => {
  assert.equal(nextCursor({ hasNextPage: false, endCursor: "abc" }, "x"), null);
});

test("a page with another page and a cursor continues the walk", () => {
  assert.equal(nextCursor({ hasNextPage: true, endCursor: "abc" }, "x"), "abc");
});

test("a pull request that closes no issue shapes without inventing one", () => {
  const s = shapePullRequest(
    node({ closingIssuesReferences: { pageInfo: { hasNextPage: false }, nodes: [] } }),
  );
  assert.deepEqual(s.closes, []);
});
