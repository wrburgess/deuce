# ADR 0029: The independent gate runner may be software once the HC leaves the merge

- Status: accepted
- Date: 2026-08-16

## Decision

**Chapter 3's independent re-run of the quality gate is performed by continuous integration, not by
the HC**, and the ruling that reserved it to the HC is lifted. Which provider, which trigger, and
which runner version remain dated configuration; that the runner may be software is what this record
fixes.

[#53](https://github.com/wrburgess/deuce/issues/53) closed not-planned on 2026-08-04 at the HC's
Direction gate — *"the independent runner is the HC, not new software"* — and bound the shape of any
future answer to *"one line of dated configuration naming the runner and the command — not a
workflow, not a credential, not a platform."* Both the ruling and its shape constraint are lifted
here by the HC, on the requirement #53 did not have: the HC leaving the merge gate. The chosen answer
**is** a workflow and a platform, which is precisely what #53 forbade, and that is stated rather than
reconciled away.

**What does not move.** The gate stays one command with one definition — the workflow enumerates no
checks and invokes `npm run gate`, so [`config/checks.md`](../config/checks.md) remains the only
place a check joins the gate ([ADR 0015](0015-one-gate-one-command-local-and-ci.md)). The floor
itself is untouched: `attested` still requires a re-run by something that is not the AC, and this
record decides only what may fill that role.

## Why (the trade-off that was live)

**The condition #53's ruling rested on has passed.** Its answer was correct on its facts and is a
textbook instance of this repository's own standing class — *a statement true when written whose
condition has since passed*. The HC running one command satisfied the requirement because the HC was
in the merge loop by design and was present anyway. With the HC out of that loop, nobody runs the
command and the requirement is met by nothing at all. #53 named this door itself: *"If evidence ever
argues for automation… that is a new finding citing this one."*

**The recorded finding class is knowingly recurred.** #53 banked a `lesson` naming the class
*automation proposed where a human exercising one command satisfies the floor*, and
[#126](https://github.com/wrburgess/deuce/issues/126) recurred it one issue later. The class is not
wrong and is not retired. What fails is its unstated precondition — that a human is present to
exercise the command. Recurring it deliberately, on the record, is the cost of this decision rather
than an argument against it.

**What was given up, and all three are real:**

- **Software was built where a human command would have done.** That is the thing #53 turned down,
  and no framing here makes it something else.
- **Platform coupling.** The same company now stores the code and checks it. Accepted on the grounds
  that the requirement is independence from the AC, not from GitHub — and that provider is dated
  configuration, replaceable without touching canon. A runner off GitHub was the alternative, priced
  at a credential, a second machine, and a liveness problem, and declined twice: as #53's Option C on
  2026-08-04, and again at this sitting.
- **The AC authors the thing that independently checks the AC.** What holds them apart is that the
  workflow decides nothing and enumerates nothing — it invokes the one command and GitHub records the
  verdict where neither party can edit it. The residue is that the AC still writes the file, and it
  is carried as a named risk on [#127](https://github.com/wrburgess/deuce/issues/127) rather than
  argued away.

**Why it is hard to reverse.** Reversing this puts the HC back to running the gate per merge
candidate, which puts the HC back in the merge loop, which is the whole of what #127 exists to leave.
The decision is cheap to undo as a file and expensive to undo as a position, and
[ADR 0005](0005-merge-authority-graduated-from-birth.md) is the standing warning about exactly that
asymmetry near a gate.

**Why it is surprising.** A reader who had read #53 and nothing since would predict the opposite
answer, and would be right to.

## Supersedes / references

- [#53](https://github.com/wrburgess/deuce/issues/53) — the ruling lifted here, and the door it left
  open. Nothing in `adr/` is superseded; #53 is a tracker disposition, not a record.
- [ADR 0015](0015-one-gate-one-command-local-and-ci.md) — the floor this serves, and the one
  definition the workflow may not duplicate.
- [ADR 0005](0005-merge-authority-graduated-from-birth.md) — merge authority graduated from birth;
  the reason a loosening near a gate is recorded rather than absorbed.
- [Chapter 3](../sds/03-quality-gate-and-tooling.md) → *The transitional state, stated plainly* — the
  gap this closes; [Chapter 6](../sds/06-factory-automation.md) → *The gates, unattended* — the
  consumer that made it binding.
- Settled at the `distill` sitting on [#127](https://github.com/wrburgess/deuce/issues/127),
  2026-08-16; the build is [#126](https://github.com/wrburgess/deuce/issues/126).
