// raw-port: HGCrop — Helium framework (render layer)
//
// HGCrop is a thin HGNode wrapper class that OWNS an internal HGCropNode
// (the actual worker with Metal shader / geometry / bind logic). The wrapper
// exists so external callers can construct/parameterize a crop transformation
// through the plain HGCrop ABI while the implementation lives inside
// HGCropNode. The wrapper forwards inputs, GetOutput, and SetParameter to the
// child via virtual dispatch; the parameter setter is the vtable slot at
// +0x60 on the child (== HGCropNode::SetParameter, decoded from the disasm at
// @0x247630 for context — but the wrapper itself does not know that; it just
// tail-jmps through the vtable at @0x247b8e/@0x247b93).
//
// SYMBOLS PORTED (Helium.framework/Versions/A/Helium):
//   @Helium 0x247990  HGCrop::HGCrop()                    (C2 base ctor)
//   @Helium 0x247ae0  HGCrop::HGCrop()                    (C1 ctor thunk)
//   @Helium 0x247af0  HGCrop::GetOutput(HGRenderer*)
//   @Helium 0x247b80  HGCrop::SetParameter(int,float,float,float,float)
//   @Helium 0x247ba0  HGCrop::~HGCrop()                   (D1 base dtor)
//   @Helium 0x247be0  HGCrop::~HGCrop()                   (D0 deleting dtor)
//
// re/disasm:
//   raw-port/re/disasm/Helium.HGCrop.all_methods.s
//
// CLASS LAYOUT recovered from the disassembly:
//   struct HGCrop : HGNode {
//     ...                        // HGNode base fields inherited (>=+0x00..+0x197)
//                                //   +0x00  vtable ptr (rebound to HGCrop vtable
//                                //          @rip+0x7ef12f ~= 0x7ef12f offset table)
//                                //   +0x0c  fourcc / type-id (32-bit; copied from
//                                //          child at @0x247a56..0x247a5a)
//                                //   +0x10  flags (32-bit; AND $0xfffff9ff / OR
//                                //          $0x400 — set node "kind = 0x400" bits;
//                                //          same mask copied from child)
//     HGNode* impl;              // +0x198  owned HGCropNode (allocated by ctor,
//                                //          released by dtor via impl->vtable[0x18]
//                                //          (== HGObject::Release())
//   };
//
// CHILD HGCropNode LAYOUT (referenced but not fully transcribed here — the wrapper
// only ever reads +0x198 and dispatches through the child's vtable):
//   struct HGCropNode : HGNode {
//     ...
//     HGRect  cropRect;   // +0x1a0  16 bytes — the "current crop" (initialized to
//                         //          _HGRectInfinite in the ctor at @0x247a09).
//     ...
//     // vtable slots used by HGCrop wrapper:
//     //   *0x18  HGObject::Release()          (dtor path)
//     //   *0x60  HGCropNode::SetParameter    (wrapper tail-jmps through this)
//     //   *0x78  HGCropNode::SetInput?       (wrapper's GetOutput calls this)
//     //   *0x88  HGCropNode::SetOutput?      (wrapper's GetOutput calls this)
//     //   *0x98  HGNode::GetOutput or similar via base — wrapper reads *0x98 on
//     //          the parent's own vtable to obtain the input/output token; see
//     //          the GetOutput transcription for exact sequence.
//   };
//
// KEY CONSTANT decoded:
//   0x632c058b  (imm at @0x247a1b — stored to child+0xc as the crop node
//               fourcc / type identifier).  As four ASCII bytes (little-endian
//               read from lower byte outward): 0x8b 0x05 0x2c 0x63 — not a
//               printable fourcc; used as an opaque 32-bit type-id by the
//               HGNode subsystem.  Copied to the wrapper's +0xc at @0x247a56.
//
//   0x1b0       (imm at @0x247990's `movl $0x1b0, %edi` — size of HGCropNode
//               passed to HGObject::operator new(unsigned long)).
//
//   $0xfffff9ff / $0x400  — bits 9-10 mask+set used at @0x247993/@0x247a5d on
//               the flags field @+0x10 to force the "node kind" to 0x400
//               (bits 10..11 cleared, then bit 10 set). Same mask on both the
//               child and the wrapper — the wrapper mirrors the child's kind.
//
// RIP-RELATIVE VTABLES (opaque here; addresses recorded for provenance):
//   @0x247a29 = 0x7ef12f rip-relative — HGCrop's initial vtable slot
//               (overwritten in the ctor before the impl swap)
//   @0x247cc  = 0x7eeec5 rip-relative — HGCropNode vtable base
//   @0x2479ff = 0x7ef342 rip-relative — HGCropNode vtable (rebound at @0x247a06)
//   @0x247bad = 0x7eef2b rip-relative — HGCrop D1 vtable (destructor phase)
//   @0x247be9 = 0x7eeee8 rip-relative — HGCrop D0 vtable (destructor phase)
//
// FRONTIER CALLEES (external symbols; declared as throwing stubs — the wrapper
// cannot execute without them, but the port faithfully preserves each callq
// site so a later worker can wire them):
//   __ZN6HGNodeC2Ev           HGNode::HGNode()             @0x24799d, @0x2479c7
//   __ZN8HGObjectnwEm         HGObject::operator new       @0x2479bc
//   __Znwm (libc++)           ::operator new(size_t)       @0x2479db  (buf-alloc)
//   __ZN8HGObject7ReleaseEv   HGObject::Release            @0x247a4a
//   __ZN8HGObjectdlEPv        HGObject::operator delete    @0x247c16
//   __ZN6HGNodeD2Ev           HGNode::~HGNode              @0x247bd1, @0x247c08
//   __ZN10HGRenderer8GetInputEP6HGNodei
//                             HGRenderer::GetInput(HGNode*,int)  @0x247b09
//   The HGCropNode itself and its vtable slots (*0x18, *0x60, *0x78, *0x88,
//   *0x98) are all frontier — see HGCropNode_vt_* stubs below.
//
// PACKED HGRECT ABI: HGRect passes across the (rcx=low8, r8=high8) pair —
// same convention documented in HGCRetimeVariableRez.ts. The wrapper does not
// unpack this itself; it forwards the packed rect via mov instructions
// (@0x247b16/@0x247b31 etc.). We model this in TypeScript with the plain
// HGRect record type.

