// PCMutex.ts — ProCore recursive/plain mutex (raw x86_64 port).
//
// Source: /Applications/Final Cut Pro.app/Contents/Frameworks/ProCore.framework/
//         Versions/A/ProCore (macOS FCP, x86_64 slice)
//
// PCMutex is a very thin OO wrapper around a POSIX `pthread_mutex_t`. All the
// enumerated instance methods live at a contiguous block starting @0x34330
// (ctors + D2/D1/D0 + lock/unlock). This file ports the ~PCMutex [D2] base
// destructor @0x347c0 and the `unlock()` @0x34844 methods; both are textbook
// pthread-wrapper bodies (POSIX externs, no in-scope callees).
//
// -----------------------------------------------------------------------------
// SHAPE — decoded from D2 alone
// -----------------------------------------------------------------------------
//   0x00  vptr             — the C++ virtual table pointer. D2 writes the
//                            base-class vtable's "call slot" address
//                            (`vtbl + 0x10`, since Itanium ABI puts two
//                            initial words of offset/RTTI ahead of the first
//                            method slot) here @0x347c4/0x347cb. The vtable
//                            RIP-relative literal resolves to
//                            (rip=0x347cb) + 0x11568d = 0x149E58 in the
//                            ProCore binary. That is `vtable for PCMutex` +
//                            0x10 — the standard "vptr install" you see at
//                            the top of every non-trivial C++ dtor.
//   0x08  pthread_mutex_t  — embedded POSIX mutex, 64 bytes on macOS.
//                            D2 passes `&this[+0x8]` to _pthread_mutex_destroy
//                            @0x347ce/0x347d2. The +0x08 offset is the
//                            unambiguous evidence this is the mutex slot.
//
// -----------------------------------------------------------------------------
// FRONTIER CALLEES (all TRUE OUT-OF-SCOPE externs — libc / clang runtime)
// -----------------------------------------------------------------------------
//   * _pthread_mutex_destroy   @stub ProCore 0xdeab0 (called @0x347d2)
//                              POSIX pthread — outside the 5-framework port
//                              scope (libSystem.B.dylib). Boundary stub.
//   * _pthread_mutex_unlock    @stub ProCore 0xdeac2 (tail-jmp @0x3484d)
//                              POSIX pthread — same policy.
//   * ___clang_call_terminate  @stub ProCore (called @0x347dc as the
//                              LSDA-registered cleanup for a _pthread_mutex_
//                              destroy that unwinds — libc++ terminate
//                              handler; outside port scope).
//
// -----------------------------------------------------------------------------
// Symbols ported here (mangled → address)
// -----------------------------------------------------------------------------
//   * __ZN7PCMutexD2Ev     PCMutex::~PCMutex()  [D2 base dtor]  @0x347c0
//   * __ZN7PCMutex6unlockEv  PCMutex::unlock()                   @0x34844
//
// The C1/D1/D0/lock siblings live at 0x34422/0x347e2/0x34804/0x34836 and are
// NOT ported by this unit — they are separate ledger entries.
//
// -----------------------------------------------------------------------------
// FULL DISASM (raw-port/re/disasm/ProCore.__ZN7PCMutexD2Ev.s)
// -----------------------------------------------------------------------------
//   0x347c0  pushq  %rbp                              ; frame prologue
//   0x347c1  movq   %rsp, %rbp
//   0x347c4  leaq   0x11568d(%rip), %rax              ; rax = vtable_for_PCMutex + 0x10
//                                                    ;      = 0x347cb + 0x11568d = 0x149E58
//   0x347cb  movq   %rax, (%rdi)                      ; this->vptr = &vtable[2]  (Itanium ABI:
//                                                    ; first method slot is at +0x10 of the
//                                                    ; vtable symbol — the "typeinfo/offset"
//                                                    ; header sits at +0x0/+0x8).
//   0x347ce  addq   $0x8, %rdi                        ; rdi = &this->mutex (this + 0x8)
//   0x347d2  callq  0xdeab0                           ; _pthread_mutex_destroy(&this->mutex)
//                                                    ;   (POSIX stub @0xdeab0)
//   0x347d7  popq   %rbp                              ; frame epilogue
//   0x347d8  retq
//   -- LSDA cleanup landing pad --
//   0x347d9  movq   %rax, %rdi                        ; rdi = pending-exception handle
//   0x347dc  callq  ___clang_call_terminate           ; std::terminate — a throwing
//                                                    ; _pthread_mutex_destroy cannot be
//                                                    ; caught inside a dtor.

/** Opaque pthread_mutex_t handle — 64 bytes on macOS, embedded @+0x08 of the
 *  PCMutex object.  Not modeled here — pthread primitives are OUT-OF-SCOPE
 *  boundary externs (libSystem.B.dylib), same policy as PCSemaphore's pthread
 *  handles in raw-port/src/infra/PCSemaphore.ts. */
