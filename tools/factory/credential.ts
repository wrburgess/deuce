// What a stored credential must look like before anything probes it.
//
// Kept apart from credential-run.ts so that importing this in a test does not
// run the command — the separation tools/gate/run.ts already documents, and the
// receipt for it here is direct: the first draft ran main() at import and hung
// the test suite reading stdin.
//
// Why classify before probing at all: a network round trip is the slow way to
// learn that someone typed a word into a silent prompt. The 18 characters
// beginning "Will" that cost this build two proving runs fail here in the first
// millisecond (#108).

// Every GitHub credential carries one of these.
export const PREFIXES = ["github_pat_", "ghp_", "gho_", "ghu_", "ghs_", "ghr_"];

export type Classification =
  | { kind: "empty" }
  | { kind: "not-a-token"; why: string }
  | { kind: "plausible"; prefix: string };

export function classify(raw: string): Classification {
  const token = raw.trim();
  if (token === "") return { kind: "empty" };
  if (/\s/.test(token)) {
    // A wrapped paste is the realistic form of this. Trimming to the first line
    // would store a credential that is present, wrong, and plausible-looking —
    // the exact failure this file exists to end.
    return { kind: "not-a-token", why: "it contains whitespace, so something else was captured" };
  }
  const prefix = PREFIXES.find((p) => token.startsWith(p));
  if (prefix === undefined) {
    return {
      kind: "not-a-token",
      why:
        `it is ${token.length} characters and starts with none of GitHub's prefixes ` +
        `(${PREFIXES.join(", ")}) — a word or a password, not a token`,
    };
  }
  return { kind: "plausible", prefix };
}
