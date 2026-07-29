// OZChannelPercent_Factory — ProChannel factory singleton (partial port).
//
// This file ONLY transcribes ONE method today: the static `getInstance()`
// singleton accessor @ProChannel 0x195a. The rest of the factory (ctor,
// dtor, create*, description, manufacturer, etc.) is NOT in this claim
// and stays undecoded until later workers claim those symbols.
//
// Transcribed from /Applications/Final Cut Pro.app/Contents/Frameworks/
// ProChannel.framework/Versions/A/ProChannel (x86_64 slice; unadjusted VAs from
// `otool -tV`). Disassembly source:
//   raw-port/re/disasm/ProChannel.__ZN24OZChannelPercent_Factory11getInstanceEv.s
//
// Full verbatim disassembly of the CLAIMED method:
//
//   __ZN24OZChannelPercent_Factory11getInstanceEv:
//   000000000000195a	pushq	%rbp
//   000000000000195b	movq	%rsp, %rbp
//   000000000000195e	subq	$0x20, %rsp
//   0000000000001962	leaq	__ZN24OZChannelPercent_Factory13_instanceOnceE(%rip), %rax ## OZChannelPercent_Factory::_instanceOnce
//   0000000000001969	movq	(%rax), %rax
//   000000000000196c	cmpq	$-0x1, %rax
//   0000000000001970	je	0x1997
//   0000000000001972	leaq	-0x1(%rbp), %rax
//   0000000000001976	leaq	-0x18(%rbp), %rcx
//   000000000000197a	movq	%rax, (%rcx)
//   000000000000197d	leaq	-0x10(%rbp), %rsi
//   0000000000001981	movq	%rcx, (%rsi)
//   0000000000001984	leaq	__ZN24OZChannelPercent_Factory13_instanceOnceE(%rip), %rdi ## OZChannelPercent_Factory::_instanceOnce
//   000000000000198b	leaq	__ZNSt3__117__call_once_proxyB9nqe210106INS_5tupleIJOZN24OZChannelPercent_Factory11getInstanceEvEUlvE_EEEEEvPv(%rip), %rdx ## void std::__1::__call_once_proxy[abi:nqe210106]<std::__1::tuple<OZChannelPercent_Factory::getInstance()::'lambda'()&&>>(void*)
//   0000000000001992	callq	0xacdc8                         ## symbol stub for: __ZNSt3__111__call_onceERVmPvPFvS2_E
//   0000000000001997	leaq	__ZN24OZChannelPercent_Factory9_instanceE(%rip), %rax ## OZChannelPercent_Factory::_instance
//   000000000000199e	movq	(%rax), %rax
//   00000000000019a1	addq	$0x20, %rsp
//   00000000000019a5	popq	%rbp
//   00000000000019a6	retq
//   00000000000019a7	nop
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
 * `OZChannelPercent_Factory` — ProChannel factory singleton (partial port).
 *
 * ONLY `getInstance()` is transcribed here. All other members are SEPARATE
 * ledger symbols and are the responsibility of separate claims. Do NOT
 * add un-transcribed methods to this class.
 */
export class OZChannelPercent_Factory {
  /**
   * `OZChannelPercent_Factory::_instance` — program-global singleton pointer.
   * Loaded via RIP-relative at @0x1997. Initialized to null at
   * framework load; written exactly once by the __call_once thunk.
   */
  private static _instance: OZChannelPercent_Factory | null = null;

  /**
   * `OZChannelPercent_Factory::_instanceOnce` — the `std::once_flag` (raw
   * `unsigned long`) that libc++ __call_once flips from 0 to the "done"
   * sentinel -1 after the singleton initializer has run to completion.
   * Loaded via RIP-relative at @0x1962.
   */
  private static _instanceOnce: { value: number } = { value: 0 };

  /**
   * `OZChannelPercent_Factory::getInstance()` @ProChannel 0x195a.
   *
   * Fast-path (@0x1962–cmpq): read `_instanceOnce` and short-
   * circuit to the tail load if it equals the libc++ "done" sentinel -1.
   *
   * Slow-path (through @0x1992): build the libc++ __call_once
   * trampoline (a `tuple<lambda&&>` on the stack whose address is passed
   * as `ctx`) and invoke `std::__1::__call_once(_instanceOnce, ctx,
   * __call_once_proxy<...>)`.
   *
   * Tail (@0x1997–0x19a6): load `_instance` and return it.
   */
  static getInstance(): OZChannelPercent_Factory | null {
    // Read _instanceOnce.
    const flag = OZChannelPercent_Factory._instanceOnce.value;
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
          "OZChannelPercent_Factory::getInstance()::lambda / __call_once_proxy " +
            "@ProChannel __ZNSt3__117__call_once_proxyB9nqe210106... — " +
            "not yet transcribed (separate ledger claim)",
        );
      };

      // @0x1992: callq 0xacdc8  ; std::__1::__call_once(flag, ctx, fn).
      //   TRUE out-of-scope extern (libc++). Faithful raising stub —
      //   see std_call_once_stub above.
      std_call_once_stub(
        OZChannelPercent_Factory._instanceOnce,
        ctx,
        callOnceProxy,
      );
    }

    // @0x1997: load _instance.
    // @0x19a6: epilog + retq.
    return OZChannelPercent_Factory._instance;
  }
}

