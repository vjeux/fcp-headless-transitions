// raw-port/src/render/HGBuffer.ts
//
// FCP `HGBuffer` (Helium framework) — trivial subclass of `HGBitmap` whose
// only observable behavior over the base is a distinct vtable identity.
// Every constructor calls the corresponding `HGBitmap::HGBitmap(...)` base
// constructor and then overwrites `*this` (offset 0x0) with the HGBuffer
// vtable pointer at 0xa275f0.  Every destructor tail-jmps into
// `HGBitmap::~HGBitmap()`; the deleting D0 dtor additionally tail-jmps
// `HGObject::operator delete(void*)` (inherited).
//
// Source binary:
//   /Applications/Final Cut Pro.app/Contents/Frameworks/Helium.framework/
//     Versions/A/Helium
//
// Decoded symbols (all bodies fully transcribed below):
//   0x1bbfa0  HGBuffer::HGBuffer(HGRect, HGBitmap*)         [C2 base ctor — otool -tV emitted no label; body identical in shape to C1 @0x1bbfc0 with a distinct vtable-RIP offset]
//   0x1bbfc0  HGBuffer::HGBuffer(HGRect, HGBitmap*)         [C1 complete ctor]
//   0x1bbfe0  HGBuffer::HGBuffer(HGRect, HGFormat)          [C2 base ctor]
//   0x1bc000  HGBuffer::HGBuffer(HGRect, HGFormat)          [C1 complete ctor]
//   0x1bc020  HGBuffer::HGBuffer(HGRect, HGFormat, void*)   [C2 base ctor]
//   0x1bc040  HGBuffer::HGBuffer(HGRect, HGFormat, void*)   [C1 complete ctor]
//   0x1bc060  HGBuffer::~HGBuffer()                         [D2 base dtor — tail-jmp HGBitmap::~HGBitmap() @D2]
//   0x1bc070  HGBuffer::~HGBuffer()                         [D1 complete dtor — tail-jmp HGBitmap::~HGBitmap() @D2]
//   0x1bc080  HGBuffer::~HGBuffer()                         [D0 deleting dtor — HGBitmap::~HGBitmap() then tail-jmp HGObject::operator delete]
//
// Vtable @ 0xa275e0 (installed pointer 0xa275f0):
//   *0x00 -> 0x1bc070  HGBuffer::~HGBuffer()   [D1 complete dtor]
//   *0x08 -> 0x1bc080  HGBuffer::~HGBuffer()   [D0 deleting dtor]
// (resolved via `raw-port/army/tools/vtable.py Helium HGBuffer`)
//
// All six ctors share the same shape:
//   pushq %rbp; movq %rsp,%rbp; pushq %rbx; pushq %rax
//   movq  %rdi, %rbx                              # this
//   callq __ZN8HGBitmapC2E<...args...>            # HGBitmap::HGBitmap(...)
//   leaq  <disp>(%rip), %rax                      # &_vtable_payload_0xa275f0
//   movq  %rax, (%rbx)                            # this->vtable = 0xa275f0
//   addq  $0x8,%rsp; popq %rbx; popq %rbp; retq
// The `<disp>(%rip)` values differ per-ctor but every one resolves to the
// SAME payload address 0xa275f0 (verified: instruction-after-leaq + disp
// = 0xa275f0 in every ctor).
//
// FRONTIER CALLEES (each surfaced as a throwing stub citing @0xADDR):
//   __ZN8HGBitmapC2E6HGRect8HGFormat    HGBitmap::HGBitmap(HGRect, HGFormat)                  @Helium (not yet transcribed)
//   __ZN8HGBitmapC2E6HGRect8HGFormatPv  HGBitmap::HGBitmap(HGRect, HGFormat, void*)           @Helium (not yet transcribed)
//   __ZN8HGBitmapC2E6HGRectPS_          HGBitmap::HGBitmap(HGRect, HGBitmap*)                 @Helium (not yet transcribed)
//   __ZN8HGBitmapD2Ev                   HGBitmap::~HGBitmap()                                 @Helium (not yet transcribed)
// HGBitmap is not yet a landed base class, so this file stubs it as an
// opaque nominal brand and models the base ctor/dtor calls as throwing
// helpers.  Once HGBitmap.ts lands, this file will import the real base
// and swap the throw-stubs for direct calls; the ctor / dtor SHAPE will
// be unchanged.
//
// DECODE-DON'T-FIT: every hex literal above is either the address of a
// decoded symbol or a vtable payload address read directly from a leaq's
// RIP-relative resolution.  No numeric constant is invented.

