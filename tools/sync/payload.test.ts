import { test } from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { lstatSync, mkdirSync, mkdtempSync, readFileSync, readlinkSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import type { PayloadEntry } from "./manifest.ts";
import { applyRetirements, applyWrites, entryExists, planWrites, readPayloadAtCommit } from "./payload.ts";

function git(root: string, args: string[]): string {
  return execFileSync("git", ["-C", root, ...args], { encoding: "utf8" });
}

// A fixture upstream: two commits, so the pinned commit provably differs from
// the working tree; a symlink and an executable, so both modes are exercised.
function fixtureRepo(): { root: string; pinned: string } {
  const root = mkdtempSync(join(tmpdir(), "deuce-payload-"));
  git(root, ["init", "--quiet"]);
  git(root, ["config", "user.email", "t@t"]);
  git(root, ["config", "user.name", "t"]);
  mkdirSync(join(root, "hooks"));
  writeFileSync(join(root, "hooks/guard"), "#!/bin/sh\nexit 1\n", { mode: 0o755 });
  execFileSync("ln", ["-s", "guard", join(root, "hooks/pre-commit")]);
  writeFileSync(join(root, "AGENTS.md"), "reviewer boundary v1\n");
  writeFileSync(join(root, "seedfile"), "seed v1\n");
  git(root, ["add", "--all"]);
  git(root, ["-c", "commit.gpgsign=false", "commit", "--quiet", "-m", "one"]);
  const pinned = git(root, ["rev-parse", "HEAD"]).trim();
  writeFileSync(join(root, "AGENTS.md"), "reviewer boundary v2 — after the pin\n");
  git(root, ["add", "--all"]);
  git(root, ["-c", "commit.gpgsign=false", "commit", "--quiet", "-m", "two"]);
  return { root, pinned };
}

const ENTRIES: PayloadEntry[] = [
  { path: "AGENTS.md", class: "contract", system: "review" },
  { path: "hooks/guard", class: "contract", system: "governance" },
  { path: "hooks/pre-commit", class: "contract", system: "governance" },
  { path: "seedfile", class: "seed", system: "all" },
];

test("materializes at the pinned commit, not the working tree", () => {
  const { root, pinned } = fixtureRepo();
  const files = readPayloadAtCommit(root, pinned, ENTRIES);
  const agents = files.find((f) => f.entry.path === "AGENTS.md")!;
  assert.equal(agents.content.toString("utf8"), "reviewer boundary v1\n");
});

test("a declared path the pinned tree does not carry is refused by name", () => {
  const { root, pinned } = fixtureRepo();
  const entries = [...ENTRIES, { path: "ghost.md", class: "contract", system: "review" } as PayloadEntry];
  assert.throws(() => readPayloadAtCommit(root, pinned, entries), /'ghost\.md'.*does not carry/);
});

test("symlink and executable modes survive the round trip", () => {
  const { root, pinned } = fixtureRepo();
  const files = readPayloadAtCommit(root, pinned, ENTRIES);
  const host = mkdtempSync(join(tmpdir(), "deuce-host-"));
  applyWrites(host, planWrites(files, host));
  assert.ok(lstatSync(join(host, "hooks/pre-commit")).isSymbolicLink());
  assert.equal(readlinkSync(join(host, "hooks/pre-commit")), "guard");
  assert.ok(lstatSync(join(host, "hooks/guard")).mode & 0o100, "executable bit survives");
});

test("a contract symlink is written over an existing file at its path — the bryce case", () => {
  const { root, pinned } = fixtureRepo();
  const files = readPayloadAtCommit(root, pinned, ENTRIES);
  const host = mkdtempSync(join(tmpdir(), "deuce-host-"));
  mkdirSync(join(host, "hooks"));
  writeFileSync(join(host, "hooks/pre-commit"), "#!/bin/sh\n# the host's ace-era hook\n");
  applyWrites(host, planWrites(files, host));
  assert.ok(lstatSync(join(host, "hooks/pre-commit")).isSymbolicLink());
  assert.equal(readlinkSync(join(host, "hooks/pre-commit")), "guard");
});

test("a contract file is never written through an existing symlink at its path", () => {
  const { root, pinned } = fixtureRepo();
  const files = readPayloadAtCommit(root, pinned, ENTRIES);
  const host = mkdtempSync(join(tmpdir(), "deuce-host-"));
  writeFileSync(join(host, "elsewhere.md"), "the symlink's target — must survive\n");
  execFileSync("ln", ["-s", "elsewhere.md", join(host, "AGENTS.md")]);
  applyWrites(host, planWrites(files, host));
  assert.ok(!lstatSync(join(host, "AGENTS.md")).isSymbolicLink(), "the link is replaced, not followed");
  assert.equal(readFileSync(join(host, "elsewhere.md"), "utf8"), "the symlink's target — must survive\n");
});

test("seed present on the host is skipped and named; contract present is written over", () => {
  const { root, pinned } = fixtureRepo();
  const files = readPayloadAtCommit(root, pinned, ENTRIES);
  const host = mkdtempSync(join(tmpdir(), "deuce-host-"));
  writeFileSync(join(host, "seedfile"), "the host's own seed\n");
  writeFileSync(join(host, "AGENTS.md"), "the host's stale contract\n");
  const plan = planWrites(files, host);
  assert.deepEqual(plan.skippedSeed, ["seedfile"]);
  applyWrites(host, plan);
  assert.equal(readFileSync(join(host, "seedfile"), "utf8"), "the host's own seed\n");
  assert.equal(readFileSync(join(host, "AGENTS.md"), "utf8"), "reviewer boundary v1\n");
});

// The retirement cases (#117): a retired path is removed from the clone; an
// absent one needs nothing; the refusals mirror the write path's — the
// receipt is host-authored input by the time a removal is planned from it.

test("a retired file is removed; an already-absent one is a no-op, not an error", () => {
  const host = mkdtempSync(join(tmpdir(), "deuce-host-"));
  mkdirSync(join(host, "skills"));
  writeFileSync(join(host, "skills/old.md"), "shipped once\n");
  applyRetirements(host, ["skills/old.md", "skills/never-there.md"]);
  assert.ok(!entryExists(join(host, "skills/old.md")), "the retired file is gone");
});

test("a symlinked ancestor on a removal route is refused, and the outside target survives", () => {
  const outside = mkdtempSync(join(tmpdir(), "deuce-outside-"));
  writeFileSync(join(outside, "old.md"), "outside the clone — must survive\n");
  const host = mkdtempSync(join(tmpdir(), "deuce-host-"));
  execFileSync("ln", ["-s", outside, join(host, "skills")]);
  assert.throws(() => applyRetirements(host, ["skills/old.md"]), /symlink.*'skills'/s);
  assert.equal(readFileSync(join(outside, "old.md"), "utf8"), "outside the clone — must survive\n");
});

test("a directory at a retired path is refused by name", () => {
  const host = mkdtempSync(join(tmpdir(), "deuce-host-"));
  mkdirSync(join(host, "skills/old.md"), { recursive: true });
  assert.throws(() => applyRetirements(host, ["skills/old.md"]), /directory at retired path 'skills\/old\.md'/);
});

test("a traversal or absolute retirement path is refused before any removal", () => {
  const host = mkdtempSync(join(tmpdir(), "deuce-host-"));
  assert.throws(() => applyRetirements(host, ["../evil.md"]), /escapes/);
  assert.throws(() => applyRetirements(host, ["/abs/evil.md"]), /absolute/);
});
