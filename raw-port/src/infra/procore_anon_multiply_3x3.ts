// (anonymous namespace)::multiply(double const*, double const*, double*) @ProCore 0xaf440
//   __ZN12_GLOBAL__N_18multiplyEPKdS1_Pd
//
// Row-major 3x3 double matrix multiply:  C = A * B
// A, B, and C are each 9 contiguous doubles (72 bytes) at the given pointers.
// This is a hot SIMD helper in ProCore's anonymous namespace (translation-unit
// local). A faithful line-for-line transcription of the disassembly at
//   raw-port/re/disasm/ProCore.__ZN12_GLOBAL__N_18multiplyEPKdS1_Pd.s
//
// Sibling of (anonymous namespace)::invert @ProCore 0xaf044 (see
// raw-port/src/infra/procore_anon_invert_3x3.ts) and
// (anonymous namespace)::transform @ProCore 0xaf590; all three live in the
// same anon namespace and share the row-major 3x3 double layout.
//
// -----------------------------------------------------------------------------
// LAYOUT (row-major, 9 contiguous doubles per matrix)
// -----------------------------------------------------------------------------
//   M[i,j] at byte offset +0x8*(3*i + j)
//     M[0,0]=+0x00  M[0,1]=+0x08  M[0,2]=+0x10
//     M[1,0]=+0x18  M[1,1]=+0x20  M[1,2]=+0x28
//     M[2,0]=+0x30  M[2,1]=+0x38  M[2,2]=+0x40
//
// SysV x86_64 argument regs:
//   rdi = A (double const*)
//   rsi = B (double const*)
//   rdx = C (double*, output)
//
// -----------------------------------------------------------------------------
// DISASM DECODE — verified by tracing every store back to Cij = sum_k Aik*Bkj
// -----------------------------------------------------------------------------
// The compiler organises the 9 dot products into 4 SSE2 packed pairs plus one
// scalar tail (C[2,2]), each producing a store to (rdx). Register trace below
// cites @0xADDR for every mul/add/store.
//
// (a) SCALAR TAIL — C[2,2] @0xaf444..0xaf482, store @0xaf546 to +0x40(rdx):
//     xmm8  = B[0,2]  (movsd  +0x10(rsi))            @0xaf444
//     xmm9  = B[1,2]  (movsd  +0x28(rsi))            @0xaf44a
//     xmm7  = B[2,2]  (movsd  +0x40(rsi))            @0xaf450
//     xmm2  = A[2,0]  (movsd  +0x30(rdi))            @0xaf455
//     xmm1  = A[2,1]  (movsd  +0x38(rdi))            @0xaf45a
//     xmm0  = A[2,2]  (movsd  +0x40(rdi))            @0xaf45f
//     xmm3  = xmm8*xmm2                              @0xaf464..0xaf469
//     xmm4  = xmm9*xmm1                              @0xaf46d..0xaf472
//     xmm4 += xmm3                                   @0xaf476
//     xmm5  = xmm7*xmm0                              @0xaf47a..0xaf47e
//     xmm5 += xmm4                                   @0xaf482
//     -> xmm5 = A[2,0]*B[0,2] + A[2,1]*B[1,2] + A[2,2]*B[2,2]   = C[2,2]
//     STORE scalar low double xmm5 -> +0x40(rdx)               @0xaf546
//
// (b) PACKED PAIR — C[0,0],C[0,1] @0xaf486..0xaf4c4, store @0xaf54b to (rdx):
//     xmm4  = (B[1,0], B[1,1])   movupd +0x18(rsi)   @0xaf486
//     xmm3  = (B[2,0], B[2,1])   movupd +0x30(rsi)   @0xaf48b
//     xmm11 = (A[0,0], A[0,1])   movupd  (rdi)       @0xaf490
//     xmm12 = (A[0,2], A[1,0])   movupd +0x10(rdi)   @0xaf495
//     xmm10 = (A[0,0], A[0,0])   movddup (rdi)       @0xaf49b
//     xmm6  = (B[0,0], B[0,1])   movupd  (rsi)       @0xaf4a0
//     xmm10 = xmm10 * xmm6       -> (A[0,0]*B[0,0], A[0,0]*B[0,1])
//     xmm13 = (A[0,1], A[0,1])   movddup +0x8(rdi)   @0xaf4a9
//     xmm13 = xmm13 * xmm4       -> (A[0,1]*B[1,0], A[0,1]*B[1,1])
//     xmm13 += xmm10             -> partial row-0 sum (k=0,1)
//     xmm10 = (A[0,2], A[0,2])   movddup +0x10(rdi)  @0xaf4b9
//     xmm10 = xmm10 * xmm3       -> (A[0,2]*B[2,0], A[0,2]*B[2,1])
//     xmm10 += xmm13             -> (C[0,0], C[0,1])
//     STORE packed xmm10 -> (rdx)                             @0xaf54b
//
// (c) PACKED PAIR — C[0,2],C[1,0] @0xaf4c9..0xaf50c, store @0xaf550 to +0x10(rdx):
//     Notation: [lo|hi] denotes the two 64-bit lanes of an xmm reg.
//     xmm13 = xmm12                                  @0xaf4c9   -> [A[0,2] | A[1,0]]
//     movsd xmm11, xmm13                             @0xaf4ce   -> xmm13 = [A[0,0] | A[1,0]]
//     unpcklpd xmm6, xmm8                            @0xaf4d3   -> xmm8  = [B[0,2] | B[0,0]]
//     xmm8 = xmm8 * xmm13                            @0xaf4d8   -> [A[0,0]*B[0,2] , A[1,0]*B[0,0]]
//     xmm13 = (A[1,1], A[1,2])   movupd +0x20(rdi)   @0xaf4dd
//     unpcklpd xmm4, xmm9                            @0xaf4e3   -> xmm9  = [B[1,2] | B[1,0]]
//     shufpd $0x1, xmm13, xmm11                      @0xaf4e8   -> xmm11 = [xmm11.hi | xmm13.lo]
//                                                                 = [A[0,1] | A[1,1]]
//     xmm11 = xmm11 * xmm9                           @0xaf4ee   -> [A[0,1]*B[1,2] , A[1,1]*B[1,0]]
//     xmm11 += xmm8                                  @0xaf4f3   -> partial (k=0,1)
//     movsd xmm12, xmm13                             @0xaf4f8   -> xmm13 = [xmm12.lo | xmm13.hi]
//                                                                 = [A[0,2] | A[1,2]]
//     xmm8  = (B[0,1], B[0,2])   movupd +0x8(rsi)    @0xaf4fd  (staged for block (d))
//     unpcklpd xmm3, xmm7                            @0xaf503   -> xmm7  = [B[2,2] | B[2,0]]
//     xmm13 = xmm7 * xmm13                           @0xaf507   -> [A[0,2]*B[2,2] , A[1,2]*B[2,0]]
//     xmm13 += xmm11                                 @0xaf50c   -> (C[0,2], C[1,0])
//     STORE packed xmm13 -> +0x10(rdx)                          @0xaf550
//
// (d) PACKED PAIR — C[1,1],C[1,2] @0xaf511..0xaf541, store @0xaf556 to +0x20(rdx):
//     xmm7  = (A[1,0], A[1,0])   movddup +0x18(rdi)  @0xaf511
//     xmm7  = xmm7 * xmm8        (xmm8=(B[0,1],B[0,2]) from @0xaf4fd)     @0xaf516
//                                -> (A[1,0]*B[0,1], A[1,0]*B[0,2])
//     xmm8  = (B[1,1], B[1,2])   movupd +0x20(rsi)   @0xaf51b
//     xmm9  = (A[1,1], A[1,1])   movddup +0x20(rdi)  @0xaf521
//     xmm9  = xmm9 * xmm8        -> (A[1,1]*B[1,1], A[1,1]*B[1,2])         @0xaf527
//     xmm9 += xmm7                                                          @0xaf52c
//     xmm7  = (B[2,1], B[2,2])   movupd +0x38(rsi)   @0xaf531
//     xmm8  = (A[1,2], A[1,2])   movddup +0x28(rdi)  @0xaf536
//     xmm8  = xmm8 * xmm7        -> (A[1,2]*B[2,1], A[1,2]*B[2,2])          @0xaf53c
//     xmm8 += xmm9               -> (C[1,1], C[1,2])                        @0xaf541
//     STORE packed xmm8 -> +0x20(rdx)                                       @0xaf556
//
// (e) PACKED PAIR — C[2,0],C[2,1] @0xaf55c..0xaf578, store @0xaf57c to +0x30(rdx):
//     xmm2 already = A[2,0], xmm1 = A[2,1], xmm0 = A[2,2].
//     xmm6=(B[0,0],B[0,1]), xmm4=(B[1,0],B[1,1]), xmm3=(B[2,0],B[2,1]) all
//     survive from earlier packed loads.
//     xmm2 = movddup xmm2        -> (A[2,0], A[2,0])                        @0xaf55c
//     xmm2 = xmm2 * xmm6         -> (A[2,0]*B[0,0], A[2,0]*B[0,1])          @0xaf560
//     xmm1 = movddup xmm1        -> (A[2,1], A[2,1])                        @0xaf564
//     xmm1 = xmm1 * xmm4         -> (A[2,1]*B[1,0], A[2,1]*B[1,1])          @0xaf568
//     xmm1 += xmm2                                                          @0xaf56c
//     xmm0 = movddup xmm0        -> (A[2,2], A[2,2])                        @0xaf570
//     xmm0 = xmm0 * xmm3         -> (A[2,2]*B[2,0], A[2,2]*B[2,1])          @0xaf574
//     xmm0 += xmm1               -> (C[2,0], C[2,1])                        @0xaf578
//     STORE packed xmm0 -> +0x30(rdx)                                       @0xaf57c
//
// STORE ORDER on rdx (matches @0xaf546..@0xaf57c):
//   +0x40 : C[2,2]                (scalar,  block a)
//   +0x00 : C[0,0], C[0,1]        (packed,  block b)
//   +0x10 : C[0,2], C[1,0]        (packed,  block c)
//   +0x20 : C[1,1], C[1,2]        (packed,  block d)
//   +0x30 : C[2,0], C[2,1]        (packed,  block e)
//
// -----------------------------------------------------------------------------
// FRONTIER CALLEES — NONE.
// -----------------------------------------------------------------------------
// The disasm body contains no `callq` at all — enter, SSE2 arithmetic, ret.
// Pure double-precision ops (movsd/movupd/movapd/movddup/unpcklpd/shufpd/mulsd/
// mulpd/addsd/addpd), so JS `number` matches bit-for-bit. NO Math.fround needed
// (nor allowed — cvtsd2ss is absent, matching PCMatrix44Tmpl.ts numerics header).
//
// depgraph.py deps __ZN12_GLOBAL__N_18multiplyEPKdS1_Pd -> (empty; 0 deps)
//
// -----------------------------------------------------------------------------
// USAGE
// -----------------------------------------------------------------------------
// Callers pass three 9-element arrays — same convention as
// `procore_anon_invert_3x3` and `procore_anon_transform_3x3`. The function
// mutates `c` in place. No aliasing check is performed (matches the FCP binary,
// which also does not guard against A === C or B === C — all A/B loads finish
// before the first C store at @0xaf546, so C === A or C === B would corrupt
// the SIMD-fused row 1/2 sums).

