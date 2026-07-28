// raw-port/src/render/HGChannelCopy.ts
//
// FCP `HGChannelCopy` — Helium render-graph node (thin HGNode subclass)
// that owns a heap-allocated `HgcChannelCopy` compositor compute kernel
// at offset 0x198 on `this`. The kernel implements the per-tile
// channel-copy operation (selective RGBA channel plumbing between two
// inputs); this class is the render-graph facade that binds the two
// input slots into the kernel and forwards the R/G/B/A boolean mask
// down via SetParameter.
//
// Provenance: /Applications/Final Cut Pro.app/Contents/Frameworks/
//             Helium.framework/Versions/A/Helium (x86_64 slice; file
//             offset 0x4000; VAs below are unadjusted VM addresses from
//             `otool -tV`).
//
// Disassembly saved at:
//   raw-port/re/disasm/Helium.HGChannelCopy.HGChannelCopy.s   @0x17a4d0 (C1)
//   raw-port/re/disasm/Helium.HGChannelCopy.~HGChannelCopy.s  @0x17a5d0 (D0)
//   raw-port/re/disasm/Helium.HGChannelCopy.GetOutput.s       @0x17a610
//   raw-port/re/disasm/Helium.HGChannelCopy.SetCopyChannel.s  @0x17a670
//   (D2 @0x17a550, D1 @0x17a590 dumped inline; C2 aliases C1 at 0x17a4d0.)
//
// Ledger addresses (Helium.ledger.json):
//   0x17a450  HGChannelCopy::HGChannelCopy()   [C2 base ctor]
//   0x17a4d0  HGChannelCopy::HGChannelCopy()   [C1 complete ctor — the body we transcribe]
//   0x17a550  HGChannelCopy::~HGChannelCopy()  [D2 base dtor]
//   0x17a590  HGChannelCopy::~HGChannelCopy()  [D1 complete dtor]
//   0x17a5d0  HGChannelCopy::~HGChannelCopy()  [D0 deleting dtor]
//   0x17a610  HGChannelCopy::GetOutput(HGRenderer*)
//   0x17a670  HGChannelCopy::SetCopyChannel(bool, bool, bool, bool)
//
// VTABLE INSTALLED IN THIS CLASS:
//   All four vptr writes (C1 @0x17a4e2, D2 @0x17a559, D1 @0x17a599,
//   D0 @0x17a5d9) resolve to the same vtable address:
//       leaq 0x8a85bf(%rip),%rax  @0x17a4e2 → 0x17a4e9 + 0x8a85bf = 0xa22aa8
//       leaq 0x8a8548(%rip),%rax  @0x17a559 → 0x17a560 + 0x8a8548 = 0xa22aa8
//       leaq 0x8a8508(%rip),%rax  @0x17a599 → 0x17a5a0 + 0x8a8508 = 0xa22aa8
//       leaq 0x8a84c8(%rip),%rax  @0x17a5d9 → 0x17a5e0 + 0x8a84c8 = 0xa22aa8
//   → vtable-for-HGChannelCopy is at Helium file offset 0xa22aa8.
//
// STRUCT LAYOUT (recovered from C1/D0/GetOutput/SetCopyChannel asm):
//   HGChannelCopy {
//     +0x000  vptr                     (set = 0xa22aa8 by all ctor/dtor writes)
//     +0x008..+0x197                    (HGNode base subobject — landed
//                                        in HGNode.ts; size 0x198)
//     +0x198  HgcChannelCopy* kernel    (heap-owned compute kernel; alloc via
//                                        HGObject::operator new(0x1a0) at
//                                        @0x17a4ec, constructed via
//                                        HgcChannelCopy::HgcChannelCopy()
//                                        at @0x17a4fc, released via kernel
//                                        vfn *0x18 in D2/D1/D0)
//   }
//   sizeof(HGChannelCopy) = 0x1a0 (0x198 base + 0x8 kernel ptr).
//
// The kernel size (also 0x1a0 bytes, from `movl $0x1a0, %edi` @0x17a4ec
// preceding the operator new call) happens to equal the full
// HGChannelCopy size — coincidence of two independent classes each being
// 416 bytes; not a shared allocation.
//
// ─── C1 @Helium 0x17a4d0 (complete-object ctor) ─────────────────────────────
//   __ZN13HGChannelCopyC1Ev:
//     0x17a4d0  pushq %rbp / movq %rsp,%rbp / pushq r15/r14/rbx/rax
//     0x17a4da  movq  %rdi, %rbx              ; rbx = this
//     0x17a4dd  callq __ZN6HGNodeC2Ev          ; HGNode::HGNode()  [landed]
//     0x17a4e2  leaq  0x8a85bf(%rip), %rax    ; rax = 0xa22aa8 (vtable)
//     0x17a4e9  movq  %rax, (%rbx)            ; this->vptr = vtable
//     0x17a4ec  movl  $0x1a0, %edi            ; sizeof(HgcChannelCopy) = 416
//     0x17a4f1  callq __ZN8HGObjectnwEm        ; HGObject::operator new(0x1a0)
//     0x17a4f6  movq  %rax, %r14              ; r14 = new kernel storage
//     0x17a4f9  movq  %rax, %rdi
//     0x17a4fc  callq __ZN14HgcChannelCopyC1Ev ; HgcChannelCopy::HgcChannelCopy()
//     0x17a501  movq  %r14, 0x198(%rbx)       ; this->kernel = r14
//     0x17a508..0x17a512  epilogue / retq
//
//   Exception-cleanup tail (@0x17a513..0x17a540) drops the half-
//   constructed kernel via HGObject::operator delete, chains into
//   HGNode::~HGNode, and __Unwind_Resume. In TS this collapses into
//   normal throw propagation; provenance-only.
//
//   IMPORTANT — NOT the "swap-and-release" idiom of HGColorBias:
//   the C1 here writes the kernel directly into +0x198 (@0x17a501) with
//   NO prior null-write and NO cmp/release dance. This class's ctor is
//   the simpler "single install" form.
//
// ─── C2 @Helium 0x17a450 (base-object ctor) ─────────────────────────────────
//   Body @0x17a450 was not extracted (otool -tV emitted no label at that
//   VA in the current dump — see disasm.sh guard). Per Itanium ABI for a
//   class with no virtual bases, C2 and C1 do identical work; the
//   ledger's separate address exists because the compiler emits both
//   symbols. We port the body once (via the C1 disasm at 0x17a4d0) and
//   name the exported constructor after the class; both C1 (@0x17a4d0)
//   and C2 (@0x17a450) map to the same TS constructor call site.
//
// ─── D2 @Helium 0x17a550 (base-object dtor) ─────────────────────────────────
//   __ZN13HGChannelCopyD2Ev:
//     0x17a559  leaq  0x8a8548(%rip), %rax   ; rax = 0xa22aa8 (vtable)
//     0x17a560  movq  %rax, (%rdi)           ; reset vptr (defensive)
//     0x17a563  movq  0x198(%rdi), %rdi      ; rdi = this->kernel
//     0x17a56a  movq  (%rdi), %rax           ; rax = kernel->vptr
//     0x17a56d  callq *0x18(%rax)            ; kernel->vptr[3] — release
//     0x17a570..0x17a578  epilogue
//     0x17a579  jmp   __ZN6HGNodeD2Ev         ; tail-chain HGNode::~HGNode [landed]
//
//   D2 does NOT null-check the kernel before dereferencing (@0x17a563 →
//   @0x17a56a). Any HGChannelCopy that has survived C1 has a non-null
//   kernel by construction (C1's @0x17a501 unconditional install), so
//   the raw deref is safe in-binary. We mirror that assumption but keep
//   a defensive TS-side null-guard for debuggability — noted in the
//   port comment (does not change observable behavior for correctly
//   constructed instances).
//
// ─── D1 @Helium 0x17a590 (complete-object dtor) ─────────────────────────────
//   __ZN13HGChannelCopyD1Ev: identical body to D2 above (independent
//   emission — offsets 0x17a599 vs 0x17a559 differ only in PC-relative
//   distance to the same vtable @0xa22aa8).
//
// ─── D0 @Helium 0x17a5d0 (deleting dtor) ────────────────────────────────────
//   __ZN13HGChannelCopyD0Ev:
//     0x17a5d9  leaq  0x8a84c8(%rip), %rax   ; rax = 0xa22aa8 (vtable)
//     0x17a5e0  movq  %rax, (%rdi)           ; reset vptr
//     0x17a5e3  movq  0x198(%rdi), %rdi      ; rdi = this->kernel
//     0x17a5ea  movq  (%rdi), %rax
//     0x17a5ed  callq *0x18(%rax)            ; kernel->release
//     0x17a5f0  movq  %rbx, %rdi
//     0x17a5f3  callq __ZN6HGNodeD2Ev         ; HGNode::~HGNode() [landed]
//     0x17a5f8  movq  %rbx, %rdi
//     0x17a601  jmp   __ZN8HGObjectdlEPv     ; HGObject::operator delete(this)
//
//   D0 is D1's body plus a trailing operator-delete on `this` — the
//   Itanium ABI deleting-dtor pattern (same as HGColorBias::D0). In TS
//   the GC subsumes the trailing delete; we still cite it for provenance.
//
// ─── GetOutput @Helium 0x17a610 ─────────────────────────────────────────────
//   Signature: (this, HGRenderer* r) -> HgcChannelCopy*
//     %rdi = this, %rsi = renderer
//
//   __ZN13HGChannelCopy9GetOutputEP10HGRenderer:
//     0x17a614  pushq %r14 / %rbx
//     0x17a617  movq  %rdi, %rbx              ; rbx = this
//     0x17a61a  movq  (%rdi), %rax            ; rax = this->vptr (HGChannelCopy vtbl)
//     0x17a61d  movq  0x198(%rdi), %r14      ; r14 = this->kernel
//     0x17a624  xorl  %esi, %esi              ; arg2 = 0
//     0x17a626  callq *0x80(%rax)             ; this->vptr[16](this, 0)
//                                              ; = HGNode::GetInput(0)   [inherited, landed]
//     0x17a62c  movq  (%r14), %rcx            ; rcx = kernel->vptr
//     0x17a62f  movq  %r14, %rdi              ; arg1 = kernel
//     0x17a632  xorl  %esi, %esi              ; arg2 = 0
//     0x17a634  movq  %rax, %rdx              ; arg3 = upstream HGNode* from GetInput(0)
//     0x17a637  callq *0x78(%rcx)             ; kernel->vptr[15](kernel, 0, upstream0)
//
//     0x17a63a  movq  (%rbx), %rax            ; rax = this->vptr (reload after possible clobber)
//     0x17a63d  movq  0x198(%rbx), %r14      ; r14 = this->kernel (reload)
//     0x17a644  movq  %rbx, %rdi              ; arg1 = this
//     0x17a647  movl  $0x1, %esi              ; arg2 = 1
//     0x17a64c  callq *0x80(%rax)             ; HGNode::GetInput(1)
//     0x17a652  movq  (%r14), %rcx            ; rcx = kernel->vptr
//     0x17a655  movq  %r14, %rdi              ; arg1 = kernel
//     0x17a658  movl  $0x1, %esi              ; arg2 = 1
//     0x17a65d  movq  %rax, %rdx              ; arg3 = upstream HGNode* from GetInput(1)
//     0x17a660  callq *0x78(%rcx)             ; kernel->vptr[15](kernel, 1, upstream1)
//
//     0x17a663  movq  0x198(%rbx), %rax      ; return this->kernel
//     0x17a66a..0x17a66e  epilogue / retq
//
//   Semantics: bind BOTH of this node's input slots (0 and 1) into the
//   kernel by:
//     1. Ask self (via vtable slot 0x80 → HGNode::GetInput) for the
//        upstream HGNode wired to input slot i.
//     2. Forward (i, upstream) to the kernel's vfn @ vtable slot 0x78
//        (the kernel's "bind input i to upstream" side-effect vfn —
//        same slot HGColorBias uses for its single input in GetOutput
//        @0x1a0d69).
//   Then return the kernel pointer as this node's output.
//
//   Contrast with HGColorBias::GetOutput (single input via
//   HGRenderer::GetInput free function): HGChannelCopy binds two inputs
//   via its OWN vtable slot 0x80 (i.e. via `this->GetInput(i)`). This
//   is the correct FCP-emitted plumbing for a two-input channel-copy
//   filter — one input feeds the R/G/B/A source, the other feeds the
//   destination the mask selects into.
//
//   The renderer arg (%rsi) is NOT used by this GetOutput — it is
//   loaded into the register but discarded before the vfn calls, which
//   pass (this, 0) then (this, 1) to `this->GetInput`. HGNode::GetInput
//   ignores the renderer entirely (it's a pure array/index lookup on
//   this->inputSlots — see HGNode.ts @0x11c8b0). So the renderer arg is
//   a signature-conformance placeholder here.
//
// ─── SetCopyChannel @Helium 0x17a670 ───────────────────────────────────────
//   Signature: (this, bool r, bool g, bool b, bool a)
//   FCP passes bools in %esi (r), %edx (g), %ecx (b), %r8b→%r8d (a).
//
//   __ZN13HGChannelCopy14SetCopyChannelEbbbb:
//     0x17a670  pushq %rbp / movq %rsp,%rbp
//     0x17a674  cvtsi2ss %esi, %xmm0          ; xmm0 = (float)r  (0.0f or 1.0f)
//     0x17a678  cvtsi2ss %edx, %xmm1          ; xmm1 = (float)g
//     0x17a67c  cvtsi2ss %ecx, %xmm2          ; xmm2 = (float)b
//     0x17a680  movq  0x198(%rdi), %rdi      ; rdi = this->kernel
//     0x17a687  cvtsi2ss %r8d, %xmm3          ; xmm3 = (float)a
//     0x17a68c  movq  (%rdi), %rax            ; rax = kernel->vptr
//     0x17a68f  movq  0x60(%rax), %rax        ; rax = kernel->vptr[12] = SetParameter
//     0x17a693  xorl  %esi, %esi              ; arg2 = 0 (param idx = 0)
//     0x17a695  popq %rbp
//     0x17a696  jmpq  *%rax                   ; tail-call kernel->SetParameter(0,
//                                              ;   (float)r,(float)g,(float)b,(float)a)
//
//   Semantics: forward the four channel booleans as floats (0.0/1.0)
//   into kernel parameter #0 as a 4-vec. The kernel's SetParameter
//   signature is `(int idx, float a, float b, float c, float d)` — this
//   is the exact same vtable slot 0x60 that HGColorBias tail-calls in
//   its SetParameter @0x1a0d33. The `cvtsi2ss` at each of the four
//   writes is the single-precision integer→float conversion, so we
//   MUST wrap the JS results in `Math.fround` per Rule 4 of PORTING_SPEC.
//
// FRONTIER CALLEES (undecoded — throwing stubs cite them):
//   __ZN14HgcChannelCopyC1Ev   HgcChannelCopy::HgcChannelCopy() @0x17a4fc
//   HgcChannelCopy vfn @0x18   (release) — @0x17a56d/@0x17a5ad/@0x17a5ed
//   HgcChannelCopy vfn @0x60   (SetParameter) — @0x17a696 (tail-jmp)
//   HgcChannelCopy vfn @0x78   ("BindInput"-shape) — @0x17a637/@0x17a660
//   __ZN8HGObjectnwEm          HGObject::operator new(unsigned long) @0x17a4f1
//   __ZN8HGObjectdlEPv         HGObject::operator delete(void*)      @0x17a519/@0x17a601
//   __Unwind_Resume                                                   @0x17a529/@0x17a53c
//
// Landed callees (imported as real classes, not re-stubbed):
//   HGNode::HGNode()          @0x11baf0 → import { HGNode }        (base ctor)
//   HGNode::~HGNode()         @0x11bf20 → import { HGNode }        (base dtor)
//   HGNode::GetInput(int)     @0x11c8b0 → this.GetInput(i)         (inherited vfn @0x80)
//   HGObject::Release()       @0x1a0f30 → (chained via kernel vfn 0x18)

