// rho.ts — raw transcription of the Helium translation-unit-local free function
// `rho(float*, double const*, double)`.
//
// Provenance (Helium framework, x86_64 slice of
//   /Applications/Final Cut Pro.app/Contents/Frameworks/Helium.framework/Versions/A/Helium):
//
//   @0x3b860  rho(float*, double const*, double)   __ZL3rhoPfPKdd
//
// `__ZL` is internal linkage — a `static` free function in its translation unit, so it belongs in
// a file named after the function (PORTING_SPEC's rule for free functions), not in any class file.
//
// Disassembly (regenerate with
//   `bash raw-port/tools/disasm.sh --sym __ZL3rhoPfPKdd Helium`):
//   raw-port/re/disasm/Helium.__ZL3rhoPfPKdd.s   (118 lines: the symbol line, 116
//   instructions from @0x3b860 to @0x3ba2c, and the @0x3ba2d `nopl` alignment padding)
//
// WHAT IT COMPUTES. Given a 2x2 Jacobian expressed in homogeneous form, `rho` returns the
// anisotropic-filtering footprint: the length of the major axis divided by the anisotropy ratio,
// with the ratio clamped to the caller's maximum. The two candidate axis pairs it measures are the
// two DIAGONALS of the parallelogram (sum and difference of the column vectors) and the two COLUMN
// vectors themselves; it keeps whichever pair has the smaller minimum. That reading is offered as
// orientation only — every value below is transcribed from the instruction that produces it, and
// nothing here depends on the interpretation being right.
//
// ARGUMENTS, as the disassembly uses them:
//   %rdi  float*         `p`  — reads p[0] @+0x0, p[1] @+0x4 and p[3] @+0xc. p[2] @+0x8 is never
//                              read by this function, so nothing is claimed about it.
//   %rsi  double const*  `m`  — reads m[0] @+0x0, m[1] @+0x8, m[3] @+0x18, m[4] @+0x20,
//                              m[5] @+0x28 and m[7] @+0x38. m[2] and m[6] are never read.
//   %xmm0 double         `s`  — the caller's maximum anisotropy; the only branch input.
//
// THE ONE MEMORY CONSTANT: @0x3b90a `ucomisd 0x38e94e(%rip), %xmm2` reads the 8 bytes at
// 0x3b912 + 0x38e94e = @0x3ca260, which hold `00 00 00 00 00 00 f0 3f` = 1.0 (read out of the
// mapped image by the oracle below, not guessed).
//
// CALLEES: none. No call, no jmp outside the body, no extern, no indirect or virtual dispatch
// (`depgraph.py deps __ZL3rhoPfPKdd` lists nothing). Pure arithmetic on its three arguments.
//
// PACKED LANES. Most of the body is two-wide `pd` arithmetic, and the transcription names the
// lanes rather than hiding them: for an SSE register `[low, high]`, `low` is bytes 0..7. Where an
// instruction writes only the low lane (`addsd`, `subsd`, `maxsd`, `minsd`, `sqrtsd`) the high
// lane keeps its previous value, and the comments say which one that is.
//
// NaN SEMANTICS ARE THE POINT OF HALF THESE INSTRUCTIONS, so they are transcribed literally rather
// than folded into Math.min/Math.max. `minsd`/`maxsd` compute `(dst OP src) ? dst : src`, which
// returns SRC whenever either operand is NaN; the compiler then follows each one with
// `cmpunordsd` + `blendvpd`, which substitutes DST when SRC is NaN. The pair is C++'s
// `std::min`/`std::max` made NaN-safe in one direction, and JS's `Math.min`/`Math.max` are NOT the
// same function (they propagate NaN), so each site is written out as the two-step compare the
// machine performs. `Math.fround` marks every `cvtsd2ss`; a `cvtss2sd` is an exact widening and
// needs no counterpart.

