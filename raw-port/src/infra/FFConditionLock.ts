// FFConditionLock.ts — Flexo condition-lock (raw x86_64 port).
//
// Source: /Applications/Final Cut Pro.app/Contents/Frameworks/Flexo.framework/
//         Versions/A/Flexo (macOS FCP, x86_64 slice; unadjusted VAs).
//
// FFConditionLock is an OO wrapper around a POSIX mutex + condition variable
// (the classic "condition lock" primitive). The single ported method here is
// its base destructor [D1], which reinstalls the vptr then tears down the two
// embedded pthread primitives. Same modelling policy used across every pthread
// wrapper in this port (see raw-port/src/infra/PCMutex.ts ~PCMutex,
// raw-port/src/infra/PCConditionVariable.ts): the pthread calls are TRUE
// OUT-OF-SCOPE externs (libSystem.B.dylib) — we transcribe the exact
// instruction stream, cite @0xADDR provenance, and raise at the boundary
// rather than paper it over. This file is a FRESH class (not previously on
// origin/main); future FFConditionLock methods are separate ledger entries and
// must be ADDED to this file (additive extension only), never rewritten.
//
// -----------------------------------------------------------------------------
// STRUCT LAYOUT (partial — recovered only from the [D1] destructor)
// -----------------------------------------------------------------------------
// FFConditionLock {
//   0x00  void*             vptr           ; Itanium C++ vtable pointer.
//                                          ;   [D1] reinstalls it @0x12b9479/
//                                          ;   0x12b9480 (leaq vtable+off; movq
//                                          ;   %rax,(%rdi)); target file addr
//                                          ;   0x1925780 (= 0x12b9480+0x66c300).
//   0x18  pthread_mutex_t   mutex          ; embedded POSIX mutex. [D1] passes
//                                          ;   &this[+0x18] to
//                                          ;   _pthread_mutex_destroy @0x12b9493.
//   0x58  pthread_cond_t    cond           ; embedded POSIX condition variable.
//                                          ;   [D1] passes &this[+0x58] to
//                                          ;   _pthread_cond_destroy @0x12b9487.
// }
//
// -----------------------------------------------------------------------------
// FULL DISASM (raw-port/re/disasm/Flexo.__ZN15FFConditionLockD1Ev.s — 20 lines)
// -----------------------------------------------------------------------------
//   __ZN15FFConditionLockD1Ev:
//     0x12b9470  pushq  %rbp
//     0x12b9471  movq   %rsp, %rbp
//     0x12b9474  pushq  %rbx
//     0x12b9475  pushq  %rax
//     0x12b9476  movq   %rdi, %rbx                    ; rbx = this
//     0x12b9479  leaq   0x66c300(%rip), %rax          ; rax = vtable_for_FFConditionLock
//                                                     ;   (file addr 0x1925780)
//     0x12b9480  movq   %rax, (%rdi)                  ; this->vptr = rax
//     0x12b9483  addq   $0x58, %rdi                   ; rdi = &this->cond   (this+0x58)
//     0x12b9487  callq  _pthread_cond_destroy         ; _pthread_cond_destroy(&this->cond)
//     0x12b948c  addq   $0x18, %rbx                   ; rbx = &this->mutex  (this+0x18)
//     0x12b9490  movq   %rbx, %rdi
//     0x12b9493  callq  _pthread_mutex_destroy        ; _pthread_mutex_destroy(&this->mutex)
//     0x12b9498  addq   $0x8, %rsp
//     0x12b949c  popq   %rbx
//     0x12b949d  popq   %rbp
//     0x12b949e  retq
//     0x12b949f  movq   %rax, %rdi                    ; landing pad ->
//     0x12b94a2  callq  ___clang_call_terminate       ;   std::terminate (throwing dtor)
//
// -----------------------------------------------------------------------------
// FRONTIER CALLEES (both TRUE OUT-OF-SCOPE externs)
// -----------------------------------------------------------------------------
//   * _pthread_cond_destroy   @0x12b9487  — POSIX pthread (libSystem.B.dylib).
//   * _pthread_mutex_destroy  @0x12b9493  — POSIX pthread (libSystem.B.dylib).
//     Same boundary policy as PCMutex::~PCMutex's _pthread_mutex_destroy and
//     PCConditionVariable's _pthread_cond_signal. The FIRST extern reached
//     (_pthread_cond_destroy @0x12b9487) is the modeled boundary; the vptr
//     reinstall @0x12b9479/0x12b9480 is transcribed above it.
//   * ___clang_call_terminate @0x12b94a2 — libc++ terminate handler (landing
//     pad for a throwing pthread destroy inside a dtor). Out-of-scope.
//
// -----------------------------------------------------------------------------
// Symbols ported here (mangled → address)
// -----------------------------------------------------------------------------
//   * __ZN15FFConditionLockD1Ev
//       — FFConditionLock::~FFConditionLock() [D1 base destructor] @Flexo 0x12b9470
//         (raw-port/re/disasm/Flexo.__ZN15FFConditionLockD1Ev.s — 20 lines)

/** Opaque pthread_mutex_t handle — embedded @+0x18 of the FFConditionLock
 *  object. Not modeled here — POSIX primitive, OUT-OF-SCOPE boundary extern
 *  (libSystem.B.dylib), same policy as PCMutex's pthread_mutex_t handle. */
export type PthreadMutex = object;

/** Opaque pthread_cond_t handle — embedded @+0x58 of the FFConditionLock
 *  object. Not modeled here — POSIX primitive, OUT-OF-SCOPE boundary extern
 *  (libSystem.B.dylib), same policy as PCConditionVariable's cond handle. */
