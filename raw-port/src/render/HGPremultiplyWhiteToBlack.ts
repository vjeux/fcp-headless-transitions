// HGPremultiplyWhiteToBlack.ts — Helium's HGPremultiplyWhiteToBlack
// render-graph node: a thin HGNode subclass that owns a single
// HgcPremultiplyWhiteToBlack compute kernel at offset 0x198 on `this`.
// The wrapper class exposes only the ctors/dtors and a GetOutput vfn that
// binds the renderer's upstream input to slot 0 of the kernel and then
// returns the kernel pointer as the node's output.
//
// This class shares the exact structural pattern with HGColorBias (and
// dozens of other Helium wrapper nodes): a fixed-size compute-kernel
// pointer at +0x198 is heap-allocated in the ctor via
// `HGObject::operator new(0x1a0)` + kernel::C1, and released in the dtors
// via the kernel's vtable slot 0x18 (`~kernel`-shape).
//
// Distinguishing shape from HGColorBias:
//   * No SetParameter forwarder — this class has no parameters to
//     configure; the kernel is fully parameterized at construction time.
//   * The ctor does NOT zero *(this+0x198) before installing the newly
//     allocated kernel (HGColorBias's C2 @0x1a0c4c did), so there is no
//     swap-and-release dance. It's a straight store.
//   * D1/D2/D0 unconditionally load *(this+0x198) and dereference it —
//     there is no null guard, unlike HGColorBias's dtors which tested
//     the kernel pointer. This class treats +0x198 as an invariant
//     non-null owned pointer for its whole lifetime.
//
// Provenance: /Applications/Final Cut Pro.app/Contents/Frameworks/
//             Helium.framework/Versions/A/Helium (x86_64 slice at file
//             offset 0x4000 + text VA).
// Disassembly saved at:
//   raw-port/re/disasm/Helium.HGPremultiplyWhiteToBlack.C2Ev.s                  @0x157e70
//   raw-port/re/disasm/Helium.HGPremultiplyWhiteToBlack.C1Ev.s                  @0x157ef0
//   raw-port/re/disasm/Helium.HGPremultiplyWhiteToBlack.D2Ev.s                  @0x157f70
//   raw-port/re/disasm/Helium.HGPremultiplyWhiteToBlack.D1Ev.s                  @0x157fb0
//   raw-port/re/disasm/Helium.HGPremultiplyWhiteToBlack.D0Ev.s                  @0x157ff0
//   raw-port/re/disasm/Helium.HGPremultiplyWhiteToBlack.9GetOutputEP10HGRenderer.s @0x158030
//
// STRUCT LAYOUT (recovered from C2 / D1 / D0 / GetOutput):
//   HGPremultiplyWhiteToBlack {
//     +0x000  vptr                       (rip-relative in each method — C2
//                                          @0x157e82 loads 0x8c877f; C1
//                                          @0x157f02 loads 0x8c86ff; D2
//                                          @0x157f79 loads 0x8c8688; D1
//                                          @0x157fb9 loads 0x8c8648; D0
//                                          @0x157ff9 loads 0x8c8608 — all
//                                          resolve to the same
//                                          vtable-for-HGPremultiplyWhiteToBlack)
//     +0x008..+0x197                     (HGNode base subobject — undecoded)
//     +0x198  HgcPremultiplyWhiteToBlack* (owned; allocated in C2 @0x157e91
//                                          via HGObject::operator new(0x1a0),
//                                          constructed via
//                                          __ZN26HgcPremultiplyWhiteToBlackC1Ev
//                                          @0x157e9c, stored @0x157ea1)
//   }
//
// The kernel vtable slot at offset 0x18 is its release/dispose vfn (called
// from every destructor); slot 0x78 is a "SetInput"-shape vfn called by
// GetOutput with args (kernel, 0, upstreamHGNode). Both are undecoded and
// surface as throwing frontier stubs.
//
// ─── C2 @Helium 0x157e70 (base-object ctor) ─────────────────────────────────
//   Arguments: %rdi = this
//   __ZN25HGPremultiplyWhiteToBlackC2Ev:
//     0x157e70 push rbp/rsp/r15/r14/rbx / prologue
//     0x157e7a movq  %rdi, %rbx
//     0x157e7d callq __ZN6HGNodeC2Ev            ; HGNode::HGNode()
//     0x157e82 leaq  0x8c877f(%rip), %rax        ; = vtable-for-...
//     0x157e89 movq  %rax, (%rbx)               ; this->vptr = vtable
//     0x157e8c movl  $0x1a0, %edi                ; sizeof kernel = 416
//     0x157e91 callq __ZN8HGObjectnwEm           ; HGObject::operator new
//     0x157e96 movq  %rax, %r14
//     0x157e99 movq  %rax, %rdi
//     0x157e9c callq __ZN26HgcPremultiplyWhiteToBlackC1Ev  ; kernel ctor
//     0x157ea1 movq  %r14, 0x198(%rbx)          ; this->kernel = r14
//     0x157ea8..0x157eb2  epilogue / retq
//     0x157eb3..0x157ee1  exception cleanup — deletes the half-constructed
//                          kernel (@0x157eb9), tears down the HGNode base
//                          (@0x157ec1), and re-throws via __Unwind_Resume.
//                          In TS the throw semantics + GC subsume this.
//
//   Note: unlike HGColorBias::C2 (which zeroed *(this+0x198) before the
//   swap dance), this ctor writes the pointer directly with `movq %r14,
//   0x198(%rbx)`. There is no swap or release-if-different — the slot is
//   assumed to be uninitialized garbage that will be overwritten.
//
// ─── C1 @Helium 0x157ef0 (complete-object ctor) ─────────────────────────────
//   Byte-identical body to C2 except for the RIP delta on the vtable-leaq
//   (@0x157f02: 0x8c86ff vs @0x157e82: 0x8c877f — same absolute address).
//   Not a trampoline in this class: both entry points contain the full
//   ctor body inline. This matches Itanium C1/C2 aliasing for a class with
//   no virtual bases where the two symbols share identical work but are
//   emitted as separate function bodies rather than trampolined.
//
// ─── D2 @Helium 0x157f70 (base-object dtor) ─────────────────────────────────
//   __ZN25HGPremultiplyWhiteToBlackD2Ev:
//     0x157f70 push rbp/rsp/rbx/rax
//     0x157f76 movq  %rdi, %rbx
//     0x157f79 leaq  0x8c8688(%rip), %rax        ; vtable-for-...
//     0x157f80 movq  %rax, (%rdi)               ; reset vptr (defensive)
//     0x157f83 movq  0x198(%rdi), %rdi          ; rdi = this->kernel
//     0x157f8a movq  (%rdi), %rax               ; rax = kernel->vptr
//     0x157f8d callq *0x18(%rax)                ; kernel->vptr[3] (release)
//     0x157f90 movq  %rbx, %rdi
//     0x157f99 jmp   __ZN6HGNodeD2Ev             ; tail-chain HGNode::~D2
//
//   Note: no null check on the kernel pointer @0x157f83 — it's an invariant
//   non-null owned pointer. Mirrors the C2 initialization discipline.
//
// ─── D1 @Helium 0x157fb0 (complete-object dtor) ─────────────────────────────
//   Byte-identical body to D2 (same "no null check → release → chain into
//   HGNode::~D2"). Only the RIP delta differs on the vtable-leaq
//   (@0x157fb9: 0x8c8648 vs @0x157f79: 0x8c8688 — same absolute address).
//
// ─── D0 @Helium 0x157ff0 (deleting dtor) ────────────────────────────────────
//   __ZN25HGPremultiplyWhiteToBlackD0Ev:
//     0x157ff0 push rbp/rsp/rbx/rax
//     0x157ff6 movq  %rdi, %rbx
//     0x157ff9 leaq  0x8c8608(%rip), %rax        ; vtable-for-...
//     0x158000 movq  %rax, (%rdi)               ; reset vptr
//     0x158003 movq  0x198(%rdi), %rdi          ; rdi = this->kernel
//     0x15800a movq  (%rdi), %rax               ; rax = kernel->vptr
//     0x15800d callq *0x18(%rax)                ; kernel->vptr[3] (release)
//     0x158010 movq  %rbx, %rdi
//     0x158013 callq __ZN6HGNodeD2Ev             ; HGNode::~HGNode()
//     0x158018 movq  %rbx, %rdi
//     0x158021 jmp   __ZN8HGObjectdlEPv          ; HGObject::operator delete
//
//   D0 = D1 body + trailing `HGObject::operator delete(this)`. Canonical
//   Itanium ABI deleting dtor.
//
// ─── GetOutput @Helium 0x158030 ─────────────────────────────────────────────
//   Arguments: %rdi = this, %rsi = HGRenderer*
//   __ZN25HGPremultiplyWhiteToBlack9GetOutputEP10HGRenderer:
//     0x158030 push rbp/rsp/rbx/rax
//     0x158036 movq  %rdi, %rbx                 ; save this
//     0x158039 movq  %rsi, %rdi                 ; arg1 = renderer
//     0x15803c movq  %rbx, %rsi                 ; arg2 = this (HGNode*)
//     0x15803f xorl  %edx, %edx                 ; arg3 = 0 (input slot)
//     0x158041 callq __ZN10HGRenderer8GetInputEP6HGNodei
//                                                ; HGRenderer::GetInput
//     0x158046 movq  0x198(%rbx), %rdi          ; rdi = this->kernel
//     0x15804d movq  (%rdi), %rcx               ; rcx = kernel->vptr
//     0x158050 xorl  %esi, %esi                 ; arg2 = 0
//     0x158052 movq  %rax, %rdx                 ; arg3 = upstream node
//     0x158055 callq *0x78(%rcx)                ; kernel->vptr[15]
//                                                ;   (SetInput-shape)
//     0x158058 movq  0x198(%rbx), %rax          ; return this->kernel
//     0x15805f..0x158065 epilogue / retq
//
//   Semantics identical to HGColorBias::GetOutput: (1) ask renderer for
//   input slot 0 of this node, (2) bind the returned upstream node into
//   the kernel via its slot-0x78 vfn with args (kernel, 0, upstream),
//   (3) return the kernel pointer as this node's output.
//
// FRONTIER CALLEES (undecoded — throwing stubs cite them):
//   __ZN6HGNodeC2Ev                    HGNode::HGNode()                 @0x157e7d/@0x157efd
//   __ZN6HGNodeD2Ev                    HGNode::~HGNode()                @0x157f99/@0x157fd9/@0x158013 (and @0x157ec1/@0x157ed4/@0x157f41/@0x157f54 in exception paths)
//   __ZN8HGObjectnwEm                  HGObject::operator new(size)     @0x157e91/@0x157f11
//   __ZN8HGObjectdlEPv                 HGObject::operator delete(void*) @0x158021 (D0) and @0x157eb9/@0x157f39 (exception paths)
//   __ZN26HgcPremultiplyWhiteToBlackC1Ev HgcPremultiplyWhiteToBlack::C1  @0x157e9c/@0x157f1c
//   HgcPremultiplyWhiteToBlack vfn @0x18 (release)  — @0x157f8d @0x157fcd @0x15800d
//   HgcPremultiplyWhiteToBlack vfn @0x78 (SetInput) — @0x158055
//   __ZN10HGRenderer8GetInputEP6HGNodei HGRenderer::GetInput            @0x158041
//   ___clang_call_terminate                                              @0x157fa1/@0x157fe1/@0x158029
//   __Unwind_Resume                                                      @0x157ec9/@0x157edc/@0x157f49/@0x157f5c
//
// Numerics: none — this class shuffles pointers and calls vfns; no float
// or integer arithmetic is performed at this layer. All numeric work lives
// in the kernel.

