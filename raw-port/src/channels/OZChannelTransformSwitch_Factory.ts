// OZChannelTransformSwitch_Factory — ProChannel factory singleton for its target class.
//
// Transcribed from /Applications/Final Cut Pro.app/Contents/Frameworks/
// ProChannel.framework/Versions/A/ProChannel (x86_64 slice; unadjusted
// VAs from `otool -tV`). Disassembly source:
//   raw-port/re/disasm/ProChannel.__ZN32OZChannelTransformSwitch_Factory11getInstanceEv.s
//
// This unit ports ONLY the `getInstance()` static singleton accessor at
// @0x24ee. Its shape is identical to every other *_Factory::getInstance
// in ProChannel — the standard libc++ std::call_once-guarded singleton
// (compare to OZChannelBase_Factory @0x1786 and
// OZChannelAngleOverRange_Factory @0x2404, both already ported). Every
// remaining method on this factory (C2/D1/D0/create/createChannel/etc.)
// is a separate ledger entry and is OUT OF SCOPE for this file (per the
// "one class per file" rule, extending this file with more methods
// later is the correct workflow, not creating a sibling).
//
// -----------------------------------------------------------------------------
// PROCESS-GLOBAL STORAGE (the two symbols getInstance reads/writes)
// -----------------------------------------------------------------------------
//   __ZN32OZChannelTransformSwitch_Factory13_instanceOnceE
//     — the libc++ std::once_flag word (an `unsigned long` in libc++'s
//       __call_once implementation). Semantics: value 0 = "not yet
//       started", intermediate values = "another thread is currently
//       running init", value -1 = "init completed successfully"
//       (libc++ writes ~0UL on completion). The `cmpq $-1, %rax` at
//       @0x2500 is the standard libc++ fast-path check.
//
//   __ZN32OZChannelTransformSwitch_Factory9_instanceE
//     — a `OZChannelTransformSwitch_Factory*` (pointer to the singleton instance).
//       Written by the lambda that std::__call_once invokes on first
//       call; read by getInstance @0x252b.
//
// -----------------------------------------------------------------------------
// FRONTIER CALLEES (all TRUE OUT-OF-SCOPE externs or SEPARATE ledger units)
// -----------------------------------------------------------------------------
//   * __ZNSt3__111__call_onceERVmPvPFvS2_E
//       — std::__1::__call_once(flag&, void*, void(*)(void*))
//       — libc++ (libc++.dylib) — TRUE out-of-scope extern. Called
//         @0x2526 via ProChannel stub 0xacdc8 (same stub as every
//         other *_Factory::getInstance in ProChannel; see
//         OZChannelBase_Factory for the identical dispatch).
//
//   * __ZNSt3__117__call_once_proxyB9nqe210106<
//         tuple<OZChannelTransformSwitch_Factory::getInstance()::'lambda'()&&>>(void*)
//       — libc++ template instantiation that unpacks the tuple and
//         invokes the lambda. NOT called by getInstance directly — it is
//         PASSED AS A DATA REFERENCE (a function-pointer argument) to
//         __call_once, which then dispatches through it. The proxy body
//         (a separate ledger entry NOT in this file's scope) allocates
//         the singleton via `operator new` and invokes the C2 base ctor
//         `__ZN32OZChannelTransformSwitch_FactoryC2Ev`, then stores the result into `_instance`.
//         It is a TRANSITIVE dependency of getInstance, but not a DIRECT
//         callee — getInstance's disasm only names __call_once as a
//         call target (all other refs are `leaq` data references or
//         memory loads).
//
//         Faithful modelling: getInstance's body executes std::call_once
//         and then reads `_instance`. If the initializer runs and
//         succeeds, `_instance` is the fresh pointer; if the initializer
//         raises (the proxy body is a separate ledger unit and not yet
//         ported, so it currently throws), std::__call_once propagates
//         the throw and _instance remains null. Both branches are
//         faithful to the disassembly.
//
// -----------------------------------------------------------------------------
// Symbols ported here (mangled → address)
// -----------------------------------------------------------------------------
//   * __ZN32OZChannelTransformSwitch_Factory11getInstanceEv
//       — OZChannelTransformSwitch_Factory::getInstance() @ProChannel 0x24ee
//
// -----------------------------------------------------------------------------
// FULL DISASM (raw-port/re/disasm/ProChannel.__ZN32OZChannelTransformSwitch_Factory11getInstanceEv.s)
// -----------------------------------------------------------------------------
//   0x24ee  pushq  %rbp                              ; frame prologue
//   ...    movq   %rsp, %rbp
//   0x24f2  subq   $0x20, %rsp                       ; 32-byte local frame
//                                                    ; (holds a 3-word libc++
//                                                    ; "tuple<lambda&&>" plus
//                                                    ; alignment padding)
//   0x24f6  leaq   _instanceOnce(%rip), %rax         ; rax = &_instanceOnce
//   ...    movq   (%rax), %rax                      ; rax = _instanceOnce
//   0x2500  cmpq   $-0x1, %rax                       ; already-init check
//                                                    ; (libc++ writes ~0UL
//                                                    ; on completion)
//   ...    je     0x252b                            ; fast path: skip call_once
//   0x2506  leaq   -0x1(%rbp), %rax                  ; rax = &frame[-1] (1-byte
//                                                    ; captureless-lambda slot)
//   ...    leaq   -0x18(%rbp), %rcx                 ; rcx = &tuple<T&&> slot
//   ...    movq   %rax, (%rcx)                      ; tuple.head = &lambda-slot
//   ...    leaq   -0x10(%rbp), %rsi                 ; rsi = &call_once's void* arg
//   ...    movq   %rcx, (%rsi)                      ; *arg = &tuple
//   ...    leaq   _instanceOnce(%rip), %rdi         ; rdi = &_instanceOnce
//   ...    leaq   __call_once_proxy<...>(%rip), %rdx; rdx = &proxy_func
//   0x2526  callq  std::__call_once                   ; libc++ stub @0xacdc8
//                                                    ; (once_flag& = %rdi,
//                                                    ;  void* arg   = %rsi,
//                                                    ;  void(*)(void*) = %rdx)
//   0x252b  leaq   _instance(%rip), %rax             ; rax = &_instance
//   0x2532  movq   (%rax), %rax                      ; rax = _instance
//   0x2535  addq   $0x20, %rsp                       ; frame epilogue
//   ...    popq   %rbp
//   0x253a  retq
//   0x253b  nop                                       ; padding

