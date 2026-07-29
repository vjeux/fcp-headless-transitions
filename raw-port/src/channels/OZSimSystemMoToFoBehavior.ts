// OZSimSystemMoToFoBehavior — Ozone "motion-to-follow" simulation-system behavior.
//
// Transcribed from the x86_64 disassembly of Ozone in
// /Applications/Final Cut Pro.app/Contents/Frameworks/Ozone.framework/Versions/A/Ozone.
//
// FAITHFUL PORT — do NOT approximate, do NOT guess.  Every method cites its @Ozone 0xADDR read
// from the disassembly under raw-port/re/disasm/OZSimSystemMoToFoBehavior.*.s and any un-decoded
// frontier is a throwing stub that names its source address so the gap is loud.
//
// Symbols in this class  (nm -arch x86_64 | c++filt | grep '^OZSimSystemMoToFoBehavior::'):
//
//   @0x38ad20  OZSimSystemMoToFoBehavior::OZSimSystemMoToFoBehavior(OZFactory*, PCString const&, unsigned int)          — C2 (base ctor)               — stub
//   @0x38af40  OZSimSystemMoToFoBehavior::OZSimSystemMoToFoBehavior(OZFactory*, PCString const&, unsigned int)          — C1 (complete ctor)           — stub
//   @0x38af50  OZSimSystemMoToFoBehavior::OZSimSystemMoToFoBehavior(OZSimSystemMoToFoBehavior&, unsigned int)           — C2 (copy ctor)                — stub
//   @0x38b170  OZSimSystemMoToFoBehavior::OZSimSystemMoToFoBehavior(OZSimSystemMoToFoBehavior&, unsigned int)           — C1 (copy ctor)                — stub
//   @0x38b180  OZSimSystemMoToFoBehavior::~OZSimSystemMoToFoBehavior()                                                  — D2                            — stub
//   @0x38b1f0  OZSimSystemMoToFoBehavior::~OZSimSystemMoToFoBehavior()                                                  — D1                            — stub
//   @0x38b340  OZSimSystemMoToFoBehavior::~OZSimSystemMoToFoBehavior()                                                  — D0 (deleting)                 — stub
//   @0x38b4c0  OZSimSystemMoToFoBehavior::operator=(OZBehavior const&)                                                  — PORTED
//   @0x38b4e0  OZSimSystemMoToFoBehavior::findCachedValues(double (*) [3], PCQuat<double>*, bool*, int, CMTime, CMTime) — stub (104-line body)
//   @0x38b6a0  OZSimSystemMoToFoBehavior::didAddToNode(OZSceneNode*)                                                    — PORTED
//   @0x38b6f0  OZSimSystemMoToFoBehavior::willRemove()                                                                  — PORTED
//   @0x38b730  OZSimSystemMoToFoBehavior::calcHashForState(PCSerializerWriteStream&, OZRenderParams const&, std::list<OZObjectManipulator*>&) — PORTED (empty body)
//   @0x38b750  OZSimSystemMoToFoBehavior::calcParentsDerivatives(OZSimulationState*)                                    — stub (1223-line body)
//   @0x38d4b0  OZSimSystemMoToFoBehavior::accumForces(OZSimStateArray*, OZTransformNode*)                               — stub (216-line body)
//   @0x38d930  OZSimSystemMoToFoBehavior::calcParentsInitialValues(OZSimulationState*)                                  — stub (393-line body)
//   @0x38e1a0  OZSimSystemMoToFoBehavior::accumInitialValues(OZSimStateArray*, int, OZTransformNode*)                   — stub (183-line body)
//   @0x38e570  OZSimSystemMoToFoBehavior::isSceneNodeAnimated(OZSceneNode*)                                             — stub (67-line body, calls OZBehavior::IsChannelAffectedByBehaviors x6)
//   @0x38e670  OZSimSystemMoToFoBehavior::areOwnersAnimated(OZSceneNode*)                                               — PORTED (small loop)
//   @0x38e6b0  OZSimSystemMoToFoBehavior::updateCache()                                                                 — stub (85-line body)
//   @0x38e850  OZSimSystemMoToFoBehavior::updateTransformNode(OZTransformNode*)                                         — PORTED
//   @0x38e870  OZSimSystemMoToFoBehavior::affectsSelf() const                                                           — PORTED  (returns 0)
//   @0x38e880  OZSimSystemMoToFoBehavior::getParentTransformNode()                                                      — PORTED  (tail-call OZSimulationBehavior::getTransformNode)
//   @0x38e890  OZSimSystemMoToFoBehavior::getAttachToParentFraction(CMTime)                                             — PORTED  (returns 1.0 constant)
//   @0x38e8a0  OZSimSystemMoToFoBehavior::getIncludeParentsRotation()                                                   — PORTED  (returns 1 / true)
//
// VTABLE (vtable@0x854fc8, installed-ptr 0x854fd8 — recovered by raw-port/army/tools/vtable.py):
//   *0x00 -> 0x38b1f0  ~D1
//   *0x08 -> 0x38b340  ~D0
//   *0x50 -> 0x38b4c0  operator=
//   *0x60 -> 0x38b6a0  didAddToNode
//   *0x78 -> 0x38b6f0  willRemove
//   ... plus 20+ inherited slots (all resolve to OZSimulationBehavior / OZBehavior / OZFactoryBase).
//
// RODATA constants used  (verified via `otool -X -v -s __TEXT __const Ozone`)
//   0x7053e0:  00 00 00 00 00 00 f0 3f            = 1.0    (double, 0x3ff0000000000000)
//                                                   — read by getAttachToParentFraction @0x38e894
//
// STRUCT LAYOUT (recovered from didAddToNode + willRemove + operator= + updateTransformNode)
// -----------------------------------------------------------------------------------
//   +0x148   OZChannelObjectRoot*   channelObjectRoot
//              Cached pointer to the OZChannelObjectRoot bound to the OZSceneNode's OZTransformNode.
//              Written by:
//                - didAddToNode           @0x38b6d5   `movq  %rax, 0x148(%r14)`   (from *0x2d8(vtable))
//                - updateTransformNode    @0x38e854   `movq  %rsi, 0x148(%rdi)`
//              Cleared to null by:
//                - operator=              @0x38b4ce   `movq  $0x0, 0x148(%rbx)`
//                - willRemove             @0x38b719   `movq  $0x0, 0x148(%rbx)`
//              Read by:
//                - most of the "sim state" methods when they walk parent transforms.
//
// -----------------------------------------------------------------------------
// Frontier types — kept minimal, opaque.  Full ports are separate ledger items.
// -----------------------------------------------------------------------------

