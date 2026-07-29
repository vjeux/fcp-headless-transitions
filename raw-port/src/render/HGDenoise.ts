// HGDenoise — Helium denoise render-graph node. Framework: Helium.
//
// Symbols exported by nm on Helium (x86_64, thin slice VA==offset):
//   __ZN9HGDenoiseC1Ev                    @0x1c3810  ctor complete   (tail-jmp to C2)
//   __ZN9HGDenoiseC2Ev                    @0x1c3660  ctor base-subobj (the REAL ctor body)
//   __ZN9HGDenoiseD0Ev                    @0x1c38e0  deleting dtor    (release 4 sub-nodes + ~HGNode + delete)
//   __ZN9HGDenoiseD1Ev                    @0x1c3880  base dtor
//   __ZN9HGDenoiseD2Ev                    @0x1c3820  base-subobj dtor (identical to D1 modulo vptr addr)
//   __ZN9HGDenoise12SetParameterEiffff    @0x1c3950  SetParameter(int, float, float, float, float)
//   __ZN9HGDenoise9GetOutputEP10HGRenderer @0x1c3a60  GetOutput(HGRenderer*)  — the render-graph attach point
//
// Provenance disasm files:
//   raw-port/re/disasm/Helium.HGDenoise.HGDenoise.s        (C1 body @0x1c3810)
//   raw-port/re/disasm/Helium.HGDenoise.SetParameter.s     (SetParameter body @0x1c3950)
//   (C2 @0x1c3660, D2 @0x1c3820, D1 @0x1c3880, D0 @0x1c38e0, GetOutput @0x1c3a60 read from
//    /tmp/Helium_tV.txt and — for GetOutput, ICF-folded by otool — capstone re-disasm on the raw
//    thin-slice bytes at VA 0x1c3a60, verified against the same signature.)
//
// FAITHFUL PORT — every function cites its @Helium 0xADDR. Every numeric constant cites the
// address it was read from (thin x86_64 slice VA==offset). Undecoded callees throw citing
// their FCP address (PORTING_SPEC.md Rule 3). Single-precision (movss/mulss/divss/maxss/
// cvtss2sd/cvtsd2ss/ucomiss) ops are wrapped in Math.fround where the result is written back
// to a float slot (Rule 4).

// ── STRUCT LAYOUT (recovered from HGDenoise::HGDenoise C2 @0x1c3660..0x1c37b9) ─────────────────
//   sizeof(HGDenoise) >= 0x1e8 bytes (the ctor writes into +0x1e0 last, so at least +0x1e8 exists).
//   The struct inherits from HGNode via `HGNode::HGNode()` @0x1c366e; HGNode's own layout is
//   opaque here. Fields observed via direct writes:
//     +0x00   vptr slot                     (set to HGDenoise vtable @0x1c367a via `leaq 0x865716(%rip),%rax; movq %rax,(%rbx)`
//                                            -> RIP=0x1c367a+7+0x865716 = 0xa28d97, i.e. `&__ZTV9HGDenoise + 0x10`)
//     +0x198  float param 0  ("amount")     — SetParameter idx0 writes here; ctor block-init to 0.0
//     +0x19c  float param 3                  — SetParameter idx3 writes here; ctor block-init to 0.0
//     +0x1a0  float param 1  ("sharpness")  — SetParameter idx1 writes here; ctor block-init to 1e-10
//                                            (the same divide-by-zero-guard threshold used in SetParameter's clamp)
//     +0x1a4  float param 2  ("radius")     — SetParameter idx2 writes here; ctor block-init to 0.0
//     +0x1a8  u32  "dirty" flag              — SetParameter sets to 1 on any real change (else 0
//                                            for a no-op write of an identical value); GetOutput
//                                            clears to 0 at entry (@0x1c3a70)
//     +0x1b0  HGNode*  midNode ("iter0")     — new HGNode(0x1a0 bytes) — an anonymous per-pixel iteration node
//     +0x1b8  HGNode*  midNode2 ("iter1")    — new HGNode(0x1b0 bytes) whose own +0x198 holds a nested new HGNode(0x1a0)
//     +0x1c0  HGRegularize* regularize       — new HGRegularize (0x1b0 bytes)
//     +0x1c8  HGLegacyBlend* blend           — new HGLegacyBlend (0x1c0 bytes)
//     +0x1d0  16 bytes zero  (movaps xmm0 with xorps'd xmm0)
//     +0x1e0  qword zero
//
// The four sub-nodes are wired at ctor tail via HGNode::SetInput(int, HGNode*) — the pipeline
// topology is:
//     iter1  ← SetInput(0, iter0)          @0x1c3769  (iter1.input[0] = iter0)
//     regularize ← SetInput(0, iter1)      @0x1c377f  (regularize.input[0] = iter1)
//     blend  ← SetInput(0, iter0)          @0x1c3795  (blend.input[0]  = iter0)
//     blend  ← SetInput(1, regularize)     @0x1c37ae  (blend.input[1]  = regularize)
// so the DAG is:  iter0 -> iter1 -> regularize -+
//                    \--------------------------+->  blend  (mixes clean vs original)
// This matches the classic "regularization + legacy blend" denoise pattern.

// ── opaque frontier types (Helium base classes, layouts not decoded here) ──────────────────────
/** Base render-graph node. Layout opaque here; ctor/dtor/vt-slots resolved via the HGNode.ts port. */
export interface HGNode {
  /** vt[0x18] = HGObject::Release() (@Helium 0x1a0f30). Called by dtors on each sub-node. */
  Release(): void;
  /** vt[0x60] = HGNode::SetParameter(int, float, float, float, float) (@Helium 0x11cab0). */
  SetParameter(idx: number, a: number, b: number, c: number, d: number): number;
  /** vt[0x78] = HGNode::SetInput(int, HGNode*) (@Helium 0x11c5f0). */
  SetInput(idx: number, src: HGNode | null): void;
}
/** HGRenderer — Helium frame renderer. Layout opaque here; only GetInput is referenced. */
export interface HGRenderer {
  /** HGRenderer::GetInput(HGNode*, int) (@Helium 0xf2dd0). Returns a source-image handle. */
  GetInput(node: HGNode, idx: number): unknown;
}
/** HGLegacyBlend — Helium legacy blend node (0x1c0-byte struct). Layout opaque here. */
export interface HGLegacyBlend extends HGNode {}
/** HGRegularize — Helium regularization node (0x1b0-byte struct). Layout opaque here. */
export interface HGRegularize extends HGNode {}

