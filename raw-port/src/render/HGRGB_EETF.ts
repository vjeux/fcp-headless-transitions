// HGRGB_EETF.ts — Helium HGRGB_EETF: a Rec-2100 PQ Electro-Electrical
// Transfer Function render node that chains three inner HGNodes (a
// BT.2100 PQ OETF approximator, an inner HgcRGB_EETF, and a BT.2100 PQ
// inverse-OETF approximator) driven by a peak-color-component-level
// parameter. Faithful transcription of x86_64 disassembly of
//   /Applications/Final Cut Pro.app/Contents/Frameworks/Helium.framework/
//     Versions/A/Helium.
//
// Source disassembly (in this worktree):
//   raw-port/re/disasm/Helium.HGRGB_EETF.C2.s                       (C2 base ctor)
//   raw-port/re/disasm/Helium.HGRGB_EETF.HGRGB_EETF.s               (C1 complete ctor)
//   raw-port/re/disasm/Helium.HGRGB_EETF.~HGRGB_EETF.s              (D0)
//   raw-port/re/disasm/Helium.HGRGB_EETF.setPeakColorComponentLevel.s
//   raw-port/re/disasm/Helium.HGRGB_EETF.GetOutput.s
//
// Helium symbols transcribed:
//   @0x001057e0  HGRGB_EETF::HGRGB_EETF()                          (C2)
//   @0x00105940  HGRGB_EETF::HGRGB_EETF()                          (C1 — jmp C2)
//   @0x00105950  HGRGB_EETF::~HGRGB_EETF()                         (D2)
//   @0x001059b0  HGRGB_EETF::~HGRGB_EETF()                         (D1)
//   @0x00105a10  HGRGB_EETF::~HGRGB_EETF()                         (D0)
//   @0x00105a80  HGRGB_EETF::setPeakColorComponentLevel(double)
//   @0x00105ba0  HGRGB_EETF::GetOutput(HGRenderer*)
//
// Vtable targets (RIP-rel leaq → data section):
//   HGRGB_EETF vtable @Helium 0xa1a740    (C2 @0x001057f3 → 0x1057fa+0x914f46;
//                                          D0 reinstall @0x00105a19 → 0x105a20+0x914d20)
//   inner-node A vtable @Helium 0xa16600  (C2 @0x00105812 → 0x105819+0x910de7)
//   inner-node C vtable @Helium 0xa16840  (C2 @0x00105881 → 0x105888+0x910fb8)
//
// STRUCT LAYOUT (recovered from C2 + setPeakColorComponentLevel + GetOutput):
//   0x00  : void*    vtable (this-class 0xa1a740)                (@0x001057f3)
//   0x08..0x197 : HGNode base (inherited)
//   0x198 : HGNode*  subA   — a bare HGNode-wrapped HgcBT2100_PQ_OETF_qtApprox
//                             instance (its own vtable 0xa16600; +0x198 holds the
//                             Hgc* inner; +0x1a0 is a double = 258632.28177038528
//                             at RIP-const @0x003d10c0).                (@0x00105849)
//   0x1a0 : HGNode*  subB   — an HgcRGB_EETF instance (its vtable is set by
//                             HgcRGB_EETF::HgcRGB_EETF() @Helium; not touched here).
//                                                                        (@0x00105865)
//   0x1a8 : HGNode*  subC   — a bare HGNode-wrapped HgcBT2100_PQ_InverseOETF_qtApprox
//                             instance (vtable 0xa16840; +0x198 holds the Hgc*
//                             inner; +0x1a0 is a 16-byte movaps load from
//                             RIP-const @0x003d1200 (two doubles: 0.13898244536...
//                             and 5.72e10 — note: these words are actually paired
//                             float32s per setPeak's cvtpd2ps output).    (@0x001058b6)
//   0x1b0 : f32[4]   selfParams4 — 16-byte movaps load from RIP-const @0x003d1210
//                             (raw bytes {0x400000003f000000, 0xbf0000003e2aaaab}
//                             i.e. as float32-pairs: (0.5, 2.0, 0.166666, -0.5)).
//                             setPeakColorComponentLevel later overwrites this
//                             with cvtpd2ps output.                       (@0x001058bd)
//   0x1c0 : f32[2]   selfParams2 — 8-byte movsd load from RIP-const @0x003c9ff0
//                             (raw double 3.0517585e-05, i.e. as float32-pair
//                             (0.5, 0.5)).  setPeak overwrites +0x1c0 (f32) and
//                             +0x1c4 (f32).                              (@0x001058cb)
//
// Called symbols (from otool -tV comments in the disasm):
//   __ZN6HGNodeC2Ev                     HGNode::HGNode()        (@0x001057ee, @0x0010580d, @0x0010587c)
//   __ZN8HGObjectnwEm                   HGObject::operator new  (@0x00105802, @0x00105832, @0x00105855,
//                                                                @0x00105871, @0x00105890)
//   __ZN26HgcBT2100_PQ_OETF_qtApproxC1Ev
//                                       HgcBT2100_PQ_OETF_qtApprox::HgcBT2100_PQ_OETF_qtApprox()
//                                                                (@0x0010583d)
//   __ZN11HgcRGB_EETFC1Ev               HgcRGB_EETF::HgcRGB_EETF()
//                                                                (@0x00105860)
//   __ZN33HgcBT2100_PQ_InverseOETF_qtApproxC1Ev
//                                       HgcBT2100_PQ_InverseOETF_qtApprox::HgcBT2100_PQ_InverseOETF_qtApprox()
//                                                                (@0x0010589b)
//   __ZN10HGRenderer8GetInputEP6HGNodei HGRenderer::GetInput     (@0x00105bb9)
//   *vtable+0x18 on child               HGObject::Release()      (D0 @0x00105a32/@0x00105a44/@0x00105a56)
//   *vtable+0x78 on child               HGNode::SetInput(int,HGNode*) (GetOutput @0x00105bc9/@0x00105bdf/@0x00105c4c)
//   *vtable+0x60 on subB                HGNode::SetParameter(int,f,f,f,f) (GetOutput @0x00105c04/@0x00105c36)
//   __ZN6HGNodeD2Ev                     HGNode::~HGNode()        (D0 @0x00105a5c, unwind @0x001058ff etc.)
//   __ZN8HGObjectdlEPv                  HGObject::operator delete(void*) (D0 jmp @0x00105a6a, unwind)
//   _pow                                libm pow(double,double)  (setPeak @0x00105ad1, @0x00105afe)
//   ___clang_call_terminate              EH terminate fallback   (@0x00105a72)
//
// RIP-relative DATA CONSTANTS used by setPeakColorComponentLevel (all
// verified via resolve.py Helium const <addr>):
//   @0x003d0f10 : 50.0            (ucomisd  L,   xmm0)
//   @0x003d0f20 : 0.005           (movsd    xmm0)
//   @0x003d0d28 : 7.309559025783966e-07  (movsd xmm0; jump target of low branch)
//   @0x003d0f18 : 8000.0          (minsd    xmm0 with)
//   @0x003d0d20 : 10000.0         (divsd    xmm0 by)
//   @0x003d0d30 : 0.1593017578125 (movsd    xmm1; pow exponent — BT.2100 PQ m1)
//   @0x003d1080 : (18.8515625, 18.6875)   (mulpd double-pair)
//   @0x003d1090 : (0.8359375, 1.0)        (addpd double-pair)
//   @0x003d0d38 : 78.84375        (movsd    xmm1; pow exponent — BT.2100 PQ m2)
//   @0x003d0da0 : 1.5             (movsd    xmm1 scale after 2nd pow)
//   @0x003ccd68 : -0.5            (addsd)
//   @0x003ca260 : 1.0             (movsd    xmm2 constant)
//   @0x003d0f28 : -2.0            (movsd    xmm4 constant)
//   @0x003d1110 : (0.0, 3.0)      (mulpd    with xmm5 pair)
//
// Ctor RIP-relative DATA (movsd/movaps):
//   @0x003d10c0 : 258632.28177038528 (movsd → subA.inner +0x1a0)  (@0x0010581c)
//   @0x003d1200 : (0.13898244..., 5.719e10) (movaps → subC.inner +0x1a0)  (@0x001058a7)
//   @0x003d1210 : movaps 16B → self+0x1b0
//                 (u64s: 0x400000003f000000, 0xbf0000003e2aaaab)
//                 = f32[4] (0.5, 2.0, 0.166666, -0.5)                   (@0x001058bd)
//   @0x003c9ff0 : 3.0517585287270776e-05 (movsd → self+0x1c0)
//                 = f32[2] (0.5, 0.5)                                    (@0x001058cb)
//
// NOTE: The compiler has packed several float32 pairs into single 64-bit
// double-precision literals in the data section (see the u64 hex above).
// The Helium binary reads them via movsd/movaps and stores them into fields
// that are later read as float32-tuples by setPeakColorComponentLevel and
// GetOutput. We preserve this exactly — the raw 64-bit `u64` values are the
// ground truth; the "double" decoded view is just the way IEEE-754 spells
// those same 8 bytes.

