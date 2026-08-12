import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { parseRoster } from "./roster.ts";

const declaration = (lines: string[]) => ["---", ...lines, "---", "", "# A declaration", ""].join("\n");

test("parses the live declaration's roster", () => {
  const md = readFileSync(new URL("../../config/review.md", import.meta.url), "utf8");
  const r = parseRoster(md);
  assert.equal(r.name, "Codex CLI (OpenAI)");
  assert.equal(r.mechanismCommand, "codex exec");
  assert.equal(r.readinessCommand, "codex login status");
  assert.match(r.responseKind, /output it returns/i);
});

test("a declaration without a 'roster' key is refused", () => {
  const md = declaration(["date: 2026-08-02", "source: #13"]);
  assert.throws(() => parseRoster(md), /roster/);
});

test("a roster with zero reviewers is refused — absent and empty are different states", () => {
  const md = declaration(["roster:"]);
  assert.throws(() => parseRoster(md), /zero/i);
});

test("a multi-reviewer roster fails loudly until reviewer selection exists", () => {
  const md = declaration([
    "roster:",
    "  - reviewer: A",
    "    mechanism: a exec",
    "    response: output",
    "    readiness: a status",
    "  - reviewer: B",
    "    mechanism: b exec",
    "    response: output",
    "    readiness: b status",
  ]);
  assert.throws(() => parseRoster(md), /selection/i);
});

test("each missing roster field is refused by name", () => {
  for (const missing of ["reviewer", "mechanism", "response", "readiness"] as const) {
    const fields: Record<string, string> = {
      reviewer: "X",
      mechanism: "x exec",
      response: "output",
      readiness: "x status",
    };
    delete fields[missing];
    const lines = ["roster:"];
    let first = true;
    for (const [key, value] of Object.entries(fields)) {
      lines.push(`${first ? "  - " : "    "}${key}: ${value}`);
      first = false;
    }
    assert.throws(
      () => parseRoster(declaration(lines)),
      new RegExp(`'${missing}'`),
      `a roster entry missing '${missing}' must be refused`,
    );
  }
});

test("a roster entry carrying an unrecognized field is refused", () => {
  const md = declaration([
    "roster:",
    "  - reviewer: X",
    "    mechanism: x exec",
    "    response: output",
    "    readiness: x status",
    "    retainer: monthly",
  ]);
  assert.throws(() => parseRoster(md), /unrecognized/);
});
