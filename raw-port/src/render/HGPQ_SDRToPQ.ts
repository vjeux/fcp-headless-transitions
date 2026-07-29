// raw-port/src/render/HGPQ_SDRToPQ.ts
//
// FCP `HGPQ::SDRToPQ` — a nested facade class in Helium's `HGPQ`
// (Perceptual Quantizer / SMPTE ST 2084) namespace. Sibling of
// `HGPQ::EOTF` / `HGPQ::InverseEOTF` (see the two companion files).
//
// UNLIKE its EOTF siblings, `SDRToPQ` is NOT a thin single-node wrapper.
// It is a MULTI-NODE render-graph BUILDER. Its ctor is a trivial POD
// initializer (vtable + null inner + `referenceWhiteNits = 203.0`), and
// its `GetOutput` chains together THREE freshly-allocated render nodes
// per invocation:
//
//     source (SDR RGB, gamma-encoded) —>
//         [1] HGGamma            (SDR -> linear-light : pow(x, 2.4))
//                 —>
//         [2] HGColorMatrix      (Rec.709 linear -> Rec.2020 linear + peak-nits scale)
//                 —>
//         [3] HGPQ::InverseOOTF  (linear-light -> PQ codeword; wraps HgcBT2100_PQ_OOTF_qtApprox)
//
// The class stashes the freshly-built InverseOOTF at `this->0x198` on
// its way out and returns it as the produced output node. The
// intermediate HGGamma + HGColorMatrix are transferred to the graph by
// their SetInput edges (vtable slot +0x78) and their local references
// are dropped via vtable slot +0x18 (destroy) — the render graph now
// owns them.
//
// The `+0x1a0` slot on `SDRToPQ` itself is a plain `double` — the
// "reference white nits" the SDR white point (typically 203 nits for
// PQ per BT.2408; default is stored as an immediate 0x4069600000000000
// in the ctor). It is settable via `SetReferenceWhiteNits(double)` and
// is USED at `GetOutput` time as the scale factor that maps SDR
// linear-light [0,1] into PQ absolute-luminance space (via
// `refWhiteNits / 100`, narrowed through an f32 round-trip before being
// mixed into the HGColorMatrix rows).
//
// FRAMEWORK: Helium.framework (x86_64 slice; fat-slice offset 0x4000;
// the thin binary at /tmp/Helium.x86_64 has VA==file offset, so every
// RIP-relative constant address below is a direct file offset.)
//
// SYMBOLS (Helium x86_64):
//   0x000ff600  HGPQ::SDRToPQ::SDRToPQ()                       [C2 base ctor]
//   0x000ff640  HGPQ::SDRToPQ::SDRToPQ()                       [C1 complete ctor — identical body]
//   0x000ff680  HGPQ::SDRToPQ::~SDRToPQ()                      [D2 base dtor]
//   0x000ff6c0  HGPQ::SDRToPQ::~SDRToPQ()                      [D1 complete dtor — identical body to D2]
//   0x000ff700  HGPQ::SDRToPQ::~SDRToPQ()                      [D0 deleting dtor]
//   0x000ff750  HGPQ::SDRToPQ::SetReferenceWhiteNits(double)
//   0x000ff760  HGPQ::SDRToPQ::GetOutput(HGRenderer*)
//
// DECODES (all under raw-port/re/disasm/):
//   Helium.HGPQ::SDRToPQ.SDRToPQ.s          (@0xff640 C1; C2 @0xff600 dumped inline below)
//   Helium.HGPQ::SDRToPQ.~SDRToPQ.s         (@0xff700 D0; D1 @0xff6c0 / D2 @0xff680 dumped inline)
//   Helium.HGPQ::SDRToPQ.SetReferenceWhiteNits.s (@0xff750)
//   Helium.HGPQ::SDRToPQ.GetOutput.s        (@0xff760)
//
// LAYOUT (inherits HGNode; sizeof HGNode header >= 0x198):
//   +0x000  vtable ptr = &_ZTVN4HGPQ7SDRToPQE + 0x10
//                                      installed by ctor  @0xff64e/@0xff60e
//                                      and each dtor       @0xff709/@0xff6c6/@0xff686
//   +0x198  HGPQ::InverseOOTF* inner render node
//                                      nulled by ctor      @0xff658/@0xff618
//                                      SET by GetOutput    @0xff90e (movq %r12, 0x198(%r14))
//                                      READ by dtor        @0xff713/@0xff6d0/@0xff690
//   +0x1a0  double referenceWhiteNits      init by ctor        @0xff663/@0xff623 (imm 0x4069600000000000 = 203.0)
//                                      written by SetRef… @0xff754 (movsd %xmm0, 0x1a0(%rdi))
//                                      read by GetOutput   @0xff7d6 (movsd 0x1a0(%r14), %xmm0)
//
// DECODED CONSTANTS (from Helium.x86_64 with VA==file offset; every
// RIP-relative constant is next_ip + disp32):
//
//   ctor @0xff600/@0xff640 (immediate):
//     movabsq $0x4069600000000000  =  f64  203.0    referenceWhiteNits default (BT.2408 SDR white)
//                                                  @0xff663 / @0xff623
//
//   GetOutput @0xff760 — f32 scalars (movss):
//     0x3ca278 : 2.4f            (SDR gamma exponent for HGGamma)      @0xff7b8
//     0x3c7cc0 : 1.0f            (HGGamma 4th SetParameter slot)       @0xff7c0
//
//   GetOutput @0xff760 — f64 scalar (divsd):
//     0x3cd278 : 100.0           (PQ nits-per-hundred divisor)         @0xff7df
//
//   GetOutput @0xff760 — BT.709 -> BT.2020 primaries (f64 3x3 matrix,
//   stored as three (x,y) pairs interleaved with three (z) tails so it
//   loads with movapd + movsd against tail — see body notes):
//     0x3d1130 : (0.627403895934699,  0.329283038377884)  row0.xy      @0xff7f3
//     0x3d0da8 :  0.043313065687417                       row0.z       @0xff803
//     0x3d1140 : (0.069097289358232,  0.919540395075458)  row1.xy      @0xff81d
//     0x3d0db0 :  0.011362315566309                       row1.z       @0xff82d
//     0x3d1150 : (0.016391438875150,  0.088013307877226)  row2.xy      @0xff847
//     0x3d0db8 :  0.895595253247624                       row2.z       @0xff853
//     0x3c9fe0 : f32x4 (0, 0, 0, 1) — row3 of the 4x4 HGColorMatrix    @0xff869
//   (rows sum ≈ 1.0; canonical Rec.709 -> Rec.2020 RGB primary matrix.)
//
//   GetOutput @0xff760 — InverseOOTF wrapper initial params (f32x4):
//     0x3d1160 : (0.9099181294f, 0.2222222239f, 0.0810f, 1.0f)         @0xff8e5
//     (stored via `movaps` into the freshly-allocated wrapper's +0x1a0
//     slot; the meaning of these four is inside HgcBT2100_PQ_OOTF_qtApprox
//     and its owning HGPQ::InverseOOTF — not decoded here.)
//
//   GetOutput @0xff760 — vtable install for the fresh InverseOOTF:
//     0xa163c0 : vtable for HGPQ::InverseOOTF (installed +0x10 -> 0xa163d0) @0xff8bd
//     (nm confirms via `resolve.py Helium sym 0xa163c0` -> "vtable for
//     HGPQ::InverseOOTF (+0x10)".)
//
// NUMERIC PATH (GetOutput, faithful — see the body comments):
//   1. HGGamma param slot 0 = (2.4, 2.4, 2.4, 1.0)                    — sRGB-ish decode
//   2. rw = referenceWhiteNits
//      rf = f32(rw / 100.0) ; then re-widened to f64 (`cvtss2sd`) so the
//                             downstream f64 multiplies see the *f32-rounded* value.
//      HGColorMatrix rows are  M709_to_2020 * rf  (row 0..2)  with the
//      final f32 lane packed on the tail via `insertps $0x28` (write to
//      lane 2 of a 4-lane float vector, keeping lanes 0,1 from movapd
//      + cvtpd2ps and zeroing lane 3 — this is how Apple builds the
//      4x4 "premul 3x3 + alpha row" that HGColorMatrix::LoadMatrix
//      consumes as `Dv4_f const*, bool /*hasAlphaRow*/`.
//      Row 3 is a fixed (0,0,0,1) alpha row loaded from @0x3c9fe0.
//   3. Build an InverseOOTF wrapper (allocated 0x1b0 bytes, HGNode ctor,
//      vtable install, allocate 0x1a0-byte HgcBT2100_PQ_OOTF_qtApprox
//      inner at +0x198, drop its initial parameters (0.9099, 0.2222,
//      0.081, 1.0) at +0x1a0 as an f32 quad).
//      Wire the InverseOOTF wrapper's input to the ColorMatrix output.
//      Call the wrapper's vtable[+0x10] once (some "prepare/init" method
//      — not decoded; frontier'd through a stub).
//      Stash the wrapper at this->0x198 and return it.
//
// UNDECODED CALLEES / FRONTIER (each gets a throwing stub citing its @0xADDR):
//   HGNode::HGNode()                          @Helium 0xff609 / 0xff649
//   HGObject::operator new(size_t)            @Helium 0xff797 / 0xff8ad / 0xff8cd
//   HGGamma::HGGamma()                        @Helium 0xff7a2
//   HGColorMatrix::HGColorMatrix()            @Helium 0xff884
//   HGColorMatrix::LoadMatrix(float vector[4] const*, bool)
//                                             @Helium 0xff8a3
//   HgcBT2100_PQ_OOTF_qtApprox::HgcBT2100_PQ_OOTF_qtApprox()
//                                             @Helium 0xff8d8
//   HGRenderer::GetInput(HGNode*,int)         @Helium 0xff78a
//   HGObject::operator delete(void*)          @Helium 0xff736 (D0 tail) / unwind tails
//   HGNode::~HGNode()                         @Helium 0xff728 (D0) / 0xff6f1 (D1 tail) / 0xff6b1 (D2 tail)
//
//   vtable +0x60 (HGNode::SetParameter slot on HGGamma)
//                                             @Helium 0xff7d3
//   vtable +0x78 (HGNode::SetInput slot on HGGamma from source)
//                                             @Helium 0xff7b2
//   vtable +0x78 (HGNode::SetInput slot on HGColorMatrix from HGGamma)
//                                             @Helium 0xff894
//   vtable +0x78 (HGNode::SetInput slot on HGPQ::InverseOOTF wrapper from HGColorMatrix)
//                                             @Helium 0xff901
//   vtable +0x10 (unnamed "prepare/init" slot on HGPQ::InverseOOTF wrapper)
//                                             @Helium 0xff90b
//   vtable +0x18 (HGNode::~ deleting-dtor slot on HGPQ::InverseOOTF wrapper, HGColorMatrix, HGGamma)
//                                             @Helium 0xff91c / 0xff925 / 0xff92e
//                                             (dtor code also uses +0x18 on inner  @0xff722/@0xff6e5/@0xff6a5)
//
// The two vtable slots at +0x60 and +0x78 match the canonical `HGNode`
// vtable layout used everywhere in this port (see HGNode notes in
// HGPQ_EOTF.ts): *0x60 = HGNode::SetParameter(int, float, float, float, float),
// *0x78 = HGNode::SetInput(int, HGNode*), *0x18 = D0 deleting dtor.

