// raw-port/src/render/HGHLG_SDRToHLG.ts
//
// FCP `HGHLG::SDRToHLG` — a nested facade class in Helium's `HGHLG`
// (Hybrid Log-Gamma, BT.2100) namespace. It is the INVERSE of
// `HGHLG::HLGToSDR` (see HGHLG_HLGToSDR.ts) — an SDR->HDR upconversion
// graph builder that wires the reverse pipeline whose exact topology
// depends on:
//   - `ConversionMethod` (int at +0x1a4), and
//   - `SDRInputType`     (int at +0x1a0) — the SDR curve family of the
//                                            input (0=..., 1=..., 2=...,
//                                            3=..., >=4 fall-through).
//
// UNLIKE HLGToSDR this class exposes NO SetOutputIsRec709Gamma / NO
// SetMinimumInputValueZero setters (they don't exist in the demangled
// symbol table for SDRToHLG). Only SetToneQualityMode is exposed. The
// ctor takes (SDRInputType, ConversionMethod) instead of a single
// ConversionMethod, and +0x1a0 stores the SDRInputType uint32 (not two
// flag bytes).
//
// FRAMEWORK: Helium.framework (x86_64 slice; fat-slice offset 0x4000;
// the thin binary at /tmp/Helium.x86_64 has VA==file offset, so every
// RIP-relative constant address below is a direct file offset).
//
// SYMBOLS (Helium x86_64):
//   0x00100fe0  HGHLG::SDRToHLG::SDRToHLG(SDRInputType, ConversionMethod)  [C2 base ctor]
//   0x00101050  HGHLG::SDRToHLG::SDRToHLG(SDRInputType, ConversionMethod)  [C1 complete ctor - identical body to C2]
//   0x001010c0  HGHLG::SDRToHLG::~SDRToHLG()                               [D2 base dtor]
//   0x00101100  HGHLG::SDRToHLG::~SDRToHLG()                               [D1 complete dtor]
//   0x00101140  HGHLG::SDRToHLG::~SDRToHLG()                               [D0 deleting dtor]
//   0x00101190  HGHLG::SDRToHLG::GetOutput(HGRenderer*)                    [main graph-builder]
//   0x001018b0  HGHLG::SDRToHLG::SetToneQualityMode(HGColorGamma::hgColorGammaToneQuality)
//                                                                          [4-byte int store at +0x1a8]
//
// DECODES (raw-port/re/disasm/Helium.HGHLG::SDRToHLG.*.s):
//   SDRToHLG.s (C1 @0x101050)
//   ~SDRToHLG.s (D0 @0x101140)
//   SetToneQualityMode.s (@0x1018b0)
//   GetOutput.s          (@0x101190 - 475 lines)
//
// LAYOUT (inherits HGNode; HGNode header ends before +0x198):
//   +0x000  vtable ptr                                (installed @0x101068/@0xa17a40 via
//                                                     `leaq 0x9169d1(%rip)...`)
//   +0x198  void*    inner render-graph head          (initialised to nullptr by ctor
//                                                     @0x101072; assigned by GetOutput at
//                                                     @0x101417 / @0x101588 / @0x10166a to
//                                                     the head node of whichever pipeline
//                                                     the enum picks)
//   +0x1a0  uint32_t sdrInputType                     (ctor arg - `movl %r15d, 0x1a0(%rbx)`
//                                                     @0x10107d)  <- NOTE: 4-byte int store,
//                                                     NOT the packed 2-byte flag store used
//                                                     by HLGToSDR
//   +0x1a4  uint32_t conversionMethod                 (ctor arg - `movl %r14d, 0x1a4(%rbx)`
//                                                     @0x101084)
//   +0x1a8  uint32_t toneQualityMode                  (initialised from
//                                                     HGColorGamma::GetDefaultToneQualityMode()
//                                                     @0x10108b; overwritten by
//                                                     SetToneQualityMode @0x1018b4)
//
// CONVERSION METHOD ENUM (from the `cmpl` at @0x1011b8..@0x1011cc):
//   0x1011b8: `cmpl $0x2, %eax ; je 0x101436`      - method == 2 -> HgcBT2100_HLG_OOTF_InverseOOTF
//                                                    peak_nits=100 + HGColorConform antisym pipeline
//   0x1011c1: `cmpl $0x1, %eax ; je 0x1012af`      - method == 1 -> HGColorConform "conform-only"
//                                                    + HgcBT2446_Method_A_ITMO + HgcBT2100_HLG_OOTF_InverseOOTF
//                                                    peak_nits=1000 pipeline
//   0x1011ca: `testl %eax, %eax ; jne 0x1015a1`    - method == 0 falls through to HGGamma pass;
//                                                    method > 2 falls to @0x1015a1 (returns
//                                                    whatever was in inner (+0x198), i.e. nullptr
//                                                    from ctor => identity/no-op result).
//   Within method==0 (@0x1011d2..@0x1012aa), a SECOND split on `0x1a0(%r14)`
//   (`cmpl $0x1, %eax ; je 0x1015ad` @0x101230/@0x101233 and `testl %eax, %eax` @0x10123c) selects
//   between three sdrInputType sub-branches:
//     sdrInputType == 0 -> HGColorMatrix rec709->rec2020 pipeline + HgcBT2390_Gain_Sat_ToneAdj  (@0x101244)
//     sdrInputType == 1 -> HGColorGamma pipeline + HgcBT2390_Gain_Sat_ToneAdj  (@0x1015ad)
//     sdrInputType >= 2 -> HgcBT2390_Gain_Sat_ToneAdj alone on the HGGamma output  (@0x10163e)
//   So the enum has at least 3 ConversionMethod values {0, 1, 2} (and a 4th identity fall-
//   through), and at least 3 SDRInputType values {0, 1, 2}. Names are declared as C++ `enum
//   class` in Helium - the demangler doesn't emit the symbolic names; we model both as
//   numeric fields.
//
// UNDECODED CALLEES / FRONTIER (each gets a throwing stub citing its @0xADDR):
//   HGNode::HGNode()                          @Helium 0x101063 / 0x10135d / 0x1014d8
//   HGObject::operator new(size_t)            @Helium 0x1011d7 / 0x101249 / 0x1012b4 /
//                                              0x10132f / 0x101352 / 0x101372 / 0x10143b /
//                                              0x1014cd / 0x1014ec / 0x101643 / 0x1015b2
//   HGObject::operator delete(void*)          @Helium 0x101176 (dtor tail-jmp)
//   HGGamma::HGGamma()                        @Helium 0x1011e2
//   HGGamma::SetPremultiplyState(bool)        @Helium 0x10121b
//   HGColorMatrix::HGColorMatrix()            @Helium 0x101254
//   HGColorMatrix::LoadMatrix(float vec4 const*, bool)  @Helium 0x10127c
//   HGColorGamma::HGColorGamma()              @Helium 0x1015bd
//   HGColorGamma::SetToneQualityMode(...)     @Helium 0x1015da
//   HGColorGamma::SetConversion(...)          @Helium 0x101601
//   HGColorGamma::SetPremultiplyState(bool,bool) @Helium 0x101610
//   HGColorGamma::GetDefaultToneQualityMode() @Helium 0x10108b (ctor init)
//   HGColorConform::HGColorConform()          @Helium 0x1012bf / 0x101446
//   HGColorConform::SetToneQualityMode(...)   @Helium 0x1012dc / 0x101463 / 0x1014b7
//   HGColorConform::SetAntiSymmetricToneCurves(bool)  @Helium 0x101470
//   HGColorConform::SetConversion(...)        @Helium 0x101316 / 0x1014aa
//   HGColorConform::SetPremultiplyState(bool,bool)  @Helium 0x101325 / 0x1014c3
//   HgcBT2446_Method_A_ITMO::HgcBT2446_Method_A_ITMO()      @Helium 0x10133a
//   HgcBT2100_HLG_OOTF_InverseOOTF::HgcBT2100_HLG_OOTF_InverseOOTF()
//                                             @Helium 0x10137d / 0x1014f7
//   HgcBT2390_Gain_Sat_ToneAdj::HgcBT2390_Gain_Sat_ToneAdj()
//                                             @Helium 0x10164e
//   HGRenderer::GetInput(HGNode*, int)        @Helium 0x1011a9
//   HGNode::~HGNode()                         @Helium 0x101168 (D0)
//   `HGColorGamma::rec709RGBToRec2020RGB` matrix data pointer @Helium 0x10126a
//   _pow libm symbol                          @Helium 0x1013f2 / 0x101565
//   Inner-node virtual dispatch through `*(vt+0x10)` - the `Add` slot
//                                             @Helium 0x101226 / 0x10129e / 0x101414 /
//                                              0x101585 / 0x101632 / 0x101667
//   Inner-node virtual dispatch through `*(vt+0x18)` - the "release / dtor" slot
//                                             @Helium 0x101162 (D0) / 0x101292 / 0x1012a7 /
//                                              0x101425 / 0x10142e / 0x101595 / 0x10159e /
//                                              0x101626 / 0x10163b / 0x101678 / 0x101681 /
//                                              0x10168e
//   Inner-node virtual dispatch through `*(vt+0x60)` - SetParameter slot
//                                             @Helium 0x101213
//   Inner-node virtual dispatch through `*(vt+0x78)` - SetInput slot
//                                             @Helium 0x1011f2 / 0x101267 / 0x1012cf /
//                                              0x10134a / 0x1013c9 / 0x101456 / 0x10153e /
//                                              0x10165e
//
// DECODED CONSTANTS (from Helium.x86_64 with VA==file offset; every
// RIP-relative constant is next_ip + disp32):
//
//   GetOutput @0x101190 - method-0 (HGGamma) branch:
//     0x1011f8  movss   0x2c9d8c(%rip), %xmm0                   ## const @0x3caf8c = 2.0f (u32=0x40000000)
//     0x101200  movss   0x2c6ab8(%rip), %xmm3                   ## const @0x3c7cc0 = 1.0f (u32=0x3f800000)
//     0x101213  callq   *0x60(%rax)  // SetParameter(gg, 0, 2.0f, 2.0f, 2.0f, 1.0f)
//                                                                ## xmm0 = xmm1 = xmm2 = 2.0f (movaps replication @0x10120d/@0x101210),
//                                                                   xmm3 = 1.0f. Uploads a straight-line gamma-2.0 curve.
//
//   GetOutput @0x101190 - method-1 (HgcBT2446_Method_A_ITMO + peak=1000 HLG-OOTF InverseOOTF)
//                         branch @0x1012af:
//     0x101399  movabsq $0x408f400000000000, %rax               ## -> 1000.0 (f64 peak_nits) stored at inner_head+0x1a8
//     0x1013ab  movsd   0x2cfded(%rip), %xmm0                   ## const @0x3d11a0 = f64 packing of
//                                                                   {f32(0xbe2aaaab)=-0.1666666716337204 @+0,
//                                                                    f32(0x41400000)=12.0f @+4}
//                                                                   - stored 8-byte at inner_head+0x1b0 (later half-overwritten)
//     0x1013cc  movl    $0xbe2aaaab, 0x1b0(%r12)                ## f32 -0.16666667f rewritten (LOW half of the pair)
//     0x1013d8  movsd   0x1a8(%r12), %xmm0                      ## xmm0 = 1000.0 (peak_nits, just stored)
//     0x1013e2  divsd   0x2c9a9e(%rip), %xmm0                   ## const @0x3cae88 = 1000.0 - xmm0 = 1000/1000 = 1.0
//     0x1013ea  movsd   0x2cfa26(%rip), %xmm1                   ## const @0x3d0e18 = 0.8333333333333334 (exp for _pow)
//     0x1013f2  callq   _pow                                    ## xmm0 = pow(1.0, 5/6) = 1.0
//     0x1013f7  mulsd   0x2cfa21(%rip), %xmm0                   ## const @0x3d0e20 = 12.0 - xmm0 = 12.0
//     0x1013ff  cvtsd2ss xmm0, xmm0
//     0x101403  movss   %xmm0, 0x1b4(%r12)                      ## f32(12.0) stored at inner_head+0x1b4
//                                                                   (OVERWRITES the 12.0f half from the pair above)
//
//   GetOutput @0x101190 - method-2 (HGColorConform + peak=100 HLG-OOTF InverseOOTF) branch @0x101436:
//     0x101511  movabsq $0x4059000000000000, %rax               ## -> 100.0 (f64 peak_nits) stored at inner_head+0x1a8
//     0x101522  movsd   0x2cfc66(%rip), %xmm0                   ## const @0x3d1190 = f64 packing of
//                                                                   {f32(0xbe2aaaab)=-0.1666666716337204 @+0,
//                                                                    f32(0x3fe19458)=1.7613590955734253 @+4}
//                                                                   - stored 8-byte at inner_head+0x1b0
//     0x101541  movl    $0x3e3a8916, 0x1b0(%r15)                ## f32 0.1821635663509369 rewritten (LOW half)
//                                                                   NOTE: this is a DIFFERENT literal from the -0.16666667f
//                                                                   used by method-1; both branches overwrite +0x1b0 but
//                                                                   with different values.
//     0x10154c  movsd   0x1a8(%r15), %xmm0                      ## xmm0 = 100.0 (peak_nits)
//     0x101555  divsd   0x2cbd1b(%rip), %xmm0                   ## const @0x3cd278 = 100.0 - xmm0 = 100/100 = 1.0
//     0x10155d  movsd   0x2cf8cb(%rip), %xmm1                   ## const @0x3d0e30 = 1.1821635668517758 (exp for _pow)
//     0x101565  callq   _pow                                    ## xmm0 = pow(1.0, 1.1821635668517758) = 1.0
//     0x10156a  mulsd   0x2cf8ae(%rip), %xmm0                   ## const @0x3d0e20 = 12.0 - xmm0 = 12.0
//     0x101572  cvtsd2ss xmm0, xmm0
//     0x101576  movss   %xmm0, 0x1b4(%r15)                      ## f32(12.0) stored at inner_head+0x1b4
//
//   GetOutput @0x101190 - "exp2-basis constants" table pointer used by BOTH HLG-OOTF branches:
//     0x10138a  leaq    0x2cff4b(%rip), %rax                    ## target @0x3d12dc - stored at inner_head+0x1a0
//     0x101503  leaq    0x2cfdd2(%rip), %rax                    ## same target @0x3d12dc - stored at inner_head+0x1a0
//                                                                (this is the same shader-uniforms table HGHLG::HLGToSDR
//                                                                references at similar slots; see HGHLG_HLGToSDR.ts)
//
//   GetOutput @0x101190 - HGColorMatrix pass @0x101244:
//     0x10126a  leaq    HGColorGamma::rec709RGBToRec2020RGB(%rip), %rsi
//                                                                - a static float vec4[3] matrix table
//                                                                  loaded by HGColorMatrix::LoadMatrix(mat, tbl, true).
//
// The full HLG constant set (a=0.17883277265695, b=0.2846689093722,
// c=0.5599107277627162) that the task brief mentions is only DIRECTLY
// loaded by the leaf `HgcBT2100_HLG_*` nodes and by `HGHLG::InverseOETF`
// (see HGHLG_InverseOETF.ts). `HGHLG::SDRToHLG` itself does not touch
// a/b/c - it composes leaf nodes that do.
//
// UNDECODED FRONTIER STUBS below throw with their @0xADDR per PORTING_SPEC
// Rule 3. A "not yet transcribed" stub is a loud gap; the ledger detects
// it via provenance_gate and the frontier tool picks it up as the next
// unit to port.

