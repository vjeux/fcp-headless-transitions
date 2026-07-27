// OZDropTargetInfo — Ozone class. Decoded surface = its constructor pair
// (Itanium ABI C1 complete-object ctor and C2 base-object ctor). Both bodies
// are byte-identical field-initializations; they zero a ~208-byte instance and
// place three CMTime-shaped slots and one raw 16-byte constant.
//
// Provenance / DECODE:
//   __ZN16OZDropTargetInfoC2Ev @0x00000000002bd190 (base-object ctor)
//   __ZN16OZDropTargetInfoC1Ev @0x00000000002bd230 (complete-object ctor)
//   Framework: Ozone.framework
//   Disassembly: raw-port/re/disasm/OZDropTargetInfo.OZDropTargetInfo.s
//
// Both bodies are the same instruction sequence at different addresses. What
// follows is the C2 body at 0x2bd190 (C1 mirrors it exactly, shifted by 0xA0):
//
//   @0x2bd194  xorps  %xmm0,%xmm0                     // xmm0 = 0
//   @0x2bd197  movups %xmm0,      0xc0(%rdi)          // zero [0xc0..0xcf]
//   @0x2bd19e  movq   $0x0,       0xd0(%rdi)          // zero [0xd0..0xd7]
//   @0x2bd1a9  movups %xmm0,      0x20(%rdi)          // zero [0x20..0x2f]
//   @0x2bd1ad  movups %xmm0,      0x10(%rdi)          // zero [0x10..0x1f]
//   @0x2bd1b1  movups %xmm0,      (%rdi)              // zero [0x00..0x0f]
//   @0x2bd1b4  movq   $0x0,       0x30(%rdi)          // zero [0x30..0x37]
//   @0x2bd1bc  movq   _kCMTimeZero(%rip),%rax
//   @0x2bd1c3  movups (%rax),     %xmm1
//   @0x2bd1c6  movups %xmm1,      0x38(%rdi)          // [0x38..0x47] = kCMTimeZero low16
//   @0x2bd1ca  movq   0x10(%rax), %rcx
//   @0x2bd1ce  movq   %rcx,       0x48(%rdi)          // [0x48..0x4f] = kCMTimeZero.epoch
//   @0x2bd1d2  movq   _kCMTimeNegativeInfinity(%rip),%rcx
//   @0x2bd1d9  movups (%rcx),     %xmm1
//   @0x2bd1dc  movups %xmm1,      0x50(%rdi)          // [0x50..0x5f] = kCMTimeNegInf low16
//   @0x2bd1e0  movq   0x10(%rcx), %rcx
//   @0x2bd1e4  movq   %rcx,       0x60(%rdi)          // [0x60..0x67] = kCMTimeNegInf.epoch
//   @0x2bd1e8  movb   $0x1,       0x68(%rdi)          // [0x68]      = 1
//   @0x2bd1ec  movaps 0x44de9d(%rip),%xmm1  ## -> VA 0x70b130 (16-byte __TEXT/__const)
//   @0x2bd1f3  movups %xmm1,      0x6c(%rdi)          // [0x6c..0x7b] = CONST16
//   @0x2bd1f7  movq   0x10(%rax), %rcx
//   @0x2bd1fb  movq   %rcx,       0x8c(%rdi)          // [0x8c..0x93] = kCMTimeZero.epoch
//   @0x2bd202  movups (%rax),     %xmm1
//   @0x2bd205  movups %xmm1,      0x7c(%rdi)          // [0x7c..0x8b] = kCMTimeZero low16
//   @0x2bd209  movups (%rax),     %xmm1
//   @0x2bd20c  movups %xmm1,      0x94(%rdi)          // [0x94..0xa3] = kCMTimeZero low16
//   @0x2bd213  movq   0x10(%rax), %rax
//   @0x2bd217  movq   %rax,       0xa4(%rdi)          // [0xa4..0xab] = kCMTimeZero.epoch
//   @0x2bd21e  movups %xmm0,      0xac(%rdi)          // zero [0xac..0xbb]
//   @0x2bd225  retq
//
// CONST16 at __TEXT/__const 0x70b130 (16 bytes, read directly from the x86_64
// slice of the Ozone binary at fat-offset 0x4000 + 0x70b130):
//   raw bytes: 00 00 00 00 00 00 00 00  08 00 00 00 00 00 00 00
//   viewed as (int64,int64) = (0, 8)
//   viewed as (int32,int32,int32,int32) = (0, 0, 8, 0)
//   viewed as CMTime-low16 = value=0 (i64), timescale=8 (i32), flags=0 (u32)
//
// The write pattern at offsets 0x38 / 0x50 / 0x6c / 0x7c / 0x94 shows FIVE
// CMTime-shaped slots — but they aren't uniformly spaced 24 bytes apart.
// The observed spans:
//   [0x38..0x4f]  CMTime = kCMTimeZero               (24 B, low16 @ 0x38 + epoch @ 0x48)
//   [0x50..0x67]  CMTime = kCMTimeNegativeInfinity   (24 B, low16 @ 0x50 + epoch @ 0x60)
//   [0x68]        uint8  = 1                          ( 1 B, a flag byte)
//   [0x6c..0x83]  CMTime = {value:0, timescale:8, flags:0, epoch:0}
//                                                    (24 B — low16 = CONST16 @ 0x6c;
//                                                     epoch @ 0x84 is left zero via the
//                                                     xmm0-zeroed initial fill at [0x30..0x37]
//                                                     — NO — actually [0x84..0x8b] gets
//                                                     re-covered by the low16-of-slot-4
//                                                     write at 0x7c..0x8b. So slot-3's
//                                                     epoch qword IS the low 8 bytes of
//                                                     kCMTimeZero which equals 0 anyway.)
//   [0x7c..0x93]  CMTime = kCMTimeZero               (24 B, low16 @ 0x7c + epoch @ 0x8c)
//   [0x94..0xab]  CMTime = kCMTimeZero               (24 B, low16 @ 0x94 + epoch @ 0xa4)
//   [0xac..0xbb]  zeros                              (16 B, xmm0)
//   [0xc0..0xcf]  zeros                              (16 B, xmm0)
//   [0xd0..0xd7]  zero qword                         ( 8 B)
//
// The ctor touches through 0xd7 → the class instance is at least 0xd8 (216) bytes.
// It never installs a vtable pointer at [0x00..0x07] — this class has no virtual
// methods reachable from the ctor decode. The name "OZDropTargetInfo" plus the
// data footprint (three time ranges + a "kind" byte at 0x68 + a "duration/scale"
// CMTime at 0x6c whose timescale is a magic 8) suggests this is a passive data
// descriptor holding drop-zone timing state for the Ozone runtime — likely
// used by a drop-target / transition-media resolver we haven't hit yet.
//
// Frontier callees / referenced constants:
//   _kCMTimeZero              @DATA_CONST — read at @0x2bd1bc  (16+8 bytes)
//   _kCMTimeNegativeInfinity  @DATA_CONST — read at @0x2bd1d2  (16+8 bytes)
//   CONST16 @0x70b130         @TEXT/__const — read at @0x2bd1ec (16 bytes)
//
// No callq/vtable/stub in either body. No frontier CLASSES surfaced (all
// operands are data reads of already-decoded CMTime constants).

