// HGYUV444ToPlanarAlpha.ts — Helium's YUV 4:4:4 → planar-alpha render node.
// Faithful transcription of every externally-visible HGYUV444ToPlanarAlpha
// method from
//   /Applications/Final Cut Pro.app/Contents/Frameworks/Helium.framework/
//     Versions/A/Helium
//
// This is a variant of the HGPremultiply / HGClampPremultiplied wrapping
// pattern (see raw-port/src/render/HGPremultiply.ts). Key differences from
// the "eager-alloc" siblings:
//
//   (1) ctor sets m_hgcNode = NULL (no allocation in ctor).
//         @0x0e66a8 (C2) / @0x0e66d8 (C1)  movq $0x0, 0x198(%rbx)
//
//   (2) GetOutput ALLOCATES a fresh HgcYUV420TriPlanar_alpha (sizeof = 0x200)
//       on every call, then either
//         • swaps it in as the new m_hgcNode (releasing the old one), OR
//         • releases the newly-allocated one if it happens to equal the
//           currently-installed m_hgcNode (an identity-check optimization for
//           the case where operator new returned the same pointer, e.g. a
//           freelist hit).
//         @0x0e67d1..@0x0e681b
//
//   (3) All three destructors null-guard m_hgcNode before releasing it
//       (D2 @0x0e670a je, D1 @0x0e674a je, D0 @0x0e678d je).
//
// The owned-node class name changed from the wrapping class's title: this
// wrapper is called YUV444ToPlanarAlpha but it constructs a
// HgcYUV420TriPlanar_alpha (called from GetOutput @0x0e67e1). This is a raw
// naming-quirk observed in the ABI symbols — the port surfaces the symbol
// exactly as it appears in the ctor call.
//
// Source disassembly (bundled):
//   raw-port/re/disasm/Helium.HGYUV444ToPlanarAlpha.all.s
//     C2 @0x0e6690 ; C1 @0x0e66c0
//     D2 @0x0e66f0 ; D1 @0x0e6730 ; D0 @0x0e6770
//     GetOutput @0x0e67c0
//
// ---------------------------------------------------------------------------
// Class shape recovered from the ctor / dtors / GetOutput:
//
//   HGYUV444ToPlanarAlpha  is-a  HGNode
//
//   HGYUV444ToPlanarAlpha {
//     +0x000  vptr                             (set in C1 @0x0e66d5 to
//                                                `vtable-for-HGYUV444ToPlanarAlpha`
//                                                resident at rip+0x928403,
//                                                i.e. VA 0x0e66d5 + 0x928403
//                                                = 0xa0ead8)
//     +0x008..+0x197                           (HGNode base subobject)
//     +0x198  HgcYUV420TriPlanar_alpha* m_hgcNode  (initialised NULL by ctor;
//                                                    lazily allocated on the
//                                                    first GetOutput call)
//   }
//
//   sizeof(HgcYUV420TriPlanar_alpha) = 0x200 (raw immediate at @0x0e67d1:
//   `movl $0x200, %edi`).
//
// ---------------------------------------------------------------------------
// vtable-slot usage on m_hgcNode:
//   *0x18 (HGObject::Release) — invoked in D0/D1/D2 (each guarded by a NULL
//                                check) and in GetOutput both on the newly-
//                                allocated node (when it's a no-op replace)
//                                AND on the previous m_hgcNode (when it's a
//                                real replacement).
//   *0x78 (HGNode::SetInput)   — invoked in GetOutput on the finally-installed
//                                m_hgcNode @0x0e683b.
//
// ---------------------------------------------------------------------------
// Frontier callees (undecoded — throwing stubs cite them):
//   __ZN6HGNodeC2Ev                        HGNode::HGNode()
//                                             @0x0e6699 callq (C2),
//                                             @0x0e66c9 callq (C1)
//   __ZN6HGNodeD2Ev                        HGNode::~HGNode()
//                                             @0x0e6721 jmp (D2), @0x0e6761 jmp (D1),
//                                             @0x0e6798 callq (D0)
//   __ZN8HGObjectnwEm                      HGObject::operator new(ulong)
//                                             @0x0e67d6 callq (GetOutput — 0x200 bytes)
//   __ZN8HGObjectdlEPv                     HGObject::operator delete
//                                             @0x0e67a6 jmp (D0 tail)
//   __ZN24HgcYUV420TriPlanar_alphaC1Ev     HgcYUV420TriPlanar_alpha ctor
//                                             @0x0e67e1 callq (GetOutput)
//   __ZN10HGRenderer8GetInputEP6HGNodei    HGRenderer::GetInput
//                                             @0x0e682a callq (GetOutput)
//   (vtable) HGObject::Release()   via *0x18(%rax) or *0x18(%rcx)
//                                             @0x0e6715 (D2), @0x0e6755 (D1),
//                                             @0x0e6792 (D0), @0x0e67fe (GetOutput
//                                             — releasing old m_hgcNode),
//                                             @0x0e6818 (GetOutput — releasing
//                                             identity-match newly-allocated node)
//   (vtable) HGNode::SetInput(int,HGNode*)  via *0x78(%rcx)
//                                             @0x0e683b (GetOutput)
//   ___clang_call_terminate                (libc++abi)
//                                             @0x0e6729 (D2), @0x0e6769 (D1),
//                                             @0x0e67ae (D0)

