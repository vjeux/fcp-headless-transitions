// map_find_PCCFRef_CGColorSpace_CacheData.ts — libc++ std::map<...>::find[abi:nqe210106]
// template instantiation used by the ProCore PCCacheImpl<PCCFRef<CGColorSpace*>, ...>::find_or_open
// path. The comparator is the file-local (anonymous-namespace) CompareColorSpaceRef in ProCore,
// which orders CGColorSpace* by (CFHash(cs), then raw pointer identity to break hash ties).
//
// FULL DEMANGLED NAME (from `depclaim.py next`):
//   std::__1::map<
//       PCCFRef<CGColorSpace*>,
//       PCCacheImpl<PCCFRef<CGColorSpace*>, PCCFRef<CGColorSpace*>, PCNoLock,
//                   (anonymous namespace)::CompareColorSpaceRef>::Data,
//       (anonymous namespace)::CompareColorSpaceRef,
//       std::__1::allocator<std::__1::pair<PCCFRef<CGColorSpace*> const, ...::Data>>>
//     ::find[abi:nqe210106](PCCFRef<CGColorSpace*> const&)
//
// MANGLED SYMBOL:
//   __ZNSt3__13mapI7PCCFRefIP12CGColorSpaceEN11PCCacheImplIS4_S4_8PCNoLockN12_GLOBAL__N_1
//   20CompareColorSpaceRefEE4DataES8_NS_9allocatorINS_4pairIKS4_SA_EEEEE4findB9nqe210106ERSD_
//
// ADDRESS: ProCore  @0x00000000000abdc2
//
// FRAMEWORK: ProCore  (see raw-port/re/disasm/ProCore.__ZNSt3__13mapI7PCCFRef...find*.s)
//
// PURPOSE.  Standard std::map::find — a red-black-tree descent that returns:
//   - the tree node with key equal to the search key, or
//   - the __end_node (encoded as the address of the root slot at `tree + 8`) if no such key.
// The disasm variant here is the ABI-tagged `find[abi:nqe210106]`, one of libc++'s
// nqe/no-eh flavors. Body is 62 asm lines; every instruction is faithfully ported below.
//
// ─── TREE + NODE LAYOUT (recovered from address offsets used in the disasm) ────────────────
//
//   std::__1::map (%rdi = this): a wrapper around __tree. The observed layout is:
//     +0x00 : (unused by THIS method — libc++ places __begin_node_ here.)
//     +0x08 : ROOT SLOT — the __end_node's __left_ field. The load `movq 0x8(%rdi), %r13`
//             @0xabdd3 reads the current root pointer. `addq $0x8, %rbx` @0xabdd7 forms
//             the ADDRESS of that root slot; that address doubles as the "end-iterator"
//             sentinel in libc++'s ABI-encoded iterator, because it uniquely identifies
//             the tree's __end_node.
//
//   __tree_node<pair<PCCFRef<CGColorSpace*> const, Data>> (RB-tree node):
//     +0x00 : __left_          (pointer to left child, or nullptr)
//     +0x08 : __right_         (pointer to right child, or nullptr)
//     +0x10 : __parent_        (pointer to parent — not read by THIS unit)
//     +0x18 : __is_black_      (1-byte RB colour — not read here)
//     +0x20 : value.first      (PCCFRef<CGColorSpace*> — a single 8-byte CGColorSpace* raw
//                               pointer; PCCFRef is a thin CF-retain-owning wrapper whose
//                               ABI layout is exactly the wrapped pointer at offset 0.)
//     +0x28 : value.second     (PCCacheImpl<...>::Data — not read here.)
//   Provenance for the +0x20 key offset: `movq 0x20(%r13), %rdi` @0xabde6 loads the node's
//   CGColorSpace* into %rdi as the argument to _CFHash; `cmpq %rdi, 0x20(%r13)` @0xabdff
//   uses the same slot for the raw-pointer tiebreak against the search key. `movq (%r15),
//   %rdi` @0xabdf2 loads the search key (PCCFRef*) whose byte-0 IS the CGColorSpace*.
//
// ─── COMPARATOR (inlined by the compiler) ─────────────────────────────────────────────────
//
//   CompareColorSpaceRef(a, b)  ==
//       (h(a) < h(b))
//     || (h(a) == h(b) && a.ptr < b.ptr)      // hash-tie broken by raw pointer identity
//
//   The disasm inlines this as a chain of the form
//       cl = (nodePtr < queryPtr) ;  dl = (nodeHash < queryHash) ;
//       if (hashes differ) cl = dl ;
//       compareLess = cl
//   which is exactly `less(node, query)`. `setb` after `cmpq %rdi, 0x20(%r13)` reads
//   AT&T-style as CF from `nodeSlot - queryReg`, i.e. CF=1 iff `nodeSlot < queryReg`.
//   Same for the hash cmp `cmpq %rax, %r12` (where %r12 = h(node), %rax = h(query)):
//   CF=1 iff h(node) < h(query). See PORTING_SPEC.md Rule-4 cheat-sheet.
//
// ─── LINE-BY-LINE DISASM (0xabdc2 … 0xabe6a) ──────────────────────────────────────────────
//
//   0xabdc2  pushq %rbp                     ; std frame prologue
//   0xabdc3  movq  %rsp, %rbp
//   0xabdc6  pushq %r15
//   0xabdc8  pushq %r14
//   0xabdca  pushq %r13
//   0xabdcc  pushq %r12
//   0xabdce  pushq %rbx
//   0xabdcf  pushq %rax                     ; 16-byte align (dead push, no stack use)
//   0xabdd0  movq  %rdi, %rbx               ; rbx = this (tree)
//   0xabdd3  movq  0x8(%rdi), %r13          ; r13 = root_ptr = __end_node.__left_
//   0xabdd7  addq  $0x8, %rbx               ; rbx = &tree.__end_node.__left_ (root slot addr)
//                                           ;       — used as "end iterator" sentinel below
//   0xabddb  testq %r13, %r13
//   0xabdde  je    0xabe56                  ; empty tree -> r14=rbx (end), return rbx
//   0xabde0  movq  %rsi, %r15               ; r15 = &searchKey (PCCFRef<CGColorSpace*>*)
//   0xabde3  movq  %rbx, %r14               ; r14 = &end.  r14 tracks "last-left-turn" node
//                                           ;              (== upper bound candidate)
// [DESCENT LOOP]
//   0xabde6  movq  0x20(%r13), %rdi         ; rdi = node->key.ptr (CGColorSpace*)
//   0xabdea  callq _CFHash                  ; @stub 0xddfd6 — CoreFoundation extern
//   0xabdef  movq  %rax, %r12               ; r12 = h(node)
//   0xabdf2  movq  (%r15), %rdi             ; rdi = *(&key) = queryPtr (CGColorSpace*)
//   0xabdf5  callq _CFHash                  ; rax = h(query)
//   0xabdfa  movq  (%r15), %rdi             ; rdi = queryPtr again (CFHash may clobber)
//   0xabdfd  xorl  %ecx, %ecx
//   0xabdff  cmpq  %rdi, 0x20(%r13)         ; AT&T: nodePtr - queryPtr
//   0xabe03  setb  %cl                      ; cl = (nodePtr < queryPtr)
//   0xabe06  xorl  %edx, %edx
//   0xabe08  cmpq  %rax, %r12               ; AT&T: nodeHash - queryHash
//   0xabe0b  setb  %dl                      ; dl = (nodeHash < queryHash)
//   0xabe0e  cmovnel %edx, %ecx             ; if hashes DIFFER, cl = dl ; else keep cl (ptr-tie)
//   0xabe11  movzbl %cl, %eax               ; eax = compareLess (0 or 1)
//   0xabe14  testb %al, %al
//   0xabe16  cmoveq %r13, %r14              ; if compareLess==0 (i.e. we're going LEFT or
//                                           ;                    hit equal), r14 = r13
//                                           ;                    (last-left-turn candidate)
//   0xabe1a  movq  (%r13,%rax,8), %r13      ; r13 = node->__left_  when al=0 (0*8=0)
//                                           ; r13 = node->__right_ when al=1 (1*8=8)
//   0xabe1f  testq %r13, %r13
//   0xabe22  jne   0xabde6                  ; loop until leaf falls off
// [POST-DESCENT CANDIDATE CHECK]
//   0xabe24  cmpq  %rbx, %r14
//   0xabe27  je    0xabe56                  ; never went left -> end iterator
//                                           ; (candidate is still the sentinel)
//   0xabe29  callq _CFHash                  ; rdi still = queryPtr from 0xabdfa
//                                           ;              -> rax = h(query)     (RE-hash)
//   0xabe2e  movq  %rax, %r12               ; r12 = h(query)  [note: r12 role FLIPPED here]
//   0xabe31  movq  0x20(%r14), %rdi         ; rdi = candidate->key.ptr
//   0xabe35  callq _CFHash                  ; rax = h(candidate)
//   0xabe3a  movq  (%r15), %rcx             ; rcx = queryPtr
//   0xabe3d  xorl  %edx, %edx
//   0xabe3f  cmpq  0x20(%r14), %rcx         ; AT&T: queryPtr - candidatePtr
//   0xabe43  setb  %dl                      ; dl = (queryPtr < candidatePtr)
//   0xabe46  xorl  %ecx, %ecx
//   0xabe48  cmpq  %rax, %r12               ; AT&T: h(query) - h(candidate)
//   0xabe4b  setb  %cl                      ; cl = (h(query) < h(candidate))
//   0xabe4e  cmovnel %ecx, %edx             ; if hashes DIFFER, dl = cl ; else keep ptr-tie
//   0xabe51  cmpb  $0x1, %dl
//   0xabe54  jne   0xabe59                  ; dl != 1 (i.e. !(query < candidate)) -> return
//                                           ;    candidate  (candidate is the found node)
//   0xabe56  movq  %rbx, %r14               ; (query < candidate) -> NOT FOUND, return end
//   0xabe59  movq  %r14, %rax               ; rax = result
//   0xabe5c  addq  $0x8, %rsp               ; unwind alignment push
//   0xabe60  popq  %rbx
//   0xabe61  popq  %r12
//   0xabe63  popq  %r13
//   0xabe65  popq  %r14
//   0xabe67  popq  %r15
//   0xabe69  popq  %rbp
//   0xabe6a  retq
//
// The post-descent check is the standard libc++ trick: descent tracks the last node from
// which we went LEFT (call it C). If nothing was less-than-or-equal to the search key on
// the way down, we never went left, r14 stays at the end sentinel, and we return end.
// Otherwise C is the smallest key >= searchKey (i.e. upper_bound-like). C is the exact
// match iff `!(searchKey < C.key)` — which is exactly what the second compare tests, in
// the direction (query < candidate) and returning end when true.
//
// ─── DEPS ─────────────────────────────────────────────────────────────────────────────────
//
//   _CFHash  @ProCore stub 0xddfd6  (CoreFoundation extern) — modelled as a boundary throw
//            in raw-port/src/infra/createExtendedColorSpace.ts; imported here. When wired
//            to a host embedder that provides real CFHash, this find function returns the
//            correct node bit-for-bit against FCP's ordering.
//
//   NO in-scope callees. The comparator is FULLY inlined by the compiler (no call to a
//   free CompareColorSpaceRef::operator() function), and the tree descent is pure pointer
//   arithmetic. `depgraph.py deps <mangled>` prints nothing.
//
// The unit ports one function; the tree + node interfaces below are the minimal shape it
// touches, mirroring the peer tree_findEqual_PCUUID_OZFactory.ts on origin/main. Peers
// (map insert/erase, PCCacheImpl lookup) will land more of this class as they get claimed.

