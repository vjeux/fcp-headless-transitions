// HGMix.ts — Helium's mixer (2-input crossfade/blend) render node.
// Faithful transcription of every externally-visible HGMix method from
//   /Applications/Final Cut Pro.app/Contents/Frameworks/Helium.framework/
//     Versions/A/Helium
//
// Source disassembly (bundled):
//   raw-port/re/disasm/Helium.HGMix.C2.s         (C2 @0xa6d30 — main body)
//   raw-port/re/disasm/Helium.HGMix.SetParameter.s (@0xa6e20)
//   raw-port/re/disasm/Helium.HGMix.GetOutput.s    (@0xa6e50)
//
// nm entries owned by this class (Helium):
//   0xa6d30 T HGMix::HGMix()                       [C2]  (transcribed below)
//   0xa6e10 T HGMix::HGMix()                       [C1]  (2-instr trampoline
//                                                        that tail-jmps to C2)
//   0xa6e20 T HGMix::SetParameter(int, float, float, float, float)
//   0xa6e50 T HGMix::GetOutput(HGRenderer*)
//   0xa6eb0 T HGMix::~HGMix()                      [D1]
//   0xa6ef0 T HGMix::~HGMix()                      [D0]
//
// ---------------------------------------------------------------------------
// Class shape recovered from the ctor / dtors / GetOutput / SetParameter:
//
//   HGMix  is-a  HGNode                        (C2 opens with callq
//                                                __ZN6HGNodeC2Ev @0xa6d3d
//                                                and every dtor tail-jmps to
//                                                __ZN6HGNodeD2Ev)
//
//   HGMix {
//     +0x000  vptr                              (set in C2 @0xa6d42 to
//                                                `vtable-for-HGMix` resident
//                                                at rip+0x96548f — 0xa6d49
//                                                + 0x96548f = 0xa0c1d8; the
//                                                installed-ptr entry of the
//                                                vtable object at 0xa0c1c8)
//     +0x008..+0x197                            (HGNode base subobject)
//     +0x198  HgcMix* m_hgcInner                (heap-allocated in C2 via
//                                                HGObject::operator new(0x1a0)
//                                                @0xa6d5c, constructed
//                                                via HgcMix::HgcMix()
//                                                @0xa6d67, and assigned via
//                                                the HGRef-style
//                                                self-Release/self-assign
//                                                sequence @0xa6d6c..0xa6d97)
//   }
//
// The 0x1a0-byte allocation @0xa6d5c is the size of an HgcMix instance —
// the raw datum comes from the ctor's `movl $0x1a0, %edi` literal.
//
// ---------------------------------------------------------------------------
// vtable-for-HGMix (Helium @0xa0c1c8 — resolved via
// `raw-port/army/tools/resolve.py Helium vtable HGMix`):
//   *0x00 -> HGMix::~HGMix()          @0xa6eb0   (D1)
//   *0x08 -> HGMix::~HGMix()          @0xa6ef0   (D0)
//   *0x10 -> HGObject::Retain()       @0x1a0f20
//   *0x18 -> HGObject::Release()      @0x1a0f30
//   *0x20 -> HGNode::debugDescription() const @0x11c100
//   *0x28 -> HGNode::dotLabel() const  @0x11c080
//   *0x30 -> HGNode::label_A() const   @0x11c090
//   *0x38 -> HGNode::label_B() const   @0x11c0d0
//   *0x40 -> HGNode::info(...)          @0x11c0e0
//   *0x48 -> HGNode::shaderDescription() const @0x11c3f0
//   *0x50 -> HGNode::GetParameterCount() @0x11ca50
//   *0x58 -> HGNode::GetParameterName(int) @0x11ca60
//   *0x60 -> HGMix::SetParameter(int, f,f,f,f) @0xa6e20 (this class — below)
//   *0x68 -> HGNode::GetParameter(int, float*) @0x11cbe0
//   *0x70 -> HGNode::GetNumInputs()    @0x11c8a0
//   *0x78 -> HGNode::SetInput(int, HGNode*) @0x11c5f0
//   *0x80 -> HGNode::GetInput(int)      @0x11c8b0
//   *0x88 -> HGNode::SetFlags(int, int) @0x11c8e0
//   *0x90 -> HGNode::ClearFlags(int, int) @0x11c980
//   *0x98 -> HGNode::GetFlags(int)      @0x11ca20
//
// GetOutput calls `*0x80(%rax)` on THIS's vtable — that resolves to
// HGNode::GetInput @Helium 0x11c8b0.
//
// vtable-for-HgcMix (the m_hgcInner's vtable — Helium @0xa49578):
//   *0x18 -> HGObject::Release()      @0x1a0f30    (used by C2's HGRef swap
//                                                     @0xa6d80/0xa6d97 and by
//                                                     both dtors @0xa6ed5/
//                                                     0xa6f12)
//   *0x60 -> HgcMix::SetParameter(int, f,f,f,f) @0x347520 (invoked by this
//                                                     class's SetParameter
//                                                     @0xa6e49 as a tail-
//                                                     call)
//   *0x78 -> HGNode::SetInput(int, HGNode*) @0x11c5f0 (invoked by GetOutput
//                                                     @0xa6e77 and @0xa6ea0)
//
// ---------------------------------------------------------------------------
// Frontier callees (undecoded — throwing stubs cite them):
//   __ZN6HGNodeC2Ev             HGNode::HGNode()             @0xa6d3d  callq
//   __ZN6HGNodeD2Ev             HGNode::~HGNode()            @0xa6ee1 (D1 jmp),
//                                                             @0xa6f18 (D0 callq),
//                                                             @0xa6ded (unwind)
//   __ZN8HGObjectnwEm           HGObject::operator new(ulong) @0xa6d5c callq
//   __ZN8HGObjectdlEPv          HGObject::operator delete    @0xa6dce (unwind),
//                                                             @0xa6f26 (D0 jmp)
//   __ZN6HgcMixC1Ev             HgcMix::HgcMix()              @0xa6d67  callq
//   HGRenderer::GetInput not called (unlike other wrapper nodes — HGMix goes
//     directly through HGNode::GetInput via this->vtable[0x80] instead)
//
// The class's *math surface* is trivial (there is no per-pixel body at this
// wrapping layer — the pixel work lives in HgcMix, which is a Metal-shader
// dispatch node). Every method here is lifetime or graph-plumbing.
//
// ---------------------------------------------------------------------------
// HGMix::HGMix()  [C2 — main body]                              @0xa6d30
//
//   __ZN5HGMixC2Ev:
//     0xa6d30  pushq %rbp / movq %rsp,%rbp / pushq %r15 / pushq %r14
//              pushq %rbx / pushq %rax
//     0xa6d3a  movq  %rdi, %rbx                       ; save this
//     0xa6d3d  callq __ZN6HGNodeC2Ev                   ; HGNode base ctor
//     0xa6d42  leaq  0x96548f(%rip), %rax              ; = vtable-for-HGMix
//                                                        (0xa6d49 + 0x96548f
//                                                        = 0xa0c1d8)
//     0xa6d49  movq  %rax, (%rbx)                      ; this->vptr = vtable
//     0xa6d4c  movq  $0x0, 0x198(%rbx)                 ; this->m_hgcInner = null
//                                                        (explicit init BEFORE
//                                                        the HGRef swap below)
//     0xa6d57  movl  $0x1a0, %edi                      ; imm = 0x1A0 (sizeof HgcMix)
//     0xa6d5c  callq __ZN8HGObjectnwEm                 ; op-new(0x1a0)
//     0xa6d61  movq  %rax, %r14                        ; %r14 = raw
//     0xa6d64  movq  %rax, %rdi
//     0xa6d67  callq __ZN6HgcMixC1Ev                   ; HgcMix ctor in-place
//     ; HGRef-style self-swap for m_hgcInner:
//     0xa6d6c  movq  0x198(%rbx), %rdi                 ; %rdi = old m_hgcInner
//     0xa6d73  cmpq  %r14, %rdi                        ; same as new?
//     0xa6d76  je    0xa6d8c                           ;   yes -> release NEW
//     0xa6d78  testq %rdi, %rdi                        ;   no  -> old null?
//     0xa6d7b  je    0xa6d83
//     0xa6d7d  movq  (%rdi), %rax                      ; old->vptr
//     0xa6d80  callq *0x18(%rax)                       ; old->Release()
//     0xa6d83  movq  %r14, 0x198(%rbx)                 ; store new pointer
//     0xa6d8a  jmp   0xa6d9a                           ; ret
//     0xa6d8c  testq %r14, %r14                        ; new null?
//     0xa6d8f  je    0xa6d9a
//     0xa6d91  movq  (%r14), %rax                      ; new->vptr
//     0xa6d94  movq  %r14, %rdi
//     0xa6d97  callq *0x18(%rax)                       ; new->Release()
//     0xa6d9a  add/pop/ret
//
// Semantics: standard "make a fresh HgcMix and assign it via an HGRef swap".
// Since the field was NULL-initialised at 0xa6d4c, `old` is always NULL at
// 0xa6d78, so on a fresh construction the taken path is:
//   0xa6d4c set field null → 0xa6d5c op-new → 0xa6d67 HgcMix ctor →
//   0xa6d6c reload field (still null) → 0xa6d73 cmp fails →
//   0xa6d78 testq null → je 0xa6d83 → 0xa6d83 store new → ret.
// The else-branch @0xa6d8c (release the new pointer) is dead in C2, but is
// present in the code because this is the HGRef `operator=` template used
// unmodified for a "possibly-empty destination"; keeping the branch modeled
// is important for future decodes that share the same idiom.
//
// ---------------------------------------------------------------------------
// HGMix::HGMix()  [C1 — trampoline]                             @0xa6e10
//
//   __ZN5HGMixC1Ev:
//     0xa6e10  pushq %rbp / movq %rsp,%rbp / popq %rbp
//     0xa6e15  jmp   __ZN5HGMixC2Ev                    ; tail-call C2
//
// The C1 entry is a 2-instruction trampoline (with a matched push/pop to
// keep the frame pointer sane) that jumps into C2. In TS both entries map
// to the same constructor.
//
// ---------------------------------------------------------------------------
// HGMix::SetParameter(int paramIdx, float a, float b, float c, float d)
//                                                                  @0xa6e20
//
//   __ZN5HGMix12SetParameterEiffff:
//     0xa6e20  pushq %rbp / movq %rsp,%rbp
//     0xa6e24  testl %esi, %esi                        ; if (paramIdx != 0)
//     0xa6e26  je    0xa6e2f
//     0xa6e28  movl  $0xffffffff, %eax                 ;   return -1
//     0xa6e2d  popq %rbp / retq
//     0xa6e2f  movq  0x198(%rdi), %rdi                 ; %rdi = m_hgcInner
//     0xa6e36  movq  (%rdi), %rax                      ; %rax = inner->vptr
//     0xa6e39  movq  0x60(%rax), %rax                  ; vtable[0x60] =
//                                                        HgcMix::SetParameter
//                                                        @Helium 0x347520
//     0xa6e3d  xorl  %esi, %esi                        ; arg2 = 0 (paramIdx
//                                                        forwarded as 0 —
//                                                        note it's HARD-
//                                                        WIRED, not %esi)
//     0xa6e3f  movaps %xmm0, %xmm1                     ; arg3 = a (broadcast)
//     0xa6e42  movaps %xmm0, %xmm2                     ; arg4 = a (broadcast)
//     0xa6e45  movaps %xmm0, %xmm3                     ; arg5 = a (broadcast)
//     0xa6e48  popq %rbp
//     0xa6e49  jmpq  *%rax                             ; tail-call
//
// Semantics: HGMix exposes exactly ONE parameter (index 0). Setting it
// forwards to HgcMix::SetParameter(0, a, a, a, a) — the first float (%xmm0)
// is BROADCAST to all four float slots of the inner setter. The three
// callee-supplied floats b/c/d @0xa6e20's signature are IGNORED. In
// practical terms, HGMix has a single scalar knob (the mix amount) that
// travels through the HgcMix shader's float4 uniform in every lane so the
// shader can multiply by it without caring about lane selection.
//
// Return of the taken branch is whatever HgcMix::SetParameter returns
// (int32), passed through the tail-jmp. Return on the untaken branch is
// -1 (0xffffffff), the canonical "unknown parameter index" sentinel.
//
// ---------------------------------------------------------------------------
// HGMix::GetOutput(HGRenderer* renderer)                            @0xa6e50
//
//   __ZN5HGMix9GetOutputEP10HGRenderer:
//     0xa6e50  pushq %rbp / movq %rsp,%rbp / pushq %r14 / pushq %rbx
//     0xa6e57  movq  %rdi, %rbx                        ; save this
//     0xa6e5a  movq  (%rdi), %rax                      ; %rax = this->vptr
//     0xa6e5d  movq  0x198(%rdi), %r14                 ; %r14 = m_hgcInner
//     0xa6e64  xorl  %esi, %esi                        ; arg2 = 0
//     0xa6e66  callq *0x80(%rax)                       ; this->vtable[0x80]
//                                                        = HGNode::GetInput(0)
//                                                        @Helium 0x11c8b0
//     0xa6e6c  movq  (%r14), %rcx                      ; inner->vptr
//     0xa6e6f  movq  %r14, %rdi                        ; arg1 = inner
//     0xa6e72  xorl  %esi, %esi                        ; arg2 = 0
//     0xa6e74  movq  %rax, %rdx                        ; arg3 = upstream0
//     0xa6e77  callq *0x78(%rcx)                       ; inner->vtable[0x78]
//                                                        = HGNode::SetInput(0, up0)
//                                                        @Helium 0x11c5f0
//     ; second slot:
//     0xa6e7a  movq  (%rbx), %rax                      ; this->vptr
//     0xa6e7d  movq  0x198(%rbx), %r14                 ; %r14 = m_hgcInner
//     0xa6e84  movq  %rbx, %rdi                        ; arg1 = this
//     0xa6e87  movl  $0x1, %esi                        ; arg2 = 1
//     0xa6e8c  callq *0x80(%rax)                       ; this->GetInput(1)
//     0xa6e92  movq  (%r14), %rcx                      ; inner->vptr
//     0xa6e95  movq  %r14, %rdi
//     0xa6e98  movl  $0x1, %esi
//     0xa6e9d  movq  %rax, %rdx
//     0xa6ea0  callq *0x78(%rcx)                       ; inner->SetInput(1, up1)
//     0xa6ea3  movq  0x198(%rbx), %rax                 ; return m_hgcInner
//     0xa6eaa..0xa6eae pop/ret
//
// Semantics: HGMix is a TWO-INPUT wrapper (unlike HGClampPremultiplied,
// which is single-input). GetOutput forwards its upstream slot 0 into
// m_hgcInner's slot 0, then its upstream slot 1 into m_hgcInner's slot 1,
// then returns m_hgcInner as the effective output.
//
// The upstream fetch uses `this->vtable[0x80]` — vtable-for-HGMix slot 0x80
// resolves to `HGNode::GetInput(int)` @Helium 0x11c8b0, i.e. HGMix does NOT
// override GetInput; it uses the base's own graph-input slot table. So the
// call semantics are `HGNode::GetInput(this, i)` for i in {0, 1}.
//
// ---------------------------------------------------------------------------
// HGMix::~HGMix()  [D1 — complete-object]                          @0xa6eb0
//
//   __ZN5HGMixD1Ev:
//     0xa6eb0  pushq %rbp / movq %rsp,%rbp / pushq %rbx / pushq %rax
//     0xa6eb6  leaq  0x96531b(%rip), %rax             ; = vtable-for-HGMix
//                                                       (0xa6ebd + 0x96531b
//                                                        = 0xa0c1d8)
//     0xa6ebd  movq  %rax, (%rdi)                      ; this->vptr = vtable
//     0xa6ec0  movq  0x198(%rdi), %rax                 ; %rax = m_hgcInner
//     0xa6ec7  testq %rax, %rax
//     0xa6eca  je    0xa6edb
//     0xa6ecc  movq  (%rax), %rcx                      ; inner->vptr
//     0xa6ecf  movq  %rdi, %rbx
//     0xa6ed2  movq  %rax, %rdi
//     0xa6ed5  callq *0x18(%rcx)                       ; inner->Release()
//                                                        (vtable[0x18] =
//                                                        HGObject::Release
//                                                        @Helium 0x1a0f30)
//     0xa6ed8  movq  %rbx, %rdi
//     0xa6edb  add/pop
//     0xa6ee1  jmp   __ZN6HGNodeD2Ev                   ; tail-call base D2
//
// Semantics: reset vptr, Release the owned HgcMix (if any), tail-jump into
// HGNode::~HGNode.
//
// ---------------------------------------------------------------------------
// HGMix::~HGMix()  [D0 — deleting]                                 @0xa6ef0
//
//   __ZN5HGMixD0Ev:
//     0xa6ef0  pushq %rbp / movq %rsp,%rbp / pushq %rbx / pushq %rax
//     0xa6ef6  movq  %rdi, %rbx
//     0xa6ef9  leaq  0x9652d8(%rip), %rax              ; = vtable-for-HGMix
//                                                        (0xa6f00 + 0x9652d8
//                                                        = 0xa0c1d8)
//     0xa6f00  movq  %rax, (%rdi)                      ; this->vptr = vtable
//     0xa6f03  movq  0x198(%rdi), %rdi                 ; %rdi = m_hgcInner
//     0xa6f0a  testq %rdi, %rdi
//     0xa6f0d  je    0xa6f15
//     0xa6f0f  movq  (%rdi), %rax                      ; inner->vptr
//     0xa6f12  callq *0x18(%rax)                       ; inner->Release()
//     0xa6f15  movq  %rbx, %rdi
//     0xa6f18  callq __ZN6HGNodeD2Ev                   ; base dtor
//     0xa6f1d  movq  %rbx, %rdi
//     0xa6f20..0xa6f24 add/pop
//     0xa6f26  jmp   __ZN8HGObjectdlEPv                ; op-delete tail-call
//
// Semantics: same as D1 plus a trailing `HGObject::operator delete(this)`.
// GC subsumes the trailing delete in TS.

