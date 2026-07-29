// raw-port/src/render/HGHLG_HLGToSDR.ts
//
// FCP `HGHLG::HLGToSDR` — a nested facade class in Helium's `HGHLG`
// (Hybrid Log-Gamma, BT.2100) namespace. It is a graph builder that
// wires up an HDR->SDR tone-mapping pipeline whose exact topology depends
// on the `ConversionMethod` selected at construction (int at +0x1a4)
// AND on the runtime flags SetMinimumInputValueZero (+0x1a1) /
// SetOutputIsRec709Gamma (+0x1a0). `GetOutput(HGRenderer*)` allocates
// and returns the head node of that graph.
//
// This class is the HLG sibling of `HGPQ::PQToSDR` (same layout family:
// nested facade wrapping composed HGColor* / Hgc* leaf nodes; enum at
// +0x1a4 selects the tone-map method; a HGColorGamma::hgColorGammaToneQuality
// stashed at +0x1a8; two flag bytes at +0x1a0 / +0x1a1). Compare with
// HGHLG_InverseOETF.ts (leaf-wrapping variant) and HGPQ_EOTF.ts (single-
// leaf facade).
//
// FRAMEWORK: Helium.framework (x86_64 slice; fat-slice offset 0x4000;
// the thin binary at /tmp/Helium.x86_64 has VA==file offset, so every
// RIP-relative constant address below is a direct file offset).
//
// SYMBOLS (Helium x86_64):
//   0x00100780  HGHLG::HLGToSDR::HLGToSDR(HGHLG::HLGToSDR::ConversionMethod)  [C2 base ctor]
//   0x001007e0  HGHLG::HLGToSDR::HLGToSDR(HGHLG::HLGToSDR::ConversionMethod)  [C1 complete ctor - identical body to C2]
//   0x00100840  HGHLG::HLGToSDR::~HLGToSDR()                                  [D2 base dtor]
//   0x00100880  HGHLG::HLGToSDR::~HLGToSDR()                                  [D1 complete dtor - identical body to D2]
//   0x001008c0  HGHLG::HLGToSDR::~HLGToSDR()                                  [D0 deleting dtor]
//   0x00100910  HGHLG::HLGToSDR::SetOutputIsRec709Gamma(bool)                 [1-line byte store at +0x1a0]
//   0x00100920  HGHLG::HLGToSDR::SetToneQualityMode(HGColorGamma::hgColorGammaToneQuality)  [4-byte int store at +0x1a8]
//   0x00100930  HGHLG::HLGToSDR::SetMinimumInputValueZero(bool)               [1-line byte store at +0x1a1]
//   0x00100940  HGHLG::HLGToSDR::GetOutput(HGRenderer*)                       [main graph-builder]
//
// DECODES (raw-port/re/disasm/Helium.HGHLG::HLGToSDR.*.s):
//   HLGToSDR.s (C1 @0x1007e0)
//   ~HLGToSDR.s (D0 @0x1008c0)
//   SetOutputIsRec709Gamma.s (@0x100910)
//   SetToneQualityMode.s     (@0x100920)
//   SetMinimumInputValueZero.s (@0x100930)
//   GetOutput.s              (@0x100940 - 429 lines)
//
// LAYOUT (inherits HGNode; HGNode header ends before +0x198):
//   +0x000  vtable ptr                                (installed @0x100792/@0x1007f2 via
//                                                     `leaq 0x917067(%rip)...`)
//   +0x198  void*    inner render-graph head          (initialised to nullptr in ctor
//                                                     @0x10079c/@0x1007fc; assigned by
//                                                     GetOutput @0x100c2c/@0x100cbf/
//                                                     @0x100da5 to the head node of
//                                                     whichever pipeline the enum picks)
//   +0x1a0  uint8_t  outputIsRec709Gamma flag         (defaulted to 0 by
//                                                     `movw $0, 0x1a0(%rbx)` @0x1007a7 -
//                                                     which clears BOTH +0x1a0 and +0x1a1
//                                                     in one 16-bit store; then written
//                                                     by SetOutputIsRec709Gamma @0x100914)
//   +0x1a1  uint8_t  minimumInputValueZero flag       (in the same 16-bit init store;
//                                                     written by SetMinimumInputValueZero
//                                                     @0x100934)
//   +0x1a4  uint32_t conversionMethod                 (ctor arg - `movl %r14d, 0x1a4(%rbx)`
//                                                     @0x1007b0)
//   +0x1a8  uint32_t toneQualityMode                  (initialised from
//                                                     HGColorGamma::GetDefaultToneQualityMode()
//                                                     @0x1007b7 -> 0x1a8; overwritten by
//                                                     SetToneQualityMode @0x100924)
//
// CONVERSION METHOD ENUM (from the `cmpl` at @0x100964 / @0x100a47):
//   0x100964: `cmpl $2, 0x1a4(%r14) ; jae 0x100aee`   - takes the >=2 branch
//   The <2 fall-through covers methods 0 and 1, but is FURTHER split by
//     `cmpl $0, 0x1a4(%r14) ; je 0x100bba` @0x100a47/@0x100a4f - methods
//     0 and 1 diverge here (method 0 skips the extra HGColorGamma pass).
//   The >=2 branch @0x100aee splits by `jne 0x100dc9` (method ==2 vs >2):
//     method ==2 builds the BT2446 tone-map pipeline; other methods take
//     the empty fall-through and just return the raw input.
//   So the enum has (at least) 4 values: 0=method-0, 1=method-1,
//     2=BT2446, other=identity (no tone-map). ConversionMethod is
//     declared as an `enum class` in Helium - its symbolic names are not
//     in the demangler output; we model it as a numeric field.
//
// UNDECODED CALLEES / FRONTIER (each gets a throwing stub citing its @0xADDR):
//   HGNode::HGNode()                          @Helium 0x10078d / 0x1007ed / 0x100982 / 0x100b04
//   HGObject::operator new(size_t)            @Helium 0x100977 / 0x100996 / 0x100a15 /
//                                              0x100a5a / 0x100af9 / 0x100b18 / 0x100ba5 /
//                                              0x100bbf / 0x100c3d / 0x100cf6 / 0x100d37
//   HGObject::operator delete(void*)          @Helium 0x1008f6 (dtor tail-jmp) / 0x100de7
//   HgcBT2100_HLG_OOTF_InverseOOTF::HgcBT2100_HLG_OOTF_InverseOOTF()
//                                             @Helium 0x1009a1 / 0x100b23
//   HgcBT2446_Method_A_TMO::HgcBT2446_Method_A_TMO()
//                                             @Helium 0x100d01
//   HgcBT2446_Method_A_TMO_Input_Clamped::HgcBT2446_Method_A_TMO_Input_Clamped()
//                                             @Helium 0x100bb0
//   HGColorMatrix::HGColorMatrix()            @Helium 0x100a20
//   HGColorMatrix::LoadMatrix(float vec4 const*, bool)
//                                             @Helium 0x100a42
//   HGColorGamma::HGColorGamma()              @Helium 0x100a65 / 0x100c48
//   HGColorGamma::SetToneQualityMode(...)     @Helium 0x100a83 / 0x100abe / 0x100c66 / 0x100c97
//   HGColorGamma::SetConversion(...)          @Helium 0x100aa4 / 0x100c8a
//   HGColorGamma::SetAntiSymmetricToneCurves(bool) @Helium 0x100ab1 / 0x100ca4
//   HGColorGamma::SetPremultiplyState(bool,bool)   @Helium 0x100acd / 0x100cb0
//   HGColorGamma::GetDefaultToneQualityMode() @Helium 0x100817 (ctor init) / 0x1007b7 (C2)
//   HGColorConform::HGColorConform()          @Helium 0x100d42
//   HGColorConform::SetToneQualityMode(...)   @Helium 0x100d61
//   HGColorConform::SetConversion(...)        @Helium 0x100d8a
//   HGColorConform::SetPremultiplyState(bool,bool) @Helium 0x100d96
//   HGRenderer::GetInput(HGNode*, int)        @Helium 0x10095c
//   HGNode::~HGNode()                         @Helium 0x100832 (ctor unwind) / 0x1008e8 (D0)
//   `HGColorGamma::rec2020RGBToRec709RGB` matrix data pointer @Helium 0x100a33
//   Inner-node virtual dispatch through `*(vt+0x10)` - the `Add` slot
//                                             @Helium 0x100adc / 0x100c0b / 0x100c29 /
//                                              0x100cbc / 0x100da2
//   Inner-node virtual dispatch through `*(vt+0x18)` - the "release / dtor"
//     slot per HGNode canonical vtable
//                                             @Helium 0x100ae6 / 0x100c15 / 0x100ccd /
//                                              0x100cd7 / 0x100ce0 / 0x100ce9 / 0x100db3 /
//                                              0x100dbd / 0x100dc6 / 0x1008e2 (D0)
//   Inner-node virtual dispatch through `*(vt+0x60)` - SetParameter slot
//                                             @Helium 0x100bfe
//   Inner-node virtual dispatch through `*(vt+0x78)` - SetInput slot
//                                             @Helium 0x1009e7 / 0x100a30 / 0x100a76 /
//                                              0x100b69 / 0x100bde / 0x100c59 / 0x100d15 /
//                                              0x100d54
//
// DECODED CONSTANTS (from Helium.x86_64 with VA==file offset; every
// RIP-relative constant is next_ip + disp32):
//
//   GetOutput @0x100940 - method-{0,1} branches (peak_nits = 100):
//     0x1009bb  movabsq $0x4059000000000000, %rax               ##       -> 100.0 (f64) stored at +0x1a8 of inner    (peak_nits=100)
//     0x1009cc  movsd   0x2d07ac(%rip), %xmm0                   ## const @0x3d1180 = f64 packing of
//                                                                        {f32(0x3e4ccccd)=0.2f @+0, f32(0x3f01c8ce)=0.5069702863693237f @+4}
//                                                                        - stored 8-byte at +0x1b0 of inner (later half-overwritten)
//     0x1009ea  movl    $0xbe1dcaa7, 0x1b0(%rbx)                ## f32 -0.15400001f - writes low 4 of the pair
//                                                                        (the high 4, 0x3f01c8ce = 0.5069702863693237f, stays as an f32 at +0x1b4)
//     0x1009f4  movsd   0x2d042c(%rip), %xmm0                   ## const @0x3d0e28 = 12.221188086627844 (f64)
//     0x1009fc  divsd   0x1a8(%rbx), %xmm0                      ## xmm0 /= 100.0 = 0.12221188086627844
//     0x100a04  cvtsd2ss %xmm0, %xmm0
//     0x100a08  movss   %xmm0, 0x1b4(%rbx)                      ## f32(12.221188086627844/100) = 0.12221188f
//                                                                        OVERWRITES the 0x3f01c8ce half above
//
//   GetOutput @0x100940 - method-2 branch (peak_nits = 1000):
//     0x100b3d  movabsq $0x408f400000000000, %rax               ##       -> 1000.0 (f64) stored at +0x1a8 of inner    (peak_nits=1000)
//     0x100b4e  movsd   0x2d061a(%rip), %xmm0                   ## const @0x3d1170 = f64 packing of
//                                                                        {f32(0x3e4ccccd)=0.2f @+0, f32(0x3d4fa7b0)=0.05069702863693237f @+4}
//                                                                        - stored 8-byte at +0x1b0 of inner
//     0x100b6c  movl    $0x3e4ccccd, 0x1b0(%rbx)                ## f32 0.2f - writes low 4 (identical to the low f32 above, an idempotent poke)
//     0x100b76  movsd   0x2d0262(%rip), %xmm0                   ## const @0x3d0de0 = 50.69702849110048 (f64)
//     0x100b7e  divsd   0x1a8(%rbx), %xmm0                      ## xmm0 /= 1000.0 = 0.05069702849110048
//     0x100b86  cvtsd2ss %xmm0, %xmm0
//     0x100b8a  movss   %xmm0, 0x1b4(%rbx)                      ## f32(50.697.../1000) = 0.050697029f - replaces the 0.05069702863693237f half above
//
//   GetOutput @0x100940 - HGGamma default branch (method == 0 & !MinimumInputValueZero):
//     0x100be8  movss   0x2d03b4(%rip), %xmm0                   ## const @0x3d0fa4 = 0.4545454680919647f (= 1/2.2, sRGB-ish gamma exponent)
//                                                                        passed as arg to inner HGGamma vtable slot +0x60 (SetParameter)
//
//   GetOutput @0x100940 - HGColorMatrix + HGColorGamma pass:
//     0x100a33  leaq    HGColorGamma::rec2020RGBToRec709RGB(%rip), %rsi
//                                                                - a static float vec4[3] matrix table
//                                                                  used by HGColorMatrix::LoadMatrix
//
//   These f64 constants are the reparameterisation constants for the
//   HgcBT2100_HLG_OOTF_InverseOOTF leaf. The pattern is IDENTICAL to
//   HGHLG::InverseOETF's use of the exp2-basis constants aa/cc (see
//   HGHLG_InverseOETF.ts): a peak-nits divider (100 SDR / 1000 HDR
//   reference), a constant offset written to +0x1b0/+0x1b4 as a pair of
//   f32s (a linear coefficient and a normalized-per-peak-nits scale),
//   and 3 uniform slots the shader consumes.
//
// The full HLG constant set (a=0.17883277265695 @0x3d0dc8, b=0.2846689093722
// @0x3d0dd8, c=0.5599107277627162 as a guarded Meyers-singleton) referenced
// in this class's task brief is only DIRECTLY loaded by the leaf
// HgcBT2100_HLG_* nodes (and by HGHLG::InverseOETF::L(double)). HGHLG::HLGToSDR
// itself does not touch a/b/c - it composes leaf nodes that do.
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
 * `HGHLG::HLGToSDR::ConversionMethod` - enum class parameter selecting
 * the HDR->SDR pipeline topology. The demangler exposes it only by name;
 * the disasm identifies at least 4 distinct code paths (see file header):
 *   0 = method-0 (peak=100; direct HgcBT2100_HLG_OOTF_InverseOOTF + matrix)
 *   1 = method-1 (as method-0, plus a follow-up HGColorGamma antisym pass)
 *   2 = BT2446 tone-map (peak=1000; HgcBT2446_Method_A_TMO[_Input_Clamped])
 *   >=3 = identity fall-through (empty branch @0x100aee `jne 0x100dc9`)
 */
