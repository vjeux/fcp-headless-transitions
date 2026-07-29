// OZAlignToBehavior — Ozone alignment behavior that aligns a source object to a target
// scene node (position + rotation), with per-channel mix factor over CMTime.
//
// Transcribed from the x86_64 disassembly of Ozone in
// /Applications/Final Cut Pro.app/Contents/Frameworks/Ozone.framework/Versions/A/Ozone.
//
// FAITHFUL PORT — do NOT approximate, do NOT guess. Every method cites @Ozone 0xADDR read from
// the disassembly under raw-port/re/disasm/OZAlignToBehavior.<method>.s and any un-decoded
// frontier is a throwing stub that names the source address so the gap is loud.
//
// STRUCT LAYOUT (recovered from decoded methods that actually touch fields)
// -----------------------------------------------------------------------------------
//   +0x0000   vptr                       — vtable (dispatched at 0x140, 0x150, 0x268, 0x298)
//   +0x0030   OZChannelFolder            — chained in finishInitializing @0x4c35da
//   +0x0048   int32   lockingID          — returned by getLockingID @0x4c5c34
//   +0x0218   OZLocking                  — willRemoveSceneNodeFromScene calls
//                                          removeFromLockingGroup on this @0x4c371e
//   +0x02e0   OZChanSceneNodeRef  sourceRef  — getSourceObject calls getNode on this @0x4c3574
//                                              notify reads getObjectID @0x4c34ad
//                                              finishInitializing @0x4c35ea
//   +0x0380   OZChannelEnum   alignmentChannel — didAddToNode -> updateAlignmentChannel @0x4c2efa,
//                                              isRebuildUIChannel @0x4c5854
//   +0x0640   OZChannelEnum   secondaryAlignmentChannel  — finishInitializing @0x4c35e3,
//                                              isRebuildUIChannel @0x4c5861, notify @0x4c34c5
//   +0x0c78   OZChannelBase*  thirdRebuildChannel  — isRebuildUIChannel @0x4c5870
//   +0x0e10   OZChannelBase*  fourthRebuildChannel — isRebuildUIChannel @0x4c5883
//   +0x0fa8   OZChannel*      mixFactorChannel  — computeMixFactor -> getValueAsDouble @0x4c3dad
//   +0x10d8   int32           lastNotifiedObjectID  — notify compares/writes @0x4c34b2/0x4c3500
//   +0x10e0   CMTime          cache_A_time  — dirty() invalidates @0x4c3760
//   +0x1178   CMTime          cache_B_time  — dirty() invalidates @0x4c376d
//   +0x1210   CMTime          cache_C_time  — dirty() invalidates @0x4c3782
//
// Vtable slot dispatches observed:
//   *(vptr + 0x140)  ->  "get owning-scene-node" (returns SceneNode*)      @0x4c3677
//   *(vptr + 0x150)  ->  "getScene()"                                      @0x4c3495
//   *(vptr + 0x268)  ->  "computeAlignmentWindowStart(CMTime*)"            @0x4c3d95
//   *(vptr + 0x298)  ->  "getFactoryBase()"                                @0x4c36bc

import type { CMTime } from "../infra/CMTime.js";

// -----------------------------------------------------------------------------
// Frontier types
// -----------------------------------------------------------------------------

/** OZSceneNode — Ozone scene-graph node base. @provenance Ozone typeinfo __ZTI11OZSceneNode ref'd @0x4c3585. */
export interface OZSceneNode { readonly __ozSceneNode: unique symbol }

/** OZTransformNode — subclass of OZSceneNode. @provenance Ozone typeinfo __ZTI15OZTransformNode @0x4c358c. */
export interface OZTransformNode extends OZSceneNode { readonly __ozTransformNode: unique symbol }

/** OZScene — scene container. @provenance Ozone @0x4c3719. */
export interface OZScene { readonly __ozScene: unique symbol }

/** OZChannelBase — channel base for isRebuildUIChannel identity compares. @provenance Ozone @0x4c5850. */
export interface OZChannelBase { readonly __ozChannelBase: unique symbol }

