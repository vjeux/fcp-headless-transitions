// PCCFRef<CFArrayRef> — ProCore RAII smart-pointer over a CoreFoundation
// CFArrayRef (the const `__CFArray *` handle). This file ports ONLY the
// D2 base destructor at @ProChannel 0x27a4a; the ctor and copy paths
// are separate ledger entries and will be added to this file when their
// own units are claimed.
//
// Provenance: /Applications/Final Cut Pro.app/Contents/Frameworks/
//             ProChannel.framework/Versions/A/ProChannel (x86_64 slice;
//             unadjusted VAs from `otool -tV`).
//
// Disassembly source:
//   raw-port/re/disasm/ProChannel.__ZN7PCCFRefIPK9__CFArrayED2Ev.s
//
// -----------------------------------------------------------------------------
// STRUCT LAYOUT (recovered from the D2 body)
// -----------------------------------------------------------------------------
// PCCFRef<CFArrayRef const*> {
//   +0x00  handle : CFArrayRef            (a `const __CFArray *` — the
//                                          only slot; the dtor reads it
//                                          @0x27a4e and CFReleases it if
//                                          non-null.)
// }
// sizeof(PCCFRef<CFArrayRef>) = 8 (just the pointer).
//
// This is the standard Cocoa/CoreFoundation smart-ptr pattern
// (equivalent to `boost::intrusive_ptr` specialised to CF): construction
// takes a CF retain (or absorbs an already-retained handle), destruction
// releases exactly once.
//
// -----------------------------------------------------------------------------
// FRONTIER CALLEES (all TRUE OUT-OF-SCOPE externs)
// -----------------------------------------------------------------------------
//   * _CFRelease  — CoreFoundation.framework — TRUE out-of-scope extern.
//     Called @0x27a56 via ProChannel stub 0xaca50. Decrements the
//     Cocoa/CF retain count of the array; when it reaches 0 the array
//     is deallocated by CoreFoundation. Standard boundary-stub policy:
//     modelled as a JS no-op (JS GC handles our surrogate) with an
//     explicit throw available for a future parity harness.
//   * ___clang_call_terminate — Itanium ABI exception personality tail
//     call at @0x27a60. Reached ONLY on unwind (CFRelease throwing is
//     essentially impossible; the landing pad exists to satisfy the
//     dtor's ABI). Not a normal callee.
//
// -----------------------------------------------------------------------------
// Symbols ported here (mangled → address)
// -----------------------------------------------------------------------------
//   * __ZN7PCCFRefIPK9__CFArrayED2Ev
//       — PCCFRef<CFArrayRef>::~PCCFRef() [D2 base]     @ProChannel 0x27a4a
//   * __ZN7PCCFRefIPK9__CFArrayED1Ev
//       — PCCFRef<CFArrayRef>::~PCCFRef() [D1 complete] @Ozone      0x83e00
//
// -----------------------------------------------------------------------------
// FULL DISASM (raw-port/re/disasm/ProChannel.__ZN7PCCFRefIPK9__CFArrayED2Ev.s)
// -----------------------------------------------------------------------------
//   0x27a4a  pushq  %rbp
//   0x27a4b  movq   %rsp, %rbp
//   0x27a4e  movq   (%rdi), %rdi                   ; rdi = this->handle
//                                                  ; (both the field read
//                                                  ; and the CFRelease arg
//                                                  ; land in %rdi — the
//                                                  ; System-V ABI arg reg)
//   0x27a51  testq  %rdi, %rdi                     ; handle == NULL ?
//   0x27a54  je     0x27a5b                        ; yes → skip release
//   0x27a56  callq  _CFRelease                     ; CoreFoundation stub 0xaca50
//   0x27a5b  popq   %rbp
//   0x27a5c  retq
//   ------------ landing pad (unwind path, unreachable normally) ------------
//   0x27a5d  movq   %rax, %rdi
//   0x27a60  callq  ___clang_call_terminate

// ═════════════════════════════════════════════════════════════════════════
// Opaque CFArrayRef surrogate.
// The real CoreFoundation `const __CFArray *` is a tagged pointer whose
// contents are private; the port never needs to inspect its bytes — only
// to CFRetain / CFRelease it via the frontier stubs. We therefore model
// it as an opaque handle type.
// ═════════════════════════════════════════════════════════════════════════

/** Opaque CoreFoundation array handle (a `const __CFArray *`). The bytes
 *  behind it are private to CoreFoundation; we only ever pass it back
 *  through CF boundary stubs. */
export interface CFArrayRef {
  readonly __cf_array_brand: unique symbol;
}

/**
 * `_CFRelease(CFTypeRef)` — CoreFoundation.framework extern (called via
 * ProChannel stub 0xaca50 from ~PCCFRef @0x27a56). TRUE out-of-scope
 * extern.
 *
 * In the native binary this decrements the CF retain count and (when it
 * reaches 0) invokes the class's `finalize` callback. The JS surrogate
 * has no CF runtime — the "release" is a no-op; the underlying JS handle
 * becomes unreachable when the class instance is GC'd. Documented here
 * so a future parity harness can hook the boundary. */
function CFRelease(_cf: CFArrayRef): void {
  // JS surrogate: no-op. See the file header for policy discussion.
}

