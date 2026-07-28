// raw-port/src/render/HGDefinition.ts
//
// FCP `HGDefinition` — Helium render-graph node exposing the classic
// "Definition" per-pixel filter (a bandlimited high-frequency-boost /
// unsharp-mask-shaped operation used in FCP color's "Definition" slider).
// Concretely this is a thin `HGNode` subclass whose only job is to own four
// heap-allocated helper sub-objects (a plain HGNode-shaped input node, an
// HGTextureWrap, an HGBlur, and the actual HgcDefinition compute kernel),
// wire them together via SetInput-shape vfn calls, and forward parameter
// updates (blur radius, definition amount) onto the HGBlur and HgcDefinition
// sub-nodes. All numeric work happens on the sub-objects; HGDefinition
// itself carries only two float fields (blurAmount @+0x1b8, definition
// @+0x1bc).
//
// Provenance: /Applications/Final Cut Pro.app/Contents/Frameworks/
//             Helium.framework/Versions/A/Helium (x86_64 slice, file
//             offset 0x4000 + text VA).
// Disassembly saved at:
//   raw-port/re/disasm/Helium.HGDefinition.HGDefinition.s        @0x106c60 (C1)
//   /tmp/Helium_tV.txt (C2 body)                                  @0x106ad0
//   raw-port/re/disasm/Helium.HGDefinition.SetBlurAmount.s        @0x106db0
//   raw-port/re/disasm/Helium.HGDefinition.CIToHGBlurRadius.s     @0x106da0
//   raw-port/re/disasm/Helium.HGDefinition.SetDefinitionAmount.s  @0x106de0
//   raw-port/re/disasm/Helium.HGDefinition.GetOutput.s            @0x106e10
//   /tmp/Helium_tV.txt (D2 base dtor)                             @0x106c70
//   /tmp/Helium_tV.txt (D1 complete dtor — identical body to D2)  @0x106cd0
//   /tmp/Helium_tV.txt (D0 deleting dtor)                         @0x106d30
//
// STRUCT LAYOUT (recovered from C2 @0x106ad0 field-by-field, cross-checked
// against SetBlurAmount / SetDefinitionAmount / GetOutput / D2):
//   HGDefinition : HGNode {
//     +0x000..+0x197                  HGNode base subobject
//                                     (C2 @0x106add calls HGNode::HGNode();
//                                      C2 @0x106ae2..@0x106ae9 overwrites
//                                      vptr with vtable-for-HGDefinition,
//                                      resolved to __DATA_CONST vtable
//                                      @0xa1afa8 [nm: "vtable for
//                                      HGDefinition (+0x10)"]).
//     +0x198  HGNode*  inputNode      (heap-owned; sized 0x1a0 via
//                                      operator new @0x106af7, constructed
//                                      via HGNode::HGNode() @0x106b07,
//                                      installed @0x106b0c).
//     +0x1a0  HGTextureWrap*  wrap    (heap-owned; sized 0x1d0 via
//                                      operator new @0x106b13, constructed
//                                      via HGTextureWrap::HGTextureWrap()
//                                      @0x106b23, installed @0x106b28).
//     +0x1a8  HGBlur*  blur           (heap-owned; sized 0x220 via
//                                      operator new @0x106b2f, constructed
//                                      via HGBlur::HGBlur() @0x106b3f,
//                                      installed @0x106b44).
//     +0x1b0  HgcDefinition*  kernel  (heap-owned; sized 0x1a0 via
//                                      operator new @0x106b4b, constructed
//                                      via HgcDefinition::HgcDefinition()
//                                      @0x106b5b, installed @0x106b60).
//     +0x1b8  float  blurAmount       (C2 @0x106aec: movq $0x0, +0x1b8 — a
//                                      qword zero-init that also clears
//                                      +0x1bc; SetBlurAmount writes here
//                                      @0x106dbc; C2 re-reads @0x106bab
//                                      to prime blur->SetParameter vfn).
//     +0x1bc  float  definitionAmount (SetDefinitionAmount writes here
//                                      @0x106de4; C2 re-reads @0x106bfa
//                                      to prime kernel->SetParameter vfn).
//   }  (min-size 0x1c0; the tail beyond +0x1bc is unused by this class.)
//
// Vtable install (leaq 0x9144bf(%rip),%rax @0x106ae2; next PC = 0x106ae9;
// target = 0xa1afa8) — same slot re-used by every dtor's defensive vptr
// reset (leaq 0x914328(%rip) @0x106c79 in D2, 0x9142c8(%rip) @0x106cd9 in
// D1, 0x914268(%rip) @0x106d39 in D0 — all resolve to 0xa1afa8).
//
// ─── C2 @Helium 0x106ad0 (base-object ctor) ─────────────────────────────────
//   Arguments: %rdi = this (HGDefinition*)
//   __ZN12HGDefinitionC2Ev:
//     0x106ad0  push rbp/rsp/r15/r14/rbx/rax   ; prologue
//     0x106ada  movq  %rdi, %rbx                ; save this
//     0x106add  callq __ZN6HGNodeC2Ev           ; HGNode::HGNode(this)
//     0x106ae2  leaq  0x9144bf(%rip), %rax      ; = vtable-for-HGDefinition
//     0x106ae9  movq  %rax, (%rbx)              ; this->vptr = vtable @0xa1afa8
//     0x106aec  movq  $0x0, 0x1b8(%rbx)         ; qword zero @+0x1b8 (clears
//                                                 both blurAmount and definition)
//     0x106af7  movl  $0x1a0, %edi              ; sizeof(inputNode) = 416
//     0x106afc  callq __ZN8HGObjectnwEm         ; operator new(0x1a0)
//     0x106b01  movq  %rax, %r15
//     0x106b04  movq  %rax, %rdi
//     0x106b07  callq __ZN6HGNodeC1Ev           ; new HGNode() (input placeholder)
//     0x106b0c  movq  %r15, 0x198(%rbx)         ; this->inputNode = r15
//     0x106b13  movl  $0x1d0, %edi              ; sizeof(HGTextureWrap) = 464
//     0x106b18  callq __ZN8HGObjectnwEm         ; operator new(0x1d0)
//     0x106b1d  movq  %rax, %r15
//     0x106b20  movq  %rax, %rdi
//     0x106b23  callq __ZN13HGTextureWrapC1Ev   ; new HGTextureWrap()
//     0x106b28  movq  %r15, 0x1a0(%rbx)         ; this->wrap = r15
//     0x106b2f  movl  $0x220, %edi              ; sizeof(HGBlur) = 544
//     0x106b34  callq __ZN8HGObjectnwEm         ; operator new(0x220)
//     0x106b39  movq  %rax, %r15
//     0x106b3c  movq  %rax, %rdi
//     0x106b3f  callq __ZN6HGBlurC1Ev           ; new HGBlur()
//     0x106b44  movq  %r15, 0x1a8(%rbx)         ; this->blur = r15
//     0x106b4b  movl  $0x1a0, %edi              ; sizeof(HgcDefinition) = 416
//     0x106b50  callq __ZN8HGObjectnwEm         ; operator new(0x1a0)
//     0x106b55  movq  %rax, %r15
//     0x106b58  movq  %rax, %rdi
//     0x106b5b  callq __ZN13HgcDefinitionC1Ev   ; new HgcDefinition()
//     0x106b60  movq  %r15, 0x1b0(%rbx)         ; this->kernel = r15
//
//     ; --- wire wrap.setInput(0, inputNode)  via vptr[15] ---
//     0x106b67  movq  0x198(%rbx), %rdx         ; rdx = inputNode
//     0x106b6e  movq  0x1a0(%rbx), %rdi         ; rdi = wrap
//     0x106b75  movq  (%rdi), %rax              ; rax = wrap->vptr
//     0x106b78  xorl  %esi, %esi                ; esi = 0 (input slot 0)
//     0x106b7a  callq *0x78(%rax)               ; wrap->vfn78(0, inputNode)
//
//     ; --- wrap.SetTextureWrapMode(WrapMode::Clamp = 1) ---
//     0x106b7d  movq  0x1a0(%rbx), %rdi
//     0x106b84  movl  $0x1, %esi
//     0x106b89  callq __ZN13HGTextureWrap18SetTextureWrapModeENS_8WrapModeE
//
//     ; --- blur.setInput(0, wrap) via vptr[15] ---
//     0x106b8e  movq  0x1a0(%rbx), %rdx         ; rdx = wrap
//     0x106b95  movq  0x1a8(%rbx), %rdi         ; rdi = blur
//     0x106b9c  movq  (%rdi), %rax
//     0x106b9f  xorl  %esi, %esi                ; esi = 0
//     0x106ba1  callq *0x78(%rax)               ; blur->vfn78(0, wrap)
//
//     ; --- blur.SetParameter(0, blurAmount, 0, 0, 0) via vptr[12] ---
//     0x106ba4  movq  0x1a8(%rbx), %rdi         ; rdi = blur
//     0x106bab  movss 0x1b8(%rbx), %xmm0        ; xmm0 = this->blurAmount (=0.0f)
//     0x106bb3  movq  (%rdi), %rax
//     0x106bb6  xorps %xmm2, %xmm2              ; xmm2 = 0
//     0x106bb9  xorps %xmm3, %xmm3              ; xmm3 = 0
//     0x106bbc  xorl  %esi, %esi                ; esi = 0 (param idx)
//     0x106bbe  movaps %xmm0, %xmm1             ; xmm1 = blurAmount (b param)
//     0x106bc1  callq *0x60(%rax)               ; blur->SetParameter(0, a=b=blurAmount, c=d=0)
//                                                 ; NOTE: b takes the SAME value as a,
//                                                 ; not 0 — mirror this exactly.
//
//     ; --- kernel.setInput(0, inputNode) via vptr[15] ---
//     0x106bc4  movq  0x198(%rbx), %rdx         ; rdx = inputNode
//     0x106bcb  movq  0x1b0(%rbx), %rdi         ; rdi = kernel
//     0x106bd2  movq  (%rdi), %rax
//     0x106bd5  xorl  %esi, %esi                ; esi = 0
//     0x106bd7  callq *0x78(%rax)               ; kernel->vfn78(0, inputNode)
//
//     ; --- kernel.setInput(1, blur) via vptr[15] ---
//     0x106bda  movq  0x1a8(%rbx), %rdx         ; rdx = blur
//     0x106be1  movq  0x1b0(%rbx), %rdi         ; rdi = kernel
//     0x106be8  movq  (%rdi), %rax
//     0x106beb  movl  $0x1, %esi                ; esi = 1
//     0x106bf0  callq *0x78(%rax)               ; kernel->vfn78(1, blur)
//
//     ; --- kernel.SetParameter(0, definitionAmount, 0, 0, 0) via vptr[12] ---
//     0x106bf3  movq  0x1b0(%rbx), %rdi         ; rdi = kernel
//     0x106bfa  movss 0x1bc(%rbx), %xmm0        ; xmm0 = this->definitionAmount (=0.0f)
//     0x106c02  movq  (%rdi), %rax
//     0x106c05  xorps %xmm1, %xmm1              ; xmm1 = 0
//     0x106c08  xorps %xmm2, %xmm2              ; xmm2 = 0
//     0x106c0b  xorps %xmm3, %xmm3              ; xmm3 = 0
//     0x106c0e  xorl  %esi, %esi                ; esi = 0 (param idx)
//     0x106c10  callq *0x60(%rax)               ; kernel->SetParameter(0, def, 0, 0, 0)
//                                                 ; NOTE: only `a` carries the value here
//                                                 ; (unlike blur above, xmm1 is zeroed
//                                                 ; BEFORE the movaps chain runs, so
//                                                 ; xmm1..xmm3 = 0). SetDefinitionAmount
//                                                 ; DOES broadcast xmm0->xmm1..xmm3 later;
//                                                 ; the ctor uses a different packing.
//     0x106c1c..0x106c1f  epilogue + ret
//
// ─── C1 @Helium 0x106c60 (complete-object ctor) ─────────────────────────────
//   __ZN12HGDefinitionC1Ev:
//     0x106c60  push rbp / mov rsp,rbp / pop rbp
//     0x106c65  jmp __ZN12HGDefinitionC2Ev
//   Pure tail-jmp to C2 — no additional work. We surface it as a static
//   factory that constructs and returns the object (semantic equivalent).
//
// ─── SetBlurAmount(float) @Helium 0x106db0 ──────────────────────────────────
//   Arguments: %rdi = this, xmm0 = ci_amount (float, "Core Image" units)
//   __ZN12HGDefinition13SetBlurAmountEf:
//     0x106db0  push rbp / mov rsp,rbp
//     0x106db4  mulss 0x2c3534(%rip), %xmm0    ; xmm0 *= *(float*)0x3ca2f0 = 3.0f
//                                                (RIP + 8 = 0x106dbc; 0x106dbc+0x2c3534
//                                                = 0x3ca2f0; 32-bit word there is
//                                                0x40400000 = 3.0f — the same constant
//                                                CIToHGBlurRadius uses in isolation.)
//     0x106dbc  movss %xmm0, 0x1b8(%rdi)       ; this->blurAmount = scaled
//     0x106dc4  movq  0x1a8(%rdi), %rdi        ; rdi = this->blur
//     0x106dcb  movq  (%rdi), %rax             ; rax = blur->vptr
//     0x106dce  movq  0x60(%rax), %rax         ; rax = vptr[12] (SetParameter)
//     0x106dd2  xorps %xmm2, %xmm2             ; c = 0
//     0x106dd5  xorps %xmm3, %xmm3             ; d = 0
//     0x106dd8  xorl  %esi, %esi               ; idx = 0
//     0x106dda  movaps %xmm0, %xmm1            ; b = a = scaled
//     0x106ddd  pop rbp
//     0x106dde  jmpq  *%rax                    ; tail: blur.SetParameter(0, s, s, 0, 0)
//
// ─── CIToHGBlurRadius(float) @Helium 0x106da0 ───────────────────────────────
//   Arguments: xmm0 = ci_radius (float)
//   __ZN12HGDefinition16CIToHGBlurRadiusEf:
//     0x106da0  push rbp / mov rsp,rbp
//     0x106da4  mulss 0x2c3544(%rip), %xmm0    ; xmm0 *= *(float*)0x3ca2f0 = 3.0f
//                                                (RIP + 8 = 0x106dac; 0x106dac+0x2c3544
//                                                = 0x3ca2f0; same 3.0f constant.)
//     0x106dac  pop rbp
//     0x106dad  retq
//   Pure static float->float scaler (no `this` argument aside from an ignored
//   implicit `%rdi` — this is a static/class method in FCP; the mangled name
//   `_ZN12HGDefinition16CIToHGBlurRadiusEf` has no `E`-const suffix, so it's
//   not `const` and takes only a float).
//
// ─── SetDefinitionAmount(float) @Helium 0x106de0 ────────────────────────────
//   Arguments: %rdi = this, xmm0 = amount (float)
//   __ZN12HGDefinition19SetDefinitionAmountEf:
//     0x106de0  push rbp / mov rsp,rbp
//     0x106de4  movss %xmm0, 0x1bc(%rdi)       ; this->definitionAmount = amount
//                                                (NO ×3 scale here — unlike blur)
//     0x106dec  movq  0x1b0(%rdi), %rdi        ; rdi = this->kernel
//     0x106df3  movq  (%rdi), %rax
//     0x106df6  movq  0x60(%rax), %rax         ; vptr[12] = SetParameter
//     0x106dfa  xorl  %esi, %esi               ; idx = 0
//     0x106dfc  movaps %xmm0, %xmm1            ; b = a
//     0x106dff  movaps %xmm0, %xmm2            ; c = a
//     0x106e02  movaps %xmm0, %xmm3            ; d = a
//     0x106e05  pop rbp
//     0x106e06  jmpq  *%rax                    ; tail: kernel.SetParameter(0, a, a, a, a)
//                                                 ; NOTE: broadcasts to all 4 slots,
//                                                 ; unlike ctor's (a,0,0,0).
//
// ─── GetOutput(HGRenderer*) @Helium 0x106e10 ────────────────────────────────
//   Arguments: %rdi = this, %rsi = renderer
//   __ZN12HGDefinition9GetOutputEP10HGRenderer:
//     0x106e10  push rbp/rsp/rbx (and rax pad)
//     0x106e16  movq  %rdi, %rbx                ; save this
//     0x106e19  movq  %rsi, %rdi                ; arg1 = renderer
//     0x106e1c  movq  %rbx, %rsi                ; arg2 = this
//     0x106e1f  xorl  %edx, %edx                ; arg3 = 0 (input idx)
//     0x106e21  callq __ZN10HGRenderer8GetInputEP6HGNodei
//                                                ; upstream = renderer.GetInput(this, 0)
//     0x106e26  movq  0x198(%rbx), %rdi         ; rdi = this->inputNode
//     0x106e2d  movq  (%rdi), %rcx              ; rcx = inputNode->vptr
//     0x106e30  xorl  %esi, %esi                ; esi = 0
//     0x106e32  movq  %rax, %rdx                ; rdx = upstream
//     0x106e35  callq *0x78(%rcx)               ; inputNode->vfn78(0, upstream)
//     0x106e38  movq  0x1b0(%rbx), %rax         ; return this->kernel
//     0x106e3f..0x106e45  epilogue + ret
//
// ─── D2 @Helium 0x106c70 (base-object dtor) ─────────────────────────────────
//   Symmetric to C2: reset vptr, then release each of the 4 sub-objects via
//   their vptr[3] (vptr+0x18) release vfn, then tail-jmp HGNode::~HGNode.
//   Fields released in this order: inputNode, wrap, blur, kernel.
//     0x106c79  leaq  0x914328(%rip),%rax  ; = 0xa1afa8 (RIP+7=0x106c80)
//     0x106c80  movq  %rax, (%rdi)         ; vptr = vtable-for-HGDefinition
//     0x106c83  release inputNode  (via vptr[3])
//     0x106c90  release wrap       (via vptr[3])
//     0x106c9d  release blur       (via vptr[3])
//     0x106caa  release kernel     (via vptr[3])
//     0x106cc0  jmp   __ZN6HGNodeD2Ev
//
// ─── D1 @Helium 0x106cd0 ────────────────────────────────────────────────────
//   Identical body to D2 (Itanium ABI often folds these; here they're
//   separate but bit-identical apart from PC-relative leaq offsets, which
//   both resolve to the same vtable @0xa1afa8).
//     0x106cd9  leaq  0x9142c8(%rip),%rax   ; RIP+7 = 0x106ce0; 0x106ce0+0x9142c8 = 0xa1afa8
//     ... same 4 releases in same order ...
//     0x106d20  jmp   __ZN6HGNodeD2Ev
//
// ─── D0 @Helium 0x106d30 (deleting dtor) ────────────────────────────────────
//   D1 body + `HGObject::operator delete(this)` at the tail.
//     0x106d39  leaq  0x914268(%rip),%rax   ; RIP+7 = 0x106d40; +0x914268 = 0xa1afa8
//     ... same 4 releases in same order ...
//     0x106d7a  callq __ZN6HGNodeD2Ev
//     0x106d88  jmp   __ZN8HGObjectdlEPv
//
// FRONTIER CALLEES (undecoded — routed through throwing stubs cited below):
//   __ZN8HGObjectnwEm            HGObject::operator new(unsigned long)
//                                @0x106afc @0x106b18 @0x106b34 @0x106b50
//   __ZN8HGObjectdlEPv           HGObject::operator delete(void*)  @0x106d88
//   __ZN13HGTextureWrapC1Ev      HGTextureWrap::HGTextureWrap()   @0x106b23
//   __ZN13HGTextureWrap18SetTextureWrapModeENS_8WrapModeE
//                                                                  @0x106b89
//   __ZN6HGBlurC1Ev              HGBlur::HGBlur()                  @0x106b3f
//   __ZN13HgcDefinitionC1Ev      HgcDefinition::HgcDefinition()    @0x106b5b
//   __ZN10HGRenderer8GetInputEP6HGNodei
//                                HGRenderer::GetInput(HGNode*, int) @0x106e21
//   HGNode-shape vptr[3] release  — @0x106c8d/@0x106c9a/@0x106ca7/@0x106cb4
//                                    (D2) and analogous PCs in D1/D0
//   HGNode-shape vptr[12] SetParameter — @0x106bc1 (blur, ctor), @0x106c10
//                                          (kernel, ctor), @0x106dde
//                                          (blur, SetBlurAmount tail),
//                                          @0x106e06 (kernel,
//                                          SetDefinitionAmount tail)
//   HGNode-shape vptr[15] "SetInput" — @0x106b7a (wrap<-inputNode),
//                                       @0x106ba1 (blur<-wrap),
//                                       @0x106bd7 (kernel<-inputNode),
//                                       @0x106bf0 (kernel<-blur),
//                                       @0x106e35 (inputNode<-upstream, in GetOutput)
//   HGNode::HGNode() (base)      — @0x106add (via C2)
//                                     NOTE: `HGNode` base IS already ported
//                                     (raw-port/src/render/HGNode.ts). C2's
//                                     ctor-chain into it is subsumed by
//                                     `class HGDefinition extends HGNode`
//                                     (the TS `super()` call).
//   HGNode::HGNode()             — @0x106b07 (for the inputNode sub-object;
//                                     conceptually the same class as the
//                                     base but constructed as a standalone
//                                     placeholder — modeled with the same
//                                     ported HGNode below).
//   HGNode::~HGNode()            — @0x106cc0/@0x106d20/@0x106d7a
//                                     (base tail-chain; TS delegates to
//                                     the class's own teardown; noted for
//                                     provenance).
//
// Single-precision numerics: `mulss` in SetBlurAmount and CIToHGBlurRadius
// runs in the SSE single lane, so the scale must go through `Math.fround`
// to match the machine's 32-bit multiply. Everywhere else, floats are
// pass-through (movss / movaps forwarding) so no rounding is needed.

