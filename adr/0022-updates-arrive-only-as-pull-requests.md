# ADR 0022: Updates arrive only as pull requests on the host

- Status: accepted
- Date: 2026-08-05

## Decision

**The only path by which anything from deuce reaches a host is a pull request on that host,
judged by the host's own gates.** There is no direct push at any severity, and no emergency path.
This is Chapter 0's trust boundary applied in the second direction: to a host, deuce is upstream,
and upstream gets review at adoption and again at every change.

## Why (the trade-off that was live)

An emergency path is a standing bypass of every host's gates that sits armed, waiting for someone
to call something an emergency — and the caller's incentive at that moment is always speed. Push
rights would also make deuce an acting agent inside repositories it does not govern, which is the
floor deuce keeps for itself — never on one's own say-so — refused at fleet scale. And a standard
that demands push rights over its adopters is a standard strangers cannot adopt.

**What was given up, and it is real:** propagation runs at review speed. A critical fix lands host
by host, as each host's Ship gate passes it, and the fleet-wide exposure window is the slowest
host's review latency. The mitigation is that delivery and landing are separate: nothing stops the
sync from opening the fix pull request on every host at once — only the merge gates the landing.

**What was considered and rejected:** a security-severity carve-out above which deuce pushes
directly (the ratification session on PR #78, question 2) — rejected as the bypass described
above. Also declined: requiring the sync report to carry the change's severity — kept out of canon
to keep the rule plain; a report may carry it, but nothing requires it.

## Supersedes / references

- Ratified chapter: [`sds/05-distribution.md`](../sds/05-distribution.md) — *The sync: updates
  arrive as pull requests*.
- The boundary applied:
  [`sds/00-identity-and-governance.md`](../sds/00-identity-and-governance.md) — *Trust boundary*
  and *Merge authority*.
- The floor-written-early precedent:
  [`adr/0005-merge-authority-graduated-from-birth.md`](0005-merge-authority-graduated-from-birth.md).
