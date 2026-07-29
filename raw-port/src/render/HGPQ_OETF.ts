// raw-port/src/render/HGPQ_OETF.ts
//
// FCP `HGPQ::OETF` — a nested facade class in Helium's `HGPQ` (Perceptual
// Quantizer / SMPTE ST 2084) namespace, sibling of `HGPQ::EOTF`. Unlike
// EOTF (which always wraps a single `HgcST2084_EOTF`), OETF's ctor
// selects ONE OF TWO inner leaf render nodes based on a `bool` argument:
//
//   HgcBT2100_PQ_OETF_qtApprox  — the fast QuickTime-approx shader
//   HgcBT2100_PQ_OETF           — the full BT.2100 (BT.709 OETF then
//                                 gamma-2.4 + ST 2084 encode) shader
//
// Both are allocated with `HGObject::operator new(0x1a0)`. The ctor
// PRE-COMPUTES `p = pow(10000.0 / d, m1)` (where `d` is the ctor's
// peak-nits argument and m1 = 2610/16384 is the ST 2084 exponent),
// then stores TWO packed f32 lanes at +0x1a0/+0x1a4:
//     +0x1a0 = f32(p * c2)   with c2 = 18.8515625 (2413/4096 * 32)
//     +0x1a4 = f32(p * c3)   with c3 = 18.6875    (2392/4096 * 32)
// These are the ST 2084 OETF numerator/denominator scale factors,
// re-normalized so the shader can compute
//   E' = ((c1 + (p*c2)*Y^m1) / (1 + (p*c3)*Y^m1))^m2
// directly against a linear luminance Y expressed in peak-nits-relative
// units (0..1 = 0..d cd/m²), avoiding a per-pixel divide by `d`.
//
// `GetOutput` wires source + parameters onto the inner leaf node.
// Because the ctor picks between TWO distinct leaf classes, `GetOutput`
// uses `___dynamic_cast<HgcBT2100_PQ_OETF>()` (full shader) vs
// `___dynamic_cast<HgcBT2100_PQ_OETF_qtApprox>()` (approx) to decide
// which parameter layout to upload. The two layouts differ:
//   FULL:   3 SetParameter calls (BT.709 OETF coeffs, mixed
//                                  exponents, ST 2084 (c1, p*c2, p*c3))
//   APPROX: 2 SetParameter calls (approx-fit coeffs, ST 2084 (c1,
//                                  p*c2, p*c3))
//
// FRAMEWORK: Helium.framework (x86_64 slice; fat-slice offset 0x4000;
// the thin binary at /tmp/Helium.x86_64 has VA==file offset, so every
// RIP-relative constant address below is a direct file offset).
//
// SYMBOLS (Helium x86_64):
//   0x000fe6e0  HGPQ::OETF::OETF(bool, double)      [C2 base ctor]
//   0x000fe7b0  HGPQ::OETF::OETF(bool, double)      [C1 complete ctor — pure `jmp` thunk to C2]
//   0x000fe7c0  HGPQ::OETF::~OETF()                 [D2 base dtor]
//   0x000fe800  HGPQ::OETF::~OETF()                 [D1 complete dtor — identical body]
//   0x000fe840  HGPQ::OETF::~OETF()                 [D0 deleting dtor]
//   0x000fe890  HGPQ::OETF::GetOutput(HGRenderer*)  [wires inner leaf's params, returns it]
//
// DECODES (all under raw-port/re/disasm/):
//   Helium.HGPQ_OETF.C2.s          (@0xfe6e0)
//   Helium.HGPQ::OETF.OETF.s       (@0xfe7b0, C1 thunk to C2)
//   Helium.HGPQ_OETF.D0.s          (@0xfe840)
//   Helium.HGPQ_OETF.D1.s          (@0xfe800)
//   Helium.HGPQ_OETF.D2.s          (@0xfe7c0)
//   Helium.HGPQ::OETF.GetOutput.s  (@0xfe890)
//
// LAYOUT (inherits HGNode; sizeof HGNode header >= 0x198):
//   +0x000  vtable ptr
//                 installed @0xfe701 via `leaq 0x917eff(%rip), %rax; movq %rax, (%rbx)`
//                 in ctor; reinstalled by every dtor (D2 @0xfe7cd, D1 @0xfe80d,
//                 D0 @0xfe850) so slicing during destruction is well-defined.
//   +0x198  inner leaf render node pointer, one of:
//                 HgcBT2100_PQ_OETF_qtApprox*   (if `bool` arg true — r14=esi)
//                 HgcBT2100_PQ_OETF*            (if `bool` arg false)
//                 Written by ctor @0xfe767 (`movq %r14, 0x198(%rbx)`).
//   +0x1a0  float32  p*c2   = f32( pow(10000.0/d, m1) * c2 )    (c2 = 18.8515625)
//   +0x1a4  float32  p*c3   = f32( pow(10000.0/d, m1) * c3 )    (c3 = 18.6875)
//                 Both written by ctor @0xfe722..@0xfe72e — see math note below.
//
// The ctor's f32-pair pre-compute (@0xfe704..@0xfe72e):
//   movsd  -0x20(%rbp), %xmm0        ; @0xfe704   xmm0 = d (f64)
//   divsd  10000.0(%rip), %xmm0      ; @0xfe709   const @0x3d0d20 — WRONG DIRECTION
//                                    ;            actually: xmm0 = d / 10000.0
//                                    ;            (divsd src/dst = dst / src? NO —
//                                    ;             divsd MEM, XMM computes XMM = XMM / MEM.
//                                    ;             So xmm0 = d / 10000.0.)
//                                    ;            WAIT — verify: divsd's Intel syntax with
//                                    ;            AT&T `divsd mem, %xmm0` means %xmm0 /= mem,
//                                    ;            i.e. xmm0 = d / 10000.0. But then
//                                    ;            pow(d/10000, m1) as a scale factor makes
//                                    ;            LESS sense than pow(10000/d, m1).
//                                    ;            Re-read: BOTH conventions exist. macOS
//                                    ;            otool -tV uses AT&T: `divsd src, dst`
//                                    ;            means dst = dst / src. So xmm0 = d/10000.
//                                    ;            The pre-computed factor is thus
//                                    ;            (d/10000)^m1 * c{2,3}. See math below.
//   movsd  0.1593017578125(%rip), %xmm1 ; @0xfe711 const @0x3d0d30 (= m1)
//   callq  _pow                      ; @0xfe719   xmm0 = pow(d/10000, m1)
//   movddup %xmm0, %xmm0             ; @0xfe71e   xmm0 = {p, p}   (f64x2)
//   mulpd  {c2,c3}(%rip), %xmm0      ; @0xfe722   const @0x3d1080 = (18.8515625, 18.6875)
//   cvtpd2ps %xmm0, %xmm0            ; @0xfe72a   -> two f32s in low 64 bits
//   movlpd %xmm0, 0x1a0(%rbx)        ; @0xfe72e   store 8 bytes -> +0x1a0 (p*c2), +0x1a4 (p*c3)
//
// NOTE on the pow direction: divsd here computes `d / 10000.0` (AT&T `divsd
// src, dst` means dst /= src). So `p = pow(d/10000, m1)`. In use by the
// shader: given a linear luminance Y in cd/m² (0..d), the ST 2084 OETF is
//   E' = ( (c1 + c2 * (Y/10000)^m1) / (1 + c3 * (Y/10000)^m1) )^m2
// Precomputing `p*c2, p*c3` where p = (d/10000)^m1 lets the shader use
// (Y/d)^m1 (a display-normalized signal in [0,1]) instead of (Y/10000)^m1,
// because (Y/10000)^m1 = (Y/d)^m1 * (d/10000)^m1 = (Y/d)^m1 * p. So the
// shader path in normalized-display-signal x = Y/d becomes
//   E' = ( (c1 + (p*c2)*x^m1) / (1 + (p*c3)*x^m1) )^m2
// which explains why the ctor pre-multiplies c2 and c3 by p and stores the
// PAIR of scaled coefficients as the ONLY per-instance data outside the
// leaf-node's own params.
//
// DECODED CONSTANTS:
//
//   ctor @0xfe6e0 (f64):
//     0x3d0d20 : 10000.0                                             @0xfe709 (divsd)
//     0x3d0d30 : 0.1593017578125     (= m1 = 2610/16384)             @0xfe711 (movsd)
//     0x3d1080 : (packed f64x2)  {18.8515625, 18.6875} = {c2, c3}    @0xfe722 (mulpd)
//         0x3d1080 : 18.8515625  (= c2 = 2413/4096 * 32)
//         0x3d1088 : 18.6875     (= c3 = 2392/4096 * 32)
//
//   GetOutput @0xfe890 (all f32 — 8-byte movss/xorps):
//     0x3d0f58 : 0.8359375f     (= f32(c1))                          @0xfe959/@0xfe9bd
//     0x3d0f68 : 78.84375f      (= f32(m2 = 2523/4096 * 128))        @0xfe930/@0xfe994
//     0x3d0f6c : 0.017999999225139618f  (BT.709 OETF β)              @0xfe90d
//     0x3d0f70 : 0.44999998807907104f   (BT.709 OETF 1/2.222 ≈ 0.45) @0xfe920
//     0x3d0f84 : 1.0989999771118164f    (BT.709 OETF α = 1.099)      @0xfe8f5
//     0x3d0f88 : -0.0989999994635582f   (BT.709 OETF -(α-1) = -0.099)@0xfe8fd
//     0x3d0f8c : 4.5f           (BT.709 OETF slope in linear seg)    @0xfe905
//     0x3d0f90 : 0.38232421875f (mixed-exponent const, full path)    @0xfe928
//     0x3d0f94 : 0.19546228647232056f (approx-path coefficient)      @0xfe98c
//
// BT.709 OETF (Rec. 709 gamma):
//   E' = 4.5 * L                                        for L < β=0.018
//   E' = 1.099 * L^0.45 - 0.099                         for L >= β
// FCP's shader parameterization uploads (α, -(α-1), slope, β) = (1.099,
// -0.099, 4.5, 0.018) as SetParameter slot 0 of HgcBT2100_PQ_OETF.
//
// ST 2084 OETF constants (BT.2100 Table 4):
//   m1 = 2610/16384 = 0.1593017578125
//   m2 = 2523/4096 * 128 = 78.84375
//   c1 = 3424/4096 = 0.8359375
//   c2 = 2413/4096 * 32 = 18.8515625
//   c3 = 2392/4096 * 32 = 18.6875
//
// UNDECODED CALLEES / FRONTIER (each gets a throwing stub citing its @0xADDR):
//   HGNode::HGNode()                               @Helium 0xfe6f5
//   HGObject::operator new(size_t)                 @Helium 0xfe740 / 0xfe757
//   HgcBT2100_PQ_OETF_qtApprox::HgcBT2100_PQ_OETF_qtApprox()  @Helium 0xfe74b
//   HgcBT2100_PQ_OETF::HgcBT2100_PQ_OETF()         @Helium 0xfe762
//   HGObject::operator delete(void*)               @Helium 0xfe781 / 0xfe876
//   HGNode::~HGNode()                              @Helium 0xfe789 / 0xfe79c / 0xfe7f1 / 0xfe868
//   Inner-leaf vtable +0x18 (dtor via inner->vtable[0x18])
//                                                  @Helium 0xfe7e5 / 0xfe862
//   HGRenderer::GetInput(HGNode*, int)             @Helium 0xfe8af
//   ___dynamic_cast<HgcBT2100_PQ_OETF*>(inner)     @Helium 0xfe8e5
//   ___dynamic_cast<HgcBT2100_PQ_OETF_qtApprox*>(inner) @Helium 0xfe981
//   Inner-leaf vtable +0x60 (HGNode::SetParameter slot)
//                                                  @Helium 0xfe91a / 0xfe943 / 0xfe9a7 / 0xfe9d0
//   Inner-leaf vtable +0x78 (HGNode::SetInput slot) @Helium 0xfe8bf
//
// All four vtable slots are the canonical HGNode ones (per HGNode.ts):
// *0x18 = D0 deleting dtor, *0x60 = HGNode::SetParameter(int, float, float, float, float),
// *0x78 = HGNode::SetInput(int, HGNode*).

