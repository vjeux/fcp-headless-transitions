// raw-port/src/render/HGBMDFilmGen5_Encode.ts
//
// FCP `HGBMDFilmGen5::Encode` — nested Helium HGNode subclass. Wraps an
// owned `HGColorMatrix` (source-gamut → BMD Wide Gamut RGB) followed by
// an owned `HgcLogVideo_encode` compositor configured (via two
// SetParameter calls with byte-exact fp32 constants baked into
// Helium.__const) to implement the Blackmagic Design "Film Gen 5"
// camera-log OETF (scene-linear → BMD Film Gen 5 log-encoded video).
//
// Structural twin of HGARRILogC::Encode
// (raw-port/src/render/HGARRILogC_Encode.ts) and HGACEScct::Encode
// (raw-port/src/render/HGACEScct_Encode.ts) — same nested-class facade
// shape (HGColorMatrix stage → HgcLogVideo_encode stage → vtable-wired
// SetParameter pair). Differences from HGARRILogC::Encode:
//   • NO Exposure Index (EI) parameter — the ctor takes only
//     SceneColorimetry, so there is NO logCurveParamsForEI ladder and
//     NO per-EI precomputed float coefficients written into the
//     subclass fields. The four SetParameter args per call are all
//     read directly from Helium.__const RIP-relative pools; nothing is
//     stored past 0x1a8.
//   • sizeof shrinks accordingly to 0x1b0 (the derived subclass adds
//     only three pointer/pointer-into-static fields at 0x198/0x1a0/0x1a8).
// Similarities with HGARRILogC::Encode:
//   • Same vtable-install idiom (own installed-ptr @Helium 0xa190c0).
//   • Same 2-stage color-matrix + log-encoder wiring in GetOutput.
//   • Same sourceTo<Gamut>[SceneColorimetry] indexing (2 entries ×
//     0x40 bytes = 2 × 4×4 float32 matrices), with LoadMatrix called
//     with transpose=true.
// The inverse direction (log → linear, decode) for the same camera is
// already ported in raw-port/src/render/HGBMDFilmGen5LinearizationLUTInfo.ts;
// several of the constants recovered here (0.5300133228, 0.09246575087,
// 0.005494072..., 0.9f) reappear from that decoder — this file emits
// the FORWARD (linear → log) coefficients.
//
// FRAMEWORK: Helium.framework
// FAT slice offset: 0x4000; thin binary /tmp/Helium.x86_64 has VA ==
// file offset (segment __TEXT vmaddr = 0). Constants read via
// `raw-port/army/tools/resolve.py Helium const 0x…` and via direct
// byte-reads at the resolved VA (all data below is byte-exact against
// the Helium x86_64 slice).
//
// DISASSEMBLY (source of every citation below):
//   raw-port/re/disasm/Helium.HGBMDFilmGen5.Encode.__ZN13HGBMDFilmGen56EncodeC2ENS_16SceneColorimetryE.s  (C2 ctor)
//   raw-port/re/disasm/Helium.HGBMDFilmGen5.Encode.__ZN13HGBMDFilmGen56EncodeC1ENS_16SceneColorimetryE.s  (C1 ctor — tail-jmp)
//   raw-port/re/disasm/Helium.HGBMDFilmGen5.Encode.__ZN13HGBMDFilmGen56EncodeD2Ev.s                       (D2 dtor)
//   raw-port/re/disasm/Helium.HGBMDFilmGen5.Encode.__ZN13HGBMDFilmGen56EncodeD1Ev.s                       (D1 dtor)
//   raw-port/re/disasm/Helium.HGBMDFilmGen5.Encode.__ZN13HGBMDFilmGen56EncodeD0Ev.s                       (D0 dtor)
//   raw-port/re/disasm/Helium.HGBMDFilmGen5.Encode.__ZN13HGBMDFilmGen56Encode9GetOutputEP10HGRenderer.s   (GetOutput)
//   Method boundaries:
//     C2       @0x103510..0x1035ba
//     C1       @0x1035c0..0x1035c5 (tail-jmp to C2)
//     D2       @0x1035d0..0x10361d
//     D1       @0x103620..0x10366d
//     D0       @0x103670..0x1036c5
//     GetOutput@0x1036d0..0x103791
//   No `.cold.*` initializers (unlike HGACEScct::Encode); the C2 body
//   holds no function-scope statics.
//
// SYMBOLS:
//   @Helium 0x103510  HGBMDFilmGen5::Encode::Encode(SceneColorimetry)     [C2]  __ZN13HGBMDFilmGen56EncodeC2ENS_16SceneColorimetryE
//   @Helium 0x1035c0  HGBMDFilmGen5::Encode::Encode(SceneColorimetry)     [C1]  __ZN13HGBMDFilmGen56EncodeC1ENS_16SceneColorimetryE — tail-jmp to C2
//   @Helium 0x1035d0  HGBMDFilmGen5::Encode::~Encode()                     [D2]  __ZN13HGBMDFilmGen56EncodeD2Ev
//   @Helium 0x103620  HGBMDFilmGen5::Encode::~Encode()                     [D1]  __ZN13HGBMDFilmGen56EncodeD1Ev
//   @Helium 0x103670  HGBMDFilmGen5::Encode::~Encode()                     [D0]  __ZN13HGBMDFilmGen56EncodeD0Ev
//   @Helium 0x1036d0  HGBMDFilmGen5::Encode::GetOutput(HGRenderer*)              __ZN13HGBMDFilmGen56Encode9GetOutputEP10HGRenderer
//   @Helium 0x3d1930  HGBMDFilmGen5::Encode::sourceToWideGamut                   __ZN13HGBMDFilmGen56Encode17sourceToWideGamutE  [static data]
//
// VTABLE:
//   Ctor @0x103525 emits `leaq 0x915b94(%rip), %rax` which resolves to
//   (0x103525 + 7) + 0x915b94 = 0x10352c + 0x915b94 = 0xa190c0 — this
//   is the "installed pointer" for `HGBMDFilmGen5::Encode` (vtable-base
//   + 0x10 per Itanium ABI). D2/D1/D0 reinstall the same 0xa190c0 via
//   `leaq 0x915ae0/0x915a90/0x915a40(%rip), %rax` (different
//   displacements chosen so RIP+disp == 0xa190c0).
//
// CTOR ARG ORDER (from `movl %esi,%r14d` @0x10351a):
//   rdi = this
//   esi = colorimetry (HGBMDFilmGen5::SceneColorimetry enum, u32;
//         captured into r14d)
//   (no EI arg — this is BMD Film Gen 5, not ARRI LogC.)
//
// STRUCT LAYOUT (recovered from C2 + GetOutput):
//   HGBMDFilmGen5::Encode extends HGNode (base ctor @0x103520). Subclass
//   fields:
//     0x198 : HGColorMatrix*      matrix           (allocated @0x10352f/0x10353f, 0x1F0 bytes)
//     0x1a0 : HgcLogVideo_encode* compositor        (allocated @0x10354b/0x10355b, 0x1A0 bytes)
//     0x1a8 : const void*         matrixSrcRow     (pointer into sourceToWideGamut,
//                                                    offset = colorimetry * 0x40)
//   sizeof = 0x1b0 (aligned up from 0x1b0). Ctor stores nothing past
//   0x1a8 — unlike HGARRILogC::Encode which stores 6 more f32
//   coefficients @0x1b0..0x1c8. This is confirmed by the C2 disasm
//   ending immediately after the `movq %rcx, 0x1a8(%rbx)` store; no
//   further writes to `%rbx` follow.
//
// STATIC DATA:
//   `sourceToWideGamut` @0x3d1930 (2 × 0x40 = 128 bytes, 2 × 4×4
//   row-major float32 matrices, indexed by `colorimetry` ∈ {0,1}).
//   Size confirmed by the next static symbol
//   `HGCanonLog::Encode::sourceToCinemaGamut` starting at 0x3d19b0 →
//   0x80 bytes for this table.
//   Values below are byte-exact against the Helium x86_64 slice.
//
// GETOUTPUT (@0x1036d0..0x103791) — rendering-graph wiring:
//   1) input = renderer.GetInput(this, 0)                           @0x1036e9
//   2) matrix.vtable[0x78](0, input)      // SetInput slot 0        @0x1036f9
//   3) matrix.LoadMatrix(this.matrixSrcRow, /*transpose=*/true)     @0x10370f
//   4) compositor.vtable[0x78](0, matrix)  // SetInput slot 0       @0x103727
//   5) compositor.vtable[0x60](0, xmm0=0.9, xmm1=0.005494072,
//                              xmm2=0.06025442, xmm3=0.53001332)    @0x103756
//   6) compositor.vtable[0x60](1, xmm0=7.4552455, xmm1=0.09246575,
//                              xmm2=0.005555556, xmm3=0.0)          @0x103783
//   7) return this.compositor                                        @0x103786
//
// The 8 SetParameter fp32 constants are all read RIP-relative from
// Helium.__const at 0x3d0fe8..0x3d1000 (contiguous 4-byte slots). Full
// resolution table (all bit-exact fp32 reads):
//     @Helium 0x3d0fec = 0.8999999761581421f  (float32 representation of 0.9)
//     @Helium 0x3d0ff0 = 0.005494072567671537f
//     @Helium 0x3d0ff4 = 0.060254424810409546f
//     @Helium 0x3d0ff8 = 0.5300133228302002f
//     @Helium 0x3d0ffc = 7.455245494842529f
//     @Helium 0x3d1000 = 0.09246575087308884f
//     @Helium 0x3d0fe8 = 0.0055555556900799274f
//   The three that reappear from the inverse LUT
//   (HGBMDFilmGen5LinearizationLUTInfo.ts) confirm this is the BMD
//   Film Gen 5 camera-log formula's forward coefficients:
//     • K6=-0.5300133 in the decoder ⇒ +0.5300133 emitted here
//       (the encode-side additive term used inside the log's inner
//       expression).
//     • K8=-0.005494072 in the decoder ⇒ +0.005494072 emitted here
//       (the encode-side additive/offset term).
//     • K4=-0.09246575 in the decoder ⇒ +0.09246575 emitted here
//       (linear-region additive term).
//     • K9=0.9 (final divisor) in the decoder ⇒ 0.9 emitted here too
//       (segment-2 xmm0 in HGACEScct::Encode's twin plays the same
//       role — the shared "final scale" fed into HgcLogVideo_encode).
//   The remaining constants (0.06025442, 0.005555556, 7.4552455) are
//   the forward-direction reciprocals / rescaled slopes derived from
//   the same spec, but their algebraic decomposition is a property of
//   the HgcLogVideo_encode segmented-log shader (undecoded), not of
//   this file — we ship them byte-exact as the binary loads them.
//
// UNDECODED CALLEES (throw-stubs per PORTING_SPEC.md rule 3):
//   HgcLogVideo_encode::HgcLogVideo_encode()  __ZN18HgcLogVideo_encodeC1Ev — invoked @0x10355b
//   HGColorMatrix::HGColorMatrix()            __ZN13HGColorMatrixC1Ev      — invoked @0x10353f
//   HGColorMatrix::LoadMatrix(...)            __ZN13HGColorMatrix10LoadMatrixEPKDv4_fb — invoked @0x10370f
//   HGObject::operator new(unsigned long)     __ZN8HGObjectnwEm            — invoked @0x103534 / @0x103550
//   HGObject::operator delete(void*)          __ZN8HGObjectdlEPv           — invoked @0x1036b8 (D0 tail-jmp)
//   HGRenderer::GetInput(HGNode*, int)        __ZN10HGRenderer8GetInputEP6HGNodei — invoked @0x1036e9
//   HgcLogVideo_encode/HGColorMatrix vtable slots *0x18 (Release),
//                                             *0x60 (SetParameter),
//                                             *0x78 (SetInput).
//   (HGNode ctor/dtor ARE ported and imported from ./HGNode.js.)

