// raw-port/src/channels/OZ3DEnginePhysicsFieldBehavior.ts
//
// FCP `OZ3DEnginePhysicsFieldBehavior` — an OZBehavior subclass that models a
// 3D physics FIELD (drag, vortex, gravity, noise, turbulence, electric, magnetic).
// It owns EIGHT animatable sub-channels wired into the OZChannelFolder that
// OZBehavior installs at +0x30 of `this`:
//
//   +0x210  OZChannelEnum    "Type"                     values "Drag;Vortex;Radial Gravity;Linear Gravity;Noise;Turbulence;Electric;Magnetic" (default enum 1)  (id 0xC8)
//   +0x310  OZChannelDouble  "Strength"                 (default  1.0)                       (id 0xCB)
//   +0x3a8  OZChannelDouble  "Falloff Exponent"         (default  1.0)                       (id 0xCC)
//   +0x440  OZChannelBool    "Infinite Extent"          (default  0/false)                   (id 0xC9)
//   +0x4d8  OZChannel3D      "Extent"                   (default  (1.0, 1.0, 1.0), r9d=3)    (id 0xCA)
//   +0x728  OZChannel3D      "Direction"                (default  (0.0, -1.0, 0.0), r9d=3)   (id 0xCD)
//   +0x978  OZChannelDouble  "Smoothness"               (default  0.0; setMin 0.0, setMax 1.0)  (id 0xCE)
//   +0xa10  OZChannelDouble  "Animation Speed"          (default  1.0)                       (id 0xCF)
//   +0xaa8  OZChannelDouble  "Minimum Falloff Distance" (default  1e-06; setMin 1e-06)       (id 0xD0)
//
// Framework: Ozone.  Thin slice at /tmp/Ozone.x86_64.
//
// Provenance (every method decoded from otool -tV of the FCP.app binary):
//   raw-port/re/disasm/OZ3DEnginePhysicsFieldBehavior.OZ3DEnginePhysicsFieldBehavior.s     @0x4f06e0 (C1 primary ctor: tail-jumps to C2 @0x4f0210)
//   raw-port/re/disasm/OZ3DEnginePhysicsFieldBehavior.OZ3DEnginePhysicsFieldBehavior_C2.s  @0x4f0210 (C2 primary ctor: OZFactory*, PCString&, uint — ICF-fused label; body starts inside subdivide's dump)
//                                                                                          @0x4f06f0 (C1 copy ctor: OZ3DEnginePhysicsFieldBehavior const&, uint — nm-listed)
//                                                                                          @0x4f0950 (C2 copy ctor: nm-listed; unique body)
//                                                                                          @0x4f0b20 (D2 dtor: nm-listed)
//                                                                                          @0x4f0b50 (D1 dtor: nm-listed)
//                                                                                          @0x4f0960 (D0 dtor: nm-listed)
//   raw-port/re/disasm/OZ3DEnginePhysicsFieldBehavior.didAddToNode.s        @0x4f0be0
//   raw-port/re/disasm/OZ3DEnginePhysicsFieldBehavior.type.s                @0x4f0c20
//   raw-port/re/disasm/OZ3DEnginePhysicsFieldBehavior.strength.s            @0x4f0c40
//   raw-port/re/disasm/OZ3DEnginePhysicsFieldBehavior.falloffExponent.s     @0x4f0c60
//   raw-port/re/disasm/OZ3DEnginePhysicsFieldBehavior.smoothness.s          @0x4f0c80
//   raw-port/re/disasm/OZ3DEnginePhysicsFieldBehavior.animationSpeed.s      @0x4f0ca0
//   raw-port/re/disasm/OZ3DEnginePhysicsFieldBehavior.isExtentInfinite.s    @0x4f0cc0
//   raw-port/re/disasm/OZ3DEnginePhysicsFieldBehavior.halfExtent.s          @0x4f0ce0
//   raw-port/re/disasm/OZ3DEnginePhysicsFieldBehavior.direction.s           @0x4f0d60
//   raw-port/re/disasm/OZ3DEnginePhysicsFieldBehavior.minimumDistance.s     @0x4f0de0
//   raw-port/re/disasm/OZ3DEnginePhysicsFieldBehavior.isRebuildUIChannel.s  @0x4f0e00
//   raw-port/re/disasm/OZ3DEnginePhysicsFieldBehavior.updateHiddenFlags.s   @0x4f0e30
//   raw-port/re/disasm/OZ3DEnginePhysicsFieldBehavior.getLockDependencies.s @0x4f11b0
//   operator=(OZBehavior const&)                                            @0x4f0bd0 (nm-listed; body not decoded — trivial forwarder to OZBehavior::operator=)
//   getLockingID (private, private thunk)                                   @0x4f1360
//
// Vtable installs (from the C2 ctor at 0x4f0238..0x4f025f — resolved via
// raw-port/army/tools/resolve.py Ozone sym):
//   this[+0x000] = &vtable_for_OZ3DEnginePhysicsFieldBehavior + 0x010  @0x878180
//   this[+0x010] = &vtable_for_OZ3DEnginePhysicsFieldBehavior + 0x2a8  @0x878418
//   this[+0x028] = &vtable_for_OZ3DEnginePhysicsFieldBehavior + 0x500  @0x878670
//   this[+0x148] = &vtable_for_OZ3DEnginePhysicsFieldBehavior + 0x558  @0x8786c8
//
// FULL STRUCT LAYOUT recovered from the C2 primary ctor (@0x4f0210) — every
// write into `this+K` is a real subobject construction, in this exact order:
//
//   +0x000  OZBehavior base subobject       OZBehavior::OZBehavior(OZFactory*, PCString&, uint)  @0x4f0224
//                                           (also receives vtable slot 0x000 = vt+0x010)
//   +0x010                                  2nd vtable slot (vt+0x2a8)                     @0x4f0249
//   +0x028                                  3rd vtable slot (vt+0x500)                     @0x4f0254
//   +0x140  (OZSceneNode*  attachedNode set by didAddToNode when the parent node
//                                           dynamic_casts to OZ3DEngineSceneElement)       @0x4f0c0f
//   +0x148  OZLocking       locking          OZLocking::OZLocking()                        @0x4f0233
//                                           (also receives vtable slot 0x148 = vt+0x558)   @0x4f025f
//   +0x210  OZChannelEnum   type            OZChannelEnum::C1(1, "Drag;Vortex;Radial Gravity;Linear Gravity;Noise;Turbulence;Electric;Magnetic",
//                                                              "Type", folder=&this+0x30, id=0xC8, 0, null, null)   @0x4f02bd
//   +0x310  OZChannelDouble strength        OZChannelDouble::C2(1.0, "Strength", folder=&this+0x30,
//                                                                id=0xCB, 0, null, null)   @0x4f0314
//   +0x3a8  OZChannelDouble falloffExponent OZChannelDouble::C2(1.0, "Falloff Exponent", folder,
//                                                                id=0xCC, 0, null, null)   @0x4f0363
//   +0x440  OZChannelBool   isExtentInfinite OZChannelBool::C1(false, "Infinite Extent", folder,
//                                                               id=0xC9, 0, null, null)    @0x4f03a8
//   +0x4d8  OZChannel3D     extent          OZChannel3D::C1((1.0, 1.0, 1.0), "Extent", folder,
//                                                            id=0xCA, 0, r9=3, null, null) @0x4f03fb
//   +0x728  OZChannel3D     direction       OZChannel3D::C1((0.0, -1.0, 0.0), "Direction", folder,
//                                                            id=0xCD, 0, r9=3, null, null) @0x4f044e
//   +0x978  OZChannelDouble smoothness      OZChannelDouble::C2(0.0, "Smoothness", folder,
//                                                                id=0xCE, 0, null, null)   @0x4f0493
//                                           setMin(0.0)                                    @0x4f053b
//                                           setMax(1.0)                                    @0x4f054b
//   +0xa10  OZChannelDouble animationSpeed  OZChannelDouble::C2(1.0, "Animation Speed", folder,
//                                                                id=0xCF, 0, null, null)   @0x4f04dd
//   +0xaa8  OZChannelDouble minimumDistance OZChannelDouble::C2(1e-06, "Minimum Falloff Distance", folder,
//                                                                id=0xD0, 0, null, null)   @0x4f0527
//                                           setMin(1e-06)                                  @0x4f055b
//
// The "folder" argument to every OZChan* ctor is `&this+0x30` — the
// OZChannelFolder subobject inside OZBehavior (constructed by OZBehavior::OZBehavior).
// All NINE channels register into THAT folder.
//
// Default-value constants (all rip-relative reads, verified via resolve.py Ozone const):
//   0x7053e0 = 1.0   (strength/falloffExponent/extent/animationSpeed default + smoothness setMax)
//   0x707728 = -1.0  (direction y-axis)
//   0x70a0b0 = 1e-06 (minimumDistance default + setMin)
//
// Trivial per-time double getters (each is a 1-instruction adjust-this + tail-call
// into OZChannel::getValueAsDouble, xmm0 zeroed as `defaultValue=0.0`):
//   strength(t)          = OZChannel::getValueAsDouble(this+0x310, t, 0.0)   @0x4f0c40 -> stub @0x6dfa9e
//   falloffExponent(t)   = OZChannel::getValueAsDouble(this+0x3a8, t, 0.0)   @0x4f0c60 -> stub @0x6dfa9e
//   smoothness(t)        = OZChannel::getValueAsDouble(this+0x978, t, 0.0)   @0x4f0c80 -> stub @0x6dfa9e
//   animationSpeed(t)    = OZChannel::getValueAsDouble(this+0xa10, t, 0.0)   @0x4f0ca0 -> stub @0x6dfa9e
//   minimumDistance(t)   = OZChannel::getValueAsDouble(this+0xaa8, t, 0.0)   @0x4f0de0 -> stub @0x6dfa9e
//
// type(t) is a int getter, isExtentInfinite(t) is bool-of-int:
//   type(t)              = OZChannel::getValueAsInt(this+0x210, t, 0.0)      @0x4f0c20 -> stub @0x6dfa80
//   isExtentInfinite(t)  = OZChannel::getValueAsInt(this+0x440, t, 0.0) != 0 @0x4f0cc0
//
// halfExtent(t)  reads 3 doubles at fixed offsets FROM the OZChannel3D at +0x4d8
// (which itself owns 3 sub-doubles at internal offsets +0x88, +0x120, +0x1b8;
// this method's `leaq 0x560(%rsi)` = 0x4d8 + 0x88 = 0x560, etc. — reading the
// three sub-doubles individually and packing them into the caller-supplied
// PCVector3<double> at %rdi):
//   *rbx.x = OZChannel::getValueAsDouble(this + 0x4d8 + 0x088, t, 0.0)  @0x4f0d03
//   *rbx.y = OZChannel::getValueAsDouble(this + 0x4d8 + 0x120, t, 0.0)  @0x4f0d1a
//   *rbx.z = OZChannel::getValueAsDouble(this + 0x4d8 + 0x1b8, t, 0.0)  @0x4f0d34
//
// direction(t) is the same shape, reading from the OZChannel3D at +0x728:
//   *rbx.x = OZChannel::getValueAsDouble(this + 0x728 + 0x088, t, 0.0)  @0x4f0d83
//   *rbx.y = OZChannel::getValueAsDouble(this + 0x728 + 0x120, t, 0.0)  @0x4f0d9a
//   *rbx.z = OZChannel::getValueAsDouble(this + 0x728 + 0x1b8, t, 0.0)  @0x4f0db4
//
// didAddToNode:
//   if (arg != nullptr) {
//     if (dynamic_cast<OZ3DEngineSceneElement*>(static_cast<OZSceneNode*>(arg)) != null)
//       this[+0x140] = arg;
//   }
//
// isRebuildUIChannel(ch):  return (ch == this+0x210 /* type */) || (ch == this+0x440 /* infinite-extent */)
//
// updateHiddenFlags(list): a 210-line list walk that (1) reads this class's own
// `type` (int at +0x210) and `isExtentInfinite` (int at +0x440) at t=kCMTimeZero,
// (2) walks the sibling-behavior list, dynamic_casting each entry to
// OZ3DEnginePhysicsFieldBehavior, comparing (type, extentIsFinite) to *this*,
// and setting/resetting the 0x400000 flag on each of {smoothness(+0x978),
// animationSpeed(+0xa10), extent(+0x4d8), direction(+0x728), minimumDistance(+0xaa8)}
// channels based on the type value and extent-infinite bit.
//
// getLockDependencies: 126 lines of std::set<OZLocking*> red-black-tree insertion
// of `this+0x148` (the class's OZLocking subobject) and PCDirectedGraph<OZLocking*>
// edge bookkeeping — same "invent-a-red-black-tree" trap as the
// OZ3DEngineScenePlacementBehavior port. Deferred to the OZLocking worker.
//
// This TS file exports one class-object per FCP class exactly as the other
// channels/OZ*Behavior* precedents (OZ3DEngineScenePlacementBehavior etc.). Every
// undecoded callee (OZBehavior ctor/dtor, OZChannel::getValueAs{Double,Int},
// OZChannelBase::setFlag/resetFlag, OZChannel::setMin/setMax, OZChannelDouble/
// OZChannelEnum/OZChannelBool/OZChannel3D::ctor, OZLocking::OZLocking,
// PCString::PCString/~PCString, getLockDependencies's std::set body,
// ___dynamic_cast) is a THROW-STUB citing its @0xADDR — the "loud gap" that
// anti-shortcut demands.

