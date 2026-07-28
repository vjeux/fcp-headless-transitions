// OZChannelSceneNode.ts — Ozone OZChannelObjectRoot subclass that holds an
// OZSceneNode* at object offset 0x100 and forwards a small dispatch surface
// (compare/clone/reset/channelValueWillBeSet/setTimeOffset) into that node
// and the surrounding channel graph.  Faithful transcription of the x86_64
// disassembly from Ozone.framework.
//
// Source (Ozone.framework, x86_64 slice):
//   __ZN18OZChannelSceneNodeC2EP9OZFactoryRK8PCStringP15OZChannelFolderjj  @0x00213860
//   __ZN18OZChannelSceneNodeC1EP9OZFactoryRK8PCStringP15OZChannelFolderjj  @0x002138a0
//   __ZN18OZChannelSceneNodeC2ERK8PCStringP15OZChannelFolderjj             @0x002138e0
//   __ZN18OZChannelSceneNodeC1ERK8PCStringP15OZChannelFolderjj             @0x00213980
//   __ZN18OZChannelSceneNodeC2EP9OZFactoryRK8PCStringj                     @0x00213a20
//   __ZN18OZChannelSceneNodeC1EP9OZFactoryRK8PCStringj                     @0x00213a60
//   __ZN18OZChannelSceneNodeC2ERKS_P15OZChannelFolder                      @0x00213aa0
//   __ZN18OZChannelSceneNodeC1ERKS_P15OZChannelFolder                      @0x00213ae0
//   __ZN18OZChannelSceneNodeD2Ev                                           @0x00213b20
//   __ZN18OZChannelSceneNodeD1Ev                                           @0x00213b30
//   __ZThn16_N18OZChannelSceneNodeD1Ev                                     @0x00213b40  (thunk-16)
//   __ZN18OZChannelSceneNodeD0Ev                                           @0x00213b50
//   __ZThn16_N18OZChannelSceneNodeD0Ev                                     @0x00213b70  (thunk-16)
//   __ZN18OZChannelSceneNodeaSERKS_                                        @0x00213ba0
//   __ZNK18OZChannelSceneNode5cloneEv                                      @0x00213bc0
//   __ZN18OZChannelSceneNode7compareEPK13OZChannelBase                     @0x00213c20
//   __ZN18OZChannelSceneNode21channelValueWillBeSetEP9OZChannelRK6CMTimed  @0x00213c80
//   __ZN18OZChannelSceneNode5resetEb                                       @0x00213cd0
//   __ZN18OZChannelSceneNode12setSceneNodeEP11OZSceneNode                  @0x00213d50
//   __ZN18OZChannelSceneNode20getSceneNodeFromChanEP13OZChannelBase        @0x00213d70
//   __ZN18OZChannelSceneNode13setTimeOffsetERK6CMTimeb                     @0x00213de0
//
// vtable pointer installs (RIP-relative leas + 7-byte fixups from the
// respective ctors — decoded via `leaq disp(%rip), %rax ; movq %rax, off(%rbx)`):
//   C2 (Factory,Str,Folder,uint,uint) @0x21386e -> primary vtable payload
//                                                @ 0x21386e + 7 + 0x633fab = 0x847820
//   C2 (Factory,Str,Folder,uint,uint) @0x213878 -> secondary vtable payload
//                                                @ 0x213878 + 7 + 0x634341 = 0x847bc0
//   Each of the other 7 ctors installs a DIFFERENT pair of vtable pointers
//   (see the per-method comments) — this is Itanium's per-signature
//   construction-vtable machinery for a class that carries a secondary
//   base subobject at offset 0x10 (hence the ThnT16_ D1/D0 thunks).
//
// FIELD OFFSETS observed:
//   0x000  vptr[primary]   — installed by each ctor (see per-ctor comments)
//   0x010  vptr[secondary] — installed by each ctor (secondary base subobject)
//   0x030  parent link     — read by getSceneNodeFromChan @0x213db5 (walked
//                           via `movq 0x30(%r14), %r14` until null): the
//                           inherited OZChannelBase "parent" pointer.
//   0x0d0  OZSceneNode+0x10 fast-pointer  — mirror of the sceneNode's own
//                           +0x10 (kept in sync with 0x100 by setSceneNode).
//                           Written as `sceneNode ? sceneNode+0x10 : 0`.
//   0x100  OZSceneNode*    — the primary scene-node pointer this channel
//                           owns (nulled in ctors, set by setSceneNode,
//                           read by every dispatch method).
//   0x108  end-of-object   — total size 0x108 bytes (clone: `movl $0x108,%edi`).
//
// vtable slot offsets referenced by dispatch methods (all read via
// `movq (%rdi), %rax ; callq *SLOT(%rax)`):
//   +0x130  channelValueWillBeSet inner dispatch      @0x213cb7
//   +0x140  virtual "get channel time offset" copy    @0x213e00
//   +0x120  reset(bool) on nested OZChannel subobjects @0x213cfb/0x213d19/0x213d42
//   +0x4a0  post-time-offset notification hook        @0x213e64
//   +0x100  operator= virtual dispatch                @0x213bae
//
// UNDECODED FRONTIERS cited by throwing stubs:
//   OZChannelObjectRoot::OZChannelObjectRoot() [4 signatures],
//   OZChannelObjectRoot::~OZChannelObjectRoot(),
//   OZChannelObjectRootBase::setTimeOffset(CMTime, bool),
//   OZChannelFolder::compare(OZChannelBase const*) const,
//   __dynamic_cast, __Znwm/__ZdlPv (operator new/delete),
//   OZChannelSceneNode_Factory::_instanceOnce/getInstance/_instance,
//   the vtable slots at +0x120/+0x130/+0x140/+0x4a0/+0x100 on the various
//   nested OZChannel subobjects at +0x138 / +0x338 / +0x1b8 of the sceneNode
//   (all sit inside undecoded classes) — CMTimeCompare (system framework).

/* eslint-disable @typescript-eslint/no-unused-vars */

// ---------------------------------------------------------------------------
// Undecoded frontier stubs (each throws, each cites the @0xADDR that reaches
// it — provenance-gate P4 requirement).
// ---------------------------------------------------------------------------

/**
 * OZChannelObjectRoot::OZChannelObjectRoot(OZFactory*, PCString const&,
 *                                          OZChannelFolder*, uint, uint)
 * — undecoded frontier.
 * Called from C2 @0x213869 and C1 @0x2138a9, and (after the once_flag chain)
 * from C2 @0x21394a and C1 @0x2139ea.
 */
