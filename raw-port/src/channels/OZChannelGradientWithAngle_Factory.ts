// OZChannelGradientWithAngle_Factory — ProChannel factory singleton for
// OZChannelGradientWithAngle.
//
// Transcribed from /Applications/Final Cut Pro.app/Contents/Frameworks/
// ProChannel.framework/Versions/A/ProChannel (x86_64 slice; unadjusted
// VAs from `otool -tV`). Disassembly source:
//   raw-port/re/disasm/ProChannel.__ZN34OZChannelGradientWithAngle_Factory11getInstanceEv.s
//
// This unit ports ONLY the `getInstance()` static singleton accessor at
// @ProChannel 0x27ac. Per the "one class per file" rule this file will
// gain more methods on OZChannelGradientWithAngle_Factory only when they
// are individually claimed from the ledger (never a rewrite / drop of
// what is already here — additive extension only).
//
// -----------------------------------------------------------------------------
// PROCESS-GLOBAL STORAGE (the two symbols getInstance reads/writes)
// -----------------------------------------------------------------------------
// Two BSS globals live at fixed addresses in ProChannel, each holding one
// 8-byte word:
//
//   __ZN34OZChannelGradientWithAngle_Factory13_instanceOnceE
//     — the libc++ std::once_flag word (an `unsigned long` in libc++'s
//       __call_once implementation). Semantics: value 0 = "not yet
//       started", intermediate values = "another thread is currently
//       running init", value -1 = "init completed successfully"
//       (libc++ writes ~0UL on completion). The `cmpq $-1, %rax` at
//       @0x27be is the standard libc++ fast-path check for "init done".
//
//   __ZN34OZChannelGradientWithAngle_Factory9_instanceE
//     — an `OZChannelGradientWithAngle_Factory*` (pointer to the
//       singleton instance). Written by the lambda that
//       std::__call_once invokes on first call; read by getInstance
//       @0x27e9.
//
// -----------------------------------------------------------------------------
// FRONTIER CALLEES (all TRUE OUT-OF-SCOPE externs or SEPARATE ledger units)
// -----------------------------------------------------------------------------
//   * __ZNSt3__111__call_onceERVmPvPFvS2_E
//       — std::__1::__call_once(flag&, void*, void(*)(void*))
//       — libc++ (libc++.dylib) — TRUE out-of-scope extern. Called
//         @0x27e4 via ProChannel stub 0xacdc8. Same policy as
//         OZChannelBase_Factory (see peer file).
//
//   * __ZNSt3__117__call_once_proxyB9nqe210106<
//         tuple<OZChannelGradientWithAngle_Factory::getInstance()::'lambda'()&&>>(void*)
//       — libc++ template instantiation. NOT called directly by
//         getInstance — it is PASSED AS A DATA REFERENCE (function
//         pointer, `leaq ..., %rdx` @0x27dd) to __call_once. A separate
//         ledger unit (allocates the singleton via `operator new` +
//         C2 base ctor). We model the boundary here; the proxy is a
//         throw stub that cites the ProChannel addresses of the calls
//         it will contain once its own ledger entry is claimed.
//
// -----------------------------------------------------------------------------
// Symbols ported here (mangled → address)
// -----------------------------------------------------------------------------
//   * __ZN34OZChannelGradientWithAngle_Factory11getInstanceEv
//       — OZChannelGradientWithAngle_Factory::getInstance()
//         @ProChannel 0x27ac
//
// -----------------------------------------------------------------------------
// FULL DISASM
// -----------------------------------------------------------------------------
//   0x27ac  pushq  %rbp                              ; frame prologue
//   0x27ad  movq   %rsp, %rbp
//   0x27b0  subq   $0x20, %rsp                       ; 32-byte local frame
//                                                    ; (holds the libc++
//                                                    ; tuple<lambda&&> ABI
//                                                    ; scaffolding for
//                                                    ; __call_once).
//   0x27b4  leaq   _instanceOnce(%rip), %rax         ; rax = &_instanceOnce
//   0x27bb  movq   (%rax), %rax                      ; rax = _instanceOnce
//   0x27be  cmpq   $-0x1, %rax                       ; already-init check
//                                                    ; (libc++ writes ~0UL
//                                                    ; on completion)
//   0x27c2  je     0x27e9                            ; fast path: skip call_once
//   0x27c4  leaq   -0x1(%rbp), %rax                  ; rax = &frame[-1] (1-byte
//                                                    ; slot for the captureless
//                                                    ; lambda; libc++'s
//                                                    ; tuple<T&&> needs a
//                                                    ; stable address).
//   0x27c8  leaq   -0x18(%rbp), %rcx                 ; rcx = &frame[-0x18]
//                                                    ; (the tuple<T&&> slot)
//   0x27cc  movq   %rax, (%rcx)                      ; tuple.head = &lambda-slot
//   0x27cf  leaq   -0x10(%rbp), %rsi                 ; rsi = &frame[-0x10]
//                                                    ; (call_once's void* arg)
//   0x27d3  movq   %rcx, (%rsi)                      ; *arg = &tuple
//                                                    ; (the void* passed to
//                                                    ; __call_once_proxy)
//   0x27d6  leaq   _instanceOnce(%rip), %rdi         ; rdi = &_instanceOnce
//   0x27dd  leaq   __call_once_proxy<...>(%rip), %rdx; rdx = &proxy_func
//                                                    ; (function pointer)
//   0x27e4  callq  std::__call_once                   ; libc++ stub @0xacdc8
//                                                    ; signature:
//                                                    ; (once_flag& = %rdi,
//                                                    ;  void* arg   = %rsi,
//                                                    ;  void(*)(void*) = %rdx)
//   0x27e9  leaq   _instance(%rip), %rax             ; rax = &_instance
//   0x27f0  movq   (%rax), %rax                      ; rax = _instance
//                                                    ; (the return value: the
//                                                    ; singleton pointer, or
//                                                    ; NULL if init raised)
//   0x27f3  addq   $0x20, %rsp                       ; frame epilogue
//   0x27f7  popq   %rbp
//   0x27f8  retq
//   0x27f9  nop

