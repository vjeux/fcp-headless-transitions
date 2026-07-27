/**
 * OZChannelDecibelInfo — ProChannel.framework  (x86_64 disasm-faithful port)
 *
 * FCP class describing the "decibel" flavor of a channel: display suffix "dB",
 * default value 0.0, args (0.0, 4.0, 1.0, 0.1, 1.0) followed by tag "dB",
 * plus an embedded PCSingleton with construction seed 0x64 (100).
 *
 * Same structural shape as OZChannelPercentInfo — two polymorphic subobjects:
 *   - primary base    OZChannelInfo   at offset +0x00
 *   - secondary base  PCSingleton     at offset +0x50
 * The ctor sets the primary vptr to `__ZTV20OZChannelDecibelInfo + 0x10` and
 * the secondary vptr to `__ZTV20OZChannelDecibelInfo + 0x30` — the two vtable
 * slices that surround this class's own overrides.
 *
 * Methods transcribed:
 *   - OZChannelDecibelInfo::OZChannelDecibelInfo() @0x105c2  (C2 base ctor)
 *   - OZChannelDecibelInfo::~OZChannelDecibelInfo() @0x10632 (D1 complete non-deleting dtor)
 *   - OZChannelDecibelInfo::~OZChannelDecibelInfo() @0x10652 (D0 deleting dtor)
 *
 * Frontier (not decoded here — throw when reached):
 *   - OZChannelInfo::OZChannelInfo(double,double,double,double,double,char const*) @__ZN13OZChannelInfoC2EdddddPKc
 *   - OZChannelInfo::~OZChannelInfo() @__ZN13OZChannelInfoD2Ev
 *   - PCSingleton::PCSingleton(unsigned int) (ProCore, undefined-in-ProChannel; imported symbol stub @0xacb46)
 *   - PCSingleton::~PCSingleton()           (ProCore, undefined-in-ProChannel; imported symbol stub @0xacb4c)
 *   - operator delete(void*)                (imported symbol stub @0xace04)
 *   - _Unwind_Resume                        (imported symbol stub @0xacaf2)
 *
 * Constants (all read from the ProChannel x86_64 binary at the cited RIP-relative addrs):
 *   tag      "dB"  @literal pool 0xbc456  (loaded via  leaq 0xabe83(%rip),%rsi @0x105cc)
 *   xmm1 arg 4.0   (double @0xaf598)  loaded via  movsd 0x9efbd(%rip),xmm1 @0x105d3
 *   xmm3 arg 0.1   (double @0xaf510)  loaded via  movsd 0x9ef2d(%rip),xmm3 @0x105db
 *   xmm2 arg 1.0   (double @0xaf528)  loaded via  movsd 0x9ef3d(%rip),xmm2 @0x105e3
 *   xmm0 arg 0.0   @xorps xmm0,xmm0                                        @0x105eb
 *   xmm4 arg 1.0   @movaps xmm2,xmm4 (copy of xmm2)                         @0x105ee
 *   PCSingleton seed 0x64  @imm  movl $0x64,%esi @0x105fa
 *   vtable         @__ZTV20OZChannelDecibelInfo (x86_64 base @0xd0458; leaq @0x10604)
 *     primary   subobject vptr = vtable + 0x10  = 0xd0468  (@0x1060b, movq %rax,(%rbx))
 *     secondary subobject vptr = vtable + 0x30  = 0xd0488  (@0x10615, movq %rax,0x50(%rbx))
 *
 * NOTE on argument ordering: the OZChannelInfo(double,double,double,double,
 * double,char const*) ctor is not yet decoded, so we do NOT name its 5 double
 * parameters semantically here (min/max/step/etc.).  We preserve the exact
 * SysV-AMD64 register-arg order xmm0..xmm4 as arg1..arg5 — a faithful
 * transcription of what the machine passes on the wire.
 */

