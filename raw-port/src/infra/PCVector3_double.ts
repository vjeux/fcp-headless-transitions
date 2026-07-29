/**
 * PCVector3<double> — ProCore's 3-component double-precision vector.
 * Faithful transcription of the x86_64 slice at
 *   /Applications/Final Cut Pro.app/Contents/Frameworks/
 *      ProCore.framework/Versions/A/ProCore
 *
 * This unit ports ONLY the `normalize(double)` method at @0x19998. Other
 * methods on this class (ctor/scale/dot/cross/...) are separate ledger
 * entries and are OUT OF SCOPE for this file (they will be added here
 * as they are claimed, per the "one class per file" rule).
 *
 * ============================================================================
 * MEMORY LAYOUT (recovered from normalize @0x19998; `movupd (%rdi), %xmm1`
 * loads the first two doubles as a packed pair @0x1999c, `movsd 0x10(%rdi),
 * %xmm2` @0x199ac loads the third — so the three components live
 * contiguously at +0x00, +0x08, +0x10):
 * ============================================================================
 *
 *   sizeof(PCVector3<double>) >= 24 bytes  (3 doubles, x/y/z contiguous):
 *
 *     +---------+---------+---------+
 *     | 0x00  x | 0x08  y | 0x10  z |
 *     +---------+---------+---------+
 *
 * We model the state as a length-3 `Float64Array` so `v[0..2]` map 1:1 to
 * the byte offsets 0x00/0x08/0x10 loaded by the disassembly.
 *
 * NOTE ON PRECISION: every arithmetic op in normalize() is full IEEE-754
 * f64 (movupd/mulpd/haddpd/mulsd/addsd/sqrtsd/divpd/divsd/xorpd/cmpnltsd)
 * — no cvtsd2ss anywhere, so plain JS `number` == the machine's f64 and
 * no Math.fround is needed.
 */

// ============================================================================
// Symbols ported here (mangled → address)
// ============================================================================
//   * __ZN9PCVector3IdE9normalizeEd
//       — PCVector3<double>::normalize(double) @ProCore 0x19998
//
// ============================================================================
// FULL DISASM (raw-port/re/disasm/ProCore.__ZN9PCVector3IdE9normalizeEd.s)
// ============================================================================
//   0x19998  pushq   %rbp                          ; prologue
//   0x19999  movq    %rsp, %rbp
//   0x1999c  movupd  (%rdi), %xmm1                 ; xmm1 = [x, y]
//   0x199a0  movapd  %xmm1, %xmm3
//   0x199a4  mulpd   %xmm1, %xmm3                  ; xmm3 = [x*x, y*y]
//   0x199a8  haddpd  %xmm3, %xmm3                  ; xmm3 = [x*x+y*y, ...]
//   0x199ac  movsd   0x10(%rdi), %xmm2             ; xmm2 = z
//   0x199b1  movapd  %xmm2, %xmm4
//   0x199b5  mulsd   %xmm2, %xmm4                  ; xmm4 = z*z
//   0x199b9  addsd   %xmm3, %xmm4                  ; xmm4 = x*x+y*y+z*z = lenSq
//   0x199bd  xorps   %xmm3, %xmm3                  ; xmm3 = 0
//   0x199c0  sqrtsd  %xmm4, %xmm3                  ; xmm3 = sqrt(lenSq) = len
//   0x199c4  movapd  %xmm3, %xmm4
//   0x199c8  cmpnltsd %xmm0, %xmm4                 ; xmm4 = (xmm4 NOT<  xmm0)
//                                                  ; AT&T src=xmm0=tol,
//                                                  ; dst=xmm4=len
//                                                  ; -> mask (len >= tol)
//   0x199cd  xorpd   0xc869b(%rip), %xmm0          ; xmm0 ^= 0x8000000000000000
//                                                  ; (sign-flip constant @
//                                                  ; ProCore 0xe2070 = the
//                                                  ; 16-byte literal
//                                                  ; 8000000000000000/x2)
//                                                  ; -> xmm0 = -tol
//   0x199d5  cmpnltsd %xmm3, %xmm0                 ; xmm0 = (xmm0 NOT< xmm3)
//                                                  ; AT&T src=xmm3=len,
//                                                  ; dst=xmm0=-tol
//                                                  ; -> mask (-tol >= len)
//                                                  ; == (len <= -tol)
//   0x199da  orpd    %xmm4, %xmm0                  ; xmm0 |= xmm4
//                                                  ; == (len >= tol) OR
//                                                  ;    (len <= -tol)
//                                                  ; == (|len| >= tol)
//   0x199de  movd    %xmm0, %eax                   ; eax = low32 of mask
//                                                  ; (all-1 or all-0)
//   0x199e2  testb   $0x1, %al                     ; test low bit
//   0x199e4  je      0x199fb                       ; if bit==0 (|len|<tol)
//                                                  ;   -> skip normalise
//   0x199e6  movddup %xmm3, %xmm0                  ; xmm0 = [len, len]
//   0x199ea  divpd   %xmm0, %xmm1                  ; xmm1 = [x/len, y/len]
//   0x199ee  movupd  %xmm1, (%rdi)                 ; store x,y
//   0x199f2  divsd   %xmm3, %xmm2                  ; xmm2 = z/len
//   0x199f6  movsd   %xmm2, 0x10(%rdi)             ; store z
//   0x199fb  andb    $0x1, %al                     ; return value: bit 0
//                                                  ; of the |len|>=tol mask
//                                                  ; == 1 if normalised,
//                                                  ; 0 if skipped
//   0x199fd  popq    %rbp
//   0x199fe  retq

