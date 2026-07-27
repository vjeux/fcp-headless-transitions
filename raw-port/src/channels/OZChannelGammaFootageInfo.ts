// OZChannelGammaFootageInfo — descriptor for a gamma-footage channel type (ProChannel.framework).
//
// FAITHFUL PORT.  Every method cites its @ProChannel 0xADDR from
// re/disasm/ProChannel.OZChannelGammaFootageInfo.*.s.  Every constant cites the address it was
// read from (verified via army/tools/resolve.py const).  Undecoded callees throw citing their
// addr.
//
// STRUCT LAYOUT (recovered from ctor @0x6f7a + resolve.py vtable):
//   size >= 0x50 + sizeof(PCSingleton) — PCSingleton is a frontier class.
//   +0x00       vtable slot (primary OZChannelInfo/OZChannelGammaFootageInfo)  ; set @0x6fc8 -> 0xcccc0
//   +0x00 .. +0x4F   OZChannelInfo base sub-object (size 0x50)                 ; base ctor @0x6fae
//   +0x50       vtable slot (embedded PCSingleton sub-object)                  ; set @0x6fd2 -> 0xccce0
//   +0x50 .. +?     PCSingleton member (constructed with capacity 0x64=100 @0x6fbc)
//
// VTABLE (resolve.py vtable OZChannelGammaFootageInfo — installed ptr 0xcccc0, vtable sym 0xcccb0):
//   *0x00 -> 0x6fee  OZChannelGammaFootageInfo::~OZChannelGammaFootageInfo() (D1)
//   *0x08 -> 0x700e  OZChannelGammaFootageInfo::~OZChannelGammaFootageInfo() (D0)
//   *0x18 -> typeinfo for OZChannelGammaFootageInfo @0xcccf0
//   *0x48 -> typeinfo for OZChannelInfo @0xdcc08 (RTTI base)
//   *0x70 -> typeinfo for OZChannelGammaFootageImpl @0xccd68 (secondary base RTTI)
//   *0x78 -> 0x713c  OZChannelGammaFootageImpl::~OZChannelGammaFootageImpl() (D1)
//   *0x80 -> 0x715c  OZChannelGammaFootageImpl::~OZChannelGammaFootageImpl() (D0)
//   (Only the destructor slots differ from OZChannelInfo; no method overrides here.  The
//   OZChannelGammaFootageImpl slots at 0x78/0x80/0x98/0xa0 belong to the secondary base
//   sub-object and are irrelevant to this class's own methods.)
//
// FRONTIER: OZChannelInfo (base ctor/dtor @__ZN13OZChannelInfoC2EdddddPKc and
// __ZN13OZChannelInfoD2Ev) and PCSingleton (ctor/dtor via stubs @0xacb46/0xacb4c) are NOT yet
// ported.  All construction/destruction paths therefore throw citing the FCP source addresses
// that would need transcription first.

// ---------------------------------------------------------------------------------------------
// Frontier stubs.  These exist purely so the OZChannelGammaFootageInfo shape typechecks; every
// real use path throws citing the ProChannel address that would need to be decoded first.
// (Deliberately local: PORTING_SPEC Rule 6 forbids sharing helper files; OZChannelDoubleInfo
// declares its own OZChannelInfo/PCSingleton stubs the same way, and both files are self-
// contained.  Inline duplication is the correct choice until OZChannelInfo lands.)
// ---------------------------------------------------------------------------------------------

/**
 * OZChannelInfo — base class of every OZChannel*Info descriptor.
 * Ctor signature (only one seen in the symbol map):
 *   OZChannelInfo::OZChannelInfo(double, double, double, double, double, char const*)
 *   mangled __ZN13OZChannelInfoC2EdddddPKc — body @ProChannel not yet decoded.
 * Dtor:
 *   OZChannelInfo::~OZChannelInfo()  mangled __ZN13OZChannelInfoD2Ev — body not yet decoded.
 * Called from OZChannelGammaFootageInfo::~OZChannelGammaFootageInfo D1 @0x7009 (tail-jump) and
 * D0 @0x7023 (call).  The 5 doubles are presumed (default, min, max, step, unit-numeric) with
 * the char* being a unit string, but until OZChannelInfo::OZChannelInfo is disassembled we DO
 * NOT NAME them — the port only records the ORDER and VALUES actually passed by
 * OZChannelGammaFootageInfo's ctor.
 */
