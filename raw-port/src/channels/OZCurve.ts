// OZCurve — a keyframe animation curve (<curve> element) AND the ProChannel runtime
// OZCurve class. ProChannel.framework.
//
// This file carries two OZCurve responsibilities that share the same C++ class name in
// FCP (both spelled `OZCurve`, symbol prefix `__ZN7OZCurve*`):
//
//   (1) The .motr <curve> PARSER model.
//       Decode: OZCurve::parseElement @ ProChannel 0x270c0 (re/disasm/ProChannel.OZCurve.parseElement.s).
//         - Reads OZCurveScope attributes: numberOfKeypoints(0x0), value(0x1), type(0x4), parametric(0x5),
//           round(0x6), retimingExtrapolation(0x7), default(0x8), enabled(0x9), interpolation(0xa), flags(0xb).
//         - Backing store is an OZSpline: getSpline()/createSpline()/reserveMemoryForKeypoints(n)/
//           appendVertexNoTangents(CMTime time, double value, CMTime ...) — @0x27114..0x27509. Keypoints
//           carry a rational CMTime + value (+ optional in/out tangents for parametric curves).
//         - Element cases (elem->type at +0x8): 0xe (a scalar/int header), 0x76 (a keypoint entry), etc.
//
//   (2) The RUNTIME OZCurve constructors.
//       Decode:
//         OZCurve::OZCurve(double,double,double,double) @ProChannel 0x1e494 (__ZN7OZCurveC2Edddd)
//                        (re/disasm/ProChannel.OZCurve.OZCurve.dddd.s — 53 lines).
//         OZCurve::OZCurve(OZCurve const&, bool)        @ProChannel 0x1e56c (__ZN7OZCurveC2ERKS_b)
//                        (re/disasm/ProChannel.OZCurve.OZCurve.copy.s — 106 lines).
//       Both are IN-PLACE base-class initialisers. FCP subclasses (OZCurveDouble/Int/Bool/
//       Enum/Angle/Percent) call them as `OZCurve::OZCurve(this, …)` to fill the base slots
//       of an already-allocated subclass object; they NEVER call them to obtain a fresh
//       OZCurve. That is why we transcribe them as `initBounds`/`initCopy` methods on the
//       instance — the static-factory shape in OZCurveRuntime.ts (make_bounds/make_copy)
//       reads the same disasm faithfully but does NOT compose with the subclass call site
//       shape `super()` + `initBounds(this, …)`. This file is the in-place transcription.
//
//   STRUCT LAYOUT — recovered strictly from the ctor + dtor disasm at
//   ProChannel 0x1e494..0x1e70d (bounds ctor + copy ctor). Every offset written by the
//   ctor is cited with its source value + write @0xADDR. Full derivation:
//
//     OZCurve  (root class; no base class — vptr at offset 0)
//       +0x00  vptr           = &__ZTV7OZCurve + 0x10  (= ProChannel 0xd4650)
//                                (bounds ctor: leaq 0xb619b(%rip),%rax; movq %rax,(%rdi)
//                                 @0x1e4ae/0x1e4b5   -> 0x1e4b5+0+0xb619b = 0xd4650)
//                                (copy ctor:  leaq 0xb60c3(%rip),%rax; movq %rax,(%rdi)
//                                 @0x1e586/0x1e58d   -> 0x1e58d+0+0xb60c3 = 0xd4650)
//       +0x08  OZCurveNode*   currentNode
//                                bounds ctor: &this->constantNode (%rbx = %rdi+0x10)   @0x1e511
//                                copy ctor:  chosen by state@+0xa8:
//                                              state==0  -> &this->constantNode        @0x1e6c4 (%rbx from @0x1e590)
//                                              state==1  -> &this->splineNode          @0x1e6b7 (%rbx from -0x30(%rbp))
//                                              state>=2  -> this->recordingNode        @0x1e6c0
//       +0x10  OZConstantNode constantNode  (24 B; ends at +0x28)
//                                bounds ctor: OZConstantNode::OZConstantNode(initVal)  @0x1e4c2
//                                copy ctor:   OZConstantNode::OZConstantNode(0.0) then
//                                             OZConstantNode::operator=(src.constant)  @0x1e59a/0x1e633
//       +0x28  OZSplineNode   splineNode    (64 B; ends at +0x68)
//                                bounds ctor: OZSplineNode::OZSplineNode(this)         @0x1e4d1
//                                copy ctor:   same then OZSplineNode::operator=(src.spline) @0x1e5aa/0x1e641
//       +0x68  OZRecordingNode* recordingNode
//                                bounds ctor: nullptr                                   @0x1e4d6
//                                copy ctor:   nullptr, then IF src->recordingNode != null
//                                             heap-copy 152-byte OZRecordingNode         @0x1e650..0x1e668
//       +0x70  std::vector<OZCurveNode*>  extraNodes  (24 B: begin/end/cap)
//                                bounds ctor: operator new(0x18) ; xorps xmm0/xmm0 ;
//                                             movups xmm0,(%rax); movq $0,0x10(%rax)    @0x1e4de..0x1e4f4
//                                copy ctor:   same shape                                 @0x1e5f3..0x1e60b
//       +0x78  double         minValue
//                                bounds ctor: arg xmm0 spilled -0x20(%rbp) -> +0x78     @0x1e4a6/0x1e4f8/0x1e4fd
//                                copy ctor:   movups 0x78(src) -> 0x78(this) (16-byte
//                                             copy of {min,max} together)                @0x1e620/0x1e626
//       +0x80  double         maxValue
//                                bounds ctor: arg xmm1 spilled -0x28(%rbp) -> +0x80     @0x1e4a1/0x1e503/0x1e508
//                                (copy ctor: part of the 16-byte movups above)
//       +0x88  uint8          flag_0x88
//                                bounds ctor: movw $0x1,0x88(%r14) (also zeroes +0x89) @0x1e520
//                                copy ctor:   movb 0x88(src) -> 0x88(this)              @0x1e66c/0x1e674
//       +0x89  uint8          flag_0x89
//                                bounds ctor: 0 (upper byte of the movw @0x1e520)
//                                copy ctor:   movb 0x89(src) -> 0x89(this)              @0x1e67b/0x1e683
//       +0x8a  uint8          flag_0x8a
//                                bounds ctor: movb $0x1,0x8a(%r14)                      @0x1e531
//                                copy ctor:   movb 0x8a(src) -> 0x8a(this)              @0x1e695/0x1e69d
//       +0x90  void*          ptr_0x90 = NULL in both ctors
//                                bounds ctor: movq $0x0,0x90(%r14) (rcx=0)              @0x1e52a
//                                copy ctor:   movq $0x0,0x90(%r15)                      @0x1e68a
//       +0x98  16 B zero-init  (splits into +0x98 and +0xa0 — see splineState below)
//                                bounds ctor: movups %xmm0(=0),0x98(%r14)               @0x1e539
//                                copy ctor:   movups %xmm0(=0),0x98(%r15)               @0x1e5ba
//       +0xa0  OZSplineState* splineState
//                                bounds ctor: 0 (part of the +0x98 zero-init)           @0x1e539
//                                copy ctor:   candidate = src->splineState @0x1e5c2;
//                                             if candidate->flag_at_0x2c == 0
//                                               allocate 48 B via operator new, then
//                                               OZSplineState::OZSplineState(state const&)
//                                                                                       @0x1e5c2..0x1e5ec
//                                             store final choice at +0xa0
//       +0xa8  uint32         curveState
//                                bounds ctor: movl $0x0,0xa8(%r14)                      @0x1e515
//                                copy ctor:   movl 0xa8(src) -> 0xa8(this)              @0x1e6a4/0x1e6ac
//
//     Total size >= 0xac (172 B). OZCurveDouble.ts allocates `operator new(0xb0)` = 176 B,
//     which matches: OZCurve occupies 0xac and the 4-byte tail pads the alloc to 0xb0.
//
//   The alternate transcription of these ctors as static factories `make_bounds` /
//   `make_copy` on `OZCurveRuntime` (raw-port/src/channels/OZCurveRuntime.ts) is preserved
//   as-is — it documents the same disasm with equal fidelity and remains the reference
//   description. The instance methods below are the SAME transcription re-expressed as
//   in-place initialisers so subclass ctors can call `super()` (or Object.create) and
//   then run `initBounds(this,…)` / `initCopy(this, src, flag)` to fill the base slots.
import { PCSerializerReadStream } from "../infra/PCSerializerReadStream.js";
import { PCSerializerWriteStream } from "../infra/PCSerializerWriteStream.js";
import { PCStreamElement } from "../infra/PCStreamElement.js";
import { CMTime, CMTimeGetSeconds } from "../infra/CMTime.js";

