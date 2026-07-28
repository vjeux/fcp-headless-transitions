// raw-port/src/render/HGYUV444ToPlanarLuma.ts
//
// FCP `HGYUV444ToPlanarLuma` — Helium render-graph facade node (HGNode
// subclass) that at GetOutput-time selects ONE of three kernel
// compositors (based on its stored `LumaPerPixel` mode field) and
// wires that kernel to the renderer's input-0 upstream.
//
// This is a thin dispatcher / kernel-installer node — the whole class
// is ~80 lines of asm across 3 ctor variants, 3 dtor variants, and
// GetOutput. All numeric work happens inside the three kernel classes
// (HgcYUV420BiPlanar_luma / _luma_pack2 / _luma_pack4), which are
// separate FCP classes (still on the frontier).
//
// Provenance: /Applications/Final Cut Pro.app/Contents/Frameworks/
//             Helium.framework/Versions/A/Helium (x86_64 slice;
//             VAs are unadjusted VM addresses from `otool -tV`).
//
// Disassembly saved at:
//   raw-port/re/disasm/Helium.HGYUV444ToPlanarLuma.HGYUV444ToPlanarLuma.s
//   raw-port/re/disasm/Helium.HGYUV444ToPlanarLuma.GetOutput.s
//   (C2-default @0xe59e0, C1-default @0xe5a20, C2-arg @0xe5a60,
//    C1-arg    @0xe5aa0, D2 @0xe5ae0, D1 @0xe5b20, D0 @0xe5b60,
//    GetOutput @0xe5bb0 — inline-dumped)
//
// Ledger addresses (all Helium):
//   0xe59e0  HGYUV444ToPlanarLuma::HGYUV444ToPlanarLuma()             [C2 default]
//   0xe5a20  HGYUV444ToPlanarLuma::HGYUV444ToPlanarLuma()             [C1 default]
//   0xe5a60  HGYUV444ToPlanarLuma::HGYUV444ToPlanarLuma(LumaPerPixel) [C2 arg]
//   0xe5aa0  HGYUV444ToPlanarLuma::HGYUV444ToPlanarLuma(LumaPerPixel) [C1 arg]
//   0xe5ae0  HGYUV444ToPlanarLuma::~HGYUV444ToPlanarLuma()            [D2 base dtor]
//   0xe5b20  HGYUV444ToPlanarLuma::~HGYUV444ToPlanarLuma()            [D1 complete dtor]
//   0xe5b60  HGYUV444ToPlanarLuma::~HGYUV444ToPlanarLuma()            [D0 deleting dtor]
//   0xe5bb0  HGYUV444ToPlanarLuma::GetOutput(HGRenderer*)
//
// VTABLE INSTALLED IN THIS CLASS:
//   All seven vptr writes (across the four ctor bodies and the three
//   dtor bodies) resolve to the SAME address, 0xa0e658:
//     C2-default @0xe59ee  leaq 0x928c63(%rip),%rax -> 0xe59f5 + 0x928c63 = 0xa0e658
//     C1-default @0xe5a2e  leaq 0x928c23(%rip),%rax -> 0xe5a35 + 0x928c23 = 0xa0e658
//     C2-arg     @0xe5a71  leaq 0x928be0(%rip),%rax -> 0xe5a78 + 0x928be0 = 0xa0e658
//     C1-arg     @0xe5ab1  leaq 0x928ba0(%rip),%rax -> 0xe5ab8 + 0x928ba0 = 0xa0e658
//     D2         @0xe5ae6  leaq 0x928b6b(%rip),%rax -> 0xe5aed + 0x928b6b = 0xa0e658
//     D1         @0xe5b26  leaq 0x928b2b(%rip),%rax -> 0xe5b2d + 0x928b2b = 0xa0e658
//     D0         @0xe5b69  leaq 0x928ae8(%rip),%rax -> 0xe5b70 + 0x928ae8 = 0xa0e658
//   -> installed-ptr for HGYUV444ToPlanarLuma is 0xa0e658 (which is the
//     first-slot address of the vtable object at Helium 0xa0e648;
//     confirmed by `vtable.py Helium HGYUV444ToPlanarLuma`).
//
// STRUCT LAYOUT (recovered from C1/C2/D0/GetOutput asm):
//   HGYUV444ToPlanarLuma {
//     +0x000  vptr                    (set = 0xa0e658 by all ctors/dtors)
//     +0x008..+0x197                   (HGNode base subobject — landed in
//                                       HGNode.ts; base size 0x198)
//     +0x198  HGNode* kernel           (owned; picked by mode at GetOutput
//                                       time; installed via the
//                                       "cmp/test/release-old" dance
//                                       @0xe5bef..@0xe5c45. Initialized
//                                       to NULL by all four ctors —
//                                       C2-default @0xe59f8, C1-default
//                                       @0xe5a38, C2-arg @0xe5a7b, C1-arg
//                                       @0xe5abb.)
//     +0x1a0  u32 lumaMode             (LumaPerPixel enum; ctors write %ebx
//                                       @0xe5ac6 (C1-arg) / @0xe5a86 (C2-arg);
//                                       default ctors write $0 @0xe5a43
//                                       (C1-default) / @0xe5a03 (C2-default).)
//   }
//   sizeof(HGYUV444ToPlanarLuma) = 0x1a8 bytes = 424 (0x198 base + 8 ptr + 4 u32 + 4 pad).
//   Total-size probe: GetOutput @0xe5bc8 issues `movl $0x1a0, %edi` before
//   `HGObject::operator new` — that is the size of the KERNEL to allocate,
//   NOT the size of `this` (see comment on GetOutput below).
//
// --- LumaPerPixel enum values (recovered from GetOutput dispatch) ---------
//   @0xe5bc1  movl 0x1a0(%rdi), %r12d   ; r12d = this->lumaMode
//   @0xe5bc8  movl $0x1a0, %edi         ; size for HGObject::operator new
//   @0xe5bcd  callq HGObject::operator new(0x1a0)
//   @0xe5bd5  cmpl $0x1, %r12d
//   @0xe5bd9  je   0xe5c05              ; mode == 1 -> HgcYUV420BiPlanar_luma_pack2
//   @0xe5bdb  testl %r12d, %r12d
//   @0xe5bde  jne  0xe5c26              ; mode != 0 (i.e. >= 2) -> HgcYUV420BiPlanar_luma
//   @0xe5be0  ...                        ; fall-through: mode == 0 -> HgcYUV420BiPlanar_luma_pack4
//
//   So LumaPerPixel is a u32 with three known values:
//     0 -> Pack4  (default; all four default ctors write $0 to +0x1a0)
//     1 -> Pack2
//     >=2 -> Plain (unpacked luma)
//   Named accordingly in TS (`LumaPerPixel_Pack4=0`, `LumaPerPixel_Pack2=1`,
//   `LumaPerPixel_Plain=2`). Values 3..inf funnel into the same "Plain"
//   branch by the >=2 test; we do not manufacture higher enum names.
//
// --- GetOutput @Helium 0xe5bb0 --------------------------------------------
//   Signature: (this, HGRenderer* r) -> HGNode*
//     %rdi = this, %rsi = renderer
//
//   Body sketch (main-line, exceptional-cleanup tail is provenance-only):
//     @0xe5bc1  movl 0x1a0(%rdi), %r12d   ; mode = this->lumaMode
//     @0xe5bc8  movl $0x1a0, %edi         ; kernel size = 0x1a0 bytes
//     @0xe5bcd  callq HGObject::operator new(0x1a0)   ; rax = raw kernel storage
//     @0xe5bd2  movq %rax, %rbx           ; rbx = newKernel
//     @0xe5bd5..@0xe5bde  dispatch on mode (see enum comment above)
//
//     +-- mode == 0 (Pack4) ------------------------------------------------
//     | @0xe5be0  movq %rbx, %rdi
//     | @0xe5be3  callq HgcYUV420BiPlanar_luma_pack4::HgcYUV420BiPlanar_luma_pack4()
//     | @0xe5be8  movq 0x198(%r14), %rdi  ; oldKernel = this->kernel
//     | @0xe5bef  cmpq %rbx, %rdi         ; if oldKernel == newKernel
//     | @0xe5bf2  je   0xe5c7e            ;   goto Release-newKernel (aliased path)
//     | @0xe5bf8  testq %rdi, %rdi        ; else if oldKernel == NULL
//     | @0xe5bfb  je   0xe5c45            ;   skip release, goto Install
//     | @0xe5bfd  movq (%rdi), %rax
//     | @0xe5c00  callq *0x18(%rax)       ; else oldKernel->release()  (vfn slot 0x18)
//     | @0xe5c03  jmp  0xe5c45            ; goto Install
//     +---------------------------------------------------------------------
//
//     +-- mode == 1 (Pack2) ------------------------------------------------
//     | @0xe5c05  movq %rbx, %rdi
//     | @0xe5c08  callq HgcYUV420BiPlanar_luma_pack2::HgcYUV420BiPlanar_luma_pack2()
//     | @0xe5c0d  movq 0x198(%r14), %rdi  ; oldKernel = this->kernel
//     | @0xe5c14  cmpq %rbx, %rdi
//     | @0xe5c17  je   0xe5c8e            ; alias-guard release-of-new path
//     | @0xe5c19  testq %rdi, %rdi
//     | @0xe5c1c  je   0xe5c45            ; skip release if null
//     | @0xe5c1e  movq (%rdi), %rax
//     | @0xe5c21  callq *0x18(%rax)       ; oldKernel->release()
//     | @0xe5c24  jmp  0xe5c45            ; goto Install
//     +---------------------------------------------------------------------
//
//     +-- mode >= 2 (Plain) ------------------------------------------------
//     | @0xe5c26  movq %rbx, %rdi
//     | @0xe5c29  callq HgcYUV420BiPlanar_luma::HgcYUV420BiPlanar_luma()
//     | @0xe5c2e  movq 0x198(%r14), %rdi  ; oldKernel = this->kernel
//     | @0xe5c35  cmpq %rbx, %rdi
//     | @0xe5c38  je   0xe5c9e            ; alias-guard release-of-new path
//     | @0xe5c3a  testq %rdi, %rdi
//     | @0xe5c3d  je   0xe5c45            ; skip release if null
//     | @0xe5c3f  movq (%rdi), %rax
//     | @0xe5c42  callq *0x18(%rax)       ; oldKernel->release()
//     | (falls through to Install)
//     +---------------------------------------------------------------------
//
//     +-- Install (label 0xe5c45) — wire the freshly allocated kernel ------
//     | @0xe5c45  movq %rbx, 0x198(%r14)   ; this->kernel = newKernel
//     | @0xe5c4c  movq 0x198(%r14), %rbx   ; rbx = this->kernel (reload)
//     | @0xe5c53  movq %r15, %rdi          ; arg1 = renderer
//     | @0xe5c56  movq %r14, %rsi          ; arg2 = this (HGNode*)
//     | @0xe5c59  xorl %edx, %edx          ; arg3 = 0 (slot)
//     | @0xe5c5b  callq HGRenderer::GetInput(HGNode*, int)  ; upstream = renderer->GetInput(this, 0)
//     | @0xe5c60  movq (%rbx), %rcx        ; rcx = kernel->vptr
//     | @0xe5c66  xorl %esi, %esi          ; arg2 = 0 (slot)
//     | @0xe5c68  movq %rax, %rdx          ; arg3 = upstream (from GetInput)
//     | @0xe5c6b  callq *0x78(%rcx)        ; kernel->vptr[15](kernel, 0, upstream)  — BindInput
//     | @0xe5c6e  movq 0x198(%r14), %rax   ; return this->kernel
//     | @0xe5c75..@0xe5c7d  epilogue / retq
//     +---------------------------------------------------------------------
//
//   Semantics: on every call, GetOutput allocates a FRESH kernel, releases
//   the old one (if any and if not aliased to the new pointer — the
//   compiler emits an alias-guard because HGObject::operator new could
//   theoretically hand back the same pointer; not observable at TS level
//   but preserved for provenance), then wires the kernel's input slot 0
//   to whatever the renderer says is upstream at slot 0 of `this`.
//
//   IMPORTANT — the ONLY input this class exposes is slot 0. Contrast
//   with HGChannelCopy (two inputs) and HGColorBias (single input via
//   HGRenderer::GetInput).
//
// --- Exception-cleanup tails (@0xe5c7e..@0xe5d2e) --------------------------
//   Aliased-release paths (@0xe5c7e, @0xe5c8e, @0xe5c9e) and unwind-resume
//   trampolines (@0xe5cae..@0xe5d29) — Itanium ABI unwind emissions. In
//   TS these collapse into normal exception propagation; provenance-only.
//
// FRONTIER CALLEES (undecoded — throwing stubs cite them):
//   __ZN8HGObjectnwEm                          HGObject::operator new(unsigned long)   @0xe5bcd
//   __ZN28HgcYUV420BiPlanar_luma_pack4C1Ev     HgcYUV420BiPlanar_luma_pack4::C1()      @0xe5be3
//   __ZN28HgcYUV420BiPlanar_luma_pack2C1Ev     HgcYUV420BiPlanar_luma_pack2::C1()      @0xe5c08
//   __ZN22HgcYUV420BiPlanar_lumaC1Ev           HgcYUV420BiPlanar_luma::C1()            @0xe5c29
//   HgcYUV420BiPlanar_luma* vfn @0x18          release/dispose                         @0xe5c00 @0xe5c21 @0xe5c42
//                                                                                       @0xe5c89 @0xe5c99 @0xe5ca9
//                                                                                       @0xe5cd4 @0xe5cef @0xe5d0a
//   HgcYUV420BiPlanar_luma* vfn @0x78          BindInput(slot, upstream)               @0xe5c6b
//   __ZN10HGRenderer8GetInputEP6HGNodei        HGRenderer::GetInput(HGNode*, int)       @0xe5c5b
//   __ZN8HGObjectdlEPv                         HGObject::operator delete(void*)         @0xe5d21
//   ___clang_call_terminate                                                             @0xe5cb1 (etc.)
//   __Unwind_Resume (stub)                                                              @0xe5d29
//
// Landed callees (imported as real classes, not re-stubbed):
//   HGNode::HGNode() @0x11baf0 -> super() via imported HGNode
//   HGNode::~HGNode() @0x11bf20 -> base destructor via imported HGNode

