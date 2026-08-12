// The two reference-grammar checks (Chapter 0, *Work Tracking System* —
// relationship rules and reference grammar; Chapter 3, *The configuration
// lint*): no closing keyword adjacent to an epic reference, negated or not,
// and no bare #N that resolves to a pull request.
//
// Measured against the tracker as it stood before this was written
// (ADR 0013): the naive bare-#N restatement was mostly false positives —
// seven of nine raw hits were citations of the predecessor repository whose
// numbers collide with local pull request numbers. The refined restatement,
// recorded on #56: a cross-repository citation is written as a markdown
// link, and the parse then excludes it structurally — a link whose
// destination is outside this repository is skipped whole, and so are code
// spans and code blocks (Chapter 3, *Parse, never pattern-match*).
//
// ---------------------------------------------------------------------------
// Declared blind spot (Chapter 3, *Every check declares its blind spot*)
//
// Comments are not swept — bodies and labels are living state the lint keeps
// conformant; comments are durable records, and their fix is a superseding
// post (the HC's direction on #56). A plain-text cross-repository citation
// whose number resolves to nothing locally passes today and flags when the
// number counter catches up; the standing fix is the same — write citations
// as links.

import { Parser, type Node } from "commonmark";
import type { TrackerSnapshot } from "./snapshot.ts";

export interface ReferencesResult {
  adjacencyViolations: string[];
  bareViolations: string[];
  blindSpot: string[];
  documentsScanned: number;
  referencesResolved: number;
}

export const BLIND_SPOT = [
  "blind spot: comments are not swept by the grammar checks — a defective reference inside a durable record stays with review (the HC's direction on #56)",
  "blind spot: a plain-text cross-repository citation whose number resolves to nothing locally passes until the number counter catches up — the standing fix is writing citations as links",
];

const CLOSING_ADJACENT = /\b(close[sd]?|fix(?:e[sd])?|resolve[sd]?)\s+#(\d+)/gi;
const HASH_REF = /(^|[^\w#])#(\d+)/g;

function isExternal(destination: string | null, repoUrl: string): boolean {
  if (destination === null || !/^https?:\/\//i.test(destination)) return false;
  return !(destination === repoUrl || destination.startsWith(`${repoUrl}/`) || destination.startsWith(`${repoUrl}#`));
}

// The body's scannable text: every inline text run, with soft wraps joined so
// `PR\n#110` reads as one token pair, and with boundaries (\x00) where
// excluded content sat — a code span, a code block, an external link's
// subtree — so text on either side of an exclusion never becomes adjacent.
export function scannableText(body: string, repoUrl: string): string {
  const root: Node = new Parser().parse(body);
  let text = "";
  const walker = root.walker();
  let event = walker.next();
  while (event !== null) {
    const node = event.node;
    if (event.entering) {
      if (node.type === "link" && isExternal(node.destination, repoUrl)) {
        text += "\x00";
        walker.resumeAt(node, false);
      } else if (node.type === "code" || node.type === "code_block" || node.type === "html_block" || node.type === "html_inline") {
        text += "\x00";
      } else if (node.type === "text") {
        text += node.literal ?? "";
      } else if (node.type === "softbreak" || node.type === "linebreak") {
        text += " ";
      } else if (node.type === "paragraph" || node.type === "heading" || node.type === "item") {
        text += "\n";
      }
    }
    event = walker.next();
  }
  return text;
}

interface Doc {
  where: string;
  text: string;
}

export function checkReferences(snapshot: TrackerSnapshot): ReferencesResult {
  const pullRequestNumbers = new Set(snapshot.pullRequests.map((pr) => pr.number));
  const epicNumbers = new Set(
    snapshot.issues.filter((i) => i.labels.includes("type:epic")).map((i) => i.number),
  );

  const docs: Doc[] = [];
  for (const issue of snapshot.issues) {
    docs.push({ where: `#${issue.number} (title)`, text: issue.title });
    docs.push({ where: `#${issue.number} (body)`, text: scannableText(issue.body, snapshot.repoUrl) });
  }
  for (const pr of snapshot.pullRequests) {
    docs.push({ where: `PR #${pr.number} (title)`, text: pr.title });
    docs.push({ where: `PR #${pr.number} (body)`, text: scannableText(pr.body, snapshot.repoUrl) });
  }

  const adjacencyViolations: string[] = [];
  const bareViolations: string[] = [];
  let referencesResolved = 0;

  for (const doc of docs) {
    for (const m of doc.text.matchAll(CLOSING_ADJACENT)) {
      const target = Number(m[2]);
      referencesResolved++;
      if (epicNumbers.has(target)) {
        adjacencyViolations.push(
          `${doc.where}: closing keyword "${m[1]}" immediately before epic #${target} — never adjacent, not even negated (Chapter 0)`,
        );
      }
    }
    for (const m of doc.text.matchAll(HASH_REF)) {
      const target = Number(m[2]);
      referencesResolved++;
      if (!pullRequestNumbers.has(target)) continue;
      const before = doc.text.slice(Math.max(0, m.index - 8), m.index + m[1].length);
      if (/\bPR\s*$/.test(before)) continue;
      bareViolations.push(
        `${doc.where}: bare #${target} resolves to a pull request — a pull request is always written PR #${target} (Chapter 0)`,
      );
    }
  }

  return {
    adjacencyViolations,
    bareViolations,
    blindSpot: BLIND_SPOT,
    documentsScanned: docs.length,
    referencesResolved,
  };
}