function OZChannelObjectRoot_ctor_FactStrFldrUU(_self: object): void {
  throw new Error(
    'OZChannelObjectRoot::OZChannelObjectRoot(OZFactory*,PCString&,' +
    'OZChannelFolder*,uint,uint) not yet transcribed ' +
    '(called from OZChannelSceneNode C2 @Ozone 0x213869, ' +
    'C1 @Ozone 0x2138a9, C2 @Ozone 0x21394a, C1 @Ozone 0x2139ea)'
  );
}

/**
 * OZChannelObjectRoot::OZChannelObjectRoot(OZFactory*, PCString const&, uint)
 * — undecoded frontier.
 * Called from C2 @0x213a29 and C1 @0x213a69.
 */
function OZChannelObjectRoot_ctor_FactStrU(_self: object): void {
  throw new Error(
    'OZChannelObjectRoot::OZChannelObjectRoot(OZFactory*,PCString&,uint) ' +
    'not yet transcribed ' +
    '(called from OZChannelSceneNode C2 @Ozone 0x213a29, ' +
    'C1 @Ozone 0x213a69)'
  );
}

/**
 * OZChannelObjectRoot::OZChannelObjectRoot(OZChannelObjectRoot const&,
 *                                          OZChannelFolder*)
 * — undecoded frontier.
 * Called from C2 @0x213aa9, C1 @0x213ae9 and clone @0x213bdf.
 */
function OZChannelObjectRoot_copy_ctor(_self: object): void {
  throw new Error(
    'OZChannelObjectRoot::OZChannelObjectRoot(OZChannelObjectRoot const&,' +
    'OZChannelFolder*) not yet transcribed ' +
    '(called from OZChannelSceneNode C2 @Ozone 0x213aa9, ' +
    'C1 @Ozone 0x213ae9, clone @Ozone 0x213bdf)'
  );
}

/**
 * OZChannelObjectRoot::~OZChannelObjectRoot() — undecoded frontier.
 * Tail-jumped from D2 @0x213b25 / D1 @0x213b35 / thunk-D1 @0x213b49; called
 * from D0 @0x213b59 / thunk-D0 @0x213b80.
 */
function OZChannelObjectRoot_dtor(_self: object): void {
  throw new Error(
    'OZChannelObjectRoot::~OZChannelObjectRoot() not yet transcribed ' +
    '(reached from OZChannelSceneNode D2 @Ozone 0x213b25, ' +
    'D1 @Ozone 0x213b35, thunk-D1 @Ozone 0x213b49, ' +
    'D0 @Ozone 0x213b59, thunk-D0 @Ozone 0x213b80)'
  );
}

/**
 * OZChannelObjectRootBase::setTimeOffset(CMTime const&, bool)
 * — undecoded frontier.
 * Called from OZChannelSceneNode::setTimeOffset @0x213e0f (base-class hop
 * that runs BEFORE the "did the time actually change?" post-notify).
 */
function OZChannelObjectRootBase_setTimeOffset(
  _self: object,
  _t: CMTime,
  _flag: boolean,
): void {
  throw new Error(
    'OZChannelObjectRootBase::setTimeOffset(CMTime,bool) not yet transcribed ' +
    '(called from OZChannelSceneNode::setTimeOffset @Ozone 0x213e0f)'
  );
}

/**
 * OZChannelFolder::compare(OZChannelBase const*) const — undecoded frontier.
 * Called from OZChannelSceneNode::compare @0x213c67 as the FINAL step (after
 * the sceneNode-pointer equality check @0x213c58 passes and both objects
 * survive the dynamic_cast @0x213c47).
 */
function OZChannelFolder_compare(_self: object, _other: object): number {
  throw new Error(
    'OZChannelFolder::compare(OZChannelBase const*) const not yet transcribed ' +
    '(called from OZChannelSceneNode::compare @Ozone 0x213c67)'
  );
}

/**
 * `__dynamic_cast` (Itanium ABI) — undecoded frontier.
 * Called from compare @0x213c47 and getSceneNodeFromChan @0x213dab.  We
 * cannot reproduce the full C++ RTTI cast semantics here without porting
 * the full RTTI graph; the two consumers throw when they reach this stub
 * so the failure is loud and localised.
 */
function itanium_dynamic_cast(
  _src: object | null,
  _srcTI: object,
  _dstTI: object,
  _hint: number,
): object | null {
  throw new Error(
    '__dynamic_cast not yet transcribed ' +
    '(called from OZChannelSceneNode::compare @Ozone 0x213c47, ' +
    'getSceneNodeFromChan @Ozone 0x213dab)'
  );
}

/**
 * `operator new(size_t)` — undecoded frontier.
 * Called from clone @0x213bcf to allocate a 0x108-byte object.
 */
function op_new(_sz: number): OZChannelSceneNode {
  throw new Error(
    'operator new (0x108 bytes) not yet transcribed ' +
    '(called from OZChannelSceneNode::clone @Ozone 0x213bcf)'
  );
}

/**
 * `operator delete(void*)` — undecoded frontier.
 * Tail-jumped from D0 @0x213b67 and thunk-D0 @0x213b8e; also from the
 * clone's unwind cleanup @0x213c12.
 */
function op_delete(_p: object): void {
  throw new Error(
    'operator delete not yet transcribed ' +
    '(reached from OZChannelSceneNode D0 @Ozone 0x213b67, ' +
    'thunk-D0 @Ozone 0x213b8e, clone unwind @Ozone 0x213c12)'
  );
}

/**
 * `CMTimeCompare(CMTime, CMTime)` — CoreMedia system framework, not part
 * of the Ozone binary.  Called from setTimeOffset @0x213e51 to detect
 * whether the newly-installed offset actually differs from the value
 * cached at BP-38 via the earlier virtual "get time" call @0x213e00.
 */
function CMTimeCompare(_a: CMTime, _b: CMTime): number {
  throw new Error(
    'CMTimeCompare not yet transcribed ' +
    '(called from OZChannelSceneNode::setTimeOffset @Ozone 0x213e51)'
  );
}

