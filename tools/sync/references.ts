// Host-side references to the paths this sync retires (#122). The sync already
// holds the clone when it composes the report, and the retired paths are known,
// so the one thing the report never said — who inside the host still points at
// a path about to disappear — is computable at the same moment.
//
// It names; it never fixes. Every file it finds lives in host territory
// (CLAUDE.md, PROJECT.md, a host's own config/), and deuce has no standing to
// edit those (ADR 0021). The report is the whole deliverable.
//
// A markdown file is parsed, because a link is structure and not a substring
// (Chapter 3, *Parse, never pattern-match*). Every other file is scanned by
// line and reported under a kind that says outright it was not interpreted — a
// `.ts` comment has no parser here, and inventing one would be the lenses.ts
// trade taken a second time.

import { lstatSync, readFileSync, readlinkSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { join, posix } from "node:path";
import type { Node } from "commonmark";
import { parse, walk } from "../lint/markdown.ts";

export type ReferenceKind = "relative-link" | "in-url" | "prose" | "unparsed";

export interface HostFile {
  path: string; // repository-relative, as `git ls-files` reports it
  content: string; // utf8; a symlink's content is its target string
}

export interface Reference {
  file: string;
  line: number; // 1-based
  target: string; // the retired path this reference names
  kind: ReferenceKind;
}

export interface UnreadFile {
  path: string;
  reason: "binary" | "unreadable";
}

export interface HostText {
  files: HostFile[];
  unread: UnreadFile[];
}

// What the report renders: the references, and how many files the scan could
// not read. The count is carried rather than dropped — a scan that silently
// skipped files would report "no references" over a tree it never read.
export interface ReferenceScan {
  references: Reference[];
  unread: number;
}

// A path character on either flank means this is a different path. The rule
// that matters: `skills/verify/SKILL.md` sits inside
// `.claude/skills/verify/SKILL.md`, the very path that replaces it, so a bare
// substring scan reports every already-corrected pointer as stale (measured on
// nadal: 24 false positives without this, 0 with it). The trailing half does
// the same job for `…/SKILL.md.bak`.
const PATH_CHAR = /[A-Za-z0-9_./-]/;

// Anything with a scheme is an absolute address, the same test
// `tools/lint/links.ts` applies to decide what it may not probe.
const SCHEME = /^[a-z][a-z0-9+.-]*:/i;

function occurrences(text: string, target: string): number[] {
  const found: number[] = [];
  let from = 0;
  for (;;) {
    const at = text.indexOf(target, from);
    if (at === -1) return found;
    from = at + 1;
    const before = at === 0 ? "" : text[at - 1]!;
    const after = text[at + target.length] ?? "";
    if (!PATH_CHAR.test(before) && !PATH_CHAR.test(after)) found.push(at);
  }
}

// A retired path inside an absolute address is a pinned citation: it resolves
// today and re-aiming it would falsify the citation. It is always preceded by
// a slash there, which is why the boundary rule above cannot decide this case.
function urlNames(destination: string, target: string): boolean {
  let from = 0;
  for (;;) {
    const at = destination.indexOf(target, from);
    if (at === -1) return false;
    from = at + 1;
    const after = destination[at + target.length] ?? "";
    if (at > 0 && destination[at - 1] === "/" && !PATH_CHAR.test(after)) return true;
  }
}

// The line range of the nearest ancestor the parser gave a position for.
// commonmark records positions on block nodes only — probed directly, and
// `{sourcepos: true}` does not change it — so an inline node's line comes from
// searching its block's own lines, never from the node itself.
function blockRange(node: Node): [number, number] {
  let cur: Node | null = node;
  while (cur !== null) {
    const pos = cur.sourcepos;
    if (pos) return [pos[0][0], pos[1][0]];
    cur = cur.parent;
  }
  return [1, 1];
}

// Line numbers where `needle` occurs inside a block, one entry per occurrence,
// so the k-th reference of a kind lands on the k-th occurrence of it.
function occurrenceLines(
  lines: string[],
  [start, end]: [number, number],
  find: (line: string) => number,
): number[] {
  const at: number[] = [];
  for (let n = start; n <= end && n <= lines.length; n++) {
    for (let i = 0; i < find(lines[n - 1] ?? ""); i++) at.push(n);
  }
  return at;
}

class LineFinder {
  private readonly lines: string[];
  private readonly cache = new Map<string, number[]>();
  private readonly taken = new Map<string, number>();

  constructor(content: string) {
    this.lines = content.split("\n");
  }

  // The block's first line is the stated fallback: a reference-style link's
  // destination is written somewhere else entirely, so there is no occurrence
  // on the link's own lines to find.
  next(range: [number, number], key: string, find: (line: string) => number): number {
    const id = `${range[0]}:${range[1]}:${key}`;
    let at = this.cache.get(id);
    if (at === undefined) {
      at = occurrenceLines(this.lines, range, find);
      this.cache.set(id, at);
    }
    const used = this.taken.get(id) ?? 0;
    this.taken.set(id, used + 1);
    return at[used] ?? range[0];
  }
}

function countOf(line: string, needle: string): number {
  let n = 0;
  let from = 0;
  for (;;) {
    const at = line.indexOf(needle, from);
    if (at === -1) return n;
    n++;
    from = at + 1;
  }
}

// A relative destination is decided by resolution, never by matching: the same
// posix.normalize(posix.join(...)) `tools/lint/links.ts` uses. That is what
// separates `](../../skills/verify/SKILL.md)` two directories down — a real
// reference — from `](.claude/skills/verify/SKILL.md)`, which is the new home.
function resolvedTarget(filePath: string, destination: string): string | null {
  const hash = destination.indexOf("#");
  const pathPart = hash === -1 ? destination : destination.slice(0, hash);
  if (pathPart === "") return null;
  const target = posix
    .normalize(posix.join(posix.dirname(filePath), pathPart))
    .replace(/\/+$/, "");
  return target.startsWith("..") ? null : target;
}

function markdownReferences(file: HostFile, retired: readonly string[]): Reference[] {
  const references: Reference[] = [];
  const finder = new LineFinder(file.content);

  const prose = (node: Node, literal: string): void => {
    const range = blockRange(node);
    for (const target of retired) {
      for (let i = 0; i < occurrences(literal, target).length; i++) {
        references.push({
          file: file.path,
          line: finder.next(range, `prose:${target}`, (l) => occurrences(l, target).length),
          target,
          kind: "prose",
        });
      }
    }
  };

  walk(parse(file.content), (node) => {
    if (node.type === "link" || node.type === "image") {
      const destination = node.destination ?? "";
      const range = blockRange(node);
      const line = (): number =>
        finder.next(
          range,
          `link:${destination}`,
          (l) => countOf(l, `](${destination}`) + countOf(l, `](<${destination}`),
        );
      if (SCHEME.test(destination)) {
        for (const target of retired) {
          if (urlNames(destination, target)) {
            references.push({ file: file.path, line: line(), target, kind: "in-url" });
          }
        }
        return;
      }
      const resolved = resolvedTarget(file.path, destination);
      if (resolved !== null && retired.includes(resolved)) {
        references.push({ file: file.path, line: line(), target: resolved, kind: "relative-link" });
      }
      return;
    }
    if (node.type === "text" || node.type === "code") {
      // An autolink's visible text is its own destination; counting it here
      // would report the same characters twice, once per kind. Restricted to a
      // destination carrying a scheme and to plain text: a code-span label that
      // repeats a relative destination is the shape both hosts' CLAUDE.md is
      // built out of, and it is two references, not one.
      const parent = node.parent;
      if (
        node.type === "text" &&
        parent !== null &&
        parent.type === "link" &&
        SCHEME.test(parent.destination ?? "") &&
        parent.destination === node.literal
      ) {
        return;
      }
      prose(node, node.literal ?? "");
      return;
    }
    // Raw HTML is prose here, inline and block alike. The parser yields no
    // link node for `<a href="…">` — `tools/lint/links.ts` declares the same
    // limit — so the choice is between naming it without a claim about its
    // syntax and not naming it at all. Named.
    if (node.type === "code_block" || node.type === "html_block" || node.type === "html_inline") {
      prose(node, node.literal ?? "");
    }
  });

  return references;
}

function plainReferences(file: HostFile, retired: readonly string[]): Reference[] {
  const references: Reference[] = [];
  const lines = file.content.split("\n");
  for (let n = 1; n <= lines.length; n++) {
    for (const target of retired) {
      for (let i = 0; i < occurrences(lines[n - 1] ?? "", target).length; i++) {
        references.push({ file: file.path, line: n, target, kind: "unparsed" });
      }
    }
  }
  return references;
}

export function findReferences(
  files: readonly HostFile[],
  retired: readonly string[],
  excluded: ReadonlySet<string> = new Set(),
): Reference[] {
  // An empty target matches at every position. The receipt parser already
  // refuses a checksum with no path, so the sync cannot supply one — the guard
  // is here because this function is callable without it.
  const targets = retired.filter((p) => p !== "");
  if (targets.length === 0) return [];
  const references: Reference[] = [];
  for (const file of files) {
    if (excluded.has(file.path)) continue;
    references.push(
      ...(file.path.endsWith(".md")
        ? markdownReferences(file, targets)
        : plainReferences(file, targets)),
    );
  }
  return references;
}

// Three exclusions, each removing noise the sync itself creates. The retired
// files go with the merge, so a reference inside one goes with them; the sync
// rewrites the receipt in the same run; and a stale pointer inside a file deuce
// is replacing is deuce's own defect, which `payload-links` already fails the
// gate on — reporting it as the host's would be wrong twice.
export function excludedPaths(
  retired: readonly string[],
  written: readonly string[],
  receiptPath: string,
): Set<string> {
  return new Set([...retired, ...written, receiptPath]);
}

// A NUL in the head of a file is git's own binary tell, and it is the one this
// scan needs: a binary file has no lines to name.
function isBinary(content: Buffer): boolean {
  return content.subarray(0, 8000).includes(0);
}

// Every tracked file in the clone, read as text. Reading decides nothing —
// which paths are out of scope is `findReferences`'s call, so there is one
// place that knows. A file that cannot be read is named and counted, never
// silently dropped, but it does not stop the sync: a report that can block an
// update inverts its own purpose. A symlink's content is its target string,
// the identity `drift.ts` already reads it by.
export function readHostText(hostRoot: string): HostText {
  const result = spawnSync("git", ["ls-files", "-z"], { cwd: hostRoot, encoding: "utf8" });
  if (result.error !== undefined) {
    throw new Error(`git ls-files could not run on the host clone: ${result.error.message}`);
  }
  if (result.status !== 0) {
    throw new Error(`git ls-files exited ${result.status} on the host clone: ${result.stderr.trim()}`);
  }

  const files: HostFile[] = [];
  const unread: UnreadFile[] = [];
  for (const path of result.stdout.split("\0")) {
    if (path.length === 0) continue;
    const target = join(hostRoot, path);
    try {
      const stat = lstatSync(target);
      if (stat.isSymbolicLink()) {
        files.push({ path, content: readlinkSync(target) });
        continue;
      }
      if (!stat.isFile()) {
        unread.push({ path, reason: "unreadable" });
        continue;
      }
      const content = readFileSync(target);
      if (isBinary(content)) {
        unread.push({ path, reason: "binary" });
        continue;
      }
      files.push({ path, content: content.toString("utf8") });
    } catch {
      unread.push({ path, reason: "unreadable" });
    }
  }
  return { files, unread };
}
