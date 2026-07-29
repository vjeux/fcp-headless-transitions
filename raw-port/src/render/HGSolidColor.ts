/**
 * HGSolidColor — Helium framework
 *
 * A Helium "render-node facade" that owns an HgcSolidColor (Helium graphics
 * component / GPU-side render step) as a sub-object at struct offset +0x198.
 * The public HGSolidColor is-a HGNode (base at offset 0) and forwards its
 * parameter-mutation and output-writing to the owned HgcSolidColor via that
 * sub-object's C++ vtable.
 *
 * Struct layout recovered from ctors + dtors + SetParameter + GetOutput:
 *   struct HGSolidColor : HGNode {   // +0x00 = HGSolidColor vtable ptr (installed
 *                                    //          over HGNode's after HGNode::HGNode())
 *     ... HGNode body ...
 *     HgcSolidColor* sub;            // +0x198 — heap alloc, 0x1b0 bytes, owned
 *   };
 *   // sub layout (only fields touched by these methods):
 *   struct HgcSolidColor {
 *     void* vtable;                  // +0x00 — installed after HgcSolidColor::HgcSolidColor()
 *     ... 0x1a0 bytes ...
 *     HGRect rect;                   // +0x1a0 (16 B, i.e. two 8-B halves at +0x1a0/+0x1a8)
 *     ...
 *   };
 *
 * Exported symbols (all in Helium.framework, x86_64 slice):
 *   @0x000000000011b360  HGSolidColor::HGSolidColor()          [C2 base]
 *   @0x000000000011b400  HGSolidColor::HGSolidColor()          [C1 complete]
 *   @0x000000000011b4a0  HGSolidColor::HGSolidColor(HGRect)    [C2 base]
 *   @0x000000000011b540  HGSolidColor::HGSolidColor(HGRect)    [C1 complete]
 *   @0x000000000011b5e0  HGSolidColor::~HGSolidColor()         [D2 base]
 *   @0x000000000011b620  HGSolidColor::~HGSolidColor()         [D1 complete]
 *   @0x000000000011b660  HGSolidColor::~HGSolidColor()         [D0 deleting]
 *   @0x000000000011b6a0  HGSolidColor::SetParameter(int, float, float, float, float)
 *   @0x000000000011b6c0  HGSolidColor::GetOutput(HGRenderer*)
 *
 * Every non-trivial callee (HGNode::HGNode/~HGNode, HgcSolidColor::HgcSolidColor,
 * HGObject::operator new/delete, and the two vtable-dispatched slots on the sub
 * object at +0x18 dtor / +0x60 SetParameter-like / +0x78 write-to-target) is a
 * frontier callee — cited by @0xADDR but not yet transcribed here.  Faithfully
 * modelled as THROWing stubs per DECODE-DON'T-FIT.
 */

import { HGRect, HGRectInfinite } from './HGRect';
import { HGNode } from './HGNode';

/** Forward decl — HGRenderer instance is opaque at this layer; GetInput is called
 *  through it @Helium 0x000f2dd0. */
export interface HGRendererLike {}

/**
 * Frontier callee — HgcSolidColor is the GPU-side render component owned by
 * HGSolidColor at struct offset +0x198 (0x1b0 bytes on the heap).  Only its
 * dispatch surface is used here (dtor via vtable[+0x18], SetParameter forward
 * via vtable[+0x60], write-to-target forward via vtable[+0x78]); the class
 * body is not yet ported.
 */
export interface HgcSolidColorLike {
  /**
   * Constant-color GPU step's own vtable dispatch surface.  Only slots 3/12/15
   * (byte offsets 0x18/0x60/0x78) are called from HGSolidColor.
   */
  vtable: {
    /** +0x18 — deleting destructor slot (Itanium ABI D0). Called by HGSolidColor::~HGSolidColor. */
    destroyDeleting(self: HgcSolidColorLike): void;
    /** +0x60 — forwarded target of HGSolidColor::SetParameter(int, f, f, f, f). */
    setParameter(
      self: HgcSolidColorLike,
      idx: number,
      a: number,
      b: number,
      c: number,
      d: number,
    ): void;
    /** +0x78 — forwarded target of HGSolidColor::GetOutput; called as (sub, 0, target). */
    writeToTarget(self: HgcSolidColorLike, mode: number, target: HGNode | null): void;
  };
  /** +0x1a0 — HGRect this component paints (16 bytes; ctors init from HGRectInfinite or arg). */
  rect: HGRect;
}