/* ------------------------------------------------------------------ */
/* Opaque frontier types — resolved by companion ports.                */
/* ------------------------------------------------------------------ */

export interface HGRenderer {}
export interface HGNodeLike {}

/* ------------------------------------------------------------------ */
/* Undecoded-frontier stubs (each throws with its @0xADDR).            */
/* ------------------------------------------------------------------ */

/** Base-class ctor `HGNode::HGNode()` called at the start of the ctor. */
function HGNode_ctor_call(_self: object): void { // @Helium 0xfe6f5
  throw new Error(
    "HGNode::HGNode() not yet transcribed (@Helium 0xfe6f5 — HGPQ::OETF C2 base-call)",
  );
}

/** `HGObject::operator new(0x1a0)` — allocates the inner leaf render node. */
function HGObject_operator_new(_bytes: number): object { // @Helium 0xfe740 / 0xfe757
  throw new Error(
    "HGObject::operator new(unsigned long) not yet transcribed (@Helium 0xfe740 / 0xfe757 — HGPQ::OETF ctor alloc of inner leaf)",
  );
}

/** `HgcBT2100_PQ_OETF_qtApprox::HgcBT2100_PQ_OETF_qtApprox()` — approx leaf ctor. */
function HgcBT2100_PQ_OETF_qtApprox_ctor(_p: object): void { // @Helium 0xfe74b
  throw new Error(
    "HgcBT2100_PQ_OETF_qtApprox::HgcBT2100_PQ_OETF_qtApprox() not yet transcribed (@Helium 0xfe74b — HGPQ::OETF ctor qtApprox-branch inner-node construction)",
  );
}

