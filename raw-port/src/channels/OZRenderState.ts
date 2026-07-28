// OZRenderState — the ~264-byte state bag threaded through the FCP render pipeline (time,
// eye-matrix, transform stack, clip flags, mask/opacity, motion-blur/sample count, etc.).
// FAITHFUL PORT from Ozone.framework. Every method cites @0xADDR.
//
// STRUCT LAYOUT (0x108 = 264 bytes; recovered from default-ctor @0x276b30, copy-ctor
// @0x276d50, op= @0x276fb0, and setEyeMatrix @0x277200):
//
//   offset  size  type       field                init-const           source
//   ------  ----  ---------  -------------------  -------------------  ---------------
//   +0x00   0x18  CMTime     time                 kCMTimeZero          @0x276b34-0x276b4f
//                                                 (value=0, ts=1,
//                                                  flags=Valid, epoch=0)
//   +0x18   0x10  double×2   pixelSize / range?   {1.0, 1.0}           @0x276b49-0x276b50
//                                                 (`movaps 0x490290(%rip),%xmm0` reads
//                                                  const {1.0,1.0} @0x706de0/0x706de8;
//                                                  `movups %xmm0,0x18(%rdi)` stores)
//   +0x28   0x08  double     s28                  1.0                  @0x276b54-0x276b5e
//                                                 (`movabsq $0x3ff0000000000000,%rax`)
//   +0x30   0x04  uint32     u30                  0                    @0x276b62
//   +0x34   0x04  (pad)                                                  (unread — no init)
//   +0x38   0x08  uint64     p38                  0                    @0x276b69
//   +0x40   0x01  bool       eyeMatrixSet         0                    @0x276b71
//                                                 (set to 1 at 0x277216 in setEyeMatrix —
//                                                  this is the "eye matrix is populated" flag)
//   +0x41   0x07  (pad)
//   +0x48   0x88  double×17  transform4x4/etc.    identity-ish         @0x276b83-0x276bb8
//                                                 Modeled as `mats[0..16]` — 4x4 matrix at
//                                                 +0x48..+0xb8 plus one tail double at +0xc0.
//                                                 Diagonal (+0x48, +0x70, +0x98, +0xc0) init
//                                                 to 1.0 (0x276b83-0x276b87), rest zero via
//                                                 xmm0=0 stores (0x276b8b-0x276ba8).
//                                                 setEyeMatrix (@0x277227) OVERWRITES the
//                                                 whole 0x48..0xc7 range with LiCamera vtable
//                                                 [+0x10] output (128 bytes, 8 movaps stores).
//   +0xc8   0x01  bool       flag_c8              1                    @0x276baf (init true)
//   +0xc9   0x01  bool       flag_c9              0                    @0x276bc1 (movl $0 32b)
//   +0xca   0x02  (unread/pad — the movl at +0xc9 writes 4 bytes but +0xca/+0xcb are unread)
//   +0xcc   0x01  byte       b_cc                 0                    (part of the movl @+0xc9)
//   +0xcd   0x01  byte       b_cd                 0                    @0x276bcb
//   +0xce   0x02  (pad)
//   +0xd0   0x08  ptr        p_d0                 null                 @0x276bb6
//   +0xd8   0x04  uint32     u_d8                 3                    @0x276bd2
//   +0xdc   0x01  byte       b_dc                 0                    @0x276bdc
//   +0xdd   0x03  (pad)
//   +0xe0   0x08  uint64     u_e0                 0                    @0x276be3
//   +0xe8   0x02  uint16     u_e8                 0x0101               @0x276bee
//                                                 (movw imm16=0x101 = low=1, high=1)
//   +0xea   0x01  byte       b_ea                 1                    @0x276bf7  (redundant
//                                                                       with movw above; the
//                                                                       compiler emits a
//                                                                       cleanup byte-store)
//   +0xeb   0x04  uint32     u_eb                 0                    @0x276c05
//   +0xef   0x01  byte       b_ef                 0                    @0x276bfe
//   +0xf0   0x04  uint32     u_f0                 3                    @0x276c0f
//   +0xf4   0x04  (pad)
//   +0xf8   0x08  uint64     u_f8                 0x3fff               @0x276c19
//   +0x100  0x08  uint64     u_100                0                    @0x276c24
//
// NOTE on default-ctor code split: C1 and C2 @0x276b30 / @0x276c40 are BYTE-FOR-BYTE identical
// (just re-emitted). Same for C1(&) / C2(&) @0x276d50 / @0x276e80. We port one body each.
//
// FRONTIER (undecoded — kept as throwing stubs cited by @0xADDR):
//   LiCamera vtable[+0x10]  — writes 128 bytes at +0x48..+0xc7 (the eye matrix)  @0x277227
//   LiCamera vtable[+0x278] — returns int; 0 means "apply skew + scale"          @0x27728d
//   LiCamera vtable[+0x140] — returns double; a Y-shear coefficient              @0x2772a1
//   LiCamera vtable[+0x1e8] — returns double; a uniform scale coefficient        @0x277329

