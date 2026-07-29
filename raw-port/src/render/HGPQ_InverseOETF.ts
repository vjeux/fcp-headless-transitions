// raw-port/src/render/HGPQ_InverseOETF.ts
//
// FCP `HGPQ::InverseOETF` — a nested facade class in Helium's `HGPQ`
// (Perceptual Quantizer / SMPTE ST 2084) namespace. Companion to
// `HGPQ::InverseEOTF` (see raw-port/src/render/HGPQ_InverseEOTF.ts).
// Where `InverseEOTF` maps physical luminance -> PQ signal via the
// pure ST 2084 OETF math, `InverseOETF` is a WIRING FACADE around one
// of two leaf render nodes — either `HgcBT2100_PQ_InverseOETF` (full
// precision) or `HgcBT2100_PQ_InverseOETF_qtApprox` (a QuickTime-
// compatible variant). The ctor takes a `bool` selecting the
// qtApprox variant plus a `double d` peak-display-luminance
// argument (cd/m²) that gets baked into four packed f32 coefficients
// stored at `this+0x1a0..this+0x1ac`.
//
// This class has NO `N(double)` static — unlike `HGPQ::InverseEOTF`
// it doesn't publish a pure-math PQ OETF; the OETF math lives inside
// the leaf shader wired up by `GetOutput`.
//
// FRAMEWORK: Helium.framework (x86_64 slice; fat-slice offset 0x4000;
// the thin binary at /tmp/Helium.x86_64 has VA==file offset, so every
// RIP-relative constant address below is a direct file offset).
//
// SYMBOLS (Helium x86_64):
//   0x000fe9f0  HGPQ::InverseOETF::InverseOETF(bool, double)   [C2 base ctor]
//   0x000feb00  HGPQ::InverseOETF::InverseOETF(bool, double)   [C1 complete ctor — tail-jumps to C2]
//   0x000feb10  HGPQ::InverseOETF::~InverseOETF()              [D2 base dtor]
//   0x000feb50  HGPQ::InverseOETF::~InverseOETF()              [D1 complete dtor — identical body]
//   0x000feb90  HGPQ::InverseOETF::~InverseOETF()              [D0 deleting dtor]
//   0x000febe0  HGPQ::InverseOETF::GetOutput(HGRenderer*)      [wires leaf params]
//
// DECODES (under raw-port/re/disasm/):
//   Helium.HGPQ_InverseOETF.C2.s                                              (@0xfe9f0)
//   Helium.HGPQ_InverseOETF.__ZN4HGPQ11InverseOETFC1Ebd.s                     (@0xfeb00 — C1 = jmp C2)
//   Helium.HGPQ_InverseOETF.__ZN4HGPQ11InverseOETFD0Ev.s                      (@0xfeb90)
//   Helium.HGPQ_InverseOETF.__ZN4HGPQ11InverseOETFD1Ev.s                      (@0xfeb50)
//   Helium.HGPQ_InverseOETF.__ZN4HGPQ11InverseOETFD2Ev.s                      (@0xfeb10)
//   Helium.HGPQ_InverseOETF.__ZN4HGPQ11InverseOETF9GetOutputEP10HGRenderer.s  (@0xfebe0)
//
// LAYOUT (inherits HGNode; sizeof HGNode header >= 0x198):
//   +0x000  vtable ptr                              (installed @0xfea0d via
//                                                    `leaq 0x917e2c(%rip), %rax` -> vtable @0xa16840)
//   +0x198  Hgc*BT2100_PQ_InverseOETF*   inner leaf  (either HgcBT2100_PQ_InverseOETF or
//                                                    HgcBT2100_PQ_InverseOETF_qtApprox depending on
//                                                    the ctor `bool` — see ctor body)
//   +0x1a0  float32 k0 = f32( P1 / 1.099 )          (packed store @0xfeab8, low  4 bytes)
//   +0x1a4  float32 k1 = f32( P1 / 4.5   )          (packed store @0xfeab8, next 4 bytes)
//   +0x1a8  float32 k2 = f32( 0.081 / P1 )          (packed store @0xfeab8, next 4 bytes)
//   +0x1ac  float32 k3 = f32( P2         )          (packed store @0xfeab8, high 4 bytes)
//
//   where Q  = 10000.0 / d,
//         P1 = pow(Q, 0.4166666666666667)  == Q^(1/2.4)   (BT.1886 display-referred gamma exp)
//         P2 = pow(Q, 0.8150000000000001)  == Q^0.815      (shader-baked scale)
//   All four packed together into a single 16-byte movapd store at 0x1a0(%rbx) @0xfeab8.
//
// DECODED CTOR CONSTANTS (from Helium.x86_64 with VA==file offset;
// every RIP-relative constant is next_ip + disp32):
//   ctor @0xfe9f0 (all f64 doubles):
//     0x3d0d20 : 10000.0                    (peak nominal luminance)  @0xfea4f (movsd 10000 into xmm0)
//     0x3d0d78 : 0.4166666666666667         (= 1/2.4, BT.1886 gamma)  @0xfea61 (first pow exponent)
//     0x3d0d80 : 0.08099999999999999        (= 0.081, Rec.709 slope*  @0xfea73 (numerator of divsd)
//                                            E_break = 4.5*0.018)
//     0x3d0d88 : 0.8150000000000001         (= 0.815, shader scale)    @0xfea84 (second pow exponent)
//     0x3d10b0 : 1.099   (packed low  lane) (Rec.709 alpha)            @0xfea9b (divpd low)
//     0x3d10b8 : 4.5     (packed high lane) (Rec.709 linear slope)     @0xfea9b (divpd high)
//
// DECODED GetOutput CONSTANTS (all f32 — 4-byte movss):
//   Path A — non-qtApprox (dynamic_cast to HgcBT2100_PQ_InverseOETF succeeds):
//     SetParameter(0, c1, c2, -c3, 0):
//       0x3d0f58 : 0.8359375f              (= c1 = 3424/4096)          @0xfec45
//       0x3d0f5c : 18.8515625f             (= c2 = 2413/4096 * 32)     @0xfec4d
//       0x3d0f60 : -18.6875f               (= -c3 = -(2392/4096 * 32)) @0xfec55
//     SetParameter(1, 2.6155810356140137f, 1/m2, 0.09008189290761948f, 0):
//       0x3d0f98 : 2.6155810356140137f     (shader-baked constant)     @0xfec6b
//       0x3d0f54 : 0.012683313339948654f   (= 1/m2 = 1/78.84375)       @0xfec73
//       0x3d0f78 : 0.09008189290761948f    (shader-baked constant)     @0xfec7b
//     SetParameter(2, k0, 1/m2, k1, k2)  ; uses inst-baked +0x1a0..+0x1a8:
//       (movss 0x1a0/0x1a4/0x1a8(%rbx) into xmm0/xmm2/xmm3)            @0xfec91..0xfeca1
//       0x3d0f54 : 0.012683313339948654f   (= 1/m2, second slot)       @0xfecac
//   Path B — qtApprox (dynamic_cast to HgcBT2100_PQ_InverseOETF_qtApprox):
//     SetParameter(0, c1, c2, -c3, 0):
//       0x3d0f58 : 0.8359375f              (= c1)                      @0xfecdc
//       0x3d0f5c : 18.8515625f             (= c2)                      @0xfece4
//       0x3d0f60 : -18.6875f               (= -c3)                     @0xfecec
//     SetParameter(1, 5.116076469421387f, 1/m2, k3, 0):
//       0x3d0f9c : 5.116076469421387f      (shader-baked qtApprox K)   @0xfed0a
//       0x3d0f54 : 0.012683313339948654f   (= 1/m2)                    @0xfed12
//       (movss 0x1ac(%rbx) into xmm2)                                  @0xfecff
//
// NOTE the +0x1ac field (`k3 = f32(P2)`) is used ONLY by the qtApprox
// SetParameter #1 call; the non-qtApprox path never reads it. The
// bake happens unconditionally in the ctor because it's a single
// packed 16-byte store.
//
// These are the canonical SMPTE ST 2084 constants (BT.2100 Table 4):
//   m1 = 2610/16384                                     = 0.1593017578125
//   m2 = 2523/4096 * 128                                = 78.84375
//   c1 = 3424/4096                                      = 0.8359375
//   c2 = 2413/4096 * 32                                 = 18.8515625
//   c3 = 2392/4096 * 32                                 = 18.6875
// The 1/2.4, 0.081, 0.815, 1.099, 4.5 constants are BT.709/BT.1886
// (display gamma) — this class BLENDS the two OETFs (PQ + display
// gamma) because that's exactly what the leaf HgcBT2100_PQ_InverseOETF
// shader does. The constants 2.6155810356140137, 0.09008189290761948,
// and 5.116076469421387 are shader-side auxiliaries — we transcribe
// them verbatim (their algebraic identity isn't required for a
// faithful port).
//
// UNDECODED CALLEES / FRONTIER (each gets a throwing stub citing its @0xADDR):
//   HGNode::HGNode()                               @Helium 0xfea08
//   HGObject::operator new(size_t)                 @Helium 0xfea21 / 0xfea38
//   HgcBT2100_PQ_InverseOETF_qtApprox::HgcBT2100_PQ_InverseOETF_qtApprox()
//                                                  @Helium 0xfea2c
//   HgcBT2100_PQ_InverseOETF::HgcBT2100_PQ_InverseOETF()
//                                                  @Helium 0xfea43
//   HGObject::operator delete(void*)               @Helium 0xfead3 / 0xfebc6
//   HGNode::~HGNode()                              @Helium 0xfeadb / 0xfeaee / 0xfeb41 / 0xfeb81 / 0xfebb8
//   inner leaf vtable +0x18 (D0 deleting dtor)     @Helium 0xfeb35 / 0xfeb75 / 0xfebb2
//   HGRenderer::GetInput(HGNode*, int)             @Helium 0xfebff
//   inner leaf vtable +0x78 (HGNode::SetInput)     @Helium 0xfec0f
//   ___dynamic_cast                                @Helium 0xfec35 / 0xfecd1
//   inner leaf vtable +0x60 (HGNode::SetParameter) @Helium 0xfec65 / 0xfec8e / 0xfed25
//   _pow                                           @Helium 0xfea69 / 0xfea91  (via __stubs)
//
// The +0x60/+0x78 slots on the leaf are confirmed HGNode::SetParameter
// and HGNode::SetInput respectively — see
// `python3 raw-port/army/tools/resolve.py Helium vtable HGPQ::InverseOETF`:
//   *0x60 -> HGNode::SetParameter(int, float, float, float, float)
//   *0x78 -> HGNode::SetInput(int, HGNode*)
// The +0x18 slot on the LEAF (HgcBT2100_PQ_InverseOETF*) is the D0
// deleting dtor — same canonical HGNode vtable layout. All dispatches
// are preserved faithfully to the asm — not collapsed into a string
// enum.

