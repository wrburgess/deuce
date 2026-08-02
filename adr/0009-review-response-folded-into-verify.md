# ADR 0009: Review response is folded into Verify

- Status: accepted
- Date: 2026-08-02

## Decision

Responding to review findings — recording each, disposing of it, fixing what is accepted, re-running
the checks, and answering on the thread — happens inside **Verify**, the fourth lifecycle stage.
There is no review-response stage and no separate Skill for it. The lifecycle has five stages and
five stage Skills, one to one.

## Why (the trade-off that was live)

- **What was given up: a small, single-purpose Skill.** Verify now owns three jobs — drift check,
  adversarial pass, findings response — and it is the largest of the five. A reader looking for "how
  do I answer a review comment" has to know it lives inside verification.
- **What it buys — the seam disappears.** The predecessor ran a five-stage lifecycle with six Skills
  and had to describe one of them as *"Stage 5 (Deliver) + review-response"*: a step attached to a
  stage rather than being one. Every rule about gates, pauses, and autonomy then needed a special
  case for it, and decoupling that step's pause from the gate setting cost its own decision record
  (https://github.com/wrburgess/ace/blob/main/docs/adr/0028-context-reset-boundary-resumable-stops-autonomous-listen.md).
- **What it buys — the boundary is honest.** Verify is the stage where the change is examined.
  Answering a finding *is* examining the change; the only difference is who raised it. Splitting them
  put a stage boundary through the middle of one activity, which meant an artifact had to be invented
  to cross it.
- **Second effect:** Deliver becomes purely terminal — re-confirm green, record, hand to the HC —
  with no fix loop inside it. A stage that both fixes code and declares the work finished can declare
  it finished about code it just changed.
- **Why it is hard to reverse:** the stage count is load-bearing. `status:` advancement, the
  compression table, and every later orchestrator index on it, and re-splitting means re-deciding
  what artifact crosses the new boundary.
- **The half that is not usable yet:** rating a finding and recording it are the Review System's and
  Findings System's, ratified in Chapter 2. Until then Verify is self-review and the adversarial
  pass, and it says so rather than implying a review that did not happen.

## Supersedes / references

- Ratified chapter: [`sds/01-lifecycle-and-skills.md`](../sds/01-lifecycle-and-skills.md) —
  *Stage 4 — Verify*, and *Skills* → *The audit*.
- The predecessor's straddling step and the decision record its seam required, cited not copied:
  https://github.com/wrburgess/ace/blob/main/docs/standards/development-lifecycle.md
  https://github.com/wrburgess/ace/blob/main/docs/adr/0028-context-reset-boundary-resumable-stops-autonomous-listen.md