import { HGNode } from "./HGNode";

/** HGRenderer — opaque render context passed to GetOutput. */
export interface HGRenderer {
  /** HGRenderer::GetInput(HGNode*, int) @Helium — called @0x00105bb9. */
  GetInput(node: HGNode, idx: number): unknown;
}

// ---------------------------------------------------------------------------
// Frontier types (each callee is a documented gap — throwing stubs cite @0xADDR)
// ---------------------------------------------------------------------------

/** HgcBT2100_PQ_OETF_qtApprox — the "quick-approx" BT.2100 PQ OETF core
 *  wrapped by subA. Ctor invoked from HGRGB_EETF::HGRGB_EETF @0x0010583d.
 *  Frontier. */
export class HgcBT2100_PQ_OETF_qtApprox extends HGNode {
  /** HgcBT2100_PQ_OETF_qtApprox::HgcBT2100_PQ_OETF_qtApprox() @Helium
   *  (mangled __ZN26HgcBT2100_PQ_OETF_qtApproxC1Ev; called @0x0010583d). Frontier. */
  constructor() {
    super();
    throw new Error(
      "HgcBT2100_PQ_OETF_qtApprox::HgcBT2100_PQ_OETF_qtApprox() @Helium (frontier) " +
        "— __ZN26HgcBT2100_PQ_OETF_qtApproxC1Ev; called from HGRGB_EETF::HGRGB_EETF @0x0010583d"
    );
  }
}

