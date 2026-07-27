// OZCurveRuntime — the RUNTIME OZCurve class from ProChannel.framework.
//
// IMPORTANT — two distinct FCP classes both spelled "OZCurve":
//   * raw-port/src/channels/OZCurve.ts        = the .motr <curve> PARSER model
//                                               (keypoints/scope; OZCurveScope@..).
//   * raw-port/src/channels/OZCurveRuntime.ts = THIS file — the ProChannel runtime
//                                               class __ZN7OZCurve* whose ctor is
//                                               OZCurve(double,double,double,double).
//     Its subclasses (OZCurveDouble/Int/Bool/Enum/Angle) live at OZCurve*.ts and
//     currently raise the "not yet transcribed" error citing the 4 methods here.
//
// SCOPE: this file ports exactly 4 keystone methods of the runtime OZCurve class:
//     OZCurve::OZCurve(double,double,double,double)       @ProChannel 0x1e494  (C2)
//     OZCurve::OZCurve(OZCurve const&, bool)              @ProChannel 0x1e56c  (C2)
//     OZCurve::~OZCurve()                                 @ProChannel 0x1e77a  (D2)
//     OZCurve::setSplineState(OZSplineState*)             @ProChannel 0x1ea66
// These 4 unblock the entire OZCurve* subclass family. The remaining ~170 methods
// (parseElement, addKeypoint, delKeypoint, sample, isAnimated, cloneTree,
//  getKeypoint, processTree, scaleCurve, purgeCurve, endPlayback, isRecording,
//  parseBegin, closeCurve, and the 156-odd others) are DEFERRED — a single grep of
// `nm -arch x86_64 ProChannel | c++filt | grep '^[0-9a-f]* T OZCurve::'` enumerates
// them. Callers should either transcribe the ones they need on demand, or raise
// the standard "@0xADDR not yet transcribed" error stub.
//
// STRUCT LAYOUT — recovered strictly from the 4 methods above (every offset written
// by the ctor is documented with its source value + write @0xADDR):
//
//   OZCurve  (root class; no base class — vptr at offset 0)
//     +0x00  vptr           = &__ZTV7OZCurve + 0x10          @ProChannel 0xd4640
//                              (leaq 0xb619b(rip),%rax; movq %rax,(this)  @0x1e4ae/0x1e4b5)
//                              (copy-ctor writes same value @0x1e586/0x1e58d;
//                               dtor rewrites @0x1e784/0x1e78b)
//     +0x08  OZCurveNode*   currentNode — set to &this->constantNode  @0x1e511 (bounds ctor)
//                              copy-ctor sets to either &this->splineNode (state==0),
//                              &this->splineNode again (state==1), or this->recordingNode
//                              (state==2/3), depending on state@+0xa8    @0x1e6b3..0x1e6c4
//     +0x10  OZConstantNode constantNode (size 0x18 = 24 B)
//                              ctor: OZConstantNode(initVal)             @0x1e4c2
//                              copy-ctor: OZConstantNode(0.0) then operator=  @0x1e59a/0x1e633
//     +0x28  OZSplineNode   splineNode (size 0x40 = 64 B, ends at +0x68)
//                              ctor: OZSplineNode(this)                  @0x1e4d1
//                              copy-ctor: same then operator=            @0x1e5aa/0x1e641
//     +0x68  OZRecordingNode* recordingNode — set to nullptr @0x1e4d6 (bounds ctor),
//                              copy-ctor conditionally allocates+copies from src @0x1e64b..0x1e668
//     +0x70  std::vector<Node*>  extraNodes (begin@+0x70, end@+0x78, cap@+0x80) —
//                              allocated 24-byte vector, zero-initialised          @0x1e4de..0x1e4f4
//                              dtor: pops-and-destroys every element, then deletes buffer + vector
//     +0x78  double         minValue = arg xmm0                          @0x1e4fd (bounds ctor)
//                              copy-ctor: movups 0x78(src) to 0x78(this) @0x1e620/0x1e626
//     +0x80  double         maxValue = arg xmm1                          @0x1e508 (bounds ctor)
//                              (part of the same 16-byte movups in copy-ctor)
//     +0x88  uint8          hasSpline / spline-installed = 1              @0x1e520 (bounds ctor)
//                              copy-ctor: mov 0x88(src) to 0x88(this)    @0x1e66c/0x1e674
//     +0x89  uint8          — (adjacent) copy-ctor: mov 0x89(src)         @0x1e67b/0x1e683
//     +0x8a  uint8          — copy-ctor: mov 0x8a(src)                    @0x1e695/0x1e69d
//     +0x90  void*          NULL in both ctors                            @0x1e52a bounds / @0x1e68a copy
//     +0x98  __int128 zero  bounds ctor: movups xmm0(=0) to 0x98(this)    @0x1e539
//                              copy-ctor: movups xmm0(=0) to 0x98(this)   @0x1e5ba
//                              (covers +0x98..+0xa7 — two adjacent 8-byte slots)
//     +0xa8  uint32         curveState (0/1/2/3) — bounds ctor: movl $0   @0x1e515
//                              copy-ctor: movl 0xa8(src) to 0xa8(this)    @0x1e6a4/0x1e6ac
//     +0xa0  OZSplineState* splineState — copy-ctor: either shares src's
//                              OZSplineState (when src's has +0x2c != 0) or heap-allocates
//                              new OZSplineState via the copy-ctor              @0x1e5c2..0x1e5ec
//                              setSplineState writes here                        @0x1ea8a
//                              dtor: if state->+0x2c==0, operator delete(state)  @0x1e7fd..0x1e808
//
// Total size >= 0xac (172 B). OZCurveDouble.ts documents `new (0xb0)` = 176 B, which
// matches: OZCurve occupies 0xac and the 4-byte pad rounds the alloc to 0xb0.
//
// UNDECODED CALLEES — each is a throwing stub (Rule 3). Every stub cites its @0xADDR
// so frontier.py sees the demand signal.

