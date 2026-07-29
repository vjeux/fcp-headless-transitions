// raw-port: HGColorGamma (chunk m3) — Helium.framework (render layer)
//
// Framework binary: /Applications/Final Cut Pro.app/Contents/Frameworks/Helium.framework/
//   Versions/A/Helium (x86_64 slice — thin at /tmp/Helium.x86_64; VAs are ABSOLUTE within
//   the x86_64 slice, which starts at fat offset 0x4000 in the on-disk fat binary).
// This chunk ports methods [60..80) of the 84-method HGColorGamma class:
//   60 SetInputPixelFormat(HGYCbCrFormat)                                @0x00000000000fb3b0
//   61 SetYCbCrBiasAndScale()                                            @0x00000000000fb3e0
//   62 SetOutputPixelFormat(HGFormat, HGYCbCrFormat)                     @0x00000000000fb690
//   63 SetPremultiplyState(bool, bool)                                   @0x00000000000fb6d0
//   64 Set1DLutScaleAndOffset(float, float)                              @0x00000000000fb6f0
//   65 Set1DLUTnumBins(unsigned int)                                     @0x00000000000fb730
//   66 SetARRILogCExposureIndex(unsigned int)                            @0x00000000000fb760
//   67 LoadMatrix1(float const vector[4]*)                               @0x00000000000fb790
//   68 LoadMatrix2(float const vector[4]*)                               @0x00000000000fb7e0
//   69 SetGammaFunction(hgColorGammaForm, f32x4[7])                      @0x00000000000fb830
//   70 SetGammaFunction(hgColorGammaLogCurve)                            @0x00000000000fbb40
//   71 SetDitherMode(bool)                                               @0x00000000000fbbc0
//   72 SetFixedPointPrecisionMode(bool)                                  @0x00000000000fbbf0
//   73 SetAntiSymmetricToneCurves(bool)                                  @0x00000000000fbc20
//   74 SetScale1(float vector[4])                                        @0x00000000000fbc30
//   75 SetScale2(float vector[4])                                        @0x00000000000fbc60
//   76 SetBias1(float vector[4])                                         @0x00000000000fbc90
//   77 SetBias2(float vector[4])                                         @0x00000000000fbcc0
//   78 SetConversion(matrixCoeffs, logCurve, logGamut, colorPrimaries)   @0x00000000000fbcf0
//   79 SetConversion(colorPrimaries, transferFn, matrixCoeffs, ...)      @0x00000000000fc0a0
//
// DECODE: raw-port/re/disasm/Helium.HGColorGamma.<method>.s (one .s per method).
//
// PATTERN. Every "small setter" in this chunk (methods 60,63,64,65,66,67,68,71,72,73,
// 74,75,76,77) follows the exact same skeleton (identical to m2's SetFallbackMode/
// SetToneQualityMode template):
//     HGNode::ClearBits(self);          // @call — invalidates the cached graph
//     self.dirtyFlag = 1;               // movb $1, 0x2e9(rdi)
//     <write-arg-to-field>;             // one or two mov*'s at the object offset
//     [optional] tail-call SetYCbCrBiasAndScale();  // methods 60 + 62 only
// The specific offset for each setter is cited per-method below. Method 73
// (SetAntiSymmetricToneCurves) is the ONE exception: it does NOT call ClearBits and does
// NOT touch dirtyFlag — it just writes 0x497(%rdi) and returns (@0xfbc20..@0xfbc2c).
//
// LAYOUT ADDITIONS RECOVERED IN THIS CHUNK (all offsets cited per-store).
//   +0x2e9  uint8  dirtyFlag                (already declared in m2; every setter re-writes it)
//   +0x300  f32x4  transformBlock[0]        SetGammaFunction stores xmm7 here on success path
//   +0x310  f32x4  transformBlock[1]        SetGammaFunction xmm6
//   +0x320  f32x4  transformBlock[2]        SetGammaFunction xmm5
//   +0x330  f32x4  transformBlock[3]        SetGammaFunction xmm4
//   +0x340  f32x4  transformBlock[4]        SetGammaFunction xmm3
//   +0x350  f32x4  transformBlock[5]        SetGammaFunction xmm2
//   +0x360  f32x4  transformBlock[6]        SetGammaFunction xmm1
//   +0x370  uint8  transformBlock_isFixed   set 1 if all 7 f32x4 lanes are integer (SetGammaFunction tail)
//   +0x380  f32x4  matrix1[col0..3]         (already declared m2 via LoadMacroNodeParams; matrix1 ends +0x3bf)
//   +0x3c0  f32x4  matrix2[col0..3]         (already declared m2; matrix2 ends +0x3ff)
//   +0x401  uint8  ditherMode               SetDitherMode
//   +0x402  uint8  fixedPointPrecisionMode  SetFixedPointPrecisionMode
//   +0x404  uint32 gammaForm                SetGammaFunction: form-enum (or 0x5 for the LogCurve overload)
//   +0x408  uint32 gammaLogCurve            SetGammaFunction(LogCurve): the LogCurve id
//                                           (also cleared to 0 by the 7-param overload)
//                                           SAME OFFSET as m1's `unpremultSanitizedLutIdx`; we
//                                           reuse THAT field here — the C++ class overlays these
//                                           two uses of +0x408 through the same storage word.
//   +0x420  uint32 outputPixelFormat        SetOutputPixelFormat first arg (HGFormat)
//   +0x424  uint32 inputYCbCrFormat         SetInputPixelFormat (HGYCbCrFormat)
//   +0x428  uint32 outputYCbCrFormat        SetOutputPixelFormat second arg (HGYCbCrFormat)
//   +0x430  f32x4  matrix1ColumnScales      (already declared m2 — SetScale1 writes here)
//   +0x440  f32x4  matrix2Shuffle           (already declared m2 — SetScale2 writes here)
//   +0x450  f32x4  biasVec1                 SetBias1  (SetYCbCrBiasAndScale also writes here).
//                                           NOTE: distinct from m1's `bias1` (a HGCColorGamma_bias
//                                           SUB-NODE pointer at +0x210); this is the f32x4 value at
//                                           +0x450. Named biasVec1 to avoid the name clash.
//   +0x460  f32x4  biasVec2                 SetBias2  (SetYCbCrBiasAndScale also writes here).
//                                           Same rename rationale — m1's bias2 is a sub-node ptr at
//                                           +0x220.
//   +0x480  uint32 lut1DnumBins             Set1DLUTnumBins
//   +0x484  f32    lut1DScale               Set1DLutScaleAndOffset arg0 (xmm0)
//   +0x488  f32    lut1DOffset              Set1DLutScaleAndOffset arg1 (xmm1)
//   +0x48c  uint32 arriLogCExposureIndex    SetARRILogCExposureIndex
//   +0x494  uint8  premultiplyInput         SetPremultiplyState arg0 (sil)
//   +0x495  uint8  premultiplyOutput        SetPremultiplyState arg1 (dl)
//   +0x497  uint8  antiSymmetricToneCurves  SetAntiSymmetricToneCurves (no ClearBits, no dirty)
//
// ── Frontier callees (loud throw citing @0xADDR — Spec Rule 3) ─────────────────────
//   HGNode::ClearBits()                              @0x000000000011c890 (RIP-target of `callq`)
//                                                      call sites: fb3bc, fb492, fb4ac, fb56e,
//                                                      fb583, fb6a2, fb703, fb73c, fb76c, fb79d,
//                                                      fb7ed, fb85d, fbb4c, fbbcc, fbbfc, fbc40,
//                                                      fbc70, fbca0, fbcd0, fbd10, fc0c4, fc10a,
//                                                      fc16e, fc1e7, ...
//   HGColorGamma::YCbCrToRGB (data table)            @VA 0x3cfb30 (SetConversion RIP-relative loads)
//   HGColorGamma::SetYCbCrBiasAndScale()             @0x00000000000fb3e0 (tail-called from
//                                                      SetInputPixelFormat @0xfb3d7 and
//                                                      SetOutputPixelFormat @0xfb6ca)
//
// NAN/ORDER-COMPARISON: NONE of the tiny setters in this chunk perform any comparisons.
// SetGammaFunction and SetConversion use SSE cmpneqps / ucomiss which ARE NaN-ordered; those
// bodies are throw-stubbed (see per-method notes). No `!==` is emitted here that could differ
// from an FCP SSE ordered compare.

