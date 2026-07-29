// OZChannelGradientRGBFolder_Factory — ProChannel factory singleton that
// mints OZChannelGradientRGBFolder channel instances.
//
// This file ONLY transcribes ONE method today: the static `getInstance()`
// singleton accessor @ProChannel 0x1f72. The rest of the factory (ctor,
// dtor, create*, description, manufacturer, etc.) is NOT in this claim
// and stays undecoded until a later worker claims those symbols.
//
// Transcribed from /Applications/Final Cut Pro.app/Contents/Frameworks/
// ProChannel.framework/Versions/A/ProChannel (x86_64 slice; unadjusted
// VAs from `otool -tV`). Disassembly source:
//   raw-port/re/disasm/ProChannel.__ZN34OZChannelGradientRGBFolder_Factory11getInstanceEv.s
//
// Full 22-line disassembly of the CLAIMED method (verbatim):
//
//   __ZN34OZChannelGradientRGBFolder_Factory11getInstanceEv:
//   0x1f72  pushq   %rbp
//   0x1f73  movq    %rsp, %rbp
//   0x1f76  subq    $0x20, %rsp
//   0x1f7a  leaq    __ZN34OZChannelGradientRGBFolder_Factory13_instanceOnceE(%rip), %rax
//   0x1f81  movq    (%rax), %rax                     ; rax = _instanceOnce
//   0x1f84  cmpq    $-0x1, %rax                      ; libc++ call_once "done" sentinel
//   0x1f88  je      0x1faf                           ; if already done -> skip init
//   0x1f8a  leaq    -0x1(%rbp), %rax                 ; &(pad byte); lambda has no captures
//   0x1f8e  leaq    -0x18(%rbp), %rcx
//   0x1f92  movq    %rax, (%rcx)                     ; tuple<lambda&&>[0] = &pad
//   0x1f95  leaq    -0x10(%rbp), %rsi
//   0x1f99  movq    %rcx, (%rsi)                     ; ctx = &tuple
//   0x1f9c  leaq    __ZN34OZChannelGradientRGBFolder_Factory13_instanceOnceE(%rip), %rdi
//   0x1fa3  leaq    __ZNSt3__117__call_once_proxy...UlvE_EEEEEvPv(%rip), %rdx
//   0x1faa  callq   0xacdc8                          ; __stub std::__1::__call_once(flag,ctx,fn)
//   0x1faf  leaq    __ZN34OZChannelGradientRGBFolder_Factory9_instanceE(%rip), %rax
//   0x1fb6  movq    (%rax), %rax                     ; rax = _instance
//   0x1fb9  addq    $0x20, %rsp
//   0x1fbd  popq    %rbp
//   0x1fbe  retq
//   0x1fbf  nop
//
// SEMANTIC SUMMARY
// This is the canonical libc++ std::call_once lazy-singleton entry:
//   - `_instanceOnce` starts at 0 (BSS zero-init). libc++'s __call_once
//     marks it -1 (all-ones) after the first successful run of the
//     passed thunk. On later calls the `cmpq $-0x1` short-circuits and
//     no work is done.
//   - The thunk (`__call_once_proxy<tuple<lambda&&>>`) is the compiler-
//     synthesized adapter that invokes the getInstance()-local lambda,
//     which allocates the singleton (operator new) and constructs it,
//     then stores the pointer into `_instance`. That lambda + the
//     allocation + the C2 base ctor are ALL SEPARATE ledger units
//     (currently `todo`) — NOT part of this claim.
//   - The final two loads at @0x1faf–0x1fb6 return the (populated on
//     first-call, or NULL if init raised) singleton pointer.
//
// DEPENDENCIES (verified against depgraph — `deps` reported empty):
//   Direct in-scope callees: NONE. `getInstance` names ONE call target
//   in its disasm — the ProChannel stub @0xacdc8 for
//   `__ZNSt3__111__call_onceERVmPvPFvS2_E` (libc++ __call_once).
//   That is a TRUE out-of-scope extern (libc++ runtime template
//   instantiation), modelled as a boundary stub by policy (see
//   PORTING_SPEC.md — same treatment as HGMemory's __call_once callsite
//   and the peer OZChannelBase_Factory).
//
//   The __call_once_proxy thunk at @0x1fa3 is PASSED AS A DATA REFERENCE
//   (a function pointer) — it is not a direct callee of getInstance. It
//   is a SEPARATE ledger unit and will be claimed independently. The
//   lambda's ALLOCATION (operator new(0x88) for the factory instance)
//   and the C2 base ctor are transitive deps of the proxy, not of this
//   function.

/**
 * `std::__1::__call_once(unsigned long&, void*, void (*)(void*))` —
 * imported stub in ProChannel (`## symbol stub for __ZNSt3__111__call_onceE...`
 * @ProChannel 0xacdc8). libc++ template instantiation, TRUE out-of-scope
 * extern (libc++ runtime, not one of the five FCP frameworks).
 *
 * The libc++ semantics: atomically test-and-set the flag; the first
 * caller runs `fn(ctx)` exactly once, then transitions the flag to the
 * "done" sentinel -1. Subsequent callers (or concurrent losers of the
 * race) block until the flag is -1, then return without running `fn`.
 */
function std_call_once_stub(
  _flag: { value: number },
  _ctx: unknown,
  _fn: (ctx: unknown) => void,
): void {
  throw new Error(
    "std::__1::__call_once(unsigned long&, void*, void(*)(void*)) " +
      "__ZNSt3__111__call_onceERVmPvPFvS2_E @ProChannel imported stub 0xacdc8 " +
      "(libc++ runtime — true out-of-scope extern; not yet transcribed)",
  );
}

