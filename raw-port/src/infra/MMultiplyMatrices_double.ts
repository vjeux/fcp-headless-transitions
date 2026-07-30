// MMultiplyMatrices<double> — generic-stride dense matrix multiply
//
//   void MMultiplyMatrices<double>(int M, int K, int N,
//                                  double const* A, int Ars, int Acs,
//                                  double const* B, int Brs, int Bcs,
//                                  double*       C, int Crs, int Ccs);
//
//   Computes C = A * B where A is M×K, B is K×N, C is M×N, with element
//   addressing:  A[i,k] = A[i*Ars + k*Acs],  B[k,j] = B[k*Brs + j*Bcs],
//                C[i,j] = C[i*Crs + j*Ccs].
//
// Provenance: /Applications/Final Cut Pro.app/Contents/Frameworks/
//             Ozone.framework/Versions/A/Ozone (x86_64 slice, unadjusted VAs).
//   symbol:   __Z17MMultiplyMatricesIdEviiiPKT_iiS2_iiPS0_ii
//   entry:    0x88ce0
//   epilogue: 0x898de
//   disasm:   raw-port/re/disasm/__Z17MMultiplyMatricesIdEviiiPKT_iiS2_iiPS0_ii.s
//
// -----------------------------------------------------------------------------
// DISPATCH STRUCTURE (recovered from the disasm)
// -----------------------------------------------------------------------------
// The compiler emits an early trivial-guard, then a 2-bit dispatch on the two
// K-adjacent strides (Acs and Brs), yielding four full copies of the inner
// M×N×K loop each specialised for a particular vectorisation opportunity:
//
//   @0x88cf1   testl %edi,%edi ; jle 0x898de     // M <= 0 → return
//   @0x88cf9   testl %edx,%edx ; jle 0x898de     // N <= 0 → return
//   @0x88d20   cmpl  $0x1,%r9d ; jne 0x88ec4     // Acs != 1  → cases C/D
//   @0x88d2a   cmpl  $0x1,%ebx ; jne 0x8905e     // Brs != 1  → case  B
//   -- CASE A: Acs==1 && Brs==1 --                                @0x88d33
//   -- CASE B: Acs==1 && Brs!=1 --                                @0x8905e
//   @0x88ec7   cmpl  $0x1,%ebx ; jne 0x891df     // Brs != 1  → case  D
//   -- CASE C: Acs!=1 && Brs==1 --                                @0x88ed0
//   -- CASE D: Acs!=1 && Brs!=1 --                                @0x891df
//
// EACH case begins with `testl %esi,%esi ; jle <zero_fill>` — that is, K<=0
// jumps to a dedicated zero-fill block (@0x89354, 0x894be, 0x8961e, 0x8977e
// respectively). All four zero-fill blocks are STRUCTURALLY IDENTICAL: they
// write 0.0 into every C[i,j] using an inner-N unroll (Ccs==1 SIMD store fast
// path, else scalar Ccs stride) — and produce the same result as C = A(M×0) *
// B(0×N) = 0. This function is IDEMPOTENT across dispatch: all four M×N×K
// bodies compute the same mathematical result
//
//   C[i,j] = sum_{k=0..K-1} A[i,k] * B[k,j]
//
// using left-to-right sequential floating-point accumulation of the K terms
// (this order is visible in every case: `xorpd %xmm0,%xmm0` initialises the
// accumulator, then a 4×-unrolled `movsd; mulsd; addsd` chain runs in order
// k=0..K-1 with a `K%4` scalar tail — see e.g. @0x88e00..0x88e1a, 0x88fd0..
// 0x88ffe, 0x89160..0x8919c, 0x892f0..0x89308).
//
// Because all four bodies produce bit-identical results (same K-order,
// same doubles arithmetic — no reassociation, no FMA), we port the semantic
// with the four-way dispatch preserved (so control flow diffs the disasm)
// and each case delegating to a shared inner accumulator that mirrors the
// unrolled `xmm0 += A[i,k]*B[k,j]` chain.
//
// -----------------------------------------------------------------------------
// ARG REGISTER MAP (SysV x86_64, entry frame)
// -----------------------------------------------------------------------------
//   %edi     M                       (arg1, 32-bit)
//   %esi     K                       (arg2, 32-bit)  — inner sum dim
//   %edx     N                       (arg3, 32-bit)
//   %rcx     A base pointer           (arg4, saved to  -0x38(%rbp) @0x88ced)
//   %r8d     Ars   (A row stride)     (arg5, copied to %ecx        @0x88d01)
//   %r9d     Acs   (A col stride)     (arg6)
//   0x10(%rbp)  B base pointer        (arg7)
//   0x18(%rbp)  Brs   (B row stride)  (arg8,  -> %ebx  @0x88d17)
//   0x20(%rbp)  Bcs   (B col stride)  (arg9,  -> %r10d @0x88d13)
//   0x28(%rbp)  C base pointer        (arg10, -> %r10  @0x88d0b,
//                                              saved to -0x50(%rbp))
//   0x30(%rbp)  Crs   (C row stride)  (arg11, -> %eax  @0x88d08)
//   0x38(%rbp)  Ccs   (C col stride)  (arg12, -> %r8d  @0x88d04)
//
// -----------------------------------------------------------------------------
// NUMERICS
// -----------------------------------------------------------------------------
// Every fp op in the disasm is `movsd/mulsd/addsd/xorpd/movupd` — SCALAR OR
// PACKED DOUBLE (never single). No Math.fround is needed. Sums accumulate
// left-to-right in K order across all 4 dispatch bodies.
// -----------------------------------------------------------------------------

