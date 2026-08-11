// OZChannelAspectRatioFootage_Factory — ProChannel factory singleton
// for OZChannelAspectRatioFootage.
//
// Transcribed from /Applications/Final Cut Pro.app/Contents/Frameworks/
// ProChannel.framework/Versions/A/ProChannel (x86_64 slice; unadjusted
// VAs from `otool -tV`). Disassembly source:
//   raw-port/re/disasm/ProChannel.__ZN35OZChannelAspectRatioFootage_Factory11getInstanceEv.s
//
// Ported here: `getInstance()` @ProChannel 0x1a44 and `getIconIDInternal()` @ProChannel 0x64b0
// (added by its own ledger unit; ADD-only, see G6). The remaining methods on this factory
// (C2/D1/D0/create*/createChannel*/version/getBundleID/getIconNameInternal/... etc.) are
// separate ledger entries and get ADDED to this same file when they are claimed.
//
// Structurally identical to the OZChanObjectRef_Factory /
// OZChannelBase_Factory / OZChannelQuad_Factory / OZChannelColor_
// Factory getInstance ports — every FCP PCSingleton-derived factory
// compiles to a byte-for-byte identical getInstance() skeleton
// (differs only in the address of the two BSS globals + the templated
// __call_once_proxy instantiation the compiler emits).
//
// -----------------------------------------------------------------------------
// PROCESS-GLOBAL STORAGE
// -----------------------------------------------------------------------------
//   __ZN35OZChannelAspectRatioFootage_Factory13_instanceOnceE
//     — libc++ std::once_flag. 0 = not started; -1 = complete. Fast-
//       path @0x1a56 compares to $-1.
//   __ZN35OZChannelAspectRatioFootage_Factory9_instanceE
//     — OZChannelAspectRatioFootage_Factory*. Written by the
//       __call_once_proxy lambda; read @0x1a81.
//
// -----------------------------------------------------------------------------
// FRONTIER CALLEES (all TRUE OUT-OF-SCOPE externs or SEPARATE ledger units)
// -----------------------------------------------------------------------------
//   * __ZNSt3__111__call_onceERVmPvPFvS2_E — std::__1::__call_once
//       — libc++.dylib. Called @0x1a7c via stub 0xacdc8.
//   * __ZNSt3__117__call_once_proxy<...tuple<lambda&&>...>(void*)
//       — libc++ template. Passed as function-pointer arg @0x1a75.
//         Dispatches into the getInstance() lambda that: (1) operator
//         new(sizeof(OZChannelAspectRatioFootage_Factory)), (2) runs
//         the C2 base ctor, (3) stores the result in _instance. That
//         lambda body is a SEPARATE ledger unit (not yet claimed;
//         no in-frame `new` here — the boundary lives inside libc++).
//
// -----------------------------------------------------------------------------
// Symbols ported here (mangled → address)
// -----------------------------------------------------------------------------
//   * __ZN35OZChannelAspectRatioFootage_Factory11getInstanceEv
//       — OZChannelAspectRatioFootage_Factory::getInstance() @ProChannel 0x1a44
//
// -----------------------------------------------------------------------------
// FULL DISASM
// -----------------------------------------------------------------------------
//   0x1a44  pushq  %rbp
//   0x1a45  movq   %rsp, %rbp
//   0x1a48  subq   $0x20, %rsp
//   0x1a4c  leaq   _instanceOnce(%rip), %rax
//   0x1a53  movq   (%rax), %rax
//   0x1a56  cmpq   $-0x1, %rax                       ; already-init check
//   0x1a5a  je     0x1a81                            ; fast path
//   0x1a5c  leaq   -0x1(%rbp), %rax                  ; captureless lambda slot
//   0x1a60  leaq   -0x18(%rbp), %rcx                 ; tuple<T&&> slot
//   0x1a64  movq   %rax, (%rcx)
//   0x1a67  leaq   -0x10(%rbp), %rsi                 ; call_once void* arg slot
//   0x1a6b  movq   %rcx, (%rsi)
//   0x1a6e  leaq   _instanceOnce(%rip), %rdi
//   0x1a75  leaq   __call_once_proxy<...>(%rip), %rdx
//   0x1a7c  callq  std::__call_once                   ; libc++ stub @0xacdc8
//   0x1a81  leaq   _instance(%rip), %rax
//   0x1a88  movq   (%rax), %rax                      ; rax = _instance (return)
//   0x1a8b  addq   $0x20, %rsp
//   0x1a8f  popq   %rbp
//   0x1a90  retq