/** OZChanObjectManipRef — channel ref to object manipulator. @provenance Ozone @0x4c34ad. */
export interface OZChanObjectManipRef {
  /** OZChanObjectManipRef::getObjectID() const -> int32. */
  getObjectID(): number;
}

/** OZChanSceneNodeRef — channel ref to scene node. @provenance Ozone @0x4c3574. */
export interface OZChanSceneNodeRef extends OZChanObjectManipRef {
  /** OZChanSceneNodeRef::getNode() const -> OZSceneNode* (null if unset). */
  getNode(): OZSceneNode | null;
}

/** OZObjectManipulator — opaque frontier. @provenance Ozone @0x4c3800/0x4c3970 (param only). */
export interface OZObjectManipulator { readonly __ozObjectManipulator: unique symbol }

/** OZGroup — scene node group. @provenance Ozone @0x4c3860. */
export interface OZGroup { readonly __ozGroup: unique symbol }

/** OZLocking — locking-graph node at +0x218. @provenance Ozone @0x4c371e-0x4c372e. */
export interface OZLocking {
  /** OZLocking::removeFromLockingGroup() @0x4c372e (tail-called). */
  removeFromLockingGroup(): void;
}

/** OZCurveNodeParam — solveNode(u32, OZCurveNodeParam&) param. @provenance Ozone @0x4c3b60. */
export interface OZCurveNodeParam { readonly __ozCurveNodeParam: unique symbol }

/** OZRenderState — render-state block. @provenance Ozone @0x4c4960. */
export interface OZRenderState { readonly __ozRenderState: unique symbol }

/** OZChannel — Ozone parameter channel. @provenance Ozone @0x4c3dc1. */
export interface OZChannel {
  /** OZChannel::getValueAsDouble(CMTime const&, double) const  __ZNK9OZChannel16getValueAsDoubleERK6CMTimed. */
  getValueAsDouble(t: CMTime, tolerance: number): number;
}

// -----------------------------------------------------------------------------
// The port
// -----------------------------------------------------------------------------

/**
 * OZAlignToBehavior — the "Align To" object behavior. Aligns a source scene node
 * (from +0x2e0 sourceRef) to a target scene node (from vtable slot 0x140) over a
 * CMTime range, mixing via +0xfa8 mixFactorChannel.
 *
 * @provenance Ozone 0x4c2ee0..0x4c5c39 (class byte range).
 */
export class OZAlignToBehavior {
  /** lockingID @+0x48. @provenance Ozone @0x4c5c34 `movl 0x48(%rdi), %eax`. */
  lockingID!: number;

  /** sourceRef @+0x2e0. @provenance Ozone @0x4c3574 `addq $0x2e0, %rdi`. */
  sourceRef!: OZChanSceneNodeRef;

  /** alignmentChannel @+0x380. @provenance Ozone @0x4c2efa, @0x4c5854. */
  alignmentChannel!: OZChannelBase;

  /** secondaryAlignmentChannel @+0x640. @provenance Ozone @0x4c35e3, @0x4c34c5, @0x4c5861. */
  secondaryAlignmentChannel!: OZChannelBase;

  /** thirdRebuildChannel @+0xc78. @provenance Ozone @0x4c5870 `leaq 0xc78(%rdi), %rax`. */
  thirdRebuildChannel!: OZChannelBase;

  /** fourthRebuildChannel @+0xe10. @provenance Ozone @0x4c5883 `addq $0xe10, %rdi`. */
  fourthRebuildChannel!: OZChannelBase;

  /** mixFactorChannel @+0xfa8. @provenance Ozone @0x4c3dad `leaq 0xfa8(%r14), %rdi`. */
  mixFactorChannel!: OZChannel;

  /** locking @+0x218. @provenance Ozone @0x4c371e `addq $0x218, %rbx`. */
  locking!: OZLocking;

  /** cache_A_time @+0x10e0 (CMTime, invalidated by dirty()). @provenance Ozone @0x4c3760. */
  cache_A_time!: CMTime;

  /** cache_B_time @+0x1178 (CMTime, invalidated by dirty()). @provenance Ozone @0x4c376d. */
  cache_B_time!: CMTime;

