// raw-port/src/render/HGPanasonicVLog_Encode.ts
//
// FCP `HGPanasonicVLog::Encode` — nested Helium HGNode subclass. Wraps an
// owned `HGColorMatrix` (source-colorimetry -> Panasonic V-Gamut 3x3 gamut
// conversion, framed in a 4x4 affine matrix) chained into an owned
// `HgcLogVideo_encode` compositor configured for the Panasonic V-Log
// forward OETF (scene-linear -> V-Log code value).
//
// Same nested-class facade shape as `HGACEScct::Encode` and
// `HGSonySLog3::Encode` (both landed): a HGNode facade that owns and
// configures a HgcLogVideo_encode via two SetParameter slot-0x60 calls,
// with a HGColorMatrix chained in front for the gamut transform (like
// SonySLog3). Coefficient tables here are selected by one ctor enum
// (SceneColorimetry) rather than three; all other f32 coefficients are
// inline-loaded from the __const pool inside GetOutput, so there is no
// per-instance coefficient cache (0x1b0/... fields don't exist here).
//
// FRAMEWORK: Helium.framework
// FAT slice offset: 0x4000; thin binary /tmp/Helium.x86_64 has VA == file
// offset (segment __TEXT vmaddr = 0). Constants read via
// `raw-port/army/tools/resolve.py Helium const 0x...`.
//
// DISASSEMBLY (extracted via `objdump --disassemble-symbols=...` on
// /tmp/Helium.x86_64):
//   __ZN15HGPanasonicVLog6EncodeC2ENS_16SceneColorimetryE               @0x1044a0
//   __ZN15HGPanasonicVLog6EncodeC1ENS_16SceneColorimetryE               @0x104550  (tail-jmp to C2)
//   __ZN15HGPanasonicVLog6EncodeD2Ev                                    @0x104560
//   __ZN15HGPanasonicVLog6EncodeD1Ev                                    @0x1045b0
//   __ZN15HGPanasonicVLog6EncodeD0Ev                                    @0x104600
//   __ZN15HGPanasonicVLog6Encode9GetOutputEP10HGRenderer                @0x104660
//   __ZN15HGPanasonicVLog6Encode9GetOutputEP10HGRenderer.cold.1         @0x3c3b90
//     (cold.1 is the __cxa_guard_acquire/release path for the lazy
//     initialization of the function-local static float `c` @0xade040
//     from immediate 0x3D94E54A — see STATIC LOCALS below.)
//
// VTABLE:
//   Ctor @0x1044b5: `leaq 0x915744(%rip), %rax` (rip@0x1044bc)
//     -> 0x1044bc + 0x915744 = 0xa19c00 = "vtable for HGPanasonicVLog::Encode + 0x10"
//     (installed ptr per Itanium ABI). Reinstalled identically in D2/D1/D0
//     via three separate leaq displacements that all compute 0xa19c00
//     (verified: 0x104570+0x915690 = 0x1045c0+0x915640 = 0x104610+0x9155f0 = 0xa19c00).
//
// STRUCT LAYOUT (recovered from C2 @0x1044a0 + GetOutput @0x104660):
//   HGPanasonicVLog::Encode extends HGNode (base ctor called @0x1044b0, so
//   HGNode occupies offsets 0x00..0x197 per raw-port/src/render/HGNode.ts).
//   This subclass adds ONLY THREE fields (unlike SonySLog3 which also caches
//   6 coefficient floats — V-Log inline-loads all coefficients from __const
//   inside GetOutput and does NOT cache them in the instance):
//     0x198 : HGColorMatrix*         colorMatrix   (alloc size 0x1f0; @0x1044bf/0x1044cf)
//     0x1a0 : HgcLogVideo_encode*    logEncode     (alloc size 0x1a0; @0x1044db/0x1044eb)
//     0x1a8 : const float[16]*       matrixPtr     (points into sourceToVGamut[sc])
//   Total sizeof = 0x1b0 (or rounded up). No further fields touched by any
//   ported entry point.
//
// CONSTRUCTOR ARG WIRING (SysV AMD64: rdi=this, esi = 1st int arg):
//   %esi -> %r14d : SceneColorimetry     (indexes sourceToVGamut as `r14d << 6`)
//   (Only one enum arg — cf. SonySLog3's three-arg ctor.)
//
// CTOR MATRIX-TABLE SELECT (@0x1044f7..0x104508):
//   0x1044f7  movl  %r14d, %eax           ; eax = SceneColorimetry
//   0x1044fa  shlq  $0x6, %rax            ; rax = SceneColorimetry * 64  (sizeof(float[16]) = 64)
//   0x1044fe  leaq  sourceToVGamut(%rip), %rcx  ; @Helium 0x3d1af0
//   0x104505  addq  %rax, %rcx            ; rcx += row-offset
//   0x104508  movq  %rcx, 0x1a8(%rbx)     ; this.matrixPtr = &sourceToVGamut[sc]
//
// STATIC TABLE (in Helium __const):
//
//   sourceToVGamut  (__ZN15HGPanasonicVLog6Encode14sourceToVGamutE @0x3d1af0, sizeof=0x80):
//     Two 4x4 float row-major affine matrices, 64 bytes each; ctor indexes
//     as `table[sc]`. Values verbatim from a raw file-offset dump of
//     /tmp/Helium.x86_64 at 0x3d1af0 (VA==offset):
//
//     entry[0] (sc=0) @0x3d1af0:
//       0.5851961374282837    0.32264161109924316   0.09216222912073135   0.0
//       0.07858856767416      0.8196271061897278    0.10178431868553162   0.0
//       0.022794237360358238  0.11421702057123184   0.8629887104034424    0.0
//       0.0                   0.0                   0.0                   1.0
//
//     entry[1] (sc=1) @0x3d1b30:
//       0.9298549294471741    0.012365755625069141  0.05777928978204727   0.0
//       0.02656319923698902   0.8721362352371216    0.10130055248737335   0.0
//       0.007959937676787376  0.02920316532254219   0.9628369212150574    0.0
//       0.0                   0.0                   0.0                   1.0
//
// STATIC LOCALS — function-local static in GetOutput (Itanium ABI
// __cxa_guard_acquire/release, initialized lazily on first call):
//
//   __ZZN15HGPanasonicVLog6Encode9GetOutputEP10HGRendererE1c
//     @Helium BSS 0xade040 (guard byte @0xade048).
//     Type: float32.
//     Initialized @cold.1 @0x3c3ba4: `movl $0x3d94e54a, 0x71a492(%rip)`
//       — bit-pattern 0x3D94E54A decodes to 0.07270295917987823f as IEEE 754 float32.
//     Semantically: this is the V-Log log-region log2 coefficient
//     = 0.241514 * log10(2), where 0.241514 is the canonical V-Log `c`
//     parameter. The 0.241514 * log10(2) precomputation converts the
//     canonical `c * log10(...)` formulation to the `c * log2(...)`
//     form the shader consumes (identical semantic reason as HGACEScct's
//     1/17.52 = shader-log2 divisor).
//
// STATIC F32 COEFFICIENTS inline-loaded by GetOutput (all @Helium __const,
// verified via `resolve.py Helium const 0xADDR` and cross-checked against
// canonical Panasonic V-Log spec parameters):
//
//   @0x3d0fec  raw 0x3f666666  ->  0.8999999761581421f  (V-Log linear normalization = 0.9)
//   @0x3d1040  raw 0x3c0f0846  ->  0.008729999884963036f (V-Log offset "b" = 0.00873)
//   @0x3d1044  raw 0x3f192407  ->  0.5982059836387634f  (V-Log offset "d" = 0.598206)
//   @0x3d1048  raw 0x40a147ae  ->  5.039999961853027f    (linear-region slope = 5.6 * 0.9)
//   @0x3d104c  raw 0x3c360b61  ->  0.011111111380159855f (1/90 = 0.125 / 11.25 family;
//                                                        the small-signal shift 0.125 / linear-slope 11.25 relation)
//   @0x3ca9d4  raw 0x3e000000  ->  0.125f                (V-Log offset "f" = 0.125)
//
//   These reproduce the V-Log 1.2 spec forward OETF piecewise:
//     if lin < cut1:   V_out = 5.6 * lin + 0.125
//     else:            V_out = 0.241514 * log10(lin + 0.00873) + 0.598206
//   modulo the shader's internal (a*log2 + b) parameterization, which
//   consumes the six floats above as `(seg0: 1/9=?, ..., seg1: ...)` —
//   we ship the byte-exact floats; the shader semantics live inside
//   HgcLogVideo_encode (not decoded here).
//
// GETOUTPUT (@0x104660..0x104736) — rendering-graph wiring:
//   1) input       = HGRenderer::GetInput(this, 0)                          @0x104679
//   2) colorMatrix.vtable[0x78](0, input)                                   @0x104689
//   3) HGColorMatrix::LoadMatrix(colorMatrix, this.matrixPtr, /*bool*/true) @0x10469f
//   4) [lazy] initialize static `c` @0xade040 to 0.07270295917987823f      @0x1046a4..0x10472d (via cold.1)
//   5) logEncode.vtable[0x78](0, colorMatrix)                               @0x1046c2
//   6) logEncode.vtable[0x60](0, 0.9f, 0.00873f, c(=0.07270296f), 0.598206f) @0x1046f1
//   7) logEncode.vtable[0x60](1, 5.04f, 0.125f, 0.011111111f, 0.0f)         @0x10471e
//   8) return this.logEncode                                                @0x104721
//
// UNDECODED CALLEES (throw-stubs per PORTING_SPEC.md rule 3):
//   HGObject::operator new(unsigned long)       @Helium __ZN8HGObjectnwEm   — @0x1044c4, @0x1044e0
//   HGObject::operator delete(void*)            @Helium __ZN8HGObjectdlEPv  — D0 tail @0x104648
//   HGColorMatrix::HGColorMatrix()              @Helium __ZN13HGColorMatrixC1Ev  — @0x1044cf
//   HGColorMatrix::LoadMatrix(vec4 const*,bool) @Helium __ZN13HGColorMatrix10LoadMatrixEPKDv4_fb — @0x10469f
//   HgcLogVideo_encode::HgcLogVideo_encode()    @Helium __ZN18HgcLogVideo_encodeC1Ev — @0x1044eb
//   HgcLogVideo_encode vtable *0x18 (Release)   — from dtors @0x104582/0x104594 (colorMatrix + logEncode)
//   HgcLogVideo_encode vtable *0x60 (SetParameter-like) — twice in GetOutput
//   HgcLogVideo_encode vtable *0x78 (SetInput-like)     — from GetOutput
//   HGColorMatrix       vtable *0x78 (SetInput-like)    — from GetOutput
//   HGRenderer::GetInput(HGNode*, int)          @Helium __ZN10HGRenderer8GetInputEP6HGNodei — @0x104679
//   (HGNode ctor/dtor ARE ported and imported from ./HGNode.js.)