import type { HGRenderer } from "./FFHCopyAlpha";
export type { HGRenderer };

/**
 * Opaque brand for `HGNode*` — the base class every render node inherits
 * from. HGNode itself is a frontier decode; only its identity matters at
 * this wrapper layer. Cited use sites for HGNode::HGNode / HGNode::~HGNode:
 *   ctor: @Helium 0xa6d3d
 *   dtor: @Helium 0xa6ee1 (D1 jmp), 0xa6f18 (D0 callq), 0xa6ded (unwind).
 */
export type HGNode = { readonly __brand: "HGNode" };

// ---------------------------------------------------------------------------
// Frontier callee stubs (undecoded) — see file header for cited addresses.
// ---------------------------------------------------------------------------

/**
 * Frontier: `HGNode::HGNode()` — base subobject ctor called from
 * HGMix::C2 @Helium 0xa6d3d.
 */
function HGNode_C2(_self: HGMix): void {
  // @Helium 0xa6d3d callq __ZN6HGNodeC2Ev
  throw new Error(
    "HGNode::HGNode() not yet transcribed " +
      "(frontier callee @Helium 0xa6d3d in HGMix::C2)",
  );
}

/**
 * Frontier: `HGNode::~HGNode()` — reached from every HGMix dtor:
 *   D1 tail-jmp @Helium 0xa6ee1
 *   D0 callq    @Helium 0xa6f18
 *   Unwind edge @Helium 0xa6ded (C2 exception path)
 */
