// raw-port/src/render/HGBMDFilm_Encode.ts
//
// FCP `HGBMDFilm::Encode` — nested Helium HGNode subclass. Wraps an
// owned `HGColorMatrix` (source-colorimetry → Blackmagic Design "Film"
// RGB working space) chained into an owned `HgcLogVideo_encode`
// compositor configured for the Blackmagic Design pre-Gen5 "Film" log
// OETF (linear scene-linear → BMD Film log-encoded video). Structural
// twin of `HGACEScct::Encode` / `HGARRILogC::Encode` /
// `HGAppleLog::Encode` / `HGSonySLog3::Encode`.
//
// Compared to those siblings:
//   • Two color-space matrix tables (`sourceToBMDFilmRGB` and
//     `sourceToBMDFilm4KRGB`), selected by the `LogEncoding` ctor arg
//     (LogEncoding==0 → non-4K, else → 4K).
//   • Six SetParameter floats are picked from four RIP-rel float pairs
//     + two shared scalar constants: xmm0-xmm3 of segment 0 and xmm0-xmm2
//     of segment 1 all come from `__const` data — there is NO ctor-side
//     precompute-and-store block (unlike ARRI where six f32s are
//     computed from an EI parameter row). Only ONE int field (u32
//     `logEncoding` @+0x1b0) is stored between ctor and GetOutput; every
//     other float is fetched fresh from __const in GetOutput.
//
// FRAMEWORK: Helium.framework
// FAT slice offset: 0x4000; thin binary /tmp/Helium.x86_64 has VA ==
// file offset (segment __TEXT vmaddr = 0). Constants read via
// `raw-port/army/tools/resolve.py Helium const 0x…`.
//
// DISASSEMBLY (extracted from /tmp/Helium_tV.txt):
//   __ZN9HGBMDFilm6EncodeC2ENS_16SceneColorimetryENS_11LogEncodingE  @0x103210  [C2]
//   __ZN9HGBMDFilm6EncodeC1ENS_16SceneColorimetryENS_11LogEncodingE  @0x1032e0  [C1 — tail-jmp to C2]
//   __ZN9HGBMDFilm6EncodeD2Ev                                        @0x1032f0  [D2]
//   __ZN9HGBMDFilm6EncodeD1Ev                                        @0x103340  [D1]
//   __ZN9HGBMDFilm6EncodeD0Ev                                        @0x103390  [D0]
//   __ZN9HGBMDFilm6Encode9GetOutputEP10HGRenderer                    @0x1033f0  [GetOutput]
//   __ZN9HGBMDFilm6Encode18sourceToBMDFilmRGBE                       @0x3d1830  [static data, 128B]
//   __ZN9HGBMDFilm6Encode20sourceToBMDFilm4KRGBE                     @0x3d18b0  [static data, 128B]
//
// VTABLE:
//   All four vtable-install `leaq` displacements resolve to the same
//   installed pointer 0xa18e80 (= "vtable for HGBMDFilm::Encode + 0x10"
//   per Itanium ABI):
//     C2 @0x103229 leaq 0x915c50(%rip) → 0x103230 + 0x915c50 = 0xa18e80
//     D2 @0x1032f9 leaq 0x915b80(%rip) → 0x103300 + 0x915b80 = 0xa18e80
//     D1 @0x103349 leaq 0x915b30(%rip) → 0x103350 + 0x915b30 = 0xa18e80
//     D0 @0x103399 leaq 0x915ae0(%rip) → 0x1033a0 + 0x915ae0 = 0xa18e80
//
// CTOR ARG ORDER (from `movl %edx, %r14d ; movl %esi, %r15d` @0x10321b):
//   rdi = this
//   esi = colorimetry (SceneColorimetry enum, u32; captured into r15d)
//   edx = logEncoding (LogEncoding      enum, u32; captured into r14d)
//
// STRUCT LAYOUT (recovered from C2 + GetOutput):
//   HGBMDFilm::Encode extends HGNode (base ctor @0x103224). Subclass
//   fields:
//     0x198 : HGColorMatrix*      matrix        (allocated @0x103238, size 0x1F0)
//     0x1a0 : HgcLogVideo_encode* compositor    (allocated @0x103254, size 0x1A0)
//     0x1a8 : const void*         matrixSrcRow  (pointer into one of the two
//                                                  source-gamut tables, offset =
//                                                  colorimetry * 0x40)
//     0x1b0 : u32                 logEncoding   (raw arg; NOT a float — see
//                                                  `movl %r14d, 0x1b0(%rbx)` @0x103291)
//   sizeof = 0x1b4 (aligned up). No further fields touched by any
//   ported entry point.
//
// STATIC DATA:
//   `sourceToBMDFilmRGB`   @0x3d1830 (2 × 0x40 = 128 bytes; 2 × 4×4
//                                    row-major float32 matrices)
//   `sourceToBMDFilm4KRGB` @0x3d18b0 (2 × 0x40 = 128 bytes; 2 × 4×4
//                                    row-major float32 matrices)
//   Both indexed by `colorimetry ∈ {0, 1}`. Values below are byte-exact
//   against the Helium x86_64 slice.
//
// CTOR TABLE SELECTION (@0x10326b..0x10328a) — pure branchless cmov:
//   testl %r14d, %r14d           ; ZF = (logEncoding == 0)
//   leaq  sourceToBMDFilmRGB, %rcx
//   leaq  sourceToBMDFilm4KRGB, %rdx
//   cmoveq %rcx, %rdx            ; if logEncoding == 0, rdx = non-4K table
//                                ;                else rdx keeps 4K table
//   addq  %rax, %rdx             ; rdx += colorimetry * 0x40
//   movq  %rdx, 0x1a8(%rbx)      ; this.matrixSrcRow = &table[colorimetry]
//   movl  %r14d, 0x1b0(%rbx)     ; this.logEncoding = raw u32 arg
//
// GETOUTPUT (@0x1033f0..0x103500) — rendering-graph wiring + fresh
// __const fetches for the six SetParameter floats:
//   1) input = renderer.GetInput(this, 0)                           @0x10340d
//   2) matrix.vtable[0x78](0, input)     // SetInput slot 0         @0x10341d
//   3) matrix.LoadMatrix(this.matrixSrcRow, /*transpose=*/true)     @0x103433
//   4) eax = ((this.logEncoding == 0) ? 1 : 0) << 2                @0x103438..0x103444
//        (i.e. eax == 4 when logEncoding == 0 (non-4K), eax == 0 otherwise (4K))
//   5) Four RIP-rel float pairs loaded with `movss [eax + rcx], xmm0`
//      + eax = 4 (non-4K) picks table[+4]; eax = 0 (4K) picks table[0]:
//        @0x103447 base = 0x3d0e78 → seg1_x  (K8_..._POST magnitude)
//        @0x103458 base = 0x3d0e80 → seg0_z  (unnamed BMD Film coef)
//        @0x103469 base = 0x3d0e88 → seg1_y  (K6_..._ADD  magnitude)
//        @0x10347a base = 0x3d0e90 → seg0_w  (unnamed BMD Film coef)
//      Each of the four bases holds 2 f32s: [0]=4K variant, [+4]=non-4K variant.
//   6) compositor.vtable[0x78](0, matrix)  // SetInput                @0x10349e
//   7) compositor.vtable[0x60](0, 5.0f, seg1_x, seg0_z, seg1_y)      @0x1034c4  (LOG segment)
//   8) compositor.vtable[0x60](1, seg0_w, 0.09286413f, 0.00555556f, 0.0f) @0x1034ee (LINEAR segment)
//   9) return this.compositor                                       @0x1034f1
//
// UNDECODED CALLEES (throw-stubs per PORTING_SPEC.md rule 3):
//   HgcLogVideo_encode::HgcLogVideo_encode()  __ZN18HgcLogVideo_encodeC1Ev — invoked @0x10325f
//   HGColorMatrix::HGColorMatrix()            __ZN13HGColorMatrixC1Ev      — invoked @0x103243
//   HGColorMatrix::LoadMatrix(...)            __ZN13HGColorMatrix10LoadMatrixEPKDv4_fb — invoked @0x103433
//   HGObject::operator new(unsigned long)     __ZN8HGObjectnwEm            — invoked @0x103238 / @0x103254
//   HGObject::operator delete(void*)          __ZN8HGObjectdlEPv           — invoked @0x1033d8 (D0 tail-jmp)
//   HGRenderer::GetInput(HGNode*, int)        __ZN10HGRenderer8GetInputEP6HGNodei — invoked @0x10340d
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
 * at @Helium 0x10340d.
 */
