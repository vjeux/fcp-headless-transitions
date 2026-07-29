// raw-port: HGColorGamma (chunk m1) — Helium.framework (render layer)
//
// Framework binary: /Applications/Final Cut Pro.app/Contents/Frameworks/Helium.framework/
//   Versions/A/Helium (x86_64 slice; VA == offset within thin slice).
// This chunk ports methods [20..40) of the 84-method HGColorGamma class:
//   20 m_GetGammaUniformNode        @0x00000000000f9670
//   21 m_GetGammaMCNode             @0x00000000000f96d0
//   22 m_GetGammaNoPremultNode      @0x00000000000f9730
//   23 m_GetToneParamCurve1         @0x00000000000f9790
//   24 m_GetToneParamCurve2         @0x00000000000f9820
//   25 m_GetToneParamCurve3         @0x00000000000f98b0
//   26 m_GetToneParamCurve4         @0x00000000000f9940
//   27 m_GetGammaFittedNode         @0x00000000000f99d0
//   28 m_GetHDRFunctionNode(form)   @0x00000000000f9a30
//   29 m_Get1DLut                   @0x00000000000f9bd0
//   30 m_GetChromaUpsampleF1Node    @0x00000000000f9c60
//   31 m_GetBias1Node               @0x00000000000f9cd0
//   32 m_GetUnpremultiplyNode       @0x00000000000f9d40
//   33 m_GetMatrix_1_Node           @0x00000000000f9e80
//   34 m_GetMatrix_2_Node           @0x00000000000f9ee0
//   35 m_GetPremultiplyNode         @0x00000000000f9f40
//   36 m_GetBias2Node               @0x00000000000f9fa0
//   37 m_GetDitherNode              @0x00000000000fa010
//   38 m_GetCropNode                @0x00000000000fa070
//   39 m_GetTextureWrapNode         @0x00000000000fa0d0
//
// DECODE: raw-port/re/disasm/Helium.HGColorGamma.m_Get*.s (one .s per method).
//
// PATTERN. Every getter is a lazy-init single-slot cache:
//   if (self.slot != nullptr) return self.slot;
//   p = HGObject::operator new(sz);
//   [optional] ___bzero(p, sz);                     // present for chroma-upsample + bias1/bias2
//   <SubNodeClass>::<C1/C2>(p, [ctor args]);
//   [optional] *(void**)p = &<vtable>[+0x10];       // present for chroma-upsample + bias1/bias2
//   self.slot = p;
//   return p;
// The four ToneParamCurve methods insert a byte-flag gate before the cache read (see below);
// m_GetHDRFunctionNode dispatches on a param and picks one of 9 HGPQ/HGHLG/HGACEScct/HGSony
// leaf ctors; m_GetUnpremultiplyNode dispatches on self.modeEnum_404 and picks between
// HgcUnpremultiply and HgcUnpremultiplySanitized (the sanitized path takes an f32 arg from
// either the mode-13/14 constant tables or a 19-entry f32 LUT at .rodata + 0x3d0ca4).
//
// LAYOUT ADDITIONS RECOVERED IN THIS CHUNK (all `HGNode*` unless noted).
//   +0x1a8  matrix1               HGColorMatrix* (@f9e98/f9eab, sz=0x1f0)
//   +0x1b0  matrix2               HGColorMatrix* (@f9ef8/f9f0b, sz=0x1f0)
//   +0x1b8  gammaUniform          HGGamma*       (@f9688/f969b, sz=0x1b0)
//   +0x1c0  gammaMC               HGGammaMC*     (@f96e8/f96fb, sz=0x1c0)
//   +0x1c8  gammaNoPremult        HGGamma*       (@f9748/f975b, sz=0x1b0; +SetPremultiplyState(false))
//   +0x1d0  gammaFitted           HGToneCurve*   (@f99e8/f99fb, sz=0x1e0)
//   +0x210  bias1                 HGCColorGamma_bias*             (sz=0x1a0, bzero, vtable install)
//   +0x220  bias2                 HGCColorGamma_bias*             (sz=0x1a0, bzero, vtable install)
//   +0x240  premultiply           HgcPremultiply*                 (sz=0x1a0)
//   +0x248  unpremultiply         HgcUnpremultiply* OR HgcUnpremultiplySanitized* (sz=0x1a0)
//   +0x258  chromaUpsampleF1      HGCColorGamma_chroma_upsample_f1* (sz=0x1a0, bzero, vtable install)
//   +0x280  oneDLut               HGApply1DLUT*                   (sz=0x1d0)
//   +0x288  hdrFunctionNode       HGPQ/HGHLG/HGACEScct/HGSony*    (sz=0x1b0 or 0x1a0)
//   +0x290  toneParamCurve1       HgcToneParamCurve1*             (sz=0x1a0)
//   +0x298  toneParamCurve2       HgcToneParamCurve2*             (sz=0x1a0)
//   +0x2a0  toneParamCurve3       HgcToneParamCurve3*             (sz=0x1a0)
//   +0x2a8  toneParamCurve4       HgcToneParamCurve4*             (sz=0x1a0)
//   +0x2b0  toneParamCurve1AS     HgcToneParamCurve1AntiSymmetric*
//   +0x2b8  toneParamCurve2AS     HgcToneParamCurve2AntiSymmetric*
//   +0x2c0  toneParamCurve3AS     HgcToneParamCurve3AntiSymmetric*
//   +0x2c8  toneParamCurve4AS     HgcToneParamCurve4AntiSymmetric*
//   +0x2d0  crop                  HGCrop*        (@fa088/fa09b, sz=0x1a0)
//   +0x2d8  textureWrap           HGTextureWrap* (@fa0e8/fa0fb, sz=0x1d0)
//   +0x2e0  dither                HGDither*      (@fa028/fa03b, sz=0x1d0)
//   +0x404  uint32 conversionMode   — dispatch key for m_GetUnpremultiplyNode (case = mode-5).
//   +0x408  uint64 unpremultSanitizedLutIdx — mode-5 path; indexes the 19-entry f32 LUT.
//   +0x480  uint32 oneDLut.count             — first HGApply1DLUT ctor arg.
//   +0x484  float  oneDLut.lo                — second HGApply1DLUT ctor arg.
//   +0x488  float  oneDLut.hi                — third HGApply1DLUT ctor arg.
//   +0x496  uint8  unpremultIsSanitized      — sticky flag set at end of unpremultiply-node build.
//   +0x497  uint8  toneParamCurveAntiSymmetric — dispatch flag for m_GetToneParamCurve[1..4].
//                                              1 → return anti-symmetric slot (+0x2b0..+0x2c8);
//                                              0 → return plain slot (+0x290..+0x2a8).
//
// ── Frontier callees (loud throw citing @0xADDR — Spec Rule 3) ─────────────────────
//   HGObject::operator new(unsigned long)                @0x00000000000f9690 (and every ~30-line getter head)
//   HGObject::operator delete(void*)                     @0x00000000000f96b5 (unwind edge)
//   ___bzero(void*, size_t)                              @stub 0x3c4fca
//   HGGamma::HGGamma()                                   @0x00000000000f969b
//   HGGamma::SetPremultiplyState(bool)                   @0x00000000000f976c
//   HGGammaMC::HGGammaMC()                               @0x00000000000f96fb
//   HGToneCurve::HGToneCurve()                           @0x00000000000f99fb
//   HgcToneParamCurve1::HgcToneParamCurve1()             @0x00000000000f97d0
//   HgcToneParamCurve1AntiSymmetric::ctor                @0x00000000000f97f7
//   HgcToneParamCurve2::HgcToneParamCurve2()             @0x00000000000f9860
//   HgcToneParamCurve2AntiSymmetric::ctor                @0x00000000000f9887
//   HgcToneParamCurve3::HgcToneParamCurve3()             @0x00000000000f98f0
//   HgcToneParamCurve3AntiSymmetric::ctor                @0x00000000000f9917
//   HgcToneParamCurve4::HgcToneParamCurve4()             @0x00000000000f9980
//   HgcToneParamCurve4AntiSymmetric::ctor                @0x00000000000f99a7
//   HGPQ::kDefault (rodata pointer)                      @qword *(RIP+0x908826) → 0x3d1248 (read at ctor call)
//   HGPQ::EOTF::EOTF(double)                             @0x00000000000f9a9c
//   HGPQ::InverseEOTF::InverseEOTF(double)               @0x00000000000f9b3a
//   HGPQ::OETF::OETF(bool, double)                       @0x00000000000f9ac3
//   HGPQ::InverseOETF::InverseOETF(bool, double)         @0x00000000000f9aea
//   HGHLG::OETF::OETF()                                  @0x00000000000f9a77
//   HGHLG::InverseOETF::InverseOETF()                    @0x00000000000f9b18
//   HGACEScct::Decode::Decode()                          @0x00000000000f9b01
//   HGACEScct::Encode::Encode()                          @0x00000000000f9b51
//   HGSony709_800_MLUT::HGSony709_800_MLUT()             @0x00000000000f9b68
//   HGApply1DLUT::HGApply1DLUT(uint32, f32, f32, b, b, b, b, b, b)  @0x00000000000f9c32
//   HGColorMatrix::HGColorMatrix()                       @0x00000000000f9eab (also f9f0b)
//   HgcPremultiply::HgcPremultiply()                     @0x00000000000f9f6b
//   HgcUnpremultiply::HgcUnpremultiply()                 @0x00000000000f9d9b
//   HgcUnpremultiplySanitized::HgcUnpremultiplySanitized()          @0x00000000000f9def
//   HgcUnpremultiplySanitized::<vslot 0x60>(esi=0,xmm0=arg,xmm1..3=0)  @0x00000000000f9e0d
//   HGCColorGamma_bias::HGCColorGamma_bias()             @0x00000000000f9d09 (via C2 — ctor + vtable install)
//   HGCColorGamma_chroma_upsample_f1::ctor               @0x00000000000f9c99 (via C2 — ctor + vtable install)
//   HgcColorGamma_bias::HgcColorGamma_bias()             @0x00000000000f9fd9
//   HGDither::HGDither()                                 @0x00000000000fa03b
//   HGCrop::HGCrop()                                     @0x00000000000fa09b
//   HGTextureWrap::HGTextureWrap()                       @0x00000000000fa0fb
//   vtable for HGCColorGamma_chroma_upsample_f1          @0xa15138 (installed ptr 0xa15148)
//   vtable for HGCColorGamma_bias                        @0xa14c88 (installed ptr 0xa14c98)
//   __Unwind_Resume                                      @stub 0x3c4e02

