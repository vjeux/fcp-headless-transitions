// FFSemanticMatteNode.ts — faithful transcription of the Flexo class
// FFSemanticMatteNode (a render-graph node driving semantic/AI matte
// generation). Transcribed from the x86_64 slice of the FAT Flexo framework:
//   /Applications/Final Cut Pro.app/Contents/Frameworks/Flexo.framework/
//     Versions/A/Flexo
//
// This file ports ONLY setOutputDOD(HGRect); the rest of the class body is
// tracked by separate ledger entries and will be added here (ADD-ONLY) as
// those units are claimed. One class per file (PORTING_SPEC Rule 6).
//
// Disassembly:
//   raw-port/re/disasm/Flexo.__ZN19FFSemanticMatteNode12setOutputDODE6HGRect.s
//     @Flexo 0x6467a0
//
// STRUCT LAYOUT (recovered from this setter alone):
//   +0x1ac  outputDOD.lo : u64   // movq %rsi, 0x1ac(%rdi)
//   +0x1b4  outputDOD.hi : u64   // movq %rdx, 0x1b4(%rdi)
// The two 8-byte halves are the SysV-by-value HGRect passed in %rsi:%rdx.

/**
 * HGRect — a 16-byte value struct. The SysV ABI passes it by value in two
 * 8-byte GPRs (%rsi:%rdx), which is exactly what setOutputDOD stores verbatim
 * at +0x1ac and +0x1b4 (`movq %rsi,0x1ac(%rdi); movq %rdx,0x1b4(%rdi)`). We
 * model it as two opaque u64s so downstream ports can decode the payload
 * without us guessing byte order here (mirrors HGColorGamma.m2's HGRectValue).
 */
export interface HGRectValue {
  readonly lo: bigint;
  readonly hi: bigint;
}

/**
 * FFSemanticMatteNode — Flexo semantic-matte render node. Only setOutputDOD is
 * ported; the object's other fields will be introduced ADD-ONLY as their
 * touching member functions are ported.
 */
export class FFSemanticMatteNode {
  /** +0x1ac u64 — low 8 bytes of the output domain-of-definition HGRect. */
  outputDOD_lo: bigint = 0n;
  /** +0x1b4 u64 — high 8 bytes of the output domain-of-definition HGRect. */
  outputDOD_hi: bigint = 0n;

  /**
   * `FFSemanticMatteNode::setOutputDOD(HGRect)` — @Flexo 0x6467a0
   * (__ZN19FFSemanticMatteNode12setOutputDODE6HGRect).
   *
   * Stores the 16-byte HGRect (passed by value in %rsi:%rdx) verbatim into the
   * two output-DOD slots. Faithful line-for-line transcription:
   *
   *   0x6467a0  pushq %rbp; movq %rsp,%rbp
   *   0x6467a4  movq  %rsi, 0x1ac(%rdi)     ; this->outputDOD_lo = rect.lo
   *   0x6467ab  movq  %rdx, 0x1b4(%rdi)     ; this->outputDOD_hi = rect.hi
   *   0x6467b2  popq  %rbp; retq
   *
   * No callees, no conversion — a pure two-word field store.
   *
   * @param rect  the output domain-of-definition rectangle.
   */
  setOutputDOD(rect: HGRectValue): void {
    // @0x6467a4  movq %rsi, 0x1ac(%rdi)
    this.outputDOD_lo = rect.lo;
    // @0x6467ab  movq %rdx, 0x1b4(%rdi)
    this.outputDOD_hi = rect.hi;
  }
}
