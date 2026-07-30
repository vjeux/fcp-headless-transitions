// tree_destroy_PCUUID_OZFactory.ts — free (compiler-emitted STL template instantiation)
//   std::__1::__tree<
//     std::__1::__value_type<PCUUID, OZFactory*>,
//     std::__1::__map_value_compare<PCUUID, std::__1::pair<PCUUID const, OZFactory*>,
//                                   std::__1::less<PCUUID>, true>,
//     std::__1::allocator<std::__1::pair<PCUUID const, OZFactory*>>>::destroy(
//     std::__1::__tree_node<
//       std::__1::__value_type<PCUUID, OZFactory*>, void*>* __nd)
//
// Faithful transcription from ProChannel symbol
//   __ZNSt3__16__treeINS_12__value_typeI6PCUUIDP9OZFactoryEENS_19__map_value_compareIS2_NS_4pairIKS2_S4_EENS_4lessIS2_EELb1EEENS_9allocatorIS9_EEE7destroyEPNS_11__tree_nodeIS5_PvEE
//   @ProChannel 0x1316e
// (see raw-port/re/disasm/ProChannel.<mangled>.s — filename is the full mangled sym).
//
// Full disassembly (21 lines, 15 body instructions — a textbook libc++ red-black-tree
// post-order recursive destructor):
//
//   0x1316e  testq %rsi, %rsi                         ; if (__nd == nullptr)
//   0x13171  je    0x131a0                            ;   goto epilogue (return)
//   0x13173  pushq %rbp
//   0x13174  movq  %rsp, %rbp
//   0x13177  pushq %r14
//   0x13179  pushq %rbx
//   0x1317a  movq  %rsi, %rbx                         ; %rbx = __nd   (saved node ptr)
//   0x1317d  movq  %rdi, %r14                         ; %r14 = this   (saved tree ptr)
//   0x13180  movq  (%rsi), %rsi                       ; %rsi = __nd->__left_       (offset +0x00)
//   0x13183  callq __tree::destroy                    ; RECURSE: destroy(__nd->__left_)
//   0x13188  movq  0x8(%rbx), %rsi                    ; %rsi = __nd->__right_      (offset +0x08)
//   0x1318c  movq  %r14, %rdi                         ; %rdi = this
//   0x1318f  callq __tree::destroy                    ; RECURSE: destroy(__nd->__right_)
//   0x13194  movq  %rbx, %rdi                         ; %rdi = __nd
//   0x13197  popq  %rbx
//   0x13198  popq  %r14
//   0x1319a  popq  %rbp
//   0x1319b  jmp   __ZdlPv                            ; tail-call operator delete(__nd) — free node
//   0x131a0  retq                                     ; null-input fast path
//   0x131a1  nop                                      ; alignment
//
// Semantics: standard libc++ __tree<...>::destroy — post-order red-black-tree destruction.
// It recurses into the left child, then the right child, then frees the current node with
// operator delete(). No user-value destructor is invoked here: both key_type PCUUID (a
// 16-byte POD) and mapped_type OZFactory* (a raw pointer) are trivially-destructible in
// the observed ABI, so libc++ omits the value dtor call entirely. The value pair sits
// in-node but its bytes are simply freed with the node allocation via __ZdlPv.
//
// __tree_node LAYOUT (recovered from the two field loads here):
//   +0x00  __tree_node* __left_    (readable via `movq (%rsi), %rsi`)
//   +0x08  __tree_node* __right_   (readable via `movq 0x8(%rbx), %rsi`)
//   +0x10+ __parent_/__is_black_ + __value_ (untouched by this function; not decoded here)
// This matches the libc++ __tree_node_base layout used across every std::map/std::set
// instantiation in the FCP binary — see the many peer __tree instantiations named
// __ZNSt3__16__treeI...7destroyE... in the ledgers.
//
// FRONTIER CALLEES:
//   @0x13183, 0x1318f  RECURSIVE self-call to this same symbol — the callee IS this
//                      function; TS models it as direct recursion.
//   @0x1319b  __ZdlPv = operator delete(void*)  — libc++ ABI extern (out-of-scope).
//             Modelled as a throwing stub, matching the convention already used by
//             raw-port/src/infra/std_default_delete_vector_uint8.ts on main.

