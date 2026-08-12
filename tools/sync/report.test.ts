import { test } from "node:test";
import assert from "node:assert/strict";
import { composeReport, type ReportInput } from "./report.ts";
import type { MaterializedFile } from "./payload.ts";

function file(path: string, cls: "contract" | "seed", system: string): MaterializedFile {
  return { entry: { path, class: cls, system }, mode: "100644", content: Buffer.from("x") };
}

const BASE: ReportInput = {
  deuceCommit: "cf3468f",
  receiptState: { kind: "first-sync" },
  receiptPath: "config/vendoring-receipt.md",
  changeLog: [],
  plan: { writes: [file("AGENTS.md", "contract", "review"), file("labels.yml", "seed", "tracking")], skippedSeed: ["package.json"] },
  drift: { kind: "no-baseline" },
  retired: [],
  heldBack: [],
  systems: [],
};

test("the ask leads, and first-sync wording is explicit", () => {
  const body = composeReport(BASE);
  const firstSection = body.split("##")[1]!;
  assert.match(firstSection, /Summary \(HC\)/);
  assert.match(body, /first sync/i);
  assert.match(body, /no baseline/i);
});

test("every written and skipped path is named — nothing silent", () => {
  const body = composeReport(BASE);
  assert.match(body, /`AGENTS\.md` — contract/);
  assert.match(body, /`labels\.yml` — seed, first copy/);
  assert.match(body, /`package\.json`/);
  assert.match(body, /not touched/);
});

test("drift renders as a table naming each file and its state", () => {
  const body = composeReport({
    ...BASE,
    receiptState: { kind: "receipt", receipt: { commit: "old", date: "d", checksums: [] } },
    drift: { kind: "report", drifted: [{ path: "AGENTS.md", state: "edited" }], cleanCount: 15 },
    changeLog: ["abc1234 fix: something"],
  });
  assert.match(body, /\| `AGENTS\.md` \| edited \|/);
  assert.match(body, /reported, never resolved/);
  assert.match(body, /abc1234 fix: something/);
});

test("a clean subsequent sync says exactly what matched", () => {
  const body = composeReport({
    ...BASE,
    receiptState: { kind: "receipt", receipt: { commit: "old", date: "d", checksums: [] } },
    drift: { kind: "report", drifted: [], cleanCount: 16 },
  });
  assert.match(body, /all 16 contract files match/);
});

// The retirement section (#117): every retired path named with its state, the
// edited case loud about what merging discards, the held-back case named and
// never removed — and no section at all when there is nothing to say.

test("retired paths render as a table, and the summary counts them", () => {
  const body = composeReport({
    ...BASE,
    receiptState: { kind: "receipt", receipt: { commit: "old", date: "d", checksums: [] } },
    drift: { kind: "report", drifted: [], cleanCount: 16 },
    retired: [
      { path: "skills/assess/SKILL.md", state: "intact" },
      { path: "skills/devise/SKILL.md", state: "already-absent" },
    ],
  });
  assert.match(body, /\*\*Retired by deuce: 2 path\(s\)\*\*/);
  assert.match(body, /## Retired by this sync/);
  assert.match(body, /\| `skills\/assess\/SKILL\.md` \| intact — matches the receipt; removed \|/);
  assert.match(body, /\| `skills\/devise\/SKILL\.md` \| already absent — nothing to remove/);
});

test("an edited-then-retired path says loudly that merging discards the edit", () => {
  const body = composeReport({
    ...BASE,
    receiptState: { kind: "receipt", receipt: { commit: "old", date: "d", checksums: [] } },
    drift: { kind: "report", drifted: [], cleanCount: 16 },
    retired: [{ path: "skills/verify/SKILL.md", state: "edited" }],
  });
  assert.match(body, /`skills\/verify\/SKILL\.md`.*merging discards the host's edit/);
});

test("a held-back host-territory path is named, and marked never deuce's to remove", () => {
  const body = composeReport({
    ...BASE,
    receiptState: { kind: "receipt", receipt: { commit: "old", date: "d", checksums: [] } },
    drift: { kind: "report", drifted: [], cleanCount: 16 },
    heldBack: ["config/checks.md"],
  });
  assert.match(body, /## Retired by this sync/);
  assert.match(body, /never deuce's to remove/);
  assert.match(body, /`config\/checks\.md`/);
});

test("no retirement, no section — the report does not speak about nothing", () => {
  const body = composeReport(BASE);
  assert.ok(!body.includes("## Retired by this sync"));
  assert.ok(!body.includes("Retired by deuce"));
});

// The credential's blast-radius declaration (#83) is cited from every composed
// body's footer — the footer is shared, so first sync and subsequent sync both
// carry it, which is what makes the first automated sync cite it by
// construction. Asserted on the footer portion, not the whole body: a citation
// that migrated into an earlier section would keep a body-wide assertion green
// while the footer stopped citing (the contractor review on PR #94).
const CREDENTIAL_URL = "https://github.com/wrburgess/deuce/blob/main/config/credentials.md";

function footerOf(body: string): string {
  const cut = body.lastIndexOf("\n---\n");
  assert.notEqual(cut, -1, "the composed body must carry a footer separator");
  return body.slice(cut);
}

test("the footer cites the credential declaration on a first sync", () => {
  const footer = footerOf(composeReport(BASE));
  assert.ok(footer.includes(CREDENTIAL_URL), "first-sync footer must cite the credential declaration");
});

test("the footer cites the credential declaration on a subsequent sync", () => {
  const footer = footerOf(
    composeReport({
      ...BASE,
      receiptState: { kind: "receipt", receipt: { commit: "old", date: "d", checksums: [] } },
      drift: { kind: "report", drifted: [], cleanCount: 16 },
    }),
  );
  assert.ok(footer.includes(CREDENTIAL_URL), "subsequent-sync footer must cite the credential declaration");
});
