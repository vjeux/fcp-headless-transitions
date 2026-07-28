// HGColorBias.ts — Helium's HGColorBias render-graph node: a thin HGNode
// subclass whose only job is to own an HgcColorGamma_bias compute kernel
// (stored at offset 0x198 on `this`) and forward per-parameter updates plus
// the per-frame GetOutput vfn to it. This is the render-graph-facing wrapper
// (HGColor* / HGC* families are the graph nodes; Hgc* / lower-case-c is the
// underlying compute kernel).
//
// The class holds a single heap-owned kernel of size 0x1a0 bytes allocated
// in the constructor via `HGObject::operator new(0x1a0)`; the D1/D0
// destructors and (importantly) the ctor itself all use the same "swap into
// this+0x198, decrement the previous owner via vtable slot 0x18" idiom to
// manage that field.
//
// Provenance: /Applications/Final Cut Pro.app/Contents/Frameworks/
//             Helium.framework/Versions/A/Helium (x86_64 slice, file
//             offset 0x4000 + text VA).
// Disassembly saved at:
//   raw-port/re/disasm/Helium.HGColorBias.C2Ev.s               @0x1a0c30
//   raw-port/re/disasm/Helium.HGColorBias.C1Ev.s               @0x1a0d10
//   raw-port/re/disasm/Helium.HGColorBias.12SetParameterEiffff.s @0x1a0d20
//   raw-port/re/disasm/Helium.HGColorBias.9GetOutputEP10HGRenderer.s @0x1a0d40
//   raw-port/re/disasm/Helium.HGColorBias.D1Ev.s               @0x1a0d80
//   raw-port/re/disasm/Helium.HGColorBias.D0Ev.s               @0x1a0dc0
//
// STRUCT LAYOUT (recovered from C2 / D1 / D0 / SetParameter / GetOutput):
//   HGColorBias {
//     +0x000  vptr                    (set from a rip-relative leaq: C2 loads
//                                      0x883c1f(%rip) @0x1a0c42; D1 loads
//                                      0x883adb(%rip) @0x1a0d86; D0 loads
//                                      0x883a98(%rip) @0x1a0dc9 — all resolve
//                                      to the same __DATA_CONST vtable-for-
//                                      HGColorBias since C2/D1/D0 write it to
//                                      the same slot (%rdi) at those PCs).
//     +0x008..+0x197                  (HGNode base subobject — undecoded)
//     +0x198  HgcColorGamma_bias*     (heap-owned kernel pointer; allocated
//                                      in C2 @0x1a0c5c via HGObject::operator
//                                      new(0x1a0), constructed via
//                                      HgcColorGamma_bias::HgcColorGamma_bias
//                                      @0x1a0c67, then installed with the
//                                      swap-and-vtable-slot-0x18-release
//                                      dance @0x1a0c6c..0x1a0c9a)
//   }
//
// The kernel object at +0x198 exposes a vtable whose slot at offset 0x18 is
// its release/dispose vfn (used by C2's swap-and-replace path, and by every
// destructor to drop the ref) and whose slot at offset 0x60 is
// `SetParameter(int, float, float, float, float)` — the target of the tail
// call in HGColorBias::SetParameter @0x1a0d33. The wrapper node itself has
// no per-instance float state; ALL numeric parameters live on the kernel.
//
// ─── C2 @Helium 0x1a0c30 (base-object ctor) ─────────────────────────────────
//   Arguments: %rdi = this (HGColorBias*)
//   __ZN11HGColorBiasC2Ev:
//     0x1a0c30  push rbp/rsp/r15/r14/rbx ; standard prologue
//     0x1a0c3a  movq  %rdi, %rbx         ; save this
//     0x1a0c3d  callq __ZN6HGNodeC2Ev     ; base HGNode::HGNode()
//     0x1a0c42  leaq  0x883c1f(%rip),%rax ; = vtable-for-HGColorBias
//     0x1a0c49  movq  %rax, (%rbx)       ; this->vptr = vtable
//     0x1a0c4c  movq  $0x0, 0x198(%rbx)  ; this->kernel = nullptr
//     0x1a0c57  movl  $0x1a0, %edi       ; sizeof(HgcColorGamma_bias) = 416
//     0x1a0c5c  callq __ZN8HGObjectnwEm   ; HGObject::operator new(0x1a0)
//     0x1a0c61  movq  %rax, %r14         ; r14 = new kernel storage
//     0x1a0c64  movq  %rax, %rdi
//     0x1a0c67  callq __ZN18HgcColorGamma_biasC1Ev  ; kernel->HgcColorGamma_bias()
//     ; Swap-and-release: install r14 into this+0x198; if a prior value was
//     ; there and differs, release it via its vtable slot 0x18.
//     0x1a0c6c  movq  0x198(%rbx), %rdi  ; rdi = old *(this+0x198)
//     0x1a0c73  cmpq  %r14, %rdi         ; new == old ?
//     0x1a0c76  je    0x1a0c8c           ; -> release the NEW instead (no-op case)
//     0x1a0c78  testq %rdi, %rdi         ; old non-null ?
//     0x1a0c7b  je    0x1a0c83
//     0x1a0c7d  movq  (%rdi), %rax       ; rax = old->vptr
//     0x1a0c80  callq *0x18(%rax)        ; (*old->vptr[3])(old) — release
//     0x1a0c83  movq  %r14, 0x198(%rbx)  ; this->kernel = r14
//     0x1a0c8a  jmp   0x1a0c9a           ; -> epilogue
//     ; new == old branch: release the freshly constructed kernel (it's the
//     ; same pointer already in the slot). Symmetric with the above.
//     0x1a0c8c  testq %r14, %r14
//     0x1a0c8f  je    0x1a0c9a
//     0x1a0c91  movq  (%r14), %rax
//     0x1a0c94  movq  %r14, %rdi
//     0x1a0c97  callq *0x18(%rax)
//     0x1a0c9a  add $0x8,%rsp / pop rbx/r14/r15/rbp / retq
//
// Because the slot is `movq $0x0, 0x198(%rbx)` *before* the swap runs, at
// runtime the "old" pointer read on the first pass is always null, so the
// swap collapses to the straight-line "install r14" path. The full dance is
// still present in the binary (compiler-emitted from a shared setter helper).
//
// The tail at 0x1a0ca5 is a landing pad for exceptions raised in
// HgcColorGamma_bias::HgcColorGamma_bias — it drops the half-constructed
// kernel via `HGObject::operator delete` (@0x1a0cce) and re-runs the swap
// cleanup, then chains into HGNode::~HGNode (@0x1a0ced) and __Unwind_Resume
// (@0x1a0cf5). In TS the GC + normal throw semantics subsume this cleanup;
// we cite the addresses for provenance but do not model the two-phase unwind.
//
// ─── C1 @Helium 0x1a0d10 (complete-object ctor) ─────────────────────────────
//   __ZN11HGColorBiasC1Ev:
//     0x1a0d10  push rbp / mov rsp,rbp / pop rbp
//     0x1a0d15  jmp   __ZN11HGColorBiasC2Ev  ; tail-call C2
//   Pure trampoline into C2 — Itanium C1/C2 aliasing for a class without
//   virtual bases (both entry points do identical work).
//
// ─── SetParameter @Helium 0x1a0d20 ──────────────────────────────────────────
//   Signature: (this, int idx, float a, float b, float c, float d)
//     %rdi = this, %esi = idx, xmm0..xmm3 = a..d
//   __ZN11HGColorBias12SetParameterEiffff:
//     0x1a0d20  push rbp / mov rsp,rbp
//     0x1a0d24  movq  0x198(%rdi), %rdi  ; %rdi = this->kernel
//     0x1a0d2b  movq  (%rdi), %rax       ; %rax = kernel->vptr
//     0x1a0d2e  movq  0x60(%rax), %rax   ; %rax = vptr[12] = kernel->SetParameter
//     0x1a0d32  pop rbp
//     0x1a0d33  jmpq  *%rax              ; tail-call kernel->SetParameter
//                                        ; %esi/xmm0-3 pass through unchanged
//   Bit-exact forward to the kernel's SetParameter vfn at vtable slot 0x60.
//   Argument packing is preserved verbatim by the tail-jmp.
//
// ─── GetOutput @Helium 0x1a0d40 ─────────────────────────────────────────────
//   Signature: (this, HGRenderer* r) -> HgcColorGamma_bias*
//     %rdi = this, %rsi = renderer
//   __ZN11HGColorBias9GetOutputEP10HGRenderer:
//     0x1a0d40  push rbp/rsp/r14/rbx
//     0x1a0d47  movq  %rdi, %rbx           ; save this
//     0x1a0d4a  movq  0x198(%rdi), %r14   ; r14 = this->kernel
//     0x1a0d51  movq  %rsi, %rdi           ; arg1 = renderer
//     0x1a0d54  movq  %rbx, %rsi           ; arg2 = this (as HGNode*)
//     0x1a0d57  xorl  %edx, %edx           ; arg3 = 0  (input slot)
//     0x1a0d59  callq __ZN10HGRenderer8GetInputEP6HGNodei  ; HGRenderer::GetInput
//     0x1a0d5e  movq  (%r14), %rcx         ; rcx = kernel->vptr
//     0x1a0d61  movq  %r14, %rdi           ; arg1 = kernel
//     0x1a0d64  xorl  %esi, %esi           ; arg2 = 0
//     0x1a0d66  movq  %rax, %rdx           ; arg3 = HGRenderer::GetInput result
//     0x1a0d69  callq *0x78(%rcx)          ; kernel->vptr[15]  (side-effect vfn)
//     0x1a0d6c  movq  0x198(%rbx), %rax    ; return this->kernel
//     0x1a0d73  pop rbx/r14/rbp / retq
//
//   Semantics: primes the kernel by (1) asking the renderer for input slot 0
//   of `this` (i.e. "which upstream node feeds our input 0?"), then (2)
//   calling kernel->vptr[15](kernel, 0, upstream) — the kernel's
//   "bind input node" or "prepare-for-render" vfn — before returning the
//   kernel pointer itself as this node's output. The vfn at slot 0x78 is not
//   yet decoded; its role (per shape of the call: 2nd arg 0, 3rd arg the
//   upstream HGNode*) is consistent with a "SetInput(slot=0, node)" call.
//
// ─── D1 @Helium 0x1a0d80 (complete-object dtor) ─────────────────────────────
//   __ZN11HGColorBiasD1Ev:
//     0x1a0d80  push rbp/rsp/rbx/rax
//     0x1a0d86  leaq  0x883adb(%rip),%rax ; = vtable-for-HGColorBias (same
//                                            const as C2's leaq — the offsets
//                                            differ purely because the PC does)
//     0x1a0d8d  movq  %rax, (%rdi)       ; reset vptr (defensive: prevents any
//                                            virtual dispatch on `this` from
//                                            hitting a derived vtable during
//                                            base-class teardown)
//     0x1a0d90  movq  0x198(%rdi), %rax  ; rax = kernel
//     0x1a0d97  testq %rax, %rax
//     0x1a0d9a  je    0x1a0dab           ; skip if null
//     0x1a0d9c  movq  (%rax), %rcx       ; rcx = kernel->vptr
//     0x1a0d9f  movq  %rdi, %rbx         ; save this
//     0x1a0da2  movq  %rax, %rdi         ; arg1 = kernel
//     0x1a0da5  callq *0x18(%rcx)        ; kernel->vptr[3] — release
//     0x1a0da8  movq  %rbx, %rdi         ; restore this
//     0x1a0dab  add $0x8,%rsp / pop rbx/rbp
//     0x1a0db1  jmp   __ZN6HGNodeD2Ev     ; tail-chain into base HGNode::~HGNode
//
// ─── D0 @Helium 0x1a0dc0 (deleting dtor) ────────────────────────────────────
//   __ZN11HGColorBiasD0Ev:
//     0x1a0dc0  push rbp/rsp/rbx/rax
//     0x1a0dc6  movq  %rdi, %rbx
//     0x1a0dc9  leaq  0x883a98(%rip),%rax ; = vtable-for-HGColorBias
//     0x1a0dd0  movq  %rax, (%rdi)       ; reset vptr
//     0x1a0dd3  movq  0x198(%rdi), %rdi  ; rdi = kernel
//     0x1a0dda  testq %rdi, %rdi
//     0x1a0ddd  je    0x1a0de5
//     0x1a0ddf  movq  (%rdi), %rax
//     0x1a0de2  callq *0x18(%rax)        ; kernel->vptr[3] — release
//     0x1a0de5  movq  %rbx, %rdi
//     0x1a0de8  callq __ZN6HGNodeD2Ev     ; HGNode::~HGNode()
//     0x1a0ded  movq  %rbx, %rdi
//     0x1a0df0  add $0x8,%rsp / pop rbx/rbp
//     0x1a0df6  jmp   __ZN8HGObjectdlEPv  ; HGObject::operator delete(this)
//
// D0 is D1 plus a trailing `HGObject::operator delete` on `this` — the
// canonical Itanium ABI deleting-dtor pattern.
//
// FRONTIER CALLEES (undecoded — throwing stubs cite them):
//   __ZN6HGNodeC2Ev              HGNode::HGNode()                    @0x1a0c3d
//   __ZN6HGNodeD2Ev              HGNode::~HGNode()                   @0x1a0ced/@0x1a0db1/@0x1a0de8
//   __ZN8HGObjectnwEm            HGObject::operator new(unsigned long) @0x1a0c5c
//   __ZN8HGObjectdlEPv           HGObject::operator delete(void*)    @0x1a0cce/@0x1a0df6
//   __ZN18HgcColorGamma_biasC1Ev HgcColorGamma_bias::HgcColorGamma_bias() @0x1a0c67
//   HgcColorGamma_bias vfn @0x18 (release)   — called @0x1a0c80/@0x1a0c97/@0x1a0da5/@0x1a0de2
//   HgcColorGamma_bias vfn @0x60 (SetParameter) — tail-called @0x1a0d33
//   HgcColorGamma_bias vfn @0x78 ("SetInput"-shape) — called @0x1a0d69
//   __ZN10HGRenderer8GetInputEP6HGNodei  HGRenderer::GetInput(HGNode*, int) @0x1a0d59
//   ___clang_call_terminate                                          @0x1a0ca8/@0x1a0cc3/@0x1a0cfd/@0x1a0db9/@0x1a0dfb
//   __Unwind_Resume                                                  @0x1a0cf5
//
// Numerics: only SetParameter carries floats, and they are pass-through
// (xmm0..xmm3 forwarded verbatim by the tail-jmp). No arithmetic is
// performed at this layer — Math.fround is unnecessary.

