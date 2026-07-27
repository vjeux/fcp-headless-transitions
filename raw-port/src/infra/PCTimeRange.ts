// PCTimeRange.ts — ProCore time range: a CMTime `start` plus a CMTime `duration`, mirroring
// CoreMedia's CMTimeRange but implemented in ProCore. All methods here are transcribed from the
// FCP Ozone framework binary (Final Cut Pro.app/.../Ozone), matching the x86_64 disassembly
// line-for-line (SaferAdd/SaferSubtract/Compare call order and argument order preserved).
//
// DECODE: raw-port/re/disasm/PCTimeRange.{getEnd,contains,operator!=,setOffsetEnd}.s
//
// Struct layout (recovered from ctor-free accessor reads at +0x00/+0x10/+0x18/+0x28 in every
// method disasm — each CMTime is 24 bytes: value(i64) + timescale(i32)+flags(u32) + epoch(i64)):
//   +0x00 start.value       (int64 — read as `movups (%rdi), %xmm0` covers value+timescale+flags)
//   +0x08 start.timescale/flags
//   +0x10 start.epoch       (`movq 0x10(%rdi), %rax`)
//   +0x18 duration.value    (`movups 0x18(%rdi), %xmm0`)
//   +0x20 duration.timescale/flags
//   +0x28 duration.epoch    (`movq 0x28(%rdi), %rax`)
// Total sizeof(PCTimeRange) = 0x30 (48 bytes) — matches CoreMedia CMTimeRange sizeof.

import {
  type CMTime,
  CMTimeCompare,
  PC_CMTimeSaferAdd,
  PC_CMTimeSaferSubtract,
} from "./CMTime";

export interface PCTimeRange {
  start: CMTime;      // +0x00 .. +0x17
  duration: CMTime;   // +0x18 .. +0x2f
}

/**
 * PCTimeRange::getEnd(CMTime const&) const  →  CMTime
 * @Ozone 0x0000000000067700  (__ZNK11PCTimeRange6getEndERK6CMTime)
 *
 * DECODE (raw-port/re/disasm/PCTimeRange.getEnd.s):
 *   0x67714-0x6772f  copy this->start (movups (%rsi)/movq 0x10(%rsi)) and this->duration
 *                    (movups 0x18(%rsi)/movq 0x28(%rsi)) onto the stack as two 24-byte CMTimes
 *   0x67733-0x67752  spill both CMTimes as call args (start at (%rsp), duration at 0x18(%rsp))
 *   0x67756-0x6775a  leaq -0x68(%rbp), %rdi ; call _PC_CMTimeSaferAdd  (sret = tmp)
 *                        → tmp = PC_CMTimeSaferAdd(this->start, this->duration)     @CMTime.ts
 *   0x6775f-0x6778e  copy arg (r14 = CMTime const&) and the tmp result onto the stack; tmp is
 *                    reloaded from -0x68 (xmm0 = value+ts+flags) and -0x58 (rax = epoch)
 *   0x67792-0x67795  movq %rbx, %rdi ; call _PC_CMTimeSaferSubtract  (sret = %rbx, the outer sret)
 *                        → *this_sret = PC_CMTimeSaferSubtract(tmp, arg)            @CMTime.ts
 *   0x6779a          movq %rbx, %rax  (return the sret pointer)
 *
 * Semantics: returns (start + duration) - offset. FCP's own name is "getEnd" — treat the CMTime&
 * as an offset subtracted from the far edge; a caller passing kCMTimeZero would get start+duration
 * (the range's exclusive end).
 */
export function PCTimeRange_getEnd(self: PCTimeRange, offset: CMTime): CMTime {
  // 0x67756-0x6775a  tmp = PC_CMTimeSaferAdd(this->start, this->duration)
  const tmp = PC_CMTimeSaferAdd(self.start, self.duration);
  // 0x67792-0x67795  return PC_CMTimeSaferSubtract(tmp, offset)
  return PC_CMTimeSaferSubtract(tmp, offset);
}

