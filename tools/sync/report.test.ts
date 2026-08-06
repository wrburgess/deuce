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
