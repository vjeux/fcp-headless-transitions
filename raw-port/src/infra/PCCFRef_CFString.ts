// PCCFRef<CFStringRef> — ProCore RAII smart-pointer over a CoreFoundation
// CFStringRef (the const `__CFString *` handle). This file ports ONLY the
// D1 (complete-object) destructor at @Ozone 0x406f0; ctor, copy, and D2/D0
// variants are separate ledger entries and will be added when their units
// are claimed.
//
// Provenance: /Applications/Final Cut Pro.app/Contents/Frameworks/
//             Ozone.framework/Versions/A/Ozone (x86_64 slice;
//             unadjusted VAs from `otool -tV`).
//
// Disassembly source:
//   raw-port/re/disasm/__ZN7PCCFRefIPK10__CFStringED1Ev.s
//
// -----------------------------------------------------------------------------
// STRUCT LAYOUT (recovered from the D1 body)
// -----------------------------------------------------------------------------
// PCCFRef<CFStringRef> {
//   +0x00  handle : CFStringRef            (a `const __CFString *` — the
//                                           only slot; the dtor reads it
//                                           @0x406f4 and CFReleases it if
//                                           non-null.)
// }
// sizeof(PCCFRef<CFStringRef>) = 8 (just the pointer). Matches the twin
// PCCFRef<CFDataRef>/PCCFRef<CFArrayRef> layouts in this directory;
// PCCFRef<T> is a size-8 handle regardless of T.
//
// This is the standard Cocoa/CoreFoundation smart-ptr pattern
// (equivalent to `boost::intrusive_ptr` specialised to CF): construction
// takes a CF retain (or absorbs an already-retained handle), destruction
// releases exactly once.
//
// The D1 (complete-object destructor) variant here is emitted by clang as
// a thin wrapper around the release path. On a trivial base with no
// virtual bases and no member subobjects with non-trivial dtors, D1 and
// D2 collapse to the same body: this D1 body is bit-identical in shape
// to the PCCFRef<CFDataRef> D2 body in PCCFRef_CFData.ts (three code
// bytes differ — the function's own address).
//
// -----------------------------------------------------------------------------
// FRONTIER CALLEES (all TRUE OUT-OF-SCOPE externs)
// -----------------------------------------------------------------------------
//   * _CFRelease — CoreFoundation.framework — TRUE out-of-scope extern.
//     Called @0x406fc via Ozone stub 0x6dc810. Decrements the CF retain
//     count; when it reaches 0 the string is deallocated by CoreFoundation.
//     Standard boundary-stub policy: modelled as a JS no-op (JS GC handles
//     our surrogate) — same as the sibling PCCFRef<CFDataRef>/
//     <CFArrayRef>/<CFDictionaryRef> ports.
//   * ___clang_call_terminate — Itanium ABI exception personality tail
//     call at @0x40706. Reached ONLY on unwind (CFRelease throwing is
//     essentially impossible; the landing pad exists to satisfy the
//     dtor's ABI). Not a normal callee; documented for completeness.
//
// -----------------------------------------------------------------------------
// Symbol ported here (mangled -> address)
// -----------------------------------------------------------------------------
//   * __ZN7PCCFRefIPK10__CFStringED1Ev
//       — PCCFRef<CFStringRef>::~PCCFRef() [D1 complete-object] @Ozone 0x406f0
//
// -----------------------------------------------------------------------------
// FULL DISASM (raw-port/re/disasm/__ZN7PCCFRefIPK10__CFStringED1Ev.s)
// -----------------------------------------------------------------------------
//   0x406f0  pushq  %rbp
//   0x406f1  movq   %rsp, %rbp
//   0x406f4  movq   (%rdi), %rdi                    ; rdi = this->handle
//                                                   ; (field read and the
//                                                   ; CFRelease arg both
//                                                   ; land in %rdi — SysV
//                                                   ; ABI arg reg reuse:
//                                                   ; on entry %rdi is
//                                                   ; `this`, then it is
//                                                   ; overwritten with
//                                                   ; the loaded handle.)
//   0x406f7  testq  %rdi, %rdi                      ; handle == NULL ?
//   0x406fa  je     0x40701                         ; yes -> skip release
//   0x406fc  callq  _CFRelease                      ; CoreFoundation stub 0x6dc810
//   0x40701  popq   %rbp
//   0x40702  retq
//   ------------ landing pad (unwind path, unreachable normally) ------------
//   0x40703  movq   %rax, %rdi
//   0x40706  callq  ___clang_call_terminate
//   0x4070b  nopl   (%rax,%rax)                     ; 6-byte alignment nop

