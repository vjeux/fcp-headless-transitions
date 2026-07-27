/**
 * OZChannelPercentInfo — ProChannel.framework  (x86_64 disasm-faithful port)
 *
 * FCP class describing the "percent" flavor of a channel: display suffix "%",
 * default value 0.0, step 1.0, min 0.01, max 100.0, precision 0.0001,
 * plus an embedded PCSingleton with construction seed 0x64 (100).
 *
 * The C++ layout has TWO polymorphic subobjects:
 *   - primary base    OZChannelInfo   at offset +0x00
 *   - secondary base  PCSingleton     at offset +0x50
 * The ctor sets the primary vptr to `vtable+0x10` and the secondary vptr to
 * `vtable+0x30` — the two vtable slices that surround this class's own overrides.
 *
 * Methods transcribed:
 *   - OZChannelPercentInfo::OZChannelPercentInfo() @0xab94a  (C2 base ctor)
 *   - OZChannelPercentInfo::~OZChannelPercentInfo() @0xab9c0 (D1 complete non-deleting dtor)
 *   - OZChannelPercentInfo::~OZChannelPercentInfo() @0xab9e0 (D0 deleting dtor)
 *
 * Frontier (not decoded here — throw when reached):
 *   - OZChannelInfo::OZChannelInfo(double,double,double,double,double,char const*) @__ZN13OZChannelInfoC2EdddddPKc
 *   - OZChannelInfo::~OZChannelInfo() @__ZN13OZChannelInfoD2Ev
 *   - PCSingleton::PCSingleton(unsigned int) (ProCore, undefined-in-ProChannel; imported symbol stub @0xacb46)
 *   - PCSingleton::~PCSingleton()           (ProCore, undefined-in-ProChannel; imported symbol stub @0xacb4c)
 *   - operator delete(void*)                (imported symbol stub @0xace04)
 *
 * Constants (all read from the ProChannel binary at the cited RIP-relative addresses):
 *   suffix   "%"    @literal pool 0xbd2aa  (loaded via  leaq 0x1194f(%rip),%rsi @0xab954)
 *   default  0.0            @xorps xmm0,xmm0  (@0xab97b)
 *   step     1.0    (double @0xaf528)  loaded via movsd 0x3bc5(%rip),xmm1 @0xab95b
 *   min      0.01   (double @0xaf520)  loaded via movsd 0x3bb5(%rip),xmm2 @0xab963
 *   precision 0.0001 (double @0xaf588) loaded via movsd 0x3c15(%rip),xmm3 @0xab96b
 *   max      100.0  (double @0xaf518)  loaded via movsd 0x3b9d(%rip),xmm4 @0xab973
 *   PCSingleton seed 0x64  @imm  movl $0x64,%esi @0xab987
 *   vtable          @__ZTV20OZChannelPercentInfo   (leaq @0xab991)
 *     primary   subobject vptr = vtable + 0x10  (@0xab998, movq %rcx,(%rbx))
 *     secondary subobject vptr = vtable + 0x30  (@0xab99f, movq %rax,0x50(%rbx))
 */

/** Opaque handle for the not-yet-transcribed OZChannelInfo base subobject. */
export interface OZChannelInfoSub {
  /** vptr — set to `&OZChannelPercentInfo::vtable + 0x10` by our ctor. */
  vptr: "OZChannelPercentInfo::vtable+0x10";
  /** ctor args, preserved in declaration order.  Actual field offsets within
   *  OZChannelInfo are unknown until OZChannelInfo is decoded. */
  arg0_default: number;    // xmm0 = 0.0
  arg1_step: number;       // xmm1 = 1.0     (double @0xaf528)
  arg2_min: number;        // xmm2 = 0.01    (double @0xaf520)
  arg3_precision: number;  // xmm3 = 0.0001  (double @0xaf588)
  arg4_max: number;        // xmm4 = 100.0   (double @0xaf518)
  arg5_suffix: string;     // rsi  = "%"     (@0xbd2aa)
}

