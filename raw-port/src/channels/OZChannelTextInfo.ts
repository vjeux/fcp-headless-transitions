// OZChannelTextInfo — ProChannel.framework. Channel-metadata descriptor for a text channel.
// Faithful transcription of the 3 methods emitted for this class:
//   __ZN17OZChannelTextInfoC2Ev  @ProChannel 0x88574   OZChannelTextInfo::OZChannelTextInfo()
//   __ZN17OZChannelTextInfoD1Ev  @ProChannel 0x885da   OZChannelTextInfo::~OZChannelTextInfo() [base]
//   __ZN17OZChannelTextInfoD0Ev  @ProChannel 0x885fa   OZChannelTextInfo::~OZChannelTextInfo() [deleting]
//
// Disasm sources:
//   raw-port/re/disasm/ProChannel.OZChannelTextInfo.OZChannelTextInfo.s     (C2)
//   raw-port/re/disasm/ProChannel.OZChannelTextInfo.~OZChannelTextInfo.s   (D0)
//   (D1 body inlined from otool -tV for __ZN17OZChannelTextInfoD1Ev)
//
// Struct layout (recovered from ctor + PCSingleton subobject install at +0x50):
//   +0x00 : vptr — vtable for OZChannelTextInfo (installed = &vtable + 0x10 @0xdfd88+0x10 = 0xdfd98)
//   +0x08 .. +0x4f : OZChannelInfo base fields (min/max/default/step/pageStep + label*)
//                    (populated by __ZN13OZChannelInfoC2EdddddPKc @ProChannel 0x719d6 — not yet decoded)
//   +0x50 : PCSingleton subobject (secondary vtable = &vtable + 0x30 @0xdfd88+0x30 = 0xdfdb8)
//   +0x58 .. : PCSingleton fields (populated by __ZN11PCSingletonC2Ej with count=100)
//
// vtable for OZChannelTextInfo @ProChannel 0xdfd88 (installed primary pointer 0xdfd98):
//   *0x00 -> ~OZChannelTextInfo (D1) @0x885da
//   *0x08 -> ~OZChannelTextInfo (D0) @0x885fa
//   *0x20 -> non-virtual thunk to ~OZChannelTextInfo @0x88622
//   *0x28 -> non-virtual thunk to ~OZChannelTextInfo @0x88640
//   *0x48 -> typeinfo for OZChannelInfo @0xdcc08
//
// RIP-relative constants read by the ctor (verified via resolve.py const):
//   xmm1 = *(double*)0xaf528  -> 1.0                             (movsd 0x26f9b(%rip) @0x88585)
//   rsi  = *(char*)0xbc3f8    -> "" (empty C-string, first byte 0x00)  (leaq 0x33e73(%rip) @0x8857e)
//   xmm0 = xorps -> 0.0                                          (@0x8858d)
//   xmm2 = xmm3 = xmm4 = xmm1 (=1.0)                             (movaps @0x88590/0x88593/0x88596)
// Register→argument mapping under SysV AMD64 for the OZChannelInfo ctor
//   __ZN13OZChannelInfoC2EdddddPKc(this=rdi, a=xmm0, b=xmm1, c=xmm2, d=xmm3, e=xmm4, s=rsi):
//     a=0.0, b=1.0, c=1.0, d=1.0, e=1.0, s=""
// PCSingleton::PCSingleton(uint32_t n) invoked with this=&(*this)+0x50, n=0x64 (=100).
//
// NOTE: the text-channel ctor's numeric arguments are identical to the sibling numeric-info
// classes (e.g. OZChannelBoolInfo @0x52a3a) — same (0.0, 1.0, 1.0, 1.0, 1.0, "") signature.
// The difference is purely the vtable address (0xdfd88 here vs 0xd7c98 for Bool).
//
// Callees NOT yet decoded on the raw-port side (invoked through THROWING stubs per Rule 3):
//   __ZN13OZChannelInfoC2EdddddPKc  @ProChannel 0x719d6   OZChannelInfo::OZChannelInfo(d,d,d,d,d,const char*)
//   __ZN13OZChannelInfoD2Ev         @ProChannel 0x71be2   OZChannelInfo::~OZChannelInfo()
//   __ZN11PCSingletonC2Ej           @ProCore   (ProChannel stub 0xacb46)  PCSingleton::PCSingleton(uint32_t)
//   __ZN11PCSingletonD2Ev           @ProCore   (ProChannel stub 0xacb4c)  PCSingleton::~PCSingleton()

