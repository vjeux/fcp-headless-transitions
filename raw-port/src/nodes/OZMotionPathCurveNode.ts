// OZMotionPathCurveNode — Ozone curve-node subclass that evaluates a motion path
// (a spatial curve parametrised over time). Direct base is OZBehaviorCurveNode
// (vtable @Ozone 0x846950 references it as parent typeinfo); ultimate base is
// OZCurveNode (its methods fill the majority of the vtable slots that this
// class doesn't override — see vtable dump in the file header).
//
// This port faithfully transcribes the SMALL / mechanical methods of the
// class (compare, getNeededRange, cloneNode, C1 ctor, D0 dtor, D2 dtor is
// ICF-folded). The four heavy path-evaluation methods (solveNode(...), the
// getLength/getPositionOnPath/getPosition trio) route almost entirely through
// FRONTIER callees — OZMotionPathBehavior, OZChannel::getValueAsInt,
// OZChannelPosition3D::getLength, PCEvaluator, etc. — none of which are yet
// transcribed (@Ozone 0x40ae40 / 0x40d570 / 0x40b230 / 0x40b470 / 0x40bff0).
// Per PORTING_SPEC Rule 3 those methods route through stubs that raise with
// their exact source address so frontier.py surfaces the next callee set.
//
// Source disasm (all in raw-port/re/disasm/):
//   OZMotionPathCurveNode.OZMotionPathCurveNode.s    C1 ctor           @Ozone 0x40ac60
//   OZMotionPathCurveNode.~OZMotionPathCurveNode.s   D0 deleting dtor  @Ozone 0x40ae00
//   OZMotionPathCurveNode.getLength.s                getLength         @Ozone 0x40b230 (frontier)
//   OZMotionPathCurveNode.getPositionOnPath.s        getPositionOnPath @Ozone 0x40b470 (600-line, frontier)
//   OZMotionPathCurveNode.getPosition.s              getPosition       @Ozone 0x40bff0 (1142-line, frontier)
//   OZMotionPathCurveNode.cloneNode.s                cloneNode         @Ozone 0x40d650
//   OZMotionPathCurveNode.compare.s                  compare           @Ozone 0x40d6f0
//   OZMotionPathCurveNode.getNeededRange.s           getNeededRange    @Ozone 0x40d700
//
// Vtable (raw-port/army/tools/resolve.py Ozone vtable @0x85e830, installed-ptr @0x85e840):
//   *0x00 -> 0x40adc0  ~OZMotionPathCurveNode  (D1 base variant, ICF-folded)
//   *0x08 -> 0x40ae00  ~OZMotionPathCurveNode  (D0 deleting)
//   *0x10 -> 0x40ae40  solveNode(CMTime const&, double, double)
//   *0x18 -> 0x40d570  solveNode(OZCurveNodeParam&)
//   *0x20 -> 0x20baa0  [parent] OZBehaviorCurveNode::getUForValue
//   *0x28 -> 0x209060  [parent] OZCurveNode::setValue
//   *0x30 -> 0x209070  [parent] OZCurveNode::setDefaultValue
//   *0x38 -> 0x209080  [parent] OZCurveNode::getDefaultValue
//   *0x40 -> 0x209090  [parent] OZCurveNode::setInitialValue
//   *0x48 -> 0x2090a0  [parent] OZCurveNode::getInitialValue
//   *0x50 -> 0x40d700  getNeededRange(OZCurveNodeParam*)
//   *0x58 -> 0x2090b0  [parent] OZCurveNode::getCurrentRange
//   *0x60 -> 0x2090d0  [parent] OZCurveNode::getNeededTime
//   *0x68 -> 0x40d650  cloneNode()
//   *0x70 -> 0x40d6f0  compare(OZCurveNode const*) const
//   *0x88 -> 0x2090f0  [parent] OZCurveNode::getMaxValueU
//   ... (parent-class slots continue)

// ---------------------------------------------------------------------------
// Frontier classes referenced by the disassembly. Every hop into one of these
// throws with the exact @0xADDR the C++ code hands off to.
// ---------------------------------------------------------------------------

/** OZBehaviorCurveNode — direct base class of OZMotionPathCurveNode.
 *  Copy-ctor `__ZN19OZBehaviorCurveNodeC2ERKS_` and base-ctor `C2(OZBehavior*, OZChannel*)`
 *  are used from our ctors; D2 dtor is chained from our D0. Not yet transcribed. */
