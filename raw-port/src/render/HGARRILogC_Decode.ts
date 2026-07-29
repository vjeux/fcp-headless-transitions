// raw-port/src/render/HGARRILogC_Decode.ts
//
// FCP `HGARRILogC::Decode` — nested Helium HGNode subclass. Inverse of
// HGARRILogC::Encode (see ./HGARRILogC_Encode.ts). Wraps an owned
// `HgcLogVideo_decode` compositor (upstream) feeding into an owned
// `HGColorMatrix` (downstream, ARRI Wide Gamut RGB → destination gamut).
// The compositor implements the ARRI ALEXA LogC inverse transfer
// function (LogC log-encoded video → linear scene-linear) for a
// specified Exposure Index (EI); the matrix stage then transforms from
// ARRI Wide Gamut RGB into the destination colorimetry (Rec.709 or
// Rec.2020).
//
// Structural twin of HGACEScct::Decode (raw-port/src/render/HGACEScct_Decode.ts)
// — but Decode-side wiring is: input → compositor → matrix → output
// (matrix is DOWNSTREAM in decode; upstream in encode). The two owned
// objects are the same as Encode (HgcLogVideo_decode replaces
// HgcLogVideo_encode; HGColorMatrix identical), just chained in the
// reverse direction.
//
// FRAMEWORK: Helium.framework
// FAT slice offset: 0x4000; thin binary /tmp/Helium.x86_64 has VA ==
// file offset (segment __TEXT vmaddr = 0). Constants read via
// `raw-port/army/tools/resolve.py Helium const 0x…`.
//
// DISASSEMBLY:
//   raw-port/re/disasm/Helium.HGARRILogC.Decode.__ZN10HGARRILogC6DecodeC2ENS_16SceneColorimetryEj.s  (C2 ctor, 143 lines)
//   raw-port/re/disasm/Helium.HGARRILogC.Decode.__ZN10HGARRILogC6DecodeC1ENS_16SceneColorimetryEj.s  (C1 — tail-jmp to C2)
//   raw-port/re/disasm/Helium.HGARRILogC.Decode.__ZN10HGARRILogC6DecodeD2Ev.s                        (D2 dtor)
//   raw-port/re/disasm/Helium.HGARRILogC.Decode.__ZN10HGARRILogC6DecodeD1Ev.s                        (D1 dtor)
//   raw-port/re/disasm/Helium.HGARRILogC.Decode.__ZN10HGARRILogC6DecodeD0Ev.s                        (D0 deleting dtor)
//   raw-port/re/disasm/Helium.HGARRILogC.Decode.__ZN10HGARRILogC6Decode9GetOutputEP10HGRenderer.s   (GetOutput)
//
// SYMBOLS:
//   @Helium 0x1027a0  HGARRILogC::Decode::Decode(SceneColorimetry, ei) [C2]  __ZN10HGARRILogC6DecodeC2ENS_16SceneColorimetryEj
//   @Helium 0x102a20  HGARRILogC::Decode::Decode(SceneColorimetry, ei) [C1] — tail-jmp to C2
//   @Helium 0x102a30  HGARRILogC::Decode::~Decode()  [D2]  __ZN10HGARRILogC6DecodeD2Ev
//   @Helium 0x102a80  HGARRILogC::Decode::~Decode()  [D1]  __ZN10HGARRILogC6DecodeD1Ev
//   @Helium 0x102ad0  HGARRILogC::Decode::~Decode()  [D0]  __ZN10HGARRILogC6DecodeD0Ev
//   @Helium 0x102b30  HGARRILogC::Decode::GetOutput(HGRenderer*)  __ZN10HGARRILogC6Decode9GetOutputEP10HGRenderer
//
//   @Helium 0x3d01b0  HGColorGamma::logGamutRGBToRec709RGB   [external static; consumed via +0x80 slot]
//   @Helium 0x3cfdb0  HGColorGamma::logGamutRGBToRec2020RGB  [external static; consumed via +0x80 slot]
//
// VTABLE:
//   Installed pointer = 0xa187c0. Recovered from ctor @0x1027bd
//     `leaq 0x915ffc(%rip), %rax` → (0x1027c4 + 0x915ffc) = 0xa187c0.
//   All three dtors reinstall the same target via a different `leaq`
//   displacement (D2 @0x102a39 = 0x915d80, D1 @0x102a89 = 0x915d30,
//   D0 @0x102ad9 = 0x915ce0 — each with a different PC of the leaq).
//
// CTOR ARG ORDER (@0x1027af..0x1027b5):
//   rdi = this
//   esi = colorimetry (SceneColorimetry enum, u32; captured into r15d)
//   edx = ei          (raw ARRI EI, u32; captured into r14d)
//
// STRUCT LAYOUT (recovered from C2 + GetOutput):
//   HGARRILogC::Decode extends HGNode (base ctor @0x1027b8). Subclass fields:
//     0x198 : HgcLogVideo_decode*  compositor    (allocated @0x1027cc, 0x1A0 bytes; assigned @0x1027dc)
//     0x1a0 : HGColorMatrix*       matrix        (allocated @0x1027e8, 0x1F0 bytes; assigned @0x1027f8)
//     0x1a8 : float                constant02f   (= 0.2f, immediate 0x3E4CCCCD written @0x102918)
//     0x1ac : float                comp0_x1      (log-segment SetParameter arg #1)  — see CTOR TAIL MATH
//     0x1b0 : float                comp0_x2      (log-segment SetParameter arg #2)
//     0x1b4 : float                comp0_x3      (log-segment SetParameter arg #3)
//     0x1b8 : float                comp1_x0      (linear-segment SetParameter arg #0)
//     0x1bc : float                comp1_x1      (linear-segment SetParameter arg #1)
//     0x1c0 : float                comp1_x2      (linear-segment SetParameter arg #2)
//     0x1c8 : const void*          matrixSrcRow  (`logGamutRGB{To Rec709RGB|To Rec2020RGB}[+0x80]`)
//   sizeof aligned up from 0x1cc → 0x1d0 (no further fields touched).
//
//   Row-field naming: HGARRILogC.ts exposes the six doubles at
//   {+0x08=cut,+0x10=a,+0x18=b,+0x20=c,+0x28=d,+0x30=e}. Those are just
//   BYTE-OFFSET LABELS (byte-verified against the row-0 numeric values
//   0.005561,0.080216,0.269036,0.381991,5.842037,0.092778). We use the
//   offset labels in the derivation below to match the disasm's
//   `movsd 0xNN(%rax)` loads verbatim without inferring ARRI-spec
//   semantics.
//
// CTOR TAIL MATH (@0x1028d0..0x1029d0) — precompute the compositor
// coefficients from the selected EI parameter row `p`. Full derivation
// (each line cites its instruction address):
//
//   xmm3 = p.cut                           @0x1028d0
//   xmm4 = p.c                             @0x1028d5
//   -0x28(%rbp) = p.c   (save)             @0x1028da
//   xmm1 = p.d                             @0x1028df
//   xmm2 = p.e                             @0x1028e4
//   -0x80(%rbp) = [p.e, 0]                 @0x1028e9 (movapd; upper 8 = 0)
//   xmm0 = 0.9d                            @0x1028ee   [@Helium 0x3d0e50 = 0.9]
//   xmm0 = 0.9 * p.d                       @0x1028f6
//   -0x70(%rbp) = [0.9*p.d, 0]             @0x1028fa
//   xmm0 = 5.555555555555555d              @0x1028ff   [@Helium 0x3d0e58 = 1/0.18]
//   xmm0 = 5.5555 * p.cut                  @0x102907
//   xmm3 = p.cut * p.d                     @0x10290b
//   xmm3 = p.cut*p.d + p.e                 @0x10290f
//   -0x30(%rbp) = p.cut*p.d + p.e          @0x102913
//   this._1a8 = 0.2f  (immediate)          @0x102918   [store $0x3E4CCCCD]
//   xmm1 = -log2(10)d                      @0x102922   [@Helium 0x3d0e60 = -3.321928094887362]
//   xmm1 = -log2(10) * p.c                 @0x10292a
//   -0x60(%rbp) = [-log2(10)*p.c, 0]       @0x10292e
//   xmm1 = [p.a, p.b]                      @0x102933 (movupd 0x10(%rax))
//   -0x50(%rbp) = [p.a, p.b]               @0x102938
//   xmm2 = p.b                             @0x10293d (movsd 0x18(%rax))
//   -0x40(%rbp) = [p.b, 0]                 @0x102942
//   xmm0 = p.a + 5.5555 * p.cut            @0x102946 (addsd xmm1_low = p.a)
//   xmm0 = log10(p.a + 5.5555*p.cut)       @0x10294a (call _log10)
//   xmm4 = p.b   (reloaded)                @0x10294f
//   xmm0 = p.b * log10(p.a + 5.5555*p.cut) @0x102954
//   xmm0 += p.c                            @0x102958
//   xmm0 += (p.cut*p.d + p.e)              @0x10295d
//   xmm0 *= 0.5d                           @0x102962   [@Helium 0x3cc1c0 = 0.5]
//     ⟹ xmm0 = 0.5 * ( p.b*log10(p.a + 5.5555*p.cut)  +  p.c  +  p.cut*p.d + p.e )
//
//   xmm3 = [p.a, p.b]  (reload from -0x50) @0x10296a
//   xmm1 = [p.a, p.b]                      @0x10296f
//   xmm1_hi = log2(10)d                    @0x102973   [movhpd @Helium 0x3d0e68 = 3.321928094887362]
//     ⟹ xmm1 = [p.a, log2(10)]  (packed doubles)
//   xmm2 = [-log2(10)*p.c, 0]  (reload)    @0x10297b
//   xmm2 = blendpd $0x2 [xmm2, [0.0,1.0]]  @0x102980   [128b @Helium 0x3d11b0 = {0.0,1.0}; imm=2 ⇒ lane1←mem]
//     ⟹ xmm2 = [-log2(10)*p.c, 1.0]
//   xmm3_lo = -5.0d                        @0x10298a   [movlpd @Helium 0x3d0e70 = -5.0]
//     ⟹ xmm3 = [-5.0, p.b]
//   xmm1 /= xmm3    (packed divpd)         @0x102992
//     ⟹ xmm1 = [p.a / -5.0, log2(10) / p.b]
//   xmm3 = [0.9*p.d, 0]  (reload -0x70)    @0x102996
//   xmm4 = [p.b, 0.9*p.d]  (unpcklpd)      @0x10299b   [xmm4_low was p.b; ins ⇒ xmm4=[xmm4lo, xmm3lo]]
//   xmm1 = cvtpd2ps(xmm1)                  @0x10299f   ⟹ [f32(p.a/-5), f32(log2(10)/p.b), 0, 0]
//   xmm2 /= xmm4    (packed divpd)         @0x1029a3   ⟹ [-log2(10)*p.c / p.b, 1.0 / (0.9*p.d)]
//   xmm2 = cvtpd2ps(xmm2)                  @0x1029a7   ⟹ [f32(-log2(10)*p.c/p.b), f32(1/(0.9*p.d)), 0, 0]
//   xmm1 = unpcklpd(xmm1, xmm2)            @0x1029ab   ⟹ 4 f32 packed:
//                                                    [ f32(p.a/-5) ,
//                                                      f32(log2(10)/p.b) ,
//                                                      f32(-log2(10)*p.c/p.b) ,
//                                                      f32(1/(0.9*p.d)) ]
//   movupd xmm1, 0x1ac(%rbx)               @0x1029af   ⟹ this._1ac..._1bb (4 f32 written)
//     ⟹ this._1ac = f32(p.a / -5)
//        this._1b0 = f32(log2(10) / p.b)
//        this._1b4 = f32(-log2(10) * p.c / p.b)
//        this._1b8 = f32(1 / (0.9 * p.d))
//
//   xmm1 = [p.e, 0]   (reload -0x80)       @0x1029b7
//   xmm1 ^= [-0.0, -0.0]                   @0x1029bc   [xorpd @Helium 0x3caae0 = sign-flip; ⇒ xmm1 = [-p.e, 0]]
//   xmm1_lo /= xmm3_lo  (divsd)            @0x1029c4   ⟹ xmm1_lo = -p.e / (0.9*p.d)
//   xmm1 = unpcklpd(xmm1, xmm0)            @0x1029c8
//     ⟹ xmm1 = [ -p.e/(0.9*p.d) ,  0.5 * ( p.b*log10(p.a+5.5555*p.cut) + p.c + p.cut*p.d + p.e ) ]
//   xmm0 = cvtpd2ps(xmm1)                  @0x1029cc
//     ⟹ xmm0 = [ f32(-p.e/(0.9*p.d)) , f32(0.5*<bigExpr>) , 0, 0 ]
//   movlpd xmm0, 0x1bc(%rbx)               @0x1029d0   ⟹ this._1bc, this._1c0 (2 f32 written)
//     ⟹ this._1bc = f32(-p.e / (0.9 * p.d))
//        this._1c0 = f32(0.5 * ( p.b*log10(p.a + 5.5555*p.cut) + p.c + p.cut*p.d + p.e ))
//
//   The five RIP-relative double constants (all resolved via
//   `resolve.py Helium const 0xADDR`, computed offsets shown for
//   traceability):
//     @0x1028ee movsd 0x2ce55a(%rip) → (0x1028f6 + 0x2ce55a) = 0x3d0e50 = 0.9
//     @0x1028ff movsd 0x2ce551(%rip) → (0x102907 + 0x2ce551) = 0x3d0e58 = 5.555555555555555 (1/0.18)
//     @0x102922 movsd 0x2ce536(%rip) → (0x10292a + 0x2ce536) = 0x3d0e60 = -3.321928094887362 (-log2(10))
//     @0x102962 mulsd 0x2c9856(%rip) → (0x10296a + 0x2c9856) = 0x3cc1c0 = 0.5
//     @0x102973 movhpd 0x2ce4ed(%rip) → (0x10297b + 0x2ce4ed) = 0x3d0e68 = 3.321928094887362 (log2(10))
//     @0x102980 blendpd $0x2, 0x2ce826(%rip) → (0x10298a + 0x2ce826) = 0x3d11b0 = 128-bit {0.0, 1.0}
//     @0x10298a movlpd 0x2ce4de(%rip) → (0x102992 + 0x2ce4de) = 0x3d0e70 = -5.0
//     @0x1029bc xorpd 0x2c811c(%rip)  → (0x1029c4 + 0x2c811c) = 0x3caae0 = 128-bit {-0.0, -0.0}
//
// CTOR MATRIX-ROW SELECTOR (@0x1027ff..0x102818) — pointer arithmetic:
//   testl %r15d, %r15d                                     @0x1027ff
//   jne   0x10280d                                          @0x102802
//   leaq  HGColorGamma::logGamutRGBToRec709RGB(%rip), %rax  @0x102804
//   jmp   0x102814                                          @0x10280b
//   leaq  HGColorGamma::logGamutRGBToRec2020RGB(%rip), %rax @0x10280d
//   subq  $-0x80, %rax                                       @0x102814   (== add 0x80)
//   movq  %rax, 0x1c8(%rbx)                                  @0x102818
//     ⟹ this.matrixSrcRow = (colorimetry==0 ? logGamutRGBToRec709RGB
//                                            : logGamutRGBToRec2020RGB) + 0x80
//   (The +0x80 offset selects a specific 4×4 f32 matrix WITHIN each
//    table — each symbol contains ≥4 matrices back-to-back @0x00, 0x40,
//    0x80, 0xc0. LoadMatrix in GetOutput consumes 64 bytes = one 4×4.)
//
// CTOR BAND-SELECT LADDER (@0x10281f..0x1028cd) — SAME ladder as
// HGARRILogC::logCurveParamsForEI (10 thresholds: 180, 225, 285, 360,
// 450, 570, 720, 900, 1140, 1440); this method INLINES it rather than
// calling out. Encode does the same. We DELEGATE to the ported
// `HGARRILogC.logCurveParamsForEI` — identical thresholds, identical
// fall-through-to-row[0] semantics, identical row stride 0x38.
//
// STATIC-DATA EXTERNS:
//   `HGColorGamma::logGamutRGBToRec709RGB`   @Helium 0x3d01b0 (external Helium symbol)
//   `HGColorGamma::logGamutRGBToRec2020RGB`  @Helium 0x3cfdb0 (external Helium symbol)
//   Both are 16-float 4×4 f32 matrices repeated in a bank; the +0x80
//   offset selects the third bank in each. Byte-exact reads at
//   0x3d01b0 + 0x80 and 0x3cfdb0 + 0x80 are transcribed below as
//   `HGARRILogC_Decode_matrixRec709` and
//   `HGARRILogC_Decode_matrixRec2020`. (The HGColorGamma class itself is
//   NOT yet ported; we lift just the two matrices this class consumes.)
//
// GETOUTPUT (@0x102b30..0x102bf1) — rendering-graph wiring:
//   1) r14 = this.compositor                                          @0x102b3a
//   2) input = renderer.GetInput(this, 0)                             @0x102b49
//   3) compositor.vtable[0x78] (slot=0, input)                        @0x102b59
//   4) compositor.vtable[0x60] (slot=0, xmm0=this._1a8=0.2f,
//                                        xmm1=this._1ac,
//                                        xmm2=this._1b0,
//                                        xmm3=this._1b4)             @0x102b88   (LOG segment)
//   5) compositor.vtable[0x60] (slot=1, xmm0=this._1b8,
//                                        xmm1=this._1bc,
//                                        xmm2=this._1c0,
//                                        xmm3=0.0f)                   @0x102bb5   (LINEAR segment)
//   6) matrix.vtable[0x78]     (slot=0, compositor)                   @0x102bcb
//   7) matrix.LoadMatrix(this.matrixSrcRow, /*transpose=*/true)       @0x102be1
//   8) return this.matrix                                             @0x102be6
//   (Compare Encode: matrix-then-compositor, return compositor.)
//
// UNDECODED CALLEES (throw-stubs per PORTING_SPEC.md rule 3):
//   HgcLogVideo_decode::HgcLogVideo_decode()  __ZN18HgcLogVideo_decodeC1Ev  — invoked @0x1027d7
//   HGColorMatrix::HGColorMatrix()            __ZN13HGColorMatrixC1Ev       — invoked @0x1027f3
//   HGColorMatrix::LoadMatrix(...)            __ZN13HGColorMatrix10LoadMatrixEPKDv4_fb — invoked @0x102be1
//   HGObject::operator new(unsigned long)     __ZN8HGObjectnwEm             — invoked @0x1027cc / @0x1027e8
//   HGObject::operator delete(void*)          __ZN8HGObjectdlEPv            — invoked from D0 (@0x102b18)
//   HGRenderer::GetInput(HGNode*, int)        __ZN10HGRenderer8GetInputEP6HGNodei — invoked @0x102b49
//   HgcLogVideo_decode + HGColorMatrix vtable slots *0x18 (Release), *0x60 (SetParameter), *0x78 (SetInput)
//   (HGNode ctor/dtor ARE ported and imported from ./HGNode.js.)
//   (`HGARRILogC.logCurveParamsForEI` IS ported — see ./HGARRILogC.js.)

