// What the armed agent needs to find on the PATH it carries, and whether that
// PATH actually finds it.
//
// Kept apart from install.ts for the reason credential.ts is kept apart from
// credential-run.ts: install.ts runs main() at import, so anything a test needs
// to import cannot live there.
//
// Why the check exists at all. `bin/factory-install` captures the installer's
// PATH into the launchd agent, because launchd's own environment holds neither
// the version-managed node nor the homebrew claude. That capture is a snapshot:
// a runtime upgrade or a version-manager change can move either one, and then
// the trigger fires at 07:47, launchd fails the exec, and run.ts never runs — so
// nothing posts a death notice and nothing posts a run record. The failure is
// silent in the one place silence is worst, which is the whole reason the
// deadline and the death notice exist (PR #136's review).

import { accessSync, constants, statSync } from "node:fs";
import { join } from "node:path";

// The wrapper's shim is `exec node tools/factory/run.ts`, and the pass it starts
// is `claude`. Both are looked up through PATH at run time, so both are checked
// at arm time.
export const NEEDED_ON_PATH = ["node", "claude"];

export function resolvesOnPath(name: string, path: string): boolean {
  for (const dir of path.split(":")) {
    // An empty entry means the current directory in some shells' PATH grammar.
    // Refused rather than honored: what the agent resolves must not depend on
    // where it happens to be standing.
    if (dir === "") continue;
    const candidate = join(dir, name);
    try {
      // The file-type test comes first, and it is not pedantry. The execute bit
      // means *searchable* on a directory, so `accessSync(dir, X_OK)` succeeds
      // for a directory named `node` — the guard would report green while the
      // shell could not execute it, and launchd would then fail at 07:47 before
      // anything could report it. Found by PR #136's second read.
      //
      // `statSync` follows symlinks, deliberately: a symlink to the real binary
      // is the ordinary shape of a version-managed toolchain, and what matters
      // is what the link resolves to. A dangling one throws here and is skipped.
      if (!statSync(candidate).isFile()) continue;
      accessSync(candidate, constants.X_OK);
      return true;
    } catch {
      // Absent here, or present and not executable, or a directory that cannot
      // be read — one answer for this question, which is "keep looking".
    }
  }
  return false;
}

// Returns the names that are missing, in the order asked for, so the caller can
// name all of them at once rather than one per attempt.
export function missingFromPath(names: string[], path: string): string[] {
  return names.filter((name) => !resolvesOnPath(name, path));
}
