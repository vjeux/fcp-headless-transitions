// OZChanObjectRefInfo — object-reference channel metadata descriptor (ProChannel.framework).
// FAITHFUL PORT — do NOT approximate, do NOT guess. Every method cites @ProChannel 0xADDR read
// from the disassembly under re/disasm/ProChannel.OZChanObjectRefInfo.*.s. Struct layout
// recovered from the ctor body (@0x91f28) — the constructor initialises TWO base sub-objects in
// place, then installs both vtable-pointers into (this+0x00) and (this+0x50):
//
//   +0x00   vtable ptr (OZChannelInfo primary)                       // set @0x91f65..0x91f70
//                        leaq __ZTV19OZChanObjectRefInfo(%rip),%rax
//                        leaq 0x10(%rax),%rcx ; movq %rcx,(%rbx)     → 0xe28a0 = vt + 0x10
//   +0x00 .. +0x50   OZChannelInfo base sub-object
//                        constructed @0x91f52 via
//                        OZChannelInfo::OZChannelInfo(double, double, double, double, double,
//                                                     char const*)
//   +0x50   vtable ptr (PCSingleton secondary sub-object)             // set @0x91f73..0x91f77
//                        addq $0x30,%rax ; movq %rax,0x50(%rbx)      → 0xe28c0 = vt + 0x30
//   +0x50 .. +0x??   PCSingleton base sub-object
//                        constructed @0x91f60 via
//                        PCSingleton::PCSingleton(unsigned int)
//
// The constant seed values passed to OZChannelInfo::OZChannelInfo are read from ProChannel
// __TEXT __const at addresses recovered by walking the RIP-relative operands in the ctor asm:
//
//   arg1 (xmm0)  0.0                     ; xorps xmm0,xmm0 @0x91f49
//   arg2 (xmm1)  4294967295.0            ; movsd 0x1d5ff(%rip),xmm1 @0x91f39 → @const 0xaf540
//                                          (u64 0x41efffffffe00000)
//   arg3 (xmm2)  1.0                     ; movsd 0x1d5df(%rip),xmm2 @0x91f41 → @const 0xaf528
//                                          (u64 0x3ff0000000000000)
//   arg4 (xmm3)  1.0                     ; movaps xmm2,xmm3 @0x91f4c   (copy of arg3)
//   arg5 (xmm4)  1.0                     ; movaps xmm2,xmm4 @0x91f4f   (copy of arg3)
//   arg6 (rsi)   ""  (empty C string)    ; leaq 0x2a4bf(%rip),rsi @0x91f32
//                                          (literal pool; otool comment: literal pool for "")
//
// The PCSingleton base gets a single u32 in %esi = 0x64 (= 100) — a slot/index or a max-count
// depending on how PCSingleton interprets it — this is a faithful raw value read from
// `movl $0x64,%esi` @0x91f5b.
//
// Base classes (OZChannelInfo, PCSingleton) are UN-PORTED (frontier); their ctors/dtors are
// throwing stubs below that cite the FCP framework/address that would need transcription before
// an instance of OZChanObjectRefInfo becomes structurally real. This keeps a "loud gap" in the
// port per raw-port/army/PORTING_SPEC.md Rule 3 rather than silently faking base-class state.
//
// The vtable for OZChanObjectRefInfo lives at ProChannel VA 0xe2890 (`__ZTV19OZChanObjectRefInfo`);
// the two installed pointers are vt+0x10 = 0xe28a0 (primary) and vt+0x30 = 0xe28c0 (secondary).
//
// DECODE references:
//   re/disasm/ProChannel.OZChanObjectRefInfo.OZChanObjectRefInfo.s   (ctor @0x91f28)
//   re/disasm/ProChannel.OZChanObjectRefInfo.~OZChanObjectRefInfo.s  (D0   @0x91fb4)
//                                                                     D1   @0x91f94

