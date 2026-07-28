// HGInvertAlpha.ts — Helium's alpha-invert wrapper render node. Faithful
// transcription of every externally-visible HGInvertAlpha method from
//   /Applications/Final Cut Pro.app/Contents/Frameworks/Helium.framework/
//     Versions/A/Helium
//
// Source disassembly (bundled):
//   raw-port/re/disasm/Helium.HGInvertAlpha.all.s
//     C2 @0x36e0   ; base-object ctor
//     C1 @0x3760   ; complete-object ctor  (identical body to C2)
//     D2 @0x37e0   ; base-object dtor
//     D1 @0x3820   ; complete-object dtor
//     D0 @0x3860   ; deleting dtor
//     GetOutput @0x38a0
//
// nm entries owned by this class (Helium):
//   0x36e0 T HGInvertAlpha::HGInvertAlpha()   [C2]
//   0x3760 T HGInvertAlpha::HGInvertAlpha()   [C1]
//   0x37e0 T HGInvertAlpha::~HGInvertAlpha()  [D2]
//   0x3820 T HGInvertAlpha::~HGInvertAlpha()  [D1]
//   0x3860 T HGInvertAlpha::~HGInvertAlpha()  [D0]
//   0x38a0 T HGInvertAlpha::GetOutput(HGRenderer*)
//
// ---------------------------------------------------------------------------
// Class shape recovered from ctor / dtors / GetOutput:
//
//   HGInvertAlpha  is-a  HGNode                     (C1/C2 both open with
//                                                     callq __ZN6HGNodeC2Ev
//                                                     and every dtor tail-
//                                                     jmps into HGNode::~HGNode)
//
//   HGInvertAlpha {
//     +0x000  vptr                                   (set in C1/C2 to
//                                                     `vtable-for-HGInvertAlpha`
//                                                     resident at rip+0x9fefff
//                                                     — 0x36f9 + 0x9fefff
//                                                     = 0xa026f8 = the
//                                                     "installed ptr" in the
//                                                     class's vtable object
//                                                     @0xa026e8, offset 0x10)
//     +0x008..+0x197                                 (HGNode base subobject)
//     +0x198  HgcInvertAlpha* m_hgcNode              (heap-allocated via
//                                                     HGObject::operator new(0x1a0)
//                                                     @0x3701 and constructed
//                                                     via HgcInvertAlpha::C1
//                                                     @0x370c)
//   }
//
// The 0x1a0-byte allocation is the size of a HgcInvertAlpha instance — a
// raw datum recovered from the ctors' literal immediate.
//
// ---------------------------------------------------------------------------
// HGInvertAlpha own vtable (Helium @0xa026e8; installed ptr 0xa026f8 — via
// `raw-port/army/tools/resolve.py Helium vtable HGInvertAlpha`):
//   *0x00 -> HGInvertAlpha::~HGInvertAlpha()          @0x3820   (D1)
//   *0x08 -> HGInvertAlpha::~HGInvertAlpha()          @0x3860   (D0)
//   *0x10 -> HGObject::Retain()                        @0x1a0f20
//   *0x18 -> HGObject::Release()                       @0x1a0f30
//   *0x20 -> HGNode::debugDescription() const          @0x11c100
//   *0x28 -> HGNode::dotLabel() const                  @0x11c080
//   *0x30 -> HGNode::label_A() const                   @0x11c090
//   *0x38 -> HGNode::label_B() const                   @0x11c0d0
//   *0x40 -> HGNode::info(int, string const&, string const&) @0x11c0e0
//   *0x48 -> HGNode::shaderDescription() const         @0x11c3f0
//   *0x50 -> HGNode::GetParameterCount()               @0x11ca50
//   *0x58 -> HGNode::GetParameterName(int)             @0x11ca60
//   *0x60 -> HGNode::SetParameter(int, f,f,f,f)        @0x11cab0
//   *0x68 -> HGNode::GetParameter(int, float*)         @0x11cbe0
//   *0x70 -> HGNode::GetNumInputs()                    @0x11c8a0
//   *0x78 -> HGNode::SetInput(int, HGNode*)            @0x11c5f0
//   *0x80 -> HGNode::GetInput(int)                     @0x11c8b0
//   *0x88 -> HGNode::SetFlags(int, int)                @0x11c8e0
//   *0x90 -> HGNode::ClearFlags(int, int)              @0x11c980
//
// (The Hgc-member vtable — HgcInvertAlpha's — is not printed here because
// GetOutput only reads slot 0x78 of it, and that slot resolves to the same
// `HGNode::SetInput` @0x11c5f0 in every Hgc-vtable observed so far. See
// HGClampPremultiplied.ts for the fully-printed sibling Hgc vtable.)
//
// Slots that matter for the transcribed bodies:
//   own vtable *0x80  (HGNode::GetInput)  — read by GetOutput @0x38b6.
//   hgc vtable *0x78  (HGNode::SetInput)  — read by GetOutput @0x38c7.
//   hgc vtable *0x18  (HGObject::Release) — read by every dtor
//                                            @0x37fd/0x383d/0x387d.
//
// ---------------------------------------------------------------------------
// Frontier callees (undecoded — throwing stubs cite them):
//   __ZN6HGNodeC2Ev            HGNode::HGNode()             @0x36ed/@0x376d callq
//   __ZN6HGNodeD2Ev            HGNode::~HGNode()            @0x3731/@0x3744 (C2 unwind),
//                                                            @0x37b1/@0x37c4 (C1 unwind),
//                                                            @0x3809 (D2 tail-jmp),
//                                                            @0x3849 (D1 tail-jmp),
//                                                            @0x3883 (D0 call)
//   __ZN8HGObjectnwEm          HGObject::operator new(ulong) @0x3701/@0x3781 callq
//   __ZN8HGObjectdlEPv         HGObject::operator delete    @0x3729/@0x37a9 (unwind),
//                                                            @0x3891 (D0 jmp)
//   __ZN14HgcInvertAlphaC1Ev   HgcInvertAlpha ctor           @0x370c/@0x378c callq
//   (own vtable) HGNode::GetInput(int)  @Helium 0x11c8b0 via
//                              *0x80(%rax)                   @0x38b6 callq
//   (hgc vtable) HGNode::SetInput(int, HGNode*)  @Helium 0x11c5f0 via
//                              *0x78(%rcx)                   @0x38c7 callq
//   (hgc vtable) HGObject::Release()             @Helium 0x1a0f30 via
//                              *0x18(%rax)                   @0x37fd/@0x383d/@0x387d
//   __Unwind_Resume            (libunwind)                   @0x3739/@0x374c/@0x37b9/@0x37cc
//   ___clang_call_terminate    (libc++abi)                   @0x3811/@0x3851/@0x3899
//
// The class's *math surface* is trivial: the pixel work lives in
// HgcInvertAlpha's Metal shader (alpha := 1.0 − alpha; RGB unchanged),
// which is itself a separate frontier decode.
//
// ---------------------------------------------------------------------------
// HGInvertAlpha::HGInvertAlpha()  [C1 and C2 — identical bodies]  @0x36e0 / @0x3760
//
// Both nm entries expand to the SAME sequence (only the rip-relative vtable
// displacement differs, and both land at the same 0xa026f8 installed vtable
// pointer — 0x36f9 + 0x9fefff = 0xa026f8 = 0x3779 + 0x9fef7f).
//
//   __ZN13HGInvertAlphaC2Ev  /  __ZN13HGInvertAlphaC1Ev:
//     pushq %rbp / movq %rsp,%rbp / pushq %r15 / pushq %r14
//     pushq %rbx / pushq %rax
//     movq  %rdi, %rbx                              ; save this
//     callq __ZN6HGNodeC2Ev                          ; HGNode base ctor
//     leaq  <disp>(%rip), %rax                       ; = vtable-for-HGInvertAlpha (0xa026f8)
//     movq  %rax, (%rbx)                             ; this->vptr = vtable
//     movl  $0x1a0, %edi                             ; imm = 0x1A0 (sizeof HgcInvertAlpha)
//     callq __ZN8HGObjectnwEm                        ; HGObject::operator new(0x1a0)
//     movq  %rax, %r14                               ; %r14 = raw storage
//     movq  %rax, %rdi                               ; arg1 = raw storage
//     callq __ZN14HgcInvertAlphaC1Ev                  ; HgcInvertAlpha::HgcInvertAlpha()
//     movq  %r14, 0x198(%rbx)                        ; this->m_hgcNode = %r14
//     ; happy-path: pop/ret
//     ; unwind edges (if a subordinate ctor throws):
//     movq  %rax, %r15                               ; save exception ptr
//     movq  %r14, %rdi
//     callq __ZN8HGObjectdlEPv                       ; free raw storage
//     movq  %rbx, %rdi
//     callq __ZN6HGNodeD2Ev                          ; unwind base subobject
//     movq  %r15, %rdi
//     callq __Unwind_Resume
//     ; second unwind edge (HGNode base ctor itself threw):
//     movq  %rax, %r15
//     movq  %rbx, %rdi
//     callq __ZN6HGNodeD2Ev
//     movq  %r15, %rdi
//     callq __Unwind_Resume
//
// This is byte-for-byte the same shape as HGClampPremultiplied::C1
// (@Helium 0x1b8ec0) — the ONLY differences are the vtable's absolute
// address (0xa026f8 vs 0xa272d8) and the identity of the Hgc-node ctor
// (HgcInvertAlpha::C1 vs HgcClampPremultiplied::C1). This is a class
// template pattern shared across every "HGNode-facade + owned HgcXxxx"
// wrapper in Helium.
//
// TS transcription note: the exception-unwind bookkeeping is meaningful
// in native land only because C++ requires it if a subordinate ctor
// throws. In TS the subordinate ctors below are throwing stubs (they
// never "succeed"), and GC subsumes operator delete. The TS body
// mirrors the happy path.
//
// ---------------------------------------------------------------------------
// HGInvertAlpha::~HGInvertAlpha()  [D2 — base-object]         @0x37e0
// HGInvertAlpha::~HGInvertAlpha()  [D1 — complete-object]     @0x3820
//
// Both bodies are byte-for-byte identical modulo their rip displacement to
// the same vtable-for-HGInvertAlpha (0xa026f8). Sequence:
//
//   pushq %rbp / movq %rsp,%rbp / pushq %rbx / pushq %rax
//   movq  %rdi, %rbx
//   leaq  <disp>(%rip), %rax                        ; vtable-for-HGInvertAlpha
//   movq  %rax, (%rdi)                              ; this->vptr = vtable
//   movq  0x198(%rdi), %rdi                         ; %rdi = m_hgcNode
//   movq  (%rdi), %rax                              ; %rax = m_hgcNode->vptr
//   callq *0x18(%rax)                               ; hgc vtable[0x18] = HGObject::Release()
//   movq  %rbx, %rdi
//   pop
//   jmp   __ZN6HGNodeD2Ev                           ; TAIL-call base D2
//   ; exception path -> ___clang_call_terminate
//
// Semantics: reset vptr, release the owned HgcInvertAlpha ref-count via
// vtable[0x18], chain into HGNode::~HGNode.
//
// ---------------------------------------------------------------------------
// HGInvertAlpha::~HGInvertAlpha()  [D0 — deleting]              @0x3860
//
//   pushq %rbp / movq %rsp,%rbp / pushq %rbx / pushq %rax
//   movq  %rdi, %rbx
//   leaq  0x9fee88(%rip), %rax                      ; vtable-for-HGInvertAlpha
//   movq  %rax, (%rdi)                              ; this->vptr = vtable
//   movq  0x198(%rdi), %rdi                         ; %rdi = m_hgcNode
//   movq  (%rdi), %rax                              ; %rax = m_hgcNode->vptr
//   callq *0x18(%rax)                               ; HGObject::Release()
//   movq  %rbx, %rdi
//   callq __ZN6HGNodeD2Ev                            ; HGNode::~HGNode()
//   movq  %rbx, %rdi
//   pop
//   jmp   __ZN8HGObjectdlEPv                         ; TAIL: HGObject::operator delete
//
// Same as D2 plus a trailing `HGObject::operator delete(this)`. GC
// subsumes the delete in TS.
//
// ---------------------------------------------------------------------------
// HGInvertAlpha::GetOutput(HGRenderer* renderer)                @0x38a0
//
//   pushq %rbp / movq %rsp,%rbp / pushq %r14 / pushq %rbx
//   movq  %rdi, %rbx                                ; save this
//   movq  (%rdi), %rax                              ; %rax = this->vptr
//   movq  0x198(%rdi), %r14                         ; %r14 = m_hgcNode
//   xorl  %esi, %esi                                ; arg2 = 0 (input slot idx)
//   callq *0x80(%rax)                               ; own vtable[0x80] = HGNode::GetInput(0)
//   movq  (%r14), %rcx                              ; %rcx = m_hgcNode->vptr
//   movq  %r14, %rdi                                ; arg1 = m_hgcNode
//   xorl  %esi, %esi                                ; arg2 = 0 (input slot idx)
//   movq  %rax, %rdx                                ; arg3 = GetInput's returned HGNode*
//   callq *0x78(%rcx)                               ; hgc vtable[0x78] = HGNode::SetInput
//   movq  0x198(%rbx), %rax                         ; return m_hgcNode
//   pop / retq
//
// Semantics: HGInvertAlpha wraps a HgcInvertAlpha filter node. When the
// render graph asks for HGInvertAlpha's output it:
//   1. reads THIS node's input slot 0 via its OWN vtable[0x80]
//        (`HGNode::GetInput(this, 0)`)
//   2. wires that upstream node into slot 0 of the owned Hgc filter via the
//        Hgc's vtable[0x78] (`HGNode::SetInput(m_hgcNode, 0, upstream)`)
//   3. returns m_hgcNode — the caller then treats the Hgc as the "output".
//
// The `renderer` argument is present in the ABI signature (it's the vtable
// slot's declared signature `HGNode::GetOutput(HGRenderer*)`), but the body
// NEVER reads %rsi — this method ignores the renderer. Compare with
// HGClampPremultiplied::GetOutput which threads `renderer` through
// `HGRenderer::GetInput(renderer, this, 0)`. HGInvertAlpha instead reads
// the input directly off `this` via its OWN vtable — a different (simpler)
// input-plumbing path used by the two-different sibling nodes.
//
// This IS the wrapper-node pattern — a facade that exposes an HGNode
// identity in the outer graph while delegating the per-pixel Metal shader
// dispatch to the owned Hgc filter.

