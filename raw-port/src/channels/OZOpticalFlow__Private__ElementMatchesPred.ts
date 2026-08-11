// OZOpticalFlow__Private__ElementMatchesPred.ts — raw transcription of Ozone
// `OZOpticalFlow::Private::ElementMatchesPred::operator()(JobImpl const&) const`.
//
// The predicate the optical-flow analyzer uses to find the job that owns a
// given OZImageElement: it answers "is this job still live AND does its element
// set contain my element?". ONE symbol is transcribed here — the call operator.
// The two ctors (@0x4ec970 C2 / @0x4ec980 C1) and the sibling
// `FootageMatchesPred` family are SEPARATE ledger units and are NOT ported
// here; do not add them without their own disassembly and address citations.
//
// The file is named `Outer__Inner` after the nested class, matching the landed
// convention (OZOpticalFlow__Private__JobIDPred.ts,
// OZOpticalFlow__Private__CacheFileHeader.ts).
//
// Provenance (Ozone framework, x86_64):
//   /Applications/Final Cut Pro.app/Contents/Frameworks/Ozone.framework/Versions/A/Ozone
//
// Symbol ported in this file:
//   @0x4ec990  OZOpticalFlow::Private::ElementMatchesPred::operator()(JobImpl const&) const
//                __ZNK13OZOpticalFlow7Private18ElementMatchesPredclERKNS0_7JobImplE
//
// Source disassembly (re-derived from the binary with
// `raw-port/tools/disasm.sh --sym __ZNK13OZOpticalFlow7Private18ElementMatchesPredclERKNS0_7JobImplE Ozone`):
//   raw-port/re/disasm/__ZNK13OZOpticalFlow7Private18ElementMatchesPredclERKNS0_7JobImplE.s (31 lines)
//
// ---------------------------------------------------------------------------
// WHAT THE FUNCTION IS
// ---------------------------------------------------------------------------
// Two steps:
//   1. a cancelled-job early-out — `cmpl $0x2,0xc0(%rsi) ; jne` @0x4ec990:
//      state == 2 returns FALSE immediately, before the frame is even set up;
//   2. an INLINED `std::set<OZImageElement*>::find` over the tree embedded in
//      the job at +0x10: the classic libc++ lower_bound descent (`setb` +
//      `cmovae` + an indexed child load) followed by the "and the key is not
//      LESS than the found node's key" equality check, then
//      `result != end() ? true : false`.
//
// ---------------------------------------------------------------------------
// LAYOUT
// ---------------------------------------------------------------------------
//   struct ElementMatchesPred {
//     OZImageElement* element;   // +0x00 — read `movq (%rdi),%rdx` @0x4ec9ad;
//                                //   stored by the ctor's single
//                                //   `movq %rsi,(%rdi)` @0x4ec974 (C2, cited as
//                                //   evidence — its own ledger unit).
//   };
//
//   struct JobImpl {                       // only what THIS body touches
//     ...
//     std::set<OZImageElement*> elements;  // +0x10 .. +0x27
//       // +0x10  __begin_node_   (not read here)
//       // +0x18  __end_node_     — its address is the end() iterator
//       //                          (`addq $0x18,%rsi` @0x4ec9a4) and its
//       //                          +0x00 field is the tree ROOT
//       //                          (`movq 0x18(%rsi),%rcx` @0x4ec9a0)
//       // +0x20  __size_         (not read here)
//     ...
//     int32_t state;                       // +0xc0 — `cmpl $0x2,0xc0(%rsi)` @0x4ec990
//   };
//
//   struct __tree_node {                   // libc++ node, keys at +0x20
//     __tree_node* __left_;    // +0x00  indexed child load, index 0 @0x4ec9ce
//     __tree_node* __right_;   // +0x08  indexed child load, index 1 @0x4ec9ce
//     // +0x10 __parent_, +0x18 __is_black_ — never read by this body
//     OZImageElement* key;     // +0x20  `cmpq %rdx,0x20(%rcx)` @0x4ec9c2
//   };
//
// THE HEADER IS A NODE. libc++'s `__tree_end_node` is the PREFIX of
// `__tree_node_base`: its one field is `__left_`, which doubles as the tree's
// root pointer. This body relies on exactly that punning — it loads the root
// from `0x18(%rsi)` and then compares the walk cursor against the ADDRESS
// `%rsi + 0x18` — so the port models both with ONE node type (see
// {@link OZElementSetNode}) rather than two disjoint types that would need a
// cast at every comparison.
//
// THE STATE VALUE 2. Pinned to "cancelled" by
// `AnalyzerImpl::markJobAsCanceled(__wrap_iter<JobImpl*>)` @0x4de690, which
// contains `movl $0x2,0xc0(%r14)` @0x4de6af — same offset, same width, same
// constant. (Evidence; its own ledger unit. The free function
// `OZOpticalFlow::Private::CanceledJobPred` @0x4ecad0 tests the identical
// `cmpl $0x2,0xc0`.)
//
// CALLEES: none. Everything — including the set lookup — is inlined pointer and
// integer arithmetic. No in-scope call, no extern, no indirect or virtual
// dispatch (`depgraph.py deps` lists nothing).