export class OZBehaviorCurveNode {
  constructor(_behavior?: unknown, _channel?: unknown, _copySrc?: unknown) {
    throw new Error("OZBehaviorCurveNode base ctor @Ozone 0x40ac70 / 0x40d670 (copy) not yet transcribed");
  }
  destroy_D2(): void {
    throw new Error("OZBehaviorCurveNode::~OZBehaviorCurveNode (D2) @Ozone 0x40ae28 not yet transcribed");
  }
}

/** PCEvaluator — placed at (this+0x28) inside OZMotionPathCurveNode. Default-
 *  constructed by our C1 (@Ozone 0x40ac8e) and by cloneNode (@Ozone 0x40d691).
 *  Destroyed by our D0 (@Ozone 0x40ae17). Not yet transcribed. */
export class PCEvaluator {
  constructor() {
    throw new Error("PCEvaluator::PCEvaluator() @Ozone stub 0x6dd614 not yet transcribed");
  }
  destroy_D1(): void {
    throw new Error("PCEvaluator::~PCEvaluator (D1) @Ozone stub 0x6dd61a not yet transcribed");
  }
}

/** PCSpinLock — placed at (this+0x20)..(this+0x28). Its D1 dtor is called on
 *  the ctor's unwind path (@Ozone 0x40acab / 0x40d6b1) and inside our D0
 *  (@Ozone 0x40ae20). Not yet transcribed. */
export class PCSpinLock {
  destroy_D1(): void {
    throw new Error("PCSpinLock::~PCSpinLock (D1) @Ozone stub 0x6dd452 not yet transcribed");
  }
}

/** OZMotionPathBehavior — dynamic_cast target inside getLength / getPositionOnPath.
 *  Its getPositionChannel() method is called at @Ozone 0x40b28b. Frontier. */
export class OZMotionPathBehavior {
  getPositionChannel(): unknown {
    throw new Error("OZMotionPathBehavior::getPositionChannel() @Ozone 0x40b28b (callee of getLength) not yet transcribed");
  }
}

// ---------------------------------------------------------------------------
// OZMotionPathCurveNode class body.
// ---------------------------------------------------------------------------

export class OZMotionPathCurveNode extends OZBehaviorCurveNode {
  // Layout recovered from ctor disasm (all offsets grounded in cited disassembly):
  //   +0x00        vtable pointer (installed = &Ozone_vtable+0x10 = 0x85e840)
  //   +0x08        (parent OZBehaviorCurveNode field — OZBehavior* seen at 0x40b246)
  //   +0x1c        u32 copied from (behavior+0x18) at ctor 0x40ac93 / cloneNode 0x40d696
  //                (parent stores this too; we mirror the write so cloneNode is faithful)
  //   +0x20        u32 spin-lock word init'd to 0x00 (movl $0,0x20 at 0x40ac83 / 0x40d683)
  //   +0x28        PCEvaluator (ctor'd inline)
  //   +0x88        sizeof — total object size, per `movl $0x88,%edi; __Znwm` in cloneNode @0x40d65d
  vptr: number = 0x85e840;
  field_08_behavior: unknown = null;
  field_1c: number = 0;                 // u32; source: (behavior+0x18) at 0x40ac93 / (src+0x1c) at 0x40d696
  field_20_spinLockWord: number = 0;    // u32 = 0, per movl $0x0 @0x40ac83
  field_28_evaluator: PCEvaluator | null = null;

