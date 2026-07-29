// raw-port/src/render/HGChromaticAdapter.ts
//
// FCP `HGChromaticAdapter` — a Helium HGNode subclass that implements a
// chromatic adaptation stage: given a target "white" RGB (via SetWhite),
// a D-parameter pair (SetDParams), a scalar D (SetD, clamp[0,1]),
// a scalar A (SetA, clamp[0,1]), a blur param pair (SetBlurParams),
// and a bool computeD (SetComputeD), it emits an adapted image via
// GetOutput.
//
// FRAMEWORK: Helium.framework
// FAT slice offset: 0x4000; thin binary /tmp/Helium.x86_64 has VA == file
// offset (segment __TEXT vmaddr = 0). Constants read via
// `raw-port/army/tools/resolve.py Helium const 0x…`.
//
// DISASSEMBLY:
//   raw-port/re/disasm/Helium.HGChromaticAdapter.HGChromaticAdapter.s  (C1 → tail-jmp C2)
//   raw-port/re/disasm/Helium.HGChromaticAdapter.SetWhite.s
//   raw-port/re/disasm/Helium.HGChromaticAdapter.SetDParams.s
//   raw-port/re/disasm/Helium.HGChromaticAdapter.SetD.s
//   raw-port/re/disasm/Helium.HGChromaticAdapter.SetA.s
//   raw-port/re/disasm/Helium.HGChromaticAdapter.SetComputeD.s
//   raw-port/re/disasm/Helium.HGChromaticAdapter.SetBlurParams.s
//   raw-port/re/disasm/Helium.HGChromaticAdapter.GetOutput.s
//
// SYMBOLS (from `nm -arch x86_64` on Helium):
//   @Helium 0x031dc0  HGChromaticAdapter::HGChromaticAdapter()   [C2] __ZN18HGChromaticAdapterC2Ev
//   @Helium 0x032000  HGChromaticAdapter::HGChromaticAdapter()   [C1 — tail-jmp to C2] __ZN18HGChromaticAdapterC1Ev
//   @Helium 0x032010  HGChromaticAdapter::~HGChromaticAdapter()  [D2] __ZN18HGChromaticAdapterD2Ev
//   @Helium 0x032090  HGChromaticAdapter::~HGChromaticAdapter()  [D1] __ZN18HGChromaticAdapterD1Ev
//   @Helium 0x032110  HGChromaticAdapter::~HGChromaticAdapter()  [D0] __ZN18HGChromaticAdapterD0Ev
//   @Helium 0x032190  HGChromaticAdapter::SetWhite(float, float, float)      __ZN18HGChromaticAdapter8SetWhiteEfff
//   @Helium 0x0322f0  HGChromaticAdapter::SetDParams(float, float)           __ZN18HGChromaticAdapter10SetDParamsEff
//   @Helium 0x032310  HGChromaticAdapter::SetD(float)                        __ZN18HGChromaticAdapter4SetDEf
//   @Helium 0x032340  HGChromaticAdapter::SetA(float)                        __ZN18HGChromaticAdapter4SetAEf
//   @Helium 0x032370  HGChromaticAdapter::SetComputeD(bool)                  __ZN18HGChromaticAdapter11SetComputeDEb
//   @Helium 0x032380  HGChromaticAdapter::SetBlurParams(float, float)        __ZN18HGChromaticAdapter13SetBlurParamsEff
//   @Helium 0x0323a0  HGChromaticAdapter::GetOutput(HGRenderer*)             __ZN18HGChromaticAdapter9GetOutputEP10HGRenderer
//
// STRUCT LAYOUT (recovered from C2 @0x031dc0 + setters):
//   HGChromaticAdapter extends HGNode (base ctor @0x031dce → HGNode::HGNode()
//   at Helium 0x11bcc0). HGNode occupies offsets 0x00..0x197 per
//   raw-port/src/render/HGNode.ts. This subclass adds:
//     +0x198  HGColorMatrix* sRGBtoXYZ_mat            (`new HGObject(0x1f0)` + LoadMatrix(sRGBtoXYZ,false))
//     +0x1a0  (part of tail padding / HGColorMatrix ptr trailer — not written explicitly)
//     +0x1a8  HGBlur*        blur                     (`new HGObject(0x220)` + HGBlur ctor)
//     +0x1b0  HgcChromaticAdapter* hgcAdapter         (`new HGObject(0x1a0)` + HgcChromaticAdapter ctor)
//     +0x1b8  float[2]       whitePointXYZ_xy         (SetWhite: movlps of two lanes)
//     +0x1c0  float          whitePointXYZ_z          (SetWhite: extractps lane 2)
//     +0x1d0  float          dParam0                  (SetDParams)
//     +0x1d4  float          dParam1                  (SetDParams)
//     +0x1d8  float          d                        (SetD, clamped [0,1])
//     +0x1dc  float          a                        (SetA, clamped [0,1])
//     +0x1e0  float          blurParam0               (SetBlurParams)
//     +0x1e4  float          blurParam1               (SetBlurParams)
//     +0x1e8  bool           computeD                 (SetComputeD)
//     +0x1f0  (class total size — matches `nw` 0x1f0 in dependency HGColorMatrix)
//
// CONSTANTS (all cited by rip-target VA read as float32 little-endian from
// __TEXT at the fat-slice-adjusted offset 0x4000 + VA):
//   @Helium 0x3c7cc0 = 1.0f     (SetD/SetA clamp ceiling)
//   @Helium 0x85d400 = HGColorMatrix::sRGBtoXYZ  (4x4 row-major, sRGB(D65) → CIE XYZ)
//   @Helium 0x85d440 = HGColorMatrix::XYZtosRGB  (4x4 row-major, CIE XYZ → sRGB(D65))
//   (The XYZtoCAT/CATtoXYZ matrices are used by the C2 ctor's HGColorMatrix
//    LoadMatrix graph, not by any method transcribed here.)
//
// VTABLE:
//   @Helium 0x031dd3  leaq 0x9d3ce6(%rip),%rax → __TEXT const at 0x9d3ce6+7+0x031dda
//                    = 0xa05ac0 (HGChromaticAdapter vtable base + 0x10 per Itanium ABI).
//   Ctor installs this via `movq %rax,(%rbx)` @0x031dda.

