// FFAudioScrubBallisticsMgr.ts — raw transcription of the Flexo class `FFAudioScrubBallisticsMgr`.
//
// ONE symbol is transcribed in this file — `updateActualScrubPosition(double, CMTime)`. Every other
// member of the class is a SEPARATE ledger unit and is NOT ported here; do not add one without its
// own disassembly and address citations. The siblings, for orientation only (from
// `grep FFAudioScrubBallisticsMgr raw-port/army/inventory/Flexo.syms.txt`):
//   0xd1a4f0  FFAudioScrubBallisticsMgr()                       [C2]
//   0xd1a680  ~FFAudioScrubBallisticsMgr()                      [D1/D2, ICF-folded]
//   0xd1a6e0  resetUIPosition(CMTime)
//   0xd1a810  resetUIPosition(double, CMTime)
//   0xd1a8a0  updateUIPosition(CMTime)
//   0xd1aaa0  getCurrentScrubRate(CMTime&, float&, bool&, CMTime&)
//   0xd1ac00  updateScrubEvents()
//   0xd1aeb0  getScrubRate(double, float&, bool&) const
//   0xd1b6f0  resetActualScrubPosition(double, CMTime)
//
// Provenance (Flexo framework, x86_64 slice):
//   /Applications/Final Cut Pro.app/Contents/Frameworks/Flexo.framework/Versions/A/Flexo
//
// Symbol ported in this file:
//   @0xd1b6b0  FFAudioScrubBallisticsMgr::updateActualScrubPosition(double, CMTime)
//                __ZN25FFAudioScrubBallisticsMgr25updateActualScrubPositionEd6CMTime
//
// Source disassembly (re-derived from the binary with `raw-port/tools/disasm.sh --sym
// __ZN25FFAudioScrubBallisticsMgr25updateActualScrubPositionEd6CMTime Flexo`):
//   raw-port/re/disasm/__ZN25FFAudioScrubBallisticsMgr25updateActualScrubPositionEd6CMTime.s
//   (19 lines)
//
// ---------------------------------------------------------------------------
// FULL DISASM — the whole function, every instruction
// ---------------------------------------------------------------------------
//   0xd1b6b0  pushq  %rbp                  ; frame setup (no TS counterpart)
//   0xd1b6b1  movq   %rsp, %rbp
//   0xd1b6b4  testb  $0x1, 0x1c(%rbp)      ; the CMTime argument's FLAGS field & 1  (see ABI note)
//   0xd1b6b8  je     0xd1b6e9              ;   not valid -> return, changing nothing
//   0xd1b6ba  leaq   0x10(%rbp), %rax      ; rax = &argument CMTime (it is a STACK argument)
//   0xd1b6be  movq   0x10(%rdi), %rcx      ; rcx = this->actualSamplesAt10  (the 0x40-byte buffer)
//   0xd1b6c2  movups 0x20(%rcx), %xmm1     ; xmm1 = slot1[0x00..0x0f]
//   0xd1b6c6  movups 0x30(%rcx), %xmm2     ; xmm2 = slot1[0x10..0x1f]
//   0xd1b6ca  movups %xmm2, 0x10(%rcx)     ; slot0[0x10..0x1f] = slot1[0x10..0x1f]
//   0xd1b6ce  movups %xmm1, (%rcx)         ; slot0[0x00..0x0f] = slot1[0x00..0x0f]
//   0xd1b6d1  movq   0x10(%rdi), %rcx      ; re-load the buffer pointer (the compiler does not
//                                          ;   keep it live across the two 16-byte moves)
//   0xd1b6d5  movsd  %xmm0, 0x20(%rcx)     ; slot1.rate = the double argument
//   0xd1b6da  movq   0x10(%rax), %rdx      ; rdx = arg.epoch      (CMTime +0x10)
//   0xd1b6de  movq   %rdx, 0x38(%rcx)      ; slot1.time.epoch = arg.epoch
//   0xd1b6e2  movups (%rax), %xmm0         ; xmm0 = arg.value | arg.timescale | arg.flags
//                                          ;   (CMTime +0x00..+0x0f, one 16-byte read)
//   0xd1b6e5  movups %xmm0, 0x28(%rcx)     ; slot1.time.{value,timescale,flags} = those
//   0xd1b6e9  popq   %rbp                  ; frame teardown (no TS counterpart)
//   0xd1b6ea  retq                         ; void return
//   0xd1b6eb  nopl   (%rax,%rax)           ; alignment padding, not executed
//
// WHERE THE ARGUMENTS ARE, because the whole function turns on it. System-V AMD64: `this` is %rdi
// and the `double` is %xmm0, but a 24-byte `CMTime` is MEMORY-class and is therefore passed on the
// STACK. With the frame set up, the first stack argument begins at 0x10(%rbp) — 0x00(%rbp) holds the
// saved rbp and 0x08(%rbp) the return address. So:
//
//   0x10(%rbp)  arg.value      (int64)      \
//   0x18(%rbp)  arg.timescale  (int32)       > the CMTime, 24 bytes
//   0x1c(%rbp)  arg.flags      (uint32)     /
//   0x20(%rbp)  arg.epoch      (int64)
//
// which is why the guard reads 0x1c(%rbp): it is `arg.flags & kCMTimeFlags_Valid`. An INVALID CMTime
// (`kCMTimeInvalid` has flags 0, and it is exactly what the constructor fills both slots with) makes
// the function a no-op — nothing is shifted and nothing is stored.
//
// ---------------------------------------------------------------------------
// LAYOUT — recovered from the constructor
// ---------------------------------------------------------------------------
// The C2 ctor @0xd1a4f0 (`raw-port/re/disasm/__ZN25FFAudioScrubBallisticsMgrC2Ev.s`) allocates TWO
// 0x40-byte arrays with `operator new[](0x40)` (@0xd1a511 and @0xd1a564) and stores them at +0x00
// and +0x10, each preceded by a count of 2 at +0x08 and +0x18:
//
//   struct FFAudioScrubBallisticsMgr {
//     +0x00  Sample* uiSamples          ; new[](0x40)  @0xd1a50c/@0xd1a54c
//     +0x08  size_t  2                  ; @0xd1a504
//     +0x10  Sample* actualSamples      ; new[](0x40)  @0xd1a55f/@0xd1a598
//     +0x18  size_t  2                  ; @0xd1a557
//     +0x20  ...                        ; zeroed @0xd1a5a3
//     +0x38  FFLock                     ; FFLock::FFLock() @0xd1a5b3
//     +0x90  int 0                      ; @0xd1a5b8
//   };
//
// and it initialises each 0x40-byte array as TWO 0x20-byte records:
//
//   0xd1a569  movq   $0x0, (%rax)          ; slot0.rate = 0.0   (all-zero bits)
//   0xd1a574  movups kCMTimeInvalid -> 0x8 ; slot0.time.{value,timescale,flags}
//   0xd1a57c  movq   kCMTimeInvalid+0x10 -> 0x18(%rax)  ; slot0.time.epoch
//   0xd1a580  movq   $0x0, 0x20(%rax)      ; slot1.rate = 0.0
//   0xd1a58c  movups kCMTimeInvalid -> 0x28
//   0xd1a594  movq   kCMTimeInvalid+0x10 -> 0x38
//
//   struct Sample { double rate; CMTime time; };   // 8 + 24 = 0x20 bytes
//
// That 0x20 stride is what makes the addresses in the ported body readable: 0x00/0x20 are the two
// `rate` fields and 0x08/0x28 the two `time` fields, and `updateActualScrubPosition` copies slot1
// into slot0 and then overwrites slot1 — a two-deep history of (rate, time) samples, newest last.
// The ctor is its own ledger unit and is NOT ported here; it is read for the layout, and for the
// initial values, which is the rule the #492 rework established (a field default comes from the
// ctor, not from a guess).
//
// CALLEES: none. No in-scope call, no extern, no allocation, no indirect and no virtual dispatch —
// `depgraph.py deps __ZN25FFAudioScrubBallisticsMgr25updateActualScrubPositionEd6CMTime` lists
// nothing.
//
// ---------------------------------------------------------------------------
// ORACLE — verified by CALLING the live Flexo function
// ---------------------------------------------------------------------------
// raw-port/re/oracle/FFAudioScrubBallisticsMgr_updateActualScrubPosition_oracle.py, under
// `arch -x86_64 /usr/bin/python3` because this port is transcribed from the x86_64 slice. The
// symbol is a LOCAL (`nm` type `t`), so it is called at
// `_dyld_get_image_vmaddr_slide(Flexo) + 0xd1b6b0` with the vmaddr from the cached x86_64
// inventory, and the harness verifies the prologue bytes there before believing any number. The
// object is fabricable because the method reads exactly one member, the buffer pointer at +0x10.
//
// Measured run:
//   SELF-CHECK PASS       slide 0x129723000; inventory vmaddr == 0xd1b6b0;
//                         prologue bytes 55 48 89 e5 f6 45 1c 01
//   (1) validity guard    7/7   calls with flags 0x00, 0x02, 0x04, 0x08, 0x10, 0x80000000 and
//                               0xFFFFFFFE — every one of them WITHOUT bit 0 — left the whole
//                               0x40-byte buffer byte-identical
//   (2) slot0 = old slot1 35/35 over 7 rates x 5 CMTimes
//   (3) slot1 = new       35/35 with the rate compared as RAW BITS, so -0.0 and NaN are exact
//       nothing outside   35/35 the 0x20-byte poison guards on each side of the buffer, and the
//                               rest of the 0x100-byte object, are untouched
//
// Negative controls, all killed: no validity guard (7 invalid cases); guard testing bit 1 instead
// of bit 0 (4 flag values, which is why the corpus carries 0x02, 0x03, 0x11 and 0xFFFFFFFE);
// storing without the slot1 -> slot0 shift (35); value and epoch swapped in the store (28).
//
// Note the corpus includes `flags = 0xFFFFFFFF` on the VALID side and `0xFFFFFFFE` on the invalid
// side: the guard is a single-bit test, and only a pair like that separates it from "flags is
// non-zero".