import { HGObject } from "./HGObject";
import type { HGRect } from "./HGRect";

// HGFormat is an integer enum in Helium; the concrete int values live in
// HGCV.ts (`export type HGFormat = number & { readonly __brand: "HGFormat" }`).
// We take a `number` here because the ctor asm treats the arg as a scalar
// int passed in %edx / %ecx — no format-specific branching happens inside
// HGBuffer's own ctors; all format-aware logic lives in the HGBitmap base
// ctor, which is a throwing stub below.
export type HGFormat = number;

/**
 * Opaque handle to Helium's HGBitmap. Ported separately (frontier).
 * HGBuffer extends HGBitmap in the C++ ABI; every HGBuffer ctor calls
 * one of HGBitmap's C2 base ctors and then overwrites the vtable slot.
 */
export interface HGBitmap {
  readonly __brand_HGBitmap: unique symbol;
}

// --------------------------------------------------------------------------
// Frontier stubs — HGBitmap ctor/dtor calls that HGBuffer performs but that
// have not been decoded yet. Rule 3 (PORTING_SPEC.md): undecoded callees
// throw with @0xADDR provenance.
// --------------------------------------------------------------------------

/**
 * `HGBitmap::HGBitmap(HGRect, HGFormat)` — Helium `__ZN8HGBitmapC2E6HGRect8HGFormat`.
 * Not yet transcribed. Called from HGBuffer's `(HGRect, HGFormat)` ctors
 * at Helium @0x1bbfe9 (C2) and @0x1bc009 (C1).
 */
function HGBitmap_ctor_rectFormat_stub(
  _self: HGBuffer,
  _rect: HGRect,
  _format: HGFormat,
): void {
  throw new Error(
    "HGBitmap::HGBitmap(HGRect, HGFormat) @Helium (__ZN8HGBitmapC2E6HGRect8HGFormat) is not yet transcribed.",
  );
}

/**
 * `HGBitmap::HGBitmap(HGRect, HGFormat, void*)` — Helium
 * `__ZN8HGBitmapC2E6HGRect8HGFormatPv`. Not yet transcribed. Called from
 * HGBuffer's `(HGRect, HGFormat, void*)` ctors at Helium @0x1bc029 (C2) and
 * @0x1bc049 (C1).
 */
function HGBitmap_ctor_rectFormatPtr_stub(
  _self: HGBuffer,
  _rect: HGRect,
  _format: HGFormat,
  _bytes: ArrayBufferLike | null,
): void {
  throw new Error(
    "HGBitmap::HGBitmap(HGRect, HGFormat, void*) @Helium (__ZN8HGBitmapC2E6HGRect8HGFormatPv) is not yet transcribed.",
  );
}

/**
 * `HGBitmap::HGBitmap(HGRect, HGBitmap*)` — Helium `__ZN8HGBitmapC2E6HGRectPS_`.
 * Not yet transcribed. Called from HGBuffer's `(HGRect, HGBitmap*)` ctors
 * at Helium @0x1bbfa9 (C2) and @0x1bbfc9 (C1).
 */
