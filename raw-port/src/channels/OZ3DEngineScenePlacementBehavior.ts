// raw-port/src/channels/OZ3DEngineScenePlacementBehavior.ts
//
// FCP `OZ3DEngineScenePlacementBehavior` — an OZBehavior subclass that lets a
// 3D scene element be POSITIONED relative to another scene node (a "look at"
// / "distance from" / "face camera" placement rig). It owns FIVE animatable
// sub-channels and one target reference:
//
//   +0x210  OZChanTransformNodeRef   "Relative To"   (default = 200 / 0xc8)
//   +0x2b0  OZChannelEnum            "Alignment"     ("Left;Center;Right"; tags {1,4,2})
//   +0x3b0  OZChannelDouble          "Distance"      (default 1000.0, slider [-2000, 2000])
//   +0x448  OZChannelBool            "Face Camera"   (default = 0/false)
//   +0x4e0  OZChannelBool            "Fix Y"         (default = 0/false)
//
// Framework: Ozone.  Fat-slice thin slice at /tmp/Ozone.x86_64.
//
// Provenance (every method decoded from otool -tV of the FCP.app binary):
//   raw-port/re/disasm/OZ3DEngineScenePlacementBehavior.OZ3DEngineScenePlacementBehavior.s
//                                                                      @0x3ca230 (C2 primary ctor: OZFactory*, PCString&, uint)
//                                                                      @0x3ca550 (C1 primary ctor: tail-calls C2 @0x3ca555)
//                                                                      @0x3ca560 (C2 copy    ctor: OZ3DEngineScenePlacementBehavior const&, uint)
//                                                                      @0x3ca6e0 (C1 copy    ctor: tail-calls C2 @0x3ca560)
//                                                                      @0x3ca6f0 (D2 dtor)
//                                                                      @0x3ca7c0 (D1 dtor)
//                                                                      @0x3ca7f0 (D0 dtor)
//   raw-port/re/disasm/OZ3DEngineScenePlacementBehavior.didAddToNode.s  @0x3ca8e0
//   raw-port/re/disasm/OZ3DEngineScenePlacementBehavior.distance.s      @0x3ca920
//   raw-port/re/disasm/OZ3DEngineScenePlacementBehavior.alignment.s     @0x3ca940
//   raw-port/re/disasm/OZ3DEngineScenePlacementBehavior.shouldFaceCamera.s @0x3ca960
//   raw-port/re/disasm/OZ3DEngineScenePlacementBehavior.shouldFixY.s    @0x3ca980
//   raw-port/re/disasm/OZ3DEngineScenePlacementBehavior.targetObject.s  @0x3ca9a0 (non-const)
//                                                                      @0x3ca9c0 (const overload)
//   raw-port/re/disasm/OZ3DEngineScenePlacementBehavior.getLockDependencies.s @0x3ca9e0
//   getLockingID (private)                                              @0x3cab90
//   non-virtual thunk to getLockingID (OZLocking subobject at +0x148)   @0x3caba0
//   operator=(OZBehavior const&)                                        @0x3ca870
//
// Vtable installs (from the C2 ctor at 0x3ca266..0x3ca28d — resolved via
// raw-port/army/tools/resolve.py Ozone sym):
//   this[+0x000] = &vtable_for_OZ3DEngineScenePlacementBehavior + 0x010  @0x859180
//   this[+0x010] = &vtable_for_OZ3DEngineScenePlacementBehavior + 0x2a8  @0x859418
//   this[+0x028] = &vtable_for_OZ3DEngineScenePlacementBehavior + 0x500  @0x859670
//   this[+0x148] = &vtable_for_OZ3DEngineScenePlacementBehavior + 0x558  @0x8596c8
//
// FULL STRUCT LAYOUT recovered from the C2 primary ctor (@0x3ca230) —
// every write into `this+K` is a real subobject construction, in this exact order:
//
//   +0x000  OZBehavior base subobject           OZBehavior::OZBehavior(OZFactory*, PCString&, uint)  @0x3ca252
//                                               (also receives vtable slot 0x000 = vt+0x010)
//   +0x010                                      2nd vtable slot (vt+0x2a8)                    @0x3ca277
//   +0x028                                      3rd vtable slot (vt+0x500)                    @0x3ca282
//   +0x140  OZSceneNode*  attachedNode          (set by didAddToNode when the parent
//                                                node dynamic_casts to OZ3DEngineSceneElement) @0x3ca90f
//   +0x148  OZLocking     locking               OZLocking::OZLocking()                        @0x3ca261
//                                               (also receives vtable slot 0x148 = vt+0x558)  @0x3ca28d
//   +0x210  OZChanTransformNodeRef  relativeTo  OZChanTransformNodeRef::ctor(200.0, "Relative To",
//                                               folder=&this+0x30, xxx=0xC8, 0)              @0x3ca2c8
//   +0x2b0  OZChannelEnum  alignment            OZChannelEnum::ctor(count=4, "Left;Center;Right",
//                                               "Alignment", folder=&this+0x30, xxx=0xCA, ...) @0x3ca329
//                                               setTags({1,4,2}, 3)                           @0x3ca452
//   +0x3b0  OZChannelDouble  distance           OZChannelDouble::ctor(1000.0, "Distance",
//                                               folder=&this+0x30, xxx=0xC9, 0, null, null)   @0x3ca380
//                                               setSliderMin(-2000.0)                         @0x3ca41e
//                                               setSliderMax( 2000.0)                         @0x3ca42b
//   +0x448  OZChannelBool   faceCamera          OZChannelBool::ctor(0, "Face Camera",
//                                               folder=&this+0x30, xxx=0xCB, 0, null, null)   @0x3ca3c1
//   +0x4e0  OZChannelBool   fixY                OZChannelBool::ctor(0, "Fix Y",
//                                               folder=&this+0x30, xxx=0xCC, 0, null, null)   @0x3ca402
//
// The "folder" argument to every OZChan* ctor is `&this+0x30` — i.e. the
// OZChannelFolder subobject lives at offset +0x30 inside OZBehavior (constructed
// by OZBehavior::OZBehavior). All FIVE channels register into THAT folder.
//
// Trivial per-time getters (each is a 1-instruction adjust-this + tail-call
// into an OZChannel accessor, xmm0 zeroed as `defaultValue=0.0`):
//   distance(t)          = OZChannel::getValueAsDouble(this+0x3b0, t, 0.0)   @0x3ca920 -> stub @0x6dfa9e
//   alignment(t)         = OZChannel::getValueAsInt   (this+0x2b0, t, 0.0)   @0x3ca940 -> stub @0x6dfa80
//   shouldFaceCamera(t)  = OZChannel::getValueAsInt   (this+0x448, t, 0.0) != 0        @0x3ca960
//   shouldFixY(t)        = OZChannel::getValueAsInt   (this+0x4e0, t, 0.0) != 0        @0x3ca980
//   targetObject()       = OZChanTransformNodeRef::getTransformNode(this+0x210)        @0x3ca9a0
//
// didAddToNode:
//   if (arg != nullptr) {
//     if (dynamic_cast<OZ3DEngineSceneElement*>(static_cast<OZSceneNode*>(arg)) != null)
//       this[+0x140] = arg;
//   }
//   Uses ___dynamic_cast(arg, typeinfo(OZSceneNode), typeinfo(OZ3DEngineSceneElement), 0).
//
// This TS file exports one class-object per FCP class exactly as the other
// channels/OZ*Behavior* precedents (OZSingleChanBehaviorIF etc.).  Every
// undecoded callee (OZBehavior ctor/dtor, OZChannel::getValueAsDouble,
// OZChannelDouble::ctor, OZLocking::OZLocking, OZChanTransformNodeRef::ctor,
// getLockDependencies's std::set red-black-tree body, etc.) is a THROW-STUB
// citing its @0xADDR — the "loud gap" that anti-shortcut demands.

