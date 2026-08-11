// PCConditionVariable.ts — ProCore condition-variable (raw x86_64 port).
//
// Source: /Applications/Final Cut Pro.app/Contents/Frameworks/ProCore.framework/
//         Versions/A/ProCore (macOS FCP, x86_64 slice)
//
// PCConditionVariable is a thin OO wrapper around a POSIX `pthread_cond_t`.
// The ported method here is `signal()`, a textbook tail-jmp wrapper around
// `_pthread_cond_signal`.  Same modelling policy used across every pthread
// wrapper in this port (see PCMutex.ts, PCSemaphore.ts): the pthread call
// is a TRUE OUT-OF-SCOPE extern (libSystem.B.dylib) — we transcribe the
// exact instruction stream, cite @0xADDR provenance on the fn + each const,
// and raise rather than paper over the boundary.
//
// -----------------------------------------------------------------------------
// FULL DISASM (raw-port/re/disasm/ProCore.__ZN19PCConditionVariable6signalEv.s)
// -----------------------------------------------------------------------------
//   __ZN19PCConditionVariable6signalEv:
//     0x3431c  pushq  %rbp                              ; frame prologue
//     0x3431d  movq   %rsp, %rbp
//     0x34320  popq   %rbp                              ; frame epilogue
//     0x34321  jmp    _pthread_cond_signal              ; TAIL-CALL (POSIX
//                                                      ;   stub @ProCore 0xdea86)
//
// -----------------------------------------------------------------------------
// SHAPE
// -----------------------------------------------------------------------------
// signal() takes zero additional arguments beyond `this` (in %rdi), and does
// not offset the pointer before the tail-jmp — unlike PCMutex::unlock which
// added $0x8 to reach an embedded pthread_mutex_t at `this+0x8`, this
// wrapper passes `this` UNMODIFIED to `_pthread_cond_signal`. The most
// natural reading is that the pthread_cond_t sits at offset 0 of the
// object (or, equivalently, PCConditionVariable *is* a pthread_cond_t view
// / has no ahead-of-cond fields to skip). We do NOT invent additional
// fields — the disasm shows no leaq/addq on %rdi, so no offset is
// documented for this ledger unit.
//
// -----------------------------------------------------------------------------
// FRONTIER CALLEES (one, TRUE OUT-OF-SCOPE extern)
// -----------------------------------------------------------------------------
//   * _pthread_cond_signal @ProCore stub 0xdea86 (called via TAIL-JMP @0x34321).
//     POSIX pthread — outside the 5-framework port scope (libSystem.B.dylib).
//     Modeled as a boundary throw, same policy as every other pthread
//     callee in this port (see PCMutex::unlock's _pthread_mutex_unlock,
//     PCMutex::~PCMutex's _pthread_mutex_destroy).
//
// -----------------------------------------------------------------------------
// Symbols ported here (mangled → address)
// -----------------------------------------------------------------------------
//   * __ZN19PCConditionVariable6signalEv   PCConditionVariable::signal()  @0x3431c
//   * __ZN19PCConditionVariableC1Ev         PCConditionVariable::PCConditionVariable()  [C1]  @0x34274
//   * __ZN19PCConditionVariable9broadcastEv PCConditionVariable::broadcast()  @0x34326
//

/** Opaque pthread_cond_t handle. Not modeled here — pthread primitives are
 *  OUT-OF-SCOPE boundary externs (libSystem.B.dylib), same policy as
 *  PCMutex's pthread_mutex_t handle in raw-port/src/infra/PCMutex.ts. */
export type PthreadCond = object;

/**
 * `PCConditionVariable` — the instance shape decoded from `signal()` alone.
 *
 * The `signal()` disasm passes `this` UNMODIFIED to `_pthread_cond_signal`
 * (no `addq $N, %rdi` before the tail-jmp), so the pthread_cond_t is at
 * this+0x0 (or, equivalently, the object has no ahead-of-cond fields).
 * We keep the field slot explicit rather than inventing offsets not
 * derivable from the disassembly.
 */
