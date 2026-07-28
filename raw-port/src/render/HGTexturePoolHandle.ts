// HGTexturePoolHandle.ts — FCP Helium framework class.
// Transcribed from the x86_64 disassembly of Helium in
// /Applications/Final Cut Pro.app/Contents/Frameworks/Helium.framework/
// Versions/A/Helium (see raw-port/re/disasm/Helium.HGTexturePoolHandle.*.s).
//
// Symbols (nm -arch x86_64 | c++filt):
//   0x00043e50 T __ZN19HGTexturePoolHandleC2Ev  HGTexturePoolHandle::HGTexturePoolHandle() (C2)
//   0x00043e70 T __ZN19HGTexturePoolHandleD2Ev  HGTexturePoolHandle::~HGTexturePoolHandle() (D2 base dtor)
//   0x003c16b0 T __ZN19HGTexturePoolHandleD1Ev  HGTexturePoolHandle::~HGTexturePoolHandle() (D1 complete dtor)
//   0x003c16c0 T __ZN19HGTexturePoolHandleD0Ev  HGTexturePoolHandle::~HGTexturePoolHandle() (D0 deleting dtor)
//
// Also emitted by nm as aliases pointing to the same code (ICF-folded):
//   0x000415b0 __ZN19HGTexturePoolHandleC2Ev  (aliases C2 body at 0x43e50)
//   0x000415d0 __ZN19HGTexturePoolHandleD2Ev  (aliases D2 body at 0x43e70)
//   0x00316030 __ZN19HGTexturePoolHandleD1Ev  (aliases D1 body at 0x3c16b0)
//   0x00316034 __ZN19HGTexturePoolHandleD0Ev  (aliases D0 body at 0x3c16c0)
//
// PROVENANCE / DECODE:
//   raw-port/re/disasm/Helium.HGTexturePoolHandle.HGTexturePoolHandle.s   (C2 body)
//   raw-port/re/disasm/Helium.HGTexturePoolHandle.~HGTexturePoolHandle.s (D0 body — ud2)
//   D1/D2 read via `xcrun llvm-objdump --arch=x86_64 --macho -d` on the fat
//   binary (both were hidden by ICF from disasm.sh's otool-based path).
//   Referenced externs:
//     __ZTV19HGTexturePoolHandle    vtable for HGTexturePoolHandle   (Helium __DATA_CONST @0xa074c8)
//     __ZN8HGObjectC2Ev             HGObject::HGObject()             (Helium @0x1a0e50)
//     __ZN8HGObjectD2Ev             HGObject::~HGObject()            (Helium @0x1a0ed0)
//
// ── CLASS SHAPE ──────────────────────────────────────────────────────────
// HGTexturePoolHandle is a minimal reference-counted handle class that
// inherits publicly from HGObject.  The only work done by the ctor is:
//   1. Delegate to HGObject::HGObject() to run the refcount/object base
//      construction on the shared subobject at offset 0.
//   2. Install its own vptr at +0x00, overwriting the HGObject vptr that
//      HGObject::HGObject() planted.  The installed value is
//      &__ZTV19HGTexturePoolHandle + 0x10 — i.e. the address of the
//      first virtual function slot (past the Itanium-ABI RTTI+top-of-
//      object slots).
//
// The class carries NO extra instance fields beyond the HGObject base:
//   +0x00  vptr : HGTexturePoolHandle_vtable*   (installed to &VT+0x10)
//   +0x08  ...   : HGObject subobject tail (opaque; HGObject C2 owns it)
//
// Confirmed by re-reading the C2 body @0x43e50: no store other than
// the vptr install at 0x43e65 (`movq %rax, (%rbx)`).  All state actually
// managed by this handle lives in a sibling `HGTexturePoolHandleImpl`
// (nm symbols 0x415fc..0x41814) — HGTexturePoolHandle itself is only
// the ABI-visible handle shell.
//
// ── DESTRUCTORS ──────────────────────────────────────────────────────────
// D2 @0x43e70 : the *base subobject destructor*.  It does NOT reinstall
//   an HGObject vptr (unusual — but only because the class has NO virtual
//   methods that D2 needs to guard against calling; the leaf vtable is
//   fine to keep during base destruction).  Body is just:
//     pushq %rbp ; movq %rsp,%rbp ; popq %rbp
//     jmp   __ZN8HGObjectD2Ev            ## tail-call HGObject::~HGObject()
//
// D1 @0x3c16b0 : `pushq %rbp ; movq %rsp,%rbp ; ud2`.
// D0 @0x3c16c0 : `pushq %rbp ; movq %rsp,%rbp ; ud2`.
//   Both the complete-object dtor (D1) and the deleting dtor (D0) are
//   `ud2` — an intentional guard placed by the compiler to trap execution
//   if anything ever tries to delete or complete-destroy an
//   HGTexturePoolHandle through this dispatch.  In practice this class
//   is only ever cleaned up via the base subobject destructor (D2) from
//   the enclosing owner (HGRef<HGTexturePoolHandle> / the Impl subclass'
//   own D0), so D1/D0 exist purely as vtable slot fillers and trap on
//   accidental invocation.
//
// Because D1/D0 are trap slots, we model them here as functions that
// throw — matching the runtime behaviour of the `ud2` (SIGILL) exactly
// in intent.
//
// ── HGObject frontier ───────────────────────────────────────────────────
// HGObject itself is not yet transcribed in this port; the C2/D2
// wrappers are imported from ./HGObject_stub.js and will throw when
// executed.  Constructing a real HGTexturePoolHandle instance therefore
// currently fails at the HGObject::HGObject() call site — a correct,
// cited failure mode (decode-before-implement).

