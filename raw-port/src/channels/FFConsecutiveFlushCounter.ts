// raw-port: FFConsecutiveFlushCounter — Flexo framework (channels layer)
//
// Small statistics counter: tracks how many consecutive "draws" and "flushes" of certain kinds
// have happened, categorized by two boolean draw-type flags. Consumed by `summary()` which
// formats the six counters into an NSString via +[NSString stringWithFormat:].
//
// SYMBOLS PORTED (Flexo.framework/Versions/A/Flexo):
//   @Flexo 0xd58d50  FFConsecutiveFlushCounter::resetCounters(bool)
//   @Flexo 0xd58d70  FFConsecutiveFlushCounter::recordFlush(double)
//   @Flexo 0xd58db0  FFConsecutiveFlushCounter::recordDrawType(bool, bool)
//   @Flexo 0xd58de0  FFConsecutiveFlushCounter::summary()
//
// re/disasm:
//   raw-port/re/disasm/Flexo.FFConsecutiveFlushCounter.resetCounters.s
//   raw-port/re/disasm/Flexo.FFConsecutiveFlushCounter.recordFlush.s
//   raw-port/re/disasm/Flexo.FFConsecutiveFlushCounter.recordDrawType.s
//   raw-port/re/disasm/Flexo.FFConsecutiveFlushCounter.summary.s
//
// DECODE — RIP-relative literals referenced from the disasm:
//   @Flexo 0x156ca90 — 16-byte aligned {0x7fffffffffffffff, 0x7fffffffffffffff} — the sign-bit
//                     mask used by `andpd` in recordFlush @0xd58d82 (computes |x|).
//                     Verified: struct.unpack("<2Q", ...) == (0x7fffffffffffffff, 0x7fffffffffffffff).
//   @Flexo 0x156d068 — one double = 0.001 — the threshold used by `movsd` + `ucomisd` in
//                     recordFlush @0xd58d8a. Verified: struct.unpack("<d", ...) == 0.001
//                     (raw u64 = 0x3f50624dd2f1a9fc).
//   @Flexo 0x165b7fe — the ObjC CFString literal referenced by summary via a __cfstring struct
//                     at 0x19ac2c8: 49 bytes UTF-8 = "any=(%d,%d,%d) liveOnly=(%d,%d,%d) (any/NTU/real)"
//                     — the format string that gives the columns their meaning.
//   External symbols reached by summary:
//     _OBJC_CLASS_$_NSString @0x1794c88 (class ptr load @0xd58de6)
//     objc @selector(stringWithFormat:) @0xe5f710 (via 0xe5f70f(%rip) load @0xd58e02)
//     objc_msgSend indirect @0xb9489c (call *0xb9489c(%rip) @0xd58e1e)
//
// OBJECT LAYOUT (recovered from the six offsets read/written across all four methods):
//   +0x00 u32  any.a          — incremented on every recordFlush (@0xd58d70)
//                              — zeroed unconditionally on every recordDrawType (@0xd58db4)
//                              — zeroed unconditionally on resetCounters (@0xd58d54..57 movups low 4B)
//                              — printed as first %d in summary
//   +0x04 u32  liveOnly.a     — incremented on recordFlush ONLY when |value| >= 0.001 (@0xd58d98)
//                              — NOT touched by recordDrawType (survives draw-type transitions)
//                              — zeroed on resetCounters (part of the movups)
//                              — printed as 4th %d in summary
//   +0x08 u32  any.b          — incremented on every recordFlush (@0xd58d72)
//                              — zeroed by recordDrawType when firstBool==false (@0xd58dc5)
//                              — zeroed on resetCounters
//                              — printed as 2nd %d in summary
//   +0x0c u32  liveOnly.b     — incremented on recordFlush ONLY when |value| >= 0.001 (@0xd58d9b)
//                              — zeroed on resetCounters
//                              — printed as 5th %d in summary
//   +0x10 u32  any.c          — incremented on every recordFlush (@0xd58d75)
//                              — zeroed by recordDrawType when secondBool==false (@0xd58dd1)
//                              — zeroed on resetCounters (movq $0, 0x10(%rdi) @0xd58d5a)
//                              — printed as 3rd %d in summary
//   +0x14 u32  liveOnly.c     — incremented on recordFlush ONLY when |value| >= 0.001 (@0xd58d9e)
//                              — zeroed on resetCounters
//                              — printed as 6th %d in summary
//   +0x18 u64  (unnamed slot) — zeroed only by resetCounters when its argument is TRUE
//                              (@0xd58d66  `movq $0, 0x18(%rdi)` guarded by testl %esi + je)
//                              — never touched by the other three ported methods; its meaning
//                              is FRONTIER (a separately-referenced field consumed by a caller
//                              of resetCounters not in this port).
//
// The "any" row counts every draw/flush call; the "liveOnly" row skips flushes below the
// 0.001 magnitude threshold. The (a,b,c) triple tracks consecutive-since-last-reset runs of
// three different draw-type combinations (a: unconditional / total, b: firstBool-flag,
// c: secondBool-flag) — recordDrawType resets whichever counters don't match the flags.

