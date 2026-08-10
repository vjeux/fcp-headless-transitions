// PCCFRef<__CVBuffer*> — ProCore RAII smart-pointer over a CoreVideo
// CVBufferRef (the `__CVBuffer *` handle). This file ports ONLY the
// D1 (complete-object) destructor at @Flexo 0x626bb0; ctor and copy paths
// are separate ledger entries and will be ADDED here when their units are
// claimed.
//
// Provenance: /Applications/Final Cut Pro.app/Contents/Frameworks/
//             Flexo.framework/Versions/A/Flexo (x86_64 slice;
//             unadjusted VAs from `otool -tV`).
//
// Disassembly source:
//   raw-port/re/disasm/Flexo.__ZN7PCCFRefIP10__CVBufferED1Ev.s
//
// -----------------------------------------------------------------------------
// STRUCT LAYOUT (recovered from the D1 body)
// -----------------------------------------------------------------------------
// PCCFRef<__CVBuffer*> {
//   +0x00  handle : CVBufferRef            (a `__CVBuffer *` — the only slot;
//                                           the dtor reads it @0x626bb4 and
//                                           CFReleases it if non-null.)
// }
// sizeof(PCCFRef<__CVBuffer*>) = 8 (just the pointer). Identical layout to the
// twin PCCFRef<CFDataRef>/PCCFRef<CFArrayRef> ports — PCCFRef<T> is a size-8
// handle regardless of T.
//
// This is the standard CoreFoundation/CoreVideo smart-ptr pattern (a CF ref is
// held by construction and released exactly once by destruction). Because
// __CVBuffer participates in the CFType retain/release machinery, the release
// is the generic _CFRelease (NOT CVBufferRelease) — matching the disasm.
//
// -----------------------------------------------------------------------------
// FRONTIER CALLEES (all TRUE OUT-OF-SCOPE externs)
// -----------------------------------------------------------------------------
//   * _CFRelease — CoreFoundation.framework — TRUE out-of-scope extern.
//     Called @0x626bbc via Flexo stub 0x149484e. Decrements the CF retain
//     count; when it reaches 0 the CVBuffer is deallocated by CoreVideo.
//     Standard boundary-stub policy: modelled as a JS no-op (JS GC handles
//     our surrogate) — same as the PCCFRef<CFDataRef> port.
//   * ___clang_call_terminate — Itanium ABI exception personality tail call
//     at @0x626bc6. Reached ONLY on unwind (CFRelease throwing is essentially
//     impossible; the landing pad exists to satisfy the dtor's ABI). Not a
//     normal callee — not modelled.
//
// -----------------------------------------------------------------------------
// Symbol ported here (mangled -> address)
// -----------------------------------------------------------------------------
//   * __ZN7PCCFRefIP10__CVBufferED1Ev
//       — PCCFRef<__CVBuffer*>::~PCCFRef() [D1 complete] @Flexo 0x626bb0
//
// -----------------------------------------------------------------------------
// FULL DISASM (raw-port/re/disasm/Flexo.__ZN7PCCFRefIP10__CVBufferED1Ev.s)
// -----------------------------------------------------------------------------
//   0x626bb0  pushq  %rbp
//   0x626bb1  movq   %rsp, %rbp
//   0x626bb4  movq   (%rdi), %rdi                    ; rdi = this->handle
//                                                    ; (field read + CFRelease
//                                                    ; arg both land in %rdi —
//                                                    ; SysV ABI arg reg reuse)
//   0x626bb7  testq  %rdi, %rdi                      ; handle == NULL ?
//   0x626bba  je     0x626bc1                        ; yes -> skip release
//   0x626bbc  callq  _CFRelease                      ; CoreFoundation stub 0x149484e
//   0x626bc1  popq   %rbp
//   0x626bc2  retq
//   ------------ landing pad (unwind path, unreachable normally) ------------
//   0x626bc3  movq   %rax, %rdi
//   0x626bc6  callq  ___clang_call_terminate

// ═════════════════════════════════════════════════════════════════════════
// Opaque CVBufferRef surrogate.
// The real CoreVideo `__CVBuffer *` is a private struct pointer; the port
// never inspects its bytes — it only passes it back through CF boundary
// stubs. We therefore model it as an opaque handle.
// ═════════════════════════════════════════════════════════════════════════

/** Opaque CoreVideo image-buffer handle (a `__CVBuffer *` / `CVBufferRef`).
 *  The bytes behind it are private to CoreVideo; we only pass it through CF
 *  boundary stubs. */
export interface CVBufferRef {
  readonly __cv_buffer_brand: unique symbol;
}

/**
 * `_CFRelease(CFTypeRef)` — CoreFoundation.framework extern (called via Flexo
 * stub 0x149484e from ~PCCFRef @0x626bbc). TRUE out-of-scope extern.
 *
 * In the native binary this decrements the CF retain count and (when it
 * reaches 0) deallocates the CVBuffer. The JS surrogate has no CF runtime —
 * the "release" is a no-op; the underlying JS handle becomes unreachable when
 * the wrapper is GC'd. Documented here so a future parity harness can hook the
 * boundary. (Matches the PCCFRef<CFDataRef> policy.)
 */
function CFRelease(_cf: CVBufferRef): void {
  // JS surrogate: no-op. See file header for policy discussion.
}

// ═════════════════════════════════════════════════════════════════════════
// The class
// ═════════════════════════════════════════════════════════════════════════

/**
 * `PCCFRef<__CVBuffer*>` — ProCore RAII wrapper around a CVBufferRef. The class
 * owns a single CoreFoundation retain on construction and releases it exactly
 * once on destruction. Only the destructor is ported in this file.
 */
export class PCCFRef_CVBuffer {
  /** +0x00 — the wrapped CVBufferRef (may be NULL). Read by the D1 body
   *  @Flexo 0x626bb4; NULL short-circuits the release. */
  handle: CVBufferRef | null = null;

  /**
   * `PCCFRef<__CVBuffer*>::~PCCFRef()` [D1 complete] — @Flexo 0x626bb0
   * (__ZN7PCCFRefIP10__CVBufferED1Ev).
   *
   * Faithful line-for-line transcription of the disassembly above. Standard
   * CoreFoundation smart-ptr release:
   *   1. Read this->handle.
   *   2. If NULL -> return (no retain to release).
   *   3. Else CFRelease(handle) and return.
   *
   * The D1 body does NOT null-out `this->handle` after the release — the
   * deleting variant (D0) handles that; here the containing object is about to
   * be destroyed. The `___clang_call_terminate` tail (@0x626bc6) is the unwind
   * landing pad and is unreachable on the normal path.
   */
  destruct(): void {
    // @0x626bb0..0x626bb1 — prologue.
    // @0x626bb4 — rdi = this->handle (field read and CFRelease argument share
    //             %rdi; the compiler folded them because SysV ABI passes arg 1
    //             in %rdi and %rdi already held `this`).
    const cf = this.handle;
    // @0x626bb7..0x626bba — testq/je: NULL-check.
    if (cf === null) {
      // @0x626bc1..0x626bc2 — retq. Nothing to release.
      return;
    }
    // @0x626bbc — callq _CFRelease (Flexo stub 0x149484e).
    CFRelease(cf);
    // @0x626bc1..0x626bc2 — retq.
  }
}