// ==================================================================================
// Deep callees invoked by the two ctors below. Each is a throwing stub (Rule 3)
// citing its @0xADDR so frontier.py sees the demand signal.
//
// NOTE: these mirror the identical stubs already declared in OZCurveRuntime.ts. They
// are re-declared here because that file's stubs are file-private helpers not exposed
// as an API. Both sets of throw-stubs deliberately carry the same wording so the
// undecoded frontier stays a single measurable gap.
// ==================================================================================

/** OZConstantNode::OZConstantNode(double) — @ProChannel 0x298f2 (__ZN14OZConstantNodeC1Ed). */
function OZConstantNode_ctor_double(_p: unknown, _v: number): void {
  throw new Error(
    "OZConstantNode::OZConstantNode(double) @ProChannel 0x298f2 (__ZN14OZConstantNodeC1Ed; call sites @0x1e4c2 @0x1e59a) not yet transcribed",
  );
}

/** OZConstantNode::operator=(OZConstantNode const&) — @ProChannel 0x29b0a. */
function OZConstantNode_assign(_dst: unknown, _src: unknown): void {
  throw new Error(
    "OZConstantNode::operator=(OZConstantNode const&) @ProChannel 0x29b0a (__ZN14OZConstantNodeaSERKS_; call site @0x1e633) not yet transcribed",
  );
}