// Opaque frontier types (all HGNode subclass leaves; math lives in Metal shader source, not the
// C++ body — these expand-node C++ classes are ctor + descriptor plumbing).
export interface HGColorMatrixOpaque              { readonly __hgcm: unique symbol; }
export interface HGGammaOpaque                    { readonly __hggm: unique symbol; }
export interface HGGammaMCOpaque                  { readonly __hggmc: unique symbol; }
export interface HGToneCurveOpaque                { readonly __hgtc: unique symbol; }
export interface HgcToneParamCurve1Opaque         { readonly __hgtpc1:  unique symbol; }
export interface HgcToneParamCurve2Opaque         { readonly __hgtpc2:  unique symbol; }
export interface HgcToneParamCurve3Opaque         { readonly __hgtpc3:  unique symbol; }
export interface HgcToneParamCurve4Opaque         { readonly __hgtpc4:  unique symbol; }
export interface HgcToneParamCurve1AntiSymOpaque  { readonly __hgtpc1a: unique symbol; }
export interface HgcToneParamCurve2AntiSymOpaque  { readonly __hgtpc2a: unique symbol; }
export interface HgcToneParamCurve3AntiSymOpaque  { readonly __hgtpc3a: unique symbol; }
export interface HgcToneParamCurve4AntiSymOpaque  { readonly __hgtpc4a: unique symbol; }
export interface HGHDRFunctionNodeOpaque          { readonly __hgpqhlg: unique symbol; }
export interface HGApply1DLUTOpaque               { readonly __hg1dlut: unique symbol; }
export interface HGCColorGammaChromaUpsampleF1Opaque { readonly __hgcuf1: unique symbol; }
export interface HGCColorGammaBiasOpaque          { readonly __hgcbias: unique symbol; }
export interface HgcPremultiplyOpaque             { readonly __hgcprem: unique symbol; }
export interface HgcUnpremultiplyOpaque           { readonly __hgcunp:  unique symbol; }
export interface HgcUnpremultiplySanitizedOpaque  { readonly __hgcunps: unique symbol; }
export interface HGCropOpaque                     { readonly __hgcrop: unique symbol; }
export interface HGTextureWrapOpaque              { readonly __hgtw:   unique symbol; }
export interface HGDitherOpaque                   { readonly __hgdith: unique symbol; }
export type HGColorGammaUnpremultOpaque = HgcUnpremultiplyOpaque | HgcUnpremultiplySanitizedOpaque;

/**
 * Chunk-m1 view of the HGColorGamma object. Extends the chunk-m0 view with every field this
 * chunk touches. Field offsets are recovered from the disasm (see LAYOUT ADDITIONS above).
 */
export interface HGColorGammaM1 {
  matrix1:               HGColorMatrixOpaque | null;              // +0x1a8
  matrix2:               HGColorMatrixOpaque | null;              // +0x1b0
  gammaUniform:          HGGammaOpaque | null;                    // +0x1b8
  gammaMC:               HGGammaMCOpaque | null;                  // +0x1c0
  gammaNoPremult:        HGGammaOpaque | null;                    // +0x1c8
  gammaFitted:           HGToneCurveOpaque | null;                // +0x1d0
  bias1:                 HGCColorGammaBiasOpaque | null;          // +0x210
  bias2:                 HGCColorGammaBiasOpaque | null;          // +0x220
  premultiply:           HgcPremultiplyOpaque | null;             // +0x240
  unpremultiply:         HGColorGammaUnpremultOpaque | null;      // +0x248
  chromaUpsampleF1:      HGCColorGammaChromaUpsampleF1Opaque | null; // +0x258
  oneDLut:               HGApply1DLUTOpaque | null;               // +0x280
  hdrFunctionNode:       HGHDRFunctionNodeOpaque | null;          // +0x288
  toneParamCurve1:       HgcToneParamCurve1Opaque | null;         // +0x290
  toneParamCurve2:       HgcToneParamCurve2Opaque | null;         // +0x298
  toneParamCurve3:       HgcToneParamCurve3Opaque | null;         // +0x2a0
  toneParamCurve4:       HgcToneParamCurve4Opaque | null;         // +0x2a8
  toneParamCurve1AS:     HgcToneParamCurve1AntiSymOpaque | null;  // +0x2b0
  toneParamCurve2AS:     HgcToneParamCurve2AntiSymOpaque | null;  // +0x2b8
  toneParamCurve3AS:     HgcToneParamCurve3AntiSymOpaque | null;  // +0x2c0
  toneParamCurve4AS:     HgcToneParamCurve4AntiSymOpaque | null;  // +0x2c8
  crop:                  HGCropOpaque | null;                     // +0x2d0
  textureWrap:           HGTextureWrapOpaque | null;              // +0x2d8
  dither:                HGDitherOpaque | null;                   // +0x2e0
  conversionMode:        number;                                  // +0x404 (uint32)
  unpremultSanitizedLutIdx: number;                               // +0x408 (uint64, treated as index)
  oneDLutCount:          number;                                  // +0x480 (uint32)
  oneDLutLo:             number;                                  // +0x484 (f32)
  oneDLutHi:             number;                                  // +0x488 (f32)
  unpremultIsSanitized:  number;                                  // +0x496 (uint8)
  toneParamCurveAntiSymmetric: number;                            // +0x497 (uint8)
}

// ── Frontier stubs (throw-with-addr per Spec Rule 3) ─────────────────────────────────

/** HGObject::operator new(unsigned long) — heap allocator for HGNode leaves.
 *  Called from every getter head, e.g. @0x00000000000f9690 (m_GetGammaUniformNode). */
function HGObject_operator_new(_sz: number): unknown {
  throw new Error(
    "raw-port: HGObject::operator new(unsigned long) not yet transcribed " +
    "(called from HGColorGamma::m_Get*Node lazy-init heads — first site @0x00000000000f9690 — Helium)",
  );
}