// ── seed constants (all doubles read via capstone from Helium thin-slice VA==offset) ───────────
/** @const 0x3d8a78  double = 0.01                (u64 0x3f847ae147ae147b)
 *  — 3rd factor of SetParameter idx0 @0x1c3986: `mulsd 0x2150ea(%rip),%xmm0` -> RIP-end=0x1c398e,
 *    disp=0x2150ea -> target=0x1c398e+0x2150ea = 0x3d8a78.
 *    Same address is reused by SetParameter idx1 @0x1c39b6: `mulsd 0x2150ba(%rip),%xmm0`
 *    -> 0x1c39be+0x2150ba = 0x3d8a78. Percent→fraction normaliser for params 0 and 1. */
const K_PERCENT_TO_FRACTION: number = 0.01;

/** @const 0x85dcc8  double = 1e-10               (u64 0x3ddb7cdfd9d7bdbb)
 *  — clamp-threshold ucomisd @0x1c39c9 in SetParameter idx1: if (param1 <= 1e-10) then override.
 *    RIP=0x1c39d1+0x69a2f7 = 0x85dcc8. */
const K_MIN_SHARPNESS_D: number = 1e-10;

/** @const 0x85dcb4  float = 1e-10                (u32 0x2edbe6ff)
 *  — the value substituted into param1 when the input is at-or-below threshold, movss @0x1c39d3:
 *    `movss 0x69a2d9(%rip),%xmm0` -> RIP=0x1c39db+0x69a2d9 = 0x85dcb4. Guards against a
 *    divide-by-zero in GetOutput (12.75f / param1). */
const K_MIN_SHARPNESS_F: number = Math.fround(1e-10);

/** @const 0x85dcc0  double = 0.002               (u64 0x3f60624dd2f1a9fc)
 *  — 3rd factor of SetParameter idx2 @0x1c39f8: `mulsd 0x69a2c0(%rip),%xmm0`
 *    -> RIP=0x1c3a00+0x69a2c0 = 0x85dcc0. Percent→fraction with a ×5 gain (radius→shader-units). */
const K_RADIUS_SCALE: number = 0.002;

/** @const 0x85dcb8  float = 12.75                (u32 0x414c0000)
 *  — GetOutput numerator @0x1c3a85: `movss 0x69a22b(%rip),%xmm1` ; divss xmm1, [rdi+0x1a0]
 *    -> RIP=0x1c3a8d+0x69a22b = 0x85dcb8. Uniform-space "sharpness slope" divided by param1. */
const K_SHARPNESS_NUM: number = Math.fround(12.75);

/** @const 0x3ca294  float = 100.0                (u32 0x42c80000)
 *  — GetOutput @0x1c3aa2: `mulss 0x2067ea(%rip),%xmm1` on the +0x1a4 (radius) slot.
 *    RIP=0x1c3aaa+0x2067ea = 0x3ca294. Rescales the stored 0.002-normalised value back to a
 *    shader-radius uniform: stored=input×0.002, uniform=stored×100 = input×0.2. */
const K_RADIUS_UNIFORM_GAIN: number = Math.fround(100.0);

/** @const 0x3c7cc0  float = 1.0                  (u32 0x3f800000)
 *  — GetOutput @0x1c3b16: `movss 0x2041a2(%rip),%xmm1` used as the y/z/w component of the
 *    4-vector passed to HGLegacyBlend->SetParameter(1, +0x198, 1.0, 1.0, 0.0). Reused as
 *    xmm2 via `movaps xmm2,xmm1` @0x1c3b26. RIP=0x1c3b1e+0x2041a2 = 0x3c7cc0. */
const K_ONE_F: number = Math.fround(1.0);

// ── operator-new sizes (each `movl $imm,%edi ; callq __ZN8HGObjectnwEm` in the ctor) ───────────
/** iter0/nested-iter1: `movl $0x1a0,%edi` @0x1c3695 and @0x1c36f7 fed to HGObject::operator new. */
const K_ITER_NODE_SIZE: number = 0x1a0;
/** blend: `movl $0x1c0,%edi` @0x1c36b1 fed to HGObject::operator new. */
const K_BLEND_SIZE: number = 0x1c0;
/** iter1 wrapper / regularize: `movl $0x1b0,%edi` @0x1c36cd and @0x1c3725 fed to HGObject::operator new. */
const K_MID_NODE_SIZE: number = 0x1b0;

// ── frontier stubs for un-ported Helium callees ────────────────────────────────────────────────

/** `HGNode::HGNode()` — symbol `__ZN6HGNodeC2Ev` / `__ZN6HGNodeC1Ev` (@Helium — stub called
 *  @0x1c366e (base), @0x1c36a5 (iter0), @0x1c36dd (iter1 wrapper), @0x1c3707 (nested iter1),
 *  @0x1c36ed... etc.). Frontier. */
function HGNode_ctor(_self: HGNode): void {
  throw new Error("HGNode::HGNode() @Helium not yet transcribed (called from HGDenoise::HGDenoise() @0x1c366e)");
}

/** `HGNode::~HGNode()` — symbol `__ZN6HGNodeD2Ev` (@Helium 0x11c050 per vtable *0x00).
 *  Called by every HGDenoise dtor variant. Frontier. */
function HGNode_dtor(_self: HGNode | HGDenoise): void {
  throw new Error("HGNode::~HGNode() @Helium 0x11c050 not yet transcribed (called from HGDenoise dtors @0x1c3870/@0x1c38d0/@0x1c392a)");
}