/** @ProChannel BSS `__ZN35OZChannelAspectRatioFootage_Factory13_instanceOnceE`.
 *  libc++ std::once_flag word. 0n = not started; -1n = complete.
 *  Fast-path `cmpq $-1, %rax` @0x1a56. */
let _instanceOnce: bigint = 0n; // @ProChannel BSS 0x1a44 read-site

/** @ProChannel BSS `__ZN35OZChannelAspectRatioFootage_Factory9_instanceE`.
 *  The singleton pointer. Read @0x1a81-0x1a88; written by the
 *  __call_once_proxy lambda (SEPARATE ledger unit). */
let _instance: OZChannelAspectRatioFootage_Factory | null = null; // @ProChannel BSS 0x1a81

/**
 * `std::__1::__call_once(flag&, void*, void(*)(void*))` — libc++
 * (libc++.dylib) TRUE out-of-scope extern. Called from getInstance
 * @0x1a7c via stub 0xacdc8. Modelled as single-threaded lazy-init;
 * on success flips flag to -1 (~0UL). */
function std_call_once(
  once: { get(): bigint; set(v: bigint): void },
  arg: unknown,
  proxy: (arg: unknown) => void,
): void {
  if (once.get() === -1n) return; // libc++ fast-path (also @0x1a56)
  proxy(arg);
  once.set(-1n);
}

/**
 * `__ZNSt3__117__call_once_proxy<...>` for OZChannelAspectRatioFootage_
 * Factory's getInstance lambda. The body allocates an instance via
 * operator new (`__Znwm` in libc++), runs the C2 base ctor, and stores
 * the result into `_instance`. Neither operator new nor the C2 ctor is
 * yet ported — this __invoke is a SEPARATE ledger unit. The `new` is
 * INSIDE __call_once_proxy (never in this frame; disasm shows no
 * in-frame `callq __Znwm`), so we model the boundary here rather than
 * fabricating `new OZChannelAspectRatioFootage_Factory()`. Cited
 * throwing stub. */
function __call_once_proxy_getInstance_lambda(_arg: unknown): void {
  throw new Error(
    "OZChannelAspectRatioFootage_Factory::getInstance() __call_once " +
      "init lambda not yet transcribed — the lambda body dispatched " +
      "from ProChannel 0x1a7c via __call_once (libc++ stub 0xacdc8) " +
      "allocates the factory via operator new (__Znwm 0xace4c), runs " +
      "__ZN35OZChannelAspectRatioFootage_FactoryC2Ev (C2 base ctor, " +
      "ledger status: todo), and stores the result into _instance. " +
      "Neither operator new nor the C2 ctor is yet ported — this " +
      "lambda is a SEPARATE ledger unit and will be filled in when it " +
      "is next claimed.",
  );
}

/**
 * `OZChannelAspectRatioFootage_Factory` — factory singleton for
 * OZChannelAspectRatioFootage channels. Only getInstance() is ported
 * here; the instance layout / size (from operator new(N) in the init
 * lambda) will be decoded when the C2 ctor is next claimed.
 */
