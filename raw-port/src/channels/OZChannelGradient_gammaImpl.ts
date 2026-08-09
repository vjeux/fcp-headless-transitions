// OZChannelGradient::OZChannelGradient_gammaImpl — ProChannel
// call_once-guarded singleton accessor for the "gamma" impl of the
// OZChannelGradient channel.
//
// Transcribed from /Applications/Final Cut Pro.app/Contents/Frameworks/
// ProChannel.framework/Versions/A/ProChannel (x86_64 slice; unadjusted
// VAs from `otool -tV`). Disassembly source:
//   raw-port/re/disasm/ProChannel.__ZN17OZChannelGradient27OZChannelGradient_gammaImpl11getInstanceEv.s
//
// Ports ONLY the `getInstance()` static singleton accessor @0x69eea. Its
// shape is IDENTICAL to every other libc++ std::call_once-guarded
// singleton in ProChannel (compare the OZChannelColorNoAlpha_gammaImpl
// @0x5845e sibling, already ported): read the once_flag; if it is $-1
// (init complete) skip; else marshal the captureless lambda into a stack
// tuple and dispatch through std::__call_once with __call_once_proxy;
// finally read + return the process-global singleton pointer. Every other
// method on this impl is a SEPARATE ledger entry, OUT OF SCOPE for this
// file (one class per file; extend later, do not create a sibling).
//
// -----------------------------------------------------------------------------
// PROCESS-GLOBAL STORAGE
// -----------------------------------------------------------------------------
//   __ZZN17OZChannelGradient27OZChannelGradient_gammaImpl11getInstanceEvE32OZChannelGradient_gammaImpl_once
//     — libc++ std::call_once word (`unsigned long`). 0 = not started;
//       intermediate = another thread running init; -1 (~0UL) = complete.
//       `cmpq $-0x1, %rax` @0x69ef1 is libc++'s "init done" fast-path.
//   __ZN17OZChannelGradient27OZChannelGradient_gammaImpl24_OZChannelGradient_gammaE
//     — the singleton pointer (an OZChannelGradient_gammaImpl*).
//       Written by the __call_once lambda; read + returned @0x69f29.
//
// -----------------------------------------------------------------------------
// FRONTIER CALLEES (all TRUE OUT-OF-SCOPE externs / SEPARATE ledger units)
// -----------------------------------------------------------------------------
//   * __ZNSt3__111__call_onceERVmPvPFvS2_E — std::__1::__call_once — libc++
//     extern. Called @0x69f1f via ProChannel stub 0xacdc8 (the SAME stub
//     as every other getInstance in ProChannel).
//   * __ZNSt3__117__call_once_proxy<tuple<...gammaImpl::getInstance()::'lambda'()&&>>(void*)
//     — libc++ template instantiation. NOT called directly — PASSED AS A
//       DATA REFERENCE (`leaq ...,%rdx` @0x69f18). The proxy body (a
//       SEPARATE ledger entry) ALLOCATES the singleton via `operator new`
//       and invokes its ctor, then stores it into _OZChannelGradient_gamma.
//       getInstance's own frame contains NO `__Znwm`/operator new — the
//       allocation lives strictly inside the proxy. TRANSITIVE dependency,
//       not a direct callee.
//
// -----------------------------------------------------------------------------
// Symbols ported here (mangled -> address)
// -----------------------------------------------------------------------------
//   * __ZN17OZChannelGradient27OZChannelGradient_gammaImpl11getInstanceEv
//       — OZChannelGradient::OZChannelGradient_gammaImpl::getInstance() @ProChannel 0x69eea
//
// -----------------------------------------------------------------------------
// FULL DISASM (raw-port/re/disasm/ProChannel.__ZN17OZChannelGradient27OZChannelGradient_gammaImpl11getInstanceEv.s)
// -----------------------------------------------------------------------------
//   0x69eea  movq  _once(%rip), %rax                  ; rax = _..._once
//   0x69ef1  cmpq  $-0x1, %rax                        ; already-init check (~0UL on completion)
//   0x69ef5  je    0x69f29                            ; fast path: skip call_once
//   0x69ef7  pushq %rbp                               ; slow-path frame prologue
//   0x69ef8  movq  %rsp, %rbp
//   0x69efb  subq  $0x20, %rsp                        ; 32-byte local frame (tuple<lambda&&>)
//   0x69eff  leaq  -0x1(%rbp), %rax                   ; &frame[-1] (captureless lambda slot)
//   0x69f03  leaq  -0x18(%rbp), %rcx                  ; &tuple<lambda&&> slot
//   0x69f07  movq  %rax, (%rcx)                       ; tuple.head = &lambda-slot
//   0x69f0a  leaq  -0x10(%rbp), %rsi                  ; &__call_once arg (void*)
//   0x69f0e  movq  %rcx, (%rsi)                       ; *arg = &tuple
//   0x69f11  leaq  _once(%rip), %rdi                  ; rdi = &_..._once
//   0x69f18  leaq  __call_once_proxy<...>(%rip), %rdx ; rdx = &proxy_func
//   0x69f1f  callq std::__call_once                   ; libc++ stub @0xacdc8
//   0x69f24  addq  $0x20, %rsp                        ; epilogue
//   0x69f28  popq  %rbp
//   0x69f29  movq  _OZChannelGradient_gamma(%rip), %rax ; rax = singleton ptr (return; NULL if init raised)
//   0x69f30  retq
// -----------------------------------------------------------------------------

// =====================================================================
// Process-global BSS slots (zero-filled at load; TS has no linker, so
// module-scope `let`s):
//   _once = 0n ; _OZChannelGradient_gamma = null
// =====================================================================

