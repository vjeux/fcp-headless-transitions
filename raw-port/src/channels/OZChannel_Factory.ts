// raw-port/src/channels/OZChannel_Factory.ts
//
// FCP `OZChannel_Factory` (ProChannel.framework) — the shared factory
// singleton that mints generic `OZChannel` instances. This file transcribes
// its `getInstance()` accessor from the ProChannel x86_64 slice at file
// offset 0x17d4 (see raw-port/re/disasm/ProChannel.__ZN17OZChannel_Factory11getInstanceEv.s).
//
// This is the classic OZFactoryBase-tree singleton accessor pattern
// (compare `OZChannelPositionPercent3D_Factory::getInstance()` @ProChannel
// 0xa6186 — same libc++ `std::__1::call_once` shape, same in-memory
// program-global state variables):
//
//   __ZN17OZChannel_Factory13_instanceOnceE   // once-flag  (u64 sentinel; -1 = "already ran")
//   __ZN17OZChannel_Factory9_instanceE        // the singleton pointer (OZChannel_Factory*)
//
// Provenance: /Applications/Final Cut Pro.app/Contents/Frameworks/
//             ProChannel.framework/Versions/A/ProChannel (x86_64).
//
// Ledger addresses (raw-port/army/ledger/ProChannel.ledger.json → OZChannel_Factory):
//   0x17d4    OZChannel_Factory::getInstance()                      [THIS UNIT]
//   0x3196    OZChannel_Factory::OZChannel_Factory()                [C2, frontier stub below]
//   0x321a    OZChannel_Factory::~OZChannel_Factory()               [D2, not ported]
//   0x3148    __call_once_proxy<tuple<lambda()&&>>                  [libc++ glue]
//   0x3158    __invoke<lambda()>                                    [libc++ glue; does the `new`]
//
// The ctor `OZChannel_FactoryC2Ev` @0x3196 (which the libc++ __invoke thunk
// invokes on the freshly-`new`'d 0x88-byte block — see 0x3158 disasm: `movl
// $0x88,%edi; callq __Znwm; callq __ZN17OZChannel_FactoryC2Ev; movq %rbx,
// _instance(%rip)`) is a SEPARATE ledger unit and is not yet ported. This
// file therefore only ports `getInstance()`; the ctor is a frontier stub
// that will be filled in by its own dep-worker claim. All of the ctor's
// in-scope callees (OZFactory::OZFactory, PCSingleton::PCSingleton,
// OZFactory::~OZFactory) are already ported (see depgraph deps).

// ═════════════════════════════════════════════════════════════════════════
// Frontier callees — every out-of-scope / not-yet-transcribed symbol used
// by `getInstance()`'s call_once path, surfaced as a throwing stub that
// cites its @0xADDR.
// ═════════════════════════════════════════════════════════════════════════

/** `std::__1::__call_once(unsigned long&, void*, void(*)(void*))`
 *  — libc++ boundary/extern. Called by `getInstance` @ProChannel 0x180c
 *  through the PLT symbol stub at 0xacdc8. Not in the port scope (libc++). */
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

/** `OZChannel_Factory::OZChannel_Factory()` C2 body @ProChannel 0x3196.
 *  Invoked (via libc++ __invoke thunk @0x3158) by the once-thunk to
 *  construct the singleton on a fresh 0x88-byte heap block. In-scope,
 *  NOT yet ported (separate ledger entry `OZChannel_Factory@0x3196`).
 *  This frontier stub exists ONLY for the not-yet-reachable `new`-path
 *  in this port of getInstance(); it will be replaced when the ctor
 *  ledger entry is claimed. */
function OZChannel_Factory_ctor_stub(_this: OZChannel_Factory): void {
  throw new Error(
    "OZChannel_Factory::OZChannel_Factory() @ProChannel 0x3196 " +
      "__ZN17OZChannel_FactoryC2Ev — not yet transcribed (separate ledger unit)",
  );
}

/** `operator new(unsigned long)` — libc extern. Called (via libc++ __invoke
 *  thunk @ProChannel 0x315f: `movl $0x88,%edi; callq __Znwm`) with size
 *  0x88 = 136 bytes to allocate the singleton block. Not in port scope. */
function OperatorNew_stub(_size: number): OZChannel_Factory {
  throw new Error(
    "operator new(unsigned long) __Znwm " +
      "@ProChannel imported stub 0xace4c — libc extern, not transcribed",
  );
}

// ═════════════════════════════════════════════════════════════════════════
// `OZChannel_Factory` — the class itself. Only `getInstance()` is ported
// here; other methods (ctor, dtor, description, manufacturer, version,
// getBundleID, etc.) are separate ledger entries at 0x3196..0x3352 in
// ProChannel and are not touched by this file.
// ═════════════════════════════════════════════════════════════════════════

/**
 * `OZChannel_Factory` — ProChannel-framework singleton that produces plain
 * `OZChannel` instances. Extends `OZChannelFactory` (primary base) and
 * embeds a `PCSingleton` subobject at +0x80 (see ctor @0x3196 disasm:
 * `leaq 0x80(%rbx),%rdi ; xorl %esi,%esi ; callq PCSingleton::PCSingleton`).
 *
 * STRUCT LAYOUT (recovered from C2 ctor @0x3196):
 *   +0x000  primary vptr    (final install @0x31ed → OZChannel_Factory vtable
 *                             base +0x10; initial install @0x31d5 with
 *                             OZChannelFactory vtable, then rewritten)
 *   +0x080  secondary vptr  / PCSingleton subobject (constructed with
 *                             `PCSingleton::PCSingleton(u32=0)` @0x31e1,
 *                             then vptr slot rewritten @0x31f7 to
 *                             OZChannel_Factory vtable base +0xE0)
 *   [size = 0x88 bytes]     (allocation size in the __invoke thunk
 *                             @0x315f: `movl $0x88,%edi; callq __Znwm`)
 */
