// raw-port/src/render/HGDJIDLog_Encode.ts
//
// FCP `HGDJIDLog::Encode` — nested Helium HGNode subclass. Wraps an
// owned `HGColorMatrix` (source-colorimetry -> D-Gamut 3x3 gamut
// conversion, framed in a 4x4 affine matrix) chained into an owned
// `HgcLogVideo_encode` compositor configured for the DJI D-Log forward
// OETF (scene-linear -> D-Log code value).
//
// Structural twin of `HGPanasonicVLog::Encode` (see
// raw-port/src/render/HGPanasonicVLog_Encode.ts): a HGNode facade that
// owns and configures an HgcLogVideo_encode via two SetParameter
// slot-0x60 calls, with a HGColorMatrix chained in front for the gamut
// transform. Single ctor enum arg (SceneColorimetry); all f32
// coefficients are inline-loaded from Helium __const inside GetOutput,
// so there is no per-instance coefficient cache (no 0x1b0/... fields).
// Also uses a function-local static float `c` initialised lazily via
// Itanium __cxa_guard_acquire/release in cold.1 — same shape as
// HGPanasonicVLog::Encode.
//
// FRAMEWORK: Helium.framework
// FAT slice offset: 0x4000; thin binary /tmp/Helium.x86_64 has VA == file
// offset (segment __TEXT vmaddr = 0). Constants read directly from the
// thin binary; RIP-relative disps computed as (next-instr-PC + disp).
//
// DISASSEMBLY (raw-port/re/disasm/, extracted via
// raw-port/tools/disasm.sh Helium):
//   Helium.HGDJIDLog::Encode.EncodeC2.s        (C2 base-object ctor @0x103c20)
//   Helium.HGDJIDLog::Encode.Encode.s          (C1 complete ctor @0x103cd0 — 1-line tail-jmp to C2)
//   Helium.HGDJIDLog::Encode.~Encode.s         (D0 deleting dtor @0x103d80)
//   Helium.HGDJIDLog::Encode.GetOutput.s       (GetOutput @0x103de0)
//   Helium.HGDJIDLog::Encode.GetOutput_cold1.s (.cold.1 — lazy static `c` init @0x3c3b30)
//   (D2 @0x103ce0 / D1 @0x103d30 bodies extracted inline via awk on /tmp/Helium_tV.txt — same shape as D0 sans operator-delete.)
//
// SYMBOLS (all confirmed in /tmp/Helium_demangled.txt and the ledger):
//   @Helium 0x103c20  HGDJIDLog::Encode::Encode(SceneColorimetry)   [C2]  __ZN9HGDJIDLog6EncodeC2ENS_16SceneColorimetryE
//   @Helium 0x103cd0  HGDJIDLog::Encode::Encode(SceneColorimetry)   [C1]  __ZN9HGDJIDLog6EncodeC1ENS_16SceneColorimetryE — tail-jmp to C2
//   @Helium 0x103ce0  HGDJIDLog::Encode::~Encode()                   [D2]  __ZN9HGDJIDLog6EncodeD2Ev
//   @Helium 0x103d30  HGDJIDLog::Encode::~Encode()                   [D1]  __ZN9HGDJIDLog6EncodeD1Ev
//   @Helium 0x103d80  HGDJIDLog::Encode::~Encode()                   [D0]  __ZN9HGDJIDLog6EncodeD0Ev
//   @Helium 0x103de0  HGDJIDLog::Encode::GetOutput(HGRenderer*)      __ZN9HGDJIDLog6Encode9GetOutputEP10HGRenderer
//   @Helium 0x3c3b30  HGDJIDLog::Encode::GetOutput(HGRenderer*).cold.1  __ZN9HGDJIDLog6Encode9GetOutputEP10HGRenderer.cold.1
//   @Helium 0x3d1a30  HGDJIDLog::Encode::sourceToDGamut               __ZN9HGDJIDLog6Encode14sourceToDGamutE  [static data]
//
// VTABLE:
//   Ctor C2 @0x103c35: `leaq 0x915904(%rip), %rax` (rip@0x103c3c)
//     -> 0x103c3c + 0x915904 = 0xa19540 = "vtable for HGDJIDLog::Encode + 0x10"
//     (installed ptr per Itanium ABI). Reinstalled identically in D2/D1/D0
//     via three separate leaq displacements that all compute 0xa19540:
//       D2 @0x103ce9: leaq 0x915850(%rip)  (rip@0x103cf0)  0x103cf0+0x915850 = 0xa19540
//       D1 @0x103d39: leaq 0x915800(%rip)  (rip@0x103d40)  0x103d40+0x915800 = 0xa19540
//       D0 @0x103d89: leaq 0x9157b0(%rip)  (rip@0x103d90)  0x103d90+0x9157b0 = 0xa19540
//   vtable slot *0x00 -> D1 (0x103d30); *0x08 -> D0 (0x103d80) — verified via
//   raw file-offset read of /tmp/Helium.x86_64 at 0xa19540.
//
// STRUCT LAYOUT (recovered from C2 @0x103c20 + GetOutput @0x103de0):
//   HGDJIDLog::Encode extends HGNode (base ctor called @0x103c30, so
//   HGNode occupies offsets 0x00..0x197 per raw-port/src/render/HGNode.ts).
//   This subclass adds THREE fields (identical layout to
//   HGPanasonicVLog::Encode — no per-instance coefficient cache):
//     0x198 : HGColorMatrix*         colorMatrix   (alloc size 0x1f0; @0x103c44/0x103c4f)
//     0x1a0 : HgcLogVideo_encode*    logEncode     (alloc size 0x1a0; @0x103c60/0x103c6b)
//     0x1a8 : const float[16]*       matrixPtr     (points into sourceToDGamut[sc])
//   Total sizeof = 0x1b0. No further fields touched by any ported entry point.
//
// CONSTRUCTOR ARG WIRING (SysV AMD64: rdi=this, esi = 1st int arg):
//   %esi -> %r14d : SceneColorimetry     (indexes sourceToDGamut as `r14d << 6`)
//
// CTOR MATRIX-TABLE SELECT (@0x103c77..0x103c88):
//   0x103c77  movl  %r14d, %eax                    ; eax = SceneColorimetry
//   0x103c7a  shlq  $0x6, %rax                     ; rax = SceneColorimetry * 64 (sizeof(float[16]) = 64)
//   0x103c7e  leaq  sourceToDGamut(%rip), %rcx     ; @Helium 0x3d1a30
//   0x103c85  addq  %rax, %rcx                     ; rcx += row-offset
//   0x103c88  movq  %rcx, 0x1a8(%rbx)              ; this.matrixPtr = &sourceToDGamut[sc]
//
// STATIC TABLE (in Helium __const):
//
//   sourceToDGamut  (__ZN9HGDJIDLog6Encode14sourceToDGamutE @0x3d1a30, sizeof=0x80):
//     Two 4x4 float row-major affine matrices, 64 bytes each; ctor indexes
//     as `table[sc]`. Values verbatim from a raw file-offset dump of
//     /tmp/Helium.x86_64 at 0x3d1a30 (VA==offset).
//
// STATIC LOCAL — function-local static in GetOutput (Itanium ABI
// __cxa_guard_acquire/release, initialized lazily on first call):
//
//   __ZZN9HGDJIDLog6Encode9GetOutputEP10HGRendererE1c
//     Guard byte + storage in Helium BSS (accessed via RIP-relative
//     `movzbl` @0x103e24 for the guard and `movss` @0x103e4c for the
//     value). Type: float32.
//     Initialized @cold.1 @0x3c3b44: `movl $0x3d9e3c33, c(%rip)`
//       — bit-pattern 0x3D9E3C33 decodes to 0.0772632583975792f as
//       IEEE 754 float32. Loaded into xmm2 of the segment-0
//       SetParameter call (log-region log2 coefficient).
//
// STATIC F32 COEFFICIENTS inline-loaded by GetOutput (all @Helium __const,
// verified via raw file-offset read of /tmp/Helium.x86_64):
//
//   @0x3d1014  raw 0x3f63e964  ->  0.89028000831604f      (seg0 xmm0 — LOG region)
//   @0x3d1018  raw 0x3c30f27c  ->  0.01080000028014183f   (seg0 xmm1 — LOG offset)
//   @0x3d101c  raw 0x3f15a565  ->  0.5845549702644348f    (seg0 xmm3 — LOG offset "d")
//   @0x3d1020  raw 0x40ad851f  ->  5.422500133514404f     (seg1 xmm0 — LINEAR slope)
//   @0x3d1024  raw 0x3dbe425b  ->  0.09290000051259995f   (seg1 xmm1 — LINEAR offset "f")
//   @0x3d1028  raw 0x3c0dfea2  ->  0.008666666224598885f  (seg1 xmm2 — LINEAR small-signal factor)
//
// GETOUTPUT (@0x103de0..0x103eac) — rendering-graph wiring:
//   1) input       = HGRenderer::GetInput(this, 0)                          @0x103df9
//   2) colorMatrix.vtable[0x78](0, input)                                    @0x103e09
//   3) HGColorMatrix::LoadMatrix(colorMatrix, this.matrixPtr, /*bool*/true)  @0x103e1f
//   4) [lazy] initialize static `c` to 0.0772632583975792f (via cold.1)     @0x103e24..0x103ead
//   5) logEncode.vtable[0x78](0, colorMatrix)                                @0x103e42
//   6) logEncode.vtable[0x60](0, 0.89028f, 0.0108f, c(=0.07726f), 0.584555f) @0x103e71
//   7) logEncode.vtable[0x60](1, 5.4225f, 0.0929f, 0.008667f, 0.0f)          @0x103e9e
//   8) return this.logEncode                                                 @0x103ea1
//
// UNDECODED CALLEES (throw-stubs per PORTING_SPEC.md rule 3):
//   HGObject::operator new(unsigned long)        __ZN8HGObjectnwEm            — @0x103c44 / @0x103c60
//   HGObject::operator delete(void*)             __ZN8HGObjectdlEPv           — D0 tail @0x103dc8
//   HGColorMatrix::HGColorMatrix()               __ZN13HGColorMatrixC1Ev      — @0x103c4f
//   HGColorMatrix::LoadMatrix(vec4 const*, bool) __ZN13HGColorMatrix10LoadMatrixEPKDv4_fb — @0x103e1f
//   HgcLogVideo_encode::HgcLogVideo_encode()     __ZN18HgcLogVideo_encodeC1Ev — @0x103c6b
//   HGColorMatrix       vtable *0x78 (SetInput-like) — @0x103e09
//   HGColorMatrix       vtable *0x18 (Release)       — dtors @0x103d02 (D2), @0x103d52 (D1), @0x103da2 (D0)
//   HgcLogVideo_encode  vtable *0x78 (SetInput-like) — @0x103e42
//   HgcLogVideo_encode  vtable *0x60 (SetParameter)  — @0x103e71 / @0x103e9e
//   HgcLogVideo_encode  vtable *0x18 (Release)       — dtors @0x103d14 (D2), @0x103d64 (D1), @0x103db4 (D0)
//   HGRenderer::GetInput(HGNode*, int)           __ZN10HGRenderer8GetInputEP6HGNodei — @0x103df9
//   (HGNode ctor/dtor ARE ported and imported from ./HGNode.js.)