/* eslint-disable @typescript-eslint/no-unused-vars */

import { HGNode } from "./HGNode";

/**
 * Opaque handle for Helium's `HGRenderer*` — the render-graph context
 * threaded through `GetOutput`. Only `HGRenderer::GetInput(HGNode*, int)`
 * is referenced from this class, via a throwing frontier stub below.
 */
export type HGRendererPtr = { readonly __brand: "HGRenderer" };

/**
 * `HGTextureWrap` — Helium's texture-wrap-mode adapter node. HGDefinition
 * owns one at +0x1a0 (allocated with sizeof = 0x1d0 bytes @0x106b13, ctor
 * @0x106b23). Only two things are touched on it from HGDefinition:
 *   - its `SetTextureWrapMode(WrapMode)` non-virtual method @0x106b89
 *     (called with the enum value 1, which the mangled inner type name
 *     `HGTextureWrap::WrapMode` — `NS_8WrapModeE` in the mangling —
 *     confirms is a scoped enum; the concrete meaning of `1` is
 *     undecoded here);
 *   - its vptr[15] "SetInput"-shape vfn @0x106b7a.
 * Full class not yet transcribed; branded here for provenance.
 */
export interface HGTextureWrap {
  readonly __brand: "HGTextureWrap";
}

/**
 * `HGBlur` — Helium's Gaussian/box-blur node (size 0x220, ctor
 * `__ZN6HGBlurC1Ev` @0x106b3f). HGDefinition owns one at +0x1a8 and drives
 * it via vptr[15] (SetInput) and vptr[12] (SetParameter) with a scaled
 * "radius" float. Full class not yet transcribed.
 */
