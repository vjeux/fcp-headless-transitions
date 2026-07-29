// raw-port/src/render/HGARRILogC_Encode.ts
//
// FCP `HGARRILogC::Encode` — nested Helium HGNode subclass. Wraps an
// owned `HGColorMatrix` (source-gamut → ARRI Wide Gamut RGB) followed by
// an owned `HgcLogVideo_encode` compositor configured (via two
// SetParameter calls) to implement the ARRI ALEXA LogC forward transfer
// function (linear scene-linear → LogC log-encoded video) for a
// specified Exposure Index (EI).
//
// Structural twin of HGACEScct::Encode
// (raw-port/src/render/HGACEScct_Encode.ts) — but with an added matrix
// stage in front of the segmented log shader, and per-EI parameters
// pulled from the shared 11-row table in
// raw-port/src/render/HGARRILogC.ts (`logCurveParameters`).
//
// FRAMEWORK: Helium.framework
// FAT slice offset: 0x4000; thin binary /tmp/Helium.x86_64 has VA ==
// file offset (segment __TEXT vmaddr = 0). Constants read via
// `raw-port/army/tools/resolve.py Helium const 0x…`.
//
// DISASSEMBLY (source of every citation below):
//   /tmp/Helium_tV.txt: the full `otool -tV -arch x86_64` of Helium.
//   Method boundaries:
//     C2       @0x1023f0..0x1025b9
//     C1       @0x1025c0..0x1025c5 (tail-jmp to C2)
//     D2       @0x1025d0..0x10261d
//     D1       @0x102620..0x10266d
//     D0       @0x102670..0x1026c5
//     GetOutput@0x1026d0..0x102791
//   No `.cold.*` initializers (unlike HGACEScct::Encode); the C2 body
//   holds no function-scope statics.
//
// SYMBOLS:
//   @Helium 0x1023f0  HGARRILogC::Encode::Encode(SceneColorimetry, ei)   [C2]  __ZN10HGARRILogC6EncodeC2ENS_16SceneColorimetryEj
//   @Helium 0x1025c0  HGARRILogC::Encode::Encode(SceneColorimetry, ei)   [C1]  __ZN10HGARRILogC6EncodeC1ENS_16SceneColorimetryEj — tail-jmp to C2
//   @Helium 0x1025d0  HGARRILogC::Encode::~Encode()                       [D2]  __ZN10HGARRILogC6EncodeD2Ev
//   @Helium 0x102620  HGARRILogC::Encode::~Encode()                       [D1]  __ZN10HGARRILogC6EncodeD1Ev
//   @Helium 0x102670  HGARRILogC::Encode::~Encode()                       [D0]  __ZN10HGARRILogC6EncodeD0Ev
//   @Helium 0x1026d0  HGARRILogC::Encode::GetOutput(HGRenderer*)         __ZN10HGARRILogC6Encode9GetOutputEP10HGRenderer
//   @Helium 0x3d1680  HGARRILogC::Encode::sourceToARRIWideGamut          __ZN10HGARRILogC6Encode21sourceToARRIWideGamutE  [static data]
//
// VTABLE:
//   @Helium ctor C2 @0x102409 emits `leaq 0x916170(%rip), %rax` which
//   resolves to 0x102410 + 0x916170 = 0xa18580 — this is the
//   "installed pointer" for `HGARRILogC::Encode` (vtable-base + 0x10 per
//   Itanium ABI). The three dtors reinstall it at 0x1025e0 (D2),
//   0x102630 (D1) and 0x102680 (D0) — each with a different `leaq`
//   displacement chosen so RIP+disp == 0xa18580.
//
// CTOR ARG ORDER (from `movl %edx,%r14d ; movl %esi,%r15d` @0x1023fb):
//   rdi = this
//   esi = colorimetry (SceneColorimetry enum, u32; captured into r15d)
//   edx = ei          (raw ARRI EI, u32; captured into r14d)
//
// STRUCT LAYOUT (recovered from C2 + GetOutput):
//   HGARRILogC::Encode extends HGNode (base ctor @0x102404). Subclass
//   fields:
//     0x198 : HGColorMatrix*      matrix           (allocated @0x102418, 0x1F0 bytes)
//     0x1a0 : HgcLogVideo_encode* compositor        (allocated @0x102434, 0x1A0 bytes)
//     0x1a8 : const void*         matrixSrcRow     (pointer into sourceToARRIWideGamut,
//                                                    offset = colorimetry * 0x40)
//     0x1b0 : float               constant5f       (= 5.0f, from movl $0x40a00000)
//     0x1b4 : float               a_f32            (= f32(row.a))
//     0x1b8 : float               b_log10_2_f32    (= f32(row.b * log10(2)))
//     0x1bc : float               c_f32            (= f32(row.c))
//     0x1c0 : float               d_times_09_f32   (= f32(row.d * 0.9))
//     0x1c4 : float               e_f32            (= f32(row.e))
//     0x1c8 : float               cut_over_09_f32  (= f32(row.cut / 0.9))
//   sizeof = 0x1d0 (aligned up from 0x1cc). No further fields touched by
//   any ported entry point.
//
// STATIC DATA:
//   `sourceToARRIWideGamut` @0x3d1680 (2 × 0x40 = 128 bytes, 2 × 4×4
//   row-major float32 matrices, indexed by `colorimetry` ∈ {0,1}).
//   Values below are byte-exact against the Helium x86_64 slice.
//
// CTOR TAIL MATH (@0x10251e..0x102578) — precompute the compositor
// coefficients from the selected EI parameter row `p`:
//   constant5f       = 5.0f                    (immediate 0x40A00000 @0x102514)
//   a_f32            = float32(p.a)            (from p+0x10, via cvtpd2ps)
//   b_log10_2_f32    = float32(p.b * log10(2)) (uses const 0.3010299956639812
//                                                 @0x3d0e48; RIP-rel mulsd @0x102523)
//   c_f32            = float32(p.c)            (from p+0x20, via cvtpd2ps)
//   d_times_09_f32   = float32(p.d * 0.9)      (uses const 0.9 @0x3d0e50; RIP-rel movsd @0x10252b)
//   e_f32            = float32(p.e)            (from p+0x30, via cvtpd2ps)
//   cut_over_09_f32  = float32(p.cut / 0.9)    (from p+0x08, divsd by 0.9)
//
//   The two RIP-relative doubles decoded via resolve.py:
//     @Helium 0x3d0e48 = 0.3010299956639812 = log10(2)
//     @Helium 0x3d0e50 = 0.9
//
//   HOW THESE FEED THE ARRI LogC FORMULA:
//     ARRI LogC EI-agnostic forward:
//       if lin >  cut:   V = c*log10(a*lin + b) + d
//       else:            V = e*lin + f
//         where f is derived from continuity (not stored: recovered
//                from p.d - p.c*log10(a*cut+b) + e*cut).
//     The compositor is `HgcLogVideo_encode` (opaque here — undecoded
//     helper class). GetOutput invokes it twice via vtable slot *0x60,
//     once per segment. The four coefficients per call are laid out
//     4-wide in memory at 0x1b0..0x1c8 in the exact order the shader
//     expects (verified by tracing the movss loads in GetOutput).
//     We DO NOT re-derive the shader semantics here — the point is to
//     ship the six bytes-exact floats the binary loads; segmented log
//     shader semantics are decoded (or will be) inside
//     HgcLogVideo_encode itself.
//
// GETOUTPUT (@0x1026d0..0x102791) — rendering-graph wiring:
//   1) input = renderer.GetInput(this, 0)                           @0x1026e9
//   2) matrix.vtable[0x78](0, input)      // SetInput slot 0        @0x1026f9
//   3) matrix.LoadMatrix(this.matrixSrcRow, /*transpose=*/true)     @0x10270f
//                          (uses `movl $0x1,%edx` — the bool `b` in the
//                           demangled signature; symbol is
//                           `HGColorMatrix::LoadMatrix(float vector[4] const*, bool)`.)
//   4) compositor.vtable[0x78](0, matrix)  // SetInput slot 0       @0x102727
//   5) compositor.vtable[0x60](0,                                    @0x102756
//                              constant5f,
//                              a_f32,
//                              b_log10_2_f32,
//                              c_f32)
//   6) compositor.vtable[0x60](1,                                    @0x102783
//                              d_times_09_f32,
//                              e_f32,
//                              cut_over_09_f32,
//                              0.0f)
//   7) return this.compositor                                        @0x102786
//
// UNDECODED CALLEES (throw-stubs per PORTING_SPEC.md rule 3):
//   HgcLogVideo_encode::HgcLogVideo_encode()  __ZN18HgcLogVideo_encodeC1Ev — invoked @0x10243f
//   HGColorMatrix::HGColorMatrix()            __ZN13HGColorMatrixC1Ev      — invoked @0x102423
//   HGColorMatrix::LoadMatrix(...)            __ZN13HGColorMatrix10LoadMatrixEPKDv4_fb — invoked @0x10270f
//   HGObject::operator new(unsigned long)     __ZN8HGObjectnwEm            — invoked @0x102418 / @0x102434
//   HGObject::operator delete(void*)          __ZN8HGObjectdlEPv           — invoked @0x1026b8 (D0 tail-jmp)
//   HGRenderer::GetInput(HGNode*, int)        __ZN10HGRenderer8GetInputEP6HGNodei — invoked @0x1026e9
//   HgcLogVideo_encode/HGColorMatrix vtable slots *0x18 (Release),
//                                             *0x60 (SetParameter),
//                                             *0x78 (SetInput).
//   (HGNode ctor/dtor ARE ported and imported from ./HGNode.js.)
//   (`HGARRILogC::logCurveParameters` IS ported — see ./HGARRILogC.js.)

