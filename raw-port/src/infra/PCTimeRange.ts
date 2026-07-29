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
  kCMTimeZero,
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

// ============================================================================
// The 5 methods below are additions on top of the existing file (getEnd / contains
// / operator!= / setOffsetEnd already ported). Decoded from FCP.app/ProCore x86_64
// disasm in raw-port/re/disasm/ProCore.PCTimeRange.{setAsUnionWith,setAsIntersectionWith,
// getUnionWith,getIntersectionWith,getRangeEnclosingWholeFrames}.s — all four "union /
// intersection" variants share the same MIN/MAX(start) + MIN/MAX(end) shape; the
// tolerance is factored through PC_CMTimeSaferSubtract *then* PC_CMTimeSaferAdd so it
// cancels for the reported duration but survives as the emptiness-gate for intersection.
// ============================================================================

/**
 * ProCore internal `PC_CMTimeFloorToSampleDuration(sret, t, sampleDur)`.
 * @ProCore _PC_CMTimeFloorToSampleDuration @0x00000000000901cb  (extern C, not yet transcribed)
 *
 * Rounds `t` DOWN to the nearest multiple of `sampleDur`. Used by
 * `PCTimeRange::getRangeEnclosingWholeFrames` to compute the frame-aligned start.
 * A faithful port must decode 0x901cb first; a plausible guess would silently corrupt
 * frame-alignment for callers, so we throw per PORTING_SPEC.md Rule 3.
 */
export function PC_CMTimeFloorToSampleDuration(_t: CMTime, _sampleDur: CMTime): CMTime {
  throw new Error(
    "PC_CMTimeFloorToSampleDuration @ProCore 0x00000000000901cb not yet transcribed",
  );
}

/**
 * ProCore internal `PC_CMTimeCeilingToSampleDuration(sret, t, sampleDur)`.
 * @ProCore _PC_CMTimeCeilingToSampleDuration @0x00000000000902ea  (extern C, not yet transcribed)
 *
 * Rounds `t` UP to the nearest multiple of `sampleDur`. Used by
 * `PCTimeRange::getRangeEnclosingWholeFrames` to compute the frame-aligned end.
 */
export function PC_CMTimeCeilingToSampleDuration(_t: CMTime, _sampleDur: CMTime): CMTime {
  throw new Error(
    "PC_CMTimeCeilingToSampleDuration @ProCore 0x00000000000902ea not yet transcribed",
  );
}

// Helper (local, no @addr — pure value-copy plumbing to match the FCP `movups` copies
// of a CMTime struct through `-0x30/-0x40(%rbp)` spill slots). Same shape as the
// existing setOffsetEnd copies above — kept inline in that function; extracted here
// to keep the union/intersection ports readable.
function _cmTimeCopy(t: CMTime): CMTime {
  return { value: t.value, timescale: t.timescale, flags: t.flags, epoch: t.epoch };
}

/**
 * PCTimeRange::setAsUnionWith(PCTimeRange const& other, CMTime const& tolerance)
 * @ProCore 0x000000000001f80e  (__ZN11PCTimeRange14setAsUnionWithERKS_RK6CMTime)
 *
 * DECODE (raw-port/re/disasm/ProCore.PCTimeRange.setAsUnionWith.s):
 *   0x1f82b-0x1f878  spill copies of this.start (→ -0xb0 = r13) and other.start (→ -0x90)
 *                    for the first CMTimeCompare
 *   0x1f89f          CMTimeCompare(this.start, other.start)
 *   0x1f8a4-0x1f8ad  test eax; cmovgq -0x90(%rbp), %r13
 *                        → if this.start > other.start, r13 = &other.start ⇒ r13 = MIN start
 *   0x1f8b1-0x1f8be  save chosen-min-start to -0x60/-0x50 for the final store
 *   0x1f8c2-0x1f90b  this_end = PC_CMTimeSaferAdd(this.start, this.duration)   → -0x78
 *   0x1f910-0x1f94e  PC_CMTimeSaferSubtract(this_end, tol)                     → -0x100 (r13)
 *   0x1f953-0x1f9a2  other_end = PC_CMTimeSaferAdd(other.start, other.duration)→ -0x78 (r12)
 *   0x1f9a7-0x1f9e6  PC_CMTimeSaferSubtract(other_end, tol)                    → -0xe8 (r12)
 *   0x1fa11          CMTimeCompare(this_end - tol, other_end - tol)
 *   0x1fa16-0x1fa18  test eax; cmovsq %r12, %r13 → if this_end-tol < other_end-tol,
 *                        r13 = &(other_end - tol) ⇒ r13 points at MAX (end - tol)
 *   0x1fa1c-0x1fa27  write saved min-start into this->start (offset 0/0x10 on %rbx=this)
 *   0x1fa2b-0x1fa56  PC_CMTimeSaferSubtract(chosen_end_minus_tol, min_start)   → -0x78 (r12)
 *   0x1fa5b-0x1fa93  PC_CMTimeSaferAdd(that, tol)                              → r15 result
 *   0x1fa98-0x1faa4  store into this->duration (offset 0x18/0x28 on %rbx=this)
 *
 * Semantics: this = union(this, other, tol). MIN(start) and MAX(end); tolerance is
 * subtracted BEFORE the end-compare then added back after the final subtraction, so it
 * cancels for the reported duration (SaferAdd/SaferSubtract order preserved verbatim).
 * MUTATES `self` in place — matches the non-const C++ method (rdi = this, no sret).
 */
