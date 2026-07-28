// HGPremultiply.ts — Helium's premultiply-alpha render node.
// Faithful transcription of every externally-visible HGPremultiply method from
//   /Applications/Final Cut Pro.app/Contents/Frameworks/Helium.framework/
//     Versions/A/Helium
//
// This is a direct sibling of HGClampPremultiplied (see raw-port/src/render/
// HGClampPremultiplied.ts) — same wrapping shape:
//   HGPremultiply is-a HGNode, and holds an owned HgcPremultiply* at
//   this+0x198. Every method is a lifetime or graph-plumbing operation; the
//   per-pixel math lives in HgcPremultiply (a separate render node whose
//   Metal shader dispatch is undecoded here).
//
// Source disassembly (bundled):
//   raw-port/re/disasm/Helium.HGPremultiply.HGPremultiply.s      C1 @0x157af0
//   raw-port/re/disasm/Helium.HGPremultiply.HGPremultiply_C2.s   C2 @0x157a70 (same body)
//   raw-port/re/disasm/Helium.HGPremultiply.~HGPremultiply_D2.s  D2 @0x157b70
//   raw-port/re/disasm/Helium.HGPremultiply.~HGPremultiply_D1.s  D1 @0x157bb0
//   raw-port/re/disasm/Helium.HGPremultiply.~HGPremultiply.s     D0 @0x157bf0
//   raw-port/re/disasm/Helium.HGPremultiply.GetOutput.s          GetOutput @0x157c30
//
// nm entries owned by this class (Helium):
//   0x157a70 T HGPremultiply::HGPremultiply()   [C2]
//   0x157af0 T HGPremultiply::HGPremultiply()   [C1]
//   0x157b70 T HGPremultiply::~HGPremultiply()  [D2 — base-object]
//   0x157bb0 T HGPremultiply::~HGPremultiply()  [D1 — complete-object]
//   0x157bf0 T HGPremultiply::~HGPremultiply()  [D0 — deleting]
//   0x157c30 T HGPremultiply::GetOutput(HGRenderer*)
//
// ---------------------------------------------------------------------------
// Class shape recovered from the ctor / dtors / GetOutput:
//
//   HGPremultiply  is-a  HGNode
//                 (C1 opens with `callq __ZN6HGNodeC2Ev`; every dtor
//                  tail-jmps to `__ZN6HGNodeD2Ev`.)
//
//   HGPremultiply {
//     +0x000  vptr                             (set in C1 @0x157b02 to
//                                                `vtable-for-HGPremultiply`
//                                                resident at rip+0x8c867f,
//                                                i.e. VA 0x157b09+0x8c867f
//                                                = 0xa20188)
//     +0x008..+0x197                           (HGNode base subobject)
//     +0x198  HgcPremultiply* m_hgcNode        (heap-allocated in C1 via
//                                                HGObject::operator new(0x1a0)
//                                                @0x157b0c, constructed via
//                                                HgcPremultiply::HgcPremultiply()
//                                                @0x157b1c)
//   }
//
//   The 0x1a0-byte allocation size is a raw immediate at @0x157b0c (movl
//   $0x1a0, %edi) — it is the sizeof HgcPremultiply.
//
// ---------------------------------------------------------------------------
// vtable-slot usage (matches HGClampPremultiplied — same base HgcNode family):
//   *0x18 (HGObject::Release) — invoked in D0/D1/D2 on m_hgcNode:
//                                @0x157b8d (D2 callq *0x18(%rax))
//                                @0x157bcd (D1 callq *0x18(%rax))
//                                @0x157c0d (D0 callq *0x18(%rax))
//   *0x78 (HGNode::SetInput)   — invoked in GetOutput on m_hgcNode:
//                                @0x157c55 (callq *0x78(%rcx))
//
// ---------------------------------------------------------------------------
// Frontier callees (undecoded — throwing stubs cite them):
//   __ZN6HGNodeC2Ev            HGNode::HGNode()             @0x157afd callq (C1),
//                                                            @0x157a7d callq (C2)
//   __ZN6HGNodeD2Ev            HGNode::~HGNode()            @0x157b99 (D2 jmp),
//                                                            @0x157bd9 (D1 jmp),
//                                                            @0x157c13 (D0 callq),
//                                                            @0x157ac1/@0x157ad4 (C1/C2 unwind),
//                                                            @0x157b41/@0x157b54 (C1 unwind alt-frames)
//   __ZN8HGObjectnwEm          HGObject::operator new(ulong) @0x157b11 callq (C1),
//                                                            @0x157a91 callq (C2)
//   __ZN8HGObjectdlEPv         HGObject::operator delete    @0x157c21 (D0 jmp),
//                                                            @0x157b39/@0x157ab9 (unwind)
//   __ZN14HgcPremultiplyC1Ev   HgcPremultiply ctor           @0x157b1c callq (C1),
//                                                            @0x157a9c callq (C2)
//   __ZN10HGRenderer8GetInputEP6HGNodei
//                              HGRenderer::GetInput          @0x157c41 callq (GetOutput)
//   (vtable) HGObject::Release()      via *0x18(%rax)        @0x157b8d/@0x157bcd/@0x157c0d
//   (vtable) HGNode::SetInput(int,HGNode*) via *0x78(%rcx)   @0x157c55
//   __Unwind_Resume            (libunwind)                   @0x157b49/@0x157b5c/@0x157ac9/@0x157adc
//   ___clang_call_terminate    (libc++abi)                   @0x157c29 (D0),
//                                                            @0x157ba1 (D2), @0x157be1 (D1)
//
// The class's *math surface* is trivial (no per-pixel body at this wrapping
// layer — pixel work lives in HgcPremultiply, itself a Metal-shader dispatch
// node). Every method above is a lifetime or graph-plumbing operation.

