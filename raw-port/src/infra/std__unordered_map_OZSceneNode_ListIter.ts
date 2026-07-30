// raw-port: std::__1::__hash_table<
//     std::__1::__hash_value_type<OZSceneNode*, std::__1::__list_iterator<OZSceneNode*, void*>>,
//     std::__1::__unordered_map_hasher<OZSceneNode*, ..., std::__1::hash<OZSceneNode*>, ..., true>,
//     std::__1::__unordered_map_equal<..., std::__1::equal_to<OZSceneNode*>, ..., true>,
//     std::__1::allocator<...>
//   >::find<OZSceneNode*>(OZSceneNode* const&) const
//
//   @Ozone 0x00043440
//   mangled: __ZNKSt3__112__hash_tableINS_17__hash_value_typeIP11OZSceneNodeNS_15__list_iteratorIS3_PvEEEENS_22__unordered_map_hasherIS3_NS_4pairIKS3_S6_EENS_4hashIS3_EENS_8equal_toIS3_EELb1EEENS_21__unordered_map_equalIS3_SB_SF_SD_Lb1EEENS_9allocatorISB_EEE4findIS3_EENS_21__hash_const_iteratorIPNS_11__hash_nodeIS7_S5_EEEERKT_
//
// This is a libc++ template instantiation compiled into Ozone (NOT an FCP class). The map is
// `unordered_map<OZSceneNode*, list_iterator<OZSceneNode*,void*>>` — the parent→child list-node
// index used by OZScene / linked-list intrusive iteration. Because the KEY type is a raw
// pointer, libc++ uses `std::hash<OZSceneNode*>` which specializes to `__murmur2_or_cityhash`
// bit-mixing on the pointer bits, and `std::equal_to<OZSceneNode*>` which is pointer==pointer.
// Both are INLINED into this function — there are NO calls out of this body (unlike the
// CGColorSpace map which called _CFHash/_CFEqual). depgraph.py deps reports 0 external deps.
//
// OBJECT LAYOUT (__hash_table, recovered from the disasm):
//   +0x00  bucket_array : (__hash_node_base**) pointer to the bucket array. i-th slot is a
//                        pointer to the "next" field of the head-stub for bucket i; dereferencing
//                        that yields the first real __hash_node* (or null if empty). Read at
//                        @0x434be `movq (%rdi),%rax`, then @0x434c1 `movq (%rax,%r8,8),%rax`.
//   +0x08  bucket_count : (unsigned long) number of buckets. Loaded to %r10 at @0x43440.
//   +0x18  size        : (unsigned long) element count. Checked at @0x43449.
//
// HASH NODE LAYOUT (libc++ __hash_node_base + __hash_node):
//   +0x00  next : __hash_node* — Read at @0x434ce (initial head via `movq (%rax),%rdi`) and
//                 at @0x434e8/@0x43514 to advance (`movq (%rdi),%rdi`).
//   +0x08  hash : size_t — cached hash of the key. Read at @0x434f0/@0x4351c
//                 (`movq 0x8(%rdi),%rax`).
//   +0x10  key  : OZSceneNode* — the pointer key. Read at @0x434f9/@0x43525
//                 (`cmpq %r9,0x10(%rdi)`).
//   +0x18  value: list_iterator<OZSceneNode*,void*> — NOT touched by find.
//
// std::hash<OZSceneNode*> = __murmur2_or_cityhash<size_t,64>::operator()(size_t)
//   Since `sizeof(OZSceneNode*)=8`, libc++ hashes the pointer with the 64-bit "short input"
//   path of __murmur2_or_cityhash: HashLen0to16 for `len=8`. Its exact form here (verbatim
//   from the disasm @0x43450..@0x43493):
//     let k       = *keyRef                            ; movq (%rsi),%r9
//     let a       = k >>> 32                           ; movq %r9,%rax ; shrq $0x20,%rax
//     let b       = (k * 8) + 8                        ; leal (,%r9,8),%edx ; addq $8,%rdx
//     let mul     = 0x9DDFEA08EB382D69                 ; movabsq $-0x622015f714c7d297,%rsi
//     b ^= a
//     b *= mul
//     a ^= b
//     b  = b >>> 47                                    ; shrq $0x2f,%rdx
//     b ^= a
//     b *= mul
//     let h       = b                                  ; movq %rdx,%rcx
//     h >>= 47                                         ; shrq $0x2f,%rcx
//     h ^= b
//     h *= mul                                         ; imulq %rsi,%rcx
//     ; result in %rcx (a.k.a. `hash`)
//
// BUCKET CHOICE — three-way branch shared with the rebucket test:
//     let mask = bucket_count - 1                      ; leaq -1(%r10),%r11
//     if ((mask & bucket_count) == 0)                  ; testq %r11,%r10 ; je .AND
//         chn = hash & mask
//     else if (hash < bucket_count)                    ; cmpq %r10,%rcx ; jb .SMALL
//         chn = hash % bucket_count                    ; else DIV
//     else
//         chn = hash                                   ; small-hash fast path
//   The disasm is *inverted* from the CGColorSpace variant: `cmpq %r10,%rcx ; jb .SMALL` means
//   "if hash < bucket_count, fall through" — but the DIV block is what gets executed when
//   `jb` is NOT taken (`hash >= bucket_count`). See @0x4349f..@0x434b7.
//
// CONTROL FLOW (line-for-line, AT&T `dst - src` for cmps):
//   @0x43440  r10 = this->bucket_count                  ; movq 0x8(%rdi),%r10
//   @0x43444  if (r10 == 0) goto NIL_NOFRAME            ; testq %r10,%r10 ; je .NIL0
//   @0x43449  if (this->size == 0) goto NIL_NOFRAME     ; cmpq $0,0x18(%rdi) ; je .NIL0
//   @0x43450  r9  = *rsi  (the OZSceneNode* key)        ; movq (%rsi),%r9
//   @0x43453  ...compute hash into rcx (as above)...
//   @0x43493  r11 = r10 - 1                             ; mask
//   @0x43497  r8  = rcx                                 ; provisional chn = hash
//   @0x4349a  if ((r11 & r10) == 0) goto .AND           ; testq %r11,%r10 ; je .AND
//   @0x4349f  if (rcx <  r10) goto .SMALL(=LOAD)        ; cmpq %r10,%rcx ; jb .SMALL  (dst-src: rcx-r10 < 0)
//   @0x434a4  ; DIV: r8 = rcx % r10                     ; movq %rcx,%rax ; xorl %edx,%edx ; divq %r10 ; movq %rdx,%r8
//   @0x434af  jmp .LOAD
//   .NIL0
//   @0x434b1  esi = 0                                   ; xorl %esi,%esi
//   @0x434b3  rax = rsi                                 ; return NULL
//   @0x434b6  retq
//   .AND
//   @0x434b7  r8 = rcx & r11                            ; andq %r11,%r8
//   .LOAD (frame is set up)
//   @0x434ba  pushq %rbp ; movq %rsp,%rbp
//   @0x434be  rax = this->bucket_array                  ; movq (%rdi),%rax
//   @0x434c1  rax = bucket_array[r8]  (a __hash_node**) ; movq (%rax,%r8,8),%rax
//   @0x434c5  if (rax == 0) goto NIL_FRAME              ; testq %rax,%rax ; je .NIL1
//   @0x434ce  rdi = *rax  (head __hash_node*)           ; movq (%rax),%rdi
//   @0x434d1  esi = 0                                   ; provisional return NULL
//   @0x434d3  if (rdi == 0) goto RET                    ; testq %rdi,%rdi ; je .RET
//   @0x434d6  if ((r11 & r10) == 0) goto WALK_AND       ; testq %r11,%r10 ; jne .REBUCKET_ELSE ; ELSE jmp WALK_AND
//   @0x434db  jne .REBUCKET_ELSE   ← REVERSED per AT&T `jne` after `test`: taken if r11 & r10 != 0
//                                    (i.e., bucket_count is NOT power-of-two) → jump to the DIV
//                                    walk. If ==0, fall through to @0x434dd `jmp .WALK_AND_HEAD`.
//   .WALK_AND_HEAD (power-of-two path)
//   @0x434dd  jmp @0x434f0 (skip advance the first time — evaluate head first)
//   .WALK_AND_ADVANCE (aligned NOP + loop body)
//   @0x434e0  rax &= r11                                ; andq %r11,%rax  ; rebucket(hash&mask)
//   @0x434e3  if (rax != r8) goto RET (NULL)            ; cmpq %r8,%rax ; jne .RET   (dst-src: rax-r8; jne = rax != r8)
//   @0x434e8  rdi = rdi->next                            ; movq (%rdi),%rdi
//   @0x434eb  if (rdi == 0) goto RET (NULL)             ; testq %rdi,%rdi ; je .RET
//   .WALK_AND_HEAD_BODY  (target of @0x434dd and fall-through from @0x434eb)
//   @0x434f0  rax = rdi->hash                           ; movq 0x8(%rdi),%rax
//   @0x434f4  if (rax != rcx) goto .WALK_AND_ADVANCE    ; cmpq %rax,%rcx ; jne @0x434e0 (dst-src: rcx-rax; jne = hash mismatch)
//   @0x434f9  if (rdi->key != r9) goto .WALK_AND_ADVANCE_HASH_MATCH ; cmpq %r9,0x10(%rdi) ; jne @0x434e8
//   @0x434fd  ; (hash match AND key match)              ;
//   @0x434ff  rsi = rdi                                 ; FOUND — return this node
//   .RET
//   @0x43502  popq %rbp
//   @0x43503  rax = rsi
//   @0x43506  retq
//   .REBUCKET_ELSE  (bucket_count not power-of-two)
//   @0x43507  ; DIV rebucket: rax = rax % r10
//   @0x43507  xorl %edx,%edx
//   @0x43509  divq %r10          ; div rdx:rax / r10 → rax=quot rdx=rem
//   @0x4350c  rax = rdx          ; movq %rdx,%rax  (bucket for this node's cached hash)
//   .REBUCKET_CMP
//   @0x4350f  if (rax != r8) goto RET (NULL)            ; cmpq %r8,%rax ; jne .RET
//   @0x43514  rdi = rdi->next                            ; movq (%rdi),%rdi
//   @0x43517  if (rdi == 0) goto RET (NULL)             ; testq %rdi,%rdi ; je .RET
//   .REBUCKET_HEAD (target of @0x434db)
//   @0x4351c  rax = rdi->hash                           ; movq 0x8(%rdi),%rax
//   @0x43520  if (rax != rcx) goto .REBUCKET_ADAPT      ; cmpq %rax,%rcx ; jne @0x43530
//   @0x43525  if (rdi->key != r9) goto .REBUCKET_ADVANCE; cmpq %r9,0x10(%rdi) ; jne @0x43514
//   @0x4352b  jmp @0x434ff                              ; FOUND
//   .REBUCKET_ADAPT (hash mismatch — need to rebucket rax before comparing)
//   @0x43530  if (rax < r10)  goto .REBUCKET_CMP        ; cmpq %r10,%rax ; jb @0x4350f
//   @0x43535  rdx = rax
//   @0x43538  rdx |= r10                                ; orq %r10,%rdx
//   @0x4353b  rdx >>= 32                                ; shrq $0x20,%rdx
//   @0x4353f  if (rdx != 0) goto .REBUCKET_ADAPT_FULL   ; jne @0x43507
//   @0x43541  ; both rax and r10 fit in 32 bits — use 32-bit div
//   @0x43541  xorl %edx,%edx
//   @0x43543  divl %r10d
//   @0x43546  eax = edx                                 ; movl %edx,%eax
//   @0x43548  jmp .REBUCKET_CMP
//   .NIL1 (frame set up)
//   @0x4354a  esi = 0
//   @0x4354c  popq %rbp
//   @0x4354d  rax = rsi
//   @0x43550  retq
//
// The return convention is a raw __hash_node* (or NULL). libc++'s templated wrapper builds an
// iterator from that pointer via RVO. We model the return as `HashNodeOZSceneNode_ListIter | null`.

