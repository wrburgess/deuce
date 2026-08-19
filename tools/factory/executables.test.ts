import { test } from "node:test";
import assert from "node:assert/strict";
import { chmodSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
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