import type { CMTime } from "../infra/CMTime";

// ---------------------------------------------------------------------------
// Struct layout (byte offsets recovered from ctor @0x3ca230)
// ---------------------------------------------------------------------------
export interface OZ3DEngineScenePlacementBehavior {
  // +0x000  OZBehavior subobject (opaque here — owned by OZBehavior class port).
  //         Also stores the class's primary vtable slot pointer at +0x000.
  readonly __vtable_head?: unknown;         // +0x000 (vt+0x010) @0x3ca277
  readonly __vtable_10?:   unknown;         // +0x010 (vt+0x2a8) @0x3ca277
  readonly __vtable_28?:   unknown;         // +0x028 (vt+0x500) @0x3ca282
  // +0x048  int32 lockingID — a field of the OZBehavior base subobject, returned
  //         verbatim by getLockingID() @0x3cab94 `movl 0x48(%rdi), %eax` and by
  //         the OZLocking adjustor thunk @0x3caba4 `movl -0x100(%rdi), %eax`
  //         (entered with %rdi = this + 0x148, so -0x100 lands on this same +0x48).
  //         Same field/offset as the landed sibling OZAlignToBehavior.lockingID
  //         (@Ozone 0x4c5c34), which is also an OZBehavior subclass.
  lockingID: number;                        // +0x048 (int32)
  // +0x030  OZChannelFolder subobject (inside OZBehavior). All 5 channels below
  //         are constructed with `&this+0x30` as their `folder` arg.
  __ozChannelFolder_at_0x30?: unknown;      // +0x030 folder (used by every channel ctor)
  // +0x140  OZSceneNode* attachedNode  (set by didAddToNode @0x3ca90f)
  attachedNode: unknown | null;             // +0x140
  // +0x148  OZLocking subobject (with its own vtable slot at +0x148 = vt+0x558 @0x3ca28d)
  __ozLocking_at_0x148?: unknown;           // +0x148
  // +0x210  OZChanTransformNodeRef "Relative To" (default = 200.0)
  relativeTo: unknown;                      // +0x210 (OZChanTransformNodeRef)
  // +0x2b0  OZChannelEnum "Alignment" ("Left;Center;Right"; tags {1,4,2})
  alignment_channel: unknown;               // +0x2b0 (OZChannelEnum)
  // +0x3b0  OZChannelDouble "Distance" (default 1000.0; slider [-2000, 2000])
  distance_channel: unknown;                // +0x3b0 (OZChannelDouble)
  // +0x448  OZChannelBool "Face Camera" (default false)
  faceCamera_channel: unknown;              // +0x448 (OZChannelBool)
  // +0x4e0  OZChannelBool "Fix Y" (default false)
  fixY_channel: unknown;                    // +0x4e0 (OZChannelBool)
}

