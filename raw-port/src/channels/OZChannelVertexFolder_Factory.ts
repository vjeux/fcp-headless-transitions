// OZChannelVertexFolder_Factory — ProChannel factory singleton for
// OZChannelVertexFolder. This unit ports ONLY the `getInstance()` static
// singleton accessor @ProChannel 0x2896. All other methods (C2/D1/D0/
// create/version/etc.) are separate ledger entries and will be added to
// this same class file when their own units are claimed (per the "one
// class per file, extend later" rule).
//
// Transcribed from /Applications/Final Cut Pro.app/Contents/Frameworks/
// ProChannel.framework/Versions/A/ProChannel (x86_64 slice; unadjusted
// VAs from `otool -tV`). Disassembly source:
//   raw-port/re/disasm/ProChannel.__ZN29OZChannelVertexFolder_Factory11getInstanceEv.s
//
// This is a bit-for-bit sibling of OZChannelBase_Factory::getInstance()
// @ProChannel 0x1786 (see raw-port/src/channels/OZChannelBase_Factory.ts):
// the two disassemblies differ only in the addresses of the two BSS
// globals (_instanceOnce, _instance) and the __call_once_proxy template
// instantiation — i.e. the SAME libc++ std::call_once-guarded singleton
// pattern applied to a different factory class. We deliberately keep the
// TS shape identical to OZChannelBase_Factory so reviewers can diff.
//
// -----------------------------------------------------------------------------
// PROCESS-GLOBAL STORAGE (the two symbols getInstance reads/writes)
// -----------------------------------------------------------------------------
// Two BSS globals live at fixed addresses in ProChannel, each holding one
// 8-byte word:
//
//   __ZN29OZChannelVertexFolder_Factory13_instanceOnceE
//     — the libc++ std::once_flag word (`unsigned long`). 0 = "not yet
//       started"; intermediate = another thread running init; -1 = "init
//       completed successfully" (libc++ writes ~0UL on completion). The
//       `cmpq $-1, %rax` @0x28a8 is the standard libc++ fast-path check.
//
//   __ZN29OZChannelVertexFolder_Factory9_instanceE
//     — an `OZChannelVertexFolder_Factory*` — the singleton pointer.
//       Written by the lambda that std::__call_once invokes on first
//       call; read by getInstance @0x28d3.
//
// -----------------------------------------------------------------------------
// FRONTIER CALLEES (all TRUE OUT-OF-SCOPE externs or SEPARATE ledger units)
// -----------------------------------------------------------------------------
//   * __ZNSt3__111__call_onceERVmPvPFvS2_E
//       — std::__1::__call_once(flag&, void*, void(*)(void*))
//       — libc++ (libc++.dylib) — TRUE out-of-scope extern. Called
//         @0x28ce via ProChannel stub 0xacdc8. Same policy as
//         OZChannelBase_Factory's identically-addressed call site.
//
//   * __ZNSt3__117__call_once_proxyB9nqe210106<
//         tuple<OZChannelVertexFolder_Factory::getInstance()::'lambda'()&&>>(void*)
//       — libc++ template instantiation. NOT called by getInstance
//         directly — its ADDRESS is passed as a function-pointer
//         argument @0x28c7 (`leaq …(%rip), %rdx`) to __call_once, which
//         then dispatches through it. Its body unpacks the tuple and
//         invokes the lambda that allocates the singleton (operator new
//         + C2 ctor) and stores the pointer into _instance. That proxy
//         and the C2 ctor are SEPARATE ledger units and are OUT OF
//         SCOPE for this file; the local stub below models the frontier
//         (throw with the exact @0xADDR) so future claims can replace it.
//
// -----------------------------------------------------------------------------
// Symbols ported here (mangled → address)
// -----------------------------------------------------------------------------
//   * __ZN29OZChannelVertexFolder_Factory11getInstanceEv
//       — OZChannelVertexFolder_Factory::getInstance() @ProChannel 0x2896
//
// -----------------------------------------------------------------------------
// FULL DISASM (raw-port/re/disasm/ProChannel.__ZN29OZChannelVertexFolder_Factory11getInstanceEv.s)
// -----------------------------------------------------------------------------
//   0x2896  pushq  %rbp                              ; frame prologue
//   0x2897  movq   %rsp, %rbp
//   0x289a  subq   $0x20, %rsp                       ; 32-byte local frame
//                                                    ; (libc++ tuple<T&&>
//                                                    ; scratch + align pad)
//   0x289e  leaq   _instanceOnce(%rip), %rax         ; rax = &_instanceOnce
//   0x28a5  movq   (%rax), %rax                      ; rax = _instanceOnce
//   0x28a8  cmpq   $-0x1, %rax                       ; libc++ done-sentinel?
//   0x28ac  je     0x28d3                            ; fast path: skip
//   0x28ae  leaq   -0x1(%rbp), %rax                  ; rax = &1-byte lambda
//                                                    ; storage on the frame
//   0x28b2  leaq   -0x18(%rbp), %rcx                 ; rcx = &tuple slot
//   0x28b6  movq   %rax, (%rcx)                      ; tuple.head = &lambda
//   0x28b9  leaq   -0x10(%rbp), %rsi                 ; rsi = &arg slot
//                                                    ; (the void* for call_once)
//   0x28bd  movq   %rcx, (%rsi)                      ; *arg = &tuple
//   0x28c0  leaq   _instanceOnce(%rip), %rdi         ; rdi = &_instanceOnce
//   0x28c7  leaq   __call_once_proxy<...>(%rip), %rdx; rdx = &proxy_func
//                                                    ; (function pointer)
//   0x28ce  callq  std::__call_once                   ; libc++ stub @0xacdc8
//                                                    ; (once&=%rdi,
//                                                    ;  arg  =%rsi,
//                                                    ;  fn   =%rdx)
//   0x28d3  leaq   _instance(%rip), %rax             ; rax = &_instance
//   0x28da  movq   (%rax), %rax                      ; rax = _instance
//                                                    ; (return value)
//   0x28dd  addq   $0x20, %rsp                       ; frame epilogue
//   0x28e1  popq   %rbp
//   0x28e2  retq
//   0x28e3  nop                                      ; alignment pad