/**
 * Opaque OZSceneNode pointer — the KEY of this map. Modelled as a nominal opaque so callers
 * can only pass it through by identity. The disasm treats it as a 64-bit value only.
 */
export type OZSceneNodePtr = { readonly __ozSceneNodePtr: unique symbol };

/**
 * Opaque list_iterator<OZSceneNode*, void*> — the VALUE. Not touched by find, so we leave it
 * unspecified beyond "some record at +0x18 in the hash node".
 */
export type OZSceneNodeListIter = unknown;

/**
 * libc++ __hash_node — the entry stored in each bucket chain. Layout above.
 * Read at @0x434ce / @0x434f0 / @0x434f9 / @0x434e8 / @0x4351c / @0x43525 / @0x43514.
 */
export interface HashNodeOZSceneNode_ListIter {
  /** +0x00 next pointer in singly-linked chain (or null at chain tail) */
  next: HashNodeOZSceneNode_ListIter | null;
  /** +0x08 cached hash of the key (bigint — a full 64-bit size_t) */
  hash: bigint;
  /** +0x10 key (OZSceneNode*), compared by pointer equality (bigint payload for the disasm) */
  key: bigint;
  /** +0x18 value (list_iterator) — not read by find */
  value: OZSceneNodeListIter;
}

/**
 * libc++ __hash_table state for the OZSceneNode*→list_iterator map. Only the fields find()
 * touches are modelled.
 *
 * The bucket_array field in libc++ is `__hash_node_base**` — the i-th slot is `head->next`
 * for the i-th bucket. Two indirections in the disasm (`movq (%rdi),%rax; movq (%rax,%r8,8),%rax`
 * followed by `movq (%rax),%rdi`) map to: (1) load the bucket_array base, (2) index by chn, (3)
 * dereference to obtain the FIRST __hash_node* in that bucket. We model that with a two-level
 * shape: outer array of "slot pointers", inner one-cell array holding the first __hash_node*.
 */
