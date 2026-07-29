// raw-port/src/render/HGColorConform.ts
//
// FCP `HGColorConform` — Helium's central color-space / camera-log / gamut
// conform node. Every camera-log processing-info (Sony/ARRI/Canon/RED/
// Panasonic/Fuji/DJI/BMD) invokes one of the SetConversion(...) overloads
// below, so getting the setter state-machine + layout right unblocks the
// entire camera-log family.
//
// Framework: Helium.framework (x86_64 slice; fat @0x4000; VAs below are the
// raw VM addresses printed by `otool -tV`).
//
// Symbols with fully-decoded bodies below:
//   0x1c9060  HGColorConform::HGColorConform()                      [C2]
//   0x1c9410  HGColorConform::HGColorConform()                      [C1 -> tail-jmp to C2]
//   0x1c9420  HGColorConform::~HGColorConform()                     [D2 base dtor]
//   0x1c94d0  HGColorConform::~HGColorConform()                     [D1 -> tail-jmp to D2]
//   0x1c94e0  HGColorConform::~HGColorConform()                     [D0 = D2 then op delete]
//   0x1c92b0  HGColorConform::ClearConversionParams()
//   0x1c9230  HGColorConform::GetDefaultToneQualityMode() const     [returns 1]
//   0x1c9500  HGColorConform::SetFallbackMode(bool)
//   0x1c9530  HGColorConform::SetInOut422FilterMode(hgColorConformInOut422FilterMode)
//   0x1c9560  HGColorConform::SetInOut422FilterRect(HGRect)
//   0x1c95a0  HGColorConform::SetInputPixelFormat(HGYCbCrFormat)
//   0x1c95c0  HGColorConform::SetOutputPixelFormat(HGFormat, HGYCbCrFormat)
//   0x1c95f0  HGColorConform::SetPremultiplyState(bool, bool)
//   0x1c9640  HGColorConform::Set1DLutScaleAndOffset(float, float)
//   0x1c9db0  HGColorConform::SetToneQualityMode(hgColorConformToneQuality)
//   0x1c9de0  HGColorConform::SetARRILogCExposureIndex(unsigned int)
//   0x1c9e10  HGColorConform::SetSonySGamutGainAndMatrix(float, bool)
//   0x1ccc50  HGColorConform::SetDitherMode(bool)
//   0x1ccc80  HGColorConform::SetFixedPointPrecisionMode(bool)
//   0x1cccb0  HGColorConform::SetAntiSymmetricToneCurves(bool)
//   0x1cc5d0  HGColorConform::SetConversion(hgColorConformConversionPreset)
//   0x1cc630  HGColorConform::SetConversion(prim,tf,mat, prim,tf,mat)    [src->dst gamut]
//   0x1cc780  HGColorConform::SetConversion(mat, logConversion, primaries)
//   0x1cc800  HGColorConform::SetConversion(mat, logLinearization, logGamut, primaries)
//   0x1ccb40  HGColorConform::SetREDRAWConversion()
//
// Frontier (throw-stubs with @0xADDR provenance; too big to transcribe here):
//   0x1c9720  SetLook3DLutConversion(prim/mat/tf, CFData*, ...)
//   0x1c9850  SetLook3DLutConversion(HGColorConformLook3DLUT*, mat, prim)
//   0x1c98d0  SetLookCDL
//   0x1c99f0  Prep3DLUTBitmap                                    [254 lines]
//   0x1c9e70  CreateColorGammaNode() const
//   0x1c9ec0  PrepareOutputNode
//   0x1c9ee0  SetConversion(CGColorSpace*, CGColorSpace*)        [93 lines]
//   0x1ca000  CreateColorSyncProfileFromCGColorSpace
//   0x1ca040  SetConversion(ColorSyncProfile*, ColorSyncProfile*) [101 lines]
//   0x1ca1a0  SetConversionStatic(CGColorSpace*, ...)             [119 lines]
//   0x1ca330  SetConversionStatic(ColorSyncProfile*, ...)
//   0x1ca3f0  TestConversionStatic(CGColorSpace*, CGColorSpace*)
//   0x1ca480  DecodeFragmentList                                  [1787 lines]
//   0x1cc8a0  SetRAWConversion                                    [141 lines]
//   0x1ccb70  SetRAWPluginConversion
//   0x1ccce0  ConvertRGBAColor
//   0x1cccf0  ConvertRGBColor                                     [593 lines]
//   0x1cd710  GetOutput                                            [96 lines]
//   0x1cd890  CreateColorConformHeliumGraph(HGRenderer*, preset)  [1610 lines]
//   0x1cf2e0  CreateColorConformHeliumGraph(HGRenderer*)           [1317 lines]
//   0x1d0920  ProcessParamState
//   0x1d09d0  GetNodeListFromCache
//   0x1d0e20  AddNodeListToCache
//   0x1d1050  DeleteNodeList
//   0x1d1110  InitNodeListCache
//   0x1d11a0  DeleteNodeListCache
//   0x1d12a0  KeyFromColorSpaceTransform
//
// STRUCT LAYOUT (recovered field-by-field from the ctor at 0x1c9060 and
// ClearConversionParams at 0x1c92b0). Inherits HGNode 0x00..0x198.
// HGColorConform adds:
//
//   +0x1a0  HGObject* linkedNodeA           (ctor xmm-zero @0x1c9086 clears)
//   +0x1a8  HGObject* linkedNodeB           (ctor: 0 @0x1c91e4)
//   +0x1b0  bool fallbackMode               (ctor: 0 @0x1c90a0 movw $0)
//   +0x1b1  bool ditherMode                 (ctor: 0 @0x1c90a0 movw $0)
//   +0x1b2  bool fixedPointPrecisionMode    (ctor: 0 @0x1c90a9)
//   +0x1b4  u32 toneQualityMode             (ctor: 1 @0x1c90ba)
//   +0x1b8  u32 outputPixelFormat (HGFormat) (ctor: 0 as high half of 0x1b4 qword store)
//   +0x1bc  u32 inputPixelFormat (HGYCbCrFormat) (ctor: 0 @0x1c917e)
//   +0x1c0  u32 outputYCbCrFormat            (ctor: 0 as high half of 0x1bc qword store)
//   +0x1c4  u32 inOut422FilterMode           (ctor: 1 @0x1c90d5)
//   +0x1c8  HGRect inOut422FilterRect (16 B) (ctor: _HGRectInfinite @0x1c90df)
//   +0x1d8  bool premultiplyStateA           (ctor: 1 via movw $0x101)
//   +0x1d9  bool premultiplyStateB           (ctor: 1)
//   +0x1da  bool antiSymmetricToneCurves     (ctor: 0 @0x1c90ce)
//   +0x1dc  f32 lut1DScale                   (ctor: 2.0f @0x1c9189 from @0x3cf810)
//   +0x1e0  f32 lut1DOffset                  (ctor: -0.5f — high half of the movsd)
//   +0x1e4  u32 conversionKind               (ctor: 0xffffffff @0x1c90f0)
//
//  -- conversion-params block (all cleared by ClearConversionParams) --
//   +0x1e8  u32 gammaSrcPrim   (CCP xmm from @0x85ab80: {0, 0, 8, 8})
//   +0x1ec  u32 gammaDstPrim
//   +0x1f0  u32 gammaSrcTF     (= 8)
//   +0x1f4  u32 gammaDstTF     (= 8)
//   +0x1f8  u32 gammaSrcMat    (CCP xmm zero @0x1c92d2 clears 0x1f8..0x208)
//   +0x1fc  u32 gammaDstMat
//   +0x200  u32 logMatrixCoefficients
//   +0x204  u32 logConversion
//   +0x208  u32 logLinearization  (CCP: 0xffffffff via `movl $-1,%eax; movq %rax,0x208`)
//   +0x20c  u32 logGamut          (= 0 as high half of the movq above)
//   +0x210  u32 logPrimariesFlag  (CCP: 0 @0x1c92c8)
//   +0x218  HGColorConformPoolNode* poolNode  (ctor: allocated via HGObject::operator new(0x78))
//   +0x220  u64 handleB           (CCP: 0 @0x1c93f4)
//   +0x228  u64 handleC           (CCP: 0 @0x1c92e8)
//   +0x230  4x f32 block_230      (CCP: @0x85ef40 = {65535, 0.00390631, 0.00390631, 1})
//   +0x240  4x f32 block_240      (CCP: @0x85ef50 = {1, 4096, 2160, 6.71965e-5})
//   +0x250  2x u32 block_250      (CCP: @0x85ef60 = {0x321e8a92, 0x31aaac00})
//   +0x258  4x f32 block_258      (CCP: 0)
//   +0x268  4x f32 block_268      (CCP: 0)
//   +0x280  4x f32 block_280      (CCP: movss @0x3c7cc0=1.0f then movaps -> {1,0,0,0})
//   +0x290  2x f64 block_290      (CCP: movsd @0x3c7cb0=0.0078125 then movaps -> {0.0078125,0.0})
//   +0x2a0  4x f32 block_2a0      (CCP: @0x3caa70 = {0,0,1,0})
//   +0x2b0  4x f32 block_2b0      (CCP: @0x3c9fe0 = {0,0,0,1})
//   +0x30d  bool flag_30d         (ctor+CCP: 0)
//   +0x310  2x u32 block_310      (CCP: {3, 3})
//   +0x318  u32 field_318         (CCP: 0)
//   +0x31c  4x f32 block_31c      (ctor: @0x3ca9c0 = {1,1,1,0})
//   +0x32c  4x f32 block_32c      (ctor: @0x3cb140 = {0,0,1,1})
//   +0x33c  2x f32 block_33c      (ctor: @0x3ca0b0 = {1.0f, 1.0f})
//   +0x344  bool flag_344         (ctor: 1)
//   +0x348  u32 arriLogCExposureIndex (ctor: 0x320 = 800)
//   +0x34c  f32 sonySGamutGain    (ctor: 1.0f, from high half of 0x3f80000000000320)
//   +0x350  bool sonySGamutBool   (ctor: 0)
//   +0x358  2x u64 shared_ptr pool (ctor: 0)
//   +0x360  2x u64 shared_weak_count pair (referenced only by D2)
//
// STATE-MACHINE INVARIANT: every setter compares old fields; if identical
// it returns without side effect. Otherwise it (a) calls HGNode::ClearBits()
// (invalidates cached graph), (b) writes the new fields, and (c) if it's a
// SetConversion overload also calls ClearConversionParams() first.