/**
 * Frontier callee: `HGObject::operator new(unsigned long)` @Helium is not yet
 * ported. HGSolidColor's ctors ask it for a 0x1b0-byte block for the sub.
 * We model the allocation as a straightforward object literal; the FCP-side
 * allocator does bookkeeping we don't participate in.
 */
function HGObject_operator_new(sizeBytes: number): HgcSolidColorLike {
  // asm: movl $0x1b0, %edi ; callq __ZN8HGObjectnwEm
  if ((sizeBytes | 0) !== 0x1b0) {
    throw new Error(
      `HGObject::operator new @Helium: HGSolidColor ctor requests exactly 0x1b0 bytes; got ${sizeBytes}`,
    );
  }
  // The real callee is a frontier stub — throw so callers see the gap.
  throw new Error(
    'HGObject::operator new(unsigned long) @Helium not yet transcribed — cited by HGSolidColor ctors @0x11b384 / 0x11b424 / 0x11b4c8 / 0x11b568',
  );
}

/**
 * Frontier callee: `HgcSolidColor::HgcSolidColor()` @Helium not yet ported;
 * cited by HGSolidColor ctors @0x11b39d / 0x11b43d / 0x11b4d3 / 0x11b573.
 */
function HgcSolidColor_construct(_self: HgcSolidColorLike): void {
  throw new Error(
    'HgcSolidColor::HgcSolidColor() @Helium not yet transcribed — cited by HGSolidColor ctors @0x11b39d / 0x11b43d / 0x11b4d3 / 0x11b573',
  );
}

/**
 * Frontier callee: `HGObject::operator delete(void*)` @Helium not yet ported;
 * cited by HGSolidColor::~HGSolidColor D0 @0x11b691 and by the landing pads
 * of every ctor when the following ctor step throws.
 */
function HGObject_operator_delete(_p: HgcSolidColorLike | HGSolidColor): void {
  throw new Error(
    'HGObject::operator delete(void*) @Helium not yet transcribed — cited by HGSolidColor::~HGSolidColor D0 @0x11b691 + ctor landing pads',
  );
}

export class HGSolidColor extends HGNode {
  /**
   * Struct field at +0x198 — the owned HgcSolidColor sub-object.  Every method
   * body faithfully performs `movq 0x198(%rdi), %rXX` before doing anything.
   */
  sub!: HgcSolidColorLike;

