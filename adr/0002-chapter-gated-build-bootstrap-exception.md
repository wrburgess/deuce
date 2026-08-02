# ADR 0002: The build is chapter-gated, with a bounded bootstrap exception

- Status: accepted
- Date: 2026-08-02

## Decision

The **SDS** (deuce's written standard) is ratified one **chapter** at a time, and nothing exists in
deuce that a ratified chapter does not already sanction. One exception is stated and bounded: the
**bootstrap exception**, covering deuce's first commits — this chapter and the repository
configuration it unlocks — which predate the lifecycle, review, and quality systems that would
otherwise govern them. The exception reaches only work whose governor does not yet exist, and it
ends in stages as each governor is ratified.

## Why (the trade-off that was live)

- The alternative was building first and writing the standard around whatever got built. That is how
  the predecessor accreted a configuration nobody could hold in one head, with decision records that
  restated each other.
- **What was given up:** speed at the start. Nothing may be built until the chapter sanctioning it is
  drafted, argued in a ratification session, and merged — so the repository sits nearly empty while
  its governing text is written.
- **What it buys:** every artifact traces to a sanction, so re-accretion has no path in. The ordering
  rule is also what makes the standard testable: a chapter is proven by building against it.
- **Its counterweight:** amendment is cheap. Whatever construction disproves is amended in a later
  chapter rather than worked around in silence, so the gate does not have to be right the first time.
- **Why the exception is written down:** a stated exception can be audited. A silent one becomes a
  precedent, and the next unsanctioned thing cites it.

## Supersedes / references

- Ratified chapter: [`sds/00-identity-and-governance.md`](../sds/00-identity-and-governance.md) —
  *The bootstrap exception* and *Ratification*.
- Design provenance:
  https://github.com/wrburgess/ace/blob/main/docs/superpowers/specs/2026-08-01-deuce-reboot-design.md
