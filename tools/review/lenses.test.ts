import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import {
  PROSE_LENSES,
  checkLensSelection,
  parseLensMenu,
  parseLensSetSize,
} from "./lenses.ts";

const live = readFileSync(new URL("../../config/review.md", import.meta.url), "utf8");

const declaration = (lines: string[]) => ["---", ...lines, "---", "", "# A declaration", ""].join("\n");

test("every prose lens is canon's own phrase — pinned against the Verifying prose section", () => {
  const chapter = readFileSync(
    new URL("../../sds/02-review-and-findings.md", import.meta.url),
    "utf8",
  );
  const at = chapter.search(/^##\s+Verifying prose\s*$/m);
  assert.notEqual(at, -1, "chapter carries no Verifying prose section");
  const section = chapter
    .slice(at)
    .split(/\n##\s/)[0]!
    .replace(/\s+/g, " ");
  const declared = section.match(/lenses fit for prose: ([^.]+)\./);
  assert.ok(declared, "chapter no longer declares the prose-lens list");
  const canonSet = declared![1]!.split(", ").map((l) => l.trim()).sort();
  assert.deepEqual([...PROSE_LENSES].sort(), canonSet);
});

test("a prose lens is summonable for a prose subject with an empty menu", () => {
  const errors = checkLensSelection([PROSE_LENSES[0]!], [], 3, true);
  assert.deepEqual(errors, []);
});

test("a prose lens on a code subject is refused — no menu bypass", () => {
  const errors = checkLensSelection([PROSE_LENSES[0]!], [], 3, false);
  assert.ok(errors.some((e) => e.includes("prose")));
});

test("prose lenses still respect the declared lens-set size", () => {
  const errors = checkLensSelection([...PROSE_LENSES], [], 3, true);
  assert.ok(errors.some((e) => e.includes("3")));
});

test("every lens on the live menu is stated as an interrogative", () => {
  const menu = parseLensMenu(live);
  assert.ok(menu.length > 0, "the live menu carries no lenses");
  for (const entry of menu) {
    assert.ok(entry.lens.endsWith("?"), `lens is not stated as an interrogative: ${entry.lens}`);
  }
});

// Checking only that the menu is populated, or only that its class fields are
// filled, measures a proxy for the invariant that matters — that the menu and
// the index are the same set. Substituting a proxy is class 1 in the index this
// guards, and enforcing one direction while the other leaks is class 4. The
// comparison is heading text to heading text, verbatim — the hand-rolled
// anchor derivation this replaces diverged from GitHub's on punctuation
// (PR #48) and retires with the prose scan.
test("the menu and the class index are one to one, in both directions", () => {
  const index = readFileSync(new URL("../../findings/classes.md", import.meta.url), "utf8");
  // Scoped to Entries: every `###` in the file is not a class, and counting one
  // that is not would be this check measuring the wrong unit.
  const entries = index.slice(index.search(/^##\s+Entries\s*$/m)).split(/\n##\s/)[0]!;
  const classes = [...entries.matchAll(/^###\s+(.+?)\s*$/gm)].map((m) => m[1]!);
  const menu = parseLensMenu(live);
  // Both sides are zero when the menu is empty, and equality alone would pass
  // on it — the vacuous case is where a derivation check fails open.
  assert.ok(menu.length > 0, "the live menu derives from no class at all");
  assert.deepEqual(
    menu.map((e) => e.class).sort(),
    [...classes].sort(),
    "menu and index disagree — every admitted class earns a lens, and every lens names a class",
  );
});

test("the live declaration's lens-set size is 3", () => {
  assert.equal(parseLensSetSize(live), 3);
});

test("a declared-empty menu — 'lenses:' with zero entries — parses to no lenses", () => {
  const md = declaration(["date: 2026-08-02", "source: #13", "lenses:", "lens-set-size: 3"]);
  assert.deepEqual(parseLensMenu(md), []);
});

test("a declaration without a 'lenses' key is refused — absent is never empty", () => {
  const md = declaration(["date: 2026-08-02", "source: #13", "lens-set-size: 3"]);
  assert.throws(() => parseLensMenu(md), /lenses/);
});

test("a menu entry without a 'lens' field is refused", () => {
  const md = declaration([
    "lenses:",
    "  - class: A guard that fails open",
  ]);
  assert.throws(() => parseLensMenu(md), /lens/);
});

test("a menu entry without a 'class' field is refused — every lens derives from a class", () => {
  const md = declaration([
    "lenses:",
    "  - lens: does any guard fail open?",
  ]);
  assert.throws(() => parseLensMenu(md), /class/);
});

test("a menu entry carrying an unrecognized field is refused", () => {
  const md = declaration([
    "lenses:",
    "  - lens: does any guard fail open?",
    "    class: A guard that fails open",
    "    weight: heavy",
  ]);
  assert.throws(() => parseLensMenu(md), /unrecognized/);
});

test("a declaration without a lens-set size is refused", () => {
  const md = declaration(["date: 2026-08-02", "source: #13", "lenses:"]);
  assert.throws(() => parseLensSetSize(md), /lens-set-size/);
});

test("a lens-set size that is not a whole number is refused", () => {
  const md = declaration(["lens-set-size: three"]);
  assert.throws(() => parseLensSetSize(md), /whole number/);
});

test("choosing no lenses is always within bounds — the permanent lens rides along", () => {
  assert.deepEqual(checkLensSelection([], [], 3, false), []);
});

test("a lens not on the menu is refused, by name", () => {
  const errors = checkLensSelection(["does any guard fail open?"], [], 3, false);
  assert.ok(errors.some((e) => e.includes("does any guard fail open?")));
});

test("a selection over the declared size is refused, naming the bound", () => {
  const menu = ["a", "b", "c", "d"];
  const errors = checkLensSelection(["a", "b", "c", "d"], menu, 3, false);
  assert.ok(errors.some((e) => e.includes("3")));
});

test("a within-bounds selection from the menu passes", () => {
  const menu = ["a", "b", "c", "d"];
  assert.deepEqual(checkLensSelection(["a", "c"], menu, 3, false), []);
});