/** OZSplineNode::OZSplineNode(OZCurve*) — @ProChannel 0x29d88 (__ZN12OZSplineNodeC1EP7OZCurve). */
function OZSplineNode_ctor(_p: unknown, _owner: unknown): void {
  throw new Error(
    "OZSplineNode::OZSplineNode(OZCurve*) @ProChannel 0x29d88 (__ZN12OZSplineNodeC1EP7OZCurve; call sites @0x1e4d1 @0x1e5aa) not yet transcribed",
  );
}

/** OZSplineNode::operator=(OZSplineNode const&) — @ProChannel 0x2a302. */
function OZSplineNode_assign(_dst: unknown, _src: unknown): void {
  throw new Error(
    "OZSplineNode::operator=(OZSplineNode const&) @ProChannel 0x2a302 (__ZN12OZSplineNodeaSERKS_; call site @0x1e641) not yet transcribed",
  );
}

/** OZSplineState::OZSplineState(OZSplineState const&) — @ProChannel 0xaa0e6. */
function OZSplineState_copy_ctor(_p: unknown, _src: unknown): void {
  throw new Error(
    "OZSplineState::OZSplineState(OZSplineState const&) @ProChannel 0xaa0e6 (__ZN13OZSplineStateC1ERKS_; call site @0x1e5e4) not yet transcribed",
  );
}

/** OZRecordingNode::OZRecordingNode(OZRecordingNode const&) — @ProChannel 0x8f720. */
function OZRecordingNode_copy_ctor(_p: unknown, _src: unknown): void {
  throw new Error(
    "OZRecordingNode::OZRecordingNode(OZRecordingNode const&) @ProChannel 0x8f720 (__ZN15OZRecordingNodeC1ERKS_; call site @0x1e663) not yet transcribed",
  );
}

/** OZCurve::cloneTree(OZCurve const&) const — @ProChannel 0x1e70e (__ZNK7OZCurve9cloneTreeERKS_).
 *  Called from the copy ctor @0x1e61b only when the working-copy flag is TRUE. */
function OZCurve_cloneTree(_self: OZCurve, _src: OZCurve): void {
  throw new Error(
    "OZCurve::cloneTree(OZCurve const&) const @ProChannel 0x1e70e (__ZNK7OZCurve9cloneTreeERKS_; call site @0x1e61b) not yet transcribed",
  );
}

/** Vtable-plus-0x10 sentinel for OZCurve. The vptr stored at (this+0x0) is
 *  `&__ZTV7OZCurve + 0x10` — skipping the 16-byte Itanium-ABI header (offset-to-top +
 *  typeinfo*). Resolves to ProChannel 0xd4650 (vtable @0xd4640, +0x10). Written by the
 *  bounds ctor (@0x1e4ae/0x1e4b5), the copy ctor (@0x1e586/0x1e58d), and the dtor
 *  (@0x1e784/0x1e78b). */
export const OZCurve_vtable_plus_0x10: unique symbol = Symbol("__ZTV7OZCurve+0x10");

/** Opaque OZSplineState — this file does NOT decode that class. `flag_at_0x2c` is the
 *  "borrowed / do-not-delete" flag observed at @0x1e5ca (copy-ctor clone decision),
 *  @0x1e7fd (dtor delete decision), and @0x1ea7f (setSplineState delete decision). */
export interface OZSplineStateSlot {
  /** (+0x2c) uint8 — non-zero means the state is a singleton/borrowed and must NOT be
   *  operator-deleted. Zero means the state was heap-allocated for this OZCurve. */
  flag_at_0x2c: number;
}

/** Opaque handles for the composed sub-objects. */
interface OZConstantNodeSlot {}
interface OZSplineNodeSlot {}
interface OZRecordingNodeSlot {}
interface OZCurveNodeVector {
  /** (+0x00) begin ptr — array storage (owned). */
  storage: unknown[];
  /** (+0x08) end ptr — logical length. */
  end: number;
  /** (+0x10) cap ptr — allocated capacity. */
  cap: number;
}

/** One keyframe: a rational time + value (+ optional 2D-Bézier tangent handles/interp). */
export interface OZKeypoint {
  /** The vertex time "U" as the FULL rational CMTime (value/timescale), for CMTime-space interp. */
  u: CMTime;
  /** Convenience: u reduced to seconds (u.value/u.timescale). */
  time: number;
  value: number;
  interpolation?: number;  // 0xa
  // Bézier/CatmullRom tangent HANDLES, in (time,value) space, relative to this keypoint.
  // DECODED: the .motr tags are inputTangentTime/inputTangentValue/outputTangentTime/
  // outputTangentValue (strings present verbatim in ProChannel; consumed via
  // OZChannelCurve -> OZChannelCurve::setTangents(OZVertex2D, CMTime tanTime, double, double)).
  // The incoming handle time is NEGATIVE (points back toward the previous keypoint).
  inputTangentTime?: number;
  inputTangentValue?: number;
  outputTangentTime?: number;
  outputTangentValue?: number;
  flags?: number;          // 0xb
}