  /**
   * OZMotionPathCurveNode::OZMotionPathCurveNode(OZBehavior*, OZChannel*)
   * @Ozone 0x40ac60  (mangled __ZN21OZMotionPathCurveNodeC1EP10OZBehaviorP9OZChannel)
   *
   * Disasm (raw-port/re/disasm/OZMotionPathCurveNode.OZMotionPathCurveNode.s):
   *   0x40ac60 push %rbp / mov %rsp,%rbp / push r15,r14,rbx / push %rax
   *   0x40ac6a movq %rdx,%r14                     ; %r14 = channel (arg2)
   *   0x40ac6d movq %rdi,%rbx                     ; %rbx = this
   *   0x40ac70 callq OZBehaviorCurveNode::C2(OZBehavior*, OZChannel*)
   *   0x40ac75 leaq 0x453bc4(%rip),%rax           ; %rax = 0x85e840 (vtable+0x10)
   *   0x40ac7c movq %rax,(%rbx)                   ; this->vptr <- 0x85e840
   *   0x40ac7f leaq 0x20(%rbx),%r15               ; %r15 = &this[+0x20]  (spin-lock)
   *   0x40ac83 movl $0x0,0x20(%rbx)               ; this->field_20 <- 0
   *   0x40ac8a leaq 0x28(%rbx),%rdi               ; %rdi = &this[+0x28]  (evaluator)
   *   0x40ac8e callq PCEvaluator::PCEvaluator()   ; default-ctor in place
   *   0x40ac93 movl 0x18(%r14),%eax               ; %eax = channel->[+0x18] (u32)
   *   0x40ac97 movl %eax,0x1c(%rbx)               ; this->field_1c <- %eax
   *   0x40ac9a ret (via epilogue)
   *   ; unwind path @0x40aca5: destroy spin-lock (+0x20) then chain to base D2.
   *
   * NOTE: %rip-rel 0x40ac75 + 7 = 0x40ac7c;  0x40ac7c + 0x453bc4 = 0x85e840 -> installed-ptr
   * (vtable base @0x85e830 + ABI header 0x10). Confirmed against vtable.py dump above.
   */
  constructor(behavior: unknown, channel: { field_18_u32: number }) {
    // Base ctor is a frontier — a real construction will throw here. Faithful
    // per Rule 3; we do not paraphrase the base body.
    super(behavior, channel);
    this.vptr = 0x85e840;             // @0x40ac7c
    this.field_08_behavior = behavior;
    this.field_20_spinLockWord = 0;   // @0x40ac83
    this.field_28_evaluator = new PCEvaluator(); // @0x40ac8e (will throw — frontier)
    this.field_1c = channel.field_18_u32 | 0;    // @0x40ac93..0x40ac97 (u32 mov)
  }

  /**
   * OZMotionPathCurveNode::~OZMotionPathCurveNode (D0 deleting dtor)
   * @Ozone 0x40ae00  (mangled __ZN21OZMotionPathCurveNodeD0Ev)
   *
   * Disasm (raw-port/re/disasm/OZMotionPathCurveNode.~OZMotionPathCurveNode.s):
   *   0x40ae00 push %rbp / mov %rsp,%rbp / push %rbx / push %rax
   *   0x40ae06 movq %rdi,%rbx                     ; %rbx = this
   *   0x40ae09 leaq 0x453a30(%rip),%rax           ; %rax = 0x85e840 (rebind to own vtable+0x10)
   *   0x40ae10 movq %rax,(%rdi)                   ; *this <- 0x85e840
   *   0x40ae13 addq $0x28,%rdi                    ; %rdi = &this[+0x28]
   *   0x40ae17 callq PCEvaluator::~PCEvaluator()  ; destroy inline evaluator
   *   0x40ae1c leaq 0x20(%rbx),%rdi               ; %rdi = &this[+0x20]
   *   0x40ae20 callq PCSpinLock::~PCSpinLock()    ; destroy spin lock
   *   0x40ae25 movq %rbx,%rdi
   *   0x40ae28 callq OZBehaviorCurveNode::~OZBehaviorCurveNode() (D2)
   *   0x40ae2d movq %rbx,%rdi
   *   0x40ae36 jmp   operator delete(void*)       ; TAIL-call: free this
   *
   * Order matches Itanium ABI: rebind vptr, run own field dtors reverse-decl,
   * chain into base D2, finally operator-delete.
   *
   * NOTE: 0x40ae09 + 7 = 0x40ae10;  0x40ae10 + 0x453a30 = 0x85e840 — same
   * installed-ptr as the ctor. This confirms both sites reference the identical
   * vtable slot.
   */
  destroy_D0(): void {
    this.vptr = 0x85e840;                                         // @0x40ae10
    if (this.field_28_evaluator) this.field_28_evaluator.destroy_D1(); // @0x40ae17
    // PCSpinLock at +0x20 doesn't have a first-class TS field (it's a raw u32
    // above); its D1 dtor is decoded but a no-op on the layout we track. We
    // still call through so the callee is exercised faithfully — throws under
    // current frontier state.
    new PCSpinLock().destroy_D1();                                // @0x40ae20
    this.destroy_D2();                                            // @0x40ae28 -> base D2
    // @0x40ae36: tail-jmp operator delete(void*) — in TS we let GC handle it.
  }
  override destroy_D2(): void {
    // We only decoded D0; D1 (@0x40adc0) and D2 (@0x40ad80) are ICF-adjacent.
    // Route through the base D2 stub (frontier).
    super.destroy_D2();
  }

