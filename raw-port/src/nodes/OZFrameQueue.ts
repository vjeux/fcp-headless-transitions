// OZFrameQueue.ts — Ozone frame-queue direction setter (raw x86_64 port).
//
// Source: /Applications/Final Cut Pro.app/Contents/Frameworks/Ozone.framework/
//         Versions/A/Ozone (macOS FCP, x86_64 slice)
//
// The single method ported here (`setForward(bool)`) is a state mutator that
// records two things:
//   1. A bool flag at (this+0x68) — "am I playing forward?" (the argument
//      as-is, no transform).
//   2. A 24-byte CMTime struct at (this+0x6c..0x84) — a "direction sentinel"
//      constructed by `CMTimeMakeWithEpoch(0, 1, epoch)` where
//         epoch = -1                 when forward=true
//         epoch = INT64_MAX (0x7fff…) when forward=false
//      i.e. the queue stamps a sentinel time whose *epoch* encodes the
//      playback direction while its value/timescale are 0/1 (i.e.
//      `kCMTimeZero`-shaped except for the epoch field).
//
// `CMTimeMakeWithEpoch` is a CoreMedia PUBLIC API (dyld shared cache), same
// out-of-scope-extern status as every other `CMTime*` symbol modelled in
// raw-port/src/infra/CMTime.ts.  We construct the CMTime struct in TS
// directly — same technique CMTime.ts uses for `kCMTimeZero`, `CMTimeMake`,
// etc. — instead of dispatching to an unmodelled foreign function.  The
// disasm proves this is safe: the entire semantic content of
// CMTimeMakeWithEpoch, as consumed by this call site, is "assemble a
// CMTime struct from {value, timescale, epoch} with flags=Valid".  Every
// numeric constant below is cited at its disasm site.
//
// -----------------------------------------------------------------------------
// FULL DISASM  (raw-port/re/disasm/__ZN12OZFrameQueue10setForwardEb.s)
// -----------------------------------------------------------------------------
//   __ZN12OZFrameQueue10setForwardEb:
//     0x628b30  pushq   %rbp                                 ; frame prologue
//     0x628b31  movq    %rsp, %rbp
//     0x628b34  pushq   %rbx
//     0x628b35  subq    $0x18, %rsp
//     0x628b39  movq    %rdi, %rbx                           ; rbx = this
//     0x628b3c  movb    %sil, 0x68(%rdi)                     ; this[+0x68] = forward
//     0x628b40  addq    $0x6c, %rbx                          ; rbx = &this[+0x6c]  (CMTime slot)
//     0x628b44  leaq    -0x20(%rbp), %rdi                    ; rdi = &sret_out (24B CMTime buf)
//     0x628b48  testl   %esi, %esi                           ; forward ?
//     0x628b4a  je      0x628b5c                             ;   je => forward=false branch
//     ; --- forward = TRUE branch (epoch = -1) ---
//     0x628b4c  xorl    %esi, %esi                           ; value    (int64) = 0
//     0x628b4e  movl    $0x1, %edx                           ; timescale(int32) = 1
//     0x628b53  movq    $-0x1, %rcx                          ; epoch    (int64) = -1
//     0x628b5a  jmp     0x628b6d
//     ; --- forward = FALSE branch (epoch = INT64_MAX = 0x7fffffffffffffff) ---
//     0x628b5c  movabsq $0x7fffffffffffffff, %rcx            ; epoch = INT64_MAX
//     0x628b66  xorl    %esi, %esi                           ; value    = 0
//     0x628b68  movl    $0x1, %edx                           ; timescale = 1
//     ; --- common tail: call CoreMedia CMTimeMakeWithEpoch(&out, val, ts, epoch) ---
//     0x628b6d  callq   _CMTimeMakeWithEpoch                 ; @stub 0x6dcace
//     0x628b72  movq    -0x10(%rbp), %rax                    ; rax = high 8B of returned CMTime
//     0x628b76  movq    %rax, 0x10(%rbx)                     ; store to this[0x6c+0x10] = this[0x7c]
//     0x628b7a  movups  -0x20(%rbp), %xmm0                   ; xmm0 = low 16B of returned CMTime
//     0x628b7e  movups  %xmm0, (%rbx)                        ; store to this[0x6c..0x7b]
//     0x628b81  addq    $0x18, %rsp
//     0x628b85  popq    %rbx
//     0x628b86  popq    %rbp
//     0x628b87  retq
//
// -----------------------------------------------------------------------------
// SHAPE — recovered from this disasm ONLY
// -----------------------------------------------------------------------------
//   OZFrameQueue (this):
//     +0x68  forward flag         (bool, 1 byte) — written direct from %sil.
//     +0x6c  direction sentinel   (CMTime, 24 bytes — {value, timescale, flags, epoch}):
//             +0x6c  value       (int64)
//             +0x74  timescale   (int32)
//             +0x78  flags       (uint32)
//             +0x7c  epoch       (int64)
//
// The CMTime layout is documented in raw-port/src/infra/CMTime.ts (matches
// CoreMedia's public CMTime.h struct layout).  The `movups (%rbx)` writes
// the low 16 bytes (value+timescale+flags) and the `movq 0x10(%rbx)` writes
// the high 8 bytes (epoch) — exactly matching CMTime's 24-byte size and
// field ordering.
//
// -----------------------------------------------------------------------------
// FRONTIER CALLEES (one, CoreMedia public API — modelled locally)
// -----------------------------------------------------------------------------
//   * _CMTimeMakeWithEpoch @Ozone stub 0x6dcace (called @0x628b6d).
//     CoreMedia public API — same status as every CMTime* callee in this
//     port (CMTimeMake / CMTimeAdd / CMTimeCompare / CMTimeGetSeconds
//     etc. modelled inline in raw-port/src/infra/CMTime.ts).  We construct
//     the resulting struct directly in TS from its documented semantics
//     (`{value, timescale, flags=Valid, epoch}`) rather than dispatching
//     to an unmodelled extern.  See CMTime.ts for the layout constants
//     imported here.
//
// -----------------------------------------------------------------------------
// Symbols ported here (mangled → address)
// -----------------------------------------------------------------------------
//   * __ZN12OZFrameQueue10setForwardEb
//         OZFrameQueue::setForward(bool)   @0x628b30