import type { HGRenderer } from "./FFHCopyAlpha";
export type { HGRenderer };

/**
 * Opaque brand for `HGNode*` — the base class every render node inherits
 * from. HGNode itself is a frontier decode (its ctor/dtor are cited in the
 * file header). Only the identity is needed at this layer.
 */
export type HGNode = { readonly __brand: "HGNode" };

// ---------------------------------------------------------------------------
// Frontier callee stubs (undecoded) — see file header for cited addresses.
// ---------------------------------------------------------------------------

/**
 * Frontier: `HGNode::HGNode()` — the base subobject ctor called from
 * HGInvertAlpha::C1/C2 @Helium 0x36ed and @Helium 0x376d.
 */
function HGNode_C2(_self: HGInvertAlpha): void {
  // @Helium 0x36ed / 0x376d  callq __ZN6HGNodeC2Ev
  throw new Error(
    "HGNode::HGNode() not yet transcribed " +
      "(frontier callee @Helium 0x36ed/0x376d in HGInvertAlpha::C1/C2)",
  );
}

/**
 * Frontier: `HGNode::~HGNode()` — reached from every HGInvertAlpha dtor:
 * D2 tail-jmp @Helium 0x3809, D1 tail-jmp @Helium 0x3849, D0 callq @Helium
 * 0x3883, and every unwind edge in C1/C2 (@Helium 0x3731/0x3744/0x37b1/
 * 0x37c4).
 */
