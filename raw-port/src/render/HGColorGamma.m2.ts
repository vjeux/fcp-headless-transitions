// raw-port: HGColorGamma (chunk m2) — Helium.framework (render layer)
//
// Framework binary: /Applications/Final Cut Pro.app/Contents/Frameworks/Helium.framework/
//   Versions/A/Helium (x86_64 slice; VA == offset within thin slice).
// This chunk ports methods [40..60) of the 84-method HGColorGamma class:
//   40 m_GetChromaDownsampleF1Node                           @0x00000000000fa130
//   41 m_Get2vuy_YXZXCollapseNode                            @0x00000000000fa1a0
//   42 m_Get2vuy_XYXZCollapseNode                            @0x00000000000fa210
//   43 m_Getv210_YXZXCollapseNode(HGRenderer*)                @0x00000000000fa280
//   44 m_Getv216_YXZXCollapseNode                            @0x00000000000fa2e0
//   45 m_GetPixelFormatConversion_kV4B10Bit_BE_OutputNode    @0x00000000000fa350
//   46 m_GetPixelFormatConversion_kV4S_BE_WXYZ_OutputNode    @0x00000000000fa3c0
//   47 m_GetPixelFormatConversion_kV4B_WXYZ_OutputNode       @0x00000000000fa430
//   48 m_GetPixelFormatConversion_kV4S_WXYZ_OutputNode       @0x00000000000fa4a0
//   49 m_GetPixelFormatConversion_kV4F_WXYZ_OutputNode       @0x00000000000fa510
//   50 CanLoadData(HGFormat)                                 @0x00000000000fa580
//   51 LoadMacroNodeParams()                                 @0x00000000000fb020
//   52 unpremultiplyShouldSanitizeAndClampUsingReturned(f32&) @0x00000000000fb210
//   53 PrepareOutputNode(HGRenderer*, HGRect, HGFormat)      @0x00000000000fb2b0
//   54 label_B() const                                       @0x00000000000fb2d0
//   55 SetParameter(int, float, float, float, float)         @0x00000000000fb2f0
//   56 SetFallbackMode(bool)                                 @0x00000000000fb300
//   57 SetToneQualityMode(hgColorGammaToneQuality)           @0x00000000000fb330
//   58 SetInOut422FilterMode(hgColorGammaInOut422FilterMode) @0x00000000000fb360
//   59 SetInOut422FilterRect(HGRect)                         @0x00000000000fb390
//
// DECODE: raw-port/re/disasm/Helium.HGColorGamma.<method>.s (one .s per method).
//
// PATTERN. All 10 lazy getters (methods 40..49) follow the exact m1 template:
//   if (self.slot != nullptr) return self.slot;
//   p = HGObject::operator new(sz);          sz = 0x1a0 or 0x200 (see per-method)
//   [optional] ___bzero(p, sz);              9 of 10 do bzero (the v210 collapse skips it — like m1's v210)
//   <SubNodeClass>::<C2>(p);                 leaf ctor (SysV: single %rdi=this arg)
//   *(void**)p = &<vtable>+0x10;             vtable install (all 10 do this)
//   self.slot = p;                           store back into the cache
//   return p;
// The v210 collapse (m_Getv210_YXZXCollapseNode) takes a HGRenderer* arg but does NOT use it
// in the C++ body — the caller passes it for interface parity; the disasm never touches %rsi.
//
// LAYOUT ADDITIONS RECOVERED IN THIS CHUNK (all `HGNode*` unless noted).
//   +0x1f8  outputConversion_kV4B_WXYZ           HgcPixelFormatConversion_kV4B_WXYZ_output*    sz=0x200 (@fa46e / vtable install +0x91_c3b)
//   +0x200  outputConversion_kV4S_WXYZ           HgcPixelFormatConversion_kV4S_WXYZ_output*    sz=0x200
//   +0x208  outputConversion_kV4F_WXYZ           HgcPixelFormatConversion_kV4F_WXYZ_output*    sz=0x200
//   +0x230  outputConversion_kV4S_BE_WXYZ        HgcPixelFormatConversion_kV4S_BE_WXYZ_output* sz=0x1a0
//   +0x238  outputConversion_kV4B10Bit_BE        HgcPixelFormatConversion_kV4B10Bit_BE_output* sz=0x1a0
//   +0x250  chromaDownsampleF1                   HgcColorGamma_chroma_downsample_f1*           sz=0x1a0
//   +0x260  collapse_2vuy_YXZX                   HgcColorGamma_2vuy_yxzx_collapse*             sz=0x1a0
//   +0x268  collapse_2vuy_XYXZ                   HgcColorGamma_2vuy_xyxz_collapse*             sz=0x1a0
//   +0x270  collapse_v216_YXZX                   HgcColorGamma_v216_yxzx_collapse*             sz=0x1a0
//   +0x278  collapse_v210_YXZX                   HgcColorGamma_v210_yxzx_rgba_collapse*        sz=0x1a0 (NO bzero)
//   +0x2e9  bit uint8 dirtyFlag                  set to 1 by every Set* that invalidates the graph
//   +0x400  uint8  fallbackMode                  written by SetFallbackMode
//   +0x40c  uint32 inOut422FilterMode            written by SetInOut422FilterMode; PrepareOutputNode gates on ==1
//   +0x410  double inOut422FilterRect.lo         packed HGRect: SetInOut422FilterRect writes both u64s
//   +0x418  double inOut422FilterRect.hi
//   +0x430  f32x4  matrix1ColumnScales           broadcast scale used by LoadMacroNodeParams for matrix1
//   +0x440  f32x4  matrix2Shuffle                per-column shuffle (0xc0/0xd5/0xea/0xff) applied for matrix2
//   +0x490  uint32 toneQualityMode               written by SetToneQualityMode
//
// ── Frontier callees (loud throw citing @0xADDR — Spec Rule 3) ─────────────────────
//   HGObject::operator new(unsigned long)              @0xfa14e (and every getter head)
//   HGObject::operator delete(void*)                   @0xfa193 (unwind edges)
//   ___bzero (libSystem stub)                          @0x3c4fca (via disasm stub)
//   __Unwind_Resume (libSystem stub)                   @0x3c4e02
//   HGNode::ClearBits()                                @0xfb30c (SetFallbackMode/SetToneQualityMode/SetInOut422FilterMode)
//   HGColorMatrix::HGColorMatrix()                     @0xfb0d8 / @0xfb1a7
//   HGColorMatrix::LoadMatrix(float vector[4] const*, bool)  @0xfb0f0 / @0xfb1bf
//   HgcColorGamma_chroma_downsample_f1::C2             @0xfa169
//   HgcColorGamma_2vuy_yxzx_collapse::C2                @0xfa1d9
//   HgcColorGamma_2vuy_xyxz_collapse::C2                @0xfa249
//   HgcColorGamma_v210_yxzx_rgba_collapse::C2           @0xfa2ab
//   HgcColorGamma_v216_yxzx_collapse::C2                @0xfa319
//   HgcPixelFormatConversion_kV4B10Bit_BE_output::C2   @0xfa389
//   HgcPixelFormatConversion_kV4S_BE_WXYZ_output::C2   @0xfa3f9
//   HgcPixelFormatConversion_kV4B_WXYZ_output::C2      @0xfa469
//   HgcPixelFormatConversion_kV4S_WXYZ_output::C2      @0xfa4d9
//   HgcPixelFormatConversion_kV4F_WXYZ_output::C2      @0xfa549
//   ___stack_chk_fail                                  @0x3c5030 (LoadMacroNodeParams tail)

import type {
  HGColorGammaM1,
  HGCColorGammaChromaUpsampleF1Opaque,  // reused as _downsample_f1 shape (opaque)
} from "./HGColorGamma.m1";

