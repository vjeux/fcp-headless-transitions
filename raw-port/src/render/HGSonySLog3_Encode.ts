// raw-port/src/render/HGSonySLog3_Encode.ts
//
// FCP `HGSonySLog3::Encode` — nested Helium HGNode subclass. Wraps an owned
// `HGColorMatrix` (source-colorimetry → S-Gamut3 / S-Gamut3.Cine 3×3 conversion,
// framed in a 4×4 affine matrix) chained into an owned `HgcLogVideo_encode`
// compositor configured for the Sony S-Log3 forward OETF (scene-linear →
// S-Log3 code value). Matches the ACEScct::Encode shape (a HGNode facade
// that owns and configures a HgcLogVideo_encode via SetParameter slot 0x60);
// this class additionally chains a HGColorMatrix in front for the gamut
// transform, and its coefficient tables are selected by three ctor enums
// (SceneColorimetry, LogColorimetry, CodeValueNormalization) rather than
// hard-coded.
//
// FRAMEWORK: Helium.framework
// FAT slice offset: 0x4000; thin binary /tmp/Helium.x86_64 has VA == file
// offset (segment __TEXT vmaddr = 0). Constants read via
// `raw-port/army/tools/resolve.py Helium const 0x…`.
//
// DISASSEMBLY (extracted from /tmp/Helium_tV.txt):
//   __ZN11HGSonySLog36EncodeC2ENS_16SceneColorimetryENS_14LogColorimetryENS_22CodeValueNormalizationE   @0x1049e0
//   __ZN11HGSonySLog36EncodeC1ENS_16SceneColorimetryENS_14LogColorimetryENS_22CodeValueNormalizationE   @0x104ae0   (tail-jmp to C2)
//   __ZN11HGSonySLog36EncodeD2Ev                                                                        @0x104af0
//   __ZN11HGSonySLog36EncodeD1Ev                                                                        @0x104b40
//   __ZN11HGSonySLog36EncodeD0Ev                                                                        @0x104b90
//   __ZN11HGSonySLog36Encode9GetOutputEP10HGRenderer                                                    @0x104bf0
//
// VTABLE:
//   Ctor @0x1049ff: `leaq 0x91567a(%rip), %rax` (rip@0x104a06) -> 0xa1a080 =
//     "vtable for HGSonySLog3::Encode + 0x10" (Itanium ABI installed ptr).
//   Reinstalled at D2 @0x104af9->0xa1a080, D1 @0x104b49->0xa1a080, D0 @0x104b99->0xa1a080
//   (verified: 0x104b00+0x915580 = 0x104b50+0x915530 = 0x104ba0+0x9154e0 = 0xa1a080).
//
// STATIC-LOCALS: NONE. Unlike HGACEScct::Encode there are no `.cold.*`
// initializers for this class - every coefficient is either a compile-time
// constant baked into the read-only `__const` segment (matrix tables and
// coefficient blocks referenced by RIP-relative loads) or a plain
// SysV-argument enum value. `nm | grep 'HGSonySLog3::Encode' | grep cold`
// returns no results.
//
// STRUCT LAYOUT (recovered from C2 @0x1049e0 + GetOutput @0x104bf0):
//   HGSonySLog3::Encode extends HGNode (base ctor called @0x1049fa, so HGNode
//   occupies offsets 0x00..0x197 per raw-port/src/render/HGNode.ts). This
//   subclass adds:
//     0x198 : HGColorMatrix*         colorMatrix   (alloc size 0x1f0; @0x104a09/0x104a19)
//     0x1a0 : HgcLogVideo_encode*    logEncode     (alloc size 0x1a0; @0x104a25/0x104a35)
//     0x1a8 : const float[16]*       matrixPtr     (points into sourceToSGamut3[Cine][sc])
//     0x1b0 : float                  coef_seg0_x   (loaded to xmm0 in SetParameter(0,...))
//     0x1b4 : float                  coef_seg0_y   (loaded to xmm1 in SetParameter(0,...))
//     0x1b8 : float                  coef_seg0_z   (loaded to xmm2 in SetParameter(0,...))
//     0x1bc : float                  coef_seg0_w   (loaded to xmm3 in SetParameter(0,...))
//     0x1c0 : float                  coef_seg1_x   (loaded to xmm0 in SetParameter(1,...))
//     0x1c4 : float                  coef_seg1_y   (loaded to xmm1 in SetParameter(1,...))
//   Total sizeof = 0x1c8 (or rounded up). No further fields touched by any
//   ported entry point.
//
// CONSTRUCTOR ARG WIRING (SysV AMD64: rdi=this, esi/edx/ecx = 1st/2nd/3rd int args):
//   %esi -> %r12d : SceneColorimetry     (rows: 0=first, 1=second - inferred from row order)
//   %edx -> %r15d : LogColorimetry       (0=SGamut3 table,  1=SGamut3Cine table - from `testl` @0x104a48)
//   %ecx -> %r14d : CodeValueNormalization (0 vs 1 - chooses coefficient block @ 0x3d11e0 vs 0x3d11d0)
//
// CTOR MATRIX-TABLE SELECT (@0x104a41..0x104a60):
//   0x104a41  movl  %r12d, %eax           ; eax = SceneColorimetry
//   0x104a44  shlq  $0x6, %rax            ; rax = SceneColorimetry * 64  (sizeof(float[16]) = 64)
//   0x104a48  testl %r15d, %r15d          ; LogColorimetry != 0 ?
//   0x104a4b  leaq  sourceToSGamut3(%rip), %rcx     ; @Helium 0x3d1d10
//   0x104a52  leaq  sourceToSGamut3Cine(%rip), %rdx ; @Helium 0x3d1d90
//   0x104a59  cmoveq %rcx, %rdx           ; if LogColorimetry == 0: rdx = sourceToSGamut3
//                                          ; else                  : rdx = sourceToSGamut3Cine  (kept from leaq)
//   0x104a5d  addq  %rax, %rdx            ; rdx += row-offset
//   0x104a60  movq  %rdx, 0x1a8(%rbx)     ; this.matrixPtr = &table[sc]
//
// CTOR COEF-BLOCK SELECT (@0x104a67..0x104a8d):
//   0x104a67  movsd 0x2cc751(%rip), %xmm0 ; xmm0 = *(double*)0x3d11c0 (a packed pair of f32)
//   0x104a6f  movsd %xmm0, 0x1b0(%rbx)    ; this[0x1b0..0x1b7] = 2 floats from @0x3d11c0
//   0x104a77  cmpl  $0x1, %r14d           ; CodeValueNormalization == 1 ?
//   0x104a7b  je    0x104a86              ; then use 0x3d11d0
//   0x104a7d  movaps 0x2cc75c(%rip), %xmm0 ; else xmm0 = *(f32x4*)0x3d11e0
//   0x104a84  jmp   0x104a8d
//   0x104a86  movaps 0x2cc743(%rip), %xmm0 ; then xmm0 = *(f32x4*)0x3d11d0
//   0x104a8d  movups %xmm0, 0x1b8(%rbx)   ; this[0x1b8..0x1c7] = 4 floats
//   (i.e. 6 floats total: fixed first pair, variable second quad-by-CVN)
//
// STATIC TABLES (in Helium __const; all matrices are 4x4 affine float matrices, row-major,
// last row = (0,0,0,1)):
//
//   sourceToSGamut3      (__ZN11HGSonySLog36Encode15sourceToSGamut3E     @0x3d1d10, sizeof=0x80):
//     entry[0] (sc=0):
//       0.5660491    0.34276310    0.09118783    0.0
//       0.07696138   0.79905450    0.12398412    0.0
//       0.02235091   0.10861205    0.86903703    0.0
//       0.0          0.0           0.0           1.0
//     entry[1] (sc=1):
//       0.89557296   0.04651097    0.05791606    0.0
//       0.02602065   0.84755290    0.12642644    0.0
//       0.00781212   0.02250548    0.96968240    0.0
//       0.0          0.0           0.0           1.0
//
//   sourceToSGamut3Cine  (__ZN11HGSonySLog36Encode19sourceToSGamut3CineE @0x3d1d90, sizeof=0x80):
//     entry[0] (sc=0):
//       0.6456795    0.25911453    0.09520598    0.0
//       0.08752999   0.75969958    0.15277044    0.0
//       0.03695742   0.12928091    0.83376169    0.0
//       0.0          0.0           0.0           1.0
//     entry[1] (sc=1):
//       1.0381441   -0.09545269    0.05730863    0.0
//       0.04794892   0.79386187    0.15818922    0.0
//       0.03013205   0.04088579    0.92898214    0.0
//       0.0          0.0           0.0           1.0
//
// STATIC F32 COEFFICIENT BLOCKS (Helium __const; consumed by HgcLogVideo_encode.SetParameter):
//
//   fixed_first_pair @0x3d11c0 (u64 0x3d57943640979436, read as 2 packed f32):
//     coef_seg0_x = 4.736842155456543f    (@0x3d11c0 raw 0x40979436)
//     coef_seg0_y = 0.05263157933950424f  (@0x3d11c4 raw 0x3d579436)
//
//   coef_seg0_zw + coef_seg1_xy for CodeValueNormalization == 0 @0x3d11e0 (4 f32):
//     coef_seg0_z = 0.07694950699806213f  (@0x3d11e0 raw 0x3d9d97b4)
//     coef_seg0_w = 0.41055718064308167f  (@0x3d11e4 raw 0x3ed2348d)
//     coef_seg1_x = 5.959749221801758f    (@0x3d11e8 raw 0x40beb644)
//     coef_seg1_y = 0.09286412596702576f  (@0x3d11ec raw 0x3dbe2f8c)
//
//   coef_seg0_zw + coef_seg1_xy for CodeValueNormalization == 1 @0x3d11d0 (4 f32):
//     coef_seg0_z = 0.08986226469278336f  (@0x3d11d0 raw 0x3db809b5)
//     coef_seg0_w = 0.4063926935195923f   (@0x3d11d4 raw 0x3ed012b4)
//     coef_seg1_x = 6.95984411239624f     (@0x3d11d8 raw 0x40deb70b)
//     coef_seg1_y = 0.03538812696933746f  (@0x3d11dc raw 0x3d10f324)
//
// CONSTANT xmm2 in GetOutput's SEGMENT-1 SetParameter call:
//   coef_seg1_z_const = 0.012500000186264515f  (@Helium 0x3d1064 raw 0x3c4ccccd,
//   read at @0x104c93 via `movss 0x2cc3c9(%rip)`; rip@0x104c9b + 0x2cc3c9 = 0x3d1064).
//   Semantically matches the S-Log3 linear-region slope 0.01125*(1/0.9) family - but
//   we DO NOT re-derive the spec relationship here; we ship the byte-exact float.
//
// GETOUTPUT (@0x104bf0..0x104cb1) - rendering-graph wiring:
//   1) input       = HGRenderer::GetInput(this, 0)                          @0x104c09
//   2) colorMatrix.vtable[0x78](0, input)                                   @0x104c19
//   3) HGColorMatrix::LoadMatrix(colorMatrix, this.matrixPtr, /*bool*/true) @0x104c2f
//   4) logEncode.vtable[0x78](0, colorMatrix)                               @0x104c47
//   5) logEncode.vtable[0x60](0, this.coef_seg0_x, this.coef_seg0_y,
//                                this.coef_seg0_z, this.coef_seg0_w)        @0x104c76
//   6) logEncode.vtable[0x60](1, this.coef_seg1_x, this.coef_seg1_y,
//                                0.012500000f, 0.0f)                        @0x104ca3
//   7) return this.logEncode                                                @0x104ca6
//
// UNDECODED CALLEES (throw-stubs per PORTING_SPEC.md rule 3):
//   HGObject::operator new(unsigned long)       @Helium __ZN8HGObjectnwEm   - @0x104a0e, @0x104a2a
//   HGObject::operator delete(void*)            @Helium __ZN8HGObjectdlEPv  - (D0 tail)
//   HGColorMatrix::HGColorMatrix()              @Helium __ZN13HGColorMatrixC1Ev  - @0x104a19
//   HGColorMatrix::LoadMatrix(vec4 const*,bool) @Helium __ZN13HGColorMatrix10LoadMatrixEPKDv4_fb - @0x104c2f
//   HgcLogVideo_encode::HgcLogVideo_encode()    @Helium __ZN18HgcLogVideo_encodeC1Ev - @0x104a35
//   HgcLogVideo_encode vtable *0x18 (Release)   - from dtors @0x104b12/0x104b24 (colorMatrix + logEncode)
//   HgcLogVideo_encode vtable *0x60 (SetParameter-like) - twice in GetOutput
//   HgcLogVideo_encode vtable *0x78 (SetInput-like)     - from GetOutput
//   HGColorMatrix       vtable *0x78 (SetInput-like)    - from GetOutput
//   HGRenderer::GetInput(HGNode*, int)          @Helium __ZN10HGRenderer8GetInputEP6HGNodei - @0x104c09
//   (HGNode ctor/dtor ARE ported and imported from ./HGNode.js.)