function HGNode_D2(_self: HGMix): void {
  // @Helium 0xa6ee1 jmp __ZN6HGNodeD2Ev
  throw new Error(
    "HGNode::~HGNode() not yet transcribed " +
      "(frontier callee @Helium 0xa6ee1/0xa6f18/0xa6ded in HGMix dtors)",
  );
}

/**
 * Frontier: `HgcMix::HgcMix()` — invoked at @Helium 0xa6d67 on a fresh
 * `HGObject::operator new(0x1a0)` allocation. The 0x1a0-byte size is the
 * HgcMix filter's sizeof — literal recovered from @Helium 0xa6d57.
 */
function HgcMix_C1(_self: HgcMix): void {
  // @Helium 0xa6d67 callq __ZN6HgcMixC1Ev
  throw new Error(
    "HgcMix::HgcMix() not yet transcribed " +
      "(frontier callee @Helium 0xa6d67 — 0x1a0-byte Metal shader dispatch node)",
  );
}

/**
 * Frontier: `HGObject::Release()` on the owned HgcMix. Called from:
 *   - C2's HGRef swap @Helium 0xa6d80 (release-old) and @0xa6d97 (release-new)
 *   - D1 dtor @Helium 0xa6ed5
 *   - D0 dtor @Helium 0xa6f12
 * Vtable slot 0x18 of HgcMix's vtable resolves to `HGObject::Release()`
 * @Helium 0x1a0f30. In TS the GC subsumes ref-counting; we cite the address
 * so the destroy chain stays traceable.
 */