export class OZChannelAspectRatioFootage_Factory {
  /**
   * `OZChannelAspectRatioFootage_Factory::getInstance()` @ProChannel
   * 0x1a44 (__ZN35OZChannelAspectRatioFootage_Factory11getInstanceEv).
   *
   * Standard libc++ std::call_once-guarded singleton accessor,
   * structurally identical to the other OZChan.../OZChannel..._Factory
   * getInstance twins (OZChanObjectRef_Factory, OZChannelBase_Factory,
   * etc.).
   *
   *   1. If _instanceOnce == -1, skip to step 3 (@0x1a56 fast-path).
   *   2. Call std::__call_once with the proxy that constructs the
   *      singleton (@0x1a7c).
   *   3. Return _instance (@0x1a81).
   */
  static getInstance(): OZChannelAspectRatioFootage_Factory | null {
    // @0x1a44..0x1a48 — prologue + local frame.
    // @0x1a4c..0x1a53 — rax = _instanceOnce.
    // @0x1a56..0x1a5a — if (_instanceOnce == -1) goto fast_path (0x1a81).
    if (_instanceOnce !== -1n) {
      // @0x1a5c..0x1a6b — tuple<lambda&&> stack setup (ABI marshaling).
      // @0x1a6e — rdi = &_instanceOnce.
      // @0x1a75 — rdx = &__call_once_proxy<...>.
      // @0x1a7c — callq std::__call_once (libc++ stub @0xacdc8).
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
    // @0x1a81..0x1a88 — rax = _instance.
    // @0x1a8b..0x1a90 — epilogue + retq.
    return _instance;
  }

  /** The int32 this factory reports for "no icon ID" — the immediate written by
   *  `movl $0xffffffff, %eax` @ProChannel 0x64b4. Written 32 bits wide into %eax, so it is the
   *  int32 -1 rather than the 4294967295 a 64-bit-wide write would leave in %rax. Measured: a
   *  live call read back as u64 gives 0xffffffff, i.e. the upper half of %rax is zero. */
  static readonly ICON_ID_NONE: number = -1;

  /**
   * `OZChannelAspectRatioFootage_Factory::getIconIDInternal()` — @ProChannel 0x64b0
   * (`__ZN35OZChannelAspectRatioFootage_Factory17getIconIDInternalEv`).
   *
   * FULL transcription — the body is 5 executed instructions and nothing else. Bytes read out of
   * the thin x86_64 slice (`55 48 89 e5 b8 ff ff ff ff 5d c3`) and re-checked against the mapped
   * image before the oracle below ran, because `otool -tV` symbolizes immediates as well as
   * displacements and this function IS its immediate:
   *
   *   0x64b0  55                 pushq %rbp               ; frame setup (no TS counterpart)
   *   0x64b1  48 89 e5           movq  %rsp, %rbp         ; frame setup (no TS counterpart)
   *   0x64b4  b8 ff ff ff ff     movl  $0xffffffff, %eax  ; %eax = int32 -1   <-- the whole body
   *   0x64b9  5d                 popq  %rbp               ; frame teardown (no TS counterpart)
   *   0x64ba  c3                 retq                     ; returns the int32 in %eax
   *   0x64bb  90                 nop                      ; alignment padding, never executed
   *
   * `this` (%rdi) is never dereferenced; there is no callq, no load, no allocation and no
   * indirect/virtual dispatch — `depgraph.py deps` lists no dependency at all, which is why this
   * unit was handed out with an empty dep set.
   *
   * -1 IS THE IMPLEMENTATION, NOT AN UNPORTED GAP: it is the shipped "this factory contributes no
   * icon ID" sentinel, the same one-instruction body the landed
   * `OZChanObjectManipRef_Factory::getIconIDInternal` @Ozone 0x1a8d0 carries (that file's census
   * found 94 of Ozone's 127 concrete overrides are byte-identical to it).
   *
   * ORACLE (executed, not read — raw-port/re/oracle/OZChannelAspectRatioFootage_Factory_getIconIDInternal_probe.py):
   * the symbol is `t` (local) so it is not dlsym-able; it was called BY ADDRESS in a Rosetta
   * x86_64 process at `_dyld_get_image_vmaddr_slide(ProChannel) + 0x64b0` (slide 0x10ea24000),
   * after asserting the 11 opcode bytes above are the ones mapped. Live ProChannel returned -1
   * for all four receivers — NULL, 1, 0xdeadbeef and a live 0x200-byte buffer — which also
   * demonstrates the body never touches `this`, and a u64-typed call returned 0xffffffff, which
   * is the 32-bit-write fact above.
   *
   * @returns %eax — always -1 (@0x64b4).
   */
  getIconIDInternal(): number {
    // @0x64b4  movl $0xffffffff, %eax   /   @0x64ba  retq
    return OZChannelAspectRatioFootage_Factory.ICON_ID_NONE;
  }
}
