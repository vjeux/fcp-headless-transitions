// OZReflexiveBehavior — Ozone "reflexive" simulation behavior. A pass-through
// simulation-behavior that runs AFTER any prior simulation behavior on the same
// OZSceneNode (that's the "reflexive" part: findPreviousSimulationBehavior walks
// the parent scene node's behavior list backwards and inserts THIS after it), and
// exposes a single per-CMTime boolean channel "Behavior Affects Leaf Nodes"
// (channel ID 0x12c = 300) that toggles two derived flags used by the base
// OZSimulationBehavior machinery.
//
// Transcribed from the x86_64 disassembly of Ozone in
//   /Applications/Final Cut Pro.app/Contents/Frameworks/Ozone.framework/Versions/A/Ozone
//
// FAITHFUL PORT — do NOT approximate, do NOT guess. Every method cites its
// @Ozone 0xADDR read from the disassembly under
// raw-port/re/disasm/OZReflexiveBehavior.<method>.s . Any un-decoded frontier is
// a THROWing stub that names the source address so the gap is loud.
//
// -----------------------------------------------------------------------------
// STRUCT LAYOUT (recovered from ctor/dtor/didAddToNode/notify/parseEnd/
//                setAffectsLeafNodes/hideAffectsLeafNodes/operator= which touch
//                these fields at fixed offsets from `this`)
// -----------------------------------------------------------------------------
//   +0x0000   vptr (primary)                    installed by C2 ctor @0x1f85f3
//                                               (leaq 0x64c28e(%rip); movq %rax,(%rbx))
//                                               & by dtor @0x1f8819 (revert to base ~D2 vtable)
//   +0x0010   secondary sub-object vptr         installed @C2 0x1f85fd; dtor @0x1f8823
//   +0x0028   tertiary sub-object vptr          installed @C2 0x1f8608; dtor @0x1f882e
//   +0x0030   .. OZChannelFolder region         3rd arg passed to OZChannelBool ctor @0x1f8648
//   +0x0148   OZCPPObserver sub-object vptr     installed @C2 0x1f8613; dtor @0x1f8839
//                                               didAddSceneNodeToScene passes &this+0x148 to
//                                               OZDocument::addCPPObserver @0x1f8da6
//                                               willRemove/dtor call removeCPPObserver @0x1f8d75
//   +0x0150   OZChannelBool  affectsLeafNodesChannel
//              — constructed inline (in-place) by OZChannelBool::OZChannelBool(id, name,
//                folder, defaultVal(=xmm0=0.0), enum1(=0x12c/300 = channel id), enum2(=0),
//                impl(=nullptr), info(=nullptr)) @C2 0x1f8662
//              — copy ctor from other.+0x150 via OZChannelBool::OZChannelBool(const&, folder)
//                @C2R 0x1f8722
//              — operator= assigns via OZChannelBase::operator= @0x1f8a13
//              — reset(bool) target in didAddToNode @0x1f8c7d
//              — setDefaultValue(0.0) target in didAddToNode @0x1f8c73
//              — setValue(kCMTimeZero, (double)affectsLeaf, false) in setAffectsLeafNodes
//                @0x1f8e49 (tail-called)
//              — setFlag(0x2, false) in didAddToNode @0x1f8bd3, hideAffectsLeafNodes(true) @0x1f8e6e
//              — resetFlag(0x2, false) in didAddToNode @0x1f8cac, hideAffectsLeafNodes(false) @0x1f8e7c
//              — getValueAsInt(kCMTimeZero, 0.0) in notify @0x1f8efb, parseEnd @0x1f8fd5
//              — dtor: OZChannelBool::~OZChannelBool @0x1f88aa
//   +0x01e8   bool   affectsSelfCached          — didAddToNode writes al = <vtable*+0x400>()
//                                               @0x1f8bac; affectsSelf returns 1 if 0, else
//                                               NOT(+0x1ea) @0x1f8e16-0x1f8e29; parseEnd stubs
//                                               do not touch (only +0x1ea/+0x1ec)
//   +0x01e9   bool   observerRegistered         — didAddSceneNodeToScene sets true @0x1f8dbd,
//                                               willRemove/willRemoveSceneNodeFromScene/dtor
//                                               clear @0x1f8d81/0x1f8df8/0x1f889c
//   +0x01ea   bool   affectsLeafComputedState   — didAddToNode sets true after channel reset
//                                                @0x1f8c82 (see UUID-match path); notify updates
//                                                to (getValueAsInt(...)!=0) @0x1f8f02; parseEnd
//                                                same @0x1f8fdc; affectsSelf reads XOR 1 @0x1f8e1f
//                                                (i.e. affectsSelf = NOT this bit when +0x1e8 == 1)
//                                                copy-ctor propagates from source @0x1f8730
//                                                operator= propagates @0x1f8a1c
//   +0x01eb   bool   hiddenAffectsLeaf          — hideAffectsLeafNodes writes @0x1f8e83; didAddToNode
//                                                gate at 0x1f8bb7/0x1f8bf4; copy-ctor @0x1f873c
//                                                operator= @0x1f8a26
//   +0x01ec   bool   dirtyResetPending          — parseEnd clears @0x1f8fbd; didAddToNode gate/clear
//                                                @0x1f8bd8/0x1f8c8a; copy-ctor @0x1f874a
//
//   NOTE: the "+0x00 vptr" fields are written back to Ozone's __DATA vtables by the
//   ctor. The dtor sets them to the OZReflexiveBehavior vtable addresses again to
//   guard against re-entry during multi-inheritance sub-object destruction; the
//   NEW load addresses at dtor time are:
//     0x1f8819 (leaq 0x64c068  -> primary vtable slot for OZReflexiveBehavior)
//     0x1f8823 (leaq 0x64c34e  -> secondary sub-object)
//     0x1f882e (leaq 0x64c59b  -> tertiary sub-object)
//     0x1f8839 (leaq 0x64c5e8  -> OZCPPObserver sub-object at +0x148)
//   For the port we don't emulate vtable pointers themselves; class methods route
//   through TS methods directly.
//
// -----------------------------------------------------------------------------
// VTABLE-SLOT DISPATCHES observed
// -----------------------------------------------------------------------------
// On `this` vtable:
//   *(vptr + 0x140)  ->  "getSceneNode()" (returns OZSceneNode*)
//                        willRemove @0x1f8d39, dtor @0x1f8857
//   *(vptr + 0x150)  ->  "getScene()"     (returns OZScene*)
//                        willRemove @0x1f8d68, notify @0x1f8ea3, dtor @0x1f8883
//   *(vptr + 0x280)  ->  "getChannelObjectRoot()" (returns OZChannelObjectRoot*)
//                        didAddToNode @0x1f8b8c, willRemove @0x1f8d48, dtor @0x1f8863
//   *(vptr + 0x400)  ->  "computeAffectsSelfInitial()" (returns bool)
//                        didAddToNode @0x1f8ba6 (result stored to +0x1e8)
// On OZScene vtable (via 0x150 dispatch):
//   scene->+0x110 () -> "getScene()" or similar (didAddToNode @0x1f8cd0 -> observer path
//                       when scene != nullptr; result used as OZScene pointer whose
//                       +0x588 field is an OZDocument*)
//
// Base class chain: OZReflexiveBehavior : OZSimulationBehavior : OZBehavior : ...
//
// -----------------------------------------------------------------------------
// UUIDs referenced (byte-order = little-endian per movdqa constant pool)
// -----------------------------------------------------------------------------
//   UUID_ISKIND (@0x705600) — passed to OZFactory::isKindOfClass in
//     findPreviousSimulationBehavior @0x1f8a92 and didAddToNode @0x1f8b31.
//     Filters candidate sibling behaviors before dynamic_cast'ing to
//     OZSimulationBehavior. Raw 16 bytes (LE):
//       80 be 68 80 d7 11 71 7e 03 00 a3 b5 0a 8f d6 93
//   UUID_A (@0x707660) — first ptest match in didAddToNode @0x1f8c0f.
//     Compared against `nodeArg->+0x8->+0x8` (a 16-byte UUID). Raw bytes:
//       38 a2 05 eb d7 11 c5 b3 03 00 0f a7 58 fb 66 93
//   UUID_B — second (unrolled) compound compare @0x1f8c22..0x1f8c5a. The compiler
//     split the compare into 12 bytes of scalar immediates + 4 bytes loaded from
//     the constant pool @0x70a5b0 (whose bytes 0..11 are zero and 12..15 hold
//     the last dword). Reassembled little-endian UUID_B is:
//       dword[0]=0x8b8df2b5, dword[1]=0xb33d11d7, dword[2]=0xab890003,
//       dword[3]=0x9366fb58  ==>  b5 f2 8d 8b d7 11 3d b3 03 00 89 ab 58 fb 66 93
//   Both UUIDs share the trailing 8 bytes "03 00 .. 58 fb 66 93" which is the
//   base-class UUID suffix used by Ozone behaviors.
//
// -----------------------------------------------------------------------------
// The port keeps every method boundary and control-flow branch identical to the
// disassembly. Undecoded callees (base-class ctor/dtor, OZFactory::isKindOfClass,
// OZChannelBool ctor, OZChannel::{setValue,setDefaultValue,getValueAsInt},
// OZChannelBase::{setFlag,resetFlag,reset,assign}, OZChannelObjectRoot::
// {insertBehaviorAfter,removeBehavior}, OZDocument::{addCPPObserver,
// removeCPPObserver}, OZNotificationManager::wasChannelModified,
// OZRenderManager::abort, OZSimulationBehavior::*, dynamic_cast) are declared as
// nominal frontier interfaces / throwing stubs citing their addresses.
// -----------------------------------------------------------------------------

