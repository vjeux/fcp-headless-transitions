// HGUnpremultiply.ts — Helium's unpremultiply (premultiplied→straight alpha) render node.
// Faithful transcription of every externally-visible HGUnpremultiply
// method from
//   /Applications/Final Cut Pro.app/Contents/Frameworks/Helium.framework/
//     Versions/A/Helium
//
// Source disassembly (bundled):
//   raw-port/re/disasm/Helium.HGUnpremultiply.all.s
//     C1 @0x157cf0   ; ctor (also exported as C2 @0x157c70 by nm; same body)
//     D2 @0x157d70   ; base-object dtor
//     D1 @0x157db0   ; complete-object dtor
//     D0 @0x157df0   ; deleting dtor
//     GetOutput @0x157e30
//
// nm entries owned by this class (Helium):
//   0x157c70 T HGUnpremultiply::HGUnpremultiply()  [C2]
//   0x157cf0 T HGUnpremultiply::HGUnpremultiply()  [C1]  (transcribed below)
//   0x157d70 T HGUnpremultiply::~HGUnpremultiply() [D2]
//   0x157db0 T HGUnpremultiply::~HGUnpremultiply() [D1]
//   0x157df0 T HGUnpremultiply::~HGUnpremultiply() [D0]
//   0x157e30 T HGUnpremultiply::GetOutput(HGRenderer*)
//
// ---------------------------------------------------------------------------
// Class shape recovered from the ctor / dtors / GetOutput:
//
//   HGUnpremultiply  is-a  HGNode                (C1 opens with
//                                                       callq __ZN6HGNodeC2Ev
//                                                       and every dtor
//                                                       tail-jmps to
//                                                       __ZN6HGNodeD2Ev)
//
//   HGUnpremultiply {
//     +0x000  vptr                                    (set in C1 @0x157d02
//                                                       to `vtable-for-
//                                                       HGUnpremultiply`
//                                                       resident at rip+0x8c86bf
//                                                       — 0x157d09 + 0x8c86bf
//                                                       = 0xa203c8)
//     +0x008..+0x197                                  (HGNode base subobject)
//     +0x198  HgcUnpremultiply* m_hgcNode        (heap-allocated in C1
//                                                       via HGObject::operator
//                                                       new(0x1a0), constructed
//                                                       via HgcUnpremultiply::
//                                                       HgcUnpremultiply()
//                                                       @0x157d1c)
//   }
//
// The 0x1a0-byte allocation @0x157d0c (imm = 0x1A0) is the size of a
// HgcUnpremultiply instance — a raw datum recovered from the ctor's
// literal immediate.
//
// ---------------------------------------------------------------------------
// vtable of the owned HgcUnpremultiply (Helium @0xa445c8 — resolved via
// `raw-port/army/tools/resolve.py Helium vtable HgcUnpremultiply`):
//   *0x00 -> HgcUnpremultiply::~HgcUnpremultiply()  @0x326e20
//   *0x08 -> HgcUnpremultiply::~HgcUnpremultiply()  @0x326e70
//   *0x10 -> HGObject::Retain()                                @0x1a0f20
//   *0x18 -> HGObject::Release()                               @0x1a0f30
//   *0x20 -> HGNode::debugDescription() const                  @0x11c100
//   *0x28 -> HGNode::dotLabel() const                          @0x11c080
//   *0x30 -> HGNode::label_A() const                           @0x11c090
//   *0x38 -> HGNode::label_B() const                           @0x11c0d0
//   *0x40 -> HGNode::info(int, string const&, string const&)   @0x11c0e0
//   *0x48 -> HgcUnpremultiply::shaderDescription() const  @0x326840
//   *0x50 -> HGNode::GetParameterCount()                       @0x11ca50
//   *0x58 -> HGNode::GetParameterName(int)                     @0x11ca60
//   *0x60 -> HgcUnpremultiply::SetParameter(int, float,   @0x326ec0
//                                                 float, float, float)
//   *0x68 -> HgcUnpremultiply::GetParameter(int, float*)  @0x326ed0
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
//   __ZN6HGNodeC2Ev            HGNode::HGNode()             @0x157cfd callq
//   __ZN6HGNodeD2Ev            HGNode::~HGNode()            @0x157d41 (D2 tail),
//                                                            @0x157d54 (unwind),
//                                                            @0x157d99 (D2 jmp),
//                                                            @0x157dd9 (D1 jmp),
//                                                            @0x157e13 (D0 callq)
//   __ZN8HGObjectnwEm          HGObject::operator new(ulong) @0x157d11 callq
//   __ZN8HGObjectdlEPv         HGObject::operator delete    @0x157d39 (unwind),
//                                                            @0x157e21 (D0 jmp)
//   __ZN21HgcUnpremultiplyC1Ev
//                              HgcUnpremultiply ctor    @0x157d1c callq
//   __ZN10HGRenderer8GetInputEP6HGNodei
//                              HGRenderer::GetInput          @0x157e41 callq
//   (vtable) HGNode::SetInput(int, HGNode*)   @Helium 0x11c5f0 via
//                              *0x78(%rcx)                   @0x157e55 callq
//   (vtable) HGObject::Release()              @Helium 0x1a0f30 via
//                              *0x18(%rax)                   @0x157d8d/@0x157dcd/@0x157e0d
//   __Unwind_Resume            (libunwind)                   @0x157d49/@0x157d5c
//
// The class's *math surface* is trivial (there is no per-pixel body at this
// wrapping layer — the pixel work lives in HgcUnpremultiply, which is
// itself a Metal-shader dispatch node). Every method above is a lifetime or
// graph-plumbing operation.
//
// ---------------------------------------------------------------------------
// HGUnpremultiply::HGUnpremultiply()  [C1]              @0x157cf0
//
//   __ZN20HGUnpremultiplyC1Ev:
//     0x157cf0  pushq %rbp / movq %rsp,%rbp / pushq %r15 / pushq %r14
//               pushq %rbx / pushq %rax
//     0x1b8eca  movq  %rdi, %rbx                    ; save this
//     0x157cfd  callq __ZN6HGNodeC2Ev                ; HGNode base ctor
//     0x157d02  leaq  0x8c86bf(%rip), %rax           ; = vtable-for-HGUnpremultiply
//     0x157d09  movq  %rax, (%rbx)                   ; this->vptr = vtable
//     0x157d0c  movl  $0x1a0, %edi                   ; imm = 0x1A0 (sizeof HgcUnpremultiply)
//     0x157d11  callq __ZN8HGObjectnwEm              ; HGObject::operator new(0x1a0)
//     0x157d16  movq  %rax, %r14                     ; %r14 = raw storage
//     0x157d19  movq  %rax, %rdi                     ; arg1 = raw storage
//     0x157d1c  callq __ZN21HgcUnpremultiplyC1Ev
//     0x157d21  movq  %r14, 0x198(%rbx)              ; this->m_hgcNode = %r14
//     0x157d28..0x157d32 pop/ret
//     ; exception-unwind path (op-new succeeded, ctor threw):
//     0x157d33  movq  %rax, %r15                     ; save exception ptr
//     0x157d36  movq  %r14, %rdi
//     0x157d39  callq __ZN8HGObjectdlEPv              ; free the raw storage
//     0x157d3e  movq  %rbx, %rdi
//     0x157d41  callq __ZN6HGNodeD2Ev                 ; unwind base subobject
//     0x157d46  movq  %r15, %rdi
//     0x157d49  callq __Unwind_Resume
//     ; second unwind entry (HGNode base ctor itself threw):
//     0x157d4e  movq  %rax, %r15
//     0x157d51  movq  %rbx, %rdi
//     0x157d54  callq __ZN6HGNodeD2Ev
//     0x157d59  callq __Unwind_Resume
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
// HGUnpremultiply::~HGUnpremultiply()  [D2 — base-object]  @0x157d70
//
//   __ZN20HGUnpremultiplyD2Ev:
//     0x157d70  pushq %rbp / movq %rsp,%rbp / pushq %rbx / pushq %rax
//     0x157d76  movq  %rdi, %rbx
//     0x157d79  leaq  0x8c8648(%rip), %rax           ; = vtable-for-HGUnpremultiply
//     0x157d80  movq  %rax, (%rdi)                   ; this->vptr = vtable
//     0x157d83  movq  0x198(%rdi), %rdi              ; %rdi = m_hgcNode
//     0x157d8a  movq  (%rdi), %rax                   ; %rax = m_hgcNode->vptr
//     0x157d8d  callq *0x18(%rax)                    ; vtable[0x18] = HGObject::Release()
//     0x157d90  movq  %rbx, %rdi
//     0x157d93..0x157d98 pop
//     0x157d99  jmp   __ZN6HGNodeD2Ev                 ; tail-call base D2
//     ; exception-unwind path:
//     0x157d9e  callq ___clang_call_terminate
//
// Semantics: reset vptr to this class's vtable (so any further vcalls resolve
// against this class's slots, not a derived-class overrider), release the
// owned HgcUnpremultiply ref, and chain into HGNode::~HGNode.
//
// ---------------------------------------------------------------------------
// HGUnpremultiply::~HGUnpremultiply()  [D1 — complete-object]  @0x157db0
//
//   __ZN20HGUnpremultiplyD1Ev:
//     0x157db0..0x157dd9  (byte-for-byte identical to D2 above, modulo the
//                         rip-relative vtable displacement 0x8c8608 landing
//                         at the SAME 0xa203c8 — both `leaq` instructions
//                         reference vtable-for-HGUnpremultiply.
//                         0x157db9 + 7 + 0x8c8608 = 0xa203c8 =
//                         0x157d79 + 7 + 0x8c8648.)
//     0x157dd9  jmp __ZN6HGNodeD2Ev
//
// The D1 body is structurally identical to D2 — same reset-vptr, same
// Release on m_hgcNode, same tail-jump into HGNode::~HGNode. In TS the two
// map to the same function.
//
// ---------------------------------------------------------------------------
// HGUnpremultiply::~HGUnpremultiply()  [D0 — deleting]  @0x157df0
//
//   __ZN20HGUnpremultiplyD0Ev:
//     0x157df0  pushq %rbp / movq %rsp,%rbp / pushq %rbx / pushq %rax
//     0x157df6  movq  %rdi, %rbx
//     0x157df9  leaq  0x8c85c8(%rip), %rax           ; = vtable-for-HGUnpremultiply
//     0x157e00  movq  %rax, (%rdi)                   ; this->vptr = vtable
//     0x157e03  movq  0x198(%rdi), %rdi              ; %rdi = m_hgcNode
//     0x157e0a  movq  (%rdi), %rax                   ; %rax = m_hgcNode->vptr
//     0x157e0d  callq *0x18(%rax)                    ; vtable[0x18] = HGObject::Release()
//     0x157e10  movq  %rbx, %rdi
//     0x157e13  callq __ZN6HGNodeD2Ev                 ; HGNode::~HGNode()
//     0x157e18  movq  %rbx, %rdi
//     0x157e1b..0x157e20 pop
//     0x157e21  jmp   __ZN8HGObjectdlEPv              ; TAIL CALL: HGObject::operator delete
//
// Semantics: same as D2 (reset vptr, Release the owned Hgc member, chain
// HGNode::~HGNode) plus a trailing `HGObject::operator delete(this)` to
// return the storage. GC subsumes the tail-jmp in TS.
//
// ---------------------------------------------------------------------------
// HGUnpremultiply::GetOutput(HGRenderer* renderer)             @0x157e30
//
//   __ZN20HGUnpremultiply9GetOutputEP10HGRenderer:
//     0x157e30  pushq %rbp / movq %rsp,%rbp / pushq %rbx / pushq %rax
//     0x157e36  movq  %rdi, %rbx                     ; save this
//     0x157e39  movq  %rsi, %rdi                     ; arg1 = renderer
//     0x157e3c  movq  %rbx, %rsi                     ; arg2 = this (HGNode*)
//     0x157e3f  xorl  %edx, %edx                     ; arg3 = 0        (inputIdx)
//     0x157e41  callq __ZN10HGRenderer8GetInputEP6HGNodei
//     0x157e46  movq  0x198(%rbx), %rdi              ; %rdi = m_hgcNode
//     0x157e4d  movq  (%rdi), %rcx                   ; %rcx = m_hgcNode->vptr
//     0x157e50  xorl  %esi, %esi                     ; arg2 = 0 (input slot idx)
//     0x157e52  movq  %rax, %rdx                     ; arg3 = HGRenderer::GetInput result
//     0x157e55  callq *0x78(%rcx)                    ; vtable[0x78] = HGNode::SetInput
//     0x157e58  movq  0x198(%rbx), %rax              ; return m_hgcNode
//     0x157e5f..0x157e65 pop/ret
//
// Semantics: HGUnpremultiply wraps a HgcUnpremultiply filter node.
// When the render graph asks for HGUnpremultiply's output it:
//   1. asks the renderer for THIS node's input 0
//        (HGRenderer::GetInput(renderer, this, 0))
//   2. wires that upstream node into slot 0 of the owned Hgc filter
//        (m_hgcNode->SetInput(0, upstream))
//   3. returns m_hgcNode — the caller then treats the Hgc as the "output".
//
// This is the universal wrapper-node pattern: HGUnpremultiply is a
// facade that exposes an HGNode identity in the outer graph while delegating
// the actual per-pixel Metal shader dispatch to the owned Hgc filter.