/**
 * MMultiplyMatrices<double> @Ozone 0x88ce0
 *   __Z17MMultiplyMatricesIdEviiiPKT_iiS2_iiPS0_ii
 *
 * Faithful port of the four-way stride-dispatched dense GEMM in Ozone.
 * Result: C[i,j] = sum_{k=0..K-1} A[i*Ars + k*Acs] * B[k*Brs + j*Bcs],
 * written into C[i*Crs + j*Ccs].
 *
 * Trivial guards (@0x88cf1, @0x88cf9): if M<=0 or N<=0 return immediately.
 * If K<=0, C is zero-filled over M×N via the case's dedicated zero-fill
 * block (@0x89354 for AA, @0x894be for AC, @0x8961e for CA, @0x8977e for CC).
 */
export function MMultiplyMatrices_double(
  M: number,
  K: number,
  N: number,
  A: Float64Array,
  Aoff: number,
  Ars: number,
  Acs: number,
  B: Float64Array,
  Boff: number,
  Brs: number,
  Bcs: number,
  C: Float64Array,
  Coff: number,
  Crs: number,
  Ccs: number,
): void {
  // Prologue trivial guards @0x88cf1..0x88cfb — bail before any dispatch.
  if (M <= 0) return; // @0x88cf1  testl %edi,%edi ; jle 0x898de
  if (N <= 0) return; // @0x88cf9  testl %edx,%edx ; jle 0x898de

  // Four-way dispatch on (Acs==1, Brs==1) — @0x88d20 and @0x88d2a / @0x88ec7.
  // Semantically these four branches all compute the same C. We preserve the
  // dispatch shape for reviewer diffability, but delegate the K==0 fast-path
  // and the M×N×K body to shared helpers whose numerics match every case.
  const acsIsOne = (Acs === 1); // @0x88d20  cmpl $1,%r9d ; jne 0x88ec4
  const brsIsOne = (Brs === 1); // @0x88d2a / @0x88ec7  cmpl $1,%ebx ; jne ...

  if (acsIsOne && brsIsOne) {
    // -- CASE A @0x88d33 --  Acs==1 && Brs==1
    if (K <= 0) {
      // @0x88d35  testl %esi,%esi ; je 0x89354  → zero-fill block @0x89354
      __zeroFillMxN(M, N, C, Coff, Crs, Ccs);
      return;
    }
    __mmulBody(M, K, N, A, Aoff, Ars, Acs, B, Boff, Brs, Bcs, C, Coff, Crs, Ccs);
    return;
  }

  if (acsIsOne && !brsIsOne) {
    // -- CASE B @0x8905e --  Acs==1 && Brs!=1
    if (K <= 0) {
      // @0x89060  testl %esi,%esi ; jle 0x8961e  → zero-fill block @0x8961e
      __zeroFillMxN(M, N, C, Coff, Crs, Ccs);
      return;
    }
    __mmulBody(M, K, N, A, Aoff, Ars, Acs, B, Boff, Brs, Bcs, C, Coff, Crs, Ccs);
    return;
  }

  if (!acsIsOne && brsIsOne) {
    // -- CASE C @0x88ed0 --  Acs!=1 && Brs==1
    if (K <= 0) {
      // @0x88ed2  testl %esi,%esi ; jle 0x894be  → zero-fill block @0x894be
      __zeroFillMxN(M, N, C, Coff, Crs, Ccs);
      return;
    }
    __mmulBody(M, K, N, A, Aoff, Ars, Acs, B, Boff, Brs, Bcs, C, Coff, Crs, Ccs);
    return;
  }

  // -- CASE D @0x891df --  Acs!=1 && Brs!=1
  if (K <= 0) {
    // @0x891e1  testl %esi,%esi ; jle 0x8977e  → zero-fill block @0x8977e
    __zeroFillMxN(M, N, C, Coff, Crs, Ccs);
    return;
  }
  __mmulBody(M, K, N, A, Aoff, Ars, Acs, B, Boff, Brs, Bcs, C, Coff, Crs, Ccs);
}