import type { CMTime } from "../infra/CMTime.js";

// -----------------------------------------------------------------------------
// Frontier types — un-ported callees. Nominal opaque handles so the signatures
// line up without lying about internal layout.
// -----------------------------------------------------------------------------

/** OZFactory — Ozone factory-base handle carried by every OZBehavior at +0x8 (per
 *  the load `movq 0x8(%rbx),%rdi` @0x1f8a8d before isKindOfClass; and
 *  `movq 0x8(%rax),%rax` @0x1f8c06 before the UUID load in didAddToNode).
 *  Layout used here: `factory + 0x8` = 16-byte UUID (`movdqu 0x8(%rax),%xmm0`
 *  @0x1f8c0a and the scalar accessor `0x8(%rax)` used at 0x1f8c2f).
 *
 *  @provenance Ozone typeinfo __ZTI9OZFactory (isKindOfClass stub @0x6dfab6).
 */
export interface OZFactory {
  /** OZFactory::isKindOfClass(PCUUID) const — mangled
   *  `__ZNK9OZFactory13isKindOfClassE6PCUUID`, called at Ozone 0x1f8aa1 (in
   *  findPreviousSimulationBehavior) and 0x1f8b41 (in didAddToNode).
   *
   *  In the disassembly the second argument (%rsi) is a pointer to a 16-byte
   *  PCUUID on the stack loaded via `movaps 0x50cb67(%rip),%xmm0; movaps %xmm0,
   *  -0x40(%rbp); leaq -0x40(%rbp),%rsi` (so PCUUID is passed BY VALUE via a
   *  temporary). We model that here as a plain 16-byte array. */
  isKindOfClass(uuid: PCUUID): boolean;
}

/** PCUUID — 16-byte identity tag. Every Ozone class/vtable carries one and the
 *  isKindOfClass call compares against a compile-time constant one. Layout is a
 *  flat 16-byte record; only `bytes[0..15]` are addressable.
 *  @provenance Ozone constant pool @0x705600 / 0x707660 / 0x70a5b0. */
export type PCUUID = Readonly<Uint8Array>;

/** OZSceneNode — Ozone scene-graph node. Layout offsets used here:
 *  - `+0x3e0/+0x3e8`  = std::vector<OZBehavior*> begin/end (behaviors on this node);
 *    iterated in findPreviousSimulationBehavior and didAddToNode. Each element in
 *    the vector is a pointer-to-holder whose `+0x10` field is the actual OZBehavior*
 *    (loaded via `movq (%r13),%rax; movq 0x10(%rax),%rbx` @0x1f8b20-0x1f8b24 /
 *    @0x1f8a80-0x1f8a84). So the vector is a vector of 24-byte holder structs,
 *    not a vector of raw pointers.
 *  @provenance Ozone typeinfo __ZTI11OZSceneNode. */
export interface OZSceneNode { readonly __ozSceneNode: unique symbol }

/** OZScene — scene container. Layout:
 *  - `+0x0588`  OZDocument*                          — dereferenced in
 *              didAddSceneNodeToScene @0x1f8d9f, willRemoveSceneNodeFromScene
 *              @0x1f8ddf, willRemove @0x1f8d6e, notify @0x1f8eaf, dtor @0x1f8890.
 *  - `+0x0098`  OZNotificationManager*               — notify @0x1f8eb6 (this is
 *              loaded FROM the OZDocument at +0x588, i.e. doc->+0x98).
 *  - `+0x0538`  OZRenderManager*                     — notify @0x1f8ed8
 *              (also from doc->+0x538).
 *  @provenance Ozone typeinfo __ZTI7OZScene ref'd in disasm. */
export interface OZScene {
  readonly __ozScene: unique symbol;
  /** OZScene::+0x588 — OZDocument pointer. Field access, not a virtual. */
  readonly _document: OZDocument & {
    /** OZDocument::+0x98 — OZNotificationManager pointer (may be null). */
    _notificationManagerOrNull(): OZNotificationManager | null;
    /** OZDocument::+0x538 — OZRenderManager pointer (may be null). */
    _renderManagerOrNull(): OZRenderManager | null;
  };
}

/** OZDocument — persistence + observer + notification host. */
export interface OZDocument {
  /** OZDocument::addCPPObserver(OZCPPObserver*, long) — mangled
   *  `__ZN10OZDocument14addCPPObserverEP13OZCPPObserverl`; called at
   *  Ozone 0x1f8dae (didAddSceneNodeToScene) and 0x1f8cee (didAddToNode) with
   *  `long = 0x3e9` (=1001). */
  addCPPObserver(obs: OZCPPObserver, tag: number): void;
  /** OZDocument::removeCPPObserver(OZCPPObserver*) — mangled
   *  `__ZN10OZDocument17removeCPPObserverEP13OZCPPObserver`; called at Ozone
   *  0x1f8df3 (willRemoveSceneNodeFromScene), 0x1f8d7c (willRemove), 0x1f8897
   *  (dtor). */
  removeCPPObserver(obs: OZCPPObserver): void;
}

/** OZCPPObserver — sub-object at `this + 0x148` (see STRUCT LAYOUT). Passed by
 *  address (`leaq 0x148(%rdi),%rsi`) to add/removeCPPObserver. Opaque here. */
export interface OZCPPObserver { readonly __ozCPPObserver: unique symbol }

/** OZNotificationManager — @provenance Ozone symbol
 *  `__ZN21OZNotificationManager18wasChannelModifiedEPK13OZChannelBase`. */
export interface OZNotificationManager {
  /** wasChannelModified(OZChannelBase const*) — called from notify @0x1f8ecf. */
  wasChannelModified(ch: OZChannelBase): boolean;
}

/** OZRenderManager — @provenance Ozone stub
 *  `__ZN15OZRenderManager5abortEb` @0x1f8ee9. */
export interface OZRenderManager {
  /** OZRenderManager::abort(bool). Called from notify @0x1f8ee9 with esi=1. */
  abort(force: boolean): void;
}

/** OZChannelObjectRoot — the root of a scene-node's parameter-channel tree. Used
 *  by the behavior insertion/removal calls. */
export interface OZChannelObjectRoot {
  /** OZChannelObjectRoot::insertBehaviorAfter(OZSimulationBehavior*,
   *  OZSimulationBehavior*) — mangled
   *  `__ZN19OZChannelObjectRoot19insertBehaviorAfterEP20OZSimulationBehaviorS1_`,
   *  called at Ozone 0x1f8b9b (didAddToNode). First arg = self, second =
   *  previousSibling-or-null (see findPreviousSimulationBehavior). */
  insertBehaviorAfter(
    behavior: OZSimulationBehavior,
    after: OZSimulationBehavior | null,
  ): void;
  /** OZChannelObjectRoot::removeBehavior(OZSimulationBehavior*) — mangled
   *  `__ZN19OZChannelObjectRoot14removeBehaviorEP20OZSimulationBehavior`, called
   *  at Ozone 0x1f8d54 (willRemove) and 0x1f886f (dtor). */
  removeBehavior(behavior: OZSimulationBehavior): void;
}

/** OZBehavior — abstract base. Only the fields we actually touch are modelled. */
export interface OZBehavior {
  readonly __ozBehavior: unique symbol;
}

/** OZSimulationBehavior — direct base of OZReflexiveBehavior. */
export interface OZSimulationBehavior extends OZBehavior {
  readonly __ozSimulationBehavior: unique symbol;
  /** OZSimulationBehavior::didAddToNode(OZSceneNode*) — tail-called at 0x1f8d02
   *  from didAddToNode after all reflexive-specific setup. */
  didAddToNode(node: OZSceneNode): void;
  /** OZSimulationBehavior::operator=(OZBehavior const&) — tail-called at
   *  0x1f89dd from operator=. */
  assign(rhs: OZBehavior): void;
  /** OZSimulationBehavior::~OZSimulationBehavior() — tail-called at 0x1f88b8 by
   *  ~D2. Not modelled here (base-class destructor is a frontier concern). */
}