import { HGNode } from './HGNode.js';

// ---------------------------------------------------------------------------
// Enum shape for the single ctor arg (esi -> r14d). Values 0/1 observed;
// higher values overflow the 2-entry sourceToDGamut table (128 bytes).
// The C++ code doesn't range-check either, so neither do we.
// ---------------------------------------------------------------------------

/**
 * HGDJIDLog::SceneColorimetry — sole ctor arg (esi -> r14d).
 * Indexes into the 2-entry `sourceToDGamut` matrix table as `r14d << 6`
 * (row of 64 bytes = float[16] = 4x4 matrix). Values 0 and 1 are in-range.
 */
export type SceneColorimetry = 0 | 1 | number;

// ---------------------------------------------------------------------------
// Static table — Helium `__const` payload, transcribed verbatim from a raw
// file-offset dump of /tmp/Helium.x86_64 at 0x3d1a30 (VA==file offset).
// 4x4 row-major affine float matrices; ctor indexes as `table[sc]`.
// ---------------------------------------------------------------------------

/**
 * `HGDJIDLog::Encode::sourceToDGamut` — Helium `__const` @0x3d1a30, 0x80
 * bytes (2 x 4x4 float matrices). Sole matrix table used by this class.
 * Mangled: __ZN9HGDJIDLog6Encode14sourceToDGamutE. Ctor addressing
 * @0x103c77..0x103c88 stores `sourceToDGamut + (colorimetry << 6)` into
 * `this.matrixPtr (+0x1a8)`; GetOutput hands that pointer to
 * `HGColorMatrix::LoadMatrix` with transpose=true (edx=1).
 */
