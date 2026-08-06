import { test } from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { cloneHost, commitAndPush, createSyncBranch, HostRejection, openPullRequest } from "./host.ts";

function git(root: string, args: string[]): string {
  return execFileSync("git", ["-C", root, ...args], { encoding: "utf8" });
}

// A file:// bare remote stands in for the host: every git operation is real,
// and no network is touched. The gh seam is the one thing never executed here.
function bareRemote(): string {
  const dir = mkdtempSync(join(tmpdir(), "deuce-remote-"));
  execFileSync("git", ["init", "--quiet", "--bare", "--initial-branch=main", dir]);
  const seed = mkdtempSync(join(tmpdir(), "deuce-seedclone-"));
  execFileSync("git", ["clone", "--quiet", dir, seed]);
  git(seed, ["config", "user.email", "t@t"]);
  git(seed, ["config", "user.name", "t"]);
  writeFileSync(join(seed, "README.md"), "the host\n");
  git(seed, ["add", "--all"]);
  git(seed, ["-c", "commit.gpgsign=false", "commit", "--quiet", "-m", "host initial"]);
  git(seed, ["push", "--quiet", "origin", "main"]);
  return dir;
}

test("clone, branch, write, commit, push — the branch lands on the remote", () => {
  const remote = bareRemote();
  const root = cloneHost(remote);
  git(root, ["config", "user.email", "t@t"]);
  git(root, ["config", "user.name", "t"]);
  createSyncBranch(root, "deuce/sync-test");
  writeFileSync(join(root, "shipped.md"), "payload\n");
  commitAndPush(root, "deuce/sync-test", "chore: test sync");
  const heads = execFileSync("git", ["ls-remote", "--heads", remote, "deuce/sync-test"], {
    encoding: "utf8",
  });
  assert.notEqual(heads.trim(), "");
});

test("an unreachable host is a classified rejection, not a crash", () => {
  try {
    cloneHost(join(tmpdir(), "deuce-no-such-remote"));
    assert.fail("should have rejected");
  } catch (e) {
    assert.ok(e instanceof HostRejection);
    assert.equal((e as HostRejection).state, "unreachable");
  }
});

test("a sync branch already on the remote is refused by name", () => {
  const remote = bareRemote();
  const first = cloneHost(remote);
  git(first, ["config", "user.email", "t@t"]);
  git(first, ["config", "user.name", "t"]);
  createSyncBranch(first, "deuce/sync-dup");
  writeFileSync(join(first, "x.md"), "x\n");
  commitAndPush(first, "deuce/sync-dup", "chore: first");
  const second = cloneHost(remote);
  try {
    createSyncBranch(second, "deuce/sync-dup");
    assert.fail("should have rejected");
  } catch (e) {
    assert.ok(e instanceof HostRejection);
    assert.equal((e as HostRejection).state, "branch-exists");
  }
});

test("a failed pull request post is 'post-failed' — the injectable seam, never executed for real", () => {
  try {
    openPullRequest(
      { hostRepo: "o/r", branch: "b", base: "main", title: "t", bodyFile: "/no/such/file" },
      () => {
        throw new Error("gh said no");
      },
    );
    assert.fail("should have rejected");
  } catch (e) {
    assert.ok(e instanceof HostRejection);
    assert.equal((e as HostRejection).state, "post-failed");
  }
});

test("a successful post returns the pull request URL from the seam", () => {
  const url = openPullRequest(
    { hostRepo: "o/r", branch: "b", base: "main", title: "t", bodyFile: "/tmp/x" },
    () => "https://github.com/o/r/pull/1\n",
  );
  assert.equal(url, "https://github.com/o/r/pull/1");
});