/* eslint-disable @typescript-eslint/no-unused-vars */

/**
 * Opaque handle for Helium's `HGRenderer*` — the render-graph context.
 * Only `HGRenderer::GetInput(HGNode*, int)` is referenced from this class,
 * via the throwing frontier stub below.
 */
export type HGRendererPtr = { readonly __brand: "HGRenderer" };

/**
 * Opaque handle for Helium's `HGNode*` (base class). HGPremultiplyWhiteToBlack
 * derives from HGNode; the base subobject occupies bytes 0x000..0x197 of
 * `this`, and this class adds a single field at +0x198 (the kernel).
 */
export type HGNodePtr = { readonly __brand: "HGNode" };

/**
 * `HgcPremultiplyWhiteToBlack` — Helium's compute-kernel wrapper for the
 * "premultiply white-to-black" per-pixel operation. Owned by
 * HGPremultiplyWhiteToBlack at offset 0x198. Its full class is not yet
 * transcribed; we brand it here and cite the two vtable slots that this
 * wrapper touches.
 *
 * Vtable slots referenced by HGPremultiplyWhiteToBlack:
 *   +0x18  release/dispose  — @0x157f8d @0x157fcd @0x15800d
 *   +0x78  SetInput-shape (self, 0, upstream) — @0x158055
 *
 * Sized 0x1a0 bytes (416) — from `movl $0x1a0, %edi` @0x157e8c/@0x157f0c
 * preceding `HGObject::operator new(unsigned long)`.
 */
