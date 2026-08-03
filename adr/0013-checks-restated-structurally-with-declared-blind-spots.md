# ADR 0013: A check is a measured structural restatement with a declared blind spot

- Status: accepted
- Date: 2026-08-03

## Decision

A **check** — one member of the **quality gate** — is never written directly against an invariant
about what a document means. It is written against a **structural restatement**: the invariant
converted into a property of what the artifact *contains*, decidable by reading the artifact and
nothing else.

Three rules bind that conversion:

1. **The check looks for the structure whose absence is the violation,** rather than trying to
   detect the violation.
2. **A candidate restatement is measured against the repository as it stands before it is adopted,**
   and its output is read. A restatement whose output is mostly false positives has renamed the
   invariant, not converted it. It is then **declared undecidable and routed** to Chapter 2's review
   and the recurrence pipeline — never shipped narrowed, and never allowlisted into passing.
3. **A check produced by a restatement declares its blind spot:** what it does not reach, and where
   that residue goes. A fully decidable check declares none.

## Why (the trade-off that was live)

The alternative — write the closest grep and call it the check — is the one this repository was
about to take twice, and it is worse than having no check at all. A green then means *no known
phrasing appeared* and is read as *the invariant holds*. That is the most-recurring class in this
repository's own index: a check that measures something other than the invariant it claims, five
instances across four pull requests at the time of writing. It is the same shape Chapter 2 already
refuses for review, where a gate that silently does not run is worse than no gate because the run
reports as covered.

**What was given up:** coverage of the semantic residue, permanently and by design. The gate-setting
check is the exact case. Restated structurally it reaches every surface that names a gate or names a
setting's value — and neither of the two surfaces three greps missed on
[PR #49](https://github.com/wrburgess/deuce/pull/49#issuecomment-5170470462), both of which carried
the meaning while naming neither, and both of which a person found by reading. The standard now says
those are out of the lint's reach and belong to review, rather than implying the lint has them.

**The measurement rule cost something to learn, and the receipt is this chapter's own draft.**
Chapter 0's owed Glossary check — *every canon term resolves to an entry* — was restated as *a term
of art is bolded at first use*, which the chapters appear to observe. Measured against the three
ratified chapters, 199 of 241 distinct bolded spans open their own line as Readout rule 5's
scannable leader, and of the 42 mid-sentence spans, 22 have no Glossary entry and not one of the 22
is a missing entry. The check would have reported 22 violations and been wrong 22 times. It survived
into a draft of the chapter that forbids proxies, and only the measurement caught it — which is why
the measurement is canon rather than advice.

**Why decide it now:** the configuration lint is the largest piece of tooling the standard has
scheduled, and the rule that decides what each of its checks may claim is cheapest to fix before any
of them is written. A check's blind spot is nearly impossible to add afterwards, because by then the
green has already been read as coverage.

## Supersedes / references

- Ratified chapter: [`sds/03-quality-gate-and-tooling.md`](../sds/03-quality-gate-and-tooling.md) —
  *What a check may be asked to do*.
- The two deferred checks that are this decision's evidence base:
  https://github.com/wrburgess/deuce/pull/48#issuecomment-5170293749 and
  https://github.com/wrburgess/deuce/pull/49#issuecomment-5170470462
- The class index the argument rests on:
  [`findings/classes.md`](../findings/classes.md) — *A check that measures something other than the
  invariant it claims*.
- Chapter 2's parallel refusal for review:
  [`sds/02-review-and-findings.md`](../sds/02-review-and-findings.md) — *The summons, completed*.
