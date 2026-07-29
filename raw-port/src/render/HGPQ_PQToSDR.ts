// raw-port/src/render/HGPQ_PQToSDR.ts
//
// FCP `HGPQ::PQToSDR` — a nested facade class in Helium's `HGPQ` (Perceptual
// Quantizer / SMPTE ST 2084) namespace. It builds an HDR->SDR tone-mapping
// pipeline for PQ input:
//
//   source(PQ HDR) ->
//     HgcBT2100_PQ_OOTF_qtApprox (leaf1) ->
//     HgcBT2390_EETF_YRGB (leaf2; loaded with the ST 2084 encode/decode
//                          constants and per-instance tone-map coefficients
//                          computed once by SetPeakNits) ->
//     (dispatch on OutputMode +0x1a0)
//       OutputMode == 2:  return leaf2 directly (PQ output preserved)
//       OutputMode != 2:  HGColorMatrix (rec2020->rec709) ->
//                          HGColorClamp   (SetClampMinValues(0,0,0,0)) ->
//                          HGGamma        (SetParameter(0, 0.416666.., ..., 1.0))
//                          then OutputMode == 0: return HGGamma
//                               OutputMode == 1: HGColorGamma (SetConversion
//                                                (0,1,0,0,3,8) + Premultiply(false,false))
//                                                and return it
//
// This is the PQ sibling of `HGHLG::HLGToSDR` (see HGHLG_HLGToSDR.ts) and the
// downstream customer of `HGPQ::EOTF` (see HGPQ_EOTF.ts): both classes wrap
// the ST 2084 EOTF/InverseEOTF leaves and stash the same 5-constant f32
// {c1, c2, -c3, 1/m1, 1/m2} block in the same +0x1a8..+0x1e4 layout family.
//
// FRAMEWORK: Helium.framework (x86_64 slice; fat-slice offset 0x4000;
// the thin binary at /tmp/Helium.x86_64 has VA==file offset, so every
// RIP-relative constant address below is a direct file offset).
//
// SYMBOLS (Helium x86_64):
//   0x000fed40  HGPQ::PQToSDR::PQToSDR(HGPQ::PQToSDR::OutputMode)   [C2 base ctor]
//   0x000feff0  HGPQ::PQToSDR::PQToSDR(HGPQ::PQToSDR::OutputMode)   [C1 complete ctor - thunk to C2]
//   0x000feeb0  HGPQ::PQToSDR::SetPeakNits(double)                  [peak-nits math kernel]
//   0x000ff000  HGPQ::PQToSDR::~PQToSDR()                           [D2 base dtor]
//   0x000ff060  HGPQ::PQToSDR::~PQToSDR()                           [D1 complete dtor - identical body]
//   0x000ff0c0  HGPQ::PQToSDR::~PQToSDR()                           [D0 deleting dtor]
//   0x000ff130  HGPQ::PQToSDR::GetOutput(HGRenderer*)               [main graph-builder]
//
// DECODES (all under raw-port/re/disasm/):
//   Helium.HGPQ__PQToSDR.PQToSDR.C2.s   (@0xfed40)
//   Helium.HGPQ__PQToSDR.PQToSDR.C1.s   (@0xfeff0 - thunk `jmp C2`)
//   Helium.HGPQ__PQToSDR.SetPeakNits.s  (@0xfeeb0)
//   Helium.HGPQ__PQToSDR.PQToSDR.D2.s   (@0xff000)
//   Helium.HGPQ__PQToSDR.PQToSDR.D1.s   (@0xff060 - identical body to D2)
//   Helium.HGPQ__PQToSDR.PQToSDR.D0.s   (@0xff0c0 - D2 body + tail-jmp HGObject::operator delete)
//   Helium.HGPQ__PQToSDR.GetOutput.s    (@0xff130 - 315 lines)
//
// LAYOUT (inherits HGNode; HGNode header ends before +0x198):
//   +0x000  vtable ptr                                (installed @0xfed56 via
//                                                     `leaq 0x917d23(%rip), %rax`)
//   +0x198  void*    inner render-graph head          (nullptr in ctor @0xfed60;
//                                                     assigned in GetOutput @0xff2ff/
//                                                     @0xff436/@0xff453)
//   +0x1a0  uint32_t OutputMode                        (ctor: `movl %r14d, 0x1a0(%rbx)`
//                                                     @0xfed6b; read by GetOutput
//                                                     dispatch @0xff2ec/@0xff3ce)
//   +0x1a8  f64      peakNits                          (ctor 1000.0 @0xfee2a; SetPeakNits
//                                                     writes clamped(d,250,10000) @0xfeee6)
//   +0x1b0  f64      pqPeakNormalized                  (ctor 0.751827096247041 @0xfee2a;
//                                                     SetPeakNits writes _pow-chain @0xfefb6)
//   +0x1b8  f64      referenceWhiteNits = 203.0        (ctor movabsq $0x4069600000000000
//                                                     @0xfee12/@0xfee1c; SetPeakNits
//                                                     re-writes same @0xfeeb9/@0xfeec3)
//   +0x1c0  void*    subNode1 = HGNode wrapping HgcST2084_InverseEOTF (ctor @0xfedbe)
//   +0x1c8  void*    subNode2 = HGNode wrapping HgcST2084_EOTF        (ctor @0xfee0b)
//   +0x1d0..0x1df: 4xf32 tone-map anchor block           (ctor movaps @0x3d10e0 @0xfee38;
//                                                       SetPeakNits recomputes @0xfefc6)
//     +0x1d0 = tone_d0, +0x1d4 = tone_d1, +0x1d8 = tone_d2, +0x1dc = tone_d3
//   +0x1e0..0x1e7: 2xf32 tone-map anchor pair            (ctor movsd @0x3d10f0 @0xfee47;
//                                                       SetPeakNits recomputes @0xfefd5/@0xfefdd)
//     +0x1e0 = tone_e0, +0x1e4 = tone_e1
//
// OUTPUTMODE ENUM (from the two `cmpl` dispatches in GetOutput):
//   0x000ff2ec  cmpl $0x2, 0x1a0(%r15) ; jne 0xff30e     → mode==2 returns leaf2 directly
//   0x000ff3ce  cmpl $0x0, 0x1a0(%r15) ; je 0xff449      → mode==0 returns HGGamma tail
//                                                     → mode==1 wraps with HGColorGamma
//
// UNDECODED CALLEES / FRONTIER (each gets a throwing stub citing its @0xADDR):
//   HGNode::HGNode()                          @Helium 0xfed51 / 0xfed82 / 0xfedd5 / 0xff164
//   HGObject::operator new(size_t)            @Helium 0xfed77 / 0xfed96 / 0xfedca / 0xfede9 /
//                                              0xff159 / 0xff178 / 0xff1b0 / 0xff313 / 0xff34f /
//                                              0xff38c / 0xff3dd
//   HGObject::operator delete(void*)          @Helium 0xfee64 / 0xfee7e / 0xff11a
//   HgcST2084_InverseEOTF::HgcST2084_InverseEOTF()  @Helium 0xfeda1
//   HgcST2084_EOTF::HgcST2084_EOTF()          @Helium 0xfedf4
//   HgcBT2100_PQ_OOTF_qtApprox::HgcBT2100_PQ_OOTF_qtApprox()  @Helium 0xff183
//   HgcBT2390_EETF_YRGB::HgcBT2390_EETF_YRGB()@Helium 0xff1bb
//   HGColorMatrix::HGColorMatrix()            @Helium 0xff31e
//   HGColorMatrix::LoadMatrix(float vec4 const*, bool)  @Helium 0xff345
//   HGColorClamp::HGColorClamp()              @Helium 0xff35a
//   HGColorClamp::SetClampMinValues(float,float,float,float)  @Helium 0xff382
//   HGGamma::HGGamma()                        @Helium 0xff397
//   HGColorGamma::HGColorGamma()              @Helium 0xff3e8
//   HGColorGamma::SetConversion(...)          @Helium 0xff41b
//   HGColorGamma::SetPremultiplyState(bool,bool)  @Helium 0xff427
//   HGNode::~HGNode()                         @Helium 0xff052 / 0xff0b2 / 0xff10c
//   HGColorGamma::rec2020RGBToRec709RGB  (data symbol)  @Helium 0xff336
//   HGRenderer::GetInput(HGNode*, int)        @Helium 0xff14c
//   Inner-node vtable +0x10 (HGNode Add)      @Helium 0xff2fc / 0xff433 / 0xff450
//   Inner-node vtable +0x18 (Release/dtor)    @Helium 0xff022 / 0xff034 / 0xff046 /
//                                              0xff441 / 0xff461 / 0xff46b / 0xff472 /
//                                              0xff485 / 0xff48e
//   Inner-node vtable +0x60 (SetParameter)    @Helium 0xff20a / 0xff23c / 0xff260 /
//                                              0xff290 / 0xff2b4 / 0xff2e9 / 0xff3cb
//   Inner-node vtable +0x78 (SetInput)        @Helium 0xff1a8 / 0xff1cb / 0xff333 /
//                                              0xff370 / 0xff3a9 / 0xff3f9
//
// DECODED CONSTANTS (all resolved from Helium.x86_64; VA==file offset):
//
//   ctor @0xfed40:
//     @0xfedad  movsd  @0x3d10c0  = 2xf32 {9.051984786987305f, 8.973207473754883f}
//               (stored subNode1->+0x1a0..+0x1a7 @0xfedb5)
//     @0xfee00  movl   $0x42c80000, 0x1a0(%r15) = f32 100.0f (subNode2->+0x1a0)
//     @0xfee12  movabsq $0x4069600000000000     = f64 203.0 (self->+0x1b8 @0xfee1c)
//     @0xfee23  movaps @0x3d10d0             = 2xf64 {1000.0, 0.751827096247041}
//               (stored self->+0x1a8..+0x1b7 @0xfee2a)
//     @0xfee31  movaps @0x3d10e0             = 4xf32 {0.6585553884506226f,
//                                                     2.9287326335906982f,
//                                                     0.11381487548351288f,
//                                                    -0.34144464135169983f}
//               (stored self->+0x1d0..+0x1df @0xfee38)
//     @0xfee3f  movsd  @0x3d10f0             = 2xf32 {0.34144464135169983f,
//                                                     0.6585553884506226f}
//               (stored self->+0x1e0..+0x1e7 @0xfee47)
//
//   SetPeakNits @0xfeeb0 (f64 unless tagged):
//     @0xfeeb9  movabsq $0x4069600000000000   = 203.0 (rewrite self->+0x1b8)
//     @0xfeeca  movsd  @0x3d0d90              = 250.0     (lower clamp)
//     @0xfeed6  movsd  @0x3d0d20              = 10000.0   (upper clamp / PQ peak)
//     @0xfeefc  movsd  @0x3d0d30              = 0.1593017578125  (=m1 = 2610/16384)
//     @0xfef0d  mulpd  @0x3d1080              = 2xf64 {c2=18.8515625, c3=18.6875}
//     @0xfef15  addpd  @0x3d1090              = 2xf64 {c1=0.8359375, 1.0}
//     @0xfef29  movsd  @0x3d0d38              = 78.84375  (=m2 = 2523/4096 * 128)
//     @0xfef38  movsd  @0x3d0d28              = 7.309559025783966e-07 (fallback for ratio<=0)
//     @0xfef40  movsd  @0x3d0d98              = 0.5806888810416109 (PQ-encode of 203/1000)
//     @0xfef4c  movsd  @0x3d0da0              = 1.5
//     @0xfef58  addsd  @0x3ccd68              = -0.5
//     @0xfef60  movsd  @0x3ca260              = 1.0
//     @0xfef6c  movapd @0x3d1100              = 2xf64 {0.0, -2.0}
//     @0xfef94  mulpd  @0x3d1110              = 2xf64 {0.0, 3.0}
//
//   GetOutput @0xff130 (f32 unless tagged):
//     @0xff18f  movaps @0x3d1120  = 4xf32 {1.0989999771118164f, -0.0989999994635582f,
//                                          4.5f, 1.0f}  (stored leaf1->+0x1a0 @0xff196)
//     @0xff1e4  movsd  @0x3cd278  = f64 100.0
//     @0xff242  movss  @0x3d0f64  = f32 0.1593017578125f (=m1)
//     @0xff24a  movss  @0x3d0f68  = f32 78.84375f        (=m2)
//     @0xff27d  movss  @0x3d0f58  = f32 0.8359375f       (=c1)
//     @0xff296  movss  @0x3d0f50  = f32 6.277394771575928f    (=1/m1)
//     @0xff29e  movss  @0x3d0f54  = f32 0.012683313339948654f (=1/m2)
//     @0xff2c9  movss  @0x3d0f58  = f32 0.8359375f       (=c1, second load)
//     @0xff2d1  movss  @0x3d0f5c  = f32 18.8515625f      (=c2)
//     @0xff2d9  movss  @0x3d0f60  = f32 -18.6875f        (=-c3)
//     @0xff3b0  movss  @0x3ca2b4  = f32 0.4166666567325592f  (=5/12 SDR gamma factor)
//     @0xff3b8  movss  @0x3c7cc0  = f32 1.0f
//
//   Canonical BT.2100/ST 2084 PQ constants (BT.2100 Table 4):
//     m1 = 2610/16384        = 0.1593017578125            ; 1/m1 ≈ 6.277394...
//     m2 = 2523/4096 * 128   = 78.84375                   ; 1/m2 ≈ 0.012683...
//     c1 = 3424/4096         = 0.8359375
//     c2 = 2413/4096 * 32    = 18.8515625
//     c3 = 2392/4096 * 32    = 18.6875
//   PQ EOTF: L = 10000 * ( max(x^(1/m2) - c1, 0) / (c2 - c3 * x^(1/m2)) )^(1/m1)

