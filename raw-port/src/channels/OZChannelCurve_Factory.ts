// OZChannelCurve_Factory — ProChannel factory singleton (partial port).
//
// This file transcribes TWO methods, each claimed and cited separately:
// the static `getInstance()` singleton accessor @ProChannel 0x2710, and
// `version()` @ProChannel 0x11a6c. The rest of the factory (ctor, dtor,
// create*, description, manufacturer, revision, category/icon accessors)
// is NOT in either claim and stays undecoded until later workers claim
// those symbols.
//
// Transcribed from /Applications/Final Cut Pro.app/Contents/Frameworks/
// ProChannel.framework/Versions/A/ProChannel (x86_64 slice; unadjusted VAs from
// `otool -tV`). Disassembly sources:
//   raw-port/re/disasm/ProChannel.__ZN22OZChannelCurve_Factory11getInstanceEv.s
//   raw-port/re/disasm/ProChannel.__ZN22OZChannelCurve_Factory7versionEv.s
//
// Full verbatim disassembly of the FIRST claimed method (`version()`'s is in
// its own doc comment, on the method):
//
//   __ZN22OZChannelCurve_Factory11getInstanceEv:
//   0000000000002710	pushq	%rbp
//   0000000000002711	movq	%rsp, %rbp
//   0000000000002714	subq	$0x20, %rsp
//   0000000000002718	leaq	__ZN22OZChannelCurve_Factory13_instanceOnceE(%rip), %rax ## OZChannelCurve_Factory::_instanceOnce
//   000000000000271f	movq	(%rax), %rax
//   0000000000002722	cmpq	$-0x1, %rax
//   0000000000002726	je	0x274d
//   0000000000002728	leaq	-0x1(%rbp), %rax
//   000000000000272c	leaq	-0x18(%rbp), %rcx
//   0000000000002730	movq	%rax, (%rcx)
//   0000000000002733	leaq	-0x10(%rbp), %rsi
//   0000000000002737	movq	%rcx, (%rsi)
//   000000000000273a	leaq	__ZN22OZChannelCurve_Factory13_instanceOnceE(%rip), %rdi ## OZChannelCurve_Factory::_instanceOnce
//   0000000000002741	leaq	__ZNSt3__117__call_once_proxyB9nqe210106INS_5tupleIJOZN22OZChannelCurve_Factory11getInstanceEvEUlvE_EEEEEvPv(%rip), %rdx ## void std::__1::__call_once_proxy[abi:nqe210106]<std::__1::tuple<OZChannelCurve_Factory::getInstance()::'lambda'()&&>>(void*)
//   0000000000002748	callq	0xacdc8                         ## symbol stub for: __ZNSt3__111__call_onceERVmPvPFvS2_E
//   000000000000274d	leaq	__ZN22OZChannelCurve_Factory9_instanceE(%rip), %rax ## OZChannelCurve_Factory::_instance
//   0000000000002754	movq	(%rax), %rax
//   0000000000002757	addq	$0x20, %rsp
//   000000000000275b	popq	%rbp
//   000000000000275c	retq
//   000000000000275d	nop
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
 * `OZChannelCurve_Factory` — ProChannel factory singleton (partial port).
 *
 * TWO methods are transcribed here, each from its own claim and each citing
 * its own address: `getInstance()` @0x2710 and `version()` @0x11a6c. All
 * other members (ctor, dtor, create/createCopy/createChannel/
 * createChannelCopy, description/manufacturer/revision, category/icon
 * accessors) are SEPARATE ledger symbols and are the responsibility of
 * separate claims. Do NOT add un-transcribed methods to this class.
 */
export class OZChannelCurve_Factory {
  /**
   * `OZChannelCurve_Factory::_instance` — program-global singleton pointer.
   * Loaded via RIP-relative at @0x274d. Initialized to null at
   * framework load; written exactly once by the __call_once thunk
   * (which is not part of THIS claim's function body).
   */
  private static _instance: OZChannelCurve_Factory | null = null;

  /**
   * `OZChannelCurve_Factory::_instanceOnce` — the `std::once_flag` (raw
   * `unsigned long`) that libc++ __call_once flips from 0 to the "done"
   * sentinel -1 after the singleton initializer has run to completion.
   * Loaded via RIP-relative at @0x2718 and @0x2718.
   *
   * Modelled as a mutable box so we can pass it by reference to the
   * (stubbed) __call_once call, matching the C++ `unsigned long&` first
   * argument. Initial value 0 (BSS zero-init); the C++ writes -1 (all-
   * ones sentinel) after first-run — we mirror using JS -1.
   */
  private static _instanceOnce: { value: number } = { value: 0 };

