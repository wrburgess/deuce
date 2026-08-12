import { test } from "node:test";
import assert from "node:assert/strict";
import { chmodSync, mkdirSync, mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { assessRetirements, computeDrift, sha256Hex } from "./drift.ts";

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

// The retirement cases (#117): retirement owns a retired path's story, so the
// drift table never speaks about it — a host's own deletion of a retired path
// is agreement, not "removed" drift.

test("a retired path is skipped by drift, whatever the host did to it", () => {
  const root = host({ "kept.md": "clean\n" });
  const receipt = {
    commit: "c",
    date: "d",
    checksums: [
      { path: "kept.md", sha256: sha256Hex(Buffer.from("clean\n")) },
      { path: "retired-gone.md", sha256: sha256Hex(Buffer.from("was here\n")) },
    ],
  };
  const report = computeDrift(root, receipt, new Set(["retired-gone.md"]));
  assert.equal(report.kind, "report");
  assert.equal(report.kind === "report" && report.drifted.length, 0);
  assert.equal(report.kind === "report" && report.cleanCount, 1);
});

// The review's wave on PR #119: absence means ENOENT or ENOTDIR and nothing
// else — an unreadable path is a refusal, never "already absent"; a
// non-regular entry is refused by name, never read.

test("an unreadable path is a refusal, never reported absent", () => {
  const root = host({});
  mkdirSync(join(root, "locked"));
  writeFileSync(join(root, "locked/file.md"), "sealed\n");
  chmodSync(join(root, "locked"), 0o000);
  const receipt = {
    commit: "c",
    date: "d",
    checksums: [{ path: "locked/file.md", sha256: sha256Hex(Buffer.from("sealed\n")) }],
  };
  try {
    assert.throws(() => assessRetirements(root, receipt, ["locked/file.md"]));
  } finally {
    chmodSync(join(root, "locked"), 0o755);
  }
});

test("a directory at an assessed path is refused by name, not read", () => {
  const root = host({});
  mkdirSync(join(root, "was-a-file.md"));
  const receipt = {
    commit: "c",
    date: "d",
    checksums: [{ path: "was-a-file.md", sha256: sha256Hex(Buffer.from("x\n")) }],
  };
  assert.throws(
    () => assessRetirements(root, receipt, ["was-a-file.md"]),
    /non-regular entry at 'was-a-file\.md'/,
  );
});

test("a parent that is a file means the path is absent — ENOTDIR is absence", () => {
  const root = host({ "a": "a file, not a directory\n" });
  const receipt = {
    commit: "c",
    date: "d",
    checksums: [{ path: "a/b.md", sha256: sha256Hex(Buffer.from("x\n")) }],
  };
  const states = assessRetirements(root, receipt, ["a/b.md"]);
  assert.deepEqual(states, [{ path: "a/b.md", state: "already-absent" }]);
});

test("retirement states: intact, edited, and already-absent, each named", () => {
  const root = host({ "intact.md": "as shipped\n", "edited.md": "the host changed this\n" });
  const receipt = {
    commit: "c",
    date: "d",
    checksums: [
      { path: "intact.md", sha256: sha256Hex(Buffer.from("as shipped\n")) },
      { path: "edited.md", sha256: sha256Hex(Buffer.from("as shipped\n")) },
      { path: "absent.md", sha256: sha256Hex(Buffer.from("was here\n")) },
    ],
  };
  const states = assessRetirements(root, receipt, ["intact.md", "edited.md", "absent.md"]);
  assert.deepEqual(states, [
    { path: "intact.md", state: "intact" },
    { path: "edited.md", state: "edited" },
    { path: "absent.md", state: "already-absent" },
  ]);
});