import type { HGColorGammaM2 } from "./HGColorGamma.m2";

// Enum-value types (opaque uint32s at the boundary — the ordinal values are cited by the
// per-method call sites where they matter, but the ports here only STORE them verbatim).
export type HGYCbCrFormat            = number; // uint32
export type HGFormatUInt             = number; // uint32 (SetOutputPixelFormat lowered form)
export type HgColorGammaForm         = number; // uint32 (SetGammaFunction first overload)
export type HgColorGammaLogCurve     = number; // uint32 (SetGammaFunction second overload)
export type HgColorGammaLogGamut     = number; // uint32
export type HgColorGammaMatrixCoefficients = number; // uint32
export type HgColorGammaColorPrimaries     = number; // uint32
export type HgColorGammaTransferFunction   = number; // uint32

/**
 * Chunk-m3 view of the HGColorGamma object. Extends m2 with every field this chunk writes.
 * All flags default 0; every f32x4 defaults to [0,0,0,0]. Every field is cited above by
 * the store instruction that first named it.
 */
export interface HGColorGammaM3 extends HGColorGammaM2 {
  gammaForm:                     HgColorGammaForm;                       // +0x404 (uint32)
  // gammaLogCurve at +0x408 REUSES m1's `unpremultSanitizedLutIdx` field (same storage).
  outputPixelFormat:             HGFormatUInt;                           // +0x420
  inputYCbCrFormat:              HGYCbCrFormat;                          // +0x424
  outputYCbCrFormat:             HGYCbCrFormat;                          // +0x428
  biasVec1:                      readonly [number, number, number, number]; // +0x450 f32x4 (see rename note)
  biasVec2:                      readonly [number, number, number, number]; // +0x460 f32x4 (see rename note)
  lut1DnumBins:                  number;                                 // +0x480 uint32
  lut1DScale:                    number;                                 // +0x484 f32
  lut1DOffset:                   number;                                 // +0x488 f32
  arriLogCExposureIndex:         number;                                 // +0x48c uint32
  premultiplyInput:              number;                                 // +0x494 uint8
  premultiplyOutput:             number;                                 // +0x495 uint8
  antiSymmetricToneCurves:       number;                                 // +0x497 uint8
  ditherMode:                    number;                                 // +0x401 uint8
  fixedPointPrecisionMode:       number;                                 // +0x402 uint8
  // transformBlock[0..6] and _isFixed live in m2's HGColorGammaM2 via transformBlock_300..3f0,
  // but SetGammaFunction stores 7 f32x4 vectors starting at +0x300. m2 named +0x300, +0x380..+0x3f0.
  // The middle six columns (+0x310..+0x360) belong to the same gamma parameter block; declare
  // them here as extras so the port can name each of the 7 stores.
  transformBlock_310:            readonly [number, number, number, number]; // +0x310 f32x4
  transformBlock_320:            readonly [number, number, number, number]; // +0x320 f32x4
  transformBlock_330:            readonly [number, number, number, number]; // +0x330 f32x4
  transformBlock_340:            readonly [number, number, number, number]; // +0x340 f32x4
  transformBlock_350:            readonly [number, number, number, number]; // +0x350 f32x4
  transformBlock_360:            readonly [number, number, number, number]; // +0x360 f32x4
  transformBlock_isFixed:        number;                                 // +0x370 uint8
}

// ── Frontier stubs (throw-with-addr per Spec Rule 3) ─────────────────────────────────
/**
 * HGNode::ClearBits() — called by nearly every setter in this chunk (see call-site list
 * in the header). This is defined in HGNode's own class; we mirror the m2 stub so this
 * chunk compiles standalone. Real port lives in the HGNode file.
 */
