// Enforces the declared review bounds at dispatch: the lens set is selected
// from the menu and capped at the declared size (Chapter 2, *Bounded by lens
// set*; values in config/review.md). The declaration is read here so a run
// cannot exceed its bounds and still record as conforming.
//
// The menu and the size are read from the declaration's frontmatter through
// the shared grammar (Chapter 3, *Parse, never pattern-match*). The prose scan
// this replaces was the counter-example the chapter cites: it read the menu
// with matchAll and mimicked GitHub's heading-anchor function by hand, holding
// only because every class heading was plain words (PR #48). A menu entry now
// carries its class heading verbatim, so nothing derives an anchor at all.

import { parseFrontmatter } from "../gate/declaration.ts";

export interface LensEntry {
  lens: string;
  class: string;
}

const ENTRY_FIELDS = new Set(["lens", "class"]);

export function parseLensMenu(markdown: string): LensEntry[] {
  const { lists } = parseFrontmatter(markdown);
  const raw = lists.get("lenses");
  // Absent and empty are different states with different fixes (ADR 0014): a
  // menu with nothing on it is declared as 'lenses:' with zero entries, and a
  // declaration that never mentions the key has not declared a menu at all.
  if (raw === undefined) {
    throw new Error(
      "declaration carries no 'lenses' key — an empty menu is declared as " +
        "'lenses:' with zero entries, never by omission",
    );
  }
  return raw.map((entry) => {
    const lens = entry.get("lens");
    if (!lens) {
      throw new Error("a menu entry declares no 'lens'");
    }
    const cls = entry.get("class");
    if (!cls) {
      throw new Error(
        `menu entry '${lens}' declares no 'class' — every lens derives from a class in the index`,
      );
    }
    for (const key of entry.keys()) {
      if (!ENTRY_FIELDS.has(key)) {
        throw new Error(`menu entry '${lens}' carries an unrecognized field '${key}'`);
      }
    }
    return { lens, class: cls };
  });
}

export function parseLensSetSize(markdown: string): number {
  const { scalars } = parseFrontmatter(markdown);
  const raw = scalars.get("lens-set-size");
  if (raw === undefined) {
    throw new Error("declaration carries no 'lens-set-size'");
  }
  if (!/^\d+$/.test(raw)) {
    throw new Error(`'lens-set-size' is not a whole number: ${raw}`);
  }
  return Number(raw);
}

// Canon's own lenses for prose subjects — pinned copies of the phrases in
// Chapter 2 → *Verifying prose*, drift-guarded by the test that asserts each
// against the section. A canon pull request is summoned with these; they are
// canon-sourced, not menu-derived, so an empty menu strands no canon subject.
export const PROSE_LENSES: readonly string[] = [
  "restatement of content another document owns",
  "contradiction with ratified canon",
  "a term used with no Glossary entry behind it",
  "drift between a copy and its source",
];

export function checkLensSelection(
  chosen: string[],
  menu: string[],
  size: number,
  proseSubject: boolean,
): string[] {
  const errors: string[] = [];
  for (const lens of chosen) {
    if (menu.includes(lens)) continue;
    if (PROSE_LENSES.includes(lens)) {
      if (!proseSubject) {
        // Prose lenses are canon-sourced for canon subjects only — accepting
        // them everywhere would let a code review bypass the menu.
        errors.push(
          `prose lens summoned for a non-prose subject: ${lens} — declare the subject prose, or select from the menu`,
        );
      }
      continue;
    }
    errors.push(
      `lens is not on the menu and cannot be summoned: ${lens} — ` +
        "the menu derives from the class index and canon names the prose lenses; " +
        "a one-off lens enters as a dated menu entry, never as a bypass",
    );
  }
  if (chosen.length > size) {
    errors.push(
      `${chosen.length} lenses chosen, over the declared lens-set size of ${size}`,
    );
  }
  return errors;
}
