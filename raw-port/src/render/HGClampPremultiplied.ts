// HGClampPremultiplied.ts — Helium's premultiplied-alpha clamp render node.
// Faithful transcription of every externally-visible HGClampPremultiplied
// method from
//   /Applications/Final Cut Pro.app/Contents/Frameworks/Helium.framework/
//     Versions/A/Helium
//
// Source disassembly (bundled):
//   raw-port/re/disasm/Helium.HGClampPremultiplied.all.s
//     C1 @0x1b8ec0   ; ctor (also exported as C2 @0x1b8e40 by nm; same body)
//     D2 @0x1b8f40   ; base-object dtor
//     D1 @0x1b8f80   ; complete-object dtor
//     D0 @0x1b8fc0   ; deleting dtor
//     GetOutput @0x1b9000
//
// nm entries owned by this class (Helium):
//   0x1b8e40 T HGClampPremultiplied::HGClampPremultiplied()  [C2]
//   0x1b8ec0 T HGClampPremultiplied::HGClampPremultiplied()  [C1]  (transcribed below)
//   0x1b8f40 T HGClampPremultiplied::~HGClampPremultiplied() [D2]
//   0x1b8f80 T HGClampPremultiplied::~HGClampPremultiplied() [D1]
//   0x1b8fc0 T HGClampPremultiplied::~HGClampPremultiplied() [D0]
//   0x1b9000 T HGClampPremultiplied::GetOutput(HGRenderer*)
//
// ---------------------------------------------------------------------------
// Class shape recovered from the ctor / dtors / GetOutput:
//
//   HGClampPremultiplied  is-a  HGNode                (C1 opens with
//                                                       callq __ZN6HGNodeC2Ev
//                                                       and every dtor
//                                                       tail-jmps to
//                                                       __ZN6HGNodeD2Ev)
//
//   HGClampPremultiplied {
//     +0x000  vptr                                    (set in C1 @0x1b8ed2
//                                                       to `vtable-for-
//                                                       HGClampPremultiplied`
//                                                       resident at rip+0x86e3ff
//                                                       — 0x1b8ed9 + 0x86e3ff
//                                                       = 0xa272d8)
//     +0x008..+0x197                                  (HGNode base subobject)
//     +0x198  HgcClampPremultiplied* m_hgcNode        (heap-allocated in C1
//                                                       via HGObject::operator
//                                                       new(0x1a0), constructed
//                                                       via HgcClampPremultiplied::
//                                                       HgcClampPremultiplied()
//                                                       @0x1b8eec)
//   }
//
// The 0x1a0-byte allocation @0x1b8edc (imm = 0x1A0) is the size of a
// HgcClampPremultiplied instance — a raw datum recovered from the ctor's
// literal immediate.
//
// ---------------------------------------------------------------------------
// vtable of the owned HgcClampPremultiplied (Helium @0xa445c8 — resolved via
// `raw-port/army/tools/resolve.py Helium vtable HgcClampPremultiplied`):
//   *0x00 -> HgcClampPremultiplied::~HgcClampPremultiplied()  @0x326e20
//   *0x08 -> HgcClampPremultiplied::~HgcClampPremultiplied()  @0x326e70
//   *0x10 -> HGObject::Retain()                                @0x1a0f20
//   *0x18 -> HGObject::Release()                               @0x1a0f30
//   *0x20 -> HGNode::debugDescription() const                  @0x11c100
//   *0x28 -> HGNode::dotLabel() const                          @0x11c080
//   *0x30 -> HGNode::label_A() const                           @0x11c090
//   *0x38 -> HGNode::label_B() const                           @0x11c0d0
//   *0x40 -> HGNode::info(int, string const&, string const&)   @0x11c0e0
//   *0x48 -> HgcClampPremultiplied::shaderDescription() const  @0x326840
//   *0x50 -> HGNode::GetParameterCount()                       @0x11ca50
//   *0x58 -> HGNode::GetParameterName(int)                     @0x11ca60
//   *0x60 -> HgcClampPremultiplied::SetParameter(int, float,   @0x326ec0
//                                                 float, float, float)
//   *0x68 -> HgcClampPremultiplied::GetParameter(int, float*)  @0x326ed0
//   *0x70 -> HGNode::GetNumInputs()                            @0x11c8a0
//   *0x78 -> HGNode::SetInput(int, HGNode*)                    @0x11c5f0
//   *0x80 -> HGNode::GetInput(int)                             @0x11c8b0
//
// Two slots matter for the transcribed bodies:
//   *0x18 (HGObject::Release) — invoked from all three dtors on m_hgcNode.
//   *0x78 (HGNode::SetInput)  — invoked from GetOutput on m_hgcNode.
//
// ---------------------------------------------------------------------------
// Frontier callees (undecoded — throwing stubs cite them):
//   __ZN6HGNodeC2Ev            HGNode::HGNode()             @0x1b8ecd callq
//   __ZN6HGNodeD2Ev            HGNode::~HGNode()            @0x1b8f11 (D2 tail),
//                                                            @0x1b8f24 (unwind),
//                                                            @0x1b8f69 (D2 jmp),
//                                                            @0x1b8fa9 (D1 jmp),
//                                                            @0x1b8fe3 (D0 callq)
//   __ZN8HGObjectnwEm          HGObject::operator new(ulong) @0x1b8ee1 callq
//   __ZN8HGObjectdlEPv         HGObject::operator delete    @0x1b8f09 (unwind),
//                                                            @0x1b8ff1 (D0 jmp)
//   __ZN21HgcClampPremultipliedC1Ev
//                              HgcClampPremultiplied ctor    @0x1b8eec callq
//   __ZN10HGRenderer8GetInputEP6HGNodei
//                              HGRenderer::GetInput          @0x1b9011 callq
//   (vtable) HGNode::SetInput(int, HGNode*)   @Helium 0x11c5f0 via
//                              *0x78(%rcx)                   @0x1b9025 callq
//   (vtable) HGObject::Release()              @Helium 0x1a0f30 via
//                              *0x18(%rax)                   @0x1b8f5d/@0x1b8f9d/@0x1b8fdd
//   __Unwind_Resume            (libunwind)                   @0x1b8f19/@0x1b8f2c
//
// The class's *math surface* is trivial (there is no per-pixel body at this
// wrapping layer — the pixel work lives in HgcClampPremultiplied, which is
// itself a Metal-shader dispatch node). Every method above is a lifetime or
// graph-plumbing operation.
//
// ---------------------------------------------------------------------------
// HGClampPremultiplied::HGClampPremultiplied()  [C1]              @0x1b8ec0
//
//   __ZN20HGClampPremultipliedC1Ev:
//     0x1b8ec0  pushq %rbp / movq %rsp,%rbp / pushq %r15 / pushq %r14
//               pushq %rbx / pushq %rax
//     0x1b8eca  movq  %rdi, %rbx                    ; save this
//     0x1b8ecd  callq __ZN6HGNodeC2Ev                ; HGNode base ctor
//     0x1b8ed2  leaq  0x86e3ff(%rip), %rax           ; = vtable-for-HGClampPremultiplied
//     0x1b8ed9  movq  %rax, (%rbx)                   ; this->vptr = vtable
//     0x1b8edc  movl  $0x1a0, %edi                   ; imm = 0x1A0 (sizeof HgcClampPremultiplied)
//     0x1b8ee1  callq __ZN8HGObjectnwEm              ; HGObject::operator new(0x1a0)
//     0x1b8ee6  movq  %rax, %r14                     ; %r14 = raw storage
//     0x1b8ee9  movq  %rax, %rdi                     ; arg1 = raw storage
//     0x1b8eec  callq __ZN21HgcClampPremultipliedC1Ev
//     0x1b8ef1  movq  %r14, 0x198(%rbx)              ; this->m_hgcNode = %r14
//     0x1b8ef8..0x1b8f02 pop/ret
//     ; exception-unwind path (op-new succeeded, ctor threw):
//     0x1b8f03  movq  %rax, %r15                     ; save exception ptr
//     0x1b8f06  movq  %r14, %rdi
//     0x1b8f09  callq __ZN8HGObjectdlEPv              ; free the raw storage
//     0x1b8f0e  movq  %rbx, %rdi
//     0x1b8f11  callq __ZN6HGNodeD2Ev                 ; unwind base subobject
//     0x1b8f16  movq  %r15, %rdi
//     0x1b8f19  callq __Unwind_Resume
//     ; second unwind entry (HGNode base ctor itself threw):
//     0x1b8f1e  movq  %rax, %r15
//     0x1b8f21  movq  %rbx, %rdi
//     0x1b8f24  callq __ZN6HGNodeD2Ev
//     0x1b8f29  callq __Unwind_Resume
//
// TS transcription note: the exception-unwind bookkeeping (HGObject::operator
// delete + HGNode::~HGNode + __Unwind_Resume) is meaningful in native land
// only because C++ requires it if a subordinate ctor throws. In TS the two
// subordinate ctors below are throwing stubs (they never "succeed", so the
// unwind edge is never legitimately reached), and GC subsumes operator
// delete anyway. We surface the addresses and semantics in comments; the TS
// body just mirrors the happy path.
//
// ---------------------------------------------------------------------------
// HGClampPremultiplied::~HGClampPremultiplied()  [D2 — base-object]  @0x1b8f40
//
//   __ZN20HGClampPremultipliedD2Ev:
//     0x1b8f40  pushq %rbp / movq %rsp,%rbp / pushq %rbx / pushq %rax
//     0x1b8f46  movq  %rdi, %rbx
//     0x1b8f49  leaq  0x86e388(%rip), %rax           ; = vtable-for-HGClampPremultiplied
//     0x1b8f50  movq  %rax, (%rdi)                   ; this->vptr = vtable
//     0x1b8f53  movq  0x198(%rdi), %rdi              ; %rdi = m_hgcNode
//     0x1b8f5a  movq  (%rdi), %rax                   ; %rax = m_hgcNode->vptr
//     0x1b8f5d  callq *0x18(%rax)                    ; vtable[0x18] = HGObject::Release()
//     0x1b8f60  movq  %rbx, %rdi
//     0x1b8f63..0x1b8f68 pop
//     0x1b8f69  jmp   __ZN6HGNodeD2Ev                 ; tail-call base D2
//     ; exception-unwind path:
//     0x1b8f6e  callq ___clang_call_terminate
//
// Semantics: reset vptr to this class's vtable (so any further vcalls resolve
// against this class's slots, not a derived-class overrider), release the
// owned HgcClampPremultiplied ref, and chain into HGNode::~HGNode.
//
// ---------------------------------------------------------------------------
// HGClampPremultiplied::~HGClampPremultiplied()  [D1 — complete-object]  @0x1b8f80
//
//   __ZN20HGClampPremultipliedD1Ev:
//     0x1b8f80..0x1b8fa9  (byte-for-byte identical to D2 above, modulo the
//                         rip-relative vtable displacement 0x86e348 landing
//                         at the SAME 0xa272d8 — both `leaq` instructions
//                         reference vtable-for-HGClampPremultiplied.
//                         0x1b8f89 + 7 + 0x86e348 = 0xa272d8 =
//                         0x1b8f49 + 7 + 0x86e388.)
//     0x1b8fa9  jmp __ZN6HGNodeD2Ev
//
// The D1 body is structurally identical to D2 — same reset-vptr, same
// Release on m_hgcNode, same tail-jump into HGNode::~HGNode. In TS the two
// map to the same function.
//
// ---------------------------------------------------------------------------
// HGClampPremultiplied::~HGClampPremultiplied()  [D0 — deleting]  @0x1b8fc0
//
//   __ZN20HGClampPremultipliedD0Ev:
//     0x1b8fc0  pushq %rbp / movq %rsp,%rbp / pushq %rbx / pushq %rax
//     0x1b8fc6  movq  %rdi, %rbx
//     0x1b8fc9  leaq  0x86e308(%rip), %rax           ; = vtable-for-HGClampPremultiplied
//     0x1b8fd0  movq  %rax, (%rdi)                   ; this->vptr = vtable
//     0x1b8fd3  movq  0x198(%rdi), %rdi              ; %rdi = m_hgcNode
//     0x1b8fda  movq  (%rdi), %rax                   ; %rax = m_hgcNode->vptr
//     0x1b8fdd  callq *0x18(%rax)                    ; vtable[0x18] = HGObject::Release()
//     0x1b8fe0  movq  %rbx, %rdi
//     0x1b8fe3  callq __ZN6HGNodeD2Ev                 ; HGNode::~HGNode()
//     0x1b8fe8  movq  %rbx, %rdi
//     0x1b8feb..0x1b8ff0 pop
//     0x1b8ff1  jmp   __ZN8HGObjectdlEPv              ; TAIL CALL: HGObject::operator delete
//
// Semantics: same as D2 (reset vptr, Release the owned Hgc member, chain
// HGNode::~HGNode) plus a trailing `HGObject::operator delete(this)` to
// return the storage. GC subsumes the tail-jmp in TS.
//
// ---------------------------------------------------------------------------
// HGClampPremultiplied::GetOutput(HGRenderer* renderer)             @0x1b9000
//
//   __ZN20HGClampPremultiplied9GetOutputEP10HGRenderer:
//     0x1b9000  pushq %rbp / movq %rsp,%rbp / pushq %rbx / pushq %rax
//     0x1b9006  movq  %rdi, %rbx                     ; save this
//     0x1b9009  movq  %rsi, %rdi                     ; arg1 = renderer
//     0x1b900c  movq  %rbx, %rsi                     ; arg2 = this (HGNode*)
//     0x1b900f  xorl  %edx, %edx                     ; arg3 = 0        (inputIdx)
//     0x1b9011  callq __ZN10HGRenderer8GetInputEP6HGNodei
//     0x1b9016  movq  0x198(%rbx), %rdi              ; %rdi = m_hgcNode
//     0x1b901d  movq  (%rdi), %rcx                   ; %rcx = m_hgcNode->vptr
//     0x1b9020  xorl  %esi, %esi                     ; arg2 = 0 (input slot idx)
//     0x1b9022  movq  %rax, %rdx                     ; arg3 = HGRenderer::GetInput result
//     0x1b9025  callq *0x78(%rcx)                    ; vtable[0x78] = HGNode::SetInput
//     0x1b9028  movq  0x198(%rbx), %rax              ; return m_hgcNode
//     0x1b902f..0x1b9035 pop/ret
//
// Semantics: HGClampPremultiplied wraps a HgcClampPremultiplied filter node.
// When the render graph asks for HGClampPremultiplied's output it:
//   1. asks the renderer for THIS node's input 0
//        (HGRenderer::GetInput(renderer, this, 0))
//   2. wires that upstream node into slot 0 of the owned Hgc filter
//        (m_hgcNode->SetInput(0, upstream))
//   3. returns m_hgcNode — the caller then treats the Hgc as the "output".
//
// This is the universal wrapper-node pattern: HGClampPremultiplied is a
// facade that exposes an HGNode identity in the outer graph while delegating
// the actual per-pixel Metal shader dispatch to the owned Hgc filter.

