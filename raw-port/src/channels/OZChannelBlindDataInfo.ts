// OZChannelBlindDataInfo — ProChannel.framework. Channel-metadata (blind data) descriptor.
// Faithful transcription of the 3 methods emitted for this class:
//   __ZN22OZChannelBlindDataInfoC2Ev  @ProChannel 0x51d42   OZChannelBlindDataInfo::OZChannelBlindDataInfo()
//   __ZN22OZChannelBlindDataInfoD1Ev  @ProChannel 0x51da8   OZChannelBlindDataInfo::~OZChannelBlindDataInfo() [base]
//   __ZN22OZChannelBlindDataInfoD0Ev  @ProChannel 0x51dc8   OZChannelBlindDataInfo::~OZChannelBlindDataInfo() [deleting]
//
// Disasm sources:
//   raw-port/re/disasm/ProChannel.OZChannelBlindDataInfo.OZChannelBlindDataInfo.s
//   raw-port/re/disasm/ProChannel.OZChannelBlindDataInfo.~OZChannelBlindDataInfo.s   (D0)
//   (D1 body inlined from otool -tV for __ZN22OZChannelBlindDataInfoD1Ev @0x51da8)
//
// Struct layout (recovered from ctor + PCSingleton subobject install at +0x50):
//   +0x00 : vptr — vtable for OZChannelBlindDataInfo (installed = &vtable + 0x10 @0xd7850+0x10)
//   +0x08 .. +0x4f : OZChannelInfo base fields (min/max/default/step/pageStep + label*)
//                    (populated by __ZN13OZChannelInfoC2EdddddPKc — not yet decoded)
//   +0x50 : PCSingleton subobject (secondary vtable = &vtable + 0x30 @0xd7850+0x30)
//   +0x58 .. : PCSingleton fields (populated by __ZN11PCSingletonC2Ej with count=100)
//
// vtable for OZChannelBlindDataInfo @0xd7850 (installed pointer 0xd7860):
//   *0x00 -> ~OZChannelBlindDataInfo (D1) @0x51da8
//   *0x08 -> ~OZChannelBlindDataInfo (D0) @0x51dc8
//   *0x20 -> non-virtual thunk to ~OZChannelBlindDataInfo @0x51df0
//   *0x28 -> non-virtual thunk to ~OZChannelBlindDataInfo @0x51e0e
//   *0x48 -> typeinfo for OZChannelInfo @0xdcc08
//   (full vtable dump — see raw-port/army/tools/vtable.py ProChannel OZChannelBlindDataInfo)
//
// Callees NOT yet decoded on the raw-port side:
//   __ZN13OZChannelInfoC2EdddddPKc  @ProChannel 0x719d6  OZChannelInfo::OZChannelInfo(d,d,d,d,d,const char*)
//   __ZN13OZChannelInfoD2Ev         @ProChannel 0x71be2  OZChannelInfo::~OZChannelInfo()
//   __ZN11PCSingletonC2Ej           @ProCore    (called via ProChannel __stubs 0xacb46)  PCSingleton::PCSingleton(uint32_t)
//   __ZN11PCSingletonD2Ev           @ProCore    (called via ProChannel __stubs 0xacb4c)  PCSingleton::~PCSingleton()
// Per PORTING_SPEC Rule 3 they are invoked through THROWING stubs that cite their addresses.
//
// RIP-relative constants read by the ctor (@0x51d42):
//   rsi  = *(char*)0xbc3f8   -> "" (empty C-string)             (leaq 0x6a6a5(%rip) @0x51d4c ; RIP=0x51d53)
//   xmm1 = *(double*)0xaf528 -> 1.0                             (movsd 0x5d7cd(%rip) @0x51d53 ; RIP=0x51d5b)
//   xmm0 = xorps -> 0.0                                          (@0x51d5b)
//   xmm2 = xmm3 = xmm4 = xmm1 (=1.0)                             (movaps @0x51d5e/0x51d61/0x51d64)
// Register→argument mapping under SysV AMD64 for the OZChannelInfo ctor
//   __ZN13OZChannelInfoC2EdddddPKc(this=rdi, a=xmm0, b=xmm1, c=xmm2, d=xmm3, e=xmm4, s=rsi):
//     a=0.0, b=1.0, c=1.0, d=1.0, e=1.0, s=""
// PCSingleton::PCSingleton(uint32_t n) invoked with this=&(*this)+0x50, n=0x64 (=100).