/**
 * HGNode — opaque base-class handle. See HGPremultiply.ts / HGClampPremultiplied.ts
 * for the same pattern.
 *
 *   @Helium 0x0e6699  callq __ZN6HGNodeC2Ev
 *   @Helium 0x0e6721  jmp   __ZN6HGNodeD2Ev  (D2 tail)
 *   @Helium 0x0e6761  jmp   __ZN6HGNodeD2Ev  (D1 tail)
 *   @Helium 0x0e6798  callq __ZN6HGNodeD2Ev  (D0)
 */
export interface HGNode_base {
  readonly __brand_HGNode: unique symbol;
}

/**
 * HGRenderer — opaque frame-graph renderer handle.
 *
 *   @Helium 0x0e682a  callq __ZN10HGRenderer8GetInputEP6HGNodei
 */
export interface HGRenderer {
  readonly __brand_HGRenderer: unique symbol;
}

/**
 * HgcYUV420TriPlanar_alpha — the owned "H-g-c" render node that carries the
 * Metal-shader dispatch for planar-alpha extraction. Sizeof = 0x200 (raw
 * immediate at @0x0e67d1 before HGObject::operator new).
 *
 *   @Helium 0x0e67e1  callq __ZN24HgcYUV420TriPlanar_alphaC1Ev
 *
 * Note the naming quirk: the wrapper class is HGYUV444ToPlanarAlpha but the
 * owned node is called HgcYUV420TriPlanar_alpha (the "420 tri-planar" side
 * handles the RGB-plane triple that HGYUV444 supplies its input from).
 */
export interface HgcYUV420TriPlanar_alpha {
  readonly __brand_HgcYUV420TriPlanar_alpha: unique symbol;
}

// ── Frontier stubs (undecoded C++ callees — every stub cites its @0xADDR) ────

/**
 * HGNode::HGNode() — the base-class C2 constructor.
 *
 *   @Helium 0x0e6699  callq __ZN6HGNodeC2Ev  (C2 entry — same body as C1)
 *   @Helium 0x0e66c9  callq __ZN6HGNodeC2Ev  (C1 entry)
 */
function HGNode_base_ctor_stub(_self: HGNode_base): void {
  throw new Error(
    "raise: HGNode::HGNode() base ctor @Helium 0x0e6699 is not yet decoded — " +
      "see raw-port/army/PORTING_SPEC.md rule 3.",
  );
}

/**
 * HGNode::~HGNode() — the base-class D2 destructor.
 *
 *   @Helium 0x0e6721  jmp   __ZN6HGNodeD2Ev   (D2 tail-jmp)
 *   @Helium 0x0e6761  jmp   __ZN6HGNodeD2Ev   (D1 tail-jmp)
 *   @Helium 0x0e6798  callq __ZN6HGNodeD2Ev   (D0)
 */
