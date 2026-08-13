// Throughput: elapsed time from the issue's opening to the Delivery Record
// (Chapter 1, *Where the health measures live*; Chapter 3, *Capturing the
// health measures*).
//
// Both stamps are the platform's own, so the measure is exact whenever the
// record already exists — which is the case for every past pull request, and
// never the case at the moment the record is being written. A record cannot
// know the time it will be posted, so a run before posting takes this run as
// the end stamp and says so in the output; the skew is minutes, and it is
// disclosed rather than absorbed. Measured on PR #119: the record's own
// "~9h" against the posted stamps' 9.2h.

import type { MeasuresComment, MeasuresIssue } from "./snapshot.ts";

export interface ThroughputInput {
  issue: MeasuresIssue;
  /** The Delivery Record's posting time, or null when it has not posted. */
  recordPostedAt: string | null;
  /** The moment of this run, passed in rather than read here so the whole
   *  module is decidable from a literal input (ADR 0014). */
  now: string;
}

export interface ThroughputResult {
  issueNumber: number;
  hours: number;
  endIsNow: boolean;
  line: string;
}

const RECORD_HEADER = /^## Delivery Record\b/;

function at(value: string, what: string): number {
  const ms = Date.parse(value);
  if (Number.isNaN(ms)) {
    throw new Error(`${what} could not be read as a time: ${value}`);
  }
  return ms;
}

/** The Delivery Record on a thread, by its own header — the last one, because
 *  a superseding record is posted rather than edited. A comment that merely
 *  mentions the words is not the record: the header must open the comment. */
export function findDeliveryRecord(comments: MeasuresComment[]): string | null {
  let posted: string | null = null;
  for (const comment of comments) {
    const firstLine = comment.body.trimStart().split("\n", 1)[0]!.trim();
    if (RECORD_HEADER.test(firstLine)) posted = comment.createdAt;
  }
  return posted;
}

/** Elapsed hours, written the way a person writes them in a record.
 *
 *  Each branch rounds before it decides its unit, never after: minutes that
 *  round up to sixty are an hour, and hours that round up to twenty-four are a
 *  day. Deciding first printed "60m" and "24h", units nobody writes — the
 *  off-by-one at every boundary, found by the AC's own refutation on PR #125. */
export function formatElapsed(hours: number): string {
  if (hours < 1 / 60) return "under a minute";

  const minutes = Math.round(hours * 60);
  if (minutes < 60) return `${minutes}m`;

  const wholeHours = Number(hours.toFixed(1));
  if (wholeHours < 24) return `${wholeHours}h`;

  const days = Math.floor(wholeHours / 24);
  return `${days}d ${Number((wholeHours - days * 24).toFixed(1))}h`;
}

function stamp(iso: string): string {
  return `${iso.slice(0, 10)} ${iso.slice(11, 16)} UTC`;
}

export function computeThroughput(input: ThroughputInput): ThroughputResult {
  const opened = at(input.issue.createdAt, `issue #${input.issue.number}'s opening time`);
  const endIsNow = input.recordPostedAt === null;
  const endIso = input.recordPostedAt ?? input.now;
  const end = at(endIso, endIsNow ? "this run's time" : "the Delivery Record's posting time");

  // A negative elapsed is not a small number; it is a wrong input. Rendering
  // it would put a nonsense figure in the baseline with no sign that anything
  // went wrong.
  if (end < opened) {
    throw new Error(
      `the end stamp (${endIso}) is before the issue was opened (${input.issue.createdAt}) — refusing to render a negative elapsed`,
    );
  }

  const hours = (end - opened) / 3_600_000;
  const tail = endIsNow ? `this run ${stamp(endIso)}` : `Delivery Record ${stamp(endIso)}`;
  const line = `issue #${input.issue.number} opened ${stamp(input.issue.createdAt)} → ${tail}, ${formatElapsed(hours)}`;

  return { issueNumber: input.issue.number, hours, endIsNow, line };
}