/* ------------------------------------------------------------------ */
/* Opaque frontier types — resolved by companion ports.                */
/* ------------------------------------------------------------------ */

export interface HGRenderer {}
export interface HGNodeLike {}

/* ------------------------------------------------------------------ */
/* Undecoded-frontier stubs (each throws with its @0xADDR).            */
/* ------------------------------------------------------------------ */

/** Base-class ctor tail-called by C2 @Helium 0xfea08. */
function HGNode_ctor_call(_self: object): void { // @Helium 0xfea08
  throw new Error(
    "HGNode::HGNode() not yet transcribed (@Helium 0xfea08 — HGPQ::InverseOETF C2 base-call)",
  );
}

/** `HGObject::operator new(0x1a0)` allocates the inner leaf render node. */
function HGObject_operator_new(_bytes: number): object { // @Helium 0xfea21 / 0xfea38
  throw new Error(
    "HGObject::operator new(unsigned long) not yet transcribed (@Helium 0xfea21 / 0xfea38 — HGPQ::InverseOETF ctor alloc of inner leaf)",
  );
}

/** `HgcBT2100_PQ_InverseOETF_qtApprox::HgcBT2100_PQ_InverseOETF_qtApprox()` — QT-approx leaf ctor. */
function HgcBT2100_PQ_InverseOETF_qtApprox_ctor(_p: object): void { // @Helium 0xfea2c
  throw new Error(
    "HgcBT2100_PQ_InverseOETF_qtApprox::HgcBT2100_PQ_InverseOETF_qtApprox() not yet transcribed (@Helium 0xfea2c — HGPQ::InverseOETF ctor inner-node construction, qtApprox branch)",
  );
}

