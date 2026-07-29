// OZChannel2D_Factory — ProChannel factory singleton that mints OZChannel2D
// channel instances.
//
// This file ONLY transcribes ONE method today: the static `getInstance()`
// singleton accessor @ProChannel 0x1b7c. The rest of the factory (ctor,
// dtor, create*, description, manufacturer, etc.) is NOT in this claim
// and stays undecoded until a later worker claims those symbols.
//
// Transcribed from /Applications/Final Cut Pro.app/Contents/Frameworks/
// ProChannel.framework/Versions/A/ProChannel (x86_64 slice; unadjusted
// VAs from `otool -tV`). Disassembly source:
//   raw-port/re/disasm/ProChannel.__ZN19OZChannel2D_Factory11getInstanceEv.s
//
// Full 22-line disassembly of the CLAIMED method (verbatim):
//
//   __ZN19OZChannel2D_Factory11getInstanceEv:
//   0x1b7c  pushq   %rbp
//   0x1b7d  movq    %rsp, %rbp
//   0x1b80  subq    $0x20, %rsp
//   0x1b84  leaq    __ZN19OZChannel2D_Factory13_instanceOnceE(%rip), %rax
//   0x1b8b  movq    (%rax), %rax                     ; rax = _instanceOnce
//   0x1b8e  cmpq    $-0x1, %rax                      ; libc++ call_once "done" sentinel
//   0x1b92  je      0x1bb9                           ; if already done -> skip init
//   0x1b94  leaq    -0x1(%rbp), %rax                 ; &(pad byte); lambda has no captures
//   0x1b98  leaq    -0x18(%rbp), %rcx
//   0x1b9c  movq    %rax, (%rcx)                     ; tuple<lambda&&>[0] = &pad
//   0x1b9f  leaq    -0x10(%rbp), %rsi
//   0x1ba3  movq    %rcx, (%rsi)                     ; ctx = &tuple
//   0x1ba6  leaq    __ZN19OZChannel2D_Factory13_instanceOnceE(%rip), %rdi
//   0x1bad  leaq    __ZNSt3__117__call_once_proxy...UlvE_EEEEEvPv(%rip), %rdx
//   0x1bb4  callq   0xacdc8                          ; __stub std::__1::__call_once(flag,ctx,fn)
//   0x1bb9  leaq    __ZN19OZChannel2D_Factory9_instanceE(%rip), %rax
//   0x1bc0  movq    (%rax), %rax                     ; rax = _instance
//   0x1bc3  addq    $0x20, %rsp
//   0x1bc7  popq    %rbp
//   0x1bc8  retq
//   0x1bc9  nop
//
// SEMANTIC SUMMARY
// This is the canonical libc++ std::call_once lazy-singleton entry:
//   - `_instanceOnce` starts at 0. libc++'s __call_once marks it -1 (all-
//     ones) after the first successful run of the passed thunk. On later
//     calls, the `cmpq $-0x1` short-circuits and no work is done.
//   - The thunk (`__call_once_proxy<tuple<lambda&&>>`) is the compiler-
//     synthesized adapter that invokes the getInstance()-local lambda,
//     which allocates the singleton and stores it into `_instance`.
//   - The final two loads return the (now-guaranteed-populated) singleton.
//
// DEPENDENCIES (verified against depgraph):
//   Direct in-scope callees: NONE. `depgraph deps` reports 0 in-scope
//   deps and n_extern_oos=1 — the one extern is the __stub for
//   `__ZNSt3__111__call_onceERVmPvPFvS2_E` (libc++). That is a TRUE out-
//   of-scope extern (libc++ template instantiation), modelled as a
//   boundary stub by policy (per PORTING_SPEC.md).
//
//   The __call_once_proxy thunk is a SEPARATE ledger symbol and is NOT
//   called directly by this function — its address is only PASSED as
//   data to __call_once. So it's not our dependency; it will be its own
//   claim in a later wavefront (currently ready to claim, 0 in-scope deps).

/**
 * `std::__1::__call_once(unsigned long&, void*, void (*)(void*))` —
 * imported stub in ProChannel (`## symbol stub for __ZNSt3__111__call_onceE...`
 * @ProChannel 0xacdc8). libc++ template instantiation, TRUE out-of-scope
 * extern (libc++ runtime, not one of the five FCP frameworks).
 *
 * The libc++ semantics: atomically test-and-set the flag; the first
 * caller runs `fn(ctx)` exactly once, then transitions the flag to the
 * "done" sentinel -1. Subsequent callers (or concurrent losers of the
 * race) block until the flag is -1, then return without running `fn`.
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
 * `OZChannel2D_Factory` — ProChannel factory singleton (partial port).
 *
 * ONLY `getInstance()` is transcribed here. All other members (ctor,
 * dtor, create/createCopy/createChannel/createChannelCopy, description/
 * manufacturer/version/revision, category/icon accessors) are SEPARATE
 * ledger symbols and are the responsibility of separate claims. Do NOT
 * add un-transcribed methods to this class.
 */