export interface HgcPremultiplyWhiteToBlack {
  readonly __brand: "HgcPremultiplyWhiteToBlack";
}

/**
 * Frontier: `HGNode::HGNode()` — base-class constructor. Called from
 * HGPremultiplyWhiteToBlack::C2 @0x157e7d and C1 @0x157efd. Not yet
 * transcribed.
 */
function HGNode_C2(_self: HGPremultiplyWhiteToBlack): void {
  // @0x157e7d callq __ZN6HGNodeC2Ev  (C2)
  // @0x157efd callq __ZN6HGNodeC2Ev  (C1)
  throw new Error(
    "HGNode::HGNode() @Helium __ZN6HGNodeC2Ev @0x157e7d/@0x157efd not yet transcribed",
  );
}

/**
 * Frontier: `HGNode::~HGNode()` — base-class dtor. Tail-chained from
 * HGPremultiplyWhiteToBlack::D2 @0x157f99 and D1 @0x157fd9, and called
 * directly from D0 @0x158013 (also from C2's exception-cleanup path
 * @0x157ec1/@0x157ed4 and C1's @0x157f41/@0x157f54; not modeled). Not yet
 * transcribed.
 */
function HGNode_D2(_self: HGPremultiplyWhiteToBlack): void {
  // @0x157f99 jmp __ZN6HGNodeD2Ev   (D2)
  // @0x157fd9 jmp __ZN6HGNodeD2Ev   (D1)
  // @0x158013 callq __ZN6HGNodeD2Ev (D0)
  throw new Error(
    "HGNode::~HGNode() @Helium __ZN6HGNodeD2Ev @0x157f99/@0x157fd9/@0x158013 not yet transcribed",
  );
}