import type { HGRect } from "./HGRect";
import { HGRectInfinite } from "./HGRect";
import { HGObject_ctor, HGObject_dtor } from "./HGObject_stub";

// ---------------------------------------------------------------------------
// Frontier types (opaque — never dereferenced by HGCrop itself).
// ---------------------------------------------------------------------------

/** HGRenderer* — opaque frontier type. HGCrop::GetOutput takes one but only
 *  passes it to HGRenderer::GetInput and to the child's vtable slots. */
export type HGRenderer = unknown;

/** HGCropNode — the owned implementation object. Not transcribed here; the
 *  wrapper only ever reads +0x198 (the pointer) and dispatches through its
 *  vtable. Modelled as a small structural type with typed vtable slots so
 *  the port compiles cleanly while making the frontier surface explicit. */
export interface HGCropNode {
  // +0x0c  fourcc / type-id (32-bit)
  fourcc: number;
  // +0x10  flags (32-bit)
  flags: number;
  // +0x1a0 cropRect (initialized to HGRectInfinite in the ctor @0x247a09)
  cropRect: HGRect;
  // vtable slots invoked by HGCrop
  vt_release(self: HGCropNode): void;                                         // *0x18
  vt_setParameter(self: HGCropNode, which: number, a: number, b: number, c: number, d: number): void; // *0x60
  vt_setInput(self: HGCropNode, index: number, source: unknown): void;        // *0x78
  vt_setOutput(self: HGCropNode, index: number, token: number): void;         // *0x88
}

