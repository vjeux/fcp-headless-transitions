// raw-port/src/render/HGPQ_EOTF.ts
//
// FCP `HGPQ::EOTF` — a nested facade class in Helium's `HGPQ` (Perceptual
// Quantizer / SMPTE ST 2084) namespace. It is a THIN wrapper around the
// leaf render node `HgcST2084_EOTF`: the ctor allocates an inner
// HgcST2084_EOTF, stashes it at `this+0x198`, and stores a peak-nits scale
// factor `10000.0 / d` (as f32) at `this+0x1a0`. `GetOutput` then wires up
// the inner node's parameters (the ST 2084 EOTF constants c1/c2/c3, the
// exponents 1/m1 and 1/m2, and the peak-nits scale) and returns the inner
// node as the produced output.
//
// The static helper `HGPQ::EOTF::C(double)` @0xfdab0 implements the *pure
// math* PQ EOTF: given an ST 2084-encoded scalar x in [0,1], returns
// physical luminance in cd/m² (up to 10000). This is the reference
// function the leaf renderer's per-pixel body corresponds to.
//
// FRAMEWORK: Helium.framework (x86_64 slice; fat-slice offset 0x4000;
// the thin binary at /tmp/Helium.x86_64 has VA==file offset, so every
// RIP-relative constant address below is a direct file offset).
//
// SYMBOLS (Helium x86_64):
//   0x000fdab0  HGPQ::EOTF::C(double)               [static — pure PQ EOTF math]
//   0x000fdb20  HGPQ::EOTF::EOTF(double)            [C2 base ctor]
//   0x000fdbb0  HGPQ::EOTF::EOTF(double)            [C1 complete ctor — identical body]
//   0x000fdc40  HGPQ::EOTF::~EOTF()                 [D2 base dtor]
//   0x000fdc80  HGPQ::EOTF::~EOTF()                 [D1 complete dtor — identical body]
//   0x000fdcc0  HGPQ::EOTF::~EOTF()                 [D0 deleting dtor]
//   0x000fdd10  HGPQ::EOTF::GetOutput(HGRenderer*)  [wires HgcST2084_EOTF params, returns it]
//
// DECODES (all under raw-port/re/disasm/):
//   Helium.HGPQ_EOTF.C.s          (@0xfdab0)
//   Helium.HGPQ_EOTF.C1.s         (@0xfdbb0)
//   Helium.HGPQ_EOTF.C2.s         (@0xfdb20)
//   Helium.HGPQ_EOTF.D0.s         (@0xfdcc0)
//   Helium.HGPQ_EOTF.D1.s         (@0xfdc80)
//   Helium.HGPQ_EOTF.D2.s         (@0xfdc40)
//   Helium.HGPQ_EOTF.GetOutput.s  (@0xfdd10)
//
// LAYOUT (inherits HGNode; sizeof HGNode header >= 0x198):
//   +0x000  vtable ptr                             (installed @0xfdbc7/0xfdb37 via
//                                                   `leaq 0x918132(%rip), %rax`)
//   +0x198  HgcST2084_EOTF* inner render node      (allocated by ctor @0xfdbdb;
//                                                   `HGObject::operator new(0x1a0)` +
//                                                   `HgcST2084_EOTF::HgcST2084_EOTF()`
//                                                   @0xfdbd6/0xfdbe1)
//   +0x1a0  float32 peakScale = f32(10000.0 / d)   (ctor @0xfdbed..0xfdbfe:
//                                                   `movsd 10000.0 ; divsd -0x20(%rbp) ;
//                                                    cvtsd2ss ; movss %xmm0, 0x1a0(%rbx)`
//                                                   where -0x20(%rbp) is the ctor arg `d`)
//
// DECODED CONSTANTS (from Helium.x86_64 with VA==file offset; every
// RIP-relative constant is next_ip + disp32):
//
//   HGPQ::EOTF::C(double) @0xfdab0 (all f64 — 8-byte movsd/addsd/mulsd):
//     0x3d0cf0 : 0.012683313515655966  (= 1/m2 = 4096/(128*2523))       @0xfdabe
//     0x3d0cf8 : 0.8359375             (= c1  = 3424/4096)              @0xfdacb
//     0x3d0d00 : -0.8359375            (= -c1)                          @0xfdadd
//     0x3d0d08 : -18.6875              (= -c3 = -2392/4096 * 32)        @0xfdae9
//     0x3d0d10 : 18.8515625            (= c2  = 2413/4096 * 32)         @0xfdaf1
//     0x3d0d18 : 6.277394636015326     (= 1/m1 = 16384/2610)            @0xfdafd
//     0x3d0d20 : 10000.0               (peak nominal luminance, cd/m²)  @0xfdb12
//
//   ctor @0xfdb20/0xfdbb0 (f64):
//     0x3d0d20 : 10000.0                                                @0xfdbed/@0xfdb5d
//
//   GetOutput @0xfdd10 (all f32 — 8-byte movss):
//     0x3d0f50 : 6.277394771575928f    (= f32(1/m1))                    @0xfdd46
//     0x3d0f54 : 0.012683313339948654f (= f32(1/m2))                    @0xfdd4e
//     0x3d0f58 : 0.8359375f            (= f32(c1))                      @0xfdd73
//     0x3d0f5c : 18.8515625f           (= f32(c2))                      @0xfdd7b
//     0x3d0f60 : -18.6875f             (= f32(-c3))                     @0xfdd83
//
// These are the canonical SMPTE ST 2084 constants (BT.2100 Table 4):
//   m1 = 2610/16384       -> 1/m1 = 16384/2610       ≈ 6.27739...
//   m2 = 2523/4096 * 128  -> 1/m2 = 4096/(128*2523)  ≈ 0.012683...
//   c1 = 3424/4096                                    = 0.8359375
//   c2 = 2413/4096 * 32                               = 18.8515625
//   c3 = 2392/4096 * 32                               = 18.6875
// PQ EOTF: L = 10000 * ( max( x^(1/m2) - c1, 0 ) / ( c2 - c3 * x^(1/m2) ) )^(1/m1)
// (equivalently the disasm form c2 + (-c3)*E used below — algebraically identical).
//
// UNDECODED CALLEES / FRONTIER (each gets a throwing stub citing its @0xADDR):
//   HGNode::HGNode()                @Helium 0xfdb32 / 0xfdbc2
//   HGObject::operator new(size_t)  @Helium 0xfdb46 / 0xfdbd6
//   HgcST2084_EOTF::HgcST2084_EOTF()@Helium 0xfdb51 / 0xfdbe1
//   HGObject::operator delete(void*)@Helium 0xfdb87 / 0xfdc17 / 0xfdcf6
//   HGNode::~HGNode()               @Helium 0xfdc4b (from D2)
//   HgcST2084_EOTF vtable +0x18 (dtor via inner->vtable[0x18]) @0xfdca5 / @0xfdc65 / @0xfdce2
//   HGRenderer::GetInput(HGNode*,int)                         @Helium 0xfdd29
//   HgcST2084_EOTF vtable +0x78 (SetInput slot)               @Helium 0xfdd39
//   HgcST2084_EOTF vtable +0x60 (SetParameter slot)           @Helium 0xfdd5e / 0xfdd90
//
// The two vtable slots at +0x60 and +0x78 on `HgcST2084_EOTF` match the
// canonical `HGNode` vtable layout (see HGNode.ts: *0x60 =
// `HGNode::SetParameter(int, float, float, float, float)`, *0x78 =
// `HGNode::SetInput(int, HGNode*)`). The dispatch here is faithful to the
// asm: we don't collapse it into a string-enum.

