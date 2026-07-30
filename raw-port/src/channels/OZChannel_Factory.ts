// OZChannel_Factory.ts — ProChannel factory singleton for OZChannel.
//
// Transcribed from /Applications/Final Cut Pro.app/Contents/Frameworks/
// ProChannel.framework/Versions/A/ProChannel (x86_64 slice; unadjusted
// VAs from `otool -tV`). Disassembly source:
//   raw-port/re/disasm/ProChannel.__ZN17OZChannel_Factory11getInstanceEv.s
//
// This unit ports ONLY the `getInstance()` static singleton accessor at
// @0x17d4. The remaining methods on this factory (C2/D1/D0/createInstance
// /etc.) are separate ledger entries and are OUT OF SCOPE for this file;
// they will be added to this same class file when their own ledger
// entries are claimed by future depclaim rounds (per the "one class per
// file" rule, extending this file with more methods later is the correct
// workflow, not creating a sibling).
//
// -----------------------------------------------------------------------------
// PROCESS-GLOBAL STORAGE (the two symbols getInstance reads/writes)
// -----------------------------------------------------------------------------
// Two BSS globals live at fixed addresses in ProChannel, each holding one
// 8-byte word:
//
//   __ZN17OZChannel_Factory13_instanceOnceE
//     — the libc++ std::once_flag word (an `unsigned long` in libc++'s
//       __call_once implementation). Semantics: value 0 = "not yet
//       started", intermediate values = "another thread is currently
//       running init", value -1 = "init completed successfully"
//       (libc++ writes ~0UL on completion). The `cmpq $-1, %rax` at
//       @0x17e6 is the standard libc++ fast-path check for "init done".
//
//   __ZN17OZChannel_Factory9_instanceE
//     — an `OZChannel_Factory*` (pointer to the singleton instance).
//       Written by the __invoke thunk that std::__call_once dispatches
//       to on first call; read by getInstance @0x1811.
//
// -----------------------------------------------------------------------------
// FRONTIER CALLEES (all TRUE OUT-OF-SCOPE externs or SEPARATE ledger units)
// -----------------------------------------------------------------------------
//   * __ZNSt3__111__call_onceERVmPvPFvS2_E
//       — std::__1::__call_once(flag&, void*, void(*)(void*))
//       — libc++ (libc++.dylib) — TRUE out-of-scope extern. Called
//         @0x180c via ProChannel stub 0xacdc8. Same policy as
//         OZChannelBase_Factory::getInstance and HGMemory's call_once
//         callsites — modelled as a boundary function that runs the
//         proxy exactly once (single-threaded JS collapses libc++'s
//         atomic CAS to a plain flag check).
//
//   * __ZNSt3__117__call_once_proxyB9nqe210106<
//         tuple<OZChannel_Factory::getInstance()::'lambda'()&&>>(void*)
//       — libc++ template instantiation @ProChannel 0x3148 that unpacks
//         the tuple and invokes the lambda. NOT called by getInstance
//         directly — it is PASSED AS A DATA REFERENCE (a function-pointer
//         argument, `leaq __call_once_proxy(%rip), %rdx` @0x1805) to
//         __call_once, which then dispatches through it. The proxy body
//         is `jmp __ZNSt3__18__invoke<...>` at ProChannel 0x3148 → 0x3158
//         (a separate ledger entry NOT in this file's scope, status: todo).
//         That __invoke instantiation calls
//         __ZN17OZChannel_FactoryC2Ev (the C2 base ctor, ledger status:
//         todo) via operator new(0x88) at ProChannel 0x3164
//         (__Znwm stub 0xace4c) then C2 @0x316f then stores the pointer
//         into `_instance` @0x3174-0x317b. It is a TRANSITIVE dependency
//         of getInstance, but not a DIRECT callee — getInstance's disasm
//         only names __call_once as a call target (all other refs are
//         `leaq` data references or memory loads).
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
//   * __ZN17OZChannel_Factory11getInstanceEv
//       — OZChannel_Factory::getInstance() @ProChannel 0x17d4
//
// -----------------------------------------------------------------------------
// FULL DISASM (raw-port/re/disasm/ProChannel.__ZN17OZChannel_Factory11getInstanceEv.s)
// -----------------------------------------------------------------------------
//   0x17d4  pushq  %rbp                              ; frame prologue
//   0x17d5  movq   %rsp, %rbp
//   0x17d8  subq   $0x20, %rsp                       ; 32-byte local frame
//                                                    ; (holds a 3-word libc++
//                                                    ; "tuple<lambda&&>" plus
//                                                    ; alignment padding)
//   0x17dc  leaq   _instanceOnce(%rip), %rax         ; rax = &_instanceOnce
//   0x17e3  movq   (%rax), %rax                      ; rax = _instanceOnce
//   0x17e6  cmpq   $-0x1, %rax                       ; already-init check
//                                                    ; (libc++ writes ~0UL
//                                                    ; on completion)
//   0x17ea  je     0x1811                            ; fast path: skip call_once
//   0x17ec  leaq   -0x1(%rbp), %rax                  ; rax = &frame[-1] (a 1-byte
//                                                    ; stack slot — the lambda's
//                                                    ; empty captureless closure
//                                                    ; body; libc++'s tuple<T&&>
//                                                    ; needs a stable address).
//   0x17f0  leaq   -0x18(%rbp), %rcx                 ; rcx = &frame[-0x18]
//                                                    ; (the tuple<T&&> slot)
//   0x17f4  movq   %rax, (%rcx)                      ; tuple.head = &lambda-slot
//   0x17f7  leaq   -0x10(%rbp), %rsi                 ; rsi = &frame[-0x10]
//                                                    ; (call_once's `void* arg`)
//   0x17fb  movq   %rcx, (%rsi)                      ; *arg = &tuple
//                                                    ; (the void* passed to
//                                                    ; __call_once_proxy)
//   0x17fe  leaq   _instanceOnce(%rip), %rdi         ; rdi = &_instanceOnce
//   0x1805  leaq   __call_once_proxy<...>(%rip), %rdx; rdx = &proxy_func
//                                                    ; (function pointer)
//   0x180c  callq  std::__call_once                   ; libc++ stub @0xacdc8
//                                                    ; signature:
//                                                    ; (once_flag& = %rdi,
//                                                    ;  void* arg   = %rsi,
//                                                    ;  void(*)(void*) = %rdx)
//   0x1811  leaq   _instance(%rip), %rax             ; rax = &_instance
//   0x1818  movq   (%rax), %rax                      ; rax = _instance
//                                                    ; (the return value: the
//                                                    ; singleton pointer, or
//                                                    ; NULL if init raised)
//   0x181b  addq   $0x20, %rsp                       ; frame epilogue
//   0x181f  popq   %rbp
//   0x1820  retq

