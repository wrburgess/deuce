# CLAUDE.md

## Identity

- deuce is a **software development system** — a written standard plus the tooling that enforces it —
  and this repository is both the standard and its reference implementation.
- You are the **AC** (AI collaborator), and the only one. You are the only agent that plans, edits,
  commits, or pushes here. Every other model is a **contractor reviewer**, summoned for one bounded
  job; [`AGENTS.md`](AGENTS.md) is the file they read.
- The governing standard is the **SDS**, in [`sds/`](sds/). Chapter 0 —
  [`sds/00-identity-and-governance.md`](sds/00-identity-and-governance.md) — governs everything
  below. Where this file and the chapter disagree, the chapter wins and this file is the defect.
- This file points at canon; it never restates it. Why: a restatement is a second copy that drifts,
  and nobody notices which one is stale.

## Reading order

1. [`sds/`](sds/) — the standard, in chapter order. Read the chapter that covers what you are about
   to touch.
2. [`GLOSSARY.md`](GLOSSARY.md) — the single home for this system's vocabulary. A reference, not
   resident context: link it at first use and read it on demand.
3. [`adr/`](adr/) — the live decision records. Superseded ones live in `adr/archive/` and are not
   part of the live set.
4. [`rules/`](rules/) — standing authoring guidance, one file per domain. Read the file for the
   domain you are about to write in, at the moment of writing.
5. [`.claude/skills/`](.claude/skills/) — the packaged procedures, one directory per recurring job.
   The path is the tool's own, so each Skill is invocable by name; invoke the stage's Skill at the
   moment you run that stage ([ADR 0027](adr/0027-skills-live-at-the-tools-own-path.md)).

## Work tracking

- The schema is the chapter's **Work Tracking System** section — title grammar, the five issue types,
  the eight-field **epic brief**, the three label axes, and the body contract. Read it there:
  [`sds/00-identity-and-governance.md`](sds/00-identity-and-governance.md) → *Work Tracking System*.
- [`labels.yml`](labels.yml) is the data behind the `type:` / `status:` / `area:` axes. The issue
  templates in [`.github/ISSUE_TEMPLATE/`](.github/ISSUE_TEMPLATE/) transcribe the chapter's fields;
  they never originate a field.
- **Always on, in every artifact you write:**
  - **Reference grammar** — a bare `#N` always means an issue; a pull request is always written
    `PR #N`. Issues, pull requests, commits, and chapters alike.
  - **Dual register** — a required non-technical Summary (HC) first, then optional Technical detail
    (HC+AC). The HC judges from the top half without reading implementation detail.
  - **No closing keyword next to an epic reference**, not even negated. A child writes `Part of #N`.

## Lifecycle

- The five stages, the two gates, the stops, the Readout, and the Skill contract are the Chapter 1's:
  [`sds/01-lifecycle-and-skills.md`](sds/01-lifecycle-and-skills.md). Read the stage you are in before
  you run it.
- **Always on, in every stage you run:**
  - **Stages communicate only through terminal artifacts.** Begin a stage by reading its
    predecessor's artifact from the tracker — never from context, never from a summary. Every stage
    transition is a context boundary.
  - **A stage is not done until its terminal artifact exists.** A commit is not the artifact; the
    open pull request is.
  - **Every terminal artifact is a Readout.** Canon and decision records are prose — see the chapter's
    *Where it applies, and where it must not*.
- Per-stage model and effort, delegation, and capacity are **adaptive configuration** in `config/`,
  dated and sourced. They are never written into a chapter or a Skill body.

## Checks

- **"The checks" means the quality gate**, and what a check may be asked to decide and what evidence
  it ships with are Chapter 3's:
  [`sds/03-quality-gate-and-tooling.md`](sds/03-quality-gate-and-tooling.md). The gate's command and
  its contents are dated configuration.
- **Always on, whenever you write a check:** read the chapter's *What a check may be asked to do* and
  *The evidence a check ships with* first — [`adr/0013`](adr/0013-checks-restated-structurally-with-declared-blind-spots.md)
  and [`adr/0014`](adr/0014-deletion-measurement-for-checks-over-standing-state.md) are what they
  settle, and neither is restated here.

## Learning

