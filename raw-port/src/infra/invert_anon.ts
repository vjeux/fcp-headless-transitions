// invert_anon — (anonymous namespace)::invert(double const*, double*)
// ProCore free function; 3x3 double matrix inverse used by PCChromaticity math.
//
// Symbol:    __ZN12_GLOBAL__N_16invertEPKdPd
// Demangled: (anonymous namespace)::invert(double const*, double*)
// Address:   @ProCore 0xaf044
// Callers:   __Z28PCConvertChromaticitiesToXYZRK16PCChromaticitiesR10PCXYZColorS3_S3_S3_ @0xaf2a1
//            __Z26PCChromaticityMathSelfTestv                                            @0xafd00
//
// Source disassembly: raw-port/re/disasm/ProCore.__ZN12_GLOBAL__N_16invertEPKdPd.s
//
// Matrix layout (in doubles, row-major 3x3 at *in [9 doubles, offsets 0..0x40]):
//   +0x00 m0   +0x08 m1   +0x10 m2
//   +0x18 m3   +0x20 m4   +0x28 m5
//   +0x30 m6   +0x38 m7   +0x40 m8
//
// Output layout at *out is the same 3x3 row-major inverse:
//   +0x00 inv00  +0x08 inv01  +0x10 inv02
//   +0x18 inv10  +0x20 inv11  +0x28 inv12
//   +0x30 inv20  +0x38 inv21  +0x40 inv22
//
// Algorithm (SSE-vectorised in the binary but algebraically standard):
//   * Compute row-0 cofactors (paired via xmm3/xmm2):
//       C00 = m4*m8 - m5*m7            (@0xaf078..0xaf089 pd-lane 0)
//       C01 = m5*m6 - m3*m8            (@0xaf078..0xaf089 pd-lane 1)
//       C02 = m3*m7 - m4*m6            (@0xaf092..0xaf0a3 scalar)
//   * det = m0*C00 + m1*C01 + m2*C02   (@0xaf0a7 mulpd + haddpd + m2*C02 add @0xaf0b4/0xaf0b9)
//   * andpd with sign-bit mask 0x7fff_ffff_ffff_ffff (both lanes) @0x122670 -> |det|
//     ucomisd with 1e-7 threshold at @0x122880: if |det| < 1e-7 branch to end @0xaf1cc,
//     skipping ALL of the divide+adjugate+store. Return value is `setbe %al` on that
//     same flags word — al = (1e-7 <= |det|) i.e. true iff invertible.
//   * Otherwise xmm10 = 1.0 / det (@0xaf0df load 1.0 @0x122530, @0xaf0e8 divsd), then
//     compute the remaining 6 cofactors and store the transposed cofactor matrix (i.e.
//     the adjugate) scaled by 1/det. See fields below for the exact cofactor per lane.
//
// Constant provenance (rip-relative loads):
//   0x122670  = 0x7fffffffffffffff / 0x7fffffffffffffff   (double abs-mask, two lanes)
//   0x122880  = 1e-7                                       (double, singularity threshold)
//   0x122530  = 1.0                                        (double, det reciprocal numerator)
//
// Returns: bool  — true iff |det(in)| >= 1e-7.  On false the OUTPUT BUFFER IS UNMODIFIED
// (matching the disasm — the singular branch jumps directly to the setbe/pop/ret epilogue
// without touching (%rsi)).

/**
 * (anonymous namespace)::invert(double const* in, double* out)
 * @ProCore 0xaf044  __ZN12_GLOBAL__N_16invertEPKdPd
 *
 * Faithful transcription of the 3x3 double-matrix inverse. Signature preserved:
 *   `in`  : 9 doubles, row-major
 *   `out` : 9 doubles, row-major; written only if the matrix is non-singular
 *   returns: bool — true iff |det| >= 1e-7 (matches the setbe epilogue @0xaf1d1).
 */