import { HGObject_ctor, HGObject_dtor } from "./HGObject_stub.js";

/**
 * Runtime shape of an HGTexturePoolHandle instance.  Layout matches
 * the recovered struct above; the HGObject subobject tail is opaque
 * so we represent it via `hgObjectSubobject`.  The `vptr` field
 * carries a string tag to make the vtable install observable in
 * tests without leaking a real function-pointer table.
 */
export interface HGTexturePoolHandleInstance {
  /**
   * Installed by C2 @0x43e65 to `&__ZTV19HGTexturePoolHandle + 0x10`
   * (Helium x86_64 slice: vtable @0xa074c8 → first-vfunc-slot @0xa074d8).
   * The tag string is a JS-side stand-in for that address — the
   * runtime never dispatches through it because this class has no
   * decoded virtual methods and the D1/D0 slots are `ud2` traps.
   */
  vptr: "HGTexturePoolHandle::__vtable+0x10 @Helium 0xa074d8";
  /** Opaque HGObject subobject (owned by HGObject::HGObject()/~HGObject()). */
  hgObjectSubobject: object;
}

/**
 * HGTexturePoolHandle::HGTexturePoolHandle()  —  Helium @0x43e50 (C2 base ctor).
 *
 * Faithful mirror of the disassembly at raw-port/re/disasm/
 * Helium.HGTexturePoolHandle.HGTexturePoolHandle.s:
 *
 *   0x43e50  pushq %rbp
 *   0x43e51  movq  %rsp, %rbp
 *   0x43e54  pushq %rbx
 *   0x43e55  pushq %rax                        ; 16-byte stack align
 *   0x43e56  movq  %rdi, %rbx                  ; %rbx = this
 *   0x43e59  callq __ZN8HGObjectC2Ev           ; HGObject::HGObject(this) @Helium 0x1a0e50
 *   0x43e5e  leaq  0x9c3673(%rip), %rax        ; %rax = &__ZTV19HGTexturePoolHandle + 0x10
 *                                              ;      = 0x43e65 + 0x9c3673 = 0xa074d8
 *                                              ;      (vtable @0xa074c8 + 0x10 first-vfunc-slot)
 *   0x43e65  movq  %rax, (%rbx)                ; this->vptr = &VT+0x10   (overwrites HGObject vptr)
 *   0x43e68  addq  $0x8, %rsp
 *   0x43e6c  popq  %rbx
 *   0x43e6d  popq  %rbp
 *   0x43e6e  retq
 *
 * Behaviour: run base HGObject construction on `self`, then install
 * this class's vptr.  No other fields are touched — HGTexturePoolHandle
 * carries no state beyond the HGObject subobject.
 */
