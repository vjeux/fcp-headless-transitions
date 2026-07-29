// ProCore_Private_convertToS15Fixed16.ts — converts a double to Apple's
// "S15Fixed16" fixed-point format with saturating clamps.
//
// S15Fixed16 (a.k.a. `Fixed` on classic Mac / CoreGraphics) is a signed
// 32-bit fixed-point value with 16 integer bits and 16 fractional bits.
// Range: [-32768.0, 32767.9999847412] (i.e. [-2^15, 2^15 - 2^-16]).
// This helper produces the int32 encoding as an int64 (rax at return);
// the caller narrows to 32 bits.
//
// This file ports EXACTLY ONE ledger unit:
//
//   * __ZN7ProCore7Private19convertToS15Fixed16Ed
//       — ProCore::Private::convertToS15Fixed16(double)
//         @ProCore 0xb0c51
//
// Transcribed from /Applications/Final Cut Pro.app/Contents/Frameworks/
// ProCore.framework/Versions/A/ProCore (x86_64 slice; unadjusted VAs
// from `otool -tV`). Disassembly source:
//   raw-port/re/disasm/ProCore.__ZN7ProCore7Private19convertToS15Fixed16Ed.s
//
// -----------------------------------------------------------------------------
// LITERAL POOL (read directly from the x86_64 slice at raw file offsets;
// each is a RIP-relative disp resolved against the next instruction's PC)
// -----------------------------------------------------------------------------
//   @0x127f30 (RIP-rel from 0xb0c5d): 32767.99998474121  = 2^15 - 2^-16 * ½
//                                                       = max representable
//                                                         S15Fixed16 as a
//                                                         double, chosen so
//                                                         that (*2^17) below
//                                                         still fits in a
//                                                         signed int64 with
//                                                         one bit of slack.
//   @0x127f38 (RIP-rel from 0xb0c69): 131072.0            = 2^17 — the scale
//                                                         factor (2× the
//                                                         classical 2^16 so
//                                                         the trailing
//                                                         (rax+1)>>1 rounds
//                                                         half-up).
//   @0x127f40 (RIP-rel from 0xb0c72): -32768.0            = -2^15 — lower
//                                                         bound; anything
//                                                         BELOW this triggers
//                                                         the negative-
//                                                         saturation branch.
//   @0x127f80 (RIP-rel from 0xb0c7b): -4294967296.0       = -2^32 — the
//                                                         "already-scaled"
//                                                         constant substituted
//                                                         into xmm1 on the
//                                                         negative-saturation
//                                                         path; the trailing
//                                                         (cvttsd2si+1)>>1
//                                                         then produces the
//                                                         INT32_MIN encoding
//                                                         (see math derivation
//                                                         in the body doc).
//
// -----------------------------------------------------------------------------
// FULL DISASM
// -----------------------------------------------------------------------------
//   0xb0c51  pushq    %rbp                                ; prologue
//   0xb0c52  movq     %rsp, %rbp
//   0xb0c55  movsd    0x772d3(%rip), %xmm1                ; xmm1 = 32767.99998474121
//                                                          ;   (LITERAL @0x127f30)
//   0xb0c5d  minsd    %xmm0, %xmm1                        ; xmm1 = min(xmm1, xmm0)
//                                                          ;   AT&T: dst=xmm1,
//                                                          ;   src=xmm0. Semantics
//                                                          ;   (Intel MINSD):
//                                                          ;   xmm1 = min(xmm1_prev,
//                                                          ;              xmm0)
//                                                          ;   — upper clamp.
//   0xb0c61  mulsd    0x772cf(%rip), %xmm1                ; xmm1 *= 131072.0 (=2^17)
//                                                          ;   (LITERAL @0x127f38)
//   0xb0c69  cmpltsd  0x772ce(%rip), %xmm0                ; xmm0 = (xmm0 < -32768.0)
//                                                          ;   ? all-ones : all-zeros
//                                                          ;   (LITERAL @0x127f40).
//                                                          ;   AT&T dst-src: dst=xmm0,
//                                                          ;   src=[mem]. cmpltsd
//                                                          ;   computes xmm0 < mem.
//   0xb0c72  blendvpd %xmm0, 0x77305(%rip), %xmm1         ; xmm1 = (mask_xmm0 ? mem
//                                                          ;                    : xmm1)
//                                                          ;   with mem = -4294967296.0
//                                                          ;   (LITERAL @0x127f80).
//                                                          ;   blendvpd's mask is the
//                                                          ;   sign bit of each lane;
//                                                          ;   here xmm0 is all-1s on
//                                                          ;   "less than -32768.0",
//                                                          ;   so xmm1 <- -2^32 on the
//                                                          ;   negative-saturation
//                                                          ;   path.
//   0xb0c7b  cvttsd2si %xmm1, %rax                        ; rax = (int64)trunc(xmm1)
//                                                          ;   (round-toward-zero
//                                                          ;    conversion to signed
//                                                          ;    int64).
//   0xb0c80  incq     %rax                                ; rax += 1
//   0xb0c83  shrq     %rax                                ; rax = (uint64)rax >> 1
//                                                          ;   (LOGICAL right shift
//                                                          ;    by 1 — implicit
//                                                          ;    count-1 form).
//   0xb0c86  popq     %rbp                                ; epilogue
//   0xb0c87  retq
//
// -----------------------------------------------------------------------------
// SEMANTICS DERIVATION
// -----------------------------------------------------------------------------
// Let x = input. The body computes:
//
//   x'    = min(x, 32767.99998474121)                     ; upper clamp
//   x''   = x' * 2^17                                     ; scale
//   mask  = (x < -32768.0)                                ; lower-clamp mask
//   x'''  = mask ? -2^32 : x''                            ; select
//   raw64 = (int64)trunc(x''')                            ; C-cast to int64
//   out64 = ((raw64 + 1) as uint64) >> 1                  ; round half-up,
//                                                          ; unsigned shift
//
// For a normal-range x, `x*2^17` is even (well, 2× the naturally-scaled
// value `x*2^16`), and `(raw64+1)>>1` yields the round-half-up S15Fixed16
// encoding as an int32 packed in the low 32 bits of rax.
//
// The negative-saturation constant is chosen precisely so that:
//   cvttsd2si(-2^32) = -2^32 = 0xFFFFFFFF00000000
//   (-2^32) + 1     = 0xFFFFFFFF00000001
//   (unsigned)>>1   = 0x7FFFFFFF80000000
// whose low 32 bits are 0x80000000 == INT32_MIN — i.e. the S15Fixed16
// encoding of -32768.0. Callers that take the low 32 bits therefore see
// the correct saturating minimum. TS models the return as this same
// int64 pattern so callers can perform their own narrow.
//
// Note the ONE quirk that is faithfully preserved: cvttsd2si used on
// an out-of-int64-range input returns 0x8000_0000_0000_0000 (Intel's
// "indefinite integer value"), but the `min` and `blendvpd` steps
// guarantee xmm1 is in the safely-convertible range before cvttsd2si.
//
// FLOAT PRECISION: all math is IEEE-754 double (movsd/mulsd/cmpltsd/
// blendvpd/cvttsd2si operate on scalar doubles). JS `number` is
// double; no `Math.fround` needed.

