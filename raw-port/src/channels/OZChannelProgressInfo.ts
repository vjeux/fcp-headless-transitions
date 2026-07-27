/**
 * OZChannelProgressInfo — ProChannel.framework  (x86_64 disasm-faithful port)
 *
 * FCP class describing the "progress" flavor of a channel: display suffix ""
 * (empty), min 0.0, max 0.0, stepCoarse 1.0, stepFine 1.0, displayScale 1.0,
 * plus an embedded PCSingleton with construction seed 0x64 (100).
 *
 * The C++ layout has TWO polymorphic subobjects:
 *   - primary base    OZChannelInfo   at offset +0x00
 *   - secondary base  PCSingleton     at offset +0x50
 * The ctor sets the primary vptr to `vtable+0x10` and the secondary vptr to
 * `vtable+0x30` — the two vtable slices that surround this class's own overrides.
 *
 * Methods transcribed:
 *   - OZChannelProgressInfo::OZChannelProgressInfo()  @0x7fcf0  (C2 base ctor)
 *   - OZChannelProgressInfo::~OZChannelProgressInfo() @0x7fd56  (D1 complete non-deleting dtor)
 *   - OZChannelProgressInfo::~OZChannelProgressInfo() @0x7fd76  (D0 deleting dtor)
 *
 * Frontier (not decoded here — throw when reached):
 *   - OZChannelInfo::OZChannelInfo(double,double,double,double,double,char const*) @__ZN13OZChannelInfoC2EdddddPKc
 *   - OZChannelInfo::~OZChannelInfo() @__ZN13OZChannelInfoD2Ev
 *   - PCSingleton::PCSingleton(unsigned int) (ProCore, undefined-in-ProChannel; imported symbol stub @0xacb46)
 *   - PCSingleton::~PCSingleton()           (ProCore, undefined-in-ProChannel; imported symbol stub @0xacb4c)
 *   - operator delete(void*)                (imported symbol stub @0xace04)
 *
 * Constants (all read from the ProChannel binary at the cited RIP-relative addresses):
 *   suffix    ""     @literal pool 0xbc3f8  (loaded via  leaq 0x3c6f7(%rip),%rsi @0x7fcfa)
 *   stepCoarse 1.0   (double @0xaf528)      loaded via movsd 0x2f81f(%rip),xmm2  @0x7fd01
 *   min       0.0                           xorps %xmm0,%xmm0                    @0x7fd09
 *   max       0.0                           xorps %xmm1,%xmm1                    @0x7fd0c
 *   stepFine  1.0                           movaps %xmm2,%xmm3 (copy of 1.0)     @0x7fd0f
 *   displayScale 1.0                        movaps %xmm2,%xmm4 (copy of 1.0)     @0x7fd12
 *   PCSingleton seed 0x64                   movl $0x64,%esi                       @0x7fd1e
 *   vtable          @__ZTV21OZChannelProgressInfo   (leaq @0x7fd28)
 *     primary   subobject vptr = vtable + 0x10  (@0x7fd2f, movq %rcx,(%rbx))
 *     secondary subobject vptr = vtable + 0x30  (@0x7fd36, movq %rax,0x50(%rbx))
 */

/** Opaque handle for the not-yet-transcribed OZChannelInfo base subobject. */
export interface OZChannelInfoSub {
  /** vptr — set to `&OZChannelProgressInfo::vtable + 0x10` by our ctor. */
  vptr: "OZChannelProgressInfo::vtable+0x10";
  /** ctor args, preserved in declaration order.  Actual field offsets within
   *  OZChannelInfo are unknown until OZChannelInfo is decoded. */
  arg0_min: number;          // xmm0 = 0.0
  arg1_max: number;          // xmm1 = 0.0
  arg2_stepCoarse: number;   // xmm2 = 1.0    (double @0xaf528)
  arg3_stepFine: number;     // xmm3 = 1.0    (copy of xmm2)
  arg4_displayScale: number; // xmm4 = 1.0    (copy of xmm2)
  arg5_suffix: string;       // rsi  = ""     (@0xbc3f8)
}

