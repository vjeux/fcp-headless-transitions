// raw-port: (anonymous namespace)::multiply(double const* a, double const* b, double* out)  [ProCore]
//
//   @ProCore 0x0af440  __ZN12_GLOBAL__N_18multiplyEPKdS1_Pd
//
// re/disasm:
//   raw-port/re/disasm/ProCore.__ZN12_GLOBAL__N_18multiplyEPKdS1_Pd.s
//
// A pure-math free function in ProCore's anonymous namespace. Signature (from the Itanium mangle
// `EPKdS1_Pd`): `multiply(double const*, double const*, double*)`. The body is a fully-unrolled
// SSE2 3x3 double-precision matrix multiply `out[i,j] = sum_k a[i,k] * b[k,j]`, row-major, with
// the following load/store pattern (byte offsets are dst-first per AT&T; below they are already
// unwound to array-index form):
//
//   INPUTS (9 doubles each, row-major 3x3):
//     a[0..2] = row 0    (rdi + 0x00, +0x08, +0x10)
//     a[3..5] = row 1    (         +0x18, +0x20, +0x28)
//     a[6..8] = row 2    (         +0x30, +0x38, +0x40)
//     b[0..2] = row 0    (rsi + 0x00, +0x08, +0x10)
//     b[3..5] = row 1    (         +0x18, +0x20, +0x28)
//     b[6..8] = row 2    (         +0x30, +0x38, +0x40)
//
//   OUTPUT stores (9 doubles):
//     out[0..1] via movupd @0xaf54b (xmm10)  — row 0, cols 0..1
//     out[2..3] via movupd @0xaf550 (xmm13)  — row 0 col 2 packed with row 1 col 0
//     out[4..5] via movupd @0xaf556 (xmm8)   — row 1, cols 1..2
//     out[6..7] via movupd @0xaf57c (xmm0)   — row 2, cols 0..1
//     out[8]    via movsd  @0xaf546 (xmm5)   — row 2, col 2 (scalar, written FIRST)
//
// The write to out[8] is emitted BEFORE the pair-stores in the machine, but ordering doesn't
// matter for correctness because out never aliases a or b in the call sites (verified by the
// caller passing distinct buffers; no memory-barrier or overlap-check exists in the body).
//
// DECODE — mapping each SIMD block to the 9 scalar products it computes:
//
//   BLOCK A (@0xaf444..0xaf482)   — out[8] scalar accumulator
//     xmm8 = b[2]                 (movsd 0x10(%rsi))
//     xmm9 = b[5]                 (movsd 0x28(%rsi))
//     xmm7 = b[8]                 (movsd 0x40(%rsi))
//     xmm2 = a[6]                 (movsd 0x30(%rdi))
//     xmm1 = a[7]                 (movsd 0x38(%rdi))
//     xmm0 = a[8]                 (movsd 0x40(%rdi))
//     xmm3 = b[2]*a[6]            (movapd; mulsd)
//     xmm4 = b[5]*a[7]            (movapd; mulsd)
//     xmm4 = xmm4 + xmm3          (addsd)  = a[6]*b[2] + a[7]*b[5]
//     xmm5 = b[8]*a[8]            (movapd; mulsd)
//     xmm5 = xmm5 + xmm4          (addsd)  = out[8] = a[6]*b[2] + a[7]*b[5] + a[8]*b[8]
//
//   BLOCK B (@0xaf486..0xaf4c4)   — out[0..1] pair (row 0 · cols 0..1)
//     xmm4  = (b[3], b[4])        (movupd 0x18(%rsi))
//     xmm3  = (b[6], b[7])        (movupd 0x30(%rsi))
//     xmm11 = (a[0], a[1])        (movupd 0x00(%rdi))
//     xmm12 = (a[2], a[3])        (movupd 0x10(%rdi))
//     xmm10 = (a[0], a[0])        (movddup 0x00(%rdi))
//     xmm6  = (b[0], b[1])        (movupd 0x00(%rsi))
//     xmm10 = xmm10 * xmm6        (mulpd)  = (a[0]*b[0], a[0]*b[1])
//     xmm13 = (a[1], a[1])        (movddup 0x08(%rdi))
//     xmm13 = xmm13 * xmm4        (mulpd)  = (a[1]*b[3], a[1]*b[4])
//     xmm13 = xmm13 + xmm10       (addpd)  = (a[0]*b[0]+a[1]*b[3], a[0]*b[1]+a[1]*b[4])
//     xmm10 = (a[2], a[2])        (movddup 0x10(%rdi))
//     xmm10 = xmm10 * xmm3        (mulpd)  = (a[2]*b[6], a[2]*b[7])
//     xmm10 = xmm10 + xmm13       (addpd)  = (out[0], out[1])
//
//   BLOCK C (@0xaf4c9..0xaf50c)   — out[2..3] pair (row 0 col 2, row 1 col 0)
//     xmm13 = xmm12 = (a[2], a[3])
//     movsd xmm11 -> xmm13        (xmm13 = (xmm11[0], xmm13[1]) = (a[0], a[3]))
//     unpcklpd xmm6, xmm8         (xmm8  = (xmm8[0], xmm6[0]) = (b[2], b[0]))
//     xmm8  = xmm13 * xmm8        (mulpd) = (a[0]*b[2], a[3]*b[0])
//     xmm13 = (a[4], a[5])        (movupd 0x20(%rdi))                   [reused later]
//     unpcklpd xmm4, xmm9         (xmm9  = (xmm9[0], xmm4[0]) = (b[5], b[3]))
//     shufpd $1, xmm13, xmm11     (xmm11 = (xmm11[1], xmm13[0]) = (a[1], a[4]))
//     xmm11 = xmm11 * xmm9        (mulpd) = (a[1]*b[5], a[4]*b[3])
//     xmm11 = xmm11 + xmm8        (addpd) = (a[0]*b[2]+a[1]*b[5], a[3]*b[0]+a[4]*b[3])
//     movsd xmm12 -> xmm13        (xmm13 = (xmm12[0], xmm13[1]) = (a[2], a[5]))
//     xmm8  = (b[1], b[2])        (movupd 0x08(%rsi))                   [reused in Block D]
//     unpcklpd xmm3, xmm7         (xmm7  = (xmm7[0], xmm3[0]) = (b[8], b[6]))
//     xmm13 = xmm13 * xmm7        (mulpd) = (a[2]*b[8], a[5]*b[6])
//     xmm13 = xmm13 + xmm11       (addpd) = (out[2], out[3])
//                                          = (a[0]*b[2]+a[1]*b[5]+a[2]*b[8],
//                                             a[3]*b[0]+a[4]*b[3]+a[5]*b[6])
//
//   BLOCK D (@0xaf511..0xaf541)   — out[4..5] pair (row 1, cols 1..2)
//     xmm7 = (a[3], a[3])         (movddup 0x18(%rdi))
//     xmm7 = xmm7 * xmm8          (mulpd, xmm8 = (b[1], b[2]))
//                                  = (a[3]*b[1], a[3]*b[2])
//     xmm8 = (b[4], b[5])         (movupd 0x20(%rsi))
//     xmm9 = (a[4], a[4])         (movddup 0x20(%rdi))
//     xmm9 = xmm9 * xmm8          (mulpd)   = (a[4]*b[4], a[4]*b[5])
//     xmm9 = xmm9 + xmm7          (addpd)   = (a[3]*b[1]+a[4]*b[4], a[3]*b[2]+a[4]*b[5])
//     xmm7 = (b[7], b[8])         (movupd 0x38(%rsi))
//     xmm8 = (a[5], a[5])         (movddup 0x28(%rdi))
//     xmm8 = xmm8 * xmm7          (mulpd)   = (a[5]*b[7], a[5]*b[8])
//     xmm8 = xmm8 + xmm9          (addpd)   = (out[4], out[5])
//                                             = (a[3]*b[1]+a[4]*b[4]+a[5]*b[7],
//                                                a[3]*b[2]+a[4]*b[5]+a[5]*b[8])
//
//   STORES (@0xaf546..0xaf556)
//     out[8]    = xmm5[0]         (movsd  0x40(%rdx))
//     out[0..1] = xmm10           (movupd (%rdx))
//     out[2..3] = xmm13           (movupd 0x10(%rdx))
//     out[4..5] = xmm8            (movupd 0x20(%rdx))
//
//   BLOCK E (@0xaf55c..0xaf578)   — out[6..7] pair (row 2, cols 0..1)
//     xmm2 = (a[6], a[6])         (movddup xmm2)         [xmm2 still holds a[6] from Block A]
//     xmm2 = xmm2 * xmm6          (mulpd, xmm6 = (b[0], b[1]))
//                                  = (a[6]*b[0], a[6]*b[1])
//     xmm1 = (a[7], a[7])         (movddup xmm1)         [xmm1 still holds a[7] from Block A]
//     xmm1 = xmm1 * xmm4          (mulpd, xmm4 = (b[3], b[4]))
//                                  = (a[7]*b[3], a[7]*b[4])
//     xmm1 = xmm1 + xmm2          (addpd)  = (a[6]*b[0]+a[7]*b[3], a[6]*b[1]+a[7]*b[4])
//     xmm0 = (a[8], a[8])         (movddup xmm0)         [xmm0 still holds a[8] from Block A]
//     xmm0 = xmm0 * xmm3          (mulpd, xmm3 = (b[6], b[7]))
//                                  = (a[8]*b[6], a[8]*b[7])
//     xmm0 = xmm0 + xmm1          (addpd)  = (out[6], out[7])
//                                             = (a[6]*b[0]+a[7]*b[3]+a[8]*b[6],
//                                                a[6]*b[1]+a[7]*b[4]+a[8]*b[7])
//
//   STORE (@0xaf57c)
//     out[6..7] = xmm0            (movupd 0x30(%rdx))
//
// Numeric width: every op is `sd`/`pd` (double-precision, 64-bit IEEE), no `ss`/`ps`. Everything
// happens in `number` (JS double) without `Math.fround`. Multiply/add are ordinary IEEE 754
// operations; register reuse across Blocks A→E ensures identical rounding order to the machine
// (each accumulator is (mul → mul → add → mul → add) — the same as the naive dot-product).