// ---------------------------------------------------------------------------
// Frontier stubs (external Helium symbols not yet transcribed).
// ---------------------------------------------------------------------------

/** HGNode::HGNode() — base ctor called at @0x24799d (on `this`) and
 *  @0x2479c7 (on the newly-allocated HGCropNode). Not yet transcribed. */
function HGNode_ctor(_self: object): void {
  throw new Error(
    "HGNode::HGNode() not yet transcribed " +
    "(referenced from HGCrop::HGCrop() C2 @Helium 0x24799d and @Helium 0x2479c7)",
  );
}

/** HGNode::~HGNode() — base dtor tail-jmp/call at @0x247bd1 (D1) and
 *  @0x247c08 (D0). Not yet transcribed. */
function HGNode_dtor(_self: object): void {
  throw new Error(
    "HGNode::~HGNode() not yet transcribed " +
    "(referenced from HGCrop::~HGCrop() D1 @Helium 0x247bd1 and D0 @Helium 0x247c08)",
  );
}

/** HGObject::operator new(size_t) — allocator for HGCropNode
 *  (size=0x1b0). Not yet transcribed. */
function HGObject_operator_new(_size: number): HGCropNode {
  throw new Error(
    "HGObject::operator new(unsigned long) not yet transcribed " +
    "(referenced from HGCrop::HGCrop() @Helium 0x2479bc with size 0x1b0)",
  );
}

/** ::operator new(size_t) (libc++) — allocator for the 32-byte HGCropNode
 *  buffer at @0x2479db (assigned to HGCropNode+0x198 at @0x2479ea). Not
 *  yet transcribed. */
function global_operator_new(_size: number): { xmm0: number; xmm1: number; xmm2: number; xmm3: number } {
  throw new Error(
    "::operator new(unsigned long) (libc++) not yet transcribed " +
    "(referenced from HGCrop::HGCrop() @Helium 0x2479db with size 0x20)",
  );
}

/** HGObject::Release() — reference-decrement / destroy for the impl pointer.
 *  Called through the impl's vtable slot *0x18 at @0x247bc5 / @0x247c02, and
 *  directly at @0x247a4a. Not yet transcribed. */
function HGObject_Release(_self: object): void {
  throw new Error(
    "HGObject::Release() not yet transcribed " +
    "(referenced from HGCrop dtors @Helium 0x247bc5, 0x247c02 via vtable *0x18, " +
    "and directly @Helium 0x247a4a)",
  );
}

/** HGObject::operator delete(void*) — deleter for the HGCrop instance
 *  (@0x247c16 tail-jmp in D0). Not yet transcribed. */
function HGObject_operator_delete(_self: object): void {
  throw new Error(
    "HGObject::operator delete(void*) not yet transcribed " +
    "(referenced from HGCrop::~HGCrop() D0 @Helium 0x247c16)",
  );
}

/** HGRenderer::GetInput(HGNode*, int) — @0x247b09 call site in GetOutput.
 *  Returns something the child's vt_setInput consumes. Not yet transcribed. */
function HGRenderer_GetInput(_renderer: HGRenderer, _node: HGCrop, _idx: number): unknown {
  throw new Error(
    "HGRenderer::GetInput(HGNode*, int) not yet transcribed " +
    "(referenced from HGCrop::GetOutput @Helium 0x247b09)",
  );
}

// ---------------------------------------------------------------------------
// HGCrop
// ---------------------------------------------------------------------------

export class HGCrop {
  // +0x198  owned child (allocated in ctor). Modelled as an owned reference
  // rather than a raw pointer; null-checked in dtors mirroring the asm
  // `testq %rax, %rax; je ...` at @0x247bba / @0x247bfd.
  impl: HGCropNode | null = null;

  // +0x0c  fourcc / type-id (32-bit). Set from child @0x247a56.
  fourcc = 0;

  // +0x10  flags (32-bit). AND $0xfffff9ff | OR $0x400 == force bits 10..11
  // clear then set bit 10. Same mask applied on both child and wrapper.
  flags = 0;

