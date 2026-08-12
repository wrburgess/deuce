import { test } from "node:test";
import assert from "node:assert/strict";
import {
  parse,
  linkDestinations,
  headingSlugs,
  inlineCodeSpans,
  textOf,
} from "./markdown.ts";

test("link and image destinations are collected in document order", () => {
  const doc = "[a](x.md) then ![img](pic.png) then [b](y.md#frag)";
  assert.deepEqual(linkDestinations(parse(doc)), ["x.md", "pic.png", "y.md#frag"]);
});

test("a link inside a GFM table row is still a link", () => {
  const doc = "| col |\n|---|\n| [a](x.md) |\n";
  assert.deepEqual(linkDestinations(parse(doc)), ["x.md"]);
});

test("a reference-style link resolves to its destination", () => {
  const doc = "[a][ref]\n\n[ref]: x.md\n";
  assert.deepEqual(linkDestinations(parse(doc)), ["x.md"]);
});

test("link syntax inside a code fence is not a link", () => {
  const doc = "```\n[a](x.md)\n```\nand `[b](y.md)` inline\n";
  assert.deepEqual(linkDestinations(parse(doc)), []);
});

test("heading slugs match GitHub's function — punctuation stripped, nothing collapsed", () => {
  const slugs = headingSlugs(parse("## Verify's external half, now written\n"));
  assert.ok(slugs.has("verifys-external-half-now-written"));
});

test("duplicate headings get GitHub's -1 suffix", () => {
  const slugs = headingSlugs(parse("# Hi\n\n# Hi\n"));
  assert.ok(slugs.has("hi"));
  assert.ok(slugs.has("hi-1"));
});

test("a heading carrying a code span slugs on its visible text", () => {
  const slugs = headingSlugs(parse("## The `assess` Skill\n"));
  assert.ok(slugs.has("the-assess-skill"));
});

test("inline code spans are collected; fenced and indented blocks are not", () => {
  const doc = "a `required` span\n\n```\nattested\n```\n\n    delegated\n";
  assert.deepEqual(inlineCodeSpans(parse(doc)), ["required"]);
});

test("textOf flattens emphasis and code to visible text", () => {
  const root = parse("## A **bold** and `coded` heading\n");
  let heading = root.firstChild!;
  assert.equal(textOf(heading), "A bold and coded heading");
});
