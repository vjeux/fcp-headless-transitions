// OZChannelGradientExtras_Factory — ProChannel factory singleton for
// OZChannelGradientExtras channel instances.
//
// Transcribed from /Applications/Final Cut Pro.app/Contents/Frameworks/
// ProChannel.framework/Versions/A/ProChannel (x86_64 slice; unadjusted
// VAs from `otool -tV`). Disassembly source:
//   raw-port/re/disasm/ProChannel.__ZN31OZChannelGradientExtras_Factory11getInstanceEv.s
//
// This unit ports ONLY the `getInstance()` static singleton accessor at
// @0x20f8. All other methods on this factory (C2/D1/D0/create/... etc.)
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
// (a SEPARATE ledger unit at ProChannel 0x6b06c) and therefore raises a
// documented "not yet transcribed" error at that boundary — NOT a
// fabricated `new OZChannelGradientExtras_Factory()`.
//
// -----------------------------------------------------------------------------
// PROCESS-GLOBAL STORAGE (the two symbols getInstance reads/writes)
// -----------------------------------------------------------------------------
// Two BSS globals live at fixed addresses in ProChannel, each holding one
// 8-byte word:
//
//   __ZN31OZChannelGradientExtras_Factory13_instanceOnceE
//     — the libc++ std::once_flag word (an `unsigned long` in libc++'s
//       __call_once implementation). Semantics: value 0 = "not yet
//       started", intermediate values = "another thread is currently
//       running init", value -1 = "init completed successfully"
//       (libc++ writes ~0UL on completion). The `cmpq $-1, %rax` at
//       @0x210a is the standard libc++ fast-path check for "init done".
//
//   __ZN31OZChannelGradientExtras_Factory9_instanceE
//     — an `OZChannelGradientExtras_Factory*` (pointer to the singleton
//       instance). Written by the lambda that std::__call_once invokes
//       on first call; read by getInstance @0x2135.
//
// -----------------------------------------------------------------------------
// FRONTIER CALLEES (all TRUE OUT-OF-SCOPE externs or SEPARATE ledger units)
// -----------------------------------------------------------------------------
//   * __ZNSt3__111__call_onceERVmPvPFvS2_E
//       — std::__1::__call_once(flag&, void*, void(*)(void*))
//       — libc++ (libc++.dylib) — TRUE out-of-scope extern. Called
//         @0x2130 via ProChannel stub 0xacdc8. Same policy as
//         OZChannelBase_Factory's call_once callsite.
//
//   * __ZNSt3__117__call_once_proxyB9nqe210106<
//         tuple<OZChannelGradientExtras_Factory::getInstance()::'lambda'()&&>>(void*)
//       — libc++ template instantiation that unpacks the tuple and
//         invokes the lambda. NOT called by getInstance directly — it is
//         PASSED AS A DATA REFERENCE (a function-pointer argument) to
//         __call_once, which then dispatches through it. Body verified
//         at ProChannel 0x6b06c via raw-port/tools/disasm.sh:
//           0x6b06c  pushq  %rbp
//           0x6b06d  movq   %rsp, %rbp
//           0x6b070  movq   (%rdi), %rax
//           0x6b073  movq   (%rax), %rdi
//           0x6b076  popq   %rbp
//           0x6b077  jmp    __invoke<...lambda...>
//         The `__invoke` instantiation then allocates a new
//         OZChannelGradientExtras_Factory via `operator new`
//         (__Znwm ProChannel stub 0xace4c) and invokes
//         __ZN31OZChannelGradientExtras_FactoryC2Ev (the C2 base ctor),
//         then stores the resulting pointer into `_instance`. That
//         entire lambda body is a SEPARATE ledger unit and will be
//         filled in when the C2 ctor is next claimed. It is a
//         TRANSITIVE dependency of getInstance, not a DIRECT callee —
//         getInstance's disasm only names __call_once as a call target
//         (all other refs are `leaq` data references or memory loads).
//
// -----------------------------------------------------------------------------
// Symbols ported here (mangled → address)
// -----------------------------------------------------------------------------
//   * __ZN31OZChannelGradientExtras_Factory11getInstanceEv
//       — OZChannelGradientExtras_Factory::getInstance() @ProChannel 0x20f8
//
// -----------------------------------------------------------------------------
// FULL DISASM (raw-port/re/disasm/ProChannel.__ZN31OZChannelGradientExtras_Factory11getInstanceEv.s)
// -----------------------------------------------------------------------------
//   0x20f8  pushq  %rbp                              ; frame prologue
//   0x20f9  movq   %rsp, %rbp
//   0x20fc  subq   $0x20, %rsp                       ; 32-byte local frame
//                                                    ; (holds a 3-word libc++
//                                                    ; "tuple<lambda&&>" plus
//                                                    ; alignment padding)
//   0x2100  leaq   _instanceOnce(%rip), %rax         ; rax = &_instanceOnce
//   0x2107  movq   (%rax), %rax                      ; rax = _instanceOnce
//   0x210a  cmpq   $-0x1, %rax                       ; already-init check
//                                                    ; (libc++ writes ~0UL
//                                                    ; on completion)
//   0x210e  je     0x2135                            ; fast path: skip call_once
//   0x2110  leaq   -0x1(%rbp), %rax                  ; rax = &frame[-1] (a 1-byte
//                                                    ; stack slot — the lambda's
//                                                    ; empty captureless closure
//                                                    ; body; libc++'s tuple<T&&>
//                                                    ; needs a stable address).
//   0x2114  leaq   -0x18(%rbp), %rcx                 ; rcx = &frame[-0x18]
//                                                    ; (the tuple<T&&> slot)
//   0x2118  movq   %rax, (%rcx)                      ; tuple.head = &lambda-slot
//   0x211b  leaq   -0x10(%rbp), %rsi                 ; rsi = &frame[-0x10]
//                                                    ; (call_once's `void* arg`)
//   0x211f  movq   %rcx, (%rsi)                      ; *arg = &tuple
//                                                    ; (the void* passed to
//                                                    ; __call_once_proxy)
//   0x2122  leaq   _instanceOnce(%rip), %rdi         ; rdi = &_instanceOnce
//   0x2129  leaq   __call_once_proxy<...>(%rip), %rdx; rdx = &proxy_func
//                                                    ; (function pointer)
//   0x2130  callq  std::__call_once                   ; libc++ stub @0xacdc8
//                                                    ; signature:
//                                                    ; (once_flag& = %rdi,
//                                                    ;  void* arg   = %rsi,
//                                                    ;  void(*)(void*) = %rdx)
//   0x2135  leaq   _instance(%rip), %rax             ; rax = &_instance
//   0x213c  movq   (%rax), %rax                      ; rax = _instance
//                                                    ; (the return value: the
//                                                    ; singleton pointer, or
//                                                    ; NULL if init raised)
//   0x213f  addq   $0x20, %rsp                       ; frame epilogue
//   0x2143  popq   %rbp
//   0x2144  retq

