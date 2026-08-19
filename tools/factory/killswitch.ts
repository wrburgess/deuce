// Reading the kill switch — the one act that stops everything
// (Chapter 6, *The kill switch*).
//
// It gets its own module for the reason credential.ts has one: run.ts calls
// main() at import, so nothing a test needs can live there, and preflight.ts is
// deliberately free of the filesystem so every verdict stays measurable without
// one.
//
// Three states, not two, and the third is the whole point. `existsSync` answers
// a different question than the one being asked: it returns false for *absent*
// and equally for "the path or an ancestor could not be read", so a permission
// change or an I/O error on the switch reads exactly like the HC not having
// thrown it — and the wrapper would spawn an unattended pass while unable to
// establish that the emergency stop was clear. Found by the contractor review's
// second read on PR #136.
//
// Fails closed by construction: only a definite ENOENT is `absent`, and every
// other outcome is `unreadable`, which starts nothing.

import { statSync } from "node:fs";

export type SwitchState = "present" | "absent" | "unreadable";

export function readSwitch(path: string): SwitchState {
  try {
    statSync(path);
    return "present";
  } catch (err) {
    // ENOENT is the only error that means what the caller wants to hear. ENOTDIR
    // rides with it: a path whose ancestor is a file cannot exist, and that is
    // an answer rather than an uncertainty.
    const code = (err as NodeJS.ErrnoException).code;
    return code === "ENOENT" || code === "ENOTDIR" ? "absent" : "unreadable";
  }
}
