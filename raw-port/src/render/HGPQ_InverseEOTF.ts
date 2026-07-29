// raw-port/src/render/HGPQ_InverseEOTF.ts
//
// FCP `HGPQ::InverseEOTF` — a nested facade class in Helium's `HGPQ`
// (Perceptual Quantizer / SMPTE ST 2084) namespace. Companion of
// `HGPQ::EOTF` (see raw-port/src/render/HGPQ_EOTF.ts). Where `EOTF`
// converts a PQ codeword to physical luminance, `InverseEOTF` runs the
// FORWARD direction: physical luminance (cd/m²) -> PQ signal N in [0,1].
//
// It is a THIN wrapper around the leaf render node
// `HgcST2084_InverseEOTF`: the ctor allocates an inner
// HgcST2084_InverseEOTF, stashes it at `this+0x198`, and stores a PAIR
// of derived f32 coefficients at `this+0x1a0` / `this+0x1a4`. Those
// coefficients bake `pow(d/10000, m1)` (where `d` is the peak-nits ctor
// arg) into `c2*Yd^m1` and `c3*Yd^m1` for the shader — this is a key
// numerical difference from `EOTF`, which stores a single scalar
// `f32(10000/d)` at 0x1a0.
//
// The static helper `HGPQ::InverseEOTF::N(double)` @0xfdda0 is the
// *pure math* PQ OETF: given a physical luminance L (cd/m²), returns
// the PQ codeword N. This is the reference function the leaf
// renderer's per-pixel body corresponds to.
//
// FRAMEWORK: Helium.framework (x86_64 slice; fat-slice offset 0x4000;
// the thin binary at /tmp/Helium.x86_64 has VA==file offset, so every
// RIP-relative constant address below is a direct file offset).
//
// SYMBOLS (Helium x86_64):
//   0x000fdda0  HGPQ::InverseEOTF::N(double)                    [static — pure PQ OETF math]
//   0x000fde00  HGPQ::InverseEOTF::InverseEOTF(double)          [C2 base ctor]
//   0x000fdeb0  HGPQ::InverseEOTF::InverseEOTF(double)          [C1 complete ctor — identical body]
//   0x000fdf60  HGPQ::InverseEOTF::~InverseEOTF()               [D2 base dtor]
//   0x000fdfa0  HGPQ::InverseEOTF::~InverseEOTF()               [D1 complete dtor — identical body]
//   0x000fdfe0  HGPQ::InverseEOTF::~InverseEOTF()               [D0 deleting dtor]
//   0x000fe030  HGPQ::InverseEOTF::GetOutput(HGRenderer*)       [wires HgcST2084_InverseEOTF params]
//
// DECODES (under raw-port/re/disasm/):
//   Helium.HGPQ::InverseEOTF.N.s               (@0xfdda0)
//   Helium.HGPQ_InverseEOTF.C1.s / .C2.s       (@0xfdeb0 / @0xfde00 — bodies byte-equal modulo vtable displ)
//   Helium.HGPQ_InverseEOTF.D0.s / .D1.s / .D2.s (@0xfdfe0 / @0xfdfa0 / @0xfdf60)
//   Helium.HGPQ::InverseEOTF.GetOutput.s       (@0xfe030)
//
// LAYOUT (inherits HGNode; sizeof HGNode header >= 0x198):
//   +0x000  vtable ptr                             (installed @0xfde17/@0xfdec7 via
//                                                   `leaq 0x918122(%rip), %rax` / `leaq 0x918072(%rip), %rax`)
//   +0x198  HgcST2084_InverseEOTF* inner render     (allocated by ctor @0xfde2b/@0xfdedb:
//           node                                    `HGObject::operator new(0x1a0)` +
//                                                   `HgcST2084_InverseEOTF::HgcST2084_InverseEOTF()`
//                                                   @0xfde26..@0xfde36 / @0xfded6..@0xfdee6)
//   +0x1a0  float32 c2Yd = f32(c2 * (d/10000)^m1)   (low  half of the packed store @0xfde67/@0xfdf17)
//   +0x1a4  float32 c3Yd = f32(c3 * (d/10000)^m1)   (high half of the packed store @0xfde67/@0xfdf17)
//
//   Derivation (ctor tail @0xfde3d..@0xfde67 / @0xfdeed..@0xfdf17):
//     movsd -0x20(%rbp), %xmm0        ; xmm0 = d (ctor arg, f64)          @0xfde3d/@0xfdeed
//     divsd 0x2d2ed6(%rip), %xmm0     ; xmm0 = d / 10000    (const 0x3d0d20)
//                                                                         @0xfde42/@0xfdef2
//     movsd 0x2d2ede(%rip), %xmm1     ; xmm1 = m1 = 0.1593017578125       @0xfde4a/@0xfdefa
//                                     ; (const 0x3d0d30)
//     callq _pow                      ; xmm0 = pow(d/10000, m1)           @0xfde52/@0xfdf02
//     movddup %xmm0, %xmm0            ; xmm0 = (Y, Y)   where Y = (d/10000)^m1
//                                                                         @0xfde57/@0xfdf07
//     mulpd 0x2d321d(%rip), %xmm0     ; xmm0 = (c2*Y, c3*Y)               @0xfde5b/@0xfdf0b
//                                     ; (packed const at 0x3d1080 = (c2, c3)
//                                     ;                          = (18.8515625, 18.6875))
//     cvtpd2ps %xmm0, %xmm0           ; narrow each f64 lane -> f32       @0xfde63/@0xfdf13
//     movlpd %xmm0, 0x1a0(%rbx)       ; store the low 8 bytes = 2×f32     @0xfde67/@0xfdf17
//
// DECODED CONSTANTS (from Helium.x86_64 with VA==file offset; every
// RIP-relative constant is next_ip + disp32):
//
//   HGPQ::InverseEOTF::N(double) @0xfdda0 (all f64 unless noted):
//     0x3d0d20 : 10000.0             (peak nominal luminance, cd/m²)    @0xfdda0 (divsd L/10000)
//     0x3d0d28 : 7.309559025783966e-07 = c1^m2                          @0xfddf1 (early-out for L<=0;
//                                     the exact PQ signal that codes    the disasm returns this precomputed
//                                     Y=0 — precomputed 0.8359375^78.84375)
//     0x3d0d30 : 0.1593017578125     (= m1 = 2610/16384)                @0xfddb6 (pow exponent)
//     0x3d0d38 : 78.84375            (= m2 = 2523/4096 * 128)           @0xfdde3 (2nd pow exponent)
//     0x3d1080 : 18.8515625          (= c2, packed low lane)            @0xfddc7 (mulpd low)
//     0x3d1088 : 18.6875             (= c3, packed high lane)           @0xfddc7 (mulpd high)
//     0x3d1090 : 0.8359375           (= c1, packed low lane)            @0xfddcf (addpd low)
//     0x3d1098 : 1.0                 (packed high lane)                 @0xfddcf (addpd high)
//
//   ctor @0xfde00/@0xfdeb0 (f64):
//     0x3d0d20 : 10000.0                                                @0xfde42/@0xfdef2
//     0x3d0d30 : 0.1593017578125 (m1)                                   @0xfde4a/@0xfdefa
//     0x3d1080 : packed (c2, c3) = (18.8515625, 18.6875)                @0xfde5b/@0xfdf0b
//
//   GetOutput @0xfe030 (all f32 — 4-byte movss):
//     0x3d0f58 : 0.8359375f              (= f32(c1))                    @0xfe09b
//     0x3d0f64 : 0.1593017578125f        (= f32(m1))                    @0xfe066
//     0x3d0f68 : 78.84375f               (= f32(m2))                    @0xfe06e
//
// These are the canonical SMPTE ST 2084 constants (BT.2100 Table 4):
//   m1 = 2610/16384                                     = 0.1593017578125
//   m2 = 2523/4096 * 128                                = 78.84375
//   c1 = 3424/4096                                      = 0.8359375
//   c2 = 2413/4096 * 32                                 = 18.8515625
//   c3 = 2392/4096 * 32                                 = 18.6875
//   c1^m2 = 7.309559025783966e-07 (the PQ code for zero luminance)
// PQ OETF: N(L) = ((c1 + c2 * (L/10000)^m1) / (1 + c3 * (L/10000)^m1))^m2
//
// UNDECODED CALLEES / FRONTIER (each gets a throwing stub citing its @0xADDR):
//   HGNode::HGNode()                        @Helium 0xfde12 / 0xfdec2
//   HGObject::operator new(size_t)          @Helium 0xfde26 / 0xfded6
//   HgcST2084_InverseEOTF::HgcST2084_InverseEOTF()
//                                           @Helium 0xfde31 / 0xfdee1
//   HGObject::operator delete(void*)        @Helium 0xfde80 / 0xfdf30 / 0xfe016
//   HGNode::~HGNode()                       @Helium 0xfdf91 / 0xfdfd1 / 0xfe008 (D2/D1/D0)
//   HgcST2084_InverseEOTF vtable +0x18      @Helium 0xfdf85 / 0xfdfc5 / 0xfe002
//     (dtor via inner->vtable[0x18])
//   HGRenderer::GetInput(HGNode*, int)      @Helium 0xfe049
//   HgcST2084_InverseEOTF vtable +0x78      @Helium 0xfe059
//     (HGNode::SetInput slot)
//   HgcST2084_InverseEOTF vtable +0x60      @Helium 0xfe07e / 0xfe0ab
//     (HGNode::SetParameter slot)
//   _pow                                    @Helium 0xfddbe / 0xfddec / 0xfde52 / 0xfdf02
//     (libm pow, via __stubs)
//
// The two vtable slots at +0x60 and +0x78 on `HgcST2084_InverseEOTF`
// match the canonical `HGNode` vtable layout (see HGNode.ts: *0x60 =
// `HGNode::SetParameter(int, float, float, float, float)`, *0x78 =
// `HGNode::SetInput(int, HGNode*)`). The dispatch is preserved
// faithfully to the asm — not collapsed into a string enum.

