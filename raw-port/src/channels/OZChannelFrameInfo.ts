// OZChannelFrameInfo — frame-domain metadata descriptor for a channel (ProChannel.framework).
// FAITHFUL PORT — do NOT approximate, do NOT invent numbers.  Every method cites its @ProChannel
// address read from re/disasm/ProChannel.OZChannelFrameInfo.*.s.
//
// Class shape recovered from ctor + dtors:
//   +0x00  primary vtable pointer      -> installed from `vtable for OZChannelFrameInfo + 0x10`
//                                         at @0x10df4/@0x10dfb (leaq 0xbf885(%rip), target 0xd0680)
//   +0x08..0x4f  OZChannelInfo base sub-object
//                (constructed by OZChannelInfo::OZChannelInfo(d,d,d,d,d,char const*) @0x10de1)
//   +0x50..0x??  PCSingleton sub-object
//                (constructed by PCSingleton::PCSingleton(u32) with arg=0x64=100 @0x10def; its
//                 vptr installed from `vtable for OZChannelFrameInfo + 0x30` at @0x10dfe/@0x10e05
//                 (leaq 0xbf89b(%rip), target 0xd06a0) — this is the secondary base's vptr thunk
//                 for multiple inheritance)
//
// The base ctor is called with SEVEN doubles worth of registers ABI-wise, but its C++ signature
// only takes SIX parameters — xmm0..xmm4 for the five doubles + rsi for the C-string:
//   OZChannelInfo::OZChannelInfo(double  d0 =  0.0    // xmm0 (xorps xmm0,xmm0)              @0x10ddb
//                              , double  d1 =  100.0  // xmm1 (movsd @0xaf518)                @0x10dc3
//                              , double  d2 =  1.0    // xmm2 (movsd @0xaf528)                @0x10dd3
//                              , double  d3 =  0.01   // xmm3 (movsd @0xaf520)                @0x10dcb
//                              , double  d4 =  1.0    // xmm4 = xmm2 (movaps xmm2,xmm4)       @0x10dde
//                              , char const* name = "" // rsi (leaq @0xbc3f8, empty c-string) @0x10dbc
//                               )
//
// Numeric constants VERIFIED via raw-port/army/tools/resolve.py ProChannel const:
//   @ProChannel 0xaf518 = 100.0  (0x4059000000000000)
//   @ProChannel 0xaf520 = 0.01   (0x3f847ae147ae147b)
//   @ProChannel 0xaf528 = 1.0    (0x3ff0000000000000)
// String literal @ProChannel 0xbc3f8 = "" (null-terminated empty string; the byte at 0xbc3f8 is 0x00).
//
// FRONTIER DEPS (un-ported): OZChannelInfo (ctor @0x?? in ProChannel, dtor D2 @__ZN13OZChannelInfoD2Ev),
// PCSingleton (ctor+dtor @__ZN11PCSingletonC2Ej / __ZN11PCSingletonD2Ev).  The stubs below throw
// citing those FCP symbols so a real call surfaces a loud gap, per PORTING_SPEC Rule 3.

// ---------------------------------------------------------------------------------------------
// Frontier stubs — the two base sub-objects.
// ---------------------------------------------------------------------------------------------

/**
 * OZChannelInfo base sub-object placed at +0x08 of an OZChannelFrameInfo.  Ctor called from
 * OZChannelFrameInfo::OZChannelFrameInfo @ProChannel 0x10de1.  Dtor D2 called from
 * @ProChannel 0x10e14 (ctor cleanup pad) and from OZChannelFrameInfo::~OZChannelFrameInfo @0x10e3d/0x10e57.
 */
