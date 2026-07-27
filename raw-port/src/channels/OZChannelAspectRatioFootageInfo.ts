// OZChannelAspectRatioFootageInfo — descriptor for an aspect-ratio-footage channel type
// (ProChannel.framework).
//
// FAITHFUL PORT.  Every method cites its @ProChannel 0xADDR from
// re/disasm/ProChannel.OZChannelAspectRatioFootageInfo.*.s.  Every constant cites the address
// it was read from (verified via army/tools/resolve.py const).  Undecoded callees throw
// citing their addr.
//
// STRUCT LAYOUT (recovered from ctor @0x6780 + resolve.py vtable):
//   size >= 0x50 + sizeof(PCSingleton) — PCSingleton is a frontier class.
//   +0x00       vtable slot (primary OZChannelInfo/OZChannelAspectRatioFootageInfo)  ; set @0x67ce -> 0xccaa8
//   +0x00 .. +0x4F   OZChannelInfo base sub-object (size 0x50)                       ; base ctor @0x67b4
//   +0x50       vtable slot (embedded PCSingleton sub-object)                        ; set @0x67d8 -> 0xccac8
//   +0x50 .. +?     PCSingleton member (constructed with capacity 0x64=100 @0x67c2)
//
// VTABLE (resolve.py vtable OZChannelAspectRatioFootageInfo — installed ptr 0xccaa8,
// vtable sym @0xcca98):
//   *0x00 -> 0x67f4  OZChannelAspectRatioFootageInfo::~OZChannelAspectRatioFootageInfo() (D1)
//   *0x08 -> 0x6814  OZChannelAspectRatioFootageInfo::~OZChannelAspectRatioFootageInfo() (D0)
//   *0x18 -> typeinfo for OZChannelAspectRatioFootageInfo @0xccad8
//   *0x20 -> 0x683c  non-virtual thunk to ~OZChannelAspectRatioFootageInfo (D1)
//   *0x28 -> 0x685a  non-virtual thunk to ~OZChannelAspectRatioFootageInfo (D0)
//   *0x38 -> typeinfo name for OZChannelAspectRatioFootageInfo @0xafc02
//   *0x48 -> typeinfo for OZChannelInfo @0xdcc08 (RTTI base)
//   *0x70 -> typeinfo for OZChannelAspectRatioFootageImpl @0xccb50 (secondary base RTTI)
//   *0x78 -> 0x694c  OZChannelAspectRatioFootageImpl::~OZChannelAspectRatioFootageImpl() (D1)
//   *0x80 -> 0x696c  OZChannelAspectRatioFootageImpl::~OZChannelAspectRatioFootageImpl() (D0)
//   (Only the destructor slots differ from OZChannelInfo; no method overrides here.  The
//   OZChannelAspectRatioFootageImpl slots at 0x78/0x80/0x98/0xa0 belong to the secondary base
//   sub-object and are irrelevant to this class's own methods.)
//
// FRONTIER: OZChannelInfo (base ctor/dtor @__ZN13OZChannelInfoC2EdddddPKc and
// __ZN13OZChannelInfoD2Ev) and PCSingleton (ctor/dtor via stubs @0xacb46/0xacb4c) are NOT yet
// ported.  All construction/destruction paths therefore throw citing the FCP source
// addresses that would need transcription first.

// ---------------------------------------------------------------------------------------------
// Frontier stubs.  These exist purely so the OZChannelAspectRatioFootageInfo shape typechecks;
// every real use path throws citing the ProChannel address that would need to be decoded
// first.  (Deliberately local: PORTING_SPEC Rule 6 forbids sharing helper files; sibling
// descriptors OZChannelGammaFootageInfo / OZChannelDoubleInfo declare their own
// OZChannelInfo/PCSingleton stubs the same way, and each file is self-contained.  Inline
// duplication is the correct choice until OZChannelInfo lands.)
// ---------------------------------------------------------------------------------------------

/**
 * OZChannelInfo — base class of every OZChannel*Info descriptor.
 * Ctor signature (only one seen in the symbol map):
 *   OZChannelInfo::OZChannelInfo(double, double, double, double, double, char const*)
 *   mangled __ZN13OZChannelInfoC2EdddddPKc — body @ProChannel not yet decoded.
 * Dtor:
 *   OZChannelInfo::~OZChannelInfo()  mangled __ZN13OZChannelInfoD2Ev — body not yet decoded.
 * Called from OZChannelAspectRatioFootageInfo::~OZChannelAspectRatioFootageInfo D1 @0x680f
 * (tail-jump) and D0 @0x6829 (call).  The 5 doubles are presumed (default, min, max, step,
 * unit-numeric) with the char* being a unit string, but until OZChannelInfo::OZChannelInfo is
 * disassembled we DO NOT NAME them — the port only records the ORDER and VALUES actually
 * passed by OZChannelAspectRatioFootageInfo's ctor.
 */
