// OZTimeMarkerSet.ts — raw transcription of Ozone `OZTimeMarkerSet`.
//
// The marker-set container Ozone's timeline queries (findTopMarker,
// findFirstMarker, findNextMarker, findPreviousMarker) run over. ONE symbol is
// transcribed here — the default COMPLETE-object constructor. Every other
// member (the copy ctors @0x2117e0/@0x211720, the dtors @0x212e80/@0x212ea0,
// the four find* queries @0x2118a0/@0x211be0/@0x211f80/@0x212220/@0x212540/
// @0x212700, the serializer family @0x212c10..@0x212d90) is a SEPARATE ledger
// unit and is NOT transcribed here.
//
// Provenance (Ozone framework, x86_64):
//   /Applications/Final Cut Pro.app/Contents/Frameworks/Ozone.framework/Versions/A/Ozone
//
// Symbol ported in this file:
//   @0x211700  OZTimeMarkerSet::OZTimeMarkerSet()  [C1, complete-object ctor]
//                __ZN15OZTimeMarkerSetC1Ev
//
// Source disassembly:
//   raw-port/re/disasm/__ZN15OZTimeMarkerSetC1Ev.s (11 lines)
//
// C1 vs C2: the base-object ctor `__ZN15OZTimeMarkerSetC2Ev` @0x2116e0 is a
// SEPARATELY EMITTED body with the IDENTICAL instruction sequence (same three
// stores, same order; only the RIP displacement differs — 0x635c5e @0x2116f3
// vs 0x635c3e @0x211713 — because the two bodies sit 0x20 bytes apart and both
// resolve to the SAME vtable address 0x847358). It is its own ledger unit and
// is not ported here; this file is the C1 body only.
//
// STRUCT LAYOUT (recovered from this ctor alone — nothing else is invented):
//   +0x00  void*   vptr        = 0x847358   (@0x211713/@0x21171a)
//   +0x08  void*   self-pointer to +0x10    (@0x211704/@0x21170f)
//   +0x10  16 bytes zeroed                  (@0x211708/@0x21170b)
//   (size >= 0x20; nothing at or past +0x20 is touched by this body)

import type { CMTime } from "../infra/CMTime.js";
import { CMTimeCompare } from "../infra/CMTime.js";

/**
 * A node of the ordered marker tree `OZTimeMarkerSet` holds at +0x08/+0x10.
 *
 * Every offset below is read by `findNextMarker(CMTime) const` @0x212620 and
 * by nothing else in this file; the shape is the standard three-pointer
 * red-black node the successor walk @0x2126b8..@0x2126ec implements
 * (descend-right-then-leftmost, else climb while the node is a right child):
 *
 *   +0x00  left   — read as `(%rcx)` @0x2126d3 (leftmost descent) and as
 *                   `(%rax)` @0x2126e4 (the "am I my parent's left child?" test)
 *   +0x08  right  — read as `0x8(%r15)` @0x2126b8
 *   +0x10  parent — read as `0x10(%r15)` @0x2126e0
 *   +0x28  key    — a 24-byte CMTime: `movups 0x28(%r15)` @0x212665 takes
 *                   value+timescale+flags and `movq 0x38(%r15)` @0x21265c takes
 *                   the epoch, i.e. exactly {i64 value, i32 timescale,
 *                   u32 flags, i64 epoch}
 *
 * +0x18 and +0x20 are NOT touched by this body and are therefore not modelled.
 * The set's own +0x10 slot (see {@link OZTimeMarkerSetSentinel}) is the tree's
 * END node: this body only ever compares POINTERS against it (@0x212638,
 * @0x212653) and never dereferences it, which is why the sentinel keeps its
 * existing two-quadword shape rather than being retyped.
 *
 * @Ozone 0x212620
 */
export interface OZTimeMarkerNode {
  /** +0x00 — left child (NULL when absent). */
  leftAt0: OZTimeMarkerNode | null;
  /** +0x08 — right child (NULL when absent). */
  rightAt8: OZTimeMarkerNode | null;
  /** +0x10 — parent; the root's parent is the set's END node. */
  parentAt10: OZTimeMarkerNode | OZTimeMarkerSetSentinel;
  /** +0x28 — the marker's CMTime key (24 bytes). */
  keyAt28: CMTime;
}