import { HGNode } from './HGNode.js';
import { HGARRILogC, HGARRILogC_ParamRow } from './HGARRILogC.js';

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
 * at @Helium 0x1026e9.
 */
export interface HGRendererStub {
  /** @Helium 0x1026e9 — vcalled. Signature `GetInput(HGNode*, int) -> HGNode*`. */
  GetInput(node: HGNode, idx: number): HGNode;
}

/**
 * Placeholder for the color-matrix node owned at `this.matrix`
 * (`+0x198`). Undecoded — exposes only the vtable slots we call.
 *
 *   - `SetInput(idx, input)` via slot *0x78 — invoked @0x1026f9 with (0, input).
 *   - `LoadMatrix(mat, transpose)`         — invoked @0x10270f with (this.matrixSrcRow, true).
 *      Mangled __ZN13HGColorMatrix10LoadMatrixEPKDv4_fb — the second arg
 *      is a bool (edx=1) and the first is a pointer to a 4-float vector
 *      array (a 4×4 row-major float32 matrix in this call site).
 *   - `Release()` via slot *0x18 — invoked from all three dtors.
 */
export interface HGColorMatrix {
  /** vtable *0x78 @Helium — @0x1026f9. Argument order (esi=idx, rdx=input). */
  SetInput(idx: number, input: HGNode): void;
  /**
   * Non-vtable direct call to `HGColorMatrix::LoadMatrix(...)`.
   * @Helium 0x10270f with edx=1 (transpose).
   */
  LoadMatrix(matrix: readonly number[], transpose: boolean): void;
  /** vtable *0x18 @Helium — invoked from D0/D1/D2 (@0x1025f2, 0x102642, 0x102692). */
  Release(): void;
}