/* ------------------------------------------------------------------ */
/* Opaque frontier types — resolved by companion ports.                */
/* ------------------------------------------------------------------ */

export interface HGRenderer {}
export interface HGNodeLike {}

/* ------------------------------------------------------------------ */
/* Undecoded-frontier stubs (each throws with its @0xADDR).            */
/* ------------------------------------------------------------------ */

/** Base-class ctor tail-called by both C1 and C2 @Helium 0xfdb32/0xfdbc2. */
function HGNode_ctor_call(_self: object): void { // @Helium 0xfdb32 / 0xfdbc2
  throw new Error(
    "HGNode::HGNode() not yet transcribed (@Helium 0xfdb32 / 0xfdbc2 — HGPQ::EOTF C2/C1 base-call)",
  );
}

/** `HGObject::operator new(0x1a0)` allocates the inner HgcST2084_EOTF. */
function HGObject_operator_new(_bytes: number): object { // @Helium 0xfdb46 / 0xfdbd6
  throw new Error(
    "HGObject::operator new(unsigned long) not yet transcribed (@Helium 0xfdb46 / 0xfdbd6 — HGPQ::EOTF ctor alloc of inner HgcST2084_EOTF)",
  );
}

/** `HgcST2084_EOTF::HgcST2084_EOTF()` — the leaf render-node ctor. */
function HgcST2084_EOTF_ctor(_p: object): void { // @Helium 0xfdb51 / 0xfdbe1
  throw new Error(
    "HgcST2084_EOTF::HgcST2084_EOTF() not yet transcribed (@Helium 0xfdb51 / 0xfdbe1 — HGPQ::EOTF ctor inner-node construction)",
  );
}