export interface HGRendererStub {
  /** @Helium 0x10340d — vcalled. Signature `GetInput(HGNode*, int) -> HGNode*`. */
  GetInput(node: HGNode, idx: number): HGNode;
}

/**
 * Placeholder for the color-matrix node owned at `this.matrix`
 * (`+0x198`). Undecoded — exposes only the vtable slots we call.
 *
 *   - `SetInput(idx, input)` via slot *0x78 — invoked @0x10341d with (0, input).
 *   - `LoadMatrix(mat, transpose)`         — invoked @0x103433 with (this.matrixSrcRow, true).
 *      Mangled __ZN13HGColorMatrix10LoadMatrixEPKDv4_fb — the second arg
 *      is a bool (edx=1) and the first is a pointer to a 4-float vector
 *      array (a 4×4 row-major float32 matrix in this call site).
 *   - `Release()` via slot *0x18 — invoked from all three dtors.
 */
export interface HGColorMatrix {
  /** vtable *0x78 @Helium — @0x10341d. Argument order (esi=idx, rdx=input). */
  SetInput(idx: number, input: HGNode): void;
  /**
   * Non-vtable direct call to `HGColorMatrix::LoadMatrix(...)`.
   * @Helium 0x103433 with edx=1 (transpose).
   */
  LoadMatrix(matrix: readonly number[], transpose: boolean): void;
  /** vtable *0x18 @Helium — invoked from D0/D1/D2 (@0x103312, 0x103362, 0x1033b2). */
  Release(): void;
}

/**
 * Placeholder for the segmented log-video encoder owned at
 * `this.compositor` (`+0x1a0`). Undecoded — exposes only the vtable
 * slots we call.
 *
 *   - `SetInput(idx, input)` via slot *0x78 — invoked @0x10349e with (0, matrix).
 *   - `SetParameter(idx, xmm0, xmm1, xmm2, xmm3)` via slot *0x60
 *          — invoked @0x1034c4 with (0, 5.0f, seg1_x, seg0_z, seg1_y)      // LOG segment
 *          — invoked @0x1034ee with (1, seg0_w, 0.09286413, 0.00555556, 0.0) // LINEAR segment
 *   - `Release()` via slot *0x18 — invoked from all three dtors
 *          (@0x103324, 0x103374, 0x1033c4).
 */