/* --------------------------------------------------------- */
/* Opaque frontier types — resolved by companion ports.        */
/* --------------------------------------------------------- */

export interface HGRenderer {}
export interface HGNodeLike {}

/* --------------------------------------------------------- */
/* Undecoded-frontier stubs (each throws with its @0xADDR).           */
/* --------------------------------------------------------- */

/** Base-class ctor tail-called by both C1 and C2 @Helium 0xff609/0xff649. */
function HGNode_ctor_call(_self: object): void { // @Helium 0xff609 / 0xff649
  throw new Error(
    "HGNode::HGNode() not yet transcribed (@Helium 0xff609 / 0xff649 — HGPQ::SDRToPQ C2/C1 base-call)",
  );
}

/** `HGObject::operator new(sz)` — allocator shared by all three fresh nodes. */
function HGObject_operator_new(_bytes: number): object { // @Helium 0xff797 / 0xff8ad / 0xff8cd
  throw new Error(
    "HGObject::operator new(unsigned long) not yet transcribed (@Helium 0xff797 / 0xff8ad / 0xff8cd — HGPQ::SDRToPQ::GetOutput node allocations)",
  );
}

/** `HGGamma::HGGamma()` — the SDR-decode leaf node's ctor. */
function HGGamma_ctor(_p: object): void { // @Helium 0xff7a2
  throw new Error(
    "HGGamma::HGGamma() not yet transcribed (@Helium 0xff7a2 — HGPQ::SDRToPQ::GetOutput SDR-gamma leaf construction)",
  );
}