import { HGNode } from './HGNode.js';

// ---------------------------------------------------------------------------
// Enum shape for the single ctor arg. Value is the raw integer the C++
// enum encodes; we don't have the enumerator names in the binary (only
// the enum type name via demangling), so we treat it as `number` and
// document the observed values (0 vs 1) that the ctor's `shlq $0x6`
// indexing reads. Any additional values would run off the end of the
// 2-entry `sourceToVGamut` table (128 bytes) — the C++ code doesn't
// range-check either, so a caller passing 2+ is out of contract.
// ---------------------------------------------------------------------------

/**
 * HGPanasonicVLog::SceneColorimetry — sole ctor arg (esi -> r14d).
 * Observed use: indexes into the 2-entry `sourceToVGamut` matrix table
 * as `r14d << 6` (row of 64 bytes = float[16] = 4x4 matrix). Values 0
 * and 1 are in-range; higher values overflow the 128-byte table.
 */
export type SceneColorimetry = 0 | 1 | number;

// ---------------------------------------------------------------------------
// Static table — Helium `__const` payload, transcribed verbatim from a
// file-offset dump of /tmp/Helium.x86_64 at 0x3d1af0 (VA==file offset).
// 4x4 row-major affine float matrices; ctor indexes as `table[sc]`.
// ---------------------------------------------------------------------------

