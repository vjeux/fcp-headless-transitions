// raw-port: std::__1::unordered_map<CGColorSpace*, PCNCLCCode,
//                                    (anonymous namespace)::Hash,
//                                    (anonymous namespace)::Equal,
//                                    std::__1::allocator<std::__1::pair<CGColorSpace* const, PCNCLCCode>>>::find[abi:nqe210106](CGColorSpace* const&)
//
//   @ProCore 0x000992e4  __ZNSt3__113unordered_mapIP12CGColorSpace10PCNCLCCodeN12_GLOBAL__N_14HashENS4_5EqualENS_9allocatorINS_4pairIKS2_S3_EEEEE4findB9nqe210106ERS9_
//
// re/disasm:
//   raw-port/re/disasm/ProCore.__ZNSt3__113unordered_mapIP12CGColorSpace10PCNCLCCodeN12_GLOBAL__N_14HashENS4_5EqualENS_9allocatorINS_4pairIKS2_S3_EEEEE4findB9nqe210106ERS9_.s
//
// This is a libc++ template instantiation, NOT an FCP class. Emitted inline into ProCore for the
// PCNCLCCache hot path that maps CGColorSpace* → PCNCLCCode using an anonymous-namespace Hash
// that is `_CFHash(cs)` and an anonymous-namespace Equal that is `_CFEqual(a, b)`. Every callee
// is a true out-of-scope extern (CoreFoundation: CFHash/CFEqual) and depgraph.py reports 0
// external deps to a ported symbol.
//
// OBJECT LAYOUT (unordered_map's __hash_table, recovered from the disasm):
//   Only the fields this method touches are modelled here.
//   +0x00  bucket_array : pointer to an array of "first node" pointers, one per bucket.
//                        Read at @0x99346 (`movq (%r15), %rax`). The i-th slot at
//                        @0x99349 is `bucket_array[i]` and is a `__hash_node*` (pointer to
//                        the FIRST node in bucket i, or NULL if the bucket is empty).
//   +0x08  bucket_count : unsigned long — the number of buckets. Loaded to %r13 at @0x992f6.
//                        Zero ⇒ no allocation ever done; find returns nullptr.
//   +0x18  size        : the map's element count. Zero ⇒ no elements; find returns nullptr.
//                        Checked at @0x99306 (`cmpq $0x0, 0x18(%rdi)`).
//
// HASH NODE LAYOUT (libc++ __hash_node_base + __hash_node), from the walk loads:
//   +0x00  next : __hash_node* — pointer to the next node in the singly-linked chain.
//                 Read at @0x99352 (`movq (%rax), %r15`) to descend the FIRST bucket entry,
//                 and again at @0x99395 (`movq (%r15), %r15`) to advance through the chain.
//   +0x08  hash : size_t — the cached hash of the key. Read at @0x9935a.
//   +0x10  key  : CGColorSpace* — the key stored in this node. Read at @0x99363.
//   (value at +0x18, not touched by find.)
//
// HASH → BUCKET CHOICE:
//   libc++ picks between an AND-mask (power-of-two bucket counts) and a modulo:
//     mask = bucket_count - 1
//     if ((mask & bucket_count) == 0)          // bucket_count is a power of two
//         chn = hash & mask
//     else if (hash < bucket_count)            // small hash fast-path
//         chn = hash
//     else
//         chn = hash % bucket_count
//   This matches the three-way branch at @0x99324..@0x99346 verbatim; it is also re-used at
//   @0x99379..@0x99390 to compute the "still-in-my-bucket" test for chain elements.
//
// CONTROL FLOW (line-for-line):
//   @0x992f6  r13 = this->bucket_count                                (movq 0x8(%rdi), %r13)
//   @0x992fa  if (r13 == 0) goto NIL                                  (testq %r13,%r13; je .NIL)
//   @0x99306  if (this->size == 0) goto NIL                           (cmpq $0,0x18(%rdi); je .NIL)
//   @0x99311  rdi = *(&k)  (i.e., the CGColorSpace* value)            (movq (rsi),%rdi)
//   @0x99318  r14 = _CFHash(rdi)
//   @0x99320  rbx = r13 - 1                          ; mask
//   @0x99324  if ((rbx & r13) == 0) goto AND                          (power-of-two path)
//   @0x99329  else if (r14 >= r13) goto DIV                           (large-hash path)
//             else r12 = r14 ; goto LOAD                              (small-hash fast path)
//   .AND      r12 = r14 & rbx ; goto LOAD
//   .DIV      r12 = r14 % r13 ; goto LOAD
//   .LOAD @0x99346  rax = this->bucket_array
//         @0x99349  rax = bucket_array[r12]     (i.e., the "first-node slot" pointer)
//                    (this is a __hash_node** pointer to the head of the chain)
//         @0x9934d  if (rax == 0) goto NIL
//         @0x99352  r15 = *rax        (r15 = first __hash_node* in this bucket)
//   .WALK  @0x99355  if (r15 == 0) goto NIL
//         @0x9935a  rax = r15->hash                                    (movq 0x8(%r15),%rax)
//         @0x9935e  if (rax != r14) goto REBUCKET
//         @0x99363  rdi = r15->key                                     (movq 0x10(%r15),%rdi)
//         @0x9936e  al  = _CFEqual(rdi, *(&k))
//         @0x99373  if (al != 0) goto RET_R15                          ; found
//                   else goto ADVANCE
//   .REBUCKET  ; hash mismatch — re-hash rax to a bucket; if not our bucket, chain ended.
//         @0x99379  if ((rbx & r13) == 0) goto REB_AND
//         @0x9937e  else if (rax >= r13) goto REB_DIV
//                   else rax = rax        ; small-hash keeps rax
//                   goto REB_CMP
//         .REB_AND  rax = rax & rbx
//         .REB_DIV  rax = rax % r13
//         @0x99390  if (rax != r12) goto NIL      ; different bucket ⇒ end of our chain
//   .ADVANCE @0x99395  r15 = r15->next ; goto WALK                     (movq (%r15),%r15)
//   .NIL     @0x9939a  r15 = 0
//   .RET_R15 @0x9939d  return r15
//
// The return convention is a POINTER (the __hash_node*) or nullptr. libc++'s
// unordered_map::find wraps that pointer into an iterator by the return-value optimization
// convention; the on-disk body simply returns the raw __hash_node* in %rax and lets the
// caller adapt to an iterator (which is a struct containing exactly that pointer). We
// model the return type as `HashNodeCGColorSpace_PCNCLCCode | null`.