export class OZChannelInfo_Frontier {
  readonly __isOZChannelInfoBase = true;
  /**
   * OZChannelInfo::OZChannelInfo(double, double, double, double, double, char const*)
   *   — @ProChannel __ZN13OZChannelInfoC2EdddddPKc (called from OZChannelFrameInfo ctor @0x10de1).
   * Not yet transcribed; frontier.
   */
  constructor(_d0: number, _d1: number, _d2: number, _d3: number, _d4: number, _name: string) {
    throw new Error("OZChannelInfo::OZChannelInfo(d,d,d,d,d,char const*) @ProChannel __ZN13OZChannelInfoC2EdddddPKc not yet transcribed (called from OZChannelFrameInfo::OZChannelFrameInfo @0x10de1)");
  }
  /**
   * OZChannelInfo::~OZChannelInfo() (D2 body).  Called during ctor unwind @0x10e14, from
   * OZChannelFrameInfo::~OZChannelFrameInfo (D1) @0x10e3d (tail-jmp) and (D0) @0x10e57.
   */
  destroy_D2(): void {
    throw new Error("OZChannelInfo::~OZChannelInfo (D2) @ProChannel __ZN13OZChannelInfoD2Ev not yet transcribed (called from OZChannelFrameInfo ctor unwind @0x10e14 and dtor @0x10e3d/0x10e57)");
  }
}

/**
 * PCSingleton secondary base sub-object placed at +0x50 of an OZChannelFrameInfo.  Ctor called from
 * OZChannelFrameInfo::OZChannelFrameInfo @0x10def with u32 arg = 0x64 (=100).  Dtor D2 called from
 * both dtor variants @0x10e2f (D1) and @0x10e4f (D0) via `addq $0x50, %rdi; callq __ZN11PCSingletonD2Ev`.
 */
export class PCSingleton_Frontier {
  readonly __isPCSingletonBase = true;
  /**
   * PCSingleton::PCSingleton(u32) — @ProChannel __ZN11PCSingletonC2Ej (called via stub @0xacb46
   * from OZChannelFrameInfo::OZChannelFrameInfo @0x10def).  Argument observed = 0x64 (=100).
   * Not yet transcribed; frontier.
   */
  constructor(_arg: number) {
    throw new Error("PCSingleton::PCSingleton(u32) @ProChannel __ZN11PCSingletonC2Ej not yet transcribed (called from OZChannelFrameInfo::OZChannelFrameInfo @0x10def with arg=0x64/100)");
  }
  /**
   * PCSingleton::~PCSingleton() (D2 body) — @ProChannel __ZN11PCSingletonD2Ev.  Called from
   * OZChannelFrameInfo::~OZChannelFrameInfo D1 @0x10e2f and D0 @0x10e4f (via stub @0xacb4c).
   */
  destroy_D2(): void {
    throw new Error("PCSingleton::~PCSingleton (D2) @ProChannel __ZN11PCSingletonD2Ev not yet transcribed (called from OZChannelFrameInfo::~OZChannelFrameInfo @0x10e2f/0x10e4f)");
  }
}

// ---------------------------------------------------------------------------------------------
// OZChannelFrameInfo
// ---------------------------------------------------------------------------------------------

export class OZChannelFrameInfo {
  /**
   * Primary vtable slot at +0x00 of the instance.  Installed by the C2 ctor @ProChannel 0x10dfb
   * with the value `leaq 0xbf885(%rip), %rax; movq %rax, (%rbx)` — i.e. the installed pointer is
   * `vtable for OZChannelFrameInfo + 0x10` at ProChannel VA 0xd0680 (resolved via
   * raw-port/army/tools/resolve.py ProChannel sym 0xd0680).
   *
   * We keep it as an opaque marker constant so a reader can see that a vtable pointer WAS
   * installed here (matching the C++ ABI), but we do not fabricate the slot function pointers —
   * those are extracted by resolve.py vtable OZChannelFrameInfo when a dispatch is decoded.
   */
  readonly __vptr_primary_at_0xd0680 = "vtable for OZChannelFrameInfo + 0x10 @ProChannel 0xd0680";

  /**
   * Secondary base vtable slot at +0x50 (installed onto the PCSingleton sub-object) — set by the
   * C2 ctor @ProChannel 0x10e05 with `leaq 0xbf89b(%rip), %rax; movq %rax, 0x50(%rbx)`.  The
   * installed pointer is `vtable for OZChannelFrameInfo + 0x30` at ProChannel VA 0xd06a0
   * (resolve.py sym 0xd06a0).  This is the standard MI thunk sub-vtable for the PCSingleton base.
   */
  readonly __vptr_secondary_at_0xd06a0 = "vtable for OZChannelFrameInfo + 0x30 @ProChannel 0xd06a0";