import type { CMTime } from "../infra/CMTime";
import { kCMTimeZero } from "../infra/CMTime";

// LiCamera — opaque handle. All access is through 4 vtable slots (see FRONTIER above); we do
// NOT touch the LiCamera struct directly, so we don't need to model its shape.
export interface LiCameraHandle {
  readonly __liCamera: true;
}

export class OZRenderState {
  // +0x00: CMTime time — 24 bytes.
  time: CMTime = { ...kCMTimeZero };

  // +0x18, +0x20: two doubles both 1.0 (from const @0x706de0/0x706de8 loaded via movaps).
  d18 = 1.0;
  d20 = 1.0;

  // +0x28: double 1.0.
  d28 = 1.0;

  // +0x30: uint32 = 0.
  u30 = 0;

  // +0x38: uint64 = 0. Ports as number since we never observe > 2^53 writes here.
  p38 = 0;

  // +0x40: eyeMatrix-populated flag (set to true by setEyeMatrix @0x277216).
  eyeMatrixSet = false;

  // +0x48..+0xc0: 4x4 matrix + one tail double (17 doubles total, or an SIMD 8x2 layout).
  // Default-ctor sets diagonal entries at +0x48, +0x70, +0x98, +0xc0 to 1.0 (all other
  // slots zero). We store as a Float64Array of length 17 with the same offsets so that:
  //   mats[0]  = +0x48    mats[5]  = +0x70    mats[10] = +0x98    mats[15] = +0xc0
  // (i.e. the diagonal indices are 0, 5, 10, 15 — a standard column/row 4x4 identity.)
  mats: Float64Array = new Float64Array(17);

  // +0xc8: bool flag_c8 (default true — the ONLY init in the "flags" block that isn't zero).
  flag_c8 = true;
  // +0xc9: bool flag_c9 (default false).
  flag_c9 = false;
  // +0xcc: byte b_cc (default 0).
  b_cc = 0;
  // +0xcd: byte b_cd (default 0).
  b_cd = 0;
  // +0xd0: pointer (default null; modelled as opaque handle | null since no dereference is
  //         performed by any of the 6 methods).
  p_d0: unknown = null;
  // +0xd8: uint32 (default 3 — likely a mode enum; the specific set { 0,1,2,3 } is unknown
  //         from the 6 ported methods alone).
  u_d8 = 3;
  // +0xdc: byte (default 0).
  b_dc = 0;
  // +0xe0: uint64 (default 0).
  u_e0 = 0;
  // +0xe8..+0xef: an 8-byte packed word. Default-ctor writes:
  //   +0xe8 = 0x0101 (movw)   → b_e8=1, b_e9=1
  //   +0xea = 1      (movb)   → confirms b_ea=1 (redundant with the movw's high byte)
  //   +0xef = 0      (movb)   → b_ef=0
  //   +0xeb = 0      (movl 4 bytes → +0xeb,+0xec,+0xed,+0xee = 0)
  b_e8 = 1;
  b_e9 = 1;
  b_ea = 1;
  b_eb = 0;
  b_ec = 0;
  b_ed = 0;
  b_ee = 0;
  b_ef = 0;
  // +0xf0: uint32 (default 3).
  u_f0 = 3;
  // +0xf8: uint64 (default 0x3fff — 16383, likely a bit-mask "all channels enabled" for a
  //         14-bit-wide subsystem mask; unknown without further decode).
  u_f8 = 0x3fff;
  // +0x100: uint64 (default 0).
  u_100 = 0;