export interface HgcLogVideo_encode {
  /** vtable *0x78 @Helium — @0x10349e. */
  SetInput(idx: number, input: HGNode): void;
  /** vtable *0x60 @Helium — argument order (esi, xmm0, xmm1, xmm2, xmm3). */
  SetParameter(idx: number, a: number, b: number, c: number, d: number): void;
  /** vtable *0x18 @Helium — invoked from dtors. */
  Release(): void;
}

/**
 * Placeholder for the compositor allocation + ctor sequence @Helium
 * 0x10324f..0x10325f:
 *   0x10324f  movl  $0x1a0, %edi                    ; alloc size = 0x1A0 = 416
 *   0x103254  callq __ZN8HGObjectnwEm               ; HGObject::operator new
 *   0x10325f  callq __ZN18HgcLogVideo_encodeC1Ev    ; placement ctor
 * Throws until the class is transcribed (rule 3).
 */
function newHgcLogVideo_encode(): HgcLogVideo_encode {
  throw new Error(
    "HGBMDFilm::Encode: HgcLogVideo_encode ctor + HGObject::operator new @Helium 0x103254/0x10325f not yet transcribed"
  );
}

/**
 * Placeholder for the color-matrix allocation + ctor sequence @Helium
 * 0x103233..0x103243:
 *   0x103233  movl  $0x1f0, %edi                    ; alloc size = 0x1F0 = 496
 *   0x103238  callq __ZN8HGObjectnwEm               ; HGObject::operator new
 *   0x103243  callq __ZN13HGColorMatrixC1Ev         ; placement ctor
 * Throws until the class is transcribed (rule 3).
 */
function newHGColorMatrix(): HGColorMatrix {
  throw new Error(
    "HGBMDFilm::Encode: HGColorMatrix ctor + HGObject::operator new @Helium 0x103238/0x103243 not yet transcribed"
  );
}

// ---------------------------------------------------------------------------
// Static data: `HGBMDFilm::Encode::sourceToBMDFilmRGB` @Helium 0x3d1830
//                and `HGBMDFilm::Encode::sourceToBMDFilm4KRGB` @Helium 0x3d18b0.
//
// 2 entries × 0x40 = 128 bytes; each entry is a 4×4 row-major float32
// matrix (source RGB → BMD Film (or Film 4K) working RGB). Indexed by
// the `SceneColorimetry` enum (0 or 1). Ctor addressing
// @0x103264..0x10328a computes
// `(logEncoding==0 ? sourceToBMDFilmRGB : sourceToBMDFilm4KRGB)
//    + (colorimetry << 6)` and stores it into `this.matrixSrcRow (+0x1a8)`;
// GetOutput then hands that pointer to
// `HGColorMatrix::LoadMatrix` with transpose=true (edx=1).
//
// Values below are byte-exact reads from the Helium x86_64 slice at
// file offsets 0x3d1830 / 0x3d18b0 (VA == file-offset in the thin slice).
// ---------------------------------------------------------------------------

/**
 * `HGBMDFilm::Encode::sourceToBMDFilmRGB` @Helium 0x3d1830.
 * Selected by `LogEncoding == 0` (the non-4K BMD Film curve). Two
 * 4×4 row-major f32 matrices indexed by SceneColorimetry.
 */
export const HGBMDFilmEncode_sourceToBMDFilmRGB: readonly (readonly number[])[] = [
  // @Helium 0x3d1830  entry[0] — 16 floats (row-major 4×4)
  [
    Math.fround( 0.5938420295715332), Math.fround( 0.30183732509613037), Math.fround( 0.10502184927463531), Math.fround(0.0),
    Math.fround( 0.07658243924379349), Math.fround( 0.8609536290168762), Math.fround( 0.06223933771252632), Math.fround(0.0),
    Math.fround( 0.1077018529176712), Math.fround( 0.3013279139995575), Math.fround( 0.5978294610977173), Math.fround(0.0),
    Math.fround( 0.0),                Math.fround( 0.0),                Math.fround( 0.0),                Math.fround(1.0),
  ],
  // @Helium 0x3d1870  entry[1] — 16 floats (row-major 4×4)
  [
    Math.fround( 0.9465691447257996), Math.fround(-0.017577528953552246), Math.fround( 0.07170958071947098), Math.fround(0.0),
    Math.fround( 0.018802568316459656), Math.fround( 0.9241113662719727), Math.fround( 0.056861504912376404), Math.fround(0.0),
    Math.fround( 0.1304563581943512), Math.fround( 0.21795529127120972), Math.fround( 0.6584475636482239), Math.fround(0.0),
    Math.fround( 0.0),                Math.fround( 0.0),                Math.fround( 0.0),                Math.fround(1.0),
  ],
] as const;

/**
 * `HGBMDFilm::Encode::sourceToBMDFilm4KRGB` @Helium 0x3d18b0.
 * Selected by `LogEncoding != 0` (the BMD Film 4K curve). Two 4×4
 * row-major f32 matrices indexed by SceneColorimetry.
 */