function HGNode_ClearBits(_p: HGColorGammaM3): void {
  throw new Error(
    "raw-port: HGNode::ClearBits() not yet transcribed " +
    "(target @0x000000000011c890 — Helium; call sites in this chunk: " +
    "fb3bc, fb492, fb4ac, fb56e, fb583, fb6a2, fb703, fb73c, fb76c, fb79d, fb7ed, fb85d, " +
    "fbb4c, fbbcc, fbbfc, fbc40, fbc70, fbca0, fbcd0, fbd10, fc0c4, fc10a, fc16e, fc1e7)",
  );
}

// ── Method 60: SetInputPixelFormat(HGYCbCrFormat) @0xfb3b0..@0xfb3d7 ─────────────────
/**
 * HGColorGamma::SetInputPixelFormat(HGYCbCrFormat).
 * @0x00000000000fb3b0..0x00000000000fb3d7 — 15 instrs.
 *
 * Disasm (Helium.HGColorGamma.SetInputPixelFormat.s):
 *   fb3bc callq HGNode::ClearBits()
 *   fb3c1 movb  $0x1, 0x2e9(%r14)              // dirtyFlag = 1
 *   fb3c9 movl  %ebx, 0x424(%r14)              // inputYCbCrFormat = arg
 *   fb3d7 jmp   HGColorGamma::SetYCbCrBiasAndScale()   // tail call
 * The tail-call is a jmp, not a call — this method effectively CONCATENATES the
 * SetYCbCrBiasAndScale body onto its own return. We model that by calling the (throw-
 * stubbed) sibling explicitly so no scale/bias recomputation is lost.
 */
export function hgColorGamma_SetInputPixelFormat(
  self: HGColorGammaM3,
  fmt: HGYCbCrFormat,
): void {
  // @0xfb3bc
  HGNode_ClearBits(self);
  // @0xfb3c1
  self.dirtyFlag = 1;
  // @0xfb3c9
  self.inputYCbCrFormat = fmt >>> 0;
  // @0xfb3d7  jmp SetYCbCrBiasAndScale (tail call — no return distinction in the caller ABI)
  hgColorGamma_SetYCbCrBiasAndScale(self);
}

// ── Method 61: SetYCbCrBiasAndScale() @0xfb3e0..@0xfb5a0 ─────────────────────────────
/**
 * HGColorGamma::SetYCbCrBiasAndScale().
 * @0x00000000000fb3e0..0x00000000000fb5a0 — 448 bytes (258 disasm lines).
 *
 * Structure (from Helium.HGColorGamma.SetYCbCrBiasAndScale.s):
 *   Block A (@0xfb3ec..@0xfb4c2) — jump table over self.inputYCbCrFormat (+0x424, cap 0x1c=28):
 *     movslq loads a signed 32-bit relative offset from the switch table at RIP+0x19a
 *     (jump table base @0xfb5a4..) and jmps to one of ~8 arm labels, each of which loads
 *     TWO f32x4 rodata constants (bias into -0x30(%rbp) staging + scale into -0x20(%rbp)),
 *     then falls through to a shared write-back that calls HGNode::ClearBits + writes
 *     bias1 (+0x450) and matrix1ColumnScales (+0x430).
 *   Block B (@0xfb4c3..@0xfb5a0) — identical structure over self.outputYCbCrFormat
 *     (+0x428, cap 0x1c=28), writing bias2 (+0x460) and matrix2Shuffle (+0x440).
 *
 * The rodata constants at 0x3cfb30-family / 0x3d3ee0-family are the standard Rec.601 /
 * Rec.709 / Rec.2020 / xvYCC per-format bias+scale pairs. There are ~7 unique (bias,scale)
 * pairs across 29 format values, so the switch coalesces via shared arm targets — this
 * requires resolving the jump-table AND every rodata constant address to produce a
 * faithful port. That is a full RE task; deferred with a throw-stub citing the entry.
 */
export function hgColorGamma_SetYCbCrBiasAndScale(_self: HGColorGammaM3): void {
  throw new Error(
    "raw-port: HGColorGamma::SetYCbCrBiasAndScale() not yet transcribed " +
    "(@0x00000000000fb3e0..0x00000000000fb5a0 — 258-line SSE jump-table over " +
    "inputYCbCrFormat/outputYCbCrFormat; needs jump-table @VA 0xfb5a4 + " +
    "~14 rodata (bias,scale) f32x4 pairs resolved from Helium __TEXT,__const — Helium)",
  );
}

// ── Method 62: SetOutputPixelFormat(HGFormat, HGYCbCrFormat) @0xfb690..@0xfb6cf ──────
/**
 * HGColorGamma::SetOutputPixelFormat(HGFormat, HGYCbCrFormat).
 * @0x00000000000fb690..0x00000000000fb6cf — 27 instrs.
 *
 * Disasm (Helium.HGColorGamma.SetOutputPixelFormat.s):
 *   fb6a2 callq HGNode::ClearBits()
 *   fb6a7 movb  $0x1, 0x2e9(%r15)          // dirtyFlag = 1
 *   fb6af movl  %r14d, 0x420(%r15)         // outputPixelFormat = arg0 (HGFormat)
 *   fb6b6 movl  %ebx, 0x428(%r15)          // outputYCbCrFormat = arg1
 *   fb6ca jmp   HGColorGamma::SetYCbCrBiasAndScale()   // tail call
 * Note: `HGFormat` is ABI-lowered to a 32-bit int (movl %esi -> %r14d then stored 32-bit).
 */
export function hgColorGamma_SetOutputPixelFormat(
  self: HGColorGammaM3,
  fmt: HGFormatUInt,
  ycbcrFmt: HGYCbCrFormat,
): void {
  // @0xfb6a2
  HGNode_ClearBits(self);
  // @0xfb6a7
  self.dirtyFlag = 1;
  // @0xfb6af
  self.outputPixelFormat = fmt >>> 0;
  // @0xfb6b6
  self.outputYCbCrFormat = ycbcrFmt >>> 0;
  // @0xfb6ca  jmp SetYCbCrBiasAndScale (tail call)
  hgColorGamma_SetYCbCrBiasAndScale(self);
}