// ────────────────────────────────────────────────────────────────────────────────────────
// Throwing stubs for undecoded callees (each cites its @0xADDR per Rule 3).
// ────────────────────────────────────────────────────────────────────────────────────────
function OZChannelInfo_ctor_ddddd_pcc(
  _self: OZChannelTextInfo,
  _a: number, _b: number, _c: number, _d: number, _e: number, _s: string,
): void {
  // __ZN13OZChannelInfoC2EdddddPKc @ProChannel 0x719d6 — not yet transcribed
  throw new Error("OZChannelInfo::OZChannelInfo(double,double,double,double,double,char const*) @ProChannel 0x719d6 not yet transcribed");
}
function OZChannelInfo_dtor(_self: OZChannelTextInfo): void {
  // __ZN13OZChannelInfoD2Ev @ProChannel 0x71be2 — not yet transcribed
  throw new Error("OZChannelInfo::~OZChannelInfo() @ProChannel 0x71be2 not yet transcribed");
}
function PCSingleton_ctor_u32(_selfAtPlus50: OZChannelTextInfo, _n: number): void {
  // __ZN11PCSingletonC2Ej @ProCore (called via ProChannel __stubs 0xacb46) — not yet transcribed
  throw new Error("PCSingleton::PCSingleton(uint32_t) @ProCore (ProChannel stub 0xacb46) not yet transcribed");
}
function PCSingleton_dtor(_selfAtPlus50: OZChannelTextInfo): void {
  // __ZN11PCSingletonD2Ev @ProCore (called via ProChannel __stubs 0xacb4c) — not yet transcribed
  throw new Error("PCSingleton::~PCSingleton() @ProCore (ProChannel stub 0xacb4c) not yet transcribed");
}

// Vtable install pointers (installed = vtable symbol address + 0x10 / +0x30 respectively).
// vtable for OZChannelTextInfo @ProChannel 0xdfd88. The ctor writes:
//   (this+0x00) = vtable+0x10 = 0xdfd98       primary (OZChannelInfo subobject vptr)
//   (this+0x50) = vtable+0x30 = 0xdfdb8       secondary (PCSingleton subobject vptr)
export const OZ_CHANNEL_TEXT_INFO_VTABLE_ADDR = 0xdfd88;
export const OZ_CHANNEL_TEXT_INFO_PRIMARY_VPTR = 0xdfd88 + 0x10;    // installed at this+0x00
export const OZ_CHANNEL_TEXT_INFO_SECONDARY_VPTR = 0xdfd88 + 0x30;  // installed at this+0x50

// ────────────────────────────────────────────────────────────────────────────────────────
// OZChannelTextInfo — one C++ class, one file.
// ────────────────────────────────────────────────────────────────────────────────────────
export class OZChannelTextInfo {
  /** Primary vtable pointer as installed at this+0x00 (vtable+0x10 @ProChannel 0xdfd98). */
  vptr: number = 0;
  /** Secondary vtable pointer for the PCSingleton subobject at this+0x50 (vtable+0x30 @0xdfdb8). */
  vptrSingleton: number = 0;