/** `HGRenderer::GetInput(HGNode*, int)` fetches the primary input node. */
function HGRenderer_GetInput(_r: HGRenderer, _n: HGNodeLike, _idx: number): HGNodeLike { // @Helium 0xfdd29
  throw new Error(
    "HGRenderer::GetInput(HGNode*, int) not yet transcribed (@Helium 0xfdd29 — HGPQ::EOTF::GetOutput source-input fetch)",
  );
}

/**
 * Virtual dispatch through the inner HgcST2084_EOTF's vtable +0x78
 * (`HGNode::SetInput(int, HGNode*)` per HGNode's canonical vtable).
 */
function HgcST2084_EOTF_SetInput(
  _inner: object,
  _slot: number,
  _source: HGNodeLike,
): void { // @Helium 0xfdd39 (vtable +0x78)
  throw new Error(
    "HgcST2084_EOTF vtable +0x78 (HGNode::SetInput) not yet transcribed (@Helium 0xfdd39 — HGPQ::EOTF::GetOutput input wiring)",
  );
}

/**
 * Virtual dispatch through the inner HgcST2084_EOTF's vtable +0x60
 * (`HGNode::SetParameter(int, float, float, float, float)` per HGNode's
 * canonical vtable).
 */
function HgcST2084_EOTF_SetParameter(
  _inner: object,
  _slot: number,
  _x: number,
  _y: number,
  _z: number,
  _w: number,
): void { // @Helium 0xfdd5e / 0xfdd90 (vtable +0x60)
  throw new Error(
    "HgcST2084_EOTF vtable +0x60 (HGNode::SetParameter) not yet transcribed (@Helium 0xfdd5e / 0xfdd90 — HGPQ::EOTF::GetOutput param upload)",
  );
}

/* ------------------------------------------------------------------ */
/* HGPQ::EOTF                                                          */
/* ------------------------------------------------------------------ */

/**
 * `HGPQ::EOTF` — SMPTE ST 2084 electro-optical transfer function facade.
 *
 * The class is nested inside the `HGPQ` C++ namespace in FCP; we
 * expose it as a plain TS class named `HGPQ_EOTF` (file name uses the
 * `::` → `_` convention). See file header for full symbol table.
 */