/**
 * Once-token / call_once machinery for the OZChannelSceneNode_Factory
 * singleton.  The C2/C1 (PCString&,Folder*,uint,uint) pair inline the
 * standard std::__1::__call_once dance BEFORE the base ctor is called
 * so that `OZChannelSceneNode_Factory::_instance` is guaranteed to be
 * non-null when it is loaded @0x213934 / 0x2139d4 and passed as `%rsi`
 * (i.e. as the "OZFactory*" argument of the base ctor).
 *
 * We surface this as a single "load the factory singleton" stub — the
 * factory implementation itself is undecoded, so its consumers throw.
 */
function OZChannelSceneNode_Factory_instance(): object {
  throw new Error(
    'OZChannelSceneNode_Factory::getInstance() not yet transcribed ' +
    '(consumed by OZChannelSceneNode C2 (Str,Folder,uint,uint) @Ozone 0x213934, ' +
    'C1 (Str,Folder,uint,uint) @Ozone 0x2139d4)'
  );
}

// ---------------------------------------------------------------------------
// vtable-slot dispatch stubs.  Each throws — the sceneNode's inner subobject
// vtables are undecoded; but the slot offset + the address of the callq is
// fully captured for the eventual decoded impl to snap into place.
// ---------------------------------------------------------------------------

/**
 * Nested OZChannel-subobject "reset(bool)" virtual (vtable slot +0x120).
 * The three reset call sites @0x213cfb (base=+0x138), @0x213d19
 * (base=+0x338), @0x213d42 (base=+0x1b8) all end at this stub; the
 * base offset is captured by the caller and encoded here as `channelBase`.
 */
function nestedReset_120(_channelBase: object, _flag: boolean): void {
  throw new Error(
    'Nested OZChannel::reset(bool) [vtable +0x120] not yet transcribed ' +
    '(called from OZChannelSceneNode::reset ' +
    '@Ozone 0x213cfb (nested @+0x138), ' +
    '@Ozone 0x213d19 (nested @+0x338), ' +
    '@Ozone 0x213d42 (nested @+0x1b8, tail-jmp))'
  );
}

/**
 * Nested "channelValueWillBeSet(OZChannel*, CMTime const&, double)"
 * virtual (vtable slot +0x130).  Called from
 * OZChannelSceneNode::channelValueWillBeSet @0x213cb7 with the sceneNode
 * pointer at +0x100 as `this`, the incoming OZChannel* and value copied
 * onto the outgoing argument frame, and a stack-copied CMTime.
 */
function nestedChannelValueWillBeSet_130(
  _sceneNode: object,
  _chan: object | null,
  _time: CMTime,
  _value: number,
): void {
  throw new Error(
    'sceneNode->channelValueWillBeSet(...) [vtable +0x130] not yet transcribed ' +
    '(called from OZChannelSceneNode::channelValueWillBeSet @Ozone 0x213cb7)'
  );
}

/**
 * "current time offset" copy-out virtual (vtable slot +0x140).  Called
 * from OZChannelSceneNode::setTimeOffset @0x213e00 to STORE the pre-change
 * offset into a stack slot (`leaq -0x48(%rbp),%rdi`) so it can be compared
 * against the post-change offset via CMTimeCompare @0x213e51.
 */
function selfGetTimeOffset_140(
  _self: OZChannelSceneNode,
  _outSlot: { value: CMTime },
): void {
  throw new Error(
    'OZChannelSceneNode->[vtable +0x140] (getTimeOffset copy-out) not yet ' +
    'transcribed (called from OZChannelSceneNode::setTimeOffset @Ozone 0x213e00)'
  );
}

/**
 * Post-time-change notification hook on the sceneNode's own vtable
 * (slot +0x4a0), invoked only when CMTimeCompare @0x213e51 reports the
 * offset actually changed.
 */
function sceneNodePostTimeChange_4a0(_sceneNode: object): void {
  throw new Error(
    'sceneNode->[vtable +0x4a0] (post-time-change notify) not yet transcribed ' +
    '(called from OZChannelSceneNode::setTimeOffset @Ozone 0x213e64)'
  );
}

/**
 * Own-vtable virtual "operator=" dispatch (slot +0x100).  operator= just
 * loads `this->vtable`, loads the pointer at slot +0x100 of that vtable,
 * and tail-jumps into it — a classic Itanium virtual-assignment forward.
 */
function selfOperatorEq_100_dispatch(
  _self: OZChannelSceneNode,
  _rhs: OZChannelSceneNode,
): OZChannelSceneNode {
  throw new Error(
    'OZChannelSceneNode::operator= vtable slot +0x100 not yet transcribed ' +
    '(tail-jumped from OZChannelSceneNode::operator= @Ozone 0x213baf)'
  );
}

// ---------------------------------------------------------------------------
// Small POD contracts consumed by this class.
// ---------------------------------------------------------------------------

/** CoreMedia CMTime (system framework). */
export interface CMTime {
  /** +0x00 int64 — rational numerator. */
  value: bigint;
  /** +0x08 int32 — rational denominator. */
  timescale: number;
  /** +0x0c uint32 — flags (kCMTimeFlags_*). */
  flags: number;
  /** +0x10 int64 — epoch. */
  epoch: bigint;
}

// ---------------------------------------------------------------------------
// OZChannelSceneNode
// ---------------------------------------------------------------------------

/**
 * OZChannelSceneNode — an Ozone channel-graph node that binds a scalar/curve
 * channel to a specific OZSceneNode.  The sceneNode pointer lives at
 * object offset 0x100 (nulled at construction, installed by setSceneNode).
 * Most methods forward into the sceneNode's own vtable or into inherited
 * OZChannelObjectRoot behaviour.
 */
export class OZChannelSceneNode {
  /** @+0x000 primary vptr — installed by each ctor (per-signature payload). */
  vptrPrimary: string = '';

  /** @+0x010 secondary vptr — for the offset-16 base subobject. */
  vptrSecondary: string = '';

  /**
   * @+0x030 parent link (inherited from OZChannelBase; walked by
   * getSceneNodeFromChan up the tree until it finds an OZChannelSceneNode).
   */
  parent: OZChannelSceneNode | null = null;

  /**
   * @+0x0d0 fast-path mirror of `sceneNode + 0x10`.  Written by
   * setSceneNode @0x213d5b/62/66 as `sceneNode ? sceneNode+0x10 : 0`.
   * Its semantic role (an offset-16 base subobject of the sceneNode used
   * as a "quick handle" by some callers) is not fully decoded yet — we
   * model it as an opaque reference-or-null.
   */
  sceneNodeSubHandle: object | null = null;