class OZChannelInfo {
  // Layout is opaque until OZChannelInfo is transcribed.  All five doubles + the char* are
  // stored somewhere in the first 0x50 bytes of the object; specific offsets are not yet
  // recovered.
  /**
   * OZChannelInfo(double a0, double a1, double a2, double a3, double a4, char const* s)
   *   @ProChannel __ZN13OZChannelInfoC2EdddddPKc (body not present as a distinct symbol in nm
   *   output — likely inlined or defined in a translation unit not exported).
   * Called from OZChannelGammaFootageInfo::OZChannelGammaFootageInfo @0x6fae with
   *   a0=0.0, a1=3.0, a2=0.0001, a3=0.1, a4=1.0, s=""
   *   (values verified via resolve.py const:
   *     @0xaf580 = 3.0, @0xaf588 = 0.0001, @0xaf510 = 0.1, @0xaf528 = 1.0,
   *     xmm0 zeroed via xorps @0x6fab, and cstring @0xbc3f8 = "").
   */
  constructor(_a0: number, _a1: number, _a2: number, _a3: number, _a4: number, _s: string) {
    throw new Error(
      "OZChannelInfo::OZChannelInfo(d,d,d,d,d,char const*) @ProChannel not yet transcribed " +
        "(called from OZChannelGammaFootageInfo::OZChannelGammaFootageInfo @0x6fae)",
    );
  }
  /** OZChannelInfo::~OZChannelInfo() @ProChannel __ZN13OZChannelInfoD2Ev — called from ~OZChannelGammaFootageInfo D1 @0x7009 (tail-jump) and D0 @0x7023 (call). */
  destroy(): void {
    throw new Error(
      "OZChannelInfo::~OZChannelInfo @ProChannel __ZN13OZChannelInfoD2Ev not yet transcribed " +
        "(called from ~OZChannelGammaFootageInfo @0x7009 (D1 tail) / @0x7023 (D0 call))",
    );
  }
}

/**
 * PCSingleton — helper base/member used by every OZChannel*Info descriptor.  Constructed with a
 * single u32 capacity/hint (0x64 = 100 here).  Frontier: only its ctor/dtor stub addresses in
 * ProChannel's import table are known.
 *
 * Called from:
 *   OZChannelGammaFootageInfo::OZChannelGammaFootageInfo @0x6fbc  -> stub 0xacb46 -> PCSingleton::PCSingleton(u32)
 *   OZChannelGammaFootageInfo::~OZChannelGammaFootageInfo D1 @0x6ffb -> stub 0xacb4c -> PCSingleton::~PCSingleton()
 *   OZChannelGammaFootageInfo::~OZChannelGammaFootageInfo D0 @0x701b -> stub 0xacb4c -> PCSingleton::~PCSingleton()
 * (These addresses are the __stubs slots inside ProChannel — the real body lives in whatever
 * framework exports __ZN11PCSingletonC2Ej / __ZN11PCSingletonD2Ev.  Not yet decoded.)
 */
class PCSingleton {
  /** PCSingleton::PCSingleton(u32) @ProChannel stub 0xacb46 — called with capacity=0x64 from OZChannelGammaFootageInfo::OZChannelGammaFootageInfo @0x6fbc. */
  constructor(_capacity: number) {
    throw new Error(
      "PCSingleton::PCSingleton(u32) @ProChannel stub 0xacb46 not yet transcribed " +
        "(called from OZChannelGammaFootageInfo::OZChannelGammaFootageInfo @0x6fbc with capacity=0x64)",
    );
  }
  /** PCSingleton::~PCSingleton() @ProChannel stub 0xacb4c — called from ~OZChannelGammaFootageInfo D1 @0x6ffb and D0 @0x701b. */
  destroy(): void {
    throw new Error(
      "PCSingleton::~PCSingleton @ProChannel stub 0xacb4c not yet transcribed " +
        "(called from ~OZChannelGammaFootageInfo @0x6ffb (D1) / @0x701b (D0))",
    );
  }
}

