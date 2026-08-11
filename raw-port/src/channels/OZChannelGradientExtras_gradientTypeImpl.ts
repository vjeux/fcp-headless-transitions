// OZChannelGradientExtras::OZChannelGradientExtras_gradientTypeImpl —
// ProChannel call_once-guarded singleton accessor for the "gradientType"
// impl of the OZChannelGradientExtras channel.
//
// Transcribed from /Applications/Final Cut Pro.app/Contents/Frameworks/
// ProChannel.framework/Versions/A/ProChannel (x86_64 slice; unadjusted
// VAs from `otool -tV`). Disassembly source:
//   raw-port/re/disasm/ProChannel.__ZN23OZChannelGradientExtras40OZChannelGradientExtras_gradientTypeImpl11getInstanceEv.s
//
// Ports ONLY the `getInstance()` static singleton accessor @0x6aeac. Its
// shape is the standard libc++ std::call_once-guarded singleton found
// throughout ProChannel — compare the already-landed siblings
// OZChannelGradient_gammaImpl @0x69eea and OZChannelColorNoAlpha_gammaImpl
// @0x5845e, which this file follows instruction-for-instruction in
// structure: read the once_flag; if it is $-1 (init complete) skip
// straight to the load; else marshal the captureless lambda into a stack
// tuple and dispatch through std::__call_once with __call_once_proxy;
// finally read + return the process-global singleton pointer. Every other
// method on this impl (C2 @0x6af48, D1 @0x6afe0, D0 @0x6b000, the two
// thunks @0x6b028/@0x6b046) is a SEPARATE ledger entry and OUT OF SCOPE
// for this file — one class per file; extend this file later, do not
// create a sibling.
//
// FILE NAMING. The C++ class is nested (`Outer::Outer_xImpl`), and its
// INNER name is already outer-qualified, so the file is named for the
// class it contains — `OZChannelGradientExtras_gradientTypeImpl.ts` —
// exactly as the landed same-family units `OZChannelGradient_gammaImpl.ts`
// and `OZChannelColorNoAlpha_gammaImpl.ts` are. PORTING_SPEC's
// `Outer__Inner` double-underscore rule exists to stop one class being
// filed twice under two spellings; here the double-underscore form would
// repeat the outer name (`OZChannelGradientExtras__OZChannelGradientExtras_
// gradientTypeImpl.ts`) and split this family across two conventions,
// which is the same hazard from the other side. Checked before writing:
// no file matching `*gradientTypeImpl*` exists on origin/main under any
// case (APFS is case-insensitive, so a case-variant would silently
// overwrite).
//
// -----------------------------------------------------------------------------
// PROCESS-GLOBAL STORAGE (the two symbols getInstance reads)
// -----------------------------------------------------------------------------
//   __ZZN23OZChannelGradientExtras40OZChannelGradientExtras_gradientTypeImpl11getInstanceEvE45OZChannelGradientExtras_gradientTypeImpl_once
//     — libc++ std::call_once word (`unsigned long`), a FUNCTION-LOCAL
//       static of getInstance (note the `__ZZ...E...` local-entity
//       mangling). 0 = not started; intermediate values = another thread
//       is running init; -1 (~0UL) = complete. The `cmpq $-0x1, %rax`
//       @0x6aeb3 is libc++'s "init done" fast-path test.
//   __ZN23OZChannelGradientExtras40OZChannelGradientExtras_gradientTypeImpl37_OZChannelGradientExtras_gradientTypeE
//     — the singleton pointer (an OZChannelGradientExtras_gradientTypeImpl*),
//       a static data member of the impl class. Read + returned @0x6aeeb;
//       written by the __call_once lambda (separate ledger unit).
//
// -----------------------------------------------------------------------------
// FRONTIER CALLEES (all TRUE OUT-OF-SCOPE externs / SEPARATE ledger units)
// -----------------------------------------------------------------------------
//   * __ZNSt3__111__call_onceERVmPvPFvS2_E — std::__1::__call_once(flag&,
//     void*, void(*)(void*)) — libc++ extern (libc++.dylib). The ONLY
//     `callq` in this function's body: @0x6aee1 via ProChannel stub
//     0xacdc8 (the same stub every other ProChannel getInstance uses).
//   * __ZNSt3__117__call_once_proxy[abi:nqe210106]<tuple<...
//     gradientTypeImpl::getInstance()::'lambda'()&&>>(void*) @0x6aef3 —
//     libc++ template instantiation. NOT called by getInstance: it is
//     PASSED AS A DATA REFERENCE (`leaq …,%rdx` @0x6aeda) for
//     __call_once to dispatch through. A TRANSITIVE dependency, not a
//     direct callee, and a SEPARATE ledger unit. Its body was read (not
//     ported) to establish exactly that, and to name what it does:
//         0x6aef3  pushq %rbp / movq %rsp,%rbp
//         0x6aef7  movq  (%rdi),%rax          ; rax = *arg (tuple.head)
//         0x6aefa  movq  (%rax),%rdi          ; rdi = the lambda object
//         0x6aefd  popq  %rbp
//         0x6aefe  jmp   __invoke<…lambda…>   ; @0x6af03
//     and __invoke @0x6af03 in turn:
//         0x6af0a  cmpq  $0x0, _OZChannelGradientExtras_gradientType(%rip)
//         0x6af12  jne   0x6af30              ; already allocated -> done
//         0x6af14  movl  $0x30, %edi          ; sizeof == 0x30
//         0x6af19  callq __Znwm               ; operator new, stub 0xace4c
//         0x6af24  callq __ZN23…gradientTypeImplC2Ev   ; ctor @0x6af48
//         0x6af29  movq  %rbx, _OZChannelGradientExtras_gradientType(%rip)
//     with a cleanup path at 0x6af35 (__ZdlPv stub 0xace04, then
//     __Unwind_Resume stub 0xacaf2). NONE of that is transcribed here —
//     getInstance's own frame contains no `__Znwm` and no ctor call.
//
// -----------------------------------------------------------------------------
// Symbols ported here (mangled -> address)
// -----------------------------------------------------------------------------
//   * __ZN23OZChannelGradientExtras40OZChannelGradientExtras_gradientTypeImpl11getInstanceEv
//       — OZChannelGradientExtras::OZChannelGradientExtras_gradientTypeImpl::getInstance()
//         @ProChannel 0x6aeac
//
// -----------------------------------------------------------------------------
// FULL DISASM (19 lines; raw-port/re/disasm/ProChannel.__ZN23OZChannelGradientExtras40OZChannelGradientExtras_gradientTypeImpl11getInstanceEv.s)
// -----------------------------------------------------------------------------
//   0x6aeac  movq  _once(%rip), %rax                  ; rax = …_gradientTypeImpl_once
//   0x6aeb3  cmpq  $-0x1, %rax                        ; already-init check (~0UL on completion)
//   0x6aeb7  je    0x6aeeb                            ; FAST PATH: skip the frame entirely
//   0x6aeb9  pushq %rbp                               ; slow-path frame prologue
//   0x6aeba  movq  %rsp, %rbp
//   0x6aebd  subq  $0x20, %rsp                        ; 32-byte local frame (tuple<lambda&&>)
//   0x6aec1  leaq  -0x1(%rbp), %rax                   ; &frame[-1] (captureless lambda's 1-byte slot)
//   0x6aec5  leaq  -0x18(%rbp), %rcx                  ; &tuple<lambda&&> slot
//   0x6aec9  movq  %rax, (%rcx)                       ; tuple.head = &lambda-slot
//   0x6aecc  leaq  -0x10(%rbp), %rsi                  ; &__call_once arg (void*)
//   0x6aed0  movq  %rcx, (%rsi)                       ; *arg = &tuple
//   0x6aed3  leaq  _once(%rip), %rdi                  ; rdi = &…_gradientTypeImpl_once
//   0x6aeda  leaq  __call_once_proxy<…>(%rip), %rdx   ; rdx = &proxy_func (DATA ref, not a call)
//   0x6aee1  callq std::__call_once                   ; libc++ stub @0xacdc8
//   0x6aee6  addq  $0x20, %rsp                        ; epilogue
//   0x6aeea  popq  %rbp
//   0x6aeeb  movq  _OZChannelGradientExtras_gradientType(%rip), %rax  ; return value (NULL if init raised)
//   0x6aef2  retq
//
// Worth one line because it differs from the OZChannelGradient_gammaImpl
// sibling only in placement and is easy to mis-transcribe: the once-flag
// load and test happen BEFORE the prologue, so the FAST PATH executes no
// prologue and no epilogue — `je 0x6aeeb` jumps past `popq %rbp` to the
// bare load+ret. Nothing observable differs from the sibling's ordering
// (both return the same global either way); the control flow below is
// written to match THIS function's, not the sibling's.
// -----------------------------------------------------------------------------

