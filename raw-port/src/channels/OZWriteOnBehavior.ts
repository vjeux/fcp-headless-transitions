// OZWriteOnBehavior — Ozone "Write On" behavior. Bakes per-channel keyframes onto a
// derived OZRotoshape's per-vertex curve channels so a shape appears to be drawn on
// over time.
//
// Transcribed from the x86_64 disassembly of Ozone in
// /Applications/Final Cut Pro.app/Contents/Frameworks/Ozone.framework/Versions/A/Ozone.
//
// FAITHFUL PORT — do NOT approximate, do NOT guess. Every method cites its @Ozone 0xADDR
// read from the disassembly under raw-port/re/disasm/OZWriteOnBehavior.*.s. Any un-decoded
// frontier is a THROWing stub that names the source address so the gap is loud.
//
// STRUCT LAYOUT (recovered from operator= @0x4754b0, didBake @0x4777d0, parseBegin @0x477330,
// reset @0x477260, setDefaultSpeedType @0x477230, isRebuildUIChannel @0x477210, willBake
// @0x477490, and didAddToNode @0x475630 which manipulate these fields at fixed offsets):
//
//   +0x0000   vptr                              — vtable ptr installed by C2 ctor
//   +0x0010   secondary vptr slot
//   +0x0028   tertiary vptr slot
//   +0x0138   bool     bakeActive               — set true at end of willBake @0x4777ac,
//                                                 cleared in didBake @0x47780c
//   +0x0210   OZChannelBase  ch_a               — assigned in operator= @0x4754e6
//   +0x0310   OZChannelBase  ch_b               — assigned in operator= @0x4754f9
//   +0x03a8   OZChannelBase  ch_c               — assigned in operator= @0x47550c
//   +0x0440   OZChannelBase  ch_d               — assigned in operator= @0x47551f
//   +0x0540   OZChannel      speedTypeChannel   — setDefaultSpeedType @0x477239,
//                                                 isRebuildUIChannel identity compare @0x477214,
//                                                 updateHiddenFlags reads getValueAsInt @0x477092,
//                                                 getPosition reads getValueAsInt @0x476934
//   +0x0640   OZChannel      hiddenTargetChannel — reset()/parseBegin() reset @0x477288/0x47733d,
//                                                  updateHiddenFlags enables children @0x477132,
//                                                  reset sets interpolation=4 @0x477295
//   +0x0770   OZChannelBase  writeOnPercentChan  — parseBegin sets value 1.0 at kCMTimeZero
//                                                  when version <= 4 @0x477358 (legacy default)
//   +0x06d8   OZChannelBase  ch_h               — assigned in operator= @0x47556b
//   +0x0808   bool     parseEndFlag             — parseEnd sets to true @0x4755b4 (marks
//                                                 "post-serialization initialization done")
//   +0x0810   double   bakeInSampleBuf.ptr      — willBake @0x477548 reads/writes; used as
//                                                 destination "PVector*" for OZChannel::getSamples
//                                                 @0x4776aa; didBake copies 0x810->0x818
//   +0x0818   double   bakeInSampleBuf.copy     — didBake @0x4777e2 (retains post-bake snapshot)
//   +0x0828   double   bakeOutSampleBuf.ptr     — willBake @0x477732 second getSamples target
//                                                 @0x4777a7; didBake copies 0x828->0x830
//   +0x0830   double   bakeOutSampleBuf.copy    — didBake @0x4777e9
//   +0x0840   CMTime   bakeCacheTime            — didBake resets to kCMTimeZero @0x4777fa,
//                                                 operator= also resets @0x47558b
//   +0x0850   CMTime   .epoch (or timescale)    — didBake @0x477805, operator= @0x477596
//
// VTABLE-SLOT DISPATCHES observed:
//   *(vptr + 0x140)  ->  "get owning-scene-node" (returns OZSceneNode*)    @willBake 0x4774ad
//   *(vptr + 0x148)  ->  "getFrameCount(CMTime*, uint*)" (or similar)       @willBake 0x47766b, 0x47776d
//   *(vptr + 0x150)  ->  "getScene()"                                       @willBake 0x4774fc, 0x476984, 0x4769c6
//   *(vptr + 0x268)  ->  "computeAnimationWindowStart(CMTime*)"             @reset 0x47727b, getPosition 0x476957
//
// Base class is OZChannelBehavior (< OZBehavior < OZFactoryBase).

import type { CMTime } from "../infra/CMTime.js";