/** HgcRGB_EETF — the inner (non-HG) RGB EETF worker wrapped by subB.
 *  Ctor invoked @0x00105860.  Frontier. */
export class HgcRGB_EETF extends HGNode {
  /** HgcRGB_EETF::HgcRGB_EETF() @Helium (mangled __ZN11HgcRGB_EETFC1Ev;
   *  called @0x00105860). Frontier. */
  constructor() {
    super();
    throw new Error(
      "HgcRGB_EETF::HgcRGB_EETF() @Helium (frontier) " +
        "— __ZN11HgcRGB_EETFC1Ev; called from HGRGB_EETF::HGRGB_EETF @0x00105860"
    );
  }
}

/** HgcBT2100_PQ_InverseOETF_qtApprox — the "quick-approx" BT.2100 PQ inverse
 *  OETF core wrapped by subC. Ctor invoked @0x0010589b. Frontier. */
export class HgcBT2100_PQ_InverseOETF_qtApprox extends HGNode {
  /** HgcBT2100_PQ_InverseOETF_qtApprox::HgcBT2100_PQ_InverseOETF_qtApprox()
   *  @Helium (mangled __ZN33HgcBT2100_PQ_InverseOETF_qtApproxC1Ev; called
   *  @0x0010589b). Frontier. */
  constructor() {
    super();
    throw new Error(
      "HgcBT2100_PQ_InverseOETF_qtApprox::HgcBT2100_PQ_InverseOETF_qtApprox() " +
        "@Helium (frontier) — __ZN33HgcBT2100_PQ_InverseOETF_qtApproxC1Ev; " +
        "called from HGRGB_EETF::HGRGB_EETF @0x0010589b"
    );
  }
}

/** Structural shim for the vtable slots invoked on child nodes.
 *  Slot addresses on the base HGNode vtable:
 *    *0x18 = HGObject::Release()                  @Helium ~0x001a0f30 (see HGNode.ts)
 *    *0x60 = HGNode::SetParameter(int,f,f,f,f)    @Helium 0x0011cab0  (see HGNode.ts)
 *    *0x78 = HGNode::SetInput(int, HGNode*)       @Helium 0x0011c5f0  (see HGNode.ts)
 *  All three are frontier when not yet exported by HGNode.ts. */
type _HGNodeVCalls = {
  /** @Helium *vtable+0x18 = HGObject::Release() — not yet transcribed on HGNode.ts. */
  Release?(): void;
  /** @Helium *vtable+0x60 = HGNode::SetParameter(int,f,f,f,f) — base @0x0011cab0. */
  SetParameter?(idx: number, a: number, b: number, c: number, d: number): number;
};

/**
 * HGRGB_EETF — Helium composite HDR PQ EETF render node.
 *
 * Faithful transcription of ctor / dtor / setPeakColorComponentLevel / GetOutput.
 * Vtable @Helium 0xa1a740.
 */
export class HGRGB_EETF extends HGNode {
  /** +0x198 — subA (HgcBT2100_PQ_OETF_qtApprox wrapped in a bare HGNode). */
  subA!: HGNode;
  /** +0x1a0 — subB (HgcRGB_EETF instance).                                */
  subB!: HGNode;
  /** +0x1a8 — subC (HgcBT2100_PQ_InverseOETF_qtApprox wrapped in a bare HGNode). */
  subC!: HGNode;
  /** +0x1b0 — 4× float32 params written by ctor (from 16B RIP-const) and
   *           overwritten by setPeakColorComponentLevel with cvtpd2ps output. */
  selfParams4: Float32Array = new Float32Array(4);
  /** +0x1c0 — 2× float32 params; ctor stores a double whose 8 bytes decode
   *           as float32-pair (0.5, 0.5); setPeak overwrites with cvtsd2ss. */
  selfParams2: Float32Array = new Float32Array(2);

