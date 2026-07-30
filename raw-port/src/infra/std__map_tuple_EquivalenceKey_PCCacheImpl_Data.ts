// raw-port: std::__1::map<std::__1::tuple<(anonymous namespace)::EquivalenceKey const>,
//                          PCCacheImpl<..., bool, ...>::Data,
//                          std::__1::less<...>,
//                          std::__1::allocator<...>>::find[abi:nqe210106](Key const&)
//
//   @ProCore 0x0009c308  __ZNSt3__13mapINS_5tupleIJKN12_GLOBAL__N_114EquivalenceKeyEEEEN11PCCacheImplIS5_b8PCNoLockNS_4lessIS5_EEE4DataES9_NS_9allocatorINS_4pairIKS5_SB_EEEEE4findB9nqe210106ERSE_
//
// re/disasm:
//   raw-port/re/disasm/ProCore.__ZNSt3__13mapINS_5tupleIJKN12_GLOBAL__N_114EquivalenceKeyEEEEN11PCCacheImplIS5_b8PCNoLockNS_4lessIS5_EEE4DataES9_NS_9allocatorINS_4pairIKS5_SB_EEEEE4findB9nqe210106ERSE_.s
//
// This is a libc++ template instantiation, NOT an FCP class. Emitted inline into ProCore for the
// PCCacheImpl<tuple<EquivalenceKey const>, bool, PCNoLock, less> hot path. The KEY is a
// `tuple<EquivalenceKey const>`, but tuple over a single 16-byte trivially-comparable value has
// the same storage as that value, so the compiler treats the key as two 64-bit words compared
// lexicographically (EquivalenceKey member offsets +0x0 and +0x8). No callees — pure comparison
// against pointer-linked red-black-tree nodes; depgraph reports 0 external deps to a ported
// symbol.
//
// COMPARATOR SEMANTICS:
//   std::less<tuple<EquivalenceKey const>> compares the tuples elementwise, i.e. compares the
//   single 16-byte EquivalenceKey lexicographically. The disasm does exactly that: first compare
//   the +0x0 words, then, on equality, compare the +0x8 words. Concretely, key0 = *(rsi+0) and
//   key1 = *(rsi+8) are unsigned 64-bit values (`cmpq`/`jae`/`ja`/`jb` are unsigned).
//
// OBJECT LAYOUT (std::map's inline __tree, relevant to this method):
//   +0x00  __begin_node_ pointer (not touched)
//   +0x08  __end_node_.__left_ = ROOT pointer. When null, tree is empty.
//          Also: the ADDRESS `&this[0x8]` is used as the "end iterator" sentinel — libc++'s
//          end iterator points at the __end_node_'s address-of-left-slot; walking `->parent`
//          would cycle back to a node whose parent points here. When the search fails, this
//          method returns exactly this address as the "not found" iterator.
//
// TREE NODE LAYOUT (libc++ __tree_node<pair<const Key, Value>>):
//   +0x00  __left_   : __tree_node* (or null)
//   +0x08  __right_  : __tree_node* (or null)   (this address is used for "go right" via `addq $0x8`)
//   +0x10  __parent_ (with color bit in the LSB)
//   +0x18  __value_.first (key) starts here... but wait — the disasm reads the key at +0x20/+0x28.
//          That places the key at offset 0x20 in the node, which is __tree_node's layout when the
//          value_type is aligned to 16 bytes (pair<const tuple<EquivalenceKey>, PCCacheImpl::Data>
//          where Data is at least 16-byte aligned pushes the pair start to +0x20). We adopt that
//          layout directly:
//             +0x20  keyField0 (uint64)  — EquivalenceKey +0x0
//             +0x28  keyField1 (uint64)  — EquivalenceKey +0x8
//   The value bytes follow after the key; not touched by find.
//
// CONTROL FLOW (line-for-line):
//   @0x9c308  rdx = *(this+0x8)        ; rdx = root
//   @0x9c30c  rdi = this + 0x8         ; rdi = &this->end_node.left (used as END-sentinel address)
//   @0x9c310  if (rdx == 0) goto EMPTY_RET
//   @0x9c315  prologue (push rbp; mov rsp,rbp)
//   @0x9c319  r8  = *(k+0x0)           ; r8  = searchKey0
//   @0x9c31c  rcx = *(k+0x8)           ; rcx = searchKey1
//   @0x9c320  rax = rdi                ; rax = END-sentinel  (best-so-far "not-less-than")
//   @0x9c323 .LOOP:                       ; rdx = current node (non-null on entry)
//   @0x9c323  rsi = *(rdx+0x20)        ; rsi = node.keyField0
//   @0x9c327  cmp r8, rsi              ; unsigned dst-src = rsi - r8
//   @0x9c32a  jae .GE_KEY0             ;   rsi >= r8   ⇔ nodeKey0 >= searchKey0
//             ; else nodeKey0 < searchKey0  ⇒ GO RIGHT
//   @0x9c32c  rdx = rdx + 0x8          ; &node.__right_
//   @0x9c330  jmp .STEP
//   @0x9c332 .GE_KEY0:
//   @0x9c332  ja  .STRICT_GT           ;   rsi >  r8   ⇔ nodeKey0 >  searchKey0  ⇒ GO LEFT (save candidate)
//             ; else nodeKey0 == searchKey0  ⇒ compare keyField1
//   @0x9c334  cmp rcx, *(rdx+0x28)     ; unsigned dst-src = node.keyField1 - rcx
//   @0x9c338  jb  .GO_RIGHT            ;   node.keyField1 <  rcx  ⇔ nodeKey1 < searchKey1  ⇒ GO RIGHT
//             ; else nodeKey1 >= searchKey1  ⇒ (nodeKey >= searchKey)  ⇒ GO LEFT (save candidate)
//   @0x9c33a .STRICT_GT:
//   @0x9c33a  rax = rdx                ; save candidate (this node is >= searchKey lexicographically)
//             ; fall through into .STEP with rdx pointing at &node.__left_ (rdx unchanged, and
//             ;  a plain node ptr already is &node.__left_ since __left_ is at offset 0)
//   @0x9c33d .STEP:
//   @0x9c33d  rdx = *rdx               ; load the child (left if we fell through; right if we did addq $0x8)
//   @0x9c340  if (rdx != 0) goto .LOOP
//             ; loop ended. Now check if rax candidate actually equals searchKey.
//   @0x9c345  cmp rdi, rax             ; is rax the END-sentinel?
//   @0x9c348  je  .RET_END             ;   yes ⇒ return end
//             ; got a candidate; verify candidateKey0 >= searchKey0 and if equal, check key1
//   @0x9c34a  rdx = *(rax+0x20)        ; candidateKey0
//   @0x9c34e  cmp rdx, r8              ; unsigned dst-src = r8 - rdx
//   @0x9c351  jae .CHECK_KEY0          ;   r8 >= rdx ⇔ searchKey0 >= candidateKey0
//             ; else searchKey0 < candidateKey0 ⇒ NOT EQUAL ⇒ return end
//   @0x9c353 .RET_END:
//   @0x9c353  rax = rdi                ; rax = END-sentinel
//   @0x9c356  popq rbp; retq
//   @0x9c358 .EMPTY_RET:
//   @0x9c358  rax = rdi
//   @0x9c35b  retq
//   @0x9c35c .CHECK_KEY0:
//   @0x9c35c  ja  .RET_CAND            ;   searchKey0 >  candidateKey0 ⇒ (impossible for a valid
//             ;                          lower_bound candidate; return the current rax which is
//             ;                          the candidate — same as .RET_CAND).
//             ; else searchKey0 == candidateKey0 ⇒ compare key1
//   @0x9c35e  cmp *(rax+0x28), rcx     ; unsigned dst-src = rcx - candidateKey1
//   @0x9c362  jb  .RET_END             ;   rcx < candidateKey1 ⇔ searchKey1 < candidateKey1 ⇒ end
//             ; else searchKey1 >= candidateKey1; combined with lower_bound invariant
//             ;   (candidateKey1 >= searchKey1) ⇒ equality ⇒ return candidate
//   @0x9c364 .RET_CAND: jmp 0x9c356    ; return rax (the candidate node)