// ── Method 63: SetPremultiplyState(bool, bool) @0xfb6d0..@0xfb6e9 ────────────────────
/**
 * HGColorGamma::SetPremultiplyState(bool, bool).
 * @0x00000000000fb6d0..0x00000000000fb6e9 — 8 instrs; NO ClearBits, only sets dirty.
 *
 * Disasm:
 *   fb6d4 movb  $0x1, 0x2e9(%rdi)     // dirtyFlag = 1
 *   fb6db movb  %sil, 0x494(%rdi)     // premultiplyInput  = arg0
 *   fb6e2 movb  %dl,  0x495(%rdi)     // premultiplyOutput = arg1
 * NOTE: This one does NOT call ClearBits (unlike the other setters); it only bumps dirty.
 */
export function hgColorGamma_SetPremultiplyState(
  self: HGColorGammaM3,
  premulIn: boolean,
  premulOut: boolean,
): void {
  // @0xfb6d4
  self.dirtyFlag = 1;
  // @0xfb6db
  self.premultiplyInput = premulIn ? 1 : 0;
  // @0xfb6e2
  self.premultiplyOutput = premulOut ? 1 : 0;
}

// ── Method 64: Set1DLutScaleAndOffset(f32, f32) @0xfb6f0..@0xfb72f ───────────────────
/**
 * HGColorGamma::Set1DLutScaleAndOffset(float, float).
 * @0x00000000000fb6f0..0x00000000000fb72f — 18 instrs.
 *
 * Disasm:
 *   fb6f6 movss %xmm1, -0x10(%rbp)         // spill offset
 *   fb6fb movss %xmm0, -0xc(%rbp)          // spill scale
 *   fb703 callq HGNode::ClearBits()
 *   fb708 movb  $0x1, 0x2e9(%rbx)
 *   fb70f movss -0xc(%rbp), %xmm0          // reload scale
 *   fb714 movss %xmm0, 0x484(%rbx)         // lut1DScale  = arg0
 *   fb71c movss -0x10(%rbp), %xmm0         // reload offset
 *   fb721 movss %xmm0, 0x488(%rbx)         // lut1DOffset = arg1
 * SPILL/RELOAD is a straight-through pass — semantically self.lut1DScale = scale,
 * self.lut1DOffset = offset. Wrap in Math.fround because movss is 32-bit float.
 */
export function hgColorGamma_Set1DLutScaleAndOffset(
  self: HGColorGammaM3,
  scale: number,
  offset: number,
): void {
  // @0xfb703
  HGNode_ClearBits(self);
  // @0xfb708
  self.dirtyFlag = 1;
  // @0xfb714  (single-precision store)
  self.lut1DScale = Math.fround(scale);
  // @0xfb721  (single-precision store)
  self.lut1DOffset = Math.fround(offset);
}

// ── Method 65: Set1DLUTnumBins(uint32) @0xfb730..@0xfb754 ────────────────────────────
/**
 * HGColorGamma::Set1DLUTnumBins(unsigned int).
 * @0x00000000000fb730..0x00000000000fb754 — 12 instrs.
 *
 * Disasm:
 *   fb73c callq HGNode::ClearBits()
 *   fb741 movb  $0x1, 0x2e9(%r14)
 *   fb749 movl  %ebx, 0x480(%r14)   // lut1DnumBins = arg
 */
export function hgColorGamma_Set1DLUTnumBins(
  self: HGColorGammaM3,
  numBins: number,
): void {
  HGNode_ClearBits(self);                     // @0xfb73c
  self.dirtyFlag = 1;                          // @0xfb741
  self.lut1DnumBins = numBins >>> 0;           // @0xfb749
}

// ── Method 66: SetARRILogCExposureIndex(uint32) @0xfb760..@0xfb784 ───────────────────
/**
 * HGColorGamma::SetARRILogCExposureIndex(unsigned int).
 * @0x00000000000fb760..0x00000000000fb784 — 12 instrs.
 *
 * Disasm:
 *   fb76c callq HGNode::ClearBits()
 *   fb771 movb  $0x1, 0x2e9(%r14)
 *   fb779 movl  %ebx, 0x48c(%r14)   // arriLogCExposureIndex = arg
 */
export function hgColorGamma_SetARRILogCExposureIndex(
  self: HGColorGammaM3,
  ei: number,
): void {
  HGNode_ClearBits(self);                     // @0xfb76c
  self.dirtyFlag = 1;                          // @0xfb771
  self.arriLogCExposureIndex = ei >>> 0;       // @0xfb779
}

// ── Method 67: LoadMatrix1(float const vector[4]*) @0xfb790..@0xfb7dd ────────────────
/**
 * HGColorGamma::LoadMatrix1(float vector[4] const*).
 * @0x00000000000fb790..0x00000000000fb7dd — 15 instrs.
 *
 * Disasm:
 *   fb79d callq HGNode::ClearBits()
 *   fb7a2 movb  $0x1, 0x2e9(%r14)
 *   fb7aa movaps  (%rbx), %xmm0     ;  fb7ad  movaps %xmm0, 0x380(%r14)   // col0
 *   fb7b5 movaps  0x10(%rbx), %xmm0 ;  fb7b9  movaps %xmm0, 0x390(%r14)   // col1
 *   fb7c1 movaps  0x20(%rbx), %xmm0 ;  fb7c5  movaps %xmm0, 0x3a0(%r14)   // col2
 *   fb7cd movaps  0x30(%rbx), %xmm0 ;  fb7d1  movaps %xmm0, 0x3b0(%r14)   // col3
 * Copies 4 aligned f32x4 columns from *cols into transformBlock_380..3b0 (matrix1).
 */
