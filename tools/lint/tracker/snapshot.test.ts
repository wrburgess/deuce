import { test } from "node:test";
import assert from "node:assert/strict";
import { parseSnapshot } from "./snapshot.ts";

const good = JSON.stringify({
  issues: [{ number: 1, title: "TASK: t", body: "", labels: ["type:task"] }],
  pullRequests: [{ number: 2, title: "p", body: "", comments: [{ body: "c", url: "u" }] }],
  repoUrl: "https://github.com/example/deuce",
});

test("a well-formed snapshot parses", () => {
  const snap = parseSnapshot(good);
  assert.equal(snap.issues.length, 1);
  assert.equal(snap.pullRequests.length, 1);
});

test("non-JSON input throws with the reason named", () => {
  assert.throws(() => parseSnapshot("not json"), /not JSON/);
});

test("a snapshot missing its arrays or repoUrl throws", () => {
  assert.throws(() => parseSnapshot("{}"), /no issues\/pullRequests arrays/);
  assert.throws(
    () => parseSnapshot(JSON.stringify({ issues: [], pullRequests: [] })),
    /no repoUrl/,
  );
});

test("a malformed issue or comment throws rather than passing as vacuously conforming", () => {
  assert.throws(
    () =>
      parseSnapshot(
        JSON.stringify({
          issues: [{ number: "1", title: "t", body: "", labels: [] }],
          pullRequests: [],
          repoUrl: "u",
        }),
      ),
    /an issue in the snapshot is missing/,
  );
  assert.throws(
    () =>
      parseSnapshot(
        JSON.stringify({
          issues: [],
          pullRequests: [{ number: 2, title: "p", body: "", comments: [{ body: "c" }] }],
          repoUrl: "u",
        }),
      ),
    /a comment on PR #2 is missing/,
  );
});