/* eslint-disable @typescript-eslint/no-unused-vars */

import { HGNode } from "./HGNode";

/**
 * Opaque handle for Helium's `HGRenderer*` — the render-graph context
 * threaded through GetOutput. HGChannelCopy::GetOutput accepts it in
 * signature-position (%rsi) but never dereferences it (see doc-comment
 * on GetOutput above).
 */
export type HGRendererPtr = { readonly __brand: "HGRenderer" };

/**
 * `HgcChannelCopy` — Helium compositor compute kernel for the channel-
 * copy per-tile operation. Owned by HGChannelCopy at offset 0x198.
 *
 * Symbols in the Helium binary (not yet transcribed):
 *   __ZN14HgcChannelCopyC1Ev   HgcChannelCopy::HgcChannelCopy()
 *   __ZN14HgcChannelCopyD0/D1/D2Ev  destructors
 *   __ZN14HgcChannelCopy4BindEP9HGHandler          Bind(HGHandler*)
 *   __ZN14HgcChannelCopy11BindTextureEP9HGHandleri BindTexture(HGHandler*, int)
 *   __ZN14HgcChannelCopy6GetDODEP10HGRendereri6HGRect  GetDOD(...)
 *   __ZN14HgcChannelCopy6GetROIEP10HGRendereri6HGRect  GetROI(...)
 *   __ZN14HgcChannelCopy9GetOutputEP10HGRenderer      GetOutput(...)
 *   __ZN14HgcChannelCopy10GetProgramEP10HGRenderer    GetProgram(...)
 *   __ZN14HgcChannelCopy10RenderTileEP6HGTile         RenderTile(...)
 *   __ZN14HgcChannelCopy14RenderTile_AVXEP6HGTile     RenderTile_AVX(...)
 *   __ZN14HgcChannelCopy12SetParameterEiffff          SetParameter(...)
 *   __ZN14HgcChannelCopy12GetParameterEiPf            GetParameter(...)
 *   __ZNK14HgcChannelCopy17shaderDescriptionEv        shaderDescription() const
 *   __ZNK14HgcChannelCopy21InitProgramDescriptorEP19HGProgramDescriptor
 *
 * Vtable slots touched by HGChannelCopy:
 *   +0x18  release/dispose  — @0x17a56d @0x17a5ad @0x17a5ed
 *   +0x60  SetParameter(idx, r, g, b, a)  — @0x17a696 (tail-jmp)
 *   +0x78  BindInput(slot, upstream)      — @0x17a637 @0x17a660
 *
 * Sized 0x1a0 bytes (416) — from `movl $0x1a0, %edi` @0x17a4ec.
 */