export type PthreadCond = object;

/**
 * `FFConditionLock` — instance shape decoded from the [D1] destructor alone.
 *
 * The destructor reinstalls the vptr at this+0x0, then destroys an embedded
 * pthread_mutex_t at this+0x18 and pthread_cond_t at this+0x58. Only these
 * three offsets are derivable from the [D1] disasm; the rest of the object is
 * OPAQUE (undecoded) and intentionally NOT modeled — future ports of other
 * FFConditionLock methods will add fields as their addresses are read.
 */
export class FFConditionLock {
  /**
   * (this+0x00) — Itanium C++ vtable pointer. The [D1] destructor reinstalls
   * it (@0x12b9479 leaq vtable_for_FFConditionLock, @0x12b9480 movq %rax,(%rdi));
   * the loaded address is the Flexo file addr 0x1925780
   * (= next-instr 0x12b9480 + RIP displacement 0x66c300). There is no real
   * C++ vtable in the TS port, so this is modeled as an opaque slot so the
   * machine's write is not silently dropped.
   */
  vptr_at_0x0: object | null = null;

  /**
   * (this+0x18) — the embedded POSIX pthread_mutex_t. [D1] passes &this[+0x18]
   * to `_pthread_mutex_destroy` (@0x12b948c addq $0x18,%rbx; @0x12b9493 callq).
   * Opaque here; POSIX primitive.
   */
  mutex_at_0x18: PthreadMutex | null = null;

  /**
   * (this+0x58) — the embedded POSIX pthread_cond_t. [D1] passes &this[+0x58]
   * to `_pthread_cond_destroy` (@0x12b9483 addq $0x58,%rdi; @0x12b9487 callq).
   * Opaque here; POSIX primitive.
   */
  cond_at_0x58: PthreadCond | null = null;

  /**
   * `FFConditionLock::~FFConditionLock()` [D1 base destructor] @Flexo 0x12b9470
   *   — __ZN15FFConditionLockD1Ev
   *
   * Canonical Itanium-ABI base destructor:
   *   1. Reinstall the FFConditionLock vptr at this+0x0
   *      (@0x12b9479 leaq vtable_for_FFConditionLock (file 0x1925780);
   *       @0x12b9480 movq %rax,(%rdi)).
   *   2. Destroy the embedded pthread_cond_t at this+0x58
   *      (@0x12b9483 addq $0x58,%rdi; @0x12b9487 callq _pthread_cond_destroy).
   *   3. Destroy the embedded pthread_mutex_t at this+0x18
   *      (@0x12b948c addq $0x18,%rbx; @0x12b9493 callq _pthread_mutex_destroy).
   *
   * Both pthread destroys are TRUE OUT-OF-SCOPE externs (POSIX,
   * libSystem.B.dylib) — not modeled in TS, same policy as PCMutex::~PCMutex.
   * The FIRST extern reached (_pthread_cond_destroy @0x12b9487) is the boundary;
   * the vptr reinstall is transcribed above it so the machine's write is not
   * dropped. The @0x12b949f/0x12b94a2 landing pad
   * (___clang_call_terminate — std::terminate on a throwing pthread destroy
   * inside a dtor) is a libc++ terminate handler, also out-of-scope.
   *
   * Source disassembly:
   *   raw-port/re/disasm/Flexo.__ZN15FFConditionLockD1Ev.s (20 lines)
   */
  destruct(this: FFConditionLock): void {
    // @0x12b9479 leaq vtable_for_FFConditionLock (Flexo file 0x1925780 =
    //   0x12b9480 + 0x66c300); @0x12b9480 movq %rax,(%rdi): this->vptr = rax.
    // Purely-informational vptr install; mirrored as an opaque slot write so
    // the machine's store is not silently dropped.
    const VTABLE_FOR_FFCONDITIONLOCK /* @0x12b9479 (Flexo file 0x1925780) */ =
      { __opaque_vtable_FFConditionLock: true } as const;
    this.vptr_at_0x0 = VTABLE_FOR_FFCONDITIONLOCK;

    // @0x12b9483 addq $0x58,%rdi -> &this->cond; @0x12b9487 callq
    //   _pthread_cond_destroy(&this->cond) — TRUE OUT-OF-SCOPE extern (POSIX,
    //   libSystem.B.dylib). We raise at the boundary, not paper it over. The
    //   subsequent _pthread_mutex_destroy(&this->mutex) @0x12b9493 (POSIX) is
    //   therefore unreachable through TS and cited in the message.
    throw new Error(
      "FFConditionLock::~FFConditionLock [D1] requires _pthread_cond_destroy on " +
        "&this[+0x58] @Flexo 0x12b9487 then _pthread_mutex_destroy on &this[+0x18] " +
        "@Flexo 0x12b9493 (POSIX pthread stubs, libSystem.B.dylib) — pthread " +
        "primitives are not modeled in TS. Vptr reinstall @0x12b9479/0x12b9480 " +
        "(vtable_for_FFConditionLock = Flexo file 0x1925780) is transcribed above. " +
        "@0x12b9470",
    );

    // @0x12b9498..0x12b949e (unreachable after throw): addq $0x8,%rsp; popq
    //   %rbx; popq %rbp; retq.
    // @0x12b949f..0x12b94a2 landing pad: movq %rax,%rdi; callq
    //   ___clang_call_terminate — std::terminate on unwinding pthread destroy
    //   inside a dtor. Out-of-scope (libc++ terminate handler).
  }
}