/**
 * HGNode — opaque base-class handle. Undecoded here (see HGClampPremultiplied.ts
 * for the same handle pattern). Referenced via its C2 ctor / D2 dtor from
 * inside HGPremultiply.
 *
 *   @Helium 0x157afd  callq __ZN6HGNodeC2Ev
 *   @Helium 0x157b99  jmp   __ZN6HGNodeD2Ev  (D2 tail)
 *   @Helium 0x157bd9  jmp   __ZN6HGNodeD2Ev  (D1 tail)
 *   @Helium 0x157c13  callq __ZN6HGNodeD2Ev  (D0)
 */
export interface HGNode_base {
  readonly __brand_HGNode: unique symbol;
}

/**
 * HGRenderer — opaque frame-graph renderer handle. Only referenced via its
 * GetInput method from `HGPremultiply::GetOutput`.
 *
 *   @Helium 0x157c41  callq __ZN10HGRenderer8GetInputEP6HGNodei
 */
export interface HGRenderer {
  readonly __brand_HGRenderer: unique symbol;
}

/**
 * HgcPremultiply — the owned "H-g-c" render node that carries the actual
 * Metal-shader dispatch (`*0x78(%rcx) = HGNode::SetInput(int, HGNode*)`).
 * Sizeof is exactly 0x1a0 bytes (from the ctor's `movl $0x1a0, %edi` @0x157b0c
 * before the `HGObject::operator new(ulong)` call).
 *
 *   @Helium 0x157b1c  callq __ZN14HgcPremultiplyC1Ev
 *
 * The class's vtable (at whatever VA `HgcPremultiply::vtable` resolves to)
 * is used only through slots 0x18 (Release) and 0x78 (SetInput); every other
 * slot is inherited from HgcNode / HGObject and is not observed by HGPremultiply.
 */
export interface HgcPremultiply {
  readonly __brand_HgcPremultiply: unique symbol;
}

// ── Frontier stubs (undecoded C++ callees — every stub cites its @0xADDR) ────

