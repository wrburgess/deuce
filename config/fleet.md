---
date: 2026-08-11
source: the Direction gate on #85 for bryce's row, earned in by bryce PR #211's merge; the Direction gate on #86 for nadal's, earned in by nadal PR #143's merge
hosts:
  - host: bryce
    repository: wrburgess/bryce
    receipt: config/vendoring-receipt.md
  - host: nadal
    repository: wrburgess/nadal
    receipt: config/vendoring-receipt.md
---

# The fleet roster

Each host, its repository, and where its vendoring receipt lives. The roster's fields, and the
earn-in rule a row enters under, are canon, at [Chapter 5](../sds/05-distribution.md) → *The
adaptive layer's additions* and → *Succession*, and are not restated here; this file is adaptive
configuration under [Chapter 1](../sds/01-lifecycle-and-skills.md) → *The adaptive layer's home*,
and only declares the rows.

The frontmatter is the machine half, in the same line grammar
[`config/payload.md`](payload.md)'s carries — scalars plus one flat list of scalar-field items — so
the reader that one day serves these declarations parses one grammar, not two. At this
declaration's date nothing reads the frontmatter yet: the sync takes its target from the HC, and
treats a host absent from this roster, per [`config/sync.md`](sync.md).

## bryce — the canary

- **Earned in:** first vendoring receipt at deuce `cf3468f`, landed by
  [bryce PR #211](https://github.com/wrburgess/bryce/pull/211)'s merge, 2026-08-06.
- **Receipt:** the default home, `config/vendoring-receipt.md` on the host, per
  [`config/sync.md`](sync.md) → *The receipt's home*.
- The proving ground held: the manifest represented the canary's real state — 37 files written,
  5 seed paths skipped as bryce's own — with nothing the sort could not express.

## nadal — the second host

- **Earned in:** first vendoring receipt at deuce `90ee01a`, landed by
  [nadal PR #143](https://github.com/wrburgess/nadal/pull/143)'s merge, 2026-08-11.
- **Receipt:** the default home, `config/vendoring-receipt.md` on the host, per
  [`config/sync.md`](sync.md) → *The receipt's home*.
- The repetition held the canary's split exactly — 37 files written, the same 5 seed paths skipped
  as nadal's own — and surfaced the finding the canary's stack could not: a host whose product
  surface includes `tools/` sweeps the seeded gate/review copies with its own checks. Recorded on
  [#86](https://github.com/wrburgess/deuce/issues/86); the host-side answer (carve-outs, dormant
  until the gate is wired) landed with
  [nadal PR #145](https://github.com/wrburgess/nadal/pull/145).
