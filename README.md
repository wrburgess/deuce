# deuce

deuce is a software development system for running projects that AI agents build, with human
judgment supplied at exactly two points: what to build, and what ships. It is both the written
standard and the reference implementation of that standard, kept in one public repository.

## Status

The standard is built one chapter at a time, and nothing is built that a ratified chapter does not
already sanction.

| Chapter | Covers | State | Work |
|---|---|---|---|
| 0 — Identity & governance | Who acts, who reviews, governing principles, decision records, work tracking | `ratified` | [#2](https://github.com/wrburgess/deuce/issues/2) |
| 1 — Lifecycle & skills | The five stages every piece of work passes through (Assess → Devise → Implement → Verify → Deliver), the two gates within them, the Readout format, and the Skills that run the stages | `ratified` | [#3](https://github.com/wrburgess/deuce/issues/3) |
| 2 — Review System & Findings System | How solicited review is summoned, bounded, and validated, and how everything a run learns is recorded, drained, and turned into rules | `ratified` | [#4](https://github.com/wrburgess/deuce/issues/4) |
| 3 — Quality gate & TypeScript tooling | The checks a change must pass, and the tooling that runs them | `not started` | [#5](https://github.com/wrburgess/deuce/issues/5) |
| 4 — Learning System | How outside material becomes reviewed configuration | `not started` | [#6](https://github.com/wrburgess/deuce/issues/6) |
| 5 — Distribution & fleet cutover | How other projects adopt deuce | `not started` | [#7](https://github.com/wrburgess/deuce/issues/7) |
| 6 — Factory automation | Running the system with the human away | `not started` | [#8](https://github.com/wrburgess/deuce/issues/8) |

The chapters themselves are in [`sds/`](sds/).

## How this repo grows

- **Chapter-gated.** A chapter is drafted, argued, merged, and tagged before anything it sanctions is
  built.
- **Ratification is a working session,** not an open-ended edit: the human and the agent settle the
  chapter's open questions one at a time, and every change lands on the chapter's own pull request.
- **Nothing unsanctioned.** If a piece of work has no ratified chapter behind it, the answer is a
  chapter, not a workaround. Amendment is cheap, so a chapter does not have to be right the first
  time.

## Adopting it

Not yet — adoption arrives with Chapter 5. Watch
[#7](https://github.com/wrburgess/deuce/issues/7).

## Provenance

deuce succeeds [ace](https://github.com/wrburgess/ace), which is being retired rather than
refactored. Its founding argument — what was kept, what was dropped, and why — is the
[reboot design document](https://github.com/wrburgess/ace/blob/main/docs/superpowers/specs/2026-08-01-deuce-reboot-design.md).
That document is history; [`sds/`](sds/) is canon.

## Vocabulary

Every term of art this system uses has one entry in [`GLOSSARY.md`](GLOSSARY.md). It is a reference,
not something to read front to back.

## License

[MIT](LICENSE).