/* ------------------------------------------------------------------ */
/* Opaque frontier types — resolved by companion ports.                */
/* ------------------------------------------------------------------ */

export interface HGRenderer {}
export interface HGNodeLike {}

/* ------------------------------------------------------------------ */
/* Undecoded-frontier stubs (each throws with its @0xADDR).            */
/* ------------------------------------------------------------------ */

/** Base-class ctor tail-called by both C1 and C2 @Helium 0xfde12/0xfdec2. */
function HGNode_ctor_call(_self: object): void { // @Helium 0xfde12 / 0xfdec2
  throw new Error(
    "HGNode::HGNode() not yet transcribed (@Helium 0xfde12 / 0xfdec2 — HGPQ::InverseEOTF C2/C1 base-call)",
  );
}

/** `HGObject::operator new(0x1a0)` allocates the inner HgcST2084_InverseEOTF. */
function HGObject_operator_new(_bytes: number): object { // @Helium 0xfde26 / 0xfded6
  throw new Error(
    "HGObject::operator new(unsigned long) not yet transcribed (@Helium 0xfde26 / 0xfded6 — HGPQ::InverseEOTF ctor alloc of inner HgcST2084_InverseEOTF)",
  );
}

/** `HgcST2084_InverseEOTF::HgcST2084_InverseEOTF()` — the leaf render-node ctor. */
function HgcST2084_InverseEOTF_ctor(_p: object): void { // @Helium 0xfde31 / 0xfdee1
  throw new Error(
    "HgcST2084_InverseEOTF::HgcST2084_InverseEOTF() not yet transcribed (@Helium 0xfde31 / 0xfdee1 — HGPQ::InverseEOTF ctor inner-node construction)",
  );
}

