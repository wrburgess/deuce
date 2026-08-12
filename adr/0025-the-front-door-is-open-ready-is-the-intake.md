# ADR 0025: The front door is open — ready is the factory's whole intake

- Status: accepted
- Date: 2026-08-11

## Decision

The factory may start anything `status:ready`. There is no second admission act: the label already
means the work can start, and the factory adds no door of its own. The bound is who can say ready —
on the platform, labels move only under triage permission, so ready-ness is the HC's and the AC's
to confer and nobody else's. The order the factory takes the ready set in is adaptive
configuration; absent a declaration, oldest first. Chapter 0's one open revisit — a priority
signal returns only if automation needs it in machine-readable form — is disposed: automation
needs an *order*, not a priority axis, and the HC's pointing act survives as reordering.

## Why (the trade-off that was live)

- **What was given up:** the explicit admission act, which was the draft's recommendation — a
  durable HC gesture per issue, so the factory would only ever work what the HC had named. With it
  went a second door to define, carry in configuration, and keep consistent with the label that
  already exists.
- **The cost accepted, stated plainly:** whatever can set `status:ready` steers the factory. The
  predecessor's factory epic called the open front door a different risk posture and left the
  question unresolved ([ace #144](https://github.com/wrburgess/ace/issues/144)). The HC resolved
  it: open — because the door was never the boundary. The label is, and the label is
  permission-gated by the platform.
- **Why it is hard to reverse:** the intake's shape decides what every trigger, every declaration,
  and every host's adoption of the factory reads as *the queue*. Narrowing it later would demote a
  label whose meaning every issue already carries.
- **Why it is surprising:** the predecessor flagged exactly this as the risk to avoid, and the
  draft recommended refusing it as a setting. The decision runs the other way, on the argument
  that a second admission act is a second copy of a judgment the label already records.

## Supersedes / references

- Ratified chapter: [`sds/06-factory-automation.md`](../sds/06-factory-automation.md) — *The front
  door*.
- Chapter 0's priority revisit, disposed:
  [`sds/00-identity-and-governance.md`](../sds/00-identity-and-governance.md) — *Work Tracking
  System*.
- Settled at the ratification session on
  [PR #102](https://github.com/wrburgess/deuce/pull/102#issuecomment-5260387500) (Q2 and its
  refinement), reversing the draft's recommendation.
