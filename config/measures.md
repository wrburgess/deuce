---
date: 2026-08-13
source: the Direction gate on #57, where Option A — compute what is computable — was chosen, and with it the split Quality line and the fourth tool family
measures:
  - name: quality
    capture: computed-in-part
    command: npm run measures
  - name: autonomy
    capture: declared
  - name: throughput
    capture: computed
    command: npm run measures
  - name: cost-efficiency
    capture: un-instrumented
---

# The health measures, and how each is captured

Which of the four health measures is instrumented today, and by what. The four measures, their
home in the Delivery Record, and the rule that a measure with no capture path says so rather than
carrying an estimate are canon, at [Chapter 1](../sds/01-lifecycle-and-skills.md) → *Where the
health measures live* and [Chapter 3](../sds/03-quality-gate-and-tooling.md) → *Capturing the
health measures*, and are not restated here. Chapter 3 says in as many words that which measures
are instrumented at any moment is configuration rather than canon, "because it would become false
the month the platform changed" — this file is that configuration, under
[Chapter 1](../sds/01-lifecycle-and-skills.md) → *The adaptive layer's home*.

The frontmatter is the machine half: one item per measure, carrying `name`, `capture`, and the
`command` where one exists. [`tools/measures/render.ts`](../tools/measures/render.ts) reads it, so
the capture states a reader sees here and the ones the printed block claims are the same states
rather than two that agree by convention.

## The four captures

| Measure | Capture | What that means here |
|---|---|---|
| **Quality** | `computed-in-part` | The contractor's half is computed from the standing findings records on the pull request thread. The AC's own findings are **declared** — nothing enforces their shape, so nothing can count them |
| **Autonomy** | `declared` | HC interventions beyond the two gates are not a fact any artifact holds. No number is printed beside it that a reader could mistake for it |
| **Throughput** | `computed` | From the tracker: the issue's opening to the Delivery Record. Before the record posts, the end stamp is the moment of the run, and the output says so |
| **Cost efficiency** | `un-instrumented` | **No capture path exists on this platform at this date.** Per Chapter 3 it is recorded as un-instrumented and never estimated — an estimate enters the baseline and nothing afterwards tells it from a measurement |

## Why Quality is half a measure, and stays honest about it

Measured across all 44 Delivery Records on the tracker, 2026-08-13: a Quality computed from the one
shape the gate enforces — the standing findings record, [#56](https://github.com/wrburgess/deuce/issues/56)'s
`findings-record-fields` check — reproduces the number the record states on **5 of 44**. The
difference is not error. The records legitimately count the AC's own findings as well
([PR #48](https://github.com/wrburgess/deuce/pull/48) — all eight the AC's, none the contractor's;
[PR #98](https://github.com/wrburgess/deuce/pull/98) — "3 reviewer, 1 self"), and those live in the
Verification as free-form tables.

- **So the printed block carries two halves, each labeled.** The computed half can never be read as
  the whole count, which is the proxy defect this repository's findings index names most often.
- **What would change this line:** an enforced shape for the AC's own findings, which was Option B
  at the Direction gate on #57 and was not chosen. If it ever lands, `capture` here becomes
  `computed` and this section goes.

## What is deliberately not declared

- **A cost-efficiency capture path.** None exists; inventing one is not this file's business, and
  Chapter 3 forbids the estimate that would stand in for it. The day the platform exposes usage per
  session, the `capture` field above is the one edit.
- **A payload class for `tools/measures/`.** The family is not in
  [`config/payload.md`](payload.md) at this date and does not ship: it computes over this
  repository's own conventions, and no host has asked for it. Adding it is a class decision
  ([ADR 0021](../adr/0021-three-payload-classes-seed-host-owned.md)) to be made when one does.
- **Any gate entry.** The command is not a check and joins no gate
  ([`config/checks.md`](checks.md)); it is still subject to the gate that runs it, through
  `npm test` and `npm run typecheck`.
