// HGInterlaceHandler_ExtractField.ts — Helium render-graph node that
// extracts one field (upper or lower) from an interlaced input, plus a
// scalar mixing parameter. Transcribed verbatim from the FCP Helium
// framework:
//   /Applications/Final Cut Pro.app/Contents/Frameworks/Helium.framework/Versions/A/Helium
//
// This is a thin façade class over an underlying "Hgc" implementation
// (HgcInterlaceHandler_ExtractField). Its own storage is exactly one
// pointer-slot at +0x198 that owns a heap-allocated Hgc instance
// (0x1a0 bytes, zero-initialized then Hgc::HgcInterlaceHandler_ExtractField()
// ctored). All parameter writes forward to the Hgc via its own vtable
// slot at +0x60, and GetOutput plumbs a renderer input into the Hgc's
// SetInput slot (+0x78 = HGNode::SetInput).
//
// Emitted symbols (Helium, x86_64 slice; file offset 0x4000):
//   HGInterlaceHandler_ExtractField::HGInterlaceHandler_ExtractField() [C1 complete] @0x0000000000092e40
//     (C2 base ctor @0x0000000000092db0 is ICF-folded with C1 — otool -tV emits no label
//      at 0x92db0 in the current build; the same body is entered via either mangling.)
//   HGInterlaceHandler_ExtractField::~HGInterlaceHandler_ExtractField() [D2 base]     @0x0000000000092ed0
//   HGInterlaceHandler_ExtractField::~HGInterlaceHandler_ExtractField() [D1 complete] @0x0000000000092f10
//   HGInterlaceHandler_ExtractField::~HGInterlaceHandler_ExtractField() [D0 deleting] @0x0000000000092f50
//   HGInterlaceHandler_ExtractField::SetParameter(int, float,float,float,float)       @0x0000000000092f90
//   HGInterlaceHandler_ExtractField::SetWhichField(HGInterlaceHandler_ExtractField::hgInterlaceHandler_ExtractField)
//                                                                                     @0x0000000000092fe0
//   HGInterlaceHandler_ExtractField::GetOutput(HGRenderer*)                           @0x0000000000093000
//
// VTABLE @Helium 0x0000000000a0aa58 (recovered by reading each dtor/ctor
// leaq target — RIP-relative math verified below). Slots read directly
// from the binary (see raw-port/re/disasm/*):
//   *0x00 = 0x00092f10  ~HGInterlaceHandler_ExtractField() [D1 complete]
//   *0x08 = 0x00092f50  ~HGInterlaceHandler_ExtractField() [D0 deleting]
//   *0x10 = 0x001a0f20  HGObject::Retain()               (inherited)
//   *0x18 = 0x001a0f30  HGObject::Release()              (inherited)
//   *0x20 = 0x0011c100  HGNode::debugDescription() const (inherited)
//   *0x28 = 0x0011c080  HGNode::dotLabel() const         (inherited)
//   *0x30 = 0x0011c090  HGNode::label_A() const          (inherited)
//   *0x38 = 0x0011c0d0  HGNode::label_B() const          (inherited)
//   *0x40 = 0x0011c0e0  HGNode::info(...)                (inherited)
//   *0x48 = 0x0011c3f0  HGNode::shaderDescription()      (inherited)
//   *0x50 = 0x0011ca50  HGNode::GetParameterCount()      (inherited)
//   *0x58 = 0x0011ca60  HGNode::GetParameterName(int)    (inherited)
//   *0x60 = 0x00092f90  HGInterlaceHandler_ExtractField::SetParameter  (override)
//   *0x68 = 0x0011cbe0  HGNode::GetParameter(int,float*) (inherited)
//   *0x70 = 0x0011c8a0  HGNode::GetNumInputs()           (inherited)
//   *0x78 = 0x0011c5f0  HGNode::SetInput(int, HGNode*)   (inherited)
//   *0x80 = 0x0011c8b0  HGNode::GetInput(int)            (inherited)
// (GetOutput and SetWhichField are non-virtual — not in the vtable.)
//
// RIP-relative resolution for the vtable-install `leaq` at each entry
// point (Itanium C++ ABI installs the vtable data-slot address, which
// lives 0x10 past the RTTI header; the leaqs point to +0x10 = 0xa0aa58):
//   C1 @0x92e52 leaq 0x977bff(%rip) : next-rip 0x92e59 + 0x977bff = 0x0a0aa58
//   D2 @0x92ed9 leaq 0x977b78(%rip) : next-rip 0x92ee0 + 0x977b78 = 0x0a0aa58
//   D1 @0x92f19 leaq 0x977b38(%rip) : next-rip 0x92f20 + 0x977b38 = 0x0a0aa58
//   D0 @0x92f59 leaq 0x977af8(%rip) : next-rip 0x92f60 + 0x977af8 = 0x0a0aa58
// All four resolve to the same absolute vtable-data address 0xa0aa58, as
// expected for a class with a single vtable.
//
// The C1 ctor also installs the Hgc's vtable @0xa0af08:
//   C1 @0x92e7e leaq 0x978083(%rip) : next-rip 0x92e85 + 0x978083 = 0x0a0af08
//
// STRUCT LAYOUT — inherits HGNode's entire prefix (HGObject at 0x00,
// HGNode fields through 0x197 — see raw-port/src/render/HGNode.ts) and
// adds exactly one field:
//   +0x198  HgcInterlaceHandler_ExtractField* impl
//           Ctor allocates 0x1a0 bytes via `HGObject::operator new`
//           @0x92e61, zeros them via ___bzero @0x92e71 (size 0x1a0
//           passed in %esi @0x92e69), then invokes
//           `HgcInterlaceHandler_ExtractField::HgcInterlaceHandler_ExtractField()`
//           @0x92e79 on the fresh buffer, installs the Hgc vtable
//           @0xa0af08 into +0x00 of the impl, and stores the impl
//           pointer at +0x198 of the outer object.
//           D2/D1/D0 each read the impl at +0x198, dereference its
//           vtable and tail-call slot +0x18 = HGObject::Release() on
//           it (which drops the refcount from 1 → 0 and frees the impl).
//
// PARAMETER SEMANTICS (from SetParameter @0x92f90 and SetWhichField @0x92fe0):
//   • SetParameter(idx, a, b, c, d) IGNORES `idx`, `b`, `c`, `d`. It
//     always forwards to `impl->SetParameter(0, 0.0f, (a==0.0f)?0.0f:1.0f, 0.0f, 0.0f)`
//     via the Hgc vtable slot +0x60. The (a==0)?0:1 boolification uses
//     `cmpeqss xmm0,xmm1 ; andnps xmm0,xmm1` where xmm0 is loaded from
//     the Helium float32 constant at file offset 0x3c7cc0 (value 1.0f,
//     bytes 00 00 80 3f).
//   • SetWhichField(which) calls THIS object's own virtual SetParameter
//     (via slot +0x60 on the OUTER vtable, i.e. the class's own
//     SetParameter above) with (0, (float)which, 0.0f, 0.0f, 0.0f).
//     The int→float conversion uses `cvtsi2ss` on a sign-extended
//     32→64-bit source, so the effective conversion is `(float)which`
//     under normal C signed-int semantics.
//
// GETOUTPUT SEMANTICS (from GetOutput @0x93000):
//   input = renderer->GetInput(this, 0);
//   this->impl->SetInput(0, input);   // vtable slot +0x78 on the Hgc,
//                                     // which inherits HGNode::SetInput
//                                     // @0x11c5f0.
//   return this->impl;                // as an HGNode*.