// ── seed constants read from ProChannel __TEXT __const (VAs inside x86_64 slice) ──────────────
/** @const 0xaf540  double = 4294967295.0  (u64 0x41efffffffe00000) — OZChannelInfo arg2 seed */
const K_OBJECTREF_MAX: number = 4294967295.0;
/** @const 0xaf528  double = 1.0            (u64 0x3ff0000000000000) — OZChannelInfo arg3 seed */
const K_OBJECTREF_ONE: number = 1.0;
/** implicit zero — arg1 to OZChannelInfo::OZChannelInfo (xorps xmm0,xmm0 @0x91f49) */
const K_OBJECTREF_ZERO: number = 0.0;
/** empty C string "" — OZChannelInfo arg6 name seed (leaq 0x2a4bf(%rip),rsi @0x91f32) */
const K_OBJECTREF_NAME: string = "";
/** immediate  0x64 = 100 — PCSingleton::PCSingleton(u32) arg (movl $0x64,%esi @0x91f5b) */
const K_SINGLETON_ARG_U32: number = 100;

// ── frontier stubs for un-ported base classes ─────────────────────────────────────────────────
/**
 * OZChannelInfo — base of OZChanObjectRefInfo. Occupies +0x00 .. +0x50 (sizeof = 0x50 = 80
 * bytes, inferred from `leaq 0x50(%rbx),%rdi` @0x91f57 which addresses the SECOND base
 * sub-object).
 * Not yet transcribed. The ctor call at @0x91f52 dispatches to
 *   OZChannelInfo::OZChannelInfo(double, double, double, double, double, char const*)
 * which is a frontier method (would live in ProChannel next to OZChanObjectRefInfo).
 */
export class OZChannelInfo {
  /** OZChannelInfo::OZChannelInfo(double,double,double,double,double,char const*)
   *  @ProChannel not yet transcribed (called from OZChanObjectRefInfo::OZChanObjectRefInfo @0x91f52). */
  constructor(
    _min: number,
    _max: number,
    _default: number,
    _defaultAlt: number,
    _defaultAlt2: number,
    _name: string,
  ) {
    throw new Error(
      "OZChannelInfo::OZChannelInfo(double,double,double,double,double,char const*) @ProChannel not yet transcribed (called from OZChanObjectRefInfo::OZChanObjectRefInfo @0x91f52)",
    );
  }
  /** OZChannelInfo::~OZChannelInfo() @ProChannel not yet transcribed
   *  (called from OZChanObjectRefInfo::~OZChanObjectRefInfo D0 @0x91fc9,
   *  D1 tail-jump @0x91faf, and ctor unwind @0x91f86). */
  destroy(): void {
    throw new Error(
      "OZChannelInfo::~OZChannelInfo() @ProChannel not yet transcribed (called from OZChanObjectRefInfo::~OZChanObjectRefInfo @0x91fc9 / D1 tail @0x91faf / unwind @0x91f86)",
    );
  }
}

/**
 * PCSingleton — second base sub-object at +0x50. Not yet transcribed. Its ctor takes a single
 * unsigned int (here 100). Called via `symbol stub __ZN11PCSingletonC2Ej` @0x91f60; destroyed
 * via `symbol stub __ZN11PCSingletonD2Ev` @0x91fc1 (D0) and @0x91fa1 (D1).
 */
export class PCSingleton {
  /** PCSingleton::PCSingleton(unsigned int) @ProChannel not yet transcribed
   *  (called from OZChanObjectRefInfo::OZChanObjectRefInfo @0x91f60 with arg=100). */
  constructor(_slot: number) {
    throw new Error(
      "PCSingleton::PCSingleton(unsigned int) @ProChannel not yet transcribed (called from OZChanObjectRefInfo::OZChanObjectRefInfo @0x91f60 with u32=100)",
    );
  }
  /** PCSingleton::~PCSingleton() @ProChannel not yet transcribed
   *  (called from OZChanObjectRefInfo::~OZChanObjectRefInfo D0 @0x91fc1 and D1 @0x91fa1). */
  destroy(): void {
    throw new Error(
      "PCSingleton::~PCSingleton() @ProChannel not yet transcribed (called from OZChanObjectRefInfo::~OZChanObjectRefInfo @0x91fc1 / D1 @0x91fa1)",
    );
  }
}