/* ------------------------------------------------------------------ */
/* Opaque frontier types - resolved by companion ports.                */
/* ------------------------------------------------------------------ */

export interface HGRenderer {}
export interface HGNodeLike {}

/**
 * `HGHLG::SDRToHLG::ConversionMethod` - enum class parameter selecting
 * the SDR->HDR pipeline topology. The demangler exposes it only by
 * name; the disasm identifies at least 4 distinct code paths (see file
 * header):
 *   0 = HGGamma-based path (three sdrInputType sub-branches)
 *   1 = HGColorConform "conform-only" + BT2446 ITMO + peak=1000 HLG-OOTF InverseOOTF
 *   2 = HGColorConform antisym + peak=100 HLG-OOTF InverseOOTF
 *   >=3 = identity fall-through (empty branch @0x1011cc `jne 0x1015a1`)
 */
export type HGHLG_SDRToHLG_ConversionMethod = number;

/**
 * `HGHLG::SDRToHLG::SDRInputType` - enum class parameter selecting the
 * SDR curve family of the input. The demangler only exposes the name;
 * the disasm identifies at least 3 distinct sub-branches (see file
 * header):
 *   0 = HGColorMatrix rec709->rec2020 + HGGamma  (method==0 sub-branch)
 *   1 = HGColorGamma pipeline + HGGamma          (method==0 sub-branch)
 *   >=2 = HGGamma alone (no matrix/HGColorGamma)
 */
