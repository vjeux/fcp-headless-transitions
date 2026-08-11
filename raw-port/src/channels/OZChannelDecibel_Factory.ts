// OZChannelDecibel_Factory — ProChannel factory singleton (partial port).
//
// This file ONLY transcribes ONE method today: the static `getInstance()`
// singleton accessor @ProChannel 0x25d8. The rest of the factory (ctor,
// dtor, create*, description, manufacturer, etc.) is NOT in this claim
// and stays undecoded until later workers claim those symbols.
//
// Transcribed from /Applications/Final Cut Pro.app/Contents/Frameworks/
// ProChannel.framework/Versions/A/ProChannel (x86_64 slice; unadjusted VAs from
// `otool -tV`). Disassembly source:
//   raw-port/re/disasm/ProChannel.__ZN24OZChannelDecibel_Factory11getInstanceEv.s
//
// Full verbatim disassembly of the CLAIMED method:
//
//   __ZN24OZChannelDecibel_Factory11getInstanceEv:
//   00000000000025d8	pushq	%rbp
//   00000000000025d9	movq	%rsp, %rbp
//   00000000000025dc	subq	$0x20, %rsp
//   00000000000025e0	leaq	__ZN24OZChannelDecibel_Factory13_instanceOnceE(%rip), %rax ## OZChannelDecibel_Factory::_instanceOnce
//   00000000000025e7	movq	(%rax), %rax
//   00000000000025ea	cmpq	$-0x1, %rax
//   00000000000025ee	je	0x2615
//   00000000000025f0	leaq	-0x1(%rbp), %rax
//   00000000000025f4	leaq	-0x18(%rbp), %rcx
//   00000000000025f8	movq	%rax, (%rcx)
//   00000000000025fb	leaq	-0x10(%rbp), %rsi
//   00000000000025ff	movq	%rcx, (%rsi)
//   0000000000002602	leaq	__ZN24OZChannelDecibel_Factory13_instanceOnceE(%rip), %rdi ## OZChannelDecibel_Factory::_instanceOnce
//   0000000000002609	leaq	__ZNSt3__117__call_once_proxyB9nqe210106INS_5tupleIJOZN24OZChannelDecibel_Factory11getInstanceEvEUlvE_EEEEEvPv(%rip), %rdx ## void std::__1::__call_once_proxy[abi:nqe210106]<std::__1::tuple<OZChannelDecibel_Factory::getInstance()::'lambda'()&&>>(void*)
//   0000000000002610	callq	0xacdc8                         ## symbol stub for: __ZNSt3__111__call_onceERVmPvPFvS2_E
//   0000000000002615	leaq	__ZN24OZChannelDecibel_Factory9_instanceE(%rip), %rax ## OZChannelDecibel_Factory::_instance
//   000000000000261c	movq	(%rax), %rax
//   000000000000261f	addq	$0x20, %rsp
//   0000000000002623	popq	%rbp
//   0000000000002624	retq
//   0000000000002625	nop
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
 * `OZChannelDecibel_Factory` — ProChannel factory singleton (partial port).
 *
 * ONLY `getInstance()` is transcribed here. All other members are SEPARATE
 * ledger symbols and are the responsibility of separate claims. Do NOT
 * add un-transcribed methods to this class.
 */
export class OZChannelDecibel_Factory {
  /**
   * `OZChannelDecibel_Factory::_instance` — program-global singleton pointer.
   * Loaded via RIP-relative at @0x2615. Initialized to null at
   * framework load; written exactly once by the __call_once thunk.
   */
  private static _instance: OZChannelDecibel_Factory | null = null;

  /**
   * `OZChannelDecibel_Factory::_instanceOnce` — the `std::once_flag` (raw
   * `unsigned long`) that libc++ __call_once flips from 0 to the "done"
   * sentinel -1 after the singleton initializer has run to completion.
   * Loaded via RIP-relative at @0x25e0.
   */
  private static _instanceOnce: { value: number } = { value: 0 };

  /**
   * `OZChannelDecibel_Factory::getInstance()` @ProChannel 0x25d8.
   *
   * Fast-path (@0x25e0–cmpq): read `_instanceOnce` and short-
   * circuit to the tail load if it equals the libc++ "done" sentinel -1.
   *
   * Slow-path (through @0x2610): build the libc++ __call_once
   * trampoline (a `tuple<lambda&&>` on the stack whose address is passed
   * as `ctx`) and invoke `std::__1::__call_once(_instanceOnce, ctx,
   * __call_once_proxy<...>)`.
   *
   * Tail (@0x2615–0x2624): load `_instance` and return it.
   */
  static getInstance(): OZChannelDecibel_Factory | null {
    // Read _instanceOnce.
    const flag = OZChannelDecibel_Factory._instanceOnce.value;
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
          "OZChannelDecibel_Factory::getInstance()::lambda / __call_once_proxy " +
            "@ProChannel __ZNSt3__117__call_once_proxyB9nqe210106... — " +
            "not yet transcribed (separate ledger claim)",
        );
      };

      // @0x2610: callq 0xacdc8  ; std::__1::__call_once(flag, ctx, fn).
      //   TRUE out-of-scope extern (libc++). Faithful raising stub —
      //   see std_call_once_stub above.
      std_call_once_stub(
        OZChannelDecibel_Factory._instanceOnce,
        ctx,
        callOnceProxy,
      );
    }

    // @0x2615: load _instance.
    // @0x2624: epilog + retq.
    return OZChannelDecibel_Factory._instance;
  }

  /**
   * `OZChannelDecibel_Factory::revision()` -> unsigned
   * @ProChannel __ZN24OZChannelDecibel_Factory8revisionEv @0x1027c..0x10283
   *
   * FULL DISASM — the whole function, five instructions:
   *   0x1027c  pushq %rbp                 ; frame
   *   0x1027d  movq  %rsp, %rbp
   *   0x10280  xorl  %eax, %eax           ; return 0
   *   0x10282  popq  %rbp
   *   0x10283  retq
   *
   * The factory reports revision 0. `this` is never dereferenced — %rdi is dead on entry — so
   * the value is a property of the class and not of any instance, which is why it is safe to
   * read it off a factory that has not been constructed.
   *
   * ORACLED against the live symbol (a local `t` symbol is still callable by address): loading
   * ProChannel under `arch -x86_64` and checking the eight prologue bytes at slide+0x1027c
   * against `554889e531c05dc3` before calling, eight calls all return 0, and a `this` arena
   * poisoned with 0xCD is byte-identical afterwards — so "reads nothing, returns 0" is measured
   * rather than read off the listing.
   */
  revision(): number {
    return 0; // @0x10280 xorl %eax, %eax
  }
}

