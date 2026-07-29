// raw-port/src/render/HGPQ_OOTF.ts
//
// FCP `HGPQ::OOTF` — a nested facade class in Helium's `HGPQ` (Perceptual
// Quantizer / BT.2100) namespace. Despite living under `HGPQ`, this class
// implements the BT.2100 PQ **opto-optical transfer function** — scene
// light to display light — which is built out of the classic ITU-R BT.709
// OETF (α·x^0.45 − (α−1)) plus a display gamma of 2.4 (BT.1886). It is a
// THIN wrapper around one of two leaf render nodes:
//   - `HgcBT2100_PQ_OOTF`          — the exact two-segment OETF + pow(·,2.4)
//   - `HgcBT2100_PQ_OOTF_qtApprox` — a single-power form `p3 * x^1.226993918`
//                                    (matching the C() reference-math
//                                    `flag=true` branch when the caller
//                                    passes `y = d2/d1`).
//
// The ctor picks between them via a `bool qtApprox` argument; it stashes
// the inner node at `this+0x198` and precomputes a packed set of four
// f32 scale coefficients at `this+0x1a0..0x1af`.
//
// FRAMEWORK: Helium.framework (x86_64 slice; fat-slice offset 0x4000;
// the thin binary at /tmp/Helium.x86_64 has VA==file offset, so every
// RIP-relative constant address below is a direct file offset).
//
// SYMBOLS (Helium x86_64):
//   0x000fe0c0  HGPQ::OOTF::C(double, bool, double)     [static — pure OOTF math]
//   0x000fe140  HGPQ::OOTF::OOTF(bool, double, double)  [C2 base ctor]
//   0x000fe230  HGPQ::OOTF::OOTF(bool, double, double)  [C1 complete — tail-jmps C2]
//   0x000fe240  HGPQ::OOTF::~OOTF()                     [D2 base dtor]
//   0x000fe280  HGPQ::OOTF::~OOTF()                     [D1 complete dtor]
//   0x000fe2c0  HGPQ::OOTF::~OOTF()                     [D0 deleting dtor]
//   0x000fe310  HGPQ::OOTF::GetOutput(HGRenderer*)      [wires leaf params]
//
// DECODES (all under raw-port/re/disasm/):
//   Helium.HGPQ_OOTF.C.s          (@0xfe0c0)
//   Helium.HGPQ_OOTF.C1.s         (@0xfe230)
//   Helium.HGPQ_OOTF.C2.s         (@0xfe140)
//   Helium.HGPQ_OOTF.D0.s         (@0xfe2c0)
//   Helium.HGPQ_OOTF.D1.s         (@0xfe280)
//   Helium.HGPQ_OOTF.D2.s         (@0xfe240)
//   Helium.HGPQ_OOTF.GetOutput.s  (@0xfe310)
//
// LAYOUT (inherits HGNode; sizeof HGNode header >= 0x198):
//   +0x000  vtable ptr                             (installed @0xfe161 via
//                                                   `leaq 0x918018(%rip), %rax`)
//   +0x198  HgcBT2100_PQ_OOTF{,_qtApprox}* inner   (allocated @0xfe17a/@0xfe191)
//   +0x1a0  float32 p0  = f32( 1.099 * y )         [alpha·y — BT.709 α scaled]
//   +0x1a4  float32 p1  = f32(-0.099 * y )         [-(α-1)·y]
//   +0x1a8  float32 p2  = f32( 4.5   * y )         [slope·y — BT.709 linear seg]
//   +0x1ac  float32 p3  = f32(  d2/d1 )            [RATIO — not y (see note)]
//   All four written as a single 16-byte movapd @0xfe1e4 (see the doc
//   comment on the ctor below for the full cvtpd2ps + unpcklpd chain that
//   places these four f32s in this exact order).
//
//   Where y = pow(d2/d1, 1/2.4), computed once in the ctor @0xfe1ba by
//   `_pow` on the pre-spilled ratio d2/d1 with exponent 0.4166666666666667
//   (= 1/2.4) from @0x3d0d78.
//
//   NOTE on p3: it is *not* y — the ctor spills `d2/d1` to -0x30(%rbp) at
//   @0xfe1ad BEFORE calling `_pow`, so when `unpcklpd -0x30(%rbp), xmm0`
//   later assembles the 4th packed double @0xfe1d3, it pulls back the
//   PRE-pow ratio. That fell out consistent with the semantic role of the
//   4th slot in `GetOutput`'s qtApprox path (@0xfe3cf), where it enters
//   `SetParameter(0, 1.0, 1.227, p3, 0)` as the pow-multiplier — and
//   `p3 * x^1.227 = (d2/d1) * x^1.227` matches the C() math for
//   `HGPQ::OOTF::C(x, flag=true, y=d2/d1)` (i.e. y == d2/d1 is what
//   callers pass in the qtApprox scenario). Do not "correct" this to y.
//
// DECODED CONSTANTS (from Helium.x86_64 with VA==file offset; every
// RIP-relative constant is next_ip + disp32):
//
//   HGPQ::OOTF::C(double, bool, double) @0xfe0c0 (all f64 — 8-byte movsd):
//     0x3d0d70 : 1.22699386503067487   (single-power OOTF exponent, flag=true)  @0xfe0dc
//     0x3d0d40 : 0.018                 (BT.709 linear/curve knee)               @0xfe0e6
//     0x3d0d50 : 0.45                  (BT.709 OETF exponent)                   @0xfe0f0
//     0x3d0d58 : 1.099                 (BT.709 α)                               @0xfe0fd
//     0x3d0d60 : -0.099                (= -(α - 1))                             @0xfe105
//     0x3d0d48 : 4.5                   (BT.709 linear-segment slope)            @0xfe10f
//     0x3d0d68 : 2.4                   (BT.1886 display gamma)                  @0xfe117
//
//   ctor @0xfe140/@0xfe230 (f64 unless noted):
//     0x3d0d78 : 0.4166666666666667    (= 1/2.4 — inverse display gamma)        @0xfe1b2
//     0x3d10a0 : [ 1.099, -0.099 ]     (packed mulpd @0xfe1c3)
//     0x3d0d48 : 4.5                   (aliased with C's @0xfe10f load)         @0xfe1cb
//
//   GetOutput @0xfe310 (all f32 — 4-byte movss unless noted):
//     0x3d0f6c : 0.018f            (linear/curve knee, layer-0 4th arg)  @0xfe381
//     0x3d0f70 : 0.45f             (OETF exponent, layer-1 1st arg)      @0xfe394
//     0x3ca278 : 2.4f              (display gamma, layer-1 2nd arg)      @0xfe39c
//     0x3c7cc0 : 1.0f              (qtApprox multiplier, layer-0 1st)    @0xfe3da
//     0x3d0f74 : 1.226993918f      (qtApprox exponent, layer-0 2nd)      @0xfe3e2
//
// These are the ITU-R BT.709 OETF constants + BT.1886 gamma:
//   BT.709 OETF:   V = 4.5 * L                      for L <= 0.018
//                  V = 1.099 * L^0.45 - 0.099       for L >  0.018
//   BT.1886:       Ld = V^2.4
//   BT.2100 PQ OOTF (Rec. ITU-R BT.2100 Table 5):
//                  Ld = pow( bt709_oetf(x), 2.4 ) * y
//                  where y = pow(d2/d1, 1/2.4) is the peak-nits scale
//                  precomputed by the ctor.
//   qtApprox:      Ld ≈ (d2/d1) * x^1.22699386503067487  (single-power fit).
//
// UNDECODED CALLEES / FRONTIER (each gets a throwing stub citing its @0xADDR):
//   HGNode::HGNode()                                     @Helium 0xfe15c
//   HGObject::operator new(size_t)                       @Helium 0xfe175 / 0xfe18c
//   HgcBT2100_PQ_OOTF_qtApprox::HgcBT2100_PQ_OOTF_qtApprox() @Helium 0xfe180
//   HgcBT2100_PQ_OOTF::HgcBT2100_PQ_OOTF()                @Helium 0xfe197
//   HGObject::operator delete(void*)                     @Helium 0xfe1ff / 0xfe2f6
//   HGNode::~HGNode()                                    @Helium 0xfe207 / 0xfe21a / 0xfe271 / 0xfe2b1 / 0xfe2e8
//   inner vtable +0x18 (~leaf dtor slot)                 @Helium 0xfe265 / 0xfe2a5 / 0xfe2e2
//   HGRenderer::GetInput(HGNode*, int)                   @Helium 0xfe32c
//   inner vtable +0x78 (HGNode::SetInput slot)           @Helium 0xfe33c
//   ___dynamic_cast (to HgcBT2100_PQ_OOTF or _qtApprox)  @Helium 0xfe359 / 0xfe3ca
//   inner vtable +0x60 (HGNode::SetParameter slot)       @Helium 0xfe38e / 0xfe3b2 / 0xfe3f2
//
// The two vtable slots at +0x60 and +0x78 on the inner leaves match the
// canonical `HGNode` vtable layout used by HGPQ::EOTF (see HGNode.ts /
// HGPQ_EOTF.ts). The typeinfo-guided `___dynamic_cast` dispatch — one
// try to `HgcBT2100_PQ_OOTF*`, then a fall-through to
// `HgcBT2100_PQ_OOTF_qtApprox*` — is transcribed faithfully rather than
// being collapsed into a bool check on the ctor arg (the runtime dispatch
// is what the binary does; we don't rewrite it).