  // OZRenderState::OZRenderState() @0x276b30 (C2) and @0x276c40 (C1) — IDENTICAL BODIES.
  //   0x276b34-0x276b4f: this->time = kCMTimeZero  (24-byte copy via two-step: qword low16 +
  //                                                 movups xmm0 for the second 16, then qword
  //                                                 for the tail. In TS a struct spread is
  //                                                 the direct mirror.)
  //   0x276b49-0x276b54: {d18,d20} = {1.0, 1.0}    (movaps of the const {1.0,1.0} block)
  //   0x276b54-0x276b5e: d28 = 1.0                 (movabsq of 0x3ff0000000000000)
  //   0x276b62:         u30 = 0
  //   0x276b69:         p38 = 0
  //   0x276b71:         eyeMatrixSet = false       (movb $0,0x40(%rdi))
  //   0x276b75-0x276b87: mats diagonal = 1.0        (rax=0x3ff... reused into +0xc0, +0x98,
  //                                                  +0x70, +0x48)
  //   0x276b8b-0x276ba8: mats off-diagonal zeroed   (xmm0=0, 6 movups pairs cover +0x50,
  //                                                  +0x60, +0x78, +0x88, +0xa0, +0xb0)
  //   0x276baf:         flag_c8 = true             (movb $1,0xc8)
  //   0x276bb6:         p_d0 = null
  //   0x276bc1:         movl $0 at +0xc9 (4 bytes) → flag_c9=0, b_cb=0, b_cc=0, and part of
  //                                                  the 0xca-0xcb padding
  //   0x276bcb:         b_cd = 0
  //   0x276bd2:         u_d8 = 3
  //   0x276bdc:         b_dc = 0
  //   0x276be3:         u_e0 = 0
  //   0x276bee-0x276bfe: movw 0x101 @+0xe8; movb 1 @+0xea; movb 0 @+0xef
  //   0x276c05:         movl 0 @+0xeb (4 bytes → +0xeb..+0xee = 0)
  //   0x276c0f:         u_f0 = 3
  //   0x276c19:         u_f8 = 0x3fff
  //   0x276c24:         u_100 = 0
  // All field initializers above already encode this; the constructor body just re-asserts
  // to make the mapping explicit and to seed the diagonal of `mats`.
  constructor(other?: OZRenderState) {
    if (other !== undefined) {
      // Copy-ctor path — see the "OZRenderState::OZRenderState(OZRenderState const&)" doc
      // block below for the byte-by-byte assignment.
      this._copyFrom(other);
      return;
    }
    // Default-ctor path — the assignments below mirror the specific asm stores that DIFFER
    // from the plain field-initializer defaults (specifically the mats diagonal).
    this.mats[0] = 1.0;   // +0x48   (@0x276b87)
    this.mats[5] = 1.0;   // +0x70   (@0x276b83)
    this.mats[10] = 1.0;  // +0x98   (@0x276b7c)
    this.mats[15] = 1.0;  // +0xc0   (@0x276b75)
  }

