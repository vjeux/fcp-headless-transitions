# Porting Spec — the contract every army agent obeys

This is the discipline that keeps the port FAITHFUL. It is derived from real mistakes already made
and corrected on this project (a hand-written Newton "bezierSegment" and a paraphrased interp
string-enum were both DELETED because they were rewrites, not transcriptions).

## Rule 1 — Transcribe, don't reimplement
Read the disassembly of the exact function. Write TS that mirrors its control flow and arithmetic
line-for-line. You are not allowed to "write a function that behaves the same" — you port THIS one.

## Rule 2 — Cite provenance on every function
Doc comment MUST contain the source `@0xADDR` and framework. Every constant cites the address it was
read from. Every vtable call cites the resolved target symbol+addr. This is enforced by
`tools/lint_provenance.py` and is how the ledger detects completion.

## Rule 3 — Throw on undecoded, never approximate
If a branch/callee/subroutine isn't decoded yet, call it through a stub that `throw`s
`"<name> @0xADDR not yet transcribed"`. A loud gap is correct. A plausible guess is a defect that
silently corrupts everything downstream.

## Rule 4 — Match the machine's numerics
- Single-precision ops (`cvtss2sd`/`cvtsd2ss`, `*f` libm like cosf/sinf) -> wrap in `Math.fround`.
- int64 -> bigint where the value can exceed 2^53 (CMTime.value, hashes). Otherwise number is fine.
- Rational time stays in CMTime (value/timescale); never divide to seconds earlier than the binary.
- Respect signed/unsigned widths at truncation points (& 0xffffffff, asIntN, etc.).

## Rule 5 — Model structs, not magic numbers
`vertex+0x10` etc. must be named/typed fields with the offset documented, not raw literals scattered
in code. Layouts are recovered from ctors + accessor disasm and recorded in re/<Struct>_LAYOUT.md.

## Rule 6 — One class per file; imports only
No cross-file reaching into internals. Match FCP's class boundaries exactly so files map 1:1 to
symbols and reviewers can diff a class against its disassembly.

## Rule 7 — Verify before commit
- `tsc --noEmit` clean.
- `npm run parse:all` stays 65/65 (regression corpus).
- A micro-check: assert the ported fn reproduces a value derivable from the disasm/formula OR from a
  real .motr, and put the numbers in the commit message (e.g. "SCurve f=0.25 -> 14.6447 == (1-cos πf)/2").
- COMMIT + PUSH immediately, one class per commit, message citing the addresses + the verification.

## Rule 8 — Oracle when possible
For pure-math units, wire the dlsym parity harness (fct/parity/) to compare TS vs the live FCP symbol
bit-for-bit. Mark such units "verified". Units not yet oracle-checkable are "ported" + backlogged.

## Anti-patterns (auto-reject at review)
- A function with no @0xADDR citation.
- A numeric constant with no address provenance.
- A `// TODO approximate` / silent fallback instead of a throw.
- A "helper" that doesn't correspond to a real FCP function (invent-a-function smell).
- Reformatting/ް"cleaning up" logic away from the instruction structure.
