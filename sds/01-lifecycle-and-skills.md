# Chapter 1 — Lifecycle & Skills

Chapter 0 settled who acts and who judges. This chapter settles *how work moves*: the fixed sequence
of stages every piece of work passes through, where the two **gates** sit inside it, what each stage
must leave behind, and the packaged procedures — **Skills** — that run the stages. It also defines
the **Readout**, the shape every decision-facing artifact is written in, which Chapter 0 named and
deferred to here.

It comes second because it is the governor of deuce's own construction. Chapter 0's **bootstrap
exception** covers work whose governor does not yet exist; from this chapter's ratification, the
remaining build-out has one, and runs through it.

## What this chapter does not cover

Named here so the seams are visible rather than discovered:

| Not here | Where | What this chapter does instead |
|---|---|---|
| How a contractor reviewer is summoned, bounded, and validated | Chapter 2 — Review System | Verify is written at full shape, with the external half marked **not yet usable** |
| The severity framework; how findings are recorded and how recurrence changes rules | Chapter 2 — Findings System | Verify names *that* findings are recorded and disposed, never *how* they are rated |
| The automated checks a change must pass, and the tooling that runs them | Chapter 3 — Quality gate | Stages refer to "the checks"; their content is Chapter 3's |
| How outside material becomes reviewed configuration | Chapter 4 — Learning System | The rules layer gets a home and an entry bar; it is seeded empty |
| Running the lifecycle with the HC away | Chapter 6 — Factory automation | Stops are defined as pauses, so an orchestrator has something to resume from |

A stage in this chapter is complete as written. Where a mechanism it depends on arrives later, that
is stated in place, in the pattern Chapter 0 set for `attested` merges: write the shape now, name
what cannot yet be exercised.

## The lifecycle

**Five stages, in fixed order.** Every piece of work passes through them, in this sequence, and a
stage begins only when its predecessor's terminal artifact exists.

| # | Stage | Skill | Trigger | Terminal artifact |
|---|---|---|---|---|
| 1 | **Assess** | `assess` | The HC points the AC at an issue. | The **Assessment** — a Readout on the issue. |
| 2 | **Devise** | `devise` | An option is chosen at the **Direction gate**. | The **Plan** — a Readout on the issue. |
| 3 | **Implement** | `implement` | The Plan is posted. | The **open pull request**. |
| 4 | **Verify** | `verify` | The pull request exists. | The **Verification** — a Readout on the pull request. |
| 5 | **Deliver** | `deliver` | Verification carries no open must-fix finding. | The **Delivery Record** — a Readout on the pull request. |

**A stage is defined by four things, and nothing else:** its trigger, the work it does, its terminal
artifact, and its exit test. Why so little: a stage that also owns tooling, formats, or model choice
becomes the place those things hide, and the lifecycle stops being portable to a host that runs
different tooling.

### Stage 1 — Assess

- **Trigger:** the HC points the AC at an issue. That act is deuce's priority signal; Chapter 0
  deliberately has no `priority:` label.
- **The AC produces:** the problem restated in its own words; research into what the change would
  touch; **two to three genuinely different options**, each with its trade-off and its risk; a
  recommendation with the reasoning that produced it; and the questions whose answers would change
  the recommendation.
- **Options must genuinely differ.** Three variations on one approach is one option written three
  times, and it hands the HC a choice that was already made.
- **Ask rather than guess.** Where a requirement is ambiguous, the ambiguity is an open question in
  the Assessment, not a silent assumption inside it.
- **Terminal artifact:** the Assessment, posted on the issue.
- **Exit:** the **Direction gate** — an option is chosen.

### Stage 2 — Devise

- **Trigger:** an option is chosen.
- **The AC produces:** ordered steps concrete enough to execute without re-deciding anything; the
  **testing strategy, decided here and not during implementation** — which tests, which scenarios,
  which edge cases; the files expected to change; and the risks the plan is accepting.
- **The testing strategy is decided up front because deciding it during implementation decides it
  against code that already exists,** which is how a test ends up asserting what was written rather
  than what was wanted.