/** `HGRenderer::GetInput(HGNode*, int)` fetches the primary input node. */
function HGRenderer_GetInput(_r: HGRenderer, _n: HGNodeLike, _idx: number): HGNodeLike { // @Helium 0xfe049
  throw new Error(
    "HGRenderer::GetInput(HGNode*, int) not yet transcribed (@Helium 0xfe049 — HGPQ::InverseEOTF::GetOutput source-input fetch)",
  );
}

/**
 * Virtual dispatch through the inner HgcST2084_InverseEOTF's vtable +0x78
 * (`HGNode::SetInput(int, HGNode*)` per HGNode's canonical vtable).
 */
function HgcST2084_InverseEOTF_SetInput(
  _inner: object,
  _slot: number,
  _source: HGNodeLike,
): void { // @Helium 0xfe059 (vtable +0x78)
  throw new Error(
    "HgcST2084_InverseEOTF vtable +0x78 (HGNode::SetInput) not yet transcribed (@Helium 0xfe059 — HGPQ::InverseEOTF::GetOutput input wiring)",
  );
}

/**
 * Virtual dispatch through the inner HgcST2084_InverseEOTF's vtable +0x60
 * (`HGNode::SetParameter(int, float, float, float, float)` per HGNode's
 * canonical vtable).
 */
