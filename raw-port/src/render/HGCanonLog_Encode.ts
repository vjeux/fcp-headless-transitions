// raw-port/src/render/HGCanonLog_Encode.ts
//
// FCP `HGCanonLog::Encode` — Helium HGNode subclass. Wraps an owned Canon-Log
// compositor (`HgcCanonLog_encode` for CL1/CL2, `HgcCanonLog3_encode` for CL3)
// and optionally an `HGColorMatrix` for source-primary → cinema-gamut / Rec.2020
// → Rec.709 pre-conversion. Configures the compositor's log-region SetParameter
// slot with per-encoding coefficients selected by (LogEncoding, CodeValueNorm)
// enums — implementing Canon Log 1 / 2 / 3 forward encoding (linear scene →
// log-encoded video).
//
// FRAMEWORK: Helium.framework
// FAT slice offset: 0x4000; thin binary /tmp/Helium.x86_64 has VA == file
// offset (segment __TEXT vmaddr = 0). Constants read via
// `raw-port/army/tools/resolve.py Helium const 0x…` and direct bit-exact
// reads from /tmp/Helium.x86_64 at file-offset == VA.
//
// DISASSEMBLY:
//   raw-port/re/disasm/Helium.HGCanonLog.Encode.C2.s        (0x1037a0 base-object ctor)
//   raw-port/re/disasm/Helium.HGCanonLog.Encode::Encode.s   (0x1038e0 C1 tail-jmp to C2)
//   raw-port/re/disasm/Helium.HGCanonLog.Encode.D2Ev.s      (0x1038f0 D2)
//   raw-port/re/disasm/Helium.HGCanonLog.Encode.D1Ev.s      (0x103940 D1)
//   raw-port/re/disasm/Helium.HGCanonLog.Encode.D0Ev.s      (0x103990 D0)
//   raw-port/re/disasm/Helium.HGCanonLog.Encode::GetOutput.s (0x1039f0)
//
// SYMBOLS:
//   @Helium 0x1037a0  HGCanonLog::Encode::Encode(SceneColorimetry, LogEncoding, LogColorimetry, CodeValueNormalization)   [C2]  __ZN10HGCanonLog6EncodeC2ENS_16SceneColorimetryENS_11LogEncodingENS_14LogColorimetryENS_22CodeValueNormalizationE
//   @Helium 0x1038e0  HGCanonLog::Encode::Encode(...)                                                                    [C1 — tail-jmp to C2]  __ZN10HGCanonLog6EncodeC1E...
//   @Helium 0x1038f0  HGCanonLog::Encode::~Encode()                                                                       [D2]  __ZN10HGCanonLog6EncodeD2Ev
//   @Helium 0x103940  HGCanonLog::Encode::~Encode()                                                                       [D1]  __ZN10HGCanonLog6EncodeD1Ev
//   @Helium 0x103990  HGCanonLog::Encode::~Encode()                                                                       [D0]  __ZN10HGCanonLog6EncodeD0Ev
//   @Helium 0x1039f0  HGCanonLog::Encode::GetOutput(HGRenderer*)                                                          __ZN10HGCanonLog6Encode9GetOutputEP10HGRenderer
//
// VTABLE:
//   __ZTVN10HGCanonLog6EncodeE @Helium 0xa192f0. Installed pointer =
//   0xa19300 (= vtable base + 0x10 per Itanium ABI).
//   Ctor install @0x1037c2:  leaq 0x915b37(%rip),%rax  ; rip = 0x1037c9 → 0xa19300
//   D2   reinstall @0x1038f9: leaq 0x915a00(%rip),%rax ; rip = 0x103900 → 0xa19300
//   D1   reinstall @0x103949: leaq 0x9159b0(%rip),%rax ; rip = 0x103950 → 0xa19300
//   D0   reinstall @0x103999: leaq 0x915960(%rip),%rax ; rip = 0x1039a0 → 0xa19300
//
// STRUCT LAYOUT (recovered from C2 @0x1037a0 + GetOutput @0x1039f0):
//   HGCanonLog::Encode extends HGNode (base ctor @0x1037bd, so HGNode occupies
//   offsets 0x00..0x197 per raw-port/src/render/HGNode.ts). This subclass adds:
//     0x198 : HGColorMatrix*   colorMatrix        (optional; alloc-and-init at ctor
//                                                  0x103839/0x10386e when LogColorimetry
//                                                  == 1 OR when LogColorimetry == 0 &&
//                                                  SceneColorimetry == 1. NULL-init
//                                                  @0x1037cc for all other cases.)
//     0x1a0 : HgcCanonLog_encode* | HgcCanonLog3_encode*  compositor
//                                                  (alloc @0x1037e2 [size 0x1a0] +
//                                                   HgcCanonLog3_encode ctor
//                                                   @0x1037ed when LogEncoding == 2 =
//                                                   CanonLog3; else alloc @0x1037f9 +
//                                                   HgcCanonLog_encode ctor @0x103804
//                                                   for CanonLog1 / CanonLog2.
//                                                   Store @0x103809.)
//     0x1a8 : float const (*matrix)[4][4]         (RGB→RGB 4×4 color-primary matrix
//                                                   pointer; NULL-init @0x103810. Set
//                                                   to sourceToCinemaGamut[SceneCol]
//                                                   @0x10388c when LogColorimetry == 1;
//                                                   set to HGColorGamma::rec2020RGBTo
//                                                   Rec709RGB (0x3cfd70) @0x10388c when
//                                                   LogColorimetry == 0 &&
//                                                   SceneColorimetry == 1.)
//     0x1b0 : u32 LogEncoding                     (0=CanonLog1, 1=CanonLog2, 2=CanonLog3;
//                                                  store @0x10381b from r13d.)
//     0x1b4 : u32 CodeValueNormalization          (0=full-range, non-zero=narrow-range;
//                                                  store @0x103822 from r12d.)
//   Total sizeof: at least 0x1b8. No further fields touched by any decoded entry
//   point. (GetOutput @0x1039f0 reads exactly 0x198, 0x1a0, 0x1a8, 0x1b0, 0x1b4.)
//
// STATIC DATA (framework globals — NOT per-instance):
//   __ZN10HGCanonLog6Encode19sourceToCinemaGamutE @Helium 0x3d19b0
//     4×4 float matrix table[4] (0x100 bytes total; 0x40 stride) indexed by
//     SceneColorimetry ∈ {0,1,2,3}. Row 4 is (0,0,0,1) in every row for all four
//     entries; rows 1..3 are the actual color-primary rotation. Direct bit-exact
//     read from /tmp/Helium.x86_64 @0x3d19b0..0x3d1ab0:
//       idx 0 @0x3d19b0 row0 = (0.5561574697, 0.3291746080, 0.1146679074, 0.0)
//                       row1 = (0.0824132562, 0.7574697733, 0.1601169556, 0.0)
//                       row2 = (0.0331044719, 0.2258119583, 0.7410835624, 0.0)
//                       row3 = (0.0, 0.0, 0.0, 1.0)
//       idx 1 @0x3d19f0 row0 = (0.8804143071, 0.0345676914, 0.0850179791, 0.0)
//                       row1 = (0.0395969972, 0.7936036587, 0.1667993665, 0.0)
//                       row2 = (0.0133934589, 0.1618314236, 0.8247750998, 0.0)
//                       row3 = (0.0, 0.0, 0.0, 1.0)
//       idx 2 @0x3d1a30 row0 = (0.6162455678, 0.2856992781, 0.0980551764, 0.0)
//                       row1 = (0.0504788496, 0.7989925742, 0.1505285650, 0.0)
//                       row2 = (0.0292155724, 0.1603227258, 0.8104616999, 0.0)
//                       row3 = (0.0, 0.0, 0.0, 1.0)
//       idx 3 @0x3d1a70 row0 = (0.9859064221, -0.0483248346, 0.0624184087, 0.0)
//                       row1 = (-0.0184274353, 0.8603751659, 0.1580522805, 0.0)
//                       row2 = (0.0138334259, 0.0829459801, 0.9032205939, 0.0)
//                       row3 = (0.0, 0.0, 0.0, 1.0)
//     (Next symbol at 0x3d1ab0 = `HGNikonNLog::cut`, so the table size is exactly
//      0x100 = 4 matrices, confirming the SceneColorimetry enum has 4 values.)
//
//   __ZN12HGColorGamma21rec2020RGBToRec709RGBE @Helium 0x3cfd70  4×4 float matrix.
//     Values transcribed byte-exact below as HGCanonLog_Encode_rec2020RGBToRec709RGB.
//
// RIP-RELATIVE CONSTANTS in GetOutput @0x1039f0 (all decoded via file-offset ==
// VA reads on /tmp/Helium.x86_64). Each 2-slot table is indexed via
// `eax = (field_1b4 == 0) ? 4 : 0` — i.e. FULL-range (norm==0) selects the
// SECOND float, NARROW-range (norm!=0) selects the FIRST float. The pairs are
// [narrow, full]:
//
//   Case A — LogEncoding == 0 (CanonLog1):
//     stack slot at -0x1c(%rbp): base @0x3d0ed0 → [0.12512247, 0.07305970]
//     stack slot at -0x14(%rbp): base @0x3d0ed8 → [0.13639723, 0.15928581]
//     stack slot at -0x18(%rbp): fixed         @0x3d100c = 10.15960026 (Canon Log 1 gain)
//
//   Case B — LogEncoding == 1 (CanonLog2):
//     stack slot at -0x1c(%rbp): base @0x3d0ec0 → [0.09286413, 0.03538813]
//     stack slot at -0x14(%rbp): base @0x3d0ec8 → [0.07265683, 0.08484925]
//     stack slot at -0x18(%rbp): fixed         @0x3d1008 = 87.09937286 (Canon Log 2 gain)
//
//   Case C — LogEncoding == 2 (CanonLog3):
//     stack slot at -0x24(%rbp): base @0x3d0e98 → [0.12783901, 0.07623209]
//     stack slot at -0x20(%rbp): base @0x3d0ea0 → [0.12240537, 0.06988663]
//     stack slot at -0x28(%rbp): base @0x3d0ea8 → [1.97547984, 2.30698156]
//     stack slot at -0x1c(%rbp): base @0x3d0eb0 → [0.12512219, 0.07305936]
//     stack slot at -0x14(%rbp): base @0x3d0eb8 → [0.11055882, 0.12911150]
//     stack slot at -0x18(%rbp): fixed         @0x3d1004 = 14.98324966 (Canon Log 3 gain)
//
//   SetParameter #2 xmm2 (CL3 second call only) fixed @0x3d1010 = 0.014000000f.
//
// SEMANTICS — WHY THIS WIRES CANON LOG N ENCODING:
//   The Canon Log family is a piecewise linear+log OETF:
//     V = a·log10(b·x + c) + d      in the log region
//     V = e·x + f                    in the toe (near-black) region
//   with per-generation (CL1 / CL2 / CL3) coefficients (a,b,c,d,e,f). The gain
//   constants (10.1596 / 87.0994 / 14.9832) are the log-region "b" scale factor
//   from Canon's published Canon Log Data Interpretation Specification. The
//   per-encoding narrow/full-range pairs at 0x3d0e98..0x3d0ed8 are the "d"
//   (offset), "a" (slope), toe-region gain and toe-region offset the underlying
//   compositor consumes via its vtable *0x60 SetParameter slot.
//
//   The two-vs-three SetParameter calls encode the piecewise structure:
//     CL1 / CL2:  1 call, esi=0 (single log segment; toe handled inline)
//     CL3:        2 calls, esi=0 (log region), esi=1 (toe + gain region)
//
//   The upstream HGColorMatrix (if present) applies a source-primary → cinema-
//   gamut rotation before the log encoding (Rec.2020/Rec.709/etc. → Canon Cinema
//   Gamut); for LogColorimetry == 2 that stage is skipped and the log encoder
//   runs on whatever primaries the caller supplies.
//
// GETOUTPUT WIRING (@0x1039f0..0x103c13):
//   1) input   = HGRenderer::GetInput(this, 0)                          @0x103a0d
//   2) if colorMatrix != NULL @0x198:
//        colorMatrix.SetInput(0, input)  (vtable *0x78)                 @0x103a22
//        colorMatrix.LoadMatrix(this.field_1a8 /*float[4]**/, true)     @0x103a38
//        rdx = colorMatrix                                              @0x103a3d
//      else:
//        rdx = input                                                    @0x103a12 (unchanged)
//   3) Prep stack args for the compositor's SetParameter call according
//      to LogEncoding switch — see Case A/B/C above.
//   4) compositor.SetInput(0, {colorMatrix|input})  via vtable *0x78    @0x103b58
//   5) Dispatch via dynamic_cast to concrete compositor type:
//        if LogEncoding == 2: r14 = dynamic_cast<HgcCanonLog3_encode*>()
//                              compositor.SetParameter(0, -0x14, -0x24, -0x20, -0x18) @0x103bdd
//                              compositor.SetParameter(1, -0x28, -0x1c, 0.014, 0.0f)   @0x103c00
//        else:                r14 = dynamic_cast<HgcCanonLog_encode*>()
//                              compositor.SetParameter(0, -0x14, -0x1c, -0x18, 0.0f)   @0x103bb9
//   6) return this.compositor (@0x1a0)                                  @0x103c03
//
// UNDECODED CALLEES (throw-stubs required per PORTING_SPEC.md rule 3):
//   HgcCanonLog_encode  ctor + vtable slots  @Helium __ZN18HgcCanonLog_encodeC1Ev + *0x18/*0x60/*0x78
//   HgcCanonLog3_encode ctor + vtable slots  @Helium __ZN19HgcCanonLog3_encodeC1Ev + *0x18/*0x60/*0x78
//   HGColorMatrix       ctor + LoadMatrix + vtable *0x78/*0x18  @Helium __ZN13HGColorMatrixC1Ev / __ZN13HGColorMatrix10LoadMatrixEPKDv4_fb
//   HGObject::operator new(unsigned long)     @Helium __ZN8HGObjectnwEm  — invoked @0x1037e2/0x1037f9/0x103839/0x10386e
//   HGObject::operator delete(void*)          @Helium __ZN8HGObjectdlEPv — invoked @0x1039d8 (D0)
//   HGRenderer::GetInput(HGNode*, int)        @Helium __ZN10HGRenderer8GetInputEP6HGNodei — invoked @0x103a0d
//   ___dynamic_cast                            invoked @0x103b80 / @0x103b9a (RTTI narrow to concrete compositor)
//   (HGNode ctor/dtor ARE ported and imported from ./HGNode.js.)