export const HGDJIDLog_Encode_sourceToDGamut: ReadonlyArray<ReadonlyArray<number>> = [
  // @Helium 0x3d1a30 — SceneColorimetry == 0
  [
    Math.fround(0.6162455677986145),   Math.fround(0.2856992781162262),   Math.fround(0.0980551764369011),   Math.fround(0.0),
    Math.fround(0.0504788495600224),   Math.fround(0.7989925742149353),   Math.fround(0.1505285650491714),   Math.fround(0.0),
    Math.fround(0.0292155724018812),   Math.fround(0.1603227257728577),   Math.fround(0.8104616999626160),   Math.fround(0.0),
    Math.fround(0.0),                  Math.fround(0.0),                  Math.fround(0.0),                  Math.fround(1.0),
  ],
  // @Helium 0x3d1a70 — SceneColorimetry == 1
  [
    Math.fround(0.9859064221382141),   Math.fround(-0.0483248345553875),  Math.fround(0.0624184086918831),   Math.fround(0.0),
    Math.fround(-0.0184274353086948),  Math.fround(0.8603751659393311),   Math.fround(0.1580522805452347),   Math.fround(0.0),
    Math.fround(0.0138334259390831),   Math.fround(0.0829459801316261),   Math.fround(0.9032205939292908),   Math.fround(0.0),
    Math.fround(0.0),                  Math.fround(0.0),                  Math.fround(0.0),                  Math.fround(1.0),
  ],
];

// ---------------------------------------------------------------------------
// Function-local static `c` for GetOutput — Itanium ABI static-local with
// guard byte. In C++ source: `static const float c = 0.0772632583975792f;`
// initialised lazily on first call via __cxa_guard_acquire/release (see
// cold.1 @0x3c3b30). In TS we compute it eagerly at module load — same
// observable result (the guard is a thread-safe first-write mechanism).
// ---------------------------------------------------------------------------