export type HGHLG_HLGToSDR_ConversionMethod = number;

/**
 * `HGColorGamma::hgColorGammaToneQuality` - enum passed to
 * SetToneQualityMode / stored at +0x1a8. Modelled as a numeric field
 * because the demangler doesn't emit its symbolic names either.
 */
export type HGColorGamma_hgColorGammaToneQuality = number;

/* ------------------------------------------------------------------ */
/* Undecoded-frontier stubs (each throws with its @0xADDR).            */
/* ------------------------------------------------------------------ */

/** Base-class ctor tail-called by C1/C2 @Helium 0x10078d / 0x1007ed. */
function HGNode_ctor_call(_self: object): void { // @Helium 0x10078d / 0x1007ed
  throw new Error(
    "HGNode::HGNode() not yet transcribed (@Helium 0x10078d / 0x1007ed - HGHLG::HLGToSDR C2/C1 base-call)",
  );
}

/** Base-class dtor tail-jmp'd by D0 @Helium 0x1008e8. */
function HGNode_dtor_call(_self: object): void { // @Helium 0x1008e8 / 0x100832
  throw new Error(
    "HGNode::~HGNode() not yet transcribed (@Helium 0x1008e8 / 0x100832 - HGHLG::HLGToSDR D0 base-dtor / ctor-unwind)",
  );
}