function HGNode_D2(_self: HGInvertAlpha): void {
  // @Helium 0x3809 jmp __ZN6HGNodeD2Ev
  throw new Error(
    "HGNode::~HGNode() not yet transcribed " +
      "(frontier callee @Helium 0x3809/0x3849/0x3883 in HGInvertAlpha dtors)",
  );
}

/**
 * Frontier: `HgcInvertAlpha::HgcInvertAlpha()` — invoked at
 * @Helium 0x370c (C2) and @Helium 0x378c (C1) on a fresh
 * `HGObject::operator new(0x1a0)` allocation. The 0x1a0-byte size is the
 * Hgc filter's sizeof (recovered from the ctors' literal immediate).
 */
function HgcInvertAlpha_C1(_self: HgcInvertAlpha): void {
  // @Helium 0x370c / 0x378c  callq __ZN14HgcInvertAlphaC1Ev
  throw new Error(
    "HgcInvertAlpha::HgcInvertAlpha() not yet transcribed " +
      "(frontier callee @Helium 0x370c/0x378c — 0x1a0-byte Metal shader dispatch node)",
  );
}

/**
 * Frontier: `HGObject::Release()` on the owned HgcInvertAlpha.
 * Called from every dtor as `*0x18(%rax)` where `%rax` = m_hgcNode->vptr.
 * The vtable[0x18] slot resolves to `HGObject::Release` @Helium 0x1a0f30
 * (see vtable table in file header). In TS the GC subsumes ref-counting;
 * we cite the address so the destroy chain stays traceable.
 */
