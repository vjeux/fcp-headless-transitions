// OZChannelDiscreteColor_Factory — ProChannel factory singleton for
// OZChannelDiscreteColor.
//
// Transcribed from /Applications/Final Cut Pro.app/Contents/Frameworks/
// ProChannel.framework/Versions/A/ProChannel (x86_64 slice; unadjusted
// VAs from `otool -tV`). Disassembly source:
//   raw-port/re/disasm/ProChannel.__ZN30OZChannelDiscreteColor_Factory11getInstanceEv.s
//
// Only `getInstance()` @ProChannel 0x1f24 is ported here. The remaining
// methods on this factory (C2/D1/D0/create*/... etc.) are separate
// ledger entries — per "one class per file" they'll be added to THIS
// file when claimed in future depclaim rounds.
//
// Structurally identical to the OZChannelBase_Factory / OZChanObjectRef_
// Factory / OZChannelQuad_Factory getInstance ports — every FCP
// PCSingleton-derived factory compiles to a byte-for-byte identical
// getInstance() skeleton (differs only in the two static globals and the
// templated __call_once_proxy instantiation).
//
// -----------------------------------------------------------------------------
// PROCESS-GLOBAL STORAGE
// -----------------------------------------------------------------------------
//   __ZN30OZChannelDiscreteColor_Factory13_instanceOnceE
//     — libc++ std::once_flag. 0 = not started; -1 = complete. Fast-
//       path @0x1f36 compares to $-1.
//   __ZN30OZChannelDiscreteColor_Factory9_instanceE
//     — OZChannelDiscreteColor_Factory*. Written by the __invoke lambda
//       @ProChannel 0x8f568; read by getInstance @0x1f61.
//
// -----------------------------------------------------------------------------
// FRONTIER CALLEES (all TRUE OUT-OF-SCOPE externs or SEPARATE ledger units)
// -----------------------------------------------------------------------------
//   * __ZNSt3__111__call_onceERVmPvPFvS2_E — std::__1::__call_once
//       — libc++.dylib. Called @0x1f5c via stub 0xacdc8.
//   * __ZNSt3__117__call_once_proxy<...tuple<lambda&&>...>(void*)
//       — libc++ template @ProChannel 0x8f53c. Passed as function-
//         pointer arg. Body is `jmp __invoke<...>` into the lambda
//         @ProChannel 0x8f54c. That __invoke does:
//             1. operator new(0x88) @0x8f558 (__Znwm stub 0xace4c)
//             2. OZChannelDiscreteColor_FactoryC2Ev @0x8f563 (ledger: todo)
//             3. _instance = new_ptr @0x8f568
//         SEPARATE ledger unit.
//
// -----------------------------------------------------------------------------
// Symbols ported here (mangled → address)
// -----------------------------------------------------------------------------
//   * __ZN30OZChannelDiscreteColor_Factory11getInstanceEv
//       — OZChannelDiscreteColor_Factory::getInstance() @ProChannel 0x1f24
//
// -----------------------------------------------------------------------------
// FULL DISASM
// -----------------------------------------------------------------------------
//   0x1f24  pushq  %rbp
//   0x1f25  movq   %rsp, %rbp
//   0x1f28  subq   $0x20, %rsp
//   0x1f2c  leaq   _instanceOnce(%rip), %rax
//   0x1f33  movq   (%rax), %rax
//   0x1f36  cmpq   $-0x1, %rax                       ; already-init check
//   0x1f3a  je     0x1f61                            ; fast path
//   0x1f3c  leaq   -0x1(%rbp), %rax                  ; captureless lambda slot
//   0x1f40  leaq   -0x18(%rbp), %rcx                 ; tuple<T&&> slot
//   0x1f44  movq   %rax, (%rcx)
//   0x1f47  leaq   -0x10(%rbp), %rsi                 ; call_once void* arg slot
//   0x1f4b  movq   %rcx, (%rsi)
//   0x1f4e  leaq   _instanceOnce(%rip), %rdi
//   0x1f55  leaq   __call_once_proxy<...>(%rip), %rdx
//   0x1f5c  callq  std::__call_once                   ; libc++ stub @0xacdc8
//   0x1f61  leaq   _instance(%rip), %rax
//   0x1f68  movq   (%rax), %rax                      ; rax = _instance (return)
//   0x1f6b  addq   $0x20, %rsp
//   0x1f6f  popq   %rbp
//   0x1f70  retq

/** @ProChannel BSS `__ZN30OZChannelDiscreteColor_Factory13_instanceOnceE`.
 *  libc++ std::once_flag word. 0n = not started; -1n = complete.
 *  Fast-path `cmpq $-1, %rax` @0x1f36. */
