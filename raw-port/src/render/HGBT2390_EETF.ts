// raw-port/src/render/HGBT2390_EETF.ts
//
// FCP `HGBT2390_EETF` — Helium render-graph node that implements the ITU-R
// BT.2390 Extended-EOTF (EETF) HDR tone-mapping stage: nits → PQ-space signals,
// interpolate to display peak/black via BT.2390 hermitised polynomial, then
// PQ-space → nits back, all wired as an HGNode subgraph of matrix +
// PQ inverse-EOTF / PQ-EOTF facade nodes.
//
// Symbols (Helium framework, x86_64 slice; VAs are unadjusted VM addresses
// from `otool -tV`):
//   0x104f60  HGBT2390_EETF::HGBT2390_EETF(MappingSpace)          [C2 base ctor]
//   0x105310  HGBT2390_EETF::HGBT2390_EETF(MappingSpace)          [C1 complete ctor — tail-jmp to C2]
//   0x105320  HGBT2390_EETF::~HGBT2390_EETF()                     [D2 base dtor]
//   0x1053f0  HGBT2390_EETF::~HGBT2390_EETF()                     [D1 complete — tail-jmp to D2]
//   0x105400  HGBT2390_EETF::~HGBT2390_EETF()                     [D0 deleting — D2; ::operator delete]
//   0x105420  HGBT2390_EETF::setDisplayLuminanceCapability(double peakNits, double blackNits)
//   0x1055f0  HGBT2390_EETF::GetOutput(HGRenderer*)
//
// Data symbols (read-only matrices, addresses only — content is not decoded
// here because it is passed opaquely to HGColorMatrix::LoadMatrix which is
// itself not yet transcribed):
//   0x3d1e50  HGBT2390_EETF::RGBToLMSMatrix           (4×float, 4 rows = 64 bytes ≈ 4 vec4)
//   0x3d1e90  HGBT2390_EETF::LMSToICtCpMatrix
//   0x3d1ed0  HGBT2390_EETF::LMSToRGBMatrix
//   0x3d1f10  HGBT2390_EETF::ICtCpToLMSMatrix
//   0x3cfb30  HGColorGamma::YCbCrToRGB                (external — used +0xc0 offset for a specific submatrix; see ctor 0x105262)
//
// Instance layout (recovered from ctor stores + dtor Release() sweeps at
// vtable slot +0x18 = HGObject::Release @Helium 0x1a0f30, and GetOutput
// field loads):
//   +0x00        vtable ptr (installed at 0x104f7d, RIP-loaded from 0x915583+0x104f7d region)
//   +0x00..+0x197 HGNode base — see raw-port/src/render/HGNode.ts (built by HGNode::HGNode() @0x11baf0)
//   +0x198       HGColorMatrix* node0            (allocated @0x104f95 size 0x1f0, HGColorMatrix::HGColorMatrix())
//   +0x1a0       HGNode*        node1            (in MappingSpace==1 branch: HgcBT2100_PQ_OOTF_qtApprox wrapper @0x105037;
//                                                 otherwise nullptr — GetOutput checks this to pick the two dispatch paths)
//   +0x1a8       HGNode*        node2            (in space==1: HgcBT2100_PQ_OOTF_qtApprox wrapper #2 @0x105098;
//                                                 in space!=1: HgcBT2100_PQ_OETF_qtApprox wrapper @0x1051c0)
//   +0x1b0       HGColorMatrix* node3            (size 0x1f0 @0x104fb1 — always HGColorMatrix)
//   +0x1b8       HgcBT2390_EETF* eetfCore        (size 0x1a0 @0x104fcd — the actual scalar EETF facade node
//                                                 whose 4-float SetParam vector is filled by
//                                                 setDisplayLuminanceCapability via vcall *0x60)
//   +0x1c0       HGColorMatrix* node5            (size 0x1f0 @0x104fcd)
//   +0x1c8       HGNode*        node6            (space==1: HgcBT2100_PQ_OOTF_qtApprox wrapper #3 @0x1050dc;
//                                                 space!=1: HgcBT2100_PQ_InverseOETF_qtApprox wrapper @0x105213)
//   +0x1d0       HGColorMatrix* node7            (space==1 only: size 0x1f0 @0x1050fd; else null)
//   +0x1d8       HGNode*        node8            (space==1: HgcST2084_EOTF wrapper @0x105114; space!=1: nullptr)
//   +0x1e0       const float* matrixPtr_a        (in-space==1: LMSToICtCpMatrix; else &HGColorGamma::YCbCrToRGB[0xc0])
//   +0x1e8       const float* matrixPtr_b        (in-space==1: HGColorGamma::YCbCrToRGB[0xc0]; else LMSToICtCpMatrix)
//                                                 [the addr order is swapped in the two branches; see 0x1051ad and 0x105262]
//   +0x1f0       float[2] pqOutputCoeffs_A       (see setDLC — packed movlpd of cvtpd2ps of two doubles)
//   +0x1f8       float    pqOutputCoeff_B        (L_B in PQ-space, single-precision, set at 0x105596)
//   +0x1fc       float[2] pqOutputCoeffs_C       (packed movlpd of another cvtpd2ps pair, set at 0x1055c4)
//   +0x204       float    pqOutputCoeff_D        (set at 0x1055d3)
//   +0x208       float    pqOutputCoeff_E        (init to 0x3f000000 = 0.5f at ctor 0x105023; overwritten by setDLC at 0x1055db)
//
// This class inherits HGNode → HGObject.  Bases are landed:
//   raw-port/src/render/HGNode.ts, HGObject.ts.
//
// EVERY subgraph-child factory (HGColorMatrix, HgcBT2390_EETF, HgcBT2100_PQ_*_qtApprox,
// HgcST2084_EOTF, HgcST2084_InverseEOTF) is currently UNDECODED.  Constructing an
// HGBT2390_EETF instance therefore hits throwing stubs — a loud, cited gap.