import type { CMTime } from "../infra/CMTime.js";
import { kCMTimeFlags_Valid } from "../infra/CMTime.js";

/**
 * One 0x20-byte entry of the manager's sample history: a scrub rate and the time it was observed
 * at. The size and field offsets come from the constructor's initialisation of the two 0x40-byte
 * arrays (see the file header) — `rate` at +0x00 and a 24-byte `CMTime` at +0x08.
 *
 * @Flexo 0xd1a569 (rate) / 0xd1a574 (time)
 */
export interface FFAudioScrubBallisticsSample {
  /** +0x00 — the scrub rate. Written by `movsd %xmm0, 0x20(%rcx)` @0xd1b6d5 for slot 1. */
  rate: number;
  /** +0x08 — the sample's CMTime. Written by @0xd1b6de (epoch) and @0xd1b6e5 (the other three). */
  time: CMTime;
}

/**
 * `FFAudioScrubBallisticsMgr` — Flexo's audio-scrub ballistics tracker.
 *
 * Only the member the transcribed method touches is modelled: the `actualSamples` buffer at +0x10.
 * The `uiSamples` buffer at +0x00, the two counts, the FFLock at +0x38 and the int at +0x90 are
 * recorded in the layout comment but are not fields here, because this method never reads them and
 * inventing state a transcribed body does not use is how two models of one class start to drift.
 *
 * @Flexo 0xd1b6b0
 */
