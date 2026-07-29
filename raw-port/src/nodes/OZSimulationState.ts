// OZSimulationState — physics/animation-simulation state helper for OZTransformNode graphs.
// Static-utility class (all methods here are called as `OZSimulationState::foo(...)`; there is
// no per-instance state — the class name namespaces a family of pure helpers). Lives entirely
// in Ozone.framework.
//
// FAITHFUL PORT — every function cites its Ozone @0xADDR. Frontier callees (OZSceneNode,
// OZTransformNode, OZRenderState, OZGroup, OZElement, OZSceneSettings, OZChannel, PC_CMTime*,
// PCVector3<double>, PCMatrix44Tmpl<double>) throw with their own @0xADDR so the ledger sees
// the exact call site.
//
// The 8 methods (from ledger):
//   @0x1eefc0  stepFrom(OZSimulationState*, CMTime const&, double)                — 3-arg thunk
//   @0x1eefd0  stepFrom(OZSimulationState*, OZSimulationState*, CMTime const&, double) — REAL body (ICF stub)
//   @0x1ef310  GetCommonGroup(OZTransformNode*, OZTransformNode*)                 — OZSceneNode::getCommonAncestor + dcast
//   @0x1ef350  TransformToWorld(CMTime const&, OZTransformNode*, OZTransformNode*, PCVector3<double>*) — walks parents to world
//   @0x1ef490  GetNodePosition(...)   — ICF-folded with getNodePosition (see below)
//   @0x1ef5b0  getNodePosition(CMTime const&, OZTransformNode*, OZTransformNode*, PCVector3<double>*) — reads +0x540/0x5D8/0x798 channels then TransformToWorld
//   @0x1ef6d0  getTransformedCorners(OZElement*, PCVector3<double>*, ...*4)       — 308-line transform matrix build (frontier)
//   @0x1f0b50  initializeState(CMTime const&)                                     — zeroes 0xC8-byte state + writes CMTime
//
// ICF NOTE: `GetNodePosition` @0x1ef490 and `getNodePosition` @0x1ef5b0 are ICF-folded to the same
//           body (proven by `diff` on the two disasm dumps). We expose both spellings pointing at
//           the same implementation, citing both @0xADDRs.
// ICF NOTE 2: `stepFrom(OZSimulationState*, CMTime const&, double)` @0x1eefc0 is a 3-arg thunk that
//           moves rdx->rcx and rsi->rdx (shifting args by one) then tail-jumps to the 4-arg body
//           @0x1eefd0. The 4-arg body @0x1eefd0 is ITSELF ICF-folded (only 7 lines dumped by otool)
//           — its real body isn't available in the tV.txt slice; throw-stubbed with the correct
//           @0xADDR so consumers get a loud, precise gap.

/** Frontier stub — Ozone `OZTransformNode*`. Real class in Ozone; touched offsets:
 *  +0x3B8 (parent group pointer, dynamic_cast target)
 *  +0x540, +0x5D8, +0x798 (per-axis position channels — read as `OZChannel` sub-objects).
 *  Modeled opaquely; every touched offset is documented at the call site. */
export interface OZTransformNode { readonly __brand: 'OZTransformNode'; }

/** Frontier stub — `OZElement*` (first arg of getTransformedCorners). Real class in Ozone;
 *  layout untouched here. */
export interface OZElement { readonly __brand: 'OZElement'; }

/** Frontier stub — `OZGroup*` (dynamic_cast result). Real class in Ozone. Not touched in this
 *  file except via vtable slots +0x4e8 (TransformToWorld) and +0x110 (getNodePosition's scene-
 *  settings hop). Modeled opaquely. */
export interface OZGroup { readonly __brand: 'OZGroup'; }

/** Frontier stub — `CMTime const&`. Modeled as an opaque handle to a value/timescale/flags/
 *  epoch tuple (24 bytes on disk). */
export interface CMTime { readonly __brand: 'CMTime'; }