import type { CGColorSpaceRef } from "./PCColor.js";
import { CFHash } from "./createExtendedColorSpace.js";

/**
 * PCCFRef<CGColorSpace*> — ABI layout is a single 8-byte pointer to the wrapped
 * CGColorSpace at offset +0x00 (a CF-retain-owning wrapper). Only the raw pointer is
 * touched by this function (via `movq 0x20(%r13), %rdi` reading the node's key and
 * `cmpq %rdi, 0x20(%r13)` doing the raw-ptr tiebreak). We model it as `{ ptr }` and
 * the caller is free to wrap or unwrap freely — identity is preserved.
 */
export interface PCCFRef_CGColorSpace {
  /** +0x00  the raw wrapped CGColorSpace* (or null). */
  ptr: CGColorSpaceRef | null;
}

/**
 * A libc++ __tree_node holding value_type = pair<PCCFRef<CGColorSpace*> const, Data>.
 * We model the child pointers and the key slot the disasm actually reads. Data (the
 * PCCacheImpl<...>::Data payload at +0x28) is opaque here — this method never touches
 * it. Peers (insertion, erase, iterator++, etc.) can extend the interface as they land.
 */
export interface TreeNode_PCCFRef_CGColorSpace_CacheData {
  /** +0x00  __left_   — `movq (%r13,%rax,8), %r13` with rax=0 @0xabe1a */
  __left_: TreeNode_PCCFRef_CGColorSpace_CacheData | null;
  /** +0x08  __right_  — `movq (%r13,%rax,8), %r13` with rax=1 @0xabe1a */
  __right_: TreeNode_PCCFRef_CGColorSpace_CacheData | null;
  /** +0x10  __parent_ — not read by find(); modelled optional. */
  __parent_?: TreeNode_PCCFRef_CGColorSpace_CacheData | null;
  /** +0x18  __is_black_ — not read by find(); modelled optional. */
  __is_black_?: boolean;
  /**
   * +0x20  value.first = PCCFRef<CGColorSpace*>. The disasm reads only the raw pointer
   * at offset +0x00 of the PCCFRef, so this slot's identity == the wrapped CGColorSpace*
   * for comparator purposes. Modelled here as the wrapper.
   */
  key: PCCFRef_CGColorSpace;
  /** +0x28  value.second — opaque `Data`; not accessed by this method. */
  value?: unknown;
}