/**
 * HGNode::HGNode() — the base-class C2 constructor.
 *
 *   @Helium 0x157afd  callq __ZN6HGNodeC2Ev  (C1 entry)
 *   @Helium 0x157a7d  callq __ZN6HGNodeC2Ev  (C2 entry — same body)
 *
 * The HGNode layout is not yet decoded. Subclasses observe it only through
 * the shared vtable and the +0x08..+0x197 base sub-object.
 */
function HGNode_base_ctor_stub(_self: HGNode_base): void {
  throw new Error(
    "raise: HGNode::HGNode() base ctor @Helium 0x157afd is not yet decoded — " +
      "see raw-port/army/PORTING_SPEC.md rule 3.",
  );
}

/**
 * HGNode::~HGNode() — the base-class D2 destructor.
 *
 *   @Helium 0x157b99  jmp   __ZN6HGNodeD2Ev   (D2 tail-jmp)
 *   @Helium 0x157bd9  jmp   __ZN6HGNodeD2Ev   (D1 tail-jmp)
 *   @Helium 0x157c13  callq __ZN6HGNodeD2Ev   (D0)
 */
function HGNode_base_dtor_stub(_self: HGNode_base): void {
  throw new Error(
    "raise: HGNode::~HGNode() @Helium 0x157b99 is not yet decoded — subclass " +
      "dtors chain here after releasing their owned HgcPremultiply.",
  );
}

/**
 * HGObject::operator new(unsigned long) — Helium's per-class heap allocator.
 *
 *   @Helium 0x157b11  callq __ZN8HGObjectnwEm  (C1 — allocating HgcPremultiply)
 *   @Helium 0x157a91  callq __ZN8HGObjectnwEm  (C2 — same site)
 *
 * The custom operator new lives inside HGObject and is not yet decoded. In TS
 * under GC, allocation of the JS side of the HgcPremultiply handle is implicit,
 * but we preserve the demand signal here.
 */
function HGObject_operator_new_stub(_bytes: number): HgcPremultiply {
  throw new Error(
    "raise: HGObject::operator new(unsigned long) @Helium 0x157b11 is not yet " +
      "decoded — the sizeof(HgcPremultiply) argument is 0x1a0 (immediate at " +
      "@0x157b0c).",
  );
}

/**
 * HGObject::operator delete(void*) — Helium's per-class heap deallocator.
 *
 *   @Helium 0x157c21  jmp   __ZN8HGObjectdlEPv  (D0 tail-jmp)
 *   @Helium 0x157b39  callq __ZN8HGObjectdlEPv  (C1 unwind)
 *   @Helium 0x157ab9  callq __ZN8HGObjectdlEPv  (C2 unwind)
 */
function HGObject_operator_delete_stub(_p: HgcPremultiply): void {
  throw new Error(
    "raise: HGObject::operator delete(void*) @Helium 0x157c21 is not yet " +
      "decoded — in TS under GC this is a no-op, but the demand signal is " +
      "preserved here.",
  );
}

/**
 * HgcPremultiply::HgcPremultiply() — the owned-node's C1 ctor.
 *
 *   @Helium 0x157b1c  callq __ZN14HgcPremultiplyC1Ev  (C1)
 *   @Helium 0x157a9c  callq __ZN14HgcPremultiplyC1Ev  (C2)
 *
 * The HgcPremultiply body is a Metal-shader dispatch node whose per-pixel
 * math lives in a separate Metal shader source (undecoded here). This stub
 * cites the ctor addr so that a future decoding pass can wire it up.
 */
function HgcPremultiply_ctor_stub(_self: HgcPremultiply): void {
  throw new Error(
    "raise: HgcPremultiply::HgcPremultiply() @Helium 0x157b1c is not yet " +
      "decoded — the owned Metal-shader dispatch node's ctor.",
  );
}

