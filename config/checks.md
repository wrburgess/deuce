---
date: 2026-08-03
source: the Direction gate on #52, where Option B was chosen; the dated-and-sourced check added on #54
checks:
  - name: typecheck
    command: npm run typecheck
    requires: node_modules/.bin/tsc
  - name: tests
    command: npm test
  - name: dated-and-sourced
    command: npm run lint:config
---

# The quality gate

What the gate runs, and in what order. The rules these values instantiate are canon, at
[Chapter 3](../sds/03-quality-gate-and-tooling.md) → *The quality gate* and
[ADR 0015](../adr/0015-one-gate-one-command-local-and-ci.md), and are not restated here; this is
adaptive configuration under [Chapter 1](../sds/01-lifecycle-and-skills.md) → *The adaptive layer's
home*.

## Declaration

- **The gate is `npm run gate`.** The frontmatter above is its only contents.
  [`tools/gate/run.ts`](../tools/gate/run.ts) executes what is declared there and nothing else, in
  the order declared, so the list a reader sees and the list that runs are the same list rather than
  two that agree by convention.
- **A check joins the gate by being added above.** There is no second place to edit, which is the
  whole of [ADR 0015](../adr/0015-one-gate-one-command-local-and-ci.md)'s *one definition*.
- **Ordering is deliberate:** `typecheck` runs first, because a type error makes the test run's
  output noise rather than signal.

## Fields

| Field | Meaning |
|---|---|
| `name` | What the check is called in the gate's report |
| `command` | Executed as tokens, never through a shell — a command carrying a shell metacharacter is refused before anything runs |
| `requires` | The path the check actually needs — the executable itself, never a directory that usually contains it. Absent means the check needs nothing but the repository |

## Why `requires` reports rather than repairs

`typecheck` needs `tsc`, which arrives with `node_modules`, which is gitignored — so a fresh clone
or a new worktree has no typechecker. That state is reported by name, with `bash bin/setup` as the
fix, and **the gate never installs it**.

`requires` names `node_modules/.bin/tsc` and not `node_modules`, because the directory is a proxy
for the toolchain and not the toolchain. Measured on
[PR #59](https://github.com/wrburgess/deuce/pull/59): with `node_modules` present and `tsc` removed,
the directory probe passed, `npm run typecheck` exited 127, and the gate reported **exit 1 — a check
failed** when the truth was that the gate could not run. Raised by the contractor review under the
lens *does this check measure the invariant it claims, or a proxy for it?*

[Chapter 2](../sds/02-review-and-findings.md) defines the readiness check as side-effect-free for
the same reason: a gate that repairs the tree it is measuring is measuring something else, and its
green stops meaning what it says. The receipt is
[PR #51](https://github.com/wrburgess/deuce/pull/51), where `npm run typecheck` reported
`tsc: command not found` in a fresh worktree and the run had to notice by hand.

## What the prerequisite probe does not reach

`requires` is checked by [`tools/gate/executable.ts`](../tools/gate/executable.ts), and that check
has a **declared blind spot** ([Chapter 3](../sds/03-quality-gate-and-tooling.md) → *Every check
declares its blind spot*).

| Reached | Not reached |
|---|---|
| Missing path · dangling symlink · directory · present file without execute permission | A file that is executable and still cannot run — wrong binary format, or a shebang naming an absent interpreter |

Nothing short of executing a file decides the second column, so no probe closes it and a deeper one
would only move the proxy. The residue is not misclassified: such a prerequisite passes resolution,
the spawn fails, and the gate records that check `could-not-run`, the rest `not-attempted`, and
exits 2. What is lost is only the resolve-everything-before-executing property, for that one case.

## What the dated-and-sourced check does not reach

`dated-and-sourced` ([`tools/config/run.ts`](../tools/config/run.ts)) decides **presence and
shape, never truth** ([Chapter 3](../sds/03-quality-gate-and-tooling.md) → *Every check declares
its blind spot*): a stale date, a source naming the wrong decision, and an impossible calendar
date of valid shape all pass. The residue is routed to the hygiene sweep, which is what
re-verifies `config/` ([Chapter 1](../sds/01-lifecycle-and-skills.md) → *The adaptive layer's
home*) — never dropped.

## What is not here yet

The checks [Chapter 3](../sds/03-quality-gate-and-tooling.md) → *The configuration lint* owes are
tracked under #55 and #56, and they join this list as they are built. This file growing is the
intended mechanism, not evidence it was declared too small.