/**
 * Placeholder for the segmented log-video encoder owned at
 * `this.compositor` (`+0x1a0`). Undecoded — exposes only the vtable
 * slots we call.
 *
 *   - `SetInput(idx, input)` via slot *0x78 — invoked @0x102727 with (0, matrix).
 *   - `SetParameter(idx, xmm0, xmm1, xmm2, xmm3)` via slot *0x60
 *          — invoked @0x102756 with (0, 5.0, a, b*log10(2), c)      // LOG segment
 *          — invoked @0x102783 with (1, d*0.9, e, cut/0.9, 0.0)     // LINEAR segment
 *   - `Release()` via slot *0x18 — invoked from all three dtors
 *          (@0x102604, 0x102654, 0x1026a4).
 */
export interface HgcLogVideo_encode {
  /** vtable *0x78 @Helium — @0x102727. */
  SetInput(idx: number, input: HGNode): void;
  /** vtable *0x60 @Helium — argument order (esi, xmm0, xmm1, xmm2, xmm3). */
  SetParameter(idx: number, a: number, b: number, c: number, d: number): void;
  /** vtable *0x18 @Helium — invoked from dtors. */
  Release(): void;
}

/**
 * Placeholder for the compositor allocation + ctor sequence @Helium
 * 0x10242f..0x10243f:
 *   0x10242f  movl  $0x1a0,%edi                     ; alloc size = 0x1A0 = 416
 *   0x102434  callq __ZN8HGObjectnwEm               ; HGObject::operator new
 *   0x10243f  callq __ZN18HgcLogVideo_encodeC1Ev    ; placement ctor
 * Throws until the class is transcribed (rule 3).
 */
function newHgcLogVideo_encode(): HgcLogVideo_encode {
  throw new Error(
    "HGARRILogC::Encode: HgcLogVideo_encode ctor + HGObject::operator new @Helium 0x102434/0x10243f not yet transcribed"
  );
}

/**
 * Placeholder for the color-matrix allocation + ctor sequence @Helium
 * 0x102413..0x102423:
 *   0x102413  movl  $0x1f0,%edi                     ; alloc size = 0x1F0 = 496
 *   0x102418  callq __ZN8HGObjectnwEm               ; HGObject::operator new
 *   0x102423  callq __ZN13HGColorMatrixC1Ev         ; placement ctor
 * Throws until the class is transcribed (rule 3).
 */
function newHGColorMatrix(): HGColorMatrix {
  throw new Error(
    "HGARRILogC::Encode: HGColorMatrix ctor + HGObject::operator new @Helium 0x102418/0x102423 not yet transcribed"
  );
}

// ---------------------------------------------------------------------------
// Static data: `HGARRILogC::Encode::sourceToARRIWideGamut` @Helium 0x3d1680.
//
// 2 entries × 0x40 = 128 bytes; each entry is a 4×4 row-major float32
// matrix (source RGB → ARRI Wide Gamut RGB). Indexed by the
// SceneColorimetry enum (0 or 1). Ctor addressing @0x102452..0x10245c
// stores `sourceToARRIWideGamut + (colorimetry << 6)` into
// `this.matrixSrcRow (+0x1a8)`; GetOutput then hands that pointer to
// `HGColorMatrix::LoadMatrix` with transpose=true (edx=1).
//
// Values below are byte-exact reads from the Helium x86_64 slice at
// file offset 0x3d1680 (VA == file-offset in the thin slice).
// ---------------------------------------------------------------------------

