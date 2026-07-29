// raw-port/src/channels/OZChannelRetimeFrame.ts
//
// FCP `OZChannelRetimeFrame` — the "retime frame" channel in the OZChannel family
// (Ozone.framework). It is a subclass of `OZChannelDouble` (all four ctors chain
// through OZChannelDouble; the copy ctor chains directly through the OZChannel
// base copy ctor — same pattern as every other OZChannel<T> concrete type). The
// only class-specific behavior is:
//   1. Installing this class's own primary+secondary vptrs (all four ctors and
//      `clone()` install the SAME two vtable addresses — verified by RIP arithmetic).
//   2. Setting a single flag bit at +0x39 in the OZChannel base subobject
//      (`orb $0x1, 0x39(%rbx)` at the tail of every ctor).
//   3. `clone()` — new + OZChannel copy-ctor + vtable install (size 0x98 bytes).
//   4. `getOutputValues()` — a 4-instruction tail-jump into a static utility in
//      RetimingMath (not a virtual dispatch: the sole body is
//      `push rbp / mov rsp,rbp / pop rbp / jmp <stub>`).
//
// Framework: Ozone
// Provenance (raw-port/re/disasm/OZChannelRetimeFrame.*.s + spot-fetched otool -tvV
// blocks; all @0x addresses are Ozone x86_64 slice VAs):
//   OZChannelRetimeFrame(double, PCString const&, OZChannelFolder*, uint, uint)                 [C2] @0x4edd90
//     (__ZN20OZChannelRetimeFrameC2EdRK8PCStringP15OZChannelFolderjj)
//   OZChannelRetimeFrame(double, PCString const&, OZChannelFolder*, uint, uint)                 [C1] @0x4eddd0
//     (__ZN20OZChannelRetimeFrameC1EdRK8PCStringP15OZChannelFolderjj)
//   OZChannelRetimeFrame(OZFactory*, PCString const&, uint)                                     [C2] @0x4ede10
//     (__ZN20OZChannelRetimeFrameC2EP9OZFactoryRK8PCStringj)
//   OZChannelRetimeFrame(OZFactory*, PCString const&, uint)                                     [C1] @0x4edf80
//     (__ZN20OZChannelRetimeFrameC1EP9OZFactoryRK8PCStringj)
//   OZChannelRetimeFrame(OZChannelRetimeFrame const&, OZChannelFolder*)                         [C2] @0x4edfc0
//     (__ZN20OZChannelRetimeFrameC2ERKS_P15OZChannelFolder)
//   OZChannelRetimeFrame(OZChannelRetimeFrame const&, OZChannelFolder*)                         [C1] @0x4edff0
//     (__ZN20OZChannelRetimeFrameC1ERKS_P15OZChannelFolder)
//   ~OZChannelRetimeFrame()                                                                    [D2] @0x4ee020
//   ~OZChannelRetimeFrame()                                                                    [D1] @0x4ee030
//   ~OZChannelRetimeFrame()                                                                    [D0] @0x4ee050
//   clone() const                                                                                  @0x4ee0a0
//     (__ZNK20OZChannelRetimeFrame5cloneEv)
//   getOutputValues(double, double, CMTime const&, RetimingMath::IntervalSet<double>&) const     @0x4ee100
//     (__ZNK20OZChannelRetimeFrame15getOutputValuesEddRK6CMTimeRN12RetimingMath11IntervalSetIdEE)
//
// Vtable (via ctor RIP-relative writes — every ctor installs the SAME two addresses):
//   Primary vtable    __ZTV20OZChannelRetimeFrame + 0x10   installed at (this+0x00) — target 0x877c88
//   Secondary vtable  __ZTV20OZChannelRetimeFrame + 0x370  installed at (this+0x10) — target 0x877fe8
//   Absolute base of __ZTV20OZChannelRetimeFrame == 0x877c78 (== 0x877c88 - 0x10).
//   (resolve.py Ozone sym 0x877c88 -> "vtable for OZChannelRetimeFrame (+0x10)"; same for 0x877fe8.)
//   RIP-relative displacements at each install site (all resolve to those two constants):
//     C2_5arg  slot0  @0x4edda9 disp 0x389ed8      slot16 @0x4eddb3 disp 0x38a22e
//     C1_5arg  slot0  @0x4edde9 disp 0x389e98      slot16 @0x4eddf3 disp 0x38a1ee
//     C2_3arg  slot0  @0x4ede24 disp 0x389e5d      slot16 @0x4ede2e disp 0x38a1b3
//     C1_3arg  slot0  @0x4edf94 disp 0x389ced      slot16 @0x4edf9e disp 0x38a043
//     CopyC2   slot0  @0x4edfce disp 0x389cb3      slot16 @0x4edfd8 disp 0x38a009
//     CopyC1   slot0  @0x4edffe disp 0x389c83      slot16 @0x4ee008  disp 0x389fd9
//     clone    slot0  @0x4ee0c4 disp 0x389bbd      slot16 @0x4ee0ce  disp 0x389f13
//   (target = (leaq_addr + 7) + disp; every row above evaluates to 0x877c88 / 0x877fe8.)
//
// STRUCT LAYOUT (recovered from the ctors + clone; identical to every other OZChannel<T>
// subclass because OZChannelDouble / OZChannel own the entire layout):
//   +0x000  primary vptr        (=vtable[OZChannelRetimeFrame]+0x10)
//   +0x010  secondary vptr      (=vtable[OZChannelRetimeFrame]+0x370)
//   +0x018..+0x038  OZChannelBase / OZChannel inherited state (opaque here — parsed in
//                    src/channels/OZChannel.ts and src/channels/OZChannelBase.ts).
//   +0x039  u8 flag byte        (all six ctors do `orb $0x1, 0x39(%rbx)` — SET BIT 0 to 1 at
//                                the tail of construction. Semantic: the class-specific bit
//                                signalling "retime-frame channel" within the base's flag byte.
//                                Same address across every ctor: 0x4eddbe / 0x4eddfe / 0x4ede39
//                                / 0x4edfa9 / 0x4edfe3 / 0x4ee013.)
//   +0x070  OZChannelImpl*      impl_primary   (mirror of +0x78; written by OZChannelDouble ctor)
//   +0x078  OZChannelImpl*      impl_secondary (base slot)
//   +0x080  OZChannelInfo*      info_primary   (mirror of +0x88)
//   +0x088  OZChannelInfo*      info_secondary (base slot)
//   sizeof(OZChannelRetimeFrame) = 0x98 == 152  (from `movl $0x98, %edi` @0x4ee0aa in clone —
//                                                 the exact new[] size for a clone.)
//   Bytes at +0x018..+0x038 and +0x03a..+0x070 are inherited OZChannel state; none of the
//   ports here touches them beyond the +0x39 flag bit.
//
// Callees (resolved via raw-port/army/tools/resolve.py Ozone …):
//   __ZN15OZChannelDoubleC2EdRK8PCStringP15OZChannelFolderjjP13OZChannelImplP13OZChannelInfo
//                                                       // OZChannelDouble ctor (7-arg dbl form,
//                                                       //   @Ozone 0xa99f0) — called direct
//                                                       //   from C2/C1 dbl ctors @0x4edd9c/@0x4eddc4.
//   __ZN15OZChannelDoubleC2EP9OZFactoryRK8PCStringjP13OZChannelImplP13OZChannelInfo
//                                                       // OZChannelDouble ctor (5-arg factory
//                                                       //   form, @Ozone 0x4ede50) — called direct
//                                                       //   from C2/C1 3-arg ctors @0x4ede1f/@0x4edf8f.
//   __ZN9OZChannelC2ERKS_P15OZChannelFolder             // OZChannel copy ctor (@Ozone stub 0x6df47a)
//                                                       //   — called from copy C2/C1 @0x4edfc9/@0x4edff9
//                                                       //   and from clone() @0x4ee0bf.
//   __ZN9OZChannelD2Ev                                   // OZChannel::~OZChannel() (@Ozone stub 0x6df480)
//                                                       //   — tail-jmp from D2/D1 and body call from D0.
//   __Znwm                                               // operator new(size_t) (@Ozone stub 0x6dfca2)
//                                                       //   — clone() @0x4ee0af.
//   __ZdlPv                                              // operator delete(void*) (@Ozone stub 0x6dfc36)
//                                                       //   — clone() unwind pad @0x4ee0eb and D0 @0x4ee067.
//   __Unwind_Resume                                      // (@Ozone stub 0x6dd07a)
//                                                       //   — clone() unwind pad @0x4ee0f3.
//   __ZN12RetimingMath23ChannelOutputValuesUtil15getOutputValuesERK15OZChannelDoubleddRK6CMTimeRNS_11IntervalSetIdEE
//                                                       // RetimingMath::ChannelOutputValuesUtil::
//                                                       //   getOutputValues(OZChannelDouble const&,
//                                                       //     double, double, CMTime const&,
//                                                       //     RetimingMath::IntervalSet<double>&)
//                                                       //   (@Ozone stub 0x6dd76a) — tail-jmp from
//                                                       //   OZChannelRetimeFrame::getOutputValues @0x4ee105.
//
// Note the D2/D1 disassembly:
//     0x4ee020..0x4ee025 : pushq %rbp / movq %rsp,%rbp / popq %rbp / jmp OZChannel::~OZChannel()
//     0x4ee030..0x4ee035 : (identical body, D1 == D2 — no per-class field to unwind)
// The D0 (deleting) dtor is a normal D2 call followed by operator delete:
//     0x4ee050..0x4ee067 : call OZChannel::~OZChannel(); jmp operator delete.
// There is NO per-class field destruction — the class adds no owning fields on top of the base.
//
// There is also a thunk `__ZThn16_N20OZChannelRetimeFrameD1Ev` @0x4ee040 which subtracts 16 from
// the this-pointer (to reach the primary subobject from the secondary vptr) and tail-jumps to
// OZChannel::~OZChannel(). In TS we model this via ordinary single-inheritance destruction; the
// thunk is a C++ ABI implementation detail that has no TS analog.
//
// DECODE-DON'T-FIT: every field write, every vtable install, every ctor delegation is transcribed
// byte-for-byte below. Every un-decoded callee is a throwing stub citing its Ozone stub address.