// -----------------------------------------------------------------------------
// Frontier types — un-ported callee classes referenced by this file.
// Every interface is a nominal opaque handle (unique-symbol brand) so the port
// is type-safe without lying about what these types actually contain.
// -----------------------------------------------------------------------------

/** OZFactory — Ozone factory-base pointer. @provenance Ozone typeinfo __ZTI9OZFactory ref'd @C2 0x4749f2. */
export interface OZFactory { readonly __ozFactory: unique symbol }

/** PCString — ProCore string. @provenance Ozone C2 signature PCString const&. */
export interface PCString { readonly __pcString: unique symbol }

/** PCTimeRange — ProCore time range value type (used by willBake). @provenance Ozone symbol PCTimeRange. */
export interface PCTimeRange { readonly __pcTimeRange: unique symbol }

/** PCSerializerReadStream — parse stream carrying a version field at +0x68. @provenance Ozone parseBegin @0x47734b. */
export interface PCSerializerReadStream { readonly __pcReadStream: unique symbol }

/** OZSceneNode — Ozone scene-graph base node. @provenance Ozone typeinfo __ZTI11OZSceneNode ref'd @0x475662, 0x4774bc. */
export interface OZSceneNode { readonly __ozSceneNode: unique symbol }

/** OZRotoshape — vector shape derived from OZSceneNode. willBake dynamic_casts to this (ci offset 0xc8).
 *  @provenance Ozone typeinfo __ZTI11OZRotoshape ref'd @0x475669, 0x4774c3. */
export interface OZRotoshape extends OZSceneNode { readonly __ozRotoshape: unique symbol }

/** OZChannel — animatable channel; derives from OZChannelBase (confirmed by `addq $0x540,%rdi;
 *  callq __ZN13OZChannelBase5resetEb` in setDefaultSpeedType @0x477239..0x47725a — the same `this`
 *  pointer is passed to both an OZChannel::setDefaultValue and an OZChannelBase::reset, so OZChannel
 *  must be an OZChannelBase). @provenance Ozone class ref'd throughout. */
export interface OZChannel extends OZChannelBase {
  /** OZChannel::setDefaultValue(double). @0x6df306 stub. */
  setDefaultValue(v: number): void;
  /** OZChannel::setInterpolation(unsigned int). @0x6df33c stub. */
  setInterpolation(mode: number): void;
  /** OZChannel::setKeyframe(CMTime const&, double, bool). @0x6df294 stub. */
  setKeyframe(t: CMTime, v: number, isRel: boolean): void;
  /** OZChannel::setValue(CMTime const&, double, bool). @0x6df456 stub. */
  setValue(t: CMTime, v: number, isRel: boolean): void;
  /** OZChannel::getValueAsInt(CMTime const&, double) const. @0x6dfa80 stub. */
  getValueAsInt(t: CMTime, extra: number): number;
  /** OZChannel::getValueAsDouble(CMTime const&, double) const. @0x6dfa9e stub. */
  getValueAsDouble(t: CMTime, extra: number): number;
  /** OZChannel::enumerateCurveProcessingNodes(). @0x6df41a stub. Returns std::vector<void*>. */
  enumerateCurveProcessingNodes(): unknown[];
  /** OZChannel::appendCurveProcessingNode(void*). @0x6df3de stub. */
  appendCurveProcessingNode(node: unknown): void;
  /** OZChannel::getSamples(void*, CMTime const&, CMTime const&, uint&, vector<CMTime>*, vector<double>*). @0x6df252 stub. */
  getSamples(dst: unknown, start: CMTime, dur: CMTime, count: { v: number }, times: CMTime[] | null, samples: number[] | null): void;
}

/** OZChannelBase — base channel type for reset/enable/copy. @provenance Ozone class __ZTI13OZChannelBase. */
export interface OZChannelBase {
  /** OZChannelBase::reset(bool). @0x6dd8f6 stub. */
  reset(flag: boolean): void;
  /** OZChannelBase::enable(bool, bool). @0x6dd908 stub. */
  enable(a: boolean, b: boolean): void;
  /** OZChannelBase::operator=(OZChannelBase const&). @0x6dd938 stub. */
  assign(rhs: OZChannelBase): void;
}