/** `HgcBT2100_PQ_OETF::HgcBT2100_PQ_OETF()` — full-shader leaf ctor. */
function HgcBT2100_PQ_OETF_ctor(_p: object): void { // @Helium 0xfe762
  throw new Error(
    "HgcBT2100_PQ_OETF::HgcBT2100_PQ_OETF() not yet transcribed (@Helium 0xfe762 — HGPQ::OETF ctor full-branch inner-node construction)",
  );
}

/** `HGRenderer::GetInput(HGNode*, int)` — fetches the primary source input. */
function HGRenderer_GetInput(_r: HGRenderer, _n: HGNodeLike, _idx: number): HGNodeLike { // @Helium 0xfe8af
  throw new Error(
    "HGRenderer::GetInput(HGNode*, int) not yet transcribed (@Helium 0xfe8af — HGPQ::OETF::GetOutput source-input fetch)",
  );
}

/**
 * `___dynamic_cast(inner, &typeinfo(HGNode), &typeinfo(HgcBT2100_PQ_OETF), 0)`.
 * Returns the down-cast pointer if `inner` is HgcBT2100_PQ_OETF (or a subclass);
 * NULL otherwise (fall-through path takes the qtApprox branch).
 */
function dynamic_cast_HgcBT2100_PQ_OETF(_inner: object): object | null { // @Helium 0xfe8e5
  throw new Error(
    "___dynamic_cast<HgcBT2100_PQ_OETF*>(inner) not yet transcribed (@Helium 0xfe8e5 — HGPQ::OETF::GetOutput full-branch RTTI check)",
  );
}

