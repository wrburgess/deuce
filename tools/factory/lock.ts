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

// Kills whatever is left of the pass's process group, and reports whether there
// was anything to kill.
//
// It lives beside the lock because it defends the same floor. Releasing the lock
// while a stage's children are still running would let the next pass start
// alongside them — the overlap the lock exists to prevent, arriving through the
// one path the lock cannot see. Node's spawn timeout signals the direct child
// only, so the pass is spawned into its own process group and the group is what
// gets reaped.
//
// SIGTERM-then-SIGKILL would be the polite form and is deliberately not used:
// this runs only after the pass has already ended or been killed at its
// deadline, so anything alive here has outlived the thing that owned it, and a
// grace period is just a further window in which it keeps writing.
export function reapGroup(pid: number | undefined): boolean {
  // A pid of 0 or -1 would signal *this* process's group or every process the
  // user owns. Refused by name rather than trusted not to arrive.
  if (pid === undefined || !Number.isInteger(pid) || pid <= 1) return false;
  try {
    // Signal 0 asks whether the group exists without touching it.
    process.kill(-pid, 0);
  } catch {
    return false;
  }
  try {
    process.kill(-pid, "SIGKILL");
    return true;
  } catch {
    return false;
  }
}