  // -------------------------------------------------------------------------
  // HGCrop::HGCrop() (C2) @Helium 0x247990
  //
  //   pushq %rbp; movq %rsp,%rbp
  //   pushq %r15; pushq %r14; pushq %rbx; pushq %rax                @0x247994
  //   movq %rdi,%rbx                                                @0x24799a
  //   callq HGNode::HGNode()                                        @0x24799d  ; this-> HGNode base
  //   leaq 0x7ef12f(%rip),%rax; movq %rax,(%rbx)                    @0x2479a2  ; vtable = HGCrop's initial
  //   movq $0x0,0x198(%rbx)                                         @0x2479ac  ; impl = nullptr
  //   movl $0x1b0,%edi                                              @0x2479b7  ; sizeof(HGCropNode) = 0x1b0
  //   callq HGObject::operator new(unsigned long)                   @0x2479bc
  //   movq %rax,%r14; movq %rax,%rdi                                @0x2479c1  ; r14 = &new HGCropNode
  //   callq HGNode::HGNode()                                        @0x2479c7  ; base ctor on child
  //   leaq 0x7eeec5(%rip),%rax; movq %rax,(%r14)                    @0x2479cc  ; child->vtable = HGCropNode's base slot
  //   movl $0x20,%edi                                               @0x2479d6  ; 32-byte inner buffer
  //   callq ::operator new(unsigned long)                           @0x2479db
  //   xorps %xmm0,%xmm0                                             @0x2479e0
  //   movaps %xmm0,0x10(%rax); movaps %xmm0,(%rax)                  @0x2479e3  ; zero 32 bytes
  //   movq %rax,0x198(%r14)                                         @0x2479ea  ; child->+0x198 = &buffer
  //   movl $0xfffff9ff,%eax; andl 0x10(%r14),%eax                   @0x2479f1  ; child.flags & 0xfffff9ff
  //   orl $0x400,%eax                                               @0x2479fa  ; ...| 0x400
  //   leaq 0x7ef342(%rip),%rcx; movq %rcx,(%r14)                    @0x2479ff  ; child->vtable rebound to
  //                                                                            ;   HGCropNode's real vtable
  //   leaq _HGRectInfinite(%rip),%rcx                               @0x247a09
  //   movups (%rcx),%xmm0; movups %xmm0,0x1a0(%r14)                 @0x247a10  ; child.cropRect = HGRectInfinite
  //   movl $0x632c058b,0xc(%r14)                                    @0x247a1b  ; child.fourcc = 0x632C058B
  //   movl %eax,0x10(%r14)                                          @0x247a23  ; child.flags = (flags & mask)|0x400
  //   ; --- publish child into wrapper.impl, releasing any prior impl ---
  //   movq 0x198(%rbx),%rdi                                         @0x247a27  ; rdi = wrapper.impl (currently nullptr)
  //   cmpq %r14,%rdi; je 0x247a47                                   @0x247a2e  ; if same, skip release
  //   testq %rdi,%rdi; je 0x247a3e                                  @0x247a33  ; if nullptr, skip release
  //   movq (%rdi),%rax; callq *0x18(%rax)                           @0x247a38  ; old->Release()  (vt *0x18)
  //   movq %r14,0x198(%rbx)                                         @0x247a3e  ; wrapper.impl = new child
  //   jmp 0x247a56                                                  @0x247a45
  //   ; --- the `je` branch (same-pointer) still needs to release the new one? ---
  //   movq %r14,%rdi; callq HGObject::Release()                     @0x247a47  ; new child->Release() (defensive; unreachable
  //                                                                            ;   in practice because wrapper.impl was just
  //                                                                            ;   nullified above — but still emitted by
  //                                                                            ;   clang for the general assignment pattern)
  //   movq 0x198(%rbx),%r14                                         @0x247a4f  ; reload r14 = wrapper.impl
  //   ; --- copy fourcc + flags from child to wrapper ---
  //   movl 0xc(%r14),%eax; movl %eax,0xc(%rbx)                      @0x247a56  ; wrapper.fourcc = child.fourcc
  //   movl $0xfffff9ff,%eax; andl 0x10(%rbx),%eax                   @0x247a5d  ; wrapper.flags & 0xfffff9ff
  //   orl $0x400,%eax; movl %eax,0x10(%rbx)                         @0x247a65  ; ...| 0x400
  //   ; --- epilogue ---
  //   addq $0x8,%rsp; popq %rbx; popq %r14; popq %r15; popq %rbp; retq
  //
  //   Unwind path (@0x247a78..0x247ad0) reverses each partial construction
  //   in order: for exception at HGNode::HGNode on child, call
  //   child->vt[*0x18]() to release; then HGNode::~HGNode on child;
  //   HGObject::operator delete; wrapper.impl release; wrapper HGNode dtor;
  //   _Unwind_Resume. We do NOT model exceptions in this port — the
  //   throwing frontier stubs already halt execution before any partial
  //   state accrues.
  // -------------------------------------------------------------------------
  constructor() {
    // @0x24799d: HGNode base ctor (this)
    HGNode_ctor(this);
    // @0x2479a2..0x2479ac: initial vtable set + impl = nullptr — modelled by
    // the field initializers above (impl = null, fourcc/flags = 0).
    // @0x2479b7..0x2479bc: allocate HGCropNode (size 0x1b0)
    const child: HGCropNode = HGObject_operator_new(0x1b0);
    // @0x2479c7: HGNode base ctor on the new child
    HGNode_ctor(child);
    // @0x2479cc: child->vtable = HGCropNode's base slot (@0x7eeec5 rip)
    //   — modelled implicitly by the HGCropNode structural type.
    // @0x2479d6..0x2479ea: allocate + zero a 32-byte buffer, publish to
    //   child.+0x198. This is HGCropNode's OWN inner storage; the wrapper
    //   never reads it, and the frontier stub throws before we can model it.
    void global_operator_new(0x20);
    // @0x2479f1..0x2479fa: child.flags = (child.flags & 0xfffff9ff) | 0x400
    child.flags = ((child.flags & 0xfffff9ff) | 0x400) >>> 0;
    // @0x2479ff: child->vtable rebound (final HGCropNode vtable)
    //   — implicit above.
    // @0x247a09..0x247a13: child.cropRect = HGRectInfinite (16-byte movups)
    child.cropRect = { ...HGRectInfinite };
    // @0x247a1b: child.fourcc = 0x632C058B
    child.fourcc = 0x632c058b | 0;
    // @0x247a23: writeback of the masked flags — already done via `child.flags = ...` above.
    // @0x247a27..0x247a45: publish child into wrapper.impl, releasing prior
    //   impl (currently nullptr, so the `je 0x247a47` and `testq %rdi,%rdi;
    //   je 0x247a3e` paths both fall through to the "no old release needed"
    //   arm; we still preserve the raw sequence).
    const old = this.impl;
    if (old === child) {
      // @0x247a47..0x247a4a: same-pointer path — release the new one.
      // Practically unreachable from a fresh ctor (old is null), but we
      // mirror the asm's structural choice.
      HGObject_Release(child);
      // @0x247a4f: reload r14 = wrapper.impl (still null in that path)
      // For our TS model we just leave impl as-is.
    } else {
      if (old !== null) {
        // @0x247a38: old->vt_release(old)   (vtable *0x18 == HGObject::Release)
        old.vt_release(old);
      }
      // @0x247a3e: wrapper.impl = new child
      this.impl = child;
    }
    // @0x247a56..0x247a5a: wrapper.fourcc = child.fourcc
    this.fourcc = child.fourcc | 0;
    // @0x247a5d..0x247a6a: wrapper.flags = (wrapper.flags & 0xfffff9ff) | 0x400
    this.flags = ((this.flags & 0xfffff9ff) | 0x400) >>> 0;
    // Preserve provenance of HGObject_stub usage: HGObject_ctor / HGObject_dtor
    // are the alternative base-class ctors/dtors referenced by sibling ports
    // (e.g. HGRenderQueueSetupProperties). HGCrop uses HGNode::HGNode() and
    // HGNode::~HGNode() specifically — the wider HGObject_* pair is imported
    // to keep the module's dependency graph identical to those siblings and
    // to make the base-class frontier obvious to a reader. We call neither
    // here, but the import is intentional (see comments above).
    void HGObject_ctor;
    void HGObject_dtor;
  }