import { HGNode } from "./HGNode";
import { HGObject } from "./HGObject";
import type {
  HGColorGammaColorPrimaries,
  HGColorGammaTransferFunction,
  HGColorGammaMatrixCoefficients,
  HGColorConformConversionPreset,
} from "./HGGamutMap";

// ─────────────────────────────────────────────────────────────────────────
// Opaque enum aliases (u32 in the disasm — the numeric mapping is set by
// callers, not by this class).

/** `HGColorGamma::hgColorGammaLogGamut` — u32. */
export type HGColorGammaLogGamut = number;
/** `HGColorConform::hgColorConformLogConversion` — u32. */
export type HGColorConformLogConversion = number;
/** `HGColorConform::hgColorConformLogLinearization` — u32. */
export type HGColorConformLogLinearization = number;
/** `HGColorConform::hgColorConformToneQuality` — u32. Ctor default = 1. */
export type HgColorConformToneQuality = number;
/** `HGColorConform::hgColorConformInOut422FilterMode` — u32. Ctor default = 1. */
export type HgColorConformInOut422FilterMode = number;
/** `HGColorConform::hgColorConformRAWToLogEncoding` — u32. */
export type HgColorConformRAWToLogEncoding = number;
/** `HGColorConform::hgLookLUTEndian` — u32. */
export type HgLookLUTEndian = number;
/** `HGYCbCrFormat` — u32. */
export type HGYCbCrFormat = number;
/** `HGFormat` — u32. */
export type HGFormat = number;

/** `HGRect` — 4×f32 (x,y,w,h) — 16 bytes. Passed by value as {rsi,rdx} pair
 *  in x86_64 SysV; modeled here as a 4-tuple. */
export type HGRect = [number, number, number, number];

/** `_HGRectInfinite` — sentinel used by the ctor to init `inOut422FilterRect`
 *  (@Helium data-segment const, referenced by `leaq _HGRectInfinite(%rip)` at
 *  0x1c90df). The canonical value is the infinite rect. */
const _HGRectInfinite: HGRect = [-Infinity, -Infinity, Infinity, Infinity];

// ─────────────────────────────────────────────────────────────────────────
// Frontier throw-stubs for symbols called from this file that aren't yet
// transcribed. Each cites its @0xADDR so the anti-shortcut gate detects it.

/** `HGObject::operator new(unsigned long)` @Helium 0x1a0f00 — allocator. */
function HGObject_operator_new(_size: number): HGObject {
  throw new Error(
    "HGObject::operator new(unsigned long) @Helium 0x1a0f00 not yet transcribed (allocator for HGColorConform pool-node)",
  );
}

/** `HGNode::ClearBits()` @Helium 0x11c890 — invalidates cached-graph bits. */
function HGNode_ClearBits(_self: HGColorConform): void {
  throw new Error(
    "HGNode::ClearBits() @Helium 0x11c890 not yet transcribed (called by every HGColorConform setter to invalidate cached graph)",
  );
}

/** `HGColorGamma::TestConversion(prim,tf,mat, prim,tf,mat)` @Helium
 *  (extern in this framework — referenced by callq at 0x1cc6ac / 0x1cc716 /
 *  0x1cc734). Returns bool (%al) indicating whether the requested gamma
 *  transform is an identity / can be skipped. */
function HGColorGamma_TestConversion(
  _srcPrim: HGColorGammaColorPrimaries,
  _srcTF: HGColorGammaTransferFunction,
  _srcMat: HGColorGammaMatrixCoefficients,
  _dstPrim: HGColorGammaColorPrimaries,
  _dstTF: HGColorGammaTransferFunction,
  _dstMat: HGColorGammaMatrixCoefficients,
): boolean {
  throw new Error(
    "HGColorGamma::TestConversion(prim,tf,mat, prim,tf,mat) @Helium (callsite 0x1cc6ac / 0x1cc716 / 0x1cc734) not yet transcribed",
  );
}

/** `s_NodeListCacheLock.Lock()` — HGSynchronizable @Helium (callsite 0x1c9462). */
function HGColorConform_lockNodeListCache(): void {
  throw new Error(
    "HGSynchronizable::Lock() @Helium (callsite 0x1c9462 — HGColorConform::s_NodeListCacheLock) not yet transcribed",
  );
}

/** `s_NodeListCacheLock.Unlock()` — HGSynchronizable @Helium (callsite 0x1c947c). */
function HGColorConform_unlockNodeListCache(): void {
  throw new Error(
    "HGSynchronizable::Unlock() @Helium (callsite 0x1c947c — HGColorConform::s_NodeListCacheLock) not yet transcribed",
  );
}

/**
 * `HGColorConform` pool-node inner struct A allocated by the ctor at +0x218
 * (78-byte HGObject subclass). Its vtable comes from the load `leaq
 * 0x860e2a(%rip), %rax` @Helium 0x1c910f (data-segment vtable ptr). Only
 * fields written by the ctor + ClearConversionParams are modeled; slot 0x10
 * is CFRelease'd on reset.
 */
export interface HGColorConformPoolNode extends HGObject {
  /** +0x10 — CFRelease'd on reset. */
  cfTypeHandle: unknown | null;
  /** +0x18 = 1.0f (0x3f800000). */
  f32_18: number;
  /** +0x1c..+0x28 = 0 (12 zero bytes). */
  xmm_1c: [number, number, number];
  /** +0x28..+0x38 = 0 (16 zero bytes; byte @0x38 immediately overwritten). */
  xmm_28: [number, number];
  /** +0x38 = true. */
  bool_38: boolean;
  /** +0x3c = 2. */
  i32_3c: number;
  /** +0x40 = 0. */
  u64_40: bigint;
  /** +0x48 = (copy of +0x40 in Clear). */
  u64_48: bigint;
  /** +0x50 = 0. */
  u64_50: bigint;
  /** +0x58..+0x68 = {1.0f, 0.0f, -FLT_MAX, +FLT_MAX} (@0x85ef30). */
  xmm_58: [number, number, number, number];
  /** +0x68 = true. */
  bool_68: boolean;
  /** +0x6c = 0x100000000 (unaligned qword). */
  u64_6c: bigint;
}

/** Const 16-byte tuple loaded from Helium data @0x85ef30 — used by both the
 *  ctor (`movaps 0x695dd9(%rip), %xmm0` @0x1c9150) and ClearConversionParams
 *  (`movaps 0x695b54(%rip), %xmm0` @0x1c93d5). Raw f32s: {1, 0, -FLT_MAX, +FLT_MAX}. */
const kPoolNode_xmm_58: [number, number, number, number] = [
  1.0,
  0.0,
  -3.4028234663852886e38, // -FLT_MAX  (bits 0xff7fffff)
  3.4028234663852886e38,  // +FLT_MAX  (bits 0x7f7fffff)
];

/** Allocate + construct a fresh pool node at +0x218 (@0x1c90fa..0x1c916f). */
function HGColorConform_makePoolNode(): HGColorConformPoolNode {
  // @Helium 0x1c90fa: movl $0x78, %edi — allocate 0x78 bytes.
  // @Helium 0x1c90ff: callq HGObject::operator new(0x78).
  const p = HGObject_operator_new(0x78) as HGColorConformPoolNode;
  // @Helium 0x1c910a: callq HGObject::HGObject() — installs HGObject base
  //   vtable + refcount=1. (Modeled inside HGObject_operator_new.)
  // @Helium 0x1c910f + 0x1c9116: install pool-node vtable via
  //   `leaq 0x860e2a(%rip), %rax; movq %rax, (%r14)`. The vtable pointer
  //   value is data-segment-relative and not observable from TS; we don't
  //   dispatch through it in this port.
  // @Helium 0x1c9119: movq $0x0, 0x10(%r14) — cfTypeHandle = null.
  p.cfTypeHandle = null;
  // @Helium 0x1c9121 xorps; @0x1c9124 movups xmm0, 0x40 — u64_40 = 0.
  p.u64_40 = 0n;
  // @Helium 0x1c9129: movq $0x0, 0x50(%r14) — u64_50 = 0.
  p.u64_50 = 0n;
  // @Helium 0x1c9131: movl $0x3f800000, 0x18(%r14) — f32_18 = 1.0f.
  p.f32_18 = Math.fround(1.0);
  // @Helium 0x1c9139: movups xmm0, 0x1c(%r14) — xmm_1c = {0,0,0} (12 bytes).
  p.xmm_1c = [0, 0, 0];
  // @Helium 0x1c913e: movups xmm0, 0x28(%r14) — 16 zero bytes @0x28..0x38.
  //   The byte @0x38 is inside this block but is overwritten to 1 below.
  p.xmm_28 = [0, 0];
  // @Helium 0x1c9143: movb $0x1, 0x38(%r14) — bool_38 = true.
  p.bool_38 = true;
  // @Helium 0x1c9148: movl $0x2, 0x3c(%r14) — i32_3c = 2.
  p.i32_3c = 2;
  // @Helium 0x1c9150: movaps 0x695dd9(%rip), %xmm0 — load kPoolNode_xmm_58
  //   from Helium data @0x85ef30.
  // @Helium 0x1c9157: movups %xmm0, 0x58(%r14) — xmm_58 stored.
  p.xmm_58 = [
    kPoolNode_xmm_58[0],
    kPoolNode_xmm_58[1],
    kPoolNode_xmm_58[2],
    kPoolNode_xmm_58[3],
  ];
  // @Helium 0x1c915c: movb $0x1, 0x68(%r14) — bool_68 = true.
  p.bool_68 = true;
  // @Helium 0x1c9161..0x1c916b: movabsq $0x100000000, %rax; movq %rax, 0x6c
  //   — u64_6c = 0x100000000 (unaligned qword store at 0x6c).
  p.u64_6c = 0x100000000n;
  // 0x48 is not written by this path; Clear sets 0x48 = 0x40.
  p.u64_48 = 0n;
  return p;
}