import type { CMTime } from "../infra/CMTime";

// ---------------------------------------------------------------------------
// Struct layout (byte offsets recovered from ctor @0x4f0210)
// ---------------------------------------------------------------------------
export interface OZ3DEnginePhysicsFieldBehavior {
  // +0x000  OZBehavior subobject (opaque here — owned by OZBehavior class port).
  //         Also stores the class's primary vtable slot pointer at +0x000.
  readonly __vtable_head?: unknown;         // +0x000 (vt+0x010) @0x4f023f
  readonly __vtable_10?:   unknown;         // +0x010 (vt+0x2a8) @0x4f0249
  readonly __vtable_28?:   unknown;         // +0x028 (vt+0x500) @0x4f0254
  // +0x030  OZChannelFolder subobject (inside OZBehavior). All 9 channels below
  //         are constructed with `&this+0x30` as their `folder` arg.
  __ozChannelFolder_at_0x30?: unknown;      // +0x030 folder (used by every channel ctor)
  // +0x140  OZSceneNode* attachedNode  (set by didAddToNode @0x4f0c0f)
  attachedNode: unknown | null;             // +0x140
  // +0x148  OZLocking subobject (with its own vtable slot at +0x148 = vt+0x558 @0x4f025f)
  __ozLocking_at_0x148?: unknown;           // +0x148
  // +0x210  OZChannelEnum "Type" (Drag/Vortex/…/Magnetic)
  type_channel: unknown;                    // +0x210 (OZChannelEnum)
  // +0x310  OZChannelDouble "Strength" (default 1.0)
  strength_channel: unknown;                // +0x310 (OZChannelDouble)
  // +0x3a8  OZChannelDouble "Falloff Exponent" (default 1.0)
  falloffExponent_channel: unknown;         // +0x3a8 (OZChannelDouble)
  // +0x440  OZChannelBool   "Infinite Extent"  (default false)
  isExtentInfinite_channel: unknown;        // +0x440 (OZChannelBool)
  // +0x4d8  OZChannel3D     "Extent" (default (1.0, 1.0, 1.0))
  extent_channel: unknown;                  // +0x4d8 (OZChannel3D)
  // +0x728  OZChannel3D     "Direction" (default (0.0, -1.0, 0.0))
  direction_channel: unknown;               // +0x728 (OZChannel3D)
  // +0x978  OZChannelDouble "Smoothness"       (default 0.0; setMin 0.0, setMax 1.0)
  smoothness_channel: unknown;              // +0x978 (OZChannelDouble)
  // +0xa10  OZChannelDouble "Animation Speed"  (default 1.0)
  animationSpeed_channel: unknown;          // +0xa10 (OZChannelDouble)
  // +0xaa8  OZChannelDouble "Minimum Falloff Distance" (default 1e-06; setMin 1e-06)
  minimumDistance_channel: unknown;         // +0xaa8 (OZChannelDouble)
}