import type { HGRenderer } from "./FFHCopyAlpha";
export type { HGRenderer };

/**
 * Opaque brand for `HGNode*` — the base class every render node inherits
 * from. HGNode itself is a frontier decode (ctor @Helium 0x1b8ecd, dtor
 * @Helium 0x1b8f69/0x1b8fa9/0x1b8fe3 are its cited use sites here). Only
 * the identity is needed at this layer.
 */
export type HGNode = { readonly __brand: "HGNode" };

// ---------------------------------------------------------------------------
// Frontier callee stubs (undecoded) — see file header for cited addresses.
// ---------------------------------------------------------------------------

/**
 * Frontier: `HGNode::HGNode()` — the base subobject ctor called from
 * HGClampPremultiplied::C1 @Helium 0x1b8ecd.
 */
function HGNode_C2(_self: HGClampPremultiplied): void {
  // @Helium 0x1b8ecd callq __ZN6HGNodeC2Ev
  throw new Error(
    "HGNode::HGNode() not yet transcribed " +
      "(frontier callee @Helium 0x1b8ecd in HGClampPremultiplied::C1)",
  );
}

/**
 * Frontier: `HGNode::~HGNode()` — reached from every HGClampPremultiplied
 * dtor: D2 tail-jmp @Helium 0x1b8f69, D1 tail-jmp @Helium 0x1b8fa9, D0
 * callq @Helium 0x1b8fe3, and both unwind edges @Helium 0x1b8f11/0x1b8f24.
 */