/* eslint-disable @typescript-eslint/no-unused-vars */

import { HGNode } from "./HGNode";

/**
 * Opaque handle for Helium's `HGRenderer*` — the render-graph context
 * threaded through GetOutput. HGYUV444ToPlanarLuma::GetOutput actually
 * DOES use the renderer (unlike HGChannelCopy::GetOutput which loads it
 * but never forwards it): it passes it as the first arg to
 * HGRenderer::GetInput @0xe5c5b.
 */
export type HGRendererPtr = { readonly __brand: "HGRenderer" };

/**
 * Opaque forward-reference for the three sibling kernel classes
 * (HgcYUV420BiPlanar_luma / _luma_pack2 / _luma_pack4). All three
 * share the same base ABI layout (a vptr at offset 0 with slots
 * 0x18=release and 0x78=BindInput used by this facade).
 */
export interface HgcYUV420BiPlanar_luma_Base {
  readonly __brand: "HgcYUV420BiPlanar_luma_Base";
}

/**
 * `HGYUV444ToPlanarLuma::LumaPerPixel` — u32 enum written to +0x1a0.
 *
 * Values recovered from GetOutput @Helium 0xe5bb0 dispatch:
 *   0 -> Pack4 (default; @0xe5be3 -> HgcYUV420BiPlanar_luma_pack4::C1)
 *   1 -> Pack2 (@0xe5c08 -> HgcYUV420BiPlanar_luma_pack2::C1)
 *   >=2 -> Plain / unpacked (@0xe5c29 -> HgcYUV420BiPlanar_luma::C1)
 *
 * The default value used by both parameterless ctors (@0xe59e0 and
 * @0xe5a20) is 0 (Pack4) — read from `movl $0x0, 0x1a0(%rbx)` at
 * @0xe5a03 (C2-default) and @0xe5a43 (C1-default).
 */
