// OZChannelAngleInfo — angle channel metadata descriptor. ProChannel.framework.
//
// A tiny concrete OZChannelInfo subclass: it does nothing at runtime beyond
// wiring five constants + a unit-suffix string into the OZChannelInfo base
// subobject, and constructing an embedded PCSingleton<...> at +0x50. There are
// no observable accessors of its own — every method except the ctor & dtors is
// inherited from OZChannelInfo. The whole class exists so `OZChannelAngle`
// (the "Angle" channel factory family) has a shared, statically-shaped
// description object it can hand to angle-valued channels.
//
// Symbols (from nm on ProChannel, x86_64):
//   __ZN18OZChannelAngleInfoC2Ev  OZChannelAngleInfo::OZChannelAngleInfo()  @0x84bb8
//   __ZN18OZChannelAngleInfoD1Ev  OZChannelAngleInfo::~OZChannelAngleInfo() (base)     @0x04c0a
//   __ZN18OZChannelAngleInfoD0Ev  OZChannelAngleInfo::~OZChannelAngleInfo() (deleting) @0x04c2a
//
// Struct layout — recovered from the ctor:
//   +0x00                vtable ptr    (installed as &__ZTV18OZChannelAngleInfo + 0x10,
//                                       resolved to 0xcbdc8 — see vtable dump below)
//   +0x00..+0x50         OZChannelInfo base subobject
//                        (constructed via
//                         __ZN13OZChannelInfoC2EdddddPKc  @ProChannel — see callq @0x84bf1
//                         with args xmm0..xmm4 + rsi below)
//   +0x50                vtable-2 ptr  (secondary vtable / thunks; installed as
//                                       &__ZTV18OZChannelAngleInfo + 0x3b, resolved to
//                                       0xcbdf3 — see mov %rax,0x50(%rbx) @0x84c15)
//   +0x50..             PCSingleton subobject
//                        (constructed via
//                         __ZN11PCSingletonC2Ej  @ProChannel with capacity=0x64 (100)
//                         — see callq stub @0x84bff and movl $0x64,%esi @0x84bfa)
//
// The primary vtable (__ZTV18OZChannelAngleInfo @0xcbdb8; installed ptr 0xcbdc8) —
// slots relevant to this class:
//   *0x00 -> 0x4c0a   OZChannelAngleInfo::~OZChannelAngleInfo()          (base dtor)
//   *0x08 -> 0x4c2a   OZChannelAngleInfo::~OZChannelAngleInfo()          (deleting dtor)
//   *0x48 -> 0xdcc08  typeinfo for OZChannelInfo   (this + 0x50 is the OZChannelImpl-side subobject
//                     — see the secondary vtable at +0x50 which points at 0xcbdf3, i.e. into the
//                     tail of the same __ZTV symbol)
//   ...tail slots at *0x70..*0xd0 belong to the sibling class OZChannelAngleImpl and are unrelated
//   to OZChannelAngleInfo (proved by matching typeinfo -> OZChannelAngleImpl at *0x70).
//
// Frontier callees (NOT transcribed yet in the port; documented and stubbed if reached):
//   OZChannelInfo::OZChannelInfo(double, double, double, double, double, char const*)
//                                                                      @ProChannel (see @0x84bf1)
//   OZChannelInfo::~OZChannelInfo()                                    @ProChannel (see @0x04c1f/0x84c24)
//   PCSingleton::PCSingleton(unsigned int)                             @ProChannel (stub  @0xacb46)
//   PCSingleton::~PCSingleton()                                        @ProChannel (stub  @0xacb4c)
//   operator delete(void*)                                             (stub          @0xace04)