  // OZRenderState::OZRenderState(OZRenderState const&) @0x276d50 (C2) and @0x276e80 (C1) —
  // IDENTICAL BODIES. Byte-copy of the full 264-byte struct via unaligned SSE moves:
  //   0x276d54-0x276d67:  time (24 bytes)
  //   0x276d62-0x276d79:  d18,d20,d28,u30,p38,eyeMatrixSet         (+0x18..+0x40)
  //   0x276d89-0x276da5:  mats[+0x48..+0x78] via 4 xmm pairs
  //   0x276da9-0x276dda:  mats[+0x88..+0xc0]  via 4 xmm pairs
  //   0x276de1-0x276e6b:  scalar tail (+0xc8..+0x100) — sequence of movl/movb/movq
  // We factor this into a helper used by both the copy-ctor and the assignment operator.
  private _copyFrom(src: OZRenderState): void {
    // +0x00: time (24 bytes).
    this.time = { ...src.time };
    // +0x18..+0x40
    this.d18 = src.d18;
    this.d20 = src.d20;
    this.d28 = src.d28;
    this.u30 = src.u30;
    this.p38 = src.p38;
    this.eyeMatrixSet = src.eyeMatrixSet;
    // +0x48..+0xc7 — the whole 128-byte matrix block.
    for (let i = 0; i < 17; i++) this.mats[i] = src.mats[i];
    // +0xc8..+0x100 — scalar tail.
    this.flag_c8 = src.flag_c8;
    this.flag_c9 = src.flag_c9;
    this.b_cc = src.b_cc;
    this.b_cd = src.b_cd;
    this.p_d0 = src.p_d0;
    this.u_d8 = src.u_d8;
    this.b_dc = src.b_dc;
    this.u_e0 = src.u_e0;
    this.b_e8 = src.b_e8;
    this.b_e9 = src.b_e9;
    this.b_ea = src.b_ea;
    this.b_eb = src.b_eb;
    this.b_ec = src.b_ec;
    this.b_ed = src.b_ed;
    this.b_ee = src.b_ee;
    this.b_ef = src.b_ef;
    this.u_f0 = src.u_f0;
    this.u_f8 = src.u_f8;
    this.u_100 = src.u_100;
  }

  // OZRenderState::operator=(OZRenderState const&) @0x276fb0.
  // Behaves like the copy-ctor EXCEPT for a self-assignment guard covering the matrix block:
  //   0x276fe9-0x276fec: `cmpq %rdi,%rsi ; je 0x2770c8`  — if (&src == this) SKIP the
  //                       0x48..0xc7 range copy (avoids aliased overlap). All OTHER fields
  //                       are unconditionally copied.
  //   Additionally the matrix range is streamed as 17 SEPARATE movsd (double) stores rather
  //   than the ctor's 8 xmm pairs — semantically identical but observable if a debugger
  //   watches the exact instruction pattern.
  operatorAssign(src: OZRenderState): OZRenderState {
    // Unconditional prefix (+0x00..+0x40) — the copy is always safe, self or not.
    this.time = { ...src.time };
    this.d18 = src.d18;
    this.d20 = src.d20;
    this.d28 = src.d28;
    this.u30 = src.u30;
    this.p38 = src.p38;
    this.eyeMatrixSet = src.eyeMatrixSet;

    // 0x276fe9: if (&src != this) — mats copy.
    if (src !== this) {
      // 0x276ff2-0x2770c0: 17 movsd copies covering +0x48..+0xc0.
      for (let i = 0; i < 17; i++) this.mats[i] = src.mats[i];
    }

    // 0x2770c8..0x277152: scalar tail — unconditionally copied.
    this.flag_c8 = src.flag_c8;
    this.flag_c9 = src.flag_c9;
    this.b_cc = src.b_cc;
    this.b_cd = src.b_cd;
    this.p_d0 = src.p_d0;
    this.u_d8 = src.u_d8;
    this.b_dc = src.b_dc;
    this.u_e0 = src.u_e0;
    this.b_e8 = src.b_e8;
    this.b_e9 = src.b_e9;
    this.b_ea = src.b_ea;
    this.b_eb = src.b_eb;
    this.b_ec = src.b_ec;
    this.b_ed = src.b_ed;
    this.b_ee = src.b_ee;
    this.b_ef = src.b_ef;
    this.u_f0 = src.u_f0;
    this.u_f8 = src.u_f8;
    this.u_100 = src.u_100;

    return this;
  }