/** HGGamma::HGGamma() — sub-node ctor. Call sites @0x00000000000f969b, @0x00000000000f975b. */
function HGGamma_ctor(_p: HGGammaOpaque): void {
  throw new Error(
    "raw-port: HGGamma::HGGamma() not yet transcribed " +
    "(called from HGColorGamma::m_GetGammaUniformNode @0x00000000000f969b and " +
    "m_GetGammaNoPremultNode @0x00000000000f975b — Helium)",
  );
}
/** HGGamma::SetPremultiplyState(bool). Site @0x00000000000f976c. */
function HGGamma_SetPremultiplyState(_p: HGGammaOpaque, _premult: boolean): void {
  throw new Error(
    "raw-port: HGGamma::SetPremultiplyState(bool) not yet transcribed " +
    "(called from HGColorGamma::m_GetGammaNoPremultNode @0x00000000000f976c — Helium)",
  );
}
/** HGGammaMC::HGGammaMC(). Site @0x00000000000f96fb. */
function HGGammaMC_ctor(_p: HGGammaMCOpaque): void {
  throw new Error(
    "raw-port: HGGammaMC::HGGammaMC() not yet transcribed " +
    "(called from HGColorGamma::m_GetGammaMCNode @0x00000000000f96fb — Helium)",
  );
}
/** HGToneCurve::HGToneCurve(). Site @0x00000000000f99fb. */
function HGToneCurve_ctor(_p: HGToneCurveOpaque): void {
  throw new Error(
    "raw-port: HGToneCurve::HGToneCurve() not yet transcribed " +
    "(called from HGColorGamma::m_GetGammaFittedNode @0x00000000000f99fb — Helium)",
  );
}
/** HgcToneParamCurve1::HgcToneParamCurve1(). Site @0x00000000000f97d0. */
function HgcToneParamCurve1_ctor(_p: HgcToneParamCurve1Opaque): void {
  throw new Error(
    "raw-port: HgcToneParamCurve1::HgcToneParamCurve1() not yet transcribed " +
    "(called from HGColorGamma::m_GetToneParamCurve1 @0x00000000000f97d0 — Helium)",
  );
}
/** HgcToneParamCurve1AntiSymmetric::ctor. Site @0x00000000000f97f7. */
function HgcToneParamCurve1AntiSymmetric_ctor(_p: HgcToneParamCurve1AntiSymOpaque): void {
  throw new Error(
    "raw-port: HgcToneParamCurve1AntiSymmetric::HgcToneParamCurve1AntiSymmetric() " +
    "not yet transcribed (called from m_GetToneParamCurve1 @0x00000000000f97f7 — Helium)",
  );
}
/** HgcToneParamCurve2::HgcToneParamCurve2(). Site @0x00000000000f9860. */
function HgcToneParamCurve2_ctor(_p: HgcToneParamCurve2Opaque): void {
  throw new Error(
    "raw-port: HgcToneParamCurve2::HgcToneParamCurve2() not yet transcribed " +
    "(called from m_GetToneParamCurve2 @0x00000000000f9860 — Helium)",
  );
}
/** HgcToneParamCurve2AntiSymmetric::ctor. Site @0x00000000000f9887. */
function HgcToneParamCurve2AntiSymmetric_ctor(_p: HgcToneParamCurve2AntiSymOpaque): void {
  throw new Error(
    "raw-port: HgcToneParamCurve2AntiSymmetric::HgcToneParamCurve2AntiSymmetric() " +
    "not yet transcribed (called from m_GetToneParamCurve2 @0x00000000000f9887 — Helium)",
  );
}
/** HgcToneParamCurve3::HgcToneParamCurve3(). Site @0x00000000000f98f0. */
function HgcToneParamCurve3_ctor(_p: HgcToneParamCurve3Opaque): void {
  throw new Error(
    "raw-port: HgcToneParamCurve3::HgcToneParamCurve3() not yet transcribed " +
    "(called from m_GetToneParamCurve3 @0x00000000000f98f0 — Helium)",
  );
}
/** HgcToneParamCurve3AntiSymmetric::ctor. Site @0x00000000000f9917. */
function HgcToneParamCurve3AntiSymmetric_ctor(_p: HgcToneParamCurve3AntiSymOpaque): void {
  throw new Error(
    "raw-port: HgcToneParamCurve3AntiSymmetric::HgcToneParamCurve3AntiSymmetric() " +
    "not yet transcribed (called from m_GetToneParamCurve3 @0x00000000000f9917 — Helium)",
  );
}
/** HgcToneParamCurve4::HgcToneParamCurve4(). Site @0x00000000000f9980. */
function HgcToneParamCurve4_ctor(_p: HgcToneParamCurve4Opaque): void {
  throw new Error(
    "raw-port: HgcToneParamCurve4::HgcToneParamCurve4() not yet transcribed " +
    "(called from m_GetToneParamCurve4 @0x00000000000f9980 — Helium)",
  );
}
/** HgcToneParamCurve4AntiSymmetric::ctor. Site @0x00000000000f99a7. */
function HgcToneParamCurve4AntiSymmetric_ctor(_p: HgcToneParamCurve4AntiSymOpaque): void {
  throw new Error(
    "raw-port: HgcToneParamCurve4AntiSymmetric::HgcToneParamCurve4AntiSymmetric() " +
    "not yet transcribed (called from m_GetToneParamCurve4 @0x00000000000f99a7 — Helium)",
  );
}

/** HGPQ::kDefault — .rodata double at 0x3d1248 (100.0), reached via .literal-pool ptr at 0xa022b8.
 *  Read by HDRFunctionNode cases PQ EOTF (@0x00000000000f9a92) and PQ InverseEOTF (@0x00000000000f9b30). */
function HGPQ_kDefault(): number {
  throw new Error(
    "raw-port: HGPQ::kDefault (@0x00000000000a022b8 → 0x3d1248) not yet transcribed " +
    "(read by HGColorGamma::m_GetHDRFunctionNode @0x00000000000f9a92 & @0x00000000000f9b30 — Helium; " +
    "raw bit pattern is IEEE754 double 100.0)",
  );
}
/** HGPQ::EOTF::EOTF(double). Site @0x00000000000f9a9c. */
function HGPQ_EOTF_ctor(_p: HGHDRFunctionNodeOpaque, _kDefault: number): void {
  throw new Error(
    "raw-port: HGPQ::EOTF::EOTF(double) not yet transcribed " +
    "(called from m_GetHDRFunctionNode @0x00000000000f9a9c — Helium)",
  );
}
/** HGPQ::InverseEOTF::InverseEOTF(double). Site @0x00000000000f9b3a. */
function HGPQ_InverseEOTF_ctor(_p: HGHDRFunctionNodeOpaque, _kDefault: number): void {
  throw new Error(
    "raw-port: HGPQ::InverseEOTF::InverseEOTF(double) not yet transcribed " +
    "(called from m_GetHDRFunctionNode @0x00000000000f9b3a — Helium)",
  );
}
/** HGPQ::OETF::OETF(bool, double).
 *  Site @0x00000000000f9ac3; second arg is IEEE754 double 100.0 at RIP-relative +0x3cd278. */
function HGPQ_OETF_ctor(_p: HGHDRFunctionNodeOpaque, _b: boolean, _d: number): void {
  throw new Error(
    "raw-port: HGPQ::OETF::OETF(bool, double) not yet transcribed " +
    "(called from m_GetHDRFunctionNode @0x00000000000f9ac3 — Helium)",
  );
}
/** HGPQ::InverseOETF::InverseOETF(bool, double).
 *  Site @0x00000000000f9aea; second arg is IEEE754 double 100.0 at RIP-relative +0x3cd278. */
function HGPQ_InverseOETF_ctor(_p: HGHDRFunctionNodeOpaque, _b: boolean, _d: number): void {
  throw new Error(
    "raw-port: HGPQ::InverseOETF::InverseOETF(bool, double) not yet transcribed " +
    "(called from m_GetHDRFunctionNode @0x00000000000f9aea — Helium)",
  );
}
/** HGHLG::OETF::OETF(). Site @0x00000000000f9a77. */
function HGHLG_OETF_ctor(_p: HGHDRFunctionNodeOpaque): void {
  throw new Error(
    "raw-port: HGHLG::OETF::OETF() not yet transcribed " +
    "(called from m_GetHDRFunctionNode @0x00000000000f9a77 — Helium)",
  );
}
/** HGHLG::InverseOETF::InverseOETF(). Site @0x00000000000f9b18. */
function HGHLG_InverseOETF_ctor(_p: HGHDRFunctionNodeOpaque): void {
  throw new Error(
    "raw-port: HGHLG::InverseOETF::InverseOETF() not yet transcribed " +
    "(called from m_GetHDRFunctionNode @0x00000000000f9b18 — Helium)",
  );
}
/** HGACEScct::Decode::Decode(). Site @0x00000000000f9b01. */
function HGACEScct_Decode_ctor(_p: HGHDRFunctionNodeOpaque): void {
  throw new Error(
    "raw-port: HGACEScct::Decode::Decode() not yet transcribed " +
    "(called from m_GetHDRFunctionNode @0x00000000000f9b01 — Helium)",
  );
}
/** HGACEScct::Encode::Encode(). Site @0x00000000000f9b51. */
function HGACEScct_Encode_ctor(_p: HGHDRFunctionNodeOpaque): void {
  throw new Error(
    "raw-port: HGACEScct::Encode::Encode() not yet transcribed " +
    "(called from m_GetHDRFunctionNode @0x00000000000f9b51 — Helium)",
  );
}
/** HGSony709_800_MLUT::HGSony709_800_MLUT(). Site @0x00000000000f9b68. */
function HGSony709_800_MLUT_ctor(_p: HGHDRFunctionNodeOpaque): void {
  throw new Error(
    "raw-port: HGSony709_800_MLUT::HGSony709_800_MLUT() not yet transcribed " +
    "(called from m_GetHDRFunctionNode @0x00000000000f9b68 — Helium)",
  );
}

/** HGApply1DLUT::HGApply1DLUT(uint32, float, float, bool, bool, bool, bool, bool, bool).
 *  Site @0x00000000000f9c32. All six trailing bools hard-coded to (true,true,true,true,true,false)
 *  by the m_Get1DLut caller (see method body). */
function HGApply1DLUT_ctor(
  _p: HGApply1DLUTOpaque, _n: number, _lo: number, _hi: number,
  _b0: boolean, _b1: boolean, _b2: boolean, _b3: boolean, _b4: boolean, _b5: boolean,
): void {
  throw new Error(
    "raw-port: HGApply1DLUT::HGApply1DLUT(uint32, float, float, b, b, b, b, b, b) " +
    "not yet transcribed (called from HGColorGamma::m_Get1DLut @0x00000000000f9c32 — Helium)",
  );
}