/**
 * `c` — HGDJIDLog::Encode::GetOutput static local float32.
 * Initialised @cold.1 @0x3c3b44: `movl $0x3d9e3c33, c(%rip)`.
 * Bit-pattern 0x3D9E3C33 decodes to 0.0772632583975792 as IEEE 754 float32.
 * Loaded @0x103e4c into xmm2 of the segment-0 SetParameter call —
 * semantically the log-region log2 coefficient for D-Log.
 */
const HGDJIDLog_Encode_getOutput_c_f32: number = Math.fround(0.0772632583975792);

// ---------------------------------------------------------------------------
// Inline-loaded coefficient constants read by GetOutput from Helium __const.
// Every one verified via a raw file-offset read of /tmp/Helium.x86_64
// (VA==file offset). RIP-relative disps computed as (next-instr-PC + disp).
// ---------------------------------------------------------------------------

/**
 * segment-0 xmm0 — @Helium 0x3d1014 raw 0x3f63e964 (float32).
 * Value: 0.89028000831604f.
 * Loaded @0x103e57 via `movss 0x2cd1b5(%rip), %xmm0` (rip@0x103e5f + 0x2cd1b5 = 0x3d1014).
 */
const HGDJIDLog_Encode_getOutput_seg0_xmm0_f32: number = Math.fround(0.89028000831604);

/**
 * segment-0 xmm1 — @Helium 0x3d1018 raw 0x3c30f27c (float32).
 * Value: 0.01080000028014183f.
 * Loaded @0x103e5f via `movss 0x2cd1b1(%rip), %xmm1` (rip@0x103e67 + 0x2cd1b1 = 0x3d1018).
 */
const HGDJIDLog_Encode_getOutput_seg0_xmm1_f32: number = Math.fround(0.01080000028014183);

/**
 * segment-0 xmm3 — @Helium 0x3d101c raw 0x3f15a565 (float32).
 * Value: 0.5845549702644348f.
 * Loaded @0x103e67 via `movss 0x2cd1ad(%rip), %xmm3` (rip@0x103e6f + 0x2cd1ad = 0x3d101c).
 */
const HGDJIDLog_Encode_getOutput_seg0_xmm3_f32: number = Math.fround(0.5845549702644348);

/**
 * segment-1 xmm0 — @Helium 0x3d1020 raw 0x40ad851f (float32).
 * Value: 5.422500133514404f.
 * Loaded @0x103e7e via `movss 0x2cd19a(%rip), %xmm0` (rip@0x103e86 + 0x2cd19a = 0x3d1020).
 */
const HGDJIDLog_Encode_getOutput_seg1_xmm0_f32: number = Math.fround(5.422500133514404);

/**
 * segment-1 xmm1 — @Helium 0x3d1024 raw 0x3dbe425b (float32).
 * Value: 0.09290000051259995f.
 * Loaded @0x103e86 via `movss 0x2cd196(%rip), %xmm1` (rip@0x103e8e + 0x2cd196 = 0x3d1024).
 */
const HGDJIDLog_Encode_getOutput_seg1_xmm1_f32: number = Math.fround(0.09290000051259995);

/**
 * segment-1 xmm2 — @Helium 0x3d1028 raw 0x3c0dfea2 (float32).
 * Value: 0.008666666224598885f.
 * Loaded @0x103e8e via `movss 0x2cd192(%rip), %xmm2` (rip@0x103e96 + 0x2cd192 = 0x3d1028).
 */
const HGDJIDLog_Encode_getOutput_seg1_xmm2_f32: number = Math.fround(0.008666666224598885);

// ---------------------------------------------------------------------------
// Stubs for undecoded callees. Each raises loudly with its call-site @0xADDR
// so frontier.py can see the gap (rule 3: loud gap, never a silent guess).
// ---------------------------------------------------------------------------

/**
 * Placeholder for HGRenderer used by GetOutput's signature. Not yet
 * transcribed — see raw-port/army/ledger for the HGRenderer class.
 * `GetInput` is invoked @Helium 0x103df9 with (this, 0).
 */
export interface HGRendererStub {
  /** @Helium 0x103df9 — vcalled. Signature `GetInput(HGNode*, int) -> HGNode*`. */
  GetInput(node: HGNode, idx: number): HGNode;
}

/**
 * Placeholder for the HGColorMatrix owned at `this.colorMatrix` (+0x198).
 * Undecoded — exposes only the slots we invoke:
 *   *0x78 (SetInput-like)   — @0x103e09 in GetOutput
 *   *0x18 (Release)         — @0x103d02 (D2), @0x103d52 (D1), @0x103da2 (D0)
 * Plus one direct call: `HGColorMatrix::LoadMatrix(vec4 const*, bool)` @0x103e1f
 *   (Mangled __ZN13HGColorMatrix10LoadMatrixEPKDv4_fb — second arg is a
 *   bool (edx=1) and first is a pointer to a 4-float-vector array; here
 *   the 4x4 matrix at `matrixPtr`.)
 */