import { HGNode } from "./HGNode";

/** Opaque HGRenderer pointer — not decoded here. */
export type HGRendererPtr = {
  readonly __brand: "HGRenderer";
};

/**
 * `HGInterlaceHandler_ExtractField::hgInterlaceHandler_ExtractField` —
 * the nested enum type used by SetWhichField's second parameter. Only
 * the fact that it is a 32-bit integer (passed in %esi) is decoded
 * here; the concrete enumerator values are set by callers we haven't
 * decoded yet, so we treat this as an opaque signed int32 for now.
 * (See the SetWhichField cvtsi2ss @0x92fe6 — the value is
 * sign-extended from %esi to %rax then converted to float32.)
 */
export type HgInterlaceHandler_ExtractField_WhichField = number;

/**
 * Frontier: HgcInterlaceHandler_ExtractField — the underlying impl
 * allocated by the outer ctor. Its vtable @0xa0af08 has slot +0x60
 * pointing to `HgcInterlaceHandler_ExtractField::SetParameter` @0x3370e0,
 * and inherits from HGNode so slot +0x78 = HGNode::SetInput @0x11c5f0.
 * We model this as an opaque box + two virtual-dispatch stubs so that
 * the outer class's calls have a real callee target with a real @0xADDR.
 */
export interface HgcInterlaceHandler_ExtractField {
  /** +0x00 vtable (installed to 0xa0af08 by the outer ctor @0x92e88). */
  readonly __vtable: 0xa0af08;
  /** +0x08 .. +0x1a0 — all remaining fields are zero-initialized by
   *  `___bzero(impl, 0x1a0)` @0x92e71 and then partly filled by the
   *  Hgc ctor call @0x92e79. Their layout is NOT decoded in this class
   *  (it belongs to HgcInterlaceHandler_ExtractField.ts, not here). */
  readonly __brand: "HgcInterlaceHandler_ExtractField";
}