class OZChannelInfo {
  // Layout is opaque until OZChannelInfo is transcribed.  All five doubles + the char* are
  // stored somewhere in the first 0x50 bytes of the object; specific offsets are not yet
  // recovered.
  /**
   * OZChannelInfo(double a0, double a1, double a2, double a3, double a4, char const* s)
   *   @ProChannel __ZN13OZChannelInfoC2EdddddPKc (body not present as a distinct symbol in
   *   nm output — likely inlined or defined in a translation unit not exported).
   * Called from OZChannelAspectRatioFootageInfo::OZChannelAspectRatioFootageInfo @0x67b4 with
   *   a0=0.0, a1=3.0, a2=0.0001, a3=0.1, a4=1.0, s=""
   *   (values verified via resolve.py const:
   *     @0xaf580 = 3.0, @0xaf588 = 0.0001, @0xaf510 = 0.1, @0xaf528 = 1.0,
   *     xmm0 zeroed via xorps @0x67b1, and cstring @0xbc3f8 = "").
   */
  constructor(_a0: number, _a1: number, _a2: number, _a3: number, _a4: number, _s: string) {
    throw new Error(
      "OZChannelInfo::OZChannelInfo(d,d,d,d,d,char const*) @ProChannel not yet transcribed " +
        "(called from OZChannelAspectRatioFootageInfo::OZChannelAspectRatioFootageInfo @0x67b4)",
    );
  }
  /** OZChannelInfo::~OZChannelInfo() @ProChannel __ZN13OZChannelInfoD2Ev — called from ~OZChannelAspectRatioFootageInfo D1 @0x680f (tail-jump) and D0 @0x6829 (call). */
  destroy(): void {
    throw new Error(
      "OZChannelInfo::~OZChannelInfo @ProChannel __ZN13OZChannelInfoD2Ev not yet transcribed " +
        "(called from ~OZChannelAspectRatioFootageInfo @0x680f (D1 tail) / @0x6829 (D0 call))",
    );
  }
}

/**
 * PCSingleton — helper base/member used by every OZChannel*Info descriptor.  Constructed
 * with a single u32 capacity/hint (0x64 = 100 here).  Frontier: only its ctor/dtor stub
 * addresses in ProChannel's import table are known.
 *
 * Called from:
 *   OZChannelAspectRatioFootageInfo::OZChannelAspectRatioFootageInfo @0x67c2  -> stub 0xacb46 -> PCSingleton::PCSingleton(u32)
 *   OZChannelAspectRatioFootageInfo::~OZChannelAspectRatioFootageInfo D1 @0x6801 -> stub 0xacb4c -> PCSingleton::~PCSingleton()
 *   OZChannelAspectRatioFootageInfo::~OZChannelAspectRatioFootageInfo D0 @0x6821 -> stub 0xacb4c -> PCSingleton::~PCSingleton()
 * (These addresses are the __stubs slots inside ProChannel — the real body lives in whatever
 * framework exports __ZN11PCSingletonC2Ej / __ZN11PCSingletonD2Ev.  Not yet decoded.)
 */
class PCSingleton {
  /** PCSingleton::PCSingleton(u32) @ProChannel stub 0xacb46 — called with capacity=0x64 from OZChannelAspectRatioFootageInfo::OZChannelAspectRatioFootageInfo @0x67c2. */
  constructor(_capacity: number) {
    throw new Error(
      "PCSingleton::PCSingleton(u32) @ProChannel stub 0xacb46 not yet transcribed " +
        "(called from OZChannelAspectRatioFootageInfo::OZChannelAspectRatioFootageInfo @0x67c2 with capacity=0x64)",
    );
  }
  /** PCSingleton::~PCSingleton() @ProChannel stub 0xacb4c — called from ~OZChannelAspectRatioFootageInfo D1 @0x6801 and D0 @0x6821. */
  destroy(): void {
    throw new Error(
      "PCSingleton::~PCSingleton @ProChannel stub 0xacb4c not yet transcribed " +
        "(called from ~OZChannelAspectRatioFootageInfo @0x6801 (D1) / @0x6821 (D0))",
    );
  }
}