/**
 * `HGObject::operator new(size_t)` - Helium's placement/tagged alloc.
 * Called for every leaf node the graph builder allocates (see file header
 * for the full list of call-sites and their sizes).
 */
function HGObject_operator_new(_bytes: number): object { // @Helium 0x100977 / 0x100996 / 0x100a15 / 0x100a5a / 0x100af9 / 0x100b18 / 0x100ba5 / 0x100bbf / 0x100c3d / 0x100cf6 / 0x100d37
  throw new Error(
    "HGObject::operator new(unsigned long) not yet transcribed (@Helium 0x100977 - HGHLG::HLGToSDR::GetOutput node allocation; sizes 0x1a0/0x1b0/0x1c0/0x1f0/0x370/0x4a0)",
  );
}

/** `HGObject::operator delete(void*)` - tail-jmp'd by D0 @Helium 0x1008f6. */
function HGObject_operator_delete(_p: object): void { // @Helium 0x1008f6 / 0x100de7
  throw new Error(
    "HGObject::operator delete(void*) not yet transcribed (@Helium 0x1008f6 / 0x100de7 - HGHLG::HLGToSDR D0 deletion / GetOutput unwind)",
  );
}

/** `HGColorGamma::GetDefaultToneQualityMode()` - used by ctor to init +0x1a8. */
function HGColorGamma_GetDefaultToneQualityMode(): HGColorGamma_hgColorGammaToneQuality { // @Helium 0x1007b7 / 0x100817
  throw new Error(
    "HGColorGamma::GetDefaultToneQualityMode() not yet transcribed (@Helium 0x1007b7 / 0x100817 - HGHLG::HLGToSDR ctor default init of +0x1a8)",
  );
}

