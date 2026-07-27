// OZSplineState.ts — ProChannel class OZSplineState. This is the shared spline-config
// state object that every OZCurve*SplineState singleton embeds at +0x8, and that
// OZCurveRuntime carries via a pointer at +0xa0 (see OZCurveRuntime.ts). It holds a
// handful of feature flags + a rate-limit CMTime + three uint32 "counts".
//
// Provenance: /Applications/Final Cut Pro.app/Contents/Frameworks/ProChannel.framework/
//   Versions/A/ProChannel  (x86_64 slice).
//
// DECODE: see raw-port/re/disasm/ProChannel.OZSplineState.__ZN13OZSplineState*.s for
// the ground-truth assembly of every ctor / operator= transcribed here.
//
// ── Struct layout (recovered from ctors — every offset cites the write) ──────────────
//   +0x00 uint8  b0                — 1st bool arg (packed via SIMD packusdw/packuswb) @0xa9fee..0xaa011
//                                    default ctor writes uint16 0x100 into (+0x00),
//                                    which is b0=0 at +0x00 and b1=1 at +0x01 @0xa9f1a
//   +0x01 uint8  b1                — 2nd bool arg                                      @0xa9fee..0xaa011
//   +0x02 uint8  b2                — 3rd bool arg (default ctor writes 1 here)         @0xa9f22 / @0xa9fee..
//   +0x03 uint8  b3                — 4th bool arg (default ctor writes 1 here)         @0xa9f63 / @0xa9fee..
//                                    NOTE: copy-ctor and operator= do NOT touch +0x03.
//   +0x04 uint8  b7                — 8th bool arg (default ctor writes 0)              @0xaa023 / @0xa9f39
//   +0x05..+0x07 padding
//   +0x08..+0x1f CMTime  rateTime  — CMTimeMake(1, timescale) where timescale =
//                                    (b1 != 0) ? 30 : 3000000. Default ctor uses the
//                                    literal 30 (no branch). Copy-ctor/operator= choose
//                                    timescale from *src.b1* (not from src.rateTime).  @0xa9f41..0xa9f5f / @0xaa026..0xaa052
//   +0x20 uint32 u4                — 5th arg (uint). Default = 1 (via movq $0x1,+0x20) @0xa9f26 / @0xaa015
//   +0x24 uint32 u6                — 7th arg (uint). Default = 0 (upper half of movq)  @0xa9f26 / @0xaa019
//   +0x28 uint32 u5                — 6th arg (uint). Default = 0                       @0xa9f2e / @0xaa01c
//                                    (NOTE the reordered arg→field mapping: +0x24 gets
//                                    the 7th arg and +0x28 gets the 6th arg — verified
//                                    against 0xa9fea..0xaa01f.)
//   +0x2c uint8  ownedFlag         — "borrowed / do-not-delete" flag. Default ctor and
//                                    8-arg ctor write 1; copy-ctor writes 0; operator=
//                                    leaves it alone. Used by OZCurveRuntime copy-ctor/
//                                    dtor @0x1e5ca / @0x1e7fd / @0x1ea7f to decide whether
//                                    to delete the state.                              @0xa9f35 / @0xaa01f / @0xaa110
//
// Total sizeof ≈ 0x30 (48) bytes (final field is a byte at +0x2c; C++ likely pads to 4/8).

import {CMTime, CMTimeMake} from "../infra/CMTime.js";

/** OZSplineState — the shared config-state object embedded/pointed-to by every
 *  OZCurve*SplineState singleton and OZCurveRuntime. All fields exactly mirror the
 *  ctor writes disassembled at ProChannel 0xa9f0a / 0xa9fda / 0xaa0e6 / 0xaa156. */