import { OZChannelDouble } from "./OZChannelDouble.js";
import type { OZChannelFolder, OZChannelImpl, OZChannelInfo, OZFactory } from "./OZChannelDouble.js";
import type { PCString } from "../infra/PCString.js";

// ---------------------------------------------------------------------------------------------
// Frontier stubs. Every real invocation throws citing the @Ozone address it comes from.
// ---------------------------------------------------------------------------------------------

/** External `__ZN15OZChannelDoubleC2EdRK8PCStringP15OZChannelFolderjjP13OZChannelImplP13OZChannelInfo`
 *  @Ozone 0xa99f0 — the OZChannelDouble ctor (double,PCString,Folder*,u32,u32,Impl*,Info*).
 *  Called direct (not through a stub) from OZChannelRetimeFrame C2/C1 dbl ctors @0x4edd9c and
 *  @0x4eddc4.  OZChannelDouble's own body lives in OZChannelDouble.ts, but the seven-arg form
 *  taken here isn't ported there yet — that shape lands with `OZChannelDouble::newFromDouble`. */
function OZChannelDouble_ctor_double(
  _self: OZChannelRetimeFrame,
  _defaultValue: number,
  _name: PCString | string,
  _folder: OZChannelFolder | null,
  _u1: number,
  _u2: number,
  _impl: OZChannelImpl | null,
  _info: OZChannelInfo | null,
): void {
  throw new Error(
    "OZChannelDouble::OZChannelDouble(double, PCString const&, OZChannelFolder*, uint, uint, " +
      "OZChannelImpl*, OZChannelInfo*) @Ozone 0xa99f0 " +
      "(__ZN15OZChannelDoubleC2EdRK8PCStringP15OZChannelFolderjjP13OZChannelImplP13OZChannelInfo) " +
      "not yet transcribed — invoked by OZChannelRetimeFrame(double,...) @Ozone 0x4edd9c / 0x4eddc4"
  );
}