/** Inner leaf-node ctors - one per pipeline branch. */
function HgcBT2100_HLG_OOTF_InverseOOTF_ctor(_p: object): void { // @Helium 0x1009a1 / 0x100b23
  throw new Error(
    "HgcBT2100_HLG_OOTF_InverseOOTF::HgcBT2100_HLG_OOTF_InverseOOTF() not yet transcribed (@Helium 0x1009a1 / 0x100b23 - HGHLG::HLGToSDR method-{0,1} pipeline head)",
  );
}
function HgcBT2446_Method_A_TMO_ctor(_p: object): void { // @Helium 0x100d01
  throw new Error(
    "HgcBT2446_Method_A_TMO::HgcBT2446_Method_A_TMO() not yet transcribed (@Helium 0x100d01 - HGHLG::HLGToSDR method-2 pipeline tone-mapper)",
  );
}
function HgcBT2446_Method_A_TMO_Input_Clamped_ctor(_p: object): void { // @Helium 0x100bb0
  throw new Error(
    "HgcBT2446_Method_A_TMO_Input_Clamped::HgcBT2446_Method_A_TMO_Input_Clamped() not yet transcribed (@Helium 0x100bb0 - HGHLG::HLGToSDR method-2 + MinimumInputValueZero=false clamp head)",
  );
}
function HGColorMatrix_ctor(_p: object): void { // @Helium 0x100a20
  throw new Error(
    "HGColorMatrix::HGColorMatrix() not yet transcribed (@Helium 0x100a20 - HGHLG::HLGToSDR method-{0,1} rec2020->rec709 matrix stage)",
  );
}
function HGColorGamma_ctor(_p: object): void { // @Helium 0x100a65 / 0x100c48
  throw new Error(
    "HGColorGamma::HGColorGamma() not yet transcribed (@Helium 0x100a65 / 0x100c48 - HGHLG::HLGToSDR method-1 antisym-tone-curves stage / method-{0,1} !Rec709Gamma stage)",
  );
}
function HGColorConform_ctor(_p: object): void { // @Helium 0x100d42
  throw new Error(
    "HGColorConform::HGColorConform() not yet transcribed (@Helium 0x100d42 - HGHLG::HLGToSDR method-2 output-conform stage)",
  );
}

/** HGGamma inner-leaf used by the default HGGamma branch is NOT constructed
 *  directly by this class (see HGGamma.ts). But its ctor is invoked here
 *  via the Rec709 gamma fall-through path @0x100bca. */
function HGGamma_ctor(_p: object): void { // @Helium 0x100bca
  throw new Error(
    "HGGamma::HGGamma() not yet transcribed (@Helium 0x100bca - HGHLG::HLGToSDR method-0 + !MinimumInputValueZero + !Rec709Gamma gamma stage)",
  );
}

/** HGColorGamma parameter/config setters called during graph build. */
function HGColorGamma_SetToneQualityMode(_p: object, _m: HGColorGamma_hgColorGammaToneQuality): void { // @Helium 0x100a83 / 0x100abe / 0x100c66 / 0x100c97
  throw new Error(
    "HGColorGamma::SetToneQualityMode(...) not yet transcribed (@Helium 0x100a83 / 0x100abe / 0x100c66 / 0x100c97 - HGHLG::HLGToSDR HGColorGamma configuration)",
  );
}
function HGColorGamma_SetConversion(
  _p: object,
  _srcPrim: number, _srcTF: number, _srcMC: number,
  _dstPrim: number, _dstTF: number, _dstMC: number,
): void { // @Helium 0x100aa4 / 0x100c8a
  throw new Error(
    "HGColorGamma::SetConversion(...) not yet transcribed (@Helium 0x100aa4 / 0x100c8a - HGHLG::HLGToSDR HGColorGamma primaries/TF/MC config)",
  );
}
function HGColorGamma_SetAntiSymmetricToneCurves(_p: object, _b: boolean): void { // @Helium 0x100ab1 / 0x100ca4
  throw new Error(
    "HGColorGamma::SetAntiSymmetricToneCurves(bool) not yet transcribed (@Helium 0x100ab1 / 0x100ca4 - HGHLG::HLGToSDR HGColorGamma tone-curves flag)",
  );
}
function HGColorGamma_SetPremultiplyState(_p: object, _in: boolean, _out: boolean): void { // @Helium 0x100acd / 0x100cb0
  throw new Error(
    "HGColorGamma::SetPremultiplyState(bool, bool) not yet transcribed (@Helium 0x100acd / 0x100cb0 - HGHLG::HLGToSDR HGColorGamma premultiply flags)",
  );
}

/** HGColorMatrix::LoadMatrix - loads the rec2020->rec709 float vec4[3] table. */
function HGColorMatrix_LoadMatrix(
  _p: object,
  _matrix: object,      // @Helium 0x100a33 leaq HGColorGamma::rec2020RGBToRec709RGB(%rip)
  _flag: boolean,       // %edx = 1
): void { // @Helium 0x100a42
  throw new Error(
    "HGColorMatrix::LoadMatrix(float vector[4] const*, bool) not yet transcribed (@Helium 0x100a42 - HGHLG::HLGToSDR method-{0,1} rec2020->rec709 load)",
  );
}

/** Data-symbol frontier for the rec2020->rec709 matrix constants. */
function HGColorGamma_rec2020RGBToRec709RGB_ref(): object { // @Helium 0x100a33 leaq target
  throw new Error(
    "HGColorGamma::rec2020RGBToRec709RGB (data symbol) not yet transcribed (@Helium 0x100a33 - HGHLG::HLGToSDR rec2020->rec709 matrix table)",
  );
}

/** HGColorConform config setters called during graph build. */
function HGColorConform_SetToneQualityMode(_p: object, _m: number): void { // @Helium 0x100d61
  throw new Error(
    "HGColorConform::SetToneQualityMode(...) not yet transcribed (@Helium 0x100d61 - HGHLG::HLGToSDR method-2 conform tone-quality)",
  );
}
function HGColorConform_SetConversion(
  _p: object,
  _srcPrim: number, _srcTF: number, _srcMC: number,
  _dstPrim: number, _dstTF: number, _dstMC: number,
): void { // @Helium 0x100d8a
  throw new Error(
    "HGColorConform::SetConversion(...) not yet transcribed (@Helium 0x100d8a - HGHLG::HLGToSDR method-2 conform primaries/TF/MC)",
  );
}
function HGColorConform_SetPremultiplyState(_p: object, _in: boolean, _out: boolean): void { // @Helium 0x100d96
  throw new Error(
    "HGColorConform::SetPremultiplyState(bool, bool) not yet transcribed (@Helium 0x100d96 - HGHLG::HLGToSDR method-2 conform premultiply)",
  );
}

