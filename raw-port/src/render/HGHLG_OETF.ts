// raw-port/src/render/HGHLG_OETF.ts
//
// FCP `HGHLG::OETF` — a nested facade class in Helium's `HGHLG` (BT.2100
// Hybrid Log-Gamma) namespace. It is a THIN wrapper around the leaf render
// node `HgcBT2100_HLG_OETF`: the ctor allocates an inner
// HgcBT2100_HLG_OETF, stashes it at `this+0x198`, and initialises three
// f32 fields at `this+0x1a0/0x1a4/0x1a8` from function-static initialisers
// (`rr`, `aa`, `cc`). `GetOutput` then wires up the inner node's parameters
// (SDR-vs-HDR arm threshold at param slot 0, and the HLG constants
// `(rr, aa, b, cc)` at param slot 1) and returns the inner node as the
// produced output.
//
// The static helper `HGHLG::OETF::Ep(double)` @0xff9f0 implements the
// *pure math* HLG OETF: given a non-negative scalar `E`, returns E' via the
// two-arm HLG-style curve
//     E' =  0.5 * sqrt(E)                       for 0 <= E <= 1.0
//           aa * ln(E - b) + c                  for E >  1.0
// where the run-time (function-static) constants live at load-time-init
// addresses  `Ep::c` (f64) and RIP-relative rodata slots  `b`, `aa`, `0.5`.
// This is the reference function the leaf renderer's per-pixel body
// corresponds to (shader uses log2 with an adjusted slope `aa = a * ln 2`
// so `aa * log2(x) == a * ln(x)`; see HgcBT2100_HLG_OETF.ts shader body).
//
// FRAMEWORK: Helium.framework (x86_64 slice; fat-slice offset 0x4000;
// the thin binary at /tmp/Helium.x86_64 has VA==file offset, so every
// RIP-relative constant address below is a direct file offset).
//
// SYMBOLS (Helium x86_64):
//   0x000ff9f0  HGHLG::OETF::Ep(double)               [static — pure HLG OETF math]
//   0x000ffa80  HGHLG::OETF::OETF()                   [C2 base ctor]
//   0x000ffb90  HGHLG::OETF::OETF()                   [C1 complete ctor — tail-calls C2]
//   0x000ffba0  HGHLG::OETF::~OETF()                  [D2 base dtor]
//   0x000ffbe0  HGHLG::OETF::~OETF()                  [D1 complete dtor — identical body]
//   0x000ffc20  HGHLG::OETF::~OETF()                  [D0 deleting dtor]
//   0x000ffc70  HGHLG::OETF::GetOutput(HGRenderer*)   [wires HgcBT2100_HLG_OETF params, returns it]
//
// Cold-path (guard-variable init) helpers:
//   0x003c3560  HGHLG::OETF::Ep(double) (.cold.1)     [__cxa_guard_acquire/release Ep::c]
//   0x003c35a0  HGHLG::OETF::OETF() (.cold.1)         [init `c`  = f64 0x3fe1eac9e70d7420 = 0.55991073]
//   0x003c35e0  HGHLG::OETF::OETF() (.cold.2)         [init `rr` = f32 0x3f000000         = 0.5]
//   0x003c3610  HGHLG::OETF::OETF() (.cold.3)         [init `aa` = f32 0x3dfddd65         = 0.12395743]
//   0x003c3640  HGHLG::OETF::OETF() (.cold.4)         [init `cc` = f32(c)                 = 0.55991071]
//
// Vtable: __ZTVN5HGHLG4OETFE @0xa16ef0; installed ptr (base+0x10) = 0xa16f00.
// Ctor C2 @0xffa92:  `leaq 0x917467(%rip), %rax` ; RIP-after=0xffa99 ; target = 0xffa99 + 0x917467 = 0xa16f00.
// D2   @0xffba6:     `leaq 0x917353(%rip), %rax` ; RIP-after=0xffbad ; target = 0xffbad + 0x917353 = 0xa16f00.
// D1   @0xffbe6:     `leaq 0x917313(%rip), %rax` ; RIP-after=0xffbed ; target = 0xffbed + 0x917313 = 0xa16f00.
// D0   @0xffc29:     `leaq 0x9172d0(%rip), %rax` ; RIP-after=0xffc30 ; target = 0xffc30 + 0x9172d0 = 0xa16f00.
//
// LAYOUT (inherits HGNode; sizeof HGNode header >= 0x198):
//   +0x000  vtable ptr (installed @0xffa9c/@0xffbad/@0xffbed/@0xffc30, all == 0xa16f00)
//   +0x198  HgcBT2100_HLG_OETF* inner render node
//                                       (allocated by ctor @0xffaa1..0xffab1:
//                                        `HGObject::operator new(0x1a0)` +
//                                        `HgcBT2100_HLG_OETF::HgcBT2100_HLG_OETF()`)
//   +0x1a0  float32 rr  = 0.5                 (a-slope,  SDR arm; from static `rr`)
//   +0x1a4  float32 aa  = 0.12395743280649185 (log2-slope, HDR arm — = a * ln 2)
//   +0x1a8  float32 cc  = f32(0.55991073...)  (HDR intercept — = f32(static `c`))
//
// DECODED CONSTANTS (from Helium.x86_64 with VA==file offset; every
// RIP-relative constant is `next_ip + disp32`):
//
//   HGHLG::OETF::Ep(double) @0xff9f0 (mixed):
//     0x3ca260 : 1.0                        f64   (SDR-arm threshold)         @0xffa30->0xffa38+0x2ca828
//     0x3d0dc0 : -0.28466890937217996        f64   (= -b, added to E)          @0xffa3e->0xffa46+0x2d137a
//     0x3d0dc8 :  0.17883277265534577        f64   (= a, HDR ln-slope)         @0xffa4f->0xffa57+0x2d1371
//     Ep::c    :  0.5599107277627162         f64   (HDR intercept, load-init)  @0xffa57
//                 (u64 = 0x3fe1eac9e70d7420, set by cold.1 @0x3c35b4/@0x3c35be)
//     0x3cc1c0 : 0.5                         f64   (SDR-arm sqrt multiplier)   @0xffa6c->0xffa74+0x2cc74c
//
//   HGHLG::OETF ctor @0xffa80 (cold-path load-time inits used at first ctor call):
//     `c`  f64 0x3fe1eac9e70d7420 -> 0.5599107277627162   (@ cold.1 0x3c35b4)
//     `rr` f32 0x3f000000         -> 0.5f                 (@ cold.2 0x3c35f4)
//     `aa` f32 0x3dfddd65         -> 0.12395743280649185f (@ cold.3 0x3c3624)
//     `cc` f32 = f32(0 + `c`)     -> 0.5599107146263123f  (@ cold.4 0x3c3658..0x3c3664)
//
//   HGHLG::OETF::GetOutput @0xffc70 (all f32):
//     0x3c7cc8 : 0.5f                       (shader `params[0].x` = threshold)         @0xffca6->0xffcae+0x2c8012
//     0x3d0fa0 : 0.28466892242431640625f    (shader `params[1].z` = b)                 @0xffcde->0xffce6+0x2d12ba
//
// SHADER PARAMETER PACKING (see HgcBT2100_HLG_OETF.ts header for the
// full shader description):
//   SetParameter(0, threshold=0.5,  0, 0, 0)     ==> params[0] = (0.5, 0, 0, 0)
//   SetParameter(1, rr,   aa,       b, cc)       ==> params[1] = (a=rr,  c=aa,  b, d=cc)
// The shader then computes, per pixel:
//     SDR  =  a * sqrt(E)                              (E clamped to >= 0)
//     HDR  =  c * log2(max(E, threshold) - b) + d
//     out  =  (E > threshold) ? HDR : SDR
//
// UNDECODED CALLEES / FRONTIER (each gets a throwing stub citing its @0xADDR):
//   HGNode::HGNode()                                @Helium 0xffa8d
//   HGObject::operator new(size_t)                  @Helium 0xffaa1
//   HgcBT2100_HLG_OETF::HgcBT2100_HLG_OETF()        @Helium 0xffaac
//   HGObject::operator delete(void*)                @Helium 0xffb5c / 0xffc56
//   HGNode::~HGNode()                               @Helium 0xffb64 / 0xffbd1 / 0xffc11 / 0xffc48
//   HgcBT2100_HLG_OETF vtable +0x18 (dtor slot)     @Helium 0xffbc5 / 0xffc05 / 0xffc42
//   HGRenderer::GetInput(HGNode*, int)              @Helium 0xffc89
//   HgcBT2100_HLG_OETF vtable +0x78 (SetInput slot) @Helium 0xffc99
//   HgcBT2100_HLG_OETF vtable +0x60 (SetParameter)  @Helium 0xffcb9 / 0xffceb
//   libm _log(double)                               @Helium 0xffa4a (stub 0x3c53ea)
//   __cxa_guard_acquire / __cxa_guard_release       @Helium cold.1..4 (all 4 statics)
//
// The `HGHLG::OETF::Ep(double)` static is pure math and would be
// oracle-checkable (dlsym parity) — keeping the transcription line-for-line
// with the disasm is essential.

