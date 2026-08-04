// The prerequisite probe for a check's `requires` field.
//
// `requires` names the executable a check needs. Asking whether that path
// *exists* answers a different question: a directory, a non-executable file,
// and a real binary are all present. The gate then runs the check anyway, the
// command exits 126 or 127, and the run reports "a check failed" for a gate
// that could not run — which is the proxy defect the declaration says this
// field exists to avoid, surviving one level tighter.
//
// Two conditions, and both are needed. X_OK alone is not enough: on a
// directory it means "traversable" and succeeds, so the file check has to come
// first. statSync follows symlinks, which is required rather than incidental —
// every entry under node_modules/.bin is one.
//
// Raised by the contractor review of 4576409.

import { accessSync, constants, statSync } from "node:fs";

export function isExecutable(path: string): boolean {
  try {
    if (!statSync(path).isFile()) return false;
    accessSync(path, constants.X_OK);
    return true;
  } catch {
    // Missing, dangling, or unreadable — none of them is an executable, and
    // the gate's response to all three is the same.
    return false;
  }
}
