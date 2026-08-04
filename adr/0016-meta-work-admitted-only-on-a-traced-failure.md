# ADR 0016: Meta-work is admitted only on a traced failure

- Status: accepted
- Date: 2026-08-04

## Decision

A change to any governance surface — a chapter, a rule, a check, a lens, a tool, or a decision
record — is admitted only with a **receipt**: a finding, a class-index entry, or explicit HC
direction, traced to a failure that actually occurred, in this repository or in a host application.

**Improvement with no failure behind it is declined work.** The AC does not propose it, does not
open an issue for it, and does not fold it into a passing pull request. When a review or a working
session surfaces a governance improvement without a receipt, its home is the findings home — where
it waits until recurrence admits it — never the current branch.

Two boundaries on the rule itself:

- **The residual bootstrap exception is unaffected.** Drafting Chapters 4–6 is the one build-out a
  ratified chapter does not yet govern ([ADR 0002](0002-chapter-gated-build-bootstrap-exception.md)),
  and it proceeds on HC direction as before.
- **HC direction is always a sufficient receipt.** The rule binds the AC's initiative, not the HC's
  judgment. This decision set is itself admitted on that receipt: the HC's direction of 2026-08-04,
  recorded on #60.

## Why (the trade-off that was live)

The predecessor died of unreceipted improvement. Its history: 172 commits, of which 15 were
features; single findings re-opened across as many as fifteen fix rounds
(https://github.com/wrburgess/ace/issues/164); and in its first host application the same pattern
was measured from the other side — Tier-1 rules grew +152% in eight days while 75% of new issues
were meta-work (https://github.com/wrburgess/bryce/issues/185).

The mechanism is not carelessness. Governance work is the gradient the AC descends most easily:
prose review generates prose, every round of it looks like diligence, and "better instructions" has
no exit test the way a shipped feature does. deuce already bounds the *depth* of that work — the
lens set caps what one review carries ([ADR 0010](0010-review-bounded-by-lens-set.md)), the
two-wave limit stops fix churn ([`config/review.md`](../config/review.md)), and the rules file
takes a line only with a cited recurring defect ([`rules/authoring.md`](../rules/authoring.md)).
None of those bounds the *origin*: nothing stopped the AC from opening the next improvement on its
own initiative, and origin is where the volume came from.

**What was given up, and it is real:** genuinely good ideas will wait. An improvement the AC is
right about, with no failure yet on record, sits in the findings home until something breaks or the
HC calls for it. That lag is accepted deliberately — the predecessor's record shows the cost of the
opposite policy, and an idea that is right will still be right when its receipt arrives.

**What was considered and rejected:** a meta-work *budget* (a ratio ceiling on process commits).
It measures the symptom, invites gaming at the boundary, and would itself need a check — new
tooling in service of limiting new tooling. The admission rule needs no counter: either the receipt
exists and is cited, or the work does not start.

## Supersedes / references

- The rule this extends: [`sds/00-identity-and-governance.md`](../sds/00-identity-and-governance.md)
  → *The bootstrap exception* — "nothing may be built that a ratified chapter does not sanction"
  governed build-out; this decision applies the same shape to change.
- The depth bounds already in force: [ADR 0010](0010-review-bounded-by-lens-set.md);
  [`config/review.md`](../config/review.md) → *Fix-verification limit*;
  [`rules/authoring.md`](../rules/authoring.md) → *Growth bar*.
- The receipts: https://github.com/wrburgess/ace/issues/164 ·
  https://github.com/wrburgess/bryce/issues/185 · the HC's direction of 2026-08-04, recorded on #60.
