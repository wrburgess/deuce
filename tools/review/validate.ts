// Validation on return — compliance is checked at the receiving end (Chapter 0,
// mechanism three; Chapter 2, *Validation on return*). A nonconforming review is
// re-summoned with the missing fields named; naming them is this module's job.

export interface Validation {
  conforming: boolean;
  missing: string[];
}

const SEVERITIES = new Set(["must-fix", "should-fix", "note"]);
const TYPES = new Set(["defect", "risk", "improvement", "lesson"]);

function fieldValues(review: string, field: string): string[] {
  const re = new RegExp(`\\*\\*${field}:\\*\\*\\s*(.*)`, "g");
  const out: string[] = [];
  for (const m of review.matchAll(re)) out.push(m[1]!.trim());
  return out;
}

const NO_FINDINGS = /no findings/i;
const BODY_FIELDS = ["Type", "Severity", "Location", "Defect"] as const;

// A signature names the tool and the model — at least two words; a bare
// token cannot be both, and the record's naming duty fails with it.
function signatureIssue(review: string): string | null {
  const signatures = fieldValues(review, "Signed");
  const signed = signatures.some(
    (s) => s.replace(/[`*]/g, "").trim().split(/[\s,]+/).filter(Boolean).length >= 2,
  );
  return signed ? null : "the review is not signed with both tool and model";
}

// A finding is validated as its own block — from one **Lens:** field to the
// next — never by counting fields in aggregate across the review. Aggregate
// counts certified a review whose findings were individually incomplete
// (raised live on PR #39, wave 2).
interface BlockScan {
  issues: string[];
  lensAnswers: string[];
}

function scanBlocks(review: string): BlockScan {
  const issues: string[] = [];
  const parts = review.split(/(?=\*\*Lens:\*\*)/);
  const preamble = parts[0]!;
  const blocks = parts.slice(1);

  for (const field of BODY_FIELDS) {
    if (fieldValues(preamble, field).length > 0) {
      issues.push(`a ${field} field appears outside any finding block`);
    }
  }

  const lensAnswers = blocks.map((b) => fieldValues(b, "Lens")[0]!);

  blocks.forEach((block, i) => {
    const lens = lensAnswers[i]!;
    if (NO_FINDINGS.test(lens)) {
      // An explicit no-findings answer owes nothing further.
      return;
    }
    for (const field of BODY_FIELDS) {
      const seen = fieldValues(block, field).length;
      if (seen !== 1) {
        issues.push(
          `finding ${i + 1} (lens: ${lens}) carries ${seen} ${field} field(s) — exactly one required`,
        );
      }
    }
    for (const sev of fieldValues(block, "Severity")) {
      const value = sev.replace(/[`*]/g, "").trim();
      if (!SEVERITIES.has(value)) {
        issues.push(
          `severity "${value}" is not in the framework's vocabulary (must-fix | should-fix | note)`,
        );
      }
    }
    for (const t of fieldValues(block, "Type")) {
      const value = t.replace(/[`*]/g, "").trim();
      if (!TYPES.has(value)) {
        issues.push(
          `type "${value}" is not in the findings vocabulary (defect | risk | improvement | lesson)`,
        );
      }
    }
  });

  return { issues, lensAnswers };
}

// The structural half alone — the fields a findings record carries, with no
// commit binding and no lens-menu coverage, because a later reader of a
// standing record holds neither the bound commit nor the summoned menu. The
// configuration lint (#56) validates posted records with this; validateReview
// below stays the summons path's full contract.
export function validateRecordStructure(review: string): string[] {
  const missing: string[] = [];
  if (fieldValues(review, "Commit reviewed").length === 0) {
    missing.push("the commit reviewed is not named");
  }
  const signature = signatureIssue(review);
  if (signature !== null) missing.push(signature);
  missing.push(...scanBlocks(review).issues);
  return missing;
}

export function validateReview(
  review: string,
  expectedCommit: string,
  lenses: string[],
): Validation {
  const missing: string[] = [];

  const commits = fieldValues(review, "Commit reviewed");
  if (commits.length === 0) {
    missing.push("the commit reviewed is not named");
  } else if (!commits.some((c) => c.replace(/`/g, "").trim() === expectedCommit)) {
    missing.push(
      `the commit named (${commits.join(", ")}) is not the bound commit ${expectedCommit}`,
    );
  }

  const signature = signatureIssue(review);
  if (signature !== null) missing.push(signature);

  const { issues: blockIssues, lensAnswers } = scanBlocks(review);

  // Every summoned lens must be answered explicitly — a finding that names it,
  // or a "no findings" line that names it. Coverage is normalized equality,
  // never substring: an answer that merely quotes the lens inside another
  // question is not an answer to it (raised live on PR #39).
  const normalize = (s: string) =>
    s
      .replace(/[`*]/g, "")
      .replace(/[—-]\s*no findings\s*$/i, "")
      .replace(/\(the permanent lens\)\s*$/i, "")
      .replace(/\s+/g, " ")
      .trim()
      .toLowerCase();
  for (const lens of lenses) {
    if (!lensAnswers.some((a) => normalize(a) === normalize(lens))) {
      missing.push(`the summoned lens was never answered: ${lens}`);
    }
  }

  missing.push(...blockIssues);

  return { conforming: missing.length === 0, missing };
}
