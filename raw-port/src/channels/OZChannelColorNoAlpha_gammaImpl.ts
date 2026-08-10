// OZChannelColorNoAlpha::OZChannelColorNoAlpha_gammaImpl — ProChannel
// libc++ std::call_once-guarded singleton accessor for the "gamma" impl of
// the OZChannelColorNoAlpha channel.
//
// Transcribed from /Applications/Final Cut Pro.app/Contents/Frameworks/
// ProChannel.framework/Versions/A/ProChannel (x86_64 slice; unadjusted
// VAs from `otool -tV`). Disassembly source:
//   raw-port/re/disasm/ProChannel.__ZN21OZChannelColorNoAlpha31OZChannelColorNoAlpha_gammaImpl11getInstanceEv.s
//
// This unit ports ONLY the `getInstance()` static accessor at @0x5845e.
// Its shape is the standard libc++ std::call_once-guarded singleton —
// identical to OZChannelColorNoAlpha_redSample1Impl::getInstance @0x575d6
// and OZChannelAngleOverRange_Factory::getInstance @0x2404 (both already
// ported). Every other method on this impl is a SEPARATE ledger entry and
// OUT OF SCOPE for this file (one class per file — extend this file later,
// never create a sibling).
//
// -----------------------------------------------------------------------------
// PROCESS-GLOBAL STORAGE (the two symbols getInstance reads/writes)
// -----------------------------------------------------------------------------
//   __ZZN21OZChannelColorNoAlpha31OZChannelColorNoAlpha_gammaImpl11getInstanceEvE36OZChannelColorNoAlpha_gammaImpl_once
//     — the libc++ std::call_once word (`unsigned long`). 0 = not started;
//       intermediate = another thread running init; -1 (~0UL) = complete.
//       The `cmpq $-0x1, %rax` @0x58465 is libc++'s standard fast-path
//       "init done?" check. Function-local static (mangled ZZ...E...E).
//
//   __ZN21OZChannelColorNoAlpha31OZChannelColorNoAlpha_gammaImpl28_OZChannelColorNoAlpha_gammaE
//     — the singleton pointer (an OZChannelColorNoAlpha_gammaImpl*).
//       Written by the lambda std::__call_once invokes; read + returned
//       @0x5849d.
//
// -----------------------------------------------------------------------------
// FRONTIER CALLEES (all TRUE OUT-OF-SCOPE externs or SEPARATE ledger units)
// -----------------------------------------------------------------------------
//   * __ZNSt3__111__call_onceERVmPvPFvS2_E
//       — std::__1::__call_once(flag&, void*, void(*)(void*)) — libc++
//         (libc++.dylib) — TRUE out-of-scope extern. Called @0x58493 via
//         ProChannel stub 0xacdc8 (the same stub every getInstance in
//         ProChannel dispatches through).
//
//   * __ZNSt3__117__call_once_proxyB9nqe210106<
//         tuple<...gammaImpl::getInstance()::'lambda'()&&>>(void*)
//       — libc++ template instantiation. NOT called directly — PASSED AS A
//         DATA REFERENCE (function-pointer arg in %rdx, `leaq` @0x5848c) to
//         __call_once. The proxy body (a SEPARATE ledger entry) is where
//         the singleton is ALLOCATED via `operator new` and constructed,
//         then stored into _OZChannelColorNoAlpha_gamma. getInstance's own
//         frame contains NO `__Znwm`/operator new — the allocation strictly
//         lives inside the proxy. Transitive dependency, not a direct
//         callee.
//
// -----------------------------------------------------------------------------
// Symbols ported here (mangled -> address)
// -----------------------------------------------------------------------------
//   * __ZN21OZChannelColorNoAlpha31OZChannelColorNoAlpha_gammaImpl11getInstanceEv
//       — OZChannelColorNoAlpha::OZChannelColorNoAlpha_gammaImpl::getInstance() @ProChannel 0x5845e
//
// -----------------------------------------------------------------------------
// FULL DISASM (raw-port/re/disasm/ProChannel.__ZN21OZChannelColorNoAlpha31OZChannelColorNoAlpha_gammaImpl11getInstanceEv.s)
// -----------------------------------------------------------------------------
//   0x5845e  movq  _once(%rip), %rax                 ; rax = _..._once
//   0x58465  cmpq  $-0x1, %rax                       ; already-init check (~0UL)
//   0x58469  je    0x5849d                           ; fast path: skip call_once
//   0x5846b  pushq %rbp                              ; frame prologue (slow path only)
//   0x5846c  movq  %rsp, %rbp
//   0x5846f  subq  $0x20, %rsp                       ; 32-byte local frame (tuple<lambda&&>)
//   0x58473  leaq  -0x1(%rbp), %rax                  ; &frame[-1] (captureless lambda slot)
//   0x58477  leaq  -0x18(%rbp), %rcx                 ; &tuple<lambda&&> slot
//   0x5847b  movq  %rax, (%rcx)                      ; tuple.head = &lambda-slot
//   0x5847e  leaq  -0x10(%rbp), %rsi                 ; &__call_once arg (void*)
//   0x58482  movq  %rcx, (%rsi)                      ; *arg = &tuple
//   0x58485  leaq  _once(%rip), %rdi                 ; rdi = &_once
//   0x5848c  leaq  __call_once_proxy<...>(%rip),%rdx ; rdx = &proxy_func
//   0x58493  callq std::__call_once                  ; libc++ stub @0xacdc8
//   0x58498  addq  $0x20, %rsp                       ; frame epilogue
//   0x5849c  popq  %rbp
//   0x5849d  movq  _OZChannelColorNoAlpha_gamma(%rip), %rax  ; rax = singleton ptr (ret; NULL if init raised)
//   0x584a4  retq
// -----------------------------------------------------------------------------