/**
 * Frontier: `HGObject::operator new(unsigned long)` — allocates the kernel
 * @0x157e91 (C2) / @0x157f11 (C1) with size argument 0x1a0. Not yet
 * transcribed.
 */
function HGObject_operator_new(_size: number): HgcPremultiplyWhiteToBlack {
  // @0x157e91 callq __ZN8HGObjectnwEm  (C2, %edi=0x1a0)
  // @0x157f11 callq __ZN8HGObjectnwEm  (C1, %edi=0x1a0)
  throw new Error(
    "HGObject::operator new @Helium __ZN8HGObjectnwEm @0x157e91/@0x157f11 not yet transcribed",
  );
}

/**
 * Frontier: `HGObject::operator delete(void*)` — reached at @0x158021
 * (`jmp`) from D0 as the deleting-dtor tail; also from C2/C1 exception
 * unwind at @0x157eb9/@0x157f39 (not modeled). Not yet transcribed.
 */
function HGObject_operator_delete(
  _p: HGPremultiplyWhiteToBlack | HgcPremultiplyWhiteToBlack,
): void {
  // @0x158021 jmp __ZN8HGObjectdlEPv  (D0)
  throw new Error(
    "HGObject::operator delete @Helium __ZN8HGObjectdlEPv @0x158021 not yet transcribed",
  );
}

