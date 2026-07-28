// raw-port: FFSchedQueueingInfo_MaxInHelium — Flexo framework (channels layer)
//
// A tiny 20-byte plain-old-data (POD) struct describing a "max frames in
// Helium" queue-sizing hint attached to FFSchedQueueingInfo. Consumed by
// -[FFSchedQueueingInfo initWithFFDestVideoQueueDuration:frameDuration:
//                       reorderQueueCount:maxInHelium:] @0x12ee410, which
// heap-allocates a 20-byte copy via `operator new(20)` (__Znwm) and
// stashes the pointer at `self.maxInHelium` (offset +0x40 on
// FFSchedQueueingInfo). See -[FFSchedQueueingInfo maxInHelium] just
// below at @0x12ee4e0.
//
// The class exposes 3 methods:
//   0x012ee390  ctor(int, int, int, int, int)   — 5-field POD init
//   0x012ee3b0  validate()                       — sanity-check the fields
//   0x012ee3e0  maxFramesInHelium()              — the derived total,
//                                                  optionally capped
//
// LAYOUT (recovered directly from the ctor)
// -----------------------------------------
//     +0x00 field0  int32   (movl %esi, (%rdi)      @0x12ee394)
//     +0x04 field4  int32   (movl %edx, 0x4(%rdi)   @0x12ee396)
//     +0x08 field8  int32   (movl %ecx, 0x8(%rdi)   @0x12ee399)
//     +0x0C field12 int32   (movl %r8d, 0xc(%rdi)   @0x12ee39c)
//     +0x10 field16 int32   (movl %r9d, 0x10(%rdi)  @0x12ee3a0)
// Total size = 20 bytes — confirmed by the caller's `__Znwm(0x14)` at
// @0x12ee46f and its 16+4 byte copy at @0x12ee482..0x12ee48b.
//
// FIELD-SEMANTIC INFERENCE (from validate + maxFramesInHelium)
// ------------------------------------------------------------
// validate() @0x12ee3b0 requires:
//   - field0  >= 0     (`js` — jump-if-signed on a signed compare with 0)
//   - field4  >  0     (`jle`)
//   - field8  >  0     (`jle`)
//   - field12 >  0     (`jle`)
//   - field16 >  0     (`setg` — >0)
// So field0 is a distinguished "may be zero (=unset/uncapped)" field
// while the other four must be strictly positive per-stage counts.
//
// maxFramesInHelium() @0x12ee3e0 uses a horizontal-sum SSE pattern:
//     movdqu 0x4(%rdi),%xmm0          ; xmm0 = {f4,f8,f12,f16}
//     pshufd $0xEE,%xmm0,%xmm1        ; xmm1 = {f12,f16,f12,f16}
//     paddd  %xmm0,%xmm1              ; xmm1 = {f4+f12, f8+f16, ..}
//     pshufd $0x55,%xmm1,%xmm0        ; xmm0 = broadcast lane1 = f8+f16
//     paddd  %xmm1,%xmm0              ; xmm0.lane0 = f4+f8+f12+f16
//     ecx = lane0                     ; sum = f4+f8+f12+f16
//     edx = field0
//     eax = min(edx, ecx)             ; cmp+cmovll pattern
//     if (edx <= 0) eax = ecx          ; test+cmovlel — field0=0 disables the cap
//
// i.e. the derived value is:
//   sum := field4 + field8 + field12 + field16
//   return (field0 > 0) ? min(field0, sum) : sum;
//
// So field0 is an OPTIONAL overall cap on the sum of the four per-stage
// counts. A value of 0 (allowed by validate) means "no cap".
//
// Since we can't recover the true field NAMES from stripped asm, we
// keep the raw field0/field4/field8/field12/field16 names — every doc
// citation points to the exact @0xADDR that reads or writes each slot.

/**
 * FFSchedQueueingInfo_MaxInHelium — 20-byte POD.
 *
 * Constructor signature (C++ ABI, System V AMD64):
 *   (this@%rdi, int@%esi, int@%edx, int@%ecx, int@%r8d, int@%r9d)
 * meaning arguments 1..5 land in fields +0x00, +0x04, +0x08, +0x0C, +0x10
 * in the order they appear in the source.
 */