/** HGColorMatrix::HGColorMatrix(). Sites @0x00000000000f9eab, @0x00000000000f9f0b. */
function HGColorMatrix_ctor(_p: HGColorMatrixOpaque): void {
  throw new Error(
    "raw-port: HGColorMatrix::HGColorMatrix() not yet transcribed " +
    "(called from m_GetMatrix_1_Node @0x00000000000f9eab and " +
    "m_GetMatrix_2_Node @0x00000000000f9f0b — Helium)",
  );
}
/** HgcPremultiply::HgcPremultiply(). Site @0x00000000000f9f6b. */
function HgcPremultiply_ctor(_p: HgcPremultiplyOpaque): void {
  throw new Error(
    "raw-port: HgcPremultiply::HgcPremultiply() not yet transcribed " +
    "(called from m_GetPremultiplyNode @0x00000000000f9f6b — Helium)",
  );
}
/** HgcUnpremultiply::HgcUnpremultiply(). Site @0x00000000000f9d9b. */
function HgcUnpremultiply_ctor(_p: HgcUnpremultiplyOpaque): void {
  throw new Error(
    "raw-port: HgcUnpremultiply::HgcUnpremultiply() not yet transcribed " +
    "(called from m_GetUnpremultiplyNode @0x00000000000f9d9b — Helium)",
  );
}
/** HgcUnpremultiplySanitized::HgcUnpremultiplySanitized(). Site @0x00000000000f9def. */
function HgcUnpremultiplySanitized_ctor(_p: HgcUnpremultiplySanitizedOpaque): void {
  throw new Error(
    "raw-port: HgcUnpremultiplySanitized::HgcUnpremultiplySanitized() not yet transcribed " +
    "(called from m_GetUnpremultiplyNode @0x00000000000f9def — Helium)",
  );
}
/** Virtual slot [+0x60] on HgcUnpremultiplySanitized. Called with esi=0, xmm0=setup arg, xmm1..3=0.
 *  Vtable is opaque here (base HGNode subclass). Site @0x00000000000f9e0d. */
function HgcUnpremultiplySanitized_vslot60(
  _p: HgcUnpremultiplySanitizedOpaque, _esi: number, _xmm0: number,
  _xmm1: number, _xmm2: number, _xmm3: number,
): void {
  throw new Error(
    "raw-port: HgcUnpremultiplySanitized::<vtable*0x60>(int, f32, f32, f32, f32) " +
    "not yet transcribed (called from m_GetUnpremultiplyNode @0x00000000000f9e0d — Helium)",
  );
}
/** HGCColorGamma_bias::HGCColorGamma_bias() — C2 base ctor.
 *  Sites @0x00000000000f9d09 (bias1) and @0x00000000000f9fd9 (bias2). */
function HGCColorGamma_bias_ctor_C2(_p: HGCColorGammaBiasOpaque): void {
  throw new Error(
    "raw-port: HGCColorGamma_bias::HGCColorGamma_bias() (C2) not yet transcribed " +
    "(called from m_GetBias1Node @0x00000000000f9d09 and m_GetBias2Node @0x00000000000f9fd9 — Helium)",
  );
}
/** HGCColorGamma_chroma_upsample_f1::HGCColorGamma_chroma_upsample_f1() — C2 base ctor.
 *  Site @0x00000000000f9c99. */
function HGCColorGamma_chroma_upsample_f1_ctor_C2(
  _p: HGCColorGammaChromaUpsampleF1Opaque,
): void {
  throw new Error(
    "raw-port: HGCColorGamma_chroma_upsample_f1::HGCColorGamma_chroma_upsample_f1() (C2) " +
    "not yet transcribed (called from m_GetChromaUpsampleF1Node @0x00000000000f9c99 — Helium)",
  );
}
/** HGCrop::HGCrop(). Site @0x00000000000fa09b. */
function HGCrop_ctor(_p: HGCropOpaque): void {
  throw new Error(
    "raw-port: HGCrop::HGCrop() not yet transcribed " +
    "(called from m_GetCropNode @0x00000000000fa09b — Helium)",
  );
}
/** HGTextureWrap::HGTextureWrap(). Site @0x00000000000fa0fb. */
function HGTextureWrap_ctor(_p: HGTextureWrapOpaque): void {
  throw new Error(
    "raw-port: HGTextureWrap::HGTextureWrap() not yet transcribed " +
    "(called from m_GetTextureWrapNode @0x00000000000fa0fb — Helium)",
  );
}
/** HGDither::HGDither(). Site @0x00000000000fa03b. */
function HGDither_ctor(_p: HGDitherOpaque): void {
  throw new Error(
    "raw-port: HGDither::HGDither() not yet transcribed " +
    "(called from m_GetDitherNode @0x00000000000fa03b — Helium)",
  );
}

// ── vtable-install helpers ────────────────────────────────────────────────────────────

/** Stamp the C++ vtable pointer into offset 0 of a freshly-constructed HGCColorGamma_bias.
 *  In the disasm this is `movq %rcx, (%rbx)` where rcx = (RIP + 0x91af83) → &vtable+0x10.
 *  Sites: m_GetBias1Node @0x00000000000f9d18, m_GetBias2Node @0x00000000000f9fe8. */
function HGCColorGamma_bias_installVtable(_p: HGCColorGammaBiasOpaque): void {
  throw new Error(
    "raw-port: install (vtable for HGCColorGamma_bias)+0x10 (@Helium 0xa14c98) into obj[0] " +
    "not yet transcribed (@0x00000000000f9d18 & @0x00000000000f9fe8 — Helium)",
  );
}
/** Stamp the C++ vtable pointer into offset 0 of a freshly-constructed
 *  HGCColorGamma_chroma_upsample_f1 — installed ptr 0xa15148.
 *  Site: m_GetChromaUpsampleF1Node @0x00000000000f9ca8. */
function HGCColorGamma_chroma_upsample_f1_installVtable(
  _p: HGCColorGammaChromaUpsampleF1Opaque,
): void {
  throw new Error(
    "raw-port: install (vtable for HGCColorGamma_chroma_upsample_f1)+0x10 (@Helium 0xa15148) " +
    "into obj[0] not yet transcribed (@0x00000000000f9ca8 — Helium)",
  );
}
/** ___bzero(void*, size_t) — libc zero-fill. Site (e.g.) @0x00000000000f9c8e. */
function libc_bzero(_p: unknown, _n: number): void {
  throw new Error(
    "raw-port: ___bzero(void*, size_t) not yet transcribed " +
    "(called from HGColorGamma::m_GetChromaUpsampleF1Node @0x00000000000f9c8e — Helium symbol stub)",
  );
}

// ── Ported method bodies ─────────────────────────────────────────────────────────────

/**
 * HGColorGamma::m_GetGammaUniformNode().
 * @0x00000000000f9670..0x00000000000f96ae
 * Body:
 *   if (self.gammaUniform != nullptr) return self.gammaUniform;   // @0x00000000000f9677
 *   p = HGObject::operator new(0x1b0);                             // @0x00000000000f968b/90
 *   HGGamma::HGGamma(p);                                           // @0x00000000000f969b
 *   self.gammaUniform = p;                                         // @0x00000000000f96a3
 *   return p;                                                      // @0x00000000000f96a0
 */
export function hgColorGamma_m_GetGammaUniformNode(self: HGColorGammaM1): HGGammaOpaque {
  // @0x00000000000f9677
  if (self.gammaUniform !== null) return self.gammaUniform;
  // @0x00000000000f968b..0x00000000000f9695
  const p = HGObject_operator_new(0x1b0) as HGGammaOpaque;
  // @0x00000000000f969b
  HGGamma_ctor(p);
  // @0x00000000000f96a3
  self.gammaUniform = p;
  return p;
}

/**
 * HGColorGamma::m_GetGammaMCNode().
 * @0x00000000000f96d0..0x00000000000f970e
 * Same lazy-init shape as m_GetGammaUniformNode, allocs sz=0x1c0, ctor HGGammaMC.
 */
export function hgColorGamma_m_GetGammaMCNode(self: HGColorGammaM1): HGGammaMCOpaque {
  // @0x00000000000f96d7
  if (self.gammaMC !== null) return self.gammaMC;
  // @0x00000000000f96eb..0x00000000000f96f5
  const p = HGObject_operator_new(0x1c0) as HGGammaMCOpaque;
  // @0x00000000000f96fb
  HGGammaMC_ctor(p);
  // @0x00000000000f9703
  self.gammaMC = p;
  return p;
}

/**
 * HGColorGamma::m_GetGammaNoPremultNode().
 * @0x00000000000f9730..0x00000000000f977c
 * Body:
 *   if (self.gammaNoPremult != nullptr) return self.gammaNoPremult;   // @0x00000000000f9737
 *   p = HGObject::operator new(0x1b0);                                 // @0x00000000000f974b/50
 *   HGGamma::HGGamma(p);                                               // @0x00000000000f975b
 *   self.gammaNoPremult = p;                                           // @0x00000000000f9760
 *   HGGamma::SetPremultiplyState(p, false);                            // @0x00000000000f976c
 *   return self.gammaNoPremult;                                        // @0x00000000000f9771
 */
