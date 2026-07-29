// raw-port/src/render/HGHLG_InverseOOTF.ts
//
// FCP `HGHLG::InverseOOTF` — a nested facade class in Helium's `HGHLG`
// (Hybrid Log-Gamma, BT.2100) namespace. It is a THIN wrapper around the
// leaf render node `HgcBT2100_HLG_OOTF_InverseOOTF`: the ctor allocates an
// inner HgcBT2100_HLG_OOTF_InverseOOTF, stashes it at `this+0x198`, records
// a pointer into the class-static `HGHLG::OOTF::luminanceCoeffs` table at
// `this+0x1a0` (the RGB->Y coefficients row selected by the
// `HGHLG::OOTF::ColorPrimaries` enum argument), caches the ctor peak
// luminance (double) at `this+0x1a8`, and pre-computes the two f32
// parameter slots at `this+0x1b0` (`invGammaMinus1`) and `this+0x1b4`
// (`peakScale`) for the reference gamma=1.2 case. `setPeakDisplayLuminance`
// re-derives (`invGammaMinus1`, `peakScale`) with a piecewise HLG-adaptive
// gamma. `GetOutput` then wires up the inner leaf's parameters — hg_Params
// [0] = (Kr, Kg, Kb, 0) from the luminanceCoeffs row, hg_Params[1] =
// (invGammaMinus1, peakScale, 0, 0) — and returns the inner node as the
// produced output.
//
// This is the *display-light -> scene-light* inverse of `HGHLG::OOTF`:
// where OOTF applies system gamma `Y_d = alpha * Y_s^gamma`, InverseOOTF
// inverts it via the same three-parameter (Kr, Kg, Kb, gamma, alpha)
// description. The two baked f32 slots delivered to the leaf are:
//
//     invGammaMinus1 = 1/gamma - 1              (per-channel exponent
//                                                reparameterised as `x^(1/gamma) = x * x^(1/gamma - 1)`)
//     peakScale      = 12 * (Lw_old / Lw_new)^(1/gamma)
//
// with gamma selected by `setPeakDisplayLuminance` from the peak-luminance
// argument (piecewise, ITU-R BT.2100 "System gamma"):
//     gamma = 1.2 + 0.42 * log10(Lw / 1000)         for 400 <= Lw <= 2000  (log10 branch)
//     gamma = 1.2 * 1.111^log2(Lw / 1000)           otherwise              (log2/pow branch)
// (the log2/pow branch simplifies to gamma = 1.2*(Lw/1000)^log2(1.111) with
// log2(1.111) ~= 0.15200309...; both branches agree at Lw = 1000 -> gamma = 1.2.)
//
// FRAMEWORK: Helium.framework (x86_64 slice; fat-slice offset 0x4000; the
// thin binary at /tmp/Helium.x86_64 has VA==file offset, so every
// RIP-relative constant address below is a direct file offset).
//
// SYMBOLS (Helium x86_64):
//   0x0001003a0  HGHLG::InverseOOTF::InverseOOTF(HGHLG::OOTF::ColorPrimaries, double)  [C2 base ctor]
//   0x000100540  HGHLG::InverseOOTF::InverseOOTF(HGHLG::OOTF::ColorPrimaries, double)  [C1 complete ctor -- identical body to C2]
//   0x000100480  HGHLG::InverseOOTF::setPeakDisplayLuminance(double)
//   0x000100620  HGHLG::InverseOOTF::~InverseOOTF()   [D2 base dtor]
//   0x000100660  HGHLG::InverseOOTF::~InverseOOTF()   [D1 complete dtor -- byte-identical to D2 modulo vtable disp]
//   0x0001006a0  HGHLG::InverseOOTF::~InverseOOTF()   [D0 deleting dtor]
//   0x0001006f0  HGHLG::InverseOOTF::GetOutput(HGRenderer*)
//   0x000a175b0  vtable  __ZTVN5HGHLG11InverseOOTFE   (all three ctors/dtors install &vtable+0x10)
//   0x0003d12d0  data    __ZN5HGHLG4OOTF15luminanceCoeffsE  (class-static Kr/Kg/Kb table)
//
// DECODES (all under raw-port/re/disasm/):
//   Helium.HGHLG_InverseOOTF.__ZN5HGHLG11InverseOOTFC2ENS_4OOTF14ColorPrimariesEd.s  (@0x1003a0)
//   Helium.HGHLG_InverseOOTF.__ZN5HGHLG11InverseOOTFC1ENS_4OOTF14ColorPrimariesEd.s  (@0x100540)
//   Helium.HGHLG_InverseOOTF.__ZN5HGHLG11InverseOOTFD2Ev.s                            (@0x100620)
//   Helium.HGHLG_InverseOOTF.__ZN5HGHLG11InverseOOTFD1Ev.s                            (@0x100660)
//   Helium.HGHLG_InverseOOTF.__ZN5HGHLG11InverseOOTFD0Ev.s                            (@0x1006a0)
//   Helium.HGHLG::InverseOOTF.setPeakDisplayLuminance.s                               (@0x100480)
//   Helium.HGHLG::InverseOOTF.GetOutput.s                                             (@0x1006f0)
//
// LAYOUT (inherits HGNode; sizeof HGNode header >= 0x1b8):
//   +0x000  vtable ptr                             (installed via
//                                                   `leaq disp(%rip), %rax ; movq %rax, (%rbx)`
//                                                   in C2 @0x1003ba/@0x1003c1 --
//                                                   ea = 0x1003c1 + 0x9171ff = 0xa175c0
//                                                   = &__ZTVN5HGHLG11InverseOOTFE + 0x10)
//   +0x198  HgcBT2100_HLG_OOTF_InverseOOTF* inner  (C2 @0x1003c4..@0x1003d9:
//                                                   `HGObject::operator new(0x1a0)` +
//                                                   `HgcBT2100_HLG_OOTF_InverseOOTF::HgcBT2100_HLG_OOTF_InverseOOTF()`
//                                                   -> stashed at this+0x198)
//   +0x1a0  const float* luminanceCoeffs           (C2 @0x1003e0..@0x1003f2:
//                                                   `rax = ColorPrimaries` (u32 arg in %esi);
//                                                   `leaq (rax,rax,2),rax`  -> rax = 3*CP;
//                                                   `leaq luminanceCoeffs(%rip),%rcx`;
//                                                   `leaq (rcx,rax,4),rax` -> rax = &luminanceCoeffs[3*CP];
//                                                   stored at this+0x1a0. Each row is 3 f32 = 12 B.)
//   +0x1a8  double peakDisplayLuminance            (C2 @0x1003f9..@0x1003fe:
//                                                   the ctor arg peakDisplayLuminance (xmm0,
//                                                   spilled to -0x20(%rbp)) is stored as f64
//                                                   at this+0x1a8. Kept verbatim so
//                                                   setPeakDisplayLuminance can compute
//                                                   `oldPeak / newPeak`.)
//   +0x1b0  float32 invGammaMinus1                 (C2 @0x100406: `movl $0xbe2aaaab, 0x1b0(%rbx)`
//                                                   = f32(-1/6) = 5/6 - 1 = 1/1.2 - 1. Overwritten
//                                                   as f32(1/gamma - 1) by setPeakDisplayLuminance.)
//   +0x1b4  float32 peakScale                      (C2 @0x100410..@0x100431:
//                                                   `xmm0 = arg peakDisplay ; xmm0 /= 1000.0 ;
//                                                    xmm1 = 0.833333... (= 1/1.2) ; xmm0 = pow(xmm0, xmm1) ;
//                                                    xmm0 *= 12.0 ; f32(xmm0) -> this+0x1b4`.
//                                                   Overwritten by setPeakDisplayLuminance to
//                                                   f32(12*(oldPeak/newPeak)^(1/gamma)) using the
//                                                   updated adaptive gamma.)
//
// DECODED CONSTANTS (from /tmp/Helium.x86_64; VA == file offset; every
// RIP-relative operand ea = next_ip + disp32):
//
//   Ctor @0x1003a0 (all f64 unless marked):
//     0x3cae88 : 1000.0                (= reference peak Lw, used as `Lw / 1000`;
//                                        `divsd 0x2caa70(%rip)` @0x100410 -> 0x100418 + 0x2caa70)
//     0x3d0e18 : 0.833333333333333     (= 5/6 = 1/1.2; exponent for `pow` -- the
//                                        reference-gamma=1.2 inverse. `movsd 0x2d09f8(%rip)` @0x100418)
//     0x3d0e20 : 12.0                  (= HLG "12*E" peak-scene-light scale factor --
//                                        `mulsd 0x2d09f3(%rip)` @0x100425)
//     u32 0xbe2aaaab : f32(-1/6)       (= 1/1.2 - 1; direct immediate `movl $0xbe2aaaab,
//                                        0x1b0(%rbx)` @0x100406 -- no memory load)
//
//   setPeakDisplayLuminance @0x100480 (all f64):
//     0x3d0de8 : 400.0                 (log10-branch lower bound; `ucomisd 0x2d0953(%rip)`
//                                        @0x10048d)
//     0x3cae88 : 1000.0                (peak-normalisation divisor `Lw / 1000`;
//                                        `divsd 0x2ca9e8(%rip)` @0x100498 -- same const as ctor)
//     0x3d0df0 : 2000.0                (log10-branch upper bound; `movsd 0x2d0941(%rip)` @0x1004a7
//                                        into xmm1 for `ucomisd xmm1(2000), xmm2(peak)`)
//     0x3d0e08 : 0.42                  (log10-branch slope `gamma = 1.2 + 0.42*log10(peak/1000)`;
//                                        `mulsd 0x2d0946(%rip)` @0x1004ba)
//     0x3d0e00 : 1.2                   (log10-branch DC term / log2-branch scale;
//                                        `addsd 0x2d0936(%rip)` @0x1004c2 and
//                                        `mulsd 0x2d0916(%rip)` @0x1004e2 both address it)
//     0x3d0df8 : 1.111                 (log2/pow-branch base -- `movsd 0x2d091b(%rip)` @0x1004d5
//                                        into xmm0 as `pow(1.111, log2(peak/1000))`)
//     0x3ca260 : 1.0                   (numerator of `1/gamma`; `movsd 0x2c9d6e(%rip)` @0x1004ea)
//     0x3ca300 : -1.0                  (subtractor for `1/gamma - 1`; `movsd 0x2c9e02(%rip)` @0x1004f6)
//     0x3d0e20 : 12.0                  (peak-scale factor 12 -- `mulsd 0x2d08ff(%rip)` @0x100519,
//                                        same 12.0 as ctor)
//
//   luminanceCoeffs table @0x3d12d0 (all f32; each row = 3 f32 = 12 B):
//     row 0 (BT.709): 0.212639, 0.715169, 0.072192  (sum 1.0)              @0x3d12d0
//     row 1 (BT.2020): 0.262700, 0.677998, 0.059302  (sum 1.0)             @0x3d12dc
//     (subsequent rows exist but are not populated with BT.2100-legal HLG
//     values; the two rows above are the ONLY HLG-legal choices per
//     BT.2100 -- row 0 = BT.709 primaries, row 1 = BT.2020 primaries.)
//
//   GetOutput @0x1006f0 (all f32; loads from the layout offsets above):
//     this+0x1a0[0..2] -> (Kr, Kg, Kb) via three `movss`  @0x10072a..@0x100733
//     this+0x1b0/1b4 -> (invGammaMinus1, peakScale) via two `movss` @0x10074a/@0x100752
//     both SetParameter vtable dispatches use slot +0x60 (HGNode::SetParameter),
//     with `esi = 0` for slot 0 (Kr,Kg,Kb,0) and `esi = 1` for slot 1 (iG-1, scale, 0, 0).
//
// UNDECODED CALLEES / FRONTIER (each gets a throwing stub citing its @0xADDR):
//   HGNode::HGNode()                                             @Helium 0x1003b5 / 0x100555
//   HGObject::operator new(size_t)                               @Helium 0x1003c9 / 0x100569
//   HgcBT2100_HLG_OOTF_InverseOOTF::HgcBT2100_HLG_OOTF_InverseOOTF()
//                                                                @Helium 0x1003d4 / 0x100574
//   HGObject::operator delete(void*)                             @Helium 0x10044a / 0x1005ea / 0x1006d6
//   HGNode::~HGNode()                                            @Helium 0x100452 / 0x100465 /
//                                                                 0x1005f2 / 0x100605 / 0x100651 /
//                                                                 0x100691 / 0x1006c8
//   HGRenderer::GetInput(HGNode*, int)                           @Helium 0x100709
//   HgcBT2100_HLG_OOTF_InverseOOTF vtable +0x18 (dtor slot)      @Helium 0x100645 / 0x100685 / 0x1006c2
//   HgcBT2100_HLG_OOTF_InverseOOTF vtable +0x78 (SetInput slot)  @Helium 0x100719
//   HgcBT2100_HLG_OOTF_InverseOOTF vtable +0x60 (SetParameter slot)
//                                                                @Helium 0x100740 / 0x100768
//   `__Unwind_Resume`                                            @Helium 0x10045a / 0x10046d /
//                                                                 0x1005fa / 0x10060d
//
// The two vtable slots at +0x60 (SetParameter) and +0x78 (SetInput) on
// `HgcBT2100_HLG_OOTF_InverseOOTF` match the canonical `HGNode` vtable
// layout (see HGNode.ts: *0x60 = `HGNode::SetParameter(int, float, float,
// float, float)`, *0x78 = `HGNode::SetInput(int, HGNode*)`). The dispatch
// here is faithful to the asm: we don't collapse it into a string-enum.