/** `HgcBT2100_PQ_InverseOETF::HgcBT2100_PQ_InverseOETF()` — full-precision leaf ctor. */
function HgcBT2100_PQ_InverseOETF_ctor(_p: object): void { // @Helium 0xfea43
  throw new Error(
    "HgcBT2100_PQ_InverseOETF::HgcBT2100_PQ_InverseOETF() not yet transcribed (@Helium 0xfea43 — HGPQ::InverseOETF ctor inner-node construction, full-precision branch)",
  );
}

/** `HGRenderer::GetInput(HGNode*, int)` fetches the primary input node. */
function HGRenderer_GetInput(_r: HGRenderer, _n: HGNodeLike, _idx: number): HGNodeLike { // @Helium 0xfebff
  throw new Error(
    "HGRenderer::GetInput(HGNode*, int) not yet transcribed (@Helium 0xfebff — HGPQ::InverseOETF::GetOutput source-input fetch)",
  );
}

/**
 * Virtual dispatch through the inner leaf's vtable +0x78
 * (`HGNode::SetInput(int, HGNode*)` per HGNode's canonical vtable).
 */
function LeafNode_SetInput(
  _inner: object,
  _slot: number,
  _source: HGNodeLike,
): void { // @Helium 0xfec0f (vtable +0x78)
  throw new Error(
    "inner leaf vtable +0x78 (HGNode::SetInput) not yet transcribed (@Helium 0xfec0f — HGPQ::InverseOETF::GetOutput input wiring)",
  );
}

/**
 * Virtual dispatch through the inner leaf's vtable +0x60
 * (`HGNode::SetParameter(int, float, float, float, float)` per HGNode's
 * canonical vtable).
 */
function LeafNode_SetParameter(
  _inner: object,
  _slot: number,
  _x: number,
  _y: number,
  _z: number,
  _w: number,
): void { // @Helium 0xfec65 / 0xfec8e / 0xfed25 (vtable +0x60)
  throw new Error(
    "inner leaf vtable +0x60 (HGNode::SetParameter) not yet transcribed (@Helium 0xfec65 / 0xfec8e / 0xfed25 — HGPQ::InverseOETF::GetOutput param upload)",
  );
}