/* ------------------------------------------------------------------ */
/* Opaque frontier types — resolved by companion ports.                */
/* ------------------------------------------------------------------ */

export interface HGRenderer {}
export interface HGNodeLike {}

/**
 * `HGPQ::PQToSDR::OutputMode` — enum class parameter selecting the SDR
 * output topology. Modelled as numeric; symbolic names not in demangler.
 *   0 = HGGamma SDR             (rec2020->rec709 + gamma tail)
 *   1 = HGColorGamma SDR wrap   (as 0 + wrapping HGColorGamma pass)
 *   2 = passthrough             (return leaf2; keep PQ-domain output)
 */
export type HGPQ_PQToSDR_OutputMode = number;

/* ------------------------------------------------------------------ */
/* Undecoded-frontier stubs (each throws with its @0xADDR).            */
/* ------------------------------------------------------------------ */

function HGNode_ctor_call(_self: object): void { // @Helium 0xfed51 / 0xfed82 / 0xfedd5 / 0xff164
  throw new Error(
    "HGNode::HGNode() not yet transcribed (@Helium 0xfed51 / 0xfed82 / 0xfedd5 / 0xff164 — HGPQ::PQToSDR C2 + subNode1/subNode2/head base-calls)",
  );
}

function HGNode_dtor_call(_self: object): void { // @Helium 0xff052 / 0xff0b2 / 0xff10c
  throw new Error(
    "HGNode::~HGNode() not yet transcribed (@Helium 0xff052 / 0xff0b2 / 0xff10c — HGPQ::PQToSDR D2/D1 tail-jmp + D0 base-call)",
  );
}