/**
 * PCTimeRange::contains(CMTime const&, CMTime const&) const  →  bool
 * @Ozone 0x0000000000132160  (__ZNK11PCTimeRange8containsERK6CMTimeS2_)
 *
 * DECODE (raw-port/re/disasm/PCTimeRange.contains.s):
 *   0x132179-0x1321b6  copy this->start (from %r15=this, +0x00/+0x10) and arg1 (from %rbx=%rsi,
 *                      +0x00/+0x10) onto the stack as call args to CMTimeCompare — CMTimeCompare's
 *                      x86 ABI takes both CMTimes by value on the stack.
 *   0x1321ba           callq _CMTimeCompare  →  eax = CMTimeCompare(this->start, arg1)
 *                                                                              @CMTime.ts
 *   0x1321bf-0x1321c1  testl %eax, %eax ; jle 0x1321ca
 *                      → if compare > 0  (i.e. this->start > arg1):
 *   0x1321c3-0x1321c5      xorl %eax, %eax ; jmp 0x13228f  →  return false
 *   0x1321ca-0x132212  copy this->start (r15 +0x00/+0x10) and this->duration (r15 +0x18/+0x28)
 *                      as call args; leaq -0x68(%rbp), %rdi ; callq _PC_CMTimeSaferAdd
 *                      → sum = PC_CMTimeSaferAdd(this->start, this->duration)         @CMTime.ts
 *   0x132217-0x13224e  copy arg2 (r14 +0x00/+0x10) and the sum (from -0x68 body, -0x58 epoch)
 *                      as call args; leaq -0x50(%rbp), %rdi ; callq _PC_CMTimeSaferSubtract
 *                      → diff = PC_CMTimeSaferSubtract(sum, arg2)                     @CMTime.ts
 *   0x132253-0x132281  copy arg1 (rbx +0x00/+0x10) as first CMTime and diff (from -0x50 body,
 *                      -0x40 epoch) as second CMTime — arg order: (arg1, diff).
 *   0x132285           callq _CMTimeCompare  →  eax = CMTimeCompare(arg1, diff)         @CMTime.ts
 *   0x13228a-0x13228c  testl %eax, %eax ; setle %al  →  return (arg1 <= diff) as bool
 *
 * Semantics: contains(t, d) = (this.start <= t) && (t <= (this.start + this.duration) - d).
 * Reads as: "does this range have room for a `d`-long window starting at `t`?" — i.e. is the
 * half-open sub-range [t, t+d) fully inside [start, start+duration)? Note: the second endpoint
 * check is inclusive (`setle`) because CoreMedia treats an equal endpoint as "still contained".
 */
export function PCTimeRange_contains(self: PCTimeRange, t: CMTime, d: CMTime): boolean {
  // 0x1321ba  eax = CMTimeCompare(this->start, t)
  // 0x1321bf-0x1321c5  if (eax > 0) return false
  if (CMTimeCompare(self.start, t) > 0) return false;
  // 0x1321ca-0x132212  sum = PC_CMTimeSaferAdd(this->start, this->duration)
  const sum = PC_CMTimeSaferAdd(self.start, self.duration);
  // 0x132217-0x13224e  diff = PC_CMTimeSaferSubtract(sum, d)
  const diff = PC_CMTimeSaferSubtract(sum, d);
  // 0x132285-0x13228c  return CMTimeCompare(t, diff) <= 0
  return CMTimeCompare(t, diff) <= 0;
}

/**
 * PCTimeRange::operator!=(PCTimeRange const&) const  →  bool
 * @Ozone 0x00000000002163f0  (__ZNK11PCTimeRangeneERKS_)
 *
 * DECODE (raw-port/re/disasm/PCTimeRange.operator!=.s):
 *   0x216401-0x21643e  copy this->start (r14 +0x00/+0x10) and other->start (rbx +0x00/+0x10) as
 *                      CMTimeCompare args in the order (this->start, other->start).
 *   0x216442           callq _CMTimeCompare  →  eax = CMTimeCompare(this->start, other->start)
 *                                                                                     @CMTime.ts
 *   0x216447-0x21644b  movl %eax, %ecx ; movb $0x1, %al   (default return = true — i.e. !=)
 *   0x21644d           testl %ecx, %ecx ; jne 0x21649d
 *                      → if compare != 0 (starts differ):  skip the second compare, return true
 *   0x21644f-0x21648f  else copy this->duration (r14 +0x18/+0x28) and other->duration
 *                      (rbx +0x18/+0x28) as CMTimeCompare args in the order (this, other).
 *   0x216493           callq _CMTimeCompare  →  eax = CMTimeCompare(this->duration,
 *                                                                    other->duration)  @CMTime.ts
 *   0x216498-0x21649a  testl %eax, %eax ; setne %al  →  return (durations differ) as bool
 *
 * Semantics: `a != b` iff a.start ≠ b.start OR a.duration ≠ b.duration (using CMTimeCompare's
 * rational-equality, not bit-equality — kCMTimeZero and {value=0,timescale=600} compare equal).
 * Short-circuits on start mismatch — matches the C++ `||`-like control flow of the disasm.
 */