export const LumaPerPixel_Pack4 = 0; // @0xe5be3 dispatch
export const LumaPerPixel_Pack2 = 1; // @0xe5c08 dispatch
export const LumaPerPixel_Plain = 2; // @0xe5c29 dispatch (any value >= 2)
export type LumaPerPixel = number; // u32 mode; 0/1/>=2 recognized above.

/** Frontier: `HGObject::operator new(unsigned long)` — allocates
 *  kernel storage in GetOutput @0xe5bcd with size 0x1a0. Not yet
 *  transcribed at @0xe5bcd. */
function HGObject_operator_new(
  _size: number,
): HgcYUV420BiPlanar_luma_Base {
  // @0xe5bcd callq __ZN8HGObjectnwEm (with %edi = 0x1a0)
  throw new Error(
    "HGObject::operator new @Helium __ZN8HGObjectnwEm @0xe5bcd not yet transcribed",
  );
}

/** Frontier: `HGObject::operator delete(void*)` — reached only from
 *  the exception-cleanup tail @0xe5d21 (unwind path from failed
 *  kernel ctor). Not modeled beyond a stub; TS's exception path
 *  handles the equivalent semantics via GC. */
function HGObject_operator_delete(
  _p: HgcYUV420BiPlanar_luma_Base,
): void {
  // @0xe5d21 callq __ZN8HGObjectdlEPv
  throw new Error(
    "HGObject::operator delete @Helium __ZN8HGObjectdlEPv @0xe5d21 not yet transcribed",
  );
}