function HGNode_D2(_self: HGClampPremultiplied): void {
  // @Helium 0x1b8f69 jmp __ZN6HGNodeD2Ev
  throw new Error(
    "HGNode::~HGNode() not yet transcribed " +
      "(frontier callee @Helium 0x1b8f69/0x1b8fa9/0x1b8fe3 in HGClampPremultiplied dtors)",
  );
}

/**
 * Frontier: `HgcClampPremultiplied::HgcClampPremultiplied()` — invoked at
 * @Helium 0x1b8eec on a fresh `HGObject::operator new(0x1a0)` allocation.
 * The 0x1a0-byte size is the Hgc filter's sizeof.
 */
function HgcClampPremultiplied_C1(_self: HgcClampPremultiplied): void {
  // @Helium 0x1b8eec callq __ZN21HgcClampPremultipliedC1Ev
  throw new Error(
    "HgcClampPremultiplied::HgcClampPremultiplied() not yet transcribed " +
      "(frontier callee @Helium 0x1b8eec — 0x1a0-byte Metal shader dispatch node)",
  );
}

/**
 * Frontier: `HGObject::Release()` on the owned HgcClampPremultiplied.
 * Called from every dtor as `*0x18(%rax)` where `%rax` = m_hgcNode->vptr.
 * The vtable[0x18] slot resolves to `HGObject::Release` @Helium 0x1a0f30
 * (see vtable table in file header). In TS the GC subsumes ref-counting;
 * we cite the address so the destroy chain stays traceable.
 */
