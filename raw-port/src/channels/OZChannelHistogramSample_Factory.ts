// OZChannelHistogramSample_Factory — ProChannel factory singleton for OZChannelHistogramSample.
//
// Transcribed from /Applications/Final Cut Pro.app/Contents/Frameworks/
// ProChannel.framework/Versions/A/ProChannel (x86_64 slice; unadjusted
// VAs from `otool -tV`). Disassembly source:
//   raw-port/re/disasm/ProChannel.__ZN32OZChannelHistogramSample_Factory11getInstanceEv.s
//
// This unit ports ONLY the `getInstance()` static singleton accessor at
// @0x27fa. The remaining methods on this factory (C2/D1/D0/create/
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
//   __ZN32OZChannelHistogramSample_Factory13_instanceOnceE
//     — the libc++ std::once_flag word (an `unsigned long` in libc++'s
//       __call_once implementation). Semantics: value 0 = "not yet
//       started", intermediate values = "another thread is currently
//       running init", value -1 = "init completed successfully"
//       (libc++ writes ~0UL on completion). The `cmpq $-1, %rax` at
//       @0x280c is the standard libc++ fast-path check for "init done".
//
//   __ZN32OZChannelHistogramSample_Factory9_instanceE
//     — an `OZChannelHistogramSample_Factory*` (pointer to the singleton
//       instance). Written by the lambda that std::__call_once invokes
//       on first call; read by getInstance @0x2837.
//
// -----------------------------------------------------------------------------
// FRONTIER CALLEES (all TRUE OUT-OF-SCOPE externs or SEPARATE ledger units)
// -----------------------------------------------------------------------------
//   * __ZNSt3__111__call_onceERVmPvPFvS2_E
//       — std::__1::__call_once(flag&, void*, void(*)(void*))
//       — libc++ (libc++.dylib) — TRUE out-of-scope extern. Called
//         @0x2832 via ProChannel stub 0xacdc8. Same policy as
//         OZChannelBase_Factory (see
//         raw-port/src/channels/OZChannelBase_Factory.ts).
//
//   * __ZNSt3__117__call_once_proxyB9nqe210106<
//         tuple<OZChannelHistogramSample_Factory::getInstance()::'lambda'()&&>>(void*)
//       — libc++ template instantiation that unpacks the tuple and
//         invokes the lambda. NOT called by getInstance directly — it is
//         PASSED AS A DATA REFERENCE (a function-pointer argument) to
//         __call_once, which then dispatches through it. The proxy body
//         is `jmp __ZNSt3__18__invoke...<...>` at ProChannel @0x71906
//         (a separate ledger entry NOT in this file's scope). That
//         __invoke instantiation @0x71916 allocates 0x88 bytes via
//         operator new (__Znwm ProChannel stub 0xace4c) @0x71922 then
//         invokes __ZN32OZChannelHistogramSample_FactoryC2Ev @0x7192d
//         (the C2 base ctor, ledger status currently `todo`) and stores
//         the result into `_instance` @0x71932. It is a TRANSITIVE
//         dependency of getInstance, but not a DIRECT callee —
//         getInstance's disasm only names __call_once as a call target
//         (all other refs are `leaq` data references or memory loads).
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
//   * __ZN32OZChannelHistogramSample_Factory11getInstanceEv
//       — OZChannelHistogramSample_Factory::getInstance() @ProChannel 0x27fa
//
// -----------------------------------------------------------------------------
// FULL DISASM (raw-port/re/disasm/ProChannel.__ZN32OZChannelHistogramSample_Factory11getInstanceEv.s)
// -----------------------------------------------------------------------------
//   0x27fa  pushq  %rbp                              ; frame prologue
//   0x27fb  movq   %rsp, %rbp
//   0x27fe  subq   $0x20, %rsp                       ; 32-byte local frame
//                                                    ; (holds a 3-word libc++
//                                                    ; "tuple<lambda&&>" plus
//                                                    ; alignment padding)
//   0x2802  leaq   _instanceOnce(%rip), %rax         ; rax = &_instanceOnce
//   0x2809  movq   (%rax), %rax                      ; rax = _instanceOnce
//   0x280c  cmpq   $-0x1, %rax                       ; already-init check
//                                                    ; (libc++ writes ~0UL on
//                                                    ; completion)
//   0x2810  je     0x2837                            ; fast path: skip call_once
//   0x2812  leaq   -0x1(%rbp), %rax                  ; rax = &frame[-1] (a
//                                                    ; 1-byte stack slot — the
//                                                    ; lambda's empty captureless
//                                                    ; closure body; libc++'s
//                                                    ; tuple<T&&> needs a stable
//                                                    ; address).
//   0x2816  leaq   -0x18(%rbp), %rcx                 ; rcx = &frame[-0x18]
//                                                    ; (the tuple<T&&> slot)
//   0x281a  movq   %rax, (%rcx)                      ; tuple.head = &lambda-slot
//   0x281d  leaq   -0x10(%rbp), %rsi                 ; rsi = &frame[-0x10]
//                                                    ; (call_once's `void* arg`)
//   0x2821  movq   %rcx, (%rsi)                      ; *arg = &tuple
//                                                    ; (the void* passed to
//                                                    ; __call_once_proxy)
//   0x2824  leaq   _instanceOnce(%rip), %rdi         ; rdi = &_instanceOnce
//   0x282b  leaq   __call_once_proxy<...>(%rip), %rdx; rdx = &proxy_func
//                                                    ; (function pointer)
//   0x2832  callq  std::__call_once                   ; libc++ stub @0xacdc8
//                                                    ; signature:
//                                                    ; (once_flag& = %rdi,
//                                                    ;  void* arg   = %rsi,
//                                                    ;  void(*)(void*) = %rdx)
//   0x2837  leaq   _instance(%rip), %rax             ; rax = &_instance
//   0x283e  movq   (%rax), %rax                      ; rax = _instance
//                                                    ; (the return value: the
//                                                    ; singleton pointer, or
//                                                    ; NULL if init raised)
//   0x2841  addq   $0x20, %rsp                       ; frame epilogue
//   0x2845  popq   %rbp
//   0x2846  retq