export interface HashTableOZSceneNode_ListIter {
  /**
   * +0x00 bucket_array — array of slot pointers. Slot i is either null (unallocated bucket
   * head-stub) or points to a cell whose [0] entry is the first __hash_node* in bucket i
   * (or null if the bucket is empty).
   */
  bucket_array: ReadonlyArray<
    ReadonlyArray<HashNodeOZSceneNode_ListIter | null> | null
  > | null;
  /** +0x08 bucket_count (unsigned long) */
  bucket_count: bigint;
  /** +0x10 (unused by find; padded here for layout fidelity) */
  _pad10: unknown;
  /** +0x18 size (unsigned long) — element count */
  size: bigint;
}

/**
 * std::__1::__hash_table<...OZSceneNode*, list_iterator...>::find<OZSceneNode*>(OZSceneNode* const&) const
 *
 * @Ozone 0x00043440  (libc++ template instantiation compiled into Ozone)
 * mangled: __ZNKSt3__112__hash_tableINS_17__hash_value_typeIP11OZSceneNodeNS_15__list_iteratorIS3_PvEEEENS_22__unordered_map_hasherIS3_NS_4pairIKS3_S6_EENS_4hashIS3_EENS_8equal_toIS3_EELb1EEENS_21__unordered_map_equalIS3_SB_SF_SD_Lb1EEENS_9allocatorISB_EEE4findIS3_EENS_21__hash_const_iteratorIPNS_11__hash_nodeIS7_S5_EEEERKT_
 *
 * Returns the found __hash_node* or null. Every operation is transcribed line-for-line from the
 * disassembly above; there are no calls out of this body (std::hash<T*> and std::equal_to<T*> are
 * both inlined; the 3 truly-out-of-scope externs the queue insisted on — none — do not exist here).
 *
 * All arithmetic is done in `bigint` to preserve the full 64-bit behaviour of size_t / pointer
 * bits (mask arithmetic, imulq, shrq, divq). This matches Rule 4: int64 → bigint where the value
 * can exceed 2^53. `Math.fround` does not apply (integer-only).
 */
