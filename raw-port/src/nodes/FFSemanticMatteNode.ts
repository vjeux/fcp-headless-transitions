// FFSemanticMatteNode.ts -- Flexo framework.
// FFSemanticMatteNode is a Flexo render-graph node that produces a semantic
// matte (an alpha/selection mask derived from semantic scene analysis). This
// file ports its scheduling-hint setter.
//
// `setLastToExecuteHint(int)` records a scheduling hint on the node: an integer
// that tells the Flexo scheduler this node should be ordered last among a set
// of otherwise-unordered peers (a "last to execute" tie-break hint). The setter
// is a pure field store — it writes the argument to the node's hint field at
// offset +0x1a8 and returns. No callees, no externs.
//
// Verbatim transcription of x86_64 disassembly from FCP's Flexo framework:
//   /Applications/Final Cut Pro.app/Contents/Frameworks/Flexo.framework/Versions/A/Flexo
//
// Source disasm: raw-port/re/disasm/Flexo.__ZN19FFSemanticMatteNode20setLastToExecuteHintEi.s (7 lines)
//
// -----------------------------------------------------------------------------
// FULL DISASM (@Flexo 0x646790  __ZN19FFSemanticMatteNode20setLastToExecuteHintEi)
// -----------------------------------------------------------------------------
//   0x646790  pushq %rbp ; movq %rsp,%rbp        ; frame
//   0x646794  movl  %esi, 0x1a8(%rdi)            ; this->lastToExecuteHint = hint (32-bit store)
//   0x64679a  popq %rbp ; retq                    ; return void
//
// `movl %esi,0x1a8(%rdi)` is a 32-bit store of the int argument (%esi) into the
// field at +0x1a8, so the field is a signed 32-bit int and no other state is
// touched.

export class FFSemanticMatteNode {
  /** +0x1a8 scheduler "last to execute" hint (signed 32-bit int); store target
   *  of setLastToExecuteHint (@Flexo 0x646794 `movl %esi,0x1a8(%rdi)`). */
  lastToExecuteHint = 0;

  /**
   * FFSemanticMatteNode::setLastToExecuteHint(int)
   * @0x646790 Flexo  (__ZN19FFSemanticMatteNode20setLastToExecuteHintEi)
   *
   * Stores the given scheduling hint into the node's +0x1a8 field. Pure setter,
   * returns void.
   *
   * @param hint the "last to execute" scheduling hint (signed 32-bit int).
   */
  setLastToExecuteHint(hint: number): void {
    // @0x646794 movl %esi,0x1a8(%rdi) : this->lastToExecuteHint = (int)hint
    this.lastToExecuteHint = hint | 0;
    // @0x64679a return void
  }
}