import type { HGRenderer } from "./FFHCopyAlpha";
export type { HGRenderer };

/**
 * Opaque brand for `HGNode*` — the base class every render node inherits
 * from. HGNode itself is a frontier decode (ctor @Helium 0x157cfd, dtor
 * @Helium 0x157d99/0x157dd9/0x157e13 are its cited use sites here). Only
 * the identity is needed at this layer.
 */
export type HGNode = { readonly __brand: "HGNode" };

// ---------------------------------------------------------------------------
// Frontier callee stubs (undecoded) — see file header for cited addresses.
// ---------------------------------------------------------------------------

/**
 * Frontier: `HGNode::HGNode()` — the base subobject ctor called from
 * HGUnpremultiply::C1 @Helium 0x157cfd.
 */
function HGNode_C2(_self: HGUnpremultiply): void {
  // @Helium 0x157cfd callq __ZN6HGNodeC2Ev
  throw new Error(
    "HGNode::HGNode() not yet transcribed " +
      "(frontier callee @Helium 0x157cfd in HGUnpremultiply::C1)",
  );
}

/**
 * Frontier: `HGNode::~HGNode()` — reached from every HGUnpremultiply
 * dtor: D2 tail-jmp @Helium 0x157d99, D1 tail-jmp @Helium 0x157dd9, D0
 * callq @Helium 0x157e13, and both unwind edges @Helium 0x157d41/0x157d54.
 */
