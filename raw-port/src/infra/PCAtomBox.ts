// PCAtomBox — ProCore's QuickTime/ISO-BMFF "atom box" descriptor (type, offset,
// size, payload, parent/child links) used when parsing container files.
//
// This file ports ONLY the default constructor `PCAtomBox::PCAtomBox()` (C1
// complete-object variant). Every other PCAtomBox method (getOffset,
// getHeaderSize, ...) is a separate ledger unit and lands in its own commit,
// extending this same class.
//
// Faithful port of the ProCore x86_64 disassembly. Framework: ProCore, thin
// slice from Final Cut Pro.app/Contents/Frameworks/ProCore.framework/.../ProCore.
//
// Provenance:
//   re/disasm/ProCore.__ZN9PCAtomBoxC1Ev.s      @0x8754  PCAtomBox()   (ctor unit)
//   re/disasm/ProCore.__ZN9PCAtomBox8getChildEi.s @0x8f64 getChild(int) (THIS unit)
//
// -----------------------------------------------------------------------------
// SYMBOL PORTED
// -----------------------------------------------------------------------------
//   * __ZN9PCAtomBoxC1Ev  —  PCAtomBox::PCAtomBox()  @ProCore 0x8754
//
// The ctor is a pure zero-initialiser: it writes zero across the whole object
// (bytes +0x00 .. +0x47) via four 16-byte SSE stores plus one 8-byte store, and
// invokes NO base-class ctor and NO callees (no vptr store => PCAtomBox is a
// plain, non-polymorphic aggregate). Object size = 0x48 (72) bytes.
//
// -----------------------------------------------------------------------------
// FULL DISASM (@ProCore 0x8754)
// -----------------------------------------------------------------------------
//   0x8754  pushq  %rbp
//   0x8755  movq   %rsp, %rbp
//   0x8758  xorps  %xmm0, %xmm0            ; xmm0 = 0
//   0x875b  movups %xmm0, 0xc(%rdi)        ; zero bytes +0x0c .. +0x1b
//   0x875f  movups %xmm0, (%rdi)           ; zero bytes +0x00 .. +0x0f (overlaps +0x0c..0x0f)
//   0x8762  movups %xmm0, 0x20(%rdi)       ; zero bytes +0x20 .. +0x2f
//   0x8766  movups %xmm0, 0x30(%rdi)       ; zero bytes +0x30 .. +0x3f
//   0x876a  movq   $0x0, 0x40(%rdi)        ; zero bytes +0x40 .. +0x47
//   0x8772  popq   %rbp
//   0x8773  retq
//
// The stores cover [0x00,0x1b] ∪ [0x20,0x47]; bytes +0x1c..+0x1f are NOT written
// by the ctor (they fall in the gap between the +0xc/+0x0 pair's end at 0x1b and
// the +0x20 store) — modelled as an untouched hole. All modelled fields start 0.
//
// -----------------------------------------------------------------------------
// STRUCT LAYOUT (offsets pinned by this ctor + sibling accessors)
// -----------------------------------------------------------------------------
//   +0x00  u64  offset      // atom file offset (getOffset() @0x8b54 movq (%rdi))
//   +0x10  u64  dataStart   // payload start (getHeaderSize() @0x8b98 subq 0x10(%rdi))
//   +0x30  ptr  children.begin  // std::vector<PCAtomBox*> data begin (getChild @0x8f68)
//   +0x38  ptr  children.end    // std::vector<PCAtomBox*> data end   (getChild @0x8f6c)
//                              // element size 8 (a pointer); count = (end-begin)>>3.
//   (remaining fields up to +0x48 are zeroed here and named by their own units)

