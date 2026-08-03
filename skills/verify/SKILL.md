---
name: verify
description: Stage 4 of the deuce lifecycle. The pull request exists, or review has left findings on it; examine the whole diff against the Plan, try to refute the change, summon the contractor review, answer every finding — the AC's and the reviewer's together — and post the Verification on the pull request.
---

# verify — Stage 4 of the lifecycle

The packaged procedure for
[Chapter 1 → Stage 4 — Verify](../../sds/01-lifecycle-and-skills.md#stage-4--verify). This body
carries the verbs and links the variables; the stage itself — trigger, work, terminal artifact,
exit — is canon and is not restated here.

## When it is invoked

- The pull request exists —
  [the Stage 4 trigger](../../sds/01-lifecycle-and-skills.md#stage-4--verify).
- Or findings arrive on the pull request after the Verification is posted — they are answered
  here ([ADR 0009](../../adr/0009-review-response-folded-into-verify.md)).

## Procedure

1. **Read the pull request from the tracker** — description, labels, the whole diff, and every
   comment and thread ([Stage 4](../../sds/01-lifecycle-and-skills.md#stage-4--verify)).
2. **Read the posted Plan from the issue the pull request links** — where a re-plan
   superseded one, the latest posted Plan is the Plan
   ([Stops](../../sds/01-lifecycle-and-skills.md#stops), trigger 2).
3. **Read the stage's routing** — which model and effort runs this stage is
   [`config/models.md`](../../config/models.md); what may be offloaded is nothing — **every step
   below runs in the AC's own loop, on the whole diff**
   ([Stage 4](../../sds/01-lifecycle-and-skills.md#stage-4--verify)).
4. **Hunt drift in both directions** — the diff against the Plan for the unplanned, the Plan
   against the diff for the missing
   ([Stage 4](../../sds/01-lifecycle-and-skills.md#stage-4--verify)).
5. **Try to refute the change, hunting the lens menu's standing classes** — the adversarial pass
   hunts the recorded classes instead of re-deriving its list each run
   ([Stage 4](../../sds/01-lifecycle-and-skills.md#stage-4--verify);
   [Chapter 2 → Verify's external half, now written](../../sds/02-review-and-findings.md#verifys-external-half-now-written)).
6. **Try to break the change's own tests, hunting the false green**
   ([Stage 4](../../sds/01-lifecycle-and-skills.md#stage-4--verify)).
7. **Declare the lens set fit for the subject, then summon the contractor review** — the set per
   [Chapter 2 → Bounded by lens set](../../sds/02-review-and-findings.md#bounded-by-lens-set-not-by-round-count),
   prose subjects per
   [Chapter 2 → Verifying prose](../../sds/02-review-and-findings.md#verifying-prose); run the
   summons path ([`tools/review/summon.ts`](../../tools/review/summon.ts)), whose contract is
   [Chapter 2 → The summons, completed](../../sds/02-review-and-findings.md#the-summons-completed)
   and [→ Validation on return](../../sds/02-review-and-findings.md#validation-on-return). **A run
   with no reachable reviewer stops and asks.**
8. **Record every finding, the AC's and the reviewer's together; answer an accepted-register match
   by its entry**
   ([Chapter 2 → The findings home](../../sds/02-review-and-findings.md#the-findings-home);
   [ADR 0011](../../adr/0011-findings-type-state-one-way.md)).
9. **Dispose of each finding; batch the fixes per wave, and re-summon the reviewer once on the
   whole wave** — bounds and escalation per
   [Chapter 2 → Fix-verification, bounded separately](../../sds/02-review-and-findings.md#fix-verification-bounded-separately),
   the limit's value in [`config/review.md`](../../config/review.md), the escalation into
   [Devise](../devise/SKILL.md). Re-run the checks to green.
10. **Answer each finding on the surface it arrived on** — a pull request carries three:
    comments, inline threads, review bodies; a self-raised finding is answered in the
    Verification itself ([Stage 4](../../sds/01-lifecycle-and-skills.md#stage-4--verify)).
11. **Read [`rules/authoring.md`](../../rules/authoring.md)** at the moment of writing.
12. **Draft the Verification as a Readout** — content per
    [Stage 4](../../sds/01-lifecycle-and-skills.md#stage-4--verify), grown to the record
    [Chapter 2 → Verify's external half, now written](../../sds/02-review-and-findings.md#verifys-external-half-now-written)
    requires — the reviewer, its model, its mechanism, and the commit named in it; shape per
    [Chapter 1 → The Readout](../../sds/01-lifecycle-and-skills.md#the-readout).
13. **Post the Verification on the pull request**
    ([Stage 4](../../sds/01-lifecycle-and-skills.md#stage-4--verify)).

## Terminal artifact

The Verification, posted on the pull request
([Stage 4](../../sds/01-lifecycle-and-skills.md#stage-4--verify)).

## When it stops and asks

On any of the four standing triggers —
[Chapter 1 → Stops](../../sds/01-lifecycle-and-skills.md#stops). The question and its answer are
recorded on the pull request before the answer is acted on.

## Prior art

Re-authored from a reading of
[ace's `verify`](https://github.com/wrburgess/ace/blob/main/skills/verify/SKILL.md) and
[ace's `listen`](https://github.com/wrburgess/ace/blob/main/skills/listen/SKILL.md) — the latter
absorbed here, per [the audit](../../sds/01-lifecycle-and-skills.md#the-audit) — under
[ADR 0006](../../adr/0006-skills-self-contained.md): read and attributed, never vendored.