/** Reset a pool node's per-conversion state (called by ClearConversionParams
 *  @0x1c9395..0x1c93f0 when +0x218 is non-null). */
function HGColorConform_resetPoolNode(node: HGColorConformPoolNode): void {
  // @Helium 0x1c9395: movq 0x10(%r14), %rdi ; @0x1c9399 testq — CFRelease if non-null.
  if (node.cfTypeHandle !== null) {
    // _CFRelease @Helium stub 0x3c4b1a — CoreFoundation, undecoded. In the
    // TS port we model it as a null-out only (no observable effect).
    node.cfTypeHandle = null;
  }
  // @Helium 0x1c93ab: movl $0x3f800000, 0x18(%r14).
  node.f32_18 = Math.fround(1.0);
  // @Helium 0x1c93b3: xorps xmm0; movups xmm0, 0x1c(%r14).
  node.xmm_1c = [0, 0, 0];
  // @Helium 0x1c93bb: movups xmm0, 0x28(%r14).
  node.xmm_28 = [0, 0];
  // @Helium 0x1c93c0: movb $0x1, 0x38(%r14).
  node.bool_38 = true;
  // @Helium 0x1c93c5: movl $0x2, 0x3c(%r14).
  node.i32_3c = 2;
  // @Helium 0x1c93cd: movq 0x40(%r14), %rax; movq %rax, 0x48(%r14).
  node.u64_48 = node.u64_40;
  // @Helium 0x1c93d5: movaps 0x695b54(%rip), %xmm0; movups xmm0, 0x58.
  node.xmm_58 = [
    kPoolNode_xmm_58[0],
    kPoolNode_xmm_58[1],
    kPoolNode_xmm_58[2],
    kPoolNode_xmm_58[3],
  ];
  // @Helium 0x1c93e1: movb $0x1, 0x68(%r14).
  node.bool_68 = true;
  // @Helium 0x1c93e6..0x1c93f0: u64_6c = 0x100000000.
  node.u64_6c = 0x100000000n;
}

// ─────────────────────────────────────────────────────────────────────────
// The class

/**
 * `HGColorConform` — Helium's central color-conform / camera-log node.
 *
 * Inherits `HGNode`. Only the HGColorConform-specific fields are declared
 * here; base-class fields live on the `HGNode` parent.
 */
export class HGColorConform extends HGNode {
  /** +0x1a0 — HGObject* auxiliary node released by D2 unconditional path. */
  linkedNodeA: HGObject | null = null;
  /** +0x1a8 — HGObject* auxiliary node released by D2 under s_NodeListCacheLock. */
  linkedNodeB: HGObject | null = null;

  /** +0x1b0 — SetFallbackMode(bool) target. Ctor default 0. */
  fallbackMode: boolean = false;
  /** +0x1b1 — SetDitherMode(bool) target. */
  ditherMode: boolean = false;
  /** +0x1b2 — SetFixedPointPrecisionMode(bool) target. */
  fixedPointPrecisionMode: boolean = false;

  /** +0x1b4 — SetToneQualityMode target. Ctor default = 1. */
  toneQualityMode: HgColorConformToneQuality = 1;
  /** +0x1b8 — output HGFormat. SetOutputPixelFormat writes this. */
  outputPixelFormat: HGFormat = 0;
  /** +0x1bc — input HGYCbCrFormat. SetInputPixelFormat writes this. */
  inputPixelFormat: HGYCbCrFormat = 0;
  /** +0x1c0 — output HGYCbCrFormat. SetOutputPixelFormat writes this. */
  outputYCbCrFormat: HGYCbCrFormat = 0;

  /** +0x1c4 — SetInOut422FilterMode target. Ctor default = 1. */
  inOut422FilterMode: HgColorConformInOut422FilterMode = 1;
  /** +0x1c8 — SetInOut422FilterRect target. Ctor default = _HGRectInfinite. */
  inOut422FilterRect: HGRect = [
    _HGRectInfinite[0], _HGRectInfinite[1], _HGRectInfinite[2], _HGRectInfinite[3],
  ];

  /** +0x1d8 — SetPremultiplyState arg1. Ctor default = 1 (movw $0x101, 0x1d8). */
  premultiplyStateA: boolean = true;
  /** +0x1d9 — SetPremultiplyState arg2. Ctor default = 1. */
  premultiplyStateB: boolean = true;
  /** +0x1da — SetAntiSymmetricToneCurves target. */
  antiSymmetricToneCurves: boolean = false;

  /** +0x1dc — Set1DLutScaleAndOffset(scale, offset) scale. Ctor default = 2.0f. */
  lut1DScale: number = Math.fround(2.0);
  /** +0x1e0 — Set1DLutScaleAndOffset offset. Ctor default = -0.5f. */
  lut1DOffset: number = Math.fround(-0.5);

  /** +0x1e4 — conversionKind discriminant. Ctor default = 0xffffffff.
   *  Values observed in the SetConversion overloads:
   *   0    = gamma-src/dst (SetConversionGamma fallback / no-hit path)
   *   1    = gamma-test    (SetConversionGamma matched path)
   *   2    = log conversion (SetConversionLog)
   *   3    = log linearization (SetConversionLogLinearize)
   *   0x16 = RED-RAW (SetREDRAWConversion) */
  conversionKind: number = 0xffffffff;

  // --- gamma-src/dst state block (kinds 0, 1) ---
  /** +0x1e8 */ gammaSrcPrim: HGColorGammaColorPrimaries = 0;
  /** +0x1ec */ gammaDstPrim: HGColorGammaColorPrimaries = 0;
  /** +0x1f0 */ gammaSrcTF: HGColorGammaTransferFunction = 8;
  /** +0x1f4 */ gammaDstTF: HGColorGammaTransferFunction = 8;
  /** +0x1f8 */ gammaSrcMat: HGColorGammaMatrixCoefficients = 0;
  /** +0x1fc */ gammaDstMat: HGColorGammaMatrixCoefficients = 0;

  // --- log-conversion state block (kinds 2, 3) ---
  /** +0x200 */ logMatrixCoefficients: HGColorGammaMatrixCoefficients = 0;
  /** +0x204 */ logConversion: HGColorConformLogConversion = 0;
  /** +0x208 */ logLinearization: HGColorConformLogLinearization = 0;
  /** +0x20c */ logGamut: HGColorGammaLogGamut = 0;
  /** +0x210 */ logPrimariesFlag: number = 0;

  /** +0x218 — pool node struct A (allocated via HGObject::operator new(0x78)). */
  poolNode: HGColorConformPoolNode;
  /** +0x220 — u64 handle B (cleared by ClearConversionParams). */
  handleB: bigint = 0n;
  /** +0x228 — u64 handle C (cleared by ClearConversionParams). */
  handleC: bigint = 0n;

  /** +0x230 — @0x85ef40 = {65535.0f, 0.00390631f, 0.00390631f, 1.0f}. */
  block_230: [number, number, number, number] = [
    Math.fround(65535.0),
    Math.fround(0.003906309604644775),
    Math.fround(0.003906309604644775),
    Math.fround(1.0),
  ];

  /** +0x240 — @0x85ef50 = {1.0f, 4096.0f, 2160.0f, 6.71965e-5f}. */
  block_240: [number, number, number, number] = [
    Math.fround(1.0),
    Math.fround(4096.0),
    Math.fround(2160.0),
    Math.fround(6.719650991726667e-5),
  ];

  /** +0x250 — 8-byte payload from @0x85ef60. Kept as two u32s for bit-exactness.
   *  As 2×f32 they'd be the tiny values (9.228e-9, 4.967e-9). */
  block_250: [number, number] = [0x321e8a92, 0x31aaac00];

  /** +0x258 — zero 16 bytes (xmm zero @0x1c931f). */
  block_258: [number, number, number, number] = [0, 0, 0, 0];
  /** +0x268 — zero 16 bytes (xmm zero @0x1c9326). */
  block_268: [number, number, number, number] = [0, 0, 0, 0];

  /** +0x280 — {1.0f, 0, 0, 0}: movss @0x3c7cc0 (=1.0f) then movaps 16-byte store. */
  block_280: [number, number, number, number] = [Math.fround(1.0), 0, 0, 0];

  /** +0x290 — 2×f64: movsd @0x3c7cb0 (=0.0078125 f64) then movaps -> {0.0078125, 0.0}. */
  block_290: [number, number] = [0.0078125, 0.0];

  /** +0x2a0 — @0x3caa70 = {0, 0, 1.0f, 0}. */
  block_2a0: [number, number, number, number] = [0, 0, Math.fround(1.0), 0];
  /** +0x2b0 — @0x3c9fe0 = {0, 0, 0, 1.0f}. */
  block_2b0: [number, number, number, number] = [0, 0, 0, Math.fround(1.0)];

