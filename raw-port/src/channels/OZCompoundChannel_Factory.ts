// OZCompoundChannel_Factory — ProChannel factory singleton (partial port).
//
// This file ONLY transcribes ONE method today: the static `getInstance()`
// singleton accessor @ProChannel 0x1b2e. The rest of the factory (ctor,
// dtor, create*, description, manufacturer, etc.) is NOT in this claim
// and stays undecoded until later workers claim those symbols.
//
// Transcribed from /Applications/Final Cut Pro.app/Contents/Frameworks/
// ProChannel.framework/Versions/A/ProChannel (x86_64 slice; unadjusted VAs from
// `otool -tV`). Disassembly source:
//   raw-port/re/disasm/ProChannel.__ZN25OZCompoundChannel_Factory11getInstanceEv.s
//
// Full verbatim disassembly of the CLAIMED method:
//
//   __ZN25OZCompoundChannel_Factory11getInstanceEv:
//   0000000000001b2e	pushq	%rbp
//   0000000000001b2f	movq	%rsp, %rbp
//   0000000000001b32	subq	$0x20, %rsp
//   0000000000001b36	leaq	__ZN25OZCompoundChannel_Factory13_instanceOnceE(%rip), %rax ## OZCompoundChannel_Factory::_instanceOnce
//   0000000000001b3d	movq	(%rax), %rax
//   0000000000001b40	cmpq	$-0x1, %rax
//   0000000000001b44	je	0x1b6b
//   0000000000001b46	leaq	-0x1(%rbp), %rax
//   0000000000001b4a	leaq	-0x18(%rbp), %rcx
//   0000000000001b4e	movq	%rax, (%rcx)
//   0000000000001b51	leaq	-0x10(%rbp), %rsi
//   0000000000001b55	movq	%rcx, (%rsi)
//   0000000000001b58	leaq	__ZN25OZCompoundChannel_Factory13_instanceOnceE(%rip), %rdi ## OZCompoundChannel_Factory::_instanceOnce
//   0000000000001b5f	leaq	__ZNSt3__117__call_once_proxyB9nqe210106INS_5tupleIJOZN25OZCompoundChannel_Factory11getInstanceEvEUlvE_EEEEEvPv(%rip), %rdx ## void std::__1::__call_once_proxy[abi:nqe210106]<std::__1::tuple<OZCompoundChannel_Factory::getInstance()::'lambda'()&&>>(void*)
//   0000000000001b66	callq	0xacdc8                         ## symbol stub for: __ZNSt3__111__call_onceERVmPvPFvS2_E
//   0000000000001b6b	leaq	__ZN25OZCompoundChannel_Factory9_instanceE(%rip), %rax ## OZCompoundChannel_Factory::_instance
//   0000000000001b72	movq	(%rax), %rax
//   0000000000001b75	addq	$0x20, %rsp
//   0000000000001b79	popq	%rbp
//   0000000000001b7a	retq
//   0000000000001b7b	nop
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
 * `OZCompoundChannel_Factory` — ProChannel factory singleton (partial port).
 *
 * ONLY `getInstance()` is transcribed here. All other members are SEPARATE
 * ledger symbols and are the responsibility of separate claims. Do NOT
 * add un-transcribed methods to this class.
 */
export class OZCompoundChannel_Factory {
  /**
   * `OZCompoundChannel_Factory::_instance` — program-global singleton pointer.
   * Loaded via RIP-relative at @0x1b6b. Initialized to null at
   * framework load; written exactly once by the __call_once thunk.
   */
  private static _instance: OZCompoundChannel_Factory | null = null;

  /**
   * `OZCompoundChannel_Factory::_instanceOnce` — the `std::once_flag` (raw
   * `unsigned long`) that libc++ __call_once flips from 0 to the "done"
   * sentinel -1 after the singleton initializer has run to completion.
   * Loaded via RIP-relative at @0x1b36.
   */
  private static _instanceOnce: { value: number } = { value: 0 };

  /**
   * `OZCompoundChannel_Factory::getInstance()` @ProChannel 0x1b2e.
   *
   * Fast-path (@0x1b36–cmpq): read `_instanceOnce` and short-
   * circuit to the tail load if it equals the libc++ "done" sentinel -1.
   *
   * Slow-path (through @0x1b66): build the libc++ __call_once
   * trampoline (a `tuple<lambda&&>` on the stack whose address is passed
   * as `ctx`) and invoke `std::__1::__call_once(_instanceOnce, ctx,
   * __call_once_proxy<...>)`.
   *
   * Tail (@0x1b6b–0x1b7a): load `_instance` and return it.
   */
  static getInstance(): OZCompoundChannel_Factory | null {
    // Read _instanceOnce.
    const flag = OZCompoundChannel_Factory._instanceOnce.value;
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
          "OZCompoundChannel_Factory::getInstance()::lambda / __call_once_proxy " +
            "@ProChannel __ZNSt3__117__call_once_proxyB9nqe210106... — " +
            "not yet transcribed (separate ledger claim)",
        );
      };

      // @0x1b66: callq 0xacdc8  ; std::__1::__call_once(flag, ctx, fn).
      //   TRUE out-of-scope extern (libc++). Faithful raising stub —
      //   see std_call_once_stub above.
      std_call_once_stub(
        OZCompoundChannel_Factory._instanceOnce,
        ctx,
        callOnceProxy,
      );
    }

    // @0x1b6b: load _instance.
    // @0x1b7a: epilog + retq.
    return OZCompoundChannel_Factory._instance;
  }
}

