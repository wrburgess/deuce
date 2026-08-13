---
name: execute
description: The factory orchestrator. A pass is called for; read the queue, advance what may advance by re-entry, park what must park, post the run record, end.
---

# execute — one factory pass

The packaged procedure for
[Chapter 6 → The factory pass](https://github.com/wrburgess/deuce/blob/main/sds/06-factory-automation.md#the-factory-pass). This body
carries the verbs and links the variables; the pass itself — what it may start, where its stops
route, what it does at each gate, what it must leave behind — is canon and is not restated here.

## When it is invoked

- A factory pass is called for — by the trigger [`config/factory.md`](../../../config/factory.md)
  declares, dated and sourced; absent a declared trigger, the HC's call is the trigger
  ([Chapter 6 → The transitional state](https://github.com/wrburgess/deuce/blob/main/sds/06-factory-automation.md#the-transitional-state-stated-plainly)).
- **One pass at a time.** A trigger that fires while a pass runs starts nothing
  ([Chapter 6 → The factory pass](https://github.com/wrburgess/deuce/blob/main/sds/06-factory-automation.md#the-factory-pass)).
- **No pass runs unattended until its credentials conform** to their declarations in
  [`config/credentials.md`](../../../config/credentials.md); the attended state never runs unattended
  ([Chapter 6 → The credential precondition](https://github.com/wrburgess/deuce/blob/main/sds/06-factory-automation.md#the-credential-precondition)).

## Procedure

1. **Read the pass's configuration** — the gate settings ([`config/gates.md`](../../../config/gates.md));
   the factory's declarations ([`config/factory.md`](../../../config/factory.md)): the pass scope, the
   run record's home, the lock and kill-switch paths, and the ready set's order where one is
   declared; the stage routing ([`config/models.md`](../../../config/models.md)) — **read the row for
   each stage the pass will run and record it, naming any stage that fell through to the declared
   default**
   ([Chapter 6 → Routing, consumed](https://github.com/wrburgess/deuce/blob/main/sds/06-factory-automation.md#routing-consumed)).
   Nothing dispatches on those rows yet, and the pass does not act as though something does: a
   session that does not match its row is a line in the run record, never a stop. The budget, when
   one is declared ([`config/capacity.md`](../../../config/capacity.md)).
2. **Take the pass lock** at the path [`config/factory.md`](../../../config/factory.md) declares,
   before reading the queue. A lock already held means a pass is running and **this one starts
   nothing** — canon's floor, and the collision it exists for is the HC's own call landing on a
   trigger's pass
   ([Chapter 6 → The factory pass](https://github.com/wrburgess/deuce/blob/main/sds/06-factory-automation.md#the-factory-pass)).
   A lock this pass did not take is reported with its age, **never removed** — taking it starts the
   second concurrent pass the floor forbids. Release it when the pass ends, whatever the outcome.
3. **Read the kill switch at every artifact boundary** — before each stage's Skill, before each
   park, and before the run record. Present means: start nothing further, post the run record with
   the outcome ***killed***, and end. Its path is
   [`config/factory.md`](../../../config/factory.md)'s, one act throws it, and a pass that only
   noticed at its start would keep running for hours after the HC said stop
   ([Chapter 6 → The kill switch](https://github.com/wrburgess/deuce/blob/main/sds/06-factory-automation.md#the-kill-switch)).
4. **Read the queue from the tracker.** The front door is anything `status:ready`
   ([Chapter 6 → The front door](https://github.com/wrburgess/deuce/blob/main/sds/06-factory-automation.md#the-front-door)).
   Take the set in the declared order — oldest first absent a declaration — skipping issue types the
   lifecycle does not run
   ([Chapter 1 → Binding to the Work Tracking System](https://github.com/wrburgess/deuce/blob/main/sds/01-lifecycle-and-skills.md#binding-to-the-work-tracking-system)),
   and admit up to the declared scope. What was skipped and what was left, and why, goes in the run
   record.
5. **Advance each admitted issue by re-entry.** The artifacts on the tracker alone decide its next
   stage
   ([Chapter 1 → Stages communicate only through terminal artifacts](https://github.com/wrburgess/deuce/blob/main/sds/01-lifecycle-and-skills.md#stages-communicate-only-through-terminal-artifacts));
   run state is working memory and never decides
   ([ADR 0024](https://github.com/wrburgess/deuce/blob/main/adr/0024-run-state-is-disposable-working-memory-never-authority.md)).
   Invoke that stage's Skill — [`assess`](../assess/SKILL.md), [`devise`](../devise/SKILL.md),
   [`implement`](../implement/SKILL.md), [`verify`](../verify/SKILL.md),
   [`deliver`](../deliver/SKILL.md) — and continue stage to stage as each terminal artifact posts.
   **Never a compressed path:** nobody is present to select one
   ([Chapter 6 → The factory](https://github.com/wrburgess/deuce/blob/main/sds/06-factory-automation.md#the-factory)).
6. **Park at a gate at its declared setting.** What the pass does at each setting is
   [Chapter 6 → The gates, unattended](https://github.com/wrburgess/deuce/blob/main/sds/06-factory-automation.md#the-gates-unattended).
   A parked issue keeps the status its stage set; the run record names where it waits, and the HC's
   answer is the resume — a later pass finds it through re-entry, and no other mechanism exists.
7. **Park on a stop and move on.** The question posts durably, `status:blocked` marks it, and the
   pass takes the next admitted issue
   ([Chapter 6 → Stops, routed](https://github.com/wrburgess/deuce/blob/main/sds/06-factory-automation.md#stops-routed)).
   A stop is never self-answered — the bar binds hardest with nobody watching.
8. **End on one of the four outcomes and say which** — *drained*, *parked*, *spent*, or *killed*
   ([Chapter 6 → The factory pass](https://github.com/wrburgess/deuce/blob/main/sds/06-factory-automation.md#the-factory-pass)).
   The pass scope is a declared budget in that section's sense: a pass that reaches it with
   admissible work still ready ends *spent*, and a later pass takes the remainder
   ([`config/factory.md`](../../../config/factory.md)).
9. **Post the run record at the declared home**
   ([`config/factory.md`](../../../config/factory.md)): what the pass picked up, what it advanced and
   to where, where each parked issue waits, what it skipped or left and why, and how it ended. The
   pass is not over until the record posts — a pass that ends silently cannot be told from one that
   died.

## Terminal artifact

The run record, posted at the home [`config/factory.md`](../../../config/factory.md) declares
([Chapter 6 → The factory pass](https://github.com/wrburgess/deuce/blob/main/sds/06-factory-automation.md#the-factory-pass)).

## When it stops and asks

- The pass itself stops only when an input it requires is missing or unreachable — the tracker, the
  gate settings, the factory's declarations
  ([Chapter 1 → Stops](https://github.com/wrburgess/deuce/blob/main/sds/01-lifecycle-and-skills.md#stops), trigger 4).
- A cargo issue's stop parks that issue, never the pass — step 5. The pass carries the lifecycle's
  stops; it does not add its own.

## Prior art

Re-authored as `execute` from a reading of
[ace's `ship`](https://github.com/wrburgess/ace/blob/main/skills/ship/SKILL.md), per
[Chapter 6 → The Skills disposition](https://github.com/wrburgess/deuce/blob/main/sds/06-factory-automation.md#the-skills-disposition) and
[ADR 0006](https://github.com/wrburgess/deuce/blob/main/adr/0006-skills-self-contained.md) — read and attributed, never vendored.
The name does not port: the Ship gate owns the word.