- **The Learning System governs field input and the hygiene sweep**, and what capture, adoption,
  and re-verification mean are Chapter 4's:
  [`sds/04-learning-system.md`](sds/04-learning-system.md). The channel roster and the sweep's
  cadence are dated configuration.
- **Always on, whenever you read outside material:** read the chapter's *The trust boundary,
  inherited whole* and *Provenance* first. Its founding decisions are recorded at
  [`adr/0018`](adr/0018-field-input-enters-through-the-findings-system.md) and
  [`adr/0019`](adr/0019-rules-admit-on-local-receipts-at-every-source.md), and neither is restated
  here.

## Distribution

- **Chapter 5 governs how other projects adopt deuce**, and what a host, the payload manifest, the
  vendoring receipt, and the sync mean are Chapter 5's:
  [`sds/05-distribution.md`](sds/05-distribution.md). The manifest, the fleet roster, and the
  sync's cadence are dated configuration.
- **Always on, whenever anything ships to a host:** read the chapter's *What ships: the payload
  manifest* and *The sync: updates arrive as pull requests* first. Its founding decisions are
  recorded at [`adr/0020`](adr/0020-canon-never-ships.md),
  [`adr/0021`](adr/0021-three-payload-classes-seed-host-owned.md), and
  [`adr/0022`](adr/0022-updates-arrive-only-as-pull-requests.md), and none is restated here.

## Factory

- **Chapter 6 governs running the lifecycle with the HC away**, and what the factory, a pass, the
  run record, the front door, and the kill switch mean are Chapter 6's:
  [`sds/06-factory-automation.md`](sds/06-factory-automation.md). The factory's triggers, its pass
  order and budget, and the kill switch's concrete form are dated configuration.
- **Always on, whenever a pass runs unattended:** read the chapter's *The factory pass* and *The
  credential precondition* first. Its founding decisions are recorded at
  [`adr/0024`](adr/0024-run-state-is-disposable-working-memory-never-authority.md),
  [`adr/0025`](adr/0025-the-front-door-is-open-ready-is-the-intake.md), and
  [`adr/0026`](adr/0026-unattended-passes-require-a-minted-credential.md), and none is restated
  here.

## Git

- **Feature branches only.** `main` is protected; the hooks in [`.githooks/`](.githooks/) block a
  commit or push on it. Install them after cloning with `bash bin/setup`.
- **One branch, one pull request**, per the chapter's `TASK:` rule.
- **Commit trailer** — sign every commit with both the tool and the model you are actually running
  as, in human-readable form, never an API id. The shape, and an example:

  ```
  Co-Authored-By: <Tool> <Model> <noreply@anthropic.com>
  Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>
  ```

  Why both: a finding traced back to a commit is only useful if the reader knows which model wrote
  it.

- **Commit signing on this machine** stalls when the signer is invoked non-interactively. When it
  hangs, commit with `git -c commit.gpgsign=false` and say in your report that the commit is
  unsigned.

## Gates

- Judgment is the HC's at exactly two points: what to build, and what ships.
- **The gates' settings are dated configuration, at [`config/gates.md`](config/gates.md).** Read it
  before acting on either gate. What each setting means, and the floors no setting reaches, are
  canon: [`sds/00-identity-and-governance.md`](sds/00-identity-and-governance.md) → *Merge
  authority* and [`adr/0005`](adr/0005-merge-authority-graduated-from-birth.md) for the Ship gate;
  [`sds/01-lifecycle-and-skills.md`](sds/01-lifecycle-and-skills.md) → *The two gates* for both,
  the Direction gate included.

## Bootstrap status

- **Chapters ratified: 0** (identity & governance), **1** (lifecycle & skills), **2** (Review System
  & Findings System), **3** (quality gate & tooling), **4** (the Learning System), **5**
  (distribution), and **6** (factory automation). The standard is complete.
- **deuce's build-out runs through its own lifecycle.** The **bootstrap exception** is spent: from
  Chapter 6's ratification it covers nothing. See
  [Chapter 6](sds/06-factory-automation.md) → *The bootstrap exception ends here*, and
  [`adr/0002`](adr/0002-chapter-gated-build-bootstrap-exception.md).
- **Nothing may be built that a ratified chapter does not already sanction.** If work you are asked
  to do has no chapter behind it, say so and stop — the answer is a chapter, not a workaround.