import { HGNode } from './HGNode.js';

// ---------------------------------------------------------------------------
// Enums modelling the four ctor parameters. The C++ types are separate enum
// classes in namespace `HGCanonLog`; we replicate the wire values from the
// disassembly (0/1/2 branches on r13d for LogEncoding; 0/1/2 branches on r15d
// for LogColorimetry; SceneColorimetry indexed into a 4-entry matrix table so
// its enum has values 0..3; CodeValueNormalization is only checked for zero
// vs non-zero so its exact enum shape is not observable here).
// ---------------------------------------------------------------------------

/**
 * `HGCanonLog::SceneColorimetry` — first ctor arg. Values 0..3 index the
 * 4-entry `sourceToCinemaGamut` matrix table @Helium 0x3d19b0 (stride 0x40).
 * The enum value is also compared with `$1` @0x103863 to gate a Rec.2020
 * → Rec.709 pre-conversion when LogColorimetry == 0.
 */
export type HGCanonLog_SceneColorimetry = 0 | 1 | 2 | 3;

/**
 * `HGCanonLog::LogEncoding` — second ctor arg. Observed values in the
 * dispatch cascade at ctor @0x1037d7 (`cmpl $2, %r13d`) and GetOutput
 * @0x103a4a..0x103a56 (`cmpl $2, %eax; je …; cmpl $1, %eax; je …;
 * testl %eax, %eax; jne …`): 0 = CanonLog1, 1 = CanonLog2, 2 = CanonLog3.
 */
