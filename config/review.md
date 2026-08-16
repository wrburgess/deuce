---
date: 2026-08-16
source: the Direction gate on #33; the lens menu, the Direction gate on #47; the fix-verification limit and findings batching, the HC's loop-once direction on #62; machine-read values moved to frontmatter on #54; the wave's further summons added at the ratification on #129
lenses:
  - lens: does this check measure the invariant it claims, or a proxy for it?
    class: A check that measures something other than the invariant it claims
  - lens: did this fix remove or narrow something it needed to keep?
    class: A fix that removes or narrows something it needed to keep
  - lens: does any guard fail open or fail silent on input it did not expect?
    class: A guard that fails open or fails silent on input it did not expect
  - lens: which path does this invariant not cover?
    class: An invariant enforced on one path and leaking through another
  - lens: is this a restatement of content another document owns?
    class: Restatement of content another document owns
  - lens: is any statement here true only as of when it was written?
    class: A statement true when written whose condition has since passed
lens-set-size: 3
roster:
  - reviewer: Codex CLI (OpenAI)
    mechanism: codex exec
    response: the output it returns; the summons and the returned review both land on the pull request
    readiness: codex login status
---

# Review configuration

The values the Review System runs on — who can be summoned and how reachability is checked, which
lenses are on the menu, how many one review carries, and how many fix waves run before the design
itself is questioned. The rules these values instantiate are canon, at
[Chapter 2](../sds/02-review-and-findings.md) → *The adaptive layer's additions*, and are not
restated here; this is adaptive configuration under
[Chapter 1](../sds/01-lifecycle-and-skills.md) → *The adaptive layer's home*.

**The machine-read values live in the frontmatter above and nowhere else** — the roster, the lens
menu, and the lens-set size. [`tools/review/roster.ts`](../tools/review/roster.ts) and
[`tools/review/lenses.ts`](../tools/review/lenses.ts) parse them there
([Chapter 3](../sds/03-quality-gate-and-tooling.md) → *Parse, never pattern-match*); the body
carries only the reasoning behind each value.

## Reviewer roster

- **Proof at declaration:** v0.146.0 installed; `codex login status` exited 0 ("Logged in using
  ChatGPT") on 2026-08-03. The readiness check is side-effect-free, per
  [Chapter 2](../sds/02-review-and-findings.md).
- **Undeclared until proven:** GitHub Copilot review (present, review path unproven), a second
  Claude model via the Claude CLI (present, no side-effect-free auth check found), `gemini` (not
  installed). A candidate enters as a row when its readiness check has actually run.

## Lens menu

- **One lens per class** in [`findings/classes.md`](../findings/classes.md), which carries the
  admission rule and the receipts behind each
  ([Chapter 2](../sds/02-review-and-findings.md#bounded-by-lens-set-not-by-round-count) →
  *Bounded by lens set*). Each frontmatter entry pairs the lens with the class-index heading it
  derives from, verbatim; the drift guard in
  [`tools/review/lenses.test.ts`](../tools/review/lenses.test.ts) holds the two sets one to one,
  in both directions.
- Canon's own prose lenses remain canon-sourced and gated to prose subjects
  ([Chapter 2](../sds/02-review-and-findings.md#verifying-prose) → *Verifying prose*). The
  restatement lens in the menu is this menu's, and is summonable for a code subject.

## Lens-set size

- The declared size is in the frontmatter; every set also carries the permanent lens.
- Evidence behind the number: the predecessor's scoped review converged after a single finding,
  and its lowest-value tail was rounds repeating a lens already paid
  ([ace #161](https://github.com/wrburgess/ace/issues/161)).

## Fix-verification limit

- **1 wave.** One summons, one batched fix wave, verified by the AC's own fix-verification. A defect
  fix-verification finds in a fix escalates straight to Devise — there is never a second fix round.
- **The wave earns one further summons when it moved the head**, and never a second. The rule and
  every clause on it are the chapter's; what is configuration here is the number above, which the
  further summons does not change — one wave, still.
- Evidence behind the number: the predecessor's costliest defect family was symptom-level fixes
  re-opening one finding across as many as fifteen rounds
  ([ace #164](https://github.com/wrburgess/ace/issues/164)); its efficient successor workflow
  capped every review loop at one round with no exceptions, with the AC's own full-strength
  fix-verification carrying the load — the HC's direction of 2026-08-04, recorded on #62.
- **Why the never-re-summoned clause this file used to carry is gone**, dated so the reversal reads
  without archaeology: #62 set it on 2026-08-04, and the ratification on #129 narrowed it on
  2026-08-16. The measurement that admitted the change: across the pull requests here carrying a
  review commit on record, the reviewed commit differed from the merged one on 14 of 18. The
  one-round bound #62 bought is intact — the further summons cannot produce a third, because what it
  finds is never answered with code in that pull request.

## Findings batching

- **Non-urgent accepted findings batch.** A finding accepted after its pull request's wave closes
  — or surfaced outside any pull request — accumulates in the findings home and ships several to
  one `TASK:`, at the HC's cadence, never one pull request per finding. Urgency never waits, per
  [Chapter 2](../sds/02-review-and-findings.md#urgency-never-waits).
- Evidence behind the rule: five of this repository's first twenty-six commits were single-finding
  fix pull requests, each paying the full stage ceremony — the HC's direction of 2026-08-04,
  recorded on #62.
