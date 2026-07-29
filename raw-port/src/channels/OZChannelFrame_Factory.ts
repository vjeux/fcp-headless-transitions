// OZChannelFrame_Factory — ProChannel factory singleton (partial port).
//
// This file ONLY transcribes ONE method today: the static `getInstance()`
// singleton accessor @ProChannel 0x2626. The rest of the factory (ctor,
// dtor, create*, description, manufacturer, etc.) is NOT in this claim
// and stays undecoded until later workers claim those symbols.
//
// Transcribed from /Applications/Final Cut Pro.app/Contents/Frameworks/
// ProChannel.framework/Versions/A/ProChannel (x86_64 slice; unadjusted VAs from
// `otool -tV`). Disassembly source:
//   raw-port/re/disasm/ProChannel.__ZN22OZChannelFrame_Factory11getInstanceEv.s
//
// Full verbatim disassembly of the CLAIMED method:
//
//   __ZN22OZChannelFrame_Factory11getInstanceEv:
//   0000000000002626	pushq	%rbp
//   0000000000002627	movq	%rsp, %rbp
//   000000000000262a	subq	$0x20, %rsp
//   000000000000262e	leaq	__ZN22OZChannelFrame_Factory13_instanceOnceE(%rip), %rax ## OZChannelFrame_Factory::_instanceOnce
//   0000000000002635	movq	(%rax), %rax
//   0000000000002638	cmpq	$-0x1, %rax
//   000000000000263c	je	0x2663
//   000000000000263e	leaq	-0x1(%rbp), %rax
//   0000000000002642	leaq	-0x18(%rbp), %rcx
//   0000000000002646	movq	%rax, (%rcx)
//   0000000000002649	leaq	-0x10(%rbp), %rsi
//   000000000000264d	movq	%rcx, (%rsi)
//   0000000000002650	leaq	__ZN22OZChannelFrame_Factory13_instanceOnceE(%rip), %rdi ## OZChannelFrame_Factory::_instanceOnce
//   0000000000002657	leaq	__ZNSt3__117__call_once_proxyB9nqe210106INS_5tupleIJOZN22OZChannelFrame_Factory11getInstanceEvEUlvE_EEEEEvPv(%rip), %rdx ## void std::__1::__call_once_proxy[abi:nqe210106]<std::__1::tuple<OZChannelFrame_Factory::getInstance()::'lambda'()&&>>(void*)
//   000000000000265e	callq	0xacdc8                         ## symbol stub for: __ZNSt3__111__call_onceERVmPvPFvS2_E
//   0000000000002663	leaq	__ZN22OZChannelFrame_Factory9_instanceE(%rip), %rax ## OZChannelFrame_Factory::_instance
//   000000000000266a	movq	(%rax), %rax
//   000000000000266d	addq	$0x20, %rsp
//   0000000000002671	popq	%rbp
//   0000000000002672	retq
//   0000000000002673	nop
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
 * `OZChannelFrame_Factory` — ProChannel factory singleton (partial port).
 *
 * ONLY `getInstance()` is transcribed here. All other members (ctor,
 * dtor, create/createCopy/createChannel/createChannelCopy, description/
 * manufacturer/version/revision, category/icon accessors) are SEPARATE
 * ledger symbols and are the responsibility of separate claims. Do NOT
 * add un-transcribed methods to this class.
 */
export class OZChannelFrame_Factory {
  /**
   * `OZChannelFrame_Factory::_instance` — program-global singleton pointer.
   * Loaded via RIP-relative at @0x2663. Initialized to null at
   * framework load; written exactly once by the __call_once thunk
   * (which is not part of THIS claim's function body).
   */
  private static _instance: OZChannelFrame_Factory | null = null;

  /**
   * `OZChannelFrame_Factory::_instanceOnce` — the `std::once_flag` (raw
   * `unsigned long`) that libc++ __call_once flips from 0 to the "done"
   * sentinel -1 after the singleton initializer has run to completion.
   * Loaded via RIP-relative at @0x262e and @0x262e.
   *
   * Modelled as a mutable box so we can pass it by reference to the
   * (stubbed) __call_once call, matching the C++ `unsigned long&` first
   * argument. Initial value 0 (BSS zero-init); the C++ writes -1 (all-
   * ones sentinel) after first-run — we mirror using JS -1.
   */
  private static _instanceOnce: { value: number } = { value: 0 };

  /**
   * `OZChannelFrame_Factory::getInstance()` @ProChannel 0x2626.
   *
   * Fast-path (@0x262e–0x2638): read `_instanceOnce` and short-
   * circuit to the tail load if it equals the libc++ "done" sentinel -1.
   *
   * Slow-path (through @0x265e): build the libc++ __call_once
   * trampoline (a `tuple<lambda&&>` on the stack whose address is passed
   * as `ctx`) and invoke `std::__1::__call_once(_instanceOnce, ctx,
   * __call_once_proxy<...>)`. The proxy is a compiler-synthesized adapter
   * that unpacks the tuple and invokes the getInstance()-local lambda,
   * which is a SEPARATE ledger symbol responsible for allocating the
   * factory singleton and publishing it into `_instance`.
   *
   * Tail (@0x2663–0x2672): load `_instance` and return it.
   */
  static getInstance(): OZChannelFrame_Factory | null {
    // @0x262e–read _instanceOnce.
    const flag = OZChannelFrame_Factory._instanceOnce.value;
    // @0x2638–@0x263c: `cmpq $-0x1, %rax ; je 0x2663`. libc++ "done" == -1.
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
          "OZChannelFrame_Factory::getInstance()::lambda / __call_once_proxy " +
            "@ProChannel __ZNSt3__117__call_once_proxyB9nqe210106... — " +
            "not yet transcribed (separate ledger claim)",
        );
      };

      // @0x265e: callq 0xacdc8  ; std::__1::__call_once(flag, ctx, fn).
      //   TRUE out-of-scope extern (libc++). Faithful raising stub —
      //   see std_call_once_stub above.
      std_call_once_stub(
        OZChannelFrame_Factory._instanceOnce,
        ctx,
        callOnceProxy,
      );
    }

    // @0x2663: load _instance.
    // @0x2672: epilog + retq.
    return OZChannelFrame_Factory._instance;
  }
}

