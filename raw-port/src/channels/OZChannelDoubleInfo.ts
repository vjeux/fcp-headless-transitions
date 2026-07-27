// OZChannelDoubleInfo — descriptor for a scalar (double) channel type (ProChannel.framework).
//
// FAITHFUL PORT.  Every method cites its @ProChannel 0xADDR from re/disasm/ProChannel.
// OZChannelDoubleInfo.*.s.  Every constant cites the address it was read from
// (verified via army/tools/resolve.py const).  Undecoded callees throw citing their addr.
//
// STRUCT LAYOUT (recovered from ctor @0x6a25c + resolve.py vtable):
//   size >= 0x50 + sizeof(PCSingleton) — PCSingleton is a frontier class.
//   +0x00       vtable slot (primary OZChannelInfo/OZChannelDoubleInfo)   ; set @0x6a2a5 -> 0xcad80
//   +0x00 .. +0x4F   OZChannelInfo base sub-object (size 0x50)           ; base ctor @0x6a28b
//   +0x50       vtable slot (embedded PCSingleton sub-object)             ; set @0x6a2af -> 0xcada0
//   +0x50 .. +?     PCSingleton member (constructed with capacity 0x64=100 @0x6a299)
//
// VTABLE (resolve.py vtable OZChannelDoubleInfo):
//   installed ptr 0xcad80
//   *0x00 -> 0x6a2cc  OZChannelDoubleInfo::~OZChannelDoubleInfo() (D1)
//   *0x08 -> 0x6a2ec  OZChannelDoubleInfo::~OZChannelDoubleInfo() (D0)
//   (only the two destructor slots differ from OZChannelInfo — no methods overridden here.)
//
// FRONTIER: OZChannelInfo (base ctor/dtor @0x6a28b/0x6a2be/0x6a301) and PCSingleton
// (ctor/dtor via stubs @0xacb46/0xacb4c) are NOT yet ported.  All construction/destruction
// paths therefore throw citing the FCP source addresses that would need transcription first.

// ---------------------------------------------------------------------------------------------
// Frontier stubs.  These exist purely so the OZChannelDoubleInfo shape typechecks; every real
// use path throws citing the ProChannel address that would need to be decoded first.
// ---------------------------------------------------------------------------------------------

/**
 * OZChannelInfo — base class of every OZChannel*Info descriptor.
 * Ctor signature (only one seen in the symbol map):
 *   OZChannelInfo::OZChannelInfo(double, double, double, double, double, char const*)
 *   @ProChannel 0x??   (mangled: __ZN13OZChannelInfoC2EdddddPKc — body not yet decoded)
 * Dtor:
 *   OZChannelInfo::~OZChannelInfo()  @ProChannel 0x??  (called from
 *   OZChannelDoubleInfo::~OZChannelDoubleInfo D2 @0x6a2be and D1 @0x6a2e7 tail-jump).
 * The 5 doubles are presumed (default, min, max, step, unit-numeric) with the char* being a unit
 * string, but until OZChannelInfo::OZChannelInfo is disassembled we DO NOT NAME them — the port
 * only records the ORDER and VALUES actually passed by OZChannelDoubleInfo's ctor.
 */
export class OZChannelInfo {
  // Layout is opaque until OZChannelInfo is transcribed.  All five doubles + the char* are stored
  // somewhere in the first 0x50 bytes of the object; specific offsets are not yet recovered.
  /**
   * OZChannelInfo(double a0, double a1, double a2, double a3, double a4, char const* s)
   *   @ProChannel 0x?? (mangled __ZN13OZChannelInfoC2EdddddPKc; body not present as a distinct
   *   symbol in nm output — likely inlined or defined in a translation unit not exported).
   * Called from OZChannelDoubleInfo::OZChannelDoubleInfo @0x6a28b with
   *   a0=0.0, a1=100.0, a2=1.0, a3=0.01, a4=1.0, s=""  (values verified via resolve.py const;
   *   see @0xaf518 = 100.0, @0xaf520 = 0.01, @0xaf528 = 1.0, and cstring @0xbc3f8 = "").
   */
  constructor(_a0: number, _a1: number, _a2: number, _a3: number, _a4: number, _s: string) {
    throw new Error(
      "OZChannelInfo::OZChannelInfo(d,d,d,d,d,char const*) @ProChannel not yet transcribed " +
        "(called from OZChannelDoubleInfo::OZChannelDoubleInfo @0x6a28b)",
    );
  }
  /** OZChannelInfo::~OZChannelInfo() @ProChannel — called from ~OZChannelDoubleInfo @0x6a2be (D2 unwind) and @0x6a2e7 (D1 tail). */
  destroy(): void {
    throw new Error("OZChannelInfo::~OZChannelInfo @ProChannel not yet transcribed (called from ~OZChannelDoubleInfo @0x6a2be/0x6a2e7/0x6a301)");
  }
}

