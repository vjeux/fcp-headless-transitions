// OZChannelSeedInfo — channel-seed metadata descriptor (ProChannel.framework).
// FAITHFUL PORT — do NOT approximate, do NOT guess. Every method cites @ProChannel 0xADDR read
// from the disassembly under re/disasm/ProChannel.OZChannelSeedInfo.*.s. Struct layout recovered
// from the ctor body (@0xfdb6) — the constructor initialises TWO base sub-objects in place, then
// installs both vtable-pointers into (this+0x00) and (this+0x50):
//
//   +0x00   vtable ptr (OZChannelInfo primary)                       // set @0xfdf3..0xfdfa
//                        leaq 0xbfee6(%rip),%rax  → 0xcfce0 = __ZTV17OZChannelSeedInfo + 0x10
//   +0x00 .. +0x50   OZChannelInfo base sub-object
//                        constructed @0xfde0 via
//                        OZChannelInfo::OZChannelInfo(double, double, double, double, double,
//                                                     char const*)
//   +0x50   vtable ptr (PCSingleton secondary sub-object)             // set @0xfdfd..0xfe04
//                        leaq 0xbfefc(%rip),%rax  → 0xcfd00 = __ZTV17OZChannelSeedInfo + 0x30
//   +0x50 .. +0x??   PCSingleton base sub-object
//                        constructed @0xfdee via
//                        PCSingleton::PCSingleton(unsigned int)
//
// The constant seed values passed to OZChannelInfo::OZChannelInfo are read from ProChannel
// __TEXT __const at addresses recovered by walking the RIP-relative operands in the ctor asm:
//
//   arg1 (xmm0)  0.0                     ; xorps xmm0,xmm0 @0xfdd7
//   arg2 (xmm1)  4294967295.0            ; movsd 0x9f771(%rip),xmm1 @0xfdc7  → @const 0xaf540
//                                          (u64 0x41efffffffe00000)
//   arg3 (xmm2)  1.0                     ; movsd 0x9f751(%rip),xmm2 @0xfdcf  → @const 0xaf528
//                                          (u64 0x3ff0000000000000)
//   arg4 (xmm3)  1.0                     ; movaps xmm2,xmm3 @0xfdda   (copy of arg3)
//   arg5 (xmm4)  1.0                     ; movaps xmm2,xmm4 @0xfddd   (copy of arg3)
//   arg6 (rsi)   ""  (empty C string)    ; leaq 0xac631(%rip),rsi @0xfdc0  → @const 0xbc3f8
//                                          (literal pool; comment "": empty)
//
// The PCSingleton base gets a single u32 in %esi = 0x64 (= 100) — a slot/index or a max-count
// depending on how PCSingleton interprets it — this is a faithful raw value read from
// `movl $0x64,%esi` @0xfde9.
//
// Base classes (OZChannelInfo, PCSingleton) are UN-PORTED (frontier); their ctors are throwing
// stubs below that cite the FCP framework/address that would need transcription before an
// instance of OZChannelSeedInfo becomes structurally real. This keeps a "loud gap" in the port
// per raw-port/army/PORTING_SPEC.md Rule 3 rather than silently faking base-class state.
//
// DECODE references:
//   re/disasm/ProChannel.OZChannelSeedInfo.OZChannelSeedInfo.s   (ctor  @0xfdb6)
//   re/disasm/ProChannel.OZChannelSeedInfo.~OZChannelSeedInfo.s  (dtor  @0xfe40 / D1 @0xfe20)

// ── seed constants read from ProChannel __TEXT __const (VAs inside x86_64 slice) ──────────────
/** @const 0xaf540  double = 4294967295.0  (u64 0x41efffffffe00000) — OZChannelInfo::max seed */
const K_SEED_MAX: number = 4294967295.0;
/** @const 0xaf528  double = 1.0            (u64 0x3ff0000000000000) — OZChannelInfo::default seed */
const K_SEED_ONE: number = 1.0;
/** implicit zero — arg1 to OZChannelInfo::OZChannelInfo (xorps xmm0,xmm0 @0xfdd7) */
const K_SEED_ZERO: number = 0.0;
/** @const 0xbc3f8  empty C string ""       — OZChannelInfo::name seed (leaq 0xac631 @0xfdc0) */
const K_SEED_NAME: string = "";
/** immediate  0x64 = 100                    — PCSingleton::PCSingleton(u32) arg (movl @0xfde9) */
const K_SINGLETON_ARG_U32: number = 100;

// ── frontier stubs for un-ported base classes ─────────────────────────────────────────────────
/**
 * OZChannelInfo — base of OZChannelSeedInfo. Occupies +0x00 .. +0x50 (sizeof = 0x50 = 80 bytes,
 * inferred from `leaq 0x50(%rbx),%rdi` @0xfde5 which addresses the SECOND base sub-object).
 * Not yet transcribed. The ctor call at @0xfde0 dispatches to
 *   OZChannelInfo::OZChannelInfo(double, double, double, double, double, char const*)
 * which is a frontier method (would live in ProChannel next to OZChannelSeedInfo).
 */