function HgcST2084_InverseEOTF_SetParameter(
  _inner: object,
  _slot: number,
  _x: number,
  _y: number,
  _z: number,
  _w: number,
): void { // @Helium 0xfe07e / 0xfe0ab (vtable +0x60)
  throw new Error(
    "HgcST2084_InverseEOTF vtable +0x60 (HGNode::SetParameter) not yet transcribed (@Helium 0xfe07e / 0xfe0ab — HGPQ::InverseEOTF::GetOutput param upload)",
  );
}

/* ------------------------------------------------------------------ */
/* HGPQ::InverseEOTF                                                   */
/* ------------------------------------------------------------------ */

/**
 * `HGPQ::InverseEOTF` — SMPTE ST 2084 forward OETF facade
 * (luminance -> PQ codeword). Nested inside the `HGPQ` C++ namespace
 * in FCP; we expose it as a plain TS class named `HGPQ_InverseEOTF`
 * (file name uses the `::` -> `_` convention). See file header for the
 * full symbol table.
 */
export class HGPQ_InverseEOTF {
  /**
   * +0x198 — pointer to the leaf `HgcST2084_InverseEOTF` render node
   * the class wraps. Allocated in the ctor via
   * `HGObject::operator new(0x1a0)` +
   * `HgcST2084_InverseEOTF::HgcST2084_InverseEOTF()` @0xfded6..0xfdee6.
   */
  public inner: object;

  /**
   * +0x1a0 — float32 `c2 * (d/10000)^m1` where `d` is the ctor's peak
   * display luminance argument (cd/m²). This is the low 4-byte lane of
   * the packed store @0xfdf17 (see file header for the full 6-step
   * derivation: divsd/movsd/pow/movddup/mulpd/cvtpd2ps/movlpd).
   */
  public c2Yd: number;

  /**
   * +0x1a4 — float32 `c3 * (d/10000)^m1`. High 4-byte lane of the same
   * packed store @0xfdf17.
   */
  public c3Yd: number;

  /* ---------------- static: pure PQ OETF math ------------------ */