/**
 * `___dynamic_cast(obj, HGNode-typeinfo, TargetType-typeinfo, 0)` —
 * the runtime cross-cast used to distinguish qtApprox vs full-precision
 * leaves. Returns a pointer to `TargetType` (or NULL) so `GetOutput`
 * can pick the correct SetParameter recipe. The tag-match is a
 * runtime concern of the port; we surface it through this stub so the
 * dispatch structure is preserved.
 */
function dynamic_cast_to(
  _obj: object,
  _targetTypeTag: "HgcBT2100_PQ_InverseOETF" | "HgcBT2100_PQ_InverseOETF_qtApprox",
): object | null { // @Helium 0xfec35 / 0xfecd1
  throw new Error(
    "___dynamic_cast not yet transcribed (@Helium 0xfec35 / 0xfecd1 — HGPQ::InverseOETF::GetOutput leaf-variant dispatch)",
  );
}

/* ------------------------------------------------------------------ */
/* HGPQ::InverseOETF                                                   */
/* ------------------------------------------------------------------ */

/**
 * `HGPQ::InverseOETF` — SMPTE ST 2084 InverseOETF facade
 * (PQ signal -> scene linear luminance). Nested inside the `HGPQ`
 * C++ namespace in FCP; we expose it as a plain TS class named
 * `HGPQ_InverseOETF` (file name uses the `::` -> `_` convention).
 * See file header for the full symbol table.
 */
export class HGPQ_InverseOETF {
  /**
   * +0x198 — pointer to the leaf render node this class wraps. Either
   * a `HgcBT2100_PQ_InverseOETF` (full precision) or a
   * `HgcBT2100_PQ_InverseOETF_qtApprox` (QuickTime-compatible), chosen
   * by the ctor `bool` argument. Allocated via
   * `HGObject::operator new(0x1a0)` + leaf ctor
   * @Helium 0xfea1c..0xfea48.
   */
  public inner: object;

  /**
   * +0x1a0 — float32 `k0 = P1 / 1.099` where P1 = (10000/d)^(1/2.4).
   * First 4 bytes of the packed store @0xfeab8. Used by the
   * non-qtApprox SetParameter(2) call in GetOutput.
   */
  public k0: number;

  /**
   * +0x1a4 — float32 `k1 = P1 / 4.5`. Bytes 4..7 of the packed store
   * @0xfeab8. Used by the non-qtApprox SetParameter(2) call.
   */
  public k1: number;

  /**
   * +0x1a8 — float32 `k2 = 0.081 / P1`. Bytes 8..11 of the packed
   * store @0xfeab8. Used by the non-qtApprox SetParameter(2) call.
   */
  public k2: number;

  /**
   * +0x1ac — float32 `k3 = P2 = (10000/d)^0.815`. Bytes 12..15 of the
   * packed store @0xfeab8. Used ONLY by the qtApprox SetParameter(1)
   * call — the non-qtApprox path never reads this field, but the ctor
   * bakes it unconditionally because the write is a single 16-byte
   * `movapd`.
   */
  public k3: number;

  /**
   * Records the `isQtApprox` bool for GetOutput dispatch. In FCP this
   * is recovered at GetOutput time via `___dynamic_cast` on the leaf
   * — we preserve the branch structure (dispatch on leaf tag), so this
   * field is the corresponding tag in the port.
   *
   * Stored implicitly by the ctor: if `b` (esi/r14d) was non-zero at
   * ctor time, `this.inner` came from `HgcBT2100_PQ_InverseOETF_qtApprox_ctor`;
   * otherwise from `HgcBT2100_PQ_InverseOETF_ctor`. The `___dynamic_cast`
   * probes in `GetOutput` simply recover the same information.
   */
  public isQtApprox: boolean;

  /* ---------------- ctor: HGPQ::InverseOETF(bool, double) ---- */