// ═════════════════════════════════════════════════════════════════════════
// Process-global BSS slots — one 8-byte word each. Modelled as
// module-scope `let`s. Initial state mirrors zero-filled Mach-O BSS:
//   _instanceOnce = 0n  ("not yet initialised" — libc++ once_flag zero)
//   _instance     = null (nullptr — no singleton allocated yet)
// ═════════════════════════════════════════════════════════════════════════

/** @ProChannel BSS `__ZN34OZChannelGradientWithAngle_Factory13_instanceOnceE`.
 *  libc++ std::once_flag. 0n = not started; -1n (0xFFFF_FFFF_FFFF_FFFF)
 *  = completed. getInstance compares to $-1 @0x27be. */
let _instanceOnce: bigint = 0n; // @ProChannel BSS 0x27b4 read-site

/** @ProChannel BSS `__ZN34OZChannelGradientWithAngle_Factory9_instanceE`.
 *  The singleton pointer. Read @0x27e9-0x27f0 (the return value).
 *  Written by the __call_once_proxy lambda (separate ledger entry). */
let _instance: OZChannelGradientWithAngle_Factory | null = null; // @ProChannel BSS 0x27e9

/**
 * `std::__1::__call_once(flag&, void* arg, void(*)(void*))` — libc++
 * (libc++.dylib). Called @0x27e4 via ProChannel stub 0xacdc8. TRUE
 * out-of-scope extern. Modelled here (as in peer factories) with the
 * "run once atomically" contract at the JS single-threaded level. If
 * the proxy throws, the flag stays 0 and a later call retries —
 * exactly matching libc++ (which only writes ~0UL on successful
 * completion). This is the minimum behaviour getInstance's disasm
 * relies on (the fast-path @0x27be `cmp $-1` check). */
function std_call_once(
  once: { get(): bigint; set(v: bigint): void },
  arg: unknown,
  proxy: (arg: unknown) => void,
): void {
  // libc++ fast-path: already completed?
  if (once.get() === -1n) return; // (mirrors 0x27be fast-path exit)
  // First-call slow path (single-threaded model — no atomic CAS in JS).
  proxy(arg);
  once.set(-1n);
}

/**
 * `__ZNSt3__117__call_once_proxy<...OZChannelGradientWithAngle_Factory::getInstance()::lambda...>`
 * — libc++ template instantiation whose body unpacks the tuple and
 * invokes the captureless lambda. The lambda body allocates a fresh
 * OZChannelGradientWithAngle_Factory via `operator new` and invokes
 * `OZChannelGradientWithAngle_Factory::OZChannelGradientWithAngle_Factory()`
 * (the C2 base ctor, __ZN34OZChannelGradientWithAngle_FactoryC2Ev),
 * then stores the pointer into `_instance`.
 *
 * That entire proxy+lambda pair is a SEPARATE ledger unit (its
 * mangled name is __ZNSt3__117__call_once_proxyB9nqe210106... — a
 * template instantiation, not this method). It is passed as data to
 * __call_once (via `leaq ..., %rdx` @0x27dd) — never called directly
 * from getInstance. We stub it with an @0xADDR-citing throw so that
 * (a) any first-call code path loudly surfaces the deferred work and
 * (b) later ledger claims can drop in the real body without touching
 * this file's ported getInstance. */
