// OZChannelGradientPositioned — ProChannel channel-tree class extending
// OZChannelGradientExtras with TWO per-instance POSITION sub-channels (an
// OZChannelPosition at +0x420 and another OZChannelPosition at +0x6e0). Every
// constructor sets:
//   - position1 default = (0.0, -100.0)   [read from ProChannel VAs 0xb1408 for -100.0]
//   - position2 default = (0.0,  100.0)   [read from ProChannel VA  0xaf518 for  100.0]
//   - `doNotSerializeAsRoot` flag byte at +0x9a0 = 0
// The class overrides `getObjCWrapperName`, `copy`, `writeHeader`, `writeBody`, and
// `setDoNotSerializeAsRoot`; every other virtual is inherited via the vtable.
//
// Framework: ProChannel
//   /Applications/Final Cut Pro.app/Contents/Frameworks/ProChannel.framework
// The x86_64 slice was extracted to /tmp/ProChannel.x86_64 (VAs == file offsets).
//
// Faithful transcription of the class's exported symbols
// (see raw-port/re/disasm/ProChannel.OZChannelGradientPositioned.*.s):
//
//   @0x6d178  C2(OZFactory*, PCString&, OZChannelFolder*, u32, u32)     [factory 5-arg body]
//   @0x6d32e  C2(OZFactory*, PCString&, u32)                            [factory 3-arg body]
//   @0x6d4e4  C2(PCString&, OZChannelFolder*, u32, u32)                 [no-factory body — looks up singleton]
//   @0x6d6c0  C2(OZChannelGradientPositioned const&, OZChannelFolder*)  [copy body]
//   @0x6d758  ~OZChannelGradientPositioned() [D2 in-place — destroys +0x420, +0x6e0]
//   @0x6d79e  ~OZChannelGradientPositioned() [D1 in-place — same body as D2, ICF]
//   @0x6d7b4  ~OZChannelGradientPositioned() [D0 full — D2 body then operator delete]
//   @0x6d8ac  setDoNotSerializeAsRoot(bool)                             [store byte @+0x9a0]
//   @0x6d8ba  writeHeader(PCSerializerWriteStream&, bool)               [thin trampoline]
//   @0x6d8d2  writeBody(PCSerializerWriteStream&, bool, bool, bool)     [thin trampoline]
//   @0x6d8ea  getObjCWrapperName()                                      [return CFStringRef @0xe55b0]
//   @0x6d834  copy(OZChannelBase const*, bool)                          [chain + dyn_cast + OZChannelPosition::copy x2]
//
// The C1/C2 pairs are ICF-alias siblings that share bodies; only C2 entries are documented here.
//
// VTABLE (from the ctor `leaq 0x6e1ba(%rip); movq %rax, (%rbx); leaq 0x6e488(%rip); movq %rax, 0x10(%rbx)`
//   at @0x6d18f..@0x6d1a0 — reproduced at every ctor):
//   vtable_primary   installed at *(this+0x00)  = @0xdb350
//   vtable_secondary installed at *(this+0x10)  = @0xdb628
//
// STRUCT LAYOUT  (recovered from ctors + dtor + copy):
// -----------------------------------------------------------------------------
//   +0x000  vptr_primary            — installed at every ctor (@0x6d18f, @0x6d345, @0x6d520, @0x6d6d5)
//                                     initial value = &vtable_primary+0x10 = 0xdb350
//   +0x010  vptr_secondary          — installed at every ctor (@0x6d199, @0x6d34f, @0x6d52a, @0x6d6df)
//                                     initial value = &vtable_secondary+0x10 = 0xdb628
//        (offsets +0x00..+0x420: inherited from OZChannelGradientExtras — treated as opaque
//         parent-subobject; parent ctor initializes them.)
//   +0x420  position1               — OZChannelPosition sub-channel (default value = (0.0, -100.0))
//        (X-value channel @+0x4a8 = position1+0x88;   default 0.0  set @0x6d26f)
//        (Y-value channel @+0x540 = position1+0x120;  default -100.0 (@ProChannel 0xb1408) set @0x6d283)
//        (position1 bool  @+0x5d8 = position1+0x1b8;  cleared @0x6d292)
//   +0x6e0  position2               — OZChannelPosition sub-channel (default value = (0.0, 100.0))
//        (X-value channel @+0x768 = position2+0x88;   default 0.0   set @0x6d2a3)
//        (Y-value channel @+0x800 = position2+0x120;  default 100.0 (@ProChannel 0xaf518) set @0x6d2b7)
//        (position2 bool  @+0x898 = position2+0x1b8;  cleared @0x6d2c6)
//   +0x9a0  doNotSerializeAsRoot: bool — zeroed by every ctor (@0x6d240 5-arg, matching at 3-arg
//                                        and 4-arg positions), written by setDoNotSerializeAsRoot
//                                        @0x6d8b0.
//   +0x9a1..end: opaque tail (inherited)
// -----------------------------------------------------------------------------

import type { OZChannelPosition } from "./OZChannelPosition";

// -----------------------------------------------------------------------------
// Frontier callees — each throws with the exact source address so the
// frontier tool can see the outstanding gap.
// -----------------------------------------------------------------------------