export interface HGColorMatrix {
  /** vtable *0x18 @Helium — invoked from ~HGDJIDLog::Encode dtors (D2 @0x103d02, D1 @0x103d52, D0 @0x103da2). */
  Release(): void;
  /** vtable *0x78 @Helium — invoked from GetOutput @0x103e09 with (esi=0, rdx=input). */
  SetInput(idx: number, input: HGNode): void;
  /**
   * `HGColorMatrix::LoadMatrix(float vector[4] const*, bool)` — Helium
   * __ZN13HGColorMatrix10LoadMatrixEPKDv4_fb, invoked @0x103e1f with
   * (this, this.matrixPtr, true). Not a vtable slot; direct call.
   */
  LoadMatrix(matrix: ReadonlyArray<number>, flag: boolean): void;
}

/**
 * Placeholder for the HgcLogVideo_encode owned at `this.logEncode`
 * (+0x1a0). Undecoded — exposes only the vtable slots we invoke:
 *   *0x78 (SetInput-like)   — @0x103e42 with (0, colorMatrix)
 *   *0x60 (SetParameter)    — @0x103e71 with (0, seg0-xmm0..xmm3)
 *                            @0x103e9e with (1, seg1-xmm0..xmm3)
 *   *0x18 (Release)         — dtors D2 @0x103d14, D1 @0x103d64, D0 @0x103db4
 */
export interface HgcLogVideo_encode {
  /** vtable *0x18 @Helium — invoked from ~HGDJIDLog::Encode dtors (D2 @0x103d14, D1 @0x103d64, D0 @0x103db4). */
  Release(): void;
  /** vtable *0x60 @Helium — invoked twice from GetOutput (@0x103e71, @0x103e9e). Signature (idx, xmm0..xmm3). */
  SetParameter(idx: number, a: number, b: number, c: number, d: number): void;
  /** vtable *0x78 @Helium — invoked once from GetOutput (@0x103e42) with (esi=0, rdx=colorMatrix). */
  SetInput(idx: number, input: HGNode): void;
}

/**
 * `newHGColorMatrix()` — placeholder for the color-matrix allocation +
 * ctor sequence @Helium 0x103c3f..0x103c4f:
 *   0x103c3f  movl  $0x1f0, %edi                     ; alloc size = 0x1F0 = 496 bytes
 *   0x103c44  callq __ZN8HGObjectnwEm                ; HGObject::operator new(unsigned long)
 *   0x103c4f  callq __ZN13HGColorMatrixC1Ev          ; placement-ctor
 * Both callees are undecoded -> throw (rule 3).
 */
function newHGColorMatrix(): HGColorMatrix {
  throw new Error(
    "HGDJIDLog::Encode: HGColorMatrix ctor + HGObject::operator new @Helium 0x103c44/0x103c4f not yet transcribed"
  );
}

/**
 * `newHgcLogVideo_encode()` — placeholder for the compositor allocation +
 * ctor sequence @Helium 0x103c5b..0x103c6b:
 *   0x103c5b  movl  $0x1a0, %edi                     ; alloc size = 0x1A0 = 416 bytes
 *   0x103c60  callq __ZN8HGObjectnwEm                ; HGObject::operator new
 *   0x103c6b  callq __ZN18HgcLogVideo_encodeC1Ev     ; placement-ctor
 * Both callees are undecoded -> throw (rule 3).
 */
function newHgcLogVideo_encode(): HgcLogVideo_encode {
  throw new Error(
    "HGDJIDLog::Encode: HgcLogVideo_encode ctor + HGObject::operator new @Helium 0x103c60/0x103c6b not yet transcribed"
  );
}

/**
 * `HGDJIDLog::Encode` — Helium HGNode subclass wrapping an owned
 * HGColorMatrix (source colorimetry -> D-Gamut) chained into an owned
 * HgcLogVideo_encode configured for the DJI D-Log forward OETF.
 *
 * @Helium ctors  @0x103c20 (C2) / @0x103cd0 (C1 — tail-jmp to C2);
 *         dtors  @0x103ce0 (D2) / @0x103d30 (D1) / @0x103d80 (D0);
 *         GetOutput @0x103de0.
 */
export class HGDJIDLogEncode extends HGNode {
  /**
   * Owned `HGColorMatrix`. Field @0x198.
   * Assigned once in the ctor @0x103c54: `movq %r15, 0x198(%rbx)`.
   */
  colorMatrix: HGColorMatrix | null;

  /**
   * Owned `HgcLogVideo_encode`. Field @0x1a0.
   * Assigned once in the ctor @0x103c70: `movq %r15, 0x1a0(%rbx)`.
   */
  logEncode: HgcLogVideo_encode | null;

  /**
   * Pointer into `HGDJIDLog_Encode_sourceToDGamut[colorimetry]` — a
   * 16-float row-major 4x4 matrix. Field @0x1a8.
   * Written in ctor @0x103c88: `movq %rcx, 0x1a8(%rbx)`, where rcx =
   * `sourceToDGamut + (colorimetry << 6)` @0x103c77..0x103c88.
   */
  matrixPtr: ReadonlyArray<number>;