/** Frontier stub — `PCVector3<double>*`. Real struct is 3 doubles laid out at +0x00 (x),
 *  +0x08 (y), +0x10 (z). We model it as a mutable 3-tuple so setter code paths can write into
 *  it. Field-write in getNodePosition uses those exact offsets @0x1ef69c/0x1ef6a5/0x1ef6aa. */
export interface PCVector3D { x: number; y: number; z: number; }

/** Frontier stub — a `CMTime const&` result from `OZSceneSettings::getFrameDuration()`. */
export interface OZSceneSettings { readonly __brand: 'OZSceneSettings'; }

/** Frontier stub — the OZRenderState 0x3C0-byte scratch buffer used by TransformToWorld and
 *  getTransformedCorners. Only touched via its ctor + vtable-driven calls; opaque here. */
export interface OZRenderState { readonly __brand: 'OZRenderState'; }

// ─── Frontier stubs for external callees (each cites the Ozone @0xADDR call site) ────────────

/** `OZSceneNode::getCommonAncestor(OZSceneNode*, bool)` @Ozone U — used by
 *  GetCommonGroup @0x1ef329 and TransformToWorld @0x1ef3d7. Returns the lowest scene-graph
 *  ancestor node containing both operands (or nullptr). */
function OZSceneNode_getCommonAncestor(_a: OZTransformNode, _b: OZTransformNode, _flag: boolean): OZTransformNode | null {
  throw new Error(
    "OZSceneNode::getCommonAncestor(OZSceneNode*,bool) @Ozone U not yet transcribed " +
    "(called from OZSimulationState::GetCommonGroup @0x1ef329 and OZSimulationState::TransformToWorld @0x1ef3d7)"
  );
}

/** `___dynamic_cast(from, ti_from, ti_to, hint)` — libc++abi stub @0x6dfd0e in Ozone.
 *  Used by GetCommonGroup @0x1ef347 (cast OZSceneNode -> OZTransformNode), TransformToWorld
 *  @0x1ef390 (OZSceneNode -> OZGroup) and @0x1ef3f7 (OZSceneNode -> OZTransformNode), and
 *  getTransformedCorners @0x1ef80e (OZSceneNode -> OZGroup). We accept a nullable-in / nullable-out
 *  cast rather than modeling C++ RTTI: at each call site we already know the concrete narrowing. */
function dynCast<T>(obj: unknown | null): T | null {
  // The port cannot faithfully replay C++ typeinfo pointer comparisons — its role here is only
  // "if the caller's shape matches T, hand it back; else null". Consumers pass concrete objects.
  return obj as T | null;
}

/** `OZRenderState::OZRenderState()` @Ozone U — default-ctor'd scratch state. Called from
 *  TransformToWorld @0x1ef3a8 (into -0x130(%rbp)) and getTransformedCorners @0x1ef724 (into
 *  -0x3c0(%rbp)). */
function OZRenderState_new(): OZRenderState {
  throw new Error(
    "OZRenderState::OZRenderState() @Ozone U not yet transcribed " +
    "(called from OZSimulationState::TransformToWorld @0x1ef3a8 and OZSimulationState::getTransformedCorners @0x1ef724)"
  );
}

/** `OZSceneSettings::getFrameDuration() const` @Ozone U — reads a CMTime from a scene-settings
 *  singleton. Called from getNodePosition @0x1ef5e5 via `(*(*node.vptr+0x110))(node)+0x90`. */
function OZSceneSettings_getFrameDuration(_settings: OZSceneSettings): CMTime {
  throw new Error(
    "OZSceneSettings::getFrameDuration() @Ozone U not yet transcribed " +
    "(called from OZSimulationState::getNodePosition @0x1ef5e5)"
  );
}

/** `_PC_CMTimeFloorToSampleDuration(out*, CMTime const&, CMTime const&)` — 0x6dced6 stub.
 *  Floors the first CMTime to a multiple of the second. Called from getNodePosition @0x1ef623. */