/**
 * Frontier: OZChannelGradientExtras — parent class in the inheritance chain.
 * Undecoded here; parent ctors, dtor, and copy() are called from this class:
 *   - OZChannelGradientExtras::C2(OZFactory*, PCString&, OZChannelFolder*, u32, u32)
 *                                                          @ProChannel  (@0x6d18a call site)
 *   - OZChannelGradientExtras::C2(OZFactory*, PCString&, u32)
 *                                                          @ProChannel  (@0x6d340 call site)
 *   - OZChannelGradientExtras::C2(OZChannelGradientExtras const&, OZChannelFolder*)
 *                                                          @ProChannel  (@0x6d6d0 call site)
 *   - OZChannelGradientExtras::~OZChannelGradientExtras()  @ProChannel  (@0x6d797 tail-jump)
 *   - OZChannelGradientExtras::copy(OZChannelBase const*, bool)
 *                                                          @ProChannel  (@0x6d847 call site)
 * The parent subobject occupies bytes [0x00, 0x420) of this class's instance.
 * @frontier ProChannel OZChannelGradientExtras
 */
export interface OZChannelGradientExtras {
  readonly __brand: "OZChannelGradientExtras";
}

/**
 * Frontier: `getProChannelBundle()` — a global free function returning the
 * `__CFBundle*` for the ProChannel framework. Called from every ctor to build
 * the transient PCString for each sub-channel's localized name.
 * @frontier ProChannel getProChannelBundle() @stub_call at 0x6d1a4/0x6d1f2/0x6d35a/0x6d3a8/0x6d535/0x6d583
 */
function getProChannelBundle(): unknown {
  throw new Error(
    "getProChannelBundle() @ProChannel not yet transcribed " +
      "(called from every ctor of OZChannelGradientPositioned @0x6d1a4)",
  );
}

/**
 * Frontier: PCString::C2(CFStringRef, __CFBundle*, __CFBundle*, u32) — @ProChannel
 * symbol stub 0xacd02. Builds a transient PCString from a CFStringRef+bundle pair,
 * used at every ctor to create the sub-channel display name. (Argument order in
 * SysV: rdi=this, rsi=cfstr, rdx=bundle, rcx=0.)
 * @frontier ProChannel PCString::C2(CFStringRef, __CFBundle*, __CFBundle*) @stub 0xacd02
 */
function PCString_C2_fromCFString(
  _self: unknown, _cfstr: unknown, _bundle: unknown, _flags: number,
): void {
  throw new Error(
    "PCString::C2(CFStringRef, __CFBundle*, __CFBundle*, u32) @ProChannel stub 0xacd02 " +
      "not yet transcribed",
  );
}

/**
 * Frontier: PCString::D2() — @ProChannel symbol stub 0xacd20. Destroys the
 * transient PCString built for each sub-channel ctor.
 * @frontier ProChannel PCString::D2 @stub 0xacd20
 */
function PCString_D2(_self: unknown): void {
  throw new Error(
    "PCString::D2 @ProChannel stub 0xacd20 not yet transcribed",
  );
}

/**
 * Frontier: OZChannelPosition::C1(PCString&, OZChannelFolder*, u32, u32, u32, OZChannelImpl*,
 *   OZChannelInfo*) — the 7-arg named ctor. Called for BOTH position sub-channels with a fixed
 * signature: %rcx=4 (position1) or 5 (position2) — see @0x6d1d6 / @0x6d224; %r8=0; %r9=2; the
 * final impl/info args are zero-initialized on the stack (`xorps xmm0,xmm0; movups xmm0,(rsp)`).
 * The %rdx passed is the parent channel (`%rbx` = this).
 * @frontier ProChannel OZChannelPosition::C1(named-ctor, 7-arg)
 */
function OZChannelPosition_C1_named(
  _self: OZChannelPosition,
  _name: unknown,          // PCString&
  _folder: unknown,        // OZChannelFolder* (parent = %rdx = this)
  _typeCode: number,       // %rcx  — 4 for position1, 5 for position2
  _flags: number,          // %r8   — 0
  _kind: number,           // %r9   — 2
  _impl: unknown,          // OZChannelImpl*  — null on stack
  _info: unknown,          // OZChannelInfo*  — null on stack
): void {
  throw new Error(
    "OZChannelPosition::C1(PCString&, OZChannelFolder*, u32, u32, u32, OZChannelImpl*, OZChannelInfo*) " +
      "@ProChannel not yet transcribed (called from OZChannelGradientPositioned ctors @0x6d1e4/@0x6d232)",
  );
}

/**
 * Frontier: OZChannelPosition::C1(OZChannelPosition const&, OZChannelFolder*) — copy ctor.
 * Called by our copy ctor for both position sub-channels (@0x6d6fc, @0x6d710).
 * @frontier ProChannel OZChannelPosition::C1(const&, OZChannelFolder*)
 */
function OZChannelPosition_C1_copy(
  _self: OZChannelPosition,
  _rhs: OZChannelPosition,
  _folder: unknown,
): void {
  throw new Error(
    "OZChannelPosition::C1(OZChannelPosition const&, OZChannelFolder*) @ProChannel " +
      "not yet transcribed (called from OZChannelGradientPositioned copy-ctor @0x6d6fc)",
  );
}

/**
 * Frontier: OZChannelPosition::~OZChannelPosition() — D1 dtor. Called for both sub-channels
 * at @0x6d77d and @0x6d789 (in D2), and inside the copy-ctor's exception landing pad @0x6d733.
 * @frontier ProChannel OZChannelPosition::~OZChannelPosition
 */
function OZChannelPosition_D1(_self: OZChannelPosition): void {
  throw new Error(
    "OZChannelPosition::~OZChannelPosition() @ProChannel not yet transcribed " +
      "(called from OZChannelGradientPositioned::~... @0x6d77d/@0x6d789)",
  );
}

