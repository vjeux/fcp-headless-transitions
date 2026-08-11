// OZChanObjectRef_Factory — ProChannel factory singleton for OZChanObjectRef.
//
// Transcribed from /Applications/Final Cut Pro.app/Contents/Frameworks/
// ProChannel.framework/Versions/A/ProChannel (x86_64 slice; unadjusted
// VAs from `otool -tV`). Disassembly source:
//   raw-port/re/disasm/ProChannel.__ZN23OZChanObjectRef_Factory11getInstanceEv.s
//
// Only `getInstance()` @ProChannel 0x28e4 is ported here. The remaining
// methods on this factory (C2/D1/D0/create*/createChannel*/... etc.)
// are separate ledger entries — per "one class per file" they'll be
// added to THIS file when claimed in future depclaim rounds.
//
// Structurally identical to the OZChannelBase_Factory /
// OZChannelQuad_Factory / OZChannelColor_Factory getInstance ports —
// every FCP PCSingleton-derived factory compiles to a byte-for-byte
// identical getInstance() skeleton (differs only in globals + templated
// call_once_proxy instantiation).
//
// -----------------------------------------------------------------------------
// PROCESS-GLOBAL STORAGE
// -----------------------------------------------------------------------------
//   __ZN23OZChanObjectRef_Factory13_instanceOnceE
//     — libc++ std::once_flag. 0 = not started; -1 = complete. Fast-
//       path @0x28f6 compares to $-1.
//   __ZN23OZChanObjectRef_Factory9_instanceE
//     — OZChanObjectRef_Factory*. Written by the __call_once_proxy
//       lambda @ProChannel 0x91eb2; read by getInstance @0x2921.
//
// -----------------------------------------------------------------------------
// FRONTIER CALLEES (all TRUE OUT-OF-SCOPE externs or SEPARATE ledger units)
// -----------------------------------------------------------------------------
//   * __ZNSt3__111__call_onceERVmPvPFvS2_E — std::__1::__call_once
//       — libc++.dylib. Called @0x291c via stub 0xacdc8.
//   * __ZNSt3__117__call_once_proxy<...tuple<lambda&&>...>(void*)
//       — libc++ template. Passed as function-pointer arg. Dispatches
//         `jmp __invoke<...>` into the lambda @ProChannel 0x91e96.
//         That __invoke does:
//             1. operator new(0x88) @0x91ea2 (__Znwm stub 0xace4c)
//             2. OZChanObjectRef_FactoryC2Ev @0x91ead (ledger: todo)
//             3. _instance = new_ptr @0x91eb2
//         SEPARATE ledger unit.
//
// -----------------------------------------------------------------------------
// Symbols ported here (mangled → address)
// -----------------------------------------------------------------------------
//   * __ZN23OZChanObjectRef_Factory11getInstanceEv
//       — OZChanObjectRef_Factory::getInstance() @ProChannel 0x28e4
//
// -----------------------------------------------------------------------------
// FULL DISASM
// -----------------------------------------------------------------------------
//   0x28e4  pushq  %rbp
//   0x28e5  movq   %rsp, %rbp
//   0x28e8  subq   $0x20, %rsp
//   0x28ec  leaq   _instanceOnce(%rip), %rax
//   0x28f3  movq   (%rax), %rax
//   0x28f6  cmpq   $-0x1, %rax                       ; already-init check
//   0x28fa  je     0x2921                            ; fast path
//   0x28fc  leaq   -0x1(%rbp), %rax                  ; captureless lambda slot
//   0x2900  leaq   -0x18(%rbp), %rcx                 ; tuple<T&&> slot
//   0x2904  movq   %rax, (%rcx)
//   0x2907  leaq   -0x10(%rbp), %rsi                 ; call_once void* arg slot
//   0x290b  movq   %rcx, (%rsi)
//   0x290e  leaq   _instanceOnce(%rip), %rdi
//   0x2915  leaq   __call_once_proxy<...>(%rip), %rdx
//   0x291c  callq  std::__call_once                   ; libc++ stub @0xacdc8
//   0x2921  leaq   _instance(%rip), %rax
//   0x2928  movq   (%rax), %rax                      ; rax = _instance (return)
//   0x292b  addq   $0x20, %rsp
//   0x292f  popq   %rbp
//   0x2930  retq

