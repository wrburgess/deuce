# ADR 0007: Stages communicate only through terminal artifacts

- Status: accepted
- Date: 2026-08-02

## Decision

Every lifecycle stage ends by writing a **terminal artifact** to the tracker, and every stage begins
by reading its predecessor's artifact from the tracker. Nothing else crosses a stage boundary — not
conversational memory, not a compaction summary, not a fact passed along out of band. Every stage
transition is therefore a **context boundary**, independent of whether a **gate** (one of the two
points where the human collaborator supplies judgment) happens to sit on it.

## Why (the trade-off that was live)

- **What was given up: the fast path.** A stage that has just watched its predecessor run still
  re-reads the artifact rather than continuing on what it already knows. That is redundant work on
  every transition, paid whether or not the context was actually lost, and it forces an artifact to
  be *complete* — a stage cannot lean on something it remembers but did not write down.
- **What it buys — re-entry is a pure function of state.** Which artifacts exist determines which
  stage runs next, so re-running the lifecycle from the top is safe at any point. No resume
  mechanism has to be built, and nothing has to be kept in sync with one.
- **What it buys — a pause costs nothing.** A stop can end the session outright and the work resumes
  from the tracker, which is what makes stops cheap enough to be unconditional.
- **What it buys — approval and reset stop being the same thing.** The predecessor bound the context
  boundary to its plan-approval gate, then wanted the approval waived and the reset kept, and had to
  spend a decision record plus an amendment across roughly ten prose surfaces to separate them
  (https://github.com/wrburgess/ace/blob/main/docs/adr/0028-context-reset-boundary-resumable-stops-autonomous-listen.md).
  Making the boundary a property of *every* transition means no gate setting can ever reach it.
- **Why it is hard to reverse:** the stops, the compression rules, the `status:` advancement, and any
  later unattended orchestrator all assume it. Relaxing it once means every stage may again depend on
  something invisible, and nothing detects that until a resumed run is wrong.

## Supersedes / references

- Ratified chapter: [`sds/01-lifecycle-and-skills.md`](../sds/01-lifecycle-and-skills.md) —
  *Stages communicate only through terminal artifacts*.
- The predecessor's coupled boundary, and the amendment that pulled it apart, cited not copied:
  https://github.com/wrburgess/ace/blob/main/docs/adr/0028-context-reset-boundary-resumable-stops-autonomous-listen.md
- Evidence for the delegated-work corollary — completed work never delivered to the orchestrator:
  https://github.com/wrburgess/ace/issues/164