function HGNode_D2(_self: HGUnpremultiply): void {
  // @Helium 0x157d99 jmp __ZN6HGNodeD2Ev
  throw new Error(
    "HGNode::~HGNode() not yet transcribed " +
      "(frontier callee @Helium 0x157d99/0x157dd9/0x157e13 in HGUnpremultiply dtors)",
  );
}

/**
 * Frontier: `HgcUnpremultiply::HgcUnpremultiply()` — invoked at
 * @Helium 0x157d1c on a fresh `HGObject::operator new(0x1a0)` allocation.
 * The 0x1a0-byte size is the Hgc filter's sizeof.
 */
function HgcUnpremultiply_C1(_self: HgcUnpremultiply): void {
  // @Helium 0x157d1c callq __ZN21HgcUnpremultiplyC1Ev
  throw new Error(
    "HgcUnpremultiply::HgcUnpremultiply() not yet transcribed " +
      "(frontier callee @Helium 0x157d1c — 0x1a0-byte Metal shader dispatch node)",
  );
}

/**
 * Frontier: `HGObject::Release()` on the owned HgcUnpremultiply.
 * Called from every dtor as `*0x18(%rax)` where `%rax` = m_hgcNode->vptr.
 * The vtable[0x18] slot resolves to `HGObject::Release` @Helium 0x1a0f30
 * (see vtable table in file header). In TS the GC subsumes ref-counting;
 * we cite the address so the destroy chain stays traceable.
 */