import { HGNode } from './HGNode.js';

// ---------------------------------------------------------------------------
// Enum shapes for the three ctor args. Values are the raw integers the C++
// enums encode; we don't have their names in the binary (only enum types are
// visible via demangling) so we treat them as `number` and document the
// observed values (0 vs 1) that the ctor's dispatch tests for. Any additional
// enumerator values would fall through the `testl` / `cmpl` branches and pick
// the default arm - which is the correct C++ semantics for `!= 1`.
// ---------------------------------------------------------------------------

/**
 * HGSonySLog3::SceneColorimetry - first ctor arg (esi -> r12d). Observed
 * indexes into the 2-entry-per-table matrix arrays as `r12d << 6`.
 * Values 0 and 1 select the two rows of each table (see sourceToSGamut3
 * dump in the module header). Full enum name-set not decoded - the class
 * body only reads the integer.
 */
export type SceneColorimetry = 0 | 1 | number;

/**
 * HGSonySLog3::LogColorimetry - second ctor arg (edx -> r15d). Tested for
 * non-zero @0x104a48; controls which of the two 128-byte tables (SGamut3
 * vs SGamut3Cine) supplies the source-to-log gamut matrix.
 */
export type LogColorimetry = 0 | 1 | number;

/**
 * HGSonySLog3::CodeValueNormalization - third ctor arg (ecx -> r14d).
 * Compared to 1 @0x104a77 to pick between the two 4-float coefficient
 * blocks (@0x3d11d0 vs @0x3d11e0) written into fields 0x1b8..0x1c7.
 */
