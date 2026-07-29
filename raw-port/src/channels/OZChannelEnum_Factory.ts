// OZChannelEnum_Factory — ProChannel factory singleton (partial port).
//
// This file ONLY transcribes ONE method today: the static `getInstance()`
// singleton accessor @ProChannel 0x275e. The rest of the factory (ctor,
// dtor, create*, description, manufacturer, etc.) is NOT in this claim
// and stays undecoded until later workers claim those symbols.
//
// Transcribed from /Applications/Final Cut Pro.app/Contents/Frameworks/
// ProChannel.framework/Versions/A/ProChannel (x86_64 slice; unadjusted VAs from
// `otool -tV`). Disassembly source:
//   raw-port/re/disasm/ProChannel.__ZN21OZChannelEnum_Factory11getInstanceEv.s
//
// Full verbatim disassembly of the CLAIMED method:
//
//   __ZN21OZChannelEnum_Factory11getInstanceEv:
//   000000000000275e	pushq	%rbp
//   000000000000275f	movq	%rsp, %rbp
//   0000000000002762	subq	$0x20, %rsp
//   0000000000002766	leaq	__ZN21OZChannelEnum_Factory13_instanceOnceE(%rip), %rax ## OZChannelEnum_Factory::_instanceOnce
//   000000000000276d	movq	(%rax), %rax
//   0000000000002770	cmpq	$-0x1, %rax
//   0000000000002774	je	0x279b
//   0000000000002776	leaq	-0x1(%rbp), %rax
//   000000000000277a	leaq	-0x18(%rbp), %rcx
//   000000000000277e	movq	%rax, (%rcx)
//   0000000000002781	leaq	-0x10(%rbp), %rsi
//   0000000000002785	movq	%rcx, (%rsi)
//   0000000000002788	leaq	__ZN21OZChannelEnum_Factory13_instanceOnceE(%rip), %rdi ## OZChannelEnum_Factory::_instanceOnce
//   000000000000278f	leaq	__ZNSt3__117__call_once_proxyB9nqe210106INS_5tupleIJOZN21OZChannelEnum_Factory11getInstanceEvEUlvE_EEEEEvPv(%rip), %rdx ## void std::__1::__call_once_proxy[abi:nqe210106]<std::__1::tuple<OZChannelEnum_Factory::getInstance()::'lambda'()&&>>(void*)
//   0000000000002796	callq	0xacdc8                         ## symbol stub for: __ZNSt3__111__call_onceERVmPvPFvS2_E
//   000000000000279b	leaq	__ZN21OZChannelEnum_Factory9_instanceE(%rip), %rax ## OZChannelEnum_Factory::_instance
//   00000000000027a2	movq	(%rax), %rax
//   00000000000027a5	addq	$0x20, %rsp
//   00000000000027a9	popq	%rbp
//   00000000000027aa	retq
//   00000000000027ab	nop
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
//   address is only PASSED as data here, not called. Left as a
//   separate claim in a future wavefront.

/**
 * `std::__1::__call_once(unsigned long&, void*, void (*)(void*))` —
 * imported stub in ProChannel @0xacdc8. libc++ template instantiation,
 * TRUE out-of-scope extern (libc++ runtime, not one of the five FCP
 * frameworks we port).
 *
 * libc++ semantics: atomically test-and-set the flag; the first caller
 * runs `fn(ctx)` exactly once, then transitions the flag to the "done"
 * sentinel -1. Subsequent callers block until -1, then return without
 * running `fn`.
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
 * `OZChannelEnum_Factory` — ProChannel factory singleton (partial port).
 *
 * ONLY `getInstance()` is transcribed here. All other members (ctor,
 * dtor, create/createCopy/createChannel/createChannelCopy, description/
 * manufacturer/version/revision, category/icon accessors) are SEPARATE
 * ledger symbols and are the responsibility of separate claims. Do NOT
 * add un-transcribed methods to this class.
 */
export class OZChannelEnum_Factory {
  /**
   * `OZChannelEnum_Factory::_instance` — program-global singleton pointer.
   * Loaded via RIP-relative at @0x279b. Initialized to null at
   * framework load; written exactly once by the __call_once thunk
   * (which is not part of THIS claim's function body).
   */
  private static _instance: OZChannelEnum_Factory | null = null;

  /**
   * `OZChannelEnum_Factory::_instanceOnce` — the `std::once_flag` (raw
   * `unsigned long`) that libc++ __call_once flips from 0 to the "done"
   * sentinel -1 after the singleton initializer has run to completion.
   * Loaded via RIP-relative at @0x2766 and @0x2766.
   *
   * Modelled as a mutable box so we can pass it by reference to the
   * (stubbed) __call_once call, matching the C++ `unsigned long&` first
   * argument. Initial value 0 (BSS zero-init); the C++ writes -1 (all-
   * ones sentinel) after first-run — we mirror using JS -1.
   */
  private static _instanceOnce: { value: number } = { value: 0 };

  /**
   * `OZChannelEnum_Factory::getInstance()` @ProChannel 0x275e.
   *
   * Fast-path (@0x2766–0x2770): read `_instanceOnce` and short-
   * circuit to the tail load if it equals the libc++ "done" sentinel -1.
   *
   * Slow-path (through @0x2796): build the libc++ __call_once
   * trampoline (a `tuple<lambda&&>` on the stack whose address is passed
   * as `ctx`) and invoke `std::__1::__call_once(_instanceOnce, ctx,
   * __call_once_proxy<...>)`. The proxy is a compiler-synthesized adapter
   * that unpacks the tuple and invokes the getInstance()-local lambda,
   * which is a SEPARATE ledger symbol responsible for allocating the
   * factory singleton and publishing it into `_instance`.
   *
   * Tail (@0x279b–0x27aa): load `_instance` and return it.
   */
  static getInstance(): OZChannelEnum_Factory | null {
    // @0x2766–read _instanceOnce.
    const flag = OZChannelEnum_Factory._instanceOnce.value;
    // @0x2770–@0x2774: `cmpq $-0x1, %rax ; je 0x279b`. libc++ "done" == -1.
    if (flag !== -1) {
      // Slow-path — allocate on-stack `tuple<lambda&&>` (ctx). The
      // capture-less lambda uses a 1-byte pad (`-0x1(%rbp)`) as its
      // "reference"; we faithfully model the shape.
      const pad = { padByte: 0 };                    // -0x1(%rbp)
      const tuple: { ref: unknown } = { ref: pad };    // -0x18(%rbp)
      const ctx: { tup: unknown } = { tup: tuple };    // -0x10(%rbp)

      // __call_once_proxy address is loaded but NOT called by us —
      // libc++ __call_once would invoke it. We pass a placeholder that
      // will not be invoked on any code path once the stub throws.
      const callOnceProxy = (_c: unknown): void => {
        throw new Error(
          "OZChannelEnum_Factory::getInstance()::lambda / __call_once_proxy " +
            "@ProChannel __ZNSt3__117__call_once_proxyB9nqe210106... — " +
            "not yet transcribed (separate ledger claim)",
        );
      };

      // @0x2796: callq 0xacdc8  ; std::__1::__call_once(flag, ctx, fn).
      //   TRUE out-of-scope extern (libc++). Faithful raising stub —
      //   see std_call_once_stub above.
      std_call_once_stub(
        OZChannelEnum_Factory._instanceOnce,
        ctx,
        callOnceProxy,
      );
    }

    // @0x279b: load _instance.
    // @0x27aa: epilog + retq.
    return OZChannelEnum_Factory._instance;
  }
}

