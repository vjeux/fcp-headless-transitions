// OZChannelColorNoAlpha::OZChannelColorNoAlpha_colorSpaceIDImpl —
// ProChannel call_once-guarded singleton accessor for the "colorSpaceID"
// impl of the OZChannelColorNoAlpha channel.
//
// Transcribed from /Applications/Final Cut Pro.app/Contents/Frameworks/
// ProChannel.framework/Versions/A/ProChannel (x86_64 slice; unadjusted
// VAs from `otool -tV`). Disassembly source:
//   raw-port/re/disasm/ProChannel.__ZN21OZChannelColorNoAlpha38OZChannelColorNoAlpha_colorSpaceIDImpl11getInstanceEv.s
//
// Ports ONLY the `getInstance()` static singleton accessor @0x5862c. Its
// shape is IDENTICAL to every other libc++ std::call_once-guarded
// singleton in ProChannel (compare the siblings
// OZChannelColorNoAlpha_redSample1Impl @0x575d6 and
// OZChannelColorNoAlpha_gammaImpl @0x5845e, both already ported): read the
// once_flag; if it is $-1 (init complete) skip; else marshal the
// captureless lambda into a stack tuple and dispatch through
// std::__call_once with __call_once_proxy; finally read + return the
// process-global singleton pointer. Every other method on this impl is a
// SEPARATE ledger entry, OUT OF SCOPE for this file (one class per file;
// extend later, do not create a sibling).
//
// -----------------------------------------------------------------------------
// PROCESS-GLOBAL STORAGE
// -----------------------------------------------------------------------------
//   __ZZN21OZChannelColorNoAlpha38OZChannelColorNoAlpha_colorSpaceIDImpl11getInstanceEvE43OZChannelColorNoAlpha_colorSpaceIDImpl_once
//     — libc++ std::call_once word (`unsigned long`). 0 = not started;
//       intermediate = another thread running init; -1 (~0UL) = complete.
//       `cmpq $-0x1, %rax` @0x58633 is libc++'s "init done" fast-path.
//   __ZN21OZChannelColorNoAlpha38OZChannelColorNoAlpha_colorSpaceIDImpl35_OZChannelColorNoAlpha_colorSpaceIDE
//     — the singleton pointer (an OZChannelColorNoAlpha_colorSpaceIDImpl*).
//       Written by the __call_once lambda; read + returned @0x5866b.
//
// -----------------------------------------------------------------------------
// FRONTIER CALLEES (all TRUE OUT-OF-SCOPE externs / SEPARATE ledger units)
// -----------------------------------------------------------------------------
//   * __ZNSt3__111__call_onceERVmPvPFvS2_E — std::__1::__call_once — libc++
//     extern. Called @0x58661 via ProChannel stub 0xacdc8 (the SAME stub
//     as every other getInstance in ProChannel).
//   * __ZNSt3__117__call_once_proxy<tuple<...colorSpaceIDImpl::getInstance()::'lambda'()&&>>(void*)
//     — libc++ template instantiation. NOT called directly — PASSED AS A
//       DATA REFERENCE (`leaq ...,%rdx` @0x5865a). The proxy body (a
//       SEPARATE ledger entry) ALLOCATES the singleton via `operator new`
//       and invokes its ctor, then stores it into
//       _OZChannelColorNoAlpha_colorSpaceID. getInstance's own frame
//       contains NO `__Znwm`/operator new — the allocation lives strictly
//       inside the proxy. TRANSITIVE dependency, not a direct callee.
//
// -----------------------------------------------------------------------------
// Symbols ported here (mangled -> address)
// -----------------------------------------------------------------------------
//   * __ZN21OZChannelColorNoAlpha38OZChannelColorNoAlpha_colorSpaceIDImpl11getInstanceEv
//       — OZChannelColorNoAlpha::OZChannelColorNoAlpha_colorSpaceIDImpl::getInstance() @ProChannel 0x5862c
//
// -----------------------------------------------------------------------------
// FULL DISASM (raw-port/re/disasm/ProChannel.__ZN21OZChannelColorNoAlpha38OZChannelColorNoAlpha_colorSpaceIDImpl11getInstanceEv.s)
// -----------------------------------------------------------------------------
//   0x5862c  movq  _once(%rip), %rax                  ; rax = _..._once
//   0x58633  cmpq  $-0x1, %rax                        ; already-init check (~0UL on completion)
//   0x58637  je    0x5866b                            ; fast path: skip call_once
//   0x58639  pushq %rbp                               ; slow-path frame prologue
//   0x5863a  movq  %rsp, %rbp
//   0x5863d  subq  $0x20, %rsp                        ; 32-byte local frame (tuple<lambda&&>)
//   0x58641  leaq  -0x1(%rbp), %rax                   ; &frame[-1] (captureless lambda slot)
//   0x58645  leaq  -0x18(%rbp), %rcx                  ; &tuple<lambda&&> slot
//   0x58649  movq  %rax, (%rcx)                       ; tuple.head = &lambda-slot
//   0x5864c  leaq  -0x10(%rbp), %rsi                  ; &__call_once arg (void*)
//   0x58650  movq  %rcx, (%rsi)                       ; *arg = &tuple
//   0x58653  leaq  _once(%rip), %rdi                  ; rdi = &_..._once
//   0x5865a  leaq  __call_once_proxy<...>(%rip), %rdx ; rdx = &proxy_func
//   0x58661  callq std::__call_once                   ; libc++ stub @0xacdc8
//   0x58666  addq  $0x20, %rsp                        ; epilogue
//   0x5866a  popq  %rbp
//   0x5866b  movq  _OZChannelColorNoAlpha_colorSpaceID(%rip), %rax ; rax = singleton ptr (return; NULL if init raised)
//   0x58672  retq
// -----------------------------------------------------------------------------