// -------- modelled types --------

/**
 * The KEY of this map — a `tuple<EquivalenceKey const>`. `EquivalenceKey` lives in an anonymous
 * namespace and its concrete member layout is opaque outside its TU; the only thing this method
 * cares about is that it is 16 bytes of raw unsigned data, compared as two 64-bit words.
 */
export interface Tuple_EquivalenceKey {
  /** low 64 bits of the EquivalenceKey — the tuple's first (and only) member's +0x0 word */
  keyField0: bigint;
  /** high 64 bits — the tuple's first member's +0x8 word */
  keyField1: bigint;
}

/**
 * libc++ __tree_node for `pair<const tuple<EquivalenceKey>, PCCacheImpl::Data>`. Only the fields
 * find() touches are modelled (left/right children and the two 64-bit key words at +0x20/+0x28).
 */
export interface TreeNode_EquivalenceKey_Data {
  /** +0x00 __left_ child (or null) */
  left: TreeNode_EquivalenceKey_Data | null;
  /** +0x08 __right_ child (or null) */
  right: TreeNode_EquivalenceKey_Data | null;
  /** +0x20 key's first 64-bit word */
  keyField0: bigint;
  /** +0x28 key's second 64-bit word */
  keyField1: bigint;
}

/**
 * The `std::map` object as seen by this method. Only the root pointer is touched.
 * The "end iterator" returned on not-found is modelled as a distinguished END sentinel value
 * (the disasm returns `&this[0x8]`, i.e. the address of the root-holder slot).
 */