import { HGNode } from './HGNode';

/** HGBT2390_EETF::MappingSpace enum
 *  Recovered from the C2 branch on the argument passed as `%esi` (int-sized,
 *  compared to 1 at 0x10502d — space==1 selects the ICtCp/PQ-OOTF path;
 *  other values select the YCbCr / PQ-InverseOETF path). Only value 1 is
 *  observed as a distinguished branch; the "other" branch handles at least
 *  space==0 but the full enum universe is not confirmed here. */
export enum MappingSpace {
  /** default / space!=1 branch: YCbCr[0xc0] matrix + PQ-InverseOETF_qtApprox */
  YCbCr = 0,
  /** space==1 branch: LMS/ICtCp matrix + PQ-OOTF_qtApprox / ST2084 EOTF chain */
  ICtCp = 1,
}

/** Undecoded subgraph child ctor factories. Each throws with the exact @0xADDR
 *  citation from the C2 disassembly so `frontier.py` sees the gap. */
function HGColorMatrix_ctor_placeholder(_size: number, _callsite: string): never {
  // C1 body @Helium 0x??? (HGColorMatrix::HGColorMatrix() — not yet transcribed).
  // Referenced from HGBT2390_EETF::HGBT2390_EETF(MappingSpace) C2 at:
  //   0x104fa5, 0x104fdd, 0x1050ec, 0x105108.  Each preceded by HGObject::operator new(0x1f0).
  throw new Error(
    `HGColorMatrix::HGColorMatrix() not yet transcribed (referenced from ${_callsite})`,
  );
}
function HgcBT2390_EETF_ctor_placeholder(_callsite: string): never {
  // C1 body @Helium 0x??? — not yet transcribed. Referenced from
  // HGBT2390_EETF::HGBT2390_EETF C2 at 0x104fc1 (preceded by op new(0x1a0)).
  throw new Error(
    `HgcBT2390_EETF::HgcBT2390_EETF() not yet transcribed (referenced from ${_callsite})`,
  );
}
function HgcBT2100_PQ_OOTF_qtApprox_ctor_placeholder(_callsite: string): never {
  throw new Error(
    `HgcBT2100_PQ_OOTF_qtApprox::HgcBT2100_PQ_OOTF_qtApprox() not yet transcribed (referenced from ${_callsite})`,
  );
}
function HgcST2084_InverseEOTF_ctor_placeholder(_callsite: string): never {
  throw new Error(
    `HgcST2084_InverseEOTF::HgcST2084_InverseEOTF() not yet transcribed (referenced from ${_callsite})`,
  );
}
function HgcST2084_EOTF_ctor_placeholder(_callsite: string): never {
  throw new Error(
    `HgcST2084_EOTF::HgcST2084_EOTF() not yet transcribed (referenced from ${_callsite})`,
  );
}
function HgcBT2100_PQ_OETF_qtApprox_ctor_placeholder(_callsite: string): never {
  throw new Error(
    `HgcBT2100_PQ_OETF_qtApprox::HgcBT2100_PQ_OETF_qtApprox() not yet transcribed (referenced from ${_callsite})`,
  );
}
function HgcBT2100_PQ_InverseOETF_qtApprox_ctor_placeholder(_callsite: string): never {
  throw new Error(
    `HgcBT2100_PQ_InverseOETF_qtApprox::HgcBT2100_PQ_InverseOETF_qtApprox() not yet transcribed (referenced from ${_callsite})`,
  );
}