/** Frontier: `HgcYUV420BiPlanar_luma_pack4::HgcYUV420BiPlanar_luma_pack4()`
 *  — constructs the freshly `operator new`'d storage in the Pack4
 *  dispatch branch of GetOutput @0xe5be3. Not yet transcribed. */
function HgcYUV420BiPlanar_luma_pack4_C1(
  _self: HgcYUV420BiPlanar_luma_Base,
): void {
  // @0xe5be3 callq __ZN28HgcYUV420BiPlanar_luma_pack4C1Ev
  throw new Error(
    "HgcYUV420BiPlanar_luma_pack4::HgcYUV420BiPlanar_luma_pack4 @Helium __ZN28HgcYUV420BiPlanar_luma_pack4C1Ev @0xe5be3 not yet transcribed",
  );
}

/** Frontier: `HgcYUV420BiPlanar_luma_pack2::HgcYUV420BiPlanar_luma_pack2()`
 *  — constructs the freshly `operator new`'d storage in the Pack2
 *  dispatch branch of GetOutput @0xe5c08. Not yet transcribed. */
function HgcYUV420BiPlanar_luma_pack2_C1(
  _self: HgcYUV420BiPlanar_luma_Base,
): void {
  // @0xe5c08 callq __ZN28HgcYUV420BiPlanar_luma_pack2C1Ev
  throw new Error(
    "HgcYUV420BiPlanar_luma_pack2::HgcYUV420BiPlanar_luma_pack2 @Helium __ZN28HgcYUV420BiPlanar_luma_pack2C1Ev @0xe5c08 not yet transcribed",
  );
}