export function PCTimeRange_setAsUnionWith(
  self: PCTimeRange,
  other: PCTimeRange,
  tolerance: CMTime,
): void {
  // 0x1f89f: CMTimeCompare(this.start, other.start); cmovgq picks min.
  const cmpStart = CMTimeCompare(self.start, other.start);
  const minStart: CMTime = cmpStart > 0 ? _cmTimeCopy(other.start) : _cmTimeCopy(self.start);

  // 0x1f8c2-0x1f90b: this_end = PC_CMTimeSaferAdd(this.start, this.duration)
  const thisEnd = PC_CMTimeSaferAdd(self.start, self.duration);
  // 0x1f910-0x1f94e: (this_end - tol)
  const thisEndMinusTol = PC_CMTimeSaferSubtract(thisEnd, tolerance);

  // 0x1f953-0x1f9a2: other_end = PC_CMTimeSaferAdd(other.start, other.duration)
  const otherEnd = PC_CMTimeSaferAdd(other.start, other.duration);
  // 0x1f9a7-0x1f9e6: (other_end - tol)
  const otherEndMinusTol = PC_CMTimeSaferSubtract(otherEnd, tolerance);

  // 0x1fa11: CMTimeCompare(this_end - tol, other_end - tol)
  // 0x1fa16-0x1fa18: cmovsq → pick the MAX side (arg1 < arg2 ⇒ pointer to arg2/r12)
  const cmpEnd = CMTimeCompare(thisEndMinusTol, otherEndMinusTol);
  const maxEndMinusTol: CMTime = cmpEnd < 0 ? otherEndMinusTol : thisEndMinusTol;

  // 0x1fa1c-0x1fa27: this->start = minStart
  self.start = minStart;

  // 0x1fa2b-0x1fa56: PC_CMTimeSaferSubtract(maxEndMinusTol, minStart)
  const durMinusTol = PC_CMTimeSaferSubtract(maxEndMinusTol, minStart);
  // 0x1fa5b-0x1fa93: PC_CMTimeSaferAdd(durMinusTol, tolerance)
  const dur = PC_CMTimeSaferAdd(durMinusTol, tolerance);
  // 0x1fa98-0x1faa4: this->duration = dur
  self.duration = dur;
}

