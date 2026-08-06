// The vendoring receipt (Chapter 5, *The vendoring receipt*): the deuce commit
// a host vendored, the date, and a checksum per contract file. Written by the
// sync, never by hand; parseable whole because it is machine-read whole. An
// absent receipt is the first-sync state — a different thing from a malformed
// one, and the two are never collapsed (ADR 0014's argument, applied here).

import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { parseFrontmatter } from "../gate/declaration.ts";

export interface ReceiptChecksum {
  path: string;
  sha256: string;
}

export interface Receipt {
  commit: string;
  date: string;
  checksums: ReceiptChecksum[];
}

export type ReceiptState =
  | { kind: "first-sync" }
  | { kind: "receipt"; receipt: Receipt };

const TOP_LEVEL = new Set(["commit", "date", "checksums"]);
const ITEM_FIELDS = new Set(["path", "sha256"]);
const SHA256 = /^[0-9a-f]{64}$/;

export function parseReceipt(markdown: string): Receipt {
  const { scalars, lists } = parseFrontmatter(markdown);

  for (const key of [...scalars.keys(), ...lists.keys()]) {
    if (!TOP_LEVEL.has(key)) {
      throw new Error(
        `receipt carries an unrecognized key '${key}' — the schema defines ` +
          `${[...TOP_LEVEL].map((k) => `'${k}'`).join(", ")} and nothing else`,
      );
    }
  }

  const commit = scalars.get("commit");
  const date = scalars.get("date");
  if (!commit || !date) {
    throw new Error("receipt carries no 'commit'/'date' — a receipt without provenance is not one");
  }

  const raw = lists.get("checksums");
  if (raw === undefined) {
    throw new Error("receipt carries no 'checksums' key — nothing can be drift-checked against it");
  }

  const seen = new Set<string>();
  const checksums: ReceiptChecksum[] = raw.map((entry, i) => {
    for (const key of entry.keys()) {
      if (!ITEM_FIELDS.has(key)) {
        throw new Error(`checksum item ${i + 1} carries an unrecognized field '${key}'`);
      }
    }
    const path = entry.get("path");
    const sha256 = entry.get("sha256");
    if (!path || !sha256) {
      throw new Error(`checksum item ${i + 1} is missing a field — each carries path, sha256`);
    }
    if (!SHA256.test(sha256)) {
      throw new Error(`checksum for '${path}' is not a sha256 hex digest and is refused`);
    }
    if (seen.has(path)) {
      throw new Error(`receipt lists '${path}' twice`);
    }
    seen.add(path);
    return { path, sha256 };
  });

  return { commit, date, checksums };
}

// The receipt's directory may not exist on a host that never had a config/ —
// the first live run against bryce hit exactly that.
export function writeReceipt(hostRoot: string, receiptPath: string, receipt: Receipt): void {
  const target = join(hostRoot, receiptPath);
  mkdirSync(dirname(target), { recursive: true });
  writeFileSync(target, formatReceipt(receipt));
}

export function formatReceipt(receipt: Receipt): string {
  const items = receipt.checksums
    .map((c) => `  - path: ${c.path}\n    sha256: ${c.sha256}`)
    .join("\n");
  return [
    "---",
    `commit: ${receipt.commit}`,
    `date: ${receipt.date}`,
    "checksums:",
    items,
    "---",
    "",
    "# Vendoring receipt",
    "",
    "The deuce commit this repository vendored, the date, and a checksum per contract file —",
    "written by the sync, never by hand, and re-written by every sync that merges",
    "([Chapter 5](https://github.com/wrburgess/deuce/blob/main/sds/05-distribution.md) →",
    "*The vendoring receipt*). A checksum mismatch against a contract file is drift: visible,",
    "never forbidden, reported on every sync pull request.",
    "",
  ].join("\n");
}