/** `HGObject::Release()` — symbol `__ZN8HGObject7ReleaseEv` (@Helium 0x1a0f30, resolved via
 *  HGNode vtable *0x18). Called on each of the 4 sub-nodes by every HGDenoise dtor variant. */
function HGObject_Release(_self: HGNode): void {
  throw new Error("HGObject::Release() @Helium 0x1a0f30 (HGNode vt[0x18]) not yet transcribed (called from HGDenoise dtors on each sub-node @0x1c383d/@0x1c384a/@0x1c3857/@0x1c3864)");
}

/** `HGObject::operator new(unsigned long)` — symbol `__ZN8HGObjectnwEm`. Frontier — the FCP
 *  allocator; in TS we synthesise the appropriate sub-node object directly. */
function HGObject_new(_size: number): never {
  throw new Error("HGObject::operator new(unsigned long) @Helium not yet transcribed (called from HGDenoise::HGDenoise() for size 0x1a0/0x1b0/0x1c0)");
}

/** `HGLegacyBlend::HGLegacyBlend()` — symbol `__ZN13HGLegacyBlendC1Ev` (@Helium — called
 *  @0x1c36c1 in the HGDenoise ctor). Frontier. */
function HGLegacyBlend_ctor(_self: HGLegacyBlend): void {
  throw new Error("HGLegacyBlend::HGLegacyBlend() @Helium not yet transcribed (called from HGDenoise::HGDenoise() @0x1c36c1)");
}

/** `HGRegularize::HGRegularize()` — symbol `__ZN12HGRegularizeC2Ev` (@Helium — called
 *  @0x1c3735 in the HGDenoise ctor). Frontier. */
function HGRegularize_ctor(_self: HGRegularize): void {
  throw new Error("HGRegularize::HGRegularize() @Helium not yet transcribed (called from HGDenoise::HGDenoise() @0x1c3735)");
}

/** The anonymous 0x1a0-byte iter0 node has its vptr rewritten @0x1c367a-like
 *  (`leaq 0x8658bd(%rip),%rax ; movq %rax,(%r12)` @0x1c370c/0x1c3713 -> RIP-end=0x1c3713+7=?
 *  actually target = 0x1c370c+7+0x8658bd = 0xa28fd0). We tag it with `class_kind` here and
 *  defer identifying that vtable to whoever ports the iter-node class. */
function makeAnonymousIter0Node(): HGNode {
  throw new Error("anonymous iter0 HGNode subclass (vtable at 0xa28fd0 written @0x1c370c) @Helium not yet transcribed (constructed inside HGDenoise::HGDenoise() @0x1c36fc..0x1c3717)");
}

/** The anonymous 0x1b0-byte iter1 wrapper has its vptr set @0x1c36e2
 *  (`leaq 0x8646cf(%rip),%rax ; movq %rax,(%r14)` -> target = 0x1c36e9+0x8646cf = 0xa27db8).
 *  It contains an iter0 pointer at +0x198 (@0x1c3717) and a null at +0x1a0 (@0x1c36ec). */
function makeAnonymousIter1WrapperNode(_iter0: HGNode): HGNode {
  throw new Error("anonymous iter1-wrapper HGNode subclass (vtable at 0xa27db8 written @0x1c36e2) @Helium not yet transcribed (constructed inside HGDenoise::HGDenoise() @0x1c36cd..0x1c371e)");
}

// ── HGDenoise ──────────────────────────────────────────────────────────────────────────────────

/**
 * HGDenoise — a Helium render-graph node exposing a denoise pipeline built from four
 * sub-nodes (iter0, iter1-wrapper, HGRegularize, HGLegacyBlend). The user controls four
 * float parameters via SetParameter, and reads the composed output via GetOutput.
 *
 * The struct layout comment at the top of this file is authoritative for offsets.
 */
export class HGDenoise implements HGNode {
  /** +0x198 float — SetParameter idx0 target. Ctor initial: 0.0 (from movaps block @0x1c367d). */
  private paramAmount: number = 0.0;
  /** +0x19c float — SetParameter idx3 target. Ctor initial: 0.0. */
  private paramExtra: number = 0.0;
  /** +0x1a0 float — SetParameter idx1 target. Ctor initial: 1e-10 (K_MIN_SHARPNESS_F). */
  private paramSharpness: number = K_MIN_SHARPNESS_F;
  /** +0x1a4 float — SetParameter idx2 target. Ctor initial: 0.0. */
  private paramRadius: number = 0.0;
  /** +0x1a8 u32 — "dirty" flag. SetParameter returns 1 (dirty) or 0 (unchanged). */
  private dirty: number = 0;
  /** +0x1b0 HGNode*  iter0 (anonymous per-pixel iteration node, 0x1a0-byte). */
  private iter0!: HGNode;
  /** +0x1b8 HGNode*  iter1 wrapper (0x1b0-byte anonymous, holds nested iter1 at wrapper+0x198). */
  private iter1: HGNode;
  /** +0x1c0 HGRegularize* regularize (0x1b0-byte). */
  private regularize: HGRegularize;
  /** +0x1c8 HGLegacyBlend* blend (0x1c0-byte). */
  private blend: HGLegacyBlend;
  /** +0x1d0..+0x1df — 16 bytes zero. Not read by any of the 3 methods we've decoded; kept
   *  as an opaque padding placeholder. */
  private pad_1d0: [number, number, number, number] = [0, 0, 0, 0];
  /** +0x1e0 — qword zero. Same story: opaque, not touched by SetParameter/GetOutput. */
  private pad_1e0: number = 0;