export interface HGBlur {
  readonly __brand: "HGBlur";
}

/**
 * `HgcDefinition` — Helium's compute kernel for the Definition per-pixel
 * op (lowercase `c` = compute-kernel tier, per project convention).
 * HGDefinition owns one at +0x1b0. Sized 0x1a0 bytes (allocated @0x106b4b,
 * ctor `__ZN13HgcDefinitionC1Ev` @0x106b5b). HGDefinition touches its
 * vptr[15] (SetInput) and vptr[12] (SetParameter). Full class not yet
 * transcribed.
 */
export interface HgcDefinition {
  readonly __brand: "HgcDefinition";
}

/**
 * Frontier: `HGObject::operator new(unsigned long)` — called 4× from
 * HGDefinition::C2 with sizes 0x1a0, 0x1d0, 0x220, 0x1a0 (@0x106afc,
 * @0x106b18, @0x106b34, @0x106b50 respectively). Not yet transcribed.
 */
function HGObject_operator_new(_size: number): unknown {
  throw new Error(
    "HGObject::operator new @Helium __ZN8HGObjectnwEm @0x106afc/@0x106b18/@0x106b34/@0x106b50 not yet transcribed",
  );
}

/**
 * Frontier: `HGObject::operator delete(void*)` — reached at @0x106d88
 * (tail-jmp) from HGDefinition::~HGDefinition [D0]. GC subsumes this in TS;
 * we still cite it via a throwing stub for provenance.
 */
