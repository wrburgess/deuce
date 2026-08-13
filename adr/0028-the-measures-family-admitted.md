# ADR 0028: The measures family is admitted to `tools/`

- Status: accepted
- Date: 2026-08-13

## Decision

**`tools/measures/` is the fourth tool family**, admitted under the rule
[ADR 0017](0017-tools-verify-or-summon-never-do-the-work.md) fixed: a family enters only with a
decision record naming the ratified chapter that demands it. The demanding chapter is
[Chapter 3](../sds/03-quality-gate-and-tooling.md) → *Capturing the health measures*, which fixes
two of the four measures as **computed** and then says what that word costs: "a computed measure is
computed, not eyeballed. Two of the four are facts the tracker and the Verification already hold;
reading them by hand into a record is a transcription step with a transcription step's error rate."

The family carries the computation of the health measures and nothing else: reading one pull
request's thread, counting the findings the standing contractor records carry, computing the
elapsed time from the issue's opening to the record, and rendering the block the Delivery Record
carries. It is subject to the whole tooling contract
([Chapter 3](../sds/03-quality-gate-and-tooling.md) → *The tooling contract*): TypeScript, tested by
this repository's gate, classified exits, output naming what it read.

**It computes and it prints. It does not post, and it does not decide anything the Ship gate rests
on.** Rendering a number the AC pastes into an artifact the AC signs is the same shape as the
reviewer summons path: machinery that carries evidence to the place a judgment is made, never the
judgment.

## Why

ADR 0017's prohibition is on tooling with no chapter behind it, and its mechanism is that a
ratified chapter's demand, cited in a record, admits the family — the same door
[ADR 0023](0023-the-sync-family-admitted.md) walked through for the sync. Chapter 3 was ratified on
2026-08-04; its capture table names Quality and Throughput as computed, and a measure a chapter
calls computed while a person types it in is a claim the repository does not honour.

**What the research found, and it bounds this record:** only part of Quality can be computed today.
The findings-record shape the gate enforces (#56) covers the contractor's record; the AC's own
findings live in the Verification in free-form prose, and every Delivery Record to date has counted
both. Measured across all 44 Delivery Records on 2026-08-13, a Quality computed from the enforced
shape alone reproduces the recorded number on 5 of them. So this family computes the half that is
computable and renders the other half as a labeled slot — an honest partial measure, in the same
spirit as *un-instrumented*, which Chapter 3 already prefers to an estimate.

**What was considered and rejected:** a sixth check in the tracker lint that recomputes the numbers
and fails the gate on a record that disagrees. It needs a declared shape for the measures block,
and the 44 standing records carry four different shapes — so the check would start red against
records nobody is going to re-author. It was also the wrong instrument for the demand: a checked
number is still a transcribed number, and Chapter 3 asks for a computed one. Recorded at the
Direction gate on #57 as Option C, rejected there.

**What was given up, and it is real:** the fourth family is the fourth doorway, and ADR 0017's
warning is that tool-building is the AC's steepest gradient. The bound is the same one that held
for the sync — this family's charter is the paragraph above, and a fifth family will need what the
third and fourth did: a chapter, and a record like this one.

## Supersedes / references

- [ADR 0017](0017-tools-verify-or-summon-never-do-the-work.md) — the family rule this record
  satisfies; nothing in it is superseded.
- [ADR 0023](0023-the-sync-family-admitted.md) — the precedent, same door, third family.
- [Chapter 3](../sds/03-quality-gate-and-tooling.md) → *Capturing the health measures* — the
  demanding canon; [Chapter 1](../sds/01-lifecycle-and-skills.md) → *Where the health measures
  live* — the home the block is rendered for.
- The Direction gate on #57, where Option A was chosen and the family admitted with it.
