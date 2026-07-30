// OZChannelSeed_Factory — ProChannel factory singleton for OZChannelSeed.
//
// Transcribed from /Applications/Final Cut Pro.app/Contents/Frameworks/
// ProChannel.framework/Versions/A/ProChannel (x86_64 slice; unadjusted
// VAs from `otool -tV`). Disassembly source:
//   raw-port/re/disasm/ProChannel.__ZN21OZChannelSeed_Factory11getInstanceEv.s
//
// Structurally IDENTICAL to OZChannelBase_Factory (compare
// raw-port/src/channels/OZChannelBase_Factory.ts) — the honest peer
// template. Same libc++ std::call_once shape, same 0x88-byte object,
// same three-symbol trio of BSS globals (`_instanceOnce`, `_instance`)
// and lambda-proxy. Only the class name and addresses differ.
//
// This unit ports ONLY the `getInstance()` static singleton accessor at
// @0x258a. The remaining methods on this factory (C2/D1/D0/create/
// createChannel/... etc.) are separate ledger entries and are OUT OF
// SCOPE for this file (they will be added to this same class file when
// their own ledger entries are claimed by future depclaim rounds — per
// the "one class per file" rule, extending this file with more methods
// later is the correct workflow, not creating a sibling).
//
// -----------------------------------------------------------------------------
// PROCESS-GLOBAL STORAGE (the two symbols getInstance reads/writes)
// -----------------------------------------------------------------------------
// Two BSS globals live at fixed addresses in ProChannel, each holding one
// 8-byte word:
//
//   __ZN21OZChannelSeed_Factory13_instanceOnceE
//     — the libc++ std::once_flag word. Value 0 = "not yet started";
//       intermediate values = "another thread is currently running init";
//       value -1 = "init completed successfully" (libc++ writes ~0UL
//       on completion). The `cmpq $-1, %rax` at @0x259c is the standard
//       libc++ fast-path check for "init done".
//
//   __ZN21OZChannelSeed_Factory9_instanceE
//     — an `OZChannelSeed_Factory*` (pointer to the singleton instance).
//       Written by the lambda that std::__call_once invokes on first
//       call; read by getInstance @0x25c7.
//
// -----------------------------------------------------------------------------
// FRONTIER CALLEES (all TRUE OUT-OF-SCOPE externs or SEPARATE ledger units)
// -----------------------------------------------------------------------------
//   * __ZNSt3__111__call_onceERVmPvPFvS2_E
//       — std::__1::__call_once(flag&, void*, void(*)(void*))
//       — libc++ (libc++.dylib) — TRUE out-of-scope extern. Called
//         @0x25c2 via ProChannel stub 0xacdc8. Same policy as
//         OZChannelBase_Factory (see raw-port/src/channels/
//         OZChannelBase_Factory.ts) and HGMemory's call_once callsites.
//
//   * __ZNSt3__117__call_once_proxyB9nqe210106<
//         tuple<OZChannelSeed_Factory::getInstance()::'lambda'()&&>>(void*)
//       — libc++ template instantiation @ProChannel 0xf813. NOT called
//         by getInstance directly — it is PASSED AS A DATA REFERENCE
//         (a function-pointer argument) to __call_once, which then
//         dispatches through it. The proxy body is `jmp __ZNSt3__18
//         __invokeB9nqe210106<...>` @ProChannel 0xf81e (a separate
//         ledger entry NOT in this file's scope). That __invoke
//         instantiation @0xf823 calls __ZN21OZChannelSeed_FactoryC2Ev
//         (the C2 base ctor, ledger status: todo) via operator new(0x88)
//         at ProChannel 0xf82f, whose ledger status is currently `todo`.
//         It is a TRANSITIVE dependency of getInstance, but not a
//         DIRECT callee — getInstance's disasm only names __call_once
//         as a call target (all other refs are `leaq` data references
//         or memory loads).
//
//         Faithful modelling: getInstance's body executes std::call_once
//         and then reads `_instance`. If the initializer runs and
//         succeeds, `_instance` is the fresh pointer; if the initializer
//         raises (which it currently does, since the C2 ctor is not yet
//         ported), std::__call_once propagates the throw and _instance
//         remains untouched. Both branches are faithful to the
//         disassembly.
//
// -----------------------------------------------------------------------------
// Symbols ported here (mangled → address)
// -----------------------------------------------------------------------------
//   * __ZN21OZChannelSeed_Factory11getInstanceEv
//       — OZChannelSeed_Factory::getInstance() @ProChannel 0x258a
//
// -----------------------------------------------------------------------------
// FULL DISASM (raw-port/re/disasm/ProChannel.
//              __ZN21OZChannelSeed_Factory11getInstanceEv.s)
// -----------------------------------------------------------------------------
//   0x258a  pushq  %rbp                              ; frame prologue
//   0x258b  movq   %rsp, %rbp
//   0x258e  subq   $0x20, %rsp                       ; 32-byte local frame
//                                                    ; (holds a 3-word libc++
//                                                    ; "tuple<lambda&&>" plus
//                                                    ; alignment padding)
//   0x2592  leaq   _instanceOnce(%rip), %rax         ; rax = &_instanceOnce
//   0x2599  movq   (%rax), %rax                      ; rax = _instanceOnce
//   0x259c  cmpq   $-0x1, %rax                       ; already-init check
//                                                    ; (libc++ writes ~0UL
//                                                    ; on completion)
//   0x25a0  je     0x25c7                            ; fast path: skip call_once
//   0x25a2  leaq   -0x1(%rbp), %rax                  ; rax = &frame[-1] (a 1-byte
//                                                    ; stack slot — the lambda's
//                                                    ; captureless closure body;
//                                                    ; libc++'s tuple<T&&> needs
//                                                    ; a stable address).
//   0x25a6  leaq   -0x18(%rbp), %rcx                 ; rcx = &frame[-0x18]
//                                                    ; (the tuple<T&&> slot)
//   0x25aa  movq   %rax, (%rcx)                      ; tuple.head = &lambda-slot
//   0x25ad  leaq   -0x10(%rbp), %rsi                 ; rsi = &frame[-0x10]
//                                                    ; (call_once's `void* arg`)
//   0x25b1  movq   %rcx, (%rsi)                      ; *arg = &tuple
//                                                    ; (the void* passed to
//                                                    ; __call_once_proxy)
//   0x25b4  leaq   _instanceOnce(%rip), %rdi         ; rdi = &_instanceOnce
//   0x25bb  leaq   __call_once_proxy<...>(%rip), %rdx; rdx = &proxy_func
//                                                    ; (function pointer;
//                                                    ; proxy body lives at
//                                                    ; ProChannel 0xf813)
//   0x25c2  callq  std::__call_once                   ; libc++ stub @0xacdc8
//                                                    ; signature:
//                                                    ; (once_flag& = %rdi,
//                                                    ;  void* arg   = %rsi,
//                                                    ;  void(*)(void*) = %rdx)
//   0x25c7  leaq   _instance(%rip), %rax             ; rax = &_instance
//   0x25ce  movq   (%rax), %rax                      ; rax = _instance
//                                                    ; (the return value: the
//                                                    ; singleton pointer, or
//                                                    ; NULL if init raised)
//   0x25d1  addq   $0x20, %rsp                       ; frame epilogue
//   0x25d5  popq   %rbp
//   0x25d6  retq