/**
 * The 16 bytes at +0x10..+0x1f, modelled as the two 64-bit words the single
 * `movups %xmm0, 0x10(%rdi)` @0x21170b zeroes.
 *
 * This is the object the +0x08 slot points AT: `leaq 0x10(%rdi), %rax`
 * @0x211704 takes its ADDRESS and `movq %rax, 0x8(%rdi)` @0x21170f stores it,
 * so the freshly built set holds a pointer INTO ITSELF — the classic empty
 * intrusive-list head, where "empty" is encoded as "the head points at the
 * embedded sentinel". What the two words mean once markers are inserted is NOT
 * decoded by this ctor (the insert path lives in another unit), so they are
 * recorded as raw quadwords rather than given invented names (Rule 5).
 *
 * Modelled as an OBJECT so the self-reference is expressible: a JS object value
 * IS a reference, so `headAt8 === sentinelAt10` reproduces exactly the aliasing
 * the machine creates — the same modelling the landed
 * `OZRenderParams::getWorkingColorDescription()` port uses for `leaq &member`.
 *
 * @Ozone 0x211708 (the address whose 16 bytes this covers)
 */
export interface OZTimeMarkerSetSentinel {
  /** +0x10 — first zeroed quadword. */
  qword10: bigint;
  /** +0x18 — second zeroed quadword. */
  qword18: bigint;
  /**
   * +0x10 AGAIN, now DECODED — the same quadword as {@link qword10}, viewed as
   * what `findNextMarker` @0x212620 proves it to be: the tree's ROOT pointer.
   *
   * The successor climb @0x2126e4 does `cmpq (%rax), %r15` where `%rax` is the
   * node's PARENT — and the root's parent IS this end node, so that load reads
   * the end node's own +0x00, i.e. the set's +0x10. Climbing off the maximum
   * therefore terminates exactly when `end.root === cur`. The ctor's
   * `movups %xmm0, 0x10(%rdi)` @0x21170b zeroes it (empty tree = NULL root),
   * which is why it initialises to `null` alongside the two raw quadwords.
   *
   * Optional so that existing structural users of this interface keep
   * typechecking; the insert path that maintains it is a separate ledger unit.
   */
  rootAt10?: OZTimeMarkerNode | null;
}

/**
 * The INSTALLED vtable pointer this ctor writes to +0x00.
 *
 * `leaq 0x635c3e(%rip), %rax` @0x211713 (next instruction @0x21171a) resolves
 * to 0x21171a + 0x635c3e = **0x847358**, and `nm -m -arch x86_64 Ozone` reports
 * `0000000000847348 (__DATA_CONST,__const) external __ZTV15OZTimeMarkerSet` —
 * i.e. the stored value is the vtable symbol + 0x10, the standard Itanium-ABI
 * "installed pointer" that skips the RTTI header pair. The C2 body @0x2116f3
 * independently resolves to the same 0x847358.
 */
export const OZ_TIME_MARKER_SET_VPTR = 0x847358; // @Ozone 0x211713 -> 0x847358

/**
 * `OZTimeMarkerSet` — Ozone's set of timeline markers.
 *
 * Only the three slots this ctor writes are modelled. The class's query and
 * serializer methods will ground further fields when they are transcribed.
 */
export class OZTimeMarkerSet {
  /**
   * +0x00 — the vptr slot. Written LAST by the ctor (@0x21171a), after the
   * data slots, which is the order the binary uses.
   */
  vptrAt0 = 0;

  /**
   * +0x10..+0x1f — the embedded sentinel the +0x08 head points at.
   * Zeroed by the `movups` @0x21170b.
   */
  sentinelAt10: OZTimeMarkerSetSentinel = { qword10: 0n, qword18: 0n, rootAt10: null };

  /**
   * +0x08 — the head pointer. Set to `this + 0x10`, i.e. to
   * {@link sentinelAt10}, so a default-constructed set points at its own
   * sentinel. NULL is never stored here by this ctor.
   */
  headAt8: OZTimeMarkerSetSentinel | null = null;