export class FFSchedQueueingInfo_MaxInHelium {
  /**
   * +0x00 : int32
   *
   *   ctor  @0x12ee394  movl %esi, (%rdi)
   *   used  @0x12ee3b4  cmpl $0, (%rdi)          ; validate: must be >= 0
   *   used  @0x12ee3ff  movl (%rdi), %edx        ; maxFramesInHelium cap arg
   *
   * Semantics recovered: an OPTIONAL total-cap. When 0 (validate
   * permits it), maxFramesInHelium returns the raw sum of the other
   * four fields; when positive, it caps the sum from above.
   */
  field0: number;

  /**
   * +0x04 : int32
   *   ctor  @0x12ee396  movl %edx, 0x4(%rdi)
   *   used  @0x12ee3b9  cmpl $0, 0x4(%rdi)       ; validate: must be > 0
   *   used  @0x12ee3e4  movdqu 0x4(%rdi),%xmm0   ; first lane of the 4-int SIMD load
   */
  field4: number;

  /**
   * +0x08 : int32
   *   ctor  @0x12ee399  movl %ecx, 0x8(%rdi)
   *   used  @0x12ee3bf  cmpl $0, 0x8(%rdi)       ; validate: must be > 0
   *   used  @0x12ee3e4  (second lane of movdqu 0x4(%rdi),%xmm0)
   */
  field8: number;

  /**
   * +0x0C : int32
   *   ctor  @0x12ee39c  movl %r8d, 0xc(%rdi)
   *   used  @0x12ee3c5  cmpl $0, 0xc(%rdi)       ; validate: must be > 0
   *   used  @0x12ee3e4  (third lane of movdqu 0x4(%rdi),%xmm0)
   */
  field12: number;

  /**
   * +0x10 : int32
   *   ctor  @0x12ee3a0  movl %r9d, 0x10(%rdi)
   *   used  @0x12ee3cb  cmpl $0, 0x10(%rdi)      ; validate: must be > 0
   *   used  @0x12ee3e4  (fourth lane of movdqu 0x4(%rdi),%xmm0)
   */
  field16: number;

  /**
   * FFSchedQueueingInfo_MaxInHelium::FFSchedQueueingInfo_MaxInHelium(int,int,int,int,int)
   *   @0x012ee390  (C1 and C2 alias — only one entry point in the binary)
   *
   * Faithful asm mirror:
   *   @0x12ee390  pushq %rbp; movq %rsp,%rbp
   *   @0x12ee394  movl %esi,   (%rdi)      ; this->field0  = arg1
   *   @0x12ee396  movl %edx,  0x4(%rdi)    ; this->field4  = arg2
   *   @0x12ee399  movl %ecx,  0x8(%rdi)    ; this->field8  = arg3
   *   @0x12ee39c  movl %r8d,  0xc(%rdi)    ; this->field12 = arg4
   *   @0x12ee3a0  movl %r9d, 0x10(%rdi)    ; this->field16 = arg5
   *   @0x12ee3a4  popq %rbp; ret
   *
   * The upper 32 bits of each incoming register are ignored (the C++
   * signature is `int`, not `int64`); we mirror that with `| 0` to
   * clamp to 32-bit signed range on JS's Number domain.
   */
  constructor(
    field0: number,
    field4: number,
    field8: number,
    field12: number,
    field16: number,
  ) {
    // Each field is `int` in the C++ signature — coerce to int32 to
    // mirror the register-width truncation at the ABI boundary.
    this.field0 = field0 | 0;   // @0x12ee394
    this.field4 = field4 | 0;   // @0x12ee396
    this.field8 = field8 | 0;   // @0x12ee399
    this.field12 = field12 | 0; // @0x12ee39c
    this.field16 = field16 | 0; // @0x12ee3a0
  }