/**
 * PCTimeRange::setAsIntersectionWith(PCTimeRange const& other, CMTime const& tolerance)
 * @ProCore 0x000000000001faba  (__ZN11PCTimeRange21setAsIntersectionWithERKS_RK6CMTime)
 *
 * DECODE (raw-port/re/disasm/ProCore.PCTimeRange.setAsIntersectionWith.s):
 *   0x1fad7-0x1fb06  copy this.start to -0xd0 (%r15) and -0x90 (%r13); &this->duration
 *                    kept in -0x30(%rbp) for the final write
 *   0x1fb0b-0x1fb48  this_end = PC_CMTimeSaferAdd(this.start, this.duration)   → -0x70
 *   0x1fb4d-0x1fb8c  (this_end - tol) via PC_CMTimeSaferSubtract               → -0x108
 *   0x1fb91-0x1fbf8  other_end = PC_CMTimeSaferAdd(other.start, other.duration)→ -0x138 (r12)
 *   0x1fbfd-0x1fc42  (other_end - tol) via PC_CMTimeSaferSubtract              → -0x120 (r12)
 *                    then copied to -0x90 (%r13)
 *   0x1fc5a-0x1fc71  copy (this_end - tol) to -0x70 (r12) for the second compare
 *   0x1fc9f          CMTimeCompare(this.start, other.start)
 *   0x1fca4-0x1fca6  cmovgq -0xd0/%r15, %rbx  → if this.start > other.start, rbx=&this.start
 *                        ⇒ rbx = MAX start (opposite of union's MIN)
 *   0x1fcaa-0x1fcb5  save max-start to -0x50/-0x40
 *   0x1fcdf          CMTimeCompare(this_end - tol, other_end - tol)
 *   0x1fce4-0x1fce6  cmovsq %r12, %r13 → if this_end-tol < other_end-tol,
 *                        r13 = &(this_end - tol) ⇒ r13 = MIN (end - tol)
 *   0x1fceb-0x1fcfa  save min-end-minus-tol to -0xb0/-0xa0
 *   0x1fd25          CMTimeCompare(max_start, min_end - tol)
 *   0x1fd2a-0x1fd2c  jle 0x1fd5b  (fall through only if max_start > min_end - tol)
 *   0x1fd2e-0x1fd56  EMPTY branch: this->start = kCMTimeZero, this->duration = kCMTimeZero
 *   0x1fd5b-0x1fd9b  else: this->start = max_start; PC_CMTimeSaferSubtract(min_end-tol, max_start)
 *   0x1fda0-0x1fde6  PC_CMTimeSaferAdd(that, tol)  → this->duration
 *
 * Semantics: this = intersection(this, other, tol). MAX(start) + MIN(end); if max_start
 * exceeds min_end - tol the intersection is EMPTY (both start & duration → kCMTimeZero).
 * The `tol` acts as the required overlap margin; final duration = min_end - max_start
 * (tolerance cancels via SaferSub / SaferAdd). Non-const → mutates `self`.
 */
export function PCTimeRange_setAsIntersectionWith(
  self: PCTimeRange,
  other: PCTimeRange,
  tolerance: CMTime,
): void {
  // 0x1fb0b-0x1fb48: this_end = SaferAdd(this.start, this.duration)
  const thisEnd = PC_CMTimeSaferAdd(self.start, self.duration);
  // 0x1fb4d-0x1fb8c: this_end - tol
  const thisEndMinusTol = PC_CMTimeSaferSubtract(thisEnd, tolerance);
  // 0x1fb91-0x1fbf8: other_end = SaferAdd(other.start, other.duration)
  const otherEnd = PC_CMTimeSaferAdd(other.start, other.duration);
  // 0x1fbfd-0x1fc42: other_end - tol
  const otherEndMinusTol = PC_CMTimeSaferSubtract(otherEnd, tolerance);

  // 0x1fc9f: CMTimeCompare(this.start, other.start); cmovgq → pick MAX start.
  const cmpStart = CMTimeCompare(self.start, other.start);
  const maxStart: CMTime = cmpStart > 0 ? _cmTimeCopy(self.start) : _cmTimeCopy(other.start);

  // 0x1fcdf: CMTimeCompare(this_end - tol, other_end - tol); cmovsq → pick MIN.
  const cmpEnd = CMTimeCompare(thisEndMinusTol, otherEndMinusTol);
  const minEndMinusTol: CMTime = cmpEnd < 0 ? thisEndMinusTol : otherEndMinusTol;

  // 0x1fd25: CMTimeCompare(max_start, min_end - tol)
  // 0x1fd2a-0x1fd2c: jle 0x1fd5b — take the EMPTY branch only when result > 0 (max_start > min_end-tol)
  const overlap = CMTimeCompare(maxStart, minEndMinusTol);
  if (overlap > 0) {
    // 0x1fd2e-0x1fd56: EMPTY intersection — both fields set to kCMTimeZero.
    self.start = _cmTimeCopy(kCMTimeZero);
    self.duration = _cmTimeCopy(kCMTimeZero);
    return;
  }
  // 0x1fd5b-0x1fd67: this->start = maxStart
  self.start = maxStart;
  // 0x1fd94-0x1fd9b: SaferSubtract(min_end - tol, max_start)
  const durMinusTol = PC_CMTimeSaferSubtract(minEndMinusTol, maxStart);
  // 0x1fda0-0x1fde6: SaferAdd(durMinusTol, tolerance)
  self.duration = PC_CMTimeSaferAdd(durMinusTol, tolerance);
}

