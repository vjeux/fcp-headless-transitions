// raw-port/src/channels/OZChannelDouble_Factory.ts
//
// FCP `OZChannelDouble_Factory` (ProChannel.framework) — factory singleton for the
// corresponding OZChannel subclass. This file transcribes ONLY its
// `getInstance()` accessor from the ProChannel x86_64 slice at file
// offset 0x1822 (see raw-port/re/disasm/ProChannel.__ZN23OZChannelDouble_Factory11getInstanceEv.s).
//
// Standard libc++ `std::__1::call_once`-guarded singleton pattern — same
// in-memory once-flag + pointer globals + call_once thunk shape as the
// already-ported peers `OZChannel_Factory::getInstance()` @0x17d4 and
// `OZChannelPositionPercent3D_Factory::getInstance()` @0xa6186:
//
//   __ZN23OZChannelDouble_Factory13_instanceOnceE   // once-flag  (u64; -1 = "already ran")
//   __ZN23OZChannelDouble_Factory9_instanceE        // singleton pointer (fills after ctor)
//
// Provenance: /Applications/Final Cut Pro.app/Contents/Frameworks/
//             ProChannel.framework/Versions/A/ProChannel (x86_64).
//
// Ledger addresses (raw-port/army/ledger/ProChannel.ledger.json → OZChannelDouble_Factory):
//   0x1822    OZChannelDouble_Factory::getInstance()                     [THIS UNIT]
//   0x33fc   OZChannelDouble_Factory::OZChannelDouble_Factory()                    [C2, frontier stub]
//   0x33bd   libc++ __invoke thunk (operator new(0x88) + ctor)
//
// This file ports ONLY `getInstance()`; the ctor @0x33fc is a
// SEPARATE ledger unit. Every in-scope callee of the ctor (OZFactory C2,
// PCSingleton C2) is already ported, so the ctor is READY for a claim.

// ═════════════════════════════════════════════════════════════════════════
// Frontier callees — every out-of-scope / not-yet-transcribed symbol used
// by `getInstance()`'s call_once path, surfaced as a throwing stub that
// cites its @0xADDR.
// ═════════════════════════════════════════════════════════════════════════

/** `std::__1::__call_once(unsigned long&, void*, void(*)(void*))`
 *  — libc++ boundary/extern. Called by `getInstance` through the PLT
 *  symbol stub at 0xacdc8. Not in the port scope (libc++). */
function StdCallOnce_stub(
  _once: { flag: 0 | 1 },
  _ctx: unknown,
  _proxy: (arg: unknown) => void,
): void {
  throw new Error(
    "std::__1::__call_once __ZNSt3__111__call_onceERVmPvPFvS2_E " +
      "@ProChannel imported stub 0xacdc8 — libc++ extern, not transcribed",
  );
}

/** `OZChannelDouble_Factory::OZChannelDouble_Factory()` C2 body @ProChannel 0x33fc.
 *  Invoked (via libc++ __invoke thunk @0x33bd) by the once-thunk
 *  to construct the singleton on a fresh 0x88-byte heap block.
 *  In-scope, NOT yet ported (separate ledger entry). Frontier stub. */
function OZChannelDouble_Factory_ctor_stub(_this: OZChannelDouble_Factory): void {
  throw new Error(
    "OZChannelDouble_Factory::OZChannelDouble_Factory() @ProChannel 0x33fc " +
      "__ZN23OZChannelDouble_FactoryC2Ev — not yet transcribed (separate ledger unit)",
  );
}

/** `operator new(unsigned long)` — libc extern. Called (via libc++ __invoke
 *  thunk @ProChannel 0x33bd: `movl $0x88,%edi; callq __Znwm`)
 *  to allocate the singleton block. Out of scope. */
function OperatorNew_stub(_size: number): OZChannelDouble_Factory {
  throw new Error(
    "operator new(unsigned long) __Znwm " +
      "@ProChannel imported stub 0xace4c — libc extern, not transcribed",
  );
}

// ═════════════════════════════════════════════════════════════════════════
// `OZChannelDouble_Factory` — only `getInstance()` is ported here.
// ═════════════════════════════════════════════════════════════════════════

