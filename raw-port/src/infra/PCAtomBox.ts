// PCAtomBox — ProCore's QuickTime/ISO-BMFF "atom box" descriptor (type, offset,
// size, payload, parent/child links) used when parsing container files.
//
// Faithful port of the ProCore x86_64 disassembly. Every method cites its
// @ProCore addr. Framework: ProCore (thin slice extracted from
// Final Cut Pro.app/Contents/Frameworks/ProCore.framework/.../ProCore).
//
// Provenance (raw-port/re/disasm/ProCore.PCAtomBox.*.s):
//   getOffset()  @0x008b54  (__ZN9PCAtomBox9getOffsetEv)
//   setOffset(unsigned long long)  @0x008b5e  (__ZN9PCAtomBox9setOffsetEy)
//   getHeaderSize()  @0x008b90  (__ZN9PCAtomBox13getHeaderSizeEv)
//   setPayloadSize(unsigned long long)  @0x008b86  (__ZN9PCAtomBox14setPayloadSizeEy)
//   getChildCount()  @0x008eae  (__ZN9PCAtomBox13getChildCountEv)
//   findFirstChild(int, unsigned int)  @0x008f8a  (__ZN9PCAtomBox14findFirstChildEij)
//   updateSize()  @0x008eee  (__ZN9PCAtomBox10updateSizeEv)
//
// ── Decoded struct layout (only the fields this unit touches are pinned here;
//    the remaining fields are added by their own ledger units) ──────────────
//
//   +0x00  u64          offset      // byte offset of this atom within its container file.
//                                   // Read by getOffset @0x008b58 (`movq (%rdi),%rax`), written
//                                   // by setOffset(unsigned long long) — a full 64-bit value,
//                                   // so it is modelled as a bigint (a large file offset can
//                                   // exceed 2^53). See PORTING_SPEC Rule 4.
//   +0x08  u64          size        // total box size. Read by getHeaderSize @0x008b94
//                                   // (`movq 0x8(%rdi),%rax`). 64-bit -> bigint (Rule 4).
//   +0x10  u64          payloadSize // box payload size. Written by setPayloadSize @0x008b8a
//                                   // (`movq %rsi,0x10(%rdi)`), read by getHeaderSize @0x008b98
//                                   // (`subq 0x10(%rdi),%rax`). 64-bit -> bigint (Rule 4).
//   +0x08  void*        validity    // non-null guard read by findFirstChild @0x008fab
//                                   // (`cmpq $0,0x8(%rdi); je return-null`). Modelled as a
//                                   // boolean/opaque presence flag; when falsy findFirstChild
//                                   // returns null immediately.
//   +0x18  int          type        // this atom's 4CC/type id (child match key). Compared in
//                                   // findFirstChild @0x008fcb (`cmpl %ebx,0x18(%rax)`).
//   +0x30  PCAtomBox*[] childrenBeg // begin ptr of the children pointer-vector (@0x008f98).
//   +0x38  PCAtomBox*[] childrenEnd // end ptr (@0x008f9c). count = (end-beg)>>3 (8-byte ptrs).
//                                   // Modelled together as `children: (PCAtomBox|null)[]`.

/**
 * CFData-like handle read by updateSize (@0x008f2b) via `_CFDataGetLength`. In FCP this
 * is CoreFoundation's opaque `const __CFData*`. Mirroring the peer PCBufferReadStream port
 * (raw-port/src/infra/PCBufferReadStream.ts), we model it as a `{ bytes }` view so the one
 * CF surface this class touches (CFDataGetLength) is faithful without inventing a full
 * CoreFoundation shim.
 */
export interface CFDataRef {
  /** Bytes of the CFData; its length is what `_CFDataGetLength` returns. */
  bytes: Uint8Array;
}

/**
 * `_CFDataGetLength(CFDataRef)` — CoreFoundation.framework extern, called by
 * PCAtomBox::updateSize via ProCore call stub @0xddf5e (`callq 0xddf5e` @0x008f34).
 * Returns the byte count of the CFData (a `CFIndex`, i.e. a signed long). Identical
 * boundary model to the peer PCBufferReadStream port.
 */