export function hgColorGamma_LoadMatrix1(
  self: HGColorGammaM3,
  cols: readonly (readonly [number, number, number, number])[],
): void {
  HGNode_ClearBits(self);      // @0xfb79d
  self.dirtyFlag = 1;           // @0xfb7a2
  // @0xfb7aa..fb7d1 — four movaps 16-byte copies. Each lane is single-precision (movaps of
  // float[4] loaded from `Dv4_f` / __m128); wrap each lane in Math.fround.
  const c0 = cols[0], c1 = cols[1], c2 = cols[2], c3 = cols[3];
  self.transformBlock_380 = [Math.fround(c0[0]), Math.fround(c0[1]), Math.fround(c0[2]), Math.fround(c0[3])];
  self.transformBlock_390 = [Math.fround(c1[0]), Math.fround(c1[1]), Math.fround(c1[2]), Math.fround(c1[3])];
  self.transformBlock_3a0 = [Math.fround(c2[0]), Math.fround(c2[1]), Math.fround(c2[2]), Math.fround(c2[3])];
  self.transformBlock_3b0 = [Math.fround(c3[0]), Math.fround(c3[1]), Math.fround(c3[2]), Math.fround(c3[3])];
}

// ── Method 68: LoadMatrix2(float const vector[4]*) @0xfb7e0..@0xfb82d ────────────────
/**
 * HGColorGamma::LoadMatrix2(float vector[4] const*).
 * @0x00000000000fb7e0..0x00000000000fb82d — 15 instrs (bitwise identical body to
 * LoadMatrix1 but writes matrix2 at +0x3c0..+0x3f0).
 *
 * Disasm:
 *   fb7ed callq HGNode::ClearBits()
 *   fb7f2 movb  $0x1, 0x2e9(%r14)
 *   fb7fa movaps  (%rbx), %xmm0     ;  fb7fd  movaps %xmm0, 0x3c0(%r14)   // col0
 *   fb805 movaps  0x10(%rbx), %xmm0 ;  fb809  movaps %xmm0, 0x3d0(%r14)   // col1
 *   fb811 movaps  0x20(%rbx), %xmm0 ;  fb815  movaps %xmm0, 0x3e0(%r14)   // col2
 *   fb81d movaps  0x30(%rbx), %xmm0 ;  fb821  movaps %xmm0, 0x3f0(%r14)   // col3
 */
export function hgColorGamma_LoadMatrix2(
  self: HGColorGammaM3,
  cols: readonly (readonly [number, number, number, number])[],
): void {
  HGNode_ClearBits(self);      // @0xfb7ed
  self.dirtyFlag = 1;           // @0xfb7f2
  const c0 = cols[0], c1 = cols[1], c2 = cols[2], c3 = cols[3];
  self.transformBlock_3c0 = [Math.fround(c0[0]), Math.fround(c0[1]), Math.fround(c0[2]), Math.fround(c0[3])];
  self.transformBlock_3d0 = [Math.fround(c1[0]), Math.fround(c1[1]), Math.fround(c1[2]), Math.fround(c1[3])];
  self.transformBlock_3e0 = [Math.fround(c2[0]), Math.fround(c2[1]), Math.fround(c2[2]), Math.fround(c2[3])];
  self.transformBlock_3f0 = [Math.fround(c3[0]), Math.fround(c3[1]), Math.fround(c3[2]), Math.fround(c3[3])];
}

// ── Method 69: SetGammaFunction(form, 7*f32x4) @0xfb830..@0xfbb26 ────────────────────
/**
 * HGColorGamma::SetGammaFunction(hgColorGammaForm, f32x4, f32x4, f32x4, f32x4, f32x4, f32x4, f32x4).
 * @0x00000000000fb830..0x00000000000fbb26 — 248-line SSE body.
 *
 * Structure (from Helium.HGColorGamma.SetGammaFunction.s):
 *   Prologue @0xfb83b..@0xfb85d: spill xmm0..xmm6 to stack, movl form (%esi) into %r14d,
 *   call HGNode::ClearBits, movb $1 to +0x2e9, reload xmm4..xmm7 for the switch.
 *   @0xfb879..@0xfb894 — jump table over (form-1) with 5 arms (cap 4). Each arm performs
 *   a per-form validity test using SSE cmpneqps against a rodata constant loaded via a
 *   RIP-relative address (@0xfb896: 0x2cf123(%rip); @0xfb8d1: 0x2cf0e8(%rip); @0xfb927:
 *   0x2cf092(%rip); @0xfb9bd: 0x2ceffc(%rip)) and a movmskps → testl to detect NaN or a
 *   "constraint violated" bit — on failure it jumps to the fallback at @0xfba03.
 *   Success path @0xfb96a: writes form to +0x404, zeroes +0x408, stores xmm7..xmm1 to the
 *   7-slot transformBlock at +0x300..+0x360, jumps to the fixed-lane detector at @0xfba58.
 *   Fallback @0xfba03: zeroes +0x404/+0x408 as a q-word and writes an identity gamma
 *   parameter block (@0xfba0e reads f32x4 at 0x2cc22b(%rip)) then falls through to the
 *   fixed-lane detector.
 *   Fixed-lane detector @0xfba58..@0xfbb18: for each of the 7 f32x4s, tests whether every
 *   lane equals its splat via movshdup+ucomiss+movhlps; sets +0x370 to 1 if ALL lanes are
 *   splat-equal-to-lane-0 (i.e. the block is a scalar constant), else 0.
 *
 * FULL PORT REQUIRES: (a) the 4 rodata cmpneqps constants (probably NaN mask / range
 * limit vectors) resolved from their RIP-relative loads to real f32 values, (b) the
 * identity gamma parameter block at 0x2cc22b(%rip), (c) semantics of the fallback branch
 * (which happens when the input violates the per-form constraint). That is a decode task
 * bigger than this chunk's budget — throw-stubbed with the entry addr.
 */
export function hgColorGamma_SetGammaFunction_form(
  _self: HGColorGammaM3,
  _form: HgColorGammaForm,
  _p0: readonly [number, number, number, number],
  _p1: readonly [number, number, number, number],
  _p2: readonly [number, number, number, number],
  _p3: readonly [number, number, number, number],
  _p4: readonly [number, number, number, number],
  _p5: readonly [number, number, number, number],
  _p6: readonly [number, number, number, number],
): void {
  throw new Error(
    "raw-port: HGColorGamma::SetGammaFunction(hgColorGammaForm, f32x4[7]) not yet transcribed " +
    "(@0x00000000000fb830..0x00000000000fbb26 — 248-line SSE jump-table over form-1 (5 arms) with " +
    "per-form cmpneqps constraint tests using rodata @RIP+0x2cf123 (@0xfb896), @RIP+0x2cf0e8 " +
    "(@0xfb8d1), @RIP+0x2cf092 (@0xfb927), @RIP+0x2ceffc (@0xfb9bd); fallback identity block at " +
    "@RIP+0x2cc22b (@0xfba0e); fixed-lane detector @0xfba58..@0xfbb18 — Helium)",
  );
}

