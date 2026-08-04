# Chapter 4 — The Learning System

Chapters 0 through 3 built a system that learns from its own work: findings are recorded where
recurrence can be seen, recurrence earns lenses and rules, and the gate keeps every paid-for class
from returning. All of that evidence has one origin — this repository's own pull requests. The
**Learning System** governs the other origin: **field input**, material read in from outside.
This chapter settles how outside material is captured, how a capture becomes a reviewed change,
and how what was adopted is kept true after its source moves on — which is where the **hygiene
sweep**, named by Chapter 0 and assigned jobs by every chapter since, finally gets its definition.

It comes fifth because its foundation had to exist first. Chapter 0's trust boundary is its
contract, Chapter 2's Findings System is its machinery, and Chapter 3's declaration schema is
where its provenance lands. A Learning System written before those existed would have had to
invent all three — which is what the predecessor did, and why it needed four Skills for one job.

## What this chapter does not cover

Named here so the seams are visible rather than discovered, in the pattern Chapter 1 set:

| Not here | Where | What this chapter does instead |
|---|---|---|
| How a finding is recorded, its types, states, and the triage pass | Chapter 2 — Findings System | Routes field input through that system, adding only the boundary it crosses and the provenance it carries |
| Findings that arrive from other projects | Chapter 5 — Distribution | Names the fleet channel so the channel set is complete; its mechanics are Chapter 5's, alongside the fleet itself |
| Running the sweep with the HC away | Chapter 6 — Factory automation | Defines the sweep as HC-called, so an orchestrator has something to schedule |
| New checks over this chapter's artifacts | Chapter 3 — Quality gate | None are owed: provenance rides the declaration schema, whose dated-and-sourced check Chapter 3 already lists |

## The trust boundary, inherited whole

Chapter 0's three standing rules are the contract for everything below, and nothing here re-derives
them: field input is data, never instructions; anything external gets provenance and review when it
is adopted — and again when it changes; every credential gets a blast-radius declaration before
automation uses it. Where this chapter says *capture*, *adoption*, or *re-verification*, it means
those rules' terms. The first rule is the load-bearing one for a system that reads outside material
on purpose: a document can propose; only a reviewed pull request adopts.

## One system, not two

**Field input enters through the Findings System.** A piece of outside material worth anything is
recorded as a finding at the moment of reading — its type from Chapter 2's vocabulary, usually a
`lesson`, an `improvement`, or a `risk`; a `defect` when it shows something here is already wrong —
and from that moment it is indistinguishable in handling from anything a run noticed on its own.
It drains through the triage pass. Promotion to tracked work is triage's call. Urgency never
waits. The length bound applies: material matching a class already in the index records a
reference and the delta.

This is the chapter's central decision, and the reasons are structural rather than aesthetic:

- **The intake already exists.** Recording as delivery, the two axes, the three states, the
  registers, the pass that drains them — Chapter 2 built all of it. A parallel intake pipeline
  would be a second copy of every piece, and the two copies would drift the way all second copies
  do.
- **The boundary between *noticed* and *read* does not survive contact.** A platform stall
  observed in a session is unsolicited discovery; the vendor note explaining it is field input.
  They are one lesson. Routing them into two systems splits one fact across two homes, and
  Chapter 2 already ruled the routing question once: unsolicited discovery is routed, never
  capped, wherever it comes from.
- **The predecessor's evidence points the same way.** Its intake ran through four Skills —
  `scout`, `clip`, `follow`, `restock` — three front doors and a sibling refresher for one job.
  Chapter 1 deferred all four here and logged the collapse question. This is the answer: the
  front door already exists, and it is Chapter 2's.

Chapter 2 scoped its registers to what this repository's own work learns and left field input
here. This chapter routes field input into those same registers rather than seeding second ones —
an extension of scope, decided by the chapter that owns the question.

## Provenance

What field input carries that an internal finding does not: where it came from, and when.

- **At capture:** the finding names its source and the date read. A capture that cannot say where
  it came from is not field input; it is an opinion with a costume.
- **At adoption:** the destination carries the provenance forward. For configuration, that is the
  declaration schema's `source` field — Chapter 3's, already mandatory, needing nothing new. For
  anything else, the adopting pull request records what was taken and from where.