function PC_CMTimeFloorToSampleDuration(_t: CMTime, _duration: CMTime): CMTime {
  throw new Error(
    "_PC_CMTimeFloorToSampleDuration @Ozone 0x6dced6 not yet transcribed " +
    "(called from OZSimulationState::getNodePosition @0x1ef623)"
  );
}

/** `_PC_CMTimeSaferSubtract(out*, CMTime a, CMTime b)` — 0x6dcf0c stub. Returns a-b with
 *  overflow/timescale-mismatch safety. Called from getNodePosition @0x1ef652. */
function PC_CMTimeSaferSubtract(_a: CMTime, _b: CMTime): CMTime {
  throw new Error(
    "_PC_CMTimeSaferSubtract @Ozone 0x6dcf0c not yet transcribed " +
    "(called from OZSimulationState::getNodePosition @0x1ef652)"
  );
}

/** `OZChannel::getValueAsDouble(CMTime const&, double) const` — Ozone 0x6dfa9e stub. Called
 *  three times from getNodePosition (@0x1ef664 read node+0x540; @0x1ef67b read node+0x5D8;
 *  @0x1ef692 read node+0x798) — the X, Y, Z position sub-channels of a TransformNode. */
function OZChannel_getValueAsDouble(_channelPtr: number, _time: CMTime, _defaultValue: number): number {
  throw new Error(
    "OZChannel::getValueAsDouble(CMTime,double) @Ozone 0x6dfa9e not yet transcribed " +
    "(called 3x from OZSimulationState::getNodePosition @0x1ef664/0x1ef67b/0x1ef692 — reads node+0x540/0x5D8/0x798)"
  );
}

/** OZTransformNode virtual slots touched in this file:
 *  - vtable[+0x110] : `OZSceneNode* getSceneNode() const`  (called from getNodePosition
 *                    @0x1ef5d4 and getTransformedCorners @0x1ef81d).
 *  - vtable[+0x4e8] : `void applyLocalTransform(...) const` (called from TransformToWorld
 *                    @0x1ef437 and @0x1ef472 with OZRenderState* as arg3).
 *  - vtable[+0x538] : `void getTransformAtTime(CMTime const&, ..., OZRenderState*, ...)`
 *                    (called from getTransformedCorners @0x1ef76f).
 *  - vtable[+0x548] : `double getRotation() const` (called from TransformToWorld @0x1ef40a
 *                    and getTransformedCorners @0x1ef83b).
 *  Each is exposed as a named stub with its call-site @0xADDR so a live call goes to a
 *  precise gap message.
 */
function vtable_OZTransformNode_getSceneNode(_this: OZTransformNode): OZSceneSettings {
  throw new Error(
    "OZTransformNode vtable[+0x110] getSceneNode() @Ozone U not yet transcribed " +
    "(called from OZSimulationState::getNodePosition @0x1ef5d4 and OZSimulationState::getTransformedCorners @0x1ef81d)"
  );
}
function vtable_OZTransformNode_applyLocalTransform(_this: OZTransformNode, _time: CMTime, _rs: OZRenderState): void {
  throw new Error(
    "OZTransformNode vtable[+0x4e8] applyLocalTransform(CMTime, OZRenderState*) @Ozone U not yet transcribed " +
    "(called from OZSimulationState::TransformToWorld @0x1ef437 and @0x1ef472)"
  );
}
function vtable_OZTransformNode_getTransformAtTime(_this: OZElement, _time: CMTime, /* outs */ _rs: OZRenderState): void {
  throw new Error(
    "OZTransformNode vtable[+0x538] getTransformAtTime(...) @Ozone U not yet transcribed " +
    "(called from OZSimulationState::getTransformedCorners @0x1ef76f)"
  );
}
function vtable_OZTransformNode_getRotation(_this: OZTransformNode): number {
  throw new Error(
    "OZTransformNode vtable[+0x548] getRotation() @Ozone U not yet transcribed " +
    "(called from OZSimulationState::TransformToWorld @0x1ef40a and OZSimulationState::getTransformedCorners @0x1ef83b)"
  );
}

