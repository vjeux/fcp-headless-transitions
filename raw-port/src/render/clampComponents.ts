// clampComponents.ts — ProCore anonymous-namespace helper:
//   (anonymous namespace)::clampComponents(numPixels, float* data,
//                                          componentsPerPixel,
//                                          PCColorUtil::AlphaFormat fmt)
//
// Symbol: __ZL15clampComponentsmPfmN11PCColorUtil11AlphaFormatE   @ProCore 0x11381
// The leading `_ZL` (vs `_Z`) marks internal-linkage static — a translation-unit-
// local free function inside ProCore's PCColorUtil pixel-transform layer.
//
// ROLE. Clamps every non-alpha float32 pixel component of `data` into [0.0f, 1.0f],
// leaving the alpha component (when present) untouched. Used by the top-level
// PCColorUtil::transform(...) family that produces linear-light output ready for
// display and needs each colour channel bounded before quantisation.
//
// SIGNATURE (SysV x86_64):
//   rdi = numPixels                              (size_t)
//   rsi = data                                   (float*)
//   rdx = componentsPerPixel                     (size_t)   e.g. 3 for RGB, 4 for RGBA
//   ecx = fmt (PCColorUtil::AlphaFormat)         (int / enum, 4 discriminants observed)
//
// AlphaFormat discriminant table recovered from the four branches in the disasm:
//   fmt == 0   → NoAlpha         @0x11387 je 0x113f3 — flat loop over numPixels*componentsPerPixel
//                                (clamps EVERY float32, no channel skipped).
//   fmt == 1   → AlphaFirst      @0x1139f cmpl $0x1 ; @0x113a2 sete %r8b — base advanced by
//                                one float (skip channel 0 = alpha), rax = componentsPerPixel-1
//                                (clamps N-1 channels starting at data+1).
//   fmt == 2   → AlphaLast       fmt < 3 → sbb $0,%rax makes rax = componentsPerPixel-1;
//                                r8 stays 0 → base = data (start at channel 0); clamps N-1
//                                channels starting at data (skipping the LAST = alpha).
//   fmt >= 3   → FullPixel/other fmt >= 3 → sbb leaves rax = componentsPerPixel; r8=0 →
//                                clamps EVERY channel (same effective payload as fmt==0 but
//                                travelled through the two-level nested-loop path).
//
// DISASM — raw-port/re/disasm/ProCore.__ZL15clampComponentsmPfmN11PCColorUtil11AlphaFormatE.s
// @ProCore 0x11381 (49 real instructions after prologue, transcribed 1:1 below):
//
//   0x11381  pushq %rbp
//   0x11382  movq  %rsp, %rbp
//   0x11385  testl %ecx, %ecx                    ; fmt == 0?
//   0x11387  je    0x113f3                       ;   yes → FLAT loop
//   0x11389  cmpl  $0x3, %ecx                    ; set CF iff fmt < 3 (unsigned)
//   0x1138c  movq  %rdx, %rax                    ; rax = componentsPerPixel
//   0x1138f  sbbq  $0x0, %rax                    ; rax = componentsPerPixel - CF
//                                                ;   fmt < 3 → rax = N-1 (skip alpha)
//                                                ;   fmt ≥ 3 → rax = N   (clamp all)
//   0x11393  testq %rdi, %rdi                    ; numPixels == 0?
//   0x11396  je    0x1142a                       ;   yes → return
//   0x1139c  xorl  %r8d, %r8d                    ; r8 = 0
//   0x1139f  cmpl  $0x1, %ecx                    ; fmt == 1?
//   0x113a2  sete  %r8b                          ; r8 = (fmt == 1) ? 1 : 0
//   0x113a6  leaq  (%rsi,%r8,4), %rcx            ; base = data + r8*4 (skip alpha-first)
//   0x113aa  shlq  $0x2, %rdx                    ; rdx = componentsPerPixel * 4 (stride bytes)
//   0x113ae  xorl  %esi, %esi                    ; outer i (pixel) = 0
//   0x113b0  movss  0xd0bb8(%rip), %xmm0         ; xmm0 lane0 = 1.0f      @ProCore 0xe1f70
//   0x113b8  xorps %xmm1, %xmm1                  ; xmm1 lane0 = 0.0f
//   0x113bb  testq %rax, %rax                    ; components-to-clamp == 0? (e.g. N=1 & fmt<3)
//   0x113be  je    0x113e6                       ;   yes → skip inner loop, advance pixel
//   0x113c0  xorl  %r8d, %r8d                    ; inner j (channel) = 0
//   0x113c3  movss (%rcx,%r8,4), %xmm2           ; xmm2 = base[j]                     (top of inner loop)
//   0x113c9  movaps %xmm0, %xmm3                 ; xmm3 = 1.0f
//   0x113cc  minss %xmm2, %xmm3                  ; xmm3 = min(1.0, xmm2)      (AT&T: min(dst,src))
//   0x113d0  cmpltss %xmm1, %xmm2                ; xmm2 lane0 = (xmm2 < 0.0) ? all-1s : 0
//   0x113d5  andnps %xmm3, %xmm2                 ; xmm2 = ~xmm2 & xmm3
//                                                ;   xmm2 < 0 → mask=1s → ~mask=0 → 0
//                                                ;   xmm2 ≥ 0 → mask=0  → ~mask=1s → xmm3 = min(1,x)
//   0x113d8  movss %xmm2, (%rcx,%r8,4)           ; base[j] = clamped
//   0x113de  incq  %r8                           ; ++j
//   0x113e1  cmpq  %r8, %rax
//   0x113e4  jne   0x113c3                       ; while (j != rax) loop
//   0x113e6  incq  %rsi                          ; ++i
//   0x113e9  addq  %rdx, %rcx                    ; base += componentsPerPixel*4 (next pixel)
//   0x113ec  cmpq  %rdi, %rsi
//   0x113ef  jne   0x113bb                       ; while (i != numPixels)
//   0x113f1  jmp   0x1142a                       ; return
//
//   ─── flat-loop path (fmt == 0) ─────────────────────────────────────────
//   0x113f3  imulq %rdi, %rdx                    ; total = numPixels * componentsPerPixel
//   0x113f7  testq %rdx, %rdx
//   0x113fa  je    0x1142a                       ; total == 0 → return
//   0x113fc  xorl  %eax, %eax                    ; k = 0
//   0x113fe  movss  0xd0b6a(%rip), %xmm0         ; xmm0 lane0 = 1.0f      @ProCore 0xe1f70 (same)
//   0x11406  xorps %xmm1, %xmm1                  ; xmm1 lane0 = 0.0f
//   0x11409  movss (%rsi,%rax,4), %xmm2          ; xmm2 = data[k]
//   0x1140e  movaps %xmm0, %xmm3                 ; xmm3 = 1.0f
//   0x11411  minss %xmm2, %xmm3                  ; xmm3 = min(1.0, xmm2)
//   0x11415  cmpltss %xmm1, %xmm2                ; xmm2 = (xmm2 < 0.0) ? all-1s : 0
//   0x1141a  andnps %xmm3, %xmm2                 ; xmm2 = ~xmm2 & xmm3
//   0x1141d  movss %xmm2, (%rsi,%rax,4)          ; data[k] = clamped
//   0x11422  incq  %rax
//   0x11425  cmpq  %rax, %rdx
//   0x11428  jne   0x11409                       ; while (k != total)
//   0x1142a  popq  %rbp; retq
//
// The inner-loop clamp expression is identical in both paths:
//
//     clamped(x) = (x < 0.0f) ? 0.0f : min(1.0f, x)
//
// with the intel `minss` NaN semantic: `minss(1.0, NaN)` returns the second source
// operand (NaN), so NaN inputs propagate to NaN outputs — matching the binary bit-for-bit.
// The `cmpltss` guard against negatives uses ORDERED-less-than: a NaN input yields
// mask=0 (false), so the `andnps` result is `min(1, NaN) = NaN`. Zero and denormals
// pass through unchanged.
//
// CONSTANTS (both cite the same __TEXT __const address, chosen freshly per path):
//   @ProCore 0xe1f70  float32 1.0f  (u32 0x3f800000)  — decoded and cited by
//                                                       raw-port/src/render/PCColorUtil.ts
//                                                       (cc_matrix::identity @0x4a12 uses the
//                                                        same VA) and PCICCTransferFunctionLUT.ts.
//
// DEPS: none in-scope. No callees.

