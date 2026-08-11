// OZChannelColor__OZChannelColor_alpha_zeroImpl — the nested "alpha_zero"
// prototype-singleton class inside OZChannelColor (ProChannel). Only its
// `getInstance()` static accessor is ported in this file; every other method
// (the __call_once init lambda, the ctor, the dtors, the actual
// OZChannelColor_alpha_zero dispatch) is a SEPARATE ledger entry.
//
// Mirrors the landed peers OZChannelColorNoAlpha_greyImpl::getInstance()
// (@ProChannel 0x5797a) and OZChannelCrop_valueImpl::getInstance()
// (@ProChannel 0x59332) — same libc++ std::call_once idiom, same split
// fast/slow path, same anti-cheat model (call_once boundary modelled as the
// libc++ extern it is; the init lambda left as its own ledger unit behind a
// throw that cites the address it defers).
//
// -----------------------------------------------------------------------------
// FILE-NAMING NOTE — read this before "fixing" the name
// -----------------------------------------------------------------------------
// This file follows PORTING_SPEC.md's nested-class rule literally: a nested
// class joins its outer names with a DOUBLE underscore, so
// `OZChannelColor::OZChannelColor_alpha_zeroImpl` becomes
// `OZChannelColor__OZChannelColor_alpha_zeroImpl.ts`.
//
// Be aware that the sibling family already on main does NOT follow that rule:
// `OZChannelColorNoAlpha_greyImpl.ts`, `..._whiteImpl.ts`, `..._gammaImpl.ts`,
// `..._colorSpaceIDImpl.ts`, `..._blueSample1Impl.ts`, `..._redSample1Impl.ts`
// and friends are all equally nested (e.g.
// `__ZN21OZChannelColorNoAlpha30OZChannelColorNoAlpha_greyImpl11getInstanceEv`
// is Outer=OZChannelColorNoAlpha, Inner=OZChannelColorNoAlpha_greyImpl) yet are
// filed under the INNER name alone with a single underscore. So the convention
// and the precedent disagree across ~10 landed files. The spec is followed here
// because it is the written rule; the divergence is flagged rather than
// silently picked either way, since PORTING_SPEC's own rationale is that two
// workers filing one class under `_` and `__` is exactly how main ended up with
// two files modelling one C++ class. This needs a project-level decision — see
// the exit report accompanying this change.
//
// Transcribed from
//   /Applications/Final Cut Pro.app/Contents/Frameworks/ProChannel.framework/
//   Versions/A/ProChannel (x86_64 slice).
//
// One symbol transcribed here:
//   @ProChannel 0x54908
//     OZChannelColor::OZChannelColor_alpha_zeroImpl::getInstance()
//     mangled: __ZN14OZChannelColor29OZChannelColor_alpha_zeroImpl11getInstanceEv
//
// Source disassembly:
//   raw-port/re/disasm/ProChannel.__ZN14OZChannelColor29OZChannelColor_alpha_zeroImpl11getInstanceEv.s
//
// -----------------------------------------------------------------------------
// PROCESS-GLOBAL STORAGE (the two globals getInstance reads)
// -----------------------------------------------------------------------------
//   __ZZN14OZChannelColor29OZChannelColor_alpha_zeroImpl11getInstanceEvE34OZChannelColor_alpha_zeroImpl_once
//     — @ProChannel 0xebd88 (`d`) — the libc++ std::once_flag word (this
//       function-local static's guard). 0 = "not started"; an intermediate
//       value = "another thread is running the init"; -1 (~0UL) = "init
//       completed", which is what libc++ writes on success. The
//       `cmpq $-0x1, %rax` @0x5490f is the standard libc++ fast path.
//
//   __ZN14OZChannelColor29OZChannelColor_alpha_zeroImpl26_OZChannelColor_alpha_zeroE
//     — @ProChannel 0xec4d0 (`S`) — the singleton pointer slot. Read @0x54947
//       as getInstance's return value; WRITTEN only by the init lambda
//       (@0x54985, a separate ledger unit).
//
// -----------------------------------------------------------------------------
// FRONTIER CALLEES (all TRUE OUT-OF-SCOPE externs or SEPARATE ledger units)
// -----------------------------------------------------------------------------
//   * __ZNSt3__111__call_onceERVmPvPFvS2_E
//       — std::__1::__call_once(unsigned long volatile&, void*, void(*)(void*))
//         — libc++. Called @0x5493d via ProChannel stub 0xacdc8. TRUE
//         out-of-scope extern (libc++ runtime), modelled as the shim below.
//
//   * __ZNSt3__117__call_once_proxy<tuple<...getInstance()::'lambda'()&&>>(void*)
//       — @ProChannel 0x5494f. NOT called by getInstance directly — it is
//         PASSED AS A DATA REFERENCE (the function-pointer argument loaded by
//         `leaq ...(%rip), %rdx` @0x54936) to __call_once, which dispatches
//         through it. Its own body is 5 instructions: it double-dereferences
//         the tuple (`movq (%rdi),%rax` @0x54953 ; `movq (%rax),%rdi` @0x54956)
//         and tail-jmps @0x5495a into
//         __ZNSt3__18__invoke<...alpha_zeroImpl::getInstance()::'lambda'()>
//         @0x5495f. SEPARATE ledger entry.
//
//   * the init lambda itself, reached through that __invoke @0x5495f — a
//     SEPARATE ledger entry, and the reason the shim below throws instead of
//     inventing a singleton. Its decoded body is:
//         0x54966  cmpq $0x0, _OZChannelColor_alpha_zero(%rip)  ; already set?
//         0x5496e  jne  0x5498c                                 ; yes -> done
//         0x54970  movl $0x30, %edi                             ; sizeof == 0x30
//         0x54975  callq __Znwm            (stub 0xace4c)       ; operator new
//         0x54980  callq __ZN14OZChannelColor29OZChannelColor_alpha_zeroImplC2Ev
//                                          (@0x549a4)           ; the ctor
//         0x54985  movq %rbx, _OZChannelColor_alpha_zero(%rip)  ; publish
//     with a cleanup path @0x54991 that `__ZdlPv`s (stub 0xace04) if the ctor
//     throws. That ctor @0x549a4 is itself unported, which is why this stays a
//     cited deferral and not a hand-written allocation.
//
// -----------------------------------------------------------------------------
// FULL DISASM (19 lines, the entire function)
// -----------------------------------------------------------------------------
//   __ZN14OZChannelColor29OZChannelColor_alpha_zeroImpl11getInstanceEv:
//     0x54908  movq   ..._alpha_zeroImpl_once(%rip), %rax   ; rax = _once
//     0x5490f  cmpq   $-0x1, %rax                           ; already initialised?
//     0x54913  je     0x54947                               ; fast path -> return
//     0x54915  pushq  %rbp                                  ; frame prologue
//     0x54916  movq   %rsp, %rbp                            ;  (SLOW PATH ONLY)
//     0x54919  subq   $0x20, %rsp                           ; 32-byte local frame
//     0x5491d  leaq   -0x1(%rbp), %rax                      ; rax = &frame[-1]
//                                                           ;  (1-byte lambda storage)
//     0x54921  leaq   -0x18(%rbp), %rcx                     ; rcx = &frame[-0x18]
//                                                           ;  (tuple<T&&> slot)
//     0x54925  movq   %rax, (%rcx)                          ; tuple.head = &lambda-slot
//     0x54928  leaq   -0x10(%rbp), %rsi                     ; rsi = &frame[-0x10]
//                                                           ;  (call_once void* arg)
//     0x5492c  movq   %rcx, (%rsi)                          ; *arg = &tuple
//     0x5492f  leaq   ..._alpha_zeroImpl_once(%rip), %rdi   ; rdi = &_once
//     0x54936  leaq   __call_once_proxy<...>(%rip), %rdx    ; rdx = &proxy (DATA ref)
//     0x5493d  callq  std::__call_once                      ; libc++ stub @0xacdc8
//     0x54942  addq   $0x20, %rsp                           ; frame epilogue
//     0x54946  popq   %rbp
//     0x54947  movq   _OZChannelColor_alpha_zero(%rip), %rax ; rax = the singleton
//     0x5494e  retq
//
// NOTE the shape, which is preserved below: the function has NO prologue on the
// fast path. `je 0x54947` @0x54913 jumps past the `pushq %rbp`/`subq $0x20`
// entirely, straight to the load-and-return at @0x54947, so an
// already-initialised call executes exactly four instructions. The stack frame
// exists only to spill the `tuple<lambda&&>` that libc++'s __call_once expects
// behind a `void*`. Both paths converge on the SAME return instruction, which
// is why the TS below returns the slot once at the end rather than returning
// from inside the branch.