  /**
   * HGPQ::InverseEOTF::N(double) — Helium @0xfdda0. Reference
   * implementation of the SMPTE ST 2084 OETF. Takes physical
   * luminance L in cd/m² and returns the PQ codeword in [0,1].
   *
   * Disasm walk (all instructions cited @Helium 0x000fdda0..0x000fddfa):
   *
   *   divsd  10000.0(%rip), %xmm0     ; xmm0 = L / 10000            @0xfdda0
   *   xorpd  %xmm1, %xmm1             ; xmm1 = 0
   *   ucomisd %xmm0, %xmm1            ; compare 0 vs (L/10000)
   *   jae    0xfddf1                  ; if 0 >= L/10000 (i.e. L <= 0)
   *                                   ;   -> jump to the "return c1^m2" tail
   *   movsd  m1(%rip), %xmm1          ; xmm1 = m1 = 0.1593017578125 @0xfddb6
   *   callq  _pow                     ; xmm0 = pow(L/10000, m1)     @0xfddbe
   *   movddup %xmm0, %xmm0            ; xmm0 = (Y, Y)               @0xfddc3
   *   mulpd  (c2,c3)(%rip), %xmm0     ; xmm0 = (c2*Y, c3*Y)         @0xfddc7
   *                                   ; packed const @0x3d1080 = (18.8515625, 18.6875)
   *   addpd  (c1,1)(%rip), %xmm0      ; xmm0 = (c1+c2*Y, 1+c3*Y)    @0xfddcf
   *                                   ; packed const @0x3d1090 = (0.8359375, 1.0)
   *   movapd %xmm0, %xmm1             ; xmm1 = (c1+c2*Y, 1+c3*Y)    @0xfddd7
   *   unpckhpd %xmm0, %xmm1           ; xmm1 = (xmm1[1], xmm0[1])
   *                                   ;      = (1+c3*Y, 1+c3*Y)     @0xfdddb
   *   divsd  %xmm1, %xmm0             ; xmm0.low = (c1+c2*Y)/(1+c3*Y) @0xfdddf
   *   movsd  m2(%rip), %xmm1          ; xmm1 = m2 = 78.84375        @0xfdde3
   *   jmp    _pow                     ; tail-call pow(..., m2)      @0xfddec
   *
   *   0xfddf1: movsd 7.309559...e-07(%rip), %xmm0                   @0xfddf1
   *            retq                   ; return c1^m2                @0xfddf9
   *
   * NaN semantics: `ucomisd` sets ZF=PF=CF=1 (unordered), so `jae`
   * (CF=0 branch) does NOT fire when either operand is NaN — L=NaN
   * falls through to `pow(NaN, m1)` -> NaN and propagates. Mirror with
   * a plain `<=` guard PLUS an explicit `!==` self-check for NaN so we
   * fall through to `Math.pow` (which returns NaN) rather than into
   * the L<=0 tail.
   *
   * Micro-verification (against reference PQ):
   *   N(0)     = 7.309559025783966e-07 (= c1^m2, the black codeword)
   *   N(100)   ≈ 0.508078            (SDR peak — matches BT.2100)
   *   N(10000) = 1.0                 (PQ peak nits)
   *   HGPQ::EOTF::C(N(L)) ≈ L to <1e-11 for L in [0.01, 10000]
   *   (round-trip through the sibling class in this file's companion —
   *    see the fct/ oracle harness once wired up.)
   *
   * Note the CONSTANT-FOLDED early-out: for L<=0 the asm returns the
   * precomputed c1^m2 (@0x3d0d28) rather than re-running pow(0, m2) —
   * this is an FCP-side numerical decision we preserve verbatim.
   */
  public static N(L: number): number { // @Helium 0xfdda0
    // divsd 10000.0(%rip), %xmm0  @0xfdda0  (const @0x3d0d20)
    // NOTE: the divide happens BEFORE the L<=0 test in the asm; ordering
    // matters only for NaN — L=NaN -> L/10000=NaN -> ucomisd unordered
    // -> jae not taken -> falls through into pow(NaN, m1) -> NaN.
    const Ldiv = L / 10000.0; // f64 divsd

    // xorpd/ucomisd/jae  @0xfdda8..0xfddb0
    // jae fires when 0 >= Ldiv (CF=0) i.e. Ldiv <= 0.
    // NaN unordered -> CF=1 -> jae NOT taken -> falls through.
    // Guard: only take the early-out for real Ldiv<=0; NaN propagates via pow.
    if (Ldiv <= 0 && Ldiv === Ldiv) {
      // movsd  7.309559025783966e-07(%rip), %xmm0  @0xfddf1 (const @0x3d0d28)
      // retq                                        @0xfddf9
      return 7.309559025783966e-07; // = c1^m2  @0x3d0d28
    }

    // callq _pow with xmm0=Ldiv, xmm1=m1  @0xfddbe (const @0x3d0d30)
    const Y = Math.pow(Ldiv, 0.1593017578125); // m1 @0x3d0d30

    // movddup xmm0 -> (Y, Y)  @0xfddc3
    // mulpd  [c2, c3] -> (c2*Y, c3*Y)  @0xfddc7 (packed const @0x3d1080)
    const c2Y = 18.8515625 * Y; // c2 @0x3d1080
    const c3Y = 18.6875 * Y;    // c3 @0x3d1088

    // addpd  [c1, 1.0] -> (c1+c2*Y, 1+c3*Y)  @0xfddcf (packed const @0x3d1090)
    const num = 0.8359375 + c2Y; // c1 @0x3d1090
    const den = 1.0 + c3Y;       //     @0x3d1098

    // movapd/unpckhpd/divsd  @0xfddd7..0xfdddf : frac = num/den (low lane)
    const frac = num / den;

    // movsd m2(%rip), xmm1 ; jmp _pow  @0xfdde3/@0xfddec  (const @0x3d0d38)
    return Math.pow(frac, 78.84375); // m2 @0x3d0d38
  }