export class FFAudioScrubBallisticsMgr {
  /**
   * +0x10 — `Sample actualSamples[2]`, the two-deep history of actual scrub positions.
   *
   * The pointer at +0x10 is a `operator new[](0x40)` allocation of two 0x20-byte records
   * (@0xd1a55f/@0xd1a598), with the element count 2 stored beside it at +0x18 (@0xd1a557). It is
   * modelled as a fixed two-element TS array rather than a pointer, which is what the count makes
   * it: the ported body indexes it only at the two constant offsets 0x00 and 0x20.
   *
   * INITIAL VALUE, taken from the constructor rather than assumed: both slots start
   * `{ rate = 0.0, time = kCMTimeInvalid }` — the rate from `movq $0x0` @0xd1a569/@0xd1a580 and the
   * time from the three moves out of `_kCMTimeInvalid` @0xd1a574/@0xd1a57c and
   * @0xd1a58c/@0xd1a594. `kCMTimeInvalid` has flags 0, so a freshly constructed manager holds two
   * samples that are not valid — which matters, because the guard in the method below is a test of
   * exactly that flag on its argument.
   */
  actualSamplesAt10: [FFAudioScrubBallisticsSample, FFAudioScrubBallisticsSample] = [
    { rate: 0, time: { value: 0n, timescale: 0, flags: 0, epoch: 0n } },
    { rate: 0, time: { value: 0n, timescale: 0, flags: 0, epoch: 0n } },
  ];