function HGObject_operator_delete(_p: unknown): void {
  throw new Error(
    "HGObject::operator delete @Helium __ZN8HGObjectdlEPv @0x106d88 not yet transcribed",
  );
}

/**
 * Frontier: `HGTextureWrap::HGTextureWrap()` — @0x106b23. Not transcribed.
 */
function HGTextureWrap_C1(): HGTextureWrap {
  throw new Error(
    "HGTextureWrap::HGTextureWrap @Helium __ZN13HGTextureWrapC1Ev @0x106b23 not yet transcribed",
  );
}

/**
 * Frontier: `HGTextureWrap::SetTextureWrapMode(HGTextureWrap::WrapMode)`
 * — @0x106b89, called with the scoped-enum value `1` (concrete label
 * undecoded; the mangling `NS_8WrapModeE` confirms the enum type name).
 */
function HGTextureWrap_SetTextureWrapMode(
  _self: HGTextureWrap,
  _mode: number,
): void {
  throw new Error(
    "HGTextureWrap::SetTextureWrapMode @Helium __ZN13HGTextureWrap18SetTextureWrapModeENS_8WrapModeE @0x106b89 not yet transcribed",
  );
}

/**
 * Frontier: `HGBlur::HGBlur()` — @0x106b3f. Not transcribed.
 */