/**
 * An `OZImageElement*` as this body uses it: a POINTER VALUE.
 *
 * The set is ordered by `std::less<OZImageElement*>`, i.e. by the raw pointer,
 * and the comparisons here are UNSIGNED (`setb` @0x4ec9c6, `cmovae` @0x4ec9ca,
 * `jae` @0x4ec9e0). TypeScript object references have no ordering, so the port
 * carries the pointer as its unsigned 64-bit value. Any order-preserving
 * assignment of addresses to elements reproduces this algorithm exactly — the
 * lookup only ever asks "is a < b" and "is a == b" — which is the same
 * "invariant under a bijection of identity" argument the landed PCSharedMutex
 * port makes for `pthread_self`.
 *
 * @Ozone 0x4ec9c2 (the 64-bit key compare)
 */
export type OZImageElementPtr = bigint;

/**
 * A libc++ `__tree` node of `std::set<OZImageElement*>`, and — through the
 * `__tree_end_node` prefix punning described in the file header — also the
 * tree's END node, whose `left` field is the ROOT pointer.
 *
 * @Ozone 0x4ec990
 */
export interface OZElementSetNode {
  /**
   * +0x00 `__left_`. On the END node this same slot is the tree ROOT
   * (`movq 0x18(%rsi),%rcx` @0x4ec9a0 reads it).
   */
  left: OZElementSetNode | null;
  /**
   * +0x08 `__right_`. Never read on the END node — the walk only reaches it
   * through a real node (`movq (%rcx,%rdi,8),%rcx` @0x4ec9ce with index 1).
   */
  right: OZElementSetNode | null;
  /**
   * +0x20 the `OZImageElement*` key. Never read on the END node: every read
   * (@0x4ec9c2, @0x4ec9dc) happens only after the cursor has been proven
   * distinct from it.
   */
  key: OZImageElementPtr | null;
}

/**
 * The `ElementMatchesPred` instance state — one captured element pointer.
 *
 * @Ozone 0x4ec9ad (`movq (%rdi),%rdx`); stored by the ctor @0x4ec974.
 */
export interface OZOpticalFlowPrivateElementMatchesPredState {
  /** +0x00 — the OZImageElement* this predicate is looking for. */
  element: OZImageElementPtr;
}

/**
 * The `JobImpl` fields this body reads.
 *
 * `stateAtC0` is the same +0xc0 word the `CanceledJobPred` @0x4ecad0 port
 * models; the two views are structurally compatible on purpose.
 *
 * @Ozone 0x4ec990
 */
