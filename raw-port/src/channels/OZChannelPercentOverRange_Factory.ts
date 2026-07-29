// OZChannelPercentOverRange_Factory — ProChannel factory singleton for
// OZChannelPercentOverRange channel instances.
//
// Transcribed from /Applications/Final Cut Pro.app/Contents/Frameworks/
// ProChannel.framework/Versions/A/ProChannel (x86_64 slice; unadjusted
// VAs from `otool -tV`). Disassembly source:
//   raw-port/re/disasm/ProChannel.__ZN33OZChannelPercentOverRange_Factory11getInstanceEv.s
//
// This unit ports ONLY the `getInstance()` static singleton accessor at
// @0x2452. All other methods on this factory (C2/D1/D0/create/...)
// are separate ledger entries and are OUT OF SCOPE for this file (they
// will be added to this same class file when their own ledger entries
// are claimed by future depclaim rounds — per the "one class per file"
// rule, extending this file with more methods later is the correct
// workflow, not creating a sibling).
//
// This port follows the honest peer template
// (raw-port/src/channels/OZChannelBase_Factory.ts): it models the
// libc++ std::call_once fast-path (sentinel `-1n`) faithfully; the
// singleton allocation itself lives inside the __call_once_proxy lambda
// (a SEPARATE ledger unit at ProChannel 0xe54f) and therefore
// raises a documented "not yet transcribed" error at that boundary —
// NOT a fabricated `new OZChannelPercentOverRange_Factory()`.
//
// -----------------------------------------------------------------------------
// PROCESS-GLOBAL STORAGE (the two symbols getInstance reads/writes)
// -----------------------------------------------------------------------------
// Two BSS globals live at fixed addresses in ProChannel, each holding one
// 8-byte word:
//
//   __ZN33OZChannelPercentOverRange_Factory13_instanceOnceE
//     — the libc++ std::once_flag word. 0 = not-yet-started,
//       intermediate = another thread running init, -1 = completed
//       (libc++ writes ~0UL on completion). The `cmpq $-1, %rax` at
//       @0x2464 is the standard libc++ fast-path check.
//
//   __ZN33OZChannelPercentOverRange_Factory9_instanceE
//     — a `OZChannelPercentOverRange_Factory*` singleton pointer. Written by the __call_once
//       lambda; read by getInstance @0x248f.
//
// -----------------------------------------------------------------------------
// FRONTIER CALLEES (all TRUE OUT-OF-SCOPE externs or SEPARATE ledger units)
// -----------------------------------------------------------------------------
//   * __ZNSt3__111__call_onceERVmPvPFvS2_E
//       — std::__1::__call_once(flag&, void*, void(*)(void*))
//       — libc++ (libc++.dylib) — TRUE out-of-scope extern. Called
//         @0x248a via ProChannel stub 0xacdc8.
//
//   * __ZNSt3__117__call_once_proxyB9nqe210106INS_5tupleIJOZN33OZChannelPercentOverRange_Factory11getInstanceEvEUlvE_EEEEEvPv
//       — libc++ template instantiation. NOT called by getInstance
//         directly — passed as a function-pointer argument to
//         __call_once. Body verified at ProChannel 0xe54f
//         (pushq/movq/movq(rdi)rax/movq(rax)rdi/popq/jmp __invoke).
//         The `__invoke` then allocates the singleton via `operator new`
//         (__Znwm ProChannel stub 0xace4c) and invokes
//         __ZN33OZChannelPercentOverRange_FactoryC2Ev (C2 base ctor, ledger status: todo).
//         The lambda body is a SEPARATE ledger unit.
//
// -----------------------------------------------------------------------------
// Symbols ported here (mangled → address)
// -----------------------------------------------------------------------------
//   * __ZN33OZChannelPercentOverRange_Factory11getInstanceEv
//       — OZChannelPercentOverRange_Factory::getInstance() @ProChannel 0x2452
//
// -----------------------------------------------------------------------------
// FULL DISASM (raw-port/re/disasm/ProChannel.__ZN33OZChannelPercentOverRange_Factory11getInstanceEv.s)
// -----------------------------------------------------------------------------
//   0x2452  pushq  %rbp                              ; frame prologue
//                 movq   %rsp, %rbp
//   0x2456  subq   $0x20, %rsp                        ; 32-byte local frame
//   0x245a  leaq   _instanceOnce(%rip), %rax
//   0x2461  movq   (%rax), %rax                       ; rax = _instanceOnce
//   0x2464  cmpq   $-0x1, %rax                        ; init-done sentinel check
//   0x2468  je     0x248f                            ; fast path: skip call_once
//   0x246a  leaq   -0x1(%rbp), %rax                   ; captureless lambda slot
//   0x246e  leaq   -0x18(%rbp), %rcx                  ; tuple<T&&> slot
//   0x2472  movq   %rax, (%rcx)                       ; tuple.head = &lambda
//   0x2475  leaq   -0x10(%rbp), %rsi                  ; call_once's void* arg
//   0x2479  movq   %rcx, (%rsi)                       ; *arg = &tuple
//   0x247c  leaq   _instanceOnce(%rip), %rdi
//   0x2483  leaq   __call_once_proxy<...>(%rip), %rdx
//   0x248a  callq  std::__call_once                    ; libc++ stub @0xacdc8
//   0x248f  leaq   _instance(%rip), %rax
//   0x2496  movq   (%rax), %rax                       ; return _instance
//   0x2499  addq   $0x20, %rsp
//                 popq   %rbp
//   0x249e  retq

