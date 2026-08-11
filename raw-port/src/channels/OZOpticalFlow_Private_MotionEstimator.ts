// raw-port/src/channels/OZOpticalFlow_Private_MotionEstimator.ts
//
// FCP class `OZOpticalFlow::Private::MotionEstimator` (Ozone.framework,
// x86_64) — the per-sequence driver that feeds frames to the Senso optical-flow
// analyzer and collects the resulting vector fields. This file currently holds
// its default constructor.
//
// Symbols transcribed here (Ozone.framework, x86_64):
//   0x4e9e20  MotionEstimator::MotionEstimator()   [C1 — complete object ctor]
//             __ZN13OZOpticalFlow7Private15MotionEstimatorC1Ev
//
// Source disassembly (dumped via raw-port/tools/disasm.sh --sym … Ozone):
//   raw-port/re/disasm/__ZN13OZOpticalFlow7Private15MotionEstimatorC1Ev.s
//
// NOT transcribed here — separate ledger units, left absent rather than stubbed:
//   0x4e9dd0 C2 base-object ctor (byte-identical body), 0x4e9e70 D2 / 0x4e9f40 D1,
//   0x4e9f50 getSensoEstimator, 0x4ea060 initForNextSequence, 0x4ea0d0 initIfNecessary,
//   0x4ea3f0 addFrame, 0x4ea570 overflowCache, 0x4ea690 shouldEstimate2,
//   0x4ea6b0 estimateMotion, 0x4ea710 estimate3, 0x4eb2a0 estimate2,
//   0x4eb9c0 findFirstOf3, 0x4ebb10 copyRaw, 0x4ebed0 findFirstOf2,
//   0x4ebfa0 flush, 0x4ebfb0 getFrames.
//
// ── STRUCT LAYOUT: OZOpticalFlow::Private::MotionEstimator ─────────────────
// Every offset below is grounded in an instruction from a DIFFERENT method than
// the ctor, so the names are read off real uses rather than assigned to bare
// offsets. (The ctor alone would only prove "something 4 bytes wide lives here".)
//
//   +0x00  spinLock : u32
//          getSensoEstimator @Ozone 0x4e9f62 calls `PCSpinLock::lock()` with
//          %rdi still holding `this` — so the lock object starts at +0x00.
//          The ctor stores it with `movl` (4 bytes), fixing its width.
//
//   +0x08  sensoEstimator : HFOpticalFlowAnalyzerInterface*   (owning, lazily created)
//          getSensoEstimator @Ozone 0x4e9f67 `movq 0x8(%rbx), %r14` then, when
//          null, `operator new(0x10)` @0x4e9f79. The destructor @Ozone 0x4e9e7a
//          loads the same slot and calls through vtable slot +0x8 (the deleting
//          destructor), which is what makes it an owning pointer to a
//          polymorphic object.
//
//   +0x10  frameTree : std::__tree<MotionEstimator::FrameRec, FrameOrder>
//          The libc++ red-black tree triple:
//            +0x10  __begin_node_ : pointer to the leftmost node; for an EMPTY
//                   tree it points at the embedded end node, i.e. `this + 0x18`
//                   (ctor: `leaq 0x18(%rdi), %rax` @0x4e9e32 … `movq %rax,
//                   0x10(%rdi)` @0x4e9e3d; initForNextSequence repeats exactly
//                   this reset @0x4ea0aa/@0x4ea0b7).
//            +0x18  __end_node_.__left_ : root pointer, null when empty.
//            +0x20  __size_ : node count. shouldEstimate2 @Ozone 0x4ea69c reads
//                   it as a quadword (`cmpq $0xa, 0x20(%rdi)`).
//          The instantiation itself is named by the ledger entry
//          `std::__1::__tree<OZOpticalFlow::Private::MotionEstimator::FrameRec,
//          …::FrameOrder, …>::destroy` @Ozone 0x2eaa50.
//
//   +0x28  frameIntervals : std::vector<RetimingMath::IntervalSet<u32>::Interval>
//            +0x28 __begin_, +0x30 __end_, +0x38 __end_cap_.
//          getFrames @Ozone 0x4ebfbd/0x4ebfc1 loads +0x28 and +0x30 and derives
//          the count with `subq` + `sarq $0x3` — an 8-byte element, matching
//          `Interval { u32 lo; u32 hi }`. initForNextSequence clears it in place
//          with `movq 0x28(%rbx),%rax ; movq %rax,0x30(%rbx)` @0x4ea0c2.
//
//   +0x40  field0x40 : u32 — initForNextSequence zeroes it @Ozone 0x4ea09f
//          (`movl $0x0, 0x40(%rdi)`). No read has been decoded yet, so it keeps
//          an offset-derived name instead of an invented one.
//
//   +0x44  flushRequested : bool
//          flush() @Ozone 0x4ebfa4 sets it (`movb $0x1, 0x44(%rdi)`),
//          shouldEstimate2 @Ozone 0x4ea696 tests it (`cmpb $0x0, 0x44(%rdi)`),
//          initForNextSequence @Ozone 0x4ea09b clears it.
//
//   +0x48 … +0x6f  sequence parameters — NOT touched by this constructor; they
//          are written by initForNextSequence (@0x4ea070 +0x48, @0x4ea073 +0x4c
//          := -1, @0x4ea07a +0x50, @0x4ea07d +0x54, @0x4ea091 +0x60,
//          @0x4ea095 +0x64, @0x4ea098 +0x68). Left out of the ctor below for
//          exactly that reason: the disassembly does not initialize them.
//
//   +0x70  vector0x70 : std::vector<…>  { +0x70 begin, +0x78 end, +0x80 cap }
//   +0x88  vector0x88 : std::vector<…>  { +0x88 begin, +0x90 end, +0x98 cap }
//          Both are proved to be vectors by the destructor, which frees each by
//          loading its begin pointer and collapsing end onto it
//          (@0x4e9eff/@0x4e9f08 for +0x70, @0x4e9ee7/@0x4e9ef3 for +0x88), and
//          by estimate2/estimate3 growing them through the standard
//          begin/end/cap triple (@0x4ea14d…@0x4ea1ae). Their ELEMENT type is not
//          pinned by any instruction the ctor or dtor executes, so they keep
//          offset-derived names.
//
//   +0xa0  sharedPtr0xa0 : std::shared_ptr<…> { +0xa0 object, +0xa8 control block }
//   +0xb0  sharedPtr0xb0 : std::shared_ptr<…> { +0xb0 object, +0xb8 control block }
//          The destructor releases both with the libc++ shared_ptr shape: load
//          the control block (@0x4e9eb8 for +0xa8, @0x4e9e89 for +0xb8), skip if
//          null, then `lock xadd $-1` on its strong count (@0x4e9e95…).
//
//   sizeof ≥ 0xc0 (the last store of the ctor writes +0xb0 … +0xbf).