/** OZBehavior — abstract base for OZ*Behavior. @provenance Ozone typeinfo __ZTI10OZBehavior. */
export interface OZBehavior {
  /** OZBehavior::parseBegin(PCSerializerReadStream&). @__ZN10OZBehavior10parseBeginER22PCSerializerReadStream, tail-called by parseBegin @0x477378. */
  parseBegin(stream: PCSerializerReadStream): void;
  /** OZBehavior::parseEnd(PCSerializerReadStream&). @__ZN10OZBehavior8parseEndER22PCSerializerReadStream, tail-called by parseEnd @0x4755bc. */
  parseEnd(stream: PCSerializerReadStream): void;
  /** OZBehavior::getFrameDuration() const. @__ZNK10OZBehavior16getFrameDurationEv, called by reset @0x4772cd. Returns CMTime. */
  getFrameDuration(): CMTime;
}

/** OZChannelBehavior — mid base class between OZBehavior and OZWriteOnBehavior.
 *  @provenance Ozone symbols __ZN17OZChannelBehavior*  (called by ctors, dtor, didAddToNode, operator=). */
export interface OZChannelBehavior extends OZBehavior {
  /** OZChannelBehavior::didAddCurveNode(OZBehaviorCurveNode*). @__ZN17OZChannelBehavior15didAddCurveNodeEP19OZBehaviorCurveNode, called by didAddToNode. */
  didAddCurveNode(cn: OZBehaviorCurveNode): void;
  /** OZChannelBehavior::addAffectedChannel(OZChannelBase*). @__ZN17OZChannelBehavior18addAffectedChannelEP13OZChannelBase, called by didAddToNode. */
  addAffectedChannel(chan: OZChannelBase): void;
  /** OZChannelBehavior::didAddToNode(OZSceneNode*). @__ZN17OZChannelBehavior12didAddToNodeEP11OZSceneNode, called by didAddToNode @0x475658. */
  didAddToNode(node: OZSceneNode | null): void;
  /** OZChannelBehavior::operator=(OZBehavior const&). @__ZN17OZChannelBehavioraSERK10OZBehavior, called @0x4754bd. */
  assign(rhs: OZBehavior): void;
}

/** OZBehaviorCurveNode — curve-processing node emitted per channel. @provenance Ozone class name in mangled callees. */
export interface OZBehaviorCurveNode { readonly __ozBehaviorCurveNode: unique symbol }

/** OZWriteOnCurveNode — the actual curve node created by createCurveNode and didAddToNode.
 *  32-byte instance: `new (__Znwm 0x20); OZWriteOnCurveNode::C1(this, OZBehavior*, OZChannel*)`.
 *  @provenance Ozone typeinfo __ZTI18OZWriteOnCurveNode ref'd @0x47740a, 0x4775b3, 0x4776d4. */
export interface OZWriteOnCurveNode extends OZBehaviorCurveNode { readonly __ozWriteOnCurveNode: unique symbol }

/** OZCurveNode — dynamic_cast source type when searching curve nodes.
 *  @provenance Ozone typeinfo __ZTI11OZCurveNode ref'd @0x47743a, 0x4775db, 0x4776fa. */
export interface OZCurveNode { readonly __ozCurveNode: unique symbol }

/** OZCurveNodeParam — struct passed by-ref to solveWriteOnNode second overload. @provenance Ozone signature. */
export interface OZCurveNodeParam { readonly __ozCurveNodeParam: unique symbol }

// -----------------------------------------------------------------------------
// Class
// -----------------------------------------------------------------------------

export class OZWriteOnBehavior implements OZChannelBehavior {
  // Fields (offsets recorded above).
  __ozBehavior?: never; // brand — see OZBehavior interface

  // === CTORS ==================================================================

  /**
   * @0x474fe0  OZWriteOnBehavior::OZWriteOnBehavior(OZFactory*, PCString const&, unsigned int)  (C1 thunk)
   * Body @0x474fe0: pushq %rbp; movq %rsp,%rbp; popq %rbp; jmp C2  → tail-jumps to the C2 base ctor.
   */
  static newFromFactory(_factory: OZFactory, _name: PCString, _flags: number): OZWriteOnBehavior {
    // C2 body @0x4749d0 chains to OZChannelBehavior::C2 @0x4749f2, installs 3 vptrs
    // (@0x4749f7 primary, @0x474a01 sub-object at +0x10, @0x474a0c sub-object at +0x28),
    // then does ~200 lines of channel construction we have not yet decoded.
    throw new Error(
      "OZWriteOnBehavior::OZWriteOnBehavior(OZFactory*, PCString const&, unsigned int) @0x4749d0 not yet transcribed"
    );
  }