// ---------------------------------------------------------------------------
// Undecoded upstream/downstream API — stubs that THROW citing their @0xADDR.
// These are all callees of the ctor / dtors / getters that this class dispatches
// into; when a later worker ports OZChannel / OZBehavior / OZLocking /
// OZChanTransformNodeRef, they will replace the corresponding stub. Until then,
// wiring this behavior for real evaluation would surface a loud runtime error
// (which is the correct answer per raw-port/army/ANTI_SHORTCUT.md).
// ---------------------------------------------------------------------------

/** OZChannel::getValueAsDouble(CMTime const&, double) const  — Ozone stub @0x6dfa9e
 *  Called from OZ3DEngineScenePlacementBehavior::distance @0x3ca92f (jmp). */
function OZChannel__getValueAsDouble_stub(_ch: unknown, _t: CMTime, _def: number): number {
  throw new Error("OZChannel::getValueAsDouble @0x6dfa9e not yet transcribed (called from OZ3DEngineScenePlacementBehavior::distance @0x3ca92f)");
}

/** OZChannel::getValueAsInt(CMTime const&, double) const  — Ozone stub @0x6dfa80
 *  Called from alignment @0x3ca94f (jmp), shouldFaceCamera @0x3ca96e (call),
 *  shouldFixY @0x3ca98e (call). */
function OZChannel__getValueAsInt_stub(_ch: unknown, _t: CMTime, _def: number): number {
  throw new Error("OZChannel::getValueAsInt @0x6dfa80 not yet transcribed (called from OZ3DEngineScenePlacementBehavior::alignment @0x3ca94f / shouldFaceCamera @0x3ca96e / shouldFixY @0x3ca98e)");
}

/** OZChanTransformNodeRef::getTransformNode()  — Ozone (direct link, no stub table)
 *  Called from OZ3DEngineScenePlacementBehavior::targetObject @0x3ca9ac (jmp). */
function OZChanTransformNodeRef__getTransformNode_stub(_ref: unknown): unknown {
  throw new Error("OZChanTransformNodeRef::getTransformNode not yet transcribed (called from OZ3DEngineScenePlacementBehavior::targetObject @0x3ca9ac)");
}