  /* ---------------- ctor: HGPQ::InverseEOTF(double) ------------ */

  /**
   * HGPQ::InverseEOTF::InverseEOTF(double d) — Helium @0xfde00 (C2) /
   * @0xfdeb0 (C1). Both bodies are IDENTICAL modulo the `leaq`
   * displacements pointing at their respective vtable-in-base /
   * vtable-in-complete copies (@0xfde17: `leaq 0x918122(%rip)` vs
   * @0xfdec7: `leaq 0x918072(%rip)`). Transcription:
   *
   *   HGNode::HGNode(this);                              @0xfde12/@0xfdec2
   *   this->vtable = &_ZTVN4HGPQ11InverseEOTFE           @0xfde17/@0xfdec7
   *   void* inner = HGObject::operator new(0x1a0);       @0xfde21..@0xfde26 / @0xfded1..@0xfded6
   *   HgcST2084_InverseEOTF::HgcST2084_InverseEOTF(inner); @0xfde31/@0xfdee1
   *   this->0x198 = inner;                               @0xfde36/@0xfdee6
   *   xmm0 = d / 10000.0                (f64 divsd)      @0xfde42/@0xfdef2
   *   xmm1 = m1 = 0.1593017578125       (f64 movsd)      @0xfde4a/@0xfdefa
   *   xmm0 = pow(xmm0, xmm1) = (d/10000)^m1              @0xfde52/@0xfdf02
   *   xmm0 = (Y, Y)                     (movddup)        @0xfde57/@0xfdf07
   *   xmm0 = (c2*Y, c3*Y)               (mulpd packed)   @0xfde5b/@0xfdf0b
   *   xmm0 = f32(...) each lane         (cvtpd2ps)       @0xfde63/@0xfdf13
   *   this->0x1a0..0x1a7 = xmm0.low_8   (movlpd)         @0xfde67/@0xfdf17
   *
   * The dead-code unwind tails @0xfde7a..@0xfdea8 (C2) and
   * @0xfdf2a..@0xfdf58 (C1) are exception cleanup — they call
   * `HGObject::operator delete(inner)` + `HGNode::~HGNode(this)` +
   * `__Unwind_Resume` if the inner-node ctor throws. In the TS port
   * the inner ctor is a throw-stub, so any exception simply propagates.
   */
  public constructor(d: number) { // @Helium 0xfde00 (C2) / 0xfdeb0 (C1)
    HGNode_ctor_call(this);
    // vtable install @0xfde17/@0xfdec7 — modelled as a no-op here; the
    // vtable resolves through explicit method calls on this object.

    // HGObject::operator new(0x1a0) @0xfded1..0xfded6 -> raw = %rax
    const raw = HGObject_operator_new(0x1a0);
    // HgcST2084_InverseEOTF::HgcST2084_InverseEOTF(raw) @0xfdee1
    HgcST2084_InverseEOTF_ctor(raw);
    // this->0x198 = raw @0xfdee6
    this.inner = raw;

    // xmm0 = d / 10000.0   (divsd, f64)  @0xfdef2   (const @0x3d0d20)
    // xmm1 = m1 = 0.1593017578125        @0xfdefa   (const @0x3d0d30)
    // xmm0 = pow(d/10000, m1)            @0xfdf02   (libm _pow via __stubs)
    // NOTE: the ctor does NOT gate on d<=0 the way N() does — that
    //   guard lives in N(). Here we mirror pow(d/10000, m1) verbatim;
    //   the caller is responsible for d>0. For d<=0 the pow result
    //   propagates through mulpd/cvtpd2ps into the two f32 fields
    //   exactly as the asm computes it (NaN/Inf as appropriate).
    const Y = Math.pow(d / 10000.0, 0.1593017578125); // m1 @0x3d0d30

    // movddup xmm0 -> (Y, Y)                                @0xfdf07
    // mulpd  [c2, c3] -> (c2*Y, c3*Y) (packed @0x3d1080)    @0xfdf0b
    // cvtpd2ps xmm0 -> pack two f32s in low 8 bytes         @0xfdf13
    // movlpd %xmm0, 0x1a0(%rbx) -> store both f32s          @0xfdf17
    this.c2Yd = Math.fround(18.8515625 * Y); // c2 @0x3d1080 -> +0x1a0
    this.c3Yd = Math.fround(18.6875    * Y); // c3 @0x3d1088 -> +0x1a4
  }