/** Opaque handle for the not-yet-transcribed OZChannelInfo base subobject. */
export interface OZChannelInfoSub {
  /** vptr — set to `&OZChannelDecibelInfo::vtable + 0x10` by our ctor. */
  vptr: "OZChannelDecibelInfo::vtable+0x10";
  /** ctor args, preserved in xmm0..xmm4 order.  Actual field offsets within
   *  OZChannelInfo are unknown until OZChannelInfo is decoded. */
  arg1_xmm0: number;    // 0.0            (xorps)
  arg2_xmm1: number;    // 4.0            (double @0xaf598)
  arg3_xmm2: number;    // 1.0            (double @0xaf528)
  arg4_xmm3: number;    // 0.1            (double @0xaf510)
  arg5_xmm4: number;    // 1.0            (movaps xmm2,xmm4 — copy of xmm2)
  arg6_tag: string;     // "dB"           (@0xbc456)
}

/** Opaque handle for the not-yet-transcribed PCSingleton base subobject. */
export interface PCSingletonSub {
  /** vptr — set to `&OZChannelDecibelInfo::vtable + 0x30` by our ctor. */
  vptr: "OZChannelDecibelInfo::vtable+0x30";
  /** ctor u32 seed passed at +0x50 — 0x64 (100). */
  seed: number;
}

/**
 * OZChannelDecibelInfo layout (recovered from ctor @0x105c2 + dtors @0x10632/0x10652):
 *   offset 0x00 :  OZChannelInfo   subobject (primary base)   — vptr slice = vtable+0x10
 *   offset 0x50 :  PCSingleton     subobject (secondary base) — vptr slice = vtable+0x30
 * Total sizeof(OZChannelDecibelInfo) = 0x50 + sizeof(PCSingleton). sizeof(PCSingleton)
 * lives inside ProCore and is out of scope for this file.
 */
export interface OZChannelDecibelInfoLayout {
  /** +0x00 */ channelInfo: OZChannelInfoSub;
  /** +0x50 */ singleton: PCSingletonSub;
}

/**
 * OZChannelDecibelInfo::OZChannelDecibelInfo()  @ProChannel 0x105c2  (C2 base ctor)
 *
 * Disasm mirror (x86_64, line-for-line):
 *   pushq %rbp / movq %rsp,%rbp / pushq %r14 / pushq %rbx      @0x105c2..0x105c8
 *   movq  %rdi, %rbx                                            @0x105c9      (rbx = this)
 *   leaq  0xabe83(%rip), %rsi   ## "dB"                         @0x105cc      (arg6 = "dB"  @0xbc456)
 *   movsd 0x9efbd(%rip),  %xmm1 ## 4.0                          @0x105d3      (arg2 = 4.0    @0xaf598)
 *   movsd 0x9ef2d(%rip),  %xmm3 ## 0.1                          @0x105db      (arg4 = 0.1    @0xaf510)
 *   movsd 0x9ef3d(%rip),  %xmm2 ## 1.0                          @0x105e3      (arg3 = 1.0    @0xaf528)
 *   xorps %xmm0, %xmm0                                          @0x105eb      (arg1 = 0.0)
 *   movaps %xmm2, %xmm4                                         @0x105ee      (arg5 = xmm2 = 1.0)
 *   callq OZChannelInfo::OZChannelInfo(d,d,d,d,d,char const*)   @0x105f1
 *   leaq  0x50(%rbx), %rdi                                      @0x105f6      (this + 0x50)
 *   movl  $0x64, %esi                                           @0x105fa      (u32 seed = 100)
 *   callq PCSingleton::PCSingleton(unsigned int)  [stub 0xacb46]@0x105ff
 *   leaq  __ZTV20OZChannelDecibelInfo+0x10(%rip), %rax          @0x10604      (0xd0468)
 *   movq  %rax, (%rbx)                                          @0x1060b      (primary vptr)
 *   leaq  __ZTV20OZChannelDecibelInfo+0x30(%rip), %rax          @0x1060e      (0xd0488)
 *   movq  %rax, 0x50(%rbx)                                      @0x10615      (secondary vptr)
 *   popq %rbx / popq %r14 / popq %rbp / retq                    @0x10619..0x1061d
 *
 * (The trailing block @0x1061e..0x10631 is the exception-cleanup landing pad:
 *   on throw from PCSingleton::PCSingleton, it calls OZChannelInfo::~OZChannelInfo
 *   @0x10624 then jmps to _Unwind_Resume stub @0xacaf2 via callq @0x1062c.
 *   Mirrored here as try/catch { OZChannelInfo__dtor; throw }.)
 */
