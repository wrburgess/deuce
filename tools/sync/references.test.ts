import { test } from "node:test";
import assert from "node:assert/strict";
import { findReferences, excludedPaths, type HostFile, type Reference } from "./references.ts";

const VERIFY = "skills/verify/SKILL.md";
const RETIRED = [VERIFY];

function file(path: string, content: string): HostFile {
  return { path, content };
}

function shape(refs: Reference[]): string[] {
  return refs.map((r) => `${r.file}:${r.line} ${r.kind} ${r.target}`);
}

// 1 — the happy path: a link a merge would leave pointing at nothing.

test("a relative link to a retired path is found, with its line", () => {
  const refs = findReferences([file("CLAUDE.md", "intro\n\nSee [the stage](skills/verify/SKILL.md) now.\n")], RETIRED);
  assert.deepEqual(shape(refs), [`CLAUDE.md:3 relative-link ${VERIFY}`]);
});

// 2 — bryce's real case: the reference sits two directories down and points
// back up. Resolution decides it; a substring match never could.

test("a link resolved from a nested file is found", () => {
  const refs = findReferences(
    [file("docs/ai-config-feedback/2026-07-26-note.md", "[`x`](../../skills/verify/SKILL.md) instructs the AC\n")],
    RETIRED,
  );
  assert.deepEqual(shape(refs), [`docs/ai-config-feedback/2026-07-26-note.md:1 relative-link ${VERIFY}`]);
});

// 3 — the regression this feature is built from: the retired path is a
// substring of the path replacing it. nadal's plan on #120 fixed its pointers
// before the sync, so a substring scan would have reported 24 already-correct
// links as stale.

test("a reference to the replacement path is not a reference to the retired one", () => {
  const refs = findReferences(
    [
      file("CLAUDE.md", "[`x`](.claude/skills/verify/SKILL.md) is the new home\n"),
      file("PROJECT.md", "the body now lives at .claude/skills/verify/SKILL.md\n"),
    ],
    RETIRED,
  );
  assert.deepEqual(refs, []);
});

// 4 — a plain mention, which is where a dated record's reference lands.

test("a mention in an inline code span is prose, with its line", () => {
  const refs = findReferences(
    [file("docs/findings.md", "a\n\nthe vendored `skills/verify/SKILL.md` does not mention it\n")],
    RETIRED,
  );
  assert.deepEqual(shape(refs), [`docs/findings.md:3 prose ${VERIFY}`]);
});

// 5 — a pinned citation. It resolves today and must not be re-aimed, which is
// the whole reason the kinds exist.

test("a retired path inside an absolute URL is never a relative link", () => {
  const refs = findReferences(
    [file("PROJECT.md", "[`verify`](https://github.com/o/r/blob/abc1234/skills/verify/SKILL.md) — pinned\n")],
    RETIRED,
  );
  assert.deepEqual(shape(refs), [`PROJECT.md:1 in-url ${VERIFY}`]);
});

// 5b — an autolink is one reference, not two: its visible text *is* its
// destination, and counting both would report the same characters twice.

test("an autolink to a retired path is counted once", () => {
  const refs = findReferences(
    [file("PROJECT.md", "<https://github.com/o/r/blob/abc1234/skills/verify/SKILL.md>\n")],
    RETIRED,
  );
  assert.deepEqual(shape(refs), [`PROJECT.md:1 in-url ${VERIFY}`]);
});

// 6 — both hosts' CLAUDE.md is built entirely out of this: the path is the
// label and the destination, on one line, in two different kinds.

test("one line carrying the label and the destination yields two references", () => {
  const refs = findReferences(
    [file("CLAUDE.md", "[`skills/verify/SKILL.md`](skills/verify/SKILL.md) ·\n")],
    RETIRED,
  );
  assert.deepEqual(shape(refs), [
    `CLAUDE.md:1 relative-link ${VERIFY}`,
    `CLAUDE.md:1 prose ${VERIFY}`,
  ]);
});

// 7 — the parser is the authority on what a link is. Link syntax inside a
// fence is not a link, and a regular expression could not tell.

test("link syntax inside a fenced code block is prose, not a link", () => {
  const refs = findReferences(
    [file("README.md", "text\n\n```\n[x](skills/verify/SKILL.md)\n```\n")],
    RETIRED,
  );
  assert.deepEqual(shape(refs), [`README.md:4 prose ${VERIFY}`]);
});

// 8 — the half Option B bought: code is where a stale path stops being
// cosmetic, and it is reported without a claim about its syntax.

test("a reference in a file that is not markdown is reported as uninterpreted", () => {
  const refs = findReferences(
    [
      file("scripts/summon_reviewer.test.sh", "# read at its source now — and in skills/verify/SKILL.md, which is\n"),
      file("test/tooling/fixture.ts", 'const p = "skills/verify/SKILL.md";\n'),
    ],
    RETIRED,
  );
  assert.deepEqual(shape(refs), [
    `scripts/summon_reviewer.test.sh:1 unparsed ${VERIFY}`,
    `test/tooling/fixture.ts:1 unparsed ${VERIFY}`,
  ]);
});

