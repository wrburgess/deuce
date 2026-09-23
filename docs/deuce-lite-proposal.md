# deuce-lite — a proposal for the Fable 5+ / Opus 5.5+ era

- **Status:** proposal, for the HC to decide on
- **Date:** 2026-09-23
- **Replaces, if adopted:** the deuce SDS (`sds/`), which would be archived read-only, the way ace was

## Summary (HC)

**The ask:** a software development system that holds your standard, while you stay out of
*how* the work gets done. It should use less always-on context than deuce and none of deuce's
self-perpetuating process.

**The proposal, in one breath:**

- **You own one page.** That page is `STANDARD.md`: your expectations, written as outcomes plus
  how we'd know each one is met.
- **The AC runs four stages:** Plan, Build, Review, Ship.
- **How much process depends on risk.** There are three lanes: Quick, Standard and Risky.
- **Machines enforce the non-negotiables.** Branch protection, CI, security scanners and hooks
  hold those, not prose.
- **Judgment is guided by short, on-demand Skills.** Nothing sits in always-on context unless it
  earns its place.
- **A second model family reviews every non-trivial PR.** Codex does it read-only, bounded by a
  severity bar and a fix-wave limit.
- **Production findings go to a log, not to instant fixes.** The system changes only when local
  evidence shows a pattern.

**Your expectations list is strong. It has six holes worth filling:**

1. Definition of done
2. When the AC must stop and ask
3. Deploy, rollback and observability
4. Data safety
5. Dependency and cost limits
6. A scorecard that shows the system itself is working