  /**
   * @0x474ff0  OZWriteOnBehavior::OZWriteOnBehavior(OZWriteOnBehavior const&, unsigned int)  (copy C1)
   * Body @0x474ff0: thunk to C2 copy @0x474ff0 (C1==C2 for this overload in the binary listing).
   */
  static newCopy(_rhs: OZWriteOnBehavior, _flags: number): OZWriteOnBehavior {
    throw new Error(
      "OZWriteOnBehavior::OZWriteOnBehavior(OZWriteOnBehavior const&, unsigned int) @0x474ff0 not yet transcribed"
    );
  }

  // === DTORS ==================================================================

  /**
   * @0x475400  OZWriteOnBehavior::~OZWriteOnBehavior()  (D0 — deleting)
   * Body: calls D2 @0x475409 then jumps to operator delete @0x475417.
   */
  __ozwob_dtor_D0(): void {
    // D2 side-effect first:
    this.__ozwob_dtor_D2();
    // then __ZdlPv (free) — no-op in TS (GC).
  }

  /**
   * @0x4753b0  OZWriteOnBehavior::~OZWriteOnBehavior()  (D1)
   * Not yet extracted; expected to be a thunk to D2.
   */
  __ozwob_dtor_D1(): void {
    this.__ozwob_dtor_D2();
  }

  /**
   * @0x4752d0  OZWriteOnBehavior::~OZWriteOnBehavior()  (D2 — non-deleting)
   * Full body not yet extracted; destroys each embedded OZChannel/OZChannelBase subobject
   * (offsets 0x210, 0x310, 0x3a8, 0x440, 0x540, 0x640, 0x6d8, 0x770 per operator=), then
   * chains to ~OZChannelBehavior. No manual heap allocations to free.
   */
  __ozwob_dtor_D2(): void {
    throw new Error("OZWriteOnBehavior::~OZWriteOnBehavior() D2 @0x4752d0 not yet transcribed");
  }

  // === operator= ==============================================================

  /**
   * @0x4754b0  OZWriteOnBehavior::operator=(OZBehavior const&)
   * Chain to base:
   *   1. OZChannelBehavior::operator=(rhs)                                            @0x4754bd
   *   2. rhs' = dynamic_cast<OZWriteOnBehavior*>(rhs, OZBehavior->OZWriteOnBehavior)  @0x4754d5
   *      — throws bad_cast if null.
   *   3. OZChannelBase::operator= for each of the 8 embedded channels at offsets
   *      0x210 (@0x4754e6/ed), 0x310 (@0x4754f9/500), 0x3a8 (@0x47550c/513),
   *      0x440 (@0x47551f/526), 0x540 (@0x475532/539), 0x640 (@0x475545/54c),
   *      0x770 (@0x475558/55f), 0x6d8 (@0x47556b/572).
   *   4. Reset the 24-byte CMTime at +0x840 to kCMTimeZero (movups+movq 0x10)      @0x475581/588
   */
  assign(rhs: OZBehavior): void {
    // 1. Base-class assignment: this-> as OZChannelBehavior = rhs.
    // Since we don't have OZChannelBehavior::operator= transcribed, defer to a stub call.
    (this as unknown as OZChannelBehavior).assign;
    throw new Error(
      "OZWriteOnBehavior::operator=(OZBehavior const&) @0x4754b0 not yet transcribed — needs OZChannelBehavior::operator= and OZChannelBase::operator= transcriptions"
    );
    // Structural steps (once callees land):
    //   OZChannelBehavior::operator=.call(this, rhs);                          // @0x4754bd
    //   const src = dynamic_cast<OZWriteOnBehavior>(rhs); if (!src) __cxa_bad_cast();
    //   for (const off of [0x210,0x310,0x3a8,0x440,0x540,0x640,0x770,0x6d8]) {
    //     this.channels[off].assign(src.channels[off]);
    //   }
    //   this.bakeCacheTime = kCMTimeZero;
  }

  // === parseBegin / parseEnd ==================================================

  /**
   * @0x477330  OZWriteOnBehavior::parseBegin(PCSerializerReadStream&)
   * Body (transcribed line-for-line):
   *   1. this.hiddenTargetChannel [+0x640] .reset(false)                          @0x47733d..0x477346
   *   2. version = *(uint32*)(stream + 0x68)                                      @0x47734b
   *      if (version <= 4)  writeOnPercentChan[+0x770].setValue(kCMTimeZero, 1.0, false) @0x477351..0x477369
   *      (1.0 double @0x4a13e0 = *(0x477367+0x28e079))
   *   3. tail-jump to OZBehavior::parseBegin(stream)                              @0x477378
   */
  parseBegin(stream: PCSerializerReadStream): void {
    // Step 1
    this._hiddenTargetChannel().reset(false);
    // Step 2
    const version = this._streamVersion(stream);
    if (version <= 4) {
      // Legacy default: 1.0 double @0x4a13e0 (read via resolve.py Ozone const 0x4a13e0 → 1.0).
      this._writeOnPercentChan().setValue(this._kCMTimeZero(), Math.fround(1.0), false);
    }
    // Step 3 — tail-jump to base
    this._asOZBehavior().parseBegin(stream);
  }

