import { test } from "node:test";
import assert from "node:assert/strict";
import { planRetirements } from "./run-helpers.ts";
import type { Manifest } from "./manifest.ts";
import type { Receipt } from "./receipt.ts";

// The retirement judgment (#117) is a set difference over the prior receipt
// and the whole manifest — every entry of every class, never the ship set.

const MANIFEST: Manifest = {
  date: "d",
  source: "s",
  entries: [
    { path: ".claude/skills/assess/SKILL.md", class: "contract", system: "lifecycle" },
    { path: "labels.yml", class: "seed", system: "tracking" },
    { path: "config/", class: "host", system: "all" },
    { path: "CLAUDE.md", class: "host", system: "all" },
  ],
};

function receipt(paths: string[]): Receipt {
  return {
    commit: "c",
    date: "d",
    checksums: paths.map((path) => ({ path, sha256: "a".repeat(64) })),
  };
}

test("a receipt path no manifest entry names is retired", () => {
  const plan = planRetirements(receipt(["skills/assess/SKILL.md"]), MANIFEST);
  assert.deepEqual(plan.retired, ["skills/assess/SKILL.md"]);
  assert.deepEqual(plan.heldBack, []);
});

test("a declared path of any class survives — a class change is not a retirement", () => {
  // labels.yml sits in the receipt as a prior contract checksum; the manifest
  // now declares it seed. Still declared, so nothing is removed. The same
  // membership test covers a path whose system a selected sync did not ship:
  // the whole manifest decides, never the ship set.
  const plan = planRetirements(
    receipt([".claude/skills/assess/SKILL.md", "labels.yml", "CLAUDE.md"]),
    MANIFEST,
  );
  assert.deepEqual(plan.retired, []);
  assert.deepEqual(plan.heldBack, []);
});

test("a receipt path under a host-class directory is held back, never retired", () => {
  const plan = planRetirements(
    receipt(["config/vendoring-receipt.md", "skills/old.md"]),
    MANIFEST,
  );
  assert.deepEqual(plan.retired, ["skills/old.md"]);
  assert.deepEqual(plan.heldBack, ["config/vendoring-receipt.md"]);
});

test("a first sync has no receipt and therefore nothing to retire", () => {
  const plan = planRetirements(undefined, MANIFEST);
  assert.deepEqual(plan.retired, []);
  assert.deepEqual(plan.heldBack, []);
});