  /**
   * `OZChannelCurve_Factory::getInstance()` @ProChannel 0x2710.
   *
   * Fast-path (@0x2718–0x2722): read `_instanceOnce` and short-
   * circuit to the tail load if it equals the libc++ "done" sentinel -1.
   *
   * Slow-path (through @0x2748): build the libc++ __call_once
   * trampoline (a `tuple<lambda&&>` on the stack whose address is passed
   * as `ctx`) and invoke `std::__1::__call_once(_instanceOnce, ctx,
   * __call_once_proxy<...>)`. The proxy is a compiler-synthesized adapter
   * that unpacks the tuple and invokes the getInstance()-local lambda,
   * which is a SEPARATE ledger symbol responsible for allocating the
   * factory singleton and publishing it into `_instance`.
   *
   * Tail (@0x274d–0x275c): load `_instance` and return it.
   */
  static getInstance(): OZChannelCurve_Factory | null {
    // @0x2718–read _instanceOnce.
    const flag = OZChannelCurve_Factory._instanceOnce.value;
    // @0x2722–@0x2726: `cmpq $-0x1, %rax ; je 0x274d`. libc++ "done" == -1.
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
          "OZChannelCurve_Factory::getInstance()::lambda / __call_once_proxy " +
            "@ProChannel __ZNSt3__117__call_once_proxyB9nqe210106... — " +
            "not yet transcribed (separate ledger claim)",
        );
      };

      // @0x2748: callq 0xacdc8  ; std::__1::__call_once(flag, ctx, fn).
      //   TRUE out-of-scope extern (libc++). Faithful raising stub —
      //   see std_call_once_stub above.
      std_call_once_stub(
        OZChannelCurve_Factory._instanceOnce,
        ctx,
        callOnceProxy,
      );
    }

    // @0x274d: load _instance.
    // @0x275c: epilog + retq.
    return OZChannelCurve_Factory._instance;
  }

  /**
   * `OZChannelCurve_Factory::version()` — @ProChannel 0x11a6c
   * (__ZN22OZChannelCurve_Factory7versionEv).
   *
   * Re-derived with
   * `raw-port/tools/disasm.sh --sym __ZN22OZChannelCurve_Factory7versionEv ProChannel`
   * (x86_64 slice, unadjusted VAs) ->
   * `raw-port/re/disasm/ProChannel.__ZN22OZChannelCurve_Factory7versionEv.s`.
   *
   * FULL DISASM — every instruction of the function:
   *
   *   0x11a6c  pushq  %rbp            ; frame setup (no TS counterpart)
   *   0x11a6d  movq   %rsp, %rbp      ; frame setup (no TS counterpart)
   *   0x11a70  movl   $0x1, %eax      ; return 1 — the entire computation
   *   0x11a75  popq   %rbp            ; frame teardown (no TS counterpart)
   *   0x11a76  retq                   ; return %eax
   *   0x11a77  nop                    ; alignment padding, not executed
   *
   * No load, no call, no branch, and `%rdi` is never touched — so `this` is
   * not read and none of the class's state participates.
   *
   * NOT AN EMPTY BODY. `movl $0x1,%eax` (`b8 01 00 00 00`) SETS the value,
   * where an empty C++ body would leave %eax undefined. The immediate
   * neighbour settles the reading: `revision()` @0x11a78 is the same
   * six-instruction shape with `xorl %eax,%eax`, so the pair reads "format
   * version 1, revision 0". That neighbour is a SEPARATE ledger unit and is
   * NOT ported here; it is cited because it is also this port's sensitivity
   * control (see ORACLE below). The same pairing is landed on
   * OZChannelBlendMode_Factory (@Ozone 0x1cf50 / 0x1cf60).
   *
   * DEPENDENCIES: none. `depgraph.py deps __ZN22OZChannelCurve_Factory7versionEv`
   * lists nothing — zero in-scope callees, zero externs, zero indirect or
   * virtual dispatch.
   *
   * The C++ return type is the unsigned the factory-base `version()` virtual
   * declares. The value fits a 32-bit register and only %eax is defined by
   * the ABI as the return, so a plain `number` is exact here; adding a
   * `>>> 0` would model a truncation the instruction does not perform.
   *
   * ORACLE — VERIFIED against the live binary by
   * `raw-port/re/oracle/OZChannelCurve_Factory_version_oracle.py`, run under
   * `arch -x86_64 /usr/bin/python3` because every address above is an x86_64
   * offset and an arm64 vmaddr would land on another function and fail
   * silently toward VERIFIED. The symbol is LOCAL (`nm` type `t`), so it is
   * called at `_dyld_get_image_vmaddr_slide(ProChannel) + 0x11a6c` with the
   * body bytes checked before the call. All controls fired: the live
   * function returns 1; a 0xCD-poisoned `this` is byte-identical afterwards;
   * called with `this` in UNMAPPED memory it still returns 1 (so "does not
   * read its receiver" is enforced by the hardware); the one-byte-off
   * negative control fails as it must; and the SENSITIVITY control — the
   * same-shape neighbour `revision()` through the IDENTICAL CFUNCTYPE in the
   * same process — returns 0, so the harness is reading the real %eax.
   */
  version(): number {
    // @0x11a6c..0x11a6d — prologue (no TS-visible effect).
    // @0x11a70  movl $0x1, %eax
    // @0x11a75..0x11a76 — epilogue + retq.
    return 1; // @ProChannel 0x11a70
  }
}