/**
 * `___dynamic_cast(inner, &typeinfo(HGNode), &typeinfo(HgcBT2100_PQ_OETF_qtApprox), 0)`.
 * Companion to the above; taken only when the full-shader down-cast fails.
 */
function dynamic_cast_HgcBT2100_PQ_OETF_qtApprox(_inner: object): object | null { // @Helium 0xfe981
  throw new Error(
    "___dynamic_cast<HgcBT2100_PQ_OETF_qtApprox*>(inner) not yet transcribed (@Helium 0xfe981 — HGPQ::OETF::GetOutput approx-branch RTTI check)",
  );
}

/**
 * Virtual dispatch through the inner leaf's vtable +0x78
 * (`HGNode::SetInput(int, HGNode*)` per HGNode's canonical vtable).
 */
function inner_SetInput(
  _inner: object,
  _slot: number,
  _source: HGNodeLike,
): void { // @Helium 0xfe8bf (vtable +0x78)
  throw new Error(
    "inner->vtable +0x78 (HGNode::SetInput) not yet transcribed (@Helium 0xfe8bf — HGPQ::OETF::GetOutput input wiring)",
  );
}

/**
 * Virtual dispatch through the inner leaf's vtable +0x60
 * (`HGNode::SetParameter(int, float, float, float, float)`).
 */
