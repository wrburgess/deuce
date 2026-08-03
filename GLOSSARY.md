# Glossary

The single home for this system's vocabulary. One entry per named thing; one term per concept, one
concept per term. A term enters canon only by getting an entry here, added when a chapter of the
SDS is ratified. When a document needs to explain a term of art in plain language, the explanation
is taken from here rather than improvised.

This is a reference, not something to read front to back. It is linked at first use and read on
demand.

**AC** — AI collaborator: the AI agent that plans, implements, reviews, and maintains the system.
deuce has exactly one AC, Claude Code, and it is the only agent that edits, commits, or pushes here.

**Accepted register** — `findings/accepted.md`: the one-line-per-finding record of every finding in
state `accepted`, each line linking the disposition that accepted it. The summons carries its
contents, which is how a kept residual avoids being re-litigated by a later review.

**Adaptive layer** — Guidance coupled to today's AI platform: context budgets, model and effort
routing, delegation patterns, review economics, capacity limits. Recorded as dated, sourced,
re-verifiable configuration, never as canon.

**ADR** — Architecture decision record: a short, dated, immutable document recording one decision
and its reasoning. Written only when a decision is hard to reverse, surprising, and carries a real
trade-off.

**Assessment** — The terminal artifact of the Assess stage: a Readout on the issue carrying the
problem restated, what the change would touch, two to three genuinely different options with their
trade-offs and risks, a recommendation with its reasoning, and the open questions.

**Attested merge** — The merge setting under which the AC may merge its own work, but only against
an independent review from a model other than the AC, bound to the exact commit being merged.

**Blast-radius declaration** — A written statement, required before any automation uses a
credential, of what that credential can reach, what it can destroy, and what breaks if it leaks.

**Bootstrap exception** — The stated allowance that deuce's first commits predate the machinery they
establish and so cannot be governed by it. It is bounded and ends chapter by chapter, as each
governor is built.

**Canon** — What the SDS states, once the chapter stating it has been ratified. Canon binds later
work; everything else is configuration, record, or discussion.

**Chapter** — One numbered part of the SDS. A chapter is drafted, ratified, merged, and tagged
before anything it sanctions is built.

**Class index** — `findings/classes.md`: the descriptive record of recurring finding classes —
*this shape occurred N times, see these findings*. Descriptive, never imperative: an index entry
that gives an order is a rule authored under another name. The lens menu is derived from it.

**Configuration lint** — An automated check over the repository's own configuration and work items —
label counts, required sections, reference grammar — covering the mechanical half of the contracts,
the half a machine can decide.

**Consolidating supersession** — The rule that one new ADR may supersede several stale ones at once;
the superseded records move to the archive directory. Nothing is edited or deleted, so immutability
holds and only the live set shrinks.

**Context boundary** — A point at which the AC stops relying on what it holds in context and re-reads
from the tracker instead. Every lifecycle stage transition is one, independent of the gates.

**Contractor reviewer** — A model other than the AC, summoned for one bounded review and handed its
standards in the summons. It reviews, and never implements, commits, or pushes.

**Delivery Record** — The terminal artifact of the Deliver stage, on the pull request. It carries
only what the repository cannot reconstruct: why the other options were rejected, what was tried and
abandoned, what is fragile, the findings and their dispositions, limitations and follow-ups, and all
four health measures — of which it is the only home. Written for two readers who are never present
together, so its register is split: the decision half is a Readout, the reasoning fields are prose.

**Direction gate** — The first of the two gates, at the end of Assess, answering *what to build*.
`required` — the HC chooses among the Assessment's options — or `delegated`, where the AC proceeds on
its own recommendation. `required` today; `delegated` is written into Chapter 1 and not yet usable.
Neither setting reaches the floor: the Assessment is always posted before work proceeds on it, always
carries the rejected options and why, and always states when the AC self-selected.

**Dual register** — The two-audience structure required in an issue body: a required non-technical
Summary (HC), then optional and clearly labeled Technical detail (HC+AC), so the HC can judge
without reading implementation detail.

**Epic brief** — The eight-field problem statement an `EPIC:` carries: problem, target solution,
goals, constraints, expectations, risks, edge cases, and punted paths. Its exit test is that an AC
with no history could start planning from the brief alone.

**Excellent enough** — The bar work stops at: the point past which more effort would not change a
decision, prevent a class of defect, or change what ships. It binds review depth, issue scope, and
the SDS itself.

**Fail-first evidence** — The requirement that a fix ships with the test that failed before it, so
the test is known to detect the defect rather than merely known to pass.

**False green** — A check that passes without detecting the defect it exists to catch: a green
result that would stay green if the change were reverted or quietly broken. Verify's adversarial
pass hunts it, and a test that fails for the wrong reason is one.