export interface Map_EquivalenceKey_Data {
  /** +0x08 __end_node_.__left_ = ROOT pointer (or null when empty) */
  root: TreeNode_EquivalenceKey_Data | null;
}

/**
 * Sentinel representing the "end iterator" that this method returns when the key is not found.
 * The disasm returns the raw address `&this[0x8]`. We model it as a nominal symbol so callers
 * can distinguish it from a real node pointer.
 */
export const MAP_END_SENTINEL: unique symbol = Symbol("map::end");

/** Return type of find(): a real node or the end-sentinel. */
export type MapFindResult =
  | TreeNode_EquivalenceKey_Data
  | typeof MAP_END_SENTINEL;

// -------- the method itself --------

/**
 * std::__1::map<tuple<EquivalenceKey const>, PCCacheImpl::Data, less, allocator>::find[abi:nqe210106]
 *
 * @ProCore 0x0009c308  (libc++ template instantiation compiled into ProCore)
 * mangled: __ZNSt3__13mapINS_5tupleIJKN12_GLOBAL__N_114EquivalenceKeyEEEEN11PCCacheImplIS5_b8PCNoLockNS_4lessIS5_EEE4DataES9_NS_9allocatorINS_4pairIKS5_SB_EEEEE4findB9nqe210106ERSE_
 *
 * Faithful line-for-line port of the 36-instruction body. Returns the node whose key equals the
 * search key, or MAP_END_SENTINEL. Every branch cites its @0xADDR. No callees — this is pure
 * red-black-tree traversal with two-word unsigned key comparison; no in-scope FCP dependencies
 * and no out-of-scope externs.
 */