  /**
   * HGDenoise::HGDenoise()  — @Helium 0x1c3660  (C2 base-subobj)
   *
   * C1 @0x1c3810 is a pure tail-jmp to C2 (`pushq %rbp ; movq %rsp,%rbp ; popq %rbp ;
   * jmp __ZN9HGDenoiseC2Ev`). We collapse the two.
   *
   * Disasm walk (raw-port/re/disasm/Helium.HGDenoise.HGDenoise.s C1 + inline C2 read from
   * /tmp/Helium_tV.txt):
   *
   *   0x1c366e  callq HGNode::HGNode()                     (base subobject ctor)
   *   0x1c3673  leaq  0x865716(%rip),%rax                   ; rax = &__ZTV9HGDenoise + 0x10
   *             -> RIP=0x1c367a+0x865716 = 0xa28d90+0x10 = 0xa28d90 (the vtable body); Itanium
   *             installed pointer skips the 16-byte header, i.e. `vtable + 0x10`.
   *   0x1c367a  movq  %rax,(%rbx)                           ; this->vptr = &HGDenoise-vtable + 0x10
   *   0x1c367d  movaps 0x69a61c(%rip),%xmm0                 ; xmm0 = 16-byte const @0x85dca0
   *                                                          = float{0.0, 0.0, 1e-10, 0.0}
   *   0x1c3684  movups %xmm0,0x198(%rbx)                    ; this+0x198..+0x1a7 = block-init
   *   0x1c368b  movl   $0x0, 0x1a8(%rbx)                    ; dirty = 0
   *   0x1c3695  movl   $0x1a0,%edi ; callq HGObject::operator new
   *   0x1c369f-0x1c36aa   new_obj = HGObject::new(0x1a0); HGNode::HGNode(new_obj); this+0x1b0=new_obj
   *                       (iter0 — a plain HGNode, vtable NOT rewritten here — it inherits HGNode's vtable)
   *   0x1c36b1  movl   $0x1c0,%edi ; callq HGObject::operator new
   *   0x1c36bb-0x1c36c6   new_obj = HGObject::new(0x1c0); HGLegacyBlend::HGLegacyBlend(new_obj); this+0x1c8=new_obj
   *                       (blend — a proper HGLegacyBlend instance)
   *   0x1c36cd  movl   $0x1b0,%edi ; callq HGObject::operator new
   *   0x1c36d7-0x1c36e9   new_obj = HGObject::new(0x1b0); HGNode::HGNode(new_obj);
   *                       new_obj->vptr = 0xa27db8 (`leaq 0x8646cf(%rip),%rax ; movq %rax,(%r14)`
   *                       -> RIP=0x1c36e9+0x8646cf = 0xa27db8 — an iter1-wrapper vtable);
   *   0x1c36ec  movq   $0x0, 0x1a0(%r14)                    ; iter1-wrapper[+0x1a0] = 0
   *   0x1c36f7  movl   $0x1a0,%edi ; callq HGObject::operator new
   *   0x1c3701-0x1c3713   new_obj = HGObject::new(0x1a0); HGNode::HGNode(new_obj);
   *                       new_obj->vptr = 0xa28fd0 (`leaq 0x8658bd(%rip),%rax`) — the iter0 vtable
   *                       (an anonymous inner iteration class);
   *   0x1c3717  movq   %r12, 0x198(%r14)                    ; iter1-wrapper[+0x198] = nested iter0
   *   0x1c371e  movq   %r14, 0x1b8(%rbx)                    ; this+0x1b8 = iter1-wrapper
   *   0x1c3725  movl   $0x1b0,%edi ; callq HGObject::operator new
   *   0x1c372f-0x1c373a   new_obj = HGObject::new(0x1b0); HGRegularize::HGRegularize(new_obj);
   *                       this+0x1c0 = new_obj
   *   0x1c3741  xorps %xmm0,%xmm0 ; movaps %xmm0,0x1d0(%rbx)  ; this+0x1d0..+0x1df = 0
   *   0x1c374b  movq   $0x0, 0x1e0(%rbx)                    ; this+0x1e0 = 0
   *
   *   Pipeline wiring (all through HGNode::SetInput @vt[0x78]):
   *   0x1c3756-0x1c3769   rdx = this+0x1b0 (iter0) ; rdi = this+0x1b8 (iter1); rsi = 0
   *                       -> iter1->SetInput(0, iter0)         @0x1c3769
   *   0x1c376c-0x1c377f   rdx = this+0x1b8 (iter1) ; rdi = this+0x1c0 (regularize); rsi = 0
   *                       -> regularize->SetInput(0, iter1)    @0x1c377f
   *   0x1c3782-0x1c3795   rdx = this+0x1b0 (iter0) ; rdi = this+0x1c8 (blend); rsi = 0
   *                       -> blend->SetInput(0, iter0)         @0x1c3795
   *   0x1c3798-0x1c37ae   rdx = this+0x1c0 (regularize); rdi = this+0x1c8 (blend); rsi = 1
   *                       -> blend->SetInput(1, regularize)    @0x1c37ae
   *
   *   Unwind pads @0x1c37bc..0x1c3803: delete partially-constructed sub-nodes and re-throw.
   *   HGObject::operator delete + HGNode::~HGNode + __Unwind_Resume.
   */
  constructor() {
    // @0x1c366e — HGNode base subobject ctor. Frontier throw preserves the gap.
    HGNode_ctor(this);

    // @0x1c3673..0x1c367a — vptr install. Modelled structurally (class identity IS the vtable).
    // The address 0xa28d90 (vtable body) is preserved in the doc-comment.

    // @0x1c367d..0x1c3684 — 16-byte block-init from @0x85dca0 (float{0,0,1e-10,0}).
    this.paramAmount = 0.0;         // +0x198
    this.paramExtra = 0.0;          // +0x19c
    this.paramSharpness = K_MIN_SHARPNESS_F; // +0x1a0
    this.paramRadius = 0.0;         // +0x1a4

    // @0x1c368b — dirty = 0.
    this.dirty = 0;

    // @0x1c3695..0x1c36aa — iter0 = new HGNode(0x1a0). PURE HGNode, vtable not rewritten.
    void K_ITER_NODE_SIZE;
    // FRONTIER: allocation is opaque; the base-HGNode ctor is un-transcribed. We surface the
    // gap by throwing from HGNode_ctor — model the allocation as HGObject_new + HGNode_ctor
    // on the resulting object. Since HGObject_new throws, we don't actually construct.
    try {
      // Model the emitted sequence: allocate, then ctor. We can't legally build an
      // HGNode-typed value without either allocation or ctor — both are frontier.
      const iter0 = HGObject_new(K_ITER_NODE_SIZE) as unknown as HGNode;
      HGNode_ctor(iter0);
      this.iter0 = iter0;
    } catch (e) {
      // Unwind pad @0x1c37f5..0x1c3803: HGNode::~HGNode(this) + __Unwind_Resume(e).
      try {
        HGNode_dtor(this);
      } catch {
        /* frontier throw; propagate the original */
      }
      throw e;
    }

    // @0x1c36b1..0x1c36c6 — blend = new HGLegacyBlend(0x1c0).
    void K_BLEND_SIZE;
    try {
      const blend = HGObject_new(K_BLEND_SIZE) as unknown as HGLegacyBlend;
      HGLegacyBlend_ctor(blend);
      this.blend = blend;
    } catch (e) {
      // Unwind pad: delete iter0, then HGNode::~HGNode(this), _Unwind_Resume.
      try {
        HGObject_Release(this.iter0);
      } catch {
        /* frontier */
      }
      try {
        HGNode_dtor(this);
      } catch {
        /* frontier */
      }
      throw e;
    }

    // @0x1c36cd..0x1c371e — iter1-wrapper (0x1b0-byte) with a nested iter0-class node inside.
    void K_MID_NODE_SIZE;
    try {
      const iter1 = makeAnonymousIter1WrapperNode(makeAnonymousIter0Node());
      this.iter1 = iter1;
    } catch (e) {
      // Unwind pad: delete blend and iter0, then HGNode::~HGNode(this), _Unwind_Resume.
      try {
        HGObject_Release(this.blend);
      } catch {
        /* frontier */
      }
      try {
        HGObject_Release(this.iter0);
      } catch {
        /* frontier */
      }
      try {
        HGNode_dtor(this);
      } catch {
        /* frontier */
      }
      throw e;
    }

    // @0x1c3725..0x1c373a — regularize = new HGRegularize(0x1b0).
    try {
      const reg = HGObject_new(K_MID_NODE_SIZE) as unknown as HGRegularize;
      HGRegularize_ctor(reg);
      this.regularize = reg;
    } catch (e) {
      // Unwind pad: delete iter1, blend, iter0, then HGNode::~HGNode(this), _Unwind_Resume.
      try {
        HGObject_Release(this.iter1);
      } catch {
        /* frontier */
      }
      try {
        HGObject_Release(this.blend);
      } catch {
        /* frontier */
      }
      try {
        HGObject_Release(this.iter0);
      } catch {
        /* frontier */
      }
      try {
        HGNode_dtor(this);
      } catch {
        /* frontier */
      }
      throw e;
    }

    // @0x1c3741..0x1c374b — pad zero fields.
    this.pad_1d0 = [0, 0, 0, 0];
    this.pad_1e0 = 0;

    // @0x1c3756..0x1c37ae — pipeline wiring via HGNode::SetInput @vt[0x78]:
    //   iter1.SetInput(0, iter0)              @0x1c3769
    //   regularize.SetInput(0, iter1)         @0x1c377f
    //   blend.SetInput(0, iter0)              @0x1c3795
    //   blend.SetInput(1, regularize)         @0x1c37ae
    this.iter1.SetInput(0, this.iter0);
    this.regularize.SetInput(0, this.iter1);
    this.blend.SetInput(0, this.iter0);
    this.blend.SetInput(1, this.regularize);
  }