/* ------------------------------------------------------------------ */
/* Opaque frontier types — resolved by companion ports.                */
/* ------------------------------------------------------------------ */

export interface HGRenderer {}
export interface HGNodeLike {}

/* ------------------------------------------------------------------ */
/* Undecoded-frontier stubs (each throws with its @0xADDR).            */
/* ------------------------------------------------------------------ */

/** Base-class ctor tail-called by the C2 ctor @Helium 0xfe15c. */
function HGNode_ctor_call(_self: object): void { // @Helium 0xfe15c
  throw new Error(
    "HGNode::HGNode() not yet transcribed (@Helium 0xfe15c — HGPQ::OOTF C2 base-call)",
  );
}

/** `HGObject::operator new(0x1a0)` — allocates the inner leaf node. */
function HGObject_operator_new(_bytes: number): object { // @Helium 0xfe175 / 0xfe18c
  throw new Error(
    "HGObject::operator new(unsigned long) not yet transcribed (@Helium 0xfe175 / 0xfe18c — HGPQ::OOTF ctor alloc of inner leaf)",
  );
}

/** `HgcBT2100_PQ_OOTF_qtApprox::HgcBT2100_PQ_OOTF_qtApprox()` — leaf ctor. */
function HgcBT2100_PQ_OOTF_qtApprox_ctor(_p: object): void { // @Helium 0xfe180
  throw new Error(
    "HgcBT2100_PQ_OOTF_qtApprox::HgcBT2100_PQ_OOTF_qtApprox() not yet transcribed (@Helium 0xfe180 — HGPQ::OOTF ctor qtApprox inner-node construction)",
  );
}

