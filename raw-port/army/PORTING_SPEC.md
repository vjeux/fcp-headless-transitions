# Porting Spec — the contract every army agent obeys

## Nested-class file naming: `Outer__Inner` (double underscore)

One C++ class = one `.ts` file, and a NESTED class joins its outer names with a **double**
underscore: `OZOpticalFlow::Private::CacheFileHeader` -> `OZOpticalFlow__Private__CacheFileHeader.ts`
(precedent: `PCBezierNamespace__SampledContour.ts`).

This is not cosmetic. Two workers filed the same class under `_` and `__` and **both landed**, so
main now carries two files modelling one C++ class with two struct layouts that can silently drift —
and they already differ: each copy holds addresses the other lacks. `check_duplicate_classes.py`
normalizes underscore runs so the variant is rejected, but the convention is what prevents the work
being done twice in the first place.


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

### x86 AT&T decode cheat-sheet (READ THIS before hand-deriving any compare/branch)
otool/objdump print **AT&T syntax**: operands are `src, dst` and a compare computes **`dst - src`**
(the REVERSE of Intel order). Getting this backwards silently inverts a clamp/branch — the single
most-repeated, most-expensive decode mistake in this codebase. The truth table (float `ucomisd`/
`ucomiss` and unsigned/CF-based `cmp`; `ja/jae/jb/jbe/seta/setae/setb/setbe` are the CF/ZF pair):

- `ucomisd %xmm_src, %xmm_dst` sets flags on **`dst - src`**. So:
  - `jb`  / `setb`  (CF=1)        -> **dst <  src**
  - `jbe` / `setbe` (CF=1 or ZF=1)-> **dst <= src**
  - `ja`  / `seta`  (CF=0 & ZF=0) -> **dst >  src**
  - `jae` / `setae` (CF=0)        -> **dst >= src**
  - `je`  / `sete`  (ZF=1)        -> **dst == src** (also set when UNORDERED — a NaN operand sets
    CF=ZF=PF=1, so `jb`/`jbe`/`je` all take on NaN; guard with `jp`/`jnp` if the binary does).
- Same rule for integer `cmp %src, %dst` -> `dst - src`; signed uses `jl/jle/jg/jge`, unsigned `jb/…`.
- `subsd %src, %dst` -> `dst = dst - src`; `divsd %src, %dst` -> `dst = dst / src` (dst is left op).
- `setCC %r8b` / `cmovCC` share the SAME condition tables as the `jCC` above — read the dst-src sub.
- `comiss/comisd` vs `ucomiss/ucomisd`: identical ordering flags; differ only on which NaN raises an
  FP exception (irrelevant to a faithful value port).
- Worked example (FatLine::intersectHull): `ucomisd %xmm4, %xmm2 ; jb L` where xmm2=dist, xmm4=dLow
  => branch taken iff `dist < dLow`. Then `ucomisd %xmm2, %xmm3 ; jb L` (xmm3=dHigh) => taken iff
  `dHigh < dist`. "Fall through to the update" = NOT-taken on both = `dLow <= dist <= dHigh` (inside).
When in doubt, WRITE the dst-src subtraction next to the branch in a comment and read the table.

## Rule 5 — Model structs, not magic numbers
`vertex+0x10` etc. must be named/typed fields with the offset documented, not raw literals scattered
in code. Layouts are recovered from ctors + accessor disasm and recorded in re/<Struct>_LAYOUT.md.

## Rule 6 — One class per file; imports only
No cross-file reaching into internals. Match FCP's class boundaries exactly so files map 1:1 to
symbols and reviewers can diff a class against its disassembly.

## Rule 7 — Verify before commit
- `tsc --noEmit` clean.
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

## Naming rule (STRICT): one file per FCP class, named after the class
- File name = the exact FCP class name: `OZLinearInterpolator.ts`, `PCMatrix44Tmpl_double.ts`, etc.
- NEVER a grab-bag file (no `interpolators.ts`, no `utils.ts`). Each function goes in its owning class.
- A free function goes in a file named after it (or its translation-unit), not a catch-all.
- Reviewers reject any file that holds more than one FCP class or isn't named after what it contains.
