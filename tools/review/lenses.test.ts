import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { parseLensMenu, parseLensSetSize, checkLensSelection } from "./lenses.ts";

const live = readFileSync(new URL("../../config/review.md", import.meta.url), "utf8");

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
  assert.deepEqual(checkLensSelection([], [], 3), []);
});

test("a lens not on the menu is refused, by name", () => {
  const errors = checkLensSelection(["does any guard fail open?"], [], 3);
  assert.ok(errors.some((e) => e.includes("does any guard fail open?")));
});

test("a selection over the declared size is refused, naming the bound", () => {
  const menu = ["a", "b", "c", "d"];
  const errors = checkLensSelection(["a", "b", "c", "d"], menu, 3);
  assert.ok(errors.some((e) => e.includes("3")));
});

test("a within-bounds selection from the menu passes", () => {
  const menu = ["a", "b", "c", "d"];
  assert.deepEqual(checkLensSelection(["a", "c"], menu, 3), []);
});