// A caller-supplied PCVector3<double>-style output for halfExtent / direction.
// The disasm shows the 3 doubles written at [0], +8, +16 of the output pointer.
export interface OZ3DEnginePhysicsFieldBehavior_Vec3 {
  x: number;   // +0x00
  y: number;   // +0x08
  z: number;   // +0x10
}

// ---------------------------------------------------------------------------
// Undecoded upstream/downstream API — stubs that THROW citing their @0xADDR.
// These are all callees of the ctor / dtors / getters that this class dispatches
// into; when a later worker ports OZChannel / OZBehavior / OZLocking, they will
// replace the corresponding stub. Until then, wiring this behavior for real
// evaluation would surface a loud runtime error (which is the correct answer
// per raw-port/army/ANTI_SHORTCUT.md).
// ---------------------------------------------------------------------------

/** OZChannel::getValueAsDouble(CMTime const&, double) const  — Ozone stub @0x6dfa9e
 *  Called from strength / falloffExponent / smoothness / animationSpeed / minimumDistance / halfExtent / direction. */
function OZChannel__getValueAsDouble_stub(_ch: unknown, _t: CMTime, _def: number): number {
  throw new Error("OZChannel::getValueAsDouble @0x6dfa9e not yet transcribed (called from OZ3DEnginePhysicsFieldBehavior::strength @0x4f0c4f / falloffExponent @0x4f0c6f / smoothness @0x4f0c8f / animationSpeed @0x4f0caf / minimumDistance @0x4f0def / halfExtent @0x4f0d03,@0x4f0d1a,@0x4f0d34 / direction @0x4f0d83,@0x4f0d9a,@0x4f0db4)");
}

