# Chapter 3 — The Quality Gate & Tooling

Three chapters of rules are written and nothing mechanical holds any of them. Chapter 0 names a
**configuration lint** three times and specifies what it must check without building it; Chapter 1's
stages tell the AC to run *the checks* and never say what the checks are; Chapter 2 fixes the
contracts a tool must satisfy and leaves the tool to here. This chapter settles the **quality
gate** — the fixed set of automated checks a change must pass — and, before the list of checks,
the two questions that decide whether any of them is worth having: what a check may be asked to
do, and what evidence proves a check works.

It comes fourth because it is the first chapter whose subject is enforcement rather than shape.
Chapter 0's second purpose is to turn watchfulness into mechanism, and its own sentence for it —
*a rule nobody enforces is a wish* — is the standing indictment of the three chapters above this
one.

## What this chapter does not cover

Named here so the seams are visible rather than discovered, in the pattern Chapter 1 set:

| Not here | Where | What this chapter does instead |
|---|---|---|
| Which defects a review hunts, and how a review is bounded | Chapter 2 — Review System | Fixes the gate as a floor *beneath* review, never a substitute for it |
| How outside material becomes reviewed configuration | Chapter 4 — Learning System | Fixes where a check's uncovered residue is routed; what enters from outside stays Chapter 4's |
| Running the gate on a host that is not this repository | Chapter 5 — Distribution | Every check names the artifacts it reads, so the coupling is visible when a host adopts one |
| Routing a red gate when nobody is watching | Chapter 6 — Factory automation | Fixes that a red gate is a stop; where an unattended stop goes is Chapter 6's |

## The quality gate

The **quality gate** is the fixed set of automated checks a change must pass. A **check** is one
member of that set: an executable that reads named artifacts, decides a stated property of them,
and exits zero or non-zero. *The checks*, everywhere in Chapter 1, means this set and nothing else.

Chapter 2's **readiness check** is deliberately not one of these. It probes whether a reviewer can
be reached, it runs before a summons rather than over a change, and it is named separately for that
reason. One word on two mechanisms is the fork the Glossary's one-term rule exists to prevent, and
the compound name is what keeps them apart.

**The gate is one command.** Not a list a person assembles from memory, and not a document
describing which commands to run. A gate that has to be assembled is a gate whose contents differ
by who assembled it, and *the checks are green* then means only that some checks were green.

**One definition, two runners.** The same command runs on the AC's machine and on the merge
candidate in continuous integration. Continuous integration re-runs the gate; it never *defines* a
gate of its own. Why: a check that exists only in continuous integration is invisible to Chapter
1's Implement stage, whose exit test is that the checks are green — so the AC would be certifying
an exit test against a subset of the checks that decide it.

**A check that cannot run locally is not in the gate.** This is the cost of the rule above, taken
deliberately. It excludes real things: long scans, matrix builds across platforms deuce does not
have, anything needing a credential the AC does not hold. Such a check may exist, and it may even
run on every merge — but it runs *outside* the gate, under its own name, and no artifact says the
gate covered it. The trade is that the gate stays small and honest rather than large and partly
unrunnable.

**The gate is a floor, never the review.** It catches regression against properties already known
and stated. It discovers nothing. Every defect class in this repository's index was found by
someone reading, and the gate's whole function is to make sure the classes already paid for do not
come back. A green gate is therefore never evidence that a change is good — only that it has not
broken what was previously fixed. Chapter 2's review is the discovery mechanism, and no amount of
gate makes it optional.

### Green has to be checkable by someone who was not there

Under the Ship gate's `attested` setting the AC merges its own work. Two claims support that merge:
that an independent review passed, and that the checks are green. Chapter 2 made the first
checkable — the review is bound to the exact commit, validated on return, and recorded on the pull
request. **The second is not checkable today.** The gate runs where the AC runs it, and the only
record that it ran is the AC saying so.