/**
 * `OZChannelColor::OZChannelColor_alpha_zeroImpl` — the nested "alpha_zero"
 * prototype-singleton class inside OZChannelColor. Only its `getInstance()`
 * static accessor is ported in this file; every other method (the __call_once
 * init lambda @0x5495f, the ctor @0x549a4, the dtors @0x54a3e / @0x54a5e and
 * their thunks @0x54a86 / @0x54aa4) is a SEPARATE ledger entry.
 *
 * Downstream code that tries to CALL any instance method on it will hit the
 * not-yet-transcribed frontier at that method's own file.
 */
export class OZChannelColor_alpha_zeroImpl {
  /**
   * `OZChannelColor::OZChannelColor_alpha_zeroImpl::getInstance()`
   *   — @ProChannel 0x54908
   *   — __ZN14OZChannelColor29OZChannelColor_alpha_zeroImpl11getInstanceEv
   *
   * Faithful line-for-line transcription of the 19-line disassembly quoted in
   * the file header. Standard libc++ `std::call_once`-guarded singleton with a
   * split fast/slow path; the fast path @0x54913 skips the frame setup
   * entirely and falls to the shared load-and-return at @0x54947.
   *
   * Returns the singleton POINTER, which is why the type is nullable: before
   * the init lambda has run, the BSS slot at @0xec4d0 is the zero the loader
   * left there, and the machine would return that null just as readily. In
   * practice reaching the return with the slot still null requires the
   * call_once shim to have completed without the lambda publishing — which
   * cannot happen here, because the lambda is a cited deferral that throws.
   */
  static getInstance(): OZChannelColor_alpha_zeroImpl | null {
    // ------------------------------------------------------------
    // @0x54908 — movq _once(%rip), %rax : load the once_flag word.
    // @0x5490f — cmpq $-0x1, %rax       : flags on (rax - (-1)).
    // @0x54913 — je 0x54947             : ZF=1 (rax == -1, init completed)
    //            takes the FAST PATH straight to the return below, skipping
    //            the prologue at @0x54915 altogether.
    // ------------------------------------------------------------
    if (_once !== -1n) {
      // ------------------------------------------------------------
      // @0x54915..0x5492c — SLOW PATH. Build the libc++ `tuple<lambda&&>`
      //   in the 32-byte stack frame: &lambda-slot into the tuple @0x54925,
      //   &tuple into the void* argument slot @0x5492c. This is pure ABI
      //   plumbing with no TS-visible effect — the proxy only needs a stable
      //   `void*` to hand back, and ours ignores it — so it is documented
      //   rather than simulated, exactly as the landed peers do.
      // @0x5492f — leaq _once(%rip), %rdi  : arg 1 = &_once.
      // @0x54936 — leaq proxy(%rip), %rdx  : arg 3 = &__call_once_proxy.
      //            NOTE this is a DATA reference, not a call: the proxy is
      //            invoked by libc++, not from here.
      // @0x5493d — callq std::__call_once  : ProChannel stub 0xacdc8.
      // @0x54942..0x54946 — frame epilogue, then fall through to @0x54947.
      // ------------------------------------------------------------
      std_call_once(
        {
          get: (): bigint => _once, // (mirrors `movq _once(%rip),%rax` @0x54908)
          set: (v: bigint): void => {
            _once = v;
          },
        },
        null, // ABI void* — the real call passes &tuple @0x5492c; our proxy ignores it.
        __call_once_proxy_getInstance_lambda,
      );
    }

    // ------------------------------------------------------------
    // @0x54947 — movq _OZChannelColor_alpha_zero(%rip), %rax
    // @0x5494e — retq
    //   The single shared exit: reached both by the fast-path `je` @0x54913
    //   and by slow-path completion.
    // ------------------------------------------------------------
    return _OZChannelColor_alpha_zero;
  }
}