  /** OZChannelInfo base sub-object (offset +0x08).  Constructed by ctor @0x10de1.  Frontier. */
  readonly base_info: OZChannelInfo_Frontier;
  /** PCSingleton base sub-object (offset +0x50).  Constructed by ctor @0x10def.  Frontier. */
  readonly base_singleton: PCSingleton_Frontier;

  /**
   * OZChannelFrameInfo::OZChannelFrameInfo() — @ProChannel 0x10db2 (C2 body).
   * Body @0x10db2..0x10e0d:
   *   0x10db2 pushq %rbp ; movq %rsp,%rbp ; pushq %r14 ; pushq %rbx
   *   0x10db9 movq %rdi, %rbx                              ; this
   *   0x10dbc leaq 0xab635(%rip), %rsi                     ; rsi = "" @0xbc3f8
   *   0x10dc3 movsd 0x9e74d(%rip), %xmm1                   ; xmm1 = 100.0 @0xaf518
   *   0x10dcb movsd 0x9e74d(%rip), %xmm3                   ; xmm3 = 0.01  @0xaf520
   *   0x10dd3 movsd 0x9e74d(%rip), %xmm2                   ; xmm2 = 1.0   @0xaf528
   *   0x10ddb xorps %xmm0, %xmm0                           ; xmm0 = 0.0
   *   0x10dde movaps %xmm2, %xmm4                          ; xmm4 = 1.0
   *   0x10de1 callq OZChannelInfo::OZChannelInfo(d,d,d,d,d,char const*)
   *                                                        ; base_info @ this+0x00, args
   *                                                        ; (0.0, 100.0, 1.0, 0.01, 1.0, "")
   *   0x10de6 leaq 0x50(%rbx), %rdi                        ; rdi = this + 0x50
   *   0x10dea movl $0x64, %esi                             ; esi = 100
   *   0x10def callq __ZN11PCSingletonC2Ej (stub 0xacb46)   ; PCSingleton::PCSingleton(this+0x50, 100)
   *   0x10df4 leaq 0xbf885(%rip), %rax                     ; rax = vtable+0x10 @0xd0680
   *   0x10dfb movq %rax, (%rbx)                            ; install primary vptr @ this+0x00
   *   0x10dfe leaq 0xbf89b(%rip), %rax                     ; rax = vtable+0x30 @0xd06a0
   *   0x10e05 movq %rax, 0x50(%rbx)                        ; install secondary vptr @ this+0x50
   *   0x10e09 popq %rbx ; popq %r14 ; popq %rbp ; retq
   * Cleanup landing pad @0x10e0e..0x10e1c: if PCSingleton::PCSingleton throws,
   *   call OZChannelInfo::~OZChannelInfo(this) then __Unwind_Resume.  (Modeled as the throw
   *   propagating out of PCSingleton_Frontier's ctor; TS finalizer handling of base_info is
   *   left to the runtime — this ctor never runs to completion until frontier is landed.)
   *
   * NOTE: this is a faithful transcription — the base sub-object stubs throw as of today, so any
   * runtime `new OZChannelFrameInfo()` will surface the frontier gap loudly (correct per Rule 3).
   */
  constructor() {
    // Order matches the C2 body: OZChannelInfo first, then PCSingleton, then vptrs installed.
    // Argument order for base_info comes from x86_64 SysV double-arg mapping xmm0..xmm4 -> d0..d4.
    this.base_info = new OZChannelInfo_Frontier(
      /* d0 = 0.0   xmm0 (xorps)                   */ 0.0,
      /* d1 = 100.0 xmm1 @ProChannel const 0xaf518 */ 100.0,
      /* d2 = 1.0   xmm2 @ProChannel const 0xaf528 */ 1.0,
      /* d3 = 0.01  xmm3 @ProChannel const 0xaf520 */ 0.01,
      /* d4 = 1.0   xmm4 = xmm2 (movaps)           */ 1.0,
      /* name = ""  rsi @ProChannel str 0xbc3f8   */ ""
    );
    this.base_singleton = new PCSingleton_Frontier(/* u32 = 0x64 = 100  esi @0x10dea */ 100);
    // vptr installs @0x10df4/@0x10dfb (primary) and @0x10dfe/@0x10e05 (secondary) are represented
    // by the two readonly marker fields above — the C++ layout stores the pointer at these exact
    // offsets before returning.
  }

