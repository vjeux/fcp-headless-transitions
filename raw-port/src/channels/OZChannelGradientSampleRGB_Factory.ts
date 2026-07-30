// OZChannelGradientSampleRGB_Factory — ProChannel factory singleton for
// OZChannelGradientSampleRGB.
//
// Transcribed from /Applications/Final Cut Pro.app/Contents/Frameworks/
// ProChannel.framework/Versions/A/ProChannel (x86_64 slice; unadjusted
// VAs from `otool -tV`). Disassembly source:
//   raw-port/re/disasm/ProChannel.__ZN34OZChannelGradientSampleRGB_Factory11getInstanceEv.s
//
// This unit ports ONLY the `getInstance()` static singleton accessor at
// @0x205c. The remaining methods on this factory are separate ledger
// entries and are OUT OF SCOPE for this file — they will be added to
// this same class file when their own ledger entries are claimed by
// future depclaim rounds (one class per file rule; extending this file
// later is the correct workflow, not creating a sibling).
//
// Structurally IDENTICAL to OZChannelBase_Factory::getInstance
// (@ProChannel 0x1786) — the ONLY differences are the fixed-address
// storage symbols and the address of the __call_once_proxy
// instantiation. The 22-instruction body is a byte-for-byte peer of the
// base-factory getInstance disassembly documented in
// raw-port/src/channels/OZChannelBase_Factory.ts (which is the honest
// peer this port copies from — per DEP_WORKER_BRIEF's guidance for
// call_once getInstance factories).
//
// -----------------------------------------------------------------------------
// PROCESS-GLOBAL STORAGE
// -----------------------------------------------------------------------------
// Two BSS globals live at fixed addresses in ProChannel, each holding one
// 8-byte word (per the `leaq …_instanceOnce(%rip),%rax` @0x2064 and
// `leaq …_instance(%rip),%rax` @0x2099 in the disasm):
//
//   __ZN34OZChannelGradientSampleRGB_Factory13_instanceOnceE
//     — the libc++ std::once_flag word (an `unsigned long` in libc++'s
//       __call_once implementation). Value 0 = "not yet started",
//       intermediate values = "another thread is currently running
//       init", value -1 = "init completed successfully" (libc++ writes
//       ~0UL on completion). The `cmpq $-1, %rax` at @0x206e is the
//       standard libc++ fast-path check for "init done".
//
//   __ZN34OZChannelGradientSampleRGB_Factory9_instanceE
//     — an `OZChannelGradientSampleRGB_Factory*` (pointer to the
//       singleton instance). Written by the lambda that
//       std::__call_once invokes on first call; read by getInstance
//       @0x2099-0x20a0.
//
// -----------------------------------------------------------------------------
// FRONTIER CALLEES (all TRUE OUT-OF-SCOPE externs or SEPARATE ledger units)
// -----------------------------------------------------------------------------
//   * __ZNSt3__111__call_onceERVmPvPFvS2_E
//       — std::__1::__call_once(flag&, void*, void(*)(void*)) — libc++
//         (libc++.dylib) — TRUE out-of-scope extern. Called @0x2094 via
//         ProChannel stub 0xacdc8.
//
//   * __ZNSt3__117__call_once_proxyB9nqe210106<
//         tuple<OZChannelGradientSampleRGB_Factory::getInstance()::'lambda'()&&>>(void*)
//       — libc++ template instantiation @ProChannel 0x6efd2. NOT called
//         by getInstance directly — it is PASSED AS A DATA REFERENCE
//         (a function-pointer argument) to __call_once, which then
//         dispatches through it. The proxy body @0x6efd2 is:
//             pushq %rbp / movq %rsp,%rbp
//             movq  (%rdi), %rax
//             movq  (%rax), %rdi
//             popq  %rbp
//             jmp   __ZNSt3__18__invokeB9nqe210106<...lambda...>
//         i.e. the proxy dereferences twice through the tuple and
//         tail-jumps to `__invoke`, which is where the operator-new +
//         C2-ctor lives for this factory. Both `__invoke` and the C2
//         base ctor are SEPARATE ledger units (per DEP_WORKER_BRIEF's
//         "allocation INSIDE __call_once_proxy = SEPARATE ledger unit,
//         NO in-frame __Znwm" rule — we do NOT fabricate `new
//         OZChannelGradientSampleRGB_Factory()` here).
//
//         Faithful modelling: getInstance's body executes std::call_once
//         and then reads `_instance`. If the initializer runs and
//         succeeds, `_instance` is the fresh pointer; if the initializer
//         raises (which it currently does, since the ctor chain is not
//         yet ported), std::__call_once propagates the throw and
//         _instance remains untouched. Both branches are faithful to
//         the disassembly.
//
// -----------------------------------------------------------------------------
// Symbols ported here (mangled → address)
// -----------------------------------------------------------------------------
//   * __ZN34OZChannelGradientSampleRGB_Factory11getInstanceEv
//       — OZChannelGradientSampleRGB_Factory::getInstance() @ProChannel 0x205c
//
// -----------------------------------------------------------------------------
// FULL DISASM (raw-port/re/disasm/
//   ProChannel.__ZN34OZChannelGradientSampleRGB_Factory11getInstanceEv.s)
// -----------------------------------------------------------------------------
//   0x205c  pushq  %rbp                              ; frame prologue
//   0x205d  movq   %rsp, %rbp
//   0x2060  subq   $0x20, %rsp                       ; 32-byte local frame
//                                                    ; (holds a 3-word libc++
//                                                    ; "tuple<lambda&&>" plus
//                                                    ; alignment padding)
//   0x2064  leaq   _instanceOnce(%rip), %rax         ; rax = &_instanceOnce
//   0x206b  movq   (%rax), %rax                      ; rax = _instanceOnce
//   0x206e  cmpq   $-0x1, %rax                       ; already-init check
//   0x2072  je     0x2099                            ; fast path: skip call_once
//   0x2074  leaq   -0x1(%rbp), %rax                  ; rax = &frame[-1]
//                                                    ; (empty captureless
//                                                    ; lambda's 1-byte slot)
//   0x2078  leaq   -0x18(%rbp), %rcx                 ; rcx = &tuple slot
//   0x207c  movq   %rax, (%rcx)                      ; tuple.head = &lambda-slot
//   0x207f  leaq   -0x10(%rbp), %rsi                 ; rsi = call_once's `void* arg`
//   0x2083  movq   %rcx, (%rsi)                      ; *arg = &tuple
//   0x2086  leaq   _instanceOnce(%rip), %rdi         ; rdi = &_instanceOnce
//   0x208d  leaq   __call_once_proxy<...>(%rip), %rdx; rdx = &proxy_func
//                                                    ; (function pointer;
//                                                    ; proxy body at 0x6efd2)
//   0x2094  callq  std::__call_once                   ; libc++ stub @0xacdc8
//                                                    ; (once_flag& = %rdi,
//                                                    ;  void* arg   = %rsi,
//                                                    ;  void(*)(void*) = %rdx)
//   0x2099  leaq   _instance(%rip), %rax             ; rax = &_instance
//   0x20a0  movq   (%rax), %rax                      ; rax = _instance
//                                                    ; (return value)
//   0x20a3  addq   $0x20, %rsp                       ; frame epilogue
//   0x20a7  popq   %rbp
//   0x20a8  retq
//   0x20a9  nop                                      ; trailing pad

