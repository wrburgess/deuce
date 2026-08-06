// Host-side operations: clone, branch, write, commit, push, pull request.
// Everything but the pull request is plain git and runs against any remote a
// test can fabricate (file://); the pull request goes through `gh`, the one
// seam a test never executes — its runner is injectable, and its failure is a
// classified outcome, never a crash (Chapter 3, the tooling contract).

import { execFileSync } from "node:child_process";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

export type Runner = (cmd: string, args: string[]) => string;

export const run: Runner = (cmd, args) =>
  execFileSync(cmd, args, { encoding: "utf8", maxBuffer: 64 * 1024 * 1024 });

export type HostRejectionState = "unreachable" | "branch-exists" | "push-failed" | "post-failed";

export class HostRejection extends Error {
  readonly state: HostRejectionState;

  constructor(message: string, state: HostRejectionState) {
    super(message);
    this.state = state;
  }
}

export interface HostClone {
  root: string;
  branch: string;
}

export function cloneHost(remote: string, exec: Runner = run): string {
  const dir = mkdtempSync(join(tmpdir(), "deuce-sync-"));
  const root = join(dir, "host");
  try {
    exec("git", ["clone", "--quiet", remote, root]);
  } catch (e) {
    throw new HostRejection(
      `host '${remote}' could not be cloned: ${(e as Error).message}`,
      "unreachable",
    );
  }
  return root;
}

export function createSyncBranch(root: string, branch: string, exec: Runner = run): void {
  const remoteHeads = exec("git", ["-C", root, "ls-remote", "--heads", "origin", branch]);
  if (remoteHeads.trim() !== "") {
    throw new HostRejection(
      `branch '${branch}' already exists on the host — a prior sync is still open, and this run ` +
        `will not stack on it`,
      "branch-exists",
    );
  }
  exec("git", ["-C", root, "checkout", "--quiet", "-b", branch]);
}

export function commitAndPush(
  root: string,
  branch: string,
  message: string,
  exec: Runner = run,
): void {
  exec("git", ["-C", root, "add", "--all"]);
  exec("git", ["-C", root, "-c", "commit.gpgsign=false", "commit", "--quiet", "-m", message]);
  try {
    exec("git", ["-C", root, "push", "--quiet", "-u", "origin", branch]);
  } catch (e) {
    throw new HostRejection(`push to the host failed: ${(e as Error).message}`, "push-failed");
  }
}

export interface PrRequest {
  hostRepo: string; // owner/name
  branch: string;
  base: string;
  title: string;
  bodyFile: string;
}

export function openPullRequest(req: PrRequest, exec: Runner = run): string {
  try {
    return exec("gh", [
      "pr",
      "create",
      "--repo",
      req.hostRepo,
      "--head",
      req.branch,
      "--base",
      req.base,
      "--title",
      req.title,
      "--body-file",
      req.bodyFile,
    ]).trim();
  } catch (e) {
    throw new HostRejection(
      `the pull request could not be opened: ${(e as Error).message}`,
      "post-failed",
    );
  }
}
