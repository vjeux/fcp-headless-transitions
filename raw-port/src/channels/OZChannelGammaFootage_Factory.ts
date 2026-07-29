// OZChannelGammaFootage_Factory — ProChannel factory singleton for
// OZChannelGammaFootage.
//
// Transcribed from /Applications/Final Cut Pro.app/Contents/Frameworks/
// ProChannel.framework/Versions/A/ProChannel (x86_64 slice; unadjusted
// VAs from `otool -tV`). Disassembly source:
//   raw-port/re/disasm/ProChannel.__ZN29OZChannelGammaFootage_Factory11getInstanceEv.s
//
// Only `getInstance()` @ProChannel 0x1a92 is ported here. The remaining
// methods on this factory (C2/D1/D0/create*/createChannel*/... etc.)
// are separate ledger entries — per "one class per file" they'll be
// added to THIS file when claimed in future depclaim rounds.
//
// Structurally identical to the OZChannelBase_Factory /
// OZChanObjectRef_Factory getInstance ports — every FCP
// PCSingleton-derived factory compiles to a byte-for-byte identical
// getInstance() skeleton (differs only in the globals + templated
// call_once_proxy instantiation).
//
// -----------------------------------------------------------------------------
// PROCESS-GLOBAL STORAGE
// -----------------------------------------------------------------------------
//   __ZN29OZChannelGammaFootage_Factory13_instanceOnceE
//     — libc++ std::once_flag. 0 = not started; -1 = complete. Fast-
//       path @0x1aa4 compares to $-1.
//   __ZN29OZChannelGammaFootage_Factory9_instanceE
//     — OZChannelGammaFootage_Factory*. Written by the __call_once_proxy
//       lambda @ProChannel 0x69e7 (via the __invoke instantiation that
//       calls operator new(0x88) @0x69f3 and the C2 ctor @0x69fe, then
//       stores into _instance @0x6a03..0x6a0a). Read by getInstance
//       @0x1acf..0x1ad6.
//
// -----------------------------------------------------------------------------
// FRONTIER CALLEES (all TRUE OUT-OF-SCOPE externs or SEPARATE ledger units)
// -----------------------------------------------------------------------------
//   * __ZNSt3__111__call_onceERVmPvPFvS2_E
//       — std::__1::__call_once(flag&, void*, void(*)(void*))
//       — libc++ (libc++.dylib) — TRUE out-of-scope extern. Called
//         @0x1aca via ProChannel stub 0xacdc8.
//
//   * __ZNSt3__117__call_once_proxyB9nqe210106<
//         tuple<OZChannelGammaFootage_Factory::getInstance()::'lambda'()&&>>(void*)
//       — libc++ template instantiation @ProChannel 0x69d7 that unpacks
//         the tuple and tail-calls
//         __ZNSt3__18__invokeB9nqe210106<...lambda...> @0x69e7. NOT
//         called by getInstance directly — it is PASSED AS A DATA
//         REFERENCE (a function-pointer argument) to __call_once. The
//         __invoke body:
//             mov  $0x88, %edi
//             call __Znwm                   @0x69f3  (operator new(0x88))
//             mov  %rax, %rbx
//             mov  %rax, %rdi
//             call __ZN29OZChannelGammaFootage_FactoryC2Ev  @0x69fe
//             leaq _instance(%rip), %rax    @0x6a03
//             movq %rbx, (%rax)             @0x6a0a  (_instance = new fac)
//         The C2 ctor (__ZN29OZChannelGammaFootage_FactoryC2Ev) is a
//         SEPARATE ledger unit (currently `todo`); operator new
//         (__Znwm) is a libc extern boundary. Both are TRANSITIVE
//         dependencies of getInstance, not DIRECT callees — getInstance's
//         disasm only names __call_once as a call target (all other
//         refs are `leaq` data references or memory loads).
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
//   * __ZN29OZChannelGammaFootage_Factory11getInstanceEv
//       — OZChannelGammaFootage_Factory::getInstance() @ProChannel 0x1a92
//
// -----------------------------------------------------------------------------
// FULL DISASM (raw-port/re/disasm/ProChannel.__ZN29OZChannelGammaFootage_Factory11getInstanceEv.s)
// -----------------------------------------------------------------------------
//   0x1a92  pushq  %rbp                              ; frame prologue
//   0x1a93  movq   %rsp, %rbp
//   0x1a96  subq   $0x20, %rsp                       ; 32-byte local frame
//                                                    ; (libc++ tuple<lambda&&>
//                                                    ; + alignment padding)
//   0x1a9a  leaq   _instanceOnce(%rip), %rax         ; rax = &_instanceOnce
//   0x1aa1  movq   (%rax), %rax                      ; rax = _instanceOnce
//   0x1aa4  cmpq   $-0x1, %rax                       ; already-init check
//                                                    ; (libc++ writes ~0UL
//                                                    ; on completion)
//   0x1aa8  je     0x1acf                            ; fast path: skip call_once
//   0x1aaa  leaq   -0x1(%rbp), %rax                  ; rax = &frame[-1]
//                                                    ; (1-byte captureless
//                                                    ; lambda storage slot)
//   0x1aae  leaq   -0x18(%rbp), %rcx                 ; rcx = &frame[-0x18]
//                                                    ; (tuple<T&&> slot)
//   0x1ab2  movq   %rax, (%rcx)                      ; tuple.head = &lambda-slot
//   0x1ab5  leaq   -0x10(%rbp), %rsi                 ; rsi = &frame[-0x10]
//                                                    ; (call_once's `void* arg`)
//   0x1ab9  movq   %rcx, (%rsi)                      ; *arg = &tuple
//   0x1abc  leaq   _instanceOnce(%rip), %rdi         ; rdi = &_instanceOnce
//   0x1ac3  leaq   __call_once_proxy<...>(%rip), %rdx; rdx = &proxy_func
//   0x1aca  callq  std::__call_once                   ; libc++ stub @0xacdc8
//                                                    ; (once_flag&, void*, fn)
//   0x1acf  leaq   _instance(%rip), %rax             ; rax = &_instance
//   0x1ad6  movq   (%rax), %rax                      ; rax = _instance
//                                                    ; (return value)
//   0x1ad9  addq   $0x20, %rsp                       ; frame epilogue
//   0x1add  popq   %rbp
//   0x1ade  retq