/** Opaque handle for the not-yet-transcribed PCSingleton base subobject. */
export interface PCSingletonSub {
  /** vptr — set to `&OZChannelPercentInfo::vtable + 0x30` by our ctor. */
  vptr: "OZChannelPercentInfo::vtable+0x30";
  /** ctor u32 seed passed at +0x50 — 0x64 (100). */
  seed: number;
}

/**
 * OZChannelPercentInfo layout (recovered from ctor @0xab94a + dtors @0xab9c0/0xab9e0):
 *   offset 0x00 :  OZChannelInfo   subobject (primary base)   — vptr slice = vtable+0x10
 *   offset 0x50 :  PCSingleton     subobject (secondary base) — vptr slice = vtable+0x30
 * Total sizeof(OZChannelPercentInfo) = 0x50 + sizeof(PCSingleton). We do not yet know
 * sizeof(PCSingleton) — that's inside ProCore and out of scope for this file.
 */
export interface OZChannelPercentInfoLayout {
  /** +0x00 */ channelInfo: OZChannelInfoSub;
  /** +0x50 */ singleton: PCSingletonSub;
}

/**
 * OZChannelPercentInfo::OZChannelPercentInfo()  @ProChannel 0xab94a  (C2 base ctor)
 *
 * Disasm mirror (line-for-line):
 *   pushq %rbp / movq %rsp,%rbp / pushq %r14 / pushq %rbx      @0xab94a..0xab950
 *   movq  %rdi, %rbx                                            @0xab951      (rbx = this)
 *   leaq  0x1194f(%rip), %rsi   ## "%"                          @0xab954      (arg6 = "%"  @0xbd2aa)
 *   movsd 0x3bc5(%rip),  %xmm1  ## 1.0                          @0xab95b      (arg2 = 1.0    @0xaf528)
 *   movsd 0x3bb5(%rip),  %xmm2  ## 0.01                         @0xab963      (arg3 = 0.01   @0xaf520)
 *   movsd 0x3c15(%rip),  %xmm3  ## 0.0001                       @0xab96b      (arg4 = 0.0001 @0xaf588)
 *   movsd 0x3b9d(%rip),  %xmm4  ## 100.0                        @0xab973      (arg5 = 100.0  @0xaf518)
 *   xorps %xmm0, %xmm0                                          @0xab97b      (arg1 = 0.0)
 *   callq OZChannelInfo::OZChannelInfo(d,d,d,d,d,char const*)   @0xab97e
 *   leaq  0x50(%rbx), %rdi                                      @0xab983      (this + 0x50)
 *   movl  $0x64, %esi                                           @0xab987      (u32 = 100)
 *   callq PCSingleton::PCSingleton(unsigned int)  [stub 0xacb46]@0xab98c
 *   leaq  __ZTV20OZChannelPercentInfo(%rip), %rax               @0xab991
 *   leaq  0x10(%rax), %rcx                                      @0xab998      (vtable + 0x10 -> primary vptr)
 *   movq  %rcx, (%rbx)                                          @0xab99c
 *   addq  $0x30, %rax                                           @0xab99f      (vtable + 0x30 -> secondary vptr)
 *   movq  %rax, 0x50(%rbx)                                      @0xab9a3
 *   popq %rbx / popq %r14 / popq %rbp / retq                    @0xab9a7..0xab9ab
 *
 * (The trailing block @0xab9ac..0xab9be is the exception-cleanup landing pad:
 *   on throw from PCSingleton::PCSingleton, it calls OZChannelInfo::~OZChannelInfo
 *   then jmps to _Unwind_Resume stub @0xacaf2. Mirrored here as `try/catch{throw}`.)
 */
