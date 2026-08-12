// Receipt assembly for the orchestrator, separated so the gate can test it.

import type { Manifest } from "./manifest.ts";
import type { Receipt, ReceiptChecksum } from "./receipt.ts";

// A receipt path the whole manifest no longer names is a retirement: deuce
// shipped it once, and this sync removes it (#117). Judged against every
// entry of every class, never the ship set — a selected-system sync must not
// retire out-of-scope paths, and a class change is not a retirement. The one
// exception is held back by name: a receipt path under a host-class directory
// (receipts are hand-editable in the field, and nadal's was) — deuce never
// shipped into host territory, so a removal there is never the sync's to plan.
export interface RetirementPlan {
  retired: string[]; // removal planned; the report names each with its state
  heldBack: string[]; // host-territory receipt paths — dropped, never removed
}

export function planRetirements(
  prior: Receipt | undefined,
  manifest: Manifest,
): RetirementPlan {
  if (!prior) return { retired: [], heldBack: [] };
  const declared = new Set(manifest.entries.map((e) => e.path));
  const hostDirs = manifest.entries
    .filter((e) => e.class === "host" && e.path.endsWith("/"))
    .map((e) => e.path);
  const retired: string[] = [];
  const heldBack: string[] = [];
  for (const { path } of prior.checksums) {
    if (declared.has(path)) continue;
    if (hostDirs.some((dir) => path.startsWith(dir))) {
      heldBack.push(path);
      continue;
    }
    retired.push(path);
  }
  return { retired, heldBack };
}

// A partial (selected-system) sync must not shrink the receipt: canon requires
// a checksum per contract file, and a baseline lost is drift made invisible
// (PR #92's review). Prior checksums survive for every path the manifest still
// declares contract; shipped checksums overwrite; undeclared paths drop —
// planRetirements removes the dropped path in the same run, which is what
// keeps the drop from stranding a stale copy with no signal (#117).
export function mergeReceiptChecksums(
  prior: Receipt | undefined,
  manifest: Manifest,
  shipped: ReceiptChecksum[],
): ReceiptChecksum[] {
  const stillContract = new Set(
    manifest.entries.filter((e) => e.class === "contract").map((e) => e.path),
  );
  const merged = new Map<string, string>();
  if (prior) {
    for (const c of prior.checksums) {
      if (stillContract.has(c.path)) merged.set(c.path, c.sha256);
    }
  }
  for (const c of shipped) merged.set(c.path, c.sha256);
  return [...merged].map(([path, sha256]) => ({ path, sha256 }));
}