export class OZChannel_Factory {
  /**
   * Program-global (not per-instance) once-flag. In the binary this is the
   * external symbol `__ZN17OZChannel_Factory13_instanceOnceE` — an
   * `unsigned long` in the framework's BSS, addressed RIP-relative from
   * `getInstance` @0x17dc (`leaq _instanceOnce(%rip), %rax`).
   *
   * The libc++ sentinel for "already ran" is all-ones (0xFFFFFFFFFFFFFFFF ≡
   * `-1` as signed) — verified by the `cmpq $-0x1, %rax` at @0x17e6. We
   * model the two observable states here as 0 (not run) / 1 (run) in JS.
   */
  private static _instanceOnce: 0 | 1 = 0;

  /**
   * Program-global singleton pointer, `__ZN17OZChannel_Factory9_instanceE`.
   * Addressed RIP-relative from `getInstance` @0x1811 (`leaq _instance
   * (%rip), %rax ; movq (%rax), %rax`). Written by the libc++ __invoke
   * thunk @0x3174-0x317b after the C2 ctor returns.
   */
  private static _instance: OZChannel_Factory | null = null;

  /**
   * `OZChannel_Factory::OZChannel_Factory()` @ProChannel 0x3196. NOT this
   * unit — declared here so `new OZChannel_Factory()` in the once-thunk
   * compiles, but the body is a frontier stub until the ctor's own ledger
   * unit is claimed. Every in-scope callee of the ctor (OZFactory C2 @0x31c5,
   * PCSingleton C2 @0x31e1) is already ported; the ctor is READY.
   */
  public constructor() {
    OZChannel_Factory_ctor_stub(this);
  }

  /**
   * `OZChannel_Factory::getInstance()` @ProChannel 0x17d4.
   *
   * Faithful transcription of the disasm at
   *   raw-port/re/disasm/ProChannel.__ZN17OZChannel_Factory11getInstanceEv.s:
   *
   *   0x17d4  pushq %rbp ; movq %rsp,%rbp ; subq $0x20,%rsp        ; prolog
   *   0x17dc  leaq  __ZN17OZChannel_Factory13_instanceOnceE(%rip),%rax
   *   0x17e3  movq  (%rax),%rax                                    ; load onceFlag
   *   0x17e6  cmpq  $-0x1,%rax                                     ; already ran?
   *   0x17ea  je    0x1811                                         ; yes -> return
   *   0x17ec  leaq  -0x1(%rbp),%rax                                ; build tuple<lambda&&>
   *   0x17f0  leaq  -0x18(%rbp),%rcx                               ;   on stack (empty lambda,
   *   0x17f4  movq  %rax,(%rcx)                                    ;   so context is just a
   *   0x17f7  leaq  -0x10(%rbp),%rsi                               ;   dummy addr chain).
   *   0x17fb  movq  %rcx,(%rsi)
   *   0x17fe  leaq  __ZN17OZChannel_Factory13_instanceOnceE(%rip),%rdi ; &onceFlag
   *   0x1805  leaq  __ZNSt3__117__call_once_proxy...(%rip),%rdx    ; &proxy fn
   *   0x180c  callq __ZNSt3__111__call_onceERVmPvPFvS2_E           ; std::call_once
   *   0x1811  leaq  __ZN17OZChannel_Factory9_instanceE(%rip),%rax
   *   0x1818  movq  (%rax),%rax                                    ; load _instance
   *   0x181b  addq  $0x20,%rsp ; popq %rbp ; retq                  ; epilog, return
   *
   * The passed-`ctx` (three-deep pointer chain on the caller frame) is the
   * standard libc++ `tuple<lambda&&>` marshalling for an empty capture-less
   * lambda; the __call_once_proxy @0x3148 dereferences it to reach the
   * lambda-object address and then jmps to __invoke @0x3158. __invoke
   * does the real construction:
   *
   *   0x3158  push frame ; movl $0x88,%edi ; callq __Znwm
   *   0x3169  movq %rax,%rbx ; movq %rax,%rdi
   *   0x316f  callq __ZN17OZChannel_FactoryC2Ev
   *   0x3174  leaq _instance(%rip),%rax ; movq %rbx,(%rax)
   *   0x317e  pop frame ; retq
   *
   * i.e. `_instance = new OZChannel_Factory()`. We model the whole
   * once-guarded sequence directly here, because the libc++ __call_once
   * boundary is an out-of-scope extern (see StdCallOnce_stub above): if a
   * caller reaches `getInstance` before the ctor unit is filled in, the
   * frontier stub inside the ctor will fire and cite its own @0x3196.
   */
  public static getInstance(): OZChannel_Factory {
    // 0x17dc-0x17ea: load onceFlag; if already-ran (== -1 sentinel), skip.
    if (OZChannel_Factory._instanceOnce !== 1) {
      // 0x17ec-0x180c: portable equivalent of the libc++ __call_once path.
      // In the binary this is a real call to std::__1::__call_once via the
      // proxy at @0x3148 → __invoke @0x3158 → operator new(0x88) → ctor.
      // JS is single-threaded, so the "call_once" atomicity guarantee
      // collapses to a plain flag-guarded init here.
      //
      // The equivalent of the __invoke thunk @0x3158 (operator new + ctor):
      OZChannel_Factory._instance = new OZChannel_Factory();
      // After __invoke returns, the once-flag transitions to the "already
      // ran" sentinel (-1 in libc++, 1 in our model).
      OZChannel_Factory._instanceOnce = 1;
    }
    // 0x1811-0x1820: load and return _instance.
    return OZChannel_Factory._instance!;
  }
}