/**
 * `HGPanasonicVLog::Encode::sourceToVGamut` — Helium `__const` @0x3d1af0,
 * 0x80 bytes (2 x 4x4 float matrices). Sole matrix table used by this class.
 * Mangled: __ZN15HGPanasonicVLog6Encode14sourceToVGamutE.
 */
export const HGPanasonicVLog_Encode_sourceToVGamut: ReadonlyArray<ReadonlyArray<number>> = [
  // @Helium 0x3d1af0 — SceneColorimetry == 0
  [
    Math.fround(0.5851961374282837),   Math.fround(0.32264161109924316), Math.fround(0.09216222912073135), Math.fround(0.0),
    Math.fround(0.07858856767416),     Math.fround(0.8196271061897278),  Math.fround(0.10178431868553162), Math.fround(0.0),
    Math.fround(0.022794237360358238), Math.fround(0.11421702057123184), Math.fround(0.8629887104034424),  Math.fround(0.0),
    Math.fround(0.0),                  Math.fround(0.0),                 Math.fround(0.0),                 Math.fround(1.0),
  ],
  // @Helium 0x3d1b30 — SceneColorimetry == 1
  [
    Math.fround(0.9298549294471741),   Math.fround(0.012365755625069141), Math.fround(0.05777928978204727), Math.fround(0.0),
    Math.fround(0.02656319923698902),  Math.fround(0.8721362352371216),   Math.fround(0.10130055248737335), Math.fround(0.0),
    Math.fround(0.007959937676787376), Math.fround(0.02920316532254219),  Math.fround(0.9628369212150574),  Math.fround(0.0),
    Math.fround(0.0),                  Math.fround(0.0),                  Math.fround(0.0),                 Math.fround(1.0),
  ],
];

// ---------------------------------------------------------------------------
// Function-local static `c` for GetOutput — Itanium ABI static-local with
// guard byte. In the C++ source this is a function-scope `static const
// float c = 0.07270295917987823f;` initialized on first call via
// __cxa_guard_acquire/release (see cold.1 @0x3c3b90). In TS we compute it
// eagerly at module load — same observable result (the guard is a
// thread-safe first-write mechanism, not a runtime feature).
// ---------------------------------------------------------------------------