/**
 * The std::map container. The disasm only touches __end_node.__left_ (i.e. the root
 * pointer) at offset +0x08 of the tree, so that is the only field we model. The tree
 * ADDRESS itself + 0x08 doubles as the "end iterator" — see the FindResult typing below.
 *
 * Mirroring the tree_findEqual peer: expose the root as a getter/setter pair so callers
 * can reason about "&__end_node.__left_" as a stable identity for end-iterator equality.
 */
export interface Map_PCCFRef_CGColorSpace_CacheData {
  /** +0x08  __end_node.__left_ — the tree's root pointer. */
  __end_node_left_at0x08: TreeNode_PCCFRef_CGColorSpace_CacheData | null;
}

/**
 * The return of find() — either a real node (when the key was found) or the "end
 * iterator" sentinel (when not). The libc++ ABI encodes end() as the address of the
 * __end_node itself; we surface an explicit `isEnd` flag to spare callers from having
 * to compare against `&tree.__end_node.__left_` when they can just check a bool. If a
 * caller ever needs true pointer identity, they can compare `tree` against the
 * `endTree` field of the sentinel branch.
 */
export type FindResult_PCCFRef_CGColorSpace_CacheData =
  | { readonly isEnd: false; readonly node: TreeNode_PCCFRef_CGColorSpace_CacheData }
  | { readonly isEnd: true;  readonly endTree: Map_PCCFRef_CGColorSpace_CacheData };

