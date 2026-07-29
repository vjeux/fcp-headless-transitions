// OZChannelColor_Factory — ProChannel factory singleton for OZChannelColor.
//
// Transcribed from /Applications/Final Cut Pro.app/Contents/Frameworks/
// ProChannel.framework/Versions/A/ProChannel (x86_64 slice; unadjusted
// VAs from `otool -tV`). Disassembly source:
//   raw-port/re/disasm/ProChannel.__ZN22OZChannelColor_Factory11getInstanceEv.s
//
// Only `getInstance()` @ProChannel 0x1e3a is ported here. The remaining
// methods on this factory (C2/D1/D0/create*/createChannel*/... etc.)
// are separate ledger entries and will be added to THIS file when their
// own ledger entries are claimed in future depclaim rounds (per the
// "one class per file" rule).
//
// This file follows the SAME structural pattern as its
// OZChannelBase_Factory and OZChannelQuad_Factory siblings — every FCP
// PCSingleton-derived factory compiles to a byte-for-byte identical
// getInstance() skeleton, differing only in globals and the templated
// call_once_proxy instantiation.
//
// -----------------------------------------------------------------------------
// PROCESS-GLOBAL STORAGE
// -----------------------------------------------------------------------------
//   __ZN22OZChannelColor_Factory13_instanceOnceE
//     — libc++ std::once_flag. 0 = not started; -1 = complete. Fast-
//       path @0x1e4c compares to $-1.
//   __ZN22OZChannelColor_Factory9_instanceE
//     — OZChannelColor_Factory*. Written by the __call_once_proxy
//       lambda (@ProChannel 0x548e8); read by getInstance @0x1e77.
//
// -----------------------------------------------------------------------------
// FRONTIER CALLEES (all TRUE OUT-OF-SCOPE externs or SEPARATE ledger units)
// -----------------------------------------------------------------------------
//   * __ZNSt3__111__call_onceERVmPvPFvS2_E — std::__1::__call_once
//       — libc++ (libc++.dylib). Called @0x1e72 via stub 0xacdc8.
//         Boundary-stub policy, same as OZChannelBase_Factory.
//   * __ZNSt3__117__call_once_proxyB9nqe210106<
//         tuple<OZChannelColor_Factory::getInstance()::'lambda'()&&>>(void*)
//       — libc++ template. Passed as function-pointer arg, dispatches
//         via `jmp __invoke<...>` into the lambda @ProChannel 0x548cc.
//         That __invoke @0x548cc..0x548f3 does:
//             1. operator new(0x88) @0x548d8 (imported __Znwm 0xace4c)
//             2. __ZN22OZChannelColor_FactoryC2Ev @0x548e3 (ledger: todo)
//             3. _instance = new_ptr @0x548e8
//         with a landing pad @0x548f4 for operator-delete-and-
//         __Unwind_Resume on C2 throw. SEPARATE ledger unit.
//
// -----------------------------------------------------------------------------
// Symbols ported here (mangled → address)
// -----------------------------------------------------------------------------
//   * __ZN22OZChannelColor_Factory11getInstanceEv
//       — OZChannelColor_Factory::getInstance() @ProChannel 0x1e3a
//
// -----------------------------------------------------------------------------
// FULL DISASM
// (raw-port/re/disasm/ProChannel.__ZN22OZChannelColor_Factory11getInstanceEv.s)
// -----------------------------------------------------------------------------
//   0x1e3a  pushq  %rbp                              ; frame prologue
//   0x1e3b  movq   %rsp, %rbp
//   0x1e3e  subq   $0x20, %rsp                       ; 32-byte local frame
//   0x1e42  leaq   _instanceOnce(%rip), %rax
//   0x1e49  movq   (%rax), %rax                      ; rax = _instanceOnce
//   0x1e4c  cmpq   $-0x1, %rax                       ; already-init check
//   0x1e50  je     0x1e77                            ; fast path
//   0x1e52  leaq   -0x1(%rbp), %rax                  ; captureless lambda slot
//   0x1e56  leaq   -0x18(%rbp), %rcx                 ; tuple<T&&> slot
//   0x1e5a  movq   %rax, (%rcx)                      ; tuple.head = &lambda-slot
//   0x1e5d  leaq   -0x10(%rbp), %rsi                 ; call_once's void* arg slot
//   0x1e61  movq   %rcx, (%rsi)                      ; *arg = &tuple
//   0x1e64  leaq   _instanceOnce(%rip), %rdi
//   0x1e6b  leaq   __call_once_proxy<...>(%rip), %rdx
//   0x1e72  callq  std::__call_once                   ; libc++ stub @0xacdc8
//   0x1e77  leaq   _instance(%rip), %rax
//   0x1e7e  movq   (%rax), %rax                      ; rax = _instance (return)
//   0x1e81  addq   $0x20, %rsp                       ; epilogue
//   0x1e85  popq   %rbp
//   0x1e86  retq