// ────────────────────────────────────────────────────────────────────────────────────────
// Throwing stubs for undecoded callees (each cites its @0xADDR per Rule 3).
// ────────────────────────────────────────────────────────────────────────────────────────
function OZChannelInfo_ctor_ddddd_pcc(
  _self: OZChannelBlindDataInfo,
  _a: number, _b: number, _c: number, _d: number, _e: number, _s: string,
): void {
  // __ZN13OZChannelInfoC2EdddddPKc @ProChannel 0x719d6 — not yet transcribed
  throw new Error("OZChannelInfo::OZChannelInfo(double,double,double,double,double,char const*) @ProChannel 0x719d6 not yet transcribed");
}
function OZChannelInfo_dtor(_self: OZChannelBlindDataInfo): void {
  // __ZN13OZChannelInfoD2Ev @ProChannel 0x71be2 — not yet transcribed
  throw new Error("OZChannelInfo::~OZChannelInfo() @ProChannel 0x71be2 not yet transcribed");
}
function PCSingleton_ctor_u32(_selfAtPlus50: OZChannelBlindDataInfo, _n: number): void {
  // __ZN11PCSingletonC2Ej @ProCore (called via ProChannel __stubs 0xacb46) — not yet transcribed
  throw new Error("PCSingleton::PCSingleton(uint32_t) @ProCore (ProChannel stub 0xacb46) not yet transcribed");
}
function PCSingleton_dtor(_selfAtPlus50: OZChannelBlindDataInfo): void {
  // __ZN11PCSingletonD2Ev @ProCore (called via ProChannel __stubs 0xacb4c) — not yet transcribed
  throw new Error("PCSingleton::~PCSingleton() @ProCore (ProChannel stub 0xacb4c) not yet transcribed");
}

// Vtable install pointers (installed = vtable symbol address + 0x10 / +0x30 respectively).
// vtable for OZChannelBlindDataInfo @ProChannel 0xd7850. The ctor writes:
//   (this+0x00) = vtable+0x10 = 0xd7860       primary (OZChannelInfo subobject vptr)
//   (this+0x50) = vtable+0x30 = 0xd7880       secondary (PCSingleton subobject vptr)
export const OZ_CHANNEL_BLIND_DATA_INFO_VTABLE_ADDR = 0xd7850;
export const OZ_CHANNEL_BLIND_DATA_INFO_PRIMARY_VPTR = 0xd7850 + 0x10;    // installed at this+0x00
export const OZ_CHANNEL_BLIND_DATA_INFO_SECONDARY_VPTR = 0xd7850 + 0x30;  // installed at this+0x50

// ────────────────────────────────────────────────────────────────────────────────────────
// OZChannelBlindDataInfo — one C++ class, one file.
// ────────────────────────────────────────────────────────────────────────────────────────
export class OZChannelBlindDataInfo {
  /** Primary vtable pointer as installed at this+0x00 (vtable+0x10 @ProChannel 0xd7860). */
  vptr: number = 0;
  /** Secondary vtable pointer for the PCSingleton subobject at this+0x50 (vtable+0x30 @0xd7880). */
  vptrSingleton: number = 0;