export type PthreadMutex = object;

/**
 * `PCMutex` — instance shape decoded from D2 @0x347c0.
 *
 * Only two fields are exercised by the destructor:
 *   +0x00  vptr (written to `vtable_for_PCMutex + 0x10`, i.e. the base-class
 *                slot the ABI expects a fully-constructed base object to
 *                carry — reinstalling it here is the standard "unshadow the
 *                derived vptr during base destruction" step).
 *   +0x08  pthread_mutex_t (passed to _pthread_mutex_destroy).
 */
export class PCMutex {
  /**
   * (this+0x00) — C++ virtual-table pointer. Set by D2 to
   * `vtable_for_PCMutex + 0x10` (ProCore file addr @0x149E58, computed from
   * `leaq 0x11568d(%rip)` at ProCore 0x347c4 with rip=0x347cb). In TS this
   * has no runtime meaning — we keep it as a nullable opaque field so that
   * D2's vptr install is observable to any future porter of the derived
   * classes' D2s that need to re-check base-vptr install ordering.
   */
  vptr_at_0x0: object | null = null;

  /**
   * (this+0x08) — the embedded POSIX pthread_mutex_t. Sixty-four bytes in
   * the real object; opaque here. D2 calls `_pthread_mutex_destroy` on
   * `&this->mutex_at_0x8` (see disasm @0x347ce..0x347d2).
   */
  mutex_at_0x8: PthreadMutex | null = null;

  /**
   * `PCMutex::~PCMutex()` [D2 base destructor] — @ProCore 0x347c0
   * (__ZN7PCMutexD2Ev).
   *
   * Faithful line-for-line transcription of the disassembly quoted in the
   * file header. The body is the canonical Itanium-ABI base-dtor:
   *
   *   1. Reinstall the base-class vtable pointer.
   *      @0x347c4  leaq  0x11568d(%rip), %rax   ; rax = &vtable_for_PCMutex + 0x10
   *      @0x347cb  movq  %rax, (%rdi)           ; this->vptr = rax
   *
   *      The RIP-relative literal 0x11568d, added to `rip = 0x347cb` (the
   *      next-insn address that RIP-relative addressing uses on x86_64),
   *      yields ProCore file address 0x149E58 — the "call slot" of
   *      `vtable_for_PCMutex` (the vtable symbol's first two 8-byte words
   *      are the typeinfo offset and typeinfo pointer per Itanium ABI, so
   *      +0x10 is the first method slot the vptr must point at).
   *
   *   2. Destroy the embedded pthread_mutex.
   *      @0x347ce  addq  $0x8, %rdi             ; rdi = &this->mutex_at_0x8
   *      @0x347d2  callq _pthread_mutex_destroy ; POSIX stub @0xdeab0
   *
   *   3. Return.
   *      @0x347d7  popq  %rbp
   *      @0x347d8  retq
   *
   * Both step 1's vptr address and step 2's pthread_mutex_destroy are
   * OUT-OF-SCOPE externs (Itanium C++ ABI vtable emission + POSIX pthread
   * runtime) — there is no in-scope FCP callee here to import. The vtable
   * install is not observable from TS (there is no C++ vtable to install
   * into), and _pthread_mutex_destroy is not modeled (same policy as the
   * pthread_* callees in PCSemaphore.ts).
   *
   * Verification (constant provenance): the RIP-relative literal 0x11568d
   * resolves to `0x347cb + 0x11568d = 0x149E58` — cited @0x347c4 above.
   */
  destruct(): void {
    // ------------------------------------------------------------
    // @0x347c4..0x347cb  — reinstall base-class vptr.
    //   rax = &vtable_for_PCMutex + 0x10   (ProCore file addr 0x149E58,
    //   computed as 0x347cb + 0x11568d — RIP-relative displacement from
    //   the leaq at 0x347c4).
    //   this->vptr = rax.
    // In TS this is a purely-informational vptr install; there is no
    // C++ vtable to point at. We mirror it as a slot assignment so the
    // machine's write is not silently dropped.
    // ------------------------------------------------------------
    const VTABLE_FOR_PCMUTEX_PLUS_0x10 /* @0x347c4 (ProCore file 0x149E58) */ =
      { __opaque_vtable_PCMutex_plus_0x10: true } as const;
    this.vptr_at_0x0 = VTABLE_FOR_PCMUTEX_PLUS_0x10;

    // ------------------------------------------------------------
    // @0x347ce..0x347d2  — destroy the embedded pthread_mutex.
    //   rdi = &this->mutex_at_0x8;
    //   _pthread_mutex_destroy(&this->mutex_at_0x8);
    // POSIX pthread — TRUE OUT-OF-SCOPE extern (libSystem.B.dylib stub
    // @ProCore 0xdeab0). Same policy as PCSemaphore's pthread_* callees
    // (see raw-port/src/infra/PCSemaphore.ts). We raise, not paper-over.
    // ------------------------------------------------------------
    // @0x347d2 _pthread_mutex_destroy — TRUE out-of-scope extern (POSIX).
    throw new Error(
      "PCMutex::~PCMutex [D2] requires _pthread_mutex_destroy on &this[+0x8] " +
        "@ProCore 0x347d2 (POSIX pthread stub @0xdeab0) — pthread primitives " +
        "are not modeled in TS. Vptr reinstall @0x347c4/0x347cb " +
        "(vtable_for_PCMutex+0x10 = ProCore 0x149E58) is transcribed above. " +
        "@0x347c0",
    );

    // @0x347d7..0x347d8 (unreachable after throw above): popq %rbp; retq.
    // @0x347d9..0x347dc landing pad: movq %rax, %rdi; callq
    //   ___clang_call_terminate — std::terminate on unwinding
    //   _pthread_mutex_destroy. Out-of-scope (libc++ terminate handler).
  }