export function OZChannelPercentInfo__ctor(this_: OZChannelPercentInfoLayout): void {
  // @0xab954..0xab97b — prepare args in xmm/rsi registers.
  const arg1_default = 0.0;                  // xorps %xmm0,%xmm0        @0xab97b
  const arg2_step = 1.0;                     // movsd 0x3bc5(%rip),xmm1  @0xab95b -> 0xaf528
  const arg3_min = 0.01;                     // movsd 0x3bb5(%rip),xmm2  @0xab963 -> 0xaf520
  const arg4_precision = 0.0001;             // movsd 0x3c15(%rip),xmm3  @0xab96b -> 0xaf588
  const arg5_max = 100.0;                    // movsd 0x3b9d(%rip),xmm4  @0xab973 -> 0xaf518
  const arg6_suffix = "%";                   // leaq  0x1194f(%rip),rsi  @0xab954 -> 0xbd2aa

  // @0xab97e — construct primary base OZChannelInfo(0.0, 1.0, 0.01, 0.0001, 100.0, "%").
  //           Not decoded yet — throw a citing stub if actually invoked at runtime.
  try {
    OZChannelInfo__ctor(this_.channelInfo, arg1_default, arg2_step, arg3_min, arg4_precision, arg5_max, arg6_suffix);
  } catch (e) {
    // @0xab9ac landing pad — mirror the C++ two-phase unwind. Nothing built above this
    // ctor in the OZChannelInfo phase (the primary was mid-construction), so re-throw.
    throw e;
  }

  // @0xab98c — construct secondary base PCSingleton at (this + 0x50) with seed 100.
  try {
    PCSingleton__ctor(this_.singleton, 0x64);
  } catch (e) {
    // @0xab9ac landing pad — on throw from PCSingleton ctor, unwind OZChannelInfo:
    //   callq __ZN13OZChannelInfoD2Ev  @0xab9b2
    //   callq _Unwind_Resume stub      @0xab9ba
    OZChannelInfo__dtor(this_.channelInfo);
    throw e;
  }

  // @0xab991..0xab9a3 — install vptrs.  Both slices come from the SAME
  // OZChannelPercentInfo vtable object; the primary sits at +0x10 and the
  // secondary (PCSingleton) sits at +0x30 relative to __ZTV20OZChannelPercentInfo.
  this_.channelInfo.vptr = "OZChannelPercentInfo::vtable+0x10";
  this_.singleton.vptr = "OZChannelPercentInfo::vtable+0x30";
}

/**
 * OZChannelPercentInfo::~OZChannelPercentInfo()  @ProChannel 0xab9c0  (D1: complete, non-deleting)
 *
 * Disasm mirror:
 *   pushq %rbp / movq %rsp,%rbp / pushq %rbx / pushq %rax    @0xab9c0..0xab9c5
 *   movq  %rdi, %rbx                                          @0xab9c6   (rbx = this)
 *   addq  $0x50, %rdi                                         @0xab9c9   (this + 0x50 = PCSingleton subobj)
 *   callq PCSingleton::~PCSingleton() [stub 0xacb4c]          @0xab9cd
 *   movq  %rbx, %rdi                                          @0xab9d2
 *   addq  $0x8, %rsp / popq %rbx / popq %rbp                  @0xab9d5..0xab9da
 *   jmp   OZChannelInfo::~OZChannelInfo()                     @0xab9db   (tail-call)
 */
export function OZChannelPercentInfo__dtor_D1(this_: OZChannelPercentInfoLayout): void {
  // @0xab9c9..0xab9cd — destroy secondary base PCSingleton at (this + 0x50).
  PCSingleton__dtor(this_.singleton);
  // @0xab9db — tail-call primary base OZChannelInfo destructor.
  OZChannelInfo__dtor(this_.channelInfo);
}

/**
 * OZChannelPercentInfo::~OZChannelPercentInfo()  @ProChannel 0xab9e0  (D0: complete, deleting)
 *
 * Disasm mirror:
 *   pushq %rbp / movq %rsp,%rbp / pushq %rbx / pushq %rax    @0xab9e0..0xab9e5
 *   movq  %rdi, %rbx                                          @0xab9e6
 *   addq  $0x50, %rdi                                         @0xab9e9
 *   callq PCSingleton::~PCSingleton() [stub 0xacb4c]          @0xab9ed
 *   movq  %rbx, %rdi                                          @0xab9f2
 *   callq OZChannelInfo::~OZChannelInfo()                     @0xab9f5
 *   movq  %rbx, %rdi                                          @0xab9fa
 *   addq  $0x8, %rsp / popq %rbx / popq %rbp                  @0xab9fd..0xaba02
 *   jmp   operator delete(void*) [stub 0xace04]               @0xaba03   (tail-call)
 *
 * NOTE: the D0 slot is the "deleting destructor" — same body as D1 plus a final
 * `operator delete(this)`.  In JS/TS there's no explicit `delete` operator on
 * arbitrary objects; GC handles it.  We still model the call as a distinguished
 * stub so vtable-slot dispatch stays faithful.
 */