import { HGNode } from './HGNode.js';
import { HGARRILogC, HGARRILogC_ParamRow } from './HGARRILogC.js';

// ---------------------------------------------------------------------------
// Placeholders for helper classes touched by this node but not yet ported.
// Each interface exposes only the vtable slots we actually invoke, and each
// allocator raises loudly (rule 3: no silent fill-in) — see the per-function
// citations for the exact @0xADDR each one is deferring.
// ---------------------------------------------------------------------------

/**
 * Placeholder for `HGRenderer` used by GetOutput's signature. Not yet
 * transcribed — see raw-port/army/ledger for HGRenderer.
 * The only method invoked here is `GetInput(HGNode*, int) -> HGNode*`
 * at @Helium 0x102b49.
 */
export interface HGRendererStub {
  /** @Helium 0x102b49 — direct call. Signature `GetInput(HGNode*, int) -> HGNode*`. */
  GetInput(node: HGNode, idx: number): HGNode;
}

/**
 * Placeholder for the compositor object owned at `this.compositor`
 * (`+0x198`). Undecoded — exposes only the vtable slots we invoke.
 *
 *   - `SetInput(idx, input)` via slot *0x78 — invoked @0x102b59 with (0, input).
 *   - `SetParameter(idx, xmm0, xmm1, xmm2, xmm3)` via slot *0x60
 *          — invoked @0x102b88 with (0, 0.2f, _1ac, _1b0, _1b4)   // LOG segment
 *          — invoked @0x102bb5 with (1, _1b8, _1bc, _1c0, 0.0f)    // LINEAR segment
 *   - `Release()` via slot *0x18 — invoked from all three dtors
 *          (D2 @0x102a52, D1 @0x102aa2, D0 @0x102af2).
 */