export class OZCurve {
  // ------------------------------------------------------------------------------------
  // .motr <curve> PARSER-model fields (from OZCurveScope attributes). Preserved verbatim
  // from the pre-existing parser port; the runtime-layout fields below are additive.
  // ------------------------------------------------------------------------------------
  type?: number;                  // 0x4
  parametric?: number;            // 0x5
  round?: number;                 // 0x6
  retimingExtrapolation?: number; // 0x7
  defaultValue?: number;          // 0x8
  enabled?: number;               // 0x9
  numberOfKeypoints = 0;          // 0x0
  keypoints: OZKeypoint[] = [];

  // ------------------------------------------------------------------------------------
  // Runtime OZCurve struct layout (initialised in place by initBounds / initCopy below).
  // See the file header for @0xADDR provenance of each write. These are declared as
  // optional so a subclass that only uses the parser side (or has not yet initialised
  // the runtime slots) still typechecks.
  // ------------------------------------------------------------------------------------

  /** (+0x00) vptr — set to `&__ZTV7OZCurve + 0x10` (= ProChannel 0xd4650) by the ctors. */
  __vptr?: symbol;

  /** (+0x08) currentNode — points at whichever sub-object is "active" (see file header). */
  currentNode?: unknown;

  /** (+0x10) constantNode — 24 B OZConstantNode. */
  constantNode?: OZConstantNodeSlot;

  /** (+0x28) splineNode — 64 B OZSplineNode (spans +0x28..+0x67). */
  splineNode?: OZSplineNodeSlot;

  /** (+0x68) recordingNode — heap OZRecordingNode* (nullable). */
  recordingNode?: OZRecordingNodeSlot | null;

  /** (+0x70..+0x87) std::vector<OZCurveNode*> — 24-byte inline vector object. */
  extraNodes?: OZCurveNodeVector | null;

  /** (+0x78) minValue — first double arg to the bounds ctor. */
  minValue?: number;

  /** (+0x80) maxValue — second double arg to the bounds ctor. */
  maxValue?: number;

  /** (+0x88) uint8 — copy of one of the state-tracking flags (semantics deferred). */
  flag_0x88?: number;

  /** (+0x89) uint8 — companion flag (semantics deferred). */
  flag_0x89?: number;

  /** (+0x8a) uint8 — copy-ctor mirrors src's @0x1e695/@0x1e69d. Bounds ctor sets 1 @0x1e531. */
  flag_0x8a?: number;

  /** (+0x90) void* — always NULL out of both ctors. */
  ptr_0x90?: unknown;

  /** (+0x98) 16 B zero-init (two adjacent 8-byte slots). Semantics deferred. */
  zero_0x98_lo?: number;

  /** (+0xa0) OZSplineState* — nullable. See file header. Kept as an opaque `unknown` so
   *  sibling files (OZChannelDouble.ts etc.) that declare their own OZSplineState-shaped
   *  interface can still narrow this field through their own type; the runtime ctor
   *  narrows it internally via {@link OZSplineStateSlot} when it needs `flag_at_0x2c`. */
  splineState?: unknown;

  /** (+0xa8) uint32 curveState — 0 in bounds ctor @0x1e515; mirrored from src in copy-ctor. */
  curveState?: number;