export interface HgcChannelCopy {
  readonly __brand: "HgcChannelCopy";
}

/**
 * Frontier: `HGObject::operator new(unsigned long)` — allocates the
 * kernel in HGChannelCopy's ctor @0x17a4f1 with size 0x1a0. Not yet
 * transcribed at @0x17a4f1 (throws to surface the demand signal).
 */
function HGObject_operator_new(_size: number): HgcChannelCopy {
  // @0x17a4f1 callq __ZN8HGObjectnwEm  (with %edi = 0x1a0)
  throw new Error(
    "HGObject::operator new @Helium __ZN8HGObjectnwEm @0x17a4f1 not yet transcribed",
  );
}

/**
 * Frontier: `HGObject::operator delete(void*)` — reached at @0x17a601
 * (D0 tail-jmp) and @0x17a519 (C1 exception-cleanup path). Not yet
 * transcribed; in C++ frees the payload, in TS the GC subsumes it.
 */
function HGObject_operator_delete(_p: HGChannelCopy | HgcChannelCopy): void {
  // @0x17a601 jmp __ZN8HGObjectdlEPv       (D0)
  // @0x17a519 callq __ZN8HGObjectdlEPv     (C1 exception unwind, not modeled)
  throw new Error(
    "HGObject::operator delete @Helium __ZN8HGObjectdlEPv @0x17a601 not yet transcribed",
  );
}