export interface HgcLogVideo_decode {
  /** vtable *0x78 @Helium — @0x102b59. */
  SetInput(idx: number, input: HGNode): void;
  /** vtable *0x60 @Helium — argument order (esi, xmm0, xmm1, xmm2, xmm3). */
  SetParameter(idx: number, a: number, b: number, c: number, d: number): void;
  /** vtable *0x18 @Helium — invoked from dtors. */
  Release(): void;
}

/**
 * Placeholder for the color-matrix node owned at `this.matrix`
 * (`+0x1a0`). Undecoded — exposes only the vtable slots we call.
 *
 *   - `SetInput(idx, input)` via slot *0x78 — invoked @0x102bcb with (0, compositor).
 *   - `LoadMatrix(mat, transpose)`         — invoked @0x102be1 with (this.matrixSrcRow, true).
 *      Mangled __ZN13HGColorMatrix10LoadMatrixEPKDv4_fb — the second arg
 *      is a bool (edx=1) and the first is a pointer to a 4-float vector
 *      array (a 4×4 row-major float32 matrix in this call site).
 *   - `Release()` via slot *0x18 — invoked from all three dtors
 *          (D2 @0x102a64, D1 @0x102ab4, D0 @0x102b04).
 */
export interface HGColorMatrix {
  /** vtable *0x78 @Helium — @0x102bcb. Argument order (esi=idx, rdx=input). */
  SetInput(idx: number, input: HGNode): void;
  /**
   * Non-vtable direct call to `HGColorMatrix::LoadMatrix(...)`.
   * @Helium 0x102be1 with edx=1 (transpose).
   */
  LoadMatrix(matrix: readonly number[], transpose: boolean): void;
  /** vtable *0x18 @Helium — invoked from D0/D1/D2. */
  Release(): void;
}