  /**
   * HGRGB_EETF::HGRGB_EETF() @Helium @0x001057e0 (C2) / @0x00105940 (C1).
   *
   * C2 body @0x001057e0..@0x001058e3 (register mapping in the disasm):
   *   HGNode::HGNode()                                     (@0x001057ee)
   *   *(void**)this = 0xa1a740                              (@0x001057f3)
   *   ---- subA: bare HGNode with an inner HgcBT2100_PQ_OETF_qtApprox ----
   *   r15   = new HGObject(0x1b0)                          (@0x001057fd..@0x00105807)
   *   HGNode::HGNode()(r15)                                (@0x0010580d)
   *   *(void**)r15 = 0xa16600                              (@0x00105812)
   *   *(double*)(r15+0x1a0) = 258632.28177038528           (@0x0010581c..@0x00105824)
   *                                    (@Helium data @0x003d10c0)
   *   r12   = new HGObject(0x1a0)                          (@0x0010582d..@0x00105837)
   *   HgcBT2100_PQ_OETF_qtApprox::HgcBT2100_PQ_OETF_qtApprox()(r12)
   *                                                        (@0x0010583d)
   *   *(void**)(r15+0x198) = r12                            (@0x00105842)
   *   *(void**)(this+0x198)= r15  (→ this.subA)             (@0x00105849)
   *   ---- subB: HgcRGB_EETF instance ----
   *   r15   = new HGObject(0x1a0)                          (@0x00105850..@0x0010585a)
   *   HgcRGB_EETF::HgcRGB_EETF()(r15)                       (@0x00105860)
   *   *(void**)(this+0x1a0) = r15 (→ this.subB)             (@0x00105865)
   *   ---- subC: bare HGNode with inner HgcBT2100_PQ_InverseOETF_qtApprox ----
   *   r15   = new HGObject(0x1b0)                          (@0x0010586c..@0x00105876)
   *   HGNode::HGNode()(r15)                                (@0x0010587c)
   *   *(void**)r15 = 0xa16840                              (@0x00105881)
   *   r12   = new HGObject(0x1a0)                          (@0x0010588b..@0x00105895)
   *   HgcBT2100_PQ_InverseOETF_qtApprox::HgcBT2100_PQ_InverseOETF_qtApprox()(r12)
   *                                                        (@0x0010589b)
   *   *(void**)(r15+0x198) = r12                            (@0x001058a0)
   *   *(u128*)(r15+0x1a0) = movaps @Helium data @0x003d1200 (@0x001058a7..@0x001058ae)
   *   *(void**)(this+0x1a8) = r15  (→ this.subC)            (@0x001058b6)
   *   ---- Self-owned param blocks ----
   *   *(u128*)(this+0x1b0) = movaps @Helium data @0x003d1210 (@0x001058bd..@0x001058c4)
   *   *(u64*)(this+0x1c0)  = movsd  @Helium data @0x003c9ff0 (@0x001058cb..@0x001058d3)
   *   ret                                                   (@0x001058e3)
   */
  constructor() {
    super(); // HGNode::HGNode() @0x001057ee
    // @0x001057f3: vtable install @Helium 0xa1a740 — JS no-op.

    // ---- subA ----
    // @0x001057fd..@0x00105807: r15 = new HGObject(0x1b0)
    // @0x0010580d: HGNode::HGNode()(r15)
    const subA = new HGNode();
    // @0x00105812: *(void**)subA = 0xa16600 (subA's vtable). JS no-op.
    // @0x0010581c..@0x00105824: *(double*)(subA+0x1a0) = 258632.28177038528
    (subA as unknown as { field_1a0_d?: number }).field_1a0_d = 258632.28177038528;
    // @0x0010582d..@0x0010583d: r12 = new HgcBT2100_PQ_OETF_qtApprox()
    const innerA = new HgcBT2100_PQ_OETF_qtApprox();
    // @0x00105842: *(void**)(subA+0x198) = innerA
    (subA as unknown as { field_198_ptr?: HGNode }).field_198_ptr = innerA;
    // @0x00105849: this.subA = subA
    this.subA = subA;

    // ---- subB (HgcRGB_EETF) ----
    // @0x00105850..@0x00105860: subB = new HgcRGB_EETF()
    this.subB = new HgcRGB_EETF();
    // @0x00105865: this.subB = subB   (stored above)

    // ---- subC ----
    // @0x0010586c..@0x0010587c: r15 = new HGObject(0x1b0) ; HGNode::HGNode()
    const subC = new HGNode();
    // @0x00105881: *(void**)subC = 0xa16840  — JS no-op.
    // @0x0010588b..@0x0010589b: innerC = new HgcBT2100_PQ_InverseOETF_qtApprox()
    const innerC = new HgcBT2100_PQ_InverseOETF_qtApprox();
    // @0x001058a0: *(void**)(subC+0x198) = innerC
    (subC as unknown as { field_198_ptr?: HGNode }).field_198_ptr = innerC;
    // @0x001058a7..@0x001058ae: *(u128*)(subC+0x1a0) = movaps @0x003d1200
    //   Raw 16B: {u64 @0x003d1200 = 0x3fc1ca2d40c65fd8, u64 @0x003d1208 = 0x422aa1be3c42cacf}
    //   Interpret as two doubles: 0.13898244536244309, 57191374369.39611.
    //   The compiler packed these bytes; store them faithfully as raw u64 pair.
    (subC as unknown as { field_1a0_pair?: [bigint, bigint] }).field_1a0_pair = [
      0x3fc1ca2d40c65fd8n,
      0x422aa1be3c42cacfn,
    ];
    // @0x001058b6: this.subC = subC
    this.subC = subC;

    // ---- Self-owned param blocks ----
    // @0x001058bd..@0x001058c4: movaps 16B from @0x003d1210 into this+0x1b0.
    //   Raw bytes: {u64 @0x003d1210 = 0x400000003f000000, u64 @0x003d1218 = 0xbf0000003e2aaaab}
    //   Read as f32[4] (little-endian): (0x3f000000=0.5f, 0x40000000=2.0f,
    //                                    0x3e2aaaab=0.16666667f, 0xbf000000=-0.5f).
    const raw1b0 = new ArrayBuffer(16);
    const u32_1b0 = new Uint32Array(raw1b0);
    u32_1b0[0] = 0x3f000000; //  0.5f
    u32_1b0[1] = 0x40000000; //  2.0f
    u32_1b0[2] = 0x3e2aaaab; //  0.16666667f
    u32_1b0[3] = 0xbf000000; // -0.5f
    this.selfParams4 = new Float32Array(raw1b0);

    // @0x001058cb..@0x001058d3: movsd from @0x003c9ff0 into this+0x1c0 (8B).
    //   Raw u64 @0x003c9ff0 = 0x3f0000003f000000.
    //   Read as f32[2]: (0x3f000000=0.5f, 0x3f000000=0.5f).
    const raw1c0 = new ArrayBuffer(8);
    const u32_1c0 = new Uint32Array(raw1c0);
    u32_1c0[0] = 0x3f000000; // 0.5f
    u32_1c0[1] = 0x3f000000; // 0.5f
    this.selfParams2 = new Float32Array(raw1c0);
  }