export type CodeValueNormalization = 0 | 1 | number;

// ---------------------------------------------------------------------------
// Static tables - Helium `__const` payload, transcribed verbatim from the
// binary at the given VAs.  Each row is a 4x4 affine float matrix row-major
// (16 floats = 64 bytes = 0x40). The ctor indexes as `table[sc]`.
// ---------------------------------------------------------------------------

/**
 * `HGSonySLog3::Encode::sourceToSGamut3` - Helium `__const` @0x3d1d10, 0x80 bytes
 * (2 x 4x4 float matrices). Selected when LogColorimetry == 0.
 * Mangled: __ZN11HGSonySLog36Encode15sourceToSGamut3E.
 */
export const HGSonySLog3_Encode_sourceToSGamut3: ReadonlyArray<ReadonlyArray<number>> = [
  // @Helium 0x3d1d10 - SceneColorimetry == 0
  [
    Math.fround(0.5660490989685059), Math.fround(0.34276309609413147), Math.fround(0.09118783473968506), Math.fround(0.0),
    Math.fround(0.07696137577295303), Math.fround(0.7990545034408569),  Math.fround(0.12398412078619003), Math.fround(0.0),
    Math.fround(0.022350912913680077), Math.fround(0.1086120530962944), Math.fround(0.8690370321273804),  Math.fround(0.0),
    Math.fround(0.0),                Math.fround(0.0),                 Math.fround(0.0),                 Math.fround(1.0),
  ],
  // @Helium 0x3d1d50 - SceneColorimetry == 1
  [
    Math.fround(0.8955729603767395), Math.fround(0.0465109683573246),  Math.fround(0.057916060090065),   Math.fround(0.0),
    Math.fround(0.026020653545856476), Math.fround(0.8475528955459595), Math.fround(0.12642644345760345), Math.fround(0.0),
    Math.fround(0.007812122348695993), Math.fround(0.02250547893345356), Math.fround(0.9696823954582214), Math.fround(0.0),
    Math.fround(0.0),                Math.fround(0.0),                 Math.fround(0.0),                 Math.fround(1.0),
  ],
];