  /**
   * OZMotionPathCurveNode::cloneNode()
   * @Ozone 0x40d650  (mangled __ZN21OZMotionPathCurveNode9cloneNodeEv)
   *
   * Disasm (raw-port/re/disasm/OZMotionPathCurveNode.cloneNode.s):
   *   0x40d65a movq %rdi,%r14                     ; %r14 = this  (source)
   *   0x40d65d movl $0x88,%edi                    ; alloc-size 0x88 (136) bytes
   *   0x40d662 callq operator new(unsigned long)  ; %rax = new instance
   *   0x40d667 movq %rax,%rbx                     ; %rbx = dst
   *   0x40d66a movq %rax,%rdi
   *   0x40d66d movq %r14,%rsi                     ; args (dst, src)
   *   0x40d670 callq OZBehaviorCurveNode::OZBehaviorCurveNode(OZBehaviorCurveNode const&)
   *                                                ; copy-construct base
   *   0x40d675 leaq 0x4511c4(%rip),%rax           ; %rax = 0x85e840 (own vtable+0x10)
   *   0x40d67c movq %rax,(%rbx)                   ; dst->vptr <- 0x85e840
   *   0x40d67f leaq 0x20(%rbx),%r15
   *   0x40d683 movl $0x0,0x20(%rbx)               ; dst->field_20 <- 0
   *   0x40d68a leaq 0x28(%rbx),%rdi
   *   0x40d691 callq PCEvaluator::PCEvaluator()   ; default-ctor evaluator in place
   *   0x40d696 movl 0x1c(%r14),%eax               ; %eax = src->field_1c
   *   0x40d69a movl %eax,0x1c(%rbx)               ; dst->field_1c <- src->field_1c
   *   0x40d69d movq %rbx,%rax                     ; return dst
   *
   * NOTE: 0x40d675 + 7 = 0x40d67c;  0x40d67c + 0x4511c4 = 0x85e840 (installed-ptr).
   * Same vtable slot as the ctor and D0 — the invariant is one class = one vptr.
   *
   * NOTE: Sizeof(OZMotionPathCurveNode) is 0x88 = 136 bytes per the immediate
   * to operator new @0x40d65d — a decoded constant, not a guess.
   */
  static readonly SIZEOF = 0x88; // @0x40d65d movl $0x88 immediate
  cloneNode(): OZMotionPathCurveNode {
    // The disasm allocates a new-of-self, base-copy-constructs, then reinstalls
    // vptr and re-initialises the inline evaluator / spin-lock. In TS we call
    // the copy path via the copy-ctor family which itself throws (frontier).
    const dst = Object.create(OZMotionPathCurveNode.prototype) as OZMotionPathCurveNode;
    // Copy-construct base — throws under current frontier state (see stub above).
    // Faithful: this is exactly what @0x40d670 does.
    (new OZBehaviorCurveNode(this));
    dst.vptr = 0x85e840;                     // @0x40d67c
    dst.field_20_spinLockWord = 0;           // @0x40d683
    dst.field_28_evaluator = new PCEvaluator(); // @0x40d691
    dst.field_1c = this.field_1c | 0;        // @0x40d696..0x40d69a
    return dst;
  }

  /**
   * OZMotionPathCurveNode::compare(OZCurveNode const*) const
   * @Ozone 0x40d6f0  (mangled __ZNK21OZMotionPathCurveNode7compareEPK11OZCurveNode)
   *
   * Disasm (raw-port/re/disasm/OZMotionPathCurveNode.compare.s):
   *   0x40d6f0 push %rbp / mov %rsp,%rbp
   *   0x40d6f4 xorl %eax,%eax          ; %eax <- 0
   *   0x40d6f6 pop %rbp / ret
   *
   * Unconditionally returns 0. Two OZMotionPathCurveNode instances compare
   * equal (0 == equal in the OZCurveNode::compare contract). No fields
   * participate. Immediate constant transcribed: 0.
   */
  static readonly COMPARE_ALWAYS_ZERO = 0; // xorl %eax,%eax @0x40d6f4
  compare(_rhs: unknown): number {
    return OZMotionPathCurveNode.COMPARE_ALWAYS_ZERO;
  }

