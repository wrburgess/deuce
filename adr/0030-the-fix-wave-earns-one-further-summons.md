# ADR 0030: The fix wave earns one further summons, bound to the head that merges

- Status: accepted
- Date: 2026-08-16

## Decision

**A fix wave that moves a pull request's head earns one further contractor summons, bound to that
head, scoped to the wave's diff and to the lenses that raised the findings — and never a second.**
Chapter 2's rule that *"the external review runs once per pull request… a fix wave never triggers a
second"* is narrowed to that extent. The rule is unconditional: it does not wait on which setting the
Ship gate runs at, and it applies from the ratification that lands it.

**What the further summons cannot do is earn another one.** A `must-fix` it raises is answered as the
severity framework requires — fixed with fail-first evidence, or refuted with the refuting evidence
recorded — because no read narrows that framework; fixing it moves the head past the review, and the
merge returns to the HC's hands. Nothing below `must-fix` is answered with code there: a `should-fix`
is promoted to tracked work or accepted as residual, a `note` is recorded. There is never a third
summons.

**And the binding is stated for every cause, not only for fixes.** Once the summons owed has
returned, the head is final: any movement past the last conforming review — a further fix, an update
from the base branch, anything — leaves no review bound to what merges, and that pull request goes to
the HC. The wave's own movement is excluded, being the movement the further summons exists to cover.

**What does not move.** The AC's own fix-verification stands whole, at full strength, and the further
summons adds an examiner rather than replacing one. The one-wave limit is unchanged. Chapter 0's
floor is untouched: this record makes *bound to the exact commit being merged* reachable; it does not
widen it.

## Why (the trade-off that was live)

**Two ratified rules did not compose.** Chapter 2 ran the contractor review once per pull request and
never re-summoned it for the wave. Chapter 0 and
[ADR 0005](0005-merge-authority-graduated-from-birth.md) require a review bound to the exact commit
being merged. On any pull request whose review returned a finding, the two together produce a review
bound to a commit that is not the one that merges. Measured on 2026-08-16 across every merged pull
request since the summons machinery landed: the commit named in the returned review equalled the
merged head on 4, differed on 14, and 4 carried no review commit on record. On 13 of those 14 the
returned review itself carried a `must-fix`, so the wave is contractor-driven and reordering the
stages would have bought nothing.

**Chapter 2 named this residual when it set the rule** — *"a defect introduced by a fix can now ship
past the reviewer"* — and priced it on #62 with the HC merging every pull request. The Ship gate's
loosened setting removes that backstop, so the residual stops being absorbed by anything. The changed
condition is what admits the amendment; the trade is not re-litigated on the facts #62 had.

**Why unconditional rather than conditioned on the setting.** The two forms produce the same words
and differ only in whether the rule sleeps until the Ship gate moves. Chosen unconditional by the HC
at the Direction gate on #129, 2026-08-16, on the argument that a rule whose first-ever execution is
the first run with nobody watching rebuilds the very failure this line of work exists to close: a
claim that reads as evidence and is not. It also keeps the chapter one rule with no exception clause,
which is one fewer place for a setting and a floor to drift apart —
[the reversal on PR #124](https://github.com/wrburgess/deuce/pull/124) is the standing receipt for how
that goes wrong.

**What was given up, and both are real:**

- **The round economics Chapter 2 closed, re-opened by one round.** The bound exists because the
  predecessor's tail ran to fifteen rounds on a single finding
  ([ace #164](https://github.com/wrburgess/ace/issues/164)), and this costs one more external round on
  roughly three of every four pull requests here. What keeps it from being a round count is that the
  new round is terminal: the summons count is fixed at two, and a `must-fix` answered on the second
  ends in the HC's merge rather than in a third read. The fifteen-round tail ran because every answer
  earned another round; here no answer earns one.
- **A defect the further summons finds below `must-fix` is not fixed in the change that produced
  it.** It is tracked or accepted, on the record. That is the replacement residual, and it is the
  price of the binding holding.
- **A `must-fix` the further summons raises is closed by code no second party then reads.** The
  residual the amendment removes from the first wave reappears one round out, smaller: it arrives only
  where the second read raised a `must-fix`, and what stands there is the HC's merge and the
  fail-first anchor rather than another review. How often that happens is unmeasured — the second read
  has never run — and it is the second thing #127 says to watch.

**What to watch.** How often the `must-fix`-to-the-HC fallback fires. Frequent firing means the
amendment is not paying, and it is the measurement that would revisit this record.

**Why it is hard to reverse.** The Ship gate's loosened setting is admitted on this rule standing
(#130). Reversing it after that flip removes a floor while automation depends on it — the asymmetry
[ADR 0005](0005-merge-authority-graduated-from-birth.md) exists to warn about, arriving at the moment
ADR 0005 predicted.

**Why it is surprising.** Chapter 2's plain text says a fix wave never triggers a second review, and
says so with measured evidence behind it. A reader who had read Chapter 2 and nothing since would
predict the opposite answer, and would be right to on the facts they had.

## Supersedes / references

- [Chapter 2](../sds/02-review-and-findings.md) → *Fix-verification, bounded separately* — the rule
  narrowed here, amended in place at this ratification. Nothing in `adr/` is superseded;
  [ADR 0010](0010-review-bounded-by-lens-set.md)'s bound is served rather than
  loosened, since the further summons re-runs only lenses that already returned findings.
- [ADR 0005](0005-merge-authority-graduated-from-birth.md) — the independent, commit-bound review this
  makes reachable.
- [ADR 0029](0029-the-independent-gate-runner-may-be-software-when-the-hc-is-absent.md) — the other
  leg of the same gate, settled at the same sitting.
- [`config/review.md`](../config/review.md) — the one-wave number, which this does not change, and the
  dated note recording why the never-re-summoned clause is gone.
- Settled at the `distill` sitting on [#127](https://github.com/wrburgess/deuce/issues/127),
  2026-08-16; conditioning chosen at the Direction gate on
  [#129](https://github.com/wrburgess/deuce/issues/129), 2026-08-16; the flip it unblocks is
  [#130](https://github.com/wrburgess/deuce/issues/130).