/* ------------------------------------------------------------------ */
/* Opaque frontier types — resolved by companion ports.                */
/* ------------------------------------------------------------------ */

export interface HGRenderer {}
export interface HGNodeLike {}

/* ------------------------------------------------------------------ */
/* Undecoded-frontier stubs (each throws with its @0xADDR).            */
/* ------------------------------------------------------------------ */

/** Base-class ctor called at ctor entry @Helium 0xffa8d. */
function HGNode_ctor_call(_self: object): void { // @Helium 0xffa8d
  throw new Error(
    "HGNode::HGNode() not yet transcribed (@Helium 0xffa8d — HGHLG::OETF::OETF() base-class ctor call)",
  );
}

/** `HGObject::operator new(0x1a0)` allocates the inner HgcBT2100_HLG_OETF. */
function HGObject_operator_new(_bytes: number): object { // @Helium 0xffaa1
  throw new Error(
    "HGObject::operator new(unsigned long) not yet transcribed (@Helium 0xffaa1 — HGHLG::OETF::OETF() alloc of inner HgcBT2100_HLG_OETF)",
  );
}

/** `HgcBT2100_HLG_OETF::HgcBT2100_HLG_OETF()` — the leaf render-node ctor (C1). */
function HgcBT2100_HLG_OETF_ctor(_p: object): void { // @Helium 0xffaac
  throw new Error(
    "HgcBT2100_HLG_OETF::HgcBT2100_HLG_OETF() not yet transcribed (@Helium 0xffaac — HGHLG::OETF::OETF() inner-node construction)",
  );
}

