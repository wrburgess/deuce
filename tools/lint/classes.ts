// The class-grammar check: every entry in findings/classes.md is a heading,
// one count line naming its pull requests, and instance lines each naming a
// pull request and a finding — and a block that fits none of those positions
// is the violation (Chapter 2, *The findings home*, restated structurally in
// Chapter 3, *The structural restatement*).
//
// The count check is what makes the hand-written counts safe to keep: the
// instance count, the pull-request count, and the enumerated pull-request
// list are each held against the instance lines (PR #48's disposition).
//
// Imperative mood stays undecidable and unclaimed: this grammar decides where
// a sentence sits, never what it says. Prose above `## Entries`, and between
// it and the first entry, is the file's own preamble and is not scanned.

import type { Node } from "commonmark";
import { parse, textOf } from "./markdown.ts";

export interface ClassesResult {
  violations: string[];
  // Zero entries parsed is the fail-open state, never a green: the file has
  // carried entries since #47, so an empty parse means the reader broke
  // (ADR 0014).
  guard: string | null;
  entries: number;
}

const COUNT_LINE =
  /^(\d+) instances?, across (\d+) pull requests? — (PR #\d+(?:, PR #\d+)*)\.?$/;
// A pull request and a finding, both: the numbered shape ("finding 4") or
// the descriptor shape ("posture-pass finding"). A lead naming no finding is
// not an instance — the contractor review on PR #110 built the fixture.
const INSTANCE_LEAD = /^PR #(\d+), (?:finding \d+|.+ finding)$/;

interface Entry {
  name: string;
  blocks: Node[];
}

function entriesAfter(root: Node): Entry[] | null {
  let node = root.firstChild;
  while (node !== null) {
    if (node.type === "heading" && node.level === 2 && textOf(node) === "Entries") break;
    node = node.next;
  }
  if (node === null) return null;

  const entries: Entry[] = [];
  let current: Entry | null = null;
  for (node = node.next; node !== null; node = node.next) {
    if (node.type === "heading" && node.level <= 2) break;
    if (node.type === "heading" && node.level === 3) {
      current = { name: textOf(node), blocks: [] };
      entries.push(current);
      continue;
    }
    if (current !== null) current.blocks.push(node);
  }
  return entries;
}

export function checkClasses(content: string): ClassesResult {
  const entries = entriesAfter(parse(content));
  if (entries === null) {
    return {
      violations: [],
      guard: "no '## Entries' section found — the class index's home heading is missing",
      entries: 0,
    };
  }
  if (entries.length === 0) {
    return {
      violations: [],
      guard:
        "zero entries parsed under '## Entries' — an index that has carried entries since #47 must never green on none (ADR 0014)",
      entries: 0,
    };
  }

  const violations: string[] = [];
  for (const entry of entries) {
    const where = `'${entry.name}'`;

    const [countBlock, listBlock, ...rest] = entry.blocks;
    if (countBlock === undefined || countBlock.type !== "paragraph") {
      violations.push(`${where}: the first block is not the count line`);
      continue;
    }
    const match = COUNT_LINE.exec(textOf(countBlock));
    if (match === null) {
      violations.push(
        `${where}: the count line does not follow "N instances, across M pull requests — PR #a, PR #b, …"`,
      );
      continue;
    }
    const declaredInstances = Number(match[1]);
    const declaredPullRequests = Number(match[2]);
    const enumerated = new Set(
      [...match[3]!.matchAll(/PR #(\d+)/g)].map((m) => Number(m[1])),
    );

    if (listBlock === undefined || listBlock.type !== "list") {
      violations.push(`${where}: no instance list follows the count line`);
      continue;
    }
    for (const extra of rest) {
      violations.push(
        `${where}: a ${extra.type} block sits after the instance list — prose with nowhere to be`,
      );
    }

    const instancePullRequests = new Set<number>();
    let items = 0;
    for (let item = listBlock.firstChild; item !== null; item = item.next) {
      items++;
      const paragraph = item.firstChild;
      const lead = paragraph?.firstChild;
      if (paragraph?.type !== "paragraph" || lead?.type !== "strong") {
        violations.push(`${where}: instance ${items} does not open with a bold lead`);
        continue;
      }
      const leadText = textOf(lead);
      if ((leadText.match(/PR #/g) ?? []).length !== 1) {
        violations.push(
          `${where}: instance ${items} lead "${leadText}" does not name exactly one pull request`,
        );
        continue;
      }
      const leadMatch = INSTANCE_LEAD.exec(leadText);
      if (leadMatch === null) {
        violations.push(
          `${where}: instance ${items} lead "${leadText}" does not name a finding`,
        );
        continue;
      }
      instancePullRequests.add(Number(leadMatch[1]));
    }

    if (items !== declaredInstances) {
      violations.push(
        `${where}: the count line says ${declaredInstances} instances; ${items} instance lines follow`,
      );
    }
    if (instancePullRequests.size !== declaredPullRequests) {
      violations.push(
        `${where}: the count line says ${declaredPullRequests} pull requests; the instance lines span ${instancePullRequests.size}`,
      );
    }
    const missing = [...instancePullRequests].filter((n) => !enumerated.has(n));
    const stray = [...enumerated].filter((n) => !instancePullRequests.has(n));
    for (const n of missing) {
      violations.push(`${where}: instance lines name PR #${n}, which the count line does not enumerate`);
    }
    for (const n of stray) {
      violations.push(`${where}: the count line enumerates PR #${n}, which no instance line names`);
    }
  }

  return { violations, guard: null, entries: entries.length };
}