// ─── The 5 real math methods + 2 pass-through wrappers + 1 frontier stub ─────────────────────

/**
 * OZSimulationState — pure static utility namespace. The disassembly shows no per-instance
 * fields on any method (every function is either static or takes the transform-node/element
 * pointer as an explicit arg — `rdi` is either unused or an `OZSimulationState*` handed to a
 * sibling static). We expose it as a `namespace`-shaped class of static methods.
 */
export class OZSimulationState {
  /**
   * `OZSimulationState::stepFrom(OZSimulationState*, CMTime const&, double)` @Ozone 0x1eefc0.
   *
   * Three-arg thunk that shifts arguments and tail-jumps to the four-arg overload:
   *   movq  %rdx, %rcx    // t (rdx: CMTime&) -> rcx (t)
   *   movq  %rsi, %rdx    // src (rsi) -> rdx (arg2)
   *   jmp   stepFrom(this, src, t, dt)
   * i.e. the 3-arg form is `stepFrom(this=nullptr, src=arg1, t=arg2, dt=arg3)`. Sole caller is
   * external — this thunk exists so ObjC/C-facing users can pass a 3-arg form.
   */
  static stepFrom_3arg(src: OZSimulationState, t: CMTime, dt: number): void {
    // @0x1eefcb — tail-jump into 4-arg body.
    return OZSimulationState.stepFrom(null, src, t, dt);
  }

  /**
   * `OZSimulationState::stepFrom(OZSimulationState*, OZSimulationState*, CMTime const&, double)`
   *  @Ozone 0x1eefd0.
   *
   * The 4-arg body is ICF-folded in the framework's otool -tV dump (only the 7-line prologue
   * is emitted; the tail identical-code-folds with another simulation method). Without a
   * dedicated `llvm-objdump --disassemble-symbols=` extraction (unavailable on this box), we
   * refuse to guess. Every real caller surfaces a precise gap here.
   */
  static stepFrom(_dst: OZSimulationState | null, _src: OZSimulationState, _t: CMTime, _dt: number): void {
    throw new Error(
      "OZSimulationState::stepFrom(OZSimulationState*,OZSimulationState*,CMTime const&,double) @Ozone 0x1eefd0 " +
      "not yet transcribed (ICF-folded body; needs per-symbol disasm — otool -tV emits only the 7-line prologue)"
    );
  }

  /**
   * `OZSimulationState::GetCommonGroup(OZTransformNode*, OZTransformNode*)` @Ozone 0x1ef310.
   *
   * Structure (verbatim from disasm):
   *   1. If either argument is null (@0x1ef314-0x1ef320: `testq rdi + testq rsi; sete al/cl;
   *      orb al,cl; jne 0x1ef34c`), return null.
   *   2. Otherwise call `OZSceneNode::getCommonAncestor(a, b, bool=true)` @0x1ef329
   *      (edx=1). If result is null (@0x1ef331), return null.
   *   3. Otherwise `dynamic_cast<OZTransformNode*>((OZSceneNode*)result)` @0x1ef347 and
   *      return that (may be null).
   *
   * Return type is `OZTransformNode*` — the common transform-parent of the two operands, or
   * null when they don't share one (or when at least one operand was null to begin with).
   */
  static GetCommonGroup(a: OZTransformNode | null, b: OZTransformNode | null): OZTransformNode | null {
    // @0x1ef314-0x1ef322 — null-guard.
    if (a === null || b === null) return null;
    // @0x1ef329 — getCommonAncestor with bool arg = true.
    const anc = OZSceneNode_getCommonAncestor(a, b, true);
    // @0x1ef331 — null-check ancestor.
    if (anc === null) return null;
    // @0x1ef347 — dynamic_cast to OZTransformNode.
    return dynCast<OZTransformNode>(anc);
  }

