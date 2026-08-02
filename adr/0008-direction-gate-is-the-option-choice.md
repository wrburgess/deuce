# ADR 0008: The Direction gate is the option choice, and is graduated from birth

- Status: accepted
- Date: 2026-08-02

## Decision

The first of the two **gates** — the points where the **HC** (human collaborator) supplies judgment —
sits at the end of **Assess**, where the HC chooses among the Assessment's options. It is named the
**Direction gate**. The **Plan** that follows is the **AC**'s (AI collaborator's) work product and
carries no approval gate of its own; it is still posted, and still read by Verify.

Its policy is **graduated from birth**, in the pattern Chapter 0 set for merge authority. Two
settings are written now: `required`, where the HC chooses, and `delegated`, where the AC proceeds on
its own recommendation and no human waits. A four-part floor is named and reachable by neither
setting — the Assessment is always posted before work proceeds on it, always carries the rejected
options and why, always states that the AC self-selected and on what reasoning, and never licenses
compressing away a stage or a stop. `delegated` ships unusable, and becomes usable only once an
option set can be independently reviewed (Chapter 2) and an unattended run has somewhere to route a
stop (Chapter 6).

## Why (the trade-off that was live)

- **What was given up: a human read of the Plan before code exists.** A Plan can be wrong in ways the
  option choice never reached — a bad sequence, a missed edge case, a testing strategy that tests the
  wrong thing — and under this decision nobody catches that until Verify compares the diff against
  it.
- **What absorbs the loss:** the Plan is posted and readable, Verify's drift check is *against* it,
  and re-planning is a sanctioned loop rather than a failure. The Plan being unapproved does not make
  it unexamined.
- **What it buys — the gate matches what Chapter 0 actually grants.** Chapter 0 gives the HC judgment
  over *what to build*; choosing among genuinely different options is that decision. Approving the
  AC's plan is a second pass over the AC's own work, which is review, not direction.
- **The failure being avoided:** the predecessor put its gate on plan approval, found it too
  expensive to keep, and shipped it `auto` — so the gate it retained by default was the one it did
  not want, and the option pick it did want stopped pausing at all
  (https://github.com/wrburgess/ace/blob/main/docs/adr/0029-baseline-ships-ungated-to-merge.md). A
  gate placed where the human does not want to stand gets waived, and the waiver takes the real
  decision with it.
- **Why it is hard to reverse:** gate placement is governance, not tooling. Moving a gate later means
  re-deciding what the HC's judgment is *for*, at whatever moment the move is convenient — the exact
  pressure Chapter 0's merge-authority decision exists to avoid.
- **What graduation gives up:** a third body of text nobody can exercise. `delegated` cannot be used
  for at least one more chapter, and unexercised text rots — the same cost Chapter 0 accepted for
  `attested`, paid a second time.
- **What graduation buys:** a later chapter can only build the machinery, never negotiate the floor
  away. The alternative — ship `required`, decide the loosened setting when it is wanted — puts the
  question of who chooses what to build on the table at the exact moment automation makes loosening
  convenient. The predecessor's gate is what that looks like: placed on plan approval, found too
  expensive, defaulted off, and the option pick it should have protected stopped pausing at all.
- **Why the floor is four clauses rather than one:** each closes a way `delegated` could quietly
  become *no gate*. Posting late would let work proceed unrecorded; stripping the rejected options
  would hide that a choice existed; omitting that the AC self-selected would make the artifact
  unauditable; and letting it reach compression would let one waived pause remove a whole stage.

## Supersedes / references

- Ratified chapter: [`sds/01-lifecycle-and-skills.md`](../sds/01-lifecycle-and-skills.md) —
  *The two gates*.
- Chapter 0's gate structure and merge-authority precedent:
  [`sds/00-identity-and-governance.md`](../sds/00-identity-and-governance.md) → *Governance*;
  [`adr/0005`](0005-merge-authority-graduated-from-birth.md).
- The predecessor's placement and the default that hollowed it out, cited not copied:
  https://github.com/wrburgess/ace/blob/main/docs/adr/0029-baseline-ships-ungated-to-merge.md
