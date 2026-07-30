// tree_destroy_typeinfo_NodePixelsStats.ts — free (compiler-emitted STL template instantiation)
//   std::__1::__tree<
//     std::__1::__value_type<std::type_info const*, __HGStats_private::NodePixelsStats>,
//     std::__1::__map_value_compare<std::type_info const*,
//       std::__1::pair<std::type_info const* const, __HGStats_private::NodePixelsStats>,
//       std::__1::less<std::type_info const*>, true>,
//     std::__1::allocator<std::__1::pair<std::type_info const* const,
//       __HGStats_private::NodePixelsStats>>>::destroy(
//     std::__1::__tree_node<std::__1::__value_type<std::type_info const*,
//       __HGStats_private::NodePixelsStats>, void*>* __nd)
//
// Faithful transcription from Helium symbol
//   __ZNSt3__16__treeINS_12__value_typeIPKSt9type_infoN17__HGStats_private15NodePixelsStatsEEENS_19__map_value_compareIS4_NS_4pairIKS4_S6_EENS_4lessIS4_EELb1EEENS_9allocatorISB_EEE7destroyEPNS_11__tree_nodeIS7_PvEE
//   @Helium 0x1bae0
// (see raw-port/re/disasm/Helium.<mangled>.s — filename hashed because full sanitized
//  mangled length exceeds 200 chars; the file body begins with the full mangled symbol.)
//
// Full disassembly (22 lines, 15 body instructions — textbook libc++ red-black-tree
// post-order recursive destructor, identical shape to the already-ported
// tree_destroy_PCUUID_OZFactory.ts sibling on main):
//
//   0x1bae0  testq %rsi, %rsi                         ; if (__nd == nullptr)
//   0x1bae3  je    0x1bb15                            ;   goto epilogue (return)
//   0x1bae5  pushq %rbp
//   0x1bae6  movq  %rsp, %rbp
//   0x1bae9  pushq %r14
//   0x1baeb  pushq %rbx
//   0x1baec  movq  (%rsi), %rax                       ; %rax = __nd->__left_       (offset +0x00)
//   0x1baef  movq  %rdi, %rbx                         ; %rbx = this   (saved tree ptr)
//   0x1baf2  movq  %rsi, %r14                         ; %r14 = __nd   (saved node ptr)
//   0x1baf5  movq  %rax, %rsi                         ; %rsi = __nd->__left_
//   0x1baf8  callq <self>                             ; RECURSE: destroy(__nd->__left_)
//   0x1bafd  movq  0x8(%r14), %rsi                    ; %rsi = __nd->__right_      (offset +0x08)
//   0x1bb01  movq  %rbx, %rdi                         ; %rdi = this
//   0x1bb04  callq <self>                             ; RECURSE: destroy(__nd->__right_)
//   0x1bb09  movq  %r14, %rdi                         ; %rdi = __nd
//   0x1bb0c  popq  %rbx
//   0x1bb0d  popq  %r14
//   0x1bb0f  popq  %rbp
//   0x1bb10  jmp   __ZdlPv @0x3c4fa0                  ; tail-call operator delete(__nd) — free node
//   0x1bb15  retq                                     ; null-input fast path
//   0x1bb16  nopw  %cs:(%rax,%rax)                    ; alignment
//
// Note: register roles are swapped relative to the PCUUID/OZFactory sibling — here
// %rbx holds `this` and %r14 holds `__nd`; there it was the reverse. Same code shape,
// just a different color of the same schedule. The observable semantics are identical:
// post-order left → right → operator delete(node).
//
// Semantics: standard libc++ __tree<...>::destroy — post-order red-black-tree
// destruction. Recurses into the left child, then the right child, then frees the
// current node with operator delete(). No user-value destructor is invoked here:
// the key_type `std::type_info const*` (raw pointer) is trivially-destructible, and
// so is the mapped_type `__HGStats_private::NodePixelsStats` in the observed ABI —
// clang omits the value dtor call entirely and the pair bytes are freed via __ZdlPv
// as part of the node allocation. (NodePixelsStats is a Helium-private aggregate of
// integer/float counters; no owning members, no explicit dtor.)
//
// __tree_node LAYOUT (recovered from the two field loads here):
//   +0x00  __tree_node* __left_    (readable via `movq (%rsi), %rax` @0x1baec)
//   +0x08  __tree_node* __right_   (readable via `movq 0x8(%r14), %rsi` @0x1bafd)
//   +0x10+ __parent_/__is_black_ + __value_ (untouched by this function; not decoded here)
// This matches the libc++ __tree_node_base layout used across every std::map/std::set
// instantiation in the FCP binary — see the many peer __tree instantiations named
// __ZNSt3__16__treeI...7destroyE... in the ledgers.
//
// FRONTIER CALLEES:
//   @0x1baf8, 0x1bb04  RECURSIVE self-call to this same symbol — the callee IS this
//                      function; TS models it as direct recursion.
//   @0x1bb10  __ZdlPv @Helium 0x3c4fa0 = operator delete(void*) — libc++ ABI extern
//             (out-of-scope). Modelled as a throwing stub, matching the convention
//             already used by raw-port/src/infra/tree_destroy_PCUUID_OZFactory.ts on
//             main.