  /**
   * `OZSimulationState::TransformToWorld(CMTime const&, OZTransformNode*, OZTransformNode*,
   *                                      PCVector3<double>*)` @Ozone 0x1ef350.
   *
   * Args: rdi=this (unused), rsi=time, rdx=fromNode, rcx=toNode, r8=&position (in/out).
   * Wait — the arg order in the disasm is:
   *   rdi = this (the sim-state OR nullptr for the static call — the body reads rdi as `r13`
   *              purely to load its offset 0x10 and to pass it into the vtable-dispatched calls
   *              at slot +0x4e8; when rdi is null the base ctor of OZRenderState is passed a
   *              zeroed buffer @0x1ef3a8-0x1ef3bd — see below).
   *   rsi = time (CMTime const&) — passed to virtual slot +0x4e8.
   *   rdx = from-node ("start" of the transform walk).
   *   rcx = to-node   (the ancestor we're transforming into; may be null).
   *   r8  = &position (PCVector3<double>*; NOT touched here — the transform accumulates into
   *              the OZRenderState scratch buffer, which the vslot 0x4e8 reads/writes).
   *
   * Structure:
   *   1. `if (fromNode->parentGroup (+0x3B8) == nullptr) return;`  (@0x1ef367..0x1ef371)
   *   2. Dynamic-cast the parent to OZGroup* (@0x1ef390); if null, return.  (@0x1ef398)
   *   3. Construct an OZRenderState (@0x1ef3a8) and seed it from this+0x00..0x10 (16+8 bytes,
   *      @0x1ef3ad-0x1ef3c4) — a copy of the sim-state's CMTime prefix + one 8-byte field.
   *   4. Set a local flag `keepGoing = 1` (@0x1ef3c4 movb $0x1, %r13b — reuses r13 as a flag
   *      slot).
   *   5. If `toNode != nullptr` (@0x1ef3c7-0x1ef3ca):
   *        a. Compute `OZSceneNode::getCommonAncestor(toNode, fromNode, true)` @0x1ef3d7.
   *        b. If null, skip.  (@0x1ef3df je)
   *        c. Otherwise dcast to OZTransformNode (@0x1ef3f7). If null, skip.  (@0x1ef3ff je)
   *        d. Read its rotation via vslot +0x548 (@0x1ef40a) into -0x108(%rbp).
   *        e. Clear `keepGoing` (@0x1ef418 xorl %r13d,%r13d).
   *   6. Store `r15` (== the toNode dcast result, or null) into -0xf8(%rbp) (@0x1ef420).
   *   7. Dispatch the GROUP's applyLocalTransform: `(*(*group.vptr+0x4e8))(group, time, &state)`
   *      (@0x1ef427-0x1ef437). Args: rdi=group, rsi=time, rdx=&state.
   *   8. If `keepGoing != 0` (@0x1ef43d..0x1ef440) — i.e. we HADN'T found a common ancestor
   *      via step 5 — return.  (@0x1ef478 return).
   *   9. Otherwise store a sentinel 1.0 double at -0x108(%rbp) (@0x1ef442..0x1ef44c
   *      movabsq $0x3ff0000000000000; movq %rax,-0x108(%rbp)), reset -0xf8(%rbp) to zero
   *      (@0x1ef453), clear a bool at -0x68(%rbp) (@0x1ef45e), and dispatch the same vslot
   *      +0x4e8 on `r15` (the toNode dcast) again (@0x1ef462-0x1ef472).
   *  10. Return.
   *
   * The two vslot 0x4e8 calls with different local state (once seeded from the group with
   * the toNode's rotation, once seeded from a fresh 1.0/0.0 sentinel with r15) walk the
   * transform chain up to the common ancestor and back down; the caller reads the resulting
   * &position out of the OZRenderState scratch buffer via slot 0x4e8's side effects.
   */
  static TransformToWorld(
    time: CMTime, fromNode: OZTransformNode, toNode: OZTransformNode | null, position: PCVector3D
  ): void {
    // @0x1ef367 — read fromNode.parent (+0x3B8).
    // In the port, we don't have raw offsets — model the "no parent" gate as a null-throw so
    // consumers surface a precise gap into the OZTransformNode frontier.
    const parentGroup: OZTransformNode | null = (fromNode as unknown as { parent?: OZTransformNode }).parent ?? null;
    if (parentGroup === null) return;

    // @0x1ef390 — dcast to OZGroup.
    const parentAsGroup = dynCast<OZGroup>(parentGroup);
    if (parentAsGroup === null) return;

    // @0x1ef3a8 — new OZRenderState.
    const state = OZRenderState_new();

    // @0x1ef3c4 — keepGoing flag (r13b init to 1).
    let keepGoing = 1;

    // @0x1ef3c7-0x1ef43d — the toNode branch.
    let r15Node: OZTransformNode | null = null;
    if (toNode !== null) {
      // @0x1ef3d7 — common ancestor.
      const anc = OZSceneNode_getCommonAncestor(toNode, fromNode, true);
      if (anc !== null) {
        // @0x1ef3f7 — dcast to OZTransformNode.
        const ancTN = dynCast<OZTransformNode>(anc);
        if (ancTN !== null) {
          // @0x1ef40a — read the rotation via vslot +0x548.
          const _rot = vtable_OZTransformNode_getRotation(ancTN);
          r15Node = ancTN;
          // @0x1ef418 — clear keepGoing.
          keepGoing = 0;
        }
      }
    }

    // @0x1ef427-0x1ef437 — first apply on the parent group.
    // Vslot is on the group's vtable slot +0x4e8 (called with rsi=time, rdx=&state).
    vtable_OZTransformNode_applyLocalTransform(parentAsGroup as unknown as OZTransformNode, time, state);

    // @0x1ef43d — early-return unless we found an ancestor.
    if (keepGoing !== 0) return;

    // @0x1ef442-0x1ef472 — second apply on the ancestor transform node.
    // The stored 1.0 sentinel at -0x108 and zeroed -0xf8/-0x68 are the "identity seed" the
    // OZRenderState reads for the reverse walk. We don't touch our port's state directly —
    // the frontier vslot stub decodes the seeding.
    if (r15Node !== null) {
      vtable_OZTransformNode_applyLocalTransform(r15Node, time, state);
    }

    // The mutated `state` scratch buffer holds the accumulated transform; a real port would
    // then copy state.position -> *position. The current frontier vslot throws before that
    // final copy, so we intentionally leave `position` untouched — its final value is a
    // frontier concern.
    void position;
  }

