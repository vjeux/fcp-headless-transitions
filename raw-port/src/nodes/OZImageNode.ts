// OZImageNode — Ozone.framework.
//
// Abstract image-producing render-graph node. Extends OZRenderNode. Nearly
// every symbol in the class ledger is a TINY glue function: a default
// constant returner (getResolution, needsDepthBuffer,
// areEffectsAppliedInScreenSpace, getObjectManipulator), a delegation to
// PCPixelFormat (getColorSize / useFloat via OZRenderState +0xd8), a
// virtual-dispatch tail-thunk (getImageBounds, getImageBoundsWithEffects,
// makeImageSource), a `PCUnsupportedOperationException("subclass must
// implement", "OZImageNode.cpp", 49)` throw (getHeliumGraph), or a `ud2`
// pure-virtual trap (~OZImageNode D0 / D1). Two methods build real
// LiImageSource pipelines: makeRender / makeRenderImageSource allocate an
// OZImageNodeRender(this, params), and makeRenderTemporalSource wraps the
// virtual makeRenderImageSource result in an OZLiElementTimeRender.
//
// Provenance: /Applications/Final Cut Pro.app/Contents/Frameworks/
//             Ozone.framework/Versions/A/Ozone (x86_64 slice).
// Disasm saved: raw-port/re/disasm/OZImageNode.*.s.
//
// Vtable snapshot (Ozone; `resolve.py Ozone vtable OZImageNode`, root
// installed ptr 0x840d98 = vtable base 0x840d88 +0x10):
//   *0x00 -> 0x6db220  ~OZImageNode() (D1, ud2 trap)
//   *0x08 -> 0x6db230  ~OZImageNode() (D0, ud2 trap)
//   *0x10 -> 0x83340   OZRenderNode::getBounds
//   *0x18 -> 0x83320   OZRenderNode::getPreviewBounds
//   *0x20 -> 0x83330   OZRenderNode::getBoundary
//   *0x28 -> 0x83360   OZRenderNode::getPixelAspectRatioRN
//   *0x30 -> 0x83370   OZRenderNode::getHashForStateRN
//   *0x38 -> 0x83390   OZRenderNode::getStaticHashRN
//   *0x50 -> 0xbfc60   OZImageNode::getImageBounds
//   *0x58 -> 0xbfc70   OZImageNode::getImageBoundsWithEffects
//   *0x60 -> 0x1a3d10  OZImageNode::getDimensions
//   *0x68 -> 0xbfc80   OZImageNode::getObjectManipulator
//   *0x70 -> 0x8ce00   OZImageNode::getResolution
//   *0x78 -> 0x8ce20   OZImageNode::getColorSize
//   *0x80 -> 0x8ce30   OZImageNode::useFloat
//   *0x88 -> 0x8ce40   OZImageNode::needsDepthBuffer
//   *0x90 -> 0xa9450   OZImageNode::areEffectsAppliedInScreenSpace
//   *0x98 -> 0x1a3d90  OZImageNode::makeRender
//   *0xa0 -> 0x1a3e70  OZImageNode::makeRenderTemporalSource
//   *0xa8 -> 0x1a3e00  OZImageNode::makeRenderImageSource
//   *0xb0 -> 0x1a3d70  OZImageNode::makeImageSource
//   *0xb8 -> 0x1a4020  OZImageNode::buildRenderGraph
//   *0xc0 -> 0x1a3be0  OZImageNode::getHeliumGraph
//
// Ctor (C2 @0x1a3b90) hand-decode:
//   pushq %rbp; movq %rsp,%rbp; pushq %rbx; pushq %rax
//   movq  %rdi,%rbx
//   leaq  __ZTV12OZRenderNode(%rip), %rax; addq $0x10,%rax; movq %rax,(%rdi) ; base vtable
//   addq  $0x8,%rdi                                                          ; this+0x8
//   callq __ZN9PCHash128C1Ev                                                  ; zero PCHash128 @this+8
//   leaq  <OZImageNode-vtbl-plus-0x10>(%rip), %rax; movq %rax,(%rbx)          ; override to OZImageNode vtable
//   addq $0x8,%rsp; popq %rbx; popq %rbp; retq
//
// D2 (@0x1a3bd0) is `pushq %rbp; movq %rsp,%rbp; popq %rbp; retq` — empty.
// D1 (@0x6db220) and D0 (@0x6db230) both `ud2` — pure-virtual traps that
// only fire if a raw OZImageNode (never a concrete subclass) is destroyed
// via a virtual dispatch. TS models both as throws.
//
// Fields read/written by the ported methods:
//   this+0x00  vtable ptr (implicit in TS)
//   this+0x08  PCHash128 slot (zero-initialised by ctor, written by
//              OZRenderNode::getStaticHashRN — inherited).
// No other data-field of OZImageNode is dereferenced by any of the 19
// ported symbols at this layer; concrete subclasses own their own state.
//
// OZRenderState layout used here (all read-only):
//   +0xd8  (u32)  PCPixelFormat::ChannelOrder — read by getColorSize / useFloat.
//   (Recovered from the two `movl 0xd8(%rsi), %edi; jmp <PCPixelFormat helper>`
//    thunks at 0x8ce20 and 0x8ce30. Consistent across both callers.)
//
// Frontier symbols reached from this class (each stub cites its @0xADDR):
//   @Ozone 0x1a3dba  OZImageNodeRender::OZImageNodeRender(OZImageNode*, OZRenderParams const&) (C1)
//   @Ozone 0x1a3ef0  LiImageSource::LiImageSource()          (base ctor of OZLiElementTimeRender)
//   @Ozone 0x1a3f1e  OZRenderGraphState::OZRenderGraphState(OZRenderGraphState const&) (copy-ctor)
//   @Ozone 0x1a3fb9  OZRenderGraphState::~OZRenderGraphState()
//   @Ozone 0x1a4057  LiGeode::LiGeode(LiImageSource*)          (Helium scene-graph geode)
//   @Ozone 0x1a40bc  LiGraphBuilder::add2d(PCPtr<LiSceneObject> const&)
//   @ProCore ?       PCPixelFormat::getBitsPerPixel(ChannelOrder)  — via stub @Ozone 0x6ddab2
//   @ProCore ?       PCPixelFormat::isFloat(ChannelOrder)          — via stub @Ozone 0x6ddac4
//   @Ozone 0x?       PCString::PCString(char const*)               — via stub @Ozone 0x6df09c
//   @Ozone 0x?       PCString::PCString(PCString const&)           — via stub @Ozone 0x6df0ba
//   @Ozone 0x?       PCException / PCUnsupportedOperationException vtables + __cxa_throw
//   @Ozone 0x?       PCSharedCount ctor/copy/assign/dtor            — via stubs @0x6ddadc/e2/ee/f4
//
// Callee vtable slots dispatched through OZRenderParams (rsi in the C2-style
// members that take OZRenderParams by ref):
//   *0x98 (makeRender), *0xa8 (makeRenderImageSource) — resolved on the
//   dynamic type of `this` (they're VIRTUAL calls, not on OZRenderParams).
//   The disasm reads `(this)` = rsi in the sret ABI (rdi is the sret slot).
//
// -- ABI note --------------------------------------------------------------
// makeImageSource / makeRender / makeRenderImageSource / makeRenderTemporalSource /
// buildRenderGraph all use the Itanium sret convention: the first hidden
// pointer arg is the caller-provided return slot for the returned
// PCPtr<LiImageSource> (or PCPtr<LiSceneObject>). In the disasm rdi=sret,
// rsi=this, rdx/rcx/r8 = the real args. The TS ports do NOT model the
// vtable-offset dance that the assembly does when synthesising the returned
// PCPtr (`movq -0x18(%rax), %rcx; addq %r14,%rcx; movq %rcx,(%rbx)` is the
// Itanium multiple-inheritance base-adjust that lets the caller receive a
// pointer to the LiImageSource subobject even though `new` returned the
// OZImageNodeRender root); TS has no MI, so we express the port as
// "return the newly-constructed OZImageNodeRender" and let the callee-side
// LiImageSource interface be handled by structural typing.