/**
 * `OZChannelDouble_Factory` — ProChannel factory singleton. Extends `OZChannelFactory`
 * (primary base) and embeds a `PCSingleton` subobject at +0x80. Total
 * instance size is 0x88 bytes (from the __invoke thunk @0x33bd).
 *
 * STRUCT LAYOUT (inferred from the C2 ctor @0x33fc; identical two-vptr
 * + OZFactory + PCSingleton subobject pattern to OZChannel_Factory @0x3196):
 *   +0x000  primary vptr    (this class's vtable+0x10)
 *   +0x080  secondary vptr  / PCSingleton subobject
 *   [size = 0x88 bytes]
 */
export class OZChannelDouble_Factory {
  /**
   * Program-global once-flag `__ZN23OZChannelDouble_Factory13_instanceOnceE` (unsigned long in the
   * framework's BSS). RIP-addressed at @0x1822. The libc++ "already
   * ran" sentinel is -1 (all-ones) — from `cmpq $-0x1,%rax` in the fn.
   * Modeled as 0/1 in JS (single-threaded runtime).
   */
  private static _instanceOnce: 0 | 1 = 0;

  /**
   * Program-global singleton pointer `__ZN23OZChannelDouble_Factory9_instanceE`. Written by the
   * libc++ __invoke thunk @0x33bd after the C2 ctor returns.
   */
  private static _instance: OZChannelDouble_Factory | null = null;

  /**
   * `OZChannelDouble_Factory::OZChannelDouble_Factory()` @ProChannel 0x33fc. NOT this unit —
   * declared so `new OZChannelDouble_Factory()` in the once-thunk compiles; body is
   * a frontier stub. All in-scope callees of the ctor (OZFactory C2,
   * PCSingleton C2) are already ported, so it is READY for a future claim.
   */
  public constructor() {
    OZChannelDouble_Factory_ctor_stub(this);
  }

  /**
   * `OZChannelDouble_Factory::getInstance()` @ProChannel 0x1822.
   *
   * Faithful transcription of raw-port/re/disasm/ProChannel.__ZN23OZChannelDouble_Factory11getInstanceEv.s
   * (22-line body, identical up to the RIP-relative offsets to the peer
   * accessors already ported at @0x17d4, @0x258a, @0xa6186):
   *
   *   0x1822  prolog (push %rbp; mov %rsp,%rbp; sub $0x20,%rsp)
   *          leaq  _instanceOnce(%rip),%rax
   *          movq  (%rax),%rax                        ; load onceFlag
   *          cmpq  $-0x1,%rax                          ; already ran?
   *          je    <load-_instance>                    ; yes -> return
   *          <build 3-deep addr chain for empty lambda tuple on stack>
   *          leaq  _instanceOnce(%rip),%rdi            ; &onceFlag
   *          leaq  __call_once_proxy<...>(%rip),%rdx   ; &proxy
   *          callq std::__1::__call_once               ; PLT stub @0xacdc8
   *          leaq  _instance(%rip),%rax
   *          movq  (%rax),%rax                         ; load _instance
   *          epilog (add $0x20,%rsp; pop %rbp; retq)
   *
   * The __invoke thunk @0x33bd does the actual construction:
   *   movl $0x88,%edi ; callq __Znwm
   *   callq __ZN23OZChannelDouble_FactoryC2Ev
   *   leaq _instance(%rip),%rax ; movq %rbx,(%rax)
   *
   * i.e. `_instance = new OZChannelDouble_Factory()`.
   */
  public static getInstance(): OZChannelDouble_Factory {
    // Load onceFlag; if already-ran, skip construction.
    if (OZChannelDouble_Factory._instanceOnce !== 1) {
      // Portable equivalent of the libc++ __call_once path. JS is single-
      // threaded, so once-atomicity collapses to a flag guard. This mirrors
      // the __invoke thunk @0x33bd: operator new(0x88) + C2 ctor.
      OZChannelDouble_Factory._instance = new OZChannelDouble_Factory();
      // once-flag transitions to sentinel (all-ones in libc++; 1 in JS).
      OZChannelDouble_Factory._instanceOnce = 1;
    }
    // Load and return _instance.
    return OZChannelDouble_Factory._instance!;
  }
}