/* ------------------------------------------------------------------ */
/* Opaque frontier types -- resolved by companion ports.               */
/* ------------------------------------------------------------------ */

export interface HGRenderer {} // @Helium (declared in HGRenderer.ts)
export interface HGNodeLike {} // @Helium (declared in HGNode.ts)

/**
 * `HGHLG::OOTF::ColorPrimaries` -- nested enum on the OOTF class used as
 * the row-selector into `HGHLG::OOTF::luminanceCoeffs`. Two HLG-legal
 * values per BT.2100. The u32 value is the raw enum ordinal.
 */
export enum HGHLG_OOTF_ColorPrimaries { // @Helium 0x3d12d0 (table rows)
  BT709 = 0,
  BT2020 = 1,
}

/* ------------------------------------------------------------------ */
/* HGHLG::OOTF::luminanceCoeffs -- the class-static Kr,Kg,Kb table.    */
/* Eagerly baked from Helium /tmp/Helium.x86_64 @0x3d12d0..0x3d12e7    */
/* (each row = 3 consecutive f32).                                     */
/* ------------------------------------------------------------------ */

/**
 * @Helium 0x3d12d0 -- `HGHLG::OOTF::luminanceCoeffs` (`__ZN5HGHLG4OOTF15luminanceCoeffsE`).
 *
 * Ctor @0x1003e7..@0x1003f2 selects the row via
 *     rowPtr = &luminanceCoeffs[3 * uint32(ColorPrimaries)]
 * and stashes it at `this+0x1a0`. GetOutput then reads (Kr, Kg, Kb) via
 * three `movss` from `[rowPtr+0]`, `[rowPtr+4]`, `[rowPtr+8]`.
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

/** Base-class ctor called at Helium C2 @0x1003b5 (C1 @0x100555 is identical). */
function HGNode_ctor_call(_self: object): void { // @Helium 0x1003b5 / 0x100555
  throw new Error(
    "HGNode::HGNode() not yet transcribed (@Helium 0x1003b5 / 0x100555 -- HGHLG::InverseOOTF C2/C1 base-call)",
  );
}