// ═════════════════════════════════════════════════════════════════════════
// Process-global BSS slots — one 8-byte word each, sitting at fixed
// linker-assigned addresses in ProChannel's __common/__bss. Since TS has
// no linker, we model them as module-scope `let`s, zero-initialised
// (matching Mach-O BSS load semantics):
//   _instanceOnce = 0n  (libc++ once_flag "not yet initialised")
//   _instance     = null (nullptr — no singleton allocated yet)
// ═════════════════════════════════════════════════════════════════════════

/** @ProChannel BSS `__ZN29OZChannelGammaFootage_Factory13_instanceOnceE`.
 *  libc++ std::once_flag word. 0n = not started; 2n/3n = another thread
 *  running init; -1n (0xFFFF_FFFF_FFFF_FFFF) = completed. getInstance
 *  compares this to $-1 @0x1aa4 as its fast-path check. */
let _instanceOnce: bigint = 0n; // @ProChannel BSS 0x1a9a read-site

/** @ProChannel BSS `__ZN29OZChannelGammaFootage_Factory9_instanceE`.
 *  The singleton pointer. Read @0x1acf-0x1ad6 (the return value).
 *  Written by the __call_once_proxy lambda body (via the __invoke
 *  template instantiation at ProChannel 0x69e7). */
let _instance: OZChannelGammaFootage_Factory | null = null; // @ProChannel BSS 0x1acf

/**
 * `std::__1::__call_once(flag&, void* arg, void(*)(void*))` — libc++
 * (libc++.dylib). Called from getInstance @0x1aca via ProChannel stub
 * 0xacdc8. TRUE out-of-scope extern (libc++ runtime). In this port there
 * is no libc++ runtime, so we model the "run the initializer exactly
 * once, atomically" contract at the JS single-threaded level: on first
 * call with a zero once_flag, we invoke the proxy(arg) and — IF it
 * completes without throwing — write $-1 into the flag; on subsequent
 * calls we no-op. If the proxy throws, the flag stays 0 (libc++'s
 * ~0UL-on-success write is skipped) and future calls will retry, exactly
 * like the real runtime. This is the minimum behaviour getInstance's
 * disasm relies on (the fast-path @0x1aa4 `cmp $-1` check). */
function std_call_once(
  once: { get(): bigint; set(v: bigint): void },
  arg: unknown,
  proxy: (arg: unknown) => void,
): void {
  // libc++ fast-path: already completed?
  if (once.get() === -1n) return; // (mirrors 0x1aa4 fast-path exit)
  // First-call slow path (single-threaded model — no atomic CAS needed
  // in JS). Run the proxy; on success mark the flag ~0.
  proxy(arg);
  once.set(-1n);
}