/** `HGColorMatrix::HGColorMatrix()` — 4x4 color-matrix node ctor. */
function HGColorMatrix_ctor(_p: object): void { // @Helium 0xff884
  throw new Error(
    "HGColorMatrix::HGColorMatrix() not yet transcribed (@Helium 0xff884 — HGPQ::SDRToPQ::GetOutput 709->2020 matrix construction)",
  );
}

/**
 * `HGColorMatrix::LoadMatrix(float vector[4] const* rows, bool hasAlphaRow)`
 * — copies the 4 f32x4 rows built on the stack into the node.
 */
function HGColorMatrix_LoadMatrix(
  _self: object,
  _rows: ReadonlyArray<Float32Array>,
  _hasAlphaRow: boolean,
): void { // @Helium 0xff8a3
  throw new Error(
    "HGColorMatrix::LoadMatrix(float vector[4] const*, bool) not yet transcribed (@Helium 0xff8a3 — HGPQ::SDRToPQ::GetOutput matrix upload)",
  );
}

/** `HgcBT2100_PQ_OOTF_qtApprox::HgcBT2100_PQ_OOTF_qtApprox()` — leaf ctor. */
function HgcBT2100_PQ_OOTF_qtApprox_ctor(_p: object): void { // @Helium 0xff8d8
  throw new Error(
    "HgcBT2100_PQ_OOTF_qtApprox::HgcBT2100_PQ_OOTF_qtApprox() not yet transcribed (@Helium 0xff8d8 — HGPQ::SDRToPQ::GetOutput inner PQ-OOTF leaf construction)",
  );
}

