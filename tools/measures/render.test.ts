// The block the Delivery Record carries (#57). Canon requires all four
// measures on every record (Chapter 1, *Where the health measures live*), so
// the render's first duty is that four rows always leave here — and its second
// is that no declared half is ever rendered as if it had been measured.

import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { parseMeasureDeclaration, renderBlock } from "./render.ts";

const DECLARATION = [
  "---",
  "date: 2026-08-13",
  "source: the Direction gate on #57",
  "measures:",
  "  - name: quality",
  "    capture: computed-in-part",
  "  - name: autonomy",
  "    capture: declared",
  "  - name: throughput",
  "    capture: computed",
  "  - name: cost-efficiency",
  "    capture: un-instrumented",
  "---",
  "",
  "# prose",
  "",
].join("\n");

const declaration = parseMeasureDeclaration(DECLARATION);

const quality = {
  hasRecord: true,
  recordsCounted: 1,
  raised: 3,
  mustFix: 2,
  outcomeSkipped: 0,
  supersededSkipped: 0,
  unknownSeverity: [] as string[],
};

const throughput = {
  issueNumber: 117,
  hours: 9.15,
  line: "issue #117 opened 2026-08-12 05:55 UTC → Delivery Record 2026-08-12 15:04 UTC, 9.2h",
  endIsNow: false,
};

test("all four measures are present, whatever the inputs say", () => {
  const block = renderBlock({ declaration, quality, throughput, prNumber: 119 });
  for (const measure of ["Quality", "Autonomy", "Throughput", "Cost efficiency"]) {
    assert.ok(block.includes(`**${measure}**`), `${measure} is missing from the block`);
  }
});

test("the computed half is labeled as the contractor's, and the AC's half is a slot", () => {
  const block = renderBlock({ declaration, quality, throughput, prNumber: 119 });
  assert.match(block, /contractor/i);
  assert.match(block, /3 raised, 2 must-fix/);
  // The AC's half must be an unmistakably unfilled slot, never a number.
  assert.match(block, /\[declare:[^\]]*AC/i);
});

test("Autonomy is a slot and carries no number that could be mistaken for it", () => {
  const block = renderBlock({ declaration, quality, throughput, prNumber: 119 });
  const line = block.split("\n").find((l) => l.includes("**Autonomy**"))!;
  assert.match(line, /\[declare:/);
  assert.ok(!/\d/.test(line.replace(/\[declare:[^\]]*\]/, "")), `a number leaked into Autonomy: ${line}`);
});

test("cost efficiency is un-instrumented, cites the declaration, and carries no estimate", () => {
  const block = renderBlock({ declaration, quality, throughput, prNumber: 119 });
  const line = block.split("\n").find((l) => l.includes("**Cost efficiency**"))!;
  assert.match(line, /un-instrumented/);
  assert.match(line, /config\/measures\.md/);
  assert.match(line, /2026-08-13/);
});

test("a thread with no contractor record says so where a zero would have lied", () => {
  const block = renderBlock({
    declaration,
    quality: { ...quality, hasRecord: false, recordsCounted: 0, raised: 0, mustFix: 0 },
    throughput,
    prNumber: 120,
  });
  assert.match(block, /no standing contractor record/i);
  assert.ok(!/0 raised/.test(block), "an absent record was rendered as a measured zero");
});

test("an end stamp taken at this run is disclosed in the block itself", () => {
  const block = renderBlock({
    declaration,
    quality,
    throughput: { ...throughput, endIsNow: true, line: "issue #117 opened … → this run …, 9.2h" },
    prNumber: 119,
  });
  assert.match(block, /this run/);
});

test("skipped records are reported, so an odd count is visible rather than silent", () => {
  const block = renderBlock({
    declaration,
    quality: { ...quality, outcomeSkipped: 1, supersededSkipped: 2 },
    throughput,
    prNumber: 119,
  });
  assert.match(block, /1 outcome/);
  assert.match(block, /2 superseded/);
});

test("an unknown severity is surfaced in the block, never dropped on the floor", () => {
  const block = renderBlock({
    declaration,
    quality: { ...quality, unknownSeverity: ["blocker"] },
    throughput,
    prNumber: 119,
  });
  assert.match(block, /blocker/);
});

test("a declaration missing one of the four measures is refused, by name", () => {
  const short = DECLARATION.replace("  - name: autonomy\n    capture: declared\n", "");
  assert.throws(() => parseMeasureDeclaration(short), /autonomy/i);
});

test("a capture outside the vocabulary is refused rather than rendered", () => {
  const bad = DECLARATION.replace("capture: declared", "capture: vibes");
  assert.throws(() => parseMeasureDeclaration(bad), /vibes/);
});

test("a declaration with no date is refused — the block cites a date it must have", () => {
  const undated = DECLARATION.replace("date: 2026-08-13\n", "");
  assert.throws(() => parseMeasureDeclaration(undated), /date/i);
});

test("the live config/measures.md parses, and declares all four measures", () => {
  const live = parseMeasureDeclaration(readFileSync("config/measures.md", "utf8"));
  assert.equal(live.measures.size, 4);
  assert.equal(live.measures.get("cost-efficiency"), "un-instrumented");
});
