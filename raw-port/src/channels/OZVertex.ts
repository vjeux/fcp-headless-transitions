// OZVertex — ProChannel.framework. A single keyframe / spline vertex used by OZCurve /
// OZChannel*: carries a CMTime "valueU" (the parameter/time this vertex lives at), a
// bitmask of `flags`, an `interpolation` mode id, and a scalar `normal` (tangent slope /
// per-vertex derivative). Every OZVertex method is disassembled below at its @0xADDR from
// the ProChannel binary; layout offsets are read from setter/getter offsets and cross-
// checked between ctor, copy-ctor, operator=, and operator<.
//
// Faithful transcription per PORTING_SPEC (Rule 1: transcribe, don't reimplement).
//
// Symbols (framework ProChannel):
//   __ZN8OZVertexC2ERK6CMTime           @ProChannel 0x40298   OZVertex(CMTime const&)
//   __ZN8OZVertexC1ERK6CMTime           @ProChannel 0x402ce   (same body, C1 vs C2 — copy-ctor)
//   __ZN8OZVertexC2ERKS_                @ProChannel 0x402ce   OZVertex(OZVertex const&)  (see note)
//   __ZN8OZVertexD0Ev                   @ProChannel 0xac198   ~OZVertex() (deleting — via ICF)
//   __ZN8OZVertexD1Ev                   @ProChannel 0xac192   ~OZVertex()
//   __ZN8OZVertexD2Ev                   @ProChannel 0x40300   ~OZVertex() (empty base)
//   __ZN8OZVertexaSERKS_                @ProChannel 0x40306   operator=(OZVertex const&)
//   __ZN8OZVertexltERKS_                @ProChannel 0x4032e   operator<(OZVertex const&)  (uses CMTimeCompare)
//   __ZN8OZVertex7setFlagEj             @ProChannel 0x3f262   setFlag(u32)
//   __ZN8OZVertex9resetFlagEj           @ProChannel 0x3f26c   resetFlag(u32)
//   __ZN8OZVertex8getFlagsEv            @ProChannel 0x3f278   getFlags() -> u32
//   __ZN8OZVertex8setFlagsEj            @ProChannel 0x3f282   setFlags(u32)
//   __ZN8OZVertex8testFlagEj            @ProChannel 0x3f28c   testFlag(u32) -> bool
//   __ZN8OZVertex16setInterpolationEj   @ProChannel 0x3f298   setInterpolation(u32)
//   __ZN8OZVertex16getInterpolationEv   @ProChannel 0x3f2a2   getInterpolation() -> u32
//   __ZN8OZVertex23setDefaultAtCurrentTimeERK6CMTime  @ProChannel 0x40240   setDefaultAtCurrentTime(CMTime) — EMPTY body in binary
//   __ZN8OZVertex10updateBiasEv         @ProChannel 0x40284   updateBias() — EMPTY body in binary
//   __ZN8OZVertex14enableBehaviorEb     @ProChannel 0x4028a   enableBehavior(bool) — EMPTY body in binary
//   __ZN8OZVertex15enabledBehaviorEv    @ProChannel 0x40290   enabledBehavior() -> bool (always false)
//   __ZN8OZVertex9setValueUERK6CMTime   @ProChannel 0x40378   setValueU(CMTime) — gated on flag bit 0x2
//   __ZN8OZVertex9setNormalEdRK6CMTime  @ProChannel 0x403f6   setNormal(double, CMTime)   (CMTime arg ignored — writes normal directly)
//   __ZN8OZVertex9getNormalERK6CMTime   @ProChannel 0x40402   getNormal(CMTime) -> double (CMTime arg ignored — returns normal directly)
//
// ── Layout (recovered from ctor + accessor offsets) ─────────────────────────────
//   +0x00  vptr                         (vtable @ProChannel — LEA at ctor 0x4029c cites 0x99d38)
//   +0x08  flags        u32             (setFlag/resetFlag/testFlag operate on 0x8(%rdi))
//   +0x0c  interpolation u32             (setInterpolation/getInterpolation @ 0xc(%rdi))
//   +0x10  valueU       CMTime (24 B)   (value:i64 @+0x10, timescale:i32+flags:u32 @+0x18, epoch:i64 @+0x20 — setValueU writes 24 B here)
//   +0x28  normal       double          (setNormal/getNormal @ 0x28(%rdi))
//   sizeof(OZVertex) = 0x30 (48 bytes)
//
// Notes on the "empty" methods: setDefaultAtCurrentTime, updateBias, enableBehavior all consist
// of just push rbp / mov rsp,rbp / pop rbp / ret — they were left as no-op stubs in the shipped
// binary (probably called from base-class or debug paths). enabledBehavior() returns 0.  We port
// them as no-ops with the same behaviour, citing the @0xADDR so provenance holds (Rule 1).
//
// setValueU has an early-exit guard `testb $0x2, 0x8(%rdi); jne` — flag bit 0x02 (which matches
// kCMTimeFlags_HasBeenRounded elsewhere, but here is repurposed as "vertex-locked" on OZVertex)
// blocks the write. When unset, it calls CMTimeCompare on the current valueU vs the new time;
// only if they differ is the store actually performed. Faithful to disasm 0x40378.

