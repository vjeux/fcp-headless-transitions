/**
 * HGMath — Helium math utility namespace.
 *
 * Source: Helium.framework (x86_64 slice), vmaddr 0x116e00.
 * Symbol: __ZN6HGMath22IsEqualWithinToleranceEDv4_fS0_f
 *   demangled: HGMath::IsEqualWithinTolerance(float __vector(4), float __vector(4), float)
 *
 * Full decoded body @0x116e00..0x116e1f (fat x86_64 slice offset 0x4000+0x116e00):
 *   0x116e00 55            push  rbp
 *   0x116e01 48 89 e5      mov   rbp, rsp
 *   0x116e04 0f 5c c1      subps xmm0, xmm1              ; xmm0 = a - b   (lane-wise)
 *   0x116e07 0f 54 05 22 0e 2b 00
 *                          andps xmm0, xmmword [rip+0x2b0e22]
 *                                                        ; mask = {0x7fffffff}x4  @0x3c7c30
 *                                                        ; xmm0 = |a - b|
 *   0x116e0e 0f c6 d2 00   shufps xmm2, xmm2, 0          ; broadcast tolerance to 4 lanes
 *   0x116e12 0f c2 c2 05   cmpnltps xmm0, xmm2           ; each lane: (|diff|>=tol) ? -1 : 0
 *                                                        ; predicate 5 = NLT (not-less-than)
 *   0x116e16 0f 50 c0      movmskps eax, xmm0            ; bits 3..0 = sign bit of each lane
 *   0x116e19 85 c0         test  eax, eax
 *   0x116e1b 0f 94 c0      sete  al                      ; return (eax == 0)
 *   0x116e1e 5d            pop   rbp
 *   0x116e1f c3            ret
 *
 * The RIP-relative constant at 0x3c7c30 is the four-lane abs-value bitmask
 *   ff ff ff 7f | ff ff ff 7f | ff ff ff 7f | ff ff ff 7f
 * i.e. clear the sign bit of each float lane, producing |x| in float32.
 *
 * Semantics: returns true iff for EVERY lane i in {0,1,2,3}, |a[i] - b[i]| < tolerance.
 *   - cmpnltps with predicate NLT (5) sets a lane to all-ones when (|diff| !< tol).
 *     This is unordered-true, so a NaN in |diff| makes the lane "fail".
 *   - movmskps aggregates the four lanes' sign bits into eax[3:0].
 *   - eax == 0 means no lane failed -> all lanes strictly under tolerance.
 *
 * Single-precision throughout: SSE packed-single ops. Every arithmetic op is a
 * float32 (Math.fround) equivalent.
 */

export type Float4 = readonly [number, number, number, number];

/**
 * HGMath::IsEqualWithinTolerance @0x116e00 (Helium).
 *
 * Returns true iff |a[i] - b[i]| < tolerance for every i in 0..3.
 * Mirrors the SSE sequence: subps / andps(|.|) / broadcast tol / cmpnltps / movmskps==0.
 *
 * NaN handling matches the asm: cmpnltps with a NaN operand is unordered-TRUE,
 * so a NaN diff makes the lane a "fail" (sign bit set) and the function returns false.
 * JavaScript already returns false for every NaN comparison, so `!(absDiff < tol)`
 * captures the same outcome without a special-case branch.
 */
export function IsEqualWithinTolerance(
  a: Float4,
  b: Float4,
  tolerance: number,
): boolean {
  // xmm2 = broadcast(tolerance) — single-precision float32.
  const tol = Math.fround(tolerance);
  // Per-lane: |a[i] - b[i]| in float32, then predicate (|diff| >= tol).
  // If ANY lane fails (|diff| !< tol, including NaN), aggregated movmskps is nonzero,
  // so `sete al` returns 0. Mirror that with an early return false.
  for (let i = 0; i < 4; i++) {
    const diff = Math.fround(Math.fround(a[i]) - Math.fround(b[i]));
    // andps with the 0x7fffffff mask clears the sign bit == |diff| in float32.
    const absDiff = Math.fround(Math.abs(diff));
    // cmpnltps NLT is unordered-true; NaN => lane fails => whole result false.
    if (!(absDiff < tol)) {
      return false;
    }
  }
  return true;
}