function HGBitmap_ctor_rectBitmap_stub(
  _self: HGBuffer,
  _rect: HGRect,
  _src: HGBitmap | null,
): void {
  throw new Error(
    "HGBitmap::HGBitmap(HGRect, HGBitmap*) @Helium (__ZN8HGBitmapC2E6HGRectPS_) is not yet transcribed.",
  );
}

/**
 * `HGBitmap::~HGBitmap()` — Helium `__ZN8HGBitmapD2Ev`. Not yet transcribed.
 * Called from HGBuffer's dtors: D2 @0x1bc065 (tail-jmp), D1 @0x1bc075
 * (tail-jmp), D0 @0x1bc089 (call).
 */
function HGBitmap_dtor_stub(_self: HGBuffer): void {
  throw new Error(
    "HGBitmap::~HGBitmap() @Helium (__ZN8HGBitmapD2Ev) is not yet transcribed.",
  );
}

// --------------------------------------------------------------------------
// HGBuffer — the class itself.
// --------------------------------------------------------------------------

/**
 * `HGBuffer` — Helium's GPU-backed bitmap subclass. The C++ class extends
 * `HGBitmap`; the only fields added at the HGBuffer level are the (possibly
 * empty) HGBuffer-specific tail of the object, plus the distinct vtable
 * identity installed at offset 0x0. All observable field layout beyond the
 * vtable is defined by `HGBitmap` (frontier: not yet decoded).
 *
 * In the TS port we model HGBuffer as a class extending `HGObject` at the
 * ABI-root level (HGBitmap itself extends HGObject; HGObject's `refCount`
 * and `vtable` fields are inherited). Actual bitmap fields will be added
 * when HGBitmap.ts lands.
 */
export class HGBuffer extends HGObject {
  /**
   * Vtable pointer value written at offset 0x0 by every HGBuffer ctor.
   * Resolved from every ctor's `leaq <disp>(%rip),%rax; movq %rax,(%rbx)`
   * — all six ctors compute the same target 0xa275f0 (the HGBuffer vtable
   * payload address, whose first two slots are D1 and D0 of HGBuffer).
   */
  static readonly VTABLE_ADDR = 0xa275f0;

  /**
   * Ctor: `HGBuffer::HGBuffer(HGRect, HGBitmap*)`.
   * C1 @0x1bbfc0 / C2 @0x1bbfa0 — same shape:
   *   0x1bbfc9  callq __ZN8HGBitmapC2E6HGRectPS_    ## HGBitmap::HGBitmap(HGRect, HGBitmap*)
   *   0x1bbfce  leaq  0x86b61b(%rip),%rax           ## &_vtable = 0xa275f0
   *   0x1bbfd5  movq  %rax,(%rbx)                   ## this->vtable = 0xa275f0
   *
   * The C2 variant at 0x1bbfa0 differs only in leaq disp (0x86b63b) — same
   * resolved target 0xa275f0. Both are represented by this single method
   * because the observable semantics are identical.
   */
  static ctorRectBitmap(rect: HGRect, src: HGBitmap | null): HGBuffer {
    const self = new HGBuffer();
    // @Helium 0x1bbfc9 (C1) / 0x1bbfa9 (C2): base ctor call.
    HGBitmap_ctor_rectBitmap_stub(self, rect, src);
    // @Helium 0x1bbfd5 (C1) / 0x1bbfb5 (C2): overwrite vtable to HGBuffer's.
    self.vtable = HGBuffer.VTABLE_ADDR;
    return self;
  }

