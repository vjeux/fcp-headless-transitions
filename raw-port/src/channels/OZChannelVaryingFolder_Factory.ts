// OZChannelVaryingFolder_Factory — ProChannel factory singleton for
// OZChannelVaryingFolder.
//
// Transcribed from /Applications/Final Cut Pro.app/Contents/Frameworks/
// ProChannel.framework/Versions/A/ProChannel (x86_64 slice; unadjusted
// VAs from `otool -tV`). Disassembly source:
//   raw-port/re/disasm/ProChannel.__ZN30OZChannelVaryingFolder_Factory11getInstanceEv.s
//
// Only `getInstance()` @ProChannel 0x2194 is ported here. The remaining
// methods on this factory (C2/D1/D0/createInstance/createChannel*/...)
// are separate ledger entries — per "one class per file" they'll be
// added to THIS file when claimed in future depclaim rounds.
//
// Structurally identical to the peer factories already merged:
//   OZChanObjectRef_Factory (@0x28e4), OZChannelBase_Factory (@0xhonest),
//   OZChannelAngle_Factory / _Color_Factory / _Bool_Factory / etc.
// Every FCP PCSingleton-derived factory compiles to a byte-for-byte
// identical getInstance() skeleton (differs only in globals + templated
// call_once_proxy instantiation + BSS symbol names).
//
// -----------------------------------------------------------------------------
// PROCESS-GLOBAL STORAGE (BSS)
// -----------------------------------------------------------------------------
//   __ZN30OZChannelVaryingFolder_Factory13_instanceOnceE
//     — libc++ std::once_flag word (8 bytes). 0 = not started; -1 =
//       complete. Fast-path @0x21a6 compares to $-1.
//   __ZN30OZChannelVaryingFolder_Factory9_instanceE
//     — OZChannelVaryingFolder_Factory*. Written by the __call_once_proxy
//       lambda (SEPARATE ledger unit); read by getInstance @0x21d1.
//
// -----------------------------------------------------------------------------
// FRONTIER CALLEES (all TRUE OUT-OF-SCOPE externs or SEPARATE ledger units)
// -----------------------------------------------------------------------------
//   * __ZNSt3__111__call_onceERVmPvPFvS2_E — std::__1::__call_once
//       — libc++.dylib. Called @0x21cc via stub 0xacdc8. TRUE
//         out-of-scope extern (libc++ threading primitive).
//   * __ZNSt3__117__call_once_proxy<...tuple<lambda&&>...>(void*)
//       — libc++ template. Passed as function-pointer arg @0x21c5.
//         Dispatches (`jmp __invoke<...>`) into the getInstance lambda.
//         The lambda body does:
//             1. operator new(sizeof(OZChannelVaryingFolder_Factory))
//                @__Znwm stub 0xace4c
//             2. OZChannelVaryingFolder_Factory C2 base ctor
//             3. _instance = new_ptr
//         SEPARATE ledger unit (its own claim + branch).
//
// -----------------------------------------------------------------------------
// Symbols ported here (mangled → address)
// -----------------------------------------------------------------------------
//   * __ZN30OZChannelVaryingFolder_Factory11getInstanceEv
//       — OZChannelVaryingFolder_Factory::getInstance() @ProChannel 0x2194
//
// -----------------------------------------------------------------------------
// FULL DISASM (raw-port/re/disasm/ProChannel.__ZN30OZChannelVaryingFolder_Factory11getInstanceEv.s)
// -----------------------------------------------------------------------------
//   0x2194  pushq  %rbp
//   0x2195  movq   %rsp, %rbp
//   0x2198  subq   $0x20, %rsp
//   0x219c  leaq   _instanceOnce(%rip), %rax        ; addr = 0x21a3 + off
//   0x21a3  movq   (%rax), %rax                     ; rax = *_instanceOnce
//   0x21a6  cmpq   $-0x1, %rax                      ; sentinel = -1
//   0x21aa  je     0x21d1                           ; fast path
//   0x21ac  leaq   -0x1(%rbp), %rax                 ; captureless lambda byte
//   0x21b0  leaq   -0x18(%rbp), %rcx                ; tuple<lambda&&> slot
//   0x21b4  movq   %rax, (%rcx)                     ; tuple->ref = &lambda
//   0x21b7  leaq   -0x10(%rbp), %rsi                ; call_once void* arg
//   0x21bb  movq   %rcx, (%rsi)                     ; arg = &tuple
//   0x21be  leaq   _instanceOnce(%rip), %rdi
//   0x21c5  leaq   __call_once_proxy<...>(%rip), %rdx
//   0x21cc  callq  0xacdc8                          ; std::__call_once stub
//   0x21d1  leaq   _instance(%rip), %rax
//   0x21d8  movq   (%rax), %rax                     ; rax = _instance
//   0x21db  addq   $0x20, %rsp
//   0x21df  popq   %rbp
//   0x21e0  retq
//
// The compare `cmpq $-0x1, %rax` at @0x21a6 makes the SENTINEL EXACTLY -1n
// (not 1). Any getInstance model that fabricates `new OZChannelVaryingFolder_Factory()`
// in the getInstance frame or reads a `=== 1` sentinel is a cheat — the
// in-frame call is EXCLUSIVELY libc++ __call_once, and the allocation +
// C2 dispatch live INSIDE the proxy lambda (see CHEAT_INCIDENT_2026-07-29.md
// for the exact signature this port MUST NOT match).