// ═════════════════════════════════════════════════════════════════════════
// Process-global slots — one 8-byte word each. TS has no linker, so these are
// modelled as module-scope `let`s. Both are zero at image load:
//   _once = 0n   (not started)
//   _OZChannelColor_alpha_zero = null
// ═════════════════════════════════════════════════════════════════════════

/** @ProChannel 0xebd88
 *  `__ZZN14OZChannelColor29OZChannelColor_alpha_zeroImpl11getInstanceEvE34OZChannelColor_alpha_zeroImpl_once`
 *  libc++ std::once_flag word. 0n = not started; -1n = completed.
 *  getInstance compares it against $-1 @0x5490f as its fast-path check
 *  (read site @0x54908). */
let _once: bigint = 0n; // @ProChannel 0xebd88

/** @ProChannel 0xec4d0
 *  `__ZN14OZChannelColor29OZChannelColor_alpha_zeroImpl26_OZChannelColor_alpha_zeroE`
 *  The singleton pointer. Read @0x54947 as getInstance's return value; written
 *  only by the init lambda @0x54985 (a SEPARATE ledger unit). */
let _OZChannelColor_alpha_zero: OZChannelColor_alpha_zeroImpl | null = null; // @ProChannel 0xec4d0

/**
 * `std::__1::__call_once(unsigned long volatile&, void* arg, void(*)(void*))`
 * — libc++. Called from getInstance @0x5493d via ProChannel stub 0xacdc8. A
 * TRUE out-of-scope extern (libc++ runtime), modelled as its single-threaded
 * JS equivalent: if the flag is already the completed sentinel, no-op;
 * otherwise invoke the proxy and, on success, write the completed sentinel.
 * If the proxy throws, the flag is left un-completed and a later call retries
 * — which is libc++'s actual behaviour (it only stores ~0UL after the callable
 * returns normally; an exception propagates and leaves the flag resettable).
 *
 * Mirrors the shim used by the landed peers OZChannelColorNoAlpha_greyImpl and
 * OZChannelCrop_valueImpl — same libc++ runtime function, same model.
 */