/** External `__ZN15OZChannelDoubleC2EP9OZFactoryRK8PCStringjP13OZChannelImplP13OZChannelInfo`
 *  @Ozone 0x4ede50 — the OZChannelDouble ctor (OZFactory*,PCString,u32,Impl*,Info*). Called
 *  direct (not through a stub) from OZChannelRetimeFrame C2/C1 3-arg ctors @0x4ede1f and
 *  @0x4edf8f. This is `OZChannelDouble.newFromFactory` in the sibling port — but we deliberately
 *  do NOT wire to that here because the RetimeFrame ctors' impl/info arg pair is `NULL, NULL`
 *  (both `xorl %r8d,%r8d` and `xorl %r9d,%r9d` are set @0x4ede19/0x4ede1c before the call), and
 *  the OZChannelDouble body itself is not fully ported (its OZChannel_base_ctor callee still
 *  throws). Wiring through would double-throw. Keep frontier explicit. */
function OZChannelDouble_ctor_factory(
  _self: OZChannelRetimeFrame,
  _factory: OZFactory,
  _name: PCString | string,
  _u1: number,
  _impl: OZChannelImpl | null,
  _info: OZChannelInfo | null,
): void {
  throw new Error(
    "OZChannelDouble::OZChannelDouble(OZFactory*, PCString const&, uint, OZChannelImpl*, " +
      "OZChannelInfo*) @Ozone 0x4ede50 " +
      "(__ZN15OZChannelDoubleC2EP9OZFactoryRK8PCStringjP13OZChannelImplP13OZChannelInfo) " +
      "not yet transcribed — invoked by OZChannelRetimeFrame(OZFactory*,...) @Ozone 0x4ede1f / 0x4edf8f"
  );
}