  /** cache_C_time @+0x1210 (CMTime, invalidated by dirty()). @provenance Ozone @0x4c3782. */
  cache_C_time!: CMTime;

  // ---------------------------------------------------------------------------
  // getBoundsType(int) — @Ozone 0x4c3d50 — 15-entry LUT decoded from rodata.
  // ---------------------------------------------------------------------------

  /**
   * getBoundsType(arg) — @Ozone 0x4c3d50.
   *
   *   pushq %rbp; movq %rsp,%rbp
   *   addl  \$-0xe, %edi                   ; idx = arg - 0xe (as u32)
   *   movl  \$0x3, %eax                    ; default return = 3
   *   cmpl  \$0xe, %edi
   *   ja    0x4c3d6d                       ; unsigned idx > 0xe -> keep default
   *   movl  %edi, %eax
   *   leaq  0x24adbe(%rip), %rcx           ; rcx = &LUT @0x70eb28
   *   movl  (%rcx,%rax,4), %eax            ; eax = LUT[idx]
   *   popq  %rbp; retq
   *
   * LUT @0x70eb28 (15 x int32; read verbatim from Ozone __TEXT/__const at file
   * offset 7361408 + (0x70eb28-0x705380) = 0x71260c):
   *
   *   arg  0xe (14) -> 1     arg 0x14 (20) -> 0     arg 0x1a (26) -> 2
   *   arg  0xf (15) -> 1     arg 0x15 (21) -> 0     arg 0x1b (27) -> 2
   *   arg 0x10 (16) -> 1     arg 0x16 (22) -> 0     arg 0x1c (28) -> 2
   *   arg 0x11 (17) -> 1     arg 0x17 (23) -> 0
   *   arg 0x12 (18) -> 1     arg 0x18 (24) -> 0
   *   arg 0x13 (19) -> 1     arg 0x19 (25) -> 0
   *
   * @provenance Ozone @0x4c3d50-0x4c3d6e ; LUT rodata @0x70eb28.
   */
  getBoundsType(arg: number): number {
    const idx = (arg - 0xe) >>> 0; // @0x4c3d54 addl $-0xe / unsigned wrap
    if (idx > 0xe) {
      return 3; // @0x4c3d57 default `movl $0x3, %eax`
    }
    // @0x4c3d63 rip-rel LUT @0x70eb28 verbatim:
    const LUT: readonly number[] = [
      1, 1, 1, 1, 1, 1, // idx 0..5   (arg 0xe..0x13)
      0, 0, 0, 0, 0, 0, // idx 6..11  (arg 0x14..0x19)
      2, 2, 2,          // idx 12..14 (arg 0x1a..0x1c)
    ] as const;
    return LUT[idx]!;
  }

  // ---------------------------------------------------------------------------
  // isRebuildUIChannel(OZChannelBase*) — @Ozone 0x4c5850 — 4-way pointer identity.
  // ---------------------------------------------------------------------------

  /**
   * isRebuildUIChannel(chan) — @Ozone 0x4c5850.
   *
   *   ; rdi=this, rsi=chan
   *   leaq 0x380(%rdi), %rax; cmpq %rax, %rsi; sete %al    ; chan == &alignmentChannel?
   *   leaq 0x640(%rdi), %rcx; cmpq %rcx, %rsi; sete %cl    ; chan == &secondaryAlignmentChannel?
   *   orb  %al, %cl
   *   leaq 0xc78(%rdi), %rax; cmpq %rax, %rsi; sete %al    ; chan == &thirdRebuildChannel?
   *   orb  %cl, %al
   *   movb \$0x1, %al                                       ; preload true return
   *   jne  epilogue                                         ; if any matched -> return true
   *   addq \$0xe10, %rdi; cmpq %rdi, %rsi; sete %al          ; else al = (chan == &fourthRebuildChannel)
   *   ; epilogue:
   *
   * Returns true iff chan points at one of the four class-owned channel sub-objects.
   *
   * @provenance Ozone @0x4c5850-0x4c5891.
   */
  isRebuildUIChannel(chan: OZChannelBase): boolean {
    return (
      chan === (this.alignmentChannel as unknown as OZChannelBase)          || // @+0x380
      chan === (this.secondaryAlignmentChannel as unknown as OZChannelBase) || // @+0x640
      chan === (this.thirdRebuildChannel as unknown as OZChannelBase)       || // @+0xc78
      chan === (this.fourthRebuildChannel as unknown as OZChannelBase)         // @+0xe10
    );
  }

