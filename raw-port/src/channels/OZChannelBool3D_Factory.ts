// OZChannelBool3D_Factory — ProChannel factory singleton for OZChannelBool3D.
//
// Transcribed from /Applications/Final Cut Pro.app/Contents/Frameworks/
// ProChannel.framework/Versions/A/ProChannel (x86_64 slice; unadjusted
// VAs from `otool -tV`). Disassembly source:
//   raw-port/re/disasm/ProChannel.__ZN23OZChannelBool3D_Factory11getInstanceEv.s
//
// This unit ports ONLY the `getInstance()` static singleton accessor at
// @0x1bca. The remaining methods on this factory are separate ledger
// entries and are OUT OF SCOPE for this file.
//
// -----------------------------------------------------------------------------
// PROCESS-GLOBAL STORAGE
// -----------------------------------------------------------------------------
//   __ZN23OZChannelBool3D_Factory13_instanceOnceE
//     — the libc++ std::once_flag word. 0 = "not started", -1 (~0UL) =
//       "init done". The `cmpq $-0x1, %rax` at @0x1bdc is the standard
//       libc++ fast-path check.
//
//   __ZN23OZChannelBool3D_Factory9_instanceE
//     — a `OZChannelBool3D_Factory*` (pointer to the singleton). Written by the
//       __call_once_proxy lambda; read by getInstance @0x1c07.
//
// -----------------------------------------------------------------------------
// FRONTIER CALLEES (all TRUE OUT-OF-SCOPE externs or SEPARATE ledger units)
// -----------------------------------------------------------------------------
//   * __ZNSt3__111__call_onceERVmPvPFvS2_E
//       — std::__1::__call_once(flag&, void*, void(*)(void*))
//       — libc++ (libc++.dylib) — TRUE out-of-scope extern. Called
//         @0x1c02 via ProChannel stub 0xacdc8.
//
//   * __ZNSt3__117__call_once_proxy<...tuple<OZChannelBool3D_Factory::getInstance()::lambda&&>...>
//       — libc++ template instantiation. NOT called by getInstance
//         directly — PASSED AS A DATA REFERENCE to __call_once. The
//         lambda body allocates a OZChannelBool3D_Factory via operator new and invokes
//         the C2 base ctor (__ZN23OZChannelBool3D_FactoryC2Ev) — both SEPARATE
//         ledger entries. We model the frontier by raising at the
//         __call_once callq boundary (Style-B, honest peer of
//         OZChannelBase_Factory / OZChanObjectRef_Factory).
//
// -----------------------------------------------------------------------------
// Symbols ported here (mangled → address)
// -----------------------------------------------------------------------------
//   * __ZN23OZChannelBool3D_Factory11getInstanceEv
//       — OZChannelBool3D_Factory::getInstance() @ProChannel 0x1bca

/** @ProChannel BSS `__ZN23OZChannelBool3D_Factory13_instanceOnceE`.
 *  libc++ std::once_flag word. 0n = not started; -1n = completed.
 *  getInstance compares this to $-1 @0x1bdc as its fast-path check. */
let _instanceOnce: bigint = 0n; // @ProChannel BSS 0x1bd2 read-site

/** @ProChannel BSS `__ZN23OZChannelBool3D_Factory9_instanceE`.
 *  The singleton pointer. Read @0x1c07. Written by the
 *  __call_once_proxy lambda (a SEPARATE ledger entry). */
let _instance: OZChannelBool3D_Factory | null = null; // @ProChannel BSS 0x1c07

/**
 * `std::__1::__call_once(flag&, void* arg, void(*)(void*))` — libc++
 * (libc++.dylib). Called from getInstance @0x1c02 via ProChannel stub
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
  if (once.get() === -1n) return; // (mirrors 0x1bdc fast-path exit)
  proxy(arg);
  once.set(-1n);
}

/**
 * `__ZNSt3__117__call_once_proxy<...>` — libc++ template instantiation.
 * Body allocates a fresh OZChannelBool3D_Factory via `operator new` and invokes
 * `OZChannelBool3D_Factory::OZChannelBool3D_Factory()` (the C2 base ctor,
 * __ZN23OZChannelBool3D_FactoryC2Ev) then stores the pointer into `_instance`.
 * Neither the C2 ctor nor operator new (__Znwm) is called by
 * getInstance directly — this proxy is a SEPARATE ledger entry.
 * Raising at the __call_once boundary faithfully reflects the deferred
 * work. */
function __call_once_proxy_getInstance_lambda(_arg: unknown): void {
  throw new Error(
    "OZChannelBool3D_Factory::getInstance() __call_once init lambda not " +
      "yet transcribed — the lambda body allocates a OZChannelBool3D_Factory " +
      "via operator new (__Znwm, ProChannel stub 0xace4c) and invokes " +
      "__ZN23OZChannelBool3D_FactoryC2Ev (the C2 base ctor — SEPARATE ledger " +
      "entry) then stores the result into _instance. The proxy is " +
      "invoked from std::__call_once at ProChannel 0x1c02.",
  );
}

/**
 * `OZChannelBool3D_Factory` — factory singleton. Only its getInstance() accessor is
 * ported in this file; every other method is a separate ledger entry.
 */
export class OZChannelBool3D_Factory {
  /**
   * `OZChannelBool3D_Factory::getInstance()` — @ProChannel 0x1bca
   * (__ZN23OZChannelBool3D_Factory11getInstanceEv).
   *
   * Faithful transcription of the disassembly in the file header.
   * Standard libc++ std::call_once-guarded singleton accessor:
   *   1. Read _instanceOnce; if == $-1, skip to step 3.
   *   2. std::__call_once(&_instanceOnce, &tuple, &proxy) — proxy
   *      allocates + constructs the singleton and stores into _instance.
   *   3. Return _instance (or NULL if init threw).
   */
  static getInstance(): OZChannelBool3D_Factory | null {
    // @0x1bca..prologue.
    // BSS load: rax = _instanceOnce.
    // @0x1bdc..0x1be0 — if (_instanceOnce == -1) goto fast_path (0x1c07).
    if (_instanceOnce !== -1n) {
      // Stack tuple<lambda&&> setup (ABI-level, no TS-visible effect).
      // rdi = &_instanceOnce; rdx = &__call_once_proxy<...>.
      // @0x1c02 — callq std::__call_once (libc++ stub @0xacdc8).
      std_call_once(
        {
          get: (): bigint => _instanceOnce,
          set: (v: bigint): void => {
            _instanceOnce = v;
          },
        },
        null, // ABI void* — real disasm passes &tuple; our proxy ignores it.
        __call_once_proxy_getInstance_lambda,
      );
    }
    // @0x1c07 — rax = _instance.
    // @0x1c16 — epilogue + retq.
    return _instance;
  }
}