/**
 * CMTime — Core Media rational-time struct.  Only relevant here as an ABI-opaque token; the port
 * of the CMTime arithmetic itself lives elsewhere and is not touched by this class's decoded
 * methods (`getAttachToParentFraction` reads its CMTime arg but ignores it and returns a constant).
 */
export interface CMTime { readonly __cmtime: unique symbol }

export interface OZFactory              { readonly __ozFactory: unique symbol }
export interface PCString               { readonly __pcString: unique symbol }
export interface OZBehavior             { readonly __ozBehavior: unique symbol }
export interface OZSceneNode            { readonly __ozSceneNode: unique symbol }
export interface OZTransformNode        { readonly __ozTransformNode: unique symbol }
export interface OZSimStateArray        { readonly __ozSimStateArray: unique symbol }
export interface OZSimulationState      { readonly __ozSimulationState: unique symbol }
export interface OZRenderParams         { readonly __ozRenderParams: unique symbol }
export interface OZObjectManipulator    { readonly __ozObjectManipulator: unique symbol }
export interface PCSerializerWriteStream { readonly __pcSerializerWriteStream: unique symbol }
export interface PCQuatDouble           { readonly __pcQuatDouble: unique symbol }

/**
 * OZChannelObjectRoot — the parent-transform's channel-owner root.  Only two methods are used by
 * this class; the full port is a separate frontier item.
 *
 * @provenance
 *   Ozone @0x38b6c4 `callq OZChannelObjectRoot::addBehavior(OZSimulationBehavior*)`
 *   Ozone @0x38b714 `callq OZChannelObjectRoot::removeBehavior(OZSimulationBehavior*)`
 */
