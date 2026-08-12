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
| 3 — Quality gate & tooling | The checks a change must pass, what a check may be asked to decide, and the evidence a check ships with | `ratified` | [#5](https://github.com/wrburgess/deuce/issues/5) |
| 4 — Learning System | How outside material becomes reviewed configuration | `ratified` | [#6](https://github.com/wrburgess/deuce/issues/6) |
| 5 — Distribution & fleet cutover | How other projects adopt deuce | `ratified` | [#7](https://github.com/wrburgess/deuce/issues/7) |
| 6 — Factory automation | Running the system with the human away | `ratified` | [#8](https://github.com/wrburgess/deuce/issues/8) |

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

Adoption is sanctioned as of [Chapter 5](sds/05-distribution.md): a project takes deuce one system
at a time, and each system it takes, it takes whole — with the floors that make it that system. What
ships is declared path by path in a payload manifest; the standard itself never ships, and is read
at its source. Updates reach an adopting project only as pull requests, judged by that project's own
gates.

The machinery — the manifest, the vendoring receipt, the sync — was built under
[#7](https://github.com/wrburgess/deuce/issues/7) and has run end-to-end: the fleet's hosts took
the payload by manifest and receive updates as pull requests. Adopting begins with the chapter;
the fleet roster and what ships to it are dated configuration, in [`config/`](config/).

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
