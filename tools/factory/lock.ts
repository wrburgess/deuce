// The pass lock: one directory, claimed by an atomic mkdir.
//
// Canon's floor is that passes do not overlap (Chapter 6, *The factory pass*).
// A check-then-create would leave the window between the two open, so the claim
// *is* the check: mkdir either creates the directory or fails because someone
// else already did. Kept in its own file so the atomicity can be tested against
// a real filesystem rather than asserted about one.

import { mkdirSync, rmSync, statSync } from "node:fs";

export function claim(path: string): boolean {
  try {
    mkdirSync(path);
    return true;
  } catch {
    return false;
  }
}

// Only ever called by the pass that claimed it. A lock this pass did not take
// is reported and left alone (config/factory.md, *No two passes at once*):
// removing it would start the second concurrent pass the floor exists to
// prevent.
export function release(path: string): void {
  rmSync(path, { recursive: true, force: true });
}

export function takenAt(path: string): Date | null {
  try {
    return statSync(path).birthtime;
  } catch {
    return null;
  }
}