/**
 * Placeholder for the compositor allocation + ctor sequence @Helium
 * 0x1027c7..0x1027d7:
 *   0x1027c7  movl  $0x1a0,%edi                     ; alloc size = 0x1A0 = 416
 *   0x1027cc  callq __ZN8HGObjectnwEm               ; HGObject::operator new
 *   0x1027d7  callq __ZN18HgcLogVideo_decodeC1Ev    ; placement ctor
 * Throws until the class is transcribed (rule 3).
 */
function newHgcLogVideo_decode(): HgcLogVideo_decode {
  throw new Error(
    "HGARRILogC::Decode: HgcLogVideo_decode ctor + HGObject::operator new @Helium 0x1027cc/0x1027d7 not yet transcribed"
  );
}

/**
 * Placeholder for the color-matrix allocation + ctor sequence @Helium
 * 0x1027e3..0x1027f3:
 *   0x1027e3  movl  $0x1f0,%edi                     ; alloc size = 0x1F0 = 496
 *   0x1027e8  callq __ZN8HGObjectnwEm               ; HGObject::operator new
 *   0x1027f3  callq __ZN13HGColorMatrixC1Ev         ; placement ctor
 * Throws until the class is transcribed (rule 3).
 */
function newHGColorMatrix(): HGColorMatrix {
  throw new Error(
    "HGARRILogC::Decode: HGColorMatrix ctor + HGObject::operator new @Helium 0x1027e8/0x1027f3 not yet transcribed"
  );
}