// ═════════════════════════════════════════════════════════════════════════
// Process-global BSS slots — one 8-byte word each, sitting at fixed
// linker-assigned addresses in ProChannel's __common/__bss. Since TS has
// no linker, we model them as module-scope `let`s. The initial state
// mirrors Mach-O BSS zero-fill at load:
//   _instanceOnce = 0n  ("not yet initialised" — libc++ once_flag zero)
//   _instance     = null (nullptr — no singleton allocated yet)
// ═════════════════════════════════════════════════════════════════════════

/** @ProChannel BSS `__ZN29OZChannelVertexFolder_Factory13_instanceOnceE`.
 *  libc++ std::once_flag word. 0n = not started; 2n/3n = another thread
 *  running init; -1n (0xFFFF_FFFF_FFFF_FFFF) = completed. getInstance
 *  compares this to $-1 @0x28a8 as its fast-path check. */
let _instanceOnce: bigint = 0n; // @ProChannel BSS, read @0x28a5

/** @ProChannel BSS `__ZN29OZChannelVertexFolder_Factory9_instanceE`.
 *  The singleton pointer. Read @0x28d3-0x28da (the return value).
 *  Written by the __call_once_proxy lambda (a SEPARATE ledger entry —
 *  the proxy body is in ProChannel and, when its unit is claimed, will
 *  replace the stub below). */
let _instance: OZChannelVertexFolder_Factory | null = null; // @ProChannel BSS, read @0x28d3

/**
 * `std::__1::__call_once(flag&, void* arg, void(*)(void*))` — libc++
 * (libc++.dylib). Called from getInstance @0x28ce via ProChannel stub
 * 0xacdc8. TRUE out-of-scope extern (libc++ runtime). In this port there
 * is no libc++ runtime, so we model the "run the initializer exactly
 * once, atomically" contract at the JS single-threaded level: on first
 * call with a zero once_flag, we invoke the proxy(arg) and — IF it
 * completes without throwing — write $-1 into the flag; on subsequent
 * calls we no-op. If the proxy throws, the flag stays 0 (libc++'s
 * ~0UL-on-success write is skipped) and future calls will retry, exactly
 * like the real runtime. This is the minimum behaviour getInstance's
 * disasm relies on (the fast-path @0x28a8 `cmp $-1` check).
 *
 * (Same model used by OZChannelBase_Factory.ts — the two factories
 *  share this contract because they share the libc++ template.)
 */
function std_call_once(
  once: { get(): bigint; set(v: bigint): void },
  arg: unknown,
  proxy: (arg: unknown) => void,
): void {
  // libc++ fast-path: already completed?
  if (once.get() === -1n) return; // mirrors @0x28a8 fast-path exit
  // First-call slow path (single-threaded model — no atomic CAS needed
  // in JS). Run the proxy; on success mark the flag ~0.
  proxy(arg);
  once.set(-1n);
}