export class OZSplineState {
  /** (+0x00) uint8 — 1st bool ctor arg. Default ctor: writes uint16 0x100 into +0x00
   *  which yields +0x00=0. @ProChannel 0xa9f1a / 0xa9fee..0xaa011. */
  b0: number = 0;
  /** (+0x01) uint8 — 2nd bool ctor arg. Default ctor: 1 (upper byte of the 0x100 word).
   *  Its value ALSO drives the rateTime timescale selection (30 vs 3000000).
   *  @ProChannel 0xa9f1a / 0xaa026. */
  b1: number = 0;
  /** (+0x02) uint8 — 3rd bool ctor arg. Default ctor: 1. @ProChannel 0xa9f22. */
  b2: number = 0;
  /** (+0x03) uint8 — 4th bool ctor arg. Default ctor: 1. NOT written by copy-ctor
   *  nor by operator=. @ProChannel 0xa9f63. */
  b3: number = 0;
  /** (+0x04) uint8 — 8th bool ctor arg. Default ctor: 0. @ProChannel 0xa9f39 / 0xaa023. */
  b7: number = 0;
  /** (+0x08..+0x1f) CMTime — the rate-limit time. Every ctor rebuilds it via
   *  CMTimeMake(1, timescale). @ProChannel 0xa9f41..0xa9f5f. */
  rateTime: CMTime = {value: 0n, timescale: 1, flags: 0, epoch: 0n};
  /** (+0x20) uint32 — 5th ctor arg. Default ctor: 1. @ProChannel 0xa9f26 / 0xaa015. */
  u4: number = 0;
  /** (+0x24) uint32 — 7th ctor arg (note reordered arg→field mapping).
   *  Default ctor: 0 (upper half of `movq $0x1, 0x20(%rdi)`). @ProChannel 0xa9f26 / 0xaa019. */
  u6: number = 0;
  /** (+0x28) uint32 — 6th ctor arg. Default ctor: 0. @ProChannel 0xa9f2e / 0xaa01c. */
  u5: number = 0;
  /** (+0x2c) uint8 — "borrowed / do-not-delete" flag used by OZCurveRuntime.
   *  Default & 8-arg ctors: 1. Copy-ctor: 0. operator= leaves it alone.
   *  @ProChannel 0xa9f35 / 0xaa01f / 0xaa110. */
  flag_at_0x2c: number = 0;

  /** OZSplineState::OZSplineState() — default ctor. @ProChannel 0xa9f0a
   *  (mangled __ZN13OZSplineStateC2Ev).
   *
   *  Asm control flow (line-by-line mirror):
   *    movw  $0x100, (%rdi)          -> writes 2 bytes: +0x00 = 0x00, +0x01 = 0x01
   *    movb  $0x1, %r15b             -> r15b = 1
   *    movb  %r15b, 0x2(%rdi)        -> +0x02 = 1
   *    movq  $0x1, 0x20(%rdi)        -> +0x20 = 1  AND +0x24 = 0 (upper 4 bytes)
   *    movl  $0x0, 0x28(%rdi)        -> +0x28 = 0
   *    movb  %r15b, 0x2c(%rdi)       -> +0x2c = 1
   *    movb  $0x0, 0x4(%rdi)         -> +0x04 = 0
   *    CMTimeMake(value=1, timescale=30)  ->  copied to +0x08..+0x1f (movups + movq)
   *    movb  %r15b, 0x3(%rbx)        -> +0x03 = 1
   */
  static default_ctor(p: OZSplineState): void {
    // @0xa9f1a  movw $0x100, (%rdi)
    p.b0 = 0;
    p.b1 = 1;
    // @0xa9f1f..0xa9f22  movb $0x1, %r15b ; movb %r15b, 0x2(%rdi)
    p.b2 = 1;
    // @0xa9f26  movq $0x1, 0x20(%rdi)   (writes +0x20=1 and +0x24=0)
    p.u4 = 1;
    p.u6 = 0;
    // @0xa9f2e  movl $0x0, 0x28(%rdi)
    p.u5 = 0;
    // @0xa9f35  movb %r15b, 0x2c(%rdi)
    p.flag_at_0x2c = 1;
    // @0xa9f39  movb $0x0, 0x4(%rdi)
    p.b7 = 0;
    // @0xa9f41..0xa9f4e  CMTimeMake(value=1, timescale=30) — 30 fps
    //   movl $0x1, %esi ; movl $0x1e, %edx ; callq _CMTimeMake
    // @0xa9f53..0xa9f5f  movq/movups copy the 24-byte result to +0x08..+0x1f
    p.rateTime = CMTimeMake(1n, 30);
    // @0xa9f63  movb %r15b, 0x3(%rbx)
    p.b3 = 1;
  }

