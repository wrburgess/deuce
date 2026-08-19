import { test } from "node:test";
import assert from "node:assert/strict";
import { chmodSync, mkdirSync, mkdtempSync, rmSync, symlinkSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { missingFromPath, NEEDED_ON_PATH, resolvesOnPath } from "./executables.ts";

// A PATH holding one executable named `tool`, and a second directory holding a
// file of the same name that is not executable.
function fixture(): { dir: string; other: string; cleanup: () => void } {
  const dir = mkdtempSync(join(tmpdir(), "deuce-path-"));
  const other = mkdtempSync(join(tmpdir(), "deuce-path-"));
  writeFileSync(join(dir, "tool"), "#!/bin/sh\n");
  chmodSync(join(dir, "tool"), 0o755);
  writeFileSync(join(other, "readable"), "not executable\n");
  chmodSync(join(other, "readable"), 0o644);
  return {
    dir,
    other,
    cleanup: () => {
      rmSync(dir, { recursive: true, force: true });
      rmSync(other, { recursive: true, force: true });
    },
  };
}

test("an executable on the path is found", () => {
  const f = fixture();
  try {
    assert.equal(resolvesOnPath("tool", f.dir), true);
    assert.equal(resolvesOnPath("tool", `${f.other}:${f.dir}`), true, "later entries are searched");
  } finally {
    f.cleanup();
  }
});

test("a name that is absent, or present and not executable, does not resolve", () => {
  const f = fixture();
  try {
    assert.equal(resolvesOnPath("absent", f.dir), false);
    // The distinction that matters: a file of the right name that cannot be
    // executed is not a hit. Treating it as one is how a check reports green on
    // a PATH the agent cannot actually use.
    assert.equal(resolvesOnPath("readable", f.other), false);
  } finally {
    f.cleanup();
  }
});

// The defect this pins, from PR #136's second read: the execute bit means
// *searchable* on a directory, so accessSync(dir, X_OK) succeeds for a directory
// named `node`. The guard reported green while the shell could not execute it,
// and launchd then failed at 07:47 before anything could report it.
test("a directory bearing the name is not an executable", () => {
  const dir = mkdtempSync(join(tmpdir(), "deuce-path-"));
  try {
    // Exactly the impostor: a searchable directory called `node` on the PATH.
    mkdirSync(join(dir, "node"));
    chmodSync(join(dir, "node"), 0o755);
    assert.equal(
      resolvesOnPath("node", dir),
      false,
      "a directory is searchable, not executable — accepting it is the false green",
    );
    assert.deepEqual(missingFromPath(["node"], dir), ["node"]);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test("a symlink to a real executable does resolve", () => {
  const dir = mkdtempSync(join(tmpdir(), "deuce-path-"));
  try {
    // The ordinary shape of a version-managed toolchain, so it must not be
    // caught by the file-type test above: what matters is what it resolves to.
    writeFileSync(join(dir, "real"), "#!/bin/sh\n");
    chmodSync(join(dir, "real"), 0o755);
    symlinkSync(join(dir, "real"), join(dir, "linked"));
    assert.equal(resolvesOnPath("linked", dir), true);

    // A dangling link resolves to nothing and must not count.
    symlinkSync(join(dir, "absent"), join(dir, "dangling"));
    assert.equal(resolvesOnPath("dangling", dir), false);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test("an empty path, and empty entries within one, resolve nothing", () => {
  const f = fixture();
  try {
    assert.equal(resolvesOnPath("tool", ""), false);
    // An empty entry means "the current directory" in some PATH grammars. What
    // the armed agent resolves must not depend on where it is standing, so the
    // entry is skipped rather than honored.
    assert.equal(resolvesOnPath("tool", "::"), false);
    assert.equal(resolvesOnPath("tool", `:${f.dir}:`), true, "skipping empties still searches");
  } finally {
    f.cleanup();
  }
});

test("a directory on the path that does not exist is not an error", () => {
  const f = fixture();
  try {
    assert.equal(resolvesOnPath("tool", `/no/such/directory:${f.dir}`), true);
  } finally {
    f.cleanup();
  }
});

test("every missing name is reported at once, in the order asked for", () => {
  const f = fixture();
  try {
    assert.deepEqual(missingFromPath(["tool"], f.dir), []);
    assert.deepEqual(missingFromPath(["node", "claude"], "/no/such/directory"), [
      "node",
      "claude",
    ]);
    assert.deepEqual(missingFromPath(["tool", "absent"], f.dir), ["absent"]);
  } finally {
    f.cleanup();
  }
});

test("the two the armed agent actually needs are the ones checked", () => {
  // Named rather than asserted loosely: the wrapper's shim runs `node` and the
  // pass it starts is `claude`, and both are resolved through PATH at run time.
  assert.deepEqual(NEEDED_ON_PATH, ["node", "claude"]);
});