/** Frontier: `HgcYUV420BiPlanar_luma::HgcYUV420BiPlanar_luma()` —
 *  constructs the freshly `operator new`'d storage in the Plain
 *  (mode>=2) dispatch branch of GetOutput @0xe5c29. Not yet
 *  transcribed. */
function HgcYUV420BiPlanar_luma_C1(
  _self: HgcYUV420BiPlanar_luma_Base,
): void {
  // @0xe5c29 callq __ZN22HgcYUV420BiPlanar_lumaC1Ev
  throw new Error(
    "HgcYUV420BiPlanar_luma::HgcYUV420BiPlanar_luma @Helium __ZN22HgcYUV420BiPlanar_lumaC1Ev @0xe5c29 not yet transcribed",
  );
}

/** Frontier: kernel vtable slot 0x18 — release/dispose vfn. Called
 *  from every "release old kernel" arm in GetOutput
 *  (@0xe5c00 Pack4, @0xe5c21 Pack2, @0xe5c42 Plain), plus the
 *  alias-guard tails (@0xe5c89, @0xe5c99, @0xe5ca9) and the
 *  exception-cleanup tails (@0xe5cd4, @0xe5cef, @0xe5d0a). Not yet
 *  transcribed. */
function HgcYUV420BiPlanar_luma_vfn_0x18_release(
  _self: HgcYUV420BiPlanar_luma_Base,
): void {
  // @0xe5c00 / @0xe5c21 / @0xe5c42 / @0xe5c89 / @0xe5c99 / @0xe5ca9
  // callq *0x18(%rax)
  throw new Error(
    "HgcYUV420BiPlanar_luma vtable[0x18] (release) @Helium @0xe5c00/@0xe5c21/@0xe5c42 not yet transcribed",
  );
}

/** Frontier: kernel vtable slot 0x78 — BindInput(slot, upstream) vfn.
 *  Called from GetOutput @0xe5c6b with (kernel, 0, upstream) after the
 *  fresh install. Not yet transcribed. */
function HgcYUV420BiPlanar_luma_vfn_0x78_BindInput(
  _self: HgcYUV420BiPlanar_luma_Base,
  _slot: number,
  _upstream: HGNode | null,
): void {
  // @0xe5c6b callq *0x78(%rcx)
  throw new Error(
    "HgcYUV420BiPlanar_luma vtable[0x78] (BindInput) @Helium @0xe5c6b not yet transcribed",
  );
}