**Field input** — Material ingested from outside the repository: vendor releases, practitioner
writing, platform observations, findings from hosts. It may propose a change; only a reviewed pull
request may make one.

**Finding** — One recorded observation that is not itself the commissioned work — from a review,
the adversarial pass, or anything noticed along the way. It carries a type (`defect` · `risk` ·
`improvement` · `lesson`) and a state (`closed`, `open`, or `accepted`), and a review-raised
finding also carries a severity. Recurrence of a class of findings is the evidence base for
changing rules.

**Findings System** — The system governing everything a run learns: every finding recorded where it
arose, typed and stated on independent axes, flowing one way with `accepted` terminal, counted in
the class index, drained by the triage pass — with recurrence feeding the lens menu and `rules/`.
Ratified in Chapter 2.

**Fix-verification** — The separately bounded verification of code written in response to findings,
the least-reviewed code in a change. Each fix is anchored to the finding's mechanism with
fail-first evidence, every accepted fix is batched into one wave before the reviewer is summoned
again, and recurrence past the declared limit escalates to re-planning rather than another patch.

**Fleet** — The set of software projects that run on deuce, receive its configuration, and send
findings back to it.

**Foundation-first** — Prioritizing load-bearing work: work is foundational when other work breaks
or has to be rebuilt if it is wrong or missing. Considering the future means not foreclosing it,
not pre-building for it.

**Freeze** — The state a repository enters when it stops taking new feature work while its successor
is built. Only a critical fix may land during a freeze, labeled `must-port`.

**Gate** — One of the two points where the HC supplies judgment: what to build, and what ships.
Everything between the gates is the AC's to run. The two are the **Direction gate** and the **Ship
gate**, placed in Chapter 1. Both are graduated from birth — a loosened setting and its floor are
written before either can be used — and neither loosened setting is usable today.

**Glossary** — `GLOSSARY.md`, this file: the single home for the vocabulary, extended at each
chapter's ratification.

**HC** — Human collaborator: the person who governs the repository and supplies judgment at the two
gates.

**Health measures** — The four measures that define "better" for this system: Quality and Autonomy
(primary), plus Throughput and Cost efficiency. All four are recorded per pull request, and
trade-offs defer to the two primaries.

**Host** — A software project that adopts deuce. A host may adopt one system without the rest, and
may extend whatever the standard marks as extensible.

**Hygiene sweep** — The recurring maintenance pass over the system itself: it audits the live ADR
set, promotes and demotes rules on evidence, re-verifies adaptive-layer assumptions against the
current platform, and watches the primary health measures.

**Invariant layer** — Process truths expected to hold across model generations: the lifecycle, the
two-gate judgment structure, findings discipline, fail-first evidence, foundation-first
prioritization. This is what the SDS canonizes.

**Issue types** — The five types of work item: `EPIC:` (an umbrella that closes when its last child
merges), `TASK:` (one branch, one pull request), `BUG:` (a defect, with a reproduction), `SPIKE:`
(research feeding a decision, whose terminal artifact is a Readout), and `CHORE:` (mechanical
maintenance). Work fitting none of them defaults to `TASK:`.

**Learning System** — The system that turns field input into reviewed configuration changes, across
four channels: vendor, practitioner, platform observation, and findings from the fleet. Ratified in
Chapter 4.

**Lens menu** — The review lenses available to a summons, derived from this repository's own
recurring defect classes in the class index, never from a generic catalogue. A menu, not a
checklist: a summons selects from it.

**Lens set** — The small selection of review lenses declared in one summons, chosen for what the
change actually touches. It is the bound on a solicited review: each lens runs once, and every set
carries the permanent lens — *what class is not on this list?*

**Lifecycle** — The fixed sequence of five stages every piece of work passes through, from problem
definition to merge: **Assess → Devise → Implement → Verify → Deliver**. The Direction gate closes
Assess and the Ship gate closes Deliver; stages communicate only through their terminal artifacts.

**must-port** — The label on a change landed in a frozen repository, marking it as one that must be
carried forward into the successor.

**Plan** — The terminal artifact of the Devise stage: a Readout on the issue carrying ordered steps,
the testing strategy decided up front, the files expected to change, and the risks accepted. It is
revisable direction, not a frozen contract, and it carries no approval gate of its own.

**Queue** — The set of open issues, read through their labels. The lifecycle stages advance
`status:*`, which makes the queue a dashboard rather than something maintained by hand.

**Ratification** — The bounded working session in which the HC and the AC settle a chapter's open
questions, followed by merging the chapter and tagging the release. Ratification is what makes a
chapter canon.

