// OZChannelLevels_Factory — ProChannel factory singleton for OZChannelLevels.
//
// Transcribed from /Applications/Final Cut Pro.app/Contents/Frameworks/
// ProChannel.framework/Versions/A/ProChannel (x86_64 slice; unadjusted
// VAs from `otool -tV`). Disassembly source:
//   raw-port/re/disasm/ProChannel.__ZN23OZChannelLevels_Factory11getInstanceEv.s
//
// This file ports TWO methods, one ledger unit each: the `getInstance()`
// static singleton accessor @0x2230 and `getIconIDInternal()` @0xce94
// (added later, ADD-ONLY, with its own disassembly below). The remaining methods on this factory (C2/D1/D0/
// create/... etc.) are separate ledger entries and are OUT OF SCOPE for
// this file (they will be added to this same class file when their own
// ledger entries are claimed by future depclaim rounds — per the "one
// class per file" rule, extending this file with more methods later is
// the correct workflow, not creating a sibling).
//
// -----------------------------------------------------------------------------
// PROCESS-GLOBAL STORAGE (the two symbols getInstance reads/writes)
// -----------------------------------------------------------------------------
// Two BSS globals live at fixed addresses in ProChannel, each holding one
// 8-byte word:
//
//   __ZN23OZChannelLevels_Factory13_instanceOnceE
//     — the libc++ std::once_flag word (an `unsigned long` in libc++'s
//       __call_once implementation). Semantics: value 0 = "not yet
//       started", intermediate values = "another thread is currently
//       running init", value -1 = "init completed successfully"
//       (libc++ writes ~0UL on completion). The `cmpq $-1, %rax` at
//       @0x2242 is the standard libc++ fast-path check for "init done".
//
//   __ZN23OZChannelLevels_Factory9_instanceE
//     — a `OZChannelLevels_Factory*` (pointer to the singleton instance).
//       Written by the lambda that std::__call_once invokes on first
//       call; read by getInstance @0x226d.
//
// -----------------------------------------------------------------------------
// FRONTIER CALLEES (all TRUE OUT-OF-SCOPE externs or SEPARATE ledger units)
// -----------------------------------------------------------------------------
//   * __ZNSt3__111__call_onceERVmPvPFvS2_E
//       — std::__1::__call_once(flag&, void*, void(*)(void*))
//       — libc++ (libc++.dylib) — TRUE out-of-scope extern. Called
//         @0x2268 via ProChannel stub 0xacdc8. Same policy as
//         OZChannelBase_Factory (see raw-port/src/channels/OZChannelBase_Factory.ts).
//
//   * __ZNSt3__117__call_once_proxyB9nqe210106<
//         tuple<OZChannelLevels_Factory::getInstance()::'lambda'()&&>>(void*)
//       — libc++ template instantiation that unpacks the tuple and
//         invokes the lambda. NOT called by getInstance directly — it is
//         PASSED AS A DATA REFERENCE (a function-pointer argument) to
//         __call_once, which then dispatches through it. The proxy body
//         is `jmp __ZNSt3__18__invoke...<...>` at ProChannel @0xa82c4
//         (a separate ledger entry NOT in this file's scope). That
//         __invoke instantiation @0xa82d4 calls __ZN23OZChannelLevels_FactoryC2Ev
//         (the C2 base ctor) via operator new(0x88) @0xa82e0, whose
//         ledger status is currently `todo`. It is a TRANSITIVE dependency
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
//   * __ZN23OZChannelLevels_Factory11getInstanceEv
//       — OZChannelLevels_Factory::getInstance() @ProChannel 0x2230
//
// -----------------------------------------------------------------------------
// FULL DISASM (raw-port/re/disasm/ProChannel.__ZN23OZChannelLevels_Factory11getInstanceEv.s)
// -----------------------------------------------------------------------------
//   0x2230  pushq  %rbp                              ; frame prologue
//   +1     movq   %rsp, %rbp
//   0x2234  subq   $0x20, %rsp                       ; 32-byte local frame
//                                                    ; (holds a 3-word libc++
//                                                    ; "tuple<lambda&&>" plus
//                                                    ; alignment padding)
//   0x2238  leaq   _instanceOnce(%rip), %rax         ; rax = &_instanceOnce
//   0x223f  movq   (%rax), %rax                      ; rax = _instanceOnce
//   0x2242  cmpq   $-0x1, %rax                       ; already-init check
//                                                    ; (libc++ writes ~0UL
//                                                    ; on completion)
//   0x2246  je     0x226d                            ; fast path: skip call_once
//   0x2248  leaq   -0x1(%rbp), %rax                  ; rax = &frame[-1] (a 1-byte
//                                                    ; stack slot — the lambda's
//                                                    ; empty captureless closure
//                                                    ; body; libc++'s tuple<T&&>
//                                                    ; needs a stable address).
//   0x224c  leaq   -0x18(%rbp), %rcx                 ; rcx = &frame[-0x18]
//                                                    ; (the tuple<T&&> slot)
//   0x2250  movq   %rax, (%rcx)                      ; tuple.head = &lambda-slot
//   0x2253  leaq   -0x10(%rbp), %rsi                 ; rsi = &frame[-0x10]
//                                                    ; (call_once's `void* arg`)
//   0x2257  movq   %rcx, (%rsi)                      ; *arg = &tuple
//                                                    ; (the void* passed to
//                                                    ; __call_once_proxy)
//   0x225a  leaq   _instanceOnce(%rip), %rdi         ; rdi = &_instanceOnce
//   0x2261  leaq   __call_once_proxy<...>(%rip), %rdx; rdx = &proxy_func
//                                                    ; (function pointer)
//   0x2268  callq  std::__call_once                   ; libc++ stub @0xacdc8
//                                                    ; signature:
//                                                    ; (once_flag& = %rdi,
//                                                    ;  void* arg   = %rsi,
//                                                    ;  void(*)(void*) = %rdx)
//   0x226d  leaq   _instance(%rip), %rax             ; rax = &_instance
//   0x2274  movq   (%rax), %rax                      ; rax = _instance
//                                                    ; (the return value: the
//                                                    ; singleton pointer, or
//                                                    ; NULL if init raised)
//   0x2277  addq   $0x20, %rsp                       ; frame epilogue
//   0x227b  popq   %rbp
//   0x227c  retq