// ═════════════════════════════════════════════════════════════════════════
// Process-global BSS slots — one 8-byte word each, sitting at fixed
// linker-assigned addresses in ProChannel's __common/__bss. Since TS has
// no linker, we model them as module-scope `let`s. The initial state
// mirrors the ELF/Mach-O convention that BSS is zero-filled at load:
//   _instanceOnce = 0n  ("not yet initialised" — libc++ once_flag zero)
//   _instance     = null (nullptr — no singleton allocated yet)
// ═════════════════════════════════════════════════════════════════════════

/** @ProChannel BSS `__ZN17OZChannel_Factory13_instanceOnceE`.
 *  libc++ std::once_flag word. 0n = not started; 2n/3n = another thread
 *  running init; -1n (0xFFFF_FFFF_FFFF_FFFF) = completed. getInstance
 *  compares this to $-1 @0x17e6 as its fast-path check. */
let _instanceOnce: bigint = 0n; // @ProChannel BSS 0x17d4 read-site

/** @ProChannel BSS `__ZN17OZChannel_Factory9_instanceE`.
 *  The singleton pointer. Read @0x1811-0x1818 (the return value).
 *  Written by the __call_once_proxy → __invoke thunk (a separate
 *  function at ProChannel 0x3148 → 0x3158-0x317b). */
let _instance: OZChannel_Factory | null = null; // @ProChannel BSS 0x1811

/**
 * `std::__1::__call_once(flag&, void* arg, void(*)(void*))` — libc++
 * (libc++.dylib). Called from getInstance @0x180c via ProChannel stub
 * 0xacdc8. TRUE out-of-scope extern (libc++ runtime). In this port there
 * is no libc++ runtime, so we model the "run the initializer exactly
 * once, atomically" contract at the JS single-threaded level: on first
 * call with a zero once_flag, we invoke the proxy(arg) and — IF it
 * completes without throwing — write $-1 into the flag; on subsequent
 * calls we no-op. If the proxy throws, the flag stays 0 (libc++'s
 * ~0UL-on-success write is skipped) and future calls will retry, exactly
 * like the real runtime. This is the minimum behaviour getInstance's
 * disasm relies on (the fast-path @0x17e6 `cmp $-1` check). */
function std_call_once(
  once: { get(): bigint; set(v: bigint): void },
  arg: unknown,
  proxy: (arg: unknown) => void,
): void {
  // libc++ fast-path: already completed?
  if (once.get() === -1n) return; // (mirrors 0x17e6 fast-path exit)
  // First-call slow path (single-threaded model — no atomic CAS needed
  // in JS). Run the proxy; on success mark the flag ~0.
  proxy(arg);
  once.set(-1n);
}