function HGNode_base_dtor_stub(_self: HGNode_base): void {
  throw new Error(
    "raise: HGNode::~HGNode() @Helium 0x0e6721 is not yet decoded — subclass " +
      "dtors chain here after releasing their owned HgcYUV420TriPlanar_alpha.",
  );
}

/**
 * HGObject::operator new(unsigned long) — Helium's per-class heap allocator.
 *
 *   @Helium 0x0e67d6  callq __ZN8HGObjectnwEm  (GetOutput — 0x200 bytes)
 */
function HGObject_operator_new_stub(_bytes: number): HgcYUV420TriPlanar_alpha {
  throw new Error(
    "raise: HGObject::operator new(unsigned long) @Helium 0x0e67d6 is not " +
      "yet decoded — the sizeof(HgcYUV420TriPlanar_alpha) argument is 0x200 " +
      "(immediate at @0x0e67d1).",
  );
}

/**
 * HGObject::operator delete(void*) — Helium's per-class heap deallocator.
 *
 *   @Helium 0x0e67a6  jmp   __ZN8HGObjectdlEPv  (D0 tail-jmp)
 */
function HGObject_operator_delete_stub(_p: HGYUV444ToPlanarAlpha): void {
  throw new Error(
    "raise: HGObject::operator delete(void*) @Helium 0x0e67a6 is not yet " +
      "decoded — in TS under GC this is a no-op; the demand signal is " +
      "preserved here.",
  );
}

/**
 * HgcYUV420TriPlanar_alpha::HgcYUV420TriPlanar_alpha() — the owned-node's C1
 * ctor. Called from GetOutput (not from the wrapper's ctor — the wrapper
 * initialises m_hgcNode to NULL, and the owned node is lazily allocated).
 *
 *   @Helium 0x0e67e1  callq __ZN24HgcYUV420TriPlanar_alphaC1Ev
 */
function HgcYUV420TriPlanar_alpha_ctor_stub(_self: HgcYUV420TriPlanar_alpha): void {
  throw new Error(
    "raise: HgcYUV420TriPlanar_alpha::HgcYUV420TriPlanar_alpha() @Helium " +
      "0x0e67e1 is not yet decoded — the owned Metal-shader dispatch node's ctor.",
  );
}

/**
 * HGObject::Release() — vtable slot 0x18 on m_hgcNode (or on a freshly-
 * allocated candidate node).
 *
 *   @Helium 0x0e6715  callq *0x18(%rcx)   (D2)
 *   @Helium 0x0e6755  callq *0x18(%rcx)   (D1)
 *   @Helium 0x0e6792  callq *0x18(%rax)   (D0)
 *   @Helium 0x0e67fe  callq *0x18(%rax)   (GetOutput — release OLD m_hgcNode)
 *   @Helium 0x0e6818  callq *0x18(%rax)   (GetOutput — release NEW candidate
 *                                          when it identity-matches m_hgcNode)
 */
function HGObject_Release_via_vtable_stub(_p: HgcYUV420TriPlanar_alpha): void {
  throw new Error(
    "raise: HGObject::Release via *0x18(vtable) @Helium 0x0e6715 is not yet " +
      "decoded — vtable slot 0x18 on a HgcYUV420TriPlanar_alpha instance.",
  );
}

/**
 * HGNode::SetInput(int, HGNode*) — vtable slot 0x78 on m_hgcNode.
 *
 *   @Helium 0x0e683b  callq *0x78(%rcx)
 */
function HGNode_SetInput_via_vtable_stub(
  _target: HgcYUV420TriPlanar_alpha,
  _inputIndex: number,
  _source: HGNode_base,
): void {
  throw new Error(
    "raise: HGNode::SetInput via *0x78(vtable) @Helium 0x0e683b is not yet " +
      "decoded — vtable slot 0x78 on a HgcYUV420TriPlanar_alpha instance.",
  );
}

/**
 * HGRenderer::GetInput(HGNode*, int) — direct member call from GetOutput.
 *
 *   @Helium 0x0e682a  callq __ZN10HGRenderer8GetInputEP6HGNodei
 *
 * Second arg is 0 (`xorl %edx, %edx` @0x0e6828). Returns the upstream HGNode*.
 */