// ═════════════════════════════════════════════════════════════════════════
// Process-global BSS slots — one 8-byte word each, sitting at fixed
// linker-assigned addresses in ProChannel's __common/__bss. Since TS has
// no linker, we model them as module-scope `let`s. The initial state
// mirrors the ELF/Mach-O convention that BSS is zero-filled at load:
//   _instanceOnce = 0n  ("not yet initialised" — libc++ once_flag zero)
//   _instance     = null (nullptr — no singleton allocated yet)
// ═════════════════════════════════════════════════════════════════════════

/** @ProChannel BSS `__ZN23OZChannelLevels_Factory13_instanceOnceE`.
 *  libc++ std::once_flag word. 0n = not started; 2n/3n = another thread
 *  running init; -1n (0xFFFF_FFFF_FFFF_FFFF) = completed. getInstance
 *  compares this to $-1 @0x2242 as its fast-path check. */
let _instanceOnce: bigint = 0n; // @ProChannel BSS 0x2230 read-site

/** @ProChannel BSS `__ZN23OZChannelLevels_Factory9_instanceE`.
 *  The singleton pointer. Read @0x226d-0x2274 (the return value).
 *  Written by the __call_once_proxy lambda (a separate function at
 *  ProChannel @0xa82c4/@0xa82d4). */
let _instance: OZChannelLevels_Factory | null = null; // @ProChannel BSS 0x226d

/**
 * `std::__1::__call_once(flag&, void* arg, void(*)(void*))` — libc++
 * (libc++.dylib). Called from getInstance @0x2268 via ProChannel stub
 * 0xacdc8. TRUE out-of-scope extern (libc++ runtime). In this port there
 * is no libc++ runtime, so we model the "run the initializer exactly
 * once, atomically" contract at the JS single-threaded level: on first
 * call with a zero once_flag, we invoke the proxy(arg) and — IF it
 * completes without throwing — write $-1 into the flag; on subsequent
 * calls we no-op. If the proxy throws, the flag stays 0 (libc++'s
 * ~0UL-on-success write is skipped) and future calls will retry, exactly
 * like the real runtime. This is the minimum behaviour getInstance's
 * disasm relies on (the fast-path @0x2242 `cmp $-1` check). */
