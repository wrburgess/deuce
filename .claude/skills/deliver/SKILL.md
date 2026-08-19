---
name: deliver
description: Stage 5 of the deuce lifecycle. The Verification carries no open must-fix finding; re-confirm the checks are green on the current head, write the Delivery Record on the pull request with its reference on the issue, then act on the Ship gate at its declared setting.
---

# deliver — Stage 5 of the lifecycle

The packaged procedure for
[Chapter 1 → Stage 5 — Deliver](https://github.com/wrburgess/deuce/blob/main/sds/01-lifecycle-and-skills.md#stage-5--deliver). This body
carries the verbs and links the variables; the stage itself — trigger, work, terminal artifact,
exit — is canon and is not restated here.

## When it is invoked

The Verification on the pull request carries no open must-fix finding —
[the Stage 5 trigger](https://github.com/wrburgess/deuce/blob/main/sds/01-lifecycle-and-skills.md#stage-5--deliver).

## Procedure

1. **Read the pull request from the tracker** — description, labels, the current head, the whole
   diff, the Verification, and every comment and thread
   ([Stage 5](https://github.com/wrburgess/deuce/blob/main/sds/01-lifecycle-and-skills.md#stage-5--deliver)).
2. **Read the issue the pull request links** — title, body, labels, and every existing comment;
   the Assessment, the gate record, and the latest posted Plan are among the comments, and the
   record is written from them
   ([Chapter 1 → Stages communicate only through terminal artifacts](https://github.com/wrburgess/deuce/blob/main/sds/01-lifecycle-and-skills.md#stages-communicate-only-through-terminal-artifacts)).
3. **Read the stage's routing** — which model and effort runs this stage is `config/models.md`;
   what may be offloaded, and in what shape, is `config/delegation.md`. **Either may be absent — a
   repository that has not declared it has no such file:** with no `config/models.md` the stage runs
   on the session it was launched in, with no `config/delegation.md` nothing is delegated, and the
   Delivery Record names whichever it could not read.
4. **Re-confirm the checks are green on the current head** — green is confirmed here, never
   produced here; a red check re-enters [Verify](../verify/SKILL.md), where the fix loop lives,
   and this stage runs again from its trigger
   ([Stage 5](https://github.com/wrburgess/deuce/blob/main/sds/01-lifecycle-and-skills.md#stage-5--deliver);
   [ADR 0009](https://github.com/wrburgess/deuce/blob/main/adr/0009-review-response-folded-into-verify.md)).
5. **Read the authoring rules for what you are about to write**, at the moment of writing —
   `rules/authoring.md` where the repository has grown one. **A repository's `rules/` is born empty
   and grows on its own receipts**
   ([ADR 0019](https://github.com/wrburgess/deuce/blob/main/adr/0019-rules-admit-on-local-receipts-at-every-source.md)),
   so an absent file is the design and not a defect — note the absence and write on.
6. **Write the three prose fields first** — why the other options were rejected; what was tried
   and abandoned, so it is not re-proposed; what is fragile, and what the AC was unsure about at
   the end — each carrying only what the repository cannot reconstruct
   ([Chapter 1 → The Delivery Record](https://github.com/wrburgess/deuce/blob/main/sds/01-lifecycle-and-skills.md#the-delivery-record)).
7. **Assemble the Record in its declared shape** — Summary (HC) with Problem then Solution;
   Changes grouped by the architectural map the HC reads the repository through, empty groups
   omitted; Findings with the four health measures; Description (AC + HC) carrying the prose
   fields and the limitations — content and shape per
   [The Delivery Record](https://github.com/wrburgess/deuce/blob/main/sds/01-lifecycle-and-skills.md#the-delivery-record), the four
   health measures per
   [Chapter 1 → Where the health measures live](https://github.com/wrburgess/deuce/blob/main/sds/01-lifecycle-and-skills.md#where-the-health-measures-live),
   the scannable half's rules per [Chapter 1 → The Readout](https://github.com/wrburgess/deuce/blob/main/sds/01-lifecycle-and-skills.md#the-readout).
   **Where this repository provides a measures command, run it and take the computed measures from
   its output**; where it does not, read them from the tracker by hand. A measure with no capture
   path is recorded as un-instrumented and never estimated
   ([Chapter 3 → Capturing the health measures](https://github.com/wrburgess/deuce/blob/main/sds/03-quality-gate-and-tooling.md#capturing-the-health-measures)).
8. **Post the Delivery Record on the pull request and set `status:done-pending-merge` on
   posting**
   ([Stage 5](https://github.com/wrburgess/deuce/blob/main/sds/01-lifecycle-and-skills.md#stage-5--deliver);
   [Chapter 1 → Binding to the Work Tracking System](https://github.com/wrburgess/deuce/blob/main/sds/01-lifecycle-and-skills.md#binding-to-the-work-tracking-system)).
9. **Post the reference on the issue** — a link to the Record — then **act on the Ship gate per its
   current setting** — `config/gates.md`; where that setting puts the merge in the AC's hands,
   **step 10 runs before the merge, not after**. **Absent that declaration the strictest setting governs**
   — the HC merges — and the Delivery Record says the setting was undeclared. The setting is read
   there, never from this file; the floor no setting reaches is canon
   ([Chapter 0 → Governance](https://github.com/wrburgess/deuce/blob/main/sds/00-identity-and-governance.md#governance) → *Merge
   authority*; [Stage 5](https://github.com/wrburgess/deuce/blob/main/sds/01-lifecycle-and-skills.md#stage-5--deliver)).
10. **Where the declared setting puts the merge in the AC's hands, establish all three of these
    first — on the current head, in this order, and never from memory of an earlier state:**

    | Establish | From |
    |---|---|
    | The whole gate was re-run on the merge candidate by something that is not the AC, and it is green | The check run recorded on the pull request by the declared continuous-integration provider (`config/ci.md`) — never a local run, however recent |
    | An independent review covers the code that is actually merging | A returned review bound to the current head. Where a fix wave moved the head past the first review, that binding is the further summons [Chapter 2](https://github.com/wrburgess/deuce/blob/main/sds/02-review-and-findings.md#fix-verification-bounded-separately) earns it; once the summons owed has returned, the head is final |
    | Neither has since gone stale | The head has not moved since both of the above were taken |

    **If any one of them cannot be established, the pull request parks for the HC exactly as at the
    strictest setting**, and the Delivery Record says which one and why. The looser setting degrades
    to the human; it never degrades what the merge rests on. This step adds no requirement of its
    own — it carries out, in the place that acts on them, requirements
    [Chapter 0](https://github.com/wrburgess/deuce/blob/main/sds/00-identity-and-governance.md#governance) and
    [Chapter 2](https://github.com/wrburgess/deuce/blob/main/sds/02-review-and-findings.md) already state.

## Terminal artifact

The Delivery Record on the pull request, plus the reference on the issue
([Stage 5](https://github.com/wrburgess/deuce/blob/main/sds/01-lifecycle-and-skills.md#stage-5--deliver)).

## When it stops and asks

On any of the four standing triggers —
[Chapter 1 → Stops](https://github.com/wrburgess/deuce/blob/main/sds/01-lifecycle-and-skills.md#stops). The question and its answer are
recorded on the pull request before the answer is acted on.

## Prior art

Re-authored from a reading of
[ace's `final`](https://github.com/wrburgess/ace/blob/main/skills/final/SKILL.md), per
[ADR 0006](https://github.com/wrburgess/deuce/blob/main/adr/0006-skills-self-contained.md) — read and attributed, never vendored.