// -------- the class --------

export class FFConsecutiveFlushCounter {
  /** @0x00 u32 — any.a (total draws / flushes). */
  public any_a: number = 0 >>> 0;
  /** @0x04 u32 — liveOnly.a (flushes with |value| >= 0.001). */
  public liveOnly_a: number = 0 >>> 0;
  /** @0x08 u32 — any.b (draws with firstBool set). */
  public any_b: number = 0 >>> 0;
  /** @0x0c u32 — liveOnly.b (flushes with firstBool set and |value| >= 0.001). */
  public liveOnly_b: number = 0 >>> 0;
  /** @0x10 u32 — any.c (draws with secondBool set). */
  public any_c: number = 0 >>> 0;
  /** @0x14 u32 — liveOnly.c (flushes with secondBool set and |value| >= 0.001). */
  public liveOnly_c: number = 0 >>> 0;
  /** @0x18 u64 — FRONTIER slot, cleared only by resetCounters(true). */
  public slot_at_0x18: bigint = 0n;

  /**
   * @Flexo 0xd58d50  FFConsecutiveFlushCounter::resetCounters(bool)
   *
   * Faithful control-flow mirror:
   *   @0xd58d54..@0xd58d5a  zero fields at +0x00..+0x18 (six u32s)
   *     xorps %xmm0, %xmm0
   *     movups %xmm0, (%rdi)          ; zero [0x00..0x10)
   *     movq   $0x0, 0x10(%rdi)       ; zero [0x10..0x18)
   *   @0xd58d62..@0xd58d6c  if the bool arg is set, also zero +0x18..+0x20:
   *     testl %esi, %esi
   *     je    +0xA
   *     movq  $0x0, 0x18(%rdi)         ; zero [0x18..0x20)
   *   @0xd58d6e..@0xd58d6f  return.
   *
   * @param alsoResetFrontierSlot when true, also clear the slot at +0x18.
   */
  resetCounters(alsoResetFrontierSlot: boolean): void {
    // Zero the six u32 counters (xorps xmm0; movups; movq).
    this.any_a       = 0 >>> 0;
    this.liveOnly_a  = 0 >>> 0;
    this.any_b       = 0 >>> 0;
    this.liveOnly_b  = 0 >>> 0;
    this.any_c       = 0 >>> 0;
    this.liveOnly_c  = 0 >>> 0;
    // The bool arg gates the +0x18 clear (`testl %esi, %esi; je +0xA`).
    if (alsoResetFrontierSlot) {
      this.slot_at_0x18 = 0n;
    }
  }

