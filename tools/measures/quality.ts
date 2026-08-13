// The computed half of Quality: how many findings the standing contractor
// records on one pull request thread carry, and how many are must-fix
// (Chapter 3, *Capturing the health measures*; ADR 0028).
//
// It counts one half of a two-half measure. The AC's own findings — raised in
// Verify, disposed in the Verification — are not counted here and cannot be:
// nothing enforces their shape, so nothing can parse them. That is why
// `config/measures.md` declares Quality `computed-in-part` and why the render
// carries the two halves separately. Measured on 2026-08-13 across all 44
// Delivery Records: counting the contractor's half alone reproduces the number
// the record states on 5 of them, and the other 39 are not errors — they are
// records that also counted the AC's own findings.
//
// Discovery is `tools/review/standing.ts`'s and counting is
// `tools/review/validate.ts`'s. This module is the sum over a thread and
// nothing else; the two families share the pure decision code and never each
// other's edges.
//
// ---------------------------------------------------------------------------
// Declared limits
//
//   - A record that quotes another record's finding is counted at face value:
//     the split is on `**Lens:**`, so a quoted block reads as a finding. The
//     record count is reported beside the finding count for exactly this
//     reason — an implausible ratio is visible rather than silent.
//   - An absent record is not a zero. `hasRecord` distinguishes "no contractor
//     record on this thread" from "a record that found nothing", and the
//     render prints those differently; a measured zero and an unmeasured one
//     must never look alike in the baseline.

import { selectStandingRecords } from "../review/standing.ts";
import { countFindings } from "../review/validate.ts";
import type { MeasuresComment } from "./snapshot.ts";

export interface QualityResult {
  /** Whether any standing contractor record exists on the thread at all. */
  hasRecord: boolean;
  recordsCounted: number;
  raised: number;
  mustFix: number;
  outcomeSkipped: number;
  supersededSkipped: number;
  unknownSeverity: string[];
}

export function computeQuality(comments: MeasuresComment[]): QualityResult {
  const found = selectStandingRecords(comments);

  let raised = 0;
  let mustFix = 0;
  const unknownSeverity: string[] = [];
  for (const record of found.standing) {
    const count = countFindings(record.body);
    raised += count.raised;
    mustFix += count.mustFix;
    unknownSeverity.push(...count.unknownSeverity);
  }

  return {
    hasRecord: found.standing.length > 0,
    recordsCounted: found.standing.length,
    raised,
    mustFix,
    outcomeSkipped: found.outcomeSkipped,
    supersededSkipped: found.supersededSkipped,
    unknownSeverity,
  };
}