/**
 * __zeroFillMxN @Ozone (shared model of blocks @0x89354, 0x894be, 0x8961e, 0x8977e)
 *
 * K<=0 fast path: writes 0.0 into every C[i,j] over the M×N grid at
 * C[i*Crs + j*Ccs]. The disasm at @0x89354.. shows a Ccs==1 SIMD fast path
 * (movupd xmm0=0 with 4-double stride @0x89400/0x89407) and a Ccs!=1 scalar
 * path (movq $0,(%rdi) @0x89440). Both zero the same M×N cells; we port the
 * observable value semantic.
 */
function __zeroFillMxN(
  M: number,
  N: number,
  C: Float64Array,
  Coff: number,
  Crs: number,
  Ccs: number,
): void {
  // @0x89354..  outer over i∈[0,M) — `cmpq -0x38(%rbp),%r15 ; je 0x898de`
  // @0x89400..  inner over j∈[0,N) — `cmpq %rdi,%rdx ; jne 0x89400`
  for (let i = 0; i < M; i++) {
    const rowBase = Coff + i * Crs;
    for (let j = 0; j < N; j++) {
      C[rowBase + j * Ccs] = 0.0; // movsd xmm0=+0.0 -> C[i,j]
    }
  }
}

/**
 * __mmulBody @Ozone (shared model of dispatch bodies @0x88d33, 0x8905e, 0x88ed0, 0x891df)
 *
 * K>0 body: C[i,j] = sum_k A[i,k]*B[k,j] with i∈[0,M), j∈[0,N), k∈[0,K).
 *
 * Each dispatch-case body is a 4×-unrolled K-loop with a K%4 scalar tail.
 * The accumulator lives in %xmm0, zeroed via `xorpd %xmm0,%xmm0` at the
 * top of each column, and the partial products are chained left-to-right:
 *
 *   @0x88fd0  movsd  (%r14),   %xmm1                       // A[i,k+0]
 *   @0x88fd5  mulsd  (%r8),    %xmm1                       // * B[k+0,j]
 *   @0x88fda  addsd  %xmm0,    %xmm1                       // + acc
 *   @0x88fde  movsd  (%r14,%r9,8), %xmm0                   // A[i,k+1]
 *   @0x88fe4  mulsd  0x8(%r8), %xmm0                       // * B[k+1,j]
 *   @0x88fea  addsd  %xmm1,    %xmm0                       // + partial
 *   ...  (k+2, k+3 similarly)
 *   tail @0x89040   movsd..mulsd..addsd  for k = 4·q..K-1
 *
 * Rebuilding the same K-left-to-right serial fp accumulation here yields
 * BIT-IDENTICAL results to any of the 4 unrolled cases (no reassociation,
 * scalar doubles only — no FMA in the disasm).
 */
function __mmulBody(
  M: number,
  K: number,
  N: number,
  A: Float64Array,
  Aoff: number,
  Ars: number,
  Acs: number,
  B: Float64Array,
  Boff: number,
  Brs: number,
  Bcs: number,
  C: Float64Array,
  Coff: number,
  Crs: number,
  Ccs: number,
): void {
  // Outer over i @0x88d95: `imulq -0x58(%rbp),%rax` computes i*Ars,
  // `movq -0x38(%rbp),%rcx` reloads A base, `leaq (%rcx,%rax,8),%rax`
  // forms &A[i*Ars] (byte offset ×8 = sizeof(double)).
  for (let i = 0; i < M; i++) {
    const aRowBase = Aoff + i * Ars;
    const cRowBase = Coff + i * Crs;
    // Inner over j @0x88de7: `xorpd %xmm0,%xmm0` @0x88ded, then 4×-unroll
    // path @0x88e00 (if K>=4) plus scalar tail @0x88dd0 (K%4 remainder).
    for (let j = 0; j < N; j++) {
      let acc = 0.0; // xorpd %xmm0,%xmm0
      const bColBase = Boff + j * Bcs;
      // K-loop, left-to-right: acc += A[i,k]*B[k,j]  for k=0..K-1.
      // The 4×-unroll of the binary is a scheduling detail; the fp result
      // for scalar doubles is invariant under this unroll (no FMA, no
      // reassociation — every addsd feeds the next addsd's source).
      for (let k = 0; k < K; k++) {
        acc += A[aRowBase + k * Acs] * B[bColBase + k * Brs];
      }
      // @0x88f88 / equivalents: `movsd %xmm0, (%rdi,%r8,8)` — store C[i,j].
      C[cRowBase + j * Ccs] = acc;
    }
  }
}