// ═════════════════════════════════════════════════════════════════════════
// Process-global BSS slots — one 8-byte word each, sitting at fixed
// linker-assigned addresses in ProChannel's __common/__bss. Since TS has
// no linker, we model them as module-scope `let`s. Initial state mirrors
// the ELF/Mach-O convention that BSS is zero-filled at load:
//   _instanceOnce = 0n  (libc++ once_flag: "not yet initialised")
//   _instance     = null (nullptr — no singleton allocated yet)
// ═════════════════════════════════════════════════════════════════════════

/** @ProChannel BSS `__ZN34OZChannelGradientSampleRGB_Factory13_instanceOnceE`.
 *  libc++ std::once_flag word. 0n = not started; 2n/3n = another thread
 *  running init; -1n (0xFFFF_FFFF_FFFF_FFFF) = completed. getInstance
 *  compares this to $-1 @0x206e as its fast-path check. */
let _instanceOnce: bigint = 0n; // @ProChannel BSS 0x2064 read-site

/** @ProChannel BSS `__ZN34OZChannelGradientSampleRGB_Factory9_instanceE`.
 *  The singleton pointer. Read @0x2099-0x20a0 (the return value).
 *  Written by the __call_once_proxy lambda (a separate function at
 *  ProChannel 0x6efd2 which tail-jumps to __invoke). */