/** OZChannel::getValueAsInt(CMTime const&, double) const  — Ozone stub @0x6dfa80
 *  Called from type @0x4f0c2f (jmp), isExtentInfinite @0x4f0cce (call),
 *  updateHiddenFlags @0x4f0e6e/@0x4f0e86/@0x4f0eee/@0x4f0f10 (calls). */
function OZChannel__getValueAsInt_stub(_ch: unknown, _t: CMTime, _def: number): number {
  throw new Error("OZChannel::getValueAsInt @0x6dfa80 not yet transcribed (called from OZ3DEnginePhysicsFieldBehavior::type @0x4f0c2f / isExtentInfinite @0x4f0cce / updateHiddenFlags @0x4f0e6e,@0x4f0e86,@0x4f0eee,@0x4f0f10)");
}

/** OZChannelBase::setFlag(uint64, bool)  — Ozone stub @0x6dd914
 *  Called from updateHiddenFlags at @0x4f0f9d/@0x4f101d/@0x4f1092/@0x4f10ab/@0x4f1134/@0x4f114a/@0x4f1183. */
function OZChannelBase__setFlag_stub(_ch: unknown, _flag: number, _b: boolean): void {
  throw new Error("OZChannelBase::setFlag @0x6dd914 not yet transcribed (called from OZ3DEnginePhysicsFieldBehavior::updateHiddenFlags)");
}

/** OZChannelBase::resetFlag(uint64, bool)  — Ozone stub @0x6dd92c
 *  Called from updateHiddenFlags at @0x4f0f7a/@0x4f0fe5/@0x4f0ffc/@0x4f1040/@0x4f10ed/@0x4f1160. */
function OZChannelBase__resetFlag_stub(_ch: unknown, _flag: number, _b: boolean): void {
  throw new Error("OZChannelBase::resetFlag @0x6dd92c not yet transcribed (called from OZ3DEnginePhysicsFieldBehavior::updateHiddenFlags)");
}

/** ___dynamic_cast(from, fromTypeInfo, toTypeInfo, hint)  — libc++abi (system).
 *  Used by didAddToNode @0x4f0c05 (OZSceneNode -> OZ3DEngineSceneElement) and
 *  updateHiddenFlags @0x4f0ed4/@0x4f0fc0/@0x4f1078/@0x4f1110 (OZBehavior -> OZ3DEnginePhysicsFieldBehavior). */
function dynamic_cast_stub(
  _from: unknown, _fromTI: unknown, _toTI: unknown, _hint: number,
): unknown | null {
  throw new Error("___dynamic_cast @libc++abi not applicable in TS; called from OZ3DEnginePhysicsFieldBehavior::didAddToNode @0x4f0c05 (OZSceneNode->OZ3DEngineSceneElement) and updateHiddenFlags @0x4f0ed4/@0x4f0fc0/@0x4f1078/@0x4f1110 (OZBehavior->OZ3DEnginePhysicsFieldBehavior) (needs ported OZ3DEngineSceneElement + this class's own instanceof check)");
}

// ---------------------------------------------------------------------------
// OZ3DEnginePhysicsFieldBehavior::type(CMTime const&) const   @0x4f0c20
// ---------------------------------------------------------------------------
// Body (mirrored line-for-line from raw-port/re/disasm/…):
//   addq   $0x210, %rdi                 ; %rdi = this + 0x210 (type_channel)
//   xorps  %xmm0, %xmm0                 ; %xmm0 = 0.0  (defaultValue arg to getValueAsInt)
//   jmp    stub OZChannel::getValueAsInt
export function OZ3DEnginePhysicsFieldBehavior_type(
  self: OZ3DEnginePhysicsFieldBehavior,
  t: CMTime,
): number {
  return OZChannel__getValueAsInt_stub(self.type_channel, t, 0.0); // @0x4f0c2f
}

// ---------------------------------------------------------------------------
// OZ3DEnginePhysicsFieldBehavior::strength(CMTime const&) const   @0x4f0c40
// ---------------------------------------------------------------------------
// Body:
//   addq   $0x310, %rdi                 ; %rdi = this + 0x310 (strength_channel)
//   xorps  %xmm0, %xmm0                 ; %xmm0 = 0.0
//   jmp    stub OZChannel::getValueAsDouble
export function OZ3DEnginePhysicsFieldBehavior_strength(
  self: OZ3DEnginePhysicsFieldBehavior,
  t: CMTime,
): number {
  return OZChannel__getValueAsDouble_stub(self.strength_channel, t, 0.0); // @0x4f0c4f
}

// ---------------------------------------------------------------------------
// OZ3DEnginePhysicsFieldBehavior::falloffExponent(CMTime const&) const  @0x4f0c60
// ---------------------------------------------------------------------------
// Body: addq $0x3a8, %rdi ; xorps xmm0 ; jmp getValueAsDouble.
export function OZ3DEnginePhysicsFieldBehavior_falloffExponent(
  self: OZ3DEnginePhysicsFieldBehavior,
  t: CMTime,
): number {
  return OZChannel__getValueAsDouble_stub(self.falloffExponent_channel, t, 0.0); // @0x4f0c6f
}

// ---------------------------------------------------------------------------
// OZ3DEnginePhysicsFieldBehavior::smoothness(CMTime const&) const  @0x4f0c80
// ---------------------------------------------------------------------------
// Body: addq $0x978, %rdi ; xorps xmm0 ; jmp getValueAsDouble.
export function OZ3DEnginePhysicsFieldBehavior_smoothness(
  self: OZ3DEnginePhysicsFieldBehavior,
  t: CMTime,
): number {
  return OZChannel__getValueAsDouble_stub(self.smoothness_channel, t, 0.0); // @0x4f0c8f
}

