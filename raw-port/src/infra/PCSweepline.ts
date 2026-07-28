// PCSweepline — ProCore.framework class: a Bentley–Ottmann-style geometric
// sweepline over a closed polygon whose vertices live in a
// std::vector<PCVector2<double>>. The class owns two fields (see LAYOUT below):
//
//   +0x00..+0x18  std::vector<PCVector2<double>>   _points   (copied from ctor arg)
//   +0x18..       PCBinaryTree<PCEdgeSegment>      _tree
//
// Exported methods (all decoded from the ProCore x86_64 slice at
// /Applications/Final Cut Pro.app/Contents/Frameworks/ProCore.framework/…/ProCore):
//
//   PCSweepline::PCSweepline(vector<PCVector2<double>>&)  @0x0000000000009ec70 (C1) / @0x9ec08 (C2)
//   PCSweepline::addSegment(PCEdgeVertex*)                @0x000000000009ecb4
//   PCSweepline::findSegment(PCEdgeVertex*)               @0x000000000009ee14
//   PCSweepline::removeSegment(PCTreeNode<PCEdgeSegment>*) @0x000000000009ef7a
//   PCSweepline::intersect(PCTreeNode<...>*,PCTreeNode<...>*) @0x000000000009ee4a
//   PCSweepline::getSegmentAboveSegment(PCTreeNode<...>*) @0x000000000009f17a
//   PCSweepline::getSegmentBelowSegment(PCTreeNode<...>*) @0x000000000009f1c6
//
// The bulk of the "geometry" work (BST insertion/lookup/deletion with the
// PCEdgeSegment operator< comparator) lives in PCBinaryTree<PCEdgeSegment>;
// PCSweepline itself is only 4 wrapper methods + 2 in-order neighbor walks
// on PCTreeNode<T>'s parent/left/right pointers + 1 heavy geometric
// intersect() predicate. Every wrapper cites its callee's mangled symbol so
// the ledger frontier sees the demand.
//
// Source disassembly (via raw-port/tools/disasm.sh, faithful transcription):
//   raw-port/re/disasm/ProCore.PCSweepline.PCSweepline.s
//   raw-port/re/disasm/ProCore.PCSweepline.addSegment.s
//   raw-port/re/disasm/ProCore.PCSweepline.findSegment.s
//   raw-port/re/disasm/ProCore.PCSweepline.removeSegment.s
//   raw-port/re/disasm/ProCore.PCSweepline.intersect.s
//   raw-port/re/disasm/ProCore.PCSweepline.getSegmentAboveSegment.s
//   raw-port/re/disasm/ProCore.PCSweepline.getSegmentBelowSegment.s
//
// DECODE: PCSweepline instance layout (from the ctor @0x9ec08 and addSegment @0x9ecb4):
//   +0x00  T*      _points.__begin_   // std::vector<PCVector2<double>>
//   +0x08  T*      _points.__end_
//   +0x10  T*      _points.__cap_
//   +0x18  ...     _tree              // PCBinaryTree<PCEdgeSegment>
//
//   The ctor zeros [0x00..0x20) via `movups %xmm0,(%rdi)` + `movups %xmm0,0x10(%rdi)`
//   (@0x9ec15/@0x9ec19), then, if the passed reference is not self, calls
//   std::__1::vector<PCVector2<double>>::__assign_with_size(this, src.begin,
//   src.end, size)  @0x9ec3c  — a full copy of the source vector into the
//   member. The tree at +0x18 stays zero-initialized (PCBinaryTree default
//   ctor is emitted inline / not exported here — kept as a decode-frontier).
//
// DECODE: PCVector2<double> (from the packed-double loads in addSegment):
//   +0x00  double  x     (loaded via `movupd (%rdi,idx*16), %xmm0`)
//   +0x08  double  y     (packed as the high double of the same movupd)
//   sizeof = 16
//
// DECODE: PCEdgeVertex (from findSegment @0x9ee14 and addSegment @0x9ecb4):
//   +0x00  u64     idx     // vertex index into _points (mod size)
//                          // read via `movq (%rsi), %rcx` @0x9eccf.
//                          // in findSegment used ALSO as PCEdgeSegment.id.
//   +0x10  double  ax      // loaded via `movups 0x10(%rsi), %xmm0` @0x9ee26
//   +0x18  double  ay      //   -> stored to stack seg at +0x18 (pt2)
//   +0x20  double  bx      // loaded via `movups 0x20(%rsi), %xmm0` @0x9ee2e
//   +0x28  double  by      //   -> stored to stack seg at +0x08 (key)
//
// DECODE: PCTreeNode<PCEdgeSegment> (from getSegment{Above,Below}Segment @0x9f17a/@0x9f1c6):
//   +0x00  PCEdgeSegment  key           // the segment (fields +0x00..+0x28)
//                                       // First field is read as `movq (%rsi), %r9` in
//                                       // intersect @0x9ee68 (== seg.id at seg+0x00).
//   +0x28  PCTreeNode*    left          // `movq 0x28(%rsi),%rcx` @0x9f1cf, @0x9f18f
//   +0x30  PCTreeNode*    right         // `movq 0x30(%rsi),%rcx` @0x9f183, @0x9f1db
//   +0x38  PCTreeNode*    parent        // `movq 0x38(%rsi),%rcx` @0x9f19a, @0x9f1e6
//
// Frontier callees (throwing stubs — every one cites its @0xADDR + demangled name):
//   PCBinaryTree<PCEdgeSegment>::insertNode(PCEdgeSegment const&)      — addSegment @0x9ed4b
//   PCBinaryTree<PCEdgeSegment>::findNode(PCTreeNode*, PCEdgeSegment const&) — addSegment @0x9ed5a, findSegment @0x9ee3e
//   PCBinaryTree<PCEdgeSegment>::removeNode(PCTreeNode*, PCEdgeSegment const&) — removeSegment @0x9ef8f
//   std::vector<PCVector2<double>>::__assign_with_size(...)             — ctor @0x9ec3c
//   PCEdgeSegment::operator<  (used indirectly via PCBinaryTree)       — @0x9e8d0