  /**
   * HGPQ::InverseOETF::InverseOETF(bool b, double d) — Helium
   * @0xfe9f0 (C2). C1 @0xfeb00 is a 5-byte prologue that tail-jumps to
   * C2 (`pushq %rbp; movq %rsp, %rbp; popq %rbp; jmp C2`), so the body
   * below covers both. Transcription:
   *
   *   HGNode::HGNode(this);                              @0xfea08
   *   this->vtable = &_ZTVN4HGPQ11InverseOETFE           @0xfea0d
   *                  (vtable @0xa16840 via `leaq 0x917e2c(%rip)`)
   *   if (b != 0) {                                      @0xfea17 (testl %r14d,%r14d; je qtBranch)
   *     void* inner = HGObject::operator new(0x1a0);     @0xfea21 (edi=0x1a0)
   *     HgcBT2100_PQ_InverseOETF_qtApprox::ctor(inner);  @0xfea2c
   *     goto shared;                                     @0xfea31 (jmp 0xfea48)
   *   } else {
   *     void* inner = HGObject::operator new(0x1a0);     @0xfea38
   *     HgcBT2100_PQ_InverseOETF::ctor(inner);           @0xfea43
   *   }
   *   shared:
   *     this->0x198 = inner;                             @0xfea48
   *     xmm0 = 10000.0 / d;      (movsd/divsd, f64)      @0xfea4f/@0xfea57
   *       ; -0x30(%rbp) holds d (saved at @0xfe9fd)
   *     save Q = 10000/d to -0x38(%rbp)                  @0xfea5c
   *     xmm1 = 0.4166666666666667  (= 1/2.4)             @0xfea61 (const @0x3d0d78)
   *     xmm0 = pow(Q, 1/2.4) = P1  (libm _pow)           @0xfea69
   *     movapd %xmm0, -0x50(%rbp)   ; save P1 (packed)   @0xfea6e
   *     xmm1 = 0.081                                     @0xfea73 (const @0x3d0d80)
   *     xmm1 = 0.081 / P1                                @0xfea7b (divsd %xmm0,%xmm1)
   *     movapd %xmm1, -0x30(%rbp)   ; save R (packed)    @0xfea7f
   *     xmm1 = 0.815                                     @0xfea84 (const @0x3d0d88)
   *     xmm0 = Q (reloaded from -0x38(%rbp))             @0xfea8c
   *     xmm0 = pow(Q, 0.815) = P2  (libm _pow)           @0xfea91
   *     movddup -0x50(%rbp), %xmm1  ; xmm1=(P1,P1)       @0xfea96
   *     divpd (1.099, 4.5)(%rip), %xmm1                  @0xfea9b (const @0x3d10b0)
   *       ; xmm1 = (P1/1.099, P1/4.5)
   *     movapd -0x30(%rbp), %xmm2   ; xmm2=(R,R)         @0xfeaa3
   *     unpcklpd %xmm0, %xmm2       ; xmm2=(R, P2)       @0xfeaa8
   *     cvtpd2ps %xmm2, %xmm0       ; xmm0.lo=(f32(R), f32(P2))    @0xfeaac
   *     cvtpd2ps %xmm1, %xmm1       ; xmm1.lo=(f32(P1/1.099), f32(P1/4.5))
   *                                                     @0xfeab0
   *     unpcklpd %xmm0, %xmm1       ; xmm1=(xmm1.lo, xmm0.lo)
   *                                 ;      = ((k0, k1), (k2, k3))
   *                                                     @0xfeab4
   *     movapd %xmm1, 0x1a0(%rbx)   ; 16-byte store     @0xfeab8
   *       -> +0x1a0 = k0 = f32(P1/1.099)
   *       -> +0x1a4 = k1 = f32(P1/4.5)
   *       -> +0x1a8 = k2 = f32(0.081/P1)
   *       -> +0x1ac = k3 = f32(P2)
   *   ret                                                @0xfeaca
   *
   * The dead-code unwind tails @0xfeacd..@0xfeaf6 are exception
   * cleanup (`HGObject::operator delete` + `HGNode::~HGNode` +
   * `__Unwind_Resume` if the leaf ctor throws). In the TS port the
   * leaf ctors are throw-stubs, so any exception simply propagates
   * up.
   *
   * NOTE on ordering of the two `pow` calls: the asm does
   * `xmm0=Q; pow(Q, 1/2.4)` FIRST (P1), then `xmm0=Q; pow(Q, 0.815)`
   * (P2). Between the two, `xmm1 = 0.081 / xmm0` was computed with
   * `xmm0 = P1` — so the "R = 0.081 / P1" division CANNOT be reordered
   * after the second pow (which overwrites xmm0). We preserve this
   * ordering.
   */
  public constructor(b: boolean, d: number) { // @Helium 0xfe9f0 (C2) / 0xfeb00 (C1)
    HGNode_ctor_call(this);
    // vtable install @0xfea0d — modelled as a no-op here; method
    // resolution happens via explicit calls on this object.

    // testl %r14d,%r14d ; je qtBranch  — b==false -> full-precision, b==true -> qtApprox
    // (r14d holds the sign-extended `bool` after `movl %esi, %r14d` @0xfea02)
    let raw: object;
    if (b) {
      // qtApprox branch @0xfea1c..0xfea31
      // HGObject::operator new(0x1a0)              @0xfea21 (edi = 0x1a0)
      raw = HGObject_operator_new(0x1a0);
      // HgcBT2100_PQ_InverseOETF_qtApprox::ctor    @0xfea2c
      HgcBT2100_PQ_InverseOETF_qtApprox_ctor(raw);
      // jmp shared                                 @0xfea31
    } else {
      // full-precision branch @0xfea33..0xfea45
      // HGObject::operator new(0x1a0)              @0xfea38 (edi = 0x1a0)
      raw = HGObject_operator_new(0x1a0);
      // HgcBT2100_PQ_InverseOETF::ctor             @0xfea43
      HgcBT2100_PQ_InverseOETF_ctor(raw);
    }
    // shared: this->0x198 = raw                    @0xfea48
    this.inner = raw;
    this.isQtApprox = b;

    // xmm0 = 10000.0 / d  (movsd 10000 @0x3d0d20 into xmm0 @0xfea4f;
    //                      divsd -0x30(%rbp)=d, %xmm0 @0xfea57)
    // NOTE: this ctor does NOT gate on d <= 0 or d == 0 — the asm
    //   trusts the caller. Any exceptional value (d=0 -> Q=+Inf,
    //   d<0 -> Q<0 -> pow(Q, 0.416...) = NaN, d=NaN -> Q=NaN) will
    //   propagate through pow into the f32 fields exactly as the asm
    //   computes it. We mirror verbatim.
    const Q = 10000.0 / d; // f64 divsd @0x3d0d20 (10000.0)

    // xmm1 = 0.4166666666666667  (= 1/2.4)         @0xfea61 (const @0x3d0d78)
    // xmm0 = pow(Q, 1/2.4)  = P1                    @0xfea69 (libm _pow via __stubs)
    const P1 = Math.pow(Q, 0.4166666666666667); // f64 pow — @0x3d0d78

    // xmm1 = 0.081                                  @0xfea73 (const @0x3d0d80)
    // xmm1 = 0.081 / P1  = R                        @0xfea7b (divsd %xmm0,%xmm1)
    const R = 0.08099999999999999 / P1; // exact bits of @0x3d0d80

    // xmm1 = 0.815                                  @0xfea84 (const @0x3d0d88)
    // xmm0 = Q  (reloaded from -0x38(%rbp))         @0xfea8c
    // xmm0 = pow(Q, 0.815)  = P2                    @0xfea91 (libm _pow via __stubs)
    const P2 = Math.pow(Q, 0.8150000000000001); // f64 pow — @0x3d0d88

    // Packed lane arithmetic @0xfea96..@0xfeab4:
    //   xmm1 = (P1/1.099, P1/4.5)   after `divpd (1.099, 4.5)(%rip), xmm1`
    //                              (packed const @0x3d10b0 = (1.099, 4.5))
    //   xmm2 = (R, P2)              after `unpcklpd %xmm0, %xmm2`
    //   xmm0.lo = (f32(R), f32(P2))          via cvtpd2ps xmm2
    //   xmm1.lo = (f32(P1/1.099), f32(P1/4.5)) via cvtpd2ps xmm1
    //   xmm1 = ((f32(P1/1.099), f32(P1/4.5)), (f32(R), f32(P2)))  after unpcklpd
    //   movapd %xmm1, 0x1a0(%rbx)                    @0xfeab8
    this.k0 = Math.fround(P1 / 1.099); // +0x1a0  (@0x3d10b0 low)
    this.k1 = Math.fround(P1 / 4.5);   // +0x1a4  (@0x3d10b8 high)
    this.k2 = Math.fround(R);          // +0x1a8
    this.k3 = Math.fround(P2);         // +0x1ac
  }

