/**
 * OZChannelAspectRatioInfo — ProChannel.framework  (x86_64 disasm-faithful port)
 *
 * FCP class describing the "aspect ratio" flavor of a channel: a tiny concrete
 * OZChannelInfo subclass that hard-codes the five doubles + unit-suffix it hands
 * to its OZChannelInfo base subobject, and constructs an embedded PCSingleton
 * at +0x50. It has no methods of its own beyond the ctor and the two dtors —
 * everything else is inherited from OZChannelInfo.
 *
 * The C++ layout has TWO polymorphic subobjects:
 *   - primary base    OZChannelInfo   at offset +0x00  (vptr = vtable+0x10)
 *   - secondary base  PCSingleton     at offset +0x50  (vptr = vtable+0x30)
 * The ctor sets the primary vptr to `vtable+0x10` and the secondary vptr to
 * `vtable+0x30` — the two vtable slices that surround this class's own overrides
 * (see `vtable for OZChannelAspectRatioInfo` @0xcc880; +0x10 = 0xcc890,
 *  +0x30 = 0xcc8b0, resolved via `resolve.py ProChannel sym`).
 *
 * Methods transcribed (all three requested):
 *   __ZN24OZChannelAspectRatioInfoC2Ev  OZChannelAspectRatioInfo::OZChannelAspectRatioInfo()  @0x5f86 (C2 base ctor)
 *   __ZN24OZChannelAspectRatioInfoD1Ev  OZChannelAspectRatioInfo::~OZChannelAspectRatioInfo() @0x5ffa (D1 complete non-deleting dtor)
 *   __ZN24OZChannelAspectRatioInfoD0Ev  OZChannelAspectRatioInfo::~OZChannelAspectRatioInfo() @0x601a (D0 deleting dtor)
 *
 * Frontier callees (NOT decoded here — any TS invocation of these throws with the
 *  cited address so a future decoder can fill them in without silent drift):
 *   OZChannelInfo::OZChannelInfo(double,double,double,double,double,char const*)
 *                                                     @__ZN13OZChannelInfoC2EdddddPKc  (see callq @0x5fba)
 *   OZChannelInfo::~OZChannelInfo()                   @__ZN13OZChannelInfoD2Ev
 *                                                     (see callq @0x5fed / @0x602f, jmp @0x6015)
 *   PCSingleton::PCSingleton(unsigned int)            imported stub @0xacb46          (callq @0x5fc8)
 *   PCSingleton::~PCSingleton()                       imported stub @0xacb4c          (callq @0x6007 / @0x6027)
 *   operator delete(void*)                            imported stub @0xace04          (jmp @0x603d in D0)
 *   __Unwind_Resume                                   imported stub @0xacaf2          (callq @0x5ff5 in unwind pad)
 *
 * Constants (all read bit-exact from the ProChannel binary at the cited RIP-relative
 *  addresses via `resolve.py ProChannel const <addr>`):
 *   arg1 default  0.0            @xorps xmm0,xmm0                       (@0x5fb7)
 *   arg2 xmm1     3.0     u64 0x4008000000000000  (double @0xaf580)     loaded via movsd 0xa95e1(%rip),%xmm1 @0x5f97
 *   arg3 xmm2     0.0001  u64 0x3f1a36e2eb1c432d  (double @0xaf588)     loaded via movsd 0xa95e1(%rip),%xmm2 @0x5f9f
 *   arg4 xmm3     0.1     u64 0x3fb999999999999a  (double @0xaf510)     loaded via movsd 0xa9561(%rip),%xmm3 @0x5fa7
 *   arg5 xmm4     1.0     u64 0x3ff0000000000000  (double @0xaf528)     loaded via movsd 0xa9571(%rip),%xmm4 @0x5faf
 *   arg6 rsi      ""      (empty C-string literal @0xbc3f8; disasm comment "literal pool for: \"\"") loaded via leaq 0xb6461(%rip),%rsi @0x5f90
 *   PCSingleton seed 0x64  @imm  movl $0x64,%esi                        (@0x5fc3)
 *   primary   vptr = &__ZTV24OZChannelAspectRatioInfo + 0x10 = 0xcc890  (leaq 0xc68bc(%rip),%rax @0x5fcd; mov %rax,(%rbx) @0x5fd4)
 *   secondary vptr = &__ZTV24OZChannelAspectRatioInfo + 0x30 = 0xcc8b0  (leaq 0xc68d2(%rip),%rax @0x5fd7; mov %rax,0x50(%rbx) @0x5fde)
 *
 * DO-NOT-INVENT NOTE ON FIELD SEMANTICS
 * -------------------------------------
 * OZChannelInfo's parameter names (min/max/step/precision/scale/etc.) are not yet
 * decoded. Sibling classes in this port disagree on the mapping:
 *   - OZChannelAngleInfo names them  (min, max, stepCoarse, stepFine, displayScale, unit)
 *   - OZChannelPercentInfo names them (default, step, min, precision, max, suffix)
 * Both are inferences from magnitudes and cannot both be right for the same base ctor.
 * To stay faithful, we name our args by *position* (arg1..arg6) and leave semantic
 * naming for when OZChannelInfo itself is transcribed.
 */