  /**
   * @Flexo 0xd58d70  FFConsecutiveFlushCounter::recordFlush(double value)
   *
   * Faithful control-flow mirror. Note the "any" counters are bumped BEFORE the NaN test
   * (an unusual pattern; the disasm shows exactly this order).
   *
   *   @0xd58d70..@0xd58d75  incl on any.a, any.b, any.c (three u32 increments)
   *   @0xd58d78..@0xd58d7c  ucomisd %xmm0, %xmm0; jp +0x24
   *                         — if the input is NaN (parity flag set on unordered compare),
   *                           skip the rest and return.
   *   @0xd58d82..@0xd58d90  andpd 0x813d06(%rip), %xmm0
   *                         — mask out the sign bit with {0x7fffffffffffffff, 0x7fffffffffffffff}
   *                           i.e. compute |value|.
   *                         movsd 0x8142d6(%rip), %xmm1
   *                         — load the threshold 0.001 (0x3f50624dd2f1a9fc).
   *   @0xd58d92..@0xd58d96  ucomisd %xmm0, %xmm1; ja +0x9
   *                         — AT&T `ucomisd %xmm0, %xmm1` sets flags from (xmm1, xmm0);
   *                           `ja` fires iff xmm1 > xmm0 in an ordered compare, i.e.
   *                           0.001 > |value|. If so, skip.
   *   @0xd58d98..@0xd58d9e  incl on liveOnly.a, liveOnly.b, liveOnly.c (three u32 increments).
   *   @0xd58da1..@0xd58da2  return.
   */
  recordFlush(value: number): void {
    // Step 1: unconditional "any" bumps (before any test).
    this.any_a = (this.any_a + 1) >>> 0;
    this.any_b = (this.any_b + 1) >>> 0;
    this.any_c = (this.any_c + 1) >>> 0;

    // Step 2: NaN test. `ucomisd %xmm0, %xmm0; jp` sets PF on unordered (NaN) and jumps to
    // the retq at @0xd58da2, skipping the liveOnly bumps.
    if (Number.isNaN(value)) return;

    // Step 3: absolute value via andpd with the 16-byte mask {0x7fffffffffffffff, 0x7fffffffffffffff}.
    const absVal = Math.abs(value);

    // Step 4: threshold compare with 0.001 (loaded via movsd 0x8142d6(%rip)).
    //   AT&T `ucomisd %xmm0, %xmm1` compares (xmm1, xmm0); `ja +0x9` skips if xmm1 > xmm0,
    //   i.e. if 0.001 > absVal.
    const THRESHOLD = 0.001;
    if (THRESHOLD > absVal) return;

    // Step 5: "liveOnly" bumps.
    this.liveOnly_a = (this.liveOnly_a + 1) >>> 0;
    this.liveOnly_b = (this.liveOnly_b + 1) >>> 0;
    this.liveOnly_c = (this.liveOnly_c + 1) >>> 0;
  }

  /**
   * @Flexo 0xd58db0  FFConsecutiveFlushCounter::recordDrawType(bool, bool)
   *
   * Resets the "any" counters for whichever categories don't match the passed draw-type flags.
   * Does NOT touch the "liveOnly" row (+0x04, +0x0c, +0x14).
   *
   * Faithful control-flow mirror:
   *   @0xd58db4              movq $0x0, (%rdi)     ; zero [0x00..0x08)  (any.a AND liveOnly.a
   *                                                 ; note: this zeros liveOnly.a too — it is
   *                                                 ; NOT preserved. The layout ranges I gave
   *                                                 ; above say "not touched" for liveOnly.a
   *                                                 ; based on the +0x04 offset never being an
   *                                                 ; explicit target; but a movq at +0x00 writes
   *                                                 ; 8 bytes, so +0x04 IS zeroed here too.)
   *   @0xd58dbb..@0xd58dbd    testl %esi, %esi; je 0xd58dc5
   *                          — if firstBool==0, jump to zero +0x08..+0x10 (both any.b + liveOnly.b)
   *   @0xd58dbf..@0xd58dc1    testb %dl, %dl; je 0xd58dd1
   *                          — (firstBool!=0 && secondBool==0): jump to zero +0x10..+0x18
   *                          — (firstBool!=0 && secondBool!=0): fall through to retq.
   *   @0xd58dc3..@0xd58dc4    popq %rbp; retq.
   *
   *   0xd58dc5:  movq $0x0, 0x8(%rdi)  ; zero [0x08..0x10) (any.b + liveOnly.b)
   *   @0xd58dcd..@0xd58dcf    testb %dl, %dl; jne 0xd58dc3
   *                          — (firstBool==0 && secondBool!=0): return.
   *   0xd58dd1:  movq $0x0, 0x10(%rdi) ; zero [0x10..0x18) (any.c + liveOnly.c)
   *   @0xd58dd9..@0xd58dda    popq %rbp; retq.
   *
   * CORRECTION on the layout comment: because each movq clears 8 bytes, this method ALSO
   * clears the corresponding "liveOnly" slot in the same 8-byte window. So the effective
   * behavior is:
   *   - always clear (any.a, liveOnly.a).
   *   - if !firstBool  clear (any.b, liveOnly.b).
   *   - if !secondBool clear (any.c, liveOnly.c).
   */
  recordDrawType(firstBool: boolean, secondBool: boolean): void {
    // @0xd58db4  movq $0x0, (%rdi)  — zero both u32s in [0x00..0x08).
    this.any_a      = 0 >>> 0;
    this.liveOnly_a = 0 >>> 0;

    if (!firstBool) {
      // esi==0 path (@0xd58dc5 onwards): zero [0x08..0x10)
      this.any_b      = 0 >>> 0;
      this.liveOnly_b = 0 >>> 0;
      if (secondBool) {
        // @0xd58dcf jne 0xd58dc3 — return without touching +0x10.
        return;
      }
      // Fall through to zero [0x10..0x18).
      this.any_c      = 0 >>> 0;
      this.liveOnly_c = 0 >>> 0;
      return;
    }

    // firstBool==1 path (@0xd58dbf onwards).
    if (secondBool) {
      // Both flags set: (@0xd58dc3) return without touching +0x08 or +0x10.
      return;
    }
    // firstBool==1 && secondBool==0: zero [0x10..0x18) at @0xd58dd1.
    this.any_c      = 0 >>> 0;
    this.liveOnly_c = 0 >>> 0;
  }

