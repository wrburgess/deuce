# The class index

The descriptive record of this repository's recurring defect classes: *this shape occurred N times,
see these findings*. It is the other half of the findings home. Its contract is canon, at
[Chapter 2 → *The findings home*](../sds/02-review-and-findings.md#the-findings-home),
[ADR 0010](../adr/0010-review-bounded-by-lens-set.md), and
[ADR 0011](../adr/0011-findings-type-state-one-way.md); stated briefly:

- **Descriptive, never imperative.** An entry says what occurred and where. The moment it says
  "never do X" it is a rule authored under another name — rules have their own home, `rules/`, and
  their own entry bar.
- **Reference plus delta.** A finding matching a class already here records a pointer and what is
  new about this instance, so counting stays cheap.
- **The lens menu derives from this file**
  ([Chapter 2 → *How recurrence changes rules*](../sds/02-review-and-findings.md#how-recurrence-changes-rules)):
  a class that recurs earns a lens, and a class whose prevention can be stated as standing guidance
  enters `rules/`, citing its rows here as the receipts.

## Entries

A class is admitted here when its instances span **two or more pull requests** — the rule the HC set
at the Direction gate on [#47](https://github.com/wrburgess/deuce/issues/47). Shapes seen on a single
pull request are findings on that pull request and nothing more; the permanent lens is what stands
against the classes this file cannot yet name.

Entries are ordered by the evidence that admitted them: pull requests spanned, then instances.

### A check that measures something other than the invariant it claims

7 instances, across 5 pull requests — PR #39, PR #41, PR #45, PR #46, PR #51.

- **PR #39, finding 4** — aggregate field counts certified a review whose per-finding blocks were malformed; the count was right and the structure was not.
- **PR #39, finding 8** — lens coverage matched by substring, so a lens name appearing inside a quotation counted as a lens answered.
- **PR #41, finding 4** — the drift guard checked that the copied entries were present, never that the set matched its source.
- **PR #45, finding 5** — the alphabetical-order check passed on a duplicated entry, because `sort` accepts duplicates.
- **PR #46, finding 8** — a 512-byte limit asserted in characters; a 350-character label measured 950 bytes and passed a test that claimed to prove atomicity.
- **PR #51, finding 1** — the delta is that this one was caught before it shipped: a proposed Glossary check keyed on bold as a proxy for *term of art*, measured against canon before adoption and found to be wrong 22 times out of 22. It had already survived into a draft of the chapter that forbids proxies.
- **PR #51, finding 2** — a link check's empty guard sat on the unit it iterated (files) rather than the unit it measured (links), so a file containing no links still reported green.

### Restatement of content another document owns

4 instances, across 3 pull requests — PR #41, PR #43, PR #51.

- **PR #41, finding 2** — four Skill steps restated canon mechanics the chapter owns.
- **PR #43, finding 1** — a configuration declaration restated the mechanics behind the value it declared.
- **PR #43, finding 2** — CLAUDE.md duplicated both the settings and the mechanics it was meant to point at.
- **PR #51, finding 3** — CLAUDE.md again, and the delta is that the restatement rode in on a pointer: the block named Chapter 3 and the two decision records, then restated the rules they own. Raised by the contractor reviewer.

### A statement true when written whose condition has since passed

4 instances, across 3 pull requests — PR #43, PR #45, PR #51.

- **PR #43, finding 5** — two ratified chapters said every merge is `required`, written truthfully and outlived by the flip that followed; promoted to [#44](https://github.com/wrburgess/deuce/issues/44).
- **PR #45, finding 7** — a heading read "(first response)" for every review, a label that marks a wave inside one invocation and stops being true across invocations.
- **PR #51, finding 4** — the seventh surface of #44's sweep, found by reading: `delegated` is not usable "for the same reason `attested` is not", where the clause outlived the flip even though the sentence around it stayed true.
- **PR #51, finding 5** — a Skill instructed that the pull request is "merged by the HC"; an instructing document, which PR #49's disposition already argued is the urgent half of this class.

### A fix that removes or narrows something it needed to keep

3 instances, across 3 pull requests — PR #41, PR #43, PR #45.

- **PR #41, finding 5** — a trim for restatement carried away the re-summons verb the fix-wave step depended on.
- **PR #43, finding 3** — a condensed pointer dropped Chapter 1, which owns one of the two gates it pointed at.
- **PR #45, finding 1** — a gloss took one of its source's two columns and added "only", narrowing a canon term while explaining it.

### A guard that fails open or fails silent on input it did not expect

6 instances, across 2 pull requests — PR #39, PR #41.

- **PR #39, finding 2** — a malformed accepted register parsed as an empty list, so the summons carried no accepted findings and said nothing about it.
- **PR #39, finding 5** — the register parser read past its own section into whatever followed.
- **PR #39, finding 6** — a bare token passed as a signature, with neither tool nor model present.
- **PR #39, finding 7** — a multi-row roster silently dispatched to the first row.
- **PR #39, finding 9** — a stale empty marker beside real entries silently emptied the menu.
- **PR #41, finding 3** — canon's prose lenses were accepted for any subject, which made them a route around the menu.

### An invariant enforced on one path and leaking through another

5 instances, across 2 pull requests — PR #39, PR #46.

- **PR #39, finding 3** — the declared lens bounds were written in configuration and unenforced at dispatch.
- **PR #46, finding 2** — the conversion to a classified failure began after staging, so staging's own errors escaped raw.
- **PR #46, finding 4** — `process.exit()` abandoned an undrained stream; a payload over the 65,536-byte pipe buffer was cut off exactly there.
- **PR #46, finding 5** — the replacement stream could itself fail asynchronously, turning the classified exit 5 back into an unclassified 1.
- **PR #46, finding 9** — the stream guards sat inside the failure branch, leaving the success path unguarded.
