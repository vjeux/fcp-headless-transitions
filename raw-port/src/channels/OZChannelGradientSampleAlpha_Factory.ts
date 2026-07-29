// OZChannelGradientSampleAlpha_Factory — ProChannel factory singleton for
// OZChannelGradientSampleAlpha.
//
// Transcribed from /Applications/Final Cut Pro.app/Contents/Frameworks/
// ProChannel.framework/Versions/A/ProChannel (x86_64 slice; unadjusted
// VAs from `otool -tV`). Disassembly source:
//   raw-port/re/disasm/ProChannel.__ZN36OZChannelGradientSampleAlpha_Factory11getInstanceEv.s
//
// This unit ports ONLY the `getInstance()` static singleton accessor at
// @0x20aa. The remaining methods on this factory (C2/D1/D0/create/... etc.)
// are separate ledger entries and are OUT OF SCOPE for this file (they
// will be added to this same class file when their own ledger entries
// are claimed by future depclaim rounds — per the "one class per file"
// rule, extending this file with more methods later is the correct
// workflow, not creating a sibling).
//
// This is the same libc++ std::call_once-guarded singleton accessor
// pattern used by every OZChannel<Kind>_Factory. Peer implementations
// with the same shape:
//   raw-port/src/channels/OZChannelBase_Factory.ts  (@0x1786)
//   raw-port/src/channels/OZChanObjectRef_Factory.ts
// The three functions (getInstance, __call_once_proxy, __invoke) are
// distinct symbols each on their own ledger entry — only getInstance is
// ported here; the proxy + __invoke lambda body (which allocates a
// 0x88-byte object via operator new and calls the C2 base ctor) are
// SEPARATE ledger units and are modelled as a boundary throw at the
// libc++ call-once boundary, exactly as OZChannelBase_Factory does.
//
// -----------------------------------------------------------------------------
// PROCESS-GLOBAL STORAGE (the two symbols getInstance reads/writes)
// -----------------------------------------------------------------------------
// Two BSS globals live at fixed addresses in ProChannel, each holding one
// 8-byte word:
//
//   __ZN36OZChannelGradientSampleAlpha_Factory13_instanceOnceE
//     — the libc++ std::once_flag word (an `unsigned long` in libc++'s
//       __call_once implementation). Semantics: value 0 = "not yet
//       started", intermediate values = "another thread is currently
//       running init", value -1 = "init completed successfully"
//       (libc++ writes ~0UL on completion). The `cmpq $-1, %rax` at
//       @0x20bc is the standard libc++ fast-path check for "init done".
//
//   __ZN36OZChannelGradientSampleAlpha_Factory9_instanceE
//     — an `OZChannelGradientSampleAlpha_Factory*` (pointer to the
//       singleton instance). Written by the lambda that
//       std::__call_once invokes on first call (@ProChannel 0xbb4a);
//       read by getInstance @0x20e7.
//
// -----------------------------------------------------------------------------
// FRONTIER CALLEES (all TRUE OUT-OF-SCOPE externs or SEPARATE ledger units)
// -----------------------------------------------------------------------------
//   * __ZNSt3__111__call_onceERVmPvPFvS2_E
//       — std::__1::__call_once(flag&, void*, void(*)(void*))
//       — libc++ (libc++.dylib) — TRUE out-of-scope extern. Called
//         @0x20e2 via ProChannel stub 0xacdc8. Same policy as
//         OZChannelBase_Factory and HGMemory call_once callsites.
//
//   * __ZNSt3__117__call_once_proxyB9nqe210106<
//         tuple<OZChannelGradientSampleAlpha_Factory::getInstance()::'lambda'()&&>>(void*)
//       — libc++ template instantiation at ProChannel @0xbb17. NOT
//         called by getInstance directly — it is PASSED AS A DATA
//         REFERENCE (a function-pointer argument) to __call_once at
//         @0x20db (`leaq ...proxy(%rip), %rdx`), which then dispatches
//         through it. The proxy body @0xbb17 is a 4-instruction tuple
//         unpack + `jmp __invoke...` @0xbb22 (a separate ledger entry
//         NOT in this file's scope). That __invoke instantiation
//         (@ProChannel 0xbb27) allocates 0x88 bytes via `operator new`
//         @0xbb33 and calls
//         __ZN36OZChannelGradientSampleAlpha_FactoryC2Ev (the C2 base
//         ctor) @0xbb3e, then writes the pointer to `_instance`
//         @0xbb4a. Neither the proxy nor __invoke nor the C2 ctor is
//         ported in this file — they are transitive dependencies of
//         getInstance, but not DIRECT callees. getInstance's disasm
//         only names __call_once as a call target; every other
//         reference is a `leaq` data reference or a memory load.
//
//         Faithful modelling: getInstance's body executes std::call_once
//         and then reads `_instance`. If the initializer runs and
//         succeeds, `_instance` is the fresh pointer; if the initializer
//         raises (which it currently does, since the C2 ctor and
//         operator new are not yet ported), std::__call_once propagates
//         the throw and _instance remains untouched. Both branches are
//         faithful to the disassembly.
//
// -----------------------------------------------------------------------------
// Symbols ported here (mangled → address)
// -----------------------------------------------------------------------------
//   * __ZN36OZChannelGradientSampleAlpha_Factory11getInstanceEv
//       — OZChannelGradientSampleAlpha_Factory::getInstance() @ProChannel 0x20aa
//
// -----------------------------------------------------------------------------
// FULL DISASM
//   (raw-port/re/disasm/ProChannel.__ZN36OZChannelGradientSampleAlpha_Factory11getInstanceEv.s)
// -----------------------------------------------------------------------------
//   0x20aa  pushq  %rbp                              ; frame prologue
//   0x20ab  movq   %rsp, %rbp
//   0x20ae  subq   $0x20, %rsp                       ; 32-byte local frame
//                                                    ; (holds a 3-word libc++
//                                                    ; "tuple<lambda&&>" plus
//                                                    ; alignment padding)
//   0x20b2  leaq   _instanceOnce(%rip), %rax         ; rax = &_instanceOnce
//   0x20b9  movq   (%rax), %rax                      ; rax = _instanceOnce
//   0x20bc  cmpq   $-0x1, %rax                       ; already-init check
//                                                    ; (libc++ writes ~0UL on
//                                                    ; completion)
//   0x20c0  je     0x20e7                            ; fast path: skip call_once
//   0x20c2  leaq   -0x1(%rbp), %rax                  ; rax = &frame[-1] (a 1-byte
//                                                    ; stack slot — the lambda's
//                                                    ; empty captureless closure
//                                                    ; body; libc++'s tuple<T&&>
//                                                    ; needs a stable address).
//   0x20c6  leaq   -0x18(%rbp), %rcx                 ; rcx = &frame[-0x18]
//                                                    ; (the tuple<T&&> slot)
//   0x20ca  movq   %rax, (%rcx)                      ; tuple.head = &lambda-slot
//   0x20cd  leaq   -0x10(%rbp), %rsi                 ; rsi = &frame[-0x10]
//                                                    ; (call_once's `void* arg`)
//   0x20d1  movq   %rcx, (%rsi)                      ; *arg = &tuple
//                                                    ; (the void* passed to
//                                                    ; call_once — a pointer to
//                                                    ; the pointer to the
//                                                    ; captureless-lambda slot)
//   0x20d4  leaq   _instanceOnce(%rip), %rdi         ; rdi = &_instanceOnce
//   0x20db  leaq   __call_once_proxy<...>(%rip), %rdx ; rdx = proxy fn @0xbb17
//   0x20e2  callq  0xacdc8                           ; std::__call_once (libc++)
//   0x20e7  leaq   _instance(%rip), %rax             ; fast_path: rax = &_instance
//   0x20ee  movq   (%rax), %rax                      ; rax = _instance
//   0x20f1  addq   $0x20, %rsp                       ; epilogue
//   0x20f5  popq   %rbp
//   0x20f6  retq