// =====================================================================
// Process-global BSS slots — one 8-byte word each. TS has no linker, so
// modelled as module-scope `let`s; BSS is zero-filled at load.
// =====================================================================

/** @ProChannel BSS
 *  `__ZZN21OZChannelColorNoAlpha31OZChannelColorNoAlpha_gammaImpl11getInstanceEvE36OZChannelColorNoAlpha_gammaImpl_once`.
 *  libc++ std::call_once word. 0n = not started; -1n = complete.
 *  Compared to $-1 @0x58465 (fast-path check). */
let _once: bigint = 0n; // @ProChannel BSS, read @0x5845e

/** @ProChannel BSS
 *  `__ZN21OZChannelColorNoAlpha31OZChannelColorNoAlpha_gammaImpl28_OZChannelColorNoAlpha_gammaE`.
 *  The singleton pointer. Read + returned @0x5849d. Written by the
 *  __call_once_proxy lambda (a SEPARATE ledger unit). */
let _OZChannelColorNoAlpha_gamma: OZChannelColorNoAlpha_gammaImpl | null = null; // @ProChannel BSS 0x5849d

/**
 * `std::__1::__call_once(flag&, void* arg, void(*)(void*))` — libc++
 * (libc++.dylib). Called from getInstance @0x58493 via ProChannel stub
 * 0xacdc8. TRUE out-of-scope extern. No libc++ runtime exists in this
 * port, so we model the "run the initializer exactly once, atomically"
 * contract at the JS single-threaded level: on first call with a
 * non-complete once_flag, invoke proxy(arg) and — IF it completes without
 * throwing — write $-1 into the flag; else no-op. If the proxy throws, the
 * flag stays 0 and future calls retry, exactly like the real runtime. This
 * is the minimum behaviour getInstance's fast-path @0x58465 relies on. */
function std_call_once(
  once: { get(): bigint; set(v: bigint): void },
  arg: unknown,
  proxy: (arg: unknown) => void,
): void {
  if (once.get() === -1n) return; // libc++ fast-path (mirrors 0x58465)
  proxy(arg); // single-threaded model — no atomic CAS
  once.set(-1n); // mark ~0UL on success
}

