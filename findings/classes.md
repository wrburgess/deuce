# The class index

The descriptive record of this repository's recurring defect classes: *this shape occurred N times,
see these findings*. It is the other half of the findings home. Its contract is canon, at
[Chapter 2 → *The findings home*](../sds/02-review-and-findings.md#the-findings-home),
[ADR 0010](../adr/0010-review-bounded-by-lens-set.md), and
[ADR 0011](../adr/0011-findings-type-state-one-way.md); stated briefly:

- **Descriptive, never imperative.** An entry says what occurred and where. The moment it says
  "never do X" it is a rule authored under another name — rules have their own home, `rules/`, and
  their own entry bar.
- **Reference plus delta.** A finding matching a class already here records a pointer and what is
  new about this instance, so counting stays cheap.
- **The lens menu derives from this file**
  ([Chapter 2 → *How recurrence changes rules*](../sds/02-review-and-findings.md#how-recurrence-changes-rules)):
  a class that recurs earns a lens, and a class whose prevention can be stated as standing guidance
  enters `rules/`, citing its rows here as the receipts.

## Entries

None yet. An entry only ever comes from real findings — this index is never seeded.