/**
 * Frontier: `HgcChannelCopy::HgcChannelCopy()` — constructs the freshly
 * `operator new`'d kernel storage in HGChannelCopy's ctor @0x17a4fc.
 * Not yet transcribed (kernel internals are their own class port).
 */
function HgcChannelCopy_C1(_self: HgcChannelCopy): void {
  // @0x17a4fc callq __ZN14HgcChannelCopyC1Ev
  throw new Error(
    "HgcChannelCopy::HgcChannelCopy @Helium __ZN14HgcChannelCopyC1Ev @0x17a4fc not yet transcribed",
  );
}

/**
 * Frontier: HgcChannelCopy vtable slot 0x18 — the kernel's release /
 * dispose vfn. Called from D2 @0x17a56d, D1 @0x17a5ad, and D0 @0x17a5ed.
 * Not yet transcribed.
 */
function HgcChannelCopy_vfn_0x18_release(_self: HgcChannelCopy): void {
  // @0x17a56d callq *0x18(%rax)   (D2)
  // @0x17a5ad callq *0x18(%rax)   (D1, mirror of D2)
  // @0x17a5ed callq *0x18(%rax)   (D0)
  throw new Error(
    "HgcChannelCopy vtable[0x18] (release) @Helium @0x17a56d/@0x17a5ad/@0x17a5ed not yet transcribed",
  );
}