/** External `__ZN9OZChannelC2ERKS_P15OZChannelFolder` — OZChannel base copy ctor. Reached
 *  through Ozone symbol stub @0x6df47a (see raw-port/army/tools/resolve.py Ozone stub 0x6df47a).
 *  Called from OZChannelRetimeFrame copy C2/C1 @0x4edfc9/@0x4edff9 and from clone() @0x4ee0bf.
 *  A sibling copy ctor is ported in src/channels/OZChannel.ts (`OZChannel__C2_copy`), but its
 *  callee OZChannelBase copy path is still frontier — we keep a throw here to avoid silently
 *  masking that gap. */
function OZChannel_base_copy_ctor(
  _self: OZChannelRetimeFrame,
  _other: OZChannelRetimeFrame,
  _folder: OZChannelFolder | null,
): void {
  throw new Error(
    "OZChannel::OZChannel(OZChannel const&, OZChannelFolder*) @Ozone stub 0x6df47a " +
      "(__ZN9OZChannelC2ERKS_P15OZChannelFolder) not yet transcribed — invoked by " +
      "OZChannelRetimeFrame copy ctors @Ozone 0x4edfc9 / 0x4edff9 and by clone() @0x4ee0bf"
  );
}

/** External `__ZN9OZChannelD2Ev` — OZChannel base destructor (D2). Reached through Ozone symbol
 *  stub @0x6df480. Called from every OZChannelRetimeFrame dtor (D2/D1 tail-jmp @0x4ee025/0x4ee035,
 *  D0 body-call @0x4ee059) and the thunk @0x4ee040. */
function OZChannel_base_dtor(_self: OZChannelRetimeFrame): void {
  throw new Error(
    "OZChannel::~OZChannel() @Ozone stub 0x6df480 (__ZN9OZChannelD2Ev) not yet transcribed — " +
      "invoked by OZChannelRetimeFrame dtors @Ozone 0x4ee025 / 0x4ee035 / 0x4ee059"
  );
}

/** External `__ZN12RetimingMath23ChannelOutputValuesUtil15getOutputValuesERK15OZChannelDoubleddRK6CMTimeRNS_11IntervalSetIdEE`
 *  — `RetimingMath::ChannelOutputValuesUtil::getOutputValues(OZChannelDouble const&, double,
 *  double, CMTime const&, RetimingMath::IntervalSet<double>&)`. Reached through Ozone symbol
 *  stub @0x6dd76a. This is the ENTIRE body of OZChannelRetimeFrame::getOutputValues — the class
 *  merely re-labels the same call through a virtual dispatch (see disasm: 4-instruction tail jmp).
 */
function RetimingMath_ChannelOutputValuesUtil_getOutputValues(
  _channel: OZChannelRetimeFrame,
  _a: number,
  _b: number,
  _t: CMTime,
  _out: RetimingMathIntervalSetDouble,
): void {
  throw new Error(
    "RetimingMath::ChannelOutputValuesUtil::getOutputValues(OZChannelDouble const&, double, " +
      "double, CMTime const&, RetimingMath::IntervalSet<double>&) @Ozone stub 0x6dd76a " +
      "(__ZN12RetimingMath23ChannelOutputValuesUtil15getOutputValuesERK15OZChannelDoubleddRK6CMTimeRNS_11IntervalSetIdEE) " +
      "not yet transcribed — invoked by OZChannelRetimeFrame::getOutputValues @Ozone 0x4ee105"
  );
}

// ---------------------------------------------------------------------------------------------
// Opaque referenced types.
// ---------------------------------------------------------------------------------------------

/** `CMTime` — CoreMedia time value. Concrete definition lives elsewhere; only the shape
 *  needed by our stub signature (rational time). The base ctor for `getOutputValues` takes
 *  it by const-ref; we treat it opaquely here. */