// ═════════════════════════════════════════════════════════════════════════
// Process-global BSS slots — one 8-byte word each, sitting at fixed
// linker-assigned addresses in ProChannel's __common/__bss. Since TS has
// no linker, we model them as module-scope `let`s. The initial state
// mirrors the ELF/Mach-O convention that BSS is zero-filled at load:
//   _instanceOnce = 0n  ("not yet initialised" — libc++ once_flag zero)
//   _instance     = null (nullptr — no singleton allocated yet)
// ═════════════════════════════════════════════════════════════════════════

/** @ProChannel BSS `__ZN31OZChannelGradientExtras_Factory13_instanceOnceE`.
 *  libc++ std::once_flag word. 0n = not started; intermediate values =
 *  another thread running init; -1n (0xFFFF_FFFF_FFFF_FFFF) = completed.
 *  getInstance compares this to $-1 @0x210a as its fast-path check. */
let _instanceOnce: bigint = 0n; // @ProChannel BSS 0x2100 read-site

/** @ProChannel BSS `__ZN31OZChannelGradientExtras_Factory9_instanceE`.
 *  The singleton pointer. Read @0x2135-0x213c (the return value).
 *  Written by the __call_once_proxy lambda (a separate function at
 *  ProChannel 0x6b06c). */
let _instance: OZChannelGradientExtras_Factory | null = null; // @ProChannel BSS 0x2135

/**
 * `std::__1::__call_once(flag&, void* arg, void(*)(void*))` — libc++
 * (libc++.dylib). Called from getInstance @0x2130 via ProChannel stub
 * 0xacdc8. TRUE out-of-scope extern (libc++ runtime). In this port there
 * is no libc++ runtime, so we model the "run the initializer exactly
 * once, atomically" contract at the JS single-threaded level: on first
 * call with a zero once_flag, we invoke the proxy(arg) and — IF it
 * completes without throwing — write $-1 into the flag; on subsequent
 * calls we no-op. If the proxy throws, the flag stays 0 (libc++'s
 * ~0UL-on-success write is skipped) and future calls will retry, exactly
 * like the real runtime. This is the minimum behaviour getInstance's
 * disasm relies on (the fast-path @0x210a `cmp $-1` check). */
function std_call_once(
  once: { get(): bigint; set(v: bigint): void },
  arg: unknown,
  proxy: (arg: unknown) => void,
): void {
  // libc++ fast-path: already completed?
  if (once.get() === -1n) return; // (mirrors 0x210a fast-path exit)
  // First-call slow path (single-threaded model — no atomic CAS needed
  // in JS). Run the proxy; on success mark the flag ~0.
  proxy(arg);
  once.set(-1n);
}

