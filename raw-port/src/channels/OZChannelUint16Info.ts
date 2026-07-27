// OZChannelUint16Info — descriptor for a uint16 metadata channel type (ProChannel.framework).
//
// FAITHFUL PORT.  Every method cites its @ProChannel 0xADDR from re/disasm/ProChannel.
// OZChannelUint16Info.*.s.  Every constant cites the address it was read from
// (verified via army/tools/resolve.py const).  Undecoded callees throw citing their addr.
//
// STRUCT LAYOUT (recovered from ctor @0xf5cc + resolve.py vtable):
//   size >= 0x50 + sizeof(PCSingleton) — PCSingleton is a frontier class.
//   +0x00       vtable slot (primary OZChannelInfo/OZChannelUint16Info)   ; set @0xf610 -> 0xcfac8
//   +0x00 .. +0x4F   OZChannelInfo base sub-object (size 0x50)            ; base ctor @0xf5f6
//   +0x50       vtable slot (embedded PCSingleton sub-object)             ; set @0xf61a -> 0xcfae8
//   +0x50 .. +?     PCSingleton member (constructed with capacity 0x64=100 @0xf604)
//
// VTABLE (resolve.py vtable OZChannelUint16Info):
//   vtable @0xcfab8, installed ptr 0xcfac8
//   *0x00 -> 0xf636  OZChannelUint16Info::~OZChannelUint16Info() (D1)
//   *0x08 -> 0xf656  OZChannelUint16Info::~OZChannelUint16Info() (D0)
//   (only the two destructor slots differ from OZChannelInfo — no methods overridden here.)
//
// FRONTIER: OZChannelInfo (base ctor/dtor @__ZN13OZChannelInfoC2EdddddPKc / __ZN13OZChannelInfoD2Ev)
// and PCSingleton (ctor/dtor stubs @0xacb46/0xacb4c) are NOT yet ported.  All construction/
// destruction paths therefore throw citing the FCP source addresses that would need transcription
// first.

// ---------------------------------------------------------------------------------------------
// Frontier stubs.  These exist purely so the OZChannelUint16Info shape typechecks; every real
// use path throws citing the ProChannel address that would need to be decoded first.
// ---------------------------------------------------------------------------------------------

/**
 * OZChannelInfo — base class of every OZChannel*Info descriptor.
 * Ctor signature (from symbol map):
 *   OZChannelInfo::OZChannelInfo(double, double, double, double, double, char const*)
 *   mangled __ZN13OZChannelInfoC2EdddddPKc — body @ProChannel not yet decoded.
 * Dtor:
 *   OZChannelInfo::~OZChannelInfo()  mangled __ZN13OZChannelInfoD2Ev — body @ProChannel
 *   not yet decoded (called from ~OZChannelUint16Info D1 tail-jump @0xf651, D0 call @0xf66b).
 * The 5 doubles are presumed (default, min, max, step, unit-numeric) with the char* being a unit
 * string, but until OZChannelInfo::OZChannelInfo is disassembled we DO NOT NAME them — the port
 * only records the ORDER and VALUES actually passed by OZChannelUint16Info's ctor.
 */
class OZChannelInfo {
  // Layout is opaque until OZChannelInfo is transcribed.  All five doubles + the char* are stored
  // somewhere in the first 0x50 bytes of the object; specific offsets are not yet recovered.
  /**
   * OZChannelInfo(double a0, double a1, double a2, double a3, double a4, char const* s)
   *   @ProChannel __ZN13OZChannelInfoC2EdddddPKc (body not yet disassembled).
   * Called from OZChannelUint16Info::OZChannelUint16Info @0xf5f6 with
   *   a0=0.0, a1=65535.0, a2=1.0, a3=1.0, a4=1.0, s=""  (values verified via resolve.py const;
   *   see @0xaf590 = 65535.0, @0xaf528 = 1.0, and cstring @0xbc3f8 = "" — single NUL byte).
   */
  constructor(_a0: number, _a1: number, _a2: number, _a3: number, _a4: number, _s: string) {
    throw new Error(
      "OZChannelInfo::OZChannelInfo(d,d,d,d,d,char const*) @ProChannel not yet transcribed " +
        "(called from OZChannelUint16Info::OZChannelUint16Info @0xf5f6)",
    );
  }
  /** OZChannelInfo::~OZChannelInfo() @ProChannel __ZN13OZChannelInfoD2Ev — called from ~OZChannelUint16Info D1 tail-jump @0xf651, D0 call @0xf66b, and unwind @0xf629. */
  destroy(): void {
    throw new Error("OZChannelInfo::~OZChannelInfo @ProChannel not yet transcribed (called from ~OZChannelUint16Info @0xf651/0xf66b/0xf629)");
  }
}