/**
 * Frontier stub: HgcInterlaceHandler_ExtractField::SetParameter
 *   @0x00000000003370e0 (Helium; vtable slot +0x60 on the Hgc vtable
 *   at 0xa0af08). Signature (int, float, float, float, float) →
 *   likely returns u32 (per the sibling HG*::SetParameter pattern),
 *   but the return value is not observed by the outer class.
 * Not yet transcribed — the outer HGInterlaceHandler_ExtractField
 * class delegates its own SetParameter to this frontier via
 * `impl->vtable[+0x60]` (@0x92fbf tail-jmp).
 */
function Hgc_SetParameter_via_vtable_0x60(
  _impl: HgcInterlaceHandler_ExtractField,
  _idx: number,
  _a: number,
  _b: number,
  _c: number,
  _d: number,
): number {
  // HgcInterlaceHandler_ExtractField::SetParameter frontier
  // — not yet transcribed @0x00000000003370e0 (Helium; vtable slot +0x60
  //   on Hgc vtable @0xa0af08; called by outer SetParameter @0x92fbf).
  throw new Error(
    "HgcInterlaceHandler_ExtractField::SetParameter not yet transcribed @0x00000000003370e0",
  );
}

/**
 * Frontier stub: `HGNode::SetInput(int, HGNode*)`
 *   @0x000000000011c5f0 (Helium; slot +0x78 on HGNode's vtable at
 *   0xa1d7c8, inherited by the Hgc). Called by GetOutput @0x93029 as
 *   `impl->vtable[0x78](impl, 0, input)`. Already documented as a
 *   throw-stub in HGNode.ts — we re-declare a wrapper here so the call
 *   site has a real, addr-cited callee.
 */
function HGNode_SetInput_via_vtable_0x78(
  _impl: HgcInterlaceHandler_ExtractField,
  _idx: number,
  _src: HGNode,
): void {
  // HGNode::SetInput frontier — not yet transcribed @0x000000000011c5f0
  // (Helium; vtable slot +0x78; used by HGInterlaceHandler_ExtractField::
  // GetOutput @0x93029 with idx=0 and src=renderer->GetInput(this,0)).
  throw new Error(
    "HGNode::SetInput not yet transcribed @0x000000000011c5f0",
  );
}

/**
 * Frontier stub: `HGRenderer::GetInput(HGNode*, int)`
 *   @0x0000000000???????. The exact address lives in a different
 *   Helium method table (HGRenderer's) which is not decoded in this
 *   file. Called by GetOutput @0x93019 as
 *   `renderer->GetInput(this, 0)`. We surface the callee so the port
 *   is complete-with-frontier-stubs.
 */
function HGRenderer_GetInput(
  _renderer: HGRendererPtr,
  _node: HGNode,
  _idx: number,
): HGNode {
  // HGRenderer::GetInput frontier — not yet transcribed
  // @0x0000000000093019 (called-from address; the callee's own @0xADDR
  //  is on the HGRenderer class we haven't decoded yet).
  throw new Error(
    "HGRenderer::GetInput not yet transcribed (call site @0x0000000000093019)",
  );
}

/**
 * Frontier stub: `HGObject::Release()`
 *   @0x00000000001a0f30 (Helium; slot +0x18 on HGObject's vtable,
 *   inherited by the Hgc). Called by D2/D1/D0 as
 *   `impl->vtable[0x18](impl)` (see @0x92eed / @0x92f2d / @0x92f6d).
 */
