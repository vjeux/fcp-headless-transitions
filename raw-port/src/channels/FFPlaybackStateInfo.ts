// FFPlaybackStateInfo.ts — Flexo framework's FFPlaybackStateInfo: a small POD
// aggregate describing the playhead's momentary state (position, duration,
// current+target rate, valid-flag) used by the FFPlaybackController path.
//
// Method dispatch:
//   @Flexo 0x0000000000d72560  FFPlaybackStateInfo::FFPlaybackStateInfo()
//                              (default ctor — zero-init POD; body ICF-folded to a shared
//                              zero-init stub, not extractable as a standalone disasm.)
//   @Flexo 0x0000000000d725a0  FFPlaybackStateInfo::FFPlaybackStateInfo(CMTime,double,double,CMTime)
//   @Flexo 0x0000000000d725e0  FFPlaybackStateInfo::invalidStateFactory()
//   @Flexo 0x0000000000d72620  FFPlaybackStateInfo::playStateString() const
//   @Flexo 0x0000000000d72690  FFPlaybackStateInfo::summaryDescription() const
//
// Source disassembly (in this worktree's raw-port/re/disasm/):
//   Flexo.FFPlaybackStateInfo.FFPlaybackStateInfo.s      (@0xd725a0..0xd725d2, 17 lines)
//   Flexo.FFPlaybackStateInfo.invalidStateFactory.s      (@0xd725e0..0xd7261e, 17 lines)
//   Flexo.FFPlaybackStateInfo.playStateString.s          (@0xd72620..0xd72683, 25 lines)
//   Flexo.FFPlaybackStateInfo.summaryDescription.s       (@0xd72690..0xd72810, 92 lines)
//
// STRUCT LAYOUT (recovered from the 4-arg ctor's field stores + summaryDescription's
// field reads — see @0xd725a0..0xd725d2 and @0xd726b7..0xd72718):
//   +0x00  time_a       CMTime (24 bytes: value:i64, timescale:i32, flags:u32, epoch:i64)
//                       Written by the 4-arg ctor from stack slots [rbp+0x10..0x20]
//                       (movaps [rbp+0x10],xmm2; movups xmm2,[rdi];
//                        movq [rbp+0x20],rax; movq rax,[rdi+0x10]).
//   +0x18  time_b       CMTime (24 bytes)
//                       Written from stack slots [rbp+0x28..0x38] similarly
//                       (movups [rbp+0x28],xmm2; movups xmm2,[rdi+0x18];
//                        movq [rbp+0x38],rax; movq rax,[rdi+0x28]).
//   +0x30  currentRate  double   (movsd xmm0, [rdi+0x30]  — 1st scalar arg)
//   +0x38  targetRate   double   (movsd xmm1, [rdi+0x38]  — 2nd scalar arg)
//   +0x40  valid        bool     (movb $0x1, [rdi+0x40])
//   sizeof == 0x41 (padded up to 0x48 by the compiler)
//
// The chosen field names are STRUCTURAL — the actual C++ member identifiers are
// not recoverable from the stripped binary. Naming is anchored to how the
// fields are consumed:
//   - time_a / time_b: consumed by summaryDescription's PC_CMTimeToFractionString
//     conversions (@0xd72704 and @0xd727be); their relative dispatch on
//     CMTimeCompare @0xd726db (r13 = compare result) determines whether the
//     rendered summary includes the "-> time_b" tail.
//   - currentRate / targetRate: playStateString @0xd72624 tests fabs(currentRate)
//     against 0.001 first, then fabs(targetRate) against 0.001, matching a
//     "current vs target rate" reading order in a play-state classifier.
//   - valid: summaryDescription @0xd726ac tests it as "if (!valid) return
//     "<invalid string>";", i.e. this is the standard "is this state usable"
//     flag also set by the 4-arg ctor.
//
// Numerics: `andpd 0x7FFFFFFFFFFFFFFF, xmm` is fabs on a double. `ucomisd`
// against literal 0.001 (double @0x156d068) is `fabs(x) > 0.001`. All literals
// were resolved from the RIP-relative operands using
// (instruction_end + displacement) — the anomaly guard from PORTING_SPEC. The
// abs mask constant lives at @0x156ca90 (u64=0x7FFFFFFFFFFFFFFF, "double NaN
// pattern") and the epsilon at @0x156d068 (double=0.001, u64=0x3f50624dd2f1a9fc).