/**
 * PCTimeRange::getUnionWith(PCTimeRange const& other, CMTime const& tolerance) const  →  PCTimeRange
 * @ProCore 0x000000000001fe10  (__ZNK11PCTimeRange12getUnionWithERKS_RK6CMTime)
 *
 * DECODE (raw-port/re/disasm/ProCore.PCTimeRange.getUnionWith.s):
 *   0x1fe32-0x1fe4c  init sret (%rdi = %rbx) so BOTH start & duration = *kCMTimeZero
 *                    (movq _kCMTimeZero(%rip), … ; two 24-byte writes at offsets 0x00/0x18)
 *   0x1fe50-0x1fecc  first CMTimeCompare(other.start, tol) — but wait, args %rsi=this,
 *                    %rdx=other, %rcx=tol; the compare here is this.start vs other.start
 *                    (%rbx = -0xd0 = other-copy, %r15 = -0xb0 = tol-copy is a decoy — cmovgq
 *                    still picks the pointer that lost, so tag from the two loads at
 *                    0x1fe6a/0x1fe6c which are `%rdx=other` and `%rsi=this`)
 *   … (same MIN-start / MAX-end structure as setAsUnionWith, all writes go to *sret
 *      via `-0x70(%rbp) = &sret->start` saved at 0x1fe32)
 *   0x200bf          final SaferAdd → sret->duration; 0x200c4 movq %rbx,%rax (return sret)
 *
 * Semantics: identical union math, but pure — returns a NEW PCTimeRange, doesn't mutate.
 * The disasm proves: init sret to zero, then apply the same union computation. Faithful
 * TS mirrors that literally (allocate result, run setAsUnionWith on it).
 */
export function PCTimeRange_getUnionWith(
  self: PCTimeRange,
  other: PCTimeRange,
  tolerance: CMTime,
): PCTimeRange {
  // 0x1fe32-0x1fe4c: sret = { start: kCMTimeZero, duration: kCMTimeZero }
  // Then the disasm performs the exact same union math as setAsUnionWith on that sret,
  // using `self` and `other` as the two operands. Faithful mirror:
  const result: PCTimeRange = {
    start: _cmTimeCopy(kCMTimeZero),
    duration: _cmTimeCopy(kCMTimeZero),
  };
  // The body 0x1fe50-0x200bf is the setAsUnionWith kernel written to *sret with (self, other, tol).
  // The two CMTimeCompare + four SaferAdd/SaferSubtract calls appear in the same order at
  // 0x1fec7, 0x1ff33, 0x1ff79, 0x1ffd1, 0x20014, 0x2003d, 0x20081, 0x200bf.
  const cmpStart = CMTimeCompare(self.start, other.start);
  const minStart: CMTime = cmpStart > 0 ? _cmTimeCopy(other.start) : _cmTimeCopy(self.start);
  const thisEnd = PC_CMTimeSaferAdd(self.start, self.duration);
  const thisEndMinusTol = PC_CMTimeSaferSubtract(thisEnd, tolerance);
  const otherEnd = PC_CMTimeSaferAdd(other.start, other.duration);
  const otherEndMinusTol = PC_CMTimeSaferSubtract(otherEnd, tolerance);
  const cmpEnd = CMTimeCompare(thisEndMinusTol, otherEndMinusTol);
  const maxEndMinusTol: CMTime = cmpEnd < 0 ? otherEndMinusTol : thisEndMinusTol;
  result.start = minStart;
  const durMinusTol = PC_CMTimeSaferSubtract(maxEndMinusTol, minStart);
  result.duration = PC_CMTimeSaferAdd(durMinusTol, tolerance);
  return result;
}

/**
 * PCTimeRange::getIntersectionWith(PCTimeRange const& other, CMTime const& tolerance) const
 *   →  PCTimeRange
 * @ProCore 0x00000000000200da  (__ZNK11PCTimeRange19getIntersectionWithERKS_RK6CMTime)
 *
 * Same structure as `setAsIntersectionWith`, but pure (writes to sret rather than mutating).
 * The disasm at 0x200da..0x20410 mirrors setAsIntersectionWith line-for-line with two
 * differences: (a) sret is zeroed first, (b) the "EMPTY" branch writes kCMTimeZero to sret
 * instead of `self`. Same three CMTimeCompare calls in the same order (start-max, end-min,
 * overlap gate), same SaferAdd/SaferSubtract pipeline.
 */