/**
 * Frontier: HgcChannelCopy vtable slot 0x60 — the kernel's
 * `SetParameter(int idx, float a, float b, float c, float d)` vfn.
 * Tail-jumped-to from HGChannelCopy::SetCopyChannel @0x17a696 with the
 * exact argument packing preserved (idx in %esi, a..d in xmm0..xmm3).
 * Not yet transcribed.
 */
function HgcChannelCopy_vfn_0x60_SetParameter(
  _self: HgcChannelCopy,
  _idx: number,
  _a: number,
  _b: number,
  _c: number,
  _d: number,
): void {
  // @0x17a696 jmpq *%rax  (where %rax = kernel->vptr[12])
  throw new Error(
    "HgcChannelCopy vtable[0x60] (SetParameter) @Helium @0x17a696 not yet transcribed",
  );
}

/**
 * Frontier: HgcChannelCopy vtable slot 0x78 — call shape
 * `(kernel, slotIdx, upstreamHGNode)`, consistent with a
 * "BindInput(slot, node)" side-effect vfn. Called from
 * HGChannelCopy::GetOutput at @0x17a637 (slot 0) and @0x17a660 (slot 1).
 * Not yet transcribed.
 */
function HgcChannelCopy_vfn_0x78_BindInput(
  _self: HgcChannelCopy,
  _slot: number,
  _upstream: HGNode | null,
): void {
  // @0x17a637 callq *0x78(%rcx)   (slot 0)
  // @0x17a660 callq *0x78(%rcx)   (slot 1)
  throw new Error(
    "HgcChannelCopy vtable[0x78] (BindInput-shape) @Helium @0x17a637/@0x17a660 not yet transcribed",
  );
}