/* eslint-disable @typescript-eslint/no-unused-vars */

/**
 * Opaque handle for Helium's `HGRenderer*` — the render-graph context
 * threaded through GetOutput. Only `HGRenderer::GetInput(HGNode*, int)` is
 * referenced from this class, via a throwing frontier stub below.
 */
export type HGRendererPtr = { readonly __brand: "HGRenderer" };

/**
 * Opaque handle for Helium's `HGNode*` (base class). HGColorBias derives
 * from it; the base subobject occupies bytes 0x000..0x197 of `this`, and
 * HGColorBias adds a single field at +0x198 (the compute kernel).
 */
export type HGNodePtr = { readonly __brand: "HGNode" };

/**
 * `HgcColorGamma_bias` — Helium's compute-kernel wrapper for the
 * color-gamma-with-bias per-pixel operation. Owned by HGColorBias at
 * offset 0x198. Its full class is not yet transcribed; we brand it here and
 * cite the four vtable slots that HGColorBias touches.
 *
 * Vtable slots referenced by HGColorBias:
 *   +0x18  release/dispose  — @0x1a0c80 @0x1a0c97 @0x1a0da5 @0x1a0de2
 *   +0x60  SetParameter(idx, a, b, c, d)  — @0x1a0d33 (tail-jmp)
 *   +0x78  "SetInput"-shape (self, 0, upstream)  — @0x1a0d69
 *
 * Sized 0x1a0 bytes (416) — from `movl $0x1a0, %edi` @0x1a0c57 preceding the
 * `HGObject::operator new(unsigned long)` call.
 */
