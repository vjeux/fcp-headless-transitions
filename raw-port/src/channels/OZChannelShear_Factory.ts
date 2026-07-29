// OZChannelShear_Factory — ProChannel factory singleton (partial port).
//
// This file ONLY transcribes ONE method today: the static `getInstance()`
// singleton accessor @ProChannel 0x1cb4. The rest of the factory (ctor,
// dtor, create*, description, manufacturer, etc.) is NOT in this claim
// and stays undecoded until later workers claim those symbols.
//
// Transcribed from /Applications/Final Cut Pro.app/Contents/Frameworks/
// ProChannel.framework/Versions/A/ProChannel (x86_64 slice; unadjusted VAs from
// `otool -tV`). Disassembly source:
//   raw-port/re/disasm/ProChannel.__ZN22OZChannelShear_Factory11getInstanceEv.s
//
// Full verbatim disassembly of the CLAIMED method:
//
//   __ZN22OZChannelShear_Factory11getInstanceEv:
//   0000000000001cb4	pushq	%rbp
//   0000000000001cb5	movq	%rsp, %rbp
//   0000000000001cb8	subq	$0x20, %rsp
//   0000000000001cbc	leaq	__ZN22OZChannelShear_Factory13_instanceOnceE(%rip), %rax ## OZChannelShear_Factory::_instanceOnce
//   0000000000001cc3	movq	(%rax), %rax
//   0000000000001cc6	cmpq	$-0x1, %rax
//   0000000000001cca	je	0x1cf1
//   0000000000001ccc	leaq	-0x1(%rbp), %rax
//   0000000000001cd0	leaq	-0x18(%rbp), %rcx
//   0000000000001cd4	movq	%rax, (%rcx)
//   0000000000001cd7	leaq	-0x10(%rbp), %rsi
//   0000000000001cdb	movq	%rcx, (%rsi)
//   0000000000001cde	leaq	__ZN22OZChannelShear_Factory13_instanceOnceE(%rip), %rdi ## OZChannelShear_Factory::_instanceOnce
//   0000000000001ce5	leaq	__ZNSt3__117__call_once_proxyB9nqe210106INS_5tupleIJOZN22OZChannelShear_Factory11getInstanceEvEUlvE_EEEEEvPv(%rip), %rdx ## void std::__1::__call_once_proxy[abi:nqe210106]<std::__1::tuple<OZChannelShear_Factory::getInstance()::'lambda'()&&>>(void*)
//   0000000000001cec	callq	0xacdc8                         ## symbol stub for: __ZNSt3__111__call_onceERVmPvPFvS2_E
//   0000000000001cf1	leaq	__ZN22OZChannelShear_Factory9_instanceE(%rip), %rax ## OZChannelShear_Factory::_instance
//   0000000000001cf8	movq	(%rax), %rax
//   0000000000001cfb	addq	$0x20, %rsp
//   0000000000001cff	popq	%rbp
//   0000000000001d00	retq
//   0000000000001d01	nop
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
 * `OZChannelShear_Factory` — ProChannel factory singleton (partial port).
 *
 * ONLY `getInstance()` is transcribed here. All other members (ctor,
 * dtor, create/createCopy/createChannel/createChannelCopy, description/
 * manufacturer/version/revision, category/icon accessors) are SEPARATE
 * ledger symbols and are the responsibility of separate claims. Do NOT
 * add un-transcribed methods to this class.
 */
export class OZChannelShear_Factory {
  /**
   * `OZChannelShear_Factory::_instance` — program-global singleton pointer.
   * Loaded via RIP-relative at @0x1cf1. Initialized to null at
   * framework load; written exactly once by the __call_once thunk
   * (which is not part of THIS claim's function body).
   */
  private static _instance: OZChannelShear_Factory | null = null;

  /**
   * `OZChannelShear_Factory::_instanceOnce` — the `std::once_flag` (raw
   * `unsigned long`) that libc++ __call_once flips from 0 to the "done"
   * sentinel -1 after the singleton initializer has run to completion.
   * Loaded via RIP-relative at @0x1cbc and @0x1cbc.
   *
   * Modelled as a mutable box so we can pass it by reference to the
   * (stubbed) __call_once call, matching the C++ `unsigned long&` first
   * argument. Initial value 0 (BSS zero-init); the C++ writes -1 (all-
   * ones sentinel) after first-run — we mirror using JS -1.
   */
  private static _instanceOnce: { value: number } = { value: 0 };

  /**
   * `OZChannelShear_Factory::getInstance()` @ProChannel 0x1cb4.
   *
   * Fast-path (@0x1cbc–0x1cc6): read `_instanceOnce` and short-
   * circuit to the tail load if it equals the libc++ "done" sentinel -1.
   *
   * Slow-path (through @0x1cec): build the libc++ __call_once
   * trampoline (a `tuple<lambda&&>` on the stack whose address is passed
   * as `ctx`) and invoke `std::__1::__call_once(_instanceOnce, ctx,
   * __call_once_proxy<...>)`. The proxy is a compiler-synthesized adapter
   * that unpacks the tuple and invokes the getInstance()-local lambda,
   * which is a SEPARATE ledger symbol responsible for allocating the
   * factory singleton and publishing it into `_instance`.
   *
   * Tail (@0x1cf1–0x1d00): load `_instance` and return it.
   */
  static getInstance(): OZChannelShear_Factory | null {
    // @0x1cbc–read _instanceOnce.
    const flag = OZChannelShear_Factory._instanceOnce.value;
    // @0x1cc6–@0x1cca: `cmpq $-0x1, %rax ; je 0x1cf1`. libc++ "done" == -1.
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
          "OZChannelShear_Factory::getInstance()::lambda / __call_once_proxy " +
            "@ProChannel __ZNSt3__117__call_once_proxyB9nqe210106... — " +
            "not yet transcribed (separate ledger claim)",
        );
      };

      // @0x1cec: callq 0xacdc8  ; std::__1::__call_once(flag, ctx, fn).
      //   TRUE out-of-scope extern (libc++). Faithful raising stub —
      //   see std_call_once_stub above.
      std_call_once_stub(
        OZChannelShear_Factory._instanceOnce,
        ctx,
        callOnceProxy,
      );
    }

    // @0x1cf1: load _instance.
    // @0x1d00: epilog + retq.
    return OZChannelShear_Factory._instance;
  }
}