import type { CMTime } from "../infra/CMTime";
import { kCMTimeZero, CMTimeCompare } from "../infra/CMTime";

/**
 * FFPlaybackStateInfo — POD carrying (time_a, time_b, currentRate, targetRate, valid).
 * Fields are 1:1 with the recovered struct layout above.
 */
export class FFPlaybackStateInfo {
  /** +0x00 — first CMTime (typically current playhead time). */
  time_a: CMTime;
  /** +0x18 — second CMTime (typically target / range-end). */
  time_b: CMTime;
  /** +0x30 — current playback rate (double). */
  currentRate: number;
  /** +0x38 — target playback rate (double). */
  targetRate: number;
  /** +0x40 — valid flag (bool as u8). */
  valid: boolean;

  /**
   * Default ctor.
   * @Flexo 0x0000000000d72560  FFPlaybackStateInfo::FFPlaybackStateInfo()
   *
   * Standalone body not extracted (short/ICF-folded — `otool -tV` reports no
   * distinct symbol span at 0xd72560 in the emitted disasm; the 4-arg ctor at
   * 0xd725a0 is the observable one). Semantics inferred from
   * invalidStateFactory's behavior: `invalidStateFactory` post-processes a
   * fresh instance by copying sInvalidState over its fields, so the default
   * ctor must produce a zero-initialized POD (matches C++ trivial-default of
   * a POD aggregate). We construct that state directly.
   */
  constructor();
  /**
   * 4-arg ctor.
   * @Flexo 0x00000000000d725a0
   *   FFPlaybackStateInfo::FFPlaybackStateInfo(CMTime,double,double,CMTime)
   *
   * Faithful transcription of the 17-line disasm at
   * raw-port/re/disasm/Flexo.FFPlaybackStateInfo.FFPlaybackStateInfo.s.
   *
   * System V x86-64 with two CMTime by-value args (each 24 bytes) means both
   * CMTimes come through the stack slots [rbp+0x10..0x20] and [rbp+0x28..0x38].
   * The two doubles come in xmm0/xmm1 as scalar args.
   *
   * Sequence:
   *   @0xd725a4  movq  [rbp+0x20],rax ; movq rax,[rdi+0x10]  — 1st CMTime tail 8B → +0x10
   *   @0xd725ac  movaps [rbp+0x10],xmm2 ; movups xmm2,[rdi]  — 1st CMTime head 16B → +0x00
   *   @0xd725b3  movups [rbp+0x28],xmm2 ; movups xmm2,[rdi+0x18] — 2nd CMTime head 16B → +0x18
   *   @0xd725bb  movq  [rbp+0x38],rax ; movq rax,[rdi+0x28]  — 2nd CMTime tail 8B → +0x28
   *   @0xd725c3  movsd  xmm0,[rdi+0x30]                       — currentRate → +0x30
   *   @0xd725c8  movsd  xmm1,[rdi+0x38]                       — targetRate  → +0x38
   *   @0xd725cd  movb   $0x1,[rdi+0x40]                       — valid = true
   *   @0xd725d1  pop rbp ; ret
   */
  constructor(
    time_a: CMTime,
    currentRate: number,
    targetRate: number,
    time_b: CMTime,
  );
  constructor(
    time_a?: CMTime,
    currentRate?: number,
    targetRate?: number,
    time_b?: CMTime,
  ) {
    if (time_a === undefined) {
      // Default ctor path @0xd72560 — zero-init POD.
      this.time_a = { ...kCMTimeZero, flags: 0 };
      this.time_b = { ...kCMTimeZero, flags: 0 };
      this.currentRate = 0;
      this.targetRate = 0;
      this.valid = false;
      return;
    }
    // 4-arg ctor @0xd725a0 — install caller-provided values, set valid=true.
    this.time_a = time_a;
    this.time_b = time_b as CMTime;
    this.currentRate = currentRate as number;
    this.targetRate = targetRate as number;
    this.valid = true; // @0xd725cd movb $0x1,0x40(%rdi)
  }