// ═════════════════════════════════════════════════════════════════════════
// The class
// ═════════════════════════════════════════════════════════════════════════

/**
 * `PCCFRef<CFArrayRef>` — ProCore RAII wrapper around a CFArrayRef. The
 * class owns a single CoreFoundation retain on construction and releases
 * it exactly once on destruction. Only the destructor is ported in this
 * file.
 */
export class PCCFRef_CFArray {
  /** +0x00 — the wrapped CFArrayRef (may be NULL). Read by the D2 body
   *  @ProChannel 0x27a4e; NULL short-circuits the release. */
  handle: CFArrayRef | null = null;

  /**
   * `PCCFRef<CFArrayRef>::~PCCFRef()` [D2 base] — @ProChannel 0x27a4a
   * (__ZN7PCCFRefIPK9__CFArrayED2Ev).
   *
   * Faithful line-for-line transcription of the disassembly above.
   * Standard CoreFoundation smart-ptr release:
   *   1. Read this->handle.
   *   2. If NULL → return (no retain to release).
   *   3. Else CFRelease(handle) and return.
   *
   * Note: the D2 flavour does NOT null-out `this->handle` after the
   * release — that's the D0/D1 (deleting/complete) variant's job. The
   * D2 body's job is just "release the CF ref on the base subobject
   * scope"; the containing object is expected to be about to be
   * destroyed anyway.
   */
  destructBase(): void {
    // @0x27a4a..0x27a4b — prologue.
    // @0x27a4e — rdi = this->handle (both the field read and the CFRelease
    //            argument register — the compiler folded them because the
    //            System-V ABI passes arg 1 in %rdi and %rdi already holds
    //            `this`).
    const cf = this.handle;
    // @0x27a51..0x27a54 — testq/je: NULL-check.
    if (cf === null) {
      // @0x27a5b..0x27a5c — retq. Nothing to release.
      return;
    }
    // @0x27a56 — callq _CFRelease (ProChannel stub 0xaca50).
    CFRelease(cf);
    // @0x27a5b..0x27a5c — retq.
  }

  // ═════════════════════════════════════════════════════════════════════════
  // Ozone D1 (complete-object destructor) instantiation — a second, distinct
  // Itanium-ABI dtor variant for the same class, emitted by the compiler into
  // the Ozone.framework binary at a different address. Semantically identical
  // to the D2 body above (this class has no virtual base, so D1 and D2 have
  // the same body: read the CF handle, CFRelease if non-null).
  //
  //   * __ZN7PCCFRefIPK9__CFArrayED1Ev
  //       — PCCFRef<CFArrayRef>::~PCCFRef() [D1 complete] @Ozone 0x83e00
  //
  // Disassembly source:
  //   raw-port/re/disasm/__ZN7PCCFRefIPK9__CFArrayED1Ev.s (Ozone)
  //
  // FULL DISASM
  //   0x83e00  pushq  %rbp
  //   0x83e01  movq   %rsp, %rbp
  //   0x83e04  movq   (%rdi), %rdi                   ; rdi = this->handle
  //   0x83e07  testq  %rdi, %rdi                     ; handle == NULL ?
  //   0x83e0a  je     0x83e11                        ; yes → skip release
  //   0x83e0c  callq  _CFRelease                     ; CoreFoundation stub 0x6dc810
  //   0x83e11  popq   %rbp
  //   0x83e12  retq
  //   ------------ landing pad (unwind path, unreachable normally) ------------
  //   0x83e13  movq   %rax, %rdi
  //   0x83e16  callq  ___clang_call_terminate
  //
  // FRONTIER CALLEES (both TRUE OUT-OF-SCOPE externs)
  //   * _CFRelease @Ozone stub 0x6dc810 — CoreFoundation.framework — boundary
  //     stub. Same policy as the D2 above.
  //   * ___clang_call_terminate @0x83e16 — Itanium ABI landing pad, only
  //     reachable on unwind, not part of the normal control flow.
  /**
   * `PCCFRef<CFArrayRef>::~PCCFRef()` [D1 complete] — @Ozone 0x83e00
   * (__ZN7PCCFRefIPK9__CFArrayED1Ev).
   *
   * Faithful line-for-line transcription of the Ozone disassembly. Body is
   * identical to `destructBase` (D2) above — same class, same CF-release
   * pattern, just a second Itanium-ABI instantiation the compiler chose to
   * emit for the Ozone translation unit. D1 (complete-object) is called
   * when a stack-allocated or explicitly-deleted instance goes away; D2
   * (base) is called from a derived class's own dtor. Since this class has
   * no virtual base, both bodies are the same.
   */
  destructComplete_Ozone(): void {
    // @0x83e00..0x83e01 — prologue.
    // @0x83e04 — rdi = this->handle (same folding as the ProChannel D2 —
    //            the field read and the CFRelease arg register coincide).
    const cf = this.handle;
    // @0x83e07..0x83e0a — testq/je: NULL-check.
    if (cf === null) {
      // @0x83e11..0x83e12 — retq. Nothing to release.
      return;
    }
    // @0x83e0c — callq _CFRelease (Ozone stub 0x6dc810).
    CFRelease(cf);
    // @0x83e11..0x83e12 — retq.
  }
}