/**
 * PCSingleton — helper base/member used by every OZChannel*Info descriptor.  Constructed with a
 * single u32 capacity/hint (0x64 = 100 here).  Frontier: only its ctor/dtor stub addresses in
 * ProChannel's import table are known.
 *
 * Called from:
 *   OZChannelUint16Info::OZChannelUint16Info @0xf604  -> stub 0xacb46 -> PCSingleton::PCSingleton(u32)
 *   OZChannelUint16Info::~OZChannelUint16Info D1 @0xf643 / D0 @0xf663 -> stub 0xacb4c -> PCSingleton::~PCSingleton()
 * (These addresses are the __stubs slots inside ProChannel — the real body lives in whatever
 * framework exports __ZN11PCSingletonC2Ej / __ZN11PCSingletonD2Ev.  Not yet decoded.)
 */
class PCSingleton {
  /** PCSingleton::PCSingleton(u32) @ProChannel stub 0xacb46 — called with capacity=0x64 from OZChannelUint16Info::OZChannelUint16Info @0xf604. */
  constructor(_capacity: number) {
    throw new Error(
      "PCSingleton::PCSingleton(u32) @ProChannel stub 0xacb46 not yet transcribed " +
        "(called from OZChannelUint16Info::OZChannelUint16Info @0xf604 with capacity=0x64)",
    );
  }
  /** PCSingleton::~PCSingleton() @ProChannel stub 0xacb4c — called from ~OZChannelUint16Info D1 @0xf643 and D0 @0xf663. */
  destroy(): void {
    throw new Error(
      "PCSingleton::~PCSingleton @ProChannel stub 0xacb4c not yet transcribed " +
        "(called from ~OZChannelUint16Info @0xf643/0xf663)",
    );
  }
}

// ---------------------------------------------------------------------------------------------
// OZChannelUint16Info
// ---------------------------------------------------------------------------------------------

/**
 * OZChannelUint16Info — channel metadata descriptor for uint16 (0..65535) channels.
 * Header vtable installed ptr @0xcfac8 (see resolve.py vtable OZChannelUint16Info; vtable @0xcfab8).
 * Only its two destructor slots differ from the OZChannelInfo base vtable.
 */
export class OZChannelUint16Info extends OZChannelInfo {
  /**
   * PCSingleton sub-object at +0x50.  Field-initializer here would call the frontier
   * PCSingleton ctor and throw; we hold it as a lazy nullable slot so the class shape typechecks
   * and construction only fails when a caller actually invokes `new OZChannelUint16Info()`.
   */
  private _pcSingleton50: PCSingleton | null = null;

