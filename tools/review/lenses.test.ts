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

test("the live declaration's lens menu is empty", () => {
  assert.deepEqual(parseLensMenu(live), []);
});

test("the live declaration's lens-set size is 3", () => {
  assert.equal(parseLensSetSize(live), 3);
});

test("real entries beside a stale empty marker are a contradiction, and loud", () => {
  const md = [
    "## Lens menu",
    "",
    "- **Empty — zero lenses.**",
    "- `does any guard fail open?`",
    "",
  ].join("\n");
  assert.throws(() => parseLensMenu(md), /contradict/i);
});

test("entries parse once the menu has them", () => {
  const md = ["## Lens menu", "", "- `does any guard fail open?`", ""].join("\n");
  assert.deepEqual(parseLensMenu(md), ["does any guard fail open?"]);
});

test("a menu section in an unrecognized shape fails loudly", () => {
  const md = "## Lens menu\n\n- some prose that is neither the empty marker nor an entry\n";
  assert.throws(() => parseLensMenu(md), /menu/i);
});

test("a declaration without a lens-set size fails loudly", () => {
  assert.throws(() => parseLensSetSize("# nothing\n"), /size/i);
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