/** Empty C-string literal at @0xbc3f8 — the sixth arg (rsi) to the base ctor. */
export const OZ_CHANNEL_ASPECT_RATIO_INFO_UNIT_SUFFIX = "";           // @0xbc3f8

/** Doubles fed to the OZChannelInfo base ctor, addresses match `resolve.py const`. */
export const OZ_CHANNEL_ASPECT_RATIO_INFO_ARG1_DEFAULT = 0.0;         // @xorps xmm0,xmm0 @0x5fb7
export const OZ_CHANNEL_ASPECT_RATIO_INFO_ARG2        = 3.0;          // @0xaf580  u64 0x4008000000000000
export const OZ_CHANNEL_ASPECT_RATIO_INFO_ARG3        = 0.0001;       // @0xaf588  u64 0x3f1a36e2eb1c432d
export const OZ_CHANNEL_ASPECT_RATIO_INFO_ARG4        = 0.1;          // @0xaf510  u64 0x3fb999999999999a
export const OZ_CHANNEL_ASPECT_RATIO_INFO_ARG5        = 1.0;          // @0xaf528  u64 0x3ff0000000000000

/** PCSingleton::PCSingleton(unsigned int) seed — `movl $0x64,%esi` @0x5fc3. */
export const OZ_CHANNEL_ASPECT_RATIO_INFO_PC_SINGLETON_SEED = 0x64;   // 100

/** Opaque handle for the not-yet-transcribed OZChannelInfo base subobject. */
export interface OZChannelInfoSub {
  /** vptr — set to `&__ZTV24OZChannelAspectRatioInfo + 0x10` (= 0xcc890) by our ctor @0x5fd4. */
  vptr: "OZChannelAspectRatioInfo::vtable+0x10";
  /** ctor args in declaration order — field offsets within OZChannelInfo unknown until it's decoded. */
  arg0_default: number;   // xmm0 = 0.0                 @0x5fb7
  arg1_xmm1:    number;   // xmm1 = 3.0     (@0xaf580)  @0x5f97
  arg2_xmm2:    number;   // xmm2 = 0.0001  (@0xaf588)  @0x5f9f
  arg3_xmm3:    number;   // xmm3 = 0.1     (@0xaf510)  @0x5fa7
  arg4_xmm4:    number;   // xmm4 = 1.0     (@0xaf528)  @0x5faf
  arg5_suffix:  string;   // rsi  = ""      (@0xbc3f8)  @0x5f90
}

/** Opaque handle for the not-yet-transcribed PCSingleton base subobject. */
export interface PCSingletonSub {
  /** vptr — set to `&__ZTV24OZChannelAspectRatioInfo + 0x30` (= 0xcc8b0) by our ctor @0x5fde. */
  vptr: "OZChannelAspectRatioInfo::vtable+0x30";
  /** ctor u32 seed passed at +0x50 — 0x64 (100). @0x5fc3 */
  seed: number;
}