- **The Plan is revisable direction, not a frozen contract.** An Implement-stage discovery that the
  Plan was wrong loops back to this stage — that is the sanctioned resolution, and an expected
  outcome rather than a failure. Improvising past a Plan that is known to be wrong is not.
- **Terminal artifact:** the Plan, posted on the issue.
- **Exit:** the Plan is posted. **There is no approval gate here** — see *The two gates*.

### Stage 3 — Implement

- **Trigger:** the Plan is posted.
- **The AC does:** re-reads the posted Plan from the issue; creates the feature branch; implements
  the Plan step by step; writes the tests the Plan's strategy defined; runs the checks and iterates
  to green.
- **A fix ships with the test that failed before it.** Chapter 0 makes **fail-first evidence** part
  of the invariant layer; this is the stage where it is produced. A test written after the fix is
  known to pass; only a test that failed first is known to detect the defect.
- **Terminal artifact:** the open pull request. **A commit is not the artifact.** Work that is
  committed but unopened has left nothing the next stage can read.
- **Exit:** the checks are green and the pull request is open and linked to the issue.

### Stage 4 — Verify

- **Trigger:** the pull request exists.
- **The AC does three things, in order:**
  1. **Drift check.** Read the whole diff against the Plan: anything implemented that was not
     planned, and anything planned that is missing. Both are drift; only one of them is visible
     without reading the Plan.
  2. **Adversarial pass.** Actively try to *refute* the change, and try to break its own tests —
     hunting the false green that would still pass if the change were reverted.
  3. **Findings response.** Record every finding, dispose of each, fix what is accepted, re-run the
     checks, and answer on the thread.
- **Verification is never delegated.** It runs in the AC's own loop, on the whole diff. A summary of
  a diff is not a review of it; the defects this stage exists to catch are the ones a summary drops.
- **Review response lives here, and is not a stage of its own.** Answering findings is examining the
  change, which is what this stage is. Why it is stated: the predecessor made it a sixth skill inside
  a five-stage lifecycle, and the seam cost it a decision record to patch.
- **The external half of this stage is not yet usable.** Summoning a contractor reviewer, rating a
  finding, and recording it arrive with the Review System and Findings System in Chapter 2. Until
  then Verify is self-review and the adversarial pass, and a Verification says so plainly rather than
  implying a review that did not happen.
- **Terminal artifact:** the Verification, posted on the pull request.
- **Exit:** no open must-fix finding remains.

### Stage 5 — Deliver

- **Trigger:** Verification carries no open must-fix finding.
- **The AC does:** re-confirms the checks are green on the current head; writes the **Delivery
  Record**; links it from the issue.
- **Deliver never merges.** Merge is the **Ship gate**, and it is the HC's.
- **Terminal artifact:** the Delivery Record on the pull request, plus the reference on the issue.
- **Exit:** the HC merges.

#### The Delivery Record

It serves two readers who are never in the room at the same time: the HC deciding, now, whether this
ships; and an AC in some later session that has no memory of this work and cannot ask anyone about
it. The second reader is the one the field list is built for, because the first reader can ask.

**The governing rule: carry only what the repository cannot reconstruct.** The diff records what
changed and git keeps it forever; the tests record what is covered. Restating them is volume, not
record. What no artifact holds is the reasoning that produced the shape — and that is what a later
session otherwise pays for twice, first by re-deriving it and then by re-proposing what was already
rejected.

| Field | Register |
|---|---|
| The issue, and the option chosen | Readout |
| **Why the other options were rejected** | Prose |
| **What was tried and abandoned, so it is not re-proposed** | Prose |
| What changed, and what covers it — a line each, pointing at the diff and the tests | Readout |
| Findings and how each was disposed of | Readout |
| **What is fragile, and what the AC was unsure about at the end** | Prose |
| Known limitations and follow-ups | Readout |
| The **four health measures** (see *Where the health measures live*) | Readout |