/**
 * HFOpticalFlowAnalyzerInterface — the Senso analyzer the estimator drives. It
 * is created through `operator new` in getSensoEstimator @Ozone 0x4e9f79 and
 * destroyed through its own vtable @Ozone 0x4e9e86; it is not an Ozone class
 * and is not part of this file's decoded surface, so it is a black-box handle.
 */
type HFOpticalFlowAnalyzerInterface = object;

/**
 * The embedded `__end_node_` of the frame tree (+0x18).
 *
 * Modelled as its own object because the constructor takes its ADDRESS —
 * `leaq 0x18(%rdi), %rax` @Ozone 0x4e9e32 — and stores that into
 * `__begin_node_`. Representing it as a distinct object lets the TS port
 * reproduce that self-reference by identity rather than by a magic value.
 */
export interface OZOpticalFlow_Private_MotionEstimator_TreeEndNode {
  /** +0x18 — `__end_node_.__left_`: the tree root, null while the tree is empty. */
  left: OZOpticalFlow_Private_MotionEstimator_TreeEndNode | null;
}

export class OZOpticalFlow_Private_MotionEstimator {
  /** +0x00 — PCSpinLock guarding lazy creation of the analyzer (see layout table). */
  spinLock: number;

  /** +0x08 — owning pointer to the Senso analyzer; null until first use. */
  sensoEstimator: HFOpticalFlowAnalyzerInterface | null;

  /** +0x18 — the tree's embedded end node (see TreeEndNode). */
  frameTreeEndNode: OZOpticalFlow_Private_MotionEstimator_TreeEndNode;

  /**
   * +0x10 — `__begin_node_`. Points at {@link frameTreeEndNode} exactly when the
   * tree is empty, which is the state this constructor establishes.
   */
  frameTreeBeginNode: OZOpticalFlow_Private_MotionEstimator_TreeEndNode;

  /** +0x20 — `__size_`, the number of FrameRec nodes. */
  frameTreeSize: number;

  /**
   * +0x28/+0x30/+0x38 — std::vector<IntervalSet<u32>::Interval>. The three null
   * pointers the constructor writes ARE libc++'s empty-vector state, so the
   * faithful model of that state is an empty array.
   */
  frameIntervals: { lo: number; hi: number }[];

  /** +0x40 — u32 zeroed here and by initForNextSequence @Ozone 0x4ea09f. */
  field0x40: number;

  /** +0x44 — bool set by flush() @Ozone 0x4ebfa4, read by shouldEstimate2 @0x4ea696. */
  flushRequested: boolean;

  /** +0x70/+0x78/+0x80 — std::vector; empty (all three pointers null) after this ctor. */
  vector0x70: unknown[];

  /** +0x88/+0x90/+0x98 — std::vector; empty (all three pointers null) after this ctor. */
  vector0x88: unknown[];

  /** +0xa0/+0xa8 — std::shared_ptr; null (object and control block both null). */
  sharedPtr0xa0: unknown | null;

  /** +0xb0/+0xb8 — std::shared_ptr; null (object and control block both null). */
  sharedPtr0xb0: unknown | null;