/** `HGObject::operator new(0x1a0)` allocates the inner HgcBT2100_HLG_OOTF_InverseOOTF. */
function HGObject_operator_new(_bytes: number): object { // @Helium 0x1003c9 / 0x100569
  throw new Error(
    "HGObject::operator new(unsigned long) not yet transcribed (@Helium 0x1003c9 / 0x100569 -- HGHLG::InverseOOTF ctor alloc of inner HgcBT2100_HLG_OOTF_InverseOOTF)",
  );
}

/** `HgcBT2100_HLG_OOTF_InverseOOTF::HgcBT2100_HLG_OOTF_InverseOOTF()` -- leaf render-node ctor. */
function HgcBT2100_HLG_OOTF_InverseOOTF_ctor(_p: object): void { // @Helium 0x1003d4 / 0x100574
  throw new Error(
    "HgcBT2100_HLG_OOTF_InverseOOTF::HgcBT2100_HLG_OOTF_InverseOOTF() not yet transcribed (@Helium 0x1003d4 / 0x100574 -- HGHLG::InverseOOTF ctor inner-node construction)",
  );
}

/** `HGRenderer::GetInput(HGNode*, int)` fetches the primary input node. */
function HGRenderer_GetInput(
  _r: HGRenderer, _n: HGNodeLike, _idx: number,
): HGNodeLike { // @Helium 0x100709
  throw new Error(
    "HGRenderer::GetInput(HGNode*, int) not yet transcribed (@Helium 0x100709 -- HGHLG::InverseOOTF::GetOutput source-input fetch)",
  );
}