  /**
   * FFSchedQueueingInfo_MaxInHelium::validate()  @0x012ee3b0
   *
   * Returns true iff:
   *   field0 >= 0 AND field4 > 0 AND field8 > 0 AND field12 > 0 AND field16 > 0
   *
   * Faithful asm mirror:
   *   @0x12ee3b4  cmpl $0, (%rdi)          ; edx = field0
   *   @0x12ee3b7  js   .fail               ; if field0 < 0 → 0
   *   @0x12ee3b9  cmpl $0, 0x4(%rdi)
   *   @0x12ee3bd  jle  .fail               ; if field4 <= 0 → 0
   *   @0x12ee3bf  cmpl $0, 0x8(%rdi)
   *   @0x12ee3c3  jle  .fail
   *   @0x12ee3c5  cmpl $0, 0xc(%rdi)
   *   @0x12ee3c9  jle  .fail
   *   @0x12ee3cb  cmpl $0, 0x10(%rdi)
   *   @0x12ee3cf  setg %al                 ; al = field16 > 0
   *   @0x12ee3d2  ret
   *   @0x12ee3d4  xorl %eax,%eax; ret      ; .fail: return 0
   *
   * Note the asymmetry: field0 uses signed-less-than (js), i.e. only
   * NEGATIVE values fail. Zero is fine. The others use jle, i.e. <=0
   * fails. This is the source of the "field0 = optional cap" reading.
   */
  validate(): boolean {
    // @0x12ee3b4..0x12ee3b7
    if (this.field0 < 0) return false;
    // @0x12ee3b9..0x12ee3bd
    if (this.field4 <= 0) return false;
    // @0x12ee3bf..0x12ee3c3
    if (this.field8 <= 0) return false;
    // @0x12ee3c5..0x12ee3c9
    if (this.field12 <= 0) return false;
    // @0x12ee3cb..0x12ee3cf  (setg + ret)
    return this.field16 > 0;
  }

  /**
   * FFSchedQueueingInfo_MaxInHelium::maxFramesInHelium()  @0x012ee3e0
   *
   * Returns  (field0 > 0) ? min(field0, sum) : sum
   * where    sum = field4 + field8 + field12 + field16
   *
   * Faithful asm mirror (horizontal 4-lane int-sum via SSE2):
   *   @0x12ee3e4  movdqu 0x4(%rdi),%xmm0            ; xmm0 = {f4,f8,f12,f16}
   *   @0x12ee3e9  pshufd $0xEE,%xmm0,%xmm1          ; xmm1 = {f12,f16,f12,f16}
   *   @0x12ee3ee  paddd  %xmm0,%xmm1                ; xmm1.lane0 = f4+f12
   *                                                 ; xmm1.lane1 = f8+f16
   *                                                 ; xmm1.lane2 = 2*f12
   *                                                 ; xmm1.lane3 = 2*f16
   *   @0x12ee3f2  pshufd $0x55,%xmm1,%xmm0          ; xmm0 = broadcast xmm1.lane1
   *   @0x12ee3f7  paddd  %xmm1,%xmm0                ; xmm0.lane0 = xmm1.lane0 + xmm1.lane1
   *                                                 ;             = (f4+f12)+(f8+f16)
   *                                                 ;             = f4+f8+f12+f16
   *   @0x12ee3fb  movd  %xmm0,%ecx                  ; ecx = sum
   *   @0x12ee3ff  movl  (%rdi),%edx                 ; edx = field0
   *   @0x12ee401  cmpl  %ecx,%edx                   ; flags = edx - ecx
   *   @0x12ee403  movl  %ecx,%eax                   ; eax = ecx (default)
   *   @0x12ee405  cmovll %edx,%eax                  ; if edx < ecx (signed): eax = edx
   *                                                 ;   so eax = min(edx, ecx)
   *   @0x12ee408  testl %edx,%edx
   *   @0x12ee40a  cmovlel %ecx,%eax                 ; if edx <= 0: eax = ecx
   *   @0x12ee40d  ret
   *
   * Only field0's SIGN gates the cap; field0=0 or field0<0 both disable
   * it (though validate() rejects <0, at this level the semantics are
   * the same as JS: check `> 0`).
   *
   * Since sum is a 32-bit signed int result of paddd (with no overflow
   * detection), we mirror that with `| 0` to clamp intermediate sums to
   * int32 (matching the wraparound that would happen at the SSE level).
   */
  maxFramesInHelium(): number {
    // @0x12ee3e4..0x12ee3fb — the 4-lane horizontal sum. In JS we do it
    // straight, but we mirror the int32 wraparound the paddd would do.
    const sum = ((((this.field4 + this.field8) | 0) + this.field12) | 0) + this.field16 | 0;

    // @0x12ee3ff..0x12ee40e — apply the cap iff field0 > 0.
    const cap = this.field0 | 0;
    if (cap > 0) {
      // eax = min(cap, sum)  (@0x12ee401..0x12ee405)
      return cap < sum ? cap : sum;
    }
    // eax = sum                (@0x12ee408..0x12ee40a)
    return sum;
  }
}