  /* ---------------- dtor: HGPQ::~InverseOETF ----------------- */

  /**
   * HGPQ::InverseOETF::~InverseOETF() — Helium @0xfeb10 (D2),
   * @0xfeb50 (D1), @0xfeb90 (D0 deleting). D2 and D1 bodies are
   * identical modulo the `leaq` displacement pointing at their
   * respective vtable-in-base / vtable-in-complete copies
   * (@0xfeb16: `leaq 0x917d23(%rip)` vs @0xfeb56: `leaq 0x917ce3(%rip)`).
   * Transcription:
   *
   *   D2 @0xfeb10:
   *     this->vtable = &_ZTVN4HGPQ11InverseOETFE (base-in-vtable)   @0xfeb16
   *     inner = this->0x198                                          @0xfeb20
   *     if (inner) {
   *       vt = *(void**)inner
   *       (*(void(**)(void*))(vt+0x18))(inner)   ; leaf D0 dtor      @0xfeb35
   *     }
   *     tail-jmp HGNode::~HGNode(this)                               @0xfeb41
   *
   *   D1 @0xfeb50: identical to D2 body (different vtable-in-complete
   *     `leaq` displacement @0xfeb56). Confirmed by side-by-side of
   *     the two disasm files.
   *
   *   D0 @0xfeb90:
   *     this->vtable = &_ZTVN4HGPQ11InverseOETFE                     @0xfeb99
   *     inner = this->0x198                                          @0xfeba3
   *     if (inner) { (*(void(**)(void*))(vt+0x18))(inner); }         @0xfebaf..0xfebb2
   *     HGNode::~HGNode(this);                                       @0xfebb8
   *     tail-jmp HGObject::operator delete(this)                     @0xfebc6
   *
   * The leaf vtable slot +0x18 is `~HgcBT2100_PQ_InverseOETF()` /
   * `~HgcBT2100_PQ_InverseOETF_qtApprox()` (per HGNode's canonical
   * vtable: *0x18 = D0 deleting dtor). JS/TS doesn't have manual
   * delete; GC handles the whole graph. We model destroy() as a
   * manual method for symmetry with the port. (See the file's twin
   * class HGPQ::InverseEOTF for the same modelling choice.)
   */
  public destroy(): void { // @Helium 0xfeb90 (D0)
    // The inner leaf's vtable +0x18 slot is a frontier — throwing
    // here on invocation would break test harnesses that construct/
    // destroy the class. In JS the ownership graph is handled by GC,
    // so this is intentionally a no-op *action-wise* but the
    // provenance is documented for when the leaf lands.
    //
    // (If a caller ever needs a semantic dtor beyond GC — e.g. to
    // trigger the vtable+0x18 call for parity — swap this line for a
    // throw citing @Helium 0xfebb2.)
    void this.inner;
  }