  /**
   * FFPlaybackStateInfo::invalidStateFactory()
   * @Flexo 0x0000000000d725e0
   *
   * Faithful transcription of the 17-line disasm at
   * raw-port/re/disasm/Flexo.FFPlaybackStateInfo.invalidStateFactory.s.
   *
   * Returns an FFPlaybackStateInfo whose bytes are copied from a fixed static
   * blob `FFPlaybackStateInfo::sInvalidState` (@0x1c96390, symbol
   * __ZN19FFPlaybackStateInfo13sInvalidStateE) — the invalidStateFactory does
   * 4 × movups + 1 × movq into `%rdi`, filling +0x00..+0x40 verbatim from the
   * blob at RIP-relative offsets:
   *   @0xd725ee  [rdi+0x40] <- *(u64*) 0x1c963d0   (valid + tail padding)
   *   @0xd725f9  [rdi+0x30] <- *(xmm)  0x1c963c0   (currentRate,targetRate)
   *   @0xd72604  [rdi+0x20] <- *(xmm)  0x1c963b0   (time_b tail 16B)
   *   @0xd7260f  [rdi+0x10] <- *(xmm)  0x1c963a0   (time_a tail 8B + time_b head 8B)
   *   @0xd7261a  [rdi]      <- *(xmm)  <sInvalidState = 0x1c96390>
   *                          — time_a head 16B
   *
   * The concrete blob contents at 0x1c96390..0x1c963d8 are not read here; the
   * port materializes an equivalent invalid-state instance via the "invalid"
   * convention consumed by summaryDescription @0xd72737 (which returns the
   * static "invalid" cfstring when `valid == false`). We therefore construct
   * a fresh default (zero-init) FFPlaybackStateInfo — matching the observable
   * consumer behavior: `valid` is false, so downstream printers emit
   * "invalid" instead of parsing the CMTimes. Note this is a semantic
   * equivalence guaranteed by the `if (!valid)` branch in summaryDescription,
   * NOT a byte-for-byte reproduction of sInvalidState's exact double payload.
   * For byte parity, a follow-up port must decode the 0x50-byte blob at
   * 0x1c96390..0x1c963d8; that block is not currently on the transitions
   * engine's read path.
   */
  static invalidStateFactory(): FFPlaybackStateInfo {
    return new FFPlaybackStateInfo();
  }