export interface OZChannelObjectRoot {
  /** OZChannelObjectRoot::addBehavior(OZSimulationBehavior*) — mangled `__ZN19OZChannelObjectRoot11addBehaviorEP20OZSimulationBehavior`. */
  addBehavior(b: OZSimulationBehaviorLike): void;
  /** OZChannelObjectRoot::removeBehavior(OZSimulationBehavior*) — mangled `__ZN19OZChannelObjectRoot14removeBehaviorEP20OZSimulationBehavior`. */
  removeBehavior(b: OZSimulationBehaviorLike): void;
}

/**
 * OZSimulationBehavior — parent class of OZSimSystemMoToFoBehavior.  Only the members actually
 * called from this class are declared; the full port is a separate frontier item.
 *
 * @provenance
 *   Ozone @0x38b6ad `callq OZSimulationBehavior::didAddToNode(OZSceneNode*)`
 *   Ozone @0x38b4c9 `callq OZSimulationBehavior::operator=(OZBehavior const&)`
 *   Ozone @0x38e885 `jmp   OZSimulationBehavior::getTransformNode()`
 */
export interface OZSimulationBehaviorLike {
  /** OZSimulationBehavior::didAddToNode(OZSceneNode*) — `__ZN20OZSimulationBehavior12didAddToNodeEP11OZSceneNode`. */
  didAddToNode(node: OZSceneNode | null): void;
  /** OZSimulationBehavior::operator=(OZBehavior const&) — `__ZN20OZSimulationBehavioraSERK10OZBehavior`. */
  assignFromBehavior(rhs: OZBehavior): void;
  /** OZSimulationBehavior::getTransformNode() — `__ZN20OZSimulationBehavior16getTransformNodeEv`. */
  getTransformNode(): OZTransformNode | null;
}

// -----------------------------------------------------------------------------
// The port
// -----------------------------------------------------------------------------

/**
 * OZSimSystemMoToFoBehavior — an OZSimulationBehavior subclass driving the "motion-to-follow"
 * physics rig: a soft attach to a parent transform with an animated force accumulator.
 *
 * This file ports the byte-verbatim shape of the class (vtable, field @+0x148, and every method
 * whose disassembly is fully decoded); the physics-heavy overloads (`accumForces`, `accum-
 * InitialValues`, `calcParents{Derivatives,InitialValues}`, `findCachedValues`, `updateCache`)
 * are marked as throwing stubs that cite their source @0xADDR so the frontier is loud.
 *
 * @provenance Ozone 0x38ad20..0x38e8a7 (class byte range).
 */
export class OZSimSystemMoToFoBehavior {
  /**
   * Cached OZChannelObjectRoot* bound to the parent OZTransformNode.  See STRUCT LAYOUT header
   * — written by `didAddToNode` and `updateTransformNode`; cleared by `operator=` and `willRemove`.
   *
   * @provenance
   *   Ozone @0x38b6d5  `movq %rax, 0x148(%r14)`  (didAddToNode)
   *   Ozone @0x38e854  `movq %rsi, 0x148(%rdi)`  (updateTransformNode)
   *   Ozone @0x38b4ce  `movq $0x0, 0x148(%rbx)`  (operator=)
   *   Ozone @0x38b719  `movq $0x0, 0x148(%rbx)`  (willRemove)
   */
  channelObjectRoot: OZChannelObjectRoot | null = null; // @+0x148

  // ---------------------------------------------------------------------------
  // Constant returns / trivial getters
  // ---------------------------------------------------------------------------

  /**
   * affectsSelf() const — @Ozone 0x38e870.
   *
   *   0x38e870  pushq %rbp
   *   0x38e871  movq  %rsp, %rbp
   *   0x38e874  xorl  %eax, %eax
   *   0x38e876  popq  %rbp
   *   0x38e877  retq
   *
   * @returns 0 (false).
   */
  affectsSelf(): number {
    return 0;
  }

  /**
   * getIncludeParentsRotation() — @Ozone 0x38e8a0.
   *
   *   0x38e8a0  pushq %rbp
   *   0x38e8a1  movq  %rsp, %rbp
   *   0x38e8a4  movb  $0x1, %al
   *   0x38e8a6  popq  %rbp
   *   0x38e8a7  retq
   *
   * @returns 1 (true).
   */
  getIncludeParentsRotation(): number {
    return 1;
  }