export interface HgcColorGamma_bias {
  readonly __brand: "HgcColorGamma_bias";
}

/**
 * Frontier: `HGNode::HGNode()` — base-class constructor, called from
 * HGColorBias::C2 @0x1a0c3d. Not yet transcribed.
 */
function HGNode_C2(_self: HGColorBias): void {
  // @0x1a0c3d callq __ZN6HGNodeC2Ev
  throw new Error(
    "HGNode::HGNode() @Helium __ZN6HGNodeC2Ev @0x1a0c3d not yet transcribed",
  );
}

/**
 * Frontier: `HGNode::~HGNode()` — tail-chained from HGColorBias::D1
 * @0x1a0db1 and called directly from D0 @0x1a0de8 (and from the C2
 * exception-cleanup path @0x1a0ced). Not yet transcribed.
 */
function HGNode_D2(_self: HGColorBias): void {
  // @0x1a0db1 jmp __ZN6HGNodeD2Ev
  // @0x1a0de8 callq __ZN6HGNodeD2Ev
  // @0x1a0ced callq __ZN6HGNodeD2Ev  (exception unwind, not modeled)
  throw new Error(
    "HGNode::~HGNode() @Helium __ZN6HGNodeD2Ev @0x1a0db1 not yet transcribed",
  );
}