import { PCPixelFormat, ChannelOrder } from "../infra/PCPixelFormat";

// ---- Opaque frontier types (real classes not yet landed at this layer). ----
export type OZRenderState = { channelOrder: ChannelOrder } & Record<string, unknown>;
export type OZRenderParams = unknown;
export type OZRenderGraphState = unknown;
export type OZObjectManipulator = unknown;
export type LiGraphBuilder = unknown;
export type HGRenderer = unknown;
export type FxColorDescription = unknown;
export type PCMatrix44Double = unknown; // real: PCMatrix44Tmpl<double>*

/** PCRect<double> — layout matches PCRect used by OZRenderNode.ts. */
export interface PCRectDouble {
  x: number;
  y: number;
  width: number;
  height: number;
}

/** Opaque handle to an LiImageSource — real base class not yet landed. */
export interface LiImageSourceRef {
  readonly kind: "LiImageSource";
}

// ---- Frontier throw-stubs (each cites its callsite). --------------------

/** @Ozone 0x1a3dba  __ZN17OZImageNodeRenderC1EP11OZImageNodeRK14OZRenderParams */
function OZImageNodeRender_ctor(
  _self: OZImageNode,
  _params: OZRenderParams,
): LiImageSourceRef {
  throw new Error(
    "OZImageNodeRender::OZImageNodeRender(OZImageNode*, OZRenderParams const&) @Ozone 0x1a3dba not yet transcribed",
  );
}