export class PCAtomBox {
  // +0x00  u64 atom file offset. Zeroed by the ctor (@0x875f movups (%rdi)).
  offset: bigint = 0n;
  // +0x10  u64 payload/data start offset. Zeroed by the ctor (@0x875b movups 0xc,
  //        whose 16-byte span [0x0c,0x1b] covers +0x10). Named by getHeaderSize().
  dataStart: bigint = 0n;
  // +0x30/+0x38  std::vector<PCAtomBox*> child atoms, modelled as a JS array of
  //        PCAtomBox references. The binary stores raw begin/end pointers whose
  //        (end-begin)>>3 is the element count; the array's `.length` is the
  //        faithful equivalent. Empty (begin==end) after the ctor's zeroing of
  //        the [0x20,0x47] span (@0x8762/@0x8766). See getChild(int) @0x8f64.
  children: PCAtomBox[] = [];

  /**
   * PCAtomBox::PCAtomBox()   [C1 complete-object constructor]
   * @0x8754 ProCore  (__ZN9PCAtomBoxC1Ev)
   *
   * Zero-initialises the entire 0x48-byte object. No base ctor, no callees, no
   * vptr (non-polymorphic aggregate). The four movups + one movq stores below
   * are the exact zeroing writes; every modelled field is therefore 0/0n.
   */
  constructor() {
    // @0x875f movups %xmm0,(%rdi)   -> +0x00 offset = 0
    this.offset = 0n;
    // @0x875b movups %xmm0,0xc(%rdi) (span [0x0c,0x1b] covers +0x10) -> dataStart = 0
    this.dataStart = 0n;
    // @0x8762 movups 0x20, @0x8766 movups 0x30, @0x876a movq $0 0x40 zero the
    // remaining bytes [0x20,0x47]; those fields are named/added by their own
    // ledger units and default to 0 when this class instantiates. In particular
    // the children vector begin/end (+0x30/+0x38) are zeroed -> empty array.
    this.children = [];
  }

  /**
   * PCAtomBox::getChild(int)
   * @0x8f64 ProCore  (__ZN9PCAtomBox8getChildEi)
   *
   * Bounds-checked accessor into the child-atom vector at +0x30/+0x38. Returns
   * the index-th child pointer, or null (nullptr) when the index is negative or
   * out of range.
   *
   * DECODE (raw-port/re/disasm/ProCore.__ZN9PCAtomBox8getChildEi.s):
   *   0x8f64  testl %esi,%esi ; @0x8f66 js 0x8f87   ; index < 0 (signed) -> null
   *   0x8f68  movq  0x30(%rdi),%rax                 ; rax = children.begin
   *   0x8f6c  movq  0x38(%rdi),%rcx                 ; rcx = children.end
   *   0x8f70  subq  %rax,%rcx                       ; rcx = end - begin (bytes)
   *   0x8f73  shrq  $0x3,%rcx                        ; rcx = count = bytes / 8
   *   0x8f77  cmpl  %ecx,%esi ; @0x8f79 jge 0x8f87  ; index >= count (signed) -> null
   *   0x8f7f  movl  %esi,%ecx                        ; rcx = index (zero-extended)
   *   0x8f81  movq  (%rax,%rcx,8),%rax               ; rax = *(begin + index*8) = children[index]
   *   0x8f86  retq                                   ; return it
   *   0x8f87  xorl  %eax,%eax ; retq                 ; return nullptr
   *
   * The element size is 8 bytes (a raw PCAtomBox* pointer); the `>>3` recovers
   * the count from the byte span. No callees, no externs. Modelled over the
   * `children` array; nullptr maps to null.
   */
  getChild(index: number): PCAtomBox | null {
    // @0x8f64 testl %esi,%esi ; @0x8f66 js -> null  (signed: negative index)
    if ((index | 0) < 0) {
      return null;
    }
    // @0x8f68/@0x8f6c/@0x8f70/@0x8f73  count = (end - begin) >> 3  (8-byte ptrs)
    const count = this.children.length;
    // @0x8f77 cmpl %ecx,%esi ; @0x8f79 jge -> null  (signed: index >= count)
    if ((index | 0) >= count) {
      return null;
    }
    // @0x8f81 movq (%rax,%rcx,8),%rax : children[index]
    return this.children[index];
  }
}