  // -------------------------------------------------------------------------
  // HGCrop::HGCrop() (C1) @Helium 0x247ae0
  //   pushq %rbp; movq %rsp,%rbp; popq %rbp; jmp HGCrop::HGCrop() (C2)
  // A trivial frame-set/pop then tail-jump into C2. In TypeScript the C1/C2
  // distinction collapses into the single `constructor` above, but we keep
  // the site cited for provenance.
  // -------------------------------------------------------------------------

  /**
   * HGCrop::GetOutput(HGRenderer*) @Helium 0x247af0
   *
   *   pushq %rbp; movq %rsp,%rbp; pushq %r14; pushq %rbx             @0x247af0
   *   movq %rdi,%rbx                                                 @0x247af7  ; rbx = this
   *   movq 0x198(%rdi),%r14                                          @0x247afa  ; r14 = this->impl
   *   movq %rsi,%rdi                                                 @0x247b01  ; rdi = HGRenderer*
   *   movq %rbx,%rsi                                                 @0x247b04  ; rsi = this (HGNode*)
   *   xorl %edx,%edx                                                 @0x247b07  ; edx = 0 (input index)
   *   callq HGRenderer::GetInput(HGNode*,int)                        @0x247b09
   *   movq (%r14),%rcx                                               @0x247b0e  ; rcx = impl->vtable
   *   movq %r14,%rdi                                                 @0x247b11  ; rdi = impl
   *   xorl %esi,%esi                                                 @0x247b14  ; esi = 0
   *   movq %rax,%rdx                                                 @0x247b16  ; rdx = GetInput result
   *   callq *0x78(%rcx)                                              @0x247b19  ; impl->vt[*0x78](impl, 0, input0)
   *
   *   movq (%rbx),%rax                                               @0x247b1c  ; rax = this->vtable
   *   movq 0x198(%rbx),%r14                                          @0x247b1f  ; r14 = this->impl (reloaded)
   *   movq %rbx,%rdi                                                 @0x247b26  ; rdi = this
   *   xorl %esi,%esi                                                 @0x247b29  ; esi = 0
   *   callq *0x98(%rax)                                              @0x247b2b  ; this->vt[*0x98](this, 0)  -> token0
   *   movq (%r14),%rcx                                               @0x247b31  ; impl vtable
   *   movq %r14,%rdi                                                 @0x247b34
   *   xorl %esi,%esi                                                 @0x247b37  ; esi = 0
   *   movl %eax,%edx                                                 @0x247b39  ; edx = token0 (i32)
   *   callq *0x88(%rcx)                                              @0x247b3b  ; impl->vt[*0x88](impl, 0, token0)
   *
   *   movq (%rbx),%rax                                               @0x247b41  ; rax = this->vtable
   *   movq 0x198(%rbx),%r14                                          @0x247b44  ; r14 = this->impl (reloaded)
   *   movq %rbx,%rdi                                                 @0x247b4b
   *   movl $0xffffffff,%esi                                          @0x247b4e  ; esi = -1
   *   callq *0x98(%rax)                                              @0x247b53  ; this->vt[*0x98](this, -1) -> tokenAll
   *   movq (%r14),%rcx                                               @0x247b59
   *   movq %r14,%rdi                                                 @0x247b5c
   *   movl $0xffffffff,%esi                                          @0x247b5f  ; esi = -1
   *   movl %eax,%edx                                                 @0x247b64  ; edx = tokenAll
   *   callq *0x88(%rcx)                                              @0x247b66  ; impl->vt[*0x88](impl, -1, tokenAll)
   *
   *   movq 0x198(%rbx),%rax                                          @0x247b6c  ; rax = this->impl (return value)
   *   popq %rbx; popq %r14; popq %rbp; retq                          @0x247b73
   *
   * Semantics: HGCrop::GetOutput forwards the renderer's input(0) into the
   * child's input(0), then re-publishes the wrapper's own output tokens
   * (queried via *0x98 on the wrapper's vtable) into the child's output
   * slots (via *0x88). It does this once for index 0 and once for index -1
   * ("all outputs"). Returns the impl pointer as the effective output node.
   *
   * Vtable slots referenced:
   *   this->vt_getOutputToken  @+0x98   (called with 0 and with -1)
   *   impl.vt_setInput          @+0x78   (called with (0, input0))
   *   impl.vt_setOutput         @+0x88   (called with (0, token0) and (-1, tokenAll))
   *
   * The wrapper's *0x98 slot is HGNode's own output-query — not transcribed
   * here; it's a frontier on `this` (a virtual method on HGCrop itself that
   * we would inherit from HGNode). We model it as a throwing method
   * `vt_getOutputToken` so any caller can see the frontier.
   */
  // Wrapper's own vtable slot *0x98 — not yet transcribed. Called on `this`.
  vt_getOutputToken(_index: number): number {
    throw new Error(
      "HGCrop::vt[*0x98] (HGNode::GetOutputToken?) not yet transcribed " +
      "(referenced from HGCrop::GetOutput @Helium 0x247b2b and @Helium 0x247b53)",
    );
  }

