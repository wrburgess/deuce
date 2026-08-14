import { test } from "node:test";
import assert from "node:assert/strict";
import { classify } from "./credential.ts";

test("a fine-grained token is plausible, and its prefix is named", () => {
  const verdict = classify(`github_pat_${"A".repeat(82)}`);
  assert.equal(verdict.kind, "plausible");
  assert.equal(verdict.kind === "plausible" && verdict.prefix, "github_pat_");
});

test("every GitHub credential form is recognized", () => {
  for (const prefix of ["github_pat_", "ghp_", "gho_", "ghu_", "ghs_", "ghr_"]) {
    assert.equal(classify(`${prefix}${"x".repeat(40)}`).kind, "plausible", prefix);
  }
});

test("surrounding whitespace from a pipe does not disqualify a token", () => {
  assert.equal(classify(`  ghp_${"x".repeat(36)}\n`).kind, "plausible");
});

// The receipt: this exact shape — 18 characters, no prefix — was stored twice
// on #108 and cost two proving runs to discover.
test("a word typed where a token belongs is refused, with its length named", () => {
  const verdict = classify("Willowbrook123abcd");
  assert.equal(verdict.kind, "not-a-token");
  assert.match(verdict.kind === "not-a-token" ? verdict.why : "", /18 characters/);
  assert.match(verdict.kind === "not-a-token" ? verdict.why : "", /github_pat_/);
});

test("a passphrase with spaces is refused as a capture of something else", () => {
  const verdict = classify("correct horse battery staple");
  assert.equal(verdict.kind, "not-a-token");
  assert.match(verdict.kind === "not-a-token" ? verdict.why : "", /whitespace/);
});

test("empty and whitespace-only stdin are the paste that did not land", () => {
  assert.equal(classify("").kind, "empty");
  assert.equal(classify("   \n\t ").kind, "empty");
});

test("a token with an inner newline is refused rather than silently truncated", () => {
  // A wrapped paste is the realistic form of this: storing the first line only
  // would produce a credential that is present, wrong, and plausible-looking.
  assert.equal(classify(`github_pat_${"A".repeat(40)}\n${"B".repeat(40)}`).kind, "not-a-token");
});