// 9 — the parser gives a source position for the block and none for the link
// inside it (probed: {sourcepos: true} does not change that). The line has to
// come from a search inside the block's own range.

test("a link on the second line of a paragraph reports the second line", () => {
  const refs = findReferences(
    [file("PROJECT.md", "one\n\nthe firebreak is the stage itself:\n[`implement`](skills/verify/SKILL.md)\nand nothing else\n")],
    RETIRED,
  );
  assert.deepEqual(shape(refs), [`PROJECT.md:4 relative-link ${VERIFY}`]);
});

// 10 — the boundary rule, from the other side: a path character on either
// flank means this is a different path.

test("a mention flanked by path characters is a different path", () => {
  const refs = findReferences(
    [
      file("a.md", "myskills/verify/SKILL.md is not it\n"),
      file("b.md", "skills/verify/SKILL.md.bak is not it either\n"),
      file("c.ts", '"vendor/skills/verify/SKILL.md"\n'),
    ],
    RETIRED,
  );
  assert.deepEqual(refs, []);
});

// 11 — invalid input: nothing to look for, nothing to look in, nothing in it.

test("empty input scans nothing and reports nothing", () => {
  assert.deepEqual(findReferences([file("CLAUDE.md", "[x](skills/verify/SKILL.md)\n")], []), []);
  assert.deepEqual(findReferences([], RETIRED), []);
  assert.deepEqual(findReferences([file("empty.md", ""), file("empty.ts", "")], RETIRED), []);
});

// 12 — duplicates: every occurrence is reported, and the report's own
// rendering is what collapses them into one line number.

test("two occurrences of one target on one line are both reported", () => {
  const refs = findReferences(
    [file("notes.md", "`skills/verify/SKILL.md` and `skills/verify/SKILL.md` again\n")],
    RETIRED,
  );
  assert.deepEqual(shape(refs), [`notes.md:1 prose ${VERIFY}`, `notes.md:1 prose ${VERIFY}`]);
});

// 13 — boundary values: the first character of the first line, the last line
// with no trailing newline, and one retired path that is a prefix of another.

test("occurrences at the edges of a file are found, and a prefix path is not confused", () => {
  const refs = findReferences(
    [
      file("start.md", "skills/verify/SKILL.md leads the line\n"),
      file("end.ts", "// last line, no newline: skills/verify/SKILL.md"),
    ],
    RETIRED,
  );
  assert.deepEqual(shape(refs), [`start.md:1 prose ${VERIFY}`, `end.ts:1 unparsed ${VERIFY}`]);

  const both = findReferences(
    [file("x.md", "`skills/brief/SKILL.md` and `skills/brief/SKILL.md.old`\n")],
    ["skills/brief/SKILL.md", "skills/brief/SKILL.md.old"],
  );
  assert.deepEqual(shape(both), [
    "x.md:1 prose skills/brief/SKILL.md",
    "x.md:1 prose skills/brief/SKILL.md.old",
  ]);
});

// 14 — the stated fallback. A reference-style link's destination is not on the
// line the link is on, so the block's first line is used and that is a
// decision, not an accident.

test("a reference-style link falls back to the block's first line", () => {
  const refs = findReferences(
    [file("CLAUDE.md", "lead\n\nsee [the stage][r] for this\n\n[r]: skills/verify/SKILL.md\n")],
    RETIRED,
  );
  assert.deepEqual(shape(refs), [`CLAUDE.md:3 relative-link ${VERIFY}`]);
});

// 15 — the three exclusions. Each removes noise deuce itself created.

test("excluded files are not scanned at all", () => {
  const files = [
    file("skills/verify/SKILL.md", "this body links to [x](skills/verify/SKILL.md)\n"),
    file("config/vendoring-receipt.md", "| `skills/verify/SKILL.md` | abc |\n"),
    file("AGENTS.md", "read [x](skills/verify/SKILL.md)\n"),
    file("CLAUDE.md", "read [x](skills/verify/SKILL.md)\n"),
  ];
  const excluded = new Set(["skills/verify/SKILL.md", "config/vendoring-receipt.md", "AGENTS.md"]);
  assert.deepEqual(shape(findReferences(files, RETIRED, excluded)), [
    `CLAUDE.md:1 relative-link ${VERIFY}`,
  ]);
});

test("the exclusion set is the retired paths, the written paths, and the receipt", () => {
  const excluded = excludedPaths(
    ["skills/verify/SKILL.md", "skills/assess/SKILL.md"],
    ["AGENTS.md", ".claude/skills/verify/SKILL.md"],
    "config/vendoring-receipt.md",
  );
  assert.deepEqual([...excluded].sort(), [
    ".claude/skills/verify/SKILL.md",
    "AGENTS.md",
    "config/vendoring-receipt.md",
    "skills/assess/SKILL.md",
    "skills/verify/SKILL.md",
  ]);
});
