// OZChannelColorNoAlpha::OZChannelColorNoAlpha_redSample1Impl —
// ProChannel static singleton accessor for the "redSample1" sampler impl
// of OZChannelColorNoAlpha.
//
// Transcribed from /Applications/Final Cut Pro.app/Contents/Frameworks/
// ProChannel.framework/Versions/A/ProChannel (x86_64 slice; unadjusted
// VAs from `otool -tV`). Disassembly source:
//   raw-port/re/disasm/ProChannel.__ZN21OZChannelColorNoAlpha36OZChannelColorNoAlpha_redSample1Impl11getInstanceEv.s
//
// This unit ports ONLY the `getInstance()` static accessor at
// @0x575d6. Its shape is the standard libc++ std::call_once-guarded
// singleton — identical to every *_Factory::getInstance in ProChannel
// (compare OZChannelAngleOverRange_Factory @0x2404, already ported). The
// one difference is that the returned/backing global is a *plain static
// pointer symbol* `_OZChannelColorNoAlpha_redSample1` (an
// OZChannelColorNoAlpha_redSample1Impl*), not a `_instance` field — the
// disasm loads it @0x57615 as the return value. Every other method on
// this impl is a separate ledger entry and OUT OF SCOPE for this file
// (per the "one class per file" rule — extend this file later, never
// create a sibling).
//
// -----------------------------------------------------------------------------
// PROCESS-GLOBAL STORAGE (the two symbols getInstance reads/writes)
// -----------------------------------------------------------------------------
//   __ZZN21OZChannelColorNoAlpha36OZChannelColorNoAlpha_redSample1Impl11getInstanceEvE41OZChannelColorNoAlpha_redSample1Impl_once
//     — the libc++ std::once_flag word (an `unsigned long`). 0 = "not
//       started"; intermediate = "another thread running init"; -1 =
//       "init complete" (libc++ writes ~0UL on success). The
//       `cmpq $-0x1, %rax` @0x575dd is the standard libc++ fast-path
//       "init done?" check.
//
//   __ZN21OZChannelColorNoAlpha36OZChannelColorNoAlpha_redSample1Impl33_OZChannelColorNoAlpha_redSample1E
//     — an `OZChannelColorNoAlpha_redSample1Impl*` (the singleton
//       pointer). Written by the lambda that std::__call_once invokes on
//       first call; read @0x57615 as getInstance's return value.
//
// -----------------------------------------------------------------------------
// FRONTIER CALLEES (all TRUE OUT-OF-SCOPE externs / SEPARATE ledger units)
// -----------------------------------------------------------------------------
//   * __ZNSt3__111__call_onceERVmPvPFvS2_E
//       — std::__1::__call_once(flag&, void*, void(*)(void*))
//       — libc++ (libc++.dylib) — TRUE out-of-scope extern. Called
//         @0x5760b via ProChannel stub 0xacdc8 (same stub as every other
//         *_Factory::getInstance in ProChannel).
//
//   * __ZNSt3__117__call_once_proxyB9nqe210106<
//         tuple<...getInstance()::'lambda'()&&>>(void*)
//       — libc++ template instantiation. NOT called directly — it is
//         PASSED AS A DATA REFERENCE (leaq @0x57604, function-pointer
//         arg in %rdx) to __call_once, which dispatches through it. The
//         proxy body (a SEPARATE ledger entry) allocates the singleton
//         via `operator new` and invokes the impl's ctor, storing the
//         result into `_OZChannelColorNoAlpha_redSample1`. It is a
//         TRANSITIVE dependency of getInstance, not a direct callee —
//         getInstance's disasm only names __call_once as a call target;
//         all other refs are `leaq` data references or memory loads.
//
// -----------------------------------------------------------------------------
// Symbols ported here (mangled → address)
// -----------------------------------------------------------------------------
//   * __ZN21OZChannelColorNoAlpha36OZChannelColorNoAlpha_redSample1Impl11getInstanceEv
//       — OZChannelColorNoAlpha::OZChannelColorNoAlpha_redSample1Impl::getInstance()
//         @ProChannel 0x575d6
//
// -----------------------------------------------------------------------------
// FULL DISASM (raw-port/re/disasm/ProChannel.__ZN21OZChannelColorNoAlpha36OZChannelColorNoAlpha_redSample1Impl11getInstanceEv.s)
// -----------------------------------------------------------------------------
//   0x575d6  movq   _..._once(%rip), %rax             ; rax = _once
//   0x575dd  cmpq   $-0x1, %rax                       ; already-init check
//                                                     ; (libc++ writes ~0UL)
//   0x575e1  je     0x57615                           ; fast path: skip call_once
//   0x575e3  pushq  %rbp                              ; frame prologue
//   0x575e4  movq   %rsp, %rbp
//   0x575e7  subq   $0x20, %rsp                       ; 32-byte local frame
//   0x575eb  leaq   -0x1(%rbp), %rax                  ; &frame[-1] (empty
//                                                     ; captureless lambda slot)
//   0x575ef  leaq   -0x18(%rbp), %rcx                 ; &tuple<T&&> slot
//   0x575f3  movq   %rax, (%rcx)                      ; tuple.head = &lambda-slot
//   0x575f6  leaq   -0x10(%rbp), %rsi                 ; &call_once arg (void*)
//   0x575fa  movq   %rcx, (%rsi)                      ; *arg = &tuple
//   0x575fd  leaq   _..._once(%rip), %rdi             ; rdi = &_once
//   0x57604  leaq   __call_once_proxy<...>(%rip), %rdx; rdx = &proxy_func
//   0x5760b  callq  std::__call_once                   ; libc++ stub @0xacdc8
//   0x57610  addq   $0x20, %rsp                       ; epilogue (of the once-block)
//   0x57614  popq   %rbp
//   0x57615  movq   _OZChannelColorNoAlpha_redSample1(%rip), %rax
//                                                     ; rax = the singleton ptr
//                                                     ; (return value; NULL if
//                                                     ; init raised)
//   0x5761c  retq
//
// NOTE ON FRAME SHAPE: unlike the *_Factory variants, the fast-path check
// @0x575dd runs BEFORE the prologue, and the epilogue @0x57610-0x57614
// sits inside the once-block; the fast path (je 0x57615) reaches the
// `movq _OZChannelColorNoAlpha_redSample1` / `retq` tail directly without
// a frame. Observable behaviour is identical to the canonical form: run
// call_once at most once, then return the backing pointer.