/** Frontier: `HGRenderer::GetInput(HGNode* self, int slot)` — the
 *  renderer's upstream lookup, called from GetOutput @0xe5c5b with
 *  (renderer, this, 0). Not yet transcribed. NOTE: this is the
 *  renderer's FREE-FUNCTION GetInput (not to be confused with
 *  HGNode::GetInput which is a virtual member — same name, different
 *  scope). */
function HGRenderer_GetInput(
  _renderer: HGRendererPtr,
  _self: HGYUV444ToPlanarLuma,
  _slot: number,
): HGNode | null {
  // @0xe5c5b callq __ZN10HGRenderer8GetInputEP6HGNodei
  throw new Error(
    "HGRenderer::GetInput(HGNode*, int) @Helium __ZN10HGRenderer8GetInputEP6HGNodei @0xe5c5b not yet transcribed",
  );
}

/**
 * `HGYUV444ToPlanarLuma` — Helium's render-graph facade node that
 * lazily selects (at GetOutput time) one of three sibling
 * HgcYUV420BiPlanar_luma* compositor kernels based on its
 * `LumaPerPixel` mode field, then wires the freshly-installed kernel's
 * input slot 0 to whatever the renderer says is upstream at slot 0
 * of `this`.
 *
 * @Helium symbols owned by this class:
 *   C2 default @0xe59e0    C1 default @0xe5a20    (mode init = 0 / Pack4)
 *   C2 arg     @0xe5a60    C1 arg     @0xe5aa0    (mode init = argument)
 *   D2         @0xe5ae0    D1         @0xe5b20    D0 @0xe5b60
 *   GetOutput  @0xe5bb0
 *
 * VTable installed at Helium 0xa0e658. Inherits HGNode's vtable slots
 * (Retain, Release, GetInput [virtual member], SetInput, ...) —
 * HGYUV444ToPlanarLuma overrides only the ctor/dtor slots plus
 * GetOutput. Only GetOutput is documented here; the D0/D1/D2 bodies
 * are provided for provenance completeness.
 */
export class HGYUV444ToPlanarLuma extends HGNode {
  /**
   * The currently-installed kernel at offset 0x198 on the C++ object.
   * Initialized to NULL by ALL four ctors:
   *   @0xe59f8 (C2 default)  movq $0x0, 0x198(%rbx)
   *   @0xe5a38 (C1 default)  movq $0x0, 0x198(%rbx)
   *   @0xe5a7b (C2 arg)      movq $0x0, 0x198(%r14)
   *   @0xe5abb (C1 arg)      movq $0x0, 0x198(%r14)
   * Populated (and re-populated on each call) inside GetOutput at
   * @0xe5c45. May be released via the "release-old before install-new"
   * dance @0xe5bef..@0xe5c42 on subsequent GetOutput calls.
   */
  kernel: HgcYUV420BiPlanar_luma_Base | null = null;

  /**
   * `LumaPerPixel` mode selector at offset 0x1a0. Default ctors
   * initialize to 0 (Pack4); the argument-taking ctors write %ebx
   * (the caller-supplied enum value) at @0xe5ac6 (C1) / @0xe5a86 (C2).
   */
  lumaMode: LumaPerPixel;

