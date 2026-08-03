# Review configuration

The values the Review System runs on — who can be summoned and how reachability is checked, which
lenses are on the menu, how many one review carries, and how many fix waves run before the design
itself is questioned. The rules these values instantiate are canon, at
[Chapter 2](../sds/02-review-and-findings.md) → *The adaptive layer's additions*, and are not
restated here; this is adaptive configuration under
[Chapter 1](../sds/01-lifecycle-and-skills.md) → *The adaptive layer's home*.

- **Date:** 2026-08-03
- **Source:** the Direction gate on #33.

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

- **Empty — zero lenses.** The menu derives from this repository's own class index
  ([Chapter 2](../sds/02-review-and-findings.md#bounded-by-lens-set-not-by-round-count) →
  *Bounded by lens set*), and [`findings/classes.md`](../findings/classes.md) holds no entries yet.
- An empty menu strands no canon pull request: canon itself names the lenses fit for prose
  subjects ([Chapter 2](../sds/02-review-and-findings.md#verifying-prose) → *Verifying prose*).

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