/**
 * Frontier: `HGObject::operator new(unsigned long)` — allocates the kernel
 * in HGColorBias::C2 @0x1a0c5c with size argument 0x1a0. Not yet transcribed.
 */
function HGObject_operator_new(_size: number): HgcColorGamma_bias {
  // @0x1a0c5c callq __ZN8HGObjectnwEm  (with %edi = 0x1a0)
  throw new Error(
    "HGObject::operator new @Helium __ZN8HGObjectnwEm @0x1a0c5c not yet transcribed",
  );
}

/**
 * Frontier: `HGObject::operator delete(void*)` — reached at @0x1a0df6
 * (`jmp`) from D0 and at @0x1a0cce from C2's exception-cleanup path.
 * In C++ this frees the payload; in TS the GC subsumes it.
 */
function HGObject_operator_delete(_p: HGColorBias | HgcColorGamma_bias): void {
  // @0x1a0df6 jmp __ZN8HGObjectdlEPv
  // @0x1a0cce callq __ZN8HGObjectdlEPv  (exception unwind, not modeled)
  throw new Error(
    "HGObject::operator delete @Helium __ZN8HGObjectdlEPv @0x1a0df6 not yet transcribed",
  );
}

/**
 * Frontier: `HgcColorGamma_bias::HgcColorGamma_bias()` — constructs the
 * freshly `operator new`'d kernel storage in HGColorBias::C2 @0x1a0c67.
 * Not yet transcribed.
 */