// ═════════════════════════════════════════════════════════════════════════
// Process-global BSS slots — one 8-byte word each, sitting at fixed
// linker-assigned addresses in ProChannel's __common/__bss. Since TS has
// no linker, we model them as module-scope `let`s. The initial state
// mirrors the ELF/Mach-O convention that BSS is zero-filled at load:
//   _instanceOnce = 0n  ("not yet initialised" — libc++ once_flag zero)
//   _instance     = null (nullptr — no singleton allocated yet)
// ═════════════════════════════════════════════════════════════════════════

/** @ProChannel BSS `__ZN32OZChannelHistogramSample_Factory13_instanceOnceE`.
 *  libc++ std::once_flag word. 0n = not started; 2n/3n = another thread
 *  running init; -1n (0xFFFF_FFFF_FFFF_FFFF) = completed. getInstance
 *  compares this to $-1 @0x280c as its fast-path check. */
let _instanceOnce: bigint = 0n; // @ProChannel BSS 0x2802 read-site

/** @ProChannel BSS `__ZN32OZChannelHistogramSample_Factory9_instanceE`.
 *  The singleton pointer. Read @0x2837-0x283e (the return value).
 *  Written by the __call_once_proxy lambda (a separate function at
 *  ProChannel 0x71906/0x71916). */
let _instance: OZChannelHistogramSample_Factory | null = null; // @ProChannel BSS 0x2837

/**
 * `std::__1::__call_once(flag&, void* arg, void(*)(void*))` — libc++
 * (libc++.dylib). Called from getInstance @0x2832 via ProChannel stub
 * 0xacdc8. TRUE out-of-scope extern (libc++ runtime). In this port there
 * is no libc++ runtime, so we model the "run the initializer exactly
 * once, atomically" contract at the JS single-threaded level: on first
 * call with a zero once_flag, we invoke the proxy(arg) and — IF it
 * completes without throwing — write $-1 into the flag; on subsequent
 * calls we no-op. If the proxy throws, the flag stays 0 (libc++'s
 * ~0UL-on-success write is skipped) and future calls will retry, exactly
 * like the real runtime. This is the minimum behaviour getInstance's
 * disasm relies on (the fast-path @0x280c `cmp $-1` check). */
function std_call_once(
  once: { get(): bigint; set(v: bigint): void },
  arg: unknown,
  proxy: (arg: unknown) => void,
): void {
  // libc++ fast-path: already completed?
  if (once.get() === -1n) return; // (mirrors 0x280c fast-path exit)
  // First-call slow path (single-threaded model — no atomic CAS needed
  // in JS). Run the proxy; on success mark the flag ~0.
  proxy(arg);
  once.set(-1n);
}

/**
 * `__ZNSt3__117__call_once_proxy<...>` — libc++ template instantiation
 * (ProChannel 0x71906). Body is `jmp __invoke<...>` @0x71911, which lands
 * at __invoke @0x71916. That instantiation allocates a fresh
 * OZChannelHistogramSample_Factory (size 0x88, `movl $0x88,%edi` @0x7191d)
 * via `operator new` (__Znwm ProChannel stub 0xace4c) @0x71922 and
 * invokes `OZChannelHistogramSample_Factory::OZChannelHistogramSample_Factory()`
 * (the C2 base ctor, __ZN32OZChannelHistogramSample_FactoryC2Ev, ledger
 * status = `todo`) @0x7192d; on success it stores the pointer into
 * `_instance` @0x71932. Since neither the C2 ctor nor operator new are
 * ported yet, the proxy stub raises with the exact @0xADDRs of the
 * dispatching call sites — the deferred work is transparently
 * documented and will resolve once the ctor is ported. */
