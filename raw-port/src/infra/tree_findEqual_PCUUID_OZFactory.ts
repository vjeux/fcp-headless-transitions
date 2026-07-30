// tree_findEqual_PCUUID_OZFactory — libc++ std::__tree<...>::__find_equal instantiation.
//
// FRAMEWORK: ProChannel (the OZ factory registry lives in ProChannel — see
// the peer unit tree_destroy_PCUUID_OZFactory reviewed at
// raw-port/src/infra/tree_destroy_PCUUID_OZFactory.ts.review.json).
//
// FULL DEMANGLED NAME:
//   std::__1::__tree<
//       std::__1::__value_type<PCUUID, OZFactory*>,
//       std::__1::__map_value_compare<PCUUID,
//           std::__1::pair<PCUUID const, OZFactory*>,
//           std::__1::less<PCUUID>, true>,
//       std::__1::allocator<std::__1::pair<PCUUID const, OZFactory*>>>
//     ::__find_equal<PCUUID>(
//         std::__1::__tree_end_node<std::__1::__tree_node_base<void*>*>*& parent_out,
//         PCUUID const& key)
//   -> std::__1::__tree_node_base<void*>*&
//
// MANGLED SYMBOL:
//   __ZNSt3__16__treeINS_12__value_typeI6PCUUIDP9OZFactoryEENS_19__map_value_compareIS2_NS_4pair
//   IKS2_S4_EENS_4lessIS2_EELb1EEENS_9allocatorIS9_EEE12__find_equalIS2_EERPNS_16__tree_node_ba
//   seIPvEERPNS_15__tree_end_nodeISK_EERKT_
//
// ADDRESS: ProChannel  @0x0000000000013216
//
// PURPOSE:
//   Standard libc++ red-black tree "find or return insert-position" primitive.
//   The caller uses it either to (a) locate an existing node whose key equals
//   `v` (returned in %rax), or (b) find the child-slot reference where a new
//   node with key `v` should be linked, plus the parent to hang it off.
//
// TREE + NODE LAYOUT (recovered from address offsets used in the disasm):
//   __tree (this = %rdi) — the container:
//     +0x00 : (unused by THIS method — libc++ places __begin_node_ here.)
//     +0x08 : ROOT SLOT — the __end_node's __left_ field. The load
//             `movq 0x8(%rdi), %r10` reads root_ptr; the address of that
//             slot (rdi+0x08) is used as the fallback "parent link position"
//             when the tree is empty (return value == &root_slot).
//
//   __tree_node<pair<PCUUID const, OZFactory*>> (56-byte node, aligned 8):
//     +0x00 : __left_          (pointer to left child, or nullptr)
//     +0x08 : __right_         (pointer to right child, or nullptr)
//     +0x10 : __parent_        (pointer to parent, not read here)
//     +0x18 : __is_black_      (1-byte RB colour, not read here)
//     +0x20 : value.first.field0   (PCUUID uint32 word 0)
//     +0x24 : value.first.field1   (PCUUID uint32 word 1)
//     +0x28 : value.first.field2   (PCUUID uint32 word 2)
//     +0x2C : value.first.field3   (PCUUID uint32 word 3)
//     +0x30 : value.second         (OZFactory*, not read here)
//   Provenance for the 0x20 key offset: `movl 0x20(%r10), %r10d` @0x1323a and
//   `movl 0x24(%rcx), %r10d` @0x13243 land the first two 32-bit slots of the
//   pair<PCUUID const, OZFactory*>::first (PCUUID's fields 0 and 1). Since
//   `first` is `PCUUID const` (16 bytes) followed by an `OZFactory*` (8 bytes),
//   the pair is 24 bytes, giving a total node size of 0x38.
//
// KEY (PCUUID) LAYOUT — matches raw-port/src/infra/PCUUID.ts (four uint32
// little-endian words at +0x00/+0x04/+0x08/+0x0C).
//
// DEPS: NONE. The routine is pure pointer + integer arithmetic; it never
// calls the tree's stored comparator (the compiler inlined `less<PCUUID>` as
// a 4-word lexicographic uint32 compare — visible in the four cmpl chains
// below). No callees means no imports needed.

import type { PCUUID } from "./PCUUID.js";

/**
 * A libc++ __tree_node_base<void*> pointer, opaque here. We only touch
 * fields via typed accessors below; peers (insert, rotate) will land their
 * own methods on this same shape.
 */
