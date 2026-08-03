# Review configuration

The values the Review System runs on — who can be summoned and how reachability is checked, which
lenses are on the menu, how many one review carries, and how many fix waves run before the design
itself is questioned. The rules these values instantiate are canon, at
[Chapter 2](../sds/02-review-and-findings.md) → *The adaptive layer's additions*, and are not
restated here; this is adaptive configuration under
[Chapter 1](../sds/01-lifecycle-and-skills.md) → *The adaptive layer's home*.

- **Date:** 2026-08-03
- **Source:** the Direction gate on #33; the lens menu, the Direction gate on #47.

## Reviewer roster

| Reviewer | Mechanism | Response | Readiness check |
|---|---|---|---|
| **Codex CLI** (OpenAI) | Synchronous — invoked with `codex exec` | The output it returns; the summons and the returned review both land on the pull request | `codex login status` — side-effect-free |

- **Proof at declaration:** v0.146.0 installed; `codex login status` exited 0 ("Logged in using
  ChatGPT") on 2026-08-03.
- **Undeclared until proven:** GitHub Copilot review (present, review path unproven), a second
  Claude model via the Claude CLI (present, no side-effect-free auth check found), `gemini` (not
  installed). A candidate enters as a row when its readiness check has actually run.

## Lens menu

- **Six lenses**, one per class in [`findings/classes.md`](../findings/classes.md), which carries the
  admission rule and the receipts behind each
  ([Chapter 2](../sds/02-review-and-findings.md#bounded-by-lens-set-not-by-round-count) →
  *Bounded by lens set*).
- `does this check measure the invariant it claims, or a proxy for it?` — [class](../findings/classes.md#a-check-that-measures-something-other-than-the-invariant-it-claims)
- `did this fix remove or narrow something it needed to keep?` — [class](../findings/classes.md#a-fix-that-removes-or-narrows-something-it-needed-to-keep)
- `does any guard fail open or fail silent on input it did not expect?` — [class](../findings/classes.md#a-guard-that-fails-open-or-fails-silent-on-input-it-did-not-expect)
- `which path does this invariant not cover?` — [class](../findings/classes.md#an-invariant-enforced-on-one-path-and-leaking-through-another)
- `is this a restatement of content another document owns?` — [class](../findings/classes.md#restatement-of-content-another-document-owns)
- `is any statement here true only as of when it was written?` — [class](../findings/classes.md#a-statement-true-when-written-whose-condition-has-since-passed)
- Canon's own prose lenses remain canon-sourced and gated to prose subjects
  ([Chapter 2](../sds/02-review-and-findings.md#verifying-prose) → *Verifying prose*). The
  restatement lens above is this menu's, and is summonable for a code subject.

## Lens-set size

- **3 lenses**, plus the permanent lens every set carries.
- Evidence behind the number: the predecessor's scoped review converged after a single finding,
  and its lowest-value tail was rounds repeating a lens already paid
  ([ace #161](https://github.com/wrburgess/ace/issues/161)).

## Fix-verification limit

- **2 waves.** Past the second wave of defects found in fixes, the stop escalates back to Devise,
  per the chapter.
- Evidence behind the number: the predecessor's costliest defect family was symptom-level fixes
  re-opening one finding across as many as fifteen rounds
  ([ace #164](https://github.com/wrburgess/ace/issues/164)).
