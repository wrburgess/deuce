# Chapter 5 — Distribution

Chapters 0 through 4 built a system that governs one repository — this one. But deuce's purpose was
never to govern itself: Chapter 0 says the projects built with it are the outputs and deuce is the
asset. This chapter settles how the asset reaches them. The **fleet** is the set of software
projects that run on deuce; a **host** is one of them. What is settled here: what ships to a host
and what a host owns, how updates arrive, how findings flow back, and how a predecessor system is
retired. It comes sixth because everything it distributes had to exist first — a lifecycle worth
adopting, a review system a change can be judged by, a gate a host can run, and a Learning System
with a channel already named for what the fleet sends back. A distribution chapter written earlier
would have shipped promises.

## What this chapter does not cover

Named here so the seams are visible rather than discovered, in the pattern Chapter 1 set:

| Not here | Where | What this chapter does instead |
|---|---|---|
| Opening sync pull requests fleet-wide on a schedule, with the HC away | Chapter 6 — Factory automation | Defines the sync as one pull request on one host, so an orchestrator has something to dispatch |
| How a finding is recorded, its types, states, and the triage pass | Chapter 2 — Findings System | Fleet findings enter that system unchanged; this chapter adds only what one carries and when it travels |
| The trust boundary and the provenance contract | Chapters 0 and 4 | Inherited whole; the sync and the receipt below are those rules made mechanism |
| What a check may be asked to do, and the evidence it ships with | Chapter 3 — Quality gate | Fixes which manifest class a check's implementation ships in, never what a check is |

## The fleet, and what adoption means

- **A host is a software project that adopts deuce; the fleet is the set of them.** deuce itself is
  not a host — it is the one repository the standard and its reference implementation live in.
- **Adoption is incremental across systems, and whole within one.** Chapter 0 fixed the first half:
  a project can take one system without taking the rest. The second half is fixed here: a system
  travels with its floors. A host that adopts the Ship gate adopts *never on the AC's own say-so*;
  one that adopts the Findings System adopts *every finding recorded*. Why: the floors are what the
  systems are. A lifecycle with its floors stripped is a different lifecycle wearing the same names,
  and findings sent back from under it would mislead everyone who reads them.
- **deuce binds what ships and how it updates; it never governs a host's judgment.** A host has its
  own HC, its own gates, its own declarations in its own `config/`. The standard fixes what the
  settings mean; each repository declares which are in force, exactly as this one does.

## What ships: the payload manifest