import { HGNode } from './HGNode.js';

// ---------------------------------------------------------------------------
// Placeholders for helper classes touched by this node but not yet ported.
// Each interface exposes only the vtable slots we actually invoke, and each
// helper raises loudly (rule 3: no silent fill-in) — see the per-function
// citations for the exact @0xADDR each one is deferring.
// ---------------------------------------------------------------------------

/**
 * Placeholder for `HGRenderer` used by GetOutput's signature. Not yet
 * transcribed — see raw-port/army/ledger for HGRenderer.
 * The only method invoked here is `GetInput(HGNode*, int) -> HGNode*`
 * at @Helium 0x1036e9.
 */
export interface HGRendererStub {
  /** @Helium 0x1036e9 — vcalled. Signature `GetInput(HGNode*, int) -> HGNode*`. */
  GetInput(node: HGNode, idx: number): HGNode;
}

/**
 * Placeholder for the color-matrix node owned at `this.matrix`
 * (`+0x198`). Undecoded — exposes only the vtable slots we call.
 *
 *   - `SetInput(idx, input)` via slot *0x78 — invoked @0x1036f9 with (0, input).
 *   - `LoadMatrix(mat, transpose)`         — invoked @0x10370f with (this.matrixSrcRow, true).
 *      Mangled __ZN13HGColorMatrix10LoadMatrixEPKDv4_fb — the second arg
 *      is a bool (edx=1) and the first is a pointer to a 4-float vector
 *      array (a 4×4 row-major float32 matrix in this call site).
 *   - `Release()` via slot *0x18 — invoked from all three dtors.
 */