  GetOutput(renderer: HGRenderer): HGCropNode {
    // @0x247afa: r14 = this->impl
    const impl = this.impl;
    if (impl === null) {
      // The asm dereferences impl unconditionally at @0x247b0e (`movq (%r14),%rcx`),
      // so a null impl would fault in FCP; matching that, we raise here.
      throw new Error(
        "HGCrop::GetOutput @Helium 0x247af0 — this->impl is null; asm at " +
        "@0x247b0e unconditionally dereferences it",
      );
    }
    // @0x247b09: input0 = HGRenderer::GetInput(renderer, this, 0)
    const input0 = HGRenderer_GetInput(renderer, this, 0);
    // @0x247b19: impl.vt_setInput(impl, 0, input0)
    impl.vt_setInput(impl, 0, input0);

    // @0x247b2b: token0 = this->vt_getOutputToken(0)
    const token0 = this.vt_getOutputToken(0) | 0;
    // @0x247b3b: impl.vt_setOutput(impl, 0, token0)
    impl.vt_setOutput(impl, 0, token0);

    // @0x247b53: tokenAll = this->vt_getOutputToken(-1)
    const tokenAll = this.vt_getOutputToken(-1) | 0;
    // @0x247b66: impl.vt_setOutput(impl, -1, tokenAll)
    impl.vt_setOutput(impl, -1, tokenAll);

    // @0x247b6c: return this->impl (reloaded, but same value here)
    return this.impl!;
  }