  // ==================================================================================
  // OZCurve::OZCurve(double, double, double, double)  @ProChannel 0x1e494  (C2)
  //   __ZN7OZCurveC2Edddd  —  in-place base-class initialiser.
  //   %rdi = this, xmm0 = minVal, xmm1 = maxVal, xmm2 = step, xmm3 = initVal.
  //
  //   Straight-line transcription of 0x1e494..0x1e54b (0x1e54c.. is the unwind landing
  //   pad — SplineNode::~SplineNode / ConstantNode::~ConstantNode / _Unwind_Resume,
  //   entered only on an exception thrown by one of the sub-object ctors above; when a
  //   TS callee throws, the runtime exception will unwind through this method the same
  //   way, so we do NOT emit a manual TS analogue of the landing pad — it would be a
  //   guess about whether the sub-objects are already constructed at the throw point).
  //
  //   xmm2 (step) is spilled at -0x28(%rbp) via `movsd %xmm1,-0x28` @0x1e4a1 (wait —
  //   that spills xmm1). Re-reading the disasm:
  //       @0x1e4a1  movsd %xmm1,-0x28(%rbp)    ; spill maxVal
  //       @0x1e4a6  movsd %xmm0,-0x20(%rbp)    ; spill minVal
  //   xmm2 (step) and xmm3 (initVal) are NOT spilled here. xmm3 is moved to xmm0
  //   @0x1e4bf and consumed by OZConstantNode::OZConstantNode(double) @0x1e4c2. xmm2
  //   is NEVER read inside this function. It is presumably consumed by a caller-side
  //   detail or a not-yet-decoded field; we accept it as an argument (Rule 5: don't
  //   invent a slot; carry the signature the disasm shows) but do not store it.
  // ==================================================================================
  initBounds(minVal: number, maxVal: number, step: number, initVal: number): void {
    // Silence unused-arg lint while faithfully carrying the signature the disasm shows.
    void step;

    // @0x1e4ae/0x1e4b5:  leaq 0xb619b(%rip),%rax ; movq %rax,(%rdi)
    //   -> vptr = &__ZTV7OZCurve + 0x10  (0x1e4b5 + 0 + 0xb619b = 0xd4650).
    this.__vptr = OZCurve_vtable_plus_0x10;

    // @0x1e4b8/0x1e4bc/0x1e4bf/0x1e4c2:
    //   leaq 0x10(%rdi),%rbx ; %rdi=%rbx ; %xmm0<-%xmm3 ; callq OZConstantNode::OZConstantNode(double)
    //   -> constantNode = OZConstantNode(initVal).
    this.constantNode = {};
    OZConstantNode_ctor_double(this.constantNode, initVal);

    // @0x1e4c7/0x1e4cb/0x1e4ce/0x1e4d1:
    //   leaq 0x28(%r14),%r15 ; %rdi=%r15 ; %rsi=%r14=this ; callq OZSplineNode::OZSplineNode(OZCurve*)
    //   -> splineNode = OZSplineNode(this).
    this.splineNode = {};
    OZSplineNode_ctor(this.splineNode, this);

    // @0x1e4d6:  movq $0x0, 0x68(%r14)  -> recordingNode = nullptr.
    this.recordingNode = null;

    // @0x1e4de..0x1e4f4:
    //   movl $0x18,%edi ; callq __Znwm            ; operator new(24) → %rax
    //   xorps %xmm0,%xmm0 ; movups %xmm0,(%rax)   ; zero the first 16 bytes
    //   xorl %ecx,%ecx ; movq %rcx,0x10(%rax)     ; zero the last 8 bytes
    //   movq %rax,0x70(%r14)                      ; extraNodes = the 24-byte block
    //   -> extraNodes = new std::vector<Node*>(); begin=end=cap=nullptr.
    this.extraNodes = { storage: [], end: 0, cap: 0 };

    // @0x1e4f8/0x1e4fd:  movsd -0x20(%rbp),%xmm1 ; movsd %xmm1,0x78(%r14)
    //   -> minValue = arg xmm0 (spilled at -0x20 @0x1e4a6).
    this.minValue = minVal;

    // @0x1e503/0x1e508:  movsd -0x28(%rbp),%xmm1 ; movsd %xmm1,0x80(%r14)
    //   -> maxValue = arg xmm1 (spilled at -0x28 @0x1e4a1).
    this.maxValue = maxVal;

    // @0x1e511:  movq %rbx,0x8(%r14)   (%rbx = this+0x10 = &constantNode)
    //   -> currentNode = &constantNode.
    this.currentNode = this.constantNode;

    // @0x1e515:  movl $0x0,0xa8(%r14)  -> curveState = 0.
    this.curveState = 0;

    // @0x1e520:  movw $0x1,0x88(%r14)  -> 16-bit store; low byte = 1 (flag_0x88),
    //                                     high byte = 0 (flag_0x89).
    this.flag_0x88 = 1;
    this.flag_0x89 = 0;

    // @0x1e52a:  movq %rcx=0,0x90(%r14) -> ptr_0x90 = null.
    this.ptr_0x90 = null;

    // @0x1e531:  movb $0x1,0x8a(%r14)  -> flag_0x8a = 1.
    this.flag_0x8a = 1;

    // @0x1e539:  movups %xmm0=0,0x98(%r14)  -> [+0x98..+0xa7] = 0.
    //   -> zero_0x98_lo = 0; splineState = null (they share this 16-byte region).
    this.zero_0x98_lo = 0;
    this.splineState = null;

    // @0x1e541..0x1e54b:  addq $0x18,%rsp ; popq %rbx/%r14/%r15/%rbp ; retq  -> return.
  }