export const HGBMDFilmEncode_sourceToBMDFilm4KRGB: readonly (readonly number[])[] = [
  // @Helium 0x3d18b0  entry[0] — 16 floats (row-major 4×4)
  [
    Math.fround( 0.6679872870445251), Math.fround( 0.15899530053138733), Math.fround( 0.17394959926605225), Math.fround(0.0),
    Math.fround( 0.09059526771306992), Math.fround( 0.8290040493011475), Math.fround( 0.08047604560852051), Math.fround(0.0),
    Math.fround( 0.11268483102321625), Math.fround( 0.26904425024986267), Math.fround( 0.6219814419746399), Math.fround(0.0),
    Math.fround( 0.0),                Math.fround( 0.0),                Math.fround( 0.0),                Math.fround(1.0),
  ],
  // @Helium 0x3d18f0  entry[1] — 16 floats (row-major 4×4)
  [
    Math.fround( 1.0862265825271606), Math.fround(-0.22990672290325165), Math.fround( 0.14461228251457214), Math.fround(0.0),
    Math.fround( 0.045719075947999954), Math.fround( 0.8778469562530518), Math.fround( 0.07650937885046005), Math.fround(0.0),
    Math.fround( 0.1423131227493286), Math.fround( 0.17602375149726868), Math.fround( 0.6853736042976379), Math.fround(0.0),
    Math.fround( 0.0),                Math.fround( 0.0),                Math.fround( 0.0),                Math.fround(1.0),
  ],
] as const;

// ---------------------------------------------------------------------------
// GetOutput __const f32 tables — each is a pair of adjacent f32s
// [4K variant, non-4K variant] fetched by the `movss [eax + rcx]` idiom
// with eax = 4 for non-4K (logEncoding == 0) and eax = 0 for 4K
// (logEncoding != 0). Bit-exact against the Helium slice.
// ---------------------------------------------------------------------------

/**
 * Segment-1 xmm1 pair @Helium 0x3d0e78.
 * @0x3d0e78 f32 = 0.4430254 (4K,     matches |K8_4K_POST|)
 * @0x3d0e7c f32 = 0.1806583 (non-4K, matches |K8_POST|)
 * Loaded @0x103447 (leaq 0x2cda2a(%rip),%rcx → 0x103447+7+0x2cda2a = 0x3d0e78).
 * xmm value used as `xmm1` in SetParameter(1, ...) call.
 */
const HGBMDFilmEncode_seg1_x_pair: readonly [number, number] = [
  Math.fround(0.4430254101753235), Math.fround(0.18065829575061798),
];

/**
 * Segment-0 xmm2 pair @Helium 0x3d0e80.
 * @0x3d0e80 f32 = 0.17527279 (4K)
 * @0x3d0e84 f32 = 0.11066182 (non-4K)
 * Loaded @0x103458. Used as `xmm2` in SetParameter(0, ...) call.
 */
const HGBMDFilmEncode_seg0_z_pair: readonly [number, number] = [
  Math.fround(0.17527279257774353), Math.fround(0.1106618195772171),
];

/**
 * Segment-1 xmm2 pair @Helium 0x3d0e88.
 * @0x3d0e88 f32 = 0.2982706 (4K,     matches |K6_4K_ADD|)
 * @0x3d0e8c f32 = 0.3644932 (non-4K, matches |K6_ADD|)
 * Loaded @0x103469. Used as `xmm2` in SetParameter(1, ...) call.
 */
const HGBMDFilmEncode_seg1_y_pair: readonly [number, number] = [
  Math.fround(0.2982706129550934), Math.fround(0.364493191242218),
];

/**
 * Segment-0 xmm3 pair @Helium 0x3d0e90.
 * @0x3d0e90 f32 = 2.6854665 (4K)
 * @0x3d0e94 f32 = 3.8297410 (non-4K)
 * Loaded @0x10347a. Used as `xmm3` in SetParameter(0, ...) call.
 */
const HGBMDFilmEncode_seg0_w_pair: readonly [number, number] = [
  Math.fround(2.6854665279388428), Math.fround(3.8297410011291504),
];

// ---------------------------------------------------------------------------
// Shared scalar constants — single f32s, NOT indexed by logEncoding.
// ---------------------------------------------------------------------------

/**
 * @Helium 0x3cf658 = 5.0f (u32 0x40a00000).
 * Loaded @0x1034ab `movss 0x2cc1a5(%rip), %xmm0` — target = 0x1034ab + 8 + 0x2cc1a5 = 0x3cf658.
 * Used as `xmm0` in SetParameter(0, ...) — matches `constant5f` in ARRI/Apple/Sony siblings.
 */
const HGBMDFilmEncode_five: number = Math.fround(5.0);

/**
 * @Helium 0x3d0fe4 = 0.09286413 (f32; u32 0x3dbe2f8c).
 * This is the f32 rounding of the fp64 constant -0.09286412512218964 seen
 * in the linear-branch of `HGBMDFilmLinearizationLUTInfo::colorAtIndex`
 * (K_LIN_ADD @Helium 0x3d4a58) — here shipped positive to the compositor.
 * Loaded @0x1034d1 `movss 0x2cdb0b(%rip), %xmm1` — target = 0x1034d1 + 8 + 0x2cdb0b = 0x3d0fe4.
 * Used as `xmm1` in SetParameter(1, ...) — the linear-branch's "K_LIN_ADD" the shader adds to `t`.
 */