/**
 * Virtual dispatch through the inner HgcBT2100_HLG_OOTF_InverseOOTF's
 * vtable +0x78 (`HGNode::SetInput(int, HGNode*)` per HGNode's canonical
 * vtable).
 */
function HgcBT2100_HLG_OOTF_InverseOOTF_SetInput(
  _inner: object,
  _slot: number,
  _source: HGNodeLike,
): void { // @Helium 0x100719 (vtable +0x78)
  throw new Error(
    "HgcBT2100_HLG_OOTF_InverseOOTF vtable +0x78 (HGNode::SetInput) not yet transcribed (@Helium 0x100719 -- HGHLG::InverseOOTF::GetOutput input wiring)",
  );
}

/**
 * Virtual dispatch through the inner HgcBT2100_HLG_OOTF_InverseOOTF's
 * vtable +0x60 (`HGNode::SetParameter(int, float, float, float, float)`
 * per HGNode's canonical vtable).
 */
function HgcBT2100_HLG_OOTF_InverseOOTF_SetParameter(
  _inner: object,
  _slot: number,
  _x: number,
  _y: number,
  _z: number,
  _w: number,
): void { // @Helium 0x100740 / 0x100768 (vtable +0x60)
  throw new Error(
    "HgcBT2100_HLG_OOTF_InverseOOTF vtable +0x60 (HGNode::SetParameter) not yet transcribed (@Helium 0x100740 / 0x100768 -- HGHLG::InverseOOTF::GetOutput param upload)",
  );
}

/* ------------------------------------------------------------------ */
/* HGHLG::InverseOOTF                                                  */
/* ------------------------------------------------------------------ */

/**
 * `HGHLG::InverseOOTF` -- BT.2100 Hybrid Log-Gamma inverse OOTF facade.
 * Nested inside the `HGHLG` C++ namespace in FCP; we expose it as a plain
 * TS class named `HGHLG_InverseOOTF`.
 *
 * Constructs an inner `HgcBT2100_HLG_OOTF_InverseOOTF` leaf render node,
 * pre-computes luminance coefficients and (invGamma-1, peakScale) using
 * the reference gamma = 1.2 case, and -- on `setPeakDisplayLuminance` --
 * updates (invGamma-1, peakScale) with a piecewise HLG-adaptive gamma.
 */
export class HGHLG_InverseOOTF {
  /**
   * +0x198 -- pointer to the leaf `HgcBT2100_HLG_OOTF_InverseOOTF`
   * render node the class wraps. Allocated in the ctor via
   * `HGObject::operator new(0x1a0)` +
   * `HgcBT2100_HLG_OOTF_InverseOOTF::HgcBT2100_HLG_OOTF_InverseOOTF()`
   * @Helium 0x1003c9..@0x1003d9.
   */
  public inner: object;

  /**
   * +0x1a0 -- pointer into `HGHLG::OOTF::luminanceCoeffs` (@Helium
   * 0x3d12d0). Ctor @0x1003e0..@0x1003f2:
   *   rax = uint32(ColorPrimaries) ; rax = 3*rax ; rax = &table + 4*rax
   * i.e. `rowPtr = &luminanceCoeffs[3 * uint32(ColorPrimaries)]`. Each
   * row is 3 f32 (12 B): (Kr, Kg, Kb).
   *
   * We model this as an index into the eagerly-baked
   * `HGHLG_OOTF_luminanceCoeffs` table (row 0 = BT.709, row 1 = BT.2020)
   * rather than a raw pointer; GetOutput reads the three f32s from the row.
   */
  public luminanceCoeffs: readonly [number, number, number];

  /**
   * +0x1a8 -- the ctor arg `peakDisplayLuminance` stashed verbatim as
   * f64. Ctor @0x1003f9..@0x1003fe:
   *   `movsd -0x20(%rbp), %xmm0 ; movsd %xmm0, 0x1a8(%rbx)`
   * setPeakDisplayLuminance reads it as the "old peak" for the
   * `oldPeak / newPeak` term of its pow.
   */
  public peakDisplayLuminance: number;

