// Recording is delivery: the summons and the review land on the pull request,
// whatever mechanism produced them (Chapter 2, *The summons, completed*).

import { execFileSync } from "node:child_process";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

export function postComment(prNumber: number, body: string): void {
  const dir = mkdtempSync(join(tmpdir(), "deuce-record-"));
  const file = join(dir, "comment.md");
  try {
    writeFileSync(file, body);
    execFileSync("gh", ["pr", "comment", String(prNumber), "--body-file", file], {
      stdio: ["ignore", "inherit", "inherit"],
    });
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}