  /**
   * `OZTimeMarkerSet::OZTimeMarkerSet()` [C1] — @Ozone 0x211700
   * (__ZN15OZTimeMarkerSetC1Ev).
   *
   * Full transcription — every instruction, in order:
   *
   *   0x211700  pushq %rbp                   ; frame setup (no TS counterpart)
   *   0x211701  movq  %rsp, %rbp             ; frame setup (no TS counterpart)
   *   0x211704  leaq  0x10(%rdi), %rax       ; rax = &this->sentinelAt10 (address only)
   *   0x211708  xorps %xmm0, %xmm0           ; xmm0 = 128 zero bits
   *   0x21170b  movups %xmm0, 0x10(%rdi)     ; this->sentinelAt10 = {0, 0}   (16 bytes)
   *   0x21170f  movq  %rax, 0x8(%rdi)        ; this->headAt8 = &this->sentinelAt10
   *   0x211713  leaq  0x635c3e(%rip), %rax   ; rax = 0x847358 (vtable + 0x10)
   *   0x21171a  movq  %rax, (%rdi)           ; this->vptrAt0 = 0x847358
   *   0x21171d  popq  %rbp                   ; frame teardown (no TS counterpart)
   *   0x21171e  retq
   *   0x21171f  nop                          ; alignment padding, not executed
   *
   * ORDER IS PRESERVED: the sentinel is zeroed FIRST, the self-pointer is
   * installed SECOND, and the vptr is written LAST. `leaq` @0x211704 computes
   * an EFFECTIVE ADDRESS — it loads nothing — so the value that lands in +0x08
   * is the address of the object's own +0x10, not a copy of its contents; the
   * TS assignment of the sentinel OBJECT reproduces that aliasing exactly
   * (mutating through `headAt8` is visible via `sentinelAt10`, as in the
   * binary).
   *
   * ZERO callees of any kind: no in-scope call, no extern (not even an
   * allocator — the storage is the caller's), no indirect and no virtual
   * dispatch (`depgraph.py deps` lists nothing). No base-class ctor is invoked
   * either, which is why C1 and C2 have identical bodies.
   *
   * Source disassembly:
   *   raw-port/re/disasm/__ZN15OZTimeMarkerSetC1Ev.s (11 lines)
   */
  constructor() {
    // @0x211708/@0x21170b  xorps %xmm0,%xmm0 ; movups %xmm0,0x10(%rdi)
    this.sentinelAt10 = { qword10: 0n, qword18: 0n, rootAt10: null };
    // @0x211704/@0x21170f  leaq 0x10(%rdi),%rax ; movq %rax,0x8(%rdi)
    //   — the address of the just-zeroed sentinel, stored into the head slot.
    this.headAt8 = this.sentinelAt10;
    // @0x211713/@0x21171a  leaq 0x635c3e(%rip),%rax ; movq %rax,(%rdi)
    this.vptrAt0 = OZ_TIME_MARKER_SET_VPTR;
  }