/** @Ozone 0x1a3ef0 (via stub __ZN13LiImageSourceC2Ev). Placeholder for the
 *  0x168-byte OZLiElementTimeRender wrapper constructed by makeRenderTemporalSource. */
function OZLiElementTimeRender_construct(
  _inner: LiImageSourceRef,
  _self: OZImageNode,
  _state: OZRenderGraphState,
): LiImageSourceRef {
  throw new Error(
    "OZLiElementTimeRender::OZLiElementTimeRender(...) @Ozone 0x1a3eae not yet transcribed",
  );
}

/** @Ozone 0x1a4057  __ZN7LiGeodeC1EP13LiImageSource — Helium scene-graph geode ctor. */
function LiGeode_ctor(_src: LiImageSourceRef): unknown {
  throw new Error("LiGeode::LiGeode(LiImageSource*) @Ozone 0x1a4057 not yet transcribed");
}

/** @Ozone 0x1a40bc  __ZN14LiGraphBuilder5add2dERK5PCPtrI13LiSceneObjectE */
function LiGraphBuilder_add2d(_gb: LiGraphBuilder, _geode: unknown): void {
  throw new Error(
    "LiGraphBuilder::add2d(PCPtr<LiSceneObject> const&) @Ozone 0x1a40bc not yet transcribed",
  );
}

// ---- The class itself. ---------------------------------------------------

/**
 * OZImageNode — abstract image-producing render-graph node. Extends
 * OZRenderNode. Every concrete image producer (OZImageElement, mask
 * comps, generators, effects) derives from this and overrides at least
 * getHeliumGraph (which throws here) and typically makeRenderImageSource.
 */
export abstract class OZImageNode {
  /** PCHash128 slot at this+0x08 — zero-initialised by the ctor.
   *  Modelled as four u32 words so the getStaticHashRN path (inherited from
   *  OZRenderNode) can read the same all-zero constant. */
  private readonly hash: { a: number; b: number; c: number; d: number };

  /**
   * OZImageNode::OZImageNode() — @Ozone 0x1a3b90 (C2).
   *
   * Disasm (12 insns):
   *   pushq %rbp; movq %rsp,%rbp; pushq %rbx; pushq %rax
   *   movq  %rdi,%rbx
   *   leaq  __ZTV12OZRenderNode(%rip),%rax; addq $0x10,%rax
   *   movq  %rax,(%rdi)                              ; base OZRenderNode vtable @+0x10
   *   addq  $0x8,%rdi                                ; &this->hash
   *   callq __ZN9PCHash128C1Ev                        ; PCHash128 default ctor @ProCore 0x1bf36
   *   leaq  <OZImageNode-vtbl+0x10>(%rip),%rax
   *   movq  %rax,(%rbx)                              ; overwrite to OZImageNode vtable
   *   addq $0x8,%rsp; popq %rbx; popq %rbp; retq
   *
   * PCHash128::PCHash128() @ProCore 0x1bf36 zeros 16 bytes at *this+0x8
   * (see OZRenderNode.ts for the referenced xorps/movups body).
   */
  protected constructor() {
    // The transient assignment of OZRenderNode's vtable and its immediate
    // replacement by OZImageNode's own vtable is the standard Itanium
    // base-then-derived vtable installation — invisible in TS since
    // virtual dispatch is resolved by class identity.
    // PCHash128::PCHash128() @ProCore 0x1bf36 zeros 16 bytes.
    this.hash = { a: 0, b: 0, c: 0, d: 0 };
  }

  /**
   * OZImageNode::~OZImageNode() — D2 @0x1a3bd0.
   *
   * Disasm (4 insns):
   *   pushq %rbp; movq %rsp,%rbp; popq %rbp; retq
   *
   * Empty. All member destruction is inherited (OZRenderNode's own D2
   * takes over from here in the linker's C1/C2/D0/D1/D2 group).
   */
  destroyBase(): void {
    // no-op — matches the compiler-emitted trivial destructor body.
  }

  /**
   * OZImageNode::~OZImageNode() — D1 @0x6db220.
   *
   * Disasm (4 insns): `pushq %rbp; movq %rsp,%rbp; ud2; nop`.
   *
   * `ud2` = intentional illegal instruction. This D1 entry is populated
   * only for the vtable slot; direct destruction of a raw OZImageNode
   * (never a concrete subclass) is a program error. TS mirrors with a
   * throw at the same address. */
  destroy_D1(): never {
    throw new Error(
      "OZImageNode::~OZImageNode() D1 @0x6db220 is pure-virtual (ud2 trap) — a concrete subclass must override",
    );
  }

