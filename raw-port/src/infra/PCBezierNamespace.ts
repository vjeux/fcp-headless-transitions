// PCBezierNamespace — ProCore.framework. The Bezier utility namespace.
// One method transcribed here:
//   @ProCore 0x2b3bc  PCBezierNamespace::Bezier_binomial(int n, int k)
//
// Source disassembly: raw-port/re/disasm/ProCore.PCBezierNamespace.Bezier_binomial.s
//
// Decoded RIP-relative data references (all resolved via resolve.py const):
//   @ProCore 0x122568   double 2.0                              (loop denominator start)
//   @ProCore 0x122530   double 1.0                              (denominator increment)
//   @ProCore 0xe2070    double -0.0  (u64=0x8000000000000000)   (sign-mask for rounding)
//   @ProCore 0x123920   double 0.49999999999999994              (half-minus-1ulp bias)
//   @ProCore 0x1239a0   int32_t ChooseTable[6][6]               (Pascal\'s triangle rows 0..5)
//     ChooseTable read directly from the ProCore x86_64 slice
//     (file offset 0x4000 + section-relative 0x1279a0):
//       n=0: [1, 0, 0, 0, 0, 0]
//       n=1: [1, 1, 0, 0, 0, 0]
//       n=2: [1, 2, 1, 0, 0, 0]
//       n=3: [1, 3, 3, 1, 0, 0]
//       n=4: [1, 4, 6, 4, 1, 0]
//       n=5: [1, 5, 10, 10, 5, 1]
//
// The function computes the binomial coefficient C(n, k) with three regimes:
//   1. n < k  or  k < 0            -> return 0            (2b3bc..2b3ca)
//   2. n < 6                       -> ChooseTable[n][k]   (2b3d0..2b3d3, 2b467..2b47b)
//   3. n >= 6, k == 0 or n == k    -> return 1            (2b3d9..2b3ec)
//   4. n >= 6, general case        -> multiplicative form with the smaller of {k, n-k}
//                                     accumulating in double and rounded to int.
//
// The multiplicative core mirrors the disasm loop exactly:
//   m = min(k, n - k)                             // 2b3f2..2b3fb  (cmovbel picks min)
//   acc = double(n - m + 1)                       // 2b3fd..2b401
//   for (i = 2; i <= m; ++i) acc *= double(n - m + i) / double(i)   // 2b41f..2b43a
//
// The final round-to-int uses SSE sign-bit manipulation (2b440..2b465):
//   sign  = acc & -0.0                                // extract sign bit only
//   bias  = sign | 0.49999999999999994                // +/-(0.5 - 1 ulp)
//   rounded = roundsd(mode 0xb /* trunc toward zero */, acc + bias)
//   return (int32_t)cvttsd2si(rounded)
//
// Doubles are IEEE-754 in both C++ and JS, so the arithmetic transcribes 1:1.

// --- ChooseTable read from ProCore @0x1239a0 (Pascal\'s triangle 6x6) -----------
const CHOOSE_TABLE: readonly (readonly number[])[] = [
  [1, 0,  0,  0, 0, 0],
  [1, 1,  0,  0, 0, 0],
  [1, 2,  1,  0, 0, 0],
  [1, 3,  3,  1, 0, 0],
  [1, 4,  6,  4, 1, 0],
  [1, 5, 10, 10, 5, 1],
] as const;

/**
 * PCBezierNamespace::Bezier_binomial(int n, int k) -> int
 * @ProCore 0x2b3bc  (symbol __ZN17PCBezierNamespace15Bezier_binomialEii)
 *
 * Returns the binomial coefficient C(n, k). For n < 6 the value is served
 * from the on-disk ChooseTable at @ProCore 0x1239a0; for n >= 6 the value
 * is computed by the multiplicative loop that mirrors 0x2b3f2..0x2b466
 * line-for-line.
 */
