# ADR 0003: TypeScript is the runtime for all scripts and tests

- Status: accepted
- Date: 2026-08-02

## Decision

Every script and every test deuce ships is TypeScript, from birth. There is no bash utility layer
and no second scripting runtime. The one exception is the git hooks in `.githooks/`, which git
invokes before any toolchain is guaranteed to be installed.

## Why (the trade-off that was live)

- One language for tooling and tests means one toolchain, one test runner, and typed contracts for
  the **configuration lint** (the automated check over this repository's own configuration and work
  items) — the largest piece of tooling a later chapter has to build.
- **What was given up:** the zero-install floor. Bash runs on any machine that can clone the
  repository; TypeScript forces node onto every contributor, and onto any **host** (a project
  adopting deuce) that wants to run deuce's checks.
- **The predecessor concluded the opposite** — bash as the only forced runtime
  (https://github.com/wrburgess/ace/issues/127). That analysis was sound under a constraint deuce has
  dropped: a configuration bundle that had to run under five different agents on machines the author
  did not control. Bash's reach was buying harness neutrality. With one **AC** (AI collaborator — the
  single agent that acts here) and one repository, it buys nothing, and the conclusion does not port.
- **Why decide it now:** the runtime is hard to reverse once tests exist in it, so it is settled
  while it is still free.

## Supersedes / references

- Ratified chapter: [`sds/00-identity-and-governance.md`](../sds/00-identity-and-governance.md) —
  *Founding set*, ADR 0003.
- Predecessor analysis, bound to the dropped constraint:
  https://github.com/wrburgess/ace/issues/127
- Design provenance:
  https://github.com/wrburgess/ace/blob/main/docs/superpowers/specs/2026-08-01-deuce-reboot-design.md