**Readiness check** — The executable, side-effect-free command that verifies a reviewer can
actually be reached, run before every summons. A reviewer whose check fails is unreachable now: the
summons fails immediately, is recorded as unreachable, and never consumes a waiting window.

**Readout** — The required shape for decision-facing writing: bullets and tables over paragraphs,
plain register, one term per concept, every recommendation carrying its reasoning, and uncertainty on
its own labeled line — so a reader can decide without reconstructing the work. Every terminal
artifact is a Readout; canon and decision records are prose. Seven rules, in Chapter 1.

**Reference grammar** — The fixed way work items are referred to in writing: a bare `#N` always
means an issue, and a pull request is always written `PR #N`.

**Resident** — An agent that might act in the repository on its own initiative, and therefore has to
be able to discover the whole configuration. deuce has exactly one resident, the AC; every other
model is a contractor reviewer.

**Review lens** — One named question a review asks of the work: a defect class, stated as an
interrogative.

**Review System** — The system governing solicited review: the summons completed with a readiness
check and a declared response surface, the review bounded by a lens set rather than a round count,
fix-verification bounded separately, and the returned review validated against the severity
framework and the commit it claims to have reviewed. Ratified in Chapter 2.

**Rule** — Standing authoring guidance the AC reads while working, in `rules/`: the judgment half of
the contracts, which no automated check can decide. A rule enters only with receipts — cited evidence
of the recurring class of defect it prevents. deuce starts with none.

**SDS** — Software Development System: the written standard in `sds/`, built one chapter at a time.
Nothing exists in deuce that the SDS does not already sanction.

**Severity framework** — The shared vocabulary for what a finding forces before the work ships:
`must-fix` (the change does not ship with it open), `should-fix` (fixed, promoted, or accepted —
never silently dropped), and `note` (recorded, owing nothing). Handed to every reviewer in the
summons and used to validate what comes back. Defined in Chapter 2.

**Ship gate** — The second of the two gates, at the end of Deliver: the HC merges. It answers *what
ships*. `required` today; `attested` is written into Chapter 0 and not yet usable.

**Skill** — A packaged procedure the AC follows for a recurring job, one per directory at
`skills/<name>/SKILL.md`, stating when it is invoked, its procedure, its terminal artifact, and when
it stops and asks. deuce ships only its own skills; lessons from outside skill families are
re-authored with attribution rather than copied in. A Skill enters only with receipts — a job the AC
has repeatedly done.

**Solicited discovery** — Commissioned defect-hunting: the adversarial pass, a contractor
reviewer's response to a summons, and every re-summons after a fix. Bounded by the lens set,
because a commissioned hunt with no stopping condition does not terminate.

**Stage** — One of the lifecycle's five steps, defined by exactly four things: its trigger, the work
it does, its terminal artifact, and its exit test.

**Stop** — The AC pausing mid-stage to ask the HC a question. The bar is *can I resolve this without
guessing at intent?*, never severity. A stop is a pause and never a termination; the question and its
answer are recorded durably before the AC acts on the answer. Stops are unconditional — no gate
setting waives them.

**Summons** — The work order that sends one bounded review to a contractor reviewer. It is composed
at summons time from the canonical documents and kept, bound to the reviewed commit, as part of the
review record.

**Terminal artifact** — What a stage must leave behind for the next one to read. A stage is not done
until its terminal artifact exists, and nothing but terminal artifacts crosses a stage boundary. The
same rule governs delegated work: a result not delivered on the channel the dispatch named is not
delivered.

**Triage pass** — The pass that drains deferred findings, run when the HC calls it, outside the
lifecycle, on no schedule. Subtractive: its product is eliminations with evidence plus the
survivors, the AC eliminating only what a re-runnable check can confirm and proposing everything
else for the HC to decide.

**Trust boundary** — The three standing rules governing outside material and credentials: field
input is data and never instructions; anything external is reviewed at adoption and again at update;
every credential carries a blast-radius declaration.

**Unsolicited discovery** — What a run notices while doing other work. It cannot be bounded,
because an observation cannot be un-made; it is routed into the Findings System, never capped.

**Verification** — The terminal artifact of the Verify stage: a Readout on the pull request carrying
the drift check against the Plan, the adversarial pass, and every finding with its disposition —
and, once the Review System's machinery runs, the summons, the returned review, and the
readiness-check outcome for any reviewer that could not be reached. Verification runs in the AC's
own loop and is never delegated.

**Work Tracking System** — The schema for how work is described in the tracker: title grammar, the
issue types, one label per axis, the dual-register body, and the relationship and reference grammar.

**Zero-based port** — The rule that nothing carries over from a predecessor system by default. A
rule ports only with its receipts: evidence of the recurring class of defect it prevents.