import {
  type CMTime,
  kCMTimeZero,
  kCMTimeFlags_Valid,
  kCMTimeFlags_NegativeInfinity,
} from "../infra/CMTime";

// kCMTimeNegativeInfinity — CoreMedia public constant, not yet declared in the
// CMTime.ts port. Public CMTime.h definition:
//   const CMTime kCMTimeNegativeInfinity = { 0, 0, kCMTimeFlags_Valid |
//     kCMTimeFlags_NegativeInfinity, 0 };
// Referenced from OZDropTargetInfo ctor @0x2bd1d2 as _kCMTimeNegativeInfinity
// (Ozone imports it from CoreMedia's __DATA_CONST GOT). Placed here (not in
// CMTime.ts) to keep this port scoped to a single class; a future CMTime.ts
// touch-up should hoist it up.
// @const CoreMedia CMTime.h  (Ozone GOT ref @0x2bd1d2)
const kCMTimeNegativeInfinity: CMTime = {
  value: 0n,
  timescale: 0,
  flags: kCMTimeFlags_Valid | kCMTimeFlags_NegativeInfinity,  // 0x01 | 0x08 = 0x09
  epoch: 0n,
};

// CONST16 at __TEXT/__const 0x70b130 — the 16-byte block movaps'd into offset
// 0x6c in the ctor. Materialized as a CMTime low-16 (value=0, timescale=8,
// flags=0). Documented in the header comment above.
// @const Ozone __TEXT/__const 0x70b130 (ref @0x2bd1ec)
function makeSlot3CMTime(): CMTime {
  return {
    value: 0n,       // low 8 bytes of CONST16
    timescale: 8,    // bytes [0x08..0x0b] of CONST16
    flags: 0,        // bytes [0x0c..0x0f] of CONST16 — NOTE: flags=0 means the
                     // CMTime is INVALID per kCMTimeFlags_Valid. This is
                     // exactly what the raw bytes say; not a bug in the port.
    epoch: 0n,       // xmm0-zero + kCMTimeZero.epoch(=0) writes at 0x84.
  };
}