// ── OZChanObjectRefInfo ───────────────────────────────────────────────────────────────────────
export class OZChanObjectRefInfo {
  /**
   * OZChannelInfo primary base sub-object at +0x00 .. +0x50.
   * Its vtable pointer @+0x00 is installed to __ZTV19OZChanObjectRefInfo + 0x10 (VA 0xe28a0)
   * (leaq __ZTV19OZChanObjectRefInfo(%rip),%rax @0x91f65 ; leaq 0x10(%rax),%rcx @0x91f6c ;
   *  movq %rcx,(%rbx) @0x91f70).
   */
  readonly channelInfo: OZChannelInfo;

  /**
   * PCSingleton secondary base sub-object at +0x50.
   * Its vtable pointer @+0x50 is installed to __ZTV19OZChanObjectRefInfo + 0x30 (VA 0xe28c0)
   * (addq $0x30,%rax @0x91f73 ; movq %rax,0x50(%rbx) @0x91f77).
   */
  readonly singleton: PCSingleton;

  /**
   * OZChanObjectRefInfo::OZChanObjectRefInfo()  @ProChannel 0x91f28
   *
   * Faithful transcription of the ctor. Two base sub-objects constructed in-place with the exact
   * constants read from ProChannel __TEXT __const, then two vtable slots installed:
   *
   *   0x91f28  push %rbp / mov %rsp,%rbp / push %r14 / push %rbx   (prologue)
   *   0x91f2f  mov  %rdi,%rbx                                      (this)
   *   0x91f32  leaq 0x2a4bf(%rip),%rsi                             (arg6 = "" — literal pool)
   *   0x91f39  movsd 0x1d5ff(%rip),%xmm1                           (arg2 = 4294967295.0 @const 0xaf540)
   *   0x91f41  movsd 0x1d5df(%rip),%xmm2                           (arg3 = 1.0            @const 0xaf528)
   *   0x91f49  xorps %xmm0,%xmm0                                   (arg1 = 0.0)
   *   0x91f4c  movaps %xmm2,%xmm3                                  (arg4 = 1.0)
   *   0x91f4f  movaps %xmm2,%xmm4                                  (arg5 = 1.0)
   *   0x91f52  callq __ZN13OZChannelInfoC2EdddddPKc                (OZChannelInfo base @this+0x00)
   *   0x91f57  leaq 0x50(%rbx),%rdi                                (arg = this+0x50)
   *   0x91f5b  movl $0x64,%esi                                     (arg2 = 100u)
   *   0x91f60  callq __ZN11PCSingletonC2Ej (stub)                  (PCSingleton base @this+0x50)
   *   0x91f65  leaq __ZTV19OZChanObjectRefInfo(%rip),%rax          (vt base = 0xe2890)
   *   0x91f6c  leaq 0x10(%rax),%rcx                                (rcx = vt + 0x10 = 0xe28a0)
   *   0x91f70  movq %rcx,(%rbx)                                    ((this+0x00) = 0xe28a0)
   *   0x91f73  addq $0x30,%rax                                     (rax = vt + 0x30 = 0xe28c0)
   *   0x91f77  movq %rax,0x50(%rbx)                                ((this+0x50) = 0xe28c0)
   *   0x91f7b  pop %rbx / pop %r14 / pop %rbp / retq               (epilogue)
   *   0x91f80  (landingpad — unwind: OZChannelInfo::~OZChannelInfo @0x91f86 → __Unwind_Resume @0x91f8e)
   *
   * The unwind path (0x91f80..0x91f92) triggers only if PCSingleton's ctor throws; it tears the
   * already-constructed OZChannelInfo sub-object back down. Not modelled explicitly in TS (the
   * PCSingleton stub throws BEFORE this ctor could complete anyway).
   */
  constructor() {
    // @0x91f52 — construct OZChannelInfo base with (0.0, 4294967295.0, 1.0, 1.0, 1.0, "").
    this.channelInfo = new OZChannelInfo(
      K_OBJECTREF_ZERO,   // xmm0
      K_OBJECTREF_MAX,    // xmm1
      K_OBJECTREF_ONE,    // xmm2
      K_OBJECTREF_ONE,    // xmm3 (copy of xmm2)
      K_OBJECTREF_ONE,    // xmm4 (copy of xmm2)
      K_OBJECTREF_NAME,   // rsi
    );
    // @0x91f60 — construct PCSingleton base at +0x50 with u32 = 100.
    this.singleton = new PCSingleton(K_SINGLETON_ARG_U32);
    // @0x91f65 / @0x91f77 — install both vtable pointers. In TS classes there is no explicit
    // vtable to store; the JS class dispatch is the equivalent. The two v-pointer stores
    // (this+0x00 → 0xe28a0, this+0x50 → 0xe28c0) are documented in the class comment above.
  }