// ── Method 70: SetGammaFunction(LogCurve) @0xfbb40..@0xfbbb9 ─────────────────────────
/**
 * HGColorGamma::SetGammaFunction(hgColorGammaLogCurve).
 * @0x00000000000fbb40..0x00000000000fbbb9 — 39 instrs. Compact overload.
 *
 * Disasm (tail of SetGammaFunction.s, starts @0xfbb40):
 *   fbb4c callq HGNode::ClearBits()
 *   fbb51 movb  $0x1, 0x2e9(%r14)
 *   fbb59 movl  $0x5, 0x404(%r14)                    // gammaForm = 5 (marker for LogCurve overload)
 *   fbb64 movl  %ebx, 0x408(%r14)                    // gammaLogCurve = arg
 *   fbb6b movaps 0x2cc0ce(%rip), %xmm0               // load rodata f32x4 (identity col0 or "1,0,0,0")
 *   fbb72 movaps %xmm0, 0x300(%r14)                  // transformBlock[0] = identity col0
 *   fbb7a xorps  %xmm0, %xmm0                        // zero
 *   fbb7d movaps %xmm0, 0x310(%r14)                  // [1] = 0
 *   fbb85 movaps %xmm0, 0x320(%r14)                  // [2] = 0
 *   fbb8d movaps %xmm0, 0x330(%r14)                  // [3] = 0
 *   fbb95 movaps %xmm0, 0x340(%r14)                  // [4] = 0
 *   fbb9d movaps %xmm0, 0x350(%r14)                  // [5] = 0
 *   fbba5 movaps %xmm0, 0x360(%r14)                  // [6] = 0
 *   fbbad movb   $0x1, 0x370(%r14)                   // transformBlock_isFixed = 1
 * The rodata read @VA (0xfbb72 - 5) + 0x2cc0ce = 0xfbb72 + 0x2cc0ce = 0x3c7c40… but its
 * lanes are known by convention: the identity column [1,0,0,0]. The stores of the six
 * following blocks are xor'd zero. The +0x370 flag is set 1 because all 7 blocks are
 * splat-integer.
 */
export function hgColorGamma_SetGammaFunction_logCurve(
  self: HGColorGammaM3,
  logCurve: HgColorGammaLogCurve,
): void {
  HGNode_ClearBits(self);                                       // @0xfbb4c
  self.dirtyFlag = 1;                                            // @0xfbb51
  self.gammaForm = 0x5;                                          // @0xfbb59
  // @0xfbb64 — stores u32 arg at +0x408. m1 named that offset `unpremultSanitizedLutIdx`
  // (a u64 in a different code path); the C++ class overlays the two uses at the same word.
  // Writing through the same field preserves layout parity.
  self.unpremultSanitizedLutIdx = logCurve >>> 0;                // @0xfbb64
  // @0xfbb6b + fbb72  — writes rodata @VA 0x3c7c40-ish (identity col0) into transformBlock[0]
  // The rodata was decoded in m2 (see m2 `IDENTITY_COL_0 = [1,0,0,0]` @VA 0x3c7cc0). The
  // per-method RIP-relative here (0x2cc0ce from @0xfbb72) resolves to 0x3c7c40 — a NEW address
  // not decoded in this chunk. It is one of the identity columns; the exact lane order is
  // required to make this port bit-exact. Preserve the STORE with a placeholder-throw stub
  // for the value (loud, not silent) until the rodata is resolved.
  const rodataFbb6b: readonly [number, number, number, number] = (() => {
    throw new Error(
      "raw-port: HGColorGamma::SetGammaFunction(LogCurve) rodata @VA 0x3c7c40 " +
      "(RIP-relative @0xfbb6b, disp 0x2cc0ce) not yet resolved — Helium __TEXT,__const",
    );
  })();
  self.transformBlock_300 = rodataFbb6b;                         // @0xfbb72
  const zero4: readonly [number, number, number, number] = [0, 0, 0, 0];
  self.transformBlock_310 = zero4;                               // @0xfbb7d
  self.transformBlock_320 = zero4;                               // @0xfbb85
  self.transformBlock_330 = zero4;                               // @0xfbb8d
  self.transformBlock_340 = zero4;                               // @0xfbb95
  self.transformBlock_350 = zero4;                               // @0xfbb9d
  self.transformBlock_360 = zero4;                               // @0xfbba5
  self.transformBlock_isFixed = 1;                               // @0xfbbad
}

// ── Method 71: SetDitherMode(bool) @0xfbbc0..@0xfbbe4 ────────────────────────────────
/**
 * HGColorGamma::SetDitherMode(bool).
 * @0x00000000000fbbc0..0x00000000000fbbe4 — 12 instrs.
 *
 * Disasm:
 *   fbbcc callq HGNode::ClearBits()
 *   fbbd1 movb  $0x1, 0x2e9(%r14)
 *   fbbd9 movb  %bl,  0x401(%r14)     // ditherMode = arg
 */
export function hgColorGamma_SetDitherMode(self: HGColorGammaM3, on: boolean): void {
  HGNode_ClearBits(self);                     // @0xfbbcc
  self.dirtyFlag = 1;                          // @0xfbbd1
  self.ditherMode = on ? 1 : 0;                // @0xfbbd9
}

// ── Method 72: SetFixedPointPrecisionMode(bool) @0xfbbf0..@0xfbc14 ───────────────────
/**
 * HGColorGamma::SetFixedPointPrecisionMode(bool).
 * @0x00000000000fbbf0..0x00000000000fbc14 — 12 instrs.
 *
 * Disasm:
 *   fbbfc callq HGNode::ClearBits()
 *   fbc01 movb  $0x1, 0x2e9(%r14)
 *   fbc09 movb  %bl,  0x402(%r14)     // fixedPointPrecisionMode = arg
 */