/**
 * OZDropTargetInfo — passive data descriptor holding drop-zone timing state.
 *
 * Instance layout (recovered strictly from the ctor decode; only offsets
 * the ctor actually touches are named — offsets it xmm0-zeroes are captured
 * as `_pad*` byte-buffers to preserve the ~216-byte footprint faithfully):
 *
 *   +0x00  16 B  xmm0-zero (unknown 16-byte field)                _pad00
 *   +0x10  16 B  xmm0-zero                                          _pad10
 *   +0x20  16 B  xmm0-zero                                          _pad20
 *   +0x30   8 B  qword-zero                                         _pad30
 *   +0x38  24 B  CMTime = kCMTimeZero                                timeA
 *   +0x50  24 B  CMTime = kCMTimeNegativeInfinity                    timeB
 *   +0x68   1 B  uint8 = 1                                           flag68
 *   +0x69   3 B  padding to next slot's alignment (not written)     _pad69
 *   +0x6c  24 B  CMTime = {value:0, timescale:8, flags:0, epoch:0}   timeC
 *   +0x7c  24 B  CMTime = kCMTimeZero  (overlaps timeC.epoch @0x84)  timeD
 *                — NOTE overlap: writes at 0x6c(16B) then 0x7c(16B)
 *                  then 0x8c(8B) then 0x94(16B) then 0xa4(8B) mean the
 *                  physical byte layout is:
 *                    [0x6c..0x7b] = CONST16 (timeC low16)
 *                    [0x7c..0x8b] = kCMTimeZero.low16 (timeD low16)
 *                    [0x8c..0x93] = kCMTimeZero.epoch (timeD.epoch)
 *                    [0x94..0xa3] = kCMTimeZero.low16 (timeE low16)
 *                    [0xa4..0xab] = kCMTimeZero.epoch (timeE.epoch)
 *                  So timeC has no epoch slot of its own; its "epoch" bytes
 *                  are physically shared with timeD.low16. We model timeC
 *                  with epoch=0n to match kCMTimeZero.low16's first 8 bytes
 *                  (value field = 0), which is what a reader interpreting
 *                  [0x6c..0x83] as a CMTime would see. This is faithful to
 *                  the raw layout.
 *   +0x94  24 B  CMTime = kCMTimeZero                                timeE
 *   +0xac  16 B  xmm0-zero                                          _padAC
 *   +0xbc   4 B  (not touched — implied padding to next 16-B slot)   _padBC
 *   +0xc0  16 B  xmm0-zero                                          _padC0
 *   +0xd0   8 B  qword-zero                                         _padD0
 *
 * sizeof(OZDropTargetInfo) ≥ 0xd8 (216).
 */
export class OZDropTargetInfo {
  _pad00: Uint8Array;  // [0x00..0x0f]  xmm0-zeroed @0x2bd1b1
  _pad10: Uint8Array;  // [0x10..0x1f]  xmm0-zeroed @0x2bd1ad
  _pad20: Uint8Array;  // [0x20..0x2f]  xmm0-zeroed @0x2bd1a9
  _pad30: bigint;      // [0x30..0x37]  qword-zeroed @0x2bd1b4

  timeA: CMTime;       // [0x38..0x4f]  = kCMTimeZero              @0x2bd1c6/@0x2bd1ce
  timeB: CMTime;       // [0x50..0x67]  = kCMTimeNegativeInfinity  @0x2bd1dc/@0x2bd1e4
  flag68: number;      // [0x68]         = 1                        @0x2bd1e8
  _pad69: Uint8Array;  // [0x69..0x6b]  alignment padding (untouched by ctor)
  timeC: CMTime;       // [0x6c..0x83]  low16 = CONST16 @0x70b130   @0x2bd1f3
  timeD: CMTime;       // [0x7c..0x93]  low16 = kCMTimeZero.low16, epoch = kCMTimeZero.epoch
                       //               @0x2bd205/@0x2bd1fb
  timeE: CMTime;       // [0x94..0xab]  = kCMTimeZero               @0x2bd20c/@0x2bd217
  _padAC: Uint8Array;  // [0xac..0xbb]  xmm0-zeroed @0x2bd21e
  _padC0: Uint8Array;  // [0xc0..0xcf]  xmm0-zeroed @0x2bd197
  _padD0: bigint;      // [0xd0..0xd7]  qword-zeroed @0x2bd19e