That is Chapter 0's floor — *merging on the AC's own say-so is never an option* — leaking through a
path Chapter 0 did not name. Chapter 2 closed the same shape for review by making reachability
executable rather than asserted, on the argument that a caveat in a table leaves the failure intact
([ace #125](https://github.com/wrburgess/ace/issues/125)).

**So: a re-run of the gate on the merge candidate, by something that is not the AC, is a floor for
`attested`.** Not a convenience and not a later nicety. The setting is live in `config/gates.md`
before the mechanism exists, which is a real gap in the repository as it stands rather than a
hypothetical — and naming it is what makes closing it this chapter's first work rather than
something discovered when it matters.

Which runner, which provider, and what it costs are adaptive configuration. That an independent
re-run exists before `attested` rests on a green claim is canon.

## What a check may be asked to do

This is the chapter's load-bearing section, and its whole evidence base is two checks this
repository deliberately did not build.

Both were deferred with the reasoning recorded rather than the check hacked together, which is why
there is anything to reason from at all. They look like the same job — *a document says something
it should not* — and they are not the same job, and the difference is the rule.

| Owed check | Owed by | The invariant is a property of |
|---|---|---|
| `findings/classes.md` is descriptive, never imperative | Chapter 2 → *The findings home* | the **sentence** — one file, one contract |
| No live document restates a gate setting | [PR #49's disposition](https://github.com/wrburgess/deuce/pull/49#issuecomment-5170470462) | the **meaning** — every file, no contract |

The second is not mechanically decidable, and the evidence for that is not an argument. Three
sweeps over one repository found nine surfaces, then one more, then one more. Both misses carried
the meaning in words the search did not contain: a Skill's frontmatter line with no merge
vocabulary in it at all, and *the HC merges* sitting inside a Glossary entry that was already open
for editing. The disposition's own conclusion is the finding: **a grep finds phrasings; the class
is defined by meaning, and no grep will close it.**

There are three things to do with an invariant a lint cannot decide, and only one of them is right.

1. **Write the grep and call it the check.** This is the failure mode, and it is worse than having
   no check. A green then means *no known phrasing appeared*, and it is read as *the invariant
   holds*. That is precisely the most-recurring class in this repository's own index — a check that
   measures something other than the invariant it claims, five instances across four pull requests —
   and it is the same shape Chapter 2 refuses for review, where a gate that silently does not run is
   worse than no gate because the run reports as covered.
2. **Decline to check it at all.** Honest, and it throws away the part that genuinely is mechanical.
3. **Restate the invariant structurally until what remains is decidable, check that, and declare
   what the check does not reach.** This is the rule.

### The structural restatement

A **structural restatement** converts an invariant about what a document *means* into one about
what a document *contains* — a shape, a token, a link, a grammar — such that the restated form can
be decided by reading the artifact and nothing else.

The move is not to detect the violation. It is to **check for the structure whose absence is the
violation.** Two of this chapter's inherited debts restate cleanly:

| Owed as | Restated as | Decidable because |
|---|---|---|
| No live document restates a gate setting ([PR #49](https://github.com/wrburgess/deuce/pull/49#issuecomment-5170470462)) | A gate setting's value appears only in `config/gates.md` and in the chapters that define what the settings mean; every other live document naming a gate resolves to `config/gates.md` | Both halves are token-and-link facts. The allowlist is two chapters, and it is short because each setting has exactly one defining home |
| `findings/classes.md` is descriptive, never imperative (Chapter 2 → *The findings home*) | Every entry is a heading, one count line naming its pull requests, and instance lines each naming a pull request and a finding — and prose that fits none of those positions is the violation | Imperative mood is a judgment about English; *a sentence with nowhere to be* is a position in a grammar the file already follows in all six entries |

### A restatement is measured before it is adopted

**A candidate restatement is run against the repository as it stands, and its output is read, before
the restatement is accepted.** A restatement whose output is mostly false positives has not
converted the invariant into a decidable one — it has renamed it, and shipping it produces a check
that fails on correct documents until someone weakens it into uselessness.

This chapter's third debt is the receipt, and it failed while this section was being written.

Chapter 0's *Vocabulary* owes a check that every canon term resolves to a Glossary entry. The
obvious restatement is that **a term of art is bolded at first use**, which the chapters appear to
do consistently. Measured against the three ratified chapters, that is false. Of 241 distinct
bolded spans, 199 open their own line — Readout rule 5's scannable left edge, or a bullet's leader —
and make no claim to be terms at all. Of the 42 that sit mid-sentence, 22 have no Glossary entry,
and not one of the 22 is a missing entry: fourteen are clause-length emphasis (*amendment is cheap*,
*a commit is not the artifact*), two are inflections of entries that exist (*gates*, *Skills*), and
the rest are emphasis or schema field names (*date*, *source*, *Type*, *state*).

**The check would report 22 violations and be wrong 22 times.** It measures a formatting character
as a proxy for a term of art — class one in this repository's index, reached while writing the
section that forbids it.

**What survives is the reverse direction, and it is worth having on its own.** Every Glossary entry's
term appears somewhere in canon: 65 of 69 today. The four that do not are informative rather than
defective — one is a surface-form variance (`Attested merge`, which canon writes as `attested`), and
three are terms minted for a chapter not yet written (`Fleet`, `Freeze`, `must-port`). That output is
a staleness signal, which Chapter 0 already assigns to the **hygiene sweep**, so it is reported and
never fails the gate.

**The forward direction is declared undecidable and routed.** It stays with Chapter 2's prose lens —
*a term used with no Glossary entry behind it* — which is where it has already worked: #37 found two
live terms with no entry behind them, by someone reading. Canon carries no marker that means *term*
and nothing else, and inventing one to make a lint possible would be the tail wagging the dog.

Two things follow, and they are the reason this failure is written down rather than quietly
corrected:

- **A restatement that fails its measurement is reported as undecidable, never shipped narrowed.**
  The tempting repair is an allowlist of the 22 false positives, which converts a check into a copy
  of the file it checks.
- **The measurement is cheap and it is the only thing that separates a restatement from a wish.**
  It cost one script and one reading here, and it caught a proxy that had already survived being
  written into a draft of the chapter that forbids proxies.

### Every check declares its blind spot

A **declared blind spot** is what a check does not reach, stated by the check itself, together with
where the residue is routed.

This is the price of the structural restatement and it is paid openly. The gate-setting check's
blind spot is exact and it is not hypothetical: **a sentence carrying a setting's meaning without
naming a gate or a value.** The check reaches every surface that names one or the other; both of the
surfaces PR #49's greps missed name neither, and both were found by someone reading. That is the
honest statement of what the check is worth, and it is worth stating because the check's green would
otherwise be read as *no document restates a gate setting* when it means *no document names one
without pointing at the declaration*.

- **A check that names what it does not cover cannot be mistaken for one that covers everything.**
  A **false green** is usually described as a property of how a check is *written*; the blind spot
  is the half that lives in how a check is *reported*, and it is the half a passing run actually
  shows a reader.
- **The residue is routed, never dropped.** It goes to Chapter 2's review lenses, to the class index
  when it recurs, and to `rules/` when its prevention can be stated as standing guidance. Chapter 2
  built that pipeline; this chapter is the first consumer that feeds it deliberately rather than
  incidentally.
- **A fully decidable check declares no blind spot,** and most do not have one. One label per axis
  is one label per axis. The declaration is required where a restatement produced the check, because
  that is exactly where the gap was created.

The rule this replaces is the tempting one: *check what you can, and don't mention the rest*. Under
it, coverage is whatever the last check happened to reach, and no artifact ever says so.

## The evidence a check ships with

### Fail-first has nothing to bite on

Chapter 0 puts **fail-first evidence** in the invariant layer: a fix ships with the test that failed
before it, so the test is known to detect the defect rather than merely known to pass. It assumes a
defect that exists before the fix.

**A check over the repository's own standing state has no such moment.** The repository already
conforms — that is why the check is being written — so the check is authored green, observed green,
and shipped without anyone ever seeing it reject anything. Fail-first is satisfied vacuously, and
the check may be incapable of failing at all.

This is not a risk being anticipated. It happened twice in this repository inside one hour:

- A derivation check comparing the lens menu against the class index passed when both sides were
  empty. It was caught only because the run happened to execute it before writing the state it
  guarded, and watched it pass on nothing ([PR #48](https://github.com/wrburgess/deuce/pull/48#issuecomment-5170293749)).
- A link verifier written for the next pull request had the identical shape: a file with no links
  reported zero checked, zero broken, green. It was written an hour after the first was catalogued,
  in a different language, for a different purpose, by the same run that had just finished writing
  the class entry for it ([PR #49](https://github.com/wrburgess/deuce/pull/49#issuecomment-5170470462)).

The second one is the argument. Awareness of the class, at maximum freshness, prevented nothing —
which is Chapter 0's case for mechanism over watchfulness, demonstrated against the very run that
was cataloguing the class.

### The deletion measurement

**A check over standing state ships with a deletion measurement:** the state the check rejects is
deliberately created, the check is watched failing on it, the state is restored, and the measurement
is recorded with the check. One per rejecting branch.

- **The empty input is always a rejecting branch.** Any check that compares two derived sets, counts
  occurrences, or verifies that every X has a Y must be measured on nothing at all, because that is
  where a derivation check fails open. Both instances above were exactly this and nothing else.
- **The empty guard belongs on the unit the check measures, not the unit it iterates.** The
  distinction is not academic: the link check written to verify this chapter's own references guards
  against being handed no *files*, and still reports green when handed a file containing no *links* —
  which is the state this chapter is in, because chapters reference internal files in backticks and
  link only outward. A guard one level up from the thing being counted is a guard that fails open on
  the case it was written for.
- **The record is the measurement, not the intent.** *What was deleted, what the check said, what
  the exit code was.* A sentence claiming a check was verified is the thing this rule exists to stop
  being sufficient.
- **This is not a second discipline.** It is fail-first evidence for checks whose subject has no
  before — same rule, applied where the obvious reading of it does nothing. Chapter 0's invariant
  layer is unchanged; what changes is what satisfying it looks like when the defect has to be
  manufactured.

The technique already has a receipt in practice rather than only in argument: three deletion
measurements were recorded against three guards on
[PR #48](https://github.com/wrburgess/deuce/pull/48#issuecomment-5170293749), one per guard, each
proving the guard failed on the state it rejects.

### One home per check

**A check has exactly one implementation.** An ad-hoc check written inside one pull request, which
duplicates a check the standard has scheduled, is a second implementation that someone has to
reconcile later — and the reconciliation is invisible work nobody is assigned.

This is already the practice: the imperative-voice check stayed a grep on
[PR #48](https://github.com/wrburgess/deuce/pull/48#issuecomment-5170293749) rather than becoming a
private lint, on exactly this reasoning, and PR #45 made the same call before it. The rule is
written here so that the two runs that made it correctly are the precedent rather than a habit.

The corollary is what a run does instead: **a one-off check is a reproduction, and it is labelled
one.** PR #49's greps were recorded as reproduction steps rather than as coverage, which is the
distinction that keeps a temporary command from being read as a standing guarantee.

## The configuration lint

The **configuration lint** is the check in the gate whose subject is this repository's own
configuration and work items. Chapter 0 names it; this chapter fixes what it owes.

**Everything the standard has promised it, in one place, so nothing is silently dropped:**

| Check | Owed by | Kind |
|---|---|---|
| Exactly one label per axis, on every issue | Ch 0 → *Work Tracking System* | Decidable as written |
| The required body sections for each issue type | Ch 0 → *Enforcement* | Decidable as written |
| No closing keyword adjacent to an epic reference, negated or not | Ch 0 → *Enforcement* | Decidable as written |
| No bare `#N` that resolves to a pull request | Ch 0 → *Enforcement* | Decidable as written |
| Every Glossary entry's term appears in canon | Ch 0 → *Vocabulary* | Reverse direction only; the forward direction is **declared undecidable** above and routed to review |
| Every `config/` declaration carries a date and a source | Ch 1 → *The adaptive layer's home* | Decidable once the schema below exists |
| Every internal link and heading anchor resolves | Epic brief on #5 | Decidable as written |
| `findings/classes.md` follows the entry grammar, and its counts match its instance lines | Ch 2 → *The findings home* | Structural restatement |
| A findings record carries the fields the Findings System requires | Ch 2 → *What this chapter does not cover* | Decidable as written |
| A gate setting's value lives only where it is defined and declared | [PR #49](https://github.com/wrburgess/deuce/pull/49#issuecomment-5170470462) | Structural restatement |

Four of these are the specific checks Chapter 0 wrote down; the rest arrived as debts from later
chapters and from two dispositions. The list is canon — it is what the standard has promised. Which
of them is built first, and in what order, is planning.

**One consequence worth stating:** the count line in each class-index entry is currently maintained
by hand, and a hand-maintained count in a second place is drift waiting to happen — the exact reason
[PR #48](https://github.com/wrburgess/deuce/pull/48#issuecomment-5170293749) removed a literal count
from a test. The lint checking the count against the instance lines is what makes the hand-written
number safe to keep.

### Parse, never pattern-match

**Structured input is read with a parser for its format.** A regular expression over structured text
decides a property of the text's surface, not of the structure — which is class one in the index,
arrived at by a different road.

- **Where the input has no parser, the answer is to give the value structure, not to write a better
  regular expression.** This is the structural restatement applied to the tooling rather than to the
  invariant, and it is why the declaration schema below exists at all.
- The live counter-example is in this repository and it is honest about itself:
  `tools/review/lenses.ts` reads the lens menu out of prose markdown with regular expressions, and
  its own drift guard mimics GitHub's heading-anchor function by hand. The pull request that wrote it
  recorded that the two functions are not the same and diverge on punctuation, and that it holds only
  because all six headings are plain words
  ([PR #48](https://github.com/wrburgess/deuce/pull/48#issuecomment-5170293749)). That is a check
  whose correctness is a property of today's data.

## The declaration schema

Chapter 1 fixed the home of the adaptive layer and its two mandatory fields, and left the file
format here. A **declaration** is one file in `config/` recording one set of adaptive values.

**The schema: machine-read fields in YAML frontmatter, reasoning in the prose body.**

- **Required frontmatter: `date` and `source`.** Exactly Chapter 1's two fields and no others. A
  field nothing reads is aspiration rather than configuration — the argument `config/models.md`
  already makes against itself, and adding fields on speculation is how a schema acquires them.
- **A value a tool reads gets a parseable home.** Where nothing reads a value, prose is correct and
  sufficient. This is deliberately not *every value moves to frontmatter*: the reasoning is most of
  what a declaration is worth, and a declaration flattened into data loses the half that made it
  auditable.
- **The body stays prose,** and keeps carrying why the value is what it is, what evidence set it,
  and when to revisit. Nothing about the existing six declarations' prose changes.
- **The dated-and-sourced check becomes decidable** the moment the two fields have a parseable
  home, which is the whole reason the schema is fixed here rather than left to each file.

Why frontmatter rather than a data file: the alternative that survives the parse rule is a
`config/*.yml` beside each `config/*.md`, and it splits one declaration across two files whose
drift nothing catches. One file, two registers, is the same split the Delivery Record already uses
for the same reason.

## Capturing the health measures

Chapter 0 fixed that all four measures are recorded once per pull request; Chapter 1 fixed the
Delivery Record as their home and left the capture here.

| Measure | Capture |
|---|---|
| **Quality** | Computed from the Verification's findings record — raised, and how many must-fix |
| **Autonomy** | Declared by the AC; HC interventions beyond the two gates are not a fact any artifact holds |
| Throughput | Computed from the tracker — issue opened to Delivery Record posted |
| Cost efficiency | **Un-instrumented.** No capture path exists |

- **A measure with no capture path says so, and is never estimated.** An estimated number enters the
  baseline and nothing afterwards distinguishes it from a measured one, which loses the baseline
  Chapter 0 says to define at birth or lose forever. Both Delivery Records written so far state cost
  efficiency as un-instrumented, which is the behaviour this rule makes canon rather than optional.
- **A computed measure is computed, not eyeballed.** Two of the four are facts the tracker and the
  Verification already hold; reading them by hand into a record is a transcription step with a
  transcription step's error rate.
- **Excellent enough applies, as Chapter 1 says:** four numbers, not a measurement program. Closing
  the cost gap is worth doing when a capture path exists and is not worth inventing one for.

## The tooling contract

ADR 0003 settled TypeScript as the runtime before any of this existed. What that means for the tools
themselves:

- **One runtime, one test runner, one type-check.** The exception ADR 0003 named — the git hooks,
  which git invokes before any toolchain is guaranteed — remains the only one.
- **A tool that gates work exits non-zero on the state it rejects, and names which state.** A crash
  and a rejection are different outcomes and a caller cannot tell them apart from an exit code
  alone. #40 is the receipt: a failed post while recording a review outcome exited unclassified, and
  the fix was to classify it rather than to catch it.
- **A check's output names the artifacts it read.** This is what makes a green claim auditable at
  all, and it is what Chapter 5 will need when a host runs a check over its own files.
- **The tools are subject to the gate they implement.** They are TypeScript in this repository,
  tested by this repository's tests, and their own checks are checks.

## What this chapter unlocks, and what it does not

| | After this chapter |
|---|---|
| The configuration lint | Sanctioned to be built, with its full debt list fixed and each check classified by whether it needs a restatement |
| The `attested` floor | Named: an independent re-run of the gate on the merge candidate. The setting is already live without it, and closing that is this chapter's first work |
| `config/` declarations | Schema fixed, so the dated-and-sourced check has something to parse |
| The two deferred checks | Both scoped — one as an entry grammar, one as a token-and-link pair with its blind spot written down |
| Chapter 0's Glossary check | Half of it: the reverse direction is built, the forward direction is declared undecidable and stays with review |
| Chapter 1's *the checks* | Resolved to a named set |
| Discovery | **Unchanged.** The gate is a floor and finds nothing new; Chapter 2's review remains the only mechanism that does |

## The adaptive layer's additions

Declarations `config/` owes when this chapter's work is built, each dated and sourced:

| Declaration | Why it is configuration |
|---|---|
| The gate's command, and the checks it runs | The set grows as checks are built; the rules above do not move when it does |
| The continuous-integration provider and its trigger | Platform-coupled, and the most volatile thing in this chapter |
| Runtime and toolchain versions | Vendor-coupled by definition |

## Founding decisions

Three decisions in this chapter clear Chapter 0's ADR bar — hard to reverse, surprising, and
carrying a real trade-off — and are recorded at ratification:

| ADR | Decision it records |
|---|---|
| 0013 | A check is written against a structural restatement of its invariant, the restatement is measured against the repository before it is adopted, and the check declares the blind spot the restatement created. A restatement that fails its measurement is declared undecidable and routed, never shipped narrowed. |
| 0014 | A check over standing state ships with a deletion measurement, because fail-first evidence is satisfied vacuously where the defect has to be manufactured. |
| 0015 | The gate is one command with one definition, re-run independently on the merge candidate; a check that cannot run locally is not in the gate. |

---

*Provenance: drafted against Chapters 0, 1 and 2, the epic brief on #5, and this repository's own
field evidence — the class index at `findings/classes.md`, and the two dispositions that deferred a
check rather than improvising it,
[PR #48](https://github.com/wrburgess/deuce/pull/48#issuecomment-5170293749) and
[PR #49](https://github.com/wrburgess/deuce/pull/49#issuecomment-5170470462). The predecessor's
`software-development-system.md`, carried in at `docs/sds-outline.md`, supplied the Testing,
Compliance and AI Config Hygiene sections as source material; its behavioral-testing bar and its
mutation spot-check are re-authored here as the deletion measurement, and its Compliance and
Config Hygiene sections are held for Chapters 4 and 6. That document is history; this chapter is
canon.*