/**
 * `OZChannelGradientRGBFolder_Factory` — ProChannel factory singleton
 * (partial port).
 *
 * ONLY `getInstance()` is transcribed here. All other members (ctor,
 * dtor, create/createCopy/createChannel/createChannelCopy, description/
 * manufacturer/version/revision, category/icon accessors) are SEPARATE
 * ledger symbols and are the responsibility of separate claims. Do NOT
 * add un-transcribed methods to this class.
 */
export class OZChannelGradientRGBFolder_Factory {
  /**
   * `OZChannelGradientRGBFolder_Factory::_instance` — program-global
   * singleton pointer. Corresponds to the C++ static
   * `__ZN34OZChannelGradientRGBFolder_Factory9_instanceE` loaded via
   * RIP-relative at @0x1faf. Initialized to null at framework load;
   * written exactly once by the __call_once thunk (which is a SEPARATE
   * ledger claim — see file header).
   */
  private static _instance: OZChannelGradientRGBFolder_Factory | null = null;

  /**
   * `OZChannelGradientRGBFolder_Factory::_instanceOnce` — the
   * `std::once_flag` (raw `unsigned long`) that libc++ __call_once flips
   * from 0 to the "done" sentinel -1 after the singleton initializer has
   * run to completion. Corresponds to
   * `__ZN34OZChannelGradientRGBFolder_Factory13_instanceOnceE` loaded via
   * RIP-relative at @0x1f7a and @0x1f9c.
   *
   * Modelled here as a small mutable box so we can pass it by reference
   * to the (stubbed) std::__1::__call_once call, matching the C++
   * `unsigned long&` first argument. Initial value 0 (BSS zero-init);
   * after first-run the C++ writes the all-ones sentinel — we mirror
   * by using JS -1.
   */
  private static _instanceOnce: { value: number } = { value: 0 };

  /**
   * `OZChannelGradientRGBFolder_Factory::getInstance()` @ProChannel 0x1f72
   * (__ZN34OZChannelGradientRGBFolder_Factory11getInstanceEv).
   *
   * Fast-path (@0x1f7a–0x1f88): read `_instanceOnce` and short-circuit
   * to the tail load if it equals the libc++ "done" sentinel -1.
   *
   * Slow-path (@0x1f8a–0x1faa): build the libc++ __call_once trampoline
   * (a `tuple<lambda&&>` on the stack whose address is passed as `ctx`)
   * and invoke `std::__1::__call_once(_instanceOnce, ctx,
   * __call_once_proxy<...>)`. The proxy is the compiler-synthesized
   * adapter that unpacks the tuple and invokes the getInstance()-local
   * lambda, which is a SEPARATE ledger symbol responsible for allocating
   * the factory singleton (operator new(0x88)) and publishing it into
   * `_instance`. Neither the proxy nor the underlying operator new /
   * base ctor are our dependency — none is a direct callee of
   * getInstance.
   *
   * Tail (@0x1faf–0x1fbe): load `_instance` and return it.
   */
  static getInstance(): OZChannelGradientRGBFolder_Factory | null {
    // @0x1f72–0x1f76: prologue + 0x20-byte local frame (holds the 3-word
    // libc++ tuple<lambda&&> plus the empty-lambda pad-byte).

    // @0x1f7a–0x1f81: rax = _instanceOnce.
    const flag = OZChannelGradientRGBFolder_Factory._instanceOnce.value;
    // @0x1f84–0x1f88: `cmpq $-0x1, %rax ; je 0x1faf`. libc++ "done" == -1.
    if (flag !== -1) {
      // @0x1f8a–0x1f99: allocate the on-stack `tuple<lambda&&>` (ctx).
      //   In the C++, `-0x1(%rbp)` is a single pad byte that the empty
      //   capture-less lambda uses as its "reference" (the lambda has
      //   zero size so a 1-byte placeholder is stored and its address
      //   is taken). We faithfully model the shape here even though the
      //   __call_once stub below never runs its `fn`.
      const pad = { padByte: 0 }; // -0x1(%rbp)
      const tuple: { ref: unknown } = { ref: pad }; // -0x18(%rbp), tuple[0] = &pad
      const ctx: { tup: unknown } = { tup: tuple }; // -0x10(%rbp), ctx = &tuple

      // @0x1f9c–0x1fa3: %rdi = &_instanceOnce, %rdx = &__call_once_proxy.
      //   The __call_once_proxy is a SEPARATE ledger symbol and is passed
      //   here purely as a function pointer. It is not our dependency
      //   (we do not invoke it — libc++ __call_once would call it
      //   internally). We pass a placeholder that the stub will not
      //   invoke on any code path.
      const callOnceProxy = (_c: unknown): void => {
        // Body is the (yet-to-be-ported) lambda that constructs the
        // singleton and stores it into `_instance`. NOT part of this claim.
        throw new Error(
          "OZChannelGradientRGBFolder_Factory::getInstance()::lambda / " +
            "__call_once_proxy @ProChannel __ZNSt3__117__call_once_proxy" +
            "B9nqe210106INS_5tupleIJOZN34OZChannelGradientRGBFolder_Factory" +
            "11getInstanceEvEUlvE_EEEEEvPv — not yet transcribed " +
            "(separate ledger claim)",
        );
      };

      // @0x1faa: callq 0xacdc8  ; std::__1::__call_once(flag, ctx, fn).
      //   TRUE out-of-scope extern (libc++). Faithful raising stub —
      //   see std_call_once_stub above.
      std_call_once_stub(
        OZChannelGradientRGBFolder_Factory._instanceOnce,
        ctx,
        callOnceProxy,
      );
    }

    // @0x1faf–0x1fb6: load _instance.
    // @0x1fb9–0x1fbe: epilog + retq.
    return OZChannelGradientRGBFolder_Factory._instance;
  }
}