/**
 * `HGSonySLog3::Encode::sourceToSGamut3Cine` - Helium `__const` @0x3d1d90, 0x80 bytes.
 * Selected when LogColorimetry != 0.
 * Mangled: __ZN11HGSonySLog36Encode19sourceToSGamut3CineE.
 */
export const HGSonySLog3_Encode_sourceToSGamut3Cine: ReadonlyArray<ReadonlyArray<number>> = [
  // @Helium 0x3d1d90 - SceneColorimetry == 0
  [
    Math.fround(0.6456794738769531), Math.fround(0.259114533662796),   Math.fround(0.09520597755908966), Math.fround(0.0),
    Math.fround(0.0875299945473671), Math.fround(0.7596995830535889),  Math.fround(0.15277044475078583), Math.fround(0.0),
    Math.fround(0.03695742040872574), Math.fround(0.1292809098958969), Math.fround(0.8337616920471191),  Math.fround(0.0),
    Math.fround(0.0),                Math.fround(0.0),                 Math.fround(0.0),                 Math.fround(1.0),
  ],
  // @Helium 0x3d1dd0 - SceneColorimetry == 1
  [
    Math.fround(1.0381441116333008), Math.fround(-0.0954526886343956), Math.fround(0.057308629155159),   Math.fround(0.0),
    Math.fround(0.0479489229619503), Math.fround(0.7938618659973145),  Math.fround(0.15818922221660614), Math.fround(0.0),
    Math.fround(0.030132053419947624), Math.fround(0.040885791182518005), Math.fround(0.928982138633728), Math.fround(0.0),
    Math.fround(0.0),                Math.fround(0.0),                 Math.fround(0.0),                 Math.fround(1.0),
  ],
];

// ---------------------------------------------------------------------------
// Static-log coefficient constants @0x3d11c0..0x3d11ef (Helium __const).
// The ctor packs 6 f32 into fields 0x1b0..0x1c7:
//   fields 0x1b0..0x1b7 come UNCONDITIONALLY from 0x3d11c0 (as a movsd = 2xf32).
//   fields 0x1b8..0x1c7 come from EITHER 0x3d11d0 (CVN==1) OR 0x3d11e0 (CVN!=1)
//     as a movaps = 4xf32.
// ---------------------------------------------------------------------------

/** @Helium 0x3d11c0 raw 0x40979436 (float32). */
const HGSonySLog3_Encode_coef_fixed_seg0_x_f32: number = Math.fround(4.736842155456543);
/** @Helium 0x3d11c4 raw 0x3d579436 (float32). */
const HGSonySLog3_Encode_coef_fixed_seg0_y_f32: number = Math.fround(0.05263157933950424);

/** @Helium 0x3d11d0..0x3d11df - 4 f32; used when CodeValueNormalization == 1. */
const HGSonySLog3_Encode_coef_cvn1: readonly [number, number, number, number] = [
  Math.fround(0.08986226469278336), // @0x3d11d0 raw 0x3db809b5 - coef_seg0_z (@0x1b8)
  Math.fround(0.4063926935195923),  // @0x3d11d4 raw 0x3ed012b4 - coef_seg0_w (@0x1bc)
  Math.fround(6.95984411239624),    // @0x3d11d8 raw 0x40deb70b - coef_seg1_x (@0x1c0)
  Math.fround(0.03538812696933746), // @0x3d11dc raw 0x3d10f324 - coef_seg1_y (@0x1c4)
];

/** @Helium 0x3d11e0..0x3d11ef - 4 f32; used when CodeValueNormalization != 1 (i.e. == 0). */
const HGSonySLog3_Encode_coef_cvn_other: readonly [number, number, number, number] = [
  Math.fround(0.07694950699806213), // @0x3d11e0 raw 0x3d9d97b4 - coef_seg0_z (@0x1b8)
  Math.fround(0.41055718064308167), // @0x3d11e4 raw 0x3ed2348d - coef_seg0_w (@0x1bc)
  Math.fround(5.959749221801758),   // @0x3d11e8 raw 0x40beb644 - coef_seg1_x (@0x1c0)
  Math.fround(0.09286412596702576), // @0x3d11ec raw 0x3dbe2f8c - coef_seg1_y (@0x1c4)
];

