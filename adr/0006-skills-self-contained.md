# ADR 0006: Skills are self-contained

- Status: accepted
- Date: 2026-08-02

## Decision

deuce ships only **Skills** (packaged procedures the AC — this system's single acting agent — follows
for recurring jobs) that it authored itself. A useful procedure from an outside skill family is read, re-authored in deuce's own
vocabulary and shape, and attributed to its source — never copied in as files, and never taken as a
dependency.

## Why (the trade-off that was live)

- **What was given up:** the cheap start. Re-authoring a procedure somebody else already wrote costs
  real effort, and mature external skill families are genuinely good.
- **What it buys — trust surface:** a vendored skill is executable instructions from outside this
  repository sitting inside the AC's own configuration. The **trust boundary** already says outside
  material may propose a change and never make one; a copied skill would be outside material that
  made one at copy time and is re-read on every session.
- **What it buys — no update churn:** a copy either drifts from upstream or has to be re-synced
  forever, and neither state is visible without looking. The predecessor carried an adapted upstream
  skill long enough that restoring the attribution needed its own issue
  (https://github.com/wrburgess/ace/issues/51).
- **Why attribution is required anyway:** re-authoring is not authorship of the idea. The provenance
  is what lets a reader check the original and what keeps the rewrite honest.
- **Bounded by *excellent enough*** — the bar work stops at, past which more effort would not change
  what ships: the rule is about skill files, not about learning. Reading outside work and taking its
  lesson is the point; carrying its files is what stops.

## Supersedes / references

- Ratified chapter: [`sds/00-identity-and-governance.md`](../sds/00-identity-and-governance.md) —
  *Founding set*, ADR 0006; *Trust boundary*.
- Predecessor precedent for the churn this avoids:
  https://github.com/wrburgess/ace/issues/51