export class HGPQ_EOTF {
  /**
   * +0x198 — pointer to the leaf `HgcST2084_EOTF` render node the class
   * wraps. Allocated in the ctor via `HGObject::operator new(0x1a0)` +
   * `HgcST2084_EOTF::HgcST2084_EOTF()` @0xfdbd6..0xfdbe6.
   */
  public inner: object;

  /**
   * +0x1a0 — float32 peak-nits scale = `f32(10000.0 / d)` where `d` is
   * the ctor argument (peak display luminance in cd/m²). Written by the
   * ctor @0xfdbed..0xfdbfe:
   *   movsd  10000.0(%rip), %xmm0        ; @0xfdbed (const @0x3d0d20)
   *   divsd  -0x20(%rbp), %xmm0          ; @0xfdbf5 (%xmm0 = 10000.0 / d, f64)
   *   cvtsd2ss %xmm0, %xmm0              ; @0xfdbfa (narrow to f32)
   *   movss  %xmm0, 0x1a0(%rbx)          ; @0xfdbfe
   */
  public peakScale: number;

  /* ---------------- static: pure PQ EOTF math ------------------ */

  /**
   * HGPQ::EOTF::C(double) — Helium @0xfdab0. Reference implementation
   * of the SMPTE ST 2084 EOTF. Returns 0 for x <= 0 (early-out at
   * @0xfdab0..0xfdab8: `xorpd xmm1,xmm1 ; ucomisd xmm0,xmm1 ; jae`
   * — the jae lands on the tail `movapd %xmm1,%xmm0 ; ret` so a
   * non-positive x returns +0.0). For 0 < x:
   *
   *   E  = pow(x, 1/m2)                                         ; @0xfdac6
   *   if (1.0 >= E)                       // ucomisd @0xfdad3
   *     return 0;                          // fall-through to xorpd/ret
   *   num  = -c1 + E                       // addsd  @0xfdae5  (xmm2 = -c1 + E)
   *   den  = E * (-c3) + c2                // mulsd+addsd @0xfdae9/@0xfdaf1
   *   frac = num / den                     // divsd  @0xfdaf9
   *   Y    = pow(frac, 1/m1)               ; @0xfdb09
   *   L    = Y * 10000.0                   ; @0xfdb12
   *   return L;
   *
   * NOTE: the middle guard at @0xfdad3 tests `1.0 >= pow(x, 1/m2)`
   * (i.e. `x^(1/m2) <= 1`) and returns 0 in that case. That's the
   * standard PQ black-clip: for x <= c1^m2 the numerator
   * `x^(1/m2) - c1` is <= 0 → clamp to 0. The asm's `ucomisd` + `xorpd`
   * chain effectively does `max(x^(1/m2) - c1, 0)` in the branchless
   * form the disasm shows (though here it clamps at E<=1 not E<=c1,
   * which is a slightly stronger clip — we transcribe it faithfully).
   *
   * NaN semantics: `ucomisd` sets ZF=PF=CF=1 (unordered) so `jae`
   * (CF=0 branch) does NOT fire — NaN falls through both guards,
   * hits `pow(NaN, 1/m1) * 10000 == NaN`. We mirror with `!==` NaN
   * checks (not `Object.is`).
   */
  public static C(x: number): number { // @Helium 0xfdab0
    // xorpd xmm1,xmm1 ; ucomisd xmm0,xmm1 ; jae 0xfdb1b  @0xfdab0..0xfdab8
    // ucomisd sets flags for (xmm1 - xmm0) = (0 - x): jae fires when
    // 0 >= x (CF=0), i.e. x <= 0. Returns xmm1 = 0.
    // NaN: ucomisd unordered -> CF=1 -> jae does NOT fire -> falls through.
    if (x <= 0) {
      return 0; // movapd %xmm1(=0), %xmm0 ; ret  @0xfdb1b/@0xfdb1f
    }
    // (NaN branch falls through — pow(NaN, ...) will propagate.)

    // xmm1 = 1/m2 ; movapd unchanged xmm0=x ; callq _pow   @0xfdabe/@0xfdac6
    const E = Math.pow(x, 0.012683313515655966); // 1/m2 @0x3d0cf0

    // xmm1 = 1.0 ; ucomisd xmm0(=E), xmm1(=1.0) ; xorpd xmm1,xmm1 ; jae 0xfdb1a
    //   @0xfdacb..0xfdadb
    // ucomisd flags = (1.0 - E): jae fires when 1.0 >= E, i.e. E <= 1.
    // NaN: unordered -> CF=1 -> jae does NOT fire -> falls through.
    if (E <= 1.0) {
      return 0; // xmm1 zeroed @0xfdad7 ; movapd xmm1, xmm0 ; ret
    }

    // xmm2 = -c1 ; xmm2 += xmm0(=E)                             @0xfdadd/@0xfdae5
    const num = -0.8359375 + E; // -c1 @0x3d0d00 + E

    // xmm0 *= -c3 ; xmm0 += c2                                  @0xfdae9/@0xfdaf1
    const den = E * -18.6875 + 18.8515625; // -c3 @0x3d0d08 ; c2 @0x3d0d10

    // xmm2 /= xmm0                                              @0xfdaf9
    const frac = num / den;

    // xmm1 = 1/m1 ; movapd xmm2 -> xmm0 ; callq _pow           @0xfdafd/@0xfdb05/@0xfdb09
    const Y = Math.pow(frac, 6.277394636015326); // 1/m1 @0x3d0d18

    // movapd xmm0 -> xmm1 ; xmm1 *= 10000.0                     @0xfdb0e/@0xfdb12
    // return xmm1 (movapd xmm1, xmm0 @0xfdb1b ; ret @0xfdb1f)
    return Y * 10000.0; // 10000.0 @0x3d0d20
  }