/** @ProChannel BSS `__ZN22OZChannelColor_Factory13_instanceOnceE`.
 *  libc++ std::once_flag word. 0n = not started; -1n = complete.
 *  Fast-path check `cmpq $-1, %rax` @0x1e4c. */
let _instanceOnce: bigint = 0n; // @ProChannel BSS 0x1e3a read-site

/** @ProChannel BSS `__ZN22OZChannelColor_Factory9_instanceE`.
 *  The singleton pointer. Read @0x1e77-0x1e7e; written @0x548e8. */
let _instance: OZChannelColor_Factory | null = null; // @ProChannel BSS 0x1e77

/**
 * `std::__1::__call_once(flag&, void* arg, void(*)(void*))` — libc++
 * (libc++.dylib). Called from getInstance @0x1e72 via stub 0xacdc8.
 * TRUE out-of-scope extern; modelled as a single-threaded lazy-init.
 * On success flips flag to -1 (~0UL), matching libc++'s sentinel. */
function std_call_once(
  once: { get(): bigint; set(v: bigint): void },
  arg: unknown,
  proxy: (arg: unknown) => void,
): void {
  if (once.get() === -1n) return; // libc++ fast-path (also @0x1e4c)
  proxy(arg);
  once.set(-1n);
}

/**
 * `__ZNSt3__117__call_once_proxy<...>` for OZChannelColor_Factory's
 * getInstance lambda. Body is `jmp __invoke<...>` @ProChannel 0x548cc.
 * The __invoke instantiation:
 *
 *   0x548cd  push rbp / mov rbp,rsp / push r14 / push rbx
 *   0x548d3  movl  $0x88, %edi                     ; size = 0x88
 *   0x548d8  callq operator new                    ; __Znwm stub 0xace4c
 *   0x548dd  movq  %rax, %rbx                      ; rbx = raw ptr
 *   0x548e0  movq  %rax, %rdi
 *   0x548e3  callq __ZN22OZChannelColor_FactoryC2Ev; C2 ctor (ledger: todo)
 *   0x548e8  movq  %rbx, _instance(%rip)           ; _instance = raw ptr
 *   0x548ef  epilogue
 *   -- landing pad @0x548f4 --
 *   0x548f4  movq  %rax, %r14
 *   0x548f7-ish  callq operator delete + __Unwind_Resume
 *
 * Neither operator new nor the C2 ctor is yet ported — this __invoke
 * is a SEPARATE ledger unit. Cited throwing stub. */
function __call_once_proxy_getInstance_lambda(_arg: unknown): void {
  throw new Error(
    "OZChannelColor_Factory::getInstance() __call_once init lambda not yet " +
      "transcribed — the lambda body @ProChannel 0x548cc allocates 0x88 " +
      "bytes via operator new @0x548d8 (imported __Znwm 0xace4c) then " +
      "invokes __ZN22OZChannelColor_FactoryC2Ev @ProChannel 0x548e3 (C2 " +
      "base ctor, ledger status: todo) and stores the result into " +
      "_instance @0x548e8. Neither operator new nor the C2 ctor is yet " +
      "ported — this lambda is a SEPARATE ledger unit and will be filled " +
      "in when it is next claimed. The proxy is invoked from " +
      "std::__call_once at ProChannel 0x1e72.",
  );
}

/**
 * `OZChannelColor_Factory` — factory singleton for OZChannelColor
 * channels. Only getInstance() is ported here; the 0x88-byte instance
 * layout (from operator new(0x88) @0x548d8 in the init lambda) will be
 * decoded when the C2 ctor is next claimed.
 */
export class OZChannelColor_Factory {
  /**
   * `OZChannelColor_Factory::getInstance()` — @ProChannel 0x1e3a
   * (__ZN22OZChannelColor_Factory11getInstanceEv).
   *
   * Standard libc++ std::call_once-guarded singleton accessor,
   * structurally identical to OZChannelBase_Factory::getInstance
   * @0x1786 and OZChannelQuad_Factory::getInstance @0x1e88.
   *
   *   1. If _instanceOnce == -1, skip to step 3 (@0x1e4c fast-path).
   *   2. Call std::__call_once with the proxy that constructs the
   *      singleton (@0x1e72).
   *   3. Return _instance (@0x1e77).
   */
  static getInstance(): OZChannelColor_Factory | null {
    // @0x1e3a..0x1e3e — prologue + local frame (no TS effect).
    // @0x1e42..0x1e49 — rax = _instanceOnce.
    // @0x1e4c..0x1e50 — if (_instanceOnce == -1) goto fast_path (0x1e77).
    if (_instanceOnce !== -1n) {
      // @0x1e52..0x1e61 — tuple<lambda&&> stack setup (ABI marshaling; no TS effect).
      // @0x1e64 — rdi = &_instanceOnce.
      // @0x1e6b — rdx = &__call_once_proxy<...>.
      // @0x1e72 — callq std::__call_once (libc++ stub @0xacdc8).
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
    // @0x1e77..0x1e7e — rax = _instance.
    // @0x1e81..0x1e86 — epilogue + retq.
    return _instance;
  }
}