/**
 * `__ZNSt3__117__call_once_proxy<...>` — libc++ template instantiation for
 * gammaImpl::getInstance()::'lambda'(). Body (a SEPARATE ledger unit)
 * allocates a fresh OZChannelColorNoAlpha_gammaImpl via `operator new`
 * (__Znwm, libc++ extern) and invokes its ctor, then stores the pointer
 * into _OZChannelColorNoAlpha_gamma. That allocation lives INSIDE the
 * proxy — NOT here — so getInstance never does an in-frame `new`. Until
 * the proxy/ctor units are claimed, this raises with the exact frontier
 * call-sites. Invoked from std::__call_once @0x58493 (fn-ptr @0x5848c).
 * This throw is the correct loud gap for a SEPARATE ledger unit, NOT an
 * in-scope callee stub. */
function __call_once_proxy_gamma_lambda(_arg: unknown): void {
  throw new Error(
    "OZChannelColorNoAlpha::OZChannelColorNoAlpha_gammaImpl::getInstance() " +
      "__call_once init lambda not yet transcribed — the lambda body " +
      "allocates via operator new (__Znwm, libc++ extern) then invokes " +
      "the OZChannelColorNoAlpha_gammaImpl ctor (separate ledger unit) and " +
      "stores the result into _OZChannelColorNoAlpha_gamma. This proxy " +
      "lambda is a SEPARATE ledger unit and will be filled in when it is " +
      "next claimed. The proxy is invoked from std::__call_once at " +
      "ProChannel 0x58493.",
  );
}

// =====================================================================
// The class
// =====================================================================

/**
 * `OZChannelColorNoAlpha::OZChannelColorNoAlpha_gammaImpl` — the "gamma"
 * impl for the OZChannelColorNoAlpha channel. Only its getInstance()
 * singleton accessor is ported here; every other method is a separate
 * ledger entry.
 */
export class OZChannelColorNoAlpha_gammaImpl {
  /**
   * `OZChannelColorNoAlpha::OZChannelColorNoAlpha_gammaImpl::getInstance()`
   * — @ProChannel 0x5845e
   * (__ZN21OZChannelColorNoAlpha31OZChannelColorNoAlpha_gammaImpl11getInstanceEv).
   *
   * Faithful transcription of the disassembly in the file header. Standard
   * libc++ std::call_once-guarded singleton:
   *   1. @0x5845e..0x58469 — read the once_flag; if $-1 (init complete),
   *      branch to step 3.
   *   2. @0x5846b..0x58493 — (slow path) marshal the captureless lambda
   *      into libc++'s stack tuple<lambda&&> and call
   *      std::__call_once(&_once, arg, &proxy). The proxy allocates +
   *      constructs the singleton and writes it to
   *      _OZChannelColorNoAlpha_gamma.
   *   3. @0x5849d..0x584a4 — return _OZChannelColorNoAlpha_gamma (or NULL
   *      if the initializer threw).
   *
   * The tuple + captureless-lambda dance @0x58473..0x58482 is a libc++ ABI
   * artefact; std_call_once invokes the proxy directly (single-threaded, no
   * ABI marshaling). Documented for provenance; no observable effect.
   */
  static getInstance(): OZChannelColorNoAlpha_gammaImpl | null {
    // @0x5845e..0x58469 — rax = _once; if (_once == -1) goto 0x5849d.
    if (_once !== -1n) {
      // @0x5846b..0x58482 — prologue + set up libc++ tuple<lambda&&>
      //   (ABI-level; no TS-visible effect — proxy needs a stable void*;
      //   we pass a null placeholder).
      // @0x58485 — rdi = &_once.
      // @0x5848c — rdx = &__call_once_proxy<...lambda...>.
      // @0x58493 — callq std::__call_once (libc++ stub @0xacdc8).
      std_call_once(
        {
          get: (): bigint => _once, // mirrors `movq _once,%rax` @0x5845e
          set: (v: bigint): void => {
            _once = v;
          },
        },
        null, // ABI void* — real disasm passes &tuple; our proxy ignores it.
        __call_once_proxy_gamma_lambda,
      );
    }
    // @0x5849d..0x584a4 — rax = _OZChannelColorNoAlpha_gamma; retq.
    return _OZChannelColorNoAlpha_gamma;
  }
}