// ---------------------------------------------------------------------------------------------
// OZChannelAspectRatioFootageInfo
// ---------------------------------------------------------------------------------------------

/**
 * OZChannelAspectRatioFootageInfo — channel metadata descriptor for aspect-ratio-footage
 * channels.  Header vtable installed ptr @0xccaa8 (see resolve.py vtable
 * OZChannelAspectRatioFootageInfo).  Only its two destructor slots differ from the
 * OZChannelInfo base vtable at this class's own offset range; the vtable also carries a
 * secondary-base sub-object for OZChannelAspectRatioFootageImpl starting at *0x70, but that
 * belongs to that secondary base, not to methods of this class.
 *
 * NOTE (relationship to OZChannelGammaFootageInfo): the ctor body of this class is
 * byte-for-byte parallel to OZChannelGammaFootageInfo::OZChannelGammaFootageInfo @0x6f7a and
 * passes the *identical* five doubles (0.0, 3.0, 0.0001, 0.1, 1.0) and empty string to the
 * shared OZChannelInfo base ctor.  It reads them from the SAME constant-pool slots @0xaf580
 * / @0xaf588 / @0xaf510 / @0xaf528.  Only the vtable installed-ptrs differ (0xccaa8/0xccac8
 * for aspect-ratio vs 0xcccc0/0xccce0 for gamma), which is how the two descriptors are
 * distinguished at runtime despite carrying the same numeric range.  This match was verified
 * by direct read of the disassembly — it is not a paraphrase.
 */
export class OZChannelAspectRatioFootageInfo extends OZChannelInfo {
  /**
   * PCSingleton sub-object at +0x50.  Field-initializer here would call the frontier
   * PCSingleton ctor and throw; we hold it as a lazy nullable slot so the class shape
   * typechecks and construction only fails when a caller actually invokes
   * `new OZChannelAspectRatioFootageInfo()`.
   */
  private _pcSingleton50: PCSingleton | null = null;

  /**
   * OZChannelAspectRatioFootageInfo::OZChannelAspectRatioFootageInfo()  @ProChannel 0x6780
   * (mangled __ZN31OZChannelAspectRatioFootageInfoC2Ev; 29 lines, no args).
   *
   * Body @0x6780..0x67e0:
   *   0x678a  leaq  0xb5c67(%rip), %rsi              ; rsi = cstring @0xbc3f8 = ""      (arg6)
   *   0x6791  movsd 0xa8de7(%rip), %xmm1             ; xmm1 = *(double*)0xaf580 = 3.0    (arg2)
   *   0x6799  movsd 0xa8de7(%rip), %xmm2             ; xmm2 = *(double*)0xaf588 = 0.0001 (arg3)
   *   0x67a1  movsd 0xa8d67(%rip), %xmm3             ; xmm3 = *(double*)0xaf510 = 0.1    (arg4)
   *   0x67a9  movsd 0xa8d77(%rip), %xmm4             ; xmm4 = *(double*)0xaf528 = 1.0    (arg5)
   *   0x67b1  xorps %xmm0, %xmm0                     ; xmm0 = 0.0                        (arg1)
   *   0x67b4  callq __ZN13OZChannelInfoC2EdddddPKc   ; OZChannelInfo::OZChannelInfo(
   *                                                  ;   0.0, 3.0, 0.0001, 0.1, 1.0, "")
   *   0x67b9  leaq  0x50(%rbx), %rdi                 ; &this->pcSingleton at +0x50
   *   0x67bd  movl  $0x64, %esi                      ; capacity = 100
   *   0x67c2  callq 0xacb46                          ; stub -> PCSingleton::PCSingleton(u32)
   *   0x67c7  leaq  0xc62da(%rip), %rax              ; rax = vtable installed ptr @0xccaa8 (primary)
   *   0x67ce  movq  %rax, (%rbx)                     ; *(void**)(this+0x00) = rax
   *   0x67d1  leaq  0xc62f0(%rip), %rax              ; rax = vtable installed ptr @0xccac8 (PCSingleton sub-object)
   *   0x67d8  movq  %rax, 0x50(%rbx)                 ; *(void**)(this+0x50) = rax
   *   0x67dc  popq/popq/popq/retq
   *
   * Unwind pad @0x67e1..0x67f4-: on exception during the PCSingleton ctor, call
   * OZChannelInfo::~OZChannelInfo (@0x67e7) then _Unwind_Resume (@0x67ef -> stub 0xacaf2).
   *
   * Argument values verified via army/tools/resolve.py const:
   *   @0xaf580  = 3.0            @0xaf588 = 0.0001
   *   @0xaf510  = 0.1            @0xaf528 = 1.0
   *   xmm0 zeroed via xorps @0x67b1 (0.0).
   *   cstring @0xbc3f8 = "" (zero-length, single NUL byte; verified via direct byte read of
   *   the thin x86_64 image at that VA).
   *
   * NOTE on the constant addresses: this class reads the *identical* four constant-pool
   * slots as OZChannelGammaFootageInfo (which reads @0xaf580 / @0xaf588 / @0xaf510 /
   * @0xaf528 via the same movsd sequence at 0x6f8b / 0x6f93 / 0x6f9b / 0x6fa3).  This is a
   * direct read of the binary — the four RIP-relative disps come out to the same absolute
   * VAs, so the two descriptors share exactly the same numeric range and unit string.  What
   * distinguishes an aspect-ratio-footage channel from a gamma-footage channel at runtime is
   * the vtable installed-ptr (0xccaa8 here vs 0xcccc0 for gamma), not the six ctor args.
   */
  constructor() {
    // Base ctor with the six exact values read from the binary — no interpretation.
    // OZChannelInfo::OZChannelInfo(0.0, 3.0, 0.0001, 0.1, 1.0, "") — will throw citing the
    // undecoded base ctor address until OZChannelInfo is ported.
    super(0.0, 3.0, 0.0001, 0.1, 1.0, "");
    // PCSingleton::PCSingleton(0x64) — frontier stub 0xacb46.  Also throws until ported.
    this._pcSingleton50 = new PCSingleton(0x64);
    // Vtable installs @0x67ce (0xccaa8 primary) and @0x67d8 (0xccac8 PCSingleton sub-object)
    // have no direct TS analogue — the vtable is implicit in the class layout.  In C++ this
    // is where the object becomes a "live" OZChannelAspectRatioFootageInfo (before this its
    // dynamic type is OZChannelInfo, which matters if any of the two ctors above threw).
  }