/**
 * `rho(float* p, double const* m, double s)` — @Helium 0x3b860 (`__ZL3rhoPfPKdd`).
 *
 * FULL transcription of all 116 instructions, in order. The body has three exits — the
 * `s <= 1.0` path returns at @0x3b9cf, and the two `s > 1.0` paths join at @0x3b9fc and return at
 * @0x3ba2c.
 *
 * ORACLE — VERIFIED bit-exactly against the live binary; see
 * `raw-port/re/oracle/rho_oracle.py` + `rho_driver.mts`. THIS FILE's exported function is what the
 * driver runs (it imports the real module and prints the source text of the function it called),
 * so the differential measures the committed code and not a restatement of it. Run under
 * `arch -x86_64 /usr/bin/python3` — the symbol is LOCAL (`nm` type `t`), called at
 * `_dyld_get_image_vmaddr_slide(Helium) + 0x3b860`, with the entry bytes checked before the call
 * because an arm64 vmaddr would land on another function and fail silently toward VERIFIED.
 *
 * RESULT: 200 corpus cases, 0 divergent, compared as raw 64-bit patterns rather than as decimals
 * so that ±0, ±Inf and NaN are distinguished (3 NaN, 17 infinite and 180 finite results, so the
 * blends and the divide-by-zero paths are genuinely exercised). The `ucomisd` operand @0x3ca260 is
 * read out of the mapped image and is 1.0. Six one-token mutants of THIS file are run through the
 * identical pipeline and all are killed — `s >= 1.0` (23), the difference diagonal written as a
 * sum (61), the high-lane NaN blend dropped (4), the ratio not narrowed to float (76), the
 * isotropic path taking the larger maximum (67), the winning pair chosen the other way (105) —
 * while an unmutated copy (M0) kills 0.
 *
 * ONE MUTANT WAS WITHDRAWN AS EQUIVALENT, and it is recorded in the oracle because it is a fact
 * about this function rather than about the harness: swapping the low lane's `minsd` operand order
 * cannot be observed. The two orders differ only when exactly one operand is NaN, and
 * `R = (a0-a1)^2 + (b0-b1)^2` can only be NaN when a lane computes Inf-Inf — which forces the
 * matching `(a0+a1)` to be Inf and so `P` to be Inf. An infinite low-lane minimum never satisfies
 * `minHigh > minLow`, so that lane's minimum is never read on the path where the order would show.
 *
 * @param p the `float*` in %rdi.
 * @param m the `double const*` in %rsi.
 * @param s the `double` in %xmm0.
 * @returns the `double` left in %xmm0.
 */