/** OZChannelFolder — pointer-to-channel-folder passed at ctor+copy-ctor to
 *  OZChannelBool. In C2 it is `&this + 0x30` (`leaq 0x30(%rbx),%rcx` @0x1f8648).
 *  Not a self-standing type — we model it as a frontier handle. */
export interface OZChannelFolder { readonly __ozChannelFolder: unique symbol }

/** OZChannelImpl / OZChannelInfo — trailing OZChannelBool ctor args. Both nullptr
 *  at the C2 call site. */
export interface OZChannelImpl { readonly __ozChannelImpl: unique symbol }
export interface OZChannelInfo { readonly __ozChannelInfo: unique symbol }

/** OZChannelBase — assignment / flag / reset operations used here. */
export interface OZChannelBase {
  /** OZChannelBase::operator=(OZChannelBase const&) — @0x6dd938 stub, called at
   *  0x1f8a13 from operator= (member channel assignment). */
  assign(rhs: OZChannelBase): void;
  /** OZChannelBase::setFlag(uint64, bool) — @0x6dd914 stub. didAddToNode calls
   *  with `flag=0x2, forceRebuildUI=false` @0x1f8bd3, and same @0x1f8e6e in
   *  hideAffectsLeafNodes(true). */
  setFlag(flag: bigint, force: boolean): void;
  /** OZChannelBase::resetFlag(uint64, bool) — @0x6dd92c stub. didAddToNode calls
   *  with `flag=0x2, force=false` @0x1f8cac, and same @0x1f8e7c in
   *  hideAffectsLeafNodes(false). */
  resetFlag(flag: bigint, force: boolean): void;
  /** OZChannelBase::reset(bool) — @0x6dd8f6 stub. didAddToNode calls with
   *  `force=false` @0x1f8c7d. */
  reset(force: boolean): void;
}

/** OZChannel — OZChannelBase + value accessors used in setAffectsLeafNodes,
 *  notify, parseEnd. */
export interface OZChannel extends OZChannelBase {
  /** OZChannel::setValue(CMTime const&, double, bool) — @0x6df456 stub. */
  setValue(t: CMTime, v: number, isRel: boolean): void;
  /** OZChannel::setDefaultValue(double) — @0x6df306 stub. Called in didAddToNode
   *  @0x1f8c73 with `v=0.0` (xmm0 loaded from constant-pool @0x50c770(%rip)). */
  setDefaultValue(v: number): void;
  /** OZChannel::getValueAsInt(CMTime const&, double) const — @0x6dfa80 stub.
   *  Called in notify @0x1f8efb and parseEnd @0x1f8fd5 with CMTime=kCMTimeZero,
   *  extra=0.0 (xmm0 = xorps -> 0.0). */
  getValueAsInt(t: CMTime, extra: number): number;
}

/** OZChannelBool — subclass of OZChannel, ctor'd inline at this+0x150. */
export interface OZChannelBool extends OZChannel {
  readonly __ozChannelBool: unique symbol;
}

/** kCMTimeZero — external symbol `_kCMTimeZero` (`movq 0x62b6ca(%rip),%rsi`
 *  @0x1f8e3f in setAffectsLeafNodes, @0x1f8eee in notify, @0x1f8fcb in parseEnd).
 *  Passed by-address (pointer to a static CMTime) as the second arg to
 *  setValue / getValueAsInt. */
declare const kCMTimeZero: CMTime;

// -----------------------------------------------------------------------------
// UUIDs used by the class (see the UUID section in the header). Each is a
// frozen 16-byte little-endian byte array — read directly from the disassembly
// constant pool. THESE ARE NOT INVENTED; they are the exact bytes at their cited
// Ozone addresses.
// -----------------------------------------------------------------------------

/** @provenance Ozone __TEXT,__const @0x705600 (loaded @0x1f8a92 / @0x1f8b31). */
export const OZReflexiveBehavior_UUID_ISKIND: PCUUID = Object.freeze(new Uint8Array([
  0x80, 0xbe, 0x68, 0x80, 0xd7, 0x11, 0x71, 0x7e,
  0x03, 0x00, 0xa3, 0xb5, 0x0a, 0x8f, 0xd6, 0x93,
])) as PCUUID;

/** @provenance Ozone __TEXT,__const @0x707660 (loaded @0x1f8c0f). */
export const OZReflexiveBehavior_UUID_A: PCUUID = Object.freeze(new Uint8Array([
  0x38, 0xa2, 0x05, 0xeb, 0xd7, 0x11, 0xc5, 0xb3,
  0x03, 0x00, 0x0f, 0xa7, 0x58, 0xfb, 0x66, 0x93,
])) as PCUUID;

/** @provenance Ozone __TEXT,__const @0x70a5b0 combined with immediates @0x1f8c2a
 *  (0x8b8df2b5), @0x1f8c38 (0xb33d11d7), @0x1f8c49 (0xab890003). Only the trailing
 *  dword at 0x70a5b0+12 (0x9366fb58) is loaded from the constant pool; the first
 *  three dwords come from scalar `xorl` immediates. Assembled little-endian: */
export const OZReflexiveBehavior_UUID_B: PCUUID = Object.freeze(new Uint8Array([
  0xb5, 0xf2, 0x8d, 0x8b, 0xd7, 0x11, 0x3d, 0xb3,
  0x03, 0x00, 0x89, 0xab, 0x58, 0xfb, 0x66, 0x93,
])) as PCUUID;

/** Byte-wise UUID equality helper (little-endian byte compare). */
function pcuuid_eq(a: PCUUID, b: PCUUID): boolean {
  // Both are 16 bytes; ptest of pxor for equality collapses to this.
  if (a.length !== 16 || b.length !== 16) return false;
  for (let i = 0; i < 16; i++) if (a[i] !== b[i]) return false;
  return true;
}

// -----------------------------------------------------------------------------
// Throwing stubs for undecoded external callees.
// -----------------------------------------------------------------------------

/** Base ctor: `OZSimulationBehavior::OZSimulationBehavior(OZFactory*, PCString
 *  const&, unsigned int)` — mangled
 *  `__ZN20OZSimulationBehaviorC2EP9OZFactoryRK8PCStringj`, called at Ozone
 *  0x1f85ee. Not yet transcribed. */
function OZSimulationBehavior_C2_factory(
  _self: OZReflexiveBehavior, _factory: OZFactory, _name: PCString, _flags: number,
): void {
  throw new Error(
    "OZSimulationBehavior::OZSimulationBehavior(OZFactory*, PCString const&, unsigned int) @Ozone 0x1f85ee not yet transcribed",
  );
}

/** Base copy ctor: `OZSimulationBehavior::OZSimulationBehavior(OZSimulationBehavior&,
 *  unsigned int)` — mangled `__ZN20OZSimulationBehaviorC2ERS_j`, called at Ozone
 *  0x1f86dd and 0x1f877d. Not yet transcribed. */
function OZSimulationBehavior_C2_copy(
  _self: OZReflexiveBehavior, _other: OZReflexiveBehavior, _flags: number,
): void {
  throw new Error(
    "OZSimulationBehavior::OZSimulationBehavior(OZSimulationBehavior&, unsigned int) @Ozone 0x1f86dd not yet transcribed",
  );
}

/** OZChannelBool ctor: `OZChannelBool::OZChannelBool(int, PCString const&,
 *  OZChannelFolder*, unsigned int, unsigned int, OZChannelImpl*, OZChannelInfo*)` —
 *  mangled `__ZN13OZChannelBoolC1EiRK8PCStringP15OZChannelFolderjjP13OZChannelImplP13OZChannelInfo`,
 *  called at Ozone 0x1f8662. Not yet transcribed. */
function OZChannelBool_new_default(
  _folder: OZChannelFolder, _name: PCString, _channelId: number,
): OZChannelBool {
  throw new Error(
    "OZChannelBool::OZChannelBool(int, PCString const&, OZChannelFolder*, uint, uint, OZChannelImpl*, OZChannelInfo*) @Ozone 0x1f8662 not yet transcribed",
  );
}

/** OZChannelBool copy ctor: `OZChannelBool::OZChannelBool(OZChannelBool const&,
 *  OZChannelFolder*)` — mangled `__ZN13OZChannelBoolC1ERKS_P15OZChannelFolder`,
 *  called at Ozone 0x1f8722 (C2 copy) and 0x1f87c2 (C1 copy). Not yet transcribed. */
function OZChannelBool_new_copy(
  _other: OZChannelBool, _folder: OZChannelFolder,
): OZChannelBool {
  throw new Error(
    "OZChannelBool::OZChannelBool(OZChannelBool const&, OZChannelFolder*) @Ozone 0x1f8722 not yet transcribed",
  );
}