/**
 * std::__1::map<
 *   PCCFRef<CGColorSpace*>,
 *   PCCacheImpl<PCCFRef<CGColorSpace*>, PCCFRef<CGColorSpace*>, PCNoLock,
 *               (anonymous namespace)::CompareColorSpaceRef>::Data,
 *   (anonymous namespace)::CompareColorSpaceRef,
 *   std::__1::allocator<...>>
 *   ::find[abi:nqe210106](PCCFRef<CGColorSpace*> const& searchKey)
 *   -> iterator
 *
 * @ProCore 0x00000000000abdc2
 * (`__ZNSt3__13mapI7PCCFRefIP12CGColorSpaceEN11PCCacheImplIS4_S4_8PCNoLockN12_GLOBAL__N_1
 *   20CompareColorSpaceRefEE4DataES8_NS_9allocatorINS_4pairIKS4_SA_EEEEE4findB9nqe210106ERSD_`)
 *
 * Faithful transcription of the RB-tree descent + upper-bound candidate check emitted by
 * libc++ for `std::map::find` with an inlined `CompareColorSpaceRef` comparator that orders
 * CGColorSpace* by (CFHash, then raw pointer). See file docstring for the full line-by-line
 * disasm.
 *
 * The comparator's `less(a, b)` is inlined as:
 *   h_a = CFHash(a.ptr) ; h_b = CFHash(b.ptr)
 *   less = (h_a != h_b) ? (h_a < h_b) : (a.ptr_bits < b.ptr_bits)
 *
 * Descent tracks the last-left-turn node (r14). At the leaf, if r14 is still the end
 * sentinel we return end. Otherwise we test `!(searchKey < r14.key)` — if true, r14 is
 * the exact match; if false, we return end.
 */