  /**
   * OZChannelUint16Info::OZChannelUint16Info()  @ProChannel 0xf5cc
   * (mangled __ZN19OZChannelUint16InfoC2Ev; 22 lines, no args).
   *
   * Body @0xf5cc..0xf622:
   *   0xf5d6  leaq  0xace1b(%rip), %rsi              ; rsi = cstring @0xbc3f8 = ""       (arg5)
   *   0xf5dd  movsd 0x9ffab(%rip), %xmm1             ; xmm1 = *(double*)0xaf590 = 65535.0 (arg1)
   *   0xf5e5  movsd 0x9ff3b(%rip), %xmm2             ; xmm2 = *(double*)0xaf528 = 1.0    (arg2)
   *   0xf5ed  xorps %xmm0, %xmm0                     ; xmm0 = 0.0                        (arg0)
   *   0xf5f0  movaps %xmm2, %xmm3                    ; xmm3 = xmm2 = 1.0                 (arg3)
   *   0xf5f3  movaps %xmm2, %xmm4                    ; xmm4 = xmm2 = 1.0                 (arg4)
   *   0xf5f6  callq __ZN13OZChannelInfoC2EdddddPKc   ; OZChannelInfo::OZChannelInfo(
   *                                                  ;   0.0, 65535.0, 1.0, 1.0, 1.0, "")
   *   0xf5fb  leaq  0x50(%rbx), %rdi                 ; &this->pcSingleton at +0x50
   *   0xf5ff  movl  $0x64, %esi                      ; capacity = 100
   *   0xf604  callq 0xacb46                          ; stub -> PCSingleton::PCSingleton(u32)
   *   0xf609  leaq  0xc04b8(%rip), %rax              ; rax = vtable+0x10 @0xcfac8 (primary)
   *   0xf610  movq  %rax, (%rbx)                     ; *(void**)(this+0x00) = rax
   *   0xf613  leaq  0xc04ce(%rip), %rax              ; rax = vtable+0x10 @0xcfae8 (PCSingleton)
   *   0xf61a  movq  %rax, 0x50(%rbx)                 ; *(void**)(this+0x50) = rax
   *   0xf61e  popq/popq/popq/retq
   *
   * Unwind pad @0xf623..0xf631: on exception during the PCSingleton ctor, call
   * OZChannelInfo::~OZChannelInfo (@0xf629) then _Unwind_Resume (@0xf631 -> stub 0xacaf2).
   *
   * Argument values verified via army/tools/resolve.py const:
   *   @0xaf590  = 65535.0  (u64=0x40efffe000000000)
   *   @0xaf528  = 1.0      (u64=0x3ff0000000000000)
   *   cstring @0xbc3f8 = "" (zero-length, single NUL byte).
   *
   * Same shape as OZChannelDoubleInfo::OZChannelDoubleInfo @0x6a25c, but with different constants:
   *   Double: (0.0, 100.0,   1.0, 0.01, 1.0, "")
   *   Uint16: (0.0, 65535.0, 1.0, 1.0,  1.0, "")
   * i.e. Uint16 max is the u16 range end (65535) and step is 1 (integer channel).
   */
  constructor() {
    // Base ctor with the six exact values read from the binary — no interpretation.
    // OZChannelInfo::OZChannelInfo(0.0, 65535.0, 1.0, 1.0, 1.0, "") — will throw citing the
    // undecoded base ctor address until OZChannelInfo is ported.
    super(0.0, 65535.0, 1.0, 1.0, 1.0, "");
    // PCSingleton::PCSingleton(0x64) — frontier stub 0xacb46.  Also throws until ported.
    this._pcSingleton50 = new PCSingleton(0x64);
    // Vtable installs @0xf610 (0xcfac8 primary) and @0xf61a (0xcfae8 PCSingleton sub-object)
    // have no direct TS analogue — the vtable is implicit in the class layout.  In C++ this is
    // where the object becomes a "live" OZChannelUint16Info (before this its dynamic type is
    // OZChannelInfo, which matters if any of the two ctors above threw).
  }

  /**
   * OZChannelUint16Info::~OZChannelUint16Info()  @ProChannel 0xf636  (D1 — complete-object dtor,
   * mangled __ZN19OZChannelUint16InfoD1Ev; 12 lines).
   *
   * Body @0xf636..0xf651:
   *   0xf63f  addq  $0x50, %rdi                     ; &this->pcSingleton
   *   0xf643  callq 0xacb4c                         ; stub -> PCSingleton::~PCSingleton()
   *   0xf648  movq  %rbx, %rdi                      ; restore this
   *   0xf651  jmp   __ZN13OZChannelInfoD2Ev         ; tail-call OZChannelInfo::~OZChannelInfo()
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
   * OZChannelUint16Info::~OZChannelUint16Info()  @ProChannel 0xf656  (D0 — deleting dtor,
   * mangled __ZN19OZChannelUint16InfoD0Ev; 15 lines).  Called via vtable slot *0x08.
   *
   * Body @0xf656..0xf679:
   *   0xf65f  addq  $0x50, %rdi                     ; &this->pcSingleton
   *   0xf663  callq 0xacb4c                         ; stub -> PCSingleton::~PCSingleton()
   *   0xf668  movq  %rbx, %rdi                      ; restore this
   *   0xf66b  callq __ZN13OZChannelInfoD2Ev         ; OZChannelInfo::~OZChannelInfo()
   *   0xf670  movq  %rbx, %rdi
   *   0xf679  jmp   0xace04                         ; stub -> operator delete(void*)  (__ZdlPv)
   *
   * Identical to D1 except the base dtor is CALL-ed (not tail-jumped) so a final tail-call to
   * operator delete can free the storage.  A TS port has no `operator delete` counterpart, but
   * the shape is preserved as a distinct method for the vtable slot.
   */
  destroy_and_delete(): void {
    // Same body as `destroy()` plus operator delete on the object storage.  In TS this collapses
    // to `destroy()` — the caller then simply drops the reference.  Documented as a separate
    // method so the vtable's D0 slot @0xf656 remains traceable.
    this.destroy();
    // operator delete(this) — @ProChannel stub 0xace04 (__ZdlPv).  No TS analogue.
  }
}
