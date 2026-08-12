import { test } from "node:test";
import assert from "node:assert/strict";
import { checkLinks } from "./links.ts";
import type { MarkdownFile } from "./markdown.ts";

const files = (entries: Record<string, string>): MarkdownFile[] =>
  Object.entries(entries).map(([path, content]) => ({ path, content }));

const existsIn =
  (...paths: string[]) =>
  (path: string) =>
    paths.includes(path);

test("a resolving link and a resolving anchor pass", () => {
  const set = files({
    "a.md": "[to b](b.md) and [to section](b.md#the-section)",
    "b.md": "# The Section\n",
  });
  const result = checkLinks(set, existsIn("a.md", "b.md"));
  assert.deepEqual(result.violations, []);
  assert.equal(result.guard, null);
  assert.equal(result.internalChecked, 2);
});

test("a dangling file target is rejected, naming the file and the target", () => {
  const set = files({ "a.md": "[gone](missing.md)" });
  const result = checkLinks(set, existsIn("a.md"));
  assert.equal(result.violations.length, 1);
  assert.match(result.violations[0]!, /a\.md/);
  assert.match(result.violations[0]!, /missing\.md/);
});

test("a dangling anchor on an existing file is rejected", () => {
  const set = files({
    "a.md": "[wrong](b.md#not-there)",
    "b.md": "# Only This\n",
  });
  const result = checkLinks(set, existsIn("a.md", "b.md"));
  assert.equal(result.violations.length, 1);
  assert.match(result.violations[0]!, /#not-there/);
});

test("a relative link resolves against its own file's directory", () => {
  const set = files({
    "config/x.md": "[chapter](../sds/00.md#a-heading)",
    "sds/00.md": "# A Heading\n",
  });
  const result = checkLinks(set, existsIn("config/x.md", "sds/00.md"));
  assert.deepEqual(result.violations, []);
});

test("a same-file fragment checks against the file's own headings", () => {
  const set = files({ "a.md": "# Here\n\n[up](#here) and [gone](#missing)" });
  const result = checkLinks(set, existsIn("a.md"));
  assert.equal(result.violations.length, 1);
  assert.match(result.violations[0]!, /#missing/);
});

test("duplicate headings resolve through GitHub's -1 suffix", () => {
  const set = files({
    "a.md": "[second](b.md#hi-1)",
    "b.md": "# Hi\n\n# Hi\n",
  });
  assert.deepEqual(checkLinks(set, existsIn("a.md", "b.md")).violations, []);
});

test("a fragment must match the slug exactly — GitHub anchors are lowercase", () => {
  const set = files({
    "a.md": "[wrong case](b.md#The-Section)",
    "b.md": "# The Section\n",
  });
  assert.equal(checkLinks(set, existsIn("a.md", "b.md")).violations.length, 1);
});

test("a directory target that exists passes", () => {
  const set = files({ "CLAUDE.md": "[the standard](sds/)" });
  assert.deepEqual(checkLinks(set, existsIn("CLAUDE.md", "sds")).violations, []);
});

test("external links are skipped and counted, never probed", () => {
  const set = files({
    "a.md": "[web](https://example.com) [mail](mailto:x@y.z) [local](b.md)",
    "b.md": "b\n",
  });
  const result = checkLinks(set, existsIn("a.md", "b.md"));
  assert.deepEqual(result.violations, []);
  assert.equal(result.externalSkipped, 2);
  assert.equal(result.internalChecked, 1);
});

test("a link escaping the repository is rejected", () => {
  const set = files({ "docs/x.md": "[out](../../PROJECT.md)" });
  const result = checkLinks(set, () => true);
  assert.equal(result.violations.length, 1);
  assert.match(result.violations[0]!, /outside the repository/);
});

test("a fragment on a target outside the tracked markdown set is rejected", () => {
  const set = files({ "a.md": "[odd](script.ts#anchor)" });
  const result = checkLinks(set, existsIn("a.md", "script.ts"));
  assert.equal(result.violations.length, 1);
  assert.match(result.violations[0]!, /outside the tracked markdown set/);
});

test("zero links across all files is the fail-open guard, never a green", () => {
  const set = files({ "a.md": "no links here\n", "b.md": "none here either\n" });
  const result = checkLinks(set, () => true);
  assert.notEqual(result.guard, null);
  assert.match(result.guard!, /zero links/);
});

test("a file with no links stays green while other files' links are counted — the guard sits on links, not files", () => {
  const set = files({ "empty.md": "prose only\n", "a.md": "[b](b.md)", "b.md": "b\n" });
  const result = checkLinks(set, existsIn("empty.md", "a.md", "b.md"));
  assert.equal(result.guard, null);
  assert.equal(result.internalChecked, 1);
});