// ═════════════════════════════════════════════════════════════════════════
// Process-global BSS slots. TS has no linker, so we model them as
// module-scope `let`s, initialised as-if zero-filled at load:
//   _instanceOnce = 0n  ("not yet initialised" — libc++ once_flag zero)
//   _instance     = null (nullptr — no singleton allocated yet)
// ═════════════════════════════════════════════════════════════════════════

/** @ProChannel BSS `__ZN32OZChannelTransformSwitch_Factory13_instanceOnceE`.
 *  libc++ std::once_flag word. Compared to $-1 @0x2500. */
let _instanceOnce: bigint = 0n; // @ProChannel BSS 0x24f6 read-site

/** @ProChannel BSS `__ZN32OZChannelTransformSwitch_Factory9_instanceE`.
 *  The singleton pointer. Read @0x252b-0x2532. */
let _instance: OZChannelTransformSwitch_Factory | null = null; // @ProChannel BSS 0x252b

/**
 * `std::__1::__call_once(flag&, void* arg, void(*)(void*))` — libc++
 * (libc++.dylib). Called from getInstance @0x2526 via ProChannel
 * stub 0xacdc8. TRUE out-of-scope extern (libc++ runtime). Modelled here
 * at the JS single-threaded level: on first call with a zero once_flag,
 * invoke proxy(arg) — if it completes without throwing, write $-1 into
 * the flag; on subsequent calls no-op. If proxy throws, flag stays 0 and
 * future calls retry, exactly like the real runtime (libc++'s ~0UL
 * completion-write is skipped on exception). */