function HGObject_Release_hgcInner(_node: HgcMix): void {
  // @Helium 0xa6d80 / 0xa6d97 / 0xa6ed5 / 0xa6f12 callq *0x18(%rax)
  //   -> HGObject::Release() @Helium 0x1a0f30 (via HgcMix vtable slot 0x18)
  // GC subsumes Release — noop.
}

/**
 * Frontier: `HgcMix::SetParameter(int paramIdx, float a, float b, float c,
 * float d)` — the inner filter's parameter setter. Invoked as a tail-call
 * from HGMix::SetParameter @Helium 0xa6e49 via HgcMix vtable slot 0x60
 * (which resolves to HgcMix::SetParameter @Helium 0x347520).
 *
 * NB: the caller HARD-WIRES paramIdx=0 (see @0xa6e3d `xorl %esi,%esi`) and
 * BROADCASTS the first float across all four slots. Returns int32.
 */
function HgcMix_SetParameter(
  _inner: HgcMix,
  _paramIdx: number,
  _a: number,
  _b: number,
  _c: number,
  _d: number,
): number {
  // @Helium 0xa6e49 jmpq *%rax where *%rax = HgcMix vtable[0x60] @0x347520
  throw new Error(
    "HgcMix::SetParameter(int, float, float, float, float) not yet transcribed " +
      "(frontier callee @Helium 0xa6e49 / HgcMix vtable[0x60] @0x347520 " +
      "in HGMix::SetParameter)",
  );
}