export type HGCanonLog_LogEncoding = 0 | 1 | 2;

/**
 * `HGCanonLog::LogColorimetry` — third ctor arg. Observed values in the
 * dispatch cascade at ctor @0x103829..0x103832: 0 (rec2020→rec709 optional
 * pre-conv, gated on SceneColorimetry == 1), 1 (source→cinema-gamut
 * pre-conv), 2 (no matrix at all — 0x198 stays null).
 */
export type HGCanonLog_LogColorimetry = 0 | 1 | 2;

/**
 * `HGCanonLog::CodeValueNormalization` — fourth ctor arg. Only compared
 * against zero in GetOutput @0x103a62/@0x103a9d/@0x103add (`cmpl $0,
 * 0x1b4(%rbx); sete %al; shl $2, %eax`), so we model it as a numeric
 * whose observable behaviour is "zero => full-range slot, non-zero =>
 * narrow-range slot" (the sete produces al=1 when equal, then the shl-2
 * multiplies by 4 to skip a f32 slot in the pair table).
 */
export type HGCanonLog_CodeValueNormalization = number;

// ---------------------------------------------------------------------------
// Static framework globals referenced by the ctor. Both are 4×4 float
// matrices stored as row-major 16-float arrays; passed to
// HGColorMatrix::LoadMatrix() in GetOutput. Values transcribed byte-exact
// from /tmp/Helium.x86_64.
// ---------------------------------------------------------------------------

/**
 * @Helium 0x3d19b0 `HGCanonLog::Encode::sourceToCinemaGamut` — array of
 * 4 float32 matrices (stride 0x40 = 16 floats each). Indexed by
 * SceneColorimetry ∈ {0,1,2,3} at ctor @0x103850-0x10385e:
 *   `movl -0x2c(%rbp),%ecx ; shlq $6,%rcx ; leaq sourceToCinemaGamut(%rip),%rax ; addq %rcx,%rax`.
 * Each matrix is a source-primary → Canon Cinema Gamut 3×3 rotation with
 * row-major layout `[r0c0,r0c1,r0c2,0, r1c0,…,0, r2c0,…,0, 0,0,0,1]`.
 */
export const HGCanonLog_Encode_sourceToCinemaGamut: readonly Float32Array[] = [
  // idx 0 @0x3d19b0
  Float32Array.of(
    Math.fround(0.5561574697494507),  Math.fround(0.32917460799217224), Math.fround(0.11466790735721588), Math.fround(0.0),
    Math.fround(0.08241325616836548), Math.fround(0.7574697732925415),  Math.fround(0.16011695563793182), Math.fround(0.0),
    Math.fround(0.03310447186231613), Math.fround(0.22581195831298828), Math.fround(0.741083562374115),   Math.fround(0.0),
    Math.fround(0.0),                 Math.fround(0.0),                 Math.fround(0.0),                 Math.fround(1.0),
  ),
  // idx 1 @0x3d19f0
  Float32Array.of(
    Math.fround(0.8804143071174622),  Math.fround(0.034567691385746),   Math.fround(0.08501797914505005), Math.fround(0.0),
    Math.fround(0.03959699720144272), Math.fround(0.7936036586761475),  Math.fround(0.1667993664741516),  Math.fround(0.0),
    Math.fround(0.013393458910286427),Math.fround(0.16183142364025116), Math.fround(0.8247750997543335),  Math.fround(0.0),
    Math.fround(0.0),                 Math.fround(0.0),                 Math.fround(0.0),                 Math.fround(1.0),
  ),
  // idx 2 @0x3d1a30
  Float32Array.of(
    Math.fround(0.6162455677986145),  Math.fround(0.2856992781162262),  Math.fround(0.09805517643690109),  Math.fround(0.0),
    Math.fround(0.050478849560022354),Math.fround(0.7989925742149353),  Math.fround(0.15052856504917145),  Math.fround(0.0),
    Math.fround(0.029215572401881218),Math.fround(0.16032272577285767), Math.fround(0.810461699962616),    Math.fround(0.0),
    Math.fround(0.0),                 Math.fround(0.0),                 Math.fround(0.0),                  Math.fround(1.0),
  ),
  // idx 3 @0x3d1a70
  Float32Array.of(
    Math.fround(0.9859064221382141),  Math.fround(-0.0483248345553875), Math.fround(0.06241840869188309), Math.fround(0.0),
    Math.fround(-0.01842743530869484),Math.fround(0.860375165939331),   Math.fround(0.15805228054523468), Math.fround(0.0),
    Math.fround(0.0138334259390831),  Math.fround(0.08294598013162613), Math.fround(0.9032205939292908),  Math.fround(0.0),
    Math.fround(0.0),                 Math.fround(0.0),                 Math.fround(0.0),                 Math.fround(1.0),
  ),
];

/**
 * @Helium 0x3cfd70 `HGColorGamma::rec2020RGBToRec709RGB` — 4×4 float32
 * matrix used as the "matrix" argument to HGColorMatrix::LoadMatrix when
 * LogColorimetry == 0 and SceneColorimetry == 1 (see ctor @0x103885).
 * Row-major, stride 4; row 4 = (0,0,0,1) sentinel. Values transcribed
 * byte-exact from /tmp/Helium.x86_64 @0x3cfd70..0x3cfdb0.
 */
export const HGCanonLog_Encode_rec2020RGBToRec709RGB: Float32Array = Float32Array.of(
  Math.fround(1.6604909896850586),    Math.fround(-0.5876411199569702),  Math.fround(-0.07284986227750778), Math.fround(0.0),
  Math.fround(-0.12455044686794281),  Math.fround(1.1328998804092407),   Math.fround(-0.008349433541297913),Math.fround(0.0),
  Math.fround(-0.018150785192847252), Math.fround(-0.10057881474494934), Math.fround(1.1187297105789185),   Math.fround(0.0),
  Math.fround(0.0),                   Math.fround(0.0),                  Math.fround(0.0),                  Math.fround(1.0),
);

// ---------------------------------------------------------------------------
// Per-encoding SetParameter argument tables. Each entry is a fixed pair of
// f32s indexed by CodeValueNormalization (norm==0 → second slot, norm!=0 →
// first slot). Direct bit-exact reads from /tmp/Helium.x86_64.
// ---------------------------------------------------------------------------

/** @Helium 0x3d0ed0 (leaq @0x103a6f) — CanonLog1 stack slot -0x1c pair. */
const HGCanonLog_CL1_slot1c: readonly [number, number] = [
  Math.fround(0.12512247264385223), Math.fround(0.07305970042943954),
];
/** @Helium 0x3d0ed8 (leaq @0x103a80) — CanonLog1 stack slot -0x14 pair. */
const HGCanonLog_CL1_slot14: readonly [number, number] = [
  Math.fround(0.13639722764492035), Math.fround(0.15928581357002258),
];
/** @Helium 0x3d100c (movss @0x103a91) — CanonLog1 stack slot -0x18 constant (log-region gain). */
const HGCanonLog_CL1_slot18: number = Math.fround(10.159600257873535);