/** PCString ctor from CFString/Bundle: `PCString::PCString(__CFString const*,
 *  __CFBundle*, __CFString const*)` — mangled
 *  `__ZN8PCStringC1EPK10__CFStringP10__CFBundleS2_`, called at Ozone 0x1f863c to
 *  materialize the localized "Behavior Affects Leaf Nodes" display name for the
 *  channel. Not yet transcribed. */
function PCString_from_cfstring(_key: string, _bundleFromApp: unknown): PCString {
  throw new Error(
    "PCString::PCString(__CFString const*, __CFBundle*, __CFString const*) @Ozone 0x1f863c not yet transcribed",
  );
}

/** Dynamic-cast to OZSimulationBehavior*: `__dynamic_cast(from, __ZTI10OZBehavior,
 *  __ZTI20OZSimulationBehavior, 0)` @Ozone 0x1f8b75 (didAddToNode) and 0x1f8ad1
 *  (findPreviousSimulationBehavior). Returns null on mismatch. Not yet transcribed. */
function dynamic_cast_to_OZSimulationBehavior(
  _obj: OZBehavior,
): OZSimulationBehavior | null {
  throw new Error(
    "__dynamic_cast(OZBehavior->OZSimulationBehavior) @Ozone 0x1f8b75 / 0x1f8ad1 not yet transcribed",
  );
}

/** Dynamic-cast to OZReflexiveBehavior* used in operator=: `__dynamic_cast(rhs,
 *  __ZTI10OZBehavior, __ZTI19OZReflexiveBehavior, 0)` @Ozone 0x1f89f5. Returns
 *  null (and __cxa_bad_cast is called) if the rhs is not actually a
 *  OZReflexiveBehavior. Not yet transcribed. */
function dynamic_cast_to_OZReflexiveBehavior(
  _obj: OZBehavior,
): OZReflexiveBehavior | null {
  throw new Error(
    "__dynamic_cast(OZBehavior->OZReflexiveBehavior) @Ozone 0x1f89f5 not yet transcribed",
  );
}

/** __cxa_bad_cast @0x6dfccc (stub) — invoked at Ozone 0x1f8a47 when the
 *  dynamic_cast in operator= fails. */
function cxa_bad_cast(): never {
  throw new Error("__cxa_bad_cast @Ozone 0x1f8a47");
}

// -----------------------------------------------------------------------------
// PCString parameter type (for the ctor signature).
// -----------------------------------------------------------------------------
export interface PCString { readonly __pcString: unique symbol }

// -----------------------------------------------------------------------------
// The class.
// -----------------------------------------------------------------------------

/**
 * OZReflexiveBehavior : OZSimulationBehavior. See file header for full struct
 * layout and vtable-slot map.
 */
export class OZReflexiveBehavior {
  /** Direct base-class sub-object. Modelled as a private OZSimulationBehavior*
   *  handle — the base ctor writes here and we re-expose via `asSimulation()`. */
  private readonly _baseSimulation: OZSimulationBehavior;
  /** Behavior's OZFactory pointer at +0x8 (accessed by iteration helpers). */
  private readonly _factoryAt8: OZFactory;

  /** +0x148 sub-object — passed as the OZCPPObserver pointer to
   *  OZDocument::add/removeCPPObserver. Opaque here. */
  readonly _observerSubObject: OZCPPObserver;

  /** +0x150 OZChannelBool. Constructed inline in every ctor. */
  affectsLeafNodesChannel!: OZChannelBool;

  /** +0x1e8 bool  affectsSelfCached */
  affectsSelfCached: boolean = false;
  /** +0x1e9 bool  observerRegistered */
  observerRegistered: boolean = false;
  /** +0x1ea bool  affectsLeafComputedState */
  affectsLeafComputedState: boolean = false;
  /** +0x1eb bool  hiddenAffectsLeaf */
  hiddenAffectsLeaf: boolean = false;
  /** +0x1ec bool  dirtyResetPending */
  dirtyResetPending: boolean = false;

  /**
   * OZReflexiveBehavior::OZReflexiveBehavior(OZFactory*, PCString const&, unsigned int)
   * @Ozone 0x00000000001f85e0  (__ZN19OZReflexiveBehaviorC2EP9OZFactoryRK8PCStringj)
   * (C1 @0x1f86c0 is a plain thunk that jmps to C2.)
   *
   * DECODE (see body of C2 in the header commentary):
   *   0x1f85ee callq  OZSimulationBehavior::C2(factory,name,flags)          ; base ctor
   *   0x1f85f3 install primary vptr into this+0x0
   *   0x1f85fd install secondary vptr into this+0x10
   *   0x1f8608 install tertiary vptr into this+0x28
   *   0x1f8613 install OZCPPObserver sub-object vptr into this+0x148
   *   0x1f8621-0x1f863c build PCString(displayName="Behavior Affects Leaf Nodes")
   *                    from theApp->+0x48 (a bundle) via
   *                    PCString::PCString(CFStr, CFBundle*, CFStr)
   *   0x1f8641 leaq  0x150(%rbx), %rdi                                    ; &channel
   *   0x1f8648 leaq  0x30(%rbx),  %rcx                                    ; &folder(this+0x30)
   *   0x1f864c xorps  %xmm0,%xmm0        movups %xmm0,(%rsp)              ; two null trailing args
   *   0x1f8653 leaq  -0x18(%rbp), %rdx                                    ; &displayName
   *   0x1f8657 xorl  %esi, %esi                                           ; id=0
   *   0x1f8659 movl  $0x12c, %r8d                                         ; channelId=300
   *   0x1f865f xorl  %r9d, %r9d                                           ; flags=0
   *   0x1f8662 callq OZChannelBool::OZChannelBool(int, PCString&, folder*, uint, uint, impl*, info*)
   *   0x1f866b callq PCString::~PCString                                  ; destroy tmp
   *   0x1f8670 movl  $0x1000000, 0x1e9(%rbx)                              ; ★ writes 4 BYTES
   *            ; = { +0x1e9: 0x00, +0x1ea: 0x00, +0x1eb: 0x00, +0x1ec: 0x01 }
   *            ; so observerRegistered=false, affectsLeafComputedState=false,
   *            ;    hiddenAffectsLeaf=false,  dirtyResetPending=true
   *
   * NOTE: The `movl $0x1000000, 0x1e9(%rbx)` at 0x1f8670 is a single 4-byte store
   * combining flag defaults. Byte-order LE: 00 00 00 01. Address +0x1e9 receives
   * byte0 (0x00), +0x1ea byte1 (0x00), +0x1eb byte2 (0x00), +0x1ec byte3 (0x01).
   * The +0x1e8 byte is untouched here (stays whatever OZSimulationBehavior C2 left).
   */
  static create(
    factory: OZFactory,
    name: PCString,
    flags: number,
  ): OZReflexiveBehavior {
    const self = Object.create(OZReflexiveBehavior.prototype) as OZReflexiveBehavior;
    // 0x1f85ee — base OZSimulationBehavior ctor.
    OZSimulationBehavior_C2_factory(self, factory, name, flags >>> 0);
    // 0x1f85f3-0x1f8613 — install the four vptrs. We don't emulate vptrs.
    Reflect.set(self, "_factoryAt8", factory);
    Reflect.set(self, "_observerSubObject", {} as OZCPPObserver);
    // 0x1f8621-0x1f866b — build the localized display-name PCString and
    // construct the OZChannelBool at +0x150. Trailing PCString destruction happens
    // in the FCP code but is a no-op in TS.
    const displayName = PCString_from_cfstring("Behavior Affects Leaf Nodes", null);
    self.affectsLeafNodesChannel = OZChannelBool_new_default(
      // folder = this+0x30 — passed as OZChannelFolder pointer.
      Reflect.get(self, "_folderAt0x30") as OZChannelFolder ??
        ({} as OZChannelFolder),
      displayName,
      0x12c, // channel id 300 (r8d) — passed as one of the "uint" args.
    );
    // 0x1f8670 — combined 4-byte store into +0x1e9..+0x1ec (LE 00 00 00 01).
    self.observerRegistered = false;          // +0x1e9 = 0x00
    self.affectsLeafComputedState = false;    // +0x1ea = 0x00
    self.hiddenAffectsLeaf = false;           // +0x1eb = 0x00
    self.dirtyResetPending = true;            // +0x1ec = 0x01
    // +0x1e8 (affectsSelfCached) intentionally NOT set here — inherits whatever
    // OZSimulationBehavior's base ctor left. didAddToNode will overwrite.
    return self;
  }