  /** @+0x100 the OZSceneNode this channel owns (or null). */
  sceneNode: object | null = null;

  // NOTE: no explicit "size 0x108" backing — the +0x108 byte is the object
  // trailer per clone's `movl $0x108,%edi` new-size argument.

  // ---------------------------------------------------------------------
  // Constructors
  // ---------------------------------------------------------------------

  /**
   * OZChannelSceneNode::OZChannelSceneNode(OZFactory*, PCString const&,
   *                                        OZChannelFolder*, uint, uint) — C2.
   * __ZN18OZChannelSceneNodeC2EP9OZFactoryRK8PCStringP15OZChannelFolderjj
   * @0x00213860.
   *
   * Body:
   *   0x213869  callq OZChannelObjectRoot::OZChannelObjectRoot(F,S,Fldr,u,u)
   *   0x21386e  leaq  disp(%rip),%rax        ; primary vtable payload
   *   0x213878  leaq  disp(%rip),%rax        ; secondary vtable payload
   *   0x213883  movq  $0, 0x100(%rbx)        ; sceneNode = null
   *
   * Vtable payload addresses (this-relative + 7-byte fixups):
   *   primary   = 0x21386e + 7 + 0x633fab = 0x847820
   *   secondary = 0x213878 + 7 + 0x634341 = 0x847bc0
   */
  static C2_FactStrFldrUU(
    self: OZChannelSceneNode,
    _factory: object | null,
    _name: object,
    _folder: object | null,
    _u4: number,
    _u5: number,
  ): void {
    // @Ozone 0x213869 — OZChannelObjectRoot::OZChannelObjectRoot(F,S,Fldr,u,u)
    OZChannelObjectRoot_ctor_FactStrFldrUU(self);
    // @Ozone 0x21386e/78/83 — install vptrs and null the sceneNode.
    self.vptrPrimary   = 'OZChannelSceneNode_vt_primary@0x847820';
    self.vptrSecondary = 'OZChannelSceneNode_vt_secondary@0x847bc0';
    self.sceneNode = null;
    self.sceneNodeSubHandle = null;
  }

  /**
   * OZChannelSceneNode::OZChannelSceneNode(OZFactory*, PCString const&,
   *                                        OZChannelFolder*, uint, uint) — C1.
   * __ZN18OZChannelSceneNodeC1EP9OZFactoryRK8PCStringP15OZChannelFolderjj
   * @0x002138a0.  Byte-for-byte parallel to C2 but with DIFFERENT vtable
   * payload addresses (C1's construction-vtable variant):
   *   primary   = 0x2138ae + 7 + 0x633f6b = 0x847820  (== C2's primary)
   *   secondary = 0x2138b8 + 7 + 0x634301 = 0x847bc0  (== C2's secondary)
   */
  static C1_FactStrFldrUU(
    self: OZChannelSceneNode,
    factory: object | null,
    name: object,
    folder: object | null,
    u4: number,
    u5: number,
  ): void {
    // @Ozone 0x2138a9 — chained base ctor.
    OZChannelObjectRoot_ctor_FactStrFldrUU(self);
    // @Ozone 0x2138ae/b8/c3 — install vptrs and null the sceneNode.
    self.vptrPrimary   = 'OZChannelSceneNode_vt_primary@0x847820';
    self.vptrSecondary = 'OZChannelSceneNode_vt_secondary@0x847bc0';
    self.sceneNode = null;
    self.sceneNodeSubHandle = null;
    // reference args to keep them alive in ports that consume them:
    void factory; void name; void folder; void u4; void u5;
  }

  /**
   * OZChannelSceneNode::OZChannelSceneNode(PCString const&, OZChannelFolder*,
   *                                        uint, uint) — C2.
   * __ZN18OZChannelSceneNodeC2ERK8PCStringP15OZChannelFolderjj @0x002138e0.
   *
   * Materially: reaches the OZChannelSceneNode_Factory singleton via
   * std::call_once (@0x2138f7-0x213932) and passes the factory instance as
   * the OZFactory* of the base ctor.  Then installs the same-shape vtable
   * pair and nulls the sceneNode:
   *   primary   = 0x21394f + 7 + 0x633eca = 0x847820
   *   secondary = 0x213959 + 7 + 0x634260 = 0x847bc0
   */
  static C2_StrFldrUU(
    self: OZChannelSceneNode,
    _name: object,
    _folder: object | null,
    _u3: number,
    _u4: number,
  ): void {
    // @Ozone 0x213900-0x213932 — std::call_once(_instanceOnce, getInstance).
    // Consumed as a single "get factory" stub.
    const factory = OZChannelSceneNode_Factory_instance();
    // @Ozone 0x21394a — base ctor with the resolved factory.
    OZChannelObjectRoot_ctor_FactStrFldrUU(self);
    // @Ozone 0x21394f/59/64 — vtable install + null sceneNode.
    self.vptrPrimary   = 'OZChannelSceneNode_vt_primary@0x847820';
    self.vptrSecondary = 'OZChannelSceneNode_vt_secondary@0x847bc0';
    self.sceneNode = null;
    self.sceneNodeSubHandle = null;
    void factory;
  }

  /**
   * OZChannelSceneNode::OZChannelSceneNode(PCString const&, OZChannelFolder*,
   *                                        uint, uint) — C1.
   * __ZN18OZChannelSceneNodeC1ERK8PCStringP15OZChannelFolderjj @0x00213980.
   * Byte-for-byte parallel to C2_StrFldrUU with distinct-payload
   * construction-vtable pair (0x2139ef/f9/04):
   *   primary   = 0x2139ef + 7 + 0x633e2a = 0x847820
   *   secondary = 0x2139f9 + 7 + 0x6341c0 = 0x847bc0
   */
  static C1_StrFldrUU(
    self: OZChannelSceneNode,
    name: object,
    folder: object | null,
    u3: number,
    u4: number,
  ): void {
    // @Ozone 0x2139a0-0x2139d2 — std::call_once for the factory.
    const factory = OZChannelSceneNode_Factory_instance();
    // @Ozone 0x2139ea — base ctor.
    OZChannelObjectRoot_ctor_FactStrFldrUU(self);
    // @Ozone 0x2139ef/f9/04 — vtable install + null sceneNode.
    self.vptrPrimary   = 'OZChannelSceneNode_vt_primary@0x847820';
    self.vptrSecondary = 'OZChannelSceneNode_vt_secondary@0x847bc0';
    self.sceneNode = null;
    self.sceneNodeSubHandle = null;
    void factory; void name; void folder; void u3; void u4;
  }