/**
 * HGObject::Release() — vtable slot 0x18 on m_hgcNode.
 *
 *   @Helium 0x157b8d  callq *0x18(%rax)   (D2)
 *   @Helium 0x157bcd  callq *0x18(%rax)   (D1)
 *   @Helium 0x157c0d  callq *0x18(%rax)   (D0)
 *
 * The typical HGObject::Release is a refcount-decrement (see HGObject_stub in
 * raw-port/src/infra/) — this class merely invokes it via the shared vtable
 * slot; the actual per-vtable-address body lives in the HgcPremultiply's own
 * vtable and is not repeated here.
 */
function HGObject_Release_via_vtable_stub(_p: HgcPremultiply): void {
  throw new Error(
    "raise: HGObject::Release via *0x18(vtable) @Helium 0x157b8d is not yet " +
      "decoded — vtable slot 0x18 on the HgcPremultiply instance held at " +
      "this+0x198.",
  );
}

/**
 * HGNode::SetInput(int, HGNode*) — vtable slot 0x78 on m_hgcNode.
 *
 *   @Helium 0x157c55  callq *0x78(%rcx)
 *
 * Called from GetOutput to wire the upstream node (returned by
 * HGRenderer::GetInput) into m_hgcNode as input #0.
 */
function HGNode_SetInput_via_vtable_stub(
  _target: HgcPremultiply,
  _inputIndex: number,
  _source: HGNode_base,
): void {
  throw new Error(
    "raise: HGNode::SetInput via *0x78(vtable) @Helium 0x157c55 is not yet " +
      "decoded — vtable slot 0x78 on the HgcPremultiply instance held at " +
      "this+0x198.",
  );
}

/**
 * HGRenderer::GetInput(HGNode*, int) — direct (non-virtual) member call from
 * `HGPremultiply::GetOutput`.
 *
 *   @Helium 0x157c41  callq __ZN10HGRenderer8GetInputEP6HGNodei
 *
 * Second arg is 0 (`xorl %edx, %edx` @0x157c3f) — the "index-0 input" of `this`.
 * Returns the upstream HGNode* (the source whose output feeds this node).
 */
function HGRenderer_GetInput_stub(
  _renderer: HGRenderer,
  _node: HGPremultiply,
  _inputIndex: number,
): HGNode_base {
  throw new Error(
    "raise: HGRenderer::GetInput(HGNode*, int) @Helium 0x157c41 is not yet " +
      "decoded — the frame-graph input resolver.",
  );
}

// ── The class ────────────────────────────────────────────────────────────────

export class HGPremultiply {
  /**
   * +0x000 — vtable pointer. Set in C1 @0x157b02 via:
   *   leaq 0x8c867f(%rip), %rax   →  0x157b09 + 0x8c867f = 0xa20188
   *   movq %rax, (%rbx)
   * Also re-stamped by D2 @0x157b79-0x157b80 (leaq 0x8c8608(%rip), %rax with
   * next-instr 0x157b80 → 0xa20188), D1 @0x157bb9-0x157bc0 (leaq 0x8c85c8),
   * D0 @0x157bf9-0x157c00 (leaq 0x8c8588). All three offsets resolve to the
   * same class vtable address 0xa20188 — the D2/D1/D0 re-stamp pattern is
   * standard Itanium-ABI "restore parent vtable during destruction" behaviour.
   */
  readonly __vtable = "HGPremultiply::vtable @Helium 0xa20188";

  /**
   * +0x008..+0x197 — inherited HGNode state (opaque; owned by the base
   * sub-object which is constructed in place by `HGNode::HGNode()` @0x157afd).
   */
  readonly base: HGNode_base;

  /**
   * +0x198 — owned HgcPremultiply pointer. Allocated in C1 @0x157b0c-0x157b1c
   * via `HGObject::operator new(0x1a0) → HgcPremultiply::HgcPremultiply()`.
   * Released by every destructor via `*0x18(vtable) = HGObject::Release()`.
   */
  m_hgcNode: HgcPremultiply;

