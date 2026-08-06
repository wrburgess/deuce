import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { parseManifest, shipSet } from "./manifest.ts";

const REAL = readFileSync(new URL("../../config/payload.md", import.meta.url), "utf8");

function fixture(items: string): string {
  return ["---", "date: 2026-08-06", "source: a test", "payload:", items, "---", "", "body"].join("\n");
}

test("the real manifest parses whole — 46 entries, three classes", () => {
  const m = parseManifest(REAL);
  assert.equal(m.entries.length, 46);
  assert.equal(m.entries.filter((e) => e.class === "contract").length, 16);
  assert.equal(m.entries.filter((e) => e.class === "seed").length, 26);
  assert.equal(m.entries.filter((e) => e.class === "host").length, 4);
});

test("an unrecognized top-level key is refused by name", () => {
  const md = "---\ndate: x\nsource: y\nextras:\n  - path: a\n    class: seed\n    system: all\n---\n";
  assert.throws(() => parseManifest(md), /unrecognized key 'extras'/);
});

test("an unrecognized class is refused, naming the path and the closed set", () => {
  const md = fixture("  - path: a\n    class: vendored\n    system: all");
  assert.throws(() => parseManifest(md), /class 'vendored'.*contract, seed, host/s);
});

test("a missing item field is refused", () => {
  const md = fixture("  - path: a\n    class: seed");
  assert.throws(() => parseManifest(md), /missing a field/);
});

test("a duplicate path is refused — one class per path", () => {
  const md = fixture(
    "  - path: a\n    class: seed\n    system: all\n  - path: a\n    class: contract\n    system: all",
  );
  assert.throws(() => parseManifest(md), /'a' twice/);
});

test("an unrecognized item field is refused by name", () => {
  const md = fixture("  - path: a\n    class: seed\n    system: all\n    owner: me");
  assert.throws(() => parseManifest(md), /unrecognized field 'owner'/);
});

test("host entries never ship; empty selection ships everything else", () => {
  const m = parseManifest(REAL);
  const all = shipSet(m, []);
  assert.equal(all.length, 42);
  assert.ok(all.every((e) => e.class !== "host"));
});

test("a system selection ships S plus all", () => {
  const m = parseManifest(REAL);
  const gate = shipSet(m, ["gate"]);
  assert.ok(gate.some((e) => e.path === "tools/gate/run.ts"));
  assert.ok(gate.some((e) => e.path === "package.json"), "system 'all' rides every selection");
  assert.ok(!gate.some((e) => e.path === "AGENTS.md"), "'review' does not ride a 'gate' selection");
});
