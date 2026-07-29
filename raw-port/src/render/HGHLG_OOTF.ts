// raw-port/src/render/HGHLG_OOTF.ts
//
// FCP `HGHLG::OOTF` — a nested facade class in Helium's `HGHLG`
// (Hybrid Log-Gamma, BT.2100) namespace. It is a THIN wrapper around
// the leaf render node `HgcBT2100_HLG_OOTF_InverseOOTF` (the SAME
// leaf shared with `HGHLG::InverseOOTF` — the leaf is parameterised
// at run time via SetParameter slot 1). The ctor allocates an inner
// HgcBT2100_HLG_OOTF_InverseOOTF, stashes it at `this+0x198`, records
// a pointer into the class-static `HGHLG::OOTF::luminanceCoeffs`
// table at `this+0x1a0` (the RGB->Y row selected by the
// `HGHLG::OOTF::ColorPrimaries` enum argument), caches the ctor peak
// luminance (double) at `this+0x1a8`, and pre-computes the two f32
// parameter slots at `this+0x1b0` (`gammaMinus1`) and `this+0x1b4`
// (`peakScale`) for the reference gamma=1.2 case.
// `setPeakDisplayLuminance` re-derives (`gammaMinus1`, `peakScale`)
// with a piecewise HLG-adaptive gamma. `GetOutput` then wires up the
// inner leaf's parameters — hg_Params[0] = (Kr, Kg, Kb, 0) from the
// luminanceCoeffs row, hg_Params[1] = (gammaMinus1, peakScale, 0, 0)
// — and returns the inner node as the produced output.
//
// This is the *scene-light -> display-light* forward direction of the
// BT.2100 HLG OOTF (the inverse is `HGHLG::InverseOOTF`, ported at
// raw-port/src/render/HGHLG_InverseOOTF.ts — READ IT for the closest
// structural template; the differences are called out below).
//
// The three-parameter (Kr, Kg, Kb, gamma, alpha) description of the
// HLG OOTF applies system gamma `Y_d = alpha * Y_s^gamma` (forward
// direction). The two baked f32 slots delivered to the leaf are:
//
//     gammaMinus1 = gamma - 1                   (per-channel exponent
//                                                reparameterised as `x^gamma = x * x^(gamma-1)`)
//     peakScale   = newPeak * (1/12)^gamma / oldPeak   (setPeakDisplayLuminance)
//                 = (1000 / 12^1.2) / peak     (ctor, reference gamma = 1.2 case)
//
// (Ctor and setPeakDisplayLuminance compute peakScale via DIFFERENT
// closed forms — see the DECODED CONSTANTS section below for the exact
// asm-derived expressions.)
//
// The gamma itself is selected by `setPeakDisplayLuminance` from the
// peak-luminance argument (piecewise, ITU-R BT.2100 "System gamma"):
//     gamma = 1.2 + 0.42 * log10(Lw / 1000)         for 400 <= Lw <= 2000  (log10 branch)
//     gamma = 1.2 * 1.111^log2(Lw / 1000)           otherwise              (log2/pow branch)
// (the log2/pow branch simplifies to gamma = 1.2*(Lw/1000)^log2(1.111) with
// log2(1.111) ~= 0.15200309...; both branches agree at Lw = 1000 -> gamma = 1.2.)
//
// FRAMEWORK: Helium.framework (x86_64 slice; fat-slice offset 0x4000;
// the thin binary at /tmp/Helium.x86_64 has VA==file offset, so every
// RIP-relative constant address below is a direct file offset).
//
// SYMBOLS (Helium x86_64):
//   0x0000fffe0  HGHLG::OOTF::OOTF(HGHLG::OOTF::ColorPrimaries, double)  [C2 base ctor]
//   0x000100170  HGHLG::OOTF::OOTF(HGHLG::OOTF::ColorPrimaries, double)  [C1 complete ctor]
//   0x0001000b0  HGHLG::OOTF::setPeakDisplayLuminance(double)
//   0x000100240  HGHLG::OOTF::~OOTF()   [D2 base dtor]
//   0x000100280  HGHLG::OOTF::~OOTF()   [D1 complete dtor -- byte-identical to D2 modulo vtable disp]
//   0x0001002c0  HGHLG::OOTF::~OOTF()   [D0 deleting dtor]
//   0x000100310  HGHLG::OOTF::GetOutput(HGRenderer*)
//   0x000a17380  vtable  __ZTVN5HGHLG4OOTFE                     (ea from `leaq 0x91737f(%rip),%rax`
//                                                                @0xfffffa -> 0x100001+0x91737f =
//                                                                0xa17380; ctor installs &vtable+0x10
//                                                                at this+0x00)
//   0x0003d12d0  data    __ZN5HGHLG4OOTF15luminanceCoeffsE       (class-static Kr/Kg/Kb table --
//                                                                SAME table used by HGHLG::InverseOOTF)
//
// DECODES (all under raw-port/re/disasm/):
//   Helium.HGHLG_OOTF.__ZN5HGHLG4OOTFC2ENS0_14ColorPrimariesEd.s  (@0xfffe0)
//   Helium.HGHLG_OOTF.__ZN5HGHLG4OOTFC1ENS0_14ColorPrimariesEd.s  (@0x100170)
//   Helium.HGHLG_OOTF.__ZN5HGHLG4OOTF23setPeakDisplayLuminanceEd.s (@0x1000b0)
//   Helium.HGHLG_OOTF.__ZN5HGHLG4OOTF9GetOutputEP10HGRenderer.s   (@0x100310)
//   Helium.HGHLG_OOTF.__ZN5HGHLG4OOTFD2Ev.s                        (@0x100240)
//   Helium.HGHLG_OOTF.__ZN5HGHLG4OOTFD1Ev.s                        (@0x100280)
//   Helium.HGHLG_OOTF.__ZN5HGHLG4OOTFD0Ev.s                        (@0x1002c0)
//
// LAYOUT (inherits HGNode; sizeof HGNode header >= 0x1b8) -- BYTE-IDENTICAL
// to HGHLG::InverseOOTF (same fields, same offsets; only the two f32 slots
// carry different SEMANTICS: 0x1b0 = gammaMinus1 (not invGammaMinus1);
// 0x1b4 = peakScale computed with a forward-direction closed form):
//   +0x000  vtable ptr                             (ctor @0xfffffa/@0x100001:
//                                                   `leaq 0x91737f(%rip),%rax ; movq %rax, (%rbx)` ->
//                                                   ea = 0x100001+0x91737f = 0xa17380
//                                                   = &__ZTVN5HGHLG4OOTFE + 0x10)
//   +0x198  HgcBT2100_HLG_OOTF_InverseOOTF* inner  (C2 @0x100004..@0x100019:
//                                                   `HGObject::operator new(0x1a0)` +
//                                                   `HgcBT2100_HLG_OOTF_InverseOOTF::HgcBT2100_HLG_OOTF_InverseOOTF()`
//                                                   -- SAME leaf as InverseOOTF; the direction is
//                                                   selected purely by the parameter values --
//                                                   stashed at this+0x198)
//   +0x1a0  const float* luminanceCoeffs           (C2 @0x100020..@0x100032:
//                                                   `rax = ColorPrimaries` (u32 arg in %esi);
//                                                   `leaq (rax,rax,2),rax`  -> rax = 3*CP;
//                                                   `leaq luminanceCoeffs(%rip),%rcx`;
//                                                   `leaq (rcx,rax,4),rax` -> rax = &luminanceCoeffs[3*CP];
//                                                   stored at this+0x1a0. Each row is 3 f32 = 12 B.)
//   +0x1a8  double peakDisplayLuminance            (C2 @0x100039..@0x10003e: the ctor arg
//                                                   peakDisplayLuminance (xmm0, spilled to
//                                                   -0x20(%rbp)) is stored as f64 at this+0x1a8.
//                                                   Kept verbatim so setPeakDisplayLuminance can
//                                                   compute `newPeak / oldPeak`.)
//   +0x1b0  float32 gammaMinus1                    (C2 @0x100046: `movl $0x3e4ccccd, 0x1b0(%rbx)`
//                                                   = f32(+0.2) = 1.2 - 1. Overwritten as
//                                                   f32(gamma - 1) by setPeakDisplayLuminance.
//                                                   [NB: InverseOOTF stores 0xbe2aaaab = f32(-1/6)
//                                                    = 1/1.2 - 1 here; that is the only immediate
//                                                    difference between the two ctors.])
//   +0x1b4  float32 peakScale                      (C2 @0x100050..@0x100060:
//                                                   `xmm0 = 50.69702849110048 ; xmm0 /= peak
//                                                   (xmm1 spill of arg) ; f32(xmm0) -> this+0x1b4`.
//                                                   50.697028... = 1000 / 12^1.2 = reference-gamma
//                                                   forward-direction normalization.
//                                                   Overwritten by setPeakDisplayLuminance to
//                                                   f32(newPeak * (1/12)^newGamma / oldPeak) using
//                                                   the updated adaptive gamma.)
//
// DECODED CONSTANTS (from /tmp/Helium.x86_64; VA == file offset; every
// RIP-relative operand ea = next_ip + disp32; every value re-read from
// the binary):
//
//   Ctor @0xfffe0 (all f64 unless marked):
//     0x3d0de0 : 50.69702849110048   (= 1000 / 12^1.2 -- reference-gamma ctor pre-baked
//                                        normalization; `movsd 0x2d0d88(%rip)` @0x100050 ->
//                                        0x100058 + 0x2d0d88 = 0x3d0de0)
//     u32 0x3e4ccccd : f32(+0.2)     (= 1.2 - 1 -- direct immediate `movl $0x3e4ccccd,
//                                        0x1b0(%rbx)` @0x100046 -- no memory load)
//
//   setPeakDisplayLuminance @0x1000b0 (all f64):
//     0x3d0de8 : 400.0               (log10-branch lower bound; `ucomisd 0x2d0d23(%rip)`
//                                        @0x1000bd -> 0x1000c5 + 0x2d0d23)
//     0x3cae88 : 1000.0              (peak-normalisation divisor `Lw / 1000`;
//                                        `divsd 0x2cadb8(%rip)` @0x1000c8 -> 0x1000d0 + 0x2cadb8)
//     0x3d0df0 : 2000.0              (log10-branch upper bound; `movsd 0x2d0d11(%rip)` @0x1000d7
//                                        into xmm1 for `ucomisd xmm1(2000), xmm2(peak)`)
//     0x3d0e08 : 0.42                (log10-branch slope; `mulsd 0x2d0d12(%rip)` @0x1000ee)
//     0x3d0e00 : 1.2                 (log10-branch DC term / log2-branch scale;
//                                        `addsd 0x2d0d02(%rip)` @0x1000f6 and
//                                        `mulsd 0x2d0cde(%rip)` @0x10011a both address it)
//     0x3d0df8 : 1.111               (log2/pow-branch base -- `movsd 0x2d0ce7(%rip)` @0x100109
//                                        into xmm0 as `pow(1.111, log2(peak/1000))`)
//     0x3ca300 : -1.0                (`gamma - 1` computed as `-1.0 + gamma`;
//                                        `movsd 0x2ca1d6(%rip)` @0x100122 -> 0x10012a + 0x2ca1d6;
//                                        then `addsd %xmm1, %xmm0` @0x10012a with xmm1=gamma)
//     0x3d0e10 : 0.08333333333333333 (= 1/12 -- forward-direction peak-scale base;
//                                        `movsd 0x2d0cd5(%rip)` @0x100133 into xmm0 for
//                                        `pow(1/12, newGamma)`)
//     (this+0x1a8) : oldPeak (f64)   (`divsd 0x1a8(%rbx), %xmm1` @0x100149 -- new/old ratio
//                                        built as `xmm1 = xmm1 / oldPeak`)
//
//   luminanceCoeffs table @0x3d12d0 (all f32; each row = 3 f32 = 12 B):
//     row 0 (BT.709):  0.212639, 0.715169, 0.072192   (sum 1.0)             @0x3d12d0
//     row 1 (BT.2020): 0.262700, 0.677998, 0.059302   (sum 1.0)             @0x3d12dc
//     (SAME table used by HGHLG::InverseOOTF; only rows 0/1 are BT.2100-legal.)
//
//   GetOutput @0x100310 (all f32; loads from the layout offsets above) -- BYTE-IDENTICAL
//   in shape to HGHLG::InverseOOTF::GetOutput (@0x1006f0), which is expected since
//   both wrap the SAME leaf; the direction is encoded in the leaf's parameter
//   interpretation, not in the vtable dispatch:
//     this+0x1a0[0..2] -> (Kr, Kg, Kb) via three `movss`  @0x10034a..@0x100353
//     this+0x1b0/1b4  -> (gammaMinus1, peakScale) via two `movss` @0x10036a/@0x100372
//     both SetParameter vtable dispatches use slot +0x60 (HGNode::SetParameter),
//     with `esi = 0` for slot 0 (Kr,Kg,Kb,0) and `esi = 1` for slot 1
//     (gammaMinus1, peakScale, 0, 0).
//
// UNDECODED CALLEES / FRONTIER (each gets a throwing stub citing its @0xADDR):
//   HGNode::HGNode()                                             @Helium 0xfffff5 / 0x100185
//   HGObject::operator new(size_t)                               @Helium 0x100009 / 0x100199
//   HgcBT2100_HLG_OOTF_InverseOOTF::HgcBT2100_HLG_OOTF_InverseOOTF()
//                                                                @Helium 0x100014 / 0x1001a4
//   HGObject::operator delete(void*)                             @Helium 0x100079 / 0x1002f6
//   HGNode::~HGNode()                                            @Helium 0x100081 / 0x100094 /
//                                                                 0x100271 / 0x1002b1 / 0x1002e8
//   HGRenderer::GetInput(HGNode*, int)                           @Helium 0x100329
//   HgcBT2100_HLG_OOTF_InverseOOTF vtable +0x18 (dtor slot)      @Helium 0x100265 / 0x1002a5 / 0x1002e2
//   HgcBT2100_HLG_OOTF_InverseOOTF vtable +0x78 (SetInput slot)  @Helium 0x100339
//   HgcBT2100_HLG_OOTF_InverseOOTF vtable +0x60 (SetParameter slot)
//                                                                @Helium 0x100360 / 0x100388
//   `__Unwind_Resume`                                            @Helium 0x100089 / 0x10009c
//   `___clang_call_terminate`                                    @Helium 0x100279 / 0x1002b9 / 0x1002fe
//
// The two vtable slots at +0x60 (SetParameter) and +0x78 (SetInput) on
// `HgcBT2100_HLG_OOTF_InverseOOTF` match the canonical `HGNode` vtable
// layout (see HGNode.ts: *0x60 = `HGNode::SetParameter(int, float,
// float, float, float)`, *0x78 = `HGNode::SetInput(int, HGNode*)`).
// The dispatch here is faithful to the asm: we don't collapse it into
// a string-enum.

