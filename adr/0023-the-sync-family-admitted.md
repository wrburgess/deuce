# ADR 0023: The sync family is admitted to `tools/`

- Status: accepted
- Date: 2026-08-06

## Decision

**`tools/sync/` is the third tool family**, admitted under the rule ADR 0017 fixed: a family
enters only with a decision record naming the ratified chapter that demands it. The demanding
chapter is [Chapter 5](../sds/05-distribution.md) → *The sync: updates arrive as pull requests* —
"the sync writes what the manifest declares onto a branch in the host's repository and opens a
pull request." That sentence is a mechanism, and a mechanism that must exist is a tool this
repository owes.

The family carries the sync and nothing else: reading the payload manifest, materializing the
payload at a pinned commit, computing the drift report from the vendoring receipt, and opening the
host's pull request. It is subject to the whole tooling contract
([Chapter 3](../sds/03-quality-gate-and-tooling.md) → *The tooling contract*): TypeScript, tested
by this repository's gate, classified exits, output naming what was read.

## Why

ADR 0017 names "syncing" among the work a tool must not do — and that is precisely why this record
exists rather than a directory quietly appearing. The prohibition was on tools without a chapter
behind them; the rule's own mechanism is that a ratified chapter's demand, cited in a record,
admits the family. Chapter 5 was ratified on 2026-08-05; its sync section demands this mechanism;
the payload manifest it reads was declared under #81. The boundary ADR 0017 drew is intact:
convenience tooling remains forbidden, and the fourth family will need what the third did — a
chapter, and a record like this one.

## Supersedes / references

- [ADR 0017](0017-tools-verify-or-summon-never-do-the-work.md) — the family rule this record
  satisfies; nothing in it is superseded.
- [Chapter 5](../sds/05-distribution.md) → *The sync* — the demanding canon.
- [ADR 0022](0022-updates-arrive-only-as-pull-requests.md) — the update path the tool implements.
- The Direction gate on #82, where Option A — the orchestrated command — was chosen.