// =====================================================================
// Process-global BSS slots — one 8-byte word each at fixed
// linker-assigned addresses. TS has no linker, so they are module-scope
// `let`s, initialised to the zero-filled-at-load state:
//   _once = 0n ; _OZChannelGradientExtras_gradientType = null
// =====================================================================

/** @ProChannel BSS
 *  `__ZZN23OZChannelGradientExtras40OZChannelGradientExtras_gradientTypeImpl11getInstanceEvE45OZChannelGradientExtras_gradientTypeImpl_once`.
 *  libc++ std::call_once word (function-local static of getInstance).
 *  0n = not started; -1n (~0UL) = complete. Read @0x6aeac, compared to
 *  $-1 @0x6aeb3, and its address is taken @0x6aed3. */
let _once: bigint = 0n; // @ProChannel BSS, read @0x6aeac

/** @ProChannel BSS
 *  `__ZN23OZChannelGradientExtras40OZChannelGradientExtras_gradientTypeImpl37_OZChannelGradientExtras_gradientTypeE`.
 *  The singleton pointer. Read + returned @0x6aeeb. Written by the
 *  __call_once proxy lambda (@0x6af29, a SEPARATE ledger unit). */
let _OZChannelGradientExtras_gradientType: OZChannelGradientExtras_gradientTypeImpl | null =
  null; // @ProChannel BSS 0x6aeeb

