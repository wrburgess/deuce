// Reads the reviewer roster out of config/review.md's frontmatter — the
// declaration stays the single source, and a reshaped entry breaks here loudly
// rather than silently. The markdown-table scan this replaces read the roster
// out of prose; the values now come through the shared grammar (Chapter 3,
// *Parse, never pattern-match*).

import { parseFrontmatter } from "../gate/declaration.ts";

export interface Reviewer {
  name: string;
  mechanismCommand: string;
  responseKind: string;
  readinessCommand: string;
}

const ROSTER_FIELDS = new Set(["reviewer", "mechanism", "response", "readiness"]);

export function parseRoster(markdown: string): Reviewer {
  const { lists } = parseFrontmatter(markdown);
  const raw = lists.get("roster");
  // Absent and empty are different states with different fixes (ADR 0014).
  if (raw === undefined) {
    throw new Error("declaration carries no 'roster' key");
  }
  if (raw.length === 0) {
    throw new Error("roster declares zero reviewers — summoning has nobody to dispatch");
  }
  if (raw.length > 1) {
    // Fail loud, never first-entry-wins: silently dispatching the first
    // reviewer would make a declared second reviewer unreachable without a
    // trace.
    throw new Error(
      `roster declares ${raw.length} reviewers and reviewer selection is not built yet — ` +
        "summoning is single-reviewer until selection lands",
    );
  }
  const entry = raw[0]!;
  for (const key of entry.keys()) {
    if (!ROSTER_FIELDS.has(key)) {
      throw new Error(`the roster entry carries an unrecognized field '${key}'`);
    }
  }
  const required = (key: string): string => {
    const value = entry.get(key);
    if (!value) {
      throw new Error(`the roster entry declares no '${key}'`);
    }
    return value;
  };
  return {
    name: required("reviewer"),
    mechanismCommand: required("mechanism"),
    responseKind: required("response"),
    readinessCommand: required("readiness"),
  };
}