  /**
   * OZDropTargetInfo() — both C1 and C2 constructors have identical bodies;
   * a single TS ctor faithfully models both.
   *
   * @Ozone 0x00000000002bd190 (_ZN16OZDropTargetInfoC2Ev, base-object ctor)
   * @Ozone 0x00000000002bd230 (_ZN16OZDropTargetInfoC1Ev, complete-object ctor)
   */
  constructor() {
    // @0x2bd1b1  movups %xmm0, (%rdi)         — zero [0x00..0x0f]
    this._pad00 = new Uint8Array(16);
    // @0x2bd1ad  movups %xmm0, 0x10(%rdi)     — zero [0x10..0x1f]
    this._pad10 = new Uint8Array(16);
    // @0x2bd1a9  movups %xmm0, 0x20(%rdi)     — zero [0x20..0x2f]
    this._pad20 = new Uint8Array(16);
    // @0x2bd1b4  movq  $0x0, 0x30(%rdi)       — zero [0x30..0x37]
    this._pad30 = 0n;

    // @0x2bd1bc-@0x2bd1ce  slot @0x38 = kCMTimeZero
    //   movq _kCMTimeZero(%rip),%rax ; movups (%rax),%xmm1 ; movups %xmm1,0x38(%rdi)
    //   movq 0x10(%rax),%rcx        ; movq %rcx,0x48(%rdi)
    // Structural copy — the raw asm bitwise-copies the CMTime bytes; we
    // reproduce that by cloning the struct fields.
    this.timeA = {
      value: kCMTimeZero.value,
      timescale: kCMTimeZero.timescale,
      flags: kCMTimeZero.flags,
      epoch: kCMTimeZero.epoch,
    };

    // @0x2bd1d2-@0x2bd1e4  slot @0x50 = kCMTimeNegativeInfinity
    //   movq _kCMTimeNegativeInfinity(%rip),%rcx ; movups (%rcx),%xmm1 ;
    //   movups %xmm1,0x50(%rdi) ; movq 0x10(%rcx),%rcx ; movq %rcx,0x60(%rdi)
    this.timeB = {
      value: kCMTimeNegativeInfinity.value,
      timescale: kCMTimeNegativeInfinity.timescale,
      flags: kCMTimeNegativeInfinity.flags,
      epoch: kCMTimeNegativeInfinity.epoch,
    };

    // @0x2bd1e8  movb $0x1, 0x68(%rdi)         — [0x68] = 1
    this.flag68 = 1;

    // @0x2bd1e9-@0x2bd1eb  bytes [0x69..0x6b] never touched by the ctor —
    // they retain the caller-provided zero fill (`new` in C++ zero-inits
    // POD-in-class-mem-init contexts; for parity we materialize a zero pad).
    this._pad69 = new Uint8Array(3);

    // @0x2bd1ec-@0x2bd1f3  slot low16 @0x6c = CONST16 (see makeSlot3CMTime)
    // @0x2bd1f7-@0x2bd1fb  epoch @0x8c = kCMTimeZero.epoch (=0) — this write
    //                     lands in what would be timeD's epoch region physically.
    // @0x2bd202-@0x2bd205  low16 @0x7c = kCMTimeZero.low16 — this write lands
    //                     in timeC's own epoch bytes physically. In our field
    //                     modeling we assign timeC.epoch=0 (matches the fact
    //                     that kCMTimeZero.value = 0 gets written into those
    //                     bytes) and give timeD its own {low16 + epoch}
    //                     pair as the ctor's later writes end up defining.
    this.timeC = makeSlot3CMTime();
    this.timeD = {
      value: kCMTimeZero.value,       // low 8 of kCMTimeZero written @0x7c
      timescale: kCMTimeZero.timescale, // bytes [0x84..0x87] via the xmm1 upper half
      flags: kCMTimeZero.flags,         // bytes [0x88..0x8b] via the xmm1 upper half
      epoch: kCMTimeZero.epoch,         // qword @0x8c
    };

    // @0x2bd209-@0x2bd217  slot @0x94 = kCMTimeZero
    //   movups (%rax),%xmm1 ; movups %xmm1,0x94(%rdi) ;
    //   movq 0x10(%rax),%rax ; movq %rax,0xa4(%rdi)
    this.timeE = {
      value: kCMTimeZero.value,
      timescale: kCMTimeZero.timescale,
      flags: kCMTimeZero.flags,
      epoch: kCMTimeZero.epoch,
    };

    // @0x2bd21e  movups %xmm0, 0xac(%rdi)     — zero [0xac..0xbb]
    this._padAC = new Uint8Array(16);
    // @0x2bd197  movups %xmm0, 0xc0(%rdi)     — zero [0xc0..0xcf]  (early in ctor)
    this._padC0 = new Uint8Array(16);
    // @0x2bd19e  movq  $0x0, 0xd0(%rdi)      — zero [0xd0..0xd7]
    this._padD0 = 0n;
    // @0x2bd225  retq
  }
}