  /**
   * OZMotionPathCurveNode::getNeededRange(OZCurveNodeParam* p)
   * @Ozone 0x40d700  (mangled __ZN21OZMotionPathCurveNode14getNeededRangeEP16OZCurveNodeParam)
   *
   * Disasm (raw-port/re/disasm/OZMotionPathCurveNode.getNeededRange.s):
   *   0x40d704 movq %rsi,%rax                     ; return value := p
   *   0x40d707 movq 0x70(%rsi),%rcx               ; %rcx = p[+0x70]        (8 bytes)
   *   0x40d70b movq %rcx,0x28(%rsi)               ; p[+0x28] <- p[+0x70]
   *   0x40d70f movups 0x60(%rsi),%xmm0            ; %xmm0 = p[+0x60..+0x6f] (16 bytes)
   *   0x40d713 movups %xmm0,0x18(%rsi)            ; p[+0x18..+0x27] <- p[+0x60..+0x6f]
   *   0x40d717 movups 0x78(%rsi),%xmm0            ; %xmm0 = p[+0x78..+0x87]
   *   0x40d71b movups %xmm0,0x30(%rsi)            ; p[+0x30..+0x3f] <- p[+0x78..+0x87]
   *   0x40d71f movq 0x88(%rsi),%rcx               ; %rcx = p[+0x88]        (8 bytes)
   *   0x40d726 movq %rcx,0x40(%rsi)               ; p[+0x40] <- p[+0x88]
   *   0x40d72a movl 0x90(%rsi),%ecx               ; %ecx = p[+0x90]        (4 bytes)
   *   0x40d730 movl %ecx,0x48(%rsi)               ; p[+0x48] <- p[+0x90]
   *   0x40d733 movb $0x0,0x58(%rsi)               ; p[+0x58] <- 0          (1 byte)
   *   0x40d737 movq 0x98(%rsi),%rcx               ; %rcx = p[+0x98]        (8 bytes)
   *   0x40d73e movq %rcx,0x50(%rsi)               ; p[+0x50] <- p[+0x98]
   *   0x40d742 ret
   *
   * Interpretation: OZCurveNodeParam has TWO parallel sub-blocks — an "input"
   * block at +0x60..+0x9f (source), and a "needed range" block at +0x18..+0x58
   * (destination). getNeededRange for a motion-path curve is the IDENTITY:
   * the needed range equals the input range verbatim. That is faithful — no
   * time-warping or lookahead is performed by this subclass.
   *
   * Structural transcription is byte-exact:
   *   dst[+0x28,+8] <- src[+0x70,+8]     ; +0x28 <- +0x70   (u64)
   *   dst[+0x18,16] <- src[+0x60,16]     ; +0x18 <- +0x60   (2xdouble / xmm)
   *   dst[+0x30,16] <- src[+0x78,16]     ; +0x30 <- +0x78   (2xdouble / xmm)
   *   dst[+0x40,+8] <- src[+0x88,+8]     ; +0x40 <- +0x88   (u64)
   *   dst[+0x48,+4] <- src[+0x90,+4]     ; +0x48 <- +0x90   (u32)
   *   dst[+0x58,+1] <- 0                 ; +0x58 <- 0       (u8)
   *   dst[+0x50,+8] <- src[+0x98,+8]     ; +0x50 <- +0x98   (u64)
   * Return value = p (the same pointer, per movq %rsi,%rax @0x40d704).
   */
  getNeededRange(p: OZCurveNodeParamLayout): OZCurveNodeParamLayout {
    // Byte-exact mirror. Field names match the offsets recovered above.
    // OZCurveNodeParam is a frontier struct; we transcribe only the offsets
    // this specific method reads/writes.
    p.needed_28_u64 = p.input_70_u64;             // 0x40d707..0x40d70b  (u64)
    p.needed_18_pair = p.input_60_pair.slice() as [number, number]; // 0x40d70f..0x40d713 (2xf64)
    p.needed_30_pair = p.input_78_pair.slice() as [number, number]; // 0x40d717..0x40d71b (2xf64)
    p.needed_40_u64 = p.input_88_u64;             // 0x40d71f..0x40d726  (u64)
    p.needed_48_u32 = p.input_90_u32 | 0;         // 0x40d72a..0x40d730  (u32)
    p.needed_58_u8  = 0;                          // 0x40d733            (u8 = 0 imm)
    p.needed_50_u64 = p.input_98_u64;             // 0x40d737..0x40d73e  (u64)
    return p;                                     // 0x40d704 movq %rsi,%rax
  }

  // ---------------------------------------------------------------------------
  // Frontier / heavy methods. Each throws with its @0xADDR so the port ledger
  // sees the exact addresses waiting for a follow-up decoder to transcribe.
  // ---------------------------------------------------------------------------