/**
 * A libc++ __tree_node holding a __value_type<std::type_info const*,
 * __HGStats_private::NodePixelsStats>. We model the two child fields the disasm
 * actually reads; the payload and parent/color bits are not touched by this
 * function and are left opaque.
 */
export interface TreeNode_typeinfo_NodePixelsStats {
  /** +0x00  __left_   — `movq (%rsi), %rax` @0x1baec */
  __left_: TreeNode_typeinfo_NodePixelsStats | null;
  /** +0x08  __right_  — `movq 0x8(%r14), %rsi` @0x1bafd */
  __right_: TreeNode_typeinfo_NodePixelsStats | null;
  // (rest of the node — parent/color/value — is not read by destroy())
}

/**
 * @Helium 0x1bb10  __ZdlPv (operator delete(void*)) — libc++ ABI extern @Helium 0x3c4fa0.
 * Out-of-scope, modelled as a throwing stub. In the binary this frees the node's
 * heap allocation via the global allocator; JS has no manual heap free, and the
 * observer cannot legitimately see the freed storage anyway, so a loud stub is
 * the faithful choice per Rule 3 (throw on undecoded/extern, never approximate).
 */
function operator_delete_stub(_p: unknown): void {
  throw new Error(
    "__ZdlPv @Helium 0x1bb10 (operator delete(void*) — libc++ extern @Helium 0x3c4fa0) is not yet ported (out-of-scope).",
  );
}

/**
 * std::__1::__tree<
 *   std::__1::__value_type<std::type_info const*, __HGStats_private::NodePixelsStats>,
 *   std::__1::__map_value_compare<std::type_info const*,
 *     std::__1::pair<std::type_info const* const, __HGStats_private::NodePixelsStats>,
 *     std::__1::less<std::type_info const*>, true>,
 *   std::__1::allocator<std::__1::pair<std::type_info const* const,
 *     __HGStats_private::NodePixelsStats>>>::destroy(
 *   std::__1::__tree_node<std::__1::__value_type<std::type_info const*,
 *     __HGStats_private::NodePixelsStats>, void*>* __nd)
 *
 * @Helium 0x1bae0 (`__ZNSt3__16__treeINS_12__value_typeIPKSt9type_infoN17__HGStats_private15NodePixelsStatsEEENS_19__map_value_compareIS4_NS_4pairIKS4_S6_EENS_4lessIS4_EELb1EEENS_9allocatorISB_EEE7destroyEPNS_11__tree_nodeIS7_PvEE`)
 *
 * Post-order recursive libc++ __tree destructor. Recurses into left+right children,
 * then frees the current node. Compiler inlined no value dtors (trivial types).
 * See file docstring for full line-by-line transcription.
 *
 * We take a `_this` receiver to mirror the `%rdi` argument (the tree instance) that
 * the binary saves in %rbx and passes to each recursive call. In this pure-destroy
 * body the receiver is only re-passed, never dereferenced — so we model it as an
 * opaque token and don't inspect it here.
 */
export function tree_destroy_typeinfo_NodePixelsStats(
  _this: unknown,
  nd: TreeNode_typeinfo_NodePixelsStats | null,
): void {
  // @0x1bae0/0x1bae3  testq %rsi,%rsi ; je 0x1bb15 — null-input fast path.
  if (nd === null) return;
  // Prologue at 0x1bae5..0x1baf5 saves rbp/r14/rbx and stashes %rdi->%rbx (this),
  // %rsi->%r14 (node), and pre-loads %rax = __nd->__left_ then moves rax->rsi.
  // No observable effect in TS.

  // @0x1baec  movq (%rsi), %rax        — load nd->__left_
  // @0x1baf5  movq %rax, %rsi          — move into arg register
  // @0x1baf8  callq <self>             — RECURSE on left subtree, this-pointer preserved.
  tree_destroy_typeinfo_NodePixelsStats(_this, nd.__left_);

  // @0x1bafd  movq 0x8(%r14), %rsi     — load nd->__right_ (r14 = saved nd)
  // @0x1bb01  movq %rbx, %rdi          — restore this-pointer
  // @0x1bb04  callq <self>             — RECURSE on right subtree.
  tree_destroy_typeinfo_NodePixelsStats(_this, nd.__right_);

  // @0x1bb09..0x1bb0f  epilogue: rdi = nd (r14); pop rbx/r14/rbp.
  // @0x1bb10  jmp __ZdlPv              — tail-call operator delete(nd).
  //           (No user value-dtor call is emitted: type_info const* + NodePixelsStats
  //            are trivially-destructible in the observed ABI.)
  operator_delete_stub(nd);
}