function HGRenderer_GetInput_stub(
  _renderer: HGRenderer,
  _node: HGYUV444ToPlanarAlpha,
  _inputIndex: number,
): HGNode_base {
  throw new Error(
    "raise: HGRenderer::GetInput(HGNode*, int) @Helium 0x0e682a is not yet " +
      "decoded — the frame-graph input resolver.",
  );
}

// ── The class ────────────────────────────────────────────────────────────────

export class HGYUV444ToPlanarAlpha {
  /**
   * +0x000 — vtable pointer. Set in C1 @0x0e66ce-0x0e66d5:
   *   leaq 0x928403(%rip), %rax   →  0x0e66d5 + 0x928403 = 0xa0ead8
   *   movq %rax, (%rbx)
   * C2 uses a different %rip offset (0x928433 @0x0e669e → same 0xa0ead8).
   * D2/D1/D0 re-stamp the vptr with progressively smaller %rip offsets, all
   * resolving to the same class vtable address — standard Itanium-ABI
   * "restore parent vtable during destruction" behaviour.
   */
  readonly __vtable = "HGYUV444ToPlanarAlpha::vtable @Helium 0xa0ead8";

  /**
   * +0x008..+0x197 — inherited HGNode state (opaque; owned by the base
   * sub-object which is constructed in place by `HGNode::HGNode()` @0x0e6699).
   */
  readonly base: HGNode_base;

  /**
   * +0x198 — owned HgcYUV420TriPlanar_alpha pointer. Initialised NULL by the
   * ctor (@0x0e66a8 / @0x0e66d8: `movq $0x0, 0x198(%rbx)`) and lazily
   * allocated on the first GetOutput call.
   */
  m_hgcNode: HgcYUV420TriPlanar_alpha | null;

  /**
   * HGYUV444ToPlanarAlpha()  [C1]  →  @Helium 0x00000000000e66c0
   *   (__ZN21HGYUV444ToPlanarAlphaC1Ev — the C2 body @0x0e6690 is byte-
   *    identical modulo the vtable-load %rip offset that resolves to the
   *    SAME class vtable.)
   *
   * DECODE (raw-port/re/disasm/Helium.HGYUV444ToPlanarAlpha.all.s):
   *   0x0e66c6  movq  %rdi, %rbx                 ; save `this`
   *   0x0e66c9  callq __ZN6HGNodeC2Ev            ; HGNode base ctor
   *   0x0e66ce  leaq  0x928403(%rip), %rax       ; = vtable-for-HGYUV444ToPlanarAlpha
   *   0x0e66d5  movq  %rax, (%rbx)               ; this->vptr = vtable
   *   0x0e66d8  movq  $0x0, 0x198(%rbx)          ; this->m_hgcNode = NULL
   *   0x0e66e3..0x0e66e9  pop/ret
   */
  constructor() {
    // Model the HGNode base sub-object as an opaque handle.
    const base = { __brand_HGNode: Symbol("HGNode") } as unknown as HGNode_base;
    // @0x0e66c9  callq HGNode::HGNode() — raises: base layout not decoded.
    HGNode_base_ctor_stub(base);
    this.base = base;
    // @0x0e66d8  this->m_hgcNode = NULL.
    this.m_hgcNode = null;
  }

