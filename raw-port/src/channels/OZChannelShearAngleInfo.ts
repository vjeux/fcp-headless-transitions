// OZChannelShearAngleInfo — shear-angle channel metadata descriptor. ProChannel.framework.
//
// A tiny concrete OZChannelInfo subclass: it does nothing at runtime beyond
// wiring five constants + a unit-suffix string into the OZChannelInfo base
// subobject, and constructing an embedded PCSingleton at +0x50. There are no
// observable accessors of its own — every method except the ctor & dtors is
// inherited from OZChannelInfo. The whole class exists so `OZChannelShearAngle`
// (the "Shear Angle" channel factory family) has a shared, statically-shaped
// description object it can hand to shear-angle-valued channels.
//
// This class is a peer of OZChannelAngleInfo — same shape, same PCSingleton
// capacity, same unit suffix, same displayScale — differing ONLY in min/max:
// where OZChannelAngleInfo clamps to ±FLT_MAX (i.e. unbounded), this class
// clamps a shear angle to the closed range [-π/2, +π/2].
//
// Symbols (from nm on ProChannel, x86_64):
//   __ZN23OZChannelShearAngleInfoC2Ev  OZChannelShearAngleInfo::OZChannelShearAngleInfo()  @0x578c
//   __ZN23OZChannelShearAngleInfoD1Ev  OZChannelShearAngleInfo::~OZChannelShearAngleInfo() (base)     @0x5806
//   __ZN23OZChannelShearAngleInfoD0Ev  OZChannelShearAngleInfo::~OZChannelShearAngleInfo() (deleting) @0x5826
//
// Struct layout — recovered from the ctor:
//   +0x00                vtable ptr    (installed as &__ZTV23OZChannelShearAngleInfo + 0x10,
//                                       resolved to 0xcc678 — see mov %rax,(%rbx) @0x57df)
//   +0x00..+0x50         OZChannelInfo base subobject
//                        (constructed via
//                         __ZN13OZChannelInfoC2EdddddPKc  @ProChannel — see callq @0x57c5
//                         with args xmm0..xmm4 + rsi below)
//   +0x50                vtable-2 ptr  (secondary vtable / thunks; installed as
//                                       &__ZTV23OZChannelShearAngleInfo + 0x30, resolved to
//                                       0xcc698 — see mov %rax,0x50(%rbx) @0x57e9)
//   +0x50..              PCSingleton subobject
//                        (constructed via
//                         __ZN11PCSingletonC2Ej  @ProChannel with capacity=0x64 (100)
//                         — see callq stub @0x57d3 and movl $0x64,%esi @0x57ce)
//
// The primary vtable (__ZTV23OZChannelShearAngleInfo @0xcc668; installed ptr 0xcc678
// = base+0x10) and the secondary/thunk-table pointer at base+0x30 = 0xcc698 exist
// to satisfy C++ dispatch for the OZChannelInfo interface + the OZChannelImpl-side
// subobject at +0x50 (mirroring the OZChannelAngleInfo pattern). Those tables have
// no runtime observable effect from TS: dispatch is handled by JS method resolution.
//
// Frontier callees (NOT transcribed yet in the port; documented and stubbed if reached):
//   OZChannelInfo::OZChannelInfo(double, double, double, double, double, char const*)
//                                                                       @ProChannel (see @0x57c5)
//   OZChannelInfo::~OZChannelInfo()                                     @ProChannel (see @0x57f8 / @0x5821 / @0x583b)
//   PCSingleton::PCSingleton(unsigned int)                              @ProChannel (stub  @0xacb46)
//   PCSingleton::~PCSingleton()                                         @ProChannel (stub  @0xacb4c)
//   operator delete(void*)                                              (stub          @0xace04)

// ─── Constants ────────────────────────────────────────────────────────────────
// All five doubles are 8-byte RIP-relative loads at ctor @0x579d/a5/ad/b5/bd. Each
// movsd instruction is 8 bytes long; the resolved data addresses (0xaf558..0xaf578)
// were dumped bit-exact via `resolve.py ProChannel const`:
//
//   xmm0 @0x579d  -> u64 0xbff921fb54442d18  = -1.5707963267948966       (min: -π/2)
//   xmm1 @0x57a5  -> u64 0x3ff921fb54442d18  =  1.5707963267948966       (max: +π/2)
//   xmm2 @0x57ad  -> u64 0x3f91df46a2529d39  =  0.017453292519943295     (deg2rad(1°)     — coarse step)
//   xmm3 @0x57b5  -> u64 0x3f26e05a695f8191  =  0.00017453292519943296   (deg2rad(0.01°)  — fine step)
//   xmm4 @0x57bd  -> u64 0x404ca5dc1a63c1f8  =  57.29577951308232        (180/π           — display scale)
//
// Note the min/max pair (xmm0, xmm1) SHARE the same 8-byte magnitude (|π/2|); the
// sign of xmm0 is the only distinguishing bit. The three step/scale constants at
// 0xaf558/60/68 are literally the SAME doubles referenced by OZChannelAngleInfo —
// the ctor is loading from the same shared literal pool.
//
// The unit-suffix string @0x5796 (leaq 0xb6c5c(%rip),%rsi -> 0xbc3f9) is the two-byte
// UTF-8 sequence 0xC2 0xB0 0x00, i.e. "°" (U+00B0 DEGREE SIGN) — confirmed by the
// literal-pool comment "\302\260" from otool and by dumping bytes at 0xbc3f9.
//
// Semantics (naming inferred from OZChannelInfo's parameter list order encoded in its
// mangled ctor __ZN13OZChannelInfoC2EdddddPKc — five doubles + a C-string):
//   arg1 xmm0 -> `min`             (channel minimum value, in radians  = -π/2)
//   arg2 xmm1 -> `max`             (channel maximum value, in radians  = +π/2)
//   arg3 xmm2 -> `stepCoarse`      (large slider step, radians          = 1°)
//   arg4 xmm3 -> `stepFine`        (fine slider step, radians           = 0.01°)
//   arg5 xmm4 -> `displayScale`    (unit scale used when formatting for the UI: rad*scale = deg)
//   arg6 rsi  -> `unitSuffix`      ("°")