/** OZConstantNode::OZConstantNode(double) — @ProChannel 0x298f2. Undecoded. */
function OZConstantNode_ctor_double(_p: unknown, _v: number): void {
  throw new Error(
    "OZConstantNode::OZConstantNode(double) @ProChannel 0x298f2 (__ZN14OZConstantNodeC1Ed; call sites @0x1e4c2 @0x1e59a) not yet transcribed",
  );
}

/** OZConstantNode::operator=(OZConstantNode const&) — @ProChannel 0x29b0a. Undecoded. */
function OZConstantNode_assign(_dst: unknown, _src: unknown): void {
  throw new Error(
    "OZConstantNode::operator=(OZConstantNode const&) @ProChannel 0x29b0a (__ZN14OZConstantNodeaSERKS_; call site @0x1e633) not yet transcribed",
  );
}

/** OZConstantNode::~OZConstantNode() — @ProChannel 0x2997a (D2 / tail-called from OZCurve dtor). Undecoded. */
function OZConstantNode_dtor(_p: unknown): void {
  throw new Error(
    "OZConstantNode::~OZConstantNode() @ProChannel 0x2997a (__ZN14OZConstantNodeD1Ev; call sites @0x1e55f @0x1e700 @0x1e827) not yet transcribed",
  );
}

/** OZSplineNode::OZSplineNode(OZCurve*) — @ProChannel 0x29d88. Undecoded. */
function OZSplineNode_ctor(_p: unknown, _owner: unknown): void {
  throw new Error(
    "OZSplineNode::OZSplineNode(OZCurve*) @ProChannel 0x29d88 (__ZN12OZSplineNodeC1EP7OZCurve; call sites @0x1e4d1 @0x1e5aa) not yet transcribed",
  );
}

/** OZSplineNode::operator=(OZSplineNode const&) — @ProChannel 0x2a302. Undecoded. */
function OZSplineNode_assign(_dst: unknown, _src: unknown): void {
  throw new Error(
    "OZSplineNode::operator=(OZSplineNode const&) @ProChannel 0x2a302 (__ZN12OZSplineNodeaSERKS_; call site @0x1e641) not yet transcribed",
  );
}

/** OZSplineNode::~OZSplineNode() — @ProChannel 0x29e6e (D2). Undecoded. */
function OZSplineNode_dtor(_p: unknown): void {
  throw new Error(
    "OZSplineNode::~OZSplineNode() @ProChannel 0x29e6e (__ZN12OZSplineNodeD1Ev; call sites @0x1e552 @0x1e6f8 @0x1e817) not yet transcribed",
  );
}

/** OZSplineNode::getSpline() const — @ProChannel 0x2a35c. Undecoded.
 *  Called from setSplineState @0x1ea98/@0x1eaa5 to reach into the owning spline object
 *  so it can update its state pointer at spline+0xa8. */
function OZSplineNode_getSpline(_splineNode: unknown): { obj: unknown } | null {
  throw new Error(
    "OZSplineNode::getSpline() const @ProChannel 0x2a35c (__ZNK12OZSplineNode9getSplineEv; call sites @0x1ea98 @0x1eaa5) not yet transcribed",
  );
}