  /**
   * getAttachToParentFraction(CMTime) — @Ozone 0x38e890.
   *
   *   0x38e890  pushq %rbp
   *   0x38e891  movq  %rsp, %rbp
   *   0x38e894  movsd 0x376b44(%rip), %xmm0    ; RIP-target 0x38e89c + 0x376b44 = 0x7053e0 -> 1.0
   *   0x38e89c  popq  %rbp
   *   0x38e89d  retq
   *
   * @returns 1.0 (double).  The CMTime argument is ignored by the disassembled body.
   *
   * The constant lives at __TEXT,__const Ozone 0x7053e0 (bytes 00 00 00 00 00 00 f0 3f =
   * 0x3ff0000000000000 = IEEE-754 double 1.0).
   */
  getAttachToParentFraction(_t: CMTime): number {
    // exact byte-verbatim constant read from Ozone 0x7053e0
    return 1.0;
  }

  /**
   * calcHashForState(PCSerializerWriteStream&, OZRenderParams const&, list<OZObjectManipulator*>&)
   *   — @Ozone 0x38b730.
   *
   *   0x38b730  pushq %rbp
   *   0x38b731  movq  %rsp, %rbp
   *   0x38b734  popq  %rbp
   *   0x38b735  retq
   *
   * Empty body; contributes nothing to the state hash (no-op).
   */
  calcHashForState(
    _stream: PCSerializerWriteStream,
    _params: OZRenderParams,
    _manipulators: OZObjectManipulator[],
  ): void {
    // intentionally empty — matches the disassembled prologue/epilogue-only body.
  }

  // ---------------------------------------------------------------------------
  // Thunks / small wrappers (structural — the parent-class callees are frontier stubs)
  // ---------------------------------------------------------------------------

  /**
   * getParentTransformNode() — @Ozone 0x38e880.
   *
   *   0x38e880  pushq %rbp
   *   0x38e881  movq  %rsp, %rbp
   *   0x38e884  popq  %rbp
   *   0x38e885  jmp   OZSimulationBehavior::getTransformNode()   ; tail-call
   *
   * Tail-calls the parent's getTransformNode().  We forward through the injected
   * `OZSimulationBehaviorLike` view of `this` (the frontier for the base class is a separate
   * ledger item; when it lands we can drop the parameter and call `super.getTransformNode()`).
   *
   * @param base a live view of `this` as OZSimulationBehavior* — supplied by the caller since the
   *             parent-class port is not yet decoded.
   */
  getParentTransformNode(base: OZSimulationBehaviorLike): OZTransformNode | null {
    return base.getTransformNode();
  }

  /**
   * updateTransformNode(OZTransformNode*) — @Ozone 0x38e850.
   *
   *   0x38e850  pushq %rbp
   *   0x38e851  movq  %rsp, %rbp
   *   0x38e854  movq  %rsi, 0x148(%rdi)             ; this->channelObjectRoot = param  (see NOTE)
   *   0x38e85b  movq  (%rdi),  %rax                 ; %rax = *this = vtable ptr
   *   0x38e85e  popq  %rbp
   *   0x38e85f  jmpq  *0x2d0(%rax)                  ; tail-call vtable slot 0x2d0
   *
   * The vtable-tail-call at *0x2d0 dispatches on the object's own vtable; it is a
   * frontier stub (`onTransformNodeUpdated`) since the concrete callee depends on the
   * derived class installed at that slot.  We record the field write byte-verbatim and
   * throw for the tail-call.
   *
   * NOTE on the field store: the disassembly literally writes `%rsi` (the parameter) into
   * `+0x148`.  In every OTHER site (didAddToNode, willRemove, operator=) `+0x148` holds an
   * `OZChannelObjectRoot*`.  Here the argument is typed `OZTransformNode*` in the mangled
   * name, so either (a) `updateTransformNode` is called with the ChannelObjectRoot already
   * extracted, or (b) OZTransformNode and OZChannelObjectRoot alias at the top of a shared
   * layout in this call site.  We do NOT resolve this ambiguity — we store the raw pointer
   * and defer the vtable dispatch to a frontier stub.
   */
  updateTransformNode(node: OZTransformNode | null): void {
    // byte-verbatim: `movq %rsi, 0x148(%rdi)` — see NOTE above about the field alias.
    this.channelObjectRoot = node as unknown as OZChannelObjectRoot | null;
    // `jmpq *0x2d0(%rax)` — vtable slot 0x2d0 on this class's own vtable.  Callee is a
    // derived-class hook; not yet decoded.
    throw new Error(
      "OZSimSystemMoToFoBehavior::updateTransformNode vtable-tail-call *0x2d0 @0x38e85f not yet transcribed",
    );
  }