/**
 * Frontier: OZChannelPosition::copy(OZChannelBase const*, bool) — invoked from THIS class's
 * copy() @0x6d884 (position1) and @0x6d8a7 tail-jmp (position2). Copies one position sub-channel
 * from the dyn_cast'd rhs.
 * @frontier ProChannel OZChannelPosition::copy(OZChannelBase const*, bool)
 */
function OZChannelPosition_copy(
  _self: OZChannelPosition,
  _rhsSubChannel: OZChannelPosition | null,
  _keyframed: boolean,
): void {
  throw new Error(
    "OZChannelPosition::copy(OZChannelBase const*, bool) @ProChannel not yet transcribed " +
      "(called from OZChannelGradientPositioned::copy @0x6d884/@0x6d8a7)",
  );
}

/**
 * Frontier: OZChannelBase::resetFlag(unsigned long long, bool) — invoked twice from every
 * ctor with args (0x10, 0) on position1 (@0x6d251) then position2 (@0x6d260). Clears bit 0x10.
 * @frontier ProChannel OZChannelBase::resetFlag
 */
function OZChannelBase_resetFlag(
  _self: OZChannelPosition,
  _mask: bigint,
  _propagate: boolean,
): void {
  throw new Error(
    "OZChannelBase::resetFlag(u64, bool) @ProChannel not yet transcribed " +
      "(called from OZChannelGradientPositioned ctors @0x6d251/@0x6d260 with (0x10, false))",
  );
}

/**
 * Frontier: OZChannelBase::reset(bool) — invoked twice from every ctor with arg 0 on
 * position1 (@0x6d28d) then position2 (@0x6d2c1). Resets sub-channel state.
 * @frontier ProChannel OZChannelBase::reset
 */
function OZChannelBase_reset(_self: OZChannelPosition, _propagate: boolean): void {
  throw new Error(
    "OZChannelBase::reset(bool) @ProChannel not yet transcribed " +
      "(called from OZChannelGradientPositioned ctors @0x6d28d/@0x6d2c1 with (false))",
  );
}

/**
 * Frontier: OZChannel::setDefaultValue(double) — invoked FOUR times from every ctor to set:
 *   pos1.X (@+0x4a8) default = 0.0        @0x6d26f
 *   pos1.Y (@+0x540) default = -100.0     @0x6d283 (constant @ProChannel 0xb1408)
 *   pos2.X (@+0x768) default = 0.0        @0x6d2a3
 *   pos2.Y (@+0x800) default = 100.0      @0x6d2b7 (constant @ProChannel 0xaf518)
 * @frontier ProChannel OZChannel::setDefaultValue(double)
 */
function OZChannel_setDefaultValue(
  _scalarChannel: unknown,  // the OZChannel* at (this+0x4a8), etc.
  _v: number,
): void {
  throw new Error(
    "OZChannel::setDefaultValue(double) @ProChannel not yet transcribed " +
      "(called from OZChannelGradientPositioned ctors @0x6d26f/@0x6d283/@0x6d2a3/@0x6d2b7)",
  );
}

/**
 * Frontier: OZChannelGradient::writeHeader(PCSerializerWriteStream&, bool) — the parent
 * class's method that this class's writeHeader (@0x6d8ba) is a bare tail-jump to.
 * @frontier ProChannel OZChannelGradient::writeHeader
 */
function OZChannelGradient_writeHeader(
  _self: OZChannelGradientPositioned,
  _stream: unknown,
  _flag: boolean,
): void {
  throw new Error(
    "OZChannelGradient::writeHeader(PCSerializerWriteStream&, bool) @ProChannel not yet " +
      "transcribed (tail-jumped from OZChannelGradientPositioned::writeHeader @0x6d8bf)",
  );
}

/**
 * Frontier: OZChannelGradient::writeBody(PCSerializerWriteStream&, bool, bool, bool) — the
 * parent method that this class's writeBody (@0x6d8d2) is a bare tail-jump to.
 * @frontier ProChannel OZChannelGradient::writeBody
 */
function OZChannelGradient_writeBody(
  _self: OZChannelGradientPositioned,
  _stream: unknown,
  _a: boolean,
  _b: boolean,
  _c: boolean,
): void {
  throw new Error(
    "OZChannelGradient::writeBody(PCSerializerWriteStream&, bool, bool, bool) @ProChannel not " +
      "yet transcribed (tail-jumped from OZChannelGradientPositioned::writeBody @0x6d8d7)",
  );
}

/**
 * Frontier: OZChannelGradientExtras::copy(OZChannelBase const*, bool) — parent copy() called
 * from THIS class's copy at @0x6d847 before delegating to the position sub-channels.
 * @frontier ProChannel OZChannelGradientExtras::copy
 */
function OZChannelGradientExtras_copy(
  _self: OZChannelGradientPositioned,
  _rhs: OZChannelGradientPositioned | null,
  _keyframed: boolean,
): void {
  throw new Error(
    "OZChannelGradientExtras::copy(OZChannelBase const*, bool) @ProChannel not yet transcribed " +
      "(called from OZChannelGradientPositioned::copy @0x6d847)",
  );
}

/**
 * Frontier: OZChannelGradientPositioned_Factory::getInstance() — the singleton lookup that the
 * no-factory 4-arg ctor (@0x6d504) calls before delegating to the 5-arg factory ctor path.
 * @frontier ProChannel OZChannelGradientPositioned_Factory::getInstance
 */
function OZChannelGradientPositioned_Factory_getInstance(): unknown {
  throw new Error(
    "OZChannelGradientPositioned_Factory::getInstance() @ProChannel not yet transcribed " +
      "(called from OZChannelGradientPositioned 4-arg ctor @0x6d504)",
  );
}

