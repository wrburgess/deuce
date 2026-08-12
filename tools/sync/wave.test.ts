// The fix wave from PR #92's review — five reviewer findings and one of the
// AC's, each with the test that failed before its fix.

import { test } from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { lstatSync, mkdirSync, mkdtempSync, readFileSync, symlinkSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { parseManifest, shipSet } from "./manifest.ts";
import { parseReceipt, writeReceipt } from "./receipt.ts";
import { applyWrites, planWrites, readPayloadAtCommit } from "./payload.ts";
import { mergeReceiptChecksums, planRetirements } from "./run-helpers.ts";
import type { PayloadEntry } from "./manifest.ts";

const REAL = readFileSync(new URL("../../config/payload.md", import.meta.url), "utf8");

function git(root: string, args: string[]): string {
  return execFileSync("git", ["-C", root, ...args], { encoding: "utf8" });
}

function upstream(): { root: string; pinned: string } {
  const root = mkdtempSync(join(tmpdir(), "deuce-wave-up-"));
  git(root, ["init", "--quiet"]);
  git(root, ["config", "user.email", "t@t"]);
  git(root, ["config", "user.name", "t"]);
  mkdirSync(join(root, "dir"));
  writeFileSync(join(root, "dir/contract.md"), "contract v1\n");
  writeFileSync(join(root, "aseed.md"), "seed v1\n");
  git(root, ["add", "--all"]);
  git(root, ["-c", "commit.gpgsign=false", "commit", "--quiet", "-m", "one"]);
  return { root, pinned: git(root, ["rev-parse", "HEAD"]).trim() };
}

const ENTRIES: PayloadEntry[] = [
  { path: "dir/contract.md", class: "contract", system: "gate" },
  { path: "aseed.md", class: "seed", system: "all" },
];

// R1 — an unknown selected system is refused by name, never silently narrowed.
test("an unknown --system value is refused, naming it and the declared set", () => {
  const m = parseManifest(REAL);
  assert.throws(() => shipSet(m, ["gaet"]), /'gaet'.*declares/s);
});

// R2 — a partial sync's receipt keeps every prior contract baseline that the
// manifest still declares, and drops what the manifest no longer carries.
// Extended by #117: the dropped path is also planned for removal in the same
// run — the drop alone would strand a stale copy with no drift signal.
test("a selected-system receipt merges prior checksums instead of replacing them", () => {
  const prior = {
    commit: "old",
    date: "d",
    checksums: [
      { path: "AGENTS.md", sha256: "a".repeat(64) },
      { path: "retired.md", sha256: "d".repeat(64) },
    ],
  };
  const m = parseManifest(REAL);
  const merged = mergeReceiptChecksums(prior, m, [
    { path: "skills/assess/SKILL.md", sha256: "b".repeat(64) },
  ]);
  assert.ok(merged.some((c) => c.path === "AGENTS.md"), "unselected baseline survives");
  assert.ok(merged.some((c) => c.path === "skills/assess/SKILL.md"), "shipped checksum lands");
  assert.ok(!merged.some((c) => c.path === "retired.md"), "an undeclared path drops");
  const retirement = planRetirements(prior, m);
  assert.deepEqual(retirement.retired, ["retired.md"], "the dropped path is planned for removal");
});

// R3 — a dangling symlink at a seed path is a present host entry, not absence.
test("a dangling symlink at a seed path is the host's own and is skipped", () => {
  const { root, pinned } = upstream();
  const files = readPayloadAtCommit(root, pinned, ENTRIES);
  const host = mkdtempSync(join(tmpdir(), "deuce-wave-host-"));
  symlinkSync("no-such-target", join(host, "aseed.md"));
  const plan = planWrites(files, host);
  assert.deepEqual(plan.skippedSeed, ["aseed.md"]);
  assert.ok(lstatSync(join(host, "aseed.md")).isSymbolicLink(), "untouched");
});

// R4 — a symlinked ancestor directory routes a write outside the clone; refused by name.
test("a symlinked ancestor on a payload path is refused, and the outside target survives", () => {
  const { root, pinned } = upstream();
  const files = readPayloadAtCommit(root, pinned, ENTRIES);
  const outside = mkdtempSync(join(tmpdir(), "deuce-wave-outside-"));
  writeFileSync(join(outside, "contract.md"), "outside the clone — must survive\n");
  const host = mkdtempSync(join(tmpdir(), "deuce-wave-host-"));
  symlinkSync(outside, join(host, "dir"));
  assert.throws(() => applyWrites(host, planWrites(files, host)), /symlink.*'dir'/s);
  assert.equal(readFileSync(join(outside, "contract.md"), "utf8"), "outside the clone — must survive\n");
});

// R5 — a receipt path may not escape the clone.
test("a traversal receipt path is refused by name", () => {
  const host = mkdtempSync(join(tmpdir(), "deuce-wave-host-"));
  const receipt = { commit: "c", date: "d", checksums: [] };
  assert.throws(() => writeReceipt(host, "../evil.md", receipt), /escapes|outside|'\.\.'/s);
  assert.throws(() => writeReceipt(host, "/abs/evil.md", receipt), /absolute/);
});

// R5's second face — a host-authored receipt naming a traversal path is nonconforming.
test("a receipt listing a path outside the repository is refused at parse", () => {
  const md = `---\ncommit: c\ndate: d\nchecksums:\n  - path: ../outside.md\n    sha256: ${"a".repeat(64)}\n---\n`;
  assert.throws(() => parseReceipt(md), /'\.\.\/outside\.md'/);
});