export interface CMTime {
  readonly __brand: "CMTime";
}

/** `RetimingMath::IntervalSet<double>` — the out-parameter of `getOutputValues`. Opaque here;
 *  populated by the RetimingMath utility which we do not decode in this port unit. */
export interface RetimingMathIntervalSetDouble {
  readonly __brand: "RetimingMath::IntervalSet<double>";
}

// ---------------------------------------------------------------------------------------------
// The class body — every ctor is a faithful transcription; every field write cites @0xADDR.
// ---------------------------------------------------------------------------------------------

/**
 * OZChannelRetimeFrame — the "retime frame" channel. Six ctors + three dtors + a clone + a
 * 4-instruction getOutputValues tail-forwarder to RetimingMath. All body decoded. Any state
 * beyond the +0x39 flag byte lives in the OZChannelDouble / OZChannel / OZChannelBase inherited
 * subobjects.
 */
export class OZChannelRetimeFrame extends OZChannelDouble {
  /** Primary vptr @Ozone 0x877c88 = __ZTV20OZChannelRetimeFrame + 0x10. Written at (this+0x00) by
   *  every ctor (see file header table). Implicit in TS via class identity. */
  // (vtable slot is implicit)

  /** Secondary vptr @Ozone 0x877fe8 = __ZTV20OZChannelRetimeFrame + 0x370. Written at (this+0x10)
   *  by every ctor. Implicit in TS. */
  // (secondary vtable slot is implicit)

  /**
   * +0x039 flag byte — bit 0 SET by every ctor via `orb $0x1, 0x39(%rbx)`. All six ctors
   * write to this byte at the same instruction pattern (@0x4eddbe / @0x4eddfe / @0x4ede39
   * / @0x4edfa9 / @0x4edfe3 / @0x4ee013). It sits inside the OZChannel base's flag word; the
   * ctors above merely OR-in the RetimeFrame-specific bit. We model it as an explicit u8 on
   * the class instance to make the write observable.
   */
  flag_0x39: number = 0;

  private constructor() {
    super();
  }

  // -------------------------------------------------------------------------------------------
  // Ctor variant 1 — (double defaultValue, PCString const& name, OZChannelFolder* folder,
  //                   uint uint1, uint uint2)
  // -------------------------------------------------------------------------------------------
  /**
   * @Ozone 0x4edd90 (C2) — `__ZN20OZChannelRetimeFrameC2EdRK8PCStringP15OZChannelFolderjj`.
   *
   * Faithful transcription of the 19-instruction body (see
   * raw-port/re/disasm/OZChannelRetimeFrame.OZChannelRetimeFrame.s — recorded for the C1 shim
   * at 0x4eddd0 which is byte-identical modulo the vtable-install RIP displacements):
   *   @0x4edd90-95 : function prologue (push rbp/mov rsp,rbp/push rbx/push rax).
   *   @0x4edd96    : `movq %rdi, %rbx` — save `this`.
   *   @0x4edd99    : `movq $0x0, (%rsp)` — 7th stack arg `info` = NULL.
   *   @0x4edda1    : `xorl %r9d, %r9d` — 6th arg `impl` = NULL (r9 is the last register arg).
   *   @0x4edda4    : `callq __ZN15OZChannelDoubleC2EdRK8PCStringP15OZChannelFolderjjP13OZChannelImplP13OZChannelInfo`
   *                   — OZChannelDouble base ctor (7-arg dbl form).
   *   @0x4edda9    : `leaq 0x389ed8(%rip), %rax` — rax = 0x877c88 (vtable+0x10).
   *   @0x4eddb0    : `movq %rax, (%rbx)` — store primary vptr at (this+0x00).
   *   @0x4eddb3    : `leaq 0x38a22e(%rip), %rax` — rax = 0x877fe8 (vtable+0x370).
   *   @0x4eddba    : `movq %rax, 0x10(%rbx)` — store secondary vptr at (this+0x10).
   *   @0x4eddbe    : `orb $0x1, 0x39(%rbx)` — set bit 0 at (this+0x39).
   *   @0x4eddc2-c8 : epilogue.
   *
   * @param defaultValue rdi-passed double (see calling convention — actually xmm0 for a
   *                      leading double param in sysV ABI; the disassembly saves it into the
   *                      OZChannelDouble ctor's inbound `xmm0`).
   */
  static newWithDouble(
    defaultValue: number,
    name: PCString | string,
    folder: OZChannelFolder | null,
    uint1: number,
    uint2: number,
  ): OZChannelRetimeFrame {
    const self = new OZChannelRetimeFrame();

    // @0x4edd99..@0x4edda4 : `impl` and `info` both NULL for this ctor.
    OZChannelDouble_ctor_double(self, defaultValue, name, folder, uint1, uint2, /*impl*/ null, /*info*/ null);

    // @0x4edda9..@0x4eddba : install both vptrs. Implicit in the TS class identity.
    // (Primary vptr    -> @Ozone 0x877c88.)
    // (Secondary vptr  -> @Ozone 0x877fe8.)

    // @0x4eddbe : set the class-specific flag bit at +0x39.
    self.flag_0x39 |= 0x01;

    return self;
  }

