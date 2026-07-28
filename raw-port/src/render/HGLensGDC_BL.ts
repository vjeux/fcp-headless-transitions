// HGLensGDC_BL.ts — Helium "Lens GDC (Blur Line)" node. GDC = Geometric
// Distortion Correction — Apple's lens-distortion model. `_BL` is the
// Helium-side wrapper on top of the base `Hgc2LensGDC_BL` implementation.
// The Helium binary emits exactly three symbols for this class:
//
//   HGLensGDC_BL::~HGLensGDC_BL() [D1 — complete-object in-place]      @0x1e3740
//   HGLensGDC_BL::~HGLensGDC_BL() [D0 — deleting]                      @0x1e3750
//   HGLensGDC_BL::GetDOD(HGRenderer*, int, HGRect)                     @0x1e3770
//
// Transcribed from FCP Helium framework:
//   /Applications/Final Cut Pro.app/Contents/Frameworks/Helium.framework/Versions/A/Helium
// See raw-port/re/disasm/Helium.HGLensGDC_BL.~HGLensGDC_BL.s and
//     raw-port/re/disasm/Helium.HGLensGDC_BL.GetDOD.s for the full x86_64
// disassembly reproduced below.
//
// Instance state is entirely on the base class `Hgc2LensGDC_BL` — this
// subclass has no own fields observable through these three emitted
// methods (D1 tail-calls the base D2, D0 calls base D2 + operator delete,
// and GetDOD only touches `this` as an HGNode* for the input query).

import { HGRect, HGRectNull as HGRectNullConst } from "./HGRect.js";
export { HGRect };

/**
 * Opaque handle for Helium `HGRenderer*` — the render context threaded
 * through every DOD/render pass. HGLensGDC_BL::GetDOD calls two of its
 * methods (GetInput, GetDOD), both frontier.
 */
export type HGRendererPtr = { readonly __brand: "HGRenderer" };

/**
 * Opaque handle for Helium `HGNode*`. HGLensGDC_BL IS-A HGNode (single
 * inheritance from Hgc2LensGDC_BL -> ... -> HGNode). The disassembly
 * passes `this` directly into HGRenderer::GetInput as its second HGNode*
 * argument, i.e. an upcast to HGNode*.
 */
export type HGNodePtr = { readonly __brand: "HGNode" };

/**
 * Un-transcribed callee: `Hgc2LensGDC_BL::~Hgc2LensGDC_BL()` (D2, base
 * in-place). The heavy lifting for lens-distortion state teardown lives
 * on the base class and is a separate frontier port.
 *
 * @see FCP Helium `Hgc2LensGDC_BL::~Hgc2LensGDC_BL()` — reached from both
 *      HGLensGDC_BL destructor variants (D1 @0x1e3745 jmp, D0 @0x1e3759
 *      callq).
 */
function Hgc2LensGDC_BL_dtor(_self: HGLensGDC_BL): void {
  throw new Error(
    "Hgc2LensGDC_BL::~Hgc2LensGDC_BL @ (frontier) not yet transcribed — reached from HGLensGDC_BL::~HGLensGDC_BL @0x1e3745/@0x1e3759",
  );
}

/**
 * `HGObject::operator delete(void*)` — Apple's HGObject allocator hook.
 * @Helium 0x1e3767  jmp __ZN8HGObjectdlEPv  (symbol stub for the D0 tail
 * call).
 *
 * Same treatment as elsewhere in the port (see OZHCopyMaskAlphaToMaskRGB):
 * TS is GC'd so the free-storage step has no observable effect at the
 * language level. No allocator side-effects are decoded here, so we keep
 * it as a no-op with the citation preserved.
 */
function hgObjectOperatorDelete(_p: HGLensGDC_BL): void {
  // @Helium 0x1e3767  jmp __ZN8HGObjectdlEPv  ## HGObject::operator delete(void*)
  // TS is GC'd; no decoded side-effect.
}

/**
 * Un-transcribed callee: `HGRenderer::GetInput(HGNode*, int)`. Returns an
 * `HGNode*` (in rax) that is the requested upstream input node of the
 * given node at the given input-slot.
 *
 * @see FCP Helium `HGRenderer::GetInput(HGNode*, int)` — reached from
 *      HGLensGDC_BL::GetDOD @0x1e3797 (callq).
 */