export type HGHLG_SDRToHLG_SDRInputType = number;

/**
 * `HGColorGamma::hgColorGammaToneQuality` - enum passed to
 * SetToneQualityMode / stored at +0x1a8. Modelled as a numeric field
 * because the demangler doesn't emit its symbolic names either.
 */
export type HGColorGamma_hgColorGammaToneQuality = number;

/* ------------------------------------------------------------------ */
/* Undecoded-frontier stubs (each throws with its @0xADDR).            */
/* ------------------------------------------------------------------ */

/** Base-class ctor tail-called by C1/C2 @Helium 0x101063 (also from GetOutput @0x10135d / @0x1014d8). */
function HGNode_ctor_call(_self: object): void { // @Helium 0x101063 / 0x10135d / 0x1014d8
  throw new Error(
    "HGNode::HGNode() not yet transcribed (@Helium 0x101063 / 0x10135d / 0x1014d8 - HGHLG::SDRToHLG C1/C2 + GetOutput inner-head base-call)",
  );
}

/** Base-class dtor tail-jmp'd by D0 @Helium 0x101168 (also unwind tail @0x1010a7). */
function HGNode_dtor_call(_self: object): void { // @Helium 0x101168 / 0x1010a7
  throw new Error(
    "HGNode::~HGNode() not yet transcribed (@Helium 0x101168 / 0x1010a7 - HGHLG::SDRToHLG D0 / ctor unwind)",
  );
}

/**
 * `HGObject::operator new(size_t)` - Helium's placement/tagged alloc.
 * Called for every leaf node the graph builder allocates (see file
 * header for the full list of call-sites and their sizes).
 */
function HGObject_operator_new(_bytes: number): object { // @Helium 0x1011d7 / 0x101249 / 0x1012b4 / 0x10132f / 0x101352 / 0x101372 / 0x10143b / 0x1014cd / 0x1014ec / 0x101643 / 0x1015b2
  throw new Error(
    "HGObject::operator new(unsigned long) not yet transcribed (@Helium 0x1011d7 - HGHLG::SDRToHLG::GetOutput node allocation; sizes 0x1a0/0x1b0/0x1c0/0x1f0/0x370/0x4a0)",
  );
}

/** `HGObject::operator delete(void*)` - tail-jmp'd by D0 @Helium 0x101176. */
function HGObject_operator_delete(_p: object): void { // @Helium 0x101176
  throw new Error(
    "HGObject::operator delete(void*) not yet transcribed (@Helium 0x101176 - HGHLG::SDRToHLG D0 deletion)",
  );
}

/** `HGColorGamma::GetDefaultToneQualityMode()` - used by ctor to init +0x1a8. */
function HGColorGamma_GetDefaultToneQualityMode(): HGColorGamma_hgColorGammaToneQuality { // @Helium 0x10108b
  throw new Error(
    "HGColorGamma::GetDefaultToneQualityMode() not yet transcribed (@Helium 0x10108b - HGHLG::SDRToHLG ctor default init of +0x1a8)",
  );
}

/** Inner leaf-node ctors. */
function HGGamma_ctor(_p: object): void { // @Helium 0x1011e2
  throw new Error(
    "HGGamma::HGGamma() not yet transcribed (@Helium 0x1011e2 - HGHLG::SDRToHLG method-0 gamma head)",
  );
}
function HGColorMatrix_ctor(_p: object): void { // @Helium 0x101254
  throw new Error(
    "HGColorMatrix::HGColorMatrix() not yet transcribed (@Helium 0x101254 - HGHLG::SDRToHLG method-0 + sdrInputType=0 rec709->rec2020 matrix stage)",
  );
}
function HGColorGamma_ctor(_p: object): void { // @Helium 0x1015bd
  throw new Error(
    "HGColorGamma::HGColorGamma() not yet transcribed (@Helium 0x1015bd - HGHLG::SDRToHLG method-0 + sdrInputType=1 conform-gamma stage)",
  );
}
function HGColorConform_ctor(_p: object): void { // @Helium 0x1012bf / 0x101446
  throw new Error(
    "HGColorConform::HGColorConform() not yet transcribed (@Helium 0x1012bf / 0x101446 - HGHLG::SDRToHLG method-1/2 conform stage)",
  );
}
function HgcBT2446_Method_A_ITMO_ctor(_p: object): void { // @Helium 0x10133a
  throw new Error(
    "HgcBT2446_Method_A_ITMO::HgcBT2446_Method_A_ITMO() not yet transcribed (@Helium 0x10133a - HGHLG::SDRToHLG method-1 inverse tone-mapper)",
  );
}
function HgcBT2100_HLG_OOTF_InverseOOTF_ctor(_p: object): void { // @Helium 0x10137d / 0x1014f7
  throw new Error(
    "HgcBT2100_HLG_OOTF_InverseOOTF::HgcBT2100_HLG_OOTF_InverseOOTF() not yet transcribed (@Helium 0x10137d / 0x1014f7 - HGHLG::SDRToHLG method-{1,2} HLG-OOTF head)",
  );
}
function HgcBT2390_Gain_Sat_ToneAdj_ctor(_p: object): void { // @Helium 0x10164e
  throw new Error(
    "HgcBT2390_Gain_Sat_ToneAdj::HgcBT2390_Gain_Sat_ToneAdj() not yet transcribed (@Helium 0x10164e - HGHLG::SDRToHLG method-0 post-processor)",
  );
}