// ---------------------------------------------------------------------------
// External Helium static data: two 4×4 f32 matrices (ARRI Log Gamut RGB →
// {Rec.709 RGB | Rec.2020 RGB}), each read from a specific offset within
// its owning HGColorGamma symbol.
//
//   @Helium 0x3d01b0 + 0x80  HGColorGamma::logGamutRGBToRec709RGB[+0x80]  (16 f32, row-major 4×4)
//   @Helium 0x3cfdb0 + 0x80  HGColorGamma::logGamutRGBToRec2020RGB[+0x80] (16 f32, row-major 4×4)
//
// The +0x80 offset comes from the ctor's `subq $-0x80,%rax` @0x102814
// (which is `add $0x80` in signed form). Each HGColorGamma table
// contains ≥4 back-to-back 4×4 matrices @0x00, 0x40, 0x80, 0xc0; this
// class always consumes the third slot (+0x80).
//
// Values below are byte-exact reads from the Helium x86_64 slice at
// (0x3d01b0 + 0x80) and (0x3cfdb0 + 0x80) respectively. The full
// HGColorGamma class carries additional matrices at those symbols and
// is not yet ported — we lift only the +0x80 slots this class touches.
// ---------------------------------------------------------------------------

/**
 * `HGColorGamma::logGamutRGBToRec709RGB[+0x80]` — Helium 0x3d0230.
 * The bottom row is `[0, 0, 0, 1]` (an affine matrix in homogeneous
 * form); the top-left 3×3 is a full-precision ARRI Log Gamut → Rec.709
 * primaries transform. Consumed by `HGColorMatrix::LoadMatrix` with
 * transpose=true @Helium 0x102be1 when colorimetry == 0.
 */
export const HGARRILogC_Decode_matrixRec709: readonly number[] = [
  Math.fround( 1.6175234318),  Math.fround(-0.5372866392), Math.fround(-0.0802368149), Math.fround(0.0),
  Math.fround(-0.0705727413),  Math.fround( 1.3346130848), Math.fround(-0.2640403211), Math.fround(0.0),
  Math.fround(-0.0211017281),  Math.fround(-0.2269538790), Math.fround( 1.2480555773), Math.fround(0.0),
  Math.fround( 0.0),           Math.fround( 0.0),          Math.fround( 0.0),          Math.fround(1.0),
] as const;

/**
 * `HGColorGamma::logGamutRGBToRec2020RGB[+0x80]` — Helium 0x3cfe30.
 * The bottom row is `[0, 0, 0, 1]`; the top-left 3×3 is a full-precision
 * ARRI Log Gamut → Rec.2020 primaries transform. Consumed by
 * `HGColorMatrix::LoadMatrix` with transpose=true @Helium 0x102be1
 * when colorimetry != 0.
 */
export const HGARRILogC_Decode_matrixRec2020: readonly number[] = [
  Math.fround( 0.9906881452), Math.fround( 0.0925396532), Math.fround(-0.0832277760), Math.fround(0.0),
  Math.fround( 0.0466322340), Math.fround( 1.1875268221), Math.fround(-0.2341590822), Math.fround(0.0),
  Math.fround( 0.0014035887), Math.fround(-0.0946020037), Math.fround( 1.0931984186), Math.fround(0.0),
  Math.fround( 0.0),          Math.fround( 0.0),          Math.fround( 0.0),          Math.fround(1.0),
] as const;

// ---------------------------------------------------------------------------
// RIP-relative double constants used by C2 tail math.
// ---------------------------------------------------------------------------

/**
 * @Helium 0x3d0e50 = 0.9 (IEEE 754 double).
 * Consumed at @0x1028f6 as `xmm0 = 0.9 * p.d`, then reused as a divisor
 * in the packed `xmm4 = [p.b, 0.9*p.d]` / `divpd` block @0x1029a3.
 */
const HGARRILogC_Decode_zero_point_nine: number = 0.9;

/**
 * @Helium 0x3d0e58 = 5.555555555555555 (IEEE 754 double; = 1/0.18).
 * Consumed at @0x102907 as `xmm0 = 5.5555... * p.cut`, then added to
 * `p.a` before the log10 call.
 */
const HGARRILogC_Decode_inv_zero_point_eighteen: number = 5.555555555555555;

/**
 * @Helium 0x3d0e60 = -3.321928094887362 (IEEE 754 double; = -log2(10) = -1/log10(2)).
 * Consumed at @0x10292a as `xmm1 = -log2(10) * p.c`; then reciprocal
 * form (@0x3d0e68) used elsewhere in the same block. Numerically the
 * ARRI LogC compositor's log-base-conversion factor.
 */
const HGARRILogC_Decode_neg_log2_10: number = -3.321928094887362;

/**
 * @Helium 0x3cc1c0 = 0.5 (IEEE 754 double).
 * Consumed at @0x102962 as `xmm0 *= 0.5` to close the `bigExpr`
 * computation before it lands in this._1c0.
 */
const HGARRILogC_Decode_one_half: number = 0.5;

/**
 * @Helium 0x3d0e68 = 3.321928094887362 (IEEE 754 double; = log2(10) = 1/log10(2)).
 * Consumed at @0x102973 via `movhpd` into `xmm1_hi` before the packed
 * `divpd` block @0x102992.
 */
const HGARRILogC_Decode_log2_10: number = 3.321928094887362;

/**
 * @Helium 0x3d0e70 = -5.0 (IEEE 754 double).
 * Consumed at @0x10298a via `movlpd` into `xmm3_lo` — the divisor for
 * `p.a / -5.0` in the packed `divpd` block.
 */
const HGARRILogC_Decode_neg_five: number = -5.0;

// ---------------------------------------------------------------------------
// The class.
// ---------------------------------------------------------------------------

/**
 * SceneColorimetry enum placeholder — the underlying enum's meanings
 * (Rec.709 vs Rec.2020 vs …) are not yet decoded. Ctor accepts a
 * `number` here (u32 in the C++ signature); we DO NOT bound-check or
 * remap it — the disasm doesn't either, and only the low bit of the
 * value actually matters (testl %r15d, %r15d @0x1027ff — colorimetry==0
 * picks the Rec.709 branch, everything else picks Rec.2020).
 */
export type HGARRILogCDecode_SceneColorimetry = number;

/**
 * `HGARRILogC::Decode` — Helium HGNode subclass. Wraps an
 * `HgcLogVideo_decode` compositor (upstream) feeding an `HGColorMatrix`
 * (downstream) for ARRI ALEXA LogC inverse decoding at a specified
 * Exposure Index.
 *
 * @Helium ctors     @0x1027a0 (C2) / @0x102a20 (C1);
 *         dtors     @0x102a30 (D2) / @0x102a80 (D1) / @0x102ad0 (D0);
 *         GetOutput @0x102b30.
 */