// ── Sub-node opaque handles unique to this chunk ─────────────────────────────────────
// Each corresponds to a distinct C++ leaf class (own vtable + own C2 ctor). Kept as
// opaque brands so downstream files can only pass/return them, never fabricate them.
export interface HgcColorGamma_chroma_downsample_f1_Opaque   { readonly __hgcdf1: unique symbol; }
export interface HgcColorGamma_2vuy_yxzx_collapse_Opaque      { readonly __hgc2yc: unique symbol; }
export interface HgcColorGamma_2vuy_xyxz_collapse_Opaque      { readonly __hgc2xc: unique symbol; }
export interface HgcColorGamma_v210_yxzx_rgba_collapse_Opaque { readonly __hgcv210c: unique symbol; }
export interface HgcColorGamma_v216_yxzx_collapse_Opaque      { readonly __hgcv216c: unique symbol; }
export interface HgcPixelFormatConversion_kV4B10Bit_BE_output_Opaque { readonly __hgcp4b10be: unique symbol; }
export interface HgcPixelFormatConversion_kV4S_BE_WXYZ_output_Opaque { readonly __hgcp4sbe: unique symbol; }
export interface HgcPixelFormatConversion_kV4B_WXYZ_output_Opaque    { readonly __hgcp4b: unique symbol; }
export interface HgcPixelFormatConversion_kV4S_WXYZ_output_Opaque    { readonly __hgcp4s: unique symbol; }
export interface HgcPixelFormatConversion_kV4F_WXYZ_output_Opaque    { readonly __hgcp4f: unique symbol; }
// HGRenderer — carried through m_Getv210_YXZXCollapseNode's signature (unused in body).
export interface HGRendererOpaqueM2 { readonly __hgrm2: unique symbol; }
// HGColorMatrix / HGRect / HGFormat — used by LoadMacroNodeParams / PrepareOutputNode / CanLoadData.
export interface HGColorMatrixLM_Opaque { readonly __hgcmlm: unique symbol; }
/**
 * HGRect: 16-byte value (two f64s, or two v2f32 packed). SysV ABI passes it by value
 * in two 8-byte GPRs (rsi:rdx), which is exactly what SetInOut422FilterRect stores at
 * +0x410 and +0x418 verbatim (movq %rsi,0x410(%rdi); movq %rdx,0x418(%rdi)). We model
 * it as two opaque u64s so downstream ports can decode the payload from CGRect
 * conventions without us guessing byte order here.
 */
export interface HGRectValue { readonly lo: bigint; readonly hi: bigint; }
/**
 * HGFormat: value-type struct passed by value to CanLoadData. The decode is not needed
 * at the boundary here — the method body is deferred (see note below), and the SysV
 * lowering passes it in %rsi (int-lowered enum). We keep the parameter type opaque.
 */
export interface HGFormatValue { readonly __hgfmt: unique symbol; }
/**
 * hgColorGammaToneQuality — enum (uint32). No named values decoded in this chunk (SetTone
 * only writes the raw int at +0x490 with no dispatch on the value).
 */
export type HgColorGammaToneQuality = number;
/**
 * hgColorGammaInOut422FilterMode — enum (uint32). PrepareOutputNode gates on ==1.
 */
export type HgColorGammaInOut422FilterMode = number;

/**
 * Chunk-m2 view of the HGColorGamma object. Extends the m1 view with every field this
 * chunk touches (all reads/writes cited above). All new slot pointers start null; the
 * flags default to 0. HGColorGammaM1's tighter chunk-m1 fields are inherited unchanged.
 */
export interface HGColorGammaM2 extends HGColorGammaM1 {
  outputConversion_kV4B_WXYZ:       HgcPixelFormatConversion_kV4B_WXYZ_output_Opaque | null;    // +0x1f8
  outputConversion_kV4S_WXYZ:       HgcPixelFormatConversion_kV4S_WXYZ_output_Opaque | null;    // +0x200
  outputConversion_kV4F_WXYZ:       HgcPixelFormatConversion_kV4F_WXYZ_output_Opaque | null;    // +0x208
  outputConversion_kV4S_BE_WXYZ:    HgcPixelFormatConversion_kV4S_BE_WXYZ_output_Opaque | null; // +0x230
  outputConversion_kV4B10Bit_BE:    HgcPixelFormatConversion_kV4B10Bit_BE_output_Opaque | null; // +0x238
  chromaDownsampleF1:               HgcColorGamma_chroma_downsample_f1_Opaque | null;           // +0x250
  collapse_2vuy_YXZX:               HgcColorGamma_2vuy_yxzx_collapse_Opaque | null;             // +0x260
  collapse_2vuy_XYXZ:               HgcColorGamma_2vuy_xyxz_collapse_Opaque | null;             // +0x268
  collapse_v216_YXZX:               HgcColorGamma_v216_yxzx_collapse_Opaque | null;             // +0x270
  collapse_v210_YXZX:               HgcColorGamma_v210_yxzx_rgba_collapse_Opaque | null;        // +0x278
  matrix1LM:                        HGColorMatrixLM_Opaque | null;                              // +0x1a8 (LoadMacroNodeParams-managed)
  matrix2LM:                        HGColorMatrixLM_Opaque | null;                              // +0x1b0
  dirtyFlag:                        number;                                                      // +0x2e9 uint8
  fallbackMode:                     number;                                                      // +0x400 uint8
  inOut422FilterMode:               HgColorGammaInOut422FilterMode;                              // +0x40c uint32
  inOut422FilterRect_lo:            bigint;                                                      // +0x410 u64
  inOut422FilterRect_hi:            bigint;                                                      // +0x418 u64
  matrix1ColumnScales:              readonly [number, number, number, number];                   // +0x430 f32x4
  matrix2Shuffle:                   readonly [number, number, number, number];                   // +0x440 f32x4
  toneQualityMode:                  number;                                                      // +0x490 uint32
  // transformBlock fields at +0x300..+0x3ff are decoded lazily by LoadMacroNodeParams below.
  transformBlock_300:               readonly [number, number, number, number];                   // +0x300 f32x4 (row/col unclear here)
  transformBlock_380:               readonly [number, number, number, number];                   // +0x380 f32x4 (matrix1 col0..3)
  transformBlock_390:               readonly [number, number, number, number];                   // +0x390 f32x4
  transformBlock_3a0:               readonly [number, number, number, number];                   // +0x3a0
  transformBlock_3b0:               readonly [number, number, number, number];                   // +0x3b0
  transformBlock_3c0:               readonly [number, number, number, number];                   // +0x3c0 f32x4 (matrix2 col0..3)
  transformBlock_3d0:               readonly [number, number, number, number];                   // +0x3d0
  transformBlock_3e0:               readonly [number, number, number, number];                   // +0x3e0
  transformBlock_3f0:               readonly [number, number, number, number];                   // +0x3f0
}

// ── Frontier stubs (throw-with-addr per Spec Rule 3) ─────────────────────────────────