  /**
   * `HGYUV444ToPlanarLuma::HGYUV444ToPlanarLuma()` — Helium C1
   * @0xe5a20 (C2 @0xe59e0 has an identical body — Itanium ABI
   * alias for a class with no virtual bases).
   *
   *   @0xe5a29 (C1) / @0xe59e9 (C2)  callq HGNode::HGNode()   [landed]
   *   @0xe5a2e (C1) / @0xe59ee (C2)  leaq 0x928c23/c63(%rip),%rax  ; = 0xa0e658 (vtable)
   *   @0xe5a35 (C1) / @0xe59f5 (C2)  movq %rax, (%rbx)             ; this->vptr = vtable
   *   @0xe5a38 (C1) / @0xe59f8 (C2)  movq $0x0, 0x198(%rbx)        ; this->kernel = NULL
   *   @0xe5a43 (C1) / @0xe5a03 (C2)  movl $0x0, 0x1a0(%rbx)        ; this->lumaMode = 0 (Pack4)
   *
   * The `HGYUV444ToPlanarLuma(LumaPerPixel)` overload — Helium C1
   * @0xe5aa0 (C2 @0xe5a60) — is delegated to via TS constructor
   * argument-defaulting rather than a separate method (there is no
   * meaningful behavioral difference beyond the mode value; both
   * ctor pairs share the identical shape and vtable install).
   *
   *   @0xe5aac (C1-arg) / @0xe5a6c (C2-arg)  callq HGNode::HGNode()
   *   @0xe5ab1 (C1-arg) / @0xe5a71 (C2-arg)  leaq 0x928ba0/be0(%rip),%rax  ; = 0xa0e658
   *   @0xe5ab8 (C1-arg) / @0xe5a78 (C2-arg)  movq %rax, (%rbx/%r14)
   *   @0xe5abb (C1-arg) / @0xe5a7b (C2-arg)  movq $0x0, 0x198(...)         ; kernel = NULL
   *   @0xe5ac6 (C1-arg) / @0xe5a86 (C2-arg)  movl %ebx, 0x1a0(%r14)        ; lumaMode = arg
   */
  constructor(mode: LumaPerPixel = LumaPerPixel_Pack4) {
    // @0xe5aac (or @0xe5a29) — the REAL HGNode base ctor.
    super();
    // provenance note: this.vtable = 0xa0e658;  (vptr install @0xe5ab8/etc.)
    // @0xe5abb: this.kernel = NULL
    this.kernel = null;
    // @0xe5ac6 / @0xe5a43: this.lumaMode = mode (or 0 for default ctor)
    this.lumaMode = mode;
  }

  /**
   * `HGYUV444ToPlanarLuma::GetOutput(HGRenderer*)` — Helium @0xe5bb0.
   * Returns the kernel that this facade node exposes as its output.
   *
   * Full body sketch (see file header for the annotated asm listing):
   *
   *   1. Read `this->lumaMode` @0xe5bc1.
   *   2. Allocate a fresh kernel via HGObject::operator new(0x1a0) @0xe5bcd.
   *   3. Dispatch on mode:
   *        mode == 1 -> HgcYUV420BiPlanar_luma_pack2::C1  @0xe5c08
   *        mode == 0 -> HgcYUV420BiPlanar_luma_pack4::C1  @0xe5be3
   *        mode >= 2 -> HgcYUV420BiPlanar_luma::C1         @0xe5c29
   *   4. Release the OLD kernel (`this->kernel`) if it exists and is
   *      not aliased to the fresh pointer (@0xe5bef/@0xe5c14/@0xe5c35
   *      cmp-and-guard; @0xe5c00/@0xe5c21/@0xe5c42 release call).
   *   5. Install the new kernel @ this.kernel @0xe5c45.
   *   6. Query the renderer for the upstream at slot 0 @0xe5c5b:
   *        upstream = HGRenderer::GetInput(renderer, this, 0)
   *   7. Bind (kernel, 0, upstream) via kernel->vptr[0x78] @0xe5c6b.
   *   8. Return this.kernel @0xe5c6e (reloaded from +0x198).
   *
   * NB: step 4's release-old dance is performed AFTER the new kernel
   * is constructed but BEFORE the new kernel is installed at +0x198.
   * The alias-guard @0xe5bef/@0xe5c14/@0xe5c35 (`cmpq %rbx, %rdi`)
   * skips releasing the old pointer if operator-new handed back the
   * exact same address (impossible in practice since the old kernel
   * is still alive at that point — the check is defensive).
   */
  GetOutput(renderer: HGRendererPtr): HgcYUV420BiPlanar_luma_Base | null {
    // @0xe5bc1: r12d = this->lumaMode
    const mode = this.lumaMode;

    // @0xe5bc8..@0xe5bcd: allocate raw kernel storage (size 0x1a0).
    const newKernel = HGObject_operator_new(0x1a0);

    // @0xe5bd5..@0xe5bde: dispatch on `mode` — construct in-place.
    if (mode === 1) {
      // @0xe5c05..@0xe5c08 Pack2 branch
      HgcYUV420BiPlanar_luma_pack2_C1(newKernel);
    } else if (mode !== 0) {
      // @0xe5c26..@0xe5c29 Plain branch (mode >= 2)
      HgcYUV420BiPlanar_luma_C1(newKernel);
    } else {
      // @0xe5be0..@0xe5be3 Pack4 branch (mode == 0)
      HgcYUV420BiPlanar_luma_pack4_C1(newKernel);
    }

    // @0xe5be8/@0xe5c0d/@0xe5c2e: oldKernel = this->kernel (reload
    // via the mode-specific block — same value in all three).
    const oldKernel = this.kernel;

    // @0xe5bef/@0xe5c14/@0xe5c35 alias guard, then:
    // @0xe5bf8/@0xe5c19/@0xe5c3a null guard, then:
    // @0xe5c00/@0xe5c21/@0xe5c42 kernel->vptr[0x18](oldKernel) release.
    if (oldKernel !== null && oldKernel !== newKernel) {
      HgcYUV420BiPlanar_luma_vfn_0x18_release(oldKernel);
    }

    // @0xe5c45: this->kernel = newKernel
    this.kernel = newKernel;

    // @0xe5c4c: reload rbx = this->kernel (for the subsequent vfn call).
    const kernel = this.kernel;

    // @0xe5c53..@0xe5c5b: upstream = HGRenderer::GetInput(renderer, this, 0)
    const upstream = HGRenderer_GetInput(renderer, this, 0);

    // @0xe5c60..@0xe5c6b: kernel->vptr[0x78](kernel, 0, upstream)  — BindInput
    HgcYUV420BiPlanar_luma_vfn_0x78_BindInput(kernel, 0, upstream);

    // @0xe5c6e: return this->kernel (reload)
    return this.kernel;
  }

