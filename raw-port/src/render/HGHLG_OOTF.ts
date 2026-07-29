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
  public inner: object;

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
  public luminanceCoeffs: readonly [number, number, number];

  /**
   * +0x1a8 -- the ctor arg `peakDisplayLuminance` stashed verbatim as
   * f64. Ctor @0x100039..@0x10003e:
   *   `movsd -0x20(%rbp), %xmm1 ; movsd %xmm1, 0x1a8(%rbx)`
   * setPeakDisplayLuminance reads it as the "old peak" for the
   * `newPeak / oldPeak` term of its peakScale.
   */
  public peakDisplayLuminance: number;

  /**
   * +0x1b0 -- float32 `gammaMinus1 = gamma - 1`. Ctor @0x100046
   * stores the immediate `movl $0x3e4ccccd, 0x1b0(%rbx)` = f32(+0.2)
   * = 1.2 - 1 (the reference gamma=1.2 case). setPeakDisplayLuminance
   * overwrites it with an adaptive-gamma value from the piecewise HLG
   * system-gamma curve.
   */
  public gammaMinus1: number;

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
  public peakScale: number;

  /* ---------------- ctor: HGHLG::OOTF(CP, peakL) ---------------- */

  /**
   * HGHLG::OOTF::OOTF(HGHLG::OOTF::ColorPrimaries, double) -- Helium
   * @0xfffe0 (C2) / @0x100170 (C1). Both bodies are byte-identical
   * (do NOT tail-jmp): each independently allocates the inner leaf,
   * initialises the class-static luminanceCoeffs row pointer,
   * stashes peakDisplayLuminance, sets gammaMinus1 to f32(+0.2), and
   * computes peakScale = 50.69702849110048 / peak.
   *
   * Transcription (C2 @0xfffe0..@0x100072; C1 @0x100170..@0x100202
   * identical modulo the RIP vtable disp):
   *
   *   HGNode::HGNode(this);                                             @0xfffff5
   *   this->vtable = &_ZTVN5HGHLG4OOTFE + 0x10;                         @0xfffffa/@0x100001
   *     ; leaq 0x91737f(%rip),%rax ; ea = 0x100001+0x91737f = 0xa17380
   *   raw = HGObject::operator new(0x1a0);                              @0x100009
   *   HgcBT2100_HLG_OOTF_InverseOOTF::ctor(raw);                        @0x100014  (SAME leaf as InverseOOTF)
   *   this->0x198 = raw;                                                @0x100019
   *
   *   rax = uint32(esi = ColorPrimaries);                               @0x100020
   *   rax = (rax + 2*rax) = 3*rax;                                      @0x100023
   *   rcx = &luminanceCoeffs;                                           @0x100027  (@Helium 0x3d12d0)
   *   rax = rcx + 4*rax  = &luminanceCoeffs[3*ColorPrimaries];          @0x10002e
   *   this->0x1a0 = rax;                                                @0x100032
   *
   *   xmm1 = arg peakDisplayLuminance (spilled at -0x20(%rbp));         @0x100039
   *   this->0x1a8 = xmm1;   // as f64                                   @0x10003e
   *
   *   this->0x1b0 = f32-bits 0x3e4ccccd (= +0.2 = 1.2 - 1);             @0x100046
   *     ; direct `movl $0x3e4ccccd, 0x1b0(%rbx)` -- no RIP load
   *
   *   xmm0 = 50.69702849110048;                                         @0x100050 (@Helium 0x3d0de0)
   *     ; movsd 0x2d0d88(%rip),%xmm0  ; ea = 0x100058+0x2d0d88 = 0x3d0de0
   *   xmm0 = 50.69702849110048 / peak;   // xmm1 = peak from @0x100039  @0x100058 (divsd %xmm1,%xmm0)
   *   xmm0 = f32(xmm0);                                                 @0x10005c  (cvtsd2ss)
   *   this->0x1b4 = xmm0;   // as f32 movss                             @0x100060
   *
   * 50.69702849110048 = 1000 / 12^1.2 = reference-gamma forward-
   * direction pre-baked normalization. At peak=1000, peakScale =
   * 50.697/1000 ~= 0.050697 = 1/12^1.2 (which is what the *SET*
   * function computes as newPeak*(1/12)^1.2/oldPeak when
   * newPeak=oldPeak). At peak=100, peakScale ~= 0.50697. At
   * peak=10000, peakScale ~= 0.0050697.
   *
   * The unwind tails @0x100073..@0x10009f are exception cleanup: if
   * the inner-node ctor throws they call HGObject::operator delete +
   * HGNode::~HGNode + __Unwind_Resume. In the TS port the inner ctor
   * is a throw-stub, so any exception simply propagates.
   */
  public constructor(colorPrimaries: HGHLG_OOTF_ColorPrimaries, peakDisplayLuminance: number) {
    // @0xfffff5: HGNode::HGNode(this)
    HGNode_ctor_call(this);
    // @0xfffffa/@0x100001: vtable install -- modelled as a no-op here.

    // @0x100009..@0x100019: raw = HGObject::operator new(0x1a0); inner_ctor(raw); this+0x198 = raw
    const raw = HGObject_operator_new(0x1a0);
    HgcBT2100_HLG_OOTF_InverseOOTF_ctor(raw);
    this.inner = raw;

    // @0x100020..@0x100032: this+0x1a0 = &luminanceCoeffs[3*ColorPrimaries]
    // Model the raw pointer as a fixed row snapshot.
    const cpIdx = (colorPrimaries as unknown as number) >>> 0; // u32 (movl %esi,%r14d then movl %r14d,%eax -- zero-ext)
    // Only rows 0 (BT.709) and 1 (BT.2020) are populated with BT.2100-legal
    // HLG values. The raw asm indexes with u32 and would happily read past
    // the known rows; if a caller passes an out-of-range CP we throw to
    // surface the fact that the ledger table has no decoded row for it.
    const row = HGHLG_OOTF_luminanceCoeffs[cpIdx];
    if (row === undefined) {
      throw new Error(
        "HGHLG::OOTF: ColorPrimaries=" + String(cpIdx) +
        " not decoded in HGHLG_OOTF_luminanceCoeffs (@Helium 0x3d12d0 -- only rows 0 (BT.709) and 1 (BT.2020) transcribed)",
      );
    }
    this.luminanceCoeffs = row;

    // @0x100039..@0x10003e: this+0x1a8 = f64 peakDisplayLuminance
    this.peakDisplayLuminance = peakDisplayLuminance;

    // @0x100046: this+0x1b0 = f32-bits 0x3e4ccccd = +0.2 = 1.2 - 1 (reference gamma=1.2)
    // Bit-pattern 0x3e4ccccd as f32 == 0.20000000298023224f.
    this.gammaMinus1 = Math.fround(0.20000000298023224) /* 0x3e4ccccd */;

    // @0x100050..@0x100060: this+0x1b4 = f32(50.69702849110048 / peak)
    // f64 arithmetic then cvtsd2ss to f32.
    const preBaked = 50.69702849110048;                        // @Helium 0x3d0de0 = 1000 / 12^1.2
    const peakScale_f64 = preBaked / peakDisplayLuminance;     // @0x100058 (divsd %xmm1,%xmm0)
    this.peakScale = Math.fround(peakScale_f64);               // @0x10005c/@0x100060 (cvtsd2ss + movss)
  }

  /* ---------------- setPeakDisplayLuminance --------------------- */

  /**
   * HGHLG::OOTF::setPeakDisplayLuminance(double) -- Helium @0x1000b0.
   * Re-derives (gammaMinus1, peakScale) from a new peak luminance
   * using the piecewise HLG system-gamma curve.
   *
   * Transcription (@0x1000b0..@0x10016c):
   *
   *   xmm2 = peak;                                                       @0x1000b9 (movapd)
   *   ucomisd 400.0, peak            // flags for (peak - 400)            @0x1000bd (@Helium 0x3d0de8)
   *   xmm0 = peak / 1000.0           // pre-compute for both branches     @0x1000c8 (@Helium 0x3cae88)
   *   -0x30(%rbp) = peak;            // spill for later                   @0x1000d0
   *   jb 0x100100                    // peak < 400 (or NaN) -> log2/pow   @0x1000d5
   *   xmm1 = 2000.0;                                                      @0x1000d7 (@Helium 0x3d0df0)
   *   ucomisd xmm2(peak), xmm1(2000) // flags for (2000 - peak)           @0x1000df
   *   jb 0x100100                    // 2000 < peak (or NaN) -> log2/pow  @0x1000e3
   *
   *   ; LOG10 branch (400 <= peak <= 2000, ordered):
   *   xmm0 = log10(peak/1000);                                            @0x1000e5 (_log10)
   *   xmm1 = xmm0;                                                        @0x1000ea (movapd)
   *   xmm1 *= 0.42;                                                       @0x1000ee (@Helium 0x3d0e08)
   *   xmm1 += 1.2;                    // gamma = 1.2 + 0.42*log10(...)    @0x1000f6 (@Helium 0x3d0e00)
   *   jmp 0x100122;                                                       @0x1000fe
   *
   *   ; LOG2/POW branch (peak < 400 or peak > 2000 or NaN):
   * 0x100100:
   *   xmm0 = log2(peak/1000);                                             @0x100100 (_log2)
   *   xmm1 = xmm0;                                                        @0x100105 (movapd)
   *   xmm0 = 1.111;                                                       @0x100109 (@Helium 0x3d0df8)
   *   xmm0 = pow(1.111, log2(peak/1000));                                 @0x100111 (_pow)
   *   xmm1 = xmm0;                                                        @0x100116 (movapd)
   *   xmm1 *= 1.2;                    // gamma = 1.2 * 1.111^log2(...)    @0x10011a (@Helium 0x3d0e00)
   *
   *   ; Common tail (xmm1 = gamma):
   * 0x100122:
   *   xmm0 = -1.0;                                                        @0x100122 (@Helium 0x3ca300)
   *   xmm0 = -1.0 + gamma = gamma - 1;                                    @0x10012a (addsd %xmm1,%xmm0)
   *   -0x20(%rbp) = xmm0;             // spill gammaMinus1                 @0x10012e
   *   xmm0 = 1/12 = 0.0833333333333;                                       @0x100133 (@Helium 0x3d0e10)
   *   xmm0 = pow(1/12, gamma);                                             @0x10013b (_pow)  ; xmm1=gamma is the exponent
   *   xmm1 = peak (reload from -0x30);                                     @0x100140
   *   xmm1 = peak * pow(1/12, gamma);                                      @0x100145 (mulsd %xmm0,%xmm1)
   *   xmm1 = peak * pow(1/12, gamma) / oldPeak;                            @0x100149 (divsd 0x1a8(%rbx),%xmm1)
   *   xmm0 = -0x20(%rbp);              // reload gammaMinus1                @0x100151
   *   xmm0 = {gammaMinus1, peak*(1/12)^gamma/oldPeak} as 2 packed doubles; @0x100156 (unpcklpd %xmm1,%xmm0)
   *   xmm0 = f32x4(xmm0);              // cvtpd2ps -> low 2 lanes = f32s    @0x10015a
   *   *(f64*)(this+0x1b0) = xmm0;      // writes 2 f32 = 8 B in one movlpd @0x10015e
   *     ; this+0x1b0 = f32(gammaMinus1)
   *     ; this+0x1b4 = f32(peak * (1/12)^gamma / oldPeak)
   *
   * FLAG SEMANTICS (matches disasm exactly):
   *   AT&T `ucomisd src, dst` computes flags for `dst - src`.
   *   First test: `ucomisd 400.0, xmm0(peak)` -> flags for `peak - 400`.
   *     CF=1 iff peak < 400 OR NaN. jb -> log2/pow when peak < 400 OR NaN.
   *   Second test: `ucomisd xmm2(peak), xmm1(2000)` -> flags for `2000 - peak`.
   *     CF=1 iff 2000 < peak OR NaN. jb -> log2/pow when peak > 2000 OR NaN.
   *
   *   So LOG10 branch runs iff 400 <= peak <= 2000 AND ordered; NaN and
   *   out-of-range go to LOG2/POW. In TS we mirror ordered semantics with
   *   `!(peak < 400) && !(peak > 2000)`: TRUE for ordered peak in
   *   [400,2000], FALSE for NaN (both `<` and `>` return false), routing
   *   NaN to the LOG2/POW branch exactly as the disasm does.
   *
   * DIFFERENCE FROM HGHLG::InverseOOTF::setPeakDisplayLuminance:
   *   InverseOOTF stores `1/gamma - 1` at 0x1b0 and
   *   `12*(oldPeak/newPeak)^(1/gamma)` at 0x1b4.
   *   OOTF (this)  stores `    gamma - 1` at 0x1b0 and
   *   `newPeak*(1/12)^gamma / oldPeak` at 0x1b4.
   *   Both facades wrap the SAME leaf class; the leaf's shader reads
   *   the two f32 slots and interprets them per-direction.
   */
  public setPeakDisplayLuminance(peak: number): void { // @Helium 0x1000b0
    // The disasm spills `peak` to -0x30(%rbp) (@0x1000d0) BEFORE branching,
    // so both branches read the same original argument even after xmm0 is
    // mutated by the divsd. In TS `peak` is already a local and never mutated.

    // @0x1000bd + @0x1000d5: `ucomisd 400.0, xmm0(peak)` then `jb log2branch`.
    //   jb fires when peak < 400 OR NaN -> log2/pow branch.
    // @0x1000df + @0x1000e3: `ucomisd xmm2(peak), xmm1(2000)` then `jb log2branch`.
    //   jb fires when peak > 2000 OR NaN -> log2/pow branch.
    // LOG10 branch runs when peak in [400, 2000] AND ordered.
    let gamma: number;
    if (!(peak < 400.0) && !(peak > 2000.0)) {
      // LOG10 branch (@0x1000e5..@0x1000fe):
      // gamma = 1.2 + 0.42 * log10(peak / 1000)
      const norm = peak / 1000.0;               // @0x1000c8 (@Helium 0x3cae88 = 1000.0)
      const l = Math.log10(norm);               // @0x1000e5 (_log10)
      gamma = l * 0.42 + 1.2;                   // @0x1000ee/@0x1000f6 (@Helium 0x3d0e08=0.42, 0x3d0e00=1.2)
    } else {
      // LOG2/POW branch (@0x100100..@0x10011a):
      // gamma = 1.2 * 1.111^log2(peak/1000)
      //   (= 1.2 * (peak/1000)^log2(1.111), with log2(1.111) ~= 0.15200309...)
      const norm = peak / 1000.0;               // @0x1000c8 (still -- same divsd, pre-computed above)
      const l2 = Math.log2(norm);               // @0x100100 (_log2)
      const p = Math.pow(1.111, l2);            // @0x100111 (_pow, base=1.111, exp=l2) -- @Helium 0x3d0df8
      gamma = p * 1.2;                          // @0x10011a (@Helium 0x3d0e00 = 1.2)
    }

    // Common tail (@0x100122..@0x10015e):
    // gammaMinus1 = -1.0 + gamma
    const gammaMinus1_f64 = -1.0 + gamma;                                      // @0x100122/@0x10012a (@Helium 0x3ca300 = -1.0)

    // peakScale = newPeak * (1/12)^newGamma / oldPeak
    const invTwelve = 0.08333333333333333;                                     // @Helium 0x3d0e10 = 1/12
    const pw = Math.pow(invTwelve, gamma);                                     // @0x10013b (_pow, base=1/12, exp=gamma)
    const timesPeak = peak * pw;                                               // @0x100145 (mulsd) -- xmm1 reload was peak from -0x30
    const oldPeak = this.peakDisplayLuminance;                                 // @0x100149 divisor: 0x1a8(%rbx), f64
    const peakScale_f64 = timesPeak / oldPeak;                                 // @0x100149 (divsd 0x1a8(%rbx),%xmm1)

    // @0x10015a `cvtpd2ps` -- narrow both to f32 before storing.
    // @0x10015e `movlpd` stores 8 B = 2 f32 side-by-side at this+0x1b0/0x1b4.
    this.gammaMinus1 = Math.fround(gammaMinus1_f64);
    this.peakScale   = Math.fround(peakScale_f64);
  }

  /* ---------------- dtor: HGHLG::~OOTF -------------------------- */

  /**
   * HGHLG::OOTF::~OOTF() -- Helium @0x100240 (D2), @0x100280 (D1),
   * @0x1002c0 (D0 deleting). All three re-install the base
   * HGHLG::OOTF vtable at (this) (each computes next_ip + disp =
   * 0xa17380), then load the inner HgcBT2100_HLG_OOTF_InverseOOTF
   * pointer from this+0x198 and -- if non-null -- call
   * *(inner_vtable + 0x18)(inner). Finally D1/D2 tail-jmp to
   * HGNode::~HGNode(); D0 additionally calls HGNode::~HGNode inline
   * and tail-jmps to HGObject::operator delete(this).
   *
   *   D2 @0x100240:
   *     leaq 0x917133(%rip),%rax           @0x100246 ; ea = 0x10024d + 0x917133 = 0xa17380
   *     movq %rax, (%rdi)                  @0x10024d
   *     rax = this->0x198                  @0x100250
   *     if (rax) { rcx = *rax ; (*(rcx+0x18))(rax); }  @0x100257..@0x100268
   *     tail-jmp HGNode::~HGNode(this)     @0x100271
   *     ; unwind: ___clang_call_terminate  @0x100279
   *
   *   D1 @0x100280: byte-identical body to D2 modulo the vtable disp
   *     (@0x100286 leaq 0x9170f3(%rip) -> 0x10028d + 0x9170f3 = 0xa17380).
   *
   *   D0 @0x1002c0:
   *     same vtable install (leaq 0x9170b0(%rip) @0x1002c9 -> 0xa17380);
   *     same inner->vtable[0x18] tear-down (@0x1002dd..@0x1002e2);
   *     inline HGNode::~HGNode(this)       @0x1002e8;
   *     tail-jmp HGObject::operator delete @0x1002f6.
   *
   * The inner-node's vtable slot +0x18 is
   * `~HgcBT2100_HLG_OOTF_InverseOOTF` (per HGNode's canonical vtable:
   * *0x18 = D0 deleting dtor). JS/TS doesn't have manual delete; the
   * whole ownership graph is subsumed by GC. We model destroy() as a
   * manual method for symmetry with the port. (If a caller ever needs
   * a semantic dtor beyond GC -- e.g. to trigger the vtable+0x18 call
   * for parity -- swap the body for a throw citing
   * @Helium 0x100265 / 0x1002a5 / 0x1002e2.)
   */
  public destroy(): void { // @Helium 0x1002c0 (D0) / 0x100240 (D2) / 0x100280 (D1)
    void this.inner;
  }

  /* ---------------- GetOutput ---------------------------------- */

  /**
   * HGHLG::OOTF::GetOutput(HGRenderer* r) -- Helium @0x100310.
   * Structurally byte-identical to HGHLG::InverseOOTF::GetOutput
   * (@0x1006f0) -- both wrap the SAME leaf class; the direction is
   * encoded in the leaf's parameter interpretation.
   *
   * Transcription (@0x100310..@0x100396):
   *
   *   r14 = this->0x198;                                             @0x10031a
   *   rdi = r ; rsi = this ; edx = 0;
   *   rax = HGRenderer::GetInput(r, this, 0);                        @0x100329
   *   rcx = *r14 (inner vtable);
   *   (*(rcx+0x78))(r14, slot= 0, rax);                              @0x100339  ; SetInput
   *
   *   rdi = this->0x198;                                             @0x10033c
   *   rax = this->0x1a0;      // luminanceCoeffs row pointer          @0x100343
   *   xmm0 = *(f32*)(rax+0);  // Kr                                   @0x10034a
   *   xmm1 = *(f32*)(rax+4);  // Kg                                   @0x10034e
   *   xmm2 = *(f32*)(rax+8);  // Kb                                   @0x100353
   *   rax = *rdi (inner vtable);
   *   xmm3 = 0;   esi = 0;
   *   (*(rax+0x60))(rdi, slot= 0, Kr, Kg, Kb, 0);                     @0x100360  ; SetParameter
   *
   *   rdi = this->0x198;                                             @0x100363
   *   xmm0 = *(f32*)(this+0x1b0);   // gammaMinus1                    @0x10036a
   *   xmm1 = *(f32*)(this+0x1b4);   // peakScale                      @0x100372
   *   rax = *rdi;
   *   xmm2 = 0 ; xmm3 = 0 ; esi = 1;
   *   (*(rax+0x60))(rdi, slot= 1, gammaMinus1, peakScale, 0, 0);      @0x100388  ; SetParameter
   *
   *   rax = this->0x198;   // return the leaf                         @0x10038b
   *   ret;
   *
   * The four vtable calls (GetInput, SetInput slot, two SetParameter
   * slots) are frontier -- see the throwing stubs above. Once
   * HGRenderer + HgcBT2100_HLG_OOTF_InverseOOTF land, this method is
   * fully wired without further changes.
   */
  public GetOutput(r: HGRenderer): object { // @Helium 0x100310
    // @0x10031a: r14 = this->0x198 (inner)
    const inner = this.inner;

    // @0x100329: source = HGRenderer::GetInput(r, this, 0)
    const source = HGRenderer_GetInput(r, this as unknown as HGNodeLike, 0);

    // @0x100339: inner->vtable[0x78](inner, 0, source) -- SetInput
    HgcBT2100_HLG_OOTF_InverseOOTF_SetInput(inner, 0, source);

    // @0x10034a..@0x100360: load (Kr, Kg, Kb) f32 triple from luminanceCoeffs row and dispatch SetParameter(0, ...)
    // In the raw asm each f32 load is a single `movss` from *(row+0/4/8).
    const [Kr, Kg, Kb] = this.luminanceCoeffs;
    HgcBT2100_HLG_OOTF_InverseOOTF_SetParameter(
      inner,
      0,
      Kr,                    // f32 (row[0])                @0x10034a
      Kg,                    // f32 (row[1])                @0x10034e
      Kb,                    // f32 (row[2])                @0x100353
      Math.fround(0.0),      // f32 0 (xorps xmm3)          @0x10035b
    );

    // @0x10036a..@0x100388: load (gammaMinus1, peakScale) f32 pair and dispatch SetParameter(1, ...)
    HgcBT2100_HLG_OOTF_InverseOOTF_SetParameter(
      inner,
      1,
      this.gammaMinus1,      // f32 (this+0x1b0)             @0x10036a
      this.peakScale,        // f32 (this+0x1b4)             @0x100372
      Math.fround(0.0),      // f32 0 (xorps xmm2)          @0x10037d
      Math.fround(0.0),      // f32 0 (xorps xmm3)          @0x100380
    );

    // @0x10038b: return this->0x198 (the leaf)
    return this.inner;
  }
}