  /**
   * OZOpticalFlow::Private::MotionEstimator::MotionEstimator()
   * @Ozone 0x4e9e20  [C1 — complete object constructor].
   * Mangled: __ZN13OZOpticalFlow7Private15MotionEstimatorC1Ev
   *
   * Faithful transcription — the whole body is 17 instructions:
   *
   *   0x4e9e20  pushq   %rbp                    ; prologue
   *   0x4e9e21  movq    %rsp, %rbp
   *   0x4e9e24  movl    $0x0, (%rdi)            ; +0x00 spinLock = 0
   *   0x4e9e2a  movq    $0x0, 0x8(%rdi)         ; +0x08 sensoEstimator = nullptr
   *   0x4e9e32  leaq    0x18(%rdi), %rax        ; rax = &this->frameTreeEndNode
   *   0x4e9e36  xorps   %xmm0, %xmm0            ; xmm0 = 16 zero bytes (reused below)
   *   0x4e9e39  movups  %xmm0, 0x18(%rdi)       ; +0x18 end_node.left = 0, +0x20 size = 0
   *   0x4e9e3d  movq    %rax, 0x10(%rdi)        ; +0x10 begin_node = &end_node
   *   0x4e9e41  movups  %xmm0, 0x28(%rdi)       ; zero +0x28 .. +0x37
   *   0x4e9e45  movups  %xmm0, 0x35(%rdi)       ; zero +0x35 .. +0x44  (OVERLAPS above)
   *   0x4e9e49  movups  %xmm0, 0x70(%rdi)       ; zero +0x70 .. +0x7f
   *   0x4e9e4d  movups  %xmm0, 0x80(%rdi)       ; zero +0x80 .. +0x8f
   *   0x4e9e54  movups  %xmm0, 0x90(%rdi)       ; zero +0x90 .. +0x9f
   *   0x4e9e5b  movups  %xmm0, 0xa0(%rdi)       ; zero +0xa0 .. +0xaf
   *   0x4e9e62  movups  %xmm0, 0xb0(%rdi)       ; zero +0xb0 .. +0xbf
   *   0x4e9e69  popq    %rbp
   *   0x4e9e6a  retq
   *
   * Three things the instruction stream says that a rewrite would lose:
   *
   *  1. **The two stores at 0x4e9e41 and 0x4e9e45 OVERLAP.** 0x28+16 = 0x38 but
   *     the next store starts at 0x35, so together they zero the closed range
   *     +0x28 … +0x44 — 29 bytes, which is exactly the vector triple (24) + the
   *     u32 at +0x40 + the bool at +0x44. That is the compiler covering an
   *     odd-sized region with two aligned-width stores, not two separate fields.
   *  2. **`begin_node` is set AFTER the 16-byte zeroing of +0x18** (0x4e9e3d
   *     follows 0x4e9e39), so the self-pointer survives; the address was
   *     computed into %rax at 0x4e9e32 before the zeroing precisely so it could
   *     not be clobbered. The port therefore assigns the end node first and only
   *     then points begin at it.
   *  3. **Nothing between +0x45 and +0x6f is written.** The sequence parameters
   *     at +0x48 … +0x68 are left with whatever the allocation held; only
   *     initForNextSequence @Ozone 0x4ea060 defines them. The port does not
   *     invent zeros for those fields — they are not fields of this constructor.
   *
   * There is no vtable store: MotionEstimator is not polymorphic (no
   * `leaq …vtable…(%rip)` appears in the body).
   */
  constructor() {
    // @0x4e9e24 — movl $0x0, (%rdi): the spin lock starts unlocked.
    this.spinLock = 0;

    // @0x4e9e2a — movq $0x0, 0x8(%rdi).
    this.sensoEstimator = null;

    // @0x4e9e39 — movups %xmm0, 0x18(%rdi): end_node.left = 0 (+0x18), size = 0 (+0x20).
    this.frameTreeEndNode = { left: null };
    this.frameTreeSize = 0;
    // @0x4e9e32/@0x4e9e3d — leaq 0x18(%rdi), %rax ; movq %rax, 0x10(%rdi):
    // begin_node points at the embedded end node (the empty-tree sentinel).
    this.frameTreeBeginNode = this.frameTreeEndNode;

    // @0x4e9e41/@0x4e9e45 — the two overlapping 16-byte zero stores covering
    // +0x28 … +0x44: the interval vector's begin/end/cap triple, then +0x40 and +0x44.
    this.frameIntervals = [];
    this.field0x40 = 0;
    this.flushRequested = false;

    // @0x4e9e49/@0x4e9e4d — zero +0x70 … +0x8f: the first vector's triple ends at
    // +0x80, so this pair of stores empties vector0x70 and starts vector0x88.
    this.vector0x70 = [];
    // @0x4e9e54 — zero +0x90 … +0x9f: the rest of the second vector's triple.
    this.vector0x88 = [];

    // @0x4e9e5b — zero +0xa0 … +0xaf: shared_ptr object + control block.
    this.sharedPtr0xa0 = null;
    // @0x4e9e62 — zero +0xb0 … +0xbf: the second shared_ptr's pair.
    this.sharedPtr0xb0 = null;

    // @0x4e9e69/@0x4e9e6a — epilogue.
  }
}