function HgcColorGamma_bias_C1(_self: HgcColorGamma_bias): void {
  // @0x1a0c67 callq __ZN18HgcColorGamma_biasC1Ev
  throw new Error(
    "HgcColorGamma_bias::HgcColorGamma_bias @Helium __ZN18HgcColorGamma_biasC1Ev @0x1a0c67 not yet transcribed",
  );
}

/**
 * Frontier: HgcColorGamma_bias vtable slot 0x18 — the kernel's release /
 * dispose vfn. Called from C2's swap-and-replace path (@0x1a0c80 for the
 * old pointer, @0x1a0c97 for the redundant new pointer branch), from D1
 * @0x1a0da5, and from D0 @0x1a0de2. Not yet transcribed.
 */
function HgcColorGamma_bias_vfn_0x18_release(_self: HgcColorGamma_bias): void {
  // @0x1a0c80 callq *0x18(%rax)
  // @0x1a0c97 callq *0x18(%rax)
  // @0x1a0da5 callq *0x18(%rcx)
  // @0x1a0de2 callq *0x18(%rax)
  throw new Error(
    "HgcColorGamma_bias vtable[0x18] (release) @Helium @0x1a0c80/@0x1a0c97/@0x1a0da5/@0x1a0de2 not yet transcribed",
  );
}

/**
 * Frontier: HgcColorGamma_bias vtable slot 0x60 — the kernel's
 * `SetParameter(int idx, float a, float b, float c, float d)` vfn.
 * Tail-jumped-to from HGColorBias::SetParameter @0x1a0d33 with the exact
 * argument packing preserved (idx in %esi, a..d in xmm0..xmm3).
 * Not yet transcribed.
 */
