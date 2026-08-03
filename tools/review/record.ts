// Recording is delivery: the summons and the review land on the pull request,
// whatever mechanism produced them (Chapter 2, *The summons, completed*).
//
// A post that fails is itself an outcome, never an unhandled crash. It throws
// PostFailure carrying the record it could not place, so the boundary can print
// that record and exit with a code of its own — for an unreachable or
// unresponsive reviewer, the post *is* the only account of what happened, and
// losing it is the failure shape this machinery exists to eliminate (#40).
// A throw rather than a returned result on purpose: a returned failure can be
// ignored by the next post site somebody writes, and that is this same defect
// re-armed.

import { spawnSync } from "node:child_process";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

// Fields are declared and assigned rather than written as constructor parameter
// properties: the runtime strips types without transforming, so parameter
// properties are not available here (`erasableSyntaxOnly`, tsconfig.json).
export class PostFailure extends Error {
  readonly prNumber: number;
  readonly label: string;
  readonly body: string;
  readonly detail: string;

  constructor(prNumber: number, label: string, body: string, detail: string) {
    super(`posting ${label} to PR #${prNumber} failed: ${detail}`);
    this.name = "PostFailure";
    this.prNumber = prNumber;
    this.label = label;
    this.body = body;
    this.detail = detail;
  }
}

/** The un-posted record, rendered for the HC to place by hand. The body is
 *  carried whole and last: a report that truncates it loses the thing it
 *  exists to preserve. */
export function formatUnpostedRecord(failure: PostFailure): string {
  return [
    `## Post failed — this record was not placed`,
    ``,
    `- Pull request: #${failure.prNumber}`,
    `- What was being recorded: ${failure.label}`,
    `- Why the post failed: ${failure.detail}`,
    ``,
    `The run stops here. Nothing about the review outcome above is changed by`,
    `this failure — only that it is not on the pull request. Place the record`,
    `below by hand, or re-run once the post path works again.`,
    ``,
    `--- the un-posted record begins ---`,
    failure.body,
    `--- the un-posted record ends ---`,
    ``,
  ].join("\n");
}

export interface SavedRecord {
  /** Where the record landed, when it landed. */
  path?: string;
  /** Why it did not, when it did not. Both are never set. */
  error?: string;
}

/** Saves the un-posted record where the HC can find it, and **never throws** —
 *  a delivery mechanism that can throw is the defect this file is about (#40).
 *
 *  Two locations, tried in order: the OS temp directory, then the working
 *  directory. Why two: the condition that broke the post can be the same one
 *  that breaks the temp directory, and a channel that dies alongside the failure
 *  it is reporting is not a channel. The working directory is the repository
 *  root for every real run, which also makes the file easy to find; `.gitignore`
 *  keeps it out of commits. */
export function saveUnpostedRecord(
  failure: PostFailure,
  locations?: readonly string[],
): SavedRecord {
  const report = formatUnpostedRecord(failure);
  const name = `deuce-unposted-pr${failure.prNumber}.md`;
  const candidates = locations ?? [tmpdir(), process.cwd()];
  const errors: string[] = [];
  for (const location of candidates) {
    try {
      const path = join(location, name);
      writeFileSync(path, report);
      return { path };
    } catch (err) {
      errors.push(
        `${location}: ${err instanceof Error ? err.message : String(err)}`,
      );
    }
  }
  return { error: errors.join("; ").slice(0, 1_000) || "no location to write to" };
}

const NOTICE_LIMIT = 512;

/** The one-line pointer to the saved record. Held under 512 bytes — the size a
 *  single write is guaranteed to deliver whole — so the pointer cannot itself be
 *  cut in half by a reader that goes away. */
export function formatUnpostedNotice(
  failure: PostFailure,
  saved: SavedRecord,
): string {
  const head = `post failed (${failure.label}, PR #${failure.prNumber}): `;
  const tail = saved.path
    ? `record saved to ${saved.path}`
    : `record NOT saved — ${saved.error}`;
  const line = `${head}${tail}\n`;
  if (line.length <= NOTICE_LIMIT) return line;
  // Trim the explanation, never the fact: a reader must still learn that a
  // record exists and roughly where, even if the detail has to go.
  return `${line.slice(0, NOTICE_LIMIT - 5)}...\n`;
}

export function postComment(
  prNumber: number,
  body: string,
  label: string,
  command: readonly string[] = ["gh"],
): void {
  let dir: string | undefined;
  let posted = "";
  try {
    // Staging counts as posting. A temp directory that cannot be made, or a body
    // that cannot be written, loses the record exactly as surely as a rejected
    // post — so it takes the same classified path rather than escaping raw.
    // Raised as must-fix by the contractor review of 3d466c3 on PR #46.
    dir = mkdtempSync(join(tmpdir(), "deuce-record-"));
    const file = join(dir, "comment.md");
    writeFileSync(file, body);
    const argv = [
      ...command.slice(1),
      "pr",
      "comment",
      String(prNumber),
      "--body-file",
      file,
    ];
    const r = spawnSync(command[0]!, argv, {
      encoding: "utf8",
      maxBuffer: 64 * 1024 * 1024,
    });
    if (r.error) {
      // The spawn never happened — an uninstalled or renamed poster. Still a
      // post failure, so it takes the same path rather than a second shape.
      throw new PostFailure(prNumber, label, body, r.error.message);
    }
    if (r.status !== 0) {
      const detail =
        `${(r.stderr ?? "").trim()} ${(r.stdout ?? "").trim()}`.trim() ||
        `poster exited ${r.status}`;
      throw new PostFailure(prNumber, label, body, detail.slice(0, 2_000));
    }
    posted = r.stdout ?? "";
  } catch (err) {
    if (err instanceof PostFailure) throw err;
    throw new PostFailure(
      prNumber,
      label,
      body,
      (err instanceof Error ? err.message : String(err)).slice(0, 2_000),
    );
  } finally {
    // An exception thrown from `finally` supersedes the one in flight, so a
    // failing cleanup would replace the PostFailure and lose the record. Nothing
    // may escape here. A leaked directory under the OS temp directory carries no
    // record and no consequence; the lost record is the whole defect. The notice
    // is deliberately omitted rather than guarded twice — writing it could throw
    // in turn, which is the same masking hazard wearing a helpful face.
    // Raised as must-fix by the contractor review of e595042 on PR #46.
    if (dir !== undefined) {
      try {
        rmSync(dir, { recursive: true, force: true });
      } catch {
        // Intentionally swallowed; see above.
      }
    }
  }
  // The streams are captured so a failure's detail can go inside the report
  // instead of scattering to the terminal — but a successful post has always
  // printed the comment's URL, and callers read it, so it is written through.
  // Written after the catch: a broken stdout pipe must not turn a post that
  // succeeded into a report saying it failed.
  if (posted) process.stdout.write(posted);
}