function std_call_once(
  once: { get(): bigint; set(v: bigint): void },
  arg: unknown,
  proxy: (arg: unknown) => void,
): void {
  // libc++ fast path: already completed? (mirrors the @0x5490f check)
  if (once.get() === -1n) return;
  proxy(arg);
  once.set(-1n);
}

/**
 * `__ZNSt3__117__call_once_proxy<tuple<...getInstance()::'lambda'()&&>>(void*)`
 * — @ProChannel 0x5494f, a libc++ template instantiation whose 5-instruction
 * body only unwraps the tuple and tail-jmps @0x5495a into
 * `__ZNSt3__18__invoke<...>` @0x5495f, which holds the real init lambda.
 *
 * That lambda is a SEPARATE ledger entry and is NOT transcribed here, so this
 * raises with the exact addresses it defers (PORTING_SPEC Rule 3 / G1's
 * throw-must-cite requirement) rather than fabricating a singleton. Its
 * decoded body allocates 0x30 bytes with `operator new` (`movl $0x30, %edi`
 * @0x54970, `callq __Znwm` stub 0xace4c @0x54975), runs the ctor
 * `__ZN14OZChannelColor29OZChannelColor_alpha_zeroImplC2Ev` @0x549a4 (called
 * @0x54980, status: todo), and publishes the result into
 * `_OZChannelColor_alpha_zero` @0x54985 — guarded by its own
 * already-non-null check @0x54966. Writing that by hand would mean inventing
 * the ctor's 0x30-byte object layout, which is precisely the fabrication the
 * gate exists to stop.
 */
function __call_once_proxy_getInstance_lambda(_arg: unknown): void {
  throw new Error(
    "OZChannelColor::OZChannelColor_alpha_zeroImpl::getInstance() " +
      "__call_once init lambda not yet transcribed — the proxy @ProChannel " +
      "0x5494f tail-jmps @0x5495a into std::__invoke @0x5495f, whose lambda " +
      "body allocates 0x30 bytes via operator new (__Znwm stub 0xace4c, " +
      "called @0x54975) and invokes the ctor " +
      "__ZN14OZChannelColor29OZChannelColor_alpha_zeroImplC2Ev @0x549a4 " +
      "(called @0x54980, SEPARATE ledger entry, status: todo), then stores " +
      "the result into _OZChannelColor_alpha_zero @0x54985. The proxy is " +
      "invoked by std::__call_once, reached from getInstance @0x5493d.",
  );
}
