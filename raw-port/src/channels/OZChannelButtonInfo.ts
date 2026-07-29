// raw-port/src/channels/OZChannelButtonInfo.ts
//
// FCP `OZChannelButtonInfo` — a specialised OZChannelInfo descriptor used
// for "button-like" channels (momentary triggers whose numeric range is
// [0, 1] with unit-step increments). It inherits TWO base sub-objects
// via multiple inheritance:
//   • OZChannelInfo   (primary base @+0x00 .. +0x50 — the numeric-range
//                      metadata: min/max/stepCoarse/stepFine/displayScale/
//                      unitSuffix + slider-transformer-name).
//   • PCSingleton     (secondary base @+0x50 — the singleton-registry
//                      book-keeping helper).
//
// Symbols decoded here (ProChannel, x86_64 slice; file offset in the thin
// slice == VA — the slice starts at file offset 0):
//   0x5411e  OZChannelButtonInfo::OZChannelButtonInfo()  [C2 ctor]
//   0x54184  OZChannelButtonInfo::~OZChannelButtonInfo() [D1 complete dtor]
//   0x541a4  OZChannelButtonInfo::~OZChannelButtonInfo() [D0 deleting dtor]
//
// Vtable @ProChannel __ZTV19OZChannelButtonInfo. Ctor installs two vtable
// pointers (one per base sub-object) at offsets +0x00 and +0x50, as is
// standard for the Itanium C++ ABI when a class has multiple bases with
// their own primary vptrs:
//   @+0x00  → __ZTV19OZChannelButtonInfo + 0x10   (OZChannelInfo view)
//   @+0x50  → __ZTV19OZChannelButtonInfo + 0x30   (PCSingleton view)
// JS prototype chain models this at the language level; no explicit
// vtable write is needed at the port level.
//
// STRUCT LAYOUT (recovered from ctor @0x5411e byte-by-byte):
//   +0x00 .. +0x50   OZChannelInfo base sub-object    (constructed @0x54143)
//   +0x50 .. +0x??   PCSingleton  base sub-object    (constructed @0x54151)
//     (PCSingleton's own layout is decoded in src/infra/PCSingleton.ts.)
//
// Ctor argument decode (SysV AMD64 doubles in xmm0..xmm4, string in %rsi):
//   • xmm0 = 0.0f64                                  (xorps %xmm0,%xmm0 @0x54137)
//   • xmm1 = 1.0f64  (movsd 0x5b3f1(%rip),%xmm1     @0x5412f
//                     -> next-instr 0x54137 + 0x5b3f1 = 0xaf528; read as u64
//                     0x3ff0000000000000 = double 1.0)
//   • xmm2 = xmm1    (movaps %xmm1,%xmm2            @0x5413a)   = 1.0
//   • xmm3 = xmm1    (movaps %xmm1,%xmm3            @0x5413d)   = 1.0
//   • xmm4 = xmm1    (movaps %xmm1,%xmm4            @0x54140)   = 1.0
//   • %rsi = ""      (leaq 0x682c9(%rip),%rsi       @0x54128
//                     -> next-instr 0x5412f + 0x682c9 = 0xbc3f8; first byte
//                     is 0x00 -> empty C string per the disasm's literal-pool
//                     comment `## literal pool for: ""`)
//
// So the base OZChannelInfo receives (min=0.0, max=1.0, stepCoarse=1.0,
// stepFine=1.0, displayScale=1.0, unitSuffix=""). The C++ signature is
//   OZChannelInfo::OZChannelInfo(double, double, double, double, double, char const*)
// (mangled __ZN13OZChannelInfoC2EdddddPKc — argument order per the ABI's
// register discipline is (min, max, stepCoarse, stepFine, displayScale,
// name); this is the same order documented in `OZChannelInfo.fromCString`).
//
// PCSingleton receives its singleton-slot tag = 100 (`movl $0x64,%esi`
// @0x5414c). The exact meaning of tag=100 is owned by PCSingleton's
// singleton-registry logic (a per-class type-ID it uses to look up its
// registration in the global singleton vector); it is stored verbatim.
//
// D0 dtor @0x541a4 chains:
//   1. PCSingleton::~PCSingleton() on this+0x50   (@0x541b1)
//   2. OZChannelInfo::~OZChannelInfo() on this    (@0x541b9)
//   3. HGObject::operator delete (via __ZdlPv)     (@0x541c7 tail-jmp)
// D1 @0x54184 does 1 + 2 (tail-jmp to OZChannelInfo::D2), no delete.
//
// This class is pure: no virtual methods of its own are exported (the
// ledger only tracks the ctor + 2 dtors). Its identity is captured
// entirely by the constant values it seeds into its two bases.