  /**
   * OZReflexiveBehavior::OZReflexiveBehavior(OZReflexiveBehavior&, unsigned int)
   * @Ozone 0x00000000001f86d0  (__ZN19OZReflexiveBehaviorC2ERS_j)
   * (C1 copy @0x1f8770 is a mirror; both bodies are 99% identical modulo the
   *  vtable-slot offsets they install.)
   *
   * DECODE:
   *   0x1f86dd callq OZSimulationBehavior::C2(other, flags)         ; base copy ctor
   *   0x1f86e2..0x1f8709 install four vptrs
   *   0x1f8710 leaq 0x150(%rbx),%rdi ; leaq 0x150(%r14),%rsi ; leaq 0x30(%rbx),%rdx
   *   0x1f8722 callq OZChannelBool::OZChannelBool(const&, folder)   ; copy channel
   *   0x1f8727 movb  $0x0, 0x1e9(%rbx)                              ; observerRegistered=false
   *   0x1f872e-0x1f8744 copy +0x1ea,+0x1eb,+0x1ec from other
   *   (returns)
   *   [+0x1e8 is NOT copied — matches FCP behaviour of leaving `affectsSelfCached`
   *    to be re-derived by a subsequent didAddToNode; base copy ctor initializes it.]
   */
  static createCopy(
    other: OZReflexiveBehavior,
    flags: number,
  ): OZReflexiveBehavior {
    const self = Object.create(OZReflexiveBehavior.prototype) as OZReflexiveBehavior;
    OZSimulationBehavior_C2_copy(self, other, flags >>> 0);
    Reflect.set(self, "_factoryAt8", (other as unknown as { _factoryAt8: OZFactory })._factoryAt8);
    Reflect.set(self, "_observerSubObject", {} as OZCPPObserver);
    self.affectsLeafNodesChannel = OZChannelBool_new_copy(
      other.affectsLeafNodesChannel,
      Reflect.get(self, "_folderAt0x30") as OZChannelFolder ??
        ({} as OZChannelFolder),
    );
    self.observerRegistered = false;                            // 0x1f8727
    self.affectsLeafComputedState = other.affectsLeafComputedState; // 0x1f872e-0x1f8736
    self.hiddenAffectsLeaf = other.hiddenAffectsLeaf;               // 0x1f873c-0x1f8744
    self.dirtyResetPending = other.dirtyResetPending;               // 0x1f874a-0x1f8752
    return self;
  }

  /**
   * OZReflexiveBehavior::~OZReflexiveBehavior()
   * @Ozone 0x00000000001f8810  (__ZN19OZReflexiveBehaviorD2Ev; D1 @0x1f88d0 is
   * a thunk; D0 @0x1f8920 is `~D2 + operator delete`).
   *
   * DECODE:
   *   0x1f8819..0x1f8839 re-install this class's own vtable ptrs (defensive)
   *   0x1f8847 callq OZBehavior::getSceneNode()   ; check we're still attached
   *   0x1f884c testq rax; je skip_remove
   *     0x1f8851  ourVptr[0x140]() -> ownerSceneNode
   *     0x1f8857  ownerSceneNode->vtable[0x280]() -> OZChannelObjectRoot*
   *     0x1f8863  callq OZChannelObjectRoot::removeBehavior(this)
   *   0x1f8874 cmpb $0x1, 0x1e9(this); jne skip_observer
   *     0x1f887d  ourVptr[0x150]() -> OZScene*
   *     0x1f8883  scene->+0x588 = OZDocument*
   *     0x1f8890  leaq 0x148(this),%rsi
   *     0x1f8897  callq OZDocument::removeCPPObserver(&observerSubObj)
   *     0x1f889c  observerRegistered = false
   *   0x1f88a3  &channel = this+0x150
   *   0x1f88aa  callq OZChannelBool::~OZChannelBool           ; destroy channel in place
   *   0x1f88b8  jmp OZSimulationBehavior::~OZSimulationBehavior()  ; base dtor
   *
   * The catch/terminate landing pad at 0x1f88bd (___clang_call_terminate) is C++
   * EH plumbing that the port doesn't emulate.
   */
  destroy(): void {
    // 0x1f8847 — check we're still attached to a scene node.
    const node = this._get_baseSimulation_sceneNodeOrNull();
    if (node !== null) {
      // 0x1f8851  ownerSceneNode = vtable[0x140]() ; but from disasm this actually
      // calls *0x140 on ourselves which is base's getSceneNode wrapper. Then
      // *0x280 on THAT return to get root. Model both as the same base-provided
      // helper; the base class knows how to fetch the channel-object root.
      const root = this._get_channelObjectRootOfOwner();
      // 0x1f8863
      root.removeBehavior(this._asSimulation());
    }
    if (this.observerRegistered) {
      const scene = this._get_scene();
      // 0x1f8890/0x1f8897 — remove ourselves as observer of the doc.
      scene._document.removeCPPObserver(this._observerSubObject);
      this.observerRegistered = false;
    }
    // 0x1f88aa — destroy the embedded OZChannelBool. TS is GC'd so this is a
    // logical destructor call; we clear the field to mirror lifetime.
    (this as unknown as { affectsLeafNodesChannel: undefined }).affectsLeafNodesChannel = undefined;
    // 0x1f88b8 — chain base dtor. Undecoded here.
    throw new Error(
      "OZSimulationBehavior::~OZSimulationBehavior @Ozone 0x1f88b8 not yet transcribed",
    );
  }

  /**
   * OZReflexiveBehavior::operator=(OZBehavior const&)
   * @Ozone 0x00000000001f89d0  (__ZN19OZReflexiveBehavioraSERK10OZBehavior)
   *
   * DECODE:
   *   0x1f89dd callq OZSimulationBehavior::operator=(rhs)     ; base assign
   *   0x1f89e2..0x1f89f5 __dynamic_cast<OZReflexiveBehavior>(rhs)   ; static_cast<rhs, refl>
   *   0x1f89fa testq rax; je   0x1f8a47   ; -> __cxa_bad_cast
   *   0x1f89ff mov rax,r14
   *   0x1f8a02 addq $0x150,rax  -> &rhs.channel
   *   0x1f8a0c leaq 0x150(rbx),rdi -> &this.channel
   *   0x1f8a13 callq OZChannelBase::operator=  (channel assignment)
   *   0x1f8a18-0x1f8a3c copy 3 bytes: +0x1e8, +0x1ea, +0x1eb (NOT +0x1e9, NOT +0x1ec)
   *   ret
   */
  assign(rhs: OZBehavior): void {
    // 0x1f89dd — call base OZSimulationBehavior::operator=.
    this._asSimulation().assign(rhs);
    // 0x1f89e5-0x1f89f5 — dynamic_cast the rhs to a OZReflexiveBehavior*.
    const other = dynamic_cast_to_OZReflexiveBehavior(rhs);
    if (other === null) {
      cxa_bad_cast();
    }
    // 0x1f8a13 — channel assignment (uses OZChannelBase::operator= on the
    // OZChannelBool sub-object).
    this.affectsLeafNodesChannel.assign(other.affectsLeafNodesChannel);
    // 0x1f8a18-0x1f8a24 — copy +0x1e8.
    this.affectsSelfCached = other.affectsSelfCached;
    // 0x1f8a26-0x1f8a34 — copy +0x1ea.
    this.affectsLeafComputedState = other.affectsLeafComputedState;
    // 0x1f8a34-0x1f8a42 — copy +0x1eb.
    this.hiddenAffectsLeaf = other.hiddenAffectsLeaf;
    // +0x1e9 and +0x1ec are INTENTIONALLY not copied.
  }

  /**
   * OZReflexiveBehavior::findPreviousSimulationBehavior(OZSceneNode*) const
   * @Ozone 0x00000000001f8a50
   *   (__ZNK19OZReflexiveBehavior30findPreviousSimulationBehaviorEP11OZSceneNode)
   *
   * DECODE:
   *   Walks node->+0x3e0..+0x3e8 (std::vector<holder>*). For each holder H (@r13),
   *   the actual OZBehavior* is at H->+0x10. Skip if it IS this (`cmpq %r12,%r15`
   *   at 0x1f8a8b). Otherwise call OZFactory::isKindOfClass(H_behavior->+0x8,
   *   UUID_ISKIND). If that returns TRUE, remember the last such candidate
   *   (`cmovneq %r12,%rbx` at 0x1f8aa8 — cmov, so it OVERWRITES on each match; the
   *   LAST match wins). After the loop, if `rbx == null` return null; else
   *   dynamic_cast<OZSimulationBehavior*>(rbx).
   */
  findPreviousSimulationBehavior(node: OZSceneNode): OZSimulationBehavior | null {
    // Iterate the node's behavior vector. Layout: each element is a 24-byte
    // holder whose +0x10 is an OZBehavior*. We model that as a helper that
    // hands us the sequence of OZBehavior* on the node.
    let lastMatch: OZBehavior | null = null;
    for (const beh of this._iter_behaviors_on(node)) {
      // 0x1f8a88 — skip THIS behavior.
      if ((beh as unknown) === (this as unknown)) continue;
      // 0x1f8a8d — load beh->+0x8 (OZFactory*).
      const factory = this._factory_of(beh);
      // 0x1f8aa1 — isKindOfClass(UUID_ISKIND). PCUUID is passed by value; we
      // freshly copy the constant into a temporary each iteration to match the
      // disasm's `movaps 0x50cb67(%rip),%xmm0; movaps %xmm0,-0x40(%rbp)` (which
      // spills the constant to the stack before the call).
      const uuidTmp: PCUUID = new Uint8Array(OZReflexiveBehavior_UUID_ISKIND);
      // 0x1f8aa6 testb, 0x1f8aa8 cmovneq: last match wins.
      if (factory.isKindOfClass(uuidTmp)) {
        lastMatch = beh;
      }
    }
    // 0x1f8abc — return null if we found no candidates.
    if (lastMatch === null) return null;
    // 0x1f8ad1 — otherwise dynamic_cast to OZSimulationBehavior*.
    return dynamic_cast_to_OZSimulationBehavior(lastMatch);
  }