function HGObject_Release_hgcNode(_node: HgcUnpremultiply): void {
  // @Helium 0x157d8d / 0x157dcd / 0x157e0d  callq *0x18(%rax)
  //   -> HGObject::Release() @Helium 0x1a0f30 (via HgcUnpremultiply vtable)
  // GC subsumes Release — noop.
}

/**
 * Frontier: `HGRenderer::GetInput(HGNode* node, int inputIdx)` — asks the
 * renderer for the upstream HGNode wired to `node`'s input slot `inputIdx`.
 * Called from GetOutput @Helium 0x157e41 with inputIdx = 0.
 */
function HGRenderer_GetInput(
  _renderer: HGRenderer,
  _node: HGUnpremultiply,
  _inputIdx: number,
): HGNode {
  // @Helium 0x157e41 callq __ZN10HGRenderer8GetInputEP6HGNodei
  throw new Error(
    "HGRenderer::GetInput(HGNode*, int) not yet transcribed " +
      "(frontier callee @Helium 0x157e41 in HGUnpremultiply::GetOutput)",
  );
}

/**
 * Frontier: `HGNode::SetInput(int inputIdx, HGNode* upstream)` — wires
 * `upstream` into `inputIdx` of the receiver. Invoked from GetOutput
 * @Helium 0x157e55 via `*0x78(%rcx)` on m_hgcNode's vtable; the vtable[0x78]
 * slot resolves to `HGNode::SetInput` @Helium 0x11c5f0 (see vtable table).
 */
