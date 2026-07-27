// OZChannelUint32Info — descriptor for a uint32 channel type (ProChannel.framework).
//
// FAITHFUL PORT — do NOT approximate, do NOT guess. Every method cites @ProChannel 0xADDR read
// from the disassembly under re/disasm/ProChannel.OZChannelUint32Info.*.s. Every constant cites
// the address it was read from (verified via army/tools/resolve.py const). Undecoded callees
// throw citing their addr.
//
// STRUCT LAYOUT (recovered from ctor @0x43d4 + resolve.py vtable):
//   +0x00           vtable ptr (primary — OZChannelInfo/OZChannelUint32Info)
//                     set @0x4411..0x4418  (leaq 0xc7228(%rip),%rax ; movq %rax,(%rbx))
//                     target = 0xcb640 = __ZTV19OZChannelUint32Info + 0x10
//   +0x00 .. +0x4F  OZChannelInfo base sub-object (size 0x50)
//                     constructed @0x43fe via
//                     OZChannelInfo::OZChannelInfo(double, double, double, double, double,
//                                                  char const*)
//   +0x50           vtable ptr (secondary — PCSingleton sub-object)
//                     set @0x441b..0x4422  (leaq 0xc723e(%rip),%rax ; movq %rax,0x50(%rbx))
//                     target = 0xcb660 = __ZTV19OZChannelUint32Info + 0x30
//   +0x50 .. +0x??  PCSingleton base sub-object
//                     constructed @0x440c via PCSingleton::PCSingleton(unsigned int) with u32=0x64.
//
// VTABLE (resolve.py vtable OZChannelUint32Info; installed primary ptr @0xcb640):
//   *0x00 -> 0x443e  OZChannelUint32Info::~OZChannelUint32Info() (D1 base dtor)
//   *0x08 -> 0x445e  OZChannelUint32Info::~OZChannelUint32Info() (D0 deleting dtor)
//   *0x10 .. (typeinfo / RTTI / etc.)
//   Secondary vtable @0xcb660 (installed at +0x50) provides the non-virtual thunks:
//     *0x20 -> 0x4486  __ZThn80_N19OZChannelUint32InfoD1Ev
//     *0x28 -> 0x44a4  __ZThn80_N19OZChannelUint32InfoD0Ev
//   No non-destructor methods are overridden here vs. OZChannelInfo.
//
// SEED CONSTANTS passed to OZChannelInfo::OZChannelInfo (read from ProChannel __TEXT __const,
// verified with `resolve.py ProChannel const`):
//   arg1 (xmm0)  0.0                     ; xorps xmm0,xmm0 @0x43f5
//   arg2 (xmm1)  4294967295.0            ; movsd 0xab153(%rip),xmm1 @0x43e5  → @const 0xaf540
//                                          (u64 0x41efffffffe00000 — UINT32_MAX as double)
//   arg3 (xmm2)  1.0                     ; movsd 0xab133(%rip),xmm2 @0x43ed  → @const 0xaf528
//                                          (u64 0x3ff0000000000000)
//   arg4 (xmm3)  1.0                     ; movaps xmm2,xmm3 @0x43f8   (copy of arg3)
//   arg5 (xmm4)  1.0                     ; movaps xmm2,xmm4 @0x43fb   (copy of arg3)
//   arg6 (rsi)   ""  (empty C string)    ; leaq 0xb8013(%rip),rsi @0x43de  → @const 0xbc3f8
//                                          (literal pool comment: "")
// And the PCSingleton u32 arg = 0x64 (=100) — `movl $0x64,%esi` @0x4407.
//
// FRONTIER: OZChannelInfo (ctor __ZN13OZChannelInfoC2EdddddPKc; dtor __ZN13OZChannelInfoD2Ev)
// and PCSingleton (ctor/dtor via stubs __ZN11PCSingletonC2Ej / __ZN11PCSingletonD2Ev) are NOT
// yet transcribed. All construction/destruction paths therefore raise, citing the FCP source
// addresses (ctor @0x43fe, PCSingleton ctor stub @0x440c, dtor D1 tail-jmp @0x4459, D0 call
// @0x4473, stub @0x444b/@0x446b) that would need transcription first — per PORTING_SPEC.md Rule 3.
//
// DECODE references:
//   re/disasm/ProChannel.OZChannelUint32Info.OZChannelUint32Info.s   (ctor  @0x43d4)
//   re/disasm/ProChannel.OZChannelUint32Info.~OZChannelUint32Info.s (D0    @0x445e)
//   D1 base dtor @0x443e read from otool -tV ProChannel symbol __ZN19OZChannelUint32InfoD1Ev.