  /**
   * HGRGB_EETF::setPeakColorComponentLevel(double x) @Helium @0x00105a80.
   *
   * Faithful control-flow transcription:
   *
   *   ; xmm0 = x
   *   ucomisd xmm0, [50.0]              (@0x00105a89)  ; cmp x vs 50.0
   *   jae     MAIN                      (@0x00105a91)
   *   ; ---- LOW branch (x < 50.0 or NaN unordered — but jae fires only ordered≥) ----
   *   xmm0 = 0.005                      (@0x00105a93)  [@0x003d0f20]
   *   xmm1 = 0.0    (xorpd)             (@0x00105a9b)
   *   ucomisd xmm0, xmm1                (@0x00105a9f)  ; 0.005 vs 0.0
   *   jb      POWLABEL                  (@0x00105aa3)  ; CF=1 iff 0.005<0.0 → dead
   *   xmm0 = 7.309559025783966e-07      (@0x00105aa5)  [@0x003d0d28]
   *   jmp     POST_POW                  (@0x00105aad)
   * MAIN:
   *   xmm0 = min(xmm0, 8000.0)          (@0x00105aaf)  [@0x003d0f18]
   *   xmm0 = xmm0 / 10000.0             (@0x00105ab7)  [@0x003d0d20]
   *   xmm1 = 0.0  (xorpd)               (@0x00105abf)
   *   ucomisd xmm0, xmm1                (@0x00105ac3)  ; (x/10000) vs 0.0
   *   jae     LABEL_7p3e_7              (@0x00105ac7)  ; ordered≥ → skip pow
   * POWLABEL:
   *   xmm1 = 0.1593017578125            (@0x00105ac9)  [@0x003d0d30 — PQ m1]
   *   xmm0 = pow(xmm0, xmm1)            (@0x00105ad1)
   *   xmm0 = (xmm0, xmm0)  (movddup)    (@0x00105ad6)
   *   xmm0 = xmm0 * [18.8515625, 18.6875]      (@0x00105ada)  [@0x003d1080..87]
   *   xmm0 = xmm0 + [0.8359375, 1.0]           (@0x00105ae2)  [@0x003d1090..97]
   *   xmm1 = xmm0                       (@0x00105aea)
   *   xmm1 = unpckhpd(xmm1, xmm0)       (@0x00105aee)  ; xmm1[0]=xmm1[1],xmm1[1]=xmm0[1]
   *   xmm0 = xmm0 / xmm1                (@0x00105af2)  ; scalar
   *   xmm1 = 78.84375                   (@0x00105af6)  [@0x003d0d38 — PQ m2]
   *   xmm0 = pow(xmm0, xmm1)            (@0x00105afe)
   * POST_POW:
   *   xmm1 = 1.5                        (@0x00105b03)  [@0x003d0da0]
   *   xmm1 = xmm1 * xmm0                (@0x00105b0b)
   *   xmm1 = xmm1 + (-0.5)              (@0x00105b0f)  [@0x003ccd68]
   *   xmm2 = 1.0                        (@0x00105b17)  [@0x003ca260]
   *   xmm3 = xmm2                       (@0x00105b1f)
   *   xmm3 = xmm3 - xmm1                (@0x00105b23)   ; = 1.0 - xmm1
   *   xmm4 = -2.0                       (@0x00105b27)  [@0x003d0f28]
   *   xmm4 = xmm4 - xmm1                (@0x00105b2f)   ; = -2.0 - xmm1
   *   xmm5 = (xmm0, xmm0)  (movddup)    (@0x00105b33)
   *   xmm0 = xmm0 + xmm0                (@0x00105b37)   ; = 2*xmm0
   *   xmm6 = xmm1                       (@0x00105b3b)
   *   xmm6 = xmm6 + xmm2                (@0x00105b3f)   ; = xmm1 + 1.0
   *   xmm2 = xmm2 / xmm3                (@0x00105b43)   ; = 1.0 / (1.0 - xmm1)
   *   xmm5 = xmm5 * [0.0, 3.0]           (@0x00105b47)  [@0x003d1110..17]
   *   xmm4 = (xmm4, xmm4)  (movddup)    (@0x00105b4f)
   *   xmm4 = xmm4 + xmm5                (@0x00105b53)
   *   xmm6 = xmm6 - xmm0                (@0x00105b57)   ; = xmm1 + 1.0 - 2*xmm0
   *   xmm6 = blendpd xmm6, xmm4, 0b10   (@0x00105b5b)   ; xmm6=[xmm6[0], xmm4[1]]
   *   xmm1 = unpcklpd(xmm1, xmm2)       (@0x00105b61)   ; xmm1=[xmm1[0], xmm2[0]]
   *   xmm0 = cvtpd2ps(xmm6)             (@0x00105b65)   ; 2 doubles → 2 floats in low64
   *   xmm1 = cvtpd2ps(xmm1)             (@0x00105b69)
   *   xmm2 = xmm1                       (@0x00105b6d)
   *   xmm2 = unpcklpd(xmm2, xmm0)       (@0x00105b71)   ; xmm2=[xmm2[0], xmm0[0]] — 4 f32s
   *   movapd xmm2, [rbx+0x1b0]          (@0x00105b75)
   *   xmm0 = 0.0 (xorps)                (@0x00105b7d)
   *   xmm0 = cvtsd2ss(xmm3)             (@0x00105b80)   ; = (float)(1.0 - xmm1)
   *   movss xmm0, [rbx+0x1c0]           (@0x00105b84)
   *   movss xmm1, [rbx+0x1c4]           (@0x00105b8c)   ; = (float)cvtpd2ps(xmm1)low
   *   ret                               (@0x00105b9a)
   *
   * NOTE: this is the exact instruction sequence. Any attempt to simplify it
   * risks divergence from the FCP-observed numerics; keep it verbatim.
   */
  setPeakColorComponentLevel(x: number): void {
    // ---- constants (RIP-relative doubles, all cited in the header) ----
    const K_50 = 50.0; // @0x003d0f10
    const K_005 = 0.005; // @0x003d0f20
    const K_LOW = 7.309559025783966e-7; // @0x003d0d28
    const K_8000 = 8000.0; // @0x003d0f18
    const K_10000 = 10000.0; // @0x003d0d20
    const PQ_M1 = 0.1593017578125; // @0x003d0d30
    const PAIR_MUL = [18.8515625, 18.6875]; // @0x003d1080 / @0x003d1088
    const PAIR_ADD = [0.8359375, 1.0]; // @0x003d1090 / @0x003d1098
    const PQ_M2 = 78.84375; // @0x003d0d38
    const K_15 = 1.5; // @0x003d0da0
    const K_NEG_05 = -0.5; // @0x003ccd68
    const K_1 = 1.0; // @0x003ca260
    const K_NEG_2 = -2.0; // @0x003d0f28
    const PAIR_MUL_53 = [0.0, 3.0]; // @0x003d1110 / @0x003d1118

    let xmm0: number;

    // @0x00105a89..@0x00105a91: ucomisd x, 50.0 ; jae MAIN
    //   jae taken iff (x >= 50.0) ordered.
    const takeMain = x >= K_50; // NaN → false (Number NaN comparisons are all false)
    if (!takeMain) {
      // LOW branch @0x00105a93..@0x00105aad
      xmm0 = K_005;
      const xmm1 = 0.0;
      // ucomisd 0.005 vs 0.0 ; jb POWLABEL — CF=1 iff 0.005<0.0 → never
      if (xmm0 < xmm1) {
        // dead path — but faithfully route to POWLABEL
        xmm0 = this._powLabel(xmm0, PQ_M1, PAIR_MUL, PAIR_ADD, PQ_M2);
      } else {
        xmm0 = K_LOW; // @0x00105aa5
      }
      // jmp POST_POW @0x00105aad
    } else {
      // MAIN branch @0x00105aaf..
      xmm0 = Math.min(x, K_8000); // minsd @0x00105aaf
      xmm0 = xmm0 / K_10000; // divsd @0x00105ab7
      // ucomisd (x/10000) vs 0.0 ; jae LABEL_7p3e_7
      //   jae taken iff (x/10000) >= 0.0 ordered → skip pow, use LOW const.
      if (xmm0 >= 0.0) {
        xmm0 = K_LOW; // @0x00105aa5
      } else {
        // POWLABEL @0x00105ac9..@0x00105afe (2 pow calls + inlined vec math)
        xmm0 = this._powLabel(xmm0, PQ_M1, PAIR_MUL, PAIR_ADD, PQ_M2);
      }
    }

    // POST_POW @0x00105b03..
    // Semantics preserved verbatim from the disasm; each step cites its addr.
    const xmm1 = K_15 * xmm0; // @0x00105b03..@0x00105b0b
    const xmm1_post_add = xmm1 + K_NEG_05; // @0x00105b0f
    const xmm2 = K_1; // @0x00105b17
    const xmm3 = xmm2 - xmm1_post_add; // @0x00105b23
    const xmm4 = K_NEG_2 - xmm1_post_add; // @0x00105b2f
    // xmm5 = (xmm0, xmm0) then xmm5 * (0.0, 3.0) — 2-lane double vec.
    const xmm5_lane0 = xmm0 * PAIR_MUL_53[0]; // xmm5[0] * 0.0 = 0.0
    const xmm5_lane1 = xmm0 * PAIR_MUL_53[1]; // xmm5[1] * 3.0 = 3*xmm0
    // xmm0 = xmm0 + xmm0 (@0x00105b37) → scalar 2*xmm0
    const xmm0_dbl = xmm0 + xmm0;
    // xmm6 = xmm1 + 1.0 (@0x00105b3f)
    const xmm6_pre_sub = xmm1_post_add + xmm2;
    // xmm2 = xmm2 / xmm3 (@0x00105b43) : 1.0 / (1.0 - xmm1)
    const xmm2_div = xmm2 / xmm3;
    // xmm4 = (xmm4,xmm4) + xmm5 (movddup+addpd) → lane 0 = xmm4+0, lane 1 = xmm4+3*xmm0
    const xmm4_lane0 = xmm4 + xmm5_lane0; // = xmm4
    const xmm4_lane1 = xmm4 + xmm5_lane1; // = xmm4 + 3*xmm0
    // xmm6 = xmm6 - xmm0 (@0x00105b57)  → scalar (xmm1 + 1 - 2*xmm0)
    const xmm6_scalar = xmm6_pre_sub - xmm0_dbl;
    // blendpd xmm6, xmm4, 0b10 → xmm6=[xmm6[0], xmm4[1]]
    const xmm6_lane0 = xmm6_scalar; // xmm6[0]
    const xmm6_lane1 = xmm4_lane1; // xmm4[1]
    // unpcklpd xmm1, xmm2 → xmm1=[xmm1_post_add, xmm2_div]
    const xmm1_lane0 = xmm1_post_add;
    const xmm1_lane1 = xmm2_div;
    // cvtpd2ps: pack 2 doubles → 2 f32s in the low 64b.
    const f32a = Math.fround(xmm6_lane0);
    const f32b = Math.fround(xmm6_lane1);
    const f32c = Math.fround(xmm1_lane0);
    const f32d = Math.fround(xmm1_lane1);
    // xmm2 = unpcklpd(xmm1_lo, xmm0_lo) — final 4 f32 lanes in order:
    //   lane0=f32c, lane1=f32d, lane2=f32a, lane3=f32b.
    // movapd xmm2 → [rbx+0x1b0] — write all four.
    this.selfParams4[0] = f32c; // @0x00105b71 unpcklpd + movapd
    this.selfParams4[1] = f32d;
    this.selfParams4[2] = f32a;
    this.selfParams4[3] = f32b;

    // @0x00105b7d..@0x00105b8c:
    //   xmm0 = cvtsd2ss(xmm3) = (float)(1.0 - xmm1_post_add)
    //   movss xmm0 → [rbx+0x1c0]
    //   movss xmm1 → [rbx+0x1c4]   ; xmm1 holds the low 32b of cvtpd2ps result
    //     — that is Math.fround(xmm1_lane0) = f32c.
    this.selfParams2[0] = Math.fround(xmm3);
    this.selfParams2[1] = f32c;
  }