function HGNode_SetInput(
  _node: HgcUnpremultiply,
  _inputIdx: number,
  _upstream: HGNode,
): void {
  // @Helium 0x157e55 callq *0x78(%rcx)
  //   -> HGNode::SetInput(int, HGNode*) @Helium 0x11c5f0 (via vtable)
  throw new Error(
    "HGNode::SetInput(int, HGNode*) not yet transcribed " +
      "(frontier callee @Helium 0x157e55 in HGUnpremultiply::GetOutput)",
  );
}

/**
 * Opaque brand for the owned HgcUnpremultiply filter (Helium — the
 * pixel-level Metal-shader dispatch node). Its own ctor/dtor/shader is a
 * separate frontier decode; we surface only the identity here so
 * HGUnpremultiply's field-shape and vtable-slot dispatch are exact.
 *
 * sizeof(HgcUnpremultiply) = 0x1a0 bytes (imm literal recovered from
 * HGUnpremultiply::C1 @Helium 0x157d0c).
 */
export type HgcUnpremultiply = {
  readonly __brand: "HgcUnpremultiply";
};

/**
 * `HGUnpremultiply` — Helium wrapper node around a HgcUnpremultiply
 * Metal filter that undoes alpha premultiplication on an image (mapping
 * a premultiplied-alpha RGBA back to straight-alpha RGBA). The exact
 * per-pixel math lives in HgcUnpremultiply's Metal shader — that decode
 * is a separate frontier. This class is a "graph facade": it presents an
 * HGNode identity to the outer render graph and delegates all per-pixel
 * work to the owned Hgc filter.
 *
 * @Helium symbols owned by this class:
 *   C2 @0x157c70 (identical body to C1; both nm entries point at the
 *                 in-place construction sequence in C1)
 *   C1 @0x157cf0
 *   D2 @0x157d70
 *   D1 @0x157db0
 *   D0 @0x157df0
 *   GetOutput @0x157e30
 *
 * Recovered fields:
 *   m_hgcNode — the owned HgcUnpremultiply allocated by
 *   HGObject::operator new(0x1a0) in C1 @Helium 0x157d0c and constructed
 *   in-place at @Helium 0x157d1c. Released by every dtor via vtable[0x18]
 *   (HGObject::Release) @Helium 0x157d8d/0x157dcd/0x157e0d.
 *
 *   @Helium struct offset +0x198
 */