/** OZSplineState::OZSplineState(OZSplineState const&) — @ProChannel 0xaa0e6. Undecoded. */
function OZSplineState_copy_ctor(_p: unknown, _src: unknown): void {
  throw new Error(
    "OZSplineState::OZSplineState(OZSplineState const&) @ProChannel 0xaa0e6 (__ZN13OZSplineStateC1ERKS_; call site @0x1e5e4) not yet transcribed",
  );
}

/** OZRecordingNode::OZRecordingNode(OZRecordingNode const&) — @ProChannel 0x8f720. Undecoded.
 *  0x98-byte object copy-constructed onto the heap in the copy-ctor. */
function OZRecordingNode_copy_ctor(_p: unknown, _src: unknown): void {
  throw new Error(
    "OZRecordingNode::OZRecordingNode(OZRecordingNode const&) @ProChannel 0x8f720 (__ZN15OZRecordingNodeC1ERKS_; call site @0x1e663) not yet transcribed",
  );
}

/** OZCurve::cloneTree(OZCurve const&) const — @ProChannel 0x1e70e. Undecoded.
 *  Called from the copy-ctor @0x1e61b only when the working-copy flag is TRUE. */
function OZCurve_cloneTree(_self: OZCurveRuntime, _src: OZCurveRuntime): void {
  throw new Error(
    "OZCurve::cloneTree(OZCurve const&) const @ProChannel 0x1e70e (__ZNK7OZCurve9cloneTreeERKS_; call site @0x1e61b) not yet transcribed",
  );
}

/** Vtable-plus-0x10 sentinel for the runtime OZCurve. The vptr stored at (this+0x0) is
 *  `&__ZTV7OZCurve + 0x10` — skipping the 16-byte Itanium-ABI header (offset-to-top +
 *  typeinfo*) and pointing at the first virtual slot. Resolves to ProChannel 0xd4650
 *  (vtable @0xd4640, +0x10). Written by the bounds ctor (@0x1e4ae/0x1e4b5), the copy
 *  ctor (@0x1e586/0x1e58d), and the dtor (@0x1e784/0x1e78b). */
const OZCurveRuntime_vtable_plus_0x10: unique symbol = Symbol("__ZTV7OZCurve+0x10");

/** Opaque handle for OZSplineState — this file does NOT decode that class. Callers of
 *  setSplineState pass an instance obtained from e.g. OZCurveDoubleSplineState::getInstance().
 *  Field `+0x2c` is a "borrowed / do-not-delete" flag observed at @0x1e5ca (copy-ctor
 *  clone decision), @0x1e7fd (dtor delete decision), and @0x1ea7f (setSplineState delete
 *  decision). */
export interface OZSplineState {
  /** (+0x2c) uint8 — non-zero means the state is a singleton/borrowed and must NOT be
   *  operator-deleted. Zero means the state was heap-allocated for this OZCurve and IS
   *  owned by it. */
  flag_at_0x2c: number;
  // Remaining OZSplineState fields are opaque here; the class is fully decoded elsewhere.
}

/** Opaque handles for the composed sub-objects (decoded elsewhere; treated as bags
 *  of bytes here so we can mirror the struct layout without inventing fields). */
interface OZConstantNodeSlot {}
interface OZSplineNodeSlot {}
interface OZRecordingNodeSlot {}

/** Vector-of-pointers slot at (this+0x70). Runs a std::vector<Node*> with the classic
 *  three-word layout (begin/end/cap). The bounds ctor allocates a 24-byte buffer,
 *  zero-fills it, and stores it here. The dtor pops from end downward, calls each
 *  element's virtual dtor (slot 0x8), then operator-deletes the buffer and the vector
 *  object itself. In TS we just carry an array so the shape stays observable. */
interface OZCurveNodeVector {
  /** (+0x00) begin ptr — array storage (owned). */
  storage: unknown[];
  /** (+0x08) end ptr — logical length. */
  end: number;
  /** (+0x10) cap ptr — allocated capacity. */
  cap: number;
}

export class OZCurveRuntime {
  // ==============================================================
  // Struct layout (see file header for @0xADDR provenance of each write).
  // ==============================================================

  /** (+0x00) vptr — set to `&__ZTV7OZCurve + 0x10` @ProChannel 0xd4650. */
  __vptr: symbol = OZCurveRuntime_vtable_plus_0x10;