/* ------------------------------------------------------------------ */
/* Opaque frontier types -- resolved by companion ports.               */
/* ------------------------------------------------------------------ */

export interface HGRenderer {} // @Helium (declared in HGRenderer.ts)
export interface HGNodeLike {} // @Helium (declared in HGNode.ts)

/**
 * `HGHLG::OOTF::ColorPrimaries` -- nested enum on the OOTF class used
 * as the row-selector into `HGHLG::OOTF::luminanceCoeffs`. Two
 * HLG-legal values per BT.2100. The u32 value is the raw enum ordinal.
 *
 * NOTE: `HGHLG::InverseOOTF` re-uses this exact enum (its mangled type
 * name is `HGHLG::OOTF::ColorPrimaries` in the InverseOOTF ctor
 * signature) -- there is only ONE enum. We keep a second export here
 * (HGHLG_OOTF_ColorPrimaries) mirroring the one in HGHLG_InverseOOTF.ts
 * because raw-port has a "no cross-file reaching into internals" rule
 * (PORTING_SPEC Rule 6); the two definitions are semantically the same
 * enum and each row of the shared luminanceCoeffs table is addressed
 * by the same ordinal.
 */
export enum HGHLG_OOTF_ColorPrimaries { // @Helium 0x3d12d0 (table rows)
  BT709 = 0,
  BT2020 = 1,
}