/** Framework provenance for this leaf. */
export const PROCORE_ANON_MULTIPLY_3X3_ADDR = 0x000af440; // @ProCore

/**
 * Row-major 3x3 double matrix multiply. Faithful port of
 * (anonymous namespace)::multiply(double const*, double const*, double*)
 * at @ProCore 0xaf440.
 *
 *   c[i*3 + j] = sum_{k=0..2}  a[i*3 + k] * b[k*3 + j]
 */
export function procore_anon_multiply_3x3(
  a: ArrayLike<number>,
  b: ArrayLike<number>,
  c: Float64Array | number[],
): void {
  // ---- Load A and B into named row-major elements ---------------------------
  // Scalar low-lane loads (block a):
  const b02 = b[2];  // xmm8 low @0xaf444
  const b12 = b[5];  // xmm9 low @0xaf44a
  const b22 = b[8];  // xmm7 low @0xaf450
  const a20 = a[6];  // xmm2 low @0xaf455
  const a21 = a[7];  // xmm1 low @0xaf45a
  const a22 = a[8];  // xmm0 low @0xaf45f
  // Packed movupd loads (blocks b–e):
  const b10 = b[3];  // xmm4.lo @0xaf486
  const b11 = b[4];  // xmm4.hi @0xaf486
  const b20 = b[6];  // xmm3.lo @0xaf48b
  const b21 = b[7];  // xmm3.hi @0xaf48b
  const a00 = a[0];  // xmm11.lo @0xaf490
  const a01 = a[1];  // xmm11.hi @0xaf490
  const a02 = a[2];  // xmm12.lo @0xaf495
  const a10 = a[3];  // xmm12.hi @0xaf495
  const b00 = b[0];  // xmm6.lo @0xaf4a0
  const b01 = b[1];  // xmm6.hi @0xaf4a0
  const a11 = a[4];  // xmm13.lo @0xaf4dd
  const a12 = a[5];  // xmm13.hi @0xaf4dd

  // ---- (a) SCALAR TAIL — C[2,2] @0xaf464..0xaf482 --------------------------
  //   xmm3 = B[0,2]*A[2,0]                       @0xaf464..0xaf469
  //   xmm4 = B[1,2]*A[2,1]                       @0xaf46d..0xaf472
  //   xmm4 += xmm3                               @0xaf476
  //   xmm5 = B[2,2]*A[2,2]                       @0xaf47a..0xaf47e
  //   xmm5 += xmm4                               @0xaf482
  const c22 = b22 * a22 + (b12 * a21 + b02 * a20);

  // ---- (b) C[0,0], C[0,1] @0xaf49b..0xaf4c4 --------------------------------
  //   xmm10 = (A[0,0]*B[0,0], A[0,0]*B[0,1])     @0xaf49b..0xaf4a4
  //   xmm13 = (A[0,1]*B[1,0], A[0,1]*B[1,1])     @0xaf4a9..0xaf4af
  //   xmm13 += xmm10                             @0xaf4b4
  //   xmm10 = (A[0,2]*B[2,0], A[0,2]*B[2,1])     @0xaf4b9..0xaf4bf
  //   xmm10 += xmm13                             @0xaf4c4
  const c00 = a02 * b20 + (a01 * b10 + a00 * b00);
  const c01 = a02 * b21 + (a01 * b11 + a00 * b01);

  // ---- (c) C[0,2], C[1,0] @0xaf4c9..0xaf50c --------------------------------
  //   xmm13 = [A[0,0] | A[1,0]] via movsd xmm11,xmm13                @0xaf4c9..0xaf4ce
  //   xmm8  = [B[0,2] | B[0,0]] via unpcklpd xmm6,xmm8               @0xaf4d3
  //   xmm8  = xmm8 * xmm13 = [A[0,0]*B[0,2] , A[1,0]*B[0,0]]         @0xaf4d8
  //   xmm11 = [A[0,1] | A[1,1]] via shufpd $1                        @0xaf4e8
  //   xmm9  = [B[1,2] | B[1,0]] via unpcklpd xmm4,xmm9               @0xaf4e3
  //   xmm11 = xmm11 * xmm9 = [A[0,1]*B[1,2] , A[1,1]*B[1,0]]         @0xaf4ee
  //   xmm11 += xmm8                                                  @0xaf4f3
  //   xmm13 = [A[0,2] | A[1,2]] via movsd xmm12,xmm13                @0xaf4f8
  //   xmm7  = [B[2,2] | B[2,0]] via unpcklpd xmm3,xmm7               @0xaf503
  //   xmm13 = xmm7 * xmm13 = [A[0,2]*B[2,2] , A[1,2]*B[2,0]]         @0xaf507
  //   xmm13 += xmm11 = (C[0,2], C[1,0])                              @0xaf50c
  const c02 = a02 * b22 + (a01 * b12 + a00 * b02);
  const c10 = a12 * b20 + (a11 * b10 + a10 * b00);

  // ---- (d) C[1,1], C[1,2] @0xaf511..0xaf541 --------------------------------
  //   xmm8 (staged @0xaf4fd) = (B[0,1], B[0,2])
  //   xmm7  = (A[1,0],A[1,0]) * xmm8 = (A[1,0]*B[0,1], A[1,0]*B[0,2]) @0xaf511..0xaf516
  //   xmm8  = movupd +0x20(rsi) = (B[1,1], B[1,2])                    @0xaf51b
  //   xmm9  = (A[1,1],A[1,1]) * xmm8 = (A[1,1]*B[1,1], A[1,1]*B[1,2]) @0xaf521..0xaf527
  //   xmm9 += xmm7                                                    @0xaf52c
  //   xmm7  = movupd +0x38(rsi) = (B[2,1], B[2,2])                    @0xaf531
  //   xmm8  = (A[1,2],A[1,2]) * xmm7 = (A[1,2]*B[2,1], A[1,2]*B[2,2]) @0xaf536..0xaf53c
  //   xmm8 += xmm9 = (C[1,1], C[1,2])                                 @0xaf541
  const c11 = a12 * b21 + (a11 * b11 + a10 * b01);
  const c12 = a12 * b22 + (a11 * b12 + a10 * b02);

  // ---- Stores (in disasm order) @0xaf546..@0xaf556 -------------------------
  c[8] = c22;   // +0x40(rdx)  @0xaf546  (scalar movsd)
  c[0] = c00;   // +0x00(rdx)  @0xaf54b  (packed movupd, low lane)
  c[1] = c01;   // +0x08(rdx)  @0xaf54b  (packed movupd, high lane)
  c[2] = c02;   // +0x10(rdx)  @0xaf550  (packed movupd, low lane)
  c[3] = c10;   // +0x18(rdx)  @0xaf550  (packed movupd, high lane)
  c[4] = c11;   // +0x20(rdx)  @0xaf556  (packed movupd, low lane)
  c[5] = c12;   // +0x28(rdx)  @0xaf556  (packed movupd, high lane)

  // ---- (e) C[2,0], C[2,1] @0xaf55c..0xaf578 --------------------------------
  //   xmm2 = (A[2,0],A[2,0]) * xmm6 = (A[2,0]*B[0,0], A[2,0]*B[0,1])  @0xaf55c..0xaf560
  //   xmm1 = (A[2,1],A[2,1]) * xmm4 = (A[2,1]*B[1,0], A[2,1]*B[1,1])  @0xaf564..0xaf568
  //   xmm1 += xmm2                                                    @0xaf56c
  //   xmm0 = (A[2,2],A[2,2]) * xmm3 = (A[2,2]*B[2,0], A[2,2]*B[2,1])  @0xaf570..0xaf574
  //   xmm0 += xmm1 = (C[2,0], C[2,1])                                 @0xaf578
  const c20 = a22 * b20 + (a21 * b10 + a20 * b00);
  const c21 = a22 * b21 + (a21 * b11 + a20 * b01);
  c[6] = c20;   // +0x30(rdx)  @0xaf57c  (packed movupd, low lane)
  c[7] = c21;   // +0x38(rdx)  @0xaf57c  (packed movupd, high lane)
  // popq %rbp; retq                                                    @0xaf581..0xaf582
}