/**
 * Frontier: `HgcPremultiplyWhiteToBlack::HgcPremultiplyWhiteToBlack()` —
 * constructs the freshly `operator new`'d kernel storage. Called from C2
 * @0x157e9c and C1 @0x157f1c. Not yet transcribed.
 */
function HgcPremultiplyWhiteToBlack_C1(
  _self: HgcPremultiplyWhiteToBlack,
): void {
  // @0x157e9c callq __ZN26HgcPremultiplyWhiteToBlackC1Ev  (C2)
  // @0x157f1c callq __ZN26HgcPremultiplyWhiteToBlackC1Ev  (C1)
  throw new Error(
    "HgcPremultiplyWhiteToBlack::HgcPremultiplyWhiteToBlack @Helium __ZN26HgcPremultiplyWhiteToBlackC1Ev @0x157e9c/@0x157f1c not yet transcribed",
  );
}

/**
 * Frontier: HgcPremultiplyWhiteToBlack vtable slot 0x18 — the kernel's
 * release/dispose vfn. Called from D2 @0x157f8d, D1 @0x157fcd, and D0
 * @0x15800d. Not yet transcribed.
 */
function HgcPremultiplyWhiteToBlack_vfn_0x18_release(
  _self: HgcPremultiplyWhiteToBlack,
): void {
  // @0x157f8d callq *0x18(%rax)  (D2)
  // @0x157fcd callq *0x18(%rax)  (D1)
  // @0x15800d callq *0x18(%rax)  (D0)
  throw new Error(
    "HgcPremultiplyWhiteToBlack vtable[0x18] (release) @Helium @0x157f8d/@0x157fcd/@0x15800d not yet transcribed",
  );
}

/**
 * Frontier: HgcPremultiplyWhiteToBlack vtable slot 0x78 — call shape
 * `(self, 0, upstreamHGNode)`, consistent with a "SetInput(slot=0, node)"
 * vfn. Called from GetOutput @0x158055. Not yet transcribed.
 */
function HgcPremultiplyWhiteToBlack_vfn_0x78(
  _self: HgcPremultiplyWhiteToBlack,
  _zero: number,
  _upstream: HGNodePtr | null,
): void {
  // @0x158055 callq *0x78(%rcx)
  throw new Error(
    "HgcPremultiplyWhiteToBlack vtable[0x78] (SetInput-shape) @Helium @0x158055 not yet transcribed",
  );
}

/**
 * Frontier: `HGRenderer::GetInput(HGNode* self, int slot)` — called from
 * GetOutput @0x158041 with slot=0. Not yet transcribed.
 */
function HGRenderer_GetInput(
  _r: HGRendererPtr,
  _self: HGNodePtr,
  _slot: number,
): HGNodePtr | null {
  // @0x158041 callq __ZN10HGRenderer8GetInputEP6HGNodei
  throw new Error(
    "HGRenderer::GetInput @Helium __ZN10HGRenderer8GetInputEP6HGNodei @0x158041 not yet transcribed",
  );
}