export class HGUnpremultiply {
  /**
   * `this->m_hgcNode` at struct offset +0x198. Populated by C1 @Helium
   * 0x157d21 after `HGObject::operator new(0x1a0)` + in-place
   * `HgcUnpremultiply::HgcUnpremultiply()`.
   */
  m_hgcNode: HgcUnpremultiply | null = null;

  /**
   * HGUnpremultiply::HGUnpremultiply()  [C1]  @Helium 0x157cf0
   * (nm also exposes an identical C2 entry at @Helium 0x157c70.)
   *
   * Mirrored control flow:
   *   @0x157cfd  HGNode::HGNode()                    (base ctor)
   *   @0x157d02..0x157d09  this->vptr = vtable-for-HGUnpremultiply
   *                        (TS has no vptr — noop.)
   *   @0x157d0c..0x157d11  HGObject::operator new(0x1a0)
   *   @0x157d1c            HgcUnpremultiply::HgcUnpremultiply()
   *   @0x157d21            this->m_hgcNode = <new node>
   *
   * The two-entry exception-unwind machinery (@0x157d33..0x157d5c) is a
   * pure C++-ABI artifact: if `HgcUnpremultiply::C1` throws, native
   * code must free the raw storage via `HGObject::operator delete` and
   * unwind the HGNode base via `HGNode::~HGNode` before rethrowing. In TS
   * the subordinate ctors below are throwing stubs, so this file cannot
   * reach the "post-op-new pre-ctor-return" window; the addresses are
   * cited in the header comment for provenance.
   */
  constructor() {
    // @Helium 0x157cfd — base subobject ctor.
    HGNode_C2(this);
    // @Helium 0x157d02..0x157d09 — this->vptr = vtable-for-HGUnpremultiply
    // (0x157d09 + 0x8c86bf = 0xa203c8). TS has no vptr; noop.
    // @Helium 0x157d0c..0x157d11 — HGObject::operator new(0x1a0).
    // GC subsumes storage acquisition; the 0x1a0 size is a datum only.
    const raw = { __brand: "HgcUnpremultiply" } as HgcUnpremultiply;
    // @Helium 0x157d1c — HgcUnpremultiply::HgcUnpremultiply().
    HgcUnpremultiply_C1(raw);
    // @Helium 0x157d21 — this->m_hgcNode = %r14.
    this.m_hgcNode = raw;
  }

  /**
   * HGUnpremultiply::~HGUnpremultiply()  [D2 — base-object]
   * @Helium 0x157d70.
   *
   * Mirrored control flow:
   *   @0x157d79..0x157d80  this->vptr = vtable-for-HGUnpremultiply
   *                        (TS: noop.)
   *   @0x157d83..0x157d8d  HGObject::Release() on m_hgcNode via vtable[0x18]
   *   @0x157d99            jmp HGNode::~HGNode()
   */
  destroy_D2(): void {
    // @Helium 0x157d79..0x157d80 — reset vptr; TS noop.
    if (this.m_hgcNode !== null) {
      // @Helium 0x157d8d callq *0x18(%rax)  -> HGObject::Release @0x1a0f30
      HGObject_Release_hgcNode(this.m_hgcNode);
    }
    // @Helium 0x157d99 jmp __ZN6HGNodeD2Ev — TAIL-call base D2.
    HGNode_D2(this);
  }