/** `HGRenderer::GetInput(HGNode*, int)` fetches the primary input node. */
function HGRenderer_GetInput(_r: HGRenderer, _n: HGNodeLike, _idx: number): HGNodeLike { // @Helium 0x10095c
  throw new Error(
    "HGRenderer::GetInput(HGNode*, int) not yet transcribed (@Helium 0x10095c - HGHLG::HLGToSDR::GetOutput source-input fetch)",
  );
}

/**
 * Inner-node virtual dispatch through vtable slot +0x10 - the canonical
 * HGNode "Add" / commit-graph slot (see HGNode.ts vtable map). Called
 * once per intermediate node to hook it into the render graph.
 */
function InnerNode_vt10_Add(_inner: object): void { // @Helium 0x100adc / 0x100c0b / 0x100c29 / 0x100cbc / 0x100da2
  throw new Error(
    "inner-node vtable +0x10 (HGNode Add) not yet transcribed (@Helium 0x100adc / 0x100c0b / 0x100c29 / 0x100cbc / 0x100da2 - HGHLG::HLGToSDR node graph attachment)",
  );
}

/**
 * Inner-node virtual dispatch through vtable slot +0x18 - the canonical
 * HGNode "Release" / destroy-owned slot. Called both from D0 (@0x1008e2)
 * and repeatedly from GetOutput to release intermediate constructions.
 */
function InnerNode_vt18_Release(_inner: object): void { // @Helium 0x1008e2 / 0x100ae6 / 0x100c15 / 0x100ccd / 0x100cd7 / 0x100ce0 / 0x100ce9 / 0x100db3 / 0x100dbd / 0x100dc6
  throw new Error(
    "inner-node vtable +0x18 (HGNode Release/dtor) not yet transcribed (@Helium 0x1008e2 / 0x100ae6 / 0x100c15 / 0x100ccd / 0x100cd7 / 0x100ce0 / 0x100ce9 / 0x100db3 / 0x100dbd / 0x100dc6 - HGHLG::HLGToSDR node teardown)",
  );
}

/**
 * Inner-node virtual dispatch through vtable slot +0x60 - the canonical
 * HGNode `SetParameter(int, float, float, float, float)` slot. Only used
 * on the HGGamma sub-branch at @0x100bfe to upload the 1/2.2 exponent.
 */
function InnerNode_vt60_SetParameter(
  _inner: object, _slot: number, _x: number, _y: number, _z: number, _w: number,
): void { // @Helium 0x100bfe
  throw new Error(
    "inner-node vtable +0x60 (HGNode SetParameter) not yet transcribed (@Helium 0x100bfe - HGHLG::HLGToSDR HGGamma 1/2.2 exponent upload)",
  );
}

/**
 * Inner-node virtual dispatch through vtable slot +0x78 - the canonical
 * HGNode `SetInput(int, HGNode*)` slot. Used to daisy-chain each newly
 * constructed leaf onto the previous stage's output.
 */
function InnerNode_vt78_SetInput(
  _inner: object, _slot: number, _source: HGNodeLike,
): void { // @Helium 0x1009e7 / 0x100a30 / 0x100a76 / 0x100b69 / 0x100bde / 0x100c59 / 0x100d15 / 0x100d54
  throw new Error(
    "inner-node vtable +0x78 (HGNode SetInput) not yet transcribed (@Helium 0x1009e7 / 0x100a30 / 0x100a76 / 0x100b69 / 0x100bde / 0x100c59 / 0x100d15 / 0x100d54 - HGHLG::HLGToSDR pipeline input wiring)",
  );
}

/* ------------------------------------------------------------------ */
/* HGHLG::HLGToSDR                                                     */
/* ------------------------------------------------------------------ */

/**
 * `HGHLG::HLGToSDR` - BT.2100 HLG HDR->SDR tone-mapping facade.
 *
 * Nested inside the `HGHLG` namespace in FCP; we expose it as a plain TS
 * class named `HGHLG_HLGToSDR` (the file name uses the `::` -> `_`
 * convention). See file header for full symbol table.
 */
export class HGHLG_HLGToSDR {
  /**
   * +0x198 - pointer to the CURRENT head render node the class exposes.
   * Initialised to nullptr by the ctor (`movq $0, 0x198(%rbx)` @0x10079c);
   * assigned by GetOutput at one of @0x100c2c / @0x100cbf / @0x100da5
   * depending on which pipeline the enum picks.
   */
  public inner: object | null;

  /**
   * +0x1a0 - bool `outputIsRec709Gamma`. Zero-initialised together with
   * +0x1a1 by the 16-bit `movw $0, 0x1a0(%rbx)` @0x1007a7. Written by
   * `SetOutputIsRec709Gamma(bool)` @0x100914 (`movb %sil, 0x1a0(%rdi)`).
   */
  public outputIsRec709Gamma: boolean;

  /**
   * +0x1a1 - bool `minimumInputValueZero`. Zero-initialised as the high
   * byte of the same 16-bit init. Written by `SetMinimumInputValueZero`
   * @0x100934 (`movb %sil, 0x1a1(%rdi)`).
   */
  public minimumInputValueZero: boolean;

  /**
   * +0x1a4 - uint32 conversion method (the ctor's enum argument). Written
   * by `movl %r14d, 0x1a4(%rbx)` @0x1007b0.
   */
  public conversionMethod: HGHLG_HLGToSDR_ConversionMethod;

  /**
   * +0x1a8 - HGColorGamma::hgColorGammaToneQuality (uint32). Initialised
   * to the value returned by `HGColorGamma::GetDefaultToneQualityMode()`
   * @0x1007b7 -> 0x1a8; overwritten by `SetToneQualityMode` @0x100924.
   */
  public toneQualityMode: HGColorGamma_hgColorGammaToneQuality;

  /* ---------------- ctor: HGHLG::HLGToSDR(ConversionMethod) ---------- */

