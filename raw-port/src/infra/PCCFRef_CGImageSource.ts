// PCCFRef<CGImageSourceRef> — ProCore RAII smart-pointer over a CoreGraphics
// `CGImageSourceRef`. This file ports ONLY the D2 base destructor at
// @ProCore 0x69496; the ctor and copy paths are separate ledger entries and will
// be added here when their units are claimed.
//
// Provenance: /Applications/Final Cut Pro.app/Contents/Frameworks/
//             ProCore.framework/Versions/A/ProCore (x86_64 slice;
//             unadjusted VAs from `otool -tV`).
//
// Disassembly source:
//   raw-port/re/disasm/ProCore.__ZN7PCCFRefIP13CGImageSourceED2Ev.s
//
// This is the CGImageSource member of the landed PCCFRef family —
// raw-port/src/infra/PCCFRef_CFArray.ts, PCCFRef_CFData.ts,
// PCCFRef_CFDictionary.ts, PCCFRef_CFString.ts, PCCFRef_CVBuffer.ts — and it
// follows their file layout deliberately, because the instantiations really are
// the same body over a different handle type.
//
// -----------------------------------------------------------------------------
// STRUCT LAYOUT (recovered from the D2 body)
// -----------------------------------------------------------------------------
// PCCFRef<CGImageSourceRef> {
//   +0x00  handle : CGImageSourceRef      (the only slot; the dtor reads it
//                                          @0x6949a and CFReleases it when
//                                          non-null.)
// }
// sizeof = 8 (just the pointer), matching every landed sibling: PCCFRef<T> is a
// size-8 handle regardless of T.
//
// -----------------------------------------------------------------------------
// FRONTIER CALLEES (all TRUE OUT-OF-SCOPE externs)
// -----------------------------------------------------------------------------
//   * _CFRelease — CoreFoundation.framework — TRUE out-of-scope extern, called
//     @0x694a2 via ProCore stub 0xde012 (the same stub the CFData/CFArray
//     siblings use). Decrements the CF retain count; at zero CoreFoundation
//     deallocates. Standard boundary-stub policy: a JS no-op.
//   * ___clang_call_terminate — the Itanium-ABI landing pad at @0x694ac, reached
//     ONLY on unwind. Not a normal callee, and not modelled.
//
// -----------------------------------------------------------------------------
// Symbol ported here (mangled -> address)
// -----------------------------------------------------------------------------
//   * __ZN7PCCFRefIP13CGImageSourceED2Ev
//       — PCCFRef<CGImageSourceRef>::~PCCFRef() [D2 base] @ProCore 0x69496
//
// -----------------------------------------------------------------------------
// FULL DISASM (the entire function)
// -----------------------------------------------------------------------------
//   0x69496  pushq  %rbp
//   0x69497  movq   %rsp, %rbp
//   0x6949a  movq   (%rdi), %rdi        ; rdi = this->handle  (the field read and
//                                       ; the CFRelease argument land in the same
//                                       ; register — SysV passes arg 1 in %rdi and
//                                       ; %rdi already held `this`)
//   0x6949d  testq  %rdi, %rdi          ; handle == NULL ?
//   0x694a0  je     0x694a7              ; yes -> skip the release
//   0x694a2  callq  0xde012              ## symbol stub for: _CFRelease
//   0x694a7  popq   %rbp
//   0x694a8  retq
//   ------------ landing pad (unwind path, unreachable normally) ------------
//   0x694a9  movq   %rax, %rdi
//   0x694ac  callq  ___clang_call_terminate
//   0x694b1  nop
//
// -----------------------------------------------------------------------------
// ORACLE
// -----------------------------------------------------------------------------
// raw-port/re/oracle/PCCFRef_CGImageSource_D2_oracle.py calls the LIVE
// destructor. The symbol is LOCAL (`nm` type `t` — a template instantiation), so
// dlsym cannot reach it; it is called at `dyld slide + 0x69496` through
// ozone_loader.py, under `arch -x86_64`. The externally visible consequence of
// this body is a CoreFoundation retain count, so that is what is measured: over
// 32 trials on REAL CF objects retained to a known count, the count dropped by
// EXACTLY one every time (32/32) — which excludes both a double release and no
// release at all — a NULL handle was a no-op and did not crash, and the field at
// +0x00 was NOT nulled afterwards (0/32), confirming the sibling files' note
// that clearing the slot is the D0/D1 flavour's job, not D2's.
// The type parameter is irrelevant to this body — it CFReleases an opaque
// pointer — so the harness stands a CFString in for a CGImageSourceRef; that
// substitution is stated in the harness rather than hidden, and it is what lets
// the retain count be observed without building an image source.