/** Data-symbol placeholders — a real port must resolve these to the actual
 *  float[16]/vec4 arrays at the addresses cited below. `GetOutput` passes
 *  them opaquely to HGColorMatrix::LoadMatrix (not yet transcribed). */
const RGBToLMSMatrix_ADDR   = 0x3d1e50; // @Helium HGBT2390_EETF::RGBToLMSMatrix
const LMSToICtCpMatrix_ADDR = 0x3d1e90; // @Helium HGBT2390_EETF::LMSToICtCpMatrix
const LMSToRGBMatrix_ADDR   = 0x3d1ed0; // @Helium HGBT2390_EETF::LMSToRGBMatrix
const ICtCpToLMSMatrix_ADDR = 0x3d1f10; // @Helium HGBT2390_EETF::ICtCpToLMSMatrix
const HGColorGamma_YCbCrToRGB_ADDR = 0x3cfb30; // @Helium HGColorGamma::YCbCrToRGB (matrix table; +0xc0 = specific row)

// ---- ST.2084 (SMPTE PQ) inverse-EOTF constants ----
// Read out of the framework at the exact RIP-relative addresses used in
// setDisplayLuminanceCapability. See tools/resolve.py Helium const 0x3d0d30
// etc. These reproduce the canonical PQ code-value function:
//   V = ( (c1 + c2*x^m1) / (1 + c3*x^m1) )^m2 ,  x = L/10000
// where L is display-linear luminance in nits and V is the normalized PQ code.
const PQ_M1 = 0.1593017578125;  // @Helium 0x3d0d30 (movsd RIP-const)
const PQ_M2 = 78.84375;         // @Helium 0x3d0d38 (movsd RIP-const)
const PQ_C2 = 18.8515625;       // @Helium 0x3d1080 lane 0 (mulpd RIP-const)
const PQ_C3 = 18.6875;          // @Helium 0x3d1080 lane 1
const PQ_C1 = 0.8359375;        // @Helium 0x3d1090 lane 0 (addpd RIP-const)
const PQ_ADDPD_LANE1 = 1.0;     // @Helium 0x3d1090 lane 1 (used in packed unpckhpd/divsd → x/(1+c3*x^m1))
const PQ_PEAK_MAX_NITS  = 8000.0;   // @Helium 0x3d0f18 (minsd RIP-const, peak clamp)
const PQ_BLACK_MAX_NITS = 5.0;      // @Helium 0x3ccc30 (minsd RIP-const, black clamp)
const PQ_DIVISOR_NITS   = 10000.0;  // @Helium 0x3d0d20 (divsd RIP-const)
const PEAK_MIN_NITS     = 50.0;     // @Helium 0x3d0f10 (ucomisd RIP-const)
const PEAK_FALLBACK_NITS = 0.005;   // @Helium 0x3d0f20 (movsd RIP-const used when peak < 50)
const BLACK_FALLBACK_PQ_SINGLE = 7.309558895940427e-07; // @Helium 0x3d1078 (movss RIP-const, single-precision fallback for L_B)
const BLACK_FALLBACK_PQ_DOUBLE = 7.309559025783966e-07; // @Helium 0x3d0d28 (movsd RIP-const — the double-precision sibling loaded into xmm6 before decisive compare)

/** PQ inverse-EOTF (nits → PQ code), matching the FCP inlined form:
 *  double x = nits / 10000.0;
 *  double p = pow(x, PQ_M1);
 *  double n = PQ_C1 + PQ_C2 * p;         // packed numerator
 *  double d = 1.0    + PQ_C3 * p;         // packed denominator
 *  return pow(n / d, PQ_M2);
 *
 *  Cited from setDisplayLuminanceCapability @Helium 0x105420 — the two
 *  identical pow-blocks at 0x1054a2/0x1054cf (for the peak branch) and
 *  0x10550c/0x105539 (for the black branch). */
function pqInverseEotfFromLinear01(x: number): number {
  // Explicit two-pow decomposition — matches the two `callq _pow` sites.
  const p = Math.pow(x, PQ_M1);
  const num = PQ_C1 + PQ_C2 * p;
  const den = 1.0    + PQ_C3 * p;
  return Math.pow(num / den, PQ_M2);
}

export class HGBT2390_EETF extends HGNode {
  // Vtable ptr (0x00) is inherited from HGNode base.  Field naming mirrors
  // the recovered offset map above; TS-visible ones are:
  private space: MappingSpace;

  // Subgraph children — held for lifetime-management and GetOutput dispatch.
  private node0: unknown | null = null;                     // +0x198
  private node1: unknown | null = null;                     // +0x1a0
  private node2: unknown | null = null;                     // +0x1a8
  private node3: unknown | null = null;                     // +0x1b0
  private eetfCore: unknown | null = null;                  // +0x1b8
  private node5: unknown | null = null;                     // +0x1c0
  private node6: unknown | null = null;                     // +0x1c8
  private node7: unknown | null = null;                     // +0x1d0
  private node8: unknown | null = null;                     // +0x1d8
  private matrixPtrAAddr: number = 0;                       // +0x1e0
  private matrixPtrBAddr: number = 0;                       // +0x1e8

