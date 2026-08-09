// OZChannelColorNoAlpha_greyImpl — the nested "grey" prototype-singleton class
// inside OZChannelColorNoAlpha (ProChannel). Only its `getInstance()` static
// accessor is ported in this file; every other method (the __call_once init
// lambda, the ctor, the actual OZChannelColorNoAlpha_grey dispatch) is a
// SEPARATE ledger entry.
//
// This mirrors the honest peer OZChannelCrop_valueImpl::getInstance()
// (@ProChannel 0x59332) — same libc++ std::call_once idiom, same layout, same
// anti-cheat model (call_once boundary + separate proxy ledger unit).
//
// Transcribed from
//   /Applications/Final Cut Pro.app/Contents/Frameworks/ProChannel.framework/
//   Versions/A/ProChannel (x86_64 fat sub-slice).
//
// One symbol transcribed here:
//   @ProChannel 0x5797a
//     OZChannelColorNoAlpha::OZChannelColorNoAlpha_greyImpl::getInstance()
//     mangled:
//       __ZN21OZChannelColorNoAlpha30OZChannelColorNoAlpha_greyImpl11getInstanceEv
//
// Source disassembly:
//   raw-port/re/disasm/ProChannel.__ZN21OZChannelColorNoAlpha30OZChannelColorNoAlpha_greyImpl11getInstanceEv.s
//
// -----------------------------------------------------------------------------
// PROCESS-GLOBAL STORAGE (the two BSS symbols getInstance reads/writes)
// -----------------------------------------------------------------------------
//   __ZZN21OZChannelColorNoAlpha30OZChannelColorNoAlpha_greyImpl11getInstanceEvE35OZChannelColorNoAlpha_greyImpl_once
//     — the libc++ std::once_flag word (function-local static's guard).
//       0 = "not started"; intermediate = "another thread running init";
//       -1 (~0UL) = "init completed" (libc++ writes ~0UL on completion).
//       The `cmpq $-0x1, %rax` @0x57981 is the standard libc++ fast-path.
//
//   __ZN21OZChannelColorNoAlpha30OZChannelColorNoAlpha_greyImpl27_OZChannelColorNoAlpha_greyE
//     — the singleton value slot. Written by the __call_once lambda; read by
//       getInstance @0x579b9 as its return value.
//
// -----------------------------------------------------------------------------
// FRONTIER CALLEES (all TRUE OUT-OF-SCOPE externs or SEPARATE ledger units)
// -----------------------------------------------------------------------------
//   * __ZNSt3__111__call_onceERVmPvPFvS2_E
//       — std::__1::__call_once(flag&, void*, void(*)(void*)) — libc++.
//         Called @0x579af via ProChannel stub 0xacdc8. TRUE out-of-scope
//         extern (libc++ runtime).
//
//   * __ZNSt3__117__call_once_proxyB9nqe210106<
//         tuple<OZChannelColorNoAlpha::OZChannelColorNoAlpha_greyImpl::getInstance()::'lambda'()&&>>(void*)
//       — libc++ template instantiation. NOT called by getInstance directly —
//         PASSED AS A DATA REFERENCE (function-pointer arg) to __call_once,
//         which then dispatches through it. Confirmed from the proxy disasm
//         (raw-port/re/disasm/ProChannel.__ZNSt3__117__call_once_proxy...greyImpl...s
//         @0x579c1): it tail-jmps into
//         __ZNSt3__18__invokeB9nqe210106<...greyImpl::getInstance()::'lambda'()>
//         which holds the actual operator-new + ctor. SEPARATE ledger entry.
//
// -----------------------------------------------------------------------------
// FULL DISASM (raw-port/re/disasm/ProChannel.__ZN21OZChannelColorNoAlpha30OZChannelColorNoAlpha_greyImpl11getInstanceEv.s)
// -----------------------------------------------------------------------------
//   0x5797a  movq   ...greyImpl_once(%rip), %rax                ; rax = _once
//   0x57981  cmpq   $-0x1, %rax                                 ; already-init?
//   0x57985  je     0x579b9                                     ; fast-path skip
//   0x57987  pushq  %rbp                                        ; frame prologue
//   0x57988  movq   %rsp, %rbp                                  ; (only on slow path)
//   0x5798b  subq   $0x20, %rsp                                 ; 32-byte local frame
//   0x5798f  leaq   -0x1(%rbp), %rax                            ; rax = &frame[-1]
//                                                               ; (1-byte lambda storage)
//   0x57993  leaq   -0x18(%rbp), %rcx                           ; rcx = &frame[-0x18]
//                                                               ; (tuple<T&&> slot)
//   0x57997  movq   %rax, (%rcx)                                ; tuple.head = &lambda-slot
//   0x5799a  leaq   -0x10(%rbp), %rsi                           ; rsi = &frame[-0x10]
//                                                               ; (call_once void* arg)
//   0x5799e  movq   %rcx, (%rsi)                                ; *arg = &tuple
//   0x579a1  leaq   ...greyImpl_once(%rip), %rdi                ; rdi = &_once
//   0x579a8  leaq   __call_once_proxy<...>(%rip), %rdx          ; rdx = &proxy
//   0x579af  callq  std::__call_once                            ; libc++ stub @0xacdc8
//   0x579b4  addq   $0x20, %rsp                                 ; frame epilogue
//   0x579b8  popq   %rbp
//   0x579b9  movq   _OZChannelColorNoAlpha_grey(%rip), %rax     ; rax = _grey (return)
//   0x579c0  retq
//
// NOTE: the fast path (already-init) jumps from 0x57985 straight to 0x579b9 —
// it never even executes the pushq/subq frame setup. The slow path pays for
// the frame only to spill the tuple<lambda&&> that call_once expects on the
// stack. We model both paths identically in TS (single-threaded runtime, no
// ABI stack), but the disasm order is preserved for the reviewer.