// ---------------------------------------------------------------------------
// OZ3DEnginePhysicsFieldBehavior::animationSpeed(CMTime const&) const  @0x4f0ca0
// ---------------------------------------------------------------------------
// Body: addq $0xa10, %rdi ; xorps xmm0 ; jmp getValueAsDouble.
export function OZ3DEnginePhysicsFieldBehavior_animationSpeed(
  self: OZ3DEnginePhysicsFieldBehavior,
  t: CMTime,
): number {
  return OZChannel__getValueAsDouble_stub(self.animationSpeed_channel, t, 0.0); // @0x4f0caf
}

// ---------------------------------------------------------------------------
// OZ3DEnginePhysicsFieldBehavior::minimumDistance(CMTime const&) const  @0x4f0de0
// ---------------------------------------------------------------------------
// Body: addq $0xaa8, %rdi ; xorps xmm0 ; jmp getValueAsDouble.
export function OZ3DEnginePhysicsFieldBehavior_minimumDistance(
  self: OZ3DEnginePhysicsFieldBehavior,
  t: CMTime,
): number {
  return OZChannel__getValueAsDouble_stub(self.minimumDistance_channel, t, 0.0); // @0x4f0def
}

// ---------------------------------------------------------------------------
// OZ3DEnginePhysicsFieldBehavior::isExtentInfinite(CMTime const&) const  @0x4f0cc0
// ---------------------------------------------------------------------------
// Body:
//   addq   $0x440, %rdi                 ; %rdi = this + 0x440 (isExtentInfinite_channel)
//   xorps  %xmm0, %xmm0                 ; %xmm0 = 0.0
//   callq  stub OZChannel::getValueAsInt          ; %eax = int
//   testl  %eax, %eax                             ; ZF = (eax == 0)
//   setne  %al                                    ; %al = (eax != 0)
//   ret                                            ; return bool
export function OZ3DEnginePhysicsFieldBehavior_isExtentInfinite(
  self: OZ3DEnginePhysicsFieldBehavior,
  t: CMTime,
): boolean {
  const v = OZChannel__getValueAsInt_stub(self.isExtentInfinite_channel, t, 0.0); // @0x4f0cce
  return v !== 0;
}

// ---------------------------------------------------------------------------
// OZ3DEnginePhysicsFieldBehavior::halfExtent(CMTime const&) const   @0x4f0ce0
// ---------------------------------------------------------------------------
// Body (37 lines): reads three sub-doubles of the OZChannel3D at +0x4d8 (the
// "Extent" channel) via three calls to OZChannel::getValueAsDouble at fixed
// offsets 0x560 (=0x4d8+0x88), 0x5f8 (=0x4d8+0x120), 0x690 (=0x4d8+0x1b8) from
// %rsi (this). Each call passes default 0.0. Result is packed into the caller's
// PCVector3<double> at %rdi (fields at [0], +0x08, +0x10) and returned as %rax
// == the same pointer (C++ struct-return convention).
//
//   leaq   0x560(%rsi), %rdi ; xorps xmm0 ; callq getValueAsDouble ; movsd xmm0 -> local[-0x28]
//   leaq   0x5f8(%rsi), %rdi ; xorps xmm0 ; callq getValueAsDouble ; movsd xmm0 -> local[-0x20]
//   addq   $0x690, %r15 (=%rsi)     ; xorps xmm0 ; callq getValueAsDouble ; %xmm0 held
//   movsd  local[-0x28] -> (%rbx)     ; movsd local[-0x20] -> 0x8(%rbx) ; movsd xmm0 -> 0x10(%rbx)
//   ret with %rax = %rbx (output pointer)
export function OZ3DEnginePhysicsFieldBehavior_halfExtent(
  self: OZ3DEnginePhysicsFieldBehavior,
  t: CMTime,
  out: OZ3DEnginePhysicsFieldBehavior_Vec3,
): OZ3DEnginePhysicsFieldBehavior_Vec3 {
  // 3 sub-channels of the Extent OZChannel3D at fixed sub-offsets +0x88, +0x120, +0x1b8.
  // The disasm loads them individually — we mirror that literally (each is an
  // OZChannel*-typed subobject inside the OZChannel3D; the port for OZChannel3D
  // will name these fields properly).
  const extentBase = self.extent_channel;               // this + 0x4d8
  // Sub-channel handles at extentBase + {0x88, 0x120, 0x1b8} — encoded here as
  // property lookups on a placeholder; the real field types belong to the
  // OZChannel3D port. Passing `null` triggers the stub's loud throw so tests
  // never silently return 0.
  const xCh = (extentBase as { sub_at_0x088?: unknown } | null)?.sub_at_0x088 ?? null;  // +0x560
  const yCh = (extentBase as { sub_at_0x120?: unknown } | null)?.sub_at_0x120 ?? null;  // +0x5f8
  const zCh = (extentBase as { sub_at_0x1b8?: unknown } | null)?.sub_at_0x1b8 ?? null;  // +0x690
  const x = OZChannel__getValueAsDouble_stub(xCh, t, 0.0);      // @0x4f0d03
  const y = OZChannel__getValueAsDouble_stub(yCh, t, 0.0);      // @0x4f0d1a
  const z = OZChannel__getValueAsDouble_stub(zCh, t, 0.0);      // @0x4f0d34
  out.x = x;                                                     // @0x4f0d3e
  out.y = y;                                                     // @0x4f0d47
  out.z = z;                                                     // @0x4f0d4c
  return out;                                                    // @0x4f0d51 mov %rbx, %rax
}