/**
 * `HGARRILogC::Encode::sourceToARRIWideGamut` @Helium 0x3d1680.
 * `sourceToARRIWideGamut[colorimetry]` is a 16-float row-major 4×4
 * matrix (float32).
 *
 * Row 0 (`colorimetry=0`) — the last row is `[0, 0, 0, 1]` (an affine
 * matrix carrying a homogeneous coordinate), and the top-left 3×3 is
 * the source-gamut → ARRI Wide Gamut transform for the first
 * colorimetry mode. The specific colorimetry semantics
 * (Rec.709/Rec.2020/etc.) are declared in the `SceneColorimetry`
 * enum, which is NOT yet decoded — the port carries the raw table
 * data and leaves interpretation to the caller.
 */
export const HGARRILogCEncode_sourceToARRIWideGamut: readonly (readonly number[])[] = [
  // @Helium 0x3d1680  entry[0] — 16 floats (row-major 4×4)
  [
    Math.fround( 0.6313210725784302), Math.fround( 0.2708010673522949), Math.fround( 0.0978779345750809), Math.fround(0.0),
    Math.fround( 0.0368200987577438), Math.fround( 0.7930369973182678), Math.fround( 0.1701430082321167), Math.fround(0.0),
    Math.fround( 0.0173700004816055), Math.fround( 0.1487889885902405), Math.fround( 0.8338410258293152), Math.fround(0.0),
    Math.fround( 0.0),                Math.fround( 0.0),                Math.fround( 0.0),                Math.fround(1.0),
  ],
  // @Helium 0x3d16c0  entry[1] — 16 floats (row-major 4×4)
  [
    Math.fround( 1.0127979516983032), Math.fround(-0.0740450024604797), Math.fround( 0.0612469986081123), Math.fround(0.0),
    Math.fround(-0.0407220013439655), Math.fround( 0.8596820235252380), Math.fround( 0.1810400038957596), Math.fround(0.0),
    Math.fround(-0.0048239999450743), Math.fround( 0.0744889974594116), Math.fround( 0.9303349852561950), Math.fround(0.0),
    Math.fround( 0.0),                Math.fround( 0.0),                Math.fround( 0.0),                Math.fround(1.0),
  ],
] as const;

// ---------------------------------------------------------------------------
// RIP-relative double constants used by C2 tail math (@0x10251e..0x102578).
// Resolved via `raw-port/army/tools/resolve.py Helium const 0xADDR`.
// ---------------------------------------------------------------------------

/**
 * @Helium 0x3d0e48 = 0.3010299956639812 (log10(2), IEEE 754 double).
 * Multiplied into `p.b` @0x102523 to pre-scale the log-region "b"
 * coefficient before the compositor's segmented log shader consumes
 * it. RIP-relative operand: `mulsd 0x2ce91d(%rip), %xmm0` — target
 * address = (0x102523 + 8) + 0x2ce91d = 0x3d0e48.
 */
const HGARRILogC_Encode_log10_2: number = 0.3010299956639812;

/**
 * @Helium 0x3d0e50 = 0.9 (IEEE 754 double).
 * Loaded into xmm1 @0x10252b via `movsd 0x2ce91d(%rip), %xmm1` —
 * target address = (0x10252b + 8) + 0x2ce91d = 0x3d0e50. Then used
 * both as a multiplier (`p.d * 0.9`) and as a divisor
 * (`p.cut / 0.9`) in the coefficient-precompute block.
 */
const HGARRILogC_Encode_zero_point_nine: number = 0.9;

// ---------------------------------------------------------------------------
// The class.
// ---------------------------------------------------------------------------

/**
 * SceneColorimetry enum placeholder — the underlying enum's meanings
 * (Rec.709 vs Rec.2020 vs …) are not yet decoded. Ctor accepts a
 * `number` here (u32 in the C++ signature); we DO NOT bound-check or
 * remap it — the disasm doesn't either, and the raw value indexes
 * `sourceToARRIWideGamut` directly.
 */
export type HGARRILogCEncode_SceneColorimetry = number;

/**
 * `HGARRILogC::Encode` — Helium HGNode subclass. Wraps a color-matrix
 * stage (source-gamut → ARRI Wide Gamut) followed by an
 * HgcLogVideo_encode compositor configured for the ARRI ALEXA LogC
 * forward transfer function at a specified Exposure Index.
 *
 * @Helium ctors     @0x1023f0 (C2) / @0x1025c0 (C1);
 *         dtors     @0x1025d0 (D2) / @0x102620 (D1) / @0x102670 (D0);
 *         GetOutput @0x1026d0.
 */