function HGRenderer_GetInput(
  _renderer: HGRendererPtr,
  _node: HGNodePtr,
  _inputIndex: number,
): HGNodePtr {
  throw new Error(
    "HGRenderer::GetInput @ (frontier) not yet transcribed — reached from HGLensGDC_BL::GetDOD @0x1e3797",
  );
}

/**
 * Un-transcribed callee: `HGRenderer::GetDOD(HGNode*)`. Returns the
 * domain-of-definition (an HGRect) of the given HGNode.
 *
 * @see FCP Helium `HGRenderer::GetDOD(HGNode*)` — reached from
 *      HGLensGDC_BL::GetDOD @0x1e37a8 (tail-call jmp).
 */
function HGRenderer_GetDOD(
  _renderer: HGRendererPtr,
  _node: HGNodePtr,
): HGRect {
  throw new Error(
    "HGRenderer::GetDOD @ (frontier) not yet transcribed — reached from HGLensGDC_BL::GetDOD @0x1e37a8 (tail-call)",
  );
}

/**
 * `HGLensGDC_BL` — Helium wrapper for the base `Hgc2LensGDC_BL` lens
 * geometric-distortion node (blur-line variant).
 */
export class HGLensGDC_BL {
  /**
   * @see FCP Helium `HGLensGDC_BL::GetDOD(HGRenderer*, int, HGRect)`
   *      @0x00000000001e3770
   *
   * Domain-of-definition query. The lens-GDC-BL node has EXACTLY ONE
   * meaningful output (index 0); any other output index returns
   * `_HGRectNull`. For output 0 the DOD equals the DOD of this node's
   * input-slot 0 (the lens-distortion op preserves — passes through — the
   * upstream DOD as far as the renderer scheduler is concerned; the
   * distortion itself samples inside that rect).
   *
   * Disassembly (verbatim, System V AMD64 ABI):
   *   rdi = this
   *   rsi = HGRenderer*
   *   edx = outputIndex (signed int)
   *   rcx = inRect.lo   (low 8 bytes of the HGRect argument)
   *   r8  = inRect.hi   (high 8 bytes of the HGRect argument)
   *   Return: HGRect in (rax, rdx)
   *
   *   0x1e3770  testl %edx, %edx                ; edx == 0 ?
   *   0x1e3772  je    0x1e3783                  ; -> path A (outputIndex == 0)
   *   ; ---- path B: outputIndex != 0 => return _HGRectNull ----
   *   0x1e3774  leaq  _HGRectNull(%rip), %rcx   ; rcx = &_HGRectNull
   *   0x1e377b  movq  (%rcx), %rax              ; rax = _HGRectNull.lo
   *   0x1e377e  movq  0x8(%rcx), %rdx           ; rdx = _HGRectNull.hi
   *   0x1e3782  retq
   *   ; ---- path A: outputIndex == 0 => renderer->GetDOD(renderer->GetInput(this,0)) ----
   *   0x1e3783  pushq %rbp
   *   0x1e3784  movq  %rsp, %rbp
   *   0x1e3787  pushq %rbx
   *   0x1e3788  pushq %rax                       ; align stack
   *   0x1e3789  movq  %rdi, %rax                 ; rax = this
   *   0x1e378c  movq  %rsi, %rdi                 ; rdi = renderer   (arg1)
   *   0x1e378f  movq  %rsi, %rbx                 ; rbx = renderer   (save)
   *   0x1e3792  movq  %rax, %rsi                 ; rsi = this-as-HGNode* (arg2)
   *   0x1e3795  xorl  %edx, %edx                 ; edx = 0          (arg3)
   *   0x1e3797  callq __ZN10HGRenderer8GetInputEP6HGNodei
   *                                              ; rax = renderer->GetInput(this, 0)
   *   0x1e379c  movq  %rbx, %rdi                 ; rdi = renderer   (arg1)
   *   0x1e379f  movq  %rax, %rsi                 ; rsi = input HGNode* (arg2)
   *   0x1e37a2  addq  $0x8, %rsp
   *   0x1e37a6  popq  %rbx
   *   0x1e37a7  popq  %rbp
   *   0x1e37a8  jmp   __ZN10HGRenderer6GetDODEP6HGNode
   *                                              ; tail-call renderer->GetDOD(input)
   *
   * Control-flow: exactly one branch. `_inRect` is never read on either
   * path (the passthrough path is via renderer->GetDOD of the input node,
   * NOT via the caller-supplied rect — that's different from
   * OZHCopyMaskAlphaToMaskRGB, which does forward inRect).
   */
  GetDOD(
    renderer: HGRendererPtr,
    outputIndex: number,
    _inRect: HGRect,
  ): HGRect {
    // @0x1e3770 testl %edx,%edx / @0x1e3772 je -> path A
    if ((outputIndex | 0) !== 0) {
      // ---- path B: @0x1e3774..0x1e3782 — return _HGRectNull ----
      // @0x1e3774 leaq _HGRectNull(%rip), %rcx
      // @0x1e377b movq (%rcx), %rax                 (return.lo = null.lo)
      // @0x1e377e movq 0x8(%rcx), %rdx              (return.hi = null.hi)
      // @0x1e3782 retq
      return HGRectNullConst;
    }
    // ---- path A: outputIndex == 0 -----
    // @0x1e3797 callq HGRenderer::GetInput(this, 0)
    const inputNode: HGNodePtr = HGRenderer_GetInput(
      renderer,
      // upcast this -> HGNode*
      this as unknown as HGNodePtr,
      0,
    );
    // @0x1e37a8 jmp HGRenderer::GetDOD(inputNode)   (tail call — return its result)
    return HGRenderer_GetDOD(renderer, inputNode);
  }