  /**
   * __ZN22OZChannelBlindDataInfoC2Ev  @ProChannel 0x51d42
   * Body (verbatim structure of the disasm):
   *   0x51d49  rbx = this
   *   0x51d4c  rsi = "" (@0xbc3f8, empty C-string)
   *   0x51d53  xmm1 = 1.0 (@0xaf528)
   *   0x51d5b  xmm0 = 0.0 (xorps)
   *   0x51d5e  xmm2 = xmm3 = xmm4 = xmm1 = 1.0
   *   0x51d67  callq __ZN13OZChannelInfoC2EdddddPKc(this, 0.0, 1.0, 1.0, 1.0, 1.0, "")
   *   0x51d6c  rdi = this + 0x50    (PCSingleton subobject)
   *   0x51d70  esi = 0x64           (= 100)
   *   0x51d75  callq stub 0xacb46 -> __ZN11PCSingletonC2Ej
   *   0x51d7a  rax = vtable_for_OZChannelBlindDataInfo (@0xd7850)
   *   0x51d81  rcx = rax + 0x10                        (= 0xd7860)
   *   0x51d85  *(this+0x00) = rcx                      install primary vptr
   *   0x51d88  rax += 0x30
   *   0x51d8c  *(this+0x50) = rax                      install secondary vptr (PCSingleton)
   * (The trailing r14/rbx pops + landingpad at 0x51d95..0x51da3 are the C++ EH cleanup:
   *  on exception between the base ctor and the vtable install, unwind calls
   *  __ZN13OZChannelInfoD2Ev then __Unwind_Resume (ProChannel stub 0xacaf2) — emitted by the
   *  compiler; no explicit code needed in the port.)
   */
  constructor() {
    // Base subobject init: OZChannelInfo(0.0, 1.0, 1.0, 1.0, 1.0, "")
    // (See disasm above for register->arg mapping.)
    OZChannelInfo_ctor_ddddd_pcc(this, 0.0, 1.0, 1.0, 1.0, 1.0, "");
    // PCSingleton subobject at (this+0x50) with count=100 (0x64).
    PCSingleton_ctor_u32(this, 0x64);
    // Vtable install (primary and PCSingleton secondary).
    this.vptr = OZ_CHANNEL_BLIND_DATA_INFO_PRIMARY_VPTR;         // vtable+0x10 @0xd7860
    this.vptrSingleton = OZ_CHANNEL_BLIND_DATA_INFO_SECONDARY_VPTR; // vtable+0x30 @0xd7880
  }

  /**
   * __ZN22OZChannelBlindDataInfoD1Ev  @ProChannel 0x51da8   [base object destructor]
   * Body (verbatim):
   *   0x51dae  rbx = this
   *   0x51db1  rdi = this + 0x50
   *   0x51db5  callq stub 0xacb4c -> __ZN11PCSingletonD2Ev
   *   0x51dba  rdi = this
   *   0x51dc3  jmp  __ZN13OZChannelInfoD2Ev            (tail-call the base dtor)
   * i.e. destroy PCSingleton subobject then destroy OZChannelInfo base subobject.
   */
  dtorBase(): void {
    PCSingleton_dtor(this);      // this+0x50 subobject destructor
    OZChannelInfo_dtor(this);    // tail-called base dtor
  }

  /**
   * __ZN22OZChannelBlindDataInfoD0Ev  @ProChannel 0x51dc8   [deleting destructor]
   * Body (verbatim):
   *   0x51dce  rbx = this
   *   0x51dd1  rdi = this + 0x50
   *   0x51dd5  callq stub 0xacb4c -> __ZN11PCSingletonD2Ev
   *   0x51dda  rdi = this
   *   0x51ddd  callq __ZN13OZChannelInfoD2Ev
   *   0x51de2  rdi = this
   *   0x51deb  jmp  stub 0xace04 -> __ZdlPv            (operator delete(void*))
   * i.e. run D1's body then call operator delete on `this`.
   */
  dtorDeleting(): void {
    PCSingleton_dtor(this);   // @0x51dd5  stub 0xacb4c
    OZChannelInfo_dtor(this); // @0x51ddd
    // @0x51deb  jmp __ZdlPv (operator delete(void*)) — no-op in TS (GC frees the object).
  }
}
