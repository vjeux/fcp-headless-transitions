// raw-port/src/channels/OZ3DEngineApplyForceBehavior.ts
//
// FCP `OZ3DEngineApplyForceBehavior` — an OZBehavior subclass that applies a
// FORCE (in the 3D-engine physics sim) to its target object(s), with an
// animatable magnitude, a direction-mode selector (fixed / toward-target /
// toward-camera, etc.), a fixed direction Vec3d, and an "impulse" flag that
// switches from continuous force to a one-shot velocity kick.
//
// Framework: Ozone.  Thin slice at /tmp/Ozone.x86_64 (per FRAMEWORK_MAP.md).
//
// This file ports the FOUR priority accessor methods that were specifically
// requested by the coordinator (they are the animatable-parameter getters,
// used by the physics simulator at every frame):
//
//   fixedDirection(t)  @0x266bb0  — reads 3 sub-channel doubles at +0x398,+0x430,+0x4c8
//                                    into a PCVector3<double>
//   magnitude(t)       @0x266c30  — reads OZChannelDouble at +0x600 as double
//   isImpulse(t)       @0x266c50  — reads OZChannel  at +0x698 as int, casts to bool
//   directionMode(t)   @0x266c70  — reads OZChannelEnum at +0x210 as int (0..N-1)
//
// The remaining methods on the class (ctors C1/C1copy/C2/C2copy, dtors D0/D1/D2
// + adjustor thunks +0x10/+0x28/+0x40, operator=, didAddToNode, targetObject
// [const + non-const], UUID, isRebuildUIChannel, updateHiddenFlags,
// getLockDependencies [+ adjustor thunk +0x148], getLockingID [+ adjustor thunk +0x148])
// are enumerated in the class ledger but are NOT decoded in this commit —
// they touch the OZBehavior ctor/dtor, OZLocking, std::set<OZLocking*>,
// PCDirectedGraph, dynamic_cast, and PCString ctor/dtor, all of which are the
// same shared "invent-a-red-black-tree" backlog the coordinator already
// deferred on OZ3DEnginePhysicsFieldBehavior. Per PORTING_SPEC Rule 3 they
// stay as throwing stubs citing their own @0xADDR so frontier.py enumerates
// the gap.
//
// Provenance (every method decoded from otool -tV of the FCP.app binary):
//   raw-port/re/disasm/OZ3DEngineApplyForceBehavior.fixedDirection.s  @0x266bb0
//   raw-port/re/disasm/OZ3DEngineApplyForceBehavior.magnitude.s       @0x266c30
//   raw-port/re/disasm/OZ3DEngineApplyForceBehavior.isImpulse.s       @0x266c50
//   raw-port/re/disasm/OZ3DEngineApplyForceBehavior.directionMode.s   @0x266c70
// Class-address enumeration from raw-port/army/inventory/Ozone.syms.txt:
//   C2 @0x266400, C1 @0x266700, C2copy @0x266710, C1copy @0x2668a0,
//   D2 @0x2668b0, D1 @0x2669f0 (+adj-thunks @0x266a00/@0x266a10),
//   D0 @0x266a20 (+adj-thunks @0x266a40/@0x266a70),
//   operator= @0x266aa0, didAddToNode @0x266b70, UUID @0x266cd0,
//   targetObject (nonconst) @0x266c90, targetObject (const) @0x266cb0,
//   isRebuildUIChannel @0x266d20, updateHiddenFlags @0x266d40,
//   getLockDependencies @0x266f70 (+adj-thunk @0x267100),
//   getLockingID @0x267120 (+adj-thunk @0x267170).
//
// Field offsets (recovered from the four accessor bodies alone; the ctor is
// undecoded, so this is the KNOWN subset — do NOT invent additional offsets):
//   +0x210  OZChannelEnum   directionMode_channel   (from directionMode @0x266c74 `addq $0x210`)
//   +0x398  OZChannelDouble fixedDirection.x sub-channel  (from fixedDirection @0x266bc6 `leaq 0x398`)
//   +0x430  OZChannelDouble fixedDirection.y sub-channel  (from fixedDirection @0x266bdd `leaq 0x430`)
//   +0x4c8  OZChannelDouble fixedDirection.z sub-channel  (from fixedDirection @0x266bf4 `addq $0x4c8`)
//   +0x600  OZChannelDouble magnitude_channel       (from magnitude @0x266c34 `addq $0x600`)
//   +0x698  OZChannel       isImpulse_channel       (from isImpulse @0x266c54 `addq $0x698`)
//
// The three +0x398/+0x430/+0x4c8 offsets are almost certainly the three
// sub-double slots of a single OZChannel3D "Fixed Direction" channel — the
// deltas (0x430-0x398 = 0x98, 0x4c8-0x430 = 0x98) match the standard
// OZChannel3D sub-channel spacing (0x88 in OZ3DEnginePhysicsFieldBehavior's
// halfExtent decode is a channel-INTERNAL delta from base +0x88; here the
// deltas 0x98 are 0x98 apart because these are the same-typed sub-channels
// at the top-level "this+K" indexing, not the internal-to-channel indexing).
// The parent OZChannel3D would sit at +0x310 (=0x398-0x88) if the standard
// OZChannel3D layout holds — but that's a guess I refuse to bake into any
// TS symbol, per ANTI_SHORTCUT.md Rule 4 (throw-must-cite / no invented offsets).

