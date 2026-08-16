# Chapter 2 — Review System & Findings System

Chapter 1 fixed how work moves, and left its fourth stage half-built on purpose: Verify runs the
AC's own examination in full, and everything that needs a second party — summoning a reviewer,
rating what it finds, recording findings where recurrence can be seen — was marked **not yet
usable**, waiting here. This chapter settles both halves. The **Review System** governs solicited
review: how a contractor reviewer is summoned, what bounds a review so that it ends, and how a
returned review is validated. The **Findings System** governs what happens to everything a run
learns: how a finding is recorded, the states it moves through, and how recurrence becomes changed
rules. It comes third because both loosened gate settings — `attested` at the Ship gate,
`delegated` at the Direction gate — wait on machinery only this chapter can sanction, and because
the mechanism that fills `rules/` with evidence starts here.

One boundary is inherited whole. Chapter 0's three mechanisms — the summons carries the standards,
`AGENTS.md` is a role boundary, compliance is checked when the review comes back — are the
contractor-reviewer contract, and everything below builds on them without re-deriving them. Where
this chapter says *summons*, it means the work order those mechanisms already define; what is added
here is its content and its bounds.

## What this chapter does not cover

Named here so the seams are visible rather than discovered, in the pattern Chapter 1 set:

| Not here | Where | What this chapter does instead |
|---|---|---|
| The tooling that runs a readiness check, dispatches a summons, and lints a findings record | Chapter 3 — Quality gate | Fixes the contracts that tooling must satisfy |
| How outside material becomes reviewed configuration | Chapter 4 — Learning System | The Findings System records what this repository's own work learns; field input stays Chapter 4's |
| Findings that arrive from other projects | Chapter 5 — Distribution | The schema here is written for one repository; extending it across hosts is Chapter 5's |
| Running review with the HC away | Chapter 6 — Factory automation | Writes the floors and stops an unattended run must obey; routing them somewhere is Chapter 6's |

Each system is written at full shape. Where a mechanism it depends on arrives later, that is stated
in place rather than discovered.

## The Review System

### Two kinds of discovery, and only one of them boundable

Review discovery comes in two kinds with opposite economics, and the split decides everything below.