  /**
   * HGDenoise::~HGDenoise() (base subobj)  — @Helium 0x1c3820  (D2 __ZN9HGDenoiseD2Ev).
   * D1 @0x1c3880 is byte-identical modulo the vtable address stored @0x1c3889:
   *   D2: `leaq 0x865560(%rip),%rax` -> 0xa28d90 (dtor-phase vtable)
   *   D1: `leaq 0x865500(%rip),%rax` -> the same 0xa28d90 (Itanium: D1 and D2 share dtor-vtable)
   * We collapse both.
   *
   *   0x1c3820..0x1c3830  prologue + install dtor-phase vtable at this+0x0
   *   0x1c3833..0x1c3840  rdi = this+0x1b0 (iter0);  rax = iter0->vptr;  callq vt[0x18]
   *                        -> iter0->Release()   (@0x1c383d)
   *   0x1c3840..0x1c384a  rdi = this+0x1c8 (blend); vt[0x18] -> blend->Release()   (@0x1c384a)
   *   0x1c384d..0x1c3857  rdi = this+0x1b8 (iter1); vt[0x18] -> iter1->Release()   (@0x1c3857)
   *   0x1c385a..0x1c3864  rdi = this+0x1c0 (regularize); vt[0x18] -> regularize->Release() (@0x1c3864)
   *   0x1c3867..0x1c3870  epilogue + `jmp HGNode::~HGNode()`  (tail-call to base dtor)
   *   0x1c3875           landing-pad `___clang_call_terminate` (any Release throw is fatal).
   */
  destroyBase(): void {
    // @0x1c383d — iter0->Release().  Frontier throw is fatal in the C++ (calls terminate).
    HGObject_Release(this.iter0);
    // @0x1c384a — blend->Release().
    HGObject_Release(this.blend);
    // @0x1c3857 — iter1->Release().
    HGObject_Release(this.iter1);
    // @0x1c3864 — regularize->Release().
    HGObject_Release(this.regularize);
    // @0x1c3870 — jmp HGNode::~HGNode().
    HGNode_dtor(this);
  }