function __call_once_proxy_getInstance_lambda(_arg: unknown): void {
  // The lambda body @ProChannel 0x71916..0x71932 is:
  //   1. movl $0x88, %edi                @ProChannel 0x7191d  (size = 0x88)
  //   2. rax = operator new(0x88)        @ProChannel 0x71922  (__Znwm stub 0xace4c)
  //   3. OZChannelHistogramSample_Factory::C2(rax)
  //                                       @ProChannel 0x7192d
  //   4. _instance = rax                 @ProChannel 0x71932
  // C2 is a separate ledger entry (todo). We cite all call sites.
  throw new Error(
    "OZChannelHistogramSample_Factory::getInstance() __call_once init " +
      "lambda not yet transcribed — the lambda body @ProChannel 0x71916 " +
      "allocates 0x88 bytes via operator new @0x71922 (__Znwm stub " +
      "0xace4c) then invokes __ZN32OZChannelHistogramSample_FactoryC2Ev " +
      "@ProChannel 0x7192d (C2 base ctor, ledger status: todo) and stores " +
      "the result into _instance @0x71932. Neither operator new nor the " +
      "C2 ctor is yet ported — this lambda function is a SEPARATE ledger " +
      "unit and will be filled in when it is next claimed. The proxy is " +
      "invoked from std::__call_once at ProChannel 0x2832.",
  );
}

// ═════════════════════════════════════════════════════════════════════════
// The class
// ═════════════════════════════════════════════════════════════════════════

/**
 * `OZChannelHistogramSample_Factory` — factory singleton for
 * OZChannelHistogramSample channel instances. Only its getInstance()
 * accessor is ported in this file; every other method is a separate
 * ledger entry. See file header for the storage layout (a 0x88-byte
 * object per the operator-new call in the init lambda; field offsets
 * not yet decoded since only getInstance is transcribed here).
 */
export class OZChannelHistogramSample_Factory {
  /**
   * `OZChannelHistogramSample_Factory::getInstance()` — @ProChannel 0x27fa
   * (__ZN32OZChannelHistogramSample_Factory11getInstanceEv).
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
   *      points to the empty captureless lambda's 1-byte storage), and
   *      call std::__call_once(&_instanceOnce, arg, &proxy). The proxy
   *      unpacks the tuple and invokes the lambda, which allocates and
   *      constructs the singleton and writes it to `_instance`.
   *
   *   3. Return `_instance` (whatever the initializer wrote — or NULL if
   *      the initializer threw and never got to write).
   *
   * Note: the stack tuple + captureless-lambda dance @0x2812..0x2821 is
   * an ABI-level artefact of libc++'s __call_once template
   * instantiation — the caller side just does "call call_once with the
   * proxy pointer" and doesn't observe the intermediate slots. In this
   * port we don't need to model the two stack slots because
   * std_call_once (above) invokes the proxy directly (single-threaded,
   * no ABI marshaling needed). The disasm's stack setup is documented
   * here for provenance but does not affect observable behaviour.
   */
  static getInstance(): OZChannelHistogramSample_Factory | null {
    // ------------------------------------------------------------
    // @0x27fa..0x27fe — prologue + 0x20-byte local frame.
    // (No TS-visible effect.)
    // @0x2802..0x2809 — rax = _instanceOnce.
    // @0x280c..0x2810 — if (_instanceOnce == -1) goto fast_path (0x2837).
    // ------------------------------------------------------------
    if (_instanceOnce !== -1n) {
      // ------------------------------------------------------------
      // @0x2812..0x2821 — set up libc++ tuple<lambda&&> on the stack.
      // (ABI-level, no TS-visible effect — the proxy just needs a
      // stable void* to dispatch through; we pass a null placeholder.)
      // @0x2824 — rdi = &_instanceOnce.
      // @0x282b — rdx = &__call_once_proxy<...lambda...>.
      // @0x2832 — callq std::__call_once (libc++ stub @0xacdc8).
      // ------------------------------------------------------------
      std_call_once(
        {
          get: (): bigint => _instanceOnce, // (mirrors `movq (%rax),%rax` @0x2809 read-side)
          set: (v: bigint): void => {
            _instanceOnce = v;
          },
        },
        null, // ABI void* — the real disasm passes &tuple; our proxy ignores it.
        __call_once_proxy_getInstance_lambda,
      );
    }
    // ------------------------------------------------------------
    // @0x2837..0x283e — rax = _instance.
    // @0x2841..0x2846 — epilogue + retq.
    // ------------------------------------------------------------
    return _instance;
  }
}