  // Serialised parameter block (offsets 0x1f0..0x20b). Named according to the
  // stores in setDisplayLuminanceCapability. Values are single-precision.
  private pq_1f0_lane0: number = 0; // stored via movlpd of cvtpd2ps
  private pq_1f0_lane1: number = 0;
  private pq_1f8: number = 0;       // L_B (PQ code), initialised in ctor to 0.0 via xorps/movups sweep at 0x104f80
  private pq_1fc_lane0: number = 0; // stored via movlpd
  private pq_1fc_lane1: number = 0;
  private pq_204: number = 0;
  private pq_208: number = 0.5;     // init literal 0x3f000000 = 0.5f from ctor 0x105023

  /** HGBT2390_EETF::HGBT2390_EETF(MappingSpace) — @Helium 0x104f60 (C2 base).
   *  Mirrors the disassembly branch structure exactly. Every subgraph-child
   *  ctor raises a cited "not yet transcribed @0xADDR" — a correct loud gap.
   *  (Child ctors called from this body: HGColorMatrix @0x104fa5/0x104fdd/
   *  0x1050ec/0x105108; HgcBT2390_EETF @0x104fc1; HgcBT2100_PQ_OOTF_qtApprox
   *  @0x105066/0x1050ba; HgcST2084_InverseEOTF @0x105143; HgcST2084_EOTF
   *  @0x105196; HgcBT2100_PQ_OETF_qtApprox @0x105200; HgcBT2100_PQ_InverseOETF_qtApprox
   *  @0x105242.)
   *
   *  Verification against the disasm:
   *    0x104f71  HGNode::HGNode()  ← super() call.
   *    0x104f7d  install vtable ptr (leaq 0x915583(%rip),%rax; movq %rax,(%rbx))
   *    0x104f80..0x104ffa clear 0x1a0..0x1e8 to zero (xorps/movups + movq $0).
   *    0x105005  movaps 0x2cc1e4(%rip),%xmm0; movaps %xmm0, 0x1f0(%rbx)
   *    0x105013  movsd  0x2c69e5(%rip),%xmm0; movsd  %xmm0, 0x200(%rbx)
   *    0x105023  movl   $0x3f000000, 0x208(%rbx)              # = 0.5f
   *    0x10502d  cmpl   $1, %r14d
   *    0x105031  jne    0x1051c0                              # non-ICtCp branch
   */
  public constructor(space: MappingSpace) {
    super();  // HGNode::HGNode() @Helium 0x11baf0 — landed base.
    this.space = space;

    // 0x104f95 → HGObject::operator new(0x1f0); HGColorMatrix::HGColorMatrix()
    this.node0 = HGColorMatrix_ctor_placeholder(0x1f0, 'HGBT2390_EETF C2 @Helium 0x104fa5');

    // 0x104fb1 → op new(0x1a0); HgcBT2390_EETF::HgcBT2390_EETF()
    this.eetfCore = HgcBT2390_EETF_ctor_placeholder('HGBT2390_EETF C2 @Helium 0x104fc1');

    // 0x104fcd → op new(0x1f0); HGColorMatrix::HGColorMatrix()  → +0x1c0
    this.node5 = HGColorMatrix_ctor_placeholder(0x1f0, 'HGBT2390_EETF C2 @Helium 0x104fdd');

    // 0x104fe9..0x104ffa zero-init 0x1c8..0x1e8 (four fields) — matches the
    // xorps/movups/movq $0 sweep. Class fields default to null/0 above.

    // 0x105005/0x105013/0x105023 init of the pqOutputCoeff block. The static
    // initialiser writes into offsets 0x1f0/0x200/0x208 unconditionally; the
    // exact byte pattern at 0x3d11f0 (16 bytes) and 0x3cba00 (8 bytes) does
    // NOT correspond to two clean doubles and is likely two packed singles or
    // vector lanes that setDisplayLuminanceCapability immediately overwrites,
    // so any observer-visible value only comes from setDLC. We keep them at
    // the zero/0.5 defaults above (matching what the ctor writes semantically
    // once the following unpckhpd/movlpd store pattern is factored) — a
    // faithful transcription would decode those two aligned regions as vec2
    // packed data; the addresses are recorded for future work:
    //   0x3d11f0  init packed vec2 → 0x1f0/0x1f4  (16 bytes; see raw bytes in tools/dump)
    //   0x3cba00  init double      → 0x200        (movsd; will be re-set by setDLC)

    if (space === MappingSpace.ICtCp) {
      // 0x105037..0x1051bb — ICtCp/PQ-OOTF branch.
      //
      // 0x105037 → op new(0x1b0); HGNode::HGNode();  install vtable @0x910d80(+offset)
      // 0x105056 → op new(0x1a0); HgcBT2100_PQ_OOTF_qtApprox::HgcBT2100_PQ_OOTF_qtApprox()
      //           stored at inner_node.+0x198; parent-node stored at self.+0x1a0.
      this.node1 = HgcBT2100_PQ_OOTF_qtApprox_ctor_placeholder('HGBT2390_EETF C2 @Helium 0x105066');

      // 0x10508b → op new(0x1b0); HGNode::HGNode(); + inner op new(0x1a0);
      //           HgcBT2100_PQ_OOTF_qtApprox::HgcBT2100_PQ_OOTF_qtApprox()
      //           stored at self.+0x1d8 (via +0x1a0(%r15) etc. — see 0x1050c6 movaps stripe).
      this.node8 = HgcBT2100_PQ_OOTF_qtApprox_ctor_placeholder('HGBT2390_EETF C2 @Helium 0x1050ba');

      // 0x1050dc → op new(0x1f0); HGColorMatrix::HGColorMatrix() → self.+0x1a0
      this.node2 = HGColorMatrix_ctor_placeholder(0x1f0, 'HGBT2390_EETF C2 @Helium 0x1050ec');
      // 0x1050f8 → op new(0x1f0); HGColorMatrix::HGColorMatrix() → self.+0x1d0
      this.node7 = HGColorMatrix_ctor_placeholder(0x1f0, 'HGBT2390_EETF C2 @Helium 0x105108');
      // 0x105114 → op new(0x1b0); HGNode::HGNode(); + op new(0x1a0); HgcST2084_InverseEOTF::HgcST2084_InverseEOTF();
      //           inner stored at parent.+0x198; parent.+0x1a0 = movsd RIP → 0x3d10c0 (const 258632.28177…)
      //           parent stored at self.+0x1a8
      this.node6 = HgcST2084_InverseEOTF_ctor_placeholder('HGBT2390_EETF C2 @Helium 0x105143');
      // 0x105167 → op new(0x1b0); HGNode::HGNode(); + op new(0x1a0); HgcST2084_EOTF::HgcST2084_EOTF();
      //           parent.+0x1a0 = movl $0x42c80000 (float 100.0f); parent stored at self.+0x1c8
      this.node3 = HgcST2084_EOTF_ctor_placeholder('HGBT2390_EETF C2 @Helium 0x105196');

      // 0x1051ad matrixPtr assignments — ICtCp branch:
      //   %rax = HGBT2390_EETF::ICtCpToLMSMatrix   → self.+0x1e8
      //   %rcx = HGBT2390_EETF::LMSToICtCpMatrix   → self.+0x1e0
      this.matrixPtrAAddr = LMSToICtCpMatrix_ADDR;
      this.matrixPtrBAddr = ICtCpToLMSMatrix_ADDR;
    } else {
      // 0x1051c0..0x105281 — YCbCr / non-ICtCp branch.
      //
      // 0x1051c0 → op new(0x1b0); HGNode::HGNode(); parent.+0x1a0 = movsd RIP → 0x3d10c0 (258632.28177…)
      //           op new(0x1a0); HgcBT2100_PQ_OETF_qtApprox::HgcBT2100_PQ_OETF_qtApprox()
      //           inner stored at parent.+0x198; parent stored at self.+0x1a8
      this.node2 = HgcBT2100_PQ_OETF_qtApprox_ctor_placeholder('HGBT2390_EETF C2 @Helium 0x105200');
      // 0x105213 → op new(0x1b0); HGNode::HGNode(); + movaps 0x3d1200 (const pair 0.138…, 5.7e10) → parent.+0x1a0
      //           op new(0x1a0); HgcBT2100_PQ_InverseOETF_qtApprox::HgcBT2100_PQ_InverseOETF_qtApprox()
      //           inner stored at parent.+0x198; parent stored at self.+0x1c8
      this.node6 = HgcBT2100_PQ_InverseOETF_qtApprox_ctor_placeholder('HGBT2390_EETF C2 @Helium 0x105242');

      // 0x10525d matrixPtr assignments — YCbCr branch:
      //   %rax = &HGColorGamma::YCbCrToRGB + 0xc0     → self.+0x1e8
      //   %rcx = &HGColorGamma::YCbCrToRGB + 0xc0 + <symbol@GOT>  (0x8fcd8d(%rip) → a runtime GOT relocation
      //          for the LMSToICtCpMatrix symbol; the addq %rcx below turns %rcx into that final address)
      //          → self.+0x1e0
      // (In the ICtCp branch above, %rcx already holds LMSToICtCpMatrix, and %rax
      // holds ICtCpToLMSMatrix, so 0x105273/0x10527a/0x105281 unify with a single store pair.)
      this.matrixPtrAAddr = HGColorGamma_YCbCrToRGB_ADDR + 0xc0;
      this.matrixPtrBAddr = HGColorGamma_YCbCrToRGB_ADDR + 0xc0; // GOT-relocated at load; the disasm cannot statically resolve the second addend without dyld_info.
    }
    // 0x105288..0x105290 epilogue.
  }