import type { CMTime } from "../infra/CMTime";

// ---------------------------------------------------------------------------
// Struct layout (partial — only offsets touched by ported methods).
// ---------------------------------------------------------------------------
export interface OZ3DEngineApplyForceBehavior {
  // +0x210  OZChannelEnum  directionMode  (readAsInt)
  directionMode_channel: unknown;
  // +0x398/+0x430/+0x4c8  three OZChannelDouble sub-channels used by
  //                       fixedDirection(t) to pack a Vec3d.
  fixedDirection_x_channel: unknown;
  fixedDirection_y_channel: unknown;
  fixedDirection_z_channel: unknown;
  // +0x600  OZChannelDouble magnitude
  magnitude_channel: unknown;
  // +0x698  OZChannel      isImpulse   (readAsInt, boolified)
  isImpulse_channel: unknown;
}

// ---------------------------------------------------------------------------
// PCVector3<double> — the caller-supplied return slot for fixedDirection.
// The FCP binary uses C++ struct-return convention: `%rdi` on entry is the
// caller's Vec3d storage; the function returns %rax = rdi.
// ---------------------------------------------------------------------------
export interface PCVector3d {
  x: number;
  y: number;
  z: number;
}

// ---------------------------------------------------------------------------
// OZ3DEngineApplyForceBehavior::fixedDirection(CMTime const&) const   @0x266bb0
// ---------------------------------------------------------------------------
// Full 38-line body reads three per-time doubles from three sub-channels and
// packs them into the caller-supplied Vec3d slot at %rdi (%rbx in the body).
//
//   leaq   0x398(%rsi), %rdi ; xorps xmm0 ; callq stub getValueAsDouble ; -> [rbp-0x28]
//                                          @0x266bc6..@0x266bd3       @0x266bd8
//   leaq   0x430(%rsi), %rdi ; xorps xmm0 ; callq stub getValueAsDouble ; -> [rbp-0x20]
//                                          @0x266bdd..@0x266bea       @0x266bef
//   addq   $0x4c8, %r15 (=%rsi)     ; xorps xmm0 ; callq stub getValueAsDouble
//                                          @0x266bf4..@0x266c04
//   *rbx.x = [rbp-0x28]                    @0x266c0e
//   *rbx.y = [rbp-0x20]                    @0x266c17
//   *rbx.z = %xmm0                         @0x266c1c
//   return %rbx                            @0x266c21 (mov %rbx,%rax; ret)
export function OZ3DEngineApplyForceBehavior_fixedDirection(
  self: OZ3DEngineApplyForceBehavior,
  t: CMTime,
  out: PCVector3d,
): PCVector3d {
  // Order preserved from disasm — three sequential calls, then commit fields.
  const x = OZChannel__getValueAsDouble_stub(self.fixedDirection_x_channel, t, 0.0); // @0x266bd3
  const y = OZChannel__getValueAsDouble_stub(self.fixedDirection_y_channel, t, 0.0); // @0x266bea
  const z = OZChannel__getValueAsDouble_stub(self.fixedDirection_z_channel, t, 0.0); // @0x266c04
  out.x = x;                                                                          // @0x266c0e
  out.y = y;                                                                          // @0x266c17
  out.z = z;                                                                          // @0x266c1c
  return out;                                                                         // @0x266c21
}