  /**
   * ~HGYUV444ToPlanarAlpha()  [D2 — base-object dtor]  →  @Helium 0x00000000000e66f0
   *   (__ZN21HGYUV444ToPlanarAlphaD2Ev)
   *
   * DECODE (raw-port/re/disasm/Helium.HGYUV444ToPlanarAlpha.all.s):
   *   0x0e66f6  leaq  0x9283db(%rip), %rax       ; = vtable-for-HGYUV444ToPlanarAlpha
   *   0x0e66fd  movq  %rax, (%rdi)               ; this->vptr = vtable (re-stamp)
   *   0x0e6700  movq  0x198(%rdi), %rax          ; %rax = m_hgcNode
   *   0x0e6707  testq %rax, %rax                 ; null-check
   *   0x0e670a  je 0xe671b                       ; if NULL: skip Release
   *   0x0e670c  movq  (%rax), %rcx               ; %rcx = m_hgcNode->vptr
   *   0x0e670f  movq  %rdi, %rbx
   *   0x0e6712  movq  %rax, %rdi                 ; arg1 = m_hgcNode
   *   0x0e6715  callq *0x18(%rcx)                ; HGObject::Release()
   *   0x0e6718  movq  %rbx, %rdi
   *   0x0e6721  jmp   __ZN6HGNodeD2Ev            ; tail-call base D2
   *   ; exception-unwind path:
   *   0x0e6729  callq ___clang_call_terminate
   */
  destruct_D2(): void {
    // @0x0e66fd  vptr re-stamp (no-op in TS with prototype-based dispatch).
    // @0x0e6707-0x0e6715  null-guarded Release of m_hgcNode.
    if (this.m_hgcNode !== null) {
      HGObject_Release_via_vtable_stub(this.m_hgcNode);
    }
    // @0x0e6721  jmp HGNode::~HGNode() (tail call).
    HGNode_base_dtor_stub(this.base);
  }

  /**
   * ~HGYUV444ToPlanarAlpha()  [D1 — complete-object dtor]  →  @Helium 0x00000000000e6730
   *   (__ZN21HGYUV444ToPlanarAlphaD1Ev)
   *
   * DECODE (raw-port/re/disasm/Helium.HGYUV444ToPlanarAlpha.all.s):
   *   Byte-identical to D2 except for the vtable-load %rip offset:
   *     0x0e6736  leaq 0x92839b(%rip), %rax   ; next-instr 0x0e673d → same 0xa0ead8
   *   Otherwise identical:
   *     0x0e6740  movq 0x198(%rdi), %rax      ; m_hgcNode
   *     0x0e6747  testq %rax, %rax  ;  0x0e674a je 0xe675b
   *     0x0e6755  callq *0x18(%rcx)            ; HGObject::Release()
   *     0x0e6761  jmp   __ZN6HGNodeD2Ev
   *     0x0e6769  callq ___clang_call_terminate  (unwind)
   */
  destruct_D1(): void {
    if (this.m_hgcNode !== null) {
      HGObject_Release_via_vtable_stub(this.m_hgcNode);   // @0x0e6755
    }
    HGNode_base_dtor_stub(this.base);                     // @0x0e6761
  }

  /**
   * ~HGYUV444ToPlanarAlpha()  [D0 — deleting dtor]  →  @Helium 0x00000000000e6770
   *   (__ZN21HGYUV444ToPlanarAlphaD0Ev)
   *
   * DECODE (raw-port/re/disasm/Helium.HGYUV444ToPlanarAlpha.all.s):
   *   0x0e6776  movq  %rdi, %rbx                 ; save `this`
   *   0x0e6779  leaq  0x928358(%rip), %rax       ; = vtable-for-HGYUV444ToPlanarAlpha
   *   0x0e6780  movq  %rax, (%rdi)               ; this->vptr = vtable (re-stamp)
   *   0x0e6783  movq  0x198(%rdi), %rdi          ; %rdi = m_hgcNode
   *   0x0e678a  testq %rdi, %rdi                 ; null-check
   *   0x0e678d  je 0xe6795                       ; if NULL: skip Release
   *   0x0e678f  movq  (%rdi), %rax               ; %rax = m_hgcNode->vptr
   *   0x0e6792  callq *0x18(%rax)                ; HGObject::Release()
   *   0x0e6795  movq  %rbx, %rdi
   *   0x0e6798  callq __ZN6HGNodeD2Ev            ; base D2 (NOT tail — D0 has more work)
   *   0x0e679d  movq  %rbx, %rdi
   *   0x0e67a0..0x0e67a5  pop
   *   0x0e67a6  jmp   __ZN8HGObjectdlEPv         ; tail-call operator delete(this)
   *   ; exception-unwind path:
   *   0x0e67ae  callq ___clang_call_terminate
   *
   * D0 = D1 body + operator delete(this). In TS under GC there is nothing
   * extra beyond D1; we surface the operator-delete site as a stub.
   */
  destruct_D0(): void {
    if (this.m_hgcNode !== null) {
      HGObject_Release_via_vtable_stub(this.m_hgcNode);   // @0x0e6792
    }
    HGNode_base_dtor_stub(this.base);                     // @0x0e6798
    // @0x0e67a6  jmp HGObject::operator delete(this).
    HGObject_operator_delete_stub(this);
  }

