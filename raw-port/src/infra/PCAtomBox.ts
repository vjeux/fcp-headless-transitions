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
//   re/disasm/ProCore.__ZN9PCAtomBoxC1Ev.s  @0x8754  PCAtomBox()  (THIS unit)
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
//   (remaining fields up to +0x48 are zeroed here and named by their own units)

export class PCAtomBox {
  // +0x00  u64 atom file offset. Zeroed by the ctor (@0x875f movups (%rdi)).
  offset: bigint = 0n;
  // +0x10  u64 payload/data start offset. Zeroed by the ctor (@0x875b movups 0xc,
  //        whose 16-byte span [0x0c,0x1b] covers +0x10). Named by getHeaderSize().
  dataStart: bigint = 0n;

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
    // ledger units and default to 0 when this class instantiates.
  }
}
