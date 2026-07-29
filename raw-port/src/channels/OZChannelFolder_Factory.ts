// raw-port/src/channels/OZChannelFolder_Factory.ts
//
// FCP `OZChannelFolder_Factory` (ProChannel.framework) — factory singleton for the
// corresponding OZChannel subclass. This file transcribes ONLY its
// `getInstance()` accessor from the ProChannel x86_64 slice at file
// offset 0x1ae0 (see raw-port/re/disasm/ProChannel.__ZN23OZChannelFolder_Factory11getInstanceEv.s).
//
// Standard libc++ `std::__1::call_once`-guarded singleton pattern — same
// in-memory once-flag + pointer globals + call_once thunk shape as the
// already-ported peers `OZChannel_Factory::getInstance()` @0x17d4 and
// `OZChannelPositionPercent3D_Factory::getInstance()` @0xa6186:
//
//   __ZN23OZChannelFolder_Factory13_instanceOnceE   // once-flag  (u64; -1 = "already ran")
//   __ZN23OZChannelFolder_Factory9_instanceE        // singleton pointer (fills after ctor)
//
// Provenance: /Applications/Final Cut Pro.app/Contents/Frameworks/
//             ProChannel.framework/Versions/A/ProChannel (x86_64).
//
// Ledger addresses (raw-port/army/ledger/ProChannel.ledger.json → OZChannelFolder_Factory):
//   0x1ae0    OZChannelFolder_Factory::getInstance()                     [THIS UNIT]
//   0x71c8   OZChannelFolder_Factory::OZChannelFolder_Factory()                    [C2, frontier stub]
//   0x67a02   libc++ __invoke thunk (operator new(0x88) + ctor)
//
// This file ports ONLY `getInstance()`; the ctor @0x71c8 is a
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

/** `OZChannelFolder_Factory::OZChannelFolder_Factory()` C2 body @ProChannel 0x71c8.
 *  Invoked (via libc++ __invoke thunk @0x67a02) by the once-thunk
 *  to construct the singleton on a fresh 0x88-byte heap block.
 *  In-scope, NOT yet ported (separate ledger entry). Frontier stub. */
function OZChannelFolder_Factory_ctor_stub(_this: OZChannelFolder_Factory): void {
  throw new Error(
    "OZChannelFolder_Factory::OZChannelFolder_Factory() @ProChannel 0x71c8 " +
      "__ZN23OZChannelFolder_FactoryC2Ev — not yet transcribed (separate ledger unit)",
  );
}

/** `operator new(unsigned long)` — libc extern. Called (via libc++ __invoke
 *  thunk @ProChannel 0x67a02: `movl $0x88,%edi; callq __Znwm`)
 *  to allocate the singleton block. Out of scope. */
function OperatorNew_stub(_size: number): OZChannelFolder_Factory {
  throw new Error(
    "operator new(unsigned long) __Znwm " +
      "@ProChannel imported stub 0xace4c — libc extern, not transcribed",
  );
}

// ═════════════════════════════════════════════════════════════════════════
// `OZChannelFolder_Factory` — only `getInstance()` is ported here.
// ═════════════════════════════════════════════════════════════════════════

/**
 * `OZChannelFolder_Factory` — ProChannel factory singleton. Extends `OZChannelFactory`
 * (primary base) and embeds a `PCSingleton` subobject at +0x80. Total
 * instance size is 0x88 bytes (from the __invoke thunk @0x67a02).
 *
 * STRUCT LAYOUT (inferred from the C2 ctor @0x71c8; identical two-vptr
 * + OZFactory + PCSingleton subobject pattern to OZChannel_Factory @0x3196):
 *   +0x000  primary vptr    (this class's vtable+0x10)
 *   +0x080  secondary vptr  / PCSingleton subobject
 *   [size = 0x88 bytes]
 */
export class OZChannelFolder_Factory {
  /**
   * Program-global once-flag `__ZN23OZChannelFolder_Factory13_instanceOnceE` (unsigned long in the
   * framework's BSS). RIP-addressed at @0x1ae0. The libc++ "already
   * ran" sentinel is -1 (all-ones) — from `cmpq $-0x1,%rax` in the fn.
   * Modeled as 0/1 in JS (single-threaded runtime).
   */
  private static _instanceOnce: 0 | 1 = 0;

  /**
   * Program-global singleton pointer `__ZN23OZChannelFolder_Factory9_instanceE`. Written by the
   * libc++ __invoke thunk @0x67a02 after the C2 ctor returns.
   */
  private static _instance: OZChannelFolder_Factory | null = null;

  /**
   * `OZChannelFolder_Factory::OZChannelFolder_Factory()` @ProChannel 0x71c8. NOT this unit —
   * declared so `new OZChannelFolder_Factory()` in the once-thunk compiles; body is
   * a frontier stub. All in-scope callees of the ctor (OZFactory C2,
   * PCSingleton C2) are already ported, so it is READY for a future claim.
   */
  public constructor() {
    OZChannelFolder_Factory_ctor_stub(this);
  }

  /**
   * `OZChannelFolder_Factory::getInstance()` @ProChannel 0x1ae0.
   *
   * Faithful transcription of raw-port/re/disasm/ProChannel.__ZN23OZChannelFolder_Factory11getInstanceEv.s
   * (22-line body, identical up to the RIP-relative offsets to the peer
   * accessors already ported at @0x17d4, @0x258a, @0xa6186):
   *
   *   0x1ae0  prolog (push %rbp; mov %rsp,%rbp; sub $0x20,%rsp)
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
   * The __invoke thunk @0x67a02 does the actual construction:
   *   movl $0x88,%edi ; callq __Znwm
   *   callq __ZN23OZChannelFolder_FactoryC2Ev
   *   leaq _instance(%rip),%rax ; movq %rbx,(%rax)
   *
   * i.e. `_instance = new OZChannelFolder_Factory()`.
   */
  public static getInstance(): OZChannelFolder_Factory {
    // Load onceFlag; if already-ran, skip construction.
    if (OZChannelFolder_Factory._instanceOnce !== 1) {
      // Portable equivalent of the libc++ __call_once path. JS is single-
      // threaded, so once-atomicity collapses to a flag guard. This mirrors
      // the __invoke thunk @0x67a02: operator new(0x88) + C2 ctor.
      OZChannelFolder_Factory._instance = new OZChannelFolder_Factory();
      // once-flag transitions to sentinel (all-ones in libc++; 1 in JS).
      OZChannelFolder_Factory._instanceOnce = 1;
    }
    // Load and return _instance.
    return OZChannelFolder_Factory._instance!;
  }
}