/** `HGRenderer::GetInput(HGNode*, int)` fetches the primary input node. */
function HGRenderer_GetInput(_r: HGRenderer, _n: HGNodeLike, _idx: number): HGNodeLike { // @Helium 0xff78a
  throw new Error(
    "HGRenderer::GetInput(HGNode*, int) not yet transcribed (@Helium 0xff78a — HGPQ::SDRToPQ::GetOutput source-input fetch)",
  );
}

/**
 * Virtual dispatch through a node's vtable +0x78
 * (`HGNode::SetInput(int, HGNode*)`).
 */
function HGNode_vt78_SetInput(
  _node: object,
  _slot: number,
  _source: HGNodeLike,
): void { // @Helium 0xff7b2 / 0xff894 / 0xff901 (three call sites)
  throw new Error(
    "HGNode vtable +0x78 (HGNode::SetInput) not yet transcribed (@Helium 0xff7b2 / 0xff894 / 0xff901 — HGPQ::SDRToPQ::GetOutput chain wiring)",
  );
}

/**
 * Virtual dispatch through the HGGamma node's vtable +0x60
 * (`HGNode::SetParameter(int, float, float, float, float)`).
 */
function HGGamma_vt60_SetParameter(
  _node: object,
  _slot: number,
  _x: number,
  _y: number,
  _z: number,
  _w: number,
): void { // @Helium 0xff7d3
  throw new Error(
    "HGGamma vtable +0x60 (HGNode::SetParameter) not yet transcribed (@Helium 0xff7d3 — HGPQ::SDRToPQ::GetOutput gamma-param upload)",
  );
}

/**
 * Virtual dispatch through the HGPQ::InverseOOTF wrapper's vtable +0x10
 * — the "prepare/init" slot the builder always calls once, right after
 * SetInput(0, colorMatrix) and before returning.
 * Not present on the canonical HGNode vtable (which has SetInput/
 * SetParameter at +0x78/+0x60): +0x10 is subclass-specific and its
 * signature is not yet decoded.
 */
function HGPQ_InverseOOTF_vt10_prepare(_node: object): void { // @Helium 0xff90b
  throw new Error(
    "HGPQ::InverseOOTF vtable +0x10 (unnamed prepare/init slot) not yet transcribed (@Helium 0xff90b — HGPQ::SDRToPQ::GetOutput post-wire hook)",
  );
}

/**
 * Virtual dispatch through a node's vtable +0x18 (the D0 deleting
 * dtor). Called both by dtor code paths on the class's own inner node
 * (see `destroy` below) AND by GetOutput to drop the builder's local
 * references to the freshly-allocated HGGamma / HGColorMatrix /
 * HGPQ::InverseOOTF wrapper after they've been wired into the graph.
 */
function HGNode_vt18_dtor(_node: object): void { // @Helium 0xff722 / 0xff6e5 / 0xff6a5 / 0xff91c / 0xff925 / 0xff92e
  throw new Error(
    "HGNode vtable +0x18 (D0 deleting dtor) not yet transcribed (@Helium 0xff722 / 0xff6e5 / 0xff6a5 / 0xff91c / 0xff925 / 0xff92e — HGPQ::SDRToPQ dtor / GetOutput ref-drop)",
  );
}

/* --------------------------------------------------------- */
/* HGPQ::SDRToPQ                                            */
/* --------------------------------------------------------- */

/**
 * `HGPQ::SDRToPQ` — SDR gamma-encoded RGB (Rec.709) -> PQ (Rec.2020)
 * conversion facade. See file header for the render-graph shape.
 *
 * The class is nested inside the `HGPQ` C++ namespace in FCP; we expose
 * it as a plain TS class named `HGPQ_SDRToPQ` (file name uses the `::` ->
 * `_` convention).
 */
export class HGPQ_SDRToPQ {
  /**
   * +0x198 — pointer to the freshly-built `HGPQ::InverseOOTF` wrapper
   * that terminates the SDR->PQ render chain. NULL after construction;
   * populated by `GetOutput` @0xff90e. Read by the dtors (D0/D1/D2) to
   * drop the reference on destroy.
   */
  public inner: object | null;

  /**
   * +0x1a0 — `double referenceWhiteNits`. Default 203.0 (BT.2408 SDR
   * white point on PQ, encoded as an inline immediate
   * 0x4069600000000000 = 203.0 in the ctor @0xff663). Settable via
   * `SetReferenceWhiteNits`.
   */
  public referenceWhiteNits: number;