export class OZChannelInfo {
  /** OZChannelInfo::OZChannelInfo(double,double,double,double,double,char const*)
   *  @ProChannel not yet transcribed (called from OZChannelSeedInfo::OZChannelSeedInfo @0xfde0). */
  constructor(
    _min: number,
    _max: number,
    _default: number,
    _defaultAlt: number,
    _defaultAlt2: number,
    _name: string,
  ) {
    throw new Error(
      "OZChannelInfo::OZChannelInfo(double,double,double,double,double,char const*) @ProChannel not yet transcribed (called from OZChannelSeedInfo::OZChannelSeedInfo @0xfde0)",
    );
  }
  /** OZChannelInfo::~OZChannelInfo() @ProChannel not yet transcribed
   *  (called from OZChannelSeedInfo::~OZChannelSeedInfo @0xfe55 and unwind @0xfe13). */
  destroy(): void {
    throw new Error(
      "OZChannelInfo::~OZChannelInfo() @ProChannel not yet transcribed (called from OZChannelSeedInfo::~OZChannelSeedInfo @0xfe55/@0xfe13)",
    );
  }
}

/**
 * PCSingleton — second base sub-object at +0x50. Not yet transcribed. Its ctor takes a single
 * unsigned int (here 100). Called via `symbol stub __ZN11PCSingletonC2Ej` @0xfdee; destroyed via
 * `symbol stub __ZN11PCSingletonD2Ev` @0xfe4d/@0xfe2d.
 */
export class PCSingleton {
  /** PCSingleton::PCSingleton(unsigned int) @ProChannel not yet transcribed
   *  (called from OZChannelSeedInfo::OZChannelSeedInfo @0xfdee with arg=100). */
  constructor(_slot: number) {
    throw new Error(
      "PCSingleton::PCSingleton(unsigned int) @ProChannel not yet transcribed (called from OZChannelSeedInfo::OZChannelSeedInfo @0xfdee with u32=100)",
    );
  }
  /** PCSingleton::~PCSingleton() @ProChannel not yet transcribed
   *  (called from OZChannelSeedInfo::~OZChannelSeedInfo @0xfe4d and D1 @0xfe2d). */
  destroy(): void {
    throw new Error(
      "PCSingleton::~PCSingleton() @ProChannel not yet transcribed (called from OZChannelSeedInfo::~OZChannelSeedInfo @0xfe4d/@0xfe2d)",
    );
  }
}

// ── OZChannelSeedInfo ─────────────────────────────────────────────────────────────────────────
export class OZChannelSeedInfo {
  /**
   * OZChannelInfo primary base sub-object at +0x00 .. +0x50.
   * Its vtable pointer @+0x00 is installed to __ZTV17OZChannelSeedInfo + 0x10 (VA 0xcfce0)
   * (leaq 0xbfee6(%rip),%rax ; movq %rax,(%rbx) @0xfdf3..0xfdfa).
   */
  readonly channelInfo: OZChannelInfo;

  /**
   * PCSingleton secondary base sub-object at +0x50.
   * Its vtable pointer @+0x50 is installed to __ZTV17OZChannelSeedInfo + 0x30 (VA 0xcfd00)
   * (leaq 0xbfefc(%rip),%rax ; movq %rax,0x50(%rbx) @0xfdfd..0xfe04).
   */
  readonly singleton: PCSingleton;