  /**
   * @0x000000000011b360  __ZN12HGSolidColorC2Ev
   * @0x000000000011b400  __ZN12HGSolidColorC1Ev
   *
   * The C1 (complete-object) and C2 (base-subobject) constructors are BIT-FOR-BIT
   * identical bodies (HGSolidColor has no virtual bases) — verified by inspecting
   * both slices in /tmp/Helium_tV.txt.  Faithful transcription of C2Ev:
   *
   *   callq  __ZN6HGNodeC2Ev                    ; HGNode::HGNode()
   *   leaq   0x901f9c(%rip), %rax               ; rax = &HGSolidColor::vtable @0xa1d308
   *   movq   %rax, (%rbx)                       ; install this->vtable
   *   movl   $0x1b0, %edi                       ; imm = 0x1B0
   *   callq  __ZN8HGObjectnwEm                  ; HGObject::operator new(0x1b0)
   *   leaq   _HGRectInfinite(%rip), %rax        ; load HGRectInfinite (16 B)
   *   movups (%rax), %xmm0
   *   movaps %xmm0, -0x30(%rbp)                 ; stack tmp
   *   callq  __ZN13HgcSolidColorC2Ev            ; HgcSolidColor::HgcSolidColor()  (on sub)
   *   leaq   0x9021af(%rip), %rax               ; rax = &HgcSolidColor::vtable
   *   movq   %rax, (%r14)                       ; install sub->vtable
   *   movaps -0x30(%rbp), %xmm0                 ; reload HGRectInfinite
   *   movaps %xmm0, 0x1a0(%r14)                 ; sub->rect = HGRectInfinite
   *   movq   %r14, 0x198(%rbx)                  ; this->sub = sub
   *
   * NOTE the ORDER (HGRectInfinite is captured BEFORE the HgcSolidColor ctor is
   * called, then written to +0x1a0 AFTER it — this specifically overwrites any
   * default rect the HgcSolidColor ctor might have installed).
   *
   * Frontier: HGNode::HGNode(), HGObject::operator new, HgcSolidColor::HgcSolidColor,
   * the two vtable const addresses (0xa1d308 for HGSolidColor and the HgcSolidColor
   * vtable).  All left as throwing stubs.
   */
  constructor();
  /**
   * @0x000000000011b4a0  __ZN12HGSolidColorC2E6HGRect
   * @0x000000000011b540  __ZN12HGSolidColorC1E6HGRect
   *
   * C1/C2 (HGRect) are again identical bodies.  Faithful transcription of C2E6HGRect:
   *
   *   movq   %rdx, %r14                         ; save HGRect high 8B
   *   movq   %rsi, %r15                         ; save HGRect low 8B  (HGRect passed as
   *                                             ;   two i64s across rsi/rdx per SysV ABI)
   *   movq   %rdi, %rbx                         ; save this
   *   callq  __ZN6HGNodeC2Ev                    ; HGNode::HGNode()
   *   leaq   0x901e58(%rip), %rax               ; rax = &HGSolidColor::vtable
   *   movq   %rax, (%rbx)
   *   movl   $0x1b0, %edi
   *   callq  __ZN8HGObjectnwEm                  ; new (0x1b0)
   *   callq  __ZN13HgcSolidColorC2Ev            ; HgcSolidColor::HgcSolidColor()
   *   leaq   0x902079(%rip), %rax               ; rax = &HgcSolidColor::vtable
   *   movq   %rax, (%r12)                       ; install sub->vtable
   *   movq   %r15, 0x1a0(%r12)                  ; sub->rect low 8B  = arg low 8B
   *   movq   %r14, 0x1a8(%r12)                  ; sub->rect high 8B = arg high 8B
   *   movq   %r12, 0x198(%rbx)                  ; this->sub = sub
   *
   * The HGRect-argument variant does NOT capture HGRectInfinite; the caller-provided
   * rect is copied directly into sub->rect.  Same frontier callees as the no-arg ctor.
   */
  constructor(r: HGRect);
  constructor(r?: HGRect) {
    // asm: callq __ZN6HGNodeC2Ev — the HGNode base ctor (already ported).
    super();

    // asm: leaq 0x901f9c(%rip), %rax ; movq %rax, (%rbx)
    // Install HGSolidColor's own vtable @0xa1d308 over the just-set HGNode vtable.
    // In TypeScript there is no runtime vtable pointer to install — the class
    // identity carries dispatch — so this line is a NO-OP.  Cited for provenance.

    // asm: movl $0x1b0, %edi ; callq __ZN8HGObjectnwEm — allocate the sub object.
    // asm: callq __ZN13HgcSolidColorC2Ev — construct the sub in place.
    // asm: leaq 0x9021af(%rip), %rax ; movq %rax, (%r14) — install sub's vtable.
    // asm: movq %r14, 0x198(%rbx)   — this->sub = new HgcSolidColor.
    //
    // Every one of those callees is a frontier stub; we mirror the exact call
    // sequence so future ports fill each gap without shifting semantics.
    const sub: HgcSolidColorLike = HGObject_operator_new(0x1b0);
    HgcSolidColor_construct(sub);

    if (r === undefined) {
      // asm: leaq _HGRectInfinite(%rip),%rax ; movups (%rax),%xmm0
      //      movaps %xmm0, -0x30(%rbp)       ; movaps -0x30(%rbp), %xmm0
      //      movaps %xmm0, 0x1a0(%r14)       ; sub->rect = HGRectInfinite
      sub.rect = {
        x: HGRectInfinite.x | 0,
        y: HGRectInfinite.y | 0,
        right: HGRectInfinite.right | 0,
        bottom: HGRectInfinite.bottom | 0,
      };
    } else {
      // asm: movq %r15, 0x1a0(%r12) ; movq %r14, 0x1a8(%r12) — copy 2×8B into rect.
      sub.rect = {
        x: r.x | 0,
        y: r.y | 0,
        right: r.right | 0,
        bottom: r.bottom | 0,
      };
    }

    // asm: movq %r14, 0x198(%rbx) — this->sub = sub. Final store; no cleanup.
    this.sub = sub;
  }