export interface OZOpticalFlowPrivateJobImplElementView {
  /** +0xc0 — i32 job state; 2 means CANCELLED (see the file header). */
  stateAtC0: number;
  /**
   * +0x18 — the element set's END node (`addq $0x18,%rsi` @0x4ec9a4 takes its
   * ADDRESS). Its `left` is the tree root.
   */
  elementSetEndNode: OZElementSetNode;
}

/**
 * `OZOpticalFlow::Private::ElementMatchesPred::operator()(JobImpl const&) const`
 *   — @Ozone 0x4ec990
 *   — __ZNK13OZOpticalFlow7Private18ElementMatchesPredclERKNS0_7JobImplE
 *
 * Full transcription — every instruction, in order:
 *
 *   0x4ec990  cmpl  $0x2,0xc0(%rsi)      ; job.state == 2 (cancelled) ?
 *   0x4ec997  jne   0x4ec99c             ;   no -> do the lookup
 *   0x4ec999  xorl  %eax,%eax            ;   yes -> return false
 *   0x4ec99b  retq                       ;   (returns BEFORE any frame setup)
 *   0x4ec99c  pushq %rbp                 ; frame setup (no TS counterpart)
 *   0x4ec99d  movq  %rsp,%rbp            ; frame setup (no TS counterpart)
 *   0x4ec9a0  movq  0x18(%rsi),%rcx      ; rcx = root = endNode.__left_
 *   0x4ec9a4  addq  $0x18,%rsi           ; rsi = &endNode  == end()
 *   0x4ec9a8  testq %rcx,%rcx
 *   0x4ec9ab  je    0x4ec9e2             ;   empty tree -> result = end()
 *   0x4ec9ad  movq  (%rdi),%rdx          ; rdx = this->element (the key)
 *   0x4ec9b0  movq  %rsi,%rax            ; rax = result = end()
 *   0x4ec9b3  nopw  %cs:(%rax,%rax)      ; alignment padding, not executed
 *   -- descent loop @0x4ec9c0 --
 *   0x4ec9c0  xorl  %edi,%edi            ; childIndex = 0
 *   0x4ec9c2  cmpq  %rdx,0x20(%rcx)      ; flags on (node.key - key), UNSIGNED
 *   0x4ec9c6  setb  %dil                 ; childIndex = (node.key < key)
 *   0x4ec9ca  cmovaeq %rcx,%rax          ; if (node.key >= key) result = node
 *   0x4ec9ce  movq  (%rcx,%rdi,8),%rcx   ; node = childIndex ? node.right : node.left
 *   0x4ec9d2  testq %rcx,%rcx
 *   0x4ec9d5  jne   0x4ec9c0             ; loop while the child exists
 *   -- after the descent --
 *   0x4ec9d7  cmpq  %rsi,%rax
 *   0x4ec9da  je    0x4ec9e2             ; result == end() -> stays end()
 *   0x4ec9dc  cmpq  0x20(%rax),%rdx      ; flags on (key - result.key), UNSIGNED
 *   0x4ec9e0  jae   0x4ec9e5             ;   key >= result.key -> keep result
 *   0x4ec9e2  movq  %rsi,%rax            ; otherwise result = end()
 *   0x4ec9e5  cmpq  %rsi,%rax
 *   0x4ec9e8  setne %al                  ; return (result != end())
 *   0x4ec9eb  popq  %rbp                 ; frame teardown (no TS counterpart)
 *   0x4ec9ec  retq
 *   0x4ec9ed  nopl  (%rax)               ; alignment padding, not executed
 *
 * Decode notes (PORTING_SPEC Rule 4 — AT&T computes `dst - src`):
 *   * `cmpq %rdx,0x20(%rcx)` sets flags on `node.key - key`, so `setb` (CF=1)
 *     is `node.key < key` and `cmovae` (CF=0) is `node.key >= key`: descend
 *     RIGHT when the node sorts before the key, otherwise remember the node and
 *     descend LEFT. That is `std::lower_bound` — `result` ends up at the first
 *     node whose key is NOT less than the search key.
 *   * `movq (%rcx,%rdi,8),%rcx` is the branchless child pick: index 0 is
 *     `__left_` (+0x00), index 1 is `__right_` (+0x08).
 *   * the tail `cmpq 0x20(%rax),%rdx ; jae` computes `key - result.key` and
 *     keeps the result when `key >= result.key`. Combined with the lower_bound
 *     invariant `result.key >= key`, that is EQUALITY — i.e. `find`, not
 *     `lower_bound`, is what the predicate answers.
 *   * every compare is UNSIGNED because the keys are pointers
 *     (`std::less<OZImageElement*>`); see {@link OZImageElementPtr}.
 *   * the cancelled early-out returns before `pushq %rbp` — a cancelled job is
 *     never even looked up.
 *
 * @param self the predicate holding the element being searched for (`%rdi`).
 * @param job  the job record (`%rsi`, by const reference).
 * @returns true iff the job is not cancelled and its element set contains
 *          `self.element`.
 */