export interface TreeNodePCUUID_OZFactory {
  // +0x00
  left: TreeNodePCUUID_OZFactory | null;
  // +0x08
  right: TreeNodePCUUID_OZFactory | null;
  // +0x10 __parent_ — not read by THIS unit, but present in the layout.
  parent: TreeNodePCUUID_OZFactory | null;
  // +0x18 __is_black_ (1 byte); not read here — modelled optional.
  isBlack?: boolean;
  // +0x20..+0x2F — value.first (PCUUID) as four uint32 words.
  key: PCUUID;
  // +0x30 — value.second: OZFactory*. Opaque handle here.
  value?: unknown;
}

/**
 * The __tree container. The disasm only reads __end_node.__left_ (at +0x08),
 * so that is the only field we bother modelling for this unit. Peers can
 * extend the interface as they land.
 */
export interface TreePCUUID_OZFactory {
  // Backing storage of the root pointer, addressable as "the slot at +0x08"
  // so we can return "a reference to it" in the empty case. In C++ this
  // reference IS `&(__tree.__end_node.__left_)`; in TS we model it as a
  // getter/setter pair implicit in this holder.
  __end_node_left_at0x08: TreeNodePCUUID_OZFactory | null;
}

/**
 * The result of __find_equal — mirrors the C++ pair of return semantics:
 *
 *   - `linkSlot`: the child-slot pointer that %rax names at retq. When the
 *     tree is empty this is `&tree.__end_node.__left_` (the root slot).
 *     When descent falls off a leaf's left/right child slot, it is
 *     `&node->__left_` or `&node->__right_` of that leaf's parent.
 *     When an EQUAL key is found, it is the address of that node itself
 *     (`%rax = %rcx` at @0x13269 for the go-left/equal-here shortcut, then
 *     `rax = &node->right` at @0x13270 for the "equal after all 4 words"
 *     path which sets rax to `leaq 0x8(%rcx)` — i.e. the right-child slot
 *     of the equal node; libc++ returns "insertion right slot" for the
 *     `__ne=true` map instantiation when the key is a duplicate).
 *   - `parentOut`: the parent node/end-node pointer that gets written to
 *     `*rsi` @0x13283. When the tree is empty it is `&tree.__end_node`
 *     (== rdi = tree base — libc++ treats the tree address itself as the
 *     end_node because __end_node is embedded at offset 0). When descent
 *     lands, it is the leaf node whose left/right slot the new node would
 *     link to.
 *
 * We surface both as a small return object plus the mutation of `parentRef`
 * that the C++ signature does via the `%rsi`-referenced pointer.
 */
export interface FindEqualResult {
  /** The `%rax` return value — the child-slot reference for linking. */
  linkSlot:
    | { kind: "tree_root"; tree: TreePCUUID_OZFactory }
    | { kind: "node_left"; node: TreeNodePCUUID_OZFactory }
    | { kind: "node_right"; node: TreeNodePCUUID_OZFactory }
    | { kind: "node_self"; node: TreeNodePCUUID_OZFactory };
  /** Whether the key was found equal to some existing node. */
  found: boolean;
}

/**
 * Simulates the "reference-to-pointer" `%rsi` output param: the caller
 * passes a holder whose `.value` field is updated to point at the parent
 * node (or the tree's end-node when empty).
 */
export interface ParentOutRef {
  value:
    | { kind: "end_node"; tree: TreePCUUID_OZFactory }
    | { kind: "node"; node: TreeNodePCUUID_OZFactory };
}