import { HGNode } from "./HGNode";

/**
 * `HGColorMatrix::sRGBtoXYZ` — Helium data global @0x85d400.
 * 4x4 row-major, sRGB (D65) → CIE XYZ. Bytes:
 *   row0 = (0.4124563932, 0.2126729041, 0.01933390088, 0.0)
 *   row1 = (0.3575761020, 0.7151522040, 0.11919199675, 0.0)
 *   row2 = (0.1804375052, 0.0721750036, 0.95030409098, 0.0)
 *   row3 = (0.0        , 0.0        , 0.0          , 1.0)
 * NOTE: this is the layout the SIMD in SetWhite reads: 4 rows (xmm regs)
 * of 4 packed float32.
 */
const sRGBtoXYZ: Float32Array = new Float32Array([
  0.4124563932418823, 0.2126729041337967, 0.01933390088379383, 0.0,   // @Helium 0x85d400
  0.3575761020183563, 0.7151522040367126, 0.11919199675321579, 0.0,   // @Helium 0x85d410
  0.1804375052452087, 0.07217500358819962, 0.9503040909767151, 0.0,   // @Helium 0x85d420
  0.0, 0.0, 0.0, 1.0,                                                  // @Helium 0x85d430
]);

/**
 * `HGColorMatrix::XYZtosRGB` — Helium data global @0x85d440.
 * 4x4 row-major, CIE XYZ → sRGB (D65). Bytes:
 *   row0 = ( 3.2404541969, -0.9692659974,  0.05564339831, 0.0)
 *   row1 = (-1.5371384621,  1.8760107756, -0.20402589440, 0.0)
 *   row2 = (-0.4985314012,  0.04155600071, 1.05722522736, 0.0)
 *   row3 = ( 0.0         ,  0.0         ,  0.0         , 1.0)
 */
const XYZtosRGB: Float32Array = new Float32Array([
   3.2404541969299316, -0.9692659974098206,  0.05564339831471443, 0.0,   // @Helium 0x85d440
  -1.5371384620666504,  1.8760107755661011, -0.20402589440345764, 0.0,   // @Helium 0x85d450
  -0.49853140115737915, 0.041556000709533690, 1.0572252273559570, 0.0,   // @Helium 0x85d460
   0.0, 0.0, 0.0, 1.0,                                                    // @Helium 0x85d470
]);