  /**
   * @0x4755b0  OZWriteOnBehavior::parseEnd(PCSerializerReadStream&)
   * Body:
   *   1. *(byte*)(this + 0x808) = 1                                           @0x4755b4
   *   2. tail-jump to OZBehavior::parseEnd(stream)                            @0x4755bc
   */
  parseEnd(stream: PCSerializerReadStream): void {
    this._parseEndFlag = true;
    this._asOZBehavior().parseEnd(stream);
  }

  // === createCurveNode ========================================================

  /**
   * @0x4755f0  OZWriteOnBehavior::createCurveNode(OZChannel*)
   * Body:
   *   1. buf = __Znwm(0x20)                                                    @0x4755fa..0x4755ff
   *   2. OZWriteOnCurveNode::C1(buf, this, channel)  [3rd arg = 0/nullptr]     @0x47560f
   *   3. return buf
   */
  createCurveNode(channel: OZChannel): OZWriteOnCurveNode {
    // A 0x20-byte OZWriteOnCurveNode initialized with (behavior=this, channel).
    // We don't (yet) have the target-typed constructor — throw with @addr.
    void channel;
    throw new Error(
      "OZWriteOnBehavior::createCurveNode @0x4755f0 not yet transcribed — needs OZWriteOnCurveNode::C1(OZBehavior*, OZChannel*) @0x475610"
    );
  }

  // === didAddToNode ===========================================================

  /**
   * @0x475630  OZWriteOnBehavior::didAddToNode(OZSceneNode*)
   * Wires per-vertex curve nodes onto an OZRotoshape (dynamic_cast OZSceneNode -> OZRotoshape,
   * class-inheritance offset 0xc8 @0x475670). For each channel offset {0x7110, 0x71a8, 0x7378,
   * 0x72e0, ...} on the Rotoshape, allocates a new OZWriteOnCurveNode(0x20), calls
   * OZChannel::appendCurveProcessingNode, then didAddCurveNode + addAffectedChannel on THIS.
   *
   * 315-line body — not fully transcribed. Behavior contract:
   *   - Chains to OZChannelBehavior::didAddToNode(node)                             @0x475658
   *   - Repeats the (alloc curve node + append + didAdd + addAffected) 4-tuple per
   *     Rotoshape channel (0x7110, 0x71a8, 0x7378, 0x72e0, ...)
   *   - Only executed when node dynamic-casts to OZRotoshape (else null path)
   */
  didAddToNode(_node: OZSceneNode | null): void {
    throw new Error("OZWriteOnBehavior::didAddToNode @0x475630 not yet transcribed (315-line body)");
  }

  // === solveWriteOnNode overloads ============================================

  /**
   * @0x475b60  OZWriteOnBehavior::solveWriteOnNode(OZChannelBase*, CMTime const&, double, double)
   * ~3400-byte body; not yet transcribed.
   */
  solveWriteOnNode_A(_chan: OZChannelBase, _t: CMTime, _a: number, _b: number): void {
    throw new Error("OZWriteOnBehavior::solveWriteOnNode(OZChannelBase*, CMTime, double, double) @0x475b60 not yet transcribed");
  }

  /**
   * @0x476f90  OZWriteOnBehavior::solveWriteOnNode(OZChannelBase*, OZCurveNodeParam&)
   * NOTE: `disasm.sh` returned a 0-line dump for this symbol. otool -tV has no label at
   * 0x476f90 — the code region is either ICF-folded onto another symbol or was decoded
   * as the tail of the previous function. Not extractable via the standard path.
   */
  solveWriteOnNode_B(_chan: OZChannelBase, _param: OZCurveNodeParam): void {
    throw new Error("OZWriteOnBehavior::solveWriteOnNode(OZChannelBase*, OZCurveNodeParam&) @0x476f90 not yet transcribed (ICF-folded — otool -tV has no label; needs llvm-objdump --disassemble-symbols)");
  }

  // === getPosition ============================================================

