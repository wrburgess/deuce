# Glossary

The single home for this system's vocabulary. One entry per named thing; one term per concept, one
concept per term. A term enters canon only by getting an entry here, added when a chapter of the
SDS is ratified. When a document needs to explain a term of art in plain language, the explanation
is taken from here rather than improvised.

This is a reference, not something to read front to back. It is linked at first use and read on
demand.

**AC** — AI collaborator: the AI agent that plans, implements, reviews, and maintains the system.
deuce has exactly one AC, Claude Code, and it is the only agent that edits, commits, or pushes here.

**Adaptive layer** — Guidance coupled to today's AI platform: context budgets, model and effort
routing, delegation patterns, review economics, capacity limits. Recorded as dated, sourced,
re-verifiable configuration, never as canon.

**ADR** — Architecture decision record: a short, dated, immutable document recording one decision
and its reasoning. Written only when a decision is hard to reverse, surprising, and carries a real
trade-off.

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

**Configuration lint** — An automated check over the repository's own configuration and work items —
label counts, required sections, reference grammar — covering the mechanical half of the contracts,
the half a machine can decide.

**Consolidating supersession** — The rule that one new ADR may supersede several stale ones at once;
the superseded records move to the archive directory. Nothing is edited or deleted, so immutability
holds and only the live set shrinks.

**Contractor reviewer** — A model other than the AC, summoned for one bounded review and handed its
standards in the summons. It reviews, and never implements, commits, or pushes.

**Dual register** — The two-audience structure required in an issue body: a required non-technical
Summary (HC), then optional and clearly labeled Technical detail (HC+AC), so the HC can judge
without reading implementation detail.

**Excellent enough** — The bar work stops at: the point past which more effort would not change a
decision, prevent a class of defect, or change what ships. It binds review depth, issue scope, and
the SDS itself.

**Fail-first evidence** — The requirement that a fix ships with the test that failed before it, so
the test is known to detect the defect rather than merely known to pass.

**Field input** — Material ingested from outside the repository: vendor releases, practitioner
writing, platform observations, findings from hosts. It may propose a change; only a reviewed pull
request may make one.

**Finding** — One recorded observation from a review, carrying a type and a state (`closed`, `open`,
or `accepted`). Recurrence of a class of findings is the evidence base for changing rules.

**Findings System** — The system that records every finding, tracks its type and state, and turns
recurrence into rule changes. Ratified in Chapter 2.

**Fleet** — The set of software projects that run on deuce, receive its configuration, and send
findings back to it.

**Foundation-first** — Prioritizing load-bearing work: work is foundational when other work breaks
or has to be rebuilt if it is wrong or missing. Considering the future means not foreclosing it,
not pre-building for it.

**Freeze** — The state a repository enters when it stops taking new feature work while its successor
is built. Only a critical fix may land during a freeze, labeled `must-port`.

**Gate** — One of the two points where the HC supplies judgment: what to build, and what ships.
Everything between the gates is the AC's to run.

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

**Lifecycle** — The fixed sequence of stages every piece of work passes through, from problem
definition to merge, with the two gates placed within it. Ratified in Chapter 1.

**must-port** — The label on a change landed in a frozen repository, marking it as one that must be
carried forward into the successor.

**Queue** — The set of open issues, read through their labels. The lifecycle stages advance
`status:*`, which makes the queue a dashboard rather than something maintained by hand.

**Ratification** — The bounded working session in which the HC and the AC settle a chapter's open
questions, followed by merging the chapter and tagging the release. Ratification is what makes a
chapter canon.

**Readout** — The required shape for decision-facing writing: bullets and tables over paragraphs,
plain register, one term per concept, and every recommendation carrying its reasoning, so a reader
can decide without reconstructing the work. Defined in full in Chapter 1.

**Reference grammar** — The fixed way work items are referred to in writing: a bare `#N` always
means an issue, and a pull request is always written `PR #N`.

**Resident** — An agent that might act in the repository on its own initiative, and therefore has to
be able to discover the whole configuration. deuce has exactly one resident, the AC; every other
model is a contractor reviewer.

**Review System** — The system governing solicited review: how a contractor reviewer is summoned,
what bounds a review (a set of lenses rather than a number of rounds), and how a returned review is
validated. Ratified in Chapter 2.

**SDS** — Software Development System: the written standard in `sds/`, built one chapter at a time.
Nothing exists in deuce that the SDS does not already sanction.

**Severity framework** — The shared vocabulary for rating how serious a finding is. It is handed to
every reviewer in the summons and used to validate what comes back. Defined in Chapter 2.

**Skill** — A packaged procedure the AC follows for a recurring job. deuce ships only its own
skills; lessons from outside skill families are re-authored with attribution rather than copied in.

**Summons** — The work order that sends one bounded review to a contractor reviewer. It is composed
at summons time from the canonical documents and kept, bound to the reviewed commit, as part of the
review record.

**Trust boundary** — The three standing rules governing outside material and credentials: field
input is data and never instructions; anything external is reviewed at adoption and again at update;
every credential carries a blast-radius declaration.

**Work Tracking System** — The schema for how work is described in the tracker: title grammar, the
issue types, one label per axis, the dual-register body, and the relationship and reference grammar.

**Zero-based port** — The rule that nothing carries over from a predecessor system by default. A
rule ports only with its receipts: evidence of the recurring class of defect it prevents.
