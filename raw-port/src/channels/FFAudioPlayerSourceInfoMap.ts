// @template std::__1::__tree<...>::destroy — Flexo instantiation for
// std::map<uint32_t, FFAudioPlayerSourceInfo*>.
//
// The libc++ __tree<T,Compare,Alloc>::destroy(node*) member function is a
// TEMPLATE — one instantiation per (T, Compare, Alloc) tuple that the FCP
// code touches. This file ports the SPECIFIC instantiation used by
// FFAudioPlayer's per-source-info map, whose mangled key is:
//
//   __ZNSt3__16__treeINS_12__value_typeIjP23FFAudioPlayerSourceInfoEE
//     NS_19__map_value_compareIjNS_4pairIKjS3_EENS_4lessIjEELb1EEE
//     NS_9allocatorIS8_EEE7destroyEPNS_11__tree_nodeIS4_PvEE
//
// demangled:
//   std::__1::__tree<
//     std::__1::__value_type<unsigned int, FFAudioPlayerSourceInfo*>,
//     std::__1::__map_value_compare<
//       unsigned int,
//       std::__1::pair<unsigned int const, FFAudioPlayerSourceInfo*>,
//       std::__1::less<unsigned int>, true>,
//     std::__1::allocator<
//       std::__1::pair<unsigned int const, FFAudioPlayerSourceInfo*>>
//   >::destroy(
//     std::__1::__tree_node<
//       std::__1::__value_type<unsigned int, FFAudioPlayerSourceInfo*>,
//       void*>*
//   )
//
// This is a std::map<uint32_t, FFAudioPlayerSourceInfo*> node destroyer:
// map<Key=uint32_t, Value=FFAudioPlayerSourceInfo*, Compare=less<uint32_t>>.
// The value_type is the map's pair<const uint32_t, FFAudioPlayerSourceInfo*>
// held inside a __value_type wrapper (libc++ ABI detail); the node stores it
// at +0x20 of the __tree_node — this destroy does not dereference the value.
//
// DECODE — raw-port/re/disasm/Flexo.__ZNSt3__16__treeINS_12__value_typeIjP23FFAudioPlayerSourceInfoEENS_19__map_value_compareIjNS_4pairIKjS3_EENS_4lessIjEELb1EEENS_9allocatorIS8_EEE7destroyEPNS_11__tree_nodeIS4_PvEE.s
// @Flexo 0x5d170 (byte-exact, transcribed instruction-by-instruction):
//
//   0x5d170  testq %rsi, %rsi                 ; if (node == null)
//   0x5d173  je    0x5d1a5                    ;    return;
//   0x5d175  pushq %rbp
//   0x5d176  movq  %rsp, %rbp
//   0x5d179  pushq %r14                       ; callee-saved: node
//   0x5d17b  pushq %rbx                       ; callee-saved: this (tree)
//   0x5d17c  movq  (%rsi), %rax               ; rax = node->__left_   (offset +0x00)
//   0x5d17f  movq  %rdi, %rbx                 ;
//   0x5d182  movq  %rsi, %r14                 ;
//   0x5d185  movq  %rax, %rsi                 ; arg1 (rsi) = node->__left_
//   0x5d188  callq __ZNSt...destroy...        ; SELF-RECURSE on left subtree
//   0x5d18d  movq  0x8(%r14), %rsi            ; arg1 (rsi) = node->__right_ (offset +0x08)
//   0x5d191  movq  %rbx, %rdi                 ; arg0 (rdi) = this
//   0x5d194  callq __ZNSt...destroy...        ; SELF-RECURSE on right subtree
//   0x5d199  movq  %r14, %rdi                 ; arg0 (rdi) = node
//   0x5d19c  popq  %rbx
//   0x5d19d  popq  %r14
//   0x5d19f  popq  %rbp
//   0x5d1a0  jmp   __ZdlPv                    ; TAIL-CALL operator delete(void*)
//   0x5d1a5  retq                             ; null-path return
//
// The function is a POST-ORDER recursive walk:
//   destroy(left);
//   destroy(right);
//   operator delete(node);
// The `this` (tree) parameter (rdi) is passed through unchanged into every
// recursion — the allocator is a member of the tree, but for libc++ stateless
// std::allocator<T> the recursion simply threads it. This function does NOT
// read the T stored in the node (no load from +0x20); it only recurses on the
// __left_/__right_ base pointers and delete's the node storage. The Compare
// functor is never invoked in destroy — comparison is only used by insert/find.
//
// EXTERNS (the only true out-of-scope callee):
//   __ZdlPv — libc++ operator delete(void*). Tail-called @0x5d1a0. In this
//   TypeScript port the storage is JS-GC-managed, so operator delete has no
//   runtime effect on its own: making the last reference unreachable is what
//   the JS engine already treats as "freed". We faithfully MODEL the ownership
//   transfer by nulling the recursive child references so the GC can reclaim
//   the subtree as C++ would. We do NOT throw here because the C++ instruction
//   at @0x5d1a0 is a plain jmp to a well-known extern, not a decoded work step
//   of THIS function — same policy PCDivideByZeroException uses for its own
//   tail-jmp __ZdlPv (raw-port/src/infra/PCDivideByZeroException.ts:87).
//
// DEPS: none in-scope. The only extern is operator delete (libc++), modeled
// as JS-GC ownership drop. There is no other callee.

