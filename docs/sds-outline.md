> **SDS outline — the bird's-eye view of the software development system.**
> This is the outline the HC reads to see the whole arc at a glance, and goes back to when checking
> that deuce is satisfying the system it started from. It is the seed for a future shareable
> statement of the system, to be refined later (#25).
>
> Carried in verbatim from the predecessor standard,
> [ace's `software-development-system.md`](https://github.com/wrburgess/ace/blob/main/docs/standards/software-development-system.md),
> captured 2026-08-02 at ace commit `8544529`. Non-normative here: the ratified standard in this
> repository is [`sds/`](../sds/), and where the two disagree, `sds/` governs. Internal links and
> host-slot references below point into ace and are left as captured.

---

# Software Development System

The umbrella standard for the whole arc of building software with AI Contributors: taking a problem,
shaping it, building the solution, releasing it, and operating it over the long run. The per-issue
development work at its core is specified by the
[Development Lifecycle](development-lifecycle.md); this document is the map that lifecycle sits
inside — everything before an issue exists and everything after a PR merges.

It is **business-neutral**: it names no company, product, stack, or vendor. Wherever a concrete tool
or policy choice is needed, this standard declares a **host slot** — a named decision the Host App
fills in [`PROJECT.md`](../../PROJECT.md) (or a stack overlay). The standard defines the bar; the
host picks the mechanism.

This is a **living document** (origin: [#155](https://github.com/wrburgess/ace/issues/155)). Each
area will be refined over time into deeper expectations, rules, and tooling; nothing here is stone.

## Governing principle

> **The HC defines WHAT is produced and the standards and constraints it must meet. The AC is
> empowered to decide HOW, and to deliver.**

Every section below is written through that lens. Two consequences recur throughout:

1. **Standards are stated as verifiable artifacts and gates, never as process prescriptions.** A
   required process can't be audited after the fact; a required artifact can. Where a process is
   valuable (e.g. sequential-interrogation ideation), the standard *recommends* it and *requires*
   what it leaves behind.
2. **Human involvement is a declared policy, not an ambient assumption.** Each gate names who holds
   it and under what conditions it may be delegated — so autonomy is engineered, not hoped for.

## How to read this standard

- **Required** — the bar. A host that doesn't meet it is out of conformance.
- **Host slot** — a decision the standard requires the host to *make and declare*; the choice
  itself is the host's.
- **Recommended default** — a named, proven way to satisfy a requirement; a host adopts it unless
  it has a reason not to.

---

## Part 1 — The pipeline

Seven time-ordered stages. Each stage's contract is what must be true to enter it and what artifact
it must leave behind.

### 1. Configure

Everything that must exist **before ideation can start** — scoped to bootstrap only, because
configuration is layered in time:

- **Bootstrap config** (this stage) — project-agnostic and rarely changing: the agent Config Bundle
  (canonical instructions, Skills, Rules Layer), the guardrails (branch protection, hooks), the
  repo bootstrap (CI wiring, git hooks), the local environment (runtime versions, secrets
  management), and the initial dependency/security baseline. The vendored Generic Baseline is the
  reference implementation of the AI half.
- **Derived config** — *produced by later stages*, not this one: once Ideate sets goals and
  standards, those decisions are written back as config (`PROJECT.md` values, quality gates, review
  severities, model/effort assignments, deploy targets). Configuration is therefore a **living
  surface that later stages write to**, maintained by the AI Config Hygiene loop (Part 2).

**Split:** *AI agent configuration* (bundle, guardrails, model rosters, tool access) and *software
development configuration* (repo, environment, dependency baseline) — mirroring the AC/HC pairing.

### 2. Ideate

Two activities: **Brainstorm** (divergent, ephemeral by design — no required artifact) and
**Distill** (convergent — where the HC→AC handoff is forged).

**Required terminal artifacts:**

1. A **problem brief** on the lifecycle host (typically an umbrella/epic issue) with every field
   addressed or explicitly marked N/A: **problem · target solution · goals · constraints ·
   expectations · risks · edge cases · punted paths** (options considered and deliberately
   deferred or rejected, so they are never re-litigated by accident).
2. **Decision records** — vocabulary into the glossary (`CONTEXT.md`), structural decisions into
   ADRs.

**The exit test:** could an AC with zero conversation history pick up the brief and start Plan
without asking the HC anything the ideation Q&A already answered? If not, Ideate isn't done —
regardless of how good the conversation felt.

**Recommended process (host slot: ideation skills):** sequential-interrogation Q&A — one question
at a time until the problem is thoroughly broken down. The brief is not extra paperwork; it is the
residue this process naturally produces, and the standard makes that ending mandatory whatever tool
got you there. Nothing enters Plan without a brief to point at.

### 3. Plan

Operates **above** the per-issue lifecycle: it turns one problem brief into a stream of issues.
(Per-issue Assess/Devise are specified in the [Development Lifecycle](development-lifecycle.md) and
are not re-specified here.)

- **Decompose** — break the brief into compartmentalized units, each independently deliverable and
  testable (epic → sub-issues).
- **Prioritize** — sequence by dependency and risk; riskiest assumptions get probed earliest.
- **Assign** — route each unit on **four axes**, choosing the cheapest combination that clears the
  unit's **risk floor**:
  1. **Executor** — AC or HC (most units go AC; some are inherently HC: approvals, credentials,
     reserved judgment calls).
  2. **Harness** — which agent product (the system is deliberately multi-agent; cross-family
     review is a quality mechanism, not an accident).
  3. **Model tier** — mechanical, well-specified work to cheap tiers; design, security, and review
     work to frontier tiers.
  4. **Effort level** — reasoning effort is independently tunable from tier and trades outcome
     quality against price and latency; tier and effort are the two knobs on the same cost dial.

  **Risk floors are constraints the cost optimization cannot cross** (e.g. the Reviewer must be a
  different model family than the implementer). **Host slot:** the concrete rosters and per-unit-
  type defaults (`PROJECT.md` → *Attribution & Model Declaration*, *Reviewer*).

### 4. Develop

The per-issue inner loop. **Delegates wholesale to the
[Development Lifecycle](development-lifecycle.md)** (Assess → Plan → Implement → Verify → Deliver,
plus review-response): implementation, self-review, independent cross-family review, revision, and
the gates. Two additions at the system level:

- **Accept — graduated merge authority.** Merge is a declared policy, not a fixed gate:
  - An **AC may merge** a PR only when a **different AC model family** than the implementer has
    adversarially reviewed it and verified the result, with reviewed-SHA attestation binding the
    review to the delivered head. This covers the majority of routine work.
  - **Security-flagged PRs are HC-merge only** — never in any auto-merge class (Part 2, Security).
  - **Production promotion remains HC-only** (Stage 5) — the human backstop between any AC merge
    and real users.

  > **Amendment note:** the shipped baseline docs (`AGENTS.md`, the lifecycle spec, ADR 0025/0029,
  > and the parity check's merge-gate hard-fail) still state merge as *always human, never
  > configurable*. This standard states the target policy; the mechanical amendment (superseding
  > ADR, parity-check change, `PROJECT.md` gate schema) is a tracked follow-up.

- **Document.** Two outputs, two homes:
  1. **Findings, rule changes, postmortems** → the intake/learnings machinery (the Learning loop,
     Part 3) — never a second log.
  2. **Cost and usage** → a **per-PR cost note** in the Statement of Work: model(s), effort
     level(s), and review rounds consumed. *Growth path:* a structured, machine-readable ledger
     once volume justifies analysis — the data that makes Assign's cost optimization learnable.

### 5. Release

- **Integrate** — merge triggers CI that re-runs the quality gates: tests, linting, security
  scanning, dependency audit. **Host slot:** the toolchain (`PROJECT.md` → *Quality Checks*).
- **Deploy** — automated, repeatable, reversible (rollback is a requirement, not a feature), and
  AC-drivable. **Host slot:** the platform and mechanism.
- **Promotion policy (required shape):** merge **auto-deploys to staging**; **production promotion
  is a separate, explicit, HC-only action**. Staging is the proving ground between merge and
  promotion — that separation is what makes graduated merge authority tolerable.
- **Host** — declared environment set (**production · staging · per-PR review environments**) and
  a database backup policy that includes **verified restores** — an untested backup is a hope, not
  a backup. **Host slot:** environment inventory and backup cadence.

### 6. Operate

The running system telling you what's wrong — with an AC, not a human dashboard, as the first
consumer.

**Required surfaces** (vendors are host slots): uptime monitoring · upstream-provider status ·
error reporting · log aggregation. **Tracking:** usage analytics and a data-change audit trail.
**Recurring audits:** security scanning, dependency currency (with a cooldown policy), test
coverage, documentation freshness, usage analysis.

**The AC triage loop (required):** a scheduled AC sweep reads the Operate surfaces (new errors,
incidents, audit findings, dependency alerts), deduplicates against known issues, and files
triaged issues on the lifecycle host with an assessment and severity.

- **HC gets paged, not employed:** the HC is alerted only above a declared **severity floor**
  (host slot) — site down, data at risk, security finding. Everything below arrives as
  already-triaged issues to prioritize at leisure.
- **Auto-entry:** issues in the **lowest severity tier** may enter the development lifecycle
  autonomously — fix, review, and (where the graduated policy allows) merge, with no HC
  prioritization step. Every gate they cross is one the declared policy delegated.

### 7. Use

Where the product meets its users — support flowing out, feedback flowing in. Both halves drain
into the **same intake mouth** as Operate, so a user-reported bug and a machine-reported error
about the same defect deduplicate into one issue.

- **User Support (outbound):** onboarding, help documentation, and support workflows. Docs are
  AC-maintained and freshness-audited; support intake is AC-triaged.
- **Feedback Capture (inbound):**
  - Bug/feedback submission built into the product surface — not "email me".
  - **Automatic context capture** on every report: route/screen, user identity, session state,
    recent actions, client errors — a report must be triage-able without a round-trip to the user.
  - Screenshot/screen-capture attachment as a first-class input.
  - Usage reporting — what users actually do, feeding prioritization.
- **Host slots:** feedback widget, analytics vendor, capture depth. Capture depth explicitly
  cross-checks against the Compliance standard (Part 2).

---

## Part 2 — Cross-cutting standards

These apply at every stage. The umbrella states each standard's **bar**; the working patterns live
in the [Rules Layer](../../AGENTS.md#rules-layer) (`rules/*.md`) and are never duplicated here.

### Security

- Secrets never in the repo (**host slot:** secrets manager); least-privilege credentials for HCs
  *and* agents; scanning wired into Integrate (**host slots:** SAST, dependency audit tools).
- **Escalation rule:** a change touching auth, secrets handling, input validation, or data
  exposure requires (1) a dedicated security-review pass on top of normal cross-family review, and
  (2) the PR **explicitly flagged security-sensitive** — so the HC knows what class of risk they
  are approving before merge. Security-flagged PRs are **HC-merge only**.
- **Authorization bar (required):** granular to the **individual permission**, deny-by-default,
  auditable. Role-only authorization fails the bar — it cannot express exceptions without role
  explosion. **Recommended default pattern** (Rules Layer): the
  **Permission → Role → Group → User** hierarchy.

### Testing

The bar is **behavioral, with mutation spot-checks**:

- Every new behavior and every fixed bug gets a test that **fails before the change and passes
  after**.
- The Verify stage must demonstrate tests actually detect defects — mutate the change (e.g.
  delete an error branch) and watch a test go red. A green suite that verifies nothing is the
  canonical AC failure mode this bar exists to catch.
- **Host slot (optional):** a numeric coverage floor in CI. It is never a substitute for the
  behavior bar.

### Interface

**Workbench UI doctrine:** interfaces bias toward conventional, information-dense, text-first,
low-chrome design in the style of developer tools. Standard components over custom ones; layouts
users already know over novel ones; **novelty requires justification, not the reverse**.
Conventional interfaces are also what ACs generate fastest and most correctly — the doctrine is a
throughput decision, not just taste.

- **Host slots:** design system · component framework · reference exemplars (extendable list).
- **Required:** standardized, AC-generatable CRUD admin views for every model — consistent and
  boring on purpose.

### Documentation

- Docs are AC-maintained and freshness-audited (Operate's audit sweep).
- Every change updates the documentation it invalidates **in the same PR**.
- System knowledge lives in versioned files (glossary, ADRs, learnings log) — never in chat
  history.

### Compliance

- **Host slot (required to declare):** the host's data-security and user-tracking obligations —
  jurisdiction, retention, PII handling.
- Use-stage context capture and Operate-stage tracking are cross-checked against that declaration.
  The standard requires the declaration *exists*; its content is host territory.

### AI Config Hygiene

**AC-led and PR-shaped:** a scheduled AC sweep reviews accumulated friction — rule findings,
blockers hit, agent suggestions, and **skill bloat** (skills that are unused, redundant, or better
replaced by externally maintained equivalents tested across more codebases) — and opens a review
PR proposing config changes. A human disposes. Config rot is a slow leak that never wins a human's
attention until it is expensive; the sweep exists so it never has to.

### Cost awareness

- Assign's four-axis routing (Part 1, Stage 3) is the *ex ante* control.
- The per-PR cost note (Part 1, Stage 4) is the *ex post* record.
- Cost review is a recurring Audit item (Part 1, Stage 6); the structured ledger is the declared
  growth path.

---

## Part 3 — Feedback loops

What makes this a system rather than a line.

1. **Defect loop** — Use/Operate signals → AC triage into issues → prioritization (HC above the
   severity floor, auto-entry below it) → per-issue lifecycle → graduated merge → staging → HC
   promotion.
2. **Learning loop** — findings, rule changes, and postmortems from any stage → the
   intake/learnings machinery → the AI Config Hygiene sweep → written back to the Configure
   surface. This is the loop that improves the *system itself*, not just the product.
3. **Product loop** — usage analytics and user feedback → new problem briefs → Ideate. The slowest
   loop, and the only one that originates new scope rather than corrections.

### The autonomy test

Stated as an acceptance criterion, not an aspiration:

> The system is **autonomy-ready** when a qualifying lowest-tier defect can travel
> **detection → triage → fix → cross-family review → AC merge → staging deploy** with zero HC
> touches — and every gate it crossed was one the declared policy explicitly delegated.

Run it periodically. If any stage quietly requires a human, the test fails **and names the stage**
— that stage is the next piece of system work.

---

## Gate summary

| Gate | Holder | Delegation |
|------|--------|------------|
| Plan approval | Declared in `PROJECT.md` → *Human Gates* | `auto` (shipped) or `required` |
| Merge — routine work | AC | Only with cross-family adversarial review + reviewed-SHA attestation |
| Merge — security-flagged | HC | Never delegable |
| Production promotion | HC | Never delegable |
| Severity-floor paging | HC alerted | Below the floor: AC triage + auto-entry |
| Intake/authoring disposition | HC | Review PRs disposed by a human |
