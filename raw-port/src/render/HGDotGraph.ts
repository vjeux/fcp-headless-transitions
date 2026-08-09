// HGDotGraph.ts -- Helium framework Graphviz-style "dot" debug-graph emitter.
// HGDotGraph builds a textual DOT description of Helium's render graph (nodes,
// ranks, edges) for offline debugging. `enable(bool)` is the flag setter that
// turns emission on/off.
//
// Verbatim from FCP's Helium framework:
//   /Applications/Final Cut Pro.app/Contents/Frameworks/Helium.framework/Versions/A/Helium
//
// Decode evidence:
//   re/disasm/Helium.__ZN10HGDotGraph6enableEb.s    @0x8de90  enable(bool)
//   re/disasm/Helium.__ZN10HGDotGraphC2Ev.s         @0x8dd90  C2 ctor    (layout evidence)
//   re/disasm/Helium.__ZN10HGDotGraph8footnodeEb.s  @0x8deb0  footnode(bool)
//   re/disasm/Helium.__ZN10HGDotGraph9beginRankEv.s @0x8efb0  beginRank()  (THIS unit)
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
//   +0x40   0x10  std::string rankBuf  @0x8ddbc movups %xmm0,0x40(%rdi) (16B zeroed = empty
//                             libc++ SSO string). beginRank() calls
//                             (this+0x40).assign("{rank=same; ") on it (@0x8efc1..0x8efcd).
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
  // +0x30: ptr/count guard read by beginRank() (@0x8ddae `movq $0x0,0x30(%rdi)` ctor init).
  //        A non-null value here (a live rank list) is required before a "{rank=same; "
  //        prefix is emitted. Modelled as a nullable pointer-sized field; 0/undefined = empty.
  rankListPtr: number | bigint = 0;
  // +0x40: std::string accumulating the current "{rank=same; ...}" line. Empty (SSO) from ctor.
  rankBuf = "";

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

  /**
   * HGDotGraph::footnode(bool)
   * @0x8deb0 Helium  (mangled __ZN10HGDotGraph8footnodeEb)
   *
   * Disasm (5 real instructions after the frame prologue):
   *   0x8deb0  pushq %rbp
   *   0x8deb1  movq  %rsp, %rbp
   *   0x8deb4  movb  %sil, 0x39(%rdi)   ## this->footnode_ = (arg & 0xff)
   *   0x8deb8  popq  %rbp
   *   0x8deb9  retq
   *
   * Sibling 1-byte setter to enable(); stores the low byte of the bool argument
   * (%sil) into field +0x39. No return value.
   */
  footnode(value: boolean): void {
    // @0x8deb4  movb %sil, 0x39(%rdi)
    this.footnode_ = value;
  }

  /**
   * HGDotGraph::beginRank()
   * @0x8efb0 Helium  (mangled __ZN10HGDotGraph9beginRankEv)
   *
   * Disasm (11 real instructions):
   *   0x8efb0  pushq %rbp
   *   0x8efb1  movq  %rsp, %rbp
   *   0x8efb4  cmpb  $0x1, 0x38(%rdi)        ## enabled == true ?
   *   0x8efb8  jne   0x8efd2                 ## if not enabled -> return
   *   0x8efba  cmpq  $0x0, 0x30(%rdi)        ## rankListPtr == 0 ?
   *   0x8efbf  je    0x8efd2                 ## if null -> return
   *   0x8efc1  addq  $0x40, %rdi             ## &this->rankBuf  (std::string @ +0x40)
   *   0x8efc5  leaq  0x84c6a6(%rip), %rsi    ## "{rank=same; "  (literal pool)
   *   0x8efcc  popq  %rbp
   *   0x8efcd  jmp   __ZNSt3__1...6assignEPKc  ## tail-call std::string::assign(const char*)
   *   0x8efd2  popq  %rbp                    ## (early-return path)
   *   0x8efd3  retq
   *
   * Guarded action: only when emission is `enabled` (+0x38 == 1) AND a rank list
   * is live (+0x30 != 0) does it (re)assign the rank-line buffer (+0x40) to the
   * literal "{rank=same; ". The store is a tail-jmp into libc++
   * std::basic_string::assign(const char*) — an out-of-scope STL boundary
   * (std::__1::basic_string), modelled here as a plain TS string assignment.
   */
  beginRank(): void {
    // @0x8efb4  cmpb $0x1, 0x38(%rdi) ; jne  -> require enabled == true
    if (this.enabled !== true) return;
    // @0x8efba  cmpq $0x0, 0x30(%rdi) ; je   -> require rankListPtr != 0
    if (this.rankListPtr === 0 || this.rankListPtr === 0n) return;
    // @0x8efc1 addq $0x40,%rdi ; @0x8efc5 leaq "{rank=same; " ; @0x8efcd jmp
    //   std::__1::basic_string::assign(const char*)  [libc++ STL boundary]
    this.rankBuf = "{rank=same; ";
  }
}