  /** Internal helper — the POWLABEL segment @0x00105ac9..@0x00105afe. */
  private _powLabel(
    inX: number,
    pqM1: number,
    pairMul: number[],
    pairAdd: number[],
    pqM2: number
  ): number {
    // @0x00105ac9..@0x00105ad1: xmm0 = pow(xmm0, PQ_M1)
    let v = Math.pow(inX, pqM1);
    // @0x00105ad6: movddup xmm0 — (v, v)
    // @0x00105ada: xmm0 * [18.8515625, 18.6875]
    const lane0_mul = v * pairMul[0];
    const lane1_mul = v * pairMul[1];
    // @0x00105ae2: xmm0 + [0.8359375, 1.0]
    const lane0 = lane0_mul + pairAdd[0];
    const lane1 = lane1_mul + pairAdd[1];
    // @0x00105aea..@0x00105af2: xmm0 = lane0 / lane1   (scalar; xmm0[0] = xmm0[0]/xmm1[0]
    //   with xmm1 having lane0=xmm0[1], lane1=xmm0[1] via unpckhpd)
    v = lane0 / lane1;
    // @0x00105af6..@0x00105afe: v = pow(v, PQ_M2)
    v = Math.pow(v, pqM2);
    return v;
  }

  /**
   * HGRGB_EETF::GetOutput(HGRenderer* renderer) @Helium @0x00105ba0.
   *
   * Body:
   *   r14 = this.subA                                      (@0x00105baa)
   *   got = renderer->GetInput(this, 0)                     (@0x00105bb9)
   *   subA.SetInput(0, got)              ; vcall *0x78     (@0x00105bc9)
   *   subB.SetInput(0, this.subA)         ; vcall *0x78     (@0x00105bdf)
   *   subB.SetParameter(0, params4[0..3])  ; vcall *0x60    (@0x00105c04)
   *     args: (0, selfParams4[0], selfParams4[1], 0.0f, 0.0f)  ; xmm2=xmm3=0
   *   subB.SetParameter(1, selfParams4[2], selfParams4[3],
   *                     selfParams2[0], selfParams2[1])   (@0x00105c36)
   *   subC.SetInput(0, this.subB)         ; vcall *0x78     (@0x00105c4c)
   *   return this.subC                                     (@0x00105c56)
   */
  GetOutput(renderer: HGRenderer): HGNode {
    // @0x00105baa: r14 = this.subA
    const subA = this.subA;
    // @0x00105bb9: got = renderer->GetInput(this, 0)
    const got = renderer.GetInput(this, 0) as HGNode | null;
    // @0x00105bc9: vcall *0x78 → subA.SetInput(0, got)
    subA.SetInput(0, got);
    // @0x00105bdf: vcall *0x78 → subB.SetInput(0, subA)
    this.subB.SetInput(0, subA);
    // @0x00105c04: vcall *0x60 → subB.SetParameter(0, +0x1b0[0], +0x1b0[1], 0.0, 0.0)
    const subBv = this.subB as unknown as _HGNodeVCalls;
    if (!subBv.SetParameter) {
      throw new Error(
        "HGNode::SetParameter(int,f,f,f,f) @Helium 0x0011cab0 (frontier) " +
          "— called from HGRGB_EETF::GetOutput @0x00105c04"
      );
    }
    subBv.SetParameter(
      0,
      this.selfParams4[0],
      this.selfParams4[1],
      Math.fround(0.0),
      Math.fround(0.0)
    );
    // @0x00105c36: vcall *0x60 → subB.SetParameter(1, +0x1b8, +0x1bc, +0x1c0, +0x1c4)
    subBv.SetParameter(
      1,
      this.selfParams4[2],
      this.selfParams4[3],
      this.selfParams2[0],
      this.selfParams2[1]
    );
    // @0x00105c4c: vcall *0x78 → subC.SetInput(0, this.subB)
    this.subC.SetInput(0, this.subB);
    // @0x00105c56: return this.subC
    return this.subC;
  }