// ═════════════════════════════════════════════════════════════════════════
// Opaque CGImageSourceRef surrogate.
// The real CoreGraphics `CGImageSource *` is a private struct pointer; this
// port never inspects its bytes — it only passes the handle back through the
// CF boundary stub. Modelled as an opaque branded handle, exactly as the
// landed PCCFRef_CFData.ts models CFDataRef.
// ═════════════════════════════════════════════════════════════════════════

/** Opaque CoreGraphics image-source handle (a `CGImageSource *`). */
export interface CGImageSourceRef {
  readonly __cg_image_source_brand: unique symbol;
}

/**
 * `_CFRelease(CFTypeRef)` — CoreFoundation.framework extern, called via ProCore
 * stub 0xde012 from ~PCCFRef @0x694a2. TRUE out-of-scope extern.
 *
 * In the native binary this decrements the CF retain count and, at zero, lets
 * CoreFoundation deallocate the object — measured here: the count drops by
 * exactly one per destructor call. The JS surrogate has no CF runtime, so the
 * release is a no-op and the handle becomes unreachable when the wrapper is
 * garbage-collected. Kept as a named function so the call site's provenance
 * survives and a future parity harness can hook the boundary.
 */
function CFRelease(_cf: CGImageSourceRef): void {
  // @ProCore stub 0xde012 — CoreFoundation extern; JS surrogate: no-op.
}

// ═════════════════════════════════════════════════════════════════════════
// The class
// ═════════════════════════════════════════════════════════════════════════

/**
 * `PCCFRef<CGImageSourceRef>` — ProCore RAII wrapper around a CGImageSourceRef.
 * The class owns a single CoreFoundation retain and releases it exactly once on
 * destruction. Only the destructor is ported in this file.
 */
export class PCCFRef_CGImageSource {
  /** +0x00 — the wrapped CGImageSourceRef (may be NULL). Read by the D2 body
   *  @ProCore 0x6949a; NULL short-circuits the release. */
  handle: CGImageSourceRef | null = null;

  /**
   * `PCCFRef<CGImageSourceRef>::~PCCFRef()` [D2 base] — @ProCore 0x69496
   * (__ZN7PCCFRefIP13CGImageSourceED2Ev).
   *
   * Faithful line-for-line transcription of the disassembly in the file header:
   *   1. read `this->handle`;
   *   2. if NULL, return — there is no retain to release;
   *   3. otherwise CFRelease it and return.
   *
   * The D2 flavour does NOT null out `this->handle` afterwards — measured on the
   * live function, 0 of 32 trials cleared the slot. That is the D0/D1 variant's
   * job; a base-subobject destructor only has to drop the reference, since the
   * containing object is about to be destroyed anyway.
   */
  destructBase(): void {
    // @0x69496..@0x69497 — prologue.
    // @0x6949a — movq (%rdi), %rdi : rdi = this->handle (field read and
    //   CFRelease argument in the same register).
    const cf = this.handle;
    // @0x6949d/@0x694a0 — testq %rdi,%rdi ; je : the NULL short-circuit.
    if (cf === null) {
      // @0x694a7..@0x694a8 — popq/retq. Nothing to release.
      return;
    }
    // @0x694a2 — callq _CFRelease (ProCore stub 0xde012).
    CFRelease(cf);
    // @0x694a7..@0x694a8 — popq/retq.
  }
}
