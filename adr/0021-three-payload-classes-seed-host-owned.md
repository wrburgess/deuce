# ADR 0021: Three payload classes; seed is host-owned from the first copy

- Status: accepted
- Date: 2026-08-05

## Decision

**Every path that ships to a host carries exactly one of three declared classes** — *contract*,
deuce's always, updated by every sync; *seed*, the host's from the first copy, never touched again;
*host*, the host's always, never shipped, never read, never written. An undeclared path does not
ship. The classes and the one-class-per-path rule are canon; the manifest that assigns them is
dated configuration.

## Why (the trade-off that was live)

The predecessor had one class for everything. Its sync would have clobbered designed customization
— host rule accretions, trimmed skill sets, runtime ports — so the sync was rationally never
re-run, and drift compounded with no record of what had diverged
([ace #149](https://github.com/wrburgess/ace/issues/149)). The seed class's motivating case is a
check's implementation: the property it decides is the standard's, but ADR 0003 binds this
repository's runtime and not a host's, so a host on a different stack rewriting shipped tooling is
sanctioned, not drift. The host class closes the loop from the other side: everything
evidence-derived — rules, registers, the class index, every declaration — is the host's own record
and could never honestly ship (ADR 0019).

**What was given up, and it is real:** a fix to a seeded file never reaches the copies. A declared
boundary that loses upstream fixes beats an undeclared one that loses the update path itself — the
predecessor's single class lost both.

**What was considered and rejected:** a single-class payload, on the receipts above. Also
rejected: fusing this record with ADR 0020 into one what-ships decision (the ratification session
on PR #78, question 4) — they are separable, since canon could ship under a contract class with
these three classes intact, and canon could stay home with no class system at all.

## Supersedes / references

- Ratified chapter: [`sds/05-distribution.md`](../sds/05-distribution.md) — *What ships: the
  payload manifest*.
- The runtime boundary that motivates seed:
  [`adr/0003-typescript-runtime.md`](0003-typescript-runtime.md).
- The evidence boundary that motivates host:
  [`adr/0019-rules-admit-on-local-receipts-at-every-source.md`](0019-rules-admit-on-local-receipts-at-every-source.md).
- The single-class failure: [ace #149](https://github.com/wrburgess/ace/issues/149).