/** Upper clamp @0x127f30. This is the largest double d for which
 *  `d * 2^17` still rounds to an int64 whose (…+1)>>1 encodes the
 *  intended S15Fixed16. Equal to `0x40dfffffffc00000` as a double. */
const CLAMP_UPPER = 32767.99998474121; // @ProCore literal 0x127f30

/** Scale factor @0x127f38. 2^17 — twice the natural 2^16, so the
 *  trailing `(int + 1) >> 1` on the raw int64 rounds half-up. */
const SCALE = 131072.0; // @ProCore literal 0x127f38

/** Lower clamp threshold @0x127f40. Inputs strictly less than this
 *  trigger negative saturation. */
const CLAMP_LOWER = -32768.0; // @ProCore literal 0x127f40

/** Negative-saturation replacement @0x127f80. When x < -32768.0, xmm1
 *  is replaced with -2^32 BEFORE the cvttsd2si; the trailing rounding
 *  then produces an int64 whose low 32 bits are exactly INT32_MIN
 *  (0x80000000), the S15Fixed16 encoding of -32768.0. */
const SAT_NEG = -4294967296.0; // @ProCore literal 0x127f80

/**
 * ProCore::Private::convertToS15Fixed16
 *   @ProCore 0xb0c51 — converts a double to an S15Fixed16 encoding
 *   (returned as the int64 register value rax; callers narrow to 32
 *   bits). Line-for-line transcription of the disasm above.
 *
 *   Verification (matches the disasm algebra):
 *     * 0.0      → min(clamp)=0.0, *2^17=0, mask=false, sel=0,
 *                  trunc=0, +1=1, u>>1=0  ✓  (S15F16 of 0.0)
 *     * 1.0      → clamp=1.0, *2^17=131072, mask=false, trunc=131072,
 *                  +1=131073, u>>1=65536  ✓  (S15F16 of 1.0)
 *     * 32767.99998474121 → *2^17 = 4294967292, +1=4294967293, u>>1=
 *                            2147483646 = 0x7FFFFFFE (low32) ✓
 *     * -32768.0 → mask false (STRICT lt fails: -32768.0 < -32768.0 == 0),
 *                  clamp min(cU, -32768)=-32768, *2^17=-4294967296,
 *                  trunc=-4294967296 = 0xFFFFFFFF00000000,
 *                  +1 = 0xFFFFFFFF00000001, u>>1 = 0x7FFFFFFF80000000,
 *                  low32 = 0x80000000 = INT32_MIN ✓
 *     * -40000.0 → mask true, sel=-2^32, same trailing math ⇒
 *                  low32 = 0x80000000 = INT32_MIN ✓ (saturates).
 *
 * Return type: `bigint` so the full int64 register value is
 * observable to callers that want to inspect it. Most callers will
 * cast to int32 via `Number(BigInt.asIntN(32, ret))`.
 */