  /**
   * OZChanObjectRefInfo::~OZChanObjectRefInfo()  @ProChannel 0x91f94  (D1 — base destructor)
   *
   *   0x91f94  push %rbp / mov %rsp,%rbp / push %rbx / push %rax    (prologue)
   *   0x91f9a  mov  %rdi,%rbx
   *   0x91f9d  addq $0x50,%rdi                                      (arg = &this->singleton at +0x50)
   *   0x91fa1  callq __ZN11PCSingletonD2Ev (stub)                   (destroy PCSingleton base)
   *   0x91fa6  mov  %rbx,%rdi                                       (arg = this — OZChannelInfo base @+0x00)
   *   0x91fa9  addq $0x8,%rsp / pop %rbx / pop %rbp                 (epilogue)
   *   0x91faf  jmp  __ZN13OZChannelInfoD2Ev                         (tail-call: destroy OZChannelInfo base)
   *
   * Faithful transcription: destroy PCSingleton sub-object first, then OZChannelInfo sub-object
   * (reverse-construction order — the standard C++ rule the compiler emitted here).
   */
  destroy(): void {
    // @0x91fa1 — PCSingleton::~PCSingleton() on &this->singleton.
    this.singleton.destroy();
    // @0x91faf — tail-call OZChannelInfo::~OZChannelInfo() on this (base at +0x00).
    this.channelInfo.destroy();
  }

  /**
   * OZChanObjectRefInfo::~OZChanObjectRefInfo()  @ProChannel 0x91fb4  (D0 — deleting destructor)
   *
   *   0x91fb4  push %rbp / mov %rsp,%rbp / push %rbx / push %rax    (prologue)
   *   0x91fba  mov  %rdi,%rbx
   *   0x91fbd  addq $0x50,%rdi
   *   0x91fc1  callq __ZN11PCSingletonD2Ev (stub)                   (destroy PCSingleton base)
   *   0x91fc6  mov  %rbx,%rdi
   *   0x91fc9  callq __ZN13OZChannelInfoD2Ev                        (destroy OZChannelInfo base)
   *   0x91fce  mov  %rbx,%rdi
   *   0x91fd1  addq $0x8,%rsp / pop %rbx / pop %rbp
   *   0x91fd7  jmp  __ZdlPv (stub)                                  (tail-call: operator delete(this))
   *
   * Same teardown as D1, plus `operator delete(this)` at the end. In JS the GC does the delete;
   * the two base-destructor calls are the only observable effect.
   */
  deleteAndDestroy(): void {
    // @0x91fc1 — PCSingleton::~PCSingleton() on &this->singleton.
    this.singleton.destroy();
    // @0x91fc9 — OZChannelInfo::~OZChannelInfo() on this (base at +0x00).
    this.channelInfo.destroy();
    // @0x91fd7 — tail-call operator delete(this). No-op in JS (garbage collector reclaims).
  }
}
