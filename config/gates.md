# Gate settings

Which setting each of the two gates runs at. The gates themselves — what each decides, the
graduated shape, and the floors no setting reaches — are canon, at
[Chapter 0](../sds/00-identity-and-governance.md) → *Merge authority* and
[Chapter 1](../sds/01-lifecycle-and-skills.md) → *The two gates*, and are not restated here; this
is adaptive configuration under [Chapter 1](../sds/01-lifecycle-and-skills.md) → *The adaptive
layer's home*.

- **Date:** 2026-08-03
- **Source:** the HC's decision, recorded at the Direction gate on #42 — made after the summons
  machinery had run end-to-end on real pull requests (PR #39, PR #41), the condition
  [Chapter 2](../sds/02-review-and-findings.md) → *What this chapter unlocks* sets.

## Ship gate

- **`attested`.** The AC may merge, but only against a conforming review under Chapter 2 from a
  model other than the AC, bound to the exact head commit being merged
  ([ADR 0005](../adr/0005-merge-authority-graduated-from-birth.md)).
- **A head that moves after the review is re-summoned before merge** — the review attests a
  commit, not a pull request.
- **The HC may still merge anything.** The setting widens who may act; it never narrows the HC.
- **Merging on the AC's own say-so remains unavailable**, at this and every setting
  ([Chapter 0](../sds/00-identity-and-governance.md) → *Merge authority*).

## Direction gate

- **`required`** — the HC chooses among the Assessment's options, unchanged. `delegated` still
  waits on Chapter 6 for somewhere to route a stop
  ([Chapter 1](../sds/01-lifecycle-and-skills.md) → *The Direction gate, graduated*).