  /**
   * C1 shim @Ozone 0x4eddd0 — `__ZN20OZChannelRetimeFrameC1EdRK8PCStringP15OZChannelFolderjj`.
   * Byte-identical body to the C2 above (same instruction sequence, only the two vtable
   * displacements differ so both point to the same absolute vtable addresses). In the C++ ABI
   * the C1 vs C2 pair exists because of virtual-base construction; here there is no virtual
   * base so both bodies emit the exact same code — modelling as a single TS entry point is
   * therefore faithful.
   *
   * We expose it as an alias so callers that were compiled against the C1 mangling still resolve.
   */
  static newWithDouble_C1 = OZChannelRetimeFrame.newWithDouble;

  // -------------------------------------------------------------------------------------------
  // Ctor variant 2 — (OZFactory* factory, PCString const& name, uint uint1)
  // -------------------------------------------------------------------------------------------
  /**
   * @Ozone 0x4ede10 (C2) — `__ZN20OZChannelRetimeFrameC2EP9OZFactoryRK8PCStringj`.
   *
   * Faithful transcription (see raw-port/re/disasm/OZChannelRetimeFrame.OZChannelRetimeFrame.s
   * for the C1 shim at 0x4edf80 which is byte-identical modulo vtable-install displacements):
   *   @0x4ede10-15 : prologue.
   *   @0x4ede16    : `movq %rdi, %rbx` — save `this`.
   *   @0x4ede19    : `xorl %r8d, %r8d` — 4th register arg `impl` = NULL.
   *   @0x4ede1c    : `xorl %r9d, %r9d` — 5th register arg `info` = NULL.
   *   @0x4ede1f    : `callq __ZN15OZChannelDoubleC2EP9OZFactoryRK8PCStringjP13OZChannelImplP13OZChannelInfo`
   *                   — OZChannelDouble base ctor (5-arg factory form).
   *   @0x4ede24    : `leaq 0x389e5d(%rip), %rax` — rax = 0x877c88 (vtable+0x10).
   *   @0x4ede2b    : `movq %rax, (%rbx)` — store primary vptr at (this+0x00).
   *   @0x4ede2e    : `leaq 0x38a1b3(%rip), %rax` — rax = 0x877fe8 (vtable+0x370).
   *   @0x4ede35    : `movq %rax, 0x10(%rbx)` — store secondary vptr at (this+0x10).
   *   @0x4ede39    : `orb $0x1, 0x39(%rbx)` — set bit 0 at (this+0x39).
   *   @0x4ede3d-43 : epilogue.
   */
  static newWithFactory(factory: OZFactory, name: PCString | string, uint1: number): OZChannelRetimeFrame {
    const self = new OZChannelRetimeFrame();

    // @0x4ede19..@0x4ede1f : impl=NULL, info=NULL.
    OZChannelDouble_ctor_factory(self, factory, name, uint1, /*impl*/ null, /*info*/ null);

    // @0x4ede24..@0x4ede35 : install both vptrs (implicit in TS class identity).

    // @0x4ede39 : set the class-specific flag bit at +0x39.
    self.flag_0x39 |= 0x01;

    return self;
  }

  /** C1 shim @Ozone 0x4edf80 — same code as C2. */
  static newWithFactory_C1 = OZChannelRetimeFrame.newWithFactory;