export function Bezier_binomial(n: number, k: number): number {
  // --- 0x2b3bc..0x2b3ca -------------------------------------------------
  //   cmpl %esi,%edi ; setl %cl        cl = (n < k)
  //   testl %esi,%esi ; sets %dl       dl = (k < 0)
  //   xorl %eax,%eax                   eax = 0
  //   orb  %cl,%dl                     dl |= cl
  //   jne  0x2b47e                     if (n < k || k < 0) return 0
  if (n < k || k < 0) {
    return 0;
  }

  // --- 0x2b3d0..0x2b3d3 -------------------------------------------------
  //   cmpl $0x6,%edi ; jl 0x2b467      if (n < 6) goto ChooseTable
  if (n < 6) {
    // --- 0x2b467..0x2b47b (lookup branch) --------------------------------
    //   movslq %edi,%rax                 rax = (int64)n
    //   movl   %esi,%ecx                 ecx = k
    //   leaq   (%rax,%rax,2),%rax        rax = 3*n
    //   leaq   ChooseTable(%rip),%rdx
    //   leaq   (%rdx,%rax,8),%rax        &ChooseTable[n]   (row stride = 24 = 3*8)
    //   movl   (%rax,%rcx,4),%eax        eax = ChooseTable[n][k]  (col stride = 4)
    return CHOOSE_TABLE[n][k];
  }

  // --- 0x2b3d9..0x2b3ec -------------------------------------------------
  //   movl  %edi,%ecx                  ecx = n
  //   subl  %esi,%ecx                  ecx = n - k
  //   sete  %al                        al = (n - k == 0)
  //   testl %esi,%esi ; sete %dl       dl = (k == 0)
  //   orb   %al,%dl                    dl |= al
  //   movl  $0x1,%eax                  eax = 1
  //   jne   0x2b47e                    if (n == k || k == 0) return 1
  //
  // ecx already holds (n - k) at this point.
  let ecx = n - k;
  if (n === k || k === 0) {
    return 1;
  }

  // --- 0x2b3f2..0x2b3fb -------------------------------------------------
  //   movl   %edi,%eax                 eax = n
  //   shrl   %eax                      eax = n >>> 1
  //   cmpl   %eax,%esi                 (k vs n/2)
  //   cmovbel %esi,%ecx                if (k <= n/2) ecx = k
  //
  // Net effect: ecx = min(k, n - k) — smaller side of the symmetry.
  const half = n >>> 1;
  if (k <= half) {
    ecx = k;
  }
  const m = ecx; // m = min(k, n - k), m >= 1 here.

  // --- 0x2b3fb..0x2b401 -------------------------------------------------
  //   movl    %edi,%eax                eax = n
  //   subl    %ecx,%eax                eax = n - m
  //   incl    %eax                     eax = n - m + 1
  //   cvtsi2sd %eax,%xmm0              xmm0 = (double)(n - m + 1)
  let acc: number = n - m + 1;

  // --- 0x2b405..0x2b43a — multiplicative loop --------------------------
  //   cmpl  $0x2,%ecx ; jb 0x2b43c     if (m < 2) skip loop
  //   negl  %ecx                       ecx = -m
  //   addl  $0x2,%edi                  edi = n + 2
  //   movsd 0xf7151(%rip),%xmm1        xmm1 = 2.0        (@0x122568)
  //   movsd 0xf7111(%rip),%xmm2        xmm2 = 1.0        (@0x122530)
  // loop:
  //   leal   (%rdi,%rcx),%eax          eax = (n+2) + ecx
  //   xorps  %xmm3,%xmm3
  //   cvtsi2sd %eax,%xmm3              xmm3 = (double)eax
  //   divsd  %xmm1,%xmm3               xmm3 /= xmm1
  //   mulsd  %xmm3,%xmm0               xmm0 *= xmm3
  //   addsd  %xmm2,%xmm1               xmm1 += 1.0
  //   incl   %ecx                      ++ecx
  //   cmpl   $-0x1,%ecx ; jne loop     until ecx == -1
  if (m >= 2) {
    let denom: number = 2.0;             // xmm1  @0x122568
    const one: number = 1.0;             // xmm2  @0x122530
    const nPlus2 = n + 2;                // edi after addl $2
    let ic = -m;                         // ecx after negl
    while (ic !== -1) {
      const numerInt = nPlus2 + ic;      // eax = leal (rdi,rcx)
      const numerD = numerInt;           // cvtsi2sd
      const ratio = numerD / denom;      // divsd
      acc = acc * ratio;                 // mulsd
      denom = denom + one;               // addsd
      ic = ic + 1;                       // incl ecx
    }
  }

  // --- 0x2b43c..0x2b466 — round-away-from-zero then trunc -----------
  //   movapd 0xb6c28(%rip),%xmm1       xmm1 = -0.0            (@0xe2070)
  //   andpd  %xmm0,%xmm1               xmm1 = sign_bit(acc)
  //   orpd   0xf84cc(%rip),%xmm1       xmm1 = sign(acc) | 0.49999999999999994  (@0x123920)
  //   addsd  %xmm0,%xmm1               xmm1 = acc + copysign(0.4999...998, acc)
  //   xorps  %xmm0,%xmm0
  //   roundsd $0xb,%xmm1,%xmm0         xmm0 = trunc-toward-zero(xmm1)
  //   cvttsd2si %xmm0,%eax             eax = (int32_t)xmm0
  const HALF_MINUS_ULP = 0.49999999999999994; // @0x123920
  // andpd/orpd bit combine: sign(acc) | HALF-eps.
  // For acc >= 0 (sign bit 0) -> +HALF-eps ; for acc < 0 -> -HALF-eps.
  // Note: JS -0 vs +0 — Math.sign(-0)===-0, but we replicate the sign-bit
  // extraction with a signed-zero-safe check that matches x86 andpd exactly.
  const signBitSet = acc < 0 || Object.is(acc, -0);
  const bias = signBitSet ? -HALF_MINUS_ULP : HALF_MINUS_ULP;
  const biased = acc + bias;
  // roundsd mode 0xb = round toward zero (truncation).
  const truncated = biased >= 0 ? Math.floor(biased) : Math.ceil(biased);
  // cvttsd2si into a 32-bit register. C(n,k) fits int32 for all n < 34.
  return truncated | 0;
}