  /**
   * `PCMutex::unlock()` — @ProCore 0x34844 (__ZN7PCMutex6unlockEv).
   *
   * Faithful line-for-line transcription of the disassembly at
   * raw-port/re/disasm/ProCore.__ZN7PCMutex6unlockEv.s:
   *
   *   0x34844  pushq  %rbp                                  ; frame prologue
   *   0x34845  movq   %rsp, %rbp
   *   0x34848  addq   $0x8, %rdi                            ; rdi = &this->mutex_at_0x8
   *   0x3484c  popq   %rbp                                  ; epilogue (before tail-jmp)
   *   0x3484d  jmp    0xdeac2 ## symbol stub for: _pthread_mutex_unlock
   *
   * The function is a textbook tail-jmp trampoline: adjust `%rdi` (this) by
   * +0x8 so it now points at the embedded pthread_mutex_t (see the struct
   * layout above; the +0x8 slot is proven by D2 @0x347ce doing the same
   * `addq $0x8, %rdi` before `_pthread_mutex_destroy`), then tail-jmp into
   * the POSIX stub for `_pthread_mutex_unlock`. There is no ABI-visible
   * return value and no in-scope callee.
   *
   * `_pthread_mutex_unlock` is a TRUE OUT-OF-SCOPE extern (libSystem.B.dylib
   * symbol stub @ProCore 0xdeac2). Same policy as PCSemaphore's pthread_*
   * callees (see raw-port/src/infra/PCSemaphore.ts) and this file's own D2
   * — we raise, not paper-over: JS/TS has no pthread runtime, and silently
   * returning "success" would let a caller think the mutex was released
   * when in fact NO lock was ever acquired (see the sibling `lock` method,
   * which also throws for `_pthread_mutex_lock`). A future JS runtime port
   * would either (a) map to `Atomics.wait/notify` on a `SharedArrayBuffer`,
   * or (b) map to a Node.js `worker_threads` sync primitive; today, either
   * choice is speculative and out of scope for a bit-faithful transcription.
   */
  unlock(): void {
    // ------------------------------------------------------------
    // @0x34844..0x34845 — prologue (no TS effect).
    // @0x34848 — addq $0x8, %rdi   ;  rdi = &this->mutex_at_0x8
    //   (matches D2 @0x347ce; +0x8 is the pthread_mutex_t slot).
    // @0x3484c — popq %rbp        (epilogue before the tail-jmp).
    // @0x3484d — jmp _pthread_mutex_unlock  ; TRUE out-of-scope extern
    //   (POSIX pthread stub @ProCore 0xdeac2). Tail-jmp semantics: the
    //   pthread call's return goes directly to PCMutex::unlock's caller.
    // ------------------------------------------------------------
    // Reference the mutex slot so a reader can see the +0x8 offset the
    // machine addresses. Value is opaque (`PthreadMutex | null`) and its
    // content is only meaningful to libSystem.
    const mutexArg /* @0x34848 &this[+0x8] */ = this.mutex_at_0x8;
    void mutexArg;

    // @0x3484d _pthread_mutex_unlock — TRUE out-of-scope extern (POSIX).
    throw new Error(
      "PCMutex::unlock() requires _pthread_mutex_unlock(&this[+0x8]) " +
        "@ProCore 0x3484d (POSIX pthread stub @0xdeab6/0xdeac2) — pthread " +
        "primitives are not modeled in TS. Tail-jmp trampoline transcribed " +
        "above. @0x34844",
    );
  }
}