  // -------------------------------------------------------------------------------------------
  // Ctor variant 3 — copy: (OZChannelRetimeFrame const& other, OZChannelFolder* folder)
  // -------------------------------------------------------------------------------------------
  /**
   * @Ozone 0x4edfc0 (C2) — `__ZN20OZChannelRetimeFrameC2ERKS_P15OZChannelFolder`.
   *
   * Faithful transcription:
   *   @0x4edfc0-c5 : prologue.
   *   @0x4edfc6    : `movq %rdi, %rbx` — save `this`.
   *   @0x4edfc9    : `callq 0x6df47a` (stub) — `__ZN9OZChannelC2ERKS_P15OZChannelFolder`
   *                   (OZChannel base copy ctor, NOT OZChannelDouble's copy ctor). This is
   *                   deliberate — the class hierarchy chains through OZChannel directly for
   *                   copy construction because OZChannelDouble has no copy ctor of its own
   *                   (verified via `nm` for OZChannelDoubleC2/C1 mangled forms — only 5-arg
   *                   and 7-arg exist).
   *   @0x4edfce    : `leaq 0x389cb3(%rip), %rax` — rax = 0x877c88.
   *   @0x4edfd5    : `movq %rax, (%rbx)` — primary vptr.
   *   @0x4edfd8    : `leaq 0x38a009(%rip), %rax` — rax = 0x877fe8.
   *   @0x4edfdf    : `movq %rax, 0x10(%rbx)` — secondary vptr.
   *   @0x4edfe3    : `orb $0x1, 0x39(%rbx)` — set bit 0 at (this+0x39).
   *   @0x4edfe7-ed : epilogue.
   */
  static newFromCopy(other: OZChannelRetimeFrame, folder: OZChannelFolder | null): OZChannelRetimeFrame {
    const self = new OZChannelRetimeFrame();

    // @0x4edfc9 : chain directly through OZChannel::OZChannel(OZChannel const&, OZChannelFolder*).
    OZChannel_base_copy_ctor(self, other, folder);

    // @0x4edfce..@0x4edfdf : install both vptrs (implicit).

    // @0x4edfe3 : set +0x39 flag bit.
    self.flag_0x39 |= 0x01;

    return self;
  }

  /** C1 shim @Ozone 0x4edff0 — same body. */
  static newFromCopy_C1 = OZChannelRetimeFrame.newFromCopy;

  // -------------------------------------------------------------------------------------------
  // Destructors
  // -------------------------------------------------------------------------------------------
  /**
   * D2 @Ozone 0x4ee020 — `__ZN20OZChannelRetimeFrameD2Ev`.
   * D1 @Ozone 0x4ee030 — `__ZN20OZChannelRetimeFrameD1Ev` (byte-identical to D2).
   *
   * Body:
   *   @0x4ee020-24 : prologue+epilogue frame set up (`pushq %rbp / movq %rsp,%rbp / popq %rbp`).
   *   @0x4ee025    : `jmp 0x6df480` — tail-jump into `OZChannel::~OZChannel()` (stub).
   *
   * There is NO per-class destruction (the class adds no owning fields — only the +0x39 flag
   * byte, which is scalar). The whole body is a tail-jump into the base dtor.
   */
  dtor(): void {
    // @0x4ee025 : tail-call OZChannel::~OZChannel(). Throws until the base ctor's decode lands.
    OZChannel_base_dtor(this);
  }

  /**
   * D0 @Ozone 0x4ee050 — `__ZN20OZChannelRetimeFrameD0Ev` (deleting destructor).
   *
   * Body:
   *   @0x4ee050-55 : prologue (`push rbp/mov rsp,rbp/push rbx/push rax`).
   *   @0x4ee056    : `movq %rdi, %rbx` — save `this`.
   *   @0x4ee059    : `callq 0x6df480` — OZChannel::~OZChannel().
   *   @0x4ee05e    : `movq %rbx, %rdi` — set up first arg for operator delete.
   *   @0x4ee061-66 : epilogue (adjust stack + pops).
   *   @0x4ee067    : `jmp 0x6dfc36` — tail-jump `operator delete(void*)`.
   *
   * In TS/JS memory is GC'd; we express the ABI shape as a call to the base dtor then a
   * conceptual delete — but we don't actually free (the GC does that). The base dtor still
   * throws through its frontier stub, which is the correct visible behavior.
   */
  dtor_deleting(): void {
    // @0x4ee059 : run OZChannel::~OZChannel() on `this`.
    OZChannel_base_dtor(this);
    // @0x4ee067 : operator delete(this) — no-op in JS (GC handles memory).
  }