/* ------------------------------------------------------------------ */
/* HGHLG::OOTF::luminanceCoeffs -- the class-static Kr,Kg,Kb table.    */
/* Eagerly baked from Helium /tmp/Helium.x86_64 @0x3d12d0..0x3d12e7    */
/* (each row = 3 consecutive f32).                                     */
/*                                                                     */
/* This is the SAME table used by HGHLG::InverseOOTF (see              */
/* HGHLG_InverseOOTF.ts). We re-declare it here to keep the two class  */
/* ports self-contained per PORTING_SPEC Rule 6 (no cross-file reach); */
/* both point at the same Helium address (0x3d12d0) so any future      */
/* update MUST update both sites in lockstep.                          */
/* ------------------------------------------------------------------ */

/**
 * @Helium 0x3d12d0 -- `HGHLG::OOTF::luminanceCoeffs`
 * (`__ZN5HGHLG4OOTF15luminanceCoeffsE`).
 *
 * Ctor @0x100020..@0x100032 selects the row via
 *     rowPtr = &luminanceCoeffs[3 * uint32(ColorPrimaries)]
 * and stashes it at `this+0x1a0`. GetOutput then reads (Kr, Kg, Kb)
 * via three `movss` from `[rowPtr+0]`, `[rowPtr+4]`, `[rowPtr+8]`.
 */
