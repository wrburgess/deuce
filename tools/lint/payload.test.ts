import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { parseManifest } from "../sync/manifest.ts";
import { checkPayloadLinks } from "./payload.ts";
import { trackedMarkdown } from "./markdown.ts";
import type { MarkdownFile } from "./markdown.ts";

const REAL_MANIFEST = readFileSync(
  new URL("../../config/payload.md", import.meta.url),
  "utf8",
);

// A manifest fixture: one line per entry, in the grammar declaration.ts
// defines. Kept as text rather than an object literal so the tests exercise
// the same reader the gate does.
function manifest(...entries: Array<[string, string, string]>): ReturnType<typeof parseManifest> {
  const items = entries
    .map(([path, cls, system]) => `  - path: ${path}\n    class: ${cls}\n    system: ${system}`)
    .join("\n");
  return parseManifest(
    ["---", "date: 2026-08-17", "source: a test", "payload:", items, "---", "", "body"].join("\n"),
  );
}

const files = (entries: Record<string, string>): MarkdownFile[] =>
  Object.entries(entries).map(([path, content]) => ({ path, content }));

test("a shipped file linking only shipped paths passes", () => {
  const result = checkPayloadLinks(
    manifest(["a/one.md", "contract", "lifecycle"], ["a/two.md", "contract", "lifecycle"]),
    files({ "a/one.md": "[two](two.md)", "a/two.md": "[one](one.md)" }),
  );
  assert.deepEqual(result.violations, []);
  assert.deepEqual(result.crossSystem, []);
  assert.equal(result.guard, null);
  assert.equal(result.internalChecked, 2);
});

test("a link to a host-class path is a violation, naming the file and the target", () => {
  const result = checkPayloadLinks(
    manifest(["a/one.md", "contract", "lifecycle"], ["config/", "host", "all"]),
    files({ "a/one.md": "read [`config/gates.md`](../config/gates.md)" }),
  );
  assert.equal(result.violations.length, 1);
  assert.match(result.violations[0]!, /a\/one\.md/);
  assert.match(result.violations[0]!, /config\/gates\.md/);
});

test("a link to a path the manifest never names is a violation", () => {
  const result = checkPayloadLinks(
    manifest(["a/one.md", "contract", "lifecycle"]),
    files({ "a/one.md": "[nowhere](../rules/authoring.md)" }),
  );
  assert.equal(result.violations.length, 1);
  assert.match(result.violations[0]!, /rules\/authoring\.md/);
});

test("an anchor-only link resolves against its own file and is not a violation", () => {
  const result = checkPayloadLinks(
    manifest(["a/one.md", "contract", "lifecycle"]),
    files({ "a/one.md": "# The Readout\n\n[up](#the-readout)" }),
  );
  assert.deepEqual(result.violations, []);
  assert.equal(result.internalChecked, 1);
});

test("an external link is counted and never probed", () => {
  const result = checkPayloadLinks(
    manifest(["a/one.md", "contract", "lifecycle"], ["a/two.md", "contract", "lifecycle"]),
    files({
      "a/one.md": "[canon](https://github.com/wrburgess/deuce/blob/main/sds/00.md) and [two](two.md)",
      "a/two.md": "[one](one.md)",
    }),
  );
  assert.deepEqual(result.violations, []);
  assert.equal(result.externalSkipped, 1);
  assert.equal(result.internalChecked, 2);
});