function CFDataGetLength(data: CFDataRef): number {
  // In CF this reads the CFData's stored length. We surface it as the byte-view length.
  return data.bytes.length;
}

export class PCAtomBox {
  // +0x00  u64 file offset of this atom (see setOffset(unsigned long long)).
  offset: bigint = 0n;

  // +0x08  u64 total box size (see getSize @0x008b68, read by getHeaderSize @0x008b94).
  //        A 64-bit file quantity; container files can exceed 2^53 bytes, so per
  //        PORTING_SPEC Rule 4 it is modelled as bigint.
  size: bigint = 0n;

  // +0x10  u64 box payload size (written by setPayloadSize @0x008b86, read by
  //        getHeaderSize @0x008b98). 64-bit file quantity -> bigint (Rule 4).
  payloadSize: bigint = 0n;

  // +0x08  non-null validity/parent guard read by findFirstChild @0x008fab. Modelled as
  //        a presence flag; findFirstChild returns null early when it is falsy.
  validity: unknown = null;

  // +0x18  int  this atom's type id (child match key), compared @0x008fcb in findFirstChild.
  type: number = 0;

  // +0x20  PCAtomBox*  parent link — this atom's enclosing box. Returned verbatim
  //        by getParent() @0x008bb6 (`movq 0x20(%rdi),%rax`). null when this atom
  //        has no parent (top-level box).
  parent: PCAtomBox | null = null;

  // +0x28  void*  payload data pointer — the raw bytes of this atom's payload.
  //        Returned verbatim by getPayloadData() @0x008ec4 (`movq 0x28(%rdi),%rax`).
  //        Modelled as a Uint8Array (the byte view) or null when unset.
  payloadData: Uint8Array | null = null;

  // +0x28  CFDataRef  an optional embedded payload blob attached to this atom. Read by
  //        updateSize @0x008f2b (`movq 0x28(%rbx),%rdi ; testq %rdi,%rdi ; je`) — when
  //        non-null its `_CFDataGetLength` (@stub 0xddf5e) is ADDED to the summed child
  //        sizes to form payloadSize. Modelled as the same CFDataRef surface the peer
  //        PCBufferReadStream uses (a `{ bytes }` view). null when this atom carries no
  //        inline data blob.
  dataPayload: CFDataRef | null = null;

  // +0x30/+0x38  the children pointer-vector [begin,end). The machine derives
  //   count = (end-begin) >> 3 over 8-byte pointers; we model it directly as an array.
  children: (PCAtomBox | null)[] = [];

  /**
   * PCAtomBox::getOffset()
   * @0xADDR ProCore 0x0000000000008b54  (__ZN9PCAtomBox9getOffsetEv)
   *
   * DECODE (raw-port/re/disasm/ProCore.__ZN9PCAtomBox9getOffsetEv.s):
   *   0x008b54  pushq %rbp ; movq %rsp,%rbp        ; frame
   *   0x008b58  movq (%rdi), %rax                  ; rax = *(u64*)(this+0x00) = offset
   *   0x008b5b  popq %rbp ; retq                   ; return offset
   *
   * A plain 64-bit field accessor: returns the atom's byte offset. Zero callees,
   * no externs. The return is a full unsigned long long, kept as bigint.
   */
  getOffset(): bigint {
    // @0x008b58 — movq (%rdi),%rax : load the u64 offset at +0x00.
    return this.offset;
  }

  /**
   * PCAtomBox::setOffset(unsigned long long)
   * @0xADDR ProCore 0x0000000000008b5e  (__ZN9PCAtomBox9setOffsetEy)
   *
   * DECODE (raw-port/re/disasm/ProCore.__ZN9PCAtomBox9setOffsetEy.s):
   *   0x008b5e  pushq %rbp ; movq %rsp,%rbp        ; frame
   *   0x008b62  movq %rsi, (%rdi)                  ; *(u64*)(this+0x00) = arg
   *   0x008b65  popq %rbp ; retq                   ; void
   *
   * The 64-bit companion setter to getOffset(): stores the full unsigned long
   * long argument (%rsi) into the atom's byte-offset field at +0x00. Zero
   * callees, no externs. Kept as bigint per PORTING_SPEC Rule 4 (a file offset
   * can exceed 2^53).
   */
  setOffset(value: bigint): void {
    // @0x008b62 — movq %rsi,(%rdi) : store the u64 offset at +0x00.
    this.offset = BigInt.asUintN(64, value);
  }

