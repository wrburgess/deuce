---
date: 2026-08-17
source: the Direction gate on #85 for bryce's row, earned in by bryce PR #211's merge; the Direction gate on #86 for nadal's, earned in by nadal PR #143's merge; the label-vocabulary measurements added at the Direction gate on #123
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
- **Label vocabulary, measured 2026-08-17 (#123): 0 of the 10** `type:` and `status:` names deuce's
  shipped files use exist on bryce's tracker at all — so no issue among its 107 carries one — while
  all six issue forms are byte-identical to deuce's. The forms assign six of the ten, one `type:`
  value each plus `status:ready`, and the lifecycle Skills set the other four. So every issue opened
  from a form arrives with no labels and nothing reports it, and every Skill that advances an
  issue's status names a label the tracker does not have.
  bryce also holds deuce's `labels.yml` verbatim, declaring a set its tracker never created — the
  seed class working exactly as designed on a host that never did the rewriting the class assumes.
  Tracked
  host-side at [wrburgess/bryce#215](https://github.com/wrburgess/bryce/issues/215), which also asks
  the prior question nothing records — whether bryce runs the Work Tracking System at all.

## nadal — the second host

- **Earned in:** first vendoring receipt at deuce `90ee01a`, landed by
  [nadal PR #143](https://github.com/wrburgess/nadal/pull/143)'s merge, 2026-08-11.
- **Receipt:** the default home, `config/vendoring-receipt.md` on the host, per
  [`config/sync.md`](sync.md) → *The receipt's home*.
- The repetition held the canary's split exactly — 37 files written, the same 5 seed paths skipped
  as nadal's own. Its one finding — a host whose product surface includes `tools/` sweeps the
  seeded copies with its own checks — is #86's record, answered host-side by
  [nadal PR #145](https://github.com/wrburgess/nadal/pull/145).
- **Label vocabulary, measured 2026-08-17 (#123):** the same measurement — **0 of 10** on a tracker
  of 84 issues, six forms byte-identical, the same six-assigned/four-set split as bryce's row above.
  Unlike bryce, nadal's `labels.yml` is its own and says so, which
  is why nadal's failure is the louder of the two. Tracked host-side at
  [wrburgess/nadal#159](https://github.com/wrburgess/nadal/issues/159), re-pointed at the Direction
  gate on #123 to its option A: the `type:` axis absorbs nadal's own words by in-place rename, the
  `status:` axis is adopted, and the backfill is forward-only.