/**
 * Third xmm2 arg to the GetOutput segment-1 SetParameter call.
 * @Helium 0x3d1064 raw 0x3c4ccccd (float32) -> 0.012500000186264515f.
 * Read @0x104c93 via `movss 0x2cc3c9(%rip), %xmm2` (rip@0x104c9b + 0x2cc3c9 = 0x3d1064).
 */
const HGSonySLog3_Encode_getOutput_seg1_xmm2_f32: number = Math.fround(0.012500000186264515);

// ---------------------------------------------------------------------------
// Stubs for undecoded callees. Each raises loudly with its call-site @0xADDR
// so frontier.py can see the gap (rule 3: loud gap, never a silent guess).
// ---------------------------------------------------------------------------

/**
 * Placeholder for HGRenderer used by GetOutput's signature. Not yet
 * transcribed - see raw-port/army/ledger for the HGRenderer class.
 * `GetInput` is invoked @Helium 0x104c09 with (this, 0).
 */
export interface HGRendererStub {
  /** @Helium 0x104c09 - vcalled. Signature `GetInput(HGNode*, int) -> HGNode*`. */
  GetInput(node: HGNode, idx: number): HGNode;
}

/**
 * Placeholder for the HGColorMatrix owned at `this.field_198`. Not yet
 * transcribed - see raw-port/army/ledger (HGColorMatrix::LoadMatrix @0x1b7c30
 * per ledger nearby-status; GetOutput @0x1b7c40; ctor not in ledger).
 * Two vtable slots vcalled from this class:
 *   *0x78 (SetInput-like) - @0x104c19 in GetOutput
 *   *0x18 (Release)       - @0x104b12/0x104b62/0x104bb2 in dtors
 * Plus one direct call: `HGColorMatrix::LoadMatrix(vec4 const*, bool)` @0x104c2f.
 */
export interface HGColorMatrix {
  /** vtable *0x18 @Helium - invoked from ~HGSonySLog3::Encode (D2 @0x104b12, D1 @0x104b62, D0 @0x104bb2). */
  Release(): void;
  /** vtable *0x78 @Helium - invoked from GetOutput @0x104c19 with (esi=0, rdx=input). */
  SetInput(idx: number, input: HGNode): void;
  /**
   * `HGColorMatrix::LoadMatrix(float vector[4] const*, bool)` - Helium
   * __ZN13HGColorMatrix10LoadMatrixEPKDv4_fb, invoked @0x104c2f with
   * (this, this.matrixPtr, true) - the bool edx-arg is $0x1. Not a vtable slot; direct
   * call. The `float vector[4] const*` first arg is a pointer to the
   * 4x4 float matrix (four vec4 rows) stored in this class's __const
   * tables. The `bool` argument is 1 (edx = $0x1). Signature preserved.
   */
  LoadMatrix(matrix: ReadonlyArray<number>, flag: boolean): void;
}

/**
 * Placeholder for HgcLogVideo_encode. Not yet transcribed - see
 * raw-port/army/ledger. Same shape as the one wrapped by HGACEScct::Encode.
 */
export interface HgcLogVideo_encode {
  /** vtable *0x18 @Helium - invoked from ~HGSonySLog3::Encode (D2 @0x104b24, D1 @0x104b74, D0 @0x104bc4). */
  Release(): void;
  /** vtable *0x60 @Helium - invoked twice from GetOutput (@0x104c76, @0x104ca3). Signature (idx, xmm0..xmm3). */
  SetParameter(idx: number, a: number, b: number, c: number, d: number): void;
  /** vtable *0x78 @Helium - invoked once from GetOutput (@0x104c47) with (esi=0, rdx=colorMatrix). */
  SetInput(idx: number, input: HGNode): void;
}

/**
 * `newHGColorMatrix()` - placeholder for the compositor allocation +
 * ctor sequence at @Helium 0x104a09..0x104a19.
 *
 *   0x104a09  movl  $0x1f0, %edi                     ; alloc size = 0x1F0 = 496 bytes
 *   0x104a0e  callq __ZN8HGObjectnwEm                ; HGObject::operator new(unsigned long)
 *   0x104a19  callq __ZN13HGColorMatrixC1Ev          ; placement-ctor
 *
 * Both callees are undecoded -> throw (rule 3).
 */
function newHGColorMatrix(): HGColorMatrix {
  throw new Error(
    "HGSonySLog3::Encode: HGColorMatrix ctor + HGObject::operator new @Helium 0x104a0e/0x104a19 not yet transcribed"
  );
}

/**
 * `newHgcLogVideo_encode()` - placeholder for the compositor allocation +
 * ctor sequence at @Helium 0x104a25..0x104a35.
 *
 *   0x104a25  movl  $0x1a0, %edi                     ; alloc size = 0x1A0 = 416 bytes
 *   0x104a2a  callq __ZN8HGObjectnwEm                ; HGObject::operator new
 *   0x104a35  callq __ZN18HgcLogVideo_encodeC1Ev     ; placement-ctor
 */
function newHgcLogVideo_encode(): HgcLogVideo_encode {
  throw new Error(
    "HGSonySLog3::Encode: HgcLogVideo_encode ctor + HGObject::operator new @Helium 0x104a2a/0x104a35 not yet transcribed"
  );
}