  /** (+0x08) currentNode — points at whichever sub-object is "active":
   *   - bounds ctor:  &this.constantNode                                @0x1e511
   *   - copy-ctor:    depends on state@+0xa8:
   *       state==0  -> &this.splineNode                                 @0x1e6b7 default
   *       state==1  -> &this.splineNode  (same branch — no override)    @0x1e6bb..0x1e6be
   *       state>=2  -> this.recordingNode  (the heap-allocated pointer) @0x1e6c0
   * The @0x1e6c4 store publishes the chosen pointer.
   */
  currentNode: unknown = null;

  /** (+0x10) constantNode — 24 B OZConstantNode. */
  constantNode: OZConstantNodeSlot = {};

  /** (+0x28) splineNode — 64 B OZSplineNode (spans +0x28..+0x67). */
  splineNode: OZSplineNodeSlot = {};

  /** (+0x68) recordingNode — heap OZRecordingNode* (nullable). */
  recordingNode: OZRecordingNodeSlot | null = null;

  /** (+0x70..+0x87) std::vector<OZCurveNode*> — 24-byte inline vector object. */
  extraNodes: OZCurveNodeVector | null = null;

  /** (+0x78) minValue — first double arg to the bounds ctor. */
  minValue = 0;

  /** (+0x80) maxValue — second double arg to the bounds ctor. */
  maxValue = 0;

  /** (+0x88) uint8 — copy of one of the state-tracking flags (semantics deferred). */
  flag_0x88 = 0;

  /** (+0x89) uint8 — companion flag (semantics deferred). */
  flag_0x89 = 0;

  /** (+0x8a) uint8 — copy-ctor mirrors src's @0x1e695/@0x1e69d. Bounds ctor sets 1 @0x1e531. */
  flag_0x8a = 0;

  /** (+0x90) void* — always NULL out of both ctors. */
  ptr_0x90: unknown = null;

  /** (+0x98) 16 B zero-init (two adjacent 8-byte slots). Semantics deferred. */
  zero_0x98_lo = 0;
  /** (+0xa0) — see splineState below; this is the SAME 8-byte slot (see note). */

  /** (+0xa0) OZSplineState* — nullable. Bounds ctor leaves this zeroed (via the +0x98
   *  16-byte zero-init @0x1e539). Copy-ctor conditionally populates @0x1e5c2..0x1e5ec.
   *  setSplineState replaces the pointer @0x1ea8a. Dtor releases if unshared @0x1e7fd. */
  splineState: OZSplineState | null = null;

  /** (+0xa8) uint32 curveState — 0 in bounds ctor @0x1e515; mirrored from src in copy-ctor. */
  curveState = 0;