  /**
   * @0x000000000011b5e0  __ZN12HGSolidColorD2Ev  (base object destructor)
   * @0x000000000011b620  __ZN12HGSolidColorD1Ev  (complete object destructor)
   *
   * D2 and D1 are again bit-for-bit identical bodies (only the vtable-const
   * displacement differs; both point to distinct HGSolidColor vtable addresses
   * as expected for a class with no virtual bases where D1==D2).
   *
   * Faithful transcription of D2Ev:
   *   movq   %rdi, %rbx
   *   leaq   0x901d28(%rip), %rax               ; rax = &HGSolidColor vtable (D2 form)
   *   movq   %rax, (%rdi)                       ; install this->vtable (Itanium ABI:
   *                                             ;   dtor resets vtable on the way down)
   *   movq   0x198(%rdi), %rdi                  ; rdi = this->sub
   *   movq   (%rdi), %rax                       ; rax = sub->vtable
   *   callq  *0x18(%rax)                        ; sub->vtable[+0x18](sub)  = D0 slot
   *                                             ;   (deleting dtor on the sub)
   *   movq   %rbx, %rdi
   *   jmp    __ZN6HGNodeD2Ev                    ; tail HGNode::~HGNode()
   *
   * KEY OBSERVATION: HGSolidColor does NOT call HGObject::operator delete on the
   * sub — instead it dispatches through the sub's own vtable slot +0x18, which
   * is the Itanium ABI "deleting destructor" (D0) that both destroys AND frees.
   * That is why the base dtor is not a leak.
   *
   * Frontier: HGNode::~HGNode() (ported), sub->vtable[+0x18] (frontier).
   */
  destroyBase(): void {
    // asm: leaq 0x901d28(%rip),%rax ; movq %rax,(%rdi)
    //   TS: nothing to install — class identity is the vtable.  Cited for provenance.

    // asm: movq 0x198(%rdi),%rdi ; movq (%rdi),%rax ; callq *0x18(%rax)
    // Dispatch through sub's vtable slot at byte offset 0x18 (deleting dtor).
    const sub = this.sub;
    sub.vtable.destroyDeleting(sub);

    // asm: movq %rbx,%rdi ; jmp __ZN6HGNodeD2Ev
    // Tail-call HGNode base dtor — frontier callee.
    throw new Error(
      'HGNode::~HGNode() @Helium not yet transcribed — tail-jmp target of HGSolidColor::~HGSolidColor D2/D1 @0x11b609 / 0x11b649',
    );
  }

  /**
   * @0x000000000011b660  __ZN12HGSolidColorD0Ev  (deleting destructor)
   *
   * Faithful transcription:
   *   movq   %rdi, %rbx
   *   leaq   0x901ca8(%rip), %rax               ; rax = &HGSolidColor vtable
   *   movq   %rax, (%rdi)                       ; reset this->vtable
   *   movq   0x198(%rdi), %rdi                  ; rdi = this->sub
   *   movq   (%rdi), %rax                       ; rax = sub->vtable
   *   callq  *0x18(%rax)                        ; sub->vtable[+0x18](sub) — deleting dtor
   *   movq   %rbx, %rdi
   *   callq  __ZN6HGNodeD2Ev                    ; HGNode::~HGNode()  (NOT a tail here —
   *                                             ;   D0 must free THIS after HGNode's dtor)
   *   movq   %rbx, %rdi
   *   jmp    __ZN8HGObjectdlEPv                 ; HGObject::operator delete(this)
   *
   * D0 differs from D2/D1 in two ways: HGNode::~HGNode is a callq (not jmp), and
   * a final tail-jmp to HGObject::operator delete frees THIS.
   *
   * Frontier: sub->vtable[+0x18], HGNode::~HGNode(), HGObject::operator delete.
   */
  destroyAndDelete(): void {
    const sub = this.sub;
    sub.vtable.destroyDeleting(sub);
    // Faithful sequence: HGNode::~HGNode(this); HGObject::operator delete(this);
    // Both are frontier callees. Mirror the two-step tail structure.
    HGObject_operator_delete(this);
    throw new Error(
      'HGNode::~HGNode() @Helium not yet transcribed — cited by HGSolidColor::~HGSolidColor D0 @0x11b683',
    );
  }

