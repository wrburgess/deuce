# ADR 0024: Run state is disposable working memory, never authority

- Status: accepted
- Date: 2026-08-11

## Decision

A **factory pass** — one bounded traversal of the queue by the lifecycle run unattended — may keep
**run state**: work in flight inside a stage, such as a draft not yet posted, a suspended session,
or the pass's own cursor, kept so an interruption does not discard it. Run state is never
authority. Which artifacts exist on the tracker alone determines each issue's next stage at every
stage boundary; on any disagreement the artifacts win; and deleting run state costs re-doing work,
never correctness. Passes do not overlap: one runs at a time, and a trigger that fires while one is
running starts nothing.

## Why (the trade-off that was live)

- **What was given up:** the pure stateless pass, which was the draft's recommendation. A factory
  with no memory of its own can never fall out of sync with the tracker, and its kill switch needs
  no thought at all. The HC chose instead to keep mid-stage work across interruptions — hours of a
  stage that had not yet reached its terminal artifact — at the cost of a cache that must be kept
  demoted.
- **What bounds the cost:** the asymmetry. The predecessor's factory design put a second
  *authority* beside the artifacts — a board column — and thereby owed a rule for when the two
  disagreed, a rule it never wrote
  ([ace #144](https://github.com/wrburgess/ace/issues/144)). Authority is what makes a second copy
  dangerous. Working memory that cannot outrank the tracker is a cache, and the disagreement rule
  costs one clause: the artifacts win.
- **What it deliberately does not touch:** Chapter 1's rule that stages communicate only through
  terminal artifacts ([ADR 0007](0007-stages-communicate-only-through-terminal-artifacts.md)).
  Run state lives within a stage and never crosses a stage boundary, so re-entry, idempotent
  re-runs, and the free pause all stand unchanged.
- **Why it is hard to reverse:** promoting the cache to authority later — the tempting repair the
  first time a resume goes wrong — would fork truth between the tracker and the factory, and every
  consumer of the tracker's state would inherit the fork.
- **Why it is surprising:** most orchestrators make their run state authoritative by default. This
  one keeps state and deliberately makes it unable to win an argument.

## Supersedes / references

- Ratified chapter: [`sds/06-factory-automation.md`](../sds/06-factory-automation.md) — *The
  factory pass*.
- Settled at the ratification session on
  [PR #102](https://github.com/wrburgess/deuce/pull/102#issuecomment-5260387500) (Q4 and its
  refinement), reversing the draft's recommendation.