// ---------------------------------------------------------------------------
// OZ3DEnginePhysicsFieldBehavior::direction(CMTime const&) const   @0x4f0d60
// ---------------------------------------------------------------------------
// Body (37 lines): identical shape to halfExtent but reads the OZChannel3D at
// +0x728 ("Direction"). Sub-offsets 0x7b0 (=0x728+0x88), 0x848 (=0x728+0x120),
// 0x8e0 (=0x728+0x1b8).
export function OZ3DEnginePhysicsFieldBehavior_direction(
  self: OZ3DEnginePhysicsFieldBehavior,
  t: CMTime,
  out: OZ3DEnginePhysicsFieldBehavior_Vec3,
): OZ3DEnginePhysicsFieldBehavior_Vec3 {
  const dirBase = self.direction_channel;               // this + 0x728
  const xCh = (dirBase as { sub_at_0x088?: unknown } | null)?.sub_at_0x088 ?? null;  // +0x7b0
  const yCh = (dirBase as { sub_at_0x120?: unknown } | null)?.sub_at_0x120 ?? null;  // +0x848
  const zCh = (dirBase as { sub_at_0x1b8?: unknown } | null)?.sub_at_0x1b8 ?? null;  // +0x8e0
  const x = OZChannel__getValueAsDouble_stub(xCh, t, 0.0);      // @0x4f0d83
  const y = OZChannel__getValueAsDouble_stub(yCh, t, 0.0);      // @0x4f0d9a
  const z = OZChannel__getValueAsDouble_stub(zCh, t, 0.0);      // @0x4f0db4
  out.x = x;                                                     // @0x4f0dbe
  out.y = y;                                                     // @0x4f0dc7
  out.z = z;                                                     // @0x4f0dcc
  return out;                                                    // @0x4f0dd1
}

// ---------------------------------------------------------------------------
// OZ3DEnginePhysicsFieldBehavior::didAddToNode(OZSceneNode*)  @0x4f0be0
// ---------------------------------------------------------------------------
// Body:
//   testq  %rsi, %rsi                        ; if (node == nullptr)
//   je     .Lret                             ;     return;
//   ... save rbx=node, r14=this ...
//   leaq   __ZTI11OZSceneNode(%rip), %rsi           ; %rsi = &typeinfo(OZSceneNode)
//   leaq   __ZTI22OZ3DEngineSceneElement(%rip), %rdx ; %rdx = &typeinfo(OZ3DEngineSceneElement)
//   movq   %rbx, %rdi                        ; %rdi = node
//   xorl   %ecx, %ecx                        ; %ecx = 0 (hint)
//   callq  ___dynamic_cast                   ; %rax = downcast result (or nullptr)
//   testq  %rax, %rax                        ; if (rax == nullptr)
//   je     .Lret                             ;     return;
//   movq   %rbx, 0x140(%r14)                 ; this->attachedNode = node
// .Lret: ret
export function OZ3DEnginePhysicsFieldBehavior_didAddToNode(
  self: OZ3DEnginePhysicsFieldBehavior,
  node: unknown | null,
): void {
  if (node == null) return;                                       // @0x4f0be3 je
  const asElem = dynamic_cast_stub(
    node, /* fromTI */ null, /* toTI */ null, /* hint */ 0,       // @0x4f0c05
  );
  if (asElem == null) return;                                     // @0x4f0c0d je
  self.attachedNode = node;                                       // @0x4f0c0f
}

// ---------------------------------------------------------------------------
// OZ3DEnginePhysicsFieldBehavior::isRebuildUIChannel(OZChannelBase*)  @0x4f0e00
// ---------------------------------------------------------------------------
// Body:
//   leaq   0x210(%rdi), %rax          ; %rax = &this + 0x210 (type_channel)
//   cmpq   %rax, %rsi                 ; ZF = (arg == type_channel)
//   sete   %cl                        ; %cl = (arg == type_channel)
//   addq   $0x440, %rdi               ; %rdi = &this + 0x440 (isExtentInfinite_channel)
//   cmpq   %rdi, %rsi                 ; ZF = (arg == isExtentInfinite_channel)
//   sete   %al                        ; %al = (arg == isExtentInfinite_channel)
//   orb    %cl, %al                   ; %al = %cl | %al
//   ret
// -> Returns TRUE iff the queried channel is either the "Type" enum or the
//    "Infinite Extent" bool — the two channels whose values affect which OTHER
//    channels are hidden (updateHiddenFlags below).
export function OZ3DEnginePhysicsFieldBehavior_isRebuildUIChannel(
  self: OZ3DEnginePhysicsFieldBehavior,
  ch: unknown,
): boolean {
  return ch === self.type_channel || ch === self.isExtentInfinite_channel; // @0x4f0e0e / @0x4f0e1b
}