/**
 * `__ZNSt3__117__call_once_proxy<...>` — libc++ template instantiation
 * at ProChannel 0x6b06c. Body verified:
 *   0x6b06c  pushq %rbp / movq %rsp,%rbp
 *   0x6b070  movq (%rdi),%rax        ; rax = *arg (tuple.head, pointer to lambda slot)
 *   0x6b073  movq (%rax),%rdi        ; rdi = *tuple.head (the lambda object)
 *   0x6b076  popq %rbp
 *   0x6b077  jmp __invoke<...lambda...>
 * The `__invoke` tail-jumps into the captureless lambda body, which
 * allocates a fresh OZChannelGradientExtras_Factory via `operator new`
 * (__Znwm ProChannel stub 0xace4c), invokes the C2 base ctor
 * __ZN31OZChannelGradientExtras_FactoryC2Ev (ledger status: todo), and
 * stores the pointer into `_instance`. Since neither __invoke nor the C2
 * ctor is ported yet, the proxy stub raises with the exact @0xADDRs of
 * the dispatching call sites. */
function __call_once_proxy_getInstance_lambda(_arg: unknown): void {
  // The proxy @ProChannel 0x6b06c tail-jumps to __invoke, which in turn
  // executes the lambda body:
  //   1. rax = operator new(sizeof(OZChannelGradientExtras_Factory))  (via __Znwm ProChannel stub 0xace4c)
  //   2. OZChannelGradientExtras_Factory::C2(rax)                     (ledger status: todo)
  //   3. _instance = rax
  // The __invoke and C2 ctor are SEPARATE ledger entries. We cite both
  // call sites here for traceability.
  throw new Error(
    "OZChannelGradientExtras_Factory::getInstance() __call_once init " +
      "lambda not yet transcribed — the lambda body dispatched via " +
      "__call_once_proxy @ProChannel 0x6b06c (which tail-jumps to " +
      "__invoke<...lambda...>) allocates the singleton via operator new " +
      "(__Znwm ProChannel stub 0xace4c) then invokes " +
      "__ZN31OZChannelGradientExtras_FactoryC2Ev (C2 base ctor, ledger " +
      "status: todo) and stores the result into _instance. Neither " +
      "__invoke, operator new, nor the C2 ctor is yet ported — this " +
      "lambda is a SEPARATE ledger unit and will be filled in when it " +
      "is next claimed. The proxy is invoked from std::__call_once at " +
      "ProChannel 0x2130.",
  );
}

// ═════════════════════════════════════════════════════════════════════════
// The class
// ═════════════════════════════════════════════════════════════════════════

/**
 * `OZChannelGradientExtras_Factory` — factory singleton for
 * OZChannelGradientExtras channel instances (the extras/side-band data
 * that accompanies a gradient channel). Only its getInstance() accessor
 * is ported in this file; every other method is a separate ledger
 * entry.
 */
export class OZChannelGradientExtras_Factory {
  /**
   * `OZChannelGradientExtras_Factory::getInstance()` — @ProChannel 0x20f8
   * (__ZN31OZChannelGradientExtras_Factory11getInstanceEv).
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
   * Note: the stack tuple + captureless-lambda dance @0x2110..0x211f is
   * an ABI-level artefact of libc++'s __call_once template
   * instantiation — the caller side just does "call call_once with the
   * proxy pointer" and doesn't observe the intermediate slots. In this
   * port we don't need to model the two stack slots because
   * std_call_once (above) invokes the proxy directly (single-threaded,
   * no ABI marshaling needed). The disasm's stack setup is documented
   * here for provenance but does not affect observable behaviour.
   */
  static getInstance(): OZChannelGradientExtras_Factory | null {
    // ------------------------------------------------------------
    // @0x20f8..0x20fc — prologue + 0x20-byte local frame.
    // (No TS-visible effect.)
    // @0x2100..0x2107 — rax = _instanceOnce.
    // @0x210a..0x210e — if (_instanceOnce == -1) goto fast_path (0x2135).
    // ------------------------------------------------------------
    if (_instanceOnce !== -1n) {
      // ------------------------------------------------------------
      // @0x2110..0x211f — set up libc++ tuple<lambda&&> on the stack.
      // (ABI-level, no TS-visible effect — the proxy just needs a
      // stable void* to dispatch through; we pass a null placeholder.)
      // @0x2122 — rdi = &_instanceOnce.
      // @0x2129 — rdx = &__call_once_proxy<...lambda...> (ProChannel 0x6b06c).
      // @0x2130 — callq std::__call_once (libc++ stub @0xacdc8).
      // ------------------------------------------------------------
      std_call_once(
        {
          get: (): bigint => _instanceOnce, // (mirrors `movq (%rax),%rax` @0x2107 read-side)
          set: (v: bigint): void => {
            _instanceOnce = v;
          },
        },
        null, // ABI void* — the real disasm passes &tuple; our proxy ignores it.
        __call_once_proxy_getInstance_lambda,
      );
    }
    // ------------------------------------------------------------
    // @0x2135..0x213c — rax = _instance.
    // @0x213f..0x2144 — epilogue + retq.
    // ------------------------------------------------------------
    return _instance;
  }
}