/** ___dynamic_cast(from, fromTypeInfo, toTypeInfo, hint)  — libc++abi (system).
 *  Used by didAddToNode @0x3ca905 to test OZSceneNode -> OZ3DEngineSceneElement. */
function dynamic_cast_stub(
  _from: unknown, _fromTI: unknown, _toTI: unknown, _hint: number,
): unknown | null {
  // System ABI, not FCP code. A real TS port would call `instanceof` against
  // the ported OZ3DEngineSceneElement class. Since neither OZSceneNode nor
  // OZ3DEngineSceneElement is decoded yet, this must throw (call site @0x3ca905).
  throw new Error("___dynamic_cast @libc++abi not applicable in TS; called from OZ3DEngineScenePlacementBehavior::didAddToNode @0x3ca905 for OZSceneNode->OZ3DEngineSceneElement (needs ported OZ3DEngineSceneElement class)");
}

// ---------------------------------------------------------------------------
// OZ3DEngineScenePlacementBehavior::distance(CMTime const&) const   @0x3ca920
// ---------------------------------------------------------------------------
// Body (mirrored line-for-line from raw-port/re/disasm/…):
//   addq   $0x3b0, %rdi                 ; %rdi = this + 0x3B0 (distance_channel)
//   xorps  %xmm0, %xmm0                 ; %xmm0 = 0.0  (defaultValue arg)
//   jmp    stub OZChannel::getValueAsDouble
export function OZ3DEngineScenePlacementBehavior_distance(
  self: OZ3DEngineScenePlacementBehavior,
  t: CMTime,
): number {
  // this + 0x3b0 = distance_channel; defaultValue = 0.0
  return OZChannel__getValueAsDouble_stub(self.distance_channel, t, 0.0); // @0x3ca92f
}

// ---------------------------------------------------------------------------
// OZ3DEngineScenePlacementBehavior::alignment(CMTime const&) const  @0x3ca940
// ---------------------------------------------------------------------------
// Body:
//   addq   $0x2b0, %rdi                 ; %rdi = this + 0x2B0 (alignment_channel)
//   xorps  %xmm0, %xmm0                 ; %xmm0 = 0.0  (defaultValue arg to getValueAsInt(t, d))
//   jmp    stub OZChannel::getValueAsInt
// The signature of getValueAsInt is (CMTime const&, double) const -> int.
export function OZ3DEngineScenePlacementBehavior_alignment(
  self: OZ3DEngineScenePlacementBehavior,
  t: CMTime,
): number {
  return OZChannel__getValueAsInt_stub(self.alignment_channel, t, 0.0); // @0x3ca94f
}

// ---------------------------------------------------------------------------
// OZ3DEngineScenePlacementBehavior::shouldFaceCamera(CMTime const&) const  @0x3ca960
// ---------------------------------------------------------------------------
// Body:
//   addq   $0x448, %rdi                 ; %rdi = this + 0x448 (faceCamera_channel)
//   xorps  %xmm0, %xmm0                 ; %xmm0 = 0.0
//   callq  stub OZChannel::getValueAsInt          ; %eax = int
//   testl  %eax, %eax                             ; ZF = (eax == 0)
//   setne  %al                                    ; %al = (eax != 0)
//   ret                                            ; return bool
export function OZ3DEngineScenePlacementBehavior_shouldFaceCamera(
  self: OZ3DEngineScenePlacementBehavior,
  t: CMTime,
): boolean {
  const v = OZChannel__getValueAsInt_stub(self.faceCamera_channel, t, 0.0); // @0x3ca96e
  return v !== 0;
}

// ---------------------------------------------------------------------------
// OZ3DEngineScenePlacementBehavior::shouldFixY(CMTime const&) const  @0x3ca980
// ---------------------------------------------------------------------------
// Body: same shape as shouldFaceCamera but reads channel at +0x4e0.
export function OZ3DEngineScenePlacementBehavior_shouldFixY(
  self: OZ3DEngineScenePlacementBehavior,
  t: CMTime,
): boolean {
  const v = OZChannel__getValueAsInt_stub(self.fixY_channel, t, 0.0); // @0x3ca98e
  return v !== 0;
}