export function invert_anon(input: Float64Array | number[], output: Float64Array | number[]): boolean {
  // --- @0xaf048..0xaf061  Load the 9 input doubles ---------------------------------------
  // The binary loads them via 128-bit movupd (paired lanes) + a scalar movsd for m4.
  // We just name each element to keep the algebra readable.
  const m0 = input[0];  // @0xaf048 movupd (%rdi), %xmm5 lane0
  const m1 = input[1];  // @0xaf048 movupd (%rdi), %xmm5 lane1
  const m2 = input[2];  // @0xaf04c movupd 0x10(%rdi), %xmm7 lane0
  const m3 = input[3];  // @0xaf04c movupd 0x10(%rdi), %xmm7 lane1  (and @0xaf051 xmm4 lane0)
  const m4 = input[4];  // @0xaf051 movupd 0x18(%rdi), %xmm4 lane1 ; @0xaf061 movsd 0x20(%rdi), %xmm0
  const m5 = input[5];  // @0xaf056 movupd 0x28(%rdi), %xmm1 lane0
  const m6 = input[6];  // @0xaf056 movupd 0x28(%rdi), %xmm1 lane1
  const m7 = input[7];  // @0xaf05b movupd 0x38(%rdi), %xmm9 lane0
  const m8 = input[8];  // @0xaf05b movupd 0x38(%rdi), %xmm9 lane1

  // --- @0xaf066..0xaf089  Row-0 cofactors, paired lanes --------------------------------
  //   xmm2 = [m4, m5]   (shufpd $1,xmm1,xmm2 after xmm2<-xmm4=[m3,m4])
  //   xmm3 = [m8, m6]   (unpckhpd xmm1,xmm3 after xmm3<-xmm9=[m7,m8])
  //   xmm3 *= xmm2      -> [m4*m8, m5*m6]
  //   xmm2 = [m5, m3]   (unpcklpd xmm4,xmm2 after xmm2<-xmm1=[m5,m6])
  //   xmm2 *= xmm9      -> [m5*m7, m3*m8]
  //   xmm3 -= xmm2      -> [C00, C01]
  const C00 = m4 * m8 - m5 * m7;      // cofactor(0,0)
  const C01 = m5 * m6 - m3 * m8;      // cofactor(0,1) — note: this is +m5*m6 - m3*m8, matching disasm

  // --- @0xaf08d..0xaf0a3  C02 (scalar) --------------------------------------------------
  //   xmm2 = xmm9 = [m7,m8]; mulsd xmm4,xmm2  (xmm4 low=m3)   -> xmm2 = m3*m7
  //   xmm6 = 0x30(%rdi) = m6 (scalar); mulsd xmm0,xmm6 (xmm0=m4) -> xmm6 = m4*m6
  //   subsd xmm6, xmm2                                        -> xmm2 = m3*m7 - m4*m6
  const C02 = m3 * m7 - m4 * m6;      // cofactor(0,2)

  // --- @0xaf0a7..0xaf0b9  det = m0*C00 + m1*C01 + m2*C02 -------------------------------
  //   xmm6 = xmm3; mulpd xmm5,xmm6        -> [m0*C00, m1*C01]
  //   haddpd xmm6,xmm6                    -> xmm6 low = m0*C00 + m1*C01
  //   xmm11 = xmm2; mulsd xmm7,xmm11 (xmm7 low=m2) -> xmm11 = m2*C02
  //   addsd xmm6,xmm11                    -> xmm11 = det
  const det = m0 * C00 + m1 * C01 + m2 * C02;

  // --- @0xaf0be..0xaf0d9  Singularity check |det| >= 1e-7 ------------------------------
  //   andpd  0x122670(%rip), %xmm11 -> xmm6   ; mask = 0x7fff_ffff_ffff_ffff -> |det|
  //   movsd  0x122880(%rip), %xmm8            ; xmm8 = 1e-7
  //   ucomisd %xmm6, %xmm8 ; ja 0xaf1cc       ; if 1e-7 > |det|  goto epilogue (skip stores)
  //
  // ucomisd sets flags on (xmm8 - xmm6) = (1e-7 - |det|). `ja` (CF=0 & ZF=0) means
  //   xmm8 > xmm6, i.e. 1e-7 > |det|  -> singular, skip writes.
  // The corresponding setbe at @0xaf1d1 tests CF=1 OR ZF=1, i.e. xmm8 <= xmm6, i.e.
  //   1e-7 <= |det|  -> RETURN TRUE when invertible.
  const absDet = Math.abs(det);       // andpd with 0x7fff... mask
  const SINGULARITY_THRESHOLD = 1e-7; // @0x122880

  if (SINGULARITY_THRESHOLD > absDet) {
    // @0xaf0d9 ja 0xaf1cc — jump straight to the setbe/pop/ret epilogue.
    // Return value: setbe %al with flags from ucomisd (still 1e-7 - |det|).
    //   CF=1 or ZF=1 <=> 1e-7 <= |det|. Here 1e-7 > |det|, so CF=0 ZF=0 -> setbe = 0.
    // NB: NaN inputs make ucomisd unordered (PF=1, CF=1, ZF=1) — `ja` would NOT be taken
    // (`ja` requires CF=0), so we'd fall through to the divide. `Math.abs(NaN) === NaN`,
    // and `1e-7 > NaN` is false, so we also fall through in JS. Matches the machine.
    return false;
  }

  // --- @0xaf0df..0xaf0ed  invDet = 1.0 / det --------------------------------------------
  //   movsd 0x122530(%rip), %xmm10  ; xmm10 = 1.0
  //   divsd %xmm11, %xmm10          ; xmm10 = 1.0 / det
  const invDet = 1.0 / det;

  // --- @0xaf0ed..0xaf115  Compute cofactor pair [C10, C11-ish] --------------------------
  //   xmm11 = xmm9 = [m7,m8]; mulpd xmm7,xmm11 (xmm7=[m2,m3])  -> [m2*m7, m3*m8]
  //   xmm13 = xmm5; unpckhpd xmm5,xmm13                        -> xmm13 = [m1, m1]
  //   xmm12 = xmm9; mulpd xmm5,xmm12                           -> [m0*m7, m1*m8]
  //   unpckhpd xmm12,xmm12                                     -> xmm12 = [m1*m8, m1*m8]
  //   subpd xmm12,xmm11                                        -> [m2*m7 - m1*m8, m3*m8 - m1*m8]
  //
  // xmm11 low = m2*m7 - m1*m8 = C10 (cofactor(1,0), sign flip captured algebraically)
  //   (standard cofactor is -(m1*m8 - m2*m7) = m2*m7 - m1*m8 ✓)
  // xmm11 high = m3*m8 - m1*m8   — a scratch value; only the LOW lane is used later
  //   when unpcklpd combines [C00, C10] into the first output pair.
  const C10 = m2 * m7 - m1 * m8;      // cofactor(1,0)

  // --- @0xaf115..0xaf13d  Cofactor pair [C21_low, C11_high] -----------------------------
  //   xmm14 = xmm7=[m2,m3]; unpckhpd xmm9,xmm14  -> [m3, m8]
  //   xmm15 = xmm5=[m0,m1]; unpcklpd xmm7,xmm15  -> [m0, m2]
  //   xmm12 = xmm7=[m2,m3]; unpcklpd xmm5,xmm12  -> [m2, m0]
  //   xmm12 *= xmm14                              -> [m2*m3, m0*m8]
  //   xmm15 *= xmm1 (xmm1=[m5,m6])                -> [m0*m5, m2*m6]
  //   xmm12 -= xmm15                              -> [m2*m3 - m0*m5, m0*m8 - m2*m6]
  //
  // xmm12 low  = m2*m3 - m0*m5 = C21 (cofactor(2,1) = -(m0*m5 - m2*m3))
  // xmm12 high = m0*m8 - m2*m6 = C11 (cofactor(1,1) =  m0*m8 - m2*m6)
  const C21 = m2 * m3 - m0 * m5;      // cofactor(2,1)
  const C11 = m0 * m8 - m2 * m6;      // cofactor(1,1)

  // --- @0xaf142..0xaf158  Cofactor C12 (lane-0 of xmm14) --------------------------------
  //   blendpd $2, %xmm1, %xmm9   -> xmm9 = [m7, m6]     (lane0 from xmm9, lane1 from xmm1)
  //   mulpd  %xmm5, %xmm9        -> [m0*m7, m1*m6]
  //   xmm14  = xmm9; unpckhpd xmm9,xmm14  -> xmm14 = [m1*m6, m1*m6]
  //   subpd  xmm9,  xmm14        -> [m1*m6 - m0*m7, m1*m6 - m1*m6=0]
  //
  // xmm14 low = m1*m6 - m0*m7 = C12 (cofactor(1,2) = -(m0*m7 - m1*m6))
  const C12 = m1 * m6 - m0 * m7;      // cofactor(1,2)

  // --- @0xaf15d..0xaf16c  Cofactor C20 (scalar) -----------------------------------------
  //   mulsd xmm13, xmm1  (xmm13 low=m1, xmm1 low=m5) -> xmm1 = m1*m5
  //   xmm9  = xmm0=m4; mulsd xmm7,xmm9 (xmm7 low=m2) -> xmm9 = m2*m4
  //   subsd xmm9, xmm1                               -> xmm1 = m1*m5 - m2*m4
  //
  // C20 = m1*m5 - m2*m4 (cofactor(2,0) = m1*m5 - m2*m4)
  const C20 = m1 * m5 - m2 * m4;

  // --- @0xaf171..0xaf17a  Cofactor C22 (scalar) -----------------------------------------
  //   mulsd xmm5, xmm0  (xmm5 low=m0, xmm0=m4) -> xmm0 = m0*m4
  //   mulsd xmm13,xmm4  (xmm13 low=m1, xmm4 low=m3) -> xmm4 = m1*m3
  //   subsd xmm4, xmm0                             -> xmm0 = m0*m4 - m1*m3
  const C22 = m0 * m4 - m1 * m3;      // cofactor(2,2)

  // --- @0xaf17e..0xaf1c7  Store the transposed cofactor matrix * invDet ----------------
  //   Row 0:
  //     unpcklpd xmm11, xmm4 (xmm4=xmm3=[C00,C01]) -> xmm4 = [C00, C10]
  //     xmm5 = broadcast xmm10 (movddup) = [invDet, invDet]
  //     mulpd xmm5, xmm4                            -> [inv00, inv01]
  //     movupd xmm4, (%rsi)                         -> out[0], out[1]
  //
  //     blendpd $2, xmm3, xmm1  (xmm1 low=C20, xmm3 hi=C01) -> xmm1 = [C20, C01]
  //     mulpd xmm5, xmm1                                     -> [inv02, inv10]
  //     movupd xmm1, 0x10(%rsi)                              -> out[2], out[3]
  //
  //   Row 1:
  //     mulpd xmm5, xmm12                                    -> [C21*invDet, C11*invDet]
  //     shufpd $1, xmm12, xmm12                              -> [inv11, inv12]  (swap)
  //     movupd xmm12, 0x20(%rsi)                             -> out[4], out[5]
  //
  //   Row 2:
  //     unpcklpd xmm14, xmm2 (xmm2 low=C02, xmm14 low=C12)   -> xmm2 = [C02, C12]
  //     mulpd xmm5, xmm2                                      -> [inv20, inv21]
  //     movupd xmm2, 0x30(%rsi)                              -> out[6], out[7]
  //
  //     mulsd xmm10, xmm0 (xmm0=C22)                          -> inv22
  //     movsd xmm0, 0x40(%rsi)                                -> out[8]
  output[0] = C00 * invDet;   // inv00 = out[0]
  output[1] = C10 * invDet;   // inv01 = out[1]
  output[2] = C20 * invDet;   // inv02 = out[2]
  output[3] = C01 * invDet;   // inv10 = out[3]
  output[4] = C11 * invDet;   // inv11 = out[4]
  output[5] = C21 * invDet;   // inv12 = out[5]  (note: shufpd swap in disasm makes low=C11, hi=C21)
  output[6] = C02 * invDet;   // inv20 = out[6]
  output[7] = C12 * invDet;   // inv21 = out[7]
  output[8] = C22 * invDet;   // inv22 = out[8]

  // --- @0xaf1cc..0xaf1d5  Epilogue -----------------------------------------------------
  //   ucomisd %xmm6, %xmm8 ; setbe %al ; popq %rbp ; retq
  // Second ucomisd is redundant (same flags word content is unchanged since the abs mask
  // load); setbe returns 1 iff xmm8 <= xmm6, i.e. 1e-7 <= |det|. We're on the non-singular
  // path so |det| > 1e-7 -> true.
  return true;
}
