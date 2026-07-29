// OZChannelGradientPositioned_Factory — ProChannel factory singleton for
// OZChannelGradientPositioned.
//
// Transcribed from /Applications/Final Cut Pro.app/Contents/Frameworks/
// ProChannel.framework/Versions/A/ProChannel (x86_64 slice; unadjusted
// VAs from `otool -tV`). Disassembly source:
//   raw-port/re/disasm/ProChannel.__ZN35OZChannelGradientPositioned_Factory11getInstanceEv.s
//
// This unit ports ONLY the `getInstance()` static singleton accessor at
// @0x2146. The remaining methods on this factory are separate ledger
// entries and are OUT OF SCOPE for this file (they will be appended to
// this same class file when their own ledger entries are claimed — per
// the "one class per file" rule, extending this file with more methods
// later is the correct workflow, not creating a sibling).
//
// This mirrors the honest peer OZChannelBase_Factory::getInstance()
// (@ProChannel 0x1786) which follows the identical libc++
// std::call_once idiom (see raw-port/src/channels/OZChannelBase_Factory.ts).
//
// -----------------------------------------------------------------------------
// PROCESS-GLOBAL STORAGE (the two BSS symbols getInstance reads/writes)
// -----------------------------------------------------------------------------
//   __ZN35OZChannelGradientPositioned_Factory13_instanceOnceE
//     — the libc++ std::once_flag word (an `unsigned long`). 0 = "not
//       started"; intermediate = "another thread running init"; -1
//       (~0UL) = "init completed" — libc++ writes ~0UL on completion.
//       The `cmpq $-0x1, %rax` @0x2158 is the standard libc++ fast-path
//       check.
//
//   __ZN35OZChannelGradientPositioned_Factory9_instanceE
//     — an `OZChannelGradientPositioned_Factory*` (singleton pointer).
//       Written by the lambda that std::__call_once invokes on first
//       call; read by getInstance @0x2183.
//
// -----------------------------------------------------------------------------
// FRONTIER CALLEES (all TRUE OUT-OF-SCOPE externs or SEPARATE ledger units)
// -----------------------------------------------------------------------------
//   * __ZNSt3__111__call_onceERVmPvPFvS2_E
//       — std::__1::__call_once(flag&, void*, void(*)(void*))
//       — libc++ (libc++.dylib). Called @0x217e via ProChannel stub
//         0xacdc8. TRUE out-of-scope extern.
//
//   * __ZNSt3__117__call_once_proxyB9nqe210106<
//         tuple<OZChannelGradientPositioned_Factory::getInstance()::
//               'lambda'()&&>>(void*)
//       — libc++ template instantiation that unpacks the tuple and
//         invokes the lambda. NOT called by getInstance directly — it
//         is PASSED AS A DATA REFERENCE (a function-pointer argument)
//         to __call_once, which then dispatches through it. The proxy
//         body itself is a SEPARATE ledger entry (its own mangled
//         symbol) — its C2 base ctor invocation is a transitive, not
//         direct, dependency of getInstance.
//
// -----------------------------------------------------------------------------
// Symbols ported here (mangled → address)
// -----------------------------------------------------------------------------
//   * __ZN35OZChannelGradientPositioned_Factory11getInstanceEv
//       — OZChannelGradientPositioned_Factory::getInstance()
//         @ProChannel 0x2146
//
// -----------------------------------------------------------------------------
// FULL DISASM (raw-port/re/disasm/ProChannel.__ZN35OZChannelGradientPositioned_Factory11getInstanceEv.s)
// -----------------------------------------------------------------------------
//   0x2146  pushq  %rbp                              ; frame prologue
//   0x2147  movq   %rsp, %rbp
//   0x214a  subq   $0x20, %rsp                       ; 32-byte local frame
//   0x214e  leaq   _instanceOnce(%rip), %rax         ; rax = &_instanceOnce
//   0x2155  movq   (%rax), %rax                      ; rax = _instanceOnce
//   0x2158  cmpq   $-0x1, %rax                       ; already-init check
//   0x215c  je     0x2183                            ; fast-path skip call_once
//   0x215e  leaq   -0x1(%rbp), %rax                  ; rax = &frame[-1]
//                                                    ; (1-byte lambda-storage slot)
//   0x2162  leaq   -0x18(%rbp), %rcx                 ; rcx = &frame[-0x18]
//                                                    ; (tuple<T&&> slot)
//   0x2166  movq   %rax, (%rcx)                      ; tuple.head = &lambda-slot
//   0x2169  leaq   -0x10(%rbp), %rsi                 ; rsi = &frame[-0x10]
//                                                    ; (call_once's void* arg)
//   0x216d  movq   %rcx, (%rsi)                      ; *arg = &tuple
//   0x2170  leaq   _instanceOnce(%rip), %rdi         ; rdi = &_instanceOnce
//   0x2177  leaq   __call_once_proxy<...>(%rip), %rdx; rdx = &proxy_func
//   0x217e  callq  std::__call_once                   ; libc++ stub @0xacdc8
//   0x2183  leaq   _instance(%rip), %rax             ; rax = &_instance
//   0x218a  movq   (%rax), %rax                      ; rax = _instance (return)
//   0x218d  addq   $0x20, %rsp                       ; frame epilogue
//   0x2191  popq   %rbp
//   0x2192  retq