/**
 * `__ZNSt3__117__call_once_proxyB9nqe210106<tuple<OZChannelVertexFolder_Factory::getInstance()::'lambda'()&&>>(void*)`
 * — libc++ template instantiation whose ADDRESS is loaded @0x28c7 and
 * passed to std::__call_once as the fn pointer. Its body unpacks the
 * tuple<lambda&&> from the void* arg and invokes the lambda. The
 * lambda (again, a SEPARATE ledger unit) is what actually allocates
 * OZChannelVertexFolder_Factory via `operator new(sizeof)` and calls
 * its C2 base ctor `__ZN29OZChannelVertexFolder_FactoryC2Ev`, then
 * stores the pointer into `_instance`. Neither the proxy nor the C2
 * ctor is yet ported — this stub raises with the exact ProChannel
 * @0xADDRs of the dispatching call sites so the deferred work is
 * transparently documented and will be picked up by future depclaims.
 */
function __call_once_proxy_getInstance_lambda(_arg: unknown): void {
  throw new Error(
    "OZChannelVertexFolder_Factory::getInstance() __call_once init lambda not yet transcribed @ProChannel 0x28c7 — the proxy function pointer loaded @0x28c7 (__ZNSt3__117__call_once_proxyB9nqe210106<tuple<OZChannelVertexFolder_Factory::getInstance()::lambda()&&>>) dispatches through the template's __invoke, which allocates a fresh OZChannelVertexFolder_Factory via operator new (libc++ __Znwm stub, ProChannel 0xace4c) then invokes __ZN29OZChannelVertexFolder_FactoryC2Ev (the C2 base ctor — SEPARATE ledger unit, currently unported) and stores the result into _instance. The proxy is invoked from std::__call_once at ProChannel 0x28ce. When those units land they replace this stub.",
  );
}

// ═════════════════════════════════════════════════════════════════════════
// The class
// ═════════════════════════════════════════════════════════════════════════

/**
 * `OZChannelVertexFolder_Factory` — factory singleton for the
 * OZChannelVertexFolder channel type. Only its getInstance() accessor
 * is ported in this file; every other method is a separate ledger entry
 * to be added to this same file when claimed (per the "one class per
 * file, extend later" rule).
 */
export class OZChannelVertexFolder_Factory {
  /**
   * `OZChannelVertexFolder_Factory::getInstance()` — @ProChannel 0x2896
   * (__ZN29OZChannelVertexFolder_Factory11getInstanceEv).
   *
   * Faithful line-for-line transcription of the 22-line disassembly
   * quoted in the file header. Standard libc++ std::call_once-guarded
   * singleton accessor:
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
   * The stack tuple + captureless-lambda dance @0x28ae..0x28bd is an
   * ABI-level artefact of libc++'s __call_once template instantiation —
   * the caller side just does "call call_once with the proxy pointer"
   * and doesn't observe the intermediate slots. In this port we don't
   * need to model the two stack slots because std_call_once (above)
   * invokes the proxy directly (single-threaded, no ABI marshaling
   * needed). The disasm's stack setup is documented for provenance but
   * does not affect observable behaviour.
   */
  static getInstance(): OZChannelVertexFolder_Factory | null {
    // ------------------------------------------------------------
    // @0x2896..0x289a — prologue + 0x20-byte local frame.
    //                    (No TS-visible effect.)
    // @0x289e..0x28a5 — rax = _instanceOnce.
    // @0x28a8..0x28ac — if (_instanceOnce == -1) goto fast_path (0x28d3).
    // ------------------------------------------------------------
    if (_instanceOnce !== -1n) {
      // ------------------------------------------------------------
      // @0x28ae..0x28bd — set up libc++ tuple<lambda&&> on the stack.
      //                    (ABI-level, no TS-visible effect — the proxy
      //                    just needs a stable void* to dispatch through;
      //                    we pass a null placeholder.)
      // @0x28c0         — rdi = &_instanceOnce.
      // @0x28c7         — rdx = &__call_once_proxy<...lambda...>.
      // @0x28ce         — callq std::__call_once (libc++ stub @0xacdc8).
      // ------------------------------------------------------------
      std_call_once(
        {
          get: (): bigint => _instanceOnce, // mirrors `movq (%rax),%rax` @0x28a5
          set: (v: bigint): void => {
            _instanceOnce = v;
          },
        },
        null, // ABI void* — real disasm passes &tuple; our proxy ignores it.
        __call_once_proxy_getInstance_lambda,
      );
    }
    // ------------------------------------------------------------
    // @0x28d3..0x28da — rax = _instance.
    // @0x28dd..0x28e2 — epilogue + retq.
    // @0x28e3         — nop (alignment pad).
    // ------------------------------------------------------------
    return _instance;
  }
}