  // ---------------------------------------------------------------------------
  // Trivial accessors
  // ---------------------------------------------------------------------------

  /**
   * getLockingID() — @Ozone 0x4c5c30.
   *   pushq %rbp; movq %rsp,%rbp
   *   movl 0x48(%rdi), %eax          ; return this->lockingID (int32 @+0x48)
   *   popq %rbp; retq
   * @provenance Ozone @0x4c5c34 `movl 0x48(%rdi), %eax`.
   */
  getLockingID(): number {
    return this.lockingID;
  }

  /**
   * getBehavior() — @Ozone 0x4c5c20.
   *   pushq %rbp; movq %rsp,%rbp
   *   movq %rdi, %rax                ; return this
   *   popq %rbp; retq
   * @provenance Ozone @0x4c5c24 `movq %rdi, %rax`.
   */
  getBehavior(): OZAlignToBehavior {
    return this;
  }

  /**
   * hideShowChannelsInHUD() — @Ozone 0x4c5c10.
   *   pushq %rbp; movq %rsp,%rbp
   *   movb \$0x1, %al                ; return true
   *   popq %rbp; retq
   * @provenance Ozone @0x4c5c14 `movb $0x1, %al`.
   */
  hideShowChannelsInHUD(): boolean {
    return true;
  }

  // ---------------------------------------------------------------------------
  // getSourceObject/getTargetObject — dynamic_cast wrappers.
  // ---------------------------------------------------------------------------

  /**
   * getSourceObject() const — @Ozone 0x4c3570.
   *
   *   ; rdi=this
   *   addq \$0x2e0, %rdi                                    ; rdi = &this->sourceRef
   *   callq OZChanSceneNodeRef::getNode() const             ; -> rax = OZSceneNode*
   *   testq %rax, %rax; je null_ret
   *   leaq  __ZTI11OZSceneNode(%rip), %rsi
   *   leaq  __ZTI15OZTransformNode(%rip), %rdx
   *   movq  %rax, %rdi; xorl %ecx, %ecx
   *   jmp   ___dynamic_cast                                 ; tail-call
   *   ; null_ret: xorl %eax,%eax; retq
   *
   * @provenance Ozone @0x4c3574-0x4c3599.
   */
  getSourceObject(): OZTransformNode | null {
    const node = this.sourceRef.getNode(); // @0x4c357b
    if (node === null) return null;         // @0x4c359e `xorl %eax, %eax`
    return dynamicCastToOZTransformNode(node); // @0x4c3596-0x4c3599 tail-call
  }

  /**
   * getTargetObject() — @Ozone 0x4c3670. Non-const overload.
   *
   *   ; rdi=this
   *   movq (%rdi), %rax                                     ; rax = this->vptr
   *   callq *0x140(%rax)                                    ; -> OZSceneNode* "target owner"
   *   testq %rax, %rax; je null_ret
   *   leaq __ZTI11OZSceneNode(%rip), %rsi
   *   leaq __ZTI15OZTransformNode(%rip), %rdx
   *   movq %rax, %rdi; xorl %ecx, %ecx
   *   jmp  ___dynamic_cast
   *   ; null_ret: xorl %eax,%eax; retq
   *
   * @provenance Ozone @0x4c3674-0x4c369e.
   */
  getTargetObject(): OZTransformNode | null {
    const node = this._vcall_getTargetOwnerSceneNode(); // @0x4c3677 `callq *0x140(%rax)`
    if (node === null) return null;                       // @0x4c369b
    return dynamicCastToOZTransformNode(node);
  }

  // ---------------------------------------------------------------------------
  // willRemoveSceneNodeFromScene — chain base + tail-call locking removal.
  // ---------------------------------------------------------------------------