/** HGObject::operator new(unsigned long). First site here @0x00000000000fa14e. */
function HGObject_operator_new(_sz: number): unknown {
  throw new Error(
    "raw-port: HGObject::operator new(unsigned long) not yet transcribed " +
    "(called from HGColorGamma::m_Get*Node lazy-init heads — first site @0x00000000000fa14e — Helium)",
  );
}
/** ___bzero libSystem stub (called through 0x3c4fca). Site @0x00000000000fa15e. */
function bzero(_p: unknown, _n: number): void {
  throw new Error(
    "raw-port: ___bzero not yet transcribed (called from HGColorGamma::m_Get*Node lazy-init " +
    "bodies — first site @0x00000000000fa15e — Helium via libSystem stub @0x3c4fca)",
  );
}
/** HGNode::ClearBits() — invalidates a HGNode's cache-of-bits. Site @0x00000000000fb30c. */
function HGNode_ClearBits(_p: HGColorGammaM2): void {
  throw new Error(
    "raw-port: HGNode::ClearBits() not yet transcribed " +
    "(called from HGColorGamma::SetFallbackMode @0x00000000000fb30c and 2 sibling setters — Helium)",
  );
}
/** HGColorMatrix::HGColorMatrix(). Sites @0x00000000000fb0d8, @0x00000000000fb1a7. */
function HGColorMatrix_ctor(_p: HGColorMatrixLM_Opaque): void {
  throw new Error(
    "raw-port: HGColorMatrix::HGColorMatrix() not yet transcribed " +
    "(called from HGColorGamma::LoadMacroNodeParams @0x00000000000fb0d8 and " +
    "@0x00000000000fb1a7 — Helium)",
  );
}
/** HGColorMatrix::LoadMatrix(float const (*)[4], bool). Sites @0xfb0f0, @0xfb1bf. */
function HGColorMatrix_LoadMatrix(
  _p: HGColorMatrixLM_Opaque,
  _cols: readonly (readonly [number, number, number, number])[],
  _flag: boolean,
): void {
  throw new Error(
    "raw-port: HGColorMatrix::LoadMatrix(float const (*)[4], bool) not yet transcribed " +
    "(called from HGColorGamma::LoadMacroNodeParams @0x00000000000fb0f0 and " +
    "@0x00000000000fb1bf — Helium)",
  );
}
// Per-leaf C2 ctors for every getter in this chunk. Each one is called with %rdi=p only.
function HgcColorGamma_chroma_downsample_f1_C2(_p: HgcColorGamma_chroma_downsample_f1_Opaque): void {
  throw new Error("raw-port: HgcColorGamma_chroma_downsample_f1::HgcColorGamma_chroma_downsample_f1() not yet transcribed (@0x00000000000fa169 — Helium)");
}
function HgcColorGamma_2vuy_yxzx_collapse_C2(_p: HgcColorGamma_2vuy_yxzx_collapse_Opaque): void {
  throw new Error("raw-port: HgcColorGamma_2vuy_yxzx_collapse::HgcColorGamma_2vuy_yxzx_collapse() not yet transcribed (@0x00000000000fa1d9 — Helium)");
}
function HgcColorGamma_2vuy_xyxz_collapse_C2(_p: HgcColorGamma_2vuy_xyxz_collapse_Opaque): void {
  throw new Error("raw-port: HgcColorGamma_2vuy_xyxz_collapse::HgcColorGamma_2vuy_xyxz_collapse() not yet transcribed (@0x00000000000fa249 — Helium)");
}
function HgcColorGamma_v210_yxzx_rgba_collapse_C2(_p: HgcColorGamma_v210_yxzx_rgba_collapse_Opaque): void {
  throw new Error("raw-port: HgcColorGamma_v210_yxzx_rgba_collapse::HgcColorGamma_v210_yxzx_rgba_collapse() not yet transcribed (@0x00000000000fa2ab — Helium)");
}
function HgcColorGamma_v216_yxzx_collapse_C2(_p: HgcColorGamma_v216_yxzx_collapse_Opaque): void {
  throw new Error("raw-port: HgcColorGamma_v216_yxzx_collapse::HgcColorGamma_v216_yxzx_collapse() not yet transcribed (@0x00000000000fa319 — Helium)");
}
function HgcPixelFormatConversion_kV4B10Bit_BE_output_C2(_p: HgcPixelFormatConversion_kV4B10Bit_BE_output_Opaque): void {
  throw new Error("raw-port: HgcPixelFormatConversion_kV4B10Bit_BE_output::HgcPixelFormatConversion_kV4B10Bit_BE_output() not yet transcribed (@0x00000000000fa389 — Helium)");
}
function HgcPixelFormatConversion_kV4S_BE_WXYZ_output_C2(_p: HgcPixelFormatConversion_kV4S_BE_WXYZ_output_Opaque): void {
  throw new Error("raw-port: HgcPixelFormatConversion_kV4S_BE_WXYZ_output::HgcPixelFormatConversion_kV4S_BE_WXYZ_output() not yet transcribed (@0x00000000000fa3f9 — Helium)");
}
function HgcPixelFormatConversion_kV4B_WXYZ_output_C2(_p: HgcPixelFormatConversion_kV4B_WXYZ_output_Opaque): void {
  throw new Error("raw-port: HgcPixelFormatConversion_kV4B_WXYZ_output::HgcPixelFormatConversion_kV4B_WXYZ_output() not yet transcribed (@0x00000000000fa469 — Helium)");
}
function HgcPixelFormatConversion_kV4S_WXYZ_output_C2(_p: HgcPixelFormatConversion_kV4S_WXYZ_output_Opaque): void {
  throw new Error("raw-port: HgcPixelFormatConversion_kV4S_WXYZ_output::HgcPixelFormatConversion_kV4S_WXYZ_output() not yet transcribed (@0x00000000000fa4d9 — Helium)");
}
function HgcPixelFormatConversion_kV4F_WXYZ_output_C2(_p: HgcPixelFormatConversion_kV4F_WXYZ_output_Opaque): void {
  throw new Error("raw-port: HgcPixelFormatConversion_kV4F_WXYZ_output::HgcPixelFormatConversion_kV4F_WXYZ_output() not yet transcribed (@0x00000000000fa549 — Helium)");
}

// silence unused-import lint (HGRenderer parity for the v210 signature is kept for downstream ports)
export type _M2_UnusedImport_Bridge = HGCColorGammaChromaUpsampleF1Opaque;

// ── Lazy-getter methods 40..49 ───────────────────────────────────────────────────────
// Faithful transcription of the shared template (see PATTERN above). Every branch and
// every alloc size is cited by @0xADDR. The vtable-install `*(void**)p = &<vtable>+0x10`
// is modelled by the C2 ctor's contract (the C++ compiler emits it inline after the
// `callq C2Ev` — we treat "vtable install + C2 return" as a single frontier op because
// the underlying C++ leaf classes are not yet ported).

/**
 * HGColorGamma::m_GetChromaDownsampleF1Node().
 * @0x00000000000fa130..0x00000000000fa19f — lazy-init alloc 0x1a0 + bzero + C2 + vtable install.
 * Slot at +0x250. Vtable base + 0x10 at file offset 0x91ad7b RIP-rel from @0xfa16e (VA 0xa14ef0).
 */
export function hgColorGamma_m_GetChromaDownsampleF1Node(
  self: HGColorGammaM2,
): HgcColorGamma_chroma_downsample_f1_Opaque {
  // @0x00000000000fa13a
  if (self.chromaDownsampleF1 !== null) return self.chromaDownsampleF1;
  // @0x00000000000fa149..0x00000000000fa14e
  const p = HGObject_operator_new(0x1a0) as HgcColorGamma_chroma_downsample_f1_Opaque;
  // @0x00000000000fa156..0x00000000000fa15e
  bzero(p, 0x1a0);
  // @0x00000000000fa169  callq HgcColorGamma_chroma_downsample_f1::C2  (also installs vtable via ctor)
  HgcColorGamma_chroma_downsample_f1_C2(p);
  // @0x00000000000fa17b
  self.chromaDownsampleF1 = p;
  return p;
}

/**
 * HGColorGamma::m_Get2vuy_YXZXCollapseNode().
 * @0x00000000000fa1a0..0x00000000000fa20f — lazy-init alloc 0x1a0 + bzero + C2.
 * Slot at +0x260. Vtable pointer stored at RIP+0x91b1bb from @0xfa1de.
 */
export function hgColorGamma_m_Get2vuy_YXZXCollapseNode(
  self: HGColorGammaM2,
): HgcColorGamma_2vuy_yxzx_collapse_Opaque {
  // @0x00000000000fa1aa
  if (self.collapse_2vuy_YXZX !== null) return self.collapse_2vuy_YXZX;
  // @0x00000000000fa1b9..0x00000000000fa1be
  const p = HGObject_operator_new(0x1a0) as HgcColorGamma_2vuy_yxzx_collapse_Opaque;
  // @0x00000000000fa1c6..0x00000000000fa1ce
  bzero(p, 0x1a0);
  // @0x00000000000fa1d9
  HgcColorGamma_2vuy_yxzx_collapse_C2(p);
  // @0x00000000000fa1eb
  self.collapse_2vuy_YXZX = p;
  return p;
}

/**
 * HGColorGamma::m_Get2vuy_XYXZCollapseNode().
 * @0x00000000000fa210..0x00000000000fa27f — lazy-init alloc 0x1a0 + bzero + C2.
 * Slot at +0x268.
 */
export function hgColorGamma_m_Get2vuy_XYXZCollapseNode(
  self: HGColorGammaM2,
): HgcColorGamma_2vuy_xyxz_collapse_Opaque {
  // @0x00000000000fa21a
  if (self.collapse_2vuy_XYXZ !== null) return self.collapse_2vuy_XYXZ;
  // @0x00000000000fa229..0x00000000000fa22e
  const p = HGObject_operator_new(0x1a0) as HgcColorGamma_2vuy_xyxz_collapse_Opaque;
  // @0x00000000000fa236..0x00000000000fa23e
  bzero(p, 0x1a0);
  // @0x00000000000fa249
  HgcColorGamma_2vuy_xyxz_collapse_C2(p);
  // @0x00000000000fa25b
  self.collapse_2vuy_XYXZ = p;
  return p;
}

/**
 * HGColorGamma::m_Getv210_YXZXCollapseNode(HGRenderer*).
 * @0x00000000000fa280..0x00000000000fa2df — lazy-init alloc 0x1a0 + C2. NO bzero (matches
 * the v210 handling in m1's expand-side sibling). The HGRenderer* is threaded through
 * the ABI (%rsi) but never referenced in the body — kept for interface parity.
 * Slot at +0x278.
 */
export function hgColorGamma_m_Getv210_YXZXCollapseNode(
  self: HGColorGammaM2,
  _renderer: HGRendererOpaqueM2,
): HgcColorGamma_v210_yxzx_rgba_collapse_Opaque {
  // @0x00000000000fa287
  if (self.collapse_v210_YXZX !== null) return self.collapse_v210_YXZX;
  // @0x00000000000fa29b..0x00000000000fa2a0
  const p = HGObject_operator_new(0x1a0) as HgcColorGamma_v210_yxzx_rgba_collapse_Opaque;
  // @0x00000000000fa2ab  (no bzero on this path — see @0xfa280..@0xfa2ab: alloc → straight to ctor)
  HgcColorGamma_v210_yxzx_rgba_collapse_C2(p);
  // @0x00000000000fa2bd
  self.collapse_v210_YXZX = p;
  return p;
}