/**
 * PCColorUtil::AlphaFormat enum discriminants used by `clampComponents`. The
 * concrete enum-name -> value mapping is not part of THIS function's decode
 * (only the four branch discriminants are observable); the meaningful bit is
 * how each value steers the two loop-shapes.
 *
 *   NoAlpha    = 0   — flat single loop over `numPixels * componentsPerPixel`.
 *   AlphaFirst = 1   — nested loop, base skips the first component, clamps N-1.
 *   AlphaLast  = 2   — nested loop, base=data, clamps first N-1 components.
 *   FullPixel  ≥ 3   — nested loop, base=data, clamps ALL N components (same
 *                      per-channel work as NoAlpha, just travelled through the
 *                      nested path — the split appears in the disasm).
 */
export const enum PCColorUtil_AlphaFormat {
  NoAlpha = 0,
  AlphaFirst = 1,
  AlphaLast = 2,
  FullPixel = 3,
}

/**
 * `_ZL15clampComponentsmPfmN11PCColorUtil11AlphaFormatE`   @ProCore 0x11381
 *
 * Clamps each non-alpha float32 component of `data` into [0.0f, 1.0f]. Alpha
 * is left untouched when `fmt` is AlphaFirst / AlphaLast. NoAlpha and FullPixel
 * clamp every channel. NaN propagates (matches x86 `minss` NaN semantic).
 *
 * @param numPixels           number of pixels (outer loop trip count, rdi).
 * @param data                pointer to the pixel array (rsi). Modelled as
 *                            `Float32Array` — matches the exact float32 SIMD
 *                            precision the binary uses (movss/minss are single-
 *                            precision throughout; there is no double lift).
 * @param componentsPerPixel  channels per pixel (rdx). e.g. 3=RGB, 4=RGBA.
 * @param fmt                 AlphaFormat discriminant (ecx).
 */