/** `HgcBT2100_PQ_OOTF::HgcBT2100_PQ_OOTF()` — leaf ctor. */
function HgcBT2100_PQ_OOTF_ctor(_p: object): void { // @Helium 0xfe197
  throw new Error(
    "HgcBT2100_PQ_OOTF::HgcBT2100_PQ_OOTF() not yet transcribed (@Helium 0xfe197 — HGPQ::OOTF ctor exact inner-node construction)",
  );
}

/**
 * `HGRenderer::GetInput(HGNode*, int)` fetches the primary source node
 * upstream of `this` in the render graph.
 */
function HGRenderer_GetInput(_r: HGRenderer, _n: HGNodeLike, _idx: number): HGNodeLike { // @Helium 0xfe32c
  throw new Error(
    "HGRenderer::GetInput(HGNode*, int) not yet transcribed (@Helium 0xfe32c — HGPQ::OOTF::GetOutput source-input fetch)",
  );
}

/**
 * Virtual dispatch through the inner leaf's vtable +0x78
 * (`HGNode::SetInput(int, HGNode*)` per HGNode's canonical vtable).
 * Called before the dynamic_cast — inner may be either
 * `HgcBT2100_PQ_OOTF*` or `HgcBT2100_PQ_OOTF_qtApprox*`; the SetInput
 * slot is at the same offset on both (both derive from HGNode).
 */
function inner_SetInput(
  _inner: object,
  _slot: number,
  _source: HGNodeLike,
): void { // @Helium 0xfe33c (vtable +0x78)
  throw new Error(
    "HgcBT2100_PQ_OOTF{,_qtApprox} vtable +0x78 (HGNode::SetInput) not yet transcribed (@Helium 0xfe33c — HGPQ::OOTF::GetOutput input wiring)",
  );
}

/**
 * C++ RTTI `___dynamic_cast(src, srcTypeInfo, dstTypeInfo, hint)` — the
 * FCP binary calls this twice inside `GetOutput` to select the
 * parameter-upload path. We model both call sites; the port's semantics
 * are: return a truthy handle iff `inner` was constructed as the requested
 * leaf subclass (matching the flag the ctor was called with).
 */
function dynamic_cast_to_HgcBT2100_PQ_OOTF(_p: object): object | null { // @Helium 0xfe359
  throw new Error(
    "___dynamic_cast to HgcBT2100_PQ_OOTF* not yet transcribed (@Helium 0xfe359 — HGPQ::OOTF::GetOutput exact-leaf branch)",
  );
}

function dynamic_cast_to_HgcBT2100_PQ_OOTF_qtApprox(_p: object): object { // @Helium 0xfe3ca
  throw new Error(
    "___dynamic_cast to HgcBT2100_PQ_OOTF_qtApprox* not yet transcribed (@Helium 0xfe3ca — HGPQ::OOTF::GetOutput qtApprox-leaf branch)",
  );
}

/**
 * Virtual dispatch through the inner leaf's vtable +0x60
 * (`HGNode::SetParameter(int, float, float, float, float)` per HGNode's
 * canonical vtable). Three call sites in `GetOutput` — see @0xADDR list
 * in the file header.
 */
function inner_SetParameter(
  _inner: object,
  _slot: number,
  _x: number,
  _y: number,
  _z: number,
  _w: number,
): void { // @Helium 0xfe38e / 0xfe3b2 / 0xfe3f2 (vtable +0x60)
  throw new Error(
    "HgcBT2100_PQ_OOTF{,_qtApprox} vtable +0x60 (HGNode::SetParameter) not yet transcribed (@Helium 0xfe38e / 0xfe3b2 / 0xfe3f2 — HGPQ::OOTF::GetOutput param upload)",
  );
}

/* ------------------------------------------------------------------ */
/* HGPQ::OOTF                                                          */
/* ------------------------------------------------------------------ */

/**
 * `HGPQ::OOTF` — BT.2100 PQ opto-optical transfer function facade.
 *
 * Nested inside FCP's `HGPQ` C++ namespace; exposed here as
 * `HGPQ_OOTF` (file name uses `::` → `_`). See file header for the
 * full symbol table, layout, and decoded constants.
 */
export class HGPQ_OOTF {
  /**
   * +0x198 — pointer to the leaf render node this class wraps. Either
   * a `HgcBT2100_PQ_OOTF` (when the ctor's `qtApprox` flag was false —
   * @0xfe197) or a `HgcBT2100_PQ_OOTF_qtApprox` (when true — @0xfe180).
   */
  public inner: object;