export function OZChannelDecibelInfo__ctor(this_: OZChannelDecibelInfoLayout): void {
  // @0x105cc..0x105ee — prepare args in xmm/rsi registers.
  const arg1_xmm0 = 0.0;                     // xorps %xmm0,%xmm0        @0x105eb
  const arg2_xmm1 = 4.0;                     // movsd 0x9efbd(%rip),xmm1 @0x105d3 -> 0xaf598
  const arg3_xmm2 = 1.0;                     // movsd 0x9ef3d(%rip),xmm2 @0x105e3 -> 0xaf528
  const arg4_xmm3 = 0.1;                     // movsd 0x9ef2d(%rip),xmm3 @0x105db -> 0xaf510
  const arg5_xmm4 = arg3_xmm2;               // movaps %xmm2,%xmm4       @0x105ee (copy)
  const arg6_tag = "dB";                     // leaq 0xabe83(%rip),rsi   @0x105cc -> 0xbc456

  // @0x105f1 — construct primary base OZChannelInfo(0.0, 4.0, 1.0, 0.1, 1.0, "dB").
  //            Not decoded yet — throwing stub keeps the frontier loud.
  try {
    OZChannelInfo__ctor(this_.channelInfo, arg1_xmm0, arg2_xmm1, arg3_xmm2, arg4_xmm3, arg5_xmm4, arg6_tag);
  } catch (e) {
    // The primary was mid-construction; nothing above it to unwind — re-throw.
    throw e;
  }

  // @0x105ff — construct secondary base PCSingleton at (this + 0x50) with seed 100.
  try {
    PCSingleton__ctor(this_.singleton, 0x64);
  } catch (e) {
    // @0x1061e..0x1062c landing pad:
    //   callq __ZN13OZChannelInfoD2Ev  @0x10624
    //   callq _Unwind_Resume stub      @0x1062c
    OZChannelInfo__dtor(this_.channelInfo);
    throw e;
  }

  // @0x10604..0x10615 — install vptrs.  Both slices come from the SAME
  // __ZTV20OZChannelDecibelInfo (x86_64 base @0xd0458); the primary sits at
  // +0x10 (0xd0468) and the secondary (PCSingleton) sits at +0x30 (0xd0488).
  this_.channelInfo.vptr = "OZChannelDecibelInfo::vtable+0x10";
  this_.singleton.vptr = "OZChannelDecibelInfo::vtable+0x30";
}

/**
 * OZChannelDecibelInfo::~OZChannelDecibelInfo()  @ProChannel 0x10632  (D1: complete, non-deleting)
 *
 * Disasm mirror:
 *   pushq %rbp / movq %rsp,%rbp / pushq %rbx / pushq %rax    @0x10632..0x10637
 *   movq  %rdi, %rbx                                          @0x10638   (rbx = this)
 *   addq  $0x50, %rdi                                         @0x1063b   (this + 0x50 = PCSingleton subobj)
 *   callq PCSingleton::~PCSingleton() [stub 0xacb4c]          @0x1063f
 *   movq  %rbx, %rdi                                          @0x10644
 *   addq  $0x8, %rsp / popq %rbx / popq %rbp                  @0x10647..0x1064c
 *   jmp   OZChannelInfo::~OZChannelInfo()                     @0x1064d   (tail-call)
 */
export function OZChannelDecibelInfo__dtor_D1(this_: OZChannelDecibelInfoLayout): void {
  // @0x1063b..0x1063f — destroy secondary base PCSingleton at (this + 0x50).
  PCSingleton__dtor(this_.singleton);
  // @0x1064d — tail-call primary base OZChannelInfo destructor.
  OZChannelInfo__dtor(this_.channelInfo);
}

