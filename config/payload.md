---
date: 2026-08-12
source: the Direction gate on #115 — the Skills moved to the tool's own path; superseding the Direction gate on #81, where Option A — contract-forward — was chosen
payload:
  - path: .claude/skills/assess/SKILL.md
    class: contract
    system: lifecycle
  - path: .claude/skills/devise/SKILL.md
    class: contract
    system: lifecycle
  - path: .claude/skills/implement/SKILL.md
    class: contract
    system: lifecycle
  - path: .claude/skills/verify/SKILL.md
    class: contract
    system: lifecycle
  - path: .claude/skills/deliver/SKILL.md
    class: contract
    system: lifecycle
  - path: .claude/skills/distill/SKILL.md
    class: contract
    system: lifecycle
  - path: .githooks/guard-protected-branch
    class: contract
    system: governance
  - path: .githooks/pre-commit
    class: contract
    system: governance
  - path: .githooks/pre-push
    class: contract
    system: governance
  - path: .github/ISSUE_TEMPLATE/bug.yml
    class: contract
    system: tracking
  - path: .github/ISSUE_TEMPLATE/chore.yml
    class: contract
    system: tracking
  - path: .github/ISSUE_TEMPLATE/config.yml
    class: contract
    system: tracking
  - path: .github/ISSUE_TEMPLATE/epic.yml
    class: contract
    system: tracking
  - path: .github/ISSUE_TEMPLATE/spike.yml
    class: contract
    system: tracking
  - path: .github/ISSUE_TEMPLATE/task.yml
    class: contract
    system: tracking
  - path: AGENTS.md
    class: contract
    system: review
  - path: tools/gate/run.ts
    class: seed
    system: gate
  - path: tools/gate/gate.ts
    class: seed
    system: gate
  - path: tools/gate/gate.test.ts
    class: seed
    system: gate
  - path: tools/gate/declaration.ts
    class: seed
    system: gate
  - path: tools/gate/declaration.test.ts
    class: seed
    system: gate
  - path: tools/gate/executable.ts
    class: seed
    system: gate
  - path: tools/gate/executable.test.ts
    class: seed
    system: gate
  - path: tools/review/compose.ts
    class: seed
    system: review
  - path: tools/review/compose.test.ts
    class: seed
    system: review
  - path: tools/review/dispatch.ts
    class: seed
    system: review
  - path: tools/review/dispatch.test.ts
    class: seed
    system: review
  - path: tools/review/lenses.ts
    class: seed
    system: review
  - path: tools/review/lenses.test.ts
    class: seed
    system: review
  - path: tools/review/record.ts
    class: seed
    system: review
  - path: tools/review/record.test.ts
    class: seed
    system: review
  - path: tools/review/roster.ts
    class: seed
    system: review
  - path: tools/review/roster.test.ts
    class: seed
    system: review
  - path: tools/review/summon.ts
    class: seed
    system: review
  - path: tools/review/validate.ts
    class: seed
    system: review
  - path: tools/review/validate.test.ts
    class: seed
    system: review
  - path: package.json
    class: seed
    system: all
  - path: package-lock.json
    class: seed
    system: all
  - path: tsconfig.json
    class: seed
    system: all
  - path: .gitignore
    class: seed
    system: all
  - path: bin/setup
    class: seed
    system: all
  - path: labels.yml
    class: seed
    system: tracking
  - path: config/
    class: host
    system: all
  - path: rules/
    class: host
    system: all
  - path: findings/
    class: host
    system: all
  - path: CLAUDE.md
    class: host
    system: all
---

# The payload manifest

What ships to a host, path by path, and the class each path carries. The three classes, the
one-class-per-path rule, and the rule that an undeclared path does not ship are canon, at
[Chapter 5](../sds/05-distribution.md) → *What ships: the payload manifest* and
[ADR 0021](../adr/0021-three-payload-classes-seed-host-owned.md); this file is adaptive
configuration under [Chapter 1](../sds/01-lifecycle-and-skills.md) → *The adaptive layer's home*,
and only assigns the classes.