function HGObject_Release_hgcNode(_node: HgcClampPremultiplied): void {
  // @Helium 0x1b8f5d / 0x1b8f9d / 0x1b8fdd  callq *0x18(%rax)
  //   -> HGObject::Release() @Helium 0x1a0f30 (via HgcClampPremultiplied vtable)
  // GC subsumes Release — noop.
}

/**
 * Frontier: `HGRenderer::GetInput(HGNode* node, int inputIdx)` — asks the
 * renderer for the upstream HGNode wired to `node`'s input slot `inputIdx`.
 * Called from GetOutput @Helium 0x1b9011 with inputIdx = 0.
 */
function HGRenderer_GetInput(
  _renderer: HGRenderer,
  _node: HGClampPremultiplied,
  _inputIdx: number,
): HGNode {
  // @Helium 0x1b9011 callq __ZN10HGRenderer8GetInputEP6HGNodei
  throw new Error(
    "HGRenderer::GetInput(HGNode*, int) not yet transcribed " +
      "(frontier callee @Helium 0x1b9011 in HGClampPremultiplied::GetOutput)",
  );
}

/**
 * Frontier: `HGNode::SetInput(int inputIdx, HGNode* upstream)` — wires
 * `upstream` into `inputIdx` of the receiver. Invoked from GetOutput
 * @Helium 0x1b9025 via `*0x78(%rcx)` on m_hgcNode's vtable; the vtable[0x78]
 * slot resolves to `HGNode::SetInput` @Helium 0x11c5f0 (see vtable table).
 */