  /**
   * OZChannelSceneNode::OZChannelSceneNode(OZFactory*, PCString const&,
   *                                        uint) — C2.
   * __ZN18OZChannelSceneNodeC2EP9OZFactoryRK8PCStringj @0x00213a20.
   * Chains into the (Factory,PCString,uint) base ctor variant, then
   * installs a distinct vtable-payload pair:
   *   primary   = 0x213a2e + 7 + 0x633deb = 0x847820
   *   secondary = 0x213a38 + 7 + 0x634181 = 0x847bc0
   */
  static C2_FactStrU(
    self: OZChannelSceneNode,
    _factory: object | null,
    _name: object,
    _u3: number,
  ): void {
    // @Ozone 0x213a29 — OZChannelObjectRoot(Factory,PCString,uint).
    OZChannelObjectRoot_ctor_FactStrU(self);
    // @Ozone 0x213a2e/38/43 — vtable install + null.
    self.vptrPrimary   = 'OZChannelSceneNode_vt_primary@0x847820';
    self.vptrSecondary = 'OZChannelSceneNode_vt_secondary@0x847bc0';
    self.sceneNode = null;
    self.sceneNodeSubHandle = null;
  }

  /**
   * OZChannelSceneNode::OZChannelSceneNode(OZFactory*, PCString const&,
   *                                        uint) — C1.
   * __ZN18OZChannelSceneNodeC1EP9OZFactoryRK8PCStringj @0x00213a60.
   * Vtable payloads:
   *   primary   = 0x213a6e + 7 + 0x633dab = 0x847820
   *   secondary = 0x213a78 + 7 + 0x634141 = 0x847bc0
   */
  static C1_FactStrU(
    self: OZChannelSceneNode,
    factory: object | null,
    name: object,
    u3: number,
  ): void {
    // @Ozone 0x213a69 — base ctor.
    OZChannelObjectRoot_ctor_FactStrU(self);
    self.vptrPrimary   = 'OZChannelSceneNode_vt_primary@0x847820';
    self.vptrSecondary = 'OZChannelSceneNode_vt_secondary@0x847bc0';
    self.sceneNode = null;
    self.sceneNodeSubHandle = null;
    void factory; void name; void u3;
  }

  /**
   * OZChannelSceneNode::OZChannelSceneNode(OZChannelSceneNode const&,
   *                                        OZChannelFolder*) — C2.
   * __ZN18OZChannelSceneNodeC2ERKS_P15OZChannelFolder @0x00213aa0.
   * Copy-ctor variant:
   *   primary   = 0x213aae + 7 + 0x633d6b = 0x847820
   *   secondary = 0x213ab8 + 7 + 0x634101 = 0x847bc0
   *
   * NOTE: `sceneNode` at +0x100 is nulled here, NOT copied from `other`
   * (@0x213ac3 — `movq $0x0, 0x100(%rbx)`).  A newly-constructed copy
   * therefore starts *without* a bound sceneNode; the caller is expected
   * to setSceneNode() afterwards.  clone() relies on exactly this.
   */
  static C2_Copy(
    self: OZChannelSceneNode,
    _other: OZChannelSceneNode,
    _folder: object | null,
  ): void {
    // @Ozone 0x213aa9 — OZChannelObjectRoot(const&, OZChannelFolder*).
    OZChannelObjectRoot_copy_ctor(self);
    // @Ozone 0x213aae/b8/c3 — vtable install + null sceneNode.
    self.vptrPrimary   = 'OZChannelSceneNode_vt_primary@0x847820';
    self.vptrSecondary = 'OZChannelSceneNode_vt_secondary@0x847bc0';
    self.sceneNode = null;
    self.sceneNodeSubHandle = null;
  }

  /**
   * OZChannelSceneNode::OZChannelSceneNode(OZChannelSceneNode const&,
   *                                        OZChannelFolder*) — C1.
   * __ZN18OZChannelSceneNodeC1ERKS_P15OZChannelFolder @0x00213ae0.
   * Vtable payloads:
   *   primary   = 0x213aee + 7 + 0x633d2b = 0x847820
   *   secondary = 0x213af8 + 7 + 0x6340c1 = 0x847bc0
   */
  static C1_Copy(
    self: OZChannelSceneNode,
    other: OZChannelSceneNode,
    folder: object | null,
  ): void {
    // @Ozone 0x213ae9 — base copy ctor.
    OZChannelObjectRoot_copy_ctor(self);
    self.vptrPrimary   = 'OZChannelSceneNode_vt_primary@0x847820';
    self.vptrSecondary = 'OZChannelSceneNode_vt_secondary@0x847bc0';
    self.sceneNode = null;
    self.sceneNodeSubHandle = null;
    void other; void folder;
  }

  // ---------------------------------------------------------------------
  // Destructors
  // ---------------------------------------------------------------------

  /**
   * OZChannelSceneNode::~OZChannelSceneNode() — D2 (base).
   * __ZN18OZChannelSceneNodeD2Ev @0x00213b20.
   *
   *   0x213b20  pushq %rbp
   *   0x213b21  movq  %rsp, %rbp
   *   0x213b24  popq  %rbp
   *   0x213b25  jmp   OZChannelObjectRoot::~OZChannelObjectRoot()
   *
   * Straight tail-call — no per-class state to tear down beyond what the
   * base handles (sceneNode is a non-owning pointer per setSceneNode).
   */
  static D2(self: OZChannelSceneNode): void {
    // @Ozone 0x213b25 — tail-jmp OZChannelObjectRoot::~OZChannelObjectRoot().
    OZChannelObjectRoot_dtor(self);
  }

  /**
   * OZChannelSceneNode::~OZChannelSceneNode() — D1 (complete).
   * __ZN18OZChannelSceneNodeD1Ev @0x00213b30.  Same body as D2 (tail-jmp
   * to OZChannelObjectRoot::~OZChannelObjectRoot() @0x213b35).
   */
  static D1(self: OZChannelSceneNode): void {
    // @Ozone 0x213b35 — tail-jmp base dtor.
    OZChannelObjectRoot_dtor(self);
  }