/**
 * Frontier: `HGNode::GetInput(int inputIdx)` — the base HGNode's own
 * upstream fetch. Invoked from HGMix::GetOutput @Helium 0xa6e66 and
 * @0xa6e8c via `this->vtable[0x80]`, which resolves to HGNode::GetInput
 * @Helium 0x11c8b0 (HGMix does NOT override slot 0x80).
 */
function HGNode_GetInput(_self: HGMix, _inputIdx: number): HGNode {
  // @Helium 0xa6e66 / 0xa6e8c callq *0x80(%rax) -> HGNode::GetInput @0x11c8b0
  throw new Error(
    "HGNode::GetInput(int) not yet transcribed " +
      "(frontier callee @Helium 0xa6e66/0xa6e8c in HGMix::GetOutput)",
  );
}

/**
 * Frontier: `HGNode::SetInput(int inputIdx, HGNode* upstream)` — wires
 * `upstream` into `inputIdx` of the receiver. Invoked from HGMix::GetOutput
 * @Helium 0xa6e77 (slot 0) and @0xa6ea0 (slot 1) via
 * `m_hgcInner->vtable[0x78]`, which resolves to HGNode::SetInput
 * @Helium 0x11c5f0 (HgcMix does NOT override slot 0x78).
 */
function HGNode_SetInput(
  _inner: HgcMix,
  _inputIdx: number,
  _upstream: HGNode,
): void {
  // @Helium 0xa6e77 / 0xa6ea0 callq *0x78(%rcx) -> HGNode::SetInput @0x11c5f0
  throw new Error(
    "HGNode::SetInput(int, HGNode*) not yet transcribed " +
      "(frontier callee @Helium 0xa6e77/0xa6ea0 in HGMix::GetOutput)",
  );
}