// ---------------------------------------------------------------------------
// OZ3DEnginePhysicsFieldBehavior::updateHiddenFlags(std::list<OZBehavior*>*)  @0x4f0e30
// ---------------------------------------------------------------------------
// The 210-line body walks a std::list<OZBehavior*> (`{prev, next, val}` nodes
// linked at [0x0, 0x8, 0x10]) TWICE: once to decide if the whole list agrees
// with *this* on both (type, extentIsFinite), and if so, once more to apply
// the corresponding hide/reveal masks (flag bit 0x400000) to each behavior's
// {smoothness (+0x978), animationSpeed (+0xa10), extent (+0x4d8), direction
// (+0x728), minimumDistance (+0xaa8)} channels.
//
// The exact recursive flag policy is (recovered from the disasm at 0x4f0f40..0x4f1195):
//
//   const int myType = getValueAsInt(this+0x210, kCMTimeZero, 0);
//   const bool myExt = getValueAsInt(this+0x440, kCMTimeZero, 0) != 0;
//   // agree = true iff EVERY OZ3DEnginePhysicsFieldBehavior in `list` has same (type, myExt)
//   bool agree = true;
//   for (auto* e : list) {
//     auto* other = dynamic_cast<OZ3DEnginePhysicsFieldBehavior*>(e);
//     if (!other) continue;
//     if (getValueAsInt(other+0x210, kCMTimeZero, 0) != myType) { agree = false; break; }
//     bool oExt = getValueAsInt(other+0x440, kCMTimeZero, 0) != 0;
//     if (oExt != myExt) { agree = false; break; }
//   }
//   if (!agree) {
//     // walk list; per behavior: setFlag(0x400000, true) on smoothness(+0x978)
//     // + animationSpeed(+0xa10); resetFlag(0x400000, true) on extent(+0x4d8).
//     ...  (branch @0x4f1057 — "disagree" leg)
//   } else if ((myType & ~1) == 4 /* Noise or Turbulence */) {
//     // "noise-family" leg @0x4f0f5c — walk list, per behavior:
//     //   resetFlag(0x400000) on smoothness(+0x978), animationSpeed(+0xa10)
//     //   if (myExt) setFlag(0x400000) on isExtentInfinite(+0x4d8?)
//     //             (branch @0x4f0f8a → resetFlag on extent+0x4d8; else setFlag)
//     //   if (myType == 4) setFlag(0x400000) on direction(+0x728); else resetFlag
//     //   if (myExt)  setFlag(0x400000) on minimumDistance(+0xaa8); else resetFlag
//     ...
//   } else {
//     // "other-type" leg @0x4f10cb — walk list, per behavior:
//     //   setFlag(0x400000) on smoothness(+0x978), animationSpeed(+0xa10)
//     //   resetFlag(0x400000) on direction(+0x728)
//     //   if (myExt) setFlag(0x400000) on minimumDistance(+0xaa8); else resetFlag
//     ...
//   }
//
// The precise flag policy depends on OZChannelBase::setFlag/resetFlag semantics
// (which encode "hidden"/"disabled" via bit 0x400000 — that bit isn't yet decoded
// in this port; it's an OZChannelBase constant), and on stable std::list-node
// iteration through the ABI-tagged std::__list_iterator. Faithfully transcribing
// this would need (a) OZChannelBase flag semantics ported and (b) std::list
// iteration ported. Neither is in this class's scope — defer via stub, per
// PORTING_SPEC Rule 3 (throw on undecoded).
export function OZ3DEnginePhysicsFieldBehavior_updateHiddenFlags(
  _self: OZ3DEnginePhysicsFieldBehavior,
  _list: unknown,          // std::list<OZBehavior*>*
): void {
  throw new Error("OZ3DEnginePhysicsFieldBehavior::updateHiddenFlags @0x4f0e30 not yet transcribed (needs OZChannelBase::setFlag/resetFlag @0x6dd914/@0x6dd92c + std::list<OZBehavior*> ABI iteration + _kCMTimeZero from CoreMedia; body is a 210-line two-pass list walk that sets hide-bit 0x400000 on {smoothness, animationSpeed, extent, direction, minimumDistance} based on (type, isExtentInfinite) agreement across sibling behaviors)");
}

// ---------------------------------------------------------------------------
// OZ3DEnginePhysicsFieldBehavior::getLockDependencies(
//     OZLocking*, PCDirectedGraph<OZLocking*>*, std::set<OZLocking*>*)  @0x4f11b0
// ---------------------------------------------------------------------------
// Body (126 lines) is a std::set<OZLocking*> red-black-tree insert of
// `this+0x148` (this class's OZLocking subobject) into the visited set,
// followed by PCDirectedGraph edge bookkeeping. Same pattern as
// OZ3DEngineScenePlacementBehavior::getLockDependencies — inventing a
// std::_Tree walk here is exactly the "invent-a-helper" anti-pattern the spec
// bans. Deferred to the OZLocking / std::set porters.
export function OZ3DEnginePhysicsFieldBehavior_getLockDependencies(
  _self: OZ3DEnginePhysicsFieldBehavior,
  _selfLocking: unknown,     // OZLocking* — the caller's own locking (== &_self + 0x148)
  _graph: unknown,           // PCDirectedGraph<OZLocking*>*
  _visited: unknown,         // std::set<OZLocking*>*
): void {
  throw new Error("OZ3DEnginePhysicsFieldBehavior::getLockDependencies @0x4f11b0 not yet transcribed (needs OZLocking @Ozone + std::set<OZLocking*>::insert @libcxx + PCDirectedGraph<OZLocking*>::addNode transcription; body is a 126-line red-black-tree insert of this+0x148)");
}

// ---------------------------------------------------------------------------
// OZ3DEnginePhysicsFieldBehavior::getLockingID() const   @0x4f1360  (private)
// ---------------------------------------------------------------------------
// Not decoded here — this is an OZLocking virtual overridden via a Thn thunk.
// Deferred to the OZLocking worker.
export function OZ3DEnginePhysicsFieldBehavior_getLockingID(
  _self: OZ3DEnginePhysicsFieldBehavior,
): unknown {
  throw new Error("OZ3DEnginePhysicsFieldBehavior::getLockingID @0x4f1360 not yet transcribed (OZLocking vtable override; wait for OZLocking port)");
}

// ---------------------------------------------------------------------------
// Constructors / destructors / operator=  — undecoded plumbing.
// The primary ctor @0x4f0210 constructs the OZBehavior base, the OZLocking
// subobject at +0x148, and 9 sub-channels at fixed offsets — all through
// stubs that this port hasn't landed. Faithfully transcribing the ctor body
// requires OZBehavior::OZBehavior, OZLocking::OZLocking, OZChannelEnum::ctor,
// OZChannelDouble::ctor, OZChannelBool::ctor, OZChannel3D::ctor, OZChannel::
// setMin/setMax, PCString::PCString/~PCString (none yet ported) so the stub is
// the correct answer here.
export function OZ3DEnginePhysicsFieldBehavior_ctor(
  _self: OZ3DEnginePhysicsFieldBehavior,
  _factory: unknown,        // OZFactory*
  _name: unknown,           // PCString const&
  _flags: number,           // unsigned int
): void {
  // The recovered ctor body constructs (in order):
  //   OZBehavior::OZBehavior(factory, name, flags)                             @0x4f0224
  //   OZLocking::OZLocking()                                    on this+0x148  @0x4f0233
  //   vtable installs at +0x000, +0x010, +0x028, +0x148  (see file header)
  //   OZChannelEnum::C1(1, "Drag;Vortex;Radial Gravity;Linear Gravity;Noise;Turbulence;Electric;Magnetic",
  //                     "Type", &this+0x30, 0xC8, 0, null, null)         on this+0x210  @0x4f02bd
  //   OZChannelDouble::C2(1.0, "Strength", &this+0x30, 0xCB, 0, null, null)  on this+0x310  @0x4f0314
  //   OZChannelDouble::C2(1.0, "Falloff Exponent", &this+0x30, 0xCC, 0, null, null)   on this+0x3a8  @0x4f0363
  //   OZChannelBool::C1(0, "Infinite Extent", &this+0x30, 0xC9, 0, null, null)        on this+0x440  @0x4f03a8
  //   OZChannel3D::C1(1.0, 1.0, 1.0, "Extent", &this+0x30, 0xCA, 0, 3, null, null)     on this+0x4d8  @0x4f03fb
  //   OZChannel3D::C1(0.0, -1.0, 0.0, "Direction", &this+0x30, 0xCD, 0, 3, null, null) on this+0x728  @0x4f044e
  //   OZChannelDouble::C2(0.0, "Smoothness", &this+0x30, 0xCE, 0, null, null)         on this+0x978  @0x4f0493
  //   OZChannelDouble::C2(1.0, "Animation Speed", &this+0x30, 0xCF, 0, null, null)    on this+0xa10  @0x4f04dd
  //   OZChannelDouble::C2(1e-06, "Minimum Falloff Distance", &this+0x30, 0xD0, 0, null, null) on this+0xaa8  @0x4f0527
  //   smoothness_channel->setMin(0.0)                                                @0x4f053b
  //   smoothness_channel->setMax(1.0)                                                @0x4f054b
  //   minimumDistance_channel->setMin(1e-06)                                         @0x4f055b
  // All 3 default-value constants (1.0, -1.0, 1e-06) verified via resolve.py Ozone const at 0x7053e0/0x707728/0x70a0b0.
  throw new Error("OZ3DEnginePhysicsFieldBehavior::ctor @0x4f0210 not yet transcribed (needs OZBehavior::ctor + OZLocking::ctor + OZChannelEnum/OZChannelDouble/OZChannelBool/OZChannel3D::ctor + OZChannel::setMin/setMax + PCString::ctor/dtor — none of the base classes are ported yet)");
}