/** `HGObject::operator delete(void*)` — inner-node delete on ctor exception, and self-delete in D0. */
function HGObject_operator_delete(_p: object): void { // @Helium 0xffb5c / 0xffc56
  throw new Error(
    "HGObject::operator delete(void*) not yet transcribed (@Helium 0xffb5c / 0xffc56 — HGHLG::OETF ctor cleanup / D0 self-delete)",
  );
}

/** `HGNode::~HGNode()` — base dtor tail-called by D2/D1 and D0. */
function HGNode_dtor_call(_self: object): void { // @Helium 0xffb64 / 0xffbd1 / 0xffc11 / 0xffc48
  throw new Error(
    "HGNode::~HGNode() not yet transcribed (@Helium 0xffb64 / 0xffbd1 / 0xffc11 / 0xffc48 — HGHLG::OETF dtor base-call)",
  );
}

/**
 * Virtual dispatch through the inner HgcBT2100_HLG_OETF's vtable +0x18 (dtor slot).
 */
function HgcBT2100_HLG_OETF_dtor_via_vt(
  _inner: object,
): void { // @Helium 0xffbc5 / 0xffc05 / 0xffc42
  throw new Error(
    "HgcBT2100_HLG_OETF vtable +0x18 (dtor) not yet transcribed (@Helium 0xffbc5 / 0xffc05 / 0xffc42 — HGHLG::OETF dtor tears down inner)",
  );
}

/** `HGRenderer::GetInput(HGNode*, int)` fetches the primary input node. */
function HGRenderer_GetInput(_r: HGRenderer, _n: HGNodeLike, _idx: number): HGNodeLike { // @Helium 0xffc89
  throw new Error(
    "HGRenderer::GetInput(HGNode*, int) not yet transcribed (@Helium 0xffc89 — HGHLG::OETF::GetOutput source-input fetch)",
  );
}

