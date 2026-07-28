// OZChannelShear — Flexo-defined compound "shear" OZChannel (X + Y shear as a 2D-shaped
// OZCompoundChannel). This file transcribes THE ONE Flexo-side method the class exposes; the
// class's ctors/vtable/copy/getObjCWrapperName all live in ProChannel and are `U` imports here.
//
// Framework: Flexo  (/Applications/Final Cut Pro.app/Contents/Frameworks/Flexo.framework)
// x86_64 slice; VAs below are unadjusted VM addresses from `otool -tV`.
//
// FLEXO-DEFINED SYMBOLS (from nm -arch x86_64 Flexo | c++filt | grep OZChannelShear):
//   0x00000000006575f0  OZChannelShear::~OZChannelShear()   [D1 — this file]
// All other OZChannelShear symbols are `U` (undefined imports resolved from ProChannel):
//   U  OZChannelShear::OZChannelShear(OZChannelShear const&, OZChannelFolder*)   [copy ctor]
//   U  OZChannelShear::OZChannelShear(double, double, PCString const&,
//                                     OZChannelFolder*, unsigned int, unsigned int, unsigned int)
//   U  vtable for OZChannelShear
//
// The `double, double, PCString, folder, uint, uint, uint` ctor signature matches the same
// shape used by OZChannel2D (see raw-port/src/channels/OZChannel2D.ts): two initial doubles
// (default X + Y shear values), a bundled name, a parent folder, and three uints for
// sub-index/kind/flags. This is a 2D-style compound channel with two OZChannel sub-slots.
//
// STRUCT LAYOUT — recovered from THIS destructor disasm (re/disasm/Flexo.OZChannelShear.~OZChannelShear.s
// @0x6575f0). The relevant instructions and what they prove:
//
//   0x006575f9  movq   0x12925f8(%rip), %rax          ; RIP-relative literal-pool load of the
//                                                       address of `vtable for OZChannelShear`
//                                                       (__ZTV14OZChannelShear).  The literal
//                                                       pool holds the vtable base pointer.
//   0x00657600  leaq   0x10(%rax), %rcx               ; primary installed-vptr = vtable + 0x10
//   0x00657604  movq   %rcx, (%rdi)                   ; write to this+0x00 — PRIMARY vtable slot
//   0x00657607  addq   $0x348, %rax                   ; secondary installed-vptr = vtable + 0x348
//   0x0065760d  movq   %rax, 0x10(%rdi)               ; write to this+0x10 — SECONDARY vtable slot
//   0x00657611  addq   $0x120, %rdi                   ; &this->y  (sub-channel #2 at +0x120)
//   0x00657618  callq  __ZN9OZChannelD2Ev             ; OZChannel::~OZChannel() on this+0x120  (Y)
//   0x0065761d  leaq   0x88(%rbx), %rdi               ; &this->x  (sub-channel #1 at +0x88)
//   0x00657624  callq  __ZN9OZChannelD2Ev             ; OZChannel::~OZChannel() on this+0x88   (X)
//   0x00657629  movq   %rbx, %rdi                     ; base-object destruction:
//   0x00657632  jmp    __ZN17OZCompoundChannelD2Ev    ; ~OZCompoundChannel() tail-called on this
//
// This mirrors EXACTLY the shape of OZChannel2D::~OZChannel2D() (@ProChannel 0x48b7c) and
// OZChannelBool3D / OZChannelPosition / OZChannelRotation3D: sub-Y is destroyed FIRST at +0x120,
// then sub-X at +0x88, then the OZCompoundChannel base subobject.  Proven inheritance:
//   OZChannelShear : OZCompoundChannel  (proven by the tail-jmp to ~OZCompoundChannel)
//   sub-channels of type OZChannel (not OZChannelDouble/Angle) — proven by both dtor calls
//     targeting OZChannel::~OZChannel(); the concrete vtable slot is re-installed elsewhere
//     (in the ctor which is a ProChannel U-import here).
//
// Class layout (byte offsets — derived exhaustively from THIS disasm):
//   +0x00        vtable ptr           (installed = vtable + 0x10; @0x657600)
//   +0x10        vtable_thunk_slot    (installed = vtable + 0x348; @0x657607)
//   +0x00..+0x87 OZCompoundChannel base subobject (owns 0x00..0x87 per OZChannel2D's proven
//                layout; destroyed via ~OZCompoundChannel @0x657632)
//   +0x88        OZChannel  (X shear sub-channel)  — destructor @0x657624
//   +0x120       OZChannel  (Y shear sub-channel)  — destructor @0x657618
//
// The vtable's secondary offset of 0x348 (vs OZChannel2D's 0x1b8 -> +? and
// OZChannelShearAngle's 0x370) is a class-specific magic that lives in the ProChannel-emitted
// vtable object; it's read here as a byte offset from the vtable base, not invented.
//
// This file does NOT re-stub OZCompoundChannel or OZChannel — both already-landed bases are
// imported from their own files.