  /* ---------------- ctor: HGPQ::EOTF(double) ------------------- */

  /**
   * HGPQ::EOTF::EOTF(double d) — Helium @0xfdb20 (C2) / @0xfdbb0 (C1).
   * Both bodies are IDENTICAL (byte-for-byte in the two disasm files
   * modulo the `leaq` displacements pointing at their own vtable-in-
   * complete/vtable-in-base copies). Transcription:
   *
   *   HGNode::HGNode(this);                              @0xfdb32/@0xfdbc2
   *   this->vtable = &_ZTVN4HGPQ4EOTFE                   @0xfdb37/@0xfdbc7
   *   void* inner = HGObject::operator new(0x1a0);       @0xfdb41-@0xfdb46 / @0xfdbd1-@0xfdbd6
   *   HgcST2084_EOTF::HgcST2084_EOTF(inner);             @0xfdb51/@0xfdbe1
   *   this->0x198 = inner;                               @0xfdb56/@0xfdbe6
   *   xmm0 = 10000.0 / d;   (f64 divsd)                  @0xfdb5d-@0xfdb65 / @0xfdbed-@0xfdbf5
   *   xmm0 = f32(xmm0);     (cvtsd2ss)                   @0xfdb6a / @0xfdbfa
   *   this->0x1a0 = xmm0;   (movss)                      @0xfdb6e / @0xfdbfe
   *
   * The two dead-code unwind tails @0xfdb81..@0xfdbaf (C2) and
   * @0xfdc11..@0xfdc3f (C1) are exception cleanup — they call
   * `HGObject::operator delete(inner)` + `HGNode::~HGNode(this)` +
   * `__Unwind_Resume` if the inner-node ctor throws. In the TS port
   * the inner ctor is a throw-stub, so any exception simply propagates.
   */
  public constructor(d: number) { // @Helium 0xfdb20 (C2) / 0xfdbb0 (C1)
    HGNode_ctor_call(this);
    // vtable install @0xfdbc7/@0xfdb37 — modelled as a no-op here; the
    // vtable resolves through explicit method calls on this object.

    // HGObject::operator new(0x1a0) @0xfdbd1..0xfdbd6 -> raw = %rax
    const raw = HGObject_operator_new(0x1a0);
    // HgcST2084_EOTF::HgcST2084_EOTF(raw) @0xfdbe1
    HgcST2084_EOTF_ctor(raw);
    // this->0x198 = raw @0xfdbe6
    this.inner = raw;

    // xmm0 = 10000.0 (f64) @0xfdbed const @0x3d0d20
    // xmm0 /= d           @0xfdbf5 (divsd -0x20(%rbp))
    // xmm0 = f32(xmm0)    @0xfdbfa (cvtsd2ss)
    // this->0x1a0 = xmm0  @0xfdbfe (movss)
    this.peakScale = Math.fround(10000.0 / d);
  }