export function rho(p: Float32Array, m: Float64Array, s: number): number {
  // @0x3b864  movss (%rdi), %xmm1        — p[0]
  // @0x3b86d  cvtss2sd %xmm1, %xmm1      — widened to double (exact)
  const p0 = p[0]!;
  // @0x3b868  movss 0x4(%rdi), %xmm2 ; @0x3b87a cvtss2sd %xmm2, %xmm5 — p[1]
  const p1 = p[1]!;
  // @0x3b871  movss 0xc(%rdi), %xmm3 ; @0x3b876 cvtss2sd %xmm3, %xmm3 — p[3]
  const p3 = p[3]!;

  // @0x3b87e  movupd 0x18(%rsi), %xmm4   — xmm4 = [m[3], m[4]]
  // @0x3b883  movapd %xmm4, %xmm6        — xmm6 = [m[3], m[4]]
  // @0x3b887  movhpd 0x38(%rsi), %xmm6   — xmm6 = [m[3], m[7]]  (the shared multiplier pair)
  // @0x3b894  movlpd (%rsi), %xmm4       — xmm4 = [m[0], m[4]]
  //
  // @0x3b88c  movapd %xmm0, %xmm2        — xmm2 = s, saved before %xmm0 is reused
  // @0x3b890  movddup %xmm1, %xmm0       — [p0, p0]
  // @0x3b898  mulpd %xmm6, %xmm0         — [p0*m[3], p0*m[7]]
  // @0x3b89c  subpd %xmm0, %xmm4         — [m[0] - p0*m[3], m[4] - p0*m[7]]
  // @0x3b8a0  movddup %xmm3, %xmm0       — [p3, p3]
  // @0x3b8a4  divpd %xmm0, %xmm4         — divided by p3, lane-wise
  const a0 = (m[0]! - p0 * m[3]!) / p3; // xmm4 low
  const a1 = (m[4]! - p0 * m[7]!) / p3; // xmm4 high

  // @0x3b8a8  movddup %xmm5, %xmm1       — [p1, p1]
  // @0x3b8ac  movsd 0x8(%rsi), %xmm3     — xmm3 = [m[1], 0]
  // @0x3b8b1  movhpd 0x28(%rsi), %xmm3   — xmm3 = [m[1], m[5]]
  // @0x3b8b6  mulpd %xmm6, %xmm1         — [p1*m[3], p1*m[7]]
  // @0x3b8ba  subpd %xmm1, %xmm3         — [m[1] - p1*m[3], m[5] - p1*m[7]]
  // @0x3b8be  divpd %xmm0, %xmm3         — divided by the same [p3, p3]
  const b0 = (m[1]! - p1 * m[3]!) / p3; // xmm3 low
  const b1 = (m[5]! - p1 * m[7]!) / p3; // xmm3 high

  // The four squared lengths. Both pairs are built the same way: one register holds
  // [sum, first-component], the other [difference, second-component], each squared lane-wise and
  // added, so one `addpd` produces a diagonal length and a column length together.
  //
  // @0x3b8c2  movapd %xmm4, %xmm0 ; @0x3b8c6 unpckhpd %xmm4, %xmm0  — [a1, a1]
  // @0x3b8ca  movapd %xmm0, %xmm5 ; @0x3b8ce addsd %xmm4, %xmm5     — low = a1 + a0
  // @0x3b8d2  movapd %xmm3, %xmm6 ; @0x3b8d6 unpckhpd %xmm3, %xmm6  — [b1, b1]
  // @0x3b8da  movapd %xmm6, %xmm1 ; @0x3b8de addsd %xmm3, %xmm1     — low = b1 + b0
  // @0x3b8e2  unpcklpd %xmm4, %xmm5      — xmm5 = [a1+a0, a0]
  // @0x3b8e6  mulpd %xmm5, %xmm5         — [(a1+a0)^2, a0^2]
  // @0x3b8ea  unpcklpd %xmm3, %xmm1      — xmm1 = [b1+b0, b0]
  // @0x3b8ee  mulpd %xmm1, %xmm1         — [(b1+b0)^2, b0^2]
  // @0x3b8f2  addpd %xmm5, %xmm1         — xmm1 = [P, Q]
  const sumA = a1 + a0;
  const sumB = b1 + b0;
  const bigP = sumA * sumA + sumB * sumB; // xmm1 low  — the "sum" diagonal, squared
  const bigQ = a0 * a0 + b0 * b0; // xmm1 high — the first column, squared

  // @0x3b8f6  subsd %xmm0, %xmm4         — xmm4 = [a0 - a1, a1]
  // @0x3b8fa  mulpd %xmm4, %xmm4         — [(a0-a1)^2, a1^2]
  // @0x3b8fe  subsd %xmm6, %xmm3         — xmm3 = [b0 - b1, b1]
  // @0x3b902  mulpd %xmm3, %xmm3         — [(b0-b1)^2, b1^2]
  // @0x3b906  addpd %xmm4, %xmm3         — xmm3 = [R, S]
  const difA = a0 - a1;
  const difB = b0 - b1;
  const bigR = difA * difA + difB * difB; // xmm3 low  — the "difference" diagonal, squared
  const bigS = a1 * a1 + b1 * b1; // xmm3 high — the second column, squared

  // @0x3b90a  ucomisd 0x38e94e(%rip), %xmm2   — flags from (s - 1.0); the operand @0x3ca260 is 1.0
  // @0x3b912  jbe 0x3b969                     — taken when s <= 1.0, and ALSO when s is NaN
  //                                             (an unordered compare sets CF=ZF=1)
  if (!(s > 1.0)) {
    // ── @0x3b969: the isotropic path. No ratio, no division: it returns the smaller of the two
    // MAXIMA, and it does the last three steps in FLOAT rather than double.
    //
    // @0x3b969  movapd %xmm1, %xmm0 ; @0x3b96d unpckhpd %xmm1, %xmm0 — [Q, Q]
    // @0x3b971  movapd %xmm3, %xmm2 ; @0x3b975 unpckhpd %xmm3, %xmm2 — [S, S]
    // @0x3b979  movapd %xmm2, %xmm4 ; @0x3b97d maxsd %xmm0, %xmm4    — (S > Q) ? S : Q
    // @0x3b981  cmpunordsd %xmm0, %xmm0 ; @0x3b986 blendvpd %xmm0, %xmm2, %xmm4 — NaN Q -> S
    let maxSQ = bigS > bigQ ? bigS : bigQ;
    if (Number.isNaN(bigQ)) maxSQ = bigS;
    // @0x3b98b  xorps %xmm2, %xmm2 ; @0x3b98e cvtsd2ss %xmm4, %xmm2  — narrowed to float
    const maxSQf = Math.fround(maxSQ);

    // @0x3b992  movapd %xmm3, %xmm4 ; @0x3b996 maxsd %xmm1, %xmm4    — (R > P) ? R : P
    // @0x3b99a  cmpunordsd %xmm1, %xmm1 ; @0x3b9a3 blendvpd %xmm0, %xmm3, %xmm4 — NaN P -> R
    let maxRP = bigR > bigP ? bigR : bigP;
    if (Number.isNaN(bigP)) maxRP = bigR;
    // @0x3b9a8  xorps %xmm1, %xmm1 ; @0x3b9ab cvtsd2ss %xmm4, %xmm1  — narrowed to float
    const maxRPf = Math.fround(maxRP);

    // @0x3b9af  movaps %xmm1, %xmm3 ; @0x3b9b2 minss %xmm2, %xmm3    — (maxRPf < maxSQf) ? .. : ..
    // @0x3b9b6  cmpunordss %xmm2, %xmm2 ; @0x3b9be blendvps %xmm0, %xmm1, %xmm3 — NaN maxSQf -> maxRPf
    let pick = maxRPf < maxSQf ? maxRPf : maxSQf;
    if (Number.isNaN(maxSQf)) pick = maxRPf;

    // @0x3b9c3  xorps %xmm0, %xmm0 ; @0x3b9c6 sqrtss %xmm3, %xmm0    — SINGLE-precision sqrt
    // @0x3b9ca  cvtss2sd %xmm0, %xmm0 ; @0x3b9ce popq %rbp ; @0x3b9cf retq
    return Math.fround(Math.sqrt(pick));
  }

  // ── @0x3b914: s > 1.0. Both candidate pairs are reduced to their minima, the pair with the
  // smaller minimum wins, and the answer is the major axis divided by the clamped ratio.
  //
  // @0x3b914  movapd %xmm3, %xmm4 ; @0x3b918 minpd %xmm1, %xmm4  — lane-wise (R<P)?R:P, (S<Q)?S:Q
  // @0x3b91c  movapd %xmm1, %xmm0 ; @0x3b920 cmpunordpd %xmm1, %xmm1(as %xmm0)
  // @0x3b925  blendvpd %xmm0, %xmm3, %xmm4  — lane-wise: a NaN in [P,Q] takes [R,S]
  let minLow = bigR < bigP ? bigR : bigP;
  if (Number.isNaN(bigP)) minLow = bigR;
  let minHigh = bigS < bigQ ? bigS : bigQ;
  if (Number.isNaN(bigQ)) minHigh = bigS;

  // @0x3b92a  movapd %xmm4, %xmm5 ; @0x3b92e unpckhpd %xmm4, %xmm5  — [minHigh, minHigh]
  // @0x3b932  ucomisd %xmm4, %xmm5   — flags from (minHigh - minLow)
  // @0x3b936  cvtsd2ss %xmm2, %xmm2  — s narrowed to float, on BOTH paths
  // @0x3b93a  jbe 0x3b9d0            — taken when minHigh <= minLow, and when either is NaN
  const sf = Math.fround(s);
  let minPick: number;
  let maxPick: number;
  if (minHigh > minLow) {
    // ── @0x3b940: the diagonals win. Their minimum is already in %xmm4's low lane.
    // @0x3b940  movapd %xmm3, %xmm5 ; @0x3b944 maxsd %xmm1, %xmm5   — (R > P) ? R : P
    // @0x3b948  cmpunordsd %xmm1, %xmm1 ; @0x3b951 blendvpd %xmm0, %xmm3, %xmm5 — NaN P -> R
    //   (the same blend's HIGH lane is computed from Q's sign bit and is dead: only the low lanes
    //    of %xmm4/%xmm5 are read by the two `sqrtsd`s below.)
    let mx = bigR > bigP ? bigR : bigP;
    if (Number.isNaN(bigP)) mx = bigR;
    // @0x3b956  xorps %xmm0, %xmm0 ; @0x3b959 sqrtsd %xmm4, %xmm0 — sqrt of the low-lane minimum
    // @0x3b95d  xorps %xmm1, %xmm1 ; @0x3b960 sqrtsd %xmm5, %xmm1
    // @0x3b964  jmp 0x3b9fc
    minPick = minLow;
    maxPick = mx;
  } else {
    // ── @0x3b9d0: the columns win (or the compare was unordered).
    // @0x3b9d0  unpckhpd %xmm1, %xmm1 ; @0x3b9d4 unpckhpd %xmm3, %xmm3 — [Q,Q] and [S,S]
    // @0x3b9d8  movapd %xmm3, %xmm4 ; @0x3b9dc maxsd %xmm1, %xmm4      — (S > Q) ? S : Q
    // @0x3b9e0  cmpunordsd %xmm1, %xmm1 ; @0x3b9e9 blendvpd %xmm0, %xmm3, %xmm4 — NaN Q -> S
    let mx = bigS > bigQ ? bigS : bigQ;
    if (Number.isNaN(bigQ)) mx = bigS;
    // @0x3b9ee  xorps %xmm0, %xmm0 ; @0x3b9f1 sqrtsd %xmm5, %xmm0 — %xmm5 still holds [minHigh,..]
    // @0x3b9f5  xorps %xmm1, %xmm1 ; @0x3b9f8 sqrtsd %xmm4, %xmm1
    minPick = minHigh;
    maxPick = mx;
  }

  // ── @0x3b9fc: the shared tail.
  // @0x3b9fc  movapd %xmm1, %xmm3 ; @0x3ba00 divsd %xmm0, %xmm3 — sqrt(max) / sqrt(min)
  const sqMin = Math.sqrt(minPick); // %xmm0
  const sqMax = Math.sqrt(maxPick); // %xmm1
  const ratio = sqMax / sqMin;
  // @0x3ba04  xorps %xmm0, %xmm0 ; @0x3ba07 cvtsd2ss %xmm3, %xmm0 — the ratio, in float
  const ratiof = Math.fround(ratio);
  // @0x3ba0b  movaps %xmm2, %xmm3 ; @0x3ba0e minss %xmm0, %xmm3   — (sf < ratiof) ? sf : ratiof
  // @0x3ba12  cmpunordss %xmm0, %xmm0 ; @0x3ba17 blendvps %xmm0, %xmm2, %xmm3 — NaN ratiof -> sf
  let clamped = sf < ratiof ? sf : ratiof;
  if (Number.isNaN(ratiof)) clamped = sf;
  // @0x3ba1c  movapd %xmm1, %xmm0        — the numerator is sqrt(max), the double
  // @0x3ba20  xorps %xmm1, %xmm1 ; @0x3ba23 cvtss2sd %xmm3, %xmm1 — the clamp widened back
  // @0x3ba27  divsd %xmm1, %xmm0 ; @0x3ba2b popq %rbp ; @0x3ba2c retq
  return sqMax / clamped;
}
