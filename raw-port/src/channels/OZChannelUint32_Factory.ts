// OZChannelUint32_Factory — ProChannel factory singleton (partial port).
//
// This file ONLY transcribes ONE method today: the static `getInstance()`
// singleton accessor @ProChannel 0x18be. The rest of the factory (ctor,
// dtor, create*, description, manufacturer, etc.) is NOT in this claim
// and stays undecoded until later workers claim those symbols.
//
// Transcribed from /Applications/Final Cut Pro.app/Contents/Frameworks/
// ProChannel.framework/Versions/A/ProChannel (x86_64 slice; unadjusted VAs from
// `otool -tV`). Disassembly source:
//   raw-port/re/disasm/ProChannel.__ZN23OZChannelUint32_Factory11getInstanceEv.s
//
// Full verbatim disassembly of the CLAIMED method:
//
//   __ZN23OZChannelUint32_Factory11getInstanceEv:
//   00000000000018be	pushq	%rbp
//   00000000000018bf	movq	%rsp, %rbp
//   00000000000018c2	subq	$0x20, %rsp
//   00000000000018c6	leaq	__ZN23OZChannelUint32_Factory13_instanceOnceE(%rip), %rax ## OZChannelUint32_Factory::_instanceOnce
//   00000000000018cd	movq	(%rax), %rax
//   00000000000018d0	cmpq	$-0x1, %rax
//   00000000000018d4	je	0x18fb
//   00000000000018d6	leaq	-0x1(%rbp), %rax
//   00000000000018da	leaq	-0x18(%rbp), %rcx
//   00000000000018de	movq	%rax, (%rcx)
//   00000000000018e1	leaq	-0x10(%rbp), %rsi
//   00000000000018e5	movq	%rcx, (%rsi)
//   00000000000018e8	leaq	__ZN23OZChannelUint32_Factory13_instanceOnceE(%rip), %rdi ## OZChannelUint32_Factory::_instanceOnce
//   00000000000018ef	leaq	__ZNSt3__117__call_once_proxy... (%rip), %rdx ## __call_once_proxy adapter
//   00000000000018f6	callq	0xacdc8                         ## symbol stub for: __ZNSt3__111__call_onceERVmPvPFvS2_E
//   00000000000018fb	leaq	__ZN23OZChannelUint32_Factory9_instanceE(%rip), %rax ## OZChannelUint32_Factory::_instance
//   0000000000001902	movq	(%rax), %rax
//   0000000000001905	addq	$0x20, %rsp
//   0000000000001909	popq	%rbp
//   000000000000190a	retq
//   000000000000190b	nop
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
 * `OZChannelUint32_Factory` — ProChannel factory singleton (partial port).
 *
 * ONLY `getInstance()` is transcribed here. All other members (ctor,
 * dtor, create/createCopy/createChannel/createChannelCopy, description/
 * manufacturer/version/revision, category/icon accessors) are SEPARATE
 * ledger symbols and are the responsibility of separate claims. Do NOT
 * add un-transcribed methods to this class.
 */
export class OZChannelUint32_Factory {
  /**
   * `OZChannelUint32_Factory::_instance` — program-global singleton pointer.
   * Loaded via RIP-relative at @0x18fb. Initialized to null at
   * framework load; written exactly once by the __call_once thunk
   * (which is not part of THIS claim's function body).
   */
  private static _instance: OZChannelUint32_Factory | null = null;

  /**
   * `OZChannelUint32_Factory::_instanceOnce` — the `std::once_flag` (raw
   * `unsigned long`) that libc++ __call_once flips from 0 to the "done"
   * sentinel -1 after the singleton initializer has run to completion.
   * Loaded via RIP-relative at @0x18c6 and @0x18e8.
   */
  private static _instanceOnce: { value: number } = { value: 0 };

  /**
   * `OZChannelUint32_Factory::getInstance()` @ProChannel 0x18be.
   *
   * Fast-path (@0x18c6–0x18d0): read `_instanceOnce` and short-
   * circuit to the tail load if it equals the libc++ "done" sentinel -1.
   *
   * Slow-path (through @0x18f6): build the libc++ __call_once
   * trampoline (a `tuple<lambda&&>` on the stack whose address is passed
   * as `ctx`) and invoke `std::__1::__call_once(_instanceOnce, ctx,
   * __call_once_proxy<...>)`.
   *
   * Tail (@0x18fb–0x190a): load `_instance` and return it.
   */
  static getInstance(): OZChannelUint32_Factory | null {
    // @0x18c6–read _instanceOnce.
    const flag = OZChannelUint32_Factory._instanceOnce.value;
    // @0x18d0–@0x18d4: `cmpq $-0x1, %rax ; je 0x18fb`. libc++ "done" == -1.
    if (flag !== -1) {
      // Slow-path — allocate on-stack `tuple<lambda&&>` (ctx). The
      // capture-less lambda uses a 1-byte pad (`-0x1(%rbp)`) as its
      // "reference"; we faithfully model the shape.
      const pad = { padByte: 0 };                    // -0x1(%rbp)
      const tuple: { ref: unknown } = { ref: pad };    // -0x18(%rbp)
      const ctx: { tup: unknown } = { tup: tuple };    // -0x10(%rbp)

      // __call_once_proxy address is loaded but NOT called by us —
      // libc++ __call_once would invoke it. Placeholder never reached
      // once the stub throws.
      const callOnceProxy = (_c: unknown): void => {
        throw new Error(
          "OZChannelUint32_Factory::getInstance()::lambda / __call_once_proxy " +
            "@ProChannel __ZNSt3__117__call_once_proxyB9nqe210106... — " +
            "not yet transcribed (separate ledger claim)",
        );
      };

      // @0x18f6: callq 0xacdc8  ; std::__1::__call_once(flag, ctx, fn).
      //   TRUE out-of-scope extern (libc++). Faithful raising stub —
      //   see std_call_once_stub above.
      std_call_once_stub(
        OZChannelUint32_Factory._instanceOnce,
        ctx,
        callOnceProxy,
      );
    }

    // @0x18fb: load _instance.
    // @0x190a: epilog + retq.
    return OZChannelUint32_Factory._instance;
  }
}