/**
 * Frontier: `__dynamic_cast(rhs, typeinfo<OZChannelBase>, typeinfo<OZChannelGradientPositioned>, 0)`
 * — the RTTI downcast at @0x6d864 in copy(). Returns the rhs pointer downcast into
 * `OZChannelGradientPositioned*`, or nullptr if the runtime types don't match.
 * @frontier libc++ __dynamic_cast @stub 0xacea0
 */
function _dynamic_cast_to_OZChannelGradientPositioned(
  _rhs: unknown,
): OZChannelGradientPositioned | null {
  throw new Error(
    "__dynamic_cast(rhs, OZChannelBase, OZChannelGradientPositioned, 0) not yet wired " +
      "(called at OZChannelGradientPositioned::copy @0x6d864)",
  );
}

// -----------------------------------------------------------------------------
// Constants (all read from the ProChannel x86_64 slice — VAs == file offsets)
// -----------------------------------------------------------------------------

/**
 * Vtable primary pointer — installed at (this+0x00) by every ctor. Located at
 * ProChannel VA 0xdb350 (= 0x6d18f + 7 + 0x6e1ba, cross-verified against the 4-arg
 * ctor 0x6d520 + 7 + 0x6de29 = 0xdb350).
 * @const ProChannel 0xdb350
 */
export const OZChannelGradientPositioned_VTABLE_PRIMARY_VA = 0xdb350;

/**
 * Vtable secondary pointer — installed at (this+0x10) by every ctor. Located at
 * ProChannel VA 0xdb628 (= 0x6d199 + 7 + 0x6e488, cross-verified against 4-arg
 * ctor 0x6d52a + 7 + 0x6e0f7 = 0xdb628).
 * @const ProChannel 0xdb628
 */
export const OZChannelGradientPositioned_VTABLE_SECONDARY_VA = 0xdb628;

/**
 * CFStringRef for the position1 sub-channel's localizable display name — same
 * address in ALL ctors. Cross-checked:
 *   5-arg ctor: 0x6d1a9 + 7 + 0x783c0 = 0xe5570
 *   3-arg ctor: 0x6d35f + 7 + 0x7820a = 0xe5570  (verified — same value)
 *   4-arg ctor: 0x6d53a + 7 + 0x7802f = 0xe5570  (verified — same value)
 * @const ProChannel 0xe5570  (CFStringRef in __DATA __cfstring)
 */
export const OZChannelGradientPositioned_POS1_NAME_CFSTRING_ADDR = 0xe5570;

/**
 * CFStringRef for the position2 sub-channel's localizable display name — same
 * address in ALL ctors:
 *   5-arg ctor: 0x6d1f7 + 7 + 0x78392 = 0xe5590
 *   3-arg ctor: 0x6d3ad + 7 + 0x781dc = 0xe5590  (same value)
 *   4-arg ctor: 0x6d588 + 7 + 0x78001 = 0xe5590  (same value)
 * @const ProChannel 0xe5590  (CFStringRef in __DATA __cfstring)
 */
export const OZChannelGradientPositioned_POS2_NAME_CFSTRING_ADDR = 0xe5590;

/**
 * CFStringRef returned by getObjCWrapperName(). Verified via
 *   0x6d8ee + 7 + 0x77cbb = 0xe55b0
 * @const ProChannel 0xe55b0  (CFStringRef in __DATA __cfstring)
 */
export const OZChannelGradientPositioned_OBJC_WRAPPER_NAME_CFSTRING_ADDR = 0xe55b0;

/**
 * `movsd 0x44185(%rip), %xmm0` @0x6d27b — read of the double at
 * ProChannel VA 0xb1408. Verified via resolve.py Ozone-style const dump:
 *   double = -100.0   (u64 = 0xc059000000000000)
 * @const ProChannel 0xb1408   (-100.0)
 */
export const OZChannelGradientPositioned_POS1_Y_DEFAULT = -100.0;

/**
 * `movsd 0x42261(%rip), %xmm0` @0x6d2af — read of the double at
 * ProChannel VA 0xaf518. Verified:
 *   double =  100.0   (u64 = 0x4059000000000000)
 * @const ProChannel 0xaf518    (100.0)
 */
export const OZChannelGradientPositioned_POS2_Y_DEFAULT = 100.0;

// -----------------------------------------------------------------------------
// The class.
// -----------------------------------------------------------------------------

/**
 * OZChannelGradientPositioned — ProChannel channel that adds two positioned
 * gradient endpoints to OZChannelGradientExtras.
 * @Ozone n/a — this class lives in ProChannel.framework.
 */
export class OZChannelGradientPositioned {
  /**
   * +0x000 — the primary vtable pointer. Installed as {VTABLE_PRIMARY_VA} by every ctor.
   * Modeled here as a nominal readonly to preserve the C++ layout intent; TS dispatch
   * uses the class prototype instead.
   */
  readonly vptr_primary: number = OZChannelGradientPositioned_VTABLE_PRIMARY_VA;

  /**
   * +0x010 — the secondary vtable pointer (multiple inheritance from a second base).
   * Installed as {VTABLE_SECONDARY_VA} by every ctor.
   */
  readonly vptr_secondary: number = OZChannelGradientPositioned_VTABLE_SECONDARY_VA;

  /**
   * +0x000..+0x420 — the OZChannelGradientExtras parent-subobject. Modeled as an
   * opaque brand until that class is transcribed; every ctor initializes it via
   * OZChannelGradientExtras::C2 before we touch our fields.
   */
  parent: OZChannelGradientExtras;