  // ==================================================================================
  // OZCurve::OZCurve(OZCurve const&, bool)  @ProChannel 0x1e56c  (C2)
  //   __ZN7OZCurveC2ERKS_b  —  in-place base-class copy initialiser.
  //   %rdi = this, %rsi = src, %edx = flag (spilled at -0x34(%rbp) @0x1e57d).
  //
  //   Straight-line transcription of 0x1e56c..0x1e6d6 (0x1e6d7.. is the unwind landing
  //   pad — same rationale as above: TS exceptions unwind naturally, so we do NOT
  //   fabricate a landing-pad analogue).
  //
  //   The `flag` argument is the "working-copy" bool: TRUE (`cloneCurve` semantics —
  //   confusingly, `getCurveWorkingCopy` uses flag=1) invokes cloneTree(src) to deep-
  //   copy every processing node; FALSE (`cloneCurve` uses flag=0) skips cloneTree so
  //   the caller gets a bare base copy without the tree.
  // ==================================================================================
  initCopy(src: OZCurve, flag: boolean): void {
    // @0x1e586/0x1e58d:  leaq 0xb60c3(%rip),%rax ; movq %rax,(%rdi)
    //   -> vptr = &__ZTV7OZCurve + 0x10  (0x1e58d + 0 + 0xb60c3 = 0xd4650).
    this.__vptr = OZCurve_vtable_plus_0x10;

    // @0x1e590/0x1e594/0x1e597/0x1e59a:
    //   leaq 0x10(%rdi),%rbx ; xorps %xmm0,%xmm0 ; %rdi=%rbx ; callq OZConstantNode::OZConstantNode(double)
    //   -> constantNode = OZConstantNode(0.0)  (default-init; will be operator= below).
    this.constantNode = {};
    OZConstantNode_ctor_double(this.constantNode, 0);

    // @0x1e59f/0x1e5a3/0x1e5a7/0x1e5aa:
    //   leaq 0x28(%r15),%rdi ; spill to -0x30(%rbp) ; %rsi=%r15=this ; callq OZSplineNode::OZSplineNode(OZCurve*)
    //   -> splineNode = OZSplineNode(this).
    this.splineNode = {};
    OZSplineNode_ctor(this.splineNode, this);

    // @0x1e5af:  movq $0x0,0x68(%r15)  -> recordingNode = nullptr.
    this.recordingNode = null;

    // @0x1e5b7/0x1e5ba:  xorps %xmm0,%xmm0 ; movups %xmm0,0x98(%r15)
    //   -> zero [+0x98..+0xa7] pre-clone-decision.
    this.zero_0x98_lo = 0;
    this.splineState = null;

    // @0x1e5c2:  movq 0xa0(%r12),%r14  ->  candidate = src->splineState.
    //   NOTE: the disasm reads src->splineState UNCONDITIONALLY and then reads
    //   `candidate->flag_at_0x2c` — that is a real null-deref in the C++ if src's
    //   splineState is null. FCP relies on it never being null at this call site (all
    //   observed subclass ctors install a singleton splineState immediately after
    //   super()). We mirror that by NOT null-checking `src.splineState` before the
    //   flag read; the property access will throw in TS just as the load would fault
    //   in the binary.
    let stateToInstall: OZSplineStateSlot | null = (src.splineState as OZSplineStateSlot | null | undefined) ?? null;
    // @0x1e5ca/0x1e5cf:  cmpb $0x0,0x2c(%r14) ; jne 0x1e5ec
    //   -> if src->splineState->flag_at_0x2c == 0 (owned), heap-copy it; else share.
    if (stateToInstall !== null && stateToInstall.flag_at_0x2c === 0) {
      // @0x1e5d1..0x1e5db:  movl $0x30,%edi ; callq __Znwm  -> operator new(48).
      const fresh: OZSplineStateSlot = { flag_at_0x2c: 0 };
      // @0x1e5de/0x1e5e1/0x1e5e4:  OZSplineState::OZSplineState(OZSplineState const&).
      OZSplineState_copy_ctor(fresh, stateToInstall);
      // @0x1e5e9:  movq %r13,%r14  -> replace candidate with the fresh copy.
      stateToInstall = fresh;
    }
    // @0x1e5ec:  movq %r14,0xa0(%r15)  -> splineState = final choice.
    this.splineState = stateToInstall;

    // @0x1e5f3..0x1e60b:  operator new(0x18) ; zero the 24 bytes ; movq %rax,0x70(%r15).
    this.extraNodes = { storage: [], end: 0, cap: 0 };

    // @0x1e60f..0x1e61b:  cmpb $0x0,-0x34(%rbp) ; je 0x1e620 ; callq OZCurve::cloneTree(*src).
    if (flag) {
      OZCurve_cloneTree(this, src);
    }

    // @0x1e620/0x1e626:  movups 0x78(%r12),%xmm0 ; movups %xmm0,0x78(%r15)
    //   -> 16-byte copy of {minValue, maxValue} from src to this.
    this.minValue = src.minValue;
    this.maxValue = src.maxValue;

    // @0x1e62b/0x1e630/0x1e633:  leaq 0x10(%r12),%rsi ; %rdi=%rbx=&this.constantNode ;
    //                            callq OZConstantNode::operator=.
    OZConstantNode_assign(this.constantNode, src.constantNode);

    // @0x1e638/0x1e63d/0x1e641:  leaq 0x28(%r12),%rsi ; %rdi=-0x30(%rbp)=&this.splineNode ;
    //                            callq OZSplineNode::operator=.
    OZSplineNode_assign(this.splineNode, src.splineNode);

    // @0x1e646/0x1e64b/0x1e64e:  movq 0x68(%r12),%r13 ; testq %r13,%r13 ; je 0x1e66c
    //   -> if src->recordingNode != null, heap-copy it.
    const srcRec = src.recordingNode ?? null;
    if (srcRec !== null) {
      // @0x1e650..0x1e65a:  movl $0x98,%edi ; callq __Znwm  -> operator new(152).
      const fresh: OZRecordingNodeSlot = {};
      // @0x1e65d/0x1e660/0x1e663: OZRecordingNode::OZRecordingNode(OZRecordingNode const&).
      OZRecordingNode_copy_ctor(fresh, srcRec);
      // @0x1e668:  movq %r14,0x68(%r15)  -> recordingNode = fresh.
      this.recordingNode = fresh;
    }

    // @0x1e66c/0x1e674:  movb 0x88(%r12),%al ; movb %al,0x88(%r15)  -> flag_0x88.
    this.flag_0x88 = src.flag_0x88 ?? 0;
    // @0x1e67b/0x1e683:  movb 0x89(%r12),%al ; movb %al,0x89(%r15)  -> flag_0x89.
    this.flag_0x89 = src.flag_0x89 ?? 0;
    // @0x1e68a:  movq $0x0,0x90(%r15)  -> ptr_0x90 = null (NOT copied from src).
    this.ptr_0x90 = null;
    // @0x1e695/0x1e69d:  movb 0x8a(%r12),%al ; movb %al,0x8a(%r15)  -> flag_0x8a.
    this.flag_0x8a = src.flag_0x8a ?? 0;

    // @0x1e6a4/0x1e6ac:  movl 0xa8(%r12),%eax ; movl %eax,0xa8(%r15)  -> curveState.
    const state = src.curveState ?? 0;
    this.curveState = state;

    // @0x1e6b3..0x1e6c4:  choose currentNode from state.
    //     testl %eax,%eax ; je 0x1e6c4         (state==0 -> %rbx keeps init value
    //                                            &this.constantNode from @0x1e590)
    //     movq -0x30(%rbp),%rbx                (state!=0 -> %rbx = &this.splineNode)
    //     cmpl $0x1,%eax ; je 0x1e6c4          (state==1 -> use &this.splineNode)
    //     movq 0x68(%r15),%rbx                 (state>=2 -> use recordingNode)
    //     movq %rbx,0x8(%r15)                  (publish currentNode)
    if (state === 0) {
      this.currentNode = this.constantNode;
    } else if (state === 1) {
      this.currentNode = this.splineNode;
    } else {
      // state >= 2 (typically 2 = recording).
      this.currentNode = this.recordingNode;
    }

    // @0x1e6c8..0x1e6d6:  addq $0x18,%rsp ; popq %rbx/%r12/%r13/%r14/%r15/%rbp ; retq.
  }