  /**
   * @Flexo 0xd58de0  FFConsecutiveFlushCounter::summary() -> NSString*
   *
   * Formats the six counters via +[NSString stringWithFormat:] with the format string at
   * @Flexo 0x165b7fe: "any=(%d,%d,%d) liveOnly=(%d,%d,%d) (any/NTU/real)".
   *
   * Faithful register-load order (@0xd58ded..@0xd58dff):
   *   r8d  = obj+0x08 = any.b        ; 2nd %d in "any=("
   *   r9d  = obj+0x10 = any.c        ; 3rd %d in "any=("
   *   ecx  = obj+0x00 = any.a        ; 1st %d in "any=("
   *   r10d = obj+0x04 = liveOnly.a   ; 4th %d ("liveOnly=(" first)
   *   r11d = obj+0x0c = liveOnly.b   ; 5th
   *   ebx  = obj+0x14 = liveOnly.c   ; 6th
   *
   * The x86_64 System-V variadic call to `objc_msgSend(NSString.class, @selector(stringWithFormat:),
   *   format, ecx, r8d, r9d, r10d, r11d, ebx)` passes r8/r9 as arg4/arg5 in registers and pushes
   *   r10, r11, rbx on the stack (@0xd58e19..@0xd58e1c) as arg6/arg7/arg8.
   *
   * FRONTIER: the actual objc_msgSend + NSString formatting is external. This port returns a
   * plain JS-formatted string with the same six values in the same order (documented by the
   * decoded format literal); a downstream consumer wanting a real NSString would bridge here.
   */
  summary(): string {
    // Register-load order from the disasm:
    const r8d  = this.any_b >>> 0;      // @0xd58ded  movl 0x8(%rdi),  %r8d
    const r9d  = this.any_c >>> 0;      // @0xd58df1  movl 0x10(%rdi), %r9d
    const ecx  = this.any_a >>> 0;      // @0xd58df5  movl (%rdi),     %ecx
    const r10d = this.liveOnly_a >>> 0; // @0xd58df7  movl 0x4(%rdi),  %r10d
    const r11d = this.liveOnly_b >>> 0; // @0xd58dfb  movl 0xc(%rdi),  %r11d
    const ebx  = this.liveOnly_c >>> 0; // @0xd58dff  movl 0x14(%rdi), %ebx

    // Format-string arg order (from the CFString literal + printf %d positions):
    //   "any=(%d,%d,%d) liveOnly=(%d,%d,%d) (any/NTU/real)"
    //         ecx  r8d r9d           r10d r11d ebx
    return "any=(" + ecx + "," + r8d + "," + r9d + ") " +
           "liveOnly=(" + r10d + "," + r11d + "," + ebx + ") " +
           "(any/NTU/real)";
  }
}