function HGObject_operator_new(_bytes: number): object { // @Helium 0xfed77 / 0xfed96 / 0xfedca / 0xfede9 / 0xff159 / 0xff178 / 0xff1b0 / 0xff313 / 0xff34f / 0xff38c / 0xff3dd
  throw new Error(
    "HGObject::operator new(unsigned long) not yet transcribed (@Helium 0xfed77 — HGPQ::PQToSDR ctor + GetOutput node allocation; sizes 0x1a0/0x1b0/0x1c0/0x1f0/0x4a0)",
  );
}

function HGObject_operator_delete(_p: object): void { // @Helium 0xfee64 / 0xfee7e / 0xff11a
  throw new Error(
    "HGObject::operator delete(void*) not yet transcribed (@Helium 0xfee64 / 0xfee7e / 0xff11a — HGPQ::PQToSDR ctor unwind / D0 tail-jmp)",
  );
}

function HgcST2084_InverseEOTF_ctor(_p: object): void { // @Helium 0xfeda1
  throw new Error(
    "HgcST2084_InverseEOTF::HgcST2084_InverseEOTF() not yet transcribed (@Helium 0xfeda1 — HGPQ::PQToSDR subNode1 leaf)",
  );
}

function HgcST2084_EOTF_ctor(_p: object): void { // @Helium 0xfedf4
  throw new Error(
    "HgcST2084_EOTF::HgcST2084_EOTF() not yet transcribed (@Helium 0xfedf4 — HGPQ::PQToSDR subNode2 leaf)",
  );
}

function HgcBT2100_PQ_OOTF_qtApprox_ctor(_p: object): void { // @Helium 0xff183
  throw new Error(
    "HgcBT2100_PQ_OOTF_qtApprox::HgcBT2100_PQ_OOTF_qtApprox() not yet transcribed (@Helium 0xff183 — HGPQ::PQToSDR GetOutput leaf1 (PQ OOTF quintic approximation))",
  );
}

function HgcBT2390_EETF_YRGB_ctor(_p: object): void { // @Helium 0xff1bb
  throw new Error(
    "HgcBT2390_EETF_YRGB::HgcBT2390_EETF_YRGB() not yet transcribed (@Helium 0xff1bb — HGPQ::PQToSDR GetOutput leaf2 (BT.2390 EETF tone map))",
  );
}

function HGColorMatrix_ctor(_p: object): void { // @Helium 0xff31e
  throw new Error(
    "HGColorMatrix::HGColorMatrix() not yet transcribed (@Helium 0xff31e — HGPQ::PQToSDR GetOutput OutputMode!=2 rec2020->rec709 stage)",
  );
}

function HGColorMatrix_LoadMatrix(
  _p: object,
  _matrix: object, // @Helium 0xff336 leaq HGColorGamma::rec2020RGBToRec709RGB(%rip)
  _flag: boolean,  // %edx = 1
): void { // @Helium 0xff345
  throw new Error(
    "HGColorMatrix::LoadMatrix(float vector[4] const*, bool) not yet transcribed (@Helium 0xff345 — HGPQ::PQToSDR GetOutput OutputMode!=2 rec2020->rec709 load)",
  );
}

function HGColorGamma_rec2020RGBToRec709RGB_ref(): object { // @Helium 0xff336
  throw new Error(
    "HGColorGamma::rec2020RGBToRec709RGB (data symbol) not yet transcribed (@Helium 0xff336 — HGPQ::PQToSDR rec2020->rec709 matrix table)",
  );
}

function HGColorClamp_ctor(_p: object): void { // @Helium 0xff35a
  throw new Error(
    "HGColorClamp::HGColorClamp() not yet transcribed (@Helium 0xff35a — HGPQ::PQToSDR GetOutput OutputMode!=2 clamp stage)",
  );
}

function HGColorClamp_SetClampMinValues(
  _p: object, _r: number, _g: number, _b: number, _a: number,
): void { // @Helium 0xff382
  throw new Error(
    "HGColorClamp::SetClampMinValues(float, float, float, float) not yet transcribed (@Helium 0xff382 — HGPQ::PQToSDR GetOutput clamp-min = (0,0,0,0))",
  );
}

function HGGamma_ctor(_p: object): void { // @Helium 0xff397
  throw new Error(
    "HGGamma::HGGamma() not yet transcribed (@Helium 0xff397 — HGPQ::PQToSDR GetOutput OutputMode!=2 SDR gamma stage)",
  );
}

function HGColorGamma_ctor(_p: object): void { // @Helium 0xff3e8
  throw new Error(
    "HGColorGamma::HGColorGamma() not yet transcribed (@Helium 0xff3e8 — HGPQ::PQToSDR GetOutput OutputMode==1 wrapping HGColorGamma stage)",
  );
}

function HGColorGamma_SetConversion(
  _p: object,
  _srcPrim: number, _srcTF: number, _srcMC: number,
  _dstPrim: number, _dstTF: number, _dstMC: number,
): void { // @Helium 0xff41b
  throw new Error(
    "HGColorGamma::SetConversion(...) not yet transcribed (@Helium 0xff41b — HGPQ::PQToSDR GetOutput OutputMode==1 SetConversion(0,1,0,0,3,8))",
  );
}

function HGColorGamma_SetPremultiplyState(_p: object, _in: boolean, _out: boolean): void { // @Helium 0xff427
  throw new Error(
    "HGColorGamma::SetPremultiplyState(bool, bool) not yet transcribed (@Helium 0xff427 — HGPQ::PQToSDR GetOutput OutputMode==1 SetPremultiplyState(false, false))",
  );
}

function HGRenderer_GetInput(_r: HGRenderer, _n: HGNodeLike, _idx: number): HGNodeLike { // @Helium 0xff14c
  throw new Error(
    "HGRenderer::GetInput(HGNode*, int) not yet transcribed (@Helium 0xff14c — HGPQ::PQToSDR::GetOutput source-input fetch)",
  );
}

function InnerNode_vt10_Add(_inner: object): void { // @Helium 0xff2fc / 0xff433 / 0xff450
  throw new Error(
    "inner-node vtable +0x10 (HGNode Add) not yet transcribed (@Helium 0xff2fc / 0xff433 / 0xff450 — HGPQ::PQToSDR node graph attachment)",
  );
}

function InnerNode_vt18_Release(_inner: object): void { // @Helium 0xff022 / 0xff034 / 0xff046 / 0xff441 / 0xff461 / 0xff46b / 0xff472 / 0xff485 / 0xff48e
  throw new Error(
    "inner-node vtable +0x18 (HGNode Release/dtor) not yet transcribed (@Helium 0xff022 / 0xff034 / 0xff046 — HGPQ::PQToSDR D2/D1/D0 sub-node teardown; also 0xff441/0xff461/0xff46b/0xff472/0xff485/0xff48e from GetOutput)",
  );
}

function InnerNode_vt60_SetParameter(
  _inner: object, _slot: number, _x: number, _y: number, _z: number, _w: number,
): void { // @Helium 0xff20a / 0xff23c / 0xff260 / 0xff290 / 0xff2b4 / 0xff2e9 / 0xff3cb
  throw new Error(
    "inner-node vtable +0x60 (HGNode SetParameter) not yet transcribed (@Helium 0xff20a / 0xff23c / 0xff260 / 0xff290 / 0xff2b4 / 0xff2e9 / 0xff3cb — HGPQ::PQToSDR leaf2 EETF param upload + HGGamma exponent upload)",
  );
}

