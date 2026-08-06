// Receipt assembly for the orchestrator, separated so the gate can test it.

import type { Manifest } from "./manifest.ts";
import type { Receipt, ReceiptChecksum } from "./receipt.ts";

// A partial (selected-system) sync must not shrink the receipt: canon requires
// a checksum per contract file, and a baseline lost is drift made invisible
// (PR #92's review). Prior checksums survive for every path the manifest still
// declares contract; shipped checksums overwrite; undeclared paths drop.
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