/**
 * `c` — HGPanasonicVLog::Encode::GetOutput static local float32.
 * @Helium BSS 0xade040 (guard byte @0xade048).
 * Initialized @cold.1 @0x3c3ba4: `movl $0x3d94e54a, c(%rip)`.
 * Bit-pattern 0x3D94E54A decodes to 0.07270295917987823 as IEEE 754 float32.
 * Semantically: V-Log log-region log2 coefficient = 0.241514 * log10(2)
 *   (canonical V-Log `c` = 0.241514; multiplying by log10(2) rebases the
 *    shader's log2 output into the spec's log10 units).
 * Loaded @0x1046cc as xmm2 of the segment-0 SetParameter call.
 */
const HGPanasonicVLog_Encode_getOutput_c_f32: number = Math.fround(0.07270295917987823);

// ---------------------------------------------------------------------------
// Inline-loaded coefficient constants read by GetOutput from Helium __const.
// Every one verified via a raw file-offset read of /tmp/Helium.x86_64
// (VA==file offset), and cross-checked against the canonical Panasonic
// V-Log 1.2 spec parameters.
// ---------------------------------------------------------------------------

/**
 * segment-0 xmm0 — @Helium 0x3d0fec raw 0x3f666666 (float32).
 * Value: 0.8999999761581421f (canonical V-Log linear normalization 0.9).
 * Loaded @0x1046d7 via `movss 0x2cc90d(%rip), %xmm0` (rip@0x1046df + 0x2cc90d = 0x3d0fec).
 */
const HGPanasonicVLog_Encode_getOutput_seg0_xmm0_f32: number = Math.fround(0.8999999761581421);

/**
 * segment-0 xmm1 — @Helium 0x3d1040 raw 0x3c0f0846 (float32).
 * Value: 0.008729999884963036f (canonical V-Log offset "b" = 0.00873).
 * Loaded @0x1046df via `movss 0x2cc959(%rip), %xmm1` (rip@0x1046e7 + 0x2cc959 = 0x3d1040).
 */
const HGPanasonicVLog_Encode_getOutput_seg0_xmm1_f32: number = Math.fround(0.008729999884963036);

/**
 * segment-0 xmm3 — @Helium 0x3d1044 raw 0x3f192407 (float32).
 * Value: 0.5982059836387634f (canonical V-Log offset "d" = 0.598206).
 * Loaded @0x1046e7 via `movss 0x2cc955(%rip), %xmm3` (rip@0x1046ef + 0x2cc955 = 0x3d1044).
 */
const HGPanasonicVLog_Encode_getOutput_seg0_xmm3_f32: number = Math.fround(0.5982059836387634);

/**
 * segment-1 xmm0 — @Helium 0x3d1048 raw 0x40a147ae (float32).
 * Value: 5.039999961853027f (= 5.6 * 0.9; V-Log linear-region slope
 * pre-scaled by the normalization 0.9).
 * Loaded @0x1046fe via `movss 0x2cc942(%rip), %xmm0` (rip@0x104706 + 0x2cc942 = 0x3d1048).
 */
const HGPanasonicVLog_Encode_getOutput_seg1_xmm0_f32: number = Math.fround(5.039999961853027);

/**
 * segment-1 xmm1 — @Helium 0x3ca9d4 raw 0x3e000000 (float32).
 * Value: 0.125f (canonical V-Log offset "f" = 0.125).
 * Loaded @0x104706 via `movss 0x2c62c6(%rip), %xmm1` (rip@0x10470e + 0x2c62c6 = 0x3ca9d4).
 */
const HGPanasonicVLog_Encode_getOutput_seg1_xmm1_f32: number = Math.fround(0.125);

/**
 * segment-1 xmm2 — @Helium 0x3d104c raw 0x3c360b61 (float32).
 * Value: 0.011111111380159855f (= 1/90; the shader's small-signal shift-
 * relative-to-linear-slope factor).
 * Loaded @0x10470e via `movss 0x2cc936(%rip), %xmm2` (rip@0x104716 + 0x2cc936 = 0x3d104c).
 */
const HGPanasonicVLog_Encode_getOutput_seg1_xmm2_f32: number = Math.fround(0.011111111380159855);

// ---------------------------------------------------------------------------
// Stubs for undecoded callees. Each raises loudly with its call-site @0xADDR
// so frontier.py can see the gap (rule 3: loud gap, never a silent guess).
// ---------------------------------------------------------------------------

/**
 * Placeholder for HGRenderer used by GetOutput's signature. Not yet
 * transcribed — see raw-port/army/ledger for the HGRenderer class.
 * `GetInput` is invoked @Helium 0x104679 with (this, 0).
 */
export interface HGRendererStub {
  /** @Helium 0x104679 — vcalled. Signature `GetInput(HGNode*, int) -> HGNode*`. */
  GetInput(node: HGNode, idx: number): HGNode;
}