function HgcColorGamma_bias_vfn_0x60_SetParameter(
  _self: HgcColorGamma_bias,
  _idx: number,
  _a: number,
  _b: number,
  _c: number,
  _d: number,
): void {
  // @0x1a0d33 jmpq *%rax  (where %rax = kernel->vptr[12])
  throw new Error(
    "HgcColorGamma_bias vtable[0x60] (SetParameter) @Helium @0x1a0d33 not yet transcribed",
  );
}

/**
 * Frontier: HgcColorGamma_bias vtable slot 0x78 — call shape
 * `(self, 0, upstreamHGNode)`, consistent with a "SetInput(slot=0, node)"
 * or "PrepareForRender" vfn. Called from HGColorBias::GetOutput @0x1a0d69.
 * Not yet transcribed.
 */
function HgcColorGamma_bias_vfn_0x78(
  _self: HgcColorGamma_bias,
  _zero: number,
  _upstream: HGNodePtr | null,
): void {
  // @0x1a0d69 callq *0x78(%rcx)
  throw new Error(
    "HgcColorGamma_bias vtable[0x78] (SetInput-shape) @Helium @0x1a0d69 not yet transcribed",
  );
}

/**
 * Frontier: `HGRenderer::GetInput(HGNode* self, int slot)` — called from
 * HGColorBias::GetOutput @0x1a0d59 with slot=0. Not yet transcribed.
 */
function HGRenderer_GetInput(
  _r: HGRendererPtr,
  _self: HGNodePtr,
  _slot: number,
): HGNodePtr | null {
  // @0x1a0d59 callq __ZN10HGRenderer8GetInputEP6HGNodei
  throw new Error(
    "HGRenderer::GetInput @Helium __ZN10HGRenderer8GetInputEP6HGNodei @0x1a0d59 not yet transcribed",
  );
}

/**
 * `HGColorBias` — Helium's render-graph node for the color-bias operation.
 *
 * @Helium symbols owned by this class:
 *   C2                @0x1a0c30
 *   C1                @0x1a0d10  (trampoline into C2)
 *   SetParameter      @0x1a0d20  (tail-forward to kernel->vptr[12])
 *   GetOutput         @0x1a0d40
 *   D1                @0x1a0d80
 *   D0                @0x1a0dc0
 *
 * Struct fields:
 *   vptr                  (offset 0x000)
 *   HGNode base subobject (offsets 0x008..0x197, undecoded)
 *   kernel                (offset 0x198 — HgcColorGamma_bias* owned)
 */
export class HGColorBias {
  /**
   * The owned HgcColorGamma_bias compute kernel at offset 0x198. Allocated
   * and constructed in C2 (@0x1a0c5c..@0x1a0c67), tail-forwarded to by
   * SetParameter (@0x1a0d33), returned by GetOutput (@0x1a0d6c), and
   * released via its own vtable slot 0x18 by D1/D0 (@0x1a0da5, @0x1a0de2).
   */
  kernel: HgcColorGamma_bias | null = null;

