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
//   findFirstChild(int, unsigned int)  @0x008f8a  (__ZN9PCAtomBox14findFirstChildEij)
//
// ── Decoded struct layout (only the fields this unit touches are pinned here;
//    the remaining fields are added by their own ledger units) ──────────────
//
//   +0x00  u64          offset      // byte offset of this atom within its container file.
//                                   // Read by getOffset @0x008b58 (`movq (%rdi),%rax`), written
//                                   // by setOffset(unsigned long long) — a full 64-bit value,
//                                   // so it is modelled as a bigint (a large file offset can
//                                   // exceed 2^53). See PORTING_SPEC Rule 4.
//   +0x08  void*        validity    // non-null guard read by findFirstChild @0x008fab
//                                   // (`cmpq $0,0x8(%rdi); je return-null`). Modelled as a
//                                   // boolean/opaque presence flag; when falsy findFirstChild
//                                   // returns null immediately.
//   +0x18  int          type        // this atom's 4CC/type id (child match key). Compared in
//                                   // findFirstChild @0x008fcb (`cmpl %ebx,0x18(%rax)`).
//   +0x30  PCAtomBox*[] childrenBeg // begin ptr of the children pointer-vector (@0x008f98).
//   +0x38  PCAtomBox*[] childrenEnd // end ptr (@0x008f9c). count = (end-beg)>>3 (8-byte ptrs).
//                                   // Modelled together as `children: (PCAtomBox|null)[]`.

export class PCAtomBox {
  // +0x00  u64 file offset of this atom (see setOffset(unsigned long long)).
  offset: bigint = 0n;

  // +0x08  non-null validity/parent guard read by findFirstChild @0x008fab. Modelled as
  //        a presence flag; findFirstChild returns null early when it is falsy.
  validity: unknown = null;

  // +0x18  int  this atom's type id (child match key), compared @0x008fcb in findFirstChild.
  type: number = 0;

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
}