// =====================================================================
// Process-global BSS slots (zero-filled at load; TS has no linker, so
// module-scope `let`s):
//   _once = 0n ; _OZChannelColorNoAlpha_colorSpaceID = null
// =====================================================================

/** @ProChannel BSS
 *  `__ZZN21OZChannelColorNoAlpha38OZChannelColorNoAlpha_colorSpaceIDImpl11getInstanceEvE43OZChannelColorNoAlpha_colorSpaceIDImpl_once`.
 *  libc++ std::call_once word. 0n = not started; -1n = complete.
 *  Compared to $-1 @0x58633. */
let _once: bigint = 0n; // @ProChannel BSS, read @0x5862c

/** @ProChannel BSS
 *  `__ZN21OZChannelColorNoAlpha38OZChannelColorNoAlpha_colorSpaceIDImpl35_OZChannelColorNoAlpha_colorSpaceIDE`.
 *  The singleton pointer. Read + returned @0x5866b. Written by the
 *  __call_once_proxy lambda (a SEPARATE ledger unit). */
let _OZChannelColorNoAlpha_colorSpaceID: OZChannelColorNoAlpha_colorSpaceIDImpl | null = null; // @ProChannel BSS 0x5866b

/**
 * `std::__1::__call_once(flag&, void* arg, void(*)(void*))` — libc++
 * extern. Called from getInstance @0x58661 via ProChannel stub 0xacdc8.
 * No libc++ runtime in this port; we model the "run the initializer
 * exactly once, atomically" contract single-threaded: on first call with
 * a non-complete flag, invoke proxy(arg) and — IF it completes without
 * throwing — write $-1; on subsequent calls no-op. If the proxy throws,
 * the flag stays 0 and future calls retry, exactly like the real runtime.
 * This is the minimum behaviour the fast-path @0x58633 `cmp $-1` relies
 * on. */
function std_call_once(
  once: { get(): bigint; set(v: bigint): void },
  arg: unknown,
  proxy: (arg: unknown) => void,
): void {
  if (once.get() === -1n) return; // libc++ fast-path (mirrors 0x58633)
  proxy(arg); // single-threaded: run initializer directly
  once.set(-1n); // mark ~0UL on success
}

