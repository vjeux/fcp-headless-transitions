// OZChannelGradient_Factory — ProChannel factory singleton (partial port).
//
// This file ONLY transcribes ONE method today: the static `getInstance()`
// singleton accessor @ProChannel 0x6850c. The rest of the factory (ctor,
// dtor, create*, description, manufacturer, etc.) is NOT in this claim
// and stays undecoded until later workers claim those symbols.
//
// This variant is compiled slightly differently from the other
// OZChannel*_Factory::getInstance() siblings — the fast-path load and
// short-circuit test are hoisted ABOVE the frame prolog (no pushq/movq/
// subq if the flag is already the done-sentinel), and the tail is a
// direct `movq (rip),%rax` instead of a `leaq (rip),%rax ; movq (%rax),%rax`
// pair. Semantics are identical.
//
// Transcribed from /Applications/Final Cut Pro.app/Contents/Frameworks/
// ProChannel.framework/Versions/A/ProChannel (x86_64 slice; unadjusted VAs from
// `otool -tV`). Disassembly source:
//   raw-port/re/disasm/ProChannel.__ZN25OZChannelGradient_Factory11getInstanceEv.s
//
// Full verbatim disassembly of the CLAIMED method:
//
//   __ZN25OZChannelGradient_Factory11getInstanceEv:
//   000000000006850c	movq	__ZN25OZChannelGradient_Factory13_instanceOnceE(%rip), %rax ## OZChannelGradient_Factory::_instanceOnce
//   0000000000068513	cmpq	$-0x1, %rax
//   0000000000068517	je	0x6854b
//   0000000000068519	pushq	%rbp
//   000000000006851a	movq	%rsp, %rbp
//   000000000006851d	subq	$0x20, %rsp
//   0000000000068521	leaq	-0x1(%rbp), %rax
//   0000000000068525	leaq	-0x18(%rbp), %rcx
//   0000000000068529	movq	%rax, (%rcx)
//   000000000006852c	leaq	-0x10(%rbp), %rsi
//   0000000000068530	movq	%rcx, (%rsi)
//   0000000000068533	leaq	__ZN25OZChannelGradient_Factory13_instanceOnceE(%rip), %rdi ## OZChannelGradient_Factory::_instanceOnce
//   000000000006853a	leaq	__ZNSt3__117__call_once_proxyB9nqe210106INS_5tupleIJOZN25OZChannelGradient_Factory11getInstanceEvEUlvE_EEEEEvPv(%rip), %rdx ## __call_once_proxy adapter
//   0000000000068541	callq	0xacdc8                         ## symbol stub for: __ZNSt3__111__call_onceERVmPvPFvS2_E
//   0000000000068546	addq	$0x20, %rsp
//   000000000006854a	popq	%rbp
//   000000000006854b	movq	__ZN25OZChannelGradient_Factory9_instanceE(%rip), %rax ## OZChannelGradient_Factory::_instance
//   0000000000068552	retq
//   0000000000068553	nop
//
// SEMANTIC SUMMARY
// Canonical libc++ std::call_once lazy-singleton entry, with the
// fast-path short-circuit hoisted above the prolog:
//   - `_instanceOnce` starts at 0. libc++'s __call_once marks it -1
//     after the first successful run of the thunk. On later calls the
//     cmpq $-0x1 short-circuits directly to the tail load — no frame set up.
//   - Slow-path (first call): set up frame, build the on-stack
//     `tuple<lambda&&>` context, then callq __call_once.
//   - Tail: single-instruction load of `_instance` (compiler folded the
//     leaq+movq pair into a direct rip-relative movq).
//
// DEPENDENCIES (verified against depgraph):
//   Direct in-scope callees: NONE.
//   Externs: 1 out-of-scope — __stub for
//     `__ZNSt3__111__call_onceERVmPvPFvS2_E` (libc++ __call_once),
//     modelled as a raising boundary stub by policy.
//   __call_once_proxy is a SEPARATE ledger symbol; its address is only
//   PASSED as data here, not called.

/**
 * `std::__1::__call_once(unsigned long&, void*, void (*)(void*))` —
 * imported stub in ProChannel @0xacdc8. libc++ template instantiation,
 * TRUE out-of-scope extern.
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
 * `OZChannelGradient_Factory` — ProChannel factory singleton (partial port).
 *
 * ONLY `getInstance()` is transcribed here. All other members are SEPARATE
 * ledger symbols.
 */
export class OZChannelGradient_Factory {
  /**
   * `OZChannelGradient_Factory::_instance` — program-global singleton pointer.
   * Loaded via RIP-relative movq at @0x6854b. Initialized to null at
   * framework load; written exactly once by the __call_once thunk.
   */
  private static _instance: OZChannelGradient_Factory | null = null;

  /**
   * `OZChannelGradient_Factory::_instanceOnce` — the `std::once_flag` (raw
   * `unsigned long`) that libc++ __call_once flips from 0 to the "done"
   * sentinel -1 after the singleton initializer has run to completion.
   * Loaded via RIP-relative at @0x6850c and @0x68533.
   */
  private static _instanceOnce: { value: number } = { value: 0 };

  /**
   * `OZChannelGradient_Factory::getInstance()` @ProChannel 0x6850c.
   *
   * Fast-path (@0x6850c–0x68517): read `_instanceOnce` and short-
   * circuit to the tail load if it equals the libc++ "done" sentinel -1.
   * (Note: no frame prolog on the fast path — the compiler hoisted the
   * check above pushq.)
   *
   * Slow-path (@0x68519–0x68541): set up frame, build the libc++
   * __call_once trampoline (a `tuple<lambda&&>` on the stack whose
   * address is passed as `ctx`), and invoke `std::__1::__call_once`.
   *
   * Tail (@0x6854b–0x68552): single-instruction movq of `_instance`
   * and retq.
   */
  static getInstance(): OZChannelGradient_Factory | null {
    // @0x6850c–@0x68513: movq _instanceOnce, %rax ; cmpq $-0x1, %rax.
    const flag = OZChannelGradient_Factory._instanceOnce.value;
    // @0x68517: je tail. libc++ "done" == -1.
    if (flag !== -1) {
      // Slow-path — frame prolog then on-stack tuple<lambda&&> (ctx).
      const pad = { padByte: 0 };                    // -0x1(%rbp)
      const tuple: { ref: unknown } = { ref: pad };    // -0x18(%rbp)
      const ctx: { tup: unknown } = { tup: tuple };    // -0x10(%rbp)

      // __call_once_proxy address is loaded but NOT called by us.
      const callOnceProxy = (_c: unknown): void => {
        throw new Error(
          "OZChannelGradient_Factory::getInstance()::lambda / __call_once_proxy " +
            "@ProChannel __ZNSt3__117__call_once_proxyB9nqe210106... — " +
            "not yet transcribed (separate ledger claim)",
        );
      };

      // @0x68541: callq 0xacdc8 ; std::__1::__call_once(flag, ctx, fn).
      std_call_once_stub(
        OZChannelGradient_Factory._instanceOnce,
        ctx,
        callOnceProxy,
      );
    }

    // @0x6854b: movq _instance, %rax.
    // @0x68552: retq.
    return OZChannelGradient_Factory._instance;
  }
}