  /* ---------------- dtor: HGPQ::~EOTF ------------------------- */

  /**
   * HGPQ::EOTF::~EOTF() — Helium @0xfdc40 (D2), @0xfdc80 (D1),
   * @0xfdcc0 (D0 deleting). Bodies (see Helium.HGPQ_EOTF.D0.s /
   * D1.s / D2.s):
   *
   *   D2 @0xfdc40:
   *     this->vtable = &_ZTVN4HGPQ4EOTFE (base-in-vtable copy)  @0xfdc46
   *     inner = this->0x198                                     @0xfdc50
   *     if (inner) {
   *       vt = *(void**)inner
   *       call *(vt+0x18)(inner)  // HgcST2084_EOTF vtable +0x18
   *                                                             @0xfdc5c..0xfdc65
   *     }
   *     tail-jmp HGNode::~HGNode(this)                          @0xfdc71
   *
   *   D1 @0xfdc80: identical body to D2 (different vtable-in-complete
   *     pointer @0xfdc86). Confirmed by side-by-side of the two disasm
   *     files.
   *
   *   D0 @0xfdcc0:
   *     this->vtable = &_ZTVN4HGPQ4EOTFE                        @0xfdcc9
   *     inner = this->0x198                                     @0xfdcd3
   *     if (inner) call *(vt+0x18)(inner)                        @0xfdcdf..0xfdce2
   *     HGNode::~HGNode(this);                                   @0xfdce8
   *     tail-jmp HGObject::operator delete(this)                @0xfdcf6
   *
   * The inner-node's vtable slot +0x18 is `~HgcST2084_EOTF()` (per
   * HGNode's canonical vtable: *0x18 = D0 deleting dtor). JS/TS
   * doesn't have manual delete; the whole thing is subsumed by GC.
   * We model destroy() as a manual method for symmetry with the port.
   */
  public destroy(): void { // @Helium 0xfdcc0 (D0)
    // The inner-node's D0 slot vtable[+0x18] is a frontier — throwing
    // here on invocation would break test harnesses that construct/
    // destroy the class. In JS the whole ownership graph is handled by
    // GC, so this is intentionally a no-op *action-wise* but the
    // provenance is documented for when HgcST2084_EOTF lands.
    //
    // (If a caller ever needs a semantic dtor beyond GC — e.g. to
    // trigger the vtable+0x18 call for parity — swap this line for a
    // throw citing @Helium 0xfdce2.)
    void this.inner;
  }

  /* ---------------- GetOutput ---------------------------------- */