They are in [§3](#3-your-expectations--whats-strong-whats-missing-how-to-reword).

**Where ACs need help and where they don't:** current models already reason, plan and code well
inside a well-framed task. They still need help in four places:

- **Knowing what isn't in the code.** Purpose, scale, constraints.
- **Stopping at the right time.** Neither too early nor gold-plating.
- **Reviewing their own work honestly.**
- **Never bypassing safety.**

Enforce the last one with machines, and give the first three short context and Skills. The
full breakdown is in the table in [§4](#4-where-acs-already-deliver-and-where-they-need-reinforcement).

**Decisions I need from you** are in [§11](#11-decisions-for-the-hc). The first is whether to
adopt the `STANDARD.md` draft in [Appendix A](#appendix-a--standardmd-draft).

**Target size for always-on context:** about 250 lines per project, versus about 35,000 words of
deuce canon an agent may be pointed at today (measured in [§2](#2-why-not-deuce-as-it-stands)).
The target is a design choice, not a measured optimum. The pilot tests it.

---

## Technical detail (HC + AC)

### 1. Design principles

Each principle is here because it changes a decision somewhere below.

| # | Principle | What it rules out |
|---|---|---|
| P1 | **Outcomes, not procedures.** The HC says what good looks like, and the AC chooses how | Step-by-step scripts in Skills; the HC dictating implementation |
| P2 | **Enforce with machines, guide with words.** A rule that can be a check becomes a check | Prose rules for things CI or hooks can hold, such as "never push to main" |
| P3 | **Context is a budget.** Always-on text must earn its place; everything else is read when needed | Reading orders, canon citations, restating one document inside another |
| P4 | **Process matches risk.** Lanes decide how much planning and review a change gets | Five stages and two gates for a typo |
| P5 | **Independent eyes.** Review runs with fresh context, and external review uses a different model family | The author reviewing their own diff in the same conversation that wrote it |
| P6 | **Excellent enough is a stopping rule, not a feeling.** Done means the acceptance criteria are shown working, with no open blockers | Endless fix waves; perfectionism; stopping early |
| P7 | **Learn on evidence, change in batches.** Findings are logged, and rules change only when a pattern recurs | Knee-jerk rules after a single incident |
| P8 | **Delete as readily as you add.** Every rule has a reason and a date, and gets removed when it stops paying | Rules that pile up and outlive the model they were written for |

### 2. Why not deuce as it stands

These are measured in this repository on 2026-09-23. Each line says where the number comes from.

- **Context weight:**
  - The seven chapters in `sds/` are 29,391 words. With `GLOSSARY.md`, `CLAUDE.md` and
    `AGENTS.md` the total is 34,746 (`wc -w`).
  - The eight Skills plus `rules/` and `config/` add another 18,078 words.
- **Tooling weight:** 11,120 lines of TypeScript under `tools/` (`wc -l`). Much of it checks
  deuce's own documents.
- **It builds itself.** All 50 of the latest commits, `git log` from 2026-08-03 to 2026-08-19,
  are about deuce itself.
- **Its tooling makes its own defects.** `findings/classes.md` records three recurring defect
  classes, largely in deuce's own checks:
  - 16 instances of "a check that measures something other than the invariant it claims", across
    9 PRs
  - 12 instances of "a guard that fails open or fails silent", across 7 PRs
  - 9 instances of "an invariant enforced on one path and leaking through another", across 5 PRs
- **Distribution shipped things that didn't work.** `config/fleet.md`, measured 2026-08-17:
  "0 of the 10" status and type labels that deuce's shipped files use existed on bryce's tracker.
- **Prose standing in for configuration.** `config/models.md` says of its own table: "Nothing
  reads these values yet."
- **The measures don't reproduce.** `config/measures.md` says the computed Quality number matches
  the stated one on "5 of 44" Delivery Records.
- **Change is slow by design.** `CLAUDE.md`: "If work you are asked to do has no chapter behind
  it, say so and stop."

**What deuce got right is worth keeping** (see [§10](#10-what-carries-over-from-deuce-and-what-doesnt)):

- the two gates
- stages that communicate only through written artifacts on the tracker
- read-only external review
- the three evidenced review lenses
- watching a check fail before trusting it (ADR 0014)
- admitting outside ideas only on local evidence (ADR 0019)
- plain writing aimed at the decision (`rules/authoring.md`)

### 3. Your expectations — what's strong, what's missing, how to reword

#### What's strong

- **The categories are the right ones.** Context, lifecycle, safety, review, testing, efficiency
  and learning cover the ground.
- **Some lines are exactly the right shape:**
  - "Excellent enough vs perfectionism"
  - "findings go to a trackable log, not instant response"
  - "validity to claims"
- They state an outcome and a limit, not a method.

#### What's missing (the holes)

| # | Hole | Why it matters | Where it lands |
|---|---|---|---|
| H1 | **Definition of done / acceptance criteria per piece of work** | The biggest single driver of an AC staying on task. Without it, "done" is the AC's guess | Plan stage; `STANDARD.md` §Lifecycle |
| H2 | **Decision rights and stop rules** — what the AC decides alone and when it must ask | You want out of *how*. That needs a written line the AC won't cross without you | `STANDARD.md` §Roles |
| H3 | **Deploy, rollback and observability** — your list ends at "deliver" | Production is where escaped errors show up. Nothing says how a bad deploy is noticed or undone | `STANDARD.md` §Safety, `PROJECT.md` |
| H4 | **Data safety** — migrations, backups, destructive operations, personal data | The one kind of mistake you can't roll back | Risky lane triggers |
| H5 | **Dependency, supply-chain and cost limits** — new gems/packages, paid services, AI spend | Agents add dependencies freely, and each one is a lasting cost and risk | Stop rules; Efficiency |
| H6 | **A scorecard for the system itself** | Without a few numbers you can't tell whether deuce-lite beats deuce, or whether a new model helps | §9 Learning |
| H7 | **Maintenance standards** — upgrades, dead code, tech debt | You name maintenance as a role but give it no bar | `STANDARD.md` §Maintenance |
| H8 | **Product fit** — did we build the right thing, not just build it right | Tests prove code matches the plan, not that the plan matched the need | Ship stage: see it working in the running app |
| H9 | **Keeping context current** | A stale `PROJECT.md` is worse than none, because the AC trusts it | Learn sweep; "last verified" dates |
| H10 | **What happens when the reviewer is unavailable** | Codex down, or its login expired | Review Skill fallback |

"Identity & Governance" appears as a stray line under Context in your list. I folded it into a
**Roles & decision rights** section, which is where H2 lives.

#### How to reword

Write each area as **Outcome** (what is true when it works) plus **Evidence** (how either of us
can tell). Leave out mechanisms. The AC picks those, and the pilot proves them.

Example, using your Safety bullet:

- **Your words:** "Security linting, analysis, and review for all implementations."
- **Reworded:** "**Outcome:** no known-vulnerable dependency, leaked secret or common-class
  vulnerability reaches `main`. **Evidence:** every merged PR shows green security checks, and
  every Risky-lane PR carries a security review."

The mechanism (Brakeman, gitleaks, `/security-review`) is not in the standard. It can change
without the standard changing. [Appendix A](#appendix-a--standardmd-draft) rewrites your whole
list this way.

### 4. Where ACs already deliver, and where they need reinforcement

**Read this table as judgment, not measurement.** It comes from my own behavior and from the
failure patterns deuce and ace recorded. The pilot's scorecard is how we would actually find out.

**Levels, lightest to heaviest:**

- **Native** — nothing needed.
- **Nudge** — one to three lines in `CLAUDE.md`.
- **Context** — a project file the AC reads.
- **Skill** — an on-demand procedure or template.
- **Enforce** — a hook, CI or branch protection.
- **External** — a different model, or the HC.

| Expectation | What current ACs do on their own | Reinforcement | Why |
|---|---|---|---|
| Common vocabulary | Adopt terms well when given them; drift between sessions without them | **Nudge + Context** — a glossary of about 20 terms | Small cost, and it removes back-and-forth over wording |
| Writing to the HC | Tend toward long, hedged, mechanism-first prose | **Skill** — the Readout template, plus two authoring rules | Format holds when a template exists; without one, it varies by session |
| App footprint (code, dependencies) | **Native** — reading the code and lockfiles is a strength | Point to commands in `PROJECT.md` | Don't write down what the code already says |
| Purpose, users, scale, horizon | Can't be inferred from code; ACs guess and over- or under-build | **Context** — `PROJECT.md` with real numbers | The largest source of building on a whim is a missing "why" and "how big" |
| AC/HC roles | Follow roles well when stated | **Nudge** — decision rights in `STANDARD.md` | Short and stable |
| Lifecycle steps | Plan and build natively. Skip gates, skip their own review, and declare done early | **Skill + Enforce** — Skills per stage; CI requires a PR and a review record | The failure is skipping steps, not doing them badly |
| Recording decisions and state | Don't write down decisions or leave handoffs unless told to; memory dies with the session | **Skill** — the tracker is the memory: issue = brief + plan, PR = Readout + review | Stages that communicate only through tracker artifacts, kept from deuce |
| No merges to main outside a PR | Mostly comply, but pressure or confusion can override text | **Enforce** — branch protection + hooks + permission deny rules | Never trust prose for this (P2) |
| Security linting and analysis | Won't run scanners unless they are wired in | **Enforce** — CI scanners; **Skill** — `/security-review` on Risky | Scanners are cheap and deterministic |
| Threat awareness | Good general knowledge; no project-specific threat model | **Context** — `SECURITY.md` (assets, actors, entry points, response) | General knowledge doesn't say where *your* crown jewels are |
| Self-adversarial review | **Weak.** Reviewing in the conversation that wrote the code tends to confirm, not refute | **Skill + fresh-context subagent** that must *demonstrate* a defect, not just give an opinion | Fresh context is the fix; more instructions are not |
| External adversarial review | Not possible alone | **External** — Codex, read-only, with a summons template | Different model families miss different things |
| Review limits and "excellent enough" | Tend to fix every finding, including nits, or loop | **Skill** — severity bar + a two-wave limit + stop rule | Deuce's PR #59: three reviews each found new problems; the fix was a re-plan, not a fourth patch |
| Test focus and quality | Write many shallow tests; mock too much; test implementation details | **Skill** — testing rules in [§8](#8-testing-standards); **Enforce** — CI runs the suite | Guidance on *what* to test pays off; quantity doesn't |
| Testing tools and commands | **Native** once commands are written down | **Context** — commands in `CLAUDE.md` | One line each |
| Testing efficiency | Often run the full suite repeatedly, or too little | **Nudge** — targeted tests while building, the full suite before the PR | One line |
| Best model and effort per job | **Can't be done from inside a session**; it's a harness setting | **Config** — `routing.md` + subagent `model`/`effort` settings | Only configuration can do this |
| Reasoning, planning, decisions | **Native** and strong at high effort | Give goals, constraints and acceptance criteria. **Don't** prescribe thinking steps | Prescribed step-by-step thinking constrains a strong model more than it helps (judgment) |
| Carrying plans through | Mostly native. Drifts on long work, and silently drops or changes steps | **Skill** — plan as a checklist; the PR reconciles each step as done, changed or dropped with a reason | Makes drift visible instead of silent |
| Production findings to a log | Tend to jump straight to fixing | **Skill** — the findings intake; **Enforce** — a `finding` label | Your "trackable log, not instant response" |
| Adjusting to new models and harnesses | Not possible alone | **HC-called routine** — canary tasks rerun on each release | Needs a fixed yardstick, not opinion |
| Outside claims (pundits, experimenters) | Tend to accept confident claims | **Skill** — the claim-check: source, claim, local test, adopt or reject | Deuce's ADR 0019, local evidence only, in one Skill |

### 5. The system at a glance

#### Stages and lanes

```
            Gate 1: what to build                  Gate 2: what ships
                    │                                       │
 Issue ──► PLAN ────┴───► BUILD ───► REVIEW ───► SHIP ──────┴──► merged ──► watch
 (brief +   options,      code +      fresh-      checks green,              post-deploy
 criteria)  plan, tests,  tests to    context      Readout,                  check; findings
            lane          the plan    self-review  merge per gate            → log
                                      + Codex +
                                      security
```

| Lane | What puts work here (the AC proposes it, the HC can override) | Plan / Gate 1 | Review | Gate 2 |
|---|---|---|---|---|
| **Quick** | Copy, config, docs, a dependency patch release, a one-file fix with a regression test | No plan gate; a one-line intent on the PR | Self-review only; Codex optional | AC may merge when checks are green (if the gate setting allows) |
| **Standard** | Everything that is neither Quick nor Risky | Plan posted; **HC approves** | Fresh-context self-review + Codex | AC may merge on green + a clean review (`attested`), or the HC merges |
| **Risky** | Auth, permissions, payments, personal data, migrations that change or drop data, public APIs, infrastructure or deploy config, a new dependency or paid service, or anything irreversible | Options + plan + rollback plan; **HC approves** | Self-review + Codex at high effort + `/security-review` | **HC merges, always** |

The Risky triggers are a fixed list in `STANDARD.md`, not the AC's judgment call. That makes the
highest-cost classification predictable.

#### Files: shared (the deuce-lite repo, shipped as a Claude Code plugin)

```
deuce-lite/
├── STANDARD.md          HC-owned. Your expectations as outcomes + evidence (~2 pages)
├── VOCABULARY.md        ~20 terms (Appendix B)
├── lenses.md            Review lenses, with the evidence behind each (§7)
├── routing.md           Model + effort per stage × lane, dated (§8a)
├── skills/
│   ├── plan/            Brief → options → plan + test strategy + lane → Gate 1
│   ├── build/           Implement the plan; tests; checks green; open PR with the checklist reconciled
│   ├── review/          Fresh-context refuter + Codex + security (by lane); answer every finding
│   ├── ship/            Recheck green; Readout; merge per gate; post-deploy check
│   ├── frame/           Raw idea → issue with acceptance criteria (before Plan, when needed)
│   ├── brief/           "Where does X stand?" — status on demand (kept from deuce)
│   └── learn/           Triage the findings log; claim-checks; canary reruns; prune rules
├── agents/
│   ├── refuter.md       Fresh-context adversarial reviewer (sets its own model/effort)
│   └── scout.md         Cheap wide search/triage subagent
├── hooks/               Protect main; secret scan before commit
├── templates/           CLAUDE.md, PROJECT.md, SECURITY.md, PR + issue templates
└── ci/                  Workflow templates per stack (Rails, Node): tests, lint, security
```

#### Files: per project (what an adopting app carries)

```
CLAUDE.md          ≤ ~100 lines: what this is, commands, never-dos, pointers   (always on)
PROJECT.md         Purpose, users, scale numbers, constraints, architecture map,
                   dependencies, deploy/rollback, horizon, last-verified date  (read at Plan)
SECURITY.md        Assets, actors, trust boundaries, controls, incident response (read at Plan/Review)
docs/decisions/    One page per architecture or product decision — only when a
                   future AC would otherwise choose differently
.github/           CI (tests, lint, security), PR template, issue templates, branch protection
.claude/           settings.json: hooks + permission deny rules
```

**Always-on budget** (design target): `CLAUDE.md` of about 100 lines, plus the plugin's short
Skill descriptions. Everything else is read when a stage calls for it.

### 6. Lifecycle and Skills

#### Stage contracts

Each Skill says what its artifact must contain and how it's judged. It does not script the steps
(P1).

| Stage | Reads | Writes (the artifact) | Done when |
|---|---|---|---|
| **Frame** (optional) | The HC's raw idea | An issue: problem, who it's for, acceptance criteria, out-of-scope | The HC confirms the criteria |
| **Plan** | The issue, `PROJECT.md`, `SECURITY.md` (Risky), relevant code | On the issue: lane, 2–3 options + recommendation (Standard/Risky), plan as a checklist, test strategy, risks, rollback (Risky) | Gate 1: the HC approves (Standard/Risky) |
| **Build** | The approved plan | Branch + commits + PR with the checklist reconciled (done / changed / dropped + why) | Checks green locally; every acceptance criterion maps to a test or a named manual check |
| **Review** | The PR diff, plan and criteria — **not** the build conversation | On the PR: findings table, each answered (fixed / rejected with reason / logged) | No open Blockers; at most two fix waves |
| **Ship** | The PR and review record | Readout on the PR; merge per gate; post-deploy check noted | Merged, and the post-deploy check passed or was flagged |

#### Stop rules — the AC stops and asks the HC when:

1. An acceptance criterion is ambiguous in a way that changes what gets built.
2. Mid-build, the approved plan turns out wrong. That means re-plan; don't improvise.
3. Two fix waves haven't converged. The design is the problem; escalate with a re-plan.
4. A Risky trigger shows up in work filed as Quick or Standard.
5. The work needs a new dependency, paid service, credential or cost.
6. Any destructive or irreversible operation on data or infrastructure.
7. Checks can't pass for reasons outside the change's scope. Report it; don't widen the PR.

**Otherwise the AC decides, and notes the decision in the Readout.** This is how you stay out of
*how* without losing control of *what*.

#### Documenting state in an AC-constrained world

- **The tracker is the memory.** The issue holds the brief and the plan. The PR holds the Readout
  and the review record. A new session starts by reading those, never a chat summary.
- **`PROJECT.md` is the current truth** about the app. The AC updates it in the same PR as a
  change that alters it, and each file carries a `last verified` date.
- **Decision records only for decisions a future AC would otherwise remake differently.** One
  page. No decision records about the process itself.
- **Experience goes to the findings log** ([§9](#9-learning-tuning-optimization)), not to new
  rules.

#### Writing standard (AC → HC)

Every artifact the HC reads opens with the **Readout** ([Appendix E](#appendix-e--readout-template)):

- **Status or outcome**, in one line.
- **Decision needed**, if any, with a recommendation.
- **What changed.**
- **Risk.**
- **Evidence**, as links.

Rules:

- Lists and short blocks, with bold lead words.
- Mechanism only when a decision needs it.
- No hedging filler.
- A single `#N` means an issue; a PR is written `PR #N`.

Two rules carry over from `rules/authoring.md`, where each came with a documented rejection behind
it:

- **Register:** plain, direct and dense. Neither chatty nor stilted (ace #163).
- **Altitude:** open with what the reader must decide, not how the thing works (ace #132).

### 7. Review standards

#### Two independent reviews

1. **Self-adversarial review, with fresh context.** The `refuter` subagent gets the diff, the plan
   and the acceptance criteria, and nothing from the build conversation. Its job is to *show* a
   defect: a failing input, a failing test, or a path that escapes a guard. "This looks risky"
   without a demonstration is a question, not a finding.
2. **External adversarial review.** Codex runs read-only, through `codex exec`, which is deuce's
   mechanism in `config/review.md`. It gets the diff, plan, criteria, three lenses and the severity
   bar ([Appendix F](#appendix-f--external-review-summons)). `AGENTS.md`, deuce's 144-word role
   boundary, carries over nearly verbatim.
3. **Security review** on the Risky lane uses the built-in `/security-review` Skill, plus the
   scanners already in CI.

**Fallback (H10):** if Codex can't be reached, the review says so on the PR. A second fresh
`refuter` pass then runs on a different Claude model. A Risky PR waits for Codex or for the HC.

#### Severity bar

| Severity | Meaning | Action |
|---|---|---|
| **Blocker** | Wrong behavior, an acceptance criterion not met, a security hole, data loss or corruption, a broken build | Must be fixed before merge |
| **Should-fix** | A real defect with low impact or unlikely conditions | Fix if cheap, otherwise log it as a finding with a reason |
| **Nit** | Style or preference | Ignore, or batch into a later PR. Never a reason for a fix wave |

#### Limits

- **At most two fix waves.** After each wave the reviewer sees only what changed.
- **A third wave is not allowed.** It is a stop (rule 3), and the answer is a re-plan.
- **Every finding gets an answer:** fixed, rejected with a reason, or logged.

#### Lenses

Each review carries three lenses, chosen by what the change touches.

**Three come with evidence from deuce's `findings/classes.md`:**

1. *Does this test or check measure the claim, or a stand-in for it?* 16 instances across 9 PRs.
2. *Does any guard fail open or silently on unexpected input?* 12 instances across 7 PRs.
3. *Which path does this rule not cover?* 9 instances across 5 PRs.

**Standing lenses for app code** (judgment; the log will confirm or prune them):

- Authorization on every entry point
- Data integrity under concurrency and failure
- Error paths and user-visible failure
- Performance at the scale in `PROJECT.md`

#### "Excellent enough"

A change is done when all of these hold:

- Every acceptance criterion is shown working.
- There are no open Blockers.
- Should-fixes are answered.
- Checks are green.

Stop there. Polish beyond that is a new issue, not this PR.

### 8. Testing standards

- **Test behavior at the boundaries users and callers touch**, not internal wiring. For Rails, that
  means model and request tests first, with system tests only for critical flows. For JS, unit
  tests plus a few end-to-end tests with Playwright, which is already in the environment.
- **Every acceptance criterion maps to a test or a named manual check** (seen in the running app).
  The map goes in the PR.
- **Bugs start with a failing test** that reproduces the bug.
- **Watch every new test or check fail once** before trusting it: break the thing, see red,
  restore. Deuce's ADR 0014 recorded checks that could not fail at all. This is its cheap,
  general form.
- **Mock only at external boundaries** (network, third-party APIs, clock). Asserting on your own
  mocks is a stand-in, which is lens 1.
- **Efficiency:** targeted tests while building, the full suite once before the PR, and CI as the
  independent rerun.
- **Flaky tests are bugs.** Fix them or log them. Never skip or quarantine one to get green.
- **No global coverage percentage as a gate.** Changed-line coverage is shown as a signal. A
  percentage invites tests that exist only to raise the number (judgment).
- **Excellent enough:** criteria and critical paths are covered, and error paths that matter to
  users are covered. Don't test the framework.

#### 8a. Efficiency — models, effort, reasoning

**Routing is configuration** (`routing.md`, dated), applied through the harness and subagent
settings, never in prose.

The starting table below is a **hypothesis**:

- I don't have measurements comparing Fable 5.1 and Opus 5.5 on your work.
- Deciding which frontier model runs Plan and Review is exactly what the pilot's canary tasks are
  for.

| Stage | Quick | Standard | Risky |
|---|---|---|---|
| Plan | — | Frontier model, `high` | Frontier model, `xhigh` |
| Build | Sonnet 5, `medium` | Frontier model, `medium` | Frontier model, `high` |
| Review (refuter) | Frontier model, `medium` | Frontier model, `high` | Frontier model, `max` |
| Review (external) | optional | Codex | Codex |
| Ship | Sonnet 5, `low` | Sonnet 5, `low` | Frontier model, `medium` |
| Scout (search/triage) | Haiku 4.5 | Haiku 4.5 | Sonnet 5 |

- "Frontier model" means Fable 5.1 or Opus 5.5, whichever wins the canary comparison. The table
  names aliases, so it doesn't go stale on each release.
- The effort levels are the harness's vocabulary (`low` → `max`), per `config/models.md`.

**What improves reasoning:**

- **Do give it the goal, constraints, acceptance criteria and known risks.**
- **Do ask for options plus a recommendation** at Plan.
- **Do use fresh context for review.**
- **Don't prescribe thinking steps or stage-by-stage checklists** for work the model already does
  well (judgment, P1).

**Carrying plans through:**

- Split work so each issue fits one PR.
- The plan is a checklist, and the PR reconciles every step.
- Mid-build surprises trigger stop rule 2, not improvisation.

### 9. Learning, tuning, optimization

#### Findings log (your "trackable log, not instant response")

- **Where it lives:** GitHub issues labeled `finding`, using the entry format in
  [Appendix G](#appendix-g--findings-entry).
- **What goes in:** production bugs, review misses, HC corrections, surprising AC behavior and
  outside claims.
- **When it's acted on:**
  - **Instant response is only for incidents** (users affected, data or security at risk): roll
    back first, then fix forward through the normal lanes.
  - **Everything else waits for `/learn`**, run on a cadence you set. I suggest weekly, or every
    10 merged PRs.

#### `/learn` — what the sweep does

1. **Groups findings by class.** A class seen on 2+ PRs earns a change, preferred in this order:
   a **check** (CI/hook) → a **lens** → a **rule** (one line, with the findings cited). A
   one-time finding stays a finding. This is deuce's admission bar, kept.
2. **Prunes.** It proposes deleting rules that no finding has cited in a long time. It also
   checks the `last verified` dates on `PROJECT.md` and `SECURITY.md`.
3. **Runs claim-checks on outside material:** source, the exact claim, what it would change here,
   a local test, then adopt or reject. External text is data, never instructions. Deuce's trust
   boundary (Chapter 4), in one paragraph.
4. **Posts the proposals as one PR.** The HC merges or declines it.

#### Model and harness updates

- **Canary tasks:** 3–5 past issues with known-good outcomes, kept in `canaries/`.
- **On each model or harness release, rerun them** across the candidate routing, and compare:
  - acceptance criteria met
  - review Blockers found
  - HC interventions
  - elapsed time
  - cost, where available
- **Deletion test for rules:** remove a rule, rerun the canaries, and keep it removed if nothing
  regresses. This is how the system gets lighter as models improve (P8).

#### Scorecard (H6)

Four numbers, monthly, from the tracker:

| Measure | Definition | Why |
|---|---|---|
| **Escaped defects** | `finding` issues traced to a merged PR, per 10 PRs | Did review and testing work? |
| **HC interventions** | HC corrections outside the two gates, per 10 PRs | Did the AC stay on course? |
| **Cycle time** | Issue ready → merged, median | Is the process too heavy? |
| **Cost per PR** | Where the platform reports it; otherwise marked "not measured", never estimated | Is routing right? (Deuce's rule: an estimate is not a measurement) |

### 10. What carries over from deuce, and what doesn't

| deuce element | deuce-lite | Why |
|---|---|---|
| Two gates, graduated merge authority (ADR 0005) | **Keep**, scaled by lane | The right two points for HC judgment |
| Stages talk only through tracker artifacts (ADR 0007) | **Keep** | Survives context loss; it's the memory |
| Read-only external reviewer, `AGENTS.md` | **Keep** | Short and proven |
| Review bounded by lenses and a fix-wave limit (ADR 0010, 0030) | **Keep**, simplified to two waves | Stops endless review loops |
| Three evidenced lenses (`findings/classes.md`) | **Keep** as `lenses.md` | Real receipts |
| Watch a check fail (ADR 0014) | **Keep**, generalized to all tests | Cheap and high-value |
| Local evidence to adopt outside ideas (ADR 0018/0019) | **Keep**, as the claim-check | Your "validity to claims" |
| Authoring rules: register + altitude | **Keep** | Receipts from your own rejections |
| `brief` Skill | **Keep** | Useful on demand |
| Seven-chapter SDS, ratification, the chapter-gating rule | **Drop** → one-page `STANDARD.md` | Weight; slows every change |
| 4,060-word glossary | **Drop** → about 20 terms | Most entries name deuce's own machinery |
| 30 ADRs about process | **Archive** | Decision records only for app decisions |
| Five stages with a context boundary at each | **Merge** into four; fresh context only where it pays (Review) | Fewer handoffs |
| Reference grammar, dual register, Readout rules as canon | **Shrink** into one template | Keep the effect, drop the ceremony |
| Distribution: manifest, receipt, sync, fleet roster | **Replace** with a Claude Code plugin + templates | Shipped things that didn't work (bryce labels, 0 of 10) |
| Factory automation (Chapter 6) | **Defer** | Add when unattended volume exists |
| Health measures tooling | **Replace** with the four-number scorecard | Didn't reproduce (5 of 44) |
| About 11k lines of document-lint TypeScript | **Drop**; use CI for app checks only | Created its own defect classes |

### 11. Decisions for the HC

| # | Decision | My recommendation |
|---|---|---|
| D1 | Adopt `STANDARD.md` ([Appendix A](#appendix-a--standardmd-draft)) as your one-page standard, edited as you see fit | **Yes.** It is the only file that is yours |
| D2 | New repo `deuce-lite`, or slim deuce in place | **New repo; archive deuce read-only.** Clean history, and it escapes deuce's own chapter-gating rule |
| D3 | Default gate settings: Gate 1 for Standard and Risky; Gate 2 `attested` for Quick and Standard, HC-only for Risky | **Yes** |
| D4 | Pilot host | **bryce**, the existing canary in `config/fleet.md`, for about 10 PRs |
| D5 | Findings log as GitHub issues with a `finding` label, or as a file | **Issues.** Trackable, linkable, no merge conflicts |
| D6 | Distribution as a Claude Code plugin, or copied templates | **Plugin**, confirmed in Phase 1. If a plugin can't carry what we need, fall back to a template repo |
| D7 | `/learn` cadence | **Weekly, or every 10 merged PRs**, whichever comes first |

### 12. Rollout

| Phase | What | Exit criterion |
|---|---|---|
| **0 — Decide** | You settle D1–D7 | `STANDARD.md` approved |
| **1 — Build** | deuce-lite repo: STANDARD, VOCABULARY, lenses, routing, 7 Skills, 2 subagents, hooks, templates, CI templates for Rails and Node | Always-on context ≤ about 250 lines per project; each Skill's artifact contract written |
| **2 — Pilot** | bryce adopts; about 10 real PRs across all three lanes; canary tasks set up | Zero merges outside a PR; every Standard/Risky PR carries a review record; scorecard baseline captured |
| **3 — Tune** | First `/learn` sweep; canary comparison of Fable 5.1 vs Opus 5.5 for Plan and Review | `routing.md` updated on evidence |
| **4 — Roll out** | nadal adopts; deuce archived | Both hosts on deuce-lite |

**Risks:**

- **Removing structure lets drift come back.** Mitigation: the scorecard shows HC interventions,
  and a rise in them triggers `/learn`.
- **Codex availability.** Mitigation: the fallback in §7.
- **Plugin limits I haven't confirmed.** Mitigation: D6's fallback.

---

## Appendix A — `STANDARD.md` draft

> Your expectations, reworded as outcomes plus evidence. Mechanisms live elsewhere and can change
> without this page changing. Edit freely; this page is yours.

**Roles & decision rights**

- **HC decides:** what to build (Gate 1) and what ships (Gate 2); anything on the stop list.
- **AC decides:** everything else about how, and records notable choices in the Readout.
- **Contractor reviewers:** read, report and never change anything.
- **Outcome:** the HC never has to direct implementation, and is never surprised by a decision
  that belonged to the HC. **Evidence:** HC interventions outside the gates trend down.

**Context**

- **Outcome:** HC and AC use the same words for the same things. **Evidence:** terms in
  `VOCABULARY.md`; no clarification rounds over terminology.
- **Outcome:** everything the AC writes to the HC can be judged from its first few lines.
  **Evidence:** every artifact opens with a Readout; the HC rarely asks "what does this mean?"
- **Outcome:** the AC knows the app's purpose, users, footprint, dependencies, constraints, scale
  and horizon, and builds for now plus the stated horizon, no further. **Evidence:** `PROJECT.md`
  is current (verified in the last 90 days) and plans cite it.

**Lifecycle**

- **Outcome:** every piece of work has acceptance criteria before code, and is done only when
  they're shown working. **Evidence:** the issue carries the criteria; the PR maps each one to a
  test or a named manual check.
- **Outcome:** process matches risk. **Evidence:** each PR is labeled Quick, Standard or Risky;
  Risky triggers are:
  - auth or permissions
  - payments
  - personal data
  - data-changing migrations
  - public APIs
  - infrastructure or deploy
  - new dependency or paid service
  - anything irreversible
- **Outcome:** decisions, state and experience survive the end of any session. **Evidence:** a new
  AC can resume any work from the issue and PR alone.

**Safety**

- **Outcome:** nothing reaches `main` except through a reviewed PR. **Evidence:** branch
  protection on; zero direct pushes.
- **Outcome:** no known-vulnerable dependency, leaked secret or common-class vulnerability reaches
  `main`. **Evidence:** security checks green on every merged PR; Risky PRs carry a security
  review.
- **Outcome:** we know what we're protecting and how we'd respond. **Evidence:** `SECURITY.md`
  names the assets, actors, entry points, controls and the incident runbook, and is updated when a
  change moves a boundary.
- **Outcome:** any deploy can be undone, and a bad one is noticed. **Evidence:** `PROJECT.md`
  states the rollback and the monitoring; Risky plans include rollback.
- **Outcome:** no data loss we can't recover from. **Evidence:** destructive operations are HC
  decisions; backups are named in `PROJECT.md`.

**Review**

- **Outcome:** every non-trivial change is challenged by fresh eyes and a second model family
  before merge. **Evidence:** a review record on every Standard and Risky PR, with each finding
  answered.
- **Outcome:** review ends. **Evidence:** at most two fix waves; Blockers only block.

**Testing**

- **Outcome:** tests prove behavior users and callers depend on, and fail when it breaks.
  **Evidence:**
  - every criterion is mapped
  - every new test was seen failing once
  - no skipped flaky tests
- **Outcome:** tests stay fast enough to run often. **Evidence:** suite time tracked; slow tests
  logged as findings.

**Efficiency**

- **Outcome:** each job runs on the right model at the right effort. **Evidence:** `routing.md` is
  dated and justified by canary results.

**Maintenance**

- **Outcome:** dependencies and frameworks stay within supported versions; dead code gets removed.
  **Evidence:** dependency-update PRs flow through the Quick lane; upgrades are planned as
  Standard or Risky work.

**Learning**

- **Outcome:** problems become improvements through evidence, not reaction. **Evidence:** findings
  are logged; `/learn` runs on cadence; rule changes cite 2+ findings.
- **Outcome:** the system gets lighter as models improve. **Evidence:** canary reruns on each
  release; rules deleted when the deletion test shows no regression.
- **Outcome:** outside ideas are adopted only when they hold up here. **Evidence:** each adoption
  has a claim-check with a local result.

## Appendix B — Vocabulary starter

| Term | Meaning |
|---|---|
| **HC** | Human collaborator — you. Owns the two gates and the standard |
| **AC** | AI collaborator — the one agent that plans, edits, commits and pushes |
| **Contractor reviewer** | Any other model summoned read-only for one review (e.g. Codex) |
| **Lane** | Quick / Standard / Risky — decides how much process a change gets |
| **Gate 1** | The HC's approval of what to build: the plan |
| **Gate 2** | Approval of what ships: the merge |
| **Acceptance criteria** | The checkable statements that define done for one issue |
| **Plan** | Lane, options + recommendation, checklist, test strategy, risks and rollback, on the issue |
| **Readout** | The fixed opening block of anything written for the HC |
| **Stop** | A point where the AC must ask the HC (the seven stop rules) |
| **Finding** | A logged problem or observation, labeled `finding` |
| **Blocker / Should-fix / Nit** | Finding severities; only Blockers block a merge |
| **Fix wave** | One round of fixes after review; at most two |
| **Refuter** | The fresh-context subagent whose job is to show a defect |
| **Lens** | A specific question a review must answer |
| **Checks** | Everything CI runs: tests, lint, security scans |
| **Canary tasks** | Fixed past issues rerun to compare models or settings |
| **Claim-check** | The test an outside idea must pass before adoption |
| **Excellent enough** | Criteria shown working, no open Blockers, checks green |

## Appendix C — `CLAUDE.md` template (per project)

```markdown
# <App name>

<One sentence: what it is and who it's for.> Full context: PROJECT.md. Threat model: SECURITY.md.
Standard: deuce-lite STANDARD.md (via plugin). Vocabulary: VOCABULARY.md.

## Commands
- Setup: `bin/setup`
- Test (targeted): `bin/rails test path/to/file_test.rb`
- Test (full): `bin/rails test && bin/rails test:system`
- Lint / security: `bin/rubocop`, `bin/brakeman`, `bundle exec bundler-audit`

## Never
- Push or merge to main outside a PR (hooks + branch protection enforce this)
- Add a dependency, paid service, or credential without HC approval
- Run destructive data operations
- Skip, disable, or quarantine a test to get green

## Working here
- Use the deuce-lite Skills for Plan / Build / Review / Ship; lane per STANDARD.md.
- <3–5 project-specific conventions that the code alone doesn't make obvious.>
```

## Appendix D — `PROJECT.md` template (per project)

```markdown
# <App> — project context            last verified: YYYY-MM-DD

## Purpose and users
## Goals (next 6–12 months) and non-goals
## Scale — today and at horizon      (users, requests/day, data size; real numbers)
## Constraints                        (budget, hosting, compliance, deadlines, team)
## Architecture map                   (main parts, where they live, how data flows)
## Dependencies                       (services, key libraries, why each)
## Deploy, rollback, monitoring       (how it ships, how to undo it, where errors show)
## Data                               (stores, backups, personal data, retention)
## Known debt and sharp edges
```

## Appendix E — Readout template

```markdown
**Status:** <one line — done / blocked / needs decision>
**Decision needed:** <question> — **Recommend:** <option, one-line why>   (omit if none)
**What changed:** <2–4 bullets, outcome first>
**Risk:** <lane; what could go wrong; rollback>
**Evidence:** <checks run, PR/issue links, criteria→test map>
```

## Appendix F — External review summons

```text
You are a read-only contractor reviewer. Do not modify files, commit, or push.

Review this pull request diff against its plan and acceptance criteria (both below).
Try to REFUTE the change: for each finding, give a concrete failing input, path, or test.

Answer these three lenses explicitly:
1. <lens>   2. <lens>   3. <lens>

Severity: Blocker (wrong behavior, criterion unmet, security, data loss, broken build) /
Should-fix (real, low impact) / Nit (style). Report as a table:
| # | Severity | File:line | Finding | Demonstration |

End with: "Reviewed by <tool> <model>".
--- PLAN --- ... --- CRITERIA --- ... --- DIFF --- ...
```

## Appendix G — Findings entry

```markdown
Title: finding: <what happened, in one line>
Labels: finding, <area>

**What happened:** <observed behavior; when; where>
**Impact:** <who/what was affected; incident? y/n>
**Traced to:** <PR #N / commit / "outside claim: <source link>">
**Suspected class:** <existing lens/class, or "new">
**Proposed change:** <check / lens / rule / none — triaged at /learn, not now>
```