  /**
   * HGColorBias::HGColorBias() [C2, base-object ctor] @0x1a0c30.
   *
   *   @0x1a0c3d callq __ZN6HGNodeC2Ev              // HGNode::HGNode()
   *   @0x1a0c42 leaq  0x883c1f(%rip), %rax         // vtable-for-HGColorBias
   *   @0x1a0c49 movq  %rax, (%rbx)                 // this->vptr = vtable
   *   @0x1a0c4c movq  $0x0, 0x198(%rbx)            // this->kernel = null
   *   @0x1a0c57 movl  $0x1a0, %edi                 // sizeof = 416
   *   @0x1a0c5c callq __ZN8HGObjectnwEm             // HGObject::operator new
   *   @0x1a0c67 callq __ZN18HgcColorGamma_biasC1Ev  // kernel ctor
   *   @0x1a0c6c..@0x1a0c9a  swap-and-release into this->kernel
   *
   * The swap-and-release dance treats the just-zeroed slot as the "old"
   * value; at runtime the `old == null` path taken @0x1a0c7b makes it a
   * straight-line install of the new kernel into this->kernel.
   */
  constructor() {
    // @0x1a0c3d — HGNode base ctor (undecoded frontier; the throw here
    //             surfaces the frontier without executing it inside the
    //             wrapper's own path; downstream callers should catch it
    //             once HGNode is transcribed).
    HGNode_C2(this);
    // Unreachable until HGNode::HGNode is transcribed. Preserved verbatim:
    // @0x1a0c4c this->kernel = null
    this.kernel = null;
    // @0x1a0c5c new HgcColorGamma_bias @ +0x198  (frontier)
    const newKernel = HGObject_operator_new(0x1a0);
    // @0x1a0c67 kernel->ctor()  (frontier)
    HgcColorGamma_bias_C1(newKernel);
    // @0x1a0c6c..@0x1a0c9a swap-and-release. `old` is null on the first
    // pass (see @0x1a0c4c), so the branch at @0x1a0c76 (je -> release new)
    // is not taken; the branch at @0x1a0c7b (je -> skip old release) IS
    // taken. Result: this.kernel = newKernel.
    const old = this.kernel;
    if (old === newKernel) {
      // @0x1a0c76 je 0x1a0c8c — release the new one (redundant install)
      if (newKernel !== null) {
        // @0x1a0c91..@0x1a0c97 callq *0x18(new->vptr)
        HgcColorGamma_bias_vfn_0x18_release(newKernel);
      }
    } else {
      // @0x1a0c78 else-branch: release old, install new
      if (old !== null) {
        // @0x1a0c80 callq *0x18(old->vptr)
        HgcColorGamma_bias_vfn_0x18_release(old);
      }
      // @0x1a0c83 this->kernel = newKernel
      this.kernel = newKernel;
    }
    // @0x1a0c9a epilogue / retq
  }

  /**
   * HGColorBias::HGColorBias() [C1, complete-object ctor] @0x1a0d10.
   *
   *   @0x1a0d15 jmp __ZN11HGColorBiasC2Ev
   *
   * Pure trampoline into C2 (Itanium C1/C2 alias for a class with no
   * virtual bases). In TS the single constructor above serves both roles;
   * this exported factory preserves the address-space distinction.
   */
  static C1(): HGColorBias {
    // @0x1a0d15 jmp C2
    return new HGColorBias();
  }

  /**
   * HGColorBias::SetParameter(int, float, float, float, float) @0x1a0d20.
   *
   *   @0x1a0d24 movq 0x198(%rdi), %rdi     // rdi = this->kernel
   *   @0x1a0d2b movq (%rdi), %rax           // rax = kernel->vptr
   *   @0x1a0d2e movq 0x60(%rax), %rax       // rax = vptr[12]
   *   @0x1a0d33 jmpq *%rax                  // tail-call kernel->SetParameter
   *
   * The tail-jmp preserves %esi (idx) and xmm0..xmm3 (a..d) verbatim — no
   * repacking, no per-arg normalization. This is a pure forwarder.
   */
  SetParameter(idx: number, a: number, b: number, c: number, d: number): void {
    // @0x1a0d24 kernel = this->kernel
    const kernel = this.kernel;
    // @0x1a0d33 jmpq *0x60(kernel->vptr) — tail-call the kernel's
    //           SetParameter vfn with the same 5 args. The x86 body does not
    //           null-check the kernel before dereferencing it (it would
    //           segfault on null); we mirror that by throwing through the
    //           frontier stub without a null guard.
    HgcColorGamma_bias_vfn_0x60_SetParameter(
      kernel as HgcColorGamma_bias,
      idx,
      a,
      b,
      c,
      d,
    );
  }