/**
 * `HGPremultiplyWhiteToBlack` — Helium's render-graph node wrapping the
 * "premultiply white-to-black" compute kernel.
 *
 * @Helium symbols owned by this class:
 *   C2         @0x157e70
 *   C1         @0x157ef0
 *   D2         @0x157f70
 *   D1         @0x157fb0
 *   D0         @0x157ff0
 *   GetOutput  @0x158030
 *
 * Struct fields:
 *   vptr                     (offset 0x000)
 *   HGNode base subobject    (offsets 0x008..0x197, undecoded)
 *   kernel                   (offset 0x198 — HgcPremultiplyWhiteToBlack*
 *                             owned, invariant non-null)
 */
export class HGPremultiplyWhiteToBlack {
  /**
   * The owned HgcPremultiplyWhiteToBlack kernel at offset 0x198. Allocated
   * and constructed in C2 (@0x157e91/@0x157e9c), returned by GetOutput
   * (@0x158058), released via its vtable slot 0x18 by every destructor
   * (@0x157f8d/@0x157fcd/@0x15800d).
   *
   * Invariant: non-null between successful ctor completion and dtor entry.
   * D1/D2/D0 all dereference it without a null guard.
   */
  kernel: HgcPremultiplyWhiteToBlack;

  /**
   * HGPremultiplyWhiteToBlack::HGPremultiplyWhiteToBlack() [C2, base-object
   * ctor] @0x157e70.
   *
   *   @0x157e7d callq __ZN6HGNodeC2Ev
   *   @0x157e82 leaq  vtable-for-... into rax
   *   @0x157e89 movq  %rax, (%rbx)                 // this->vptr = vtable
   *   @0x157e8c movl  $0x1a0, %edi                 // sizeof = 416
   *   @0x157e91 callq __ZN8HGObjectnwEm
   *   @0x157e9c callq __ZN26HgcPremultiplyWhiteToBlackC1Ev
   *   @0x157ea1 movq  %r14, 0x198(%rbx)            // this->kernel = new
   *
   * Straight-line install (no swap dance) — the slot is never zeroed
   * beforehand, so the compiler doesn't emit a null-or-different check.
   */
  constructor() {
    // @0x157e7d — HGNode base ctor (undecoded frontier).
    HGNode_C2(this);
    // Unreachable until HGNode::HGNode is transcribed. The rest of the ctor
    // preserved verbatim below:
    // @0x157e91 kernel storage = HGObject::operator new(0x1a0)  (frontier)
    const newKernel = HGObject_operator_new(0x1a0);
    // @0x157e9c kernel storage->ctor()  (frontier)
    HgcPremultiplyWhiteToBlack_C1(newKernel);
    // @0x157ea1 this->kernel = newKernel
    this.kernel = newKernel;
  }

  /**
   * HGPremultiplyWhiteToBlack::HGPremultiplyWhiteToBlack() [C1,
   * complete-object ctor] @0x157ef0.
   *
   * NOT a trampoline in this class — C1 contains the full ctor body inline
   * (byte-identical to C2 except for RIP deltas on the vtable-leaq and the
   * `new`/`kernel::C1` GOT dispatches). Both entry points do the exact same
   * work; in TS the single constructor above serves both roles. This
   * factory preserves the address-space distinction for callers.
   */
  static C1(): HGPremultiplyWhiteToBlack {
    // @0x157ef0..@0x157f21 identical body to C2
    return new HGPremultiplyWhiteToBlack();
  }