  /** +0x30d — cached-graph-invalidated bool (ctor + CCP: 0). */
  flag_30d: boolean = false;

  /** +0x310 — u64 = 0x300000003 = {u32 3, u32 3}. */
  block_310: [number, number] = [3, 3];
  /** +0x318 — u32 = 0. */
  field_318: number = 0;

  /** +0x31c — @0x3ca9c0 = {1.0f, 1.0f, 1.0f, 0.0f} (ctor). */
  block_31c: [number, number, number, number] = [
    Math.fround(1.0), Math.fround(1.0), Math.fround(1.0), 0,
  ];
  /** +0x32c — @0x3cb140 = {0.0f, 0.0f, 1.0f, 1.0f} (ctor). */
  block_32c: [number, number, number, number] = [
    0, 0, Math.fround(1.0), Math.fround(1.0),
  ];
  /** +0x33c — @0x3ca0b0 = {1.0f, 1.0f} (ctor). */
  block_33c: [number, number] = [Math.fround(1.0), Math.fround(1.0)];
  /** +0x344 — bool = 1 (ctor). */
  flag_344: boolean = true;

  /** +0x348 — u32 = 0x320 = 800 (default ARRI-Log-C exposure index). */
  arriLogCExposureIndex: number = 0x320;
  /** +0x34c — f32 = 1.0f (default Sony-SGamut gain; high half of the movabsq
   *  $0x3f80000000000320 immediate). */
  sonySGamutGain: number = Math.fround(1.0);
  /** +0x350 — SetSonySGamutGainAndMatrix bool arg (ctor: 0). */
  sonySGamutBool: boolean = false;

  /**
   * `HGColorConform::HGColorConform()` — Helium @0x1c9060 (C2).
   * The C1 body @0x1c9410 tail-jmps to this (6-line trampoline).
   *
   * Transcription of the C2 asm (VA / mnemonic annotations for every write):
   *   @0x1c906d  callq HGNode::HGNode()                    ; base ctor
   *   @0x1c9072  leaq  0x860c27(%rip), %rax; movq %rax,(%rbx) ; vtable install
   *   @0x1c907c  movb  $0x0, 0x30d(%rbx)                   ; flag_30d = 0
   *   @0x1c9083  xorps xmm0; movups xmm0, 0x358            ; sharedPtrPool = 0
   *   @0x1c908d  leaq  hgColorConformNodeListCacheLockInit(%rip), %rdi
   *   @0x1c9094  leaq  hgColorConformNodeListCacheLockInitFunction(%rip),%rsi
   *   @0x1c909b  callq _pthread_once                       ; one-time cache-lock init
   *   @0x1c90a0  movw  $0x0, 0x1b0(%rbx)                   ; fallbackMode=0, ditherMode=0
   *   @0x1c90a9  movb  $0x0, 0x1b2(%rbx)                   ; fixedPointPrecisionMode=0
   *   @0x1c90b0  xorps xmm0; movups xmm0, 0x198            ; 16 zero bytes @+0x198
   *   @0x1c90ba  movq  $0x1, 0x1b4(%rbx)                   ; toneQualityMode=1 (qword;
   *                                                          high half zeros outputPixelFormat)
   *   @0x1c90c5  movw  $0x101, 0x1d8(%rbx)                 ; premultiplyStateA/B = 1
   *   @0x1c90ce  movb  $0x0, 0x1da(%rbx)                   ; antiSymmetricToneCurves = 0
   *   @0x1c90d5  movl  $0x1, 0x1c4(%rbx)                   ; inOut422FilterMode = 1
   *   @0x1c90df  leaq _HGRectInfinite; movups xmm; ...     ; inOut422FilterRect = infinite
   *   @0x1c90f0  movl  $0xffffffff, 0x1e4(%rbx)            ; conversionKind = 0xffffffff
   *   @0x1c90fa..0x1c916f: alloc + init pool node @+0x218
   *   @0x1c9176  callq HGColorConform::ClearConversionParams()
   *   @0x1c917e  movq  $0x0, 0x1bc(%rbx)                   ; inputPixelFormat=0 (qword;
   *                                                          high half zeros outputYCbCrFormat)
   *   @0x1c9189  movsd @0x3cf810, xmm0; movsd xmm0, 0x1dc  ; lut1DScale=2.0f, lut1DOffset=-0.5f
   *   @0x1c9199..0x1c91ae: block_31c, block_32c
   *   @0x1c91b5..0x1c91bd: block_33c
   *   @0x1c91c5  movb $0x1, 0x344(%rbx)                    ; flag_344 = 1
   *   @0x1c91cc..0x1c91d6: movabsq $0x3f80000000000320; movq %rax, 0x348
   *                                                        ; arriLogCExposureIndex=0x320,
   *                                                          sonySGamutGain=1.0f
   *   @0x1c91dd  movb $0x0, 0x350(%rbx)                    ; sonySGamutBool = 0
   *   @0x1c91e4  movq $0x0, 0x1a8(%rbx)                    ; linkedNodeB = null
   *
   * The exception-unwind cleanup landing pad at 0x1c91fa..0x1c9226 releases
   * the pool node via HGObject::operator delete, tears down the shared_ptr
   * at +0x358, and chains to HGNode::~HGNode() then __Unwind_Resume —
   * nothing observable from the happy path.
   */
  constructor() {
    // @0x1c906d: HGNode::HGNode() — installs HGNode vtable + zero-fills base.
    super();
    // @0x1c9072..0x1c9079: overwrite vtable with HGColorConform vtable.
    //   The vtable address (leaq 0x860c27(%rip)) is data-segment-relative;
    //   we store the effective addr for provenance only (not dispatched in TS).
    //   effective = next_ip (0x1c9079) + disp (0x860c27) = 0x0a29ca0 — but the
    //   real vtable lives inside the __DATA segment, so we just record the
    //   asm-level constant for documentation.
    this.vtable = 0x1c9079 + 0x860c27;
    // @0x1c907c: flag_30d = 0.
    this.flag_30d = false;
    // @0x1c9083..0x1c9086: xorps + movups xmm0, 0x358 (16 zero bytes).
    //   Covers the (as-yet-unmodeled) shared_ptr<HGPool::Allocator<...>> pair.
    // @0x1c908d..0x1c909b: _pthread_once(hgColorConformNodeListCacheLockInit,
    //                                    hgColorConformNodeListCacheLockInitFunction).
    //   One-time global init of s_NodeListCacheLock — modeled as a no-op
    //   in the TS port (no threading model). See InitNodeListCache stub.
    // @0x1c90a0: movw $0x0, 0x1b0 — fallbackMode, ditherMode both 0.
    this.fallbackMode = false;
    this.ditherMode = false;
    // @0x1c90a9: fixedPointPrecisionMode = 0.
    this.fixedPointPrecisionMode = false;
    // @0x1c90b0..0x1c90b3: xorps + movups xmm0, 0x198.
    //   The 16 zero bytes cover +0x198..+0x1a8: this includes linkedNodeA
    //   (at +0x1a0). linkedNodeB (+0x1a8) is set to null later @0x1c91e4.
    this.linkedNodeA = null;
    // @0x1c90ba: movq $0x1, 0x1b4 (qword store).
    //   Low u32 = toneQualityMode = 1; high u32 = outputPixelFormat = 0.
    this.toneQualityMode = 1;
    this.outputPixelFormat = 0;
    // @0x1c90c5: movw $0x101, 0x1d8.
    this.premultiplyStateA = true;
    this.premultiplyStateB = true;
    // @0x1c90ce: antiSymmetricToneCurves = 0.
    this.antiSymmetricToneCurves = false;
    // @0x1c90d5: inOut422FilterMode = 1.
    this.inOut422FilterMode = 1;
    // @0x1c90df..0x1c90e9: inOut422FilterRect = _HGRectInfinite.
    this.inOut422FilterRect = [
      _HGRectInfinite[0], _HGRectInfinite[1], _HGRectInfinite[2], _HGRectInfinite[3],
    ];
    // @0x1c90f0: conversionKind = 0xffffffff.
    this.conversionKind = 0xffffffff;
    // @0x1c90fa..0x1c916f: alloc + init pool node.
    this.poolNode = HGColorConform_makePoolNode();
    // @0x1c9176: HGColorConform::ClearConversionParams().
    this.ClearConversionParams();
    // @0x1c917e: movq $0x0, 0x1bc (qword). Low u32 = inputPixelFormat = 0;
    //   high u32 = outputYCbCrFormat = 0.
    this.inputPixelFormat = 0;
    this.outputYCbCrFormat = 0;
    // @0x1c9189..0x1c9191: lut1DScale=2.0f, lut1DOffset=-0.5f
    //   (both f32s from the 8-byte movsd @0x3cf810).
    this.lut1DScale = Math.fround(2.0);
    this.lut1DOffset = Math.fround(-0.5);
    // @0x1c9199..0x1c91ae: block_31c, block_32c initial values.
    this.block_31c = [Math.fround(1.0), Math.fround(1.0), Math.fround(1.0), 0];
    this.block_32c = [0, 0, Math.fround(1.0), Math.fround(1.0)];
    // @0x1c91b5..0x1c91bd: block_33c = {1.0f, 1.0f}.
    this.block_33c = [Math.fround(1.0), Math.fround(1.0)];
    // @0x1c91c5: flag_344 = 1.
    this.flag_344 = true;
    // @0x1c91cc..0x1c91d6: arriLogCExposureIndex=0x320, sonySGamutGain=1.0f.
    this.arriLogCExposureIndex = 0x320;
    this.sonySGamutGain = Math.fround(1.0);
    // @0x1c91dd: sonySGamutBool = 0.
    this.sonySGamutBool = false;
    // @0x1c91e4: linkedNodeB = null.
    this.linkedNodeB = null;
  }