test("a fragment on a shipped target resolves, and a missing heading does not", () => {
  const declared = manifest(
    ["a/one.md", "contract", "lifecycle"],
    ["a/two.md", "contract", "lifecycle"],
  );
  const good = checkPayloadLinks(
    declared,
    files({ "a/one.md": "[there](two.md#a-heading)", "a/two.md": "# A Heading\n" }),
  );
  assert.deepEqual(good.violations, []);

  const bad = checkPayloadLinks(
    declared,
    files({ "a/one.md": "[there](two.md#not-there)", "a/two.md": "# A Heading\n" }),
  );
  assert.equal(bad.violations.length, 1);
  assert.match(bad.violations[0]!, /#not-there/);
});

test("a link escaping the repository is a violation, named as escaping", () => {
  const result = checkPayloadLinks(
    manifest(["a/one.md", "contract", "lifecycle"]),
    files({ "a/one.md": "[out](../../elsewhere.md)" }),
  );
  assert.equal(result.violations.length, 1);
  assert.match(result.violations[0]!, /outside the repository/);
});

test("the same dead link twice in one file is two violations — the count is the walk", () => {
  const result = checkPayloadLinks(
    manifest(["a/one.md", "contract", "lifecycle"]),
    files({ "a/one.md": "[x](../config/models.md) then again [x](../config/models.md)" }),
  );
  assert.equal(result.violations.length, 2);
});

// A host may adopt one system without the rest, so a link dead for that host
// is dead. Reported without failing in the first draft; raised as a must-fix
// by the contractor review on PR #133 under *does this check measure the
// invariant it claims, or a proxy for it?*
test("a lifecycle file linking a review path fails, naming the adoption that breaks", () => {
  const result = checkPayloadLinks(
    manifest(
      ["a/one.md", "contract", "lifecycle"],
      ["tools/review/summon.ts", "seed", "review"],
    ),
    files({ "a/one.md": "[summon](../tools/review/summon.ts)" }),
  );
  // The aggregate walk cannot see it — that is exactly why it is separate.
  assert.deepEqual(result.violations, []);
  assert.equal(result.crossSystem.length, 1);
  assert.match(result.crossSystem[0]!, /system 'lifecycle' alone/);
  assert.match(result.crossSystem[0]!, /summon\.ts/);
  assert.deepEqual(result.systems, ["lifecycle", "review"]);
});

test("a contract file linking a seed path resolves — both ship", () => {
  const result = checkPayloadLinks(
    manifest(["a/one.md", "contract", "all"], ["tools/gate/run.ts", "seed", "all"]),
    files({ "a/one.md": "[gate](../tools/gate/run.ts)" }),
  );
  assert.deepEqual(result.violations, []);
  assert.deepEqual(result.crossSystem, []);
});

test("a payload with no shipped markdown guards rather than greening", () => {
  const result = checkPayloadLinks(
    manifest(["tools/gate/run.ts", "seed", "all"], ["config/", "host", "all"]),
    files({ "config/payload.md": "[x](x.md)" }),
  );
  assert.notEqual(result.guard, null);
  assert.match(result.guard!, /never report green/);
  assert.deepEqual(result.violations, []);
});

test("shipped markdown carrying zero links guards rather than greening", () => {
  const result = checkPayloadLinks(
    manifest(["a/one.md", "contract", "lifecycle"]),
    files({ "a/one.md": "no links here at all\n" }),
  );
  assert.notEqual(result.guard, null);
  assert.match(result.guard!, /zero links/);
});

test("a system whose shipped markdown carries no links is skipped without crashing", () => {
  const result = checkPayloadLinks(
    manifest(
      ["a/one.md", "contract", "lifecycle"],
      ["a/two.md", "contract", "lifecycle"],
      ["b/quiet.md", "contract", "tracking"],
    ),
    files({
      "a/one.md": "[two](two.md)",
      "a/two.md": "[one](one.md)",
      "b/quiet.md": "a shipped document with no links\n",
    }),
  );
  assert.equal(result.guard, null);
  assert.deepEqual(result.violations, []);
  assert.deepEqual(result.crossSystem, []);
  assert.deepEqual(result.systems, ["lifecycle", "tracking"]);
});

test("a declared markdown path the tree does not carry guards rather than greening", () => {
  // Without the check, a/one.md's link to two.md resolves — two.md is
  // declared — and the walk reports green over a file it never opened.
  const result = checkPayloadLinks(
    manifest(["a/one.md", "contract", "lifecycle"], ["a/two.md", "contract", "lifecycle"]),
    files({ "a/one.md": "[two](two.md)" }),
  );
  assert.notEqual(result.guard, null);
  assert.match(result.guard!, /a\/two\.md/);
  assert.match(result.guard!, /the manifest and the tree disagree/);
  assert.deepEqual(result.violations, []);
});

test("a shipped directory entry and a link to it compare as the same path", () => {
  const result = checkPayloadLinks(
    manifest(["a/one.md", "contract", "all"], ["tools/", "seed", "all"]),
    files({ "a/one.md": "the tooling lives in [tools](../tools/)" }),
  );
  assert.equal(result.guard, null);
  assert.deepEqual(result.violations, []);
});

// The regression that would have caught #121, and the one that keeps it
// caught. Red before the shipped Skills were edited — 24 violations, the
// number measured on bryce and nadal — and green after.
test("the real manifest against the real tree — every shipped link resolves", () => {
  const result = checkPayloadLinks(parseManifest(REAL_MANIFEST), trackedMarkdown());
  assert.equal(result.guard, null);
  assert.deepEqual(result.violations, []);
});