  // ==============================================================
  // (Bounds ctor)  OZCurve::OZCurve(double, double, double, double) @ProChannel 0x1e494
  //   xmm0 = minVal, xmm1 = maxVal, xmm2 = step, xmm3 = initVal.
  //   Straight-line transcription of 0x1e494..0x1e54b (0x1e54c.. is the landing pad).
  //   Note: xmm2 (step) is loaded into the OZConstantNode ctor's second arg? NO — the
  //   disasm shows only xmm3 (movaps xmm3->xmm0 @0x1e4bf) reaching OZConstantNode.
  //   `step` is spilled through stack alongside min/max via movsd @0x1e4a1/0x1e4a6 but
  //   NEVER re-read in this function. It is presumably consumed by a caller-side detail
  //   or a not-yet-decoded slot; DO NOT approximate — we record but do not store it.
  // ==============================================================
  static make_bounds(
    minVal: number,
    maxVal: number,
    step: number, // NOTE: passed in xmm2, spilled at -0x28(%rbp) but not re-read in this ctor.
    initVal: number,
  ): OZCurveRuntime {
    // Silence unused-arg lint while faithfully carrying the signature the disasm shows.
    void step;

    const self = new OZCurveRuntime();

    // @0x1e4ae/0x1e4b5: leaq 0xb619b(%rip), %rax ; movq %rax, (%rdi)
    //   -> vptr = &__ZTV7OZCurve + 0x10 (0xd4650).
    self.__vptr = OZCurveRuntime_vtable_plus_0x10;

    // @0x1e4b8/0x1e4bc/0x1e4bf/0x1e4c2:
    //   leaq 0x10(%rdi),%rbx ; %rdi=%rbx ; %xmm0<-%xmm3 ; callq OZConstantNode::OZConstantNode(double)
    //   -> constantNode.OZConstantNode(initVal).
    OZConstantNode_ctor_double(self.constantNode, initVal);

    // @0x1e4c7/0x1e4cb/0x1e4ce/0x1e4d1:
    //   leaq 0x28(%r14),%r15 ; %rdi=%r15 ; %rsi=%r14=this ; callq OZSplineNode::OZSplineNode(OZCurve*)
    //   -> splineNode.OZSplineNode(this).
    OZSplineNode_ctor(self.splineNode, self);

    // @0x1e4d6: movq $0x0, 0x68(%r14) -> recordingNode = nullptr.
    self.recordingNode = null;

    // @0x1e4de..0x1e4f4: operator new(0x18) ; zero-init (movups xmm0=0 to (%rax);
    //   movq %rcx=0 to 0x10(%rax)) ; movq %rax, 0x70(%r14).
    //   -> extraNodes = new std::vector<Node*>(); begin=end=cap=null.
    self.extraNodes = { storage: [], end: 0, cap: 0 };

    // @0x1e4f8/0x1e4fd:  movsd -0x20(%rbp),%xmm1 ; movsd %xmm1, 0x78(%r14)
    //   -> minValue = arg xmm0 (spilled at -0x20 @0x1e4a6).
    self.minValue = minVal;

    // @0x1e503/0x1e508:  movsd -0x28(%rbp),%xmm1 ; movsd %xmm1, 0x80(%r14)
    //   -> maxValue = arg xmm1 (spilled at -0x28 @0x1e4a1).
    self.maxValue = maxVal;

    // @0x1e511:  movq %rbx, 0x8(%r14)   (%rbx = this+0x10 = &constantNode)
    //   -> currentNode = &constantNode.
    self.currentNode = self.constantNode;

    // @0x1e515:  movl $0x0, 0xa8(%r14)  -> curveState = 0.
    self.curveState = 0;

    // @0x1e520:  movw $0x1, 0x88(%r14)  -> 16-bit store, so flag_0x88=1 AND flag_0x89=0.
    self.flag_0x88 = 1;
    self.flag_0x89 = 0;

    // @0x1e52a:  movq %rcx=0, 0x90(%r14) -> ptr_0x90 = null.
    self.ptr_0x90 = null;

    // @0x1e531:  movb $0x1, 0x8a(%r14)  -> flag_0x8a = 1.
    self.flag_0x8a = 1;

    // @0x1e539:  movups %xmm0=0, 0x98(%r14)  -> [+0x98..+0xa7] = 0. splineState stays null.
    self.zero_0x98_lo = 0;
    self.splineState = null;

    return self;
  }

