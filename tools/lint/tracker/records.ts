// A findings record carries the fields the Findings System requires
// (Chapter 2, *Validation on return*; Chapter 3, *The configuration lint*).
// The summons path already validates a review at posting time
// (tools/review/validate.ts) — this check is not that check twice. Its
// subject is the standing records on pull request threads, and the reason it
// exists is the record that path never saw: a hand-placed record, the state
// summon's exit 5 is for.
//
// Discovery is by the record's own header, the shape summon.ts posts:
// `## Contractor review — <reviewer> (<wave>)`. Outcome-headed posts —
// nonconforming, reviewer unreachable, reviewer unresponsive — are the
// machinery's own honest records of a failed exchange, already named as what
// they are, and are skipped by name rather than re-flagged.
//
// A defective record's conforming fix is a superseding post, never an edit —
// comments are durable. A later comment carrying `**Supersedes:** <url>`
// exempts the record at that url.
//
// ---------------------------------------------------------------------------
// Declared blind spot (Chapter 3, *Every check declares its blind spot*)
//
// A record so malformed it lacks the `## Contractor review` header is not
// discovered — it stays with review. Validation here is structural: the
// commit line's presence, never its binding, because a standing record's
// bound commit lives in the summons beside it, not in this check's reach.

import { validateRecordStructure } from "../../review/validate.ts";
import type { TrackerPullRequest } from "./snapshot.ts";

export interface RecordsResult {
  violations: string[];
  blindSpot: string[];
  recordsChecked: number;
  outcomeRecordsSkipped: number;
  supersededSkipped: number;
}

export const BLIND_SPOT = [
  "blind spot: a record so malformed it lacks the `## Contractor review` header is not discovered — it stays with review",
  "blind spot: the commit line's presence is checked, never its binding — the bound commit lives in the summons, out of this check's reach",
];

const RECORD_HEADER = /^## Contractor review — /;
const OUTCOME_SUFFIX = /:\s*(nonconforming|reviewer unreachable|reviewer unresponsive)\s*$/;
const SUPERSEDES = /\*\*Supersedes:\*\*\s*(\S+)/g;

export function checkRecords(pullRequests: TrackerPullRequest[]): RecordsResult {
  const violations: string[] = [];
  let recordsChecked = 0;
  let outcomeRecordsSkipped = 0;
  let supersededSkipped = 0;

  for (const pr of pullRequests) {
    const superseded = new Set<string>();
    for (const comment of pr.comments) {
      for (const m of comment.body.matchAll(SUPERSEDES)) {
        superseded.add(m[1]!.replace(/[<>]/g, ""));
      }
    }

    for (const comment of pr.comments) {
      const firstLine = comment.body.trimStart().split("\n", 1)[0]!.trim();
      if (!RECORD_HEADER.test(firstLine)) continue;
      if (OUTCOME_SUFFIX.test(firstLine)) {
        outcomeRecordsSkipped++;
        continue;
      }
      if (superseded.has(comment.url)) {
        supersededSkipped++;
        continue;
      }
      recordsChecked++;
      for (const missing of validateRecordStructure(comment.body)) {
        violations.push(`PR #${pr.number} (${comment.url}): ${missing}`);
      }
    }
  }

  return {
    violations,
    blindSpot: BLIND_SPOT,
    recordsChecked,
    outcomeRecordsSkipped,
    supersededSkipped,
  };
}