// ═════════════════════════════════════════════════════════════════════════
// Process-global BSS slots — one 8-byte word each. TS has no linker, so
// model as module-scope `let`s. BSS is zero-filled at load:
//   _instanceOnce = 0n  ("not yet initialised")
//   _instance     = null (nullptr)
// ═════════════════════════════════════════════════════════════════════════

/** @ProChannel BSS `__ZN35OZChannelGradientPositioned_Factory13_instanceOnceE`.
 *  libc++ std::once_flag word. 0n = not started; -1n = completed.
 *  getInstance compares this to $-1 @0x2158 as its fast-path check. */
let _instanceOnce: bigint = 0n; // @ProChannel BSS 0x214e read-site

/** @ProChannel BSS `__ZN35OZChannelGradientPositioned_Factory9_instanceE`.
 *  Singleton pointer. Read @0x2183-0x218a (return). Written by the
 *  __call_once_proxy lambda (SEPARATE ledger unit). */
let _instance: OZChannelGradientPositioned_Factory | null = null; // @ProChannel BSS 0x2183

/**
 * `std::__1::__call_once(flag&, void* arg, void(*)(void*))` — libc++
 * (libc++.dylib). Called from getInstance @0x217e via ProChannel stub
 * 0xacdc8. TRUE out-of-scope extern (libc++ runtime). Modelled as the
 * single-threaded JS equivalent: on first call with zero flag invoke
 * the proxy(arg); on success write $-1 to the flag; on subsequent
 * calls no-op. If the proxy throws, the flag stays 0 and future calls
 * retry — matching libc++'s ~0UL-on-success semantics. */
function std_call_once(
  once: { get(): bigint; set(v: bigint): void },
  arg: unknown,
  proxy: (arg: unknown) => void,
): void {
  // libc++ fast-path: already completed?
  if (once.get() === -1n) return; // (mirrors 0x2158 fast-path exit)
  // First-call slow path (single-threaded model — no atomic CAS needed
  // in JS). Run the proxy; on success mark the flag ~0.
  proxy(arg);
  once.set(-1n);
}

/**
 * `__ZNSt3__117__call_once_proxy<...>` — libc++ template instantiation
 * whose body dispatches into the getInstance lambda. That lambda
 * allocates a fresh OZChannelGradientPositioned_Factory via `operator
 * new`, invokes its C2 base ctor, and stores the result into
 * `_instance`. Neither operator new (__Znwm) nor the C2 ctor
 * (__ZN35OZChannelGradientPositioned_FactoryC2Ev) is yet ported — the
 * proxy is a SEPARATE ledger entry and will be filled in when
 * claimed. Until then we raise with the exact call-site @0xADDR so
 * downstream code cannot silently rely on an un-ported singleton. */