function std_call_once(
  once: { get(): bigint; set(v: bigint): void },
  arg: unknown,
  proxy: (arg: unknown) => void,
): void {
  // libc++ fast-path: already completed?
  if (once.get() === -1n) return; // (mirrors 0x2242 fast-path exit)
  // First-call slow path (single-threaded model — no atomic CAS needed
  // in JS). Run the proxy; on success mark the flag ~0.
  proxy(arg);
  once.set(-1n);
}

/**
 * `__ZNSt3__117__call_once_proxy<...>` — libc++ template instantiation
 * (ProChannel @0xa82c4). Body is `jmp __invoke<...>` @0xa82d4, which
 * allocates a fresh OZChannelLevels_Factory (size 0x88) via `operator new` @0xa82e0
 * and invokes `OZChannelLevels_Factory::OZChannelLevels_Factory()` (the C2 base ctor, __ZN23OZChannelLevels_FactoryC2Ev, currently
 * ledger status = `todo`) @0xa82eb; on success it stores the pointer into
 * `_instance` @0xa82f0. Since neither the C2 ctor nor operator
 * new are ported yet, the proxy stub raises with the exact @0xADDRs of
 * the dispatching call sites — the deferred work is transparently
 * documented and will resolve once the ctor is ported. */
function __call_once_proxy_getInstance_lambda(_arg: unknown): void {
  // The lambda's body @ProChannel 0xa82d4..0xa82f0 is:
  //   1. rax = operator new(0x88)       @ProChannel 0xa82e0 (imported __Znwm stub 0xace4c)
  //   2. OZChannelLevels_Factory::C2(rax)  @ProChannel 0xa82eb
  //   3. _instance = rax                 @ProChannel 0xa82f0
  // C2 is a separate ledger entry (todo). We cite both call sites.
  throw new Error(
    "OZChannelLevels_Factory::getInstance() __call_once init lambda not yet " +
      "transcribed — the lambda body @ProChannel 0xa82d4 allocates 0x88 bytes " +
      "via operator new @0xa82e0 then invokes " +
      "__ZN23OZChannelLevels_FactoryC2Ev @ProChannel 0xa82eb (C2 base ctor, " +
      "ledger status: todo) and stores the result into _instance @0xa82f0. " +
      "Neither operator new (__Znwm ProChannel stub 0xace4c) nor the C2 ctor " +
      "is yet ported — this lambda function is a SEPARATE ledger unit and " +
      "will be filled in when it is next claimed. The proxy is invoked from " +
      "std::__call_once at ProChannel 0x2268.",
  );
}

// ═════════════════════════════════════════════════════════════════════════
// The class
// ═════════════════════════════════════════════════════════════════════════

/**
 * `OZChannelLevels_Factory` — factory singleton for OZChannelLevels
 * channel instances. Only its getInstance() accessor is ported in this
 * file; every other method is a separate ledger entry. See file header
 * for the storage layout (a 0x88-byte object per the operator-new call
 * in the init lambda; field offsets not yet decoded since only
 * getInstance is transcribed here).
 */
/**
 * The "no icon ID" sentinel the factory reports — the int32 -1 written by
 * `movl $0xffffffff,%eax` @ProChannel 0xce98.
 */
export const OZCHANNEL_FACTORY_ICON_ID_NONE = -1 as const;

