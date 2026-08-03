# ADR 0014: A check over standing state ships with a deletion measurement

- Status: accepted
- Date: 2026-08-03

## Decision

A **check** whose subject is the repository's own standing state ships with a **deletion
measurement**: the state the check rejects is deliberately created, the check is watched failing on
it, the state is restored, and the measurement is recorded with the check. One per rejecting branch,
and **the empty input is always a rejecting branch**.

The record is the measurement itself — what was deleted, what the check said, what the exit code
was — not a sentence claiming the check was verified.

## Why (the trade-off that was live)

Chapter 0 puts **fail-first evidence** in the invariant layer: a fix ships with the test that failed
before it. That rule assumes a defect existing before the fix. A check over standing state has no
such moment — the repository already conforms, which is why the check is being written — so the
check is authored green, observed green, and shipped without anyone seeing it reject anything.
Fail-first is satisfied vacuously and the check may be incapable of failing at all.

This was not anticipated. It happened twice in this repository inside one hour:

- A derivation check comparing the lens menu against the class index passed when both sides were
  empty, caught only because the run happened to execute it before writing the state it guarded
  (https://github.com/wrburgess/deuce/pull/48#issuecomment-5170293749).
- A link verifier written for the next pull request had the identical shape — a file with no links
  reported zero checked, zero broken, green — written an hour after the first was catalogued, in a
  different language, for a different purpose, by the run that had just finished writing the class
  entry for it (https://github.com/wrburgess/deuce/pull/49#issuecomment-5170470462).

The second is the argument for a mechanism rather than a rule anyone is asked to remember. Awareness
of the class at maximum freshness prevented nothing. That is Chapter 0's *turn watchfulness into
mechanism*, demonstrated against the run that was writing the watchfulness down.

**What was given up:** a step per rejecting branch, every time, including on checks whose authors are
certain they work — and the deliberate creation of a broken state inside a run, which has to be
restored and shown restored. The cost is real and it is paid on checks that turn out to be fine,
which is the only way it can be paid on the ones that are not.

**What was considered and rejected:** treating this as guidance rather than as evidence a check ships
with. Guidance is what the second instance already had.

**Why decide it now:** the configuration lint's checks are almost entirely checks over standing
state, and a lint whose checks were never watched failing is exactly the green-but-blind gate the
epic on #5 names as the thing to absorb from the predecessor.

## Supersedes / references

- Ratified chapter: [`sds/03-quality-gate-and-tooling.md`](../sds/03-quality-gate-and-tooling.md) —
  *The evidence a check ships with*.
- Chapter 0's rule this extends, unchanged:
  [`sds/00-identity-and-governance.md`](../sds/00-identity-and-governance.md) — *The
  invariant/adaptive split*.
- The technique's first receipt in practice — three deletion measurements against three guards:
  https://github.com/wrburgess/deuce/pull/48#issuecomment-5170293749
- The predecessor's behavioral-testing bar and mutation spot-check, re-authored here rather than
  vendored: [`docs/sds-outline.md`](../docs/sds-outline.md) — *Part 2 → Testing*.