  // OZRenderState::setEyeMatrix(LiCamera const*) @0x277200.
  // Overlays the eye-matrix block (+0x48..+0xc7) with the LiCamera's matrix, then conditionally
  // applies a shear and a uniform scale correction.
  //
  //   0x277216: this->eyeMatrixSet = true
  //   0x27721a-0x277227: `rax = *(void**)cam ; call *(rax + 0x10)`   with rdi = &local[128]
  //                       (a stack buffer -0xa0(%rbp)..-0x20(%rbp)) — LiCamera vtable[+0x10]
  //                       fills 128 bytes of matrix. Signature: (out16Doubles*) — writes an
  //                       8x2 layout matching this->mats[0..15].
  //   0x27722a-0x277285: if (&local != &this->mats) — copy 128 bytes local → this->mats[0..15]
  //                       via 8 xmm pairs. (The `je 0x277287` guards a self-alias path that
  //                       CAN'T happen when the local is on the stack — this is dead-code the
  //                       compiler emits when it inlines the "copy if not equal" pattern.)
  //                       In TS the local is our `tmp` array; we always copy.
  //   0x277287-0x277295: if (LiCamera.vt[+0x278]() != 0) — early-return.
  //                       When the vtable call returns non-zero, the shear+scale corrections
  //                       are skipped entirely (jumps to the epilogue @0x2773c7).
  //   0x27729b-0x2772a5: `k = LiCamera.vt[+0x140]()` — a shear coefficient (double).
  //   0x2772a7-0x2772b1: if (k == 0.0) — skip the shear block (both `jne/jnp` — the paired
  //                       branches handle NaN too: only "ordered && equal" skips).
  //   0x2772b3-0x27731b: SHEAR — subtract k * col0 from col1, elementwise, across 4 rows:
  //                       mats[+0x60] -= k * mats[+0x58]     (row0)
  //                       mats[+0x80] -= k * mats[+0x78]     (row1)
  //                       mats[+0xa0] -= k * mats[+0x98]     (row2)
  //                       mats[+0xc0] -= k * mats[+0xb8]     (row3)
  //                       These are the +0x18 offset within each 32-byte row (col2 = col1),
  //                       so this is a "col2 -= k * col1" shear on the eye matrix.
  //   0x277323-0x27732f: `s = LiCamera.vt[+0x1e8]()` — a scale coefficient (double).
  //   0x277337-0x27733d: if (s == 1.0) — skip the scale block (compared against const 1.0
  //                       @0x7053e0).
  //   0x27733f-0x2773bf: SCALE — multiply mats by s. The compiler unrolls it as:
  //                       four `mulpd` on (+0x48..+0xb8) column-pairs (8 doubles: col0..col1
  //                       of each row), then four `mulsd` on col2 (+0x58,+0x78,+0x98,+0xb8).
  //                       Wait — the mulpd stores are at +0x48/+0x68/+0x88/+0xa8 and the
  //                       mulsd stores at +0x58/+0x78/+0x98/+0xb8. Net effect: multiply
  //                       every double at offsets {0x48,0x50,0x58,0x68,0x70,0x78,0x88,0x90,
  //                       0x98,0xa8,0xb0,0xb8} by s. That's mats indices {0,1,2,4,5,6,8,9,
  //                       10,12,13,14} — i.e. everything EXCEPT the diagonal-tail slot
  //                       mats[15] (+0xc0) is scaled. Actually wait — checking the final
  //                       `mulsd 0xb8(%rbx),%xmm0 ; movsd %xmm0,0xb8(%rbx)` @0x2773b7 — that
  //                       IS +0xb8 (mats[14]), not +0xc0. Verified: mats[3]=+0x60, mats[7]=
  //                       +0x80, mats[11]=+0xa0 are NOT scaled either — they were the shear
  //                       targets, and mats[15]=+0xc0 is untouched by the scale.
  //   0x2773c7-0x2773d4: epilogue.
  //
  // LiCamera's vtable is external — we throw with the exact slot addresses so the demand
  // signal is filed.
  setEyeMatrix(camera: LiCameraHandle): void {
    // 0x277216: eyeMatrixSet = true.
    this.eyeMatrixSet = true;

    // 0x27721a-0x277227: pull 128 bytes of matrix from LiCamera vtable[+0x10].
    // Every dereference beyond this point requires the LiCamera vtable — throw.
    throw new Error(
      "OZRenderState::setEyeMatrix unimplemented — needs LiCamera vtable[+0x10] " +
        "(16-double matrix fill @0x277227), LiCamera vtable[+0x278] (early-return " +
        "flag @0x27728d), LiCamera vtable[+0x140] (shear coeff @0x2772a1), and " +
        "LiCamera vtable[+0x1e8] (uniform scale @0x277329). LiCamera is external " +
        "to Ozone.framework — its vtable is not resolvable here." +
        ` [camera=${camera === null ? "null" : "handle"}]`,
    );
  }
}