/**
 * HGColorGamma::m_Getv216_YXZXCollapseNode().
 * @0x00000000000fa2e0..0x00000000000fa34f — lazy-init alloc 0x1a0 + bzero + C2.
 * Slot at +0x270.
 */
export function hgColorGamma_m_Getv216_YXZXCollapseNode(
  self: HGColorGammaM2,
): HgcColorGamma_v216_yxzx_collapse_Opaque {
  // @0x00000000000fa2ea
  if (self.collapse_v216_YXZX !== null) return self.collapse_v216_YXZX;
  // @0x00000000000fa2f9..0x00000000000fa2fe
  const p = HGObject_operator_new(0x1a0) as HgcColorGamma_v216_yxzx_collapse_Opaque;
  // @0x00000000000fa306..0x00000000000fa30e
  bzero(p, 0x1a0);
  // @0x00000000000fa319
  HgcColorGamma_v216_yxzx_collapse_C2(p);
  // @0x00000000000fa32b
  self.collapse_v216_YXZX = p;
  return p;
}

/**
 * HGColorGamma::m_GetPixelFormatConversion_kV4B10Bit_BE_OutputNode().
 * @0x00000000000fa350..0x00000000000fa3bf — lazy-init alloc 0x1a0 + bzero + C2.
 * Slot at +0x238.
 */
export function hgColorGamma_m_GetPixelFormatConversion_kV4B10Bit_BE_OutputNode(
  self: HGColorGammaM2,
): HgcPixelFormatConversion_kV4B10Bit_BE_output_Opaque {
  // @0x00000000000fa35a
  if (self.outputConversion_kV4B10Bit_BE !== null) return self.outputConversion_kV4B10Bit_BE;
  // @0x00000000000fa369..0x00000000000fa36e
  const p = HGObject_operator_new(0x1a0) as HgcPixelFormatConversion_kV4B10Bit_BE_output_Opaque;
  // @0x00000000000fa376..0x00000000000fa37e
  bzero(p, 0x1a0);
  // @0x00000000000fa389
  HgcPixelFormatConversion_kV4B10Bit_BE_output_C2(p);
  // @0x00000000000fa39b
  self.outputConversion_kV4B10Bit_BE = p;
  return p;
}

/**
 * HGColorGamma::m_GetPixelFormatConversion_kV4S_BE_WXYZ_OutputNode().
 * @0x00000000000fa3c0..0x00000000000fa42f — lazy-init alloc 0x1a0 + bzero + C2.
 * Slot at +0x230.
 */
export function hgColorGamma_m_GetPixelFormatConversion_kV4S_BE_WXYZ_OutputNode(
  self: HGColorGammaM2,
): HgcPixelFormatConversion_kV4S_BE_WXYZ_output_Opaque {
  // @0x00000000000fa3ca
  if (self.outputConversion_kV4S_BE_WXYZ !== null) return self.outputConversion_kV4S_BE_WXYZ;
  // @0x00000000000fa3d9..0x00000000000fa3de
  const p = HGObject_operator_new(0x1a0) as HgcPixelFormatConversion_kV4S_BE_WXYZ_output_Opaque;
  // @0x00000000000fa3e6..0x00000000000fa3ee
  bzero(p, 0x1a0);
  // @0x00000000000fa3f9
  HgcPixelFormatConversion_kV4S_BE_WXYZ_output_C2(p);
  // @0x00000000000fa40b
  self.outputConversion_kV4S_BE_WXYZ = p;
  return p;
}

/**
 * HGColorGamma::m_GetPixelFormatConversion_kV4B_WXYZ_OutputNode().
 * @0x00000000000fa430..0x00000000000fa49f — lazy-init alloc 0x200 + bzero + C2.
 * Slot at +0x1f8. NOTE: this one and the two below allocate 0x200 (not 0x1a0).
 */
export function hgColorGamma_m_GetPixelFormatConversion_kV4B_WXYZ_OutputNode(
  self: HGColorGammaM2,
): HgcPixelFormatConversion_kV4B_WXYZ_output_Opaque {
  // @0x00000000000fa43a
  if (self.outputConversion_kV4B_WXYZ !== null) return self.outputConversion_kV4B_WXYZ;
  // @0x00000000000fa449..0x00000000000fa44e
  const p = HGObject_operator_new(0x200) as HgcPixelFormatConversion_kV4B_WXYZ_output_Opaque;
  // @0x00000000000fa456..0x00000000000fa45e
  bzero(p, 0x200);
  // @0x00000000000fa469
  HgcPixelFormatConversion_kV4B_WXYZ_output_C2(p);
  // @0x00000000000fa47b
  self.outputConversion_kV4B_WXYZ = p;
  return p;
}

/**
 * HGColorGamma::m_GetPixelFormatConversion_kV4S_WXYZ_OutputNode().
 * @0x00000000000fa4a0..0x00000000000fa50f — lazy-init alloc 0x200 + bzero + C2. Slot +0x200.
 */
export function hgColorGamma_m_GetPixelFormatConversion_kV4S_WXYZ_OutputNode(
  self: HGColorGammaM2,
): HgcPixelFormatConversion_kV4S_WXYZ_output_Opaque {
  // @0x00000000000fa4aa
  if (self.outputConversion_kV4S_WXYZ !== null) return self.outputConversion_kV4S_WXYZ;
  // @0x00000000000fa4b9..0x00000000000fa4be
  const p = HGObject_operator_new(0x200) as HgcPixelFormatConversion_kV4S_WXYZ_output_Opaque;
  // @0x00000000000fa4c6..0x00000000000fa4ce
  bzero(p, 0x200);
  // @0x00000000000fa4d9
  HgcPixelFormatConversion_kV4S_WXYZ_output_C2(p);
  // @0x00000000000fa4eb
  self.outputConversion_kV4S_WXYZ = p;
  return p;
}

/**
 * HGColorGamma::m_GetPixelFormatConversion_kV4F_WXYZ_OutputNode().
 * @0x00000000000fa510..0x00000000000fa57f — lazy-init alloc 0x200 + bzero + C2. Slot +0x208.
 */
export function hgColorGamma_m_GetPixelFormatConversion_kV4F_WXYZ_OutputNode(
  self: HGColorGammaM2,
): HgcPixelFormatConversion_kV4F_WXYZ_output_Opaque {
  // @0x00000000000fa51a
  if (self.outputConversion_kV4F_WXYZ !== null) return self.outputConversion_kV4F_WXYZ;
  // @0x00000000000fa529..0x00000000000fa52e
  const p = HGObject_operator_new(0x200) as HgcPixelFormatConversion_kV4F_WXYZ_output_Opaque;
  // @0x00000000000fa536..0x00000000000fa53e
  bzero(p, 0x200);
  // @0x00000000000fa549
  HgcPixelFormatConversion_kV4F_WXYZ_output_C2(p);
  // @0x00000000000fa55b
  self.outputConversion_kV4F_WXYZ = p;
  return p;
}

// ── Method 50: HGColorGamma::CanLoadData(HGFormat) ───────────────────────────────────
/**
 * HGColorGamma::CanLoadData(HGFormat).
 * @0x00000000000fa580..0x00000000000fb01X (692 disasm lines).
 *
 * Deferred to a dedicated chunk. The method is a large SSE-heavy predicate: it (1) fast-
 * fails if `conversionMode` (+0x404) != 0 (@0xfa584), (2) tests the transformBlock at
 * +0x300 against a rodata identity vector via mul/cmpneqps (@0xfa591..@0xfa5ab), (3)
 * bounds-checks that block against two rodata cmpnleps ranges (@0xfa5b1..@0xfa5cc),
 * then dispatches through a huge inline decision tree on the HGFormat value plus the
 * two 4x4 matrix blocks at +0x380 and +0x3c0 to compute a supported-configuration bit.
 * The body contains dozens of anonymous rodata SSE constants (identity matrices at
 * 0x3c7cb0 f32[0,1] / 0x3c7cc0 f32=1.0 / 0x3caa70 f32x4[0,0,1,0] / 0x3c9fe0 f32x4[0,0,0,1]
 * were already decoded for LoadMacroNodeParams and are shared here) and 2 vtable calls
 * (@0xfafcb, @0xfb00f). A faithful full port needs the HGFormat enum + all decision-tree
 * rodata pools resolved; this exceeds the chunk-context budget.
 */
export function hgColorGamma_CanLoadData(
  _self: HGColorGammaM2,
  _fmt: HGFormatValue,
): boolean {
  // Only the decoded fast-fail head is preserved for downstream cite-linking:
  //   @0xfa584  if (self.conversionMode !== 0) return false;   // (+0x404)
  //   @0xfa58d  xorl %eax,%eax; ret
  // The remaining 690 lines are deferred.
  throw new Error(
    "raw-port: HGColorGamma::CanLoadData(HGFormat) not yet transcribed " +
    "(@0x00000000000fa580..0x00000000000fb01X; 692-line SSE predicate + inline HGFormat " +
    "decision tree with 2 vtable calls @0x00000000000fafcb and @0x00000000000fb00f — Helium)",
  );
}