/**
 * `HGChannelCopy` — Helium's render-graph node for the selective-channel-
 * copy operation (a two-input filter that copies user-selected RGBA
 * channels from input 0 to input 1 under an R/G/B/A boolean mask).
 *
 * @Helium symbols owned by this class:
 *   C2                @0x17a450  (aliased to C1 body — not extracted separately)
 *   C1                @0x17a4d0
 *   D2                @0x17a550
 *   D1                @0x17a590
 *   D0                @0x17a5d0
 *   GetOutput         @0x17a610
 *   SetCopyChannel    @0x17a670  (tail-forwards to kernel->vptr[12])
 *
 * VTable installed at 0xa22aa8. Inherits HGNode's vtable slots (Retain,
 * Release, GetInput, SetInput, ...) — HGChannelCopy overrides only the
 * ctor/dtor slots plus GetOutput; SetCopyChannel is a non-virtual member.
 */
export class HGChannelCopy extends HGNode {
  /**
   * The owned HgcChannelCopy compute kernel at offset 0x198. Allocated
   * and constructed unconditionally in C1 (@0x17a4f1 alloc, @0x17a4fc
   * ctor, @0x17a501 install into +0x198). Released via its own vtable
   * slot 0x18 by D2/D1/D0 (@0x17a56d, @0x17a5ad, @0x17a5ed).
   *
   * Guaranteed non-null post-construction (C1 has no null-write path
   * before the install — see @0x17a501 unconditional store; contrast
   * with HGColorBias @0x1a0c4c which zeroes the slot first and then
   * runs the swap-and-release dance).
   */
  kernel: HgcChannelCopy | null = null;

  /**
   * `HGChannelCopy::HGChannelCopy()` — Helium C1 @0x17a4d0 (C2 @0x17a450
   * shares this body — Itanium ABI alias for a class with no virtual
   * bases; not separately extracted from the disasm dump).
   *
   *   @0x17a4dd  callq __ZN6HGNodeC2Ev              ; HGNode::HGNode()  [landed]
   *   @0x17a4e2  leaq  0x8a85bf(%rip), %rax         ; = 0xa22aa8 (vtable)
   *   @0x17a4e9  movq  %rax, (%rbx)                 ; this->vptr = vtable
   *   @0x17a4ec  movl  $0x1a0, %edi                 ; sizeof(HgcChannelCopy) = 416
   *   @0x17a4f1  callq __ZN8HGObjectnwEm             ; HGObject::operator new
   *   @0x17a4fc  callq __ZN14HgcChannelCopyC1Ev     ; kernel ctor
   *   @0x17a501  movq  %r14, 0x198(%rbx)            ; this->kernel = new kernel
   *
   * The install is unconditional — no swap-and-release; the freshly
   * allocated kernel goes straight into `this.kernel`.
   */
  constructor() {
    // @0x17a4dd — HGNode::HGNode() — the REAL base ctor (imported HGNode
    // class initializes all HGNode-specific fields per HGNode.ts).
    super();
    // (@0x17a4e9 vptr write — modeled by HGNode.ts's vtable field;
    //  overwriting here to the HGChannelCopy vtable address is documented
    //  for provenance but not modeled distinctly since TS doesn't need
    //  the runtime vptr for dispatch.)
    // provenance note: this.vtable = 0xa22aa8;

    // @0x17a4ec + @0x17a4f1: allocate 0x1a0 bytes for the kernel.
    const newKernel = HGObject_operator_new(0x1a0);
    // @0x17a4fc: construct in-place.
    HgcChannelCopy_C1(newKernel);
    // @0x17a501: unconditional install into this.kernel.
    this.kernel = newKernel;
  }