// -------- frontier / external boundary --------

/**
 * Loud boundary for CoreFoundation `CFHash(CFTypeRef)`.
 * @extern @ProCore stub 0xddfd6 ## symbol stub for: _CFHash
 * True out-of-scope extern (CoreFoundation). Called from @0x99318 with a CGColorSpace* argument;
 * returns a `size_t` (CFHashCode).
 */
export function _CFHash(_cf: unknown): number {
  throw new Error(
    "_CFHash @extern-stub 0xddfd6 — out-of-scope CoreFoundation boundary",
  );
}

/**
 * Loud boundary for CoreFoundation `CFEqual(CFTypeRef, CFTypeRef)`.
 * @extern @ProCore stub 0xddfca ## symbol stub for: _CFEqual
 * True out-of-scope extern (CoreFoundation). Called from @0x9936e; returns a Boolean (0/1).
 */
export function _CFEqual(_a: unknown, _b: unknown): boolean {
  throw new Error(
    "_CFEqual @extern-stub 0xddfca — out-of-scope CoreFoundation boundary",
  );
}

// -------- modelled types --------

/**
 * Opaque handle for a CGColorSpace — the KEY type of this map. The FCP binary stores this as
 * an untyped `CGColorSpace*`; here we model it as an opaque nominal so callers can only pass
 * it through _CFHash/_CFEqual.
 */
export type CGColorSpacePtr = { readonly __cgColorSpacePtr: unique symbol };

/**
 * The VALUE type of this map — opaque here because `find` returns a __hash_node* and does
 * not read the value.
 */
export type PCNCLCCode = unknown;

/**
 * libc++ __hash_node — the entry stored in each bucket chain. Layout above.
 * @0x99352/@0x9935a/@0x99363/@0x99395 all read from these offsets.
 */