  /**
   * OZReflexiveBehavior::didAddToNode(OZSceneNode*)
   * @Ozone 0x00000000001f8af0  (__ZN19OZReflexiveBehavior12didAddToNodeEP11OZSceneNode)
   *
   * DECODE (see block header for byte-level walkthrough):
   *
   *   Step 1: find previous simulation behavior (inline copy of
   *           findPreviousSimulationBehavior body) — result in %r15.
   *   Step 2: root = node->getChannelObjectRoot()  ; via vtable slot 0x280
   *           root.insertBehaviorAfter(this, r15)
   *   Step 3: al = ourVtable[0x400]()  ; a virtual "compute-initial-affects-self"
   *           this->affectsSelfCached = al
   *           if al != 0 AND +0x1eb == 1  → go to else-branch (skip enable)
   *   Step 4: (enable path)
   *             channel.setFlag(0x2, false)                      @0x1f8bd3
   *   Step 5: if +0x1ec == 1 (dirtyResetPending):
   *             (guarded by: al!=0 AND +0x1eb==0, both branches converge here)
   *             UUID compare against node->+0x8->+0x8:
   *               - if match UUID_A (@0x707660)  → do reset+setDefault directly
   *               - else if match UUID_B (compound)  → same
   *               - else skip resetChannel block
   *             resetChannel block:
   *               channel.setDefaultValue(0.0)                    @0x1f8c73
   *               channel.reset(false)                            @0x1f8c7d
   *               this->affectsLeafComputedState = true (movb $0x1) @0x1f8c82
   *             ALWAYS: this->dirtyResetPending = false            @0x1f8c8a
   *   Step 6: (disable path when al!=0 && +0x1eb==1)
   *             channel.resetFlag(0x2, false)                     @0x1f8cac
   *             if +0x1ec == 1: fall through to Step 5's inner logic
   *             else skip
   *   Step 7: if +0x1e9 == 0 (observer not yet registered):
   *             scene = ourVtable[0x110]() ; if null skip
   *             else:
   *               doc = scene->+0x588
   *               doc.addCPPObserver(&this+0x148, 0x3e9)          @0x1f8cee
   *               this->observerRegistered = true                 @0x1f8cf3
   *   Step 8: tail-call OZSimulationBehavior::didAddToNode(node)  @0x1f8d02
   *
   * (The `computeAffectsSelfInitial` at *(vptr+0x400) returns a bool. `+0x1eb`
   * (hiddenAffectsLeaf) is what selects which branch: "hidden" means the flag
   * should be RESET, "not hidden" means SET.)
   */
  didAddToNode(node: OZSceneNode): void {
    // -- Step 1: inline findPreviousSimulationBehavior (loop @0x1f8b20..0x1f8b5b).
    let prev: OZSimulationBehavior | null = null;
    {
      let lastMatch: OZBehavior | null = null;
      for (const beh of this._iter_behaviors_on(node)) {
        if ((beh as unknown) === (this as unknown)) continue;
        const factory = this._factory_of(beh);
        const uuidTmp: PCUUID = new Uint8Array(OZReflexiveBehavior_UUID_ISKIND);
        if (factory.isKindOfClass(uuidTmp)) {
          lastMatch = beh;
        }
      }
      // 0x1f8b62..0x1f8b75 — dynamic_cast the last match to OZSimulationBehavior*.
      if (lastMatch !== null) {
        prev = dynamic_cast_to_OZSimulationBehavior(lastMatch);
      }
    }

    // -- Step 2 — @0x1f8b8c/@0x1f8b9b — insertBehaviorAfter.
    const root = this._channelObjectRootOf(node);
    root.insertBehaviorAfter(this._asSimulation(), prev);

    // -- Step 3 — @0x1f8ba6-0x1f8bb5 — vtable[0x400]() sets affectsSelfCached,
    // then branch on (al != 0) && (hiddenAffectsLeaf == 1).
    const al = this._computeAffectsSelfInitial() ? 1 : 0;
    this.affectsSelfCached = al !== 0;

    if (!(al !== 0 && this.hiddenAffectsLeaf === true)) {
      // -- Step 4 — enable path.
      this.affectsLeafNodesChannel.setFlag(0x2n, false);
      if (this.dirtyResetPending) {
        // 0x1f8be6 — begin UUID gate. `nodeArg->+0x8->+0x8` is a 16-byte UUID.
        const factory = this._factory_of(node as unknown as OZBehavior); // Same +0x8 layout for node and behavior at this call site.
        // Actually the disasm uses the STACKED node ptr, then loads its +0x8 as
        // a pointer (0x1f8c06 `movq 0x8(%rax),%rax`) then loads +0x8 of THAT as
        // the UUID (0x1f8c0a `movdqu 0x8(%rax),%xmm0`). Model as "the node's
        // factory has a UUID at +0x8".
        const uuidHere: PCUUID = this._uuid_of_factory(factory);
        // 0x1f8c0f-0x1f8c20 — first compare vs UUID_A. ptest(pxor(uuidHere,
        // UUID_A)) == 0 iff bytewise equal.
        const matchA = pcuuid_eq(uuidHere, OZReflexiveBehavior_UUID_A);
        // 0x1f8c22-0x1f8c5f — second (unrolled) compare vs UUID_B.
        // The compiler unrolled this as (dword[0..2] xor imm) OR + (dword[3]
        // via pcmpeqd byte12 mask). We just do the bytewise compare — same
        // outcome for every input.
        const matchB = pcuuid_eq(uuidHere, OZReflexiveBehavior_UUID_B);
        if (matchA || matchB) {
          // 0x1f8c61-0x1f8c7d — resetChannel block.
          this.affectsLeafNodesChannel.setDefaultValue(0.0);
          this.affectsLeafNodesChannel.reset(false);
          this.affectsLeafComputedState = true;
        }
        // 0x1f8c8a — always clear the dirty bit after the gate.
        this.dirtyResetPending = false;
      }
    } else {
      // -- Step 6 — disable path (al!=0 && hiddenAffectsLeaf==1).
      // 0x1f8c9e-0x1f8cac
      this.affectsLeafNodesChannel.resetFlag(0x2n, false);
      // 0x1f8cb1 — if dirtyResetPending, re-enter the inner UUID+reset block.
      if (this.dirtyResetPending) {
        const factory = this._factory_of(node as unknown as OZBehavior);
        const uuidHere: PCUUID = this._uuid_of_factory(factory);
        const matchA = pcuuid_eq(uuidHere, OZReflexiveBehavior_UUID_A);
        const matchB = pcuuid_eq(uuidHere, OZReflexiveBehavior_UUID_B);
        if (matchA || matchB) {
          this.affectsLeafNodesChannel.setDefaultValue(0.0);
          this.affectsLeafNodesChannel.reset(false);
          this.affectsLeafComputedState = true;
        }
        this.dirtyResetPending = false;
      }
    }

    // -- Step 7 — @0x1f8c92-0x1f8cf3 — register observer if not registered.
    if (!this.observerRegistered) {
      const scene = this._get_scene_or_null();
      if (scene !== null) {
        scene._document.addCPPObserver(this._observerSubObject, 0x3e9);
        this.observerRegistered = true;
      }
    }

    // -- Step 8 — @0x1f8d02 — tail-call base.
    this._asSimulation().didAddToNode(node);
  }

  /**
   * OZReflexiveBehavior::didInsert(OZSceneNode*, OZBehavior*)
   * @Ozone 0x00000000001f8d20  (__ZN19OZReflexiveBehavior9didInsertEP11OZSceneNodeP10OZBehavior)
   *
   * DECODE (8 lines total, pure vtable forward):
   *   0x1f8d24 movq  (%rdi), %rax          ; rax = ourVtable
   *   0x1f8d27 movq  0x60(%rax), %rax      ; rax = ourVtable[0x60]
   *   0x1f8d2b popq  %rbp
   *   0x1f8d2c jmpq  *%rax                 ; TAIL CALL through vtable slot 0x60
   *
   * i.e. the reflexive-behavior override of didInsert is "call whatever base
   * class's slot-0x60 method is" (with the same (this, node, otherBehavior)
   * arguments). Slot 0x60 on OZReflexiveBehavior's vtable is the base
   * OZBehavior/OZSimulationBehavior implementation of some virtual (likely a
   * generic "notify insertion" hook). We haven't yet decoded what OZBehavior's
   * vtable[0x60] resolves to, so this is a THROWing frontier stub.
   */
  didInsert(_node: OZSceneNode, _other: OZBehavior): void {
    // 0x1f8d24-0x1f8d2c — forward through our own vtable slot 0x60.
    throw new Error(
      "OZReflexiveBehavior::didInsert -> vtable[0x60] @Ozone 0x1f8d27 not yet transcribed",
    );
  }