  /**
   * OZChannelAspectRatioFootageInfo::~OZChannelAspectRatioFootageInfo()  @ProChannel 0x67f4
   * (D1 — complete-object dtor, mangled __ZN31OZChannelAspectRatioFootageInfoD1Ev;
   * 12 lines).
   *
   * Body @0x67f4..0x680f:
   *   0x67fd  addq  $0x50, %rdi                     ; &this->pcSingleton
   *   0x6801  callq 0xacb4c                          ; stub -> PCSingleton::~PCSingleton()
   *   0x6806  movq  %rbx, %rdi                       ; restore this
   *   0x680f  jmp   __ZN13OZChannelInfoD2Ev          ; tail-call OZChannelInfo::~OZChannelInfo()
   *
   * (Reverse of ctor: destroy the PCSingleton sub-object first, then let the base dtor run
   * via tail-jump.  No vtable re-install here — the D1 assumes the object is fully-typed.)
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
   * OZChannelAspectRatioFootageInfo::~OZChannelAspectRatioFootageInfo()  @ProChannel 0x6814
   * (D0 — deleting dtor, mangled __ZN31OZChannelAspectRatioFootageInfoD0Ev; 15 lines).
   * Called via vtable slot *0x08.
   *
   * Body @0x6814..0x6837:
   *   0x681d  addq  $0x50, %rdi                     ; &this->pcSingleton
   *   0x6821  callq 0xacb4c                          ; stub -> PCSingleton::~PCSingleton()
   *   0x6826  movq  %rbx, %rdi                       ; restore this
   *   0x6829  callq __ZN13OZChannelInfoD2Ev          ; OZChannelInfo::~OZChannelInfo()
   *   0x682e  movq  %rbx, %rdi
   *   0x6837  jmp   0xace04                          ; stub -> operator delete(void*) (__ZdlPv)
   *
   * Identical to D1 except the base dtor is CALL-ed (not tail-jumped) so a final tail-call
   * to operator delete can free the storage.  A TS port has no `operator delete`
   * counterpart, but the shape is preserved as a distinct method for the vtable slot.
   */
  destroy_and_delete(): void {
    // Same body as `destroy()` plus operator delete on the object storage.  In TS this
    // collapses to `destroy()` — the caller then simply drops the reference.  Documented as
    // a separate method so the vtable's D0 slot @0x6814 remains traceable.
    this.destroy();
    // operator delete(this) — @ProChannel stub 0xace04 (__ZdlPv).  No TS analogue.
  }
}
