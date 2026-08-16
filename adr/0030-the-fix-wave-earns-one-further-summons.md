# ADR 0030: The fix wave earns one further summons, bound to the head that merges

- Status: accepted
- Date: 2026-08-16

## Decision

**A fix wave that moves a pull request's head earns one further contractor summons, bound to that
head, scoped to the wave's diff and to the lenses that raised the findings — and never a second.**
Chapter 2's rule that *"the external review runs once per pull request… a fix wave never triggers a
second"* is narrowed to that extent. The rule is unconditional: it does not wait on which setting the
Ship gate runs at, and it applies from the ratification that lands it.

**What the further summons cannot do is answer itself with code.** Nothing it finds is fixed in that
pull request. A `must-fix` sends the pull request to the HC to merge; a `should-fix` is promoted to
tracked work or accepted as residual, on the record; a `note` is recorded. There is never a third
summons.

**And the binding is stated for every cause, not only for fixes.** A head that moves after the last
conforming review — a further fix, or an update from the base branch — carries no review's binding,
and that pull request goes to the HC.

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
  new round is terminal by construction: it cannot earn a successor, because its findings are never
  answered with code in that pull request. The fifteen-round tail ran precisely because each round
  was.
- **A defect the further summons finds that is not a `must-fix` is not fixed in the change that
  produced it.** It is tracked or accepted, on the record. That is the replacement residual, and it is
  the price of the binding holding.

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