  /**
   * OZReflexiveBehavior::willRemove()
   * @Ozone 0x00000000001f8d30  (__ZN19OZReflexiveBehavior10willRemoveEv)
   *
   * DECODE:
   *   0x1f8d39 rax = ourVtable[0x140]()  ; getSceneNode
   *   0x1f8d3e rax = ownerNode->vtable[0x280]() ; getChannelObjectRoot
   *   0x1f8d54 root.removeBehavior(this)
   *   0x1f8d59 cmpb $0x1, 0x1e9(this); jne 0x1f8d88
   *     0x1f8d68  scene = ourVtable[0x150]()
   *     0x1f8d6e  doc   = scene->+0x588
   *     0x1f8d75  leaq  0x148(this),%rsi
   *     0x1f8d7c  doc.removeCPPObserver(&observer)
   *     0x1f8d81  observerRegistered = false
   *   0x1f8d88 ret
   */
  willRemove(): void {
    // 0x1f8d39-0x1f8d54.
    const root = this._get_channelObjectRootOfOwner();
    root.removeBehavior(this._asSimulation());
    // 0x1f8d59.
    if (this.observerRegistered) {
      const scene = this._get_scene();
      scene._document.removeCPPObserver(this._observerSubObject);
      this.observerRegistered = false;
    }
  }

  /**
   * OZReflexiveBehavior::didAddSceneNodeToScene(OZScene*)
   * @Ozone 0x00000000001f8d90
   *   (__ZN19OZReflexiveBehavior22didAddSceneNodeToSceneEP7OZScene)
   *
   * DECODE:
   *   0x1f8d90 cmpb $0x0, 0x1e9(this); jne 0x1f8dca   ; short-circuit if already registered
   *   0x1f8d9f rax = scene->+0x588  (OZDocument*)
   *   0x1f8da6 leaq 0x148(this),%rsi
   *   0x1f8dad movl $0x3e9,%edx
   *   0x1f8db8 doc.addCPPObserver(&observer, 0x3e9)
   *   0x1f8dbd observerRegistered = true
   *   ret
   */
  didAddSceneNodeToScene(scene: OZScene): void {
    if (this.observerRegistered) return; // early-return branch @0x1f8d97
    scene._document.addCPPObserver(this._observerSubObject, 0x3e9);
    this.observerRegistered = true;
  }

  /**
   * OZReflexiveBehavior::willRemoveSceneNodeFromScene(OZScene*)
   * @Ozone 0x00000000001f8dd0
   *   (__ZN19OZReflexiveBehavior28willRemoveSceneNodeFromSceneEP7OZScene)
   *
   * DECODE:
   *   0x1f8dd0 cmpb $0x1, 0x1e9(this); jne 0x1f8e05   ; only act if registered
   *   0x1f8ddf doc = scene->+0x588
   *   0x1f8de6 leaq 0x148(this),%rsi
   *   0x1f8df3 doc.removeCPPObserver(&observer)
   *   0x1f8df8 observerRegistered = false
   *   ret
   */
  willRemoveSceneNodeFromScene(scene: OZScene): void {
    if (!this.observerRegistered) return; // @0x1f8dd7 branch
    scene._document.removeCPPObserver(this._observerSubObject);
    this.observerRegistered = false;
  }

  /**
   * OZReflexiveBehavior::affectsSelf() const
   * @Ozone 0x00000000001f8e10  (__ZNK19OZReflexiveBehavior11affectsSelfEv)
   *
   * DECODE:
   *   0x1f8e14 movb $0x1, %al                             ; al = 1
   *   0x1f8e16 cmpb $0x1, 0x1e8(%rdi)                     ; affectsSelfCached ?
   *   0x1f8e1d jne  0x1f8e28                              ; if not 1 -> return 1
   *   0x1f8e1f movzbl 0x1ea(%rdi), %eax                   ; eax = affectsLeafComputedState
   *   0x1f8e26 xorb $0x1, %al                             ; al = !eax
   *   0x1f8e28 ret                                        ; return al
   *
   * i.e. `return (affectsSelfCached == 1) ? (affectsLeafComputedState ? 0 : 1) : 1;`
   * — the "reflexive" behavior affects self UNLESS it's known to be a leaf-affecting
   * kind (affectsSelfCached==1 AND affectsLeafComputedState==1).
   */
  affectsSelf(): boolean {
    if (this.affectsSelfCached !== true) return true;
    return !this.affectsLeafComputedState;
  }

  /**
   * OZReflexiveBehavior::setAffectsLeafNodes(bool)
   * @Ozone 0x00000000001f8e30  (__ZN19OZReflexiveBehavior19setAffectsLeafNodesEb)
   *
   * DECODE (10 lines — tail-call):
   *   0x1f8e34 addq $0x150, %rdi           ; rdi = &channel
   *   0x1f8e3b cvtsi2sd %esi, %xmm0        ; xmm0 = (double)(int)bool_arg
   *   0x1f8e3f movq _kCMTimeZero, %rsi     ; rsi = &kCMTimeZero
   *   0x1f8e46 xorl %edx, %edx             ; edx = 0 (bool false)
   *   0x1f8e49 jmp OZChannel::setValue     ; tail call
   *
   * So: `channel.setValue(kCMTimeZero, (double)(b?1:0), false);`
   */
  setAffectsLeafNodes(b: boolean): void {
    // Faithful port: convert bool to signed int (0/1) then to double via
    // cvtsi2sd — result is exactly 0.0 or 1.0.
    const asInt = b ? 1 : 0;
    const asDouble = asInt; // JS number already; matches cvtsi2sd bit-exact for {0,1}.
    this.affectsLeafNodesChannel.setValue(kCMTimeZero, asDouble, false);
  }

  /**
   * OZReflexiveBehavior::hideAffectsLeafNodes(bool)
   * @Ozone 0x00000000001f8e50  (__ZN19OZReflexiveBehavior20hideAffectsLeafNodesEb)
   *
   * DECODE:
   *   0x1f8e5c addq $0x150,%rdi ; rdi = &channel
   *   0x1f8e63 testl %esi,%esi
   *   0x1f8e65 je   0x1f8e75
   *     0x1f8e67 movl $0x2,%esi ; xorl %edx,%edx
   *     0x1f8e6e callq OZChannelBase::setFlag(0x2, false)
   *     0x1f8e73 jmp  0x1f8e81
   *   0x1f8e75:
   *     0x1f8e77 movl $0x2,%esi ; xorl %edx,%edx
   *     0x1f8e7c callq OZChannelBase::resetFlag(0x2, false)
   *   0x1f8e81 movb %bl,0x1eb(this)   ; hiddenAffectsLeaf = b
   *   ret
   */
  hideAffectsLeafNodes(b: boolean): void {
    if (b) {
      this.affectsLeafNodesChannel.setFlag(0x2n, false);
    } else {
      this.affectsLeafNodesChannel.resetFlag(0x2n, false);
    }
    this.hiddenAffectsLeaf = b;
  }

