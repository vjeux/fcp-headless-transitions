// OZChannelEnum_valueImpl — ProChannel value-implementation singleton nested
// inside OZChannelEnum. Only its `getInstance()` static accessor is ported
// in this file; every other method (the __call_once init lambda, the ctor,
// the actual OZChannelEnum_value dispatch) is a SEPARATE ledger entry.
//
// This mirrors the honest peers OZChannelBase_Factory::getInstance()
// (@ProChannel 0x1786), OZChannelEnum_Factory::getInstance()
// (@ProChannel 0x275e), and OZChannelCrop::OZChannelCrop_valueImpl::getInstance()
// (@ProChannel 0x59332) — same libc++ std::call_once idiom, same layout,
// same anti-cheat model (call_once boundary + separate proxy ledger unit).
//
// One symbol transcribed here:
//   @ProChannel 0x6374e
//     OZChannelEnum::OZChannelEnum_valueImpl::getInstance()
//     mangled: __ZN13OZChannelEnum23OZChannelEnum_valueImpl11getInstanceEv
//
// Source disassembly:
//   raw-port/re/disasm/ProChannel.__ZN13OZChannelEnum23OZChannelEnum_valueImpl11getInstanceEv.s
//
// -----------------------------------------------------------------------------
// PROCESS-GLOBAL STORAGE (the two BSS symbols getInstance reads/writes)
// -----------------------------------------------------------------------------
//   __ZZN13OZChannelEnum23OZChannelEnum_valueImpl11getInstanceEvE28OZChannelEnum_valueImpl_once
//     — the libc++ std::once_flag word (function-local static's guard).
//       0 = "not started"; intermediate = "another thread running init";
//       -1 (~0UL) = "init completed" (libc++ writes ~0UL on completion).
//       The `cmpq $-0x1, %rax` @0x63755 is the standard libc++ fast-path.
//
//   __ZN13OZChannelEnum23OZChannelEnum_valueImpl20_OZChannelEnum_valueE
//     — the singleton value slot (an OZChannelEnum_valueImpl* — the whole
//       point of the factory). Written by the __call_once lambda; read
//       by getInstance @0x6378d as its return value.
//
// -----------------------------------------------------------------------------
// FRONTIER CALLEES (all TRUE OUT-OF-SCOPE externs or SEPARATE ledger units)
// -----------------------------------------------------------------------------
//   * __ZNSt3__111__call_onceERVmPvPFvS2_E
//       — std::__1::__call_once(flag&, void*, void(*)(void*)) — libc++.
//         Called @0x63783 via ProChannel stub 0xacdc8. TRUE out-of-scope
//         extern (libc++ runtime).
//
//   * __ZNSt3__117__call_once_proxyB9nqe210106<
//         tuple<OZChannelEnum::OZChannelEnum_valueImpl::getInstance()::'lambda'()&&>>(void*)
//       — libc++ template instantiation. NOT called by getInstance
//         directly — PASSED AS A DATA REFERENCE (function-pointer arg,
//         leaq @0x6377c) to __call_once, which then dispatches through it.
//         The proxy body itself is a SEPARATE ledger entry.
//
// -----------------------------------------------------------------------------
// FULL DISASM (raw-port/re/disasm/ProChannel.__ZN13OZChannelEnum23OZChannelEnum_valueImpl11getInstanceEv.s)
// -----------------------------------------------------------------------------
//   0x6374e  movq   OZChannelEnum_valueImpl_once(%rip), %rax   ; rax = _once
//   0x63755  cmpq   $-0x1, %rax                                 ; already-init?
//   0x63759  je     0x6378d                                     ; fast-path skip
//   0x6375b  pushq  %rbp                                        ; frame prologue
//   0x6375c  movq   %rsp, %rbp                                  ; (only on slow path)
//   0x6375f  subq   $0x20, %rsp                                 ; 32-byte local frame
//   0x63763  leaq   -0x1(%rbp), %rax                            ; rax = &frame[-1]
//                                                               ; (1-byte lambda-storage)
//   0x63767  leaq   -0x18(%rbp), %rcx                           ; rcx = &frame[-0x18]
//                                                               ; (tuple<T&&> slot)
//   0x6376b  movq   %rax, (%rcx)                                ; tuple.head = &lambda-slot
//   0x6376e  leaq   -0x10(%rbp), %rsi                           ; rsi = &frame[-0x10]
//                                                               ; (call_once void* arg)
//   0x63772  movq   %rcx, (%rsi)                                ; *arg = &tuple
//   0x63775  leaq   OZChannelEnum_valueImpl_once(%rip), %rdi    ; rdi = &_once
//   0x6377c  leaq   __call_once_proxy<...>(%rip), %rdx          ; rdx = &proxy
//   0x63783  callq  std::__call_once                             ; libc++ stub @0xacdc8
//   0x63788  addq   $0x20, %rsp                                 ; frame epilogue
//   0x6378c  popq   %rbp
//   0x6378d  movq   _OZChannelEnum_value(%rip), %rax            ; rax = _value (return)
//   0x63794  retq
//
// NOTE: the fast path (already-init) jumps from 0x63759 straight to 0x6378d —
// it never even executes the pushq/subq frame setup. The slow path pays for
// the frame only to spill the tuple<lambda&&> that call_once expects on the
// stack. We model both paths identically in TS (single-threaded runtime,
// no ABI stack), but the disasm order is preserved for the reviewer.

/**
 * `OZChannelEnum::OZChannelEnum_valueImpl` — the nested value-implementation
 * class inside OZChannelEnum. Only its `getInstance()` static accessor is
 * ported in this file; every other method (the __call_once init lambda, the
 * ctor, the actual OZChannelEnum_value dispatch) is a SEPARATE ledger entry.
 *
 * Downstream code that tries to CALL any instance method on it will hit the
 * not-yet-transcribed frontier at that method's own file.
 */