/**
 * OZChannelDecibelInfo::~OZChannelDecibelInfo()  @ProChannel 0x10652  (D0: complete, deleting)
 *
 * Disasm mirror:
 *   pushq %rbp / movq %rsp,%rbp / pushq %rbx / pushq %rax    @0x10652..0x10657
 *   movq  %rdi, %rbx                                          @0x10658
 *   addq  $0x50, %rdi                                         @0x1065b
 *   callq PCSingleton::~PCSingleton() [stub 0xacb4c]          @0x1065f
 *   movq  %rbx, %rdi                                          @0x10664
 *   callq OZChannelInfo::~OZChannelInfo()                     @0x10667
 *   movq  %rbx, %rdi                                          @0x1066c
 *   addq  $0x8, %rsp / popq %rbx / popq %rbp                  @0x1066f..0x10674
 *   jmp   operator delete(void*) [stub 0xace04]               @0x10675   (tail-call)
 *
 * NOTE: the D0 slot is the "deleting destructor" — same body as D1 plus a final
 * `operator delete(this)`.  In JS/TS there is no explicit `delete` operator on
 * arbitrary objects; GC handles it.  We still model the call as a distinguished
 * stub so vtable-slot dispatch stays faithful.
 */
export function OZChannelDecibelInfo__dtor_D0(this_: OZChannelDecibelInfoLayout): void {
  // @0x1065f — destroy secondary base PCSingleton at (this + 0x50).
  PCSingleton__dtor(this_.singleton);
  // @0x10667 — destroy primary base OZChannelInfo.
  OZChannelInfo__dtor(this_.channelInfo);
  // @0x10675 — tail-call operator delete(this).  Frontier stub (JS has no direct equivalent).
  operator_delete(this_);
}

// ---------------------------------------------------------------------------
// Frontier stubs — every callee we could not yet decode raises loudly at
// runtime (per PORTING_SPEC Rule 3).  Each stub cites its own address.
// ---------------------------------------------------------------------------

/** OZChannelInfo::OZChannelInfo(double,double,double,double,double,char const*)
 *  Callee of OZChannelDecibelInfo ctor @0x105f1.  Not yet decoded — throws. */
function OZChannelInfo__ctor(
  _sub: OZChannelInfoSub,
  _a1: number, _a2: number, _a3: number, _a4: number, _a5: number, _tag: string,
): void {
  throw new Error(
    "OZChannelInfo::OZChannelInfo(double,double,double,double,double,char const*) " +
    "@ProChannel __ZN13OZChannelInfoC2EdddddPKc (called from OZChannelDecibelInfo ctor @0x105f1) not yet transcribed"
  );
}

/** OZChannelInfo::~OZChannelInfo()
 *  Callee of D1 dtor @0x1064d (tail-jmp) and D0 dtor @0x10667 and
 *  the ctor cleanup landing pad @0x10624.  Not yet decoded — throws. */
function OZChannelInfo__dtor(_sub: OZChannelInfoSub): void {
  throw new Error(
    "OZChannelInfo::~OZChannelInfo() @ProChannel __ZN13OZChannelInfoD2Ev " +
    "(called from OZChannelDecibelInfo D1@0x1064d / D0@0x10667 / ctor-landing@0x10624) not yet transcribed"
  );
}

/** PCSingleton::PCSingleton(unsigned int)  — imported from ProCore.
 *  Callee of OZChannelDecibelInfo ctor @0x105ff (stub @0xacb46).  Not decoded — throws. */
function PCSingleton__ctor(_sub: PCSingletonSub, _seed: number): void {
  throw new Error(
    "PCSingleton::PCSingleton(unsigned int) @ProCore (imported; ProChannel stub @0xacb46, " +
    "called from OZChannelDecibelInfo ctor @0x105ff) not yet transcribed"
  );
}

/** PCSingleton::~PCSingleton()  — imported from ProCore.
 *  Callee of D1 dtor @0x1063f and D0 dtor @0x1065f (stub @0xacb4c).  Not decoded — throws. */
function PCSingleton__dtor(_sub: PCSingletonSub): void {
  throw new Error(
    "PCSingleton::~PCSingleton() @ProCore (imported; ProChannel stub @0xacb4c, " +
    "called from OZChannelDecibelInfo D1@0x1063f / D0@0x1065f) not yet transcribed"
  );
}

/** operator delete(void*)  — imported.
 *  Tail-called from D0 dtor @0x10675 (stub @0xace04). */
function operator_delete(_this: OZChannelDecibelInfoLayout): void {
  throw new Error(
    "operator delete(void*) @__ZdlPv (imported; ProChannel stub @0xace04, " +
    "tail-called from OZChannelDecibelInfo D0 @0x10675) not yet transcribed"
  );
}
