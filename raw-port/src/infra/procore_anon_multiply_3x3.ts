// raw-port: (anonymous namespace)::multiply(double const*, double const*, double*)  — ProCore
//
//   @ProCore 0x000af440  __ZN12_GLOBAL__N_18multiplyEPKdS1_Pd
//
// re/disasm:
//   raw-port/re/disasm/ProCore.__ZN12_GLOBAL__N_18multiplyEPKdS1_Pd.s
//
// A translation-unit-local free function: a 3x3 double-precision matrix multiply
//   dst = a * b
// where a, b, dst are row-major 3x3 matrices of doubles laid out as 9 consecutive doubles at
// offsets +0x00, +0x08, +0x10, +0x18, +0x20, +0x28, +0x30, +0x38, +0x40 (indices [0..8]).
//
// The compiler emitted a hand-optimised SSE2 sequence that fuses each pair of adjacent output
// scalars into one packed-double lane (movupd/mulpd/addpd/movddup/unpcklpd/shufpd). The scalar
// last-lane dst[8] is written first as movsd; the other 8 outputs are stored as four movupd
// pairs. Faithful line-for-line port below — every register load and pack instruction is
// mirrored one-to-one, and every input/output byte offset is cited @0xADDR.
//
// SIGNATURE (recovered from calling convention):
//   rdi = a (const double* — 9 doubles, row-major 3x3)
//   rsi = b (const double* — 9 doubles, row-major 3x3)
//   rdx = dst (double*    — 9 doubles, row-major 3x3)
//   returns void
//
// PROOF OF SEMANTICS (dst[8] path, the pure-scalar block @0xaf444..@0xaf482):
//   xmm8 = b[2]  (0x10)     @0xaf444
//   xmm9 = b[5]  (0x28)     @0xaf44a
//   xmm7 = b[8]  (0x40)     @0xaf450
//   xmm2 = a[6]  (0x30)     @0xaf455
//   xmm1 = a[7]  (0x38)     @0xaf45a
//   xmm0 = a[8]  (0x40)     @0xaf45f
//   xmm3 = xmm8 * xmm2 = b[2]*a[6]                                @0xaf464/@0xaf469
//   xmm4 = xmm9 * xmm1 = b[5]*a[7]                                @0xaf46d/@0xaf472
//   xmm4 += xmm3                                                  @0xaf476
//   xmm5 = xmm7 * xmm0 = b[8]*a[8]                                @0xaf47a/@0xaf47e
//   xmm5 += xmm4       = a[6]*b[2] + a[7]*b[5] + a[8]*b[8]        @0xaf482
//   *(dst + 0x40) = xmm5                                          @0xaf546
// which is row-major dst[2,2] = sum_k a[2,k]*b[k,2]. Confirms the whole function is a
// standard 3x3 row-major C = A*B.
//
// The remaining SIMD blocks are transcribed below so an oracle harness that step-runs the
// FCP binary would produce identical intermediate results in identical order (float rounding
// depends on the accumulation ORDER — see PORTING_SPEC Rule 4).
//
// FRAMEWORK: ProCore. DEPENDENCIES: none (pure math on double[]).

/**
 * (anonymous namespace)::multiply(double const* a, double const* b, double* dst)
 *
 * @ProCore 0xaf440
 *
 * Faithful port of the SSE2 3x3-matmul body. Uses `Math.fround`? — NO: every register in the
 * disasm is `movsd`/`mulsd`/`addsd`/`mulpd`/`addpd` (double-precision); the calling convention
 * takes/returns `double*`. JavaScript numbers are IEEE-754 double, which matches bit-for-bit.
 * (fround would be wrong here — the machine never truncates to float32.)
 *
 * Accumulation order matches the disasm exactly, so oracle parity is bit-exact.
 */
