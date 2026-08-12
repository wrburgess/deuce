# Chapter 6 — Factory Automation

Chapters 0 through 5 built a system that runs one piece of work at a time with the HC present: the
lifecycle moves work, review judges it, the gate holds the floor, the Learning System keeps the
configuration true, and distribution carries the standard to the fleet. Every one of those
mechanisms has now been exercised with a person watching. This chapter settles what was deliberately
saved for last: the **factory** — the same lifecycle, run with the HC away. What is settled here:
what starts a run when nobody types, what an unattended run may touch and spend, where its stops go,
what it must leave behind, and what changes at the two gates — which is nothing. It comes seventh,
and last of the founding set, because a pipeline is automated only after every gate in it has proven
itself under human observation; automating earlier multiplies whatever the gates would have caught.
Its proof standard is the epic's exit test, on #8: a real issue travels from the queue to merged
with no human keystroke between the two standing gates.

## What this chapter does not cover

Named here so the seams are visible rather than discovered, in the pattern Chapter 1 set:

| Not here | Where | What this chapter does instead |
|---|---|---|
| What a stage does, its terminal artifact, its exit test | Chapter 1 — Lifecycle | The factory sequences stages; it changes nothing inside one |
| What a review may decide, the severity framework, the reviewer floors | Chapter 2 — Review System | An unattended run obeys the same floors; this chapter only routes their stops |
| The gate's contents, and the independent re-run `attested` waits on | Chapter 3 — Quality gate | The factory runs the gate as declared; the re-run stays Chapter 3's owed work |
| The sweep's and the sync's semantics | Chapters 4 and 5 | The factory schedules and dispatches them; both keep their shape whole |
| Merge authority | Chapter 0 — Governance | Consumed unchanged: the factory adds no setting and reaches no floor |
| Operating a host's running product — deploys, incidents, uptime | No chapter yet | Out of scope, as Chapter 5 disposed for Compliance: the outline's Operate material waits for a chapter that governs operations |

## The factory

The **factory** is the lifecycle run unattended: an admitted issue advances Assess → Devise →
Implement → Verify → Deliver by the same Skills, leaving the same terminal artifacts, under the same
gates, stops, and floors, with no human keystroke between the two gates.

- **It is the same lifecycle, not a second one.** Nothing here adds a stage, waives an artifact,
  re-rates a finding, or reaches a floor. Chapter 1's rule that compression is the HC's call holds
  with the HC away — which under automation means a factory run never runs a compressed path,
  because nobody is present to select one.