/**
 * Virtual dispatch through the inner HgcBT2100_HLG_OETF's vtable +0x78
 * (`HGNode::SetInput(int, HGNode*)` per HGNode's canonical vtable).
 */
function HgcBT2100_HLG_OETF_SetInput(
  _inner: object,
  _slot: number,
  _source: HGNodeLike,
): void { // @Helium 0xffc99 (vtable +0x78)
  throw new Error(
    "HgcBT2100_HLG_OETF vtable +0x78 (HGNode::SetInput) not yet transcribed (@Helium 0xffc99 — HGHLG::OETF::GetOutput input wiring)",
  );
}

/**
 * Virtual dispatch through the inner HgcBT2100_HLG_OETF's vtable +0x60
 * (`HGNode::SetParameter(int, float, float, float, float)` per HGNode's
 * canonical vtable).
 */
function HgcBT2100_HLG_OETF_SetParameter(
  _inner: object,
  _slot: number,
  _x: number,
  _y: number,
  _z: number,
  _w: number,
): void { // @Helium 0xffcb9 / 0xffceb (vtable +0x60)
  throw new Error(
    "HgcBT2100_HLG_OETF vtable +0x60 (HGNode::SetParameter) not yet transcribed (@Helium 0xffcb9 / 0xffceb — HGHLG::OETF::GetOutput param upload)",
  );
}

/* ------------------------------------------------------------------ */
/* HGHLG::OETF                                                         */
/* ------------------------------------------------------------------ */

/**
 * Load-time-initialised f64 static in `HGHLG::OETF::Ep(double)`:
 * `Ep::c`. Initialised once via `__cxa_guard_acquire`/`__cxa_guard_release`
 * (guarded @0xff9fc, cold-path body @0x3c3560). Value stored as
 * u64 `0x3fe1eac9e70d7420`.
 *   = 0.5599107277627162
 * @Helium Ep(double)::c
 */
export const HGHLG_OETF_Ep_c_f64: number = 0.5599107277627162 as const;

/**
 * Function-static f64 in the ctor (`OETF::c` — same numeric as `Ep::c`;
 * initialised in a distinct load-time static by ctor .cold.1). @0x3c35b4.
 * u64 = 0x3fe1eac9e70d7420 -> 0.5599107277627162.
 */
export const HGHLG_OETF_ctor_c_f64: number = 0.5599107277627162 as const;

/**
 * `rr` — f32 slope for the SDR arm in the shader (`params[1].x`).
 * u32 = 0x3f000000 -> 0.5f. @Helium cold.2 0x3c35f4.
 */
export const HGHLG_OETF_rr_f32: number = 0.5 as const;

/**
 * `aa` — f32 slope for the HDR log2 arm in the shader (`params[1].y`).
 * u32 = 0x3dfddd65 -> 0.12395743280649185f. @Helium cold.3 0x3c3624.
 * Value equals `a * ln 2` where `a = 0.17883277` is the natural-log HLG
 * slope used by `Ep(double)` — the shader multiplies by `log2` so the
 * effective natural-log slope matches (aa * log2(x) == a * ln(x)).
 */
export const HGHLG_OETF_aa_f32: number = 0.12395743280649185 as const;

/**
 * `cc` — f32 intercept for the HDR log arm in the shader (`params[1].w`).
 * Computed by cold.4 as `f32(0 + Ep::c) = f32(0.5599107277627162)`
 * (@0x3c3654 xorpd + @0x3c3658 addsd + @0x3c3660 cvtsd2ss + @0x3c3664 movss).
 *   = 0.5599107146263123f
 */
export const HGHLG_OETF_cc_f32: number = Math.fround(0.5599107277627162);

/**
 * Ep(double) — @Helium 0xff9f0 constants (all f64 rodata, all VA == file offset):
 *   0x3ca260  1.0                            (SDR-arm threshold)
 *   0x3d0dc0 -0.28466890937217996             (= -b, added to E in HDR arm)
 *   0x3d0dc8  0.17883277265534577             (= a, natural-log HDR slope)
 *   0x3cc1c0  0.5                             (SDR-arm sqrt multiplier)
 */