function HGObject_Release_hgcNode(_node: HgcInvertAlpha): void {
  // @Helium 0x37fd / 0x383d / 0x387d  callq *0x18(%rax)
  //   -> HGObject::Release() @Helium 0x1a0f30 (via HgcInvertAlpha vtable)
  // GC subsumes Release — noop.
}

/**
 * Frontier: `HGNode::GetInput(int inputIdx)` — reads the upstream HGNode
 * wired to `this->inputs[inputIdx]`. Invoked from GetOutput @Helium
 * 0x38b6 via `*0x80(%rax)` on THIS class's own vtable; the vtable[0x80]
 * slot resolves to `HGNode::GetInput` @Helium 0x11c8b0 (see vtable
 * table). This is a non-virtual base implementation — every HGNode
 * subclass in Helium inherits the same body.
 */
function HGNode_GetInput(_self: HGInvertAlpha, _inputIdx: number): HGNode {
  // @Helium 0x38b6 callq *0x80(%rax)
  //   -> HGNode::GetInput(int) @Helium 0x11c8b0 (via own vtable)
  throw new Error(
    "HGNode::GetInput(int) not yet transcribed " +
      "(frontier callee @Helium 0x38b6 in HGInvertAlpha::GetOutput)",
  );
}

/**
 * Frontier: `HGNode::SetInput(int inputIdx, HGNode* upstream)` — wires
 * `upstream` into `inputIdx` of the receiver. Invoked from GetOutput
 * @Helium 0x38c7 via `*0x78(%rcx)` on the Hgc member's vtable; the
 * vtable[0x78] slot resolves to `HGNode::SetInput` @Helium 0x11c5f0.
 */
