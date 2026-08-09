---
date: 2026-08-09
source: the Direction gate on #85, where Option A was chosen; the row earned in by bryce PR #211's merge
hosts:
  - host: bryce
    repository: wrburgess/bryce
    receipt: config/vendoring-receipt.md
---

# The fleet roster

Each host, its repository, and where its vendoring receipt lives. The roster's fields and its
earn-in are canon, at [Chapter 5](../sds/05-distribution.md) → *The adaptive layer's additions* and
→ *Succession* — a host is over when its first vendoring receipt exists, and a row enters only
then, never ahead of it. This file is adaptive configuration under
[Chapter 1](../sds/01-lifecycle-and-skills.md) → *The adaptive layer's home*.

The frontmatter is the machine half, in the same line grammar
[`config/payload.md`](payload.md)'s carries — scalars plus one flat list of scalar-field items — so
whatever first reads one roster reads both. Nothing reads it yet: the sync takes its target from
the HC per [`config/sync.md`](sync.md), and a host absent from this roster is synced at the
default receipt home declared there.

## bryce — the canary

- **Earned in:** first vendoring receipt at deuce `cf3468f`, landed by
  [bryce PR #211](https://github.com/wrburgess/bryce/pull/211)'s merge, 2026-08-06.
- **Receipt:** the default home, `config/vendoring-receipt.md` on the host, per
  [`config/sync.md`](sync.md) → *The receipt's home*.
- The proving ground held: the manifest represented the canary's real state — 37 files written,
  5 seed paths skipped as bryce's own — with nothing the sort could not express.
