# Instruction-file line budget

A soft ceiling on the always-resident instruction file. The number is adaptive configuration under
[Chapter 1](../sds/01-lifecycle-and-skills.md) → *The adaptive layer's home*, because it tracks
vendor guidance that moves; it is exactly the class of statement
[ADR 0004](../adr/0004-invariant-adaptive-split.md) keeps out of canon and out of immutable records.

- **Date:** 2026-08-02
- **Source:** <https://code.claude.com/docs/en/memory>, read 2026-08-02 — "target under 200 lines
  per CLAUDE.md file. Longer files consume more context and reduce adherence." Re-verified
  2026-08-05 by the first hygiene sweep (#74): the quoted guidance and the imports-load-at-launch
  claim both stand verbatim.

## Declaration

- **`CLAUDE.md` stays under 200 lines.** Actual at this writing: 97.
- **Scope: `CLAUDE.md` alone.** It is deuce's only always-resident instruction file. `AGENTS.md` is
  the contractor reviewer's file, read on a summons rather than loaded every session, so it is not
  bound. Fixed at the Direction gate on #13.
- **Why a budget exists at all:** the vendor's stated reason is adherence, not capacity — a long
  always-resident file degrades instruction-following before it strains a context window. Splitting
  into imports does not help; the same source states that imported files still load at launch.

## Prior art

- [ace ADR 0022](https://github.com/wrburgess/ace/blob/main/docs/adr/0022-instruction-file-line-allowance.md)
  — the predecessor's line allowance, frozen in an immutable decision record: the counter-example
  ADR 0004 was written against, and the reason this number lives in a dated file instead.