  /**
   * HGCrop::SetParameter(int which, float a, float b, float c, float d)
   *   @Helium 0x247b80
   *
   *   pushq %rbp; movq %rsp,%rbp                                     @0x247b80
   *   movq 0x198(%rdi),%rdi                                          @0x247b84  ; rdi = this->impl
   *   movq (%rdi),%rax                                               @0x247b8b  ; rax = impl->vtable
   *   movq 0x60(%rax),%rax                                           @0x247b8e  ; rax = impl->vt[*0x60]  (== HGCropNode::SetParameter)
   *   popq %rbp; jmpq *%rax                                          @0x247b92  ; tail-jmp; args unchanged
   *
   * Pure vtable forward. The wrapper does NOT read/mutate any of its own
   * state — it hands (which, a, b, c, d) straight to the impl.
   */
  SetParameter(which: number, a: number, b: number, c: number, d: number): void {
    const impl = this.impl;
    if (impl === null) {
      throw new Error(
        "HGCrop::SetParameter @Helium 0x247b80 — this->impl is null; asm at " +
        "@0x247b8b unconditionally dereferences it",
      );
    }
    // @0x247b8e/@0x247b93: tail-jmp impl->vt[*0x60] with the same (which,a,b,c,d).
    impl.vt_setParameter(
      impl,
      which | 0,
      Math.fround(a),
      Math.fround(b),
      Math.fround(c),
      Math.fround(d),
    );
  }