The frontmatter is the machine half: one item per path, each carrying `path`, `class`, and
`system`, conforming to the frontmatter line grammar
[`tools/gate/declaration.ts`](../tools/gate/declaration.ts) defines — scalars plus one flat list
of scalar-field items — so the sync (#82) and the configuration lint (#55) can reuse that grammar
with their own closed key vocabulary rather than grow a new format. `parseDeclaration` itself is
`config/checks.md`'s reader and refuses any other key, by design; a reader of this file is new
work, and both readers are chartered: at this declaration's date nothing reads the frontmatter
yet, the sync reads the manifest and never the reverse, which is the order Chapter 5 requires.

The `system` field records which system a path belongs to, because Chapter 0 lets a host take one
system without the rest. `all` marks a path every selection includes: a sync selecting system
S ships the paths of S plus the paths of `all`, which is what keeps a selected system runnable —
the tools are nothing without their runtime scaffolding, and setup serves every adoption. On host
entries `all` says the boundary holds for every adoption. Selection semantics beyond that —
ordering, per-host subsets, anything conditional — are the sync's to define (#82); this file only
guarantees that S plus `all` is the whole of what S *ships* under this repository's stack. What
remains is the host's own to write — its `config/` declarations, per the host class below: an
adopted gate runs on the host's `config/checks.md`, never on a shipped copy of deuce's.

## Contract — deuce's, updated on every sync

The sorting test, answered yes: these are the paths deuce must be able to fix everywhere at once.

- **The six Skills** (`.claude/skills/*/SKILL.md`, system `lifecycle`) — the operating procedure itself. A
  Skill links canon and never restates it, so a Skill fix is a procedure fix, and a host running a
  stale procedure is the drift that matters most.
- **The git hooks** (`.githooks/*`, system `governance`) — the enforcement of a floor:
  feature branches only, `main` protected. Plain bash with no runtime to bind, so the ADR 0003
  argument that seeds the tools does not reach them. A fix here is a floor's enforcement repaired,
  and it must reach every host.
- **The issue templates** (`.github/ISSUE_TEMPLATE/*`, system `tracking`) — they transcribe
  Chapter 0's fields and never originate one, so when the Work Tracking System amends, the
  transcription must follow everywhere at once.
- **`AGENTS.md`** (system `review`) — the reviewer boundary. Its terms are Chapter 2's, and a host
  summoning a contractor reviewer must hand it the same contract this repository does.

## Seed — the host's, from the first copy

The chapter's priced trade, taken with eyes open: a fix to a seeded file never reaches the copies,
and a declared boundary that loses upstream fixes beats an undeclared one that loses the update
path itself.

- **The tools** (`tools/gate/*`, `tools/review/*`, systems `gate` and `review`) — the chapter's
  motivating seed case verbatim: the properties they decide are the standard's, but ADR 0003 binds
  this repository's runtime and not a host's, so a host on a different stack rewrites them in its
  own — sanctioned, not drift. The tests travel with the implementations they test.
- **The runtime scaffolding** (`package.json`, `package-lock.json`, `tsconfig.json`, `.gitignore`,
  system `all`) — it exists to run the tools, so it is classed with them and travels with every
  selection: a gate without its toolchain declaration is not the gate. Seed means the host
  regenerates the lockfile as its own from day one.
- **`bin/setup`** (system `all`) — it installs the hooks, which are contract, but it also installs
  the toolchain (`npm install`), which is stack-bound. One class per path, and the stack binding
  decides it: a host not on Node rewrites setup, and must not have its rewrite clobbered. It is
  `all` because every adoption, whatever the subset, needs its installer.
- **`labels.yml`** (system `tracking`) — the `type:` and `status:` axes are the standard's, but the
  `area:` axis is per-project by design, so every host rewrites this file on day one. Classing it
  contract would put permanent drift on the same file at every host, and a drift report that always
  cries teaches its readers to ignore it.

## Host — the host's, never shipped

Named so the boundary is written down rather than discovered. Everything evidence-derived is host
class by construction: these are the repository's own record, and shipping deuce's would hand a
host conclusions its record never earned.

- **`config/`** — a host's declarations are its own tuning, dated and sourced from its own gates.
- **`rules/`** — born empty and grown on the host's own receipts at every source (ADR 0019),
  exactly as this repository's was.
- **`findings/`** — the registers and the class index are the host's evidence, nobody else's.
- **`CLAUDE.md`** — the host's entry point. This repository's carries deuce-only content (its
  bootstrap status among it), so the host writes its own; a starter template can earn a place in
  the seed class if a cutover shows the need.

## Absent by design

Canon — `sds/`, `adr/`, `GLOSSARY.md` — is not in this manifest at all, in any class: it never
ships and is read at its source, cited by URL at the citable tags
([ADR 0020](../adr/0020-canon-never-ships.md)). Listing it even as host would imply it was
sortable. `README.md`, `LICENSE`, and `docs/` are this repository's own furniture and are absent
for the same reason the host class exists: they were never part of what a host adopts.