  /**
   * OZImageNode::~OZImageNode() — D0 @0x6db230 (deleting destructor).
   *
   * Disasm (4 insns): `pushq %rbp; movq %rsp,%rbp; ud2; nop`.
   *
   * Same shape as D1 — an intentional trap ensuring `delete p` on a raw
   * OZImageNode* never runs. Concrete derived classes emit their own D0.
   */
  destroy_D0(): never {
    throw new Error(
      "OZImageNode::~OZImageNode() D0 @0x6db230 is pure-virtual (ud2 trap) — a concrete subclass must override",
    );
  }

  /**
   * OZImageNode::getResolution(double& outW, double& outH) const — @0x8ce00.
   *
   * Disasm (7 insns):
   *   pushq %rbp; movq %rsp,%rbp
   *   movabsq $0x3ff0000000000000, %rax   ; = 1.0 (IEEE-754 double)
   *   movq   %rax, (%rdx)                 ; *outH = 1.0
   *   movq   %rax, (%rsi)                 ; *outW = 1.0
   *   popq %rbp; retq
   *
   * The 0x3ff0000000000000 constant is 1.0 as an IEEE-754 double.
   */
  getResolution(): { w: number; h: number } {
    // @0x8ce04  movabsq $0x3ff0000000000000, %rax  =>  double 1.0
    return { w: 1.0, h: 1.0 };
  }

  /**
   * OZImageNode::getColorSize(OZRenderState const&) — @0x8ce20.
   *
   * Disasm (5 insns):
   *   pushq %rbp; movq %rsp,%rbp
   *   movl  0xd8(%rsi), %edi                             ; state.channelOrder
   *   popq %rbp
   *   jmp   __ZN13PCPixelFormat15getBitsPerPixelENS_12ChannelOrderE
   *
   * Tail-call: returns PCPixelFormat::getBitsPerPixel(state->channelOrder).
   */
  getColorSize(state: OZRenderState): number {
    // Field @OZRenderState +0xd8 = PCPixelFormat::ChannelOrder (u32).
    // Tail-jumps to PCPixelFormat::getBitsPerPixel @ProCore 0x35388.
    return PCPixelFormat.getBitsPerPixel(state.channelOrder);
  }

  /**
   * OZImageNode::useFloat(OZRenderState const&) — @0x8ce30.
   *
   * Disasm (5 insns): identical shape to getColorSize but tail-jumps to
   *   __ZN13PCPixelFormat7isFloatENS_12ChannelOrderE  (stub @Ozone 0x6ddac4)
   * i.e. PCPixelFormat::isFloat(state->channelOrder).
   */
  useFloat(state: OZRenderState): boolean {
    // Field @OZRenderState +0xd8 = PCPixelFormat::ChannelOrder (u32).
    // Tail-jumps to PCPixelFormat::isFloat @ProCore 0x35458.
    return PCPixelFormat.isFloat(state.channelOrder);
  }

  /**
   * OZImageNode::needsDepthBuffer(OZRenderState const&) — @0x8ce40.
   *
   * Disasm (5 insns):
   *   pushq %rbp; movq %rsp,%rbp
   *   xorl  %eax, %eax          ; return 0
   *   popq %rbp; retq
   */
  needsDepthBuffer(_state: OZRenderState): boolean {
    // @0x8ce44  xorl %eax,%eax  =>  false
    return false;
  }

  /**
   * OZImageNode::areEffectsAppliedInScreenSpace() — @0xa9450.
   *
   * Disasm (5 insns):
   *   pushq %rbp; movq %rsp,%rbp
   *   xorl  %eax, %eax
   *   popq %rbp; retq
   */
  areEffectsAppliedInScreenSpace(): boolean {
    // @0xa9454  xorl %eax,%eax  =>  false
    return false;
  }

  /**
   * OZImageNode::getImageBounds(PCRect<double>* out, OZRenderState const&) — @0xbfc60.
   *
   * Disasm (6 insns):
   *   pushq %rbp; movq %rsp,%rbp
   *   movq  (%rdi), %rax        ; load vtable
   *   movq  0x10(%rax), %rax    ; vtable +0x10 = OZRenderNode::getBounds
   *   popq %rbp; jmpq *%rax     ; tail-jump virtual
   *
   * Tail-dispatches to the VIRTUAL getBounds; a derived override wins.
   * Vtable slot +0x10 is confirmed as `OZRenderNode::getBounds` (0x83340)
   * in OZImageNode's own vtable table.
   */
  getImageBounds(out: PCRectDouble, state: OZRenderState): void {
    // Virtual tail-dispatch: `this->getBounds(out, state)`.
    this.getBounds(out, state);
  }