export function OZOpticalFlow_Private_ElementMatchesPred_call(
  self: OZOpticalFlowPrivateElementMatchesPredState,
  job: OZOpticalFlowPrivateJobImplElementView,
): boolean {
  // @0x4ec990-0x4ec99b  cmpl $0x2,0xc0(%rsi) ; jne ; xorl %eax,%eax ; retq
  if ((job.stateAtC0 | 0) === 2) {
    return false;
  }

  // @0x4ec9a4  addq $0x18,%rsi — end() is the ADDRESS of the embedded end node.
  const end = job.elementSetEndNode;
  // @0x4ec9a0  movq 0x18(%rsi),%rcx — the root lives in the end node's `left`.
  let node: OZElementSetNode | null = end.left;

  // @0x4ec9b0  movq %rsi,%rax — the lower_bound result starts at end().
  let result: OZElementSetNode = end;

  // @0x4ec9a8-0x4ec9ab  testq %rcx,%rcx ; je 0x4ec9e2 — an empty tree skips the
  //   descent entirely and leaves `result` at end().
  if (node !== null) {
    // @0x4ec9ad  movq (%rdi),%rdx — the key, loaded once outside the loop.
    const key = self.element;

    // -- descent loop @0x4ec9c0 --
    let cur: OZElementSetNode = node;
    for (;;) {
      // @0x4ec9c0-0x4ec9ca  xorl %edi,%edi ; cmpq %rdx,0x20(%rcx) ; setb %dil ;
      //   cmovaeq %rcx,%rax — UNSIGNED pointer compare; both cmov and setb read
      //   the same flags.
      const nodeKey: OZImageElementPtr | null = cur.key;
      const goRight: boolean = nodeKey !== null && nodeKey < key; // setb
      if (!goRight) {
        // cmovae: node.key >= key -> this node is a lower_bound candidate.
        result = cur;
      }
      // @0x4ec9ce  movq (%rcx,%rdi,8),%rcx — index 0 = left, index 1 = right.
      const next: OZElementSetNode | null = goRight ? cur.right : cur.left;
      // @0x4ec9d2-0x4ec9d5  testq %rcx,%rcx ; jne 0x4ec9c0
      if (next === null) {
        break;
      }
      cur = next;
    }
  }

  // @0x4ec9d7-0x4ec9e0  cmpq %rsi,%rax ; je ; cmpq 0x20(%rax),%rdx ; jae
  //   — keep the result only when it is not end() AND key >= result.key, which
  //   (given result.key >= key from the descent) means key == result.key.
  if (result !== end) {
    const resultKey = result.key;
    if (!(resultKey !== null && self.element >= resultKey)) {
      // @0x4ec9e2  movq %rsi,%rax — not an exact match: fall back to end().
      result = end;
    }
  }

  // @0x4ec9e5-0x4ec9e8  cmpq %rsi,%rax ; setne %al
  return result !== end;
}