/**
 * `PCVector3<double>::normalize(double tolerance)` @ProCore 0x19998
 * (`__ZN9PCVector3IdE9normalizeEd`).
 *
 * In-place: if `|length| >= tolerance` (equivalently `length >= tolerance`
 * OR `length <= -tolerance`), rescale so `length == 1`; return 1. Else
 * leave the vector untouched and return 0. NaN handling follows the
 * `cmpnltsd` semantics literally (see below).
 *
 * The two-sided tolerance check reflects that `sqrtsd` yields a
 * non-negative result on ordered non-negative input, but the NaN-safe
 * `cmpnltsd` mask covers the (len == NaN) case too — a NaN operand
 * makes both cmpnltsd results NOT-less-than-false → 0 mask, so the
 * function returns 0 without dividing. This matches the machine exactly
 * without needing an explicit isNaN check.
 *
 * `cmpnltsd src, dst` (AT&T): dst = (dst NOT-LESS-THAN src) ? all-1 : 0
 *  (unordered → 0). Truth:
 *   - Ordered len > tol      → mask1 = -1n (all-1); return true.
 *   - Ordered len == tol     → mask1 = -1n; return true.
 *   - Ordered len < tol AND
 *     len > -tol             → mask1 = 0, mask2 = 0; OR = 0; return false.
 *   - Ordered len <= -tol    → mask2 = -1n; return true. (impossible
 *     for a sqrtsd output; still cited for faithfulness.)
 *   - Unordered (len==NaN)   → both masks = 0; return false. Vector
 *     retains its NaN components; normalize returns 0.
 *
 * Since `sqrtsd` of a finite non-negative operand is always >= 0, the
 * `len <= -tol` branch is unreachable in practice — but transcribed
 * because the machine writes it.
 */
export function PCVector3_double_normalize(
  v: Float64Array, // this: PCVector3<double>*  (rdi; 3 doubles @ +0x00..+0x10)
  tolerance: number, // xmm0 (double); the arg name in the C++ is the raw scalar
): number { // eax low bit; 1 == normalised, 0 == left untouched
  // @0x1999c..0x199a8 — packed square of (x, y); xmm3.lo = x*x + y*y.
  const x: number = v[0]; // +0x00
  const y: number = v[1]; // +0x08
  // @0x199ac..0x199b9 — scalar square of z; xmm4 = x*x + y*y + z*z.
  const z: number = v[2]; // +0x10
  const lenSq: number = x * x + y * y + z * z;
  // @0x199bd..0x199c0 — xmm3 = sqrt(lenSq) = len.
  const len: number = Math.sqrt(lenSq);
  // @0x199c4..0x199da — build |len| >= tol mask (ordered comparisons).
  //   mask1 = (len >= tolerance)   [cmpnltsd xmm0=tol → dst=xmm4=len]
  //   mask2 = (len <= -tolerance)  [after xorpd flips xmm0 sign,
  //                                cmpnltsd xmm3=len → dst=xmm0=-tol]
  //   mask  = mask1 OR mask2       [orpd]
  //
  // Emulating the AT&T `cmpnltsd`-with-NaN semantics: for NaN inputs
  // both comparisons return false, matching the "return 0, don't
  // divide" behaviour of the binary.
  const mask1: boolean = len >= tolerance; // ordered ≥
  const mask2: boolean = len <= -tolerance; // ordered ≤ negation
  const doNormalise: boolean = mask1 || mask2;
  // @0x199de..0x199e4 — jump over the divide if the mask's low bit is 0.
  if (!doNormalise) {
    // @0x199fb..0x199fe — andb $1,%al; popq; retq. eax low bit is 0.
    return 0;
  }
  // @0x199e6..0x199ea — xmm0 broadcast len; xmm1 = [x/len, y/len].
  // @0x199ee — store x,y back.
  v[0] = x / len; // +0x00
  v[1] = y / len; // +0x08
  // @0x199f2..0x199f6 — xmm2 = z/len; store z.
  v[2] = z / len; // +0x10
  // @0x199fb..0x199fe — andb $1,%al; return 1 (the low bit of the mask,
  // which is all-1 in this branch).
  return 1;
}
