// The glossary-reverse check: every Glossary entry's term appears somewhere
// in canon (Chapter 0, *Vocabulary*; Chapter 3, *A restatement is measured
// before it is adopted*).
//
// This check reports and never fails the gate: an absent term is a staleness
// signal for the hygiene sweep, not a defect (Chapter 3 — the four absences
// it measured were a surface-form variance and three terms minted for a
// chapter not yet written). The forward direction — every canon term of art
// has an entry — is declared undecidable and stays with review; nothing here
// reopens it.

import type { MarkdownFile } from "./markdown.ts";
import { parse, textOf } from "./markdown.ts";

export interface GlossaryResult {
  // Staleness signals, printed and routed to the hygiene sweep; exit stays 0.
  reports: string[];
  // Zero terms parsed from a glossary of 80-plus entries is the fail-open
  // state, never a green (ADR 0014).
  guard: string | null;
  terms: number;
}

// An entry is a top-level paragraph opening with a bold span: the file's own
// grammar, **Term** — definition, used by all entries today.
function termsOf(content: string): string[] {
  const terms: string[] = [];
  const root = parse(content);
  for (let node = root.firstChild; node !== null; node = node.next) {
    if (node.type !== "paragraph") continue;
    const lead = node.firstChild;
    if (lead?.type === "strong") terms.push(textOf(lead));
  }
  return terms;
}

export function checkGlossary(
  glossary: MarkdownFile,
  canon: MarkdownFile[],
): GlossaryResult {
  const terms = termsOf(glossary.content);
  if (terms.length === 0) {
    return {
      reports: [],
      guard: `zero entry terms parsed from ${glossary.path} — a glossary this size must never green on none (ADR 0014)`,
      terms: 0,
    };
  }
  if (canon.length === 0) {
    return {
      reports: [],
      guard: "zero canon files to search — sds/ is never empty",
      terms: terms.length,
    };
  }

  const corpus = canon.map((f) => f.content).join("\n").toLowerCase();
  const reports = terms
    .filter((term) => !corpus.includes(term.toLowerCase()))
    .map(
      (term) =>
        `stale? '${term}' appears in no canon chapter — a staleness signal for the hygiene sweep, not a defect`,
    );

  return { reports, guard: null, terms: terms.length };
}
