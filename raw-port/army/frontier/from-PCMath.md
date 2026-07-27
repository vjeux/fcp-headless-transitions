# Frontier surfaced by port-PCMath (commit 93491d4) — 2026-07-27
CMTime free-functions (belong in a CMTime free-fn file, not the struct):
  - operator*(CMTime const&, double)   __ZmlRK6CMTimed   [PCMath inlined a sign-flip; faithful port TODO]
  - PC_CMTimeSaferSubtract overflow-handling  (CMTime.ts aliases plain subtract; "safer" path undecoded)
  - kCMTimeZero literal  @DATA_CONST 0x147820  (PCMath used CMTimeMake(0,ts); add exported const if faithful obj needed)
Shared ProCore double-constant pool @0x1225a0..0x122b40 (gammaln cof pairs, 2π, √2π, -gammln(½), 1e-30/1e30 Lentz clamps).
  -> future ProCore ports must REUSE these VA citations, not re-invent constants.
libSystem math stubs (log/exp/pow/cos/acos/sqrt) mapped to Math.*; re-check if bit-exact ever demanded
  for gammaln/erf/cubic (no oracle node for those yet — candidate new registry nodes).
Verified-quirk (do not "fix"): inverseEaseInOut @0x13244 is NOT the algebraic inverse of easeInOut;
  Apple ships xmm8 = d7 - 0.5*y*d4m (probe y=0.5 -> 0.625, matches dlsym). Transcribe as-is.
