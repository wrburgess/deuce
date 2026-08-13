---
date: 2026-08-13
source: the HC's direction of 2026-08-13, in session on PR #124 — "you merge it; i am no longer supposed to be the merge gate" — superseding the `required` setting recorded from the HC's decision on #62, which had itself superseded the `attested` setting from the Direction gate on #42
---

# Gate settings

Which setting each of the two gates runs at — the values only. What each setting means, the
graduated shape, and the floors no setting reaches are canon, at
[Chapter 0](../sds/00-identity-and-governance.md) → *Merge authority* and
[Chapter 1](../sds/01-lifecycle-and-skills.md) → *The two gates*, and are not restated here; this
is adaptive configuration under [Chapter 1](../sds/01-lifecycle-and-skills.md) → *The adaptive
layer's home*.

Why `attested` now, dated to the direction: the HC is stepping out of the merge gate. The
`required` reasoning this supersedes was that during bootstrap the HC reads every Delivery Record
anyway, so the per-merge attestation ceremony bought autonomy the repository did not use — the
factory is what changed, and it is the first thing that uses it, exactly as
[Chapter 6](../sds/06-factory-automation.md) predicted the argument would run.

## Ship gate

- **`attested`** — the AC may merge, and only against an independent review from a model other than
  the AC, **bound to the exact commit being merged**; per
  [Chapter 0](../sds/00-identity-and-governance.md) → *Merge authority* and
  [ADR 0005](../adr/0005-merge-authority-graduated-from-birth.md). Merging on the AC's own say-so is
  not reached by this or any setting.
- **The floor this setting does not clear, stated because it binds today.**
  [Chapter 6](../sds/06-factory-automation.md) → *The gates, unattended* holds an **unattended**
  pass to a second leg as well: Chapter 3's re-run of the quality gate by something that is not the
  AC. That leg is unbuilt, so **no unattended pass merges**, at this setting or any other. What this
  declaration puts in force is the attended case: the AC merges a pull request whose conforming
  review is bound to its head, with the HC not in the loop.
- The summons still runs on every pull request that runs Verify — that rule is
  [Chapter 2](../sds/02-review-and-findings.md#verifys-external-half-now-written)'s and no gate
  setting reaches it.

## Direction gate

- **`required`** — per [Chapter 1](../sds/01-lifecycle-and-skills.md) → *The Direction gate,
  graduated*. Unchanged by the 2026-08-13 direction, which named the merge gate only.
