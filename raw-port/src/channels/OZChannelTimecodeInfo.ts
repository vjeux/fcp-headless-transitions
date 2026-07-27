/**
 * OZChannelTimecodeInfo — ProChannel.framework  (x86_64 disasm-faithful port)
 *
 * FCP class describing the "timecode" flavor of a channel: display suffix "" (empty),
 * default value 0.0, step 100.0, min 1.0, precision 0.01, max 1.0,
 * plus an embedded PCSingleton subobject with construction seed 0x64 (100).
 *
 * The C++ layout has TWO polymorphic subobjects:
 *   - primary base    OZChannelInfo   at offset +0x00
 *   - secondary base  PCSingleton     at offset +0x50
 * The ctor sets the primary vptr to `vtable+0x10` and the secondary vptr to
 * `vtable+0x30` — the two vtable slices that surround this class's own overrides.
 *
 * Methods transcribed (from brief.py ProChannel OZChannelTimecodeInfo):
 *   - OZChannelTimecodeInfo::OZChannelTimecodeInfo() @0x115a2  (C2 base ctor)
 *   - OZChannelTimecodeInfo::~OZChannelTimecodeInfo() @0x11612 (D1 complete non-deleting dtor)
 *   - OZChannelTimecodeInfo::~OZChannelTimecodeInfo() @0x11632 (D0 deleting dtor)
 *
 * Frontier (not decoded here — throw when reached):
 *   - OZChannelInfo::OZChannelInfo(double,double,double,double,double,char const*)
 *       @ProChannel __ZN13OZChannelInfoC2EdddddPKc   (direct callq @0x115d1)
 *   - OZChannelInfo::~OZChannelInfo()
 *       @ProChannel __ZN13OZChannelInfoD2Ev          (direct callq/jmp @0x11604/0x1162d/0x11647)
 *   - PCSingleton::PCSingleton(unsigned int)
 *       @ProCore (undefined-in-ProChannel; imported symbol stub @0xacb46, called @0x115df)
 *   - PCSingleton::~PCSingleton()
 *       @ProCore (undefined-in-ProChannel; imported symbol stub @0xacb4c, called @0x1161f and @0x1163f)
 *   - operator delete(void*)
 *       (imported symbol stub @0xace04, tail-called @0x11655 from D0)
 *   - _Unwind_Resume
 *       (imported symbol stub @0xacaf2, called from ctor landing pad @0x1160c)
 *
 * Constants (all read from the ProChannel binary at the cited RIP-relative addresses):
 *   suffix   ""     @literal pool 0xbc3f8  (loaded via  leaq 0xaae45(%rip),%rsi @0x115ac)
 *   default  0.0            @xorps xmm0,xmm0  (@0x115cb)
 *   step    100.0   (double @0xaf518)  loaded via movsd 0x9df5d(%rip),xmm1 @0x115b3
 *   min       1.0   (double @0xaf528)  loaded via movsd 0x9df5d(%rip),xmm2 @0x115c3
 *   precision 0.01  (double @0xaf520)  loaded via movsd 0x9df5d(%rip),xmm3 @0x115bb
 *   max       1.0   (movaps %xmm2,%xmm4 @0x115ce — same double as min, @0xaf528)
 *   PCSingleton seed 0x64  @imm  movl $0x64,%esi @0x115da
 *   vtable          @__ZTV21OZChannelTimecodeInfo
 *     primary   subobject vptr = vtable + 0x10  (@0x115e4, movq %rax,(%rbx))
 *     secondary subobject vptr = vtable + 0x30  (@0x115ee, movq %rax,0x50(%rbx))
 *
 * Byte-widths:  every field loaded here is IEEE-754 binary64 (movsd).  The ctor
 * itself does no arithmetic, so no Math.fround is required — we just forward the
 * doubles to the (not-yet-decoded) OZChannelInfo base ctor.
 */

/** Opaque handle for the not-yet-transcribed OZChannelInfo base subobject. */
export interface OZChannelInfoSub {
  /** vptr — set to `&OZChannelTimecodeInfo::vtable + 0x10` by our ctor. */
  vptr: "OZChannelTimecodeInfo::vtable+0x10";
  /** ctor args, preserved in declaration order.  Actual field offsets within
   *  OZChannelInfo are unknown until OZChannelInfo is decoded. */
  arg0_default: number;    // xmm0 = 0.0
  arg1_step: number;       // xmm1 = 100.0  (double @0xaf518)
  arg2_min: number;        // xmm2 =   1.0  (double @0xaf528)
  arg3_precision: number;  // xmm3 =  0.01  (double @0xaf520)
  arg4_max: number;        // xmm4 = %xmm2 =  1.0  (double @0xaf528)
  arg5_suffix: string;     // rsi  = ""     (@0xbc3f8)
}