export class OZChannel2D_Factory {
  /**
   * `OZChannel2D_Factory::_instance` — program-global singleton pointer.
   * Corresponds to the C++ static `__ZN19OZChannel2D_Factory9_instanceE`
   * loaded via RIP-relative at @0x1bb9. Initialized to null at framework
   * load; written exactly once by the __call_once thunk (which is not
   * part of THIS claim's function body).
   */
  private static _instance: OZChannel2D_Factory | null = null;

  /**
   * `OZChannel2D_Factory::_instanceOnce` — the `std::once_flag` (raw
   * `unsigned long`) that libc++ __call_once flips from 0 to the "done"
   * sentinel -1 after the singleton initializer has run to completion.
   * Corresponds to `__ZN19OZChannel2D_Factory13_instanceOnceE` loaded
   * via RIP-relative at @0x1b84 and @0x1ba6.
   *
   * Modelled here as a small mutable box so we can pass it by reference
   * to the (stubbed) std::__1::__call_once call, matching the C++
   * `unsigned long&` first argument. Initial value 0 (BSS zero-init);
   * after first-run the C++ writes the all-ones sentinel — we mirror
   * by using JS -1.
   */
  private static _instanceOnce: { value: number } = { value: 0 };

  /**
   * `OZChannel2D_Factory::getInstance()` @ProChannel 0x1b7c.
   *
   * Fast-path (@0x1b84–0x1b92): read `_instanceOnce` and short-circuit
   * to the tail load if it equals the libc++ "done" sentinel -1.
   *
   * Slow-path (@0x1b94–0x1bb4): build the libc++ __call_once trampoline
   * (a `tuple<lambda&&>` on the stack whose address is passed as `ctx`)
   * and invoke `std::__1::__call_once(_instanceOnce, ctx,
   * __call_once_proxy<...>)`. The proxy is the compiler-synthesized
   * adapter that unpacks the tuple and invokes the getInstance()-local
   * lambda, which is a SEPARATE ledger symbol responsible for allocating
   * the factory singleton and publishing it into `_instance`.
   *
   * Tail (@0x1bb9–0x1bc8): load `_instance` and return it.
   */
  static getInstance(): OZChannel2D_Factory | null {
    // @0x1b84–0x1b8b: read _instanceOnce.
    const flag = OZChannel2D_Factory._instanceOnce.value;
    // @0x1b8e–0x1b92: `cmpq $-0x1, %rax ; je 0x1bb9`. libc++ "done" == -1.
    if (flag !== -1) {
      // @0x1b94–0x1ba3: allocate the on-stack `tuple<lambda&&>` (ctx).
      //   In the C++, `-0x1(%rbp)` is a single pad byte that the empty
      //   capture-less lambda uses as its "reference" (the lambda has
      //   zero size so a 1-byte placeholder is stored and its address
      //   is taken). We faithfully model the shape here even though the
      //   __call_once stub below never runs its `fn`.
      const pad = { padByte: 0 }; // -0x1(%rbp)
      const tuple: { ref: unknown } = { ref: pad }; // -0x18(%rbp), tuple[0] = &pad
      const ctx: { tup: unknown } = { tup: tuple }; // -0x10(%rbp), ctx = &tuple

      // @0x1ba6–0x1bad: %rdi = &_instanceOnce, %rdx = &__call_once_proxy.
      //   The __call_once_proxy is a SEPARATE ledger symbol and is passed
      //   here purely as a function pointer. It is not our dependency
      //   (we do not invoke it — libc++ __call_once would call it
      //   internally). We pass a placeholder that the stub will not
      //   invoke on any code path.
      const callOnceProxy = (_c: unknown): void => {
        // Body is the (yet-to-be-ported) lambda that constructs the
        // singleton and stores it into `_instance`. NOT part of this claim.
        throw new Error(
          "OZChannel2D_Factory::getInstance()::lambda / __call_once_proxy " +
            "@ProChannel __ZNSt3__117__call_once_proxyB9nqe210106INS_5tuple" +
            "IJOZN19OZChannel2D_Factory11getInstanceEvEUlvE_EEEEEvPv — " +
            "not yet transcribed (separate ledger claim)",
        );
      };

      // @0x1bb4: callq 0xacdc8  ; std::__1::__call_once(flag, ctx, fn).
      //   TRUE out-of-scope extern (libc++). Faithful raising stub —
      //   see std_call_once_stub above.
      std_call_once_stub(
        OZChannel2D_Factory._instanceOnce,
        ctx,
        callOnceProxy,
      );
    }

    // @0x1bb9–0x1bc0: load _instance.
    // @0x1bc3–0x1bc8: epilog + retq.
    return OZChannel2D_Factory._instance;
  }
}