/** @Helium 0x3d0ec0 (leaq @0x103aaa) — CanonLog2 stack slot -0x1c pair. */
const HGCanonLog_CL2_slot1c: readonly [number, number] = [
  Math.fround(0.09286412596702576), Math.fround(0.03538812696933746),
];
/** @Helium 0x3d0ec8 (leaq @0x103abb) — CanonLog2 stack slot -0x14 pair. */
const HGCanonLog_CL2_slot14: readonly [number, number] = [
  Math.fround(0.07265683263540268), Math.fround(0.08484924584627151),
];
/** @Helium 0x3d1008 (movss @0x103acc) — CanonLog2 stack slot -0x18 constant (log-region gain). */
const HGCanonLog_CL2_slot18: number = Math.fround(87.09937286376953);

/** @Helium 0x3d0e98 (leaq @0x103aea) — CanonLog3 stack slot -0x24 pair. */
const HGCanonLog_CL3_slot24: readonly [number, number] = [
  Math.fround(0.12783901393413544), Math.fround(0.07623209059238434),
];
/** @Helium 0x3d0ea0 (leaq @0x103afb) — CanonLog3 stack slot -0x20 pair. */
const HGCanonLog_CL3_slot20: readonly [number, number] = [
  Math.fround(0.12240537256002426), Math.fround(0.06988663226366043),
];
/** @Helium 0x3d0ea8 (leaq @0x103b0c) — CanonLog3 stack slot -0x28 pair. */
const HGCanonLog_CL3_slot28: readonly [number, number] = [
  Math.fround(1.9754798412322998), Math.fround(2.3069815635681152),
];
/** @Helium 0x3d0eb0 (leaq @0x103b1d) — CanonLog3 stack slot -0x1c pair. */
const HGCanonLog_CL3_slot1c: readonly [number, number] = [
  Math.fround(0.12512218952178955), Math.fround(0.07305935770273209),
];
/** @Helium 0x3d0eb8 (leaq @0x103b2e) — CanonLog3 stack slot -0x14 pair. */
const HGCanonLog_CL3_slot14: readonly [number, number] = [
  Math.fround(0.11055882275104523), Math.fround(0.12911149859428406),
];
/** @Helium 0x3d1004 (movss @0x103b3f) — CanonLog3 stack slot -0x18 constant (log-region gain). */
const HGCanonLog_CL3_slot18: number = Math.fround(14.98324966430664);

/**
 * @Helium 0x3d1010 (movss @0x103be3) — CanonLog3 second SetParameter call's
 * xmm2 arg (fixed 0.014f). Not indexed by CodeValueNormalization.
 */
const HGCanonLog_CL3_SetParam2_xmm2: number = Math.fround(0.014000000432133675);

// ---------------------------------------------------------------------------
// Placeholder stubs for undecoded callees (rule 3: loud gap, never fake body).
// ---------------------------------------------------------------------------

/**
 * Placeholder for HGRenderer used by GetOutput's signature. Not yet
 * transcribed — see raw-port/army/ledger for the HGRenderer class.
 * The `GetInput` method is invoked at @Helium 0x103a0d with (this, 0).
 */
export interface HGRendererStub {
  /** @Helium 0x103a0d — vcalled. Signature `GetInput(HGNode*, int) -> HGNode*`. */
  GetInput(node: HGNode, idx: number): HGNode;
}

/**
 * Placeholder for the compositor object owned at `this.field_1a0`. Not yet
 * transcribed — see raw-port/army/ledger for HgcCanonLog_encode /
 * HgcCanonLog3_encode. Only the three vtable slots vcalled from
 * HGCanonLog::Encode are exposed here; each throws until the class is ported.
 */
export interface HgcCanonLog_encodeStub {
  /** vtable *0x18 @Helium — invoked from ~HGCanonLog::Encode (D2 @0x103912, D1 @0x103962, D0 @0x1039b2). */
  Release(): void;
  /** vtable *0x60 @Helium — invoked once (CL1/CL2 @0x103bb9) or twice (CL3 @0x103bdd, @0x103c00) from GetOutput. Argument order (esi, xmm0, xmm1, xmm2, xmm3). */
  SetParameter(idx: number, a: number, b: number, c: number, d: number): void;
  /** vtable *0x78 @Helium — invoked once from GetOutput (@0x103b58). Argument order (esi, rdx). */
  SetInput(idx: number, input: HGNode): void;
}

/**
 * Placeholder for the HGColorMatrix object owned at `this.field_198`. Not
 * yet transcribed — see raw-port/army/ledger for HGColorMatrix. Only the
 * three vtable slots vcalled from HGCanonLog::Encode are exposed here.
 */
export interface HGColorMatrixStub {
  /** vtable *0x18 @Helium — invoked from ~HGCanonLog::Encode (@0x103912, @0x103962, @0x1039b2). */
  Release(): void;
  /** vtable *0x78 @Helium — invoked once from GetOutput (@0x103a22). Argument order (esi, rdx). */
  SetInput(idx: number, input: HGNode): void;
  /**
   * @Helium 0x103a38 — vcalled with signature `LoadMatrix(float vector[4]
   * const*, bool)`. Mangled: __ZN13HGColorMatrix10LoadMatrixEPKDv4_fb.
   * The first arg is a pointer to a 16-float row-major matrix (stride 4);
   * the second is a bool (edx = 1 in this call site).
   */
  LoadMatrix(m: Float32Array, flag: boolean): void;
}

/**
 * `newHgcCanonLog_encode()` — placeholder for the compositor allocation +
 * ctor sequence at @Helium 0x1037f9..0x103804:
 *   0x1037f4  movl  $0x1a0, %edi                     ; alloc size 0x1A0 = 416
 *   0x1037f9  callq __ZN8HGObjectnwEm                ; HGObject::operator new
 *   0x103804  callq __ZN18HgcCanonLog_encodeC1Ev     ; placement-ctor
 * Both callees are undecoded, so this stub throws (rule 3).
 */
function newHgcCanonLog_encode(): HgcCanonLog_encodeStub {
  throw new Error(
    "HGCanonLog::Encode: HgcCanonLog_encode ctor + HGObject::operator new @Helium 0x1037f9/0x103804 not yet transcribed"
  );
}

/**
 * `newHgcCanonLog3_encode()` — placeholder for the compositor allocation +
 * ctor sequence at @Helium 0x1037e2..0x1037ed:
 *   0x1037dd  movl  $0x1a0, %edi                     ; alloc size 0x1A0 = 416
 *   0x1037e2  callq __ZN8HGObjectnwEm                ; HGObject::operator new
 *   0x1037ed  callq __ZN19HgcCanonLog3_encodeC1Ev    ; placement-ctor
 * Both callees are undecoded, so this stub throws (rule 3).
 */
function newHgcCanonLog3_encode(): HgcCanonLog_encodeStub {
  throw new Error(
    "HGCanonLog::Encode: HgcCanonLog3_encode ctor + HGObject::operator new @Helium 0x1037e2/0x1037ed not yet transcribed"
  );
}

/**
 * `newHGColorMatrix()` — placeholder for the matrix-object allocation +
 * ctor sequence at @Helium 0x103839..0x103844 (LogColorimetry==1 path) or
 * @0x10386e..0x103879 (LogColorimetry==0, SceneColorimetry==1 path):
 *   movl  $0x1f0, %edi                                ; alloc size 0x1F0 = 496
 *   callq __ZN8HGObjectnwEm                           ; HGObject::operator new
 *   callq __ZN13HGColorMatrixC1Ev                     ; placement-ctor
 * All three callees are undecoded, so this stub throws (rule 3).
 */
function newHGColorMatrix(): HGColorMatrixStub {
  throw new Error(
    "HGCanonLog::Encode: HGColorMatrix ctor + HGObject::operator new @Helium 0x103839/0x10386e not yet transcribed"
  );
}

// ---------------------------------------------------------------------------
// The port proper.
// ---------------------------------------------------------------------------

