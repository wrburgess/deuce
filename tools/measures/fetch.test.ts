// The edge's own decidable half: shaping a fetched pull request, and the guard
// that refuses to compute over links the fetch cannot see. The network half is
// exercised by the live demonstration recorded on the pull request.

import { test } from "node:test";
import assert from "node:assert/strict";
import { shapePullRequest, type PullRequestNode } from "./fetch.ts";

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

test("a pull request that closes no issue shapes without inventing one", () => {
  const s = shapePullRequest(
    node({ closingIssuesReferences: { pageInfo: { hasNextPage: false }, nodes: [] } }),
  );
  assert.deepEqual(s.closes, []);
});
