// PCCFRef_CFArray.ts — the `~PCCFRef()` destructor specialisation for
// `PCCFRef<CFArrayRef>` (mangled __ZN7PCCFRefIPK9__CFArrayED1Ev).
//
// This is a template specialisation destructor emitted by the compiler
// for each concrete CoreFoundation-Ref type wrapped by ProCore's RAII
// helper `PCCFRef<T>` (the `T` here is `__CFArray const*`). It releases
// the held CFArray via CFRelease when non-null. Every specialisation of
// PCCFRef's destructor is a separate ledger unit; other peers (e.g.
// PCCFRef<CGImageDestination*>, PCCFRef<CGDataProvider*>) live in their
// own files under the same naming scheme.
//
// Transcribed from /Applications/Final Cut Pro.app/Contents/Frameworks/
// Ozone.framework/Versions/A/Ozone (x86_64 slice; unadjusted VAs from
// `otool -tV`). Disassembly source:
//   raw-port/re/disasm/__ZN7PCCFRefIPK9__CFArrayED1Ev.s
//
// Symbols ported (mangled → address)
//   * __ZN7PCCFRefIPK9__CFArrayED1Ev
//       — PCCFRef<__CFArray const*>::~PCCFRef() [D1] @Ozone 0x83e00
//
// -----------------------------------------------------------------------------
// FRONTIER CALLEES (TRUE OUT-OF-SCOPE externs — CoreFoundation + libc++ EH)
// -----------------------------------------------------------------------------
//   * _CFRelease
//       — CFRelease(CFTypeRef) — CoreFoundation. Called (non-tail)
//         from @0x83e0c via Ozone stub 0x6dc810. Decrements the CF
//         retain count; when it hits zero the CoreFoundation runtime
//         deallocates the object.
//
//   * ___clang_call_terminate
//       — Clang's exception-safety terminator: forwards to
//         `std::terminate()`. Called from the unwinding personality's
//         landing pad @0x83e16 if _CFRelease throws while a C++
//         exception is already in flight. libc++ ABI — TRUE
//         out-of-scope extern.
//
// -----------------------------------------------------------------------------
// OBJECT LAYOUT
// -----------------------------------------------------------------------------
// PCCFRef<T> is a 1-word RAII wrapper: a single pointer at +0x00 holding
// the (possibly-null) CF handle. The destructor reads that word:
//
//   struct PCCFRef<CFArrayRef> {
//     CFArrayRef ref;    // +0x00 — nullable; owns a +1 retain when non-null
//   };
//
// This layout is invariant across every PCCFRef<T> specialisation
// (template) and is confirmed by the single `movq (%rdi), %rdi` read.
//
// -----------------------------------------------------------------------------
// FULL DISASM (raw-port/re/disasm/__ZN7PCCFRefIPK9__CFArrayED1Ev.s)
// -----------------------------------------------------------------------------
//   0x83e00  pushq  %rbp                                ; prologue
//   0x83e01  movq   %rsp, %rbp
//   0x83e04  movq   (%rdi), %rdi                        ; rdi = this->ref
//   0x83e07  testq  %rdi, %rdi
//   0x83e0a  je     0x83e11                             ; skip if null
//   0x83e0c  callq  0x6dc810                            ; _CFRelease(ref)
//                                                       ; (Ozone stub → CF)
//   0x83e11  popq   %rbp
//   0x83e12  retq
//   ---- exception-unwinding landing pad ----
//   0x83e13  movq   %rax, %rdi                          ; rdi = caught exc*
//   0x83e16  callq  ___clang_call_terminate             ; terminate()
//   0x83e1b  nopl   (%rax,%rax)                         ; padding

// ═════════════════════════════════════════════════════════════════════════
// Types
// ═════════════════════════════════════════════════════════════════════════

/**
 * Opaque `CFArrayRef` handle (`__CFArray const*` in the C ABI). TRUE
 * out-of-scope type (CoreFoundation). Named as a branded interface so
 * the port can flow the handle through function boundaries without
 * fabricating a CF struct layout.
 */
export interface CFArrayRef {
  readonly __brand: "CFArrayRef";
}

