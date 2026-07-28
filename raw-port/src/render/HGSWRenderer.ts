// HGSWRenderer.ts — Helium's software (SW) renderer subclass of HGRenderer.
// Faithful transcription from the x86_64 disassembly of
//   /Applications/Final Cut Pro.app/Contents/Frameworks/Helium.framework/
//     Versions/A/Helium
//
// Source disassembly (otool -tV):
//   __ZN12HGSWRendererC2Ev  @0x002021b0  base ctor
//   __ZN12HGSWRendererC1Ev  @0x002021d0  complete ctor
//   __ZN12HGSWRendererD2Ev  @0x002021f0  base dtor
//   __ZN12HGSWRendererD1Ev  @0x00202200  complete dtor
//   __ZN12HGSWRendererD0Ev  @0x00202210  deleting dtor
//
// vtable @0xa2e650 (installed vptr @0xa2e660) — 30+ slot dispatch table
// inherited from HGRenderer.  Slots 0x00 / 0x08 point back at ::~HGSWRenderer
// (D2 / D0); all remaining slots (Retain, Release, Render*, GetBitmap,
// GetTexture, GetShaderCompileTime, Set/GetParameter, BindBuffer, BindTexture,
// RenderNode, RenderTiles, {Pre,Post}Render*, MarkBufferedOutput,
// {Render,Release,Finalize}Buffered*, RenderTiles{Begin,End}) inherit
// HGRenderer / HGObject implementations verbatim (resolved via
// `raw-port/army/tools/resolve.py Helium vtable HGSWRenderer`).
//
// The class body carries no new fields: C2 does nothing but chain into
// HGRenderer::HGRenderer() and store the vptr at offset 0.  D2 tail-calls
// HGRenderer::~HGRenderer().  D0 additionally invokes HGObject::operator
// delete(void*).  This is a *pure vtable-swap* subclass — behavioural
// differences live entirely in the overridden methods listed in the
// vtable dump, none of which are populated by the ctor.
//
// FRONTIER: HGRenderer itself is not yet transcribed in this port
// (base ctor @0x1a0f?? / dtor referenced but no HGRenderer.ts exists).
// We import throwing stubs so the ABI edge is explicit — every attempt
// to construct or destroy an HGSWRenderer will raise, citing the
// undecoded base-class address.  This is the correct demand signal.

import { HGObject_dtor } from './HGObject_stub';

/**
 * HGRenderer::HGRenderer() — Helium base-class constructor.
 * Not yet transcribed; referenced from HGSWRenderer::HGSWRenderer()
 * @Helium 0x002021b9 (C2) and 0x002021d9 (C1).
 */
function HGRenderer_ctor(_self: object): void {
  // Correct signal: base-class construction is an undecoded frontier.
  // The real HGRenderer::HGRenderer() (__ZN10HGRendererC2Ev) has not
  // been ported yet; raise here so the ABI dependency is loud.
  const err = new Error(
    'HGRenderer::HGRenderer() not yet transcribed ' +
    '(called from HGSWRenderer C2 @Helium 0x002021b9, C1 @Helium 0x002021d9)'
  );
  throw err;
}

/**
 * HGRenderer::~HGRenderer() — Helium base-class destructor
 * (__ZN10HGRendererD2Ev).  Not yet transcribed; referenced from
 * HGSWRenderer dtors @Helium 0x002021f5 (D2), 0x00202205 (D1),
 * 0x00202219 (D0).
 */
function HGRenderer_dtor(_self: object): void {
  const err = new Error(
    'HGRenderer::~HGRenderer() not yet transcribed ' +
    '(called from HGSWRenderer D2 @Helium 0x002021f5, ' +
    'D1 @Helium 0x00202205, D0 @Helium 0x00202219)'
  );
  throw err;
}

