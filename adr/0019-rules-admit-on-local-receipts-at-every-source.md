# ADR 0019: Rules admit on local receipts at every source

- Status: accepted
- Date: 2026-08-04

## Decision

**Outside material informs a rule's statement; it never substitutes for the rule's evidence.**
A rule enters `rules/` only with receipts from this repository's own record — Chapter 1's entry
bar, unchanged — whatever the source and however strong its provenance. A practice with receipts
from someone else's repository is captured as a finding with its provenance, at zero cost, and
enters `rules/` on the day its class recurs here, with its statement ready.

## Why (the trade-off that was live)

Chapter 1 seeded `rules/` empty against a specific, observed failure: the predecessor's rules
files accumulated faster than the evidence behind them, and a file nobody can audit is a file
nobody trims. A borrowed receipt cannot be audited here — the class it cites lives in someone
else's index — and the hygiene sweep's retirement direction cannot run on it: a rule retires when
its class stops recurring, which is unobservable for a class that was never observed locally.
Admitting outside evidence would fill `rules/` with defenses whose liveness nothing can measure,
which is the predecessor's sediment rebuilt with better paperwork.

**What was given up, and it is real:** deuce re-pays for lessons others have already paid for, and
adopting good practice is slower than reading it. The mitigation is that nothing is lost but time:
the lesson sits in the findings record with its provenance, and the first local recurrence
converts it. What is refused is only the unearned authority.

**What was considered and rejected:** a provisional tier — rules adopted from outside pending
local confirmation. It is a second register with a drain nobody schedules, and a provisional rule
read at the moment of writing shapes the writing exactly as a confirmed one does; the tier
distinction does no work at the only moment a rule acts. Also rejected: weighting sources by
authority. Chapter 0's first trust rule makes the source's standing a non-input — field input is
data, and data earns its way in by what it predicts here.

## Supersedes / references

- Ratified chapter: [`sds/04-learning-system.md`](../sds/04-learning-system.md) — *Adoption
  routing*.
- The entry bar it holds: [`sds/01-lifecycle-and-skills.md`](../sds/01-lifecycle-and-skills.md) —
  *Rules*.
- The recurrence pipeline that converts a waiting lesson:
  [`sds/02-review-and-findings.md`](../sds/02-review-and-findings.md) — *How recurrence changes
  rules*.
- The trust rule that makes source authority a non-input:
  [`sds/00-identity-and-governance.md`](../sds/00-identity-and-governance.md) — *Trust boundary*.