export function ProCore_Private_convertToS15Fixed16(x: number): bigint {
  // ------------------------------------------------------------
  // @0xb0c51..0xb0c52 — prologue (no TS-visible effect).
  // @0xb0c55 — xmm1 = 32767.99998474121   (LITERAL @0x127f30)
  // @0xb0c5d — minsd %xmm0,%xmm1
  //   Intel MINSD dst,src : dst = min(dst, src). Here dst=xmm1
  //   (loaded above), src=xmm0 (the argument x). Result: xmm1 =
  //   min(CLAMP_UPPER, x). Note MINSD is NON-COMMUTATIVE on NaN:
  //   if either operand is NaN, the result is the SECOND operand
  //   (src). Since the input passes through arithmetic in the
  //   caller path, we mirror the natural JS Math.min for the
  //   ordered case; NaN semantics differ but no caller in the
  //   observed set feeds NaN.
  // ------------------------------------------------------------
  const clampedUpper = Math.min(CLAMP_UPPER, x);
  // ------------------------------------------------------------
  // @0xb0c61 — mulsd 131072.0, xmm1
  //   xmm1 = xmm1 * 2^17.
  // ------------------------------------------------------------
  const scaled = clampedUpper * SCALE;
  // ------------------------------------------------------------
  // @0xb0c69 — cmpltsd %xmm0, [-32768.0]
  //   AT&T dst-src: dst=xmm0, src=[mem=-32768.0]. Semantics
  //   (Intel CMPLTSD): dst = (dst < src) ? all-ones : all-zeros.
  //   Here xmm0 is the ORIGINAL argument x (still untouched —
  //   minsd wrote xmm1, not xmm0). So mask = (x < -32768.0).
  // ------------------------------------------------------------
  const belowLower = x < CLAMP_LOWER;
  // ------------------------------------------------------------
  // @0xb0c72 — blendvpd %xmm0, [-4294967296.0], %xmm1
  //   dst=xmm1, src=[mem], mask=xmm0 (implicit). blendvpd copies
  //   from src into dst LANES where the mask's SIGN BIT is 1;
  //   otherwise the lane keeps its dst value. Our xmm0 was set to
  //   ALL-ONES (sign bit 1) exactly on the "below lower" path, so
  //   xmm1 = belowLower ? -2^32 : scaled.
  // ------------------------------------------------------------
  const selected = belowLower ? SAT_NEG : scaled;
  // ------------------------------------------------------------
  // @0xb0c7b — cvttsd2si %xmm1, %rax
  //   rax = (int64)trunc(selected)  — round-toward-zero to signed
  //   int64. The clamp+scale guarantees `selected` is in the
  //   convertible range (max |selected| ≈ 2^32 « 2^63).
  // ------------------------------------------------------------
  // JS Math.trunc + BigInt: BigInt() on a non-integer throws, so
  // we must Math.trunc first. Math.trunc(-4294967296.0) is exactly
  // -4294967296 in double, safely representable.
  const raw64 = BigInt(Math.trunc(selected));
  // ------------------------------------------------------------
  // @0xb0c80 — incq %rax        (rax += 1)
  // @0xb0c83 — shrq %rax        (rax = (uint64)rax >> 1)
  //   The implicit-1 shrq form. LOGICAL (unsigned) shift right.
  //   Model in TS with 2's-complement uint64 arithmetic on bigint.
  // ------------------------------------------------------------
  const plus1 = raw64 + 1n;
  // Reinterpret as uint64: mask to 64 bits, then shift right by 1.
  const u64_MASK = (1n << 64n) - 1n; // 0xFFFF_FFFF_FFFF_FFFF
  const asU64 = plus1 & u64_MASK;
  const shifted = asU64 >> 1n; // unsigned right shift by 1
  // ------------------------------------------------------------
  // @0xb0c86..0xb0c87 — epilogue; retq (rax carries return value).
  // Return as bigint so callers see the full 64-bit register; the
  // typical usage is `Number(BigInt.asIntN(32, ret))` to narrow to
  // int32 == the classic Apple S15Fixed16 encoding.
  // ------------------------------------------------------------
  return shifted;
}