export class PCConditionVariable {
  /**
   * (this+0x00) — the embedded POSIX pthread_cond_t. `signal()` passes
   * `this` (address of this field) directly to `_pthread_cond_signal`
   * without any offset adjustment (see disasm @0x34321: `jmp
   * _pthread_cond_signal` with %rdi still holding the untouched `this`).
   * Opaque here; POSIX primitive.
   */
  cond_at_0x0: PthreadCond | null = null;

  // ═════════════════════════════════════════════════════════════════════════
  // PCConditionVariable::PCConditionVariable()  [C1 complete ctor]
  //
  // Disassembly source:
  //   raw-port/re/disasm/ProCore.__ZN19PCConditionVariableC1Ev.s
  //
  // FULL DISASM
  //   0x34274  pushq  %rbp                              ; frame prologue
  //   0x34275  movq   %rsp, %rbp
  //   0x34278  xorl   %esi, %esi                        ; arg2 = nullptr (attr)
  //   0x3427a  popq   %rbp                              ; frame epilogue
  //   0x3427b  jmp    _pthread_cond_init                ; TAIL-CALL
  //                                                    ;   (POSIX stub
  //                                                    ;    @ProCore 0xdea80)
  //
  // The ctor zeroes %esi (the 2nd argument — the pthread_condattr_t*) so the
  // effective call is `_pthread_cond_init(this, nullptr)`.  %rdi still holds
  // `this` untouched (no `addq` before the tail-jmp), so the pthread_cond_t is
  // at this+0x0 — consistent with signal()'s untouched-%rdi tail-jmp to
  // _pthread_cond_signal.  Semantically:
  //     return _pthread_cond_init(this, nullptr);
  // The compiler chose a straight tail-jmp because after zeroing %esi both
  // argument registers already hold exactly what pthread_cond_init needs.
  //
  // FRONTIER CALLEES (one, TRUE OUT-OF-SCOPE extern)
  //   * _pthread_cond_init @ProCore stub 0xdea80 — POSIX pthread primitive
  //     (libSystem.B.dylib), OUTSIDE the 5-framework port scope.  Same policy
  //     as signal()'s _pthread_cond_signal and every other pthread callee in
  //     this port (see PCSemaphore.ts, PCMutex.ts): we raise, not paper-over.
  // ═════════════════════════════════════════════════════════════════════════
  /**
   * `PCConditionVariable::PCConditionVariable()` — @ProCore 0x34274
   * (__ZN19PCConditionVariableC1Ev).
   *
   * Faithful transcription of the disassembly above.  The entire body is: a
   * frame prologue, `xorl %esi,%esi` (attr = nullptr), an immediate epilogue,
   * and a tail-jmp to `_pthread_cond_init` with `this` untouched in %rdi.
   * Since pthread is a TRUE out-of-scope extern (POSIX primitive; not modeled
   * in the TS port), we raise rather than paper over the boundary — identical
   * policy to signal()'s _pthread_cond_signal tail-jmp.
   */
  constructor() {
    // @0x34274..0x34275 — frame prologue (transcribed as JS scope entry).
    // @0x34278 — xorl %esi,%esi: 2nd arg (pthread_condattr_t*) = nullptr.
    // No offset adjustment on %rdi; the pthread_cond_t is at this+0x0 (same
    // as signal()'s untouched-%rdi tail-jmp).  %rdi already holds the correct
    // 1st argument for the tail-jmp.
    void this.cond_at_0x0;
    // @0x3427a..0x3427b — popq %rbp; jmp _pthread_cond_init (tail-call) with
    // args (this, nullptr).  POSIX pthread — TRUE out-of-scope extern
    // (libSystem.B.dylib stub @ProCore 0xdea80).  We raise, not paper-over.
    // Same policy as signal()'s _pthread_cond_signal and the pthread_* callees
    // in PCSemaphore.ts / PCMutex.ts.
    throw new Error(
      "PCConditionVariable::PCConditionVariable() requires _pthread_cond_init(this, nullptr) " +
        "@ProCore 0x3427b (POSIX pthread stub @0xdea80) — pthread primitives " +
        "are not modeled in TS. " +
        "@0x34274",
    );
  }