/** @ProChannel BSS `__ZN30OZChannelVaryingFolder_Factory13_instanceOnceE`.
 *  libc++ std::once_flag word. 0n = not started; -1n = complete.
 *  Fast-path `cmpq $-1, %rax` @0x21a6. */
let _instanceOnce: bigint = 0n; // @ProChannel BSS (read @0x219c)

/** @ProChannel BSS `__ZN30OZChannelVaryingFolder_Factory9_instanceE`.
 *  The singleton pointer. Read @0x21d1/0x21d8; written by the SEPARATE-
 *  ledger init lambda's tail. */
let _instance: OZChannelVaryingFolder_Factory | null = null; // @ProChannel BSS (read @0x21d1)

/**
 * `std::__1::__call_once(flag&, void*, void(*)(void*))` — libc++
 * (libc++.dylib) TRUE out-of-scope extern. Called from getInstance
 * @0x21cc via stub 0xacdc8. Modelled as single-threaded lazy-init;
 * on success flips flag to -1n (same sentinel the disasm checks
 * against @0x21a6). */
function std_call_once(
  once: { get(): bigint; set(v: bigint): void },
  arg: unknown,
  proxy: (arg: unknown) => void,
): void {
  if (once.get() === -1n) return; // libc++ fast-path (mirrors @0x21a6)
  proxy(arg);
  once.set(-1n);
}

/**
 * `__ZNSt3__117__call_once_proxy<...>` for OZChannelVaryingFolder_Factory's
 * getInstance lambda. Referenced @0x21c5 in getInstance. The proxy is a
 * thin `jmp __invoke<...>` shim into the captureless lambda body, which
 * performs `operator new(sizeof(Factory))` (__Znwm stub 0xace4c), then
 * `OZChannelVaryingFolder_Factory::OZChannelVaryingFolder_Factory()` [C2],
 * then stores the returned pointer into `_instance`.
 *
 * Neither operator new nor the C2 ctor is yet ported in this framework —
 * this proxy is a SEPARATE ledger unit. Cited throwing stub. */
function __call_once_proxy_getInstance_lambda(_arg: unknown): void {
  throw new Error(
    "OZChannelVaryingFolder_Factory::getInstance() __call_once init lambda " +
      "not yet transcribed — the lambda allocates sizeof(Factory) bytes " +
      "via operator new (__Znwm stub @ProChannel 0xace4c), invokes the " +
      "OZChannelVaryingFolder_Factory C2 base ctor (mangled " +
      "__ZN30OZChannelVaryingFolder_FactoryC2Ev, ledger status: todo), and " +
      "stores the result into _instance. All three (__Znwm, the lambda " +
      "wrapper, and C2) are separate ledger units. The proxy is invoked " +
      "from std::__call_once at ProChannel 0x21cc.",
  );
}

/**
 * `OZChannelVaryingFolder_Factory` — factory singleton for OZChannel
 * "varying folder" channels (procedurally-varying grouped channel).
 * Only getInstance() is ported here; the instance layout (from
 * operator new(sizeof) in the init lambda) will be decoded when the
 * C2 ctor is next claimed.
 */
export class OZChannelVaryingFolder_Factory {
  /**
   * `OZChannelVaryingFolder_Factory::getInstance()` — @ProChannel 0x2194
   * (__ZN30OZChannelVaryingFolder_Factory11getInstanceEv).
   *
   * Standard libc++ std::call_once-guarded singleton accessor,
   * structurally identical to OZChanObjectRef_Factory / OZChannelBase_
   * Factory getInstance twins. Instruction-by-instruction mirror of
   * the disasm quoted in the file header.
   *
   *   1. If _instanceOnce == -1n, skip to step 3 (@0x21a6 fast-path).
   *   2. Call std::__call_once with the proxy that constructs the
   *      singleton (@0x21cc).
   *   3. Return _instance (@0x21d1).
   */
  static getInstance(): OZChannelVaryingFolder_Factory | null {
    // @0x2194..0x2198 — prologue + local frame (0x20 bytes for the
    //   {captureless-lambda byte, tuple<lambda&&>, call_once arg slot}
    //   trio the compiler materialises for libc++ __call_once).
    // @0x219c..0x21a3 — rax = *_instanceOnce (BSS load).
    // @0x21a6..0x21aa — if (_instanceOnce == -1) je 0x21d1 (fast path).
    if (_instanceOnce !== -1n) {
      // @0x21ac..0x21bb — stack-materialise the tuple<lambda&&> the
      //   libc++ __call_once ABI expects. Captureless lambda has no
      //   state beyond a 1-byte placeholder (rbp-0x1); tuple wraps a
      //   reference to that byte; the call_once arg is a pointer to
      //   the tuple. Not observable in TS: our proxy takes no args.
      // @0x21be — rdi = &_instanceOnce.
      // @0x21c5 — rdx = &__call_once_proxy<...>.
      // @0x21cc — callq std::__call_once (libc++ stub @0xacdc8).
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
    // @0x21d1..0x21d8 — rax = *_instance (BSS load, returned in rax).
    // @0x21db..0x21e0 — epilogue + retq.
    return _instance;
  }
}