  /** OZSplineState::OZSplineState(bool, bool, bool, bool, unsigned int, unsigned int,
   *  unsigned int, bool) — 8-arg config ctor. @ProChannel 0xa9fda
   *  (mangled __ZN13OZSplineStateC2Ebbbbjjjb).
   *
   *  Arg order (matches the SysV register/stack layout at the callsite):
   *    a_b0 = %esi        (1st arg)   -> +0x00
   *    a_b1 = %edx        (2nd arg)   -> +0x01   AND drives rateTime timescale
   *    a_b2 = %ecx        (3rd arg)   -> +0x02
   *    a_b3 = %r8d        (4th arg)   -> +0x03
   *    a_u4 = %r9d        (5th arg)   -> +0x20
   *    a_u5 = [rbp+0x10]  (6th arg)   -> +0x28   (note: not +0x24)
   *    a_u6 = [rbp+0x18]  (7th arg)   -> +0x24   (note: not +0x28)
   *    a_b7 = [rbp+0x20]  (8th arg)   -> +0x04
   *
   *  Asm mirror:
   *    movb  0x20(%rbp), %al          -> al  = a_b7
   *    movl  0x10(%rbp), %edi         -> edi = a_u5
   *    movd  %esi, %xmm0              -> xmm0[0] = a_b0
   *    pinsrd $1, %edx, %xmm0         -> xmm0[1] = a_b1
   *    pinsrd $2, %ecx, %xmm0         -> xmm0[2] = a_b2
   *    movl  0x18(%rbp), %ecx         -> ecx = a_u6
   *    pinsrd $3, %r8d, %xmm0         -> xmm0[3] = a_b3
   *    packusdw %xmm0, %xmm0          -> 4×u32 -> 4×u16 (saturate)
   *    packuswb %xmm0, %xmm0          -> 4×u16 -> 4×u8  (saturate)
   *    movd  %xmm0, (%rbx)            -> +0x00..+0x03 = [a_b0, a_b1, a_b2, a_b3]
   *    movl  %r9d, 0x20(%rbx)         -> +0x20 = a_u4
   *    movl  %ecx, 0x24(%rbx)         -> +0x24 = a_u6
   *    movl  %edi, 0x28(%rbx)         -> +0x28 = a_u5
   *    movb  $0x1, 0x2c(%rbx)         -> +0x2c = 1
   *    movb  %al,  0x4(%rbx)          -> +0x04 = a_b7
   *    testl %edx, %edx               -> ZF = (a_b1 == 0)
   *    movl  $0x1e, %eax              -> eax = 30
   *    movl  $0x2dc6c0, %edx          -> edx = 3000000
   *    cmovnel %eax, %edx             -> if a_b1 != 0: edx = 30
   *    CMTimeMake(value=1, timescale=edx)  ->  copied to +0x08..+0x1f
   *
   *  bools coming in as C++ `bool` are guaranteed 0/1, so packusdw+packuswb saturation
   *  never truncates non-{0,1} bits into non-{0,1} bytes.
   */
  static ctor_config(
    p: OZSplineState,
    a_b0: boolean | number,
    a_b1: boolean | number,
    a_b2: boolean | number,
    a_b3: boolean | number,
    a_u4: number,
    a_u5: number,
    a_u6: number,
    a_b7: boolean | number,
  ): void {
    const nb0 = a_b0 ? 1 : 0;
    const nb1 = a_b1 ? 1 : 0;
    const nb2 = a_b2 ? 1 : 0;
    const nb3 = a_b3 ? 1 : 0;
    const nb7 = a_b7 ? 1 : 0;
    // @0xaa011  movd %xmm0, (%rbx)  — the 4-lane SIMD pack lands b0..b3 at +0x00..+0x03
    p.b0 = nb0;
    p.b1 = nb1;
    p.b2 = nb2;
    p.b3 = nb3;
    // @0xaa015  movl %r9d, 0x20(%rbx)
    p.u4 = a_u4 >>> 0;
    // @0xaa019  movl %ecx, 0x24(%rbx)    (ecx = a_u6 — 7th arg)
    p.u6 = a_u6 >>> 0;
    // @0xaa01c  movl %edi, 0x28(%rbx)    (edi = a_u5 — 6th arg)
    p.u5 = a_u5 >>> 0;
    // @0xaa01f  movb $0x1, 0x2c(%rbx)
    p.flag_at_0x2c = 1;
    // @0xaa023  movb %al, 0x4(%rbx)
    p.b7 = nb7;
    // @0xaa026..0xaa032  testl %edx,%edx ; cmovnel — timescale = a_b1 ? 30 : 3000000
    const timescale = nb1 !== 0 ? 30 : 3000000;
    // @0xaa041  callq _CMTimeMake ; then movups/movq to +0x08..+0x1f
    p.rateTime = CMTimeMake(1n, timescale);
  }