  /**
   * PCAtomBox::getHeaderSize()
   * @0xADDR ProCore 0x0000000000008b90  (__ZN9PCAtomBox13getHeaderSizeEv)
   *
   * DECODE (raw-port/re/disasm/ProCore.__ZN9PCAtomBox13getHeaderSizeEv.s):
   *   0x008b90  pushq %rbp ; movq %rsp,%rbp        ; frame
   *   0x008b94  movq  0x8(%rdi), %rax              ; rax = this->size (+0x08)
   *   0x008b98  subq  0x10(%rdi), %rax             ; rax -= this->payloadSize (+0x10)
   *   0x008b9c  popq %rbp ; retq                   ; return size - payloadSize
   *
   * Returns `this->size - this->payloadSize`: the number of header bytes that
   * precede the box payload. 64-bit two's-complement subtraction (`subq`).
   */
  getHeaderSize(): bigint {
    // @0x008b94 rax = this->size (+0x08) ; @0x008b98 rax -= payloadSize (+0x10).
    return BigInt.asIntN(64, this.size - this.payloadSize);
  }

  /**
   * PCAtomBox::setPayloadSize(unsigned long long size)
   * @0xADDR ProCore 0x0000000000008b86  (__ZN9PCAtomBox14setPayloadSizeEy)
   *
   * DECODE (raw-port/re/disasm/ProCore.__ZN9PCAtomBox14setPayloadSizeEy.s):
   *   0x008b86  pushq %rbp ; movq %rsp,%rbp        ; frame
   *   0x008b8a  movq %rsi, 0x10(%rdi)              ; *(u64*)(this+0x10) = size
   *   0x008b8e  popq %rbp ; retq                   ; return void
   *
   * A plain 64-bit field store: writes the payload size. Zero callees, no
   * externs. The argument is a full unsigned long long, kept as bigint.
   */
  setPayloadSize(size: bigint): void {
    // @0x008b8a — movq %rsi,0x10(%rdi) : store the u64 payloadSize at +0x10.
    this.payloadSize = size;
  }

  /**
   * PCAtomBox::getChildCount()
   * @0xADDR ProCore 0x0000000000008eae  (__ZN9PCAtomBox13getChildCountEv)
   *
   * DECODE (raw-port/re/disasm/ProCore.__ZN9PCAtomBox13getChildCountEv.s):
   *   0x008eae  pushq %rbp ; movq %rsp,%rbp        ; frame
   *   0x008eb2  movq  0x38(%rdi), %rax             ; rax = children_end (+0x38)
   *   0x008eb6  subq  0x30(%rdi), %rax             ; rax -= children_begin (+0x30)  (byte span)
   *   0x008eba  shrq  $0x3, %rax                   ; rax >>= 3  (byte span / 8 = element count)
   *   0x008ebe  popq %rbp ; retq                   ; return count
   *
   * `std::vector<PCAtomBox*>::size()` inlined: (end - begin) / sizeof(pointer=8).
   * The same `children` array `findFirstChild` @0x008f8a walks — that method
   * derives its own count with the identical
   * `movq 0x38 ; subq 0x30 ; shrq $3` sequence (@0x008f98..@0x008fa3) — so the
   * array's `.length` IS this count. Zero callees, no externs.
   */
  getChildCount(): number {
    // @0x008eb2..0x008eba — (children_end - children_begin) >> 3 == array length.
    return this.children.length;
  }