  /**
   * OZImageNode::getImageBoundsWithEffects(PCRect<double>* out, OZRenderState const&) — @0xbfc70.
   *
   * Disasm (6 insns): identical to getImageBounds but reads vtable slot +0x50:
   *   movq (%rdi),%rax; movq 0x50(%rax),%rax; jmpq *%rax
   *
   * Vtable +0x50 in OZImageNode's own table is `OZImageNode::getImageBounds`
   * (0xbfc60). So `getImageBoundsWithEffects` tail-dispatches VIRTUALLY to
   * `getImageBounds` — a derived override of getImageBounds wins here too.
   * i.e. "with effects" is only different in the vtable slot number; the
   * default body is the same virtual delegation.
   */
  getImageBoundsWithEffects(out: PCRectDouble, state: OZRenderState): void {
    // Virtual tail-dispatch: `this->getImageBounds(out, state)`.
    this.getImageBounds(out, state);
  }

  /**
   * OZImageNode::getObjectManipulator() — @0xbfc80.
   *
   * Disasm (5 insns):
   *   pushq %rbp; movq %rsp,%rbp
   *   xorl  %eax, %eax                          ; return nullptr
   *   popq %rbp; retq
   */
  getObjectManipulator(): OZObjectManipulator | null {
    // @0xbfc84  xorl %eax,%eax  =>  nullptr
    return null;
  }

  /**
   * OZImageNode::getDimensions(float* outW, float* outH, OZRenderState const&) — @0x1a3d10.
   *
   * Disasm (18 insns):
   *   pushq %rbp; movq %rsp,%rbp; pushq %r14; pushq %rbx; subq $0x20,%rsp
   *   movq  %rdx,%rbx           ; outH (float*)
   *   movq  %rsi,%r14           ; outW (float*)
   *   xorps %xmm0,%xmm0                            ; scratch = 0
   *   movaps %xmm0, -0x30(%rbp)                    ; zero -0x30..-0x20 (out.x, out.y)
   *   movaps 0x561691(%rip),%xmm0                  ; load 16-byte const at .rodata (= {-1.0,-1.0})
   *   movaps %xmm0, -0x20(%rbp)                    ; store to (out.width, out.height)
   *   movq   (%rdi),%rax                           ; load vtable
   *   leaq   -0x30(%rbp),%rsi                      ; &tmpRect
   *   movq   %rcx,%rdx                             ; state
   *   callq  *0x10(%rax)                           ; virtual getBounds(&tmpRect, state)
   *   movsd  -0x20(%rbp),%xmm0                     ; tmpRect.width (double)
   *   cvtsd2ss %xmm0,%xmm0                         ; -> float32
   *   movss  %xmm0,(%r14)                          ; *outW = (float)width
   *   movsd  -0x18(%rbp),%xmm0                     ; tmpRect.height (double)
   *   cvtsd2ss %xmm0,%xmm0
   *   movss  %xmm0,(%rbx)                          ; *outH = (float)height
   *   ...; retq
   *
   * The 0x561691(%rip)+0x1a3d2f = 0x7053C0 — same {-1.0, -1.0} pair used
   * by OZRenderNode::getBounds as its default (width, height).
   *
   * i.e. getDimensions == `getBounds(&r, state); *outW=(float)r.width; *outH=(float)r.height;`
   * with r's x,y zero-init and w,h pre-seeded to -1.0 before the virtual
   * call (so that a getBounds impl that only writes some slots leaves the
   * others at the sentinel).
   */
  getDimensions(state: OZRenderState): { w: number; h: number } {
    // Stack rectangle initialised to {x:0, y:0, w:-1.0, h:-1.0}
    // (matches @0x1a3d21 xorps + @0x1a3d28 movaps of the same 16-byte
    // const at 0x7053C0 that OZRenderNode::getBounds writes).
    const r: PCRectDouble = { x: 0, y: 0, width: -1.0, height: -1.0 };
    // Virtual dispatch via vtable +0x10 == getBounds.
    this.getBounds(r, state);
    // cvtsd2ss: double -> float32 conversion at @0x1a3d45 / @0x1a3d53.
    return { w: Math.fround(r.width), h: Math.fround(r.height) };
  }