export const HGHLG_OETF_EP_THRESHOLD_1_F64: number = 1.0 as const;
export const HGHLG_OETF_EP_NEG_B_F64: number = -0.28466890937217996 as const;
export const HGHLG_OETF_EP_A_F64: number = 0.17883277265534577 as const;
export const HGHLG_OETF_EP_SDR_MULT_F64: number = 0.5 as const;

/**
 * GetOutput f32 rodata constants:
 *   0x3c7cc8  0.5f                    (shader `params[0].x` — SDR-vs-HDR arm threshold)
 *   0x3d0fa0  0.28466892242431640625f (shader `params[1].z` — HLG `b`)
 */
export const HGHLG_OETF_GETOUTPUT_THRESHOLD_F32: number = 0.5 as const;
export const HGHLG_OETF_GETOUTPUT_B_F32: number = 0.28466892242431640625 as const;

/**
 * Vtable-installed pointer address for `HGHLG::OETF`.
 * From ctor C2 @0xffa92 (leaq 0x917467(%rip)); RIP-after = 0xffa99;
 *   target = 0xffa99 + 0x917467 = 0xa16f00 == vtable_sym 0xa16ef0 + 0x10.
 */
export const HGHLG_OETF_VTABLE_INSTALLED_PTR = 0xa16f00 as const;
/** Vtable symbol address (base, before RTTI/offset-to-top). @Helium 0xa16ef0. */
export const HGHLG_OETF_VTABLE_SYM = 0xa16ef0 as const;

/** Inner-node allocation size passed to `HGObject::operator new`. @Helium 0xffa9c. */
export const HGHLG_OETF_INNER_ALLOC_BYTES = 0x1a0 as const;

/**
 * `HGHLG::OETF` — BT.2100 HLG opto-electrical transfer function facade.
 *
 * The class is nested inside the `HGHLG` C++ namespace in FCP; we
 * expose it as a plain TS class named `HGHLG_OETF` (file name uses the
 * `::` -> `_` convention). See file header for full symbol table.
 */
export class HGHLG_OETF {
  /**
   * +0x198 — pointer to the leaf `HgcBT2100_HLG_OETF` render node the class
   * wraps. Allocated in the ctor via `HGObject::operator new(0x1a0)` +
   * `HgcBT2100_HLG_OETF::HgcBT2100_HLG_OETF()` @0xffaa1..0xffab1.
   */
  public inner: object;

  /**
   * +0x1a0 — f32 SDR slope (shader `params[1].x`).
   * Written by ctor @0xffae4..0xffaec:
   *   movss  rr(%rip), %xmm0
   *   movss  %xmm0, 0x1a0(%rbx)
   * where `rr` is the load-time static initialised by cold.2 to 0.5f.
   */
  public rr: number;

  /**
   * +0x1a4 — f32 HDR log2 slope (shader `params[1].y`).
   * Written @0xffaf4..0xffafc from static `aa` (cold.3 init: 0.12395743280649185f).
   */
  public aa: number;

  /**
   * +0x1a8 — f32 HDR intercept (shader `params[1].w`).
   * Written @0xffb04..0xffb0c from static `cc` (cold.4 init: f32(Ep::c) = 0.5599107146263123f).
   */
  public cc: number;