export function map_find_PCCFRef_CGColorSpace_CacheData(
  tree: Map_PCCFRef_CGColorSpace_CacheData,
  searchKey: PCCFRef_CGColorSpace,
): FindResult_PCCFRef_CGColorSpace_CacheData {
  // @0xabdd3  movq 0x8(%rdi), %r13   — load root pointer.
  // @0xabdd7  addq $0x8, %rbx        — form address of the root slot; used as "end" sentinel.
  //           (In TS: `tree` itself IS the sentinel identity.)
  let node: TreeNode_PCCFRef_CGColorSpace_CacheData | null = tree.__end_node_left_at0x08;

  // @0xabddb..de  testq %r13,%r13 ; je 0xabe56 — empty tree fast path -> return end.
  if (node === null) {
    return { isEnd: true, endTree: tree };
  }

  // @0xabde0..e3  r15 = &searchKey (kept alive across CFHash calls),
  //               r14 = end sentinel (initial "last-left-turn" candidate is end).
  let candidate: TreeNode_PCCFRef_CGColorSpace_CacheData | null = null;

  // ── DESCENT LOOP @0xabde6..0xabe22 ──────────────────────────────────────────────────────
  // Compares each node's key against searchKey using the inlined CompareColorSpaceRef, and
  // walks LEFT when node >= key (recording the node as the current candidate) or RIGHT when
  // node < key. Loop exits when we fall off a leaf.
  //
  // The C++ semantics guarantee termination in tree height; we bound the loop at 128 (a
  // black-height budget more than sufficient for any realistically-sized RB tree in FCP,
  // matching the peer tree_findEqual's safety cap) as pure JS-runtime defense — the raw
  // disasm has no explicit cap because C++'s type invariants make one unnecessary.
  const queryPtrBits = ptrIdentity(searchKey.ptr);
  const h_query_descent = CFHash(searchKey.ptr);  // @stub — see createExtendedColorSpace.ts

  for (let i = 0; i < 128 && node !== null; i++) {
    // @0xabde6..ef  h(node) = CFHash(node.key.ptr)  ; kept in r12
    const h_node = CFHash(node.key.ptr);
    // @0xabdf2..f5  reload query ptr and re-hash it (compiler emits the call each iter)
    //               — semantically identical to using the cached h_query_descent value.
    void h_query_descent;
    const h_q = CFHash(searchKey.ptr);
    // @0xabdff..0e  ptr-tiebreak & hash-compare merged via cmovne:
    //   cl = (nodePtr <u queryPtr) ; dl = (nodeHash <u queryHash) ;
    //   if (hashes differ) cl = dl ; less = cl.
    const nodePtrBits = ptrIdentity(node.key.ptr);
    const cl_ptr = nodePtrBits < queryPtrBits ? 1 : 0;
    const dl_hash = h_node < h_q ? 1 : 0;
    const less = h_node !== h_q ? dl_hash : cl_ptr;  // @0xabe0e cmovne dispatch

    // @0xabe14..1a  if (less==0) { candidate = node ; node = node->__left_ }
    //               else        {                   node = node->__right_ }
    if (less === 0) {
      candidate = node;
      node = node.__left_;
    } else {
      node = node.__right_;
    }
  }

  // ── POST-DESCENT CANDIDATE CHECK @0xabe24..0xabe54 ──────────────────────────────────────
  // If we never went left, candidate is the end sentinel -> return end.
  if (candidate === null) {
    return { isEnd: true, endTree: tree };
  }

  // Otherwise verify `!(searchKey < candidate.key)`. The disasm re-runs the full comparator
  // (CFHash + ptr tiebreak) here — same inlined comparator, direction flipped.
  const h_q2 = CFHash(searchKey.ptr);          // @0xabe29 CFHash(queryPtr)   -> r12
  const h_cand = CFHash(candidate.key.ptr);    // @0xabe35 CFHash(candidatePtr) -> rax
  const candPtrBits = ptrIdentity(candidate.key.ptr);
  const queryPtrBits2 = ptrIdentity(searchKey.ptr);
  // @0xabe3f..4e  dl = (queryPtr <u candidatePtr) ; cl = (h(query) <u h(candidate)) ;
  //               if (hashes differ) dl = cl ; queryLess = dl.
  const dl_ptr = queryPtrBits2 < candPtrBits ? 1 : 0;
  const cl_hash = h_q2 < h_cand ? 1 : 0;
  const queryLess = h_q2 !== h_cand ? cl_hash : dl_ptr;

  // @0xabe51..54  cmpb $1,%dl ; jne 0xabe59 — if (queryLess != 1) return candidate;
  //                                           else fall through to end.
  if (queryLess !== 1) {
    return { isEnd: false, node: candidate };
  }
  return { isEnd: true, endTree: tree };
}

