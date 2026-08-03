# The accepted register

The durable list of every finding in state `accepted` — real, decided against, on the record. It is
one half of the findings home. Its contract is canon, at
[Chapter 2 → *The findings home*](../sds/02-review-and-findings.md#the-findings-home) and
[ADR 0011](../adr/0011-findings-type-state-one-way.md); stated briefly:

- **One line per `accepted` finding**, each linking the disposition that accepted it.
- **`accepted` is terminal.** New evidence never re-opens an entry here; it becomes a new finding
  that cites the old one.
- **The summons carries this file's contents**, so a kept risk is never re-litigated by a later
  review — and so a reader can find every risk this repository has knowingly kept, without an
  archaeology pass.

## Entries

None yet. An entry only ever comes from a real finding, accepted on a recorded disposition — this
register is never seeded.