export function clampComponents(
  numPixels: number,
  data: Float32Array,
  componentsPerPixel: number,
  fmt: PCColorUtil_AlphaFormat
): void {
  // @0x11385  testl %ecx, %ecx  ;  je 0x113f3   — fmt == 0 → flat path.
  if ((fmt | 0) === 0) {
    // Flat-loop path @0x113f3..0x11428.
    // @0x113f3  imulq %rdi, %rdx     ; total = numPixels * componentsPerPixel
    const total = (numPixels >>> 0) * (componentsPerPixel >>> 0);
    // @0x113f7  testq %rdx, %rdx ; je 0x1142a  — total == 0 → return
    if (total === 0) return;
    for (let k = 0; k < total; k = (k + 1) | 0) {
      // @0x11409  xmm2 = data[k]
      const x = Math.fround(data[k]);
      // @0x1140e  xmm3 = 1.0
      // @0x11411  minss  xmm2, xmm3   ; xmm3 = min(1.0, x)
      const capped = Math.fround(Math.min(1.0, x));
      // @0x11415  cmpltss xmm1(0.0), xmm2   ; mask = (x < 0.0) ? all-1s : 0
      // @0x1141a  andnps xmm3, xmm2          ; xmm2 = ~mask & capped
      //   x < 0 → 0.0f ; x ≥ 0 → capped ; NaN → capped (mask=0) → NaN propagates.
      const clamped = (x < 0.0) ? Math.fround(0.0) : capped;
      // @0x1141d  movss %xmm2, (%rsi,%rax,4)
      data[k] = clamped;
    }
    // @0x1142a  return
    return;
  }

  // fmt != 0 → nested-loop path @0x11389..0x113ef.
  //
  // @0x11389  cmpl $0x3, %ecx        ; CF = (fmt < 3)
  // @0x1138c  movq %rdx, %rax        ; rax = componentsPerPixel
  // @0x1138f  sbbq $0x0, %rax        ; rax -= CF
  //   fmt < 3 → rax = componentsPerPixel - 1   (skip one alpha channel)
  //   fmt ≥ 3 → rax = componentsPerPixel        (clamp every channel)
  const componentsToClamp =
    ((fmt | 0) < 3)
      ? ((componentsPerPixel - 1) | 0)
      : (componentsPerPixel | 0);

  // @0x11393  testq %rdi, %rdi ; je 0x1142a   — numPixels == 0 → return
  if ((numPixels | 0) === 0) return;

  // @0x1139f  cmpl $0x1, %ecx  ;  @0x113a2  sete %r8b   — r8 = (fmt == 1) ? 1 : 0
  // @0x113a6  leaq (%rsi,%r8,4), %rcx   — base = data + r8*4 (skip alpha-first channel)
  let base = ((fmt | 0) === 1) ? 1 : 0;

  // Constants match the disasm: 1.0f @ProCore 0xe1f70 (upper bound) and 0.0f (xorps).
  const ONE  = Math.fround(1.0);
  const ZERO = Math.fround(0.0);

  // @0x113b8..0x113ef  outer i-loop over pixels, inner j-loop over componentsToClamp.
  for (let i = 0; i < (numPixels | 0); i = (i + 1) | 0) {
    // @0x113bb  testq %rax, %rax ; je 0x113e6  — inner loop skipped when componentsToClamp==0.
    if (componentsToClamp !== 0) {
      for (let j = 0; j < componentsToClamp; j = (j + 1) | 0) {
        // @0x113c3  xmm2 = base[j]
        const x = Math.fround(data[base + j]);
        // @0x113c9  xmm3 = 1.0f
        // @0x113cc  minss xmm2, xmm3          ; capped = min(1.0, x)
        const capped = Math.fround(Math.min(ONE, x));
        // @0x113d0  cmpltss xmm1(0.0), xmm2   ; mask = (x < 0.0) ? all-1s : 0
        // @0x113d5  andnps  xmm3, xmm2        ; xmm2 = ~mask & capped
        const clamped = (x < ZERO) ? ZERO : capped;
        // @0x113d8  movss %xmm2, (%rcx,%r8,4)
        data[base + j] = clamped;
      }
    }
    // @0x113e9  addq %rdx, %rcx   — base += componentsPerPixel   (stride is *4 bytes = 1 float)
    base = (base + (componentsPerPixel | 0)) | 0;
  }
  // @0x1142a  return
}
