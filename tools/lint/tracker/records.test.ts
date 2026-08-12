import { test } from "node:test";
import assert from "node:assert/strict";
import { checkRecords } from "./records.ts";
import type { TrackerPullRequest } from "./snapshot.ts";

const conformingRecord = `## Contractor review — Codex CLI (first response)

- **Validation on return: conforming.** Severity vocabulary, findings fields, and commit binding all check.

---

- **Lens:** does this check measure the invariant it claims?
- **Type:** defect
- **Severity:** should-fix
- **Location:** tools/gate/run.ts, line 12
- **Defect:** the probe passes when the toolchain is absent.

- **Commit reviewed:** \`abc123\`
- **Signed:** Codex CLI, GPT-5
`;

const pr = (comments: { body: string; url: string }[]): TrackerPullRequest => ({
  number: 40,
  title: "a change",
  body: "",
  comments,
});

test("a conforming standing record passes", () => {
  const result = checkRecords([pr([{ body: conformingRecord, url: "u1" }])]);
  assert.deepEqual(result.violations, []);
  assert.equal(result.recordsChecked, 1);
});

test("a record missing a field in one block is rejected, the field named, the url carried", () => {
  const broken = conformingRecord.replace("- **Severity:** should-fix\n", "");
  const result = checkRecords([pr([{ body: broken, url: "u2" }])]);
  assert.equal(result.violations.length, 1);
  assert.match(result.violations[0]!, /PR #40 \(u2\): finding 1 .* carries 0 Severity field/);
});

test("an unsigned record and a record with no commit line are rejected", () => {
  const unsigned = conformingRecord.replace(/- \*\*Signed:\*\*.*\n/, "");
  const uncommitted = conformingRecord.replace(/- \*\*Commit reviewed:\*\*.*\n/, "");
  assert.equal(checkRecords([pr([{ body: unsigned, url: "u" }])]).violations.length, 1);
  assert.equal(checkRecords([pr([{ body: uncommitted, url: "u" }])]).violations.length, 1);
});

test("outcome records — nonconforming, unreachable, unresponsive — are skipped by name", () => {
  const result = checkRecords([
    pr([
      { body: "## Contractor review — Codex CLI (first response): nonconforming\n\nmissing fields named here", url: "o1" },
      { body: "## Contractor review — first response: reviewer unreachable\n\n- **Readiness check:** failed", url: "o2" },
      { body: "## Contractor review — first response: reviewer unresponsive\n\n- nothing came back", url: "o3" },
    ]),
  ]);
  assert.deepEqual(result.violations, []);
  assert.equal(result.recordsChecked, 0);
  assert.equal(result.outcomeRecordsSkipped, 3);
});

test("a superseded record is exempt — the fix for a durable record is a later post, never an edit", () => {
  const broken = conformingRecord.replace("- **Severity:** should-fix\n", "");
  const superseding = `${conformingRecord}\n**Supersedes:** u3\n`;
  const result = checkRecords([
    pr([
      { body: broken, url: "u3" },
      { body: superseding, url: "u4" },
    ]),
  ]);
  assert.deepEqual(result.violations, []);
  assert.equal(result.supersededSkipped, 1);
  assert.equal(result.recordsChecked, 1);
});

test("a field outside any finding block is rejected", () => {
  const stray = conformingRecord.replace("---\n", "---\n\n- **Type:** defect\n");
  const result = checkRecords([pr([{ body: stray, url: "u5" }])]);
  assert.equal(result.violations.length, 1);
  assert.match(result.violations[0]!, /a Type field appears outside any finding block/);
});

test("ordinary comments — summonses included — are not records and are not validated", () => {
  const result = checkRecords([
    pr([
      { body: "## Review summons — Codex CLI\n\n- **Lens:** the menu says this shape", url: "c1" },
      { body: "Just a discussion comment mentioning **Type:** casually? No — no header.", url: "c2" },
    ]),
  ]);
  assert.deepEqual(result.violations, []);
  assert.equal(result.recordsChecked, 0);
});

test("a pull request with no comments passes with zero records checked", () => {
  const result = checkRecords([pr([])]);
  assert.deepEqual(result.violations, []);
  assert.equal(result.recordsChecked, 0);
});
