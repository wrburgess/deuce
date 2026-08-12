# ADR 0027: The Skills live at the AC's tool's own path

- Status: accepted
- Date: 2026-08-12

## Decision

The Skills live at `.claude/skills/<name>/SKILL.md` — the directory the AC's tool reads on its
own — and that path is the standard's path, written in [Chapter 1](../sds/01-lifecycle-and-skills.md)
→ *Skills*. There is one copy, at the one reader's own location. The payload manifest ships the
lifecycle Skills at the same path, so a host's AC finds them the same way.

## Why (the trade-off that was live)

The Skills sat at `skills/`, correct in format and invisible in practice: the tool's discovery
never looked there, so no Skill could be invoked by name — found only by a reader who happened to
list the repository. Measured on #115, three fresh sessions, one variable: with the tool's path
present, all eight Skills found by name; without it, none.

- **What was given up:** the tool-neutral top-level directory, and with it the symlink option — a
  `.claude/skills` pointer at the old files, proven working in the same tests. The pointer was
  refused because its only purpose is one tool's benefit while leaving two paths for one thing:
  precisely the shape *no per-tool shims* exists to forbid. Plugin packaging was refused as a
  second artifact to version.
- **What was kept:** the no-shims rule, read at its reason. The rule forbids a second copy that
  drifts, or an adapter kept for a tool's sake. One AC means one reader (Chapter 0, *Who acts*) —
  and one copy relocated to that reader's native path is the rule followed to its conclusion, not
  an exception to it. A dot-directory is not a neutrality loss when there is no second tool to be
  neutral toward; the standard already bends to this tool by name where it matters
  ([Chapter 1](../sds/01-lifecycle-and-skills.md) → *The audit*: `devise` over `plan`, and `brief`
  over `status` on #96, both renamed around the tool's reserved commands).

## Consequences

- A Skill added under `.claude/skills/` is invocable by name the moment it lands; nothing else is
  wired. The claim is behavioral, not structural — held by the receipts on #115 and PR #118, true
  of the tool as of 2026-08-12. A tool release that changes discovery is field input, entering
  through the Findings System (Chapter 4); while broken, the Skills remain what they always were —
  readable documents at a stable path. A Skill placed anywhere else is a document, and its absence
  from discovery is a defect.
- The fleet inherits the path: hosts receive the lifecycle Skills where their AC reads them. The
  move exposed that the sync never retires a path the manifest stopped naming — and the receipt
  drops a retired path's entry, so a stranded copy sits with no drift signal. #117 carries the
  retirement; until it lands, `config/sync.md` holds all sync dispatch (PR #118's review,
  finding 3).
- Tracked content now lives under `.claude/`, so `.gitignore` excludes `.claude/worktrees/` —
  session worktrees must never ride into a commit on the directory's coattails.
- If a second AC tool ever enters, the premise above ("one reader") is void and this record is the
  first thing to revisit.
