# ADR 0011: Findings carry type and state as independent axes, and the flow is one-way

- Status: accepted
- Date: 2026-08-03

## Decision

Every **finding** (one recorded observation that is not itself the commissioned work) carries two
independent facts: a **type** — what kind of thing it is — and a **state** — what happens to it
next: `closed`, resolved in the run that found it; `open`, promoted to tracked work; or `accepted`,
a real limitation decided against on the record. The flow is one-way and `accepted` is terminal:
new evidence never re-opens an accepted finding, it becomes a new finding that cites the old one.
The summons carries the accepted list, so a kept residual is not re-litigated by the next review.

## Why (the trade-off that was live)

- **What was given up: the ability to re-open.** A wrong acceptance stays accepted. The cost is
  real and it is priced: overturning one takes a new finding with new evidence, which is a higher
  bar than flipping a field — deliberately, because a state that can be flipped back is a state
  every future review will try to flip.
- **What it buys — triage becomes possible at all.** The predecessor recorded type without state:
  its findings log reached 256 entries in three days, roughly nine in ten of them defects already
  fixed in the run that found them, and read by type alone the archive was indistinguishable from a
  backlog of 256 open items. It conformed perfectly to its own format the whole time, and triage
  ran zero times — there was nothing to triage *toward*
  (https://github.com/wrburgess/ace/issues/161).
- **What it buys — `accepted` does its work through the summons.** The predecessor opened and
  closed three issues as never-should-have-existed because no artifact meant *real, decided
  against, do not re-litigate*. A terminal state the summons carries is that artifact; a re-openable
  one is not, because a reviewer handed a list that might flip has been handed a list of
  invitations.
- **Why the insufficiency of one axis is worth a record:** it is invisible. A single-axis log fails
  while conforming perfectly to its own format, so nothing detects the failure until someone tries
  to use the log and cannot. That is the kind of defect a standard has to name to prevent.
- **Why it is hard to reverse:** records accumulate under the schema from the first finding on, and
  every consumer — the accepted register, the class index, the triage pass, the summons — reads the
  state axis. Adding re-opening later would invalidate the accepted register's promise retroactively
  for every entry already in it.

## Supersedes / references

- Ratified chapter: [`sds/02-review-and-findings.md`](../sds/02-review-and-findings.md) —
  *Two axes, not one*.
- The predecessor's single-axis log and its receipts, cited not copied:
  https://github.com/wrburgess/ace/issues/161