/** @ProChannel BSS
 *  `__ZZN17OZChannelGradient27OZChannelGradient_gammaImpl11getInstanceEvE32OZChannelGradient_gammaImpl_once`.
 *  libc++ std::call_once word. 0n = not started; -1n = complete.
 *  Compared to $-1 @0x69ef1. */
let _once: bigint = 0n; // @ProChannel BSS, read @0x69eea

/** @ProChannel BSS
 *  `__ZN17OZChannelGradient27OZChannelGradient_gammaImpl24_OZChannelGradient_gammaE`.
 *  The singleton pointer. Read + returned @0x69f29. Written by the
 *  __call_once_proxy lambda (a SEPARATE ledger unit). */
let _OZChannelGradient_gamma: OZChannelGradient_gammaImpl | null = null; // @ProChannel BSS 0x69f29

/**
 * `std::__1::__call_once(flag&, void* arg, void(*)(void*))` — libc++
 * extern. Called from getInstance @0x69f1f via ProChannel stub 0xacdc8.
 * No libc++ runtime in this port; we model the "run the initializer
 * exactly once, atomically" contract single-threaded: on first call with
 * a non-complete flag, invoke proxy(arg) and — IF it completes without
 * throwing — write $-1; on subsequent calls no-op. If the proxy throws,
 * the flag stays 0 and future calls retry, exactly like the real runtime.
 * This is the minimum behaviour the fast-path @0x69ef1 `cmp $-1` relies
 * on. */
function std_call_once(
  once: { get(): bigint; set(v: bigint): void },
  arg: unknown,
  proxy: (arg: unknown) => void,
): void {
  if (once.get() === -1n) return; // libc++ fast-path (mirrors 0x69ef1)
  proxy(arg); // single-threaded: run initializer directly
  once.set(-1n); // mark ~0UL on success
}

/**
 * `__ZNSt3__117__call_once_proxy<...>` — libc++ template instantiation for
 * OZChannelGradient_gammaImpl::getInstance()::'lambda'(). Body (a SEPARATE
 * ledger unit) allocates a fresh OZChannelGradient_gammaImpl via `operator
 * new` (__Znwm, libc++ extern) and invokes its ctor, then stores the
 * pointer into `_OZChannelGradient_gamma`. Neither the ctor nor operator
 * new are ported here (separate units), so this proxy stub raises with the
 * exact frontier call-sites. Invoked from std::__call_once @0x69f1f
 * (fn-ptr taken @0x69f18). This throw is the correct loud gap for a
 * SEPARATE ledger unit — NOT an in-scope callee stub (getInstance's own
 * frame contains no operator new). */
function __call_once_proxy_getInstance_lambda(_arg: unknown): void {
  throw new Error(
    "OZChannelGradient::OZChannelGradient_gammaImpl::getInstance() " +
      "__call_once init lambda not yet transcribed — the lambda body " +
      "allocates via operator new (__Znwm, libc++ extern) then invokes " +
      "the OZChannelGradient_gammaImpl ctor (separate ledger unit) and " +
      "stores the result into _OZChannelGradient_gamma. This proxy lambda " +
      "is a SEPARATE ledger unit and will be filled in when it is next " +
      "claimed. The proxy is invoked from std::__call_once at " +
      "ProChannel 0x69f1f.",
  );
}

// =====================================================================
// The class
// =====================================================================

/**
 * `OZChannelGradient::OZChannelGradient_gammaImpl` — the "gamma" impl for
 * the OZChannelGradient channel. Only its getInstance() singleton
 * accessor is ported here; every other method is a separate ledger entry.
 */
export class OZChannelGradient_gammaImpl {
  /**
   * `OZChannelGradient::OZChannelGradient_gammaImpl::getInstance()`
   * — @ProChannel 0x69eea
   * (__ZN17OZChannelGradient27OZChannelGradient_gammaImpl11getInstanceEv).
   *
   * Faithful transcription of the header disasm. Standard libc++
   * std::call_once-guarded singleton:
   *   1. @0x69eea..0x69ef5 — read once_flag; if $-1 goto 0x69f29.
   *   2. @0x69ef7..0x69f1f — (slow path) marshal the captureless lambda
   *      into libc++'s stack tuple<lambda&&> and call
   *      std::__call_once(&_once, arg, &proxy); the proxy allocates +
   *      constructs the singleton and writes _OZChannelGradient_gamma.
   *   3. @0x69f29..0x69f30 — return _OZChannelGradient_gamma (or NULL if
   *      the initializer threw).
   * The stack tuple + captureless-lambda dance @0x69eff..0x69f0e is an
   * ABI artefact; std_call_once invokes the proxy directly (documented
   * for provenance, no observable effect).
   */
  static getInstance(): OZChannelGradient_gammaImpl | null {
    // @0x69eea..0x69ef5 — rax = _once; if (_once == -1) goto 0x69f29.
    if (_once !== -1n) {
      // @0x69ef7..0x69f0e — set up libc++ tuple<lambda&&> (ABI-level, no
      //   TS-visible effect; null placeholder for the proxy's void*).
      // @0x69f11 — rdi = &_once.
      // @0x69f18 — rdx = &__call_once_proxy<...lambda...>.
      // @0x69f1f — callq std::__call_once (libc++ stub @0xacdc8).
      std_call_once(
        {
          get: (): bigint => _once, // mirrors `movq _once,%rax` @0x69eea
          set: (v: bigint): void => {
            _once = v;
          },
        },
        null, // ABI void* — real disasm passes &tuple; proxy ignores it.
        __call_once_proxy_getInstance_lambda,
      );
    }
    // @0x69f29..0x69f30 — rax = _OZChannelGradient_gamma; retq.
    return _OZChannelGradient_gamma;
  }
}
