// OZChannelTimecode_Factory — ProChannel factory singleton for OZChannelTimecode.
//
// Transcribed from /Applications/Final Cut Pro.app/Contents/Frameworks/
// ProChannel.framework/Versions/A/ProChannel (x86_64 slice; unadjusted
// VAs from `otool -tV`). Disassembly source:
//   raw-port/re/disasm/ProChannel.__ZN25OZChannelTimecode_Factory11getInstanceEv.s
//
// Only `getInstance()` @ProChannel 0x2674 is ported here. The remaining
// methods on this factory (C2/D1/D0/create*/createChannel*/... etc.)
// are separate ledger entries and will be added to THIS file when their
// own ledger entries are claimed in future depclaim rounds (per the
// "one class per file" rule).
//
// This file follows the SAME structural pattern as its
// OZChannelBase_Factory and OZChannelColor_Factory siblings — every FCP
// PCSingleton-derived factory compiles to a byte-for-byte identical
// getInstance() skeleton, differing only in globals and the templated
// call_once_proxy instantiation.
//
// -----------------------------------------------------------------------------
// PROCESS-GLOBAL STORAGE
// -----------------------------------------------------------------------------
//   __ZN25OZChannelTimecode_Factory13_instanceOnceE
//     — libc++ std::once_flag. 0 = not started; -1 = complete. Fast-
//       path @0x2686 compares to $-1.
//   __ZN25OZChannelTimecode_Factory9_instanceE
//     — OZChannelTimecode_Factory*. Written by the __call_once_proxy
//       lambda; read by getInstance @0x26b1.
//
// -----------------------------------------------------------------------------
// FRONTIER CALLEES (all TRUE OUT-OF-SCOPE externs or SEPARATE ledger units)
// -----------------------------------------------------------------------------
//   * __ZNSt3__111__call_onceERVmPvPFvS2_E — std::__1::__call_once
//       — libc++ (libc++.dylib). Called @0x26ac via stub 0xacdc8.
//         Boundary-stub policy, same as OZChannelBase_Factory.
//   * __ZNSt3__117__call_once_proxyB9nqe210106<
//         tuple<OZChannelTimecode_Factory::getInstance()::'lambda'()&&>>(void*)
//       — libc++ template. Passed as function-pointer arg, dispatches
//         via `jmp __invoke<...>` @ProChannel 0x10fff:
//             pushq %rbp / movq %rsp, %rbp
//             movq (%rdi), %rax           ; rax = *arg (tuple)
//             movq (%rax), %rdi           ; rdi = *tuple = &lambda-slot
//             popq %rbp
//             jmp __invoke<...lambda()...>
//         The __invoke tail-call constructs the singleton and stores
//         it into _instance. That __invoke body (operator new(size),
//         C2 ctor, _instance = ptr) is a SEPARATE ledger unit — not
//         yet transcribed.
//
// -----------------------------------------------------------------------------
// Symbols ported here (mangled → address)
// -----------------------------------------------------------------------------
//   * __ZN25OZChannelTimecode_Factory11getInstanceEv
//       — OZChannelTimecode_Factory::getInstance() @ProChannel 0x2674
//
// -----------------------------------------------------------------------------
// FULL DISASM
// -----------------------------------------------------------------------------
//   0x2674  pushq  %rbp                              ; frame prologue
//   ...     movq   %rsp, %rbp
//   ...     subq   $0x20, %rsp                       ; 32-byte local frame
//   ...     leaq   _instanceOnce(%rip), %rax
//   ...     movq   (%rax), %rax                      ; rax = _instanceOnce
//   0x2686  cmpq   $-0x1, %rax                       ; already-init check
//   ...     je     0x26b1                            ; fast path
//   0x268c  leaq   -0x1(%rbp), %rax                  ; captureless lambda slot
//   ...     leaq   -0x18(%rbp), %rcx                 ; tuple<T&&> slot
//   ...     movq   %rax, (%rcx)                      ; tuple.head = &lambda-slot
//   ...     leaq   -0x10(%rbp), %rsi                 ; call_once's void* arg slot
//   ...     movq   %rcx, (%rsi)                      ; *arg = &tuple
//   0x269e  leaq   _instanceOnce(%rip), %rdi
//   0x26a5  leaq   __call_once_proxy<...>(%rip), %rdx
//   0x26ac  callq  std::__call_once                   ; libc++ stub @0xacdc8
//   0x26b1  leaq   _instance(%rip), %rax
//   0x26b8  movq   (%rax), %rax                      ; rax = _instance (return)
//   0x26bb  addq   $0x20, %rsp                       ; epilogue
//   0x26bf  popq   %rbp
//   0x26c0  retq