function HGObject_Release_via_vtable_0x18(
  _impl: HgcInterlaceHandler_ExtractField,
): void {
  // HGObject::Release frontier — not yet transcribed @0x00000000001a0f30
  // (Helium; vtable slot +0x18; used by HGInterlaceHandler_ExtractField
  // dtors D2 @0x92eed / D1 @0x92f2d / D0 @0x92f6d on the impl pointer).
  throw new Error(
    "HGObject::Release not yet transcribed @0x00000000001a0f30",
  );
}

/**
 * Frontier stub: HgcInterlaceHandler_ExtractField's own C2 ctor
 *   @0x0000000000????????. Called by the outer ctor @0x92e79 on the
 *   freshly-bzeroed 0x1a0-byte impl buffer. Not decoded here (belongs
 *   to HgcInterlaceHandler_ExtractField.ts).
 */
function Hgc_C2_ctor(_impl: HgcInterlaceHandler_ExtractField): void {
  // HgcInterlaceHandler_ExtractField::HgcInterlaceHandler_ExtractField()
  //   frontier — not yet transcribed (called from @0x0000000000092e79).
  //   The mangled symbol is __ZN32HgcInterlaceHandler_ExtractFieldC2Ev
  //   and lives in the Hgc's own translation unit.
  throw new Error(
    "HgcInterlaceHandler_ExtractField::HgcInterlaceHandler_ExtractField() not yet transcribed (call site @0x0000000000092e79)",
  );
}

/**
 * Frontier stub: `HGNode::ClearBits()`
 *   @0x00000000????????. Called by SetParameter @0x92fa0 before the
 *   forward-to-impl tail call. Sibling utility on HGNode; not decoded
 *   in this file.
 */
function HGNode_ClearBits(_this_: HGInterlaceHandler_ExtractField): void {
  // HGNode::ClearBits frontier — not yet transcribed
  // (called from HGInterlaceHandler_ExtractField::SetParameter @0x92fa0).
  throw new Error(
    "HGNode::ClearBits not yet transcribed (call site @0x0000000000092fa0)",
  );
}

/**
 * Float32 constant `1.0f` loaded by SetParameter @0x92fbf from Helium
 * file offset 0x3c7cc0 (bytes `00 00 80 3f`, verified by reading the
 * x86_64 slice at file-offset 0x4000 + 0x3c7cc0). Preserved as an
 * IEEE-754 bit-pattern so future consumers see exactly the FCP-decoded
 * value.
 */
export const HGInterlaceHandler_ExtractField_ONE_F32: number = (() => {
  // 0x3f800000 → +1.0f
  const buf = new ArrayBuffer(4);
  const u32 = new Uint32Array(buf);
  const f32 = new Float32Array(buf);
  u32[0] = 0x3f800000;
  return f32[0];
})();

/**
 * FCP Helium `HGInterlaceHandler_ExtractField`. Concrete HGNode
 * subclass; vtable installed at 0xa0aa58 by C1/D0/D1/D2 (see file
 * header for RIP-relative arithmetic). Storage adds a single owning
 * pointer to a `HgcInterlaceHandler_ExtractField` at +0x198.
 */
export class HGInterlaceHandler_ExtractField extends HGNode {
  /** +0x198 — owning pointer to the Hgc implementation. Allocated by
   *  the ctor via `HGObject::operator new(0x1a0)` and freed by the
   *  dtors via `impl->vtable[+0x18] = HGObject::Release()`. */
  impl: HgcInterlaceHandler_ExtractField;