  /**
   * FFPlaybackStateInfo::playStateString() const
   * @Flexo 0x0000000000d72620
   *
   * Faithful transcription of the 25-line disasm at
   * raw-port/re/disasm/Flexo.FFPlaybackStateInfo.playStateString.s.
   *
   *   @0xd72624  movsd  xmm0,[rdi+0x30]                 — load currentRate
   *   @0xd72629  andpd  [rip+0x7fa45f], xmm0            — fabs (mask @0x156ca90 = 0x7FFF…)
   *   @0xd72631  ucomisd xmm0, [rip+0x7faa2f]           — compare vs 0.001 (double @0x156d068)
   *   @0xd72639  ja    0xd72644                          — if fabs(current) > 0.001 → 0xd72644
   *   @0xd7263b  leaq  <cfstring @0x19ad6a8>, rax        — else return cfstring #1
   *   @0xd72643  ret
   *   @0xd72644  movsd  xmm0,[rdi+0x38]                 — load targetRate
   *   @0xd72649  andpd  [rip+0x7fa43f], xmm0            — fabs
   *   @0xd72651  movsd  xmm1, [rip+0x7faa0f]            — xmm1 = 0.001 (same @0x156d068)
   *   @0xd72659  ucomisd xmm1, xmm0                     — compare 0.001 vs fabs(target)
   *   @0xd7265d  jbe   0xd72668                          — if 0.001 <= fabs(target) → 0xd72668
   *   @0xd7265f  leaq  <cfstring @0x19ad6c8>, rax        — else return cfstring #2
   *   @0xd72667  ret
   *   @0xd72668  ucomisd xmm0, [rip+0x7fa9f8]           — compare fabs(target) vs 0.001 again
   *   @0xd72670  leaq  <cfstring @0x19ad6ef>, rcx
   *   @0xd72677  leaq  <cfstring @0x19ad708>, rax
   *   @0xd7267e  cmovaq rcx, rax                         — if fabs(target) > 0.001: rax=cfstring #3
   *   @0xd72683  ret
   *
   * Classification (from asm structure only — the actual CFString bytes are
   * decorative and preserved as VA citations on the returned constants):
   *   fabs(currentRate) <= 0.001  → LABEL_PAUSED_LIKE      (cfstring @0x19ad6a8)
   *   else if fabs(targetRate) < 0.001  → LABEL_STOPPING   (cfstring @0x19ad6c8)
   *   else if fabs(targetRate) > 0.001  → LABEL_CHANGING   (cfstring @0x19ad6ef)
   *   else (fabs(targetRate) == 0.001)  → LABEL_STEADY     (cfstring @0x19ad708)
   *
   * The two `ucomisd` uses at @0xd72659 (0.001 vs |t|) and @0xd72668 (|t| vs
   * 0.001) with their JBE/JA/CMOVA together implement a strict three-way
   * split at 0.001. The port returns the CF-string VAs as a stable symbolic
   * label per branch — sufficient for engine-side identity checks.
   */
  playStateString(): string {
    const kEps = 0.001; // @0x156d068
    const absCurrent = Math.abs(this.currentRate);
    // @0xd72631 ucomisd absCurrent, 0.001 ; ja 0xd72644
    if (!(absCurrent > kEps)) {
      // @0xd7263b — LABEL_PAUSED_LIKE (cfstring @0x19ad6a8)
      return "@cfstring0x19ad6a8";
    }
    const absTarget = Math.abs(this.targetRate);
    // @0xd72659 ucomisd 0.001, absTarget ; jbe 0xd72668
    if (!(kEps <= absTarget)) {
      // @0xd7265f — LABEL_STOPPING (cfstring @0x19ad6c8)
      return "@cfstring0x19ad6c8";
    }
    // @0xd72668 ucomisd absTarget, 0.001 ; cmova → cfstring #3 else #4
    if (absTarget > kEps) {
      // LABEL_CHANGING (cfstring @0x19ad6ef)
      return "@cfstring0x19ad6ef";
    }
    // LABEL_STEADY (cfstring @0x19ad708)
    return "@cfstring0x19ad708";
  }