function HGBlur_C1(): HGBlur {
  throw new Error(
    "HGBlur::HGBlur @Helium __ZN6HGBlurC1Ev @0x106b3f not yet transcribed",
  );
}

/**
 * Frontier: `HgcDefinition::HgcDefinition()` — @0x106b5b. Not transcribed.
 */
function HgcDefinition_C1(): HgcDefinition {
  throw new Error(
    "HgcDefinition::HgcDefinition @Helium __ZN13HgcDefinitionC1Ev @0x106b5b not yet transcribed",
  );
}

/**
 * Frontier: `HGRenderer::GetInput(HGNode*, int)` — @0x106e21. Returns the
 * upstream HGNode bound to input slot `idx` on `node` in the given renderer
 * context. HGDefinition::GetOutput uses `idx = 0`. Not transcribed.
 */
function HGRenderer_GetInput(
  _renderer: HGRendererPtr,
  _node: HGDefinition,
  _idx: number,
): HGNode | null {
  throw new Error(
    "HGRenderer::GetInput @Helium __ZN10HGRenderer8GetInputEP6HGNodei @0x106e21 not yet transcribed",
  );
}

/**
 * Frontier: HGNode-shape vptr[3] (offset +0x18) — the `release` vfn on any
 * HGNode-derived heap object. HGDefinition's dtors call it 4× on each of
 * inputNode/wrap/blur/kernel (@0x106c8d @0x106c9a @0x106ca7 @0x106cb4 in
 * D2, and analogous PCs in D1 @0x106ced.. and D0 @0x106d4d..). The concrete
 * override differs per class (inputNode = HGNode::release; wrap =
 * HGTextureWrap::release; blur = HGBlur::release; kernel =
 * HgcDefinition::release) — all four undecoded here.
 */