  // ==============================================================
  // (Copy ctor)  OZCurve::OZCurve(OZCurve const&, bool) @ProChannel 0x1e56c
  //   %rsi = src, %edx = flag ("working-copy" bool, spilled at -0x34(%rbp) @0x1e57d).
  //   The bool controls whether cloneTree(*src) runs — TRUE for getCurveWorkingCopy,
  //   FALSE for cloneCurve.
  // ==============================================================
  static make_copy(src: OZCurveRuntime, flag: boolean): OZCurveRuntime {
    const self = new OZCurveRuntime();

    // @0x1e586/0x1e58d:  leaq 0xb60c3(%rip),%rax ; movq %rax,(%rdi)  -> vptr = 0xd4650.
    self.__vptr = OZCurveRuntime_vtable_plus_0x10;

    // @0x1e590/0x1e594/0x1e597/0x1e59a:
    //   leaq 0x10(%rdi),%rbx ; xorps %xmm0,%xmm0 ; %rdi=%rbx ; callq OZConstantNode::OZConstantNode(double)
    //   -> constantNode.OZConstantNode(0.0)   (default-init; will be operator= assigned below).
    OZConstantNode_ctor_double(self.constantNode, 0);

    // @0x1e59f/0x1e5a3/0x1e5a7/0x1e5aa:
    //   leaq 0x28(%r15),%rdi ; spill to -0x30(%rbp) ; %rsi=%r15=this ; callq OZSplineNode::OZSplineNode(OZCurve*)
    //   -> splineNode.OZSplineNode(this).
    OZSplineNode_ctor(self.splineNode, self);

    // @0x1e5af:  movq $0x0, 0x68(%r15)  -> recordingNode = nullptr.
    self.recordingNode = null;

    // @0x1e5b7/0x1e5ba:  xorps %xmm0,%xmm0 ; movups %xmm0, 0x98(%r15)
    //   -> zero [+0x98..+0xa7] (i.e. splineState = null pre-clone-decision).
    self.zero_0x98_lo = 0;
    self.splineState = null;

    // @0x1e5c2:  movq 0xa0(%r12), %r14  ->  candidate = src->splineState (may be null).
    let stateToInstall: OZSplineState | null = src.splineState;

    // @0x1e5ca..0x1e5cf:  cmpb $0x0, 0x2c(%r14) ; jne 0x1e5ec
    //   -> if src->splineState->flag_at_0x2c == 0  (i.e. owned, not shared),
    //      allocate + copy-construct a fresh OZSplineState; else share the pointer.
    if (stateToInstall !== null && stateToInstall.flag_at_0x2c === 0) {
      // @0x1e5d1..0x1e5db:  operator new(0x30) -> %r13.
      // @0x1e5de/0x1e5e1/0x1e5e4:  OZSplineState::OZSplineState(OZSplineState const&).
      const fresh: OZSplineState = { flag_at_0x2c: 0 };
      OZSplineState_copy_ctor(fresh, stateToInstall);
      // @0x1e5e9:  movq %r13, %r14  -> the newly-copied instance replaces the candidate.
      stateToInstall = fresh;
    }
    // @0x1e5ec:  movq %r14, 0xa0(%r15)  -> splineState = final choice.
    self.splineState = stateToInstall;

    // @0x1e5f3..0x1e60b:  operator new(0x18) ; zero the 24 bytes ; movq %rax, 0x70(%r15).
    //   -> extraNodes = new std::vector<Node*>() (empty).
    self.extraNodes = { storage: [], end: 0, cap: 0 };

    // @0x1e60f..0x1e61b:  cmpb $0x0, -0x34(%rbp) ; je 0x1e620 ; callq OZCurve::cloneTree(*src).
    //   -> if (flag) this->cloneTree(*src).
    if (flag) {
      OZCurve_cloneTree(self, src);
    }

    // @0x1e620/0x1e626:  movups 0x78(%r12),%xmm0 ; movups %xmm0, 0x78(%r15)
    //   -> 16-byte copy of [minValue, maxValue] from src to self.
    self.minValue = src.minValue;
    self.maxValue = src.maxValue;

    // @0x1e62b/0x1e630/0x1e633:
    //   leaq 0x10(%r12),%rsi ; %rdi=%rbx=&this.constantNode ; callq OZConstantNode::operator=.
    OZConstantNode_assign(self.constantNode, src.constantNode);

    // @0x1e638/0x1e63d/0x1e641:
    //   leaq 0x28(%r12),%rsi ; %rdi=-0x30(%rbp)=&this.splineNode ; callq OZSplineNode::operator=.
    OZSplineNode_assign(self.splineNode, src.splineNode);

    // @0x1e646/0x1e64b/0x1e64e:  movq 0x68(%r12),%r13 ; testq %r13,%r13 ; je 0x1e66c
    //   -> if (src->recordingNode != null)   heap-copy it.
    const srcRec = src.recordingNode;
    if (srcRec !== null) {
      // @0x1e650..0x1e65a:  operator new(0x98) -> %r14 (fresh 152-byte OZRecordingNode).
      // @0x1e65d/0x1e660/0x1e663: OZRecordingNode::OZRecordingNode(OZRecordingNode const&).
      const fresh: OZRecordingNodeSlot = {};
      OZRecordingNode_copy_ctor(fresh, srcRec);
      // @0x1e668:  movq %r14, 0x68(%r15)  -> this.recordingNode = fresh.
      self.recordingNode = fresh;
    }

    // @0x1e66c/0x1e674:  movb 0x88(%r12),%al ; movb %al, 0x88(%r15)  -> flag_0x88.
    self.flag_0x88 = src.flag_0x88;
    // @0x1e67b/0x1e683:  movb 0x89(%r12),%al ; movb %al, 0x89(%r15)  -> flag_0x89.
    self.flag_0x89 = src.flag_0x89;
    // @0x1e68a:  movq $0x0, 0x90(%r15)  -> ptr_0x90 = null (NOT copied from src).
    self.ptr_0x90 = null;
    // @0x1e695/0x1e69d:  movb 0x8a(%r12),%al ; movb %al, 0x8a(%r15)  -> flag_0x8a.
    self.flag_0x8a = src.flag_0x8a;

    // @0x1e6a4/0x1e6ac:  movl 0xa8(%r12),%eax ; movl %eax, 0xa8(%r15) -> curveState.
    const state = src.curveState;
    self.curveState = state;

    // @0x1e6b3..0x1e6c4:  choose currentNode from state:
    //   testl %eax,%eax ; je 0x1e6c4      (state==0 -> keep default %rbx=&this.splineNode
    //                                       from -0x30(%rbp) via 0x1e6b7 override below)
    //   movq -0x30(%rbp),%rbx              (state!=0 -> rbx = &this.splineNode)
    //   cmpl $0x1,%eax ; je 0x1e6c4        (state==1 -> use &this.splineNode)
    //   movq 0x68(%r15),%rbx               (state>=2 -> use this.recordingNode)
    //   movq %rbx, 0x8(%r15)               (publish currentNode)
    //
    // Decoded switch (matches the branch structure exactly):
    if (state === 0) {
      // NOTE: at fn entry %rbx was set to &this.constantNode @0x1e590. In the state==0
      // branch NEITHER the -0x30(%rbp) override nor the recording-node override runs, so
      // %rbx keeps its initial value &this.constantNode.
      self.currentNode = self.constantNode;
    } else if (state === 1) {
      self.currentNode = self.splineNode;
    } else {
      // state >= 2 (typically 2 = recording).
      self.currentNode = self.recordingNode;
    }

    return self;
  }

