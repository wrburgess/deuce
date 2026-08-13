// The computed half of Quality, over a whole pull request thread (#57).
// Every case is one where a wrong count would put a wrong number in the
// baseline Chapter 0 says to define at birth or lose forever.

import { test } from "node:test";
import assert from "node:assert/strict";
import { computeQuality } from "./quality.ts";
import type { MeasuresComment } from "./snapshot.ts";

let n = 0;
const comment = (body: string, url?: string): MeasuresComment => ({
  body,
  url: url ?? `https://github.com/wrburgess/deuce/pull/1#issuecomment-${++n}`,
  createdAt: "2026-08-13T10:00:00Z",
});

const finding = (lens: string, severity: string): string =>
  [
    `- **Lens:** ${lens}`,
    "- **Type:** defect",
    `- **Severity:** ${severity}`,
    "- **Location:** tools/x.ts:1",
    "- **Defect:** it fails open",
    "",
  ].join("\n");

const record = (header: string, ...blocks: string[]): string =>
  [header, "", ...blocks, "**Commit reviewed:** `abc123`", "**Signed:** Codex CLI, GPT-5", ""].join("\n");

const CONFORMING = "## Contractor review — Codex CLI (first response)";

test("one standing record: findings and must-fix counted, the record counted", () => {
  const q = computeQuality([
    comment("## Verification\n\nsome prose with **Severity:** must-fix written in it\n"),
    comment(record(CONFORMING, finding("a fail-open guard?", "must-fix"), finding("coverage?", "note"))),
  ]);
  assert.equal(q.raised, 2);
  assert.equal(q.mustFix, 1);
  assert.equal(q.recordsCounted, 1);
});

test("a thread with no contractor record reports none — never a measured zero", () => {
  const q = computeQuality([comment("## Verification\n\nno record here\n")]);
  assert.equal(q.recordsCounted, 0);
  assert.equal(q.raised, 0);
  assert.equal(q.hasRecord, false);
});

test("the empty thread is the same absent state, not a green zero", () => {
  const q = computeQuality([]);
  assert.equal(q.hasRecord, false);
  assert.equal(q.recordsCounted, 0);
});

test("two records — two waves — are summed once each", () => {
  const q = computeQuality([
    comment(record(CONFORMING, finding("a?", "must-fix"))),
    comment(record("## Contractor review — Codex CLI (second wave)", finding("b?", "should-fix"), finding("c?", "must-fix"))),
  ]);
  assert.equal(q.recordsCounted, 2);
  assert.equal(q.raised, 3);
  assert.equal(q.mustFix, 2);
});

test("an outcome-headed post is skipped by name, never counted", () => {
  const q = computeQuality([
    comment(record("## Contractor review — Codex CLI (first response): nonconforming", finding("a?", "must-fix"))),
    comment(record(CONFORMING, finding("b?", "note"))),
  ]);
  assert.equal(q.recordsCounted, 1);
  assert.equal(q.outcomeSkipped, 1);
  assert.equal(q.raised, 1);
  assert.equal(q.mustFix, 0);
});

test("a superseded record is skipped, and its findings with it", () => {
  const url = "https://github.com/wrburgess/deuce/pull/1#issuecomment-superseded";
  const q = computeQuality([
    comment(record(CONFORMING, finding("a?", "must-fix"), finding("b?", "must-fix")), url),
    comment(`${record("## Contractor review — Codex CLI (first response, corrected)", finding("a?", "must-fix"))}\n**Supersedes:** ${url}\n`),
  ]);
  assert.equal(q.recordsCounted, 1);
  assert.equal(q.supersededSkipped, 1);
  assert.equal(q.raised, 1);
  assert.equal(q.mustFix, 1);
});

test("a record answering every lens with no findings counts zero but is still a record", () => {
  const q = computeQuality([comment(record(CONFORMING, "- **Lens:** the permanent lens — no findings\n"))]);
  assert.equal(q.hasRecord, true);
  assert.equal(q.recordsCounted, 1);
  assert.equal(q.raised, 0);
  assert.equal(q.mustFix, 0);
});

test("a severity outside the vocabulary is carried out by name, not swallowed", () => {
  const q = computeQuality([comment(record(CONFORMING, finding("a?", "blocker")))]);
  assert.equal(q.raised, 1);
  assert.deepEqual(q.unknownSeverity, ["blocker"]);
});