import { kCMTimeFlags_Valid, type CMTime } from "../infra/CMTime";

/**
 * `OZFrameQueue` — instance shape decoded from `setForward(bool)` alone.
 *
 * Only two field slots are exercised by this method: a bool at +0x68 and a
 * 24-byte CMTime at +0x6c. Additional queue state (the actual frame ring,
 * lock state, etc.) is not touched here so it is not modelled — future
 * porters will add fields as new methods land.  We keep the two slots
 * explicit rather than hiding them behind an opaque blob so the
 * offset-preserving nature of the port is auditable.
 */
export class OZFrameQueue {
  /**
   * (this+0x68) — the raw "playing forward?" bool.  Written verbatim from
   * the low byte of the argument register at disasm 0x628b3c
   * (`movb %sil, 0x68(%rdi)`), independent of the CMTime-sentinel store
   * below.  Kept as a boolean here; the machine stores {0,1} in one byte.
   */
  forward_at_0x68 = false;

  /**
   * (this+0x6c) — 24-byte direction-sentinel CMTime.  Constructed by the
   * common tail at disasm 0x628b6d..0x628b7e:
   *   xmm0 = { value: 0, timescale: 1, flags: <coremedia>, ...low16B }
   *   rax  = { epoch: -1 or INT64_MAX }
   * i.e. a `kCMTimeZero`-shaped time whose epoch encodes direction.
   * Initial value is a Valid zero-time with epoch 0 (matches
   * `kCMTimeZero` — see CMTime.ts).
   */
  directionCMTime_at_0x6c: CMTime = {
    value: 0n,
    timescale: 1,
    flags: kCMTimeFlags_Valid,
    epoch: 0n,
  };