  /**
   * @see FCP Helium `HGLensGDC_BL::~HGLensGDC_BL()` (D1 — complete-object
   *      in-place destructor, does NOT free storage) @0x00000000001e3740
   *
   * Disassembly (verbatim):
   *   0x1e3740  pushq %rbp
   *   0x1e3741  movq  %rsp, %rbp
   *   0x1e3744  popq  %rbp
   *   0x1e3745  jmp   __ZN14Hgc2LensGDC_BLD2Ev  ; tail-call base D2
   *
   * Trivial forwarder: HGLensGDC_BL adds no own state to destroy, so it
   * tail-calls the base-class D2 destructor. This is the exact "empty
   * subclass dtor" idiom.
   */
  destroyInPlace(): void {
    // @0x1e3745 jmp __ZN14Hgc2LensGDC_BLD2Ev
    Hgc2LensGDC_BL_dtor(this);
  }

  /**
   * @see FCP Helium `HGLensGDC_BL::~HGLensGDC_BL()` (D0 — deleting
   *      destructor, cleans up AND frees) @0x00000000001e3750
   *
   * Disassembly (verbatim):
   *   0x1e3750  pushq %rbp
   *   0x1e3751  movq  %rsp, %rbp
   *   0x1e3754  pushq %rbx
   *   0x1e3755  pushq %rax                          ; align stack
   *   0x1e3756  movq  %rdi, %rbx                    ; rbx = this  (save)
   *   0x1e3759  callq __ZN14Hgc2LensGDC_BLD2Ev      ; base D2 in-place
   *   0x1e375e  movq  %rbx, %rdi                    ; rdi = this  (for op delete)
   *   0x1e3761  addq  $0x8, %rsp
   *   0x1e3765  popq  %rbx
   *   0x1e3766  popq  %rbp
   *   0x1e3767  jmp   __ZN8HGObjectdlEPv            ; HGObject::operator delete
   *
   * Standard Itanium C++ ABI D0 shape: run in-place destructor (which for
   * this class means directly the base D2 — see D1 collapse note), then
   * `operator delete(this)`. Note the D0 does NOT go through D1 — because
   * D1's body is a pure tail-call to base D2, the compiler collapsed it.
   */
  destroyAndDelete(): void {
    // @0x1e3759 callq __ZN14Hgc2LensGDC_BLD2Ev
    Hgc2LensGDC_BL_dtor(this);
    // @0x1e3767 jmp __ZN8HGObjectdlEPv
    hgObjectOperatorDelete(this);
  }
}
