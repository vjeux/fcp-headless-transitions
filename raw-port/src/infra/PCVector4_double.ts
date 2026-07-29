/**
 * PCVector4<double> — ProChannel's 4-component double-precision vector.
 * Faithful transcription of the x86_64 slice at
 *   /Applications/Final Cut Pro.app/Contents/Frameworks/
 *      ProChannel.framework/Versions/A/ProChannel
 *
 * ONLY method on the ledger for this class:
 *
 *   __ZN9PCVector4IdE5scaleEd  PCVector4<double>::scale(double)   @0x7e754
 *
 * ============================================================================
 * MEMORY LAYOUT (recovered from scale @0x7e754; movupd (%rdi), %xmm2 loads
 * the first two doubles as a packed pair and movupd 0x10(%rdi), %xmm1 the
 * second two — so the four components live contiguously at +0x00..+0x1f):
 * ============================================================================
 *
 *   sizeof(PCVector4<double>) >= 32 bytes  (4 doubles, x/y/z/w contiguous):
 *
 *     +---------+---------+---------+---------+
 *     | 0x00  x | 0x08  y | 0x10  z | 0x18  w |
 *     +---------+---------+---------+---------+
 *
 * We model the state as a length-4 `Float64Array` so `v[0..3]` map 1:1 to
 * the byte offsets 0x00/0x08/0x10/0x18 loaded by the disassembly.
 *
 * NOTE ON PRECISION: every arithmetic op in scale() is full IEEE-754 f64
 * (movupd/mulpd/haddpd/addsd/sqrtsd/divsd/mulpd) — no cvtsd2ss anywhere,
 * so plain JS `number` == the machine's f64 and no Math.fround is needed.
 */

/**
 * PCVector4<double>::scale(double s)   @ProChannel 0x7e754
 *   __ZN9PCVector4IdE5scaleEd
 *
 * In-place: if the vector is non-zero, rescale it to have length `s`
 * (i.e. multiply every component by `s / length`). Exact-zero vectors are
 * left untouched. NaN sum-of-squares falls through to the sqrt/div path
 * (which produces NaN components) — matching the binary literally.
 *
 * Disassembly (raw-port/re/disasm/ProChannel.PCVector4<double>.scale.s):
 *
 *   0x7e758  movupd  (%rdi), %xmm2          ; xmm2 = [x, y]
 *   0x7e75c  movupd  0x10(%rdi), %xmm1      ; xmm1 = [z, w]
 *   0x7e761  movapd  %xmm2, %xmm4
 *   0x7e765  mulpd   %xmm2, %xmm4           ; xmm4 = [x*x, y*y]
 *   0x7e769  haddpd  %xmm4, %xmm4           ; xmm4 = [x*x+y*y, x*x+y*y]
 *   0x7e76d  movapd  %xmm1, %xmm3
 *   0x7e771  mulpd   %xmm1, %xmm3           ; xmm3 = [z*z, w*w]
 *   0x7e775  addsd   %xmm3, %xmm4           ; xmm4[0] += z*z  -> x*x+y*y+z*z
 *   0x7e779  unpckhpd %xmm3, %xmm3          ; xmm3 = [w*w, w*w]
 *   0x7e77d  addsd   %xmm4, %xmm3           ; xmm3[0] = x*x+y*y+z*z+w*w = sumSq
 *   0x7e781  xorpd   %xmm4, %xmm4           ; xmm4 = 0
 *   0x7e785  ucomisd %xmm4, %xmm3           ; flags = (sumSq - 0)  [dst-src]
 *   0x7e789  jne     0x7e78d                ; sumSq != 0 (or NaN) -> scale
 *   0x7e78b  jnp     0x7e7aa                ; sumSq == 0 AND ordered -> return
 *   0x7e78d  sqrtsd  %xmm3, %xmm3           ; xmm3 = sqrt(sumSq) = length
 *   0x7e791  divsd   %xmm3, %xmm0           ; xmm0 = s / length   (arg was s)
 *   0x7e795  movddup %xmm0, %xmm0           ; xmm0 = [k, k], k = s/length
 *   0x7e799  mulpd   %xmm0, %xmm2           ; [x*k, y*k]
 *   0x7e79d  movupd  %xmm2, (%rdi)
 *   0x7e7a1  mulpd   %xmm0, %xmm1           ; [z*k, w*k]
 *   0x7e7a5  movupd  %xmm1, 0x10(%rdi)
 *   0x7e7aa  retq
 *
 * Zero-guard truth table (per ANTI_SHORTCUT.md Rule 4; ucomisd %src,%dst
 * sets flags on dst - src; NaN operand sets ZF=1, PF=1, CF=1):
 *   sumSq == 0 (ordered)  -> ZF=1, PF=0  -> jne NOT taken, jnp taken  -> RETURN
 *   sumSq  > 0 (ordered)  -> ZF=0, PF=0  -> jne taken                 -> SCALE
 *   sumSq  == NaN         -> ZF=1, PF=1  -> jne NOT taken, jnp NOT    -> SCALE
 *                                                                        (NaN out)
 * We reproduce this literally: only the exact-zero, ordered case skips the
 * scaling; every other case runs the sqrt/div/mul chain.
 */
export function PCVector4_double_scale(
  v: Float64Array, // this: PCVector4<double>*  (rdi; 4 doubles at +0x00..+0x18)
  s: number,       // xmm0 (double)
): void {
  // @0x7e758..0x7e77d — sum of squares, four doubles.
  const x = v[0]; // +0x00
  const y = v[1]; // +0x08
  const z = v[2]; // +0x10
  const w = v[3]; // +0x18
  const sumSq = x * x + y * y + z * z + w * w;

  // @0x7e781..0x7e78b — the zero-guard. Only "sumSq === 0 AND !isNaN(sumSq)"
  // skips the update; NaN falls through, exactly like the binary.
  // (JS `sumSq !== 0` is true for NaN, so the conjunction below matches the
  // jne/jnp pair: take the scaling path unless sumSq is a real, ordered 0.)
  if (sumSq === 0 && !Number.isNaN(sumSq)) {
    return;
  }

  // @0x7e78d..0x7e7a5 — normalize-and-scale in place.
  const length = Math.sqrt(sumSq); // sqrtsd
  const k = s / length;            // divsd  (xmm0 = s / length)
  v[0] = x * k;                    // mulpd + movupd  (+0x00)
  v[1] = y * k;                    //                  (+0x08)
  v[2] = z * k;                    //                  (+0x10)
  v[3] = w * k;                    //                  (+0x18)
}