  /**
   * +0x1a0..0x1af — four packed float32 scale coefficients written by the
   * ctor at @0xfe1e4 as a single 16-byte movapd. See the doc comment on
   * the ctor for the exact cvtpd2ps + unpcklpd chain that places them
   * in this order.
   *   +0x1a0 : f32( 1.099 * y )     alpha·y      — BT.709 α scaled by y
   *   +0x1a4 : f32(-0.099 * y )     -(α-1)·y     — BT.709 β scaled by y
   *   +0x1a8 : f32( 4.5   * y )     slope·y      — BT.709 linear-segment
   *   +0x1ac : f32( d2/d1        )  RATIO        — NOT y (see file header)
   *
   * where y = pow(d2/d1, 1/2.4).
   */
  public p0: number;  // +0x1a0 — f32( 1.099 * y )
  public p1: number;  // +0x1a4 — f32(-0.099 * y )
  public p2: number;  // +0x1a8 — f32( 4.5   * y )
  public p3: number;  // +0x1ac — f32( d2/d1     )  (the pre-pow ratio; see file header NOTE)

  /* ---------------- static: pure OOTF math ------------------ */

  /**
   * HGPQ::OOTF::C(double x, bool flag, double y) — Helium @0xfe0c0.
   * Reference implementation of the BT.2100 PQ OOTF (scene light `x`,
   * peak-scaled by `y`). Two modes:
   *
   *   flag == true  (qtApprox):
   *       return y * pow(x, 1.22699386503067487);      // single-power fit
   *
   *   flag == false (exact BT.709 OETF + BT.1886 gamma):
   *       V = (x <= 0.018) ? 4.5*x
   *                        : 1.099 * pow(x, 0.45) + (-0.099);
   *       return y * pow(V, 2.4);
   *
   * Common early-out: x <= 0 returns 0 (xmm2 seeded to 0 before the
   * `jae` at @0xfe0c4/@0xfe0c8; NaN falls through — `pow(NaN, k)` is
   * NaN and `y * NaN` propagates).
   *
   * Transcription of the asm (all addresses @0xfe0c0..@0xfe136):
   *
   *   xorpd  %xmm2, %xmm2                           ; xmm2 = 0
   *   ucomisd %xmm0, %xmm2 ; jae 0xfe132            ; if 0 >= x (i.e. x<=0) return 0
   *   pushq %rbp; movq %rsp,%rbp; subq $0x10,%rsp
   *   testb  %dil, %dil                             ; test flag byte
   *   movsd  %xmm1, -0x8(%rbp)                      ; spill y -> stack
   *   je     0xfe0e6                                ; if !flag -> exact branch
   *     movsd  0x3d0d70(%rip), %xmm1                ; xmm1 = 1.22699386503067487
   *     jmp    0xfe11f                              ; -> single pow(x, 1.227)
   *   0xfe0e6:                                      ; !flag path (exact)
   *     ucomisd 0x3d0d40(%rip), %xmm0               ; cmp x, 0.018 (AT&T src,dst -> flags = x - 0.018)
   *     jbe    0xfe10f                              ; if x <= 0.018 -> linear
   *       movsd  0x3d0d50(%rip), %xmm1              ; xmm1 = 0.45
   *       callq  _pow                               ; xmm0 = x^0.45
   *       mulsd  0x3d0d58(%rip), %xmm0              ; xmm0 *= 1.099
   *       addsd  0x3d0d60(%rip), %xmm0              ; xmm0 += -0.099
   *       jmp    0xfe117
   *     0xfe10f:                                    ; linear branch
   *       mulsd  0x3d0d48(%rip), %xmm0              ; xmm0 *= 4.5
   *     0xfe117:
   *       movsd  0x3d0d68(%rip), %xmm1              ; xmm1 = 2.4
   *   0xfe11f:
   *       callq  _pow                               ; xmm0 = pow(V or x, 2.4 or 1.227)
   *       movsd  -0x8(%rbp), %xmm2                  ; reload y
   *       mulsd  %xmm0, %xmm2                       ; xmm2 = y * pow_result
   *       (epilogue)
   *   0xfe132: movapd %xmm2, %xmm0 ; retq           ; return xmm2
   *
   * NaN semantics: `ucomisd` sets ZF=PF=CF=1 (unordered) so `jae` on the
   * top-level x-guard does NOT fire for NaN x — the code falls through
   * into the flag-test, and eventually into pow which propagates NaN;
   * `y * NaN == NaN` is returned. On the inner `ucomisd 0.018, x`
   * guard (@0xfe0e6), NaN causes `jbe` (CF|ZF=1|1) to FIRE, taking the
   * linear branch: `4.5*NaN = NaN`, then `pow(NaN,2.4)=NaN`, then
   * `y*NaN=NaN`. Both paths propagate NaN correctly. We use `!==`/`<=`
   * checks that mirror this — NOT Object.is.
   */
  public static C(x: number, flag: boolean, y: number): number { // @Helium 0xfe0c0
    // xorpd xmm2,xmm2 ; ucomisd xmm0,xmm2 ; jae 0xfe132   @0xfe0c0..0xfe0c8
    // ucomisd flags = (xmm2 CMP xmm0) = (0 CMP x): jae fires when 0 >= x (CF=0),
    // i.e. x <= 0. Returns xmm2 = 0. NaN: unordered CF=1 -> jae does NOT fire.
    if (x <= 0) {
      return 0; // movapd %xmm2(=0), %xmm0 ; ret  @0xfe132/@0xfe136
    }
    // (NaN branch falls through — pow(NaN, k)*y propagates NaN.)

    let val: number;
    let exp: number;
    if (flag) {
      // testb %dil,%dil ; je 0xfe0e6 -> not taken (flag true)
      // movsd 0x3d0d70, xmm1   @0xfe0dc  = 1.22699386503067487
      // jmp 0xfe11f            @0xfe0e4  (straight to pow(x, 1.227))
      val = x;
      exp = 1.22699386503067487; // single-power OOTF exp @0x3d0d70
    } else {
      // ucomisd 0.018(%rip), xmm0 ; jbe 0xfe10f    @0xfe0e6/@0xfe0ee
      // AT&T `ucomisd src,dst` sets flags for (dst - src) = (x - 0.018).
      // jbe fires when CF=1 or ZF=1, i.e. x <= 0.018.
      // NaN: unordered -> CF=1 -> jbe FIRES -> linear branch (propagates NaN).
      if (x <= 0.018) { // @0x3d0d40
        // mulsd 4.5(%rip), xmm0                         @0xfe10f
        val = x * 4.5; // 4.5 @0x3d0d48
      } else {
        // movsd 0.45(%rip), xmm1 ; callq _pow          @0xfe0f0/@0xfe0f8
        //   -> xmm0 = pow(x, 0.45)
        // mulsd 1.099(%rip), xmm0 ; addsd -0.099(%rip), xmm0  @0xfe0fd/@0xfe105
        val = Math.pow(x, 0.45) * 1.099 + -0.099;
        // (0.45 @0x3d0d50 ; 1.099 @0x3d0d58 ; -0.099 @0x3d0d60)
        // NOTE: transcribed as (pow*1.099) + (-0.099) to mirror the asm's
        // mulsd-then-addsd instruction pair — NOT collapsed to 1.099*p-0.099.
      }
      // movsd 2.4(%rip), xmm1                          @0xfe117
      exp = 2.4; // @0x3d0d68
    }
    // callq _pow                                       @0xfe11f
    // movsd -0x8(%rbp), %xmm2   (xmm2 = spilled y)      @0xfe124
    // mulsd %xmm0, %xmm2        (xmm2 = y * pow_res)    @0xfe129
    // movapd %xmm2, %xmm0 ; ret @0xfe132/@0xfe136
    return y * Math.pow(val, exp);
  }