/**
 * Placeholder for the HGColorMatrix owned at `this.field_198`. Not yet
 * transcribed. Two vtable slots vcalled from this class:
 *   *0x78 (SetInput-like) — @0x104689 in GetOutput
 *   *0x18 (Release)       — @0x104582/0x1045d2/0x104622 in dtors
 * Plus one direct call: `HGColorMatrix::LoadMatrix(vec4 const*, bool)` @0x10469f.
 */
export interface HGColorMatrix {
  /** vtable *0x18 @Helium — invoked from ~HGPanasonicVLog::Encode (D2 @0x104582, D1 @0x1045d2, D0 @0x104622). */
  Release(): void;
  /** vtable *0x78 @Helium — invoked from GetOutput @0x104689 with (esi=0, rdx=input). */
  SetInput(idx: number, input: HGNode): void;
  /**
   * `HGColorMatrix::LoadMatrix(float vector[4] const*, bool)` — Helium
   * __ZN13HGColorMatrix10LoadMatrixEPKDv4_fb, invoked @0x10469f with
   * (this, this.matrixPtr, true) — the bool edx-arg (the third integer
   * SysV arg) is loaded with `movl $0x1, %edx` immediately before the
   * call. Not a vtable slot; direct call.
   */
  LoadMatrix(matrix: ReadonlyArray<number>, flag: boolean): void;
}

/**
 * Placeholder for HgcLogVideo_encode. Not yet transcribed. Same shape as
 * the one wrapped by HGACEScct::Encode and HGSonySLog3::Encode.
 */
export interface HgcLogVideo_encode {
  /** vtable *0x18 @Helium — invoked from ~HGPanasonicVLog::Encode (D2 @0x104594, D1 @0x1045e4, D0 @0x104634). */
  Release(): void;
  /** vtable *0x60 @Helium — invoked twice from GetOutput (@0x1046f1, @0x10471e). Signature (idx, xmm0..xmm3). */
  SetParameter(idx: number, a: number, b: number, c: number, d: number): void;
  /** vtable *0x78 @Helium — invoked once from GetOutput (@0x1046c2) with (esi=0, rdx=colorMatrix). */
  SetInput(idx: number, input: HGNode): void;
}

/**
 * `newHGColorMatrix()` — placeholder for the compositor allocation +
 * ctor sequence at @Helium 0x1044bf..0x1044cf.
 *
 *   0x1044bf  movl  $0x1f0, %edi                     ; alloc size = 0x1F0 = 496 bytes
 *   0x1044c4  callq __ZN8HGObjectnwEm                ; HGObject::operator new(unsigned long)
 *   0x1044cf  callq __ZN13HGColorMatrixC1Ev          ; placement-ctor
 *
 * Both callees are undecoded -> throw (rule 3).
 */
function newHGColorMatrix(): HGColorMatrix {
  throw new Error(
    "HGPanasonicVLog::Encode: HGColorMatrix ctor + HGObject::operator new @Helium 0x1044c4/0x1044cf not yet transcribed"
  );
}

/**
 * `newHgcLogVideo_encode()` — placeholder for the compositor allocation +
 * ctor sequence at @Helium 0x1044db..0x1044eb.
 *
 *   0x1044db  movl  $0x1a0, %edi                     ; alloc size = 0x1A0 = 416 bytes
 *   0x1044e0  callq __ZN8HGObjectnwEm                ; HGObject::operator new
 *   0x1044eb  callq __ZN18HgcLogVideo_encodeC1Ev     ; placement-ctor
 */
function newHgcLogVideo_encode(): HgcLogVideo_encode {
  throw new Error(
    "HGPanasonicVLog::Encode: HgcLogVideo_encode ctor + HGObject::operator new @Helium 0x1044e0/0x1044eb not yet transcribed"
  );
}

/**
 * `HGPanasonicVLog::Encode` — Helium HGNode subclass wrapping an owned
 * HGColorMatrix (source colorimetry -> Panasonic V-Gamut) chained into
 * an owned HgcLogVideo_encode configured for the V-Log forward OETF.
 *
 * @Helium ctors  @0x1044a0 (C2) / @0x104550 (C1 — tail-jmp to C2);
 *         dtors  @0x104560 (D2) / @0x1045b0 (D1) / @0x104600 (D0);
 *         GetOutput @0x104660.
 */
export class HGPanasonicVLogEncode extends HGNode {
  /**
   * Owned `HGColorMatrix`. Field @0x198.
   * Assigned once in the ctor @0x1044d4: `movq %r15, 0x198(%rbx)`.
   */
  colorMatrix: HGColorMatrix | null;

  /**
   * Owned `HgcLogVideo_encode`. Field @0x1a0.
   * Assigned once in the ctor @0x1044f0: `movq %r15, 0x1a0(%rbx)`.
   */
  logEncode: HgcLogVideo_encode | null;