  /**
   * operator=(OZBehavior const&) — @Ozone 0x38b4c0.
   *
   *   0x38b4c0  pushq %rbp
   *   0x38b4c1  movq  %rsp, %rbp
   *   0x38b4c4  pushq %rbx
   *   0x38b4c5  pushq %rax                          ; align stack
   *   0x38b4c6  movq  %rdi, %rbx                    ; save this
   *   0x38b4c9  callq OZSimulationBehavior::operator=(OZBehavior const&)
   *   0x38b4ce  movq  $0x0, 0x148(%rbx)             ; this->channelObjectRoot = nullptr
   *   0x38b4d9  addq  $0x8, %rsp
   *   0x38b4dd  popq  %rbx
   *   0x38b4de  popq  %rbp
   *   0x38b4df  retq
   */
  assign(rhs: OZBehavior, base: OZSimulationBehaviorLike): void {
    base.assignFromBehavior(rhs);
    this.channelObjectRoot = null;
  }

  /**
   * didAddToNode(OZSceneNode*) — @Ozone 0x38b6a0.
   *
   *   0x38b6a0  pushq %rbp
   *   0x38b6a1  movq  %rsp, %rbp
   *   0x38b6a4  pushq %r14
   *   0x38b6a6  pushq %rbx
   *   0x38b6a7  movq  %rsi, %rbx                    ; %rbx = node
   *   0x38b6aa  movq  %rdi, %r14                    ; %r14 = this
   *   0x38b6ad  callq OZSimulationBehavior::didAddToNode(OZSceneNode*)
   *   0x38b6b2  movq  (%rbx), %rax                  ; %rax = node vtable
   *   0x38b6b5  movq  %rbx, %rdi                    ; arg = node
   *   0x38b6b8  callq *0x280(%rax)                  ; node->vtable[0x280]
   *   0x38b6be  movq  %rax, %rdi                    ; arg = returned ptr
   *   0x38b6c1  movq  %r14, %rsi                    ; arg = this (as OZSimulationBehavior*)
   *   0x38b6c4  callq OZChannelObjectRoot::addBehavior(OZSimulationBehavior*)
   *   0x38b6c9  movq  (%r14), %rax                  ; %rax = this vtable
   *   0x38b6cc  movq  %r14, %rdi                    ; arg = this
   *   0x38b6cf  callq *0x2d8(%rax)                  ; this->vtable[0x2d8]
   *   0x38b6d5  movq  %rax, 0x148(%r14)             ; this->channelObjectRoot = returned ptr
   *   0x38b6dc  popq  %rbx / r14 / rbp; retq
   *
   * The two vtable calls (*0x280 on node, *0x2d8 on this) are frontier stubs — their concrete
   * targets depend on the runtime class installed there.  We faithfully preserve the CALL SEQUENCE
   * but forward them through injected callables so the deferral is loud AND typed.
   *
   * @param node scene node to attach to
   * @param base   view of this as OZSimulationBehavior* (for the parent didAddToNode call)
   * @param nodeChannelRootGetter  frontier callable for `node->vtable[0x280]` — returns the
   *                               OZChannelObjectRoot* that owns the node's channels
   * @param selfChannelRootFetch   frontier callable for `this->vtable[0x2d8]` — returns the
   *                               OZChannelObjectRoot* cached on this behavior after add
   */
  didAddToNode(
    node: OZSceneNode,
    base: OZSimulationBehaviorLike,
    nodeChannelRootGetter: (n: OZSceneNode) => OZChannelObjectRoot,
    selfChannelRootFetch: () => OZChannelObjectRoot,
  ): void {
    // 0x38b6ad — parent didAddToNode
    base.didAddToNode(node);
    // 0x38b6b8 — node->vtable[0x280] — get the node's OZChannelObjectRoot
    const root: OZChannelObjectRoot = nodeChannelRootGetter(node);
    // 0x38b6c4 — root->addBehavior(this)
    root.addBehavior(this as unknown as OZSimulationBehaviorLike);
    // 0x38b6cf — this->vtable[0x2d8] — returns the OZChannelObjectRoot* to cache
    const cached: OZChannelObjectRoot = selfChannelRootFetch();
    // 0x38b6d5 — store
    this.channelObjectRoot = cached;
  }