  /**
   * GetOutput(HGRenderer*)  →  HgcYUV420TriPlanar_alpha*
   * @Helium 0x00000000000e67c0  (__ZN21HGYUV444ToPlanarAlpha9GetOutputEP10HGRenderer)
   *
   * DECODE (raw-port/re/disasm/Helium.HGYUV444ToPlanarAlpha.all.s):
   *   0x0e67cb  movq  %rsi, %r14                 ; %r14 = renderer
   *   0x0e67ce  movq  %rdi, %rbx                 ; %rbx = `this`
   *   ── allocate a candidate node ──
   *   0x0e67d1  movl  $0x200, %edi               ; imm = 0x200 (sizeof HgcYUV420TriPlanar_alpha)
   *   0x0e67d6  callq __ZN8HGObjectnwEm          ; HGObject::operator new(0x200)
   *   0x0e67db  movq  %rax, %r15                 ; %r15 = raw storage (candidate)
   *   0x0e67de  movq  %rax, %rdi
   *   0x0e67e1  callq __ZN24HgcYUV420TriPlanar_alphaC1Ev  ; ctor the candidate
   *   0x0e67e6  movq  0x198(%rbx), %r12          ; %r12 = current m_hgcNode
   *   0x0e67ed  cmpq  %r15, %r12                 ; if candidate == current
   *   0x0e67f0  je 0xe680d                       ;   → jump to identity-match path
   *   ── replacement path (candidate ≠ current m_hgcNode) ──
   *   0x0e67f2  testq %r12, %r12                 ; null-check current m_hgcNode
   *   0x0e67f5  je 0xe6801                       ; if NULL: skip Release
   *   0x0e67f7  movq  (%r12), %rax               ; %rax = current->vptr
   *   0x0e67fb  movq  %r12, %rdi
   *   0x0e67fe  callq *0x18(%rax)                ; Release() the OLD m_hgcNode
   *   0x0e6801  movq  %r15, 0x198(%rbx)          ; this->m_hgcNode = candidate
   *   0x0e6808  movq  %r15, %r12                 ; %r12 = candidate (used-node)
   *   0x0e680b  jmp 0xe6822                      ; skip identity-match branch
   *   ── identity-match path (candidate == current m_hgcNode) ──
   *   0x0e680d  testq %r15, %r15                 ; null-check candidate
   *   0x0e6810  je 0xe6822                       ; if NULL: skip Release
   *   0x0e6812  movq  (%r15), %rax
   *   0x0e6815  movq  %r15, %rdi
   *   0x0e6818  callq *0x18(%rax)                ; Release() the CANDIDATE
   *                                              ;   (net effect: drop the extra refcount
   *                                              ;    the freshly-allocated candidate held
   *                                              ;    so that current m_hgcNode's refcount
   *                                              ;    stays balanced.)
   *   0x0e681b  movq  0x198(%rbx), %r12          ; %r12 = current m_hgcNode (unchanged)
   *   ── shared tail: wire the frame-graph input ──
   *   0x0e6822  movq  %r14, %rdi                 ; arg1 = renderer
   *   0x0e6825  movq  %rbx, %rsi                 ; arg2 = this (as HGNode*)
   *   0x0e6828  xorl  %edx, %edx                 ; arg3 = 0 (input index)
   *   0x0e682a  callq __ZN10HGRenderer8GetInputEP6HGNodei
   *   0x0e682f  movq  (%r12), %rcx               ; %rcx = m_hgcNode->vptr
   *   0x0e6833  movq  %r12, %rdi                 ; arg1 = m_hgcNode
   *   0x0e6836  xorl  %esi, %esi                 ; arg2 = 0 (input index)
   *   0x0e6838  movq  %rax, %rdx                 ; arg3 = upstreamNode
   *   0x0e683b  callq *0x78(%rcx)                ; HGNode::SetInput(0, upstreamNode)
   *   0x0e683e  movq  0x198(%rbx), %rax          ; return this->m_hgcNode
   *   0x0e6845+ pop / ret
   *
   * Semantics: allocate a fresh HgcYUV420TriPlanar_alpha; if it identity-
   * matches the currently-installed one (freelist hit), release the
   * newly-allocated one (equivalent to "no-op replace"); otherwise release
   * the old one and install the new. Then wire this node's index-0 input
   * (as resolved by the renderer) into the installed HgcYUV420TriPlanar_alpha
   * as its input #0, and return the installed HgcYUV420TriPlanar_alpha.
   *
   * @param renderer  the frame-graph renderer.
   * @returns  this.m_hgcNode — the Metal-shader dispatch node.
   */
  GetOutput(renderer: HGRenderer): HgcYUV420TriPlanar_alpha {
    // @0x0e67d6  candidate = HGObject::operator new(0x200)
    const candidate = HGObject_operator_new_stub(0x200);
    // @0x0e67e1  HgcYUV420TriPlanar_alpha::HgcYUV420TriPlanar_alpha(candidate)
    HgcYUV420TriPlanar_alpha_ctor_stub(candidate);

    // @0x0e67e6  load current m_hgcNode
    const current = this.m_hgcNode;
    let installed: HgcYUV420TriPlanar_alpha;

    // @0x0e67ed-0x0e67f0  compare candidate vs current
    if (current === candidate) {
      // ── identity-match path @0x0e680d..@0x0e681b ──
      // @0x0e6818  Release() the candidate (drop the extra freshly-taken ref).
      HGObject_Release_via_vtable_stub(candidate);
      // @0x0e681b  installed = current m_hgcNode (unchanged; non-null here
      //           because current === candidate and candidate is a freshly-
      //           constructed non-null pointer).
      installed = current;
    } else {
      // ── replacement path @0x0e67f2..@0x0e680b ──
      // @0x0e67f2-0x0e67fe  null-guarded Release of the OLD m_hgcNode.
      if (current !== null) {
        HGObject_Release_via_vtable_stub(current);
      }
      // @0x0e6801  this->m_hgcNode = candidate
      this.m_hgcNode = candidate;
      // @0x0e6808  installed = candidate
      installed = candidate;
    }

    // @0x0e682a  upstreamNode = renderer.GetInput(this, 0)
    const upstream = HGRenderer_GetInput_stub(renderer, this, 0);
    // @0x0e683b  installed.vtable[0x78](0, upstream) → HGNode::SetInput
    HGNode_SetInput_via_vtable_stub(installed, 0, upstream);
    // @0x0e683e  return this->m_hgcNode
    // (In the replacement path installed === this.m_hgcNode; in the identity
    //  path they're equal too. Return this.m_hgcNode to mirror the exact
    //  reload the disasm performs at @0x0e683e.)
    const result = this.m_hgcNode;
    if (result === null) {
      // The disasm does not null-check here — reaching this point with a
      // null m_hgcNode would be a bug in the C++ code as well. We surface
      // the disagreement rather than silently returning a placeholder.
      throw new Error(
        "raise: HGYUV444ToPlanarAlpha::GetOutput @Helium 0x0e683e — " +
          "this.m_hgcNode became null between installation @0x0e6801 and " +
          "the return-value load @0x0e683e; this cannot happen in the C++ " +
          "control-flow.",
      );
    }
    return result;
  }
}

/**
 * The class's own vtable address is @Helium 0xa0ead8 (recovered from every
 * ctor / dtor vptr-write site: leaq 0x928403(%rip) @0x0e66ce → 0x0e66d5 +
 * 0x928403 = 0xa0ead8; the D2 / D1 / D0 re-stamps and the C2 ctor all
 * resolve to the same address with different %rip offsets).
 */
export const HGYUV444ToPlanarAlpha_vtable_addr = "@Helium 0xa0ead8" as const;
