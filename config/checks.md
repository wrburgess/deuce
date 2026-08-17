---
date: 2026-08-17
source: the Direction gate on #52, where Option B was chosen; the dated-and-sourced check added on #54; the four document-lint checks added at the Direction gate on #55; the tracker lint added at the Direction gate on #56, where Option A was chosen; the payload-links check added at the Direction gate on #121, where Option C was chosen
checks:
  - name: typecheck
    command: npm run typecheck
    requires: node_modules/.bin/tsc
  - name: tests
    command: npm test
  - name: dated-and-sourced
    command: npm run lint:config
  - name: links-resolve
    command: npm run lint:links
  - name: payload-links
    command: npm run lint:payload
  - name: class-grammar
    command: npm run lint:classes
  - name: gate-setting
    command: npm run lint:gates
  - name: glossary-reverse
    command: npm run lint:glossary
  - name: tracker-lint
    command: npm run lint:tracker
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

## What the document lint covers, and what it does not

The four checks under `tools/lint/` read the tracked markdown documents; each names what it read
in its own output, and the two that cannot see everything say so there too
([Chapter 3](../sds/03-quality-gate-and-tooling.md) → *Every check declares its blind spot*):

- **`links-resolve`** probes internal links and heading anchors only. External links are counted
  and never probed — the document lint runs without the network — and links carried in raw HTML are
  not read.
- **`gate-setting`** prints its declared blind spot on every run, green or red: a sentence
  carrying a setting's meaning while naming neither a gate nor a value is not reached, and the
  allowed homes are not scanned. Both restatements were measured against the repository before
  adoption, per [ADR 0013](../adr/0013-checks-restated-structurally-with-declared-blind-spots.md);
  the measurements are recorded on #55.
- **`glossary-reverse`** reports and never fails: an absent term is a staleness signal routed to
  the hygiene sweep. The forward direction is declared undecidable and stays with review
  ([Chapter 3](../sds/03-quality-gate-and-tooling.md) → *A restatement is measured before it is
  adopted*).
- **None of the four carries `requires`.** They need `commonmark` and `github-slugger`, which are
  library files, not executables — a directory or file probe would be the PR #59 defect again.
  A missing library is classified by the wiring as *could not run*, naming `bash bin/setup`.

## What the tracker lint covers, and what it does not

`tracker-lint` ([`tools/lint/tracker/run.ts`](../tools/lint/tracker/run.ts)) is the tracker-reading
half of the configuration lint ([Chapter 3](../sds/03-quality-gate-and-tooling.md) → *The
configuration lint*): five checks — label axes, body sections, epic-close adjacency, bare
references, findings-record fields — run against one snapshot fetched once, so no two checks see
different trackers.

- **It needs the network and an authenticated `gh`.** That trade was chosen at the Direction gate
  on #56: every lifecycle stage already reads the tracker, so the gate gains no dependency the work
  does not have. An unreachable tracker is **exit 2 — could not run**, loud and named, never green
  ([ADR 0015](../adr/0015-one-gate-one-command-local-and-ci.md)'s local-run bar is met whenever the
  tracker is reachable).
- **It carries no `requires`.** `gh` is a system binary, not a repository path — a path probe would
  be the PR #59 defect again. Its absence is classified by the fetch as *could not run*.
- **Its blind spots print on every run, green or red** — among them: comments are not swept by the
  grammar checks (the HC's direction on #56), and section presence is checked, never content
  quality. Every restatement was measured against the tracker before adoption, per
  [ADR 0013](../adr/0013-checks-restated-structurally-with-declared-blind-spots.md); the
  measurements are recorded on #56 and its pull request.