- **The bolded fields are the record.** The rest is navigation. A change with nothing unrecoverable —
  a typo, a dependency bump — has a Delivery Record of three lines, honestly, and needs no exemption
  to get one.
- **The register is split because the readers are.** Chapter 0's dual register, applied: the HC
  judges the Ship gate from the scannable half without reading further. The prose fields are prose
  for the reason decision records are — see *Where it applies, and where it must not*. An artifact
  read by someone who cannot ask *why* has to carry its reasoning, and a table asserts a conclusion
  where a paragraph would have shown it.
- **The uncomfortable fields are the valuable ones,** and they are the first to go thin when a record
  is written to look complete. A Delivery Record that restates the diff is worse than none: it
  occupies the place a record would have gone.
- **Why it is written here and nowhere else:** this is the only moment the whole arc is in one
  context. The Assessment was written before the work existed; the diff shows what without why. The
  AC will not hold this picture again, so the record is nearly free now and impossible later.

## Stages communicate only through terminal artifacts

This is the load-bearing rule of the chapter, and it is stated once here rather than repeated inside
each stage.

- **A stage is not done until its terminal artifact exists.** Not when the work feels finished, not
  when a summary says it happened.
- **A stage begins by reading its predecessor's artifact from the tracker** — never from
  conversational memory, and never from a compaction summary. Every stage transition is therefore a
  **context boundary**, not only the ones a gate happens to sit on.
- **Nothing else crosses between stages.** If a stage needs something the previous artifact does not
  carry, the artifact is incomplete, and the fix is to complete it rather than to pass the fact along
  out of band.

Three things fall out of this, and they are the reason for it:

- **Re-entry is free and idempotent.** Which artifacts exist determines which stage is next, so
  running the lifecycle again from the top is safe at any point. No separate resume mechanism, and
  nothing to keep in sync with one.
- **A pause costs nothing.** A stop can end the session entirely; the work resumes from the tracker.
- **Approval and context reset are decoupled.** The predecessor bound them together, then had to
  spend a decision record and a wide prose change to pull them apart when it wanted the approval
  waived and the reset kept.