/**
 * `__ZNSt3__117__call_once_proxy<...>` — libc++ template instantiation for
 * OZChannelColorNoAlpha_colorSpaceIDImpl::getInstance()::'lambda'(). Body
 * (a SEPARATE ledger unit) allocates a fresh
 * OZChannelColorNoAlpha_colorSpaceIDImpl via `operator new` (__Znwm,
 * libc++ extern) and invokes its ctor, then stores the pointer into
 * `_OZChannelColorNoAlpha_colorSpaceID`. Neither the ctor nor operator new
 * are ported here (separate units), so this proxy stub raises with the
 * exact frontier call-sites. Invoked from std::__call_once @0x58661
 * (fn-ptr taken @0x5865a). This throw is the correct loud gap for a
 * SEPARATE ledger unit — NOT an in-scope callee stub (getInstance's own
 * frame contains no operator new). */
function __call_once_proxy_getInstance_lambda(_arg: unknown): void {
  throw new Error(
    "OZChannelColorNoAlpha::OZChannelColorNoAlpha_colorSpaceIDImpl::" +
      "getInstance() __call_once init lambda not yet transcribed — the " +
      "lambda body allocates via operator new (__Znwm, libc++ extern) " +
      "then invokes the OZChannelColorNoAlpha_colorSpaceIDImpl ctor " +
      "(separate ledger unit) and stores the result into " +
      "_OZChannelColorNoAlpha_colorSpaceID. This proxy lambda is a " +
      "SEPARATE ledger unit and will be filled in when it is next " +
      "claimed. The proxy is invoked from std::__call_once at " +
      "ProChannel 0x58661.",
  );
}

// =====================================================================
// The class
// =====================================================================

/**
 * `OZChannelColorNoAlpha::OZChannelColorNoAlpha_colorSpaceIDImpl` — the
 * "colorSpaceID" impl for the OZChannelColorNoAlpha channel. Only its
 * getInstance() singleton accessor is ported here; every other method is
 * a separate ledger entry.
 */
export class OZChannelColorNoAlpha_colorSpaceIDImpl {
  /**
   * `OZChannelColorNoAlpha::OZChannelColorNoAlpha_colorSpaceIDImpl::getInstance()`
   * — @ProChannel 0x5862c
   * (__ZN21OZChannelColorNoAlpha38OZChannelColorNoAlpha_colorSpaceIDImpl11getInstanceEv).
   *
   * Faithful transcription of the header disasm. Standard libc++
   * std::call_once-guarded singleton:
   *   1. @0x5862c..0x58637 — read once_flag; if $-1 goto 0x5866b.
   *   2. @0x58639..0x58661 — (slow path) marshal the captureless lambda
   *      into libc++'s stack tuple<lambda&&> and call
   *      std::__call_once(&_once, arg, &proxy); the proxy allocates +
   *      constructs the singleton and writes
   *      _OZChannelColorNoAlpha_colorSpaceID.
   *   3. @0x5866b..0x58672 — return _OZChannelColorNoAlpha_colorSpaceID
   *      (or NULL if the initializer threw).
   * The stack tuple + captureless-lambda dance @0x58641..0x58650 is an
   * ABI artefact; std_call_once invokes the proxy directly (documented
   * for provenance, no observable effect).
   */
  static getInstance(): OZChannelColorNoAlpha_colorSpaceIDImpl | null {
    // @0x5862c..0x58637 — rax = _once; if (_once == -1) goto 0x5866b.
    if (_once !== -1n) {
      // @0x58639..0x58650 — set up libc++ tuple<lambda&&> (ABI-level, no
      //   TS-visible effect; null placeholder for the proxy's void*).
      // @0x58653 — rdi = &_once.
      // @0x5865a — rdx = &__call_once_proxy<...lambda...>.
      // @0x58661 — callq std::__call_once (libc++ stub @0xacdc8).
      std_call_once(
        {
          get: (): bigint => _once, // mirrors `movq _once,%rax` @0x5862c
          set: (v: bigint): void => {
            _once = v;
          },
        },
        null, // ABI void* — real disasm passes &tuple; proxy ignores it.
        __call_once_proxy_getInstance_lambda,
      );
    }
    // @0x5866b..0x58672 — rax = _OZChannelColorNoAlpha_colorSpaceID; retq.
    return _OZChannelColorNoAlpha_colorSpaceID;
  }
}