export const HGHLG_OOTF_luminanceCoeffs: readonly (readonly [number, number, number])[] = [
  // Row 0 -- BT.709 primaries (@Helium 0x3d12d0):
  [Math.fround(0.21263900697231293), Math.fround(0.7151690125465393),  Math.fround(0.0721920058131218)],
  // Row 1 -- BT.2020 primaries (@Helium 0x3d12dc):
  [Math.fround(0.2627000212669372),  Math.fround(0.6779980063438416),  Math.fround(0.05930200219154358)],
] as const;

/* ------------------------------------------------------------------ */
/* Undecoded-frontier stubs (each throws with its @0xADDR).            */
/* ------------------------------------------------------------------ */

/** Base-class ctor called at Helium C2 @0xfffff5 (C1 @0x100185 identical). */
function HGNode_ctor_call(_self: object): void { // @Helium 0xfffff5 / 0x100185
  throw new Error(
    "HGNode::HGNode() not yet transcribed (@Helium 0xfffff5 / 0x100185 -- HGHLG::OOTF C2/C1 base-call)",
  );
}

/** `HGObject::operator new(0x1a0)` allocates the inner HgcBT2100_HLG_OOTF_InverseOOTF. */
function HGObject_operator_new(_bytes: number): object { // @Helium 0x100009 / 0x100199
  throw new Error(
    "HGObject::operator new(unsigned long) not yet transcribed (@Helium 0x100009 / 0x100199 -- HGHLG::OOTF ctor alloc of inner HgcBT2100_HLG_OOTF_InverseOOTF)",
  );
}

