// raw-port/src/render/HGDecimationImplementation.ts
//
// FCP `HGDecimationImplementation` — Helium namespace-like class holding a
// single pure-math routine, `ComputeDecimation`, used by the Helium down-
// sampling / decimation pipeline to decide how many "×2" (× 4 in pixel-
// count) decimation steps to apply to an image so that the final sample
// footprint (squared) fits into a caller-provided budget.
//
// FRAMEWORK: Helium.framework  (fat sub-slice x86_64)
// DECODE:    raw-port/re/disasm/Helium.HGDecimationImplementation.ComputeDecimation.s
//
// SYMBOLS (nm -a Helium):
//   __ZN26HGDecimationImplementation17ComputeDecimationEfffbPfPiPbS2_
//     -> HGDecimationImplementation::ComputeDecimation(
//            float, float, float, bool, float*, int*, bool*, bool*)
//        @Helium 0x1eecb0
//   __ZN26HGDecimationImplementationD1Ev / D0Ev  (trivial dtors @0x1f1730 / 0x1f1780)
//
// The method takes no `this`-state (the class is a stateless namespace
// functor: the disasm never touches %rdi as a pointer, only as arg#3).
// It is faithfully modeled as a static method.
//
// ── RIP-RELATIVE FLOAT CONSTANTS ────────────────────────────────────────
//
// The routine reads TWO distinct 4-byte constants from Helium __TEXT/__const,
// each referenced from three call sites (compiler-shared literal pool):
//
//   @Helium 0x3c7cc0  float 1.0f  (u32 0x3f800000)
//     — loaded at 0x1eecee (loop-A init xmm5),
//                0x1eed38 (no-loop tail: xmm5=1),
//                0x1eed9b (loop-B init xmm5).
//   @Helium 0x3ca2ec  float 4.0f  (u32 0x40800000)
//     — loaded at 0x1eecf6 (loop-A growth xmm6),
//                0x1eeda3 (loop-B growth xmm0).
//     [Not referenced from the no-loop tail; xmm5=1.0 already fixes scale=1.]
//
// (Verified byte-for-byte from /tmp/Helium.x86_64 at file-offset == VA
// since these are __const RIP-relative reads inside the thinned x86_64
// slice, and there is no LC_SEGMENT slide between VA and file-offset for
// this section — the resolve helper reads them as 1.0 and 4.0.)
//
// ── ARGUMENT REGISTER LAYOUT (System V AMD64) ───────────────────────────
//
//   xmm0 = dv           (float)  a "distance" the routine wants to fit
//   xmm1 = destWidth    (float)  the "step-width" (per-decimation size)
//   xmm2 = srcWidth     (float)  a scalar (NOT squared on entry) — the
//                                 caller-side "clamp" width; xmm2*xmm2
//                                 becomes B² later
//   edi  = flag         (bool)   selects the two loop variants
//   rsi  = &outResultA  (float*) width-output slot
//   rdx  = &outIters    (int*)   iteration-count slot (0 in the no-loop
//                                 fall-through; else eax = final iter+1)
//   rcx  = &outFlagA    (bool*)  boolean set by `setae` on the tail
//                                 ucomiss(B², d²/scale) — true if the
//                                 remainder d²/scale is ≥ B²
//   r8   = &outFlagB    (bool*)  boolean set by `seta` on the tail
//                                 ucomiss(0, xmm3_post_blend) — true if
//                                 the (possibly-blended) remainder is > 0
//
// Semantics (mirrors the exact branch structure of the disasm):
//
//   A² = destWidth * destWidth            (xmm1 *= xmm1  @0x1eecb7)
//   d² = dv * dv                          (xmm3 = xmm0; xmm3 *= xmm0 @0x1eecbb)
//   B² = srcWidth * srcWidth              (xmm4 = xmm2; xmm4 *= xmm2 @0x1eecda)
//   cap = flag ? max(0, A² - srcWidth) : A²
//       (@0x1eecc2..0x1eecd4 — the max/xor/subtract picks either the
//        clamped or the plain destWidth² as the "first-step ceiling",
//        depending on the flag)
//
//   if d² <= cap  (@0x1eecde ucomiss + @0x1eece1 jbe):
//     — the no-loop fall-through: scale = 1.0f, iters = 0.
//   else if flag:            (@0x1eece3 testb + @0x1eece6 je -> loop-B)
//     — loop-A (uses "cap" as the first prev value):
//         scale = 1.0f
//         growth = 4.0f
//         iter = 0
//         prev = max(0, A² - srcWidth)      (== cap on the first entry)
//         do:
//           d²    -= prev
//           iter  += 1
//           scale *= growth                  ;; grows 4, 16, 64, ...
//           prev   = max(0, A²*scale - srcWidth)
//           if d² <= prev: break
//         while iter < 15
//   else:                    (loop-B — the "flag == false" flavor)
//     — loop-B (uses A²*scale directly, no `- srcWidth`):
//         scale = 1.0f
//         growth = 4.0f
//         iter = 0
//         do:
//           d²    -= scale * A²
//           iter  += 1
//           scale *= growth
//           if d² <= A²*scale: break
//         while iter < 15
//
//   ── common tail @0x1eed42 ─────────────────────────────────────────
//   xmm1 = d²/scale
//   xmm6 = d² - B²*scale
//   mask = (B² <= d²/scale)           (@0x1eed5a cmpless xmm1,xmm0=B²)
//   d²   = mask ? (d² - B²*scale) : d²    (@0x1eed5f blendvps)
//   if d² > 0:
//     xmm5 = sqrt(d²/scale)
//     result = min(srcWidth, sqrt(d²/scale))
//   else:
//     result = d²                     (feeds xmm6 through unchanged)
//
//   *outResultA = result              (@0x1eed87)
//   *outIters   = iter+1  or  0 for the no-loop tail  (@0x1eed8b)
//   *outFlagA   = (d²/scale >= B²)                    (@0x1eed8d setae)
//   *outFlagB   = (d²_post_blend > 0)                 (@0x1eed93 seta)
//
// NOTE — semantic naming: the routine has "A²/B²" and "step scale"
// characteristics of a downsampling planner (each ×2 spatial decimation
// multiplies pixel-area by 4 and increases the effective per-sample
// footprint accordingly). The `flag` chooses between two accounting
// modes; both are transcribed verbatim above.
//
// ── FLOAT SINGLE-PRECISION FIDELITY ─────────────────────────────────────
// Every operation in the disasm is `mulss/subss/divss/sqrtss/maxss/minss`
// (single-precision). We wrap every intermediate in `Math.fround` to
// match the machine's numerics per PORTING_SPEC.md Rule 4.
//
// ── FRONTIER STUBS ──────────────────────────────────────────────────────
// None — the routine is pure math with no external calls. All 5 movss
// literal loads resolve to the two constants documented above.

