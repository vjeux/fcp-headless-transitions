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
//   re/disasm/Helium.__ZN10HGDotGraphC1Ev.s         @0x8ddd0  C1 ctor
//   re/disasm/Helium.__ZN10HGDotGraphC2Ev.s         @0x8dd90  C2 ctor    (identical body / layout evidence)
//   re/disasm/Helium.__ZN10HGDotGraph8footnodeEb.s  @0x8deb0  footnode(bool)
//   re/disasm/Helium.__ZN10HGDotGraph9beginRankEv.s @0x8efb0  beginRank()
//   re/disasm/Helium.__ZN10HGDotGraph7endRankEv.s   @0x8f070  endRank()
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
//   +0x30   0x08  ptr/count / output FILE*  @0x8ddae movq $0x0,0x30(%rdi)
//                             (guard read by beginRank; the open output FILE* used by endRank)
//   +0x38   0x01  enabled     @0x8ddb6 movw $0x100,0x38(%rdi) -> byte 0x38 = 0x00 (false)
//   +0x39   0x01  footnode    @0x8ddb6 (same word) -> byte 0x39 = 0x01 (true)
//   +0x40   0x10  std::string rankBuf  @0x8ddbc movups %xmm0,0x40(%rdi) (16B zeroed = empty
//                             libc++ SSO string). beginRank() calls
//                             (this+0x40).assign("{rank=same; ") on it (@0x8efc1..0x8efcd);
//                             endRank() append("}\n")s and fputs it out (@0x8f083..0x8f0bb).
//   +0x50   0x08  ---         @0x8ddc0 movq $0x0,0x50(%rdi)  (libc++ long-string heap ptr slot)
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

  // +0x00 listA head / +0x08 listA node  (self-referential empty intrusive list)
  // +0x18 listB head / +0x20 listB node  (self-referential empty intrusive list)
  // Modelled as {prev,next} nodes whose head points at the node (empty-list sentinel).
  listA: { prev: unknown; next: unknown } = { prev: null, next: null };
  listB: { prev: unknown; next: unknown } = { prev: null, next: null };

  // +0x30: ptr/count guard read by beginRank() (@0x8ddae `movq $0x0,0x30(%rdi)` ctor init)
  //        AND the open output FILE* handle used by endRank(). Same 8-byte cell,
  //        modelled by two aliases: `rankListPtr` (beginRank's non-null guard) and
  //        `outputFile` (endRank's FILE* handle). 0/null/undefined = empty/no file.
  rankListPtr: number | bigint = 0;
  // +0x30 output FILE* handle. `null` = no open file (fopen failed / not begun),
  // matching the ctor's movq $0x0,0x30 and the null-guards in begin/endRank.
  outputFile: unknown = null;

  // +0x40: std::string accumulating the current "{rank=same; ...}" line. Empty (SSO) from ctor.
  //        begin/beginRank/rank/endRank treat the 16-byte cell at +0x40 as a basic_string;
  //        `rankBuf` models its logical char contents (SSO/long detail lives in the libc++
  //        ABI, out of scope). Empty-initialised by the ctor (movups zero @0x8ddfc).
  rankBuf = "";
  // +0x50 libc++ long-string heap ptr slot; zero-initialised by the ctor.
  field50: unknown = null;

  /**
   * HGDotGraph::HGDotGraph()  [C1 complete-object constructor]
   * @0x8ddd0 Helium  (body byte-for-byte identical to C2 @0x8dd90)
   *
   * Disasm (17 lines):
   *   0x8ddd0  pushq %rbp
   *   0x8ddd1  movq  %rsp, %rbp
   *   0x8ddd4  leaq  0x8(%rdi), %rax
   *   0x8ddd8  xorps %xmm0, %xmm0
   *   0x8dddb  movups %xmm0, 0x8(%rdi)   ## zero listA node (+0x08 .. +0x17)
   *   0x8dddf  movq  %rax, (%rdi)        ## listA head (+0x00) = &node (+0x08)
   *   0x8dde2  leaq  0x20(%rdi), %rax
   *   0x8dde6  movups %xmm0, 0x20(%rdi)  ## zero listB node (+0x20 .. +0x2f)
   *   0x8ddea  movq  %rax, 0x18(%rdi)    ## listB head (+0x18) = &node (+0x20)
   *   0x8ddee  movq  $0x0, 0x30(%rdi)    ## +0x30 = 0 (rankListPtr / outputFile)
   *   0x8ddf6  movw  $0x100, 0x38(%rdi)  ## byte +0x38 = 0x00 (enabled=false),
   *                                      ## byte +0x39 = 0x01 (footnode=true)
   *   0x8ddfc  movups %xmm0, 0x40(%rdi)  ## zero rankBuf (+0x40 .. +0x4f)
   *   0x8de00  movq  $0x0, 0x50(%rdi)    ## field50 = 0
   *   0x8de08  popq  %rbp
   *   0x8de09  retq
   *
   * No callees (all inline stores); no base-class ctor invoked -- HGDotGraph
   * has no polymorphic base (no vptr store). The two self-referential list
   * heads make empty doubly-linked lists whose head element IS the sentinel
   * node embedded in the object.
   */
  constructor() {
    // @0x8dddb/@0x8dddf listA: empty list, head = embedded node
    this.listA = { prev: null, next: null };
    this.listA.prev = this.listA;
    this.listA.next = this.listA;
    // @0x8dde6/@0x8ddea listB: empty list, head = embedded node
    this.listB = { prev: null, next: null };
    this.listB.prev = this.listB;
    this.listB.next = this.listB;
    // @0x8ddee +0x30 = 0 (rankListPtr / outputFile)
    this.rankListPtr = 0;
    this.outputFile = null;
    // @0x8ddf6 movw $0x100 -> byte 0x38 = 0 (enabled), byte 0x39 = 1 (footnode)
    this.enabled = false;
    this.footnode_ = true;
    // @0x8ddfc rankBuf = empty std::string (movups zero)
    this.rankBuf = "";
    // @0x8de00 field50 = 0
    this.field50 = null;
  }

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

  /**
   * HGDotGraph::endRank()
   * @0x8f070 Helium
   *
   * Disasm (26 lines, raw-port/re/disasm/Helium.__ZN10HGDotGraph7endRankEv.s):
   *   0x8f070  cmpb  $0x1, 0x38(%rdi)      ## enabled == 1 ?
   *   0x8f074  jne   0x8f0b6               ##   no  -> retq (do nothing)
   *   0x8f076  cmpq  $0x0, 0x30(%rdi)      ## outputFile == 0 ?
   *   0x8f07b  je    0x8f0b6              ##   yes -> retq (no open file)
   *   0x8f07d  pushq %rbp                  ## --- do the work ---
   *   0x8f07e  movq  %rsp, %rbp
   *   0x8f081  pushq %rbx
   *   0x8f082  pushq %rax
   *   0x8f083  leaq  0x40(%rdi), %rax      ## rax = &this->rankBuf  (std::string @+0x40)
   *   0x8f087  leaq  0x82bbd8(%rip), %rsi  ## rsi = "}\n"   (literal pool)
   *   0x8f08e  movq  %rdi, %rbx            ## rbx = this
   *   0x8f091  movq  %rax, %rdi            ## rdi = &rankBuf
   *   0x8f094  callq __ZNSt3__1..append..EPKc  ## rankBuf.append("}\n")
   *   0x8f099  movq  %rbx, %rdi            ## rdi = this
   *   0x8f09c  movq  0x30(%rbx), %rsi      ## rsi = this->outputFile  (fputs arg2 = FILE*)
   *   0x8f0a0  testb $0x1, 0x40(%rbx)      ## SSO flag: low bit of byte +0x40 (long-string?)
   *   0x8f0a4  leaq  0x8(%rsp), %rsp       ## (epilogue interleaved)
   *   0x8f0a9  popq  %rbx
   *   0x8f0aa  popq  %rbp
   *   0x8f0ab  jne   0x8f0b7              ## long form -> use heap ptr at +0x50
   *   0x8f0ad  addq  $0x41, %rdi           ## short form: data = this + 0x41 (inline SSO buf)
   *   0x8f0b1  jmp   0x3c5132              ## tail: fputs(shortData, FILE*)
   *   0x8f0b6  retq                        ## early-out target
   *   0x8f0b7  movq  0x50(%rdi), %rdi      ## long form: data = this->field50 (heap ptr @+0x50)
   *   0x8f0bb  jmp   0x3c5132              ## tail: fputs(longData, FILE*)
   *
   * Closes the current `{rank=same; ...}` DOT statement: appends the closing
   * "}\n" to the pending rank line (the std::string at +0x40 that beginRank()
   * @0x8efb0 assigned "{rank=same; " and rank() @0x8efe0 appended node ids to),
   * then writes the whole line out to the open FILE* at +0x30 via fputs. The
   * SSO-flag test at 0x8f0a0 selects the C-string data pointer (inline vs heap),
   * which is a libc++ std::string internal — logically it is just the string's
   * NUL-terminated char data, so we hand `rankBuf` straight to the fputs stub.
   * Guarded by the same (enabled && file-open) precondition as begin/beginRank.
   */
  endRank(): void {
    // @0x8f070  cmpb $0x1,0x38 ; jne retq  -- only when emission is enabled
    if (!this.enabled) {
      return;
    }
    // @0x8f076  cmpq $0x0,0x30 ; je retq   -- only when an output FILE* is open
    if (this.outputFile === null) {
      return;
    }
    // @0x8f094  (&rankBuf)->append("}\n")  -- std::string::append(const char*)
    this.rankBuf = std_string_append(this.rankBuf, "}\n");
    // @0x8f09c rsi = outputFile ; @0x8f0a0 SSO-flag test selects the char* data,
    // which is just rankBuf's NUL-terminated contents either way.
    // @0x8f0b1 / @0x8f0bb  jmp fputs(data, FILE*)
    libSystem_fputs(this.rankBuf, this.outputFile);
  }

  /**
   * HGDotGraph::rank(void const*)
   * @0x8efe0 Helium  (mangled __ZN10HGDotGraph4rankEPKv)
   *
   * Disasm (raw-port/re/disasm/Helium.__ZN10HGDotGraph4rankEPKv.s — 39 lines):
   *   0x8efe0  pushq %rbp ; movq %rsp,%rbp ; pushq %r14 ; pushq %rbx ; subq $0x30,%rsp
   *   0x8efeb  movq ___stack_chk_guard(%rip),%rax ; movq (%rax),%rax ; movq %rax,-0x18(%rbp)
   *                                          ## load stack canary (libc hardening)
   *   0x8eff9  cmpb $0x1, 0x38(%rdi)         ## enabled == true ?
   *   0x8effd  jne  0x8f044                  ##   no  -> skip to canary-check/return
   *   0x8efff  cmpq $0x0, 0x30(%rdi)         ## rankListPtr (+0x30) == 0 ?
   *   0x8f004  je   0x8f044                  ##   yes -> skip
   *   ; --- do the work (enabled && rank list live) ---
   *   0x8f006  movq %rsi,%rcx               ## rcx = ptr (the void const* argument = %rsi)
   *   0x8f009  leaq "_%p"(%rip),%rdx         ## rdx = format "_%p"  (literal pool)
   *   0x8f010  leaq -0x40(%rbp),%rbx         ## rbx = &stack buffer (32 bytes)
   *   0x8f014  movl $0x20,%esi              ## esi = 32  (snprintf size)
   *   0x8f019  movq %rdi,%r14               ## r14 = this
   *   0x8f01c  movq %rbx,%rdi               ## rdi = &stack buffer
   *   0x8f01f  xorl %eax,%eax              ## al = 0 (variadic FP-count)
   *   0x8f021  callq _snprintf             ## snprintf(buf, 32, "_%p", ptr)
   *   0x8f026  addq $0x40,%r14             ## r14 = &this->rankBuf  (std::string @ +0x40)
   *   0x8f02a  movq %r14,%rdi ; movq %rbx,%rsi
   *   0x8f030  callq std::string::append(const char*)  ## rankBuf.append(buf)
   *   0x8f035  leaq " "(%rip),%rsi          ## rsi = " "  (single-space literal)
   *   0x8f03c  movq %r14,%rdi
   *   0x8f03f  callq std::string::append(const char*)  ## rankBuf.append(" ")
   *   0x8f044  movq ___stack_chk_guard(%rip),%rax ; movq (%rax),%rax
   *   0x8f04e  cmpq -0x18(%rbp),%rax ; jne 0x8f05d  ## canary check
   *   0x8f054  addq $0x30,%rsp ; popq %rbx ; popq %r14 ; popq %rbp ; retq
   *   0x8f05d  callq ___stack_chk_fail      ## corruption -> hardened abort
   *
   * Appends the DOT node id for `ptr` to the pending rank line: when emission is
   * `enabled` (+0x38 == 1) AND a rank list is live (+0x30 != 0), it formats the
   * pointer with `snprintf(buf, 32, "_%p", ptr)` (an id like "_0x600001234000")
   * and appends `buf` then a `" "` separator to the rank-line std::string at
   * +0x40 (the same buffer beginRank() assigns and endRank() flushes). Both
   * appends are libc++ std::basic_string::append(const char*) — the out-of-scope
   * STL boundary already modelled by `std_string_append` (string concat). The
   * `snprintf` "_%p" formatting is a libc extern, modelled by `snprintf_p` below.
   *
   * The `___stack_chk_guard`/`___stack_chk_fail` pair protects the 32-byte native
   * `snprintf` stack buffer; JS has no such buffer so the canary is a no-op
   * citation (there is nothing to corrupt).
   *
   * @param ptr the node's `void const*` identity (its address). Modelled as a
   *   bigint/number address purely for the "_%p" formatting; its value is never
   *   dereferenced.
   */
  rank(ptr: bigint | number): void {
    // @0x8eff9 cmpb $0x1,0x38 ; jne 0x8f044  -- only when emission is enabled.
    if (this.enabled !== true) return;
    // @0x8efff cmpq $0x0,0x30 ; je 0x8f044   -- only when a rank list is live.
    if (this.rankListPtr === 0 || this.rankListPtr === 0n) return;

    // @0x8f009 fmt = "_%p" ; @0x8f014 size = 0x20 ; @0x8f021 snprintf(buf, 32, "_%p", ptr).
    const buf = snprintf_p(ptr);
    // @0x8f026 r14 = &this->rankBuf ; @0x8f030 rankBuf.append(buf).
    this.rankBuf = std_string_append(this.rankBuf, buf);
    // @0x8f035 rsi = " " ; @0x8f03f rankBuf.append(" ").
    this.rankBuf = std_string_append(this.rankBuf, " ");
    // @0x8f044..0x8f05c canary check (no-op in JS) then return (void).
  }
}