export const OZ_CHANNEL_SHEAR_ANGLE_INFO_MIN_RAD         = -1.5707963267948966;      // @0xaf570  (-π/2)
export const OZ_CHANNEL_SHEAR_ANGLE_INFO_MAX_RAD         =  1.5707963267948966;      // @0xaf578  (+π/2)
export const OZ_CHANNEL_SHEAR_ANGLE_INFO_STEP_COARSE_RAD =  0.017453292519943295;    // @0xaf558  (deg2rad(1°))
export const OZ_CHANNEL_SHEAR_ANGLE_INFO_STEP_FINE_RAD   =  0.00017453292519943296;  // @0xaf560  (deg2rad(0.01°))
export const OZ_CHANNEL_SHEAR_ANGLE_INFO_DISPLAY_SCALE   = 57.29577951308232;        // @0xaf568  (180/π)
export const OZ_CHANNEL_SHEAR_ANGLE_INFO_UNIT_SUFFIX     = "\u00B0";                 // @0xbc3f9  (UTF-8 C2 B0)

// PCSingleton capacity — `movl $0x64,%esi` @0x57ce immediately before the
// __ZN11PCSingletonC2Ej stub call @0x57d3. Read directly out of the ctor.
export const OZ_CHANNEL_SHEAR_ANGLE_INFO_PC_SINGLETON_CAP = 0x64; // 100

/**
 * OZChannelInfo base subobject as observed from the OZChannelShearAngleInfo ctor.
 * This is a *frontier* type — OZChannelInfo itself has not been transcribed yet.
 * We only model the fields OZChannelShearAngleInfo installs; anything else stays
 * opaque so we don't invent a shape.
 */
export interface OZChannelInfoLike {
  /** @0x579d  xmm0 arg of __ZN13OZChannelInfoC2EdddddPKc */
  readonly min: number;
  /** @0x57a5  xmm1 arg */
  readonly max: number;
  /** @0x57ad  xmm2 arg */
  readonly stepCoarse: number;
  /** @0x57b5  xmm3 arg */
  readonly stepFine: number;
  /** @0x57bd  xmm4 arg */
  readonly displayScale: number;
  /** @0x5796  rsi arg (leaq into __cstring pool) */
  readonly unitSuffix: string;
}

/**
 * PCSingleton subobject stub. The real type is
 *   __ZN11PCSingletonC2Ej   PCSingleton::PCSingleton(unsigned int)
 * and it's constructed in-place at +0x50 with a capacity of 100 (0x64). Its
 * internals are not yet transcribed — only the `capacity` field observed at
 * construction time is exposed.
 */
export interface PCSingletonSubobject {
  /** @0x57ce  movl $0x64,%esi — the capacity argument passed to PCSingleton::PCSingleton */
  readonly capacity: number;
}