  /**
   * HGDenoise::~HGDenoise() (deleting)  — @Helium 0x1c38e0  (D0 __ZN9HGDenoiseD0Ev).
   *
   * Identical to D2/D1 except the final tail-jump is to `HGObject::operator delete(this)`
   * INSTEAD of __ZN6HGNodeD2Ev, and the base HGNode dtor is called explicitly BEFORE the
   * delete (@0x1c392a  callq __ZN6HGNodeD2Ev ; @0x1c3938  jmp __ZN8HGObjectdlEPv). In TS
   * the operator-delete is degenerate; the GC reclaims storage.
   */
  destroyAndDelete(): void {
    // @0x1c38fd — iter0->Release().
    HGObject_Release(this.iter0);
    // @0x1c390a — blend->Release().
    HGObject_Release(this.blend);
    // @0x1c3917 — iter1->Release().
    HGObject_Release(this.iter1);
    // @0x1c3924 — regularize->Release().
    HGObject_Release(this.regularize);
    // @0x1c392a — HGNode::~HGNode().
    HGNode_dtor(this);
    // @0x1c3938 — HGObject::operator delete(this). No TS equivalent; GC reclaims.
  }

  /**
   * HGDenoise::SetParameter(int idx, float v, float, float, float)  — @Helium 0x1c3950.
   *
   * Returns int32:
   *   -1  on idx out-of-range (idx > 3)     — `movl $0xffffffff,%eax` @0x1c3a49
   *    0  on no-op (input equals stored value AND is not NaN — the `jnp` after `jne 0x1c3a3b`)
   *       -> `movl $0x0,0x1a8(%rdi) ; xorl %eax,%eax`  @0x1c3a3b..0x1c3a45
   *    1  on a real change                  — `movl $0x1,0x1a8(%rdi) ; callq HGNode::ClearBits() ;
   *                                            movl $0x1,%eax`  @0x1c3a25..0x1c3a34
   *
   * Disasm (raw-port/re/disasm/Helium.HGDenoise.SetParameter.s):
   *
   *   0x1c3954-0x1c3957   cmpl $0x3, %esi ; ja 0x1c3a49          (idx bounds check: idx>3 -> -1)
   *   0x1c395d-0x1c396d   jump-table dispatch on esi (0..3):
   *                        rax = idx ; rcx = &jump-table @rip+0xea (i.e. @0x1c3a50)
   *                        offs = (int32*)rcx[rax]
   *                        target = rcx + offs ; jmpq *target
   *
   *   Case idx=0  -> 0x1c396f..0x1c399a:
   *     xmm1 = *(rdi+0x198)                       (current stored value)
   *     if (xmm1 == v && not NaN) goto no-op(0x1c3a3b);
   *     xmm0 = cvtss2sd(v) ; xmm0 *= 0.01  (K_PERCENT_TO_FRACTION @0x3d8a78)
   *     xmm0 = cvtsd2ss(xmm0)
   *     *(rdi+0x198) = xmm0
   *     goto commit(0x1c3a25)
   *
   *   Case idx=1  -> 0x1c399f..0x1c39e3:
   *     xmm1 = *(rdi+0x1a0)
   *     if (xmm1 == v && not NaN) goto no-op(0x1c3a3b);
   *     xmm0 = cvtss2sd(v) ; xmm0 *= 0.01  (K_PERCENT_TO_FRACTION)
   *     xmm0 = cvtsd2ss(xmm0)
   *     xmm1 = 0.0 ; xmm1 = cvtss2sd(xmm0)
   *     if (xmm1 > 1e-10 (K_MIN_SHARPNESS_D @0x85dcc8)) then xmm0 stays as-is
   *       else xmm0 = 1e-10-float (K_MIN_SHARPNESS_F @0x85dcb4)
   *     *(rdi+0x1a0) = xmm0
   *     goto commit(0x1c3a25)
   *
   *   Case idx=2  -> 0x1c39e5..0x1c3a0c:
   *     xmm1 = *(rdi+0x1a4)
   *     if (xmm1 == v && not NaN) goto no-op(0x1c3a3b);
   *     xmm0 = cvtss2sd(v) ; xmm0 *= 0.002  (K_RADIUS_SCALE @0x85dcc0)
   *     xmm0 = cvtsd2ss(xmm0)
   *     *(rdi+0x1a4) = xmm0
   *     goto commit(0x1c3a25)
   *
   *   Case idx=3  -> 0x1c3a0e..0x1c3a25:
   *     xmm1 = *(rdi+0x19c)
   *     if (xmm1 == v && not NaN) goto no-op(0x1c3a3b);
   *     *(rdi+0x19c) = v            (NO scaling for idx=3)
   *     -> fall through to commit
   *
   *   Commit (0x1c3a25..0x1c3a3a):
   *     *(rdi+0x1a8) = 1 ; HGNode::ClearBits(this) ; return 1;
   *
   *   No-op (0x1c3a3b..0x1c3a48):
   *     *(rdi+0x1a8) = 0 ; return 0;
   *
   *   Out-of-range (0x1c3a49..0x1c3a4f): return -1.
   *
   * NOTE the 3rd/4th/5th float args (b,c,d) are UNUSED by every case — the signature is
   * `SetParameter(int, float, float, float, float)` because that's the shared HGNode override
   * signature, but HGDenoise only reads `a`. This is preserved verbatim from the disassembly.
   */
  SetParameter(idx: number, a: number, _b: number, _c: number, _d: number): number {
    // @0x1c3954 — idx bounds check.
    if (idx > 3 || idx < 0) {
      return -1;
    }
    // The jump-table dispatch @0x1c395d..0x1c396d is a 4-way switch; TS switch mirrors it.

    // Snapshot the input as float32 (`ucomiss` is float32) — the incoming JS number may be
    // outside float32 precision, but the emitted asm treats the SSE register as float32.
    const vF = Math.fround(a);

    switch (idx) {
      case 0: {
        // @0x1c396f-0x1c399a: ucomiss +0x198, v ; jne+jnp (v==stored && !NaN) -> no-op
        // ucomiss sets PF=1 if either operand is NaN; the `jne ...; jnp no-op` skip the update
        // ONLY when equal AND neither is NaN. NaN inputs THEREFORE fall through to the update.
        // We reproduce that exactly.
        const cur = this.paramAmount;
        if (cur === vF && !isNaN(vF)) {
          // @0x1c3a3b — no-op branch.
          this.dirty = 0;
          return 0;
        }
        // @0x1c3982-0x1c3992 — v_double = (double)v ; v_double *= 0.01 ; v_float = (float)v_double
        const v64 = vF * K_PERCENT_TO_FRACTION;
        this.paramAmount = Math.fround(v64); // +0x198 = float32 store
        break;
      }
      case 1: {
        // @0x1c399f-0x1c39e3: same equality/no-op guard, then multiply-by-0.01, then clamp
        // against 1e-10 in DOUBLE precision.
        const cur = this.paramSharpness;
        if (cur === vF && !isNaN(vF)) {
          this.dirty = 0;
          return 0;
        }
        // @0x1c39b2-0x1c39be — v_double = (double)v * 0.01 ; v_float = (float)v_double
        const scaledF = Math.fround(vF * K_PERCENT_TO_FRACTION);
        // @0x1c39c2-0x1c39d3 — xmm1 = cvtss2sd(scaledF)
        //   if (xmm1 > 1e-10) xmm0 = scaledF   else   xmm0 = K_MIN_SHARPNESS_F (@0x85dcb4)
        // In C-terms:  y = (scaledF as double) > 1e-10 ? scaledF : K_MIN_SHARPNESS_F.
        // ucomisd with `ja` means UNORDERED (NaN) or "not strictly greater" falls to override,
        // so a NaN scaledF ALSO gets overridden to K_MIN_SHARPNESS_F. Preserve that.
        const scaledD: number = scaledF;
        const clampedF: number =
          scaledD > K_MIN_SHARPNESS_D ? scaledF : K_MIN_SHARPNESS_F;
        this.paramSharpness = clampedF; // +0x1a0
        break;
      }
      case 2: {
        // @0x1c39e5-0x1c3a0c: equality/no-op guard, then multiply-by-0.002.
        const cur = this.paramRadius;
        if (cur === vF && !isNaN(vF)) {
          this.dirty = 0;
          return 0;
        }
        // @0x1c39f4-0x1c3a04 — v_double = (double)v * 0.002 ; v_float = (float)v_double
        const v64 = vF * K_RADIUS_SCALE;
        this.paramRadius = Math.fround(v64); // +0x1a4
        break;
      }
      case 3: {
        // @0x1c3a0e-0x1c3a25: equality/no-op guard, then STORE WITHOUT SCALING.
        const cur = this.paramExtra;
        if (cur === vF && !isNaN(vF)) {
          this.dirty = 0;
          return 0;
        }
        // @0x1c3a1d — *(rdi+0x19c) = xmm0  (v, unscaled)
        this.paramExtra = vF; // +0x19c
        break;
      }
      default:
        // Unreachable — the bounds check at 0x1c3954 already rejected idx > 3, and TS switch
        // exhaustive-check is redundant with the numeric guard above. Keep for defensive shape.
        return -1;
    }

    // Commit path @0x1c3a25..0x1c3a34: dirty=1 ; HGNode::ClearBits() ; return 1.
    this.dirty = 1;
    HGNode_ClearBits(this);
    return 1;
  }