import type { CMTime } from "../infra/CMTime";
import { CMTimeCompare, kCMTimeZero } from "../infra/CMTime";

/** OZVertex — 48-byte keyframe/spline vertex (see file header for layout & @0xADDRs). */
export class OZVertex {
  // +0x00 vptr is implicit (JS class dispatch replaces the C++ vtable — no field needed).
  /** +0x08 — flag bitmask.  @ProChannel 0x3f262/6c/78/82/8c */
  public flags: number = 0;
  /** +0x0c — interpolation-mode id.  @ProChannel 0x3f298 / 0x3f2a2 */
  public interpolation: number = 0;
  /** +0x10 — parameter/time this vertex lives at.  @ProChannel 0x40298 / 0x40378 */
  public valueU: CMTime = { value: 0n, timescale: 1, flags: 0, epoch: 0n };
  /** +0x28 — scalar normal (tangent slope / per-vertex derivative).  @ProChannel 0x403f6 / 0x40402 */
  public normal: number = 0;

  /**
   * OZVertex(CMTime const&) — primary ctor.
   *   vptr = &vtable (ProChannel 0x99d38)                       [ctor 0x402a3]
   *   valueU = *rsi   (24 B copy: 0x10 movups + 0x8 movq)        [0x402a6-0x402b1]
   *   flags:interpolation = 0x0000000100000000                   [0x402b5 movabsq / 0x402bf movq to +0x8]
   *     -> flags(u32) = 0, interpolation(u32) = 1
   *   normal (+0x28) = 0.0                                       [0x402c3 movq $0]
   * @ProChannel 0x40298
   */
  constructor(valueU?: CMTime | OZVertex) {
    if (valueU === undefined) {
      // default-constructed vertex — use kCMTimeZero for valueU. (The disassembled ctor
      // requires a CMTime& argument; the no-arg case is a TS convenience for temporaries
      // and matches what a caller does at 0x40298 with a passed kCMTimeZero-like time.)
      this.valueU = { ...kCMTimeZero };
      this.flags = 0;
      this.interpolation = 1;
      this.normal = 0;
      return;
    }
    if (valueU instanceof OZVertex) {
      // Copy-ctor path — __ZN8OZVertexC2ERKS_ @ProChannel 0x402ce:
      //   valueU  = other.valueU     (24 B copy: 0x402dc / 0x402e4)
      //   flags:interpolation packed = other.[+0x8..+0x10]  (movq 0x8(%rsi)/movq to 0x8(%rdi) @0x402ec-f0)
      //   normal  = other.normal    (movsd 0x28 @0x402f4-f9)
      this.valueU = { ...valueU.valueU };
      this.flags = valueU.flags;
      this.interpolation = valueU.interpolation;
      this.normal = valueU.normal;
      return;
    }
    // Primary CMTime ctor.  @ProChannel 0x40298
    this.valueU = { ...valueU };
    this.flags = 0;
    this.interpolation = 1;
    this.normal = 0;
  }

  /**
   * ~OZVertex() — trivial destructor.  @ProChannel 0x40300 (D2 base).
   * Body: pushq rbp / movq rsp,rbp / popq rbp / retq — no field cleanup (no owning heap ptrs).
   * D1/D0 slots at 0xac192/0xac198 are ICF-folded onto unrelated code (a std::string-owner dtor);
   * the base D2 at 0x40300 is the authoritative empty body. JS has no explicit dtor; the class
   * likewise owns nothing.
   */
  // (no method needed; GC handles it.)

  /**
   * operator=(OZVertex const&) — plain field-copy.  @ProChannel 0x40306
   *   valueU (24 B: 0x40312 movups + 0x4030a movq)
   *   flags:interpolation packed (movq 0x8 @ 0x4031a)
   *   normal (movsd 0x28 @ 0x40322)
   */
  assign(rhs: OZVertex): OZVertex {
    this.valueU = { ...rhs.valueU };
    this.flags = rhs.flags;
    this.interpolation = rhs.interpolation;
    this.normal = rhs.normal;
    return this;
  }

  /**
   * operator<(OZVertex const&) — lexicographic on valueU only.  @ProChannel 0x4032e
   *   rax = CMTimeCompare(this.valueU, rhs.valueU)              [callq 0xaca80]
   *   return (int32_t)rax >>> 31                                 [shrl $0x1f, %eax]
   * The `>>> 31` picks the sign bit of the int32: 1 iff CMTimeCompare returned negative
   * (this < rhs). Faithful to the disasm — we do NOT collapse to "< 0" because the
   * shift-right-logical is what the binary emits.
   */
  lessThan(rhs: OZVertex): boolean {
    const cmp = CMTimeCompare(this.valueU, rhs.valueU) | 0;   // force int32
    return ((cmp >>> 31) & 1) === 1;
  }