  /**
   * `HGColorConform::~HGColorConform()` — Helium @0x1c9420 (D2 base dtor).
   *   D1 @0x1c94d0 tail-jmps to D2; D0 @0x1c94e0 calls D2 then
   *   HGObject::operator delete.
   *
   * @0x1c9420..0x1c94b7 transcription:
   *   - restore HGColorConform vtable to (leaq 0x86086f(%rip)) — no-op in TS.
   *   - release linkedNodeA (+0x1a0) via vcall *0x18 (HGObject::Release).
   *   - release poolNode  (+0x218) via vcall *0x18.
   *   - acquire s_NodeListCacheLock, release linkedNodeB (+0x1a8) via vcall
   *     *0x18, release the lock.
   *   - tear down shared_weak_count pair at +0x360 (xaddq $-1, +0x8; if
   *     pre-value was 0 -> vcall *0x10 then __shared_weak_count::__release_weak).
   *   - jmp HGNode::~HGNode() (base dtor).
   */
  destroy(): void {
    // @0x1c9434..0x1c9446: release linkedNodeA if non-null (vcall *0x18).
    if (this.linkedNodeA !== null) {
      this.linkedNodeA.Release();
    }
    // @0x1c9446..0x1c9458: release poolNode via vcall *0x18.
    (this.poolNode as HGObject).Release();
    // @0x1c9458..0x1c947c: s_NodeListCacheLock.Lock -> release linkedNodeB -> Unlock.
    HGColorConform_lockNodeListCache();
    if (this.linkedNodeB !== null) {
      this.linkedNodeB.Release();
    }
    HGColorConform_unlockNodeListCache();
    // @0x1c9481..0x1c94b0: shared_weak_count teardown at +0x360.
    //   Frontier — the shared_ptr subsystem is not modeled in this TS port.
    //   No visible effect in the happy path since ctor left the pair {0, 0}.
    // (End: jmp HGNode::~HGNode() — base-class teardown.)
  }

  /**
   * `HGColorConform::ClearConversionParams()` — Helium @0x1c92b0.
   *
   * Resets the "mid-block" state used by all SetConversion overloads back
   * to their defaults, and re-inits the pool node (+0x218) if allocated.
   * Called by the ctor after pool-node alloc, and by every SetConversion(...)
   * overload before writing new conversion fields.
   *
   * Full transcription (55 asm lines) — every write cited by @0xADDR:
   *   @0x1c92ba movaps @0x85ab80, xmm0; movups xmm0, 0x1e8 ; +0x1e8..0x1f8={0,0,8,8}
   *   @0x1c92c8 movl  $0x0, 0x210                          ; logPrimariesFlag=0
   *   @0x1c92d2 xorps xmm0; movups xmm0, 0x1f8             ; +0x1f8..0x208 = 0
   *   @0x1c92dc movl  $-1,%eax; movq %rax, 0x208           ; logLinearization=0xffffffff,
   *                                                          logGamut=0 (%rax zero-extends)
   *   @0x1c92e8 movq  $0x0, 0x228                          ; handleC=0
   *   @0x1c92f3 movaps @0x85ef40, xmm1; movaps xmm1, 0x230 ; block_230
   *   @0x1c9301 movaps @0x85ef50, xmm1; movaps xmm1, 0x240 ; block_240
   *   @0x1c930f movsd  @0x85ef60, xmm1; movsd xmm1, 0x250  ; block_250 (8 bytes)
   *   @0x1c931f movups xmm0, 0x258                         ; block_258=0
   *   @0x1c9326 movups xmm0, 0x268                         ; block_268=0
   *   @0x1c932d movss  @0x3c7cc0, xmm0; movaps xmm0, 0x280 ; block_280={1,0,0,0}
   *   @0x1c933c movsd  @0x3c7cb0, xmm0; movaps xmm0, 0x290 ; block_290={0.0078125, 0.0}
   *   @0x1c934b movaps @0x3caa70, xmm0; movaps xmm0, 0x2a0 ; block_2a0={0,0,1,0}
   *   @0x1c9359 movaps @0x3c9fe0, xmm0; movaps xmm0, 0x2b0 ; block_2b0={0,0,0,1}
   *   @0x1c9367 movb   $0x0, 0x30d                         ; flag_30d=0
   *   @0x1c936e movabsq $0x300000003; movq %rax, 0x310     ; block_310={3,3}
   *   @0x1c937f movl   $0x0, 0x318                         ; field_318=0
   *   @0x1c9389..0x1c93f0: if poolNode != null -> resetPoolNode(poolNode)
   *   @0x1c93f4 movq   $0x0, 0x220                         ; handleB=0
   */
  ClearConversionParams(): void {
    // @0x1c92ba: @0x85ab80 = {u32 0, u32 0, u32 8, u32 8} at +0x1e8..+0x1f8.
    this.gammaSrcPrim = 0;
    this.gammaDstPrim = 0;
    this.gammaSrcTF = 8;
    this.gammaDstTF = 8;
    // @0x1c92c8: logPrimariesFlag = 0.
    this.logPrimariesFlag = 0;
    // @0x1c92d2: xorps + movups xmm0, 0x1f8 — 16 zero bytes cover +0x1f8..+0x208.
    this.gammaSrcMat = 0;
    this.gammaDstMat = 0;
    this.logMatrixCoefficients = 0;
    this.logConversion = 0;
    // @0x1c92dc: movl $-1,%eax (zero-extends %rax to 0x00000000_ffffffff);
    //            movq %rax, 0x208 -> {logLinearization=0xffffffff, logGamut=0}.
    this.logLinearization = 0xffffffff;
    this.logGamut = 0;
    // @0x1c92e8: handleC = 0.
    this.handleC = 0n;
    // @0x1c92f3..0x1c9317: block_230, block_240, block_250 refill.
    this.block_230 = [
      Math.fround(65535.0),
      Math.fround(0.003906309604644775),
      Math.fround(0.003906309604644775),
      Math.fround(1.0),
    ];
    this.block_240 = [
      Math.fround(1.0),
      Math.fround(4096.0),
      Math.fround(2160.0),
      Math.fround(6.719650991726667e-5),
    ];
    this.block_250 = [0x321e8a92, 0x31aaac00];
    // @0x1c931f, @0x1c9326: block_258, block_268 zero.
    this.block_258 = [0, 0, 0, 0];
    this.block_268 = [0, 0, 0, 0];
    // @0x1c932d: block_280 = {1.0f, 0, 0, 0}.
    this.block_280 = [Math.fround(1.0), 0, 0, 0];
    // @0x1c933c: block_290 = {0.0078125, 0.0} f64s.
    this.block_290 = [0.0078125, 0.0];
    // @0x1c934b: block_2a0 = {0, 0, 1.0f, 0}.
    this.block_2a0 = [0, 0, Math.fround(1.0), 0];
    // @0x1c9359: block_2b0 = {0, 0, 0, 1.0f}.
    this.block_2b0 = [0, 0, 0, Math.fround(1.0)];
    // @0x1c9367: flag_30d = 0.
    this.flag_30d = false;
    // @0x1c936e: block_310 = {3, 3}.
    this.block_310 = [3, 3];
    // @0x1c937f: field_318 = 0.
    this.field_318 = 0;
    // @0x1c9389..0x1c93f0: if poolNode != null -> resetPoolNode.
    if (this.poolNode as unknown as HGColorConformPoolNode | null) {
      HGColorConform_resetPoolNode(this.poolNode);
    }
    // @0x1c93f4: handleB = 0.
    this.handleB = 0n;
  }

  /**
   * `HGColorConform::GetDefaultToneQualityMode() const` — Helium @0x1c9230.
   * Body is `pushq %rbp; movq %rsp,%rbp; movl $0x1, %eax; popq %rbp; retq`.
   * Always returns 1.
   */
  GetDefaultToneQualityMode(): HgColorConformToneQuality {
    return 1; // @0x1c9234
  }

  /**
   * `HGColorConform::SetFallbackMode(bool)` — Helium @0x1c9500.
   *   if (fallbackMode == arg) return; ClearBits(); fallbackMode = arg;
   */
  SetFallbackMode(fallback: boolean): void {
    // @0x1c9509: cmpb %bl, 0x1b0(%rdi); je return
    if (this.fallbackMode === fallback) {
      return;
    }
    HGNode_ClearBits(this); // @0x1c9514
    this.fallbackMode = fallback; // @0x1c9519
  }

  /** `HGColorConform::SetDitherMode(bool)` — Helium @0x1ccc50. */
  SetDitherMode(dither: boolean): void {
    // @0x1ccc59: cmpb %bl, 0x1b1(%rdi)
    if (this.ditherMode === dither) {
      return;
    }
    HGNode_ClearBits(this); // @0x1ccc64
    this.ditherMode = dither; // @0x1ccc69
  }

  /** `HGColorConform::SetFixedPointPrecisionMode(bool)` — Helium @0x1ccc80. */
  SetFixedPointPrecisionMode(mode: boolean): void {
    // @0x1ccc89: cmpb %bl, 0x1b2(%rdi)
    if (this.fixedPointPrecisionMode === mode) {
      return;
    }
    HGNode_ClearBits(this); // @0x1ccc94
    this.fixedPointPrecisionMode = mode; // @0x1ccc99
  }