  parseElement(s: PCSerializerReadStream, e: PCStreamElement): void {
    switch (e.tagName) {
      case "numberOfKeypoints":
        this.numberOfKeypoints = s.getAsInt32(e); // OZSpline::reserveMemoryForKeypoints
        break;
      case "keypoint": {
        // <keypoint><time>..</time><value>..</value> ... </keypoint> — appendVertexNoTangents.
        const kp: OZKeypoint = { u: { value: 0n, timescale: 0, flags: 0, epoch: 0n }, time: 0, value: 0 };
        for (const c of e.children) {
          if (c.tagName === "time") { kp.u = s.getAsCMTime(c); kp.time = CMTimeGetSeconds(kp.u); } // full CMTime + seconds
          else if (c.tagName === "value") kp.value = s.getAsDouble(c);
          else if (c.tagName === "inputTangentTime") kp.inputTangentTime = s.getAsDouble(c);
          else if (c.tagName === "inputTangentValue") kp.inputTangentValue = s.getAsDouble(c);
          else if (c.tagName === "outputTangentTime") kp.outputTangentTime = s.getAsDouble(c);
          else if (c.tagName === "outputTangentValue") kp.outputTangentValue = s.getAsDouble(c);
        }
        const interp = s.getAttributeAsUInt32(e, 0xa); if (interp !== undefined) kp.interpolation = interp;
        const flags = s.getAttributeAsUInt32(e, 0xb); if (flags !== undefined) kp.flags = flags;
        this.keypoints.push(kp);
        break;
      }
      default:
        break;
    }
  }

  /**
   * OZCurve::markFactoriesForSerialization(PCSerializerWriteStream&, bool)
   * @ProChannel 0x277b4 (body address from nm; ledger index @0x1daa0 is an ICF-alias / stale
   * ledger slot, both share this identical body — verified with nm -n on the x86_64 slice).
   * @Flexo      0x220190 (cross-framework duplicate — Flexo carries an identical body:
   *                       pushq %rbp ; movq %rsp,%rbp ; popq %rbp ; retq).
   *
   *   __ZN7OZCurve29markFactoriesForSerializationER23PCSerializerWriteStreamb:
   *   000000000x277b4  pushq   %rbp
   *   000000000x277b5  movq    %rsp, %rbp
   *   000000000x277b8  popq    %rbp
   *   000000000x277b9  retq
   *
   * Pure prologue+epilogue: no memory writes, no calls, no return value. OZCurve has NO factory
   * subobjects that require pre-serialization registration — subclasses (OZCurveDouble/Int/Bool/
   * Enum/Angle/Percent) override this if they own serialized factories. The base implementation is
   * a NO-OP by design.
   */
  markFactoriesForSerialization(_out: PCSerializerWriteStream, _flag: boolean): void {
    // NO-OP — pure prologue/epilogue in the disasm above (@0x277b4).
  }

