---
date: 2026-08-08
source: the Direction gate on #83, where Option A — the credential registry — was chosen
---

# Credentials

The blast-radius declarations [Chapter 0](../sds/00-identity-and-governance.md#trust-boundary)'s
third standing rule requires: every credential gets one, written, before automation uses it — what
it can reach, what it can destroy, and what breaks if it leaks. One entry per credential; the sync
credential is the first, required by [Chapter 5](../sds/05-distribution.md#the-sync-updates-arrive-as-pull-requests)
before the first automated sync. This file is adaptive configuration under
[Chapter 1](../sds/01-lifecycle-and-skills.md#the-adaptive-layers-home); the rule it satisfies is
canon and is not restated beyond the sentence above.

## The sync credential

The credential [`tools/sync/run.ts`](../tools/sync/run.ts) runs under — whatever `gh` holds on the
machine that runs it. It has two states, and both are declared here because every sync pull
request cites this entry whichever state opened it.

### The two states

- **Attended (the only state in use today):** the HC's own `gh` login, with the HC watching.
  Its reach is everything that account reaches — far past the fleet — which is exactly why every
  run is HC-called and on the record ([`config/sync.md`](sync.md)), and why no unattended run
  happens in this state, ever.
- **Automated (not yet minted):** the credential unattended runs must use. It does not exist; this
  entry binds what may be minted. Writing precedes first use — that is the rule's point.

### What it can reach

- **Repositories:** the fleet's only — bryce, nadal, and mpi-ace (per #7), read from the fleet
  roster once its first row lands (#85). Not the HC's other repositories, not this one.
- **Permissions:** contents read and write (clone, push a `deuce/sync-*` branch) and pull-requests
  read and write (open the sync pull request). Nothing else — the sync exercises nothing else.
- **Deliberately not granted:** workflow permission (the payload manifest ships no
  `.github/workflows/` path), administration, branch-protection settings, issues, releases.

### What it can destroy

- Every branch that protection does not cover on a granted repository: contents-write includes
  force-push and branch deletion there.
- **What stands between it and a default branch is the host's protection settings, not the
  token's scopes.** A host whose default branch is unprotected has handed this credential the
  power to rewrite it. The protection state of bryce, nadal, and mpi-ace is unverified at this
  declaration's date; verifying it is each cutover's work (#85, #86, #87), and no unattended run
  precedes that verification.

### What breaks if it leaks

- The holder can open plausible-looking sync pull requests fleet-wide. The mitigation is the trust
  boundary itself, both directions: a pull request only proposes, and nothing lands on a host
  except through its own reviewed merge.
- The holder can overwrite or delete unprotected branches, and close or edit pull requests, on
  every granted repository at once — the whole-fleet reach is the reason this entry exists.
- **Containment:** revoke at the platform — the token's settings page on the HC's account, or the
  App's settings if the minted form is an App. Rotation on any suspicion; the sync fails closed
  without it (`gh auth status` runs before anything is touched, and an unauthenticated run exits
  having attempted nothing).

### What it deliberately cannot do

Least privilege, stated as cannots, each as load-bearing as the grants above: push to a protected
default branch · merge · administer a repository or its protection · reach any repository outside
the grant · touch workflows.

### The minting rule

- **No unattended sync runs until a credential conforming to this entry exists.** Attended runs
  under the HC's login continue as declared in [`config/sync.md`](sync.md).
- When it is minted, its concrete row — form (fine-grained token or GitHub App), name, owner,
  scopes as granted, date — is added to this entry, dated and sourced like everything in
  `config/`.
- Every sync pull request cites this file from its footer
  ([`tools/sync/report.ts`](../tools/sync/report.ts)), so the first automated sync cites it by
  construction rather than by memory.