let _instance: OZChannelGradientSampleRGB_Factory | null = null; // @ProChannel BSS 0x2099

/**
 * `std::__1::__call_once(flag&, void* arg, void(*)(void*))` — libc++
 * (libc++.dylib). Called from getInstance @0x2094 via ProChannel stub
 * 0xacdc8. TRUE out-of-scope extern (libc++ runtime). In this port there
 * is no libc++ runtime, so we model the "run the initializer exactly
 * once, atomically" contract at the JS single-threaded level: on first
 * call with a zero once_flag, we invoke the proxy(arg) and — IF it
 * completes without throwing — write $-1 into the flag; on subsequent
 * calls we no-op. If the proxy throws, the flag stays 0 (libc++'s
 * ~0UL-on-success write is skipped) and future calls will retry, exactly
 * like the real runtime. This is the minimum behaviour getInstance's
 * disasm relies on (the fast-path @0x206e `cmp $-1` check). Mirrors the
 * peer implementation in raw-port/src/channels/OZChannelBase_Factory.ts.
 */
function std_call_once(
  once: { get(): bigint; set(v: bigint): void },
  arg: unknown,
  proxy: (arg: unknown) => void,
): void {
  // libc++ fast-path: already completed?
  if (once.get() === -1n) return; // (mirrors 0x206e fast-path exit)
  // First-call slow path (single-threaded model — no atomic CAS needed
  // in JS). Run the proxy; on success mark the flag ~0.
  proxy(arg);
  once.set(-1n);
}

/**
 * `__ZNSt3__117__call_once_proxy<...>` — libc++ template instantiation
 * @ProChannel 0x6efd2. Body is (7 instructions):
 *   pushq %rbp / movq %rsp,%rbp
 *   movq  (%rdi), %rax               ; rax = *tuple  (i.e. &lambda-slot)
 *   movq  (%rax), %rdi               ; rdi = **tuple (i.e. the lambda-slot
 *                                     ; itself, dereferenced — the "lambda"
 *                                     ; here is stateless, so this is really
 *                                     ; just an ABI dance to hand off the
 *                                     ; empty lambda to __invoke)
 *   popq  %rbp
 *   jmp   __ZNSt3__18__invoke<...lambda...>   ; tail-call to __invoke
 *
 * `__invoke` then materialises the singleton — it allocates an
 * OZChannelGradientSampleRGB_Factory (via operator new) and calls the
 * class's C2 base ctor, then stores the pointer into `_instance`. That
 * function is a SEPARATE ledger unit (currently unported), so this
 * proxy stub raises with the exact @0xADDRs of the dispatching call
 * sites — the deferred work is transparently documented and will
 * resolve when the __invoke lambda is next claimed. Per
 * DEP_WORKER_BRIEF: we do NOT fabricate `new OZChannelGradientSampleRGB_Factory()`
 * here; the allocation lives INSIDE __call_once_proxy → __invoke and is
 * ledgered separately.
 */
function __call_once_proxy_getInstance_lambda(_arg: unknown): void {
  // The proxy tail-jumps to __invoke @ProChannel 0x6efdd, which is where
  // the operator-new + C2-ctor + store-to-_instance live. Neither the
  // __invoke instantiation nor the C2 ctor is yet ported — we cite the
  // exact ProChannel addresses so the deferred work is discoverable.
  throw new Error(
    "OZChannelGradientSampleRGB_Factory::getInstance() __call_once init " +
      "lambda not yet transcribed — the proxy @ProChannel 0x6efd2 tail-jumps " +
      "to __ZNSt3__18__invoke<...OZChannelGradientSampleRGB_Factory::getInstance()::'lambda'()> " +
      "@0x6efdd, which allocates the singleton via operator new (__Znwm " +
      "ProChannel stub 0xace4c) then invokes " +
      "__ZN34OZChannelGradientSampleRGB_FactoryC2Ev (C2 base ctor, ledger " +
      "status: todo) and stores the result into _instance. Neither operator " +
      "new nor the C2 ctor is yet ported — this __invoke function is a " +
      "SEPARATE ledger unit and will be filled in when it is next claimed. " +
      "The proxy is invoked from std::__call_once at ProChannel 0x2094.",
  );
}