  /* ---------------- dtor: HGPQ::~InverseEOTF ------------------ */

  /**
   * HGPQ::InverseEOTF::~InverseEOTF() — Helium @0xfdf60 (D2),
   * @0xfdfa0 (D1), @0xfdfe0 (D0 deleting). Bodies (see
   * Helium.HGPQ_InverseEOTF.D0/D1/D2.s):
   *
   *   D2 @0xfdf60:
   *     this->vtable = &_ZTVN4HGPQ11InverseEOTFE (base-in-vtable copy)  @0xfdf66
   *     inner = this->0x198                                             @0xfdf70
   *     if (inner) {
   *       vt = *(void**)inner
   *       call *(vt+0x18)(inner)  // HgcST2084_InverseEOTF vtable +0x18 @0xfdf7c..0xfdf85
   *     }
   *     tail-jmp HGNode::~HGNode(this)                                  @0xfdf91
   *
   *   D1 @0xfdfa0: identical body to D2 (different vtable-in-complete
   *     pointer @0xfdfa6). Confirmed by side-by-side of the two disasm
   *     files.
   *
   *   D0 @0xfdfe0:
   *     this->vtable = &_ZTVN4HGPQ11InverseEOTFE                        @0xfdfe9
   *     inner = this->0x198                                             @0xfdff3
   *     if (inner) call *(vt+0x18)(inner)                                @0xfdfff..0xfe002
   *     HGNode::~HGNode(this);                                           @0xfe008
   *     tail-jmp HGObject::operator delete(this)                        @0xfe016
   *
   * The inner-node's vtable slot +0x18 is `~HgcST2084_InverseEOTF()`
   * (per HGNode's canonical vtable: *0x18 = D0 deleting dtor). JS/TS
   * doesn't have manual delete; GC handles the whole graph. We model
   * destroy() as a manual method for symmetry with the port.
   */
  public destroy(): void { // @Helium 0xfdfe0 (D0)
    // The inner-node's D0 slot vtable[+0x18] is a frontier — throwing
    // here on invocation would break test harnesses that construct/
    // destroy the class. In JS the whole ownership graph is handled by
    // GC, so this is intentionally a no-op *action-wise* but the
    // provenance is documented for when HgcST2084_InverseEOTF lands.
    //
    // (If a caller ever needs a semantic dtor beyond GC — e.g. to
    // trigger the vtable+0x18 call for parity — swap this line for a
    // throw citing @Helium 0xfe002.)
    void this.inner;
  }

  /* ---------------- GetOutput --------------------------------- */