  /**
   * @0x4768f0  OZWriteOnBehavior::getPosition(CMTime const&, CMTime const&)
   * 427-line body. Skeleton (from the first 100 lines):
   *   1. speedType = speedTypeChannel[+0x540].getValueAsInt(kCMTimeZero, 0.0)      @0x476942
   *   2. base-vptr *(+0x268)(this, &tmpCMTime)                                     @0x476957
   *   3. if (speedType == 7)  return writeOnPercent (@0x640).getValueAsDouble(t)   @0x476974
   *      else if (vtable+0x150 (getScene()) != null)  ... piecewise time math      @0x476984+
   *   4. Uses OZSceneSettings::getFrameDuration + PC_CMTimeSaferSubtract           @0x4769d7, 0x476a06
   *   5. Returns a double in xmm0.
   * Full transcription @0x4768f0 pending; skeleton throws to keep behavior loud.
   */
  getPosition(_t: CMTime, _tBase: CMTime): number {
    throw new Error("OZWriteOnBehavior::getPosition @0x4768f0 not yet transcribed (427-line body)");
  }

  // === updateHiddenFlags ======================================================

  /**
   * @0x477070  OZWriteOnBehavior::updateHiddenFlags(std::list<OZBehavior*>*)
   * Body (fully transcribed from disasm):
   *   1. mySpeed = this.speedTypeChannel[+0x540].getValueAsInt(kCMTimeZero, 0.0)       @0x477092
   *   2. Walk the intrusive std::list<OZBehavior*> starting at rhs+0x8 (head node's next).
   *      For each entry E (E->obj at +0x10):
   *        E' = dynamic_cast<OZWriteOnBehavior*>(E->obj, OZBehavior->OZWriteOnBehavior)  @0x4770d0
   *        eSpeed = E'.speedTypeChannel.getValueAsInt(kCMTimeZero, 0.0)                  @0x4770e2
   *        if (eSpeed != mySpeed)  goto DISABLE_ALL                                      @0x4770ea
   *      end of walk (all speeds equal):
   *   3. if (mySpeed == 7)  ENABLE each list entry's hiddenTargetChannel[+0x640] with
   *      enable(true, true)                                                             @0x477143
   *      else                ENABLE each with enable(true, true) via DISABLE_ALL_ENABLED path
   *                            (the "goto DISABLE_ALL" branch @0x4771b4 enables with (false, true))
   *   The pattern: same-speed AND mySpeed==7 => enable hiddenTargetChannel (true,true);
   *                same-speed AND mySpeed!=7 => enable hiddenTargetChannel (true,true) [DIFFERENT branch];
   *                different speeds          => enable hiddenTargetChannel (false,true).
   *   Wait re-reading the disasm: the "je ...pass" cases differ — the FINAL match-all-same branch
   *   goes to @0x477106 which cmpl $0x7,%r14d, so if speed==7 -> block @0x47710c (enable true,true);
   *   else block @0x4771b4 (enable false,true — DISABLE).
   *   The "different speeds detected" branch @0x477157 also enables with (true,true) [ENABLE].
   *   That is: enable "hiddenTargetChannel" only when speeds differ OR speed==7.
   */
  updateHiddenFlags(list: OZBehaviorList): void {
    const mySpeed = this._speedTypeChannel().getValueAsInt(this._kCMTimeZero(), 0.0);
    // Walk head node (list has sentinel; head is at list itself, and (list+0x8) is head.next).
    let node: OZBehaviorListNode | null = list.head_next;
    // Phase 1: check "all-equal"
    let allEqual = true;
    while (node !== null && node !== (list as unknown as OZBehaviorListNode)) {
      const other = node.obj_at_offset_0x10_as_OZWriteOnBehavior();
      if (other === null) throw new Error("dynamic_cast<OZWriteOnBehavior> failed @0x4770d0");
      const otherSpeed = other._speedTypeChannel().getValueAsInt(this._kCMTimeZero(), 0.0);
      if (otherSpeed !== mySpeed) {
        allEqual = false;
        break;
      }
      node = node.next;
    }
    // Phase 2: apply
    // Iterate all list entries; branch on (allEqual, mySpeed).
    let it: OZBehaviorListNode | null = list.head_next;
    while (it !== null && it !== (list as unknown as OZBehaviorListNode)) {
      const otherB = it.obj_at_offset_0x10_as_OZWriteOnBehavior();
      if (otherB === null) throw new Error("dynamic_cast<OZWriteOnBehavior> failed in phase-2 @0x4770d0");
      const chan = otherB._hiddenTargetChannel() as unknown as OZChannelBase;
      if (allEqual && mySpeed === 7) {
        // @0x477143 enable(true, true)
        chan.enable(true, true);
      } else if (allEqual && mySpeed !== 7) {
        // @0x4771f0 enable(false, true) — the DISABLE branch
        chan.enable(false, true);
      } else {
        // different speeds branch @0x4771a3 enable(true, true)
        chan.enable(true, true);
      }
      it = it.next;
    }
  }