export function HGTexturePoolHandle_ctor(
  self: Partial<HGTexturePoolHandleInstance> & { hgObjectSubobject?: object }
): asserts self is HGTexturePoolHandleInstance {
  // 0x43e59  callq HGObject::HGObject() — currently a throwing frontier stub.
  // Ensure the HGObject subobject exists as a distinct object identity so
  // downstream dtor code can operate on it.
  if (self.hgObjectSubobject === undefined) {
    self.hgObjectSubobject = {};
  }
  HGObject_ctor(self.hgObjectSubobject);

  // 0x43e5e  leaq  __ZTV19HGTexturePoolHandle+0x10(%rip), %rax
  // 0x43e65  movq  %rax, (%rbx)          ; install vptr
  self.vptr = "HGTexturePoolHandle::__vtable+0x10 @Helium 0xa074d8";
}

/**
 * HGTexturePoolHandle::~HGTexturePoolHandle()  —  Helium @0x43e70 (D2 base dtor).
 *
 * Body (from `xcrun llvm-objdump --arch=x86_64 --macho -d` on the fat
 * binary — this address is ICF-hidden from otool's default view):
 *
 *   0x43e70  pushq %rbp
 *   0x43e71  movq  %rsp, %rbp
 *   0x43e74  popq  %rbp
 *   0x43e75  jmp   __ZN8HGObjectD2Ev            ; tail-call HGObject::~HGObject(this) @Helium 0x1a0ed0
 *
 * D2 is the *base* subobject destructor: it does NOT re-install an
 * HGObject vptr before delegating.  That is only safe because
 * HGTexturePoolHandle publishes no decoded virtual methods and its
 * vtable's D1/D0 slots are `ud2` traps — nothing dispatches through
 * the object during base destruction.
 */
export function HGTexturePoolHandle_dtor(
  self: HGTexturePoolHandleInstance
): void {
  // 0x43e75  jmp __ZN8HGObjectD2Ev — tail-call into the base dtor.
  HGObject_dtor(self.hgObjectSubobject);
}

/**
 * HGTexturePoolHandle::~HGTexturePoolHandle()  —  Helium @0x3c16b0 (D1 complete dtor).
 *
 * Body:
 *   0x3c16b0  pushq %rbp
 *   0x3c16b1  movq  %rsp, %rbp
 *   0x3c16b4  ud2
 *
 * The complete-object dtor is a compiler-inserted `ud2` trap slot.
 * The class is never destroyed through D1 in practice (the enclosing
 * owner uses D2 or the Impl subclass' own D0); this slot exists only
 * to fill the vtable and to SIGILL on accidental invocation.  We
 * mirror the trap by throwing, citing the @0xADDR of the `ud2`.
 */
export function HGTexturePoolHandle_complete_dtor(
  _self: HGTexturePoolHandleInstance
): never {
  // 0x3c16b4  ud2 — deliberate trap slot; not yet transcribed via a real
  // path because none exists in the decoded call graph.  Cited @0x3c16b4.
  throw new Error(
    "HGTexturePoolHandle::~HGTexturePoolHandle() D1 is a ud2 trap slot " +
    "@Helium 0x3c16b4 — the complete-object dtor is intentionally never " +
    "invoked; use HGTexturePoolHandle_dtor (D2 @0x43e70) instead."
  );
}

/**
 * HGTexturePoolHandle::~HGTexturePoolHandle()  —  Helium @0x3c16c0 (D0 deleting dtor).
 *
 * Body:
 *   0x3c16c0  pushq %rbp
 *   0x3c16c1  movq  %rsp, %rbp
 *   0x3c16c4  ud2
 *
 * The deleting dtor is a compiler-inserted `ud2` trap slot for the same
 * reason as D1: HGTexturePoolHandle is never heap-deleted through
 * `delete p` on a base-class pointer; ownership is external
 * (HGRef<HGTexturePoolHandle> and the Impl subclass' own D0 do the real
 * cleanup).  We mirror the trap by throwing, citing the @0xADDR of the
 * `ud2`.
 */
export function HGTexturePoolHandle_deleting_dtor(
  _self: HGTexturePoolHandleInstance
): never {
  // 0x3c16c4  ud2 — deliberate trap slot; not yet transcribed via a real
  // path because none exists in the decoded call graph.  Cited @0x3c16c4.
  throw new Error(
    "HGTexturePoolHandle::~HGTexturePoolHandle() D0 is a ud2 trap slot " +
    "@Helium 0x3c16c4 — the deleting dtor is intentionally never invoked; " +
    "HGTexturePoolHandle is not heap-deleted through this slot."
  );
}