export interface HGColorMatrix {
  /** vtable *0x78 @Helium — @0x1036f9. Argument order (esi=idx, rdx=input). */
  SetInput(idx: number, input: HGNode): void;
  /**
   * Non-vtable direct call to `HGColorMatrix::LoadMatrix(...)`.
   * @Helium 0x10370f with edx=1 (transpose).
   */
  LoadMatrix(matrix: readonly number[], transpose: boolean): void;
  /** vtable *0x18 @Helium — invoked from D0/D1/D2 (@0x1035f2, 0x103642, 0x103692). */
  Release(): void;
}

/**
 * Placeholder for the segmented log-video encoder owned at
 * `this.compositor` (`+0x1a0`). Undecoded — exposes only the vtable
 * slots we call.
 *
 *   - `SetInput(idx, input)` via slot *0x78 — invoked @0x103727 with (0, matrix).
 *   - `SetParameter(idx, xmm0, xmm1, xmm2, xmm3)` via slot *0x60
 *          — invoked @0x103756 with (0, 0.9, 0.005494072, 0.060254425, 0.53001332)
 *          — invoked @0x103783 with (1, 7.4552455, 0.09246575, 0.0055555557, 0.0)
 *   - `Release()` via slot *0x18 — invoked from all three dtors
 *          (@0x103604, 0x103654, 0x1036a4).
 */
export interface HgcLogVideo_encode {
  /** vtable *0x78 @Helium — @0x103727. */
  SetInput(idx: number, input: HGNode): void;
  /** vtable *0x60 @Helium — argument order (esi, xmm0, xmm1, xmm2, xmm3). */
  SetParameter(idx: number, a: number, b: number, c: number, d: number): void;
  /** vtable *0x18 @Helium — invoked from dtors. */
  Release(): void;
}

/**
 * Placeholder for the compositor allocation + ctor sequence @Helium
 * 0x10354b..0x10355b:
 *   0x10354b  movl  $0x1a0,%edi                     ; alloc size = 0x1A0 = 416
 *   0x103550  callq __ZN8HGObjectnwEm               ; HGObject::operator new
 *   0x10355b  callq __ZN18HgcLogVideo_encodeC1Ev    ; placement ctor
 * Throws until the class is transcribed (rule 3).
 */