  // === isRebuildUIChannel =====================================================

  /**
   * @0x477210  OZWriteOnBehavior::isRebuildUIChannel(OZChannelBase*)
   * Body:  return (channel == this + 0x540);   // identity compare on speedTypeChannel
   * That is: only speedTypeChannel is a "rebuild UI" trigger.
   */
  isRebuildUIChannel(chan: OZChannelBase): boolean {
    return (chan as unknown) === (this._speedTypeChannel() as unknown);
  }

  // === setDefaultSpeedType ====================================================

  /**
   * @0x477230  OZWriteOnBehavior::setDefaultSpeedType(unsigned int)
   * Body:
   *   speedTypeChannel[+0x540].setDefaultValue((double)(uint32)speedType)   @0x477247
   *   speedTypeChannel.reset(false)                                          @0x47725a (tail jmp)
   *
   * Numeric: cvtsi2sd of ZERO-extended 32-bit unsigned (%eax) → double.
   * (Meta note: identity conversion at these speedType values; Math.fround not required
   * because the callee is setDefaultValue(double).)
   */
  setDefaultSpeedType(speedType: number): void {
    // cvtsi2sd zero-extended (masking 0xffffffff) → double
    const asDouble = (speedType >>> 0);
    const chan = this._speedTypeChannel();
    chan.setDefaultValue(asDouble);
    chan.reset(false);  // OZChannelBase::reset(bool) via cast; second arg was 0/false
  }

  // === reset ==================================================================

  /**
   * @0x477260  OZWriteOnBehavior::reset()
   * Body:
   *   1. *vtable-slot(+0x268)(this, &tmp)  → OZBehavior::computeAnimationWindowStart(&tmp)  @0x47727b
   *      writes a CMTime + a double? into stack slots -0x78/-0x60/-0x50.
   *   2. hiddenTargetChannel [+0x640] .reset(false)                                        @0x477288
   *   3. hiddenTargetChannel.setInterpolation(4)                                           @0x47729a
   *   4. hiddenTargetChannel.setKeyframe(kCMTimeZero, 0.0, true)                           @0x4772b1
   *   5. tmp2 = getFrameDuration()                                                          @0x4772cd
   *   6. tmp3 = PC_CMTimeSaferSubtract(windowStart, tmp2)                                  @0x4772ff
   *   7. hiddenTargetChannel.setKeyframe(tmp3, 100.0, true)                                @0x477317
   *      (100.0 double @0x477304+0x28e11c = 0x705420 → 100.0)
   */
  reset(): void {
    throw new Error(
      "OZWriteOnBehavior::reset @0x477260 not yet transcribed — needs vtable slot +0x268 (computeAnimationWindowStart), PC_CMTimeSaferSubtract, and OZBehavior::getFrameDuration"
    );
  }

  // === getCurveNodeForChannel =================================================

  /**
   * @0x4773e0  OZWriteOnBehavior::getCurveNodeForChannel(OZChannel*)
   * Body:
   *   1. nodes = channel.enumerateCurveProcessingNodes()  → vector<void*>, iter [rbx, r14)  @0x4773f8
   *   2. For each ptr p in nodes:
   *        w = dynamic_cast<OZWriteOnCurveNode*>(p, OZCurveNode -> OZWriteOnCurveNode)     @0x477446
   *        if (w != nullptr AND w->behavior_at_+0x8 == this)   return prev-element (rbx[r12-8]) @0x477450
   *      Otherwise return null.
   *   3. Free the vector's backing buffer (__ZdlPv) before returning                        @0x477472
   *
   * NOTE: The "return prev-element" semantics reflect that the vector holds two adjacent
   * pointers per entry (curve-node + its associated payload) — the fn returns the entry
   * BEFORE the matching curve-node. Since we don't yet know the vector layout precisely,
   * this is throw-stubbed.
   */
  getCurveNodeForChannel(_channel: OZChannel): OZWriteOnCurveNode | null {
    throw new Error(
      "OZWriteOnBehavior::getCurveNodeForChannel @0x4773e0 not yet transcribed — vector<void*> element pairing semantics need decode"
    );
  }

  // === willBake / didBake =====================================================