// ---------------------------------------------------------------------------------------------
// OZChannelGammaFootageInfo
// ---------------------------------------------------------------------------------------------

/**
 * OZChannelGammaFootageInfo — channel metadata descriptor for gamma-footage channels.
 * Header vtable installed ptr @0xcccc0 (see resolve.py vtable OZChannelGammaFootageInfo).
 * Only its two destructor slots differ from the OZChannelInfo base vtable at this class's own
 * offset range; the vtable also carries a secondary-base sub-object for OZChannelGammaFootageImpl
 * starting at *0x70, but that belongs to that secondary base, not to methods of this class.
 */
export class OZChannelGammaFootageInfo extends OZChannelInfo {
  /**
   * PCSingleton sub-object at +0x50.  Field-initializer here would call the frontier
   * PCSingleton ctor and throw; we hold it as a lazy nullable slot so the class shape
   * typechecks and construction only fails when a caller actually invokes
   * `new OZChannelGammaFootageInfo()`.
   */
  private _pcSingleton50: PCSingleton | null = null;

  /**
   * OZChannelGammaFootageInfo::OZChannelGammaFootageInfo()  @ProChannel 0x6f7a
   * (mangled __ZN25OZChannelGammaFootageInfoC2Ev; 29 lines, no args).
   *
   * Body @0x6f7a..0x6fda:
   *   0x6f84  leaq  0xb546d(%rip), %rsi              ; rsi = cstring @0xbc3f8 = ""     (arg6)
   *   0x6f8b  movsd 0xa85ed(%rip), %xmm1             ; xmm1 = *(double*)0xaf580 = 3.0   (arg2)
   *   0x6f93  movsd 0xa85ed(%rip), %xmm2             ; xmm2 = *(double*)0xaf588 = 0.0001(arg3)
   *   0x6f9b  movsd 0xa856d(%rip), %xmm3             ; xmm3 = *(double*)0xaf510 = 0.1   (arg4)
   *   0x6fa3  movsd 0xa857d(%rip), %xmm4             ; xmm4 = *(double*)0xaf528 = 1.0   (arg5)
   *   0x6fab  xorps %xmm0, %xmm0                     ; xmm0 = 0.0                       (arg1)
   *   0x6fae  callq __ZN13OZChannelInfoC2EdddddPKc   ; OZChannelInfo::OZChannelInfo(
   *                                                  ;   0.0, 3.0, 0.0001, 0.1, 1.0, "")
   *   0x6fb3  leaq  0x50(%rbx), %rdi                 ; &this->pcSingleton at +0x50
   *   0x6fb7  movl  $0x64, %esi                      ; capacity = 100
   *   0x6fbc  callq 0xacb46                          ; stub -> PCSingleton::PCSingleton(u32)
   *   0x6fc1  leaq  0xc5cf8(%rip), %rax              ; rax = vtable installed ptr @0xcccc0 (primary)
   *   0x6fc8  movq  %rax, (%rbx)                     ; *(void**)(this+0x00) = rax
   *   0x6fcb  leaq  0xc5d0e(%rip), %rax              ; rax = vtable installed ptr @0xccce0 (PCSingleton sub-object)
   *   0x6fd2  movq  %rax, 0x50(%rbx)                 ; *(void**)(this+0x50) = rax
   *   0x6fd6  popq/popq/popq/retq
   *
   * Unwind pad @0x6fdb..0x6fee-: on exception during the PCSingleton ctor, call
   * OZChannelInfo::~OZChannelInfo (@0x6fe1) then _Unwind_Resume (@0x6fe9 -> stub 0xacaf2).
   *
   * Argument values verified via army/tools/resolve.py const:
   *   @0xaf580  = 3.0            @0xaf588 = 0.0001
   *   @0xaf510  = 0.1            @0xaf528 = 1.0
   *   xmm0 zeroed via xorps @0x6fab (0.0).
   *   cstring @0xbc3f8 = "" (zero-length, single NUL byte; verified via otool -s __cstring).
   *
   * NOTE on the constant addresses: two of the four RIP-relative doubles used here are the
   * SAME literals used by OZChannelDoubleInfo (@0xaf528 = 1.0 is shared).  The other two —
   * @0xaf580 = 3.0 and @0xaf588 = 0.0001 — are unique to the gamma descriptor (a different max
   * range and a finer step than OZChannelDoubleInfo's 100.0/0.01).  @0xaf510 = 0.1 differs
   * from OZChannelDoubleInfo's @0xaf518 = 100.0 despite being nearby in the constant pool.
   */
  constructor() {
    // Base ctor with the six exact values read from the binary — no interpretation.
    // OZChannelInfo::OZChannelInfo(0.0, 3.0, 0.0001, 0.1, 1.0, "") — will throw citing the
    // undecoded base ctor address until OZChannelInfo is ported.
    super(0.0, 3.0, 0.0001, 0.1, 1.0, "");
    // PCSingleton::PCSingleton(0x64) — frontier stub 0xacb46.  Also throws until ported.
    this._pcSingleton50 = new PCSingleton(0x64);
    // Vtable installs @0x6fc8 (0xcccc0 primary) and @0x6fd2 (0xccce0 PCSingleton sub-object)
    // have no direct TS analogue — the vtable is implicit in the class layout.  In C++ this is
    // where the object becomes a "live" OZChannelGammaFootageInfo (before this its dynamic
    // type is OZChannelInfo, which matters if any of the two ctors above threw).
  }