// ── Method 51: HGColorGamma::LoadMacroNodeParams() ───────────────────────────────────

// Decoded rodata constants (identity-matrix columns) used by LoadMacroNodeParams.
// All addresses cited @0xADDR of the RIP-relative load that reads them.
// LOADS AS f32x4 for cmpneqps against the whole column:
//   @0xfb058 -> f32 1.0 at VA 0x3c7cc0 (broadcast into all 4 lanes at load — movss zero-extends
//              but cmpneqps interprets 4x32; the load is followed by a compare where only
//              lane 0 has 1.0 and lanes 1..3 are 0 — matching an IDENTITY column [1,0,0,0]).
//   @0xfb067 -> f64 at 0x3c7cb0 = two f32s [0.0, 1.0] followed by zero — identity col [0,1,0,0].
//   @0xfb076 -> f32x4 at 0x3caa70 = [0,0,1,0]                          — identity col [0,0,1,0].
//   @0xfb081 -> f32x4 at 0x3c9fe0 = [0,0,0,1]                          — identity col [0,0,0,1].
// Second block (@0xfb111..@0xfb13e) reads the SAME four constants (same rodata addresses).
const IDENTITY_COL_0: readonly [number, number, number, number] = [1.0, 0.0, 0.0, 0.0]; // @VA 0x3c7cc0
const IDENTITY_COL_1: readonly [number, number, number, number] = [0.0, 1.0, 0.0, 0.0]; // @VA 0x3c7cb0
const IDENTITY_COL_2: readonly [number, number, number, number] = [0.0, 0.0, 1.0, 0.0]; // @VA 0x3caa70
const IDENTITY_COL_3: readonly [number, number, number, number] = [0.0, 0.0, 0.0, 1.0]; // @VA 0x3c9fe0

/** Bitmask-OR of "any lane differs from identity" across 4 columns. Mirrors
 *  cmpneqps + orps + movmskps in the disasm — each cmpneqps yields lane bits, orps folds
 *  all 4 columns' bit vectors, movmskps extracts sign bits. `!= 0` means "not identity". */
function anyLaneDiffers4x4(
  cols: readonly (readonly [number, number, number, number])[],
  identity: readonly (readonly [number, number, number, number])[],
): boolean {
  // @0xfb063..0x0fb08f  (first block) and @0xfb119..0x0fb145 (second block).
  for (let c = 0; c < 4; c++) {
    for (let l = 0; l < 4; l++) {
      // cmpneqps is quiet/unordered aware: NaN vs anything is NEQ true. `!==` is IEEE
      // ordered inequality; we invert the equality per anti-shortcut Rule 4 (avoid
      // NaN-ordered `!==`) — use `!(a === b)` which mimics cmpneqps ordering.
      // (Both operands are read from rodata / node fields — no NaN in practice, but
      // this is the exact bit-precise operation the SSE opcode performs on quiet NaNs.)
      // eslint-disable-next-line no-self-compare
      const a = Math.fround(cols[c][l]);
      const b = Math.fround(identity[c][l]);
      // Ordered-not-equal per cmpneqps semantics: TRUE iff (a != b) and neither is NaN,
      // OR either is NaN. We flip standard `===` to avoid the JS NaN-ordered pitfall.
      const eq = (a === b) && (a === a) && (b === b);
      if (!eq) return true;
    }
  }
  return false;
}

/**
 * HGColorGamma::LoadMacroNodeParams().
 * @0x00000000000fb020..0x00000000000fb1ff — SSE prologue with stack-check guard.
 *
 * DECODE (from LoadMacroNodeParams.s):
 *   Block 1 (matrix1 @+0x380..+0x3bf and slot +0x1a8):
 *     Read the 4 columns of the 4x4 float matrix at self+0x380/0x390/0x3a0/0x3b0.
 *     Compare each column vs identity via cmpneqps (using the constants above).
 *     If ANY lane differs (movmskps != 0):
 *       Load broadcast scale from +0x430 (matrix1ColumnScales),
 *       multiply each of the 4 columns by that broadcast (element-wise),
 *       write the 4 scaled columns to a 64-byte local buffer at -0x60(%rbp),
 *       if self.matrix1LM (+0x1a8) is null: alloc 0x1f0 + HGColorMatrix::HGColorMatrix() + store,
 *       call HGColorMatrix::LoadMatrix(matrix1LM, &localBuf, [flag=]true).
 *
 *   Block 2 (matrix2 @+0x3c0..+0x3ff and slot +0x1b0):
 *     Same predicate on columns @+0x3c0..+0x3f0.
 *     If ANY lane differs:
 *       Load base xmm4 from +0x440 (matrix2Shuffle),
 *       shuffle xmm5 = xmm4.shuf(0xc0)  — [xmm4[0], xmm4[0], xmm4[0], xmm4[3]]
 *       shuffle xmm3 = xmm4.shuf(0xd5)  — [xmm4[1], xmm4[1], xmm4[1], xmm4[3]]
 *       shuffle xmm2 = xmm4.shuf(0xea)  — [xmm4[2], xmm4[2], xmm4[2], xmm4[3]]
 *       shuffle xmm4 = xmm4.shuf(0xff)  — [xmm4[3], xmm4[3], xmm4[3], xmm4[3]]
 *       multiply col0..col3 by those 4 shuffled xmms respectively,
 *       write to local buf,
 *       if self.matrix2LM (+0x1b0) is null: alloc 0x1f0 + HGColorMatrix::HGColorMatrix() + store,
 *       call HGColorMatrix::LoadMatrix(matrix2LM, &localBuf, [flag=]true).
 *
 *   Tail: __stack_chk_guard mismatch => __stack_chk_fail.
 *
 * The shufps mask decodes are per Intel SDM: imm=0xc0=0b11000000 => pick idx {0,0,0,3};
 * imm=0xd5=0b11010101 => {1,1,1,3}; imm=0xea=0b11101010 => {2,2,2,3}; imm=0xff=0b11111111 =>
 * {3,3,3,3}. All 4 pick lane 3 for the top slot. (Verified against the disasm's ##-comments
 * at @0xfb159/@0xfb167/@0xfb175/@0xfb180.)
 */