function HGNode_vfn_0x18_release(_self: unknown): void {
  throw new Error(
    "HGNode-shape vptr[3] (release) @Helium @0x106c8d/@0x106c9a/@0x106ca7/@0x106cb4 (D2) and mirror PCs in D1/D0 not yet transcribed",
  );
}

/**
 * Frontier: HGNode-shape vptr[12] (offset +0x60) — `SetParameter(int idx,
 * float a, float b, float c, float d)`. HGDefinition tail-jumps or calls
 * into this at 4 sites:
 *   - @0x106bc1 (blur, from C2) — args (0, blurAmount, blurAmount, 0, 0)
 *   - @0x106c10 (kernel, from C2) — args (0, definitionAmount, 0, 0, 0)
 *   - @0x106dde (blur, tail-jmp from SetBlurAmount) — args (0, s, s, 0, 0)
 *   - @0x106e06 (kernel, tail-jmp from SetDefinitionAmount) — args (0, a, a, a, a)
 * Concrete overrides (HGBlur::SetParameter, HgcDefinition::SetParameter)
 * both undecoded here.
 */
function HGNode_vfn_0x60_SetParameter(
  _self: unknown,
  _idx: number,
  _a: number,
  _b: number,
  _c: number,
  _d: number,
): void {
  throw new Error(
    "HGNode-shape vptr[12] (SetParameter) @Helium @0x106bc1/@0x106c10/@0x106dde/@0x106e06 not yet transcribed",
  );
}

/**
 * Frontier: HGNode-shape vptr[15] (offset +0x78) — the "SetInput"-shape
 * vfn, `(self, int idx, HGNode* src)`. HGDefinition calls it at 5 sites:
 *   - @0x106b7a (wrap.SetInput(0, inputNode), C2)
 *   - @0x106ba1 (blur.SetInput(0, wrap),      C2)
 *   - @0x106bd7 (kernel.SetInput(0, inputNode), C2)
 *   - @0x106bf0 (kernel.SetInput(1, blur),      C2)
 *   - @0x106e35 (inputNode.SetInput(0, upstream), GetOutput)
 * Concrete overrides undecoded; mirrors the pattern used by HGColorBias
 * (see HGColorBias.ts vfn_0x78 stub).
 */
function HGNode_vfn_0x78_SetInput(
  _self: unknown,
  _idx: number,
  _src: unknown,
): void {
  throw new Error(
    "HGNode-shape vptr[15] (SetInput) @Helium @0x106b7a/@0x106ba1/@0x106bd7/@0x106bf0/@0x106e35 not yet transcribed",
  );
}

/**
 * `HGDefinition` — Helium's Definition per-pixel render-graph node.
 *
 * Vtable install: __DATA_CONST slot @Helium 0xa1afa8 (nm-resolved:
 * "vtable for HGDefinition (+0x10)"), loaded at C2 @0x106ae2 and re-loaded
 * defensively at every dtor site.
 *
 * Sub-objects (all heap-owned, released via vptr[3] in each dtor):
 *   inputNode        @+0x198  HGNode         size 0x1a0
 *   wrap             @+0x1a0  HGTextureWrap  size 0x1d0
 *   blur             @+0x1a8  HGBlur         size 0x220
 *   kernel           @+0x1b0  HgcDefinition  size 0x1a0
 *
 * Float state:
 *   blurAmount       @+0x1b8  (set by SetBlurAmount after ×3 scale)
 *   definitionAmount @+0x1bc  (set by SetDefinitionAmount, no scale)
 *
 * The class subclasses HGNode (already transcribed at
 * raw-port/src/render/HGNode.ts); the base-subobject bytes 0x000..0x197 are
 * managed by the TS class hierarchy (`super()`), which subsumes the
 * `callq __ZN6HGNodeC2Ev` at @0x106add.
 */
export class HGDefinition extends HGNode {
  // Sub-object slots — all heap-owned, all released in the dtors.
  /** @+0x198 — placeholder HGNode used as the wired "input" node. */
  inputNode: HGNode;
  /** @+0x1a0 — texture-wrap adapter, seeded with WrapMode = 1 in C2. */
  wrap: HGTextureWrap;
  /** @+0x1a8 — Gaussian/box blur; driven by blurAmount. */
  blur: HGBlur;
  /** @+0x1b0 — compute kernel; driven by definitionAmount. */
  kernel: HgcDefinition;

  // Float state — 32-bit; wrap all writes in Math.fround where the machine
  // performs a single-precision op (SetBlurAmount).
  /** @+0x1b8 — float; C2 qword-zeroed @0x106aec, written by SetBlurAmount. */
  blurAmount: number;
  /** @+0x1bc — float; C2 qword-zeroed (upper half of the +0x1b8 store) at
   *  @0x106aec, written by SetDefinitionAmount. */
  definitionAmount: number;