// ═════════════════════════════════════════════════════════════════════════
// PROCESS-GLOBAL STATE (mirrors ProChannel BSS)
// ═════════════════════════════════════════════════════════════════════════
// In the real binary these live in Mach-O __bss (zero-initialised). In TS
// with no linker, we model them as module-scope `let`s. The initial state
// mirrors the ELF/Mach-O convention that BSS is zero-filled at load:
//   _instanceOnce = 0n  ("not yet initialised" — libc++ once_flag zero)
//   _instance     = null (nullptr — no singleton allocated yet)
// ═════════════════════════════════════════════════════════════════════════

/** @ProChannel BSS `__ZN36OZChannelGradientSampleAlpha_Factory13_instanceOnceE`.
 *  libc++ std::once_flag word. 0n = not started; 2n/3n = another thread
 *  running init; -1n (0xFFFF_FFFF_FFFF_FFFF) = completed. getInstance
 *  compares this to $-1 @0x20bc as its fast-path check. */
let _instanceOnce: bigint = 0n; // @ProChannel BSS 0x20b2 read-site

/** @ProChannel BSS `__ZN36OZChannelGradientSampleAlpha_Factory9_instanceE`.
 *  The singleton pointer. Read @0x20e7-0x20ee (the return value).
 *  Written by the __call_once_proxy lambda body (at ProChannel 0xbb4a,
 *  inside the __invoke instantiation that operator-new's and C2-ctors
 *  the singleton — a separate ledger entry not ported here). */