// ---------------------------------------------------------------------------
// OZ3DEngineScenePlacementBehavior::targetObject()   @0x3ca9a0  (non-const)
// OZ3DEngineScenePlacementBehavior::targetObject() const  @0x3ca9c0  (const overload; same body)
// ---------------------------------------------------------------------------
// Body:
//   addq   $0x210, %rdi                 ; %rdi = this + 0x210 (relativeTo: OZChanTransformNodeRef)
//   jmp    OZChanTransformNodeRef::getTransformNode
// Returns whatever getTransformNode returns (pointer to the referenced scene node,
// or nullptr if unresolved).
export function OZ3DEngineScenePlacementBehavior_targetObject(
  self: OZ3DEngineScenePlacementBehavior,
): unknown {
  return OZChanTransformNodeRef__getTransformNode_stub(self.relativeTo); // @0x3ca9ac
}

// ---------------------------------------------------------------------------
// OZ3DEngineScenePlacementBehavior::didAddToNode(OZSceneNode*)  @0x3ca8e0
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
export function OZ3DEngineScenePlacementBehavior_didAddToNode(
  self: OZ3DEngineScenePlacementBehavior,
  node: unknown | null,
): void {
  if (node == null) return;                                       // @0x3ca8e3 je
  // dynamic_cast<OZ3DEngineSceneElement*>(node)
  const asElem = dynamic_cast_stub(
    node, /* fromTI */ null, /* toTI */ null, /* hint */ 0,       // @0x3ca905
  );
  if (asElem == null) return;                                     // @0x3ca90d je
  self.attachedNode = node;                                       // @0x3ca90f
}

// ---------------------------------------------------------------------------
// OZ3DEngineScenePlacementBehavior::getLockDependencies(
//     OZLocking*, PCDirectedGraph<OZLocking*>*, std::set<OZLocking*>*)  @0x3ca9e0
// ---------------------------------------------------------------------------
// Body (126 lines of assembly) is a std::set<OZLocking*> red-black-tree insert
// of `this + 0x148` (this class's OZLocking subobject) into the visited set,
// followed by graph-edge bookkeeping into the PCDirectedGraph. Neither
// std::set nor PCDirectedGraph<OZLocking*> is yet transcribed in this port,
// and the OZLocking base class is itself unported, so a faithful transcription
// would be inventing a std::_Tree walk from scratch — exactly the "invent-a-
// helper" anti-pattern the spec bans. Stub it and defer to the OZLocking
// worker.
export function OZ3DEngineScenePlacementBehavior_getLockDependencies(
  _self: OZ3DEngineScenePlacementBehavior,
  _selfLocking: unknown,     // OZLocking* — the caller's own locking (== &_self + 0x148)
  _graph: unknown,           // PCDirectedGraph<OZLocking*>*
  _visited: unknown,         // std::set<OZLocking*>*
): void {
  throw new Error("OZ3DEngineScenePlacementBehavior::getLockDependencies @0x3ca9e0 not yet transcribed (needs OZLocking @Ozone + std::set<OZLocking*>::insert @libcxx + PCDirectedGraph<OZLocking*>::addNode transcription; body is a 126-line red-black-tree insert of this+0x148)");
}

// ---------------------------------------------------------------------------
// OZ3DEngineScenePlacementBehavior::getLockingID() const   @0x3cab90  (private)
// ---------------------------------------------------------------------------
// Full body (raw-port/re/disasm/__ZNK32OZ3DEngineScenePlacementBehavior12getLockingIDEv.s):
//   00000000003cab90  pushq %rbp
//   00000000003cab91  movq  %rsp, %rbp
//   00000000003cab94  movl  0x48(%rdi), %eax     ; return *(int32*)(this + 0x48)
//   00000000003cab97  popq  %rbp
//   00000000003cab98  retq
// Five instructions, no callee, no branch: it returns the int32 at this+0x48.
// Precedent for the same field at the same offset in a sibling OZBehavior
// subclass: OZAlignToBehavior.getLockingID @Ozone 0x4c5c34 (`movl 0x48(%rdi),%eax`),
// landed in raw-port/src/channels/OZAlignToBehavior.ts.
export function OZ3DEngineScenePlacementBehavior_getLockingID(
  self: OZ3DEngineScenePlacementBehavior,
): number {
  return self.lockingID; // @0x3cab94  movl 0x48(%rdi), %eax
}