function HGNode_SetInput(
  _node: HgcInvertAlpha,
  _inputIdx: number,
  _upstream: HGNode,
): void {
  // @Helium 0x38c7 callq *0x78(%rcx)
  //   -> HGNode::SetInput(int, HGNode*) @Helium 0x11c5f0 (via Hgc vtable)
  throw new Error(
    "HGNode::SetInput(int, HGNode*) not yet transcribed " +
      "(frontier callee @Helium 0x38c7 in HGInvertAlpha::GetOutput)",
  );
}

/**
 * Opaque brand for the owned HgcInvertAlpha filter (Helium — the
 * pixel-level Metal-shader dispatch node that computes
 * `alpha := 1.0 - alpha` on a premultiplied-alpha image).  Its own
 * ctor/dtor/shader is a separate frontier decode; we surface only the
 * identity here so HGInvertAlpha's field-shape and vtable-slot dispatch
 * are exact.
 *
 * sizeof(HgcInvertAlpha) = 0x1a0 bytes (imm literal recovered from
 * HGInvertAlpha::C1/C2 @Helium 0x36fc / 0x377c).
 */
export type HgcInvertAlpha = {
  readonly __brand: "HgcInvertAlpha";
};

/**
 * `HGInvertAlpha` — Helium wrapper node around a HgcInvertAlpha Metal
 * filter that inverts the alpha channel of a premultiplied-alpha image
 * (i.e. `alpha' = 1.0 − alpha`, with RGB unchanged). This class is a
 * "graph facade": it presents an HGNode identity to the outer render
 * graph and delegates all per-pixel work to the owned Hgc filter.
 *
 * @Helium symbols owned by this class:
 *   C2 @0x36e0
 *   C1 @0x3760
 *   D2 @0x37e0
 *   D1 @0x3820
 *   D0 @0x3860
 *   GetOutput @0x38a0
 *
 * Recovered fields:
 *   m_hgcNode — the owned HgcInvertAlpha allocated by
 *   `HGObject::operator new(0x1a0)` in C1/C2 @Helium 0x3701 / 0x3781 and
 *   constructed in-place at @Helium 0x370c / 0x378c. Released by every
 *   dtor via vtable[0x18] (HGObject::Release).
 *
 *   @Helium struct offset +0x198
 */