  /**
   * `FFAudioScrubBallisticsMgr::updateActualScrubPosition(double, CMTime)` — @Flexo 0xd1b6b0
   *   (__ZN25FFAudioScrubBallisticsMgr25updateActualScrubPositionEd6CMTime).
   *
   * Push a (rate, time) sample onto the two-deep actual-position history: the newer slot becomes
   * the older one, and the argument becomes the newer. An INVALID time is ignored entirely.
   *
   * @param rate the `double` in %xmm0.
   * @param time the `CMTime` passed BY VALUE on the stack at 0x10(%rbp) — see the ABI note in the
   *             file header, which is what makes the guard's `0x1c(%rbp)` the flags field.
   */
  updateActualScrubPosition(rate: number, time: CMTime): void {
    // @0xd1b6b4  testb $0x1, 0x1c(%rbp) ; @0xd1b6b8 je 0xd1b6e9
    //   0x1c(%rbp) is the CMTime argument's flags word and $0x1 is kCMTimeFlags_Valid. ZF set (the
    //   bit clear) jumps straight to the epilogue, so an invalid time changes NOTHING — no shift
    //   and no store. The constructor fills both slots with kCMTimeInvalid, whose flags are 0.
    if ((time.flags & kCMTimeFlags_Valid) === 0) {
      // @0xd1b6e9..@0xd1b6ea — popq %rbp ; retq.
      return;
    }

    // @0xd1b6be  movq 0x10(%rdi), %rcx — the actualSamples buffer.
    const samples = this.actualSamplesAt10;

    // @0xd1b6c2..@0xd1b6ce — slot0 = slot1, done as two 16-byte moves. Both halves of slot1 are
    //   LOADED first (xmm1 = 0x20, xmm2 = 0x30) and only then stored (0x10 then 0x00), so the copy
    //   is atomic with respect to itself; the store order is the reverse of the load order and has
    //   no observable effect because source and destination do not overlap.
    const newer = samples[1];
    samples[0] = {
      rate: newer.rate,
      time: {
        value: newer.time.value,
        timescale: newer.time.timescale,
        flags: newer.time.flags,
        epoch: newer.time.epoch,
      },
    };

    // @0xd1b6d1  movq 0x10(%rdi), %rcx — the buffer pointer is re-loaded here in the binary. No TS
    //   counterpart: it is the same object, and nothing between the two loads could change it.
    // @0xd1b6d5  movsd %xmm0, 0x20(%rcx)  — slot1.rate = rate.
    // @0xd1b6da/@0xd1b6de  movq 0x10(%rax),%rdx ; movq %rdx,0x38(%rcx) — slot1.time.epoch first.
    // @0xd1b6e2/@0xd1b6e5  movups (%rax),%xmm0 ; movups %xmm0,0x28(%rcx) — then value+timescale+
    //   flags in one 16-byte move. The epoch is written BEFORE the other three; the order is
    //   preserved in the object literal below for readability of the correspondence, and is not
    //   observable from outside since no other thread is modelled.
    samples[1] = {
      rate: rate,
      time: {
        epoch: time.epoch,
        value: time.value,
        timescale: time.timescale,
        flags: time.flags,
      },
    };
    // @0xd1b6e9..@0xd1b6ea — popq %rbp ; retq.
  }
}
