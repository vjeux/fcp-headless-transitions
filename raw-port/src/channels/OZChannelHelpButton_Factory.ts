// OZChannelHelpButton_Factory — ProChannel factory singleton (partial port).
//
// This file ONLY transcribes ONE method today: the static `getInstance()`
// singleton accessor @ProChannel 0x22cc. The rest of the factory (ctor,
// dtor, create*, description, manufacturer, etc.) is NOT in this claim
// and stays undecoded until later workers claim those symbols.
//
// Transcribed from /Applications/Final Cut Pro.app/Contents/Frameworks/
// ProChannel.framework/Versions/A/ProChannel (x86_64 slice; unadjusted VAs from
// `otool -tV`). Disassembly source:
//   raw-port/re/disasm/ProChannel.__ZN27OZChannelHelpButton_Factory11getInstanceEv.s
//
// Full verbatim disassembly of the CLAIMED method:
//
//   __ZN27OZChannelHelpButton_Factory11getInstanceEv:
//   00000000000022cc	pushq	%rbp
//   00000000000022cd	movq	%rsp, %rbp
//   00000000000022d0	subq	$0x20, %rsp
//   00000000000022d4	leaq	__ZN27OZChannelHelpButton_Factory13_instanceOnceE(%rip), %rax ## OZChannelHelpButton_Factory::_instanceOnce
//   00000000000022db	movq	(%rax), %rax
//   00000000000022de	cmpq	$-0x1, %rax
//   00000000000022e2	je	0x2309
//   00000000000022e4	leaq	-0x1(%rbp), %rax
//   00000000000022e8	leaq	-0x18(%rbp), %rcx
//   00000000000022ec	movq	%rax, (%rcx)
//   00000000000022ef	leaq	-0x10(%rbp), %rsi
//   00000000000022f3	movq	%rcx, (%rsi)
//   00000000000022f6	leaq	__ZN27OZChannelHelpButton_Factory13_instanceOnceE(%rip), %rdi ## OZChannelHelpButton_Factory::_instanceOnce
//   00000000000022fd	leaq	__ZNSt3__117__call_once_proxyB9nqe210106INS_5tupleIJOZN27OZChannelHelpButton_Factory11getInstanceEvEUlvE_EEEEEvPv(%rip), %rdx ## void std::__1::__call_once_proxy[abi:nqe210106]<std::__1::tuple<OZChannelHelpButton_Factory::getInstance()::'lambda'()&&>>(void*)
//   0000000000002304	callq	0xacdc8                         ## symbol stub for: __ZNSt3__111__call_onceERVmPvPFvS2_E
//   0000000000002309	leaq	__ZN27OZChannelHelpButton_Factory9_instanceE(%rip), %rax ## OZChannelHelpButton_Factory::_instance
//   0000000000002310	movq	(%rax), %rax
//   0000000000002313	addq	$0x20, %rsp
//   0000000000002317	popq	%rbp
//   0000000000002318	retq
//   0000000000002319	nop
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
 * `OZChannelHelpButton_Factory` — ProChannel factory singleton (partial port).
 *
 * ONLY `getInstance()` is transcribed here. All other members are SEPARATE
 * ledger symbols and are the responsibility of separate claims. Do NOT
 * add un-transcribed methods to this class.
 */
/**
 * The "no icon ID" sentinel this factory reports — the int32 -1 written by
 * `movl $0xffffffff,%eax` @ProChannel 0xd5ec (see `getIconIDInternal` below).
 * Declared here rather than imported from a sibling factory that carries the same value from ITS
 * own instruction: the provenance of a constant is the address it was read from, and each file
 * cites its own.
 */
export const OZ_CHANNEL_HELP_BUTTON_FACTORY_ICON_ID_NONE = -1 as const;

export class OZChannelHelpButton_Factory {
  /**
   * `OZChannelHelpButton_Factory::_instance` — program-global singleton pointer.
   * Loaded via RIP-relative at @0x2309. Initialized to null at
   * framework load; written exactly once by the __call_once thunk.
   */
  private static _instance: OZChannelHelpButton_Factory | null = null;

  /**
   * `OZChannelHelpButton_Factory::_instanceOnce` — the `std::once_flag` (raw
   * `unsigned long`) that libc++ __call_once flips from 0 to the "done"
   * sentinel -1 after the singleton initializer has run to completion.
   * Loaded via RIP-relative at @0x22d4.
   */
  private static _instanceOnce: { value: number } = { value: 0 };