/**
 * `HgcBT2100_HLG_OOTF_InverseOOTF::HgcBT2100_HLG_OOTF_InverseOOTF()`
 * -- leaf render-node ctor. `HGHLG::OOTF` shares the SAME leaf class
 * as `HGHLG::InverseOOTF`; the direction is selected purely by the
 * parameter values (gammaMinus1 vs invGammaMinus1) passed via
 * SetParameter slot 1. The asm calls the C1 complete ctor
 * (`__ZN30HgcBT2100_HLG_OOTF_InverseOOTFC1Ev`).
 */
function HgcBT2100_HLG_OOTF_InverseOOTF_ctor(_p: object): void { // @Helium 0x100014 / 0x1001a4
  throw new Error(
    "HgcBT2100_HLG_OOTF_InverseOOTF::HgcBT2100_HLG_OOTF_InverseOOTF() not yet transcribed (@Helium 0x100014 / 0x1001a4 -- HGHLG::OOTF ctor inner-node construction)",
  );
}

/** `HGRenderer::GetInput(HGNode*, int)` fetches the primary input node. */
function HGRenderer_GetInput(
  _r: HGRenderer, _n: HGNodeLike, _idx: number,
): HGNodeLike { // @Helium 0x100329
  throw new Error(
    "HGRenderer::GetInput(HGNode*, int) not yet transcribed (@Helium 0x100329 -- HGHLG::OOTF::GetOutput source-input fetch)",
  );
}