function newHgcLogVideo_encode(): HgcLogVideo_encode {
  throw new Error(
    "HGBMDFilmGen5::Encode: HgcLogVideo_encode ctor + HGObject::operator new @Helium 0x103550/0x10355b not yet transcribed"
  );
}

/**
 * Placeholder for the color-matrix allocation + ctor sequence @Helium
 * 0x10352f..0x10353f:
 *   0x10352f  movl  $0x1f0,%edi                     ; alloc size = 0x1F0 = 496
 *   0x103534  callq __ZN8HGObjectnwEm               ; HGObject::operator new
 *   0x10353f  callq __ZN13HGColorMatrixC1Ev         ; placement ctor
 * Throws until the class is transcribed (rule 3).
 */
function newHGColorMatrix(): HGColorMatrix {
  throw new Error(
    "HGBMDFilmGen5::Encode: HGColorMatrix ctor + HGObject::operator new @Helium 0x103534/0x10353f not yet transcribed"
  );
}

// ---------------------------------------------------------------------------
// Static data: `HGBMDFilmGen5::Encode::sourceToWideGamut` @Helium 0x3d1930.
//
// 2 entries × 0x40 = 128 bytes; each entry is a 4×4 row-major float32
// matrix (source RGB → BMD Wide Gamut RGB). Indexed by the
// SceneColorimetry enum (0 or 1). Ctor addressing @0x103567..0x103578
// stores `sourceToWideGamut + (colorimetry << 6)` into
// `this.matrixSrcRow (+0x1a8)`; GetOutput then hands that pointer to
// `HGColorMatrix::LoadMatrix` with transpose=true (edx=1). Sizing
// confirmed by the next static symbol
// `__ZN10HGCanonLog6Encode19sourceToCinemaGamutE` beginning at
// 0x3d19b0 = 0x3d1930 + 0x80.
//
// Values below are byte-exact reads from the Helium x86_64 slice at
// file offset 0x3d1930 (VA == file-offset in the thin slice).
// ---------------------------------------------------------------------------

/**
 * `HGBMDFilmGen5::Encode::sourceToWideGamut` @Helium 0x3d1930.
 * `sourceToWideGamut[colorimetry]` is a 16-float row-major 4×4
 * matrix (float32).
 *
 * Row 0 (`colorimetry=0`) and row 1 (`colorimetry=1`) — the last row
 * is `[0, 0, 0, 1]` (an affine matrix carrying a homogeneous
 * coordinate), and the top-left 3×3 is the source-gamut → BMD Wide
 * Gamut transform for that colorimetry mode. The specific colorimetry
 * semantics (Rec.709/Rec.2020/etc.) are declared in
 * `HGBMDFilmGen5::SceneColorimetry`, which is NOT yet decoded — the
 * port carries the raw table data and leaves interpretation to the
 * caller.
 */
export const HGBMDFilmGen5Encode_sourceToWideGamut: readonly (readonly number[])[] = [
  // @Helium 0x3d1930  entry[0] — 16 floats (row-major 4×4)
  [
    Math.fround( 0.6549035906791687), Math.fround( 0.26867973804473877), Math.fround( 0.07641667872667313), Math.fround(0.0),
    Math.fround( 0.04888784512877464), Math.fround( 0.7919847369194031), Math.fround( 0.15912741422653198), Math.fround(0.0),
    Math.fround( 0.03555447235703468), Math.fround( 0.16239237785339355), Math.fround( 0.8020531535148621), Math.fround(0.0),
    Math.fround( 0.0),                 Math.fround( 0.0),                 Math.fround( 0.0),                 Math.fround(1.0),
  ],
  // @Helium 0x3d1970  entry[1] — 16 floats (row-major 4×4)
  [
    Math.fround( 1.0526102781295776), Math.fround(-0.08814693242311478), Math.fround( 0.03553664684295654), Math.fround(0.0),
    Math.fround(-0.020352529361844063), Math.fround( 0.8525060415267944), Math.fround( 0.1678464710712433), Math.fround(0.0),
    Math.fround( 0.024253956973552704), Math.fround( 0.08241141587495804), Math.fround( 0.8933346271514893), Math.fround(0.0),
    Math.fround( 0.0),                Math.fround( 0.0),                Math.fround( 0.0),                Math.fround(1.0),
  ],
] as const;

// ---------------------------------------------------------------------------
// RIP-relative fp32 constants used by GetOutput's two SetParameter calls
// (@0x103756 / @0x103783). Resolved by taking (next-instruction-RIP + disp)
// and reading the four bytes at the resulting VA from the thin Helium
// slice (VA == file offset). All 7 constants live in a contiguous
// Helium.__const pool at 0x3d0fe8..0x3d1004.
// ---------------------------------------------------------------------------