  /**
   * HGPremultiply()  [C1]  →  @Helium 0x0000000000157af0
   *   (__ZN13HGPremultiplyC1Ev — the C2 body @0x157a70 is byte-identical modulo
   *    the vtable-load %rip offset that resolves to the SAME class vtable.)
   *
   * DECODE (raw-port/re/disasm/Helium.HGPremultiply.HGPremultiply.s):
   *   0x157afa  movq  %rdi, %rbx                 ; save `this`
   *   0x157afd  callq __ZN6HGNodeC2Ev            ; HGNode base ctor
   *   0x157b02  leaq  0x8c867f(%rip), %rax       ; = vtable-for-HGPremultiply
   *   0x157b09  movq  %rax, (%rbx)               ; this->vptr = vtable
   *   0x157b0c  movl  $0x1a0, %edi               ; imm = 0x1A0 (sizeof HgcPremultiply)
   *   0x157b11  callq __ZN8HGObjectnwEm          ; HGObject::operator new(0x1a0)
   *   0x157b16  movq  %rax, %r14                 ; %r14 = raw storage
   *   0x157b19  movq  %rax, %rdi                 ; arg1 = raw storage
   *   0x157b1c  callq __ZN14HgcPremultiplyC1Ev   ; HgcPremultiply::HgcPremultiply()
   *   0x157b21  movq  %r14, 0x198(%rbx)          ; this->m_hgcNode = %r14
   *   0x157b28..0x157b32 pop/ret
   *   ; exception-unwind path (op-new succeeded, HgcPremultiply::ctor threw):
   *   0x157b33  movq  %rax, %r15                 ; save exception ptr
   *   0x157b36  movq  %r14, %rdi
   *   0x157b39  callq __ZN8HGObjectdlEPv         ; free raw storage
   *   0x157b3e  movq  %rbx, %rdi
   *   0x157b41  callq __ZN6HGNodeD2Ev            ; unwind base sub-object
   *   0x157b46  movq  %r15, %rdi
   *   0x157b49  callq __Unwind_Resume
   *   ; second unwind entry (HGNode base ctor itself threw):
   *   0x157b4e  movq  %rax, %r15
   *   0x157b51  movq  %rbx, %rdi
   *   0x157b54  callq __ZN6HGNodeD2Ev
   *   0x157b5c  callq __Unwind_Resume
   *
   * TS transcription note (same as HGClampPremultiplied.ts): the exception-
   * unwind bookkeeping is meaningful in native land only because C++ requires
   * it if a subordinate ctor throws. In TS both subordinate ctors below are
   * throwing stubs (they never "succeed", so the unwind edge is never
   * legitimately reached), and GC subsumes operator delete anyway. The TS
   * body mirrors only the happy path.
   */
  constructor() {
    // Model the HGNode base sub-object as an opaque handle. The C++ code would
    // have placement-constructed it in-place at this+0x08; here we model it as
    // a distinct field.
    const base = { __brand_HGNode: Symbol("HGNode") } as unknown as HGNode_base;
    // @0x157afd  callq HGNode::HGNode() — raises: base layout not decoded.
    HGNode_base_ctor_stub(base);
    this.base = base;

    // @0x157b11  callq HGObject::operator new(0x1a0)  → raw storage.
    const raw = HGObject_operator_new_stub(0x1a0);
    // @0x157b1c  callq HgcPremultiply::HgcPremultiply()  on the raw storage.
    HgcPremultiply_ctor_stub(raw);
    // @0x157b21  this->m_hgcNode = raw storage (now fully constructed).
    this.m_hgcNode = raw;
  }

