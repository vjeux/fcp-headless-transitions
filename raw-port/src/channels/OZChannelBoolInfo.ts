// OZChannelBoolInfo — ProChannel.framework. Channel-metadata descriptor for a boolean channel.
// Faithful transcription of the 3 methods emitted for this class:
//   __ZN17OZChannelBoolInfoC2Ev  @ProChannel 0x52a3a   OZChannelBoolInfo::OZChannelBoolInfo()
//   __ZN17OZChannelBoolInfoD1Ev  @ProChannel 0x52aa0   OZChannelBoolInfo::~OZChannelBoolInfo() [base]
//   __ZN17OZChannelBoolInfoD0Ev  @ProChannel 0x52ac0   OZChannelBoolInfo::~OZChannelBoolInfo() [deleting]
//
// Disasm sources:
//   raw-port/re/disasm/ProChannel.OZChannelBoolInfo.OZChannelBoolInfo.s
//   raw-port/re/disasm/ProChannel.OZChannelBoolInfo.~OZChannelBoolInfo.s   (D0)
//   (D1 body inlined from otool -tV for __ZN17OZChannelBoolInfoD1Ev)
//
// Struct layout (recovered from ctor + PCSingleton subobject install at +0x50):
//   +0x00 : vptr — vtable for OZChannelBoolInfo (installed = &vtable + 0x10 @0xd7c98+0x10)
//   +0x08 .. +0x4f : OZChannelInfo base fields (min/max/default/step/pageStep + label*)
//                    (populated by __ZN13OZChannelInfoC2EdddddPKc — not yet decoded)
//   +0x50 : PCSingleton subobject (secondary vtable = &vtable + 0x30 @0xd7c98+0x30)
//   +0x58 .. : PCSingleton fields (populated by __ZN11PCSingletonC2Ej with count=100)
//
// vtable for OZChannelBoolInfo @0xd7c98 (installed pointer 0xd7ca8):
//   *0x00 -> ~OZChannelBoolInfo (D1) @0x52aa0
//   *0x08 -> ~OZChannelBoolInfo (D0) @0x52ac0
//   *0x20 -> non-virtual thunk to ~OZChannelBoolInfo @0x52ae8
//   *0x28 -> non-virtual thunk to ~OZChannelBoolInfo @0x52b06
//   *0x48 -> typeinfo for OZChannelInfo @0xdcc08
//
// Callees NOT yet decoded on the raw-port side:
//   __ZN13OZChannelInfoC2EdddddPKc  @ProChannel 0x…   OZChannelInfo::OZChannelInfo(d,d,d,d,d,const char*)
//   __ZN13OZChannelInfoD2Ev         @ProChannel 0x…   OZChannelInfo::~OZChannelInfo()
//   __ZN11PCSingletonC2Ej           @ProChannel (stub 0xacb46)   PCSingleton::PCSingleton(uint32_t)
//   __ZN11PCSingletonD2Ev           @ProChannel (stub 0xacb4c)   PCSingleton::~PCSingleton()
// Per PORTING_SPEC Rule 3 they are invoked through THROWING stubs that cite their addresses.
//
// RIP-relative constants read by the ctor:
//   xmm1 = *(double*)0xaf528  -> 1.0                             (movsd 0x5cad5(%rip) @0x52a4b)
//   rsi  = *(char*)0xbc3f8    -> "" (empty C-string)             (leaq 0x699ad(%rip) @0x52a44)
//   xmm0 = xorps -> 0.0                                          (@0x52a53)
//   xmm2 = xmm3 = xmm4 = xmm1 (=1.0)                             (movaps @0x52a56/0x52a59/0x52a5c)
// Register→argument mapping under SysV AMD64 for the OZChannelInfo ctor
//   __ZN13OZChannelInfoC2EdddddPKc(this=rdi, a=xmm0, b=xmm1, c=xmm2, d=xmm3, e=xmm4, s=rsi):
//     a=0.0, b=1.0, c=1.0, d=1.0, e=1.0, s=""
// PCSingleton::PCSingleton(uint32_t n) invoked with this=&(*this)+0x50, n=0x64 (=100).

// ────────────────────────────────────────────────────────────────────────────────────────
// Throwing stubs for undecoded callees (each cites its @0xADDR per Rule 3).
// ────────────────────────────────────────────────────────────────────────────────────────
function OZChannelInfo_ctor_ddddd_pcc(
  _self: OZChannelBoolInfo,
  _a: number, _b: number, _c: number, _d: number, _e: number, _s: string,
): void {
  // __ZN13OZChannelInfoC2EdddddPKc @ProChannel 0x719d6 — not yet transcribed
  throw new Error("OZChannelInfo::OZChannelInfo(double,double,double,double,double,char const*) @ProChannel 0x719d6 not yet transcribed");
}
function OZChannelInfo_dtor(_self: OZChannelBoolInfo): void {
  // __ZN13OZChannelInfoD2Ev @ProChannel 0x71be2 — not yet transcribed
  throw new Error("OZChannelInfo::~OZChannelInfo() @ProChannel 0x71be2 not yet transcribed");
}
function PCSingleton_ctor_u32(_selfAtPlus50: OZChannelBoolInfo, _n: number): void {
  // __ZN11PCSingletonC2Ej @ProCore 0x1d5a6 (called via ProChannel __stubs 0xacb46) — not yet transcribed
  throw new Error("PCSingleton::PCSingleton(uint32_t) @ProCore 0x1d5a6 not yet transcribed");
}
function PCSingleton_dtor(_selfAtPlus50: OZChannelBoolInfo): void {
  // __ZN11PCSingletonD2Ev @ProCore 0x1d746 (called via ProChannel __stubs 0xacb4c) — not yet transcribed
  throw new Error("PCSingleton::~PCSingleton() @ProCore 0x1d746 not yet transcribed");
}