function __call_once_proxy_getInstance_lambda(_arg: unknown): void {
  throw new Error(
    "OZChannelGradientWithAngle_Factory::getInstance() __call_once init " +
      "lambda not yet transcribed — the lambda body allocates a " +
      "OZChannelGradientWithAngle_Factory via `operator new` (__Znwm, " +
      "ProChannel stub 0xace4c) and invokes " +
      "__ZN34OZChannelGradientWithAngle_FactoryC2Ev (C2 base ctor, " +
      "ledger status: todo), then stores the result into _instance. The " +
      "proxy is a template instantiation " +
      "(__ZNSt3__117__call_once_proxyB9nqe210106<...>) that is passed as " +
      "a function-pointer argument to std::__call_once at ProChannel " +
      "0x27e4 (data reference @0x27dd). It is a SEPARATE ledger unit " +
      "and will be filled in when it is next claimed.",
  );
}

// ═════════════════════════════════════════════════════════════════════════
// The class
// ═════════════════════════════════════════════════════════════════════════

/**
 * `OZChannelGradientWithAngle_Factory` — factory singleton for
 * OZChannelGradientWithAngle channel instances. Only its getInstance()
 * accessor is ported in this file; every other method is a separate
 * ledger entry.
 */
export class OZChannelGradientWithAngle_Factory {
  /**
   * `OZChannelGradientWithAngle_Factory::getInstance()`
   * — @ProChannel 0x27ac
   * (__ZN34OZChannelGradientWithAngle_Factory11getInstanceEv).
   *
   * Faithful line-for-line transcription of the disassembly quoted in
   * the file header. Standard libc++ std::call_once-guarded singleton
   * accessor:
   *
   *   1. Read the once_flag; if it equals $-1 (~0UL, libc++'s "init
   *      complete" sentinel) at @0x27be, skip straight to step 3.
   *
   *   2. Set up the stack tuple that libc++'s __call_once ABI expects
   *      (two-level indirection: `arg` -> `tuple.head` -> lambda's
   *      1-byte storage) @0x27c4..0x27d3, then call
   *      std::__call_once(&_instanceOnce, arg, &proxy) @0x27e4. The
   *      proxy unpacks the tuple, invokes the lambda, which allocates
   *      + constructs the singleton and writes `_instance`.
   *
   *   3. Return `_instance` @0x27e9..0x27f0 (whatever the initializer
   *      wrote — or NULL if the initializer threw).
   *
   * The stack tuple / captureless-lambda dance @0x27c4..0x27d3 is a
   * libc++ ABI artefact — the caller side just does "call call_once
   * with the proxy pointer" and doesn't observe the intermediate
   * slots. In this port we don't need to model the two stack slots
   * because std_call_once (above) invokes the proxy directly
   * (single-threaded, no ABI marshalling needed). The disasm's stack
   * setup is documented in the header for provenance.
   */
  static getInstance(): OZChannelGradientWithAngle_Factory | null {
    // ------------------------------------------------------------
    // @0x27ac..0x27b0 — prologue + 0x20-byte local frame.
    // (No TS-visible effect.)
    // @0x27b4..0x27bb — rax = _instanceOnce.
    // @0x27be..0x27c2 — if (_instanceOnce == -1) goto fast_path (0x27e9).
    // ------------------------------------------------------------
    if (_instanceOnce !== -1n) {
      // ------------------------------------------------------------
      // @0x27c4..0x27d3 — set up libc++ tuple<lambda&&> on the stack.
      // (ABI-level, no TS-visible effect — the proxy just needs a
      // stable void* to dispatch through; we pass a null placeholder.)
      // @0x27d6 — rdi = &_instanceOnce.
      // @0x27dd — rdx = &__call_once_proxy<...lambda...>.
      // @0x27e4 — callq std::__call_once (libc++ stub @0xacdc8).
      // ------------------------------------------------------------
      std_call_once(
        {
          get: (): bigint => _instanceOnce, // (mirrors `movq (%rax),%rax` @0x27bb read-side)
          set: (v: bigint): void => {
            _instanceOnce = v;
          },
        },
        null, // ABI void* — the real disasm passes &tuple; our proxy ignores it.
        __call_once_proxy_getInstance_lambda,
      );
    }
    // ------------------------------------------------------------
    // @0x27e9..0x27f0 — rax = _instance.
    // @0x27f3..0x27f8 — epilogue + retq.
    // ------------------------------------------------------------
    return _instance;
  }
}
