# ADR 0008: The Direction gate is the option choice, not plan approval

- Status: accepted
- Date: 2026-08-02

## Decision

The first of the two **gates** — the points where the **HC** (human collaborator) supplies judgment —
sits at the end of **Assess**, where the HC chooses among the Assessment's options. It is named the
**Direction gate**. The **Plan** that follows is the **AC**'s (AI collaborator's) work product and
carries no approval gate of its own; it is still posted, and still read by Verify.

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
- **What is deliberately not decided:** whether the Direction gate may ever be loosened, and to what.
  That needs evidence about unattended runs, so it belongs to Chapter 6, and whatever it settles must
  name its floor the way merge authority did.

## Supersedes / references

- Ratified chapter: [`sds/01-lifecycle-and-skills.md`](../sds/01-lifecycle-and-skills.md) —
  *The two gates*.
- Chapter 0's gate structure and merge-authority precedent:
  [`sds/00-identity-and-governance.md`](../sds/00-identity-and-governance.md) → *Governance*;
  [`adr/0005`](0005-merge-authority-graduated-from-birth.md).
- The predecessor's placement and the default that hollowed it out, cited not copied:
  https://github.com/wrburgess/ace/blob/main/docs/adr/0029-baseline-ships-ungated-to-merge.md
