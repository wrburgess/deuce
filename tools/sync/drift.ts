// The drift report: every contract file whose checksum says the host edited
// it since the receipt was written (Chapter 5, *The sync*). Drift is reported,
// never resolved — the sync branch carries upstream state, and the report is
// what makes merging a decision about the host's edit rather than an accident
// over it. A first sync has no baseline, and that is a distinct state, never
// an empty report.

import { createHash } from "node:crypto";
import { existsSync, lstatSync, readFileSync, readlinkSync } from "node:fs";
import { join } from "node:path";
import type { Receipt } from "./receipt.ts";

export interface DriftedFile {
  path: string;
  state: "edited" | "removed";
}

export type DriftReport =
  | { kind: "no-baseline" }
  | { kind: "report"; drifted: DriftedFile[]; cleanCount: number };

export function sha256Hex(content: Buffer): string {
  return createHash("sha256").update(content).digest("hex");
}

// A symlink's identity is its target string — the same content the tree
// records and the receipt checksummed at shipping time.
function hostContent(hostRoot: string, path: string): Buffer | undefined {
  const target = join(hostRoot, path);
  if (!existsSync(target) && !isSymlink(target)) return undefined;
  if (isSymlink(target)) return Buffer.from(readlinkSync(target), "utf8");
  return readFileSync(target);
}

function isSymlink(p: string): boolean {
  try {
    return lstatSync(p).isSymbolicLink();
  } catch {
    return false;
  }
}

export function computeDrift(hostRoot: string, receipt: Receipt | undefined): DriftReport {
  if (!receipt) return { kind: "no-baseline" };
  const drifted: DriftedFile[] = [];
  let cleanCount = 0;
  for (const { path, sha256 } of receipt.checksums) {
    const content = hostContent(hostRoot, path);
    if (content === undefined) {
      drifted.push({ path, state: "removed" });
      continue;
    }
    if (sha256Hex(content) !== sha256) {
      drifted.push({ path, state: "edited" });
      continue;
    }
    cleanCount++;
  }
  return { kind: "report", drifted, cleanCount };
}
