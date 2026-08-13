---
date: 2026-08-13
source: the Direction gate on #109, where Option B — the differentiated table — was chosen, superseding the single declaration sourced to the HC's session configuration and the Direction gate on #13; the named model was removed at the Direction gate on #44 and returns here as an alias, for the reason given below
---

# Per-stage model and effort

Which model and effort level runs each lifecycle stage. This is adaptive configuration under
[Chapter 1](../sds/01-lifecycle-and-skills.md) → *The adaptive layer's home*; the stages themselves
are canon and are not restated here.

**The table below is prose, deliberately, and the frontmatter carries only `date` and `source`.**
That is [Chapter 3](../sds/03-quality-gate-and-tooling.md) → *The declaration schema*, applied
rather than worked around: a value a tool reads gets a parseable home, and where nothing reads a
value, prose is correct and sufficient. Nothing reads these values yet. When the launcher that reads
them exists — #108's — the rows move to frontmatter in the grammar
[`tools/gate/declaration.ts`](../tools/gate/declaration.ts) defines, in one dated edit, and that is
the moment they earn it. Landing them in frontmatter today would be a field nothing reads, which
that section names *aspiration rather than configuration*.

## Declaration

| Stage | Model | Effort | Why this row |
|---|---|---|---|
| **Assess** | `opus` | `high` | The widest read of the repository, and its options must genuinely differ. The stage most damaged by a cheap model, because a thin Assessment mis-aims everything after it |
| **Devise** | `opus` | `high` | Decides the testing strategy up front, before code exists to write tests against. A weak plan is paid for at every later stage |
| **Implement** | `opus` | `medium` | Executes steps the Plan already decided. The judgment was spent upstream; effort drops, the model does not |
| **Verify** | `opus` | `max` | The refutation stage, and the last one that hunts defects rather than re-confirming them. The one place to spend most — a finding missed here ships |
| **Deliver** | `sonnet` | `low` | Re-runs the checks, writes the record, acts on the declared setting. Mechanical by design, which is what makes it the one row that leaves the frontier tier |
| *default* | `opus` | `high` | A stage with no row above runs here — the fallback [Chapter 6](../sds/06-factory-automation.md#routing-consumed) names |

- **The values are read at dispatch, from this file** — never from a Skill body, never baked into a
  trigger. That is [Chapter 6](../sds/06-factory-automation.md#routing-consumed)'s rule, and
  [`.claude/skills/execute/SKILL.md`](../.claude/skills/execute/SKILL.md) reads the row for each
  stage it runs and records it.
- **Reading is not yet dispatching, and the difference is deliberate.** Nothing acts on a row today,
  so nothing can refuse a bad one. Until the launcher exists, a pass records the row it read — and
  names any stage that fell through to the default, so a row missing by accident is visible in the
  run record rather than absorbed by the fallback.
- **Models are named by alias, never by full name** — `opus`, not `claude-opus-5`. An alias tracks
  the latest model of its family, so it does not go stale. This is how the table keeps most of what
  #44 bought when it removed the named model from this file: the durable fix there was a statement
  that cannot rot, and an alias is one.
- **A name has to be written down now, and that is what changed.** The previous declaration said
  every stage ran on whatever model the HC launched the session with. An unattended run has no such
  session to inherit from, so something must say which model — which is the whole of what
  [Chapter 6](../sds/06-factory-automation.md#routing-consumed) consumes from this file.
- **Effort levels are the platform's vocabulary** — `low`, `medium`, `high`, `xhigh`, `max` — read
  from the harness on 2026-08-13. A level outside that set is a defect in this table, and only the
  launcher would find it.

## What nothing here validates

A **declared limit**, in the sense [Chapter 3](../sds/03-quality-gate-and-tooling.md) requires of a
check: **no check reads this table at all.** It is prose, and prose has no failing test
([Chapter 2](../sds/02-review-and-findings.md) → *Verifying prose*). What that leaves open, stated
rather than discovered:

| Not reached | What it would look like |
|---|---|
| The values | An alias naming no real model, or an effort level outside the five above |
| The row set | Two rows naming the same stage, or a stage missing with no intent behind it |
| Agreement with the session | A row saying one thing while the run happens on another |

The residue is routed, not dropped: what review catches, it catches under the lens *is any statement
here true only as of when it was written?*; the rest waits for the launcher that will read these
rows and can fail loudly on them.

## What an attended pass does

Every pass to date has been attended, launched by the HC, and a session's model is fixed when it
starts. So an attended pass runs on whatever the HC launched, whatever the rows say.

- **A mismatch between the session and the row is a line in the run record, never a stop.** A stop
  here would block every attended pass, which is the opposite of what the table is for.
- **The rows become binding when the launcher exists** — one session per stage, each started under
  its own row. That shape was settled at the Direction gate on #109 and is #108's to build.

## Prior art

- [ace #77](https://github.com/wrburgess/ace/issues/77) — the predecessor's three-tier routing design
  (economy / standard / frontier), declared and never built. The shape is taken up here one tier at a
  time rather than whole: four rows sit at the frontier and one steps down, because only one stage
  has a reason to. Its multi-tool machinery does not transfer, because deuce has one AC.