  // -------------------------------------------------------------------------------------------
  // clone() const
  // -------------------------------------------------------------------------------------------
  /**
   * @Ozone 0x4ee0a0 — `__ZNK20OZChannelRetimeFrame5cloneEv`.
   *
   * Faithful transcription (see raw-port/re/disasm/OZChannelRetimeFrame.clone.s):
   *   @0x4ee0a0-a6 : prologue (`push rbp/mov rsp,rbp/push r14/push rbx`).
   *   @0x4ee0a7    : `movq %rdi, %r14` — save `this` (the source).
   *   @0x4ee0aa    : `movl $0x98, %edi` — sizeof(OZChannelRetimeFrame) = 152 bytes.
   *   @0x4ee0af    : `callq 0x6dfca2` — operator new(size_t).
   *   @0x4ee0b4    : `movq %rax, %rbx` — save the fresh allocation.
   *   @0x4ee0b7-ba : set up args: `rdi = new object`, `rsi = this (source)`, `edx = 0` (folder=NULL).
   *   @0x4ee0bf    : `callq 0x6df47a` — OZChannel::OZChannel(OZChannel const&, OZChannelFolder*).
   *   @0x4ee0c4    : `leaq 0x389bbd(%rip), %rax` — rax = 0x877c88 (vtable+0x10).
   *   @0x4ee0cb    : `movq %rax, (%rbx)` — primary vptr.
   *   @0x4ee0ce    : `leaq 0x389f13(%rip), %rax` — rax = 0x877fe8 (vtable+0x370).
   *   @0x4ee0d5    : `movq %rax, 0x10(%rbx)` — secondary vptr.
   *   @0x4ee0d9    : `orb $0x1, 0x39(%rbx)` — set bit 0 at (new+0x39).
   *   @0x4ee0dd    : `movq %rbx, %rax` — return the new pointer.
   *   @0x4ee0e0-e4 : epilogue.
   *
   * Unwind pad @0x4ee0e5..@0x4ee0f5 (in case the base copy ctor throws): store exception in r14,
   *  call operator delete on the just-new'd storage, then _Unwind_Resume(r14). Modeled below.
   */
  clone(): OZChannelRetimeFrame {
    // @0x4ee0af : `operator new(0x98)` — allocate a fresh OZChannelRetimeFrame.
    const fresh = new OZChannelRetimeFrame();

    try {
      // @0x4ee0bf : OZChannel::OZChannel(*fresh, *this, /*folder*/NULL). Note edx=0.
      OZChannel_base_copy_ctor(fresh, this, /*folder*/ null);
    } catch (e) {
      // @0x4ee0e5-f5 : unwind pad — operator delete(fresh), then _Unwind_Resume(exc). In JS the
      // partial object is unreachable; rethrow to match ABI semantics.
      //   @0x4ee0eb : operator delete(void*) — no-op in JS.
      //   @0x4ee0f3 : _Unwind_Resume(exc) — rethrow.
      throw e;
    }

    // @0x4ee0c4..@0x4ee0d5 : install both vptrs on the fresh object (implicit in TS).
    // @0x4ee0d9 : set the +0x39 flag bit on the fresh object.
    fresh.flag_0x39 |= 0x01;

    // @0x4ee0dd : return the fresh pointer.
    return fresh;
  }

  // -------------------------------------------------------------------------------------------
  // getOutputValues()
  // -------------------------------------------------------------------------------------------
  /**
   * @Ozone 0x4ee100 —
   *   `__ZNK20OZChannelRetimeFrame15getOutputValuesEddRK6CMTimeRN12RetimingMath11IntervalSetIdEE`
   *
   * Full body (see raw-port/re/disasm/OZChannelRetimeFrame.getOutputValues.s — 4 instructions):
   *   @0x4ee100-01 : `pushq %rbp / movq %rsp,%rbp` — trivial frame.
   *   @0x4ee104    : `popq %rbp`.
   *   @0x4ee105    : `jmp 0x6dd76a` — tail-jump into
   *                    `RetimingMath::ChannelOutputValuesUtil::getOutputValues(OZChannelDouble
   *                     const&, double, double, CMTime const&,
   *                     RetimingMath::IntervalSet<double>&)` (stub).
   *
   * The method is a pure re-labelling: it forwards `this` as the OZChannelDouble ref plus the
   * four caller args (double a, double b, CMTime const& t, IntervalSet<double>& out) into the
   * RetimingMath utility. All actual math lives in that utility (frontier — not decoded here).
   */
  getOutputValues(a: number, b: number, t: CMTime, out: RetimingMathIntervalSetDouble): void {
    // @0x4ee105 : tail-jump — forwards `this` as the OZChannelDouble const& first arg.
    RetimingMath_ChannelOutputValuesUtil_getOutputValues(this, a, b, t, out);
  }
}