/**
 * `PCCFRef<CFArrayRef>` — the ProCore RAII wrapper around a
 * CoreFoundation array retain. Only the `ref` field @+0x00 is touched
 * by this destructor. Other PCCFRef<T> members (ctor, copy, move,
 * operator*, operator=, etc.) are separate ledger units and out of
 * scope for this file.
 */
export interface PCCFRef_CFArray {
  /** +0x00 — the held CFArrayRef, or null. Own a +1 retain when
   *  non-null; the destructor releases it. Mutable because ~PCCFRef()
   *  effectively zeros this field (the object is being destroyed;
   *  reading it after destruction is UB — we model that by leaving the
   *  field in place, which is the observable behaviour of the disasm
   *  since it never writes back). */
  ref: CFArrayRef | null;
}

// ═════════════════════════════════════════════════════════════════════════
// Frontier externs (CoreFoundation + libc++ EH — TRUE OUT-OF-SCOPE)
// ═════════════════════════════════════════════════════════════════════════

/** `CFRelease(CFTypeRef)` — CoreFoundation. Called from
 *  PCCFRef<CFArrayRef>::~PCCFRef @0x83e0c via Ozone stub 0x6dc810.
 *  Decrements the CF retain count; may recursively free the object. */
function CFRelease(_ref: CFArrayRef): void {
  throw new Error(
    "CFRelease @Ozone stub 0x6dc810 (called from " +
      "PCCFRef<CFArrayRef>::~PCCFRef @0x83e0c) not yet transcribed — " +
      "TRUE out-of-scope extern (CoreFoundation).",
  );
}

/** `__clang_call_terminate` — libc++ ABI helper that forwards to
 *  std::terminate() when an exception escapes a noexcept context.
 *  Called from the destructor's cleanup landing pad @0x83e16 if
 *  CFRelease itself throws while another exception is already in
 *  flight (a very unusual condition, but the compiler emits the pad
 *  unconditionally because ~PCCFRef is implicitly noexcept). */
function __clang_call_terminate(_exc: unknown): never {
  throw new Error(
    "__clang_call_terminate @0x83e16 (unwinding landing pad of " +
      "PCCFRef<CFArrayRef>::~PCCFRef) not yet transcribed — TRUE " +
      "out-of-scope extern (libc++ ABI helper — forwards to " +
      "std::terminate()).",
  );
}

// ═════════════════════════════════════════════════════════════════════════
// The destructor
// ═════════════════════════════════════════════════════════════════════════

/**
 * `PCCFRef<CFArrayRef>::~PCCFRef()` [D1 destructor] — @Ozone 0x83e00
 * (__ZN7PCCFRefIPK9__CFArrayED1Ev).
 *
 * Faithful line-for-line transcription of the 12-instruction body. The
 * standard ProCore RAII pattern for CF handles: read the stored ref,
 * skip if null, otherwise CFRelease it. The `___clang_call_terminate`
 * landing pad at @0x83e13-0x83e16 is the compiler-emitted cleanup for
 * the (implicit) noexcept destructor; if CFRelease throws during
 * unwinding we terminate. Modelled here as a try/catch that re-enters
 * the terminate path — the observable behaviour matches the disasm
 * (either return cleanly or terminate).
 *
 * The `pushq %rbp; movq %rsp, %rbp` prologue and matching
 * `popq %rbp; retq` epilogue have no TS-visible effect.
 */
export function PCCFRef_CFArray_dtor(self: PCCFRef_CFArray): void {
  // @0x83e00..0x83e01 — prologue. No TS-visible effect.
  // @0x83e04 — rdi = *(this+0) = this->ref.
  const ref = self.ref;
  // @0x83e07..0x83e0a — testq %rdi,%rdi; je 0x83e11 (skip release if null).
  if (ref === null) {
    // @0x83e11..0x83e12 — pop rbp; retq. Nothing to release.
    return;
  }
  // @0x83e0c — callq _CFRelease (via Ozone stub 0x6dc810).
  // The landing pad @0x83e13 catches any exception CFRelease raises
  // during unwinding and hands it to __clang_call_terminate. In a
  // faithful port we mirror that: any throw from the frontier stub
  // reaches the terminate path.
  try {
    CFRelease(ref);
  } catch (exc) {
    // @0x83e13..0x83e16 — mov rax,rdi; call ___clang_call_terminate.
    __clang_call_terminate(exc);
  }
  // @0x83e11..0x83e12 — pop rbp; retq.
}