  /**
   * +0x420 — first positioned endpoint. An OZChannelPosition sub-channel whose
   * default value is (X=0.0, Y=-100.0). Frontier-modeled; ctors call the 7-arg
   * OZChannelPosition::C1 with typeCode=4.
   */
  position1: OZChannelPosition;

  /**
   * +0x6e0 — second positioned endpoint. An OZChannelPosition sub-channel whose
   * default value is (X=0.0, Y=100.0). Frontier-modeled; ctors call the 7-arg
   * OZChannelPosition::C1 with typeCode=5.
   */
  position2: OZChannelPosition;

  /**
   * +0x9a0 — the "do not serialize as root" flag. Zero-initialized at every ctor
   * (@0x6d240 in the 5-arg ctor; the 3/4-arg ctors write the same byte at their
   * mirror offsets); mutated by setDoNotSerializeAsRoot @0x6d8b0.
   */
  doNotSerializeAsRoot: boolean = false;

  // ===========================================================================
  // Constructor overloads.
  // ===========================================================================

  /**
   * @overload
   * @0x6d178  OZChannelGradientPositioned(OZFactory*, PCString const&, OZChannelFolder*, u32, u32)
   * @overload
   * @0x6d32e  OZChannelGradientPositioned(OZFactory*, PCString const&, u32)                (3-arg)
   * @overload
   * @0x6d4e4  OZChannelGradientPositioned(PCString const&, OZChannelFolder*, u32, u32)      (no-factory)
   * @overload
   * @0x6d6c0  OZChannelGradientPositioned(OZChannelGradientPositioned const&, OZChannelFolder*) (copy)
   *
   * The TypeScript ctor dispatches on argument shape. The bodies of the three
   * non-copy factory ctors are structurally identical after their parent-ctor
   * call (byte-verified via diff of the three .s files); only the parent-ctor
   * variant and the initial factory-lookup differ.
   */
  constructor(
    arg0:
      | {
          kind: "factory-5arg";
          factory: unknown;         // OZFactory* — %rsi
          name: unknown;            // PCString const& — %rdx
          folder: unknown;          // OZChannelFolder* — %rcx
          u1: number;               // unsigned int %r8d
          u2: number;               // unsigned int %r9d
        }
      | {
          kind: "factory-3arg";
          factory: unknown;         // OZFactory* — %rsi
          name: unknown;            // PCString const& — %rdx
          u1: number;               // unsigned int %rcx (single u32)
        }
      | {
          kind: "no-factory";
          name: unknown;            // PCString const& — %rsi
          folder: unknown;          // OZChannelFolder* — %rdx
          u1: number;               // unsigned int %rcx
          u2: number;               // unsigned int %r8d
        }
      | {
          kind: "copy";
          rhs: OZChannelGradientPositioned;   // OZChannelGradientPositioned const& — %rsi
          folder: unknown;                    // OZChannelFolder* — %rdx (may be null)
        },
  ) {
    // -------------------------------------------------------------------------
    // Step 1: parent-subobject construction. Every non-copy ctor calls
    // OZChannelGradientExtras::C2 with the appropriate arg-count overload; the
    // copy ctor calls the OZChannelGradientExtras copy-ctor.
    // -------------------------------------------------------------------------
    if (arg0.kind === "copy") {
      // @0x6d6d0 callq OZChannelGradientExtras::C2(const&, OZChannelFolder*)
      this.parent = _OZChannelGradientExtras_copyCtor(arg0.rhs.parent, arg0.folder);
    } else if (arg0.kind === "factory-5arg") {
      // @0x6d18a callq OZChannelGradientExtras::C2(OZFactory*, PCString&, OZChannelFolder*, u32, u32)
      this.parent = _OZChannelGradientExtras_ctor5(arg0.factory, arg0.name, arg0.folder, arg0.u1, arg0.u2);
    } else if (arg0.kind === "factory-3arg") {
      // @0x6d340 callq OZChannelGradientExtras::C2(OZFactory*, PCString&, u32)
      this.parent = _OZChannelGradientExtras_ctor3(arg0.factory, arg0.name, arg0.u1);
    } else {
      // no-factory: fetch the singleton first, then delegate to the 5-arg factory path.
      // @0x6d504 callq OZChannelGradientPositioned_Factory::getInstance()
      const factory = OZChannelGradientPositioned_Factory_getInstance();
      // @0x6d51b callq OZChannelGradientExtras::C2(OZFactory*, PCString&, OZChannelFolder*, u32, u32)
      this.parent = _OZChannelGradientExtras_ctor5(factory, arg0.name, arg0.folder, arg0.u1, arg0.u2);
    }

    // -------------------------------------------------------------------------
    // Step 2: install both vtable pointers. Field initializers above already do
    // this; the ASM sequence is the two `leaq …; movq %rax, (%rbx)` /
    // `movq %rax, 0x10(%rbx)` pairs at each ctor's start.
    // -------------------------------------------------------------------------
    // (No-op in TS — vptr_primary / vptr_secondary field-initializers match.)

    // -------------------------------------------------------------------------
    // Step 3: build the two OZChannelPosition sub-channels.
    // -------------------------------------------------------------------------

    if (arg0.kind === "copy") {
      // @0x6d6fc callq OZChannelPosition::C1(OZChannelPosition const&, OZChannelFolder*)
      this.position1 = _makeUninitializedOZChannelPosition();
      OZChannelPosition_C1_copy(this.position1, arg0.rhs.position1, arg0.folder);
      // @0x6d710 callq OZChannelPosition::C1(OZChannelPosition const&, OZChannelFolder*)
      this.position2 = _makeUninitializedOZChannelPosition();
      OZChannelPosition_C1_copy(this.position2, arg0.rhs.position2, arg0.folder);
      // @0x6d715..1c movb 0x9a0(%r14), %al ; movb %al, 0x9a0(%rbx)
      this.doNotSerializeAsRoot = arg0.rhs.doNotSerializeAsRoot;
      // Copy ctor is DONE — no setDefault/reset chain here (those run only on the
      // factory paths). @0x6d722 addq $8,rsp; pop; retq.
      return;
    }

    // ============= Factory paths =============
    // The remainder of the body is byte-verbatim shared across the 5-arg, 3-arg,
    // and no-factory ctors (verified via diff of their .s dumps). The only
    // observable differences are (a) which parent-ctor overload ran above and
    // (b) which factory instance the no-factory path fetched.

    // Build position1's name via getProChannelBundle() + PCString::C2(CFStringRef, bundle, 0):
    // @0x6d1a4 callq getProChannelBundle()
    const bundle1 = getProChannelBundle();
    // @0x6d1a9 leaq 0x783c0(%rip), %rsi  — CFStringRef @0xe5570
    // @0x6d1b0 leaq -0x28(%rbp), %rdi
    // @0x6d1b9 callq PCString::C2(CFStringRef, __CFBundle*, __CFBundle*, u32=0)
    const name1 = { __brand: "PCString@stack" as const };
    PCString_C2_fromCFString(
      name1,
      OZChannelGradientPositioned_POS1_NAME_CFSTRING_ADDR,
      bundle1,
      0,
    );

    // @0x6d1be leaq 0x420(%rbx), %r14   — %r14 = &this.position1
    this.position1 = _makeUninitializedOZChannelPosition();
    // @0x6d1c5..1e4  build the two zero-arg-stack-args (impl=null, info=null) and
    //   callq OZChannelPosition::C1(name1, this, /*u1=*/4, /*u2=*/0, /*u3=*/2,
    //                                /*impl=*/null, /*info=*/null)
    OZChannelPosition_C1_named(this.position1, name1, this, 4, 0, 2, null, null);
    // @0x6d1ed callq PCString::D2(&name1)
    PCString_D2(name1);

    // Build position2's name (same pattern):
    // @0x6d1f2 callq getProChannelBundle()
    const bundle2 = getProChannelBundle();
    // @0x6d1f7 leaq 0x78392(%rip), %rsi  — CFStringRef @0xe5590
    // @0x6d207 callq PCString::C2(CFStringRef, bundle2, bundle2, 0)
    const name2 = { __brand: "PCString@stack" as const };
    PCString_C2_fromCFString(
      name2,
      OZChannelGradientPositioned_POS2_NAME_CFSTRING_ADDR,
      bundle2,
      0,
    );

    // @0x6d20c leaq 0x6e0(%rbx), %r15   — %r15 = &this.position2
    this.position2 = _makeUninitializedOZChannelPosition();
    // @0x6d232 callq OZChannelPosition::C1(name2, this, /*u1=*/5, /*u2=*/0, /*u3=*/2,
    //                                       /*impl=*/null, /*info=*/null)
    OZChannelPosition_C1_named(this.position2, name2, this, 5, 0, 2, null, null);
    // @0x6d23b callq PCString::D2(&name2)
    PCString_D2(name2);

    // -------------------------------------------------------------------------
    // Step 4: initialize the doNotSerializeAsRoot flag and the four scalar
    // defaults.
    // -------------------------------------------------------------------------

    // @0x6d240 movb $0x0, 0x9a0(%rbx)
    this.doNotSerializeAsRoot = false;

    // @0x6d247..251 OZChannelBase::resetFlag(&position1, /*mask=*/0x10ull, /*propagate=*/false)
    OZChannelBase_resetFlag(this.position1, 0x10n, false);
    // @0x6d256..260 OZChannelBase::resetFlag(&position2, 0x10, false)
    OZChannelBase_resetFlag(this.position2, 0x10n, false);

    // The four setDefaultValue calls target scalar OZChannel* sub-fields located
    // at position1+0x88 (X-value), position1+0x120 (Y-value), position2+0x88,
    // position2+0x120. We can't hand-open OZChannelPosition here, so we route
    // via the helper OZChannel_setDefaultValue frontier stub, tagged with the
    // exact ADDR of the scalar sub-field.

    // @0x6d265..26f  OZChannel::setDefaultValue(&this+0x4a8, 0.0)
    OZChannel_setDefaultValue(
      _scalarChannelAt(this.position1, 0x88, 0x4a8),
      0.0,
    );
    // @0x6d274..283  OZChannel::setDefaultValue(&this+0x540, -100.0 @ProChannel 0xb1408)
    OZChannel_setDefaultValue(
      _scalarChannelAt(this.position1, 0x120, 0x540),
      OZChannelGradientPositioned_POS1_Y_DEFAULT,
    );
    // @0x6d288..28d  OZChannelBase::reset(&position1, false)
    OZChannelBase_reset(this.position1, false);
    // @0x6d292        movb $0x0, 0x5d8(%rbx)   — position1+0x1b8 bool = 0
    _resetBoolAt(this.position1, 0x1b8);

    // @0x6d299..2a3  OZChannel::setDefaultValue(&this+0x768, 0.0)
    OZChannel_setDefaultValue(
      _scalarChannelAt(this.position2, 0x88, 0x768),
      0.0,
    );
    // @0x6d2a8..2b7  OZChannel::setDefaultValue(&this+0x800, 100.0 @ProChannel 0xaf518)
    OZChannel_setDefaultValue(
      _scalarChannelAt(this.position2, 0x120, 0x800),
      OZChannelGradientPositioned_POS2_Y_DEFAULT,
    );
    // @0x6d2bc..2c1  OZChannelBase::reset(&position2, false)
    OZChannelBase_reset(this.position2, false);
    // @0x6d2c6        movb $0x0, 0x898(%rbx)   — position2+0x1b8 bool = 0
    _resetBoolAt(this.position2, 0x1b8);
    // @0x6d2cd..2d9  epilogue.
  }