/**
 * Opaque brand for the owned HgcMix filter (Helium — the pixel-level
 * Metal-shader dispatch node). Its own ctor/dtor/shader is a separate
 * frontier decode; only the identity is needed here so HGMix's field-shape
 * and vtable-slot dispatch are exact.
 *
 * sizeof(HgcMix) = 0x1a0 bytes (imm literal recovered from
 * HGMix::C2 @Helium 0xa6d57).
 *
 * vtable-for-HgcMix @Helium 0xa49578 — key slots consumed here:
 *   *0x18 -> HGObject::Release()          @Helium 0x1a0f30
 *   *0x60 -> HgcMix::SetParameter(...)     @Helium 0x347520
 *   *0x78 -> HGNode::SetInput(int, HGNode*) @Helium 0x11c5f0
 */
export type HgcMix = { readonly __brand: "HgcMix" };

/**
 * `HGMix` — Helium's two-input mixer render node. A "graph facade" that
 * presents an HGNode identity to the outer render graph and delegates the
 * per-pixel crossfade math to the owned HgcMix Metal filter.
 *
 * Exposed as EXACTLY ONE tunable parameter (index 0) — the mix amount.
 * Setting it broadcasts the scalar across the four-lane uniform that the
 * inner HgcMix shader consumes (see SetParameter transcription below).
 *
 * Signal flow (from GetOutput):
 *   external input slot 0  →  m_hgcInner input slot 0
 *   external input slot 1  →  m_hgcInner input slot 1
 *   m_hgcInner              →  returned as "effective output"
 *
 * @Helium symbols owned by this class:
 *   C1 @0xa6e10 (2-instr trampoline that tail-jmps to C2)
 *   C2 @0xa6d30 (main body, transcribed below)
 *   D0 @0xa6ef0 (deleting)
 *   D1 @0xa6eb0 (complete-object)
 *   SetParameter @0xa6e20
 *   GetOutput    @0xa6e50
 */
export class HGMix {
  /**
   * `this->m_hgcInner` at struct offset +0x198. Explicitly NULL-initialised
   * by C2 @Helium 0xa6d4c, then populated by the HGRef swap sequence at
   * @Helium 0xa6d5c..0xa6d97 after `HGObject::operator new(0x1a0)` + in-place
   * `HgcMix::HgcMix()`.
   */
  m_hgcInner: HgcMix | null = null;