const HGBMDFilmEncode_lin_add_f32: number = Math.fround(0.09286412596702576);

/**
 * @Helium 0x3d0fe8 = 0.00555556 (f32; u32 0x3bb60b61).
 * Numerically equal to 1/180. Loaded @0x1034d9 `movss 0x2cdb07(%rip), %xmm2` —
 * target = 0x1034d9 + 8 + 0x2cdb07 = 0x3d0fe8.
 * Used as `xmm2` in SetParameter(1, ...).
 */
const HGBMDFilmEncode_inv_180_f32: number = Math.fround(0.0055555556900799274);

// ---------------------------------------------------------------------------
// The class.
// ---------------------------------------------------------------------------

/**
 * SceneColorimetry enum placeholder — the underlying enum's meanings
 * (Rec.709 vs Rec.2020 vs …) are not yet decoded. Ctor accepts a
 * `number` here (u32 in the C++ signature); we DO NOT bound-check or
 * remap it — the disasm doesn't either, and the raw value indexes both
 * `sourceToBMDFilmRGB` and `sourceToBMDFilm4KRGB` directly.
 */
export type HGBMDFilmEncode_SceneColorimetry = number;

/**
 * LogEncoding enum placeholder — the C++ mangled name
 * `HGBMDFilm::LogEncoding` is a u32 enum whose specific values are NOT
 * decoded. Empirically the ctor's `testl %r14d,%r14d ; cmoveq` treats
 * only `0` specially (selecting the non-4K BMD Film curve), and
 * GetOutput's `cmpl $0, 0x1b0(%rbx)` reproduces the same 0-vs-nonzero
 * test. So the port stores and compares the raw u32 as-is.
 */
export type HGBMDFilmEncode_LogEncoding = number;

/**
 * `HGBMDFilm::Encode` — Helium HGNode subclass. Wraps a color-matrix
 * stage (source-gamut → BMD Film working RGB) followed by an
 * HgcLogVideo_encode compositor configured for the Blackmagic Design
 * pre-Gen5 "Film" forward transfer function (with a 4K variant selected
 * by the LogEncoding argument).
 *
 * @Helium ctors     @0x103210 (C2) / @0x1032e0 (C1);
 *         dtors     @0x1032f0 (D2) / @0x103340 (D1) / @0x103390 (D0);
 *         GetOutput @0x1033f0.
 */
export class HGBMDFilmEncode extends HGNode {
  /**
   * Owned `HGColorMatrix`. Field @0x198.
   * Assigned in ctor @0x103248: `movq %r12, 0x198(%rbx)`.
   */
  matrix: HGColorMatrix | null;

  /**
   * Owned `HgcLogVideo_encode` compositor. Field @0x1a0.
   * Assigned in ctor @0x103280: `movq %r12, 0x1a0(%rbx)`.
   */
  compositor: HgcLogVideo_encode | null;

  /**
   * Pointer into one of the two source-gamut tables at
   * `[colorimetry]`. Field @0x1a8.
   * Assigned in ctor @0x10328a: `movq %rdx, 0x1a8(%rbx)`, where rdx was
   * set at @0x103264..0x103287 to
   *   (logEncoding == 0 ? sourceToBMDFilmRGB : sourceToBMDFilm4KRGB)
   *     + (colorimetry << 6).
   */
  matrixSrcRow: readonly number[];

  /**
   * Field @0x1b0 (u32 — NOT a float; the disasm uses `movl %r14d,%..`
   * and `cmpl $0, ...`, never `movss`). Stored @0x103291:
   *   `movl %r14d, 0x1b0(%rbx)`.
   * Consumed in GetOutput @0x10343a as the branchless index selector
   * for the four `movss [eax + rcx]` pair-lookups.
   */
  logEncoding: number;

