// PCThread — ProCore's thin wrapper around a Darwin pthread handle. This
// unit ports ONLY `isSelf() const` at @ProCore 0x34b8e. Every other
// method on this class (ctors, dtors, join, spawn helpers, …) is a
// separate ledger entry and OUT OF SCOPE for this file (extend the same
// file when they are claimed — one class per file).
//
// Provenance:
//   Binary: /Applications/Final Cut Pro.app/Contents/Frameworks/
//           ProCore.framework/Versions/A/ProCore (x86_64 slice; unadjusted
//           VAs from `otool -tV`).
//   Disasm: raw-port/re/disasm/ProCore.__ZNK8PCThread6isSelfEv.s
//
// ─────────────────────────────────────────────────────────────────────────
// STRUCT LAYOUT (recovered from this method's dereference)
// ─────────────────────────────────────────────────────────────────────────
//   size ≥ 0x08
//   +0x00   pthread_handle : pthread_t (opaque Darwin thread ID)
//                         ; `movq (%rdi), %rbx` @0x34b94 loads the wrapped
//                         ; pthread_t before the call to _pthread_self and
//                         ; passes it to _pthread_equal @0x34ba2. Darwin's
//                         ; `pthread_t` is `struct _opaque_pthread_t *`, a
//                         ; pointer — hence 8 bytes on x86_64.
//
// ─────────────────────────────────────────────────────────────────────────
// FRONTIER CALLEES (all TRUE OUT-OF-SCOPE externs)
// ─────────────────────────────────────────────────────────────────────────
//   * _pthread_self
//       — Darwin libSystem thread-id primitive.
//       — TRUE out-of-scope extern (pthread runtime). Called @0x34b97 via
//         ProCore __TEXT.__stubs @0xdeada.
//       — Same policy as PCSharedMutex's pthread_self_stub (see
//         raw-port/src/infra/PCSharedMutex.ts): we expose an injectable
//         stub, raise until wired. TS has no direct thread notion.
//
//   * _pthread_equal
//       — Darwin libSystem thread-id equality predicate. Returns non-zero
//         if the two handles refer to the same thread (Darwin does NOT
//         guarantee equality of pthread_t values by direct compare — the
//         internal representation is opaque; _pthread_equal is the only
//         portable check).
//       — TRUE out-of-scope extern. Called @0x34ba2 via ProCore
//         __TEXT.__stubs @0xdeaa4.
//
// ─────────────────────────────────────────────────────────────────────────
// SYMBOLS PORTED HERE
// ─────────────────────────────────────────────────────────────────────────
//   * __ZNK8PCThread6isSelfEv
//       — PCThread::isSelf() const  @ProCore 0x34b8e
//
// ─────────────────────────────────────────────────────────────────────────
// FULL DISASM
//   raw-port/re/disasm/ProCore.__ZNK8PCThread6isSelfEv.s
// ─────────────────────────────────────────────────────────────────────────
//   0x34b8e  pushq %rbp
//   0x34b8f  movq  %rsp, %rbp
//   0x34b92  pushq %rbx                    ; callee-saved (need it to
//                                          ; survive across the pthread_self
//                                          ; call so we can pass it to
//                                          ; pthread_equal).
//   0x34b93  pushq %rax                    ; 16-byte stack alignment before
//                                          ; the imminent function call
//                                          ; (System-V ABI requires
//                                          ; 16-byte-aligned %rsp at CALL).
//   0x34b94  movq  (%rdi), %rbx            ; rbx = this->pthread_handle
//   0x34b97  callq _pthread_self           ; rax = pthread_self() — the
//                                          ; current thread's handle
//   0x34b9c  movq  %rbx, %rdi              ; rdi = this->pthread_handle
//   0x34b9f  movq  %rax, %rsi              ; rsi = pthread_self() result
//   0x34ba2  callq _pthread_equal          ; rax = pthread_equal(a, b)
//                                          ; (int — non-zero if equal)
//   0x34ba7  testl %eax, %eax              ; ZF = (eax == 0)
//   0x34ba9  setne %al                     ; al  = (eax != 0) ? 1 : 0
//                                          ; — narrow the "any non-zero"
//                                          ; int result to a boolean.
//                                          ; This matches the C-style
//                                          ; convention: pthread_equal
//                                          ; returns an int that is
//                                          ; non-zero on equal, and the
//                                          ; C++ wrapper coerces to bool.
//   0x34bac  addq  $0x8, %rsp              ; undo the alignment pad
//   0x34bb0  popq  %rbx
//   0x34bb1  popq  %rbp
//   0x34bb2  retq
// ─────────────────────────────────────────────────────────────────────────