  /**
   * `HGDJIDLog::Encode::Encode(SceneColorimetry)` — Helium @0x103c20 (C2
   * base-object ctor). C1 @0x103cd0 is a 1-line tail-jmp to C2 so only
   * C2's body needs modelling.
   *
   * Verbatim asm (@0x103c20..0x103c99, prologue/epilogue elided; the
   * C++ unwind path at 0x103c9a..0x103cc7 only fires if a nested ctor
   * throws — TS exceptions unwind naturally, so it is not modelled):
   *   0x103c2a  movl  %esi, %r14d                    ; r14d = SceneColorimetry
   *   0x103c2d  movq  %rdi, %rbx                     ; rbx  = this
   *   0x103c30  callq __ZN6HGNodeC2Ev                ; HGNode base ctor
   *   0x103c35  leaq  0x915904(%rip), %rax           ; = 0xa19540 (own installed vtable ptr)
   *   0x103c3c  movq  %rax, (%rbx)                   ; *this = vtable
   *   0x103c3f  movl  $0x1f0, %edi                   ; alloc 0x1F0 for HGColorMatrix
   *   0x103c44  callq __ZN8HGObjectnwEm
   *   0x103c49  movq  %rax, %r15                     ; r15 = colorMatrix
   *   0x103c4c  movq  %rax, %rdi
   *   0x103c4f  callq __ZN13HGColorMatrixC1Ev
   *   0x103c54  movq  %r15, 0x198(%rbx)              ; this.colorMatrix = r15
   *   0x103c5b  movl  $0x1a0, %edi                   ; alloc 0x1A0 for HgcLogVideo_encode
   *   0x103c60  callq __ZN8HGObjectnwEm
   *   0x103c65  movq  %rax, %r15                     ; r15 = logEncode
   *   0x103c68  movq  %rax, %rdi
   *   0x103c6b  callq __ZN18HgcLogVideo_encodeC1Ev
   *   0x103c70  movq  %r15, 0x1a0(%rbx)              ; this.logEncode = r15
   *   0x103c77  movl  %r14d, %eax                    ; eax = SceneColorimetry
   *   0x103c7a  shlq  $0x6, %rax                     ; rax *= 64 (sizeof(float[16]))
   *   0x103c7e  leaq  sourceToDGamut(%rip), %rcx     ; @0x3d1a30
   *   0x103c85  addq  %rax, %rcx                     ; rcx += row-offset
   *   0x103c88  movq  %rcx, 0x1a8(%rbx)              ; this.matrixPtr = &sourceToDGamut[sc]
   *   0x103c99  retq
   *
   * @param sceneColorimetry  SceneColorimetry enum (u32; NOT bounds-checked
   *                          — the disasm doesn't check either).
   */
  constructor(sceneColorimetry: SceneColorimetry) {
    // @Helium 0x103c30: HGNode base ctor
    super();
    // @Helium 0x103c3c: install this class's vtable (installed ptr = 0xa19540).
    this.vtable = 0xa19540;
    // @Helium 0x103c44..0x103c4f: alloc 0x1f0 bytes + HGColorMatrix ctor.
    // Throws until HGColorMatrix is transcribed (see stub above).
    const newColorMatrix = newHGColorMatrix();
    // @Helium 0x103c54: store colorMatrix
    this.colorMatrix = newColorMatrix;
    // @Helium 0x103c60..0x103c6b: alloc 0x1a0 bytes + HgcLogVideo_encode ctor.
    const newLogEncode = newHgcLogVideo_encode();
    // @Helium 0x103c70: store logEncode
    this.logEncode = newLogEncode;
    // @Helium 0x103c77..0x103c88: matrixPtr = &sourceToDGamut[sceneColorimetry]
    // (single enum arg — no colorimetry/ei ladder as in HGARRILogC).
    this.matrixPtr = HGDJIDLog_Encode_sourceToDGamut[sceneColorimetry as number];
  }