/** Opaque handle for the not-yet-transcribed PCSingleton base subobject. */
export interface PCSingletonSub {
  /** vptr — set to `&OZChannelProgressInfo::vtable + 0x30` by our ctor. */
  vptr: "OZChannelProgressInfo::vtable+0x30";
  /** ctor u32 seed passed at +0x50 — 0x64 (100). */
  seed: number;
}

/**
 * OZChannelProgressInfo layout (recovered from ctor @0x7fcf0 + dtors @0x7fd56/0x7fd76):
 *   offset 0x00 :  OZChannelInfo   subobject (primary base)   — vptr slice = vtable+0x10
 *   offset 0x50 :  PCSingleton     subobject (secondary base) — vptr slice = vtable+0x30
 * Total sizeof(OZChannelProgressInfo) = 0x50 + sizeof(PCSingleton). We do not yet know
 * sizeof(PCSingleton) — that's inside ProCore and out of scope for this file.
 */
export interface OZChannelProgressInfoLayout {
  /** +0x00 */ channelInfo: OZChannelInfoSub;
  /** +0x50 */ singleton: PCSingletonSub;
}

/**
 * OZChannelProgressInfo::OZChannelProgressInfo()  @ProChannel 0x7fcf0  (C2 base ctor)
 *
 * Disasm mirror (line-for-line):
 *   pushq %rbp / movq %rsp,%rbp / pushq %r14 / pushq %rbx      @0x7fcf0..0x7fcf6
 *   movq  %rdi, %rbx                                            @0x7fcf7      (rbx = this)
 *   leaq  0x3c6f7(%rip), %rsi   ## ""                           @0x7fcfa      (arg6 = ""   @0xbc3f8)
 *   movsd 0x2f81f(%rip), %xmm2  ## 1.0                          @0x7fd01      (arg3 = 1.0  @0xaf528)
 *   xorps %xmm0, %xmm0                                          @0x7fd09      (arg1 = 0.0)
 *   xorps %xmm1, %xmm1                                          @0x7fd0c      (arg2 = 0.0)
 *   movaps %xmm2, %xmm3                                         @0x7fd0f      (arg4 = 1.0)
 *   movaps %xmm2, %xmm4                                         @0x7fd12      (arg5 = 1.0)
 *   callq OZChannelInfo::OZChannelInfo(d,d,d,d,d,char const*)   @0x7fd15
 *   leaq  0x50(%rbx), %rdi                                      @0x7fd1a      (this + 0x50)
 *   movl  $0x64, %esi                                           @0x7fd1e      (u32 = 100)
 *   callq PCSingleton::PCSingleton(unsigned int)  [stub 0xacb46]@0x7fd23
 *   leaq  __ZTV21OZChannelProgressInfo(%rip), %rax              @0x7fd28
 *   leaq  0x10(%rax), %rcx                                      @0x7fd2f      (vtable + 0x10 -> primary vptr)
 *   movq  %rcx, (%rbx)                                          @0x7fd33
 *   addq  $0x30, %rax                                           @0x7fd36      (vtable + 0x30 -> secondary vptr)
 *   movq  %rax, 0x50(%rbx)                                      @0x7fd3a
 *   popq %rbx / popq %r14 / popq %rbp / retq                    @0x7fd3e..0x7fd42
 *
 * (The trailing block @0x7fd43..0x7fd55 is the exception-cleanup landing pad:
 *   on throw from PCSingleton::PCSingleton, it calls OZChannelInfo::~OZChannelInfo
 *   then jmps to _Unwind_Resume stub @0xacaf2. Mirrored here as `try/catch{throw}`.)
 */