/**
 * Virtual dispatch through the inner HgcBT2100_HLG_OOTF_InverseOOTF's
 * vtable +0x78 (`HGNode::SetInput(int, HGNode*)` per HGNode's
 * canonical vtable).
 */
function HgcBT2100_HLG_OOTF_InverseOOTF_SetInput(
  _inner: object,
  _slot: number,
  _source: HGNodeLike,
): void { // @Helium 0x100339 (vtable +0x78)
  throw new Error(
    "HgcBT2100_HLG_OOTF_InverseOOTF vtable +0x78 (HGNode::SetInput) not yet transcribed (@Helium 0x100339 -- HGHLG::OOTF::GetOutput input wiring)",
  );
}

/**
 * Virtual dispatch through the inner HgcBT2100_HLG_OOTF_InverseOOTF's
 * vtable +0x60 (`HGNode::SetParameter(int, float, float, float,
 * float)` per HGNode's canonical vtable).
 */
function HgcBT2100_HLG_OOTF_InverseOOTF_SetParameter(
  _inner: object,
  _slot: number,
  _x: number,
  _y: number,
  _z: number,
  _w: number,
): void { // @Helium 0x100360 / 0x100388 (vtable +0x60)
  throw new Error(
    "HgcBT2100_HLG_OOTF_InverseOOTF vtable +0x60 (HGNode::SetParameter) not yet transcribed (@Helium 0x100360 / 0x100388 -- HGHLG::OOTF::GetOutput param upload)",
  );
}

/* ------------------------------------------------------------------ */
/* HGHLG::OOTF                                                         */
/* ------------------------------------------------------------------ */

/**
 * `HGHLG::OOTF` -- BT.2100 Hybrid Log-Gamma forward OOTF facade.
 * Nested inside the `HGHLG` C++ namespace in FCP; we expose it as a
 * plain TS class named `HGHLG_OOTF`.
 *
 * Constructs an inner `HgcBT2100_HLG_OOTF_InverseOOTF` leaf render
 * node (the SAME leaf shared with `HGHLG::InverseOOTF`; the direction
 * is selected by the parameter values), pre-computes luminance
 * coefficients and (gammaMinus1, peakScale) using the reference
 * gamma = 1.2 case, and -- on `setPeakDisplayLuminance` -- updates
 * (gammaMinus1, peakScale) with a piecewise HLG-adaptive gamma.
 */
export class HGHLG_OOTF {
  /**
   * +0x198 -- pointer to the leaf `HgcBT2100_HLG_OOTF_InverseOOTF`
   * render node the class wraps. Allocated in the ctor via
   * `HGObject::operator new(0x1a0)` +
   * `HgcBT2100_HLG_OOTF_InverseOOTF::HgcBT2100_HLG_OOTF_InverseOOTF()`
   * @Helium 0x100009..@0x100019.
   */
  public inner!: object;