/**
 * `std::__1::__call_once(flag&, void* arg, void(*)(void*))` — libc++
 * extern. Called from getInstance @0x6aee1 via ProChannel stub 0xacdc8.
 * There is no libc++ runtime in this port, so we model the "run the
 * initializer exactly once, atomically" contract at the JS
 * single-threaded level: on first call with a non-complete flag, invoke
 * proxy(arg) and — IF it completes without throwing — write $-1; on
 * subsequent calls no-op. If the proxy throws, the flag stays 0 (libc++'s
 * ~0UL-on-success write is skipped) and future calls retry, exactly like
 * the real runtime. This is the minimum behaviour the fast-path
 * @0x6aeb3 `cmp $-1` relies on. */
function std_call_once(
  once: { get(): bigint; set(v: bigint): void },
  arg: unknown,
  proxy: (arg: unknown) => void,
): void {
  if (once.get() === -1n) return; // libc++ fast-path (mirrors 0x6aeb3)
  proxy(arg); // single-threaded: run the initializer directly
  once.set(-1n); // mark ~0UL on success
}

/**
 * `__ZNSt3__117__call_once_proxy[abi:nqe210106]<…>` @ProChannel 0x6aef3 —
 * the libc++ template instantiation getInstance hands to __call_once as a
 * function pointer (@0x6aeda). Its body tail-jumps to __invoke @0x6af03,
 * which checks `_OZChannelGradientExtras_gradientType` for null @0x6af0a,
 * allocates 0x30 bytes via `operator new` (__Znwm, stub 0xace4c) @0x6af19,
 * invokes the ctor
 * `__ZN23OZChannelGradientExtras40OZChannelGradientExtras_gradientTypeImplC2Ev`
 * @0x6af48 (ledger status: not ported) @0x6af24, and stores the pointer
 * @0x6af29.
 *
 * NONE of that is transcribed here: the proxy, __invoke and the ctor are
 * each SEPARATE ledger units, and getInstance's own frame contains no
 * `__Znwm` and no ctor call — the only `callq` in it is __call_once. So
 * this is the loud gap PORTING_SPEC rule 3 asks for at a frontier, citing
 * every address it defers, and NOT an in-scope callee stub: nothing this
 * unit was handed is being faked. Reaching it requires a first call, which
 * is exactly where the real binary would enter the un-ported lambda. */