/**
 * `HGChromaticAdapter` — Helium HGNode subclass @0x031dc0..0x032460.
 *
 * See file header for the full field layout + symbol map.
 */
export class HGChromaticAdapter extends HGNode {
  // --- HGChromaticAdapter fields (offsets in comments, byte-exact) ---
  sRGBtoXYZColorMatrix: unknown | null;   // +0x198 — HGColorMatrix* (see ctor)
  blur: unknown | null;                    // +0x1a8 — HGBlur*
  hgcAdapter: unknown | null;              // +0x1b0 — HgcChromaticAdapter*
  whitePointX: number;                     // +0x1b8, float32 (SetWhite lane 0)
  whitePointY: number;                     // +0x1bc, float32 (SetWhite lane 1)
  whitePointZ: number;                     // +0x1c0, float32 (SetWhite lane 2)
  dParam0: number;                         // +0x1d0, float32
  dParam1: number;                         // +0x1d4, float32
  d: number;                               // +0x1d8, float32 (clamped [0,1])
  a: number;                               // +0x1dc, float32 (clamped [0,1])
  blurParam0: number;                      // +0x1e0, float32
  blurParam1: number;                      // +0x1e4, float32
  computeD: boolean;                       // +0x1e8, byte

  /**
   * `HGChromaticAdapter::HGChromaticAdapter()` — Helium @0x031dc0 (C2). The
   * C1 body @0x032000 is a bare tail-jmp to C2.
   *
   * C2 trace @0x031dce..0x031f??:
   *   0x031dce: callq HGNode::HGNode()             (base ctor)
   *   0x031dd3: install HGChromaticAdapter vtable @0xa05ac0 into (%rbx)
   *   0x031ddd: %edi=$0x1f0; callq HGObject::operator new(unsigned long)
   *   0x031ded: callq HGColorMatrix::HGColorMatrix()   (init child #1)
   *   0x031df2: this[+0x198] = child                    (sRGBtoXYZ matrix)
   *   0x031df9: leaq HGColorMatrix::sRGBtoXYZ
   *   0x031e05: callq HGColorMatrix::LoadMatrix(sRGBtoXYZ, false)
   *   0x031e0a: %edi=$0x1f0; callq operator new
   *   0x031e1a: callq HGColorMatrix::HGColorMatrix()  (init child #2 — temp)
   *   0x031e1f: leaq HGColorMatrix::XYZtoCAT
   *   0x031e2e: callq HGColorMatrix::LoadMatrix(XYZtoCAT,false)
   *   0x031e42: callq *0x78(%rax)                       (temp->SetInput(0, sRGBtoXYZ_child))
   *   0x031e45: %edi=$0x220; callq operator new; callq HGBlur::HGBlur()
   *   0x031e5a: this[+0x1a8] = blur
   *   0x031e6d: callq *0x78(%rax)                       (blur->SetInput(0, temp))
   *   0x031e70: %edi=$0x1a0; callq operator new; callq HgcChromaticAdapter::HgcChromaticAdapter()
   *   0x031e85: this[+0x1b0] = hgcAdapter
   *   0x031e98: callq *0x78(%rax)                       (hgcAdapter->SetInput(0, temp))
   *   0x031eb1: callq *0x78(%rax)                       (hgcAdapter->SetInput(1, blur))
   *   0x031eba: callq *0x18(%rax)                       (temp->Release())
   *   0x031ebd..    : more allocs (CATtoXYZ HGColorMatrix), further wiring...
   *
   * Blocked on: HGColorMatrix (~HGNode subclass, unported), HGBlur (unported),
   * HgcChromaticAdapter (unported, Hgc* facade), HGObject::operator new
   * (allocator plumbing), and the vtable SetInput slot @0x78 on each child.
   * Decode-don't-fit: throw instead of inventing a wiring graph.
   */
  constructor() {
    // @Helium 0x031dce: HGNode::HGNode() — base ctor
    super();
    // @Helium 0x031dd3: overwrite vtable with HGChromaticAdapter vtable @0xa05ac0
    this.vtable = 0xa05ac0;

    // Initialize the direct-field defaults with zeroes to keep types stable
    // BEFORE the deferred-graph throw. The struct-init sequence in C2 sets up
    // the four owned HG* children first; the primitive fields (0x1b8..0x1e8)
    // are only set by their respective Set* methods (or via the tail of C2
    // which zero-clears them via the HGObject::operator new bzero — see the
    // second half of C2 @0x031ee0..). We mirror that zero-init here.
    this.sRGBtoXYZColorMatrix = null;
    this.blur = null;
    this.hgcAdapter = null;
    this.whitePointX = 0.0;
    this.whitePointY = 0.0;
    this.whitePointZ = 0.0;
    this.dParam0 = 0.0;
    this.dParam1 = 0.0;
    this.d = 0.0;
    this.a = 0.0;
    this.blurParam0 = 0.0;
    this.blurParam1 = 0.0;
    this.computeD = false;

    // The HGColorMatrix / HGBlur / HgcChromaticAdapter graph install trailing
    // C2 body (@0x031ddd..0x031fXX) is NOT yet transcribed — it requires:
    //   - HGColorMatrix::HGColorMatrix + ::LoadMatrix   (unported)
    //   - HGBlur::HGBlur                                (unported)
    //   - HgcChromaticAdapter::HgcChromaticAdapter      (unported Hgc* facade)
    //   - The SetInput vtable slot @0x78 (see HGNode::SetInput throw)
    // Faithful transcription defers to a loud throw per PORTING_SPEC.md §Rule 3.
    throw new Error(
      "HGChromaticAdapter::HGChromaticAdapter graph-install trailing body not yet transcribed " +
      "@Helium 0x031ddd (needs HGColorMatrix ctor+LoadMatrix, HGBlur ctor, HgcChromaticAdapter ctor, " +
      "and SetInput vtable slot @0x78 — see HGNode.ts SetInput throw)"
    );
  }

