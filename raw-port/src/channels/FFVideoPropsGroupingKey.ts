// raw-port/src/channels/FFVideoPropsGroupingKey.ts
//
// FCP `FFVideoPropsGroupingKey` — Flexo grouping-key record used to bucket
// video-clip properties by (frame size, frame duration, edit duration).
// A pure POD-copy ctor over: CGSize + CMTime + CMTime. Presumably used as
// a std::map key elsewhere in Flexo to coalesce clips that share the same
// (size, frame duration, edit duration) triple.
//
// FRAMEWORK: Flexo.framework  (FAT slice offset 0x4000; thin binary
// /tmp/Flexo.x86_64 has VA == file offset; segment __TEXT vmaddr = 0.)
//
// DISASSEMBLY:
//   raw-port/re/disasm/Flexo.FFVideoPropsGroupingKey.FFVideoPropsGroupingKey.s
//
// SYMBOLS (Flexo x86_64):
//   @Flexo 0x0000000000fd5980  FFVideoPropsGroupingKey::FFVideoPropsGroupingKey(CGSize, CMTime, CMTime)   [C1]
//     __ZN23FFVideoPropsGroupingKeyC1E6CGSize6CMTimeS1_
//
// STRUCT LAYOUT (recovered from C1 @0xfd5980):
//   +0x00 : f64      size.width     (from xmm0     — movsd  %xmm0,(%rdi))
//   +0x08 : f64      size.height    (from xmm1     — movsd  %xmm1,0x8(%rdi))
//   +0x10 : i64      frameDuration.value      (from rbp+0x10, 16-byte block — movaps 0x10(%rbp),%xmm0; movups %xmm0,0x10(%rdi))
//   +0x18 : i32/i32  frameDuration.timescale+flags  (upper half of that 16-byte block)
//   +0x20 : i64      frameDuration.epoch    (from rbp+0x20 — movq 0x20(%rbp),%rax; movq %rax,0x20(%rdi))
//   +0x28 : i64      editDuration.value       (from rbp+0x28, 16-byte block — movups 0x28(%rbp),%xmm0; movups %xmm0,0x28(%rdi))
//   +0x30 : i32/i32  editDuration.timescale+flags   (upper half of that 16-byte block)
//   +0x38 : i64      editDuration.epoch     (from rbp+0x38 — movq 0x38(%rbp),%rax; movq %rax,0x38(%rdi))
//   sizeof = 0x40 = 64 bytes.
//
//   CGSize is 16 bytes (2 f64) — passed in xmm0/xmm1 per SysV AAPCS.
//   CMTime is 24 bytes (i64 value @+0, i32 timescale @+8, u32 flags @+0xc,
//   i64 epoch @+0x10) — see raw-port/src/infra/CMTime.ts. Because it's
//   >16B, CMTime args are passed on the stack starting at rbp+0x10 and
//   rbp+0x28 respectively.
//
// DECODE-DON'T-FIT: the ctor is a straight-line memcpy-shaped POD store.
// The TS port uses plain readonly fields; observable identical to the
// C++ struct because C++ has no dtor / no vtable here and the class is
// used purely as a value / map key.

import type { CGSize } from "./FFAutoReframeAnalysis";
import type { CMTime } from "../infra/CMTime";

/**
 * `FFVideoPropsGroupingKey` — plain grouping-key value type.
 *
 * The C++ class has a single trivial copy-shape ctor and no other methods
 * in the ledger; it's a POD "record" used to group video clips that share
 * the same (frame size, frame duration, edit duration). The three
 * components map 1:1 onto CGSize + CMTime + CMTime in the class layout.
 *
 * Immutable after construction (all fields readonly), matching the C++
 * usage pattern of const-only reads via map/set comparators.
 */
export class FFVideoPropsGroupingKey {
  /** Field @ +0x00 (CGSize, 16 B). Frame size (width/height as f64). Written @0xfd5984+0xfd5988. */
  readonly size: CGSize;
  /** Field @ +0x10 (CMTime, 24 B). Frame duration (rational time). Written @0xfd598d..0xfd5999. */
  readonly frameDuration: CMTime;
  /** Field @ +0x28 (CMTime, 24 B). Edit duration (rational time). Written @0xfd599d..0xfd59a9. */
  readonly editDuration: CMTime;

  /**
   * `FFVideoPropsGroupingKey::FFVideoPropsGroupingKey(CGSize, CMTime, CMTime)`
   * — C1 ctor @Flexo 0xfd5980.
   *
   * Body (line-for-line to the disasm):
   *   movsd  %xmm0,   0x00(%rdi)       ; size.width  ← xmm0
   *   movsd  %xmm1,   0x08(%rdi)       ; size.height ← xmm1
   *   movaps 0x10(%rbp), %xmm0
   *   movups %xmm0,   0x10(%rdi)       ; frameDuration low 16 B ← rbp+0x10
   *   movq   0x20(%rbp), %rax
   *   movq   %rax,    0x20(%rdi)       ; frameDuration epoch    ← rbp+0x20
   *   movups 0x28(%rbp), %xmm0
   *   movups %xmm0,   0x28(%rdi)       ; editDuration low 16 B  ← rbp+0x28
   *   movq   0x38(%rbp), %rax
   *   movq   %rax,    0x38(%rdi)       ; editDuration epoch     ← rbp+0x38
   *   ret
   */
  constructor(size: CGSize, frameDuration: CMTime, editDuration: CMTime) {
    this.size = size;
    this.frameDuration = frameDuration;
    this.editDuration = editDuration;
  }
}