// ---------------------------------------------------------------------------
// OZ3DEngineApplyForceBehavior::magnitude(CMTime const&) const   @0x266c30
// ---------------------------------------------------------------------------
// Full 8-line body (tail-jump to OZChannel::getValueAsDouble):
//   addq   $0x600, %rdi                    ; %rdi = this + 0x600 (magnitude_channel)
//   xorps  %xmm0, %xmm0                    ; default double = 0.0
//   jmp    stub OZChannel::getValueAsDouble  @0x266c3f -> Ozone stub @0x6dfa9e
export function OZ3DEngineApplyForceBehavior_magnitude(
  self: OZ3DEngineApplyForceBehavior,
  t: CMTime,
): number {
  return OZChannel__getValueAsDouble_stub(self.magnitude_channel, t, 0.0); // @0x266c3f
}

// ---------------------------------------------------------------------------
// OZ3DEngineApplyForceBehavior::isImpulse(CMTime const&) const   @0x266c50
// ---------------------------------------------------------------------------
// Full 11-line body:
//   addq   $0x698, %rdi                    ; %rdi = this + 0x698 (isImpulse_channel)
//   xorps  %xmm0, %xmm0                    ; default = 0.0
//   callq  stub OZChannel::getValueAsInt     ; %eax = int (getValueAsInt @0x6dfa80)
//   testl  %eax, %eax                        ; ZF = (eax == 0)
//   setne  %al                               ; %al = (eax != 0)
//   ret                                       ; return bool
export function OZ3DEngineApplyForceBehavior_isImpulse(
  self: OZ3DEngineApplyForceBehavior,
  t: CMTime,
): boolean {
  const v = OZChannel__getValueAsInt_stub(self.isImpulse_channel, t, 0.0); // @0x266c5e
  return v !== 0;                                                            // @0x266c63..0x266c65
}

// ---------------------------------------------------------------------------
// OZ3DEngineApplyForceBehavior::directionMode(CMTime const&)    @0x266c70
// ---------------------------------------------------------------------------
// Full 8-line body (tail-jump to OZChannel::getValueAsInt):
//   addq   $0x210, %rdi                    ; %rdi = this + 0x210 (directionMode_channel)
//   xorps  %xmm0, %xmm0                    ; default = 0.0
//   jmp    stub OZChannel::getValueAsInt     @0x266c7f -> Ozone stub @0x6dfa80
// Note: this method is NOT const-qualified (`__ZN...13directionMode...`, not
// `__ZNK...`) — matching the mangled name in the symbol table.
export function OZ3DEngineApplyForceBehavior_directionMode(
  self: OZ3DEngineApplyForceBehavior,
  t: CMTime,
): number {
  return OZChannel__getValueAsInt_stub(self.directionMode_channel, t, 0.0); // @0x266c7f
}

// ---------------------------------------------------------------------------
// Throwing stubs for undecoded OZChannel* entry points, per PORTING_SPEC Rule 3.
// ---------------------------------------------------------------------------

/** OZChannel::getValueAsDouble(CMTime const&, double) const — Ozone stub @0x6dfa9e.
 *  Called from magnitude @0x266c3f (jmp) and fixedDirection @0x266bd3/@0x266bea/@0x266c04. */