/**
 * `HGDecimationImplementation` — stateless Helium namespace holding one
 * pure-math static routine (`ComputeDecimation`) plus a trivial dtor pair.
 */
export class HGDecimationImplementation {
  /**
   * `HGDecimationImplementation::ComputeDecimation(float dv, float destWidth,
   *   float srcWidth, bool flag, float* outResultA, int* outIterations,
   *   bool* outFlagA, bool* outFlagB)` @Helium 0x1eecb0.
   *
   * TS mirror returns the four output slots as an object rather than
   * writing through pointers; caller adapts.
   *
   * DISASM (raw-port/re/disasm/Helium.HGDecimationImplementation.ComputeDecimation.s):
   *
   *   0x1eecb0  pushq %rbp / movq %rsp, %rbp
   *   0x1eecb4  movaps %xmm0, %xmm3             ; xmm3 = dv
   *   0x1eecb7  mulss  %xmm1, %xmm1             ; xmm1 = A² = destWidth²
   *   0x1eecbb  mulss  %xmm0, %xmm3             ; xmm3 = d² = dv²
   *   0x1eecbf  movaps %xmm1, %xmm0             ; xmm0 = A²
   *   0x1eecc2  subss  %xmm2, %xmm0             ; xmm0 = A² - srcWidth
   *   0x1eecc6  xorps  %xmm4, %xmm4             ; xmm4 = 0
   *   0x1eecc9  maxss  %xmm4, %xmm0             ; xmm0 = max(0, A² - srcWidth)
   *   0x1eeccd  movaps %xmm0, %xmm5             ; xmm5 = xmm0  (default cap)
   *   0x1eecd0  testl  %edi, %edi
   *   0x1eecd2  jne    0x1eecd7                 ; if flag==0, xmm5 = A²
   *   0x1eecd4  movaps %xmm1, %xmm5
   *   0x1eecd7  movaps %xmm2, %xmm4             ; xmm4 = srcWidth
   *   0x1eecda  mulss  %xmm2, %xmm4             ; xmm4 = B² = srcWidth²
   *   0x1eecde  ucomiss %xmm5, %xmm3
   *   0x1eece1  jbe    0x1eed38                 ; if d² <= cap -> no-loop tail
   *   0x1eece3  testb  %dil, %dil
   *   0x1eece6  je     0x1eed99                 ; flag==0 -> loop-B
   *
   *   ;; ── loop-A (flag != 0) ─────────────────────────
   *   0x1eecec  xorl   %edi, %edi               ; iter = 0
   *   0x1eecee  movss  0x1d8fca(%rip), %xmm5    ; xmm5 = 1.0f  @Helium 0x3c7cc0
   *   0x1eecf6  movss  0x1db5ee(%rip), %xmm6    ; xmm6 = 4.0f  @Helium 0x3ca2ec
   *   0x1eecfe  xorps  %xmm7, %xmm7             ; xmm7 = 0
   *   0x1eed10  subss  %xmm0, %xmm3             ; d² -= prev_cap
   *   0x1eed14  leal   0x1(%rdi), %eax          ; eax = iter+1
   *   0x1eed17  mulss  %xmm6, %xmm5             ; scale *= 4
   *   0x1eed1b  movaps %xmm1, %xmm0             ; xmm0 = A²
   *   0x1eed1e  mulss  %xmm5, %xmm0             ; xmm0 = A² * scale
   *   0x1eed22  subss  %xmm2, %xmm0             ; xmm0 = A²*scale - srcWidth
   *   0x1eed26  maxss  %xmm7, %xmm0             ; xmm0 = max(0, ...)
   *   0x1eed2a  ucomiss %xmm0, %xmm3
   *   0x1eed2d  jbe    0x1eed42                 ; if d² <= xmm0 -> tail
   *   0x1eed2f  cmpl   $0xe, %edi               ; iter < 14 ?
   *   0x1eed32  movl   %eax, %edi
   *   0x1eed34  jb     0x1eed10
   *   0x1eed36  jmp    0x1eed42
   *
   *   ;; ── no-loop tail (d² was already <= cap) ───────
   *   0x1eed38  movss  0x1d8f80(%rip), %xmm5    ; xmm5 = 1.0f  @Helium 0x3c7cc0
   *   0x1eed40  xorl   %eax, %eax               ; iter = 0
   *
   *   ;; ── common tail ────────────────────────────────
   *   0x1eed42  movaps %xmm3, %xmm1             ; xmm1 = d²
   *   0x1eed45  divss  %xmm5, %xmm1             ; xmm1 = d²/scale
   *   0x1eed49  movaps %xmm4, %xmm0             ; xmm0 = B²
   *   0x1eed4c  mulss  %xmm5, %xmm0             ; xmm0 = B²*scale
   *   0x1eed50  movaps %xmm3, %xmm6             ; xmm6 = d²
   *   0x1eed53  subss  %xmm0, %xmm6             ; xmm6 = d² - B²*scale
   *   0x1eed57  movaps %xmm4, %xmm0             ; xmm0 = B²
   *   0x1eed5a  cmpless %xmm1, %xmm0            ; xmm0 = (B² <= d²/scale) ? mask : 0
   *   0x1eed5f  blendvps %xmm0, %xmm6, %xmm3    ; xmm3 = mask ? xmm6 : xmm3
   *   0x1eed64  xorps  %xmm0, %xmm0
   *   0x1eed67  ucomiss %xmm0, %xmm3
   *   0x1eed6a  movaps %xmm3, %xmm6             ; xmm6 = xmm3 (default result)
   *   0x1eed6d  jbe    0x1eed84                 ; if xmm3 <= 0 skip sqrt
   *   0x1eed6f  movaps %xmm3, %xmm6
   *   0x1eed72  divss  %xmm5, %xmm6             ; xmm6 = xmm3 / scale
   *   0x1eed76  xorps  %xmm5, %xmm5
   *   0x1eed79  sqrtss %xmm6, %xmm5             ; xmm5 = sqrt(xmm6)
   *   0x1eed7d  minss  %xmm5, %xmm2             ; xmm2 = min(srcWidth, xmm5)
   *   0x1eed81  movaps %xmm2, %xmm6
   *   0x1eed84  ucomiss %xmm4, %xmm1            ; sets flags for setae below
   *   0x1eed87  movss   %xmm6, (%rsi)           ; *outResultA = xmm6
   *   0x1eed8b  movl    %eax, (%rdx)            ; *outIters   = eax
   *   0x1eed8d  setae   (%rcx)                  ; *outFlagA   = (d²/scale >= B²)
   *   0x1eed90  ucomiss %xmm0, %xmm3
   *   0x1eed93  seta    (%r8)                   ; *outFlagB   = (xmm3 > 0)
   *   0x1eed97  popq %rbp / retq
   *
   *   ;; ── loop-B (flag == 0) ─────────────────────────
   *   0x1eed99  xorl   %edi, %edi
   *   0x1eed9b  movss  0x1d8f1d(%rip), %xmm5    ; xmm5 = 1.0f  @Helium 0x3c7cc0
   *   0x1eeda3  movss  0x1db541(%rip), %xmm0    ; xmm0 = 4.0f  @Helium 0x3ca2ec
   *   0x1eedb0  movaps %xmm5, %xmm6             ; xmm6 = scale
   *   0x1eedb3  mulss  %xmm1, %xmm6             ; xmm6 = scale * A²
   *   0x1eedb7  subss  %xmm6, %xmm3             ; d² -= scale*A²
   *   0x1eedbb  leal   0x1(%rdi), %eax
   *   0x1eedbe  mulss  %xmm0, %xmm5             ; scale *= 4
   *   0x1eedc2  movaps %xmm1, %xmm6             ; xmm6 = A²
   *   0x1eedc5  mulss  %xmm5, %xmm6             ; xmm6 = A² * scale (next)
   *   0x1eedc9  ucomiss %xmm6, %xmm3
   *   0x1eedcc  jbe    0x1eed42
   *   0x1eedd2  cmpl   $0xe, %edi
   *   0x1eedd5  movl   %eax, %edi
   *   0x1eedd7  jb     0x1eedb0
   *   0x1eedd9  jmp    0x1eed42
   *
   * MICRO-CHECK (derived from disasm, cited in the commit message):
   *   ComputeDecimation(2.0, 1.0, 0.5, false, ...):
   *     A²=1, d²=4, B²=0.25, cap=A²=1 (flag==0 branch)
   *     d²=4 > cap=1 -> loop-B
   *       iter 0: d² -= 1*1 = 3; scale=4; next A²*scale=4; 3 <= 4 -> break, eax=1
   *     tail: xmm1 = 3/4 = 0.75; xmm6 = 3 - 0.25*4 = 2.0
   *       mask = (B²=0.25 <= 0.75) = true -> xmm3 = xmm6 = 2.0
   *       xmm3 > 0 -> xmm5 = sqrt(2/4) = sqrt(0.5) ≈ 0.7071
   *       result = min(0.5, 0.7071) = 0.5
   *     *outResultA = 0.5, *outIters = 1,
   *     *outFlagA = (0.75 >= 0.25) = true,
   *     *outFlagB = (2.0 > 0) = true
   */
  static ComputeDecimation(
    dv: number,
    destWidth: number,
    srcWidth: number,
    flag: boolean,
  ): {
    resultA: number;
    iterations: number;
    flagA: boolean;
    flagB: boolean;
  } {
    const fr = Math.fround;

    // @0x1eecb4 movaps: xmm3 = dv (kept as reference; we'll compute d² next).
    // @0x1eecb7 mulss: xmm1 = destWidth * destWidth
    const A2 = fr(fr(destWidth) * fr(destWidth));
    // @0x1eecbb mulss: xmm3 = dv * dv
    let d2 = fr(fr(dv) * fr(dv));
    // @0x1eecc2 subss + @0x1eecc9 maxss(0, .): xmm0 = max(0, A² - srcWidth)
    const clampedCap = fr(Math.max(0, fr(A2 - fr(srcWidth))));
    // @0x1eeccd movaps: xmm5 = clampedCap (the "flag != 0" cap value)
    // @0x1eecd0 testl edi,edi; @0x1eecd2 jne skip; @0x1eecd4 movaps xmm1,xmm5
    //   -> if flag==false, xmm5 = A²; if flag==true, xmm5 stays clampedCap
    let cap = flag ? clampedCap : A2;
    // @0x1eecda mulss: xmm4 = srcWidth * srcWidth
    const B2 = fr(fr(srcWidth) * fr(srcWidth));

    // @0x1eecde ucomiss xmm5,xmm3; @0x1eece1 jbe (d² <= cap): fall to no-loop tail
    let scale: number;
    let iter: number;
    // NOTE: On loop-A entry (flag==true), the loop-body's initial `d² -= prev`
    // uses the CURRENT value of xmm0, which is the *unclamped* max(0, A² -
    // srcWidth) — i.e. `clampedCap` — regardless of what xmm5 became on the
    // flag branch. This is why loop-A and loop-B have different "prev-value"
    // subtraction lines.
    if (fr(d2) <= fr(cap)) {
      // @0x1eed38..0x1eed40 — no-loop tail
      scale = fr(1.0); // movss @Helium 0x3c7cc0 = 1.0f
      iter = 0;
    } else if (flag) {
      // ── loop-A ──
      // @0x1eecec/0x1eecee/0x1eecf6/0x1eecfe: iter=0, scale=1.0f, growth=4.0f, 0 in xmm7
      let s = fr(1.0); // xmm5 (movss 0x3c7cc0 = 1.0f)
      const growth = fr(4.0); // xmm6 (movss 0x3ca2ec = 4.0f)
      let prev = clampedCap; // xmm0 on entry = max(0, A² - srcWidth)
      let i = 0;
      // do { ... } while (i < 14)
      while (true) {
        d2 = fr(d2 - prev); // @0x1eed10 subss %xmm0,%xmm3
        const nextIter = i + 1; // @0x1eed14 leal 0x1(%rdi),%eax
        s = fr(s * growth); // @0x1eed17 mulss %xmm6,%xmm5
        const newPrev = fr(Math.max(0, fr(fr(A2 * s) - fr(srcWidth))));
        // @0x1eed2a ucomiss %xmm0,%xmm3; @0x1eed2d jbe tail
        if (fr(d2) <= fr(newPrev)) {
          iter = nextIter;
          scale = s;
          break;
        }
        // @0x1eed2f cmpl $0xe,%edi; @0x1eed32 movl %eax,%edi; @0x1eed34 jb loop
        if (i >= 14) {
          // Fall through with edi=eax (13->14 iteration case): the machine
          // jumps to tail via the jmp at 0x1eed36 after the loop-back is
          // rejected. Match: iter=eax (nextIter), scale=s.
          iter = nextIter;
          scale = s;
          break;
        }
        i = nextIter;
        prev = newPrev;
      }
    } else {
      // ── loop-B (flag == false) ──
      // @0x1eed99/0x1eed9b/0x1eeda3: iter=0, scale=1.0f, growth=4.0f
      let s = fr(1.0); // xmm5 (movss 0x3c7cc0 = 1.0f)
      const growth = fr(4.0); // xmm0 (movss 0x3ca2ec = 4.0f)
      let i = 0;
      while (true) {
        // @0x1eedb0 movaps xmm5,xmm6; @0x1eedb3 mulss xmm1,xmm6 -> xmm6 = scale * A²
        const stepDrop = fr(s * A2);
        d2 = fr(d2 - stepDrop); // @0x1eedb7 subss %xmm6,%xmm3
        const nextIter = i + 1; // @0x1eedbb leal 0x1(%rdi),%eax
        s = fr(s * growth); // @0x1eedbe mulss %xmm0,%xmm5
        const nextThreshold = fr(A2 * s); // @0x1eedc2/0x1eedc5 xmm6 = A² * scale (next)
        // @0x1eedc9 ucomiss %xmm6,%xmm3; @0x1eedcc jbe tail
        if (fr(d2) <= fr(nextThreshold)) {
          iter = nextIter;
          scale = s;
          break;
        }
        // @0x1eedd2 cmpl $0xe,%edi; @0x1eedd5 movl %eax,%edi; @0x1eedd7 jb loop
        if (i >= 14) {
          iter = nextIter;
          scale = s;
          break;
        }
        i = nextIter;
      }
    }

    // ── common tail @0x1eed42 ──────────────────────────
    // @0x1eed42/0x1eed45: xmm1 = d²/scale
    const d2OverScale = fr(d2 / scale);
    // @0x1eed4c: xmm0 = B²*scale
    const B2Scale = fr(B2 * scale);
    // @0x1eed53: xmm6 = d² - B²*scale
    const alt = fr(d2 - B2Scale);
    // @0x1eed5a cmpless %xmm1,%xmm0=B²: mask = (B² <= d²/scale)
    const mask = fr(B2) <= fr(d2OverScale);
    // @0x1eed5f blendvps: xmm3 = mask ? xmm6 : xmm3
    let xmm3Post = mask ? alt : d2;

    // @0x1eed64/0x1eed67 ucomiss 0,xmm3; @0x1eed6d jbe skip_sqrt
    // xmm6 default = xmm3 (post-blend)
    let result = xmm3Post;
    if (fr(xmm3Post) > 0) {
      // @0x1eed72 divss xmm5,xmm6; @0x1eed79 sqrtss xmm6,xmm5
      const xmm5Sqrt = fr(Math.sqrt(fr(xmm3Post / scale)));
      // @0x1eed7d minss xmm5,xmm2; @0x1eed81 movaps xmm2,xmm6
      result = fr(Math.min(fr(srcWidth), xmm5Sqrt));
    }
    // NOTE: If the branch above was skipped (xmm3<=0), the machine
    // ucomisses with xmm5 STILL equal to `scale` (not 0), because the
    // sqrt path is what would clobber xmm5 to 0. The setae at 0x1eed8d
    // uses xmm4/xmm1 comparison from 0x1eed84 (which is d²/scale vs B²).
    // xmm5 does NOT feed the flag outputs — only xmm4/xmm1 and xmm0/xmm3.

    // @0x1eed84 ucomiss %xmm4,%xmm1; @0x1eed8d setae (%rcx)
    //   flagA = (xmm1 >= xmm4) = (d²/scale >= B²)
    const flagA = fr(d2OverScale) >= fr(B2);
    // @0x1eed90 ucomiss %xmm0,%xmm3; @0x1eed93 seta (%r8)
    //   flagB = (xmm3_post_blend > 0)
    const flagB = fr(xmm3Post) > 0;

    return {
      resultA: fr(result),
      iterations: iter,
      flagA,
      flagB,
    };
  }
}