  /**
   * +0x1b0 -- float32 `invGammaMinus1 = 1/gamma - 1`. Ctor @0x100406
   * stores the immediate `movl $0xbe2aaaab, 0x1b0(%rbx)` = f32(-1/6) =
   * 1/1.2 - 1 (the reference gamma=1.2 case). setPeakDisplayLuminance
   * overwrites it with an adaptive-gamma value from the piecewise HLG
   * system-gamma curve.
   */
  public invGammaMinus1: number;

  /**
   * +0x1b4 -- float32 `peakScale = 12 * (Lw_old / Lw_new)^(1/gamma)`.
   * In the ctor `Lw_old == Lw_new == arg peakDisplayLuminance` so this
   * reduces to `12 * (peak/1000)^(1/1.2)`. Ctor @0x100410..@0x100431:
   *   xmm0 = arg peak ; xmm0 /= 1000 ; xmm1 = 5/6 ; xmm0 = pow(xmm0, xmm1) ;
   *   xmm0 *= 12 ; f32(xmm0) -> this+0x1b4
   * setPeakDisplayLuminance overwrites it with the adaptive-gamma form.
   */
  public peakScale: number;

  /* ---------------- ctor: HGHLG::InverseOOTF(CP, peakL) --------- */

  /**
   * HGHLG::InverseOOTF::InverseOOTF(HGHLG::OOTF::ColorPrimaries, double)
   * -- Helium @0x1003a0 (C2) / @0x100540 (C1). Both bodies are
   * byte-identical (do NOT tail-jmp): each independently allocates the
   * inner leaf, initialises the class-static luminanceCoeffs row
   * pointer, stashes peakDisplayLuminance, sets invGammaMinus1 to
   * f32(-1/6), and computes peakScale = 12*(peak/1000)^(5/6).
   *
   * Transcription (C2 @0x1003a0..@0x100443; C1 identical modulo the
   * RIP vtable disp @0x10055a):
   *
   *   HGNode::HGNode(this);                                             @0x1003b5
   *   this->vtable = &_ZTVN5HGHLG11InverseOOTFE + 0x10;                 @0x1003ba/@0x1003c1
   *     ; leaq 0x9171ff(%rip),%rax ; ea = 0x1003c1+0x9171ff = 0xa175c0
   *   raw = HGObject::operator new(0x1a0);                              @0x1003c9
   *   HgcBT2100_HLG_OOTF_InverseOOTF::ctor(raw);                        @0x1003d4
   *   this->0x198 = raw;                                                @0x1003d9
   *
   *   rax = uint32(esi = ColorPrimaries);                               @0x1003e0
   *   rax = (rax + 2*rax) = 3*rax;                                      @0x1003e3
   *   rcx = &luminanceCoeffs;                                           @0x1003e7  (@Helium 0x3d12d0)
   *   rax = rcx + 4*rax  = &luminanceCoeffs[3*ColorPrimaries];          @0x1003ee
   *   this->0x1a0 = rax;                                                @0x1003f2
   *
   *   xmm0 = arg peakDisplayLuminance (spilled at -0x20(%rbp));         @0x1003f9
   *   this->0x1a8 = xmm0;   // as f64                                   @0x1003fe
   *
   *   this->0x1b0 = f32-bits 0xbe2aaaab (= -1/6);                       @0x100406
   *     ; direct `movl $0xbe2aaaab, 0x1b0(%rbx)` -- no RIP load
   *
   *   xmm0 = arg peakDisplayLuminance (still in xmm0 from @0x1003f9);
   *   xmm0 = xmm0 / 1000.0;                                             @0x100410 (@Helium 0x3cae88)
   *   xmm1 = 0.833333333333333;                                         @0x100418 (@Helium 0x3d0e18 = 5/6)
   *   xmm0 = pow(xmm0, xmm1);                                           @0x100420  ; SysV: base=xmm0,exp=xmm1
   *   xmm0 = xmm0 * 12.0;                                               @0x100425 (@Helium 0x3d0e20)
   *   xmm0 = f32(xmm0);                                                 @0x10042d  (cvtsd2ss)
   *   this->0x1b4 = xmm0;   // as f32 movss                             @0x100431
   *
   * Numerically at Lw=1000: `peakScale = 12 * (1)^(5/6) = 12`.
   * At Lw=100: `peakScale = 12 * (0.1)^(5/6) ~= 12 * 0.14678 ~= 1.7614`.
   * At Lw=10000: `peakScale = 12 * (10)^(5/6) ~= 12 * 6.813 ~= 81.76`.
   *
   * The unwind tails @0x100444..@0x100472 are exception cleanup: if the
   * inner-node ctor throws they call HGObject::operator delete +
   * HGNode::~HGNode + __Unwind_Resume. In the TS port the inner ctor
   * is a throw-stub, so any exception simply propagates.
   */
  public constructor(colorPrimaries: HGHLG_OOTF_ColorPrimaries, peakDisplayLuminance: number) {
    // @0x1003b5: HGNode::HGNode(this)
    HGNode_ctor_call(this);
    // @0x1003ba/@0x1003c1: vtable install -- modelled as a no-op here.

    // @0x1003c9..@0x1003d9: raw = HGObject::operator new(0x1a0); inner_ctor(raw); this+0x198 = raw
    const raw = HGObject_operator_new(0x1a0);
    HgcBT2100_HLG_OOTF_InverseOOTF_ctor(raw);
    this.inner = raw;

    // @0x1003e0..@0x1003f2: this+0x1a0 = &luminanceCoeffs[3*ColorPrimaries]
    // Model the raw pointer as a fixed row snapshot.
    const cpIdx = (colorPrimaries as unknown as number) >>> 0; // u32 (movl %esi,%r14d then movl %r14d,%eax -- zero-ext)
    // Only rows 0 (BT.709) and 1 (BT.2020) are populated with BT.2100-legal
    // HLG values. The raw asm indexes with u32 and would happily read past
    // the known rows; if a caller passes an out-of-range CP we throw to
    // surface the fact that the ledger table has no decoded row for it.
    const row = HGHLG_OOTF_luminanceCoeffs[cpIdx];
    if (row === undefined) {
      throw new Error(
        "HGHLG::InverseOOTF: ColorPrimaries=" + String(cpIdx) +
        " not decoded in HGHLG_OOTF_luminanceCoeffs (@Helium 0x3d12d0 -- only rows 0 (BT.709) and 1 (BT.2020) transcribed)",
      );
    }
    this.luminanceCoeffs = row;

    // @0x1003f9..@0x1003fe: this+0x1a8 = f64 peakDisplayLuminance
    this.peakDisplayLuminance = peakDisplayLuminance;

    // @0x100406: this+0x1b0 = f32-bits 0xbe2aaaab = -1/6 = 1/1.2 - 1 (reference gamma=1.2)
    // Bit-pattern 0xbe2aaaab as f32 == -0.1666666716337204f.
    this.invGammaMinus1 = Math.fround(-0.16666667163372) /* 0xbe2aaaab */;

    // @0x100410..@0x100431: this+0x1b4 = f32(12 * pow(peak/1000, 5/6))
    // f64 arithmetic then cvtsd2ss to f32.
    const norm = peakDisplayLuminance / 1000.0;             // @0x100410 (@Helium 0x3cae88 = 1000.0)
    const invRefGamma = 0.833333333333333;                  // @Helium 0x3d0e18 = 5/6 = 1/1.2
    const powed = Math.pow(norm, invRefGamma);              // @0x100420 (_pow, SysV base/exp)
    const scaled = powed * 12.0;                            // @0x100425 (@Helium 0x3d0e20 = 12.0)
    this.peakScale = Math.fround(scaled);                   // @0x10042d (cvtsd2ss) -> this+0x1b4
  }

