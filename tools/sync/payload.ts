// Materializes the ship set at a pinned deuce commit — the tree's record, not
// the working directory, so what ships is what the receipt will name. Symlinks
// ship as symlinks (mode 120000): the tree records the link, and dereferencing
// it would ship a copy the tree never held.

import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, rmSync, symlinkSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import type { PayloadEntry } from "./manifest.ts";

export interface MaterializedFile {
  entry: PayloadEntry;
  mode: string; // git file mode: 100644, 100755, 120000
  content: Buffer;
}

export interface WritePlan {
  writes: MaterializedFile[];
  skippedSeed: string[]; // seed paths already present on the host — the host's from its first copy
}

function git(repoRoot: string, args: string[]): Buffer {
  return execFileSync("git", ["-C", repoRoot, ...args], { maxBuffer: 64 * 1024 * 1024 });
}

// One ls-tree over the pinned commit; a declared path the tree does not carry
// is refused by name — the manifest and the tree disagree, and shipping the
// remainder silently would report a payload nobody declared.
export function readPayloadAtCommit(
  deuceRoot: string,
  commit: string,
  entries: PayloadEntry[],
): MaterializedFile[] {
  const listing = git(deuceRoot, ["ls-tree", "-r", commit]).toString("utf8");
  const byPath = new Map<string, { mode: string; oid: string }>();
  for (const line of listing.split("\n")) {
    if (line === "") continue;
    // <mode> <type> <oid>\t<path>
    const tab = line.indexOf("\t");
    const [mode, , oid] = line.slice(0, tab).split(" ");
    byPath.set(line.slice(tab + 1), { mode: mode!, oid: oid! });
  }

  return entries.map((entry) => {
    const found = byPath.get(entry.path);
    if (!found) {
      throw new Error(
        `manifest declares '${entry.path}' but commit ${commit} does not carry it — ` +
          `the manifest and the tree disagree, and nothing ships until they agree`,
      );
    }
    const content = git(deuceRoot, ["cat-file", "blob", found.oid]);
    return { entry, mode: found.mode, content };
  });
}

// Contract is always written — the pull request diff is the adoption decision.
// Seed is written only where the path is absent: a file already there is the
// host's own, whoever made the first copy (Chapter 5's class table).
export function planWrites(files: MaterializedFile[], hostRoot: string): WritePlan {
  const writes: MaterializedFile[] = [];
  const skippedSeed: string[] = [];
  for (const f of files) {
    if (f.entry.class === "seed" && existsSync(join(hostRoot, f.entry.path))) {
      skippedSeed.push(f.entry.path);
      continue;
    }
    writes.push(f);
  }
  return { writes, skippedSeed };
}

export function applyWrites(hostRoot: string, plan: WritePlan): void {
  for (const f of plan.writes) {
    const target = join(hostRoot, f.entry.path);
    mkdirSync(dirname(target), { recursive: true });
    // Whatever the host has at a contract path is replaced, not merged and
    // never written through: an existing symlink would route the write into
    // its target, and symlinkSync refuses an occupied path outright — the
    // first live run against bryce hit exactly that (EEXIST on pre-commit).
    rmSync(target, { force: true });
    if (f.mode === "120000") {
      symlinkSync(f.content.toString("utf8"), target);
      continue;
    }
    writeFileSync(target, f.content, { mode: f.mode === "100755" ? 0o755 : 0o644 });
  }
}