/**
 * `OZChannelColorNoAlpha::OZChannelColorNoAlpha_greyImpl` — the nested "grey"
 * prototype-singleton class inside OZChannelColorNoAlpha. Only its
 * `getInstance()` static accessor is ported in this file; every other method
 * (the __call_once init lambda, the ctor, the actual OZChannelColorNoAlpha_grey
 * dispatch) is a SEPARATE ledger entry.
 *
 * Downstream code that tries to CALL any instance method on it will hit the
 * not-yet-transcribed frontier at that method's own file.
 */
export class OZChannelColorNoAlpha_greyImpl {
  /**
   * `OZChannelColorNoAlpha::OZChannelColorNoAlpha_greyImpl::getInstance()`
   *   — @ProChannel 0x5797a
   *   — __ZN21OZChannelColorNoAlpha30OZChannelColorNoAlpha_greyImpl11getInstanceEv
   *
   * Faithful line-for-line transcription of the disassembly quoted in the
   * file header. Standard libc++ std::call_once-guarded singleton with a
   * split fast/slow path (fast path @0x57985..0x579c0 has no stack frame).
   */
  static getInstance(): OZChannelColorNoAlpha_greyImpl | null {
    // ------------------------------------------------------------
    // @0x5797a..0x57981 — rax = _once; compare to $-1.
    // @0x57985          — je 0x579b9 (fast path: already initialised).
    // ------------------------------------------------------------
    if (_once !== -1n) {
      // ------------------------------------------------------------
      // @0x57987..0x5799e — set up libc++ tuple<lambda&&> on the stack
      // (ABI-level, no TS-visible effect — proxy just needs a stable void*).
      // @0x579a1 — rdi = &_once.
      // @0x579a8 — rdx = &__call_once_proxy<...lambda...>.
      // @0x579af — callq std::__call_once (libc++ stub @0xacdc8).
      // ------------------------------------------------------------
      std_call_once(
        {
          get: (): bigint => _once, // (mirrors `movq _once(%rip),%rax` @0x5797a)
          set: (v: bigint): void => {
            _once = v;
          },
        },
        null, // ABI void* — real disasm passes &tuple; our proxy ignores it.
        __call_once_proxy_getInstance_lambda,
      );
    }
    // ------------------------------------------------------------
    // @0x579b9..0x579c0 — rax = _OZChannelColorNoAlpha_grey; retq.
    // (Reached by both fast path and slow-path completion.)
    // ------------------------------------------------------------
    return _OZChannelColorNoAlpha_grey;
  }
}