  /**
   * `HGChromaticAdapter::SetWhite(float r, float g, float b)` — Helium @0x032190.
   *
   * Asm (full):
   *   0x032194: leaq  HGColorMatrix::sRGBtoXYZ, %rax
   *   0x03219b: movaps (%rax)   , %xmm9      ; M.row0
   *   0x03219f: movaps 0x10(%rax), %xmm10    ; M.row1
   *   0x0321a4: movaps 0x20(%rax), %xmm7     ; M.row2
   *   0x0321a8: movaps 0x30(%rax), %xmm8     ; M.row3
   *   0x0321ad: leaq  HGColorMatrix::XYZtosRGB, %rax
   *   0x0321b4: movaps (%rax)   , %xmm5      ; N.row0
   *   0x0321b7: movaps 0x10(%rax), %xmm6     ; N.row1
   *   0x0321bb: movaps 0x20(%rax), %xmm3     ; N.row2
   *   0x0321bf: movaps 0x30(%rax), %xmm4     ; N.row3
   *
   *   Compute P = N ⋅ M row-by-row where the input matrix layout is such that
   *   for each row n_i = (n_i0, n_i1, n_i2, n_i3):
   *      P.row_i = n_i0 * M.row0 + n_i1 * M.row1 + n_i2 * M.row2 + n_i3 * M.row3
   *   The SIMD pattern per row (shufps broadcast lane + mulps + addps) is
   *   emitted 4× for xmm5, xmm6, xmm3, xmm4:
   *     xmm5 (row 0 of P) = shuf[0,0,0,0](n_0)·M.row0 + shuf[1,1,1,1](n_0)·M.row1
   *                       + shuf[2,2,2,2](n_0)·M.row2 + shuf[3,3,3,3](n_0)·M.row3
   *     xmm6 (row 1 of P) = same, n_1
   *     xmm3 (row 2 of P) = same, n_2
   *     xmm4 (row 3 of P) = same, n_3
   *
   *   Then apply P to the input (r,g,b, 0) via broadcast+madd on rows of P:
   *   (asm 0x0322ab..0x0322cc)
   *     xmm1 = broadcast(g) ; xmm1 *= xmm6              ; g * P.row1
   *     xmm0 = broadcast(r) ; xmm0 *= xmm5 ; xmm0 += xmm1 ; r*P.row0 + g*P.row1
   *     xmm1 = 0            ; xmm1 *= xmm4              ; 0 * P.row3 (i.e. 0)
   *     xmm2 = broadcast(b) ; xmm2 *= xmm3 ; xmm2 += xmm1 ; b*P.row2 + 0
   *     xmm2 += xmm0                                    ; r*row0 + g*row1 + b*row2
   *   Store:
   *     0x0322cf: movlps    %xmm2, 0x1b8(%rdi)   ; whitePointX (lane0), whitePointY (lane1)
   *     0x0322d6: extractps $2, %xmm2, 0x1c0(%rdi) ; whitePointZ (lane2 as int→mem, same bytes)
   *
   * Numerically, P = XYZtosRGB * sRGBtoXYZ should be the identity up to
   * float32 rounding; SetWhite therefore stores an *almost-round-tripped*
   * (r,g,b) triple at +0x1b8..+0x1c0. We transcribe the exact float32 math
   * FCP performs (single-precision matrix multiply then broadcast+madd),
   * NOT the closed-form (r,g,b) approximation.
   */
  SetWhite(r: number, g: number, b: number): void {
    // Step 1: compute P = N · M as 4×4 float32.
    // M = sRGBtoXYZ, N = XYZtosRGB, both row-major 4×4.
    // P.row_i[k] = sum_j( N[i][j] * M[j][k] )
    // All ops in float32 to match `mulps`/`addps` semantics.
    const M = sRGBtoXYZ;
    const N = XYZtosRGB;
    // P is 4 rows × 4 cols; we only use rows 0..2 below, but for
    // instruction-order fidelity we compute all four rows exactly like
    // xmm5/xmm6/xmm3/xmm4 do.
    const P = new Float32Array(16);
    for (let i = 0; i < 4; i++) {
      // n = N.row_i
      const n0 = N[i * 4 + 0], n1 = N[i * 4 + 1], n2 = N[i * 4 + 2], n3 = N[i * 4 + 3];
      // Row-i of P = n0*M.row0 + n1*M.row1 + n2*M.row2 + n3*M.row3
      // Emitted in the same accumulator order as the SIMD:
      //   acc = n1*M.row1 (first mulps)
      //   acc += n0*M.row0 (mulps + addps for lane broadcast $0)
      //   tmp = n3*M.row3 ; b_row = n2*M.row2 + tmp
      //   acc += b_row
      for (let k = 0; k < 4; k++) {
        const m0 = M[0 * 4 + k], m1 = M[1 * 4 + k], m2 = M[2 * 4 + k], m3 = M[3 * 4 + k];
        // exact SSE order: (n1*m1) + (n0*m0)  then  (n3*m3) + (n2*m2)  then sum
        const acc_lo = Math.fround(
          Math.fround(Math.fround(n1 * m1) + Math.fround(n0 * m0))
        );
        const acc_hi = Math.fround(
          Math.fround(Math.fround(n3 * m3) + Math.fround(n2 * m2))
        );
        P[i * 4 + k] = Math.fround(acc_lo + acc_hi);
      }
    }

    // Step 2: apply P to (r, g, b, 0) exactly as the asm does.
    // Order (asm 0x0322ab..0x0322cc):
    //   tmpG = broadcast(g); tmpG *= P.row1    → g*P.row1 (4 lanes)
    //   tmpR = broadcast(r); tmpR *= P.row0    → r*P.row0
    //   tmpR += tmpG                            → r*row0 + g*row1
    //   tmpZ = 0            ; tmpZ *= P.row3    → 0
    //   tmpB = broadcast(b); tmpB *= P.row2    → b*P.row2
    //   tmpB += tmpZ                            → b*row2 (still)
    //   tmpB += tmpR                            → r*row0 + g*row1 + b*row2
    const out = new Float32Array(4);
    for (let k = 0; k < 4; k++) {
      const rr = Math.fround(Math.fround(r) * P[0 * 4 + k]);   // r * P.row0[k]
      const gg = Math.fround(Math.fround(g) * P[1 * 4 + k]);   // g * P.row1[k]
      const bb = Math.fround(Math.fround(b) * P[2 * 4 + k]);   // b * P.row2[k]
      const rg = Math.fround(rr + gg);                          // r*row0 + g*row1
      // tmpZ = 0 * row3 = 0, plus tmpB = b*row2 + 0 = b*row2
      const zb = Math.fround(bb + 0.0);
      // final = tmpB + tmpR (i.e., zb + rg)
      out[k] = Math.fround(zb + rg);
    }

    // Store: movlps stores lanes 0,1 at +0x1b8; extractps $2 stores lane 2
    // at +0x1c0. Lane 3 is not written.
    this.whitePointX = out[0];
    this.whitePointY = out[1];
    this.whitePointZ = out[2];
  }