// ---------------------------------------------------------------------------
// non-virtual thunk to OZ3DEngineScenePlacementBehavior::getLockingID() const
//   __ZThn328_NK32OZ3DEngineScenePlacementBehavior12getLockingIDEv   @0x3caba0
// ---------------------------------------------------------------------------
// Full body (raw-port/re/disasm/__ZThn328_NK32OZ3DEngineScenePlacementBehavior12getLockingIDEv.s):
//   00000000003caba0  pushq %rbp
//   00000000003caba1  movq  %rsp, %rbp
//   00000000003caba4  movl  -0x100(%rdi), %eax   ; return *(int32*)(this - 0x100)
//   00000000003cabaa  popq  %rbp
//   00000000003cabab  retq
// This is the NON-VIRTUAL ADJUSTOR THUNK (Itanium `_ZThn328_`) installed in the
// secondary vtable of the OZLocking subobject, which the ctor constructs at
// this+0x148 (= 328 decimal, @0x3ca261, vtable slot @0x3ca28d — see file header).
// It is entered with %rdi pointing at that OZLocking subobject, i.e.
// %rdi == (OZ3DEngineScenePlacementBehavior*)this + 0x148, so the load at
// -0x100(%rdi) reads this + 0x148 - 0x100 = this + 0x48 — EXACTLY the field the
// primary getLockingID @0x3cab94 returns. The thunk does not re-dispatch (the
// adjustment is folded into the single load), so the transcription is the
// pointer adjustment followed by the same read.
export function OZ3DEngineScenePlacementBehavior_getLockingID__Thn328(
  selfLocking: OZ3DEngineScenePlacementBehavior, // OZLocking* == &self + 0x148
): number {
  // %rdi is the +0x148 OZLocking subobject; -0x100 from it is the owner's +0x48.
  const self = selfLocking; // the OZLocking subobject's owner (thunk's this-adjust of -0x148)
  return self.lockingID; // @0x3caba4  movl -0x100(%rdi), %eax  == owner + 0x48
}

// ---------------------------------------------------------------------------
// Constructors / destructors / operator=  — undecoded plumbing.
// The primary ctor @0x3ca230 constructs the OZBehavior base, the OZLocking
// subobject at +0x148, and 5 sub-channels at fixed offsets — all through
// stubs that this port hasn't landed. Faithfully transcribing the ctor body
// requires OZBehavior::OZBehavior, OZLocking::OZLocking, OZChanTransformNodeRef::
// OZChanTransformNodeRef, OZChannelEnum::OZChannelEnum, OZChannelDouble::
// OZChannelDouble, OZChannelBool::OZChannelBool (all not yet ported), so the
// stub is the correct answer here.
export function OZ3DEngineScenePlacementBehavior_ctor(
  _self: OZ3DEngineScenePlacementBehavior,
  _factory: unknown,        // OZFactory*
  _name: unknown,           // PCString const&
  _flags: number,           // unsigned int
): void {
  // The recovered ctor body constructs (in order):
  //   OZBehavior::OZBehavior(factory, name, flags)                        @0x3ca252
  //   OZLocking::OZLocking()                              on this+0x148   @0x3ca261
  //   vtable installs at +0x000, +0x010, +0x028, +0x148  (see file header)
  //   OZChanTransformNodeRef::ctor(200.0, "Relative To", &this+0x30, 0xC8, 0)  on this+0x210  @0x3ca2c8
  //   OZChannelEnum::ctor(4, "Left;Center;Right", "Alignment", &this+0x30, 0xCA, 0, null, null)  on this+0x2b0  @0x3ca329
  //     -> setTags({1, 4, 2}, 3)                                          @0x3ca452
  //   OZChannelDouble::ctor(1000.0, "Distance", &this+0x30, 0xC9, 0, null, null)  on this+0x3b0  @0x3ca380
  //     -> setSliderMin(-2000.0)                                          @0x3ca41e
  //     -> setSliderMax( 2000.0)                                          @0x3ca42b
  //   OZChannelBool::ctor(0, "Face Camera", &this+0x30, 0xCB, 0, null, null)     on this+0x448  @0x3ca3c1
  //   OZChannelBool::ctor(0, "Fix Y",       &this+0x30, 0xCC, 0, null, null)     on this+0x4e0  @0x3ca402
  throw new Error("OZ3DEngineScenePlacementBehavior::ctor @0x3ca230 not yet transcribed (needs OZBehavior::ctor + OZLocking::ctor + OZChanTransformNodeRef::ctor + OZChannelEnum::ctor + OZChannelDouble::ctor + OZChannelBool::ctor — none of the base classes are ported yet)");
}