function HGNode_SetInput(
  _node: HgcClampPremultiplied,
  _inputIdx: number,
  _upstream: HGNode,
): void {
  // @Helium 0x1b9025 callq *0x78(%rcx)
  //   -> HGNode::SetInput(int, HGNode*) @Helium 0x11c5f0 (via vtable)
  throw new Error(
    "HGNode::SetInput(int, HGNode*) not yet transcribed " +
      "(frontier callee @Helium 0x1b9025 in HGClampPremultiplied::GetOutput)",
  );
}

/**
 * Opaque brand for the owned HgcClampPremultiplied filter (Helium — the
 * pixel-level Metal-shader dispatch node). Its own ctor/dtor/shader is a
 * separate frontier decode; we surface only the identity here so
 * HGClampPremultiplied's field-shape and vtable-slot dispatch are exact.
 *
 * sizeof(HgcClampPremultiplied) = 0x1a0 bytes (imm literal recovered from
 * HGClampPremultiplied::C1 @Helium 0x1b8edc).
 */
export type HgcClampPremultiplied = {
  readonly __brand: "HgcClampPremultiplied";
};

/**
 * `HGClampPremultiplied` — Helium wrapper node around a HgcClampPremultiplied
 * Metal filter that clamps a premultiplied-alpha image (i.e. ensures
 * R,G,B <= A per-pixel and R,G,B,A within [0,1]).  This class is a
 * "graph facade": it presents an HGNode identity to the outer render graph
 * and delegates all per-pixel work to the owned Hgc filter.
 *
 * @Helium symbols owned by this class:
 *   C2 @0x1b8e40 (identical body to C1; both nm entries point at the
 *                 in-place construction sequence in C1)
 *   C1 @0x1b8ec0
 *   D2 @0x1b8f40
 *   D1 @0x1b8f80
 *   D0 @0x1b8fc0
 *   GetOutput @0x1b9000
 *
 * Recovered fields:
 *   m_hgcNode — the owned HgcClampPremultiplied allocated by
 *   HGObject::operator new(0x1a0) in C1 @Helium 0x1b8edc and constructed
 *   in-place at @Helium 0x1b8eec. Released by every dtor via vtable[0x18]
 *   (HGObject::Release) @Helium 0x1b8f5d/0x1b8f9d/0x1b8fdd.
 *
 *   @Helium struct offset +0x198
 */