  /**
   * __ZN17OZChannelTextInfoC2Ev  @ProChannel 0x88574
   * Body (verbatim structure of the disasm at raw-port/re/disasm/ProChannel.OZChannelTextInfo.OZChannelTextInfo.s):
   *   0x88574  pushq %rbp / movq %rsp,%rbp / pushq %r14 / pushq %rbx     [prologue]
   *   0x8857b  rbx = this
   *   0x8857e  rsi = "" (@0xbc3f8, empty C-string; leaq 0x33e73(%rip))
   *   0x88585  xmm1 = 1.0 (@0xaf528; movsd 0x26f9b(%rip))
   *   0x8858d  xmm0 = 0.0 (xorps %xmm0,%xmm0)
   *   0x88590  xmm2 = xmm1 = 1.0
   *   0x88593  xmm3 = xmm1 = 1.0
   *   0x88596  xmm4 = xmm1 = 1.0
   *   0x88599  callq __ZN13OZChannelInfoC2EdddddPKc(this, 0.0, 1.0, 1.0, 1.0, 1.0, "")
   *   0x8859e  rdi = this + 0x50    (PCSingleton subobject)
   *   0x885a2  esi = 0x64           (= 100)
   *   0x885a7  callq stub -> __ZN11PCSingletonC2Ej
   *   0x885ac  rax = vtable_for_OZChannelTextInfo (@0xdfd88)
   *   0x885b3  rcx = rax + 0x10                        (= 0xdfd98)
   *   0x885b7  *(this+0x00) = rcx                      install primary vptr
   *   0x885ba  rax += 0x30
   *   0x885be  *(this+0x50) = rax                      install secondary vptr (PCSingleton)
   *   0x885c2  popq %rbx / popq %r14 / popq %rbp / retq
   * (The trailing landingpad at 0x885c7..0x885d5 is the C++ EH cleanup: on exception between
   *  the base ctor and the vtable install, unwind calls __ZN13OZChannelInfoD2Ev then
   *  __Unwind_Resume — compiler-emitted, no explicit code needed in the port.)
   */
  constructor() {
    // Base subobject init: OZChannelInfo(0.0, 1.0, 1.0, 1.0, 1.0, "")
    // (See disasm above for register->arg mapping.)
    OZChannelInfo_ctor_ddddd_pcc(this, 0.0, 1.0, 1.0, 1.0, 1.0, "");
    // PCSingleton subobject at (this+0x50) with count=100 (0x64).
    PCSingleton_ctor_u32(this, 0x64);
    // Vtable install (primary and PCSingleton secondary).
    this.vptr = OZ_CHANNEL_TEXT_INFO_PRIMARY_VPTR;         // vtable+0x10 @0xdfd98
    this.vptrSingleton = OZ_CHANNEL_TEXT_INFO_SECONDARY_VPTR; // vtable+0x30 @0xdfdb8
  }

  /**
   * __ZN17OZChannelTextInfoD1Ev  @ProChannel 0x885da   [base object destructor]
   * Body (verbatim, from otool -tV for __ZN17OZChannelTextInfoD1Ev):
   *   0x885da  pushq %rbp / movq %rsp,%rbp / pushq %rbx / pushq %rax
   *   0x885e0  rbx = this
   *   0x885e3  rdi = this + 0x50
   *   0x885e7  callq stub -> __ZN11PCSingletonD2Ev
   *   0x885ec  rdi = this
   *   0x885ef  addq $0x8,%rsp / popq %rbx / popq %rbp
   *   0x885f5  jmp  __ZN13OZChannelInfoD2Ev            (tail-call the base dtor)
   * i.e. destroy PCSingleton subobject then destroy OZChannelInfo base subobject.
   */
  dtorBase(): void {
    PCSingleton_dtor(this);      // this+0x50 subobject destructor @0x885e7
    OZChannelInfo_dtor(this);    // tail-called base dtor @0x885f5
  }

  /**
   * __ZN17OZChannelTextInfoD0Ev  @ProChannel 0x885fa   [deleting destructor]
   * Body (verbatim from raw-port/re/disasm/ProChannel.OZChannelTextInfo.~OZChannelTextInfo.s):
   *   0x885fa  pushq %rbp / movq %rsp,%rbp / pushq %rbx / pushq %rax
   *   0x88600  rbx = this
   *   0x88603  rdi = this + 0x50
   *   0x88607  callq stub -> __ZN11PCSingletonD2Ev
   *   0x8860c  rdi = this
   *   0x8860f  callq __ZN13OZChannelInfoD2Ev
   *   0x88614  rdi = this
   *   0x88617  addq $0x8,%rsp / popq %rbx / popq %rbp
   *   0x8861d  jmp  __ZdlPv                            (operator delete(void*))
   * i.e. run D1's body then call operator delete on `this`.
   */
  dtorDeleting(): void {
    PCSingleton_dtor(this);   // @0x88607  stub 0xacb4c
    OZChannelInfo_dtor(this); // @0x8860f
    // @0x8861d  jmp __ZdlPv (operator delete(void*)) — no-op in TS (GC frees the object).
  }
}