  // ===========================================================================
  // Destructor  — D2 @0x6d758, D1 @0x6d79e (ICF alias), D0 @0x6d7b4.
  //
  // D2 body:
  //   *(this+0x00)  = &vtable_primary+0x10   ; re-install primary vptr (destroy phase vtable slot)
  //   *(this+0x10)  = &vtable_secondary+0x10 ; re-install secondary vptr
  //   OZChannelPosition::D1(this + 0x6e0)     ; destroy position2 first  (@0x6d77d)
  //   OZChannelPosition::D1(this + 0x420)     ; then position1           (@0x6d789)
  //   jmp OZChannelGradientExtras::D2(this)   ; tail-jump into parent    (@0x6d797)
  //
  // D0 body: call D2, then jmp ::operator delete (@0x6d7cb).
  // ===========================================================================

  /** OZChannelGradientPositioned::~OZChannelGradientPositioned()  @0x6d758 (D2/D1 shared body). */
  destroy(): void {
    // Vptr re-install is a no-op in TS (we don't model per-phase vtables).
    // @0x6d77d — destroy position2 first (reverse construction order).
    OZChannelPosition_D1(this.position2);
    // @0x6d789 — destroy position1.
    OZChannelPosition_D1(this.position1);
    // @0x6d797 tail-jump: OZChannelGradientExtras::~()
    _OZChannelGradientExtras_dtor(this.parent);
  }