let _instanceOnce: bigint = 0n; // @ProChannel BSS 0x1f24 read-site

/** @ProChannel BSS `__ZN30OZChannelDiscreteColor_Factory9_instanceE`.
 *  The singleton pointer. Read @0x1f61-0x1f68; written @0x8f568. */
let _instance: OZChannelDiscreteColor_Factory | null = null; // @ProChannel BSS 0x1f61

/**
 * `std::__1::__call_once(flag&, void*, void(*)(void*))` — libc++
 * (libc++.dylib) TRUE out-of-scope extern. Called from getInstance
 * @0x1f5c via stub 0xacdc8. Modelled as single-threaded lazy-init;
 * on success flips flag to -1 (~0UL). */
function std_call_once(
  once: { get(): bigint; set(v: bigint): void },
  arg: unknown,
  proxy: (arg: unknown) => void,
): void {
  if (once.get() === -1n) return; // libc++ fast-path (also @0x1f36)
  proxy(arg);
  once.set(-1n);
}

/**
 * `__ZNSt3__117__call_once_proxy<...>` for
 * OZChannelDiscreteColor_Factory's getInstance lambda @ProChannel
 * 0x8f53c. Body is `jmp __invoke<...>` @ProChannel 0x8f54c.
 *
 *   0x8f54c  push rbp / mov rbp,rsp / push r14 / push rbx
 *   0x8f553  movl  $0x88, %edi
 *   0x8f558  callq operator new                    ; __Znwm 0xace4c
 *   0x8f55d  movq  %rax, %rbx
 *   0x8f560  movq  %rax, %rdi
 *   0x8f563  callq __ZN30OZChannelDiscreteColor_FactoryC2Ev ; C2 (ledger: todo)
 *   0x8f568  movq  %rbx, _instance(%rip)
 *
 * Neither operator new nor the C2 ctor is yet ported — this __invoke
 * is a SEPARATE ledger unit. Cited throwing stub. */
function __call_once_proxy_getInstance_lambda(_arg: unknown): void {
  throw new Error(
    "OZChannelDiscreteColor_Factory::getInstance() __call_once init " +
      "lambda not yet transcribed — the lambda body @ProChannel 0x8f54c " +
      "allocates 0x88 bytes via operator new @0x8f558 (imported __Znwm " +
      "0xace4c) then invokes __ZN30OZChannelDiscreteColor_FactoryC2Ev " +
      "@ProChannel 0x8f563 (C2 base ctor, ledger status: todo) and " +
      "stores the result into _instance @0x8f568. Neither operator new " +
      "nor the C2 ctor is yet ported — this lambda is a SEPARATE ledger " +
      "unit and will be filled in when it is next claimed. The proxy is " +
      "invoked from std::__call_once at ProChannel 0x1f5c.",
  );
}

/**
 * `OZChannelDiscreteColor_Factory` — factory singleton for
 * OZChannelDiscreteColor channels. Only getInstance() is ported here;
 * the 0x88-byte instance layout (from operator new(0x88) @0x8f558 in
 * the init lambda) will be decoded when the C2 ctor is next claimed.
 */
export class OZChannelDiscreteColor_Factory {
  /**
   * `OZChannelDiscreteColor_Factory::getInstance()` — @ProChannel 0x1f24
   * (__ZN30OZChannelDiscreteColor_Factory11getInstanceEv).
   *
   * Standard libc++ std::call_once-guarded singleton accessor,
   * structurally identical to OZChannelBase_Factory / OZChanObjectRef_
   * Factory / OZChannelQuad_Factory getInstance twins.
   *
   *   1. If _instanceOnce == -1, skip to step 3 (@0x1f36 fast-path).
   *   2. Call std::__call_once with the proxy that constructs the
   *      singleton (@0x1f5c).
   *   3. Return _instance (@0x1f61).
   */
  static getInstance(): OZChannelDiscreteColor_Factory | null {
    // @0x1f24..0x1f28 — prologue + local frame.
    // @0x1f2c..0x1f33 — rax = _instanceOnce.
    // @0x1f36..0x1f3a — if (_instanceOnce == -1) goto fast_path (0x1f61).
    if (_instanceOnce !== -1n) {
      // @0x1f3c..0x1f4b — tuple<lambda&&> stack setup (ABI marshaling).
      // @0x1f4e — rdi = &_instanceOnce.
      // @0x1f55 — rdx = &__call_once_proxy<...>.
      // @0x1f5c — callq std::__call_once (libc++ stub @0xacdc8).
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
    // @0x1f61..0x1f68 — rax = _instance.
    // @0x1f6b..0x1f70 — epilogue + retq.
    return _instance;
  }
}