// ═════════════════════════════════════════════════════════════════════════
// Process-global BSS slots — one 8-byte word each, sitting at fixed
// linker-assigned addresses in ProChannel's __common/__bss. Since TS has
// no linker, we model them as module-scope `let`s. The initial state
// mirrors the ELF/Mach-O convention that BSS is zero-filled at load:
//   _instanceOnce = 0n  ("not yet initialised" — libc++ once_flag zero)
//   _instance     = null (nullptr — no singleton allocated yet)
// ═════════════════════════════════════════════════════════════════════════

/** @ProChannel BSS `__ZN21OZChannelSeed_Factory13_instanceOnceE`.
 *  libc++ std::once_flag word. 0n = not started; 2n/3n = another thread
 *  running init; -1n (0xFFFF_FFFF_FFFF_FFFF) = completed. getInstance
 *  compares this to $-1 @0x259c as its fast-path check. */
let _instanceOnce: bigint = 0n; // @ProChannel BSS 0x258a read-site

/** @ProChannel BSS `__ZN21OZChannelSeed_Factory9_instanceE`.
 *  The singleton pointer. Read @0x25c7-0x25ce (the return value).
 *  Written by the __call_once_proxy lambda (a separate function at
 *  ProChannel 0xf813/0xf823/0xf846). */
let _instance: OZChannelSeed_Factory | null = null; // @ProChannel BSS 0x25c7

/**
 * `std::__1::__call_once(flag&, void* arg, void(*)(void*))` — libc++
 * (libc++.dylib). Called from getInstance @0x25c2 via ProChannel stub
 * 0xacdc8. TRUE out-of-scope extern (libc++ runtime). In this port there
 * is no libc++ runtime, so we model the "run the initializer exactly
 * once, atomically" contract at the JS single-threaded level: on first
 * call with a zero once_flag, we invoke the proxy(arg) and — IF it
 * completes without throwing — write $-1 into the flag; on subsequent
 * calls we no-op. If the proxy throws, the flag stays 0 (libc++'s
 * ~0UL-on-success write is skipped) and future calls will retry, exactly
 * like the real runtime. This is the minimum behaviour getInstance's
 * disasm relies on (the fast-path @0x259c `cmp $-1` check).
 *
 * Mirrors the identical helper in OZChannelBase_Factory.ts — kept
 * local (not extracted) because the "one class per file" rule forbids
 * cross-file utility modules and the two files are structurally the
 * same singleton pattern, not a shared helper. */
function std_call_once(
  once: { get(): bigint; set(v: bigint): void },
  arg: unknown,
  proxy: (arg: unknown) => void,
): void {
  // libc++ fast-path: already completed?
  if (once.get() === -1n) return; // (mirrors 0x259c fast-path exit)
  // First-call slow path (single-threaded model — no atomic CAS needed
  // in JS). Run the proxy; on success mark the flag ~0.
  proxy(arg);
  once.set(-1n);
}