  /**
   * @0x000000000011b6a0  __ZN12HGSolidColor12SetParameterEiffff
   *
   * Faithful transcription — the entire body is a single tail-forward through
   * the sub's vtable, slot at byte offset 0x60 (=slot index 12):
   *
   *   pushq  %rbp
   *   movq   %rsp, %rbp
   *   movq   0x198(%rdi), %rdi                  ; rdi = this->sub
   *   movq   (%rdi), %rax                       ; rax = sub->vtable
   *   movq   0x60(%rax), %rax                   ; rax = sub->vtable[12] (byte off 0x60)
   *   popq   %rbp
   *   jmpq   *%rax                              ; tail-call vslot(sub, i, a, b, c, d)
   *
   * Every original arg (i in edx, a/b/c/d in xmm1..xmm4 per SysV) is preserved.
   * No arithmetic, no branches, no captured constants.
   *
   * The vtable slot at +0x60 on HgcSolidColor is a frontier symbol; it is
   * modelled as `HgcSolidColorLike.vtable.setParameter` and left as a THROWing
   * stub until HgcSolidColor is ported.
   */
  SetParameter(idx: number, a: number, b: number, c: number, d: number): void {
    // asm: movq 0x198(%rdi),%rdi — rdi = this->sub
    const sub = this.sub;
    // asm: movq (%rdi),%rax ; movq 0x60(%rax),%rax ; jmpq *%rax
    // Match FCP's single-precision semantics: a/b/c/d arrive in xmm1..xmm4 as
    // f32 (SysV float args), so wrap each in Math.fround before the forward.
    sub.vtable.setParameter(
      sub,
      idx | 0,
      Math.fround(a),
      Math.fround(b),
      Math.fround(c),
      Math.fround(d),
    );
  }

  /**
   * @0x000000000011b6c0  __ZN12HGSolidColor9GetOutputEP10HGRenderer
   *
   * Faithful transcription:
   *   movq   %rdi, %rbx                         ; save this
   *   movq   0x198(%rdi), %r14                  ; r14 = this->sub
   *   movq   %rsi, %rdi                         ; rdi = renderer
   *   movq   %rbx, %rsi                         ; rsi = this  (as HGNode*)
   *   xorl   %edx, %edx                         ; edx = 0
   *   callq  __ZN10HGRenderer8GetInputEP6HGNodei ; x = renderer->GetInput(this, 0)
   *   movq   (%r14), %rcx                       ; rcx = sub->vtable
   *   movq   %r14, %rdi                         ; rdi = sub
   *   xorl   %esi, %esi                         ; esi = 0
   *   movq   %rax, %rdx                         ; rdx = x   (result of GetInput)
   *   callq  *0x78(%rcx)                        ; sub->vtable[15] (byte off 0x78) — write-to-target
   *   movq   0x198(%rbx), %rax                  ; rax = this->sub
   *   retq                                      ; return this->sub  (as HGNode* — sub is-a HGNode)
   *
   * Semantics: ask the renderer for the target/input associated with (this, 0);
   * hand that target to the sub's per-vtable write-out entry; return the sub
   * pointer so the caller can chain further wiring.
   *
   * Frontier: HGRenderer::GetInput (already ported @Helium 0x000f2dd0),
   * sub->vtable[+0x78] (unresolved on HgcSolidColor).
   */
  GetOutput(renderer: HGRendererLike | null): HgcSolidColorLike {
    // asm: movq 0x198(%rdi),%r14 — cache sub.
    const sub = this.sub;

    // asm: movq %rsi,%rdi ; movq %rbx,%rsi ; xorl %edx,%edx
    //      callq __ZN10HGRenderer8GetInputEP6HGNodei
    // Frontier: HGRenderer isn't callable in this port yet — cite and stub.
    // Faithful order: renderer->GetInput(this, 0) is invoked BEFORE the vtable
    // dispatch on sub; the result flows into the dispatch as %rdx.
    if (renderer === null) {
      // Even the null case in the disasm unconditionally calls the method; the
      // renderer being null is a caller-side invariant violation. Throw loudly.
      throw new Error(
        'HGSolidColor::GetOutput @0x11b6c0: renderer==null — HGRenderer::GetInput @Helium 0x000f2dd0 has no null-guard here',
      );
    }
    // HGRenderer::GetInput is ported (raw-port/src/render/HGRenderer.ts) but we
    // don't have the strong typing here; keep the call cited and throw until
    // an HGRendererLike is threaded through. This is a frontier CITED stub.
    const target: HGNode | null = (() => {
      throw new Error(
        'HGRenderer::GetInput(HGNode*, int) @Helium 0x000f2dd0 — port exists but interop with HGRendererLike not yet wired at HGSolidColor::GetOutput @0x11b6d9',
      );
    })();

    // asm: movq (%r14),%rcx ; movq %r14,%rdi ; xorl %esi,%esi ; movq %rax,%rdx ; callq *0x78(%rcx)
    // sub->vtable[+0x78] — the "write output to target" slot on HgcSolidColor.
    sub.vtable.writeToTarget(sub, 0, target);

    // asm: movq 0x198(%rbx),%rax ; retq — return this->sub (a HGNode* alias).
    return sub;
  }
}