/**
 * OZChannelAspectRatioInfo layout (recovered from ctor @0x5f86 + dtors @0x5ffa/0x601a):
 *   offset 0x00 :  OZChannelInfo   subobject (primary base)   — vptr slice = vtable+0x10
 *   offset 0x50 :  PCSingleton     subobject (secondary base) — vptr slice = vtable+0x30
 * Total sizeof(OZChannelAspectRatioInfo) = 0x50 + sizeof(PCSingleton). sizeof(PCSingleton)
 * lives inside ProCore and is out of scope for this file.
 */
export interface OZChannelAspectRatioInfoLayout {
  /** +0x00 */ channelInfo: OZChannelInfoSub;
  /** +0x50 */ singleton:   PCSingletonSub;
}

// ─── frontier stubs (throw on use — see PORTING_SPEC.md rule 3) ──────────────

/**
 * OZChannelInfo::OZChannelInfo(double,double,double,double,double,char const*)
 * @__ZN13OZChannelInfoC2EdddddPKc  @ProChannel  (callq @0x5fba)
 *
 * Not yet transcribed. Throws so that any accidental live use surfaces a loud
 * gap instead of silently corrupting downstream state.
 */
function OZChannelInfo__C2(
  _this: unknown,
  _arg0: number,
  _arg1: number,
  _arg2: number,
  _arg3: number,
  _arg4: number,
  _arg5: string,
): void {
  throw new Error(
    "OZChannelInfo::OZChannelInfo(d,d,d,d,d,PKc) @ProChannel @__ZN13OZChannelInfoC2EdddddPKc (called from @0x5fba) not yet transcribed",
  );
}

/**
 * OZChannelInfo::~OZChannelInfo()  @__ZN13OZChannelInfoD2Ev  @ProChannel
 * (see callq @0x5fed in ctor unwind pad, callq @0x602f in D0, jmp @0x6015 in D1).
 * Not yet transcribed.
 */
function OZChannelInfo__D2(_this: unknown): void {
  throw new Error(
    "OZChannelInfo::~OZChannelInfo() @ProChannel @__ZN13OZChannelInfoD2Ev not yet transcribed",
  );
}

/**
 * PCSingleton::PCSingleton(unsigned int)  imported stub @0xacb46  @ProChannel
 * (callq @0x5fc8 in ctor). Real symbol lives in ProCore. Not yet transcribed.
 */
function PCSingleton__C2(_this: unknown, _seed: number): void {
  throw new Error(
    "PCSingleton::PCSingleton(unsigned int) @ProCore (stub @ProChannel 0xacb46) not yet transcribed",
  );
}

/**
 * PCSingleton::~PCSingleton()  imported stub @0xacb4c  @ProChannel
 * (callq @0x6007 in D1, @0x6027 in D0). Real symbol lives in ProCore. Not yet transcribed.
 */
function PCSingleton__D2(_this: unknown): void {
  throw new Error(
    "PCSingleton::~PCSingleton() @ProCore (stub @ProChannel 0xacb4c) not yet transcribed",
  );
}

// ─── OZChannelAspectRatioInfo — the three methods ────────────────────────────

