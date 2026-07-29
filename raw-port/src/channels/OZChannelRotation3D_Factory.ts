// OZChannelRotation3D_Factory — ProChannel factory singleton for OZChannelRotation3D.
//
// Transcribed from /Applications/Final Cut Pro.app/Contents/Frameworks/
// ProChannel.framework/Versions/A/ProChannel (x86_64 slice; unadjusted
// VAs from `otool -tV`). Disassembly source:
//   raw-port/re/disasm/ProChannel.__ZN27OZChannelRotation3D_Factory11getInstanceEv.s
//
// Only `getInstance()` @ProChannel 0x80c54 is ported here. This is a
// codegen VARIANT of the standard sibling-factory getInstance() shape
// (see OZChannelHistogram_Factory@0x6fa24 for the same variant).
//
// DIFFERENCE FROM THE 22-LINE SIBLING SKELETON:
//   (1) The initial load of _instanceOnce is a DIRECT global-to-rax
//       `movq _instanceOnce(%rip), %rax` at 0x80c54 (no leaq+deref).
//   (2) The frame prologue is SKIPPED on the fast-path: `je` at 0x80c5f
//       jumps directly to the return-value load @0x80c93.
//   (3) The final return is a DIRECT `movq _instance(%rip), %rax`
//       @0x80c93 — same optimization as (1).
// Semantics are unchanged; only the codegen shape differs.
//
// -----------------------------------------------------------------------------
// PROCESS-GLOBAL STORAGE
// -----------------------------------------------------------------------------
//   __ZN27OZChannelRotation3D_Factory13_instanceOnceE
//     — libc++ std::once_flag. 0 = not started; -1 = complete. Fast-
//       path @0x80c5b compares to $-1.
//   __ZN27OZChannelRotation3D_Factory9_instanceE
//     — OZChannelRotation3D_Factory*. Written by the __call_once_proxy
//       lambda; read by getInstance @0x80c93.
//
// -----------------------------------------------------------------------------
// FRONTIER CALLEES (all TRUE OUT-OF-SCOPE externs or SEPARATE ledger units)
// -----------------------------------------------------------------------------
//   * __ZNSt3__111__call_onceERVmPvPFvS2_E — std::__1::__call_once
//       — libc++ (libc++.dylib). Called @0x80c89 via stub 0xacdc8.
//         Boundary-stub policy, same as OZChannelBase_Factory.
//   * __ZNSt3__117__call_once_proxyB9nqe210106<
//         tuple<OZChannelRotation3D_Factory::getInstance()::'lambda'()&&>>(void*)
//       — libc++ template. Body @ProChannel 0x93c7 tail-jumps into
//         __invoke<...lambda()...> which allocates the factory via
//         operator new + C2 ctor + stores into _instance. SEPARATE
//         ledger unit — not yet transcribed.
//
// -----------------------------------------------------------------------------
// Symbols ported here (mangled → address)
// -----------------------------------------------------------------------------
//   * __ZN27OZChannelRotation3D_Factory11getInstanceEv
//       — OZChannelRotation3D_Factory::getInstance() @ProChannel 0x80c54
//
// -----------------------------------------------------------------------------
// FULL DISASM
// -----------------------------------------------------------------------------
//   0x80c54  movq   _instanceOnce(%rip), %rax        ; rax = _instanceOnce (DIRECT)
//   0x80c5b  cmpq   $-0x1, %rax                       ; already-init check
//   0x80c5f  je     0x80c93                           ; fast path SKIPS prologue
//   0x80c61  pushq  %rbp                              ; frame prologue (slow path)
//   0x80c62  movq   %rsp, %rbp
//   0x80c65  subq   $0x20, %rsp                       ; 32-byte local frame
//   0x80c69  leaq   -0x1(%rbp), %rax                  ; captureless lambda slot
//   0x80c6d  leaq   -0x18(%rbp), %rcx                 ; tuple<T&&> slot
//   0x80c71  movq   %rax, (%rcx)                      ; tuple.head = &lambda-slot
//   0x80c74  leaq   -0x10(%rbp), %rsi                 ; call_once's void* arg slot
//   0x80c78  movq   %rcx, (%rsi)                      ; *arg = &tuple
//   0x80c7b  leaq   _instanceOnce(%rip), %rdi
//   0x80c82  leaq   __call_once_proxy<...>(%rip), %rdx
//   0x80c89  callq  std::__call_once                  ; libc++ stub @0xacdc8
//   0x80c8e  addq   $0x20, %rsp                       ; epilogue (slow path)
//   0x80c92  popq   %rbp
//   0x80c93  movq   _instance(%rip), %rax             ; return value (DIRECT)
//   0x80c9a  retq

