// OZChannelAngle_Factory — ProChannel factory singleton for OZChannelAngle.
//
// Transcribed from /Applications/Final Cut Pro.app/Contents/Frameworks/
// ProChannel.framework/Versions/A/ProChannel (x86_64 slice). Disassembly:
//   raw-port/re/disasm/ProChannel.__ZN22OZChannelAngle_Factory11getInstanceEv.s
//
// This unit ports ONLY the `getInstance()` static singleton accessor at
// @0x190c. The remaining methods on this factory are separate ledger
// entries and are OUT OF SCOPE for this file (they will be appended to
// this same class file when their own ledger entries are claimed — per
// the "one class per file" rule).
//
// This mirrors the honest peers OZChannelBase_Factory::getInstance()
// (@ProChannel 0x1786) and OZChannelEnum_Factory::getInstance()
// (@ProChannel 0x275e) — the same libc++ std::call_once singleton idiom
// emitted for every OZChannel*_Factory class.
//
// -----------------------------------------------------------------------------
// PROCESS-GLOBAL STORAGE (the two BSS symbols getInstance reads/writes)
// -----------------------------------------------------------------------------
//   __ZN22OZChannelAngle_Factory13_instanceOnceE
//     — the libc++ std::once_flag word. 0 = "not started"; intermediate
//       = "another thread running init"; -1 (~0UL) = "init completed"
//       (libc++ writes ~0UL on completion). The `cmpq $-0x1, %rax`
//       @0x191e is the standard libc++ fast-path check.
//
//   __ZN22OZChannelAngle_Factory9_instanceE
//     — an `OZChannelAngle_Factory*` (singleton pointer). Written by the
//       lambda that std::__call_once invokes; read by getInstance @0x1949.
//
// -----------------------------------------------------------------------------
// FRONTIER CALLEES (all TRUE OUT-OF-SCOPE externs or SEPARATE ledger units)
// -----------------------------------------------------------------------------
//   * __ZNSt3__111__call_onceERVmPvPFvS2_E
//       — std::__1::__call_once(flag&, void*, void(*)(void*)) — libc++.
//         Called @0x1944 via ProChannel stub 0xacdc8. TRUE out-of-scope
//         extern (libc++ runtime).
//
//   * __ZNSt3__117__call_once_proxyB9nqe210106<
//         tuple<OZChannelAngle_Factory::getInstance()::'lambda'()&&>>(void*)
//       — libc++ template instantiation. NOT called by getInstance
//         directly — PASSED AS A DATA REFERENCE (function-pointer arg)
//         to __call_once, which then dispatches through it. The proxy
//         body itself is a SEPARATE ledger entry.
//
// -----------------------------------------------------------------------------
// Symbols ported here (mangled → address)
// -----------------------------------------------------------------------------
//   * __ZN22OZChannelAngle_Factory11getInstanceEv
//       — OZChannelAngle_Factory::getInstance() @ProChannel 0x190c
//
// -----------------------------------------------------------------------------
// FULL DISASM (raw-port/re/disasm/ProChannel.__ZN22OZChannelAngle_Factory11getInstanceEv.s)
// -----------------------------------------------------------------------------
//   0x190c  pushq  %rbp                              ; frame prologue
//   0x190d  movq   %rsp, %rbp
//   0x1910  subq   $0x20, %rsp                       ; 32-byte local frame
//   0x1914  leaq   _instanceOnce(%rip), %rax         ; rax = &_instanceOnce
//   0x191b  movq   (%rax), %rax                      ; rax = _instanceOnce
//   0x191e  cmpq   $-0x1, %rax                       ; already-init check
//   0x1922  je     0x1949                            ; fast-path skip call_once
//   0x1924  leaq   -0x1(%rbp), %rax                  ; rax = &frame[-1]
//                                                    ; (1-byte lambda-storage slot)
//   0x1928  leaq   -0x18(%rbp), %rcx                 ; rcx = &frame[-0x18]
//                                                    ; (tuple<T&&> slot)
//   0x192c  movq   %rax, (%rcx)                      ; tuple.head = &lambda-slot
//   0x192f  leaq   -0x10(%rbp), %rsi                 ; rsi = &frame[-0x10]
//                                                    ; (call_once's void* arg)
//   0x1933  movq   %rcx, (%rsi)                      ; *arg = &tuple
//   0x1936  leaq   _instanceOnce(%rip), %rdi         ; rdi = &_instanceOnce
//   0x193d  leaq   __call_once_proxy<...>(%rip), %rdx; rdx = &proxy_func
//   0x1944  callq  std::__call_once                   ; libc++ stub @0xacdc8
//   0x1949  leaq   _instance(%rip), %rax             ; rax = &_instance
//   0x1950  movq   (%rax), %rax                      ; rax = _instance (return)
//   0x1953  addq   $0x20, %rsp                       ; frame epilogue
//   0x1957  popq   %rbp
//   0x1958  retq