/**
 * OZChannelAspectRatioInfo::OZChannelAspectRatioInfo()  @ProChannel 0x5f86  (C2 base ctor)
 *
 * Disasm mirror (line-for-line, __ZN24OZChannelAspectRatioInfoC2Ev):
 *   pushq %rbp / movq %rsp,%rbp / pushq %r14 / pushq %rbx      @0x5f86..0x5f8c
 *   movq  %rdi, %rbx                                            @0x5f8d       (rbx = this)
 *   leaq  0xb6461(%rip), %rsi   ## ""                           @0x5f90       (arg6 = ""     @0xbc3f8)
 *   movsd 0xa95e1(%rip), %xmm1  ## 3.0                          @0x5f97       (arg2 = 3.0    @0xaf580)
 *   movsd 0xa95e1(%rip), %xmm2  ## 0.0001                       @0x5f9f       (arg3 = 0.0001 @0xaf588)
 *   movsd 0xa9561(%rip), %xmm3  ## 0.1                          @0x5fa7       (arg4 = 0.1    @0xaf510)
 *   movsd 0xa9571(%rip), %xmm4  ## 1.0                          @0x5faf       (arg5 = 1.0    @0xaf528)
 *   xorps %xmm0, %xmm0                                          @0x5fb7       (arg1 = 0.0)
 *   callq OZChannelInfo::OZChannelInfo(d,d,d,d,d,char const*)   @0x5fba
 *   leaq  0x50(%rbx), %rdi                                      @0x5fbf       (this + 0x50)
 *   movl  $0x64, %esi                                           @0x5fc3       (u32 = 100)
 *   callq PCSingleton::PCSingleton(unsigned int) [stub @0xacb46]@0x5fc8
 *   leaq  0xc68bc(%rip), %rax                                   @0x5fcd       (@0xcc890 = vtable+0x10)
 *   movq  %rax, (%rbx)                                          @0x5fd4       (primary vptr install)
 *   leaq  0xc68d2(%rip), %rax                                   @0x5fd7       (@0xcc8b0 = vtable+0x30)
 *   movq  %rax, 0x50(%rbx)                                      @0x5fde       (secondary vptr install)
 *   popq %rbx / popq %r14 / popq %rbp / retq                    @0x5fe2..0x5fe6
 *
 * Trailing block @0x5fe7..0x5ff5 is the exception-cleanup landing pad: on throw
 * from PCSingleton::PCSingleton, it saves the exception (movq %rax,%r14 @0x5fe7),
 * calls OZChannelInfo::~OZChannelInfo (@0x5fed) to unwind the already-constructed
 * base subobject, then re-raises via __Unwind_Resume stub (@0x5ff5). Mirrored
 * here as a try/finally that re-throws.
 *
 * All Math.fround() wrappers are OMITTED because every ctor arg is a bit-exact
 * `movsd` double load (not a float-widened source) — PORTING_SPEC rule 4 only
 * requires fround for `cvtss2sd`/single-precision math.
 */
export function OZChannelAspectRatioInfo__ctor(
  this_: OZChannelAspectRatioInfoLayout,
): void {
  // @0x5fba — base ctor with the five doubles + "" (positional args, not semantic).
  try {
    OZChannelInfo__C2(
      this_,
      OZ_CHANNEL_ASPECT_RATIO_INFO_ARG1_DEFAULT,  // xmm0 (0.0)
      OZ_CHANNEL_ASPECT_RATIO_INFO_ARG2,          // xmm1 (3.0)
      OZ_CHANNEL_ASPECT_RATIO_INFO_ARG3,          // xmm2 (0.0001)
      OZ_CHANNEL_ASPECT_RATIO_INFO_ARG4,          // xmm3 (0.1)
      OZ_CHANNEL_ASPECT_RATIO_INFO_ARG5,          // xmm4 (1.0)
      OZ_CHANNEL_ASPECT_RATIO_INFO_UNIT_SUFFIX,   // rsi  ("")
    );
    // The base ctor has now installed the OZChannelInfo subobject at +0x00.
    // For the TS shape we record what the disasm proves:
    this_.channelInfo = {
      vptr: "OZChannelAspectRatioInfo::vtable+0x10",
      arg0_default: OZ_CHANNEL_ASPECT_RATIO_INFO_ARG1_DEFAULT,
      arg1_xmm1:    OZ_CHANNEL_ASPECT_RATIO_INFO_ARG2,
      arg2_xmm2:    OZ_CHANNEL_ASPECT_RATIO_INFO_ARG3,
      arg3_xmm3:    OZ_CHANNEL_ASPECT_RATIO_INFO_ARG4,
      arg4_xmm4:    OZ_CHANNEL_ASPECT_RATIO_INFO_ARG5,
      arg5_suffix:  OZ_CHANNEL_ASPECT_RATIO_INFO_UNIT_SUFFIX,
    };

    // @0x5fc8 — PCSingleton::PCSingleton(unsigned int) on (this + 0x50) with seed 0x64.
    PCSingleton__C2(this_, OZ_CHANNEL_ASPECT_RATIO_INFO_PC_SINGLETON_SEED);
    this_.singleton = {
      vptr: "OZChannelAspectRatioInfo::vtable+0x30",
      seed: OZ_CHANNEL_ASPECT_RATIO_INFO_PC_SINGLETON_SEED,
    };
  } catch (e) {
    // @0x5fe7..0x5ff5 unwind pad: destroy the OZChannelInfo subobject and re-raise.
    OZChannelInfo__D2(this_);
    throw e;
  }

  // @0x5fcd..@0x5fde — install both vptrs. In TS these have no runtime observable
  // effect (JS method resolution replaces C++ vtable dispatch), but recording the
  // exact addresses keeps the layout honest for future decoders.
  //   this_.vptr[+0x00] = &vtable + 0x10 = 0xcc890
  //   this_.vptr[+0x50] = &vtable + 0x30 = 0xcc8b0
}