export function OZChannelPercentInfo__dtor_D0(this_: OZChannelPercentInfoLayout): void {
  // @0xab9ed — destroy secondary base PCSingleton at (this + 0x50).
  PCSingleton__dtor(this_.singleton);
  // @0xab9f5 — destroy primary base OZChannelInfo.
  OZChannelInfo__dtor(this_.channelInfo);
  // @0xaba03 — tail-call operator delete(this).  Frontier stub (JS has no direct equivalent).
  operator_delete(this_);
}

// ---------------------------------------------------------------------------
// Frontier stubs — every callee we could not yet decode raises loudly at
// runtime (per PORTING_SPEC Rule 3).  Each stub cites its own address.
// ---------------------------------------------------------------------------

/** OZChannelInfo::OZChannelInfo(double,double,double,double,double,char const*)
 *  Callee of OZChannelPercentInfo ctor @0xab97e.  Not yet decoded — throws. */
function OZChannelInfo__ctor(
  _sub: OZChannelInfoSub,
  _default: number, _step: number, _min: number, _precision: number, _max: number, _suffix: string,
): void {
  throw new Error(
    "OZChannelInfo::OZChannelInfo(double,double,double,double,double,char const*) " +
    "@ProChannel __ZN13OZChannelInfoC2EdddddPKc (called from OZChannelPercentInfo ctor @0xab97e) not yet transcribed"
  );
}

/** OZChannelInfo::~OZChannelInfo()
 *  Callee of D1 dtor @0xab9db (tail-jmp) and D0 dtor @0xab9f5 and
 *  the ctor cleanup landing pad @0xab9b2.  Not yet decoded — throws. */
function OZChannelInfo__dtor(_sub: OZChannelInfoSub): void {
  throw new Error(
    "OZChannelInfo::~OZChannelInfo() @ProChannel __ZN13OZChannelInfoD2Ev " +
    "(called from OZChannelPercentInfo D1@0xab9db / D0@0xab9f5 / ctor-landing@0xab9b2) not yet transcribed"
  );
}

/** PCSingleton::PCSingleton(unsigned int)  — imported from ProCore.
 *  Callee of OZChannelPercentInfo ctor @0xab98c (stub @0xacb46).  Not decoded — throws. */
function PCSingleton__ctor(_sub: PCSingletonSub, _seed: number): void {
  throw new Error(
    "PCSingleton::PCSingleton(unsigned int) @ProCore (imported; ProChannel stub @0xacb46, " +
    "called from OZChannelPercentInfo ctor @0xab98c) not yet transcribed"
  );
}

/** PCSingleton::~PCSingleton()  — imported from ProCore.
 *  Callee of D1 dtor @0xab9cd and D0 dtor @0xab9ed (stub @0xacb4c).  Not decoded — throws. */
function PCSingleton__dtor(_sub: PCSingletonSub): void {
  throw new Error(
    "PCSingleton::~PCSingleton() @ProCore (imported; ProChannel stub @0xacb4c, " +
    "called from OZChannelPercentInfo D1@0xab9cd / D0@0xab9ed) not yet transcribed"
  );
}

/** operator delete(void*)  — imported.
 *  Tail-called from D0 dtor @0xaba03 (stub @0xace04). */
function operator_delete(_this: OZChannelPercentInfoLayout): void {
  throw new Error(
    "operator delete(void*) @__ZdlPv (imported; ProChannel stub @0xace04, " +
    "tail-called from OZChannelPercentInfo D0 @0xaba03) not yet transcribed"
  );
}