import { PCEdgeSegment } from "./PCEdgeSegment.js";

// ─────────────────────────────────────────────────────────────────────────────
// Undecoded callee stubs — throw on entry with cited @0xADDR (per PORTING_SPEC).
// These represent the true "next frontier" for the sweepline subsystem.
// ─────────────────────────────────────────────────────────────────────────────

/** PCTreeNode<PCEdgeSegment> — opaque struct type. Only the field offsets
 *  observed by PCSweepline (see DECODE above) are modeled; the full node
 *  contents (color bit for a red-black tree, etc.) require decoding
 *  PCBinaryTree<PCEdgeSegment>::insertNode / removeNode which are on the
 *  frontier. Keep it opaque here. */
export interface PCTreeNode_PCEdgeSegment {
  /** +0x00 the segment key. Only its id (+0x00 of the segment) is read by
   *  PCSweepline::intersect. Full segment fields — see PCEdgeSegment. */
  readonly key: PCEdgeSegment;
  /** +0x28 left child. */
  readonly left: PCTreeNode_PCEdgeSegment | null;
  /** +0x30 right child. */
  readonly right: PCTreeNode_PCEdgeSegment | null;
  /** +0x38 parent. */
  readonly parent: PCTreeNode_PCEdgeSegment | null;
}

/** PCEdgeVertex — see DECODE above. Modeled as a plain readonly interface;
 *  the class is on the frontier (no ctor exported by ProCore visible from
 *  our current nm dump; only PCSweepline consumes it). */
export interface PCEdgeVertex {
  /** +0x00 idx into PCSweepline._points (used mod size). */
  readonly idx: bigint;
  /** +0x10 ax — first packed-double pair, high half of a stack PCEdgeSegment.pt2. */
  readonly ax: number;
  /** +0x18 ay */
  readonly ay: number;
  /** +0x20 bx — second packed-double pair, low half of a stack PCEdgeSegment.key. */
  readonly bx: number;
  /** +0x28 by */
  readonly by: number;
}

/** PCBinaryTree<PCEdgeSegment>::insertNode — frontier callee.
 *  Called from PCSweepline::addSegment @0x9ed4b. Not yet transcribed. */
function PCBinaryTree_PCEdgeSegment_insertNode(
  _tree: PCBinaryTree_PCEdgeSegment,
  _seg: PCEdgeSegment,
): void {
  throw new Error(
    "PCBinaryTree<PCEdgeSegment>::insertNode(PCEdgeSegment const&) @0x9ed4b not yet transcribed",
  );
}

/** PCBinaryTree<PCEdgeSegment>::findNode — frontier callee.
 *  Called from PCSweepline::addSegment @0x9ed5a and ::findSegment @0x9ee3e.
 *  Signature: (root: PCTreeNode<PCEdgeSegment>*, key: PCEdgeSegment const&) -> PCTreeNode<PCEdgeSegment>*. */
function PCBinaryTree_PCEdgeSegment_findNode(
  _tree: PCBinaryTree_PCEdgeSegment,
  _root: PCTreeNode_PCEdgeSegment | null,
  _seg: PCEdgeSegment,
): PCTreeNode_PCEdgeSegment | null {
  throw new Error(
    "PCBinaryTree<PCEdgeSegment>::findNode(PCTreeNode*, PCEdgeSegment const&) @0x9ed5a not yet transcribed",
  );
}

/** PCBinaryTree<PCEdgeSegment>::removeNode — frontier callee.
 *  Called from PCSweepline::removeSegment @0x9ef8f (tail-called via `jmp`). */
function PCBinaryTree_PCEdgeSegment_removeNode(
  _tree: PCBinaryTree_PCEdgeSegment,
  _root: PCTreeNode_PCEdgeSegment | null,
  _seg: PCEdgeSegment,
): PCTreeNode_PCEdgeSegment | null {
  throw new Error(
    "PCBinaryTree<PCEdgeSegment>::removeNode(PCTreeNode*, PCEdgeSegment const&) @0x9ef8f not yet transcribed",
  );
}

/** PCBinaryTree<PCEdgeSegment> — undecoded template instantiation. Only the
 *  entry-point `_root` field is observed by PCSweepline (via `movq 0x18(%rdi), %rsi`
 *  in addSegment @0x9ed50 and findSegment @0x9ee36 — 0x18 of the PCSweepline
 *  this ptr, which IS the start of `_tree`; the `_root` slot is at offset 0
 *  within `_tree`). We model the tree with a single observed field; the
 *  rest is on the frontier. */