  /**
   * OZImageNode::makeImageSource(OZRenderParams&, OZRenderGraphState const&, bool) — @0x1a3d70.
   *
   * Disasm (11 insns) — Itanium sret ABI (rdi=return-slot, rsi=this,
   * rdx=params, rcx=state, r8=bool):
   *   pushq %rbp; movq %rsp,%rbp; pushq %rbx; pushq %rax
   *   movq  %rdi,%rbx           ; save sret slot
   *   movq  (%rsi),%rax         ; load this-vtable
   *   callq *0x98(%rax)         ; call this->makeRender (vtable +0x98)
   *   movq  %rbx,%rax           ; return the sret slot
   *   ...; retq
   *
   * Tail-dispatches virtually to `this->makeRender(params, state, bool)`;
   * the sret slot is threaded through unchanged. Any subclass override of
   * makeRender wins.
   */
  makeImageSource(
    params: OZRenderParams,
    state: OZRenderGraphState,
    b: boolean,
  ): LiImageSourceRef {
    // Virtual tail-dispatch: `this->makeRender(params, state, b)`.
    return this.makeRender(params, state, b);
  }

  /**
   * OZImageNode::makeRender(OZRenderParams&, OZRenderGraphState const&, bool) — @0x1a3d90.
   *
   * Disasm (25 insns + unwind tail):
   *   pushq %rbp; movq %rsp,%rbp; pushq %r15..rbx
   *   movq  %rdx,%r15           ; state
   *   movq  %rsi,%r12           ; params
   *   movq  %rdi,%rbx           ; sret slot
   *   movl  $0x5f0,%edi         ; sizeof(OZImageNodeRender) = 0x5f0
   *   callq __Znwm              ; operator new(0x5f0) -> r14
   *   movq  %r14,%rdi; movq %r12,%rsi; movq %r15,%rdx
   *   callq __ZN17OZImageNodeRenderC1EP11OZImageNodeRK14OZRenderParams
   *                             ; OZImageNodeRender::OZImageNodeRender(this, params)
   *                             ; NOTE: the C1 ignores the bool arg — makeRender's
   *                             ;       third param is dropped on the floor here
   *                             ;       (it's used by makeRenderTemporalSource).
   *   movq (%r14),%rax; movq -0x18(%rax),%rcx; addq %r14,%rcx; movq %rcx,(%rbx)
   *                             ; Itanium MI base-adjust: return-slot -> LiImageSource
   *                             ;   subobject of the newly-allocated OZImageNodeRender.
   *   movq -0x20(%rax),%rsi; addq %r14,%rsi
   *   movq  %rbx,%rdi; addq $0x8,%rdi
   *   callq __ZN13PCSharedCountC1EP13PCShared_base  ; init PCSharedCount(&renderer.shared_base)
   *   ...; retq
   *
   * Semantically: allocate an OZImageNodeRender, forward this + params to
   * its constructor, and wrap the resulting LiImageSource subobject in a
   * PCPtr<LiImageSource>. The bool `b` is passed by the caller but never
   * observed (verified: none of `rcx`, `r8`, `r13` — the ABI slot for the
   * bool — appear in the body).
   */
  makeRender(
    params: OZRenderParams,
    _state: OZRenderGraphState,
    _b: boolean,
  ): LiImageSourceRef {
    // sizeof(OZImageNodeRender) is 0x5f0 (@0x1a3da4  movl $0x5f0, %edi).
    // The `new`/ctor pair @0x1a3da9 / @0x1a3dba constructs an
    // OZImageNodeRender in place; the PCPtr/PCSharedCount thunks in the
    // tail synthesise a shared pointer to its LiImageSource subobject.
    // In TS we return the constructed handle directly; the frontier stub
    // throws until OZImageNodeRender is landed.
    return OZImageNodeRender_ctor(this, params);
  }

  /**
   * OZImageNode::makeRenderImageSource(OZRenderParams&, OZRenderGraphState const&, bool) — @0x1a3e00.
   *
   * Disasm (25 insns): byte-for-byte identical to makeRender @0x1a3d90 —
   * same 0x5f0 allocation, same OZImageNodeRender C1 call, same MI
   * base-adjust and PCSharedCount(shared_base) initialisation. The two
   * entry points differ only in vtable slot (*0x98 vs *0xa8), giving
   * subclasses two independent overrides while sharing this default body.
   */
  makeRenderImageSource(
    params: OZRenderParams,
    _state: OZRenderGraphState,
    _b: boolean,
  ): LiImageSourceRef {
    // Same body as makeRender; only the caller's vtable slot number differs.
    // sizeof(OZImageNodeRender) = 0x5f0 (@0x1a3e14).
    return OZImageNodeRender_ctor(this, params);
  }

