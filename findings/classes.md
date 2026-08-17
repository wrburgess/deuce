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

16 instances, across 9 pull requests — PR #39, PR #41, PR #45, PR #46, PR #51, PR #59, PR #94, PR #110, PR #133.

- **PR #39, finding 4** — aggregate field counts certified a review whose per-finding blocks were malformed; the count was right and the structure was not.
- **PR #39, finding 8** — lens coverage matched by substring, so a lens name appearing inside a quotation counted as a lens answered.
- **PR #41, finding 4** — the drift guard checked that the copied entries were present, never that the set matched its source.
- **PR #45, finding 5** — the alphabetical-order check passed on a duplicated entry, because `sort` accepts duplicates.
- **PR #46, finding 8** — a 512-byte limit asserted in characters; a 350-character label measured 950 bytes and passed a test that claimed to prove atomicity.
- **PR #51, finding 1** — the delta is that this one was caught before it shipped: a proposed Glossary check keyed on bold as a proxy for *term of art*, measured against canon before adoption and found to be wrong 22 times out of 22. It had already survived into a draft of the chapter that forbids proxies.
- **PR #51, finding 2** — a link check's empty guard sat on the unit it iterated (files) rather than the unit it measured (links), so a file containing no links still reported green.
- **PR #59, finding 2** — `requires: node_modules` probed the directory that usually holds `tsc`; with the directory present and `tsc` gone the probe passed, the check exited 127, and the gate reported *a check failed* for a gate that could not run.
- **PR #59, finding 6** — the replacement probe, `existsSync`, was the same defect one level tighter: a directory and a non-executable file are both present. Found by the review of the fix.
- **PR #94, finding 1** — the delta is scope, not presence: a body-wide `includes()` asserted a citation the test's name placed in the footer, so the citation migrating out of the footer would have stayed green. The assertion's scope was wider than its claim.
- **PR #59, finding 5** — the delta worth keeping: the masking was in the *test*. An invariant test counted `unmet` entries through a filter that excluded exactly the branch that was broken, so the assertion named the invariant and measured a proxy for it.
- **PR #110, finding 1** — the links check resolved targets through `existsSync`, so a gitignored file present on one machine passed as a repository link; the delta: caught by the AC's own adversarial pass and proven with a planted link before the fix existed.
- **PR #110, finding 2** — the class-index grammar accepted an instance lead naming no finding, so a pull request alone counted as an instance; the delta: the defect sat in the very check written to hold this file's grammar.
- **PR #110, finding 3** — glossary-reverse matched terms as unbounded substrings, so `AI` counted as present inside "plain"; the delta: a report-only check false-greened its report branch, and the word-bounded fix surfaced a real signal the substring had masked.
- **PR #133, finding 1** — a new payload-links check resolved shipped links against the whole payload, which is a proxy for the host-facing invariant: a host may adopt one system without the rest, so the check printed a real dead link for a lifecycle-only adoption and exited green. The delta: the report-only branch was *designed in and priced* — the Plan named it an accepted risk with its reasoning — and it was still the defect. A limit a Plan accepts is not thereby a limit the check may claim not to have.
- **PR #133, finding 3** — the per-system walks skipped `all`, treating it as a marker rather than a selection; with exactly one system declared beside it, that one walk carries the target and an `all`-classed file's link into it passes. The delta: the finding's stated mechanism was false and was refuted by a constructed case — an `all` file *is* in every walk — and a narrower residue behind it was real. Recorded because the residue is the class, and because "the mechanism is wrong" is not by itself "the check is right".

### A guard that fails open or fails silent on input it did not expect

12 instances, across 7 pull requests — PR #39, PR #41, PR #59, PR #112, PR #124, PR #133, PR #134.