export function OZChannelProgressInfo__ctor(this_: OZChannelProgressInfoLayout): void {
  // @0x7fcfa..0x7fd12 — prepare args in xmm/rsi registers.
  const arg1_min = 0.0;                      // xorps %xmm0,%xmm0        @0x7fd09
  const arg2_max = 0.0;                      // xorps %xmm1,%xmm1        @0x7fd0c
  const arg3_stepCoarse = 1.0;               // movsd 0x2f81f(%rip),xmm2 @0x7fd01 -> 0xaf528
  const arg4_stepFine = 1.0;                 // movaps %xmm2,%xmm3       @0x7fd0f (copy)
  const arg5_displayScale = 1.0;             // movaps %xmm2,%xmm4       @0x7fd12 (copy)
  const arg6_suffix = "";                    // leaq  0x3c6f7(%rip),rsi  @0x7fcfa -> 0xbc3f8

  // @0x7fd15 — construct primary base OZChannelInfo(0.0, 0.0, 1.0, 1.0, 1.0, "").
  //           Not decoded yet — throw a citing stub if actually invoked at runtime.
  try {
    OZChannelInfo__ctor(this_.channelInfo, arg1_min, arg2_max, arg3_stepCoarse, arg4_stepFine, arg5_displayScale, arg6_suffix);
  } catch (e) {
    // @0x7fd43 landing pad — mirror the C++ two-phase unwind. Nothing built above this
    // ctor in the OZChannelInfo phase (the primary was mid-construction), so re-throw.
    throw e;
  }

  // @0x7fd23 — construct secondary base PCSingleton at (this + 0x50) with seed 100.
  try {
    PCSingleton__ctor(this_.singleton, 0x64);
  } catch (e) {
    // @0x7fd43 landing pad — on throw from PCSingleton ctor, unwind OZChannelInfo:
    //   callq __ZN13OZChannelInfoD2Ev  @0x7fd49
    //   callq _Unwind_Resume stub      @0x7fd51
    OZChannelInfo__dtor(this_.channelInfo);
    throw e;
  }

  // @0x7fd28..0x7fd3a — install vptrs.  Both slices come from the SAME
  // OZChannelProgressInfo vtable object; the primary sits at +0x10 and the
  // secondary (PCSingleton) sits at +0x30 relative to __ZTV21OZChannelProgressInfo.
  this_.channelInfo.vptr = "OZChannelProgressInfo::vtable+0x10";
  this_.singleton.vptr = "OZChannelProgressInfo::vtable+0x30";
}

/**
 * OZChannelProgressInfo::~OZChannelProgressInfo()  @ProChannel 0x7fd56  (D1: complete, non-deleting)
 *
 * Disasm mirror:
 *   pushq %rbp / movq %rsp,%rbp / pushq %rbx / pushq %rax    @0x7fd56..0x7fd5b
 *   movq  %rdi, %rbx                                          @0x7fd5c   (rbx = this)
 *   addq  $0x50, %rdi                                         @0x7fd5f   (this + 0x50 = PCSingleton subobj)
 *   callq PCSingleton::~PCSingleton() [stub 0xacb4c]          @0x7fd63
 *   movq  %rbx, %rdi                                          @0x7fd68
 *   addq  $0x8, %rsp / popq %rbx / popq %rbp                  @0x7fd6b..0x7fd70
 *   jmp   OZChannelInfo::~OZChannelInfo()                     @0x7fd71   (tail-call)
 */
export function OZChannelProgressInfo__dtor_D1(this_: OZChannelProgressInfoLayout): void {
  // @0x7fd5f..0x7fd63 — destroy secondary base PCSingleton at (this + 0x50).
  PCSingleton__dtor(this_.singleton);
  // @0x7fd71 — tail-call primary base OZChannelInfo destructor.
  OZChannelInfo__dtor(this_.channelInfo);
}

/**
 * OZChannelProgressInfo::~OZChannelProgressInfo()  @ProChannel 0x7fd76  (D0: complete, deleting)
 *
 * Disasm mirror:
 *   pushq %rbp / movq %rsp,%rbp / pushq %rbx / pushq %rax    @0x7fd76..0x7fd7b
 *   movq  %rdi, %rbx                                          @0x7fd7c
 *   addq  $0x50, %rdi                                         @0x7fd7f
 *   callq PCSingleton::~PCSingleton() [stub 0xacb4c]          @0x7fd83
 *   movq  %rbx, %rdi                                          @0x7fd88
 *   callq OZChannelInfo::~OZChannelInfo()                     @0x7fd8b
 *   movq  %rbx, %rdi                                          @0x7fd90
 *   addq  $0x8, %rsp / popq %rbx / popq %rbp                  @0x7fd93..0x7fd98
 *   jmp   operator delete(void*) [stub 0xace04]               @0x7fd99   (tail-call)
 *
 * NOTE: the D0 slot is the "deleting destructor" — same body as D1 plus a final
 * `operator delete(this)`.  In JS/TS there's no explicit `delete` operator on
 * arbitrary objects; GC handles it.  We still model the call as a distinguished
 * stub so vtable-slot dispatch stays faithful.
 */