function InnerNode_vt78_SetInput(
  _inner: object, _slot: number, _source: HGNodeLike,
): void { // @Helium 0xff1a8 / 0xff1cb / 0xff333 / 0xff370 / 0xff3a9 / 0xff3f9
  throw new Error(
    "inner-node vtable +0x78 (HGNode SetInput) not yet transcribed (@Helium 0xff1a8 / 0xff1cb / 0xff333 / 0xff370 / 0xff3a9 / 0xff3f9 — HGPQ::PQToSDR pipeline input wiring)",
  );
}

/* ------------------------------------------------------------------ */
/* HGPQ::PQToSDR                                                       */
/* ------------------------------------------------------------------ */

/**
 * `HGPQ::PQToSDR` — BT.2100 PQ (ST 2084) HDR->SDR tone-mapping facade.
 *
 * Nested inside the `HGPQ` namespace in FCP; we expose it as a plain TS
 * class named `HGPQ_PQToSDR` (the file name uses the `::` -> `_`
 * convention). See file header for full symbol table.
 */
export class HGPQ_PQToSDR {
  /** +0x198 — the head render node exposed by GetOutput. */
  public inner: object | null;

  /** +0x1a0 — uint32 OutputMode. */
  public outputMode: HGPQ_PQToSDR_OutputMode;

  /** +0x1a8 — f64 peakNits (SetPeakNits clamps to [250, 10000]). */
  public peakNits: number;

  /** +0x1b0 — f64 PQ-encoded normalised peak (computed by SetPeakNits). */
  public pqPeakNormalized: number;

  /** +0x1b8 — f64 reference-white nits (fixed 203.0). */
  public referenceWhiteNits: number;

  /** +0x1c0 — HGNode wrapper around HgcST2084_InverseEOTF. */
  public subNode1: object | null;

  /** +0x1c8 — HGNode wrapper around HgcST2084_EOTF. */
  public subNode2: object | null;

  /** +0x1d0..+0x1dc — 4xf32 BT.2390 EETF tone-map anchor block. */
  public tone_d0: number;
  public tone_d1: number;
  public tone_d2: number;
  public tone_d3: number;

  /** +0x1e0/+0x1e4 — 2xf32 BT.2390 EETF tail anchors. */
  public tone_e0: number;
  public tone_e1: number;

  /* ---------------- ctor: HGPQ::PQToSDR(OutputMode) ---------------- */

  /**
   * HGPQ::PQToSDR::PQToSDR(OutputMode mode)
   *   — Helium @0xfed40 (C2). C1 @0xfeff0 is a thunk `jmp C2`.
   *
   * Transcription of C2:
   *   HGNode::HGNode(this);                                     @0xfed51
   *   this->vtable = &_ZTVN4HGPQ7PQToSDRE (leaq @0xfed56)       @0xfed5d
   *   this->0x198 = nullptr;                                    @0xfed60
   *   this->0x1a0 = mode;                                       @0xfed6b
   *
   *   // subNode1 (HgcST2084_InverseEOTF wrapper):
   *   sub1 = HGObject::operator new(0x1b0);                     @0xfed72/@0xfed77
   *   HGNode::HGNode(sub1);                                     @0xfed82
   *   sub1->vtable = <InverseEOTF-wrapper> (leaq @0xfed87)      @0xfed8e
   *   leaf1 = HGObject::operator new(0x1a0);                    @0xfed91/@0xfed96
   *   HgcST2084_InverseEOTF::HgcST2084_InverseEOTF(leaf1);      @0xfeda1
   *   sub1->0x198 = leaf1;                                      @0xfeda6
   *   sub1->0x1a0 = *(2xf32 @0x3d10c0)                          @0xfedad/@0xfedb5
   *              = {9.051984786987305f, 8.973207473754883f}
   *   this->0x1c0 = sub1;                                       @0xfedbe
   *
   *   // subNode2 (HgcST2084_EOTF wrapper):
   *   sub2 = HGObject::operator new(0x1b0);                     @0xfedc5/@0xfedca
   *   HGNode::HGNode(sub2);                                     @0xfedd5
   *   sub2->vtable = <EOTF-wrapper> (leaq @0xfedda)             @0xfede1
   *   leaf2 = HGObject::operator new(0x1a0);                    @0xfede4/@0xfede9
   *   HgcST2084_EOTF::HgcST2084_EOTF(leaf2);                    @0xfedf4
   *   sub2->0x198 = leaf2;                                      @0xfedf9
   *   sub2->0x1a0 = f32(100.0f) (movl $0x42c80000);             @0xfee00
   *   this->0x1c8 = sub2;                                       @0xfee0b
   *
   *   this->0x1b8 = f64(203.0) (movabsq $0x4069600000000000);   @0xfee12/@0xfee1c
   *   this->0x1a8..0x1b7 = *(16 bytes @0x3d10d0)                @0xfee23/@0xfee2a
   *     = {1000.0 (f64) @+0x1a8, 0.751827096247041 (f64) @+0x1b0}
   *   this->0x1d0..0x1df = *(16 bytes @0x3d10e0)                @0xfee31/@0xfee38
   *     = 4xf32 {0.6585553884506226, 2.9287326335906982,
   *              0.11381487548351288, -0.34144464135169983}
   *   this->0x1e0..0x1e7 = *(8 bytes @0x3d10f0)                 @0xfee3f/@0xfee47
   *     = 2xf32 {0.34144464135169983, 0.6585553884506226}
   */
  public constructor(mode: HGPQ_PQToSDR_OutputMode) { // @Helium 0xfed40 (C2)
    HGNode_ctor_call(this);
    // vtable install @0xfed56 — no-op in TS.
    this.inner = null;                       // +0x198 = 0          @0xfed60
    this.outputMode = mode | 0;              // +0x1a0 = mode       @0xfed6b

    // subNode1 = new HGNode wrapper around HgcST2084_InverseEOTF
    const sub1 = HGObject_operator_new(0x1b0); // @0xfed72/@0xfed77
    HGNode_ctor_call(sub1);                    // @0xfed82
    const leaf1 = HGObject_operator_new(0x1a0); // @0xfed91/@0xfed96
    HgcST2084_InverseEOTF_ctor(leaf1);          // @0xfeda1
    // sub1->0x198 = leaf1                     @0xfeda6 (opaque frontier)
    // sub1->0x1a0..0x1a7 = movsd @0x3d10c0 = 2xf32 {9.051985f, 8.973207f} @0xfedb5
    void leaf1;
    this.subNode1 = sub1;                      // this->0x1c0 = sub1  @0xfedbe

    // subNode2 = new HGNode wrapper around HgcST2084_EOTF
    const sub2 = HGObject_operator_new(0x1b0); // @0xfedc5/@0xfedca
    HGNode_ctor_call(sub2);                    // @0xfedd5
    const leaf2 = HGObject_operator_new(0x1a0); // @0xfede4/@0xfede9
    HgcST2084_EOTF_ctor(leaf2);                 // @0xfedf4
    // sub2->0x198 = leaf2                     @0xfedf9 (opaque frontier)
    // sub2->0x1a0 = f32(100.0f) (movl $0x42c80000)  @0xfee00
    void leaf2;
    this.subNode2 = sub2;                      // this->0x1c8 = sub2  @0xfee0b

    // Fill self's f64/f32 tone-map cache from the static const tables:
    this.referenceWhiteNits = 203.0;           // f64 @+0x1b8         @0xfee12/@0xfee1c
    // 16-byte movaps @0x3d10d0 -> +0x1a8..+0x1b7 (2xf64):
    this.peakNits = 1000.0;                    // f64 @+0x1a8         @0xfee2a
    this.pqPeakNormalized = 0.751827096247041; // f64 @+0x1b0         @0xfee2a
    // 16-byte movaps @0x3d10e0 -> +0x1d0..+0x1df (4xf32):
    this.tone_d0 = Math.fround(0.6585553884506226);   // f32 @+0x1d0  @0xfee38
    this.tone_d1 = Math.fround(2.9287326335906982);   // f32 @+0x1d4  @0xfee38
    this.tone_d2 = Math.fround(0.11381487548351288);  // f32 @+0x1d8  @0xfee38
    this.tone_d3 = Math.fround(-0.34144464135169983); // f32 @+0x1dc  @0xfee38
    // 8-byte movsd @0x3d10f0 -> +0x1e0..+0x1e7 (2xf32):
    this.tone_e0 = Math.fround(0.34144464135169983);  // f32 @+0x1e0  @0xfee47
    this.tone_e1 = Math.fround(0.6585553884506226);   // f32 @+0x1e4  @0xfee47
  }