  /**
   * PCAtomBox::findFirstChild(int recurse, unsigned int type)
   * @0xADDR ProCore 0x0000000000008f8a  (__ZN9PCAtomBox14findFirstChildEij)
   *
   * Depth-first search of this atom's direct children for the first whose
   * `type` (+0x18) equals the requested `type`. When `recurse` is nonzero and a
   * direct child does not match, the search descends into that child recursively
   * (the ONLY callee is this same function — self-recursion, in-scope).
   *
   * DECODE (raw-port/re/disasm/ProCore.__ZN9PCAtomBox14findFirstChildEij.s):
   *   0x008f98  movq 0x30(%rdi),%r15          ; r15 = children begin ptr
   *   0x008f9c  movq 0x38(%rdi),%rax          ; rax = children end ptr
   *   0x008fa0  subq %r15,%rax ; shrq $3,%rax  ; count = (end-begin)/8  (ptr array)
   *   0x008fa7  testl %eax,%eax ; je null      ; count == 0 -> return null (0x8ff5)
   *   0x008fab  cmpq $0,0x8(%rdi) ; je null     ; validity(+0x8) == 0 -> return null
   *   0x008fb2  movl %edx,%ebx                 ; ebx = type   (arg2, unsigned int)
   *   0x008fb4  movl %esi,%r14d                ; r14d = recurse (arg1, int)
   *   0x008fb7  movslq %eax,%r12               ; r12 = (int64)count
   *   0x008fba  xorl %r13d,%r13d               ; i = 0
   *   loop @0x008fbd (i < count):
   *     0x008fc2  movq (%r15,%r13,8),%rax      ; child = children[i]
   *     0x008fc6  testq %rax,%rax ; je 0x8fe4   ; child == null -> rax=0, continue
   *     0x008fcb  cmpl %ebx,0x18(%rax) ; je hit ; child->type == type -> return child
   *     0x008fd0  testl %r14d,%r14d ; je 0x8fe4 ; recurse == 0 -> rax=0, continue
   *     0x008fd5  child.findFirstChild(recurse, type) -> rax   (0x008fdd callq self)
   *     0x008fe6  testq %rax,%rax ; jne hit     ; recursive result != null -> return it
   *     0x008feb  i++ ; @0x008fee cmp ; jl loop
   *   0x008ff3  jmp hit                         ; loop exhausted: rax already 0 -> return null
   *   0x008fe4  xorl %eax,%eax                  ; the "no result this iteration" target
   *   0x008ff5  xorl %eax,%eax                  ; early-null target
   *   0x008ff7  return rax
   *
   * Note the machine keeps the SAME loop-carried `rax`: the null/skip target
   * @0x8fe4 zeroes rax then re-tests it (0x8fe6) so it just advances `i`; only
   * a matching child (0x8fcb) or a nonzero recursive result (0x8fe6) exits.
   */
  findFirstChild(recurse: number, type: number): PCAtomBox | null {
    // @0x008f98..0x008fa3 count = (end - begin) / 8 over 8-byte pointers.
    const count = this.children.length | 0; // == (0x38 - 0x30) >> 3
    // @0x008fa7 testl %eax,%eax ; je -> count == 0 -> null
    if ((count & 0xffffffff) === 0) return null;
    // @0x008fab cmpq $0,0x8(%rdi) ; je -> validity guard falsy -> null
    if (!this.validity) return null;

    // @0x008fb2 ebx = type (unsigned int) ; @0x008fb4 r14d = recurse (int)
    const wantType = type >>> 0;
    const recurseFlag = recurse | 0;
    // @0x008fb7 r12 = (int64)count (signed extend of the 32-bit count)
    const n = count;

    // @0x008fba i = 0 ; loop @0x008fbd while i < n
    for (let i = 0; i < n; i++) {
      // @0x008fc2 child = children[i]
      const child = this.children[i] ?? null;
      // @0x008fc6 testq %rax,%rax ; je 0x8fe4 -> null child: no match this iter, continue
      if (child === null) continue;
      // @0x008fcb cmpl %ebx,0x18(%rax) ; je -> child->type == type: return child
      if ((child.type >>> 0) === wantType) return child;
      // @0x008fd0 testl %r14d,%r14d ; je 0x8fe4 -> recurse disabled: continue
      if (recurseFlag === 0) continue;
      // @0x008fd5..0x008fdd callq self: descend into the child
      const found = child.findFirstChild(recurseFlag, wantType);
      // @0x008fe6 testq %rax,%rax ; jne -> nonzero recursive result: return it
      if (found !== null) return found;
      // else fall through to @0x008feb i++ (continue)
    }
    // @0x008ff3/0x008ff5 loop exhausted (rax already 0) -> return null
    return null;
  }

