# ADR 0012: Triage sits outside the lifecycle, and its product is subtractive

- Status: accepted
- Date: 2026-08-03

## Decision

The **triage pass** — how deferred findings drain — is not a lifecycle stage and is attached to no
boundary between units of work. It runs when the HC calls it, is interruptible, blocks nothing, and
has no schedule. Its product is subtractive: eliminations with evidence — already fixed,
superseded, duplicate, unreachable — plus the survivors, never a ranking of everything. The AC
eliminates only what it can attach a re-runnable check to, one command the HC can run to confirm
the row; everything else it proposes, and the HC decides. The product lands on the tracker, not in
a message.

## Why (the trade-off that was live)

- **What was given up: a guaranteed drain cadence.** Nothing forces the pass to run, so the
  deferred pile can sit. That is accepted on the evidence that urgency never enters the pile —
  defects are fixed or promoted immediately, and only judgment waits — so what sits is, by
  construction, what can afford to.
- **Why no schedule:** a pass that must be scheduled to happen is one whose real obstacle is cost.
  The predecessor's obstacle was exactly that — a log too large to read in one sitting, with no
  field to record a decision in — and no cadence fixes an unreadable log. State plus a short index
  removes the cost, after which *when the HC calls it* is sufficient
  (https://github.com/wrburgess/ace/issues/161).
- **Why outside the lifecycle:** every stage is scoped to one issue or one pull request, and triage
  is cross-cutting by nature. Attaching it to an invented boundary is the seam this standard has
  already paid for once — the predecessor's straddling step cost a decision record to patch, and
  ADR 0009 exists because of it.
- **Why subtractive:** a pass that returns every item ranked has delegated nothing — the HC still
  reads every item. Eliminations remove the reading, which is the entire value of delegating
  disposition. The re-runnable-check boundary is the lifecycle's own line between mechanical fact
  and judgment, applied to elimination: reachability, staleness, and duplication are checkable;
  worth is not.
- **Why it is hard to reverse:** the stage count is load-bearing — `status:` advancement, the
  compression table, and any later orchestrator index on five stages (ADR 0009's argument, which
  adding a triage stage would re-open). And a scheduled ceremony, once created, acquires attendees
  and is never unscheduled; starting without one is cheap, adding one later is still possible.

## Supersedes / references

- Ratified chapter: [`sds/02-review-and-findings.md`](../sds/02-review-and-findings.md) —
  *The triage pass*.
- Precedent for refusing the invented boundary:
  [`adr/0009`](0009-review-response-folded-into-verify.md).
- The predecessor's zero-triage receipt and the subtractive design, cited not copied:
  https://github.com/wrburgess/ace/issues/161