  /**
   * OZImageNode::makeRenderTemporalSource(OZRenderParams&, OZRenderGraphState const&, bool) — @0x1a3e70.
   *
   * Disasm (~90 insns + unwind). Sret ABI: rdi=return-slot (rbx), rsi=this,
   * rdx=params, rcx=state, r8=bool.
   *
   *   movq  (%rsi),%rax                 ; this->vtable
   *   leaq  -0x48(%rbp),%rdi            ; local PCPtr<LiImageSource> slot
   *   callq *0xa8(%rax)                 ; this->makeRenderImageSource(params, state, b)
   *   movq  -0x48(%rbp),%r15            ; PCPtr.ptr
   *   testq %r15,%r15; je <fail>        ; if (inner == nullptr) return an empty PCPtr
   *
   *   movl  $0x168,%edi                 ; sizeof(OZLiElementTimeRender) = 0x168
   *   callq __Znwm                       ; operator new
   *   ...   PCSharedCount(shared_ptr copy)                     @0x1a3ebd
   *   store PCShared_base vtable @newObj+0x158                 @0x1a3ec2..0x1a3ecd
   *   zero &newObj+0x160                                       @0x1a3ed4
   *   leaq  __ZTT21OZLiElementTimeRender(%rip),%r15; addq $8,%r15
   *   callq __ZN13LiImageSourceC2Ev(newObj, VTT+8)             @0x1a3ef0
   *   store OZLiElementTimeRender vtable primary @newObj+0x00  @0x1a3f00
   *   store OZLiElementTimeRender vtable secondary @newObj+0x158
   *   store this @newObj+0x10                                  @0x1a3f10
   *   OZRenderGraphState copy-ctor into newObj+0x18            @0x1a3f1e
   *   store inner-ptr @newObj+0x148                            @0x1a3f27
   *   PCSharedCount copy-ctor into newObj+0x150                @0x1a3f3c
   *   zero newObj+0x140                                        @0x1a3f41
   *   store newObj into sret; PCSharedCount(shared_base @0x158+adjust); ret
   *
   *   fail path: sret := {nullptr, empty PCSharedCount}       @0x1a3f6c
   *
   * Recovered OZLiElementTimeRender layout (0x168 bytes):
   *   +0x000  primary vtable ptr
   *   +0x010  OZImageNode*         (self)
   *   +0x018  OZRenderGraphState   (copy-constructed)
   *   +0x140  (u64 zero — unused / weak-count init)
   *   +0x148  LiImageSource* inner (from makeRenderImageSource result)
   *   +0x150  PCSharedCount (copy of inner's shared count)
   *   +0x158  PCShared_base subobject (own vtable ptr + weak_count = 0)
   */
  makeRenderTemporalSource(
    params: OZRenderParams,
    state: OZRenderGraphState,
    b: boolean,
  ): LiImageSourceRef | null {
    // Virtual dispatch @0x1a3e91: this->makeRenderImageSource(params, state, b).
    // A subclass override of makeRenderImageSource wins.
    const inner = this.makeRenderImageSource(params, state, b);
    // @0x1a3e9b  testq %r15,%r15; je 0x1a3f6c => nullptr fast-return.
    // The base-class body cannot produce nullptr from the throwing stub
    // (it throws), but concrete subclasses that override
    // makeRenderImageSource legitimately can — mirror the null branch.
    if (inner === null || inner === undefined) return null;
    // Allocate + construct OZLiElementTimeRender wrapping `inner`.
    // sizeof = 0x168 (@0x1a3ea4  movl $0x168, %edi).
    return OZLiElementTimeRender_construct(inner, this, state);
  }

  /**
   * OZImageNode::buildRenderGraph(OZRenderParams&, LiGraphBuilder*, OZRenderGraphState const&) — @0x1a4020.
   *
   * Disasm (~46 insns + unwind):
   *   pushq %rbp; movq %rsp,%rbp; pushq %r15..rbx; subq $0x38,%rsp
   *   movq  %rdx,%r14              ; LiGraphBuilder*
   *   movq  %rsi,%rdx              ; params
   *   movq  %rdi,%rsi              ; this
   *   movq  (%rdi),%rax; leaq -0x40(%rbp),%rdi; xorl %r8d,%r8d
   *   callq *0x98(%rax)            ; this->makeRender(params, state, b=false)
   *
   *   movl  $0x2f0,%edi
   *   callq __Znwm                  ; operator new(0x2f0)     -> LiGeode
   *   movq  -0x40(%rbp),%rsi        ; the PCPtr from makeRender
   *   movq  %rax,%rdi
   *   callq __ZN7LiGeodeC1EP13LiImageSource  ; LiGeode::LiGeode(LiImageSource*)
   *
   *   (build a PCPtr<LiSceneObject> around the LiGeode via the shared
   *    -0x18(vtable)-offset MI base-adjust; PCSharedCount ctor from the
   *    LiGeode's PCShared_base subobject)
   *   callq __ZN14LiGraphBuilder5add2dERK5PCPtrI13LiSceneObjectE
   *                                 ; gb.add2d(scenePtr)
   *
   *   (three PCSharedCount D1s: local scene-ptr, tmp shared-count copy,
   *    the outer PCPtr from makeRender)
   *   retq
   *
   * i.e. `buildRenderGraph(params, gb, state)` = allocate a 0x2f0-byte
   * LiGeode wrapping a fresh makeRender() output and add it as a 2D scene
   * object to the builder. All the tail arithmetic is Itanium ABI
   * bookkeeping (vtable-offset adjust, shared-count init/tear-down) that
   * TS structurally absorbs.
   *
   * Vtable slot +0x98 is confirmed as this class' makeRender (0x1a3d90).
   * The bool arg is hard-wired to false at the callsite (`xorl %r8d,%r8d`).
   */
  buildRenderGraph(
    params: OZRenderParams,
    gb: LiGraphBuilder,
    state: OZRenderGraphState,
  ): void {
    // Virtual dispatch @0x1a4040: this->makeRender(params, state, false).
    const src = this.makeRender(params, state, false);
    // Allocate LiGeode(src) — sizeof(LiGeode) = 0x2f0 (@0x1a4046 movl $0x2f0).
    const geode = LiGeode_ctor(src);
    // gb->add2d(PCPtr<LiSceneObject>(geode)) — the PCPtr construction is
    // pure ABI plumbing in the asm; structural typing handles it here.
    LiGraphBuilder_add2d(gb, geode);
    // Trailing three PCSharedCount D1s (@0x1a40c1, @0x1a40cc, @0x1a40d1)
    // are RAII destruction of the local shared pointers — no-op in TS.
  }

