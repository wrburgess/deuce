---
date: 2026-08-13
source: the Direction gate on #108, where Option A — a timer on the HC's Mac — was chosen; superseding the 2026-08-11 declaration (the Direction gate on #106) for everything but the pass scope and the record's home, which that gate set and this one leaves standing
checkout: /Users/wrburgess/Projects/aaa/deuce
kill-switch: ~/.deuce-factory-off
lock: ~/.deuce-factory-lock
log: ~/Library/Logs/deuce-factory.log
keychain-service: deuce-factory-tracker
deadline-seconds: 7200
record-home: 8
trigger:
  - mechanism: launchd
    label: com.wrburgess.deuce.factory
    weekdays: 1-5
    hour: 7
    minute: 47
---

# Factory configuration

The values a factory pass runs on — what starts one, how many issues it admits, where its run
record posts, and the one act that turns it all off. The pass itself — the front door, the order's
default, the four outcomes, what the gates do, what the kill switch must accomplish — is canon, at
[Chapter 6](../sds/06-factory-automation.md) → *The factory pass*, *The front door*, and *The kill
switch*, and is not restated here; this is adaptive configuration under
[Chapter 1](../sds/01-lifecycle-and-skills.md) → *The adaptive layer's home*.

**The machine-read values live in the frontmatter above and nowhere else** —
[`tools/factory/declaration.ts`](../tools/factory/declaration.ts) parses them there
([Chapter 3](../sds/03-quality-gate-and-tooling.md) → *Parse, never pattern-match*), and
[`tools/factory/plist.ts`](../tools/factory/plist.ts) renders the launchd agent from the same
entry. The schedule a reader sees and the schedule that fires are therefore one schedule, not two
that agree by convention. The body below carries only the reasoning behind each value.

## The trigger

- **One launchd user agent on the HC's Mac,** labelled `com.wrburgess.deuce.factory`, firing
  [`bin/factory`](../bin/factory) on weekday mornings at 07:47. Installed and removed by
  [`bin/factory-install`](../bin/factory-install), which is the only sanctioned writer of the
  installed copy.
- **Why this machine and not a hosted runner.** The reviewer Verify summons is `codex exec` under
  the HC's ChatGPT login on this Mac ([`review.md`](review.md) → the roster;
  [`credentials.md`](credentials.md) → *The reviewer's login*). A pass that reaches Verify anywhere
  else finds no reachable reviewer and stops, so a hosted trigger could never carry an issue to a
  merge-ready state — which is the whole of #8's exit test. Chosen at the Direction gate on #108
  over a scheduled hosted workflow and over a queue-watching poller.
- **Why weekday mornings.** The HC reads the tracker in the morning, so a pass that runs before
  that lands its Assessments and its parks where the day's first look already goes. One pass a day
  is also what makes an empty pass affordable: it posts a *drained* run record, which canon
  requires and which is noise only if it repeats hourly.
- **Why 07:47 and not 07:00.** An off-minute, for the same reason every scheduler's documentation
  gives: round times are where every other job on the machine already is.
- **A trigger that fires while a pass runs starts nothing** — canon's no-overlap floor
  ([Chapter 6](../sds/06-factory-automation.md) → *The factory pass*), enforced by the lock below
  and not by the schedule's spacing.
- **The trigger fires only while the Mac is awake and the HC logged in.** That is the accepted cost
  of running where the reviewer lives, recorded here rather than discovered later.

## The kill switch

- **One act: `touch ~/.deuce-factory-off`.** No new pass starts, and a pass in flight ends at its
  next artifact boundary and records itself *killed*
  ([Chapter 6](../sds/06-factory-automation.md) → *The kill switch*).
- **Both halves read the same file** — [`bin/factory`](../bin/factory) before it starts anything,
  and the pass itself at every artifact boundary
  ([`execute`](../.claude/skills/execute/SKILL.md)). Disarming the timer alone would leave a
  running pass running, which is not what canon asks for.
- **Re-arm by deleting the file.** Nothing else is required, and nothing else was disabled — which
  is the point of one act: an emergency spent on archaeology is an emergency spent badly.

## No two passes at once

- **The lock is the directory `~/.deuce-factory-lock`,** taken by an atomic `mkdir` and released
  when the pass ends. Both entry points take it: the trigger through
  [`bin/factory`](../bin/factory), and the HC's own `/execute` through the Skill's first step.
  The realistic collision is those two, not two timers.
- **A lock this pass did not take is reported, never removed.** Stealing it would start the second
  concurrent pass the floor exists to prevent. A lock left by a dead session is cleared by hand,
  with its age in the log to judge by.

## The credential, at run time

- **`keychain-service: deuce-factory-tracker`** — the login-keychain item holding the minted
  tracker token. The wrapper reads it into the pass's `GH_TOKEN` and nowhere else: never a log,
  never a file, never a command line. What that token may reach is
  [`credentials.md`](credentials.md)'s → *The tracker credential*; this line says only where the
  value sits on this machine, and the item is the HC's to create.
- **The read fails closed.** No item, an empty value, or a locked keychain — which is what a Mac
  with the HC logged out has — starts nothing and says so. A pass never falls back to whatever
  `gh` happens to hold, because that is the attended login and
  [ADR 0026](../adr/0026-unattended-passes-require-a-minted-credential.md) forbids it outright.
- **`log: ~/Library/Logs/deuce-factory.log`** — where launchd sends the wrapper's output, and the
  path a death notice cites so the HC can find the run it is about.

## The watchdog

- **`deadline-seconds: 7200`.** A pass killed at the deadline leaves no run record of its own, so
  the wrapper posts a short notice at the record's home instead. Why it exists at all: an
  unattended pass that ends silently cannot be told from one that died
  ([Chapter 6](../sds/06-factory-automation.md) → *The factory pass*), and a hang is exactly that
  state — the documented one being a commit signer invoked with nobody to answer it.
- The number is two hours because no pass has ever been measured; the first several passes are the
  measurement, and a re-declaration here is one dated edit.

## Pass scope

- **One issue per pass,** unchanged from the 2026-08-11 declaration and re-affirmed at the
  Direction gate on #108: the arming work does not also loosen the bound it was armed under.
- **The scope is a declared budget in [Chapter 6](../sds/06-factory-automation.md) → *The factory
  pass*'s sense.** A pass that reaches it with admissible work still ready ends ***spent*** — the
  truthful outcome for a bounded pass that ran out of bound rather than out of queue — and a later
  pass takes the remainder. Fixed at the review wave on PR #114.

## The run record's home

- **A comment on #8, while that epic is open** — unchanged. Judging a durable home against real
  records was #108's to do; three records in, the epic thread is still where they belong, and the
  question moves to the first pass that runs after #8 closes.

## What is deliberately not declared

- **The ready set's order** — canon's default, oldest first, governs
  ([Chapter 6](../sds/06-factory-automation.md) → *The front door*). Two attended passes and the
  arming pass have all wanted it; a declaration lands here the day one does not.
- **The unattended budget** — [`capacity.md`](capacity.md)'s number, unrationed today; the pass
  runs unbudgeted exactly as attended work does
  ([Chapter 6](../sds/06-factory-automation.md) → *The credential precondition*). The pass scope is
  the only bound in force.
- **A read-back check on the installed agent** — the installed plist can be edited by hand and
  drift from the declaration above. Re-running `bin/factory-install` is the fix, and a check that
  reads the agent back is deliberately not built for a fleet of one machine.
