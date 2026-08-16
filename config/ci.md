---
date: 2026-08-16
source: the Direction gate on #126, where Option B — the whole gate in continuous integration, blocking the merge — was chosen; the runner was permitted to be software at the distill sitting on #127, recorded at ADR 0029; the enforcement row moved to in force when the HC applied the protection setting on 2026-08-16, deferred there and folded in on #129
---

# Continuous integration

Who re-runs the quality gate, on what, and with which versions. The rule these values instantiate is
canon, at [Chapter 3](../sds/03-quality-gate-and-tooling.md) → *One definition, two runners* and
[ADR 0015](../adr/0015-one-gate-one-command-local-and-ci.md), and is not restated here; this is
adaptive configuration under [Chapter 1](../sds/01-lifecycle-and-skills.md) → *The adaptive layer's
home*. It carries two of the three declarations
[Chapter 3](../sds/03-quality-gate-and-tooling.md#the-adaptive-layers-additions) says this chapter's
work owes — the continuous-integration provider and its trigger, and the runtime and toolchain
versions. The third, the gate's command and its checks, is [`checks.md`](checks.md)'s and stays
there.

## Declaration

| Value | As in force |
|---|---|
| Provider | GitHub Actions |
| Workflow | [`.github/workflows/gate.yml`](../.github/workflows/gate.yml) |
| Triggers | `pull_request` on any branch, and `push` restricted to `main` |
| Runner image | `ubuntu-latest` |
| Node version | The `26` major line |
| Install | `bash bin/setup` — the repository's one installer |
| Gate command | `npm run gate` — and nothing else |
| Check context | `gate`, the job's id and name |
| Merge enforcement | **In force since 2026-08-16.** Branch protection on `main` requires the `gate` context **and requires the branch to be up to date with `main` before merging** (`strict`). A red or missing verdict blocks the merge; it no longer merely reports |

- **The workflow enumerates no checks.** It invokes the one command;
  [`checks.md`](checks.md) stays the only place a check joins the gate.
  [`tools/gate/workflow.test.ts`](../tools/gate/workflow.test.ts) holds it to that mechanically,
  along with the read-only grant and the pull-request trigger, so all three are enforced rather than
  asserted here.
- **Why the major line rather than an exact patch.** The gate's TypeScript runs on node's own type
  stripping, so the floor is a major version, not a patch. Pinning the patch would make every
  upstream security release an edit to this repository, and would pin CI to a version the AC's
  machine has already moved past. The line in force is recorded above; the day a patch-level
  behavior matters, this row narrows in one dated edit.
- **Why `bash bin/setup` rather than a lockfile-exact install.** It is the same command a fresh
  clone runs, so *how the toolchain arrives* has one definition too. Its `npm install` honors the
  tracked lockfile while that lockfile is in sync, and it is not the same guarantee `npm ci` gives.
  Tightening it is a change to [`bin/setup`](../bin/setup) — reaching local runs as well — and not a
  divergence introduced quietly on the CI side.
- **Why both triggers.** The pull-request event reads GitHub's test merge of the branch into its
  base, which is the merge candidate. The push event reads the merged history, which catches a
  change that was green alone and is not green against a base that moved while it waited.
- **Why the up-to-date requirement, and not the two triggers alone.** GitHub recomputes the test
  merge when the *branch* changes, not when `main` moves. So a pull request that went green, then
  watched `main` advance, carries a verdict about a merge candidate that no longer exists — and the
  push trigger only re-reads it *after* it has merged, which is a report rather than a guard.
  Requiring the branch to be up to date is what makes the green on the pull request a green about
  the code that actually merges. Raised as a must-fix by the contractor review on PR #131, under
  the lens *does this check measure the invariant it claims, or a proxy for it?*
- **What it costs, stated:** a rebase whenever `main` moves under an open pull request, and the
  re-run that follows it. That is the price of the verdict meaning what it says, and it is paid on
  a repository whose pull requests merge one at a time.

## The two acts, in order

Turning the enforcement on cannot ride in the change that introduces the workflow: the context does
not exist on `main` yet, so requiring it would block the pull request that creates it. So:

1. The workflow merges and reports — its own pull request is the first run, and #126 carries the
   Delivery Record naming it. **Done.**
2. Branch protection is then updated to require the `gate` context, with the up-to-date requirement
   on — an act on the platform, by the HC, on the HC's own account. **Done, 2026-08-16**, and the
   enforcement row above says so. The row's update was deferred to #129 at the HC's direction in
   that same sitting, having been told the cost; a row claiming an enforcement the platform does not
   carry — or denying one it does — is the defect this file exists to prevent, and the gap is
   recorded rather than tidied away.

   **The route that was used, kept for whoever repeats it.** `main` carried protection but no
   required status checks at all, so there was no status-check object to amend — the settings screen
   is the route that works from that state, and the API's `required_status_checks` endpoint is not,
   because it edits a block that does not exist yet. Two boxes, both of them:

   - *Require status checks to pass before merging* → add **`gate`**.
   - *Require branches to be up to date before merging* — this is the one the review's third
     finding is about. Without it, a green about a merge candidate that `main` has moved past still
     satisfies the requirement.

   The API route is a full `PUT .../branches/main/protection`, which replaces every setting at
   once — so it must carry `enforce_admins`, the force-push block, and the deletion block forward or
   it silently drops them. That is why the screen is named first here.

**Both acts are done, and the state was read back from the API on 2026-08-16:** the required status
checks are `["gate"]` with `strict` on, `enforce_admins` on, force pushes and deletions blocked. So
the re-run now prevents rather than informs, which is the promise chosen at the Direction gate.

**What is still only read, not proved:** that the setting refuses a merge rather than reporting one
has been read from the API and not yet observed. The first pull request to merge under it is the
observation, and #129's is the first.

## What this does not do

- **It ships to no host.** [`payload.md`](payload.md) carries no `.github/workflows/` path, and the
  sync credential in [`credentials.md`](credentials.md) is deliberately granted no workflow
  permission. A host that wants an independent re-run declares its own; nothing here reaches it.
- **It defines no check, and it reads no check's output.** Only the gate's exit code crosses the
  boundary, which is what leaves the gate's report format free to change.
- **It grants no write.** The token GitHub mints per run is bound in
  [`credentials.md`](credentials.md).
- **It moves no gate setting.** Which setting each of the two gates runs at is
  [`gates.md`](gates.md)'s alone, and this file neither reads nor changes it. What this work makes
  reachable — the Ship gate's second leg — is #127's to act on, and the flip is #130's.

## What nothing here validates

A **declared limit**, in the sense [Chapter 3](../sds/03-quality-gate-and-tooling.md) requires:

| Not reached | What it would look like |
|---|---|
| The enforcement row | Branch protection turned off, or requiring a context by a different name, while this table still says otherwise. Repository settings are not versioned, so this file is the only record of them and nothing compares the two |
| The runner image and node row | The runner moving under `ubuntu-latest` or `26`, which is what those values mean rather than a defect in them |
| That the verdict GitHub records is the verdict the workflow describes | Nothing short of reading the run decides it; the run on each pull request is where it is visible |

The residue is routed rather than dropped: the enforcement row is re-verified by the hygiene sweep,
which is what re-verifies `config/` ([Chapter 1](../sds/01-lifecycle-and-skills.md) → *The adaptive
layer's home*). A check for it is deliberately not proposed — it would need the same administrative
reach the row describes, which is a wider grant than anything in this repository holds.