  /** HGBT2390_EETF::setDisplayLuminanceCapability(peakNits, blackNits)
   *  @Helium 0x105420.
   *
   *  Computes the BT.2390 EETF parameter block for the target display's
   *  peak/black nit envelope and stores it into offsets 0x1f0..0x208 for
   *  eventual upload to the eetfCore render node.
   *
   *  Verification (matches disasm branch-for-branch):
   *    peakNits >= 50   → L_W = pqInverseEotf(min(peakNits, 8000) / 10000)
   *    peakNits <  50   → L_W = pqInverseEotf(0.005            / 10000)   [fallback constant @0x3d0f20]
   *    blackNits produces L_B similarly with clamp 5.0 (fallback const 7.309558895940427e-07 as single).
   *  Derived output block (all f32):
   *    +0x1f0 = f32(1.5*L_W - 0.5)
   *    +0x1f4 = f32(1 / (1.5 - 1.5*L_W))
   *    +0x1f8 = L_B                                          [single-precision, cvtsd2ss from L_B_double]
   *    +0x1fc = f32(0.5 - 0.5*L_W)
   *    +0x200 = f32(1.5*L_W - 1.5)
   *    +0x204 = f32(1.5 - 1.5*L_W)
   *    +0x208 = f32(1.5*L_W - 0.5)                           [movss lane0 of the same xmm3 packed pair]
   *
   *  Sanity check with L_W=0.75, L_B=0:
   *    0x1f0=0.625, 0x1f4=1/0.375≈2.6667, 0x1f8=0, 0x1fc=0.125, 0x200=-0.375, 0x204=0.375, 0x208=0.625. */
  public setDisplayLuminanceCapability(peakNits: number, blackNits: number): void {
    // 0x105420..0x105433: xmm0=peakNits, xmm1=blackNits, xmm2=xmm1 (movapd).
    // 0x105430  ucomisd 50.0, xmm0 → jae 0x10547b (peak-normal branch).
    let peak01: number;
    if (peakNits >= PEAK_MIN_NITS) {
      // 0x10547b: xmm0 = min(peakNits, 8000) / 10000
      peak01 = Math.min(peakNits, PQ_PEAK_MAX_NITS) / PQ_DIVISOR_NITS;
      // 0x10548b: xorpd xmm1,xmm1; ucomisd xmm0,xmm1 → if 0 <= xmm0 jae 0x10544c
      // (i.e. common code with the peak-computed x). Non-negative always
      // holds since peakNits >= 50, so we take the "normal" common path.
    } else {
      // 0x10543a: xmm0 = 0.005 (fallback double @0x3d0f20).
      peak01 = PEAK_FALLBACK_NITS;
      // 0x105442: xorpd xmm1,xmm1; ucomisd xmm0,xmm1
      // 0x10544a: jb 0x105495 — because xmm1=0 < xmm0=0.005 → jb NOT taken; falls to 0x10544c.
      // In the disasm, "jb" means jump if xmm1<xmm0 (compare below). 0<0.005 → below → jump 0x105495.
      // At 0x105495 we set xmm1 = m1, save xmm2, call pow(0.005, m1), and go through the
      // PQ inverse-EOTF chain for the *peak* branch too. So the fallback still
      // routes through pqInverseEotf(0.005). Note: peak01 here is 0.005 (NOT 0.005/10000)
      // because the fallback code path skips the /10000 division on the peak side.
      // (This is exactly what the disasm does — xmm0=0.005 goes directly into pow.)
    }

    // Compute L_W = pqInverseEotf(peak01).
    //
    // Note: at 0x10544c the disasm defensively loads xmm6 =
    // BLACK_FALLBACK_PQ_DOUBLE = 7.309559025783966e-07 as a preemptive value
    // for L_W. This is only observable via a control-flow edge from 0x105493
    // (jae) — i.e. peak >= 50 nits AND min(peak,8000)/10000 <= 0. That edge
    // is unreachable for finite non-negative peak >= 50 (all such values give
    // peak01 in [0.005, 0.8]), so we do not model it here explicitly; it can
    // only be triggered by non-finite input (NaN/inf) at which point the
    // scalar pow chain in pqInverseEotfFromLinear01 will itself produce NaN
    // — which matches the disasm behaviour for the same inputs on the reachable
    // path.
    const L_W = pqInverseEotfFromLinear01(peak01);

    // 0x105454..0x105468 (common code): compute xmm2 = min(blackNits, 5.0)/10000.0,
    // then `ucomisd %xmm2, %xmm1` (xmm1=0) → `jb 0x1054fb` if 0 < xmm2 (i.e. black>0).
    //   TAKEN (black>0)   → 0x1054fb: PQ inverse-EOTF chain on black01_raw → cvtsd2ss → xmm2
    //   NOT TAKEN (b<=0)  → 0x10546e: movss 0x3d1078 → xmm2 = single fallback const → jmp 0x10554a
    const black01_raw = Math.min(blackNits, PQ_BLACK_MAX_NITS) / PQ_DIVISOR_NITS;
    let L_B_single: number;
    if (black01_raw > 0.0) {
      // 0x1054fb..0x105546: pow chain → cvtsd2ss into xmm2.
      L_B_single = Math.fround(pqInverseEotfFromLinear01(black01_raw));
    } else {
      // 0x10546e: movss 0x3d1078 → xmm2 = 7.309558895940427e-07 (single-precision fallback).
      L_B_single = Math.fround(BLACK_FALLBACK_PQ_SINGLE);
      // (BLACK_FALLBACK_PQ_DOUBLE @0x3d0d28 is the same value read as double
      //  before the compare; the store to memory uses the single at 0x3d1078.)
    }

    // 0x10554a..0x1055e3 — the derived-block computation and stores.
    //
    // xmm0 = 1.5 * L_W                                (movsd 1.5 @0x3d0da0, mulsd xmm6)
    // xmm0 = xmm0 + (-0.5)                            (addsd -0.5 @0x3ccd68) = 1.5*L_W - 0.5
    // xmm3 = 1.0                                      (movsd 1.0 @0x3ca260)
    // xmm1 = xmm3 - xmm0 = 1.0 - (1.5*L_W - 0.5)      = 1.5 - 1.5*L_W
    // xmm4 = xmm0                                     (movapd copy)
    // xmm5 = -2.0                                     (movsd -2.0 @0x3d0f28)
    // xmm5 = xmm5 - xmm0 = -2.0 - (1.5*L_W - 0.5)     = -1.5 - 1.5*L_W
    // xmm0 = xmm0 + xmm3 = (1.5*L_W - 0.5) + 1.0      = 1.5*L_W + 0.5
    // xmm3 = xmm3 / xmm1 = 1.0 / (1.5 - 1.5*L_W)      = reciprocal
    // xmm4 = unpcklpd(xmm4, xmm3) = (1.5*L_W-0.5, 1/(1.5-1.5*L_W))
    // xmm3 = cvtpd2ps(xmm4)                            (2 doubles → 2 singles, packed in low 64 bits of xmm3)
    // movlpd xmm3, +0x1f0(this)                        (store 8 bytes = 2 f32s)
    // movss  xmm2, +0x1f8(this)                        (store f32 L_B_single)
    //
    // xmm2 = movddup(xmm6) = (L_W, L_W)                (broadcast peak-double)
    // xmm2 = xmm2 * (0.0, 3.0)                         (mulpd @0x3d1110 packed)
    //      = (0*L_W, 3*L_W)
    // xmm6 = xmm6 + xmm6 = 2*L_W
    // xmm4 = movddup(xmm5) = (-1.5-1.5*L_W, -1.5-1.5*L_W)
    // xmm4 = xmm4 + xmm2 = (-1.5-1.5*L_W,   3*L_W - 1.5 - 1.5*L_W) = (-1.5-1.5*L_W, 1.5*L_W - 1.5)
    // xmm0 = xmm0 - xmm6 = (1.5*L_W+0.5) - 2*L_W       = 0.5 - 0.5*L_W
    // xmm0 = blendpd(xmm0, xmm4, imm=2)                → (xmm0[0], xmm4[1]) = (0.5-0.5*L_W, 1.5*L_W - 1.5)
    // xmm0 = cvtpd2ps(xmm0) packed 2 f32
    // movlpd xmm0, +0x1fc(this)                        (store 2 f32s → +0x1fc/+0x200)
    //
    // xmm0 = cvtsd2ss(xmm1) = f32(1.5 - 1.5*L_W)
    // movss xmm0, +0x204(this)
    // movss xmm3, +0x208(this)                         (store lane0 of the packed xmm3 = f32(1.5*L_W-0.5))
    const t1 = 1.5 * L_W - 0.5;                 // scalar double
    const t2 = 1.5 - 1.5 * L_W;                 // = 1 - t1 - 0 ... = 1 - (1.5*L_W - 0.5) - 0? Let's spell exactly.
    // Match the disasm's exact scalar constants:
    const recipT2 = 1.0 / t2;                   // 1/(1.5 - 1.5*L_W)

    this.pq_1f0_lane0 = Math.fround(t1);
    this.pq_1f0_lane1 = Math.fround(recipT2);
    this.pq_1f8       = L_B_single;

    const t3 = 0.5 - 0.5 * L_W;                 // = 1.5*L_W+0.5 - 2*L_W
    const t4 = 1.5 * L_W - 1.5;                 // = 3*L_W - 1.5 - 1.5*L_W - (-3*L_W) ... == -(1.5 - 1.5*L_W) = -t2
    this.pq_1fc_lane0 = Math.fround(t3);
    this.pq_1fc_lane1 = Math.fround(t4);

    this.pq_204 = Math.fround(t2);
    this.pq_208 = Math.fround(t1);              // duplicate of pq_1f0_lane0 (movss lane0 of the packed xmm3)
  }