export function hgColorGamma_LoadMacroNodeParams(self: HGColorGammaM2): void {
  // BLOCK 1 — matrix1 @+0x380..+0x3b0
  // @0xfb03c..@0xfb051
  const m1c0 = self.transformBlock_380;
  const m1c1 = self.transformBlock_390;
  const m1c2 = self.transformBlock_3a0;
  const m1c3 = self.transformBlock_3b0;
  // @0xfb058..@0xfb092 — 4-column cmpneqps against identity, or-fold, movmskps
  const m1NonIdentity = anyLaneDiffers4x4(
    [m1c0, m1c1, m1c2, m1c3],
    [IDENTITY_COL_0, IDENTITY_COL_1, IDENTITY_COL_2, IDENTITY_COL_3],
  );
  // @0xfb095..@0xfb097
  if (m1NonIdentity) {
    // @0xfb099  load broadcast scale xmm4 = self.matrix1ColumnScales (+0x430)
    const s = self.matrix1ColumnScales;
    // @0xfb0a0/@0xfb0a7/@0xfb0ae/@0xfb0b5  mulps col_i, xmm4  (element-wise)
    const scaledCols: readonly [number, number, number, number][] = [
      [Math.fround(m1c0[0] * s[0]), Math.fround(m1c0[1] * s[1]), Math.fround(m1c0[2] * s[2]), Math.fround(m1c0[3] * s[3])],
      [Math.fround(m1c1[0] * s[0]), Math.fround(m1c1[1] * s[1]), Math.fround(m1c1[2] * s[2]), Math.fround(m1c1[3] * s[3])],
      [Math.fround(m1c2[0] * s[0]), Math.fround(m1c2[1] * s[1]), Math.fround(m1c2[2] * s[2]), Math.fround(m1c2[3] * s[3])],
      [Math.fround(m1c3[0] * s[0]), Math.fround(m1c3[1] * s[1]), Math.fround(m1c3[2] * s[2]), Math.fround(m1c3[3] * s[3])],
    ];
    // @0xfb0bc..@0xfb0dd — lazy alloc of matrix1LM (+0x1a8)
    let mtx: HGColorMatrixLM_Opaque;
    if (self.matrix1LM !== null) {
      mtx = self.matrix1LM;
    } else {
      // @0xfb0c8..@0xfb0cd  new HGColorMatrix(0x1f0)
      const p = HGObject_operator_new(0x1f0) as HGColorMatrixLM_Opaque;
      // @0xfb0d8
      HGColorMatrix_ctor(p);
      // @0xfb0dd
      self.matrix1LM = p;
      mtx = p;
    }
    // @0xfb0e4..@0xfb0f0  HGColorMatrix::LoadMatrix(&localBuf, flag=1)
    HGColorMatrix_LoadMatrix(mtx, scaledCols, true);
  }

  // BLOCK 2 — matrix2 @+0x3c0..+0x3f0
  // @0xfb0f5..@0xfb10a
  const m2c0 = self.transformBlock_3c0;
  const m2c1 = self.transformBlock_3d0;
  const m2c2 = self.transformBlock_3e0;
  const m2c3 = self.transformBlock_3f0;
  // @0xfb111..@0xfb14b — same identity predicate as block 1 (same rodata constants)
  const m2NonIdentity = anyLaneDiffers4x4(
    [m2c0, m2c1, m2c2, m2c3],
    [IDENTITY_COL_0, IDENTITY_COL_1, IDENTITY_COL_2, IDENTITY_COL_3],
  );
  // @0xfb14d
  if (m2NonIdentity) {
    // @0xfb14f  load base xmm4 = self.matrix2Shuffle (+0x440)
    const s = self.matrix2Shuffle;
    // shufps mask decodes per Intel SDM (see docstring above):
    //   0xc0 => [s[0], s[0], s[0], s[3]]   @0xfb159
    //   0xd5 => [s[1], s[1], s[1], s[3]]   @0xfb167
    //   0xea => [s[2], s[2], s[2], s[3]]   @0xfb175
    //   0xff => [s[3], s[3], s[3], s[3]]   @0xfb180
    const sh0: readonly [number, number, number, number] = [s[0], s[0], s[0], s[3]];
    const sh1: readonly [number, number, number, number] = [s[1], s[1], s[1], s[3]];
    const sh2: readonly [number, number, number, number] = [s[2], s[2], s[2], s[3]];
    const sh3: readonly [number, number, number, number] = [s[3], s[3], s[3], s[3]];
    // @0xfb15d/@0xfb16b/@0xfb179/@0xfb184  mulps col_i, sh_i
    const scaledCols: readonly [number, number, number, number][] = [
      [Math.fround(m2c0[0] * sh0[0]), Math.fround(m2c0[1] * sh0[1]), Math.fround(m2c0[2] * sh0[2]), Math.fround(m2c0[3] * sh0[3])],
      [Math.fround(m2c1[0] * sh1[0]), Math.fround(m2c1[1] * sh1[1]), Math.fround(m2c1[2] * sh1[2]), Math.fround(m2c1[3] * sh1[3])],
      [Math.fround(m2c2[0] * sh2[0]), Math.fround(m2c2[1] * sh2[1]), Math.fround(m2c2[2] * sh2[2]), Math.fround(m2c2[3] * sh2[3])],
      [Math.fround(m2c3[0] * sh3[0]), Math.fround(m2c3[1] * sh3[1]), Math.fround(m2c3[2] * sh3[2]), Math.fround(m2c3[3] * sh3[3])],
    ];
    // @0xfb18b..@0xfb1af  lazy alloc of matrix2LM (+0x1b0)
    let mtx: HGColorMatrixLM_Opaque;
    if (self.matrix2LM !== null) {
      mtx = self.matrix2LM;
    } else {
      // @0xfb197..@0xfb19c  new HGColorMatrix(0x1f0)
      const p = HGObject_operator_new(0x1f0) as HGColorMatrixLM_Opaque;
      // @0xfb1a7
      HGColorMatrix_ctor(p);
      // @0xfb1af
      self.matrix2LM = p;
      mtx = p;
    }
    // @0xfb1b6..@0xfb1bf
    HGColorMatrix_LoadMatrix(mtx, scaledCols, true);
  }
  // @0xfb1c4..@0xfb1dc  __stack_chk_guard check + return.
}

// ── Method 52: unpremultiplyShouldSanitizeAndClampUsingReturned(float&) ─────────────

// Decoded jump-table @0xfb274 (13 entries, cases conversionMode==5..17).
// Every offset resolved via lipo-thin __text section and struct.unpack — see the
// per-agent decode log (chunk m2 setup). Targets:
//   mode 5           -> @0xfb23e (LUT lookup path, sets al=1)
//   mode 6..10,12,15,16 -> @0xfb272 (fall-through, returns eax=0/false)
//   mode 11          -> @0xfb264 (const 2.5, sets al=1)
//   mode 13,14       -> @0xfb234 (const 1.5, sets al=1)
//   mode 17          -> @0xfb25a (const 1.468, sets al=1)
// The mode-5 path reads from a 19-entry f32 LUT at VA 0x3d0ca4 indexed by
// self.unpremultSanitizedLutIdx (+0x408, u64). Reject with al=0 if idx>=0x13.
// LUT values (decoded, all f32):
const HGCG_UNPREMULT_SANITIZED_LUT: readonly number[] = [
  // @VA 0x3d0ca4..0x3d0ca4+0x4c
  1.649999976158142,  // [0]  raw 0x3fd33333
  1.649999976158142,  // [1]  raw 0x3fd33333
  1.649999976158142,  // [2]  raw 0x3fd33333
  1.399999976158142,  // [3]  raw 0x3fb33333
  3.0,                // [4]  raw 0x40400000
  3.0,                // [5]  raw 0x40400000
  1.899999976158142,  // [6]  raw 0x3ff33333
  2.5,                // [7]  raw 0x40200000
  2.5,                // [8]  raw 0x40200000
  1.75,               // [9]  raw 0x3fe00000
  1.75,               // [10] raw 0x3fe00000
  2.0999999046325684, // [11] raw 0x40066666
  2.299999952316284,  // [12] raw 0x40133333
  3.5,                // [13] raw 0x40600000
  1.5,                // [14] raw 0x3fc00000
  2.0,                // [15] raw 0x40000000
  1.75,               // [16] raw 0x3fe00000
  2.299999952316284,  // [17] raw 0x40133333
  1.7000000476837158, // [18] raw 0x3fd9999a
];
// @VA 0x3c7cd0 f32 = 1.5    (mode 13,14 constant, read at @0xfb234)
const HGCG_UNPREMULT_MODE_13_14: number = 1.5;
// @VA 0x3cfae4 f32 = 1.468  (mode 17 constant,   read at @0xfb25a)
const HGCG_UNPREMULT_MODE_17: number = 1.468000054359436;
// @VA 0x3cfae0 f32 = 2.5    (mode 11 constant,   read at @0xfb264)
const HGCG_UNPREMULT_MODE_11: number = 2.5;

/**
 * HGColorGamma::unpremultiplyShouldSanitizeAndClampUsingReturned(float& out).
 * @0x00000000000fb210..0x00000000000fb273.
 *
 * ABI: `bool (*)(this, float& out)` — %rdi=this, %rsi=&out. Returns bool (al). On the
 * "true" paths, writes an f32 through *rsi. Uses the "mode-5..17" jump table (see
 * decoded targets above).
 */
export function hgColorGamma_unpremultiplyShouldSanitizeAndClampUsingReturned(
  self: HGColorGammaM2,
  out: { value: number },
): boolean {
  // @0xfb214..@0xfb21f  ecx = (self.conversionMode - 5); if (unsigned)ecx > 0xc: eax=0, return
  const cm = self.conversionMode | 0;  // uint32 -> int32 (safe: values 0..0xffffffff)
  const idx = (cm - 5) | 0;
  if (idx < 0 || idx > 0xc) return false;
  // @0xfb232  jmpq *(rdx + rcx*4)  — decoded jump table:
  switch (idx) {
    case 0: {  // conversionMode == 5  — LUT lookup path
      // @0xfb23e  ecx = self.unpremultSanitizedLutIdx (+0x408, low 32b as index)
      // @0xfb246..@0xfb24a  if (ecx >= 0x13) return false (al preserved as 1, but eax=0 from head)
      // NOTE: @0xfb244 sets al=1 BEFORE the range test — so the branch to @0xfb272 returns
      // al=1 (true) WITHOUT writing *out. That is the exact disasm. Preserve it faithfully.
      const lidx = Number(BigInt.asUintN(32, BigInt(self.unpremultSanitizedLutIdx)));
      if (lidx >= 0x13) return true;
      // @0xfb24c..@0xfb253  xmm0 = LUT[lidx]  (LUT base @VA 0x3d0ca4)
      // @0xfb26c  *(f32*)rsi = xmm0
      out.value = Math.fround(HGCG_UNPREMULT_SANITIZED_LUT[lidx]);
      // @0xfb270  al = 1
      return true;
    }
    case 6: {  // conversionMode == 11
      // @0xfb264..@0xfb26c  xmm0 = f32 const 2.5 at VA 0x3cfae0
      out.value = Math.fround(HGCG_UNPREMULT_MODE_11);
      // @0xfb270  al = 1
      return true;
    }
    case 8:    // conversionMode == 13
    case 9: {  // conversionMode == 14
      // @0xfb234..@0xfb23c  xmm0 = f32 const 1.5 at VA 0x3c7cd0
      out.value = Math.fround(HGCG_UNPREMULT_MODE_13_14);
      // @0xfb270  al = 1
      return true;
    }
    case 12: {  // conversionMode == 17
      // @0xfb25a..@0xfb262  xmm0 = f32 const 1.468 at VA 0x3cfae4
      out.value = Math.fround(HGCG_UNPREMULT_MODE_17);
      // @0xfb270  al = 1
      return true;
    }
    // conversionMode == 6,7,8,9,10,12,15,16 -> fall-through
    default:
      // @0xfb272  eax=0 (untouched from head), popq rbp, retq
      return false;
  }
}