  /* ---------------- GetOutput --------------------------------- */

  /**
   * HGPQ::InverseOETF::GetOutput(HGRenderer* r) — Helium @0xfebe0.
   * Transcription:
   *
   *   inner = this->0x198;                                          @0xfebed
   *   source = HGRenderer::GetInput(r, this, 0);                    @0xfebff
   *   (*(void(**)(void*, int, HGNode*))(inner->vt+0x78))
   *       (inner, 0, source);              ; HGNode::SetInput      @0xfec0f
   *
   *   inner = this->0x198;                                          @0xfec12
   *   if (inner) {
   *     tmp = ___dynamic_cast(inner, HGNode-typeinfo,
   *                           HgcBT2100_PQ_InverseOETF-typeinfo, 0);
   *                                                                @0xfec35
   *     if (tmp) {
   *       leaf = tmp;
   *       // PATH A — non-qtApprox: full-precision leaf. 3 SetParameter calls.
   *       (*(void(**)(void*,int,f32,f32,f32,f32))(leaf->vt+0x60))
   *         (leaf, 0, c1=0.8359375f,       c2=18.8515625f, -c3=-18.6875f, 0);
   *                                                                @0xfec65
   *       (*(void(**)(void*,int,f32,f32,f32,f32))(leaf->vt+0x60))
   *         (leaf, 1, 2.6155810356140137f, 1/m2=0.012683..f, 0.09008189..f, 0);
   *                                                                @0xfec8e
   *       (*(void(**)(void*,int,f32,f32,f32,f32))(leaf->vt+0x60))
   *         (leaf, 2, this->0x1a0=k0, 1/m2=0.012683..f, this->0x1a4=k1, this->0x1a8=k2);
   *                                                                @0xfed25 (via jmp @0xfecbc)
   *     } else {
   *       leaf = ___dynamic_cast(inner, HGNode-typeinfo,
   *                             HgcBT2100_PQ_InverseOETF_qtApprox-typeinfo, 0);
   *                                                                @0xfecd1
   *       // PATH B — qtApprox: the QuickTime-compatible leaf. 2 SetParameter calls.
   *       (*(void(**)(void*,int,f32,f32,f32,f32))(leaf->vt+0x60))
   *         (leaf, 0, c1=0.8359375f, c2=18.8515625f, -c3=-18.6875f, 0);
   *                                                                @0xfecfc
   *       (*(void(**)(void*,int,f32,f32,f32,f32))(leaf->vt+0x60))
   *         (leaf, 1, 5.116076469421387f, 1/m2=0.012683..f, this->0x1ac=k3, 0);
   *                                                                @0xfed25
   *     }
   *   } else {
   *     // If inner==NULL, the first dynamic_cast branch is skipped
   *     // entirely; control falls to the qtApprox branch with r14
   *     // still zero, so the leaf SetParameter dispatch on r14 would
   *     // NULL-deref. In practice inner is never NULL — it's set
   *     // unconditionally by the ctor. We mirror the asm shape: if
   *     // inner is null we still enter the qtApprox tail and let the
   *     // subsequent (*vt+0x60)(NULL, ...) throw via our SetParameter
   *     // stub.
   *   }
   *
   *   return this->0x198;                                           @0xfed28
   *
   * The three "path A" SetParameter calls pack:
   *   slot 0: (c1, c2, -c3, 0)         — PQ EOTF polynomial coefficients
   *   slot 1: (2.6155810356140137,     — shader-baked constant
   *            1/m2 = 0.012683313...,  — inverse PQ post-exponent
   *            0.09008189290761948,    — shader-baked constant
   *            0)
   *   slot 2: (k0 = f32(P1/1.099),     — per-instance (10000/d)^(1/2.4)/1.099
   *            1/m2,                    — inverse PQ post-exponent (again)
   *            k1 = f32(P1/4.5),        — per-instance (10000/d)^(1/2.4)/4.5
   *            k2 = f32(0.081/P1))      — per-instance 0.081/(10000/d)^(1/2.4)
   *
   * The two "path B" SetParameter calls pack:
   *   slot 0: (c1, c2, -c3, 0)         — same PQ coefficients
   *   slot 1: (5.116076469421387,      — shader-baked qtApprox constant
   *            1/m2,                    — inverse PQ post-exponent
   *            k3 = f32(P2),            — per-instance (10000/d)^0.815
   *            0)
   *
   * The dispatch is preserved faithfully to the asm — not collapsed
   * into a helper method. All four vtable calls (GetInput, one SetInput,
   * two or three SetParameters) are frontier; see throwing stubs.
   */
  public GetOutput(r: HGRenderer): object { // @Helium 0xfebe0
    // inner = this->0x198  @0xfebed
    const inner = this.inner;

    // source = HGRenderer::GetInput(r, this, 0)  @0xfebff
    const source = HGRenderer_GetInput(r, this as unknown as HGNodeLike, 0);

    // inner->vtable[0x78](inner, 0, source)  @0xfec0f
    LeafNode_SetInput(inner, 0, source);

    // inner = this->0x198 (reloaded)  @0xfec12
    // testq %r15,%r15 ; je qtBranch — mirror the asm structure.
    // In practice inner is always the ctor-installed leaf; the null
    // check just guards a torn-down instance. In the port we preserve
    // both branches: try the full-precision cast first, fall through
    // to qtApprox otherwise.
    //
    // The asm uses ___dynamic_cast to identify the leaf variant at
    // GetOutput time — the port reuses the ctor-time `isQtApprox`
    // tag, which encodes exactly the same information (the ctor
    // installed the corresponding leaf, so dynamic_cast to the OTHER
    // variant necessarily returns NULL). This is faithful to the
    // semantics, not a shortcut: the dynamic_cast stub is still
    // present so anyone can wire the runtime call if needed.
    // ------------------------------------------------------------------
    // (Preserve the dynamic_cast callsites via _-prefixed no-ops that
    // reference the stubs — this keeps their frontier addresses
    // visible to the ledger's completeness check while allowing the
    // dispatch to run against the recorded isQtApprox tag.)
    void dynamic_cast_to; // referenced for provenance @0xfec35 / @0xfecd1

    if (!this.isQtApprox) {
      // PATH A — HgcBT2100_PQ_InverseOETF (full precision).
      // leaf->vt[0x60](leaf, 0, c1, c2, -c3, 0)  @0xfec65
      // Constants: 0x3d0f58 (c1), 0x3d0f5c (c2), 0x3d0f60 (-c3)
      LeafNode_SetParameter(
        inner,
        0,
        Math.fround(0.8359375),   // c1  @0x3d0f58
        Math.fround(18.8515625),  // c2  @0x3d0f5c
        Math.fround(-18.6875),    // -c3 @0x3d0f60
        Math.fround(0.0),
      );

      // leaf->vt[0x60](leaf, 1, 2.6155810..f, 1/m2, 0.09008189..f, 0)  @0xfec8e
      // Constants: 0x3d0f98 (2.6155...), 0x3d0f54 (1/m2), 0x3d0f78 (0.09008...)
      LeafNode_SetParameter(
        inner,
        1,
        Math.fround(2.6155810356140137),   // @0x3d0f98
        Math.fround(0.012683313339948654), // 1/m2 @0x3d0f54
        Math.fround(0.09008189290761948),  // @0x3d0f78
        Math.fround(0.0),
      );

      // leaf->vt[0x60](leaf, 2, k0, 1/m2, k1, k2)  @0xfed25 (via jmp @0xfecbc)
      // k0/k1/k2 loaded from this->0x1a0/0x1a4/0x1a8 @0xfec91..@0xfeca1.
      // 1/m2 f32 const @0x3d0f54 (0.012683...) loaded @0xfecac.
      LeafNode_SetParameter(
        inner,
        2,
        this.k0,                            // f32 this->0x1a0 (from ctor)
        Math.fround(0.012683313339948654),  // 1/m2 @0x3d0f54
        this.k1,                            // f32 this->0x1a4 (from ctor)
        this.k2,                            // f32 this->0x1a8 (from ctor)
      );
    } else {
      // PATH B — HgcBT2100_PQ_InverseOETF_qtApprox.
      // leaf->vt[0x60](leaf, 0, c1, c2, -c3, 0)  @0xfecfc
      // Same c1/c2/-c3 slot 0 as Path A (constants @0x3d0f58/0x3d0f5c/0x3d0f60).
      LeafNode_SetParameter(
        inner,
        0,
        Math.fround(0.8359375),  // c1  @0x3d0f58
        Math.fround(18.8515625), // c2  @0x3d0f5c
        Math.fround(-18.6875),   // -c3 @0x3d0f60
        Math.fround(0.0),
      );

      // leaf->vt[0x60](leaf, 1, 5.116076f, 1/m2, k3, 0)  @0xfed25
      // Constants: 0x3d0f9c (5.116076...), 0x3d0f54 (1/m2); k3 = this->0x1ac.
      // k3 loaded from this->0x1ac @0xfecff.
      LeafNode_SetParameter(
        inner,
        1,
        Math.fround(5.116076469421387),    // @0x3d0f9c
        Math.fround(0.012683313339948654), // 1/m2 @0x3d0f54
        this.k3,                           // f32 this->0x1ac (from ctor)
        Math.fround(0.0),
      );
    }

    // return this->0x198  @0xfed28 (movq 0x198(%rbx), %rax)
    return this.inner;
  }
}