  // ==============================================================
  // (Dtor)  OZCurve::~OZCurve()  @ProChannel 0x1e77a  (D2, non-deleting).
  //   Order (bottom-up, mirroring the disasm 0x1e77a..0x1e827):
  //     1. Restore vptr to &__ZTV7OZCurve + 0x10                    @0x1e784/0x1e78b
  //     2. Walk extraNodes back-to-front, virtual-dtor each element @0x1e792..0x1e7bc
  //     3. Free extraNodes' storage buffer, then the vector object  @0x1e7be..0x1e7d2
  //     4. Zero (this+0x70)                                          @0x1e7d7
  //     5. If recordingNode != null, virtual-dtor it, zero the slot @0x1e7df..0x1e7ee
  //     6. If splineState->flag_at_0x2c == 0, operator delete it,
  //        zero the slot                                             @0x1e7f6..0x1e808
  //        (the `jne 0x1e813` skips the delete when shared/borrowed)
  //     7. OZSplineNode::~OZSplineNode() on (this+0x28)              @0x1e813..0x1e817
  //     8. tail-call OZConstantNode::~OZConstantNode() on (this+0x10) @0x1e820..0x1e827
  // ==============================================================
  destruct(): void {
    // Step 1 — @0x1e784/0x1e78b.
    this.__vptr = OZCurveRuntime_vtable_plus_0x10;

    // Steps 2–4 — walk the extraNodes vector.
    // @0x1e78e:  movq 0x70(%rbx), %r14   ; %r14 = &vec
    // @0x1e792:  movq (%r14), %rdi       ; %rdi = vec.begin
    // @0x1e795:  movq 0x8(%r14), %rcx    ; %rcx = vec.end
    // @0x1e799/0x1e79c:  cmpq %rcx,%rdi ; je 0x1e7be  (empty -> free)
    // @0x1e79e/0x1e7a2/0x1e7a6:  rcx -= 8 ; movq -0x8(%rcx),%rax ; vec.end = rcx
    // @0x1e7aa/0x1e7ad:  testq %rax,%rax ; je 0x1e795  (nullptr slot -> loop)
    // @0x1e7af/0x1e7b2/0x1e7b5:  movq (%rax),%rcx ; %rdi=%rax ; callq *0x8(%rcx)  (virtual dtor)
    // @0x1e7b8/0x1e7bc:  movq 0x70(%rbx),%r14 ; jmp 0x1e792  (reload vec ptr, loop)
    if (this.extraNodes !== null) {
      const vec = this.extraNodes;
      while (vec.storage.length > 0) {
        const node = vec.storage.pop() as { destruct?: () => void } | null;
        // The virtual slot @+0x8 is the destructor thunk. In TS we call `.destruct()` if
        // the object exposes one; the port must not swallow the vtable call, so we throw
        // if a non-null node lacks the hook.
        if (node !== null && node !== undefined) {
          if (typeof node.destruct !== "function") {
            throw new Error(
              "OZCurve::~OZCurve @ProChannel 0x1e7b5 — virtual dtor slot *(vptr+0x8) on OZCurveNode element not yet transcribed",
            );
          }
          node.destruct();
        }
      }
      // Step 3 — @0x1e7be..0x1e7d2: operator delete(vec.storage buffer); operator delete(vec).
      // GC-managed in TS; leave the object shape observable by zeroing the fields.
      vec.storage = [];
      vec.end = 0;
      vec.cap = 0;
    }
    // Step 4 — @0x1e7d7: movq $0x0, 0x70(%rbx).
    this.extraNodes = null;

    // Step 5 — @0x1e7df..0x1e7ee.
    //   movq 0x68(%rbx),%rdi ; testq %rdi,%rdi ; je 0x1e7f6
    //   movq (%rdi),%rax ; callq *0x8(%rax)   ; virtual dtor of the recording node
    //   movq $0x0, 0x68(%rbx)                 ; zero the slot
    const rec = this.recordingNode as { destruct?: () => void } | null;
    if (rec !== null) {
      if (typeof rec.destruct !== "function") {
        throw new Error(
          "OZCurve::~OZCurve @ProChannel 0x1e7eb — virtual dtor slot *(vptr+0x8) on OZRecordingNode not yet transcribed",
        );
      }
      rec.destruct();
    }
    this.recordingNode = null;

    // Step 6 — @0x1e7f6..0x1e808.
    //   movq 0xa0(%rbx),%rdi ; cmpb $0x0, 0x2c(%rdi) ; jne 0x1e813
    //   callq __ZdlPv                       ; operator delete(splineState)
    //   movq $0x0, 0xa0(%rbx)               ; zero the slot
    //   [0x1e813:] leaq 0x28(%rbx),%rdi
    // NOTE: @0x1e7f6 reads splineState UNCONDITIONALLY then reads flag_at_0x2c through it.
    //       That is a real null-deref in the C++ if the ctor path left it null but the
    //       hidden branch @0x1e801 (`jne`) only skips the delete on non-zero flag — it
    //       does NOT null-check. Faithful mirror: we mimic the guard by treating null as
    //       "borrowed" (skip the delete). The comment records the semantic difference.
    const state = this.splineState;
    if (state !== null && state.flag_at_0x2c === 0) {
      // operator delete — GC-managed here; just clear the slot.
      this.splineState = null;
    }

    // Step 7 — @0x1e813/0x1e817: OZSplineNode::~OZSplineNode() on this+0x28.
    OZSplineNode_dtor(this.splineNode);

    // Step 8 — @0x1e81c..0x1e827: addq $0x10,%rbx ; movq %rbx,%rdi ; jmp OZConstantNode::~OZConstantNode.
    OZConstantNode_dtor(this.constantNode);
  }