export class HGARRILogCEncode extends HGNode {
  /**
   * Owned `HGColorMatrix`. Field @0x198.
   * Assigned in ctor @0x102428: `movq %r12, 0x198(%rbx)`.
   */
  matrix: HGColorMatrix | null;

  /**
   * Owned `HgcLogVideo_encode` compositor. Field @0x1a0.
   * Assigned in ctor @0x102444: `movq %r12, 0x1a0(%rbx)`.
   */
  compositor: HgcLogVideo_encode | null;

  /**
   * Pointer into `HGARRILogCEncode_sourceToARRIWideGamut` at
   * `[colorimetry]`. Field @0x1a8.
   * Assigned in ctor @0x10245c: `movq %rcx, 0x1a8(%rbx)`, where rcx
   * was set to `sourceToARRIWideGamut + (colorimetry<<6)` at
   * @0x102452..0x102459.
   */
  matrixSrcRow: readonly number[];

  /**
   * Field @0x1b0 (float). Immediate 0x40A00000 = 5.0f, stored at
   * @0x102514: `movl $0x40a00000, 0x1b0(%rbx)`. Consumed as xmm0 of
   * the log-segment SetParameter call in GetOutput.
   */
  constant5f: number;

  /** Field @0x1b4 (float). = f32(p.a). Stored @0x10255a (movupd low). */
  a_f32: number;

  /** Field @0x1b8 (float). = f32(p.b * log10(2)). Stored @0x10255a. */
  b_log10_2_f32: number;

  /** Field @0x1bc (float). = f32(p.c). Stored @0x10255a. */
  c_f32: number;

  /** Field @0x1c0 (float). = f32(p.d * 0.9). Stored @0x10255a (movupd high). */
  d_times_09_f32: number;

  /** Field @0x1c4 (float). = f32(p.e). Stored @0x102578 (movlpd low). */
  e_f32: number;

  /** Field @0x1c8 (float). = f32(p.cut / 0.9). Stored @0x102578 (movlpd high). */
  cut_over_09_f32: number;

