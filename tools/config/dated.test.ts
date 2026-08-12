import { test } from "node:test";
import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import { checkDated } from "./dated.ts";

const declaration = (lines: string[]) => ["---", ...lines, "---", "", "# A declaration", ""].join("\n");

const good = declaration(["date: 2026-08-02", "source: the Direction gate on #13"]);

test("a dated and sourced declaration passes", () => {
  assert.deepEqual(checkDated([{ path: "config/x.md", content: good }]), []);
});

test("zero declarations is a rejecting branch, never a green", () => {
  const errors = checkDated([]);
  assert.equal(errors.length, 1);
  assert.match(errors[0]!, /no declarations/i);
});

test("a file with no frontmatter block is refused, named", () => {
  const errors = checkDated([{ path: "config/x.md", content: "# prose only\n" }]);
  assert.equal(errors.length, 1);
  assert.match(errors[0]!, /config\/x\.md/);
  assert.match(errors[0]!, /frontmatter/i);
});

test("an unclosed frontmatter fence is refused, named", () => {
  const errors = checkDated([{ path: "config/x.md", content: "---\ndate: 2026-08-02\n" }]);
  assert.equal(errors.length, 1);
  assert.match(errors[0]!, /config\/x\.md/);
  assert.match(errors[0]!, /closed/i);
});

test("a missing date is refused, naming the file and the field", () => {
  const errors = checkDated([
    { path: "config/x.md", content: declaration(["source: the Direction gate on #13"]) },
  ]);
  assert.equal(errors.length, 1);
  assert.match(errors[0]!, /config\/x\.md/);
  assert.match(errors[0]!, /'date'/);
});

test("a missing source is refused, naming the file and the field", () => {
  const errors = checkDated([
    { path: "config/x.md", content: declaration(["date: 2026-08-02"]) },
  ]);
  assert.equal(errors.length, 1);
  assert.match(errors[0]!, /config\/x\.md/);
  assert.match(errors[0]!, /'source'/);
});

test("a valueless 'date:' key is refused as missing — the grammar carries no empty scalar", () => {
  const errors = checkDated([
    { path: "config/x.md", content: declaration(["date:", "source: #13"]) },
  ]);
  assert.equal(errors.length, 1);
  assert.match(errors[0]!, /'date'/);
});

test("a valueless 'source:' key is refused as missing", () => {
  const errors = checkDated([
    { path: "config/x.md", content: declaration(["date: 2026-08-02", "source:"]) },
  ]);
  assert.equal(errors.length, 1);
  assert.match(errors[0]!, /'source'/);
});

test("a date not shaped YYYY-MM-DD is refused, shape named", () => {
  const errors = checkDated([
    { path: "config/x.md", content: declaration(["date: 2026-8-3", "source: #13"]) },
  ]);
  assert.equal(errors.length, 1);
  assert.match(errors[0]!, /YYYY-MM-DD/);
});

test("a prose date is refused, not coerced", () => {
  const errors = checkDated([
    { path: "config/x.md", content: declaration(["date: August 2nd, 2026", "source: #13"]) },
  ]);
  assert.equal(errors.length, 1);
  assert.match(errors[0]!, /YYYY-MM-DD/);
});

test("every failing file is named — the guard sits on the declaration, not the list", () => {
  const errors = checkDated([
    { path: "config/a.md", content: declaration(["source: #13"]) },
    { path: "config/b.md", content: good },
    { path: "config/c.md", content: declaration(["date: 2026-08-02"]) },
  ]);
  assert.equal(errors.length, 2);
  assert.match(errors[0]!, /config\/a\.md/);
  assert.match(errors[1]!, /config\/c\.md/);
});

test("the live config/ passes whole — every declaration is dated and sourced", () => {
  const dir = new URL("../../config/", import.meta.url);
  const files = readdirSync(dir)
    .filter((n) => n.endsWith(".md"))
    .sort()
    .map((n) => ({ path: `config/${n}`, content: readFileSync(new URL(n, dir), "utf8") }));
  assert.ok(files.length > 0, "config/ carries no declarations at all");
  assert.deepEqual(checkDated(files), []);
});