  /** OZSplineState::OZSplineState(OZSplineState const&) — copy ctor. @ProChannel 0xaa0e6
   *  (mangled __ZN13OZSplineStateC2ERKS_).
   *
   *  NOTE: this does NOT copy src.rateTime — it *rebuilds* the CMTime via
   *  CMTimeMake(1, timescale) with timescale chosen from src.b1 (30 or 3000000).
   *  It also does NOT copy src.b2 or src.b3 or src.flag_at_0x2c (it hard-writes 0
   *  into +0x2c), and does not touch +0x03 at all.
   *
   *  Asm mirror:
   *    movl  (%rsi), %eax             -> eax = *(u32*)(src+0)  (b0..b3 packed)
   *    cmpb  $0x0, 0x1(%rsi)          -> ZF = (src.b1 == 0)
   *    movl  %eax, (%rdi)             -> +0x00..+0x03 = src's +0x00..+0x03
   *                                      BUT NOTE the SIMD in the 8-arg ctor already
   *                                      packed those, and this is just a raw u32 copy.
   *                                      In practice all 4 bytes get copied.
   *    movq  0x20(%rsi), %rax         -> u4/u6 pair
   *    movq  %rax, 0x20(%rdi)         -> +0x20/+0x24 copied together
   *    movl  0x28(%rsi), %eax
   *    movl  %eax, 0x28(%rdi)         -> +0x28 copied
   *    movb  0x4(%rsi), %al
   *    movb  %al, 0x4(%rdi)           -> +0x04 copied
   *    movb  $0x0, 0x2c(%rdi)         -> +0x2c = 0  (copy is heap-owned by definition)
   *    testl %eax,%eax  wait — the flag is from the earlier cmpb.
   *    (branch selects timescale from src.b1, same pattern as the 8-arg ctor)
   *    CMTimeMake(1, timescale)  ->  +0x08..+0x1f
   *
   *  A raw u32 copy at +0x00 copies b0..b3 in one shot (compiler cheat — the 8-arg ctor
   *  also produced 4 clean 0/1 bytes so a u32 copy is bit-identical).
   */
  static copy_ctor(p: OZSplineState, src: OZSplineState): void {
    // @0xaa0f4..0xaa0fa  movl (%rsi),%eax ; movl %eax,(%rdi) — u32 copy of +0x00..+0x03
    p.b0 = src.b0;
    p.b1 = src.b1;
    p.b2 = src.b2;
    p.b3 = src.b3;
    // @0xaa0fc..0xaa0107  movq 0x20(%rsi),%rax ; movq %rax,0x20(%rdi) — u64 copy of +0x20..+0x27
    p.u4 = src.u4 >>> 0;
    p.u6 = src.u6 >>> 0;
    // @0xaa0104..0xaa0107  movl 0x28(%rsi),%eax ; movl %eax,0x28(%rdi)
    p.u5 = src.u5 >>> 0;
    // @0xaa010a..0xaa010d  movb 0x4(%rsi),%al ; movb %al,0x4(%rdi)
    p.b7 = src.b7;
    // @0xaa0110  movb $0x0, 0x2c(%rdi)  — copies are heap-owned
    p.flag_at_0x2c = 0;
    // @0xaa00f6 + 0xaa0114..0xaa011e  cmpb 0x1(%rsi),$0 ; cmovnel — timescale from src.b1
    const timescale = src.b1 !== 0 ? 30 : 3000000;
    // @0xaa012d  callq _CMTimeMake ; then movups/movq to +0x08..+0x1f
    p.rateTime = CMTimeMake(1n, timescale);
    // NOTE: +0x03 is NOT touched here (the u32 store at +0x00 above wrote it — same
    // behavior as the asm's `movl %eax,(%rdi)` — I fold b3 into that same store).
  }