export interface PCBinaryTree_PCEdgeSegment {
  /** +0x00 root of the tree (first field of the tree object). Kept as a
   *  reference we mutate opaquely. */
  root: PCTreeNode_PCEdgeSegment | null;
}

// ─────────────────────────────────────────────────────────────────────────────
// Constants (grounded to ProCore __TEXT — none used here; intersect uses only
// zero-compare against `xorpd`-cleared xmm4, no epsilon).
// ─────────────────────────────────────────────────────────────────────────────

/** Zero-scalar used by intersect() @0x9ef14 as `xorpd %xmm4,%xmm4` — cited so
 *  reviewers can verify the compare is against machine-zero, not an eps. */
const ZERO = 0.0;

/**
 * PCVector2<double> — recovered from `movupd (base,idx*16), %xmm0` in
 * addSegment @0x9ed02. Two contiguous doubles at +0x00 and +0x08.
 */
export interface PCVector2d {
  /** +0x00 */ readonly x: number;
  /** +0x08 */ readonly y: number;
}

/**
 * PCSweepline — see file doc-comment for layout & method map.
 *
 * We model `_points` as a readonly PCVector2d[] snapshot taken at ctor time.
 * The C++ ctor does a full copy via `vector::__assign_with_size` @0x9ec3c —
 * so the semantics is: subsequent mutations to the caller's vector do NOT
 * affect this PCSweepline's view. We reproduce that by slicing the input.
 */
export class PCSweepline {
  /**
   * +0x00..+0x18 std::vector<PCVector2<double>> _points — copy-owned.
   *
   * The disassembly reads `movq (%rdi), %rdi` (@0x9ecd6) to get the data
   * pointer and `movq 0x8(%rbx), %r8; subq %rdi, %r8; sarq $4, %r8` to get
   * the size; every addSegment access indexes as `points[idx % size]`. We
   * therefore preserve the array in insertion order + expose size in the
   * exact place the disasm expects.
   */
  readonly _points: readonly PCVector2d[];

  /**
   * +0x18 PCBinaryTree<PCEdgeSegment> _tree — the sweepline's ordered set of
   * live segments. The ctor zeros this via `movups %xmm0, 0x10(%rdi)`
   * @0x9ec19 (which straddles [0x10..0x20) including the head of _tree at
   * 0x18). A default-constructed BinaryTree has `root=NULL`.
   */
  readonly _tree: PCBinaryTree_PCEdgeSegment;

  /**
   * `PCSweepline::PCSweepline(std::vector<PCVector2<double>>&)`
   * @ProCore __ZN11PCSweeplineC2ERNSt3__16vectorI9PCVector2IdENS0_9allocatorIS3_EEEE @0x000000000009ec08
   * (C1 @0x9ec70 is a thin `pushq %rbp;movq %rsp,%rbp;popq %rbp;jmp C2`.)
   *
   * Body, line-for-line:
   *   @0x9ec12/@0x9ec15/@0x9ec19  zero [this+0x00..this+0x20).
   *   @0x9ec1c/@0x9ec1f          if (&src == this) skip the copy.
   *   @0x9ec21..@0x9ec3c         load src.begin/src.end into %rsi/%rdx, compute
   *                              size=(end-begin)/16 in %rcx, tail-call
   *                              std::vector<PCVector2<double>>::__assign_with_size
   *                              (%rdi=this, %rsi=first, %rdx=last, %rcx=size).
   *
   * We preserve the copy semantics: mutations to `src` after construction do
   * not affect this instance.
   */
  constructor(src: readonly PCVector2d[]) {
    // @0x9ec12..@0x9ec19  zero this[0..0x20) — implicit in TS field init.
    // @0x9ec3c            __assign_with_size — a full copy.
    this._points = src.slice();
    // @0x9ec19            _tree.root <- 0 (part of the [0x10..0x20) zero).
    this._tree = { root: null };
  }

