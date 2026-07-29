// raw-port/src/channels/OZChannelLevels_Factory.ts
//
// FCP `OZChannelLevels_Factory` (ProChannel.framework) — factory singleton for the
// corresponding OZChannel subclass. This file transcribes ONLY its
// `getInstance()` accessor from the ProChannel x86_64 slice at file
// offset 0x2230 (see raw-port/re/disasm/ProChannel.__ZN23OZChannelLevels_Factory11getInstanceEv.s).
//
// Standard libc++ `std::__1::call_once`-guarded singleton pattern — same
// in-memory once-flag + pointer globals + call_once thunk shape as the
// already-ported peers `OZChannel_Factory::getInstance()` @0x17d4 and
// `OZChannelPositionPercent3D_Factory::getInstance()` @0xa6186:
//
//   __ZN23OZChannelLevels_Factory13_instanceOnceE   // once-flag  (u64; -1 = "already ran")
//   __ZN23OZChannelLevels_Factory9_instanceE        // singleton pointer (fills after ctor)
//
// Provenance: /Applications/Final Cut Pro.app/Contents/Frameworks/
//             ProChannel.framework/Versions/A/ProChannel (x86_64).
//
// Ledger addresses (raw-port/army/ledger/ProChannel.ledger.json → OZChannelLevels_Factory):
//   0x2230    OZChannelLevels_Factory::getInstance()                     [THIS UNIT]
//   0xcc28   OZChannelLevels_Factory::OZChannelLevels_Factory()                    [C2, frontier stub]
//   0xa82d4   libc++ __invoke thunk (operator new(0x88) + ctor)
//
// This file ports ONLY `getInstance()`; the ctor @0xcc28 is a
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

/** `OZChannelLevels_Factory::OZChannelLevels_Factory()` C2 body @ProChannel 0xcc28.
 *  Invoked (via libc++ __invoke thunk @0xa82d4) by the once-thunk
 *  to construct the singleton on a fresh 0x88-byte heap block.
 *  In-scope, NOT yet ported (separate ledger entry). Frontier stub. */
function OZChannelLevels_Factory_ctor_stub(_this: OZChannelLevels_Factory): void {
  throw new Error(
    "OZChannelLevels_Factory::OZChannelLevels_Factory() @ProChannel 0xcc28 " +
      "__ZN23OZChannelLevels_FactoryC2Ev — not yet transcribed (separate ledger unit)",
  );
}

/** `operator new(unsigned long)` — libc extern. Called (via libc++ __invoke
 *  thunk @ProChannel 0xa82d4: `movl $0x88,%edi; callq __Znwm`)
 *  to allocate the singleton block. Out of scope. */
function OperatorNew_stub(_size: number): OZChannelLevels_Factory {
  throw new Error(
    "operator new(unsigned long) __Znwm " +
      "@ProChannel imported stub 0xace4c — libc extern, not transcribed",
  );
}

// ═════════════════════════════════════════════════════════════════════════
// `OZChannelLevels_Factory` — only `getInstance()` is ported here.
// ═════════════════════════════════════════════════════════════════════════

/**
 * `OZChannelLevels_Factory` — ProChannel factory singleton. Extends `OZChannelFactory`
 * (primary base) and embeds a `PCSingleton` subobject at +0x80. Total
 * instance size is 0x88 bytes (from the __invoke thunk @0xa82d4).
 *
 * STRUCT LAYOUT (inferred from the C2 ctor @0xcc28; identical two-vptr
 * + OZFactory + PCSingleton subobject pattern to OZChannel_Factory @0x3196):
 *   +0x000  primary vptr    (this class's vtable+0x10)
 *   +0x080  secondary vptr  / PCSingleton subobject
 *   [size = 0x88 bytes]
 */
export class OZChannelLevels_Factory {
  /**
   * Program-global once-flag `__ZN23OZChannelLevels_Factory13_instanceOnceE` (unsigned long in the
   * framework's BSS). RIP-addressed at @0x2230. The libc++ "already
   * ran" sentinel is -1 (all-ones) — from `cmpq $-0x1,%rax` in the fn.
   * Modeled as 0/1 in JS (single-threaded runtime).
   */
  private static _instanceOnce: 0 | 1 = 0;

  /**
   * Program-global singleton pointer `__ZN23OZChannelLevels_Factory9_instanceE`. Written by the
   * libc++ __invoke thunk @0xa82d4 after the C2 ctor returns.
   */
  private static _instance: OZChannelLevels_Factory | null = null;

  /**
   * `OZChannelLevels_Factory::OZChannelLevels_Factory()` @ProChannel 0xcc28. NOT this unit —
   * declared so `new OZChannelLevels_Factory()` in the once-thunk compiles; body is
   * a frontier stub. All in-scope callees of the ctor (OZFactory C2,
   * PCSingleton C2) are already ported, so it is READY for a future claim.
   */
  public constructor() {
    OZChannelLevels_Factory_ctor_stub(this);
  }

  /**
   * `OZChannelLevels_Factory::getInstance()` @ProChannel 0x2230.
   *
   * Faithful transcription of raw-port/re/disasm/ProChannel.__ZN23OZChannelLevels_Factory11getInstanceEv.s
   * (22-line body, identical up to the RIP-relative offsets to the peer
   * accessors already ported at @0x17d4, @0x258a, @0xa6186):
   *
   *   0x2230  prolog (push %rbp; mov %rsp,%rbp; sub $0x20,%rsp)
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
   * The __invoke thunk @0xa82d4 does the actual construction:
   *   movl $0x88,%edi ; callq __Znwm
   *   callq __ZN23OZChannelLevels_FactoryC2Ev
   *   leaq _instance(%rip),%rax ; movq %rbx,(%rax)
   *
   * i.e. `_instance = new OZChannelLevels_Factory()`.
   */
  public static getInstance(): OZChannelLevels_Factory {
    // Load onceFlag; if already-ran, skip construction.
    if (OZChannelLevels_Factory._instanceOnce !== 1) {
      // Portable equivalent of the libc++ __call_once path. JS is single-
      // threaded, so once-atomicity collapses to a flag guard. This mirrors
      // the __invoke thunk @0xa82d4: operator new(0x88) + C2 ctor.
      OZChannelLevels_Factory._instance = new OZChannelLevels_Factory();
      // once-flag transitions to sentinel (all-ones in libc++; 1 in JS).
      OZChannelLevels_Factory._instanceOnce = 1;
    }
    // Load and return _instance.
    return OZChannelLevels_Factory._instance!;
  }
}
