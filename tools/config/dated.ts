// The dated-and-sourced check: every declaration in config/ carries a date and
// a source in its frontmatter (Chapter 1, *The adaptive layer's home*; the
// schema, Chapter 3, *The declaration schema*). The two fields are what make
// the adaptive layer re-verifiable at all — the hygiene sweep starts from them.
//
// ---------------------------------------------------------------------------
// Declared blind spot (Chapter 3, *Every check declares its blind spot*)
//
// This check decides presence and shape, never truth. A stale date, a source
// naming the wrong decision, and an impossible calendar date of valid shape
// (2026-13-40) all pass. Nothing short of re-reading the declaration against
// its history decides those, and that is the hygiene sweep's job — the residue
// is routed there, not dropped (Chapter 1, *The adaptive layer's home*).

import { parseFrontmatter } from "../gate/declaration.ts";

export interface DeclarationFile {
  path: string;
  content: string;
}

const DATE_SHAPE = /^\d{4}-\d{2}-\d{2}$/;

export function checkDated(files: DeclarationFile[]): string[] {
  // The empty input is a rejecting branch, never a green: a check over a set
  // fails open on nothing at all, and that is exactly where it matters most
  // (ADR 0014).
  if (files.length === 0) {
    return ["no declarations found — an empty config/ must never report green"];
  }
  // The guard sits on each declaration being measured, not on the list being
  // iterated: every failure names its file and its field, so one bad file
  // never hides behind eleven good ones.
  const errors: string[] = [];
  for (const file of files) {
    let scalars: Map<string, string>;
    try {
      scalars = parseFrontmatter(file.content).scalars;
    } catch (err) {
      errors.push(`${file.path}: ${(err as Error).message}`);
      continue;
    }
    const date = scalars.get("date");
    if (date === undefined) {
      errors.push(`${file.path}: carries no 'date' — every declaration is dated and sourced`);
    } else if (!DATE_SHAPE.test(date)) {
      errors.push(`${file.path}: 'date' is not shaped YYYY-MM-DD: ${date}`);
    }
    if (scalars.get("source") === undefined) {
      errors.push(`${file.path}: carries no 'source' — every declaration is dated and sourced`);
    }
  }
  return errors;
}