  /**
   * willRemoveSceneNodeFromScene(scene) — @Ozone 0x4c3710.
   *
   *   callq OZChannelBehavior::willRemoveSceneNodeFromScene(OZScene*)   ; base-chain
   *   addq  \$0x218, %rbx                                                ; rbx = &this->locking
   *   movq  %rbx, %rdi
   *   jmp   OZLocking::removeFromLockingGroup()                         ; tail-call
   *
   * @provenance Ozone @0x4c3719 / @0x4c371e / @0x4c372e.
   */
  willRemoveSceneNodeFromScene(scene: OZScene): void {
    this._base_willRemoveSceneNodeFromScene(scene); // @0x4c3719
    this.locking.removeFromLockingGroup();          // @0x4c371e-0x4c372e
  }

  // ---------------------------------------------------------------------------
  // dirty() — chain base then invalidate three CMTime caches.
  // ---------------------------------------------------------------------------

  /**
   * dirty() — @Ozone 0x4c3740.
   *
   *   callq OZBehavior::dirty()                                    ; base-chain
   *   movq  _kCMTimeInvalid@GOTPCREL(%rip), %rax                   ; rax = &kCMTimeInvalid
   *   ; write kCMTimeInvalid (16 B + trailing 8 B epoch) into three cache slots:
   *   movups (%rax), %xmm0; movups %xmm0, 0x10e0(%rbx); movq 0x10(%rax), %rcx; movq %rcx, 0x10f0(%rbx)
   *   movups (%rax), %xmm0; movups %xmm0, 0x1178(%rbx); movq 0x10(%rax), %rcx; movq %rcx, 0x1188(%rbx)
   *   movups (%rax), %xmm0; movups %xmm0, 0x1210(%rbx); movq 0x10(%rax), %rax; movq %rax, 0x1220(%rbx)
   *
   * The 16-byte movups covers CMTime's { value @+0 : i64, timescale @+8 : i32,
   * flags @+0xc : u32 }; the trailing 8-byte movq covers the epoch @+0x10.
   *
   * @provenance Ozone @0x4c3740-0x4c379a.
   */
  dirty(): void {
    this._base_dirty();               // @0x4c3749
    const invalid = kCMTimeInvalid(); // @0x4c374e load of &kCMTimeInvalid
    this.cache_A_time = { ...invalid }; // @+0x10e0 (@0x4c3760) + @+0x10f0 (@0x4c3759)
    this.cache_B_time = { ...invalid }; // @+0x1178 (@0x4c376d) + @+0x1188 (@0x4c3778)
    this.cache_C_time = { ...invalid }; // @+0x1210 (@0x4c3782) + @+0x1220 (@0x4c378d)
  }

  // ---------------------------------------------------------------------------
  // didAddToNode — chain base, run setupCurveNodes, tail-call updateAlignmentChannel.
  // ---------------------------------------------------------------------------

  /**
   * didAddToNode(node) — @Ozone 0x4c2ee0.
   *
   *   callq OZChannelBehavior::didAddToNode(OZSceneNode*)           ; base-chain
   *   callq OZAlignToBehavior::setupCurveNodes()                    ; @0x4c2f10
   *   addq  \$0x380, %r14                                            ; r14 = &alignmentChannel
   *   movq  %r14, %rdi; movq %rbx, %rsi
   *   jmp   updateAlignmentChannel(OZChannelEnum&, OZSceneNode*)   ; tail-call
   *
   * @provenance Ozone @0x4c2eed / @0x4c2ef5 / @0x4c2f0b.
   */
  didAddToNode(node: OZSceneNode): void {
    this._base_didAddToNode(node);                       // @0x4c2eed
    this.setupCurveNodes();                              // @0x4c2ef5
    updateAlignmentChannel(this.alignmentChannel, node); // @0x4c2f0b
  }

  // ---------------------------------------------------------------------------
  // Frontier stubs — full transcription deferred; every stub cites @0xADDR.
  // ---------------------------------------------------------------------------

  /** setupCurveNodes() — @Ozone 0x4c2f10 (157-line body). @provenance Ozone @0x4c2f10. */
  setupCurveNodes(): void {
    throw new Error("OZAlignToBehavior::setupCurveNodes() @0x4c2f10 not yet transcribed");
  }