  /**
   * `HGHLG::OETF::OETF()` @Helium 0xffa80 (C2 base ctor). C1 @0xffb90 is
   * `pushq %rbp ; movq %rsp,%rbp ; popq %rbp ; jmp __ZN5HGHLG4OETFC2Ev` —
   * a bare tail-call to C2, so we implement C2 and treat C1 as an alias.
   *
   * Body (@0xffa8a..0xffb1e):
   *   1. `HGNode::HGNode()` on `this`.                       @0xffa8d
   *   2. Install vtable ptr 0xa16f00 at `*(this)`.           @0xffa92..0xffa99
   *   3. `p = HGObject::operator new(0x1a0)`.                @0xffa9c..0xffaa6
   *   4. `HgcBT2100_HLG_OETF::HgcBT2100_HLG_OETF()` on p.    @0xffaa9..0xffaae
   *   5. `this[0x198] = p`.                                  @0xffab1
   *   6. Test then trigger four `__cxa_guard_acquire` init
   *      cold paths for statics `c`, `rr`, `aa`, `cc`.       @0xffab8..0xffae2
   *   7. `this[0x1a0] = rr` (f32).                           @0xffae4..0xffaec
   *   8. `this[0x1a4] = aa` (f32).                           @0xffaf4..0xffafc
   *   9. `this[0x1a8] = cc` (f32).                           @0xffb04..0xffb0c
   */
  public constructor() { // @Helium 0xffa80 (C2) / 0xffb90 (C1 alias)
    HGNode_ctor_call(this); // @Helium 0xffa8d
    // vtable install @Helium 0xffa92..0xffa99 (leaq 0x917467(%rip); movq %rax,(%rbx))
    // target = 0xffa99 + 0x917467 = HGHLG_OETF_VTABLE_INSTALLED_PTR (0xa16f00).

    // Allocate inner HgcBT2100_HLG_OETF (@Helium 0xffa9c..0xffab1):
    //   %edi = 0x1a0
    //   HGObject::operator new(unsigned long)
    //   HgcBT2100_HLG_OETF::HgcBT2100_HLG_OETF() on returned pointer
    //   this[0x198] = pointer
    const p = HGObject_operator_new(HGHLG_OETF_INNER_ALLOC_BYTES); // @Helium 0xffaa1
    HgcBT2100_HLG_OETF_ctor(p);                                    // @Helium 0xffaac
    this.inner = p;                                                // @Helium 0xffab1

    // Four function-static initialisers guarded by __cxa_guard_acquire
    // (@Helium 0xffab8..0xffae2 -> cold.1..cold.4 @0x3c35a0/@0x3c35e0/@0x3c3610/@0x3c3640).
    // Their steady-state values are the module-level constants above.

    // Field writes @Helium 0xffae4..0xffb0c (f32 movss from RIP-relative static -> this+N):
    this.rr = HGHLG_OETF_rr_f32; // @Helium 0xffae4..0xffaec
    this.aa = HGHLG_OETF_aa_f32; // @Helium 0xffaf4..0xffafc
    this.cc = HGHLG_OETF_cc_f32; // @Helium 0xffb04..0xffb0c
  }

  /**
   * `HGHLG::OETF::~OETF()` @Helium 0xffba0 (D2 base) / 0xffbe0 (D1 complete).
   * D1 has an identical body — both reset the vptr, then virtually delete the
   * inner via its vtable +0x18 slot, then tail-call `HGNode::~HGNode()`.
   *
   * Body (@0xffba0..0xffbd1):
   *   1. Reset `*(this)` to installed-ptr 0xa16f00.          @0xffba6..0xffbad
   *   2. Load `inner = this[0x198]`.                         @0xffbb0
   *   3. If `inner` is non-null, virtually dispatch its
   *      vtable +0x18 (dtor slot) on `inner`.                @0xffbb7..0xffbc8
   *   4. Tail-call `HGNode::~HGNode()` on `this`.            @0xffbd1
   */
  public destroy(): void { // @Helium 0xffba0 (D2) / 0xffbe0 (D1)
    // Reset vptr (@Helium 0xffba6..0xffbad / 0xffbe6..0xffbed):
    //   leaq 0x917353(%rip), %rax  ; movq %rax, (%rdi)
    //   target = 0xffbad + 0x917353 = 0xa16f00 == HGHLG_OETF_VTABLE_INSTALLED_PTR

    // Load inner and virtually destroy if non-null (@Helium 0xffbb0..0xffbc8):
    const inner = this.inner as object | null;
    if (inner) {
      // *(inner->vtable + 0x18)(inner) — Itanium ABI base-dtor slot.
      HgcBT2100_HLG_OETF_dtor_via_vt(inner); // @Helium 0xffbc5
    }

    // Tail-call HGNode::~HGNode() (@Helium 0xffbd1):
    HGNode_dtor_call(this);
  }

