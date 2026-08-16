---
name: verify
description: Stage 4 of the deuce lifecycle. The pull request exists, or review has left findings on it; examine the whole diff against the Plan, try to refute the change, summon the contractor review, answer every finding — the AC's and the reviewer's together — and post the Verification on the pull request.
---

# verify — Stage 4 of the lifecycle

The packaged procedure for
[Chapter 1 → Stage 4 — Verify](https://github.com/wrburgess/deuce/blob/main/sds/01-lifecycle-and-skills.md#stage-4--verify). This body
carries the verbs and links the variables; the stage itself — trigger, work, terminal artifact,
exit — is canon and is not restated here.

## When it is invoked

- The pull request exists —
  [the Stage 4 trigger](https://github.com/wrburgess/deuce/blob/main/sds/01-lifecycle-and-skills.md#stage-4--verify).
- Or findings arrive on the pull request after the Verification is posted — they are answered
  here ([ADR 0009](https://github.com/wrburgess/deuce/blob/main/adr/0009-review-response-folded-into-verify.md)).

## Procedure

1. **Read the pull request from the tracker** — description, labels, the whole diff, and every
   comment and thread ([Stage 4](https://github.com/wrburgess/deuce/blob/main/sds/01-lifecycle-and-skills.md#stage-4--verify)).
2. **Read the posted Plan from the issue the pull request links** — where a re-plan
   superseded one, the latest posted Plan is the Plan
   ([Stops](https://github.com/wrburgess/deuce/blob/main/sds/01-lifecycle-and-skills.md#stops), trigger 2).
3. **Read the stage's routing** — which model and effort runs this stage is
   [`config/models.md`](../../../config/models.md); what may be offloaded is nothing — **every step
   below runs in the AC's own loop, on the whole diff**
   ([Stage 4](https://github.com/wrburgess/deuce/blob/main/sds/01-lifecycle-and-skills.md#stage-4--verify)).
4. **Hunt drift in both directions** — the diff against the Plan for the unplanned, the Plan
   against the diff for the missing
   ([Stage 4](https://github.com/wrburgess/deuce/blob/main/sds/01-lifecycle-and-skills.md#stage-4--verify)).
5. **Try to refute the change — construct the case where it breaks.** Hunt the lens menu's
   standing classes first, then attack beyond them; the recorded classes are where defects have
   been, not the only places they are
   ([Stage 4](https://github.com/wrburgess/deuce/blob/main/sds/01-lifecycle-and-skills.md#stage-4--verify);
   [Chapter 2 → Verify's external half, now written](https://github.com/wrburgess/deuce/blob/main/sds/02-review-and-findings.md#verifys-external-half-now-written)).
   For code, build the input or state that breaks it: off-by-one, empty or missing value, boundary
   value, duplicate, concurrent operation, unauthorized path. For prose, build the reading that
   breaks it: the claim false in an edge case, the pointer that resolves to the wrong place, the
   statement true only as of when it was written, the instruction two readers would follow
   differently. A breaking case actually constructed is a finding; **a concern that could not be
   confirmed is recorded as a finding, never dropped** — "I couldn't prove it" resolves to
   *record*, not *dismiss*.
6. **Attack the change's own tests — don't count them.** For each test ask: *if this passed but
   the change were broken, would I know?* Hunt the false green that would still pass if the change
   were reverted, the missing sad path, and the assertion that checks "it ran" instead of "it is
   correct" ([Stage 4](https://github.com/wrburgess/deuce/blob/main/sds/01-lifecycle-and-skills.md#stage-4--verify)). Then **walk the
   coverage by the architectural map** — the same groups the Delivery Record's Changes render in
   ([Chapter 1 → The Delivery Record](https://github.com/wrburgess/deuce/blob/main/sds/01-lifecycle-and-skills.md#the-delivery-record)):
   for each group the diff touches, name what covers it; a touched group with nothing covering it
   is a finding, and the Verification states coverage group by group, never in aggregate. Why
   per-group: aggregate coverage hides the empty layer — the origin of this walk is the
   predecessor lineage's per-layer checklist, part of the practice behind the HC's ~80%
   measurement on #62.
7. **Assume the reviewer's posture, and fix now what it would flag.** Before summoning, ask: *what
   is the single most likely finding the contractor reviewer returns on this diff?* — incomplete
   coverage, a missing edge or error path, a requirement from the issue not fully addressed, a
   restatement of content another document owns. Fix it before the summons, so the review
   *confirms* rather than *corrects*. Why the step exists: run at full strength under the
   predecessor, this pass cut contractor findings by roughly 80% — the measurement behind the
   one-wave limit in [`config/review.md`](../../../config/review.md), which this step is what makes
   affordable.
8. **Declare the lens set fit for the subject, then summon the contractor review** — the set per
   [Chapter 2 → Bounded by lens set](https://github.com/wrburgess/deuce/blob/main/sds/02-review-and-findings.md#bounded-by-lens-set-not-by-round-count),
   prose subjects per
   [Chapter 2 → Verifying prose](https://github.com/wrburgess/deuce/blob/main/sds/02-review-and-findings.md#verifying-prose); run the
   summons path ([`tools/review/summon.ts`](../../../tools/review/summon.ts)), whose contract is
   [Chapter 2 → The summons, completed](https://github.com/wrburgess/deuce/blob/main/sds/02-review-and-findings.md#the-summons-completed)
   and [→ Validation on return](https://github.com/wrburgess/deuce/blob/main/sds/02-review-and-findings.md#validation-on-return). **A run
   with no reachable reviewer stops and asks.**
9. **Record every finding, the AC's and the reviewer's together; answer an accepted-register match
   by its entry**
   ([Chapter 2 → The findings home](https://github.com/wrburgess/deuce/blob/main/sds/02-review-and-findings.md#the-findings-home);
   [ADR 0011](https://github.com/wrburgess/deuce/blob/main/adr/0011-findings-type-state-one-way.md)).
10. **Dispose of each finding; batch the fixes into one wave, and verify the wave yourself** —
   for each accepted finding the mechanism restated in one sentence and the failing test that
   exercises it, then steps 4–6 re-run on the wave's diff — bounds and escalation per
   [Chapter 2 → Fix-verification, bounded separately](https://github.com/wrburgess/deuce/blob/main/sds/02-review-and-findings.md#fix-verification-bounded-separately),
   the limit's value in [`config/review.md`](../../../config/review.md), the escalation into
   [Devise](../devise/SKILL.md). Re-run the checks to green.
11. **If the wave moved the head, summon the further review on that head — once, and never twice.**
    Bound to the head the wave produced, scoped to the wave's diff and to the lenses that raised the
    findings; a wave that moved nothing owes no further summons, and step 8's review is then the last
    one:

    ```
    node tools/review/summon.ts --pr <n> --commit <wave head> --base <reviewed commit> \
      --lens "<each lens that raised a finding>"
    ```

    **Nothing this review finds is fixed here** — a fix moves the head and breaks the binding the
    summons was raised to establish. A `must-fix` sends the pull request to the HC to merge,
    whatever the Ship gate's declared setting ([`config/gates.md`](../../../config/gates.md)); a
    `should-fix` is promoted to tracked work or accepted as residual, on the record; a `note` is
    recorded. Every one lands on the Verification with its disposition. **Once the summons owed has
    returned, the head is final** — any movement past the last conforming review, a further fix or an
    update from the base branch alike, leaves nothing bound to what merges, and that pull request
    goes to the HC. There is never a third summons; the rule and every clause on it are
    [Chapter 2 → Fix-verification, bounded separately](https://github.com/wrburgess/deuce/blob/main/sds/02-review-and-findings.md#fix-verification-bounded-separately).
12. **Answer each finding on the surface it arrived on** — a pull request carries three:
    comments, inline threads, review bodies; a self-raised finding is answered in the
    Verification itself ([Stage 4](https://github.com/wrburgess/deuce/blob/main/sds/01-lifecycle-and-skills.md#stage-4--verify)).
13. **Read [`rules/authoring.md`](../../../rules/authoring.md)** at the moment of writing.
14. **Draft the Verification as a Readout** — content per
    [Stage 4](https://github.com/wrburgess/deuce/blob/main/sds/01-lifecycle-and-skills.md#stage-4--verify), grown to the record
    [Chapter 2 → Verify's external half, now written](https://github.com/wrburgess/deuce/blob/main/sds/02-review-and-findings.md#verifys-external-half-now-written)
    requires — the reviewer, its model, its mechanism, and the commit named in it; shape per
    [Chapter 1 → The Readout](https://github.com/wrburgess/deuce/blob/main/sds/01-lifecycle-and-skills.md#the-readout).
15. **Post the Verification on the pull request**
    ([Stage 4](https://github.com/wrburgess/deuce/blob/main/sds/01-lifecycle-and-skills.md#stage-4--verify)).

## Terminal artifact

The Verification, posted on the pull request
([Stage 4](https://github.com/wrburgess/deuce/blob/main/sds/01-lifecycle-and-skills.md#stage-4--verify)).

## When it stops and asks

On any of the four standing triggers —
[Chapter 1 → Stops](https://github.com/wrburgess/deuce/blob/main/sds/01-lifecycle-and-skills.md#stops). The question and its answer are
recorded on the pull request before the answer is acted on.

## Prior art

Re-authored from a reading of
[ace's `verify`](https://github.com/wrburgess/ace/blob/main/skills/verify/SKILL.md) and
[ace's `listen`](https://github.com/wrburgess/ace/blob/main/skills/listen/SKILL.md) — the latter
absorbed here, per [the audit](https://github.com/wrburgess/deuce/blob/main/sds/01-lifecycle-and-skills.md#the-audit) — under
[ADR 0006](https://github.com/wrburgess/deuce/blob/main/adr/0006-skills-self-contained.md): read and attributed, never vendored.