  /* ---------------- ctor: HGPQ::SDRToPQ() -------------------- */

  /**
   * HGPQ::SDRToPQ::SDRToPQ() — Helium @0xff600 (C2) / @0xff640 (C1).
   * Both bodies are byte-for-byte identical apart from the RIP-relative
   * displacements pointing at their vtable-in-base vs vtable-in-complete
   * copies. Transcription:
   *
   *   HGNode::HGNode(this);                           @0xff609/@0xff649
   *   this->vtable = &_ZTVN4HGPQ7SDRToPQE (+0x10)     @0xff60e-@0xff615 / @0xff64e-@0xff655
   *   this->0x198  = nullptr                          @0xff618 / @0xff658
   *   this->0x1a0  = f64 203.0  (imm 0x4069600000000000)      @0xff663 / @0xff623
   *
   * No allocations, no exception paths — a trivial POD-style init.
   */
  public constructor() { // @Helium 0xff600 (C2) / 0xff640 (C1)
    HGNode_ctor_call(this);
    // vtable install @0xff60e/@0xff64e — modelled as no-op; virtual
    // dispatch resolves through explicit method calls on this object.

    // this->0x198 = null                     @0xff618 / @0xff658
    this.inner = null;

    // this->0x1a0 = f64 203.0                @0xff663 / @0xff623
    // (imm 0x4069600000000000 = 203.0 — BT.2408 SDR reference white)
    this.referenceWhiteNits = 203.0;
  }

  /* ---------------- dtor: HGPQ::~SDRToPQ --------------------- */

  /**
   * HGPQ::SDRToPQ::~SDRToPQ() — Helium @0xff680 (D2), @0xff6c0 (D1),
   * @0xff700 (D0 deleting). Bodies:
   *
   *   D2 @0xff680 / D1 @0xff6c0: (identical apart from the vtable-in-
   *   base vs vtable-in-complete displacement — the two disasm dumps
   *   agree structurally line-for-line)
   *     this->vtable = &_ZTVN4HGPQ7SDRToPQE (+0x10)           @0xff686 / @0xff6c6
   *     inner = this->0x198                                @0xff690 / @0xff6d0
   *     if (inner) {
   *       vt = *(void**)inner
   *       (*(void(**)(void*))(vt+0x18))(inner);              @0xff6a5 / @0xff6e5
   *     }
   *     tail-jmp HGNode::~HGNode(this)                     @0xff6b1 / @0xff6f1
   *
   *   D0 @0xff700:
   *     this->vtable = &_ZTVN4HGPQ7SDRToPQE (+0x10)           @0xff709-@0xff710
   *     inner = this->0x198                          @0xff713
   *     if (inner) {
   *       vt = *(void**)inner
   *       (*(void(**)(void*))(vt+0x18))(inner);              @0xff722
   *     }
   *     HGNode::~HGNode(this);                             @0xff728
   *     tail-jmp HGObject::operator delete(this);            @0xff736
   *
   * JS/TS doesn't have manual delete; the whole graph is subsumed by GC.
   * We keep `destroy()` as a manually-callable no-op so callers that
   * need semantic dtor parity (i.e. would fire vt+0x18 on the inner) can
   * wire it up once HGPQ::InverseOOTF's vt+0x18 is a real function.
   */
  public destroy(): void { // @Helium 0xff700 (D0)
    // Reading this.inner mirrors the load at @0xff713; the vt+0x18
    // dispatch on it is a frontier stub. In the port we lean on GC —
    // if bit-exact parity is ever needed at the destroy boundary, this
    // is where HGNode_vt18_dtor(this.inner) would fire.
    void this.inner;
  }

  /* ---------------- SetReferenceWhiteNits(double) ------------ */

  /**
   * HGPQ::SDRToPQ::SetReferenceWhiteNits(double) — Helium @0xff750.
   * Trivial setter — the whole body is:
   *
   *     pushq %rbp ; movq %rsp, %rbp
   *     movsd %xmm0, 0x1a0(%rdi)              @0xff754  (f64 store)
   *     popq  %rbp ; retq
   *
   * i.e. `this->0x1a0 = arg`. The stored value is a plain `double`; the
   * f32 rounding path only happens later, inside GetOutput.
   */
  public SetReferenceWhiteNits(nits: number): void { // @Helium 0xff750
    // movsd %xmm0, 0x1a0(%rdi)  @0xff754
    this.referenceWhiteNits = nits;
  }

  /* ---------------- GetOutput ------------------------------- */