export class HGClampPremultiplied {
  /**
   * `this->m_hgcNode` at struct offset +0x198. Populated by C1 @Helium
   * 0x1b8ef1 after `HGObject::operator new(0x1a0)` + in-place
   * `HgcClampPremultiplied::HgcClampPremultiplied()`.
   */
  m_hgcNode: HgcClampPremultiplied | null = null;

  /**
   * HGClampPremultiplied::HGClampPremultiplied()  [C1]  @Helium 0x1b8ec0
   * (nm also exposes an identical C2 entry at @Helium 0x1b8e40.)
   *
   * Mirrored control flow:
   *   @0x1b8ecd  HGNode::HGNode()                    (base ctor)
   *   @0x1b8ed2..0x1b8ed9  this->vptr = vtable-for-HGClampPremultiplied
   *                        (TS has no vptr — noop.)
   *   @0x1b8edc..0x1b8ee1  HGObject::operator new(0x1a0)
   *   @0x1b8eec            HgcClampPremultiplied::HgcClampPremultiplied()
   *   @0x1b8ef1            this->m_hgcNode = <new node>
   *
   * The two-entry exception-unwind machinery (@0x1b8f03..0x1b8f2c) is a
   * pure C++-ABI artifact: if `HgcClampPremultiplied::C1` throws, native
   * code must free the raw storage via `HGObject::operator delete` and
   * unwind the HGNode base via `HGNode::~HGNode` before rethrowing. In TS
   * the subordinate ctors below are throwing stubs, so this file cannot
   * reach the "post-op-new pre-ctor-return" window; the addresses are
   * cited in the header comment for provenance.
   */
  constructor() {
    // @Helium 0x1b8ecd — base subobject ctor.
    HGNode_C2(this);
    // @Helium 0x1b8ed2..0x1b8ed9 — this->vptr = vtable-for-HGClampPremultiplied
    // (0x1b8ed9 + 0x86e3ff = 0xa272d8). TS has no vptr; noop.
    // @Helium 0x1b8edc..0x1b8ee1 — HGObject::operator new(0x1a0).
    // GC subsumes storage acquisition; the 0x1a0 size is a datum only.
    const raw = { __brand: "HgcClampPremultiplied" } as HgcClampPremultiplied;
    // @Helium 0x1b8eec — HgcClampPremultiplied::HgcClampPremultiplied().
    HgcClampPremultiplied_C1(raw);
    // @Helium 0x1b8ef1 — this->m_hgcNode = %r14.
    this.m_hgcNode = raw;
  }

  /**
   * HGClampPremultiplied::~HGClampPremultiplied()  [D2 — base-object]
   * @Helium 0x1b8f40.
   *
   * Mirrored control flow:
   *   @0x1b8f49..0x1b8f50  this->vptr = vtable-for-HGClampPremultiplied
   *                        (TS: noop.)
   *   @0x1b8f53..0x1b8f5d  HGObject::Release() on m_hgcNode via vtable[0x18]
   *   @0x1b8f69            jmp HGNode::~HGNode()
   */
  destroy_D2(): void {
    // @Helium 0x1b8f49..0x1b8f50 — reset vptr; TS noop.
    if (this.m_hgcNode !== null) {
      // @Helium 0x1b8f5d callq *0x18(%rax)  -> HGObject::Release @0x1a0f30
      HGObject_Release_hgcNode(this.m_hgcNode);
    }
    // @Helium 0x1b8f69 jmp __ZN6HGNodeD2Ev — TAIL-call base D2.
    HGNode_D2(this);
  }

