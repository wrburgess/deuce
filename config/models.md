---
date: 2026-08-13
source: the Direction gate on #109, where Option B — the differentiated table — was chosen, superseding the single declaration sourced to the HC's session configuration and the Direction gate on #13; the named model was removed at the Direction gate on #44 and returns here as an alias, for the reason given below
routing:
  - stage: assess
    model: opus
    effort: high
  - stage: devise
    model: opus
    effort: high
  - stage: implement
    model: opus
    effort: medium
  - stage: verify
    model: opus
    effort: max
  - stage: deliver
    model: sonnet
    effort: low
default-model: opus
default-effort: high
---

# Per-stage model and effort

Which model and effort level runs each lifecycle stage. This is adaptive configuration under
[Chapter 1](../sds/01-lifecycle-and-skills.md) → *The adaptive layer's home*; the stages themselves
are canon and are not restated here.

**The machine-read values live in the frontmatter above and nowhere else** — the rows and the two
defaults. The body carries only the reasoning behind them, as
[`review.md`](review.md) splits its own roster
([Chapter 3](../sds/03-quality-gate-and-tooling.md) → *Parse, never pattern-match*).

## Declaration

- **Each stage runs at its row's model and effort.** A stage with no row runs at `default-model` and
  `default-effort` — the fallback [Chapter 6](../sds/06-factory-automation.md#routing-consumed)
  names.
- **The values are read at dispatch, from this file** — never from a Skill body, never baked into a
  trigger. That is [Chapter 6](../sds/06-factory-automation.md#routing-consumed)'s rule, and
  [`.claude/skills/execute/SKILL.md`](../.claude/skills/execute/SKILL.md) resolves the row for each
  stage it dispatches.
- **Models are named by alias, never by full name** — `opus`, not `claude-opus-5`. An alias tracks
  the latest model of its family, so it does not go stale. This is how the table keeps most of what
  #44 bought when it removed the named model from this file: the durable fix there was a statement
  that cannot rot, and an alias is one.
- **A name has to be written down now, and that is what changed.** The previous declaration said
  every stage ran on whatever model the HC launched the session with. An unattended run has no such
  session to inherit from, so something must say which model — which is the whole of what
  [Chapter 6](../sds/06-factory-automation.md#routing-consumed) consumes from this file.
- **The two defaults are scalars, not a nested block.** The frontmatter grammar this repository
  parses has one level of list and scalars at the margin, and no production for a nested map — a
  `default:` block is refused by the reader before any check runs. Two scalars say the same thing
  inside the grammar.

## The reasoning, row by row

| Stage | Why this row |
|---|---|
| **Assess** | The widest read of the repository, and its options must genuinely differ. The stage most damaged by a cheap model, because a thin Assessment mis-aims everything after it |
| **Devise** | Decides the testing strategy up front, before code exists to write tests against. A weak plan is paid for at every later stage |
| **Implement** | Executes steps the Plan already decided. The judgment was spent upstream; effort drops, the model does not |
| **Verify** | The refutation stage and the last floor before the Ship gate. The one place to spend most — a finding missed here ships |
| **Deliver** | Re-runs the checks, writes the record, acts on the declared setting. Mechanical by design, which is what makes it the one row that leaves the frontier tier |

## What nothing here validates

A **declared limit**, in the sense [Chapter 3](../sds/03-quality-gate-and-tooling.md) requires of a
check: no reader in this repository parses these rows. The quality gate reaches the frontmatter's
*shape* — a malformed row, a repeated key, or a nested block is refused by name and by line, and
that was measured against this file before this declaration landed, not assumed. It reaches nothing
about the *values*: an alias naming no real model, and an effort level outside the platform's
vocabulary, both pass. The launcher is what would find them, and the launcher is #108's.

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