function OZChannel__getValueAsDouble_stub(_ch: unknown, _t: CMTime, _def: number): number {
  throw new Error(
    "OZChannel::getValueAsDouble @Ozone 0x6dfa9e not yet transcribed (called from " +
      "OZ3DEngineApplyForceBehavior::magnitude @0x266c3f / fixedDirection " +
      "@0x266bd3,@0x266bea,@0x266c04)",
  );
}

/** OZChannel::getValueAsInt(CMTime const&, double) const — Ozone stub @0x6dfa80.
 *  Called from isImpulse @0x266c5e (call) and directionMode @0x266c7f (jmp). */
function OZChannel__getValueAsInt_stub(_ch: unknown, _t: CMTime, _def: number): number {
  throw new Error(
    "OZChannel::getValueAsInt @Ozone 0x6dfa80 not yet transcribed (called from " +
      "OZ3DEngineApplyForceBehavior::isImpulse @0x266c5e / directionMode @0x266c7f)",
  );
}

// ---------------------------------------------------------------------------
// Remaining ledger-enumerated methods — throw-stubs with @0xADDR provenance.
// Each stays claimable individually via `claim.py claim Ozone
// OZ3DEngineApplyForceBehavior <chunkTag>` in a follow-up.
// ---------------------------------------------------------------------------

/** OZ3DEngineApplyForceBehavior::OZ3DEngineApplyForceBehavior(OZFactory*, PCString const&, uint)
 *  C2 primary ctor @Ozone 0x266400. */
export function OZ3DEngineApplyForceBehavior_C2_primary(): void {
  throw new Error(
    "OZ3DEngineApplyForceBehavior::C2(OZFactory*, PCString const&, uint) @Ozone 0x266400 " +
      "not yet transcribed — full-field layout ctor.",
  );
}

/** OZ3DEngineApplyForceBehavior::OZ3DEngineApplyForceBehavior(OZFactory*, PCString const&, uint)
 *  C1 primary ctor @Ozone 0x266700. */
export function OZ3DEngineApplyForceBehavior_C1_primary(): void {
  throw new Error(
    "OZ3DEngineApplyForceBehavior::C1(OZFactory*, PCString const&, uint) @Ozone 0x266700 " +
      "not yet transcribed — tail-jump variant of C2 primary ctor.",
  );
}

/** OZ3DEngineApplyForceBehavior::OZ3DEngineApplyForceBehavior(OZ3DEngineApplyForceBehavior const&, uint)
 *  C2 copy ctor @Ozone 0x266710. */
export function OZ3DEngineApplyForceBehavior_C2_copy(): void {
  throw new Error(
    "OZ3DEngineApplyForceBehavior::C2(const&, uint) @Ozone 0x266710 not yet transcribed.",
  );
}

/** OZ3DEngineApplyForceBehavior::OZ3DEngineApplyForceBehavior(OZ3DEngineApplyForceBehavior const&, uint)
 *  C1 copy ctor @Ozone 0x2668a0. */
export function OZ3DEngineApplyForceBehavior_C1_copy(): void {
  throw new Error(
    "OZ3DEngineApplyForceBehavior::C1(const&, uint) @Ozone 0x2668a0 not yet transcribed.",
  );
}

/** OZ3DEngineApplyForceBehavior::~OZ3DEngineApplyForceBehavior() — D2 base dtor @Ozone 0x2668b0. */
export function OZ3DEngineApplyForceBehavior_D2(): void {
  throw new Error("OZ3DEngineApplyForceBehavior::~ (D2) @Ozone 0x2668b0 not yet transcribed.");
}

/** OZ3DEngineApplyForceBehavior::~OZ3DEngineApplyForceBehavior() — D1 complete-obj dtor @Ozone 0x2669f0.
 *  Adjustor thunks @+0x10 @Ozone 0x266a00 and @+0x40 @Ozone 0x266a10. */