  // ═════════════════════════════════════════════════════════════════════════
  // PCConditionVariable::signal()
  //
  // Disassembly source:
  //   raw-port/re/disasm/ProCore.__ZN19PCConditionVariable6signalEv.s
  //
  // FULL DISASM
  //   0x3431c  pushq  %rbp                              ; frame prologue
  //   0x3431d  movq   %rsp, %rbp
  //   0x34320  popq   %rbp                              ; frame epilogue
  //   0x34321  jmp    _pthread_cond_signal              ; TAIL-CALL
  //                                                    ;   (POSIX stub
  //                                                    ;    @ProCore 0xdea86)
  //
  // Tail-call jmp (not callq) — the epilogue already restored rbp, so the
  // return address on the stack sends the pthread stub's return straight
  // back to signal's caller.  Semantically:
  //     return _pthread_cond_signal(this);
  // The compiler chose a straight tail-jmp because %rdi already holds the
  // exact argument required by pthread_cond_signal (a pointer to the
  // pthread_cond_t at this+0x0) — no register shuffling, no argument
  // adjustment, no wrapper work.
  //
  // FRONTIER CALLEES (one, TRUE OUT-OF-SCOPE extern)
  //   * _pthread_cond_signal @ProCore stub 0xdea86 — POSIX pthread
  //     primitive.  Same policy as PCMutex::unlock's _pthread_mutex_unlock:
  //     pthread primitives are not modeled in TS; we raise, not paper-over.
  // ═════════════════════════════════════════════════════════════════════════
  /**
   * `PCConditionVariable::signal()` — @ProCore 0x3431c
   * (__ZN19PCConditionVariable6signalEv).
   *
   * Faithful transcription of the disassembly above.  The entire body is:
   * a frame prologue, an immediate epilogue, and a tail-jmp to
   * `_pthread_cond_signal` with `this` untouched in %rdi.  Since pthread
   * is a TRUE out-of-scope extern (POSIX primitive; not modeled in the
   * TS port — see PCMutex.ts's identical treatment of
   * `_pthread_mutex_unlock`), we raise rather than paper over the
   * boundary.
   */
  signal(): void {
    // @0x3431c..0x3431d — frame prologue (transcribed as JS scope entry).
    // No offset adjustment on %rdi (contrast PCMutex::unlock @0x34848
    // which does `addq $0x8, %rdi` to reach an embedded pthread_mutex_t
    // at this+0x8).  The pthread_cond_t is at this+0x0; %rdi already
    // holds the correct argument for the tail-jmp.
    void this.cond_at_0x0;
    // @0x34320..0x34321 — popq %rbp; jmp _pthread_cond_signal (tail-call).
    // POSIX pthread — TRUE out-of-scope extern (libSystem.B.dylib stub
    // @ProCore 0xdea86).  We raise, not paper-over.  Same policy as the
    // pthread_mutex_* callees in PCMutex.ts and every other pthread
    // callee in this port.
    throw new Error(
      "PCConditionVariable::signal() requires _pthread_cond_signal on `this` " +
        "@ProCore 0x34321 (POSIX pthread stub @0xdea86) — pthread primitives " +
        "are not modeled in TS. " +
        "@0x3431c",
    );
  }