  /**
   * `HGYUV444ToPlanarLuma::~HGYUV444ToPlanarLuma()` — Helium D1
   * @0xe5b20 (D2 @0xe5ae0 has an identical body; D0 @0xe5b60 is
   * D1's body plus a trailing HGObject::operator delete(this)).
   *
   *   @0xe5b26 (D1)  leaq 0x928b2b(%rip), %rax   ; = 0xa0e658 vtable
   *   @0xe5b2d (D1)  movq %rax, (%rdi)           ; reset vptr (defensive)
   *   @0xe5b30 (D1)  movq 0x198(%rdi), %rax      ; rax = this->kernel
   *   @0xe5b37 (D1)  testq %rax, %rax            ; if NULL,
   *   @0xe5b3a (D1)  je   0xe5b4b                ;   skip release
   *   @0xe5b3c (D1)  movq (%rax), %rcx           ; else rcx = kernel->vptr
   *   @0xe5b45 (D1)  callq *0x18(%rcx)           ; kernel->vptr[0x18](kernel)
   *   @0xe5b51 (D1)  jmp __ZN6HGNodeD2Ev          ; tail-chain HGNode::~HGNode() [landed]
   *
   * D0 @0xe5b60 has the same body but ends in
   *   @0xe5b96 jmp __ZN8HGObjectdlEPv    ; tail-jmp HGObject::operator delete(this)
   * instead of the plain retq — the Itanium deleting-dtor idiom.
   *
   * We model D1 in TS (called on scope-exit / explicit disposal). D0's
   * trailing delete is subsumed by GC. D2's separate emission is
   * identical to D1 for the same reason — provenance-only distinction.
   */
  destroy_D1(): void {
    // @0xe5b30 rax = this->kernel
    const kernel = this.kernel;
    // @0xe5b37..@0xe5b3a null guard.
    if (kernel !== null) {
      // @0xe5b45 kernel->vptr[0x18](kernel)  — release
      HgcYUV420BiPlanar_luma_vfn_0x18_release(kernel);
    }
    // @0xe5b51 tail-chain HGNode::~HGNode() — the imported base's
    // destructor runs implicitly under TS class semantics; cited here
    // for provenance.
    (this as HGNode).destruct?.();
  }

  /**
   * `HGYUV444ToPlanarLuma::~HGYUV444ToPlanarLuma()` — Helium D0
   * @0xe5b60 (deleting dtor). Body identical to D1 plus a trailing
   * `HGObject::operator delete(this)` @0xe5b96 (tail-jmp). GC in TS
   * subsumes the trailing delete; we cite the address for provenance.
   */
  destroy_D0(): void {
    // Body of D1:
    this.destroy_D1();
    // @0xe5b96 tail-jmp HGObject::operator delete(this) — GC-subsumed.
    // (Not modeled beyond the provenance cite.)
  }
}
