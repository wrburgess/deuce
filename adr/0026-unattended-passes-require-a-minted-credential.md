# ADR 0026: An unattended pass requires a minted credential; the attended state never runs unattended

- Status: accepted
- Date: 2026-08-11

## Decision

No factory pass runs unattended until every credential it touches has a minted form conforming to
its written blast-radius declaration. The attended state — the HC's own login, whose declared
blast radius is the HC's whole reach, watched — never runs unattended: with the HC away, that
declaration is void. The factory's own tracker credential owes its entry before the pass that
would use it exists. The budget is deliberately **not** a second precondition: `config/capacity.md`'s
number is enforced by the pass when one is declared — a spent budget ends the pass, on the record —
and an undeclared budget stops nothing.

## Why (the trade-off that was live)

- **What was given up:** the convenient path. The HC's logged-in credential is already on the
  machine and strictly more powerful than anything that would be minted — automation that borrows
  it works on day one. Refusing it means the factory stays dark until minting happens, and minting
  is real work with the HC in it.
- **What was also given up:** the draft's second precondition, a mandatory budget. The HC kept the
  enforcement and dropped the requirement: the day a number matters, the mechanism already exists;
  until then, unattended work runs unbudgeted exactly as attended work does.
- **Why the credential floor holds anyway:** Chapter 0's third trust rule already makes the
  declaration precede automation. This decision makes the declaration's own terms binding — a
  blast radius that ends with *watched* is not a smaller risk when nobody is watching; it is an
  unwritten one. The first automated credential was bound this way before it existed
  ([`config/credentials.md`](../config/credentials.md)), and this generalizes that shape to every
  credential a pass touches.
- **Why it is hard to reverse:** the first unattended run under a borrowed credential sets the
  precedent that reach is whatever happens to be lying on the machine, and every credential minted
  afterward competes with a working setup.
- **Why it is surprising:** the factory's whole purpose is running without the HC, and its first
  floor is a step only the HC can perform.

## Supersedes / references

- Ratified chapter: [`sds/06-factory-automation.md`](../sds/06-factory-automation.md) — *The
  credential precondition*.
- Chapter 0's standing rule: [`sds/00-identity-and-governance.md`](../sds/00-identity-and-governance.md)
  — *Trust boundary*, rule 3.
- Settled at the ratification session on
  [PR #102](https://github.com/wrburgess/deuce/pull/102#issuecomment-5260387500) (Q3), narrowing
  the draft's two preconditions to one.