/** HGGamma configuration setter. */
function HGGamma_SetPremultiplyState(_p: object, _b: boolean): void { // @Helium 0x10121b
  throw new Error(
    "HGGamma::SetPremultiplyState(bool) not yet transcribed (@Helium 0x10121b - HGHLG::SDRToHLG method-0 gamma premultiply flag)",
  );
}

/** HGColorMatrix::LoadMatrix - loads the rec709->rec2020 float vec4[3] table. */
function HGColorMatrix_LoadMatrix(
  _p: object,
  _matrix: object,      // @Helium 0x10126a leaq HGColorGamma::rec709RGBToRec2020RGB(%rip)
  _flag: boolean,       // %edx = 1
): void { // @Helium 0x10127c
  throw new Error(
    "HGColorMatrix::LoadMatrix(float vector[4] const*, bool) not yet transcribed (@Helium 0x10127c - HGHLG::SDRToHLG method-0 + sdrInputType=0 rec709->rec2020 load)",
  );
}

/** Data-symbol frontier for the rec709->rec2020 matrix constants. */
function HGColorGamma_rec709RGBToRec2020RGB_ref(): object { // @Helium 0x10126a leaq target
  throw new Error(
    "HGColorGamma::rec709RGBToRec2020RGB (data symbol) not yet transcribed (@Helium 0x10126a - HGHLG::SDRToHLG rec709->rec2020 matrix table)",
  );
}

/** HGColorGamma config setters called during graph build. */
function HGColorGamma_SetToneQualityMode(_p: object, _m: HGColorGamma_hgColorGammaToneQuality): void { // @Helium 0x1015da
  throw new Error(
    "HGColorGamma::SetToneQualityMode(...) not yet transcribed (@Helium 0x1015da - HGHLG::SDRToHLG method-0 + sdrInputType=1 conform tone-quality)",
  );
}
function HGColorGamma_SetConversion(
  _p: object,
  _srcPrim: number, _srcTF: number, _srcMC: number,
  _dstPrim: number, _dstTF: number, _dstMC: number,
): void { // @Helium 0x101601
  throw new Error(
    "HGColorGamma::SetConversion(...) not yet transcribed (@Helium 0x101601 - HGHLG::SDRToHLG method-0 + sdrInputType=1 primaries/TF/MC)",
  );
}
function HGColorGamma_SetPremultiplyState(_p: object, _in: boolean, _out: boolean): void { // @Helium 0x101610
  throw new Error(
    "HGColorGamma::SetPremultiplyState(bool, bool) not yet transcribed (@Helium 0x101610 - HGHLG::SDRToHLG method-0 + sdrInputType=1 premultiply)",
  );
}

/** HGColorConform config setters called during graph build. */
function HGColorConform_SetToneQualityMode(_p: object, _m: number): void { // @Helium 0x1012dc / 0x101463 / 0x1014b7
  throw new Error(
    "HGColorConform::SetToneQualityMode(...) not yet transcribed (@Helium 0x1012dc / 0x101463 / 0x1014b7 - HGHLG::SDRToHLG conform tone-quality)",
  );
}
function HGColorConform_SetAntiSymmetricToneCurves(_p: object, _b: boolean): void { // @Helium 0x101470
  throw new Error(
    "HGColorConform::SetAntiSymmetricToneCurves(bool) not yet transcribed (@Helium 0x101470 - HGHLG::SDRToHLG method-2 conform antisym-curves)",
  );
}
function HGColorConform_SetConversion(
  _p: object,
  _srcPrim: number, _srcTF: number, _srcMC: number,
  _dstPrim: number, _dstTF: number, _dstMC: number,
): void { // @Helium 0x101316 / 0x1014aa
  throw new Error(
    "HGColorConform::SetConversion(...) not yet transcribed (@Helium 0x101316 / 0x1014aa - HGHLG::SDRToHLG conform primaries/TF/MC)",
  );
}
function HGColorConform_SetPremultiplyState(_p: object, _in: boolean, _out: boolean): void { // @Helium 0x101325 / 0x1014c3
  throw new Error(
    "HGColorConform::SetPremultiplyState(bool, bool) not yet transcribed (@Helium 0x101325 / 0x1014c3 - HGHLG::SDRToHLG conform premultiply)",
  );
}

/** `HGRenderer::GetInput(HGNode*, int)` fetches the primary input node. */
function HGRenderer_GetInput(_r: HGRenderer, _n: HGNodeLike, _idx: number): HGNodeLike { // @Helium 0x1011a9
  throw new Error(
    "HGRenderer::GetInput(HGNode*, int) not yet transcribed (@Helium 0x1011a9 - HGHLG::SDRToHLG::GetOutput source-input fetch)",
  );
}

/**
 * Inner-node virtual dispatch through vtable slot +0x10 - the canonical
 * HGNode "Add" / commit-graph slot.
 */
function InnerNode_vt10_Add(_inner: object): void { // @Helium 0x101226 / 0x10129e / 0x101414 / 0x101585 / 0x101632 / 0x101667
  throw new Error(
    "inner-node vtable +0x10 (HGNode Add) not yet transcribed (@Helium 0x101226 / 0x10129e / 0x101414 / 0x101585 / 0x101632 / 0x101667 - HGHLG::SDRToHLG node graph attachment)",
  );
}

/**
 * Inner-node virtual dispatch through vtable slot +0x18 - the canonical
 * HGNode "Release" / destroy-owned slot. Called both from D0 (@0x101162)
 * and repeatedly from GetOutput to release intermediate constructions.
 */
function InnerNode_vt18_Release(_inner: object): void { // @Helium 0x101162 / 0x101292 / 0x1012a7 / 0x101425 / 0x10142e / 0x101595 / 0x10159e / 0x101626 / 0x10163b / 0x101678 / 0x101681 / 0x10168e
  throw new Error(
    "inner-node vtable +0x18 (HGNode Release/dtor) not yet transcribed (@Helium 0x101162 / 0x101292 / 0x1012a7 / 0x101425 / 0x10142e / 0x101595 / 0x10159e / 0x101626 / 0x10163b / 0x101678 / 0x101681 / 0x10168e - HGHLG::SDRToHLG node teardown)",
  );
}

