# ADR 0010: Solicited review is bounded by lens set, not round count

- Status: accepted
- Date: 2026-08-03

## Decision

A solicited review — Verify's adversarial pass, a **contractor reviewer**'s (a model other than the
AC, summoned for one bounded review) response to a summons, and every re-summons after a fix — is
bounded by its **lens set**: the small selection of named review questions declared in the summons,
chosen for what the change actually touches. Each lens runs once; re-running a lens that returned
clean is the HC's call, never the AC's. Every lens set carries one permanent lens — *what class is
not on this list?* Round counts bound nothing, at any setting. Unsolicited discovery — what a run
notices while doing other work — is routed into the Findings System and never capped.

## Why (the trade-off that was live)

- **What was given up: the simple stopping rule.** A round cap is one integer, trivially enforced
  and understood. A lens set needs a menu, a derivation rule for the menu, and judgment at summons
  time about which lenses this change deserves — machinery a round cap never asks for.
- **What it buys — the bound cuts the right tail.** The predecessor's record is exact: seven pull
  requests ran ten to fourteen adversarial rounds each; the three most valuable late findings each
  came from a lens no earlier round had used; the lowest-value tail was four consecutive rounds of
  one lens that had already paid out; and the one review scoped with a declared threat model
  converged after a single finding. A round cap would have discarded the valuable rounds and
  permitted the wasted ones — it truncates the round that changes the question while allowing four
  more of the question already answered
  (https://github.com/wrburgess/ace/issues/161).
- **The permanent lens is what keeps the bound honest.** A menu necessarily enumerates the defect
  classes already known, and a review that keeps returning one class is evidence that attention is
  pinned, not that other classes are absent. Without the permanent lens, lens-set bounding would
  trade an unbounded review for a blind one.
- **Why it is hard to reverse:** the summons contract, the validation on return, the lens menu in
  configuration, and the class-index derivation all take the lens as the unit of review. Reverting
  to round counts would re-open the question every one of them answers — when is a review finished
  — with nothing left to answer it.

## Supersedes / references

- Ratified chapter: [`sds/02-review-and-findings.md`](../sds/02-review-and-findings.md) —
  *Bounded by lens set, not by round count*.
- The predecessor's evidence and proposal, cited not copied:
  https://github.com/wrburgess/ace/issues/161