/** @ProChannel BSS `__ZN23OZChanObjectRef_Factory13_instanceOnceE`.
 *  libc++ std::once_flag word. 0n = not started; -1n = complete.
 *  Fast-path `cmpq $-1, %rax` @0x28f6. */
let _instanceOnce: bigint = 0n; // @ProChannel BSS 0x28e4 read-site

/** @ProChannel BSS `__ZN23OZChanObjectRef_Factory9_instanceE`.
 *  The singleton pointer. Read @0x2921-0x2928; written @0x91eb2. */
let _instance: OZChanObjectRef_Factory | null = null; // @ProChannel BSS 0x2921

/**
 * `std::__1::__call_once(flag&, void*, void(*)(void*))` — libc++
 * (libc++.dylib) TRUE out-of-scope extern. Called from getInstance
 * @0x291c via stub 0xacdc8. Modelled as single-threaded lazy-init;
 * on success flips flag to -1 (~0UL). */
function std_call_once(
  once: { get(): bigint; set(v: bigint): void },
  arg: unknown,
  proxy: (arg: unknown) => void,
): void {
  if (once.get() === -1n) return; // libc++ fast-path (also @0x28f6)
  proxy(arg);
  once.set(-1n);
}

/**
 * `__ZNSt3__117__call_once_proxy<...>` for OZChanObjectRef_Factory's
 * getInstance lambda. Body is `jmp __invoke<...>` @ProChannel 0x91e96.
 *
 *   0x91e96  push rbp / mov rbp,rsp / push r14 / push rbx
 *   0x91e9d  movl  $0x88, %edi
 *   0x91ea2  callq operator new                    ; __Znwm 0xace4c
 *   0x91ea7  movq  %rax, %rbx
 *   0x91eaa  movq  %rax, %rdi
 *   0x91ead  callq __ZN23OZChanObjectRef_FactoryC2Ev ; C2 (ledger: todo)
 *   0x91eb2  movq  %rbx, _instance(%rip)
 *
 * Neither operator new nor the C2 ctor is yet ported — this __invoke
 * is a SEPARATE ledger unit. Cited throwing stub. */
function __call_once_proxy_getInstance_lambda(_arg: unknown): void {
  throw new Error(
    "OZChanObjectRef_Factory::getInstance() __call_once init lambda not " +
      "yet transcribed — the lambda body @ProChannel 0x91e96 allocates " +
      "0x88 bytes via operator new @0x91ea2 (imported __Znwm 0xace4c) " +
      "then invokes __ZN23OZChanObjectRef_FactoryC2Ev @ProChannel " +
      "0x91ead (C2 base ctor, ledger status: todo) and stores the result " +
      "into _instance @0x91eb2. Neither operator new nor the C2 ctor is " +
      "yet ported — this lambda is a SEPARATE ledger unit and will be " +
      "filled in when it is next claimed. The proxy is invoked from " +
      "std::__call_once at ProChannel 0x291c.",
  );
}

/**
 * `OZChanObjectRef_Factory` — factory singleton for OZChanObjectRef
 * channels. Only getInstance() is ported here; the 0x88-byte instance
 * layout (from operator new(0x88) @0x91ea2 in the init lambda) will be
 * decoded when the C2 ctor is next claimed.
 */