  /**
   * HGPremultiplyWhiteToBlack::GetOutput(HGRenderer*) @0x158030.
   *
   *   @0x158039 movq %rsi, %rdi                    // arg1 = renderer
   *   @0x15803c movq %rbx, %rsi                    // arg2 = this
   *   @0x15803f xorl %edx, %edx                    // arg3 = 0
   *   @0x158041 callq HGRenderer::GetInput
   *   @0x158046 movq 0x198(%rbx), %rdi             // rdi = this->kernel
   *   @0x15804d movq (%rdi), %rcx                  // rcx = kernel->vptr
   *   @0x158050 xorl %esi, %esi                    // arg2 = 0
   *   @0x158052 movq %rax, %rdx                    // arg3 = upstream
   *   @0x158055 callq *0x78(%rcx)                  // kernel->vfn78(0, upstream)
   *   @0x158058 movq 0x198(%rbx), %rax             // return this->kernel
   *
   * Structurally identical to HGColorBias::GetOutput.
   */
  GetOutput(r: HGRendererPtr): HgcPremultiplyWhiteToBlack {
    // @0x158041 HGRenderer::GetInput(renderer, this, 0)
    const upstream = HGRenderer_GetInput(
      r,
      this as unknown as HGNodePtr,
      0,
    );
    // @0x158046..@0x158055 kernel->vptr[15](kernel, 0, upstream)
    HgcPremultiplyWhiteToBlack_vfn_0x78(this.kernel, 0, upstream);
    // @0x158058 return this->kernel
    return this.kernel;
  }

  /**
   * HGPremultiplyWhiteToBlack::~HGPremultiplyWhiteToBlack() [D2, base-object
   * dtor] @0x157f70.
   *
   *   @0x157f80 movq %rax, (%rdi)                  // reset vptr (defensive)
   *   @0x157f83 movq 0x198(%rdi), %rdi             // rdi = this->kernel
   *   @0x157f8a movq (%rdi), %rax                  // rax = kernel->vptr
   *   @0x157f8d callq *0x18(%rax)                  // kernel->release()
   *   @0x157f99 jmp   __ZN6HGNodeD2Ev              // tail-chain into base
   *
   * No null check on the kernel pointer — matches the C2 invariant.
   */
  destroy_D2(): void {
    // @0x157f80 vptr reset — no-op in TS.
    // @0x157f83..@0x157f8d release kernel
    HgcPremultiplyWhiteToBlack_vfn_0x18_release(this.kernel);
    // @0x157f99 tail-jmp HGNode::~D2
    HGNode_D2(this);
  }

  /**
   * HGPremultiplyWhiteToBlack::~HGPremultiplyWhiteToBlack() [D1,
   * complete-object dtor] @0x157fb0.
   *
   * Byte-identical body to D2 (only RIP delta differs on the vtable-leaq
   * @0x157fb9 vs @0x157f79 — same absolute vtable address). Same semantics:
   * release kernel, tail-chain into HGNode::~D2.
   */
  destroy_D1(): void {
    // @0x157fc0 vptr reset — no-op in TS.
    // @0x157fc3..@0x157fcd release kernel
    HgcPremultiplyWhiteToBlack_vfn_0x18_release(this.kernel);
    // @0x157fd9 tail-jmp HGNode::~D2
    HGNode_D2(this);
  }

  /**
   * HGPremultiplyWhiteToBlack::~HGPremultiplyWhiteToBlack() [D0, deleting
   * dtor] @0x157ff0.
   *
   *   @0x158000 movq %rax, (%rdi)                  // reset vptr
   *   @0x158003 movq 0x198(%rdi), %rdi             // rdi = this->kernel
   *   @0x15800a movq (%rdi), %rax                  // rax = kernel->vptr
   *   @0x15800d callq *0x18(%rax)                  // kernel->release()
   *   @0x158013 callq __ZN6HGNodeD2Ev              // HGNode::~HGNode()
   *   @0x158021 jmp   __ZN8HGObjectdlEPv           // operator delete(this)
   *
   * D0 = D1 body + trailing `HGObject::operator delete(this)`.
   */
  destroy_D0(): void {
    // @0x158000 vptr reset — no-op in TS.
    // @0x158003..@0x15800d release kernel
    HgcPremultiplyWhiteToBlack_vfn_0x18_release(this.kernel);
    // @0x158013 HGNode::~HGNode()
    HGNode_D2(this);
    // @0x158021 HGObject::operator delete(this)
    HGObject_operator_delete(this);
  }
}