  /** `HGColorConform::SetAntiSymmetricToneCurves(bool)` — Helium @0x1cccb0. */
  SetAntiSymmetricToneCurves(v: boolean): void {
    // @0x1cccb9: cmpb %bl, 0x1da(%rdi)
    if (this.antiSymmetricToneCurves === v) {
      return;
    }
    HGNode_ClearBits(this); // @0x1cccc4
    this.antiSymmetricToneCurves = v; // @0x1cccc9
  }

  /** `HGColorConform::SetInOut422FilterMode(...)` — Helium @0x1c9530. */
  SetInOut422FilterMode(mode: HgColorConformInOut422FilterMode): void {
    // @0x1c9530: cmpl %esi, 0x1c4(%rdi); je return
    if (this.inOut422FilterMode === mode) {
      return;
    }
    HGNode_ClearBits(this); // @0x1c9544
    this.inOut422FilterMode = mode; // @0x1c9549
  }

  /** `HGColorConform::SetInOut422FilterRect(HGRect)` — Helium @0x1c9560.
   *  Note: this overload is UNCONDITIONAL — it always calls ClearBits() and
   *  writes the 16-byte HGRect (no diff-check like the other setters). */
  SetInOut422FilterRect(rect: HGRect): void {
    // @0x1c9573: callq HGNode::ClearBits() — unconditional.
    HGNode_ClearBits(this);
    // @0x1c9578: movq %r14, 0x1c8(%r15); @0x1c957f: movq %rbx, 0x1d0(%r15).
    this.inOut422FilterRect = [rect[0], rect[1], rect[2], rect[3]];
  }

  /** `HGColorConform::SetInputPixelFormat(HGYCbCrFormat)` — Helium @0x1c95a0.
   *  Unconditional (no diff-check) — always ClearBits then write. */
  SetInputPixelFormat(fmt: HGYCbCrFormat): void {
    // @0x1c95ac: callq HGNode::ClearBits() — unconditional.
    HGNode_ClearBits(this);
    // @0x1c95b1: movl %ebx, 0x1bc(%r14).
    this.inputPixelFormat = fmt;
  }

  /** `HGColorConform::SetOutputPixelFormat(HGFormat, HGYCbCrFormat)`
   *  — Helium @0x1c95c0. Unconditional — two u32 writes after ClearBits. */
  SetOutputPixelFormat(fmt: HGFormat, yuvFmt: HGYCbCrFormat): void {
    // @0x1c95d2: callq HGNode::ClearBits().
    HGNode_ClearBits(this);
    // @0x1c95d7: movl %r14d, 0x1b8(%r15).
    this.outputPixelFormat = fmt;
    // @0x1c95de: movl %ebx, 0x1c0(%r15).
    this.outputYCbCrFormat = yuvFmt;
  }

  /** `HGColorConform::SetPremultiplyState(bool, bool)` — Helium @0x1c95f0.
   *  Two independent guarded writes at +0x1d8 / +0x1d9. */
  SetPremultiplyState(a: boolean, b: boolean): void {
    // @0x1c9602: cmpb %r15b, 0x1d8(%rdi)
    if (this.premultiplyStateA !== a) {
      HGNode_ClearBits(this); // @0x1c960e
      this.premultiplyStateA = a; // @0x1c9613
    }
    // @0x1c961a: cmpb %bl, 0x1d9(%r14)
    if (this.premultiplyStateB !== b) {
      HGNode_ClearBits(this); // @0x1c9626
      this.premultiplyStateB = b; // @0x1c962b
    }
  }

  /**
   * `HGColorConform::Set1DLutScaleAndOffset(float, float)` — Helium @0x1c9640.
   *
   *   Two independent f32-diff-guarded writes via `ucomiss` + `jne/jnp`. That
   *   x86 idiom fires when the two f32s differ OR either is NaN. In TS we
   *   emulate it with `!==` on the fround'd values plus explicit NaN checks
   *   (JS's `NaN !== NaN` gives true, matching the "unordered" fallthrough).
   */
  Set1DLutScaleAndOffset(scale: number, offset: number): void {
    const s = Math.fround(scale);
    const o = Math.fround(offset);
    // @0x1c9649..0x1c9674: guarded write to lut1DScale.
    if (
      Math.fround(this.lut1DScale) !== s ||
      Number.isNaN(this.lut1DScale) ||
      Number.isNaN(s)
    ) {
      HGNode_ClearBits(this); // @0x1c9665
      this.lut1DScale = s; // @0x1c9674
    }
    // @0x1c967c..0x1c9698: guarded write to lut1DOffset.
    if (
      Math.fround(this.lut1DOffset) !== o ||
      Number.isNaN(this.lut1DOffset) ||
      Number.isNaN(o)
    ) {
      HGNode_ClearBits(this); // @0x1c968e
      this.lut1DOffset = o; // @0x1c9698
    }
  }

  /** `HGColorConform::SetToneQualityMode(hgColorConformToneQuality)`
   *  — Helium @0x1c9db0. Guarded write to +0x1b4. */
  SetToneQualityMode(mode: HgColorConformToneQuality): void {
    // @0x1c9db0: cmpl %esi, 0x1b4(%rdi); je return
    if (this.toneQualityMode === mode) {
      return;
    }
    HGNode_ClearBits(this); // @0x1c9dc4
    this.toneQualityMode = mode; // @0x1c9dc9
  }

  /** `HGColorConform::SetARRILogCExposureIndex(unsigned int)`
   *  — Helium @0x1c9de0. Guarded write to +0x348. */
  SetARRILogCExposureIndex(idx: number): void {
    // @0x1c9de0: cmpl %esi, 0x348(%rdi); je return
    if (this.arriLogCExposureIndex === idx) {
      return;
    }
    HGNode_ClearBits(this); // @0x1c9df4
    this.arriLogCExposureIndex = idx >>> 0; // @0x1c9df9 (u32)
  }

  /**
   * `HGColorConform::SetSonySGamutGainAndMatrix(float, bool)`
   *   — Helium @0x1c9e10.
   *
   *   The systemic-unblock method: every Sony-camera-log processing-info
   *   class calls this to install the S-Gamut -> S-Gamut3 matrix scale.
   *
   *   Two independent guarded writes:
   *     f32 gain @+0x34c   (ucomiss/jne/jnp — same pattern as Set1DLut...)
   *     bool     @+0x350   (cmpb/je)
   */
  SetSonySGamutGainAndMatrix(gain: number, useMatrix: boolean): void {
    const g = Math.fround(gain);
    // @0x1c9e20: movss 0x34c(%rdi), xmm1; ucomiss xmm0(=g), xmm1; jne/jnp.
    if (
      Math.fround(this.sonySGamutGain) !== g ||
      Number.isNaN(this.sonySGamutGain) ||
      Number.isNaN(g)
    ) {
      HGNode_ClearBits(this); // @0x1c9e37
      this.sonySGamutGain = g; // @0x1c9e41
    }
    // @0x1c9e4a: cmpb %bl, 0x350(%r14); je return.
    if (this.sonySGamutBool !== useMatrix) {
      HGNode_ClearBits(this); // @0x1c9e56
      this.sonySGamutBool = useMatrix; // @0x1c9e5b
    }
  }

  /**
   * `HGColorConform::SetREDRAWConversion()` — Helium @0x1ccb40.
   *   Unconditional ClearBits(); conversionKind = 0x16 (=22, RED-RAW);
   *   ClearConversionParams(); returns true.
   */
  SetREDRAWConversion(): boolean {
    HGNode_ClearBits(this); // @0x1ccb49
    this.conversionKind = 0x16; // @0x1ccb4e
    this.ClearConversionParams(); // @0x1ccb5b
    return true; // @0x1ccb60: movb $0x1, %al
  }

  /**
   * `HGColorConform::SetConversion(hgColorConformConversionPreset)`
   *   — Helium @0x1cc5d0.
   *
   *   Preset -> kind sanitizer + kind-write. Given a preset u32 arg, the
   *   sanitizer collapses several preset ranges to kind=0:
   *
   *     kind := arg
   *     if ((arg & ~1) == 0x16)   kind := 0     ; RED-RAW pair (0x16, 0x17)
   *     if ((arg - 1) < 4)        kind := 0     ; 1..4
   *     if (arg == 0x18)          kind := 0     ; 24
   *     if (arg == 5)             kind := 0     ; 5
   *
   *   Then: if (conversionKind == kind) return true; else ClearBits();
   *   conversionKind = kind; ClearConversionParams(); return true.
   */
  SetConversionPreset(preset: HGColorConformConversionPreset): boolean {
    // @0x1cc5d7..0x1cc5df: eax = preset & ~1; ecx = 0.
    const maskedPair = preset & ~1;
    // @0x1cc5e1..0x1cc5e4: r14d = preset; if eax==0x16 -> r14d = 0 (cmovel).
    let kind = preset >>> 0;
    if (maskedPair === 0x16) {
      kind = 0;
    }
    // @0x1cc5e8..0x1cc5ee: if (preset - 1) < 4 (unsigned) -> kind = 0.
    const dec = (preset - 1) >>> 0;
    if (dec < 4) {
      kind = 0;
    }
    // @0x1cc5f2..0x1cc5f5: if preset == 0x18 -> kind = 0.
    if (preset === 0x18) {
      kind = 0;
    }
    // @0x1cc5f9..0x1cc5fc: if preset == 5 -> kind = 0.
    if (preset === 5) {
      kind = 0;
    }
    // @0x1cc600: cmpl %r14d, 0x1e4(%rdi); je return true.
    if (this.conversionKind === kind) {
      return true; // @0x1cc620: movb $0x1, %al
    }
    // @0x1cc60c: HGNode::ClearBits().
    HGNode_ClearBits(this);
    // @0x1cc611: conversionKind = kind.
    this.conversionKind = kind;
    // @0x1cc61b: ClearConversionParams.
    this.ClearConversionParams();
    // @0x1cc620: movb $0x1, %al.
    return true;
  }

