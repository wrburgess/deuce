# ADR 0005: Merge authority is graduated from birth

- Status: accepted
- Date: 2026-08-02

## Decision

Merge policy is written at full shape now, before the machinery that would use it exists. A merge is
either `required` — a human performs it — or **attested**: the **AC** (AI collaborator — the single
agent that acts here) may merge, but only against an independent review from a model other than the
AC, bound to the exact commit being merged. Merging on the AC's own say-so is not available at any
setting. Today every merge is `required`; `attested` cannot be used until the Review System and
Findings System are ratified in Chapter 2.

## Why (the trade-off that was live)

- **What was given up:** policy sits ahead of mechanism. `attested` is text nobody can exercise for
  at least two chapters, and unexercised text is text that can quietly rot.
- **What it buys:** later chapters build toward a fixed target. The alternative — ship `required`
  only, and decide the loosened setting when it is wanted — puts the question of merge authority on
  the table at the exact moment automation makes loosening it convenient. The predecessor amended its
  merge gate under that pressure
  (https://github.com/wrburgess/ace/blob/main/docs/adr/0037-merge-gate-accepts-attested.md).
- **The floor is what makes it a gate:** an independent, commit-bound review is a mechanism; the AC's
  own confidence is not. Naming the floor now means a later chapter can only build the review
  machinery, never negotiate the floor away.
- **Why it is hard to reverse:** merge is one of the two **gates** — the two points where the human
  collaborator supplies judgment. Widening one once sets the precedent that it can be widened again.

## Supersedes / references

- Ratified chapter: [`sds/00-identity-and-governance.md`](../sds/00-identity-and-governance.md) —
  *Governance* → *Merge authority*.
- The predecessor's amendment, cited as the pattern this avoids repeating:
  https://github.com/wrburgess/ace/blob/main/docs/adr/0037-merge-gate-accepts-attested.md