  /**
   * HGInterlaceHandler_ExtractField::HGInterlaceHandler_ExtractField()
   * [C1 complete] @0x0000000000092e40.
   * (C2 base ctor @0x0000000000092db0 is ICF-folded with C1 — otool -tV
   *  yields no distinct label. Both entry points share this TS body.)
   *
   * Body:
   *   0x92e4d callq HGNode::HGNode()                    ; base ctor
   *   0x92e52 leaq  0x977bff(%rip), %rax                ; vtbl = 0xa0aa58
   *   0x92e59 movq  %rax, (%rbx)                        ;  +0x00 vtbl
   *   0x92e5c movl  $0x1a0, %edi                        ; sizeof(impl)=0x1a0
   *   0x92e61 callq HGObject::operator new(unsigned long)
   *   0x92e66 movq  %rax, %r14                          ; r14 = raw impl
   *   0x92e69 movl  $0x1a0, %esi                        ; count
   *   0x92e6e movq  %rax, %rdi
   *   0x92e71 callq ___bzero                            ; memset(impl,0,0x1a0)
   *   0x92e76 movq  %r14, %rdi
   *   0x92e79 callq HgcInterlaceHandler_ExtractField::HgcInterlaceHandler_ExtractField()
   *   0x92e7e leaq  0x978083(%rip), %rax                ; hgc vtbl = 0xa0af08
   *   0x92e85 movq  %rax, (%r14)                        ;   +0x00 hgc vtbl
   *   0x92e88 movq  %r14, 0x198(%rbx)                   ; this.impl = r14
   *   ...
   * (Unwind cleanup path @0x92e9a..0x92ec8 deletes the impl and re-
   *  destructs the HGNode base if Hgc ctor throws — modeled by TS
   *  exception semantics for free.)
   */
  constructor() {
    super();
    // Allocate + zero + construct the underlying Hgc. In C++ this is
    // `HGObject::operator new(0x1a0)` → `___bzero(0x1a0)` → Hgc ctor →
    // vtable install. In our TS model the equivalent is a single
    // object literal whose fields all default to zero; we then invoke
    // the frontier Hgc-ctor stub to record that the impl is
    // constructed exactly at this program point.
    const raw: HgcInterlaceHandler_ExtractField = {
      __vtable: 0xa0af08,
      __brand: "HgcInterlaceHandler_ExtractField",
    };
    Hgc_C2_ctor(raw);
    this.impl = raw;
  }

  /**
   * HGInterlaceHandler_ExtractField::~HGInterlaceHandler_ExtractField()
   * [D2 base] @0x0000000000092ed0.
   *
   * Body:
   *   0x92ed9 leaq  0x977b78(%rip), %rax        ; vtbl = 0xa0aa58
   *   0x92ee0 movq  %rax, (%rdi)                ;  reinstall vtbl (ABI)
   *   0x92ee3 movq  0x198(%rdi), %rdi           ; rdi = this.impl
   *   0x92eea movq  (%rdi), %rax                ; rax = impl->vtable
   *   0x92eed callq *0x18(%rax)                 ; impl->Release()
   *   0x92ef0 movq  %rbx, %rdi
   *   0x92ef9 jmp   HGNode::~HGNode() [D2]      ; base tail-call
   *
   * Note: D2 does NOT null this.impl — it only releases (which will
   * usually free the impl since its refcount was 1 after ctor).
   */
  destructD2(): void {
    HGObject_Release_via_vtable_0x18(this.impl);
    // HGNode::~HGNode() base tail-call is implicit in the JS
    // inheritance model — no explicit invocation required.
  }

  /**
   * HGInterlaceHandler_ExtractField::~HGInterlaceHandler_ExtractField()
   * [D1 complete] @0x0000000000092f10.
   *
   * Body (identical in effect to D2):
   *   0x92f19 leaq  0x977b38(%rip), %rax        ; vtbl = 0xa0aa58
   *   0x92f20 movq  %rax, (%rdi)                ;  reinstall vtbl
   *   0x92f23 movq  0x198(%rdi), %rdi           ; rdi = this.impl
   *   0x92f2a movq  (%rdi), %rax
   *   0x92f2d callq *0x18(%rax)                 ; impl->Release()
   *   0x92f39 jmp   HGNode::~HGNode() [D2]      ; base tail-call
   */
  destructD1(): void {
    this.destructD2();
  }

  /**
   * HGInterlaceHandler_ExtractField::~HGInterlaceHandler_ExtractField()
   * [D0 deleting] @0x0000000000092f50.
   *
   * Body:
   *   0x92f59 leaq  0x977af8(%rip), %rax        ; vtbl = 0xa0aa58
   *   0x92f60 movq  %rax, (%rdi)                ;  reinstall vtbl
   *   0x92f63 movq  0x198(%rdi), %rdi           ; rdi = this.impl
   *   0x92f6a movq  (%rdi), %rax
   *   0x92f6d callq *0x18(%rax)                 ; impl->Release()
   *   0x92f70 movq  %rbx, %rdi
   *   0x92f73 callq HGNode::~HGNode() [D2]      ; base dtor (call, not jmp)
   *   0x92f78 movq  %rbx, %rdi
   *   0x92f81 jmp   HGObject::operator delete   ; free `this`
   */
  destructD0(): void {
    this.destructD2();
    // Tail-jump to HGObject::operator delete on `this` — JS GC handles
    // the actual free once no references remain.
  }