export function procore_anon_multiply_3x3(
  a: Readonly<Float64Array> | readonly number[],
  b: Readonly<Float64Array> | readonly number[],
  dst: Float64Array | number[],
): void {
  // ── scalar block: compute dst[8] as (a[6]*b[2] + a[7]*b[5] + a[8]*b[8]) ────────────────
  // @0xaf444 movsd 0x10(rsi), xmm8  ;  @0xaf44a movsd 0x28(rsi), xmm9  ;  @0xaf450 movsd 0x40(rsi), xmm7
  const b_2 = b[2] as number; // @0x10 rsi
  const b_5 = b[5] as number; // @0x28 rsi
  const b_8 = b[8] as number; // @0x40 rsi
  // @0xaf455 movsd 0x30(rdi), xmm2 ;  @0xaf45a movsd 0x38(rdi), xmm1 ;  @0xaf45f movsd 0x40(rdi), xmm0
  const a_6 = a[6] as number; // @0x30 rdi
  const a_7 = a[7] as number; // @0x38 rdi
  const a_8 = a[8] as number; // @0x40 rdi
  // @0xaf464/@0xaf469 movapd xmm8→xmm3; mulsd xmm2,xmm3  ⇒  xmm3 = b[2]*a[6]
  const xmm3_scalar = b_2 * a_6;
  // @0xaf46d/@0xaf472 movapd xmm9→xmm4; mulsd xmm1,xmm4  ⇒  xmm4 = b[5]*a[7]
  const xmm4_scalar_pre = b_5 * a_7;
  // @0xaf476 addsd xmm3,xmm4                             ⇒  xmm4 += xmm3
  const xmm4_scalar = xmm4_scalar_pre + xmm3_scalar;
  // @0xaf47a/@0xaf47e movapd xmm7→xmm5; mulsd xmm0,xmm5  ⇒  xmm5 = b[8]*a[8]
  const xmm5_scalar_pre = b_8 * a_8;
  // @0xaf482 addsd xmm4,xmm5                             ⇒  xmm5 += xmm4
  const dst_8 = xmm5_scalar_pre + xmm4_scalar;

  // ── packed block A: dst[0..1] = a_row0 · (b_col0, b_col1) ─────────────────────────────
  // @0xaf486 movupd 0x18(rsi), xmm4        ⇒  xmm4 = (b[3], b[4])
  const b_3 = b[3] as number;
  const b_4 = b[4] as number;
  // @0xaf48b movupd 0x30(rsi), xmm3        ⇒  xmm3 = (b[6], b[7])
  const b_6 = b[6] as number;
  const b_7 = b[7] as number;
  // @0xaf490 movupd 0x00(rdi), xmm11       ⇒  xmm11 = (a[0], a[1])
  const a_0 = a[0] as number;
  const a_1 = a[1] as number;
  // @0xaf495 movupd 0x10(rdi), xmm12       ⇒  xmm12 = (a[2], a[3])
  const a_2 = a[2] as number;
  const a_3 = a[3] as number;
  // @0xaf49b movddup 0x00(rdi), xmm10      ⇒  xmm10 = (a[0], a[0])
  // @0xaf4a0 movupd 0x00(rsi), xmm6        ⇒  xmm6  = (b[0], b[1])
  const b_0 = b[0] as number;
  const b_1 = b[1] as number;
  // @0xaf4a4 mulpd xmm6, xmm10             ⇒  xmm10 = (a[0]*b[0], a[0]*b[1])
  const xmm10_lo_A = a_0 * b_0;
  const xmm10_hi_A = a_0 * b_1;
  // @0xaf4a9 movddup 0x08(rdi), xmm13      ⇒  xmm13 = (a[1], a[1])
  // @0xaf4af mulpd  xmm4,  xmm13           ⇒  xmm13 = (a[1]*b[3], a[1]*b[4])
  const xmm13_lo_A = a_1 * b_3;
  const xmm13_hi_A = a_1 * b_4;
  // @0xaf4b4 addpd xmm10, xmm13            ⇒  xmm13 += xmm10
  const xmm13_lo_B = xmm13_lo_A + xmm10_lo_A;
  const xmm13_hi_B = xmm13_hi_A + xmm10_hi_A;
  // @0xaf4b9 movddup 0x10(rdi), xmm10      ⇒  xmm10 = (a[2], a[2])
  // @0xaf4bf mulpd  xmm3,  xmm10           ⇒  xmm10 = (a[2]*b[6], a[2]*b[7])
  const xmm10_lo_C = a_2 * b_6;
  const xmm10_hi_C = a_2 * b_7;
  // @0xaf4c4 addpd  xmm13, xmm10           ⇒  xmm10 += xmm13
  const dst_0 = xmm10_lo_C + xmm13_lo_B; // = a[0]*b[0]+a[1]*b[3]+a[2]*b[6]
  const dst_1 = xmm10_hi_C + xmm13_hi_B; // = a[0]*b[1]+a[1]*b[4]+a[2]*b[7]

  // ── packed block B: dst[2..3] = (a_row0·b_col2, a_row1·b_col0) ─────────────────────────
  // @0xaf4c9 movapd xmm12 → xmm13          ⇒  xmm13 = (a[2], a[3])
  // @0xaf4ce movsd  xmm11, xmm13           ⇒  xmm13 = (a[0], a[3])   (low from xmm11, high kept)
  // @0xaf4d3 unpcklpd xmm6, xmm8           ⇒  xmm8  = (b[2], b[0])   (b[2] from old xmm8, b[0] from xmm6)
  // @0xaf4d8 mulpd  xmm13, xmm8            ⇒  xmm8  = (a[0]*b[2], a[3]*b[0])
  const xmm8_lo_B = a_0 * b_2;
  const xmm8_hi_B = a_3 * b_0;
  // @0xaf4dd movupd 0x20(rdi), xmm13       ⇒  xmm13 = (a[4], a[5])
  const a_4 = a[4] as number;
  const a_5 = a[5] as number;
  // @0xaf4e3 unpcklpd xmm4, xmm9           ⇒  xmm9  = (b[5], b[3])   (b[5] from old xmm9, b[3] from xmm4-lo)
  // @0xaf4e8 shufpd $0x1, xmm13, xmm11     ⇒  xmm11 = (xmm11[1], xmm13[0]) = (a[1], a[4])
  // @0xaf4ee mulpd  xmm9, xmm11            ⇒  xmm11 = (a[1]*b[5], a[4]*b[3])
  const xmm11_lo_B = a_1 * b_5;
  const xmm11_hi_B = a_4 * b_3;
  // @0xaf4f3 addpd  xmm8, xmm11            ⇒  xmm11 += xmm8
  const xmm11_lo_C = xmm11_lo_B + xmm8_lo_B;
  const xmm11_hi_C = xmm11_hi_B + xmm8_hi_B;
  // @0xaf4f8 movsd  xmm12, xmm13           ⇒  xmm13 = (a[2], a[5])   (low from xmm12, high kept from prior xmm13)
  // @0xaf4fd movupd 0x08(rsi), xmm8        ⇒  xmm8  = (b[1], b[2])   [captured; consumed in block C]
  // @0xaf503 unpcklpd xmm3, xmm7           ⇒  xmm7  = (b[8], b[6])   (b[8] from old xmm7 low, b[6] from xmm3 low)
  // @0xaf507 mulpd   xmm7, xmm13           ⇒  xmm13 = (a[2]*b[8], a[5]*b[6])
  const xmm13_lo_D = a_2 * b_8;
  const xmm13_hi_D = a_5 * b_6;
  // @0xaf50c addpd  xmm11, xmm13           ⇒  xmm13 += xmm11
  const dst_2 = xmm13_lo_D + xmm11_lo_C; // = a[0]*b[2]+a[1]*b[5]+a[2]*b[8]  (dst[0,2])
  const dst_3 = xmm13_hi_D + xmm11_hi_C; // = a[3]*b[0]+a[4]*b[3]+a[5]*b[6]  (dst[1,0])

  // ── packed block C: dst[4..5] = a_row1 · (b_col1, b_col2) ─────────────────────────────
  // @0xaf511 movddup 0x18(rdi), xmm7       ⇒  xmm7  = (a[3], a[3])
  // @0xaf516 mulpd   xmm8, xmm7            ⇒  xmm7  = (a[3]*b[1], a[3]*b[2])   [xmm8 = (b[1], b[2]) from block B]
  const xmm7_lo_C = a_3 * b_1;
  const xmm7_hi_C = a_3 * b_2;
  // @0xaf51b movupd 0x20(rsi), xmm8        ⇒  xmm8  = (b[4], b[5])
  // @0xaf521 movddup 0x20(rdi), xmm9       ⇒  xmm9  = (a[4], a[4])
  // @0xaf527 mulpd   xmm8, xmm9            ⇒  xmm9  = (a[4]*b[4], a[4]*b[5])
  const xmm9_lo_C = a_4 * b_4;
  const xmm9_hi_C = a_4 * b_5;
  // @0xaf52c addpd   xmm7, xmm9            ⇒  xmm9 += xmm7
  const xmm9_lo_D = xmm9_lo_C + xmm7_lo_C;
  const xmm9_hi_D = xmm9_hi_C + xmm7_hi_C;
  // @0xaf531 movupd 0x38(rsi), xmm7        ⇒  xmm7  = (b[7], b[8])
  // @0xaf536 movddup 0x28(rdi), xmm8       ⇒  xmm8  = (a[5], a[5])
  // @0xaf53c mulpd   xmm7, xmm8            ⇒  xmm8  = (a[5]*b[7], a[5]*b[8])
  const xmm8_lo_C = a_5 * b_7;
  const xmm8_hi_C = a_5 * b_8;
  // @0xaf541 addpd   xmm9, xmm8            ⇒  xmm8 += xmm9
  const dst_4 = xmm8_lo_C + xmm9_lo_D; // = a[3]*b[1]+a[4]*b[4]+a[5]*b[7]  (dst[1,1])
  const dst_5 = xmm8_hi_C + xmm9_hi_D; // = a[3]*b[2]+a[4]*b[5]+a[5]*b[8]  (dst[1,2])

  // ── final block D: dst[6..7] = a_row2 · (b_col0, b_col1) ──────────────────────────────
  // Note the last block reuses xmm2/xmm1/xmm0 (holding a[6],a[7],a[8] from the initial scalar
  // block) and xmm6/xmm4/xmm3 (holding (b[0],b[1]) / (b[3],b[4]) / (b[6],b[7])).
  // @0xaf55c movddup xmm2, xmm2            ⇒  xmm2 = (a[6], a[6])
  // @0xaf560 mulpd   xmm6, xmm2            ⇒  xmm2 = (a[6]*b[0], a[6]*b[1])
  const xmm2_lo_D = a_6 * b_0;
  const xmm2_hi_D = a_6 * b_1;
  // @0xaf564 movddup xmm1, xmm1            ⇒  xmm1 = (a[7], a[7])
  // @0xaf568 mulpd   xmm4, xmm1            ⇒  xmm1 = (a[7]*b[3], a[7]*b[4])
  const xmm1_lo_D = a_7 * b_3;
  const xmm1_hi_D = a_7 * b_4;
  // @0xaf56c addpd   xmm2, xmm1            ⇒  xmm1 += xmm2
  const xmm1_lo_E = xmm1_lo_D + xmm2_lo_D;
  const xmm1_hi_E = xmm1_hi_D + xmm2_hi_D;
  // @0xaf570 movddup xmm0, xmm0            ⇒  xmm0 = (a[8], a[8])
  // @0xaf574 mulpd   xmm3, xmm0            ⇒  xmm0 = (a[8]*b[6], a[8]*b[7])
  const xmm0_lo_D = a_8 * b_6;
  const xmm0_hi_D = a_8 * b_7;
  // @0xaf578 addpd   xmm1, xmm0            ⇒  xmm0 += xmm1
  const dst_6 = xmm0_lo_D + xmm1_lo_E; // = a[6]*b[0]+a[7]*b[3]+a[8]*b[6]  (dst[2,0])
  const dst_7 = xmm0_hi_D + xmm1_hi_E; // = a[6]*b[1]+a[7]*b[4]+a[8]*b[7]  (dst[2,1])

  // ── stores (dst[8] first, matching @0xaf546, then packed pairs) ───────────────────────
  // @0xaf546 movsd  xmm5, 0x40(rdx)
  dst[8] = dst_8;
  // @0xaf54b movupd xmm10, 0x00(rdx)
  dst[0] = dst_0;
  dst[1] = dst_1;
  // @0xaf550 movupd xmm13, 0x10(rdx)
  dst[2] = dst_2;
  dst[3] = dst_3;
  // @0xaf556 movupd xmm8, 0x20(rdx)
  dst[4] = dst_4;
  dst[5] = dst_5;
  // @0xaf57c movupd xmm0, 0x30(rdx)
  dst[6] = dst_6;
  dst[7] = dst_7;
  // @0xaf581/@0xaf582 popq %rbp; retq
}

/** Alias export: mangled symbol name. @ProCore 0xaf440 */
export const __ZN12_GLOBAL__N_18multiplyEPKdS1_Pd = procore_anon_multiply_3x3;