  /**
   * PCAtomBox::setSize(unsigned long long)
   * @0xADDR ProCore 0x0000000000008b72  (__ZN9PCAtomBox7setSizeEy)
   *
   * DECODE (raw-port/re/disasm/ProCore.__ZN9PCAtomBox7setSizeEy.s):
   *   0x008b72  pushq %rbp ; movq %rsp,%rbp        ; frame
   *   0x008b76  movq  %rsi, 0x8(%rdi)              ; *(u64*)(this+0x08) = arg
   *   0x008b7a  popq %rbp ; retq                   ; void
   *
   * The 64-bit companion setter to getSize (@0x008b68, read @0x008b94 by
   * getHeaderSize): stores the full unsigned long long argument (%rsi) into the
   * atom's total-box-size field at +0x08. Zero callees, no externs. Kept as
   * bigint per PORTING_SPEC Rule 4 (a box size is a 64-bit file quantity that
   * can exceed 2^53), and masked to a u64 to mirror the machine's `movq` store.
   */
  setSize(value: bigint): void {
    // @0x008b76 — movq %rsi,0x8(%rdi) : store the u64 size at +0x08.
    this.size = BigInt.asUintN(64, value);
  }

  /**
   * PCAtomBox::getParent()
   * @0xADDR ProCore 0x0000000000008bb2  (__ZN9PCAtomBox9getParentEv)
   *
   * DECODE (raw-port/re/disasm/ProCore.__ZN9PCAtomBox9getParentEv.s):
   *   0x008bb2  pushq %rbp ; movq %rsp,%rbp        ; frame
   *   0x008bb6  movq 0x20(%rdi), %rax              ; rax = *(PCAtomBox**)(this+0x20) = parent
   *   0x008bba  popq %rbp ; retq                   ; return parent
   *
   * A plain pointer-field accessor: returns the atom's enclosing (parent) box.
   * Zero callees, no externs. Returns null when there is no parent.
   */
  getParent(): PCAtomBox | null {
    // @0x008bb6 — movq 0x20(%rdi),%rax : load the parent pointer at +0x20.
    return this.parent;
  }

  /**
   * PCAtomBox::getSize()
   * @0xADDR ProCore 0x0000000000008b68  (__ZN9PCAtomBox7getSizeEv)
   *
   * DECODE (raw-port/re/disasm/ProCore.__ZN9PCAtomBox7getSizeEv.s):
   *   0x008b68  pushq %rbp ; movq %rsp,%rbp        ; frame
   *   0x008b6c  movq 0x8(%rdi), %rax               ; rax = *(u64*)(this+0x08) = size
   *   0x008b70  popq %rbp ; retq                   ; return size
   *
   * A plain 64-bit field accessor: returns the atom's total box size. This is the
   * exact companion getter to setSize(unsigned long long) @0x008b72 (`movq %rsi,0x8(%rdi)`),
   * reading the same +0x08 field that getHeaderSize @0x008b94 reads. Zero callees,
   * no externs. The return is a full unsigned long long, kept as bigint (PORTING_SPEC
   * Rule 4 — a box size is a 64-bit file quantity that can exceed 2^53).
   */
  getSize(): bigint {
    // @0x008b6c — movq 0x8(%rdi),%rax : load the u64 size at +0x08.
    return this.size;
  }

  /**
   * PCAtomBox::getPayloadData()
   * @0xADDR ProCore 0x0000000000008ec0  (__ZN9PCAtomBox14getPayloadDataEv)
   *
   * DECODE (raw-port/re/disasm/ProCore.__ZN9PCAtomBox14getPayloadDataEv.s):
   *   0x008ec0  pushq %rbp ; movq %rsp,%rbp        ; frame
   *   0x008ec4  movq 0x28(%rdi), %rax              ; rax = *(void**)(this+0x28) = payloadData
   *   0x008ec8  popq %rbp ; retq                   ; return payloadData
   *
   * A plain pointer-field accessor: returns the pointer to this atom's payload
   * bytes (the box body after its header). Zero callees, no externs. Modelled as
   * the Uint8Array byte view stored in the +0x28 field; null when unset.
   */
  getPayloadData(): Uint8Array | null {
    // @0x008ec4 — movq 0x28(%rdi),%rax : load the payload data pointer at +0x28.
    return this.payloadData;
  }

