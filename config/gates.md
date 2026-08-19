---
date: 2026-08-19
source: the Direction gate on #130, where Option B was chosen and the unattended case answered in the same sitting; superseding the HC's decision on #62, which itself superseded the `attested` setting recorded at the Direction gate on #42
---

# Gate settings

Which setting each of the two gates runs at — the values only. What each setting means, the
graduated shape, and the floors no setting reaches are canon, at
[Chapter 0](../sds/00-identity-and-governance.md) → *Merge authority* and
[Chapter 1](../sds/01-lifecycle-and-skills.md) → *The two gates*, and are not restated here; this
is adaptive configuration under [Chapter 1](../sds/01-lifecycle-and-skills.md) → *The adaptive
layer's home*.

Why `attested` now, dated to the decision: what changed since 2026-08-04 is that two mechanisms canon
already asked for exist and are dated. The quality gate is re-run on the merge candidate by GitHub,
and branch protection on `main` requires that verdict with the branch current ([`ci.md`](ci.md), in
force 2026-08-16). The independent review is bound to the head that merges, including where a fix
wave moved it ([Chapter 2](../sds/02-review-and-findings.md), amended on #129). **What any setting
requires is canon's and is not restated, qualified, or scoped here** — this file records which
setting is in force and why it changed, and nothing else.

The chain, so the reversal reads without archaeology: `attested` at the Direction gate on #42 →
`required` on #62 → here, on #130. One attempt sits between the last two and is not a link in the
chain: `0f325f6` on PR #124 set this file to `attested` early and was reverted whole at `46b94c7`,
because it had restated a floor as binding on unattended passes only.

## Ship gate

- **`attested`** — per [Chapter 0](../sds/00-identity-and-governance.md) → *Merge authority* and
  [ADR 0005](../adr/0005-merge-authority-graduated-from-birth.md). The summons still runs on every
  pull request that runs Verify — that rule is
  [Chapter 2](../sds/02-review-and-findings.md#verifys-external-half-now-written)'s and no gate
  setting reaches it.

## Direction gate

- **`required`** — per [Chapter 1](../sds/01-lifecycle-and-skills.md) → *The Direction gate,
  graduated*.