/**
 * A libc++ __tree_node holding a __value_type<PCUUID, OZFactory*>. We model the two
 * child fields the disasm actually reads; the payload and parent/color bits are not
 * touched by this function and are left opaque.
 */
export interface TreeNode_PCUUID_OZFactory {
  /** +0x00  __left_   — `movq (%rsi), %rsi` @0x13180 */
  __left_: TreeNode_PCUUID_OZFactory | null;
  /** +0x08  __right_  — `movq 0x8(%rbx), %rsi` @0x13188 */
  __right_: TreeNode_PCUUID_OZFactory | null;
  // (rest of the node — parent/color/value — is not read by destroy())
}

/**
 * @ProChannel 0x1319b  __ZdlPv (operator delete(void*)) — libc++ ABI extern.
 * Out-of-scope, modelled as a throwing stub. In the binary this frees the node's
 * heap allocation via the global allocator; JS has no manual heap free, and the
 * observer cannot legitimately see the freed storage anyway, so a loud stub is
 * the faithful choice per Rule 3 (throw on undecoded/extern, never approximate).
 */
function operator_delete_stub(_p: unknown): void {
  throw new Error(
    "__ZdlPv @ProChannel 0x1319b (operator delete(void*)) is not yet ported (libc++ extern).",
  );
}

/**
 * std::__1::__tree<
 *   std::__1::__value_type<PCUUID, OZFactory*>,
 *   std::__1::__map_value_compare<PCUUID, std::__1::pair<PCUUID const, OZFactory*>,
 *                                 std::__1::less<PCUUID>, true>,
 *   std::__1::allocator<std::__1::pair<PCUUID const, OZFactory*>>>::destroy(
 *   std::__1::__tree_node<std::__1::__value_type<PCUUID, OZFactory*>, void*>* __nd)
 *
 * @ProChannel 0x1316e (`__ZNSt3__16__treeINS_12__value_typeI6PCUUIDP9OZFactoryEENS_19__map_value_compareIS2_NS_4pairIKS2_S4_EENS_4lessIS2_EELb1EEENS_9allocatorIS9_EEE7destroyEPNS_11__tree_nodeIS5_PvEE`)
 *
 * Post-order recursive libc++ __tree destructor. Recurses into left+right children,
 * then frees the current node. Compiler INLINED no value dtors (trivial types).
 * See file docstring for full line-by-line transcription.
 *
 * We take a `_this` receiver to mirror the `%rdi` argument (the tree instance) that
 * the binary saves in %r14 and passes to each recursive call. In this pure-destroy
 * body the receiver is only re-passed, never dereferenced — so we model it as an
 * opaque token and don't inspect it here.
 */
export function tree_destroy_PCUUID_OZFactory(
  _this: unknown,
  nd: TreeNode_PCUUID_OZFactory | null,
): void {
  // @0x1316e/0x13171  testq %rsi,%rsi ; je 0x131a0 — null-input fast path.
  if (nd === null) return;
  // Prologue at 0x13173..0x1317d saves rbp/r14/rbx and stashes %rsi->%rbx (node),
  // %rdi->%r14 (this) across the recursive calls. No observable effect in TS.

  // @0x13180  movq (%rsi), %rsi        — load nd->__left_
  // @0x13183  callq <self>             — RECURSE on left subtree, this-pointer preserved.
  tree_destroy_PCUUID_OZFactory(_this, nd.__left_);

  // @0x13188  movq 0x8(%rbx), %rsi     — load nd->__right_ (rbx = saved nd)
  // @0x1318c  movq %r14, %rdi          — restore this-pointer
  // @0x1318f  callq <self>             — RECURSE on right subtree.
  tree_destroy_PCUUID_OZFactory(_this, nd.__right_);

  // @0x13194..0x1319a  epilogue: rdi = nd (rbx); pop rbx/r14/rbp.
  // @0x1319b  jmp __ZdlPv              — tail-call operator delete(nd).
  //           (No user value-dtor call is emitted: PCUUID + OZFactory* are trivial.)
  operator_delete_stub(nd);
}
