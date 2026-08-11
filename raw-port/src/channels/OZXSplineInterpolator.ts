// OZXSplineInterpolator — X-spline keyframe interpolator (ProChannel.framework).
// Faithful transcription. This file currently ports ONE method:
//
//   OZXSplineInterpolator::operator==(OZXSplineInterpolator const&)  @ProChannel 0x45fd0
//   mangled: __ZN21OZXSplineInterpolatoreqERKS_
//
// Decode evidence in this worktree (regenerate with
//   `bash raw-port/tools/disasm.sh --sym <mangled> ProChannel`):
//   raw-port/re/disasm/ProChannel.__ZN21OZXSplineInterpolatoreqERKS_.s        (the ported body)
//   raw-port/re/disasm/ProChannel.__ZN21OZXSplineInterpolatorC2Ev.s           (layout: ctor)
//   raw-port/re/disasm/ProChannel.__ZN21OZXSplineInterpolatorC2ERKS_.s        (layout: copy ctor)
//   raw-port/re/disasm/ProChannel.__ZN21OZXSplineInterpolatoraSERKS_.s        (layout: operator=)
//   raw-port/re/disasm/ProChannel.__ZN21OZXSplineInterpolator4initER8OZSplineRK6CMTime.s
//   raw-port/re/disasm/ProChannel.__ZN21OZXSplineInterpolator14initTempArraysER8OZSplineRK6CMTime.s
//   raw-port/re/disasm/ProChannel.__ZN21OZXSplineInterpolator11evalXSplineER8OZSplinedRK6CMTime.s
//
// ── Struct layout, recovered from those disassemblies (offsets are the addresses the
//    instructions actually touch; nothing here is inferred from a header) ────────────────────
//   +0x00  vtable ptr   — installed by the ctor @ProChannel 0x45e8e/0x45e95
//                         (`leaq 0x9085b(%rip),%rax ; movq %rax,(%rbx)`; the class vtable symbol
//                         is at ProChannel 0xd66e0). The base OZInterpolator ctor runs first
//                         (call @ProChannel 0x45e89).
//   +0x08  std::vector<void*> tempVertices — begin +0x08, end +0x10, cap_end +0x18.
//                         Zeroed as a unit by the ctor @ProChannel 0x45e9b/0x45e9f
//                         (`movups %xmm0,0x8(%rbx)` + `movups %xmm0,0x14(%rbx)`), and filled by
//                         initTempArrays @ProChannel 0x4614e:
//                           `movq 0x8(%rdi),%rax ; movq %rax,0x10(%rdi)` @0x4617b/0x4617f = clear,
//                           `vector<void*>::reserve(count)` @0x4618a with count read from +0x20
//                           (`movslq 0x20(%rdi),%rsi` @0x46183), then push_back of each valid
//                           spline vertex (@0x461b1 / @0x461da / @0x46205).
//                         operator= @ProChannel 0x45fc6/0x45fca clears it the same way
//                         (`movq 0x8(%rdi),%rax ; movq %rax,0x10(%rdi)`).
//   +0x20  int32  count  — written by init @ProChannel 0x46136 as
//                         `OZSpline::getNumberOfValidVertices(t) + (spline.periodicByte ^ 1)`
//                         (`movzbl 0x90(%rsi),%r15d` @0x4611c, `xorl $0x1,%r15d` @0x4612f,
//                          `addl %eax,%r15d` @0x46133). Read as a 32-bit int everywhere:
//                         `movl 0x20(%r14),%ecx` @0x462fe, `idivl 0x20(%r14)` @0x46340, …
//   +0x24  uint8  modeFlag — set to 1 by the default ctor @ProChannel 0x45ea3
//                         (`movb $0x1,0x24(%rbx)`), copied verbatim by the copy ctor
//                         (@0x45f0f/0x45f12) and by operator= (@0x45fc0/0x45fc3). Its only
//                         consumer is evalXSpline's `cmpb $0x1,0x24(%r14) ; jne 0x4661b`
//                         @ProChannel 0x4659a, which selects between two X-spline blending-function
//                         branches. This port models it as the RAW BYTE the compares read, not as a
//                         TS boolean, because operator== compares it with `cmpb` (a full 8-bit
//                         compare), not with a truthiness test.
//
// Note on what operator== does NOT compare: the +0x08 vector (tempVertices) is untouched by the
// body below — the machine code reads exactly two fields, +0x24 then +0x20, and nothing else.
// That is transcribed as-is; the temp-vertex cache is derived state re-filled by initTempArrays.

/**
 * OZXSplineInterpolator instance state — the byte offsets in the table above.
 * (+0x00 is the vtable pointer and is not modelled; TS dispatch replaces it.)
 */
export interface OZXSplineInterpolatorState {
  /** +0x08 std::vector<void*> — temp array of valid spline vertex pointers (begin/end/cap at
   *  +0x08/+0x10/+0x18), filled by initTempArrays @ProChannel 0x4614e. NOT read by operator==. */
  tempVertices: unknown[];
  /** +0x20 int32 — vertex count, written by init @ProChannel 0x46136. */
  count: number;
  /** +0x24 uint8 — blending-branch selector byte; ctor default 1 @ProChannel 0x45ea3, read by
   *  evalXSpline @ProChannel 0x4659a. Compared as a raw byte by operator==. */
  modeFlag: number;
}

/**
 * OZXSplineInterpolator::operator==(OZXSplineInterpolator const&)  @ProChannel 0x45fd0
 *
 * Full disassembly (14 lines, zero callees — the whole function is two compares):
 *   0x45fd0  pushq %rbp                        ; prologue
 *   0x45fd1  movq  %rsp, %rbp
 *   0x45fd4  movb  0x24(%rdi), %al             ; al = this->modeFlag        (+0x24, byte)
 *   0x45fd7  cmpb  0x24(%rsi), %al             ; flags <- al - other->modeFlag  (AT&T: dst-src)
 *   0x45fda  jne   0x45fe7                     ; bytes differ -> return false
 *   0x45fdc  movl  0x20(%rdi), %eax            ; eax = this->count          (+0x20, int32)
 *   0x45fdf  cmpl  0x20(%rsi), %eax            ; flags <- eax - other->count
 *   0x45fe2  sete  %al                         ; al = (this->count == other->count)
 *   0x45fe5  jmp   0x45fe9                     ; -> epilogue
 *   0x45fe7  xorl  %eax, %eax                  ; al = 0  (false)
 *   0x45fe9  popq  %rbp
 *   0x45fea  retq                              ; returns bool in AL
 *
 * So the predicate is exactly: `this->modeFlag == other->modeFlag && this->count == other->count`,
 * with the +0x24 test done FIRST and short-circuiting (`jne` @0x45fda). Both compares are exact
 * integer compares of the widths the instructions use: `cmpb` = 8-bit (masked with 0xff here),
 * `cmpl` = 32-bit (coerced with `| 0` here), so a count that differs only above bit 31 compares
 * EQUAL exactly as the machine does.
 */
export function operatorEquals(
  self: OZXSplineInterpolatorState,
  other: OZXSplineInterpolatorState,
): boolean {
  // @0x45fd4 movb 0x24(%rdi),%al / @0x45fd7 cmpb 0x24(%rsi),%al / @0x45fda jne 0x45fe7
  if ((self.modeFlag & 0xff) !== (other.modeFlag & 0xff)) {
    return false; // @0x45fe7 xorl %eax,%eax
  }
  // @0x45fdc movl 0x20(%rdi),%eax / @0x45fdf cmpl 0x20(%rsi),%eax / @0x45fe2 sete %al
  return (self.count | 0) === (other.count | 0);
}