export class HGARRILogCDecode extends HGNode {
  /**
   * Owned `HgcLogVideo_decode` compositor. Field @0x198.
   * Assigned in ctor @0x1027dc: `movq %r12, 0x198(%rbx)`.
   */
  compositor: HgcLogVideo_decode | null;

  /**
   * Owned `HGColorMatrix`. Field @0x1a0.
   * Assigned in ctor @0x1027f8: `movq %r12, 0x1a0(%rbx)`.
   */
  matrix: HGColorMatrix | null;

  /**
   * Constant 0.2f. Field @0x1a8. Immediate 0x3E4CCCCD stored in ctor
   * @0x102918: `movl $0x3e4ccccd, 0x1a8(%rbx)`. Consumed as xmm0 of
   * the log-segment SetParameter call in GetOutput.
   * (0.2f = 0x3E4CCCCD narrow-rounds to 0.20000000298023224.)
   */
  constant02f: number;

  /** Field @0x1ac (float). = f32(p.a / -5.0).                Store @0x1029af (movupd low). */
  comp0_x1: number;
  /** Field @0x1b0 (float). = f32(log2(10) / p.b).            Store @0x1029af.              */
  comp0_x2: number;
  /** Field @0x1b4 (float). = f32(-log2(10) * p.c / p.b).     Store @0x1029af.              */
  comp0_x3: number;
  /** Field @0x1b8 (float). = f32(1 / (0.9 * p.d)).           Store @0x1029af (movupd high).*/
  comp1_x0: number;
  /** Field @0x1bc (float). = f32(-p.e / (0.9 * p.d)).        Store @0x1029d0 (movlpd low). */
  comp1_x1: number;
  /**
   * Field @0x1c0 (float). = f32( 0.5 * ( p.b*log10(p.a + 5.5555*p.cut)
   *                                       + p.c + p.cut*p.d + p.e ) ).
   * Store @0x1029d0 (movlpd high).
   */
  comp1_x2: number;

  /**
   * Pointer to a 4×4 f32 matrix at either
   * `HGColorGamma::logGamutRGBToRec709RGB + 0x80` (colorimetry == 0) or
   * `HGColorGamma::logGamutRGBToRec2020RGB + 0x80` (colorimetry != 0).
   * Field @0x1c8. Assigned in ctor @0x102818:
   *   `movq %rax, 0x1c8(%rbx)` after `subq $-0x80, %rax` @0x102814.
   */
  matrixSrcRow: readonly number[];

  /**
   * `HGARRILogC::Decode::Decode(SceneColorimetry colorimetry, unsigned int ei)`
   * — Helium @0x1027a0 (C2 base-object ctor). C1 @0x102a20 tail-jmps to
   * C2 (verbatim `pushq %rbp; movq %rsp,%rbp; popq %rbp; jmp C2`), so
   * only C2's body needs modelling.
   *
   * See the file header for the full instruction-by-instruction
   * derivation of every field write. Verbatim asm (elided prologue):
   *
   *   0x1027af  movl  %edx, %r14d                     ; r14d = ei
   *   0x1027b2  movl  %esi, %r15d                     ; r15d = colorimetry
   *   0x1027b5  movq  %rdi, %rbx                      ; rbx  = this
   *   0x1027b8  callq __ZN6HGNodeC2Ev                 ; base ctor
   *   0x1027bd  leaq  0x915ffc(%rip), %rax            ; = 0xa187c0 (own installed vtable ptr)
   *   0x1027c4  movq  %rax, (%rbx)                    ; *this = vtable
   *   0x1027c7  movl  $0x1a0, %edi                    ; alloc 0x1A0 for HgcLogVideo_decode
   *   0x1027cc  callq __ZN8HGObjectnwEm
   *   0x1027d7  callq __ZN18HgcLogVideo_decodeC1Ev
   *   0x1027dc  movq  %r12, 0x198(%rbx)               ; this.compositor = r12
   *   0x1027e3  movl  $0x1f0, %edi                    ; alloc 0x1F0 for HGColorMatrix
   *   0x1027e8  callq __ZN8HGObjectnwEm
   *   0x1027f3  callq __ZN13HGColorMatrixC1Ev
   *   0x1027f8  movq  %r12, 0x1a0(%rbx)               ; this.matrix     = r12
   *   0x1027ff..0x102818  matrixSrcRow = (colorimetry==0 ? Rec709 : Rec2020) + 0x80
   *                       (branch via testl+jne; two leaq'd symbol addresses; subq $-0x80).
   *   0x10281f..0x1028cd  band-select ladder (same thresholds as
   *                       HGARRILogC::logCurveParamsForEI); ends with
   *                       rax pointing at the selected ARRI param row `p`.
   *   0x102918            this.constant02f = 0.2f  (movl $0x3E4CCCCD, 0x1a8(%rbx))
   *   0x1028d0..0x1029d0  the six derived f32s written at +0x1ac..+0x1c3 (movupd)
   *                       and +0x1bc..+0x1c3 (movlpd) — see file header for
   *                       the full instruction-by-instruction derivation.
   *   0x1029d8..0x1029e4  epilogue, retq.
   *
   * The exception-cleanup path @0x1029e5..0x102a10 (delete
   * partially-allocated HgcLogVideo_decode + HGNode::~HGNode +
   * __Unwind_Resume) fires only on a throwing HgcLogVideo_decode ctor /
   * new; TS exceptions unwind naturally so we don't model it
   * explicitly.
   *
   * @param colorimetry  SceneColorimetry (u32; NOT bounds-checked;
   *                     colorimetry == 0 picks Rec.709, else Rec.2020;
   *                     the disasm's test is `testl %r15d,%r15d`).
   * @param ei           raw ARRI Exposure Index (u32).
   */
  constructor(colorimetry: HGARRILogCDecode_SceneColorimetry, ei: number) {
    // @Helium 0x1027b8: HGNode base ctor.
    super();
    // @Helium 0x1027c4: install this class's vtable (installed ptr = 0xa187c0).
    this.vtable = 0xa187c0;
    // @Helium 0x1027c7..0x1027dc: alloc + ctor HgcLogVideo_decode, store @0x198.
    // Throws until HgcLogVideo_decode is transcribed.
    this.compositor = newHgcLogVideo_decode();
    // @Helium 0x1027e3..0x1027f8: alloc + ctor HGColorMatrix, store @0x1a0.
    // Throws until HGColorMatrix is transcribed.
    this.matrix = newHGColorMatrix();
    // @Helium 0x1027ff..0x102818: matrixSrcRow selection.
    //   testl %r15d,%r15d ; jne 0x10280d ; leaq Rec709 else leaq Rec2020 ;
    //   subq $-0x80,%rax  (= add 0x80)  ; movq %rax, 0x1c8(%rbx)
    // We model the "+0x80" as an unchangeable choice-of-matrix (we
    // transcribed those bytes above into HGARRILogC_Decode_matrixRec{709,2020}).
    this.matrixSrcRow =
      colorimetry === 0
        ? HGARRILogC_Decode_matrixRec709
        : HGARRILogC_Decode_matrixRec2020;
    // @Helium 0x10281f..0x1028cd: inlined copy of HGARRILogC::logCurveParamsForEI.
    // Delegate to the shared ported lookup — same thresholds, same
    // fall-through-to-row[0] semantics.
    const p: HGARRILogC_ParamRow = HGARRILogC.logCurveParamsForEI(ei);
    // @Helium 0x102918: this.constant02f = 0.2f  (movl $0x3E4CCCCD, 0x1a8(%rbx))
    this.constant02f = Math.fround(0.20000000298023224);
    // @Helium 0x1028d0..0x1029d0: derive the six compositor f32s.
    // Each formula is transcribed one line per store, matching the
    // instruction stream in the file header verbatim. Every product is
    // computed as JS double first, then narrowed to f32 via Math.fround
    // — mirroring the binary's `cvtpd2ps` narrowings @0x10299f/0x1029a7
    // / 0x1029cc.
    // @0x1029af (movupd), lanes 0..3:
    this.comp0_x1 = Math.fround(p.a / HGARRILogC_Decode_neg_five);
    this.comp0_x2 = Math.fround(HGARRILogC_Decode_log2_10 / p.b);
    this.comp0_x3 = Math.fround((HGARRILogC_Decode_neg_log2_10 * p.c) / p.b);
    this.comp1_x0 = Math.fround(1.0 / (HGARRILogC_Decode_zero_point_nine * p.d));
    // @0x1029d0 (movlpd), lanes 0..1:
    this.comp1_x1 = Math.fround(-p.e / (HGARRILogC_Decode_zero_point_nine * p.d));
    this.comp1_x2 = Math.fround(
      HGARRILogC_Decode_one_half *
        (p.b * Math.log10(p.a + HGARRILogC_Decode_inv_zero_point_eighteen * p.cut)
          + p.c
          + p.cut * p.d
          + p.e),
    );
  }