  /**
   * OZChannelGammaFootageInfo::~OZChannelGammaFootageInfo()  @ProChannel 0x6fee  (D1 —
   * complete-object dtor, mangled __ZN25OZChannelGammaFootageInfoD1Ev; 12 lines).
   *
   * Body @0x6fee..0x7009:
   *   0x6ff7  addq  $0x50, %rdi                     ; &this->pcSingleton
   *   0x6ffb  callq 0xacb4c                          ; stub -> PCSingleton::~PCSingleton()
   *   0x7000  movq  %rbx, %rdi                       ; restore this
   *   0x7009  jmp   __ZN13OZChannelInfoD2Ev          ; tail-call OZChannelInfo::~OZChannelInfo()
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
   * OZChannelGammaFootageInfo::~OZChannelGammaFootageInfo()  @ProChannel 0x700e  (D0 —
   * deleting dtor, mangled __ZN25OZChannelGammaFootageInfoD0Ev; 15 lines).  Called via vtable
   * slot *0x08.
   *
   * Body @0x700e..0x7031:
   *   0x7017  addq  $0x50, %rdi                     ; &this->pcSingleton
   *   0x701b  callq 0xacb4c                          ; stub -> PCSingleton::~PCSingleton()
   *   0x7020  movq  %rbx, %rdi                       ; restore this
   *   0x7023  callq __ZN13OZChannelInfoD2Ev          ; OZChannelInfo::~OZChannelInfo()
   *   0x7028  movq  %rbx, %rdi
   *   0x7031  jmp   0xace04                          ; stub -> operator delete(void*) (__ZdlPv)
   *
   * Identical to D1 except the base dtor is CALL-ed (not tail-jumped) so a final tail-call to
   * operator delete can free the storage.  A TS port has no `operator delete` counterpart, but
   * the shape is preserved as a distinct method for the vtable slot.
   */
  destroy_and_delete(): void {
    // Same body as `destroy()` plus operator delete on the object storage.  In TS this
    // collapses to `destroy()` — the caller then simply drops the reference.  Documented as a
    // separate method so the vtable's D0 slot @0x700e remains traceable.
    this.destroy();
    // operator delete(this) — @ProChannel stub 0xace04 (__ZdlPv).  No TS analogue.
  }
}