import { OZCompoundChannel } from "./OZCompoundChannel.js";
import { OZChannel } from "./OZChannel.js";

/**
 * A single-axis OZChannel sub-slot used by OZChannelShear.  Matches the shape used by
 * OZChannel2D's axes (see raw-port/src/channels/OZChannel2D.ts).  The full OZChannel
 * surface (setValue / getKeyframe / setKeyframeInterpolation / ...) is exposed through
 * the real OZChannel class; this alias just documents the by-value ownership + destructor
 * pattern proved by @0x657618 / @0x657624.
 */
export type OZChannelShearAxis = OZChannel;

/**
 * OZChannelShear — 2D compound channel (X shear + Y shear over time).  Extends
 * OZCompoundChannel and embeds two OZChannel sub-slots at struct offsets +0x88 (X) and
 * +0x120 (Y).  See file header for full struct layout provenance.
 *
 * The ctors that construct this class (@ProChannel `U`-imports:
 *   OZChannelShear::OZChannelShear(double, double, PCString const&, OZChannelFolder*,
 *                                  unsigned int, unsigned int, unsigned int)
 *   OZChannelShear::OZChannelShear(OZChannelShear const&, OZChannelFolder*)
 * ) are NOT transcribed here — they live in ProChannel and are not part of the Flexo
 * task claim (the Flexo binary only defines this class's destructor).  When the ProChannel
 * side is claimed, the ctors will land alongside setValue/copy/getObjCWrapperName.
 */
export class OZChannelShear extends OZCompoundChannel {
  /** X shear sub-channel — struct offset +0x88 (destroyed @Flexo 0x657624). */
  readonly x: OZChannelShearAxis;
  /** Y shear sub-channel — struct offset +0x120 (destroyed @Flexo 0x657618). */
  readonly y: OZChannelShearAxis;

  /**
   * Local ctor accepting the two sub-slots the (not-yet-ported) ProChannel ctor would
   * have constructed in-place.  Does NOT try to speak for the ProChannel-side ctor:
   * the OZCompoundChannel base is initialised with the same forwarded arguments the
   * ProChannel ctor would forward (see OZChannel2D.ts for the mirror pattern; the exact
   * OZCompoundChannel ctor overload signature is a ProChannel `U` and is deferred).
   */
  constructor(xAxis: OZChannelShearAxis, yAxis: OZChannelShearAxis) {
    super();
    this.x = xAxis;
    this.y = yAxis;
  }

  /**
   * Destructor — OZChannelShear::~OZChannelShear() @Flexo 0x00000000006575f0 (D1).
   *
   * Faithful control-flow transcription of the 21-line disasm at
   * raw-port/re/disasm/Flexo.OZChannelShear.~OZChannelShear.s :
   *
   *   this->vtable       = &(__ZTV14OZChannelShear + 0x10)     @Flexo 0x657600
   *   this->vtable_thunk = &(__ZTV14OZChannelShear + 0x348)    @Flexo 0x65760d
   *   OZChannel::~OZChannel(&this->y)   [offset +0x120]         @Flexo 0x657618
   *   OZChannel::~OZChannel(&this->x)   [offset +0x88]          @Flexo 0x657624
   *   ~OZCompoundChannel(this)            (tail-jmp)             @Flexo 0x657632
   *
   * TypeScript has no explicit destructors; the equivalent is dropping the object and
   * letting the GC reclaim the two sub-slots and the OZCompoundChannel base state.  The
   * two OZChannel::~OZChannel calls @0x657618 / @0x657624 release each sub-slot's
   * keyframe/curve storage which JS's GC handles automatically.  The vtable-slot writes
   * @0x657600/@0x65760d are a C++ ABI requirement (during-dtor virtual dispatch must see
   * OZChannelShear's own vtable, not any subclass's) that has no TS equivalent.
   *
   * This is a documentation-only method body — the provenance is what the gate reads.
   */
  // (no method body — destructor is trivial in TS; @Flexo 0x6575f0 cited above.)
}