import { OZChannelInfo } from "./OZChannelInfo.js";
import { PCSingleton } from "../infra/PCSingleton.js";

// ── Runtime numeric constants (RIP-rel double literals in ProChannel __TEXT __const;
// decode via `resolve.py ProChannel const <ADDR>` or read the file at VA==offset in
// the thin x86_64 slice). Verified 2026-07-28. ──

/** @0xaf528  u64=0x3ff0000000000000  f=1.0  — button "max/step/display" seed. */
const K_OZCHANNELBUTTON_ONE: number = 1.0;

/** implicit — xorps %xmm0,%xmm0 @0x54137 — button "min" seed. */
const K_OZCHANNELBUTTON_ZERO: number = 0.0;

/** @0xbc3f8  const char[] = "" — button unit-suffix seed (empty). */
const K_OZCHANNELBUTTON_UNIT: string = "";

/** immediate  $0x64 = 100 — PCSingleton tag for this class. */
const K_OZCHANNELBUTTON_SINGLETON_TAG: number = 100;

// ─── OZChannelButtonInfo class ───────────────────────────────────────────────
export class OZChannelButtonInfo {
  /**
   * OZChannelInfo primary base sub-object at C++ layout offset +0x00 .. +0x50.
   * In the FCP binary, `this` and `&this->channelInfo` share the same address;
   * in the port we model this as composition (a public field), which preserves
   * every observable OZChannelInfo method call without requiring TypeScript
   * multiple inheritance (which the language does not support).
   */
  readonly channelInfo: OZChannelInfo;

  /**
   * PCSingleton secondary base sub-object at C++ layout offset +0x50.
   * Constructed with tag=100 (see K_OZCHANNELBUTTON_SINGLETON_TAG). The
   * PCSingleton ctor registers `this` in the global singleton vector under
   * that tag — verified in `src/infra/PCSingleton.ts` @0x1d5db.
   */
  readonly singleton: PCSingleton;