  /**
   * `PCSweepline::addSegment(PCEdgeVertex*)`
   * @ProCore __ZN11PCSweepline10addSegmentEP12PCEdgeVertex @0x000000000009ecb4
   *
   * Body, line-for-line:
   *   @0x9eccf     rcx <- v[0]                          // vertex idx (u64)
   *   @0x9ecd2     stack[-0x40] <- rcx                  // stack.id = idx
   *   @0x9ecd6     rdi <- this._points.__begin_
   *   @0x9ecd9     r8  <- this._points.__end_
   *   @0x9ecdd/@0x9ece0/@0x9ece4  r8 <- (end-begin)/16 = size
   *   @0x9ece7..@0x9ece9  rdx <- idx % size             // idx1
   *   @0x9ecec/@0x9ecef   rsi <- idx1 * 16              // byte offset
   *   @0x9ecf3            rcx <- rcx+1 = idx+1
   *   @0x9ecf6..@0x9ecfb  rdx <- (idx+1) % size          // idx2
   *   @0x9ecfe            rdx <- idx2 * 16
   *   @0x9ed02            xmm0 <- points[idx1]          // (x,y) packed double
   *   @0x9ed07            xmm1 <- points[idx2]
   *   @0x9ed0c/@0x9ed10   ucomisd xmm1,xmm0 ; ja 0x9ed2d
   *                       // if xmm0.x > xmm1.x           -> path S (swap-branch)
   *   @0x9ed12..@0x9ed21  else if !(packed xmm0 < xmm1) mask -> path S
   *   @0x9ed23..@0x9ed2b  path A (fall-through): xmm2 <- xmm0(pre-swap),
   *                                              xmm0 <- xmm1;  jmp 0x9ed31
   *   @0x9ed2d            path S: xmm2 <- xmm1
   *   @0x9ed31..@0x9ed3b  stack.key   <- xmm2 (16B at +0x08)
   *                       stack.pt2   <- xmm0 (16B at +0x18)
   *   @0x9ed48/@0x9ed4b   call PCBinaryTree<PCEdgeSegment>::insertNode(&this._tree, stack)
   *   @0x9ed50/@0x9ed5a   call PCBinaryTree<PCEdgeSegment>::findNode  (&this._tree,
   *                                                                    this._tree.root, stack)
   *   @0x9ed5f..@0x9ed69  epilogue; returns the findNode result via %rax.
   *
   * Semantics: build a PCEdgeSegment from two consecutive polygon points
   * (indexes idx1=v.idx%N and idx2=(v.idx+1)%N), where key=the "lower"
   * endpoint per the branch shown; insert it and return the resulting tree
   * node.
   *
   * The branch decides which endpoint is `key` vs `pt2`. Decoded exactly:
   *   • If p0.x > p1.x                                    -> use p1 as key, p0 as pt2 (path S).
   *   • Else if NEITHER lane of p0 is strictly < p1        -> use p1 as key, p0 as pt2 (path S).
   *   • Else                                                -> use p0 as key, p1 as pt2 (path A).
   *   (When p0.x < p1.x, cmpltpd(%xmm0<%xmm1) is guaranteed nonzero on the
   *    x-lane, so the mask test always passes -> path A. The extra check
   *    catches the ==-x-with-lower-y case.)
   */
  addSegment(v: PCEdgeVertex): PCTreeNode_PCEdgeSegment | null {
    // @0x9eccf-@0x9ecd2
    const idx = v.idx;
    // @0x9ecdd..@0x9ece4 — size = (end-begin)/sizeof(PCVector2<double>=16).
    const size = BigInt(this._points.length);
    if (size === 0n) {
      // The disasm does an unsigned `divq %r10` — dividing by zero is a
      // hardware #DE trap. We refuse loudly instead of hiding it.
      throw new Error(
        "PCSweepline::addSegment @0x9ecb4: divide by zero (points size==0)",
      );
    }
    // @0x9ece4..@0x9ece9  idx1 = idx % size (unsigned).
    const idx1 = Number(idx % size);
    // @0x9ecf3..@0x9ecfe  idx2 = (idx+1) % size (unsigned).
    const idx2 = Number((idx + 1n) % size);
    // @0x9ed02 / @0x9ed07  xmm0 = points[idx1], xmm1 = points[idx2]  (packed x,y).
    const p0 = this._points[idx1]!;
    const p1 = this._points[idx2]!;

    // @0x9ed0c/@0x9ed10   ucomisd xmm1, xmm0; ja 0x9ed2d
    //   In AT&T: `ucomisd %xmm1,%xmm0` compares %xmm0[0] to %xmm1[0]. `ja`
    //   fires when CF=0 and ZF=0 -> %xmm0[0] > %xmm1[0].
    //
    // We split the branch as three JS conditions matching the assembly one-to-one.
    // pathS = "swap": stack.key = p1, stack.pt2 = p0.
    // pathA = "no swap": stack.key = p0, stack.pt2 = p1.
    let key: PCVector2d;
    let pt2: PCVector2d;
    // path decision:
    if (p0.x > p1.x) {
      // @0x9ed10 -> jmp 0x9ed2d
      key = p1;
      pt2 = p0;
    } else {
      // @0x9ed12..@0x9ed21  cmpltpd + movmskpd + testl + je 0x9ed2d
      //   packed(p0 < p1) = (p0.x<p1.x, p0.y<p1.y). mask = high-bit(low)|high-bit(high)<<1.
      //   je fires if mask==0, i.e. NEITHER lane strictly less.
      const anyLess = p0.x < p1.x || p0.y < p1.y;
      if (!anyLess) {
        // @0x9ed21 -> jmp 0x9ed2d
        key = p1;
        pt2 = p0;
      } else {
        // @0x9ed23..@0x9ed2b  path A: xmm2 = p0 (kept), xmm0 = p1.
        key = p0;
        pt2 = p1;
      }
    }

    // @0x9ed31..@0x9ed3b  build the on-stack PCEdgeSegment.
    //   stack.id   = v.idx   (i64)
    //   stack.key0 = key.x   (+0x08)
    //   stack.key1 = key.y   (+0x10)
    //   stack.pt2x = pt2.x   (+0x18)
    //   stack.pt2y = pt2.y   (+0x20)
    const stack = new PCEdgeSegment(idx, key.x, key.y, pt2.x, pt2.y);

    // @0x9ed48..@0x9ed4b  PCBinaryTree<PCEdgeSegment>::insertNode(&this._tree, stack)
    PCBinaryTree_PCEdgeSegment_insertNode(this._tree, stack);
    // @0x9ed50..@0x9ed5a  PCBinaryTree<PCEdgeSegment>::findNode(&this._tree,
    //                                                            this._tree.root, stack)
    return PCBinaryTree_PCEdgeSegment_findNode(this._tree, this._tree.root, stack);
  }