// ═════════════════════════════════════════════════════════════════════════
// Process-global BSS slots — zero-filled at load per Mach-O convention.
//   _instanceOnce = 0n  (libc++ once_flag zero — not yet initialised)
//   _instance     = null
// ═════════════════════════════════════════════════════════════════════════

/** @ProChannel BSS `__ZN33OZChannelPercentOverRange_Factory13_instanceOnceE`.
 *  libc++ std::once_flag word. 0n = not started; -1n = completed. */
let _instanceOnce: bigint = 0n; // @ProChannel BSS 0x245a read-site

/** @ProChannel BSS `__ZN33OZChannelPercentOverRange_Factory9_instanceE`. The singleton
 *  pointer. Read @0x248f. Written by the __call_once_proxy
 *  lambda (a separate function at ProChannel 0xe54f). */
let _instance: OZChannelPercentOverRange_Factory | null = null; // @ProChannel BSS 0x248f

/**
 * `std::__1::__call_once(flag&, void* arg, void(*)(void*))` — libc++
 * (libc++.dylib). Called from getInstance @0x248a via ProChannel
 * stub 0xacdc8. TRUE out-of-scope extern. Faithful single-threaded model:
 * fast-path when once==-1n; otherwise run proxy then set flag to -1n.
 * If proxy throws, flag stays 0 and future calls will retry — mirrors
 * libc++'s ~0UL-on-success-only write and getInstance's @0x2464
 * `cmp $-1` check. */
function std_call_once(
  once: { get(): bigint; set(v: bigint): void },
  arg: unknown,
  proxy: (arg: unknown) => void,
): void {
  if (once.get() === -1n) return; // (mirrors 0x2464 fast-path exit)
  proxy(arg);
  once.set(-1n);
}

/**
 * `__ZNSt3__117__call_once_proxy<...>` — libc++ template instantiation at
 * ProChannel 0xe54f. Body: pushq %rbp / movq %rsp,%rbp /
 * movq (%rdi),%rax / movq (%rax),%rdi / popq %rbp / jmp __invoke<lambda>.
 * The `__invoke` tail-jumps into the captureless lambda body, which
 * allocates a fresh OZChannelPercentOverRange_Factory via `operator new` (__Znwm ProChannel stub
 * 0xace4c), invokes __ZN33OZChannelPercentOverRange_FactoryC2Ev (C2 base ctor, ledger status:
 * todo), and stores the pointer into `_instance`. Neither __invoke nor
 * the C2 ctor is ported yet, so this stub raises with the exact
 * @0xADDRs of the dispatching call sites. */