  /**
   * HGColorBias::GetOutput(HGRenderer*) @0x1a0d40.
   *
   *   @0x1a0d4a movq  0x198(%rdi), %r14                // r14 = this->kernel
   *   @0x1a0d59 callq HGRenderer::GetInput(this, 0)     // -> upstream node
   *   @0x1a0d69 callq *0x78(kernel->vptr)              // kernel->vfn78(0, upstream)
   *   @0x1a0d6c movq  0x198(%rbx), %rax                // return this->kernel
   *
   * Semantics: ask the renderer which node is bound to our input slot 0,
   * forward that upstream node to the kernel's vfn78 (SetInput-shape), and
   * return the kernel pointer itself as this node's output. The return type
   * is the same HgcColorGamma_bias* that lives at +0x198 — GetOutput is a
   * pure getter with a side-effecting "bind" as its middle step.
   */
  GetOutput(r: HGRendererPtr): HgcColorGamma_bias | null {
    // @0x1a0d4a
    const kernel = this.kernel;
    // @0x1a0d51..@0x1a0d59  HGRenderer::GetInput(renderer, this, 0)
    const upstream = HGRenderer_GetInput(r, this as unknown as HGNodePtr, 0);
    // @0x1a0d5e..@0x1a0d69  kernel->vptr[15](kernel, 0, upstream)
    HgcColorGamma_bias_vfn_0x78(kernel as HgcColorGamma_bias, 0, upstream);
    // @0x1a0d6c  return this->kernel
    return this.kernel;
  }

  /**
   * HGColorBias::~HGColorBias() [D1, complete-object dtor] @0x1a0d80.
   *
   *   @0x1a0d86 leaq  0x883adb(%rip), %rax   // vtable-for-HGColorBias
   *   @0x1a0d8d movq  %rax, (%rdi)           // reset vptr (defensive)
   *   @0x1a0d90 movq  0x198(%rdi), %rax      // rax = this->kernel
   *   @0x1a0d97 testq %rax, %rax
   *   @0x1a0d9a je    0x1a0dab               // skip release if null
   *   @0x1a0da5 callq *0x18(kernel->vptr)   // kernel->release()
   *   @0x1a0db1 jmp   __ZN6HGNodeD2Ev        // tail-chain into HGNode::~HGNode
   *
   * The vptr reset at @0x1a0d8d is the standard Itanium defensive write —
   * during base-class teardown it prevents any indirect virtual dispatch
   * from landing on a subclass's overrides. In TS the class hierarchy
   * handles this automatically; we skip the vptr write but preserve the
   * kernel-release + base-dtor chain.
   */
  destroy_D1(): void {
    // @0x1a0d8d (vptr reset — no-op in TS; noted for provenance)
    // @0x1a0d90..@0x1a0da8
    const kernel = this.kernel;
    if (kernel !== null) {
      // @0x1a0da5 callq *0x18(kernel->vptr)
      HgcColorGamma_bias_vfn_0x18_release(kernel);
    }
    // @0x1a0db1 jmp HGNode::~HGNode
    HGNode_D2(this);
  }

  /**
   * HGColorBias::~HGColorBias() [D0, deleting dtor] @0x1a0dc0.
   *
   *   @0x1a0dc9 leaq  0x883a98(%rip), %rax   // vtable-for-HGColorBias
   *   @0x1a0dd0 movq  %rax, (%rdi)           // reset vptr (defensive)
   *   @0x1a0dd3 movq  0x198(%rdi), %rdi      // rdi = this->kernel
   *   @0x1a0dda testq %rdi, %rdi
   *   @0x1a0ddd je    0x1a0de5
   *   @0x1a0de2 callq *0x18(kernel->vptr)   // kernel->release()
   *   @0x1a0de8 callq __ZN6HGNodeD2Ev        // HGNode::~HGNode()
   *   @0x1a0df6 jmp   __ZN8HGObjectdlEPv     // HGObject::operator delete(this)
   *
   * D0 is D1 plus a trailing `HGObject::operator delete` on `this` — the
   * Itanium ABI deleting-dtor. In TS the GC subsumes the trailing delete;
   * we still cite it via the throwing frontier stub for provenance.
   */
  destroy_D0(): void {
    // @0x1a0dd0 (vptr reset — no-op in TS)
    // @0x1a0dd3..@0x1a0de5
    const kernel = this.kernel;
    if (kernel !== null) {
      // @0x1a0de2 callq *0x18(kernel->vptr)
      HgcColorGamma_bias_vfn_0x18_release(kernel);
    }
    // @0x1a0de8 callq HGNode::~HGNode
    HGNode_D2(this);
    // @0x1a0df6 jmp HGObject::operator delete(this)
    HGObject_operator_delete(this);
  }
}