  /**
   * HGMix::HGMix()  [C2 — main body] @Helium 0xa6d30
   * (also entered via C1 @Helium 0xa6e10 → jmp C2)
   *
   * Mirrored control flow:
   *   @0xa6d3d  HGNode::HGNode()                       (base ctor)
   *   @0xa6d42..0xa6d49  this->vptr = vtable-for-HGMix (TS: noop)
   *   @0xa6d4c  this->m_hgcInner = null                (explicit init)
   *   @0xa6d57..0xa6d5c  HGObject::operator new(0x1a0)
   *   @0xa6d67  HgcMix::HgcMix()                       (in-place ctor)
   *   @0xa6d6c..0xa6d97  HGRef-style self-swap:
   *                       old = this->m_hgcInner
   *                       if (old == new) → Release(new); return
   *                       if (old != null) → Release(old)
   *                       this->m_hgcInner = new
   *   @0xa6da4  ret
   *
   * Given @0xa6d4c pre-nulls the field, the taken branch on a fresh ctor
   * is `old==null, old!=new` → skip Release, store new. The "release-old"
   * / "release-new" branches are unreachable on this call site but are
   * preserved in TS to keep the HGRef swap idiom intact — matching what
   * every future HGRef reassignment will look like.
   *
   * The exception-unwind bookkeeping @0xa6da5..0xa6df5 (HGObject::operator
   * delete + HgcMix Release + HGNode::~HGNode + __Unwind_Resume) is a
   * pure C++-ABI artifact for the case where HgcMix::HgcMix() throws
   * mid-construction. In TS the frontier ctor never returns normally
   * (it throws), so the swap sequence past it is only reached once the
   * frontier is decoded. The addresses are cited in the header for
   * provenance.
   */
  constructor() {
    // @Helium 0xa6d3d — base subobject ctor.
    HGNode_C2(this);
    // @Helium 0xa6d42..0xa6d49 — this->vptr = vtable-for-HGMix (0xa0c1d8).
    // TS has no vptr; noop.
    // @Helium 0xa6d4c — this->m_hgcInner = null (already null-initialised
    // by the field default above; mirror the explicit init here anyway).
    this.m_hgcInner = null;
    // @Helium 0xa6d57..0xa6d5c — HGObject::operator new(0x1a0). GC subsumes.
    const raw = { __brand: "HgcMix" } as HgcMix;
    // @Helium 0xa6d67 — HgcMix::HgcMix() in-place.
    HgcMix_C1(raw);
    // @Helium 0xa6d6c..0xa6d97 — HGRef swap.
    const old = this.m_hgcInner; // @0xa6d6c
    if (old === raw) {
      // @0xa6d76 je 0xa6d8c → same pointer; release the "new" side.
      // @0xa6d8c..0xa6d97
      if (raw !== null) {
        HGObject_Release_hgcInner(raw); // @0xa6d97 callq *0x18(%rax)
      }
    } else {
      // @0xa6d78 different pointers; release old iff non-null.
      if (old !== null) {
        HGObject_Release_hgcInner(old); // @0xa6d80 callq *0x18(%rax)
      }
      // @0xa6d83 store new.
      this.m_hgcInner = raw;
    }
    // @0xa6d9a..0xa6da4 pop/ret.
  }

  /**
   * HGMix::SetParameter(int paramIdx, float a, float b, float c, float d)
   * @Helium 0xa6e20 — vtable-for-HGMix slot 0x60.
   *
   * Mirrored control flow:
   *   @0xa6e24  if (paramIdx != 0) return -1
   *   @0xa6e2f..0xa6e49  return HgcMix::SetParameter(m_hgcInner, 0, a, a, a, a)
   *                       (paramIdx forwarded is HARD-WIRED 0, and %xmm0/a
   *                        is BROADCAST to all four float slots — b/c/d are
   *                        discarded on purpose)
   *
   * Returns the callee's int32 (either 0/negative from HgcMix::SetParameter,
   * or -1 for out-of-range paramIdx).
   */
  SetParameter(
    paramIdx: number, // %esi
    a: number, // %xmm0
    _b: number, // %xmm1 — IGNORED (broadcast overwrites @0xa6e3f)
    _c: number, // %xmm2 — IGNORED (broadcast overwrites @0xa6e42)
    _d: number, // %xmm3 — IGNORED (broadcast overwrites @0xa6e45)
  ): number {
    // @Helium 0xa6e24 testl %esi,%esi ; @0xa6e26 je 0xa6e2f
    if ((paramIdx | 0) !== 0) {
      // @0xa6e28 movl $0xffffffff, %eax ; ret
      return -1;
    }
    // @0xa6e2f movq 0x198(%rdi),%rdi — m_hgcInner
    if (this.m_hgcInner === null) {
      // Invariant: C2 @Helium 0xa6d83 sets the field non-null on success.
      // If the frontier ctor never succeeds, we surface a loud error.
      throw new Error(
        "HGMix::SetParameter invariant broken: m_hgcInner null " +
          "(should be set by C2 @Helium 0xa6d83)",
      );
    }
    // @0xa6e39 movq 0x60(%rax),%rax — vtable[0x60] = HgcMix::SetParameter
    // @0xa6e3d xorl %esi,%esi        — arg1 = 0 (paramIdx literal 0)
    // @0xa6e3f..0xa6e45 movaps %xmm0,{%xmm1,%xmm2,%xmm3} — broadcast a
    // @0xa6e49 jmpq *%rax — tail-call
    const af32 = Math.fround(a);
    return HgcMix_SetParameter(this.m_hgcInner, 0, af32, af32, af32, af32);
  }