  /**
   * `HGChromaticAdapter::SetDParams(float a, float b)` — Helium @0x0322f0.
   *
   * Asm:
   *   0x0322f4: movss %xmm0, 0x1d0(%rdi)     ; dParam0 = a
   *   0x0322fc: movss %xmm1, 0x1d4(%rdi)     ; dParam1 = b
   * No math — pure field stores of two single-precision floats.
   */
  SetDParams(a: number, b: number): void {
    this.dParam0 = Math.fround(a);   // +0x1d0
    this.dParam1 = Math.fround(b);   // +0x1d4
  }

  /**
   * `HGChromaticAdapter::SetD(float d)` — Helium @0x032310.
   *
   * Asm:
   *   0x032314: movaps %xmm0, %xmm1                   ; xmm1 = d
   *   0x032317: minss  [rip+0x3959a1], %xmm1          ; xmm1 = min(d, 1.0f)   ; @Helium 0x3c7cc0 = 1.0f
   *   0x03231f: xorps  %xmm2, %xmm2                   ; xmm2 = 0.0
   *   0x032322: cmpltss %xmm2, %xmm0                  ; xmm0 = (d < 0.0) ? all-ones : 0
   *   0x032327: andnps %xmm1, %xmm0                   ; xmm0 = (~mask) & xmm1
   *                                                     = (d<0) ? 0 : min(d,1)
   *                                                   ; NOTE: `cmpltss xmm2,xmm0` computes
   *                                                     `xmm0 < xmm2` i.e. d < 0, so
   *                                                     mask=all-ones iff d<0. Then
   *                                                     `andnps xmm1,xmm0` = (NOT xmm0) AND xmm1.
   *                                                     If d<0 → NOT mask = 0 → 0. Else → xmm1.
   *                                                   ; NB: xmm0 is undefined in lane where d
   *                                                     is NaN — cmpltss sets ordered LT which
   *                                                     is false for NaN, so NaN passes through
   *                                                     to min→NaN, then andn(0, NaN)=NaN.
   *   0x03232a: movss %xmm0, 0x1d8(%rdi)              ; d field = clamp
   * Semantics: d field = clamp(d, [0, 1]) but implemented as
   *   `(d < 0) ? 0 : min(d, 1)` in float32, with NaN passing through as NaN.
   */
  SetD(d: number): void {
    // @Helium 0x3c7cc0 = 1.0f (constant, single-precision)
    const ONE_F32 = 1.0;   // exact in float32
    // Preserve the "cmpltss then andnps" NaN-semantics: NaN is NOT less-than
    // zero (ordered compare returns false), so the mask stays 0, and the
    // min(NaN,1) → NaN (SSE min returns second operand when unordered).
    // We reproduce this exactly with `!==` NaN checks and float32 rounding.
    const df32 = Math.fround(d);
    // min(d, 1.0f) in float32. SSE `minss(a,b)` returns b when either is NaN
    // or when b < a. Here the destination is `d` (xmm1=d), src is 1.0 (mem)
    // → min = (1.0 < d) ? 1.0 : d, i.e. returns 1.0 for NaN inputs and for
    //   d > 1.0; returns d otherwise.
    let mn: number;
    if (df32 !== df32) {
      // d is NaN — SSE minss returns the memory operand (1.0).
      mn = ONE_F32;
    } else {
      mn = Math.fround(ONE_F32 < df32 ? ONE_F32 : df32);
    }
    // (d < 0)? 0 : mn.  cmpltss on NaN yields 0-mask → falls through to mn.
    let result: number;
    if (df32 !== df32) {
      // d is NaN → mask is 0 → andnps returns xmm1 (= mn = 1.0).
      result = mn;
    } else if (df32 < 0.0) {
      result = 0.0;
    } else {
      result = mn;
    }
    this.d = Math.fround(result);   // +0x1d8
  }