export interface HashNodeCGColorSpace_PCNCLCCode {
  /** +0x00 next pointer in singly-linked chain (or null at chain tail) */
  next: HashNodeCGColorSpace_PCNCLCCode | null;
  /** +0x08 cached hash of the key (CFHash of the CGColorSpace*) */
  hash: number;
  /** +0x10 key (CGColorSpace*) */
  key: CGColorSpacePtr;
  /** +0x18 value (PCNCLCCode) — not touched by find */
  value: PCNCLCCode;
}

/**
 * libc++ __hash_table state for `unordered_map<CGColorSpace*, PCNCLCCode, Hash, Equal>`.
 * Only the fields find() touches are modelled.
 *
 * The bucket_array is an array of __hash_node* "head-of-chain" slots. Its element type in
 * libc++ is actually `__hash_node_base*` (a pointer to a stub whose only in-memory field is
 * `next`, so its address is the same as `&head->next`), but for find() the double-indirection
 * boils down to "load bucket_array[chn], then read *that* to get the first __hash_node*". We
 * model that with a two-level array: the outer level is the bucket_array of "slot pointers",
 * and the inner level is a one-element cell holding the first __hash_node* (matching the
 * physical `__hash_node_base` at rest).
 */
export interface UnorderedMap_CGColorSpace_PCNCLCCode {
  /**
   * +0x00 bucket_array — array of slot pointers. Slot i is either null (no first node) or
   * points to a cell whose [0] entry is the first __hash_node* in bucket i (or null).
   * The two indirections are literally `movq (%r15),%rax; movq (%rax,%r12,8),%rax`
   * followed by `movq (%rax),%r15` in the disasm.
   */
  bucket_array: ReadonlyArray<
    ReadonlyArray<HashNodeCGColorSpace_PCNCLCCode | null> | null
  > | null;
  /** +0x08 bucket_count (unsigned long) */
  bucket_count: number;
  /** +0x18 size (unsigned long) — element count */
  size: number;
}

// -------- the method itself --------

/**
 * std::__1::unordered_map<CGColorSpace*, PCNCLCCode, Hash, Equal>::find[abi:nqe210106]
 *
 * @ProCore 0x000992e4  (libc++ template instantiation compiled into ProCore)
 * mangled: __ZNSt3__113unordered_mapIP12CGColorSpace10PCNCLCCodeN12_GLOBAL__N_14HashENS4_5EqualENS_9allocatorINS_4pairIKS2_S3_EEEEE4findB9nqe210106ERS9_
 *
 * Faithful line-for-line port of the 66-instruction body. Returns the found __hash_node* or
 * null. Every step cites its @0xADDR; every callee (_CFHash, _CFEqual) is a documented
 * out-of-scope CoreFoundation extern (see "frontier / external boundary" above).
 */