  // ===========================================================================
  // setDoNotSerializeAsRoot(bool)  @0x6d8ac.
  //
  // Body:  pushq rbp; movq rsp,rbp; movb %sil, 0x9a0(%rdi); popq rbp; retq
  // ===========================================================================

  /** OZChannelGradientPositioned::setDoNotSerializeAsRoot(bool)  @0x6d8ac. */
  setDoNotSerializeAsRoot(v: boolean): void {
    // @0x6d8b0 movb %sil, 0x9a0(%rdi)
    this.doNotSerializeAsRoot = v;
  }

  // ===========================================================================
  // getObjCWrapperName()  @0x6d8ea.
  //
  // Body:  pushq rbp; movq rsp,rbp; leaq 0x77cbb(%rip), %rax; popq rbp; retq
  //   -> returns CFStringRef @0xe55b0.
  // ===========================================================================

  /** OZChannelGradientPositioned::getObjCWrapperName()  @0x6d8ea. */
  getObjCWrapperName(): number {
    // @0x6d8ee leaq 0x77cbb(%rip), %rax   — CFStringRef @0xe55b0
    return OZChannelGradientPositioned_OBJC_WRAPPER_NAME_CFSTRING_ADDR;
  }

  // ===========================================================================
  // writeHeader(PCSerializerWriteStream&, bool)  @0x6d8ba  (thin tail-trampoline).
  //   Body:  pushq rbp; movq rsp,rbp; popq rbp;
  //          jmp OZChannelGradient::writeHeader(PCSerializerWriteStream&, bool)
  // ===========================================================================

  /** OZChannelGradientPositioned::writeHeader — @0x6d8ba tail-jmps to OZChannelGradient::writeHeader. */
  writeHeader(stream: unknown, flag: boolean): void {
    // @0x6d8bf jmp OZChannelGradient::writeHeader
    OZChannelGradient_writeHeader(this, stream, flag);
  }

  // ===========================================================================
  // writeBody(PCSerializerWriteStream&, bool, bool, bool)  @0x6d8d2  (thin trampoline).
  //   Body:  pushq rbp; movq rsp,rbp; popq rbp;
  //          jmp OZChannelGradient::writeBody(PCSerializerWriteStream&, bool, bool, bool)
  // ===========================================================================

  /** OZChannelGradientPositioned::writeBody — @0x6d8d2 tail-jmps to OZChannelGradient::writeBody. */
  writeBody(stream: unknown, a: boolean, b: boolean, c: boolean): void {
    // @0x6d8d7 jmp OZChannelGradient::writeBody
    OZChannelGradient_writeBody(this, stream, a, b, c);
  }

  // ===========================================================================
  // copy(OZChannelBase const*, bool)  @0x6d834.
  //
  // Body:
  //   OZChannelGradientExtras::copy(this, rhs, keyframed)                @0x6d847
  //   if (rhs != null) {                                                 @0x6d84c .je
  //     rhs = __dynamic_cast(rhs, &typeinfo<OZChannelBase>,
  //                          &typeinfo<OZChannelGradientPositioned>, 0)  @0x6d864
  //   }
  //   pos1_rhs = (rhs != null) ? rhs + 0x420 : null
  //   OZChannelPosition::copy(this+0x420, pos1_rhs, keyframed)          @0x6d884
  //   pos2_rhs = (rhs != null) ? rhs + 0x6e0 : null
  //   TAIL-JMP:
  //     OZChannelPosition::copy(this+0x6e0, pos2_rhs, keyframed)          @0x6d8a7
  // ===========================================================================