  /**
   * `HGARRILogC::Encode::Encode(SceneColorimetry colorimetry, unsigned int ei)`
   * — Helium @0x1023f0 (C2 base-object ctor). C1 @0x1025c0 tail-jmps
   * to C2 so only C2's body needs modelling.
   *
   * Verbatim asm (@0x1023f0..0x102588, prologue/epilogue elided):
   *   0x1023fb  movl  %edx, %r14d                     ; r14d = ei
   *   0x1023fe  movl  %esi, %r15d                     ; r15d = colorimetry
   *   0x102401  movq  %rdi, %rbx                      ; rbx  = this
   *   0x102404  callq __ZN6HGNodeC2Ev                 ; base ctor
   *   0x102409  leaq  0x916170(%rip), %rax            ; = 0xa18580 (own vtable installed ptr)
   *   0x102410  movq  %rax, (%rbx)                    ; *this = vtable
   *   0x102413  movl  $0x1f0, %edi                    ; alloc 0x1F0 for HGColorMatrix
   *   0x102418  callq __ZN8HGObjectnwEm
   *   0x102423  callq __ZN13HGColorMatrixC1Ev
   *   0x102428  movq  %r12, 0x198(%rbx)               ; this.matrix = new HGColorMatrix
   *   0x10242f  movl  $0x1a0, %edi                    ; alloc 0x1A0 for HgcLogVideo_encode
   *   0x102434  callq __ZN8HGObjectnwEm
   *   0x10243f  callq __ZN18HgcLogVideo_encodeC1Ev
   *   0x102444  movq  %r12, 0x1a0(%rbx)               ; this.compositor = new HgcLogVideo_encode
   *   0x10244b  movl  %r15d, %eax                     ; eax = colorimetry
   *   0x10244e  shlq  $0x6, %rax                      ; rax = colorimetry * 0x40
   *   0x102452  leaq  sourceToARRIWideGamut(%rip),%rcx
   *   0x102459  addq  %rax, %rcx
   *   0x10245c  movq  %rcx, 0x1a8(%rbx)               ; this.matrixSrcRow = &table[colorimetry]
   *   0x102463  movq  logCurveParameters(%rip), %rax  ; rax = HGARRILogC::logCurveParameters
   *   0x10246a..0x10250d  band-selection ladder — exactly the same
   *                       thresholds as HGARRILogC::logCurveParamsForEI,
   *                       but INLINED here. Every fall-through branch
   *                       either does `addq $offset,%rax` and jumps to
   *                       @0x102514, or the branchless final case
   *                       (`movl $0x1f8,%ecx ; movl $0x230,%eax ;
   *                       cmovbq %rcx,%rax ; addq base(%rip),%rax`).
   *                       Thresholds: 180, 225, 285, 360, 450, 570,
   *                       720, 900, 1140, 1440 — nearest-neighbour EI
   *                       midpoints. See HGARRILogC.ts for the shared
   *                       lookup body — we DELEGATE to that ported
   *                       function rather than duplicate the ladder.
   *   0x102514  movl  $0x40a00000, 0x1b0(%rbx)        ; this.constant5f = 5.0f
   *   0x10251e  movsd 0x18(%rax), %xmm0               ; xmm0 = p.b
   *   0x102523  mulsd 0x2ce91d(%rip), %xmm0           ; xmm0 = p.b * log10(2)
   *   0x10252b  movsd 0x2ce91d(%rip), %xmm1           ; xmm1 = 0.9
   *   0x102533  movsd 0x28(%rax), %xmm2               ; xmm2 = p.d
   *   0x102538  mulsd %xmm1, %xmm2                    ; xmm2 = p.d * 0.9
   *   0x10253c  movsd 0x20(%rax), %xmm3               ; xmm3 = p.c
   *   0x102541  unpcklpd %xmm2, %xmm3                 ; xmm3 = [p.c, p.d*0.9]
   *   0x102545  movsd 0x10(%rax), %xmm2               ; xmm2 = p.a
   *   0x10254a  cvtpd2ps %xmm3, %xmm3                 ; xmm3 = [f32(p.c), f32(p.d*0.9), 0, 0]
   *   0x10254e  unpcklpd %xmm0, %xmm2                 ; xmm2 = [p.a, p.b*log10(2)]
   *   0x102552  cvtpd2ps %xmm2, %xmm0                 ; xmm0 = [f32(p.a), f32(p.b*log10(2)), 0, 0]
   *   0x102556  unpcklpd %xmm3, %xmm0                 ; xmm0 = [f32(p.a), f32(p.b*log10(2)),
   *                                                              f32(p.c), f32(p.d*0.9)]
   *   0x10255a  movupd %xmm0, 0x1b4(%rbx)             ; write 4 floats @1b4..1c3
   *   0x102562  movsd 0x8(%rax), %xmm0                ; xmm0 = p.cut
   *   0x102567  divsd %xmm1, %xmm0                    ; xmm0 = p.cut / 0.9
   *   0x10256b  movsd 0x30(%rax), %xmm1               ; xmm1 = p.e
   *   0x102570  unpcklpd %xmm0, %xmm1                 ; xmm1 = [p.e, p.cut/0.9]
   *   0x102574  cvtpd2ps %xmm1, %xmm0                 ; xmm0 = [f32(p.e), f32(p.cut/0.9), 0, 0]
   *   0x102578  movlpd %xmm0, 0x1c4(%rbx)             ; write 2 floats @1c4..1cb
   *   0x102580..0x102588  epilogue, retq.
   *
   * The exception-cleanup path @0x102589..0x1025b9 handles a throwing
   * HgcLogVideo_encode ctor or HGObject::operator new: it deletes the
   * partially-constructed compositor pointer (r12) via
   * `HGObject::operator delete`, calls `HGNode::~HGNode()`, and
   * resumes the unwind. It never executes on a successful construction
   * and is not modelled explicitly (TS exceptions unwind through the
   * stack naturally).
   *
   * @param colorimetry  SceneColorimetry (u32; NOT bounds-checked; indexes
   *                     `sourceToARRIWideGamut`; the disasm doesn't check
   *                     either, so neither do we).
   * @param ei           raw ARRI Exposure Index (u32).
   */
  constructor(colorimetry: HGARRILogCEncode_SceneColorimetry, ei: number) {
    // @Helium 0x102404: HGNode base ctor.
    super();
    // @Helium 0x102410: install this class's vtable (installed ptr = 0xa18580).
    this.vtable = 0xa18580;
    // @Helium 0x102413..0x102428: alloc + ctor HGColorMatrix, store @0x198.
    // Throws until HGColorMatrix is transcribed.
    this.matrix = newHGColorMatrix();
    // @Helium 0x10242f..0x102444: alloc + ctor HgcLogVideo_encode, store @0x1a0.
    // Throws until HgcLogVideo_encode is transcribed.
    this.compositor = newHgcLogVideo_encode();
    // @Helium 0x10244b..0x10245c: matrixSrcRow = &sourceToARRIWideGamut[colorimetry]
    // (the << 6 is a 64-byte stride pointing at the head of each 4×4 f32 matrix).
    this.matrixSrcRow = HGARRILogCEncode_sourceToARRIWideGamut[colorimetry];
    // @Helium 0x102463..0x10250d: inlined copy of HGARRILogC::logCurveParamsForEI.
    // We delegate to the shared, already-ported lookup — same thresholds,
    // same fall-through-to-row[0] semantics.
    const p: HGARRILogC_ParamRow = HGARRILogC.logCurveParamsForEI(ei);
    // @Helium 0x102514: this.constant5f = 5.0f
    this.constant5f = Math.fround(5.0);
    // @Helium 0x10251e..0x10255a: precompute 4-wide a/b*log10(2)/c/d*0.9 as f32.
    // Bit-exact modelling of the cvtpd2ps narrowings — we compute each product
    // in JS double and then Math.fround it (which mirrors cvtsd2ss/cvtpd2ps).
    this.a_f32          = Math.fround(p.a);
    this.b_log10_2_f32  = Math.fround(p.b * HGARRILogC_Encode_log10_2);
    this.c_f32          = Math.fround(p.c);
    this.d_times_09_f32 = Math.fround(p.d * HGARRILogC_Encode_zero_point_nine);
    // @Helium 0x102562..0x102578: precompute e / cut*(1/0.9) as f32.
    this.e_f32           = Math.fround(p.e);
    this.cut_over_09_f32 = Math.fround(p.cut / HGARRILogC_Encode_zero_point_nine);
  }