  /**
   * `PCSweepline::findSegment(PCEdgeVertex*)`
   * @ProCore __ZN11PCSweepline11findSegmentEP12PCEdgeVertex @0x000000000009ee14
   *
   * Body, line-for-line:
   *   @0x9ee1c    rax <- v[0]                     // id
   *   @0x9ee23    stack[-0x28].id <- rax
   *   @0x9ee26    xmm0 <- movups 0x10(%rsi)        // (v.ax, v.ay) as 16B
   *   @0x9ee2a    stack[-0x28+0x18] <- xmm0        // -> stack.pt2 (+0x18)
   *   @0x9ee2e    xmm0 <- movups 0x20(%rsi)        // (v.bx, v.by) as 16B
   *   @0x9ee32    stack[-0x28+0x08] <- xmm0        // -> stack.key (+0x08)
   *   @0x9ee36    rsi <- this._tree.root
   *   @0x9ee3a    rdi <- &this._tree
   *   @0x9ee3e    call PCBinaryTree<PCEdgeSegment>::findNode(&_tree, _tree.root, stack)
   *
   * NOTE the field swap: v[+0x10..0x20] goes into stack.pt2 (+0x18..0x28),
   * and v[+0x20..0x30] goes into stack.key (+0x08..0x18). This is a raw
   * pass-through of the caller's precomputed (key,pt2) pair — findSegment
   * does NOT run the "pick lower endpoint" logic that addSegment does.
   */
  findSegment(v: PCEdgeVertex): PCTreeNode_PCEdgeSegment | null {
    // @0x9ee1c..@0x9ee23  stack.id = v.idx.
    const id = v.idx;
    // @0x9ee2e..@0x9ee32  stack.key = (v.bx, v.by).
    const key0 = v.bx;
    const key1 = v.by;
    // @0x9ee26..@0x9ee2a  stack.pt2 = (v.ax, v.ay).
    const pt2x = v.ax;
    const pt2y = v.ay;
    const stack = new PCEdgeSegment(id, key0, key1, pt2x, pt2y);

    // @0x9ee3e  PCBinaryTree<PCEdgeSegment>::findNode(&_tree, _tree.root, stack).
    return PCBinaryTree_PCEdgeSegment_findNode(this._tree, this._tree.root, stack);
  }

  /**
   * `PCSweepline::removeSegment(PCTreeNode<PCEdgeSegment>*)`
   * @ProCore __ZN11PCSweepline13removeSegmentEP10PCTreeNodeI13PCEdgeSegmentE @0x000000000009ef7a
   *
   * Body, line-for-line:
   *   @0x9ef7e    testq %rsi,%rsi
   *   @0x9ef81    je 0x9ef94                       // if node == NULL: fall through to ret
   *   @0x9ef83    rdx <- %rsi (the node — passed as 3rd arg to removeNode as `const&` seg)
   *   @0x9ef86    rsi <- this._tree.root
   *   @0x9ef8a    rdi <- &this._tree
   *   @0x9ef8f    jmp PCBinaryTree<PCEdgeSegment>::removeNode(&_tree, _tree.root, *node)  // tail
   *   @0x9ef94..@0x9ef95  epilogue.
   *
   * removeNode's third argument is `PCEdgeSegment const&`, but here we pass
   * `node` (a PCTreeNode<PCEdgeSegment>*) — because PCTreeNode<T>'s first
   * field is the T `key`, so &node == &node->key (they alias). We preserve
   * that aliasing exactly.
   */
  removeSegment(node: PCTreeNode_PCEdgeSegment | null): PCTreeNode_PCEdgeSegment | null {
    // @0x9ef7e..@0x9ef81  NULL guard.
    if (node === null) {
      return null;
    }
    // @0x9ef83..@0x9ef8f  tail-call removeNode(&_tree, _tree.root, node.key).
    //   The C++ passes `node` as a `PCEdgeSegment const&`; PCTreeNode's first
    //   field is the segment key, so &node == &node.key exactly.
    return PCBinaryTree_PCEdgeSegment_removeNode(
      this._tree,
      this._tree.root,
      node.key,
    );
  }