  /**
   * `HGBMDFilm::Encode::Encode(SceneColorimetry colorimetry, LogEncoding logEncoding)`
   * — Helium @0x103210 (C2 base-object ctor). C1 @0x1032e0 tail-jmps
   * to C2 so only C2's body needs modelling.
   *
   * Verbatim asm (@0x103210..0x1032a0, prologue/epilogue elided):
   *   0x10321b  movl  %edx, %r14d                     ; r14d = logEncoding
   *   0x10321e  movl  %esi, %r15d                     ; r15d = colorimetry
   *   0x103221  movq  %rdi, %rbx                      ; rbx  = this
   *   0x103224  callq __ZN6HGNodeC2Ev                 ; base ctor
   *   0x103229  leaq  0x915c50(%rip), %rax            ; = 0xa18e80 (own vtable installed ptr)
   *   0x103230  movq  %rax, (%rbx)                    ; *this = vtable
   *   0x103233  movl  $0x1f0, %edi                    ; alloc 0x1F0 for HGColorMatrix
   *   0x103238  callq __ZN8HGObjectnwEm
   *   0x103243  callq __ZN13HGColorMatrixC1Ev
   *   0x103248  movq  %r12, 0x198(%rbx)               ; this.matrix = new HGColorMatrix
   *   0x10324f  movl  $0x1a0, %edi                    ; alloc 0x1A0 for HgcLogVideo_encode
   *   0x103254  callq __ZN8HGObjectnwEm
   *   0x10325f  callq __ZN18HgcLogVideo_encodeC1Ev
   *   0x103264  movl  %r15d, %eax                     ; eax = colorimetry
   *   0x103267  shlq  $0x6, %rax                      ; rax = colorimetry * 0x40
   *   0x10326b  testl %r14d, %r14d                    ; ZF = (logEncoding == 0)
   *   0x10326e  leaq  sourceToBMDFilmRGB(%rip), %rcx
   *   0x103275  leaq  sourceToBMDFilm4KRGB(%rip), %rdx
   *   0x10327c  cmoveq %rcx, %rdx                     ; rdx = ZF ? rcx : rdx
   *   0x103280  movq  %r12, 0x1a0(%rbx)               ; this.compositor = new HgcLogVideo_encode
   *   0x103287  addq  %rax, %rdx                      ; rdx += colorimetry * 0x40
   *   0x10328a  movq  %rdx, 0x1a8(%rbx)               ; this.matrixSrcRow = &table[colorimetry]
   *   0x103291  movl  %r14d, 0x1b0(%rbx)              ; this.logEncoding = raw u32 arg
   *   0x103298..0x1032a0  epilogue, retq.
   *
   * The exception-cleanup path @0x1032a1..0x1032cc handles a throwing
   * HgcLogVideo_encode ctor or HGObject::operator new: it deletes the
   * partially-constructed compositor pointer (r12) via
   * `HGObject::operator delete`, calls `HGNode::~HGNode()`, and resumes
   * the unwind. It never executes on a successful construction and is
   * not modelled explicitly (TS exceptions unwind through the stack
   * naturally).
   *
   * @param colorimetry  SceneColorimetry (u32; NOT bounds-checked; indexes
   *                     both source-gamut tables; the disasm doesn't check
   *                     either, so neither do we).
   * @param logEncoding  BMD Film LogEncoding (u32; 0 → non-4K, != 0 → 4K).
   */
  constructor(colorimetry: HGBMDFilmEncode_SceneColorimetry, logEncoding: HGBMDFilmEncode_LogEncoding) {
    // @Helium 0x103224: HGNode base ctor.
    super();
    // @Helium 0x103230: install this class's vtable (installed ptr = 0xa18e80).
    this.vtable = 0xa18e80;
    // @Helium 0x103233..0x103248: alloc + ctor HGColorMatrix, store @0x198.
    // Throws until HGColorMatrix is transcribed.
    this.matrix = newHGColorMatrix();
    // @Helium 0x10324f..0x103280: alloc + ctor HgcLogVideo_encode, store @0x1a0.
    // Throws until HgcLogVideo_encode is transcribed.
    this.compositor = newHgcLogVideo_encode();
    // @Helium 0x103264..0x10328a: matrixSrcRow selection.
    //   logEncoding == 0 → non-4K table; else → 4K table. The << 6 is a
    //   64-byte stride pointing at the head of each 4×4 f32 matrix.
    // We DO NOT branch across a pointer-comparison here — instead we
    // pick the whole matrix array directly (TS has no `cmov` idiom;
    // this reproduces the SAME observable result, since the ctor's
    // only externally-visible effect of the selection is which matrix
    // ends up at `this.matrixSrcRow`).
    const table = (logEncoding === 0)
      ? HGBMDFilmEncode_sourceToBMDFilmRGB
      : HGBMDFilmEncode_sourceToBMDFilm4KRGB;
    this.matrixSrcRow = table[colorimetry];
    // @Helium 0x103291: this.logEncoding = raw u32 arg.
    this.logEncoding = logEncoding;
  }

  /**
   * `HGBMDFilm::Encode::~Encode()` — Helium @0x1032f0 (D2, base-object)
   * / @0x103340 (D1, complete-object) / @0x103390 (D0, deleting).
   *
   * All three share the same body up through the base-dtor call; D0
   * additionally tail-calls `HGObject::operator delete`. D0's body
   * (@0x103390..0x1033d8):
   *   leaq  0x915ae0(%rip), %rax         ; = 0xa18e80 (reinstall own vtable)
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
   * D2 @0x1032f0 and D1 @0x103340 have byte-identical bodies except:
   *   - the vtable-reinstall leaq displacement is different (RIP differs)
   *   - HGNode dtor is called via `jmp` (tail-call) instead of `call`
   *   - no operator-delete after the HGNode dtor.
   *
   * We model D0's operator-delete step at the JS caller (dropping the
   * reference) — TS has no explicit `delete this`.
   */
  destruct(): void {
    // @Helium 0x1032f9/0x103349/0x103399: vtable reinstall — modeled by assignment.
    this.vtable = 0xa18e80;
    // @Helium 0x103303..0x103312 (D2): release matrix if present.
    if (this.matrix != null) {
      this.matrix.Release();
      this.matrix = null;
    }
    // @Helium 0x103315..0x103324 (D2): release compositor if present.
    if (this.compositor != null) {
      this.compositor.Release();
      this.compositor = null;
    }
    // @Helium 0x103330 (D2) / 0x103380 (D1): jmp HGNode::~HGNode(). D0
    // uses callq and then tail-jmps to HGObject::operator delete
    // (handled by the caller dropping the reference in TS).
    super.destruct();
  }