/**
 * `__ZNSt3__117__call_once_proxy<...>` — libc++ template instantiation
 * (ProChannel 0xf813). Body is `jmp __invoke<...>` @0xf81e, which
 * allocates a fresh OZChannelSeed_Factory (size 0x88) via `operator new`
 * @0xf82f and invokes `OZChannelSeed_Factory::OZChannelSeed_Factory()`
 * (the C2 base ctor, __ZN21OZChannelSeed_FactoryC2Ev, currently ledger
 * status = `todo`) @0xf83a; on success it stores the pointer into
 * `_instance` @0xf846. Since neither the C2 ctor nor operator new are
 * ported yet, the proxy stub raises with the exact @0xADDRs of the
 * dispatching call sites — the deferred work is transparently
 * documented and will resolve once the ctor is ported. */
function __call_once_proxy_getInstance_lambda(_arg: unknown): void {
  // The lambda's body @ProChannel 0xf81e..0xf846 is:
  //   1. rax = operator new(0x88)         @ProChannel 0xf82f (imported __Znwm)
  //   2. OZChannelSeed_Factory::C2(rax)   @ProChannel 0xf83a
  //   3. _instance = rax                  @ProChannel 0xf846
  // C2 is a separate ledger entry (todo). We cite both call sites.
  throw new Error(
    "OZChannelSeed_Factory::getInstance() __call_once init lambda not yet " +
      "transcribed — the lambda body @ProChannel 0xf81e allocates 0x88 bytes " +
      "via operator new @0xf82f then invokes " +
      "__ZN21OZChannelSeed_FactoryC2Ev @ProChannel 0xf83a (C2 base ctor, " +
      "ledger status: todo) and stores the result into _instance @0xf846. " +
      "Neither operator new (__Znwm ProChannel stub 0xace4c) nor the C2 ctor " +
      "is yet ported — this lambda function is a SEPARATE ledger unit and " +
      "will be filled in when it is next claimed. The proxy is invoked from " +
      "std::__call_once at ProChannel 0x25c2.",
  );
}

// ═════════════════════════════════════════════════════════════════════════
// The class
// ═════════════════════════════════════════════════════════════════════════

/**
 * `OZChannelSeed_Factory` — factory singleton for OZChannelSeed channel
 * instances. Only its getInstance() accessor is ported in this file;
 * every other method is a separate ledger entry. See file header for
 * the storage layout (a 0x88-byte object per the operator-new call in
 * the init lambda; field offsets not yet decoded since only getInstance
 * is transcribed here).
 */
export class OZChannelSeed_Factory {
  /**
   * `OZChannelSeed_Factory::getInstance()` — @ProChannel 0x258a
   * (__ZN21OZChannelSeed_Factory11getInstanceEv).
   *
   * Faithful line-for-line transcription of the disassembly quoted in
   * the file header. Standard libc++ std::call_once-guarded singleton
   * accessor:
   *
   *   1. Read the once_flag; if it equals $-1 (~0UL, libc++'s "init
   *      complete" sentinel), skip straight to step 3.
   *
   *   2. Set up the stack tuple that libc++'s __call_once ABI expects
   *      (a two-level indirection: `arg` points to `tuple.head`, which
   *      points to the lambda's captureless-closure body slot), then
   *      call libc++'s __call_once with (&_instanceOnce, &tuple,
   *      &__call_once_proxy). The proxy dispatches into the lambda,
   *      which allocates and constructs the singleton (currently
   *      throws — see __call_once_proxy_getInstance_lambda above).
   *
   *   3. Return `_instance` (the freshly-allocated singleton pointer
   *      on the slow path; the previously-allocated one on the fast
   *      path; null if the init lambda raised).
   */
  static getInstance(): OZChannelSeed_Factory | null {
    // @0x2592-0x2599 — read _instanceOnce
    // @0x259c-0x25a0 — cmpq $-1 / je 0x25c7 — libc++ fast-path
    if (_instanceOnce !== -1n) {
      // @0x25a2-0x25c2 — slow path: set up tuple, dispatch to __call_once.
      // The "tuple / arg pointer" setup at @0x25a2-0x25b1 exists purely
      // to satisfy libc++'s __call_once ABI (which passes a `void* arg`
      // through to the proxy, which unpacks it as a `tuple<lambda&&>*`).
      // In this JS port we model the proxy as a direct function call, so
      // the tuple / arg pointer are not observable — the semantics are
      // preserved by std_call_once + __call_once_proxy_getInstance_lambda.
      std_call_once(
        { get: () => _instanceOnce, set: (v: bigint) => { _instanceOnce = v; } },
        null,
        __call_once_proxy_getInstance_lambda,
      );
    }
    // @0x25c7-0x25ce — return _instance (whether fresh from the init
    // lambda or previously cached; null if init raised — libc++ doesn't
    // write ~0UL on throw so future calls will retry).
    return _instance;
  }
}