/**
 * HGSWRenderer — Helium software (CPU) renderer.
 *
 * A trivial subclass of HGRenderer: no new fields, only an overridden
 * vtable at file offset 0xa2e650 with __ZN12HGSWRendererD2Ev / D0Ev
 * plugged into slots 0x00 / 0x08.  All virtual dispatch beyond the two
 * dtor slots falls through to the HGRenderer base implementations —
 * see the block-comment vtable dump at the top of this file.
 *
 * We model the ABI faithfully: the field carrying the C++ vptr is
 * exposed as `vptr` (offset 0 in the real 8-byte-aligned object) and
 * points at the same synthetic table shared by C1 and C2.
 */
export class HGSWRenderer {
  /**
   * C++ vtable pointer at object offset 0x00 — set by C1/C2 to the
   * HGSWRenderer vtable @Helium 0xa2e660 (vtable body @0xa2e650 + the
   * standard 16-byte typeinfo/offset-to-top header the ABI skips).
   *
   * We use a string tag rather than a real pointer because virtual
   * dispatch is not modelled at runtime in this raw port — the vtable
   * inheritance is documented in prose and by the resolve.py dump.
   */
  vptr: string = '';

  /**
   * HGSWRenderer::HGSWRenderer() — Helium base ctor
   * __ZN12HGSWRendererC2Ev @0x002021b0.
   *
   * Disassembly (verbatim):
   *   0x2021b0  pushq %rbp
   *   0x2021b2  movl  %esp, %ebp                ; frame setup (32-bit form,
   *                                             ; matches otool's rendering
   *                                             ; of the mov %rsp,%rbp
   *                                             ; encoding for -O2 code)
   *   0x2021b4  pushq %rbx
   *   0x2021b5  pushq %rax                      ; 16-byte stack alignment
   *   0x2021b6  movq  %rdi, %rbx                ; save `this`
   *   0x2021b9  callq __ZN10HGRendererC2Ev      ; HGRenderer::HGRenderer()
   *   0x2021be  leaq  0x82c49b(%rip), %rax      ; &vtable+0x10 @0xa2e660
   *   0x2021c5  movq  %rax, (%rbx)              ; this->vptr = &vtable[0]
   *   0x2021c8  addq  $0x8, %rsp
   *   0x2021cc  popq  %rbx
   *   0x2021cd  popq  %rbp
   *   0x2021ce  retq
   *
   * RIP-relative vptr install:
   *   0x2021be + 7 + 0x82c49b = 0xa2e660  (== &vtable + 0x10, ABI-standard
   *   payload start — resolve.py: `HGSWRenderer vtable @0xa2e650;
   *   installed ptr 0xa2e660`).
   *
   * Chains into the (undecoded) HGRenderer base constructor — will throw
   * via `HGRenderer_ctor` until that class lands.
   */
  static C2(self: HGSWRenderer): void {
    // @Helium 0x002021b9 — call HGRenderer::HGRenderer() on `this`.
    HGRenderer_ctor(self);
    // @Helium 0x002021be–0x2021c5 — install vptr @0xa2e660.
    self.vptr = 'HGSWRenderer_vtable@0xa2e660';
  }

  /**
   * HGSWRenderer::HGSWRenderer() — Helium complete ctor
   * __ZN12HGSWRendererC1Ev @0x002021d0.
   *
   * Disassembly (verbatim):
   *   0x2021d0  pushq %rbp
   *   0x2021d1  movq  %rsp, %rbp
   *   0x2021d4  pushq %rbx
   *   0x2021d5  pushq %rax
   *   0x2021d6  movq  %rdi, %rbx                ; save `this`
   *   0x2021d9  callq __ZN10HGRendererC2Ev      ; HGRenderer::HGRenderer()
   *   0x2021de  leaq  0x82c47b(%rip), %rax      ; &vtable+0x10 @0xa2e660
   *   0x2021e5  movq  %rax, (%rbx)              ; this->vptr = &vtable[0]
   *   0x2021e8  addq  $0x8, %rsp
   *   0x2021ec  popq  %rbx
   *   0x2021ed  popq  %rbp
   *   0x2021ee  retq
   *
   * RIP-relative vptr install:
   *   0x2021de + 7 + 0x82c47b = 0xa2e660  (identical target to C2).
   *
   * Byte-identical semantics to C2 — the Itanium C1/C2 pair is
   * indistinguishable at the source level for a non-virtual-base class.
   */
  static C1(self: HGSWRenderer): void {
    // @Helium 0x002021d9 — call HGRenderer::HGRenderer() on `this`.
    HGRenderer_ctor(self);
    // @Helium 0x002021de–0x2021e5 — install vptr @0xa2e660 (same target
    // as C2 above; both symbols share the vtable payload).
    self.vptr = 'HGSWRenderer_vtable@0xa2e660';
  }