// ═════════════════════════════════════════════════════════════════════════
// Process-global BSS slots — one 8-byte word each at fixed linker-assigned
// addresses. Modelled as module-scope `let`s (TS has no linker). Initial
// state mirrors zero-filled BSS at load:
//   _once     = 0n   (libc++ once_flag zero — "not yet initialised")
//   _redSample1 = null (nullptr — no singleton allocated yet)
// ═════════════════════════════════════════════════════════════════════════

/** @ProChannel BSS `__ZZN21OZChannelColorNoAlpha36OZChannelColorNoAlpha_redSample1Impl11getInstanceEvE41OZChannelColorNoAlpha_redSample1Impl_once`.
 *  libc++ std::once_flag word. 0n = not started; 2n/3n = another thread
 *  running init; -1n (0xFFFF_FFFF_FFFF_FFFF) = completed. getInstance
 *  compares this to $-1 @0x575dd as its fast-path check. */
let _once: bigint = 0n; // @ProChannel BSS, read-site 0x575d6

/** @ProChannel BSS `__ZN21OZChannelColorNoAlpha36OZChannelColorNoAlpha_redSample1Impl33_OZChannelColorNoAlpha_redSample1E`.
 *  The singleton pointer. Read @0x57615 (the return value). Written by
 *  the __call_once_proxy lambda (a SEPARATE ledger unit). */
let _redSample1: OZChannelColorNoAlpha_redSample1Impl | null = null; // @ProChannel BSS 0x57615

/**
 * `std::__1::__call_once(flag&, void* arg, void(*)(void*))` — libc++
 * (libc++.dylib). Called from getInstance @0x5760b via ProChannel stub
 * 0xacdc8. TRUE out-of-scope extern (libc++ runtime). No libc++ runtime
 * in this port, so we model the "run the initializer exactly once,
 * atomically" contract at the JS single-threaded level: on first call
 * with a zero once_flag, invoke proxy(arg) and — IF it completes without
 * throwing — write $-1 into the flag; on subsequent calls no-op. If the
 * proxy throws, the flag stays 0 (libc++'s ~0UL-on-success write is
 * skipped) and future calls retry, exactly like the real runtime. This
 * is the minimum behaviour getInstance's fast-path @0x575dd `cmp $-1`
 * relies on. */
function std_call_once(
  once: { get(): bigint; set(v: bigint): void },
  arg: unknown,
  proxy: (arg: unknown) => void,
): void {
  if (once.get() === -1n) return; // libc++ fast-path (mirrors 0x575dd)
  proxy(arg); // single-threaded: run initializer directly
  once.set(-1n); // mark ~0UL on success
}