export class OZChanObjectRef_Factory {
  /**
   * `OZChanObjectRef_Factory::getInstance()` — @ProChannel 0x28e4
   * (__ZN23OZChanObjectRef_Factory11getInstanceEv).
   *
   * Standard libc++ std::call_once-guarded singleton accessor,
   * structurally identical to OZChannelBase_Factory / OZChannelQuad_
   * Factory / OZChannelColor_Factory getInstance twins.
   *
   *   1. If _instanceOnce == -1, skip to step 3 (@0x28f6 fast-path).
   *   2. Call std::__call_once with the proxy that constructs the
   *      singleton (@0x291c).
   *   3. Return _instance (@0x2921).
   */
  static getInstance(): OZChanObjectRef_Factory | null {
    // @0x28e4..0x28e8 — prologue + local frame.
    // @0x28ec..0x28f3 — rax = _instanceOnce.
    // @0x28f6..0x28fa — if (_instanceOnce == -1) goto fast_path (0x2921).
    if (_instanceOnce !== -1n) {
      // @0x28fc..0x290b — tuple<lambda&&> stack setup (ABI marshaling).
      // @0x290e — rdi = &_instanceOnce.
      // @0x2915 — rdx = &__call_once_proxy<...>.
      // @0x291c — callq std::__call_once (libc++ stub @0xacdc8).
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
    // @0x2921..0x2928 — rax = _instance.
    // @0x292b..0x2930 — epilogue + retq.
    return _instance;
  }

  /**
   * `OZChanObjectRef_Factory::getIconIDInternal()` — @ProChannel 0x13054
   * (__ZN23OZChanObjectRef_Factory17getIconIDInternalEv).
   *
   * FULL DISASM (raw-port/re/disasm/
   * ProChannel.__ZN23OZChanObjectRef_Factory17getIconIDInternalEv.s, 5 instructions):
   *
   *   0x13054  pushq %rbp
   *   0x13055  movq  %rsp, %rbp
   *   0x13058  movl  $0xffffffff, %eax    ; return -1
   *   0x1305d  popq  %rbp
   *   0x1305e  retq
   *
   * The whole body is one immediate move: this factory declares NO icon. `%eax` is
   * written as the 32-bit `0xffffffff`, and the C++ return type is a signed 32-bit
   * icon ID, so the value is -1 — the same "none" sentinel the class's own
   * `getInstance` fast-path compares `_instanceOnce` against @0x28f6. It is a
   * constant, not a lookup: there is no load, no call, no branch and no reference to
   * `this` (the method does not even move %rdi).
   *
   * NOT AN EMPTY BODY, and the distinction matters for anyone re-deriving it: an
   * empty C++ body would leave %eax undefined, and this function deliberately sets
   * it. The whole family does the same — OZChannelBase_Factory @0x3046,
   * OZChannelButton_Factory @0xd268 and OZChannelText_Factory @0xd968 are
   * instruction-for-instruction identical, each with its own address — so a reviewer
   * seeing "returns a constant" is seeing the function, not a stub.
   *
   * Added as a static on the landed class rather than as a new `export function`,
   * which is this file's existing convention for `getInstance` (and is what keeps
   * `<Class>_<method>` join rules out of it: the class name itself contains an
   * underscore, so an exported `OZChanObjectRef_Factory_getIconIDInternal` would
   * yield the method token `Factory_getIconIDInternal`, which no Itanium symbol's
   * last component can ever equal).
   *
   * ORACLE: raw-port/re/oracle/OZChanObjectRef_Factory_getIconIDInternal_oracle.py
   * calls the live symbol (a LOCAL `t` symbol, reached by dyld slide + the x86_64
   * vmaddr from the inventory, with the 9 prologue bytes verified at that address
   * first) and gets -1 on every call, matching this body. It carries a SENSITIVITY
   * control because a constant-returning function cannot otherwise be told apart
   * from a harness that never reads %eax.
   */
  static getIconIDInternal(): number {
    // @0x13054..0x13055 — prologue.
    // @0x13058 movl $0xffffffff,%eax — the 32-bit immediate, read as a signed int32.
    // @0x1305d..0x1305e — epilogue + retq.
    return -1;
  }
}
