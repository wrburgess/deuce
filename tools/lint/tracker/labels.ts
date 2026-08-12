// One label per axis, on every issue (Chapter 0, *Work Tracking System*;
// Chapter 3, *The configuration lint*). labels.yml is the declared source of
// truth for the axes and their values — its own header says so — so the check
// reads the declaration, never the tracker's label list, and it is parsed
// with a YAML parser rather than pattern-matched (Chapter 3, *Parse, never
// pattern-match*).
//
// Measured against the tracker as it stood before this was written
// (ADR 0013): 5 of 58 issues failed — a status: label missing or doubled —
// with zero false positives. The measurement is recorded on #56.

import { parse as parseYaml } from "yaml";
import type { TrackerIssue } from "./snapshot.ts";

export interface LabelsResult {
  violations: string[];
  // A malformed or empty declaration is the check unable to run, never an
  // empty axis set that passes everything — the refusal compose.ts set.
  guard: string | null;
  issuesChecked: number;
}

interface Axis {
  prefix: string;
  values: Set<string>;
}

function parseAxes(labelsYml: string): Axis[] | string {
  let doc: unknown;
  try {
    doc = parseYaml(labelsYml);
  } catch (err) {
    return `labels.yml did not parse as YAML: ${(err as Error).message}`;
  }
  const axes = (doc as { axes?: Record<string, unknown> })?.axes;
  if (axes === undefined || axes === null || typeof axes !== "object") {
    return "labels.yml carries no axes section — refusing to treat a malformed declaration as empty";
  }
  const out: Axis[] = [];
  for (const [name, entries] of Object.entries(axes)) {
    if (!Array.isArray(entries) || entries.length === 0) {
      return `labels.yml axis "${name}" declares no values`;
    }
    const values = new Set<string>();
    for (const entry of entries) {
      const label = (entry as { name?: unknown })?.name;
      if (typeof label !== "string" || !label.startsWith(`${name}:`)) {
        return `labels.yml axis "${name}" carries an entry with no conforming name`;
      }
      values.add(label);
    }
    out.push({ prefix: `${name}:`, values });
  }
  if (out.length === 0) {
    return "labels.yml declares no axes — refusing to treat a malformed declaration as empty";
  }
  return out;
}

export function checkLabels(labelsYml: string, issues: TrackerIssue[]): LabelsResult {
  const axes = parseAxes(labelsYml);
  if (typeof axes === "string") {
    return { violations: [], guard: axes, issuesChecked: 0 };
  }

  const violations: string[] = [];
  for (const issue of issues) {
    for (const axis of axes) {
      const carried = issue.labels.filter((l) => l.startsWith(axis.prefix));
      if (carried.length === 0) {
        violations.push(
          `#${issue.number}: no \`${axis.prefix}\` label — exactly one required on every issue`,
        );
      } else if (carried.length > 1) {
        violations.push(
          `#${issue.number}: ${carried.length} \`${axis.prefix}\` labels (${carried.join(", ")}) — exactly one required`,
        );
      }
      for (const label of carried) {
        if (!axis.values.has(label)) {
          violations.push(
            `#${issue.number}: \`${label}\` is not a value labels.yml declares for the \`${axis.prefix}\` axis`,
          );
        }
      }
    }
  }
  return { violations, guard: null, issuesChecked: issues.length };
}
