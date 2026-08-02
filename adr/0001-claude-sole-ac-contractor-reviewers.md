# ADR 0001: Claude Code is the sole AC; every other model is a contractor reviewer

- Status: accepted
- Date: 2026-08-02

## Decision

Claude Code is deuce's only **AC** (AI collaborator — the agent that plans, implements, and reviews
here), and the only agent that edits, commits, or pushes. Every other model enters as a **contractor
reviewer**: summoned for one bounded review, handed its standards in the **summons** (the work order
that sends it), never acting on its own initiative. Three mechanisms carry the weight — the summons
carries the standards, `AGENTS.md` is a role boundary rather than a copy of the configuration, and a
returned review is validated against its contract when it comes back.

## Why (the trade-off that was live)

- The alternative was treating every model as a **resident** (an agent that may act on its own, and
  so must be able to discover the whole configuration). Residency is what forces one instruction file
  per tool, checks to hold those copies in sync, and a house style written down to whatever the
  weakest tool can follow. That cost is paid on every configuration change, forever.
- **What was given up:** the vendor hedge. If Claude Code degrades or its terms turn, deuce's acting
  layer has no drop-in substitute. This is a single-vendor bet, taken with eyes open.
- **What hedges it:** the standard itself stays tool-neutral, so *what* the system does survives even
  if *how* is shaped around one agent. Swapping reviewer models stays free, because their standards
  travel in the summons rather than living in the repository.
- **Why validation sits at intake:** enforcement that runs is worth more than configuration a
  contractor is trusted to have read. The git hooks make the same point — they do not care which
  agent is running.
- **Residual risk, named:** a person can open any agent here by hand and ask it to edit files. The
  role file instructs against it; the hooks are what stop it.

## Supersedes / references

- Ratified chapter: [`sds/00-identity-and-governance.md`](../sds/00-identity-and-governance.md) —
  *Who acts, who reviews*.
- Replaces the predecessor's canonical-source-plus-adapter architecture, which existed to serve
  multiple resident agents:
  https://github.com/wrburgess/ace/blob/main/docs/adr/0002-agents-md-canonical-pointer-projection.md
- Design provenance:
  https://github.com/wrburgess/ace/blob/main/docs/superpowers/specs/2026-08-01-deuce-reboot-design.md