  /**
   * `HGChannelCopy::GetOutput(HGRenderer*)` — Helium @0x17a610.
   *
   *   @0x17a61a  movq (%rdi), %rax           ; rax = this->vptr
   *   @0x17a61d  movq 0x198(%rdi), %r14      ; r14 = this->kernel
   *   @0x17a624  xorl %esi, %esi             ; slot = 0
   *   @0x17a626  callq *0x80(%rax)           ; HGNode::GetInput(0)  [inherited vfn]
   *   @0x17a62c  movq (%r14), %rcx           ; rcx = kernel->vptr
   *   @0x17a637  callq *0x78(%rcx)           ; kernel->BindInput(0, upstream0)
   *
   *   @0x17a63a  movq (%rbx), %rax           ; rax = this->vptr (reload)
   *   @0x17a63d  movq 0x198(%rbx), %r14      ; r14 = this->kernel (reload)
   *   @0x17a647  movl $0x1, %esi             ; slot = 1
   *   @0x17a64c  callq *0x80(%rax)           ; HGNode::GetInput(1)
   *   @0x17a660  callq *0x78(%rcx)           ; kernel->BindInput(1, upstream1)
   *
   *   @0x17a663  movq 0x198(%rbx), %rax      ; return this->kernel
   *
   * Two-input variant of HGColorBias::GetOutput. The renderer argument
   * (`r`) is loaded into %rsi in the prologue but never referenced —
   * `this->GetInput(i)` is a pure array/index lookup on this.inputSlots
   * (see HGNode::GetInput @0x11c8b0). We accept it in the signature for
   * ABI conformance but do not thread it.
   */
  GetOutput(r: HGRendererPtr): HgcChannelCopy | null {
    // @0x17a61d: r14 = this->kernel
    const kernel = this.kernel;
    // @0x17a624..@0x17a626: this->GetInput(0) via inherited HGNode vfn.
    // (Because HGChannelCopy doesn't override vtable slot 0x80, this
    //  dispatches to HGNode::GetInput @0x11c8b0.)
    const upstream0 = this.GetInput(0);
    // @0x17a637: kernel->BindInput(0, upstream0)  [frontier stub]
    HgcChannelCopy_vfn_0x78_BindInput(
      kernel as HgcChannelCopy,
      0,
      upstream0,
    );

    // @0x17a64c: this->GetInput(1) via inherited vfn
    const upstream1 = this.GetInput(1);
    // @0x17a660: kernel->BindInput(1, upstream1)  [frontier stub]
    HgcChannelCopy_vfn_0x78_BindInput(
      kernel as HgcChannelCopy,
      1,
      upstream1,
    );

    // @0x17a663: return this->kernel
    return this.kernel;
  }