  /**
   * PCAtomBox::updateSize()
   * @0xADDR ProCore 0x0000000000008eee  (__ZN9PCAtomBox10updateSizeEv)
   *
   * Recomputes this atom's payload size (+0x10) as the sum of all child box sizes
   * (child +0x08) plus, if present, the length of the atom's inline CFData blob (+0x28),
   * then recomputes the total box size (+0x08) by adding the header size — 8 bytes for a
   * 32-bit-length box, or 16 bytes for the 64-bit "largesize" form when the payload
   * exceeds 0xFFFFFFFE (the ISO-BMFF threshold that forces a 64-bit size field). The
   * header is only added when this atom has a parent (+0x20); a parentless (top-level)
   * atom's total size is left equal to the summed payload.
   *
   * DECODE (raw-port/re/disasm/ProCore.__ZN9PCAtomBox10updateSizeEv.s):
   *   0x008ef8  movq 0x30(%rdi),%rax          ; rax = children begin ptr (+0x30)
   *   0x008efc  movq 0x38(%rdi),%rcx          ; rcx = children end   ptr (+0x38)
   *   0x008f00  subq %rax,%rcx ; shrq $3,%rcx  ; rcx = count = (end-begin)/8  (8-byte ptrs)
   *   0x008f07  testl %ecx,%ecx ; jle 0x8f28   ; SIGNED count <= 0 -> skip loop (r14 = 0)
   *   0x008f0b  andl $0x7fffffff,%ecx          ; mask to a positive 31-bit trip count
   *   0x008f11  xorl %edx,%edx                 ; i = 0
   *   0x008f13  xorl %r14d,%r14d               ; sum = 0
   *   loop @0x008f16:
   *     0x008f16  movq (%rax,%rdx,8),%rsi      ; child = children[i]
   *     0x008f1a  addq 0x8(%rsi),%r14          ; sum += child->size (child +0x08)
   *     0x008f1e  incq %rdx                    ; i++
   *     0x008f21  cmpq %rdx,%rcx ; jne 0x8f16   ; loop while i != count
   *   0x008f26  jmp 0x8f2b
   *   0x008f28  xorl %r14d,%r14d               ; (no children) sum = 0
   *   0x008f2b  movq 0x28(%rbx),%rdi           ; rdi = this->dataPayload (+0x28)
   *   0x008f2f  testq %rdi,%rdi ; je 0x8f3c     ; dataPayload == null -> skip CFDataGetLength
   *   0x008f34  callq 0xddf5e (_CFDataGetLength); rax = CFDataGetLength(dataPayload)
   *   0x008f39  addq %rax,%r14                 ; sum += length
   *   0x008f3c  movq %r14,0x10(%rbx)           ; this->payloadSize (+0x10) = sum
   *   0x008f40  cmpq $0,0x20(%rbx) ; je 0x8f5b  ; parent (+0x20) == null -> no header add
   *   0x008f47  movl $0xfffffffe,%eax          ; eax = 0xFFFFFFFE
   *   0x008f4c  cmpq %rax,%r14                 ; AT&T: r14 - 0xFFFFFFFE (unsigned)
   *   0x008f4f  ja 0x8f57                      ; r14 > 0xFFFFFFFE -> 64-bit-size box (+0x10)
   *   0x008f51  addq $0x8,%r14                 ; else 32-bit-size box header = 8 bytes
   *   0x008f55  jmp 0x8f5b
   *   0x008f57  addq $0x10,%r14                ; largesize header = 16 bytes
   *   0x008f5b  movq %r14,0x8(%rbx)            ; this->size (+0x08) = sum + header
   *   0x008f63  retq
   *
   * Numerics: the summed field values and CFData length are 64-bit unsigned quantities
   * (box/payload sizes are u64 file fields — see the size/payloadSize fields), so the
   * accumulation is bigint per PORTING_SPEC Rule 4. The header decision compares the
   * running u64 sum against 0xFFFFFFFE with an UNSIGNED `ja` (AT&T r14 - imm), i.e. the
   * 64-bit form is chosen strictly when `sum > 0xFFFFFFFE`.
   *
   * Callee: `_CFDataGetLength` — CoreFoundation extern (ProCore stub @0xddf5e). Modelled
   * by the boundary function above (same as the peer PCBufferReadStream port). No in-scope
   * callees (`depgraph.py deps` prints nothing).
   */
  updateSize(): void {
    // @0x008ef8..0x008f07 count = (end - begin) / 8 over 8-byte child pointers.
    // @0x008f07 testl %ecx,%ecx ; jle -> SIGNED count <= 0 skips the loop with sum = 0.
    let sum = 0n; // r14 accumulator (u64)
    const count = this.children.length | 0; // == (0x38 - 0x30) >> 3
    if (count > 0) {
      // @0x008f0b andl $0x7fffffff -> positive 31-bit trip count; @0x008f11/13 i=0, sum=0.
      const n = count & 0x7fffffff;
      // @0x008f16 loop: sum += children[i]->size (child +0x08).
      for (let i = 0; i < n; i++) {
        const child = this.children[i];
        // @0x008f1a addq 0x8(%rsi),%r14 : accumulate the child's u64 total box size.
        sum = BigInt.asUintN(64, sum + (child ? child.size : 0n));
      }
    }
    // @0x008f2b..0x008f39 : if this atom has an inline CFData blob (+0x28), add its length.
    if (this.dataPayload !== null) {
      // @0x008f34 callq _CFDataGetLength ; @0x008f39 addq %rax,%r14.
      sum = BigInt.asUintN(64, sum + BigInt(CFDataGetLength(this.dataPayload)));
    }
    // @0x008f3c movq %r14,0x10(%rbx) : store the summed payload size.
    this.payloadSize = sum;

    // @0x008f40 cmpq $0,0x20(%rbx) ; je -> only add a box header when a parent exists.
    if (this.parent !== null) {
      // @0x008f47..0x008f4f cmpq $0xFFFFFFFE ; ja -> UNSIGNED (sum > 0xFFFFFFFE) picks the
      //   64-bit "largesize" 16-byte header; otherwise the 32-bit-size 8-byte header.
      if (sum > 0xfffffffen) {
        // @0x008f57 addq $0x10,%r14
        sum = BigInt.asUintN(64, sum + 0x10n);
      } else {
        // @0x008f51 addq $0x8,%r14
        sum = BigInt.asUintN(64, sum + 0x8n);
      }
    }
    // @0x008f5b movq %r14,0x8(%rbx) : store the total box size.
    this.size = sum;
  }

  /**
   * PCAtomBox::setType(unsigned int)
   * @0xADDR ProCore 0x0000000000008ba8  (__ZN9PCAtomBox7setTypeEj)
   *
   * DISASSEMBLY (verbatim):
   *   0x008ba8  pushq %rbp ; movq %rsp,%rbp        ; frame
   *   0x008bac  movl  %esi, 0x18(%rdi)             ; *(u32*)(this+0x18) = arg (type)
   *   0x008baf  popq %rbp ; retq                   ; void
   *   0x008bb1  nop                                 ; alignment padding
   *
   * A plain 32-bit field setter: stores the `unsigned int` type-id argument
   * (%esi) into the atom's type field at +0x18 — the same field read by
   * findFirstChild @0x008fcb (`cmpl %ebx,0x18(%rax)`). Zero callees, no externs.
   * `movl` is a 32-bit store, so we mask the argument to a uint32 to mirror the
   * machine width exactly (PORTING_SPEC Rule 4).
   */
  setType(value: number): void {
    // @0x008bac — movl %esi,0x18(%rdi) : store the u32 type id at +0x18.
    this.type = value >>> 0;
  }
}