/**
 * Inner-node virtual dispatch through vtable slot +0x60 - the canonical
 * HGNode `SetParameter(int, float, float, float, float)` slot. Used only
 * on the HGGamma sub-branch @0x101213 to upload the gamma=2.0 curve.
 */
function InnerNode_vt60_SetParameter(
  _inner: object, _slot: number, _x: number, _y: number, _z: number, _w: number,
): void { // @Helium 0x101213
  throw new Error(
    "inner-node vtable +0x60 (HGNode SetParameter) not yet transcribed (@Helium 0x101213 - HGHLG::SDRToHLG HGGamma 2.0 parameter upload)",
  );
}

/**
 * Inner-node virtual dispatch through vtable slot +0x78 - the canonical
 * HGNode `SetInput(int, HGNode*)` slot. Used to daisy-chain each newly
 * constructed leaf onto the previous stage's output.
 */
function InnerNode_vt78_SetInput(
  _inner: object, _slot: number, _source: HGNodeLike,
): void { // @Helium 0x1011f2 / 0x101267 / 0x1012cf / 0x10134a / 0x1013c9 / 0x101456 / 0x10153e / 0x10165e
  throw new Error(
    "inner-node vtable +0x78 (HGNode SetInput) not yet transcribed (@Helium 0x1011f2 / 0x101267 / 0x1012cf / 0x10134a / 0x1013c9 / 0x101456 / 0x10153e / 0x10165e - HGHLG::SDRToHLG pipeline input wiring)",
  );
}

/** libm `_pow(double, double)` used to compute the cached +0x1b4 f32 in both invOOTF branches. */
function libm_pow(_x: number, _y: number): number { // @Helium 0x1013f2 / 0x101565
  throw new Error(
    "_pow (libm) not yet transcribed (@Helium 0x1013f2 / 0x101565 - HGHLG::SDRToHLG invOOTF +0x1b4 cache)",
  );
}

/* ------------------------------------------------------------------ */
/* HGHLG::SDRToHLG                                                     */
/* ------------------------------------------------------------------ */

/**
 * `HGHLG::SDRToHLG` - BT.2100 SDR->HLG-HDR up-conversion facade.
 *
 * Nested inside the `HGHLG` namespace in FCP; we expose it as a plain
 * TS class named `HGHLG_SDRToHLG` (the file name uses the `::` -> `_`
 * convention). See file header for full symbol table.
 */
export class HGHLG_SDRToHLG {
  /**
   * +0x198 - pointer to the CURRENT head render node the class exposes.
   * Initialised to nullptr by the ctor (`movq $0, 0x198(%rbx)`
   * @0x101072); assigned by GetOutput at one of @0x101417 / @0x101588 /
   * @0x10166a depending on which pipeline the enum picks.
   */
  public inner: object | null;

  /**
   * +0x1a0 - uint32 `SDRInputType`. Written by the ctor's `movl %r15d,
   * 0x1a0(%rbx)` @0x10107d. NOTE: this is a 4-byte int store, NOT the
   * two-byte flag store used by the HLGToSDR sibling (which stores
   * +0x1a0/+0x1a1 with a `movw`). There is no public setter for it -
   * it's fixed at construction.
   */
  public sdrInputType: HGHLG_SDRToHLG_SDRInputType;

  /**
   * +0x1a4 - uint32 conversion method (the ctor's ConversionMethod arg).
   * Written by `movl %r14d, 0x1a4(%rbx)` @0x101084. There is no public
   * setter for it - it's fixed at construction.
   */
  public conversionMethod: HGHLG_SDRToHLG_ConversionMethod;

  /**
   * +0x1a8 - HGColorGamma::hgColorGammaToneQuality (uint32). Initialised
   * to the value returned by `HGColorGamma::GetDefaultToneQualityMode()`
   * @0x10108b; overwritten by `SetToneQualityMode` @0x1018b4.
   */
  public toneQualityMode: HGColorGamma_hgColorGammaToneQuality;

  /* ---------------- ctor: HGHLG::SDRToHLG(SDRInputType, ConversionMethod) ---- */

  /**
   * HGHLG::SDRToHLG::SDRToHLG(SDRInputType inputType, ConversionMethod method)
   *   - Helium @0x100fe0 (C2) / @0x101050 (C1). Both bodies are byte-for-
   * byte identical (modulo the `leaq` displacement into the two vtable
   * copies at @0xa17a40). Transcription of C1 @0x101050:
   *
   *   HGNode::HGNode(this);                              @0x101063
   *   this->vtable = &_ZTVN5HGHLG8SDRToHLGE (leaq)       @0x101068  -> @0xa17a40
   *   this->0x198 = nullptr;                             @0x101072
   *   this->0x1a0 = inputType;                           @0x10107d  (movl %r15d, - 4-byte int)
   *   this->0x1a4 = method;                              @0x101084  (movl %r14d, - 4-byte int)
   *   this->0x1a8 = HGColorGamma::GetDefaultToneQualityMode(); @0x10108b/@0x101090
   *
   * The dead-code unwind tail @0x1010a1..@0x1010b3 calls
   * `HGNode::~HGNode(this) ; __Unwind_Resume` if the default-tone-
   * quality lookup throws. In the TS port that call is a throw-stub, so
   * any exception propagates.
   */
  public constructor(inputType: HGHLG_SDRToHLG_SDRInputType, method: HGHLG_SDRToHLG_ConversionMethod) { // @Helium 0x100fe0 (C2) / 0x101050 (C1)
    HGNode_ctor_call(this);
    // vtable install @0x101068 -> @0xa17a40 - no-op here; virtual dispatch is explicit.
    this.inner = null;                     // +0x198 = 0                @0x101072
    this.sdrInputType = inputType | 0;     // +0x1a0 = inputType (movl) @0x10107d
    this.conversionMethod = method | 0;    // +0x1a4 = method (movl)    @0x101084
    this.toneQualityMode = HGColorGamma_GetDefaultToneQualityMode(); // +0x1a8 @0x10108b/@0x101090
  }

  /* ---------------- setter (1-line int store) ---------------- */

  /**
   * HGHLG::SDRToHLG::SetToneQualityMode(HGColorGamma::hgColorGammaToneQuality)
   *   - @Helium 0x1018b0. Asm body (verbatim):
   *     movl %esi, 0x1a8(%rdi)         ; int arg -> +0x1a8
   *
   * NOTE: there are NO other setters. HGHLG::SDRToHLG intentionally does
   * NOT expose SetOutputIsRec709Gamma / SetMinimumInputValueZero (unlike
   * its HLGToSDR sibling) - those symbols do not exist in the demangler
   * output for this class.
   */
  public SetToneQualityMode(mode: HGColorGamma_hgColorGammaToneQuality): void { // @Helium 0x1018b0
    this.toneQualityMode = mode | 0; // movl %esi, 0x1a8(%rdi)  @0x1018b4
  }

  /* ---------------- dtor: HGHLG::SDRToHLG::~SDRToHLG ---------------- */