  /**
   * OZChannelFrameInfo::~OZChannelFrameInfo() — D1 (in-place) @ProChannel 0x10e22.
   * Body @0x10e22..0x10e3d:
   *   0x10e22 pushq %rbp ; movq %rsp,%rbp ; pushq %rbx ; pushq %rax
   *   0x10e28 movq %rdi, %rbx                              ; this
   *   0x10e2b addq $0x50, %rdi                             ; rdi = this + 0x50
   *   0x10e2f callq __ZN11PCSingletonD2Ev (stub 0xacb4c)   ; PCSingleton::~PCSingleton(this+0x50)
   *   0x10e34 movq %rbx, %rdi                              ; rdi = this
   *   0x10e37 addq $0x8, %rsp ; popq %rbx ; popq %rbp
   *   0x10e3d jmp  __ZN13OZChannelInfoD2Ev                 ; tail-jump into OZChannelInfo::~OZChannelInfo(this)
   * Reverse of ctor order: destroy PCSingleton sub-object, then chain into the OZChannelInfo base
   * dtor via a tail jump.  (No vptr resets are emitted because this is a leaf class — subclass
   * dtors will overwrite the vptrs on entry to their own bodies.)
   */
  destroy_D1(): void {
    // Faithful reverse-order destruction; every step throws citing the frontier symbol.
    this.base_singleton.destroy_D2();        // @ProChannel 0x10e2f
    this.base_info.destroy_D2();             // @ProChannel 0x10e3d (tail-jmp form)
  }

  /**
   * OZChannelFrameInfo::~OZChannelFrameInfo() — D0 (deleting) @ProChannel 0x10e42.
   * Body @0x10e42..0x10e65:
   *   0x10e42 pushq %rbp ; movq %rsp,%rbp ; pushq %rbx ; pushq %rax
   *   0x10e48 movq %rdi, %rbx                              ; this
   *   0x10e4b addq $0x50, %rdi                             ; rdi = this + 0x50
   *   0x10e4f callq __ZN11PCSingletonD2Ev (stub 0xacb4c)   ; PCSingleton::~PCSingleton(this+0x50)
   *   0x10e54 movq %rbx, %rdi                              ; rdi = this
   *   0x10e57 callq __ZN13OZChannelInfoD2Ev                ; OZChannelInfo::~OZChannelInfo(this)
   *   0x10e5c movq %rbx, %rdi                              ; rdi = this
   *   0x10e5f addq $0x8, %rsp ; popq %rbx ; popq %rbp
   *   0x10e65 jmp  __ZdlPv (stub 0xace04)                  ; tail-jump into operator delete(void*)
   * The only difference vs D1 is the final `operator delete(this)` (jmp __ZdlPv) after the base
   * dtor.  D0 is the vtable's "deleting destructor" slot.
   */
  destroy_D0(): void {
    // Faithful mirror of the assembly: D2s of both bases in reverse order, then `operator delete`.
    this.base_singleton.destroy_D2();        // @ProChannel 0x10e4f
    this.base_info.destroy_D2();             // @ProChannel 0x10e57
    // @ProChannel 0x10e65 tail-jmp __ZdlPv — operator delete(void*).  Frontier (libc++ intrinsic).
    throw new Error("operator delete(void*) @ProChannel __ZdlPv (stub 0xace04) not yet transcribed (called from OZChannelFrameInfo::~OZChannelFrameInfo D0 @0x10e65)");
  }
}