// ── seed constants read from ProChannel __TEXT __const (VAs inside x86_64 slice) ──────────────
/** @const 0xaf540  double = 4294967295.0  (u64 0x41efffffffe00000) — arg2 to OZChannelInfo ctor
 *   (interpreted as UINT32_MAX; not named further — OZChannelInfo semantics not yet decoded). */
const K_UINT32_MAX_D: number = 4294967295.0;
/** @const 0xaf528  double = 1.0            (u64 0x3ff0000000000000) — arg3/arg4/arg5. */
const K_ONE: number = 1.0;
/** implicit zero — arg1 (xorps xmm0,xmm0 @0x43f5). */
const K_ZERO: number = 0.0;
/** @const 0xbc3f8  empty C string ""       — arg6 (leaq 0xb8013(%rip),%rsi @0x43de). */
const K_EMPTY_NAME: string = "";
/** immediate  0x64 = 100                    — PCSingleton::PCSingleton(u32) arg
 *   (movl $0x64,%esi @0x4407). */
const K_SINGLETON_ARG_U32: number = 100;

// ── frontier stubs for un-ported base classes ─────────────────────────────────────────────────
// These match the pattern used by sibling files (OZChannelSeedInfo.ts, OZChannelDoubleInfo.ts,
// OZChannelFrameInfo.ts) — a local throwing stub so this file typechecks in isolation while a
// sibling agent transcribes the real base classes.

/**
 * OZChannelInfo — base of OZChannelUint32Info. Occupies +0x00 .. +0x50 (size 0x50 = 80 bytes,
 * inferred from `leaq 0x50(%rbx),%rdi` @0x4403 which addresses the SECOND base sub-object).
 * Not yet transcribed. The ctor call at @0x43fe dispatches to
 *   OZChannelInfo::OZChannelInfo(double, double, double, double, double, char const*)
 * (mangled __ZN13OZChannelInfoC2EdddddPKc).
 */
export class OZChannelInfo {
  /** OZChannelInfo::OZChannelInfo(double,double,double,double,double,char const*)
   *  @ProChannel not yet transcribed (called from OZChannelUint32Info::OZChannelUint32Info
   *  @0x43fe with (0.0, 4294967295.0, 1.0, 1.0, 1.0, "")). */
  constructor(
    _a0: number,
    _a1: number,
    _a2: number,
    _a3: number,
    _a4: number,
    _name: string,
  ) {
    throw new Error(
      "OZChannelInfo::OZChannelInfo(double,double,double,double,double,char const*) @ProChannel not yet transcribed (called from OZChannelUint32Info::OZChannelUint32Info @0x43fe)",
    );
  }
  /** OZChannelInfo::~OZChannelInfo() @ProChannel not yet transcribed
   *  (called from OZChannelUint32Info D1 @0x4459 (tail-jmp) and D0 @0x4473 and unwind @0x4431). */
  destroy(): void {
    throw new Error(
      "OZChannelInfo::~OZChannelInfo() @ProChannel not yet transcribed (called from OZChannelUint32Info::~OZChannelUint32Info D1 @0x4459 / D0 @0x4473 / unwind @0x4431)",
    );
  }
}

/**
 * PCSingleton — secondary base sub-object at +0x50. Not yet transcribed. Its ctor takes a single
 * unsigned int (here 0x64 = 100). Called via symbol stub `__ZN11PCSingletonC2Ej` @0x440c;
 * destroyed via symbol stub `__ZN11PCSingletonD2Ev` @0x444b (D1) / @0x446b (D0).
 */