/**
 * libc++ __tree_node_base layout, byte-exact per
 * raw-port/src/harness/StdContainers.ts (which decoded the layout from the
 * same libc++ family). Only the two fields read by destroy are relevant:
 *   +0x00  __left_   — TreeNodeBase* or null
 *   +0x08  __right_  — TreeNodeBase* or null
 * The T payload at +0x20 (__value_ in the __tree_node<T,void*> subclass)
 * is NEVER read by destroy — the map value FFAudioPlayerSourceInfo* is
 * OWNED by the caller (raw pointer, not a smart pointer), and
 * ~pair<const K, V>() on a trivially-destructible pair is a no-op that the
 * compiler folded away (visible in the disasm: no member destructor call,
 * no size-passed operator-delete[sized] overload, just __ZdlPv).
 */
export interface FFAudioPlayerSourceInfoMapTreeNode {
  /** +0x00 __left_  — left subtree root, or null at a leaf. */
  __left_: FFAudioPlayerSourceInfoMapTreeNode | null;
  /** +0x08 __right_ — right subtree root, or null at a leaf. */
  __right_: FFAudioPlayerSourceInfoMapTreeNode | null;
  /** +0x10 __parent_ (not read by destroy; documented for layout completeness). */
  __parent_?: FFAudioPlayerSourceInfoMapTreeNode | null;
  /** +0x18 __is_black_ (not read by destroy; RB color bit). */
  __is_black_?: boolean;
  /** +0x20 __value_ — the map pair<const uint32_t, FFAudioPlayerSourceInfo*>
   *  payload. NEVER read by destroy — only referenced by find/insert. Left
   *  loosely-typed because destroy is payload-oblivious. */
  __value_?: unknown;
}

/**
 * The tree owner passed as `this` (rdi). This function reads NOTHING off it
 * (no field loads from rdi in the disasm); it exists solely so the recursion
 * signature matches libc++ method form. Modelled as an opaque brand type.
 */
export interface FFAudioPlayerSourceInfoMap {
  readonly __tree_brand: "std::__1::__tree<uint32_t, FFAudioPlayerSourceInfo*>";
}

/**
 * std::__1::__tree<uint32_t -> FFAudioPlayerSourceInfo*>::destroy(node*)
 * — @Flexo 0x5d170. Faithful transcription of the disassembly at
 * raw-port/re/disasm/Flexo.__ZNSt3__16__treeINS_12__value_typeIjP23FFAudioPlayerSourceInfoEENS_19__map_value_compareIjNS_4pairIKjS3_EENS_4lessIjEELb1EEENS_9allocatorIS8_EEE7destroyEPNS_11__tree_nodeIS4_PvEE.s
 *
 * Recursive post-order teardown of the red-black tree rooted at `node`:
 *   1. If `node` is null (@0x5d170 testq %rsi,%rsi ; je 0x5d1a5), return.
 *   2. Recurse on node.__left_  (@0x5d17c load +0x00, @0x5d188 callq self).
 *   3. Recurse on node.__right_ (@0x5d18d load +0x08, @0x5d194 callq self).
 *   4. Tail-call operator delete(node) (@0x5d1a0 jmp __ZdlPv).
 *
 * In the JS/GC port, step (4) is realised by dropping the child pointers so
 * the subtree becomes unreachable — the JS engine reclaims it. The C++
 * operator delete call has no bytecode work of its own inside THIS function;
 * the extern boundary is documented and modeled, not thrown.
 *
 * @param _this the owning __tree (rdi @0x5d17f). Not dereferenced.
 * @param node  the current subtree root (rsi @0x5d170). null-safe.
 */
export function FFAudioPlayerSourceInfoMap_destroy(
  _this: FFAudioPlayerSourceInfoMap,
  node: FFAudioPlayerSourceInfoMapTreeNode | null
): void {
  // @0x5d170  testq %rsi, %rsi
  // @0x5d173  je    0x5d1a5              ; null -> nothing to free
  if (node === null) {
    // @0x5d1a5  retq
    return;
  }

  // @0x5d17c  movq (%rsi), %rax          ; rax = node.__left_  (+0x00)
  const left = node.__left_;

  // @0x5d17f/82/85  set up args: rdi=this (unchanged), rsi=left
  // @0x5d188  callq <self>               ; recurse into left subtree first
  FFAudioPlayerSourceInfoMap_destroy(_this, left);

  // @0x5d18d  movq 0x8(%r14), %rsi       ; rsi = node.__right_ (+0x08)
  const right = node.__right_;

  // @0x5d191  movq %rbx, %rdi            ; rdi = this  (restored from callee-saved)
  // @0x5d194  callq <self>               ; recurse into right subtree
  FFAudioPlayerSourceInfoMap_destroy(_this, right);

  // @0x5d199..0x5d19f  epilogue (pop callee-saved, restore rbp).
  // @0x5d1a0  jmp __ZdlPv                ; TAIL-CALL operator delete(node)
  //
  // libc++ operator delete(void*) is an out-of-scope extern (libc++abi).
  // In this port storage is JS-GC-managed: making the node unreachable is
  // the JS analogue of operator delete. Drop the child links so the whole
  // freed subtree is now unreferenced through this path (the caller has
  // already released its own reference before entering destroy — libc++
  // callers of this member always overwrite the tree __begin_node_/root
  // pointer AFTER destroy returns; the last strong reference to node dies
  // with the stack frame that owned it).
  node.__left_ = null;
  node.__right_ = null;
}