  // -------------------------------------------------------------------------
  // HGCrop::~HGCrop() (D1 base) @Helium 0x247ba0
  //
  //   pushq %rbp; movq %rsp,%rbp; pushq %rbx; pushq %rax             @0x247ba0
  //   leaq 0x7eef2b(%rip),%rax; movq %rax,(%rdi)                     @0x247ba6  ; this->vtable = D1 vtable
  //   movq 0x198(%rdi),%rax                                          @0x247bb0  ; rax = this->impl
  //   testq %rax,%rax; je 0x247bcb                                   @0x247bb7  ; if !impl, skip release
  //   movq (%rax),%rcx                                               @0x247bbc  ; rcx = impl->vtable
  //   movq %rdi,%rbx                                                 @0x247bbf
  //   movq %rax,%rdi                                                 @0x247bc2
  //   callq *0x18(%rcx)                                              @0x247bc5  ; impl->vt[*0x18](impl)  == HGObject::Release
  //   movq %rbx,%rdi                                                 @0x247bc8  ; restore rdi = this
  //   addq $0x8,%rsp; popq %rbx; popq %rbp                           @0x247bcb
  //   jmp HGNode::~HGNode                                            @0x247bd1
  // -------------------------------------------------------------------------
  destroyBase(): void {
    // @0x247ba6: rebind vtable to the D1 (destructor) vtable — modelled
    //   implicitly (the runtime type doesn't change in TS).
    const impl = this.impl;
    if (impl !== null) {
      // @0x247bc5: impl->vt[*0x18](impl) == HGObject::Release()
      impl.vt_release(impl);
    }
    // @0x247bd1: tail-jmp HGNode::~HGNode(this)
    HGNode_dtor(this);
  }

  // -------------------------------------------------------------------------
  // HGCrop::~HGCrop() (D0 deleting) @Helium 0x247be0
  //
  //   pushq %rbp; movq %rsp,%rbp; pushq %rbx; pushq %rax             @0x247be0
  //   movq %rdi,%rbx                                                 @0x247be6
  //   leaq 0x7eeee8(%rip),%rax; movq %rax,(%rdi)                     @0x247be9  ; this->vtable = D0 vtable
  //   movq 0x198(%rdi),%rdi                                          @0x247bf3  ; rdi = this->impl
  //   testq %rdi,%rdi; je 0x247c05                                   @0x247bfa
  //   movq (%rdi),%rax; callq *0x18(%rax)                            @0x247bff  ; impl->Release()
  //   movq %rbx,%rdi                                                 @0x247c05
  //   callq HGNode::~HGNode                                          @0x247c08
  //   movq %rbx,%rdi; addq $0x8,%rsp; popq %rbx; popq %rbp           @0x247c0d
  //   jmp HGObject::operator delete(void*)                           @0x247c16
  // -------------------------------------------------------------------------
  destroyAndDelete(): void {
    // @0x247be9: rebind vtable to D0 vtable — modelled implicitly.
    const impl = this.impl;
    if (impl !== null) {
      // @0x247bff: impl->vt[*0x18](impl)
      impl.vt_release(impl);
    }
    // @0x247c08: HGNode::~HGNode(this)
    HGNode_dtor(this);
    // @0x247c16: HGObject::operator delete(this)
    HGObject_operator_delete(this);
  }
}