/** Opaque handle for the not-yet-transcribed PCSingleton base subobject. */
export interface PCSingletonSub {
  /** vptr — set to `&OZChannelTimecodeInfo::vtable + 0x30` by our ctor. */
  vptr: "OZChannelTimecodeInfo::vtable+0x30";
  /** ctor u32 seed passed at +0x50 — 0x64 (100). */
  seed: number;
}

/**
 * OZChannelTimecodeInfo layout (recovered from ctor @0x115a2 + dtors @0x11612/0x11632):
 *   offset 0x00 :  OZChannelInfo   subobject (primary base)   — vptr slice = vtable+0x10
 *   offset 0x50 :  PCSingleton     subobject (secondary base) — vptr slice = vtable+0x30
 * Total sizeof(OZChannelTimecodeInfo) = 0x50 + sizeof(PCSingleton). We do not yet know
 * sizeof(PCSingleton) — that's inside ProCore and out of scope for this file.
 */
export interface OZChannelTimecodeInfoLayout {
  /** +0x00 */ channelInfo: OZChannelInfoSub;
  /** +0x50 */ singleton: PCSingletonSub;
}

/**
 * OZChannelTimecodeInfo::OZChannelTimecodeInfo()  @ProChannel 0x115a2  (C2 base ctor)
 *
 * Disasm mirror (line-for-line):
 *   pushq %rbp / movq %rsp,%rbp / pushq %r14 / pushq %rbx      @0x115a2..0x115a8
 *   movq  %rdi, %rbx                                            @0x115a9      (rbx = this)
 *   leaq  0xaae45(%rip), %rsi   ## ""                           @0x115ac      (arg6 = ""    @0xbc3f8)
 *   movsd 0x9df5d(%rip),  %xmm1 ## 100.0                        @0x115b3      (arg2 = 100.0  @0xaf518)
 *   movsd 0x9df5d(%rip),  %xmm3 ## 0.01                         @0x115bb      (arg4 = 0.01   @0xaf520)
 *   movsd 0x9df5d(%rip),  %xmm2 ## 1.0                          @0x115c3      (arg3 = 1.0    @0xaf528)
 *   xorps %xmm0, %xmm0                                          @0x115cb      (arg1 = 0.0)
 *   movaps %xmm2, %xmm4                                         @0x115ce      (arg5 = %xmm2 = 1.0)
 *   callq OZChannelInfo::OZChannelInfo(d,d,d,d,d,char const*)   @0x115d1
 *   leaq  0x50(%rbx), %rdi                                      @0x115d6      (this + 0x50)
 *   movl  $0x64, %esi                                           @0x115da      (u32 = 100)
 *   callq PCSingleton::PCSingleton(unsigned int)  [stub 0xacb46]@0x115df
 *   leaq  __ZTV21OZChannelTimecodeInfo+0x10(%rip), %rax         @0x115e4      (vtable + 0x10 -> primary vptr)
 *   movq  %rax, (%rbx)                                          @0x115eb
 *   leaq  __ZTV21OZChannelTimecodeInfo+0x30(%rip), %rax         @0x115ee      (vtable + 0x30 -> secondary vptr)
 *   movq  %rax, 0x50(%rbx)                                      @0x115f5
 *   popq %rbx / popq %r14 / popq %rbp / retq                    @0x115f9..0x115fd
 *
 * (The trailing block @0x115fe..0x11611 is the exception-cleanup landing pad:
 *   on throw from PCSingleton::PCSingleton, it calls OZChannelInfo::~OZChannelInfo
 *   then calls _Unwind_Resume stub @0xacaf2. Mirrored here as `try/catch{unwind;throw}`.)
 *
 * NOTE: the two vtable pointers are written using TWO separate `leaq` instructions
 * with distinct RIP displacements (0xbf2ad and 0xbf2c3), unlike Percent's ctor which
 * uses one `leaq` + two `addq`s.  Same net effect — both slices come from the SAME
 * __ZTV21OZChannelTimecodeInfo object, at +0x10 and +0x30 (verified via resolve.py:
 *   0xd0898 = vtable for OZChannelTimecodeInfo +0x10,
 *   0xd08b8 = vtable for OZChannelTimecodeInfo +0x30).
 */