  /**
   * HGDenoise::GetOutput(HGRenderer*)  — @Helium 0x1c3a60.
   *
   * Note: `otool -tV` reports this method as ICF-folded (no label emitted at 0x1c3a60), so
   * disasm.sh refuses to extract it. The body below was recovered via capstone on the raw
   * thin-slice bytes at VA 0x1c3a60 (the entry is otherwise well-formed and terminated by a
   * `ret` @0x1c3b5f, matching the symbol's nm-reported length).
   *
   * Body (capstone disasm):
   *
   *   0x1c3a60-0x1c3a6d   prologue + rbx = this ; r14 = renderer (rsi)
   *   0x1c3a70            movl $0, this+0x1a8                       (clear dirty)
   *   0x1c3a7a-0x1c3a95   xmm0 = max(0, this+0x19c)                 (max with 0, i.e. max(0, extra))
   *                       xmm1 = 12.75f / this+0x1a0                (SHARPNESS_NUM / sharpness)
   *                       spill xmm1 -> [rbp-0x1c]
   *   0x1c3a9a-0x1c3aaa   xmm1 = this+0x1a4 * 100.0f                (paramRadius × 100)
   *                       spill xmm1 -> [rbp-0x20]
   *   0x1c3aaf-0x1c3ac4   iter1 = this+0x1b8 ; vt = *iter1
   *                       iter1->vt[0x60](0, xmm0=max, xmm1=max, xmm2=max, xmm3=max)
   *                       = iter1->SetParameter(0, maxExtra, maxExtra, maxExtra, maxExtra)
   *   0x1c3ac7-0x1c3ae4   iter1 = this+0x1b8 ; vt = *iter1
   *                       xmm0 = [rbp-0x1c] = 12.75/sharpness ; xmm1=xmm2=xmm3=xmm0
   *                       iter1->vt[0x60](1, 12.75/sh, 12.75/sh, 12.75/sh, 12.75/sh)
   *                       = iter1->SetParameter(1, sharpnessRecip, sharpnessRecip, sharpnessRecip, sharpnessRecip)
   *   0x1c3ae7-0x1c3b01   regularize = this+0x1c0 ; vt = *regularize
   *                       xmm0 = [rbp-0x20] = radius*100 ; xmm1=xmm2=xmm3=xmm0
   *                       regularize->vt[0x60](0, radius*100, ...×3)
   *                       = regularize->SetParameter(0, radiusUniform, radiusUniform, radiusUniform, radiusUniform)
   *   0x1c3b04-0x1c3b29   blend = this+0x1c8 ; vt = *blend
   *                       xmm0 = this+0x198 (amount) ; xmm1 = 1.0f (@0x3c7cc0) ; xmm2 = xmm1 = 1.0f
   *                       xmm3 = 0.0f
   *                       blend->vt[0x60](1, amount, 1.0, 1.0, 0.0)
   *                       = blend->SetParameter(1, amount, 1.0, 1.0, 0.0)
   *   0x1c3b2c-0x1c3b3b   iter0 = this+0x1b0 ; call HGRenderer::GetInput(renderer, this, 0) @0xf2dd0
   *                       (rdi=r14=renderer, rsi=rbx=this, rdx=0 -> input#0 handle)
   *   0x1c3b40-0x1c3b4b   iter0 = this+0x1b0 ; vt = *iter0
   *                       iter0->vt[0x78](0, GetInput-result)
   *                       = iter0->SetInput(0, GetInput(renderer, this, 0))   (attach outer input)
   *   0x1c3b4e            rax = this+0x1c8 (blend)                              (return blend as the output node)
   *   0x1c3b55-0x1c3b5f   epilogue + ret
   *
   * SEMANTICS: GetOutput is a "prepare frame N" step — it clears the dirty flag, propagates
   * the four user parameters into shader uniforms on the two internal nodes (iter1 gets the
   * amount and reciprocal sharpness; regularize gets the radius; blend gets the amount as
   * mix), attaches the caller-provided input image to iter0, and RETURNS the blend node as
   * the graph output. It does NOT actually render — it wires the graph and hands the caller
   * the sink node.
   */
  GetOutput(renderer: HGRenderer): HGNode {
    // @0x1c3a70 — clear dirty flag.
    this.dirty = 0;

    // @0x1c3a7a..0x1c3a95 — precompute uniforms:
    //   maxExtra          = max(0, paramExtra)                    (xmm0)
    //   sharpnessRecip    = SHARPNESS_NUM (12.75f) / paramSharpness  (xmm1 spilled)
    // Single-precision maxss/divss => Math.fround wrappers.
    const maxExtra: number = Math.fround(Math.max(0.0, this.paramExtra));
    const sharpnessRecip: number = Math.fround(K_SHARPNESS_NUM / this.paramSharpness);

    // @0x1c3a9a..0x1c3aaa —  radiusUniform = paramRadius * 100.0f  (mulss)
    const radiusUniform: number = Math.fround(this.paramRadius * K_RADIUS_UNIFORM_GAIN);

    // @0x1c3aaf..0x1c3ac4 — iter1.SetParameter(0, maxExtra, maxExtra, maxExtra, maxExtra).
    // Every SIMD xmm[0..3] gets the SAME value (movaps xmm1,xmm0; movaps xmm2,xmm0; movaps xmm3,xmm0).
    // rsi=0 is the parameter INDEX passed to the sub-node.
    this.iter1.SetParameter(0, maxExtra, maxExtra, maxExtra, maxExtra);

    // @0x1c3ac7..0x1c3ae4 — iter1.SetParameter(1, sharpnessRecip, sharpnessRecip, sharpnessRecip, sharpnessRecip).
    this.iter1.SetParameter(1, sharpnessRecip, sharpnessRecip, sharpnessRecip, sharpnessRecip);

    // @0x1c3ae7..0x1c3b01 — regularize.SetParameter(0, radiusUniform, ×3).
    this.regularize.SetParameter(0, radiusUniform, radiusUniform, radiusUniform, radiusUniform);

    // @0x1c3b04..0x1c3b29 — blend.SetParameter(1, amount, 1.0f, 1.0f, 0.0f).
    // arg-0 = paramAmount ; arg-1 = xmm1 = 1.0f ; arg-2 = xmm2 = xmm1 = 1.0f ; arg-3 = xmm3 = xorps(xmm3,xmm3)=0.
    this.blend.SetParameter(1, this.paramAmount, K_ONE_F, K_ONE_F, 0.0);

    // @0x1c3b2c..0x1c3b3b — HGRenderer::GetInput(renderer, this, 0) — fetch the caller-supplied
    // source image handle at input slot 0. The return value is an opaque image/edge handle
    // (typed here as `unknown` on HGRenderer.GetInput per its signature).
    const srcHandle = renderer.GetInput(this, 0);

    // @0x1c3b40..0x1c3b4b — iter0.SetInput(0, srcHandle).
    // NOTE: the C++ signature is SetInput(int, HGNode*) but GetInput returns an opaque edge
    // handle (which acts like a node pointer in the render-graph model). We pass it through
    // as-is; the type coercion is preserved from the disassembly.
    this.iter0.SetInput(0, srcHandle as HGNode | null);

    // @0x1c3b4e..0x1c3b5f — return this+0x1c8 (blend) as the output sink.
    return this.blend;
  }