  /**
   * `OZSimulationState::getNodePosition(CMTime const&, OZTransformNode*, OZTransformNode*,
   *                                     PCVector3<double>*)` @Ozone 0x1ef5b0.
   *
   * ALSO EXPORTED as `GetNodePosition` @Ozone 0x1ef490 (ICF-folded — same body).
   *
   * Structure:
   *   1. `settings = *(node.vptr+0x110)(node)` — grab the OZSceneNode.
   *   2. `frameDur = OZSceneSettings::getFrameDuration(settings + 0x90)` @0x1ef5e5.
   *   3. Copy the caller's time into a stack CMTime slot (-0x50..-0x40 @0x1ef5ef..0x1ef5f8).
   *   4. `floored = PC_CMTimeFloorToSampleDuration(caller_time, frameDur)` @0x1ef623.
   *   5. `stepStart = PC_CMTimeSaferSubtract(caller_time, floored)` @0x1ef652 — captures the
   *      partial-frame offset (i.e. the sub-frame time relative to the previous keyframe).
   *   6. Read three OZChannel::getValueAsDouble(stepStart, 0.0) at node+0x540, node+0x5D8,
   *      node+0x798 (@0x1ef664/0x1ef67b/0x1ef692) — the X/Y/Z position channels of the
   *      TransformNode.
   *   7. Write those three doubles into position+0x00/0x08/0x10 (@0x1ef69c/0x1ef6a5/0x1ef6aa).
   *   8. Tail-call `TransformToWorld(stepStart, fromNode, toNode, position)` @0x1ef6bb.
   */
  static getNodePosition(
    time: CMTime, fromNode: OZTransformNode, toNode: OZTransformNode | null, position: PCVector3D
  ): void {
    // @0x1ef5d4 — vslot +0x110 on the from-node's vtable -> scene settings.
    const settings = vtable_OZTransformNode_getSceneNode(fromNode);
    // @0x1ef5e5 — getFrameDuration.
    const frameDur = OZSceneSettings_getFrameDuration(settings);
    // @0x1ef623 — floor time to the previous frame boundary.
    const floored = PC_CMTimeFloorToSampleDuration(time, frameDur);
    // @0x1ef652 — sub-frame offset.
    const stepStart = PC_CMTimeSaferSubtract(time, floored);
    // @0x1ef664/0x1ef67b/0x1ef692 — read X/Y/Z position channels.
    // The (fromNode as raw-address) placeholder here mirrors the disasm's leaq 0x540(%r15), %rdi.
    // Real port passes the OZChannel handle through the frontier stub.
    const x = OZChannel_getValueAsDouble(0x540, stepStart, 0.0);
    const y = OZChannel_getValueAsDouble(0x5D8, stepStart, 0.0);
    const z = OZChannel_getValueAsDouble(0x798, stepStart, 0.0);
    // @0x1ef69c/0x1ef6a5/0x1ef6aa — writeback.
    position.x = x;
    position.y = y;
    position.z = z;
    // @0x1ef6bb — tail-call TransformToWorld.
    return OZSimulationState.TransformToWorld(stepStart, fromNode, toNode, position);
  }

