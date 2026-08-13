// A findings record carries the fields the Findings System requires
// (Chapter 2, *Validation on return*; Chapter 3, *The configuration lint*).
// The summons path already validates a review at posting time
// (tools/review/validate.ts) — this check is not that check twice. Its
// subject is the standing records on pull request threads, and the reason it
// exists is the record that path never saw: a hand-placed record, the state
// summon's exit 5 is for.
//
// Discovery — which comments are the standing records, and which are skipped
// by name — is `tools/review/standing.ts`'s, extracted there by #57 so the
// measures family counts what this check validates over the same rule. This
// module decides conformance only.
//
// ---------------------------------------------------------------------------
// Declared blind spot (Chapter 3, *Every check declares its blind spot*)
//
// A record so malformed it lacks the `## Contractor review` header is not
// discovered — it stays with review. Validation here is structural: the
// commit line's presence, never its binding, because a standing record's
// bound commit lives in the summons beside it, not in this check's reach.

import { selectStandingRecords } from "../../review/standing.ts";
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

export function checkRecords(pullRequests: TrackerPullRequest[]): RecordsResult {
  const violations: string[] = [];
  let recordsChecked = 0;
  let outcomeRecordsSkipped = 0;
  let supersededSkipped = 0;

  for (const pr of pullRequests) {
    // Discovery is `tools/review/standing.ts`'s, shared with the measures
    // family (#57) so one rule decides what a standing record is.
    const found = selectStandingRecords(pr.comments);
    outcomeRecordsSkipped += found.outcomeSkipped;
    supersededSkipped += found.supersededSkipped;

    for (const comment of found.standing) {
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