// ── Method 53: HGColorGamma::PrepareOutputNode(HGRenderer*, HGRect, HGFormat) ────────
/**
 * HGColorGamma::PrepareOutputNode(HGRenderer*, HGRect, HGFormat).
 * @0x00000000000fb2b0..0x00000000000fb2cd — 10 lines total. Ignores HGRenderer* and
 * HGFormat; only acts on HGRect if inOut422FilterMode == 1. The HGRect is passed by
 * value across %rdx:%rcx (SysV: two 8-byte GPRs for a 16-byte struct).
 */
export function hgColorGamma_PrepareOutputNode(
  self: HGColorGammaM2,
  _renderer: HGRendererOpaqueM2,
  rect: HGRectValue,
  _fmt: HGFormatValue,
): void {
  // @0xfb2b4  cmpl $0x1, 0x40c(%rdi) — inOut422FilterMode == 1?
  if ((self.inOut422FilterMode | 0) === 1) {
    // @0xfb2bd  movq %rdx, 0x410(%rdi)  — write rect.lo
    // @0xfb2c4  movq %rcx, 0x418(%rdi)  — write rect.hi
    self.inOut422FilterRect_lo = rect.lo;
    self.inOut422FilterRect_hi = rect.hi;
  }
  // @0xfb2cb  popq %rbp; retq
}

// ── Method 54: HGColorGamma::label_B() const ─────────────────────────────────────────
// Private rodata label table __ZL28hgcolorgamma_span_read_label @VA 0xa134b0 (73 slots).
// Decoded via dyld_info -fixups (thin x86_64 slice). See PATTERN header for slot 0..72.
export const HGCG_SPAN_READ_LABEL: readonly string[] = [
  "no_support",                             //  0
  "2b_xyxz_m0_g01_m0_f0",                   //  1
  "2b_xyxz_m0_g01_m0_f1",                   //  2
  "2b_yxzx_m0_g01_m0_f0",                   //  3
  "2b_yxzx_m0_g01_m0_f1",                   //  4
  "2s_yxzx_m0_g01_m0_f0",                   //  5
  "2s_yxzx_m0_g01_m0_f1",                   //  6
  "4b10bit_yxzx_little_endian_m0_g01_m0_f0",//  7
  "4b10bit_yxzx_little_endian_m0_g01_m0_f1",//  8
  "2b_xyxz_m1_gqt_m0_f0",                   //  9
  "2b_xyxz_m1_gqt_m1_f0",                   // 10
  "2b_xyxz_m1_gqt_m0_f1",                   // 11
  "2b_xyxz_m1_gqt_m1_f1",                   // 12
  "2b_yxzx_m1_gqt_m0_f0",                   // 13
  "2b_yxzx_m1_gqt_m1_f0",                   // 14
  "2b_yxzx_m1_gqt_m0_f1",                   // 15
  "2b_yxzx_m1_gqt_m1_f1",                   // 16
  "2s_yxzx_m1_gqt_m0_f0",                   // 17
  "2s_yxzx_m1_gqt_m1_f0",                   // 18
  "2s_yxzx_m1_gqt_m0_f1",                   // 19
  "2s_yxzx_m1_gqt_m1_f1",                   // 20
  "4b_wxyz_m1_gqt_m0",                      // 21
  "4b_wxyz_m1_gqt_m1",                      // 22
  "4b_wxyz_m0_gqt_m0",                      // 23
  "4b_wxyz_m0_gqt_m1",                      // 24
  "4b_wxyz_m1_gqt_m0_premul",               // 25
  "4b_wxyz_m1_gqt_m1_premul",               // 26
  "4b_wxyz_m0_gqt_m0_premul",               // 27
  "4b_wxyz_m0_gqt_m1_premul",               // 28
  "4b_m1_gqt_m0",                           // 29
  "4b_m1_gqt_m1",                           // 30
  "4b_m0_gqt_m0",                           // 31
  "4b_m0_gqt_m1",                           // 32
  "4b_m1_gqt_m0_premul",                    // 33
  "4b_m1_gqt_m1_premul",                    // 34
  "4b_m0_gqt_m0_premul",                    // 35
  "4b_m0_gqt_m1_premul",                    // 36
  "4s_wxyz_m1_gqt_m0",                      // 37
  "4s_wxyz_m1_gqt_m1",                      // 38
  "4s_wxyz_m0_gqt_m0",                      // 39
  "4s_wxyz_m0_gqt_m1",                      // 40
  "4s_wxyz_m1_gqt_m0_premul",               // 41
  "4s_wxyz_m1_gqt_m1_premul",               // 42
  "4s_wxyz_m0_gqt_m0_premul",               // 43
  "4s_wxyz_m0_gqt_m1_premul",               // 44
  "4s_m1_gqt_m0",                           // 45
  "4s_m1_gqt_m1",                           // 46
  "4s_m0_gqt_m0",                           // 47
  "4s_m0_gqt_m1",                           // 48
  "4s_m1_gqt_m0_premul",                    // 49
  "4s_m1_gqt_m1_premul",                    // 50
  "4s_m0_gqt_m0_premul",                    // 51
  "4s_m0_gqt_m1_premul",                    // 52
  "4f_wxyz_m1_gqt_m0",                      // 53
  "4f_wxyz_m1_gqt_m1",                      // 54
  "4f_wxyz_m1_gqt_m0_premul",               // 55
  "4f_wxyz_m1_gqt_m1_premul",               // 56
  "4b10bit_yxzx_little_endian_m1_gqt_m0_f0",// 57
  "4b10bit_yxzx_little_endian_m1_gqt_m1_f0",// 58
  "4b10bit_yxzx_little_endian_m1_gqt_m0_f1",// 59
  "4b10bit_yxzx_little_endian_m1_gqt_m1_f1",// 60
  "4b10bit_big_endian_m1_gqt_m0",           // 61
  "4b10bit_big_endian_m1_gqt_m1",           // 62
  "4b10bit_big_endian_m0_gqt_m0",           // 63
  "4b10bit_big_endian_m0_gqt_m1",           // 64
  "4s_wxyz_big_endian_m1_gqt_m0",           // 65
  "4s_wxyz_big_endian_m1_gqt_m1",           // 66
  "4s_wxyz_big_endian_m0_gqt_m0",           // 67
  "4s_wxyz_big_endian_m0_gqt_m1",           // 68
  "4s_wxyz_big_endian_m1_gqt_m0_premul",    // 69
  "4s_wxyz_big_endian_m1_gqt_m1_premul",    // 70
  "4s_wxyz_big_endian_m0_gqt_m0_premul",    // 71
  "4s_wxyz_big_endian_m0_gqt_m1_premul",    // 72
];

// The label array is indexed by an int32 at self.<some HGNode>+0x120. The `movslq`
// insn sign-extends a 32-bit signed offset — this is the "span read state" index the
// HGColorGamma stores in a sibling HGNode object (loaded via *(void**)(self+0x198)).
// We surface both the parent-slot read and the LUT indirection faithfully.
export interface HGColorGamma_SpanReadStateOpaque {
  /** @+0x120 (int32, sign-extended by movslq at @0xfb2db). */
  readonly labelIndex: number;
}
/**
 * HGColorGamma::label_B() const.
 * @0x00000000000fb2d0..0x00000000000fb2ee.
 *
 * Returns a `const char*` (JS string) from the 73-entry label LUT above, indexed by
 * self.<node@+0x198>.<+0x120 int32>. If the index is out of range the ORIGINAL C++ code
 * would return a bogus pointer — we THROW loudly instead, per Spec Rule 3, because the
 * only sound way to keep faithfulness under bad input is to fail rather than fabricate.
 */