**Delegated work obeys the same rule.** When the AC delegates a piece of work, that work is done only
when its result is delivered on the channel the dispatch named. Going idle, or rendering the result
as conversational text that no one collects, is not delivery — and work that was blocked delivers the
blockage rather than nothing. The AC validates what comes back against what it asked for and
re-dispatches naming what is missing. *(Receipts: roughly one in seven analyzed sessions in the
predecessor's July 2026 window ended holding a finished deliverable it never received —
[ace #164](https://github.com/wrburgess/ace/issues/164).)* **What is delegated, to which model, at
what effort, is adaptive configuration** and never canon.

## The two gates

Chapter 0 fixes the count at two — what to build, and what ships. This chapter fixes where they sit
and names them.

| Gate | Where | Question it answers | Settings | Today |
|---|---|---|---|---|
| **Direction gate** | End of Assess | Which option — or none of them? | `required` · `delegated` | `required` |
| **Ship gate** | End of Deliver | Does this ship? | `required` · `attested` | `required` |

**Both gates are graduated from birth**, in the pattern Chapter 0 set for merge authority: the
loosened setting is written now, with its floor named, while writing it is still free. Neither
loosened setting is usable today.

**The Direction gate is the option choice, not plan approval.** Chapter 0 grants the HC judgment over
*what to build*; choosing among the Assessment's options is that decision, and reviewing the AC's own
plan is a second pass over the AC's work product. The trade is stated rather than hidden: a Plan can
be wrong in ways the option choice did not reach. Three things absorb that — the Plan is still posted
and still readable, Verify checks the diff against it, and re-planning is a sanctioned loop rather
than a failure.

**The Ship gate is Chapter 0's, unchanged.** Every merge today is `required` and the HC performs it.
`attested` is written into Chapter 0 and cannot be used until Chapter 2 exists.

**What holds at any setting:**

- **The artifacts are posted whether or not anyone waits for them.** A gate may govern whether the AC
  pauses; it never governs whether the record exists. Each gate's floor states this in its own terms.
- **The context boundary is not a gate** and is never waived with one. Every stage transition resets,
  including the ones no human is standing at.
- **Merging on the AC's own say-so is not available at any setting** (Chapter 0, *Merge authority*).

### The Direction gate, graduated

- **`required`** — the HC chooses among the Assessment's options, and the AC does not proceed without
  a choice. This is the setting today.
- **`delegated`** — the AC proceeds on its own recommendation. Nobody waits, and the work runs from
  issue to Ship gate without a human in it.

**The floor, which no setting reaches:**

1. **The Assessment is always posted, before any work proceeds on it.** A gate governs whether the AC
   *pauses*; it never governs whether the record exists. Under `delegated` the Assessment is the only
   record of what was chosen, which is precisely when it matters most.
2. **It always carries the rejected options and why they were rejected.** A recommendation with the
   alternatives stripped out is not a choice that was made; it is a choice that was hidden.
3. **It always states that the AC self-selected, and on what reasoning.** An artifact that reads the
   same whether or not a human chose is an artifact that cannot be audited.
4. **`delegated` is not licence to compress.** Skipping a *stage* stays the HC's call at every
   setting, and so does every stop.

**`delegated` is not usable today**, for the same reason `attested` is not: the mechanisms that make
it safe do not exist yet. It becomes usable when an Assessment's option set can be independently
reviewed — Chapter 2 — and when an unattended run has somewhere to route a stop — Chapter 6.

**Why graduate it now rather than when it is wanted.** The predecessor placed this gate on plan
approval, found it too expensive, and defaulted it off — so the gate it kept was the one it did not
want. Naming both settings and the floor now means a later chapter can only build the machinery, never
negotiate the floor away at the moment loosening becomes convenient. That is Chapter 0's argument for
merge authority, and it applies here for the same reason: this gate is the HC's judgment over *what to
build*, and a gate that can be widened on demand was never a gate.

**Stated plainly, because it is the point of the whole standard:** the end state is an AC that runs
from issue to merge with the HC away — `delegated` at one end, `attested` at the other. Neither
removes the mechanism. Autonomy here is the HC's judgment being *replaced by something checkable*,
never by the AC's own confidence.

## Stops

A **stop** is the AC pausing to ask the HC a question mid-stage.

- **The bar is not severity. It is: can I resolve this without guessing at intent?** A severity bar
  makes the AC rate its own confidence; this one asks a question it can actually answer.
- **Four standing triggers:**
  1. A check fails and the fix is not obvious.
  2. The work touches something the Plan did not anticipate.
  3. A finding is architectural, or open to more than one reading.
  4. An input the stage requires is missing or unreachable.
- **Trigger 2's sanctioned resolution is to re-plan** — back to Stage 2, not around it.
- **A stop is a pause, never a termination.** The question and its answer are recorded on the issue
  or the pull request before the AC acts on the answer. Why durably: a stop that lives only in a
  conversation cannot survive the session, and the whole lifecycle is built so that nothing has to.
- **Stops are unconditional.** No gate setting waives them. They are what separates an AC that runs
  unattended from one that runs unsupervised.

## Binding to the Work Tracking System

Chapter 0 ratified the schema and left it to this chapter to bind it to the stages.

**`status:` is advanced by the stages, never by hand:**

| Label | Set by |
|---|---|
| `status:ready` | Issue creation, or a blocker clearing. No stage owns it. |
| `status:in-progress` | Assess, on entry. |
| `status:blocked` | Any stage, on a stop. Cleared by the answer. |
| `status:review` | Implement, on opening the pull request. |
| `status:done-pending-merge` | Deliver, on posting the Delivery Record. |

That is what makes the **queue** a dashboard rather than something maintained by hand.

**Issue types map to the lifecycle:**

| Type | Path |
|---|---|
| `TASK:` | All five stages. |
| `BUG:` | All five stages. The reproduction is the Assessment's starting point; the failing test is Implement's first commit. |
| `SPIKE:` | Assess only. Its terminal artifact is a Readout answering the question; it may produce no code, and it opens no pull request. |
| `CHORE:` | Assess (brief) → Implement → Deliver. |
| `EPIC:` | Not run through the lifecycle. Its children are. It closes when its last child merges. |

**A spike is an issue type, not a lifecycle variant.** Research whose outcome is uncertain gets a
`SPIKE:`, which ends in a Readout that feeds the decision — and the work it recommends is then a
normal `TASK:` running all five stages. Why this and not an exploratory branch inside Devise:
the predecessor built the branch, and it needed a hypothesis-plan, a re-plan checkpoint, a
no-pull-request carve-out, and an election rule about who may choose it. The type system already
carries all of that, and carries it in one place.

**Compression is the HC's call, and only theirs.** Three sanctioned compressions:

| Case | Path |
|---|---|
| Trivial change (typo, dependency bump, a value edit) | Assess (brief) → Implement → Deliver |
| Documentation-only change | Implement → Deliver |
| Defect with an obvious cause | Assess → Devise (brief) → Implement → Deliver |

- **The AC never self-selects a compressed path.** It may recommend one in the Assessment. Why: the
  AC's incentive at that moment is to reach the work, and a stage it skipped is one nobody decided to
  skip.
- **Compression removes stages; it never removes artifacts.** Whatever stages run, each still leaves
  its terminal artifact, because the next stage reads it.

## The Readout

A **Readout** is the required shape for decision-facing writing: a brief written for a reader who is
**deciding**, not learning. Chapter 0 names it and defers the definition here.

### The rules

1. **Lead with the decision.** If the artifact needs an answer, the ask is its first line. Context
   supports the ask; it never precedes it.
2. **Every recommendation carries its reasoning.** A conclusion with no visible reason cannot be
   disagreed with, only accepted or refused.
3. **Lines, not paragraphs.** One idea per line. Prose only where a causal chain *is* the content,
   and then a few sentences at most. A section running past roughly five lines of prose should have
   been a list or a table.
4. **A table for anything with two or more dimensions** — options, states, before and after, results.
5. **Bold the noun, not the sentence.** A scannable left edge lets a reader find their row without
   reading the rows above it.
6. **One term per concept, taken from the Glossary.** Never vary the word for a thing inside one
   artifact, even where a synonym would read better.
7. **Uncertainty gets its own labeled line.** What is unknown, unverified, or assumed is a distinct
   item — never a hedge folded into a sentence that also carries a fact.

Rule 7 is the one that keeps the format honest rather than merely brisk. Executive-summary style and
lead-with-the-answer style both strip uncertainty as a matter of course, which makes an artifact read
as more confident than the work behind it.

### Where it applies, and where it must not

| Applies | Does not apply |
|---|---|
| Every terminal artifact: Assessment, Plan, Verification, spike Readout, and the Delivery Record's decision half | SDS chapters |
| Any message to the HC that asks for a decision | Decision records |
| A stop and its question | The Delivery Record's reasoning fields (see *The Delivery Record*) |
| | Commit messages, code comments, pull request titles |

**The line is presence.** A Readout trades causal texture for scannability — a table asserts a
conclusion where a paragraph would have shown the reasoning that produced it. That is the right trade
for a reader who can ask *why* in one message, and the wrong trade for an artifact written to be read
much later by someone who cannot ask anyone anything. Canon and decision records are on the far side
of that line, which is why this chapter is prose.

**One artifact sits on both sides, and does so deliberately.** The Delivery Record is read now by an
HC who can ask, and later by an AC that cannot — so it is split rather than compromised. Its decision
half is a Readout; its reasoning fields are prose. Why not pick one: a Readout of the reasoning
fields would assert conclusions to exactly the reader who most needs to see how they were reached,
and prose across the whole thing would make the HC read the reasoning to reach the ask.

*Derived from the predecessor's proposal at
[ace #163](https://github.com/wrburgess/ace/issues/163), re-authored here. Rule 2 is added: Chapter
0's Glossary requires it and the source proposal did not carry it.*

## Skills

A **Skill** is a packaged procedure the AC follows for a recurring job.

### What a Skill is, and is not

- **One directory, one body:** `skills/<name>/SKILL.md`, carrying its name, a description that says
  when to reach for it, and a body. Long reference material is a bundled file beside it.
- **A Skill body states four things:** when it is invoked, the procedure, its terminal artifact, and
  the conditions under which it stops and asks.
- **A Skill never restates canon; it links the chapter.** A restatement is a second copy, and a
  second copy drifts silently. This is the same rule that governs `CLAUDE.md`.
- **There are no per-tool shims.** One AC means one reader (Chapter 0, *Who acts*); an adapter layer
  is a cost with nothing on the other side of it.
- **A Skill is self-contained** (ADR 0006). A procedure worth having from an outside skill family is
  read, re-authored in deuce's vocabulary, and attributed — never vendored.
- **The entry bar is receipts.** A Skill exists for a job the AC has actually done repeatedly, not
  one it might. A procedure used once is a procedure, not a Skill.

### The audit

The predecessor shipped thirteen Skills. Chapter 0's **zero-based port** rule applies: nothing
carries over by default, and a thing ports only with its receipts.

| Predecessor Skill | Verdict | Reason |
|---|---|---|
| `assess` | **Port** as `assess` | Stage 1. |
| `devise` | **Port** as `devise` | Stage 2. The name ports too, on two independent grounds: it keeps the verb-stage/noun-artifact pattern intact (the artifact is the Plan), and `plan` collides with a reserved command on the AC's own harness. The exploratory-plan machinery does not port — `SPIKE:` carries it. |
| `invoke` | **Port** as `implement` | Stage 3. |
| `verify` | **Port** as `verify` | Stage 4, absorbing review response. |
| `listen` | **Absorbed** into `verify` | It was never a stage; it straddled one. |
| `final` | **Port** as `deliver` | Stage 5. |
| `distill` | **Port** as `distill` | It produces epic briefs, decision records, and Glossary entries — all Chapter 0 canon. It produced Chapter 0. It sits *before* the lifecycle, not inside it. |
| `ship` | **Defer to Chapter 6** | Its value is the unattended run, which is Chapter 6's subject, and its faithfulness backstop needs Chapter 2's review machinery. It is also much smaller here: with stages communicating only through artifacts, sequencing them is nearly all of it. |
| `scout`, `clip`, `follow`, `restock` | **Defer to Chapter 4** | The Learning System. Building them now would build against an unratified chapter. |
| `create-skill` | **Defer to Chapter 5** | A Skill for authoring Skills is ceremony at this size; *What a Skill is* above is the authoring guide. Revisit when hosts author their own. |

**Six Skills survive:** `assess`, `devise`, `implement`, `verify`, `deliver`, `distill`.

**One observation is logged rather than acted on:** the predecessor's intake pipeline had three front
doors and a sibling refresher for one job. Chapter 4 should weigh collapsing them before porting
four Skills; that is Chapter 4's decision, not this chapter's.

## Rules

A **rule** is standing authoring guidance the AC reads while working — the judgment half of the
contracts, the half no automated check can decide. Chapter 0 refers to these when it says the
jargon-free register "lives in the AC's authoring rules."

- **Home:** `rules/`, one file per domain, always readable.
- **Entry bar — receipts, not opinion.** A rule enters only with evidence of the recurring class of
  defect it prevents, cited. This is Chapter 0's zero-based port, applied to guidance.
- **deuce starts with none.** Not one rule ports by default. The mechanisms that fill `rules/` are
  Chapter 2's findings recurrence and Chapter 4's Learning System; until they exist, a rule enters
  one at a time, each carrying its receipt.
- **One rule is cut with this chapter's work: the authoring rule.** Chapter 0 states that the
  jargon-free register is judgment no lint can decide and places it in the AC's authoring rules,
  which is a reference to a file that does not exist yet. It is written as a normal `TASK:`, against
  its own receipts, and it is the first work deuce runs through this lifecycle. Why that ordering
  matters: the chapter is tested by building against it, and a rule about how the AC writes is the
  cheapest possible first test — it produces no code and touches nothing load-bearing, so what breaks
  is the lifecycle rather than the work.
- **Why empty rather than seeded:** the predecessor's rules files accumulated faster than the
  evidence behind them, and a file nobody can audit is a file nobody trims.

## The adaptive layer's home

Chapter 0 splits guidance into an invariant layer (canon) and an adaptive layer (dated, sourced
configuration). This chapter fixes where the adaptive layer lives, because the lifecycle is the first
thing that needs it.

- **Home:** `config/`, each declaration carrying a **date** and a **source**.
- **What goes there, from this chapter's subject matter:** which model and effort level runs each
  stage; what work is delegated and the shape of what comes back; capacity rationing per cycle;
  context budgets.
- **What stays canon:** the stages, their order, their terminal artifacts, the gates, the stops, the
  Readout, and the Skill contract. None of these becomes false if the platform changes.
- **The sorting test is Chapter 0's, unchanged:** would this statement become false if the platform
  changed?
- **The hygiene sweep re-verifies `config/`**, which is the whole reason the dates and sources are
  mandatory.
- **This chapter fixes the home and the two mandatory fields; it does not fix the file format.** The
  schema, and the lint that checks a declaration is dated and sourced, are Chapter 3's. Why the home
  lands here rather than there: the lifecycle is the first thing that needs one — *which model runs
  Verify* has no answer without it — and a Skill written before the home exists has nowhere to put
  its routing, so it puts it in its own body, which is exactly the drift the split exists to prevent.

## Where the health measures live

Chapter 0 fixes that all four health measures are recorded once per pull request and leaves the home
to this chapter. **The home is the Delivery Record.**

| Measure | Recorded as |
|---|---|
| **Quality** (primary) | Findings raised, and how many were must-fix. |
| **Autonomy** (primary) | HC interventions beyond the two gates. |
| Throughput | Elapsed time from issue opened to Delivery Record. |
| Cost efficiency | AC usage consumed across the five stages. |

- **All four, every pull request, in one place.** A measure recorded somewhere else is a measure that
  is missing from the artifact a reader is already reading.
- **Excellent enough applies:** four numbers, not a measurement program. Their exact capture is
  Chapter 3's tooling problem, not this chapter's.

## The bootstrap exception narrows here

- **From this chapter's ratification, deuce's own build-out runs through this lifecycle.** Every
  issue this chapter's work cuts is assessed, planned, implemented, verified, and delivered under it.
  That self-hosting is the test of the chapter: what construction disproves is amended in a later
  chapter.
- **What the exception still covers:** drafting Chapters 2 through 6 themselves, and only that.
- **A chapter is not run through the five stages.** It follows Chapter 0's *Ratification* — draft,
  session, amend in place, merge, record vocabulary and decisions, tag, cut the work. Why stated: the
  lifecycle's Direction gate assumes options to choose between, and a chapter's open questions are
  settled one at a time in a session instead. Two processes, each named, neither borrowing the
  other's shape.

## Founding decisions

Three decisions in this chapter clear Chapter 0's ADR bar — hard to reverse, surprising, and carrying
a real trade-off — and are recorded at ratification:

| ADR | Decision it records |
|---|---|
| 0007 | Stages communicate only through terminal artifacts; every stage transition is a context boundary, decoupled from the gates. |
| 0008 | The Direction gate is the option choice at the end of Assess, not approval of the Plan — and it is graduated from birth, with `delegated` and its floor written before either can be used. |
| 0009 | Review response is folded into Verify; there is no review-response stage and no `listen` Skill. |

---

*Provenance: drafted against Chapter 0 and the predecessor system's lifecycle, which is cited by URL
and never copied in. The predecessor's stage spec, its thirteen Skills, and the proposals at
[ace #163](https://github.com/wrburgess/ace/issues/163) and
[ace #164](https://github.com/wrburgess/ace/issues/164) are the evidence base for what ported, what
was absorbed, and what was deliberately left behind.*