  /**
   * `OZTimeMarkerSet::findNextMarker(CMTime) const` @Ozone 0x212620
   * (__ZNK15OZTimeMarkerSet14findNextMarkerE6CMTime).
   *
   * Linear in-order scan of the marker tree for the FIRST marker whose key is
   * strictly LATER than the supplied time; returns the END node when there is
   * none (including on an empty set).
   *
   * Full transcription — every instruction, in order:
   *
   *   0x212620  pushq %rbp / movq %rsp,%rbp / pushq %r15,%r14,%rbx / subq $0x38,%rsp
   *                                          ; frame setup (no TS counterpart)
   *   0x21262d  movq  %rdi, %rbx             ; rbx = this
   *   0x212630  movq  0x8(%rdi), %r15        ; r15 = this->headAt8   (the BEGIN node)
   *   0x212634  addq  $0x10, %rbx            ; rbx = &this->sentinelAt10 (the END node)
   *   0x212638  cmpq  %rbx, %r15             ; begin == end ?  (POINTER identity)
   *   0x21263b  je    0x2126f1               ;   empty -> return that pointer
   *   0x212641  leaq  0x10(%rbp), %r14       ; r14 = &the by-value CMTime argument
   *   0x212645  jmp   0x21265c               ; enter the loop at the compare
   *   0x212650  movq  %rax, %r15             ; LOOP TOP (after advance): node = next
   *   0x212653  cmpq  %rbx, %rax             ; node == end ?
   *   0x212656  je    0x2126f4               ;   yes -> return it
   *   0x21265c  movq  0x38(%r15), %rax       ; key.epoch
   *   0x212660  movq  %rax, 0x28(%rsp)       ;   -> arg2 slot
   *   0x212665  movups 0x28(%r15), %xmm0     ; key.value/timescale/flags (16 B)
   *   0x21266a  movups %xmm0, 0x18(%rsp)     ;   -> arg2 slot
   *   0x21266f  movq  0x10(%r14), %rax       ; t.epoch
   *   0x212673  movq  %rax, 0x10(%rsp)       ;   -> arg1 slot
   *   0x212678  movups (%r14), %xmm0         ; t.value/timescale/flags
   *   0x21267c  movups %xmm0, (%rsp)         ;   -> arg1 slot
   *   0x212680  callq _CMTimeCompare         ; stub 0x6dcab0 — compare(t, key)
   *   0x212685  testl %eax, %eax
   *   0x212687  jns   0x2126b8               ;   result >= 0  (t >= key) -> ADVANCE
   *   0x212689  leaq  0x28(%r15), %rax       ; else: re-form &key ...
   *   0x21268d..0x2126ab                     ; ... and re-marshal the SAME two
   *                                          ;     arguments into the same slots
   *   0x2126af  callq _CMTimeCompare         ; the SECOND compare(t, key)
   *   0x2126b4  testl %eax, %eax
   *   0x2126b6  jne   0x2126f1               ;   result != 0 -> RETURN this node
   *   0x2126b8  movq  0x8(%r15), %rcx        ; ADVANCE: rcx = node->right
   *   0x2126bc  testq %rcx, %rcx
   *   0x2126bf  je    0x2126e0               ;   no right child -> climb
   *   0x2126d0  movq  %rcx, %rax             ; descend: rax = rcx
   *   0x2126d3  movq  (%rcx), %rcx           ;          rcx = rcx->left
   *   0x2126d6  testq %rcx, %rcx
   *   0x2126d9  jne   0x2126d0               ;   ... until the leftmost
   *   0x2126db  jmp   0x212650               ; next = that leftmost
   *   0x2126e0  movq  0x10(%r15), %rax       ; climb: rax = node->parent
   *   0x2126e4  cmpq  (%rax), %r15           ;        parent->left == node ?
   *   0x2126e7  movq  %rax, %r15             ;        node = parent (always)
   *   0x2126ea  jne   0x2126e0               ;   not the left child -> keep climbing
   *   0x2126ec  jmp   0x212650               ; next = that ancestor
   *   0x2126f1  movq  %r15, %rax             ; return-node path
   *   0x2126f4  addq $0x38,%rsp / popq %rbx,%r14,%r15,%rbp / retq
   *   0x2126ff  nop                          ; padding, not executed
   *
   * SEMANTICS, exactly as the machine computes them:
   *   • The walk starts at `headAt8` — the tree's BEGIN (leftmost) node — and
   *     ends at `sentinelAt10`, compared BY POINTER IDENTITY (@0x212638,
   *     @0x212653). The end node is never dereferenced by this body.
   *   • `_CMTimeCompare` is called as `compare(t, key)`: the INCOMING time is
   *     marshalled into the arg1 slots at (%rsp)/0x10(%rsp) @0x212678/@0x21266f
   *     and the node's key into the arg2 slots at 0x18(%rsp)/0x28(%rsp)
   *     @0x21266a/@0x212660. `jns` is "sign flag clear", i.e. result >= 0
   *     (t >= key) -> keep walking; a NEGATIVE result (t < key) falls into the
   *     second compare.
   *   • The SECOND call is the SAME comparison of the SAME two values (the
   *     compiler re-marshalled the identical bytes — note @0x212689 re-forms
   *     `&key` with `leaq 0x28(%r15)` and reloads through it). Its `jne` is
   *     therefore always taken on that path, but the port issues BOTH calls
   *     because the machine does: `CMTimeCompare` is a pure function of its two
   *     arguments, so the duplicate is observationally a no-op, and dropping it
   *     would be a rewrite rather than a transcription.
   *   • Net effect: return the FIRST in-order node with `t < key`, i.e. the
   *     next marker strictly after `t`; otherwise the end node.
   *
   * The advance @0x2126b8..0x2126ec is the textbook ordered-tree SUCCESSOR:
   * if there is a right child, take its leftmost descendant; otherwise climb
   * through parents while the node is a RIGHT child, and stop at the first
   * ancestor whose LEFT child the walk came from. The root's parent is the end
   * node, so a walk that runs off the maximum lands exactly on the sentinel and
   * the @0x212653 identity test terminates the loop.
   *
   * CALLEE: `_CMTimeCompare` (Ozone symbol stub 0x6dcab0) is CoreMedia public
   * API, out of the five in-scope frameworks — but it does NOT need a throwing
   * boundary stub here: the landed `raw-port/src/infra/CMTime.ts` already
   * implements it against the documented CMTime.h semantics, so this port
   * IMPORTS AND CALLS it. No in-scope callee beyond that, no indirect and no
   * virtual dispatch anywhere in the body.
   *
   * Source disassembly:
   *   raw-port/re/disasm/__ZNK15OZTimeMarkerSet14findNextMarkerE6CMTime.s (63 lines)
   *
   * @param t  the by-value CMTime the caller passes on the stack (@0x212641).
   * @returns the next marker node, or the END node ({@link sentinelAt10}) when
   *          there is none.
   */
  findNextMarker(
    this: OZTimeMarkerSet,
    t: CMTime,
  ): OZTimeMarkerNode | OZTimeMarkerSetSentinel {
    // @0x212634  addq $0x10,%rbx — the END node (identity only, never read).
    const end: OZTimeMarkerSetSentinel = this.sentinelAt10;
    // @0x212630  movq 0x8(%rdi),%r15 — the BEGIN node.
    let node: OZTimeMarkerNode | OZTimeMarkerSetSentinel =
      this.headAt8 as OZTimeMarkerNode | OZTimeMarkerSetSentinel;
    // @0x212638-0x21263b  cmpq %rbx,%r15 ; je 0x2126f1 — empty set.
    if (node === end) {
      // @0x2126f1  movq %r15,%rax — returns the same pointer it started with.
      return node;
    }
    for (;;) {
      // @0x21265c..0x21267c — the node's key and the argument marshalled into
      //   the two by-value CMTime argument slots.
      const n = node as OZTimeMarkerNode;
      // @0x212680  callq _CMTimeCompare(t, key)
      const cmp1 = CMTimeCompare(t, n.keyAt28);
      // @0x212685-0x212687  testl %eax,%eax ; jns 0x2126b8 — t >= key advances.
      if (cmp1 < 0) {
        // @0x212689..0x2126af — the SAME comparison, re-marshalled and re-issued.
        const cmp2 = CMTimeCompare(t, n.keyAt28);
        // @0x2126b4-0x2126b6  testl %eax,%eax ; jne 0x2126f1
        if (cmp2 !== 0) {
          return n;
        }
      }
      // ---- ADVANCE: in-order successor -------------------------------------
      // @0x2126b8-0x2126bf  movq 0x8(%r15),%rcx ; testq ; je 0x2126e0
      let next: OZTimeMarkerNode | OZTimeMarkerSetSentinel;
      let rcx: OZTimeMarkerNode | null = n.rightAt8;
      if (rcx !== null) {
        // @0x2126d0-0x2126d9  rax = rcx ; rcx = rcx->left ; loop while non-NULL.
        let rax: OZTimeMarkerNode = rcx;
        while (rcx !== null) {
          rax = rcx;
          rcx = rcx.leftAt0;
        }
        next = rax;
      } else {
        // @0x2126e0-0x2126ea  climb while the node is NOT its parent's left
        //   child; `movq %rax,%r15` runs every iteration, so `cur` advances to
        //   the parent each time and the loop exits with `cur` == that parent.
        let cur: OZTimeMarkerNode = n;
        for (;;) {
          const parent = cur.parentAt10;
          // @0x2126e4  cmpq (%rax),%r15 — reads the PARENT's +0x00. When the
          //   parent is the END node that word is the set's +0x10, i.e. the
          //   tree ROOT (see OZTimeMarkerSetSentinel.rootAt10); for a real node
          //   it is its left child. One load in the machine, one read here.
          const parentLeft: OZTimeMarkerNode | null | undefined =
            parent === end
              ? (parent as OZTimeMarkerSetSentinel).rootAt10
              : (parent as OZTimeMarkerNode).leftAt0;
          const wasLeftChild = parentLeft === cur;
          cur = parent as OZTimeMarkerNode;
          if (wasLeftChild) {
            break;
          }
        }
        next = cur;
      }
      // @0x212650-0x212656  movq %rax,%r15 ; cmpq %rbx,%rax ; je 0x2126f4
      node = next;
      if (node === end) {
        return node;
      }
    }
  }
}