export function hash_table_OZSceneNode_ListIter_find(
  self: HashTableOZSceneNode_ListIter,
  keyRef: { readonly value: bigint },
): HashNodeOZSceneNode_ListIter | null {
  // @0x43440..@0x4344e — up-front NIL exits (no allocation OR empty)
  const bucket_count = self.bucket_count; // r10 = 0x8(%rdi)
  if (bucket_count === 0n) return null; // @0x43447 je .NIL0
  if (self.size === 0n) return null; // @0x4344e cmpq $0,0x18(%rdi); je .NIL0

  // @0x43450 — load the key value
  const k = keyRef.value; // r9 = *(%rsi)

  // @0x43453..@0x43493 — inlined std::hash<T*> = __murmur2_or_cityhash 64-bit short-input mix.
  // Note the initial `b` is `(k*8)+8` (i.e., `leal (,%r9,8),%edx ; addq $0x8,%rdx`), which uses
  // the 32-bit `leal` truncation on the low 32 bits before the `addq $8`. Transcribe exactly.
  const MASK64 = 0xffffffffffffffffn;
  const MASK32 = 0xffffffffn;
  const MUL = 0x9ddfea08eb382d69n; // @0x43469 movabsq $-0x622015f714c7d297 == 0x9DDFEA08EB382D69

  let a = (k >> 32n) & MASK64; // @0x43453 movq %r9,%rax; @0x43456 shrq $0x20,%rax
  // leal (,%r9,8),%edx — 32-bit result, zero-extended into rdx
  let b = ((k << 3n) & MASK32) + 0x8n; // @0x4345a + @0x43462
  b = (b ^ a) & MASK64; // @0x43466 xorq %rax,%rdx
  b = (b * MUL) & MASK64; // @0x43473 imulq %rsi,%rdx
  a = (a ^ b) & MASK64; // @0x43477 xorq %rdx,%rax
  b = (b >> 47n) & MASK64; // @0x4347a shrq $0x2f,%rdx
  b = (b ^ a) & MASK64; // @0x4347e xorq %rax,%rdx
  b = (b * MUL) & MASK64; // @0x43481 imulq %rsi,%rdx
  let hash = b; // @0x43485 movq %rdx,%rcx
  hash = (hash >> 47n) & MASK64; // @0x43488 shrq $0x2f,%rcx
  hash = (hash ^ b) & MASK64; // @0x4348c xorq %rdx,%rcx
  hash = (hash * MUL) & MASK64; // @0x4348f imulq %rsi,%rcx

  // @0x43493..@0x434b7 — pick the bucket via three-way branch.
  const mask = (bucket_count - 1n) & MASK64; // r11 = r10 - 1  @0x43493
  let chn: bigint = hash; // r8 = rcx        @0x43497
  // @0x4349a testq %r11,%r10 ; je .AND  → if (mask & bucket_count) == 0, bucket_count is a pow2
  if ((mask & bucket_count) === 0n) {
    chn = hash & mask; // @0x434b7 andq %r11,%r8
  } else {
    // @0x4349f cmpq %r10,%rcx ; jb .SMALL  → if hash < bucket_count, keep chn = hash (fast path)
    if (hash < bucket_count) {
      // fall through with chn = hash (already set)
    } else {
      // @0x434a4 movq %rcx,%rax; xorl %edx,%edx; divq %r10; movq %rdx,%r8
      chn = hash % bucket_count;
    }
  }

  // @0x434ba pushq %rbp; movq %rsp,%rbp — frame set up. All returns beyond this point are
  // "framed" (@0x43502 popq %rbp). Modeled implicitly.

  // @0x434be movq (%rdi),%rax        ; rax = bucket_array base
  const bucket_array = self.bucket_array;
  if (bucket_array === null) return null; // (bucket_array==NULL would segfault in C++; keep sane in TS)

  // @0x434c1 movq (%rax,%r8,8),%rax   ; rax = bucket_array[chn]  (slot pointer, i.e. &head->next)
  //   chn is a bigint but bucket_array indices are Number. Downcast — the queue guarantees
  //   bucket_count fits in 32 bits in practice, but for FIDELITY we take low-bits only.
  const chnIdx = Number(chn & 0xffffffffn) + Number((chn >> 32n) & 0n); // widen-safe cast
  const slot = bucket_array[chnIdx] ?? null;
  // @0x434c5 testq %rax,%rax ; je .NIL1 — slot pointer is NULL → return NULL
  if (slot === null) return null;

  // @0x434ce movq (%rax),%rdi         ; rdi = *slot = first __hash_node* in bucket
  let node: HashNodeOZSceneNode_ListIter | null = slot[0] ?? null;
  // @0x434d1 xorl %esi,%esi           ; provisional NULL
  let found: HashNodeOZSceneNode_ListIter | null = null;
  // @0x434d3 testq %rdi,%rdi ; je .RET (frame RET)
  if (node === null) return found;

  // @0x434d6 testq %r11,%r10 ; jne .REBUCKET_ELSE
  //   `jne` after `test`: taken if (r11 & r10) != 0 → bucket_count is NOT a power of two.
  //   The rebucket check in the walk then uses `% bucket_count`.
  const bucketCountIsPow2 = (mask & bucket_count) === 0n;

  if (bucketCountIsPow2) {
    // ------ .WALK_AND path (@0x434dd..@0x43506) ------
    // @0x434dd jmp @0x434f0 — evaluate the head node's hash first (skip the advance).
    // Loop invariant: `node` is the current __hash_node* (non-null) whose hash we're about to test.
    // eslint-disable-next-line no-constant-condition
    for (;;) {
      // @0x434f0 movq 0x8(%rdi),%rax   ; rax = node->hash
      const nh = node.hash;
      // @0x434f4 cmpq %rax,%rcx ; jne @0x434e0  (dst-src: rcx-rax; jne = hash mismatch)
      if (nh === hash) {
        // @0x434f9 cmpq %r9,0x10(%rdi) ; jne @0x434e8
        if (node.key === k) {
          // @0x434fd ; falls through @0x434ff movq %rdi,%rsi  ← FOUND
          found = node;
          break;
        }
        // @0x434e8 movq (%rdi),%rdi ; @0x434eb testq ; je .RET
        node = node.next;
        if (node === null) break;
        continue;
      }
      // @0x434e0 andq %r11,%rax ; @0x434e3 cmpq %r8,%rax ; jne .RET
      const rebucket = nh & mask;
      if (rebucket !== chn) break;
      // @0x434e8 movq (%rdi),%rdi ; @0x434eb testq ; je .RET
      node = node.next;
      if (node === null) break;
      // fall through to @0x434f0
    }
  } else {
    // ------ .REBUCKET_ELSE path (@0x4351c..@0x43548) ------
    // @0x434dd `jmp @0x4351c` for the not-pow2 case; loop invariant same as above but the
    // rebucket test uses `% bucket_count` (with a `divl` short-circuit for values that fit in 32b).
    // eslint-disable-next-line no-constant-condition
    for (;;) {
      // @0x4351c movq 0x8(%rdi),%rax   ; rax = node->hash
      const nh = node.hash;
      // @0x43520 cmpq %rax,%rcx ; jne @0x43530
      if (nh === hash) {
        // @0x43525 cmpq %r9,0x10(%rdi) ; jne @0x43514
        if (node.key === k) {
          // @0x4352b jmp @0x434ff ; FOUND
          found = node;
          break;
        }
        // @0x43514 movq (%rdi),%rdi ; @0x43517 testq ; je .RET
        node = node.next;
        if (node === null) break;
        continue;
      }
      // @0x43530 cmpq %r10,%rax ; jb @0x4350f  → if nh < bucket_count, skip the rebucket
      let rebucket: bigint;
      if (nh < bucket_count) {
        rebucket = nh;
      } else {
        // @0x43535 movq %rax,%rdx ; @0x43538 orq %r10,%rdx ; @0x4353b shrq $0x20,%rdx ; @0x4353f jne @0x43507
        //   if either operand needs more than 32 bits, use the 64-bit divq; else use the
        //   short 32-bit divl. Either way the math is `nh % bucket_count`.
        rebucket = nh % bucket_count;
      }
      // @0x4350f cmpq %r8,%rax ; jne .RET
      if (rebucket !== chn) break;
      // @0x43514 movq (%rdi),%rdi ; @0x43517 testq ; je .RET
      node = node.next;
      if (node === null) break;
      // fall through to @0x4351c
    }
  }

  // @0x43502 popq %rbp ; @0x43503 movq %rsi,%rax ; @0x43506 retq
  return found;
}