  /* ---------------- ctor: HGPQ::OOTF(bool, double, double) ---- */

  /**
   * HGPQ::OOTF::OOTF(bool qtApprox, double d1, double d2) — Helium
   * @0xfe140 (C2). The C1 complete ctor @0xfe230 is a bare `push/pop
   * rbp ; jmp __ZN4HGPQ4OOTFC2Ebdd` — i.e. C1 tail-calls C2 with no
   * body of its own. Transcription:
   *
   *   pushq/movq/pushq*3/subq $0x28                      @0xfe140..0xfe149
   *   movaps %xmm1, -0x30(%rbp)     ; -0x30 = d2         @0xfe14d
   *   movsd  %xmm0, -0x38(%rbp)     ; -0x38 = d1         @0xfe151
   *   movl   %esi, %r14d            ; r14d = qtApprox    @0xfe156
   *   movq   %rdi, %rbx             ; rbx  = this        @0xfe159
   *   HGNode::HGNode(this);                              @0xfe15c
   *   this->vtable = &_ZTVN4HGPQ4OOTFE                   @0xfe161..0xfe168
   *   if (qtApprox) {                                    @0xfe16b (testl r14d)
   *     inner = HGObject::operator new(0x1a0);           @0xfe175
   *     HgcBT2100_PQ_OOTF_qtApprox::HgcBT2100_PQ_OOTF_qtApprox(inner); @0xfe180
   *   } else {
   *     inner = HGObject::operator new(0x1a0);           @0xfe18c
   *     HgcBT2100_PQ_OOTF::HgcBT2100_PQ_OOTF(inner);     @0xfe197
   *   }
   *   this->0x198 = inner;                               @0xfe19c
   *
   *   // Precompute y = (d2/d1)^(1/2.4) as f64:
   *   movapd -0x30(%rbp), xmm0      ; xmm0 = d2          @0xfe1a3
   *   divsd  -0x38(%rbp), xmm0      ; xmm0 = d2 / d1     @0xfe1a8
   *   movapd xmm0, -0x30(%rbp)      ; spill ratio → -0x30 (overwrites d2)   @0xfe1ad
   *   movsd  0.4166666666...(%rip), xmm1 ; xmm1 = 1/2.4  @0xfe1b2 (@0x3d0d78)
   *   callq  _pow                   ; xmm0 = (d2/d1)^(1/2.4) = y            @0xfe1ba
   *
   *   // Broadcast y into a packed pair, scale, narrow, pack into 4 f32:
   *   movddup xmm0, xmm1                     ; xmm1 = [y, y]                  @0xfe1bf
   *   mulpd   [1.099, -0.099](%rip), xmm1    ; xmm1 = [1.099y, -0.099y]       @0xfe1c3
   *   mulsd   4.5(%rip), xmm0                 ; xmm0.lo = 4.5*y (hi untouched) @0xfe1cb
   *   unpcklpd -0x30(%rbp), xmm0              ; xmm0 = [4.5*y, d2/d1]          @0xfe1d3
   *                                          ; ^ reads back the SPILLED RATIO,
   *                                          ; not y — the pre-pow spill @0xfe1ad
   *                                          ; is what gets packed into the
   *                                          ; 4th slot.
   *   cvtpd2ps xmm0, xmm0                     ; low64 = f32(4.5y) | f32(d2/d1) @0xfe1d8
   *   cvtpd2ps xmm1, xmm1                     ; low64 = f32(1.099y) | f32(-0.099y) @0xfe1dc
   *   unpcklpd xmm0, xmm1                     ; xmm1 = [xmm1_lo64, xmm0_lo64]      @0xfe1e0
   *                                          ; = 4x f32: [f32(1.099y), f32(-0.099y),
   *                                          ;            f32(4.5y),   f32(d2/d1)]
   *   movapd  xmm1, 0x1a0(%rbx)               ; store 16 bytes at +0x1a0           @0xfe1e4
   *
   * The exception-cleanup tails @0xfe1f9..@0xfe222 (two `__Unwind_Resume`
   * paths) are the standard "if inner ctor throws -> delete(inner) +
   * ~HGNode(this) + _Unwind_Resume". In this port the inner ctors are
   * throw-stubs, so any exception simply propagates.
   */
  public constructor(qtApprox: boolean, d1: number, d2: number) { // @Helium 0xfe140 (C2) / 0xfe230 (C1)
    HGNode_ctor_call(this); // @0xfe15c
    // vtable install @0xfe161..@0xfe168 — modelled as a no-op; the
    // vtable resolves through explicit method calls on this object.

    // testl %r14d,%r14d ; je 0xfe187   @0xfe16b/@0xfe16e
    let raw: object;
    if (qtApprox) {
      // qtApprox branch: alloc + HgcBT2100_PQ_OOTF_qtApprox ctor
      // movl $0x1a0, %edi ; callq operator new    @0xfe170..0xfe175
      raw = HGObject_operator_new(0x1a0);
      // movq %rax, %rdi ; callq _qtApprox ctor    @0xfe17d..0xfe180
      HgcBT2100_PQ_OOTF_qtApprox_ctor(raw);
      // jmp 0xfe19c                                @0xfe185
    } else {
      // exact branch: alloc + HgcBT2100_PQ_OOTF ctor
      // movl $0x1a0, %edi ; callq operator new    @0xfe187..0xfe18c
      raw = HGObject_operator_new(0x1a0);
      // movq %rax, %rdi ; callq _exact ctor       @0xfe194..0xfe197
      HgcBT2100_PQ_OOTF_ctor(raw);
    }
    // movq %r14, 0x198(%rbx)                       @0xfe19c
    this.inner = raw;

    // Precompute y = (d2/d1)^(1/2.4)  (all f64)
    // xmm0 = d2 (-0x30) ; xmm0 /= d1 (-0x38)       @0xfe1a3/@0xfe1a8
    // NOTE: the ratio is spilled to -0x30 @0xfe1ad BEFORE the pow call,
    // so the 4th lane below reads back the ratio, not y. Keep both
    // values in scope in the TS port to mirror this.
    const ratio = d2 / d1;
    // movsd 1/2.4(%rip), xmm1  ; callq _pow        @0xfe1b2/@0xfe1ba
    const y = Math.pow(ratio, 0.4166666666666667); // 1/2.4 @0x3d0d78

    // Pack four f32s into the layout at 0x1a0..0x1af via the cvtpd2ps +
    // unpcklpd chain @0xfe1bf..0xfe1e0. Each field is the f64 product
    // narrowed to f32 by `cvtpd2ps` — modelled with `Math.fround`
    // (single conversion; f64 arithmetic first, then narrow).
    //
    // packed mulpd constants @0x3d10a0 : [1.099, -0.099]  (mulpd @0xfe1c3)
    this.p0 = Math.fround( 1.099 * y);    // +0x1a0
    this.p1 = Math.fround(-0.099 * y);    // +0x1a4
    // scalar mulsd @0x3d0d48 : 4.5    (mulsd @0xfe1cb, aliases C's @0xfe10f)
    this.p2 = Math.fround( 4.5   * y);    // +0x1a8
    // fourth lane = f32(ratio) — the pre-pow d2/d1 spilled at @0xfe1ad
    // and pulled back through `unpcklpd -0x30(%rbp), xmm0` @0xfe1d3.
    this.p3 = Math.fround(ratio);         // +0x1ac
  }