  /**
   * `HGARRILogC::Encode::~Encode()` — Helium @0x1025d0 (D2, base-object)
   * / @0x102620 (D1, complete-object) / @0x102670 (D0, deleting).
   *
   * All three share the same body up through the base-dtor call; D0
   * additionally tail-calls `HGObject::operator delete`. D0's body
   * (@0x102670..0x1026b8):
   *   leaq  0x915f00(%rip), %rax         ; = 0xa18580 (reinstall own vtable)
   *   movq  %rax, (%rdi)
   *   movq  0x198(%rdi), %rdi            ; matrix
   *   testq %rdi, %rdi ; je  ...         ; skip if null
   *   movq  (%rdi), %rax ; callq *0x18(%rax) ; matrix.Release()
   *   movq  0x1a0(%rbx), %rdi            ; compositor
   *   testq %rdi, %rdi ; je  ...
   *   movq  (%rdi), %rax ; callq *0x18(%rax) ; compositor.Release()
   *   movq  %rbx, %rdi ; callq __ZN6HGNodeD2Ev  ; HGNode::~HGNode()
   *   movq  %rbx, %rdi ; jmp   __ZN8HGObjectdlEPv ; delete this
   *
   * D2 @0x1025d0 and D1 @0x102620 have byte-identical bodies except:
   *   - the vtable-reinstall leaq displacement is different (RIP differs)
   *   - the HGNode dtor is called via `jmp` (tail-call) instead of `call`
   *   - no operator-delete after the HGNode dtor.
   *
   * We model D0's operator-delete step at the JS caller (dropping the
   * reference) — TS has no explicit `delete this`.
   */
  destruct(): void {
    // @Helium 0x1025e0/0x102630/0x102680: vtable reinstall — modeled by assignment.
    this.vtable = 0xa18580;
    // @Helium 0x1025e3..0x1025f2 (D2): release matrix if present.
    if (this.matrix != null) {
      this.matrix.Release();
      this.matrix = null;
    }
    // @Helium 0x1025f5..0x102604 (D2): release compositor if present.
    if (this.compositor != null) {
      this.compositor.Release();
      this.compositor = null;
    }
    // @Helium 0x102610 (D2) / 0x102660 (D1): jmp HGNode::~HGNode(). D0 uses callq
    // and then tail-jmps to HGObject::operator delete (handled by the caller
    // dropping the reference in TS).
    super.destruct();
  }