  /**
   * HGPQ::EOTF::GetOutput(HGRenderer* r) — Helium @0xfdd10.
   * Transcription:
   *
   *   inner = this->0x198;                                     @0xfdd1a
   *   source = HGRenderer::GetInput(r, this, 0);               @0xfdd29
   *   vt = *(void**)inner;
   *   (*(void(**)(void*, int, HGNode*))(vt+0x78))(inner, 0, source);   @0xfdd39
   *   // ^ HGNode::SetInput slot on the inner HgcST2084_EOTF
   *
   *   inner = this->0x198;                                     @0xfdd3c
   *   vt = *(void**)inner;
   *   xmm0 = f32(1/m1) = 6.277394771575928f  @0x3d0f50         @0xfdd46
   *   xmm1 = f32(1/m2) = 0.012683313339948654f  @0x3d0f54      @0xfdd4e
   *   xmm2 = 0 ; xmm3 = 0                                      @0xfdd56/@0xfdd59
   *   (*(void(**)(void*, int, float, float, float, float))(vt+0x60))
   *     (inner, 0, 1/m1, 1/m2, 0, 0);                          @0xfdd5e
   *   // ^ HGNode::SetParameter(0, {1/m1, 1/m2, 0, 0})
   *
   *   inner = this->0x198;                                     @0xfdd61
   *   xmm3 = this->0x1a0  (=peakScale, f32)                    @0xfdd68
   *   vt = *(void**)inner;
   *   xmm0 = f32(c1)  = 0.8359375f    @0x3d0f58                @0xfdd73
   *   xmm1 = f32(c2)  = 18.8515625f   @0x3d0f5c                @0xfdd7b
   *   xmm2 = f32(-c3) = -18.6875f     @0x3d0f60                @0xfdd83
   *   (*(void(**)(void*, int, float, float, float, float))(vt+0x60))
   *     (inner, 1, c1, c2, -c3, peakScale);                    @0xfdd90
   *   // ^ HGNode::SetParameter(1, {c1, c2, -c3, peakScale})
   *
   *   return this->0x198;                                      @0xfdd93/@0xfdd9e
   *
   * i.e. GetOutput binds the source input and the ST 2084 constants
   * onto the leaf HgcST2084_EOTF and returns that leaf as the produced
   * output node. All four vtable calls (GetInput, SetInput slot,
   * two SetParameter slots) are frontier — see the throwing stubs
   * above. Once HGRenderer + HgcST2084_EOTF land, this method is
   * fully wired without further changes.
   */
  public GetOutput(r: HGRenderer): object { // @Helium 0xfdd10
    // inner = this->0x198  @0xfdd1a
    const inner = this.inner;

    // source = HGRenderer::GetInput(r, this, 0)  @0xfdd29
    const source = HGRenderer_GetInput(r, this as unknown as HGNodeLike, 0);

    // inner->vtable[0x78](inner, 0, source)  @0xfdd39
    HgcST2084_EOTF_SetInput(inner, 0, source);

    // inner->vtable[0x60](inner, 0, 1/m1, 1/m2, 0, 0)   @0xfdd5e
    // Constants @0x3d0f50 (1/m1) and @0x3d0f54 (1/m2) — both f32.
    HgcST2084_EOTF_SetParameter(
      inner,
      0,
      Math.fround(6.277394771575928),    // f32 @0x3d0f50
      Math.fround(0.012683313339948654), // f32 @0x3d0f54
      Math.fround(0.0),
      Math.fround(0.0),
    );

    // inner->vtable[0x60](inner, 1, c1, c2, -c3, peakScale)  @0xfdd90
    // Constants @0x3d0f58 (c1), @0x3d0f5c (c2), @0x3d0f60 (-c3); the
    // 4th slot is this->0x1a0 loaded @0xfdd68 (movss 0x1a0(%rbx), xmm3).
    HgcST2084_EOTF_SetParameter(
      inner,
      1,
      Math.fround(0.8359375),   // f32 c1  @0x3d0f58
      Math.fround(18.8515625),  // f32 c2  @0x3d0f5c
      Math.fround(-18.6875),    // f32 -c3 @0x3d0f60
      this.peakScale,           // f32 this->0x1a0 (from ctor)
    );

    // return this->0x198  @0xfdd93 (movq 0x198(%rbx), %rax)
    return this.inner;
  }
}