function std_call_once(
  once: { get(): bigint; set(v: bigint): void },
  arg: unknown,
  proxy: (arg: unknown) => void,
): void {
  if (once.get() === -1n) return; // fast-path (mirrors @0x2500)
  proxy(arg);
  once.set(-1n);
}

/**
 * `__ZNSt3__117__call_once_proxy<...>` — libc++ template instantiation
 * for OZChannelTransformSwitch_Factory::getInstance()::'lambda'(). Body (a separate ledger
 * unit) is `jmp __invoke<...>`, which allocates a fresh OZChannelTransformSwitch_Factory
 * via `operator new` and invokes `__ZN32OZChannelTransformSwitch_FactoryC2Ev` (the C2 base ctor);
 * on success it stores the pointer into `_instance`. Neither the C2
 * ctor nor operator new are ported yet, so the proxy stub raises with
 * the exact frontier call-sites — the deferred work is transparently
 * documented and will resolve once those units are claimed. */
function __call_once_proxy_getInstance_lambda(_arg: unknown): void {
  throw new Error(
    "OZChannelTransformSwitch_Factory::getInstance() __call_once init lambda not yet " +
      "transcribed — the lambda body allocates via operator new " +
      "(__Znwm, libc++ extern) then invokes " +
      "__ZN32OZChannelTransformSwitch_FactoryC2Ev (C2 base ctor, separate " +
      "ledger unit — not yet ported) and stores the result into " +
      "_instance. This proxy lambda is a SEPARATE ledger unit and " +
      "will be filled in when it is next claimed. The proxy is " +
      "invoked from std::__call_once at ProChannel 0x2526.",
  );
}

/**
 * `OZChannelTransformSwitch_Factory` — factory singleton. Only its getInstance()
 * accessor is ported in this file; every other method is a separate
 * ledger entry.
 */
export class OZChannelTransformSwitch_Factory {
  /**
   * `OZChannelTransformSwitch_Factory::getInstance()` — @ProChannel 0x24ee
   * (__ZN32OZChannelTransformSwitch_Factory11getInstanceEv).
   *
   * Standard libc++ std::call_once-guarded singleton accessor:
   *   1. If once_flag == $-1 (init complete), jump straight to step 3.
   *   2. Otherwise call std::__call_once(&flag, arg, &proxy); the proxy
   *      allocates + constructs the singleton and writes _instance.
   *   3. Return `_instance` (null if the initializer threw).
   *
   * The stack tuple @0x2506.. is an ABI-level artefact of
   * libc++'s __call_once template instantiation; std_call_once (above)
   * invokes the proxy directly (single-threaded, no ABI marshaling
   * needed) so the intermediate slots have no TS-visible effect.
   */
  static getInstance(): OZChannelTransformSwitch_Factory | null {
    // @0x24ee..0x24f2: prologue + frame. No TS-visible effect.
    // @0x24f6: rax = _instanceOnce.
    // @0x2500: if (_instanceOnce == -1) goto 0x252b.
    if (_instanceOnce !== -1n) {
      // @0x2506..: set up libc++ tuple<lambda&&> on stack (ABI
      // artefact, no TS-visible effect — pass null).
      // @0x2526: callq std::__call_once (libc++ stub @0xacdc8).
      std_call_once(
        {
          get: (): bigint => _instanceOnce,
          set: (v: bigint): void => {
            _instanceOnce = v;
          },
        },
        null,
        __call_once_proxy_getInstance_lambda,
      );
    }
    // @0x252b..0x2532: rax = _instance.
    // @0x2535..0x253a: epilogue + retq.
    return _instance;
  }
}
