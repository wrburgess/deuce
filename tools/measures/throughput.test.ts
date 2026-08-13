// Throughput: the issue's opening to the Delivery Record (#57). The measure is
// exact when the record exists and honest about its own stamp when it does not.

import { test } from "node:test";
import assert from "node:assert/strict";
import { computeThroughput, findDeliveryRecord, formatElapsed } from "./throughput.ts";
import type { MeasuresComment } from "./snapshot.ts";

const comment = (body: string, createdAt: string): MeasuresComment => ({
  body,
  url: "https://github.com/wrburgess/deuce/pull/1#issuecomment-1",
  createdAt,
});

test("the elapsed runs from the issue's opening to the record's posting", () => {
  const t = computeThroughput({
    issue: { number: 117, createdAt: "2026-08-12T05:55:00Z" },
    recordPostedAt: "2026-08-12T15:05:00Z",
    now: "2026-08-13T22:00:00Z",
  });
  assert.equal(t.endIsNow, false);
  assert.equal(Math.round(t.hours * 10) / 10, 9.2);
  assert.equal(t.issueNumber, 117);
});

test("with no record posted yet the end stamp is this run, and says so", () => {
  const t = computeThroughput({
    issue: { number: 57, createdAt: "2026-08-13T20:00:00Z" },
    recordPostedAt: null,
    now: "2026-08-13T22:00:00Z",
  });
  assert.equal(t.endIsNow, true);
  assert.equal(t.hours, 2);
  assert.match(t.line, /this run/i);
});

test("an end before the start is refused by name, never rendered negative", () => {
  assert.throws(
    () =>
      computeThroughput({
        issue: { number: 1, createdAt: "2026-08-13T22:00:00Z" },
        recordPostedAt: "2026-08-12T22:00:00Z",
        now: "2026-08-13T23:00:00Z",
      }),
    /before the issue was opened/i,
  );
});

test("an unparseable stamp is refused, not silently treated as zero", () => {
  assert.throws(
    () =>
      computeThroughput({
        issue: { number: 1, createdAt: "not a date" },
        recordPostedAt: null,
        now: "2026-08-13T22:00:00Z",
      }),
    /could not be read as a time/i,
  );
});

test("boundaries read the way a person would write them", () => {
  assert.equal(formatElapsed(0), "under a minute");
  assert.equal(formatElapsed(0.25), "15m");
  assert.equal(formatElapsed(1), "1h");
  assert.equal(formatElapsed(9.14), "9.1h");
  assert.equal(formatElapsed(24), "1d 0h");
  assert.equal(formatElapsed(195.8), "8d 3.8h");
});

// Found by the AC's own refutation on PR #125: minutes that round up to a
// whole hour were printed as "60m", a unit nobody writes.
test("minutes rounding up to a whole hour are written as an hour", () => {
  assert.equal(formatElapsed(0.999), "1h");
  assert.equal(formatElapsed(0.9917), "1h");
  assert.equal(formatElapsed(0.99), "59m");
});

test("the same rounding at the day boundary does not print 24h", () => {
  assert.equal(formatElapsed(23.999), "1d 0h");
});

test("the same-minute case is zero elapsed, not an error", () => {
  const t = computeThroughput({
    issue: { number: 1, createdAt: "2026-08-13T22:00:00Z" },
    recordPostedAt: "2026-08-13T22:00:00Z",
    now: "2026-08-13T22:00:00Z",
  });
  assert.equal(t.hours, 0);
  assert.equal(t.endIsNow, false);
});

test("the Delivery Record is found by its own header, and the last one wins", () => {
  const found = findDeliveryRecord([
    comment("## Verification\n\n...", "2026-08-12T14:00:00Z"),
    comment("## Delivery Record\n\nfirst", "2026-08-12T15:00:00Z"),
    comment("## Delivery Record\n\nsuperseding", "2026-08-12T16:00:00Z"),
  ]);
  assert.equal(found, "2026-08-12T16:00:00Z");
});

test("a thread with no Delivery Record answers null rather than guessing a comment", () => {
  assert.equal(findDeliveryRecord([comment("## Verification\n\n...", "2026-08-12T14:00:00Z")]), null);
});

test("a comment merely mentioning the words is not the record", () => {
  assert.equal(
    findDeliveryRecord([comment("the Delivery Record will follow once the gate is green", "2026-08-12T14:00:00Z")]),
    null,
  );
});
