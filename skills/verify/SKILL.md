---
name: verify
description: Stage 4 of the deuce lifecycle. The pull request exists, or review has left findings on it; examine the whole diff against the Plan, try to break the change, answer every finding, and post the Verification on the pull request.
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
2. **Read the final posted Plan from the issue the pull request links** — where a re-plan
   superseded one, the latest posted Plan is the Plan
   ([Stops](../../sds/01-lifecycle-and-skills.md#stops), trigger 2).
3. **Read the stage's routing** — which model and effort runs this stage is
   [`config/models.md`](../../config/models.md); what may be offloaded is nothing — **every step
   below runs in the AC's own loop, on the whole diff**
   ([Stage 4](../../sds/01-lifecycle-and-skills.md#stage-4--verify)).
4. **Hunt drift in both directions** — the diff against the Plan for the unplanned, the Plan
   against the diff for the missing
   ([Stage 4](../../sds/01-lifecycle-and-skills.md#stage-4--verify)).
5. **Try to refute the change**
   ([Stage 4](../../sds/01-lifecycle-and-skills.md#stage-4--verify)).
6. **Attack the change's own tests, hunting the false green**
   ([Stage 4](../../sds/01-lifecycle-and-skills.md#stage-4--verify)).
7. **Record every finding** — from the drift hunt, the refutations, and every thread review has
   left; how a finding is rated, and its record beyond this pull request, are Chapter 2's
   ([Chapter 1 → What this chapter does not cover](../../sds/01-lifecycle-and-skills.md#what-this-chapter-does-not-cover)).
8. **Dispose of each finding; fix what is accepted and re-run the checks to green**
   ([Stage 4](../../sds/01-lifecycle-and-skills.md#stage-4--verify)).
9. **Answer each finding on the surface it arrived on** — a pull request carries three:
   comments, inline threads, review bodies; a self-raised finding is answered in the
   Verification itself ([Stage 4](../../sds/01-lifecycle-and-skills.md#stage-4--verify)).
10. **Read [`rules/authoring.md`](../../rules/authoring.md)** at the moment of writing.
11. **Draft the Verification as a Readout** — content per
    [Stage 4](../../sds/01-lifecycle-and-skills.md#stage-4--verify), shape per
    [Chapter 1 → The Readout](../../sds/01-lifecycle-and-skills.md#the-readout) — **stating
    plainly that it is self-review and the adversarial pass, and that no independent review
    happened** ([Stage 4](../../sds/01-lifecycle-and-skills.md#stage-4--verify)).
12. **Post the Verification on the pull request**
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