function inner_SetParameter(
  _inner: object,
  _slot: number,
  _x: number,
  _y: number,
  _z: number,
  _w: number,
): void { // @Helium 0xfe91a / 0xfe943 / 0xfe9a7 / 0xfe9d0 (vtable +0x60)
  throw new Error(
    "inner->vtable +0x60 (HGNode::SetParameter) not yet transcribed (@Helium 0xfe91a / 0xfe943 / 0xfe9a7 / 0xfe9d0 — HGPQ::OETF::GetOutput param upload)",
  );
}

/* ------------------------------------------------------------------ */
/* HGPQ::OETF                                                          */
/* ------------------------------------------------------------------ */

/**
 * `HGPQ::OETF` — SMPTE ST 2084 / BT.2100 opto-electronic transfer
 * function facade. Selects one of two inner leaf render nodes at
 * ctor time based on the `bool` argument (see file header for the
 * two branches). Nested inside the `HGPQ` C++ namespace in FCP; we
 * expose it here as `HGPQ_OETF` (file name uses the `::` → `_`
 * convention).
 */
export class HGPQ_OETF {
  /**
   * +0x198 — pointer to the leaf render node the class wraps.
   * Concretely one of `HgcBT2100_PQ_OETF_qtApprox*` (when the ctor's
   * `bool` argument is true) or `HgcBT2100_PQ_OETF*` (when false).
   * Allocated in the ctor via `HGObject::operator new(0x1a0)` +
   * the appropriate leaf-class ctor. See @0xfe736..@0xfe767.
   */
  public inner!: object;

  /**
   * +0x1a0 — f32 pre-multiplied scale = `f32( pow(d/10000, m1) * c2 )`.
   * See ctor decode @0xfe704..@0xfe72e. The shader consumes this as
   * the c2 coefficient in normalized-display-signal space.
   */
  public pTimesC2!: number;

  /**
   * +0x1a4 — f32 pre-multiplied scale = `f32( pow(d/10000, m1) * c3 )`.
   * Stored as the second f32 lane of the `movlpd` write at @0xfe72e.
   */
  public pTimesC3!: number;

  /**
   * True if the ctor picked the qtApprox leaf; false for the full shader.
   * NOT a field of the C++ class — the choice is captured in the leaf
   * type at 0x198. We track it as a boolean here so `GetOutput` can
   * mirror the RTTI-driven branch without instantiating real inner
   * classes (both leaf ctors are frontier stubs in this port).
   *
   * @Helium 0xfe736 (`testl %r14d, %r14d ; je 0xfe752`) — `r14 = esi`
   * = the ctor's `bool` argument, taken TRUE-branch when nonzero.
   */
  public isQtApprox!: boolean;