// ═════════════════════════════════════════════════════════════════════════
// The class
// ═════════════════════════════════════════════════════════════════════════

/**
 * `OZChannelGradientSampleRGB_Factory` — factory singleton for
 * OZChannelGradientSampleRGB channel instances. Only its getInstance()
 * accessor is ported in this file; every other method is a separate
 * ledger entry. Field layout is not yet decoded (only getInstance is
 * transcribed here; the object size is set by the operator-new call
 * inside __invoke @ProChannel 0x6efdd, which is a separate ledger unit).
 */
export class OZChannelGradientSampleRGB_Factory {
  /**
   * `OZChannelGradientSampleRGB_Factory::getInstance()` — @ProChannel 0x205c
   * (__ZN34OZChannelGradientSampleRGB_Factory11getInstanceEv).
   *
   * Faithful line-for-line transcription of the 22-instruction
   * disassembly quoted in the file header. Standard libc++
   * std::call_once-guarded singleton accessor:
   *
   *   1. Read the once_flag; if it equals $-1 (~0UL, libc++'s "init
   *      complete" sentinel), skip straight to step 3.
   *
   *   2. Set up the stack tuple that libc++'s __call_once ABI expects
   *      (a two-level indirection: `arg` points to `tuple.head`, which
   *      points to the empty captureless lambda's 1-byte storage), and
   *      call std::__call_once(&_instanceOnce, arg, &proxy). The proxy
   *      unpacks the tuple and tail-calls __invoke, which allocates and
   *      constructs the singleton and writes it to `_instance`.
   *
   *   3. Return `_instance` (whatever the initializer wrote — or NULL
   *      if the initializer threw and never got to write).
   *
   * Note: the stack tuple + captureless-lambda dance @0x2074..0x2083 is
   * an ABI-level artefact of libc++'s __call_once template
   * instantiation — the caller side just does "call call_once with the
   * proxy pointer" and doesn't observe the intermediate slots. In this
   * port we don't need to model the two stack slots because
   * std_call_once (above) invokes the proxy directly (single-threaded,
   * no ABI marshaling needed). The disasm's stack setup is documented
   * here for provenance but does not affect observable behaviour.
   */
  static getInstance(): OZChannelGradientSampleRGB_Factory | null {
    // ------------------------------------------------------------
    // @0x205c..0x2060 — prologue + 0x20-byte local frame.
    // (No TS-visible effect.)
    // @0x2064..0x206b — rax = _instanceOnce.
    // @0x206e..0x2072 — if (_instanceOnce == -1) goto fast_path (0x2099).
    // ------------------------------------------------------------
    if (_instanceOnce !== -1n) {
      // ------------------------------------------------------------
      // @0x2074..0x2083 — set up libc++ tuple<lambda&&> on the stack.
      // (ABI-level, no TS-visible effect — the proxy just needs a
      // stable void* to dispatch through; we pass a null placeholder.)
      // @0x2086 — rdi = &_instanceOnce.
      // @0x208d — rdx = &__call_once_proxy<...lambda...>.
      // @0x2094 — callq std::__call_once (libc++ stub @0xacdc8).
      // ------------------------------------------------------------
      std_call_once(
        {
          get: (): bigint => _instanceOnce, // (mirrors `movq (%rax),%rax` @0x206b read-side)
          set: (v: bigint): void => {
            _instanceOnce = v;
          },
        },
        null, // ABI void* — the real disasm passes &tuple; our proxy ignores it.
        __call_once_proxy_getInstance_lambda,
      );
    }
    // ------------------------------------------------------------
    // @0x2099..0x20a0 — rax = _instance.
    // @0x20a3..0x20a8 — epilogue + retq.
    // ------------------------------------------------------------
    return _instance;
  }
}