  /**
   * `HGDJIDLog::Encode::~Encode()` — Helium @0x103ce0 (D2) / @0x103d30
   * (D1) / @0x103d80 (D0). All three share the same body up through the
   * base-dtor call; D0 additionally tail-calls `HGObject::operator
   * delete`. Bodies (extracted via awk on /tmp/Helium_tV.txt):
   *
   * D2 @0x103ce0..0x103d20 (byte-identical shape; different leaq disp):
   *   0x103ce9  leaq  0x915850(%rip), %rax           ; = 0xa19540 (own installed vtable)
   *   0x103cf0  movq  %rax, (%rdi)                   ; reinstall vtable
   *   0x103cf3  movq  0x198(%rdi), %rdi              ; rdi = colorMatrix
   *   0x103cfa  testq %rdi, %rdi
   *   0x103cfd  je    0x103d05
   *   0x103cff  movq  (%rdi), %rax                   ; rax = colorMatrix.vtable
   *   0x103d02  callq *0x18(%rax)                    ; colorMatrix.Release()
   *   0x103d05  movq  0x1a0(%rbx), %rdi              ; rdi = logEncode
   *   0x103d0c  testq %rdi, %rdi
   *   0x103d0f  je    0x103d17
   *   0x103d11  movq  (%rdi), %rax                   ; rax = logEncode.vtable
   *   0x103d14  callq *0x18(%rax)                    ; logEncode.Release()
   *   0x103d17  movq  %rbx, %rdi                     ; rdi = this
   *   0x103d20  jmp   __ZN6HGNodeD2Ev                ; tail-call HGNode base dtor
   *
   * D1 @0x103d30..0x103d70 is byte-identical (different leaq disp to the
   * same 0xa19540 target). D0 @0x103d80..0x103dc8 additionally follows the
   * HGNode base-dtor `callq` with `jmp __ZN8HGObjectdlEPv` (@0x103dc8);
   * the operator-delete step is modelled by the JS caller dropping the
   * reference (TS has no explicit `delete this`).
   */
  destruct(): void {
    // @Helium 0x103cf0 (D2) / 0x103d40 (D1) / 0x103d90 (D0): vtable reinstall.
    this.vtable = 0xa19540;
    // @Helium 0x103cf3..0x103d02 (D2): release colorMatrix if present.
    if (this.colorMatrix != null) {
      this.colorMatrix.Release();
      this.colorMatrix = null;
    }
    // @Helium 0x103d05..0x103d14 (D2): release logEncode if present.
    if (this.logEncode != null) {
      this.logEncode.Release();
      this.logEncode = null;
    }
    // @Helium 0x103d20 (D2) / 0x103d70 (D1) / 0x103dba (D0): HGNode::~HGNode().
    super.destruct();
  }