export function OZ3DEngineScenePlacementBehavior_copyCtor(
  _self: OZ3DEngineScenePlacementBehavior,
  _other: OZ3DEngineScenePlacementBehavior,
  _flags: number,
): void {
  // Copy ctor body @0x3ca560 mirrors the primary ctor's subobject construction
  // but calls each channel's copy-ctor from the corresponding offset in `other`.
  // Special vtable-repair at +0x3b0 (writes &OZChannelDouble vtable+0x10 and
  // vtable+0x370 back into the freshly-copied distance channel @0x3ca614..0x3ca62c —
  // restoring the concrete OZChannelDouble vtable that OZChannel::OZChannel(
  // OZChannel const&, ...) would have overwritten with its own base vtable).
  throw new Error("OZ3DEngineScenePlacementBehavior::copyCtor @0x3ca560 not yet transcribed (needs OZBehavior copy-ctor + OZLocking ctor + each OZChan* copy-ctor)");
}

export function OZ3DEngineScenePlacementBehavior_dtor(
  _self: OZ3DEngineScenePlacementBehavior,
): void {
  // D2 @0x3ca6f0 / D1 @0x3ca7c0 / D0 @0x3ca7f0 chain through OZChannelBool::~,
  // OZChannel::~, OZChannelEnum::~, OZChanTransformNodeRef::~, OZLocking::~,
  // OZBehavior::~ in reverse-construction order.
  throw new Error("OZ3DEngineScenePlacementBehavior::~ @0x3ca6f0 (D2) / @0x3ca7c0 (D1) / @0x3ca7f0 (D0) not yet transcribed (chains through OZChannelBool::~, OZChannel::~, OZChannelEnum::~, OZChanTransformNodeRef::~, OZLocking::~, OZBehavior::~)");
}

export function OZ3DEngineScenePlacementBehavior_assign(
  _self: OZ3DEngineScenePlacementBehavior,
  _other: unknown,          // OZBehavior const&
): OZ3DEngineScenePlacementBehavior {
  throw new Error("OZ3DEngineScenePlacementBehavior::operator=(OZBehavior const&) @0x3ca870 not yet transcribed");
}

// ---------------------------------------------------------------------------
// Aggregate class handle — matches the OZSingleChanBehaviorIF pattern of a
// single named export bundling every ported method. Consumers can dispatch
// through this map, and the ledger tracker sees the class name.
// ---------------------------------------------------------------------------
export const OZ3DEngineScenePlacementBehavior_methods = {
  distance:          OZ3DEngineScenePlacementBehavior_distance,           // @0x3ca920
  alignment:         OZ3DEngineScenePlacementBehavior_alignment,          // @0x3ca940
  shouldFaceCamera:  OZ3DEngineScenePlacementBehavior_shouldFaceCamera,   // @0x3ca960
  shouldFixY:        OZ3DEngineScenePlacementBehavior_shouldFixY,         // @0x3ca980
  targetObject:      OZ3DEngineScenePlacementBehavior_targetObject,       // @0x3ca9a0 / @0x3ca9c0
  didAddToNode:      OZ3DEngineScenePlacementBehavior_didAddToNode,       // @0x3ca8e0
  getLockDependencies: OZ3DEngineScenePlacementBehavior_getLockDependencies, // @0x3ca9e0
  getLockingID:      OZ3DEngineScenePlacementBehavior_getLockingID,       // @0x3cab90
  ctor:              OZ3DEngineScenePlacementBehavior_ctor,               // @0x3ca230 / @0x3ca550
  copyCtor:          OZ3DEngineScenePlacementBehavior_copyCtor,           // @0x3ca560 / @0x3ca6e0
  dtor:              OZ3DEngineScenePlacementBehavior_dtor,               // @0x3ca6f0 / @0x3ca7c0 / @0x3ca7f0
  assign:            OZ3DEngineScenePlacementBehavior_assign,             // @0x3ca870
} as const;