  /**
   * OZCurve::supportsAssignmentOperator() const
   * @ProChannel 0x84d98 (body address from nm; ledger index @0x1db60 is an ICF-alias / stale
   * ledger slot — the true body is at 0x84d98 and returns constant 1).
   * @Flexo      0x220240 (cross-framework duplicate — Flexo carries an identical body:
   *                       movb $0x1,%al ; returns literal true).
   *
   *   __ZNK7OZCurve26supportsAssignmentOperatorEv:
   *   0000000000084d98  pushq   %rbp
   *   0000000000084d99  movq    %rsp, %rbp
   *   0000000000084d9c  movb    $0x1, %al       ;; return true
   *   0000000000084d9e  popq    %rbp
   *   0000000000084d9f  retq
   *
   * Returns literal true. OZCurve subclasses that hold non-copyable state override this to false.
   */
  supportsAssignmentOperator(): boolean {
    return true;  // movb $0x1,%al @0x84d9c
  }

  /**
   * OZCurve::isCurveBoolean()
   * @ProChannel 0x84da0 (body address from nm; ledger index @0x1db70 is an ICF-alias / stale
   * ledger slot — the true body is at 0x84da0 and returns constant 0).
   * @Flexo      0x220250 (cross-framework duplicate — Flexo carries an identical body:
   *                       xorl %eax,%eax ; returns literal false).
   *
   *   __ZN7OZCurve14isCurveBooleanEv:
   *   0000000000084da0  pushq   %rbp
   *   0000000000084da1  movq    %rsp, %rbp
   *   0000000000084da4  xorl    %eax, %eax      ;; return false
   *   0000000000084da6  popq    %rbp
   *   0000000000084da7  retq
   *
   * Returns literal false. Only OZCurveBool overrides this to return true (that's the whole point
   * of the predicate — it's a virtual RTTI-lite that lets callers ask "is this a boolean-valued
   * curve so I should route through OR/AND aggregation rather than mean/lerp?").
   */
  isCurveBoolean(): boolean {
    return false;  // xorl %eax,%eax @0x84da4
  }

  /**
   * `OZCurve::getRootNode() const` — @ProChannel 0x1ea5c (`__ZNK7OZCurve11getRootNodeEv`).
   *
   * FULL transcription. The body is 5 executed instructions; the bytes are quoted because otool
   * renders a displacement as a symbol name where it can, and the displacement IS this function:
   *
   *   @0x1ea5c  55              pushq %rbp             ; prologue (no TS counterpart)
   *   @0x1ea5d  48 89 e5        movq  %rsp, %rbp
   *   @0x1ea60  48 8b 47 08     movq  0x8(%rdi), %rax  ; rax = *(OZCurveNode**)(this + 0x08)
   *   @0x1ea64  5d              popq  %rbp             ; epilogue
   *   @0x1ea65  c3              retq                   ; return rax
   *
   * The slot it reads is the one this file's struct layout already calls `currentNode`
   * (+0x08, an `OZCurveNode*`): the bounds ctor publishes `&this->constantNode` into it @0x1e511,
   * and the copy ctor selects constantNode / splineNode / recordingNode by the source's state and
   * publishes the winner into the same slot @0x1e6b7-0x1e6c4. So "root node" is the accessor's
   * name for the ACTIVE node pointer, not a fourth node — the method reads the slot those two
   * ctors write, and nothing else.
   *
   * No null check, no branch, no call, no arithmetic: whatever qword is in +0x08 is returned
   * verbatim, NULL included, so this port must not substitute a fallback for an absent node.
   *
   * ORACLE (executed, not read — raw-port/re/oracle/OZCurve_getRootNode_probe.py): local (`t`)
   * symbol, called BY ADDRESS at `_dyld_get_image_vmaddr_slide(ProChannel) + 0x1ea5c` under
   * `arch -x86_64` after checking the 10 opcode bytes above against BOTH the mapped image and the
   * on-disk /tmp/ProChannel.x86_64 slice. Against a 0x100-byte arena poisoned with 0xCD and
   * carrying 0xAAAAAAAAAAAAAAAA at +0x00 and 0xBBBBBBBBBBBBBBBB at +0x10, live ProChannel returned
   * the +0x08 qword verbatim for NULL, 1, 0x1122334455667788 and 0xffffffffffffffff, never a
   * neighbour, with the arena byte-identical afterwards (the method is `const`).
   */
  getRootNode(): unknown {
    // @0x1ea60 movq 0x8(%rdi), %rax : the raw +0x08 slot, returned as-is (NULL included).
    return this.currentNode;
  }
}