  // ==============================================================
  // OZCurve::setSplineState(OZSplineState*)  @ProChannel 0x1ea66.
  //   Straight-line transcription of 0x1ea66..0x1eab5.
  //     1. Load current splineState (this+0xa0) into %rdi.
  //     2. If it's non-null AND its flag_at_0x2c == 0 (owned), operator delete it.
  //     3. Store the new pointer at (this+0xa0).
  //     4. Load OZSplineNode (this+0x28) into %r14, call OZSplineNode::getSpline().
  //     5. If getSpline() returned non-null, call getSpline() AGAIN (Apple does — two
  //        distinct calls @0x1ea98 and @0x1ea a5) and store the new state pointer at
  //        (spline+0xa8).
  // ==============================================================
  setSplineState(newState: OZSplineState | null): void {
    // @0x1ea73:  movq 0xa0(%rdi), %rdi   -> load current splineState.
    const cur = this.splineState;
    // @0x1ea7a/0x1ea7d:  testq %rdi,%rdi ; je 0x1ea8a  -> skip block if null.
    if (cur !== null) {
      // @0x1ea7f/0x1ea83:  cmpb $0x0, 0x2c(%rdi) ; jne 0x1ea8a
      if (cur.flag_at_0x2c === 0) {
        // @0x1ea85:  callq __ZdlPv   ; operator delete(cur). GC-managed in TS.
      }
    }
    // @0x1ea8a:  movq %rbx, 0xa0(%r14)   -> splineState = newState.
    this.splineState = newState;

    // @0x1ea91..0x1ea98:
    //   addq $0x28,%r14 ; %rdi=%r14=&this.splineNode ; callq OZSplineNode::getSpline().
    const first = OZSplineNode_getSpline(this.splineNode);
    // @0x1ea9d/0x1eaa0:  testq %rax,%rax ; je 0x1eab1  -> skip if null.
    if (first !== null) {
      // @0x1eaa2/0x1eaa5:  %rdi=%r14 ; callq OZSplineNode::getSpline() (SECOND call — Apple
      //   really does invoke it twice; the returned pointer may differ if getSpline()
      //   isn't idempotent, but the disasm mirrors the second call unconditionally).
      const second = OZSplineNode_getSpline(this.splineNode);
      if (second !== null) {
        // @0x1eaaa:  movq %rbx, 0xa8(%rax)   -> spline->stateSlot_0xa8 = newState.
        // The concrete field name inside OZSpline is not decoded here; we go through a
        // typed setter so the shape is visible.
        (second.obj as { stateSlot_0xa8: OZSplineState | null }).stateSlot_0xa8 = newState;
      }
    }
    // @0x1eab1..0x1eab5:  popq %rbx / %r14 / %rbp ; retq.
  }
}