  /**
   * HGRGB_EETF::~HGRGB_EETF() @Helium @0x00105a10 (D0), @0x001059b0 (D1),
   * @0x00105950 (D2).
   *
   * D0 body @0x00105a10..@0x00105a6a:
   *   *(void**)this = 0xa1a740                             (@0x00105a19)
   *   Release subA (if non-null; vcall *0x18)              (@0x00105a23..@0x00105a32)
   *   Release subB (if non-null; vcall *0x18)              (@0x00105a35..@0x00105a44)
   *   Release subC (if non-null; vcall *0x18)              (@0x00105a47..@0x00105a56)
   *   HGNode::~HGNode()(this)                              (@0x00105a5c)
   *   jmp HGObject::operator delete                        (@0x00105a6a)
   */
  destruct(): void {
    // @0x00105a19: vtable reinstall — JS no-op.
    for (const sub of [this.subA, this.subB, this.subC]) {
      if (sub) {
        const v = sub as unknown as _HGNodeVCalls;
        if (typeof v.Release === "function") {
          v.Release();
        } else {
          throw new Error(
            "HGObject::Release() (vtable *0x18) @Helium (frontier) " +
              "— called from HGRGB_EETF::~HGRGB_EETF @0x00105a32/@0x00105a44/@0x00105a56"
          );
        }
      }
    }
    // @0x00105a5c: HGNode::~HGNode()(this). @0x00105a6a: operator delete (JS GC).
    this.subA = null as unknown as HGNode;
    this.subB = null as unknown as HGNode;
    this.subC = null as unknown as HGNode;
  }
}