export function hgColorGamma_m_GetGammaNoPremultNode(self: HGColorGammaM1): HGGammaOpaque {
  // @0x00000000000f9737
  if (self.gammaNoPremult !== null) return self.gammaNoPremult;
  // @0x00000000000f974b..0x00000000000f9755
  const p = HGObject_operator_new(0x1b0) as HGGammaOpaque;
  // @0x00000000000f975b
  HGGamma_ctor(p);
  // @0x00000000000f9760  self.gammaNoPremult = p (stored BEFORE the SetPremultiplyState call)
  self.gammaNoPremult = p;
  // @0x00000000000f976c
  HGGamma_SetPremultiplyState(p, false);
  // @0x00000000000f9771  reload self.gammaNoPremult and return it
  return self.gammaNoPremult;
}

// -- ToneParamCurve[1..4] share an identical CFG. They read the +0x497 anti-symmetric flag; if
// -- set, use the AS slot; otherwise the plain slot. Only the mismatched slot is instantiated
// -- (i.e. AS-flag=1 skips the plain check, AS-flag=0 skips the AS check).

/**
 * HGColorGamma::m_GetToneParamCurve1().
 * @0x00000000000f9790..0x00000000000f980a
 * Body (see decode):
 *   if (self.toneParamCurveAntiSymmetric != 1) goto plain;                   // @f9797
 *   if (self.toneParamCurve1AS != nullptr) return;                            // @f97a0/a7
 *   goto build_AS;                                                            // @f97e4
 *  plain:                                                                    // @f97b1
 *   if (self.toneParamCurve1 != nullptr) return;                              // @f97b1/b8
 *   p = new(0x1a0); HgcToneParamCurve1(p); self.toneParamCurve1 = p; return;  // @f97c0..d8
 *  build_AS:                                                                 // @f97e4
 *   p = new(0x1a0); HgcToneParamCurve1AntiSymmetric(p);
 *   self.toneParamCurve1AS = p; return;                                      // @f97e7..ff
 * Return type is void — every non-error path is a `retq` after storing the slot.
 */
export function hgColorGamma_m_GetToneParamCurve1(self: HGColorGammaM1): void {
  // @0x00000000000f9797
  if (self.toneParamCurveAntiSymmetric !== 1) {
    // @0x00000000000f97b1
    if (self.toneParamCurve1 !== null) return;
    // @0x00000000000f97c0..0x00000000000f97ca
    const p = HGObject_operator_new(0x1a0) as HgcToneParamCurve1Opaque;
    // @0x00000000000f97d0
    HgcToneParamCurve1_ctor(p);
    // @0x00000000000f97d8
    self.toneParamCurve1 = p;
    return;
  }
  // @0x00000000000f97a0
  if (self.toneParamCurve1AS !== null) return;
  // @0x00000000000f97e7..0x00000000000f97f1
  const q = HGObject_operator_new(0x1a0) as HgcToneParamCurve1AntiSymOpaque;
  // @0x00000000000f97f7
  HgcToneParamCurve1AntiSymmetric_ctor(q);
  // @0x00000000000f97ff
  self.toneParamCurve1AS = q;
}

/**
 * HGColorGamma::m_GetToneParamCurve2().
 * @0x00000000000f9820..0x00000000000f989a  — identical CFG to Curve1, alternate slots/ctors.
 */
export function hgColorGamma_m_GetToneParamCurve2(self: HGColorGammaM1): void {
  // @0x00000000000f9827
  if (self.toneParamCurveAntiSymmetric !== 1) {
    // @0x00000000000f9841
    if (self.toneParamCurve2 !== null) return;
    // @0x00000000000f9850..0x00000000000f985a
    const p = HGObject_operator_new(0x1a0) as HgcToneParamCurve2Opaque;
    // @0x00000000000f9860
    HgcToneParamCurve2_ctor(p);
    // @0x00000000000f9868
    self.toneParamCurve2 = p;
    return;
  }
  // @0x00000000000f9830
  if (self.toneParamCurve2AS !== null) return;
  // @0x00000000000f9877..0x00000000000f9881
  const q = HGObject_operator_new(0x1a0) as HgcToneParamCurve2AntiSymOpaque;
  // @0x00000000000f9887
  HgcToneParamCurve2AntiSymmetric_ctor(q);
  // @0x00000000000f988f
  self.toneParamCurve2AS = q;
}

/**
 * HGColorGamma::m_GetToneParamCurve3().
 * @0x00000000000f98b0..0x00000000000f992a  — identical CFG.
 */
export function hgColorGamma_m_GetToneParamCurve3(self: HGColorGammaM1): void {
  // @0x00000000000f98b7
  if (self.toneParamCurveAntiSymmetric !== 1) {
    // @0x00000000000f98d1
    if (self.toneParamCurve3 !== null) return;
    // @0x00000000000f98e0..0x00000000000f98ea
    const p = HGObject_operator_new(0x1a0) as HgcToneParamCurve3Opaque;
    // @0x00000000000f98f0
    HgcToneParamCurve3_ctor(p);
    // @0x00000000000f98f8
    self.toneParamCurve3 = p;
    return;
  }
  // @0x00000000000f98c0
  if (self.toneParamCurve3AS !== null) return;
  // @0x00000000000f9907..0x00000000000f9911
  const q = HGObject_operator_new(0x1a0) as HgcToneParamCurve3AntiSymOpaque;
  // @0x00000000000f9917
  HgcToneParamCurve3AntiSymmetric_ctor(q);
  // @0x00000000000f991f
  self.toneParamCurve3AS = q;
}

/**
 * HGColorGamma::m_GetToneParamCurve4().
 * @0x00000000000f9940..0x00000000000f99ba  — identical CFG.
 */
export function hgColorGamma_m_GetToneParamCurve4(self: HGColorGammaM1): void {
  // @0x00000000000f9947
  if (self.toneParamCurveAntiSymmetric !== 1) {
    // @0x00000000000f9961
    if (self.toneParamCurve4 !== null) return;
    // @0x00000000000f9970..0x00000000000f997a
    const p = HGObject_operator_new(0x1a0) as HgcToneParamCurve4Opaque;
    // @0x00000000000f9980
    HgcToneParamCurve4_ctor(p);
    // @0x00000000000f9988
    self.toneParamCurve4 = p;
    return;
  }
  // @0x00000000000f9950
  if (self.toneParamCurve4AS !== null) return;
  // @0x00000000000f9997..0x00000000000f99a1
  const q = HGObject_operator_new(0x1a0) as HgcToneParamCurve4AntiSymOpaque;
  // @0x00000000000f99a7
  HgcToneParamCurve4AntiSymmetric_ctor(q);
  // @0x00000000000f99af
  self.toneParamCurve4AS = q;
}

/**
 * HGColorGamma::m_GetGammaFittedNode().
 * @0x00000000000f99d0..0x00000000000f9a0e — trivial lazy-init.
 * Body: alloc 0x1e0 bytes, HGToneCurve::HGToneCurve(p), self.gammaFitted = p, return p.
 */
export function hgColorGamma_m_GetGammaFittedNode(self: HGColorGammaM1): HGToneCurveOpaque {
  // @0x00000000000f99d7
  if (self.gammaFitted !== null) return self.gammaFitted;
  // @0x00000000000f99eb..0x00000000000f99f5
  const p = HGObject_operator_new(0x1e0) as HGToneCurveOpaque;
  // @0x00000000000f99fb
  HGToneCurve_ctor(p);
  // @0x00000000000f9a03
  self.gammaFitted = p;
  return p;
}

/**
 * HGColorGamma::m_GetHDRFunctionNode(hgColorGammaForm form).
 * @0x00000000000f9a30..0x00000000000f9b82
 *
 * Body:
 *   if (self.hdrFunctionNode != nullptr) return self.hdrFunctionNode;   // @f9a37
 *   uint32 idx = (form - 0xa);                                           // @f9a48  subl $0xa,%esi
 *   if (idx > 0x8) return nullptr;                                       // @f9a4b  cmpl $0x8; ja→ret 0
 *   // .rodata jump table @0xf9ba8 (9 int32 disps, base = 0xf9ba8), indexed by idx:
 *   //   idx 0 (form 10) → f9a67  HGHLG::OETF
 *   //   idx 1 (form 11) → f9b08  HGHLG::InverseOETF
 *   //   idx 2 (form 12) → f9aa6  HGPQ::OETF(true,  100.0)
 *   //   idx 3 (form 13) → f9acd  HGPQ::InverseOETF(true, 100.0)
 *   //   idx 4 (form 14) → f9a81  HGPQ::EOTF(HGPQ::kDefault)
 *   //   idx 5 (form 15) → f9b1f  HGPQ::InverseEOTF(HGPQ::kDefault)
 *   //   idx 6 (form 16) → f9b41  HGACEScct::Encode
 *   //   idx 7 (form 17) → f9af1  HGACEScct::Decode
 *   //   idx 8 (form 18) → f9b58  HGSony709_800_MLUT
 *   p = HGObject::operator new(sz);
 *   <ctor>(p [, args]);
 *   self.hdrFunctionNode = p;
 *   return p;
 */