/** @ProChannel BSS `__ZN25OZChannelTimecode_Factory13_instanceOnceE`.
 *  libc++ std::once_flag word. 0n = not started; -1n = complete.
 *  Fast-path check `cmpq $-1, %rax` @0x2686. */
let _instanceOnce: bigint = 0n; // @ProChannel BSS 0x2674 read-site

/** @ProChannel BSS `__ZN25OZChannelTimecode_Factory9_instanceE`.
 *  The singleton pointer. Read @0x26b1-0x26b8; written by the init lambda. */
let _instance: OZChannelTimecode_Factory | null = null; // @ProChannel BSS 0x26b1

/**
 * `std::__1::__call_once(flag&, void* arg, void(*)(void*))` — libc++
 * (libc++.dylib). Called from getInstance @0x26ac via stub 0xacdc8.
 * TRUE out-of-scope extern; modelled as a single-threaded lazy-init.
 * On success flips flag to -1 (~0UL), matching libc++'s sentinel. */
function std_call_once(
  once: { get(): bigint; set(v: bigint): void },
  arg: unknown,
  proxy: (arg: unknown) => void,
): void {
  if (once.get() === -1n) return; // libc++ fast-path (also @0x2686)
  proxy(arg);
  once.set(-1n);
}

/**
 * `__ZNSt3__117__call_once_proxy<...>` for OZChannelTimecode_Factory's
 * getInstance lambda. Body @ProChannel 0x10fff is a 6-byte prologue
 * plus `jmp __invoke<...lambda()...>`. The __invoke instantiation
 * performs the singleton construction (operator new + C2 ctor +
 * store into _instance), identical in shape to OZChannelColor_Factory's
 * lambda @0x548cc. That __invoke body is a SEPARATE ledger unit and
 * is not yet transcribed — cited throwing stub @ProChannel 0x10fff. */
function __call_once_proxy_getInstance_lambda(_arg: unknown): void {
  throw new Error(
    "OZChannelTimecode_Factory::getInstance() __call_once init lambda not " +
      "yet transcribed — the proxy @ProChannel 0x10fff tail-jumps into " +
      "std::__invoke<lambda()> which allocates the factory via operator " +
      "new (libc++ extern __Znwm 0xace4c), runs the C2 base ctor " +
      "__ZN25OZChannelTimecode_FactoryC2Ev (ledger status: todo), and " +
      "stores the raw pointer into _instance. Neither operator new nor " +
      "the C2 ctor is yet ported — this lambda is a SEPARATE ledger " +
      "unit and will be filled in when it is next claimed. The proxy " +
      "is invoked from std::__call_once at ProChannel 0x26ac.",
  );
}

/**
 * `OZChannelTimecode_Factory` — factory singleton. Only getInstance() is
 * ported here; the instance layout (allocated via operator new in the
 * init lambda) will be decoded when the C2 ctor is next claimed.
 */
export class OZChannelTimecode_Factory {
  /**
   * `OZChannelTimecode_Factory::getInstance()` — @ProChannel 0x2674
   * (__ZN25OZChannelTimecode_Factory11getInstanceEv).
   *
   * Standard libc++ std::call_once-guarded singleton accessor,
   * structurally identical to OZChannelBase_Factory::getInstance
   * @0x1786 and OZChannelColor_Factory::getInstance @0x1e3a.
   *
   *   1. If _instanceOnce == -1, skip to step 3 (@0x2686 fast-path).
   *   2. Call std::__call_once with the proxy that constructs the
   *      singleton (@0x26ac).
   *   3. Return _instance (@0x26b1).
   */
  static getInstance(): OZChannelTimecode_Factory | null {
    // @0x2674 — prologue + local frame (no TS effect).
    // @0x2686 — if (_instanceOnce == -1) goto fast_path (0x26b1).
    if (_instanceOnce !== -1n) {
      // @0x268c — tuple<lambda&&> stack setup (ABI marshaling; no TS effect).
      // @0x269e — rdi = &_instanceOnce.
      // @0x26a5 — rdx = &__call_once_proxy<...>.
      // @0x26ac — callq std::__call_once (libc++ stub @0xacdc8).
      std_call_once(
        {
          get: (): bigint => _instanceOnce,
          set: (v: bigint): void => {
            _instanceOnce = v;
          },
        },
        null, // ABI void* — disasm passes &tuple; our proxy ignores it.
        __call_once_proxy_getInstance_lambda,
      );
    }
    // @0x26b1..0x26b8 — rax = _instance.
    // @0x26bb..0x26c0 — epilogue + retq.
    return _instance;
  }
}