- **Autonomy is judgment replaced by something checkable, never by the AC's confidence.** That is
  Chapter 1's sentence for the end state — `delegated` at one end, `attested` at the other, neither
  removing the mechanism — and this chapter is the machinery that makes those settings worth their
  ceremony. It is not a third setting. Ratifying it flips neither gate: `config/gates.md` says what
  is in force, and the graduated shape has been the target since before this repository existed
  ([the reboot charter, §4](https://github.com/wrburgess/ace/blob/main/docs/superpowers/specs/2026-08-01-deuce-reboot-design.md)).
- **Automation adds exactly three things:** a trigger that starts work with nobody typing, a route
  for stops when nobody is standing at the desk, and records enough that an absent HC can audit what
  ran. Everything else the factory uses already existed when this chapter was drafted, which is why
  it is the shortest of the founding set's subjects and the last.

## The factory pass

A factory run is a **factory pass**: one bounded traversal of the queue. Invoked by a trigger, the
pass reads the tracker, advances what it may as far as it may, parks what it must, posts its run
record, and ends.

- **The pass is stateless: the tracker is the factory's only memory.** Which artifacts exist
  determines each issue's next stage — Chapter 1's re-entry rule, written so that an orchestrator
  would have something to resume from. The pass holds no board, no run file, no cursor. Why: a
  second copy of the queue's state is a second source of truth, and the predecessor's factory
  design spent its complexity exactly there — a card column beside the artifacts, plus an owed rule
  for when the two disagreed ([ace #144](https://github.com/wrburgess/ace/issues/144)). Here they
  cannot disagree, because there is no second one: the queue read through its labels is the only
  board this system has.
- **Idempotent by construction.** A pass that dies is re-run, not resumed; a trigger that
  double-fires finds the artifacts the first pass posted and does nothing. The cost is stated
  plainly: work inside a stage that has not reached the stage's terminal artifact is lost at any
  interruption, and the next pass re-runs that stage from its predecessor's artifact. That is the
  price of free re-entry, and it was priced in when Chapter 1 decoupled artifacts from gates.
- **Passes do not overlap.** One pass runs at a time; a trigger that fires while one is running
  starts nothing. Why: the status axis advances only when an artifact posts, so two concurrent
  stateless passes would pick up the same issue and do the same stage twice. Serializing passes is
  cheaper than inventing a claim protocol, and nothing at this queue's scale needs one. How many
  issues one pass advances, and any parallelism inside one, is adaptive configuration; the
  no-overlap rule is the floor.
- **A pass ends on one of four outcomes, and says which:** *drained* — nothing admitted remains
  advanceable; *parked* — everything left is waiting at a gate or on a stop; *spent* — the budget
  below ran out; *killed* — the kill switch. The **run record** is where it says so: what the pass
  picked up, what it advanced, where each parked issue waits, and why the pass ended — posted
  durably on the tracker, its exact home configuration. Why the record is a floor and not a
  nicety: an unattended pass that ends silently cannot be told from one that died, and this
  standard already refuses to blur that distinction — *unreachable* and *unresponsive* are
  different outcomes (Chapter 2), and so are *finished* and *gone*.

## Admission

**The factory never selects its own work.** An issue enters the factory by **admission**: the HC's
explicit, durable act of handing it over. `status:ready` means the work *can* start; admission means
the HC said *start it*.

- **Why the front door stays shut.** Chapter 0 deliberately has no priority axis: priority is which
  issue the HC points the AC at next. Admission is that pointing, made durable so a trigger can read
  it. A factory that picks up anything `status:ready` has quietly moved the choice of what to build
  from the HC to whoever — or whatever — files issues, and the predecessor's epic named that risk
  without resolving it: an unattended pipeline with an open front door is a different risk posture
  ([ace #144](https://github.com/wrburgess/ace/issues/144)). This chapter resolves it: shut, and not
  a setting. An open front door is not a loosening the gates offer.
- **Admission order is the machine-readable priority.** Chapter 0 left one revisit open: a priority
  signal returns only if automation needs it in machine-readable form. It does, and the answer is
  the order of admission — no ranking, no weights, no second copy of a judgment the HC already
  expressed by admitting one issue before another. The concrete carrier of admission — a label, a
  milestone, an argument to the trigger — is adaptive configuration; that admission is explicit,
  ordered, and the HC's act alone is canon.
- **Admission is not a gate and waives nothing.** An admitted issue meets the Direction gate at its
  declared setting, stops at every stop, and ships only through the Ship gate. Admission decides
  *whether the factory may begin*; the gates decide everything they always decided.

## Stops, routed

Three chapters wrote stops toward this one. Chapter 1 defined a stop as a pause whose question is
recorded durably; Chapter 2 made a run with no reachable reviewer stop rather than certify itself;
Chapter 3 fixed that a red gate whose fix is not obvious is a stop. What was missing was only where
a stop goes when nobody is standing at the desk.

- **A stop parks the issue, never the factory.** The question posts durably where Chapter 1 put it,
  `status:blocked` marks it — the queue is already the dashboard that surfaces it — and the pass
  moves to the next admitted issue. Why: one ambiguous requirement must not idle everything behind
  it, and the reverse discipline is already canon — a pass that pushes past its stop to keep moving
  is Chapter 1's unsupervised run, not its unattended one.
- **The answer is the resume.** The HC answers on the record, exactly as when present; the next pass
  reads the answer and re-entry does the rest. No resume mechanism exists because none is needed —
  that is what stops-as-pauses was for.
- **A stop is never self-answered.** The bar — *can I resolve this without guessing at intent?* —
  does not move when nobody is watching; that is when it binds hardest.
- **Surfacing is owed; the mechanism is configuration.** A parked stop must reach the HC's attention
  without being hunted for. The run record names every parked issue and why; whatever notification
  the platform offers on top of that is declared in `config/`, dated and sourced.

## The gates, unattended

The count is two, the settings and their floors are Chapter 0's and Chapter 1's, and the factory
adds none. What this chapter fixes is what a pass does at each setting — the behavior, never which
setting is in force, which is `config/gates.md`'s alone:

| Gate | Under `required` | Under the loosened setting |
|---|---|---|
| **Direction** | The pass runs Assess, posts the Assessment, and parks the issue at the gate; the HC's choice is the resume | `delegated`: the pass proceeds on the posted recommendation, on Chapter 1's floor, whole |
| **Ship** | The pass carries the issue to `done-pending-merge`, Delivery Record posted, and parks; the HC merges | `attested`: the pass merges only against Chapter 2's conforming review bound to the merge commit *and* Chapter 3's independent re-run of the gate |

- **`delegated`'s second precondition is supplied here.** Chapter 1 made the setting wait on two
  mechanisms: an option set a second party can review (Chapter 2) and somewhere to route a stop —
  this chapter. Both now exist. Whether it is in force stays a governance act, recorded where gate
  settings live.
- **`attested` gains nothing and loses nothing.** Its floor is Chapter 0's, its review is Chapter
  2's, and its second leg — the gate re-run by something that is not the AC — is Chapter 3's owed
  work. A factory pass does not merge until that leg exists, at any setting. And the ceremony
  argument runs the other way too: attestation is worth paying for only when its autonomy is used,
  and the factory is the first thing that would use it — the dated reasoning sits with the setting,
  in `config/gates.md`, and moves when the HC moves it, not when this chapter merges.
- **A parked gate is the system working, not a failure to automate.** With both gates at their
  strictest, the factory still earns its keep: every admitted issue is carried to its next gate
  with the artifacts posted, and the HC's day is two kinds of decision instead of five stages of
  driving.

## The two preconditions

No pass runs unattended until two declarations exist, and neither is this chapter's to write:

1. **A conforming credential.** Chapter 0's third trust rule already requires a written
   blast-radius declaration before automation uses a credential, and `config/credentials.md`
   already distinguishes a credential's two states. This chapter makes the split canon: **the
   attended state never runs unattended.** The HC's own login reaches everything the HC reaches,
   and its declared blast radius ends with *watched* — with the HC away, that declaration is void.
   Every credential a pass touches — the tracker's, the sync's — has a minted form conforming to
   its declaration before the first unattended pass, and the factory's own tracker credential owes
   its entry before that pass exists to use it.
2. **A declared budget.** Chapter 0 budgets the AC's usage per cycle and `config/capacity.md`
   holds the number; unattended runs are the first consumer that needs the number enforced rather
   than written down. So: **an unattended pass runs only under a declared budget, and spending it
   ends the pass** — recorded as *spent* in the run record, resumed by a later trigger under a
   later budget. Why a floor and not a tuning knob: an attended run that overspends is noticed by
   the person watching it; an unattended one is noticed only by what it consumed.

## Routing, consumed

A trigger launches a session nobody is present to configure, so something must say which model and
effort each stage runs at. That answer was placed before this chapter needed it: model and effort
routing is adaptive configuration (Chapter 1), and the factory **reads it at dispatch, from the
declaration** — never from a Skill body, never from a value baked into the trigger. A stage with no
declared row runs at the declared default. The declaration's current form, and the per-stage table
that replaces it when routing becomes actionable, are `config/models.md`'s own — with the
predecessor's never-built three-tier design cited there as the shape a table might take
([ace #77](https://github.com/wrburgess/ace/issues/77)). Reviewer routing needs nothing new at all:
Chapter 2's roster already carries each reviewer's mechanism and readiness check, an unattended
summons uses it unchanged, and a pass that finds no reachable reviewer stops, exactly as an
attended one does.

## The standing jobs, dispatched

Two chapters defined recurring jobs as HC-called and left their scheduling here.

- **The hygiene sweep may be scheduled.** Chapter 4 shaped the sweep so that nothing about it waits
  for a schedule, and a scheduled sweep is the same sweep: proposals, never adoptions, its product
  pull requests the HC disposes of. Its cadence is `config/learning.md`'s.
- **The sync may run fleet-wide.** Chapter 5 defined the sync per-host precisely so this chapter
  would have something to dispatch: a fleet-wide sync is the roster iterated — one branch, one pull
  request, per host, each judged by that host's own gates. Nothing central appears, and the unit of
  the sync never changes. Its trigger and cadence are `config/sync.md`'s; the HC-called line there
  is superseded the day a schedule is declared in its place, dated and sourced, and not before. Its
  credential floor is `config/credentials.md`'s minting rule, unchanged.
- **Dispatch adds no authority.** A scheduled job holds every floor its called form holds. The
  factory decides *when* a standing job runs; nothing about a schedule touches *what it may do*.

## The kill switch

**One documented act stops the factory.** Every trigger is disarmed, no new pass starts, and a pass
in flight ends at the next artifact boundary, recorded as *killed*.

- **Why one act:** an emergency that requires remembering which three schedules to disable is spent
  on archaeology before it is spent on the problem. One act, documented where the triggers are
  declared, findable by an HC who has never read this chapter.
- **Killing is always safe, because parking is always safe.** Nothing finishes silently and nothing
  rolls back: whatever posted stands, whatever did not post never happened, and re-entry resumes
  from the artifacts when the factory is re-armed. The stateless pass is what makes the kill switch
  cheap — a factory with run state would need a shutdown protocol; this one needs a stop sign.
- The switch's concrete form is adaptive configuration. That it exists, is one act, and is
  documented, is canon.

## The Skills disposition

Chapter 1's audit deferred one row here, and Chapter 5 closed every other. The disposition:

| Predecessor Skill | Verdict | Reason |
|---|---|---|
| `ship` | **Port**, re-authored as `execute` | Its value is the unattended run — Chapter 1's own verdict — and the faithfulness backstop it needed is Chapter 2's summons, now built. It is much smaller here, as Chapter 1 predicted: with stages communicating only through artifacts, one pass — read, advance, park, record — is nearly all of it. The name does not port: the Ship gate owns the word (one term per concept), and the predecessor's `ship` also carried in-session sequencing that the artifact rule already does. |

`execute` is the orchestrator: the Skill a trigger invokes to run one factory pass. It enters like
any Skill — through the lifecycle, on receipts — and the receipts exist: sequencing the five stages
through their artifacts is the job this repository has done on every issue since Chapter 1. That
closes Chapter 1's audit whole: six stages ported, `distill` ported, `listen` absorbed, the intake
four and `create-skill` not ported, and `ship` re-authored as `execute`.

## The transitional state, stated plainly

Ratifying this chapter sanctions building the factory; it does not conjure it. At this chapter's
ratification:

- **No orchestrator existed.** `execute` was unbuilt, and every pass this repository had run had
  the HC in it.
- **Neither precondition was met.** No credential's automated form was minted, and the declared
  budget was none at all — so no pass could run unattended, by this chapter's own floors.
- **`attested`'s second leg was unbuilt.** Chapter 3's independent gate re-run did not exist, so a
  factory pass could not have merged at any setting.
- **Nothing was scheduled.** The sweep and the sync remained HC-called, per their declarations.

The epic's exit test — a real issue, queue to merged, no human keystroke between the gates — is the
cut work's to meet, and it is met the way the sync was proven: an attended proving run first, the
HC watching with hands still, before any trigger fires with the HC away.

## The bootstrap exception ends here

Chapter 0 stated the exception, bounded it, and promised it would end in stages. The stages are
done: Chapter 1 took deuce's build-out into the lifecycle, and drafting the remaining chapters was
all the exception still covered. This chapter is the last of them. **From this ratification, the
bootstrap exception covers nothing.**

A future chapter, if the standard ever grows one, needs no exception: Chapter 0's *Ratification* is
itself the governor of chapter-making — draft, session, amend in place, merge, record, tag, cut —
and it is the path this chapter took. What the exception excused was building ahead of governors
during the founding. There is no ahead left.

## What this chapter unlocks, and what it does not

| | After this chapter |
|---|---|
| The factory | Sanctioned: `execute`, the run record, and the kill switch are buildable |
| `delegated` — Direction gate | Fully specified: both mechanisms Chapter 1 named now exist; in force only when the gate's declaration says so |
| `attested` — Ship gate | Unchanged, and still short its second leg — Chapter 3's independent re-run; no factory pass merges before it exists |
| The sweep and the sync | Schedulable, and the sync dispatchable fleet-wide; each waits on its own declarations and the credential floor |
| Capacity | Gains its first enforcer: no unattended pass without a declared budget |
| Chapter 0's priority revisit | Disposed: admission order, with the carrier configuration |
| The fleet | A host's factory is its own: the Skill ships by the manifest's classes, the floors travel whole (Chapter 5), and every declaration — triggers, budget, credentials — is the host's |
| The bootstrap exception | Spent |
| Canon | Otherwise unchanged: no new stage, no new gate setting, no new merge authority, no emergency path |

## The adaptive layer's additions

Declarations `config/` owes when this chapter's work runs, each dated and sourced:

| Declaration | Why it is configuration |
|---|---|
| The factory's triggers and cadence, and admission's concrete carrier | Scheduling economics and platform mechanism, the two most volatile things this chapter touches |
| The per-stage model and effort table | Replaces `config/models.md`'s single declaration on that file's own terms; platform-coupled by definition |
| The unattended budget | `config/capacity.md`'s number, at last with a consumer that enforces it |
| The factory's credential rows | `config/credentials.md` entries under its minting rule, the tracker credential first |
| The kill switch's concrete form, and the stop-notification path | Platform-coupled; both exist as canon only in what they must accomplish |

## Founding decisions

Three decisions in this chapter clear Chapter 0's ADR bar — hard to reverse, surprising, and
carrying a real trade-off — and are recorded at ratification:

| ADR | Decision it records |
|---|---|
| 0024 | The factory is a stateless pass over the tracker — no board, no daemon, no run state; re-entry recomputes everything from terminal artifacts, at the stated cost that work not yet posted is lost at any interruption. |
| 0025 | Admission is explicit: the factory never selects its own work, the open front door is refused as a setting rather than declined as a default, and Chapter 0's priority revisit is answered by admission order. |
| 0026 | An unattended pass requires a minted credential and a declared budget — the attended credential state never runs unattended — at the stated cost that the factory stays dark until both declarations exist. |

---

*Provenance: drafted against Chapters 0 through 5, the epic on #8, and the dated records in
`config/gates.md`, `config/credentials.md`, `config/capacity.md`, and `config/models.md`. The
predecessor's factory epic, [ace #144](https://github.com/wrburgess/ace/issues/144), is the chief
source — its board, trigger, and idempotency questions are re-cut here against a lifecycle that
already communicates only through artifacts, which is why its hardest problems, the card-and-artifact
disagreement and the resume protocol, do not appear: the designs that would have needed them were
refused in Chapter 1. Its routing dependency is consumed through
[ace #77](https://github.com/wrburgess/ace/issues/77), cited in `config/models.md`. The graduated
merge the factory consumes unchanged is
[the reboot charter's §4](https://github.com/wrburgess/ace/blob/main/docs/superpowers/specs/2026-08-01-deuce-reboot-design.md).
That epic is history; this chapter is canon.*