/**
 * xmm0 argument in the FIRST SetParameter call (esi=0, log segment).
 * @Helium `movss 0x2cd8b0(%rip), %xmm0` @0x103734
 *   → target = 0x10373c + 0x2cd8b0 = @Helium 0x3d0fec.
 * @Helium 0x3d0fec = 0x3f666666 = 0.8999999761581421f (float32 of 0.9).
 * Semantically: the BMD Film Gen 5 forward-encode final scale — same
 * 0.9 constant that appears in HGBMDFilmGen5LinearizationLUTInfo's
 * decoder as K9_final_div (there also 0.9d).
 */
const HGBMDFilmGen5_Encode_get_arg1_xmm0_f32: number = Math.fround(0.8999999761581421);

/**
 * xmm1 argument in the FIRST SetParameter call (esi=0, log segment).
 * @Helium `movss 0x2cd8ac(%rip), %xmm1` @0x10373c
 *   → target = 0x103744 + 0x2cd8ac = @Helium 0x3d0ff0.
 * @Helium 0x3d0ff0 = 0x3bb4079f = 0.005494072567671537f.
 * Semantically: the forward-encode analogue of the decoder's
 * K8_post_exp = -0.005494072432257808d (a tiny bias term inside the
 * log encoder's inner expression).
 */
const HGBMDFilmGen5_Encode_get_arg1_xmm1_f32: number = Math.fround(0.005494072567671537);

/**
 * xmm2 argument in the FIRST SetParameter call (esi=0, log segment).
 * @Helium `movss 0x2cd8a8(%rip), %xmm2` @0x103744
 *   → target = 0x10374c + 0x2cd8a8 = @Helium 0x3d0ff4.
 * @Helium 0x3d0ff4 = 0x3d76cd58 = 0.060254424810409546f.
 * Semantically: forward-encode slope constant fed into the segmented
 * log shader; its algebraic relationship to the decoder's exp-branch
 * gain (K7_exp_div = 0.08692876065491224d) is a property of
 * HgcLogVideo_encode (undecoded) — we ship the byte-exact value.
 */
const HGBMDFilmGen5_Encode_get_arg1_xmm2_f32: number = Math.fround(0.060254424810409546);

/**
 * xmm3 argument in the FIRST SetParameter call (esi=0, log segment).
 * @Helium `movss 0x2cd8a4(%rip), %xmm3` @0x10374c
 *   → target = 0x103754 + 0x2cd8a4 = @Helium 0x3d0ff8.
 * @Helium 0x3d0ff8 = 0x3f07aef4 = 0.5300133228302002f.
 * Semantically: forward-encode analogue of the decoder's
 * K6_exp_add = -0.5300133392291939d — same magnitude, opposite sign
 * (encode adds where decode subtracts, per the log-formula symmetry).
 */
const HGBMDFilmGen5_Encode_get_arg1_xmm3_f32: number = Math.fround(0.5300133228302002);

/**
 * xmm0 argument in the SECOND SetParameter call (esi=1, linear segment).
 * @Helium `movss 0x2cd891(%rip), %xmm0` @0x103763
 *   → target = 0x10376b + 0x2cd891 = @Helium 0x3d0ffc.
 * @Helium 0x3d0ffc = 0x40ee915f = 7.455245494842529f.
 * Semantically: forward-encode slope for the linear segment; its
 * algebraic relationship to the decoder's linear-branch divisor
 * K5_lin_div = 8.283605932402494d is a property of the encoder shader
 * (undecoded) — we ship the byte-exact value.
 */
const HGBMDFilmGen5_Encode_get_arg2_xmm0_f32: number = Math.fround(7.455245494842529);

/**
 * xmm1 argument in the SECOND SetParameter call (esi=1, linear segment).
 * @Helium `movss 0x2cd88d(%rip), %xmm1` @0x10376b
 *   → target = 0x103773 + 0x2cd88d = @Helium 0x3d1000.
 * @Helium 0x3d1000 = 0x3dbd5eaf = 0.09246575087308884f.
 * Semantically: forward-encode analogue of the decoder's
 * K4_lin_add = -0.09246575342465753d (same magnitude, opposite sign).
 */
const HGBMDFilmGen5_Encode_get_arg2_xmm1_f32: number = Math.fround(0.09246575087308884);

/**
 * xmm2 argument in the SECOND SetParameter call (esi=1, linear segment).
 * @Helium `movss 0x2cd86d(%rip), %xmm2` @0x103773
 *   → target = 0x10377b + 0x2cd86d = @Helium 0x3d0fe8.
 * @Helium 0x3d0fe8 = 0x3bb60b61 = 0.0055555556900799274f.
 * Semantically: a small scale in the linear-segment SetParameter row
 * (~1/180). Sole appearance — no direct decoder counterpart.
 */
const HGBMDFilmGen5_Encode_get_arg2_xmm2_f32: number = Math.fround(0.0055555556900799274);

// ---------------------------------------------------------------------------
// SceneColorimetry — HGBMDFilmGen5::SceneColorimetry placeholder.
// ---------------------------------------------------------------------------

/**
 * SceneColorimetry enum placeholder — the underlying enum's meanings
 * (Rec.709 vs Rec.2020 vs …) are not yet decoded. Ctor accepts a
 * `number` here (u32 in the C++ signature); we DO NOT bound-check or
 * remap it — the disasm doesn't either, and the raw value indexes
 * `sourceToWideGamut` directly.
 */
export type HGBMDFilmGen5Encode_SceneColorimetry = number;