  /**
   * OZChannelSeedInfo::OZChannelSeedInfo()  @ProChannel 0xfdb6
   *
   * Faithful transcription of the 15-line ctor. Two base sub-objects constructed in-place with
   * the exact constants read from ProChannel __TEXT __const, then two vtable slots installed:
   *
   *   0xfdb6  push %rbp / mov %rsp,%rbp / push %r14 / push %rbx    (prologue)
   *   0xfdbd  mov %rdi,%rbx                                        (this)
   *   0xfdc0  leaq 0xac631(%rip),%rsi                              (arg6 = "" @const 0xbc3f8)
   *   0xfdc7  movsd 0x9f771(%rip),%xmm1                            (arg2 = 4294967295.0 @const 0xaf540)
   *   0xfdcf  movsd 0x9f751(%rip),%xmm2                            (arg3 = 1.0 @const 0xaf528)
   *   0xfdd7  xorps %xmm0,%xmm0                                    (arg1 = 0.0)
   *   0xfdda  movaps %xmm2,%xmm3                                   (arg4 = 1.0)
   *   0xfddd  movaps %xmm2,%xmm4                                   (arg5 = 1.0)
   *   0xfde0  callq  __ZN13OZChannelInfoC2EdddddPKc                (OZChannelInfo base @this+0x00)
   *   0xfde5  leaq 0x50(%rbx),%rdi                                 (arg = this+0x50)
   *   0xfde9  movl $0x64,%esi                                      (arg2 = 100u)
   *   0xfdee  callq  __ZN11PCSingletonC2Ej (stub)                  (PCSingleton base @this+0x50)
   *   0xfdf3  leaq 0xbfee6(%rip),%rax ; movq %rax,(%rbx)           ((this+0x00) = vt+0x10 @0xcfce0)
   *   0xfdfd  leaq 0xbfefc(%rip),%rax ; movq %rax,0x50(%rbx)       ((this+0x50) = vt+0x30 @0xcfd00)
   *   0xfe08  pop %rbx / pop %r14 / pop %rbp / retq                (epilogue)
   *   0xfe0d  (landingpad — unwind: OZChannelInfo::~OZChannelInfo @0xfe13 → __Unwind_Resume @0xfe1b)
   *
   * The unwind path (0xfe0d..0xfe1e) triggers only if PCSingleton's ctor throws; it tears the
   * already-constructed OZChannelInfo sub-object back down. Not modelled explicitly in TS (the
   * PCSingleton stub throws BEFORE this ctor could complete anyway).
   */
  constructor() {
    // @0xfde0 — construct OZChannelInfo base with (0.0, 4294967295.0, 1.0, 1.0, 1.0, "").
    this.channelInfo = new OZChannelInfo(
      K_SEED_ZERO,     // xmm0
      K_SEED_MAX,      // xmm1
      K_SEED_ONE,      // xmm2
      K_SEED_ONE,      // xmm3 (copy of xmm2)
      K_SEED_ONE,      // xmm4 (copy of xmm2)
      K_SEED_NAME,     // rsi
    );
    // @0xfdee — construct PCSingleton base at +0x50 with u32 = 100.
    this.singleton = new PCSingleton(K_SINGLETON_ARG_U32);
    // @0xfdf3 / @0xfdfd — install both vtable pointers. In TS classes there is no explicit
    // vtable to store; the JS class dispatch is the equivalent. The two v-pointer stores
    // (this+0x00 → 0xcfce0, this+0x50 → 0xcfd00) are documented in the class comment above.
  }

  /**
   * OZChannelSeedInfo::~OZChannelSeedInfo()  @ProChannel 0xfe20  (D1 — base destructor)
   *
   *   0xfe20  push %rbp / mov %rsp,%rbp / push %rbx / push %rax   (prologue)
   *   0xfe26  mov  %rdi,%rbx
   *   0xfe29  addq $0x50,%rdi                                     (arg = &this->singleton at +0x50)
   *   0xfe2d  callq __ZN11PCSingletonD2Ev (stub)                  (destroy PCSingleton base)
   *   0xfe32  mov  %rbx,%rdi                                      (arg = this — OZChannelInfo base @+0x00)
   *   0xfe35  addq $0x8,%rsp / pop %rbx / pop %rbp                (epilogue)
   *   0xfe3b  jmp  __ZN13OZChannelInfoD2Ev                        (tail-call: destroy OZChannelInfo base)
   *
   * Faithful transcription: destroy PCSingleton sub-object first, then OZChannelInfo sub-object
   * (reverse-construction order — the standard C++ rule the compiler emitted here).
   */
  destroy(): void {
    // @0xfe2d — PCSingleton::~PCSingleton() on &this->singleton.
    this.singleton.destroy();
    // @0xfe3b — tail-call OZChannelInfo::~OZChannelInfo() on this (base at +0x00).
    this.channelInfo.destroy();
  }

  /**
   * OZChannelSeedInfo::~OZChannelSeedInfo()  @ProChannel 0xfe40  (D0 — deleting destructor)
   *
   *   0xfe40  push %rbp / mov %rsp,%rbp / push %rbx / push %rax   (prologue)
   *   0xfe46  mov  %rdi,%rbx
   *   0xfe49  addq $0x50,%rdi
   *   0xfe4d  callq __ZN11PCSingletonD2Ev (stub)                  (destroy PCSingleton base)
   *   0xfe52  mov  %rbx,%rdi
   *   0xfe55  callq __ZN13OZChannelInfoD2Ev                       (destroy OZChannelInfo base)
   *   0xfe5a  mov  %rbx,%rdi
   *   0xfe5d  addq $0x8,%rsp / pop %rbx / pop %rbp
   *   0xfe63  jmp  __ZdlPv (stub)                                 (tail-call: operator delete(this))
   *
   * Same teardown as D1, plus `operator delete(this)` at the end. In JS the GC does the delete;
   * the two base-destructor calls are the only observable effect.
   */
  deleteAndDestroy(): void {
    // @0xfe4d — PCSingleton::~PCSingleton() on &this->singleton.
    this.singleton.destroy();
    // @0xfe55 — OZChannelInfo::~OZChannelInfo() on this (base at +0x00).
    this.channelInfo.destroy();
    // @0xfe63 — tail-call operator delete(this). No-op in JS (garbage collector reclaims).
  }
}
