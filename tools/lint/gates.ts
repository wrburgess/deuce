// The gate-setting check: a setting's value lives only where it is defined
// and declared (PR #49's disposition; Chapter 3, *The structural
// restatement*). Both halves were measured against the repository before
// this was written (ADR 0013), and the measurement is recorded on #55.
//
// Token half — an inline code span `required`, `delegated`, or `attested`
// may appear only in the allowed homes: config/gates.md (the declaration),
// sds/ (canon defines what the settings mean — measured: chapters 2, 3, and
// 6 legitimately name values, so "two chapters" undercounted canon),
// GLOSSARY.md (each of its uses defers the in-force value to the
// declaration), and the records — adr/, findings/, docs/.
//
// Link half — reshaped by its measurement: as literally written ("every
// other live document naming a gate resolves to config/gates.md") it was
// false thirteen times over provenance citations, so the decidable form is
// that an enforced-set file naming a gate references the declaration or a
// chapter that defines the gates. A reference is a link or a named path —
// PR #49 already read "resolves to" as "names the file".
//
// ---------------------------------------------------------------------------
// Declared blind spot (Chapter 3, *Every check declares its blind spot*)
//
// A sentence carrying a setting's meaning while naming neither a gate nor a
// value — both surfaces PR #49's greps missed, and the seventh on PR #51,
// sit there. And the allowed homes are not scanned, so an in-force claim
// inside canon or a record — the #44 shape — is not reached. The residue is
// routed to Chapter 2's review lenses and the hygiene sweep, never dropped.

import type { MarkdownFile } from "./markdown.ts";
import { parse, inlineCodeSpans } from "./markdown.ts";

export interface GatesResult {
  violations: string[];
  // Printed by the wiring on every run, green or red: a green that does not
  // carry its own limits reads wider than the check (issue #55).
  blindSpot: string[];
  // Zero gate names across every tracked document is the fail-open state:
  // canon names the gates throughout, so silence means the inventory or the
  // reader broke (ADR 0014).
  guard: string | null;
  enforcedScanned: number;
}

const SETTINGS = new Set(["required", "delegated", "attested"]);
const GATE_NAME = /Direction gate|Ship gate/;
const RESOLVES = /gates\.md|00-identity-and-governance|01-lifecycle-and-skills/;

const ALLOWED_HOMES = [
  "config/gates.md",
  "sds/",
  "GLOSSARY.md",
  "adr/",
  "findings/",
  "docs/",
];

export const BLIND_SPOT = [
  "blind spot: a sentence carrying a setting's meaning while naming neither a gate nor a value is not reached — that residue stays with review and the hygiene sweep",
  "blind spot: the allowed homes (config/gates.md, sds/, GLOSSARY.md, adr/, findings/, docs/) are not scanned, so an in-force claim inside canon or a record is not reached",
];

function allowed(path: string): boolean {
  return ALLOWED_HOMES.some((home) =>
    home.endsWith("/") ? path.startsWith(home) : path === home,
  );
}

export function checkGates(files: MarkdownFile[]): GatesResult {
  if (files.some((f) => GATE_NAME.test(f.content)) === false) {
    return {
      violations: [],
      blindSpot: BLIND_SPOT,
      guard:
        "no document names either gate — canon names them throughout, so an empty scan must never report green (ADR 0014)",
      enforcedScanned: 0,
    };
  }

  const violations: string[] = [];
  let enforcedScanned = 0;
  for (const file of files) {
    if (allowed(file.path)) continue;
    enforcedScanned++;

    for (const span of inlineCodeSpans(parse(file.content))) {
      if (SETTINGS.has(span)) {
        violations.push(
          `${file.path}: carries the setting token \`${span}\` — a value lives only in config/gates.md and the chapters that define it; the pointer is the fix (PR #49)`,
        );
      }
    }

    if (GATE_NAME.test(file.content) && !RESOLVES.test(file.content)) {
      violations.push(
        `${file.path}: names a gate but references neither config/gates.md nor a defining chapter (sds/00, sds/01)`,
      );
    }
  }

  return { violations, blindSpot: BLIND_SPOT, guard: null, enforcedScanned };
}