export class HGInvertAlpha {
  /**
   * `this->m_hgcNode` at struct offset +0x198. Populated by C1/C2
   * @Helium 0x3711 / 0x3791 after `HGObject::operator new(0x1a0)` +
   * in-place `HgcInvertAlpha::HgcInvertAlpha()`.
   */
  m_hgcNode: HgcInvertAlpha | null = null;

  /**
   * HGInvertAlpha::HGInvertAlpha()  [C1 == C2 — identical bodies]
   * @Helium 0x36e0 (C2) / 0x3760 (C1)
   *
   * Mirrored control flow:
   *   HGNode::HGNode()                                (base ctor)
   *   this->vptr = vtable-for-HGInvertAlpha (0xa026f8)  (TS: noop)
   *   HGObject::operator new(0x1a0)                    (GC subsumes)
   *   HgcInvertAlpha::HgcInvertAlpha()                (in-place)
   *   this->m_hgcNode = <new node>
   *
   * The two-entry exception-unwind machinery is a pure C++-ABI artifact;
   * see file header for the addresses. TS mirrors the happy path.
   */
  constructor() {
    // @Helium 0x36ed / 0x376d — base subobject ctor.
    HGNode_C2(this);
    // @Helium 0x36f2..0x36f9 / 0x3772..0x3779 — this->vptr =
    // vtable-for-HGInvertAlpha (0xa026f8). TS has no vptr; noop.
    // @Helium 0x36fc..0x3701 / 0x377c..0x3781 — HGObject::operator new(0x1a0).
    // GC subsumes storage acquisition; the 0x1a0 size is a datum only.
    const raw = { __brand: "HgcInvertAlpha" } as HgcInvertAlpha;
    // @Helium 0x370c / 0x378c — HgcInvertAlpha::HgcInvertAlpha().
    HgcInvertAlpha_C1(raw);
    // @Helium 0x3711 / 0x3791 — this->m_hgcNode = %r14.
    this.m_hgcNode = raw;
  }