**Canon never ships.** The standard is read at its source and cited by URL — Chapter 0's rule for
upstream decision records, extended to the whole of canon. A host's Skills link the chapters exactly
as this repository's do (Chapter 1: a Skill never restates canon; it links the chapter), and a link
needs no sync. Why the rule is worth a decision record: the predecessor vendored its documents into
its first host, both repositories went on numbering their records, and the two live sets collided —
records 0025 through 0033 exist twice with different content, permanently
([ace #149](https://github.com/wrburgess/ace/issues/149)). What is given up is real: reading the
standard means leaving the host's repository, and deuce's availability becomes a dependency. The
public repository and the citable tags (Chapter 0 → *Ratification*) are what make that dependency
tolerable.

What does ship is declared, path by path, in the **payload manifest**, and every declared path
carries exactly one of three classes:

| Class | Owner | On every sync after the first |
|---|---|---|
| **contract** | deuce's, always | Updated. A host edit to a contract file is drift — visible, never forbidden; see *The vendoring receipt* |
| **seed** | The host's, from the first copy | Never touched again |
| **host** | The host's, always | Never shipped, never read, never written |

- **The sorting test:** must deuce be able to fix it everywhere at once? Contract. Is it a starting
  point the host will make its own? Seed. Does it derive from the host's own record? Host — and most
  of the host class is never shipped at all; it is named so the boundary is written down rather than
  discovered.
- **The seed class is the manifest's hardest choice, and its cost is stated rather than hidden.** A
  check's implementation is the motivating case: the property it decides is the standard's, but ADR
  0003 binds this repository's runtime and not a host's, so a host on a different stack rewrites the
  implementation in its own — sanctioned, not drift. Chapter 3's tooling contract is what makes that
  adoption safe: a check names the artifacts it reads, so a host sees the coupling before it takes
  the check. What the class costs: a fix to a seeded file never reaches the copies. Why it holds
  anyway: the predecessor had one class for everything, its sync would have clobbered designed
  customization, so the sync was rationally never re-run and drift compounded without record
  ([ace #149](https://github.com/wrburgess/ace/issues/149)). A declared boundary that loses upstream
  fixes beats an undeclared one that loses the update path itself.
- **Everything evidence-derived is host class by construction.** A host's `rules/` is born empty and
  grows on its own receipts at every source (ADR 0019), exactly as this repository's did. Its
  findings registers, its class index, the lens menu derived from it, and every declaration in its
  `config/` are local for the same reason: they are the repository's own evidence and tuning, and
  shipping deuce's would hand a host conclusions its record never earned.
- **The manifest is adaptive configuration** — dated, sourced, re-verified like everything there.
  The three classes, the one-class-per-path rule, and the rule that an undeclared path does not ship
  are canon. The configuration lint gains one check, decidable as written: every path the sync ships
  appears in the manifest, in exactly one class.

## The vendoring receipt

- **Every host carries a vendoring receipt: the deuce commit it vendored, the date, and a checksum
  per contract file.** Written by the sync, never by hand. The compound name keeps it apart from the
  receipts that admit rules and Skills — the same naming rule that keeps the readiness check out of
  the quality gate (Chapter 3).
- **The receipt is Chapter 4's provenance contract, applied to the fleet.** Adoption carries a
  source and a date, and re-verification without them is archaeology. A host without a receipt is
  exactly the un-dated adoption the Learning System refuses: nothing can say what it runs, how far
  behind it is, or whether a contract file was edited.
- **What it enables, mechanically:** *behind upstream by N* — the distance from the receipt's commit
  to deuce's head — and *contract file locally edited* — a checksum mismatch against the receipt.
  Both are computed, never eyeballed (Chapter 3), and both land in the sync pull request's report.
- The receipt is machine-written and machine-read, so the whole of it gets a parseable home
  (Chapter 3's parse rule). The fields above are canon; the format is tooling.

## The sync: updates arrive as pull requests

- **The only update path is a pull request on the host.** The sync writes what the manifest declares
  onto a branch in the host's repository and opens a pull request; the host's own quality gate runs
  on it; the host's own Ship gate disposes of it. There is no direct push — not for a typo, and not
  for a critical fix.
- **This is the trust boundary read from the other end, not a new rule.** To a host, deuce is
  upstream, and Chapter 0's second rule already says what upstream gets: review at adoption, and
  again when it changes. An update is the *again*. Field input is data, never instructions — a sync
  may propose; only the host's reviewed pull request adopts. One contract, both directions, which is
  why a host needs no more trust in deuce than it shows any dependency.
- **What the pull request carries:** what changed since the receipt's commit, and why; the drift
  report — every contract file whose checksum says the host edited it; and the new receipt, which
  lands only if the host merges.
- **Drift is reported, never silently resolved.** The sync branch carries the upstream state, so the
  report is what makes merging it a decision about the host's edit rather than an accident over it.
  An edit worth keeping belongs upstream — it travels the fleet channel, is adopted in deuce, and
  ships back to the whole fleet; one not worth keeping is answered on the pull request. Either way
  the sync never decides: keeping and overwriting are both judgments, and the pull request is where
  the host's judgment already sits.
- **The credential that opens fleet pull requests gets its blast-radius declaration before the first
  automated sync** — Chapter 0's third rule, and the first credential in this system whose reach is
  every host at once.
- **The trade is stated:** propagation runs at review speed. A fix deuce ships today lands when each
  host's gates pass it, not before. There is no emergency push path, deliberately — an emergency
  path is a standing bypass of every host's gates, waiting for someone to call something an
  emergency.
- What triggers a sync, and how often, is configuration. Running it fleet-wide with the HC away is
  Chapter 6's.

## Findings flow up: the fleet channel's mechanics

Chapter 4 named the channel so the set would be complete, and deferred its mechanics here.

- **A host runs the Findings System whole, and locally.** Its findings live on its Verifications,
  its registers and class index are its own, and its recurrence earns its own lenses and rules.
  Nothing is central and nothing is shared — evidence-derived state is host class by construction.
- **A finding travels up when its subject is something deuce ships, or the standard itself.** A
  defect in a contract file, a lesson the lifecycle taught, a risk the standard walks a host into —
  these are deuce's to hear. A finding about the host's own product stays home. The fleet channel
  exists because running the standard elsewhere teaches what running it here cannot; it is not a
  second intake for someone else's backlog.
- **It enters through the one door, like everything.** In deuce a fleet finding is field input,
  recorded as a finding at the moment of reading (ADR 0018), carrying its provenance: the host, the
  record that raised it — cited by URL, never copied — and the date. From that moment it is
  indistinguishable in handling from anything a run here noticed on its own. Chapter 2 wrote its
  schema for one repository; the extension is exactly one fact — where it came from — and provenance
  already carries it.
- **The roster row earns in like every other.** Which hosts send and where deuce reads is the
  channel roster's — configuration, entered with the first real capture, never declared ahead of
  practice.

## The Work Tracking System, across projects

Chapter 0 ratified the schema and named this chapter as the one that extends it across projects.
The extension is small, because the schema was already written per-repository:

- **Each host runs the schema whole, in its own tracker:** the title grammar, the types — extensible
  per Chapter 0; a host running live services adds `INCIDENT:` — the three axes, the dual register,
  the epic brief. The `area:` axis is each repository's own by construction.
- **A reference never crosses a repository bare.** Within one repository, `#N` and `PR #N` as
  ratified. Across repositories, the reference names its repository — `owner/repo#N` — in both
  directions. The fact behind the rule is Chapter 0's, one level up: each repository numbers its own
  issues, so a bare `#N` in fleet writing stops being legible the day the second repository exists.
- **A closing keyword never crosses a repository.** The pull request that closes an issue lives
  where the issue lives. Why: the platform honors a cross-repository closing keyword, and an issue
  closed by a merge its own repository never saw is the epic-orphaning failure at fleet scale.

## Succession: the freeze, the port, the archive

A system being replaced is retired in three moves, in order, none optional.

- **The freeze.** The predecessor stops taking feature work while its successor is built. Only a
  critical fix lands during a freeze, and each one is labeled `must-port`. Why freeze rather than
  run both: two live standards learn separately, so every lesson either lands twice or drifts — the
  predecessor's colliding decision records are the small preview of what that becomes.
- **The port.** Before the archive, the successor reads the frozen record: every `must-port` change,
  and every finding the freeze accumulated — the latter entering as fleet-channel field input
  through the one door. `must-port` is a capture obligation, never an adoption right: the label
  guarantees the change is read, and adoption still passes the successor's own doors — as field
  input with its receipts, under the zero-based port rule, never as a copy.
- **The cutover, one host at a time, a canary first.** A host is over when its first vendoring
  receipt exists — the receipt is what *runs on the successor* means, checkably. Why one at a time:
  the first host is the manifest's proving ground, and a manifest that cannot represent the canary's
  real state — its forks, trims, and extensions — fails cheaply on one host instead of expensively
  on all of them.
- **The archive.** When the last host is over, the predecessor is archived: read-only, permanently
  citable. Citable is the point — canon and records cite upstream by URL, and the archive is what
  keeps every one of those URLs meaning what it meant.

## The Skills disposition

Chapter 1 deferred one predecessor Skill here. The disposition:

| Predecessor Skill | Verdict | Reason |
|---|---|---|
| `create-skill` | **Not ported** | Chapter 1's *What a Skill is* is the authoring guide, and it travels with the standard: a host authoring its first Skill reads the same section this repository does, against the same entry bar, on its own receipts. A Skill for authoring Skills was ceremony at this repository's size, and a host's size is no different. |

That closes Chapter 1's audit but for one row: `ship` waits where Chapter 1 put it, on Chapter 6.

## The outline's Compliance section, disposed

Chapter 4's ratification routed one open question here: the disposition of the outline's Compliance
section, which requires a host to declare its data-security and user-tracking obligations —
jurisdiction, retention, PII handling — with the content host territory and only the declaration's
existence required.

**The disposition: not taken as canon, and not silently dropped.** The requirement binds how a
running product treats its users and their data — the outline's Operate and Use material, none of
which this standard has yet taken, and none of which this chapter's subject reaches: distribution
governs how a host receives the standard, not what the host's product owes the people using it. The
section stays in the outline, non-normative, as source material for whatever chapter one day
governs operations. If no chapter ever does, it will have been declined here in the open rather
than lost in a hand-off.

## The transitional state, stated plainly

- **Ratifying this chapter sanctions building its machinery; it does not conjure it.** On the day
  this chapter is ratified there is no manifest, no receipt, and no sync, and the fleet still runs
  on the predecessor.
- **Until the sync has run end-to-end on a real host** — the canary, the epic's first work — every
  statement about a host's state is made from its repository, not from a receipt that does not yet
  exist, and nothing implies machinery that has not run.
- **The fleet roster row stays empty until the first real capture.** This chapter existing satisfies
  the row's precondition, never the row: earn-in is the declared policy, and it does not move.

## What this chapter unlocks, and what it does not

| | After this chapter |
|---|---|
| Adoption | Sanctioned: the manifest, the receipt, and the sync are buildable, and a project may take one system without the rest — whole, with its floors |
| The fleet channel | Mechanics defined; its roster still earns in with the first real capture |
| The cutover | Cut as #7's children: the canary first, then the rest of the fleet; the predecessor is archived when its last host is over |
| The frozen record | Readable: `must-port` changes and freeze-era findings enter through the doors Chapters 2 and 4 built |
| Fleet-wide dispatch | Not here — scheduled and unattended runs are Chapter 6's, and the sync is defined per-host so Chapter 6 has something to dispatch |
| The hygiene sweep | No new job: the manifest and roster are declarations, and re-verifying declarations is already the ledger's first row |
| Canon | Unchanged: it never ships, it is cited by URL, and it is amended only by ratification |

## The adaptive layer's additions

Declarations `config/` owes when this chapter's work runs, each dated and sourced:

| Declaration | Why it is configuration |
|---|---|
| The payload manifest — every shipped path, its class | The paths change as the repository grows; the classes and the one-class rule do not move when they do |
| The fleet roster — each host, its repository, where its receipt lives | Hosts join and leave; the sweep re-verifies the roster like any declaration |
| The sync's trigger and cadence | Scheduling economics, HC-called until Chapter 6 says otherwise |

## Founding decisions

Three decisions in this chapter clear Chapter 0's ADR bar — hard to reverse, surprising, and
carrying a real trade-off — and are recorded at ratification:

| ADR | Decision it records |
|---|---|
| 0020 | Canon never ships: the standard is read at its source and cited by URL, and only what must run locally is vendored — at the cost that reading the standard means leaving the host's repository. |
| 0021 | Every shipped path carries one of three declared classes — contract, seed, host — and seed is host-owned from the first copy, at the stated cost that upstream fixes never reach seeded copies. |
| 0022 | The only update path is a pull request on the host, judged by the host's own gates — the trust boundary applied in both directions, with no emergency push path at any severity. |

---

*Provenance: drafted against Chapters 0 through 4, the epic on #7, and the Glossary's minted entries
for the fleet, the freeze, and `must-port`. The predecessor's distribution epic,
[ace #149](https://github.com/wrburgess/ace/issues/149), is the chief source — its payload manifest,
vendoring receipt, and sync-as-pull-request are re-authored here from a configuration bundle's
mechanics into the standard's, and its release dispatcher waits for Chapter 6. The outline's
Compliance section is disposed above, closing the question Chapter 4's ratification routed onward.
That epic is history; this chapter is canon.*