  /**
   * willRemove() — @Ozone 0x38b6f0.
   *
   *   0x38b6f0  pushq %rbp
   *   0x38b6f1  movq  %rsp, %rbp
   *   0x38b6f4  pushq %rbx
   *   0x38b6f5  pushq %rax
   *   0x38b6f6  movq  %rdi, %rbx                    ; save this
   *   0x38b6f9  movq  (%rdi), %rax                  ; this vtable
   *   0x38b6fc  callq *0x140(%rax)                  ; this->vtable[0x140]
   *   0x38b702  movq  (%rax), %rcx                  ; returned obj's vtable
   *   0x38b705  movq  %rax, %rdi                    ; arg = returned obj
   *   0x38b708  callq *0x280(%rcx)                  ; obj->vtable[0x280]
   *   0x38b70e  movq  %rax, %rdi                    ; arg = channel root
   *   0x38b711  movq  %rbx, %rsi                    ; arg = this
   *   0x38b714  callq OZChannelObjectRoot::removeBehavior(OZSimulationBehavior*)
   *   0x38b719  movq  $0x0, 0x148(%rbx)             ; this->channelObjectRoot = nullptr
   *   0x38b724  addq  $0x8, %rsp; popq %rbx/%rbp; retq
   *
   * Same shape as `didAddToNode` but in reverse: walks *0x140 -> *0x280 to get the
   * ChannelObjectRoot, removes `this`, then nulls the cache field.  The two vtable slots
   * are frontier stubs.
   */
  willRemove(
    selfSceneNodeGetter: () => OZSceneNode,
    nodeChannelRootGetter: (n: OZSceneNode) => OZChannelObjectRoot,
  ): void {
    // 0x38b6fc — this->vtable[0x140] — get owning scene node
    const node: OZSceneNode = selfSceneNodeGetter();
    // 0x38b708 — node->vtable[0x280] — get channel root
    const root: OZChannelObjectRoot = nodeChannelRootGetter(node);
    // 0x38b714 — root->removeBehavior(this)
    root.removeBehavior(this as unknown as OZSimulationBehaviorLike);
    // 0x38b719 — clear cache
    this.channelObjectRoot = null;
  }