  /**
   * HGDefinition::HGDefinition() [C2] @Helium 0x106ad0
   * (C1 @0x106c60 is a tail-jmp into C2 — no additional work).
   *
   * Faithful port: mirror the field init order and the vfn wiring order
   * exactly, since sub-objects observe the calls in this sequence.
   */
  constructor() {
    // @0x106add HGNode::HGNode(this) — the base-subobject ctor, subsumed by
    //           the TS class hierarchy's `super()` call.
    super();

    // @0x106ae2..@0x106ae9 vtable install (vptr = 0xa1afa8, "vtable for
    // HGDefinition"). No-op in TS: the language handles method dispatch.

    // @0x106aec  movq $0, +0x1b8  — qword zero clears both float fields.
    this.blurAmount = Math.fround(0.0);
    this.definitionAmount = Math.fround(0.0);

    // @0x106af7..@0x106b0c inputNode = new HGNode()  (size 0x1a0).
    //   In C++: `HGObject::operator new(0x1a0)` then `HGNode::HGNode()`.
    //   HGNode is already ported (raw-port/src/render/HGNode.ts); use it
    //   directly rather than routing through the frontier operator-new
    //   stub. If a future audit demands bit-exact allocation semantics,
    //   swap to HGObject_operator_new(0x1a0) + placement-init.
    this.inputNode = new HGNode();

    // @0x106b13..@0x106b28 wrap = new HGTextureWrap()  (size 0x1d0).
    //   HGTextureWrap is a frontier class; construction goes through the
    //   throwing stub, matching decode-don't-guess.
    this.wrap = HGTextureWrap_C1();

    // @0x106b2f..@0x106b44 blur = new HGBlur()  (size 0x220).
    this.blur = HGBlur_C1();

    // @0x106b4b..@0x106b60 kernel = new HgcDefinition()  (size 0x1a0).
    this.kernel = HgcDefinition_C1();

    // @0x106b67..@0x106b7a wrap.SetInput(0, inputNode)  via vptr[15].
    HGNode_vfn_0x78_SetInput(this.wrap, 0, this.inputNode);

    // @0x106b7d..@0x106b89 wrap.SetTextureWrapMode(WrapMode = 1).
    HGTextureWrap_SetTextureWrapMode(this.wrap, 1);

    // @0x106b8e..@0x106ba1 blur.SetInput(0, wrap)  via vptr[15].
    HGNode_vfn_0x78_SetInput(this.blur, 0, this.wrap);

    // @0x106ba4..@0x106bc1 blur.SetParameter(0, blurAmount, blurAmount, 0, 0)
    // via vptr[12]. Note: xmm1 = xmm0 (movaps @0x106bbe) → arg `b` mirrors
    // `a`; xmm2/xmm3 zeroed → c=d=0.
    HGNode_vfn_0x60_SetParameter(
      this.blur,
      0,
      this.blurAmount,
      this.blurAmount,
      Math.fround(0.0),
      Math.fround(0.0),
    );

    // @0x106bc4..@0x106bd7 kernel.SetInput(0, inputNode)  via vptr[15].
    HGNode_vfn_0x78_SetInput(this.kernel, 0, this.inputNode);

    // @0x106bda..@0x106bf0 kernel.SetInput(1, blur)  via vptr[15].
    HGNode_vfn_0x78_SetInput(this.kernel, 1, this.blur);

    // @0x106bf3..@0x106c10 kernel.SetParameter(0, definitionAmount, 0, 0, 0)
    // via vptr[12]. Note the DIFFERENT packing from the blur call above:
    // xmm1..xmm3 are zeroed BEFORE any movaps runs (@0x106c05..@0x106c0b),
    // so b=c=d=0 rather than mirroring a.
    HGNode_vfn_0x60_SetParameter(
      this.kernel,
      0,
      this.definitionAmount,
      Math.fround(0.0),
      Math.fround(0.0),
      Math.fround(0.0),
    );
  }

  /**
   * HGDefinition::HGDefinition() [C1] @Helium 0x106c60 — pure tail-jmp to
   * C2. Exposed as a static factory to preserve the C1/C2 address-space
   * distinction the ledger tracks.
   */
  static C1(): HGDefinition {
    // @0x106c65 jmp __ZN12HGDefinitionC2Ev
    return new HGDefinition();
  }

  /**
   * HGDefinition::SetBlurAmount(float ci_amount) @Helium 0x106db0.
   *
   *   @0x106db4 mulss  0x2c3534(%rip), %xmm0    ; xmm0 *= 3.0f
   *   @0x106dbc movss  %xmm0, 0x1b8(%rdi)       ; this->blurAmount = scaled
   *   @0x106dc4 movq   0x1a8(%rdi), %rdi         ; rdi = this->blur
   *   @0x106dcb movq   (%rdi), %rax
   *   @0x106dce movq   0x60(%rax), %rax          ; vptr[12] = SetParameter
   *   @0x106dd2 xorps  %xmm2, %xmm2              ; c = 0
   *   @0x106dd5 xorps  %xmm3, %xmm3              ; d = 0
   *   @0x106dd8 xorl   %esi, %esi                ; idx = 0
   *   @0x106dda movaps %xmm0, %xmm1              ; b = a
   *   @0x106dde jmpq   *%rax                     ; tail:
   *                                                blur.SetParameter(0, s, s, 0, 0)
   *
   * The scale constant is at __DATA @Helium 0x3ca2f0 — the 32-bit word
   * there is 0x40400000, which is IEEE-754 single-precision `3.0f`. Same
   * address is referenced (with a different RIP-relative delta) by
   * CIToHGBlurRadius below. `mulss` is a single-precision multiply → wrap
   * the TS multiply in Math.fround to match bit-exactly.
   */
  SetBlurAmount(ci_amount: number): void {
    // @0x106db4  xmm0 *= 3.0f  (single-precision).
    const scaled = Math.fround(Math.fround(ci_amount) * Math.fround(3.0));
    // @0x106dbc  this->blurAmount = scaled.
    this.blurAmount = scaled;
    // @0x106dc4..@0x106dde  tail-jmp: blur.SetParameter(0, s, s, 0, 0).
    HGNode_vfn_0x60_SetParameter(
      this.blur,
      0,
      scaled,
      scaled,
      Math.fround(0.0),
      Math.fround(0.0),
    );
  }

  /**
   * HGDefinition::CIToHGBlurRadius(float ci_radius) @Helium 0x106da0.
   *
   *   @0x106da4 mulss 0x2c3544(%rip), %xmm0    ; xmm0 *= 3.0f
   *   @0x106dad retq
   *
   * Pure static float→float scaler; the same 3.0f constant at Helium data
   * address 0x3ca2f0 (word `0x40400000`). The mangled name has no `Ef`+`E`
   * const-suffix, so this is a static/free member — modeled as a static.
   */
  static CIToHGBlurRadius(ci_radius: number): number {
    // @0x106da4  xmm0 *= 3.0f  (single-precision).
    return Math.fround(Math.fround(ci_radius) * Math.fround(3.0));
  }