export function OZ3DEnginePhysicsFieldBehavior_copyCtor(
  _self: OZ3DEnginePhysicsFieldBehavior,
  _other: OZ3DEnginePhysicsFieldBehavior,
  _flags: number,
): void {
  // Copy ctor body @0x4f0950 mirrors the primary ctor's subobject construction
  // but calls each channel's copy-ctor from the corresponding offset in `other`.
  throw new Error("OZ3DEnginePhysicsFieldBehavior::copyCtor @0x4f0950 not yet transcribed (needs OZBehavior copy-ctor + OZLocking ctor + each OZChan* copy-ctor)");
}

export function OZ3DEnginePhysicsFieldBehavior_dtor(
  _self: OZ3DEnginePhysicsFieldBehavior,
): void {
  // D2 @0x4f0b20 / D1 @0x4f0b50 / D0 @0x4f0960 chain through OZChannelDouble::~
  // (x5), OZChannel3D::~ (x2), OZChannelBool::~, OZChannelEnum::~, OZLocking::~,
  // OZBehavior::~ in reverse-construction order.
  throw new Error("OZ3DEnginePhysicsFieldBehavior::~ @0x4f0b20 (D2) / @0x4f0b50 (D1) / @0x4f0960 (D0) not yet transcribed (chains through OZChannelDouble::~ x5, OZChannel3D::~ x2, OZChannelBool::~, OZChannelEnum::~, OZLocking::~, OZBehavior::~)");
}

export function OZ3DEnginePhysicsFieldBehavior_assign(
  _self: OZ3DEnginePhysicsFieldBehavior,
  _other: unknown,          // OZBehavior const&
): OZ3DEnginePhysicsFieldBehavior {
  throw new Error("OZ3DEnginePhysicsFieldBehavior::operator=(OZBehavior const&) @0x4f0bd0 not yet transcribed");
}

// ---------------------------------------------------------------------------
// Aggregate class handle — matches the OZ3DEngineScenePlacementBehavior pattern
// of a single named export bundling every ported method.
// ---------------------------------------------------------------------------
export const OZ3DEnginePhysicsFieldBehavior_methods = {
  type:              OZ3DEnginePhysicsFieldBehavior_type,               // @0x4f0c20
  strength:          OZ3DEnginePhysicsFieldBehavior_strength,           // @0x4f0c40
  falloffExponent:   OZ3DEnginePhysicsFieldBehavior_falloffExponent,    // @0x4f0c60
  smoothness:        OZ3DEnginePhysicsFieldBehavior_smoothness,         // @0x4f0c80
  animationSpeed:    OZ3DEnginePhysicsFieldBehavior_animationSpeed,     // @0x4f0ca0
  minimumDistance:   OZ3DEnginePhysicsFieldBehavior_minimumDistance,    // @0x4f0de0
  isExtentInfinite:  OZ3DEnginePhysicsFieldBehavior_isExtentInfinite,   // @0x4f0cc0
  halfExtent:        OZ3DEnginePhysicsFieldBehavior_halfExtent,         // @0x4f0ce0
  direction:         OZ3DEnginePhysicsFieldBehavior_direction,          // @0x4f0d60
  didAddToNode:      OZ3DEnginePhysicsFieldBehavior_didAddToNode,       // @0x4f0be0
  isRebuildUIChannel:OZ3DEnginePhysicsFieldBehavior_isRebuildUIChannel, // @0x4f0e00
  updateHiddenFlags: OZ3DEnginePhysicsFieldBehavior_updateHiddenFlags,  // @0x4f0e30
  getLockDependencies: OZ3DEnginePhysicsFieldBehavior_getLockDependencies, // @0x4f11b0
  getLockingID:      OZ3DEnginePhysicsFieldBehavior_getLockingID,       // @0x4f1360
  ctor:              OZ3DEnginePhysicsFieldBehavior_ctor,               // @0x4f0210 / @0x4f06e0
  copyCtor:          OZ3DEnginePhysicsFieldBehavior_copyCtor,           // @0x4f0950 / @0x4f06f0
  dtor:              OZ3DEnginePhysicsFieldBehavior_dtor,               // @0x4f0b20 / @0x4f0b50 / @0x4f0960
  assign:            OZ3DEnginePhysicsFieldBehavior_assign,             // @0x4f0bd0
} as const;