export function OZ3DEngineApplyForceBehavior_D1(): void {
  throw new Error("OZ3DEngineApplyForceBehavior::~ (D1) @Ozone 0x2669f0 not yet transcribed.");
}

/** OZ3DEngineApplyForceBehavior::~OZ3DEngineApplyForceBehavior() — D0 deleting dtor @Ozone 0x266a20.
 *  Adjustor thunks @+0x10 @Ozone 0x266a40 and @+0x40 @Ozone 0x266a70. */
export function OZ3DEngineApplyForceBehavior_D0(): void {
  throw new Error("OZ3DEngineApplyForceBehavior::~ (D0) @Ozone 0x266a20 not yet transcribed.");
}

/** OZ3DEngineApplyForceBehavior::operator=(OZBehavior const&) @Ozone 0x266aa0. */
export function OZ3DEngineApplyForceBehavior_opAssign(): void {
  throw new Error("OZ3DEngineApplyForceBehavior::operator=(OZBehavior const&) @Ozone 0x266aa0 not yet transcribed.");
}

/** OZ3DEngineApplyForceBehavior::didAddToNode(OZSceneNode*) @Ozone 0x266b70. */
export function OZ3DEngineApplyForceBehavior_didAddToNode(): void {
  throw new Error("OZ3DEngineApplyForceBehavior::didAddToNode(OZSceneNode*) @Ozone 0x266b70 not yet transcribed.");
}

/** OZ3DEngineApplyForceBehavior::targetObject() @Ozone 0x266c90 (nonconst). */
export function OZ3DEngineApplyForceBehavior_targetObject(): void {
  throw new Error("OZ3DEngineApplyForceBehavior::targetObject() @Ozone 0x266c90 not yet transcribed.");
}

/** OZ3DEngineApplyForceBehavior::targetObject() const @Ozone 0x266cb0. */
export function OZ3DEngineApplyForceBehavior_targetObject_const(): void {
  throw new Error("OZ3DEngineApplyForceBehavior::targetObject() const @Ozone 0x266cb0 not yet transcribed.");
}

/** OZ3DEngineApplyForceBehavior::UUID() @Ozone 0x266cd0. */
export function OZ3DEngineApplyForceBehavior_UUID(): void {
  throw new Error("OZ3DEngineApplyForceBehavior::UUID() @Ozone 0x266cd0 not yet transcribed.");
}

/** OZ3DEngineApplyForceBehavior::isRebuildUIChannel(OZChannelBase*) @Ozone 0x266d20. */
export function OZ3DEngineApplyForceBehavior_isRebuildUIChannel(): void {
  throw new Error("OZ3DEngineApplyForceBehavior::isRebuildUIChannel(OZChannelBase*) @Ozone 0x266d20 not yet transcribed.");
}

/** OZ3DEngineApplyForceBehavior::updateHiddenFlags(std::list<OZBehavior*>*) @Ozone 0x266d40. */
export function OZ3DEngineApplyForceBehavior_updateHiddenFlags(): void {
  throw new Error("OZ3DEngineApplyForceBehavior::updateHiddenFlags(list<OZBehavior*>*) @Ozone 0x266d40 not yet transcribed.");
}

/** OZ3DEngineApplyForceBehavior::getLockDependencies(OZLocking*, PCDirectedGraph<OZLocking*>*, set<OZLocking*>*)
 *  @Ozone 0x266f70 (+ adjustor thunk +0x148 @Ozone 0x267100). */
export function OZ3DEngineApplyForceBehavior_getLockDependencies(): void {
  throw new Error("OZ3DEngineApplyForceBehavior::getLockDependencies @Ozone 0x266f70 not yet transcribed.");
}

/** OZ3DEngineApplyForceBehavior::getLockingID() const @Ozone 0x267120 (+ adjustor thunk +0x148 @Ozone 0x267170). */
export function OZ3DEngineApplyForceBehavior_getLockingID(): void {
  throw new Error("OZ3DEngineApplyForceBehavior::getLockingID() const @Ozone 0x267120 not yet transcribed.");
}