  /**
   * @0x477490  OZWriteOnBehavior::willBake(PCTimeRange&)
   * 201-line body. Prepares two OZChannel-sample buffers at this+0x810 and this+0x828 by
   * calling OZChannel::getSamples on the two curve channels associated with the affected
   * OZRotoshape (@0x7110, @0x71a8). Cache time snapshot is written to this+0x840.
   */
  willBake(_range: PCTimeRange): void {
    throw new Error("OZWriteOnBehavior::willBake @0x477490 not yet transcribed (201-line body)");
  }

  /**
   * @0x4777d0  OZWriteOnBehavior::didBake()
   * Body (fully transcribed):
   *   *(this + 0x818) = *(this + 0x810)     (copy sample-buf-A ptr into "post-bake" slot)
   *   *(this + 0x830) = *(this + 0x828)     (copy sample-buf-B ptr)
   *   *(CMTime*)(this + 0x840) = kCMTimeZero  (reset cache time; xmm0-move covers value+timescale/flags,
   *                                            then movq of the epoch qword @0x477805)
   *   *(this + 0x138)  = 0                  (bakeActive = false)
   */
  didBake(): void {
    this._bakeInSampleBufCopy = this._bakeInSampleBuf;
    this._bakeOutSampleBufCopy = this._bakeOutSampleBuf;
    this._bakeCacheTime = this._kCMTimeZero();
    this._bakeActive = false;
  }

  // ==========================================================================
  // Frontier accessors — these are placeholders that model the field layout.
  // They throw so no downstream code silently reads a wrong value while the
  // ctor and destructor bodies remain un-transcribed.
  // ==========================================================================

  private _speedTypeChannel(): OZChannel {
    throw new Error("OZWriteOnBehavior._speedTypeChannel [this+0x540] accessor — layout node not yet materialized");
  }
  private _hiddenTargetChannel(): OZChannel {
    throw new Error("OZWriteOnBehavior._hiddenTargetChannel [this+0x640] accessor — layout node not yet materialized");
  }
  private _writeOnPercentChan(): OZChannel {
    throw new Error("OZWriteOnBehavior._writeOnPercentChan [this+0x770] accessor — layout node not yet materialized");
  }
  private _kCMTimeZero(): CMTime {
    throw new Error("OZWriteOnBehavior._kCMTimeZero — needs CoreMedia _kCMTimeZero binding");
  }
  private _streamVersion(_stream: PCSerializerReadStream): number {
    throw new Error("OZWriteOnBehavior._streamVersion @0x47734b (*(uint32*)(stream+0x68)) — PCSerializerReadStream layout not yet transcribed");
  }
  private _asOZBehavior(): OZBehavior {
    throw new Error("OZWriteOnBehavior._asOZBehavior @0x477378 (parseBegin tail-jmp base view) — base-class view not yet materialized");
  }

  // Field-shaped placeholders for didBake:
  private _bakeInSampleBuf = 0;
  private _bakeInSampleBufCopy = 0;
  private _bakeOutSampleBuf = 0;
  private _bakeOutSampleBufCopy = 0;
  private _bakeCacheTime!: CMTime;
  private _bakeActive = false;
  private _parseEndFlag = false;

  // === OZChannelBehavior conformance stubs (compile-only) =====================
  didAddCurveNode(_cn: OZBehaviorCurveNode): void {
    throw new Error("OZWriteOnBehavior::didAddCurveNode inherited from OZChannelBehavior (called @0x4756b8 in didAddToNode) — base-class binding @0x4756b8 not yet transcribed");
  }
  addAffectedChannel(_chan: OZChannelBase): void {
    throw new Error("OZWriteOnBehavior::addAffectedChannel inherited from OZChannelBehavior (called @0x4756c3 in didAddToNode) — base-class binding @0x4756c3 not yet transcribed");
  }
  getFrameDuration(): CMTime {
    throw new Error("OZWriteOnBehavior::getFrameDuration inherited from OZBehavior (called @0x4772cd in reset) — base-class binding @0x4772cd not yet transcribed");
  }
}

// -----------------------------------------------------------------------------
// Intrusive std::list<OZBehavior*> node view — used only by updateHiddenFlags.
// Layout recovered from updateHiddenFlags @0x4770c0: node.obj is at +0x10, node.next
// is at +0x8 (sentinel iteration: walk (list+0x8) until it returns to list).
// -----------------------------------------------------------------------------
export interface OZBehaviorListNode {
  next: OZBehaviorListNode | null;
  obj_at_offset_0x10_as_OZWriteOnBehavior(): OZWriteOnBehavior | null;
}
export interface OZBehaviorList {
  head_next: OZBehaviorListNode | null;
}