  /**
   * OZChannelSceneNode::~OZChannelSceneNode() — D1 thunk (offset -16).
   * __ZThn16_N18OZChannelSceneNodeD1Ev @0x00213b40.
   *
   *   0x213b44  addq $-0x10, %rdi        ; walk back to the primary base
   *   0x213b49  jmp  OZChannelObjectRoot::~OZChannelObjectRoot()
   */
  static D1_thunk16(self: OZChannelSceneNode): void {
    // @Ozone 0x213b44 — the thunk adjusts `this` by -0x10 to walk from
    // the offset-16 secondary base subobject back to the primary base.
    // Structurally we call the same dtor with the same object; the
    // pointer arithmetic is captured in the comment for provenance.
    // @Ozone 0x213b49 — tail-jmp base dtor.
    OZChannelObjectRoot_dtor(self);
  }

  /**
   * OZChannelSceneNode::~OZChannelSceneNode() — D0 (deleting).
   * __ZN18OZChannelSceneNodeD0Ev @0x00213b50.
   *
   *   0x213b59  callq OZChannelObjectRoot::~OZChannelObjectRoot()
   *   0x213b67  jmp   operator delete(this)
   */
  static D0(self: OZChannelSceneNode): void {
    // @Ozone 0x213b59 — base dtor on `this`.
    OZChannelObjectRoot_dtor(self);
    // @Ozone 0x213b67 — tail-jmp operator delete(this).
    op_delete(self);
  }

  /**
   * OZChannelSceneNode::~OZChannelSceneNode() — D0 thunk (offset -16).
   * __ZThn16_N18OZChannelSceneNodeD0Ev @0x00213b70.
   *
   *   0x213b79  addq $-0x10, %rbx    ; walk back to primary base
   *   0x213b80  callq OZChannelObjectRoot::~OZChannelObjectRoot()
   *   0x213b8e  jmp   operator delete(<adjusted this>)
   */
  static D0_thunk16(self: OZChannelSceneNode): void {
    // @Ozone 0x213b79 — pointer adjustment (-0x10) to reach primary base.
    // @Ozone 0x213b80 — base dtor.
    OZChannelObjectRoot_dtor(self);
    // @Ozone 0x213b8e — tail-jmp operator delete(adjusted this).
    op_delete(self);
  }

  // ---------------------------------------------------------------------
  // Assignment / cloning
  // ---------------------------------------------------------------------

  /**
   * OZChannelSceneNode::operator=(OZChannelSceneNode const&).
   * __ZN18OZChannelSceneNodeaSERKS_ @0x00213ba0.
   *
   *   0x213ba4  movq  (%rdi), %rax        ; vtable
   *   0x213ba7  movq  0x100(%rax), %rax   ; slot +0x100
   *   0x213baf  jmpq  *%rax                ; tail-call virtual assign
   *
   * The class's *own* assignment op is a pure virtual-dispatch tail-call —
   * the real work happens in the vtable at slot +0x100 (undecoded).
   */
  static operator_eq(
    self: OZChannelSceneNode,
    rhs: OZChannelSceneNode,
  ): OZChannelSceneNode {
    // @Ozone 0x213baf — virtual tail-call.
    return selfOperatorEq_100_dispatch(self, rhs);
  }

  /**
   * OZChannelSceneNode::clone() const.
   * __ZNK18OZChannelSceneNode5cloneEv @0x00213bc0.
   *
   *   0x213bca  movl  $0x108, %edi         ; sizeof(OZChannelSceneNode)
   *   0x213bcf  callq operator new
   *   0x213bda  movq  %r14, %rsi           ; other = *this
   *   0x213bdd  xorl  %edx, %edx           ; folder = nullptr
   *   0x213bdf  callq OZChannelObjectRoot::OZChannelObjectRoot(const&, Folder*)
   *   0x213be4  leaq  disp(%rip), %rax     ; primary vt payload
   *   0x213bee  leaq  disp(%rip), %rax     ; secondary vt payload
   *   0x213bf9  movq  $0, 0x100(%rbx)      ; sceneNode = null
   *   0x213c04  movq  %rbx, %rax           ; return the new object
   *
   * Vtable payloads (same as C2_Copy's, but with different offsets):
   *   primary   = 0x213be4 + 7 + 0x633c35 = 0x847820
   *   secondary = 0x213bee + 7 + 0x633fcb = 0x847bc0
   *
   * NOTE: like the copy ctor, clone() does NOT copy the sceneNode
   * pointer — it produces a bare copy that the caller must rebind.
   */
  static clone(self: OZChannelSceneNode): OZChannelSceneNode {
    // @Ozone 0x213bcf — operator new(0x108).
    const dst = op_new(0x108);
    // @Ozone 0x213bdf — base copy ctor with folder=nullptr.
    OZChannelObjectRoot_copy_ctor(dst);
    // @Ozone 0x213be4/ee/f9 — vtable install + null sceneNode.
    dst.vptrPrimary   = 'OZChannelSceneNode_vt_primary@0x847820';
    dst.vptrSecondary = 'OZChannelSceneNode_vt_secondary@0x847bc0';
    dst.sceneNode = null;
    dst.sceneNodeSubHandle = null;
    // @Ozone 0x213c04/07 — return the new object.
    void self;
    return dst;
  }

  // ---------------------------------------------------------------------
  // Comparison
  // ---------------------------------------------------------------------

  /**
   * OZChannelSceneNode::compare(OZChannelBase const*).
   * __ZN18OZChannelSceneNode7compareEPK13OZChannelBase @0x00213c20.
   *
   * Returns 1 (uint8-in-al) iff:
   *   1. `other` is non-null,
   *   2. dynamic_cast<OZChannelSceneNode*>(other) succeeds,
   *   3. `this->sceneNode == casted_other->sceneNode` (raw ptr eq @0x100),
   *   4. AND OZChannelFolder::compare(this, casted_other) returns true.
   *
   * Anything else -> 0.
   */
  static compare(
    self: OZChannelSceneNode,
    other: OZChannelSceneNode | null,
  ): number {
    // @Ozone 0x213c27/2a — null-check `other`.
    if (other === null) {
      // @Ozone 0x213c72/74 — xorl %ebx,%ebx ; ret 0.
      return 0;
    }
    // @Ozone 0x213c47 — cast: dynamic_cast<OZChannelSceneNode*>(other).
    const casted = itanium_dynamic_cast(
      other,
      { name: '__ZTI13OZChannelBase' },
      { name: '__ZTI18OZChannelSceneNode' },
      0,
    ) as OZChannelSceneNode | null;
    // @Ozone 0x213c4f — cast failed -> 0.
    if (casted === null) {
      return 0;
    }
    // @Ozone 0x213c51/58/5f — `this->sceneNode == casted->sceneNode`.
    if (self.sceneNode !== casted.sceneNode) {
      // @Ozone 0x213c72/74 — mismatch -> 0.
      return 0;
    }
    // @Ozone 0x213c67 — final tie-breaker: OZChannelFolder::compare.
    const folderCmp = OZChannelFolder_compare(self, casted);
    // @Ozone 0x213c6c-0x213c70 — `movb $1,%bl ; testb %al,%al ; jne exit`.
    // Interpreted: pre-load bl=1; if folder-compare returned NONZERO (%al
    // sets ZF=0), take the "exit" branch and return bl (=1).  If folder-
    // compare returned ZERO, ZF=1 skips the exit -> falls into the
    // xorl-bl-zero tail and returns 0.
    return folderCmp !== 0 ? 1 : 0;
  }