/**
 * (anonymous namespace)::multiply(double const* a, double const* b, double* out)
 *
 *   @ProCore 0x0af440  __ZN12_GLOBAL__N_18multiplyEPKdS1_Pd
 *
 * Row-major 3x3 double matrix multiply `out = a * b`. `a`, `b`, `out` must each expose at least
 * 9 doubles at indices 0..8; they must not alias (the disasm has no overlap check — matches the
 * ProCore call-site contract).
 */
export function anon_multiply_3x3(
  a: ArrayLike<number>,
  b: ArrayLike<number>,
  out: {
    [index: number]: number;
    readonly length: number;
  },
): void {
  // ── Load scalars needed later. (Block A pre-loads; the machine keeps them in xmm0/1/2 and
  //    reuses them in Block E — matching that reuse is behavior-preserving because addition and
  //    multiplication of the same operands produce the same IEEE result each time.)
  // @0xaf444  movsd 0x10(%rsi), %xmm8
  const b2 = b[2];
  // @0xaf44a  movsd 0x28(%rsi), %xmm9
  const b5 = b[5];
  // @0xaf450  movsd 0x40(%rsi), %xmm7
  const b8 = b[8];
  // @0xaf455  movsd 0x30(%rdi), %xmm2
  const a6 = a[6];
  // @0xaf45a  movsd 0x38(%rdi), %xmm1
  const a7 = a[7];
  // @0xaf45f  movsd 0x40(%rdi), %xmm0
  const a8 = a[8];

  // ── Block A: out[8] scalar dot product.
  // @0xaf464..0xaf482
  //   xmm3 = b2*a6; xmm4 = b5*a7; xmm4 += xmm3; xmm5 = b8*a8; xmm5 += xmm4
  const out8 = b2 * a6 + b5 * a7 + b8 * a8;

  // ── Additional loads used by Blocks B..E (grouped as they appear in the machine).
  // @0xaf486  movupd 0x18(%rsi), %xmm4          — (b[3], b[4])
  const b3 = b[3], b4 = b[4];
  // @0xaf48b  movupd 0x30(%rsi), %xmm3          — (b[6], b[7])
  const b6 = b[6], b7 = b[7];
  // @0xaf490  movupd (%rdi), %xmm11             — (a[0], a[1])
  const a0 = a[0], a1 = a[1];
  // @0xaf495  movupd 0x10(%rdi), %xmm12         — (a[2], a[3])
  const a2 = a[2], a3 = a[3];
  // @0xaf4a0  movupd (%rsi), %xmm6              — (b[0], b[1])
  const b0 = b[0], b1 = b[1];
  // @0xaf4dd  movupd 0x20(%rdi), %xmm13         — (a[4], a[5])
  const a4 = a[4], a5 = a[5];

  // ── Block B: out[0..1] = row 0 of a · cols 0..1 of b.
  // @0xaf49b..0xaf4c4
  //   (a0*b0, a0*b1) + (a1*b3, a1*b4) + (a2*b6, a2*b7)
  const out0 = a0 * b0 + a1 * b3 + a2 * b6;
  const out1 = a0 * b1 + a1 * b4 + a2 * b7;

  // ── Block C: out[2..3] — row 0 col 2 paired with row 1 col 0.
  // @0xaf4c9..0xaf50c
  //   (a0*b2, a3*b0) + (a1*b5, a4*b3) + (a2*b8, a5*b6)
  const out2 = a0 * b2 + a1 * b5 + a2 * b8;
  const out3 = a3 * b0 + a4 * b3 + a5 * b6;

  // ── Block D: out[4..5] = row 1 of a · cols 1..2 of b.
  // @0xaf511..0xaf541
  //   (a3*b1, a3*b2) + (a4*b4, a4*b5) + (a5*b7, a5*b8)
  const out4 = a3 * b1 + a4 * b4 + a5 * b7;
  const out5 = a3 * b2 + a4 * b5 + a5 * b8;

  // ── Block E: out[6..7] = row 2 of a · cols 0..1 of b. (Reuses xmm0/1/2/3/4/6 from earlier
  //    blocks — a6, a7, a8, and the (b3,b4), (b6,b7), (b0,b1) pairs.)
  // @0xaf55c..0xaf578
  //   (a6*b0, a6*b1) + (a7*b3, a7*b4) + (a8*b6, a8*b7)
  const out6 = a6 * b0 + a7 * b3 + a8 * b6;
  const out7 = a6 * b1 + a7 * b4 + a8 * b7;

  // ── Stores. Machine order: out[8] first (@0xaf546), then out[0..1], out[2..3], out[4..5],
  //    then finally out[6..7] (@0xaf57c). We mirror the order for provenance even though the
  //    non-aliasing contract makes it unobservable.
  out[8] = out8;   // @0xaf546  movsd  %xmm5, 0x40(%rdx)
  out[0] = out0;   // @0xaf54b  movupd %xmm10, (%rdx)
  out[1] = out1;
  out[2] = out2;   // @0xaf550  movupd %xmm13, 0x10(%rdx)
  out[3] = out3;
  out[4] = out4;   // @0xaf556  movupd %xmm8, 0x20(%rdx)
  out[5] = out5;
  out[6] = out6;   // @0xaf57c  movupd %xmm0, 0x30(%rdx)
  out[7] = out7;
}

/**
 * Alias export using the exact Itanium mangled name so provenance searches by symbol succeed.
 * @0xaf440 ProCore  __ZN12_GLOBAL__N_18multiplyEPKdS1_Pd
 */
export const __ZN12_GLOBAL__N_18multiplyEPKdS1_Pd = anon_multiply_3x3;
