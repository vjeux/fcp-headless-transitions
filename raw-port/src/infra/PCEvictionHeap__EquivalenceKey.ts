// PCEvictionHeap<Iter>::bubble — ProCore.framework.
//
// Template instantiation ported here:
//   Iter = std::__1::__map_iterator<
//            std::__1::__tree_iterator<
//              std::__1::__value_type<
//                std::__1::tuple<
//                  (anonymous namespace)::EquivalenceKey const>,
//                PCCacheImpl<
//                  std::__1::tuple<(anonymous namespace)::EquivalenceKey const>,
//                  bool, PCNoLock,
//                  std::__1::less<std::__1::tuple<(anonymous namespace)::EquivalenceKey const>>
//                >::Data>,
//              std::__1::__tree_node<
//                std::__1::__value_type<
//                  std::__1::tuple<(anonymous namespace)::EquivalenceKey const>,
//                  PCCacheImpl<
//                    std::__1::tuple<(anonymous namespace)::EquivalenceKey const>,
//                    bool, PCNoLock,
//                    std::__1::less<std::__1::tuple<(anonymous namespace)::EquivalenceKey const>>
//                  >::Data>,
//                void*>*,
//              long>>
//
// Single method transcribed:
//   @ProCore 0x9c366  bubble(RKSL_ const& iter)
//
// Source disassembly:
//   raw-port/re/disasm/ProCore.__ZN14PCEvictionHeapINSt3__114__map_iteratorINS0_15__tree_iteratorINS0_12__value_typeINS0_5tupleIJKN12_GLOBAL__N_114EquivalenceKeyEEEEN11PCCacheImplIS8_b8PCNoLockNS0_4lessIS8_EEE4DataEEEPNS0_11__tree_nodeISF_PvEElEEEEE6bubbleERKSL_.s
//   (89 lines, ZERO callq instructions — pure integer heap arithmetic on the
//    fields of `this` and the tree-node pointed to by the incoming iterator.)
//
// STRUCT LAYOUTS (recovered from field accesses in the disasm):
//   PCEvictionHeap<Iter> (this = %rdi):
//     +0x00  Iter*  items_begin      ; mov (%rdi),%rax
//     +0x08  Iter*  items_end        ; mov 0x8(%rdi),%rdx
//     size = (items_end - items_begin) / sizeof(Iter*) = /8
//     Each entry in items[] is an 8-byte pointer to a __tree_node.
//     (This heap stores map iterators as raw pointers; dereferencing the iter
//     yields a __tree_node whose payload is the PCCacheImpl<>::Data record.)
//
//   __tree_node (dereferenced from items[i] — read via `mov (%rax,%i,8),%p; mov
//                0x40(%p),%key ; mov %i,0x48(%p)`):
//     +0x40  uint64  priority       ; the sort key (higher = evicted sooner,
//                                     kept in a MIN-heap here: leaf/root logic
//                                     preserves the smallest at index 0. See
//                                     the ja/jbe orientation checks below.)
//     +0x48  int64   heapIdx        ; back-pointer: node stores its own index
//                                     in this->items[] so bubble() can update it
//                                     without a linear search.
//
//   Binary heap layout (0-based, standard):
//     parent(i) = (i - 1) >> 1
//     left(i)   = 2*i + 1
//     right(i)  = 2*i + 2
//
// SEMANTIC: given the iter passed by const&, read the node's stored heapIdx and
// restore the min-heap invariant around that index by first attempting sift-DOWN
// (swap with the smaller of the two children while that child's key is strictly
// less than the current key), and only if no down-swap occurred, attempt
// sift-UP (swap with parent while parent's key is strictly greater than
// current key). Each swap updates both moved nodes' `heapIdx` back-pointers.
//
// The disasm is a single monolithic function; the TS port mirrors the labeled
// blocks 1:1 in a single function body — no helpers, no re-ordering, so every
// branch @0xADDR maps to the same conditional in the code.

// ─── Minimal shapes for still-undecoded neighbour types ──────────────────────
// __tree_node is a separate STL type; only fields at +0x40 and +0x48 are read.
// We expose only the byte-accurate shape needed by bubble().