  // ═════════════════════════════════════════════════════════════════════════
  // OZFrameQueue::setForward(bool)
  //
  // Disassembly source:
  //   raw-port/re/disasm/__ZN12OZFrameQueue10setForwardEb.s
  //
  // (Full disasm quoted in the file-header comment above.)
  //
  // FRONTIER CALLEES: _CMTimeMakeWithEpoch (CoreMedia public API — modelled
  //                                          locally per CMTime.ts convention).
  // ═════════════════════════════════════════════════════════════════════════
  /**
   * `OZFrameQueue::setForward(bool)` — @Ozone 0x628b30
   * (__ZN12OZFrameQueue10setForwardEb).
   *
   * Faithful transcription of the disassembly above.  Stamps the raw bool
   * at this+0x68, then constructs the 24-byte CMTime sentinel at this+0x6c
   * via `CMTimeMakeWithEpoch(0, 1, epoch)` where the sign of `epoch`
   * encodes the play direction (-1 for forward, INT64_MAX for backward).
   */
  setForward(forward: boolean): void {
    // ------------------------------------------------------------
    // @0x628b3c  movb %sil, 0x68(%rdi)  :  this->forward_at_0x68 = forward
    // The store is unconditional and happens BEFORE the CMTime-sentinel
    // work — the disasm places it at 0x628b3c, ahead of the branch at
    // 0x628b48.  We mirror that ordering.
    // ------------------------------------------------------------
    this.forward_at_0x68 = forward;

    // ------------------------------------------------------------
    // @0x628b40  addq $0x6c, %rbx                : rbx = &this[+0x6c]
    // @0x628b44  leaq -0x20(%rbp), %rdi          : rdi = &sret_out
    // @0x628b48  testl %esi, %esi                : forward ?
    // @0x628b4a  je  0x628b5c                    :   choose branch:
    //
    //   TRUE branch  (@0x628b4c..0x628b5a):
    //     xorl %esi, %esi   ; value     = 0
    //     movl $0x1, %edx   ; timescale = 1
    //     movq $-0x1, %rcx  ; epoch     = -1        (const @0x628b53)
    //     jmp  common_tail
    //
    //   FALSE branch (@0x628b5c..0x628b68):
    //     movabsq $0x7fffffffffffffff, %rcx ; epoch = INT64_MAX (const @0x628b5c)
    //     xorl %esi, %esi   ; value     = 0
    //     movl $0x1, %edx   ; timescale = 1
    // ------------------------------------------------------------
    // @const 0x628b4c  value     = 0    (int64)
    const value = 0n;
    // @const 0x628b4e / 0x628b68  timescale = 1  (int32)
    const timescale = 1;
    // @const 0x628b53   epoch = -1                 (forward=true branch)
    // @const 0x628b5c   epoch = 0x7fffffffffffffff (forward=false branch)
    const epoch: bigint = forward ? -1n : 0x7fffffffffffffffn;

    // ------------------------------------------------------------
    // @0x628b6d  callq _CMTimeMakeWithEpoch(&sret_out, value, timescale, epoch)
    //
    // CoreMedia public API — same treatment as every other CMTime* callee
    // in this port (see raw-port/src/infra/CMTime.ts).  Per CoreMedia's
    // public CMTime.h documentation, `CMTimeMakeWithEpoch(value, ts, epoch)`
    // returns `{ .value = value, .timescale = ts, .flags = kCMTimeFlags_Valid,
    // .epoch = epoch }` (matching the initialiser used for kCMTimeZero in
    // CMTime.ts — that structure is the ts==1, value==0 case with epoch=0).
    //
    // The subsequent stores at 0x628b72..0x628b7e (`movq %rax, 0x10(%rbx)`
    // + `movups %xmm0, (%rbx)`) simply copy the 24-byte returned struct
    // into this[+0x6c..+0x84].  We mirror that as one CMTime object
    // assignment.
    // ------------------------------------------------------------
    const sret_out: CMTime = {
      value,
      timescale,
      flags: kCMTimeFlags_Valid,
      epoch,
    };

    // ------------------------------------------------------------
    // @0x628b72  movq -0x10(%rbp), %rax           : rax = sret_out.epoch (hi 8B)
    // @0x628b76  movq %rax, 0x10(%rbx)            : this[+0x7c] = epoch
    // @0x628b7a  movups -0x20(%rbp), %xmm0        : xmm0 = sret_out.{value,ts,flags}
    // @0x628b7e  movups %xmm0, (%rbx)             : this[+0x6c..+0x7b] = value/ts/flags
    // Combined effect: this.directionCMTime_at_0x6c = sret_out.
    // ------------------------------------------------------------
    this.directionCMTime_at_0x6c = sret_out;

    // @0x628b81..0x628b87  addq $0x18, %rsp ; popq %rbx ; popq %rbp ; retq
  }
}