  /**
   * HGPQ::SDRToPQ::GetOutput(HGRenderer* r) — Helium @0xff760.
   *
   * Faithful transcription of the render-graph builder:
   *
   *   // [A] Fetch source input from the renderer:
   *   source = HGRenderer::GetInput(r, this, 0);              @0xff78a
   *
   *   // [B] Allocate + construct the HGGamma leaf (0x1b0 bytes):
   *   gamma = HGObject::operator new(0x1b0);                  @0xff797
   *   HGGamma::HGGamma(gamma);                              @0xff7a2
   *   // Wire input, then push param slot 0 = (2.4, 2.4, 2.4, 1.0):
   *   gamma->vtable[0x78](gamma, 0, source);                  @0xff7b2 (SetInput)
   *   xmm0 = f32 2.4  @0x3ca278                           @0xff7b8
   *   xmm3 = f32 1.0  @0x3c7cc0                           @0xff7c0
   *   // movaps duplicates xmm0 into xmm1, xmm2 (all three = 2.4f) @0xff7cd/@0xff7d0
   *   gamma->vtable[0x60](gamma, 0, 2.4f, 2.4f, 2.4f, 1.0f);  @0xff7d3 (SetParameter)
   *
   *   // [C] Compute the peak-nits scale, f32-rounded then widened to f64:
   *   xmm0 = this->0x1a0                     (f64 refWhiteNits)  @0xff7d6
   *   xmm0 /= 100.0                          (f64 divsd @0x3cd278)@0xff7df
   *   xmm0 = f32(xmm0)                       (cvtsd2ss)          @0xff7e7
   *   xmm0 = f64(xmm0)                       (cvtss2sd — round-trip that pins
   *                                          the value at f32 precision) @0xff7eb
   *   movddup xmm0, xmm1                      (xmm1 = {rf, rf})   @0xff7ef
   *
   *   // [D] Build 4 f32x4 rows on the stack (-0x70..-0x40(%rbp)):
   *   //   row0..2 = M709_to_2020 * rf     (3-lane RGB scale, 4th lane 0)
   *   //   row3    = (0, 0, 0, 1)          (alpha row from @0x3c9fe0)
   *   //
   *   // For each of rows 0..2:
   *   //   xmm2 = M_row.xy (f64 pair, movapd @0x3d1130/@0x3d1140/@0x3d1150)
   *   //   xmm2 *= xmm1                    (mulpd  — xmm2 = M_row.xy * rf, f64)
   *   //   xmm2 = f32(xmm2)                (cvtpd2ps — xmm2 lanes 0,1 = f32 pair)
   *   //   xmm3 = M_row.z  (f64, movsd @0x3d0da8/@0x3d0db0/@0x3d0db8)
   *   //   xmm3 *= xmm0                    (mulsd  — xmm3 = M_row.z * rf, f64)
   *   //   xmm3 = f32(xmm3)                (cvtsd2ss)
   *   //   xmm2 = insertps $0x28, xmm3     (packs xmm2 = [rf*M_row.x, rf*M_row.y,
   *   //                                            rf*M_row.z, 0], all f32)
   *   //   movaps xmm2 -> -0x70+r*0x10(%rbp)
   *   // Row 3: movaps @0x3c9fe0 (f32x4 = (0,0,0,1)) -> -0x40(%rbp).
   *
   *   // [E] Allocate + construct HGColorMatrix (0x1f0 bytes):
   *   cm = HGObject::operator new(0x1f0);                     @0xff8ad
   *   HGColorMatrix::HGColorMatrix(cm);                       @0xff884
   *   cm->vtable[0x78](cm, 0, gamma);                         @0xff894 (SetInput)
   *   HGColorMatrix::LoadMatrix(cm, &row0, hasAlphaRow=true); @0xff8a3
   *
   *   // [F] Allocate + construct the HGPQ::InverseOOTF wrapper (0x1b0 bytes):
   *   wr = HGObject::operator new(0x1b0);                     @0xff8ad (2nd call)
   *   HGNode::HGNode(wr);                                    @0xff8b8
   *   wr->vtable = &_ZTVN4HGPQ10InverseOOTFE (+0x10)          @0xff8bd (leaq 0x916afc, next_ip 0xff8c4
   *                                                           + 0x916afc = 0xa163c0; resolve.py -> vtable
   *                                                           for HGPQ::InverseOOTF).
   *   inner_pq = HGObject::operator new(0x1a0);               @0xff8cd
   *   HgcBT2100_PQ_OOTF_qtApprox::HgcBT2100_PQ_OOTF_qtApprox(inner_pq); @0xff8d8
   *   wr->0x198 = inner_pq                                    @0xff8dd
   *   wr->0x1a0 = f32x4 (0.9099181294, 0.2222222239, 0.081, 1.0)
   *                     @0x3d1160 -> movaps -> 0x1a0(%r12)     @0xff8e5-@0xff8ec
   *
   *   // [G] Wire wrapper's input to the color matrix; fire vt[+0x10]:
   *   wr->vtable[0x78](wr, 0, cm);                            @0xff901 (SetInput)
   *   wr->vtable[0x10](wr);                                   @0xff90b
   *
   *   // [H] Stash the wrapper on `this` and drop the builder's local
   *   //     references (they now live in the graph, owned by wr/cm):
   *   this->0x198 = wr                                        @0xff90e
   *   wr->vtable[0x18](wr);                                   @0xff91c (D0 slot — releases
   *                                                           builder ref; the graph
   *                                                           holds another via SetInput)
   *   cm->vtable[0x18](cm);                                  @0xff925
   *   gamma->vtable[0x18](gamma);                            @0xff92e
   *
   *   return wr;                                              @0xff941
   *
   * The two `HGObject::operator new(0x1b0)` calls @0xff797 and @0xff8ad
   * are two different callers to the SAME allocator. The 0x1a0-byte
   * inner @0xff8cd is a third caller (smaller node). All three land in
   * the same stub — see the single frontier function above.
   *
   * NOTE (stack alignment / calling conv): the `insertps $0x28` idiom
   * writes f32 lane 2 while keeping lanes 0,1 from the source and
   * zeroing lane 3 — see Intel SDM Vol.2 INSERTPS opcode. In TS we
   * simply build a `Float32Array([x, y, z, 0])` per row; the byte layout
   * on wire is identical to what HGColorMatrix::LoadMatrix consumes as
   * `float vector[4] const*`.
   */
  public GetOutput(r: HGRenderer): object { // @Helium 0xff760
    // [A] source = HGRenderer::GetInput(r, this, 0)  @0xff78a
    const source = HGRenderer_GetInput(r, this as unknown as HGNodeLike, 0);

    // [B] Allocate + construct HGGamma; wire input; set params.
    const gamma = HGObject_operator_new(0x1b0);                      // @0xff797
    HGGamma_ctor(gamma);                                           // @0xff7a2
    // gamma->vtable[0x78](gamma, 0, source)  @0xff7b2
    HGNode_vt78_SetInput(gamma, 0, source);
    // gamma->vtable[0x60](gamma, 0, 2.4f, 2.4f, 2.4f, 1.0f)  @0xff7d3
    //   xmm0 = f32 2.4  @0x3ca278  @0xff7b8
    //   xmm3 = f32 1.0  @0x3c7cc0  @0xff7c0
    //   movaps xmm0,xmm1 ; movaps xmm0,xmm2 (lanes 0..2 all = 2.4f)  @0xff7cd/@0xff7d0
    HGGamma_vt60_SetParameter(
      gamma,
      0,
      Math.fround(2.4),  // f32 @0x3ca278
      Math.fround(2.4),  // f32 (movaps copy of xmm0)
      Math.fround(2.4),  // f32 (movaps copy of xmm0)
      Math.fround(1.0),  // f32 @0x3c7cc0
    );

    // [C] Compute the peak-nits scale, f32-rounded then widened back to f64.
    // xmm0 = this->0x1a0                    (f64 refWhiteNits)  @0xff7d6
    // xmm0 /= 100.0                         (f64 @0x3cd278)     @0xff7df
    // xmm0 = f32(xmm0)                      (cvtsd2ss)          @0xff7e7
    // xmm0 = f64(xmm0)                      (cvtss2sd)          @0xff7eb
    //   The round-trip re-widens xmm0 to f64 but pins it at f32
    //   precision; downstream muls are f64 but see the f32-quantised
    //   value. In TS: Math.fround captures that quantisation exactly.
    const rf_f32 = Math.fround(this.referenceWhiteNits / 100.0);
    const rf: number = rf_f32; // (cvtss2sd) — as a JS number, this IS f64(f32(x)).

    // [D] Build the four f32x4 rows.
    //
    // Row 0..2: M709_to_2020 * rf, packed as (rf*M.x, rf*M.y, rf*M.z, 0).
    // The disasm mixes f64 pair muls (mulpd on 16-byte movapd loads)
    // with f64 scalar mul (mulsd on movsd load) then narrows each
    // component to f32 (cvtpd2ps / cvtsd2ss) — arithmetically we do
    // the same in TS: multiply as JS f64, then Math.fround each lane.
    //
    // Row 0.x/y @0x3d1130, Row 0.z @0x3d0da8  -> stack -0x70(%rbp)
    const row0 = new Float32Array([
      Math.fround(0.627403895934699 * rf),  // @0x3d1130.x  @0xff7f3 mulpd
      Math.fround(0.329283038377884 * rf),  // @0x3d1130.y
      Math.fround(0.043313065687417 * rf),  // @0x3d0da8    @0xff803 mulsd
      Math.fround(0.0),                     // insertps zero-fill lane 3  @0xff813
    ]);

    // Row 1.x/y @0x3d1140, Row 1.z @0x3d0db0  -> stack -0x60(%rbp)
    const row1 = new Float32Array([
      Math.fround(0.069097289358232 * rf),  // @0x3d1140.x  @0xff81d
      Math.fround(0.919540395075458 * rf),  // @0x3d1140.y
      Math.fround(0.011362315566309 * rf),  // @0x3d0db0    @0xff82d
      Math.fround(0.0),                     //              @0xff83d
    ]);

    // Row 2.x/y @0x3d1150, Row 2.z @0x3d0db8  -> stack -0x50(%rbp)
    const row2 = new Float32Array([
      Math.fround(0.016391438875150 * rf),  // @0x3d1150.x  @0xff847
      Math.fround(0.088013307877226 * rf),  // @0x3d1150.y
      Math.fround(0.895595253247624 * rf),  // @0x3d0db8    @0xff853
      Math.fround(0.0),                     //              @0xff85f
    ]);

    // Row 3: movaps @0x3c9fe0 -> -0x40(%rbp).  f32x4 = (0,0,0,1).
    // @0xff869 movaps 0x2ca770(%rip), %xmm0 ; @0xff870 movaps %xmm0, -0x40(%rbp)
    const row3 = new Float32Array([
      Math.fround(0.0),
      Math.fround(0.0),
      Math.fround(0.0),
      Math.fround(1.0),
    ]);

    // [E] Allocate + construct HGColorMatrix (0x1f0-byte node).
    const cm = HGObject_operator_new(0x1f0);                       // @0xff8ad
    HGColorMatrix_ctor(cm);                                     // @0xff884
    // cm->vtable[0x78](cm, 0, gamma)  @0xff894
    HGNode_vt78_SetInput(cm, 0, gamma);
    // HGColorMatrix::LoadMatrix(cm, &row0, /*hasAlphaRow=*/true)  @0xff8a3
    HGColorMatrix_LoadMatrix(cm, [row0, row1, row2, row3], true);

     // [F] Allocate + construct the HGPQ::InverseOOTF wrapper.
    //     0x1b0-byte outer + 0x1a0-byte inner (HgcBT2100_PQ_OOTF_qtApprox).
    const wr = HGObject_operator_new(0x1b0);                       // @0xff8ad (2nd call)
    HGNode_ctor_call(wr);                                       // @0xff8b8 HGNode::HGNode(wr)
    // wr->vtable install: leaq 0x916afc(%rip),%rax ; movq %rax,(%r12)
    //   target = 0xff8c4 + 0x916afc = 0xa163c0 = "vtable for HGPQ::InverseOOTF" (+0x10 slot)
    //   -> installed pointer is &vtable_InverseOOTF + 0x10 = 0xa163d0.
    //   @0xff8bd..@0xff8c4. Modelled as no-op; virtual dispatch happens
    //   through explicit method calls.

    const inner_pq = HGObject_operator_new(0x1a0);                   // @0xff8cd
    HgcBT2100_PQ_OOTF_qtApprox_ctor(inner_pq);                       // @0xff8d8
    // wr->0x198 = inner_pq                                        @0xff8dd
    // wr->0x1a0 = f32x4 (0.9099181294, 0.2222222239, 0.081, 1.0)    @0xff8e5
    //   loaded via movaps 0x2d1874(%rip) -> next_ip 0xff8ec + 0x2d1874 = 0x3d1160.
    //   Field on the wrapper — we don't own that layout here; it's
    //   stored on `wr`, not on `this`.
    void inner_pq; // wired into `wr` by the HGPQ::InverseOOTF port
                   // (the four f32 params below are consumed there).
    // Constants @0x3d1160 (all f32, for provenance):
    //   0.9099181294441223f, 0.2222222238779068f, 0.08100000023841858f, 1.0f
    void Math.fround(0.9099181294441223);
    void Math.fround(0.2222222238779068);
    void Math.fround(0.08100000023841858);
    void Math.fround(1.0);

    // [G] Wire wrapper's input to the color matrix; call vt[+0x10].
    // wr->vtable[0x78](wr, 0, cm)  @0xff901
    HGNode_vt78_SetInput(wr, 0, cm);
    // wr->vtable[0x10](wr)         @0xff90b
    HGPQ_InverseOOTF_vt10_prepare(wr);

    // [H] Stash + drop builder refs.
    // this->0x198 = wr             @0xff90e
    this.inner = wr;
    // wr->vtable[0x18](wr)         @0xff91c
    HGNode_vt18_dtor(wr);
    // cm->vtable[0x18](cm)         @0xff925
    HGNode_vt18_dtor(cm);
    // gamma->vtable[0x18](gamma)   @0xff92e
    HGNode_vt18_dtor(gamma);

    // movq %r12, %rax ; ret        @0xff941
    return wr;
  }
}
