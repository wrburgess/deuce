# ADR 0015: The gate is one command, defined once, and re-run independently

- Status: accepted
- Date: 2026-08-03

## Decision

The **quality gate** is one command with one definition. The same command runs on the AC's machine
and again, independently, on the merge candidate. Continuous integration re-runs the gate; it never
defines a gate of its own.

**A check that cannot run locally is not in the gate.** Such a check may exist and may even run on
every merge — but it runs outside the gate, under its own name, and no artifact says the gate covered
it.

**An independent re-run is a floor for the Ship gate's `attested` setting.** Under `attested` the AC
merges its own work on two claims: that an independent review passed, and that the checks are green.
Chapter 2 made the first checkable. The second is only checkable if something that is not the AC ran
the gate.

## Why (the trade-off that was live)

Chapter 1's Implement stage exits when *the checks are green*, and its Deliver stage re-confirms
green on the current head. If part of the gate exists only in continuous integration, the AC is
certifying that exit test against a subset of the checks that decide it — and the subset is invisible
at the moment the claim is made.

The `attested` half is the sharper reason. Chapter 0's floor is that **merging on the AC's own
say-so is never an option**. Chapter 2 closed that for review by making reachability executable
rather than asserted, on its own argument that a caveat in a table leaves the failure intact
(https://github.com/wrburgess/ace/issues/125). The green claim is the same shape and had not been
closed: at this decision's date `config/gates.md` declares the Ship gate `attested`, and the gate
runs only where the AC runs it, with the AC's word as the only record that it ran.

**What was given up, and it is real:** every check that genuinely cannot run on a developer machine
is excluded from the gate by this rule. Long scans, matrix builds across platforms deuce does not
have, anything needing a credential the AC does not hold. The industry default is the opposite —
a cheap local subset and the real suite in continuous integration — and that default is rejected
here, deliberately, in exchange for *the checks are green* meaning one thing.

**What was considered and rejected:** a two-tier gate with a declared local subset. It reintroduces
the problem under a name: the AC's exit test would cite the subset, and every artifact saying "the
checks are green" would need a qualifier nobody would keep accurate.

**Why decide it now:** a continuous-integration-only check class, once admitted, never leaves — the
checks that land there are the expensive ones, and moving them back is a cost nobody schedules.
`attested` is already in force without the independent re-run, so the floor is being written to be
closed rather than to be admired.

## Supersedes / references

- Ratified chapter: [`sds/03-quality-gate-and-tooling.md`](../sds/03-quality-gate-and-tooling.md) —
  *The quality gate*, and *Green has to be checkable by someone who was not there*.
- The floor this serves:
  [`sds/00-identity-and-governance.md`](../sds/00-identity-and-governance.md) — *Merge authority*;
  [ADR 0005](0005-merge-authority-graduated-from-birth.md).
- The setting in force, dated and sourced: [`config/gates.md`](../config/gates.md).
- The parallel case Chapter 2 already closed, with its predecessor receipt:
  [`sds/02-review-and-findings.md`](../sds/02-review-and-findings.md) — *The summons, completed*;
  https://github.com/wrburgess/ace/issues/125