// ─── Constants ────────────────────────────────────────────────────────────────
// All five doubles are 8-byte RIP-relative loads at ctor @0x84bc9/d1/d9/e1/e9. Each
// instruction is 8 bytes long and encodes disp32=0x2a977; the resolved data addresses
// (0xaf548..0xaf568) were dumped bit-exact via resolve.py const:
//
//   xmm0 @0x84bc9  -> u64 0xc7efffffe0000000  = -3.4028234663852886e+38   (min: -FLT_MAX as f64)
//   xmm1 @0x84bd1  -> u64 0x47efffffe0000000  = +3.4028234663852886e+38   (max: +FLT_MAX as f64)
//   xmm2 @0x84bd9  -> u64 0x3f91df46a2529d39  =  0.017453292519943295     (deg2rad(1°) — the small step)
//   xmm3 @0x84be1  -> u64 0x3f26e05a695f8191  =  0.00017453292519943296   (deg2rad(0.01°) — the fine step)
//   xmm4 @0x84be9  -> u64 0x404ca5dc1a63c1f8  =  57.29577951308232        (180/π — the display scale)
//
// The unit-suffix string @0x84bc2 (leaq 0x37830(%rip),%rsi -> 0xbc3f9) is the two-byte
// UTF-8 sequence 0xC2 0xB0 0x00, i.e. "°" (U+00B0 DEGREE SIGN) — confirmed by the
// literal-pool comment "\302\260" from otool and by dumping bytes at 0xbc3f9.
//
// Semantics (naming inferred from OZChannelInfo's parameter list order encoded in its
// mangled ctor __ZN13OZChannelInfoC2EdddddPKc — five doubles + a C-string):
//   arg1 xmm0 -> `min`             (channel minimum value, in radians)
//   arg2 xmm1 -> `max`             (channel maximum value, in radians)
//   arg3 xmm2 -> `stepCoarse`      (large slider step, radians  = 1°)
//   arg4 xmm3 -> `stepFine`        (fine slider step, radians   = 0.01°)
//   arg5 xmm4 -> `displayScale`    (unit scale used when formatting for the UI: rad*scale = deg)
//   arg6 rsi  -> `unitSuffix`      ("°")

export const OZ_CHANNEL_ANGLE_INFO_MIN            = -3.4028234663852886e+38;     // @0xaf548
export const OZ_CHANNEL_ANGLE_INFO_MAX            =  3.4028234663852886e+38;     // @0xaf550
export const OZ_CHANNEL_ANGLE_INFO_STEP_COARSE_RAD = 0.017453292519943295;       // @0xaf558  (deg2rad(1°))
export const OZ_CHANNEL_ANGLE_INFO_STEP_FINE_RAD  = 0.00017453292519943296;      // @0xaf560  (deg2rad(0.01°))
export const OZ_CHANNEL_ANGLE_INFO_DISPLAY_SCALE  = 57.29577951308232;           // @0xaf568  (180/π)
export const OZ_CHANNEL_ANGLE_INFO_UNIT_SUFFIX    = "\u00B0";                    // @0xbc3f9  (UTF-8 C2 B0)

// PCSingleton capacity — `movl $0x64,%esi` @0x84bfa immediately before the
// __ZN11PCSingletonC2Ej stub call @0x84bff. Read directly out of the ctor.
export const OZ_CHANNEL_ANGLE_INFO_PC_SINGLETON_CAP = 0x64; // 100

/**
 * OZChannelInfo base subobject as observed from the OZChannelAngleInfo ctor. This is
 * a *frontier* type — OZChannelInfo itself has not been transcribed yet. We only
 * model the fields OZChannelAngleInfo installs; anything else stays opaque so we
 * don't invent a shape.
 */
export interface OZChannelInfoLike {
  /** @0x84bc9  xmm0 arg of __ZN13OZChannelInfoC2EdddddPKc */
  readonly min: number;
  /** @0x84bd1  xmm1 arg */
  readonly max: number;
  /** @0x84bd9  xmm2 arg */
  readonly stepCoarse: number;
  /** @0x84be1  xmm3 arg */
  readonly stepFine: number;
  /** @0x84be9  xmm4 arg */
  readonly displayScale: number;
  /** @0x84bc2  rsi arg (leaq into __cstring pool) */
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
  /** @0x84bfa  movl $0x64,%esi — the capacity argument passed to PCSingleton::PCSingleton */
  readonly capacity: number;
}