  /* ---------------- SetPeakNits ------------------------------------ */

  /**
   * HGPQ::PQToSDR::SetPeakNits(double d) — Helium @0xfeeb0.
   *
   * Sets the HDR peak luminance in nits and pre-computes the BT.2390
   * EETF's per-instance tone-map coefficients. All arithmetic is f64
   * up to the final cvtsd2ss/cvtpd2ps to f32 stores.
   *
   * Transcription (verbatim; every constant cited in file header):
   *
   *   this->0x1b8 = f64(203.0);                                  @0xfeeb9/@0xfeec3
   *   x     = max(d, 250.0)          @0x3d0d90                   @0xfeeca/@0xfeed2
   *   xmm0  = min(x, 10000.0)        @0x3d0d20                   @0xfeed6/@0xfeee2
   *   this->0x1a8 = xmm0;                                        @0xfeee6
   *   ratio = xmm0 / 10000.0;                                    @0xfeeee
   *   if (ratio > 0) {   // ordered ucomisd/jae                   @0xfeef2..@0xfeefa
   *     P    = pow(ratio, m1=0.1593017578125 @0x3d0d30)          @0xfeefc/@0xfef04
   *     // xmm0 = movddup(P) → both lanes = P                    @0xfef09
   *     // xmm0 = xmm0 * 2xf64{c2=18.8515625, c3=18.6875} @0x3d1080  @0xfef0d
   *     //      = {P*c2, P*c3}
   *     // xmm0 = xmm0 + 2xf64{c1=0.8359375, 1.0} @0x3d1090      @0xfef15
   *     //      = {c1 + P*c2, 1.0 + P*c3}
   *     // xmm1 = xmm0 ; xmm1 = unpckhpd(xmm1, xmm0) → hi lane   @0xfef1d/@0xfef21
   *     // xmm0 = xmm0 / xmm1                                    @0xfef25
   *     //      = (c1 + P*c2) / (1.0 + P*c3)  (call it Q)
   *     Q    = (0.8359375 + P*18.8515625) / (1.0 + P*18.6875);
   *     xmm0 = pow(Q, m2=78.84375 @0x3d0d38);                    @0xfef29/@0xfef31
   *   } else {
   *     xmm0 = 7.309559025783966e-07 @0x3d0d28;                  @0xfef38 (fallback)
   *   }
   *   pqPeak = xmm0;
   *
   *   s = 0.5806888810416109 @0x3d0d98 / pqPeak;                 @0xfef40/@0xfef48
   *   k = 1.5 @0x3d0da0 * s + (-0.5) @0x3ccd68;                  @0xfef4c..@0xfef58
   *   // xmm3 = 1.0 @0x3ca260 (scalar load into xmm3.low)         @0xfef60
   *
   *   // Assemble two lanes for the Hermite pair (128-bit vector ops):
   *   xmm4 = broadcast(k);                                        @0xfef68
   *   xmm5 = 2xf64{0.0, -2.0} @0x3d1100 - broadcast(k)
   *        = {-k, -2 - k};                                        @0xfef6c/@0xfef74
   *   xmm4' = broadcast(s);                                       @0xfef78
   *   twoS = 2.0 * s;                                             @0xfef7c
   *   // xmm6 = xmm1 (low = k) + xmm3(1.0,1.0) - {twoS, 0.0}
   *   //      = { k+1.0-twoS, ? }                                  @0xfef80..@0xfef88
   *   //   (xmm2 = {twoS, 0.0} because xmm2 low was 2s and xmm2 high
   *   //    was zeroed by the earlier scalar movsd @0xfef40)
   *   xmm6_lo = k + 1.0 - twoS;
   *
   *   // xmm2 = movapd xmm3(1,1); xmm2 = subsd xmm1 → xmm2.lo = 1-k @0xfef8c/@0xfef90
   *   oneMinusK = 1.0 - k;
   *   // xmm4 = xmm4 * 2xf64{0.0, 3.0} @0x3d1110
   *   //      = {s*0, s*3} = {0.0, 3*s}                            @0xfef94
   *   // xmm3 = 1.0 / (1.0 - k)  (divsd xmm2, xmm3)                 @0xfef9c
   *   invOneMinusK = 1.0 / oneMinusK;
   *   // xmm4 = xmm5 + xmm4 = {-k+0, -2-k+3s} = {-k, 3s-2-k}        @0xfefa0
   *   xmm4_hi = 3.0 * s - 2.0 - k;
   *
   *   // xmm4 = blendpd $0x1 (xmm4, xmm6) → {xmm6.lo, xmm4.hi}
   *   //      = { k+1-2s, 3s-2-k }                                  @0xfefa4
   *   // xmm1 = unpcklpd(xmm1(=k), xmm3(=1/(1-k))) = {k, 1/(1-k)}   @0xfefaa
   *   // xmm3 = cvtpd2ps(xmm4_blend) → 2xf32 {f32(k+1-2s), f32(3s-2-k)} @0xfefae
   *   // xmm1 = cvtpd2ps(xmm1)      → 2xf32 {f32(k),      f32(1/(1-k))} @0xfefb2
   *
   *   // Stores:
   *   this->0x1b0 = pqPeak (f64);                                  @0xfefb6
   *   // xmm0 = unpcklpd(xmm1_2xf32, xmm3_2xf32) as 4xf32:
   *   //   {xmm1[0], xmm1[1], xmm3[0], xmm3[1]}
   *   //   = { f32(k), f32(1/(1-k)), f32(k+1-2s), f32(3s-2-k) }
   *   this->0x1d0..0x1df = xmm0 (movapd 16 bytes);                 @0xfefc6
   *   // this->0x1e0 = f32(oneMinusK) (cvtsd2ss xmm2 → xmm0);      @0xfefd1/@0xfefd5
   *   // this->0x1e4 = xmm1.low_f32 = f32(k);                       @0xfefdd
   */
  public SetPeakNits(d: number): void { // @Helium 0xfeeb0
    // this->0x1b8 = 203.0                                          @0xfeeb9/@0xfeec3
    this.referenceWhiteNits = 203.0;

    // xmm0 = min(10000.0, max(d, 250.0))                            @0xfeeca/@0xfeed2/@0xfeed6/@0xfeee2
    const clamped = Math.min(10000.0, Math.max(d, 250.0));
    // this->0x1a8 = clamped                                         @0xfeee6
    this.peakNits = clamped;
    // ratio = clamped / 10000.0                                     @0xfeeee
    const ratio = clamped / 10000.0;

    // ucomisd xmm0, xmm1(=0) ; jae 0xfef38  → take else when 0 >= ratio
    // (preserve NaN-ordered semantics: NaN never satisfies 0 >= ratio,
    //  so NaN falls into the pow path, matching ucomisd/jae behavior)
    let pqPeak: number;
    if (!(0.0 >= ratio)) {
      // pow(ratio, m1)  where m1 = 0.1593017578125 @0x3d0d30       @0xfeefc/@0xfef04
      const P = Math.pow(ratio, 0.1593017578125);
      // Q = (c1 + P*c2) / (1.0 + P*c3);  c1/c2/c3 from @0x3d1080/@0x3d1090
      const Q = (0.8359375 + P * 18.8515625) / (1.0 + P * 18.6875);
      // pow(Q, m2)  where m2 = 78.84375 @0x3d0d38                   @0xfef29/@0xfef31
      pqPeak = Math.pow(Q, 78.84375);
    } else {
      // fallback constant @0x3d0d28                                 @0xfef38
      pqPeak = 7.309559025783966e-07;
    }

    // s = 0.5806888810416109 @0x3d0d98 / pqPeak                     @0xfef40/@0xfef48
    const s = 0.5806888810416109 / pqPeak;
    // k = 1.5 @0x3d0da0 * s + (-0.5) @0x3ccd68                       @0xfef4c/@0xfef54/@0xfef58
    const k = 1.5 * s + (-0.5);
    // 1.0 constant loaded @0x3ca260                                  @0xfef60
    // (Used as broadcast 1.0 lane throughout; explicit `1.0` in TS.)

    // Compute Hermite anchors (see method-body doc for lane analysis):
    const twoS      = 2.0 * s;
    const xmm6_lo   = k + 1.0 - twoS;    // f64 = k + 1 - 2s
    const oneMinusK = 1.0 - k;           // f64
    // xmm4 = 3*s (high lane) then blended:                           @0xfef94/@0xfefa0/@0xfefa4
    const xmm4_hi   = 3.0 * s - 2.0 - k; // f64 = 3s - 2 - k
    const invOneMinusK = 1.0 / oneMinusK; // f64 = 1 / (1 - k)         @0xfef9c

    // cvtpd2ps of the blended {xmm6_lo, xmm4_hi} → 2xf32              @0xfefae
    const cvt_A_lo = Math.fround(xmm6_lo);   // f32(k + 1 - 2s)
    const cvt_A_hi = Math.fround(xmm4_hi);   // f32(3s - 2 - k)
    // cvtpd2ps of the packed {k, 1/(1-k)} → 2xf32                     @0xfefb2
    const cvt_B_lo = Math.fround(k);            // f32(k)
    const cvt_B_hi = Math.fround(invOneMinusK); // f32(1/(1-k))

    // this->0x1b0 = pqPeak (f64)                                     @0xfefb6
    this.pqPeakNormalized = pqPeak;

    // unpcklpd of the two 2xf32 pairs → 4xf32 in order
    //   {cvt_B_lo, cvt_B_hi, cvt_A_lo, cvt_A_hi}
    // this->0x1d0..0x1df = that (movapd 16 bytes)                     @0xfefc6
    this.tone_d0 = cvt_B_lo; // +0x1d0 = f32(k)
    this.tone_d1 = cvt_B_hi; // +0x1d4 = f32(1/(1-k))
    this.tone_d2 = cvt_A_lo; // +0x1d8 = f32(k+1-2s)
    this.tone_d3 = cvt_A_hi; // +0x1dc = f32(3s-2-k)

    // this->0x1e0 = f32(oneMinusK)  (cvtsd2ss xmm2 into xmm0)         @0xfefd1/@0xfefd5
    this.tone_e0 = Math.fround(oneMinusK);
    // this->0x1e4 = xmm1.low_f32 = f32(k)  (the low f32 of the 2xf32
    //   result of cvtpd2ps @0xfefb2)                                  @0xfefdd
    this.tone_e1 = cvt_B_lo;
  }