  /**
   * ~HGPremultiply()  [D2 — base-object dtor]  →  @Helium 0x0000000000157b70
   *   (__ZN13HGPremultiplyD2Ev)
   *
   * DECODE (raw-port/re/disasm/Helium.HGPremultiply.~HGPremultiply_D2.s):
   *   0x157b76  movq  %rdi, %rbx                 ; save `this`
   *   0x157b79  leaq  0x8c8608(%rip), %rax       ; = vtable-for-HGPremultiply
   *   0x157b80  movq  %rax, (%rdi)               ; this->vptr = vtable (re-stamp)
   *   0x157b83  movq  0x198(%rdi), %rdi          ; %rdi = m_hgcNode
   *   0x157b8a  movq  (%rdi), %rax               ; %rax = m_hgcNode->vptr
   *   0x157b8d  callq *0x18(%rax)                ; vtable[0x18] = HGObject::Release()
   *   0x157b90  movq  %rbx, %rdi
   *   0x157b93..0x157b98 pop
   *   0x157b99  jmp   __ZN6HGNodeD2Ev            ; tail-call base D2
   *   ; exception-unwind path:
   *   0x157b9e  callq ___clang_call_terminate
   *
   * Semantics: reset vptr to this class's vtable (so any further vcalls
   * resolve to HGPremultiply's own methods, per Itanium-ABI destruction
   * protocol); release the owned HgcPremultiply; tail-call the base D2.
   */
  destruct_D2(): void {
    // @0x157b79-0x157b80  vptr re-stamp (no-op in TS with prototype-based
    // dispatch — the instance's proto is fixed and encodes this class).
    // @0x157b8d  m_hgcNode.vtable[0x18]() → HGObject::Release()
    HGObject_Release_via_vtable_stub(this.m_hgcNode);
    // @0x157b99  jmp HGNode::~HGNode() (tail call)
    HGNode_base_dtor_stub(this.base);
  }

  /**
   * ~HGPremultiply()  [D1 — complete-object dtor]  →  @Helium 0x0000000000157bb0
   *   (__ZN13HGPremultiplyD1Ev)
   *
   * DECODE (raw-port/re/disasm/Helium.HGPremultiply.~HGPremultiply_D1.s):
   *   Byte-identical to D2 except for the vtable-load %rip offset:
   *     0x157bb9  leaq 0x8c85c8(%rip), %rax   ; next-instr 0x157bc0 → same 0xa20188
   *   Otherwise identical:
   *     0x157bc3  movq 0x198(%rdi), %rdi      ; m_hgcNode
   *     0x157bcd  callq *0x18(%rax)           ; HGObject::Release()
   *     0x157bd9  jmp   __ZN6HGNodeD2Ev
   *     0x157be1  callq ___clang_call_terminate  (unwind)
   *
   * For a class with no virtual bases the complete-object dtor is identical
   * to the base-object dtor.
   */
  destruct_D1(): void {
    // Same body as D2 — see above.
    HGObject_Release_via_vtable_stub(this.m_hgcNode);   // @0x157bcd
    HGNode_base_dtor_stub(this.base);                   // @0x157bd9
  }

  /**
   * ~HGPremultiply()  [D0 — deleting dtor]  →  @Helium 0x0000000000157bf0
   *   (__ZN13HGPremultiplyD0Ev)
   *
   * DECODE (raw-port/re/disasm/Helium.HGPremultiply.~HGPremultiply.s):
   *   0x157bf6  movq  %rdi, %rbx                 ; save `this`
   *   0x157bf9  leaq  0x8c8588(%rip), %rax       ; = vtable-for-HGPremultiply
   *   0x157c00  movq  %rax, (%rdi)               ; this->vptr = vtable (re-stamp)
   *   0x157c03  movq  0x198(%rdi), %rdi          ; %rdi = m_hgcNode
   *   0x157c0a  movq  (%rdi), %rax               ; %rax = m_hgcNode->vptr
   *   0x157c0d  callq *0x18(%rax)                ; HGObject::Release()
   *   0x157c10  movq  %rbx, %rdi
   *   0x157c13  callq __ZN6HGNodeD2Ev            ; base D2 (NOT tail — D0 has more work)
   *   0x157c18  movq  %rbx, %rdi
   *   0x157c1b..0x157c20 pop
   *   0x157c21  jmp   __ZN8HGObjectdlEPv         ; tail-call operator delete(this)
   *   ; exception-unwind path:
   *   0x157c29  callq ___clang_call_terminate
   *
   * D0 = D1 + operator delete(this). In TS under GC there is nothing extra
   * beyond the D1 semantics; we surface the operator-delete site as a stub.
   */
  destruct_D0(): void {
    // @0x157c0d  m_hgcNode.vtable[0x18]() → HGObject::Release()
    HGObject_Release_via_vtable_stub(this.m_hgcNode);
    // @0x157c13  callq HGNode::~HGNode()
    HGNode_base_dtor_stub(this.base);
    // @0x157c21  jmp HGObject::operator delete(this)  → in TS under GC: no-op,
    // but the demand signal for the delete site is preserved via the stub.
    HGObject_operator_delete_stub(this.m_hgcNode);
  }