function __call_once_proxy_getInstance_lambda(_arg: unknown): void {
  throw new Error(
    "OZChannelGradientPositioned_Factory::getInstance() __call_once init " +
      "lambda not yet transcribed — the lambda body allocates via operator " +
      "new (__Znwm ProChannel stub 0xace4c) and invokes " +
      "__ZN35OZChannelGradientPositioned_FactoryC2Ev (C2 base ctor, " +
      "SEPARATE ledger entry, status: todo) then stores the result into " +
      "_instance. The proxy is invoked from std::__call_once at ProChannel " +
      "0x217e.",
  );
}

// ═════════════════════════════════════════════════════════════════════════
// The class
// ═════════════════════════════════════════════════════════════════════════

/**
 * `OZChannelGradientPositioned_Factory` — factory singleton for
 * OZChannelGradientPositioned channel instances. Only its getInstance()
 * accessor is ported in this file; every other method is a separate
 * ledger entry.
 */
export class OZChannelGradientPositioned_Factory {
  /**
   * `OZChannelGradientPositioned_Factory::getInstance()`
   *   — @ProChannel 0x2146
   *   — __ZN35OZChannelGradientPositioned_Factory11getInstanceEv
   *
   * Faithful line-for-line transcription of the disassembly quoted in
   * the file header. Standard libc++ std::call_once-guarded singleton
   * accessor:
   *
   *   1. Read the once_flag; if it equals $-1 (~0UL, libc++'s "init
   *      complete" sentinel @0x2158), skip straight to step 3 (@0x2183).
   *
   *   2. Set up the libc++ tuple<lambda&&> on the stack @0x215e-0x216d
   *      and call std::__call_once(&_instanceOnce, arg, &proxy) @0x217e.
   *      The proxy unpacks the tuple and invokes the lambda, which
   *      allocates and constructs the singleton and writes it to
   *      `_instance`.
   *
   *   3. Return `_instance` (whatever the initializer wrote — or NULL
   *      if the initializer threw and never got to write) @0x2183-0x218a.
   */
  static getInstance(): OZChannelGradientPositioned_Factory | null {
    // ------------------------------------------------------------
    // @0x2146..0x214a — prologue + 0x20-byte local frame.
    // @0x214e..0x2155 — rax = _instanceOnce.
    // @0x2158..0x215c — if (_instanceOnce == -1) goto fast_path (0x2183).
    // ------------------------------------------------------------
    if (_instanceOnce !== -1n) {
      // ------------------------------------------------------------
      // @0x215e..0x216d — set up libc++ tuple<lambda&&> on the stack.
      // (ABI-level, no TS-visible effect — the proxy just needs a
      // stable void* to dispatch through; we pass a null placeholder.)
      // @0x2170 — rdi = &_instanceOnce.
      // @0x2177 — rdx = &__call_once_proxy<...lambda...>.
      // @0x217e — callq std::__call_once (libc++ stub @0xacdc8).
      // ------------------------------------------------------------
      std_call_once(
        {
          get: (): bigint => _instanceOnce, // (mirrors `movq (%rax),%rax` @0x2155 read-side)
          set: (v: bigint): void => {
            _instanceOnce = v;
          },
        },
        null, // ABI void* — the real disasm passes &tuple; our proxy ignores it.
        __call_once_proxy_getInstance_lambda,
      );
    }
    // ------------------------------------------------------------
    // @0x2183..0x218a — rax = _instance.
    // @0x218d..0x2192 — epilogue + retq.
    // ------------------------------------------------------------
    return _instance;
  }
}