  /* ---------------- dtor: HGPQ::PQToSDR::~PQToSDR ------------------ */

  /**
   * HGPQ::PQToSDR::~PQToSDR() — Helium @0xff000 (D2), @0xff060 (D1),
   * @0xff0c0 (D0 deleting). D2 body:
   *   this->vtable = &_ZTVN4HGPQ7PQToSDRE (leaq @0xff009)
   *   if (this->0x198) call *(vt+0x18)(inner)                      @0xff013..@0xff022
   *   if (this->0x1c0) call *(vt+0x18)(subNode1)                   @0xff025..@0xff034
   *   if (this->0x1c8) call *(vt+0x18)(subNode2)                   @0xff037..@0xff046
   *   tail-jmp HGNode::~HGNode(this)                               @0xff052
   * D0 adds HGNode::~HGNode(this) @0xff10c and `tail-jmp HGObject::operator delete`
   *   @0xff11a.
   */
  public destroy(): void { // @Helium 0xff0c0 (D0)
    // vtable-install @0xff009 — no-op.
    if (this.inner !== null) {                     // testq %rdi, %rdi ; je   @0xff01a/@0xff01d
      InnerNode_vt18_Release(this.inner);           // call *0x18(%rax)       @0xff022
    }
    if (this.subNode1 !== null) {                   //                        @0xff02c/@0xff02f
      InnerNode_vt18_Release(this.subNode1);        //                        @0xff034
    }
    if (this.subNode2 !== null) {                   //                        @0xff03e/@0xff041
      InnerNode_vt18_Release(this.subNode2);        //                        @0xff046
    }
    HGNode_dtor_call(this);                         // HGNode::~HGNode        @0xff10c (D0)
    HGObject_operator_delete(this);                 // tail-jmp               @0xff11a
  }

  /* ---------------- GetOutput: the graph builder ------------------- */