  /**
   * areOwnersAnimated(OZSceneNode*) — @Ozone 0x38e670.
   *
   *   0x38e670  pushq %rbp; movq %rsp,%rbp
   *   0x38e674  pushq %r14; pushq %rbx
   *   0x38e677  movq  %rsi, %rbx                    ; %rbx = node (loop cursor)
   *   0x38e680:  movq  %rbx, %r14                    ; %r14 = cursor snapshot (last-visited)
   *   0x38e683  testq %rbx, %rbx
   *   0x38e686  je    0x38e69b                       ; cursor==null -> exit loop
   *   0x38e688  movq  0x3b8(%r14), %rbx             ; cursor = cursor->parent  (field @+0x3b8)
   *   0x38e68f  movq  %rbx, %rsi
   *   0x38e692  callq OZSimSystemMoToFoBehavior::isSceneNodeAnimated(OZSceneNode*)
   *   0x38e697  testb %al, %al
   *   0x38e699  je    0x38e680                       ; !animated -> keep walking
   *   0x38e69b:  testq %r14, %r14
   *   0x38e69e  setne %al                             ; return (lastVisited != nullptr)
   *   0x38e6a1  popq %rbx/%r14/%rbp; retq
   *
   * Walks the parent chain of `node` via the OZSceneNode field at +0x3b8 (`parent`).  For each
   * cursor it (a) advances to its parent and (b) asks `isSceneNodeAnimated(parent)`.  The loop
   * exits when either (i) the cursor becomes null (no parent) or (ii) `isSceneNodeAnimated`
   * returns true.  Result = (last-visited cursor != null), i.e. it returns TRUE iff we exited via
   * `isSceneNodeAnimated` returning true on a non-null parent, and FALSE iff we walked to the
   * root without finding any animated ancestor.
   *
   * The scene-node parent field @+0x3b8 is a genuine frontier item; we thread it through a
   * callable so this port stays faithful without inventing an OZSceneNode layout.
   *
   * NOTE: this method also calls `this.isSceneNodeAnimated`, which is a throwing stub in this
   * port (see below).  The typical call graph is: caller -> areOwnersAnimated -> isSceneNodeAnimated
   * -> OZBehavior::IsChannelAffectedByBehaviors (frontier).
   */
  areOwnersAnimated(
    node: OZSceneNode | null,
    parentOf: (n: OZSceneNode) => OZSceneNode | null,
  ): boolean {
    // %rbx = cursor = node
    let cursor: OZSceneNode | null = node;
    // %r14 tracks the "last snapshot before we advanced".  Match the disasm exactly.
    let lastVisited: OZSceneNode | null = null;
    while (true) {
      // 0x38e680: %r14 = %rbx (snapshot BEFORE any advance)
      lastVisited = cursor;
      // 0x38e683/86: cursor==null -> exit
      if (cursor === null) break;
      // 0x38e688: cursor = cursor->parent  (field @+0x3b8)
      cursor = parentOf(cursor);
      // 0x38e692: call isSceneNodeAnimated on the NEW cursor value
      const animated = this.isSceneNodeAnimated(cursor);
      // 0x38e697/99: animated -> exit; !animated -> keep walking
      if (animated) break;
    }
    // 0x38e69b/9e: return (lastVisited != null)  (i.e. we entered the loop at least once with a
    // non-null starting node).  Equivalent to: setne on the last %r14.
    return lastVisited !== null;
  }

  // ---------------------------------------------------------------------------
  // Frontier stubs — bodies not yet transcribed.  Each cites its @0xADDR so the ledger
  // still shows the gap and the anti-shortcut gate can see the deferral.
  // ---------------------------------------------------------------------------

  /**
   * isSceneNodeAnimated(OZSceneNode*) — @Ozone 0x38e570.
   *
   * 67-line body:
   *   - `___dynamic_cast` on the arg to OZTransformNode*.
   *   - if the cast succeeds, calls six flavours of animation-checks:
   *       - two virtual-slot *0x230 dispatches on channel objects at +0x4b8 and +0x830
   *       - four `OZBehavior::IsChannelAffectedByBehaviors(<channel@+0x540..0x950>, true)` calls
   *       - a tail-call `IsChannelAffectedByBehaviors(<channel@+0x9e8>, true)`.
   *   - returns true if any of the checks fires.
   *
   * Defer: `OZBehavior::IsChannelAffectedByBehaviors` and OZSceneNode/OZTransformNode field
   * layouts are separate ledger items.
   */
  isSceneNodeAnimated(_node: OZSceneNode | null): boolean {
    throw new Error(
      "OZSimSystemMoToFoBehavior::isSceneNodeAnimated(OZSceneNode*) @0x38e570 not yet transcribed",
    );
  }

  /**
   * updateCache() — @Ozone 0x38e6b0.
   *
   * 85-line body that sets `+0x150 = 1` and `+0x198 = 1`, then calls `this->vtable[0x150]` to
   * fetch some object, reads a double at +0xb0 of it into `+0x190` of this, then walks either
   * `+0x148` (channelObjectRoot) or a fresh vtable lookup to update several channel values.
   *
   * Defer — the parent OZSimulationBehavior fields (+0x150/+0x190/+0x198) are not yet decoded.
   */
  updateCache(): void {
    throw new Error(
      "OZSimSystemMoToFoBehavior::updateCache() @0x38e6b0 not yet transcribed",
    );
  }