  /**
   * `OZChannelHelpButton_Factory::getInstance()` @ProChannel 0x22cc.
   *
   * Fast-path (@0x22d4–cmpq): read `_instanceOnce` and short-
   * circuit to the tail load if it equals the libc++ "done" sentinel -1.
   *
   * Slow-path (through @0x2304): build the libc++ __call_once
   * trampoline (a `tuple<lambda&&>` on the stack whose address is passed
   * as `ctx`) and invoke `std::__1::__call_once(_instanceOnce, ctx,
   * __call_once_proxy<...>)`.
   *
   * Tail (@0x2309–0x2318): load `_instance` and return it.
   */
  static getInstance(): OZChannelHelpButton_Factory | null {
    // Read _instanceOnce.
    const flag = OZChannelHelpButton_Factory._instanceOnce.value;
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
          "OZChannelHelpButton_Factory::getInstance()::lambda / __call_once_proxy " +
            "@ProChannel __ZNSt3__117__call_once_proxyB9nqe210106... — " +
            "not yet transcribed (separate ledger claim)",
        );
      };

      // @0x2304: callq 0xacdc8  ; std::__1::__call_once(flag, ctx, fn).
      //   TRUE out-of-scope extern (libc++). Faithful raising stub —
      //   see std_call_once_stub above.
      std_call_once_stub(
        OZChannelHelpButton_Factory._instanceOnce,
        ctx,
        callOnceProxy,
      );
    }

    // @0x2309: load _instance.
    // @0x2318: epilog + retq.
    return OZChannelHelpButton_Factory._instance;
  }

  /**
   * `OZChannelHelpButton_Factory::getIconIDInternal()` — @ProChannel 0xd5e8
   *   `__ZN27OZChannelHelpButton_Factory17getIconIDInternalEv`
   *
   * FULL transcription — every instruction, in order (7 lines, the whole function):
   *
   *   0xd5e8  pushq %rbp                  ; frame prologue (no TS counterpart)
   *   0xd5e9  movq  %rsp,%rbp             ; frame prologue (no TS counterpart)
   *   0xd5ec  movl  $0xffffffff,%eax      ; %eax = -1 (int32)
   *   0xd5f1  popq  %rbp                  ; frame epilogue (no TS counterpart)
   *   0xd5f2  retq                        ; returns the int in %eax
   *   0xd5f3  nop                         ; alignment padding, not executed
   *
   * One instruction with value semantics. `this` (%rdi) is never dereferenced, nothing is called,
   * nothing is allocated: no in-scope callee, no extern, no allocation, no indirect or virtual
   * dispatch (`depgraph.py deps` lists nothing for this symbol).
   *
   * -1 IS THE IMPLEMENTATION, NOT A GAP. The slot is pure-virtual in the abstract factory base, so
   * every concrete factory must supply a body, and -1 is the "this factory contributes no icon ID"
   * sentinel the channel factories emit — this body is byte-identical to the landed siblings
   * `OZChannelLevels_Factory::getIconIDInternal` @ProChannel 0xce94 and
   * `OZChannelPositionPercent_Factory::getIconIDInternal` @ProChannel 0x86be, both of which record
   * the same census. A throw here would be wrong: the function is complete, and its complete
   * answer is -1.
   *
   * SIGNEDNESS: the immediate is written into the 32-bit `%eax`, so the value is the int32 -1, not
   * the unsigned 4294967295 a 64-bit read would give; callers compare against -1.
   *
   * ORACLE (executed against live FCP, not read): the symbol is `t` (local) and therefore not
   * dlsym-able, so it was called BY ADDRESS in a Rosetta x86_64 process — `arch -x86_64
   * /usr/bin/python3` — at `_dyld_get_image_vmaddr_slide(ProChannel) + 0xd5e8`, with the vmaddr
   * from `nm -n -arch x86_64` (never a bare `nm`: it reports the arm64 slice even under Rosetta).
   * ProChannel needs the recursive `@rpath` preload (a bare dlopen fails with "no LC_RPATH's
   * found"); it loads after 3 images. Live ProChannel returned exactly -1 for four different `this`
   * pointers including NULL — the value this port returns.
   *
   * @returns %eax — always -1 (@0xd5ec).
   */
  getIconIDInternal(): number {
    // @0xd5ec  movl $0xffffffff,%eax ; @0xd5f2 retq
    return OZ_CHANNEL_HELP_BUTTON_FACTORY_ICON_ID_NONE;
  }
}