// -----------------------------------------------------------------------------
// Undecoded / out-of-scope external stubs.
// -----------------------------------------------------------------------------

/**
 * `std::__1::basic_string<char>::append(const char*)` — libc++ (out-of-scope
 * STL boundary). Called by endRank @0x8f094 (and rank/beginRank) via the Helium
 * symbol-stub at 0x3c4e38. Semantics: concatenate the NUL-terminated C string
 * `s` onto `self`. Modelled faithfully as string concatenation; the SSO/heap
 * storage detail (byte +0x40 flag, +0x50 heap ptr) is a libc++ ABI internal
 * outside the 5-framework port scope.
 */
function std_string_append(self: string, s: string): string {
  // @0x8f094 append(const char*): appends the C string, returns *this.
  return self + s;
}

/**
 * `snprintf(buf, 32, "_%p", ptr)` — libSystem/libc (out-of-scope formatting
 * boundary). Called by rank() @0x8f021 via the Helium symbol-stub at 0x3c55e8.
 * Produces the DOT node id: a leading `_` followed by the `%p` rendering of the
 * pointer. On macOS/Darwin `%p` prints `0x` + lowercase hex of the address (a
 * null pointer prints `0x0`). Modelled faithfully as that string; the address
 * is never dereferenced. The 32-byte size cap is documented for fidelity — a
 * 64-bit `_0x...` id is at most 15 chars so truncation never triggers here.
 */
function snprintf_p(ptr: bigint | number): string {
  // @0x8f009 "_%p" ; @0x8f021 snprintf(buf, 0x20, "_%p", ptr).
  const addr = typeof ptr === "bigint" ? ptr : BigInt(ptr >>> 0);
  const s = "_0x" + addr.toString(16);
  // @0x8f014 size = 0x20 (32): snprintf truncates to 31 chars + NUL.
  return s.length > 31 ? s.substring(0, 31) : s;
}

/**
 * `fputs(const char*, FILE*)` — libSystem/libc (out-of-scope I/O boundary).
 * Called by endRank @0x8f0b1 / @0x8f0bb via the Helium symbol-stub at 0x3c5132.
 * Writes the NUL-terminated string to the given FILE stream. There is no
 * faithful in-engine equivalent for a real libc FILE* write; this is a true
 * out-of-scope extern, so the boundary throws with its call-site addresses.
 */
function libSystem_fputs(_data: string, _file: unknown): number {
  throw new Error(
    "fputs(const char*, FILE*) not yet transcribed @0x8f0b1/@0x8f0bb " +
      "(libSystem stub 0x3c5132 — TRUE out-of-scope libc I/O extern)",
  );
}