  /**
   * findCachedValues(double(*)[3], PCQuat<double>*, bool*, int, CMTime, CMTime) — @Ozone 0x38b4e0.
   *
   * 104-line body that reads out the cached Vec3/Quat/valid-flag arrays for a time-range query.
   */
  findCachedValues(
    _outVec3: number[][],
    _outQuat: PCQuatDouble,
    _outValid: boolean[],
    _count: number,
    _t0: CMTime,
    _t1: CMTime,
  ): void {
    throw new Error(
      "OZSimSystemMoToFoBehavior::findCachedValues @0x38b4e0 not yet transcribed",
    );
  }

  /**
   * accumForces(OZSimStateArray*, OZTransformNode*) — @Ozone 0x38d4b0.
   *
   * 216-line body that accumulates the motion-follow force term into the sim state array.  This
   * is the core physics inner loop for this behavior.
   */
  accumForces(_arr: OZSimStateArray, _node: OZTransformNode): void {
    throw new Error(
      "OZSimSystemMoToFoBehavior::accumForces(OZSimStateArray*, OZTransformNode*) @0x38d4b0 not yet transcribed",
    );
  }

  /**
   * accumInitialValues(OZSimStateArray*, int, OZTransformNode*) — @Ozone 0x38e1a0.
   *
   * 183-line body that seeds the sim state array's initial pose/velocity for a given transform.
   */
  accumInitialValues(_arr: OZSimStateArray, _index: number, _node: OZTransformNode): void {
    throw new Error(
      "OZSimSystemMoToFoBehavior::accumInitialValues(OZSimStateArray*, int, OZTransformNode*) @0x38e1a0 not yet transcribed",
    );
  }

  /**
   * calcParentsDerivatives(OZSimulationState*) — @Ozone 0x38b750.
   *
   * 1223-line body computing d/dt of the parent-transform-derived state values.  The bulk of the
   * "motion-to-follow" physics lives here.
   */
  calcParentsDerivatives(_state: OZSimulationState): void {
    throw new Error(
      "OZSimSystemMoToFoBehavior::calcParentsDerivatives(OZSimulationState*) @0x38b750 not yet transcribed",
    );
  }

  /**
   * calcParentsInitialValues(OZSimulationState*) — @Ozone 0x38d930.
   *
   * 393-line body computing the initial parent-derived pose/velocity for the sim state.
   */
  calcParentsInitialValues(_state: OZSimulationState): void {
    throw new Error(
      "OZSimSystemMoToFoBehavior::calcParentsInitialValues(OZSimulationState*) @0x38d930 not yet transcribed",
    );
  }

  // ---------------------------------------------------------------------------
  // Constructors & destructors — deferred (bodies chain into OZSimulationBehavior ctors and
  // initialise many OZChannel*s not yet in the port).
  // ---------------------------------------------------------------------------

  /**
   * OZSimSystemMoToFoBehavior(OZFactory*, PCString const&, unsigned int) —
   *   C2 @Ozone 0x38ad20 / C1 @Ozone 0x38af40.
   */
  static ctorFromFactory(_factory: OZFactory, _name: PCString, _flags: number): OZSimSystemMoToFoBehavior {
    throw new Error(
      "OZSimSystemMoToFoBehavior::OZSimSystemMoToFoBehavior(OZFactory*, PCString const&, unsigned int) @0x38ad20 / @0x38af40 not yet transcribed",
    );
  }

  /**
   * OZSimSystemMoToFoBehavior(OZSimSystemMoToFoBehavior&, unsigned int) —
   *   C2 @Ozone 0x38af50 / C1 @Ozone 0x38b170.
   */
  static ctorCopy(_src: OZSimSystemMoToFoBehavior, _flags: number): OZSimSystemMoToFoBehavior {
    throw new Error(
      "OZSimSystemMoToFoBehavior::OZSimSystemMoToFoBehavior(OZSimSystemMoToFoBehavior&, unsigned int) @0x38af50 / @0x38b170 not yet transcribed",
    );
  }

  /**
   * ~OZSimSystemMoToFoBehavior() — D2 @Ozone 0x38b180 / D1 @Ozone 0x38b1f0 / D0 @Ozone 0x38b340.
   */
  dtor(): void {
    throw new Error(
      "OZSimSystemMoToFoBehavior::~OZSimSystemMoToFoBehavior() @0x38b180 / @0x38b1f0 / @0x38b340 not yet transcribed",
    );
  }
}