export class OZChannelLevels_Factory {
  /**
   * `OZChannelLevels_Factory::getInstance()` — @ProChannel 0x2230
   * (__ZN23OZChannelLevels_Factory11getInstanceEv).
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
   * Note: the stack tuple + captureless-lambda dance @0x2248..@0x2257 is
   * an ABI-level artefact of libc++'s __call_once template
   * instantiation — the caller side just does "call call_once with the
   * proxy pointer" and doesn't observe the intermediate slots. In this
   * port we don't need to model the two stack slots because
   * std_call_once (below) invokes the proxy directly (single-threaded,
   * no ABI marshaling needed). The disasm's stack setup is documented
   * here for provenance but does not affect observable behaviour.
   */
  static getInstance(): OZChannelLevels_Factory | null {
    // ------------------------------------------------------------
    // @0x2230..@0x2234 — prologue + 0x20-byte local frame.
    // (No TS-visible effect.)
    // @0x2238..@0x223f — rax = _instanceOnce.
    // @0x2242..@0x2246 — if (_instanceOnce == -1) goto fast_path (0x226d).
    // ------------------------------------------------------------
    if (_instanceOnce !== -1n) {
      // ------------------------------------------------------------
      // @0x2248..@0x2257 — set up libc++ tuple<lambda&&> on the stack.
      // (ABI-level, no TS-visible effect — the proxy just needs a
      // stable void* to dispatch through; we pass a null placeholder.)
      // @0x225a — rdi = &_instanceOnce.
      // @0x2261 — rdx = &__call_once_proxy<...lambda...>.
      // @0x2268 — callq std::__call_once (libc++ stub @0xacdc8).
      // ------------------------------------------------------------
      std_call_once(
        {
          get: (): bigint => _instanceOnce, // (mirrors `movq (%rax),%rax` @0x223f read-side)
          set: (v: bigint): void => {
            _instanceOnce = v;
          },
        },
        null, // ABI void* — the real disasm passes &tuple; our proxy ignores it.
        __call_once_proxy_getInstance_lambda,
      );
    }
    // ------------------------------------------------------------
    // @0x226d..@0x2274 — rax = _instance.
    // @0x2277..@0x227c — epilogue + retq.
    // ------------------------------------------------------------
    return _instance;
  }

  /**
   * `OZChannelLevels_Factory::getIconIDInternal()` — @ProChannel 0xce94
   * (__ZN23OZChannelLevels_Factory17getIconIDInternalEv).
   *
   * Full transcription — every instruction, in order:
   *
   *   0xce94  pushq %rbp             ; frame setup (no TS counterpart)
   *   0xce95  movq  %rsp,%rbp        ; frame setup (no TS counterpart)
   *   0xce98  movl  $0xffffffff,%eax ; %eax = -1 (int32)
   *   0xce9d  popq  %rbp             ; frame teardown (no TS counterpart)
   *   0xce9e  retq                   ; returns the int in %eax
   *   0xce9f  nop                    ; alignment padding, not executed
   *
   * One instruction with value semantics. `this` (%rdi) is never
   * dereferenced, nothing is called and nothing is allocated: no in-scope
   * callee, no extern, no allocation, no indirect or virtual dispatch
   * (`depgraph.py deps` lists nothing).
   *
   * WHY -1 IS THE IMPLEMENTATION, NOT A GAP. `getIconIDInternal()` sits at
   * slot +0x98 of the factory vtable, which the abstract base leaves as
   * `__cxa_pure_virtual` (see the vtable table in the landed
   * raw-port/src/nodes/OZSceneNodeFactory.ts), so every concrete factory has
   * to supply a body, and the shipped bodies answer both ways: of Ozone's 125
   * concrete overrides 94 return -1 while the rest return real icon IDs —
   * OZSceneNode_Factory / OZTransformNode_Factory / OZElement_Factory return
   * 0x12, OZRotoshape_Factory 0xe, OZAudioTrackBase_Factory 0x3, with 0xa and
   * 0x11 also appearing. In ProChannel the sibling channel factories agree
   * with this one: OZChannel_Factory, OZChannel2D_Factory, OZChannel3D_Factory
   * and OZChannelBase_Factory all emit the identical `movl $0xffffffff,%eax`.
   * So -1 is the "this factory contributes no icon ID" sentinel and a channel
   * factory deliberately has none.
   *
   * SIGNEDNESS: the immediate is written into the 32-bit %eax, so the value is
   * the int32 -1 rather than the unsigned 4294967295 a 64-bit read would give;
   * the non-sentinel IDs above are small positive ints, so callers compare
   * against -1.
   *
   * @returns %eax — always -1 (@0xce98).
   */
  getIconIDInternal(): number {
    // @0xce98  movl $0xffffffff,%eax ; @0xce9e retq
    return OZCHANNEL_FACTORY_ICON_ID_NONE;
  }
}