  /**
   * HGPQ::PQToSDR::GetOutput(HGRenderer* r) — Helium @0xff130.
   *
   * The graph-builder. Every leaf ctor / vtable call is a throw-stub.
   * See the file-header ADDR->constant table for every literal below.
   *
   * Transcription:
   *
   *   source = HGRenderer::GetInput(r, this, 0)                     @0xff14c
   *
   *   head = new HGNode wrapper (size 0x1b0)                        @0xff154/@0xff159
   *   HGNode::HGNode(head)                                          @0xff164
   *   head->vtable = leaq @0xff169 - no-op
   *
   *   leaf1 = new HgcBT2100_PQ_OOTF_qtApprox (size 0x1a0)           @0xff173/@0xff178
   *                                                                 @0xff183 ctor
   *   head->0x198 = leaf1                                            @0xff188
   *   head->0x1a0..0x1af = *(4xf32 @0x3d1120)                        @0xff196
   *     = {1.0989999771118164, -0.0989999994635582, 4.5, 1.0}
   *   head->vt[0x78](head, 0, source)                                @0xff1a8
   *
   *   leaf2 = new HgcBT2390_EETF_YRGB (size 0x1a0)                   @0xff1ab..@0xff1bb
   *   leaf2->vt[0x78](leaf2, 0, head)                                @0xff1cb
   *
   *   // SetParameter #0 (@0xff20a):
   *   //   xmm2 = cvtsd2ss(this->0x1b0 as f64) = f32(pqPeakNormalized)  @0xff1ce/@0xff1d7
   *   //   xmm0 = this->0x1d0 as f32 (tone_d0)                          @0xff1db
   *   //   xmm3 = 100.0 @0x3cd278 / this->0x1b8 (=203.0)  → f64 then cvtsd2ss  @0xff1e4/@0xff1ec/@0xff1fe
   *   //   xmm1 = this->0x1d4 as f32 (tone_d1)                          @0xff1f5
   *   //   leaf2->vt[0x60](leaf2, 0, xmm0=tone_d0, xmm1=tone_d1,
   *   //                            xmm2=f32(pqPeakNormalized),
   *   //                            xmm3=f32(100/203))                  @0xff20a
   *   //
   *   // SetParameter #1 (@0xff23c):
   *   //   xmm0 = tone_d2 @+0x1d8                                       @0xff20d
   *   //   xmm1 = tone_d3 @+0x1dc                                       @0xff216
   *   //   xmm2 = tone_e0 @+0x1e0                                       @0xff21f
   *   //   xmm3 = tone_e1 @+0x1e4                                       @0xff228
   *   //   leaf2->vt[0x60](leaf2, 1, ...)                               @0xff23c
   *   //
   *   // SetParameter #2 (@0xff260):
   *   //   xmm0 = f32(m1) = 0.1593017578125f  @0x3d0f64                  @0xff242
   *   //   xmm1 = f32(m2) = 78.84375f         @0x3d0f68                  @0xff24a
   *   //   xmm2 = xmm3 = 0                                                @0xff252/@0xff255
   *   //   leaf2->vt[0x60](leaf2, 2, m1, m2, 0, 0)                        @0xff260
   *   //
   *   // SetParameter #3 (@0xff290):
   *   //   rax = this->0x1c0 (subNode1);                                  @0xff263
   *   //   xmm1 = *(subNode1->0x1a0) as f32 = 9.051985f (from @0x3d10c0)  @0xff26a
   *   //   xmm2 = *(subNode1->0x1a4) as f32 = 8.973207f                    @0xff272
   *   //   xmm0 = f32(c1) = 0.8359375f @0x3d0f58                            @0xff27d
   *   //   xmm3 = 0                                                        @0xff285
   *   //   leaf2->vt[0x60](leaf2, 3, c1, subNode1@1a0, subNode1@1a4, 0)     @0xff290
   *   //
   *   // SetParameter #4 (@0xff2b4):
   *   //   xmm0 = f32(1/m1) = 6.277394771575928f @0x3d0f50                 @0xff296
   *   //   xmm1 = f32(1/m2) = 0.012683313339948654f @0x3d0f54              @0xff29e
   *   //   xmm2 = xmm3 = 0                                                  @0xff2a6/@0xff2a9
   *   //   leaf2->vt[0x60](leaf2, 4, 1/m1, 1/m2, 0, 0)                      @0xff2b4
   *   //
   *   // SetParameter #5 (@0xff2e9):
   *   //   rax = this->0x1c8 (subNode2);                                    @0xff2b7
   *   //   xmm3 = *(subNode2->0x1a0) as f32 = 100.0f                        @0xff2be
   *   //   xmm0 = f32(c1)  = 0.8359375f  @0x3d0f58                          @0xff2c9
   *   //   xmm1 = f32(c2)  = 18.8515625f @0x3d0f5c                          @0xff2d1
   *   //   xmm2 = f32(-c3) = -18.6875f   @0x3d0f60                          @0xff2d9
   *   //   leaf2->vt[0x60](leaf2, 5, c1, c2, -c3, 100.0)                    @0xff2e9
   *   //
   *   // Dispatch on OutputMode +0x1a0 ------------------------------
   *   // cmpl $2, 0x1a0(%r15) ; jne 0xff30e                                @0xff2ec/@0xff2f4
   *   if (outputMode == 2) {
   *     leaf2->vt[0x10](leaf2);  // HGNode Add                             @0xff2fc
   *     this->0x198 = leaf2;                                                @0xff2ff
   *     result = leaf2;
   *   } else {
   *     mat   = new HGColorMatrix (0x1f0)                                   @0xff30e..@0xff31e
   *     mat->vt[0x78](mat, 0, leaf2)                                        @0xff333
   *     HGColorMatrix::LoadMatrix(mat, &rec2020RGBToRec709RGB, true)        @0xff336..@0xff345
   *
   *     clamp = new HGColorClamp (0x1c0)                                     @0xff34a..@0xff35a
   *     clamp->vt[0x78](clamp, 0, mat)                                       @0xff370
   *     HGColorClamp::SetClampMinValues(clamp, 0, 0, 0, 0)                    @0xff373..@0xff382
   *
   *     gamma = new HGGamma (0x1b0)                                          @0xff387..@0xff397
   *     gamma->vt[0x78](gamma, 0, clamp)                                     @0xff3a9
   *
   *     // xmm0 = 0.4166666567325592f @0x3ca2b4                              @0xff3b0
   *     // xmm3 = 1.0f                @0x3c7cc0                              @0xff3b8
   *     // xmm1 = movaps xmm0 ; xmm2 = movaps xmm0
   *     gamma->vt[0x60](gamma, 0, 5/12, 5/12, 5/12, 1.0)                     @0xff3cb
   *
   *     // cmpl $0, 0x1a0(%r15) ; je 0xff449                                  @0xff3ce/@0xff3d6
   *     if (outputMode != 0) {
   *       cg = new HGColorGamma (0x4a0)                                      @0xff3d8..@0xff3e8
   *       cg->vt[0x78](cg, 0, gamma)                                          @0xff3f9
   *       HGColorGamma::SetConversion(cg, 0, 1, 0, 0, 3, 8)                    @0xff41b
   *         (%esi=0, %edx=1, %ecx=0, [rsp]=0, %r8d=3, %r9d=8 — see disasm)
   *       HGColorGamma::SetPremultiplyState(cg, false, false)                  @0xff427
   *       cg->vt[0x10](cg);  this->0x198 = cg; cg->vt[0x18]()                    @0xff433/@0xff436/@0xff441
   *     } else {
   *       gamma->vt[0x10](gamma);  this->0x198 = gamma;                        @0xff450/@0xff453
   *     }
   *     gamma->vt[0x18]()                                                     @0xff461
   *     clamp->vt[0x18]()                                                     @0xff46b
   *     mat->vt[0x18]()                                                       @0xff472
   *     result = this->0x198
   *   }
   *   leaf2->vt[0x18]()                                                       @0xff485
   *   head->vt[0x18]()                                                        @0xff48e
   *   return result;
   */
  public GetOutput(r: HGRenderer): HGNodeLike | null { // @Helium 0xff130
    // source = HGRenderer::GetInput(r, this, 0)                     @0xff14c
    const source = HGRenderer_GetInput(r, this as unknown as HGNodeLike, 0);

    // head = new HGNode wrapper                                     @0xff154/@0xff159
    const head = HGObject_operator_new(0x1b0);
    HGNode_ctor_call(head);                                         // @0xff164
    // head->vtable = leaq @0xff169 — no-op.

    // leaf1 = new HgcBT2100_PQ_OOTF_qtApprox                        @0xff173/@0xff178
    const leaf1 = HGObject_operator_new(0x1a0);
    HgcBT2100_PQ_OOTF_qtApprox_ctor(leaf1);                          // @0xff183
    void leaf1;
    // head->0x198 = leaf1                                            @0xff188
    // head->0x1a0..0x1af = *(4xf32 @0x3d1120)                        @0xff196
    //   = {1.0989999771118164f, -0.0989999994635582f, 4.5f, 1.0f}
    //   (opaque frontier storage; the four f32s are documented above)

    // head->vt[0x78](head, 0, source)                                @0xff1a8
    InnerNode_vt78_SetInput(head, 0, source);

    // leaf2 = new HgcBT2390_EETF_YRGB                                @0xff1ab/@0xff1b0
    const leaf2 = HGObject_operator_new(0x1a0);
    HgcBT2390_EETF_YRGB_ctor(leaf2);                                 // @0xff1bb
    // leaf2->vt[0x78](leaf2, 0, head)                                @0xff1cb
    InnerNode_vt78_SetInput(leaf2, 0, head);

    // --- Leaf2 SetParameter #0 --------------------------------------
    //   {tone_d0, tone_d1, f32(pqPeakNormalized), f32(100/referenceWhiteNits)}
    //   Constant 100.0 @0x3cd278 (f64)                               @0xff1e4
    InnerNode_vt60_SetParameter(
      leaf2, 0,
      this.tone_d0,
      this.tone_d1,
      Math.fround(this.pqPeakNormalized),
      Math.fround(100.0 / this.referenceWhiteNits),
    );

    // --- Leaf2 SetParameter #1 --------------------------------------
    //   {tone_d2, tone_d3, tone_e0, tone_e1}                          @0xff23c
    InnerNode_vt60_SetParameter(leaf2, 1, this.tone_d2, this.tone_d3, this.tone_e0, this.tone_e1);

    // --- Leaf2 SetParameter #2: {m1, m2, 0, 0}                       @0xff260
    // m1 @0x3d0f64 = 0.1593017578125f      @0xff242
    // m2 @0x3d0f68 = 78.84375f             @0xff24a
    InnerNode_vt60_SetParameter(
      leaf2, 2,
      Math.fround(0.1593017578125),
      Math.fround(78.84375),
      Math.fround(0.0),
      Math.fround(0.0),
    );

    // --- Leaf2 SetParameter #3 --------------------------------------
    //   {c1, subNode1@+0x1a0, subNode1@+0x1a4, 0}                     @0xff290
    // subNode1's +0x1a0/+0x1a4 hold 2xf32 {9.051985f, 8.973207f} —
    // the ctor's movsd from @0x3d10c0 @0xfedb5.  Since the opaque
    // frontier stores those bytes, we cite @0x3d10c0 and pass the
    // exact literal f32s the ctor wrote:
    // c1 @0x3d0f58 = 0.8359375f            @0xff27d
    InnerNode_vt60_SetParameter(
      leaf2, 3,
      Math.fround(0.8359375),               // c1
      Math.fround(9.051984786987305),       // subNode1->+0x1a0 (from @0x3d10c0 lo f32)
      Math.fround(8.973207473754883),       // subNode1->+0x1a4 (from @0x3d10c0 hi f32)
      Math.fround(0.0),
    );

    // --- Leaf2 SetParameter #4: {1/m1, 1/m2, 0, 0}                   @0xff2b4
    // 1/m1 @0x3d0f50 = 6.277394771575928f       @0xff296
    // 1/m2 @0x3d0f54 = 0.012683313339948654f    @0xff29e
    InnerNode_vt60_SetParameter(
      leaf2, 4,
      Math.fround(6.277394771575928),
      Math.fround(0.012683313339948654),
      Math.fround(0.0),
      Math.fround(0.0),
    );

    // --- Leaf2 SetParameter #5: {c1, c2, -c3, subNode2@+0x1a0}       @0xff2e9
    // c1  @0x3d0f58 = 0.8359375f            @0xff2c9 (dup)
    // c2  @0x3d0f5c = 18.8515625f           @0xff2d1
    // -c3 @0x3d0f60 = -18.6875f             @0xff2d9
    // subNode2->+0x1a0 = 100.0f (ctor movl $0x42c80000 @0xfee00)
    InnerNode_vt60_SetParameter(
      leaf2, 5,
      Math.fround(0.8359375),
      Math.fround(18.8515625),
      Math.fround(-18.6875),
      Math.fround(100.0),
    );

    // --- Dispatch on OutputMode +0x1a0 --------------------------------
    // cmpl $2, 0x1a0(%r15) ; jne 0xff30e                                @0xff2ec/@0xff2f4
    let result: HGNodeLike | null;
    if ((this.outputMode >>> 0) === 2) {
      // OutputMode == 2: return leaf2 directly (PQ output preserved)
      InnerNode_vt10_Add(leaf2);                                       // @0xff2fc
      this.inner = leaf2;                                              // @0xff2ff
      result = leaf2;
      // jmp 0xff47f (shared teardown)
    } else {
      // OutputMode != 2: rec2020->rec709 + clamp + gamma [+ optional wrap]
      const mat = HGObject_operator_new(0x1f0);                        // @0xff30e/@0xff313
      HGColorMatrix_ctor(mat);                                         // @0xff31e
      InnerNode_vt78_SetInput(mat, 0, leaf2);                          // @0xff333
      HGColorMatrix_LoadMatrix(mat, HGColorGamma_rec2020RGBToRec709RGB_ref(), true); // @0xff336..@0xff345

      const clamp = HGObject_operator_new(0x1c0);                      // @0xff34a/@0xff34f
      HGColorClamp_ctor(clamp);                                        // @0xff35a
      InnerNode_vt78_SetInput(clamp, 0, mat);                          // @0xff370
      HGColorClamp_SetClampMinValues(clamp, 0.0, 0.0, 0.0, 0.0);       // @0xff382

      const gamma = HGObject_operator_new(0x1b0);                      // @0xff387/@0xff38c
      HGGamma_ctor(gamma);                                             // @0xff397
      InnerNode_vt78_SetInput(gamma, 0, clamp);                        // @0xff3a9

      // gamma->vt[0x60](gamma, 0, 5/12, 5/12, 5/12, 1.0f)              @0xff3cb
      // xmm0 = 0.4166666567325592f  @0x3ca2b4                          @0xff3b0
      // xmm3 = 1.0f                 @0x3c7cc0                          @0xff3b8
      // xmm1 = xmm2 = xmm0 (movaps)                                    @0xff3c5/@0xff3c8
      InnerNode_vt60_SetParameter(
        gamma, 0,
        Math.fround(0.4166666567325592), // f32 5/12 (SDR gamma factor)
        Math.fround(0.4166666567325592),
        Math.fround(0.4166666567325592),
        Math.fround(1.0),
      );

      // cmpl $0, 0x1a0(%r15) ; je 0xff449                              @0xff3ce/@0xff3d6
      if ((this.outputMode >>> 0) !== 0) {
        // OutputMode == 1: wrap with HGColorGamma pass
        const cg = HGObject_operator_new(0x4a0);                       // @0xff3d8/@0xff3dd
        HGColorGamma_ctor(cg);                                         // @0xff3e8
        InnerNode_vt78_SetInput(cg, 0, gamma);                         // @0xff3f9
        // HGColorGamma::SetConversion(cg, 0, 1, 0, 0, 3, 8)              @0xff41b
        //   (movl $0, (%rsp); %esi=0; %edx=1; %ecx=0; %r8d=3; %r9d=8)
        HGColorGamma_SetConversion(cg, 0, 1, 0, 0, 3, 8);
        HGColorGamma_SetPremultiplyState(cg, false, false);            // @0xff427
        InnerNode_vt10_Add(cg);                                        // @0xff433
        this.inner = cg;                                               // @0xff436
        InnerNode_vt18_Release(cg);                                    // @0xff441
        // jmp 0xff45a
      } else {
        // OutputMode == 0: return HGGamma tail
        InnerNode_vt10_Add(gamma);                                     // @0xff450
        this.inner = gamma;                                            // @0xff453
      }
      InnerNode_vt18_Release(gamma);                                   // @0xff461
      InnerNode_vt18_Release(clamp);                                   // @0xff46b (was -0x30(%rbp) = clamp)
      InnerNode_vt18_Release(mat);                                     // @0xff472 (was -0x38(%rbp) = mat)
      result = this.inner;                                             // @0xff478 movq 0x198(%r15), %r15
    }
    InnerNode_vt18_Release(leaf2);                                     // @0xff485
    InnerNode_vt18_Release(head);                                      // @0xff48e
    // Final tail: return this->0x198  @0xff491
    return result;
  }
}