// Vtable install pointers (installed = vtable symbol address + 0x10 / +0x30 respectively).
// vtable for OZChannelBoolInfo @ProChannel 0xd7c98. The ctor writes:
//   (this+0x00) = vtable+0x10 = 0xd7ca8       primary (OZChannelInfo subobject vptr)
//   (this+0x50) = vtable+0x30 = 0xd7cc8       secondary (PCSingleton subobject vptr)
export const OZ_CHANNEL_BOOL_INFO_VTABLE_ADDR = 0xd7c98;
export const OZ_CHANNEL_BOOL_INFO_PRIMARY_VPTR = 0xd7c98 + 0x10;    // installed at this+0x00
export const OZ_CHANNEL_BOOL_INFO_SECONDARY_VPTR = 0xd7c98 + 0x30;  // installed at this+0x50

// ────────────────────────────────────────────────────────────────────────────────────────
// OZChannelBoolInfo — one C++ class, one file.
// ────────────────────────────────────────────────────────────────────────────────────────
export class OZChannelBoolInfo {
  /** Primary vtable pointer as installed at this+0x00 (vtable+0x10 @ProChannel 0xd7ca8). */
  vptr: number = 0;
  /** Secondary vtable pointer for the PCSingleton subobject at this+0x50 (vtable+0x30 @0xd7cc8). */
  vptrSingleton: number = 0;

  /**
   * __ZN17OZChannelBoolInfoC2Ev  @ProChannel 0x52a3a
   * Body (verbatim structure of the disasm):
   *   0x52a41  rbx = this
   *   0x52a44  rsi = "" (@0xbc3f8, empty C-string)
   *   0x52a4b  xmm1 = 1.0 (@0xaf528)
   *   0x52a53  xmm0 = 0.0 (xorps)
   *   0x52a56  xmm2 = xmm3 = xmm4 = xmm1 = 1.0
   *   0x52a5f  callq __ZN13OZChannelInfoC2EdddddPKc(this, 0.0, 1.0, 1.0, 1.0, 1.0, "")
   *   0x52a64  rdi = this + 0x50    (PCSingleton subobject)
   *   0x52a68  esi = 0x64           (= 100)
   *   0x52a6d  callq stub -> __ZN11PCSingletonC2Ej
   *   0x52a72  rax = vtable_for_OZChannelBoolInfo (@0xd7c98)
   *   0x52a79  rcx = rax + 0x10                        (= 0xd7ca8)
   *   0x52a7d  *(this+0x00) = rcx                      install primary vptr
   *   0x52a80  rax += 0x30
   *   0x52a84  *(this+0x50) = rax                      install secondary vptr (PCSingleton)
   * (The trailing r14/rbx pops + landingpad at 0x52a8d..0x52a9b are the C++ EH cleanup:
   *  on exception between the base ctor and the vtable install, unwind calls
   *  __ZN13OZChannelInfoD2Ev then __Unwind_Resume — that is emitted by the compiler and
   *  needs no explicit code here in the port.)
   */
  constructor() {
    // Base subobject init: OZChannelInfo(0.0, 1.0, 1.0, 1.0, 1.0, "")
    // (See disasm above for register->arg mapping.)
    OZChannelInfo_ctor_ddddd_pcc(this, 0.0, 1.0, 1.0, 1.0, 1.0, "");
    // PCSingleton subobject at (this+0x50) with count=100 (0x64).
    PCSingleton_ctor_u32(this, 0x64);
    // Vtable install (primary and PCSingleton secondary).
    this.vptr = OZ_CHANNEL_BOOL_INFO_PRIMARY_VPTR;         // vtable+0x10 @0xd7ca8
    this.vptrSingleton = OZ_CHANNEL_BOOL_INFO_SECONDARY_VPTR; // vtable+0x30 @0xd7cc8
  }

  /**
   * __ZN17OZChannelBoolInfoD1Ev  @ProChannel 0x52aa0   [base object destructor]
   * Body (verbatim):
   *   0x52aa6  rbx = this
   *   0x52aa9  rdi = this + 0x50
   *   0x52aad  callq stub -> __ZN11PCSingletonD2Ev
   *   0x52ab2  rdi = this
   *   0x52abb  jmp  __ZN13OZChannelInfoD2Ev            (tail-call the base dtor)
   * i.e. destroy PCSingleton subobject then destroy OZChannelInfo base subobject.
   */
  dtorBase(): void {
    PCSingleton_dtor(this);      // this+0x50 subobject destructor
    OZChannelInfo_dtor(this);    // tail-called base dtor
  }

  /**
   * __ZN17OZChannelBoolInfoD0Ev  @ProChannel 0x52ac0   [deleting destructor]
   * Body (verbatim):
   *   0x52ac6  rbx = this
   *   0x52ac9  rdi = this + 0x50
   *   0x52acd  callq stub -> __ZN11PCSingletonD2Ev
   *   0x52ad2  rdi = this
   *   0x52ad5  callq __ZN13OZChannelInfoD2Ev
   *   0x52ada  rdi = this
   *   0x52ae3  jmp  __ZdlPv                            (operator delete(void*))
   * i.e. run D1's body then call operator delete on `this`.
   */
  dtorDeleting(): void {
    PCSingleton_dtor(this);   // @0x52acd  stub 0xacb4c
    OZChannelInfo_dtor(this); // @0x52ad5
    // @0x52ae3  jmp __ZdlPv (operator delete(void*)) — no-op in TS (GC frees the object).
  }
}