/**
 * PCSingleton — helper base/member used by every OZChannel*Info descriptor.  Constructed with a
 * single u32 capacity/hint (0x64 = 100 here).  Frontier: only its ctor/dtor stub addresses in
 * ProChannel's import table are known.
 *
 * Called from:
 *   OZChannelDoubleInfo::OZChannelDoubleInfo @0x6a299  -> stub 0xacb46 -> PCSingleton::PCSingleton(u32)
 *   OZChannelDoubleInfo::~OZChannelDoubleInfo D2 @0x6a2d9 / D0 @0x6a2f9 -> stub 0xacb4c -> PCSingleton::~PCSingleton()
 * (These addresses are the __stubs slots inside ProChannel — the real body lives in whatever
 * framework exports __ZN11PCSingletonC2Ej / __ZN11PCSingletonD2Ev.  Not yet decoded.)
 */
export class PCSingleton {
  /** PCSingleton::PCSingleton(u32) @ProChannel stub 0xacb46 — called with capacity=0x64 from OZChannelDoubleInfo::OZChannelDoubleInfo @0x6a299. */
  constructor(_capacity: number) {
    throw new Error(
      "PCSingleton::PCSingleton(u32) @ProChannel stub 0xacb46 not yet transcribed " +
        "(called from OZChannelDoubleInfo::OZChannelDoubleInfo @0x6a299 with capacity=0x64)",
    );
  }
  /** PCSingleton::~PCSingleton() @ProChannel stub 0xacb4c — called from ~OZChannelDoubleInfo D2 @0x6a2d9 and D0 @0x6a2f9. */
  destroy(): void {
    throw new Error(
      "PCSingleton::~PCSingleton @ProChannel stub 0xacb4c not yet transcribed " +
        "(called from ~OZChannelDoubleInfo @0x6a2d9/0x6a2f9)",
    );
  }
}

// ---------------------------------------------------------------------------------------------
// OZChannelDoubleInfo
// ---------------------------------------------------------------------------------------------

/**
 * OZChannelDoubleInfo — channel metadata descriptor for scalar-double channels.
 * Header vtable installed ptr @0xcad80 (see resolve.py vtable OZChannelDoubleInfo).
 * Only its two destructor slots differ from the OZChannelInfo base vtable.
 */
export class OZChannelDoubleInfo extends OZChannelInfo {
  /**
   * PCSingleton sub-object at +0x50.  Field-initializer here would call the frontier
   * PCSingleton ctor and throw; we hold it as a lazy nullable slot so the class shape typechecks
   * and construction only fails when a caller actually invokes `new OZChannelDoubleInfo()`.
   */
  private _pcSingleton50: PCSingleton | null = null;