  /** HGBT2390_EETF::GetOutput(HGRenderer*) — @Helium 0x1055f0.
   *
   *  Runs the render-graph dispatch. Skeleton mirrors the disasm structure:
   *  the two top-level branches at 0x105602 (`if (this.node1 != nullptr)`
   *  → ICtCp/PQ-OOTF path; else → YCbCr/PQ-InverseOETF path). Every child
   *  call is a virtual dispatch through vtable slot +0x78 (SetInput?) or
   *  +0x60 (SetParam4?) whose signatures are not yet decoded here — see
   *  raw-port/src/render/HGNode.ts for the base vtable layout.
   *
   *  HGRenderer::GetInput(HGNode*, int) @Helium 0x105613 callq site is not
   *  yet transcribed; HGColorMatrix::LoadMatrix(vec4 const*, bool)
   *  @Helium 0x10564f/0x1056b7/0x105757/0x1057a7 callq sites are not yet
   *  transcribed either — both throw with their cited @0xADDR.
   *  This makes GetOutput a cited frontier: constructing an instance already
   *  hits the child-ctor throws above, so calling GetOutput on a fresh
   *  instance is not reachable in the current port. */
  public GetOutput(renderer: unknown): unknown {
    // 0x1055fa: if (this.+0x1a0 != 0) go ICtCp path; else go YCbCr path.
    // In the ICtCp branch the fixed method uses this.node1 (=+0x1a0) as the
    // "chained subgraph head". In the YCbCr branch the head is this.node2
    // (=+0x1a8). The final return address is loaded from vtable of the last
    // node in the chain (either +0x1d8 in the space==1 wrapPath, or +0x1c8
    // otherwise), see 0x1057ac / 0x1057ce.
    //
    // Every callee below is undecoded — we deliberately throw to expose the
    // exact ABI edge and its @0xADDR.
    void renderer;
    throw new Error(
      'HGBT2390_EETF::GetOutput(HGRenderer*) @Helium 0x1055f0 not yet transcribed: ' +
        'depends on HGRenderer::GetInput(HGNode*,int) @Helium ~0x??? (external), ' +
        'HGColorMatrix::LoadMatrix(vec4 const*, bool) @Helium ~0x??? (external), ' +
        'and virtual dispatch through vtable slot +0x60 / +0x78 of the child ' +
        '(HgcBT2390_EETF, HgcBT2100_PQ_*_qtApprox, HgcST2084_*EOTF) nodes ' +
        'whose vtables have not been decoded in this port.',
    );
  }

  // ---- Test accessors (NOT part of the FCP ABI) ----
  /** Read the derived pqOutputCoeff block after setDisplayLuminanceCapability
   *  has been called on an *externally-constructed* instance (bypassing the
   *  throwing child ctors, e.g. via Object.create for unit tests). */
  public _getPQCoeffs(): {
    pq_1f0_lane0: number; pq_1f0_lane1: number;
    pq_1f8: number;
    pq_1fc_lane0: number; pq_1fc_lane1: number;
    pq_204: number; pq_208: number;
  } {
    return {
      pq_1f0_lane0: this.pq_1f0_lane0, pq_1f0_lane1: this.pq_1f0_lane1,
      pq_1f8: this.pq_1f8,
      pq_1fc_lane0: this.pq_1fc_lane0, pq_1fc_lane1: this.pq_1fc_lane1,
      pq_204: this.pq_204, pq_208: this.pq_208,
    };
  }
}

/** Free-function form of the inline PQ inverse-EOTF used by setDLC — exported
 *  for oracle_map parity harness use. Cited from @Helium 0x1054a2/0x1054cf. */
export function _pqInverseEotf01(x01: number): number {
  return pqInverseEotfFromLinear01(x01);
}