export class PCSingleton {
  /** PCSingleton::PCSingleton(unsigned int) @ProChannel not yet transcribed
   *  (called from OZChannelUint32Info::OZChannelUint32Info @0x440c with u32=100). */
  constructor(_slot: number) {
    throw new Error(
      "PCSingleton::PCSingleton(unsigned int) @ProChannel not yet transcribed (called from OZChannelUint32Info::OZChannelUint32Info @0x440c with u32=100)",
    );
  }
  /** PCSingleton::~PCSingleton() @ProChannel not yet transcribed
   *  (called from OZChannelUint32Info::~OZChannelUint32Info D1 @0x444b / D0 @0x446b). */
  destroy(): void {
    throw new Error(
      "PCSingleton::~PCSingleton() @ProChannel not yet transcribed (called from OZChannelUint32Info::~OZChannelUint32Info D1 @0x444b / D0 @0x446b)",
    );
  }
}

// ── OZChannelUint32Info ───────────────────────────────────────────────────────────────────────
export class OZChannelUint32Info {
  /**
   * OZChannelInfo primary base sub-object at +0x00 .. +0x50.
   * Its vtable pointer @+0x00 is installed to __ZTV19OZChannelUint32Info + 0x10 (VA 0xcb640)
   * (leaq 0xc7228(%rip),%rax ; movq %rax,(%rbx) @0x4411..0x4418).
   */
  readonly channelInfo: OZChannelInfo;

  /**
   * PCSingleton secondary base sub-object at +0x50.
   * Its vtable pointer @+0x50 is installed to __ZTV19OZChannelUint32Info + 0x30 (VA 0xcb660)
   * (leaq 0xc723e(%rip),%rax ; movq %rax,0x50(%rbx) @0x441b..0x4422).
   */
  readonly singleton: PCSingleton;

  /**
   * OZChannelUint32Info::OZChannelUint32Info()  @ProChannel 0x43d4
   *
   * Faithful transcription of the 15-line ctor (`__ZN19OZChannelUint32InfoC2Ev`). Two base
   * sub-objects are constructed in-place with the exact constants read from ProChannel
   * __TEXT __const, then two vtable pointers are installed:
   *
   *   0x43d4  push %rbp / mov %rsp,%rbp / push %r14 / push %rbx    (prologue)
   *   0x43db  mov %rdi,%rbx                                        (this)
   *   0x43de  leaq 0xb8013(%rip),%rsi                              (arg6 = "" @const 0xbc3f8)
   *   0x43e5  movsd 0xab153(%rip),%xmm1                            (arg2 = 4294967295.0 @const 0xaf540)
   *   0x43ed  movsd 0xab133(%rip),%xmm2                            (arg3 = 1.0 @const 0xaf528)
   *   0x43f5  xorps %xmm0,%xmm0                                    (arg1 = 0.0)
   *   0x43f8  movaps %xmm2,%xmm3                                   (arg4 = 1.0)
   *   0x43fb  movaps %xmm2,%xmm4                                   (arg5 = 1.0)
   *   0x43fe  callq __ZN13OZChannelInfoC2EdddddPKc                 (OZChannelInfo base @this+0x00)
   *   0x4403  leaq 0x50(%rbx),%rdi                                 (arg = this+0x50)
   *   0x4407  movl $0x64,%esi                                      (arg2 = 100u)
   *   0x440c  callq __ZN11PCSingletonC2Ej (stub)                   (PCSingleton base @this+0x50)
   *   0x4411  leaq 0xc7228(%rip),%rax ; movq %rax,(%rbx)           ((this+0x00) = vt+0x10 @0xcb640)
   *   0x441b  leaq 0xc723e(%rip),%rax ; movq %rax,0x50(%rbx)       ((this+0x50) = vt+0x30 @0xcb660)
   *   0x4426  pop %rbx / pop %r14 / pop %rbp / retq                (epilogue)
   *   0x442b  (landingpad — unwind: OZChannelInfo::~OZChannelInfo @0x4431 → __Unwind_Resume @0x4439)
   *
   * The unwind path (0x442b..0x443c) triggers only if PCSingleton's ctor throws; it tears the
   * already-constructed OZChannelInfo sub-object back down. Not modelled explicitly in TS (the
   * PCSingleton stub throws BEFORE this ctor could complete anyway).
   */
  constructor() {
    // @0x43fe — construct OZChannelInfo base with (0.0, 4294967295.0, 1.0, 1.0, 1.0, "").
    this.channelInfo = new OZChannelInfo(
      K_ZERO,           // xmm0
      K_UINT32_MAX_D,   // xmm1
      K_ONE,            // xmm2
      K_ONE,            // xmm3 (copy of xmm2)
      K_ONE,            // xmm4 (copy of xmm2)
      K_EMPTY_NAME,     // rsi
    );
    // @0x440c — construct PCSingleton base at +0x50 with u32 = 100.
    this.singleton = new PCSingleton(K_SINGLETON_ARG_U32);
    // @0x4411 / @0x441b — install both vtable pointers. In TS classes there is no explicit
    // vtable to store; the JS class dispatch is the equivalent. The two v-pointer stores
    // (this+0x00 → 0xcb640, this+0x50 → 0xcb660) are documented in the class comment above.
  }