let _instance: OZChannelGradientSampleAlpha_Factory | null = null; // @ProChannel BSS 0x20e7

/**
 * `std::__1::__call_once(flag&, void* arg, void(*)(void*))` — libc++
 * (libc++.dylib). Called from getInstance @0x20e2 via ProChannel stub
 * 0xacdc8. TRUE out-of-scope extern (libc++ runtime). In this port there
 * is no libc++ runtime, so we model the "run the initializer exactly
 * once, atomically" contract at the JS single-threaded level: on first
 * call with a zero once_flag, we invoke the proxy(arg) and — IF it
 * completes without throwing — write $-1 into the flag; on subsequent
 * calls we no-op. If the proxy throws, the flag stays 0 (libc++'s
 * ~0UL-on-success write is skipped) and future calls will retry, exactly
 * like the real runtime. This is the minimum behaviour getInstance's
 * disasm relies on (the fast-path @0x20bc `cmp $-1` check). */
function std_call_once(
  once: { get(): bigint; set(v: bigint): void },
  arg: unknown,
  proxy: (arg: unknown) => void,
): void {
  // libc++ fast-path: already completed?
  if (once.get() === -1n) return; // (mirrors 0x20bc fast-path exit)
  // First-call slow path (single-threaded model — no atomic CAS needed
  // in JS). Run the proxy; on success mark the flag ~0.
  proxy(arg);
  once.set(-1n);
}

/**
 * `__ZNSt3__117__call_once_proxy<...>` — libc++ template instantiation
 * (ProChannel @0xbb17). Body @0xbb17-0xbb22 is:
 *   pushq %rbp; movq %rsp,%rbp
 *   movq (%rdi),%rax       ; rax = *arg  (= &lambda-slot)
 *   movq (%rax),%rdi       ; rdi = **arg (= lambda captureless slot)
 *   popq %rbp
 *   jmp __invoke<...>      ; @0xbb22 -> @0xbb27
 * The __invoke instantiation (@ProChannel 0xbb27) then:
 *   1. rax = operator new(0x88)      @ProChannel 0xbb33 (__Znwm stub 0xace4c)
 *   2. OZChannelGradientSampleAlpha_Factory::C2(rax) @ProChannel 0xbb3e
 *   3. _instance = rax               @ProChannel 0xbb4a
 * The proxy is a SEPARATE ledger entry (todo). We do not fake a
 * `new OZChannelGradientSampleAlpha_Factory()` call here — the disasm
 * shows the allocation and construction happen INSIDE the libc++
 * __call_once_proxy indirection, not in getInstance's own frame. We
 * raise with the exact @0xADDRs of the dispatching call sites — the
 * deferred work is transparently documented and will resolve once the
 * proxy/__invoke/C2 ctor units are ported. */