  /**
   * `HGBMDFilm::Encode::GetOutput(HGRenderer* renderer)` — Helium
   * @0x1033f0.
   *
   * Wires the owned matrix + compositor into the render graph, then
   * pushes six log-shader parameters. Four of them come from
   * __const-segment float pairs indexed by `(logEncoding == 0 ? 4 : 0)`
   * — a branchless `sete/shll` sequence that picks between a 4K and a
   * non-4K coefficient with a single-byte offset lookup:
   *
   *   1) fetch this node's input at slot 0
   *   2) hand it to the matrix as input slot 0    (matrix.SetInput slot *0x78)
   *   3) load the source→BMD Film matrix (transposed) (matrix.LoadMatrix)
   *   4) compute eax = (logEncoding == 0 ? 1 : 0) << 2
   *      → eax in {4 (non-4K), 0 (4K)}
   *   5) movss 4 floats from 4 different __const bases at [eax+base]
   *   6) hand the matrix into the compositor      (compositor.SetInput slot *0x78)
   *   7) SetParameter(0, 5.0f, seg1_x, seg0_z, seg1_y)  (LOG segment,    slot *0x60)
   *   8) SetParameter(1, seg0_w, 0.09286413, 1/180, 0.0) (LINEAR segment, slot *0x60)
   *   9) return the compositor.
   *
   * Verbatim asm (@0x1033f0..0x103500, prologue/epilogue elided):
   *   0x1033fb  movq  %rdi, %rbx                    ; rbx = this
   *   0x1033fe  movq  0x198(%rdi), %r14             ; r14 = this.matrix
   *   0x103405  movq  %rsi, %rdi                    ; rdi = renderer
   *   0x103408  movq  %rbx, %rsi                    ; rsi = this
   *   0x10340b  xorl  %edx, %edx
   *   0x10340d  callq __ZN10HGRenderer8GetInputEP6HGNodei  ; input = renderer.GetInput(this, 0)
   *   0x103412  movq  (%r14), %rcx                  ; rcx = matrix.vtable
   *   0x103415  movq  %r14, %rdi                    ; rdi = matrix
   *   0x103418  xorl  %esi, %esi
   *   0x10341a  movq  %rax, %rdx                    ; rdx = input
   *   0x10341d  callq *0x78(%rcx)                   ; matrix.SetInput(0, input)
   *   0x103420  movq  0x198(%rbx), %rdi             ; rdi = this.matrix
   *   0x103427  movq  0x1a8(%rbx), %rsi             ; rsi = this.matrixSrcRow
   *   0x10342e  movl  $0x1, %edx                    ; edx = 1 (transpose)
   *   0x103433  callq __ZN13HGColorMatrix10LoadMatrixEPKDv4_fb
   *                                                 ; matrix.LoadMatrix(matrixSrcRow, true)
   *   0x103438  xorl  %eax, %eax
   *   0x10343a  cmpl  $0x0, 0x1b0(%rbx)              ; ZF = (logEncoding == 0)
   *   0x103441  sete  %al                            ; al = ZF ? 1 : 0
   *   0x103444  shll  $0x2, %eax                     ; eax = (logEncoding==0) ? 4 : 0
   *   0x103447  leaq  0x2cda2a(%rip), %rcx           ; base = 0x3d0e78
   *   0x10344e  movss (%rax,%rcx), %xmm0             ; seg1_x = table@[eax+base]
   *   0x103453  movss %xmm0, -0x1c(%rbp)             ; spill seg1_x
   *   0x103458  leaq  0x2cda21(%rip), %rcx           ; base = 0x3d0e80
   *   0x10345f  movss (%rax,%rcx), %xmm0             ; seg0_z = table@[eax+base]
   *   0x103464  movss %xmm0, -0x18(%rbp)             ; spill seg0_z
   *   0x103469  leaq  0x2cda18(%rip), %rcx           ; base = 0x3d0e88
   *   0x103470  movss (%rax,%rcx), %xmm0             ; seg1_y = table@[eax+base]
   *   0x103475  movss %xmm0, -0x14(%rbp)             ; spill seg1_y
   *   0x10347a  leaq  0x2cda0f(%rip), %rcx           ; base = 0x3d0e90
   *   0x103481  movss (%rax,%rcx), %xmm0             ; seg0_w = table@[eax+base]
   *   0x103486  movss %xmm0, -0x20(%rbp)             ; spill seg0_w
   *   0x10348b  movq  0x198(%rbx), %rdx              ; rdx = this.matrix (input for next stage)
   *   0x103492  movq  0x1a0(%rbx), %rdi              ; rdi = this.compositor
   *   0x103499  movq  (%rdi), %rax                   ; rax = compositor.vtable
   *   0x10349c  xorl  %esi, %esi
   *   0x10349e  callq *0x78(%rax)                    ; compositor.SetInput(0, matrix)
   *   0x1034a1  movq  0x1a0(%rbx), %rdi              ; rdi = this.compositor
   *   0x1034a8  movq  (%rdi), %rax                   ; rax = compositor.vtable
   *   0x1034ab  movss 0x2cc1a5(%rip), %xmm0          ; xmm0 = 5.0f (@0x3cf658)
   *   0x1034b3  xorl  %esi, %esi
   *   0x1034b5  movss -0x1c(%rbp), %xmm1             ; xmm1 = seg1_x
   *   0x1034ba  movss -0x18(%rbp), %xmm2             ; xmm2 = seg0_z
   *   0x1034bf  movss -0x14(%rbp), %xmm3             ; xmm3 = seg1_y
   *   0x1034c4  callq *0x60(%rax)                    ; compositor.SetParameter(0, 5.0f, seg1_x, seg0_z, seg1_y)
   *   0x1034c7  movq  0x1a0(%rbx), %rdi
   *   0x1034ce  movq  (%rdi), %rax                   ; rax = compositor.vtable
   *   0x1034d1  movss 0x2cdb0b(%rip), %xmm1          ; xmm1 = 0.09286413f (@0x3d0fe4)
   *   0x1034d9  movss 0x2cdb07(%rip), %xmm2          ; xmm2 = 0.0055555557f (@0x3d0fe8)
   *   0x1034e1  xorps %xmm3, %xmm3                   ; xmm3 = 0.0f
   *   0x1034e4  movl  $0x1, %esi
   *   0x1034e9  movss -0x20(%rbp), %xmm0             ; xmm0 = seg0_w
   *   0x1034ee  callq *0x60(%rax)                    ; compositor.SetParameter(1, seg0_w, 0.0928.., 1/180, 0.0)
   *   0x1034f1  movq  0x1a0(%rbx), %rax              ; rax = this.compositor
   *   0x1034f8..0x103500  epilogue, retq.
   *
   * NOTE: the disasm loads seg1_x, seg0_z, seg1_y in mixed order (they
   * are stored to distinct stack slots -0x1c/-0x18/-0x14 and then
   * consumed as xmm1/xmm2/xmm3 in SetParameter(0, ...)). seg0_w is
   * spilled to -0x20 and consumed as xmm0 of SetParameter(1, ...). We
   * name the fields by which SetParameter *argument slot* they end up
   * in (seg0_z etc.) to match the compositor-side semantics; the
   * __const table addresses are what actually anchor the values.
   *
   * @param renderer  the containing HGRenderer (undecoded — only
   *                  `GetInput` is invoked here).
   * @returns         the compositor node this class wraps (i.e. the
   *                  output of this filter in the graph).
   */
  GetOutput(renderer: HGRendererStub): HGNode {
    // @Helium 0x1033fe: r14 = this.matrix. Invariant: non-null after ctor.
    const matrix = this.matrix;
    const comp = this.compositor;
    if (matrix == null || comp == null) {
      // C++ path where this is unreachable — but TS type-narrowing
      // wants the null guard, and a loud fault is preferable to `!`
      // (rule 3).
      throw new Error(
        "HGBMDFilm::Encode::GetOutput @Helium 0x1033fe — matrix or compositor null (should be unreachable after ctor)"
      );
    }
    // @Helium 0x10340d: input = renderer.GetInput(this, 0)
    const input = renderer.GetInput(this, 0);
    // @Helium 0x10341d: matrix.SetInput(0, input) via vtable *0x78
    matrix.SetInput(0, input);
    // @Helium 0x103433: matrix.LoadMatrix(this.matrixSrcRow, /*transpose=*/true)
    matrix.LoadMatrix(this.matrixSrcRow, true);
    // @Helium 0x103438..0x103444: idx = (this.logEncoding == 0 ? 1 : 0)
    //   The C++ then computes byte-offset = idx << 2 and reads
    //   `table[idx*4]` (one f32 per index). In TS we just index the
    //   [4K, non-4K] pair directly. The exact index mapping:
    //     logEncoding == 0 (non-4K) → eax = 4 → picks the *second* f32
    //                                            of each __const pair
    //     logEncoding != 0 (4K)     → eax = 0 → picks the *first*  f32
    //                                            of each __const pair.
    const idx = (this.logEncoding === 0) ? 1 : 0;
    // @Helium 0x10344e: seg1_x = HGBMDFilmEncode_seg1_x_pair[idx]
    const seg1_x = HGBMDFilmEncode_seg1_x_pair[idx];
    // @Helium 0x10345f: seg0_z = HGBMDFilmEncode_seg0_z_pair[idx]
    const seg0_z = HGBMDFilmEncode_seg0_z_pair[idx];
    // @Helium 0x103470: seg1_y = HGBMDFilmEncode_seg1_y_pair[idx]
    const seg1_y = HGBMDFilmEncode_seg1_y_pair[idx];
    // @Helium 0x103481: seg0_w = HGBMDFilmEncode_seg0_w_pair[idx]
    const seg0_w = HGBMDFilmEncode_seg0_w_pair[idx];
    // @Helium 0x10349e: compositor.SetInput(0, matrix) via vtable *0x78
    comp.SetInput(0, matrix as unknown as HGNode);
    // @Helium 0x1034c4: compositor.SetParameter(0, 5.0f, seg1_x, seg0_z, seg1_y)
    //                   — LOG segment.
    comp.SetParameter(
      0,
      HGBMDFilmEncode_five,
      seg1_x,
      seg0_z,
      seg1_y,
    );
    // @Helium 0x1034ee: compositor.SetParameter(1, seg0_w, 0.0928.., 1/180, 0.0f)
    //                   — LINEAR segment. xmm3 is zeroed with `xorps` @0x1034e1.
    comp.SetParameter(
      1,
      seg0_w,
      HGBMDFilmEncode_lin_add_f32,
      HGBMDFilmEncode_inv_180_f32,
      Math.fround(0.0),
    );
    // @Helium 0x1034f1: return this.compositor (cast to HGNode by C++ inheritance).
    return comp as unknown as HGNode;
  }
}