export function PCTimeRange_notEquals(self: PCTimeRange, other: PCTimeRange): boolean {
  // 0x216442  ecx = CMTimeCompare(this->start, other->start)
  // 0x21644d  if (ecx != 0) return true
  if (CMTimeCompare(self.start, other.start) !== 0) return true;
  // 0x216493-0x21649a  return CMTimeCompare(this->duration, other->duration) != 0
  return CMTimeCompare(self.duration, other.duration) !== 0;
}

/**
 * PCTimeRange::setOffsetEnd(CMTime const& newStart, CMTime const& oldStart, CMTime const& oldEnd)
 * @Ozone 0x00000000002164b0  (__ZN11PCTimeRange12setOffsetEndERK6CMTimeS2_S2_)
 *
 * DECODE (raw-port/re/disasm/PCTimeRange.setOffsetEnd.s):
 *   0x2164c4-0x2164cf  movq 0x10(%rsi), 0x10(%rdi) ; movups (%rsi), (%rdi)
 *                      → this->start = *newStart       (copy the CMTime value+ts+flags+epoch)
 *   0x2164d2-0x21650f  copy oldEnd (rdx +0x00/+0x10) and newStart (rsi +0x00/+0x10) as call args
 *                      in the order (oldEnd, newStart)
 *   0x216513-0x216517  leaq -0x68(%rbp), %rdi ; callq _PC_CMTimeSaferSubtract
 *                      → shifted = PC_CMTimeSaferSubtract(oldEnd, newStart)            @CMTime.ts
 *   0x21651c-0x21654b  copy oldStart (r14 = %rcx +0x00/+0x10) and shifted (from -0x68 body,
 *                      -0x58 epoch) as call args in the order (shifted, oldStart)
 *   0x21654f-0x216553  leaq -0x50(%rbp), %rdi ; callq _PC_CMTimeSaferAdd
 *                      → newDur = PC_CMTimeSaferAdd(shifted, oldStart)                @CMTime.ts
 *                      NB: address order is (shifted, oldStart); SaferAdd is commutative in value
 *                      but the disasm's operand order is preserved here.
 *   0x216558-0x216564  movq -0x40(%rbp), %rax ; movq %rax, 0x28(%rbx)  (epoch  → this->duration.epoch)
 *                      movups -0x50(%rbp), %xmm0 ; movups %xmm0, 0x18(%rbx)
 *                                                       (value+ts+flags → this->duration @+0x18)
 *                      → this->duration = newDur
 *
 * Semantics: given oldStart, oldEnd (the previous [start, start+duration) endpoints) and a
 * newStart, adjust `this` so that its new start is newStart while the new duration equals
 * (oldEnd - newStart) + oldStart. This is FCP's "keep the end pinned when the start changes,
 * offset by the difference from the old start" operation — the naive alternative
 * `duration = oldEnd - newStart` shifts the interval; this variant compensates by adding
 * oldStart back, so the *end* moves by exactly (newStart - oldStart). Faithful to the disasm.
 *
 * MUTATES `self` in place (matches the C++ non-const method — no sret buffer, `%rdi` is `this`).
 */
export function PCTimeRange_setOffsetEnd(
  self: PCTimeRange,
  newStart: CMTime,
  oldStart: CMTime,
  oldEnd: CMTime,
): void {
  // 0x2164c4-0x2164cf  this->start = newStart  (structural copy — CMTime is a value type)
  self.start = {
    value: newStart.value,
    timescale: newStart.timescale,
    flags: newStart.flags,
    epoch: newStart.epoch,
  };
  // 0x216513-0x216517  shifted = PC_CMTimeSaferSubtract(oldEnd, newStart)
  const shifted = PC_CMTimeSaferSubtract(oldEnd, newStart);
  // 0x21654f-0x216553  newDur = PC_CMTimeSaferAdd(shifted, oldStart)
  const newDur = PC_CMTimeSaferAdd(shifted, oldStart);
  // 0x216558-0x216564  this->duration = newDur
  self.duration = {
    value: newDur.value,
    timescale: newDur.timescale,
    flags: newDur.flags,
    epoch: newDur.epoch,
  };
}
