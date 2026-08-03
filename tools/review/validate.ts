// Validation on return — compliance is checked at the receiving end (Chapter 0,
// mechanism three; Chapter 2, *Validation on return*). A nonconforming review is
// re-summoned with the missing fields named; naming them is this module's job.

export interface Validation {
  conforming: boolean;
  missing: string[];
}

const SEVERITIES = new Set(["must-fix", "should-fix", "note"]);
const TYPES = new Set(["defect", "risk", "improvement", "lesson"]);
const FIELDS = ["Lens", "Type", "Severity", "Location", "Defect"] as const;

function fieldValues(review: string, field: string): string[] {
  const re = new RegExp(`\\*\\*${field}:\\*\\*\\s*(.*)`, "g");
  const out: string[] = [];
  for (const m of review.matchAll(re)) out.push(m[1]!.trim());
  return out;
}

const NO_FINDINGS = /no findings/i;

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

  const signatures = fieldValues(review, "Signed");
  if (!signatures.some((s) => s.length > 0)) {
    missing.push("the review is not signed with tool and model");
  }

  // Every summoned lens must be answered explicitly — a finding that names it,
  // or a "no findings" line that names it. An unanswered lens is the incomplete
  // review this check exists to catch.
  const lensAnswers = fieldValues(review, "Lens");
  for (const lens of lenses) {
    if (!lensAnswers.some((a) => a.includes(lens))) {
      missing.push(`the summoned lens was never answered: ${lens}`);
    }
  }

  const counts = new Map(FIELDS.map((f) => [f, fieldValues(review, f)]));
  // A "no findings" lens answer is an answer, not a finding — it owes no other fields.
  const n = lensAnswers.filter((a) => !NO_FINDINGS.test(a)).length;
  for (const field of FIELDS) {
    if (field === "Lens") continue;
    const seen = counts.get(field)!.length;
    if (seen !== n) {
      missing.push(
        `field counts disagree: ${n} finding-bearing Lens field(s) but ${seen} ${field} field(s) — every finding carries all five fields`,
      );
    }
  }

  for (const sev of counts.get("Severity")!) {
    const value = sev.replace(/[`*]/g, "").trim();
    if (!SEVERITIES.has(value)) {
      missing.push(
        `severity "${value}" is not in the framework's vocabulary (must-fix | should-fix | note)`,
      );
    }
  }

  for (const t of counts.get("Type")!) {
    const value = t.replace(/[`*]/g, "").trim();
    if (!TYPES.has(value)) {
      missing.push(
        `type "${value}" is not in the findings vocabulary (defect | risk | improvement | lesson)`,
      );
    }
  }

  return { conforming: missing.length === 0, missing };
}