// ═════════════════════════════════════════════════════════════════════════
// Opaque CFStringRef surrogate.
// The real CoreFoundation `const __CFString *` is a private struct
// pointer; the port never needs to inspect its bytes — only to
// CFRetain/CFRelease it via the frontier stubs. We therefore model it as
// an opaque handle. The existing PCString.ts models CFString's VALUE
// content (character data) via a different surrogate; that is a
// deliberately separate concern — PCCFRef is a raw retain/release box,
// not a string reader.
// ═════════════════════════════════════════════════════════════════════════

/** Opaque CoreFoundation string handle (a `const __CFString *`). The
 *  bytes behind it are private to CoreFoundation; we only pass it back
 *  through CF boundary stubs. */
export interface CFStringRef {
  readonly __cf_string_brand: unique symbol;
}

/**
 * `_CFRelease(CFTypeRef)` — CoreFoundation.framework extern (called via
 * Ozone stub 0x6dc810 from ~PCCFRef @0x406fc). TRUE out-of-scope extern.
 *
 * In the native binary this decrements the CF retain count and (when it
 * reaches 0) invokes the class's `finalize` callback. The JS surrogate
 * has no CF runtime — the "release" is a no-op; the underlying JS handle
 * becomes unreachable when the class instance is GC'd. Documented here
 * so a future parity harness can hook the boundary. Matches the
 * boundary-stub policy used by PCCFRef_CFData / PCCFRef_CFArray /
 * PCCFRef_CFDictionary.
 */
function CFRelease(_cf: CFStringRef): void {
  // JS surrogate: no-op. See file header for policy discussion.
}

// ═════════════════════════════════════════════════════════════════════════
// The class
// ═════════════════════════════════════════════════════════════════════════

/**
 * `PCCFRef<CFStringRef>` — ProCore RAII wrapper around a CFStringRef. The
 * class owns a single CoreFoundation retain on construction and releases
 * it exactly once on destruction. Only the D1 (complete-object)
 * destructor is ported in this file.
 */
export class PCCFRef_CFString {
  /** +0x00 — the wrapped CFStringRef (may be NULL). Read by the D1 body
   *  @Ozone 0x406f4; NULL short-circuits the release. */
  handle: CFStringRef | null = null;

  /**
   * `PCCFRef<CFStringRef>::~PCCFRef()` [D1 complete-object] — @Ozone 0x406f0
   * (__ZN7PCCFRefIPK10__CFStringED1Ev).
   *
   * Faithful line-for-line transcription of the disassembly above.
   * Standard CoreFoundation smart-ptr release:
   *   1. Read this->handle.
   *   2. If NULL -> return (no retain to release).
   *   3. Else CFRelease(handle) and return.
   *
   * Note: the D1 flavour here does NOT null-out `this->handle` after the
   * release. clang folds D1 into a body that only performs the release;
   * any post-destruction access to the slot is UB by definition (the
   * containing object has been destroyed), so there is nothing to clear.
   * This matches the twin PCCFRef<CFDataRef>::destructBase() body.
   */
  destruct(): void {
    // @0x406f0..0x406f1 — prologue.
    // @0x406f4 — rdi = this->handle (both the field read and the CFRelease
    //            argument register — compiler folded them because SysV ABI
    //            passes arg 1 in %rdi and %rdi already holds `this` on
    //            entry, then is overwritten with the loaded value).
    const cf = this.handle;
    // @0x406f7..0x406fa — testq/je: NULL-check.
    if (cf === null) {
      // @0x40701..0x40702 — retq. Nothing to release.
      return;
    }
    // @0x406fc — callq _CFRelease (Ozone stub 0x6dc810).
    CFRelease(cf);
    // @0x40701..0x40702 — retq.
  }
}