  /**
   * `HGARRILogC::Decode::~Decode()` — Helium @0x102a30 (D2, base-object)
   * / @0x102a80 (D1, complete-object) / @0x102ad0 (D0, deleting).
   *
   * All three share the same body up through the base-dtor call; D0
   * additionally tail-calls `HGObject::operator delete`. D0's body
   * (@0x102ad0..0x102b18):
   *   leaq  0x915ce0(%rip), %rax         ; = 0xa187c0 (reinstall own vtable)
   *   movq  %rax, (%rdi)
   *   movq  0x198(%rdi), %rdi            ; compositor
   *   testq %rdi, %rdi ; je  ...         ; skip if null
   *   movq  (%rdi), %rax ; callq *0x18(%rax) ; compositor.Release()
   *   movq  0x1a0(%rbx), %rdi            ; matrix
   *   testq %rdi, %rdi ; je  ...
   *   movq  (%rdi), %rax ; callq *0x18(%rax) ; matrix.Release()
   *   movq  %rbx, %rdi ; callq __ZN6HGNodeD2Ev  ; HGNode::~HGNode()
   *   movq  %rbx, %rdi ; jmp   __ZN8HGObjectdlEPv ; delete this
   *
   * D2 @0x102a30 and D1 @0x102a80 have byte-identical bodies except:
   *   - the vtable-reinstall leaq displacement (different PC)
   *   - the HGNode dtor is called via `jmp` (tail-call) instead of `call`
   *   - no operator-delete after the HGNode dtor.
   *
   * We model D0's operator-delete step at the JS caller (dropping the
   * reference) — TS has no explicit `delete this`.
   *
   * NB: the release order in D0/D1/D2 is compositor FIRST, matrix
   * SECOND (opposite of the ctor's assignment order, which allocated
   * compositor first then matrix). Encode releases matrix-first,
   * compositor-second — a mirror of its own assignment order. The
   * disasm shows Decode explicitly loading 0x198 before 0x1a0.
   */
  destruct(): void {
    // @Helium 0x102a40/0x102a90/0x102ae0: vtable reinstall — modeled by assignment.
    this.vtable = 0xa187c0;
    // @Helium 0x102a43..0x102a52 (D2): release compositor if present.
    if (this.compositor != null) {
      this.compositor.Release();
      this.compositor = null;
    }
    // @Helium 0x102a55..0x102a64 (D2): release matrix if present.
    if (this.matrix != null) {
      this.matrix.Release();
      this.matrix = null;
    }
    // @Helium 0x102a70 (D2) / 0x102ac0 (D1): jmp HGNode::~HGNode(). D0 uses callq
    // and then tail-jmps to HGObject::operator delete (handled by the caller
    // dropping the reference in TS).
    super.destruct();
  }