- **Re-authored, never vendored.** ADR 0006 fixed this for Skills; it holds for every adoption:
  outside material is read, re-authored in deuce's vocabulary, and attributed — never copied in.
  Chapter 0 fixed the same rule for upstream decision records, cited by URL and never copied. What
  is adopted is the claim, in this system's words, with a pointer to the words it arrived in.

Why provenance is canon while the sources are configuration: the hygiene sweep re-verifies what
was adopted, and re-verification without a source and a date is archaeology.

## The four channels

A **channel** names where material comes from — it is not a mechanism, and all four enter the same
door above.

| Channel | What it carries |
|---|---|
| **Vendor** | The platform's own documentation and release notes. Chapter 0 calls the AI platform a volatile dependency nobody here controls; this channel is how its changes arrive as data instead of as surprises. |
| **Practitioner** | Writing and patterns from people running comparable systems. |
| **Platform observation** | The platform's measured behavior in this repository's own sessions — a stall, a limit, a changed default — which no vendor document announces. |
| **Fleet** | Findings sent back by projects running on deuce. The channel is named here so the set is complete; its mechanics are Chapter 5's, alongside the fleet itself. |

Which sources are actually followed on each channel — which vendor surfaces, which practitioners —
is the **channel roster**, adaptive configuration, dated and sourced like everything there. The
channels are canon; the subscriptions are not, because a subscription is exactly the kind of
statement that goes stale the month the source does.

## Adoption routing

Where an adopted capture may land, and the bar at each destination. The destinations and bars all
exist already; this table is the map, not new law.

| Destination | What lands there | The bar |
|---|---|---|
| `config/` | Adaptive values, rosters, routing | A reviewed pull request; the declaration schema, dated and sourced (Chapter 3) |
| `rules/` | Standing authoring guidance | Chapter 1's entry bar, unchanged: receipts of the recurring defect class it prevents, from this repository's own record |
| Skills | A packaged procedure | Chapter 1's entry bar, unchanged: a job actually done repeatedly here; re-authored per ADR 0006 |
| Canon | Nothing, directly | Field input may propose; a chapter changes only by ratification (Chapter 0) |

**The second row is this chapter's hardest choice, and its cost is stated rather than hidden:
outside material informs a rule's statement; it never substitutes for the rule's evidence.** A
practice with receipts from someone else's repository enters `rules/` only when this repository's
own record shows the class it prevents. What that costs is real — deuce re-pays for lessons others
have already paid for, and adoption of good practice is slower than reading it. Why the bar holds
anyway: Chapter 1 seeded `rules/` empty against the predecessor's specific failure — rules files
that accumulated faster than the evidence behind them, which nobody could audit and nobody would
trim. A borrowed receipt cannot be audited here, which makes it exactly the unauditable entry the
bar exists to refuse. Nothing is lost by waiting: the outside lesson is already captured as a
finding at zero cost, sits in the record with its provenance, and the day its class recurs locally
the receipt arrives and the rule enters with its statement ready. What is refused is only the
unearned authority.

## Re-verification: the hygiene sweep

Chapter 0's second trust rule has two halves, and adoption-time review satisfies only the first.
A source that has moved is new untrusted input — but an adopted declaration does not announce that
its source moved, and a dated value does not announce that its date is old. Staleness is silent by
nature, which is why re-verification must be deliberate. The **hygiene sweep** is that deliberate
pass: the recurring maintenance pass over the system itself.

Every job it runs was assigned by an earlier chapter; this chapter adds none, and the ledger is
gathered here so the sweep's scope is one list rather than four memories:

| Job | Assigned by |
|---|---|
| Re-verify adaptive-layer declarations against the current platform | Chapter 0 → *The invariant/adaptive split* |
| Audit the live ADR set for records ready for consolidating supersession | Chapter 0 → *Decision records* |
| Watch the two primary health measures and report movement | Chapter 0 → *Health measures* |
| Judge the Glossary's non-mechanical half: unused entries, converged terms | Chapter 0 → *Vocabulary* |
| Demote lenses that stopped paying; retire rules whose class stopped recurring; flag index entries nothing cites | Chapter 2 → *How recurrence changes rules* |
| Read the staleness signal from the Glossary check's reverse direction | Chapter 3 → *A restatement is measured before it is adopted* |