/**
 * `HGCanonLog::Encode` — Helium HGNode subclass. Wraps an owned Canon-Log
 * compositor + optional HGColorMatrix pre-conversion node, configured for
 * Canon Log 1 / 2 / 3 forward encoding.
 *
 * @Helium ctors  @0x1037a0 (C2) / @0x1038e0 (C1 tail-jmps to C2);
 *         dtors  @0x1038f0 (D2) / @0x103940 (D1) / @0x103990 (D0);
 *         GetOutput @0x1039f0.
 */
export class HGCanonLog_Encode extends HGNode {
  /**
   * Optional `HGColorMatrix` pre-conversion node. Field @0x198 in the C++
   * layout. NULL when LogColorimetry == 2, or when LogColorimetry == 0 and
   * SceneColorimetry != 1. NULL-initialized by ctor @0x1037cc (`movq $0,
   * 0x198(%rbx)`); overwritten @0x103849 / @0x10387e on the paths above.
   */
  colorMatrix: HGColorMatrixStub | null;

  /**
   * Owned compositor. Field @0x1a0 in the C++ layout. Concretely
   * `HgcCanonLog3_encode` iff LogEncoding == 2, else `HgcCanonLog_encode`.
   * Assigned once in the ctor @0x103809 from r14 (which held either
   * new-and-ctor'd concrete). No pre-existing-pointer check: field
   * uninitialised until this write on a fresh HGNode subclass.
   */
  compositor: HgcCanonLog_encodeStub | null;

  /**
   * Optional pre-conversion 4×4 matrix (row-major float[16]). Field
   * @0x1a8 in the C++ layout. NULL-initialised by ctor @0x103810 (`movq
   * $0, 0x1a8(%rbx)`); overwritten @0x10388c with either an entry of
   * `sourceToCinemaGamut[SceneColorimetry]` (LogColorimetry == 1) or
   * `HGColorGamma::rec2020RGBToRec709RGB` (LogColorimetry == 0 &&
   * SceneColorimetry == 1). Passed to `HGColorMatrix::LoadMatrix` in
   * GetOutput @0x103a38.
   */
  gamutMatrix: Float32Array | null;

  /**
   * `LogEncoding` selector. Field @0x1b0 in the C++ layout. Stored from
   * r13d (the second ctor arg) @0x10381b. Consumed by GetOutput
   * @0x103a44/@0x103b5b to select which piecewise SetParameter dispatch
   * to run.
   */
  logEncoding: HGCanonLog_LogEncoding;

  /**
   * `CodeValueNormalization` selector. Field @0x1b4 in the C++ layout.
   * Stored from r12d (the fourth ctor arg) @0x103822. Consumed by
   * GetOutput @0x103a62/@0x103a9d/@0x103add — only the "== 0" test is
   * observable, so 0 selects the FULL-range slot and any non-zero value
   * selects the NARROW-range slot in each pair.
   */
  codeValueNormalization: HGCanonLog_CodeValueNormalization;

  /**
   * `HGCanonLog::Encode::Encode(SceneColorimetry, LogEncoding,
   * LogColorimetry, CodeValueNormalization)` — Helium @0x1037a0 (C2
   * base-object ctor). C1 @0x1038e0 is a byte-for-byte tail-jmp to C2
   * (verified: 6 bytes push %rbp / mov %rsp,%rbp / pop %rbp / jmp),
   * so only C2's body needs modelling.
   *
   * Verbatim asm (@0x1037a0..0x1038a1 body, exception-cleanup elided):
   *   0x1037a0  pushq %rbp ; movq %rsp,%rbp ; push r15/r14/r13/r12/rbx/rax
   *   0x1037ae  movl  %r8d, %r12d                        ; r12d = CodeValueNormalization
   *   0x1037b1  movl  %ecx, %r15d                        ; r15d = LogColorimetry
   *   0x1037b4  movl  %edx, %r13d                        ; r13d = LogEncoding
   *   0x1037b7  movl  %esi, -0x2c(%rbp)                  ; -0x2c(%rbp) = SceneColorimetry
   *   0x1037ba  movq  %rdi, %rbx                         ; rbx = this
   *   0x1037bd  callq __ZN6HGNodeC2Ev                    ; base ctor
   *   0x1037c2  leaq  0x915b37(%rip), %rax  ; = 0xa19300 (installed vtable ptr)
   *   0x1037c9  movq  %rax, (%rbx)                       ; *this = vtable
   *   0x1037cc  movq  $0, 0x198(%rbx)                    ; this.colorMatrix = null
   *   0x1037d7  cmpl  $2, %r13d
   *   0x1037db  jne   0x1037f4                            ; if LogEncoding != 2 → CL1/CL2 path
   *   0x1037dd  movl  $0x1a0, %edi                       ; alloc size 0x1A0 = 416
   *   0x1037e2  callq __ZN8HGObjectnwEm                  ; HGObject::operator new
   *   0x1037e7  movq  %rax, %r14                         ; r14 = compositor ptr
   *   0x1037ea  movq  %rax, %rdi
   *   0x1037ed  callq __ZN19HgcCanonLog3_encodeC1Ev      ; ctor (CL3)
   *   0x1037f2  jmp   0x103809                           ; goto store
   *   0x1037f4:                                          ; (CL1/CL2)
   *   0x1037f4  movl  $0x1a0, %edi                       ; same alloc size 0x1A0
   *   0x1037f9  callq __ZN8HGObjectnwEm                  ; HGObject::operator new
   *   0x1037fe  movq  %rax, %r14
   *   0x103801  movq  %rax, %rdi
   *   0x103804  callq __ZN18HgcCanonLog_encodeC1Ev       ; ctor (CL1/CL2)
   *   0x103809  movq  %r14, 0x1a0(%rbx)                  ; this.compositor = r14
   *   0x103810  movq  $0, 0x1a8(%rbx)                    ; this.gamutMatrix = null
   *   0x10381b  movl  %r13d, 0x1b0(%rbx)                 ; this.logEncoding = LogEncoding
   *   0x103822  movl  %r12d, 0x1b4(%rbx)                 ; this.codeValueNormalization = CVN
   *   0x103829  testl %r15d, %r15d
   *   0x10382c  je    0x103863                           ; LogColorimetry == 0 → case_zero
   *   0x10382e  cmpl  $1, %r15d
   *   0x103832  jne   0x103893                           ; LogColorimetry ∉ {0,1} (== 2) → done
   *                                                      ; fall through: LogColorimetry == 1
   *   0x103834  movl  $0x1f0, %edi                       ; alloc size 0x1F0 = 496
   *   0x103839  callq __ZN8HGObjectnwEm                  ; HGObject::operator new
   *   0x10383e  movq  %rax, %r14
   *   0x103841  movq  %rax, %rdi
   *   0x103844  callq __ZN13HGColorMatrixC1Ev            ; HGColorMatrix ctor
   *   0x103849  movq  %r14, 0x198(%rbx)                  ; this.colorMatrix = matrix
   *   0x103850  movl  -0x2c(%rbp), %ecx                  ; ecx = SceneColorimetry
   *   0x103853  shlq  $6, %rcx                           ; rcx = SceneColorimetry * 0x40
   *   0x103857  leaq  __ZN10HGCanonLog6Encode19sourceToCinemaGamutE(%rip), %rax
   *   0x10385e  addq  %rcx, %rax                         ; rax = &sourceToCinemaGamut[SceneColorimetry]
   *   0x103861  jmp   0x10388c                           ; store gamut matrix
   *   0x103863:                                          ; case_zero (LogColorimetry == 0)
   *   0x103863  cmpl  $1, -0x2c(%rbp)                    ; SceneColorimetry == 1 ?
   *   0x103867  jne   0x103893                           ; if not → done (no matrix)
   *                                                      ; fall through: SceneColorimetry == 1
   *   0x103869  movl  $0x1f0, %edi
   *   0x10386e  callq __ZN8HGObjectnwEm
   *   0x103873  movq  %rax, %r14
   *   0x103876  movq  %rax, %rdi
   *   0x103879  callq __ZN13HGColorMatrixC1Ev
   *   0x10387e  movq  %r14, 0x198(%rbx)                  ; this.colorMatrix = matrix
   *   0x103885  leaq  __ZN12HGColorGamma21rec2020RGBToRec709RGBE(%rip), %rax
   *   0x10388c  movq  %rax, 0x1a8(%rbx)                  ; this.gamutMatrix = <matrix ptr>
   *   0x103893  <epilogue: pop regs / ret>
   *
   * The exception-cleanup path @0x1038a2..0x1038d6 (compositor delete +
   * HGNode dtor + __Unwind_Resume) exists only to handle allocation
   * failure or a throwing compositor ctor; it never executes on a
   * successful construction and is not modelled explicitly (TS
   * exceptions unwind through the stack naturally).
   */
  constructor(
    sceneColorimetry: HGCanonLog_SceneColorimetry,
    logEncoding: HGCanonLog_LogEncoding,
    logColorimetry: HGCanonLog_LogColorimetry,
    codeValueNormalization: HGCanonLog_CodeValueNormalization,
  ) {
    // @Helium 0x1037bd: HGNode base ctor
    super();
    // @Helium 0x1037c9: install this class's vtable (installed ptr = 0xa19300).
    this.vtable = 0xa19300;
    // @Helium 0x1037cc: this.colorMatrix = null
    this.colorMatrix = null;
    // @Helium 0x1037d7..0x103809: compositor = new HgcCanonLog3_encode() iff
    // LogEncoding == 2, else new HgcCanonLog_encode(). Both throw until
    // transcribed (see stubs above).
    if (logEncoding === 2) {
      // @Helium 0x1037dd..0x1037ed
      this.compositor = newHgcCanonLog3_encode();
    } else {
      // @Helium 0x1037f4..0x103804
      this.compositor = newHgcCanonLog_encode();
    }
    // @Helium 0x103810: this.gamutMatrix = null
    this.gamutMatrix = null;
    // @Helium 0x10381b: this.logEncoding = LogEncoding
    this.logEncoding = logEncoding;
    // @Helium 0x103822: this.codeValueNormalization = CodeValueNormalization
    this.codeValueNormalization = codeValueNormalization;
    // @Helium 0x103829..0x103893: LogColorimetry switch — set up optional matrix.
    if (logColorimetry === 1) {
      // @Helium 0x103834..0x10385e: alloc HGColorMatrix; pick
      //   sourceToCinemaGamut[SceneColorimetry] as the matrix pointer.
      this.colorMatrix = newHGColorMatrix();
      // @Helium 0x103850..0x10385e: &sourceToCinemaGamut[SceneColorimetry]
      this.gamutMatrix = HGCanonLog_Encode_sourceToCinemaGamut[sceneColorimetry];
    } else if (logColorimetry === 0 && sceneColorimetry === 1) {
      // @Helium 0x103869..0x103885: alloc HGColorMatrix; pick
      //   HGColorGamma::rec2020RGBToRec709RGB as the matrix pointer.
      this.colorMatrix = newHGColorMatrix();
      this.gamutMatrix = HGCanonLog_Encode_rec2020RGBToRec709RGB;
    }
    // else (logColorimetry === 2 OR (logColorimetry === 0 &&
    // sceneColorimetry !== 1)): no matrix — this.colorMatrix and
    // this.gamutMatrix both stay null (@0x1037cc, @0x103810 initial
    // NULL-writes are preserved).
  }