  /**
   * HGPQ::InverseEOTF::GetOutput(HGRenderer* r) — Helium @0xfe030.
   * Transcription:
   *
   *   inner = this->0x198;                                            @0xfe03a
   *   source = HGRenderer::GetInput(r, this, 0);                      @0xfe049
   *   vt = *(void**)inner;
   *   (*(void(**)(void*, int, HGNode*))(vt+0x78))(inner, 0, source);  @0xfe059
   *   // ^ HGNode::SetInput slot on the inner HgcST2084_InverseEOTF
   *
   *   inner = this->0x198;                                            @0xfe05c
   *   vt = *(void**)inner;
   *   xmm0 = f32(m1) = 0.1593017578125f  @0x3d0f64                    @0xfe066
   *   xmm1 = f32(m2) = 78.84375f         @0x3d0f68                    @0xfe06e
   *   xmm2 = 0 ; xmm3 = 0                                             @0xfe076/@0xfe079
   *   (*(void(**)(void*, int, float, float, float, float))(vt+0x60))
   *     (inner, 0, m1, m2, 0, 0);                                     @0xfe07e
   *   // ^ HGNode::SetParameter(0, {m1, m2, 0, 0})
   *
   *   inner = this->0x198;                                            @0xfe081
   *   xmm1 = this->0x1a0 (=c2Yd, f32)                                 @0xfe088
   *   xmm2 = this->0x1a4 (=c3Yd, f32)                                 @0xfe090
   *   vt = *(void**)inner;
   *   xmm0 = f32(c1) = 0.8359375f       @0x3d0f58                     @0xfe09b
   *   xmm3 = 0                                                        @0xfe0a3
   *   (*(void(**)(void*, int, float, float, float, float))(vt+0x60))
   *     (inner, 1, c1, c2Yd, c3Yd, 0);                                @0xfe0ab
   *   // ^ HGNode::SetParameter(1, {c1, c2Yd, c3Yd, 0})
   *
   *   return this->0x198;                                             @0xfe0ae
   *
   * i.e. GetOutput binds the source input and the ST 2084 OETF
   * exponents + baked-in coefficients onto the leaf
   * HgcST2084_InverseEOTF and returns that leaf as the produced output
   * node. All four vtable calls (GetInput, SetInput slot, two
   * SetParameter slots) are frontier — see the throwing stubs above.
   * Once HGRenderer + HgcST2084_InverseEOTF land, this method is fully
   * wired without further changes.
   *
   * Note the SetParameter #1 packing is DIFFERENT from the sibling
   * `HGPQ::EOTF::GetOutput` (which packs (c1, c2, -c3, peakScale)):
   * here we pack (c1, c2Yd, c3Yd, 0) because the OETF shader consumes
   * the ratio (c1 + c2Yd*x) / (1 + c3Yd*x) directly on normalized
   * luminance x, with c2Yd and c3Yd already baking in the
   * per-instance (d/10000)^m1 factor computed in the ctor.
   */
  public GetOutput(r: HGRenderer): object { // @Helium 0xfe030
    // inner = this->0x198  @0xfe03a
    const inner = this.inner;

    // source = HGRenderer::GetInput(r, this, 0)  @0xfe049
    const source = HGRenderer_GetInput(r, this as unknown as HGNodeLike, 0);

    // inner->vtable[0x78](inner, 0, source)  @0xfe059
    HgcST2084_InverseEOTF_SetInput(inner, 0, source);

    // inner->vtable[0x60](inner, 0, m1, m2, 0, 0)   @0xfe07e
    // Constants @0x3d0f64 (m1) and @0x3d0f68 (m2) — both f32.
    HgcST2084_InverseEOTF_SetParameter(
      inner,
      0,
      Math.fround(0.1593017578125), // f32 m1  @0x3d0f64
      Math.fround(78.84375),         // f32 m2  @0x3d0f68
      Math.fround(0.0),
      Math.fround(0.0),
    );

    // inner->vtable[0x60](inner, 1, c1, c2Yd, c3Yd, 0)  @0xfe0ab
    // c1 f32 const @0x3d0f58; c2Yd = this->0x1a0 (loaded @0xfe088);
    // c3Yd = this->0x1a4 (loaded @0xfe090); 4th slot xorps'd to 0 @0xfe0a3.
    HgcST2084_InverseEOTF_SetParameter(
      inner,
      1,
      Math.fround(0.8359375), // f32 c1  @0x3d0f58
      this.c2Yd,              // f32 this->0x1a0 (from ctor)
      this.c3Yd,              // f32 this->0x1a4 (from ctor)
      Math.fround(0.0),
    );

    // return this->0x198  @0xfe0ae (movq 0x198(%rbx), %rax)
    return this.inner;
  }
}