/**
 * `__ZNSt3__117__call_once_proxy<...>` — libc++ template instantiation
 * (ProChannel 0x3148). Body is `jmp __invoke<...>` @0x3158, which
 * allocates a fresh OZChannel_Factory (size 0x88) via `operator new`
 * @0x3164 (__Znwm stub 0xace4c) and invokes
 * `OZChannel_Factory::OZChannel_Factory()` (the C2 base ctor,
 * __ZN17OZChannel_FactoryC2Ev, currently ledger status = `todo`)
 * @0x316f; on success it stores the pointer into `_instance` @0x3174-
 * 0x317b. Since neither the C2 ctor nor operator new are ported yet,
 * the proxy stub raises with the exact @0xADDRs of the dispatching call
 * sites — the deferred work is transparently documented and will
 * resolve once the ctor is ported. */
function __call_once_proxy_getInstance_lambda(_arg: unknown): void {
  // The __invoke body @ProChannel 0x3158..0x3182 is:
  //   1. rax = operator new(0x88)        @ProChannel 0x3164 (imported __Znwm stub 0xace4c)
  //   2. OZChannel_Factory::C2(rax)      @ProChannel 0x316f (__ZN17OZChannel_FactoryC2Ev)
  //   3. _instance = rax                 @ProChannel 0x3174-0x317b
  // C2 is a separate ledger entry (todo). We cite all call sites.
  throw new Error(
    "OZChannel_Factory::getInstance() __call_once init lambda not yet " +
      "transcribed — the __invoke body @ProChannel 0x3158 allocates 0x88 " +
      "bytes via operator new @0x3164 (stub 0xace4c) then invokes " +
      "__ZN17OZChannel_FactoryC2Ev @ProChannel 0x316f (C2 base ctor, " +
      "ledger status: todo) and stores the result into _instance @0x3174-" +
      "0x317b. Neither operator new (__Znwm ProChannel stub 0xace4c) nor " +
      "the C2 ctor is yet ported — this lambda function is a SEPARATE " +
      "ledger unit and will be filled in when it is next claimed. The " +
      "proxy is invoked from std::__call_once at ProChannel 0x180c.",
  );
}

// ═════════════════════════════════════════════════════════════════════════
// The class
// ═════════════════════════════════════════════════════════════════════════

/**
 * `OZChannel_Factory` — factory singleton for OZChannel instances. Only
 * its getInstance() accessor is ported in this file; every other method
 * is a separate ledger entry. See file header for the storage layout
 * (a 0x88-byte object per the operator-new call in the __invoke thunk;
 * field offsets not yet decoded since only getInstance is transcribed
 * here).
 */
export class OZChannel_Factory {
  /**
   * `OZChannel_Factory::getInstance()` — @ProChannel 0x17d4
   * (__ZN17OZChannel_Factory11getInstanceEv).
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
   *      (@ProChannel 0x3148) unpacks the tuple and jumps to __invoke
   *      (@ProChannel 0x3158) which allocates and constructs the
   *      singleton and writes it to `_instance`.
   *
   *   3. Return `_instance` (whatever the initializer wrote — or NULL if
   *      the initializer threw and never got to write).
   *
   * Note: the stack tuple + captureless-lambda dance @0x17ec..0x17fb is
   * an ABI-level artefact of libc++'s __call_once template
   * instantiation — the caller side just does "call call_once with the
   * proxy pointer" and doesn't observe the intermediate slots. In this
   * port we don't need to model the two stack slots because
   * std_call_once (above) invokes the proxy directly (single-threaded,
   * no ABI marshaling needed). The disasm's stack setup is documented
   * here for provenance but does not affect observable behaviour.
   */
  static getInstance(): OZChannel_Factory | null {
    // ------------------------------------------------------------
    // @0x17d4..0x17d8 — prologue + 0x20-byte local frame.
    // (No TS-visible effect.)
    // @0x17dc..0x17e3 — rax = _instanceOnce.
    // @0x17e6..0x17ea — if (_instanceOnce == -1) goto fast_path (0x1811).
    // ------------------------------------------------------------
    if (_instanceOnce !== -1n) {
      // ------------------------------------------------------------
      // @0x17ec..0x17fb — set up libc++ tuple<lambda&&> on the stack.
      // (ABI-level, no TS-visible effect — the proxy just needs a
      // stable void* to dispatch through; we pass a null placeholder.)
      // @0x17fe — rdi = &_instanceOnce.
      // @0x1805 — rdx = &__call_once_proxy<...lambda...> (@ProChannel 0x3148).
      // @0x180c — callq std::__call_once (libc++ stub @0xacdc8).
      // ------------------------------------------------------------
      std_call_once(
        {
          get: (): bigint => _instanceOnce, // (mirrors `movq (%rax),%rax` @0x17e3 read-side)
          set: (v: bigint): void => {
            _instanceOnce = v;
          },
        },
        null, // ABI void* — the real disasm passes &tuple; our proxy ignores it.
        __call_once_proxy_getInstance_lambda,
      );
    }
    // ------------------------------------------------------------
    // @0x1811..0x1818 — rax = _instance.
    // @0x181b..0x1820 — epilogue + retq.
    // ------------------------------------------------------------
    return _instance;
  }
}