- **PR #39, finding 2** — a malformed accepted register parsed as an empty list, so the summons carried no accepted findings and said nothing about it.
- **PR #39, finding 5** — the register parser read past its own section into whatever followed.
- **PR #39, finding 6** — a bare token passed as a signature, with neither tool nor model present.
- **PR #39, finding 7** — a multi-row roster silently dispatched to the first row.
- **PR #39, finding 9** — a stale empty marker beside real entries silently emptied the menu.
- **PR #41, finding 3** — canon's prose lenses were accepted for any subject, which made them a route around the menu.
- **PR #59, finding 1** — the frontmatter parser closed its vocabulary inside a check entry and left the top level open, so an unrecognized key was accepted and silently discarded.
- **PR #59, finding 4** — scalars and lists were separate namespaces and each duplicate guard checked only its own, so one key declared twice in two shapes was accepted twice.
- **PR #112, finding 1** — `codex login status` decides that a login is reachable, never whose: a substituted, authenticated account passes readiness and a run proceeds under an undeclared credential. The delta: the guard is an external CLI's own check, so the closure is a declared blind spot plus machine custody, not a stronger probe.
- **PR #124, finding 1** — routing values were installed as frontmatter, which reads as machine-read configuration, while nothing parsed them: an unknown model alias, an effort level outside the platform's vocabulary, and two rows naming the same stage all passed green. The delta: the silence was introduced by the change itself, and the AC's own pass *documented* it as a declared blind spot rather than removing it — while ratified canon already carried the answer (Chapter 3, *The declaration schema*: where nothing reads a value, prose is correct and sufficient). A blind spot declared where a rule already forbids the shape is not a disclosure, it is the defect with a label on it.
- **PR #133, finding 2** — the payload-links walk filtered the tracked documents down to the manifest's declared paths, so a path the manifest ships and the tree does not carry was skipped rather than named: the check would have reported green over a file it never opened. The delta: it was caught by the AC's own pass before the summons, and the same disagreement was already refused three files away in `tools/sync/payload.ts` — the guard existed in the repository and the new reader did not inherit it.
- **PR #134, finding 1** — the host-reference scan counted every file it could not read and carried the count to the report, and the report then dropped it: both renderers returned early on an empty reference list, so a partial read produced a sync message that said nothing at all about the scan. The delta: the silence was in the *reporting* of a guard that worked. The count was computed, carried through two function boundaries, and discarded at the last one by a condition written for a different question — "is there a table to draw?" standing in for "is there anything to say?".

### An invariant enforced on one path and leaking through another

9 instances, across 5 pull requests — PR #39, PR #46, PR #59, PR #114, PR #124.

- **PR #39, finding 3** — the declared lens bounds were written in configuration and unenforced at dispatch.
- **PR #46, finding 2** — the conversion to a classified failure began after staging, so staging's own errors escaped raw.
- **PR #46, finding 4** — `process.exit()` abandoned an undrained stream; a payload over the 65,536-byte pipe buffer was cut off exactly there.
- **PR #46, finding 5** — the replacement stream could itself fail asynchronously, turning the classified exit 5 back into an unclassified 1.
- **PR #46, finding 9** — the stream guards sat inside the failure branch, leaving the success path unguarded.
- **PR #59, finding 3** — the partial-run report named the checks that ran and not the ones never attempted, so a short run read as a whole one.
- **PR #59, finding 7** — the fix for that then counted a blocked check twice, once as unmet and once as skipped. Three consecutive reviews each found the per-check accounting wrong in a new way; the cause was three parallel arrays with the invariant maintained by hand at four return sites, and the resolution was the re-plan on #52, not a fourth patch.
- **PR #124, finding 3** — a `config/gates.md` edit moving the Ship gate to `attested` restated that setting's floor as binding on unattended passes only, so an attended AC merge needed a conforming review alone. Chapter 3 names the independent gate re-run *a floor for `attested`*, unqualified. The delta, and the reason it belongs to this class rather than to restatement: the leak was authored **in the declaration that governs the gate**, by an AC that would have been the one merging under it — the one path where a narrowed invariant has nobody left to catch it, and it took the contractor review bound to the merge commit to find it.
- **PR #114, finding 2** — the four run outcomes covered drained, parked, spent, and killed, and the declared one-issue scope created a fifth ending — scope reached, admissible work left — with no truthful outcome to record. The delta: the leak sat between a canon list and a config declaration; the fix binds scope to canon's declared-budget clause, ending such a pass *spent*.

### Restatement of content another document owns

10 instances, across 7 pull requests — PR #41, PR #43, PR #51, PR #75, PR #76, PR #98, PR #112.

