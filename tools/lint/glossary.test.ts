import { test } from "node:test";
import assert from "node:assert/strict";
import { checkGlossary } from "./glossary.ts";
import type { MarkdownFile } from "./markdown.ts";

const glossary = (body: string): MarkdownFile => ({
  path: "GLOSSARY.md",
  content: `# Glossary\n\nA preamble paragraph with no bold lead.\n\n${body}`,
});

const canon = (...contents: string[]): MarkdownFile[] =>
  contents.map((content, i) => ({ path: `sds/0${i}-x.md`, content }));

test("every term found in canon reports nothing", () => {
  const result = checkGlossary(
    glossary("**Readout** — the shape.\n\n**Stop** — the pause.\n"),
    canon("A Readout is posted.", "A stop is a pause."),
  );
  assert.deepEqual(result.reports, []);
  assert.equal(result.guard, null);
  assert.equal(result.terms, 2);
});

test("matching is case-insensitive — a stop matches Stop", () => {
  const result = checkGlossary(
    glossary("**Hygiene sweep** — the re-verification.\n"),
    canon("the hygiene sweep re-verifies config/."),
  );
  assert.deepEqual(result.reports, []);
});

test("an absent term is reported as a staleness signal, never a violation", () => {
  const result = checkGlossary(
    glossary("**Freeze** — a minted term.\n"),
    canon("No such word here."),
  );
  assert.equal(result.reports.length, 1);
  assert.match(result.reports[0]!, /'Freeze'/);
  assert.match(result.reports[0]!, /staleness signal/);
  assert.match(result.reports[0]!, /not a defect/);
});

test("a term occurring only inside another word is absent — 'AI' inside 'plain' is not an occurrence", () => {
  const result = checkGlossary(glossary("**AI** — the collaborator half.\n"), canon("plain prose only."));
  assert.equal(result.reports.length, 1);
  assert.match(result.reports[0]!, /'AI'/);
});

test("an inflected occurrence still counts — Readout matches Readouts", () => {
  const result = checkGlossary(
    glossary("**Readout** — the shape.\n"),
    canon("Two Readouts were posted."),
  );
  assert.deepEqual(result.reports, []);
});

test("zero terms parsed is the fail-open guard, never a green", () => {
  const result = checkGlossary(glossary("No bold-led paragraphs at all.\n"), canon("x"));
  assert.notEqual(result.guard, null);
  assert.match(result.guard!, /zero entry terms/);
});

test("zero canon files is the fail-open guard on the other side", () => {
  const result = checkGlossary(glossary("**Readout** — the shape.\n"), []);
  assert.notEqual(result.guard, null);
  assert.match(result.guard!, /zero canon files/);
});