  // ---------------------------------------------------------------------
  // Dispatch surface
  // ---------------------------------------------------------------------

  /**
   * OZChannelSceneNode::channelValueWillBeSet(OZChannel*, CMTime const&, double).
   * __ZN18OZChannelSceneNode21channelValueWillBeSetEP9OZChannelRK6CMTimed
   * @0x00213c80.
   *
   *   0x213c80  movq  0x100(%rdi), %rdi     ; this = self->sceneNode
   *   0x213c8a  je    <exit>                ; if null, do nothing
   *   ...       stack-copy the CMTime      ; @0x213c94-0x213cb3
   *   0x213cb7  callq *0x130(%rax)          ; sceneNode->[+0x130] dispatch
   *
   * If self has no bound sceneNode this is a NO-OP (the outer `movq
   * 0x100(%rdi),%rdi ; testq %rdi,%rdi ; je exit` fast-out).  Otherwise
   * forwards into the sceneNode's own vtable slot +0x130 with a
   * stack-copied CMTime and the incoming (channel, value).
   */
  static channelValueWillBeSet(
    self: OZChannelSceneNode,
    chan: object | null,
    time: CMTime,
    value: number,
  ): void {
    // @Ozone 0x213c80/87/8a — sceneNode fast-out.
    const sceneNode = self.sceneNode;
    if (sceneNode === null) {
      // @Ozone 0x213cc2 — retq (do nothing).
      return;
    }
    // @Ozone 0x213c94-0x213cb3 — CMTime is copied ONTO the argument frame
    // via a 16-byte movups + 8-byte movq (splitting the 24-byte POD into
    // the (value,timescale,flags) block and the epoch tail).  We pass
    // the struct through by-value equivalent.
    // @Ozone 0x213cb7 — sceneNode->[vtable +0x130].
    nestedChannelValueWillBeSet_130(sceneNode, chan, time, value);
  }

  /**
   * OZChannelSceneNode::reset(bool).
   * __ZN18OZChannelSceneNode5resetEb @0x00213cd0.
   *
   *   0x213cda  movq  0x100(%rdi), %rdi        ; sceneNode fast-out
   *   0x213ce6  movq  0x138(%rdi), %rax        ; nested@+0x138 vtable
   *   0x213ced  addq  $0x138, %rdi             ; this += 0x138
   *   0x213cf4  movzbl %sil, %r14d             ; zero-extend the flag
   *   0x213cfb  callq *0x120(%rax)             ; nested@+0x138 ::reset(flag)
   *   0x213d01  movq  0x100(%rbx), %rdi        ; reload sceneNode
   *   0x213d08  movq  0x338(%rdi), %rax
   *   0x213d0f  addq  $0x338, %rdi
   *   0x213d19  callq *0x120(%rax)             ; nested@+0x338 ::reset(flag)
   *   0x213d1f  movq  0x100(%rbx), %rdi        ; reload sceneNode
   *   0x213d26  movq  0x1b8(%rdi), %rax
   *   0x213d2d  addq  $0x1b8, %rdi
   *   0x213d34  movq  0x120(%rax), %rax        ; load vslot address
   *   0x213d3b  movl  %r14d, %esi              ; flag
   *   0x213d42  jmpq  *%rax                    ; tail-jmp nested@+0x1b8 reset
   *
   * Three nested OZChannel subobjects of the sceneNode all get reset(flag),
   * with the third invocation as a tail-jmp (that's why it comes last).
   * No-op if sceneNode is null.
   */
  static reset(self: OZChannelSceneNode, flag: boolean): void {
    // @Ozone 0x213cda/e1/e4 — sceneNode fast-out.
    const sn0 = self.sceneNode;
    if (sn0 === null) {
      // @Ozone 0x213d44 — retq.
      return;
    }
    // @Ozone 0x213cf4 — flag is zero-extended byte (0 or 1); we normalise.
    const f: boolean = !!flag;

    // @Ozone 0x213ce6-0x213cfb — sceneNode+0x138 -> reset(f).
    // (The base pointer passed is sceneNode+0x138; the vtable lives at
    //  offset 0 of that subobject, and slot +0x120 is `reset(bool)`.)
    nestedReset_120({ base: sn0, off: 0x138 }, f);

    // @Ozone 0x213d01-0x213d19 — sceneNode+0x338 -> reset(f).
    const sn1 = self.sceneNode;
    if (sn1 === null) return; // reload guard (matches the asm's reload)
    nestedReset_120({ base: sn1, off: 0x338 }, f);

    // @Ozone 0x213d1f-0x213d42 — sceneNode+0x1b8 -> reset(f) (tail-jmp).
    const sn2 = self.sceneNode;
    if (sn2 === null) return;
    nestedReset_120({ base: sn2, off: 0x1b8 }, f);
  }

  // ---------------------------------------------------------------------
  // SceneNode binding
  // ---------------------------------------------------------------------