  /**
   * HGHLG::HLGToSDR::HLGToSDR(HGHLG::HLGToSDR::ConversionMethod method)
   *   - Helium @0x100780 (C2) / @0x1007e0 (C1). Both bodies are byte-for-
   * byte identical (modulo the `leaq` displacement into the two vtable
   * copies at @0x100792 vs @0x1007f2). Transcription of C1 @0x1007e0:
   *
   *   HGNode::HGNode(this);                              @0x1007ed
   *   this->vtable = &_ZTVN5HGHLG8HLGToSDRE (leaq)       @0x1007f2
   *   this->0x198 = nullptr;                             @0x1007fc
   *   *(uint16_t*)(this + 0x1a0) = 0;                    @0x100807  <- clears +0x1a0 AND +0x1a1
   *   this->0x1a4 = method;                              @0x100810  (movl %r14d)
   *   this->0x1a8 = HGColorGamma::GetDefaultToneQualityMode(); @0x100817/@0x10081c
   *
   * The dead-code unwind tail @0x100827..@0x100835 is exception cleanup -
   * it calls `HGNode::~HGNode(this) ; __Unwind_Resume` if the default-
   * tone-quality lookup throws. In the TS port that call is a throw-stub,
   * so any exception propagates.
   */
  public constructor(method: HGHLG_HLGToSDR_ConversionMethod) { // @Helium 0x100780 (C2) / 0x1007e0 (C1)
    HGNode_ctor_call(this);
    // vtable install @0x1007f2 - no-op here; virtual dispatch is explicit.
    this.inner = null;                     // +0x198 = 0                @0x1007fc
    this.outputIsRec709Gamma = false;      // +0x1a0 = 0 (low byte)     @0x100807
    this.minimumInputValueZero = false;    // +0x1a1 = 0 (high byte)    @0x100807 (same movw)
    this.conversionMethod = method;        // +0x1a4 = method           @0x100810
    this.toneQualityMode = HGColorGamma_GetDefaultToneQualityMode(); // +0x1a8 @0x100817/@0x10081c
  }

  /* ---------------- setters (1-line byte/int stores) ---------------- */

  /**
   * HGHLG::HLGToSDR::SetOutputIsRec709Gamma(bool) - @Helium 0x100910.
   * Asm body (verbatim):
   *   pushq %rbp ; movq %rsp, %rbp
   *   movb  %sil, 0x1a0(%rdi)         ; low byte of the arg -> +0x1a0
   *   popq  %rbp ; retq
   */
  public SetOutputIsRec709Gamma(v: boolean): void { // @Helium 0x100910
    this.outputIsRec709Gamma = v; // movb %sil, 0x1a0(%rdi)  @0x100914
  }

  /**
   * HGHLG::HLGToSDR::SetToneQualityMode(HGColorGamma::hgColorGammaToneQuality)
   *   - @Helium 0x100920. Asm body:
   *     movl %esi, 0x1a8(%rdi)         ; int arg -> +0x1a8
   */
  public SetToneQualityMode(mode: HGColorGamma_hgColorGammaToneQuality): void { // @Helium 0x100920
    this.toneQualityMode = mode | 0; // movl %esi, 0x1a8(%rdi)  @0x100924
  }

  /**
   * HGHLG::HLGToSDR::SetMinimumInputValueZero(bool) - @Helium 0x100930.
   * Asm body:
   *     movb %sil, 0x1a1(%rdi)         ; low byte of the arg -> +0x1a1
   */
  public SetMinimumInputValueZero(v: boolean): void { // @Helium 0x100930
    this.minimumInputValueZero = v; // movb %sil, 0x1a1(%rdi)  @0x100934
  }

  /* ---------------- dtor: HGHLG::HLGToSDR::~HLGToSDR ---------------- */

  /**
   * HGHLG::HLGToSDR::~HLGToSDR() - Helium @0x100840 (D2), @0x100880 (D1),
   * @0x1008c0 (D0 deleting). D0 body (the only one otool -tV emitted a
   * label for - see Helium.HGHLG::HLGToSDR.~HLGToSDR.s):
   *
   *   this->vtable = &_ZTVN5HGHLG8HLGToSDRE (leaq @0x1008c9)
   *   inner = this->0x198                              @0x1008d3
   *   if (inner) {                                     @0x1008da/@0x1008dd
   *     vt = *(void**)inner
   *     call *(vt+0x18)(inner)  // Release/dtor slot   @0x1008df/@0x1008e2
   *   }
   *   HGNode::~HGNode(this)                            @0x1008e5/@0x1008e8
   *   tail-jmp HGObject::operator delete(this)         @0x1008ed/@0x1008f6
   *
   * D2 and D1 share this body minus the final delete-jmp (per the ledger
   * addresses @0x100840/@0x100880). The unwind tail @0x1008fb calls
   * __clang_call_terminate - in TS any thrown error simply propagates.
   */
  public destroy(): void { // @Helium 0x1008c0 (D0)
    // vtable-install @0x1008c9 - no-op.
    const innerPtr = this.inner; // @0x1008d3
    if (innerPtr !== null) {     // testq %rdi, %rdi ; je 0x1008e5  @0x1008da/@0x1008dd
      InnerNode_vt18_Release(innerPtr); // call *0x18(%rax)         @0x1008e2
    }
    HGNode_dtor_call(this);      // callq HGNode::~HGNode           @0x1008e8
    HGObject_operator_delete(this); // tail-jmp                     @0x1008f6
  }

  /* ---------------- GetOutput: the graph builder ------------------- */