  /**
   * Ctor: `HGBuffer::HGBuffer(HGRect, HGFormat)`.
   * C1 @0x1bc000 / C2 @0x1bbfe0:
   *   0x1bc009  callq __ZN8HGBitmapC2E6HGRect8HGFormat  ## HGBitmap::HGBitmap(HGRect, HGFormat)
   *   0x1bc00e  leaq  0x86b5db(%rip),%rax               ## &_vtable = 0xa275f0
   *   0x1bc015  movq  %rax,(%rbx)                       ## this->vtable = 0xa275f0
   *
   * C2 variant at 0x1bbfe0 differs only in leaq disp (0x86b5fb) — same
   * resolved target 0xa275f0.
   */
  static ctorRectFormat(rect: HGRect, format: HGFormat): HGBuffer {
    const self = new HGBuffer();
    // @Helium 0x1bc009 (C1) / 0x1bbfe9 (C2): base ctor call.
    HGBitmap_ctor_rectFormat_stub(self, rect, format);
    // @Helium 0x1bc015 (C1) / 0x1bbff5 (C2): overwrite vtable.
    self.vtable = HGBuffer.VTABLE_ADDR;
    return self;
  }

  /**
   * Ctor: `HGBuffer::HGBuffer(HGRect, HGFormat, void*)`.
   * C1 @0x1bc040 / C2 @0x1bc020:
   *   0x1bc049  callq __ZN8HGBitmapC2E6HGRect8HGFormatPv  ## HGBitmap::HGBitmap(HGRect, HGFormat, void*)
   *   0x1bc04e  leaq  0x86b59b(%rip),%rax                 ## &_vtable = 0xa275f0
   *   0x1bc055  movq  %rax,(%rbx)                         ## this->vtable = 0xa275f0
   *
   * C2 variant at 0x1bc020 differs only in leaq disp (0x86b5bb) — same
   * resolved target 0xa275f0.
   */
  static ctorRectFormatBytes(
    rect: HGRect,
    format: HGFormat,
    bytes: ArrayBufferLike | null,
  ): HGBuffer {
    const self = new HGBuffer();
    // @Helium 0x1bc049 (C1) / 0x1bc029 (C2): base ctor call.
    HGBitmap_ctor_rectFormatPtr_stub(self, rect, format, bytes);
    // @Helium 0x1bc055 (C1) / 0x1bc035 (C2): overwrite vtable.
    self.vtable = HGBuffer.VTABLE_ADDR;
    return self;
  }

  /**
   * D2 base dtor — `HGBuffer::~HGBuffer()` @Helium 0x1bc060.
   *   0x1bc065  jmp __ZN8HGBitmapD2Ev  ## HGBitmap::~HGBitmap()
   * Pure tail-jmp to the parent D2 dtor; HGBuffer adds no fields to
   * destroy at this level.
   */
  destructorD2(): void {
    // @Helium 0x1bc065: tail-jmp HGBitmap::~HGBitmap().
    HGBitmap_dtor_stub(this);
  }

  /**
   * D1 complete dtor — `HGBuffer::~HGBuffer()` @Helium 0x1bc070.
   *   0x1bc075  jmp __ZN8HGBitmapD2Ev  ## HGBitmap::~HGBitmap()
   * Identical body to D2 (single tail-jmp). Placed in vtable slot *0x00.
   */
  destructorD1(): void {
    // @Helium 0x1bc075: tail-jmp HGBitmap::~HGBitmap().
    HGBitmap_dtor_stub(this);
  }

  /**
   * D0 deleting dtor — `HGBuffer::~HGBuffer()` @Helium 0x1bc080. Placed in
   * vtable slot *0x08 (invoked by `HGObject::Release()` when refcount hits 0).
   *   0x1bc089  callq __ZN8HGBitmapD2Ev     ## HGBitmap::~HGBitmap()
   *   0x1bc08e  movq  %rbx,%rdi              ## arg = this
   *   0x1bc097  jmp   __ZN8HGObjectdlEPv    ## HGObject::operator delete(void*)
   */
  destructorD0(): void {
    // @Helium 0x1bc089: destroy HGBitmap subobject.
    HGBitmap_dtor_stub(this);
    // @Helium 0x1bc097: tail-jmp HGObject::operator delete(this).
    // The TS port models this as a no-op (GC handles storage); see
    // HGObject.operatorDelete @Helium 0x1a0f10.
    HGObject.operatorDelete(this);
  }
}