- **Solicited discovery** is commissioned: Verify's adversarial pass, a contractor reviewer's
  response to a summons, and the fix-verification a wave of fixes receives. Because it is commissioned it can be
  bounded — and it must be, because a commissioned hunt with no declared stopping condition does
  not terminate. It keeps returning true findings indefinitely, at monotonically falling value. The
  predecessor watched seven pull requests run ten to fourteen adversarial rounds each before a
  person stopped them by hand ([ace #161](https://github.com/wrburgess/ace/issues/161)).
- **Unsolicited discovery** is noticed: a defect seen in passing, an observation made while running
  a command or tracing an unrelated field. It cannot be bounded, because an observation cannot be
  un-made — and the predecessor's record says it is systematically the higher-yield kind. It is
  **routed, never capped**: whatever a run notices enters the Findings System, whenever it is
  noticed.

Everything else in the Review System governs solicited discovery only.

### Bounded by lens set, not by round count

A **review lens** is one named question a review asks of the work — a defect class, stated as an
interrogative. A **lens set** is the small selection of lenses declared in the summons, chosen for
what this change actually touches.

**The rule: a solicited review is bounded by its lens set, never by a round count.** Each lens in
the set runs once. A lens that returned findings runs again on the fix wave (see
*Fix-verification*); re-running a lens that returned clean is the HC's call, never the AC's.

Round counts are the intuitive bound, and they are the wrong one. Value in a late round comes from
asking a different question; cost comes from repeating one already answered. A round cap discards
the first and permits the second — it truncates the round that would have changed the question
while allowing four more of the question already paid. The predecessor's evidence is exact: its
three most valuable late findings each came from a lens no earlier round had used, its lowest-value
tail was four consecutive rounds of one lens that had already paid out, and its one review scoped
with a declared threat model converged after a single finding
([ace #161](https://github.com/wrburgess/ace/issues/161)).

- **The lens set is an input to the review, not a conclusion from it.** "Is anything wrong?" is
  never answerably complete; declaring the set is what converts an open-ended hunt into a bounded
  one.
- **Every lens set carries one permanent lens: *what class is not on this list?*** A review that
  keeps returning one class of defect is not evidence that other classes are absent; it is evidence
  that attention is pinned. The permanent lens is the standing defense against a menu that can only
  enumerate the defect classes already known.
- **The lens menu is derived, and it is a menu.** The lenses available to a summons come from this
  repository's own record of recurring defect classes — the class index, below — never from a
  generic catalogue, because the classes worth reviewing for are, empirically, the classes a
  codebase keeps producing. A summons *selects* from the menu; running every lens on every change
  reconstructs the unbounded review in a new costume.

The menu's content, the size of a lens set, and every other number in this system are adaptive
configuration, dated and sourced. The derivation rule and the bound are canon.

### The summons, completed

Chapter 0 fixes what a summons carries. Four things are added or made exact here.

**The subject may be prose.** A summons binds its subject to the exact commit, and nothing in the
contract assumes the subject is code. A chapter draft, a decision record, an Assessment's option
set are reviewable subjects under the same mechanism, with lenses fit for them. This is half of
what the delegated Direction gate was waiting on: an option set is now something a second party can
be summoned to examine.

**Reachability is checked, never assumed.** Before any summons is dispatched, an executable
**readiness check** — one command, side-effect-free — verifies the reviewer can actually be
reached. A reviewer whose check fails is *unreachable now*: the summons fails immediately, is
recorded as unreachable, and never consumes a waiting window. Unreachable and unresponsive are
different outcomes, and the record distinguishes them. Why the check is canon while the mechanism
is configuration: the predecessor's review requests failed silently on live hosts — the request
looked dispatched, nothing ever arrived, and the run reported itself reviewed. Its own record
concluded that a caveat in a table leaves the failure intact and only an executable check removes
it ([ace #125](https://github.com/wrburgess/ace/issues/125),
[ace ADR 0027](https://github.com/wrburgess/ace/blob/main/docs/adr/0027-reviewer-chain-validated-against-invocation-paths.md)).
A review gate that silently does not run is worse than no gate, because the run reports as
reviewed; the receipt for this chapter is banked on #4.

**What counts as a response is declared with the mechanism.** A synchronous reviewer's response is
the output it returns; an asynchronous reviewer's response arrives on named surfaces, and the
surfaces are named — the predecessor's near-miss was reading only issue-level comments, which made
an inline review invisible ([ace #125](https://github.com/wrburgess/ace/issues/125)). Whatever the
path, the summons and the review both land on the pull request, so the durable record never depends
on the mechanism that produced it.

**The floor is a stop.** A run that finds no reachable reviewer stops and asks. It never certifies
itself by delivering unreviewed work as reviewed. This is Chapter 0's merge floor — never on the
AC's own say-so — arriving one stage earlier.

Which reviewers exist, by which mechanism each is invoked, and what each one's readiness check is,
are adaptive configuration: dated, sourced, re-verified by the hygiene sweep.

### Validation on return

Chapter 0 fixes that a returned review is validated against its contract and re-summoned with the
missing fields named. What conformance means is fixed here:

- every finding carries the fields the Findings System requires — the lens that raised it, a
  severity in the framework's vocabulary, its location, and the defect stated concretely enough to
  be disposed of;
- the severity vocabulary is the framework's, not the reviewer's own;
- the review names the commit it examined, and it is the commit the summons bound.

A conforming review's findings then enter the Findings System like findings from any other source.
None is dropped: every one gets a disposition, recorded on the Verification.

### The severity framework

Severity states what a finding forces before the work ships — never how alarming it sounds. Three
ratings:

| Rating | What it forces |
|---|---|
| **must-fix** | The change does not ship with this open. Verify cannot exit until it is fixed — with fail-first evidence — or refuted, with the refuting evidence recorded. |
| **should-fix** | Real, and not shipping-blocking. Fixed in this change, promoted to tracked work, or accepted as residual — never silently dropped. |
| **note** | An observation owing nothing. Recorded, closed. |

- **Severity is the reviewer's claim; disposition is decided at the receiving end.** The AC may
  refute a must-fix, with evidence, on the record. But a disagreement over a must-fix is never
  settled by the AC alone: under `required` the HC sees the finding and its refutation side by side
  at the Ship gate; under `attested` a refutation the reviewer has not accepted is a stop.
- **Why three ratings and not more:** each exists because it forces something different. A fourth
  rating that forces nothing new is a synonym, and the Glossary already bans those.
- **Why the framework is canon:** it is the shared vocabulary of the summons, the validation, and
  the two gates. A reviewer-local scale would make reviews incomparable, and incomparable reviews
  cannot be validated on return.

### Fix-verification, bounded separately

Code written in response to findings is the least-reviewed code in the change: it is authored after
the pass that would have caught it. The predecessor counted nine recurrences of a fix introducing
or leaving the next round's defect ([ace #161](https://github.com/wrburgess/ace/issues/161)), and
its costliest defect family was fixes that addressed a finding's symptom while leaving its
mechanism, re-opening the same finding across as many as fifteen rounds
([ace #164](https://github.com/wrburgess/ace/issues/164)). So fixes get their own verification,
with its own bound — not the original lens set's, whose lenses were chosen for the original diff.
What carries over from that set is narrower, and is fixed below: the lenses that returned findings
run again, on the wave's diff alone.

- **Anchor the fix to the mechanism, not the symptom.** For each accepted finding: the root-cause
  mechanism restated in one sentence, then the failing test that exercises that mechanism — Chapter
  0's fail-first evidence, applied to review response. A test that would still pass with the defect
  present is the wrong test.
- **The wave's verification is the AC's own, and it is no longer the whole of the wave's review.**
  Every accepted fix in the wave lands, then the AC re-runs its own passes on the wave's diff: the
  mechanism anchor and its failing test above, the drift check, the adversarial pass. That pass
  carries as much as it does on measured grounds — the predecessor's efficient lifecycle capped
  every external loop at one round with the AC's full-strength self-verification carrying fix
  checking, measured by the HC as cutting contractor findings by roughly 80%, and the HC set that
  trade on #62. It stands. What changed is what sits after it.
- **A wave that moves the head earns one further summons, bound to the head it produced.** Fixes are
  the least-reviewed code in a change, and a review of the pre-wave commit is not a review of the
  commit being merged — which is the binding Chapter 0 requires. Measured across the pull requests
  here that carried a review commit on record, the reviewed commit differed from the merged one on
  14 of 18. So one further summons is owed, and its shape is fixed:
  - **Owed only when the wave moved the head.** A review that returned nothing to fix is already
    bound to the commit being merged, and nothing further is owed.
  - **Scoped to the wave's diff and to the lenses that raised the findings** — never the whole
    change again. Those lenses already ran on the original diff; this is the re-run *Bounded by lens
    set* already provides for, with the contractor running it rather than the AC. The permanent lens
    rides this set as it rides every other.
  - **Nothing it finds is fixed in this pull request.** A fix moves the head, and the binding the
    summons was raised to establish is broken again one round down. A `must-fix` puts the merge back
    in the HC's hands, exactly as `required` does — it does not change the setting in force, and no
    declaration is edited. A `should-fix` is promoted to tracked work or accepted as residual, on the
    record. A `note` is recorded.
  - **There is never a third summons**, and that is what keeps this from being the round count this
    chapter refused. The predecessor's fifteen-round tail on a single finding
    ([ace #164](https://github.com/wrburgess/ace/issues/164)) ran because every round was answered
    with code that earned the next one; removing that edge is what makes one further read affordable.
  - **Once the summons owed has returned, the head is final.** The wave's own movement is what the
    further summons exists to cover, so it is not what this clause reaches; every movement after that
    review is — a further fix, an update from the base branch, anything. Where no further summons was
    owed, the original review is the last one and the same holds from it. A pull request whose head
    moved past its last conforming review has no review bound to what merges, and it goes to the HC.
    The setting degrades to the human; it never degrades the floor.

  The validation re-summons a malformed response earns is a different thing and stands — that is the
  same review returned to contract, not a new one. **What is given up, and it is real:** a defect the
  further summons finds that is not a `must-fix` is not fixed in the change that produced it; it is
  tracked or accepted, on the record, and lands in the Findings System like any other defect —
  evidence for revisiting this trade. That replaces the residual this rule carried until now — *a
  defect introduced by a fix can now ship past the reviewer* — which is what the further summons
  closes.
- **Escalate on recurrence.** When fix-verification keeps finding defects in the fixes past its
  declared limit, the signal is that the design is wrong, not that one more patch is owed. That is
  a stop, and its sanctioned resolution is Chapter 1's: back to Devise. The limit's number is
  adaptive configuration; that a limit exists is canon.

## The Findings System

### Recording is delivery

A **finding** is one recorded observation that is not itself the commissioned work — a defect, a
risk, an improvement worth weighing, a lesson. Chapter 1 fixed that Verify records and disposes of
every finding; this system fixes what *recorded* means, everywhere a finding can arise.

- **Every finding is recorded — always, and the recorded line is the delivery.** A finding is never
  dropped for being minor, and never handed off unrecorded so the run can feel finished. Completion
  resolves against the record, not against the tracker.
- **Length is bounded; the act is not.** A finding matching a class already in the index records a
  reference and the delta — what is new about this instance — rather than re-deriving the lesson.
  The twentieth instance of a known class costs a line, not a page.

### Two axes, not one

Every finding carries two independent facts. **Type** answers *what kind of thing is it*; **state**
answers *what happens to it next*. Recording type alone is the failure mode, and the insufficiency
is invisible: the predecessor's findings log reached 256 entries in three days, roughly nine in ten
of them defects already fixed in the run that found them — and read by type alone, that archive was
indistinguishable from a backlog of 256 open items. It conformed perfectly to its own format the
whole time, and triage ran zero times
([ace #161](https://github.com/wrburgess/ace/issues/161)).

**Types:** `defect` · `risk` · `improvement` · `lesson`. The gap rule is Chapter 0's: a finding
that fits no type defaults to `lesson`, and a recurring misfit — never a single one — triggers a
one-time amendment to the set.

The type vocabulary is deliberately not the issue-type vocabulary, because a finding is not an
issue — only a finding in state `open` becomes one. At promotion the mapping is direct: a `defect`
becomes a `BUG:`, an `improvement` becomes a `TASK:`. Reusing `bug` for both records would put one
word on two different things, which the Glossary's one-term rule exists to prevent. And `defect` is
deliberately wider than a code bug: in a repository whose artifacts are mostly prose, a broken
link, a contradiction between chapters, and a term with no Glossary entry behind it are all
findings of type `defect`.

**States, and where each lives:**

| State | Meaning | Home |
|---|---|---|
| `closed` | Resolved in the run that found it, or a lesson owing no action | The artifact that found it — normally the Verification |
| `open` | Live work, not yet done | Promoted to a tracker issue under the Work Tracking System |
| `accepted` | Real, decided against, on the record | The accepted register |

**The flow is one-way, and `accepted` is terminal.** Its purpose is that the same residual cannot
be re-litigated on a later review, and re-opening it defeats the artifact. The summons already
carries the accepted list — Chapter 0's first mechanism — which is how the terminal state does its
work. New evidence never re-opens an accepted finding; it becomes a new finding that cites the old
one.

### The findings home

Cross-pull-request memory lives in two registers, in `findings/`:

- **`findings/accepted.md` — the accepted register.** Every `accepted` finding, one line each, with
  a link to the disposition that accepted it. It exists so the summons can carry the accepted list
  without an archaeology pass, and so a reader can find every risk this repository has knowingly
  kept.
- **`findings/classes.md` — the class index.** The descriptive record of recurring classes: *this
  shape occurred N times, see these findings*. **Descriptive, never imperative.** The moment an
  index entry says "never do X" it is a rule authored under another name, and rules have their own
  home and their own entry bar. The line between the two is mechanically checkable — imperative
  voice — and checking it is Chapter 3's lint.

Findings themselves stay where Chapter 1 put them, on the Verification. The registers exist because
two consumers need memory that spans pull requests: the summons needs the accepted list, and the
lens menu is derived from the class index.

### How recurrence changes rules

Chapter 1 seeded `rules/` empty and named this chapter as the mechanism that fills it. The pipeline,
in order:

1. Findings recur, and the class index counts them — reference plus delta, so counting stays cheap.
2. A recurring class earns a lens on the menu: the adversarial pass and every future summons now
   hunt it deliberately. The predecessor's four classes that recurred all month across hosts —
   fail-open guards, time-of-check races, shell quoting, overclaimed quantifiers — recurred
   precisely because each pass re-derived its hunt list from scratch
   ([ace #164](https://github.com/wrburgess/ace/issues/164)).
3. A recurring class whose prevention can be stated as standing guidance enters `rules/`, citing
   its index rows as the receipts Chapter 1's entry bar demands.
4. The hygiene sweep runs the other direction: a lens that has stopped paying is demoted from the
   menu, a rule whose class has stopped recurring is retired, an index entry nothing cites is
   flagged.

Both directions run on evidence. A rule enters when its class recurs, and leaves when its class
dies — which is what keeps `rules/` a set of live defenses rather than a sediment of old ones.

### Urgency never waits

Nothing urgent is ever in a triage pile, and that is what makes deferral safe rather than
negligent. A broken thing is a defect, and defects get fixed — in the running change when the fix
is in hand, as tracked work in state `open` when it is not. What waits for triage is judgment:
improvements, risks worth weighing, the question of whether something is worth doing at all — none
of which is urgent by definition.

### The triage pass

The **triage pass** is how deferred findings drain, and it sits outside the lifecycle. Every
lifecycle stage is scoped to one issue or one pull request; triage is cross-cutting by nature, and
attaching it to an invented boundary between units of work is the seam Chapter 1 already refused
once. It runs when the HC calls it, is interruptible, blocks nothing, and needs no schedule — a
pass that must be scheduled to happen is one whose real obstacle is cost, and state plus a short
index is what removes the cost.

- **The pass is subtractive, never additive.** Its product is eliminations with evidence — already
  fixed, superseded, duplicate, unreachable — plus the survivors. A pass that returns every item
  ranked has delegated nothing: the HC still reads every item. A pass that returns eliminations has
  removed the reading.
- **The AC eliminates only what it can attach a re-runnable check to** — one command the HC can run
  to confirm the row. Everything else it proposes, and the HC decides. This is the same boundary
  the lifecycle draws everywhere: mechanical facts are delegable, judgment is not.
- **The product is durable.** It lands on the tracker, not in a message — Chapter 1's
  delegated-work rule, applied to the pass itself.
- **Sort only as far as the next decision requires.** The first sort is whatever binary the current
  commitment implies; only the deferred side is sub-sorted, and only when something is about to be
  done with it. Fully categorizing work that has already been deferred is the growth this system
  exists to bound.

## Verify's external half, now written

Chapter 1 wrote Verify at full shape and deferred its external half here. The shape it
takes:

- **The order gains one step.** Drift check, adversarial pass — which now hunts the lens menu's
  standing classes instead of re-deriving its list each run — then the summons, then findings
  response over the AC's own findings and the reviewer's together, batched per *Fix-verification*.
- **The summons runs on every pull request that runs Verify.** What scales with the change is the
  lens set, never whether review happens: a trivial change gets a small set, not no review. A
  change too trivial to review at all is a compression, and compression is the HC's call alone
  (Chapter 1) — so review is only ever absent because the HC decided it, on the record. Why the
  rule is absolute: a review that sometimes silently does not run is worse than no review, because
  the run reports as reviewed. That failure is live field evidence, banked on #4.
- **The Verification records the review whole:** the summons, the review, every finding with its
  type, severity, state, and disposition — and, when a reviewer could not be reached, the readiness
  check's outcome.
- **Chapter 1's honesty line inverts rather than retires.** A Verification now names the reviewer,
  its model, its mechanism, and the commit reviewed. When no reviewer was reachable, it says so
  plainly — and the run has stopped.
- **Verification is still never delegated.** The summons adds a second examiner; it does not move
  the first. Chapter 1's rule stands untouched.

**The transitional state, stated plainly:** ratifying this chapter sanctions building the machinery;
it does not conjure it. Until the readiness check and the summons path exist and have run
end-to-end on a real pull request — the exit test of this chapter's own work — Verify continues
under Chapter 1's honesty line, and nothing in between implies a review that did not happen.

## Verifying prose

Canon, decision records, Glossary entries, Skills — the artifacts this system is made of — are
prose, and prose has no failing test. Its verification policy has three legs:

1. **Contractor review on canon pull requests.** A chapter or a decision record is a reviewable
   subject like any diff, summoned with lenses fit for prose: restatement of content another
   document owns, contradiction with ratified canon, a term used with no Glossary entry behind it,
   drift between a copy and its source.
2. **Built against.** A chapter is tested by the work that runs under it, and what construction
   disproves is amended — Chapter 0's counterweight, already priced in, not restated here.
3. **The recurrence signal.** Defects in prose are findings like any other: they carry classes, the
   classes recur, and the index accumulates the evidence that amends a chapter or admits a rule.

The three legs are one policy: review catches what a draft can be told, building catches what only
use can show, and recurrence catches what any single pass misses.

## What this chapter unlocks, and what it does not

| Setting | After this chapter |
|---|---|
| `attested` — Ship gate | Specified in full: the independent review it requires is a conforming review under this chapter, bound to the exact commit being merged. Usable only once the summons machinery has run end-to-end on a real pull request, and the setting itself is then the HC's to change — a governance act, recorded as dated configuration whose source is the HC's decision. Ratifying this chapter flips nothing by itself. |
| `delegated` — Direction gate | Half-unlocked: an option set is now a reviewable subject. Still waits on Chapter 6 for somewhere to route a stop. |
| `rules/` growth | Unlocked: the recurrence pipeline is the entry mechanism Chapter 1 named. |

Merging on the AC's own say-so remains unavailable at every setting. Nothing in this chapter
touches that, and nothing ever will — that floor is Chapter 0's.

## The adaptive layer's additions

Declarations `config/` owes when this chapter's work is built, each dated and sourced:

| Declaration | Why it is configuration |
|---|---|
| The reviewer roster — each reviewer, its invocation mechanism, its readiness check | Platform-coupled; the predecessor's silent failures are the cautionary case |
| The lens menu | Derived from the class index, which is its source field |
| Lens-set size, and the fix-verification limit | Review economics, tuned as evidence accumulates |

The rules those values instantiate — derivation from this repository's own classes, bounding by
lens set, the existence of a fix-verification limit — are canon, and do not move when the values
do.

## Founding decisions

Three decisions in this chapter clear Chapter 0's ADR bar — hard to reverse, surprising, and
carrying a real trade-off — and are recorded at ratification:

| ADR | Decision it records |
|---|---|
| 0010 | Solicited review is bounded by a lens set declared in the summons, never by a round count — with one permanent lens as the defense against a menu that only names the known. |
| 0011 | Findings carry type and state as independent axes; the state flow is one-way, and `accepted` is terminal. |
| 0012 | Triage sits outside the lifecycle, and its product is subtractive — eliminations with evidence, never a ranking. |

---

*Provenance: drafted against Chapters 0 and 1, the epic brief and banked field evidence on #4, and
the predecessor's proposals and receipts at
[ace #161](https://github.com/wrburgess/ace/issues/161),
[ace #125](https://github.com/wrburgess/ace/issues/125), and
[ace #164](https://github.com/wrburgess/ace/issues/164) (workstreams 2 and 3) — read, re-authored,
and cited by URL, never copied in.*