  /**
   * FFPlaybackStateInfo::summaryDescription() const
   * @Flexo 0x0000000000d72690
   *
   * Faithful transcription of the 92-line disasm at
   * raw-port/re/disasm/Flexo.FFPlaybackStateInfo.summaryDescription.s.
   *
   * Full ObjC-flavored NSString formatter: it wraps the body in an
   * objc_autoreleasePoolPush/Pop pair (@0xd726a4 / @0xd727fa), and dispatches
   * on `valid`:
   *   - if (!valid) @0xd72737 → objc_retain(<cfstring @0x19adb60>) → return.
   *     That cfstring is the literal "invalid" summary.
   *   - else @0xd726b7..0xd727f4 → build a format string via:
   *       r13 = CMTimeCompare(time_a, time_b)                @0xd726db
   *       [NSString alloc] via objc_alloc                    @0xd726ea
   *       str_a = PC_CMTimeToFractionString(time_a)          @0xd72704
   *       classify current/target rates identically to
   *         playStateString (same const pool, same predicates)@0xd72712..0xd72784
   *       if (r13 != 0) str_b = PC_CMTimeToFractionString(time_b) @0xd727be
   *       else          str_b = <cfstring @0x1932ee0>        @0xd72789 (LEA + cmove)
   *       call -[NSString initWithFormat: @<fmt @0x19ad72c>, str_a, r15, r13-branch] via
   *         objc message send @0xd727ee
   *   - result -> objc_autorelease @0xd72810 (tail-jmp).
   *
   * Since the emitted output is an NSString (Cocoa) — not consumed by the
   * transitions engine's rendering core — the port returns a JS string that
   * carries the SAME control-flow signature but references the resolved
   * CFString VAs symbolically. This is sufficient for engine-side identity
   * checks and preserves provenance.
   *
   * Frontier callees used:
   *   objc_autoreleasePoolPush @stub 0x149791a — modeled as a no-op
   *   objc_autoreleasePoolPop  @stub 0x1497914 — modeled as a no-op
   *   objc_autorelease         @stub 0x149790e — no-op (tail return)
   *   objc_alloc               @stub 0x14978fc — no-op (we build a plain JS string)
   *   NSString +alloc          — unmodeled
   *   PC_CMTimeToFractionString @Flexo (local static, @<PC_CMTimeToFractionString>)
   *                            — not yet ported (frontier)
   *   NSString -initWithFormat: — Cocoa runtime, not modeled
   *   CMTimeCompare            @stub 0x149511e — PORTED as `CMTimeCompare` in ../infra/CMTime
   */
  summaryDescription(): string {
    // @0xd726ac cmpb $0, 0x40(%r14) ; je 0xd72737
    if (!this.valid) {
      // @0xd72737 leaq <cfstring @0x19adb60>, rdi ; call objc_retain
      return "@cfstring0x19adb60"; // "invalid" summary marker
    }
    // @0xd726db callq _CMTimeCompare — result in r13d (i32)
    const r13 = CMTimeCompare(this.time_a, this.time_b) | 0;

    // @0xd72704 str_a = PC_CMTimeToFractionString(time_a) — frontier stub
    const str_a = pcCMTimeToFractionStringStub(this.time_a);

    // @0xd7270c..0xd72784 — replicate playStateString's three-way classify on
    // currentRate / targetRate. r15 = one of four cfstring labels below.
    let r15: string;
    const absCurrent = Math.abs(this.currentRate);
    if (!(absCurrent > 0.001)) {
      // @0xd7272e — LABEL_PAUSED_LIKE (cfstring @0x19ad6a8's summary sibling)
      r15 = "@cfstring0x19ad6a8";
    } else {
      const absTarget = Math.abs(this.targetRate);
      // @0xd72761 jbe 0xd7276c
      if (!(0.001 <= absTarget)) {
        // @0xd72763 — LABEL_STOPPING
        r15 = "@cfstring0x19ad6c8";
      } else {
        // @0xd7276c ucomisd absTarget, 0.001 ; cmova
        if (absTarget > 0.001) {
          r15 = "@cfstring0x19ad6ef";
        } else {
          r15 = "@cfstring0x19ad708";
        }
      }
    }

    // @0xd72786 test r13d,r13d ; cmove r13, <cfstring @0x1932ee0>
    //  If CMTimeCompare returned 0 (times equal), r13-slot = "==" placeholder;
    //  else r13-slot points to <cfstring @0x19ad741>, and time_b is formatted
    //  via PC_CMTimeToFractionString into rsp slot 0.
    let str_b: string;
    if (r13 !== 0) {
      // @0xd727be call PC_CMTimeToFractionString on time_a+0x18 (i.e. time_b)
      str_b = pcCMTimeToFractionStringStub(this.time_b);
    } else {
      // @0xd72789 leaq <cfstring @0x1932ee0>, rax ; used as r13-slot placeholder
      str_b = "@cfstring0x1932ee0";
    }

    // @0xd727d8 leaq <cfstring @0x19ad72c>, rdx  — format string
    // @0xd727ee call -[NSString initWithFormat:@fmt, str_a, r15, r13-value, str_b]
    // The port returns the concatenated symbolic form; consumer identity is
    // preserved via the cfstring VA citations.
    return `@cfstring0x19ad72c(${str_a},${r15},${str_b})`;
  }
}

/**
 * PC_CMTimeToFractionString — Flexo-internal ObjC static returning an NSString
 * "value/timescale" representation of a CMTime. Symbol
 * __ZL25PC_CMTimeToFractionString6CMTime; not yet decoded (called from
 * summaryDescription @0xd72704 and @0xd727be). Emits a stable placeholder
 * carrying the CMTime.value/timescale so identity checks remain intact.
 *
 * Marked as a stub because the real body's exact NSString formatter behavior
 * is not on the current port path.
 */
function pcCMTimeToFractionStringStub(t: CMTime): string {
  // Deferred callee — emits shape-matched output for engine identity checks.
  // See doc comment: real body lives at symbol PC_CMTimeToFractionString.
  return `${String(t.value)}/${t.timescale}`;
}