  /**
   * `PCSweepline::getSegmentAboveSegment(PCTreeNode<PCEdgeSegment>*)`
   * @ProCore __ZN11PCSweepline22getSegmentAboveSegmentEP10PCTreeNodeI13PCEdgeSegmentE @0x000000000009f17a
   *
   * Body, line-for-line:
   *   @0x9f17e/@0x9f181   if (!node) return NULL.
   *   @0x9f183            rcx <- node.right (+0x30)
   *   @0x9f187/@0x9f18a   if (!rcx) goto no-right-subtree.
   *   @0x9f18c..@0x9f196  loop:
   *                         rax <- rcx
   *                         rcx <- rcx.left (+0x28)
   *                         if rcx != NULL: continue
   *                       return rax           // leftmost of right subtree
   *   @0x9f19a..@0x9f1bd  no-right-subtree:
   *                         rcx <- node.parent (+0x38)
   *                         if !rcx: return NULL.
   *                         if rcx.left == node: return rcx.
   *                         inner: rax <- rcx.parent
   *                                if !rax: return NULL
   *                                if rax.left == rcx: rcx <- rax; return rcx.
   *                                rcx <- rax
   *                                goto inner
   *
   * This is the classic BST in-order SUCCESSOR (the segment "above" in the
   * sweepline's y-ordering). Transcribed 1:1 below.
   */
  getSegmentAboveSegment(
    node: PCTreeNode_PCEdgeSegment | null,
  ): PCTreeNode_PCEdgeSegment | null {
    // @0x9f17e..@0x9f181
    if (node === null) return null;
    // @0x9f183/@0x9f187  right = node.right; if right: leftmost(right).
    let rcx = node.right;
    if (rcx !== null) {
      // @0x9f18c..@0x9f196  walk left as far as possible.
      let rax: PCTreeNode_PCEdgeSegment = rcx;
      let cur: PCTreeNode_PCEdgeSegment | null = rcx.left;
      while (cur !== null) {
        rax = cur;
        cur = cur.left;
      }
      // @0x9f198 jmp 0x9f1bf (return rax).
      return rax;
    }
    // @0x9f19a..@0x9f1bd  no right subtree — walk up parents.
    rcx = node.parent;
    if (rcx === null) return null;
    // @0x9f1a3/@0x9f1a7  if rcx.left == node: return rcx.
    if (rcx.left === node) {
      // @0x9f1c1..@0x9f1c4  mov rcx,%rax; jmp ret.
      return rcx;
    }
    // @0x9f1a9..@0x9f1bb  inner loop: walk up while we are a RIGHT child.
    // (Node `rcx` is where we are; we came from `rcx`'s right side because the
    //  earlier check failed. Look at rcx.parent; if that parent's LEFT is
    //  rcx, then rcx is the successor; else keep climbing.)
    let child: PCTreeNode_PCEdgeSegment = rcx;
    for (;;) {
      const rax: PCTreeNode_PCEdgeSegment | null = child.parent;
      // @0x9f1ad/@0x9f1b0
      if (rax === null) return null;
      // @0x9f1b2  cmpq %rcx, 0x28(%rax)   (rax.left == child)
      // @0x9f1b6  movq %rax, %rcx
      // @0x9f1b9  jne 0x9f1a9             (loop)
      // Note the assembly order: it ALWAYS moves rax->rcx first, then decides
      // whether to loop or return. So on match we return the NEW rcx (=rax).
      if (rax.left === child) {
        // @0x9f1bb jmp 0x9f1bf; ret %rax  (which is now the parent).
        return rax;
      }
      child = rax;
    }
  }

  /**
   * `PCSweepline::getSegmentBelowSegment(PCTreeNode<PCEdgeSegment>*)`
   * @ProCore __ZN11PCSweepline22getSegmentBelowSegmentEP10PCTreeNodeI13PCEdgeSegmentE @0x000000000009f1c6
   *
   * Mirror of getSegmentAboveSegment (in-order PREDECESSOR). Reads:
   *   @0x9f1cf  rcx <- node.left  (+0x28)
   *   … then rightmost of left subtree; else walk parents until we are a right child.
   * Every offset transcribed the same way as ::getSegmentAboveSegment but with
   * left/right (0x28↔0x30) swapped throughout.
   */
  getSegmentBelowSegment(
    node: PCTreeNode_PCEdgeSegment | null,
  ): PCTreeNode_PCEdgeSegment | null {
    // @0x9f1ca..@0x9f1cd
    if (node === null) return null;
    // @0x9f1cf  left = node.left.
    let rcx = node.left;
    if (rcx !== null) {
      // @0x9f1d8..@0x9f1e2  rightmost of left subtree.
      let rax: PCTreeNode_PCEdgeSegment = rcx;
      let cur: PCTreeNode_PCEdgeSegment | null = rcx.right;
      while (cur !== null) {
        rax = cur;
        cur = cur.right;
      }
      // @0x9f1e4  jmp 0x9f20b (return rax).
      return rax;
    }
    // @0x9f1e6..@0x9f209  no left subtree — walk up.
    rcx = node.parent;
    if (rcx === null) return null;
    // @0x9f1ef  cmpq %rsi, 0x30(%rcx)  (rcx.right == node)
    if (rcx.right === node) {
      return rcx;
    }
    let child: PCTreeNode_PCEdgeSegment = rcx;
    for (;;) {
      const rax: PCTreeNode_PCEdgeSegment | null = child.parent;
      if (rax === null) return null;
      // @0x9f1fe  cmpq %rcx, 0x30(%rax)  (rax.right == child)
      if (rax.right === child) {
        return rax;
      }
      child = rax;
    }
  }

