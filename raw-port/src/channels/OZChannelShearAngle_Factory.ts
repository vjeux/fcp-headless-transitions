// OZChannelShearAngle_Factory — ProChannel factory singleton for
// OZChannelShearAngle.
//
// Transcribed from /Applications/Final Cut Pro.app/Contents/Frameworks/
// ProChannel.framework/Versions/A/ProChannel (x86_64 slice; unadjusted
// VAs from `otool -tV`). Disassembly source:
//   raw-port/re/disasm/ProChannel.__ZN27OZChannelShearAngle_Factory11getInstanceEv.s
//
// This unit ports ONLY the `getInstance()` static singleton accessor at
// @0x19a8. The remaining methods on this factory (C2/D1/D0/create/...)
// are separate ledger entries and are OUT OF SCOPE for this file — per
// the "one class per file" rule, extending this file with more methods
// later is the correct workflow.
//
// -----------------------------------------------------------------------------
// PROCESS-GLOBAL STORAGE
// -----------------------------------------------------------------------------
//   __ZN27OZChannelShearAngle_Factory13_instanceOnceE
//     — the libc++ std::once_flag word. 0 = "not started", intermediate
//       values = "another thread running init", -1 (~0UL) = "init done".
//       The `cmpq $-0x1, %rax` at @0x19ba is the standard libc++
//       fast-path check.
//
//   __ZN27OZChannelShearAngle_Factory9_instanceE
//     — an `OZChannelShearAngle_Factory*` (pointer to the singleton).
//       Written by the __call_once_proxy lambda; read by getInstance
//       @0x19e5.
//
// -----------------------------------------------------------------------------
// FRONTIER CALLEES (all TRUE OUT-OF-SCOPE externs or SEPARATE ledger units)
// -----------------------------------------------------------------------------
//   * __ZNSt3__111__call_onceERVmPvPFvS2_E
//       — std::__1::__call_once(flag&, void*, void(*)(void*))
//       — libc++ (libc++.dylib) — TRUE out-of-scope extern. Called
//         @0x19e0 via ProChannel stub 0xacdc8.
//
//   * __ZNSt3__117__call_once_proxyB9nqe210106<
//         tuple<OZChannelShearAngle_Factory::getInstance()::'lambda'()&&>>(void*)
//       — libc++ template instantiation that unpacks the tuple and
//         invokes the lambda. NOT called by getInstance directly — it is
//         PASSED AS A DATA REFERENCE to __call_once, which dispatches
//         through it. The lambda body allocates an
//         OZChannelShearAngle_Factory via operator new and invokes the
//         C2 base ctor (__ZN27OZChannelShearAngle_FactoryC2Ev) — both
//         SEPARATE ledger entries (out of scope for this file). We
//         model the frontier by raising at the __call_once callq
//         boundary, exactly like OZChannelBase_Factory /
//         OZChanObjectRef_Factory (the honest Style-B peers).
//
// -----------------------------------------------------------------------------
// Symbols ported here (mangled → address)
// -----------------------------------------------------------------------------
//   * __ZN27OZChannelShearAngle_Factory11getInstanceEv
//       — OZChannelShearAngle_Factory::getInstance() @ProChannel 0x19a8
//
// -----------------------------------------------------------------------------
// FULL DISASM (raw-port/re/disasm/ProChannel.__ZN27OZChannelShearAngle_Factory11getInstanceEv.s)
// -----------------------------------------------------------------------------
//   0x19a8  pushq  %rbp                              ; frame prologue
//   0x19a9  movq   %rsp, %rbp
//   0x19ac  subq   $0x20, %rsp                       ; 32-byte local frame
//   0x19b0  leaq   _instanceOnce(%rip), %rax         ; rax = &_instanceOnce
//   0x19b7  movq   (%rax), %rax                      ; rax = _instanceOnce
//   0x19ba  cmpq   $-0x1, %rax                       ; already-init check
//   0x19be  je     0x19e5                            ; fast path: skip call_once
//   0x19c0  leaq   -0x1(%rbp), %rax                  ; rax = &frame[-1]
//   0x19c4  leaq   -0x18(%rbp), %rcx                 ; rcx = &frame[-0x18]
//   0x19c8  movq   %rax, (%rcx)                      ; tuple.head = &lambda-slot
//   0x19cb  leaq   -0x10(%rbp), %rsi                 ; rsi = &frame[-0x10]
//   0x19cf  movq   %rcx, (%rsi)                      ; *arg = &tuple
//   0x19d2  leaq   _instanceOnce(%rip), %rdi         ; rdi = &_instanceOnce
//   0x19d9  leaq   __call_once_proxy<...>(%rip), %rdx; rdx = &proxy_func
//   0x19e0  callq  std::__call_once                   ; libc++ stub @0xacdc8
//   0x19e5  leaq   _instance(%rip), %rax             ; rax = &_instance
//   0x19ec  movq   (%rax), %rax                      ; rax = _instance
//   0x19ef  addq   $0x20, %rsp                       ; frame epilogue
//   0x19f3  popq   %rbp
//   0x19f4  retq