// ---------------------------------------------------------------------------
// The class.
// ---------------------------------------------------------------------------

/**
 * `HGBMDFilmGen5::Encode` — Helium HGNode subclass. Wraps a color-matrix
 * stage (source-gamut → BMD Wide Gamut) followed by an
 * HgcLogVideo_encode compositor configured for the BMD Film Gen 5
 * forward transfer function.
 *
 * @Helium ctors     @0x103510 (C2) / @0x1035c0 (C1);
 *         dtors     @0x1035d0 (D2) / @0x103620 (D1) / @0x103670 (D0);
 *         GetOutput @0x1036d0.
 */
export class HGBMDFilmGen5Encode extends HGNode {
  /**
   * Owned `HGColorMatrix`. Field @0x198.
   * Assigned in ctor @0x103544: `movq %r15, 0x198(%rbx)`.
   */
  matrix: HGColorMatrix | null;

  /**
   * Owned `HgcLogVideo_encode` compositor. Field @0x1a0.
   * Assigned in ctor @0x103560: `movq %r15, 0x1a0(%rbx)`.
   */
  compositor: HgcLogVideo_encode | null;

  /**
   * Pointer into `HGBMDFilmGen5Encode_sourceToWideGamut` at
   * `[colorimetry]`. Field @0x1a8.
   * Assigned in ctor @0x103578: `movq %rcx, 0x1a8(%rbx)`, where rcx
   * was set to `sourceToWideGamut + (colorimetry<<6)` at
   * @0x10356e..0x103575.
   */
  matrixSrcRow: readonly number[];

  /**
   * `HGBMDFilmGen5::Encode::Encode(SceneColorimetry colorimetry)` —
   * Helium @0x103510 (C2 base-object ctor). C1 @0x1035c0 tail-jmps to
   * C2 so only C2's body needs modelling.
   *
   * Verbatim asm (@0x103510..0x103589, prologue/epilogue elided):
   *   0x10351a  movl  %esi, %r14d                     ; r14d = colorimetry
   *   0x10351d  movq  %rdi, %rbx                      ; rbx  = this
   *   0x103520  callq __ZN6HGNodeC2Ev                 ; base ctor
   *   0x103525  leaq  0x915b94(%rip), %rax            ; = 0xa190c0 (own vtable installed ptr)
   *   0x10352c  movq  %rax, (%rbx)                    ; *this = vtable
   *   0x10352f  movl  $0x1f0, %edi                    ; alloc 0x1F0 for HGColorMatrix
   *   0x103534  callq __ZN8HGObjectnwEm
   *   0x103539  movq  %rax, %r15                      ; r15 = new HGColorMatrix ptr
   *   0x10353c  movq  %rax, %rdi
   *   0x10353f  callq __ZN13HGColorMatrixC1Ev         ; HGColorMatrix::HGColorMatrix()
   *   0x103544  movq  %r15, 0x198(%rbx)               ; this.matrix = new HGColorMatrix
   *   0x10354b  movl  $0x1a0, %edi                    ; alloc 0x1A0 for HgcLogVideo_encode
   *   0x103550  callq __ZN8HGObjectnwEm
   *   0x103555  movq  %rax, %r15                      ; r15 = new HgcLogVideo_encode ptr
   *   0x103558  movq  %rax, %rdi
   *   0x10355b  callq __ZN18HgcLogVideo_encodeC1Ev    ; HgcLogVideo_encode::HgcLogVideo_encode()
   *   0x103560  movq  %r15, 0x1a0(%rbx)               ; this.compositor = new HgcLogVideo_encode
   *   0x103567  movl  %r14d, %eax                     ; eax = colorimetry
   *   0x10356a  shlq  $0x6, %rax                      ; rax = colorimetry * 0x40
   *   0x10356e  leaq  sourceToWideGamut(%rip),%rcx
   *   0x103575  addq  %rax, %rcx
   *   0x103578  movq  %rcx, 0x1a8(%rbx)               ; this.matrixSrcRow = &table[colorimetry]
   *   0x10357f..0x103589  epilogue, retq.
   *
   * The exception-cleanup path @0x10358a..0x1035b7 handles a throwing
   * HgcLogVideo_encode ctor or HGObject::operator new: it deletes the
   * partially-constructed compositor pointer (r15) via
   * `HGObject::operator delete`, calls `HGNode::~HGNode()`, and
   * resumes the unwind. It never executes on a successful construction
   * and is not modelled explicitly (TS exceptions unwind through the
   * stack naturally).
   *
   * @param colorimetry  HGBMDFilmGen5::SceneColorimetry (u32; NOT
   *                     bounds-checked; indexes `sourceToWideGamut`;
   *                     the disasm doesn't check either, so neither
   *                     do we).
   */
  constructor(colorimetry: HGBMDFilmGen5Encode_SceneColorimetry) {
    // @Helium 0x103520: HGNode base ctor.
    super();
    // @Helium 0x10352c: install this class's vtable (installed ptr = 0xa190c0).
    this.vtable = 0xa190c0;
    // @Helium 0x10352f..0x103544: alloc + ctor HGColorMatrix, store @0x198.
    // Throws until HGColorMatrix is transcribed.
    this.matrix = newHGColorMatrix();
    // @Helium 0x10354b..0x103560: alloc + ctor HgcLogVideo_encode, store @0x1a0.
    // Throws until HgcLogVideo_encode is transcribed.
    this.compositor = newHgcLogVideo_encode();
    // @Helium 0x103567..0x103578: matrixSrcRow = &sourceToWideGamut[colorimetry]
    // (the << 6 is a 64-byte stride pointing at the head of each 4×4 f32 matrix).
    this.matrixSrcRow = HGBMDFilmGen5Encode_sourceToWideGamut[colorimetry];
  }