  /**
   * `HGCanonLog::Encode::~Encode()` — Helium @0x1038f0 (D2, base-object)
   * / @0x103940 (D1, complete-object) / @0x103990 (D0, deleting). All
   * three share the same body up through the base-dtor call; D0
   * additionally tail-calls `HGObject::operator delete`. Bodies verbatim:
   *
   * D2 @0x1038f0..0x103935 (verbatim, ex-handler elided):
   *   0x1038f9  leaq  0x915a00(%rip), %rax   ; = 0xa19300 (own installed vtable ptr)
   *   0x103900  movq  %rax, (%rdi)           ; *this = vtable (reinstall)
   *   0x103903  movq  0x198(%rdi), %rdi      ; rdi = colorMatrix
   *   0x10390a  testq %rdi, %rdi
   *   0x10390d  je    0x103915               ; skip if null
   *   0x10390f  movq  (%rdi), %rax           ; rax = colorMatrix.vtable
   *   0x103912  callq *0x18(%rax)            ; colorMatrix.Release()
   *   0x103915  movq  0x1a0(%rbx), %rdi      ; rdi = compositor
   *   0x10391c  testq %rdi, %rdi
   *   0x10391f  je    0x103927               ; skip if null
   *   0x103921  movq  (%rdi), %rax           ; rax = compositor.vtable
   *   0x103924  callq *0x18(%rax)            ; compositor.Release()
   *   0x103927  movq  %rbx, %rdi             ; rdi = this
   *   0x103930  jmp   __ZN6HGNodeD2Ev        ; tail-call HGNode base dtor
   *
   * D1 @0x103940..0x10398d is byte-identical except the vtable-reload
   * leaq offset (@0x103949 leaq 0x9159b0(%rip),%rax — same target
   * 0xa19300 with a different displacement because the leaq PC is
   * different). D0 @0x103990..0x1039e5 additionally, after the HGNode
   * dtor tail-call, `jmp __ZN8HGObjectdlEPv` frees `this` via
   * HGObject::operator delete; we model D0's operator-delete step at
   * the JS caller (i.e. dropping the reference).
   */
  destruct(): void {
    // @Helium 0x103900: vtable reinstall — modeled by assignment.
    this.vtable = 0xa19300;
    // @Helium 0x103903..0x103912: release colorMatrix if present.
    if (this.colorMatrix != null) {
      this.colorMatrix.Release();
      this.colorMatrix = null;
    }
    // @Helium 0x103915..0x103924: release compositor if present.
    if (this.compositor != null) {
      this.compositor.Release();
      this.compositor = null;
    }
    // @Helium 0x103930: tail-jmp HGNode::~HGNode()
    super.destruct();
  }