  /** notify(unsigned) — @Ozone 0x4c3470 (78-line body). @provenance Ozone @0x4c3470. */
  notify(_flags: number): void {
    throw new Error("OZAlignToBehavior::notify(unsigned int) @0x4c3470 not yet transcribed");
  }

  /** finishInitializing() — @Ozone 0x4c35d0. @provenance Ozone @0x4c35d0. */
  finishInitializing(): void {
    throw new Error("OZAlignToBehavior::finishInitializing() @0x4c35d0 not yet transcribed");
  }

  /** canAddToSceneNode(OZSceneNode*) — @Ozone 0x4c36a0. Checks factory isKindOfClass against 2 PCUUIDs. @provenance Ozone @0x4c36a0. */
  canAddToSceneNode(_node: OZSceneNode): boolean {
    throw new Error("OZAlignToBehavior::canAddToSceneNode(OZSceneNode*) @0x4c36a0 not yet transcribed");
  }

  /** getEvalDepChansForRef(...) const — @Ozone 0x4c3800. @provenance Ozone @0x4c3800. */
  getEvalDepChansForRef(_ref: OZChanObjectManipRef, _manip: OZObjectManipulator, _out: unknown): void {
    throw new Error("OZAlignToBehavior::getEvalDepChansForRef(...) @0x4c3800 not yet transcribed");
  }

  /** getEvalDepChansForGroup(OZGroup const*, list*) const — @Ozone 0x4c3860. @provenance Ozone @0x4c3860. */
  getEvalDepChansForGroup(_group: OZGroup, _out: unknown): void {
    throw new Error("OZAlignToBehavior::getEvalDepChansForGroup(OZGroup const*, list*) @0x4c3860 not yet transcribed");
  }

  /** canChanRefBeSetTo(...) const — @Ozone 0x4c3970. @provenance Ozone @0x4c3970. */
  canChanRefBeSetTo(_ref: OZChanObjectManipRef, _manip: OZObjectManipulator): boolean {
    throw new Error("OZAlignToBehavior::canChanRefBeSetTo(...) @0x4c3970 not yet transcribed");
  }

  /** getTargetObject() const — @Ozone 0x4c3a10. Const overload (distinct symbol). @provenance Ozone @0x4c3a10. */
  getTargetObjectConst(): OZTransformNode | null {
    throw new Error("OZAlignToBehavior::getTargetObject() const @0x4c3a10 not yet transcribed");
  }

  /** setupCurveNodeForChannel(OZChannel&, int) — @Ozone 0x4c3ae0. @provenance Ozone @0x4c3ae0. */
  setupCurveNodeForChannel(_chan: OZChannelBase, _i: number): void {
    throw new Error("OZAlignToBehavior::setupCurveNodeForChannel(OZChannel&, int) @0x4c3ae0 not yet transcribed");
  }

  /** solveNode(unsigned, OZCurveNodeParam&) — @Ozone 0x4c3b60. @provenance Ozone @0x4c3b60. */
  solveNodeCurve(_which: number, _param: OZCurveNodeParam): void {
    throw new Error("OZAlignToBehavior::solveNode(unsigned int, OZCurveNodeParam&) @0x4c3b60 not yet transcribed");
  }

  /** computeMixFactor(CMTime const&) — @Ozone 0x4c3d70 (274-line CMTime math). @provenance Ozone @0x4c3d70. */
  computeMixFactor(_t: CMTime): number {
    throw new Error("OZAlignToBehavior::computeMixFactor(CMTime const&) @0x4c3d70 not yet transcribed");
  }

  /** getSourceFrame(CMTime const&) — @Ozone 0x4c4050. @provenance Ozone @0x4c4050. */
  getSourceFrame(_t: CMTime): CMTime {
    throw new Error("OZAlignToBehavior::getSourceFrame(CMTime const&) @0x4c4050 not yet transcribed");
  }