function __call_once_proxy_getInstance_lambda(_arg: unknown): void {
  throw new Error(
    "OZChannelPercentOverRange_Factory::getInstance() __call_once init lambda not yet transcribed — " +
      "the lambda body dispatched via __call_once_proxy @ProChannel " +
      "0xe54f (which tail-jumps to __invoke<...lambda...>) " +
      "allocates the singleton via operator new (__Znwm ProChannel stub " +
      "0xace4c) then invokes __ZN33OZChannelPercentOverRange_FactoryC2Ev (C2 base ctor, ledger " +
      "status: todo) and stores the result into _instance. Neither " +
      "__invoke, operator new, nor the C2 ctor is yet ported — this " +
      "lambda is a SEPARATE ledger unit. The proxy is invoked from " +
      "std::__call_once at ProChannel 0x248a.",
  );
}

// ═════════════════════════════════════════════════════════════════════════
// The class
// ═════════════════════════════════════════════════════════════════════════

/**
 * `OZChannelPercentOverRange_Factory` — factory singleton for OZChannelPercentOverRange channel instances. Only
 * its getInstance() accessor is ported in this file; every other method
 * is a separate ledger entry.
 */
export class OZChannelPercentOverRange_Factory {
  /**
   * `OZChannelPercentOverRange_Factory::getInstance()` — @ProChannel 0x2452
   * (__ZN33OZChannelPercentOverRange_Factory11getInstanceEv).
   *
   * Faithful line-for-line transcription of the disassembly above.
   * Standard libc++ std::call_once-guarded singleton accessor:
   *   1. Read the once_flag; if it equals $-1 (~0UL, libc++'s "init
   *      complete" sentinel), skip straight to step 3.
   *   2. Set up the stack tuple that libc++'s __call_once ABI expects
   *      (a two-level indirection: `arg` points to `tuple.head`, which
   *      points to the empty captureless lambda's 1-byte storage), and
   *      call std::__call_once(&_instanceOnce, arg, &proxy).
   *   3. Return `_instance` (whatever the initializer wrote — or NULL if
   *      the initializer threw and never got to write).
   *
   * The stack tuple + captureless-lambda dance @0x246a..@0x2479
   * is an ABI-level artefact of libc++'s __call_once template
   * instantiation. In this port std_call_once invokes the proxy directly
   * (single-threaded, no ABI marshaling needed); the disasm's stack
   * setup is documented above for provenance.
   */
  static getInstance(): OZChannelPercentOverRange_Factory | null {
    // @0x2452..@0x2456 — prologue + 0x20-byte local frame.
    // @0x245a..@0x2461 — rax = _instanceOnce.
    // @0x2464..@0x2468 — if (_instanceOnce == -1) goto fast_path (0x248f).
    if (_instanceOnce !== -1n) {
      // @0x246a..@0x2479 — set up libc++ tuple<lambda&&>.
      // @0x247c — rdi = &_instanceOnce.
      // @0x2483 — rdx = &__call_once_proxy<...lambda...> (ProChannel 0xe54f).
      // @0x248a — callq std::__call_once (libc++ stub @0xacdc8).
      std_call_once(
        {
          get: (): bigint => _instanceOnce, // (mirrors `movq (%rax),%rax` @0x2461)
          set: (v: bigint): void => {
            _instanceOnce = v;
          },
        },
        null, // ABI void* — real disasm passes &tuple; our proxy ignores it.
        __call_once_proxy_getInstance_lambda,
      );
    }
    // @0x248f..@0x2496 — rax = _instance.
    // @0x2499..@0x249e — epilogue + retq.
    return _instance;
  }
}