  /**
   * `HGChannelCopy::SetCopyChannel(bool r, bool g, bool b, bool a)` —
   * Helium @0x17a670.
   *
   *   @0x17a674  cvtsi2ss %esi, %xmm0        ; xmm0 = (float)r
   *   @0x17a678  cvtsi2ss %edx, %xmm1        ; xmm1 = (float)g
   *   @0x17a67c  cvtsi2ss %ecx, %xmm2        ; xmm2 = (float)b
   *   @0x17a680  movq 0x198(%rdi), %rdi      ; rdi = this->kernel
   *   @0x17a687  cvtsi2ss %r8d, %xmm3        ; xmm3 = (float)a
   *   @0x17a68c  movq (%rdi), %rax           ; rax = kernel->vptr
   *   @0x17a68f  movq 0x60(%rax), %rax       ; rax = vptr[12] = SetParameter
   *   @0x17a693  xorl %esi, %esi             ; idx = 0
   *   @0x17a696  jmpq *%rax                  ; tail-call kernel->SetParameter(0, r,g,b,a)
   *
   * The `cvtsi2ss` at @0x17a674/@0x17a678/@0x17a67c/@0x17a687 converts
   * each i32 boolean (0 or 1) to a single-precision float (0.0f or
   * 1.0f). Per Rule 4 of PORTING_SPEC we wrap each conversion in
   * Math.fround to preserve the bit-exact single-precision semantics.
   *
   * NOTE: the FCP ABI passes bools in the low bit of the corresponding
   * i32/i64 register; TS receives them as JS booleans and we convert
   * via `b ? 1 : 0` before the `Math.fround`. The result is identical
   * to `cvtsi2ss` on the sign-extended 32-bit integer 0 or 1.
   */
  SetCopyChannel(r: boolean, g: boolean, b: boolean, a: boolean): void {
    // @0x17a674: cvtsi2ss esi -> xmm0
    const rf = Math.fround(r ? 1 : 0);
    // @0x17a678: cvtsi2ss edx -> xmm1
    const gf = Math.fround(g ? 1 : 0);
    // @0x17a67c: cvtsi2ss ecx -> xmm2
    const bf = Math.fround(b ? 1 : 0);
    // @0x17a687: cvtsi2ss r8d -> xmm3
    const af = Math.fround(a ? 1 : 0);
    // @0x17a680: rdi = this->kernel
    const kernel = this.kernel;
    // @0x17a696: tail-jmp kernel->SetParameter(0, rf, gf, bf, af)
    HgcChannelCopy_vfn_0x60_SetParameter(
      kernel as HgcChannelCopy,
      0,
      rf,
      gf,
      bf,
      af,
    );
  }

  /**
   * `HGChannelCopy::~HGChannelCopy()` — Helium D1 @0x17a590 (D2 @0x17a550
   * has an identical body; both mirror the same "release kernel then
   * chain HGNode::~HGNode" pattern).
   *
   *   @0x17a599  leaq 0x8a8508(%rip), %rax   ; = 0xa22aa8 vtable
   *   @0x17a5a0  movq %rax, (%rdi)           ; reset vptr (defensive)
   *   @0x17a5a3  movq 0x198(%rdi), %rdi      ; rdi = this->kernel
   *   @0x17a5ad  callq *0x18(kernel->vptr)   ; kernel->release
   *   @0x17a5b9  jmp __ZN6HGNodeD2Ev          ; HGNode::~HGNode() [landed]
   *
   * NOTE: no null-check on this->kernel before dereferencing (@0x17a5a3
   * → @0x17a5aa `movq (%rdi), %rax`). We preserve the deref semantics
   * but add a defensive TS null-guard for cases where the ctor throws
   * mid-way (the C++ never sees this because operator-new failure
   * unwinds through the exception-cleanup path @0x17a513..).
   */
  destroy_D1(): void {
    // @0x17a5a0 (vptr reset — no-op in TS)
    const kernel = this.kernel;
    if (kernel !== null) {
      // @0x17a5ad callq *0x18(kernel->vptr)
      HgcChannelCopy_vfn_0x18_release(kernel);
    }
    // @0x17a5b9 jmp HGNode::~HGNode() — the imported base's destructor
    // logic runs automatically via TS's normal class semantics; we
    // explicitly cite the address for provenance.
    // (HGNode.destruct() from HGNode.ts models this.)
    (this as HGNode).destruct?.();
  }

  /**
   * `HGChannelCopy::~HGChannelCopy()` — Helium D0 @0x17a5d0 (deleting
   * dtor). Body identical to D1 above plus a trailing
   * `HGObject::operator delete(this)` @0x17a601.
   *
   *   @0x17a5d9  leaq 0x8a84c8(%rip), %rax   ; = 0xa22aa8 vtable
   *   @0x17a5e0  movq %rax, (%rdi)           ; reset vptr
   *   @0x17a5e3  movq 0x198(%rdi), %rdi
   *   @0x17a5ed  callq *0x18(kernel->vptr)   ; release kernel
   *   @0x17a5f3  callq __ZN6HGNodeD2Ev        ; HGNode::~HGNode()
   *   @0x17a601  jmp   __ZN8HGObjectdlEPv    ; ::operator delete(this)
   */
  destroy_D0(): void {
    // @0x17a5e0 (vptr reset — no-op)
    const kernel = this.kernel;
    if (kernel !== null) {
      // @0x17a5ed callq *0x18(kernel->vptr)
      HgcChannelCopy_vfn_0x18_release(kernel);
    }
    // @0x17a5f3 callq HGNode::~HGNode()
    (this as HGNode).destruct?.();
    // @0x17a601 jmp HGObject::operator delete(this)  [frontier stub]
    HGObject_operator_delete(this);
  }
}