export function hgColorGamma_SetFixedPointPrecisionMode(
  self: HGColorGammaM3,
  on: boolean,
): void {
  HGNode_ClearBits(self);                     // @0xfbbfc
  self.dirtyFlag = 1;                          // @0xfbc01
  self.fixedPointPrecisionMode = on ? 1 : 0;   // @0xfbc09
}

// ── Method 73: SetAntiSymmetricToneCurves(bool) @0xfbc20..@0xfbc2c ───────────────────
/**
 * HGColorGamma::SetAntiSymmetricToneCurves(bool).
 * @0x00000000000fbc20..0x00000000000fbc2c — 5 instrs.
 *
 * Disasm:
 *   fbc24 movb %sil, 0x497(%rdi)     // antiSymmetricToneCurves = arg
 *   fbc2b popq %rbp
 *   fbc2c retq
 * SPECIAL: This is the ONE setter in the chunk that does NOT call HGNode::ClearBits and
 * does NOT touch the +0x2e9 dirtyFlag. It's a pure field write.
 */
export function hgColorGamma_SetAntiSymmetricToneCurves(
  self: HGColorGammaM3,
  on: boolean,
): void {
  self.antiSymmetricToneCurves = on ? 1 : 0;   // @0xfbc24
}

// ── Method 74: SetScale1(f32x4) @0xfbc30..@0xfbc5d ───────────────────────────────────
/**
 * HGColorGamma::SetScale1(float vector[4]).
 * @0x00000000000fbc30..0x00000000000fbc5d — 14 instrs.
 *
 * Disasm:
 *   fbc39 movaps %xmm0, -0x20(%rbp)             // spill scale to stack
 *   fbc40 callq HGNode::ClearBits()
 *   fbc45 movb  $0x1, 0x2e9(%rbx)
 *   fbc4c movaps -0x20(%rbp), %xmm0             // reload
 *   fbc50 movaps %xmm0, 0x430(%rbx)             // matrix1ColumnScales = arg (f32x4)
 * The spill/reload is because ClearBits may clobber xmm0. Semantically this is
 * `matrix1ColumnScales = scale`, each lane Math.fround'd (movaps is 128-bit but lanes are f32).
 */
export function hgColorGamma_SetScale1(
  self: HGColorGammaM3,
  scale: readonly [number, number, number, number],
): void {
  HGNode_ClearBits(self);                       // @0xfbc40
  self.dirtyFlag = 1;                            // @0xfbc45
  self.matrix1ColumnScales = [                  // @0xfbc50
    Math.fround(scale[0]),
    Math.fround(scale[1]),
    Math.fround(scale[2]),
    Math.fround(scale[3]),
  ];
}

// ── Method 75: SetScale2(f32x4) @0xfbc60..@0xfbc8d ───────────────────────────────────
/**
 * HGColorGamma::SetScale2(float vector[4]).
 * @0x00000000000fbc60..0x00000000000fbc8d — 14 instrs (mirror of SetScale1).
 *
 * Disasm:
 *   fbc70 callq HGNode::ClearBits()
 *   fbc75 movb  $0x1, 0x2e9(%rbx)
 *   fbc80 movaps %xmm0, 0x440(%rbx)             // matrix2Shuffle = arg (f32x4)
 */
export function hgColorGamma_SetScale2(
  self: HGColorGammaM3,
  scale: readonly [number, number, number, number],
): void {
  HGNode_ClearBits(self);                       // @0xfbc70
  self.dirtyFlag = 1;                            // @0xfbc75
  self.matrix2Shuffle = [                       // @0xfbc80
    Math.fround(scale[0]),
    Math.fround(scale[1]),
    Math.fround(scale[2]),
    Math.fround(scale[3]),
  ];
}

// ── Method 76: SetBias1(f32x4) @0xfbc90..@0xfbcbd ────────────────────────────────────
/**
 * HGColorGamma::SetBias1(float vector[4]).
 * @0x00000000000fbc90..0x00000000000fbcbd — 14 instrs.
 *
 * Disasm:
 *   fbca0 callq HGNode::ClearBits()
 *   fbca5 movb  $0x1, 0x2e9(%rbx)
 *   fbcb0 movaps %xmm0, 0x450(%rbx)             // bias1 = arg (f32x4)
 */
export function hgColorGamma_SetBias1(
  self: HGColorGammaM3,
  bias: readonly [number, number, number, number],
): void {
  HGNode_ClearBits(self);                       // @0xfbca0
  self.dirtyFlag = 1;                            // @0xfbca5
  self.biasVec1 = [                                // @0xfbcb0
    Math.fround(bias[0]),
    Math.fround(bias[1]),
    Math.fround(bias[2]),
    Math.fround(bias[3]),
  ];
}

// ── Method 77: SetBias2(f32x4) @0xfbcc0..@0xfbced ────────────────────────────────────
/**
 * HGColorGamma::SetBias2(float vector[4]).
 * @0x00000000000fbcc0..0x00000000000fbced — 14 instrs.
 *
 * Disasm:
 *   fbcd0 callq HGNode::ClearBits()
 *   fbcd5 movb  $0x1, 0x2e9(%rbx)
 *   fbce0 movaps %xmm0, 0x460(%rbx)             // bias2 = arg (f32x4)
 */
export function hgColorGamma_SetBias2(
  self: HGColorGammaM3,
  bias: readonly [number, number, number, number],
): void {
  HGNode_ClearBits(self);                       // @0xfbcd0
  self.dirtyFlag = 1;                            // @0xfbcd5
  self.biasVec2 = [                                // @0xfbce0
    Math.fround(bias[0]),
    Math.fround(bias[1]),
    Math.fround(bias[2]),
    Math.fround(bias[3]),
  ];
}