  /**
   * Pointer to the 16-float row-major matrix in the selected `sourceToVGamut`
   * row. Field @0x1a8. Written in ctor @0x104508.
   */
  matrixPtr: ReadonlyArray<number>;

  /**
   * `HGPanasonicVLog::Encode::Encode(SceneColorimetry)` — Helium @0x1044a0
   * (C2 base-object ctor). C1 @0x104550 is a tail-jmp to C2.
   *
   * Verbatim asm (prologue/epilogue elided; C++ unwind path at
   * 0x10451c..0x104545 only fires if allocation/ctor throws — TS
   * exceptions unwind naturally):
   *   0x1044aa  movl  %esi, %r14d          ; r14d = SceneColorimetry
   *   0x1044ad  movq  %rdi, %rbx           ; rbx  = this
   *   0x1044b0  callq __ZN6HGNodeC2Ev      ; HGNode base ctor
   *   0x1044b5  leaq  0x915744(%rip), %rax ; = 0xa19c00 (own installed vtable ptr)
   *   0x1044bc  movq  %rax, (%rbx)         ; *this = vtable
   *   0x1044bf  movl  $0x1f0, %edi         ; alloc 0x1F0 bytes
   *   0x1044c4  callq __ZN8HGObjectnwEm
   *   0x1044c9  movq  %rax, %r15           ; r15 = colorMatrix
   *   0x1044cc  movq  %rax, %rdi
   *   0x1044cf  callq __ZN13HGColorMatrixC1Ev
   *   0x1044d4  movq  %r15, 0x198(%rbx)    ; this.colorMatrix = r15
   *   0x1044db  movl  $0x1a0, %edi         ; alloc 0x1A0 bytes
   *   0x1044e0  callq __ZN8HGObjectnwEm
   *   0x1044e5  movq  %rax, %r15           ; r15 = logEncode
   *   0x1044e8  movq  %rax, %rdi
   *   0x1044eb  callq __ZN18HgcLogVideo_encodeC1Ev
   *   0x1044f0  movq  %r15, 0x1a0(%rbx)    ; this.logEncode = r15
   *   0x1044f7  movl  %r14d, %eax          ; eax = SceneColorimetry
   *   0x1044fa  shlq  $0x6, %rax           ; rax = SceneColorimetry * 64
   *   0x1044fe  leaq  sourceToVGamut(%rip), %rcx  ; @0x3d1af0
   *   0x104505  addq  %rax, %rcx           ; rcx += row-offset
   *   0x104508  movq  %rcx, 0x1a8(%rbx)    ; this.matrixPtr = &sourceToVGamut[sc]
   *   0x104519  retq
   */
  constructor(sceneColorimetry: SceneColorimetry) {
    // @Helium 0x1044b0: HGNode base ctor
    super();
    // @Helium 0x1044bc: install this class's vtable (installed ptr = 0xa19c00).
    this.vtable = 0xa19c00;
    // @Helium 0x1044c4..0x1044cf: alloc 0x1f0 bytes + HGColorMatrix ctor.
    // Throws until HGColorMatrix is transcribed (see stub above).
    const newColorMatrix = newHGColorMatrix();
    // @Helium 0x1044d4: store colorMatrix
    this.colorMatrix = newColorMatrix;
    // @Helium 0x1044e0..0x1044eb: alloc 0x1a0 bytes + HgcLogVideo_encode ctor.
    const newLogEncode = newHgcLogVideo_encode();
    // @Helium 0x1044f0: store logEncode
    this.logEncode = newLogEncode;
    // @Helium 0x1044f7..0x104508: matrixPtr = &sourceToVGamut[sceneColorimetry]
    // (No LogColorimetry / CVN branches — this class has one enum arg only.)
    this.matrixPtr = HGPanasonicVLog_Encode_sourceToVGamut[sceneColorimetry as number];
  }