  /**
   * OZImageNode::getHeliumGraph(OZRenderParams const&, HGRenderer*,
   *                             FxColorDescription&, PCMatrix44Tmpl<double>*) — @0x1a3be0.
   *
   * Disasm (~50 insns of exception machinery). Body:
   *   __cxa_allocate_exception(0x40)             @0x1a3bed
   *   PCString::PCString("subclass must implement")            @0x1a3bfa
   *   PCString::PCString("/Library/Caches/com.apple.xbs/Sources/MotionSharedCode/"
   *                      "Motion-45000.0.157/Ozone/CompositorObject/OZImageNode.cpp")   @0x1a3c0a
   *   Initialise PCException(exceptionObj, msg, file, line=0x31)
   *     vtable slot: __ZTV11PCException+0x10                    @0x1a3c1a
   *     line-number written to +0x20:  movl $0x31, 0x20(%rbx)   @0x1a3c4d ( = decimal 49 )
   *   Overwrite exception vtable to PCUnsupportedOperationException+0x10 @0x1a3c63
   *   __cxa_throw(exceptionObj, &typeinfo, ~PCUnsupportedOperationException) @0x1a3c82
   *   ud2                                                       @0x1a3c87
   *
   * The remainder of the disasm is the cleanup landing pad for exception-
   * safety: PCCFRef<CFArray> dtor, std::exception D2, PCString D1s,
   * __cxa_free_exception, __Unwind_Resume. This is entirely generated
   * exception plumbing — the semantics are "throw
   * PCUnsupportedOperationException(msg, file, line)".
   */
  getHeliumGraph(
    _params: OZRenderParams,
    _renderer: HGRenderer | null,
    _color: FxColorDescription,
    _tx: PCMatrix44Double | null,
  ): unknown {
    // Message + location literals recovered from .cstring pool at the
    // rip-relative loads at @0x1a3bfa and @0x1a3c0a. Line 0x31 = 49
    // (decimal) written by @0x1a3c4d.
    throw new Error(
      "PCUnsupportedOperationException: subclass must implement " +
        "(/Library/Caches/com.apple.xbs/Sources/MotionSharedCode/" +
        "Motion-45000.0.157/Ozone/CompositorObject/OZImageNode.cpp:49) " +
        "@Ozone 0x1a3be0",
    );
  }

  // -- Virtual hooks inherited from OZRenderNode --------------------------
  //
  // OZImageNode's ctor first installs OZRenderNode's vtable (@0x1a3b9e)
  // before overwriting with its own, so all of OZRenderNode's vtable slots
  // are inherited unchanged unless the OZImageNode vtable table overrides
  // them. In our TS model the base methods live on OZRenderNode; here we
  // declare only the abstract getBounds referenced by getImageBounds /
  // getDimensions above. Concrete subclasses override it; the base default
  // is `out.width = -1.0; out.height = -1.0;` as decoded in OZRenderNode.ts
  // @0x83340.

  /** Abstract virtual — vtable slot +0x10 in OZImageNode's own vtable.
   *  Base impl (OZRenderNode::getBounds @0x83340) writes {width:-1,
   *  height:-1}; the abstract-ness in TS forces subclasses to declare it
   *  explicitly and mirrors the derived-vtable install in the ctor. */
  abstract getBounds(out: PCRectDouble, state: OZRenderState): void;
}