  /**
   * `HGColorConform::SetConversion(primSrc, tfSrc, matSrc, primDst, tfDst, matDst)`
   *   — Helium @0x1cc630. Gamma-src/dst overload.
   *
   *   Arg passing (x86_64 SysV):
   *     esi=primSrc, edx=tfSrc, ecx=matSrc, r8d=primDst, r9d=tfDst,
   *     [rbp+0x10]=matDst   (last 32-bit arg spilled to stack).
   *
   *   Control flow:
   *     1. Fast-path early return: if conversionKind == 1 AND all six
   *        already match -> return true.
   *     2. HGColorGamma::TestConversion(primSrc, tfSrc, matSrc,
   *                                     primDst, tfDst, matDst).
   *        If true -> "matched" tail: ClearBits, kind=1, ClearConversion,
   *        write six fields, return true.
   *     3. Else HGColorGamma::TestConversion(primSrc, tfSrc, matSrc,
   *                                          primDst, tf=8, mat=0).
   *        If that returns true, TestConversion(primDst, 8, 0, primDst,
   *        tfDst, matDst). If BOTH true -> same "matched" tail.
   *     4. Otherwise no-hit: if conversionKind != 0, ClearBits, kind=0,
   *        ClearConversion, return false.
   *
   *   Field-write order (matched tail):
   *     +0x1e8=primSrc  +0x1ec=primDst  +0x1f0=tfSrc  +0x1f4=tfDst
   *     +0x1f8=matSrc   +0x1fc=matDst
   *
   *   NOTE: HGColorGamma::TestConversion is a frontier; until it lands,
   *   this method throws at the first TestConversion callsite for any
   *   input that doesn't hit the fast-path early return. That is the
   *   correct decode-don't-fit behavior.
   */
  SetConversionGamma(
    primSrc: HGColorGammaColorPrimaries,
    tfSrc: HGColorGammaTransferFunction,
    matSrc: HGColorGammaMatrixCoefficients,
    primDst: HGColorGammaColorPrimaries,
    tfDst: HGColorGammaTransferFunction,
    matDst: HGColorGammaMatrixCoefficients,
  ): boolean {
    // @0x1cc651..0x1cc690: fast-path early return.
    if (
      this.conversionKind === 1 &&
      this.gammaSrcPrim === primSrc &&
      this.gammaSrcTF === tfSrc &&
      this.gammaSrcMat === matSrc &&
      this.gammaDstPrim === primDst &&
      this.gammaDstTF === tfDst &&
      this.gammaDstMat === matDst
    ) {
      return true; // @0x1cc687: movb $0x1, %al
    }
    // @0x1cc6ac: HGColorGamma::TestConversion(primSrc,tfSrc,matSrc, primDst,tfDst,matDst).
    let hit = HGColorGamma_TestConversion(primSrc, tfSrc, matSrc, primDst, tfDst, matDst);
    if (!hit) {
      // @0x1cc701..0x1cc716: retry with (..., primDst, tf=8, mat=0).
      const inner1 = HGColorGamma_TestConversion(primSrc, tfSrc, matSrc, primDst, 8, 0);
      if (inner1) {
        // @0x1cc71f..0x1cc734: TestConversion(primDst, 8, 0, primDst, tfDst, matDst).
        const inner2 = HGColorGamma_TestConversion(primDst, 8, 0, primDst, tfDst, matDst);
        if (inner2) {
          hit = true;
        }
      }
    }
    if (hit) {
      // @0x1cc6b5..0x1cc6f4: shared "matched" tail.
      HGNode_ClearBits(this);
      this.conversionKind = 1;
      this.ClearConversionParams();
      this.gammaSrcPrim = primSrc; // @0x1cc6cf
      this.gammaSrcTF = tfSrc; // @0x1cc6d6
      this.gammaSrcMat = matSrc; // @0x1cc6dd
      this.gammaDstPrim = primDst; // @0x1cc6e4
      this.gammaDstTF = tfDst; // @0x1cc6eb..0x1cc6ee
      this.gammaDstMat = matDst; // @0x1cc6f4..0x1cc6f7
      return true; // @0x1cc6fd
    }
    // @0x1cc741..0x1cc764: no-hit tail — kind -> 0 if not already.
    if (this.conversionKind !== 0) {
      HGNode_ClearBits(this);
      this.conversionKind = 0;
      this.ClearConversionParams();
    }
    // @0x1cc764: xorl %eax, %eax -> return false.
    return false;
  }

  /**
   * `HGColorConform::SetConversion(mat, logConversion, primaries)`
   *   — Helium @0x1cc780. Log-conversion overload.
   *
   *   Fast-path if conversionKind==2 AND all three match. Otherwise:
   *   ClearBits; kind=2; ClearConversion; write. Always returns true.
   *
   *   Field writes:
   *     +0x200 = mat, +0x204 = logConversion, +0x210 = primaries
   *
   *   NOTE: the disasm writes the raw `primaries` enum into the field at
   *   +0x210, overwriting logPrimariesFlag with the raw primaries value.
   *   This differs from the LogLinearize overload (which writes 3*bool).
   */
  SetConversionLog(
    mat: HGColorGammaMatrixCoefficients,
    logConv: HGColorConformLogConversion,
    primaries: HGColorGammaColorPrimaries,
  ): boolean {
    // @0x1cc796..0x1cc7b8: fast-path.
    if (
      this.conversionKind === 2 &&
      this.logMatrixCoefficients === mat &&
      this.logConversion === logConv &&
      this.logPrimariesFlag === primaries
    ) {
      return true; // @0x1cc7ea
    }
    // @0x1cc7bd: ClearBits.
    HGNode_ClearBits(this);
    // @0x1cc7c2: conversionKind = 2.
    this.conversionKind = 2;
    // @0x1cc7d0: ClearConversionParams.
    this.ClearConversionParams();
    // @0x1cc7d5: +0x200 = mat.
    this.logMatrixCoefficients = mat;
    // @0x1cc7dc: +0x204 = logConv.
    this.logConversion = logConv;
    // @0x1cc7e3: +0x210 = primaries.
    this.logPrimariesFlag = primaries;
    // @0x1cc7ea: return true.
    return true;
  }

  /**
   * `HGColorConform::SetConversion(mat, logLinearization, logGamut, primaries)`
   *   — Helium @0x1cc800. Log-linearization overload.
   *
   *   Pre-computes: `primariesFlag := (primaries != 0) ? 3 : 0`
   *   (setne %al; leal (%rax,%rax,2) is `3*bool`).
   *
   *   Fast-path if conversionKind==3 AND all four target fields match.
   *   Otherwise: ClearBits; kind=3; ClearConversion; write. Always true.
   *
   *   Field writes:
   *     +0x200 = mat, +0x208 = logLin, +0x20c = logGamut, +0x210 = 3*primFlag.
   */
  SetConversionLogLinearize(
    mat: HGColorGammaMatrixCoefficients,
    logLin: HGColorConformLogLinearization,
    logGamut: HGColorGammaLogGamut,
    primaries: HGColorGammaColorPrimaries,
  ): boolean {
    // @0x1cc81b..0x1cc821: setne %al; leal (%rax,%rax,2), %r13d.
    const primariesFlag = primaries !== 0 ? 3 : 0;
    // @0x1cc825..0x1cc850: fast-path.
    if (
      this.conversionKind === 3 &&
      this.logMatrixCoefficients === mat &&
      this.logLinearization === logLin &&
      this.logGamut === logGamut &&
      this.logPrimariesFlag === primariesFlag
    ) {
      return true; // @0x1cc889
    }
    // @0x1cc855: ClearBits.
    HGNode_ClearBits(this);
    // @0x1cc85a: conversionKind = 3.
    this.conversionKind = 3;
    // @0x1cc868: ClearConversionParams.
    this.ClearConversionParams();
    // @0x1cc86d: +0x200 = mat.
    this.logMatrixCoefficients = mat;
    // @0x1cc874: +0x208 = logLin.
    this.logLinearization = logLin;
    // @0x1cc87b: +0x20c = logGamut.
    this.logGamut = logGamut;
    // @0x1cc882: +0x210 = primariesFlag.
    this.logPrimariesFlag = primariesFlag;
    // @0x1cc889: return true.
    return true;
  }

  // ───────────────────────────────────────────────────────────────────────
  // Frontier methods — bodies too large to transcribe in this initial port.
  // Each throws citing its @0xADDR so the anti-shortcut gate detects the gap.

  /** `HGColorConform::SetLook3DLutConversion(matCoeffs, primIn, tfIn, primOut,
   *  CFData*, u64, u64, u64, f32, f32, f32, bool, hgLookLUTEndian, u8*, u64,
   *  f32, f32, f32, f32)` — Helium @0x1c9720. 77 asm lines. */
  SetLook3DLutConversion_A(): void {
    throw new Error(
      "HGColorConform::SetLook3DLutConversion(matCoeffs, primIn, tfIn, primOut, CFData*, u64, u64, u64, f32, f32, f32, bool, hgLookLUTEndian, u8*, u64, f32, f32, f32, f32) @Helium 0x1c9720 not yet transcribed",
    );
  }

  /** `HGColorConform::SetLook3DLutConversion(HGColorConformLook3DLUT*,
   *  matCoeffs, primaries)` — Helium @0x1c9850. 38 asm lines. */
  SetLook3DLutConversion_B(): void {
    throw new Error(
      "HGColorConform::SetLook3DLutConversion(HGColorConformLook3DLUT*, matCoeffs, primaries) @Helium 0x1c9850 not yet transcribed",
    );
  }

