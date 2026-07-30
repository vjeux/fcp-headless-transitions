// PCCFRef<__CFString const*> — ProCore RAII smart-pointer over a
// CoreFoundation CFStringRef (the `const __CFString *` handle). This file
// ports the D1 complete-object destructor at @Ozone 0x406f0. The ctor
// and copy paths are separate ledger entries and will be added to this
// file when their own units are claimed.
//
// Provenance: /Applications/Final Cut Pro.app/Contents/Frameworks/
//             Ozone.framework/Versions/A/Ozone (x86_64 slice; unadjusted
//             VAs from `otool -tV`).
//
// Disassembly source:
//   raw-port/re/disasm/__ZN7PCCFRefIPK10__CFStringED1Ev.s
//
// -----------------------------------------------------------------------------
// STRUCT LAYOUT (recovered from the D1 body)
// -----------------------------------------------------------------------------
// PCCFRef<CFStringRef const*> {
//   +0x00  handle : CFStringRef           (a `const __CFString *` — the
//                                          only slot; the dtor reads it
//                                          @0x406f4 and CFReleases it if
//                                          non-null.)
// }
// sizeof(PCCFRef<CFStringRef>) = 8 (just the pointer).
//
// Standard CoreFoundation smart-ptr pattern (analogous to the sibling
// `PCCFRef_CFArray` / `PCCFRef_CFData` / `PCCFRef_CFDictionary` — this
// class is the CFString instantiation of the same template).
//
// -----------------------------------------------------------------------------
// FRONTIER CALLEES (all TRUE OUT-OF-SCOPE externs)
// -----------------------------------------------------------------------------
//   * _CFRelease  — CoreFoundation.framework — TRUE out-of-scope extern.
//     Called @0x406fc via Ozone stub 0x6dc810. Decrements the CF retain
//     count of the string; when it reaches 0 CoreFoundation deallocates
//     the string. Standard boundary-stub policy: modelled as a JS no-op
//     (JS GC handles our surrogate).
//   * ___clang_call_terminate — Itanium ABI exception personality tail
//     call at @0x40706. Reached ONLY on unwind (CFRelease throwing is
//     essentially impossible; the landing pad exists to satisfy the
//     dtor's ABI). Not a normal callee.
//
// -----------------------------------------------------------------------------
// Symbols ported here (mangled → address)
// -----------------------------------------------------------------------------
//   * __ZN7PCCFRefIPK10__CFStringED1Ev
//       — PCCFRef<__CFString const*>::~PCCFRef() [D1 complete] @Ozone 0x406f0
//
// -----------------------------------------------------------------------------
// FULL DISASM (raw-port/re/disasm/__ZN7PCCFRefIPK10__CFStringED1Ev.s)
// -----------------------------------------------------------------------------
//   0x406f0  pushq  %rbp
//   0x406f1  movq   %rsp, %rbp
//   0x406f4  movq   (%rdi), %rdi                   ; rdi = this->handle
//                                                  ; (both the field read
//                                                  ; and the CFRelease arg
//                                                  ; land in %rdi — the
//                                                  ; System-V ABI arg reg
//                                                  ; already holds `this`)
//   0x406f7  testq  %rdi, %rdi                     ; handle == NULL ?
//   0x406fa  je     0x40701                        ; yes → skip release
//   0x406fc  callq  _CFRelease                     ; Ozone stub 0x6dc810
//   0x40701  popq   %rbp
//   0x40702  retq
//   ------------ landing pad (unwind path, unreachable normally) ------------
//   0x40703  movq   %rax, %rdi
//   0x40706  callq  ___clang_call_terminate

// ═════════════════════════════════════════════════════════════════════════
// Opaque CFStringRef surrogate.
// The real CoreFoundation `const __CFString *` is a tagged pointer whose
// contents are private; the port never needs to inspect its bytes — only
// to CFRetain / CFRelease it via the frontier stubs. We therefore model
// it as an opaque handle type.
// ═════════════════════════════════════════════════════════════════════════

/** Opaque CoreFoundation string handle (a `const __CFString *`). The bytes
 *  behind it are private to CoreFoundation; we only ever pass it back
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
 * so a future parity harness can hook the boundary.
 */
function CFRelease(_cf: CFStringRef): void {
  // JS surrogate: no-op. See the file header for policy discussion.
}

// ═════════════════════════════════════════════════════════════════════════
// The class
// ═════════════════════════════════════════════════════════════════════════

/**
 * `PCCFRef<CFStringRef>` — ProCore RAII wrapper over a CFStringRef. The
 * class owns a single CoreFoundation retain on construction and releases
 * it exactly once on destruction. Only the D1 destructor is ported in
 * this file.
 */
export class PCCFRef_CFString {
  /** +0x00 — the wrapped CFStringRef (may be NULL). Read by the D1 body
   *  @Ozone 0x406f4; NULL short-circuits the release. */
  handle: CFStringRef | null = null;

  /**
   * `PCCFRef<__CFString const*>::~PCCFRef()` [D1 complete] — @Ozone 0x406f0
   * (__ZN7PCCFRefIPK10__CFStringED1Ev).
   *
   * Faithful line-for-line transcription of the disassembly above.
   * Standard CoreFoundation smart-ptr release:
   *   1. Read this->handle.
   *   2. If NULL → return (no retain to release).
   *   3. Else CFRelease(handle) and return.
   *
   * D1 (complete-object) is called when a stack-allocated or explicitly-
   * deleted instance goes away. Since this class has no virtual base,
   * D1 and D2 have the same body — only the D1 variant is emitted by
   * the compiler into the Ozone translation unit and therefore this is
   * the only variant that lands in this file.
   */
  destructComplete(): void {
    // @0x406f0..0x406f1 — prologue.
    // @0x406f4 — rdi = this->handle (both the field read and the CFRelease
    //            argument register — the compiler folded them because the
    //            System-V ABI passes arg 1 in %rdi and %rdi already holds
    //            `this`).
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
