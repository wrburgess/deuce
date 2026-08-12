// Materializes the ship set at a pinned deuce commit — the tree's record, not
// the working directory, so what ships is what the receipt will name. Symlinks
// ship as symlinks (mode 120000): the tree records the link, and dereferencing
// it would ship a copy the tree never held.

import { execFileSync } from "node:child_process";
import { lstatSync, mkdirSync, rmSync, symlinkSync, writeFileSync } from "node:fs";
import { dirname, isAbsolute, join, resolve, sep } from "node:path";
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

// The manifest is read at the same pinned commit as the payload bytes: the
// report claims "the manifest at that commit is the whole authority", and a
// working-tree manifest could plan a removal the pinned commit never
// sanctioned (PR #119's review).
export function readManifestAtCommit(deuceRoot: string, commit: string): string {
  return git(deuceRoot, ["show", `${commit}:config/payload.md`]).toString("utf8");
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

// An entry at the path — file, directory, or symlink, dangling included.
// existsSync follows symlinks and reports the target; the seed invariant is
// about the path being occupied, and a dangling host symlink occupies it
// (PR #92's review).
export function entryExists(p: string): boolean {
  try {
    lstatSync(p);
    return true;
  } catch {
    return false;
  }
}

// A repository-relative path resolved inside the root — absolute paths and
// traversal out of the root are refused by name (PR #92's review).
export function resolveInside(root: string, rel: string): string {
  if (isAbsolute(rel)) {
    throw new Error(`path '${rel}' is absolute — payload and receipt paths are repository-relative`);
  }
  const target = resolve(root, rel);
  if (target !== root && !target.startsWith(root + sep)) {
    throw new Error(`path '${rel}' escapes the repository root and is refused`);
  }
  return target;
}

// A write must stay inside the clone: an existing ancestor that is a symlink
// would route it elsewhere on the host's machine (PR #92's review). Refused by
// name — replacing the host's directory structure is not the sync's judgment
// to make.
export function assertSafeRoute(root: string, rel: string): void {
  const parts = rel.split("/").slice(0, -1);
  let cur = root;
  for (const part of parts) {
    cur = join(cur, part);
    let stat;
    try {
      stat = lstatSync(cur);
    } catch {
      return; // absent from here down — the write will create real directories
    }
    if (stat.isSymbolicLink()) {
      throw new Error(
        `the host routes '${rel}' through a symlink at '${part}' — refused: a sync write never ` +
          `leaves the clone`,
      );
    }
  }
}

// Contract is always written — the pull request diff is the adoption decision.
// Seed is written only where the path is absent: a file already there is the
// host's own, whoever made the first copy (Chapter 5's class table).
export function planWrites(files: MaterializedFile[], hostRoot: string): WritePlan {
  const writes: MaterializedFile[] = [];
  const skippedSeed: string[] = [];
  for (const f of files) {
    if (f.entry.class === "seed" && entryExists(join(hostRoot, f.entry.path))) {
      skippedSeed.push(f.entry.path);
      continue;
    }
    writes.push(f);
  }
  return { writes, skippedSeed };
}

// A retired path is removed from the clone; `git add --all` stages the
// deletion, so the removal rides the branch as a diff line the host adopts by
// merging (ADR 0022; #117). The receipt is host-authored input by read-back
// time, so the route is checked like any write's. A directory at the path is
// refused by name — replacing the host's directory structure is not the
// sync's judgment to make; an absent path needs no removal.
export function applyRetirements(hostRoot: string, retired: string[]): void {
  for (const path of retired) {
    const target = resolveInside(hostRoot, path);
    assertSafeRoute(hostRoot, path);
    let stat;
    try {
      stat = lstatSync(target);
    } catch (e) {
      // Absence is the one expected miss; any other stat failure is the
      // host's state rejecting the removal, and it crashes classified, never
      // silently skips.
      if ((e as NodeJS.ErrnoException).code === "ENOENT") continue;
      throw e;
    }
    if (stat.isDirectory()) {
      throw new Error(
        `the host holds a directory at retired path '${path}' — refused: replacing the host's ` +
          `directory structure is not the sync's judgment to make`,
      );
    }
    // A FIFO, socket, or device is no more the sync's to unlink than a
    // directory is to replace (PR #119's review).
    if (!stat.isFile() && !stat.isSymbolicLink()) {
      throw new Error(
        `the host holds a non-regular entry at retired path '${path}' — refused: a sync removes ` +
          `only files and symlinks`,
      );
    }
    rmSync(target);
  }
}

export function applyWrites(hostRoot: string, plan: WritePlan): void {
  for (const f of plan.writes) {
    const target = resolveInside(hostRoot, f.entry.path);
    assertSafeRoute(hostRoot, f.entry.path);
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