/**
 * `HGSonySLog3::Encode` - Helium HGNode subclass wrapping an owned
 * HGColorMatrix (source colorimetry -> S-Gamut3/S-Gamut3.Cine) chained
 * into an owned HgcLogVideo_encode configured for the S-Log3 forward OETF.
 *
 * @Helium ctors  @0x1049e0 (C2) / @0x104ae0 (C1 - tail-jmp to C2);
 *         dtors  @0x104af0 (D2) / @0x104b40 (D1) / @0x104b90 (D0);
 *         GetOutput @0x104bf0.
 */
export class HGSonySLog3Encode extends HGNode {
  /**
   * Owned `HGColorMatrix`. Field @0x198.
   * Assigned once in the ctor @0x104a1e: `movq %r13, 0x198(%rbx)`.
   */
  colorMatrix: HGColorMatrix | null;

  /**
   * Owned `HgcLogVideo_encode`. Field @0x1a0.
   * Assigned once in the ctor @0x104a3a: `movq %r13, 0x1a0(%rbx)`.
   */
  logEncode: HgcLogVideo_encode | null;

  /**
   * Pointer to the 16-float row-major matrix in the selected table.
   * Field @0x1a8. Written in ctor @0x104a60.
   */
  matrixPtr: ReadonlyArray<number>;

  /** log-segment coefficients @0x1b0/0x1b4/0x1b8/0x1bc. All f32. */
  coef_seg0_x: number;
  coef_seg0_y: number;
  coef_seg0_z: number;
  coef_seg0_w: number;

  /** linear-segment coefficients @0x1c0/0x1c4. Both f32. */
  coef_seg1_x: number;
  coef_seg1_y: number;

  /**
   * `HGSonySLog3::Encode::Encode(SceneColorimetry, LogColorimetry, CodeValueNormalization)`
   * - Helium @0x1049e0 (C2 base-object ctor). C1 @0x104ae0 is a tail-jmp to C2.
   *
   * Verbatim asm (prologue/epilogue elided; C++ unwind path at 0x104aa3..0x104ace
   * only fires if allocation/ctor throws - TS exceptions unwind naturally):
   *   0x1049ee  movl  %ecx, %r14d          ; r14d = CodeValueNormalization
   *   0x1049f1  movl  %edx, %r15d          ; r15d = LogColorimetry
   *   0x1049f4  movl  %esi, %r12d          ; r12d = SceneColorimetry
   *   0x1049f7  movq  %rdi, %rbx           ; rbx  = this
   *   0x1049fa  callq __ZN6HGNodeC2Ev
   *   0x1049ff  leaq  0x91567a(%rip), %rax ; = 0xa1a080 (own installed vtable ptr)
   *   0x104a06  movq  %rax, (%rbx)         ; *this = vtable
   *   0x104a09  movl  $0x1f0, %edi         ; alloc 0x1F0 bytes
   *   0x104a0e  callq __ZN8HGObjectnwEm
   *   0x104a13  movq  %rax, %r13           ; r13 = colorMatrix
   *   0x104a16  movq  %rax, %rdi
   *   0x104a19  callq __ZN13HGColorMatrixC1Ev
   *   0x104a1e  movq  %r13, 0x198(%rbx)    ; this.colorMatrix = r13
   *   0x104a25  movl  $0x1a0, %edi         ; alloc 0x1A0 bytes
   *   0x104a2a  callq __ZN8HGObjectnwEm
   *   0x104a2f  movq  %rax, %r13           ; r13 = logEncode
   *   0x104a32  movq  %rax, %rdi
   *   0x104a35  callq __ZN18HgcLogVideo_encodeC1Ev
   *   0x104a3a  movq  %r13, 0x1a0(%rbx)    ; this.logEncode = r13
   *   0x104a41..0x104a60  matrixPtr select   (see module header)
   *   0x104a67..0x104a8d  coefficient fill   (see module header)
   *   0x104aa2  retq
   */
  constructor(
    sceneColorimetry: SceneColorimetry,
    logColorimetry: LogColorimetry,
    codeValueNormalization: CodeValueNormalization,
  ) {
    // @Helium 0x1049fa: HGNode base ctor
    super();
    // @Helium 0x104a06: install this class's vtable (installed ptr = 0xa1a080).
    this.vtable = 0xa1a080;
    // @Helium 0x104a0e..0x104a19: alloc 0x1f0 bytes + HGColorMatrix ctor.
    // Throws until HGColorMatrix is transcribed (see stub above).
    const newColorMatrix = newHGColorMatrix();
    // @Helium 0x104a1e: store colorMatrix
    this.colorMatrix = newColorMatrix;
    // @Helium 0x104a2a..0x104a35: alloc 0x1a0 bytes + HgcLogVideo_encode ctor.
    const newLogEncode = newHgcLogVideo_encode();
    // @Helium 0x104a3a: store logEncode
    this.logEncode = newLogEncode;
    // @Helium 0x104a41..0x104a60: matrixPtr = &table[sceneColorimetry]
    //   table = (logColorimetry == 0) ? sourceToSGamut3 : sourceToSGamut3Cine
    // The `testl %r15d, %r15d ; cmoveq %rcx, %rdx` pattern is equivalent to
    // `logColorimetry == 0`. Any non-zero (i.e. 1 or higher) selects Cine.
    const table =
      logColorimetry === 0
        ? HGSonySLog3_Encode_sourceToSGamut3
        : HGSonySLog3_Encode_sourceToSGamut3Cine;
    this.matrixPtr = table[sceneColorimetry as number];
    // @Helium 0x104a67..0x104a6f: fields 0x1b0/0x1b4 = fixed pair from 0x3d11c0.
    this.coef_seg0_x = HGSonySLog3_Encode_coef_fixed_seg0_x_f32;
    this.coef_seg0_y = HGSonySLog3_Encode_coef_fixed_seg0_y_f32;
    // @Helium 0x104a77..0x104a8d: fields 0x1b8/0x1bc/0x1c0/0x1c4 selected by
    // `cmpl $0x1, %r14d`. CVN==1 -> block @0x3d11d0; else -> block @0x3d11e0.
    const quad =
      codeValueNormalization === 1
        ? HGSonySLog3_Encode_coef_cvn1
        : HGSonySLog3_Encode_coef_cvn_other;
    this.coef_seg0_z = quad[0];
    this.coef_seg0_w = quad[1];
    this.coef_seg1_x = quad[2];
    this.coef_seg1_y = quad[3];
  }