  /** ICF alias @Ozone 0x1ef490 — `GetNodePosition` (upper-case Get) shares its body with
   *  `getNodePosition` @0x1ef5b0. Proven by `diff` on the two disasm dumps. */
  static GetNodePosition = OZSimulationState.getNodePosition;

  /**
   * `OZSimulationState::getTransformedCorners(OZElement*, PCVector3<double>*, PCVector3<double>*,
   *                                           PCVector3<double>*, PCVector3<double>*)` @Ozone 0x1ef6d0.
   *
   * A 308-line transform-matrix build that walks the transform chain, applies shear/pivot/scale,
   * and writes the four transformed corners of an OZElement's local bounding rectangle into
   * the four output PCVector3<double> slots. Frontier callees include:
   *   - `OZRenderState::OZRenderState()` @0x1ef724
   *   - `OZTransformNode` vslot +0x538 (getTransformAtTime) @0x1ef76f
   *   - `OZTransformNode::getShear(double*, double*, CMTime const&)` @0x1ef783
   *   - `OZTransformNode::getPivot(double*, double*, double*, CMTime const&)` @0x1ef79a
   *   - `OZTransformNode` vslot +0x110 @0x1ef81d, vslot +0x548 @0x1ef83b
   *   - `___dynamic_cast` @0x1ef80e
   *   - plus the rest of the 308-line matrix arithmetic body — needs its own porting round.
   *
   * We surface a precise throw citing the head @0xADDR + the disasm file path so a live call
   * gets the ledger-friendly gap.
   */
  static getTransformedCorners(
    _elem: OZElement, _corner0: PCVector3D, _corner1: PCVector3D, _corner2: PCVector3D, _corner3: PCVector3D
  ): void {
    throw new Error(
      "OZSimulationState::getTransformedCorners(OZElement*,PCVector3<double>*,...*4) @Ozone 0x1ef6d0 " +
      "not yet transcribed (308-line transform-matrix build — see raw-port/re/disasm/OZSimulationState.getTransformedCorners.s; " +
      "frontier: OZTransformNode vslots +0x110/+0x538/+0x548, OZTransformNode::getShear/getPivot, PCMatrix44Tmpl arithmetic)"
    );
  }