// ═════════════════════════════════════════════════════════════════════════
// Process-global BSS slots — one 8-byte word each. TS has no linker, so
// model as module-scope `let`s. BSS is zero-filled at load:
//   _instanceOnce = 0n
//   _instance     = null
// ═════════════════════════════════════════════════════════════════════════

/** @ProChannel BSS `__ZN22OZChannelAngle_Factory13_instanceOnceE`.
 *  libc++ std::once_flag word. 0n = not started; -1n = completed.
 *  getInstance compares this to $-1 @0x191e as its fast-path check. */
let _instanceOnce: bigint = 0n; // @ProChannel BSS 0x1914 read-site

/** @ProChannel BSS `__ZN22OZChannelAngle_Factory9_instanceE`.
 *  Singleton pointer. Read @0x1949-0x1950 (return). Written by the
 *  __call_once_proxy lambda (SEPARATE ledger unit). */
let _instance: OZChannelAngle_Factory | null = null; // @ProChannel BSS 0x1949

/**
 * `std::__1::__call_once(flag&, void* arg, void(*)(void*))` — libc++.
 * Called from getInstance @0x1944 via ProChannel stub 0xacdc8. TRUE
 * out-of-scope extern (libc++ runtime). Modelled as the single-threaded
 * JS equivalent: on first call with zero flag invoke the proxy(arg); on
 * success write $-1 to the flag; on subsequent calls no-op. If the
 * proxy throws, the flag stays 0 and future calls retry — matching
 * libc++'s ~0UL-on-success semantics.
 */
function std_call_once(
  once: { get(): bigint; set(v: bigint): void },
  arg: unknown,
  proxy: (arg: unknown) => void,
): void {
  // libc++ fast-path: already completed?
  if (once.get() === -1n) return; // (mirrors 0x191e fast-path exit)
  proxy(arg);
  once.set(-1n);
}

/**
 * `__ZNSt3__117__call_once_proxy<...>` — libc++ template instantiation.
 * Body dispatches into the getInstance lambda, which allocates a fresh
 * OZChannelAngle_Factory via `operator new`, invokes its C2 base ctor,
 * and stores the result into `_instance`. SEPARATE ledger entry —
 * raises with the exact call-site @0xADDR so downstream code cannot
 * silently rely on an un-ported singleton.
 */
function __call_once_proxy_getInstance_lambda(_arg: unknown): void {
  throw new Error(
    "OZChannelAngle_Factory::getInstance() __call_once init lambda not " +
      "yet transcribed — the lambda body allocates via operator new " +
      "(__Znwm ProChannel stub) and invokes " +
      "__ZN22OZChannelAngle_FactoryC2Ev (C2 base ctor @0x4754, SEPARATE " +
      "ledger entry, status: todo) then stores the result into _instance. " +
      "The proxy is invoked from std::__call_once at ProChannel 0x1944.",
  );
}

// ═════════════════════════════════════════════════════════════════════════
// The class
// ═════════════════════════════════════════════════════════════════════════

/**
 * `OZChannelAngle_Factory` — factory singleton for OZChannelAngle channel
 * instances. Only its getInstance() accessor is ported in this file;
 * every other method is a separate ledger entry.
 */
export class OZChannelAngle_Factory {
  /**
   * `OZChannelAngle_Factory::getInstance()`
   *   — @ProChannel 0x190c
   *   — __ZN22OZChannelAngle_Factory11getInstanceEv
   *
   * Faithful line-for-line transcription of the disassembly quoted in
   * the file header. Standard libc++ std::call_once-guarded singleton.
   */
  static getInstance(): OZChannelAngle_Factory | null {
    // ------------------------------------------------------------
    // @0x190c..0x1910 — prologue + 0x20-byte local frame.
    // @0x1914..0x191b — rax = _instanceOnce.
    // @0x191e..0x1922 — if (_instanceOnce == -1) goto fast_path (0x1949).
    // ------------------------------------------------------------
    if (_instanceOnce !== -1n) {
      // ------------------------------------------------------------
      // @0x1924..0x1933 — set up libc++ tuple<lambda&&> on the stack.
      // (ABI-level, no TS-visible effect — proxy just needs stable void*.)
      // @0x1936 — rdi = &_instanceOnce.
      // @0x193d — rdx = &__call_once_proxy<...lambda...>.
      // @0x1944 — callq std::__call_once (libc++ stub @0xacdc8).
      // ------------------------------------------------------------
      std_call_once(
        {
          get: (): bigint => _instanceOnce, // (mirrors `movq (%rax),%rax` @0x191b)
          set: (v: bigint): void => {
            _instanceOnce = v;
          },
        },
        null, // ABI void* — the real disasm passes &tuple; our proxy ignores it.
        __call_once_proxy_getInstance_lambda,
      );
    }
    // ------------------------------------------------------------
    // @0x1949..0x1950 — rax = _instance.
    // @0x1953..0x1958 — epilogue + retq.
    // ------------------------------------------------------------
    return _instance;
  }
}