  /**
   * `HGSonySLog3::Encode::~Encode()` - Helium @0x104af0 (D2) / @0x104b40 (D1)
   * / @0x104b90 (D0). All three share the same body up through the base-dtor
   * call; D0 additionally tail-calls `HGObject::operator delete`. Bodies:
   *
   * D2 @0x104af0..0x104b30:
   *   0x104af9  leaq  0x915580(%rip), %rax   ; = 0xa1a080  (own installed vtable)
   *   0x104b00  movq  %rax, (%rdi)           ; reinstall vtable
   *   0x104b03  movq  0x198(%rdi), %rdi      ; rdi = colorMatrix
   *   0x104b0a  testq %rdi, %rdi
   *   0x104b0d  je    0x104b15
   *   0x104b0f  movq  (%rdi), %rax           ; rax = colorMatrix.vtable
   *   0x104b12  callq *0x18(%rax)            ; colorMatrix.Release()
   *   0x104b15  movq  0x1a0(%rbx), %rdi      ; rdi = logEncode
   *   0x104b1c  testq %rdi, %rdi
   *   0x104b1f  je    0x104b27
   *   0x104b21  movq  (%rdi), %rax           ; rax = logEncode.vtable
   *   0x104b24  callq *0x18(%rax)            ; logEncode.Release()
   *   0x104b27  movq  %rbx, %rdi             ; rdi = this
   *   0x104b30  jmp   __ZN6HGNodeD2Ev        ; tail-call HGNode base dtor
   *
   * D1 @0x104b40 is byte-identical (different leaq displacement to the same
   * 0xa1a080 target). D0 @0x104b90 replaces the tail-jmp to HGNode::~HGNode()
   * with a non-tail call (@0x104bca) followed by `jmp __ZN8HGObjectdlEPv`
   * (@0x104bd8). The operator-delete step is modelled by the JS caller
   * dropping the reference (see HGACEScct_Encode.ts for the identical pattern).
   */
  destruct(): void {
    // @Helium 0x104b00: vtable reinstall.
    this.vtable = 0xa1a080;
    // @Helium 0x104b03..0x104b12: release colorMatrix if present.
    if (this.colorMatrix != null) {
      this.colorMatrix.Release();
      this.colorMatrix = null;
    }
    // @Helium 0x104b15..0x104b24: release logEncode if present.
    if (this.logEncode != null) {
      this.logEncode.Release();
      this.logEncode = null;
    }
    // @Helium 0x104b30: tail-jmp HGNode::~HGNode()
    super.destruct();
  }