export function hgColorGamma_label_B(
  _self: HGColorGammaM2,
  spanReadState: HGColorGamma_SpanReadStateOpaque,
): string {
  // @0xfb2d4  movq 0x198(%rdi), %rax  — read HGNode pointer at self+0x198 (opaque; caller-provided).
  // @0xfb2db  movslq 0x120(%rax), %rax — signed 32-bit index.
  const i = spanReadState.labelIndex | 0;
  // @0xfb2e2..@0xfb2e9  leaq LUT(%rip),%rcx; movq (%rcx,%rax,8),%rax
  if (i < 0 || i >= HGCG_SPAN_READ_LABEL.length) {
    throw new Error(
      "raw-port: HGColorGamma::label_B() out-of-range index " + i +
      " into 73-entry table (@VA 0xa134b0, __ZL28hgcolorgamma_span_read_label) — Helium",
    );
  }
  return HGCG_SPAN_READ_LABEL[i];
}

// ── Method 55: HGColorGamma::SetParameter(int, float, float, float, float) ──────────
/**
 * HGColorGamma::SetParameter(int, float, float, float, float).
 * @0x00000000000fb2f0..0x00000000000fb2fa — pure stub. Body: `mov eax, -1; ret`.
 * Returns int32 = -1 (0xffffffff) unconditionally. No state read, no state written.
 * This is a base-class "unsupported parameter" stub that the derived hierarchy overrides.
 */
export function hgColorGamma_SetParameter(
  _self: HGColorGammaM2,
  _key: number,
  _f0: number,
  _f1: number,
  _f2: number,
  _f3: number,
): number {
  // @0xfb2f4  movl $0xffffffff, %eax
  // @0xfb2f9  popq %rbp; retq
  return -1;
}

// ── Method 56: HGColorGamma::SetFallbackMode(bool) ──────────────────────────────────
/**
 * HGColorGamma::SetFallbackMode(bool).
 * @0x00000000000fb300..0x00000000000fb324.
 * Body:  HGNode::ClearBits(self);
 *        self.dirtyFlag(+0x2e9) = 1;
 *        self.fallbackMode(+0x400) = bl;
 */
export function hgColorGamma_SetFallbackMode(self: HGColorGammaM2, mode: boolean): void {
  // @0xfb30c  callq HGNode::ClearBits
  HGNode_ClearBits(self);
  // @0xfb311  movb $0x1, 0x2e9(%r14)
  self.dirtyFlag = 1;
  // @0xfb319  movb %bl, 0x400(%r14)
  self.fallbackMode = mode ? 1 : 0;
}

// ── Method 57: HGColorGamma::SetToneQualityMode(hgColorGammaToneQuality) ────────────
/**
 * HGColorGamma::SetToneQualityMode(hgColorGammaToneQuality).
 * @0x00000000000fb330..0x00000000000fb354.
 * Body:  HGNode::ClearBits(self);
 *        self.dirtyFlag(+0x2e9) = 1;
 *        self.toneQualityMode(+0x490) = uint32(enum);
 */
export function hgColorGamma_SetToneQualityMode(
  self: HGColorGammaM2,
  mode: HgColorGammaToneQuality,
): void {
  // @0xfb33c
  HGNode_ClearBits(self);
  // @0xfb341
  self.dirtyFlag = 1;
  // @0xfb349  movl %ebx, 0x490(%r14)
  self.toneQualityMode = mode | 0;
}

// ── Method 58: HGColorGamma::SetInOut422FilterMode(hgColorGammaInOut422FilterMode) ──
/**
 * HGColorGamma::SetInOut422FilterMode(hgColorGammaInOut422FilterMode).
 * @0x00000000000fb360..0x00000000000fb384.
 * Body:  HGNode::ClearBits(self);
 *        self.dirtyFlag(+0x2e9) = 1;
 *        self.inOut422FilterMode(+0x40c) = uint32(enum);
 */
export function hgColorGamma_SetInOut422FilterMode(
  self: HGColorGammaM2,
  mode: HgColorGammaInOut422FilterMode,
): void {
  // @0xfb36c
  HGNode_ClearBits(self);
  // @0xfb371
  self.dirtyFlag = 1;
  // @0xfb379  movl %ebx, 0x40c(%r14)
  self.inOut422FilterMode = mode | 0;
}

// ── Method 59: HGColorGamma::SetInOut422FilterRect(HGRect) ──────────────────────────
/**
 * HGColorGamma::SetInOut422FilterRect(HGRect).
 * @0x00000000000fb390..0x00000000000fb3a3 — direct two-qword store; no ClearBits, no dirtyFlag.
 * Body:  self.inOut422FilterRect_lo(+0x410) = rsi;
 *        self.inOut422FilterRect_hi(+0x418) = rdx;
 */
export function hgColorGamma_SetInOut422FilterRect(
  self: HGColorGammaM2,
  rect: HGRectValue,
): void {
  // @0xfb394  movq %rsi, 0x410(%rdi)
  self.inOut422FilterRect_lo = rect.lo;
  // @0xfb39b  movq %rdx, 0x418(%rdi)
  self.inOut422FilterRect_hi = rect.hi;
  // @0xfb3a2  popq %rbp; retq
}

// ── Dispatch table (assemble_class.py convention) ─────────────────────────────────────
export const HGColorGamma_m2_methods = {
  "HGColorGamma::m_GetChromaDownsampleF1Node()":                     hgColorGamma_m_GetChromaDownsampleF1Node,                                 // @0x00000000000fa130
  "HGColorGamma::m_Get2vuy_YXZXCollapseNode()":                      hgColorGamma_m_Get2vuy_YXZXCollapseNode,                                  // @0x00000000000fa1a0
  "HGColorGamma::m_Get2vuy_XYXZCollapseNode()":                      hgColorGamma_m_Get2vuy_XYXZCollapseNode,                                  // @0x00000000000fa210
  "HGColorGamma::m_Getv210_YXZXCollapseNode(HGRenderer*)":           hgColorGamma_m_Getv210_YXZXCollapseNode,                                  // @0x00000000000fa280
  "HGColorGamma::m_Getv216_YXZXCollapseNode()":                      hgColorGamma_m_Getv216_YXZXCollapseNode,                                  // @0x00000000000fa2e0
  "HGColorGamma::m_GetPixelFormatConversion_kV4B10Bit_BE_OutputNode()": hgColorGamma_m_GetPixelFormatConversion_kV4B10Bit_BE_OutputNode,       // @0x00000000000fa350
  "HGColorGamma::m_GetPixelFormatConversion_kV4S_BE_WXYZ_OutputNode()": hgColorGamma_m_GetPixelFormatConversion_kV4S_BE_WXYZ_OutputNode,       // @0x00000000000fa3c0
  "HGColorGamma::m_GetPixelFormatConversion_kV4B_WXYZ_OutputNode()":  hgColorGamma_m_GetPixelFormatConversion_kV4B_WXYZ_OutputNode,             // @0x00000000000fa430
  "HGColorGamma::m_GetPixelFormatConversion_kV4S_WXYZ_OutputNode()":  hgColorGamma_m_GetPixelFormatConversion_kV4S_WXYZ_OutputNode,             // @0x00000000000fa4a0
  "HGColorGamma::m_GetPixelFormatConversion_kV4F_WXYZ_OutputNode()":  hgColorGamma_m_GetPixelFormatConversion_kV4F_WXYZ_OutputNode,             // @0x00000000000fa510
  "HGColorGamma::CanLoadData(HGFormat)":                             hgColorGamma_CanLoadData,                                                 // @0x00000000000fa580
  "HGColorGamma::LoadMacroNodeParams()":                             hgColorGamma_LoadMacroNodeParams,                                         // @0x00000000000fb020
  "HGColorGamma::unpremultiplyShouldSanitizeAndClampUsingReturned(float&)": hgColorGamma_unpremultiplyShouldSanitizeAndClampUsingReturned,      // @0x00000000000fb210
  "HGColorGamma::PrepareOutputNode(HGRenderer*, HGRect, HGFormat)":  hgColorGamma_PrepareOutputNode,                                           // @0x00000000000fb2b0
  "HGColorGamma::label_B() const":                                   hgColorGamma_label_B,                                                     // @0x00000000000fb2d0
  "HGColorGamma::SetParameter(int, float, float, float, float)":     hgColorGamma_SetParameter,                                                // @0x00000000000fb2f0
  "HGColorGamma::SetFallbackMode(bool)":                             hgColorGamma_SetFallbackMode,                                             // @0x00000000000fb300
  "HGColorGamma::SetToneQualityMode(HGColorGamma::hgColorGammaToneQuality)": hgColorGamma_SetToneQualityMode,                                   // @0x00000000000fb330
  "HGColorGamma::SetInOut422FilterMode(HGColorGamma::hgColorGammaInOut422FilterMode)": hgColorGamma_SetInOut422FilterMode,                     // @0x00000000000fb360
  "HGColorGamma::SetInOut422FilterRect(HGRect)":                     hgColorGamma_SetInOut422FilterRect,                                       // @0x00000000000fb390
} as const;