  /**
   * HGHLG::SDRToHLG::~SDRToHLG() - Helium @0x1010c0 (D2), @0x101100 (D1),
   * @0x101140 (D0 deleting). D0 body (the only one otool -tV emitted a
   * label for - see Helium.HGHLG::SDRToHLG.~SDRToHLG.s):
   *
   *   this->vtable = &_ZTVN5HGHLG8SDRToHLGE (leaq @0x101149)  -> @0xa17a40
   *   inner = this->0x198                              @0x101153
   *   if (inner) {                                     @0x10115a/@0x10115d
   *     vt = *(void**)inner
   *     call *(vt+0x18)(inner)  // Release/dtor slot   @0x10115f/@0x101162
   *   }
   *   HGNode::~HGNode(this)                            @0x101165/@0x101168
   *   tail-jmp HGObject::operator delete(this)         @0x101170/@0x101176
   *
   * D2 and D1 share this body minus the final delete-jmp (per the ledger
   * addresses @0x1010c0/@0x101100). The unwind tail @0x10117b calls
   * __clang_call_terminate - in TS any thrown error simply propagates.
   */
  public destroy(): void { // @Helium 0x101140 (D0)
    // vtable-install @0x101149 - no-op.
    const innerPtr = this.inner; // @0x101153
    if (innerPtr !== null) {     // testq %rdi, %rdi ; je 0x101165  @0x10115a/@0x10115d
      InnerNode_vt18_Release(innerPtr); // call *0x18(%rax)          @0x101162
    }
    HGNode_dtor_call(this);      // callq HGNode::~HGNode            @0x101168
    HGObject_operator_delete(this); // tail-jmp                      @0x101176
  }

  /* ---------------- GetOutput: the graph builder ------------------- */