  /**
   * HGUnpremultiply::~HGUnpremultiply()  [D1 — complete-object]
   * @Helium 0x157db0.  Structurally identical to D2 (same reset-vptr, same
   * Release on m_hgcNode, same tail-jmp into HGNode::~HGNode) — both nm
   * entries land in a body whose only meaningful difference is a distinct
   * rip displacement that resolves to the SAME vtable-for-HGUnpremultiply
   * at 0xa203c8. See file header.
   */
  destroy_D1(): void {
    // @Helium 0x157db9..0x157dc0 — reset vptr; TS noop.
    if (this.m_hgcNode !== null) {
      // @Helium 0x157dcd callq *0x18(%rax)  -> HGObject::Release @0x1a0f30
      HGObject_Release_hgcNode(this.m_hgcNode);
    }
    // @Helium 0x157dd9 jmp __ZN6HGNodeD2Ev
    HGNode_D2(this);
  }

  /**
   * HGUnpremultiply::~HGUnpremultiply()  [D0 — deleting]
   * @Helium 0x157df0. Same body as D2 plus a trailing
   * `HGObject::operator delete(this)`. GC subsumes the trailing delete.
   *
   * Mirrored control flow:
   *   @0x157df9..0x157e00  this->vptr = vtable-for-HGUnpremultiply (TS: noop)
   *   @0x157e03..0x157e0d  HGObject::Release() on m_hgcNode via vtable[0x18]
   *   @0x157e13            callq HGNode::~HGNode()
   *   @0x157e21            jmp   HGObject::operator delete   (TS: GC subsumes)
   */
  destroy_D0(): void {
    // @Helium 0x157df9..0x157e00 — reset vptr; TS noop.
    if (this.m_hgcNode !== null) {
      // @Helium 0x157e0d callq *0x18(%rax)  -> HGObject::Release @0x1a0f30
      HGObject_Release_hgcNode(this.m_hgcNode);
    }
    // @Helium 0x157e13 callq __ZN6HGNodeD2Ev
    HGNode_D2(this);
    // @Helium 0x157e21 jmp __ZN8HGObjectdlEPv — TS GC subsumes operator delete.
  }

  /**
   * HGUnpremultiply::GetOutput(HGRenderer* renderer)   @Helium 0x157e30
   *
   * Mirrored control flow (see file header for full disassembly):
   *   @0x157e41  input = HGRenderer::GetInput(renderer, this, 0)
   *   @0x157e55  m_hgcNode->SetInput(0, input)         (vtable[0x78])
   *   @0x157e58  return m_hgcNode
   *
   * This is the wrapper-node "output plumbing": we let the renderer pick up
   * our upstream on input slot 0, forward it into the owned Hgc filter's
   * slot 0, then return the Hgc as the "effective output" of this facade.
   * Every call in this method is a frontier callee — GetOutput itself
   * introduces no arithmetic; the pixel work happens inside
   * HgcUnpremultiply's Metal shader.
   */
  GetOutput(renderer: HGRenderer): HgcUnpremultiply {
    // @Helium 0x157e39..0x157e41 — HGRenderer::GetInput(renderer, this, 0)
    const input = HGRenderer_GetInput(renderer, this, 0);
    // @Helium 0x157e46..0x157e55 — m_hgcNode->SetInput(0, input) via vtable[0x78]
    if (this.m_hgcNode === null) {
      // Ctor guarantees non-null via C1 @Helium 0x157d21; if the ctor's
      // frontier callees ever succeed this branch is dead. Kept as an
      // explicit raise-on-invariant-violation so the failure is loud.
      throw new Error(
        "HGUnpremultiply::GetOutput invariant broken: m_hgcNode null " +
          "(should be set by C1 @Helium 0x157d21)",
      );
    }
    HGNode_SetInput(this.m_hgcNode, 0, input);
    // @Helium 0x157e58 — return this->m_hgcNode.
    return this.m_hgcNode;
  }
}
