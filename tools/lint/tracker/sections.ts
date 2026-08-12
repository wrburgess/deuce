// The required body sections for each issue type (Chapter 0, *Work Tracking
// System* — the body contract and the type-specific fields; Chapter 3, *The
// configuration lint*). Bodies are parsed with commonmark, never
// pattern-matched over raw text (Chapter 3, *Parse, never pattern-match*).
//
// Measured against the tracker as it stood before this was written
// (ADR 0013): every body carried its Summary (HC); three closed tasks lacked
// done-when and six epics lacked the eight-field brief — true nonconformance
// from before the schema was ratified, not false positives. Recorded on #56.
//
// ---------------------------------------------------------------------------
// Declared blind spot (Chapter 3, *Every check declares its blind spot*)
//
// Presence, never quality: a Summary (HC) full of jargon, a done-when that
// decides nothing, a brief field left as a stub all pass. The judgment half
// stays with the authoring rules and review. An issue without exactly one
// type: label gets no type-specific half — the labels check names that issue,
// so the gap is reported, just not here.

import { Parser, type Node } from "commonmark";
import type { TrackerIssue } from "./snapshot.ts";

export interface SectionsResult {
  violations: string[];
  blindSpot: string[];
  issuesChecked: number;
}

export const BLIND_SPOT = [
  "blind spot: section presence is checked, never content quality — the judgment half stays with the authoring rules and review",
  "blind spot: an issue without exactly one type: label gets no type-specific check here — the labels check names it",
];

const BRIEF_FIELDS = [
  "Problem",
  "Target solution",
  "Goals",
  "Constraints",
  "Expectations",
  "Risks",
  "Edge cases",
  "Punted paths",
];

function walk(root: Node, visit: (node: Node) => void): void {
  const walker = root.walker();
  let event = walker.next();
  while (event !== null) {
    if (event.entering) visit(event.node);
    event = walker.next();
  }
}

function textOf(node: Node): string {
  let text = "";
  walk(node, (child) => {
    if (child.type === "text" || child.type === "code") text += child.literal ?? "";
    if (child.type === "softbreak" || child.type === "linebreak") text += " ";
  });
  return text;
}

interface ParsedBody {
  headings: string[];
  strongLeaders: string[];
  fullText: string;
}

function parseBody(body: string): ParsedBody {
  const root = new Parser().parse(body);
  const headings: string[] = [];
  const strongLeaders: string[] = [];
  let fullText = "";
  walk(root, (node) => {
    if (node.type === "heading") headings.push(textOf(node).trim());
    if (node.type === "strong") strongLeaders.push(textOf(node).trim());
    if (node.type === "text" || node.type === "code") fullText += node.literal ?? "";
    if (node.type === "softbreak" || node.type === "linebreak") fullText += " ";
    if (node.type === "paragraph" || node.type === "heading" || node.type === "item") {
      fullText += "\n";
    }
  });
  return { headings, strongLeaders, fullText };
}

function issueType(issue: TrackerIssue): string | null {
  const typed = issue.labels.filter((l) => l.startsWith("type:"));
  return typed.length === 1 ? typed[0]!.slice("type:".length) : null;
}

export function checkSections(issues: TrackerIssue[]): SectionsResult {
  const violations: string[] = [];

  for (const issue of issues) {
    const parsed = parseBody(issue.body);

    if (!parsed.headings.some((h) => /^Summary \(HC\)$/i.test(h))) {
      violations.push(
        `#${issue.number}: no \`Summary (HC)\` heading — required on every issue (Chapter 0, the body contract)`,
      );
    }

    const type = issueType(issue);
    switch (type) {
      case "task": {
        if (!/done[- ]when/i.test(parsed.fullText)) {
          violations.push(
            `#${issue.number}: a TASK carries done-when, and the phrase appears nowhere in the body`,
          );
        }
        break;
      }
      case "bug": {
        if (!parsed.headings.some((h) => /reproduction/i.test(h))) {
          violations.push(
            `#${issue.number}: a BUG carries a Reproduction heading, and none appears`,
          );
        }
        break;
      }
      case "spike": {
        const leaders = [...parsed.headings, ...parsed.strongLeaders];
        if (!leaders.some((l) => /question/i.test(l))) {
          violations.push(
            `#${issue.number}: a SPIKE names the question it answers — no Question heading or bold leader appears`,
          );
        }
        break;
      }
      case "epic": {
        const found = parsed.headings.filter((h) => BRIEF_FIELDS.includes(h));
        const missing = BRIEF_FIELDS.filter((f) => !found.includes(f));
        if (missing.length > 0) {
          violations.push(
            `#${issue.number}: the epic brief is missing ${missing.length} of its eight fields — ${missing.join(", ")}`,
          );
        } else {
          const inOrder = BRIEF_FIELDS.every((f, i) => found[i] === f);
          if (!inOrder) {
            violations.push(
              `#${issue.number}: the epic brief's eight fields appear out of schema order (${found.join(" · ")})`,
            );
          }
        }
        break;
      }
      // chore: nothing beyond the Summary. null: the labels check names it.
      default:
        break;
    }
  }

  return { violations, blindSpot: BLIND_SPOT, issuesChecked: issues.length };
}
