// OZChannelProgress_Factory — ProChannel factory singleton (partial port).
//
// This file ONLY transcribes ONE method today: the static `getInstance()`
// singleton accessor @ProChannel 0x2848. The rest of the factory (ctor,
// dtor, create*, description, manufacturer, etc.) is NOT in this claim
// and stays undecoded until later workers claim those symbols.
//
// Transcribed from /Applications/Final Cut Pro.app/Contents/Frameworks/
// ProChannel.framework/Versions/A/ProChannel (x86_64 slice; unadjusted VAs from
// `otool -tV`). Disassembly source:
//   raw-port/re/disasm/ProChannel.__ZN25OZChannelProgress_Factory11getInstanceEv.s
//
// Full verbatim disassembly of the CLAIMED method:
//
//   __ZN25OZChannelProgress_Factory11getInstanceEv:
//   0000000000002848	pushq	%rbp
//   0000000000002849	movq	%rsp, %rbp
//   000000000000284c	subq	$0x20, %rsp
//   0000000000002850	leaq	__ZN25OZChannelProgress_Factory13_instanceOnceE(%rip), %rax ## OZChannelProgress_Factory::_instanceOnce
//   0000000000002857	movq	(%rax), %rax
//   000000000000285a	cmpq	$-0x1, %rax
//   000000000000285e	je	0x2885
//   0000000000002860	leaq	-0x1(%rbp), %rax
//   0000000000002864	leaq	-0x18(%rbp), %rcx
//   0000000000002868	movq	%rax, (%rcx)
//   000000000000286b	leaq	-0x10(%rbp), %rsi
//   000000000000286f	movq	%rcx, (%rsi)
//   0000000000002872	leaq	__ZN25OZChannelProgress_Factory13_instanceOnceE(%rip), %rdi ## OZChannelProgress_Factory::_instanceOnce
//   0000000000002879	leaq	__ZNSt3__117__call_once_proxyB9nqe210106INS_5tupleIJOZN25OZChannelProgress_Factory11getInstanceEvEUlvE_EEEEEvPv(%rip), %rdx ## void std::__1::__call_once_proxy[abi:nqe210106]<std::__1::tuple<OZChannelProgress_Factory::getInstance()::'lambda'()&&>>(void*)
//   0000000000002880	callq	0xacdc8                         ## symbol stub for: __ZNSt3__111__call_onceERVmPvPFvS2_E
//   0000000000002885	leaq	__ZN25OZChannelProgress_Factory9_instanceE(%rip), %rax ## OZChannelProgress_Factory::_instance
//   000000000000288c	movq	(%rax), %rax
//   000000000000288f	addq	$0x20, %rsp
//   0000000000002893	popq	%rbp
//   0000000000002894	retq
//   0000000000002895	nop
//
// SEMANTIC SUMMARY
// This is the canonical libc++ std::call_once lazy-singleton entry:
//   - `_instanceOnce` starts at 0. libc++'s __call_once marks it -1
//     (all-ones) after the first successful run of the passed thunk.
//     On later calls, the `cmpq $-0x1` short-circuits and no work runs.
//   - The thunk (`__call_once_proxy<tuple<lambda&&>>`) is the compiler-
//     synthesized adapter that invokes the getInstance()-local lambda,
//     which allocates the singleton and stores it into `_instance`.
//   - The final two loads return the (now-guaranteed-populated) singleton.
//
// DEPENDENCIES (verified against depgraph):
//   Direct in-scope callees: NONE (deps=[] in raw-port/army/depgraph/graph.json).
//   Externs: 1 out-of-scope — __stub for
//     `__ZNSt3__111__call_onceERVmPvPFvS2_E` (libc++ __call_once),
//     modelled as a raising boundary stub by policy.
//   The __call_once_proxy thunk is a SEPARATE ledger symbol; its
//   address is only PASSED as data here, not called.

/**
 * `std::__1::__call_once(unsigned long&, void*, void (*)(void*))` —
 * imported stub in ProChannel @0xacdc8. libc++ template instantiation,
 * TRUE out-of-scope extern (libc++ runtime, not one of the five FCP
 * frameworks we port).
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
 * `OZChannelProgress_Factory` — ProChannel factory singleton (partial port).
 *
 * ONLY `getInstance()` is transcribed here. All other members are SEPARATE
 * ledger symbols and are the responsibility of separate claims. Do NOT
 * add un-transcribed methods to this class.
 */
export class OZChannelProgress_Factory {
  /**
   * `OZChannelProgress_Factory::_instance` — program-global singleton pointer.
   * Loaded via RIP-relative at @0x2885. Initialized to null at
   * framework load; written exactly once by the __call_once thunk.
   */
  private static _instance: OZChannelProgress_Factory | null = null;

  /**
   * `OZChannelProgress_Factory::_instanceOnce` — the `std::once_flag` (raw
   * `unsigned long`) that libc++ __call_once flips from 0 to the "done"
   * sentinel -1 after the singleton initializer has run to completion.
   * Loaded via RIP-relative at @0x2850.
   */
  private static _instanceOnce: { value: number } = { value: 0 };

  /**
   * `OZChannelProgress_Factory::getInstance()` @ProChannel 0x2848.
   *
   * Fast-path (@0x2850–cmpq): read `_instanceOnce` and short-
   * circuit to the tail load if it equals the libc++ "done" sentinel -1.
   *
   * Slow-path (through @0x2880): build the libc++ __call_once
   * trampoline (a `tuple<lambda&&>` on the stack whose address is passed
   * as `ctx`) and invoke `std::__1::__call_once(_instanceOnce, ctx,
   * __call_once_proxy<...>)`.
   *
   * Tail (@0x2885–0x2894): load `_instance` and return it.
   */
  static getInstance(): OZChannelProgress_Factory | null {
    // Read _instanceOnce.
    const flag = OZChannelProgress_Factory._instanceOnce.value;
    // cmpq $-0x1, %rax ; je tail. libc++ "done" == -1.
    if (flag !== -1) {
      // Slow-path — allocate on-stack `tuple<lambda&&>` (ctx). The
      // capture-less lambda uses a 1-byte pad (`-0x1(%rbp)`) as its
      // "reference"; we faithfully model the shape.
      const pad = { padByte: 0 };                    // -0x1(%rbp)
      const tuple: { ref: unknown } = { ref: pad };    // -0x18(%rbp)
      const ctx: { tup: unknown } = { tup: tuple };    // -0x10(%rbp)

      // __call_once_proxy address is loaded but NOT called by us.
      const callOnceProxy = (_c: unknown): void => {
        throw new Error(
          "OZChannelProgress_Factory::getInstance()::lambda / __call_once_proxy " +
            "@ProChannel __ZNSt3__117__call_once_proxyB9nqe210106... — " +
            "not yet transcribed (separate ledger claim)",
        );
      };

      // @0x2880: callq 0xacdc8  ; std::__1::__call_once(flag, ctx, fn).
      //   TRUE out-of-scope extern (libc++). Faithful raising stub —
      //   see std_call_once_stub above.
      std_call_once_stub(
        OZChannelProgress_Factory._instanceOnce,
        ctx,
        callOnceProxy,
      );
    }

    // @0x2885: load _instance.
    // @0x2894: epilog + retq.
    return OZChannelProgress_Factory._instance;
  }
}