function __call_once_proxy_getInstance_lambda(_arg: unknown): void {
  throw new Error(
    "OZChannelGradientExtras::OZChannelGradientExtras_gradientTypeImpl::" +
      "getInstance() __call_once init lambda not yet transcribed — the " +
      "proxy @ProChannel 0x6aef3 tail-jumps to __invoke @ProChannel " +
      "0x6af03, which allocates 0x30 bytes via operator new (__Znwm, " +
      "stub 0xace4c) @0x6af19, invokes " +
      "__ZN23OZChannelGradientExtras40OZChannelGradientExtras_gradientTypeImplC2Ev " +
      "@ProChannel 0x6af48 (separate ledger unit, not ported) @0x6af24, " +
      "and stores the result into _OZChannelGradientExtras_gradientType " +
      "@0x6af29. The proxy is invoked from std::__call_once at " +
      "ProChannel 0x6aee1 (its address is taken @0x6aeda).",
  );
}

// =====================================================================
// The class
// =====================================================================

/**
 * `OZChannelGradientExtras::OZChannelGradientExtras_gradientTypeImpl` —
 * the "gradientType" impl for the OZChannelGradientExtras channel. Only
 * its getInstance() singleton accessor is ported in this file; every
 * other method on the class is a separate ledger entry.
 */
export class OZChannelGradientExtras_gradientTypeImpl {
  /**
   * `OZChannelGradientExtras::OZChannelGradientExtras_gradientTypeImpl::getInstance()`
   * — @ProChannel 0x6aeac
   * (__ZN23OZChannelGradientExtras40OZChannelGradientExtras_gradientTypeImpl11getInstanceEv).
   *
   * Line-for-line transcription of the 19-instruction body quoted in the
   * file header:
   *
   *   1. @0x6aeac..0x6aeb7 — load the once_flag and, if it equals $-1
   *      (~0UL, libc++'s "init complete" sentinel), jump straight to the
   *      load at 0x6aeeb, skipping the frame entirely.
   *   2. @0x6aeb9..0x6aee1 — build the stack tuple libc++'s __call_once
   *      ABI expects (two-level indirection: `arg` -> `tuple.head` ->
   *      the captureless lambda's 1-byte storage) and call
   *      std::__call_once(&_once, arg, &proxy).
   *   3. @0x6aeeb..0x6aef2 — load and return the singleton pointer —
   *      whatever the initializer wrote, or NULL if it never got there.
   *
   * The stack-tuple dance @0x6aec1..0x6aed0 is an ABI artefact of the
   * __call_once template instantiation: the callee only ever dereferences
   * it back to the lambda, and no caller observes the slots. Our
   * std_call_once invokes the proxy directly (single-threaded, no ABI
   * marshalling), so the slots are documented above for provenance and a
   * null placeholder is passed for the `void* arg`. Nothing else in the
   * body is elided.
   */
  static getInstance(): OZChannelGradientExtras_gradientTypeImpl | null {
    // ------------------------------------------------------------
    // @0x6aeac  movq _once(%rip), %rax
    // @0x6aeb3  cmpq $-0x1, %rax
    // @0x6aeb7  je   0x6aeeb        ; fast path -> the load, no frame
    // ------------------------------------------------------------
    if (_once !== -1n) {
      // ----------------------------------------------------------
      // @0x6aeb9..0x6aebd — prologue + 0x20-byte local frame.
      // @0x6aec1..0x6aed0 — tuple<lambda&&> marshalling (ABI-only).
      // @0x6aed3          — rdi = &_once.
      // @0x6aeda          — rdx = &__call_once_proxy<…> (ProChannel
      //                     0x6aef3) — a DATA reference, not a call.
      // @0x6aee1          — callq std::__call_once (libc++ stub 0xacdc8).
      // @0x6aee6..0x6aeea — epilogue.
      // ----------------------------------------------------------
      std_call_once(
        {
          get: (): bigint => _once, // mirrors the load @0x6aeac
          set: (v: bigint): void => {
            _once = v;
          },
        },
        null, // ABI void* — the binary passes &tuple; our proxy ignores it
        __call_once_proxy_getInstance_lambda,
      );
    }
    // ------------------------------------------------------------
    // @0x6aeeb  movq _OZChannelGradientExtras_gradientType(%rip), %rax
    // @0x6aef2  retq
    // ------------------------------------------------------------
    return _OZChannelGradientExtras_gradientType;
  }
}