  /**
   * HGDefinition::SetDefinitionAmount(float amount) @Helium 0x106de0.
   *
   *   @0x106de4 movss  %xmm0, 0x1bc(%rdi)       ; this->definitionAmount = amount
   *   @0x106dec movq   0x1b0(%rdi), %rdi         ; rdi = this->kernel
   *   @0x106df3 movq   (%rdi), %rax
   *   @0x106df6 movq   0x60(%rax), %rax          ; vptr[12]
   *   @0x106dfa xorl   %esi, %esi                ; idx = 0
   *   @0x106dfc movaps %xmm0, %xmm1              ; b = a
   *   @0x106dff movaps %xmm0, %xmm2              ; c = a
   *   @0x106e02 movaps %xmm0, %xmm3              ; d = a
   *   @0x106e06 jmpq   *%rax                     ; tail:
   *                                                kernel.SetParameter(0, a, a, a, a)
   *
   * No scale here (unlike SetBlurAmount); the value is stored raw and
   * broadcast to all four SetParameter float slots.
   */
  SetDefinitionAmount(amount: number): void {
    const v = Math.fround(amount);
    // @0x106de4  this->definitionAmount = amount.
    this.definitionAmount = v;
    // @0x106dec..@0x106e06  tail: kernel.SetParameter(0, v, v, v, v).
    HGNode_vfn_0x60_SetParameter(this.kernel, 0, v, v, v, v);
  }

  /**
   * HGDefinition::GetOutput(HGRenderer*) @Helium 0x106e10.
   *
   *   @0x106e21 callq HGRenderer::GetInput(renderer, this, 0)
   *                                                ; upstream = renderer's
   *                                                ; input-slot-0 binding
   *                                                ; for THIS node
   *   @0x106e26 movq  0x198(%rbx), %rdi            ; rdi = this->inputNode
   *   @0x106e35 callq *0x78(inputNode->vptr)      ; inputNode.SetInput(0, upstream)
   *   @0x106e38 movq  0x1b0(%rbx), %rax            ; return this->kernel
   *
   * Semantics: this node's "output" IS the kernel object; each GetOutput
   * call refreshes the internal inputNode's slot-0 binding with the current
   * upstream so that the sub-graph (inputNode → wrap → blur; inputNode →
   * kernel; blur → kernel) samples the correct upstream frame.
   */
  GetOutput(renderer: HGRendererPtr): HgcDefinition {
    // @0x106e21  upstream = renderer.GetInput(this, 0).
    const upstream = HGRenderer_GetInput(renderer, this, 0);
    // @0x106e26..@0x106e35  inputNode.SetInput(0, upstream)  via vptr[15].
    HGNode_vfn_0x78_SetInput(this.inputNode, 0, upstream);
    // @0x106e38  return this->kernel.
    return this.kernel;
  }

  /**
   * HGDefinition::~HGDefinition() [D2 base dtor] @Helium 0x106c70.
   *   0x106c79  leaq  0x914328(%rip),%rax    ; = vtable-for-HGDefinition
   *   0x106c80  movq  %rax, (%rdi)            ; vptr reset (defensive)
   *   0x106c83  release inputNode (vptr[3])
   *   0x106c90  release wrap      (vptr[3])
   *   0x106c9d  release blur      (vptr[3])
   *   0x106caa  release kernel    (vptr[3])
   *   0x106cc0  jmp   HGNode::~HGNode()
   *
   * The vptr reset is a no-op in TS. The 4 releases happen in a fixed
   * order — we mirror it exactly. The base-dtor tail-chain is subsumed by
   * the TS class hierarchy.
   */
  destroy_D2(): void {
    HGNode_vfn_0x18_release(this.inputNode);
    HGNode_vfn_0x18_release(this.wrap);
    HGNode_vfn_0x18_release(this.blur);
    HGNode_vfn_0x18_release(this.kernel);
    // @0x106cc0 jmp HGNode::~HGNode — TS class hierarchy handles base
    // teardown; noted for provenance.
  }

  /**
   * HGDefinition::~HGDefinition() [D1 complete dtor] @Helium 0x106cd0.
   * Body is bit-identical to D2 (only PC-relative leaq offset differs;
   * @0x106cd9 loads 0x9142c8(%rip), same 0xa1afa8 target). Kept as a
   * separate exported entry so the ledger tracks both mangled symbols.
   */
  destroy_D1(): void {
    HGNode_vfn_0x18_release(this.inputNode);
    HGNode_vfn_0x18_release(this.wrap);
    HGNode_vfn_0x18_release(this.blur);
    HGNode_vfn_0x18_release(this.kernel);
    // @0x106d20 jmp HGNode::~HGNode.
  }

  /**
   * HGDefinition::~HGDefinition() [D0 deleting dtor] @Helium 0x106d30.
   * D1 body + trailing `HGObject::operator delete(this)` tail-jmp
   * @0x106d88. GC subsumes the delete in TS.
   */
  destroy_D0(): void {
    HGNode_vfn_0x18_release(this.inputNode);
    HGNode_vfn_0x18_release(this.wrap);
    HGNode_vfn_0x18_release(this.blur);
    HGNode_vfn_0x18_release(this.kernel);
    // @0x106d7a callq HGNode::~HGNode  (TS: base teardown subsumed).
    // @0x106d88 jmp   HGObject::operator delete(this) — GC subsumes.
    HGObject_operator_delete(this);
  }
}