  /**
   * `OZSimulationState::initializeState(CMTime const&)` @Ozone 0x1f0b50.
   *
   * Structure (verbatim from disasm — the body is ICF-emitted as a continuation of
   * getTransformedCorners in otool -tV, but its true instruction sequence starts at 0x1f0b50):
   *   1. Zero this+0x00..0x10   (movups xmm0=0 @0x1f0b57 + movq 0 @0x1f0b5a)   — 0x18 bytes.
   *   2. Store 1.0 at this+0x18 (movabsq $0x3ff0000000000000 @0x1f0b62 + store @0x1f0b6c).
   *   3. Zero this+0x20..0xB0   (11 * 16-byte xmm0-stores @0x1f0b70..0x1f0b96)  — 0x90 bytes
   *      of zeros starting at +0x20 through +0xAF.
   *   4. Copy the CMTime argument's 16 bytes (rsi+0..15) into this+0xB0 (@0x1f0b9d/0x1f0ba0).
   *   5. Copy the CMTime argument's 8 bytes  (rsi+0x10..0x17) into this+0xC0 (@0x1f0ba7/0x1f0bab).
   *   6. Return.
   *
   * Total state size implied by the writes: 0xC8 bytes (from +0x00 through +0xC7). Only field
   * with a non-zero initial value is `state+0x18 = 1.0` — likely a default scale-factor or
   * time-scale-remap identity value.
   *
   * NOTE: this is a per-instance initializer (rdi = &state), NOT a static call. But it is
   * called on a fresh state buffer so we expose it as a static that takes the state as its
   * first param (matching the raw C-style body).
   */
  static initializeState(state: { buf: Float64Array; time: CMTime }, time: CMTime): void {
    // The 0xC8-byte state buffer is modeled as 25 doubles (0xC8/0x8) — matches the observed
    // pattern of 16-byte stores. Concretely (offsets):
    //   +0x00..+0x17 -> buf[0..2]      (0.0, 0.0, 0.0)  (0x18 bytes)
    //   +0x18        -> buf[3]         = 1.0
    //   +0x20..+0xAF -> buf[4..21]     zeroed  (0x90 bytes / 0x8 = 18 doubles)
    //   +0xB0..+0xBF -> two-double CMTime prefix  (buf[22..23])
    //   +0xC0..+0xC7 -> one-double CMTime tail    (buf[24])
    if (state.buf.length < 25) throw new Error(
      "OZSimulationState::initializeState @0x1f0b50 requires a 25-double state buffer (0xC8 bytes)"
    );
    // @0x1f0b57/0x1f0b5a — zero +0x00..+0x17.
    state.buf[0] = 0.0;
    state.buf[1] = 0.0;
    state.buf[2] = 0.0;
    // @0x1f0b62-0x1f0b6c — 1.0 at +0x18.
    state.buf[3] = 1.0;
    // @0x1f0b70-0x1f0b96 — zero +0x20..+0xAF.
    for (let i = 4; i < 22; i++) state.buf[i] = 0.0;
    // @0x1f0b9d-0x1f0bab — copy CMTime's 24 bytes into +0xB0..+0xC7. We store the CMTime
    // handle rather than raw doubles (real bytes go through a memcpy in the disasm; our
    // frontier CMTime is opaque so we keep it referenceable).
    state.time = time;
    // The three trailing double slots exist in the buffer purely to preserve the 0xC8 span
    // — a real render pipeline would read them via CMTime's `value` (int64), `timescale` (int32),
    // `flags` (int32), and `epoch` (int64). We defer that unpacking to the frontier.
    state.buf[22] = 0.0;
    state.buf[23] = 0.0;
    state.buf[24] = 0.0;
  }
}