  /**
   * HGMix::GetOutput(HGRenderer* renderer)   @Helium 0xa6e50
   *
   * Mirrored control flow:
   *   @0xa6e66  up0 = HGNode::GetInput(this, 0)              (vtable[0x80])
   *   @0xa6e77  HGNode::SetInput(m_hgcInner, 0, up0)         (vtable[0x78])
   *   @0xa6e8c  up1 = HGNode::GetInput(this, 1)              (vtable[0x80])
   *   @0xa6ea0  HGNode::SetInput(m_hgcInner, 1, up1)         (vtable[0x78])
   *   @0xa6ea3  return m_hgcInner
   *
   * This is the two-input variant of the "wrapper-node output plumbing":
   * both external slots are wired through to the owned Hgc filter before
   * returning it as the effective output. Every call here is a frontier
   * callee — GetOutput itself introduces no arithmetic.
   */
  GetOutput(_renderer: HGRenderer): HgcMix {
    // Invariant: C2 sets m_hgcInner non-null on success.
    if (this.m_hgcInner === null) {
      throw new Error(
        "HGMix::GetOutput invariant broken: m_hgcInner null " +
          "(should be set by C2 @Helium 0xa6d83)",
      );
    }
    // @Helium 0xa6e64..0xa6e66 — this->GetInput(0) via vtable[0x80].
    const up0 = HGNode_GetInput(this, 0);
    // @Helium 0xa6e77 — m_hgcInner->SetInput(0, up0) via vtable[0x78].
    HGNode_SetInput(this.m_hgcInner, 0, up0);
    // @Helium 0xa6e87..0xa6e8c — this->GetInput(1).
    const up1 = HGNode_GetInput(this, 1);
    // @Helium 0xa6ea0 — m_hgcInner->SetInput(1, up1).
    HGNode_SetInput(this.m_hgcInner, 1, up1);
    // @Helium 0xa6ea3 — return m_hgcInner.
    return this.m_hgcInner;
  }

  /**
   * HGMix::~HGMix()  [D1 — complete-object]  @Helium 0xa6eb0
   *
   * Mirrored control flow:
   *   @0xa6eb6..0xa6ebd  this->vptr = vtable-for-HGMix (TS: noop)
   *   @0xa6ec0..0xa6ed5  if (m_hgcInner != null) m_hgcInner->Release()
   *   @0xa6ee1           tail-jmp HGNode::~HGNode()
   */
  destroy_D1(): void {
    // @Helium 0xa6eb6..0xa6ebd — reset vptr; TS noop.
    // @Helium 0xa6ec0..0xa6ed5 — release inner iff non-null.
    if (this.m_hgcInner !== null) {
      HGObject_Release_hgcInner(this.m_hgcInner);
    }
    // @Helium 0xa6ee1 jmp __ZN6HGNodeD2Ev.
    HGNode_D2(this);
  }

  /**
   * HGMix::~HGMix()  [D0 — deleting]  @Helium 0xa6ef0
   *
   * Mirrored control flow:
   *   @0xa6ef9..0xa6f00  this->vptr = vtable-for-HGMix (TS: noop)
   *   @0xa6f03..0xa6f12  if (m_hgcInner != null) m_hgcInner->Release()
   *   @0xa6f18           callq HGNode::~HGNode()
   *   @0xa6f26           jmp   HGObject::operator delete (TS: GC subsumes)
   */
  destroy_D0(): void {
    // @Helium 0xa6ef9..0xa6f00 — reset vptr; TS noop.
    if (this.m_hgcInner !== null) {
      // @Helium 0xa6f12 callq *0x18(%rax) → HgcMix->Release @0x1a0f30
      HGObject_Release_hgcInner(this.m_hgcInner);
    }
    // @Helium 0xa6f18 callq __ZN6HGNodeD2Ev.
    HGNode_D2(this);
    // @Helium 0xa6f26 jmp __ZN8HGObjectdlEPv — GC subsumes.
  }
}