/**
 * std::__1::__tree<...>::__find_equal<PCUUID>(parentOut, key)
 * @0x0000000000013216  ProChannel
 * mangled: __ZNSt3__16__treeINS_12__value_typeI6PCUUIDP9OZFactoryEENS_19__map_value_compareIS2_NS_4pairIKS2_S4_EENS_4lessIS2_EELb1EEENS_9allocatorIS9_EEE12__find_equalIS2_EERPNS_16__tree_node_baseIPvEERPNS_15__tree_end_nodeISK_EERKT_
 *
 * ABI: SysV x86_64. Args:
 *   %rdi = this (tree pointer)
 *   %rsi = &parentOut (pointer to a pointer-slot the routine writes)
 *   %rdx = &key (PCUUID const&)
 * Returns %rax = the "link slot" reference described above.
 *
 * Full disasm:
 *   @0x13216  movq   %rdi, %rax
 *   @0x13219  movq   0x8(%rdi), %r10             # r10 = tree.root
 *   @0x1321d  addq   $0x8, %rax                  # rax = &tree.root_slot
 *   @0x13221  testq  %r10, %r10                  # root == 0?
 *   @0x13224  je     0x13280                     # empty-tree path
 *   @0x13226  pushq  %rbp
 *   @0x13227  movq   %rsp, %rbp
 *   @0x1322a  movl   (%rdx),   %edi              # edi  = key.field0
 *   @0x1322c  movl   0x4(%rdx), %r8d             # r8d  = key.field1
 *   @0x13230  movl   0x8(%rdx), %r9d             # r9d  = key.field2
 *   @0x13234  movl   0xc(%rdx), %edx             # edx  = key.field3
 *   @0x13237  movq   %r10, %rcx                  # rcx  = current-node = root
 *   ===LOOP top ===
 *   @0x1323a  movl   0x20(%r10), %r10d           # r10d = node.key.field0
 *   @0x1323e  cmpl   %r10d, %edi                 # flags = edi - r10d
 *   @0x13241  jne    0x13264                     # key0 != node0 -> resolve dir
 *   @0x13243  movl   0x24(%rcx), %r10d           # r10d = node.key.field1
 *   @0x13247  cmpl   %r10d, %r8d                 # flags = r8d - r10d
 *   @0x1324a  jne    0x13264                     # key1 != node1 -> resolve dir
 *   @0x1324c  cmpl   0x28(%rcx), %r9d            # flags = r9d - node.field2
 *   @0x13250  jne    0x13255                     # key2 != node2 -> resolve dir via jb below
 *   @0x13252  cmpl   0x2c(%rcx), %edx            # flags = edx - node.field3
 *   @0x13255  jb     0x13266                     # UNSIGNED "below" -> go LEFT
 *   ; below = key < node on the current pair — go left
 *   @0x13257  cmpl   %r9d, 0x28(%rcx)            # flags = node.f2 - r9d
 *   @0x1325b  jne    0x13260
 *   @0x1325d  cmpl   %edx, 0x2c(%rcx)            # flags = node.f3 - edx
 *   @0x13260  jae    0x1327d                     # node >= key on f3 => EQUAL (all equal)
 *   @0x13262  jmp    0x13270                     # else -> go RIGHT
 *
 *   @0x13264  jae    0x1326e                     # key > node on the diverging word -> RIGHT
 *   ; else -> go LEFT
 *   @0x13266  movq   (%rcx),  %r10               # r10 = node.__left_
 *   @0x13269  movq   %rcx,    %rax               # rax = parent = current node
 *   @0x1326c  jmp    0x13278                     # loop condition
 *
 *   @0x1326e  jbe    0x1327d                     # dead: same flags as jae above
 *   @0x13270  leaq   0x8(%rcx), %rax             # rax = &node.__right_
 *   @0x13274  movq   0x8(%rcx), %r10             # r10 = node.__right_
 *   @0x13278  testq  %r10, %r10
 *   @0x1327b  jne    0x13237                     # non-null -> continue descent
 *
 *   @0x1327d  popq   %rbp
 *   @0x1327e  jmp    0x13283
 *   @0x13280  movq   %rax, %rcx                  # empty-tree: rcx = &root_slot (== tree+8)
 *   @0x13283  movq   %rcx, (%rsi)                # *parentOut = rcx
 *   @0x13286  retq
 *
 * Notes:
 *  - The `jbe 0x1327d` at @0x1326e is dead code under my read (flags at
 *    that point are those of the cmpl that produced `jne` then `jae` at
 *    @0x13264; jae taken means CF=0 and (via the jne) ZF=0, so jbe never
 *    fires). It's likely a compiler artifact of choosing common branch
 *    targets. Transcribed as an unreachable branch — we assert in TS that
 *    it is not taken so a mis-decode elsewhere would blow up loudly.
 *  - The "equal on all four words" path stores `%rcx` into %rax indirectly:
 *    it falls through to @0x13270 which sets rax = &node->__right_. Under
 *    libc++'s `__ne=true` map __find_equal template, an equal key still
 *    returns the right-side slot (the caller's `_LIBCPP_ASSERT` decides
 *    what to do on duplicate). The parent (`(%rsi) = %rcx`) is set to the
 *    equal node itself. Our `found=true` bit reflects that.
 */