export function std__unordered_map_CGColorSpace_PCNCLCCode__find(
  self: UnorderedMap_CGColorSpace_PCNCLCCode,
  k: { readonly value: CGColorSpacePtr },
): HashNodeCGColorSpace_PCNCLCCode | null {
  // @0x992f6  movq 0x8(%rdi),%r13    — r13 = bucket_count
  const bucket_count = self.bucket_count;
  // @0x992fa..@0x992fd  testq %r13,%r13 ; je .NIL
  if (bucket_count === 0) {
    return null;
  }
  // @0x99306..@0x9930b  cmpq $0,0x18(%rdi) ; je .NIL
  if (self.size === 0) {
    return null;
  }
  // @0x99311..@0x99318  rdi = *(&k) ; callq _CFHash(rdi) ; r14 = rax
  const hash = _CFHash(k.value);

  // @0x99320  leaq -0x1(%r13),%rbx    — mask = bucket_count - 1
  const mask = bucket_count - 1;

  // Compute the bucket index (chn). Three-way branch replicated verbatim.
  let chn: number;
  // @0x99324  testq %rbx,%r13   ; je .AND
  //   AT&T "test src,dst" sets ZF=(src & dst == 0); here that's (mask & bucket_count)==0,
  //   i.e. bucket_count is a power of two.
  if ((mask & bucket_count) === 0) {
    // @0x99333/@0x99336  r12 = r14 ; r12 &= rbx     — chn = hash & mask
    chn = hash & mask;
  } else if (hash >= bucket_count) {
    // @0x99329..@0x9932c  cmpq %r13,%r14 ; jae .DIV   (dst-src = r14-r13 ≥ 0 ⇔ hash ≥ bucket_count)
    // @0x9933b..@0x99343  divq %r13 ; r12 = rdx     — chn = hash % bucket_count
    chn = hash % bucket_count;
  } else {
    // @0x9932e..@0x99331  r12 = r14                — chn = hash (already < bucket_count)
    chn = hash;
  }

  // @0x99346  movq (%r15),%rax        — rax = bucket_array
  // @0x99349  movq (%rax,%r12,8),%rax — rax = bucket_array[chn]  (a __hash_node** slot)
  // @0x9934d..@0x99350  testq %rax,%rax ; je .NIL
  const bucket_array = self.bucket_array;
  if (bucket_array === null) {
    // bucket_array is null even though bucket_count>0 shouldn't happen in a well-formed map,
    // but replicate the (%r15) load semantics: NULL deref would crash; we treat as empty.
    return null;
  }
  const slot = bucket_array[chn];
  if (slot === null || slot === undefined) {
    return null;
  }
  // @0x99352  movq (%rax),%r15        — r15 = *slot = first __hash_node*
  let node: HashNodeCGColorSpace_PCNCLCCode | null = slot[0] ?? null;

  // Chain walk.
  // @0x99355 .WALK  testq %r15,%r15 ; je .NIL
  while (node !== null) {
    // @0x9935a  rax = r15->hash
    const nodeHash = node.hash;
    // @0x9935e..@0x99361  cmpq %r14,%rax ; jne .REBUCKET
    //   AT&T dst-src = rax - r14 ; ZF=1 ⇔ rax == r14 ⇔ nodeHash == hash
    if (nodeHash === hash) {
      // @0x99363..@0x9936e  rdi = r15->key ; rsi = *(&k) ; al = _CFEqual(rdi,rsi)
      // @0x99373..@0x99377  testb %al,%al ; jne .RET_R15 ; else fall through to ADVANCE
      if (_CFEqual(node.key, k.value)) {
        // @0x9939d  movq %r15,%rax — return the node
        return node;
      }
      // fall through to ADVANCE (@0x99395)
    } else {
      // @0x99379 .REBUCKET  — re-bucket nodeHash to compare against chn.
      // @0x99379  testq %rbx,%r13 ; je .REB_AND      (power-of-two path)
      let nodeChn: number;
      if ((mask & bucket_count) === 0) {
        // @0x9938d  andq %rbx,%rax    — nodeChn = nodeHash & mask
        nodeChn = nodeHash & mask;
      } else if (nodeHash >= bucket_count) {
        // @0x9937e..@0x99381  cmpq %r13,%rax ; jb .keep_rax
        //   dst-src = rax - r13; CF=1 ⇔ rax < r13 ⇔ nodeHash < bucket_count.
        //   jb=CF=1 means "keep rax"; we're in the "NOT jb" branch here, so rax ≥ bucket_count.
        // @0x99383..@0x99388  divq %r13 ; rax = rdx    — nodeChn = nodeHash % bucket_count
        nodeChn = nodeHash % bucket_count;
      } else {
        // small-hash fast path (@0x9938b jmp .REB_CMP with rax unchanged)
        nodeChn = nodeHash;
      }
      // @0x99390..@0x99393  cmpq %r12,%rax ; jne .NIL
      //   dst-src = rax - r12; ZF=1 ⇔ rax == r12 ⇔ nodeChn == chn
      if (nodeChn !== chn) {
        // different bucket — chain ended
        return null;
      }
      // else fall through to ADVANCE (@0x99395)
    }

    // @0x99395..@0x99398  movq (%r15),%r15 ; jmp .WALK  — node = node.next
    node = node.next;
  }
  // @0x9939a  xorl %r15d,%r15d — return null
  return null;
}

/**
 * Alias export: mangled symbol name.
 * @ProCore 0x000992e4  __ZNSt3__113unordered_mapIP12CGColorSpace10PCNCLCCodeN12_GLOBAL__N_14HashENS4_5EqualENS_9allocatorINS_4pairIKS2_S3_EEEEE4findB9nqe210106ERS9_
 */
export const __ZNSt3__113unordered_mapIP12CGColorSpace10PCNCLCCodeN12_GLOBAL__N_14HashENS4_5EqualENS_9allocatorINS_4pairIKS2_S3_EEEEE4findB9nqe210106ERS9_ =
  std__unordered_map_CGColorSpace_PCNCLCCode__find;