/**
 * OZChannelAspectRatioInfo::~OZChannelAspectRatioInfo() (base, __ZN24OZChannelAspectRatioInfoD1Ev)
 * @ProChannel 0x5ffa  — complete non-deleting dtor.
 *
 * Disasm mirror:
 *   pushq %rbp / movq %rsp,%rbp / pushq %rbx / pushq %rax     @0x5ffa..0x5fff
 *   movq  %rdi, %rbx                                          @0x6000        (rbx = this)
 *   addq  $0x50, %rdi                                         @0x6003        (rdi = this + 0x50)
 *   callq PCSingleton::~PCSingleton()  [stub @0xacb4c]        @0x6007
 *   movq  %rbx, %rdi                                          @0x600c        (rdi = this)
 *   addq  $0x8, %rsp / popq %rbx / popq %rbp                  @0x600f..0x6014
 *   jmp   OZChannelInfo::~OZChannelInfo()                     @0x6015        (tail-call base dtor)
 *
 * Sequence: destroy PCSingleton subobject at +0x50, then tail-call the
 * OZChannelInfo base dtor at +0x00. Nothing else. TS mirror below.
 */
export function OZChannelAspectRatioInfo__D1(
  this_: OZChannelAspectRatioInfoLayout,
): void {
  // @0x6007
  PCSingleton__D2(this_);
  // @0x6015 (tail-call)
  OZChannelInfo__D2(this_);
}

/**
 * OZChannelAspectRatioInfo::~OZChannelAspectRatioInfo() (deleting, __ZN24OZChannelAspectRatioInfoD0Ev)
 * @ProChannel 0x601a  — deleting dtor: destroy then free.
 *
 * Disasm mirror:
 *   pushq %rbp / movq %rsp,%rbp / pushq %rbx / pushq %rax     @0x601a..0x601f
 *   movq  %rdi, %rbx                                          @0x6020        (rbx = this)
 *   addq  $0x50, %rdi                                         @0x6023        (rdi = this + 0x50)
 *   callq PCSingleton::~PCSingleton()  [stub @0xacb4c]        @0x6027
 *   movq  %rbx, %rdi                                          @0x602c        (rdi = this)
 *   callq OZChannelInfo::~OZChannelInfo()                     @0x602f        (NOT a tail-call: still need to free after)
 *   movq  %rbx, %rdi                                          @0x6034
 *   addq  $0x8, %rsp / popq %rbx / popq %rbp                  @0x6037..0x603c
 *   jmp   operator delete(void*)  [stub @0xace04]             @0x603d
 *
 * Sequence: destroy PCSingleton subobject, destroy OZChannelInfo subobject,
 * then tail-call `operator delete(this)`. In TS the operator-delete step is a
 * no-op (JS GC reclaims the object); we still expose D0 separately so vtable
 * dispatch through slot 0x08 maps 1:1.
 */
export function OZChannelAspectRatioInfo__D0(
  this_: OZChannelAspectRatioInfoLayout,
): void {
  // @0x6027
  PCSingleton__D2(this_);
  // @0x602f — NOTE: emitted as a `callq`, not a `jmp`, because the deleting
  // dtor still needs to reach `operator delete` after the base dtor returns.
  OZChannelInfo__D2(this_);
  // @0x603d — jmp operator delete(void*) [stub @0xace04].
  // JS GC replaces C++ operator delete; no runtime action required here.
}