  /**
   * OZChannelButtonInfo::OZChannelButtonInfo() @ProChannel 0x5411e
   *
   * Line-for-line body:
   *   @0x5411e-0x54125 prologue + save this to %rbx.
   *   @0x54128 leaq  0x682c9(%rip), %rsi          — rsi = "" (const-pool empty string).
   *   @0x5412f movsd 0x5b3f1(%rip), %xmm1         — xmm1 = 1.0 (@const 0xaf528).
   *   @0x54137 xorps %xmm0, %xmm0                 — xmm0 = 0.0.
   *   @0x5413a movaps %xmm1, %xmm2                — xmm2 = 1.0.
   *   @0x5413d movaps %xmm1, %xmm3                — xmm3 = 1.0.
   *   @0x54140 movaps %xmm1, %xmm4                — xmm4 = 1.0.
   *   @0x54143 callq OZChannelInfo::OZChannelInfo(double,double,double,double,
   *                                                double, char const*)
   *                                              — construct base @+0x00 with
   *                                                (0.0, 1.0, 1.0, 1.0, 1.0, "").
   *   @0x54148 leaq  0x50(%rbx), %rdi             — rdi = &this[+0x50].
   *   @0x5414c movl  $0x64, %esi                  — esi = 100 (PCSingleton tag).
   *   @0x54151 callq PCSingleton::PCSingleton(u32)
   *                                              — construct base @+0x50 with tag=100.
   *   @0x54156 leaq  __ZTV19OZChannelButtonInfo(%rip), %rax
   *   @0x5415d leaq  0x10(%rax), %rcx
   *   @0x54161 movq  %rcx, (%rbx)                 — install primary vptr (OZChannelInfo view).
   *   @0x54164 addq  $0x30, %rax
   *   @0x54168 movq  %rax, 0x50(%rbx)             — install secondary vptr (PCSingleton view).
   *   @0x5416c-0x54170 epilogue.
   *
   * The @0x54171..0x5417f landing pad handles an exception thrown by
   * PCSingleton::PCSingleton by tearing OZChannelInfo::~OZChannelInfo back
   * down and calling `_Unwind_Resume`. Not observable in JS; the composition
   * order + `try/catch` semantics of the host runtime would achieve the same
   * effect if PCSingleton's ctor throws.
   */
  constructor() {
    // @0x54143 — construct OZChannelInfo base with the exact seed constants
    // decoded above. Argument order matches OZChannelInfo::OZChannelInfo's
    // C++ signature (min, max, stepCoarse, stepFine, displayScale, unit).
    this.channelInfo = OZChannelInfo.fromCString(
      K_OZCHANNELBUTTON_ZERO,   // xmm0 -> min          = 0.0
      K_OZCHANNELBUTTON_ONE,    // xmm1 -> max          = 1.0
      K_OZCHANNELBUTTON_ONE,    // xmm2 -> stepCoarse   = 1.0
      K_OZCHANNELBUTTON_ONE,    // xmm3 -> stepFine     = 1.0
      K_OZCHANNELBUTTON_ONE,    // xmm4 -> displayScale = 1.0
      K_OZCHANNELBUTTON_UNIT,   // rsi  -> unitSuffix   = ""
    );
    // @0x54151 — construct PCSingleton base with tag=100 (registers this
    // instance into the singleton vector under that tag).
    this.singleton = new PCSingleton(K_OZCHANNELBUTTON_SINGLETON_TAG);
    // @0x54156-0x54168 — install both vtable pointers (this+0x00 -> vt+0x10,
    // this+0x50 -> vt+0x30). Modeled by the JS prototype chain; no explicit
    // write is needed at the port level.
  }

  /**
   * OZChannelButtonInfo::~OZChannelButtonInfo() @ProChannel 0x54184  [D1]
   *
   * Body:
   *   @0x5418d addq  $0x50, %rdi                  — rdi = &this[+0x50].
   *   @0x54191 callq PCSingleton::~PCSingleton()  — destroy PCSingleton base.
   *   @0x5419f jmp   OZChannelInfo::~OZChannelInfo() — tail-call OZChannelInfo dtor.
   *
   * D0 @0x541a4 is D1 followed by `jmp __ZdlPv` (operator delete on this).
   * D0 body:
   *   @0x541ad addq  $0x50, %rdi                  — rdi = &this[+0x50].
   *   @0x541b1 callq PCSingleton::~PCSingleton()
   *   @0x541b9 callq OZChannelInfo::~OZChannelInfo()
   *   @0x541c7 jmp   __ZdlPv                      — HGObject::operator delete.
   *
   * JS has no C++ destructor; `destroy()` is provided for callers that model
   * deterministic release via PCSingleton's registry-unregister side effect.
   */
  destroy(): void {
    // @0x54191 / @0x541b1 — tear down PCSingleton base first (order matches D1/D0).
    this.singleton.destroy?.();
    // @0x5419f / @0x541b9 — then the OZChannelInfo base.
    // OZChannelInfo does not currently expose a `destroy()` — its port models
    // the destructor as a pure JS GC responsibility (no PCString handles or
    // heap owners in the current struct that need explicit release). Recording
    // the tail-call site here for provenance.
  }
}