  /** getSourceToWorldTransform(OZTransformNode*, CMTime const&) — @Ozone 0x4c41e0. @provenance Ozone @0x4c41e0. */
  getSourceToWorldTransform(_node: OZTransformNode, _t: CMTime): unknown {
    throw new Error("OZAlignToBehavior::getSourceToWorldTransform(OZTransformNode*, CMTime const&) @0x4c41e0 not yet transcribed");
  }

  /** getSourceAlignmentOffset(OZTransformNode*, CMTime const&) — @Ozone 0x4c4440. @provenance Ozone @0x4c4440. */
  getSourceAlignmentOffset(_node: OZTransformNode, _t: CMTime): unknown {
    throw new Error("OZAlignToBehavior::getSourceAlignmentOffset(OZTransformNode*, CMTime const&) @0x4c4440 not yet transcribed");
  }

  /** getSourceRotation(OZTransformNode*, OZTransformNode*, CMTime const&) — @Ozone 0x4c46c0. @provenance Ozone @0x4c46c0. */
  getSourceRotation(_a: OZTransformNode, _b: OZTransformNode, _t: CMTime): unknown {
    throw new Error("OZAlignToBehavior::getSourceRotation(OZTransformNode*, OZTransformNode*, CMTime const&) @0x4c46c0 not yet transcribed");
  }

  /** getTargetTransform(OZTransformNode*, OZRenderState const&) — @Ozone 0x4c4960. @provenance Ozone @0x4c4960. */
  getTargetTransform(_node: OZTransformNode, _rs: OZRenderState): unknown {
    throw new Error("OZAlignToBehavior::getTargetTransform(OZTransformNode*, OZRenderState const&) @0x4c4960 not yet transcribed");
  }

  /** getWorldToTargetOwnerTransform(OZTransformNode*, CMTime const&) — @Ozone 0x4c4b10. @provenance Ozone @0x4c4b10. */
  getWorldToTargetOwnerTransform(_node: OZTransformNode, _t: CMTime): unknown {
    throw new Error("OZAlignToBehavior::getWorldToTargetOwnerTransform(OZTransformNode*, CMTime const&) @0x4c4b10 not yet transcribed");
  }

  /** getTargetAlignmentTransform(OZTransformNode*, OZTransformNode*, CMTime const&) — @Ozone 0x4c4bf0. @provenance Ozone @0x4c4bf0. */
  getTargetAlignmentTransform(_a: OZTransformNode, _b: OZTransformNode, _t: CMTime): unknown {
    throw new Error("OZAlignToBehavior::getTargetAlignmentTransform(OZTransformNode*, OZTransformNode*, CMTime const&) @0x4c4bf0 not yet transcribed");
  }

  /** solveRotation(OZTransformNode*, OZTransformNode*, unsigned, CMTime const&, double) — @Ozone 0x4c5100. @provenance Ozone @0x4c5100. */
  solveRotation(_a: OZTransformNode, _b: OZTransformNode, _flags: number, _t: CMTime, _d: number): void {
    throw new Error("OZAlignToBehavior::solveRotation(OZTransformNode*, OZTransformNode*, unsigned int, CMTime const&, double) @0x4c5100 not yet transcribed");
  }

  /** solvePosition(OZTransformNode*, OZTransformNode*, unsigned, CMTime const&, double) — @Ozone 0x4c5190. @provenance Ozone @0x4c5190. */
  solvePosition(_a: OZTransformNode, _b: OZTransformNode, _flags: number, _t: CMTime, _d: number): void {
    throw new Error("OZAlignToBehavior::solvePosition(OZTransformNode*, OZTransformNode*, unsigned int, CMTime const&, double) @0x4c5190 not yet transcribed");
  }

  /** solveNode(unsigned, CMTime const&, double, double) — @Ozone 0x4c5440. Runtime solver. @provenance Ozone @0x4c5440. */
  solveNode(_which: number, _t: CMTime, _d1: number, _d2: number): void {
    throw new Error("OZAlignToBehavior::solveNode(unsigned int, CMTime const&, double, double) @0x4c5440 not yet transcribed");
  }

  /** updateHiddenFlags(list) — @Ozone 0x4c5660. @provenance Ozone @0x4c5660. */
  updateHiddenFlags(_list: unknown): void {
    throw new Error("OZAlignToBehavior::updateHiddenFlags(list<OZBehavior*>*) @0x4c5660 not yet transcribed");
  }