  /**
   * `HGARRILogC::Decode::GetOutput(HGRenderer* renderer)` — Helium
   * @0x102b30.
   *
   * Wires the owned compositor + matrix into the render graph:
   *   1) fetch this node's input at slot 0
   *   2) hand it to the compositor as input slot 0    (compositor.SetInput *0x78)
   *   3) SetParameter(0, 0.2f, _1ac, _1b0, _1b4)      (LOG segment,    *0x60)
   *   4) SetParameter(1, _1b8, _1bc, _1c0, 0.0f)      (LINEAR segment, *0x60)
   *   5) hand the compositor to the matrix as input 0 (matrix.SetInput *0x78)
   *   6) load the srcRow matrix (transposed)          (matrix.LoadMatrix)
   *   7) return the matrix.
   *
   * Verbatim asm (@0x102b30..0x102bf1, prologue/epilogue elided):
   *   0x102b3a  movq  0x198(%rdi), %r14           ; r14 = this.compositor
   *   0x102b41  movq  %rsi, %rdi                  ; rdi = renderer
   *   0x102b44  movq  %rbx, %rsi                  ; rsi = this
   *   0x102b47  xorl  %edx, %edx
   *   0x102b49  callq __ZN10HGRenderer8GetInputEP6HGNodei
   *                                                ; input = renderer.GetInput(this, 0)
   *   0x102b4e  movq  (%r14), %rcx                ; rcx = compositor.vtable
   *   0x102b51  movq  %r14, %rdi                  ; rdi = compositor
   *   0x102b54  xorl  %esi, %esi                  ; esi = 0
   *   0x102b56  movq  %rax, %rdx                  ; rdx = input
   *   0x102b59  callq *0x78(%rcx)                 ; compositor.SetInput(0, input)
   *   0x102b5c  movq  0x198(%rbx), %rdi           ; rdi = this.compositor
   *   0x102b63  movss 0x1a8(%rbx), %xmm0          ; xmm0 = this.constant02f (0.2f)
   *   0x102b6b  movss 0x1ac(%rbx), %xmm1          ; xmm1 = this.comp0_x1
   *   0x102b73  movss 0x1b0(%rbx), %xmm2          ; xmm2 = this.comp0_x2
   *   0x102b7b  movss 0x1b4(%rbx), %xmm3          ; xmm3 = this.comp0_x3
   *   0x102b83  movq  (%rdi), %rax                ; rax = compositor.vtable
   *   0x102b86  xorl  %esi, %esi                  ; esi = 0
   *   0x102b88  callq *0x60(%rax)                 ; compositor.SetParameter(0, 0.2, _1ac, _1b0, _1b4)
   *   0x102b8b  movq  0x198(%rbx), %rdi           ; rdi = this.compositor
   *   0x102b92  movss 0x1b8(%rbx), %xmm0          ; xmm0 = this.comp1_x0
   *   0x102b9a  movss 0x1bc(%rbx), %xmm1          ; xmm1 = this.comp1_x1
   *   0x102ba2  movss 0x1c0(%rbx), %xmm2          ; xmm2 = this.comp1_x2
   *   0x102baa  movq  (%rdi), %rax                ; rax = compositor.vtable
   *   0x102bad  xorps %xmm3, %xmm3                ; xmm3 = 0.0f
   *   0x102bb0  movl  $0x1, %esi                  ; esi = 1
   *   0x102bb5  callq *0x60(%rax)                 ; compositor.SetParameter(1, _1b8, _1bc, _1c0, 0.0f)
   *   0x102bb8  movq  0x198(%rbx), %rdx           ; rdx = this.compositor  (input for matrix)
   *   0x102bbf  movq  0x1a0(%rbx), %rdi           ; rdi = this.matrix
   *   0x102bc6  movq  (%rdi), %rax                ; rax = matrix.vtable
   *   0x102bc9  xorl  %esi, %esi                  ; esi = 0
   *   0x102bcb  callq *0x78(%rax)                 ; matrix.SetInput(0, compositor)
   *   0x102bce  movq  0x1a0(%rbx), %rdi           ; rdi = this.matrix
   *   0x102bd5  movq  0x1c8(%rbx), %rsi           ; rsi = this.matrixSrcRow
   *   0x102bdc  movl  $0x1, %edx                  ; edx = 1 (transpose = true)
   *   0x102be1  callq __ZN13HGColorMatrix10LoadMatrixEPKDv4_fb
   *                                                ; matrix.LoadMatrix(matrixSrcRow, true)
   *   0x102be6  movq  0x1a0(%rbx), %rax           ; rax = this.matrix
   *   0x102bed..0x102bf1  epilogue, retq.
   *
   * @param renderer  the containing HGRenderer (undecoded — only
   *                  `GetInput` is invoked here).
   * @returns         the matrix node this class wraps (i.e. the
   *                  output of this filter in the graph). Encode
   *                  returns the compositor; Decode returns the matrix
   *                  because the matrix stage comes AFTER the log-video
   *                  inverse decode.
   */
  GetOutput(renderer: HGRendererStub): HGNode {
    // @Helium 0x102b3a: r14 = this.compositor. Invariant: non-null after ctor.
    const comp = this.compositor;
    const matrix = this.matrix;
    if (comp == null || matrix == null) {
      // Not reachable in the C++ path — see comment in Encode's
      // GetOutput.  Loud fault preferred over `!` shorthand (rule 3).
      throw new Error(
        "HGARRILogC::Decode::GetOutput @Helium 0x102b3a — compositor or matrix null (should be unreachable after ctor)"
      );
    }
    // @Helium 0x102b49: input = renderer.GetInput(this, 0)
    const input = renderer.GetInput(this, 0);
    // @Helium 0x102b59: compositor.SetInput(0, input) via vtable *0x78
    comp.SetInput(0, input);
    // @Helium 0x102b88: compositor.SetParameter(0, 0.2f, _1ac, _1b0, _1b4) — LOG segment.
    comp.SetParameter(
      0,
      this.constant02f,
      this.comp0_x1,
      this.comp0_x2,
      this.comp0_x3,
    );
    // @Helium 0x102bb5: compositor.SetParameter(1, _1b8, _1bc, _1c0, 0.0f) — LINEAR segment.
    comp.SetParameter(
      1,
      this.comp1_x0,
      this.comp1_x1,
      this.comp1_x2,
      Math.fround(0.0),
    );
    // @Helium 0x102bcb: matrix.SetInput(0, compositor) via vtable *0x78
    matrix.SetInput(0, comp as unknown as HGNode);
    // @Helium 0x102be1: matrix.LoadMatrix(this.matrixSrcRow, /*transpose=*/true)
    matrix.LoadMatrix(this.matrixSrcRow, true);
    // @Helium 0x102be6: return this.matrix (cast to HGNode by C++ inheritance).
    return matrix as unknown as HGNode;
  }
}