  /**
   * OZChannelUint32Info::~OZChannelUint32Info()  @ProChannel 0x443e  (D1 — base destructor;
   * symbol __ZN19OZChannelUint32InfoD1Ev)
   *
   *   0x443e  push %rbp / mov %rsp,%rbp / push %rbx / push %rax   (prologue)
   *   0x4444  mov  %rdi,%rbx
   *   0x4447  addq $0x50,%rdi                                     (arg = &this->singleton at +0x50)
   *   0x444b  callq __ZN11PCSingletonD2Ev (stub)                  (destroy PCSingleton base)
   *   0x4450  mov  %rbx,%rdi                                      (arg = this — OZChannelInfo base @+0x00)
   *   0x4453  addq $0x8,%rsp / pop %rbx / pop %rbp                (epilogue)
   *   0x4459  jmp  __ZN13OZChannelInfoD2Ev                        (tail-call: destroy OZChannelInfo base)
   *
   * Faithful transcription: destroy PCSingleton sub-object first, then OZChannelInfo sub-object
   * (reverse-construction order — the standard C++ rule the compiler emitted here).
   */
  destroy(): void {
    // @0x444b — PCSingleton::~PCSingleton() on &this->singleton.
    this.singleton.destroy();
    // @0x4459 — tail-call OZChannelInfo::~OZChannelInfo() on this (base at +0x00).
    this.channelInfo.destroy();
  }

  /**
   * OZChannelUint32Info::~OZChannelUint32Info()  @ProChannel 0x445e  (D0 — deleting destructor;
   * symbol __ZN19OZChannelUint32InfoD0Ev)
   *
   *   0x445e  push %rbp / mov %rsp,%rbp / push %rbx / push %rax   (prologue)
   *   0x4464  mov  %rdi,%rbx
   *   0x4467  addq $0x50,%rdi
   *   0x446b  callq __ZN11PCSingletonD2Ev (stub)                  (destroy PCSingleton base)
   *   0x4470  mov  %rbx,%rdi
   *   0x4473  callq __ZN13OZChannelInfoD2Ev                       (destroy OZChannelInfo base)
   *   0x4478  mov  %rbx,%rdi
   *   0x447b  addq $0x8,%rsp / pop %rbx / pop %rbp
   *   0x4481  jmp  __ZdlPv (stub)                                 (tail-call: operator delete(this))
   *
   * Same teardown as D1, plus `operator delete(this)` at the end. In JS the GC does the delete;
   * the two base-destructor calls are the only observable effect.
   *
   * (Non-virtual thunks __ZThn80_N19OZChannelUint32InfoD1Ev @0x4486 and
   *  __ZThn80_N19OZChannelUint32InfoD0Ev @0x44a4 both `leaq -0x50(%rdi),%rbx` to recover the
   *  primary `this` pointer from the +0x50 sub-object pointer, then run the same teardown. They
   *  exist in the secondary vtable slot but are compiler-emitted glue with no additional
   *  observable behaviour — no separate TS methods needed.)
   */
  deleteAndDestroy(): void {
    // @0x446b — PCSingleton::~PCSingleton() on &this->singleton.
    this.singleton.destroy();
    // @0x4473 — OZChannelInfo::~OZChannelInfo() on this (base at +0x00).
    this.channelInfo.destroy();
    // @0x4481 — tail-call operator delete(this). No-op in JS (garbage collector reclaims).
  }
}