  /* ---------------- setPeakDisplayLuminance --------------------- */

  /**
   * HGHLG::InverseOOTF::setPeakDisplayLuminance(double) -- Helium
   * @0x100480. Re-derives (invGammaMinus1, peakScale) from a new peak
   * luminance using the piecewise HLG system-gamma curve.
   *
   * Transcription (@0x100480..@0x10053c):
   *
   *   xmm2 = peak;                                                       @0x100489 (movapd)
   *   ucomisd 400.0, peak            // flags for (peak - 400)            @0x10048d (@Helium 0x3d0de8)
   *   xmm0 = peak / 1000.0           // pre-compute for both branches     @0x100498 (@Helium 0x3cae88)
   *   -0x10(%rbp) = peak;            // spill for later                   @0x1004a0
   *   jb 0x1004cc                    // peak < 400 (or NaN) -> log2/pow   @0x1004a5
   *   xmm1 = 2000.0;                                                      @0x1004a7 (@Helium 0x3d0df0)
   *   ucomisd xmm1(2000), xmm2(peak) // flags for (2000 - peak)           @0x1004af
   *   jb 0x1004cc                    // 2000 < peak (or NaN) -> log2/pow  @0x1004b3
   *
   *   ; LOG10 branch (400 <= peak <= 2000, ordered):
   *   xmm0 = log10(peak/1000);                                            @0x1004b5 (_log10)
   *   xmm0 *= 0.42;                                                       @0x1004ba (@Helium 0x3d0e08)
   *   xmm0 += 1.2;                    // gamma = 1.2 + 0.42*log10(...)    @0x1004c2 (@Helium 0x3d0e00)
   *   jmp 0x1004ea;                                                       @0x1004ca
   *
   *   ; LOG2/POW branch (peak < 400 or peak > 2000 or NaN):
   * 0x1004cc:
   *   xmm0 = log2(peak/1000);                                             @0x1004cc (_log2)
   *   xmm1 = xmm0;                                                        @0x1004d1
   *   xmm0 = 1.111;                                                       @0x1004d5 (@Helium 0x3d0df8)
   *   xmm0 = pow(1.111, log2(peak/1000));                                 @0x1004dd (_pow)
   *   xmm0 *= 1.2;                    // gamma = 1.2 * 1.111^log2(...)    @0x1004e2 (@Helium 0x3d0e00)
   *
   *   ; Common tail (xmm0 = gamma):
   * 0x1004ea:
   *   xmm1 = 1.0;                                                         @0x1004ea (@Helium 0x3ca260)
   *   xmm1 = 1.0 / gamma;             // 1/gamma                          @0x1004f2
   *   xmm0 = -1.0;                                                        @0x1004f6 (@Helium 0x3ca300)
   *   xmm0 = -1.0 + 1/gamma = 1/gamma - 1;                                @0x1004fe
   *   -0x20(%rbp) = xmm0;             // spill invGammaMinus1              @0x100502
   *   xmm0 = this->0x1a8;             // oldPeak (from ctor)              @0x100507
   *   xmm0 = oldPeak / newPeak;                                           @0x10050f
   *   xmm0 = pow(oldPeak/newPeak, 1/gamma);  // xmm1 still holds 1/gamma  @0x100514 (_pow)
   *   xmm0 *= 12.0;                                                       @0x100519 (@Helium 0x3d0e20)
   *   xmm1 = -0x20(%rbp);             // reload invGammaMinus1             @0x100521
   *   xmm1 = {invGammaMinus1, 12*pow(...)} as 2 packed doubles;           @0x100526 (unpcklpd)
   *   xmm0 = f32x4(xmm1);             // cvtpd2ps -> low 2 lanes = f32s    @0x10052a
   *   *(f64*)(this+0x1b0) = xmm0;     // writes 2 f32 = 8 B in one movlpd @0x10052e
   *     ; this+0x1b0 = f32(invGammaMinus1)
   *     ; this+0x1b4 = f32(12*(oldPeak/newPeak)^(1/gamma))
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
   *   `!(peak < 400) && !(peak > 2000)`: TRUE for ordered peak in [400,2000],
   *   FALSE for NaN (both `<` and `>` return false), routing NaN to the
   *   LOG2/POW branch exactly as the disasm does.
   */
  public setPeakDisplayLuminance(peak: number): void { // @Helium 0x100480
    // The disasm spills `peak` to -0x10(%rbp) (@0x1004a0) BEFORE branching,
    // so both branches read the same original argument even after xmm0 is
    // mutated. In TS `peak` is already a local and never mutated.

    // @0x10048d + @0x1004a5: `ucomisd 400.0, xmm0(peak)` then `jb log2branch`.
    //   jb fires when peak < 400 OR NaN -> log2/pow branch.
    // @0x1004af + @0x1004b3: `ucomisd xmm1(2000), xmm2(peak)` then `jb log2branch`.
    //   jb fires when peak > 2000 OR NaN -> log2/pow branch.
    // LOG10 branch runs when peak in [400, 2000] AND ordered.
    let gamma: number;
    if (!(peak < 400.0) && !(peak > 2000.0)) {
      // LOG10 branch (@0x1004b5..@0x1004ca):
      // gamma = 1.2 + 0.42 * log10(peak / 1000)
      const norm = peak / 1000.0;               // @0x100498 (@Helium 0x3cae88 = 1000.0)
      const l = Math.log10(norm);               // @0x1004b5 (_log10)
      gamma = l * 0.42 + 1.2;                   // @0x1004ba/@0x1004c2 (@Helium 0x3d0e08=0.42, 0x3d0e00=1.2)
    } else {
      // LOG2/POW branch (@0x1004cc..@0x1004e2):
      // gamma = 1.2 * 1.111^log2(peak/1000)
      //   (= 1.2 * (peak/1000)^log2(1.111), with log2(1.111) ~= 0.15200309...)
      const norm = peak / 1000.0;               // @0x100498 (still -- same const, pre-computed above)
      const l2 = Math.log2(norm);               // @0x1004cc (_log2)
      const p = Math.pow(1.111, l2);            // @0x1004dd (_pow, base=1.111, exp=l2) -- @Helium 0x3d0df8
      gamma = p * 1.2;                          // @0x1004e2 (@Helium 0x3d0e00 = 1.2)
    }

    // Common tail (@0x1004ea..@0x10052e):
    // invGammaMinus1 = 1/gamma - 1
    const invGamma = 1.0 / gamma;                                              // @0x1004ea/@0x1004f2 (@Helium 0x3ca260 = 1.0)
    const invGammaMinus1_f64 = invGamma + -1.0;                                // @0x1004f6/@0x1004fe (@Helium 0x3ca300 = -1.0)

    // peakScale = 12 * (oldPeak / newPeak)^(1/gamma)
    const oldPeak = this.peakDisplayLuminance;                                 // @0x100507 (this+0x1a8, f64)
    const ratio = oldPeak / peak;                                              // @0x10050f (div by new peak from -0x10(%rbp))
    const pw = Math.pow(ratio, invGamma);                                      // @0x100514 (_pow, base=ratio, exp=1/gamma)
    const peakScale_f64 = pw * 12.0;                                           // @0x100519 (@Helium 0x3d0e20 = 12.0)

    // @0x10052a `cvtpd2ps` -- narrow both to f32 before storing.
    // @0x10052e `movlpd` stores 8 B = 2 f32 side-by-side at this+0x1b0/0x1b4.
    this.invGammaMinus1 = Math.fround(invGammaMinus1_f64);
    this.peakScale      = Math.fround(peakScale_f64);
  }