  /* ---------------- ctor: HGPQ::OETF(bool, double) ------------------- */

  /**
   * HGPQ::OETF::OETF(bool qtApprox, double d) — Helium @0xfe6e0 (C2).
   * The C1 complete-object ctor @0xfe7b0 is a plain 5-byte
   * `pushq %rbp ; movq %rsp, %rbp ; popq %rbp ; jmp C2` thunk (see
   * raw-port/re/disasm/Helium.HGPQ::OETF.OETF.s — 6-line body). Both
   * observably invoke the identical body below.
   *
   * Disasm-to-TS (@0xfe6e0..@0xfe777):
   *
   *   movsd  %xmm0, -0x20(%rbp)                ; @0xfe6ea  spill d
   *   movl   %esi, %r14d                       ; @0xfe6ef  r14 = (int32)qtApprox (bool)
   *   movq   %rdi, %rbx                        ; @0xfe6f2  rbx = this
   *   callq  __ZN6HGNodeC2Ev  ; HGNode::HGNode(this)   @0xfe6f5
   *   leaq   0x917eff(%rip), %rax              ; @0xfe6fa  vtable-for-HGPQ::OETF
   *   movq   %rax, (%rbx)                      ; @0xfe701  this->vtable = ...
   *
   *   movsd  -0x20(%rbp), %xmm0                ; @0xfe704  xmm0 = d
   *   divsd  10000.0(%rip), %xmm0              ; @0xfe709  const @0x3d0d20 — xmm0 = d/10000
   *   movsd  m1(%rip), %xmm1                   ; @0xfe711  const @0x3d0d30 = 0.1593017578125
   *   callq  _pow                              ; @0xfe719  xmm0 = pow(d/10000, m1)
   *   movddup %xmm0, %xmm0                     ; @0xfe71e  xmm0 = {p, p}
   *   mulpd  {c2,c3}(%rip), %xmm0              ; @0xfe722  const @0x3d1080 = {18.8515625, 18.6875}
   *   cvtpd2ps %xmm0, %xmm0                    ; @0xfe72a  narrow both lanes to f32
   *   movlpd %xmm0, 0x1a0(%rbx)                ; @0xfe72e  store 2 f32s -> +0x1a0, +0x1a4
   *
   *   testl  %r14d, %r14d                      ; @0xfe736  branch on qtApprox
   *   je     0xfe752                           ; @0xfe739  false -> full-shader branch
   *   ; qtApprox branch:
   *   movl   $0x1a0, %edi                      ; @0xfe73b  0x1a0 = size for operator new
   *   callq  __ZN8HGObjectnwEm                 ; @0xfe740  HGObject::operator new(0x1a0)
   *   movq   %rax, %r14                        ; @0xfe745  r14 = raw
   *   movq   %rax, %rdi                        ; @0xfe748  this = raw
   *   callq  __ZN26HgcBT2100_PQ_OETF_qtApproxC1Ev ; @0xfe74b  qtApprox leaf ctor
   *   jmp    0xfe767                           ; @0xfe750  -> store inner
   *   ; full-shader branch:
   *   movl   $0x1a0, %edi                      ; @0xfe752
   *   callq  __ZN8HGObjectnwEm                 ; @0xfe757  HGObject::operator new(0x1a0)
   *   movq   %rax, %r14                        ; @0xfe75c
   *   movq   %rax, %rdi                        ; @0xfe75f
   *   callq  __ZN17HgcBT2100_PQ_OETFC1Ev       ; @0xfe762  full leaf ctor
   *   ; both branches merge:
   *   movq   %r14, 0x198(%rbx)                 ; @0xfe767  this->0x198 = raw
   *   ; epilogue @0xfe76e..@0xfe778, then a landing pad @0xfe779..@0xfe7a4 that on
   *   ; exception frees `raw` (HGObject::operator delete @0xfe781) and destroys
   *   ; the partially-constructed HGNode (HGNode::~HGNode @0xfe789 / 0xfe79c),
   *   ; then _Unwind_Resume. In TS, we let the frontier throws propagate.
   *
   * NUMERIC VERIFICATION (matches sibling HGPQ::EOTF header + BT.2100 Table 4):
   *   For d = 10000 -> p = pow(1, 0.1593017578125) = 1.0
   *                    -> +0x1a0 = f32(1 * 18.8515625) = 18.8515625
   *                    -> +0x1a4 = f32(1 * 18.6875)    = 18.6875
   *   For d = 1000  -> p = pow(0.1, 0.1593017578125) ≈ 0.6931605...
   *                    -> +0x1a0 ≈ f32(13.0663...)  ≈ 13.066364
   *                    -> +0x1a4 ≈ f32(12.9524...)  ≈ 12.952437
   * (See end-of-file self-check.)
   */
  public constructor(qtApprox: boolean, d: number) { // @Helium 0xfe6e0 (C2) / 0xfe7b0 (C1 thunk)
    // HGNode::HGNode(this)  @0xfe6f5
    HGNode_ctor_call(this);
    // vtable install @0xfe701 — modelled implicitly (methods are direct dispatch here).

    // xmm0 = d / 10000.0                        @0xfe704 / @0xfe709 (const @0x3d0d20)
    // xmm1 = m1 = 0.1593017578125               @0xfe711             (const @0x3d0d30)
    // xmm0 = pow(xmm0, xmm1)                    @0xfe719
    const p = Math.pow(d / 10000.0, 0.1593017578125);

    // xmm0 = {p, p}                             @0xfe71e (movddup)
    // xmm0 *= {c2, c3} = {18.8515625, 18.6875}  @0xfe722 (mulpd, const @0x3d1080)
    // -> f64 lane0 = p * 18.8515625, lane1 = p * 18.6875
    // cvtpd2ps -> narrow both to f32            @0xfe72a
    // movlpd %xmm0, 0x1a0(%rbx)                 @0xfe72e
    //   +0x1a0 (low  4 bytes) = f32(p * c2)
    //   +0x1a4 (high 4 bytes) = f32(p * c3)
    this.pTimesC2 = Math.fround(p * 18.8515625);
    this.pTimesC3 = Math.fround(p * 18.6875);

    // testl %r14d, %r14d ; je 0xfe752   @0xfe736 / @0xfe739
    // r14 = esi = the `bool` argument. Nonzero -> qtApprox branch.
    if (qtApprox) {
      // 0xfe73b..0xfe750: qtApprox leaf allocation
      const raw = HGObject_operator_new(0x1a0); // @0xfe740
      HgcBT2100_PQ_OETF_qtApprox_ctor(raw);      // @0xfe74b
      this.inner = raw;                          // @0xfe767 (post-merge store)
      this.isQtApprox = true;
    } else {
      // 0xfe752..0xfe767: full-shader leaf allocation
      const raw = HGObject_operator_new(0x1a0); // @0xfe757
      HgcBT2100_PQ_OETF_ctor(raw);               // @0xfe762
      this.inner = raw;                          // @0xfe767
      this.isQtApprox = false;
    }
  }

  /* ---------------- dtor: HGPQ::~OETF ------------------------- */

  public destroy(): void { // @Helium 0xfe840 (D0)
    throw new Error("HGPQ_OETF destroy not yet transcribed (@Helium 0xfe840)");
  }

  /* ---------------- GetOutput ---------------------------------- */

  public GetOutput(r: HGRenderer): object { // @Helium 0xfe890
    throw new Error("HGPQ_OETF.GetOutput not yet transcribed (@Helium 0xfe890)");
  }
}