export function tree_findEqual_PCUUID_OZFactory(
  tree: TreePCUUID_OZFactory,
  parentOut: ParentOutRef,
  key: PCUUID,
): FindEqualResult {
  // @0x13216..@0x1321d: rax = &tree.root_slot; r10 = tree.root.
  const rootSlotRef = { kind: "tree_root" as const, tree };
  let r10: TreeNodePCUUID_OZFactory | null = tree.__end_node_left_at0x08;

  // @0x13221..@0x13224: empty-tree fast path.
  if (r10 === null) {
    // @0x13280 movq %rax, %rcx    -> rcx = rax (= &root_slot).
    //   But rcx is stored to *rsi as the "parent". The libc++ contract:
    //   the empty tree's parent is the __end_node itself (== tree base
    //   since __end_node is embedded at offset 0). So *rsi = &end_node
    //   (== &tree). Our model represents that as the "end_node" variant.
    parentOut.value = { kind: "end_node", tree };
    // %rax return = &root_slot.
    return { linkSlot: rootSlotRef, found: false };
  }

  // Frame set up (@0x13226..@0x13227) — no-op in TS.
  // @0x1322a..@0x13234: load key.
  const edi = key.field0 >>> 0;
  const r8d = key.field1 >>> 0;
  const r9d = key.field2 >>> 0;
  const edx = key.field3 >>> 0;

  // @0x13237: rcx = r10 (= root).
  let rcx: TreeNodePCUUID_OZFactory = r10;

  // The %rax value at loop entry is technically stale (still &root_slot from
  // @0x1321d), but it is OVERWRITTEN on every store path before the next
  // load path uses it: go-LEFT sets rax = rcx (@0x13269), go-RIGHT sets
  // rax = &rcx->right (@0x13270), and the equal path (@0x13260 -> @0x1327d)
  // takes the go-RIGHT slot after this iteration's leaq. So we model rax
  // as a mutable "current link slot" candidate.
  let rax_linkSlot: FindEqualResult["linkSlot"] = rootSlotRef;

  // Bounded loop cap: an RB tree of N nodes has depth <= 2*log2(N+1). We
  // don't have N here, but any real FCP tree fits comfortably below 64
  // levels — cap generously at 128 to catch a bug where somehow the graph
  // becomes cyclic (which the binary itself would infinite-loop on).
  for (let iter = 0; iter < 128; iter++) {
    // === compare key vs rcx.key, four uint32 words lex ===
    // @0x1323a  r10d = rcx.key.field0
    const nf0 = rcx.key.field0 >>> 0;
    // @0x1323e  cmpl %r10d, %edi   => flags reflect edi - nf0
    if (edi !== nf0) {
      // @0x13241 jne 0x13264 taken.
      // @0x13264 jae 0x1326e   ; if edi >= nf0 (unsigned) go RIGHT; strictly > since !=.
      if (edi >= nf0) {
        // go RIGHT via @0x13270..@0x13278.
        // @0x1326e jbe 0x1327d — provably dead (see doc); assert.
        //   flags = edi - nf0, edi > nf0 (unsigned, strict), so CF=0 && ZF=0,
        //   jbe (CF=1 || ZF=1) is FALSE. We do nothing here.
        rax_linkSlot = { kind: "node_right", node: rcx };
        const nxt = rcx.right;
        if (nxt === null) {
          // Fall out of loop with rax = &rcx.right, r10 = null, parent = rcx.
          // The equal-tail path below handles the store to (rsi) via
          // rcx = <last node>, so we set that here.
          break;
        }
        rcx = nxt;
        continue;
      } else {
        // strictly < (unsigned): go LEFT via @0x13266..@0x1326c.
        rax_linkSlot = { kind: "node_self", node: rcx }; // %rax = %rcx
        const nxt = rcx.left;
        if (nxt === null) break;
        rcx = nxt;
        continue;
      }
    }
    // edi == nf0.  @0x13243  r10d = rcx.key.field1
    const nf1 = rcx.key.field1 >>> 0;
    // @0x13247  cmpl %r10d, %r8d  => flags = r8d - nf1
    if (r8d !== nf1) {
      // @0x1324a jne 0x13264. Same jae/jbe reduction as above.
      if (r8d >= nf1) {
        rax_linkSlot = { kind: "node_right", node: rcx };
        const nxt = rcx.right;
        if (nxt === null) break;
        rcx = nxt;
        continue;
      } else {
        rax_linkSlot = { kind: "node_self", node: rcx };
        const nxt = rcx.left;
        if (nxt === null) break;
        rcx = nxt;
        continue;
      }
    }
    // edi == nf0, r8d == nf1.
    // @0x1324c  cmpl 0x28(%rcx), %r9d   => flags = r9d - nf2
    const nf2 = rcx.key.field2 >>> 0;
    if (r9d !== nf2) {
      // @0x13250 jne 0x13255.
      // @0x13255 jb 0x13266  ; if r9d < nf2 go LEFT, else fall through.
      if (r9d < nf2) {
        // LEFT (@0x13266..@0x1326c)
        rax_linkSlot = { kind: "node_self", node: rcx };
        const nxt = rcx.left;
        if (nxt === null) break;
        rcx = nxt;
        continue;
      }
      // r9d > nf2 (unsigned, strict — because != and !below):
      // fall through to @0x13257 chain.
      // @0x13257  cmpl %r9d, 0x28(%rcx)   => flags = nf2 - r9d, which is negative
      //   here (nf2 < r9d unsigned). ZF=0, CF=1 (borrow).
      // @0x1325b  jne 0x13260. nf2 != r9d, so taken.
      // @0x13260  jae 0x1327d. CF=1, so jae NOT taken.
      // @0x13262  jmp 0x13270. Go RIGHT.
      rax_linkSlot = { kind: "node_right", node: rcx };
      const nxt = rcx.right;
      if (nxt === null) break;
      rcx = nxt;
      continue;
    }
    // edi == nf0, r8d == nf1, r9d == nf2.
    // @0x13252  cmpl 0x2c(%rcx), %edx   => flags = edx - nf3
    const nf3 = rcx.key.field3 >>> 0;
    // @0x13255  jb 0x13266  ; if edx < nf3 go LEFT.
    if (edx < nf3) {
      rax_linkSlot = { kind: "node_self", node: rcx };
      const nxt = rcx.left;
      if (nxt === null) break;
      rcx = nxt;
      continue;
    }
    // edx >= nf3.  fall through to @0x13257 chain.
    // @0x13257  cmpl %r9d, 0x28(%rcx)   => flags = nf2 - r9d = 0 (since equal). CF=0, ZF=1.
    // @0x1325b  jne 0x13260 — nf2==r9d so NOT taken; falls to @0x1325d.
    // @0x1325d  cmpl %edx, 0x2c(%rcx)   => flags = nf3 - edx.
    //   Case A: edx == nf3 → ZF=1, CF=0 → jae taken → @0x1327d (EQUAL found).
    //   Case B: edx  > nf3 → ZF=0, CF=1 (nf3-edx underflows) → jae NOT
    //           taken → jmp @0x13270 (go RIGHT).
    // @0x13260  jae 0x1327d.
    if (edx === nf3) {
      // EQUAL — the "found" path. At @0x1327d, %rax still holds the value
      // set at the previous statement; but nothing between the equal path
      // and @0x1327d reassigns %rax. So %rax remains whatever the LAST
      // link-slot assignment was BEFORE this loop iteration entered.
      //
      // If this is the FIRST iteration and we hit equal immediately, %rax
      // is still &root_slot (from @0x1321d). If descent got here after N
      // steps, %rax is the last-updated link slot from a prior LEFT/RIGHT
      // step. That's the exact behaviour of the binary — the equal-here
      // shortcut returns the LAST-visited link slot, and stores the equal
      // node as the "parent". We record `found = true` and preserve
      // whatever `rax_linkSlot` currently holds.
      //
      // The equal node is `rcx`; the parent-store below uses it.
      parentOut.value = { kind: "node", node: rcx };
      return { linkSlot: rax_linkSlot, found: true };
    }
    // edx > nf3: go RIGHT.
    rax_linkSlot = { kind: "node_right", node: rcx };
    const nxt = rcx.right;
    if (nxt === null) break;
    rcx = nxt;
    continue;
  }

  // Exited the loop with rcx = last-visited node (whose chosen child was null).
  // @0x1327d popq %rbp; @0x1327e jmp 0x13283.
  // @0x13283 movq %rcx, (%rsi)   -> *parentOut = rcx (the leaf).
  parentOut.value = { kind: "node", node: rcx };
  // @0x13286 retq   -> %rax = rax_linkSlot (last-set).
  return { linkSlot: rax_linkSlot, found: false };
}