  /**
   * HGInterlaceHandler_ExtractField::SetParameter(
   *   int idx, float a, float b, float c, float d)
   *   @0x0000000000092f90. Vtable slot +0x60 (overrides HGNode).
   *
   * Ignores `idx`, `b`, `c`, `d`. Forwards to
   *   this.impl->SetParameter(0, 0.0f, (a==0.0f)?0.0f:1.0f, 0.0f, 0.0f)
   * via the Hgc vtable slot +0x60 as a tail-call.
   *
   * Body:
   *   0x92f99 movaps %xmm0, -0x20(%rbp)          ; spill a (float)
   *   0x92fa0 callq HGNode::ClearBits()
   *   0x92fa5 movq  0x198(%rbx), %rdi            ; rdi = this.impl
   *   0x92fac movq  (%rdi), %rax                 ; rax = impl->vtable
   *   0x92faf movq  0x60(%rax), %rax             ; rax = vtable[+0x60] = Hgc::SetParameter
   *   0x92fb3 xorps %xmm0, %xmm0                 ; xmm0 = 0.0f
   *   0x92fb6 movaps -0x20(%rbp), %xmm1          ; xmm1 = a
   *   0x92fba cmpeqss %xmm0, %xmm1               ; xmm1 = (a==0.0f)? all-1 : 0
   *   0x92fbf movss  0x334cf9(%rip), %xmm0       ; xmm0 = 1.0f from file-off 0x3c7cc0
   *   0x92fc7 andnps %xmm0, %xmm1                ; xmm1 = ~xmm1 & 1.0f
   *                                              ;      = (a==0.0f) ? 0.0f : 1.0f
   *   0x92fca xorps %xmm0, %xmm0                 ; xmm0 = 0.0f
   *   0x92fcd xorps %xmm2, %xmm2                 ; xmm2 = 0.0f
   *   0x92fd0 xorps %xmm3, %xmm3                 ; xmm3 = 0.0f
   *   0x92fd3 xorl  %esi, %esi                   ; idx = 0
   *   0x92fdb jmpq  *%rax                        ; impl->SetParameter(0, 0.0, xmm1, 0.0, 0.0)
   *
   * The +0x60 vtable slot on the Hgc's vtable at 0xa0af08 resolves to
   * HgcInterlaceHandler_ExtractField::SetParameter @0x3370e0 (see the
   * frontier stub Hgc_SetParameter_via_vtable_0x60 above).
   */
  SetParameter(
    _idx: number,
    a: number,
    _b: number,
    _c: number,
    _d: number,
  ): number {
    HGNode_ClearBits(this);
    // Match float32 semantics exactly — %xmm0 arrives as a single-
    // precision float from the caller. Round to float32 up-front so
    // the (a==0.0f) test observes exactly the same subnormals-flushed
    // representation the disasm sees.
    const a32 = Math.fround(a);
    // cmpeqss produces all-ones iff a==0 AND both operands ordered.
    // andnps then computes ~mask & 1.0f. For NaN, cmpeqss returns 0
    // (unordered → not equal), so the andnps yields 1.0f — i.e. NaN
    // is treated as "not zero" (→ passes 1.0f). Zero yields 0.0f.
    const boolified = a32 === 0 ? 0 : HGInterlaceHandler_ExtractField_ONE_F32;
    // Tail-call the impl's SetParameter through the Hgc vtable slot
    // +0x60. Args exactly mirror the register state at 0x92fdb:
    //   idx = 0, a = 0.0f, b = boolified, c = 0.0f, d = 0.0f.
    return Hgc_SetParameter_via_vtable_0x60(
      this.impl,
      0,
      0.0,
      boolified,
      0.0,
      0.0,
    );
  }