  /* ---------------- dtor: HGHLG::~InverseOOTF ------------------- */

  /**
   * HGHLG::InverseOOTF::~InverseOOTF() -- Helium @0x100620 (D2),
   * @0x100660 (D1), @0x1006a0 (D0 deleting). All three re-install
   * the base HGHLG::InverseOOTF vtable at (this) (each computes
   * next_ip + disp = 0xa175c0), then load the inner
   * HgcBT2100_HLG_OOTF_InverseOOTF pointer from this+0x198 and -- if
   * non-null -- call *(inner_vtable + 0x18)(inner). Finally D1/D2 tail-
   * jmp to HGNode::~HGNode(); D0 additionally calls HGNode::~HGNode
   * inline and tail-jmps to HGObject::operator delete(this).
   *
   *   D2 @0x100620:
   *     leaq 0x916f93(%rip),%rax           @0x100626 ; ea = 0x10062d + 0x916f93 = 0xa175c0
   *     movq %rax, (%rdi)                  @0x10062d
   *     rax = this->0x198                  @0x100630
   *     if (rax) { rcx = *rax ; (*(rcx+0x18))(rax); }  @0x100637..@0x100648
   *     tail-jmp HGNode::~HGNode(this)     @0x100651
   *
   *   D1 @0x100660: byte-identical body to D2 modulo the vtable disp
   *     (@0x100666 leaq 0x916f53(%rip) -> 0x10066d + 0x916f53 = 0xa175c0).
   *
   *   D0 @0x1006a0:
   *     same vtable install (leaq 0x916f10(%rip) @0x1006a9 -> 0xa175c0);
   *     same inner->vtable[0x18] tear-down (@0x1006bd..@0x1006c2);
   *     inline HGNode::~HGNode(this)       @0x1006c8;
   *     tail-jmp HGObject::operator delete @0x1006d6.
   *
   * The inner-node's vtable slot +0x18 is `~HgcBT2100_HLG_OOTF_InverseOOTF`
   * (per HGNode's canonical vtable: *0x18 = D0 deleting dtor). JS/TS
   * doesn't have manual delete; the whole ownership graph is subsumed
   * by GC. We model destroy() as a manual method for symmetry with the
   * port. (If a caller ever needs a semantic dtor beyond GC -- e.g. to
   * trigger the vtable+0x18 call for parity -- swap the body for a
   * throw citing @Helium 0x100645 / 0x100685 / 0x1006c2.)
   */
  public destroy(): void { // @Helium 0x1006a0 (D0)
    void this.inner;
  }