  /* ---------------- dtor: HGPQ::~OOTF ------------------------- */

  /**
   * HGPQ::OOTF::~OOTF() — Helium @0xfe240 (D2), @0xfe280 (D1),
   * @0xfe2c0 (D0 deleting). Bodies:
   *
   *   D2 @0xfe240:
   *     this->vtable = &_ZTVN4HGPQ4OOTFE (base-in-vtable)     @0xfe246
   *     inner = this->0x198                                   @0xfe250
   *     if (inner) {
   *       vt = *(void**)inner
   *       call *(vt+0x18)(inner)  // inner->vtable[0x18]      @0xfe25c..0xfe265
   *     }
   *     tail-jmp HGNode::~HGNode(this)                        @0xfe271
   *
   *   D1 @0xfe280: identical body to D2 (different vtable-in-complete
   *     pointer @0xfe286).
   *
   *   D0 @0xfe2c0:
   *     this->vtable = &_ZTVN4HGPQ4OOTFE                      @0xfe2c9
   *     inner = this->0x198                                   @0xfe2d3
   *     if (inner) call *(vt+0x18)(inner)                     @0xfe2df..0xfe2e2
   *     HGNode::~HGNode(this);                                @0xfe2e8
   *     tail-jmp HGObject::operator delete(this)              @0xfe2f6
   *
   * The inner leaf's vtable slot +0x18 is `~HgcBT2100_PQ_OOTF{,_qtApprox}()`
   * (per HGNode's canonical vtable: *0x18 = D0 deleting dtor). JS/TS
   * doesn't have manual delete; the whole thing is subsumed by GC.
   * We model destroy() as a manual method for symmetry with the port —
   * intentionally a no-op action-wise (see HGPQ_EOTF.destroy comment).
   */
  public destroy(): void { // @Helium 0xfe2c0 (D0)
    // The inner-node's D0 slot vtable[+0x18] is a frontier — throwing
    // here on invocation would break test harnesses that construct/
    // destroy the class. In JS the whole ownership graph is handled by
    // GC, so this is intentionally a no-op *action-wise* but the
    // provenance is documented for when the leaf classes land.
    //
    // (If a caller ever needs a semantic dtor beyond GC — e.g. to
    // trigger the vtable+0x18 call for parity — swap this line for a
    // throw citing @Helium 0xfe2e2.)
    void this.inner;
  }