export function std__map_EquivalenceKey_Data__find(
  self: Map_EquivalenceKey_Data,
  k: Tuple_EquivalenceKey,
): MapFindResult {
  // @0x9c308  rdx = *(this+0x8)   — rdx = root
  let node: TreeNode_EquivalenceKey_Data | null = self.root;
  // @0x9c30c/@0x9c310/@0x9c313  rdi = &(this+0x8) ; if root==0 → EMPTY_RET
  if (node === null) {
    // @0x9c358  rax = rdi ; retq
    return MAP_END_SENTINEL;
  }

  // @0x9c319  r8  = *(k+0x0)  — searchKey0
  // @0x9c31c  rcx = *(k+0x8)  — searchKey1
  const searchKey0: bigint = k.keyField0;
  const searchKey1: bigint = k.keyField1;

  // @0x9c320  rax = rdi        — "best-so-far" starts as END-sentinel
  let candidate: MapFindResult = MAP_END_SENTINEL;

  // Loop (@0x9c323 .LOOP): descend the tree.
  while (node !== null) {
    // @0x9c323  rsi = node.keyField0
    const nodeKey0: bigint = node.keyField0;
    // @0x9c327  cmp r8, rsi     — unsigned dst-src = rsi - r8
    // @0x9c32a  jae .GE_KEY0    — taken iff rsi >= r8  ⇔ nodeKey0 >= searchKey0
    if (nodeKey0 >= searchKey0) {
      // @0x9c332  ja .STRICT_GT — taken iff rsi > r8  ⇔ nodeKey0 > searchKey0
      if (nodeKey0 > searchKey0) {
        // @0x9c33a  rax = rdx (save candidate); fall through to STEP with rdx = &node.left
        candidate = node;
        // @0x9c33d  rdx = *rdx  — descend via __left_
        node = node.left;
      } else {
        // nodeKey0 == searchKey0 — compare keyField1.
        // @0x9c334  cmp rcx, *(rdx+0x28) — unsigned dst-src = nodeKey1 - rcx
        // @0x9c338  jb .GO_RIGHT — taken iff nodeKey1 < rcx  ⇔ nodeKey1 < searchKey1 (need right)
        const nodeKey1: bigint = node.keyField1;
        if (nodeKey1 < searchKey1) {
          // @0x9c32c  rdx = rdx + 0x8 ; @0x9c33d  rdx = *rdx  — descend via __right_
          node = node.right;
        } else {
          // nodeKey1 >= searchKey1 — node >= searchKey lexicographically. Save + go LEFT.
          // @0x9c33a  rax = rdx ; fall through to STEP with rdx unchanged (points at __left_).
          candidate = node;
          // @0x9c33d  rdx = *rdx  — __left_
          node = node.left;
        }
      }
    } else {
      // nodeKey0 < searchKey0  ⇒ go RIGHT (no candidate save).
      // @0x9c32c  rdx = rdx + 0x8 ; @0x9c330 jmp .STEP ; @0x9c33d rdx = *rdx  — descend via __right_
      node = node.right;
    }
    // @0x9c340  if (rdx != 0) goto .LOOP  — loop continues if child non-null
  }

  // After loop. Now decide whether candidate actually equals searchKey.
  // @0x9c345/@0x9c348  cmp rdi,rax ; je .RET_END  — if candidate is still END-sentinel: return end
  if (candidate === MAP_END_SENTINEL) {
    return MAP_END_SENTINEL;
  }

  // Verify candidateKey0 >= searchKey0 and, on equality, candidateKey1 >= searchKey1.
  // @0x9c34a  rdx = candidate.keyField0
  const candidateKey0: bigint = candidate.keyField0;
  // @0x9c34e  cmp rdx, r8 ; @0x9c351 jae .CHECK_KEY0
  //   Taken iff r8 >= rdx  ⇔ searchKey0 >= candidateKey0.
  if (searchKey0 >= candidateKey0) {
    // @0x9c35c  ja .RET_CAND  — searchKey0 > candidateKey0 : (impossible under lower_bound
    //   invariant; the disasm still returns rax which is the candidate node).
    if (searchKey0 > candidateKey0) {
      return candidate;
    }
    // searchKey0 == candidateKey0 — compare key1.
    // @0x9c35e  cmp *(rax+0x28), rcx  — unsigned dst-src = rcx - candidateKey1
    // @0x9c362  jb .RET_END  — searchKey1 < candidateKey1 ⇒ not equal ⇒ end
    if (searchKey1 < candidate.keyField1) {
      return MAP_END_SENTINEL;
    }
    // else searchKey1 >= candidateKey1; combined with lower_bound (candidateKey1 >= searchKey1)
    // means equality — return candidate.
    // @0x9c364 jmp 0x9c356 — return rax
    return candidate;
  } else {
    // searchKey0 < candidateKey0 ⇒ definitely not equal ⇒ end
    // @0x9c351 fall-through path when jae NOT taken; @0x9c353 rax = rdi ; retq
    return MAP_END_SENTINEL;
  }
}

/**
 * Alias export: mangled symbol name.
 * @ProCore 0x0009c308  __ZNSt3__13mapINS_5tupleIJKN12_GLOBAL__N_114EquivalenceKeyEEEEN11PCCacheImplIS5_b8PCNoLockNS_4lessIS5_EEE4DataES9_NS_9allocatorINS_4pairIKS5_SB_EEEEE4findB9nqe210106ERSE_
 */
export const __ZNSt3__13mapINS_5tupleIJKN12_GLOBAL__N_114EquivalenceKeyEEEEN11PCCacheImplIS5_b8PCNoLockNS_4lessIS5_EEE4DataES9_NS_9allocatorINS_4pairIKS5_SB_EEEEE4findB9nqe210106ERSE_ =
  std__map_EquivalenceKey_Data__find;