  /* ---------------- GetOutput ---------------------------------- */

  /**
   * HGHLG::InverseOOTF::GetOutput(HGRenderer* r) -- Helium @0x1006f0.
   * Transcription (@0x1006f0..@0x100776):
   *
   *   r14 = this->0x198;                                             @0x1006fa
   *   rdi = r ; rsi = this ; edx = 0;
   *   rax = HGRenderer::GetInput(r, this, 0);                        @0x100709
   *   rcx = *r14 (inner vtable);
   *   (*(rcx+0x78))(r14, slot= 0, rax);                           @0x100719  ; SetInput
   *
   *   rdi = this->0x198;                                             @0x10071c
   *   rax = this->0x1a0;      // luminanceCoeffs row pointer          @0x100723
   *   xmm0 = *(f32*)(rax+0);  // Kr                                   @0x10072a
   *   xmm1 = *(f32*)(rax+4);  // Kg                                   @0x10072e
   *   xmm2 = *(f32*)(rax+8);  // Kb                                   @0x100733
   *   rax = *rdi (inner vtable);
   *   xmm3 = 0;   esi = 0;
   *   (*(rax+0x60))(rdi, slot= 0, Kr, Kg, Kb, 0);                  @0x100740  ; SetParameter
   *
   *   rdi = this->0x198;                                             @0x100743
   *   xmm0 = *(f32*)(this+0x1b0);   // invGammaMinus1                 @0x10074a
   *   xmm1 = *(f32*)(this+0x1b4);   // peakScale                      @0x100752
   *   rax = *rdi;
   *   xmm2 = 0 ; xmm3 = 0 ; esi = 1;
   *   (*(rax+0x60))(rdi, slot= 1, invGammaMinus1, peakScale, 0,0); @0x100768  ; SetParameter
   *
   *   rax = this->0x198;   // return the leaf                         @0x10076b
   *   ret;
   *
   * The four vtable calls (GetInput, SetInput slot, two SetParameter
   * slots) are frontier -- see the throwing stubs above. Once HGRenderer
   * + HgcBT2100_HLG_OOTF_InverseOOTF land, this method is fully wired
   * without further changes.
   */
  public GetOutput(r: HGRenderer): object { // @Helium 0x1006f0
    // @0x1006fa: r14 = this->0x198 (inner)
    const inner = this.inner;

    // @0x100709: source = HGRenderer::GetInput(r, this, 0)
    const source = HGRenderer_GetInput(r, this as unknown as HGNodeLike, 0);

    // @0x100719: inner->vtable[0x78](inner, 0, source) -- SetInput
    HgcBT2100_HLG_OOTF_InverseOOTF_SetInput(inner, 0, source);

    // @0x10072a..@0x100740: load (Kr, Kg, Kb) f32 triple from luminanceCoeffs row and dispatch SetParameter(0, ...)
    // In the raw asm each f32 load is a single `movss` from *(row+0/4/8).
    const [Kr, Kg, Kb] = this.luminanceCoeffs;
    HgcBT2100_HLG_OOTF_InverseOOTF_SetParameter(
      inner,
      0,
      Kr,                    // f32 (row[0])                @0x10072a
      Kg,                    // f32 (row[1])                @0x10072e
      Kb,                    // f32 (row[2])                @0x100733
      Math.fround(0.0),      // f32 0 (xorps xmm3)          @0x10073b
    );

    // @0x10074a..@0x100768: load (invGammaMinus1, peakScale) f32 pair and dispatch SetParameter(1, ...)
    HgcBT2100_HLG_OOTF_InverseOOTF_SetParameter(
      inner,
      1,
      this.invGammaMinus1,   // f32 (this+0x1b0)             @0x10074a
      this.peakScale,        // f32 (this+0x1b4)             @0x100752
      Math.fround(0.0),      // f32 0 (xorps xmm2)          @0x10075d
      Math.fround(0.0),      // f32 0 (xorps xmm3)          @0x100760
    );

    // @0x10076b: return this->0x198 (the leaf)
    return this.inner;
  }
}