  /**
   * OZMotionPathCurveNode::solveNode(CMTime const&, double, double)
   * @Ozone 0x40ae40  (vtable slot *0x10)
   *
   * Not yet transcribed — a full re-decode is required because disasm.sh's
   * prefix-match tool collides with the second solveNode overload; a per-
   * symbol llvm-objdump pass is needed to isolate the body.
   */
  solveNode_time(_time: unknown, _a: number, _b: number): void {
    throw new Error("OZMotionPathCurveNode::solveNode(CMTime const&, double, double) @Ozone 0x40ae40 not yet transcribed");
  }

  /**
   * OZMotionPathCurveNode::solveNode(OZCurveNodeParam&)
   * @Ozone 0x40d570  (vtable slot *0x18)
   *
   * Not yet transcribed — same disasm-collision reason as the CMTime overload.
   */
  solveNode_param(_p: OZCurveNodeParamLayout): void {
    throw new Error("OZMotionPathCurveNode::solveNode(OZCurveNodeParam&) @Ozone 0x40d570 not yet transcribed");
  }

  /**
   * OZMotionPathCurveNode::getLength(CMTime const&)
   * @Ozone 0x40b230
   *
   * 145-line body. Dynamic-casts field_08_behavior (OZBehavior*) to
   * OZMotionPathBehavior via __dynamic_cast @0x40b25f, then calls
   * OZChannel::getValueAsInt @0x40b27e / OZMotionPathBehavior::getPositionChannel
   * @0x40b28b, and in the trivial branch tail-jmps into
   * OZChannelPosition3D::getLength @0x40b2a7. None of these classes are
   * transcribed yet; the whole method is a frontier plumbing surface.
   */
  getLength(_t: unknown): number {
    throw new Error("OZMotionPathCurveNode::getLength(CMTime const&) @Ozone 0x40b230 not yet transcribed (frontier callees: OZMotionPathBehavior, OZChannel::getValueAsInt, OZChannelPosition3D::getLength)");
  }

  /**
   * OZMotionPathCurveNode::getPositionOnPath(CMTime const&, CMTime const&, double)
   * @Ozone 0x40b470
   *
   * 600-line body. Not yet transcribed. Awaits decode of the same frontier
   * callee set as getLength plus OZBehaviorCurveNode's u-solver.
   */
  getPositionOnPath(_t0: unknown, _t1: unknown, _u: number): unknown {
    throw new Error("OZMotionPathCurveNode::getPositionOnPath(CMTime const&, CMTime const&, double) @Ozone 0x40b470 not yet transcribed (600-line body, frontier)");
  }

  /**
   * OZMotionPathCurveNode::getPosition(double, CMTime const&, CMTime const&, double, double)
   * @Ozone 0x40bff0
   *
   * 1142-line body — the largest single method in this class. Full arc-length
   * reparameterisation and cubic-spline evaluation live here. Frontier.
   */
  getPosition(_a: number, _t0: unknown, _t1: unknown, _b: number, _c: number): unknown {
    throw new Error("OZMotionPathCurveNode::getPosition(double, CMTime const&, CMTime const&, double, double) @Ozone 0x40bff0 not yet transcribed (1142-line body, frontier)");
  }
}

// ---------------------------------------------------------------------------
// OZCurveNodeParam struct — offsets recovered from getNeededRange only. This
// interface is INCOMPLETE; every field named here has a byte-exact offset
// justified by @Ozone 0x40d700's disasm (see getNeededRange). Additional
// fields (used by the frontier solveNode / getPosition methods) are not yet
// mapped and must NOT be invented.
// ---------------------------------------------------------------------------
export interface OZCurveNodeParamLayout {
  needed_18_pair: [number, number]; // +0x18  (2xf64)  — populated from +0x60
  needed_28_u64:  bigint;           // +0x28  (u64)    — populated from +0x70
  needed_30_pair: [number, number]; // +0x30  (2xf64)  — populated from +0x78
  needed_40_u64:  bigint;           // +0x40  (u64)    — populated from +0x88
  needed_48_u32:  number;           // +0x48  (u32)    — populated from +0x90
  needed_50_u64:  bigint;           // +0x50  (u64)    — populated from +0x98
  needed_58_u8:   number;           // +0x58  (u8)     — cleared to 0

  input_60_pair:  [number, number]; // +0x60  (2xf64)  — source
  input_70_u64:   bigint;           // +0x70  (u64)    — source
  input_78_pair:  [number, number]; // +0x78  (2xf64)  — source
  input_88_u64:   bigint;           // +0x88  (u64)    — source
  input_90_u32:   number;           // +0x90  (u32)    — source
  input_98_u64:   bigint;           // +0x98  (u64)    — source
}