  /**
   * `HGBMDFilmGen5::Encode::~Encode()` — Helium @0x1035d0 (D2, base) /
   * @0x103620 (D1, complete) / @0x103670 (D0, deleting).
   *
   * All three share the same body up through the base-dtor tail-call;
   * D0 additionally tail-calls `HGObject::operator delete`.
   *
   * D2 @0x1035d0 verbatim:
   *   0x1035d9  leaq  0x915ae0(%rip), %rax   ; = 0xa190c0 (reinstall own vtable)
   *   0x1035e0  movq  %rax, (%rdi)
   *   0x1035e3  movq  0x198(%rdi), %rdi      ; matrix
   *   0x1035ea  testq %rdi, %rdi ; je 0x1035f5
   *   0x1035ef  movq  (%rdi), %rax ; callq *0x18(%rax) ; matrix.Release()
   *   0x1035f5  movq  0x1a0(%rbx), %rdi      ; compositor
   *   0x1035fc  testq %rdi, %rdi ; je 0x103607
   *   0x103601  movq  (%rdi), %rax ; callq *0x18(%rax) ; compositor.Release()
   *   0x103607..0x103610  jmp __ZN6HGNodeD2Ev   ; tail-call HGNode base dtor
   *
   * D1 @0x103620 is byte-identical to D2 except the vtable-reload
   * leaq displacement (`leaq 0x915a90(%rip),%rax` @0x103629 — same
   * target 0xa190c0 with a different displacement because the leaq
   * RIP is different).
   *
   * D0 @0x103670 differs from D2 in that after the HGNode dtor the
   * epilogue tail-jmps `__ZN8HGObjectdlEPv` to free `this` via
   * `HGObject::operator delete`; the base-dtor call is a `callq`
   * (not `jmp`) so the delete can follow it.
   *
   * We model D0's operator-delete step at the JS caller (dropping the
   * reference) — TS has no explicit `delete this`.
   */
  destruct(): void {
    // @Helium 0x1035e0/0x103630/0x103680: vtable reinstall — modeled by assignment.
    this.vtable = 0xa190c0;
    // @Helium 0x1035e3..0x1035f2 (D2): release matrix if present.
    if (this.matrix != null) {
      this.matrix.Release();
      this.matrix = null;
    }
    // @Helium 0x1035f5..0x103604 (D2): release compositor if present.
    if (this.compositor != null) {
      this.compositor.Release();
      this.compositor = null;
    }
    // @Helium 0x103610 (D2) / 0x103660 (D1): jmp HGNode::~HGNode(). D0
    // uses callq @0x1036aa and then tail-jmps to HGObject::operator
    // delete @0x1036b8 (handled by the caller dropping the reference
    // in TS).
    super.destruct();
  }