  /** setFlag(u32) — flags |= mask.  @ProChannel 0x3f262  (orl %esi, 0x8(%rdi)) */
  setFlag(mask: number): void {
    this.flags = (this.flags | (mask >>> 0)) >>> 0;
  }

  /** resetFlag(u32) — flags &= ~mask.  @ProChannel 0x3f26c  (notl %esi; andl %esi, 0x8(%rdi)) */
  resetFlag(mask: number): void {
    this.flags = (this.flags & ~(mask >>> 0)) >>> 0;
  }

  /** getFlags() -> u32.  @ProChannel 0x3f278  (movl 0x8(%rdi), %eax) */
  getFlags(): number {
    return this.flags >>> 0;
  }

  /** setFlags(u32).  @ProChannel 0x3f282  (movl %esi, 0x8(%rdi)) — full replace. */
  setFlags(mask: number): void {
    this.flags = (mask >>> 0);
  }

  /** testFlag(u32) -> bool — (flags & mask) != 0.  @ProChannel 0x3f28c  (testl %esi,0x8(%rdi); setne) */
  testFlag(mask: number): boolean {
    return (this.flags & (mask >>> 0)) !== 0;
  }

  /** setInterpolation(u32).  @ProChannel 0x3f298  (movl %esi, 0xc(%rdi)) */
  setInterpolation(mode: number): void {
    this.interpolation = (mode >>> 0);
  }

  /** getInterpolation() -> u32.  @ProChannel 0x3f2a2  (movl 0xc(%rdi), %eax) */
  getInterpolation(): number {
    return this.interpolation >>> 0;
  }

  /**
   * setDefaultAtCurrentTime(CMTime const&) — EMPTY body in shipped binary.  @ProChannel 0x40240
   * Disasm: pushq rbp / movq rsp,rbp / popq rbp / retq. Faithful no-op (Rule 1).
   */
  setDefaultAtCurrentTime(_t: CMTime): void {
    // empty per disasm @ProChannel 0x40240
  }

  /**
   * updateBias() — EMPTY body in shipped binary.  @ProChannel 0x40284
   * Disasm: pushq rbp / movq rsp,rbp / popq rbp / retq. Faithful no-op.
   */
  updateBias(): void {
    // empty per disasm @ProChannel 0x40284
  }

  /**
   * enableBehavior(bool) — EMPTY body in shipped binary.  @ProChannel 0x4028a
   * Disasm: pushq rbp / movq rsp,rbp / popq rbp / retq. Argument is ignored. Faithful no-op.
   */
  enableBehavior(_on: boolean): void {
    // empty per disasm @ProChannel 0x4028a
  }

  /**
   * enabledBehavior() -> bool — always false.  @ProChannel 0x40290
   * Disasm: xorl %eax,%eax / retq. (Zero return.)
   */
  enabledBehavior(): boolean {
    return false;
  }

  /**
   * setValueU(CMTime const&).  @ProChannel 0x40378
   * Guard:  `testb $0x2, 0x8(%rdi); jne <exit>`                       [0x40383 / 0x40387]
   *         -> if (flags & 0x2) != 0, do nothing (vertex is locked / rounded).
   * Otherwise: copy the current valueU (rdi+0x10..+0x28, 24 B) + the new CMTime (*rsi) onto the
   * stack and call `CMTimeCompare(current, new)`. If unequal (eax != 0), rbx = rdi+0x10 and
   * (rsi) is written into (rbx..rbx+0x18) — i.e. valueU = new. If equal, nothing is stored.
   * Faithful to disasm 0x40378.
   */
  setValueU(t: CMTime): void {
    // Flag bit 0x2 blocks the write.  @0x40383
    if ((this.flags & 0x2) !== 0) return;
    // Store only if the CMTime actually differs (CMTimeCompare returns 0 for equal).
    if (CMTimeCompare(this.valueU, t) !== 0) {
      this.valueU = { value: t.value, timescale: t.timescale, flags: t.flags, epoch: t.epoch };
    }
  }

  /**
   * setNormal(double, CMTime const&).  @ProChannel 0x403f6
   * Disasm: movsd %xmm0, 0x28(%rdi) / retq.  The CMTime& is loaded into rsi but never touched —
   * the shipped code writes the double straight to +0x28 unconditionally. Faithful.
   */
  setNormal(n: number, _t: CMTime): void {
    // Match ProChannel single-precision-ness where relevant. The disasm uses `movsd` (double),
    // so we leave `n` as full double — no Math.fround wrap.
    this.normal = n;
  }

  /**
   * getNormal(CMTime const&) -> double.  @ProChannel 0x40402
   * Disasm: movsd 0x28(%rdi), %xmm0 / retq.  Returns +0x28 unconditionally; CMTime& arg ignored.
   */
  getNormal(_t: CMTime): number {
    return this.normal;
  }
}