  /** OZChannelGradientPositioned::copy(OZChannelBase const*, bool)  @0x6d834. */
  copyFrom(rhs: unknown | null, keyframed: boolean): void {
    // @0x6d847 — chain to parent copy first.
    OZChannelGradientExtras_copy(this, (rhs as OZChannelGradientPositioned | null), keyframed);
    // @0x6d84c..869 — RTTI downcast.
    let downcast: OZChannelGradientPositioned | null;
    if (rhs !== null && rhs !== undefined) {
      downcast = _dynamic_cast_to_OZChannelGradientPositioned(rhs);
    } else {
      // @0x6d86e xorl %r15d, %r15d  — the null branch keeps r15 = 0.
      downcast = null;
    }
    // @0x6d871..884 — position1.copy(rhs->position1, keyframed)
    OZChannelPosition_copy(
      this.position1,
      downcast !== null ? downcast.position1 : null,
      keyframed,
    );
    // @0x6d889..8a7 tail-jmp — position2.copy(rhs->position2, keyframed)
    OZChannelPosition_copy(
      this.position2,
      downcast !== null ? downcast.position2 : null,
      keyframed,
    );
  }
}

// -----------------------------------------------------------------------------
// Small local helpers — each cited to its call-site in the disasm.
// -----------------------------------------------------------------------------

/**
 * @internal Placeholder for the OZChannelPosition subobject slot before its C1
 * ctor runs. In C++ the memory is UNINITIALIZED (raw storage on the parent's
 * this-object); the C1 ctor writes fields into place. TS has no equivalent of
 * uninitialized storage, so we hand out a sentinel that ONLY the C1 ctor is
 * allowed to overwrite. Any read of this before C1 completes indicates a bug
 * in the port.
 * @frontier ProChannel OZChannelPosition
 */
function _makeUninitializedOZChannelPosition(): OZChannelPosition {
  // Structurally-typed sentinel — safe to hand into the C1 ctor stubs above.
  return {} as OZChannelPosition;
}

/**
 * @internal `_scalarChannelAt(sub, subOffset, thisOffset)` — resolves a scalar
 * OZChannel* buried inside an OZChannelPosition. The pair (thisOffset, subOffset)
 * mirrors the ASM's `leaq 0xXXX(%rbx)` form (thisOffset = position-slot + subOffset).
 * We hand off through a placeholder because OZChannelPosition's internal scalar
 * fields are frontier.
 * @frontier ProChannel OZChannelPosition scalar sub-fields
 */
function _scalarChannelAt(_pos: OZChannelPosition, _subOff: number, _thisOff: number): unknown {
  return { __brand: "OZChannel@subfield" as const };
}

/**
 * @internal `_resetBoolAt(pos, offset)` — set a byte inside the OZChannelPosition
 * subobject to 0. The ASM sequence `movb $0x0, 0xNNN(%rbx)` at @0x6d292 and @0x6d2c6
 * writes offsets +0x1b8 within each position. Deferred to the OZChannelPosition port.
 * @frontier ProChannel OZChannelPosition +0x1b8 bool
 */
function _resetBoolAt(_pos: OZChannelPosition, _offset: number): void {
  // No-op today: real behavior lives in the OZChannelPosition port.
}

/**
 * @internal OZChannelGradientExtras 5-arg factory ctor stub.
 * @frontier ProChannel OZChannelGradientExtras::C2(OZFactory*, PCString&, OZChannelFolder*, u32, u32) at call-site 0x6d18a
 */
function _OZChannelGradientExtras_ctor5(
  _fac: unknown, _name: unknown, _folder: unknown, _u1: number, _u2: number,
): OZChannelGradientExtras {
  throw new Error(
    "OZChannelGradientExtras::C2(OZFactory*, PCString&, OZChannelFolder*, u32, u32) " +
      "@ProChannel not yet transcribed (call-site @0x6d18a)",
  );
}

/**
 * @internal OZChannelGradientExtras 3-arg factory ctor stub.
 * @frontier ProChannel OZChannelGradientExtras::C2(OZFactory*, PCString&, u32) at call-site 0x6d340
 */
function _OZChannelGradientExtras_ctor3(
  _fac: unknown, _name: unknown, _u1: number,
): OZChannelGradientExtras {
  throw new Error(
    "OZChannelGradientExtras::C2(OZFactory*, PCString&, u32) @ProChannel not yet transcribed " +
      "(call-site @0x6d340)",
  );
}

/**
 * @internal OZChannelGradientExtras copy-ctor stub.
 * @frontier ProChannel OZChannelGradientExtras::C2(const&, OZChannelFolder*) at call-site 0x6d6d0
 */
function _OZChannelGradientExtras_copyCtor(
  _rhs: OZChannelGradientExtras, _folder: unknown,
): OZChannelGradientExtras {
  throw new Error(
    "OZChannelGradientExtras::C2(const&, OZChannelFolder*) @ProChannel not yet transcribed " +
      "(call-site @0x6d6d0)",
  );
}

/**
 * @internal OZChannelGradientExtras dtor stub.
 * @frontier ProChannel OZChannelGradientExtras::~OZChannelGradientExtras at tail-jump 0x6d797
 */
function _OZChannelGradientExtras_dtor(_self: OZChannelGradientExtras): void {
  throw new Error(
    "OZChannelGradientExtras::~OZChannelGradientExtras @ProChannel not yet transcribed " +
      "(tail-jump from OZChannelGradientPositioned::~... @0x6d797)",
  );
}