  /**
   * `HGBMDFilmGen5::Encode::GetOutput(HGRenderer* renderer)` — Helium
   * @0x1036d0.
   *
   * Wires the owned matrix + compositor into the render graph:
   *   1) fetch this node's input at slot 0
   *   2) hand it to the matrix as input slot 0    (matrix.SetInput slot *0x78)
   *   3) load the source→WideGamut matrix (transposed) (matrix.LoadMatrix)
   *   4) hand the matrix into the compositor      (compositor.SetInput slot *0x78)
   *   5) SetParameter(0, 0.9, 0.005494072, 0.06025442, 0.53001332)  (LOG segment,    slot *0x60)
   *   6) SetParameter(1, 7.4552455, 0.09246575, 0.0055555557, 0.0)  (LINEAR segment, slot *0x60)
   *   7) return the compositor.
   *
   * Verbatim asm (@0x1036d0..0x103791, prologue/epilogue elided):
   *   0x1036da  movq  0x198(%rdi), %r14           ; r14 = this.matrix
   *   0x1036e1  movq  %rsi, %rdi                  ; rdi = renderer
   *   0x1036e4  movq  %rbx, %rsi                  ; rsi = this
   *   0x1036e7  xorl  %edx, %edx
   *   0x1036e9  callq __ZN10HGRenderer8GetInputEP6HGNodei ; input = renderer.GetInput(this, 0)
   *   0x1036ee  movq  (%r14), %rcx                ; rcx = matrix.vtable
   *   0x1036f1  movq  %r14, %rdi                  ; rdi = matrix
   *   0x1036f4  xorl  %esi, %esi
   *   0x1036f6  movq  %rax, %rdx                  ; rdx = input
   *   0x1036f9  callq *0x78(%rcx)                 ; matrix.SetInput(0, input)
   *   0x1036fc  movq  0x198(%rbx), %rdi           ; rdi = this.matrix
   *   0x103703  movq  0x1a8(%rbx), %rsi           ; rsi = this.matrixSrcRow
   *   0x10370a  movl  $0x1, %edx                  ; edx = 1 (transpose)
   *   0x10370f  callq __ZN13HGColorMatrix10LoadMatrixEPKDv4_fb
   *                                                ; matrix.LoadMatrix(matrixSrcRow, true)
   *   0x103714  movq  0x198(%rbx), %rdx           ; rdx = this.matrix (input for next stage)
   *   0x10371b  movq  0x1a0(%rbx), %rdi           ; rdi = this.compositor
   *   0x103722  movq  (%rdi), %rax                ; rax = compositor.vtable
   *   0x103725  xorl  %esi, %esi
   *   0x103727  callq *0x78(%rax)                 ; compositor.SetInput(0, matrix)
   *   0x10372a  movq  0x1a0(%rbx), %rdi           ; rdi = this.compositor
   *   0x103731  movq  (%rdi), %rax                ; rax = compositor.vtable
   *   0x103734  movss 0x2cd8b0(%rip), %xmm0       ; xmm0 = 0.8999999f  @Helium 0x3d0fec
   *   0x10373c  movss 0x2cd8ac(%rip), %xmm1       ; xmm1 = 0.005494072f @Helium 0x3d0ff0
   *   0x103744  movss 0x2cd8a8(%rip), %xmm2       ; xmm2 = 0.060254425f @Helium 0x3d0ff4
   *   0x10374c  movss 0x2cd8a4(%rip), %xmm3       ; xmm3 = 0.53001332f  @Helium 0x3d0ff8
   *   0x103754  xorl  %esi, %esi
   *   0x103756  callq *0x60(%rax)                 ; compositor.SetParameter(0, 0.9, ..., ..., ...)
   *   0x103759  movq  0x1a0(%rbx), %rdi           ; rdi = this.compositor
   *   0x103760  movq  (%rdi), %rax                ; rax = compositor.vtable
   *   0x103763  movss 0x2cd891(%rip), %xmm0       ; xmm0 = 7.4552455f   @Helium 0x3d0ffc
   *   0x10376b  movss 0x2cd88d(%rip), %xmm1       ; xmm1 = 0.09246575f  @Helium 0x3d1000
   *   0x103773  movss 0x2cd86d(%rip), %xmm2       ; xmm2 = 0.0055555557f @Helium 0x3d0fe8
   *   0x10377b  xorps %xmm3, %xmm3                ; xmm3 = 0.0f
   *   0x10377e  movl  $0x1, %esi
   *   0x103783  callq *0x60(%rax)                 ; compositor.SetParameter(1, 7.4552, 0.0925, 0.00556, 0.0)
   *   0x103786  movq  0x1a0(%rbx), %rax           ; rax = this.compositor
   *   0x10378d..0x103791  epilogue, retq.
   *
   * @param renderer  the containing HGRenderer (undecoded — only
   *                  `GetInput` is invoked here).
   * @returns         the compositor node this class wraps (i.e. the
   *                  output of this filter in the graph).
   */
  GetOutput(renderer: HGRendererStub): HGNode {
    // @Helium 0x1036da: r14 = this.matrix. Invariant: non-null after ctor.
    const matrix = this.matrix;
    const comp = this.compositor;
    if (matrix == null || comp == null) {
      // C++ path where this is unreachable — but TS type-narrowing
      // wants the null guard, and a loud fault is preferable to `!`
      // (rule 3).
      throw new Error(
        "HGBMDFilmGen5::Encode::GetOutput @Helium 0x1036da — matrix or compositor null (should be unreachable after ctor)"
      );
    }
    // @Helium 0x1036e9: input = renderer.GetInput(this, 0)
    const input = renderer.GetInput(this, 0);
    // @Helium 0x1036f9: matrix.SetInput(0, input) via vtable *0x78
    matrix.SetInput(0, input);
    // @Helium 0x10370f: matrix.LoadMatrix(this.matrixSrcRow, /*transpose=*/true)
    matrix.LoadMatrix(this.matrixSrcRow, true);
    // @Helium 0x103727: compositor.SetInput(0, matrix) via vtable *0x78
    comp.SetInput(0, matrix as unknown as HGNode);
    // @Helium 0x103756: compositor.SetParameter(0, 0.9, 0.005494072, 0.06025442, 0.53001332) — LOG segment.
    comp.SetParameter(
      0,
      HGBMDFilmGen5_Encode_get_arg1_xmm0_f32,
      HGBMDFilmGen5_Encode_get_arg1_xmm1_f32,
      HGBMDFilmGen5_Encode_get_arg1_xmm2_f32,
      HGBMDFilmGen5_Encode_get_arg1_xmm3_f32,
    );
    // @Helium 0x103783: compositor.SetParameter(1, 7.4552455, 0.09246575, 0.0055555557, 0.0f) — LINEAR segment.
    comp.SetParameter(
      1,
      HGBMDFilmGen5_Encode_get_arg2_xmm0_f32,
      HGBMDFilmGen5_Encode_get_arg2_xmm1_f32,
      HGBMDFilmGen5_Encode_get_arg2_xmm2_f32,
      Math.fround(0.0),
    );
    // @Helium 0x103786: return this.compositor (cast to HGNode by C++ inheritance).
    return comp as unknown as HGNode;
  }
}
