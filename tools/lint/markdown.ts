// The shared parse layer for the document lint (#55). Structured input is
// read with a parser for its format (Chapter 3, *Parse, never pattern-match*):
// commonmark is the specification's reference implementation, and
// github-slugger is GitHub's own heading-anchor function — the one
// `tools/review/lenses.ts` records the risk of mimicking by hand.
//
// This file parses and walks; it decides nothing. Every decision lives in the
// four check modules beside it, where it can be measured without touching the
// filesystem (ADR 0014). The one filesystem verb here is the inventory, kept
// in this layer so all four checks read the same list of documents.

import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { Parser, type Node } from "commonmark";
import GithubSlugger from "github-slugger";

export interface MarkdownFile {
  path: string;
  content: string;
}

export function parse(content: string): Node {
  return new Parser().parse(content);
}

// Exported because the sync's reference scan walks the same trees this layer
// parses (#122) — one parser per format is Chapter 3's rule, and a second
// walker beside it would be the same tree read two ways.
export function walk(root: Node, visit: (node: Node) => void): void {
  const walker = root.walker();
  let event = walker.next();
  while (event !== null) {
    if (event.entering) visit(event.node);
    event = walker.next();
  }
}

// Link and image destinations, in document order. The parser is what makes
// this a list of links rather than a list of surfaces: link syntax inside a
// code fence is not a link, and a reference-style link resolves to its
// destination before it gets here.
export function linkDestinations(root: Node): string[] {
  const destinations: string[] = [];
  walk(root, (node) => {
    if ((node.type === "link" || node.type === "image") && node.destination !== null) {
      destinations.push(node.destination);
    }
  });
  return destinations;
}

// The visible text of one node's subtree — what GitHub feeds its slugger.
export function textOf(node: Node): string {
  let text = "";
  walk(node, (child) => {
    if (child.type === "text" || child.type === "code") text += child.literal ?? "";
    if (child.type === "softbreak" || child.type === "linebreak") text += " ";
  });
  return text;
}

// Every heading's anchor, with GitHub's duplicate suffixes (-1, -2, …)
// reproduced by giving the slugger one instance per document.
export function headingSlugs(root: Node): Set<string> {
  const slugger = new GithubSlugger();
  const slugs = new Set<string>();
  walk(root, (node) => {
    if (node.type === "heading") slugs.add(slugger.slug(textOf(node)));
  });
  return slugs;
}

// Inline code spans only — a fenced or indented code block is not a token.
export function inlineCodeSpans(root: Node): string[] {
  const spans: string[] = [];
  walk(root, (node) => {
    if (node.type === "code") spans.push(node.literal ?? "");
  });
  return spans;
}

// The repository's own documents: every tracked markdown file. Spawned
// token-wise, never through a shell (the dispatch.ts pattern). A failure here
// is the check unable to run, not a state it rejects — the caller maps the
// thrown error to exit 2 (Chapter 3, *The tooling contract*). The directory
// argument exists for the empty-input deletion measurements; the gate always
// runs the default.
export function trackedMarkdown(dir = "."): MarkdownFile[] {
  const result = spawnSync("git", ["ls-files", "-z", "--", "*.md"], {
    cwd: dir,
    encoding: "utf8",
  });
  if (result.error !== undefined) {
    throw new Error(`git ls-files could not run: ${result.error.message}`);
  }
  if (result.status !== 0) {
    throw new Error(`git ls-files exited ${result.status}: ${result.stderr.trim()}`);
  }
  return result.stdout
    .split("\0")
    .filter((path) => path.length > 0)
    .map((path) => ({ path, content: readFileSync(join(dir, path), "utf8") }));
}

// Every tracked path, plus every directory those paths sit in. Link targets
// resolve against this set, never against the local disk: existsSync passes
// for a gitignored file that no other clone has, and is case-insensitive on
// this machine while the repository is not — both are the invariant measured
// against a proxy for it, proven on PR #110 before this function existed.
export function trackedPaths(dir = "."): Set<string> {
  const result = spawnSync("git", ["ls-files", "-z"], { cwd: dir, encoding: "utf8" });
  if (result.error !== undefined) {
    throw new Error(`git ls-files could not run: ${result.error.message}`);
  }
  if (result.status !== 0) {
    throw new Error(`git ls-files exited ${result.status}: ${result.stderr.trim()}`);
  }
  const paths = new Set<string>();
  for (const path of result.stdout.split("\0")) {
    if (path.length === 0) continue;
    paths.add(path);
    let parent = path;
    while (parent.includes("/")) {
      parent = parent.slice(0, parent.lastIndexOf("/"));
      paths.add(parent);
    }
  }
  return paths;
}