/** @ProChannel BSS `__ZN27OZChannelRotation3D_Factory13_instanceOnceE`.
 *  libc++ std::once_flag word. 0n = not started; -1n = complete.
 *  Fast-path check `cmpq $-1, %rax` @0x80c5b. */
let _instanceOnce: bigint = 0n; // @ProChannel BSS 0x80c54 read-site

/** @ProChannel BSS `__ZN27OZChannelRotation3D_Factory9_instanceE`.
 *  The singleton pointer. Read @0x80c93; written by the init lambda. */
let _instance: OZChannelRotation3D_Factory | null = null; // @ProChannel BSS 0x80c93

/**
 * `std::__1::__call_once(flag&, void* arg, void(*)(void*))` — libc++
 * (libc++.dylib). Called from getInstance @0x80c89 via stub 0xacdc8.
 * TRUE out-of-scope extern; modelled as a single-threaded lazy-init.
 * On success flips flag to -1 (~0UL), matching libc++'s sentinel. */
function std_call_once(
  once: { get(): bigint; set(v: bigint): void },
  arg: unknown,
  proxy: (arg: unknown) => void,
): void {
  if (once.get() === -1n) return; // libc++ fast-path (also @0x80c5b)
  proxy(arg);
  once.set(-1n);
}

/**
 * `__ZNSt3__117__call_once_proxy<...>` for OZChannelRotation3D_Factory's
 * getInstance lambda. Body @ProChannel 0x93c7 is a 6-byte prologue
 * plus `jmp __invoke<...lambda()...>`. The __invoke instantiation
 * performs the singleton construction (operator new + C2 ctor +
 * store into _instance), identical in shape to OZChannelColor_Factory's
 * lambda @0x548cc. That __invoke body is a SEPARATE ledger unit and
 * is not yet transcribed — cited throwing stub @ProChannel 0x93c7. */
function __call_once_proxy_getInstance_lambda(_arg: unknown): void {
  throw new Error(
    "OZChannelRotation3D_Factory::getInstance() __call_once init lambda not " +
      "yet transcribed — the proxy @ProChannel 0x93c7 tail-jumps into " +
      "std::__invoke<lambda()> which allocates the factory via operator " +
      "new (libc++ extern __Znwm 0xace4c), runs the C2 base ctor " +
      "__ZN27OZChannelRotation3D_FactoryC2Ev (ledger status: todo), and " +
      "stores the raw pointer into _instance. Neither operator new nor " +
      "the C2 ctor is yet ported — this lambda is a SEPARATE ledger " +
      "unit and will be filled in when it is next claimed. The proxy " +
      "is invoked from std::__call_once at ProChannel 0x80c89.",
  );
}

/**
 * `OZChannelRotation3D_Factory` — factory singleton. Only getInstance() is
 * ported here; the instance layout (allocated via operator new in the
 * init lambda) will be decoded when the C2 ctor is next claimed.
 */
export class OZChannelRotation3D_Factory {
  /**
   * `OZChannelRotation3D_Factory::getInstance()` — @ProChannel 0x80c54
   * (__ZN27OZChannelRotation3D_Factory11getInstanceEv).
   *
   * libc++ std::call_once-guarded singleton accessor. Codegen VARIANT
   * of the sibling factories' skeleton (see file header): the fast
   * path skips the frame prologue entirely and both _instanceOnce and
   * _instance are read via direct-RIP-relative movq (no leaq+deref).
   *
   *   1. Load _instanceOnce (@0x80c54 direct).
   *   2. If == -1, skip to step 4 (fast path @0x80c5f).
   *   3. Slow path: call std::__call_once with the init proxy (@0x80c89).
   *   4. Return _instance (@0x80c93 direct).
   */
  static getInstance(): OZChannelRotation3D_Factory | null {
    // @0x80c54..0x80c5b — rax = _instanceOnce (DIRECT movq).
    // @0x80c5f — if (_instanceOnce == -1) goto fast_path (0x80c93).
    if (_instanceOnce !== -1n) {
      // @0x80c61..0x80c78 — prologue + tuple<lambda&&> stack setup
      // (ABI marshaling; no TS effect).
      // @0x80c7b — rdi = &_instanceOnce.
      // @0x80c82 — rdx = &__call_once_proxy<...>.
      // @0x80c89 — callq std::__call_once (libc++ stub @0xacdc8).
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
      // @0x80c8e..0x80c92 — epilogue (slow path only).
    }
    // @0x80c93 — rax = _instance (DIRECT movq).
    // @0x80c9a — retq.
    return _instance;
  }
}