export function hgColorGamma_m_GetHDRFunctionNode(
  self: HGColorGammaM1,
  form: number,
): HGHDRFunctionNodeOpaque | null {
  // @0x00000000000f9a37
  if (self.hdrFunctionNode !== null) return self.hdrFunctionNode;
  // @0x00000000000f9a48
  const idx = (form - 0xa) | 0;
  // @0x00000000000f9a4b  cmpl $0x8,%esi  ja→ret 0
  if (idx < 0 || idx > 0x8) return null;
  // @0x00000000000f9a54..0x00000000000f9a65  computed jump — jump-table @ .rodata 0xf9ba8.
  let p: HGHDRFunctionNodeOpaque;
  switch (idx) {
    case 0: {
      // @0x00000000000f9a67  form 10 → HGHLG::OETF
      p = HGObject_operator_new(0x1b0) as HGHDRFunctionNodeOpaque;
      // @0x00000000000f9a77
      HGHLG_OETF_ctor(p);
      break;
    }
    case 1: {
      // @0x00000000000f9b08  form 11 → HGHLG::InverseOETF
      p = HGObject_operator_new(0x1b0) as HGHDRFunctionNodeOpaque;
      // @0x00000000000f9b18
      HGHLG_InverseOETF_ctor(p);
      break;
    }
    case 2: {
      // @0x00000000000f9aa6  form 12 → HGPQ::OETF(true, 100.0)
      p = HGObject_operator_new(0x1b0) as HGHDRFunctionNodeOpaque;
      // @0x00000000000f9ab0  movsd 0x2d37c0(%rip),%xmm0  (double @ .rodata 0x3cd278 = 100.0)
      // @0x00000000000f9abe  mov $0x1,%esi                (bool true)
      // @0x00000000000f9ac3
      HGPQ_OETF_ctor(p, true, 100.0);
      break;
    }
    case 3: {
      // @0x00000000000f9acd  form 13 → HGPQ::InverseOETF(true, 100.0)
      p = HGObject_operator_new(0x1b0) as HGHDRFunctionNodeOpaque;
      // @0x00000000000f9ad7  movsd 0x2d3799(%rip),%xmm0   (double @ 0x3cd278 = 100.0)
      // @0x00000000000f9aea
      HGPQ_InverseOETF_ctor(p, true, 100.0);
      break;
    }
    case 4: {
      // @0x00000000000f9a81  form 14 → HGPQ::EOTF(HGPQ::kDefault)
      p = HGObject_operator_new(0x1b0) as HGHDRFunctionNodeOpaque;
      // @0x00000000000f9a8b  movq 0x908826(%rip),%rcx  ← *(&HGPQ::kDefault at 0xa022b8) = ptr 0x3d1248
      // @0x00000000000f9a92  movsd (%rcx),%xmm0        ← *(double*)0x3d1248 = 100.0
      // @0x00000000000f9a9c
      HGPQ_EOTF_ctor(p, HGPQ_kDefault());
      break;
    }
    case 5: {
      // @0x00000000000f9b1f  form 15 → HGPQ::InverseEOTF(HGPQ::kDefault)
      p = HGObject_operator_new(0x1b0) as HGHDRFunctionNodeOpaque;
      // @0x00000000000f9b29  movq 0x908788(%rip),%rcx  ← *(&HGPQ::kDefault at 0xa022b8)
      // @0x00000000000f9b3a
      HGPQ_InverseEOTF_ctor(p, HGPQ_kDefault());
      break;
    }
    case 6: {
      // @0x00000000000f9b41  form 16 → HGACEScct::Encode
      p = HGObject_operator_new(0x1b0) as HGHDRFunctionNodeOpaque;
      // @0x00000000000f9b51
      HGACEScct_Encode_ctor(p);
      break;
    }
    case 7: {
      // @0x00000000000f9af1  form 17 → HGACEScct::Decode
      p = HGObject_operator_new(0x1b0) as HGHDRFunctionNodeOpaque;
      // @0x00000000000f9b01
      HGACEScct_Decode_ctor(p);
      break;
    }
    case 8: {
      // @0x00000000000f9b58  form 18 → HGSony709_800_MLUT (NB: allocation is 0x1a0, not 0x1b0)
      p = HGObject_operator_new(0x1a0) as HGHDRFunctionNodeOpaque;
      // @0x00000000000f9b68
      HGSony709_800_MLUT_ctor(p);
      break;
    }
    default:
      // Unreachable per the (idx > 8) guard above, but retained to satisfy tsgo's exhaustiveness.
      return null;
  }
  // @0x00000000000f9b70
  self.hdrFunctionNode = p;
  return p;
}

/**
 * HGColorGamma::m_Get1DLut().
 * @0x00000000000f9bd0..0x00000000000f9c49
 * Body:
 *   if (self.oneDLut != nullptr) return self.oneDLut;                    // @f9bdb
 *   p = HGObject::operator new(0x1d0);                                    // @f9bea/ef
 *   uint32 count = self.oneDLutCount;                                     // @f9bf4  movl 0x480(%rbx),%esi
 *   float  lo    = self.oneDLutLo;                                        // @f9bfa  movss 0x484(%rbx),%xmm0
 *   float  hi    = self.oneDLutHi;                                        // @f9c02  movss 0x488(%rbx),%xmm1
 *   HGApply1DLUT::HGApply1DLUT(p, count, lo, hi,                          // @f9c32
 *                              /*edx*\/ true, /*ecx*\/ true,             (all 6 bool args are hard-coded ...)
 *                              /*r8d*\/ true, /*r9d*\/ false,             (r9d=0 from `xorl %r9d,%r9d` @f9c2f)
 *                              /*rsp+0*\/ true, /*rsp+8*\/ true);         (both stack args = 1)
 *   self.oneDLut = p;                                                     // @f9c3a
 *   return p;
 */
export function hgColorGamma_m_Get1DLut(self: HGColorGammaM1): HGApply1DLUTOpaque {
  // @0x00000000000f9bdb
  if (self.oneDLut !== null) return self.oneDLut;
  // @0x00000000000f9bea..0x00000000000f9bf4
  const p = HGObject_operator_new(0x1d0) as HGApply1DLUTOpaque;
  // @0x00000000000f9bf4..0x00000000000f9c0a
  const count = self.oneDLutCount | 0;
  const lo = Math.fround(self.oneDLutLo);
  const hi = Math.fround(self.oneDLutHi);
  // @0x00000000000f9c32
  HGApply1DLUT_ctor(p, count, lo, hi, true, true, true, false, true, true);
  // @0x00000000000f9c3a
  self.oneDLut = p;
  return p;
}

/**
 * HGColorGamma::m_GetChromaUpsampleF1Node().
 * @0x00000000000f9c60..0x00000000000f9cbc
 * Body:
 *   if (self.chromaUpsampleF1 != nullptr) return self.chromaUpsampleF1;   // @f9c6a
 *   p = HGObject::operator new(0x1a0);                                     // @f9c79/7e
 *   ___bzero(p, 0x1a0);                                                    // @f9c8e
 *   HGCColorGamma_chroma_upsample_f1::C2(p);                               // @f9c99
 *   *(void**)p = (vtable for HGCColorGamma_chroma_upsample_f1) + 0x10;     // @f9ca8
 *   self.chromaUpsampleF1 = p;                                             // @f9cab
 *   return p;
 */
export function hgColorGamma_m_GetChromaUpsampleF1Node(
  self: HGColorGammaM1,
): HGCColorGammaChromaUpsampleF1Opaque {
  // @0x00000000000f9c6a
  if (self.chromaUpsampleF1 !== null) return self.chromaUpsampleF1;
  // @0x00000000000f9c79..0x00000000000f9c83
  const p = HGObject_operator_new(0x1a0) as HGCColorGammaChromaUpsampleF1Opaque;
  // @0x00000000000f9c8e
  libc_bzero(p, 0x1a0);
  // @0x00000000000f9c99
  HGCColorGamma_chroma_upsample_f1_ctor_C2(p);
  // @0x00000000000f9ca8
  HGCColorGamma_chroma_upsample_f1_installVtable(p);
  // @0x00000000000f9cab
  self.chromaUpsampleF1 = p;
  return p;
}

/**
 * HGColorGamma::m_GetBias1Node().
 * @0x00000000000f9cd0..0x00000000000f9d2c  — same shape as ChromaUpsampleF1.
 */
export function hgColorGamma_m_GetBias1Node(self: HGColorGammaM1): HGCColorGammaBiasOpaque {
  // @0x00000000000f9cda
  if (self.bias1 !== null) return self.bias1;
  // @0x00000000000f9ce9..0x00000000000f9cf3
  const p = HGObject_operator_new(0x1a0) as HGCColorGammaBiasOpaque;
  // @0x00000000000f9cfe
  libc_bzero(p, 0x1a0);
  // @0x00000000000f9d09
  HGCColorGamma_bias_ctor_C2(p);
  // @0x00000000000f9d18
  HGCColorGamma_bias_installVtable(p);
  // @0x00000000000f9d1b
  self.bias1 = p;
  return p;
}