export function OZChannelTimecodeInfo__ctor(this_: OZChannelTimecodeInfoLayout): void {
  // @0x115ac..0x115ce — prepare args in xmm/rsi registers.
  const arg1_default = 0.0;                  // xorps %xmm0,%xmm0        @0x115cb
  const arg2_step = 100.0;                   // movsd 0x9df5d(%rip),xmm1 @0x115b3 -> 0xaf518
  const arg3_min = 1.0;                      // movsd 0x9df5d(%rip),xmm2 @0x115c3 -> 0xaf528
  const arg4_precision = 0.01;               // movsd 0x9df5d(%rip),xmm3 @0x115bb -> 0xaf520
  const arg5_max = arg3_min;                 // movaps %xmm2, %xmm4      @0x115ce (xmm4 <- xmm2 = 1.0)
  const arg6_suffix = "";                    // leaq  0xaae45(%rip),rsi  @0x115ac -> 0xbc3f8

  // @0x115d1 — construct primary base OZChannelInfo(0.0, 100.0, 1.0, 0.01, 1.0, "").
  //           Not decoded yet — throw a citing stub if actually invoked at runtime.
  try {
    OZChannelInfo__ctor(this_.channelInfo, arg1_default, arg2_step, arg3_min, arg4_precision, arg5_max, arg6_suffix);
  } catch (e) {
    // @0x115fe landing pad, first phase — OZChannelInfo was still mid-construction,
    // nothing to unwind above; re-throw to caller.
    throw e;
  }

  // @0x115df — construct secondary base PCSingleton at (this + 0x50) with seed 100.
  try {
    PCSingleton__ctor(this_.singleton, 0x64);
  } catch (e) {
    // @0x115fe landing pad — on throw from PCSingleton ctor, unwind OZChannelInfo:
    //   movq  %rax, %r14                    @0x115fe
    //   movq  %rbx, %rdi                    @0x11601
    //   callq __ZN13OZChannelInfoD2Ev       @0x11604
    //   movq  %r14, %rdi                    @0x11609
    //   callq _Unwind_Resume stub           @0x1160c
    OZChannelInfo__dtor(this_.channelInfo);
    throw e;
  }

  // @0x115e4..0x115f5 — install vptrs.  Both slices come from the SAME
  // OZChannelTimecodeInfo vtable object; the primary sits at +0x10 and the
  // secondary (PCSingleton slice) sits at +0x30 relative to
  // __ZTV21OZChannelTimecodeInfo (verified via resolve.py ProChannel sym).
  this_.channelInfo.vptr = "OZChannelTimecodeInfo::vtable+0x10";
  this_.singleton.vptr = "OZChannelTimecodeInfo::vtable+0x30";
}

/**
 * OZChannelTimecodeInfo::~OZChannelTimecodeInfo()  @ProChannel 0x11612  (D1: complete, non-deleting)
 *
 * Disasm mirror:
 *   pushq %rbp / movq %rsp,%rbp / pushq %rbx / pushq %rax    @0x11612..0x11617
 *   movq  %rdi, %rbx                                          @0x11618   (rbx = this)
 *   addq  $0x50, %rdi                                         @0x1161b   (this + 0x50 = PCSingleton subobj)
 *   callq PCSingleton::~PCSingleton() [stub 0xacb4c]          @0x1161f
 *   movq  %rbx, %rdi                                          @0x11624
 *   addq  $0x8, %rsp / popq %rbx / popq %rbp                  @0x11627..0x1162c
 *   jmp   OZChannelInfo::~OZChannelInfo()                     @0x1162d   (tail-call)
 */
export function OZChannelTimecodeInfo__dtor_D1(this_: OZChannelTimecodeInfoLayout): void {
  // @0x1161b..0x1161f — destroy secondary base PCSingleton at (this + 0x50).
  PCSingleton__dtor(this_.singleton);
  // @0x1162d — tail-call primary base OZChannelInfo destructor.
  OZChannelInfo__dtor(this_.channelInfo);
}