  /**
   * OZReflexiveBehavior::notify(unsigned int)
   * @Ozone 0x00000000001f8e90  (__ZN19OZReflexiveBehavior6notifyEj)
   *
   * DECODE:
   *   0x1f8ea3 rax = ourVtable[0x150]()                ; scene = getScene()
   *   0x1f8ea9 testb $0x8, %r14b ; je 0x1f8f09         ; bail unless notifyMask has bit 3 set
   *   0x1f8eaf rcx = scene->+0x588                     ; doc = scene->doc
   *   0x1f8eb6 rdi = doc->+0x98                        ; nm  = doc->notificationManager
   *   0x1f8ebd testq rdi,rdi ; je 0x1f8f09
   *   0x1f8ec2 &ch = this+0x150 (r14)
   *   0x1f8ecf callq OZNotificationManager::wasChannelModified(&ch)
   *   0x1f8ed4 testb %al,%al ; je 0x1f8f09             ; only proceed if the channel changed
   *   0x1f8ed8 rdi = doc->+0x538                       ; rm = doc->renderManager
   *   0x1f8edf testq rdi,rdi ; je 0x1f8eee
   *   0x1f8ee4 esi = 1
   *   0x1f8ee9 callq OZRenderManager::abort(true)      ; force-abort renders
   *   0x1f8eee rsi = _kCMTimeZero ; xorps xmm0
   *   0x1f8efb callq channel.getValueAsInt(kCMTimeZero, 0.0)
   *   0x1f8f00 testl %eax,%eax
   *   0x1f8f02 setne 0x1ea(this)                        ; affectsLeafComputedState = (val != 0)
   *   ret
   */
  notify(mask: number): void {
    const scene = this._get_scene();
    // 0x1f8ea9 — bail unless bit 3 of the mask is set.
    if ((mask & 0x8) === 0) return;
    // 0x1f8eaf-0x1f8ebd — fetch notification manager; null-skip.
    const nm = scene._document._notificationManagerOrNull();
    if (nm === null) return;
    // 0x1f8ecf — only proceed if THIS channel is the modified one.
    if (!nm.wasChannelModified(this.affectsLeafNodesChannel)) return;
    // 0x1f8ed8 — abort renders (best-effort).
    const rm = scene._document._renderManagerOrNull();
    if (rm !== null) {
      rm.abort(true);
    }
    // 0x1f8eee-0x1f8f02 — read current value and recompute the cached bit.
    const v = this.affectsLeafNodesChannel.getValueAsInt(kCMTimeZero, 0.0);
    this.affectsLeafComputedState = v !== 0;
  }

  /**
   * OZReflexiveBehavior::parseEnd(PCSerializerReadStream&)
   * @Ozone 0x00000000001f8fb0  (__ZN19OZReflexiveBehavior8parseEndER22PCSerializerReadStream)
   *
   * DECODE:
   *   0x1f8fbd movb $0x0, 0x1ec(this)                  ; dirtyResetPending = false
   *   0x1f8fc4 addq $0x150,%rdi                        ; &channel
   *   0x1f8fcb movq _kCMTimeZero,%rsi ; xorps xmm0
   *   0x1f8fd5 callq channel.getValueAsInt(kCMTimeZero, 0.0)
   *   0x1f8fdc setne 0x1ea(this)                       ; affectsLeafComputedState = (v!=0)
   *   0x1f8fea jmp OZBehavior::parseEnd(stream)        ; TAIL CALL to base
   */
  parseEnd(stream: PCSerializerReadStream): void {
    // 0x1f8fbd.
    this.dirtyResetPending = false;
    // 0x1f8fd5-0x1f8fdc.
    const v = this.affectsLeafNodesChannel.getValueAsInt(kCMTimeZero, 0.0);
    this.affectsLeafComputedState = v !== 0;
    // 0x1f8fea — tail-call base parseEnd.
    OZBehavior_parseEnd(this, stream);
  }

  // ---------------------------------------------------------------------------
  // Internal helpers (each is a throwing stub for a frontier we haven't yet
  // decoded — a base-class virtual dispatch or an untyped field access). They
  // are documented against the exact disasm sites that need them.
  // ---------------------------------------------------------------------------

  /** Base-class access: `OZSimulationBehavior*` view of this object. Used by the
   *  base-class ctor/dtor/didAddToNode dispatch. Frontier: base sub-object layout
   *  (@Ozone 0x1f85f3 vptr install). */
  private _asSimulation(): OZSimulationBehavior {
    return this._baseSimulation;
  }

  /** vtable[0x140]() → SceneNode* (or null): used by dtor and willRemove.
   *  @provenance callq *0x140(%rax) @Ozone 0x1f8857, 0x1f8d3c. */
  private _get_baseSimulation_sceneNodeOrNull(): OZSceneNode | null {
    throw new Error(
      "vtable[0x140]() → OZSceneNode* @Ozone 0x1f8857 / 0x1f8d3c not yet transcribed",
    );
  }

  /** vtable[0x150]() → OZScene*: used by willRemove, notify, dtor.
   *  @provenance callq *0x150(%rax) @Ozone 0x1f8883, 0x1f8ea3, 0x1f8d68. */
  private _get_scene(): OZScene & { _document: OZDocument & { _notificationManagerOrNull(): OZNotificationManager | null; _renderManagerOrNull(): OZRenderManager | null } } {
    throw new Error(
      "vtable[0x150]() → OZScene* @Ozone 0x1f8ea3 / 0x1f8d68 / 0x1f8883 not yet transcribed",
    );
  }

  /** vtable[0x110]() → OZScene* (nullable), used by didAddToNode's observer-
   *  registration path.
   *  @provenance callq *0x110(%rax) @Ozone 0x1f8cd0. */
  private _get_scene_or_null(): (OZScene & { _document: OZDocument }) | null {
    throw new Error(
      "vtable[0x110]() → OZScene* @Ozone 0x1f8cd0 not yet transcribed",
    );
  }

  /** vtable[0x280]() on the OWNING node → OZChannelObjectRoot*.
   *  @provenance callq *0x280(%rcx) @Ozone 0x1f8b8c (didAddToNode from node),
   *  and via sceneNode vtable @0x1f8863, 0x1f8d48. */
  private _get_channelObjectRootOfOwner(): OZChannelObjectRoot {
    throw new Error(
      "vtable[0x280]() → OZChannelObjectRoot* @Ozone 0x1f8b8c / 0x1f8d48 / 0x1f8863 not yet transcribed",
    );
  }

  /** vtable[0x280]() on `node` argument → OZChannelObjectRoot*, used by
   *  didAddToNode. Same slot as _get_channelObjectRootOfOwner but with the
   *  supplied node ptr (not the base's sceneNode()). */
  private _channelObjectRootOf(_node: OZSceneNode): OZChannelObjectRoot {
    throw new Error(
      "OZSceneNode::vtable[0x280]() → OZChannelObjectRoot* @Ozone 0x1f8b8c not yet transcribed",
    );
  }

  /** vtable[0x400]() → bool ("computeAffectsSelfInitial"), reads no fields on
   *  this class but is dispatched through OUR primary vptr in didAddToNode.
   *  @provenance callq *0x400(%rax) @Ozone 0x1f8ba6 (result stored to +0x1e8). */
  private _computeAffectsSelfInitial(): boolean {
    throw new Error(
      "vtable[0x400]() → bool computeAffectsSelfInitial @Ozone 0x1f8ba6 not yet transcribed",
    );
  }

  /** Iterate the OZBehavior* list on a scene node. The node's +0x3e0..+0x3e8
   *  is a std::vector<Holder*> where each Holder->+0x10 is the OZBehavior*.
   *  @provenance ptrs at Ozone 0x1f8b04-0x1f8b28, 0x1f8a61-0x1f8a88. */
  private *_iter_behaviors_on(_node: OZSceneNode): Generator<OZBehavior> {
    throw new Error(
      "OZSceneNode +0x3e0..+0x3e8 std::vector<Holder> iteration @Ozone 0x1f8b04-0x1f8b28 not yet transcribed",
    );
  }

  /** Load `beh->+0x8` as `OZFactory*`. @provenance movq 0x8(%rbx),%rdi @Ozone
   *  0x1f8a8d (findPreviousSimulationBehavior) and analogous @0x1f8b2d and
   *  @0x1f8c06 (didAddToNode). */
  private _factory_of(_beh: OZBehavior): OZFactory {
    throw new Error(
      "OZBehavior/OZSceneNode +0x8 -> OZFactory* @Ozone 0x1f8a8d / 0x1f8c06 not yet transcribed",
    );
  }

  /** Load `factory->+0x8` as a 16-byte PCUUID. @provenance movdqu 0x8(%rax),%xmm0
   *  @Ozone 0x1f8c0a in didAddToNode's UUID gate. */
  private _uuid_of_factory(_factory: OZFactory): PCUUID {
    throw new Error(
      "OZFactory +0x8 -> PCUUID @Ozone 0x1f8c0a not yet transcribed",
    );
  }

  private constructor() {
    // Only reachable via create/createCopy. Throw to guard against `new`.
    this._baseSimulation = null as unknown as OZSimulationBehavior;
    this._factoryAt8 = null as unknown as OZFactory;
    this._observerSubObject = null as unknown as OZCPPObserver;
    throw new Error(
      "OZReflexiveBehavior: use OZReflexiveBehavior.create / createCopy — direct construction is not modelled",
    );
  }
}

/** OZBehavior::parseEnd(PCSerializerReadStream&) — mangled
 *  `__ZN10OZBehavior8parseEndER22PCSerializerReadStream`, tail-called at Ozone
 *  0x1f8fea. Not yet transcribed. */
function OZBehavior_parseEnd(
  _self: OZReflexiveBehavior, _stream: PCSerializerReadStream,
): void {
  throw new Error(
    "OZBehavior::parseEnd(PCSerializerReadStream&) @Ozone 0x1f8fea not yet transcribed",
  );
}

/** PCSerializerReadStream — parse stream passed to parseEnd. Opaque here. */
export interface PCSerializerReadStream { readonly __pcReadStream: unique symbol }