/** Byte-accurate minimal shape of the __tree_node payload bubble() touches.
 *  Field offsets match the disasm (0x40, 0x48). */
export interface TreeNode_EquivKey {
  /** @ProCore 0x40  the ordering key (uint64 read via `mov 0x40(%p),%r`). */
  priority: bigint;
  /** @ProCore 0x48  self-index into PCEvictionHeap::items (int64). */
  heapIdx: bigint;
}

/** A map-iterator here is modeled as an object holding a pointer to the
 *  __tree_node. The single dereference used by bubble() is `*rsi`, which
 *  yields that node pointer. In TS we just pass the node directly and treat
 *  the iterator as an opaque holder of it. */
export interface MapIter_EquivKey {
  /** The __tree_node this iterator dereferences to. */
  node: TreeNode_EquivKey;
}

/** The heap itself: an array of iterators (items) with a size implied by the
 *  begin/end pair in the disasm. TS models the pair as a single array. */
export interface PCEvictionHeap_EquivKey {
  /** items[i] holds the iterator (containing the __tree_node) at heap slot i.
   *  In the binary these are two pointer fields (+0x00, +0x08); the size is
   *  (end - begin) / 8. We use a JS array; `size()` is `items.length`. */
  items: MapIter_EquivKey[];
}

/**
 * PCEvictionHeap<Iter>::bubble(RKSL_ const&) — restore the min-heap invariant
 * around the slot named by the passed iterator's stored heapIdx.
 *   @ProCore 0x9c366
 *
 * Faithful transcription of the 89-line disasm; every labeled block in the
 * assembly appears as a same-named block in this body.
 */