  /**
   * `HGDJIDLog::Encode::GetOutput(HGRenderer*)` — Helium @0x103de0.
   *
   * Wires the two owned compositor children into the render graph:
   *   1) input        = renderer.GetInput(this, 0)                              [@0x103df9]
   *   2) colorMatrix.SetInput(0, input)                                          [vtable *0x78 @0x103e09]
   *   3) HGColorMatrix::LoadMatrix(colorMatrix, this.matrixPtr, true)            [@0x103e1f]
   *   4) [lazy first-call] initialize static `c` to 0.0772632583975792f via
   *      cold.1 (guard byte checked by `movzbl` @0x103e24). Modelled eagerly
   *      in TS — see HGDJIDLog_Encode_getOutput_c_f32.
   *   5) logEncode.SetInput(0, colorMatrix)                                      [vtable *0x78 @0x103e42]
   *   6) logEncode.SetParameter(0, 0.89028f, 0.0108f, c, 0.584555f)              [vtable *0x60 @0x103e71]
   *   7) logEncode.SetParameter(1, 5.4225f, 0.0929f, 0.008667f, 0.0f)            [vtable *0x60 @0x103e9e]
   *   8) return this.logEncode                                                    [@0x103ea1]
   *
   * Verbatim asm (@0x103de0..0x103eac, prologue/epilogue elided; cold.1
   * jump target @0x103ead is the lazy static-init trampoline):
   *   0x103dea  movq  0x198(%rdi), %r14           ; r14 = this.colorMatrix
   *   0x103df1  movq  %rsi, %rdi                  ; rdi = renderer
   *   0x103df4  movq  %rbx, %rsi                  ; rsi = this
   *   0x103df7  xorl  %edx, %edx                  ; edx = 0
   *   0x103df9  callq __ZN10HGRenderer8GetInputEP6HGNodei  ; input = renderer.GetInput(this, 0)
   *   0x103dfe  movq  (%r14), %rcx                ; rcx = colorMatrix.vtable
   *   0x103e01  movq  %r14, %rdi                  ; rdi = colorMatrix
   *   0x103e04  xorl  %esi, %esi                  ; esi = 0
   *   0x103e06  movq  %rax, %rdx                  ; rdx = input
   *   0x103e09  callq *0x78(%rcx)                 ; colorMatrix.SetInput(0, input)
   *   0x103e0c  movq  0x198(%rbx), %rdi           ; rdi = this.colorMatrix
   *   0x103e13  movq  0x1a8(%rbx), %rsi           ; rsi = this.matrixPtr
   *   0x103e1a  movl  $0x1, %edx                  ; edx = 1  (bool arg)
   *   0x103e1f  callq __ZN13HGColorMatrix10LoadMatrixEPKDv4_fb  ; LoadMatrix(matrixPtr, true)
   *   0x103e24  movzbl guard(%rip), %eax          ; check guard byte for static `c`
   *   0x103e2b  testb %al, %al
   *   0x103e2d  je    0x103ead                    ; if guard==0 -> cold.1 to init `c`
   *   0x103e2f  movq  0x198(%rbx), %rdx           ; rdx = this.colorMatrix (arg to SetInput)
   *   0x103e36  movq  0x1a0(%rbx), %rdi           ; rdi = this.logEncode
   *   0x103e3d  movq  (%rdi), %rax                ; rax = logEncode.vtable
   *   0x103e40  xorl  %esi, %esi                  ; esi = 0
   *   0x103e42  callq *0x78(%rax)                 ; logEncode.SetInput(0, colorMatrix)
   *   0x103e45  movq  0x1a0(%rbx), %rdi           ; rdi = this.logEncode
   *   0x103e4c  movss c(%rip), %xmm2              ; xmm2 = c = 0.0772632583975792f
   *   0x103e54  movq  (%rdi), %rax                ; rax = logEncode.vtable
   *   0x103e57  movss 0x2cd1b5(%rip), %xmm0       ; xmm0 = 0.89028f      @0x3d1014
   *   0x103e5f  movss 0x2cd1b1(%rip), %xmm1       ; xmm1 = 0.0108f       @0x3d1018
   *   0x103e67  movss 0x2cd1ad(%rip), %xmm3       ; xmm3 = 0.5845549f    @0x3d101c
   *   0x103e6f  xorl  %esi, %esi                  ; esi = 0
   *   0x103e71  callq *0x60(%rax)                 ; logEncode.SetParameter(0, 0.89028, 0.0108, c, 0.5845549)
   *   0x103e74  movq  0x1a0(%rbx), %rdi           ; rdi = this.logEncode
   *   0x103e7b  movq  (%rdi), %rax                ; rax = logEncode.vtable
   *   0x103e7e  movss 0x2cd19a(%rip), %xmm0       ; xmm0 = 5.4225f       @0x3d1020
   *   0x103e86  movss 0x2cd196(%rip), %xmm1       ; xmm1 = 0.0929f       @0x3d1024
   *   0x103e8e  movss 0x2cd192(%rip), %xmm2       ; xmm2 = 0.008667f     @0x3d1028
   *   0x103e96  xorps %xmm3, %xmm3                ; xmm3 = 0.0f
   *   0x103e99  movl  $0x1, %esi                  ; esi = 1
   *   0x103e9e  callq *0x60(%rax)                 ; logEncode.SetParameter(1, 5.4225, 0.0929, 0.008667, 0.0)
   *   0x103ea1  movq  0x1a0(%rbx), %rax           ; rax = this.logEncode (return value)
   *   0x103eac  retq
   *   0x103ead  callq cold.1                      ; initializes `c` to 0x3d9e3c33
   *   0x103eb2  jmp   0x103e2f                    ; loop back into the fast path once `c` is ready
   *
   * @param renderer  the containing HGRenderer (undecoded — only
   *                  `GetInput` is invoked here).
   * @returns         `this.logEncode` — the compositor output of this filter.
   */
  GetOutput(renderer: HGRendererStub): HGNode {
    // @Helium 0x103dea: r14 = this.colorMatrix. Invariant: non-null after ctor.
    const cm = this.colorMatrix;
    const le = this.logEncode;
    if (cm == null || le == null) {
      throw new Error(
        "HGDJIDLog::Encode::GetOutput @Helium 0x103dea — colorMatrix or logEncode null (should be unreachable after ctor)"
      );
    }
    // @Helium 0x103df9: input = renderer.GetInput(this, 0)
    const input = renderer.GetInput(this, 0);
    // @Helium 0x103e09: colorMatrix.SetInput(0, input)  [vtable *0x78]
    cm.SetInput(0, input);
    // @Helium 0x103e1f: HGColorMatrix::LoadMatrix(this.matrixPtr, /*bool*/ true)
    cm.LoadMatrix(this.matrixPtr, true);
    // @Helium 0x103e24..0x103ead: lazy static-`c` init via cold.1. In TS
    // this is computed at module load (HGDJIDLog_Encode_getOutput_c_f32).
    // @Helium 0x103e42: logEncode.SetInput(0, colorMatrix)  [vtable *0x78]
    le.SetInput(0, cm as unknown as HGNode);
    // @Helium 0x103e71: logEncode.SetParameter(0, 0.89028f, 0.0108f, c, 0.5845549f)  [vtable *0x60]
    le.SetParameter(
      0,
      HGDJIDLog_Encode_getOutput_seg0_xmm0_f32,
      HGDJIDLog_Encode_getOutput_seg0_xmm1_f32,
      HGDJIDLog_Encode_getOutput_c_f32,
      HGDJIDLog_Encode_getOutput_seg0_xmm3_f32,
    );
    // @Helium 0x103e9e: logEncode.SetParameter(1, 5.4225f, 0.0929f, 0.008667f, 0.0f)  [vtable *0x60]
    le.SetParameter(
      1,
      HGDJIDLog_Encode_getOutput_seg1_xmm0_f32,
      HGDJIDLog_Encode_getOutput_seg1_xmm1_f32,
      HGDJIDLog_Encode_getOutput_seg1_xmm2_f32,
      Math.fround(0.0),
    );
    // @Helium 0x103ea1..0x103eac: return this.logEncode (cast to HGNode via C++ inheritance).
    return le as unknown as HGNode;
  }
}