  /**
   * D0 deleting-dtor @Helium 0xffc20 — same as `destroy()` plus a self-delete.
   * Body (@0xffc20..0xffc56):
   *   1. Reset vptr (target = 0xa16f00).                    @0xffc29..0xffc30
   *   2. Load `inner` and virtually delete it (vt+0x18).    @0xffc33..0xffc42
   *   3. Tail-call `HGNode::~HGNode()` on `this`.           @0xffc48
   *   4. Tail-call `HGObject::operator delete(this)`.       @0xffc56
   */
  public destroyDeleting(): void { // @Helium 0xffc20 (D0)
    const inner = this.inner as object | null; // @Helium 0xffc33
    if (inner) {
      HgcBT2100_HLG_OETF_dtor_via_vt(inner); // @Helium 0xffc42
    }
    HGNode_dtor_call(this);                  // @Helium 0xffc48
    HGObject_operator_delete(this);          // @Helium 0xffc56
  }

  /**
   * `HGHLG::OETF::GetOutput(HGRenderer* r)` @Helium 0xffc70.
   *
   * Wires up the inner HgcBT2100_HLG_OETF's shader parameters and returns
   * the inner node as the produced output.
   *
   * Body (@0xffc70..0xffcf9):
   *   1. Load `inner = this[0x198]` into %r14.                    @0xffc7a
   *   2. Call `HGRenderer::GetInput(r, this, 0)` -> %rax.         @0xffc89
   *      (%rdi = r ; %rsi = this ; %edx = 0)
   *   3. Call `inner->vtable[0x78](inner, 0, %rax)` -> SetInput.   @0xffc99
   *   4. Reload `inner = this[0x198]` into %rdi.                  @0xffc9c
   *   5. Call `inner->vtable[0x60](inner, 0, 0.5f, 0.0f, 0.0f, 0.0f)`
   *      -> SetParameter(0, threshold, 0, 0, 0).                  @0xffcb9
   *      xmm0 = 0.5f (movss 0x3c7cc8) ; xmm1..3 = 0.
   *   6. Reload `inner = this[0x198]` into %rdi.                  @0xffcbc
   *   7. Call `inner->vtable[0x60](inner, 1, rr, aa, b, cc)`
   *      -> SetParameter(1, rr, aa, b=0.28466892f, cc).           @0xffceb
   *      xmm0 = this[0x1a0] = rr
   *      xmm1 = this[0x1a4] = aa
   *      xmm2 = 0.28466892f  (movss 0x3d0fa0)
   *      xmm3 = this[0x1a8] = cc
   *   8. Return `this[0x198]` (i.e. `inner`).                     @0xffcee
   */
  public GetOutput(r: HGRenderer): HGNodeLike { // @Helium 0xffc70
    const inner = this.inner;                                       // @Helium 0xffc7a
    const source = HGRenderer_GetInput(r, this as unknown as HGNodeLike, 0); // @Helium 0xffc89
    HgcBT2100_HLG_OETF_SetInput(inner, 0, source);                   // @Helium 0xffc99
    // SetParameter(0, 0.5f, 0, 0, 0) — SDR-vs-HDR arm threshold (@Helium 0xffcb9):
    HgcBT2100_HLG_OETF_SetParameter(
      inner,
      0,
      HGHLG_OETF_GETOUTPUT_THRESHOLD_F32, // xmm0 = 0.5f (@0xffca6, rodata 0x3c7cc8)
      0.0,                                 // xmm1 = 0 (xorps @0xffcae)
      0.0,                                 // xmm2 = 0 (xorps @0xffcb1)
      0.0,                                 // xmm3 = 0 (xorps @0xffcb4)
    );
    // SetParameter(1, rr, aa, b, cc) — HLG constants tuple (@Helium 0xffceb):
    HgcBT2100_HLG_OETF_SetParameter(
      inner,
      1,
      this.rr,                             // xmm0 = this[0x1a0] (@0xffcc3)
      this.aa,                             // xmm1 = this[0x1a4] (@0xffccb)
      HGHLG_OETF_GETOUTPUT_B_F32,          // xmm2 = 0.28466892f (@0xffcde, rodata 0x3d0fa0)
      this.cc,                             // xmm3 = this[0x1a8] (@0xffcd3)
    );
    return inner as HGNodeLike;                                       // @Helium 0xffcee
  }

  /* ------------------------------------------------------------------ */
  /* Pure-math static: HGHLG::OETF::Ep(double)                           */
  /* ------------------------------------------------------------------ */