  /**
   * HGHLG::HLGToSDR::GetOutput(HGRenderer* r) - Helium @0x100940.
   *
   * The graph-builder. Reads the primary input, then dispatches on
   * `conversionMethod` (+0x1a4) with a first `cmpl $2, ...` split
   * (@0x100964) and - inside the <2 branch - a second `cmpl $0, ...`
   * split at @0x100a47. Inside the >=2 branch there is a third split
   * @0x100aee (`jne 0x100dc9`) for method==2 vs anything else.
   *
   * The bodies are transcribed line-for-line; every leaf construction
   * and every virtual dispatch is delegated to a throw-stub. See the
   * file header CONVERSION METHOD ENUM section for the full topology.
   *
   * Every leaf ctor / vtable call is a throw-stub - a plausible
   * re-implementation is EXPLICITLY not attempted (Rule 3).
   */
  public GetOutput(r: HGRenderer): HGNodeLike | null { // @Helium 0x100940
    // source = HGRenderer::GetInput(r, this, 0)  @0x10095c
    const source = HGRenderer_GetInput(r, this, 0);

    // cmpl $2, 0x1a4(%r14) ; jae 0x100aee   @0x100964
    if ((this.conversionMethod >>> 0) < 2) {
      // method in {0, 1}
      // head = HGObject::operator new(0x1c0)  @0x100972/@0x100977
      const head = HGObject_operator_new(0x1c0);
      HGNode_ctor_call(head);                    // @0x100982
      // head->vtable = leaq @0x100987/@0x10098e - no-op in TS.

      // leaf1 = HGObject::operator new(0x1a0)  @0x100991/@0x100996
      const leaf1 = HGObject_operator_new(0x1a0);
      HgcBT2100_HLG_OOTF_InverseOOTF_ctor(leaf1); // @0x1009a1
      void leaf1;
      // head.inner = leaf1  @0x1009a6
      // head->0x1a0 = <exp2-basis constants table pointer>  @0x1009ad/@0x1009b4
      // head->0x1a8 = 100.0 (f64 peak_nits)  @0x1009bb/@0x1009c5
      // head->0x1b0 = movsd const @0x3d1180 (packs {0.2f, 0.5069702863693237f})  @0x1009cc/@0x1009d4

      // call *(head->vt + 0x78)(head, 0, source)  // SetInput  @0x1009e7
      InnerNode_vt78_SetInput(head, 0, source);

      // head->0x1b0 = f32(-0.15400001f) (movl 0xbe1dcaa7)  @0x1009ea
      // head->0x1b4 = f32(12.221188086627844 / 100.0) = 0.12221188f  @0x1009f4..@0x100a08
      // (Numerics fully computed here for provenance; nothing to store into
      //  the JS object - the value lives inside the opaque `head` frontier.)
      const _peakScale_method_0_1 = Math.fround(12.221188086627844 / 100.0);
      void _peakScale_method_0_1;

      // mat = HGObject::operator new(0x1f0)  @0x100a10/@0x100a15
      const mat = HGObject_operator_new(0x1f0);
      HGColorMatrix_ctor(mat);                    // @0x100a20
      // call *(mat->vt + 0x78)(mat, 0, head)  // SetInput  @0x100a30
      InnerNode_vt78_SetInput(mat, 0, head);
      // HGColorMatrix::LoadMatrix(mat, &rec2020RGBToRec709RGB, true)  @0x100a33..@0x100a42
      HGColorMatrix_LoadMatrix(mat, HGColorGamma_rec2020RGBToRec709RGB_ref(), true);

      // cmpl $0, 0x1a4(%r14) ; je 0x100bba   @0x100a47/@0x100a4f
      if ((this.conversionMethod >>> 0) !== 0) {
        // method == 1: HGColorGamma antisym tone-curves pass
        const cg = HGObject_operator_new(0x4a0);   // @0x100a55/@0x100a5a
        HGColorGamma_ctor(cg);                     // @0x100a65
        InnerNode_vt78_SetInput(cg, 0, mat);       // *(vt+0x78)  @0x100a76
        HGColorGamma_SetToneQualityMode(cg, this.toneQualityMode); // @0x100a79/@0x100a83
        HGColorGamma_SetConversion(cg, 0, 8, 0, 0, 0, 13); // (%r9d=13, %r8d=0, %ecx=0, %edx=8, %esi=0)  @0x100a88..@0x100aa4
        HGColorGamma_SetAntiSymmetricToneCurves(cg, true); // @0x100aac..@0x100ab1
        HGColorGamma_SetToneQualityMode(cg, 2);    // @0x100ab6..@0x100abe
        HGColorGamma_SetPremultiplyState(cg, false, false); // @0x100ac6..@0x100acd
        InnerNode_vt10_Add(cg);                    // *(vt+0x10)  @0x100adc
        InnerNode_vt18_Release(cg);                // *(vt+0x18)  @0x100ae6
        // jmp 0x100c18  - falls through to the shared post-pipeline below
      } else {
        // method == 0: HGGamma 1/2.2 gamma pass  @0x100bba
        const gg = HGObject_operator_new(0x1b0);   // @0x100bba/@0x100bbf
        HGGamma_ctor(gg);                          // @0x100bca
        InnerNode_vt78_SetInput(gg, 0, mat);       // *(vt+0x78)  @0x100bde
        // *(vt+0x60)(gg, 0, 0.4545454680919647f, 0, 0, 0)  - SetParameter  @0x100be8..@0x100bfe
        // 0x2d03b4(%rip) @0x100be8 -> const @0x3d0fa4 = 0.4545454680919647f (= 1/2.2)
        InnerNode_vt60_SetParameter(gg, 0, Math.fround(0.4545454680919647), 0, 0, 0);
        InnerNode_vt10_Add(gg);                    // *(vt+0x10)  @0x100c0b
        InnerNode_vt18_Release(gg);                // *(vt+0x18)  @0x100c15
        // falls into shared post-pipeline @0x100c18
      }

      // Shared post-pipeline @0x100c18:
      // if (this->0x1a0 == 1) { *(mat vt+0x10) ; this->0x198 = mat ; jmp 0x100cd0 }
      if (this.outputIsRec709Gamma) {
        InnerNode_vt10_Add(mat);                   // *(vt+0x10)  @0x100c22/@0x100c29
        this.inner = mat;                          // @0x100c2c
        // jmp 0x100cd0
      } else {
        // else: HGColorGamma second pass  @0x100c38
        const cg2 = HGObject_operator_new(0x4a0);  // @0x100c38/@0x100c3d
        HGColorGamma_ctor(cg2);                    // @0x100c48
        InnerNode_vt78_SetInput(cg2, 0, mat);      // *(vt+0x78)  @0x100c59
        HGColorGamma_SetToneQualityMode(cg2, this.toneQualityMode); // @0x100c5c/@0x100c66
        HGColorGamma_SetConversion(cg2, 0, 1, 0, 0, 3, 8);  // (%r9d=8, %r8d=3, %ecx=0, %edx=1, %esi=0)  @0x100c6b..@0x100c8a
        HGColorGamma_SetToneQualityMode(cg2, 2);   // @0x100c8f..@0x100c97
        HGColorGamma_SetAntiSymmetricToneCurves(cg2, true); // @0x100c9c..@0x100ca4
        HGColorGamma_SetPremultiplyState(cg2, false, false); // @0x100ca9..@0x100cb0
        InnerNode_vt10_Add(cg2);                   // *(vt+0x10)  @0x100cbc
        this.inner = cg2;                          // @0x100cbf
        InnerNode_vt18_Release(cg2);               // *(vt+0x18)  @0x100ccd
      }
      // Shared teardown @0x100cd0:
      InnerNode_vt18_Release(mat);                 // *(vt+0x18)  @0x100cd7 (was %r12)
      InnerNode_vt18_Release(head);                // *(vt+0x18)  @0x100ce0/@0x100ce9 (was %r15/%rbx)
      // jmp 0x100dc9 - falls into final tail below
    } else {
      // method >= 2 branch  @0x100aee
      // jne 0x100dc9  -> method != 2 falls straight to the return  @0x100aee
      if ((this.conversionMethod >>> 0) === 2) {
        // method == 2
        const head = HGObject_operator_new(0x1c0);  // @0x100af4/@0x100af9
        HGNode_ctor_call(head);                     // @0x100b04
        // head->vtable = leaq @0x100b09/@0x100b10 - no-op.
        const leaf1 = HGObject_operator_new(0x1a0); // @0x100b13/@0x100b18
        HgcBT2100_HLG_OOTF_InverseOOTF_ctor(leaf1); // @0x100b23
        void leaf1;
        // head.inner = leaf1  @0x100b28
        // head->0x1a0 = <exp2-basis constants table pointer>  @0x100b2f/@0x100b36
        // head->0x1a8 = 1000.0 (f64 peak_nits)  @0x100b3d/@0x100b47
        // head->0x1b0 = movsd const @0x3d1170 (packs {0.2f, 0.05069702863693237f})  @0x100b4e/@0x100b56

        // call *(head->vt + 0x78)(head, 0, source)  // SetInput  @0x100b69
        InnerNode_vt78_SetInput(head, 0, source);

        // head->0x1b0 = 0.2f (movl 0x3e4ccccd)  @0x100b6c
        // head->0x1b4 = f32(50.69702849110048 / 1000.0) = 0.050697029f  @0x100b76..@0x100b8a
        const _peakScale_method_2 = Math.fround(50.69702849110048 / 1000.0);
        void _peakScale_method_2;

        // cmpb $1, 0x1a1(%r14) ; jne 0x100cf1   @0x100b92/@0x100b9a
        let tmo: object;
        if (this.minimumInputValueZero) {
          const clamp = HGObject_operator_new(0x1a0); // @0x100ba0/@0x100ba5
          HgcBT2446_Method_A_TMO_Input_Clamped_ctor(clamp); // @0x100bb0
          tmo = clamp;
          // jmp 0x100d06 - falls into the shared TMO block below
        } else {
          const t = HGObject_operator_new(0x1a0);      // @0x100cf1/@0x100cf6
          HgcBT2446_Method_A_TMO_ctor(t);              // @0x100d01
          tmo = t;
        }

        // call *(tmo->vt + 0x78)(tmo, 0, head)  // SetInput  @0x100d15
        InnerNode_vt78_SetInput(tmo, 0, head);

        // r15 = movzbl this->0x1a0  ; r13 = (r15 != 0) ? 1 : 8   @0x100d18..@0x100d2e
        //     movl $1, %eax ; movl $8, %r13d ; cmovnel %eax, %r13d
        //     -> r13 = 8 initially; if r15 != 0 (outputIsRec709Gamma), r13 becomes 1.
        const r13 = this.outputIsRec709Gamma ? 1 : 8;

        // cc = HGObject::operator new(0x370)  @0x100d32/@0x100d37
        const cc = HGObject_operator_new(0x370);
        HGColorConform_ctor(cc);                       // @0x100d42
        InnerNode_vt78_SetInput(cc, 0, tmo);           // *(vt+0x78)  @0x100d54
        HGColorConform_SetToneQualityMode(cc, this.toneQualityMode); // @0x100d57/@0x100d61

        // r8 = 3 * (r15 XOR 1)   ; xorl $1, %r15d ; leal (%r15,%r15,2), %r8d   @0x100d66/@0x100d6a
        // i.e. r8 = (outputIsRec709Gamma ? 0 : 3)
        const r8 = this.outputIsRec709Gamma ? 0 : 3;

        HGColorConform_SetConversion(
          cc,
          3,  // %esi = 3         @0x100d78
          1,  // %edx = 1         @0x100d7d
          3,  // %ecx = 3         @0x100d82
          0,  // (%rsp) = 0       @0x100d6e (pushed 4-byte)
          r8, // %r8d             @0x100d6a
          r13,// %r9d             @0x100d87
        );
        HGColorConform_SetPremultiplyState(cc, false, false); // @0x100d8f/@0x100d96

        InnerNode_vt10_Add(cc);                        // *(vt+0x10)  @0x100da2
        this.inner = cc;                               // @0x100da5
        InnerNode_vt18_Release(cc);                    // *(vt+0x18)  @0x100db3
        // release temporaries
        InnerNode_vt18_Release(tmo);                   // *(vt+0x18)  @0x100dbd
        InnerNode_vt18_Release(head);                  // *(vt+0x18)  @0x100dc6
      }
      // else: fall through - this->0x198 stays as-is (null on first call).
    }

    // Final tail @0x100dc9: return this->0x198
    return this.inner;
  }
}