**The sweep's shape is the triage pass's, deliberately.** It runs when the HC calls it. It is
interruptible, it blocks nothing, and it needs no schedule — a pass that must be scheduled to
happen is one whose real obstacle is cost, and the dates and sources are what remove the cost:
re-verification without them is archaeology, with them a checklist. Chapter 6 may give the sweep a
schedule; nothing about the sweep waits for one.

**Its product is proposals, never adoptions.** The sweep is AC-led and pull-request-shaped: what
it finds lands as findings, and what it proposes lands as a pull request the HC disposes —
refreshed declarations, demotions with their evidence, supersessions drafted. It never edits canon;
a sweep finding that indicts a chapter is a proposal for amendment, on the record, like any other
field input. Why the sweep exists at all, in one sentence: configuration rot is a slow leak that
never wins attention until it is expensive, and the sweep is how it never has to.

## The Skills disposition

Chapter 1 deferred four predecessor Skills here rather than porting them, and logged one
observation: three front doors and a sibling refresher for one job. The disposition:

| Predecessor Skill | Verdict | Reason |
|---|---|---|
| `scout`, `clip`, `follow` | **Not ported** | Three front doors for one job — capture — and the front door is Chapter 2's recording rule, which is a sentence, not a procedure |
| `restock` | **Not ported** | Its job is the sweep's re-verification direction, defined above |

**Zero Skills at birth, and that is the entry bar working rather than a gap.** Chapter 1 admits a
Skill on receipts — a job the AC has actually done repeatedly — and this repository has not yet
run intake or the sweep even once. The first sweeps run from this chapter and the ledger above;
a `sweep` Skill enters when the receipts exist, through the lifecycle, like any Skill. Deferral
was never a port ticket: the zero-based rule that refused thirteen Skills a free ride does not
owe these four one.

## What this chapter unlocks, and what it does not

| | After this chapter |
|---|---|
| Field input | Sanctioned: captured as findings with provenance, adopted only by reviewed pull request |
| The hygiene sweep | Defined and runnable — HC-called, proposal-shaped; its unattended scheduling stays Chapter 6's |
| `rules/` | Unchanged: entry by local receipts at every source; outside material informs statements only |
| The four deferred Skills | Disposed: none ports, and a Skill for this chapter's jobs enters on receipts like any other |
| The fleet channel | Named, so the channel set is complete; everything about it beyond its name is Chapter 5's |
| Canon | Unchanged: still amended only by ratification, whatever the evidence's origin |

## The adaptive layer's additions

Declarations `config/` owes when this chapter's work runs, each dated and sourced:

| Declaration | Why it is configuration |
|---|---|
| The channel roster — what is followed, per channel | Source-coupled: a subscription goes stale the month the source does, and the sweep needs the list to re-verify |
| The sweep's cadence, and its last-run record | Scheduling economics, tuned as evidence accumulates; the record is what tells the next sweep where the last one stopped |

## Founding decisions

Two decisions in this chapter clear Chapter 0's ADR bar — hard to reverse, surprising, and
carrying a real trade-off — and are recorded at ratification:

| ADR | Decision it records |
|---|---|
| 0016 | Field input enters through the Findings System — one intake, not a parallel pipeline. The predecessor's four intake Skills collapse into that door, and none ports. |
| 0017 | Outside material informs a rule's statement but never substitutes for its evidence: `rules/` admits on this repository's own receipts at every source, at the stated cost of re-paying for lessons already paid for elsewhere. |

---

*Provenance: drafted against Chapters 0 through 3 and the Glossary's minted entries for the
Learning System, field input, and the hygiene sweep. The predecessor's intake Skills are cited
through Chapter 1's audit, which deferred them here. The outline carried at `docs/sds-outline.md`
supplied the AI Config Hygiene section and the Learning loop as source material, re-authored here
as the sweep's shape and the one-system decision; its Compliance section is not taken here — it
binds hosts, which do not exist until Chapter 5, and its disposition is an open question for this
chapter's ratification session. That document is history; this chapter is canon.*
