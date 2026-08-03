import { test } from "node:test";
import assert from "node:assert/strict";
import { validateReview } from "./validate.ts";

const COMMIT = "b".repeat(40);

const conforming = [
  "## Review",
  "",
  "- **Lens:** what class is not on this list?",
  "- **Type:** defect",
  "- **Severity:** should-fix",
  "- **Location:** tools/review/roster.ts:10",
  "- **Defect:** the parser ignores a second roster row silently",
  "",
  `**Commit reviewed:** ${COMMIT}`,
  "**Signed:** Codex CLI gpt-5.2-codex",
  "",
].join("\n");

test("a conforming review with findings passes", () => {
  const v = validateReview(conforming, COMMIT);
  assert.equal(v.conforming, true);
  assert.deepEqual(v.missing, []);
});

test("a zero-findings review that names the commit and signs passes", () => {
  const review = [
    "No findings under any lens.",
    "",
    `**Commit reviewed:** ${COMMIT}`,
    "**Signed:** Codex CLI gpt-5.2-codex",
  ].join("\n");
  const v = validateReview(review, COMMIT);
  assert.equal(v.conforming, true);
});

test("a reviewer-invented severity is nonconforming and named", () => {
  const review = conforming.replace("should-fix", "critical");
  const v = validateReview(review, COMMIT);
  assert.equal(v.conforming, false);
  assert.ok(v.missing.some((m) => m.includes("critical")));
});

test("a review that does not name the bound commit is nonconforming", () => {
  const review = conforming.replace(`**Commit reviewed:** ${COMMIT}`, "");
  const v = validateReview(review, COMMIT);
  assert.equal(v.conforming, false);
  assert.ok(v.missing.some((m) => /commit/i.test(m)));
});

test("a review naming a different commit is nonconforming", () => {
  const v = validateReview(conforming, "c".repeat(40));
  assert.equal(v.conforming, false);
  assert.ok(v.missing.some((m) => /commit/i.test(m)));
});

test("an unsigned review is nonconforming", () => {
  const review = conforming.replace(/\*\*Signed:\*\*.*\n?/, "");
  const v = validateReview(review, COMMIT);
  assert.equal(v.conforming, false);
  assert.ok(v.missing.some((m) => /sign/i.test(m)));
});

test("a finding missing a required field is nonconforming and the field is named", () => {
  const review = conforming.replace(
    "- **Location:** tools/review/roster.ts:10\n",
    "",
  );
  const v = validateReview(review, COMMIT);
  assert.equal(v.conforming, false);
  assert.ok(v.missing.some((m) => /Location/.test(m)));
});

test("a type outside the findings vocabulary is nonconforming", () => {
  const review = conforming.replace("**Type:** defect", "**Type:** bug");
  const v = validateReview(review, COMMIT);
  assert.equal(v.conforming, false);
  assert.ok(v.missing.some((m) => /type/i.test(m)));
});