/** @ProChannel BSS `__ZN27OZChannelShearAngle_Factory13_instanceOnceE`.
 *  libc++ std::once_flag word. 0n = not started; -1n = completed.
 *  getInstance compares this to $-1 @0x19ba as its fast-path check. */
let _instanceOnce: bigint = 0n; // @ProChannel BSS 0x19b0 read-site

/** @ProChannel BSS `__ZN27OZChannelShearAngle_Factory9_instanceE`.
 *  The singleton pointer. Read @0x19e5-0x19ec. Written by the
 *  __call_once_proxy lambda (a SEPARATE ledger entry). */
let _instance: OZChannelShearAngle_Factory | null = null; // @ProChannel BSS 0x19e5

/**
 * `std::__1::__call_once(flag&, void* arg, void(*)(void*))` — libc++
 * (libc++.dylib). Called from getInstance @0x19e0 via ProChannel stub
 * 0xacdc8. TRUE out-of-scope extern. Models "run initializer once"
 * contract at JS single-threaded level: first call runs proxy(arg);
 * on success writes -1 to the flag; subsequent calls no-op. If proxy
 * throws, the flag stays 0 (matching libc++'s ~0UL-on-success write
 * being skipped). */
function std_call_once(
  once: { get(): bigint; set(v: bigint): void },
  arg: unknown,
  proxy: (arg: unknown) => void,
): void {
  if (once.get() === -1n) return; // (mirrors 0x19ba fast-path exit)
  proxy(arg);
  once.set(-1n);
}

/**
 * `__ZNSt3__117__call_once_proxy<...>` — libc++ template instantiation.
 * Body allocates a fresh OZChannelShearAngle_Factory via `operator new`
 * and invokes `OZChannelShearAngle_Factory::OZChannelShearAngle_Factory()`
 * (the C2 base ctor) then stores the pointer into `_instance`. Neither
 * the C2 ctor nor operator new (__Znwm) is called by getInstance
 * directly — this proxy is a SEPARATE ledger entry. Raising here at the
 * __call_once boundary faithfully reflects the deferred work. */
function __call_once_proxy_getInstance_lambda(_arg: unknown): void {
  throw new Error(
    "OZChannelShearAngle_Factory::getInstance() __call_once init lambda not " +
      "yet transcribed — the lambda body allocates an " +
      "OZChannelShearAngle_Factory via operator new (__Znwm, ProChannel stub " +
      "0xace4c) and invokes __ZN27OZChannelShearAngle_FactoryC2Ev (the C2 " +
      "base ctor — SEPARATE ledger entry) then stores the result into " +
      "_instance. The proxy is invoked from std::__call_once at ProChannel " +
      "0x19e0.",
  );
}

/**
 * `OZChannelShearAngle_Factory` — factory singleton for
 * OZChannelShearAngle channel instances. Only its getInstance() accessor
 * is ported in this file; every other method is a separate ledger entry.
 */
export class OZChannelShearAngle_Factory {
  /**
   * `OZChannelShearAngle_Factory::getInstance()` — @ProChannel 0x19a8
   * (__ZN27OZChannelShearAngle_Factory11getInstanceEv).
   *
   * Faithful transcription of the disassembly in the file header.
   * Standard libc++ std::call_once-guarded singleton accessor:
   *   1. Read _instanceOnce; if == $-1, skip to step 3.
   *   2. std::__call_once(&_instanceOnce, &tuple, &proxy) — proxy
   *      allocates + constructs the singleton and stores into _instance.
   *   3. Return _instance (or NULL if init threw).
   */
  static getInstance(): OZChannelShearAngle_Factory | null {
    // @0x19a8..0x19ac — prologue.
    // @0x19b0..0x19b7 — rax = _instanceOnce.
    // @0x19ba..0x19be — if (_instanceOnce == -1) goto fast_path (0x19e5).
    if (_instanceOnce !== -1n) {
      // @0x19c0..0x19cf — set up libc++ tuple<lambda&&> on the stack
      //                    (ABI-level, no TS-visible effect).
      // @0x19d2 — rdi = &_instanceOnce.
      // @0x19d9 — rdx = &__call_once_proxy<...>.
      // @0x19e0 — callq std::__call_once (libc++ stub @0xacdc8).
      std_call_once(
        {
          get: (): bigint => _instanceOnce, // (mirrors `movq (%rax),%rax` @0x19b7)
          set: (v: bigint): void => {
            _instanceOnce = v;
          },
        },
        null, // ABI void* — real disasm passes &tuple; our proxy ignores it.
        __call_once_proxy_getInstance_lambda,
      );
    }
    // @0x19e5..0x19ec — rax = _instance.
    // @0x19ef..0x19f4 — epilogue + retq.
    return _instance;
  }
}
