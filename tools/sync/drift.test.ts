import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { computeDrift, sha256Hex } from "./drift.ts";

function host(files: Record<string, string>): string {
  const root = mkdtempSync(join(tmpdir(), "deuce-drift-"));
  for (const [p, content] of Object.entries(files)) writeFileSync(join(root, p), content);
  return root;
}

test("no receipt is no-baseline — a distinct state, not an empty report", () => {
  const report = computeDrift(host({}), undefined);
  assert.equal(report.kind, "no-baseline");
});

test("a clean host reports zero drift and counts what it checked", () => {
  const root = host({ "a.md": "one\n", "b.md": "two\n" });
  const receipt = {
    commit: "c",
    date: "d",
    checksums: [
      { path: "a.md", sha256: sha256Hex(Buffer.from("one\n")) },
      { path: "b.md", sha256: sha256Hex(Buffer.from("two\n")) },
    ],
  };
  const report = computeDrift(root, receipt);
  assert.equal(report.kind, "report");
  assert.equal(report.kind === "report" && report.drifted.length, 0);
  assert.equal(report.kind === "report" && report.cleanCount, 2);
});

test("an edited file and a removed file are named, each with its state", () => {
  const root = host({ "a.md": "edited locally\n" });
  const receipt = {
    commit: "c",
    date: "d",
    checksums: [
      { path: "a.md", sha256: sha256Hex(Buffer.from("shipped\n")) },
      { path: "gone.md", sha256: sha256Hex(Buffer.from("was here\n")) },
    ],
  };
  const report = computeDrift(root, receipt);
  assert.equal(report.kind, "report");
  const drifted = report.kind === "report" ? report.drifted : [];
  assert.deepEqual(drifted, [
    { path: "a.md", state: "edited" },
    { path: "gone.md", state: "removed" },
  ]);
});