/**
 * OZChannelShearAngleInfo — the whole class.
 *
 * Faithful port of __ZN23OZChannelShearAngleInfoC2Ev @0x578c. Every field is
 * populated exactly like the disassembly:
 *
 *   0x578c  push rbp / mov rsp,rbp / push r14 / push rbx / mov rbx,rdi   ; this=rdi
 *   0x5796  leaq   0xb6c5c(%rip),%rsi              ; rsi = "°"           (@0xbc3f9)
 *   0x579d  movsd  0xa9dcb(%rip),%xmm0             ; xmm0 = -π/2         (@0xaf570)
 *   0x57a5  movsd  0xa9dcb(%rip),%xmm1             ; xmm1 = +π/2         (@0xaf578)
 *   0x57ad  movsd  0xa9da3(%rip),%xmm2             ; xmm2 = 1° in rad    (@0xaf558)
 *   0x57b5  movsd  0xa9da3(%rip),%xmm3             ; xmm3 = 0.01° in rad (@0xaf560)
 *   0x57bd  movsd  0xa9da3(%rip),%xmm4             ; xmm4 = 180/π         (@0xaf568)
 *   0x57c5  callq  OZChannelInfo::OZChannelInfo(d,d,d,d,d,PKc)  ; base ctor
 *   0x57ca  leaq   0x50(%rbx),%rdi                  ; rdi = this+0x50
 *   0x57ce  movl   $0x64,%esi                       ; esi = 100
 *   0x57d3  callq  PCSingleton::PCSingleton(uint)   ; embedded singleton ctor
 *   0x57d8  leaq   0xc6e99(%rip),%rax               ; rax = &__ZTV+0x10  (@0xcc678)
 *   0x57df  movq   %rax,(%rbx)                      ; this->vtable = primary vtable ptr
 *   0x57e2  leaq   0xc6eaf(%rip),%rax               ; rax = &__ZTV+0x30  (@0xcc698)
 *   0x57e9  movq   %rax,0x50(%rbx)                  ; (this+0x50)->vtable = secondary vtable
 *   ret
 *
 * The unwind pad @0x57f2..0x5800 cleans up: on exception AFTER the base ctor
 * has run, it destroys the base via OZChannelInfo::~OZChannelInfo (@0x57f8)
 * then re-raises via __Unwind_Resume (@0x5800). In TS we don't emulate C++
 * exception unwinding — a throw during construction will surface naturally.
 */
export class OZChannelShearAngleInfo {
  /** OZChannelInfo base subobject (+0x00..+0x50). */
  readonly base: OZChannelInfoLike;

  /** PCSingleton subobject at +0x50. */
  readonly singleton: PCSingletonSubobject;

  /**
   * OZChannelShearAngleInfo::OZChannelShearAngleInfo()   @ProChannel 0x578c
   *
   * Zero-argument default ctor — the class hard-codes every parameter it hands
   * to its base subobject. No caller-visible knobs.
   */
  constructor() {
    // @0x57c5 — base construction with the five constants + "°"
    this.base = {
      min: OZ_CHANNEL_SHEAR_ANGLE_INFO_MIN_RAD,
      max: OZ_CHANNEL_SHEAR_ANGLE_INFO_MAX_RAD,
      stepCoarse: OZ_CHANNEL_SHEAR_ANGLE_INFO_STEP_COARSE_RAD,
      stepFine: OZ_CHANNEL_SHEAR_ANGLE_INFO_STEP_FINE_RAD,
      displayScale: OZ_CHANNEL_SHEAR_ANGLE_INFO_DISPLAY_SCALE,
      unitSuffix: OZ_CHANNEL_SHEAR_ANGLE_INFO_UNIT_SUFFIX,
    };
    // @0x57d3 — PCSingleton::PCSingleton(uint) with capacity=0x64
    this.singleton = { capacity: OZ_CHANNEL_SHEAR_ANGLE_INFO_PC_SINGLETON_CAP };
    // The vtable stores at @0x57df (primary, @0xcc678) and @0x57e9 (secondary,
    // @0xcc698) have no runtime observable effect from TS: C++ dispatch is
    // replaced by JS method resolution. Documenting them here keeps the layout
    // honest but installs nothing.
  }

  /**
   * OZChannelShearAngleInfo::~OZChannelShearAngleInfo() (base, __ZN23OZChannelShearAngleInfoD1Ev)  @ProChannel 0x5806
   *
   *   push rbp / mov rsp,rbp / push rbx / push rax
   *   mov rdi,rbx                                    ; save this
   *   add $0x50,%rdi
   *   callq  PCSingleton::~PCSingleton()             ; destroy singleton subobject
   *   mov rbx,%rdi
   *   add $0x8,%rsp / pop rbx / pop rbp
   *   jmp  OZChannelInfo::~OZChannelInfo()           ; tail-call base dtor
   *
   * In TS: nothing to release deterministically. The method exists to match the
   * class shape and to document the tail-call chain.
   */
  destroy(): void {
    // @0x5813  — PCSingleton::~PCSingleton() on this+0x50 (frontier stub @0xacb4c)
    // @0x5821  — jmp OZChannelInfo::~OZChannelInfo() (frontier)
    // Both are no-ops for the TS port (GC handles memory); the call graph is
    // preserved in comments so a future decode of either can slot in here.
  }

  /**
   * OZChannelShearAngleInfo::~OZChannelShearAngleInfo() (deleting, __ZN23OZChannelShearAngleInfoD0Ev)  @ProChannel 0x5826
   *
   *   ... same body as D1 up to the base-dtor call, then:
   *   jmp  operator delete(void*)                    ; free the storage
   *
   * Identical to `destroy()` except it also frees the heap slot. JS GC replaces
   * `operator delete`, so this method is equivalent to `destroy()` here — but
   * we still expose it separately so callers that model the deleting-dtor
   * (e.g. through a vtable dispatch) map 1:1.
   */
  destroyAndFree(): void {
    // @0x5833  callq PCSingleton::~PCSingleton()    (stub @0xacb4c)
    // @0x583b  callq OZChannelInfo::~OZChannelInfo()
    // @0x5849  jmp   operator delete(void*)         (stub @0xace04)
    this.destroy();
  }
}
