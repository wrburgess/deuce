// The measures block, rendered for the Delivery Record to carry (Chapter 1,
// *Where the health measures live* — all four, every pull request, in one
// place).
//
// Two rules shape every line below:
//
//   1. **Four measures leave here, always.** Canon requires all four on every
//      record, so a declaration that names fewer is refused rather than
//      rendered short.
//   2. **A declared half never renders as a measured one.** What the tracker
//      holds is printed as a number; what only the AC holds is printed as an
//      obviously unfilled slot. The proxy defect — a partial figure read as
//      the whole — is the most-recurring class in this repository's findings
//      index, and a rendered `0` for an absent record is that defect in its
//      cheapest form.
//
// The capture states come from `config/measures.md` and are never restated
// here: the frontmatter a reader sees and the states this block claims are the
// same states, which is the same discipline `config/checks.md` holds the gate
// to. The grammar is `tools/gate/declaration.ts`'s, with a closed key
// vocabulary of this file's own, exactly as `parseDeclaration` keeps one for
// the gate.

import { parseFrontmatter } from "../gate/declaration.ts";
import type { QualityResult } from "./quality.ts";
import type { ThroughputResult } from "./throughput.ts";

export type Capture = "computed" | "computed-in-part" | "declared" | "un-instrumented";

export interface MeasureDeclaration {
  date: string;
  source: string;
  measures: Map<string, Capture>;
}

export interface RenderInput {
  declaration: MeasureDeclaration;
  quality: QualityResult;
  throughput: ThroughputResult;
  prNumber: number;
}

const REQUIRED = ["quality", "autonomy", "throughput", "cost-efficiency"] as const;
const CAPTURES = new Set<string>(["computed", "computed-in-part", "declared", "un-instrumented"]);
const PATH = "config/measures.md";

export function parseMeasureDeclaration(markdown: string): MeasureDeclaration {
  const parsed = parseFrontmatter(markdown);
  const date = parsed.scalars.get("date");
  const source = parsed.scalars.get("source");
  if (date === undefined) throw new Error(`${PATH} carries no 'date' — the block cites one`);
  if (source === undefined) throw new Error(`${PATH} carries no 'source'`);

  const items = parsed.lists.get("measures");
  if (items === undefined || items.length === 0) {
    throw new Error(`${PATH} declares no measures`);
  }

  const measures = new Map<string, Capture>();
  for (const item of items) {
    const name = item.get("name");
    const capture = item.get("capture");
    if (name === undefined) throw new Error(`${PATH}: a measure carries no 'name'`);
    if (capture === undefined) throw new Error(`${PATH}: measure '${name}' carries no 'capture'`);
    if (!CAPTURES.has(capture)) {
      throw new Error(
        `${PATH}: measure '${name}' declares capture '${capture}', which is not one of computed | computed-in-part | declared | un-instrumented`,
      );
    }
    measures.set(name, capture as Capture);
  }

  // Fewer than the four is a declaration that cannot produce a conforming
  // record, and the honest moment to say so is before anything is rendered.
  for (const required of REQUIRED) {
    if (!measures.has(required)) {
      throw new Error(`${PATH} declares no capture for '${required}' — canon requires all four measures`);
    }
  }

  return { date, source, measures };
}

function qualityLine(quality: QualityResult, prNumber: number): string {
  const skipped: string[] = [];
  if (quality.outcomeSkipped > 0) skipped.push(`${quality.outcomeSkipped} outcome`);
  if (quality.supersededSkipped > 0) skipped.push(`${quality.supersededSkipped} superseded`);
  const skippedNote = skipped.length > 0 ? `, ${skipped.join(" and ")} skipped by name` : "";

  const computed = quality.hasRecord
    ? `contractor findings: **${quality.raised} raised, ${quality.mustFix} must-fix** (computed from ${quality.recordsCounted} standing record${quality.recordsCounted === 1 ? "" : "s"} on PR #${prNumber}${skippedNote})`
    : `contractor findings: **no standing contractor record on PR #${prNumber}**${skippedNote} — nothing was measured here, which is not the same as none raised`;

  const unknown =
    quality.unknownSeverity.length > 0
      ? ` Severity outside the vocabulary, counted as raised and named: ${quality.unknownSeverity.join("; ")}.`
      : "";

  return `**Quality** — ${computed}. AC-raised findings: [declare: how many the AC raised in Verify, and how many were must-fix].${unknown}`;
}

export function renderBlock(input: RenderInput): string {
  const { declaration, quality, throughput, prNumber } = input;

  const stampNote = throughput.endIsNow
    ? " The end stamp is this run, not the record's posting time — a record cannot know when it will be posted."
    : "";

  return [
    qualityLine(quality, prNumber),
    "**Autonomy** — [declare: HC interventions beyond the two gates].",
    `**Throughput** — ${throughput.line}.${stampNote}`,
    `**Cost efficiency** — un-instrumented; no capture path exists on this platform (${PATH}, ${declaration.date}). Never estimated.`,
  ].join("\n");
}