  /**
   * `HGChromaticAdapter::SetA(float a)` — Helium @0x032340.
   *
   * Byte-for-byte identical prologue/epilogue to SetD, only the store offset
   * (+0x1dc instead of +0x1d8) and the min-constant rip target differ (both
   * point to the same 1.0f float32 constant — see SetD comment for @Helium
   * 0x3c7cc0). Asm:
   *   0x032344: movaps %xmm0, %xmm1
   *   0x032347: minss  [rip+0x395971], %xmm1        ; @Helium 0x3c7cc0 = 1.0f
   *   0x03234f: xorps  %xmm2, %xmm2
   *   0x032352: cmpltss %xmm2, %xmm0
   *   0x032357: andnps %xmm1, %xmm0
   *   0x03235a: movss  %xmm0, 0x1dc(%rdi)
   */
  SetA(a: number): void {
    const ONE_F32 = 1.0;
    const af32 = Math.fround(a);
    let mn: number;
    if (af32 !== af32) {
      mn = ONE_F32;
    } else {
      mn = Math.fround(ONE_F32 < af32 ? ONE_F32 : af32);
    }
    let result: number;
    if (af32 !== af32) {
      result = mn;
    } else if (af32 < 0.0) {
      result = 0.0;
    } else {
      result = mn;
    }
    this.a = Math.fround(result);   // +0x1dc
  }