export function OZChannelProgressInfo__dtor_D0(this_: OZChannelProgressInfoLayout): void {
  // @0x7fd83 — destroy secondary base PCSingleton at (this + 0x50).
  PCSingleton__dtor(this_.singleton);
  // @0x7fd8b — destroy primary base OZChannelInfo.
  OZChannelInfo__dtor(this_.channelInfo);
  // @0x7fd99 — tail-call operator delete(this).  Frontier stub (JS has no direct equivalent).
  operator_delete(this_);
}

// ---------------------------------------------------------------------------
// Frontier stubs — every callee we could not yet decode raises loudly at
// runtime (per PORTING_SPEC Rule 3).  Each stub cites its own address.
// ---------------------------------------------------------------------------

/** OZChannelInfo::OZChannelInfo(double,double,double,double,double,char const*)
 *  Callee of OZChannelProgressInfo ctor @0x7fd15.  Not yet decoded — throws. */
function OZChannelInfo__ctor(
  _sub: OZChannelInfoSub,
  _min: number, _max: number, _stepCoarse: number, _stepFine: number, _displayScale: number, _suffix: string,
): void {
  throw new Error(
    "OZChannelInfo::OZChannelInfo(double,double,double,double,double,char const*) " +
    "@ProChannel __ZN13OZChannelInfoC2EdddddPKc (called from OZChannelProgressInfo ctor @0x7fd15) not yet transcribed"
  );
}

/** OZChannelInfo::~OZChannelInfo()
 *  Callee of D1 dtor @0x7fd71 (tail-jmp) and D0 dtor @0x7fd8b and
 *  the ctor cleanup landing pad @0x7fd49.  Not yet decoded — throws. */
function OZChannelInfo__dtor(_sub: OZChannelInfoSub): void {
  throw new Error(
    "OZChannelInfo::~OZChannelInfo() @ProChannel __ZN13OZChannelInfoD2Ev " +
    "(called from OZChannelProgressInfo D1@0x7fd71 / D0@0x7fd8b / ctor-landing@0x7fd49) not yet transcribed"
  );
}

/** PCSingleton::PCSingleton(unsigned int)  — imported from ProCore.
 *  Callee of OZChannelProgressInfo ctor @0x7fd23 (stub @0xacb46).  Not decoded — throws. */
function PCSingleton__ctor(_sub: PCSingletonSub, _seed: number): void {
  throw new Error(
    "PCSingleton::PCSingleton(unsigned int) @ProCore (imported; ProChannel stub @0xacb46, " +
    "called from OZChannelProgressInfo ctor @0x7fd23) not yet transcribed"
  );
}

/** PCSingleton::~PCSingleton()  — imported from ProCore.
 *  Callee of D1 dtor @0x7fd63 and D0 dtor @0x7fd83 (stub @0xacb4c).  Not decoded — throws. */
function PCSingleton__dtor(_sub: PCSingletonSub): void {
  throw new Error(
    "PCSingleton::~PCSingleton() @ProCore (imported; ProChannel stub @0xacb4c, " +
    "called from OZChannelProgressInfo D1@0x7fd63 / D0@0x7fd83) not yet transcribed"
  );
}

/** operator delete(void*)  — imported.
 *  Tail-called from D0 dtor @0x7fd99 (stub @0xace04). */
function operator_delete(_this: OZChannelProgressInfoLayout): void {
  throw new Error(
    "operator delete(void*) @__ZdlPv (imported; ProChannel stub @0xace04, " +
    "tail-called from OZChannelProgressInfo D0 @0x7fd99) not yet transcribed"
  );
}