  /** `HGColorConform::SetLookCDL(float*, float*, float*, float)`
   *  — Helium @0x1c98d0. 72 asm lines. */
  SetLookCDL(): void {
    throw new Error(
      "HGColorConform::SetLookCDL(float*, float*, float*, float) @Helium 0x1c98d0 not yet transcribed",
    );
  }

  /** `HGColorConform::Prep3DLUTBitmap(HGRenderer*, const u8*, u64, u64, u64,
   *  bool, hgLookLUTEndian)` — Helium @0x1c99f0. 254 asm lines. */
  Prep3DLUTBitmap(): void {
    throw new Error(
      "HGColorConform::Prep3DLUTBitmap(HGRenderer*, const u8*, u64, u64, u64, bool, hgLookLUTEndian) @Helium 0x1c99f0 not yet transcribed",
    );
  }

  /** `HGColorConform::CreateColorGammaNode() const` — Helium @0x1c9e70. 25 lines. */
  CreateColorGammaNode(): HGNode {
    throw new Error(
      "HGColorConform::CreateColorGammaNode() const @Helium 0x1c9e70 not yet transcribed",
    );
  }

  /** `HGColorConform::PrepareOutputNode(HGRenderer*, HGRect, HGFormat)`
   *  — Helium @0x1c9ec0. */
  PrepareOutputNode(): void {
    throw new Error(
      "HGColorConform::PrepareOutputNode(HGRenderer*, HGRect, HGFormat) @Helium 0x1c9ec0 not yet transcribed",
    );
  }

  /** `HGColorConform::SetConversion(CGColorSpace*, CGColorSpace*)`
   *  — Helium @0x1c9ee0. 93 asm lines — CGColorSpace -> ColorSyncProfile forward. */
  SetConversionCGColorSpace(): void {
    throw new Error(
      "HGColorConform::SetConversion(CGColorSpace*, CGColorSpace*) @Helium 0x1c9ee0 not yet transcribed",
    );
  }

  /** `HGColorConform::CreateColorSyncProfileFromCGColorSpace(CGColorSpace*)`
   *  — Helium @0x1ca000. */
  CreateColorSyncProfileFromCGColorSpace(): void {
    throw new Error(
      "HGColorConform::CreateColorSyncProfileFromCGColorSpace(CGColorSpace*) @Helium 0x1ca000 not yet transcribed",
    );
  }

  /** `HGColorConform::SetConversion(ColorSyncProfile*, ColorSyncProfile*)`
   *  — Helium @0x1ca040. 101 asm lines. */
  SetConversionColorSyncProfile(): void {
    throw new Error(
      "HGColorConform::SetConversion(ColorSyncProfile*, ColorSyncProfile*) @Helium 0x1ca040 not yet transcribed",
    );
  }

  /** `HGColorConform::SetConversionStatic(CGColorSpace*, CGColorSpace*, ...)`
   *  — Helium @0x1ca1a0. 119 asm lines. */
  SetConversionStatic_CG(): void {
    throw new Error(
      "HGColorConform::SetConversionStatic(CGColorSpace*, CGColorSpace*, HGColorConformNodeListCacheItem**) @Helium 0x1ca1a0 not yet transcribed",
    );
  }

  /** `HGColorConform::SetConversionStatic(ColorSyncProfile*, ColorSyncProfile*, ...)`
   *  — Helium @0x1ca330. */
  SetConversionStatic_CSP(): void {
    throw new Error(
      "HGColorConform::SetConversionStatic(ColorSyncProfile*, ColorSyncProfile*, HGColorConformNodeListCacheItem**) @Helium 0x1ca330 not yet transcribed",
    );
  }

  /** `HGColorConform::TestConversionStatic(CGColorSpace*, CGColorSpace*)`
   *  — Helium @0x1ca3f0. */
  TestConversionStatic(): void {
    throw new Error(
      "HGColorConform::TestConversionStatic(CGColorSpace*, CGColorSpace*) @Helium 0x1ca3f0 not yet transcribed",
    );
  }

  /** `HGColorConform::DecodeFragmentList(ColorSyncProfile*, ColorSyncProfile*,
   *  HGColorConformNodeListCacheItem**, bool)` — Helium @0x1ca480. 1787 lines. */
  DecodeFragmentList(): void {
    throw new Error(
      "HGColorConform::DecodeFragmentList(ColorSyncProfile*, ColorSyncProfile*, HGColorConformNodeListCacheItem**, bool) @Helium 0x1ca480 not yet transcribed",
    );
  }

  /** `HGColorConform::SetRAWConversion(...)` — Helium @0x1cc8a0. 141 lines. */
  SetRAWConversion(): void {
    throw new Error(
      "HGColorConform::SetRAWConversion(u32, u32, u32, u32, f32, f32, u32, u32, float[3][3]*, primaries, f32, GDCParameters, primaries, f32, f32, const float*, hgColorConformRAWToLogEncoding) @Helium 0x1cc8a0 not yet transcribed",
    );
  }

  /** `HGColorConform::SetRAWPluginConversion(...)` — Helium @0x1ccb70. */
  SetRAWPluginConversion(): void {
    throw new Error(
      "HGColorConform::SetRAWPluginConversion(hgColorConformConversionPreset, shared_ptr<HGRAWRendererBase>, hgColorConformRAWToLogEncoding) @Helium 0x1ccb70 not yet transcribed",
    );
  }

  /** `HGColorConform::ConvertRGBAColor(CGColorSpace*, CGColorSpace*, vector<float>&)`
   *  — Helium @0x1ccce0. Tail-jmps to ConvertRGBColor. */
  ConvertRGBAColor(): void {
    throw new Error(
      "HGColorConform::ConvertRGBAColor(CGColorSpace*, CGColorSpace*, vector<float>&) @Helium 0x1ccce0 not yet transcribed",
    );
  }

  /** `HGColorConform::ConvertRGBColor(CGColorSpace*, CGColorSpace*, vector<float>&)`
   *  — Helium @0x1cccf0. 593 lines. */
  ConvertRGBColor(): void {
    throw new Error(
      "HGColorConform::ConvertRGBColor(CGColorSpace*, CGColorSpace*, vector<float>&) @Helium 0x1cccf0 not yet transcribed",
    );
  }

  /** `HGColorConform::GetOutput(HGRenderer*)` — Helium @0x1cd710. 96 lines. */
  GetOutput(): void {
    throw new Error(
      "HGColorConform::GetOutput(HGRenderer*) @Helium 0x1cd710 not yet transcribed",
    );
  }

  /** `HGColorConform::CreateColorConformHeliumGraph(HGRenderer*, preset)`
   *  — Helium @0x1cd890. 1610 lines. */
  CreateColorConformHeliumGraph_preset(): void {
    throw new Error(
      "HGColorConform::CreateColorConformHeliumGraph(HGRenderer*, hgColorConformConversionPreset) @Helium 0x1cd890 not yet transcribed",
    );
  }

  /** `HGColorConform::CreateColorConformHeliumGraph(HGRenderer*)`
   *  — Helium @0x1cf2e0. 1317 lines. */
  CreateColorConformHeliumGraph(): void {
    throw new Error(
      "HGColorConform::CreateColorConformHeliumGraph(HGRenderer*) @Helium 0x1cf2e0 not yet transcribed",
    );
  }

  /** `HGColorConform::ProcessParamState(ParamGatheringStateEnum*, int)`
   *  — Helium @0x1d0920. */
  ProcessParamState(): void {
    throw new Error(
      "HGColorConform::ProcessParamState(ParamGatheringStateEnum*, int) @Helium 0x1d0920 not yet transcribed",
    );
  }

  /** `HGColorConform::GetNodeListFromCache(...)` — Helium @0x1d09d0. */
  GetNodeListFromCache(): void {
    throw new Error(
      "HGColorConform::GetNodeListFromCache(ColorSyncProfile*, ColorSyncProfile*, HGColorConformNodeListCacheItem**) @Helium 0x1d09d0 not yet transcribed",
    );
  }

  /** `HGColorConform::AddNodeListToCache(...)` — Helium @0x1d0e20. */
  AddNodeListToCache(): void {
    throw new Error(
      "HGColorConform::AddNodeListToCache(ColorSyncProfile*, ColorSyncProfile*, vector<HGColorConformNodeListItem*>*) @Helium 0x1d0e20 not yet transcribed",
    );
  }

  /** `HGColorConform::DeleteNodeList(vector<HGColorConformNodeListItem*>**)`
   *  — Helium @0x1d1050. */
  DeleteNodeList(): void {
    throw new Error(
      "HGColorConform::DeleteNodeList(vector<HGColorConformNodeListItem*>**) @Helium 0x1d1050 not yet transcribed",
    );
  }

  /** `HGColorConform::InitNodeListCache()` — Helium @0x1d1110. Called once
   *  via `_pthread_once` from the ctor. */
  static InitNodeListCache(): void {
    throw new Error(
      "HGColorConform::InitNodeListCache() @Helium 0x1d1110 not yet transcribed",
    );
  }

  /** `HGColorConform::DeleteNodeListCache()` — Helium @0x1d11a0. */
  static DeleteNodeListCache(): void {
    throw new Error(
      "HGColorConform::DeleteNodeListCache() @Helium 0x1d11a0 not yet transcribed",
    );
  }

  /** `HGColorConform::KeyFromColorSpaceTransform(ColorSyncProfile*, ColorSyncProfile*)`
   *  — Helium @0x1d12a0. */
  static KeyFromColorSpaceTransform(): void {
    throw new Error(
      "HGColorConform::KeyFromColorSpaceTransform(ColorSyncProfile*, ColorSyncProfile*) @Helium 0x1d12a0 not yet transcribed",
    );
  }
}