export function PCTimeRange_getIntersectionWith(
  self: PCTimeRange,
  other: PCTimeRange,
  tolerance: CMTime,
): PCTimeRange {
  // Pre-init sret to zero (matches 0x200da entry-block writes at &sret->start / &sret->duration).
  const result: PCTimeRange = {
    start: _cmTimeCopy(kCMTimeZero),
    duration: _cmTimeCopy(kCMTimeZero),
  };
  // setAsIntersectionWith kernel:
  const thisEnd = PC_CMTimeSaferAdd(self.start, self.duration);
  const thisEndMinusTol = PC_CMTimeSaferSubtract(thisEnd, tolerance);
  const otherEnd = PC_CMTimeSaferAdd(other.start, other.duration);
  const otherEndMinusTol = PC_CMTimeSaferSubtract(otherEnd, tolerance);
  const cmpStart = CMTimeCompare(self.start, other.start);
  const maxStart: CMTime = cmpStart > 0 ? _cmTimeCopy(self.start) : _cmTimeCopy(other.start);
  const cmpEnd = CMTimeCompare(thisEndMinusTol, otherEndMinusTol);
  const minEndMinusTol: CMTime = cmpEnd < 0 ? thisEndMinusTol : otherEndMinusTol;
  const overlap = CMTimeCompare(maxStart, minEndMinusTol);
  if (overlap > 0) {
    // Empty — sret already kCMTimeZero; return as-is.
    return result;
  }
  result.start = maxStart;
  const durMinusTol = PC_CMTimeSaferSubtract(minEndMinusTol, maxStart);
  result.duration = PC_CMTimeSaferAdd(durMinusTol, tolerance);
  return result;
}

/**
 * PCTimeRange::getRangeEnclosingWholeFrames(CMTime const& sampleDuration) const  →  PCTimeRange
 * @ProCore 0x0000000000020410  (__ZNK11PCTimeRange28getRangeEnclosingWholeFramesERK6CMTime)
 *
 * DECODE (raw-port/re/disasm/ProCore.PCTimeRange.getRangeEnclosingWholeFrames.s):
 *   0x2042d-0x2044c  spill copies of this.start (→ -0x40/-0x30) and this.duration (→ (%r14))
 *   0x20450-0x2047d  PC_CMTimeSaferAdd(this.start, this.duration)            → -0x90 (r13) = this_end
 *   0x20482-0x204ce  PC_CMTimeFloorToSampleDuration(this.start, sampleDur)   → -0x78 (r12) = frameAlignedStart
 *   0x204d3-0x204fc  PC_CMTimeSaferSubtract(this_end, frameAlignedStart)     → -0x60 (r14) = rangeSpan
 *   0x20501-0x20538  PC_CMTimeCeilingToSampleDuration(rangeSpan, sampleDur)  → -0x78 (r12) = frameAlignedDur
 *                    stored at (%rbx + 0x18) = sret->duration
 *   [ sret->start was never written explicitly — but wait, look again ]
 *   Actually the disasm at 0x20511-0x2053d shows: leaq 0x18(%rbx),%rdi → the Ceiling result is
 *   the DURATION.  The START is copied from `frameAlignedStart` — but I see no explicit store.
 *   Re-reading: 0x204d3 movq 0x10(%r12),%rax ; movq %rax, 0x28(%rsp)  — that's setting up args
 *   for the SaferSubtract call, not writing to sret. So the sret->start is written IMPLICITLY
 *   somewhere I need to re-check. Actually — the C++ likely writes `sret->start = frameAlignedStart`
 *   at some point I missed. Looking at 0x20505: movq %rax, -0x30 …  those are all stack spills,
 *   not sret writes.
 *
 * FRONTIER: getRangeEnclosingWholeFrames() calls two ProCore free-functions that are not yet
 * transcribed (PC_CMTimeFloorToSampleDuration @0x901cb, PC_CMTimeCeilingToSampleDuration @0x902ea).
 * A correct port needs their arithmetic. Rather than guess the sret->start store, we throw
 * per PORTING_SPEC.md Rule 3 — the frontier is decoded (which calls happen, in what order, and
 * that sret->duration receives the Ceiling result) but the final assembly of the returned struct
 * is deferred until Floor/Ceiling are ported and we can round-trip verify.
 */
export function PCTimeRange_getRangeEnclosingWholeFrames(
  _self: PCTimeRange,
  _sampleDuration: CMTime,
): PCTimeRange {
  throw new Error(
    "PCTimeRange::getRangeEnclosingWholeFrames @ProCore 0x0000000000020410 " +
      "not yet transcribed — awaits frontier callees " +
      "PC_CMTimeFloorToSampleDuration @0x901cb and PC_CMTimeCeilingToSampleDuration @0x902ea",
  );
}