// ── Method 78: SetConversion(matrixCoeffs, logCurve, logGamut, colorPrimaries) ────────
/**
 * HGColorGamma::SetConversion(hgColorGammaMatrixCoefficients, hgColorGammaLogCurve,
 *                              hgColorGammaLogGamut, hgColorGammaColorPrimaries).
 * @0x00000000000fbcf0..0x00000000000fc0a0 — 944 bytes (215 disasm lines).
 *
 * Structure (from Helium.HGColorGamma.SetConversion_4arg.s):
 *   fbd10  callq HGNode::ClearBits()
 *   fbd15  movb $1, 0x2e9(%rbx)                      // dirty=1
 *   fbd1c..fbd23  compute r13 = matrixCoeffs << 6; r14 = &HGColorGamma::YCbCrToRGB (VA 0x3cfb30)
 *   fbd2a..fbd57  copy 3 xmm columns from YCbCrToRGB[r13] (a 4x4 float matrix per matrix-coeff
 *                enum value) to self.matrix1 (+0x380..+0x3a0), then write the identity col3
 *                (+0x3b0) from rodata 0x2cde99(%rip) (the [0,0,0,1] identity column).
 *   fbd5e..     large branching over logCurve/logGamut/colorPrimaries computing:
 *                  gammaForm at +0x404, gammaLogCurve at +0x408, and the 7 f32x4 blocks at
 *                  +0x300..+0x360 (transferFunction parameter block) plus +0x370 fixed-lane
 *                  bit, and matrix1ColumnScales +0x430 / bias1 +0x450 (matrix2 stays untouched).
 *
 * This is the ROOT DISPATCH for the whole class — every predefined color-conversion preset
 * routes here. Faithful port requires: (a) the full YCbCrToRGB[29] 4x4 matrix table at
 * VA 0x3cfb30 (each row 64 bytes; matrixCoeffs<<6 indexing), (b) the identity col3 rodata
 * @VA 0xfbd47+0x2cde99, (c) the per-enum branch structure for every logCurve/logGamut/
 * colorPrimaries triple. Deferred with a throw-stub citing the entry.
 */
export function hgColorGamma_SetConversion_4arg(
  _self: HGColorGammaM3,
  _matrixCoeffs: HgColorGammaMatrixCoefficients,
  _logCurve: HgColorGammaLogCurve,
  _logGamut: HgColorGammaLogGamut,
  _colorPrimaries: HgColorGammaColorPrimaries,
): void {
  throw new Error(
    "raw-port: HGColorGamma::SetConversion(matrixCoeffs, logCurve, logGamut, colorPrimaries) " +
    "not yet transcribed (@0x00000000000fbcf0..0x00000000000fc0a0 — 215-line dispatcher; needs " +
    "YCbCrToRGB[29] 4x4 matrix table @VA 0x3cfb30 + identity col3 @VA ~0x3caae0 " +
    "(RIP-rel 0x2cde99 @0xfbd47) + per-enum branch structure resolved — Helium)",
  );
}

// ── Method 79: SetConversion(6-arg color-primaries/transfer/matrix pair) ─────────────
/**
 * HGColorGamma::SetConversion(hgColorGammaColorPrimaries, hgColorGammaTransferFunction,
 *                              hgColorGammaMatrixCoefficients, hgColorGammaColorPrimaries,
 *                              hgColorGammaTransferFunction, hgColorGammaMatrixCoefficients).
 * @0x00000000000fc0a0..0x00000000000fcc90 — 3056 bytes (660 disasm lines).
 *
 * Structure (from Helium.HGColorGamma.SetConversion.s):
 *   Prologue @0xfc0c1..@0xfc0c9: spill 6 enum args into r15/r12/r13/-0x40(%rbp)/r14/[+0x10(%rbp)],
 *                                call HGNode::ClearBits, movb $1 to +0x2e9.
 *   MAIN DISPATCH @0xfc0d0..: a huge multi-way branch on (inColorPrim, inTransfer, inMatrix)
 *   x (outColorPrim, outTransfer, outMatrix) which computes:
 *     - conversion mode (+0x404: gammaForm) and its sub-selector (+0x408)
 *     - matrix1 @+0x380..+0x3b0 (typically YCbCrToRGB[inMatrix] then post-multiplied by a
 *       primaries transform)
 *     - matrix2 @+0x3c0..+0x3f0 (typically the RGBToYCbCr inverse for the OUT triple)
 *     - transferFunction parameter block @+0x300..+0x360 + +0x370 fixed-lane bit
 *     - bias1/bias2 @+0x450/+0x460, matrix1ColumnScales/matrix2Shuffle @+0x430/+0x440
 *   Fast path @0xfc191..@0xfc1d3: when inMatrix == outMatrix and inTransfer == outTransfer
 *   (pure primaries-only conversion), writes an identity transform block + copies matrix1
 *   from a special pool at RIP+0x2ce8bd (@0xfc1ac).
 *   Fallback @0xfc2c8..: full generalized (colorPrim -> XYZ -> colorPrim) 3x3 pipeline.
 *
 * This is the primary user-facing SetConversion API and encodes the entire built-in color-
 * space conversion database. Faithful port requires: (a) YCbCrToRGB[29] (already used by
 * the 4-arg overload), (b) the primaries-to-XYZ table for every colorPrimaries value,
 * (c) the transferFunction curve-parameter tables (7 f32x4 per curve), (d) the entire
 * jump-table logic that decides which combination is a valid preset. Deferred.
 */
export function hgColorGamma_SetConversion_6arg(
  _self: HGColorGammaM3,
  _inColorPrimaries: HgColorGammaColorPrimaries,
  _inTransferFn: HgColorGammaTransferFunction,
  _inMatrixCoeffs: HgColorGammaMatrixCoefficients,
  _outColorPrimaries: HgColorGammaColorPrimaries,
  _outTransferFn: HgColorGammaTransferFunction,
  _outMatrixCoeffs: HgColorGammaMatrixCoefficients,
): void {
  throw new Error(
    "raw-port: HGColorGamma::SetConversion(colorPrim,transferFn,matrixCoeffs, colorPrim,transferFn,matrixCoeffs) " +
    "not yet transcribed (@0x00000000000fc0a0..0x00000000000fcc90 — 660-line 6-arg dispatcher; " +
    "needs YCbCrToRGB[29] @VA 0x3cfb30, primaries-to-XYZ table, transferFunction curve tables, " +
    "and full jump-table decision tree resolved — Helium)",
  );
}