- **PR #41, finding 2** — four Skill steps restated canon mechanics the chapter owns.
- **PR #43, finding 1** — a configuration declaration restated the mechanics behind the value it declared.
- **PR #43, finding 2** — CLAUDE.md duplicated both the settings and the mechanics it was meant to point at.
- **PR #51, finding 3** — CLAUDE.md again, and the delta is that the restatement rode in on a pointer: the block named Chapter 3 and the two decision records, then restated the rules they own. Raised by the contractor reviewer.
- **PR #75, finding 1** — CLAUDE.md a third time, and the pointer shape a third time: the Learning section led with ADR 0018's decision sentence verbatim. The delta is that the section was modeled on the block PR #51 had already corrected, and the copy rode in anyway.
- **PR #76, finding 1** — a configuration declaration again, PR #43 finding 1's shape: the values were right and chapter-owned behavior was wrapped around them — the scheduling boundary, the sweep's call rule, the record's update mechanics.
- **PR #98, posture-pass finding** — a new Skill's compose step carried the reference grammar's content and a Readout rule's phrasing beside their links. The delta: caught and fixed by the AC's own pre-summons pass, before the reviewer saw it.
- **PR #98, finding 1** — the same Skill's stops section. The delta: the restated sentence is one the six stage Skills all carry as convention, copied into a seventh Skill whose own charter it then contradicted.
- **PR #98, finding 2** — the first instance in a Skill's bundled reference file rather than a Skill body, a chapter, or CLAUDE.md: the formats reference enumerated four Readout rules beside its link to them.
- **PR #112, finding 2** — the tracker credential's minting rule restated ADR 0026's unattended-pass floor as a local rule. The delta: the restatement carried its own denial in the same sentence — "restated nowhere else in this file."

### A statement true when written whose condition has since passed

8 instances, across 7 pull requests — PR #43, PR #45, PR #51, PR #71, PR #99, PR #112, PR #114.

- **PR #43, finding 5** — two ratified chapters said every merge is `required`, written truthfully and outlived by the flip that followed; promoted to [#44](https://github.com/wrburgess/deuce/issues/44).
- **PR #45, finding 7** — a heading read "(first response)" for every review, a label that marks a wave inside one invocation and stops being true across invocations.
- **PR #51, finding 4** — the seventh surface of #44's sweep, found by reading: `delegated` is not usable "for the same reason `attested` is not", where the clause outlived the flip even though the sentence around it stayed true.
- **PR #51, finding 5** — a Skill instructed that the pull request is "merged by the HC"; an instructing document, which PR #49's disposition already argued is the urgent half of this class.
- **PR #71, finding 1** — the adversarial pass found README.md carrying the same expired status claim the pull request was fixing in CLAUDE.md. The delta is the carrier: Chapter 3's ratification draft updated the status lines inside itself and Chapter 4's did not, so one missed step surfaced as two stale entry-point files.
- **PR #99, finding 1** — the fleet roster's nadal row said the seeded tools sit "dormant until the gate is wired": a live-status claim inside a historical entry, false the day the host wires its gate. Caught by the summoned lens; the line now records past facts only.
- **PR #112, finding 3** — the tracker credential's attended state read "the only state in use today," false the day the first unattended pass runs, with no update trigger named. The delta: a security-state claim, where staleness reads as assurance; the line now names the event that falsifies it and where the update lands. The sync entry carries the same phrase, batched as a follow-up per the findings home.
- **PR #114, finding 1** — the execute Skill's body said "today the HC calls one, attended," false the day #108 arms a trigger, inside the document that would still be directing execution. The delta: the carrier is a Skill body, whose whole contract is to link the variables it must not hold; invocation now defers to the factory's declaration, which is where the trigger moves.

### A fix that removes or narrows something it needed to keep

3 instances, across 3 pull requests — PR #41, PR #43, PR #45.

- **PR #41, finding 5** — a trim for restatement carried away the re-summons verb the fix-wave step depended on.
- **PR #43, finding 3** — a condensed pointer dropped Chapter 1, which owns one of the two gates it pointed at.
- **PR #45, finding 1** — a gloss took one of its source's two columns and added "only", narrowing a canon term while explaining it.