  /**
   * `HGPanasonicVLog::Encode::~Encode()` — Helium @0x104560 (D2)
   * / @0x1045b0 (D1) / @0x104600 (D0). All three share the same body up
   * through the base-dtor call; D0 additionally tail-calls
   * `HGObject::operator delete`. Bodies:
   *
   * D2 @0x104560..0x1045a0:
   *   0x104569  leaq  0x915690(%rip), %rax  ; = 0xa19c00 (own installed vtable)
   *   0x104570  movq  %rax, (%rdi)          ; reinstall vtable
   *   0x104573  movq  0x198(%rdi), %rdi     ; rdi = colorMatrix
   *   0x10457a  testq %rdi, %rdi
   *   0x10457d  je    0x104585
   *   0x10457f  movq  (%rdi), %rax          ; rax = colorMatrix.vtable
   *   0x104582  callq *0x18(%rax)           ; colorMatrix.Release()
   *   0x104585  movq  0x1a0(%rbx), %rdi     ; rdi = logEncode
   *   0x10458c  testq %rdi, %rdi
   *   0x10458f  je    0x104597
   *   0x104591  movq  (%rdi), %rax          ; rax = logEncode.vtable
   *   0x104594  callq *0x18(%rax)           ; logEncode.Release()
   *   0x104597  movq  %rbx, %rdi            ; rdi = this
   *   0x1045a0  jmp   __ZN6HGNodeD2Ev       ; tail-call HGNode base dtor
   *
   * D1 @0x1045b0 is byte-identical (different leaq displacement to the same
   * 0xa19c00 target). D0 @0x104600 replaces the tail-jmp to HGNode::~HGNode()
   * with a non-tail call (@0x10463a) followed by `jmp __ZN8HGObjectdlEPv`
   * (@0x104648). The operator-delete step is modelled by the JS caller
   * dropping the reference (see HGACEScct_Encode.ts for the identical pattern).
   */
  destruct(): void {
    // @Helium 0x104570: vtable reinstall.
    this.vtable = 0xa19c00;
    // @Helium 0x104573..0x104582: release colorMatrix if present.
    if (this.colorMatrix != null) {
      this.colorMatrix.Release();
      this.colorMatrix = null;
    }
    // @Helium 0x104585..0x104594: release logEncode if present.
    if (this.logEncode != null) {
      this.logEncode.Release();
      this.logEncode = null;
    }
    // @Helium 0x1045a0: tail-jmp HGNode::~HGNode()
    super.destruct();
  }

