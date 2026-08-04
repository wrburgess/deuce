# ADR 0017: Tools verify or summon; they never do the work

- Status: accepted
- Date: 2026-08-04

## Decision

The [`tools/`](../tools/) tree carries exactly two families, and each is named with the chapter
that demands it:

1. **The gate and its checks** (`tools/gate/`) — verification that the standard's claims hold,
   demanded by [Chapter 3](../sds/03-quality-gate-and-tooling.md) and shaped by
   [ADR 0015](0015-one-gate-one-command-local-and-ci.md).
2. **The reviewer summons path** (`tools/review/`) — the machinery the Ship gate's `attested`
   setting cannot exist without, demanded by
   [Chapter 2](../sds/02-review-and-findings.md) → *The summons, completed*.

**A third family requires an ADR before its first file lands**, and that ADR must name the ratified
chapter that demands the tool. A tool that performs the governed work itself — scaffolding,
formatting, syncing, orchestrating anything a Skill or the AC does by hand today — belongs to a
host application, or nowhere. deuce is a standard plus its enforcement; the moment it accumulates
an application of its own, it competes with its hosts for the attention it exists to conserve.

## Why (the trade-off that was live)

Tool-building is the AC's steepest gradient. Given any ambiguity about scope, executable tooling is
what accumulates, because it is the work the AC is best at and the work that most resembles
progress. The `tools/` tree stood at 2,609 lines within three days of the repository's first
commit — both families legitimate under the rule above, which is exactly why the line is drawn now,
while the count of families is two and the question is cheap. The HC named the risk directly on
2026-08-04: deuce becoming an app is not the point of deuce.

**What was given up, and it is real:** convenience tooling that would genuinely save time — label
syncers, ADR scaffolders, findings formatters — is forbidden here even when the time saved is real.
The cost is accepted deliberately: each convenience is small, the accumulation is not, and
[ADR 0016](0016-meta-work-admitted-only-on-a-traced-failure.md) would be hollow if tooling remained
an unreceipted door.

**What was considered and rejected:** a line-count ceiling on `tools/`. Like the meta-work budget
ADR 0016 rejected, it measures the symptom and needs its own check to enforce. The family rule
needs no counter: a directory either has its ADR or it does not.

## Supersedes / references

- The chapters that demand the two families:
  [`sds/02-review-and-findings.md`](../sds/02-review-and-findings.md) →
  *The summons, completed*; [`sds/03-quality-gate-and-tooling.md`](../sds/03-quality-gate-and-tooling.md).
- The admission rule this instantiates for tooling:
  [ADR 0016](0016-meta-work-admitted-only-on-a-traced-failure.md).
- The HC's direction of 2026-08-04, recorded on #60.