/**
 * OZChannelTimecodeInfo::~OZChannelTimecodeInfo()  @ProChannel 0x11632  (D0: complete, deleting)
 *
 * Disasm mirror:
 *   pushq %rbp / movq %rsp,%rbp / pushq %rbx / pushq %rax    @0x11632..0x11637
 *   movq  %rdi, %rbx                                          @0x11638
 *   addq  $0x50, %rdi                                         @0x1163b
 *   callq PCSingleton::~PCSingleton() [stub 0xacb4c]          @0x1163f
 *   movq  %rbx, %rdi                                          @0x11644
 *   callq OZChannelInfo::~OZChannelInfo()                     @0x11647
 *   movq  %rbx, %rdi                                          @0x1164c
 *   addq  $0x8, %rsp / popq %rbx / popq %rbp                  @0x1164f..0x11654
 *   jmp   operator delete(void*) [stub 0xace04]               @0x11655   (tail-call)
 *
 * NOTE: the D0 slot is the "deleting destructor" — same body as D1 plus a final
 * `operator delete(this)`.  In JS/TS there's no explicit `delete` operator on
 * arbitrary objects; GC handles it.  We still model the call as a distinguished
 * stub so vtable-slot dispatch stays faithful.
 */
export function OZChannelTimecodeInfo__dtor_D0(this_: OZChannelTimecodeInfoLayout): void {
  // @0x1163f — destroy secondary base PCSingleton at (this + 0x50).
  PCSingleton__dtor(this_.singleton);
  // @0x11647 — destroy primary base OZChannelInfo.
  OZChannelInfo__dtor(this_.channelInfo);
  // @0x11655 — tail-call operator delete(this).  Frontier stub (JS has no direct equivalent).
  operator_delete(this_);
}

// ---------------------------------------------------------------------------
// Frontier stubs — every callee we could not yet decode raises loudly at
// runtime (per PORTING_SPEC Rule 3).  Each stub cites its own address.
// ---------------------------------------------------------------------------

/** OZChannelInfo::OZChannelInfo(double,double,double,double,double,char const*)
 *  Callee of OZChannelTimecodeInfo ctor @0x115d1.  Not yet decoded — throws. */
function OZChannelInfo__ctor(
  _sub: OZChannelInfoSub,
  _default: number, _step: number, _min: number, _precision: number, _max: number, _suffix: string,
): void {
  throw new Error(
    "OZChannelInfo::OZChannelInfo(double,double,double,double,double,char const*) " +
    "@ProChannel __ZN13OZChannelInfoC2EdddddPKc (called from OZChannelTimecodeInfo ctor @0x115d1) not yet transcribed"
  );
}

/** OZChannelInfo::~OZChannelInfo()
 *  Callee of D1 dtor @0x1162d (tail-jmp), D0 dtor @0x11647, and
 *  the ctor cleanup landing pad @0x11604.  Not yet decoded — throws. */
function OZChannelInfo__dtor(_sub: OZChannelInfoSub): void {
  throw new Error(
    "OZChannelInfo::~OZChannelInfo() @ProChannel __ZN13OZChannelInfoD2Ev " +
    "(called from OZChannelTimecodeInfo D1@0x1162d / D0@0x11647 / ctor-landing@0x11604) not yet transcribed"
  );
}

/** PCSingleton::PCSingleton(unsigned int)  — imported from ProCore.
 *  Callee of OZChannelTimecodeInfo ctor @0x115df (stub @0xacb46).  Not decoded — throws. */
function PCSingleton__ctor(_sub: PCSingletonSub, _seed: number): void {
  throw new Error(
    "PCSingleton::PCSingleton(unsigned int) @ProCore (imported; ProChannel stub @0xacb46, " +
    "called from OZChannelTimecodeInfo ctor @0x115df) not yet transcribed"
  );
}

/** PCSingleton::~PCSingleton()  — imported from ProCore.
 *  Callee of D1 dtor @0x1161f and D0 dtor @0x1163f (stub @0xacb4c).  Not decoded — throws. */
function PCSingleton__dtor(_sub: PCSingletonSub): void {
  throw new Error(
    "PCSingleton::~PCSingleton() @ProCore (imported; ProChannel stub @0xacb4c, " +
    "called from OZChannelTimecodeInfo D1@0x1161f / D0@0x1163f) not yet transcribed"
  );
}

/** operator delete(void*)  — imported.
 *  Tail-called from D0 dtor @0x11655 (stub @0xace04). */
function operator_delete(_this: OZChannelTimecodeInfoLayout): void {
  throw new Error(
    "operator delete(void*) @__ZdlPv (imported; ProChannel stub @0xace04, " +
    "tail-called from OZChannelTimecodeInfo D0 @0x11655) not yet transcribed"
  );
}