// ═════════════════════════════════════════════════════════════════════════
// Process-global BSS slots — one 8-byte word each. TS has no linker, so
// model as module-scope `let`s. BSS is zero-filled at load:
//   _once = 0n
//   _grey = null
// ═════════════════════════════════════════════════════════════════════════

/** @ProChannel BSS
 *  `__ZZN21OZChannelColorNoAlpha30OZChannelColorNoAlpha_greyImpl11getInstanceEvE35OZChannelColorNoAlpha_greyImpl_once`
 *  libc++ std::once_flag word. 0n = not started; -1n = completed.
 *  getInstance compares this to $-1 @0x57981 as its fast-path check. */
let _once: bigint = 0n; // @ProChannel BSS 0x5797a read-site

/** @ProChannel BSS
 *  `__ZN21OZChannelColorNoAlpha30OZChannelColorNoAlpha_greyImpl27_OZChannelColorNoAlpha_greyE`
 *  Singleton pointer. Read @0x579b9 (return). Written by the
 *  __call_once_proxy lambda (SEPARATE ledger unit). */
let _OZChannelColorNoAlpha_grey: OZChannelColorNoAlpha_greyImpl | null = null; // @ProChannel BSS 0x579b9

/**
 * `std::__1::__call_once(flag&, void* arg, void(*)(void*))` — libc++.
 * Called from getInstance @0x579af via ProChannel stub 0xacdc8. TRUE
 * out-of-scope extern (libc++ runtime). Modelled as the single-threaded
 * JS equivalent: on first call with a not-yet-completed flag invoke the
 * proxy(arg); on success write $-1 to the flag; on subsequent calls no-op.
 * If the proxy throws, the flag stays un-completed and future calls retry —
 * matching libc++'s ~0UL-on-success semantics.
 *
 * (Mirrors the peer std_call_once used by OZChannelCrop_valueImpl —
 * same libc++ runtime function, same shim.)
 */
function std_call_once(
  once: { get(): bigint; set(v: bigint): void },
  arg: unknown,
  proxy: (arg: unknown) => void,
): void {
  // libc++ fast-path: already completed?
  if (once.get() === -1n) return; // (mirrors 0x57981 fast-path exit)
  proxy(arg);
  once.set(-1n);
}

/**
 * `__ZNSt3__117__call_once_proxy<...>` — libc++ template instantiation.
 * Body dispatches into the getInstance lambda (via std::__invoke — confirmed
 * from the proxy disasm @0x579c1, which tail-jmps into
 * __ZNSt3__18__invoke<...greyImpl::getInstance()::'lambda'()>), which
 * allocates a fresh OZChannelColorNoAlpha_greyImpl via `operator new`,
 * invokes its base ctor, and stores the result into
 * `_OZChannelColorNoAlpha_grey`. SEPARATE ledger entry — raises with the
 * exact call-site @0xADDR so downstream code cannot silently rely on an
 * un-ported singleton.
 */
function __call_once_proxy_getInstance_lambda(_arg: unknown): void {
  throw new Error(
    "OZChannelColorNoAlpha::OZChannelColorNoAlpha_greyImpl::getInstance() " +
      "__call_once init lambda not yet transcribed — the lambda body (reached " +
      "via std::__invoke, ProChannel proxy @0x579c1) allocates via operator " +
      "new (__Znwm ProChannel stub) and invokes the greyImpl ctor (SEPARATE " +
      "ledger entry, status: todo) then stores the result into " +
      "_OZChannelColorNoAlpha_grey. The proxy is invoked from std::__call_once " +
      "at ProChannel 0x579af.",
  );
}

// ═════════════════════════════════════════════════════════════════════════
// The class accessor — see the class definition above; getInstance() is a
// `static` method on OZChannelColorNoAlpha_greyImpl, matching the honest peer
// OZChannelCrop_valueImpl.
// ═════════════════════════════════════════════════════════════════════════