  // ═════════════════════════════════════════════════════════════════════════
  // PCConditionVariable::broadcast()
  //
  // Disassembly source:
  //   raw-port/re/disasm/ProCore.__ZN19PCConditionVariable9broadcastEv.s
  //
  // FULL DISASM — every instruction of the function
  //   0x34326  pushq  %rbp                              ; frame prologue
  //   0x34327  movq   %rsp, %rbp
  //   0x3432a  popq   %rbp                              ; frame epilogue
  //   0x3432b  jmp    _pthread_cond_broadcast           ; TAIL-CALL
  //                                                    ;   (POSIX stub
  //                                                    ;    @ProCore 0xdea74)
  //
  // The same four-instruction shape as signal() @0x3431c, differing only in
  // the jmp target — `_pthread_cond_broadcast` (stub @0xdea74) instead of
  // `_pthread_cond_signal` (stub @0xdea86).  Tail-call jmp (not callq): the
  // epilogue already restored rbp, so the pthread stub returns straight to
  // broadcast's caller.  Semantically:
  //     return _pthread_cond_broadcast(this);
  // No offset adjustment on %rdi (contrast PCMutex::unlock @0x34848, which
  // does `addq $0x8, %rdi` to reach an embedded pthread_mutex_t at this+0x8):
  // %rdi still holds `this` untouched, so the pthread_cond_t is at this+0x0 —
  // consistent with signal() and the C1 ctor, and MEASURED below rather than
  // inferred.
  //
  // FRONTIER CALLEES (one, TRUE OUT-OF-SCOPE extern)
  //   * _pthread_cond_broadcast @ProCore stub 0xdea74 (called via TAIL-JMP
  //     @0x3432b).  POSIX pthread — outside the 5-framework port scope
  //     (libSystem.B.dylib).  Modeled as a boundary throw, identical policy to
  //     signal()'s _pthread_cond_signal, the ctor's _pthread_cond_init, and
  //     every pthread callee in PCMutex.ts / PCSemaphore.ts.
  //
  // ORACLE — raw-port/re/oracle/PCConditionVariable_broadcast_oracle.py, run
  // under `arch -x86_64 /usr/bin/python3` (every address here is an x86_64
  // offset; an arm64 vmaddr would land on another function and fail silently
  // toward VERIFIED).  A boundary throw has no return value to compare, so
  // what the differential settles is every factual claim above, and each
  // control can fail:
  //   * the body bytes are re-derived from the mapped image
  //     (55 48 89 e5 | 5d | e9 44 a7 0a 00), with a one-byte-off negative
  //     control that fails as it must;
  //   * the jmp's rel32 decodes to 0xdea74 — the stub the disasm names;
  //   * the stub's `ff 25 disp32` lazy pointer is read AFTER binding and holds
  //     exactly dlsym(RTLD_DEFAULT, "pthread_cond_broadcast"), so the callee
  //     identity is measured rather than taken from otool's comment;
  //   * OFFSET CONTROL for `this+0x0`: a real pthread_cond_init'ed cond at the
  //     start of an arena, broadcast through the live FCP wrapper, returns 0 —
  //     while the same call at arena+0x8 (the PCMutex layout) returns EINVAL
  //     (22).  If the wrapper adjusted the pointer, those two results would
  //     swap;
  //   * PASS-THROUGH: libSystem's own pthread_cond_broadcast on the same cond
  //     agrees (0), so the wrapper contributes nothing but the jmp.
  // ═════════════════════════════════════════════════════════════════════════
  /**
   * `PCConditionVariable::broadcast()` — @ProCore 0x34326
   * (__ZN19PCConditionVariable9broadcastEv).
   *
   * Faithful transcription of the disassembly above.  The entire body is: a
   * frame prologue, an immediate epilogue, and a tail-jmp to
   * `_pthread_cond_broadcast` with `this` untouched in %rdi.  Since pthread
   * is a TRUE out-of-scope extern (POSIX primitive; not modeled in the TS
   * port — see this class's `signal()` and PCMutex.ts's identical treatment
   * of `_pthread_mutex_unlock`), we raise rather than paper over the
   * boundary.
   */
  broadcast(): void {
    // @0x34326..0x34327 — frame prologue (transcribed as JS scope entry).
    // No offset adjustment on %rdi; the pthread_cond_t is at this+0x0 (the
    // oracle's +0x8 control returns EINVAL, so this is measured).  %rdi
    // already holds the correct argument for the tail-jmp.
    void this.cond_at_0x0;
    // @0x3432a..0x3432b — popq %rbp; jmp _pthread_cond_broadcast (tail-call).
    // POSIX pthread — TRUE out-of-scope extern (libSystem.B.dylib stub
    // @ProCore 0xdea74).  We raise, not paper-over.  Same policy as signal()
    // and the pthread_* callees in PCMutex.ts / PCSemaphore.ts.
    throw new Error(
      "PCConditionVariable::broadcast() requires _pthread_cond_broadcast on `this` " +
        "@ProCore 0x3432b (POSIX pthread stub @0xdea74) — pthread primitives " +
        "are not modeled in TS. " +
        "@0x34326",
    );
  }
}