  /**
   * `HGSonySLog3::Encode::GetOutput(HGRenderer*)` - Helium @0x104bf0.
   *
   * Wires the two owned compositor children into the render graph:
   *   1) input        = renderer.GetInput(this, 0)
   *   2) colorMatrix.SetInput(0, input)                              [vtable *0x78]
   *   3) HGColorMatrix::LoadMatrix(colorMatrix, this.matrixPtr, true)
   *   4) logEncode.SetInput(0, colorMatrix)                           [vtable *0x78]
   *   5) logEncode.SetParameter(0, coef_seg0_x..w)                    [vtable *0x60]
   *   6) logEncode.SetParameter(1, coef_seg1_x,y, 0.012500000f, 0.0f) [vtable *0x60]
   *   7) return this.logEncode
   *
   * Verbatim asm (@0x104bf0..0x104cb1, prologue/epilogue elided):
   *   0x104bfa  movq  0x198(%rdi), %r14           ; r14 = this.colorMatrix
   *   0x104c01  movq  %rsi, %rdi                  ; rdi = renderer
   *   0x104c04  movq  %rbx, %rsi                  ; rsi = this
   *   0x104c07  xorl  %edx, %edx                  ; edx = 0
   *   0x104c09  callq __ZN10HGRenderer8GetInputEP6HGNodei  ; input = renderer.GetInput(this, 0)
   *   0x104c0e  movq  (%r14), %rcx                ; rcx = colorMatrix.vtable
   *   0x104c11  movq  %r14, %rdi                  ; rdi = colorMatrix
   *   0x104c14  xorl  %esi, %esi                  ; esi = 0
   *   0x104c16  movq  %rax, %rdx                  ; rdx = input
   *   0x104c19  callq *0x78(%rcx)                 ; colorMatrix.SetInput(0, input)
   *   0x104c1c  movq  0x198(%rbx), %rdi           ; rdi = this.colorMatrix
   *   0x104c23  movq  0x1a8(%rbx), %rsi           ; rsi = this.matrixPtr
   *   0x104c2a  movl  $0x1, %edx                  ; edx = 1  (bool arg)
   *   0x104c2f  callq __ZN13HGColorMatrix10LoadMatrixEPKDv4_fb ; LoadMatrix(matrixPtr, true)
   *   0x104c34  movq  0x198(%rbx), %rdx           ; rdx = this.colorMatrix (arg-to-SetInput)
   *   0x104c3b  movq  0x1a0(%rbx), %rdi           ; rdi = this.logEncode
   *   0x104c42  movq  (%rdi), %rax                ; rax = logEncode.vtable
   *   0x104c45  xorl  %esi, %esi                  ; esi = 0
   *   0x104c47  callq *0x78(%rax)                 ; logEncode.SetInput(0, colorMatrix)
   *   0x104c4a  movq  0x1a0(%rbx), %rdi           ; rdi = this.logEncode
   *   0x104c51  movss 0x1b0(%rbx), %xmm0          ; xmm0 = this.coef_seg0_x
   *   0x104c59  movss 0x1b4(%rbx), %xmm1          ; xmm1 = this.coef_seg0_y
   *   0x104c61  movss 0x1b8(%rbx), %xmm2          ; xmm2 = this.coef_seg0_z
   *   0x104c69  movss 0x1bc(%rbx), %xmm3          ; xmm3 = this.coef_seg0_w
   *   0x104c71  movq  (%rdi), %rax                ; rax = logEncode.vtable
   *   0x104c74  xorl  %esi, %esi                  ; esi = 0
   *   0x104c76  callq *0x60(%rax)                 ; logEncode.SetParameter(0, seg0_x, seg0_y, seg0_z, seg0_w)
   *   0x104c79  movq  0x1a0(%rbx), %rdi           ; rdi = this.logEncode
   *   0x104c80  movss 0x1c0(%rbx), %xmm0          ; xmm0 = this.coef_seg1_x
   *   0x104c88  movss 0x1c4(%rbx), %xmm1          ; xmm1 = this.coef_seg1_y
   *   0x104c90  movq  (%rdi), %rax                ; rax = logEncode.vtable
   *   0x104c93  movss 0x2cc3c9(%rip), %xmm2       ; xmm2 = 0.012500000f (@0x3d1064)
   *   0x104c9b  xorps %xmm3, %xmm3                ; xmm3 = 0.0f
   *   0x104c9e  movl  $0x1, %esi                  ; esi = 1
   *   0x104ca3  callq *0x60(%rax)                 ; logEncode.SetParameter(1, seg1_x, seg1_y, 0.0125f, 0.0f)
   *   0x104ca6  movq  0x1a0(%rbx), %rax           ; rax = this.logEncode  (return value)
   *   0x104cb1  retq
   */
  GetOutput(renderer: HGRendererStub): HGNode {
    // @Helium 0x104bfa: r14 = this.colorMatrix. Invariant: non-null after ctor.
    const cm = this.colorMatrix;
    const le = this.logEncode;
    if (cm == null || le == null) {
      throw new Error(
        "HGSonySLog3::Encode::GetOutput @Helium 0x104bfa - colorMatrix or logEncode null (should be unreachable after ctor)"
      );
    }
    // @Helium 0x104c09: input = renderer.GetInput(this, 0)
    const input = renderer.GetInput(this, 0);
    // @Helium 0x104c19: colorMatrix.SetInput(0, input)  [vtable *0x78]
    cm.SetInput(0, input);
    // @Helium 0x104c2f: HGColorMatrix::LoadMatrix(this.matrixPtr, /*bool*/ true)
    cm.LoadMatrix(this.matrixPtr, true);
    // @Helium 0x104c47: logEncode.SetInput(0, colorMatrix)  [vtable *0x78]
    le.SetInput(0, cm as unknown as HGNode);
    // @Helium 0x104c76: logEncode.SetParameter(0, seg0_x, seg0_y, seg0_z, seg0_w)  [vtable *0x60]
    le.SetParameter(
      0,
      this.coef_seg0_x,
      this.coef_seg0_y,
      this.coef_seg0_z,
      this.coef_seg0_w,
    );
    // @Helium 0x104ca3: logEncode.SetParameter(1, seg1_x, seg1_y, 0.0125f, 0.0f)  [vtable *0x60]
    le.SetParameter(
      1,
      this.coef_seg1_x,
      this.coef_seg1_y,
      HGSonySLog3_Encode_getOutput_seg1_xmm2_f32,
      Math.fround(0.0),
    );
    // @Helium 0x104ca6..0x104cb1: return this.logEncode (cast to HGNode via C++ inheritance).
    return le as unknown as HGNode;
  }
}