  /**
   * HGSWRenderer::~HGSWRenderer() — Helium base dtor
   * __ZN12HGSWRendererD2Ev @0x002021f0.
   *
   * Disassembly (verbatim):
   *   0x2021f0  pushq %rbp
   *   0x2021f1  movq  %rsp, %rbp
   *   0x2021f4  popq  %rbp
   *   0x2021f5  jmp   __ZN10HGRendererD2Ev      ; tail-call base dtor
   *
   * A pure tail-call into HGRenderer::~HGRenderer(); no member cleanup
   * of its own (the class has no owned fields beyond the vptr).
   */
  static D2(self: HGSWRenderer): void {
    // @Helium 0x002021f5 — jmp HGRenderer::~HGRenderer(); tail-call form.
    HGRenderer_dtor(self);
  }

  /**
   * HGSWRenderer::~HGSWRenderer() — Helium complete dtor
   * __ZN12HGSWRendererD1Ev @0x00202200.
   *
   * Disassembly (verbatim):
   *   0x202200  pushq %rbp
   *   0x202201  movq  %rsp, %rbp
   *   0x202204  popq  %rbp
   *   0x202205  jmp   __ZN10HGRendererD2Ev      ; tail-call base dtor
   *
   * Byte-identical to D2 (both tail-call HGRenderer::~HGRenderer()
   * without doing any subclass-specific cleanup).
   */
  static D1(self: HGSWRenderer): void {
    // @Helium 0x00202205 — jmp HGRenderer::~HGRenderer(); tail-call form.
    HGRenderer_dtor(self);
  }

  /**
   * HGSWRenderer::~HGSWRenderer() — Helium deleting dtor
   * __ZN12HGSWRendererD0Ev @0x00202210.
   *
   * Disassembly (verbatim):
   *   0x202210  pushq %rbp
   *   0x202211  movq  %rsp, %rbp
   *   0x202214  pushq %rbx
   *   0x202215  pushq %rax
   *   0x202216  movq  %rdi, %rbx                ; save `this`
   *   0x202219  callq __ZN10HGRendererD2Ev      ; HGRenderer::~HGRenderer()
   *   0x20221e  movq  %rbx, %rdi                ; restore `this` -> arg0
   *   0x202221  addq  $0x8, %rsp
   *   0x202225  popq  %rbx
   *   0x202226  popq  %rbp
   *   0x202227  jmp   __ZN8HGObjectdlEPv        ; HGObject::operator delete(this)
   *
   * Standard Itanium D0 pattern: run the base destructor then hand the
   * memory back to the class-specific allocator.  HGObject::operator
   * delete is itself an undecoded frontier — see HGObject_stub.ts.
   */
  static D0(self: HGSWRenderer): void {
    // @Helium 0x00202219 — call HGRenderer::~HGRenderer() on `this`.
    HGRenderer_dtor(self);
    // @Helium 0x00202227 — tail-jmp HGObject::operator delete(this).
    // Use the imported dtor stub for HGObject; the real operator delete
    // has not been ported and would raise identically.
    HGObject_dtor(self);
  }
}