  /**
   * `HGCanonLog::Encode::GetOutput(HGRenderer*)` — Helium @0x1039f0.
   *
   * Wires the owned compositor (+ optional HGColorMatrix pre-node) into
   * the render graph and hands per-encoding coefficients to the
   * compositor's SetParameter slot. See file-header GETOUTPUT WIRING
   * for the shape; verbatim asm is inlined below.
   *
   * Verbatim asm (@0x1039f0..0x103c13, prologue/epilogue elided):
   *   0x1039fe  movq  0x198(%rdi), %r14           ; r14 = this.colorMatrix
   *   0x103a05  movq  %rsi, %rdi                  ; rdi = renderer
   *   0x103a08  movq  %rbx, %rsi                  ; rsi = this
   *   0x103a0b  xorl  %edx, %edx                  ; edx = 0
   *   0x103a0d  callq __ZN10HGRenderer8GetInputEP6HGNodei  ; input = renderer.GetInput(this, 0)
   *   0x103a12  movq  %rax, %rdx                  ; rdx = input
   *   0x103a15  testq %r14, %r14
   *   0x103a18  je    0x103a44                    ; skip color-matrix wiring if colorMatrix == null
   *   0x103a1a  movq  (%r14), %rax                ; rax = colorMatrix.vtable
   *   0x103a1d  movq  %r14, %rdi                  ; rdi = colorMatrix
   *   0x103a20  xorl  %esi, %esi                  ; esi = 0
   *   0x103a22  callq *0x78(%rax)                 ; colorMatrix.SetInput(0, input)
   *   0x103a25  movq  0x198(%rbx), %rdi           ; rdi = this.colorMatrix
   *   0x103a2c  movq  0x1a8(%rbx), %rsi           ; rsi = this.gamutMatrix
   *   0x103a33  movl  $1, %edx                    ; edx = true
   *   0x103a38  callq __ZN13HGColorMatrix10LoadMatrixEPKDv4_fb  ; colorMatrix.LoadMatrix(gamutMatrix, true)
   *   0x103a3d  movq  0x198(%rbx), %rdx           ; rdx = this.colorMatrix (new upstream node)
   *   0x103a44  movl  0x1b0(%rbx), %eax           ; eax = this.logEncoding
   *   0x103a4a  cmpl  $2, %eax
   *   0x103a4d  je    0x103adb                    ; CL3 path
   *   0x103a53  cmpl  $1, %eax
   *   0x103a56  je    0x103a9b                    ; CL2 path
   *   0x103a58  testl %eax, %eax
   *   0x103a5a  jne   0x103b4c                    ; if eax not in {0,1,2} → fall through with no prep
   *                                                ; CL1 path (eax == 0):
   *   0x103a60  xorl  %eax, %eax
   *   0x103a62  cmpl  $0, 0x1b4(%rbx)             ; codeValueNormalization == 0 ?
   *   0x103a69  sete  %al                         ; al = 1 iff CVN == 0 (FULL-range)
   *   0x103a6c  shll  $2, %eax                    ; eax = 4 (FULL) or 0 (NARROW)
   *   0x103a6f  leaq  0x2cd45a(%rip), %rcx        ; rcx = &CL1_slot1c[0]  @Helium 0x3d0ed0
   *   0x103a76  movss (%rax,%rcx), %xmm0          ; xmm0 = CL1_slot1c[CVN?full:narrow]
   *   0x103a7b  movss %xmm0, -0x1c(%rbp)
   *   0x103a80  leaq  0x2cd451(%rip), %rcx        ; rcx = &CL1_slot14[0]  @Helium 0x3d0ed8
   *   0x103a87  movss (%rax,%rcx), %xmm0
   *   0x103a8c  movss %xmm0, -0x14(%rbp)
   *   0x103a91  movss 0x2cd573(%rip), %xmm0       ; xmm0 = CL1_slot18 (10.1596f)  @Helium 0x3d100c
   *   0x103a99  jmp   0x103ad4                    ; goto store-slot18
   *   0x103a9b:                                    ; CL2 path:
   *   0x103a9b  xorl  %eax, %eax
   *   0x103a9d  cmpl  $0, 0x1b4(%rbx)
   *   0x103aa4  sete  %al
   *   0x103aa7  shll  $2, %eax
   *   0x103aaa  leaq  0x2cd40f(%rip), %rcx        ; @Helium 0x3d0ec0
   *   0x103ab1  movss (%rax,%rcx), %xmm0
   *   0x103ab6  movss %xmm0, -0x1c(%rbp)
   *   0x103abb  leaq  0x2cd406(%rip), %rcx        ; @Helium 0x3d0ec8
   *   0x103ac2  movss (%rax,%rcx), %xmm0
   *   0x103ac7  movss %xmm0, -0x14(%rbp)
   *   0x103acc  movss 0x2cd534(%rip), %xmm0       ; xmm0 = CL2_slot18 (87.0994f)  @Helium 0x3d1008
   *   0x103ad4  movss %xmm0, -0x18(%rbp)          ; store CL1/CL2 slot18
   *   0x103ad9  jmp   0x103b4c
   *   0x103adb:                                    ; CL3 path:
   *   0x103adb  xorl  %eax, %eax
   *   0x103add  cmpl  $0, 0x1b4(%rbx)
   *   0x103ae4  sete  %al
   *   0x103ae7  shll  $2, %eax
   *   0x103aea  leaq  0x2cd3a7(%rip), %rcx        ; @Helium 0x3d0e98
   *   0x103af1  movss (%rax,%rcx), %xmm0
   *   0x103af6  movss %xmm0, -0x24(%rbp)
   *   0x103afb  leaq  0x2cd39e(%rip), %rcx        ; @Helium 0x3d0ea0
   *   0x103b02  movss (%rax,%rcx), %xmm0
   *   0x103b07  movss %xmm0, -0x20(%rbp)
   *   0x103b0c  leaq  0x2cd395(%rip), %rcx        ; @Helium 0x3d0ea8
   *   0x103b13  movss (%rax,%rcx), %xmm0
   *   0x103b18  movss %xmm0, -0x28(%rbp)
   *   0x103b1d  leaq  0x2cd38c(%rip), %rcx        ; @Helium 0x3d0eb0
   *   0x103b24  movss (%rax,%rcx), %xmm0
   *   0x103b29  movss %xmm0, -0x1c(%rbp)
   *   0x103b2e  leaq  0x2cd383(%rip), %rcx        ; @Helium 0x3d0eb8
   *   0x103b35  movss (%rax,%rcx), %xmm0
   *   0x103b3a  movss %xmm0, -0x14(%rbp)
   *   0x103b3f  movss 0x2cd4bd(%rip), %xmm0       ; xmm0 = CL3_slot18 (14.9832f)  @Helium 0x3d1004
   *   0x103b47  movss %xmm0, -0x18(%rbp)          ; store CL3 slot18
   *   0x103b4c:                                    ; converged:
   *   0x103b4c  movq  0x1a0(%rbx), %rdi           ; rdi = this.compositor
   *   0x103b53  movq  (%rdi), %rax                ; rax = compositor.vtable
   *   0x103b56  xorl  %esi, %esi                  ; esi = 0
   *   0x103b58  callq *0x78(%rax)                 ; compositor.SetInput(0, rdx)  [rdx = colorMatrix|input]
   *   0x103b5b  cmpl  $2, 0x1b0(%rbx)             ; CL3?
   *   0x103b62  movq  0x1a0(%rbx), %rdi           ; rdi = compositor
   *   0x103b69  jne   0x103b8a                    ; non-CL3 branch
   *                                                ; CL3 (dynamic_cast to HgcCanonLog3_encode*):
   *   0x103b6b  testq %rdi, %rdi
   *   0x103b6e  je    0x103bbe                    ; compositor null → r14 = 0
   *   0x103b70  leaq  __ZTI6HGNode(%rip), %rsi
   *   0x103b77  leaq  __ZTI19HgcCanonLog3_encode(%rip), %rdx
   *   0x103b7e  xorl  %ecx, %ecx
   *   0x103b80  callq ___dynamic_cast              ; r14 = downcast<HgcCanonLog3_encode*>(compositor)
   *   0x103b85  movq  %rax, %r14
   *   0x103b88  jmp   0x103bc1                    ; goto CL3-SetParameter-1
   *   0x103b8a:                                    ; non-CL3 (dynamic_cast to HgcCanonLog_encode*):
   *   0x103b8a  leaq  __ZTI6HGNode(%rip), %rsi
   *   0x103b91  leaq  __ZTI18HgcCanonLog_encode(%rip), %rdx
   *   0x103b98  xorl  %ecx, %ecx
   *   0x103b9a  callq ___dynamic_cast
   *   0x103b9f  movq  (%rax), %rcx                ; rcx = compositor.vtable
   *   0x103ba2  xorps %xmm3, %xmm3                ; xmm3 = 0.0f
   *   0x103ba5  movq  %rax, %rdi                  ; rdi = compositor
   *   0x103ba8  xorl  %esi, %esi                  ; esi = 0
   *   0x103baa  movss -0x14(%rbp), %xmm0
   *   0x103baf  movss -0x1c(%rbp), %xmm1
   *   0x103bb4  movss -0x18(%rbp), %xmm2
   *   0x103bb9  callq *0x60(%rcx)                 ; compositor.SetParameter(0, slot14, slot1c, slot18, 0.0f)
   *   0x103bbc  jmp   0x103c03                    ; goto return
   *   0x103bbe  xorl  %r14d, %r14d                 ; r14 = null (CL3 fallback on null compositor)
   *   0x103bc1:                                    ; CL3 SetParameter #1 (esi=0):
   *   0x103bc1  movq  (%r14), %rax
   *   0x103bc4  movq  %r14, %rdi
   *   0x103bc7  xorl  %esi, %esi
   *   0x103bc9  movss -0x14(%rbp), %xmm0
   *   0x103bce  movss -0x24(%rbp), %xmm1
   *   0x103bd3  movss -0x20(%rbp), %xmm2
   *   0x103bd8  movss -0x18(%rbp), %xmm3
   *   0x103bdd  callq *0x60(%rax)                 ; compositor.SetParameter(0, CL3_slot14, CL3_slot24, CL3_slot20, CL3_slot18)
   *   0x103be0  movq  (%r14), %rax
   *   0x103be3  movss 0x2cd425(%rip), %xmm2       ; xmm2 = 0.014f  @Helium 0x3d1010
   *   0x103beb  xorps %xmm3, %xmm3                ; xmm3 = 0.0f
   *   0x103bee  movq  %r14, %rdi
   *   0x103bf1  movl  $1, %esi                    ; esi = 1
   *   0x103bf6  movss -0x28(%rbp), %xmm0
   *   0x103bfb  movss -0x1c(%rbp), %xmm1
   *   0x103c00  callq *0x60(%rax)                 ; compositor.SetParameter(1, CL3_slot28, CL3_slot1c, 0.014f, 0.0f)
   *   0x103c03  movq  0x1a0(%rbx), %rax           ; rax = this.compositor
   *   0x103c12  retq
   *
   * @param renderer  the containing HGRenderer (undecoded; only its
   *                  `GetInput` method is touched).
   * @returns         the compositor (@0x1a0) as this node's output.
   *
   * Throws if the compositor field is null (should be impossible after a
   * successful ctor) or if any of the undecoded downstream vtable slots
   * hit their stubs.
   */
  GetOutput(renderer: HGRendererStub): HGNode {
    // @Helium 0x1039fe: r14 = this.colorMatrix (may be null).
    const colorMatrix = this.colorMatrix;
    // @Helium 0x103a0d: input = renderer.GetInput(this, 0)
    const input = renderer.GetInput(this, 0);
    // @Helium 0x103a12: rdx = input (default upstream reference).
    let upstream: HGNode = input;
    // @Helium 0x103a15..0x103a3d: if colorMatrix != null, wire it as
    // an upstream pre-conversion node and use IT as the compositor's
    // input source.
    if (colorMatrix != null) {
      // @Helium 0x103a22: colorMatrix.SetInput(0, input)
      colorMatrix.SetInput(0, input);
      // @Helium 0x103a38: colorMatrix.LoadMatrix(this.gamutMatrix, true).
      // gamutMatrix MUST be non-null whenever colorMatrix is non-null
      // — the ctor only allocates the matrix on paths that also set
      // gamutMatrix (0x103849/0x10387e are paired with 0x10388c).
      if (this.gamutMatrix == null) {
        throw new Error(
          "HGCanonLog::Encode::GetOutput @Helium 0x103a38 — colorMatrix non-null but gamutMatrix null (ctor invariant violated)"
        );
      }
      colorMatrix.LoadMatrix(this.gamutMatrix, true);
      // @Helium 0x103a3d: rdx = this.colorMatrix (upcast to HGNode).
      upstream = colorMatrix as unknown as HGNode;
    }
    // @Helium 0x103a44: eax = this.logEncoding
    const enc = this.logEncoding;
    // @Helium 0x103a62 / 0x103a9d / 0x103add: cvn == 0 → picks slot [1]
    // (FULL-range), cvn != 0 → picks slot [0] (NARROW-range).
    const cvnSlot: 0 | 1 = this.codeValueNormalization === 0 ? 1 : 0;
    // Prepare per-encoding SetParameter arguments (matches the stack
    // slot names used in the compositor call sites below). These are
    // pure loads from RIP-relative tables; assembly stores them in
    // stack slots and re-reads them just before the callq. We inline
    // the equivalent locals here.
    let slot1c: number = 0;
    let slot14: number = 0;
    let slot18: number = 0;
    let slot20: number = 0;
    let slot24: number = 0;
    let slot28: number = 0;
    if (enc === 0) {
      // @Helium 0x103a60..0x103a91: CanonLog1 prep
      slot1c = HGCanonLog_CL1_slot1c[cvnSlot];
      slot14 = HGCanonLog_CL1_slot14[cvnSlot];
      slot18 = HGCanonLog_CL1_slot18;
    } else if (enc === 1) {
      // @Helium 0x103a9b..0x103acc: CanonLog2 prep
      slot1c = HGCanonLog_CL2_slot1c[cvnSlot];
      slot14 = HGCanonLog_CL2_slot14[cvnSlot];
      slot18 = HGCanonLog_CL2_slot18;
    } else if (enc === 2) {
      // @Helium 0x103adb..0x103b47: CanonLog3 prep
      slot24 = HGCanonLog_CL3_slot24[cvnSlot];
      slot20 = HGCanonLog_CL3_slot20[cvnSlot];
      slot28 = HGCanonLog_CL3_slot28[cvnSlot];
      slot1c = HGCanonLog_CL3_slot1c[cvnSlot];
      slot14 = HGCanonLog_CL3_slot14[cvnSlot];
      slot18 = HGCanonLog_CL3_slot18;
    }
    // (No else — asm at 0x103a5a `jne 0x103b4c` falls through with
    // uninitialized stack when enc is not in {0,1,2}. The C++ enum only
    // ever produces one of those three; the fall-through is a defensive
    // dead branch, and we do not model it explicitly.)

    // @Helium 0x103b4c: reload compositor pointer.
    const comp = this.compositor;
    if (comp == null) {
      throw new Error(
        "HGCanonLog::Encode::GetOutput @Helium 0x103b4c — compositor null (should be unreachable after ctor)"
      );
    }
    // @Helium 0x103b58: compositor.SetInput(0, upstream)
    comp.SetInput(0, upstream);

    // @Helium 0x103b5b: dispatch on logEncoding (== 2 for CL3).
    if (enc === 2) {
      // @Helium 0x103b70..0x103b88: dynamic_cast to HgcCanonLog3_encode*.
      // In our port the compositor was already ctor'd as the CL3 type;
      // the dynamic_cast is a strict identity narrow. We reflect the RTTI
      // narrow as a plain reference — throwing if the actual type doesn't
      // match would require the un-ported HgcCanonLog3_encode class, so
      // we trust the ctor's invariant and use `comp` directly.
      // @Helium 0x103bdd: SetParameter(0, slot14, slot24, slot20, slot18)
      comp.SetParameter(0, slot14, slot24, slot20, slot18);
      // @Helium 0x103c00: SetParameter(1, slot28, slot1c, 0.014f, 0.0f)
      comp.SetParameter(
        1,
        slot28,
        slot1c,
        HGCanonLog_CL3_SetParam2_xmm2,
        Math.fround(0.0),
      );
    } else {
      // @Helium 0x103b8a..0x103bb9: non-CL3 → dynamic_cast to
      // HgcCanonLog_encode* + single SetParameter(0, …).
      // @Helium 0x103bb9: SetParameter(0, slot14, slot1c, slot18, 0.0f)
      comp.SetParameter(0, slot14, slot1c, slot18, Math.fround(0.0));
    }

    // @Helium 0x103c03..0x103c12: return this.compositor.
    return comp as unknown as HGNode;
  }
}