/**
 * OZChannelAngleInfo — the whole class.
 *
 * Faithful port of __ZN18OZChannelAngleInfoC2Ev @0x84bb8. Every field is
 * populated exactly like the disassembly:
 *
 *   0x84bb8  push rbp / mov rsp,rbp / push r14 / push rbx / mov rbx,rdi   ; this=rdi
 *   0x84bc2  leaq   0x37830(%rip),%rsi              ; rsi = "°"           (@0xbc3f9)
 *   0x84bc9  movsd  0x2a977(%rip),%xmm0             ; xmm0 = -FLT_MAX     (@0xaf548)
 *   0x84bd1  movsd  0x2a977(%rip),%xmm1             ; xmm1 = +FLT_MAX     (@0xaf550)
 *   0x84bd9  movsd  0x2a977(%rip),%xmm2             ; xmm2 = 1° in rad    (@0xaf558)
 *   0x84be1  movsd  0x2a977(%rip),%xmm3             ; xmm3 = 0.01° in rad (@0xaf560)
 *   0x84be9  movsd  0x2a977(%rip),%xmm4             ; xmm4 = 180/π         (@0xaf568)
 *   0x84bf1  callq  OZChannelInfo::OZChannelInfo(d,d,d,d,d,PKc)  ; base ctor
 *   0x84bf6  leaq   0x50(%rbx),%rdi                  ; rdi = this+0x50
 *   0x84bfa  movl   $0x64,%esi                       ; esi = 100
 *   0x84bff  callq  PCSingleton::PCSingleton(uint)   ; embedded singleton ctor
 *   0x84c04  leaq   0x471bd(%rip),%rax               ; rax = &__ZTV+0x10  (@0xcbdc8)
 *   0x84c0b  movq   %rax,(%rbx)                      ; this->vtable = primary vtable ptr
 *   0x84c0e  leaq   0x471d3(%rip),%rax               ; rax = &__ZTV+0x3b  (@0xcbdf3)
 *   0x84c15  movq   %rax,0x50(%rbx)                  ; (this+0x50)->vtable = secondary vtable
 *   ret
 *
 * The unwind pad @0x84c1e..0x84c2d cleans up: on exception AFTER the base ctor
 * has run, it destroys the base via OZChannelInfo::~OZChannelInfo (@0x84c24)
 * then re-raises via __Unwind_Resume (@0x84c2c). In TS we don't emulate C++
 * exception unwinding — a throw during construction will surface naturally.
 */
export class OZChannelAngleInfo {
  /** OZChannelInfo base subobject (+0x00..+0x50). */
  readonly base: OZChannelInfoLike;

  /** PCSingleton subobject at +0x50. */
  readonly singleton: PCSingletonSubobject;

  /**
   * OZChannelAngleInfo::OZChannelAngleInfo()   @ProChannel 0x84bb8
   *
   * Zero-argument default ctor — the class hard-codes every parameter it hands
   * to its base subobject. No caller-visible knobs.
   */
  constructor() {
    // @0x84bf1 — base construction with the five constants + "°"
    this.base = {
      min: OZ_CHANNEL_ANGLE_INFO_MIN,
      max: OZ_CHANNEL_ANGLE_INFO_MAX,
      stepCoarse: OZ_CHANNEL_ANGLE_INFO_STEP_COARSE_RAD,
      stepFine: OZ_CHANNEL_ANGLE_INFO_STEP_FINE_RAD,
      displayScale: OZ_CHANNEL_ANGLE_INFO_DISPLAY_SCALE,
      unitSuffix: OZ_CHANNEL_ANGLE_INFO_UNIT_SUFFIX,
    };
    // @0x84bff — PCSingleton::PCSingleton(uint) with capacity=0x64
    this.singleton = { capacity: OZ_CHANNEL_ANGLE_INFO_PC_SINGLETON_CAP };
    // The vtable stores at @0x84c0b (primary, @0xcbdc8) and @0x84c15 (secondary,
    // @0xcbdf3) have no runtime observable effect from TS: C++ dispatch is
    // replaced by JS method resolution. Documenting them here keeps the layout
    // honest but installs nothing.
  }

  /**
   * OZChannelAngleInfo::~OZChannelAngleInfo() (base, __ZN18OZChannelAngleInfoD1Ev)  @ProChannel 0x4c0a
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
    // @0x4c17  — PCSingleton::~PCSingleton() on this+0x50 (frontier stub @0xacb4c)
    // @0x4c25  — jmp OZChannelInfo::~OZChannelInfo() (frontier)
    // Both are no-ops for the TS port (GC handles memory); the call graph is
    // preserved in comments so a future decode of either can slot in here.
  }

  /**
   * OZChannelAngleInfo::~OZChannelAngleInfo() (deleting, __ZN18OZChannelAngleInfoD0Ev)  @ProChannel 0x4c2a
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
    // @0x4c37  callq PCSingleton::~PCSingleton()    (stub @0xacb4c)
    // @0x4c3f  callq OZChannelInfo::~OZChannelInfo()
    // @0x4c4d  jmp   operator delete(void*)         (stub @0xace04)
    this.destroy();
  }
}