// ── Frontier stubs — TRUE out-of-scope externs (pthread runtime) ─────────

/** `_pthread_self` @ProCore stub 0xdeada — Darwin libSystem thread-id
 *  primitive. Called @0x34b97 (isSelf). Same shape as
 *  PCSharedMutex.pthread_self_stub; we expose an injectable slot so the
 *  host process (real FCP or a test harness) can supply the current
 *  thread id. Raises until wired. */
function pthread_self_stub(): bigint {
  throw new Error(
    "_pthread_self @ProCore 0xdeada (stub) — provide a thread-id source via PCThread.setPthreadSelf(fn)",
  );
}

let _pthread_self_impl: () => bigint = pthread_self_stub;

/** `_pthread_equal` @ProCore stub 0xdeaa4 — Darwin libSystem thread-id
 *  equality predicate. Returns C-style int (non-zero on equal). Called
 *  @0x34ba2 (isSelf). Default impl is a bit-equal compare of the two
 *  bigints — Darwin's `pthread_equal` is documented to return non-zero
 *  iff the two `pthread_t` values name the same underlying thread, and
 *  for the common case where handles come from the same `pthread_self`
 *  source a direct compare is equivalent. Host processes can override
 *  via PCThread.setPthreadEqual(fn) if they model handles differently
 *  (e.g. wrapping a real Darwin `_opaque_pthread_t*`). */
function pthread_equal_default(a: bigint, b: bigint): number {
  return a === b ? 1 : 0;
}

let _pthread_equal_impl: (a: bigint, b: bigint) => number =
  pthread_equal_default;

/**
 * `PCThread` — ProCore's opaque-pthread-handle wrapper. Only `isSelf()`
 * is transcribed in this file; every other method is a separate ledger
 * entry.
 */
export class PCThread {
  /**
   * @ProCore 0x00 — the wrapped `pthread_t` handle. Read by isSelf()
   * @0x34b94. Modelled as `bigint` because Darwin's `pthread_t` is a
   * pointer-sized opaque handle and callers may compare it against
   * bigint results from `pthread_self()`. 0n is the null/uninitialised
   * state (a legal placeholder — real code would only call isSelf on a
   * PCThread that was properly initialised).
   */
  pthread_handle: bigint = 0n;

  /**
   * Inject a real `_pthread_self` implementation. See file header for
   * why this is needed (TS has no direct pthread notion, and the
   * pthread frontier is out-of-scope for the port). Not part of the FCP
   * disasm — this is the raw-port harness surface for the runtime.
   */
  static setPthreadSelf(fn: () => bigint): void {
    _pthread_self_impl = fn;
  }

  /**
   * Inject a real `_pthread_equal` implementation. Not part of the FCP
   * disasm; see setPthreadSelf.
   */
  static setPthreadEqual(fn: (a: bigint, b: bigint) => number): void {
    _pthread_equal_impl = fn;
  }

  /**
   * `PCThread::isSelf() const` — @ProCore 0x34b8e
   * (__ZNK8PCThread6isSelfEv).
   *
   * Faithful line-for-line transcription: load `this->pthread_handle`,
   * fetch the caller's thread id via `_pthread_self()`, compare with
   * `_pthread_equal()`, coerce the C int result to a boolean via
   * `test+setne`.
   */
  isSelf(): boolean {
    // ------------------------------------------------------------
    // @0x34b8e..0x34b93 — prologue + save %rbx + 16-byte stack alignment.
    //                      (No TS-visible effect.)
    // @0x34b94           — rbx = this->pthread_handle.
    // ------------------------------------------------------------
    const handle: bigint = this.pthread_handle;
    // ------------------------------------------------------------
    // @0x34b97 — rax = pthread_self()  (TRUE out-of-scope extern).
    // ------------------------------------------------------------
    const self: bigint = _pthread_self_impl();
    // ------------------------------------------------------------
    // @0x34b9c..0x34ba2 — rdi=handle, rsi=self, callq pthread_equal.
    //   eax = pthread_equal(handle, self)  (C int)
    // ------------------------------------------------------------
    const eq: number = _pthread_equal_impl(handle, self);
    // ------------------------------------------------------------
    // @0x34ba7..0x34ba9 — `testl %eax,%eax ; setne %al`.
    //   Narrow the C int (any non-zero) to a boolean. Equivalent to
    //   `eq != 0` — the disasm's `setne` is the direct fold of
    //   `test+setne`, which is exactly "not equal to zero".
    // ------------------------------------------------------------
    return eq !== 0;
    // ------------------------------------------------------------
    // @0x34bac..0x34bb2 — epilogue (undo pad + restore %rbx + retq).
    //   (No TS-visible effect.)
    // ------------------------------------------------------------
  }
}