  /**
   * HGHLG::SDRToHLG::GetOutput(HGRenderer* r) - Helium @0x101190.
   *
   * The graph-builder. Reads the primary input, then dispatches on
   * `conversionMethod` (+0x1a4) with a chained `cmpl` cascade
   *   (@0x1011b8 `cmpl $2, ; je 0x101436` -> method==2)
   *   (@0x1011c1 `cmpl $1, ; je 0x1012af` -> method==1)
   *   (@0x1011ca `testl %eax,%eax ; jne 0x1015a1` -> method==0 falls
   *              through; method > 2 jumps straight to the tail return).
   *
   * Inside the method==0 branch a second cascade on `sdrInputType`
   * (+0x1a0) picks one of three sub-branches at @0x10123c..@0x101244 :
   *   sdrInputType == 0 -> HGColorMatrix rec709->rec2020 then shared @0x10163e
   *   sdrInputType == 1 -> HGColorGamma pipeline (@0x1015ad) then shared @0x10163e
   *   sdrInputType >= 2 -> straight to @0x10163e
   * The shared @0x10163e appends a HgcBT2390_Gain_Sat_ToneAdj and
   * publishes its head to `this.inner`.
   *
   * The bodies are transcribed line-for-line; every leaf construction
   * and every virtual dispatch is delegated to a throw-stub. See the
   * file header CONVERSION METHOD ENUM section for the full topology.
   *
   * Every leaf ctor / vtable call is a throw-stub - a plausible
   * re-implementation is EXPLICITLY not attempted (Rule 3).
   *
   * The RETURN VALUE is loaded from `this.inner` (+0x198) at the very
   * end of every path: `movq 0x198(%r14), %rbx ; jmp 0x101694` at
   * @0x1015a1/@0x101684 both funnel to `movq %rbx, %rax ; ret` @0x101694.
   * So all successful paths return the value most recently stored to
   * `this.inner`; method > 2 returns whatever was in inner before, which
   * from the ctor init is nullptr.
   */
  public GetOutput(r: HGRenderer): HGNodeLike | null { // @Helium 0x101190
    // source = HGRenderer::GetInput(r, this, 0)  @0x1011a9 (rdi=r, rsi=this, edx=0)
    const source = HGRenderer_GetInput(r, this, 0);

    // eax = 0x1a4(%r14) = conversionMethod                     @0x1011b1
    const method = this.conversionMethod >>> 0;

    if (method === 2) {
      /* ================================================================
       * method == 2 branch @0x101436 - HGColorConform antisym + peak=100
       * HgcBT2100_HLG_OOTF_InverseOOTF pipeline.
       * ================================================================ */

      // rbx = HGObject::operator new(0x370)                    @0x101436/@0x10143b
      const cc = HGObject_operator_new(0x370);
      HGColorConform_ctor(cc);                                  // @0x101446
      // *(vt+0x78)(cc, 0, source) - SetInput                   @0x101456
      InnerNode_vt78_SetInput(cc, 0, source);
      // *SetToneQualityMode(cc, this->0x1a8)                   @0x101459/@0x101463
      HGColorConform_SetToneQualityMode(cc, this.toneQualityMode);
      // *SetAntiSymmetricToneCurves(cc, true)                  @0x101468/@0x101470
      HGColorConform_SetAntiSymmetricToneCurves(cc, true);

      // The 3-way arg selector for SetConversion @0x101475..@0x10148a:
      //   eax = this->0x1a0                                    @0x101475
      //   ecx = 0
      //   ecx = (eax == 1) ? 1 : 0                             @0x10147e/0x101481 (sete %cl)
      //   esi = 3 + ecx + ecx  ; if eax != 0 keep that, else esi = eax=0
      //   -> sdrInputType 0 -> esi = 0
      //   -> sdrInputType 1 -> esi = 3 + 1 + 1 = 5
      //   -> sdrInputType>=2 -> esi = 3 + 0 + 0 = 3
      const sit = this.sdrInputType >>> 0;
      const srcPrim = sit === 0 ? 0 : sit === 1 ? 5 : 3;

      // pushed arg [rsp] = 0                                   @0x10148d
      // SetConversion(cc, srcPrim=%esi, srcTF=%edx=0xd=13, srcMC=%ecx=0,
      //               dstPrim=%r8d=3, dstTF=%r9d=8, dstMC=[rsp]=0)  @0x101494..@0x1014aa
      HGColorConform_SetConversion(cc, srcPrim, 13, 0, 3, 8, 0);

      // SetToneQualityMode(cc, 2)                              @0x1014af/@0x1014b7
      HGColorConform_SetToneQualityMode(cc, 2);
      // SetPremultiplyState(cc, false, false)                  @0x1014bc/@0x1014c3
      HGColorConform_SetPremultiplyState(cc, false, false);

      // r15 = HGObject::operator new(0x1c0)                    @0x1014c8/@0x1014cd
      const head = HGObject_operator_new(0x1c0);
      HGNode_ctor_call(head);                                   // @0x1014d8
      // head->vtable = leaq @0x1014dd - no-op in TS.

      // r12 = HGObject::operator new(0x1a0)                    @0x1014e7/@0x1014ec
      const leaf = HGObject_operator_new(0x1a0);
      HgcBT2100_HLG_OOTF_InverseOOTF_ctor(leaf);                // @0x1014f7
      // head->0x198 = leaf                                     @0x1014fc
      // head->0x1a0 = <exp2-basis constants table @0x3d12dc>   @0x101503/@0x10150a
      // head->0x1a8 = 100.0 (f64 peak_nits)                    @0x101511/@0x10151b
      // head->0x1b0 = movsd @0x3d1190 (f64 packing of {f32(-0.16666667), f32(1.7613591)})  @0x101522/@0x10152a
      void leaf;

      // *(vt+0x78)(head, 0, cc) - SetInput                     @0x101533/@0x10153e
      InnerNode_vt78_SetInput(head, 0, cc);

      // head->0x1b0 = f32(0.1821635663509369) (movl 0x3e3a8916) @0x101541
      //   OVERWRITES the low half of the pair above with a new f32 constant.
      // head->0x1b4 = f32(pow(100/100, 1.1821635668517758) * 12.0) = f32(12.0)  @0x10154c..@0x101576
      //   Peak_nits and its divisor are both 100.0 so the ratio is 1; pow(1, ...) = 1; * 12 = 12.
      //   The cache slot is populated regardless (shader reads it as a uniform).
      const _peakCache_method_2 = Math.fround(libm_pow(100.0 / 100.0, 1.1821635668517758) * 12.0);
      void _peakCache_method_2;

      // *(vt+0x10)(head) - Add                                 @0x101582/@0x101585
      InnerNode_vt10_Add(head);
      // this->0x198 = head  (publish)                          @0x101588
      this.inner = head;
      // *(vt+0x18)(head) - Release                             @0x101592/@0x101595
      InnerNode_vt18_Release(head);
      // *(vt+0x18)(cc) - Release                               @0x101598/@0x10159e
      InnerNode_vt18_Release(cc);

      // Falls through @0x1015a1 -> reload this.inner and return it.
    } else if (method === 1) {
      /* ================================================================
       * method == 1 branch @0x1012af - HGColorConform "conform-only" +
       * HgcBT2446_Method_A_ITMO + peak=1000 HgcBT2100_HLG_OOTF_InverseOOTF
       * pipeline.
       * ================================================================ */

      // rbx = HGObject::operator new(0x370)                    @0x1012af/@0x1012b4
      const cc = HGObject_operator_new(0x370);
      HGColorConform_ctor(cc);                                  // @0x1012bf
      // *(vt+0x78)(cc, 0, source) - SetInput                   @0x1012c4/@0x1012cf
      InnerNode_vt78_SetInput(cc, 0, source);
      // SetToneQualityMode(cc, this->0x1a8)                    @0x1012d2/@0x1012dc
      HGColorConform_SetToneQualityMode(cc, this.toneQualityMode);

      // The 3-way arg selector for SetConversion @0x1012e1..@0x1012f6:
      //   eax = this->0x1a0                                    @0x1012e1
      //   ecx = 0
      //   ecx = (eax == 1) ? 1 : 0                             @0x1012ea/@0x1012ed (sete %cl)
      //   esi = 3 + ecx + ecx  ; if eax != 0 keep that, else esi = eax=0
      //   -> sdrInputType 0 -> esi = 0
      //   -> sdrInputType 1 -> esi = 5
      //   -> sdrInputType>=2 -> esi = 3
      const sit = this.sdrInputType >>> 0;
      const srcPrim = sit === 0 ? 0 : sit === 1 ? 5 : 3;

      // pushed arg [rsp] = 3                                   @0x1012f9
      // SetConversion(cc, srcPrim=%esi, srcTF=%edx=1, srcMC=%ecx=0,
      //               dstPrim=%r8d=3, dstTF=%r9d=1, dstMC=[rsp]=3)  @0x1012fd..@0x101316
      HGColorConform_SetConversion(cc, srcPrim, 1, 0, 3, 1, 3);

      // r15 = 0 (rewinding a temporary)                        @0x10131b
      // SetPremultiplyState(cc, false, false)                  @0x10131e/@0x101325
      HGColorConform_SetPremultiplyState(cc, false, false);

      // r15 = HGObject::operator new(0x1a0)                    @0x10132a/@0x10132f
      const tmo = HGObject_operator_new(0x1a0);
      HgcBT2446_Method_A_ITMO_ctor(tmo);                        // @0x10133a
      // *(vt+0x78)(tmo, 0, cc) - SetInput                      @0x10133f/@0x10134a
      InnerNode_vt78_SetInput(tmo, 0, cc);

      // r12 = HGObject::operator new(0x1c0)                    @0x10134d/@0x101352
      const head = HGObject_operator_new(0x1c0);
      HGNode_ctor_call(head);                                   // @0x10135d
      // head->vtable = leaq @0x101362 - no-op.

      // r13 = HGObject::operator new(0x1a0)                    @0x10136d/@0x101372
      const leaf = HGObject_operator_new(0x1a0);
      HgcBT2100_HLG_OOTF_InverseOOTF_ctor(leaf);                // @0x10137d
      // head->0x198 = leaf                                     @0x101382
      // head->0x1a0 = <exp2-basis constants table @0x3d12dc>   @0x10138a/@0x101391
      // head->0x1a8 = 1000.0 (f64 peak_nits)                   @0x101399/@0x1013a3
      // head->0x1b0 = movsd @0x3d11a0 (f64 packing of {f32(-0.16666667), f32(12.0)})  @0x1013ab/@0x1013b3
      void leaf;

      // *(vt+0x78)(head, 0, tmo) - SetInput                    @0x1013bd/@0x1013c9
      InnerNode_vt78_SetInput(head, 0, tmo);

      // head->0x1b0 = f32(-0.16666667) (movl 0xbe2aaaab)       @0x1013cc
      //   Redundant idempotent poke: the LOW half of the pair already IS -0.16666667f
      //   from the movsd @0x3d11a0 above. FCP still emits this write.
      // head->0x1b4 = f32(pow(1000/1000, 0.8333333) * 12.0) = f32(12.0)  @0x1013d8..@0x101403
      //   Peak_nits=1000, divisor=1000; ratio=1; pow(1, 5/6)=1; * 12 = 12.
      //   Same shape as the method-2 branch but with different exponent (5/6 vs 1.1821...).
      const _peakCache_method_1 = Math.fround(libm_pow(1000.0 / 1000.0, 0.8333333333333334) * 12.0);
      void _peakCache_method_1;

      // *(vt+0x10)(head) - Add                                 @0x10140d/@0x101414
      InnerNode_vt10_Add(head);
      // this->0x198 = head  (publish)                          @0x101417
      this.inner = head;
      // *(vt+0x18)(head) - Release                             @0x10141e/@0x101425
      InnerNode_vt18_Release(head);
      // *(vt+0x18)(cc) - Release  (rbx was the HGColorConform - `movq (%rbx), %rax ; call *0x18(%rax)`)  @0x101428/@0x10142e
      InnerNode_vt18_Release(cc);
      // jmp 0x101684 -> reload this.inner and return.
    } else if (method === 0) {
      /* ================================================================
       * method == 0 branch @0x1011d2 - HGGamma head, then a THREE-WAY
       * sub-cascade on sdrInputType +0x1a0 :
       *   sit == 0 -> HGColorMatrix rec709->rec2020 stage       @0x101244
       *   sit == 1 -> HGColorGamma pipeline stage               @0x1015ad
       *   sit >= 2 -> straight to shared HgcBT2390 tail         @0x10163e
       * ================================================================ */

      // rbx = HGObject::operator new(0x1b0)                    @0x1011d2/@0x1011d7
      const gg = HGObject_operator_new(0x1b0);
      HGGamma_ctor(gg);                                         // @0x1011e2
      // *(vt+0x78)(gg, 0, source) - SetInput                   @0x1011e7/@0x1011f2
      InnerNode_vt78_SetInput(gg, 0, source);

      // SetParameter args @0x1011f5..@0x101213:
      //   xmm0 = movss @0x3caf8c = 2.0f
      //   xmm3 = movss @0x3c7cc0 = 1.0f
      //   xmm1 = xmm2 = xmm0    (movaps replication @0x10120d/@0x101210)
      //   -> SetParameter(gg, esi=0, xmm0=2.0f, xmm1=2.0f, xmm2=2.0f, xmm3=1.0f)
      InnerNode_vt60_SetParameter(gg, 0, Math.fround(2.0), Math.fround(2.0), Math.fround(2.0), Math.fround(1.0));

      // SetPremultiplyState(gg, false)                         @0x101216/@0x10121b
      HGGamma_SetPremultiplyState(gg, false);
      // *(vt+0x10)(gg) - Add                                   @0x101220/@0x101226
      InnerNode_vt10_Add(gg);

      // eax = this->0x1a0                                      @0x101229
      const sit = this.sdrInputType >>> 0;

      let stage2: object; // r12 - the head of the color-space stage, feeds HgcBT2390
      if (sit === 1) {
        /* ---------- sdrInputType == 1: HGColorGamma stage @0x1015ad ---------- */

        // r15 = HGObject::operator new(0x4a0)                  @0x1015ad/@0x1015b2
        const cg = HGObject_operator_new(0x4a0);
        HGColorGamma_ctor(cg);                                  // @0x1015bd
        // *(vt+0x78)(cg, 0, gg) - SetInput                     @0x1015c2/@0x1015cd
        //   rdx=rbx which is `gg` in this sub-branch
        InnerNode_vt78_SetInput(cg, 0, gg);
        // SetToneQualityMode(cg, this->0x1a8)                  @0x1015d0/@0x1015da
        HGColorGamma_SetToneQualityMode(cg, this.toneQualityMode);
        // pushed arg [rsp] = 0                                 @0x1015df
        // SetConversion(cg, srcPrim=%esi=5, srcTF=%edx=8, srcMC=%ecx=0,
        //               dstPrim=%r8d=3, dstTF=%r9d=8, dstMC=[rsp]=0)  @0x1015e6..@0x101601
        HGColorGamma_SetConversion(cg, 5, 8, 0, 3, 8, 0);
        // SetPremultiplyState(cg, false, false)                @0x101609/@0x101610
        HGColorGamma_SetPremultiplyState(cg, false, false);

        // If rbx==r15 skip the double-release (same-node guard)  @0x101618/@0x10161b
        //   In our TS: rbx points to gg (freshly allocated), r15 to cg - never equal.
        // *(vt+0x18)(rbx=gg) - Release                         @0x10161d/@0x101626
        InnerNode_vt18_Release(gg);
        // *(vt+0x10)(r15=cg) - Add                             @0x101629/@0x101632
        InnerNode_vt10_Add(cg);
        // *(vt+0x18)(r15=cg) - Release                         @0x101635/@0x10163b
        InnerNode_vt18_Release(cg);

        stage2 = cg;
      } else if (sit === 0) {
        /* ---------- sdrInputType == 0: HGColorMatrix rec709->rec2020 stage @0x101244 --- */

        // r15 = HGObject::operator new(0x1f0)                  @0x101244/@0x101249
        const mat = HGObject_operator_new(0x1f0);
        HGColorMatrix_ctor(mat);                                // @0x101254
        // *(vt+0x78)(mat, 0, gg) - SetInput                    @0x101259/@0x101267
        //   rdx=rbx which is `gg`
        InnerNode_vt78_SetInput(mat, 0, gg);
        // HGColorMatrix::LoadMatrix(mat, &rec709RGBToRec2020RGB, true)  @0x10126a/@0x10127c
        HGColorMatrix_LoadMatrix(mat, HGColorGamma_rec709RGBToRec2020RGB_ref(), true);

        // If rbx == r15 skip the double-release (same-node guard)  @0x101284/@0x101287
        //   Cannot happen for two distinct fresh allocations.
        // *(vt+0x18)(rbx=gg) - Release                         @0x101289/@0x101292
        InnerNode_vt18_Release(gg);
        // *(vt+0x10)(r15=mat) - Add                            @0x101295/@0x10129e
        InnerNode_vt10_Add(mat);
        // *(vt+0x18)(r15=mat) - Release                        @0x1012a1/@0x1012a7
        InnerNode_vt18_Release(mat);

        stage2 = mat;
      } else {
        /* ---------- sdrInputType >= 2: fall directly to shared tail ---------- */
        // No intermediate stage - HgcBT2390_Gain_Sat_ToneAdj feeds directly off HGGamma.
        // The `movq %rbx, %r12` @0x101239 assigns r12 = gg for the shared tail below.
        stage2 = gg;
      }

      /* -------- shared HgcBT2390_Gain_Sat_ToneAdj tail @0x10163e ---------- */

      // r15 = HGObject::operator new(0x1a0)                    @0x10163e/@0x101643
      const tail = HGObject_operator_new(0x1a0);
      HgcBT2390_Gain_Sat_ToneAdj_ctor(tail);                    // @0x10164e
      // *(vt+0x78)(tail, 0, r12=stage2) - SetInput             @0x101653/@0x10165e
      InnerNode_vt78_SetInput(tail, 0, stage2);
      // *(vt+0x10)(tail) - Add                                 @0x101661/@0x101667
      InnerNode_vt10_Add(tail);
      // this->0x198 = tail  (publish)                          @0x10166a
      this.inner = tail;
      // *(vt+0x18)(r12=stage2) - Release                       @0x101671/@0x101678
      InnerNode_vt18_Release(stage2);
      // *(vt+0x18)(rbx) - Release                              @0x10167b/@0x101681
      //   In the sit==0 branch rbx was already-released `gg`; in sit==1 rbx was gg too;
      //   in sit>=2 rbx is gg. In every path rbx points to gg. The IR reads it after the
      //   already-emitted rbx-release in the sub-branch, so it's a double-release of gg.
      //   Faithful port: emit the second call, the underlying object is a shared_ptr-like
      //   HGNode whose vt+0x18 slot is idempotent (decode not yet available; if wrong the
      //   throw-stub will surface it).
      InnerNode_vt18_Release(gg);
      // Falls into @0x101684 -> reload this.inner and return.
    }
    // method >= 3 (or the empty fall-through in the C++ enum) : nothing is
    // built, this.inner keeps its previous value (nullptr from ctor unless
    // GetOutput was called before). The tail below returns it.

    // @0x101684: rbx = 0x198(%r14) - reload this.inner (r15 side has its own
    //  reload-and-release chain @0x10168b..@0x101691 which we've already
    //  emitted inline per branch).
    // @0x101694: return rbx.
    return this.inner;
  }
}