export function PCEvictionHeap_EquivKey_bubble(
  self: PCEvictionHeap_EquivKey,
  iter: MapIter_EquivKey,
): void {
  // @ProCore 0x9c371-0x9c37b  base + size (in entries) of items[]
  const items = self.items;
  const size = BigInt(items.length);

  // @ProCore 0x9c37f-0x9c382  rcx = (*iter).node->heapIdx
  let i: bigint = iter.node.heapIdx;

  // @ProCore 0x9c386  r9 = 2*i + 1  (left child index)
  let leftIx: bigint = 2n * i + 1n;

  // Track whether the sift-DOWN phase performed any swap. If it did NOT (and
  // there were children to test), the sift-UP phase runs. This is the `bl`
  // register in the disasm (initialised to 0 at 0x9c3a3).
  let didSwapDown = false;

  // @ProCore 0x9c38e-0x9c391  if left >= size, jump to the SIFT-UP phase
  // (no children at all — nothing to sift down through).
  if (leftIx < size) {
    // ─── SIFT-DOWN LOOP  @ProCore 0x9c397..0x9c42f ────────────────────────
    // r10 = 2*i (a scratch that the disasm reuses as `right = r10 + 2` and to
    //            index items[right] via `0x10(%rax,%r10,8)`).
    let r10: bigint = 2n * i;               // @ProCore 0x9c397

    // rdi = items[i] — the entry we're sifting down.
    let curIter: MapIter_EquivKey = items[Number(i)];    // @ProCore 0x9c39b
    // r8 = curIter.node->priority
    let curKey: bigint = curIter.node.priority;          // @ProCore 0x9c39f

    // Loop head — the disasm falls through into 0x9c3a5 and only reaches this
    // label again from the bottom via `jb 0x9c3a5` at 0x9c429.
    for (;;) {
      // @ProCore 0x9c3a5  r11 = r10 + 2 (right child index)
      let rightIx: bigint = r10 + 2n;

      // @ProCore 0x9c3a9-0x9c3ac  compare right index with size; jae skips the
      // right-child load. In the disasm: r14b = (right < size) ? seta(curKey >
      // right.key) : 0.
      let curGreaterThanRight: boolean;
      if (rightIx >= size) {
        // @ProCore 0x9c3bd  xor r14d,r14d
        curGreaterThanRight = false;
      } else {
        // @ProCore 0x9c3ae-0x9c3b7  load items[right].key, seta on (curKey > right.key)
        const rightNodeKey = items[Number(rightIx)].node.priority;
        curGreaterThanRight = curKey > rightNodeKey;
      }

      // @ProCore 0x9c3c0-0x9c3c4  r15 = items[left].key
      const leftNodeKey: bigint = items[Number(leftIx)].node.priority;
      // @ProCore 0x9c3c8-0x9c3cb  ja on (curKey > left.key)
      const curGreaterThanLeft: boolean = curKey > leftNodeKey;

      // Combined check block @ProCore 0x9c3cd-0x9c3fd:
      //   * if NEITHER child is smaller than cur (i.e. cur <= both), heap prop
      //     holds ⇒ fall through to sift-up decision (label at 0x9c431).
      //   * else pick the smaller child as swap target.
      if (!curGreaterThanLeft) {
        // @ProCore 0x9c3cd  test r14b,r14b ; @ProCore 0x9c3d0 je 0x9c431
        if (!curGreaterThanRight) {
          // No swap needed — leave the sift-down loop, go to the sift-up gate.
          break;
        }
      }

      // At least one child is smaller; determine the swap-target index.
      //
      // The disasm re-executes `cmp %r15,%r8 ; seta %bl` at 0x9c3d2-0x9c3d5.
      // %bl here becomes the "cur > left" flag (redundant with curGreaterThanLeft
      // computed above, but the machine literally recomputes it — we mirror
      // the effect: `bl = curGreaterThanLeft ? 1 : 0`).
      const bl: boolean = curGreaterThanLeft;

      // @ProCore 0x9c3d8  r12 = rightIx (tentative target = right)
      // @ProCore 0x9c3db-0x9c3e0  if !curGreaterThanRight: r12 = leftIx
      let targetIx: bigint = curGreaterThanRight ? rightIx : leftIx;

      // @ProCore 0x9c3e3-0x9c3ea  r14b &= bl ; cmp $1,r14b ; jne 0x9c3fd
      // If BOTH children are strictly smaller than cur (`bl && curGreaterThanRight`),
      // fall through to compare the two children so we can pick the smaller.
      // Otherwise the tentative target above is already the (only) smaller child.
      const bothSmaller: boolean = bl && curGreaterThanRight;
      if (bothSmaller) {
        // @ProCore 0x9c3ec  r10 = items[right] (re-load using `0x10(%rax,%r10,8)`)
        // @ProCore 0x9c3f1  cmp 0x40(%r10),%r15  (flags = leftKey - rightKey)
        // @ProCore 0x9c3f5  ja 0x9c3fa  (skip r11=left if left > right, i.e. right is smaller)
        // @ProCore 0x9c3f7  mov %r9,%r11  ; r11 = leftIx (right >= left ⇒ pick left)
        // @ProCore 0x9c3fa  mov %r11,%r12
        const rightNodeKey = items[Number(rightIx)].node.priority;
        if (leftNodeKey > rightNodeKey) {
          // right is smaller — keep targetIx = rightIx (already set above)
          targetIx = rightIx;
        } else {
          // left <= right — pick left
          targetIx = leftIx;
        }
      }

      // ─── Perform the swap @ProCore 0x9c3fd-0x9c411 ────────────────────
      // items[i], items[target] = items[target], items[i]
      // items[i].node.heapIdx = i     (new occupant of slot i)
      // items[target].node.heapIdx = target
      const childIter = items[Number(targetIx)];       // @ProCore 0x9c3fd
      items[Number(i)] = childIter;                    // @ProCore 0x9c401
      items[Number(targetIx)] = curIter;               // @ProCore 0x9c405
      // The disasm reloads `r9 = items[i]` at 0x9c409 (== childIter) and
      // writes `r9.heapIdx = i` — same effect as updating childIter directly:
      childIter.node.heapIdx = i;                      // @ProCore 0x9c40d
      curIter.node.heapIdx = targetIx;                 // @ProCore 0x9c411

      // @ProCore 0x9c415  r10 = 2 * target
      r10 = 2n * targetIx;
      // @ProCore 0x9c419  r9 = 2*target + 1 (new left index)
      leftIx = 2n * targetIx + 1n;
      // @ProCore 0x9c421  bl = 1  (didSwap set)
      didSwapDown = true;
      // @ProCore 0x9c423  rcx = target (i advances to the child slot)
      i = targetIx;

      // curIter is unchanged — it's the SAME record, now living at slot `target`.
      // curKey (r8) is unchanged — the disasm never reloads it inside the loop.

      // @ProCore 0x9c426-0x9c429  if new-left < size, jb back to 0x9c3a5
      // @ProCore 0x9c42f  else jmp 0x9c47b (done — reached a leaf sub-tree)
      if (leftIx < size) {
        continue;
      } else {
        return;
      }
    }
    // Fell out of the sift-down loop via the `break` at the neither-smaller
    // check — proceed to the didSwap gate.

    // @ProCore 0x9c431-0x9c434  test $1,%bl ; jne 0x9c47b
    // If we already swapped during sift-down, sift-up is skipped.
    if (didSwapDown) {
      return;
    }
    // @ProCore 0x9c436-0x9c439  reload rcx = (*iter).node->heapIdx
    // (Fresh read — but in this path we never modified iter.node.heapIdx, so
    // this equals the original i. Mirror the reload for faithfulness.)
    i = iter.node.heapIdx;
  }

  // ─── SIFT-UP PHASE  @ProCore 0x9c43d..0x9c479 ─────────────────────────────
  // Entered either from the top jump (`jae 0x9c43d` at 0x9c391: no children at
  // all) or via the neither-smaller / no-swap gate above.
  //
  // @ProCore 0x9c43d-0x9c440  testq %rcx,%rcx ; je 0x9c47b  (root ⇒ done)
  if (i === 0n) {
    return;
  }

  // @ProCore 0x9c442-0x9c446  rdx = items[i] ; rsi = items[i].key
  let curIterUp: MapIter_EquivKey = items[Number(i)];
  let curKeyUp: bigint = curIterUp.node.priority;

  // Sift-up loop @ProCore 0x9c44a-0x9c479
  for (;;) {
    // @ProCore 0x9c44a  rdi = i - 1
    const iMinus1: bigint = i - 1n;
    // @ProCore 0x9c44e-0x9c451  r8 = (i - 1) >> 1  (parent index; unsigned shr)
    const parentIx: bigint = iMinus1 >> 1n;
    // @ProCore 0x9c454  r9 = items[parent]
    const parentIter: MapIter_EquivKey = items[Number(parentIx)];
    // @ProCore 0x9c458-0x9c45c  cmp %rsi,0x40(%r9) ; jbe 0x9c47b
    // flags = parent.key - curKey. jbe = (CF=1 || ZF=1) = parent.key <= curKey.
    // If parent already <= current, heap property holds ⇒ done.
    if (parentIter.node.priority <= curKeyUp) {
      return;
    }

    // Otherwise swap current with parent.
    // @ProCore 0x9c45e-0x9c46e
    items[Number(i)] = parentIter;               // items[i] = parent
    items[Number(parentIx)] = curIterUp;         // items[parent] = current
    parentIter.node.heapIdx = i;                 // parent moved down to i
    curIterUp.node.heapIdx = parentIx;           // current moved up to parent
    i = parentIx;                                // @ProCore 0x9c472 rcx = parent

    // @ProCore 0x9c475-0x9c479  cmp $1,%rdi ; ja 0x9c44a
    // Exit when the OLD (i-1) <= 1, i.e. old-i <= 2 — the parent we just
    // reached is at index 0 or 1, and its own parent would still be 0, so
    // any further iteration is dominated by the `testq %rcx` guard above
    // (which is inlined here as the top check at 0x9c43d — but the machine
    // reads only `cmp $1,%rdi` and exits before rechecking rcx). Mirror
    // exactly: exit when iMinus1 <= 1n.
    if (!(iMinus1 > 1n)) {
      return;
    }
    // Loop continues — curIterUp / curKeyUp are UNCHANGED (the record we're
    // bubbling up carries its own key with it).
  }
}