  // HGNode-interface bridge methods so HGDenoise is usable wherever HGNode is expected.
  // These are NOT decoded from separate FCP symbols; they simply forward through the
  // vtable of HGDenoise's HGNode base. FRONTIER: HGNode base methods themselves are
  // un-transcribed — this class overrides SetParameter+GetOutput above; the other
  // HGNode methods (Release/SetInput) are inherited unchanged from HGNode's vtable.

  /** Inherited HGNode::SetInput (@Helium 0x11c5f0 per HGNode vt *0x78) — HGDenoise does NOT
   *  override this slot; forwarding is via HGNode's base implementation. Frontier. */
  SetInput(_idx: number, _src: HGNode | null): void {
    throw new Error("HGDenoise inherits HGNode::SetInput @Helium 0x11c5f0 (HGNode vt[0x78]) not yet transcribed");
  }

  /** Inherited HGObject::Release (@Helium 0x1a0f30 per HGNode vt *0x18) — Frontier. */
  Release(): void {
    throw new Error("HGDenoise inherits HGObject::Release @Helium 0x1a0f30 (HGNode vt[0x18]) not yet transcribed");
  }
}

/** `HGNode::ClearBits()` — symbol `__ZN6HGNode9ClearBitsEv` (@Helium — called
 *  @0x1c3a2f in SetParameter's commit path). Frontier — used only on the commit path. */
function HGNode_ClearBits(_self: HGNode): void {
  throw new Error("HGNode::ClearBits() @Helium not yet transcribed (called from HGDenoise::SetParameter commit path @0x1c3a2f)");
}