  /**
   * HGInvertAlpha::~HGInvertAlpha()  [D2 — base-object]  @Helium 0x37e0
   *
   * Mirrored control flow:
   *   this->vptr = vtable-for-HGInvertAlpha             (TS: noop)
   *   HGObject::Release() on m_hgcNode via vtable[0x18]
   *   jmp HGNode::~HGNode()
   */
  destroy_D2(): void {
    // @Helium 0x37e9..0x37f0 — reset vptr; TS noop.
    if (this.m_hgcNode !== null) {
      // @Helium 0x37fd callq *0x18(%rax)  -> HGObject::Release @0x1a0f30
      HGObject_Release_hgcNode(this.m_hgcNode);
    }
    // @Helium 0x3809 jmp __ZN6HGNodeD2Ev
    HGNode_D2(this);
  }

  /**
   * HGInvertAlpha::~HGInvertAlpha()  [D1 — complete-object]  @Helium 0x3820
   *
   * Byte-for-byte identical to D2 (same reset-vptr, same Release on
   * m_hgcNode, same tail-jmp into HGNode::~HGNode). Both nm entries land
   * in a body whose only meaningful difference is a distinct rip
   * displacement that resolves to the SAME vtable-for-HGInvertAlpha at
   * 0xa026f8.
   */
  destroy_D1(): void {
    // @Helium 0x3829..0x3830 — reset vptr; TS noop.
    if (this.m_hgcNode !== null) {
      // @Helium 0x383d callq *0x18(%rax)  -> HGObject::Release @0x1a0f30
      HGObject_Release_hgcNode(this.m_hgcNode);
    }
    // @Helium 0x3849 jmp __ZN6HGNodeD2Ev
    HGNode_D2(this);
  }

  /**
   * HGInvertAlpha::~HGInvertAlpha()  [D0 — deleting]  @Helium 0x3860
   *
   * Same body as D2 plus a trailing `HGObject::operator delete(this)`.
   * GC subsumes the trailing delete.
   */
  destroy_D0(): void {
    // @Helium 0x3869..0x3870 — reset vptr; TS noop.
    if (this.m_hgcNode !== null) {
      // @Helium 0x387d callq *0x18(%rax)  -> HGObject::Release @0x1a0f30
      HGObject_Release_hgcNode(this.m_hgcNode);
    }
    // @Helium 0x3883 callq __ZN6HGNodeD2Ev
    HGNode_D2(this);
    // @Helium 0x3891 jmp __ZN8HGObjectdlEPv — TS GC subsumes operator delete.
  }

  /**
   * HGInvertAlpha::GetOutput(HGRenderer* renderer)  @Helium 0x38a0
   *
   * `renderer` is unused by the body (see file header) — accepted only to
   * match the vtable signature. Mirrored control flow:
   *
   *   @0x38aa..0x38b6  input = this->GetInput(0)   (own vtable[0x80])
   *   @0x38bc..0x38c7  m_hgcNode->SetInput(0, input)  (Hgc vtable[0x78])
   *   @0x38ca          return m_hgcNode
   */
  GetOutput(_renderer: HGRenderer): HgcInvertAlpha {
    // @Helium 0x38aa..0x38b6 — HGNode::GetInput(this, 0) via own vtable[0x80]
    const input = HGNode_GetInput(this, 0);
    // @Helium 0x38bc..0x38c7 — m_hgcNode->SetInput(0, input) via vtable[0x78]
    if (this.m_hgcNode === null) {
      // Ctor guarantees non-null via C1/C2 @Helium 0x3711/0x3791; if the
      // ctor's frontier callees ever succeed this branch is dead. Kept
      // as an explicit raise-on-invariant-violation so the failure is
      // loud.
      throw new Error(
        "HGInvertAlpha::GetOutput invariant broken: m_hgcNode null " +
          "(should be set by C1/C2 @Helium 0x3711/0x3791)",
      );
    }
    HGNode_SetInput(this.m_hgcNode, 0, input);
    // @Helium 0x38ca — return this->m_hgcNode.
    return this.m_hgcNode;
  }
}