  /**
   * OZChannelSceneNode::setSceneNode(OZSceneNode*).
   * __ZN18OZChannelSceneNode12setSceneNodeEP11OZSceneNode @0x00213d50.
   *
   *   0x213d54  movq  %rsi, 0x100(%rdi)       ; sceneNode = arg
   *   0x213d5b  leaq  0x10(%rsi), %rax        ; rax = sceneNode + 0x10
   *   0x213d5f  testq %rsi, %rsi              ; ZF=1 if arg was null
   *   0x213d62  cmoveq %rsi, %rax             ; if null, rax = null
   *   0x213d66  movq  %rax, 0xd0(%rdi)        ; sceneNodeSubHandle = rax
   *
   * i.e. `sceneNodeSubHandle = sceneNode ? sceneNode+0x10 : null`.
   */
  static setSceneNode(
    self: OZChannelSceneNode,
    sceneNode: object | null,
  ): void {
    // @Ozone 0x213d54 — sceneNode = arg.
    self.sceneNode = sceneNode;
    // @Ozone 0x213d5b-0x213d62 — cmov-null idiom: compute (sceneNode+0x10)
    // unconditionally, then swap in null if the argument was null.
    self.sceneNodeSubHandle = sceneNode === null
      ? null
      : { base: sceneNode, off: 0x10 };
  }

  /**
   * OZChannelSceneNode::getSceneNodeFromChan(OZChannelBase*).
   * __ZN18OZChannelSceneNode20getSceneNodeFromChanEP13OZChannelBase
   * @0x00213d70.
   *
   *   0x213d7b  testq %rdi,%rdi ; je exit-null   ; null-guard
   *   loop:
   *     0x213da3  __dynamic_cast(chan, OZChannelBase, OZChannelSceneNode, 0)
   *     0x213db3  jne match                       ; got a hit?
   *     0x213db5  movq 0x30(%r14), %r14          ; chan = chan->parent
   *     0x213dbc  testq %r14,%r14 ; jne loop      ; keep walking
   *     0x213dbe  jmp exit-null (rbx=0)
   *   match:
   *     0x213dc4  movq 0x100(%rax), %rbx         ; rbx = casted->sceneNode
   *   exit:
   *     movq %rbx, %rax ; ret
   *
   * Walks up the channel-base parent chain (link at +0x30) looking for
   * the closest OZChannelSceneNode; returns that node's sceneNode
   * pointer, or null if none is found (or `chan` was null to begin with).
   */
  static getSceneNodeFromChan(
    chan: OZChannelSceneNode | { parent: OZChannelSceneNode | null } | null,
  ): object | null {
    // @Ozone 0x213d7b/7e — top-level null guard.
    if (chan === null) {
      // @Ozone 0x213dc0/c2/cb — rbx = 0 ; return 0.
      return null;
    }
    // @Ozone 0x213d91 — rbx = 0 (initial "no match" state).
    let matchSceneNode: object | null = null;
    // @Ozone 0x213da0 loop.
    let cur: { parent: OZChannelSceneNode | null } | null =
      chan as { parent: OZChannelSceneNode | null };
    while (cur !== null) {
      // @Ozone 0x213dab — dynamic_cast<OZChannelSceneNode*>(cur).
      const casted = itanium_dynamic_cast(
        cur,
        { name: '__ZTI13OZChannelBase' },
        { name: '__ZTI18OZChannelSceneNode' },
        0,
      ) as OZChannelSceneNode | null;
      if (casted !== null) {
        // @Ozone 0x213dc4 — matched: pick up the sceneNode at +0x100.
        matchSceneNode = casted.sceneNode;
        break;
      }
      // @Ozone 0x213db5 — cur = cur->parent  (link at +0x30).
      cur = cur.parent as { parent: OZChannelSceneNode | null } | null;
    }
    // @Ozone 0x213dcb-0x213dd6 — return the discovered sceneNode (or null).
    return matchSceneNode;
  }

  // ---------------------------------------------------------------------
  // Time offset
  // ---------------------------------------------------------------------

  /**
   * OZChannelSceneNode::setTimeOffset(CMTime const&, bool).
   * __ZN18OZChannelSceneNode13setTimeOffsetERK6CMTimeb @0x00213de0.
   *
   *   0x213df6  movq  (%rdi), %rax           ; this->vtable
   *   0x213dfd  movq  %rbx, %rsi
   *   0x213e00  callq *0x140(%rax)           ; self->[+0x140] copy-out
   *                                          ; (stores pre-change offset
   *                                          ;  into stack slot -0x48(%rbp))
   *   0x213e0f  callq OZChannelObjectRootBase::setTimeOffset(t, flag)
   *   0x213e14  cmpq  $0, 0x100(%rbx)        ; if sceneNode == null:
   *   0x213e1c  je    <exit>                 ;   skip post-notify
   *   0x213e1e-0x213e4d — stack-copy the new & old CMTime PODs into
   *                       CMTimeCompare's arg frame.
   *   0x213e51  callq CMTimeCompare(newT, oldT)
   *   0x213e56  testl %eax,%eax ; je <exit>  ; if unchanged, done
   *   0x213e5a  movq  0x100(%rbx), %rdi      ; sceneNode
   *   0x213e61  movq  (%rdi), %rax           ; sceneNode->vtable
   *   0x213e64  callq *0x4a0(%rax)           ; post-time-change notify
   *
   * Semantics: snapshot the OLD offset via the class's own vtable slot
   * +0x140 (into a stack scratch CMTime), forward setTimeOffset(t,flag)
   * to the base, then — only if we have a bound sceneNode AND the new
   * offset actually differs from the snapshotted one per CMTimeCompare —
   * fire the sceneNode's +0x4a0 "time-changed" hook.
   */
  static setTimeOffset(
    self: OZChannelSceneNode,
    t: CMTime,
    flag: boolean,
  ): void {
    // @Ozone 0x213e00 — snapshot the current offset via slot +0x140.
    const preSlot: { value: CMTime } = { value: {
      value: 0n, timescale: 0, flags: 0, epoch: 0n,
    } };
    selfGetTimeOffset_140(self, preSlot);
    const preOffset = preSlot.value;

    // @Ozone 0x213e0f — OZChannelObjectRootBase::setTimeOffset(t, flag).
    OZChannelObjectRootBase_setTimeOffset(self, t, flag);

    // @Ozone 0x213e14/1c — sceneNode presence gate.
    if (self.sceneNode === null) {
      // @Ozone 0x213e6a — retq.
      return;
    }

    // @Ozone 0x213e51 — CMTimeCompare(new=t, old=preOffset).
    const cmp = CMTimeCompare(t, preOffset);
    // @Ozone 0x213e56/58 — testl %eax,%eax ; je exit  (0 means "equal").
    if (cmp === 0) {
      return;
    }

    // @Ozone 0x213e5a-0x213e64 — sceneNode->[vtable +0x4a0].
    sceneNodePostTimeChange_4a0(self.sceneNode);
  }
}