  /**
   * GetOutput(HGRenderer*)  →  HgcPremultiply*
   * @Helium 0x0000000000157c30  (__ZN13HGPremultiply9GetOutputEP10HGRenderer)
   *
   * DECODE (raw-port/re/disasm/Helium.HGPremultiply.GetOutput.s):
   *   0x157c36  movq  %rdi, %rbx                 ; save `this`
   *   0x157c39  movq  %rsi, %rdi                 ; arg1 = renderer
   *   0x157c3c  movq  %rbx, %rsi                 ; arg2 = `this` (as HGNode*)
   *   0x157c3f  xorl  %edx, %edx                 ; arg3 = 0 (input index)
   *   0x157c41  callq __ZN10HGRenderer8GetInputEP6HGNodei
   *                                              ; upstreamNode = renderer.GetInput(this, 0)
   *   0x157c46  movq  0x198(%rbx), %rdi          ; arg1 = m_hgcNode  (target of vcall)
   *   0x157c4d  movq  (%rdi), %rcx               ; %rcx = m_hgcNode->vptr
   *   0x157c50  xorl  %esi, %esi                 ; arg2 = 0 (input index)
   *   0x157c52  movq  %rax, %rdx                 ; arg3 = upstreamNode
   *   0x157c55  callq *0x78(%rcx)                ; vtable[0x78] = HGNode::SetInput(int, HGNode*)
   *                                              ;   → m_hgcNode.SetInput(0, upstreamNode)
   *   0x157c58  movq  0x198(%rbx), %rax          ; return this->m_hgcNode
   *   0x157c65  retq
   *
   * Semantics: wire this node's index-0 input (as resolved by the renderer)
   * into the owned HgcPremultiply as its input #0, then return the owned
   * HgcPremultiply as this HGPremultiply's frame-graph output.
   *
   * @param renderer  the frame-graph renderer (used only to resolve this
   *                  node's own upstream input at index 0).
   * @returns  this.m_hgcNode — the Metal-shader dispatch node that carries
   *           the per-pixel premultiply work.
   */
  GetOutput(renderer: HGRenderer): HgcPremultiply {
    // @0x157c41  upstreamNode = renderer.GetInput(this, 0)
    const upstream = HGRenderer_GetInput_stub(renderer, this, 0);
    // @0x157c55  m_hgcNode.vtable[0x78](0, upstream)  →  HGNode::SetInput
    HGNode_SetInput_via_vtable_stub(this.m_hgcNode, 0, upstream);
    // @0x157c58  return this->m_hgcNode
    return this.m_hgcNode;
  }
}

/**
 * The class's own vtable address is @Helium 0xa20188 (recovered from every
 * ctor / dtor vptr-write site: leaq 0x8c867f(%rip) @0x157b02 → 0x157b09 +
 * 0x8c867f = 0xa20188; the D2 / D1 / D0 re-stamps all resolve to the same
 * address with different %rip offsets).
 */
export const HGPremultiply_vtable_addr = "@Helium 0xa20188" as const;
