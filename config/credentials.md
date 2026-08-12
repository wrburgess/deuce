---
date: 2026-08-11
source: the Direction gate on #83, where Option A — the credential registry — was chosen; the fleet corrected to bryce and nadal at the Direction gate on #87; the tracker credential and the reviewer's login declared at the Direction gate on #107
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

**The four sections below bind the automated credential.** The attended state's blast radius is
the two lines above, whole: the HC's own account, watched. Nothing below narrows it — nothing can.

### What it can reach

- **Repositories:** the fleet's only — bryce and nadal (per #7, corrected at the Direction gate
  on #87), read from the fleet roster once its first row lands (#85). Not the HC's other
  repositories, not this one.
- **Permissions:** contents read and write (clone, push a `deuce/sync-*` branch) and pull-requests
  read and write (open the sync pull request). Nothing else — the sync exercises nothing else.
- **Deliberately not granted:** workflow permission (the payload manifest ships no
  `.github/workflows/` path), administration, branch-protection settings, issues, releases.

### What it can destroy

- Every branch that protection does not cover on a granted repository: contents-write includes
  force-push and branch deletion there.
- **What stands between it and a default branch is the host's protection settings, not the
  token's scopes.** A host whose default branch is unprotected has handed this credential the
  power to rewrite it. The protection state of bryce and nadal is unverified at this
  declaration's date; verifying it is each cutover's work (#85, #86), and no unattended run
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

## The tracker credential

The credential a factory pass runs under ([Chapter 6](../sds/06-factory-automation.md) → *The
credential precondition*): everything a pass does to the tracker and this repository — label
edits, comments, run records, opened pull requests, pushed task branches — happens as this
credential. [ADR 0026](../adr/0026-unattended-passes-require-a-minted-credential.md) holds every
unattended pass to it.

### The two states

- **Attended (the only state in use today):** the HC's own `gh` login, with the HC watching. Its
  reach is everything that account reaches; every pass so far — the proving run under #106
  included — has run in this state, and no unattended pass ever does.
- **Automated (bound here; its minted row lands below):** one fine-grained personal access token,
  this repository only — the Direction gate on #107, Option A.

**The four sections below bind the automated credential.** The attended state's blast radius is
the two lines above, whole.

### What it can reach

- **Repository:** this one only.
- **Permissions:** contents read and write (clone, push a `task/*` branch), issues read and write
  (labels, comments), and pull requests read and write (open, comment). Everything a pass posts
  rides on those three; nothing else is granted.
- **Deliberately not granted:** workflow permission, administration, branch-protection settings,
  releases.

### What it can destroy

- Every branch platform protection does not cover: contents-write includes force-push and branch
  deletion.
- **`main` left that set at the minting sitting, 2026-08-11:** platform protection is on —
  force pushes and deletions blocked, admins bound (`enforce_admins`), so the rule reaches every
  credential acting as the HC's account, this token included. Verified by API read-back at the
  sitting, recorded on #107. The `.githooks/` guard is client-side and binds no token; protection
  settings are what stand between a credential and a default branch, exactly as the sync entry
  states for hosts.
- **The honest residual:** protection without a required-pull-request rule still permits a plain
  fast-forward push to `main`. The hooks block it locally, the Ship gate rule forbids it, and
  closing it at the platform is one ruleset if ever wanted; this entry states the residual rather
  than implying more than is enabled.

### What breaks if it leaks

- The holder can write plausible-looking tracker state — labels, comments, run records — and push
  branches here. The artifacts are the lifecycle's authority, so forged tracker state can steer
  work.
- **The worst of it, stated plainly: the holder can land changes on `main`** by opening a pull
  request from its own branch and merging it — the merge endpoint takes exactly the contents and
  pull-request writes this token holds, and no required-review rule stands in the way (a lone
  maintainer cannot approve their own pull requests, so none is set). Protection on `main` blocks
  rewriting history, not merging a fresh pull request.
- **Containment:** revoke at the token's settings page on the HC's account; rotation on any
  suspicion. A merge is not a force-push — whatever a leaked key landed is visible in history and
  revertible.

### What it deliberately cannot do

Least privilege, stated as cannots — and split honestly by what holds each one:

- **Platform-held** (scopes and protection deny it): force-push to or delete `main` · administer
  the repository or its protection · reach any other repository · touch workflows.
- **Standard-held, not platform-held:** merging. The scopes this token needs for its job are the
  same ones the merge endpoint takes, so the platform does not deny it — the Ship gate's floor
  (never on the AC's own say-so) is held by canon, the run record, and revocation. The platform
  closure — a required-approval rule — is one setting away and deliberately not set: a lone
  maintainer cannot approve their own pull requests, so it would block the HC's own merges too.

### The minting rule

- **No unattended pass runs until a credential conforming to this entry exists** — ADR 0026's
  floor, restated nowhere else in this file.
- **The minted row, 2026-08-11** — the stop and its answer on #107:

  | Field | As minted |
  |---|---|
  | Form | Fine-grained personal access token |
  | Name | `wrburgess/deuce PAT` |
  | Repository access | This repository only |
  | Permissions granted | Contents read/write · Issues read/write · Pull requests read/write (Metadata read, automatic) |
  | Expiry | 2027-08-11 |
  | Where the value lives | The HC's secret store — never the tracker, the repository, or a session |

  The permissions line is the HC's transcription from the token screen, confirmed at the sitting;
  the entry above is what binds, and any later mismatch found is a finding, not a shrug.

## The reviewer's login

The credential Verify's summons runs under: `codex exec` uses the Codex CLI's login on this
machine — the HC's ChatGPT account ([`review.md`](review.md) → the roster). Declared here because
an unattended pass summons the reviewer with nobody watching; declaration-only, because its
minted form is OpenAI's to issue, not this repository's.

- **What it reaches:** the working tree the summons points it at, read on this machine under that
  account, and OpenAI's service as that account.
- **What it can destroy:** nothing of the tracker's — it holds no tracker key. On this machine its
  bound is the CLI's own sandbox posture, which this entry does not vouch for; what is checkable
  from here is that a damaged working tree is reconstructed by git and the artifacts.
- **What breaks if it leaks:** the ChatGPT account itself. Containment is OpenAI's: sign out and
  rotate the account's password; the roster's readiness check (`codex login status`) then fails
  closed — an unreachable reviewer stops a run rather than certifying it
  ([Chapter 2](../sds/02-review-and-findings.md) → *Verify's external half, now written*).
- **The floor:** no unattended pass summons a reviewer before this declaration exists. This entry
  is that declaration; the summons inherits the attended state's posture whole, and there is no
  second, wider state to bind.