/**
 * Pointer-identity → unsigned-bits helper for the comparator's raw-pointer tiebreak.
 *
 * The disasm compares two 64-bit raw pointer bit-patterns via `cmpq ... ; setb`. In JS we
 * cannot observe the actual pointer bits — but for the comparator's PURPOSE (a stable
 * total order over CGColorSpace* identities), any deterministic per-object mapping to a
 * strictly-comparable value gives the correct find/erase/lower_bound behaviour, provided
 * the SAME mapping is used everywhere and equal pointers map to equal bits. We use a
 * WeakMap-backed identity index that assigns each observed CGColorSpace* a monotonically
 * increasing bigint. Two references to the same object get the same value; null maps to
 * 0n (smaller than any assigned id, matching CoreFoundation's convention that NULL is
 * "less" than any live CFTypeRef pointer in practice — and never a valid key anyway).
 *
 * The map's operations (find, insert, erase) all funnel through THIS helper, so as long
 * as it is used consistently across the peers the total order is a bit-faithful stand-in
 * for the raw-pointer order the binary observes.
 */
const __ptrIdentityIndex = new WeakMap<object, bigint>();
let __ptrIdentityCounter = 1n;
function ptrIdentity(p: CGColorSpaceRef | null): bigint {
  if (p === null || p === undefined) return 0n;
  const key = p as unknown as object;
  const existing = __ptrIdentityIndex.get(key);
  if (existing !== undefined) return existing;
  const id = __ptrIdentityCounter++;
  __ptrIdentityIndex.set(key, id);
  return id;
}