function __call_once_proxy_getInstance_lambda(_arg: unknown): void {
  // The proxy's target (the __invoke instantiation) body
  // @ProChannel 0xbb27..0xbb51 is:
  //   1. rax = operator new(0x88)        @ProChannel 0xbb33 (imported __Znwm 0xace4c)
  //   2. OZChannelGradientSampleAlpha_Factory::C2(rax) @ProChannel 0xbb3e
  //   3. _instance = rax                 @ProChannel 0xbb4a
  // Both operator new and the C2 ctor are separate ledger entries
  // (todo). We cite both call sites.
  throw new Error(
    "OZChannelGradientSampleAlpha_Factory::getInstance() __call_once init " +
      "lambda not yet transcribed — the proxy @ProChannel 0xbb17 tail-jumps " +
      "to __invoke @0xbb27 which allocates 0x88 bytes via operator new " +
      "@0xbb33 then invokes " +
      "__ZN36OZChannelGradientSampleAlpha_FactoryC2Ev @ProChannel 0xbb3e " +
      "(C2 base ctor, ledger status: todo) and stores the result into " +
      "_instance @0xbb4a. Neither operator new (__Znwm ProChannel stub " +
      "0xace4c) nor the C2 ctor is yet ported — the proxy, __invoke, and " +
      "C2 are each SEPARATE ledger units and will be filled in when they " +
      "are next claimed. The proxy is invoked from std::__call_once at " +
      "ProChannel 0x20e2.",
  );
}

// ═════════════════════════════════════════════════════════════════════════
// The class
// ═════════════════════════════════════════════════════════════════════════

/**
 * `OZChannelGradientSampleAlpha_Factory` — factory singleton for
 * OZChannelGradientSampleAlpha channel instances. Only its getInstance()
 * accessor is ported in this file; every other method is a separate
 * ledger entry. See file header for the storage layout (a 0x88-byte
 * object per the operator-new call in the init __invoke @0xbb33; field
 * offsets not yet decoded since only getInstance is transcribed here).
 */
export class OZChannelGradientSampleAlpha_Factory {
  /**
   * `OZChannelGradientSampleAlpha_Factory::getInstance()` — @ProChannel 0x20aa
   * (__ZN36OZChannelGradientSampleAlpha_Factory11getInstanceEv).
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
   *      unpacks the tuple and invokes __invoke, which allocates and
   *      constructs the singleton and writes it to `_instance`.
   *
   *   3. Return `_instance` (whatever the initializer wrote — or NULL if
   *      the initializer threw and never got to write).
   *
   * Note: the stack tuple + captureless-lambda dance @0x20c2..0x20d1 is
   * an ABI-level artefact of libc++'s __call_once template
   * instantiation — the caller side just does "call call_once with the
   * proxy pointer" and doesn't observe the intermediate slots. In this
   * port we don't need to model the two stack slots because
   * std_call_once (above) invokes the proxy directly (single-threaded,
   * no ABI marshaling needed). The disasm's stack setup is documented
   * here for provenance but does not affect observable behaviour.
   */
  static getInstance(): OZChannelGradientSampleAlpha_Factory | null {
    // ------------------------------------------------------------
    // @0x20aa..0x20ae — prologue + 0x20-byte local frame.
    // (No TS-visible effect.)
    // @0x20b2..0x20b9 — rax = _instanceOnce.
    // @0x20bc..0x20c0 — if (_instanceOnce == -1) goto fast_path (0x20e7).
    // ------------------------------------------------------------
    if (_instanceOnce !== -1n) {
      // ------------------------------------------------------------
      // @0x20c2..0x20d1 — set up libc++ tuple<lambda&&> on the stack.
      // (ABI-level, no TS-visible effect — the proxy just needs a
      // stable void* to dispatch through; we pass a null placeholder.)
      // @0x20d4 — rdi = &_instanceOnce.
      // @0x20db — rdx = &__call_once_proxy<...lambda...> @ProChannel 0xbb17.
      // @0x20e2 — callq std::__call_once (libc++ stub @0xacdc8).
      // ------------------------------------------------------------
      std_call_once(
        {
          get: (): bigint => _instanceOnce, // (mirrors `movq (%rax),%rax` @0x20b9 read-side)
          set: (v: bigint): void => {
            _instanceOnce = v;
          },
        },
        null, // ABI void* — the real disasm passes &tuple; our proxy ignores it.
        __call_once_proxy_getInstance_lambda,
      );
    }
    // ------------------------------------------------------------
    // @0x20e7..0x20ee — rax = _instance.
    // @0x20f1..0x20f6 — epilogue + retq.
    // ------------------------------------------------------------
    return _instance;
  }
}