  /**
   * HGInterlaceHandler_ExtractField::SetWhichField(
   *   HGInterlaceHandler_ExtractField::hgInterlaceHandler_ExtractField which)
   *   @0x0000000000092fe0. Non-virtual (not in the vtable).
   *
   * Body:
   *   0x92fe4 movl   %esi, %eax                  ; eax = which (int32)
   *   0x92fe6 cvtsi2ss %rax, %xmm0               ; xmm0 = (float)which
   *                                              ; (rax is sign-extended
   *                                              ;  by movl, so effect is
   *                                              ;  signed 32→f32.)
   *   0x92feb movq   (%rdi), %rax                ; rax = this->vtable
   *                                              ; (OUTER vtable @0xa0aa58 —
   *                                              ;  NOT the impl's)
   *   0x92fee movq   0x60(%rax), %rax            ; rax = vtable[+0x60]
   *                                              ; = this->SetParameter (self)
   *   0x92ff2 xorps  %xmm1, %xmm1                ; b = 0.0f
   *   0x92ff5 xorps  %xmm2, %xmm2                ; c = 0.0f
   *   0x92ff8 xorps  %xmm3, %xmm3                ; d = 0.0f
   *   0x92ffb xorl   %esi, %esi                  ; idx = 0
   *   0x92ffe jmpq   *%rax                       ; this->SetParameter(0, (float)which, 0, 0, 0)
   *
   * Because the dispatch goes through THIS class's virtual +0x60 slot,
   * SetWhichField(which) ≡ SetParameter(0, (float)which, 0, 0, 0),
   * i.e. it goes through the outer SetParameter above (which then
   * forwards to the Hgc with the a==0?0:1 boolification). NOTE: as a
   * result, SetWhichField(0) writes b=0.0f to the impl; any nonzero
   * `which` writes b=1.0f. The int→float value is lost by the
   * boolification — this is the observed FCP behavior.
   */
  SetWhichField(which: HgInterlaceHandler_ExtractField_WhichField): number {
    // cvtsi2ss: sign-extend 32→64 (movl %esi,%eax zero-fills upper 32
    // of rax; then cvtsi2ss reads rax as signed 64-bit — but since the
    // upper 32 are already zero, the effective source is unsigned
    // 32-bit for positive `which`, and int64 for a hypothetical
    // negative sign-extended value. In this call graph the enum values
    // are small non-negative ints, so the two interpretations agree.)
    const asFloat = Math.fround(which | 0);
    // Virtual dispatch through slot +0x60 lands on THIS class's
    // SetParameter (no further-derived class is decoded here).
    return this.SetParameter(0, asFloat, 0.0, 0.0, 0.0);
  }

  /**
   * HGInterlaceHandler_ExtractField::GetOutput(HGRenderer* renderer)
   *   @0x0000000000093000. Non-virtual (not in the vtable).
   *
   * Body:
   *   0x9300a movq  0x198(%rdi), %r14           ; r14 = this.impl
   *   0x93011 movq  %rsi, %rdi                  ; renderer
   *   0x93014 movq  %rbx, %rsi                  ; this
   *   0x93017 xorl  %edx, %edx                  ; idx = 0
   *   0x93019 callq HGRenderer::GetInput(HGNode*, int)
   *                                             ; rax = input HGNode*
   *   0x9301e movq  (%r14), %rcx                ; rcx = impl->vtable
   *   0x93021 movq  %r14, %rdi                  ; rdi = impl
   *   0x93024 xorl  %esi, %esi                  ; idx = 0
   *   0x93026 movq  %rax, %rdx                  ; src = input
   *   0x93029 callq *0x78(%rcx)                 ; impl->SetInput(0, input)
   *                                             ;  vtable +0x78 =
   *                                             ;  HGNode::SetInput @0x11c5f0
   *                                             ;  (inherited by the Hgc).
   *   0x9302c movq  0x198(%rbx), %rax           ; return this.impl (as HGNode*)
   *   0x93037 retq
   *
   * So: `GetOutput(r) = { i = r->GetInput(this, 0); this.impl->SetInput(0, i); return this.impl; }`
   */
  GetOutput(renderer: HGRendererPtr): HGNode {
    const input = HGRenderer_GetInput(renderer, this, 0);
    HGNode_SetInput_via_vtable_0x78(this.impl, 0, input);
    // Return this.impl typed as HGNode*. In C++ the Hgc inherits HGNode
    // (its vtable @0xa0af08 has the same HGNode layout in slots 0x10+),
    // so this reinterpret is well-formed at the ABI level. We surface
    // it with an `as unknown as HGNode` cast because the Hgc's TS
    // interface is opaque here (its own class file will make the
    // inheritance explicit later).
    return this.impl as unknown as HGNode;
  }
}