  /** getLockDependencies(OZLocking*, PCDirectedGraph*, set*) — @Ozone 0x4c58a0. @provenance Ozone @0x4c58a0. */
  getLockDependencies(_locking: OZLocking, _graph: unknown, _out: unknown): void {
    throw new Error("OZAlignToBehavior::getLockDependencies(OZLocking*, PCDirectedGraph<OZLocking*>*, set<OZLocking*>*) @0x4c58a0 not yet transcribed");
  }

  // ---------------------------------------------------------------------------
  // Base-class chain stubs (inherited virtuals called at the top of ported methods)
  // ---------------------------------------------------------------------------

  /** @provenance Ozone @0x4c2eed `callq OZChannelBehavior::didAddToNode(OZSceneNode*)`. */
  private _base_didAddToNode(_node: OZSceneNode): void {
    throw new Error("OZChannelBehavior::didAddToNode(OZSceneNode*) @0x4c2eed (Ozone base-chain) not yet transcribed");
  }

  /** @provenance Ozone @0x4c3719 `callq OZChannelBehavior::willRemoveSceneNodeFromScene(OZScene*)`. */
  private _base_willRemoveSceneNodeFromScene(_scene: OZScene): void {
    throw new Error("OZChannelBehavior::willRemoveSceneNodeFromScene(OZScene*) @0x4c3719 (Ozone base-chain) not yet transcribed");
  }

  /** @provenance Ozone @0x4c3749 `callq OZBehavior::dirty()`. */
  private _base_dirty(): void {
    throw new Error("OZBehavior::dirty() @0x4c3749 (Ozone base-chain) not yet transcribed");
  }

  /** Virtual slot *(vptr+0x140) — "get target owner scene node". @provenance Ozone @0x4c3677 `callq *0x140(%rax)`. */
  private _vcall_getTargetOwnerSceneNode(): OZSceneNode | null {
    throw new Error("OZAlignToBehavior vtable slot *(vptr+0x140) @Ozone @0x4c3677 not yet transcribed");
  }
}

// -----------------------------------------------------------------------------
// Frontier free functions
// -----------------------------------------------------------------------------

/**
 * updateAlignmentChannel(OZChannelEnum&, OZSceneNode*) — file-static, mangled
 * `__ZL22updateAlignmentChannelR13OZChannelEnumP11OZSceneNode`.
 * Tail-called by didAddToNode, finishInitializing, and notify.
 *
 * @provenance Ozone @0x4c2f0b / @0x4c361d / @0x4c3660 / @0x4c34fb.
 */
function updateAlignmentChannel(_chan: OZChannelBase, _node: OZSceneNode | null): void {
  throw new Error("updateAlignmentChannel(OZChannelEnum&, OZSceneNode*) @0x4c2f0b (Ozone file-static, tail-called by didAddToNode/finishInitializing/notify) not yet transcribed");
}

/**
 * `__dynamic_cast<OZTransformNode>(OZSceneNode*)` — thin wrapper over the
 * Itanium ABI `___dynamic_cast` (imported symbol stub @Ozone 0x6dfd0e).
 *
 * @provenance Ozone @0x4c3596-0x4c3599 tail-call pattern.
 */
function dynamicCastToOZTransformNode(_node: OZSceneNode): OZTransformNode | null {
  throw new Error("___dynamic_cast<OZTransformNode>(OZSceneNode*) @Ozone stub 0x6dfd0e not yet transcribed");
}

/**
 * kCMTimeInvalid — CoreMedia sentinel invalid time (public API). In Ozone this
 * is loaded via `movq _kCMTimeInvalid@GOTPCREL(%rip)` — used by dirty() @0x4c374e.
 * All fields zero (flags=0 -> kCMTimeFlags_Valid unset -> invalid).
 *
 * @provenance CoreMedia public API (`CMTime.h`), loaded @Ozone @0x4c374e.
 */
function kCMTimeInvalid(): CMTime {
  return { value: 0n, timescale: 0, flags: 0, epoch: 0n };
}
