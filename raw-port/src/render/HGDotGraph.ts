// HGDotGraph.ts -- Helium framework Graphviz-style "dot" debug-graph emitter.
// HGDotGraph builds a textual DOT description of Helium's render graph (nodes,
// ranks, edges) for offline debugging. `enable(bool)` is the flag setter that
// turns emission on/off.
//
// Verbatim from FCP's Helium framework:
//   /Applications/Final Cut Pro.app/Contents/Frameworks/Helium.framework/Versions/A/Helium
//
// Decode evidence:
//   re/disasm/Helium.__ZN10HGDotGraph6enableEb.s   @0x8de90  enable(bool)   (THIS unit)
//   re/disasm/Helium.__ZN10HGDotGraphC2Ev.s        @0x8dd90  C2 ctor        (layout evidence)
//   re/disasm/Helium.__ZN10HGDotGraph8footnodeEb.s @0x8deb0  footnode(bool) (layout evidence)
//
// -- STRUCT LAYOUT (recovered from the C2 ctor @0x8dd90) -------------------
//   The ctor initialises two intrusive-list-ish members plus two flag bytes:
//
//   offset  size  field       source (C2 ctor)
//   ------  ----  ----------  --------------------------------------------------
//   +0x00   0x08  listA head  @0x8dd94 leaq 0x8(%rdi),%rax ; @0x8dd9f movq %rax,(%rdi)
//                             (self-referential empty list: head points at +0x08)
//   +0x08   0x10  listA node  @0x8dd9b movups %xmm0,0x8(%rdi)  (16B zeroed)
//   +0x18   0x08  listB head  @0x8dda2 leaq 0x20(%rdi),%rax ; @0x8ddaa movq %rax,0x18(%rdi)
//   +0x20   0x10  listB node  @0x8dda6 movups %xmm0,0x20(%rdi) (16B zeroed)
//   +0x30   0x08  ptr/count   @0x8ddae movq $0x0,0x30(%rdi)
//   +0x38   0x01  enabled     @0x8ddb6 movw $0x100,0x38(%rdi) -> byte 0x38 = 0x00 (false)
//   +0x39   0x01  footnode    @0x8ddb6 (same word) -> byte 0x39 = 0x01 (true)
//   +0x40   0x10  ---         @0x8ddbc movups %xmm0,0x40(%rdi) (16B zeroed)
//   +0x50   0x08  ---         @0x8ddc0 movq $0x0,0x50(%rdi)
//
//   `enable(bool)` writes byte +0x38; `footnode(bool)` (sibling, @0x8deb0) writes
//   byte +0x39. Both are `movb %sil, <off>(%rdi)` -- a single-byte store of the
//   incoming bool argument, no read-back, no return value.

export class HGDotGraph {
  // +0x38: emission-enabled flag (bool). Default 0x00 from the ctor.
  enabled = false;
  // +0x39: footnode flag (bool). Default 0x01 from the ctor. Declared here so the
  //        one modelled member matches the recovered layout; written by the sibling
  //        footnode(bool) @0x8deb0 (separate ledger unit).
  footnode_ = true;

  /**
   * HGDotGraph::enable(bool)
   * @0x8de90 Helium
   *
   * Disasm (7 lines):
   *   0x8de90  pushq %rbp
   *   0x8de91  movq  %rsp, %rbp
   *   0x8de94  movb  %sil, 0x38(%rdi)   ## this->enabled = (arg & 0xff)
   *   0x8de98  popq  %rbp
   *   0x8de99  retq
   *
   * A single-byte store of the incoming bool (%sil = low byte of the second
   * integer arg) into field +0x38. No return value.
   */
  enable(value: boolean): void {
    // @0x8de94  movb %sil, 0x38(%rdi)
    this.enabled = value;
  }
}