  /**
   * `HGChromaticAdapter::SetComputeD(bool cd)` — Helium @0x032370.
   *
   * Asm:
   *   0x032374: movb %sil, 0x1e8(%rdi)      ; store 8-bit bool at +0x1e8
   * Pure field store; bool is passed in the low byte of %sil per SysV ABI.
   */
  SetComputeD(cd: boolean): void {
    this.computeD = cd;   // +0x1e8
  }

  /**
   * `HGChromaticAdapter::SetBlurParams(float a, float b)` — Helium @0x032380.
   *
   * Asm:
   *   0x032384: movss %xmm0, 0x1e0(%rdi)      ; blurParam0 = a
   *   0x03238c: movss %xmm1, 0x1e4(%rdi)      ; blurParam1 = b
   * Structurally identical to SetDParams (only offsets differ).
   */
  SetBlurParams(a: number, b: number): void {
    this.blurParam0 = Math.fround(a);   // +0x1e0
    this.blurParam1 = Math.fround(b);   // +0x1e4
  }

  /**
   * `HGChromaticAdapter::GetOutput(HGRenderer*)` — Helium @0x0323a0.
   *
   * Full asm (126 lines @ raw-port/re/disasm/Helium.HGChromaticAdapter.GetOutput.s)
   * dispatches on `this->computeD` (@0x1e8) then computes a D-parameter
   * interpolation curve:
   *   if (computeD) {
   *     xmm0 = (double)dParam0
   *     xmm1 = (double)dParam1
   *     xmm0 = (K0 - dParam1) / K1                 ; K0,K1 = rip-relative doubles
   *     xmm0 = exp(xmm0)                            ; symbol stub _exp
   *     xmm0 = xmm0 * K2 + K3                      ; K2,K3 = rip-relative doubles
   *     xmm0 = (float)(xmm0 * dParam0)              ; back to single
   *     if (xmm0 < 0.0)  → jump to path handling negative
   *     xmm1 = min(xmm0, 1.0f)                      ; clamp ceiling @0x3c7cc0
   *     ... vtable dispatch to HGRenderer::GetInput(HGNode*, int)
   *     ... additional vtable calls at *0x?(%rax)   ; child SetD, then GetOutput on hgcAdapter
   *   } else {
   *     ... direct path
   *   }
   *
   * Blocked on: HGRenderer::GetInput (unported), the vtable slots on
   *   HGColorMatrix / HGBlur / HgcChromaticAdapter (unported), and the exact
   *   rip-relative double constants K0..K3 (must be resolved via
   *   `resolve.py Helium const 0x…` at the addresses at 0x0323da/0x0323e6/
   *   0x0323f3/0x0323fb — deferred until callee wiring lands).
   *
   * Per PORTING_SPEC §Rule 3: throw a loud "gap" stub that cites the source
   * address so frontier.py can see the deferred callee wiring.
   */
  GetOutput(_renderer: unknown): unknown {
    throw new Error(
      "HGChromaticAdapter::GetOutput not yet transcribed @Helium 0x0323a0 " +
      "(needs HGRenderer::GetInput, HGColorMatrix/HGBlur/HgcChromaticAdapter vtables, " +
      "and rip-relative double constants K0..K3 @0x0323da/0x0323e6/0x0323f3/0x0323fb)"
    );
  }
}
