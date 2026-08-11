# The accepted register

The durable list of every finding in state `accepted` — real, decided against, on the record. It is
one half of the findings home. Its contract is canon, at
[Chapter 2 → *The findings home*](../sds/02-review-and-findings.md#the-findings-home) and
[ADR 0011](../adr/0011-findings-type-state-one-way.md); stated briefly:

- **One line per `accepted` finding**, each linking the disposition that accepted it.
- **`accepted` is terminal.** New evidence never re-opens an entry here; it becomes a new finding
  that cites the old one.
- **The summons carries this file's contents**, so a kept risk is never re-litigated by a later
  review — and so a reader can find every risk this repository has knowingly kept, without an
  archaeology pass.

## Entries

- **Response fields accepted anywhere (PR #39):** validation checks that `Commit reviewed` and `Signed` are present, not that they close the response — position enforcement adds brittleness without adding trust; accepted as residual at <https://github.com/wrburgess/deuce/pull/39#issuecomment-5163451053>
- **bryce's protection verification has no assigned home (2026-08-11, #87):** `config/credentials.md` assigns branch-protection verification to "each cutover's work (#85, #86)", but #85's cutover closed 2026-08-10 without recording one, so bryce's half sits unassigned. Held rather than widened because the standing guards make it residual: no unattended run precedes the verification, and no conforming credential is minted. Accepted per the Plan's recorded risk acceptance at <https://github.com/wrburgess/deuce/issues/87#issuecomment-5259134883>
- **The `attested` green claim is unverified (2026-08-03, #53):** the Ship gate runs `attested` while no independent re-run of the quality gate exists, so the green half of every merge rests on the AC's own report of it. Knowingly held rather than reverting the gate to `required`, on the grounds that the residual is bounded and recoverable; the floor and what closes it are canon at [Chapter 3](../sds/03-quality-gate-and-tooling.md) → *The transitional state, stated plainly*, and the work is #53. Accepted by the HC at <https://github.com/wrburgess/deuce/issues/53#issuecomment-5172077943> *(Condition passed 2026-08-04: the Ship gate returned to `required` on #62 and #53 closed unplanned, so the accepted residual is dormant while `required` is in force — found by the first hygiene sweep, #74.)*