/**
 * `__ZNSt3__117__call_once_proxy<...>` — libc++ template instantiation
 * (ProChannel 0x69d7). Body tail-jumps to __invoke @0x69e7, which
 * allocates a fresh OZChannelGammaFootage_Factory (size 0x88) via
 * `operator new` @0x69f3 (__Znwm ProChannel stub 0xace4c) and invokes
 * `OZChannelGammaFootage_Factory::OZChannelGammaFootage_Factory()`
 * (the C2 base ctor, __ZN29OZChannelGammaFootage_FactoryC2Ev, currently
 * ledger status = `todo`) @0x69fe; on success it stores the pointer
 * into `_instance` @0x6a03..0x6a0a. Since neither the C2 ctor nor
 * operator new are ported yet, the proxy stub raises with the exact
 * @0xADDRs of the dispatching call sites — the deferred work is
 * transparently documented and will resolve once the ctor is ported. */
function __call_once_proxy_getInstance_lambda(_arg: unknown): void {
  // The lambda's body @ProChannel 0x69e7..0x6a0a is:
  //   1. rax = operator new(0x88)                        @ProChannel 0x69f3
  //   2. OZChannelGammaFootage_Factory::C2(rax)          @ProChannel 0x69fe
  //   3. _instance = rax                                 @ProChannel 0x6a03..0x6a0a
  // C2 is a separate ledger entry (todo). We cite both call sites.
  throw new Error(
    "OZChannelGammaFootage_Factory::getInstance() __call_once init lambda " +
      "not yet transcribed — the lambda body @ProChannel 0x69e7 allocates " +
      "0x88 bytes via operator new @0x69f3 (__Znwm ProChannel stub 0xace4c) " +
      "then invokes __ZN29OZChannelGammaFootage_FactoryC2Ev @ProChannel " +
      "0x69fe (C2 base ctor, ledger status: todo) and stores the result " +
      "into _instance @0x6a03..0x6a0a. Neither operator new nor the C2 " +
      "ctor is yet ported — this lambda function is a SEPARATE ledger unit " +
      "and will be filled in when it is next claimed. The proxy is invoked " +
      "from std::__call_once at ProChannel 0x1aca.",
  );
}

// ═════════════════════════════════════════════════════════════════════════
// The class
// ═════════════════════════════════════════════════════════════════════════

/**
 * `OZChannelGammaFootage_Factory` — factory singleton for
 * OZChannelGammaFootage channel instances. Only its getInstance()
 * accessor is ported in this file; every other method is a separate
 * ledger entry. See file header for the storage layout (a 0x88-byte
 * object per the operator-new call in the init lambda; field offsets
 * not yet decoded since only getInstance is transcribed here).
 */
export class OZChannelGammaFootage_Factory {
  /**
   * `OZChannelGammaFootage_Factory::getInstance()` — @ProChannel 0x1a92
   * (__ZN29OZChannelGammaFootage_Factory11getInstanceEv).
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
   * Note: the stack tuple + captureless-lambda dance @0x1aaa..0x1ab9 is
   * an ABI-level artefact of libc++'s __call_once template
   * instantiation — the caller side just does "call call_once with the
   * proxy pointer" and doesn't observe the intermediate slots. In this
   * port we don't need to model the two stack slots because
   * std_call_once (above) invokes the proxy directly (single-threaded,
   * no ABI marshaling needed). The disasm's stack setup is documented
   * here for provenance but does not affect observable behaviour.
   */
  static getInstance(): OZChannelGammaFootage_Factory | null {
    // ------------------------------------------------------------
    // @0x1a92..0x1a96 — prologue + 0x20-byte local frame.
    // (No TS-visible effect.)
    // @0x1a9a..0x1aa1 — rax = _instanceOnce.
    // @0x1aa4..0x1aa8 — if (_instanceOnce == -1) goto fast_path (0x1acf).
    // ------------------------------------------------------------
    if (_instanceOnce !== -1n) {
      // ------------------------------------------------------------
      // @0x1aaa..0x1ab9 — set up libc++ tuple<lambda&&> on the stack.
      // (ABI-level, no TS-visible effect — the proxy just needs a
      // stable void* to dispatch through; we pass a null placeholder.)
      // @0x1abc — rdi = &_instanceOnce.
      // @0x1ac3 — rdx = &__call_once_proxy<...lambda...>.
      // @0x1aca — callq std::__call_once (libc++ stub @0xacdc8).
      // ------------------------------------------------------------
      std_call_once(
        {
          get: (): bigint => _instanceOnce, // (mirrors `movq (%rax),%rax` @0x1aa1 read-side)
          set: (v: bigint): void => {
            _instanceOnce = v;
          },
        },
        null, // ABI void* — the real disasm passes &tuple; our proxy ignores it.
        __call_once_proxy_getInstance_lambda,
      );
    }
    // ------------------------------------------------------------
    // @0x1acf..0x1ad6 — rax = _instance.
    // @0x1ad9..0x1ade — epilogue + retq.
    // ------------------------------------------------------------
    return _instance;
  }
}