  /**
   * OZChannelDoubleInfo::OZChannelDoubleInfo()  @ProChannel 0x6a25c
   * (mangled __ZN19OZChannelDoubleInfoC2Ev; 30 lines, no args).
   *
   * Body @0x6a25c..0x6a2b7:
   *   0x6a266  leaq  0x5218b(%rip), %rsi              ; rsi = cstring @0xbc3f8 = ""     (arg5)
   *   0x6a26d  movsd 0x452a3(%rip), %xmm1             ; xmm1 = *(double*)0xaf518 = 100.0 (arg1)
   *   0x6a275  movsd 0x452a3(%rip), %xmm3             ; xmm3 = *(double*)0xaf520 = 0.01  (arg3)
   *   0x6a27d  movsd 0x452a3(%rip), %xmm2             ; xmm2 = *(double*)0xaf528 = 1.0   (arg2)
   *   0x6a285  xorps %xmm0, %xmm0                     ; xmm0 = 0.0                       (arg0)
   *   0x6a288  movaps %xmm2, %xmm4                    ; xmm4 = xmm2 = 1.0                (arg4)
   *   0x6a28b  callq __ZN13OZChannelInfoC2EdddddPKc   ; OZChannelInfo::OZChannelInfo(
   *                                                   ;   0.0, 100.0, 1.0, 0.01, 1.0, "")
   *   0x6a290  leaq  0x50(%rbx), %rdi                 ; &this->pcSingleton at +0x50
   *   0x6a294  movl  $0x64, %esi                      ; capacity = 100
   *   0x6a299  callq 0xacb46                          ; stub -> PCSingleton::PCSingleton(u32)
   *   0x6a29e  leaq  0x60adb(%rip), %rax              ; rax = vtable+0x10 @0xcad80 (primary)
   *   0x6a2a5  movq  %rax, (%rbx)                     ; *(void**)(this+0x00) = rax
   *   0x6a2a8  leaq  0x60af1(%rip), %rax              ; rax = vtable+0x10 @0xcada0 (PCSingleton)
   *   0x6a2af  movq  %rax, 0x50(%rbx)                 ; *(void**)(this+0x50) = rax
   *   0x6a2b3  popq/popq/popq/retq
   *
   * Unwind pad @0x6a2b8..0x6a2cb: on exception during the PCSingleton ctor, call
   * OZChannelInfo::~OZChannelInfo (@0x6a2be) then _Unwind_Resume (@0x6a2c6 -> stub 0xacaf2).
   *
   * Argument values verified via army/tools/resolve.py const:
   *   @0xaf518  = 100.0                @0xaf520 = 0.01                @0xaf528 = 1.0
   *   cstring @0xbc3f8 = "" (zero-length, single NUL byte).
   */
  constructor() {
    // Base ctor with the six exact values read from the binary — no interpretation.
    // OZChannelInfo::OZChannelInfo(0.0, 100.0, 1.0, 0.01, 1.0, "") — will throw citing the
    // undecoded base ctor address until OZChannelInfo is ported.
    super(0.0, 100.0, 1.0, 0.01, 1.0, "");
    // PCSingleton::PCSingleton(0x64) — frontier stub 0xacb46.  Also throws until ported.
    this._pcSingleton50 = new PCSingleton(0x64);
    // Vtable installs @0x6a2a5 (0xcad80 primary) and @0x6a2af (0xcada0 PCSingleton sub-object)
    // have no direct TS analogue — the vtable is implicit in the class layout.  In C++ this is
    // where the object becomes a "live" OZChannelDoubleInfo (before this its dynamic type is
    // OZChannelInfo, which matters if any of the two ctors above threw).
  }

  /**
   * OZChannelDoubleInfo::~OZChannelDoubleInfo()  @ProChannel 0x6a2cc  (D1 — complete-object dtor,
   * mangled __ZN19OZChannelDoubleInfoD1Ev; 15 lines).
   *
   * Body @0x6a2cc..0x6a2e7:
   *   0x6a2d5  addq  $0x50, %rdi                     ; &this->pcSingleton
   *   0x6a2d9  callq 0xacb4c                          ; stub -> PCSingleton::~PCSingleton()
   *   0x6a2de  movq  %rbx, %rdi                       ; restore this
   *   0x6a2e7  jmp   __ZN13OZChannelInfoD2Ev          ; tail-call OZChannelInfo::~OZChannelInfo()
   *
   * (Reverse of ctor: destroy the PCSingleton sub-object first, then let the base dtor run via
   * tail-jump.  No vtable re-install here — the D1 assumes the object is fully-typed.)
   */
  destroy(): void {
    // Reverse-order destruction; both callees are frontier and will throw.
    if (this._pcSingleton50 !== null) {
      this._pcSingleton50.destroy();
      this._pcSingleton50 = null;
    }
    super.destroy();
  }

  /**
   * OZChannelDoubleInfo::~OZChannelDoubleInfo()  @ProChannel 0x6a2ec  (D0 — deleting dtor,
   * mangled __ZN19OZChannelDoubleInfoD0Ev; 15 lines).  Called via vtable slot *0x08.
   *
   * Body @0x6a2ec..0x6a30f:
   *   0x6a2f5  addq  $0x50, %rdi                     ; &this->pcSingleton
   *   0x6a2f9  callq 0xacb4c                          ; stub -> PCSingleton::~PCSingleton()
   *   0x6a2fe  movq  %rbx, %rdi                       ; restore this
   *   0x6a301  callq __ZN13OZChannelInfoD2Ev          ; OZChannelInfo::~OZChannelInfo()
   *   0x6a306  movq  %rbx, %rdi
   *   0x6a30f  jmp   0xace04                          ; stub -> operator delete(void*)  (__ZdlPv)
   *
   * Identical to D1 except the base dtor is CALL-ed (not tail-jumped) so a final tail-call to
   * operator delete can free the storage.  A TS port has no `operator delete` counterpart, but
   * the shape is preserved as a distinct method for the vtable slot.
   */
  destroy_and_delete(): void {
    // Same body as `destroy()` plus operator delete on the object storage.  In TS this collapses
    // to `destroy()` — the caller then simply drops the reference.  Documented as a separate
    // method so the vtable's D0 slot @0x6a2ec remains traceable.
    this.destroy();
    // operator delete(this) — @ProChannel stub 0xace04 (__ZdlPv).  No TS analogue.
  }
}