  /**
   * `HGHLG::OETF::Ep(double)` @Helium 0xff9f0 — static helper implementing
   * the reference HLG-style OETF math (natural-log form; the shader uses
   * a log2 form with `aa = a * ln 2` for the same net curve).
   *
   * Piecewise (steady-state, i.e. after Ep::c is initialised):
   *   0 <= E <= 1.0  => returns  0.5 * sqrt(E)
   *   E >  1.0       => returns  a * ln(E - b) + c
   *                       = 0.17883277265534577 * ln(E - 0.28466890937217996)
   *                         + 0.5599107277627162
   *
   * Precise disasm mapping (@0xff9f0..0xffa79, all f64):
   *   ff9fc  movzbl guard(Ep::c), %eax ; testb ; je slow-init path         (@0xffa17)
   *   ffa07  xorpd  %xmm0,%xmm0 ; ucomisd %xmm1,%xmm0 ; jb   0xffa30       (E < 0 goes to body)
   *   ffa30  movsd  1.0(%rip), %xmm0
   *   ffa38  ucomisd %xmm1,%xmm0        ; xmm0 = 1.0, xmm1 = E
   *   ffa3c  jae     0xffa65             ; if (1.0 >= E) goto SDR
   *   ---- HDR arm (E > 1.0) ----
   *   ffa3e  addsd  -b(%rip), %xmm1      ; xmm1 = E - b
   *   ffa46  movapd %xmm1,%xmm0
   *   ffa4a  callq  _log                 ; xmm0 = ln(E - b)
   *   ffa4f  mulsd  a(%rip), %xmm0       ; xmm0 = a * ln(E - b)
   *   ffa57  addsd  Ep::c(%rip), %xmm0   ; xmm0 = a * ln(E - b) + c
   *   ffa5f  retq
   *   ---- SDR arm (0 <= E <= 1.0) ----
   *   ffa65  xorps  %xmm0,%xmm0
   *   ffa68  sqrtsd %xmm1,%xmm0          ; xmm0 = sqrt(E)
   *   ffa6c  mulsd  0.5(%rip), %xmm0     ; xmm0 = 0.5 * sqrt(E)
   *   ffa74  retq
   *
   * Verification (natural log, from decoded constants):
   *   Ep(0)     = 0.5 * sqrt(0)                                  = 0
   *   Ep(1)     = 0.5 * sqrt(1)                                  = 0.5
   *   Ep(0.25)  = 0.5 * sqrt(0.25)                               = 0.25
   *   Ep(2)     = 0.17883277265534577 * ln(2 - 0.28466890937217996)
   *              + 0.5599107277627162
   *             = 0.17883277265534577 * ln(1.71533109062782004)
   *              + 0.5599107277627162
   *             = 0.17883277265534577 * 0.5395291149...
   *              + 0.5599107277627162
   *             ~ 0.65639262...
   *
   * NOTE ON GUARD PATH: the initial guard-check before the transfer body
   * is the compiler's static-init prologue. On the very first call, if
   * `Ep::c` is unset, the .cold.1 helper runs `__cxa_guard_acquire`,
   * stores `c` and releases the guard. Subsequent calls always reach the
   * transfer body @0xffa30. In TS we transcribe the steady-state
   * (post-init) behaviour: the constant `HGHLG_OETF_Ep_c_f64` is the
   * initialised value.
   */
  public static Ep(E: number): number { // @Helium 0xff9f0
    // Transfer body @Helium 0xffa30..0xffa79 (see method-header disasm map).
    // ucomisd 1.0, E; jae SDR (1.0 >= E)
    if (HGHLG_OETF_EP_THRESHOLD_1_F64 >= E) {
      // SDR arm @0xffa65..0xffa79: sqrt(E) then multiply by 0.5.
      return HGHLG_OETF_EP_SDR_MULT_F64 * Math.sqrt(E);
    }
    // HDR arm @0xffa3e..0xffa64:
    //   E - b, ln, * a, + c
    const eMinusB = E + HGHLG_OETF_EP_NEG_B_F64;          // @0xffa3e  addsd -b, xmm1
    const lnVal = Math.log(eMinusB);                       // @0xffa4a  callq _log
    const scaled = HGHLG_OETF_EP_A_F64 * lnVal;            // @0xffa4f  mulsd a
    return scaled + HGHLG_OETF_Ep_c_f64;                   // @0xffa57  addsd c
  }
}