  /* ---------------- GetOutput ---------------------------------- */

  /**
   * HGPQ::OOTF::GetOutput(HGRenderer* r) — Helium @0xfe310.
   * Transcription:
   *
   *   pushq/movq/pushq*3/pushq %rax                            @0xfe310..0xfe319
   *   movq %rdi, %rbx           ; rbx = this                  @0xfe31a
   *   movq 0x198(%rdi), %r14    ; r14 = inner                 @0xfe31d
   *
   *   // source = HGRenderer::GetInput(r, this, 0)
   *   movq %rsi, %rdi           ; %rdi = r
   *   movq %rbx, %rsi           ; %rsi = this
   *   xorl %edx, %edx           ; %edx = 0
   *   callq __ZN10HGRenderer8GetInputEP6HGNodei                @0xfe32c
   *
   *   // inner->vtable[0x78](inner, 0, source)  — HGNode::SetInput slot
   *   movq (%r14), %rcx         ; rcx = *inner (vtable)
   *   movq %r14, %rdi           ; arg0 = inner
   *   xorl %esi, %esi           ; arg1 = 0
   *   movq %rax, %rdx           ; arg2 = source
   *   callq *0x78(%rcx)                                        @0xfe33c
   *
   *   // r15 = this->0x198 (reload)
   *   movq 0x198(%rbx), %r15                                   @0xfe33f
   *
   *   // dynamic_cast<HgcBT2100_PQ_OOTF*>(inner)
   *   leaq __ZTI6HGNode(%rip), %rsi
   *   leaq __ZTI17HgcBT2100_PQ_OOTF(%rip), %rdx
   *   movq %r15, %rdi
   *   xorl %ecx, %ecx
   *   callq ___dynamic_cast                                    @0xfe359
   *   testq %rax, %rax
   *   je 0xfe3b7                ; if cast failed -> qtApprox path
   *
   *   ; ---- exact (HgcBT2100_PQ_OOTF) path ----
   *   movq %rax, %r14           ; r14 = casted inner
   *   movss 0x1a0(%rbx), %xmm0  ; xmm0 = p0 = f32( 1.099 * y)  @0xfe366
   *   movss 0x1a4(%rbx), %xmm1  ; xmm1 = p1 = f32(-0.099 * y)  @0xfe36e
   *   movss 0x1a8(%rbx), %xmm2  ; xmm2 = p2 = f32( 4.5   * y)  @0xfe376
   *   movq (%rax), %rax         ; rax = vtable
   *   movss 0.018f(%rip), %xmm3 ; xmm3 = 0.018f  @0x3d0f6c     @0xfe381
   *   movq %r14, %rdi
   *   xorl %esi, %esi           ; slot 0
   *   callq *0x60(%rax)         ; SetParameter(0, p0, p1, p2, 0.018f)   @0xfe38e
   *
   *   movq (%r14), %rax
   *   movss 0.45f(%rip), %xmm0  ; xmm0 = 0.45f  @0x3d0f70      @0xfe394
   *   movss 2.4f(%rip), %xmm1   ; xmm1 = 2.4f   @0x3ca278      @0xfe39c
   *   xorps %xmm2, %xmm2
   *   xorps %xmm3, %xmm3
   *   movq %r14, %rdi
   *   movl $1, %esi             ; slot 1
   *   callq *0x60(%rax)         ; SetParameter(1, 0.45f, 2.4f, 0, 0)    @0xfe3b2
   *   jmp 0xfe3f5
   *
   *   ; ---- qtApprox (HgcBT2100_PQ_OOTF_qtApprox) path ---- @0xfe3b7
   *   leaq __ZTI6HGNode(%rip), %rsi
   *   leaq __ZTI26HgcBT2100_PQ_OOTF_qtApprox(%rip), %rdx
   *   movq %r15, %rdi
   *   xorl %ecx, %ecx
   *   callq ___dynamic_cast                                    @0xfe3ca
   *   movss 0x1ac(%rbx), %xmm2  ; xmm2 = p3 = f32(d2/d1)       @0xfe3cf
   *   movq (%rax), %rcx
   *   movss 1.0f(%rip), %xmm0   ; xmm0 = 1.0f    @0x3c7cc0     @0xfe3da
   *   movss 1.226993918f(%rip), %xmm1 ; xmm1 = 1.226993918f  @0x3d0f74 @0xfe3e2
   *   xorps %xmm3, %xmm3
   *   movq %rax, %rdi
   *   xorl %esi, %esi           ; slot 0
   *   callq *0x60(%rcx)         ; SetParameter(0, 1.0f, 1.227f, p3, 0)  @0xfe3f2
   *
   *   ; ---- common tail ----
   *   movq 0x198(%rbx), %rax    ; return this->0x198           @0xfe3f5
   *   (epilogue)
   *
   * i.e. GetOutput binds the source input via a common `SetInput`,
   * then runtime-typeinfo-dispatches to one of two `SetParameter`
   * sequences:
   *   - exact leaf: two-slot upload (piecewise-OETF coeffs, then gamma)
   *   - qtApprox:  one-slot upload (single-power fit)
   * and returns the inner leaf as the produced output node.
   *
   * All five frontier calls (GetInput, SetInput, dynamic_cast × 2,
   * SetParameter × 3) are throwing stubs above; when
   * HGRenderer + HgcBT2100_PQ_OOTF{,_qtApprox} land, this method is
   * fully wired without further changes.
   */
  public GetOutput(r: HGRenderer): object { // @Helium 0xfe310
    // inner = this->0x198   @0xfe31d
    const inner = this.inner;

    // source = HGRenderer::GetInput(r, this, 0)   @0xfe32c
    const source = HGRenderer_GetInput(r, this as unknown as HGNodeLike, 0);

    // inner->vtable[0x78](inner, 0, source)   @0xfe33c
    inner_SetInput(inner, 0, source);

    // reload of this->0x198 into r15   @0xfe33f (redundant in TS since
    // GC keeps `inner` live, but faithfully modelled by using `this.inner`
    // again as the dynamic_cast subject).
    const r15 = this.inner;

    // ___dynamic_cast<HgcBT2100_PQ_OOTF*>(r15)   @0xfe359
    const asExact = dynamic_cast_to_HgcBT2100_PQ_OOTF(r15);
    if (asExact !== null) {
      // ---- exact path ----
      // r14 = casted-inner
      const rInner = asExact;

      // xmm0/1/2 = p0/p1/p2  @0xfe366/@0xfe36e/@0xfe376
      // xmm3 = 0.018f  @0x3d0f6c  @0xfe381
      // callq *0x60(vt)  -> SetParameter(0, p0, p1, p2, 0.018f)   @0xfe38e
      inner_SetParameter(
        rInner,
        0,
        this.p0,                     // f32( 1.099 * y) @+0x1a0
        this.p1,                     // f32(-0.099 * y) @+0x1a4
        this.p2,                     // f32( 4.5   * y) @+0x1a8
        Math.fround(0.018),          // 0.018f          @0x3d0f6c
      );

      // xmm0 = 0.45f  @0x3d0f70  @0xfe394
      // xmm1 = 2.4f   @0x3ca278  @0xfe39c
      // xmm2 = 0 ; xmm3 = 0                            @0xfe3a4/@0xfe3a7
      // callq *0x60(vt)  -> SetParameter(1, 0.45f, 2.4f, 0, 0)     @0xfe3b2
      inner_SetParameter(
        rInner,
        1,
        Math.fround(0.45),           // 0.45f @0x3d0f70
        Math.fround(2.4),            // 2.4f  @0x3ca278
        Math.fround(0),
        Math.fround(0),
      );
      // jmp 0xfe3f5                                    @0xfe3b5
    } else {
      // ---- qtApprox path ----   @0xfe3b7
      // ___dynamic_cast<HgcBT2100_PQ_OOTF_qtApprox*>(r15)  @0xfe3ca
      const rInner = dynamic_cast_to_HgcBT2100_PQ_OOTF_qtApprox(r15);

      // xmm2 = p3 = f32(d2/d1)  @+0x1ac  @0xfe3cf
      // xmm0 = 1.0f            @0x3c7cc0  @0xfe3da
      // xmm1 = 1.226993918f    @0x3d0f74  @0xfe3e2
      // xmm3 = 0                          @0xfe3ea
      // callq *0x60(vt)  -> SetParameter(0, 1.0f, 1.227f, p3, 0)   @0xfe3f2
      inner_SetParameter(
        rInner,
        0,
        Math.fround(1.0),            // 1.0f          @0x3c7cc0
        Math.fround(1.226993918),    // 1.226993918f  @0x3d0f74 (=f32 1.22699386503067487)
        this.p3,                     // f32(d2/d1)    @+0x1ac
        Math.fround(0),
      );
    }

    // return this->0x198   @0xfe3f5
    return this.inner;
  }
}