  /**
   * HGClampPremultiplied::~HGClampPremultiplied()  [D1 — complete-object]
   * @Helium 0x1b8f80.  Structurally identical to D2 (same reset-vptr, same
   * Release on m_hgcNode, same tail-jmp into HGNode::~HGNode) — both nm
   * entries land in a body whose only meaningful difference is a distinct
   * rip displacement that resolves to the SAME vtable-for-HGClampPremultiplied
   * at 0xa272d8. See file header.
   */
  destroy_D1(): void {
    // @Helium 0x1b8f89..0x1b8f90 — reset vptr; TS noop.
    if (this.m_hgcNode !== null) {
      // @Helium 0x1b8f9d callq *0x18(%rax)  -> HGObject::Release @0x1a0f30
      HGObject_Release_hgcNode(this.m_hgcNode);
    }
    // @Helium 0x1b8fa9 jmp __ZN6HGNodeD2Ev
    HGNode_D2(this);
  }

  /**
   * HGClampPremultiplied::~HGClampPremultiplied()  [D0 — deleting]
   * @Helium 0x1b8fc0. Same body as D2 plus a trailing
   * `HGObject::operator delete(this)`. GC subsumes the trailing delete.
   *
   * Mirrored control flow:
   *   @0x1b8fc9..0x1b8fd0  this->vptr = vtable-for-HGClampPremultiplied (TS: noop)
   *   @0x1b8fd3..0x1b8fdd  HGObject::Release() on m_hgcNode via vtable[0x18]
   *   @0x1b8fe3            callq HGNode::~HGNode()
   *   @0x1b8ff1            jmp   HGObject::operator delete   (TS: GC subsumes)
   */
  destroy_D0(): void {
    // @Helium 0x1b8fc9..0x1b8fd0 — reset vptr; TS noop.
    if (this.m_hgcNode !== null) {
      // @Helium 0x1b8fdd callq *0x18(%rax)  -> HGObject::Release @0x1a0f30
      HGObject_Release_hgcNode(this.m_hgcNode);
    }
    // @Helium 0x1b8fe3 callq __ZN6HGNodeD2Ev
    HGNode_D2(this);
    // @Helium 0x1b8ff1 jmp __ZN8HGObjectdlEPv — TS GC subsumes operator delete.
  }

  /**
   * HGClampPremultiplied::GetOutput(HGRenderer* renderer)   @Helium 0x1b9000
   *
   * Mirrored control flow (see file header for full disassembly):
   *   @0x1b9011  input = HGRenderer::GetInput(renderer, this, 0)
   *   @0x1b9025  m_hgcNode->SetInput(0, input)         (vtable[0x78])
   *   @0x1b9028  return m_hgcNode
   *
   * This is the wrapper-node "output plumbing": we let the renderer pick up
   * our upstream on input slot 0, forward it into the owned Hgc filter's
   * slot 0, then return the Hgc as the "effective output" of this facade.
   * Every call in this method is a frontier callee — GetOutput itself
   * introduces no arithmetic; the pixel work happens inside
   * HgcClampPremultiplied's Metal shader.
   */
  GetOutput(renderer: HGRenderer): HgcClampPremultiplied {
    // @Helium 0x1b9009..0x1b9011 — HGRenderer::GetInput(renderer, this, 0)
    const input = HGRenderer_GetInput(renderer, this, 0);
    // @Helium 0x1b9016..0x1b9025 — m_hgcNode->SetInput(0, input) via vtable[0x78]
    if (this.m_hgcNode === null) {
      // Ctor guarantees non-null via C1 @Helium 0x1b8ef1; if the ctor's
      // frontier callees ever succeed this branch is dead. Kept as an
      // explicit raise-on-invariant-violation so the failure is loud.
      throw new Error(
        "HGClampPremultiplied::GetOutput invariant broken: m_hgcNode null " +
          "(should be set by C1 @Helium 0x1b8ef1)",
      );
    }
    HGNode_SetInput(this.m_hgcNode, 0, input);
    // @Helium 0x1b9028 — return this->m_hgcNode.
    return this.m_hgcNode;
  }
}
