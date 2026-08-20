---
date: 2026-08-13
source: the Direction gate on #83, where Option A — the credential registry — was chosen; the fleet corrected to bryce and nadal at the Direction gate on #87; the tracker credential and the reviewer's login declared at the Direction gate on #107; the unattended session declared, and the tracker token's resting place made concrete, at the Direction gate on #108; the continuous-integration token declared at the Direction gate on #126
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

- **Attended (every pass to date; in force until the first unattended pass — #108's, whose run
  record is this line's update trigger):** the HC's own `gh` login, with the HC watching. Its
  reach is everything that account reaches, and no unattended pass ever runs in it.
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

- **The floor is [ADR 0026](../adr/0026-unattended-passes-require-a-minted-credential.md)'s, and
  owned there.** This entry adds only what conforming means for this credential: the automated
  state as bound above, with the row below as its minted form.
- **The minted row, 2026-08-11** — the stop and its answer on #107:

  | Field | As minted |
  |---|---|
  | Form | Fine-grained personal access token |
  | Name | `wrburgess/deuce PAT` |
  | Repository access | This repository only |
  | Permissions granted | Contents read/write · Issues read/write · Pull requests read/write (Metadata read, automatic) |
  | Expiry | 2027-08-11 |
  | Where the value lives | The HC's secret store: the login-keychain item `deuce-factory-tracker` on this machine — never the tracker, the repository, or a session |

  The permissions line is the HC's transcription from the token screen, confirmed at the sitting;
  the entry above is what binds, and any later mismatch found is a finding, not a shrug.

- **The keychain item is the HC's to create, and the value never passes through a session.** One
  command stores it, and refuses to store one that does not work:

  ```
  pbpaste | bash bin/factory-credential
  op read "op://<vault>/<item>/credential" | bash bin/factory-credential
  ```

  The token arrives on stdin — never on a command line, where shell history and `ps` would carry
  it — is classified, is probed against this repository, and only then written to the keychain,
  trusting `security` itself so [`tools/factory/run.ts`](../tools/factory/run.ts)'s read needs no
  prompt. **It reaches `security` on stdin too, and that is a correction with a receipt:** until
  2026-08-19 the value rode `security`'s own argv, briefly visible to `ps`, which the code named in
  a comment while this line said *never*. Two statements of one fact, disagreeing — found by the
  contractor review on PR #136. `-w` with no value reads the password from stdin, twice, so the
  fix was to write it twice and close the pipe. The read at run time fails closed: no item, a value that does not work, or a locked
  keychain starts nothing ([`factory.md`](factory.md) → *The credential, at run time*).
- **Why a command and not the raw `security` prompt, with its receipt.** `security -w` prompts
  twice, silently, and stores whatever it is given: a word typed where a token belonged looked
  identical to a good paste and stayed hidden until a pass spent its start on a 401. That happened
  twice on #108. Storing and verifying are now one act, which is the only arrangement in which a
  bad credential cannot survive its own storage.
- **Why the keychain is the runtime copy and a password manager is not.** The login keychain
  unlocks at login and stays unlocked for the life of the HC's session, which makes it the one
  store on this machine a pass can read with nobody there. Every 1Password path fails that test:
  the desktop-app integration prompts, and a prompt with nobody to answer it is the hang this
  design refuses; a `op signin` session expires within the hour; and a service account's own token
  would have to rest somewhere readable non-interactively — the keychain, holding a different
  secret. **The manager is the copy of record and the keychain is the runtime copy**, bridged by
  the attended command above whenever the token rotates. Recorded so that a later reader improving
  the wrapper into an `op read` at run time finds the reason it is not one.
- **What "unattended" therefore means here, exactly:** the HC logged in and away from the desk —
  the pass runs. The HC logged out, or the machine shut down — the keychain is locked, the read
  fails closed, and the log says so; a launchd user agent would not have fired in that state
  either.

## The continuous-integration token

The credential the independent re-run of the quality gate runs under
([`ci.md`](ci.md)): the token GitHub mints for each workflow run, which
[`.github/workflows/gate.yml`](../.github/workflows/gate.yml) hands to `gh` so that `tracker-lint`
can read the tracker. Declared here because it is a credential automation uses, and the third
standing rule admits no exception for a small radius.

**It has one state, not two, and that is the whole of why it was chosen.** There is no attended form
and no automated form to mint: GitHub issues it when the run starts and revokes it when the run ends.
It cannot be exercised by the HC, borrowed by a session, or stored anywhere. The alternative — a
personal access token for the same reads — was declined at the Direction gate on #126 as strictly
worse on every axis: longer life, wider reach, a value to keep and rotate, and it buys nothing this
one does not already do.

### What it can reach

- **Repository:** the one the run belongs to. This one, and nothing else — GitHub scopes it to the
  workflow's own repository and there is no grant that widens it.
- **Permissions:** contents read, issues read, and pull requests read, declared in the workflow's
  `permissions:` block. Those three are exactly what
  [`tools/lint/tracker/fetch.ts`](../tools/lint/tracker/fetch.ts) exercises — `gh repo view`, the
  issues query, the pull-requests query — and the fetch carries no write path at all.
- **Deliberately not granted:** every write, and with it everything the other two entries grant —
  contents write, issues write, pull requests write, workflows, administration, branch-protection
  settings, releases.

### What it can destroy

- **Nothing.** It holds no write grant, so there is no branch it can move, no comment it can post,
  and no state it can change. This is the only entry in this file whose answer to this question is
  nothing, and the reason is the grant, not good behavior.
- **The residual, stated rather than implied:** a run can read every issue, pull request, and file in
  this repository. The repository is public, so that is not a disclosure the token creates.

### What breaks if it leaks

- A leaked run token is a read of a public repository, for the minutes until the job ends. There is
  nothing to revoke afterwards and nothing to rotate.
- **What a wider grant would have cost is why the narrow one is written down.** The failure this
  entry guards against is not theft; it is the workflow quietly acquiring a write grant later, at
  which point every sentence above becomes false while still reading as true.
  [`tools/gate/workflow.test.ts`](../tools/gate/workflow.test.ts) refuses a workflow that grants any
  write, so that drift fails the gate rather than the reader's attention.

### What it deliberately cannot do

Least privilege, stated as cannots: push to any branch · open, merge, or comment on a pull request ·
label or comment on an issue · reach any other repository · touch workflows · administer this
repository or its protection.

### The minting rule

- **There is nothing to mint, and that is the point.** No sitting, no expiry to track, no row to add
  later. The declaration is complete on the day it is written, which no other entry in this file can
  say.
- **What replaces the minting rule is the workflow's own grant block**, and it is enforced: the test
  named above fails the gate on any write grant, so this entry cannot go stale by the workflow
  changing under it.

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
- **The readiness check's declared blind spot:** it decides that *a* login is reachable, never
  *whose* — a substituted, authenticated account passes it, and no side-effect-free probe decides
  identity. What stands against substitution is custody of this machine, and rotation on any
  doubt; the blind spot is declared rather than papered over.
- **The floor:** no unattended pass summons a reviewer before this declaration exists. This entry
  is that declaration; the summons inherits the attended state's posture whole, and there is no
  second, wider state to bind.

## The unattended session

The headless AC session a factory pass runs inside — `claude -p "/execute" --permission-mode
bypassPermissions`, started by launchd in the declared checkout
([`factory.md`](factory.md) → *The trigger*). It is not a credential, and that is exactly why it
owes an entry: the two entries above bound what their tokens reach, and neither bounds the process
that holds both at once. Chapter 0's third standing rule is about what automation can reach.
Declared at the Direction gate on #108, before the first pass ran under it.

### What it can reach

- **This machine, as the HC's own account.** The declared checkout, and every file that account
  can read or write. `--permission-mode bypassPermissions` turns off the AC tool's approval
  prompts; it is not a sandbox, and nothing here implies it is one.
- **The tracker, as the minted tracker credential** — that entry's reach, whole, and nothing past
  it. The token is placed in one child process's environment and nowhere else.
- **OpenAI's service as the HC's ChatGPT account**, through `codex exec` when a pass reaches
  Verify — the reviewer's-login entry's reach, unchanged by being summoned unattended.
- **The network**, as any stage's research needs it.

### What it can destroy

- **Anything on this machine the HC's account can destroy.** What stands between a pass and the
  HC's own work is the wrapper's refusal to start on an unclean checkout, the one-issue pass scope,
  and the lifecycle's artifact discipline — not a permission boundary.
- **On the tracker: exactly what the tracker credential can destroy**, and platform protection on
  `main` is what holds there, as that entry states.

### What breaks if it leaks

- **A session is not a secret and does not leak; what it holds does,** and both are bound above.
- **The failure with no analogue in the entries above is a session that behaves wrongly rather
  than one that is stolen** — a pass improvising past a stop, or writing tracker state nobody
  asked for. What stands there is canon's stop rule, the run record, and the kill switch. None of
  them is a scope on a token, and pretending otherwise would be the fiction this file exists to
  refuse.
- **The thinnest place, named: text the session reads.** This repository is public, so anyone can
  write an issue body or a comment, and a pass reads both at every stage. Admission is bounded —
  `status:ready` moves only under triage permission, which is
  [Chapter 6](../sds/06-factory-automation.md) → *The front door*'s whole argument — so an
  outsider cannot start work. But an admitted issue's thread carries text from anyone, and with
  the approval prompts off there is no boundary between that text and this machine. What stands
  there is the AC's own handling of instructions arriving inside material it was asked to read,
  plus the three controls above. That is thinner than a scope, and it is written here rather than
  left for an incident to write.

### What it deliberately cannot do

Least privilege, stated as cannots and split by what actually holds each one:

- **Platform-held: nothing.** The approval prompts are off and macOS grants this session what the
  HC's own session has. Stated first because it is the uncomfortable half.
- **Standard-held:** merge (the Ship gate's floor) · self-answer a stop · run a compressed path ·
  start while another pass holds the lock · fall back to the ambient `gh` login. Held by canon, by
  [`execute`](../.claude/skills/execute/SKILL.md), and by the wrapper.
- **The honest residual:** the strongest controls here are the kill switch and custody of the
  machine. A factory that is one act from off, with a run record for every pass, is what makes
  this reach acceptable — not a sandbox that does not exist.

### The precondition

- **This entry precedes the first pass that runs under it,** which is the whole of Chapter 0's
  rule: a reach that is written down can be argued with, and one that is not is discovered from
  its consequences.
- **Narrowing it later is one dated edit** — a curated `--allowedTools` set in place of the
  permission mode, or a sandbox profile around the child. Deliberately not guessed at before a
  pass exists to measure: an allowlist covering what a lifecycle stage actually does — git, npm,
  `gh`, `codex`, edits anywhere in the checkout, network research — is barely narrower than the
  mode it replaces, and one guessed too tight fails as a stage that stops mid-run.
- **What would move it sooner:** the reading surface above. A narrowing bought by measurement is a
  later edit; one bought by an untrusted-text incident is a finding, and this entry is what makes
  the difference visible in advance.
