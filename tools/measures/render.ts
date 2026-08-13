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
const FIELDS = new Set<string>(["name", "capture", "command"]);
const TOP_LEVEL_SCALARS = new Set<string>(["date", "source"]);
const PATH = "config/measures.md";

export function parseMeasureDeclaration(markdown: string): MeasureDeclaration {
  const parsed = parseFrontmatter(markdown);

  // Closed at the top level as well as inside each measure. The contractor
  // review on PR #125 caught the asymmetry: a misspelled or stray top-level
  // key passed while nothing honoured it, which is a declaration claiming more
  // than the block delivers.
  for (const key of parsed.scalars.keys()) {
    if (!TOP_LEVEL_SCALARS.has(key)) {
      throw new Error(`${PATH}: unrecognized top-level key '${key}'`);
    }
  }
  for (const key of parsed.lists.keys()) {
    if (key !== "measures") {
      throw new Error(`${PATH}: unrecognized top-level list '${key}'`);
    }
  }

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
    // The vocabulary is closed on all three axes — the measure's name, its
    // fields, and its capture — the way `parseDeclaration` closes the gate's.
    // A key nobody reads is a declaration saying more than the block honours,
    // and it says it silently.
    if (!REQUIRED.includes(name as (typeof REQUIRED)[number])) {
      throw new Error(
        `${PATH}: '${name}' is not one of the four health measures (${REQUIRED.join(", ")})`,
      );
    }
    if (measures.has(name)) {
      throw new Error(`${PATH}: measure '${name}' is declared twice — one capture per measure`);
    }
    for (const field of item.keys()) {
      if (!FIELDS.has(field)) {
        throw new Error(`${PATH}: measure '${name}' carries an unrecognized field '${field}'`);
      }
    }
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

// What this family can actually produce for each measure. A declaration asking
// for anything else is refused rather than rendered around: the whole point of
// reading `config/measures.md` is that the states a reader sees there and the
// states the block claims are one set, and a declaration parsed but ignored is
// a second copy wearing the first one's clothes.
const IMPLEMENTED: Record<string, Capture[]> = {
  quality: ["computed-in-part", "declared", "un-instrumented"],
  autonomy: ["declared", "un-instrumented"],
  throughput: ["computed", "declared", "un-instrumented"],
  "cost-efficiency": ["declared", "un-instrumented"],
};

function capture(declaration: MeasureDeclaration, name: string): Capture {
  const declared = declaration.measures.get(name)!;
  if (!IMPLEMENTED[name]!.includes(declared)) {
    throw new Error(
      `${PATH} declares '${name}' as ${declared}, and nothing here produces that: this family can render ${name} as ${IMPLEMENTED[name]!.join(" or ")}. Refusing to print a block that contradicts the declaration.`,
    );
  }
  return declared;
}

function uninstrumented(label: string, date: string): string {
  return `**${label}** — un-instrumented; no capture path exists on this platform (${PATH}, ${date}). Never estimated.`;
}

export function renderBlock(input: RenderInput): string {
  const { declaration, quality, throughput, prNumber } = input;
  const date = declaration.date;

  const stampNote = throughput.endIsNow
    ? " The end stamp is this run, not the record's posting time — a record cannot know when it will be posted."
    : "";

  const qualityCapture = capture(declaration, "quality");
  const autonomyCapture = capture(declaration, "autonomy");
  const throughputCapture = capture(declaration, "throughput");
  const costCapture = capture(declaration, "cost-efficiency");

  const lines: string[] = [];

  lines.push(
    qualityCapture === "computed-in-part"
      ? qualityLine(quality, prNumber)
      : qualityCapture === "declared"
        ? "**Quality** — [declare: findings raised, and how many were must-fix]."
        : uninstrumented("Quality", date),
  );

  lines.push(
    autonomyCapture === "declared"
      ? "**Autonomy** — [declare: HC interventions beyond the two gates]."
      : uninstrumented("Autonomy", date),
  );

  lines.push(
    throughputCapture === "computed"
      ? `**Throughput** — ${throughput.line}.${stampNote}`
      : throughputCapture === "declared"
        ? "**Throughput** — [declare: elapsed from the issue opening to this record]."
        : uninstrumented("Throughput", date),
  );

  lines.push(
    costCapture === "declared"
      ? "**Cost efficiency** — [declare: AC usage consumed across the five stages]."
      : uninstrumented("Cost efficiency", date),
  );

  return lines.join("\n");
}