  /**
   * `HGPanasonicVLog::Encode::GetOutput(HGRenderer*)` — Helium @0x104660.
   *
   * Wires the two owned compositor children into the render graph:
   *   1) input        = renderer.GetInput(this, 0)                              [@0x104679]
   *   2) colorMatrix.SetInput(0, input)                                          [vtable *0x78 @0x104689]
   *   3) HGColorMatrix::LoadMatrix(colorMatrix, this.matrixPtr, true)         [@0x10469f]
   *   4) [lazy first-call] initialize static `c` @0xade040 to 0.07270296f
   *      via cold.1 (guard byte @0xade048). Modelled eagerly in TS — see
   *      the module-level constant HGPanasonicVLog_Encode_getOutput_c_f32.
   *   5) logEncode.SetInput(0, colorMatrix)                                      [vtable *0x78 @0x1046c2]
   *   6) logEncode.SetParameter(0, 0.9f, 0.00873f, c, 0.598206f)                 [vtable *0x60 @0x1046f1]
   *   7) logEncode.SetParameter(1, 5.04f, 0.125f, 0.011111111f, 0.0f)            [vtable *0x60 @0x10471e]
   *   8) return this.logEncode                                                    [@0x104721]
   *
   * Verbatim asm (@0x104660..0x104732, prologue/epilogue elided):
   *   0x10466a  movq  0x198(%rdi), %r14           ; r14 = this.colorMatrix
   *   0x104671  movq  %rsi, %rdi                  ; rdi = renderer
   *   0x104674  movq  %rbx, %rsi                  ; rsi = this
   *   0x104677  xorl  %edx, %edx                  ; edx = 0
   *   0x104679  callq __ZN10HGRenderer8GetInputEP6HGNodei  ; input = renderer.GetInput(this, 0)
   *   0x10467e  movq  (%r14), %rcx                ; rcx = colorMatrix.vtable
   *   0x104681  movq  %r14, %rdi                  ; rdi = colorMatrix
   *   0x104684  xorl  %esi, %esi                  ; esi = 0
   *   0x104686  movq  %rax, %rdx                  ; rdx = input
   *   0x104689  callq *0x78(%rcx)                 ; colorMatrix.SetInput(0, input)
   *   0x10468c  movq  0x198(%rbx), %rdi           ; rdi = this.colorMatrix
   *   0x104693  movq  0x1a8(%rbx), %rsi           ; rsi = this.matrixPtr
   *   0x10469a  movl  $0x1, %edx                  ; edx = 1  (bool arg)
   *   0x10469f  callq __ZN13HGColorMatrix10LoadMatrixEPKDv4_fb  ; LoadMatrix(matrixPtr, true)
   *   0x1046a4  movzbl 0x9d999d(%rip), %eax       ; guard byte @0xade048
   *   0x1046ab  testb %al, %al
   *   0x1046ad  je    0x10472d                    ; if guard==0 -> cold.1 to init `c`
   *   0x1046af  movq  0x198(%rbx), %rdx           ; rdx = this.colorMatrix (arg-to-SetInput)
   *   0x1046b6  movq  0x1a0(%rbx), %rdi           ; rdi = this.logEncode
   *   0x1046bd  movq  (%rdi), %rax                ; rax = logEncode.vtable
   *   0x1046c0  xorl  %esi, %esi                  ; esi = 0
   *   0x1046c2  callq *0x78(%rax)                 ; logEncode.SetInput(0, colorMatrix)
   *   0x1046c5  movq  0x1a0(%rbx), %rdi           ; rdi = this.logEncode
   *   0x1046cc  movss 0x9d996c(%rip), %xmm2       ; xmm2 = c(@0xade040) = 0.07270296f
   *   0x1046d4  movq  (%rdi), %rax                ; rax = logEncode.vtable
   *   0x1046d7  movss 0x2cc90d(%rip), %xmm0       ; xmm0 = 0.9f    @0x3d0fec
   *   0x1046df  movss 0x2cc959(%rip), %xmm1       ; xmm1 = 0.00873f @0x3d1040
   *   0x1046e7  movss 0x2cc955(%rip), %xmm3       ; xmm3 = 0.598206f @0x3d1044
   *   0x1046ef  xorl  %esi, %esi                  ; esi = 0
   *   0x1046f1  callq *0x60(%rax)                 ; logEncode.SetParameter(0, 0.9, 0.00873, c, 0.598206)
   *   0x1046f4  movq  0x1a0(%rbx), %rdi           ; rdi = this.logEncode
   *   0x1046fb  movq  (%rdi), %rax                ; rax = logEncode.vtable
   *   0x1046fe  movss 0x2cc942(%rip), %xmm0       ; xmm0 = 5.04f   @0x3d1048
   *   0x104706  movss 0x2c62c6(%rip), %xmm1       ; xmm1 = 0.125f  @0x3ca9d4
   *   0x10470e  movss 0x2cc936(%rip), %xmm2       ; xmm2 = 0.011111111f @0x3d104c
   *   0x104716  xorps %xmm3, %xmm3                ; xmm3 = 0.0f
   *   0x104719  movl  $0x1, %esi                  ; esi = 1
   *   0x10471e  callq *0x60(%rax)                 ; logEncode.SetParameter(1, 5.04, 0.125, 0.011111, 0.0)
   *   0x104721  movq  0x1a0(%rbx), %rax           ; rax = this.logEncode   (return value)
   *   0x10472c  retq
   *   0x10472d  callq __ZN15HGPanasonicVLog6Encode9GetOutputEP10HGRenderer.cold.1
   *                                               ; (initializes `c` @0xade040 to 0x3d94e54a)
   *   0x104732  jmp   0x1046af                    ; loop back into the fast path once `c` is ready
   */
  GetOutput(renderer: HGRendererStub): HGNode {
    // @Helium 0x10466a: r14 = this.colorMatrix. Invariant: non-null after ctor.
    const cm = this.colorMatrix;
    const le = this.logEncode;
    if (cm == null || le == null) {
      throw new Error(
        "HGPanasonicVLog::Encode::GetOutput @Helium 0x10466a — colorMatrix or logEncode null (should be unreachable after ctor)"
      );
    }
    // @Helium 0x104679: input = renderer.GetInput(this, 0)
    const input = renderer.GetInput(this, 0);
    // @Helium 0x104689: colorMatrix.SetInput(0, input)  [vtable *0x78]
    cm.SetInput(0, input);
    // @Helium 0x10469f: HGColorMatrix::LoadMatrix(this.matrixPtr, /*bool*/ true)
    cm.LoadMatrix(this.matrixPtr, true);
    // @Helium 0x1046a4..0x10472d: lazy static-`c` init via cold.1. In TS
    // this is computed at module load (HGPanasonicVLog_Encode_getOutput_c_f32).
    // @Helium 0x1046c2: logEncode.SetInput(0, colorMatrix)  [vtable *0x78]
    le.SetInput(0, cm as unknown as HGNode);
    // @Helium 0x1046f1: logEncode.SetParameter(0, 0.9f, 0.00873f, c, 0.598206f)  [vtable *0x60]
    le.SetParameter(
      0,
      HGPanasonicVLog_Encode_getOutput_seg0_xmm0_f32,
      HGPanasonicVLog_Encode_getOutput_seg0_xmm1_f32,
      HGPanasonicVLog_Encode_getOutput_c_f32,
      HGPanasonicVLog_Encode_getOutput_seg0_xmm3_f32,
    );
    // @Helium 0x10471e: logEncode.SetParameter(1, 5.04f, 0.125f, 0.011111111f, 0.0f)  [vtable *0x60]
    le.SetParameter(
      1,
      HGPanasonicVLog_Encode_getOutput_seg1_xmm0_f32,
      HGPanasonicVLog_Encode_getOutput_seg1_xmm1_f32,
      HGPanasonicVLog_Encode_getOutput_seg1_xmm2_f32,
      Math.fround(0.0),
    );
    // @Helium 0x104721..0x10472c: return this.logEncode (cast to HGNode via C++ inheritance).
    return le as unknown as HGNode;
  }
}