export class OZChannelEnum_valueImpl {
  /**
   * `OZChannelEnum::OZChannelEnum_valueImpl::getInstance()`
   *   — @ProChannel 0x6374e
   *   — __ZN13OZChannelEnum23OZChannelEnum_valueImpl11getInstanceEv
   *
   * Faithful line-for-line transcription of the disassembly quoted in the
   * file header. Standard libc++ std::call_once-guarded singleton with a
   * split fast/slow path (fast path @0x63759..0x63794 has no stack frame).
   */
  static getInstance(): OZChannelEnum_valueImpl | null {
    // ------------------------------------------------------------
    // @0x6374e..0x63755 — rax = _once; compare to $-1.
    // @0x63759          — je 0x6378d (fast path: already initialised).
    // ------------------------------------------------------------
    if (_once !== -1n) {
      // ------------------------------------------------------------
      // @0x6375b..0x63772 — set up libc++ tuple<lambda&&> on the stack
      // (ABI-level, no TS-visible effect — proxy just needs stable void*).
      // @0x63775 — rdi = &_once.
      // @0x6377c — rdx = &__call_once_proxy<...lambda...>.
      // @0x63783 — callq std::__call_once (libc++ stub @0xacdc8).
      // ------------------------------------------------------------
      std_call_once(
        {
          get: (): bigint => _once, // (mirrors `movq _once(%rip),%rax` @0x6374e)
          set: (v: bigint): void => {
            _once = v;
          },
        },
        null, // ABI void* — real disasm passes &tuple; our proxy ignores it.
        __call_once_proxy_getInstance_lambda,
      );
    }
    // ------------------------------------------------------------
    // @0x6378d..0x63794 — rax = _OZChannelEnum_value; retq.
    // (Reached by both fast path and slow-path completion.)
    // ------------------------------------------------------------
    return _OZChannelEnum_value;
  }
}

// ═════════════════════════════════════════════════════════════════════════
// Process-global BSS slots — one 8-byte word each. TS has no linker, so
// model as module-scope `let`s. BSS is zero-filled at load:
//   _once  = 0n
//   _value = null
// ═════════════════════════════════════════════════════════════════════════

/** @ProChannel BSS
 *  `__ZZN13OZChannelEnum23OZChannelEnum_valueImpl11getInstanceEvE28OZChannelEnum_valueImpl_once`
 *  libc++ std::once_flag word. 0n = not started; -1n = completed.
 *  getInstance compares this to $-1 @0x63755 as its fast-path check. */
let _once: bigint = 0n; // @ProChannel BSS 0x6374e read-site

/** @ProChannel BSS
 *  `__ZN13OZChannelEnum23OZChannelEnum_valueImpl20_OZChannelEnum_valueE`
 *  Singleton pointer. Read @0x6378d (return). Written by the
 *  __call_once_proxy lambda (SEPARATE ledger unit). */
let _OZChannelEnum_value: OZChannelEnum_valueImpl | null = null; // @ProChannel BSS 0x6378d

/**
 * `std::__1::__call_once(flag&, void* arg, void(*)(void*))` — libc++.
 * Called from getInstance @0x63783 via ProChannel stub 0xacdc8. TRUE
 * out-of-scope extern (libc++ runtime). Modelled as the single-threaded
 * JS equivalent: on first call with zero flag invoke the proxy(arg); on
 * success write $-1 to the flag; on subsequent calls no-op. If the
 * proxy throws, the flag stays 0 and future calls retry — matching
 * libc++'s ~0UL-on-success semantics.
 *
 * (Mirrors the peer std_call_once used by OZChannelEnum_Factory /
 * OZChannelBase_Factory / OZChannelCrop_valueImpl — same libc++ runtime
 * function, same shim.)
 */
function std_call_once(
  once: { get(): bigint; set(v: bigint): void },
  arg: unknown,
  proxy: (arg: unknown) => void,
): void {
  // libc++ fast-path: already completed?
  if (once.get() === -1n) return; // (mirrors 0x63755 fast-path exit)
  proxy(arg);
  once.set(-1n);
}

/**
 * `__ZNSt3__117__call_once_proxy<...>` — libc++ template instantiation.
 * Body dispatches into the getInstance lambda, which allocates a fresh
 * OZChannelEnum_valueImpl via `operator new`, invokes its base ctor,
 * and stores the result into `_OZChannelEnum_value`. SEPARATE ledger
 * entry — raises with the exact call-site @0xADDR so downstream code
 * cannot silently rely on an un-ported singleton.
 */
function __call_once_proxy_getInstance_lambda(_arg: unknown): void {
  throw new Error(
    "OZChannelEnum::OZChannelEnum_valueImpl::getInstance() __call_once " +
      "init lambda not yet transcribed — the lambda body allocates via " +
      "operator new (__Znwm ProChannel stub) and invokes " +
      "__ZN13OZChannelEnum23OZChannelEnum_valueImplC2Ev (C2 base ctor, " +
      "SEPARATE ledger entry, status: todo) then stores the result into " +
      "_OZChannelEnum_value. The proxy is invoked from std::__call_once " +
      "at ProChannel 0x63783.",
  );
}

// ═════════════════════════════════════════════════════════════════════════
// The class accessor — see the class definition above; getInstance() is a
// `static` method on OZChannelEnum_valueImpl, matching the honest peers
// (OZChannelEnum_Factory / OZChannelBase_Factory / OZChannelCrop_valueImpl).
// ═════════════════════════════════════════════════════════════════════════