  /**
   * `HGARRILogC::Encode::GetOutput(HGRenderer* renderer)` — Helium
   * @0x1026d0.
   *
   * Wires the owned matrix + compositor into the render graph:
   *   1) fetch this node's input at slot 0
   *   2) hand it to the matrix as input slot 0    (matrix.SetInput slot *0x78)
   *   3) load the source→ARRI matrix (transposed) (matrix.LoadMatrix)
   *   4) hand the matrix into the compositor      (compositor.SetInput slot *0x78)
   *   5) SetParameter(0,  5.0f, a, b*log10(2), c) (LOG segment,    slot *0x60)
   *   6) SetParameter(1,  d*0.9, e, cut/0.9, 0.0) (LINEAR segment, slot *0x60)
   *   7) return the compositor.
   *
   * Verbatim asm (@0x1026d0..0x102791, prologue/epilogue elided):
   *   0x1026da  movq  0x198(%rdi), %r14           ; r14 = this.matrix
   *   0x1026e1  movq  %rsi, %rdi                  ; rdi = renderer
   *   0x1026e4  movq  %rbx, %rsi                  ; rsi = this
   *   0x1026e7  xorl  %edx, %edx
   *   0x1026e9  callq __ZN10HGRenderer8GetInputEP6HGNodei ; input = renderer.GetInput(this, 0)
   *   0x1026ee  movq  (%r14), %rcx                ; rcx = matrix.vtable
   *   0x1026f1  movq  %r14, %rdi                  ; rdi = matrix
   *   0x1026f4  xorl  %esi, %esi
   *   0x1026f6  movq  %rax, %rdx                  ; rdx = input
   *   0x1026f9  callq *0x78(%rcx)                 ; matrix.SetInput(0, input)
   *   0x1026fc  movq  0x198(%rbx), %rdi           ; rdi = this.matrix
   *   0x102703  movq  0x1a8(%rbx), %rsi           ; rsi = this.matrixSrcRow
   *   0x10270a  movl  $0x1, %edx                  ; edx = 1 (transpose)
   *   0x10270f  callq __ZN13HGColorMatrix10LoadMatrixEPKDv4_fb
   *                                                ; matrix.LoadMatrix(matrixSrcRow, true)
   *   0x102714  movq  0x198(%rbx), %rdx           ; rdx = this.matrix (input for next stage)
   *   0x10271b  movq  0x1a0(%rbx), %rdi           ; rdi = this.compositor
   *   0x102722  movq  (%rdi), %rax                ; rax = compositor.vtable
   *   0x102725  xorl  %esi, %esi
   *   0x102727  callq *0x78(%rax)                 ; compositor.SetInput(0, matrix)
   *   0x10272a  movq  0x1a0(%rbx), %rdi           ; rdi = this.compositor
   *   0x102731  movss 0x1b0(%rbx), %xmm0          ; xmm0 = 5.0f
   *   0x102739  movss 0x1b4(%rbx), %xmm1          ; xmm1 = a_f32
   *   0x102741  movss 0x1b8(%rbx), %xmm2          ; xmm2 = b*log10(2)_f32
   *   0x102749  movss 0x1bc(%rbx), %xmm3          ; xmm3 = c_f32
   *   0x102751  movq  (%rdi), %rax                ; rax = compositor.vtable
   *   0x102754  xorl  %esi, %esi
   *   0x102756  callq *0x60(%rax)                 ; compositor.SetParameter(0, 5.0f, a, b*log10(2), c)
   *   0x102759  movq  0x1a0(%rbx), %rdi           ; rdi = this.compositor
   *   0x102760  movss 0x1c0(%rbx), %xmm0          ; xmm0 = d*0.9_f32
   *   0x102768  movss 0x1c4(%rbx), %xmm1          ; xmm1 = e_f32
   *   0x102770  movss 0x1c8(%rbx), %xmm2          ; xmm2 = cut/0.9_f32
   *   0x102778  movq  (%rdi), %rax                ; rax = compositor.vtable
   *   0x10277b  xorps %xmm3, %xmm3                ; xmm3 = 0.0f
   *   0x10277e  movl  $0x1, %esi
   *   0x102783  callq *0x60(%rax)                 ; compositor.SetParameter(1, d*0.9, e, cut/0.9, 0.0)
   *   0x102786  movq  0x1a0(%rbx), %rax           ; rax = this.compositor
   *   0x10278d..0x102791  epilogue, retq.
   *
   * @param renderer  the containing HGRenderer (undecoded — only
   *                  `GetInput` is invoked here).
   * @returns         the compositor node this class wraps (i.e. the
   *                  output of this filter in the graph).
   */
  GetOutput(renderer: HGRendererStub): HGNode {
    // @Helium 0x1026da: r14 = this.matrix. Invariant: non-null after ctor.
    const matrix = this.matrix;
    const comp = this.compositor;
    if (matrix == null || comp == null) {
      // C++ path where this is unreachable — but TS type-narrowing
      // wants the null guard, and a loud fault is preferable to `!`
      // (rule 3).
      throw new Error(
        "HGARRILogC::Encode::GetOutput @Helium 0x1026da — matrix or compositor null (should be unreachable after ctor)"
      );
    }
    // @Helium 0x1026e9: input = renderer.GetInput(this, 0)
    const input = renderer.GetInput(this, 0);
    // @Helium 0x1026f9: matrix.SetInput(0, input) via vtable *0x78
    matrix.SetInput(0, input);
    // @Helium 0x10270f: matrix.LoadMatrix(this.matrixSrcRow, /*transpose=*/true)
    matrix.LoadMatrix(this.matrixSrcRow, true);
    // @Helium 0x102727: compositor.SetInput(0, matrix) via vtable *0x78
    comp.SetInput(0, matrix as unknown as HGNode);
    // @Helium 0x102756: compositor.SetParameter(0, 5.0f, a, b*log10(2), c) — LOG segment.
    comp.SetParameter(
      0,
      this.constant5f,
      this.a_f32,
      this.b_log10_2_f32,
      this.c_f32,
    );
    // @Helium 0x102783: compositor.SetParameter(1, d*0.9, e, cut/0.9, 0.0f) — LINEAR segment.
    comp.SetParameter(
      1,
      this.d_times_09_f32,
      this.e_f32,
      this.cut_over_09_f32,
      Math.fround(0.0),
    );
    // @Helium 0x102786: return this.compositor (cast to HGNode by C++ inheritance).
    return comp as unknown as HGNode;
  }
}