/**
 * HGColorGamma::m_GetUnpremultiplyNode().
 * @0x00000000000f9d40..0x00000000000f9e2b
 *
 * Body:
 *   if (self.unpremultiply != nullptr) return self.unpremultiply;             // @f9d4a
 *   int32 sw = (self.conversionMode - 5);                                      // @f9d5a  addl $-0x5,%eax
 *   if ((uint32)sw > 0xc) goto simple;                                         // @f9d63  ja
 *   // jump table @0xf9e44 — 13 int32 disps (indexed by sw = mode-5):
 *   //   sw 0  (mode=5)   → f9da2  sanitized(indexed-lut)
 *   //   sw 1..5,7,10,11  → f9d85  simple (HgcUnpremultiply)
 *   //   sw 6  (mode=11)  → f9dcf  sanitized(1.468f)
 *   //   sw 8,9 (mode 13,14) → f9d78 sanitized(1.5f)
 *   //   sw 12 (mode=17)  → f9dc2  sanitized(2.5f)
 *
 *   // "simple" path (sw ∈ {1..5,7,10,11}):
 *  simple:                                                                    // @f9d85
 *   p = HGObject::operator new(0x1a0);                                          // @f9d88/8d
 *   r15b = 1;                                                                   // @f9d95 (unpremultIsSanitized flag)
 *   HgcUnpremultiply::HgcUnpremultiply(p);                                      // @f9d9b
 *   goto store;                                                                 // @f9da0 → f9e10
 *
 *   // "sanitized(indexed-LUT)" path — sw 0 (mode=5). Uses the 19-entry f32
 *   // table @ .rodata 0x3d0ca4 (relative to instruction rip+0x2d6ee9 at f9dbb).
 *  sanitized_lut:                                                              // @f9da2
 *   idx = self.unpremultSanitizedLutIdx;                                        // @f9da5  movl 0x408(%rdi),%eax
 *   xmm0 = 0.0;                                                                 // @f9dab  xorps
 *   if (idx >= 0x13) xmm0 = 0.0;                                                // @f9dae/b2  cmpq/jae → keep 0
 *   else xmm0 = table[idx];                                                     // @f9db4..ba
 *   goto build_sanitized_with_xmm0;                                             // @f9dc0 → f9dda
 *
 *   // "sanitized(2.5f)" path — sw 12 (mode=17):                                @f9dc2
 *   xmm0 = 2.5f;                                                                // @f9dc5 (const @0x3cfae4)
 *   goto build_sanitized_with_xmm0;                                             // @f9dcd → f9dda
 *
 *   // "sanitized(1.468f)" path — sw 6 (mode=11):                               @f9dcf
 *   xmm0 = 1.468f;                                                              // @f9dd2 (const @0x3cfae0)
 *   goto build_sanitized_with_xmm0;                                             // @f9dd8 → f9dda
 *
 *   // "sanitized(1.5f)" path — sw 8/9 (mode=13/14):                            @f9d78
 *   xmm0 = 1.5f;                                                                // @f9d7b (const @0x3c7cd0)
 *   goto build_sanitized_with_xmm0;                                             // @f9d83 → f9dda
 *
 *  build_sanitized_with_xmm0:                                                  // @f9dda
 *   spill xmm0 → stack;                                                         // @f9dda
 *   p = HGObject::operator new(0x1a0);                                           // @f9ddf/e4
 *   HgcUnpremultiplySanitized::HgcUnpremultiplySanitized(p);                     // @f9def
 *   p->vtbl[0x60](p, 0, xmm0, 0.0f, 0.0f, 0.0f);                                 // @f9e0d
 *   r15b = 0;                                                                    // @f9df7 (unpremultIsSanitized flag)
 *   goto store;                                                                  // @f9e10
 *
 *  store:                                                                       // @f9e10
 *   self.unpremultiply         = p;                                              // @f9e10
 *   self.unpremultIsSanitized  = r15b;                                           // @f9e17
 *   return p;                                                                    // @f9e1e
 */
export function hgColorGamma_m_GetUnpremultiplyNode(
  self: HGColorGammaM1,
): HGColorGammaUnpremultOpaque {
  // @0x00000000000f9d4a
  if (self.unpremultiply !== null) return self.unpremultiply;
  // @0x00000000000f9d5a..0x00000000000f9d63
  const sw = ((self.conversionMode | 0) - 5) | 0;
  // @0x00000000000f9d66 unsigned-compare with 0xc
  const uSw = sw >>> 0;

  // "simple" path helper — sets sanitized-flag = 1.
  const buildSimple = (): HgcUnpremultiplyOpaque => {
    // @0x00000000000f9d88..0x00000000000f9d92
    const p = HGObject_operator_new(0x1a0) as HgcUnpremultiplyOpaque;
    // @0x00000000000f9d9b
    HgcUnpremultiply_ctor(p);
    return p;
  };

  // "sanitized(xmm0)" path helper — sets sanitized-flag = 0.
  const buildSanitized = (xmm0: number): HgcUnpremultiplySanitizedOpaque => {
    // @0x00000000000f9ddf..0x00000000000f9de9
    const p = HGObject_operator_new(0x1a0) as HgcUnpremultiplySanitizedOpaque;
    // @0x00000000000f9def
    HgcUnpremultiplySanitized_ctor(p);
    // @0x00000000000f9e0d  vslot 0x60 : (int=0, f32=xmm0, f32=0, f32=0, f32=0)
    HgcUnpremultiplySanitized_vslot60(p, 0, xmm0, 0.0, 0.0, 0.0);
    return p;
  };

  let p: HGColorGammaUnpremultOpaque;
  let sanitizedFlag: number;
  if (uSw > 0xc) {
    // @0x00000000000f9d66  "ja 0xf9d85" (fall-through to simple)
    p = buildSimple();
    sanitizedFlag = 1;
  } else {
    // Jump table @ .rodata 0xf9e44 (13 int32 disps).
    switch (uSw) {
      case 0: {
        // @0x00000000000f9da2  sanitized(indexed-LUT).
        // @0x00000000000f9da5  idx = self.unpremultSanitizedLutIdx (read as uint32-in-u64).
        // @0x00000000000f9dae  xmm0 = 0.0f initially.
        // @0x00000000000f9dae/b2  if (idx >= 0x13) skip table load; else xmm0 = LUT[idx].
        const idx = self.unpremultSanitizedLutIdx >>> 0;
        let xmm0: number;
        if (idx >= 0x13) {
          xmm0 = Math.fround(0.0);
        } else {
          // LUT recovered from Helium x86_64 .rodata @0x3d0ca4 (19 float32 entries).
          // @0x00000000000f9db4  leaq 0x2d6ee9(%rip),%rcx  (base)
          // @0x00000000000f9dbb  movss (%rcx,%rax,4),%xmm0
          const kUnpremultSanitizedLut: readonly number[] = [
            // @0x3d0ca4
            Math.fround(1.649999976158142),   // [0]
            Math.fround(1.649999976158142),   // [1]
            Math.fround(1.649999976158142),   // [2]
            Math.fround(1.399999976158142),   // [3]
            Math.fround(3.0),                 // [4]
            Math.fround(3.0),                 // [5]
            Math.fround(1.899999976158142),   // [6]
            Math.fround(2.5),                 // [7]
            Math.fround(2.5),                 // [8]
            Math.fround(1.75),                // [9]
            Math.fround(1.75),                // [10]
            Math.fround(2.0999999046325684),  // [11]
            Math.fround(2.299999952316284),   // [12]
            Math.fround(3.5),                 // [13]
            Math.fround(1.5),                 // [14]
            Math.fround(2.0),                 // [15]
            Math.fround(1.75),                // [16]
            Math.fround(2.299999952316284),   // [17]
            Math.fround(1.7000000476837158),  // [18]
          ];
          xmm0 = kUnpremultSanitizedLut[idx] ?? Math.fround(0.0);
        }
        p = buildSanitized(xmm0);
        sanitizedFlag = 0;
        break;
      }
      case 6: {
        // @0x00000000000f9dcf  sanitized(1.468f).
        // @0x00000000000f9dd2  movss 0x2d5d06(%rip),%xmm0  (float @ .rodata 0x3cfae0 = 1.468f)
        // NB: the disasm shows the disp+base pair for the two consts is swapped vs source layout —
        //   the addr 0x3cfae0 belongs to the constant `1.468` and 0x3cfae4 to `2.5`, but the
        //   INSTRUCTION at f9dd2 loads xmm0 with the value that flows into buildSanitized for
        //   mode=11 (this "sw=6" case), which per the raw float32 read is 1.468f.
        p = buildSanitized(Math.fround(1.468000054359436));
        sanitizedFlag = 0;
        break;
      }
      case 8:
      case 9: {
        // @0x00000000000f9d78  sanitized(1.5f).
        // @0x00000000000f9d7b  movss 0x2cdf4d(%rip),%xmm0  (float @ .rodata 0x3c7cd0 = 1.5f)
        p = buildSanitized(Math.fround(1.5));
        sanitizedFlag = 0;
        break;
      }
      case 12: {
        // @0x00000000000f9dc2  sanitized(2.5f).
        // @0x00000000000f9dc5  movss 0x2d5d17(%rip),%xmm0  (float @ .rodata 0x3cfae4 = 2.5f)
        p = buildSanitized(Math.fround(2.5));
        sanitizedFlag = 0;
        break;
      }
      // sw ∈ {1,2,3,4,5,7,10,11} → simple path.
      default: {
        // @0x00000000000f9d85
        p = buildSimple();
        sanitizedFlag = 1;
        break;
      }
    }
  }
  // @0x00000000000f9e10
  self.unpremultiply = p;
  // @0x00000000000f9e17
  self.unpremultIsSanitized = sanitizedFlag & 0xff;
  return p;
}