  /** OZSplineState::operator=(OZSplineState const&) — copy-assignment. @ProChannel 0xaa156
   *  (mangled __ZN13OZSplineStateaSERKS_).
   *
   *  Identical to copy_ctor except: does NOT write +0x2c (leaves the target's owned/borrowed
   *  flag intact — the assignment doesn't change ownership).
   *
   *  Asm mirror:
   *    cmpb  $0x0, 0x1(%rsi)          -> ZF = (src.b1 == 0)
   *    movl  (%rsi), %eax
   *    movl  %eax, (%rdi)             -> +0x00..+0x03 copied
   *    movq  0x20(%rsi), %rax
   *    movq  %rax, 0x20(%rdi)         -> +0x20/+0x24 copied
   *    movl  0x28(%rsi), %eax
   *    movl  %eax, 0x28(%rdi)         -> +0x28 copied
   *    movb  0x4(%rsi), %al
   *    movb  %al, 0x4(%rdi)           -> +0x04 copied
   *    (branch selects timescale from src.b1)
   *    CMTimeMake(1, timescale)       -> +0x08..+0x1f
   *
   *  No self-assignment guard (the disasm has no `cmpq %rdi, %rsi` early-out).
   */
  static op_assign(p: OZSplineState, src: OZSplineState): OZSplineState {
    // @0xaa168..0xaa16a  movl (%rsi),%eax ; movl %eax,(%rdi)
    p.b0 = src.b0;
    p.b1 = src.b1;
    p.b2 = src.b2;
    p.b3 = src.b3;
    // @0xaa16c..0xaa170  movq 0x20(%rsi),%rax ; movq %rax,0x20(%rdi)
    p.u4 = src.u4 >>> 0;
    p.u6 = src.u6 >>> 0;
    // @0xaa174..0xaa177  movl 0x28(%rsi),%eax ; movl %eax,0x28(%rdi)
    p.u5 = src.u5 >>> 0;
    // @0xaa17a..0xaa17d  movb 0x4(%rsi),%al ; movb %al,0x4(%rdi)
    p.b7 = src.b7;
    // @0xaa164 + 0xaa180..0xaa18a  cmpb 0x1(%rsi),$0 ; cmovnel — timescale from src.b1
    const timescale = src.b1 !== 0 ? 30 : 3000000;
    // @0xaa199  callq _CMTimeMake ; then movups/movq to +0x08..+0x1f
    p.rateTime = CMTimeMake(1n, timescale);
    // NOTE: +0x2c is intentionally NOT written here.
    return p;
  }

  /** OZSplineState::operator==(OZSplineState const&) const — @ProChannel 0xaa1b8.
   *  Not yet transcribed; every current caller (OZCurveRuntime + the SplineState
   *  singletons) uses only the ctors / operator=. */
  static op_equal(_a: OZSplineState, _b: OZSplineState): boolean {
    throw new Error(
      "OZSplineState::operator==(OZSplineState const&) const @ProChannel 0xaa1b8 (__ZNK13OZSplineStateeqERKS_) not yet transcribed",
    );
  }

  /** OZSplineState::createLocalCopy() — @ProChannel 0x1eb0c.
   *  Not yet transcribed; not needed by the current OZCurveRuntime / SplineState-singleton
   *  wiring. */
  createLocalCopy(): OZSplineState {
    throw new Error(
      "OZSplineState::createLocalCopy() @ProChannel 0x1eb0c (__ZN13OZSplineState15createLocalCopyEv) not yet transcribed",
    );
  }
}
