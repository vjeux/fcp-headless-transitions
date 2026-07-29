// PCCFRef<CFDataRef> — ProCore RAII smart-pointer over a CoreFoundation
// CFDataRef (the const `__CFData *` handle). This file ports ONLY the
// D2 base destructor at @ProCore 0x9c970; ctor and copy paths are
// separate ledger entries and will be added here when their units are
// claimed.
//
// Provenance: /Applications/Final Cut Pro.app/Contents/Frameworks/
//             ProCore.framework/Versions/A/ProCore (x86_64 slice;
//             unadjusted VAs from `otool -tV`).
//
// Disassembly source:
//   raw-port/re/disasm/ProCore.__ZN7PCCFRefIPK8__CFDataED2Ev.s
//
// -----------------------------------------------------------------------------
// STRUCT LAYOUT (recovered from the D2 body)
// -----------------------------------------------------------------------------
// PCCFRef<CFDataRef const*> {
//   +0x00  handle : CFDataRef             (a `const __CFData *` — the
//                                          only slot; the dtor reads it
//                                          @0x9c974 and CFReleases it if
//                                          non-null.)
// }
// sizeof(PCCFRef<CFDataRef>) = 8 (just the pointer). This matches the
// twin PCCFRef<CFArrayRef> layout in raw-port/src/infra/PCCFRef_CFArray.ts;
// PCCFRef<T> is a size-8 handle regardless of T.
//
// This is the standard Cocoa/CoreFoundation smart-ptr pattern
// (equivalent to `boost::intrusive_ptr` specialised to CF): construction
// takes a CF retain (or absorbs an already-retained handle), destruction
// releases exactly once.
//
// -----------------------------------------------------------------------------
// FRONTIER CALLEES (all TRUE OUT-OF-SCOPE externs)
// -----------------------------------------------------------------------------
//   * _CFRelease — CoreFoundation.framework — TRUE out-of-scope extern.
//     Called @0x9c97c via ProCore stub 0xde012. Decrements the CF retain
//     count; when it reaches 0 the data is deallocated by CoreFoundation.
//     Standard boundary-stub policy: modelled as a JS no-op (JS GC handles
//     our surrogate) — same as the PCCFRef<CFArrayRef> port.
//   * ___clang_call_terminate — Itanium ABI exception personality tail
//     call at @0x9c986. Reached ONLY on unwind (CFRelease throwing is
//     essentially impossible; the landing pad exists to satisfy the
//     dtor's ABI). Not a normal callee.
//
// -----------------------------------------------------------------------------
// Symbol ported here (mangled -> address)
// -----------------------------------------------------------------------------
//   * __ZN7PCCFRefIPK8__CFDataED2Ev
//       — PCCFRef<CFDataRef>::~PCCFRef() [D2 base] @ProCore 0x9c970
//
// -----------------------------------------------------------------------------
// FULL DISASM (raw-port/re/disasm/ProCore.__ZN7PCCFRefIPK8__CFDataED2Ev.s)
// -----------------------------------------------------------------------------
//   0x9c970  pushq  %rbp
//   0x9c971  movq   %rsp, %rbp
//   0x9c974  movq   (%rdi), %rdi                    ; rdi = this->handle
//                                                   ; (both the field read
//                                                   ; and the CFRelease arg
//                                                   ; land in %rdi — SysV
//                                                   ; ABI arg reg reuse)
//   0x9c977  testq  %rdi, %rdi                      ; handle == NULL ?
//   0x9c97a  je     0x9c981                         ; yes -> skip release
//   0x9c97c  callq  _CFRelease                      ; CoreFoundation stub 0xde012
//   0x9c981  popq   %rbp
//   0x9c982  retq
//   ------------ landing pad (unwind path, unreachable normally) ------------
//   0x9c983  movq   %rax, %rdi
//   0x9c986  callq  ___clang_call_terminate

// ═════════════════════════════════════════════════════════════════════════
// Opaque CFDataRef surrogate.
// The real CoreFoundation `const __CFData *` is a private struct pointer;
// the port never needs to inspect its bytes — only to CFRetain/CFRelease
// it via the frontier stubs. We therefore model it as an opaque handle.
// ═════════════════════════════════════════════════════════════════════════

/** Opaque CoreFoundation data handle (a `const __CFData *`). The bytes
 *  behind it are private to CoreFoundation; we only pass it back through
 *  CF boundary stubs. */
export interface CFDataRef {
  readonly __cf_data_brand: unique symbol;
}

/**
 * `_CFRelease(CFTypeRef)` — CoreFoundation.framework extern (called via
 * ProCore stub 0xde012 from ~PCCFRef @0x9c97c). TRUE out-of-scope extern.
 *
 * In the native binary this decrements the CF retain count and (when it
 * reaches 0) invokes the class's `finalize` callback. The JS surrogate
 * has no CF runtime — the "release" is a no-op; the underlying JS handle
 * becomes unreachable when the class instance is GC'd. Documented here
 * so a future parity harness can hook the boundary.
 */
function CFRelease(_cf: CFDataRef): void {
  // JS surrogate: no-op. See file header for policy discussion.
}

// ═════════════════════════════════════════════════════════════════════════
// The class
// ═════════════════════════════════════════════════════════════════════════

/**
 * `PCCFRef<CFDataRef>` — ProCore RAII wrapper around a CFDataRef. The
 * class owns a single CoreFoundation retain on construction and releases
 * it exactly once on destruction. Only the destructor is ported in this
 * file.
 */
export class PCCFRef_CFData {
  /** +0x00 — the wrapped CFDataRef (may be NULL). Read by the D2 body
   *  @ProCore 0x9c974; NULL short-circuits the release. */
  handle: CFDataRef | null = null;

  /**
   * `PCCFRef<CFDataRef>::~PCCFRef()` [D2 base] — @ProCore 0x9c970
   * (__ZN7PCCFRefIPK8__CFDataED2Ev).
   *
   * Faithful line-for-line transcription of the disassembly above.
   * Standard CoreFoundation smart-ptr release:
   *   1. Read this->handle.
   *   2. If NULL -> return (no retain to release).
   *   3. Else CFRelease(handle) and return.
   *
   * Note: the D2 flavour does NOT null-out `this->handle` after the
   * release — that's the D0/D1 (deleting/complete) variant's job. The
   * D2 body's job is just "release the CF ref on the base subobject
   * scope"; the containing object is expected to be about to be
   * destroyed anyway.
   */
  destructBase(): void {
    // @0x9c970..0x9c971 — prologue.
    // @0x9c974 — rdi = this->handle (both the field read and the CFRelease
    //            argument register — compiler folded them because SysV ABI
    //            passes arg 1 in %rdi and %rdi already holds `this`).
    const cf = this.handle;
    // @0x9c977..0x9c97a — testq/je: NULL-check.
    if (cf === null) {
      // @0x9c981..0x9c982 — retq. Nothing to release.
      return;
    }
    // @0x9c97c — callq _CFRelease (ProCore stub 0xde012).
    CFRelease(cf);
    // @0x9c981..0x9c982 — retq.
  }
}
