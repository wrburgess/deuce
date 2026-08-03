// The impure edge: runs the readiness check, then the mechanism. Unreachable
// (readiness failed — immediate, no waiting window) and unresponsive (dispatched,
// nothing came back) are different outcomes and are reported as such
// (Chapter 2, *The summons, completed*).

import { spawnSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync, existsSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

export type DispatchOutcome =
  | { kind: "review"; output: string }
  | { kind: "unreachable"; detail: string }
  | { kind: "unresponsive"; detail: string };

export interface DispatchOptions {
  readinessCommand: string;
  /** Shell command receiving the summons on stdin; must write the final
   *  review text to the path in $REVIEW_OUT. */
  invocation: string;
  summons: string;
  timeoutMs?: number;
}

export function runReadiness(command: string): { ok: boolean; detail: string } {
  const r = spawnSync("sh", ["-c", command], { encoding: "utf8", timeout: 60_000 });
  const detail = `${(r.stdout ?? "").trim()} ${(r.stderr ?? "").trim()}`.trim();
  return { ok: r.status === 0, detail: detail || `exit ${r.status}` };
}

export function dispatch(opts: DispatchOptions): DispatchOutcome {
  const readiness = runReadiness(opts.readinessCommand);
  if (!readiness.ok) {
    return { kind: "unreachable", detail: readiness.detail };
  }

  const dir = mkdtempSync(join(tmpdir(), "deuce-review-"));
  const outFile = join(dir, "review.md");
  try {
    const r = spawnSync("sh", ["-c", opts.invocation], {
      input: opts.summons,
      encoding: "utf8",
      env: { ...process.env, REVIEW_OUT: outFile },
      timeout: opts.timeoutMs ?? 15 * 60_000,
      maxBuffer: 64 * 1024 * 1024,
    });
    if (r.error && (r.error as NodeJS.ErrnoException).code === "ETIMEDOUT") {
      return { kind: "unresponsive", detail: "dispatch timed out" };
    }
    const output = existsSync(outFile) ? readFileSync(outFile, "utf8").trim() : "";
    if (output.length === 0) {
      const detail = `${(r.stderr ?? "").trim()}`.slice(0, 2_000);
      return {
        kind: "unresponsive",
        detail: detail || `mechanism exited ${r.status} with no review`,
      };
    }
    return { kind: "review", output };
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}