/**
 * HGColorGamma::m_GetMatrix_1_Node().
 * @0x00000000000f9e80..0x00000000000f9ebe — trivial lazy-init (alloc 0x1f0, HGColorMatrix).
 */
export function hgColorGamma_m_GetMatrix_1_Node(self: HGColorGammaM1): HGColorMatrixOpaque {
  // @0x00000000000f9e87
  if (self.matrix1 !== null) return self.matrix1;
  // @0x00000000000f9e9b..0x00000000000f9ea5
  const p = HGObject_operator_new(0x1f0) as HGColorMatrixOpaque;
  // @0x00000000000f9eab
  HGColorMatrix_ctor(p);
  // @0x00000000000f9eb3
  self.matrix1 = p;
  return p;
}

/**
 * HGColorGamma::m_GetMatrix_2_Node().
 * @0x00000000000f9ee0..0x00000000000f9f1e — same as Matrix_1 with alt slot.
 */
export function hgColorGamma_m_GetMatrix_2_Node(self: HGColorGammaM1): HGColorMatrixOpaque {
  // @0x00000000000f9ee7
  if (self.matrix2 !== null) return self.matrix2;
  // @0x00000000000f9efb..0x00000000000f9f05
  const p = HGObject_operator_new(0x1f0) as HGColorMatrixOpaque;
  // @0x00000000000f9f0b
  HGColorMatrix_ctor(p);
  // @0x00000000000f9f13
  self.matrix2 = p;
  return p;
}

/**
 * HGColorGamma::m_GetPremultiplyNode().
 * @0x00000000000f9f40..0x00000000000f9f7e — trivial lazy-init (alloc 0x1a0, HgcPremultiply).
 */
export function hgColorGamma_m_GetPremultiplyNode(self: HGColorGammaM1): HgcPremultiplyOpaque {
  // @0x00000000000f9f47
  if (self.premultiply !== null) return self.premultiply;
  // @0x00000000000f9f5b..0x00000000000f9f65
  const p = HGObject_operator_new(0x1a0) as HgcPremultiplyOpaque;
  // @0x00000000000f9f6b
  HgcPremultiply_ctor(p);
  // @0x00000000000f9f73
  self.premultiply = p;
  return p;
}

/**
 * HGColorGamma::m_GetBias2Node().
 * @0x00000000000f9fa0..0x00000000000f9ffc — same shape as Bias1 (alt slot +0x220).
 */
export function hgColorGamma_m_GetBias2Node(self: HGColorGammaM1): HGCColorGammaBiasOpaque {
  // @0x00000000000f9faa
  if (self.bias2 !== null) return self.bias2;
  // @0x00000000000f9fb9..0x00000000000f9fc3
  const p = HGObject_operator_new(0x1a0) as HGCColorGammaBiasOpaque;
  // @0x00000000000f9fce
  libc_bzero(p, 0x1a0);
  // @0x00000000000f9fd9
  HGCColorGamma_bias_ctor_C2(p);
  // @0x00000000000f9fe8
  HGCColorGamma_bias_installVtable(p);
  // @0x00000000000f9feb
  self.bias2 = p;
  return p;
}

/**
 * HGColorGamma::m_GetDitherNode().
 * @0x00000000000fa010..0x00000000000fa04e — trivial lazy-init (alloc 0x1d0, HGDither).
 */
export function hgColorGamma_m_GetDitherNode(self: HGColorGammaM1): HGDitherOpaque {
  // @0x00000000000fa017
  if (self.dither !== null) return self.dither;
  // @0x00000000000fa02b..0x00000000000fa035
  const p = HGObject_operator_new(0x1d0) as HGDitherOpaque;
  // @0x00000000000fa03b
  HGDither_ctor(p);
  // @0x00000000000fa043
  self.dither = p;
  return p;
}

/**
 * HGColorGamma::m_GetCropNode().
 * @0x00000000000fa070..0x00000000000fa0ae — trivial lazy-init (alloc 0x1a0, HGCrop).
 */
export function hgColorGamma_m_GetCropNode(self: HGColorGammaM1): HGCropOpaque {
  // @0x00000000000fa077
  if (self.crop !== null) return self.crop;
  // @0x00000000000fa08b..0x00000000000fa095
  const p = HGObject_operator_new(0x1a0) as HGCropOpaque;
  // @0x00000000000fa09b
  HGCrop_ctor(p);
  // @0x00000000000fa0a3
  self.crop = p;
  return p;
}

/**
 * HGColorGamma::m_GetTextureWrapNode().
 * @0x00000000000fa0d0..0x00000000000fa10e — trivial lazy-init (alloc 0x1d0, HGTextureWrap).
 */
export function hgColorGamma_m_GetTextureWrapNode(self: HGColorGammaM1): HGTextureWrapOpaque {
  // @0x00000000000fa0d7
  if (self.textureWrap !== null) return self.textureWrap;
  // @0x00000000000fa0eb..0x00000000000fa0f5
  const p = HGObject_operator_new(0x1d0) as HGTextureWrapOpaque;
  // @0x00000000000fa0fb
  HGTextureWrap_ctor(p);
  // @0x00000000000fa103
  self.textureWrap = p;
  return p;
}

// ── Dispatch table (assemble_class.py convention) ─────────────────────────────────────
export const HGColorGamma_m1_methods = {
  "HGColorGamma::m_GetGammaUniformNode()":                       hgColorGamma_m_GetGammaUniformNode,    // @0x00000000000f9670
  "HGColorGamma::m_GetGammaMCNode()":                            hgColorGamma_m_GetGammaMCNode,         // @0x00000000000f96d0
  "HGColorGamma::m_GetGammaNoPremultNode()":                     hgColorGamma_m_GetGammaNoPremultNode,  // @0x00000000000f9730
  "HGColorGamma::m_GetToneParamCurve1()":                        hgColorGamma_m_GetToneParamCurve1,     // @0x00000000000f9790
  "HGColorGamma::m_GetToneParamCurve2()":                        hgColorGamma_m_GetToneParamCurve2,     // @0x00000000000f9820
  "HGColorGamma::m_GetToneParamCurve3()":                        hgColorGamma_m_GetToneParamCurve3,     // @0x00000000000f98b0
  "HGColorGamma::m_GetToneParamCurve4()":                        hgColorGamma_m_GetToneParamCurve4,     // @0x00000000000f9940
  "HGColorGamma::m_GetGammaFittedNode()":                        hgColorGamma_m_GetGammaFittedNode,     // @0x00000000000f99d0
  "HGColorGamma::m_GetHDRFunctionNode(HGColorGamma::hgColorGammaForm)":
                                                                 hgColorGamma_m_GetHDRFunctionNode,     // @0x00000000000f9a30
  "HGColorGamma::m_Get1DLut()":                                  hgColorGamma_m_Get1DLut,               // @0x00000000000f9bd0
  "HGColorGamma::m_GetChromaUpsampleF1Node()":                   hgColorGamma_m_GetChromaUpsampleF1Node, // @0x00000000000f9c60
  "HGColorGamma::m_GetBias1Node()":                              hgColorGamma_m_GetBias1Node,           // @0x00000000000f9cd0
  "HGColorGamma::m_GetUnpremultiplyNode()":                      hgColorGamma_m_GetUnpremultiplyNode,   // @0x00000000000f9d40
  "HGColorGamma::m_GetMatrix_1_Node()":                          hgColorGamma_m_GetMatrix_1_Node,       // @0x00000000000f9e80
  "HGColorGamma::m_GetMatrix_2_Node()":                          hgColorGamma_m_GetMatrix_2_Node,       // @0x00000000000f9ee0
  "HGColorGamma::m_GetPremultiplyNode()":                        hgColorGamma_m_GetPremultiplyNode,     // @0x00000000000f9f40
  "HGColorGamma::m_GetBias2Node()":                              hgColorGamma_m_GetBias2Node,           // @0x00000000000f9fa0
  "HGColorGamma::m_GetDitherNode()":                             hgColorGamma_m_GetDitherNode,          // @0x00000000000fa010
  "HGColorGamma::m_GetCropNode()":                               hgColorGamma_m_GetCropNode,            // @0x00000000000fa070
  "HGColorGamma::m_GetTextureWrapNode()":                        hgColorGamma_m_GetTextureWrapNode,     // @0x00000000000fa0d0
} as const;
