# ADR 0004: Guidance splits into an invariant canon and a dated adaptive layer

- Status: accepted
- Date: 2026-08-02

## Decision

**Canon** (what the SDS states, once ratified) holds only the **invariant layer**: process truths
expected to hold across model generations. Everything coupled to today's AI platform — context
budgets, model and effort routing, delegation patterns, review-round economics, capacity rationing —
is the **adaptive layer**, written as dated, sourced, re-verifiable configuration, and never entering
the **SDS** (this system's written standard). One question sorts a statement: would it become false
if the platform changed?

## Why (the trade-off that was live)

- **The failure being prevented:** platform economics frozen into canon. The predecessor recorded an
  instruction-file line allowance as a decision record
  (https://github.com/wrburgess/ace/blob/main/docs/adr/0022-instruction-file-line-allowance.md). The
  number was tuned to one year's context window, and nothing in its form would notice when it stopped
  being true — an immutable record is exactly the wrong home for a number with a shelf life.
- **What was given up:** single-tier simplicity. Every statement now gets sorted before it is
  written, and each adaptive one carries a date and a source that somebody has to re-verify. That is
  standing bookkeeping, not a one-time cost.
- **What it buys:** the **hygiene sweep** (the recurring maintenance pass this system runs over
  itself) can re-verify the adaptive layer *because* it is dated and sourced. Resilience becomes a
  mechanism rather than an intention.
- **Second effect, deliberate:** the split diverts the largest source of decision records.
  Platform-coupled tuning becomes configuration, which is how the live ADR set stays small enough to
  read.

## Supersedes / references

- Ratified chapter: [`sds/00-identity-and-governance.md`](../sds/00-identity-and-governance.md) —
  *The invariant/adaptive split*.
- Counter-example from the predecessor, cited not copied:
  https://github.com/wrburgess/ace/blob/main/docs/adr/0022-instruction-file-line-allowance.md