/**
 * `__ZNSt3__117__call_once_proxy<...>` — libc++ template instantiation
 * for this getInstance's captureless lambda. Body (a SEPARATE ledger
 * unit) allocates a fresh OZChannelColorNoAlpha_redSample1Impl via
 * `operator new` and invokes its ctor, then stores the pointer into
 * `_OZChannelColorNoAlpha_redSample1`. That allocation lives INSIDE the
 * proxy — NOT here — so getInstance never does an in-frame `new`. Until
 * the proxy/ctor units are claimed, this raises with the exact frontier
 * call-sites documented. Invoked from std::__call_once @0x5760b. */
function __call_once_proxy_redSample1_lambda(_arg: unknown): void {
  throw new Error(
    "OZChannelColorNoAlpha_redSample1Impl::getInstance() __call_once " +
      "init lambda not yet transcribed — the lambda body allocates via " +
      "operator new (libc++ extern) then invokes the " +
      "OZChannelColorNoAlpha_redSample1Impl ctor (separate ledger unit — " +
      "not yet ported) and stores the result into " +
      "_OZChannelColorNoAlpha_redSample1. This proxy lambda is a SEPARATE " +
      "ledger unit and will be filled in when it is next claimed. The " +
      "proxy is invoked from std::__call_once at ProChannel 0x5760b.",
  );
}

// ═════════════════════════════════════════════════════════════════════════
// The class
// ═════════════════════════════════════════════════════════════════════════

/**
 * `OZChannelColorNoAlpha::OZChannelColorNoAlpha_redSample1Impl` — the
 * "redSample1" sampler impl nested in OZChannelColorNoAlpha. Only its
 * getInstance() static accessor is ported here; every other method is a
 * separate ledger entry.
 */
export class OZChannelColorNoAlpha_redSample1Impl {
  /**
   * `OZChannelColorNoAlpha_redSample1Impl::getInstance()` —
   * @ProChannel 0x575d6
   * (__ZN21OZChannelColorNoAlpha36OZChannelColorNoAlpha_redSample1Impl11getInstanceEv).
   *
   * Faithful transcription of the disassembly in the file header.
   * Standard libc++ std::call_once-guarded singleton accessor:
   *
   *   1. @0x575d6-0x575dd — read the once_flag; if it equals $-1 (~0UL,
   *      libc++'s "init complete" sentinel) @0x575e1 jump straight to the
   *      return tail (0x57615).
   *   2. @0x575e3-0x5760b — (in the not-yet-init branch) set up the
   *      libc++ tuple<lambda&&> on the stack and call
   *      std::__call_once(&_once, arg, &proxy). The proxy unpacks the
   *      tuple, invokes the lambda, which allocates + constructs the
   *      singleton and writes it to _OZChannelColorNoAlpha_redSample1.
   *   3. @0x57615-0x5761c — return _OZChannelColorNoAlpha_redSample1
   *      (whatever the initializer wrote — or NULL if it threw).
   *
   * The stack tuple + captureless-lambda dance @0x575eb-0x575fa is an
   * ABI artefact of libc++'s __call_once template; the caller doesn't
   * observe the intermediate slots, so std_call_once (above) invokes the
   * proxy directly (single-threaded, no ABI marshaling). Documented for
   * provenance; no observable effect.
   */
  static getInstance(): OZChannelColorNoAlpha_redSample1Impl | null {
    // @0x575d6-0x575e1 — if (_once == -1) goto return-tail (0x57615).
    if (_once !== -1n) {
      // @0x575e3-0x575fa — prologue + set up libc++ tuple<lambda&&>
      // (ABI-level, no TS-visible effect; the proxy just needs a stable
      // void* to dispatch through — we pass a null placeholder).
      // @0x575fd — rdi = &_once.
      // @0x57604 — rdx = &__call_once_proxy<...lambda...>.
      // @0x5760b — callq std::__call_once (libc++ stub @0xacdc8).
      // @0x57610-0x57614 — epilogue of the once-block.
      std_call_once(
        {
          get: (): bigint => _once, // mirrors `movq (%rax),%rax` @0x575d6 read
          set: (v: bigint): void => {
            _once = v;
          },
        },
        null, // ABI void* — real disasm passes &tuple; our proxy ignores it.
        __call_once_proxy_redSample1_lambda,
      );
    }
    // @0x57615-0x5761c — rax = _OZChannelColorNoAlpha_redSample1; retq.
    return _redSample1;
  }
}