  /**
   * `PCSweepline::intersect(PCTreeNode<PCEdgeSegment>*, PCTreeNode<PCEdgeSegment>*)`
   * @ProCore __ZN11PCSweepline9intersectEP10PCTreeNodeI13PCEdgeSegmentES3_ @0x000000000009ee4a
   *
   * Return: bool (via %al) — 1 iff the two segments (a=%rsi, b=%rdx) truly
   * cross geometrically in the plane. The predicate uses the classic 2-D
   * cross-product test AFTER first filtering out topologically adjacent
   * pairs (segments that share a polygon vertex — those are neighbors, not
   * "intersections" for the sweepline's purposes).
   *
   * Body, line-for-line:
   *
   *   @0x9ee51..@0x9ee5f  if (a == NULL || b == NULL) return 0.
   *
   *   Topological neighbor filter:
   *     @0x9ee68  r9 <- a.seg.id      (= a.seg[+0x00])
   *     @0x9ee6b  r8 <- b.seg.id
   *     @0x9ee6e..@0x9ee79  r10 <- size = (points.end-points.begin)/16
   *     @0x9ee75/@0x9ee7f/@0x9ee81/@0x9ee84
   *              if ((a.id+1) % size == b.id) return 0.
   *     @0x9ee8d/@0x9ee92..@0x9ee9d
   *              if ((b.id+1) % size == a.id) return 0.
   *
   *   Geometric test — Part 1: cross of (a.pt2 - a.key) with each of b's endpoints.
   *     @0x9eea3  xmm0 <- a.key   (a.pt1)  (16B)
   *     @0x9eea8  xmm4 <- a.key1  (=a.pt1.y)
   *     @0x9eead  xmm2 <- a.pt2   (16B)
   *     @0x9eeb2  xmm5 <- a.pt2y
   *     @0x9eeb7  xmm3 <- b.key   (b.pt1)  (16B)
   *     @0x9eebc  xmm1 <- b.pt2                (16B)
   *     @0x9eec1  xmm5 <- xmm5 - xmm4          = a.pt2.y - a.pt1.y   (Δay)
   *     @0x9eec5  xmm6 <- b.pt2y                = b.pt2.y
   *     @0x9eeca..@0x9eece  xmm7 <- (xmm3[1], xmm6[0]) = (b.pt1.y, b.pt2.y)
   *     @0x9eed3  xmm4 <- (a.pt1.y, a.pt1.y)   [movddup]
   *     @0x9eed7  xmm7 <- xmm7 - xmm4          = (b.pt1.y-a.pt1.y, b.pt2.y-a.pt1.y)
   *     @0x9eedb  xmm4 <- xmm2                 = a.pt2
   *     @0x9eedf  xmm4[0] <- xmm4[0]-xmm0[0]   = a.pt2.x - a.pt1.x   (Δax, low lane only)
   *     @0x9eee3  xmm4 <- (Δax, Δax)           [movddup, so both lanes = Δax]
   *     @0x9eee7  xmm4 <- xmm4 * xmm7          = (Δax*(b.pt1.y-a.pt1.y),
   *                                              Δax*(b.pt2.y-a.pt1.y))
   *     @0x9eeeb..@0x9eeef  xmm6 <- (xmm3[0], xmm1[0]) = (b.pt1.x, b.pt2.x)  [unpcklpd]
   *     @0x9eef3  xmm7 <- (a.pt1.x, a.pt1.x)   [movddup 0x8(rsi)]
   *     @0x9eef8  xmm6 <- xmm6 - xmm7          = (b.pt1.x-a.pt1.x, b.pt2.x-a.pt1.x)
   *     @0x9eefc  xmm5 <- (Δay, Δay)           [movddup]
   *     @0x9ef00  xmm5 <- xmm5 * xmm6          = (Δay*(b.pt1.x-a.pt1.x),
   *                                              Δay*(b.pt2.x-a.pt1.x))
   *     @0x9ef04  xmm4 <- xmm4 - xmm5          = per-lane 2D cross of (a.pt2-a.pt1)
   *                                              against (b.pt1-a.pt1) and (b.pt2-a.pt1)
   *                                              — i.e. cA_b1, cA_b2.
   *     @0x9ef08..@0x9ef0c  xmm5 <- (xmm4[1], xmm4[1])   [unpckhpd]
   *     @0x9ef10  xmm5[0] <- xmm5[0] * xmm4[0]  = cA_b1 * cA_b2
   *     @0x9ef14  xmm4 <- 0                     [xorpd]
   *     @0x9ef18  ucomisd xmm4, xmm5            (compare cA_b1*cA_b2 to 0.0)
   *     @0x9ef1c  ja 0x9ee61                    // >0 (same side) => return 0.
   *
   *   Geometric test — Part 2: same idea, swapping a↔b.
   *     @0x9ef22..@0x9ef26  xmm5 <- (b.pt1.y, b.pt1.x)   [shufpd $1 of xmm3 with self]
   *     @0x9ef2b/@0x9ef2f   xmm6 <- (b.pt2.x, a.pt2.y)   [movsd xmm1 into xmm6.low]
   *     @0x9ef33            xmm6 <- xmm6 - xmm3          = (b.pt2.x-b.pt1.x, a.pt2.y-b.pt1.y)
   *     @0x9ef37/@0x9ef3b   xmm7 <- (a.pt1.x, b.pt2.y)
   *     @0x9ef3f            xmm0 <- (a.pt1.y, b.pt1.x)   [shufpd $1 with xmm1 into xmm0]
   *     @0x9ef44            xmm0 <- xmm0 - xmm5          = (a.pt1.y-b.pt1.y, b.pt1.x-b.pt1.x)
   *     @0x9ef48            xmm0 <- xmm0 * xmm6
   *     @0x9ef4c            xmm7 <- xmm7 - xmm3
   *     @0x9ef50            xmm1 <- (b.pt2.y, a.pt2.x)   [shufpd $1 with xmm2 into xmm1]
   *     @0x9ef55            xmm1 <- xmm1 - xmm5
   *     @0x9ef59            xmm1 <- xmm1 * xmm7
   *     @0x9ef5d            xmm0 <- xmm0 - xmm1          // xmm0 = (cB_a1, cB_a2)
   *     @0x9ef61..@0x9ef65  xmm1 <- (xmm0[1], xmm0[1])
   *     @0x9ef69            xmm1[0] <- xmm1[0] * xmm0[0]  = cB_a1 * cB_a2
   *     @0x9ef6d            ucomisd xmm4, xmm1            (vs 0.0)
   *     @0x9ef71            setbe %dil                    // xmm1 <= 0 -> 1
   *
   *   @0x9ef75..@0x9ef78  return dil in %eax.
   *
   * The final result is TRUE iff BOTH (cA_b1*cA_b2 ≤ 0) AND (cB_a1*cB_a2 ≤ 0).
   * The first condition is enforced by the `ja` at @0x9ef1c (jumps to the
   * return-0 path if strictly > 0); the second by the `setbe` at @0x9ef71.
   *
   * Ties (products == 0) count as intersections — this is the standard
   * "closed-segment" cross-product test with collinear/endpoint-touching
   * cases treated as crossings, matching FCP's `setbe` (below-OR-equal).
   *
   * Because the disasm uses packed (movupd) loads of `key` and `pt2` and
   * ONLY reads back individual lanes via movsd/unpckhpd, all the arithmetic
   * is plain double-precision — no FMA, no SSE-only tricks that JS doubles
   * can't replicate. We transcribe as scalar doubles.
   */
  intersect(
    a: PCTreeNode_PCEdgeSegment | null,
    b: PCTreeNode_PCEdgeSegment | null,
  ): boolean {
    // @0x9ee51..@0x9ee5f  NULL guard.
    if (a === null || b === null) return false;

    // @0x9ee68/@0x9ee6b  ids.
    const aId = a.key.id;
    const bId = b.key.id;
    // @0x9ee6e..@0x9ee79  size in u64 units of PCVector2<double>.
    const size = BigInt(this._points.length);
    if (size === 0n) {
      // As with addSegment, divq by zero is a hardware trap — refuse loudly.
      throw new Error(
        "PCSweepline::intersect @0x9ee4a: divide by zero (points size==0)",
      );
    }
    // @0x9ee7d..@0x9ee87  if ((a.id+1) % size == b.id) return 0.
    if ((aId + 1n) % size === bId) return false;
    // @0x9ee8d..@0x9ee9d  if ((b.id+1) % size == a.id) return 0.
    if ((bId + 1n) % size === aId) return false;

    // @0x9eea3..@0x9eebc  load the four endpoints as scalar doubles.
    //   PCEdgeSegment layout (from PCEdgeSegment.ts):
    //     +0x00 id, +0x08 key0=pt1.x, +0x10 key1=pt1.y, +0x18 pt2.x, +0x20 pt2.y.
    const ax1 = a.key.key0;
    const ay1 = a.key.key1;
    const ax2 = a.key.pt2x;
    const ay2 = a.key.pt2y;
    const bx1 = b.key.key0;
    const by1 = b.key.key1;
    const bx2 = b.key.pt2x;
    const by2 = b.key.pt2y;

    // @0x9eec1  Δay = ay2 - ay1.
    const dAy = ay2 - ay1;
    // @0x9eedf  Δax = ax2 - ax1.
    const dAx = ax2 - ax1;

    // @0x9eed7  xmm7 = (by1 - ay1, by2 - ay1).
    // @0x9eee7  xmm4 = (Δax * (by1-ay1), Δax * (by2-ay1)).
    // @0x9eef8  xmm6 = (bx1 - ax1, bx2 - ax1).
    // @0x9ef00  xmm5 = (Δay * (bx1-ax1), Δay * (bx2-ax1)).
    // @0x9ef04  xmm4 = xmm4 - xmm5 = (cA_b1, cA_b2) = 2D crosses of (a.pt2-a.pt1)
    //           vs (b.pt1-a.pt1) and (b.pt2-a.pt1).
    const cA_b1 = dAx * (by1 - ay1) - dAy * (bx1 - ax1);
    const cA_b2 = dAx * (by2 - ay1) - dAy * (bx2 - ax1);

    // @0x9ef10..@0x9ef18/@0x9ef1c  if cA_b1 * cA_b2 > 0 return 0.
    if (cA_b1 * cA_b2 > ZERO) return false;

    // Part 2 — swap a↔b. From the disasm (see doc comment above):
    //   dBx = bx2 - bx1
    //   dBy = by2 - by1
    //   cB_a1 = (ay1-by1)*dBx - dBy*(ax1-bx1)     [cross of (b.pt2-b.pt1) vs (a.pt1-b.pt1)]
    //   cB_a2 = dBx*(ay2-by1) - (ax2-bx1)*dBy     [cross of (b.pt2-b.pt1) vs (a.pt2-b.pt1)]
    const dBx = bx2 - bx1;
    const dBy = by2 - by1;
    const cB_a1 = (ay1 - by1) * dBx - dBy * (ax1 - bx1);
    const cB_a2 = dBx * (ay2 - by1) - (ax2 - bx1) * dBy;

    // @0x9ef69..@0x9ef71  return (cB_a1 * cB_a2 <= 0)  (setbe %dil).
    return cB_a1 * cB_a2 <= ZERO;
  }
}