  /**
   * +0x1a0 -- pointer into `HGHLG::OOTF::luminanceCoeffs` (@Helium
   * 0x3d12d0). Ctor @0x100020..@0x100032:
   *   rax = uint32(ColorPrimaries) ; rax = 3*rax ; rax = &table + 4*rax
   * i.e. `rowPtr = &luminanceCoeffs[3 * uint32(ColorPrimaries)]`.
   * Each row is 3 f32 (12 B): (Kr, Kg, Kb).
   *
   * Modelled as an index into the eagerly-baked
   * `HGHLG_OOTF_luminanceCoeffs` table (row 0 = BT.709,
   * row 1 = BT.2020) rather than a raw pointer; GetOutput reads the
   * three f32s from the row.
   */
  public luminanceCoeffs!: readonly [number, number, number];

  /**
   * +0x1a8 -- the ctor arg `peakDisplayLuminance` stashed verbatim as
   * f64. Ctor @0x100039..@0x10003e:
   *   `movsd -0x20(%rbp), %xmm1 ; movsd %xmm1, 0x1a8(%rbx)`
   * setPeakDisplayLuminance reads it as the "old peak" for the
   * `newPeak / oldPeak` term of its peakScale.
   */
  public peakDisplayLuminance!: number;

  /**
   * +0x1b0 -- float32 `gammaMinus1 = gamma - 1`. Ctor @0x100046
   * stores the immediate `movl $0x3e4ccccd, 0x1b0(%rbx)` = f32(+0.2)
   * = 1.2 - 1 (the reference gamma=1.2 case). setPeakDisplayLuminance
   * overwrites it with an adaptive-gamma value from the piecewise HLG
   * system-gamma curve.
   */
  public gammaMinus1!: number;

  /**
   * +0x1b4 -- float32 `peakScale`. Ctor and setPeakDisplayLuminance
   * compute peakScale via DIFFERENT closed forms:
   *
   *   ctor (@0x100050..@0x100060): `peakScale = f32(50.69702849110048 / peak)`
   *     where 50.69702849110048 = 1000 / 12^1.2 (reference-gamma
   *     pre-baked forward-direction normalization).
   *
   *   setPeakDisplayLuminance (@0x100133..@0x100149):
   *     `peakScale = f32(newPeak * (1/12)^newGamma / oldPeak)`
   *     with newGamma from the adaptive piecewise curve and
   *     oldPeak = this->0x1a8 (the ctor-time peak).
   */
  public peakScale!: number;

  /* ---------------- ctor: HGHLG::OOTF(CP, peakL) ---------------- */

  public constructor(colorPrimaries: HGHLG_OOTF_ColorPrimaries, peakDisplayLuminance: number) {
    // Body populated below via successive edits.
    // @Helium 0xfffe0 (C2) / @0x100170 (C1).
    throw new Error("HGHLG::OOTF ctor body pending @Helium 0xfffe0 (skeleton commit)");
    void colorPrimaries; void peakDisplayLuminance;
  }

  /* ---------------- setPeakDisplayLuminance --------------------- */

  public setPeakDisplayLuminance(peak: number): void { // @Helium 0x1000b0
    // Body populated below via successive edits.
    throw new Error("HGHLG::OOTF::setPeakDisplayLuminance body pending @Helium 0x1000b0 (skeleton commit)");
    void peak;
  }

  /* ---------------- dtor: HGHLG::~OOTF -------------------------- */

  public destroy(): void { // @Helium 0x1002c0 (D0) / 0x100240 (D2) / 0x100280 (D1)
    void this.inner;
  }

  /* ---------------- GetOutput ---------------------------------- */

  public GetOutput(r: HGRenderer): object { // @Helium 0x100310
    // Body populated below via successive edits.
    throw new Error("HGHLG::OOTF::GetOutput body pending @Helium 0x100310 (skeleton commit)");
    void r;
  }
}
