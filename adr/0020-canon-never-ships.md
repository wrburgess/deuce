# ADR 0020: Canon never ships

- Status: accepted
- Date: 2026-08-05

## Decision

**Canon — the chapters, the decision records, the Glossary — is never vendored to a host.** The
standard is read at its source and cited by URL; only what must run locally ships, and the payload
manifest declares it path by path. Chapter 0 fixed this rule for upstream decision records; this
record extends it to the whole of canon.

## Why (the trade-off that was live)

The predecessor vendored its documents into its first host. Both repositories went on numbering
their records, and the two live sets collided — records 0025 through 0033 exist twice with
different content, permanently ([ace #149](https://github.com/wrburgess/ace/issues/149)). A second
copy of a standard is a copy that drifts, and re-syncing the copied documents was structurally
unsafe from the day the collision existed. Nothing new was needed to avoid all of it: a host's
Skills already link canon by URL (Chapter 1 — a Skill never restates canon; it links the chapter),
and a link needs no sync.

**What was given up, and it is real:** reading the standard means leaving the host's repository,
and deuce's public availability becomes a standing dependency of every host. The mitigations are
Chapter 0's own machinery — the repository is public from birth, ratification tags make each state
citable, the archive rule keeps old URLs meaning what they meant, and the vendoring receipt's
commit makes a host's citation exact. Offline and air-gapped hosts are unserved; none exists, and
if one ever does the answer is an amendment then, not a hedge now (settled at the ratification
session on PR #78, question 1).

**What was considered and rejected:** shipping canon as a read-only, checksum-guarded contract
class — it closes the offline gap but reintroduces a second copy, stale between syncs, plus payload
and reconcile noise on every canon edit. Also rejected: pinning host links to the receipt's tagged
state rather than head — exactness bought with link-rewriting machinery in the sync, when the
receipt already records the commit for any host that needs the as-vendored reading.

## Supersedes / references

- Ratified chapter: [`sds/05-distribution.md`](../sds/05-distribution.md) — *What ships: the
  payload manifest*.
- The rule this extends:
  [`sds/00-identity-and-governance.md`](../sds/00-identity-and-governance.md) — *Decision records*,
  cited by URL and never copied in.
- The link discipline that makes it free:
  [`sds/01-lifecycle-and-skills.md`](../sds/01-lifecycle-and-skills.md) — *Skills*.
- The collision receipt: [ace #149](https://github.com/wrburgess/ace/issues/149).
