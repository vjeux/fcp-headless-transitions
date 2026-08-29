// SurroundPanner.ts — raw transcription of the Flexo class `SurroundPanner`.
//
// ONE symbol is transcribed in this file — `AngleBisectionRatio`. Every other
// member of the class is a SEPARATE ledger unit and is NOT ported here; do not
// add them without their own disassembly and address citations. The immediate
// neighbour, for orientation only:
//   0x1251400  SurroundPanner::RadiansToDegrees(double)   — `divsd` by the SAME
//              2π constant at 0x1572558, then `mulsd` by 360.0 at 0x156d060.
//              That shared constant is the strongest evidence that the angles
//              in this class are RADIANS.
//
// Provenance (Flexo framework, x86_64 slice):
//   /Applications/Final Cut Pro.app/Contents/Frameworks/Flexo.framework/Versions/A/Flexo
//
// Symbol ported in this file:
//   @0x12513a0  SurroundPanner::AngleBisectionRatio(double, double, double)
//                 __ZN14SurroundPanner19AngleBisectionRatioEddd
//
// Source disassembly (re-derived from the binary with
// `raw-port/tools/disasm.sh --sym __ZN14SurroundPanner19AngleBisectionRatioEddd
//  Flexo`):
//   raw-port/re/disasm/Flexo.__ZN14SurroundPanner19AngleBisectionRatioEddd.s
//   (28 lines)
//
// ---------------------------------------------------------------------------
// FULL DISASM — the whole function, every instruction
// ---------------------------------------------------------------------------
//   0x12513a0  pushq    %rbp                  ; frame setup (no TS counterpart)
//   0x12513a1  movq     %rsp, %rbp            ; frame setup
//   0x12513a4  movapd   %xmm0, %xmm4          ; xmm4 = angle
//   0x12513a8  movsd    0x3211a8(%rip), %xmm5 ; xmm5 = 2π @0x1572558
//   0x12513b0  addsd    %xmm0, %xmm5          ; xmm5 = angle + 2π
//   0x12513b4  xorpd    %xmm3, %xmm3          ; xmm3 = 0.0   (also the value
//                                             ;   the `ja` path below returns)
//   0x12513b8  cmpltsd  %xmm3, %xmm0          ; xmm0 = mask(angle < 0.0)
//   0x12513bd  blendvpd %xmm0, %xmm5, %xmm4   ; xmm4 = mask ? angle+2π : angle
//   0x12513c2  movapd   %xmm1, %xmm0          ; xmm0 = b
//   0x12513c6  maxsd    %xmm2, %xmm0          ; xmm0 = hi = MAXSD(dst=b, src=c)
//   0x12513ca  ucomisd  %xmm0, %xmm4          ; flags on angle - hi
//   0x12513ce  jbe      0x12513de             ; angle <= hi (or unordered)
//   0x12513d0  movsd    0x31b628(%rip), %xmm3 ; xmm3 = 1.0 @0x156ca00
//   0x12513d8  movapd   %xmm3, %xmm0          ; return xmm3
//   0x12513dc  popq     %rbp
//   0x12513dd  retq
//   0x12513de  minsd    %xmm1, %xmm2          ; xmm2 = lo = MINSD(dst=c, src=b)
//   0x12513e2  ucomisd  %xmm4, %xmm2          ; flags on lo - angle
//   0x12513e6  ja       0x12513d8             ; lo > angle -> return xmm3
//   0x12513e8  subsd    %xmm2, %xmm4          ; xmm4 = angle - lo
//   0x12513ec  subsd    %xmm2, %xmm0          ; xmm0 = hi - lo
//   0x12513f0  divsd    %xmm0, %xmm4          ; xmm4 = (angle-lo)/(hi-lo)
//   0x12513f4  movapd   %xmm4, %xmm3
//   0x12513f8  movapd   %xmm3, %xmm0          ; return xmm3
//   0x12513fc  popq     %rbp
//   0x12513fd  retq
//   0x12513fe  nop                            ; padding, not executed
//
// ---------------------------------------------------------------------------
// THE SHARED EPILOGUE IS LOAD-BEARING — `ja` RETURNS ZERO, NOT ONE
// ---------------------------------------------------------------------------
// `ja 0x12513d8` @0x12513e6 jumps INTO the middle of the first return block,
// landing on `movapd %xmm3, %xmm0` — one instruction AFTER the `movsd` that
// loads 1.0. So on that path xmm3 still holds the 0.0 written by `xorpd`
// @0x12513b4, and the function returns **0.0**. Reading the jump target as
// "the return-1.0 block" would invert the low clamp. Both constants are
// therefore reached through the same two instructions, and only the entry
// point distinguishes them. Confirmed live: 0.0 for angle below the range,
// 1.0 for angle above it.
//
// ---------------------------------------------------------------------------
// SSE MIN/MAX ARE NOT Math.min/Math.max — THIS IS THE WHOLE RISK
// ---------------------------------------------------------------------------
// `MAXSD dst, src` is defined as `dst = (dst > src) ? dst : src`, and `MINSD`
// as `dst = (dst < src) ? dst : src`. Two consequences that JS's Math.max /
// Math.min get WRONG:
//   * if EITHER operand is NaN the result is **src**, not NaN. `Math.max(1, NaN)`
//     is NaN; `MAXSD` gives whichever operand is the source.
//   * for +0.0 vs -0.0 the compare is false, so the result is **src** — sign
//     and all. `Math.max(-0, 0)` is +0 regardless of order.
// The operand roles come from the AT&T encoding: `maxsd %xmm2, %xmm0` has
// src = xmm2 = c and dst = xmm0 = b, so hi = (b > c) ? b : c; `minsd %xmm1,
// %xmm2` has src = xmm1 = b and dst = xmm2 = c, so lo = (c < b) ? c : b. Note
// the operands are in the OPPOSITE order in the two instructions, which is
// exactly the kind of thing a `Math.min`/`Math.max` paraphrase erases. The
// port therefore writes the ternaries out; `sseMaxSd`/`sseMinSd` below are
// those definitions and nothing more.
//
// UNORDERED COMPARES. `ucomisd` sets CF=ZF=PF=1 when either operand is NaN, so
// `jbe` (CF|ZF) IS taken and `ja` (¬CF ∧ ¬ZF) is NOT — i.e. a NaN angle falls
// through both clamps into the divide, and the result is NaN. The port's
// `angle > hi` and `lo > angle` are false on NaN, which reproduces exactly
// that. Writing the low clamp as `!(angle >= lo)` instead would invert the NaN
// behavior and return 0.0.
//
// DIVISION IS NOT GUARDED. When b == c the two clamps admit only angle == b,
// and then the divide is 0/0 = NaN; when the ratio's denominator is zero with
// a non-zero numerator the machine yields ±Infinity. There is no check in the
// binary, so there is none here — a "helpful" guard would be a rewrite.
//
// ---------------------------------------------------------------------------
// CONSTANTS
// ---------------------------------------------------------------------------
//   @0x1572558  2π = 6.283185307179586  (bits 0x401921fb54442d18), __TEXT,__const
//               Referenced from 0x12513a8 (0x12513b0 + 0x3211a8). The sibling
//               `RadiansToDegrees` @0x1251404 divides by this SAME address and
//               multiplies by 360.0 @0x156d060 — which is what identifies it as
//               a full turn in radians rather than an arbitrary constant.
//   @0x156ca00  1.0 (bits 0x3ff0000000000000), __TEXT,__const
//               Referenced from 0x12513d0 (0x12513d8 + 0x31b628).
//   0.0 is not a literal: it comes from `xorpd %xmm3, %xmm3` @0x12513b4.
//
// `this` IS NEVER READ: no `(%rdi)` operand appears anywhere in the body, so
// whether the C++ declares this static or not is unobservable. Confirmed live —
// the result is identical for a valid `this`, a poisoned one, and NULL.
//
// CALLEES: none — `depgraph.py deps __ZN14SurroundPanner19AngleBisectionRatioEddd`
// lists nothing. Pure register arithmetic plus two loads from __TEXT,__const.
//
// ---------------------------------------------------------------------------
// ORACLE — a REAL TypeScript ↔ binary differential, bit-exact
// ---------------------------------------------------------------------------
// raw-port/re/oracle/SurroundPanner_AngleBisectionRatio_oracle.py, with the
// driver raw-port/re/oracle/SurroundPanner_AngleBisectionRatio_driver.mts.
// This one does NOT compare the live function against a Python re-statement of
// the port — it imports THIS FILE into node (`--experimental-strip-types`) and
// compares the live Flexo function against the actual exported TS. Doubles
// cross the boundary as raw u64 BIT PATTERNS in hex, never as JSON numbers:
// `json.dump` emits bare `NaN`/`Infinity`, which `JSON.parse` rejects, and bit
// patterns also make the comparison exact for signed zero and NaN payloads
// instead of merely value-equal (OPS_LOG). Results (2026-08-11), 1,410 cases:
//   * byte self-check PASS on the whole 94-byte body, and both rip-relative
//     constants re-derived from their own encodings (0x3211a8 -> 0x1572558 =
//     6.283185307179586; 0x31b628 -> 0x156ca00 = 1.0).
//   * 1,410 cases, **0 real divergences**, bit-for-bit — including every NaN
//     case, both signed zeros, b == c (0/0 and x/0), and angles exactly on
//     each clamp boundary and one ULP outside it. The corpus contains 184 NaN
//     cases and 231 negative-zero cases and produces 252 distinct result bit
//     patterns, so it is not one answer repeated.
//   * negative controls, all live: Math.max/Math.min instead of MAXSD/MINSD
//     43/1410 (they differ ONLY on the NaN and signed-zero cases, which is
//     exactly why those cases are in the corpus); swapped min/max operand
//     order 131/1410; `ja` path returning 1.0 instead of 0.0 254/1410; low
//     clamp written as `!(angle >= lo)` 40/1410; no 2π wrap 336/1410; wrap
//     applied when angle <= 0 rather than < 0 74/1410.
//
// ONE DIFFERENCE THE PORT CANNOT REPRODUCE, AND IT IS A LANGUAGE LIMIT, NOT A
// DEFECT: in 27 of the 1,410 cases both sides return NaN but with different
// BITS. x86's `divsd` on 0/0 yields the "QNaN floating-point indefinite",
// 0xfff8000000000000 — sign bit SET — while JavaScript canonicalises every
// arithmetic NaN to 0x7ff8000000000000 and offers no way to produce the other
// from arithmetic. The oracle classifies those separately and reports them
// rather than hiding them in a value-equality comparison; every one of the 27
// is NaN on BOTH sides, and no case differs in any other way. Anyone building
// the next float differential here should expect this: bit-exact comparison
// works for every finite value, both zeros and both infinities, but a NaN
// RESULT can only be compared as "is NaN".

/**
 * `MAXSD dst, src` — the SSE2 scalar-double maximum, which is NOT `Math.max`:
 * the result is `src` whenever the compare is false, i.e. for ANY NaN operand
 * and for +0.0 vs -0.0. Written out rather than paraphrased because the
 * difference is observable and is in the oracle corpus.
 *
 * @Flexo 0x12513c6
 */
function sseMaxSd(dst: number, src: number): number {
  return dst > src ? dst : src;
}

/**
 * `MINSD dst, src` — the mirror of {@link sseMaxSd}; `src` whenever the
 * compare is false.
 *
 * @Flexo 0x12513de
 */
function sseMinSd(dst: number, src: number): number {
  return dst < src ? dst : src;
}

/**
 * 2π — the full-turn constant at __TEXT,__const VA 0x1572558 (bits
 * 0x401921fb54442d18), added to a negative angle to bring it into range. The
 * sibling `RadiansToDegrees` @0x1251404 divides by this same address before
 * multiplying by 360.0, which is what establishes that these angles are
 * radians.
 *
 * @Flexo 0x1572558
 */
const SURROUND_PANNER_TWO_PI = 6.283185307179586; // @Flexo 0x1572558

/**
 * 1.0 — the constant at __TEXT,__const VA 0x156ca00 (bits
 * 0x3ff0000000000000), returned when the angle is above the range.
 *
 * @Flexo 0x156ca00
 */
const SURROUND_PANNER_ONE = 1.0; // @Flexo 0x156ca00

/**
 * 0.0 — NOT a literal in the binary: it is produced by `xorpd %xmm3, %xmm3`
 * @0x12513b4 and survives in xmm3 to the shared epilogue, which is what the
 * `ja` path returns.
 *
 * @Flexo 0x12513b4
 */
const SURROUND_PANNER_ZERO = 0.0; // @Flexo 0x12513b4

// ── Constructor-only provenance: the vtable, the 16-byte literal, the two externs ────────────

/**
 * The value `SurroundPanner::SurroundPanner()` stores at `this+0x00`: 0x124dacf + 0x6d3531.
 * @Flexo 0x1921000 — the installed pointer of the SurroundPanner vtable at @Flexo 0x1920ff0
 * (`resolve.py Flexo vtable SurroundPanner`: *0x00 Process, *0x08 SetParameter, *0x10 Reset,
 * *0x18 Panner::SetAlgorithm, *0x20 SetPannerUIMode, *0x28/*0x30 ~SurroundPanner,
 * *0x38 Panner::GetPannerUIMode).
 */
const SURROUND_PANNER_VTABLE_PTR = 0x1921000;

/**
 * The 16 bytes at @Flexo 0x15831d0, loaded by `movaps` @0x124dad2 and stored to `this+0x14`.
 * Read out of the mapped image as `74 6c 66 64 00 00 00 00 6e 68 63 36 06 00 00 00`, i.e. four
 * little-endian u32s. The first and third are printable four-character codes read big-endian —
 * 0x64666c74 is 'dflt' and 0x3663686e is '6chn' — which together with the trailing 6 reads as a
 * default six-channel layout tag. That reading is an OBSERVATION about the bytes; what is
 * transcribed is the bytes.
 */
const SURROUND_PANNER_C2_CONST: readonly [number, number, number, number] = [
  0x64666c74, 0x00000000, 0x3663686e, 0x00000006,
];

/**
 * `operator new[](unsigned long)` — libc++ extern, out of scope. Called @Flexo 0x124daea with
 * 0x90 from `SurroundPanner::SurroundPanner()` [C2].
 *
 * Raises rather than answering: it is VALUE-PRODUCING (it returns the pointer the constructor
 * stores at +0x28 and writes through), and a JS array is not that pointer. This follows the
 * landed treatment of the same extern in the same position — `HgcVibrancy`'s C2 constructor
 * raises on `operator new[](0x227)` @Flexo 0x146f77e.
 */
function operatorNewArray(_size: number): Uint8Array {
  throw new Error(
    "operator new[](unsigned long) not yet transcribed " +
      "(frontier callee @Flexo 0x124daea in SurroundPanner::SurroundPanner [C2], size 0x90)",
  );
}

/**
 * `bzero(void*, size_t)` — libc extern, called @Flexo 0x124dafe with (block, 0x90).
 * Unlike the allocation this one produces NO value and its whole effect is expressible: it
 * writes `n` zero bytes. Modelling it as anything else would be inventing a difference.
 */
function bzero(buffer: Uint8Array, n: number): void {
  buffer.fill(0, 0, n);
}

/**
 * `SurroundPanner` — Flexo's surround-panning geometry helper.
 *
 * As of the C2 constructor below the instance layout IS modelled, as far as the constructor
 * grounds it (see the per-field byte offsets on the members). `AngleBisectionRatio` remains a
 * static: that method never reads `this`.
 *
 * @Flexo 0x12513a0
 */
export class SurroundPanner {
  // ── Instance layout, grounded by the C2 constructor @Flexo 0x124dab0 ────────
  // Only the offsets that constructor actually writes are asserted here. The object is at
  // least 0xc0 bytes (the last field it initialises is +0xb8), and the members between the
  // named ones are the zeroed spans described on `zeroedTail`.

  /** +0x00 — vtable pointer. Written @0x124dacf from `leaq 0x6d3531(%rip)` @0x124dac8. */
  vtable = 0;
  /** +0x08 — u64, zeroed @0x124daba (`movq $0x0, 0x8(%rdi)`). */
  field_08 = 0n;
  /** +0x10 — u16, zeroed @0x124dac2 (`movw $0x0, 0x10(%rdi)`) — a 16-bit store, not 32. */
  field_10 = 0;
  /** +0x14 — first u32 of the 16-byte constant at @Flexo 0x15831d0. */
  field_14 = 0;
  /** +0x18 — second u32 of that constant. */
  field_18 = 0;
  /** +0x1c — third u32 of that constant. */
  field_1c = 0;
  /** +0x20 — fourth u32 of that constant. */
  field_20 = 6;
  /**
   * +0x28 — pointer to the 0x90-byte block from `operator new[]` @0x124daea. Modelled as the
   * block itself; the C2 body zeroes all 0x90 bytes of it (twice — see the constructor).
   */
  block: Uint8Array | null = null;
  /**
   * The spans this constructor zeroes and does not otherwise name: +0x30..+0x47 and
   * +0x48..+0xbf. Modelled as one byte array so the stores can be transcribed at their real
   * offsets rather than invented as fields the disassembly does not distinguish.
   */
  zeroedTail = new Uint8Array(0x90); // covers +0x30..+0xbf

  /**
   * `SurroundPanner::SurroundPanner()` [C2, base-object constructor]
   * @Flexo __ZN14SurroundPannerC2Ev @0x124dab0..0x124db80
   *
   * FULL DISASM, in address order — every instruction has a counterpart below:
   *   0x124dab0  pushq %rbp ; movq %rsp,%rbp ; pushq %r14 ; pushq %rbx      ; frame
   *   0x124dab7  movq  %rdi, %rbx                    ; rbx = this
   *   0x124daba  movq  $0x0, 0x8(%rdi)               ; this->+0x08 = 0        (64-bit)
   *   0x124dac2  movw  $0x0, 0x10(%rdi)              ; this->+0x10 = 0        (16-bit)
   *   0x124dac8  leaq  0x6d3531(%rip), %rax          ; = 0x1921000
   *   0x124dacf  movq  %rax, (%rdi)                  ; this->vtable = 0x1921000
   *   0x124dad2  movaps 0x3356f7(%rip), %xmm0        ; = 0x15831d0, 16 bytes
   *   0x124dad9  movups %xmm0, 0x14(%rdi)            ; this->+0x14..+0x23 = that constant
   *   0x124dadd  movq  $0x0, 0x28(%rdi)              ; this->block = null
   *   0x124dae5  movl  $0x90, %edi
   *   0x124daea  callq __Znam                        ; operator new[](0x90)
   *   0x124daef  movq  %rax, %r14                    ; r14 = block
   *   0x124daf2  movq  %rax, 0x28(%rbx)              ; this->block = it
   *   0x124daf6  movl  $0x90, %esi ; movq %rax,%rdi
   *   0x124dafe  callq _bzero                        ; bzero(block, 0x90)
   *   0x124db03  xorps %xmm0, %xmm0                  ; xmm0 = 16 zero bytes, reused below
   *   0x124db06  movups %xmm0, 0x30(%rbx)            ; this->+0x30..+0x3f = 0
   *   0x124db0a  movq  $0x0, 0x40(%rbx)              ; this->+0x40 = 0
   *   0x124db12  movups %xmm0, (%r14)                ; block +0x00..+0x0f = 0
   *   0x124db16  movq  $0x0, 0x10(%r14)              ; block +0x10 = 0
   *   0x124db1e  movups %xmm0, 0xa8(%rbx)            ; this->+0xa8..+0xb7 = 0
   *   0x124db25  movups %xmm0, 0x98(%rbx)            ;      +0x98..+0xa7
   *   0x124db2c  movups %xmm0, 0x88(%rbx)            ;      +0x88..+0x97
   *   0x124db33  movups %xmm0, 0x78(%rbx)            ;      +0x78..+0x87
   *   0x124db37  movups %xmm0, 0x68(%rbx)            ;      +0x68..+0x77
   *   0x124db3b  movups %xmm0, 0x58(%rbx)            ;      +0x58..+0x67
   *   0x124db3f  movups %xmm0, 0x48(%rbx)            ;      +0x48..+0x57
   *   0x124db43  movq  $0x0, 0xb8(%rbx)              ; this->+0xb8 = 0
   *   0x124db4e  movups %xmm0, 0x78(%r14)            ; block +0x78..+0x87 = 0
   *   0x124db53  movups %xmm0, 0x68(%r14)            ;       +0x68..+0x77
   *   0x124db58  movups %xmm0, 0x58(%r14)            ;       +0x58..+0x67
   *   0x124db5d  movups %xmm0, 0x48(%r14)            ;       +0x48..+0x57
   *   0x124db62  movups %xmm0, 0x38(%r14)            ;       +0x38..+0x47
   *   0x124db67  movups %xmm0, 0x28(%r14)            ;       +0x28..+0x37
   *   0x124db6c  movups %xmm0, 0x18(%r14)            ;       +0x18..+0x27
   *   0x124db71  movq  $0x0, 0x88(%r14)              ; block +0x88 = 0
   *   0x124db7c  popq %rbx ; popq %r14 ; popq %rbp ; retq
   *
   * TWO THINGS WORTH SAYING ABOUT THAT LISTING, because both look like mistakes and are not:
   *
   * 1. The block is zeroed TWICE — `_bzero(block, 0x90)` and then explicit stores covering
   *    +0x00..+0x8f (0x00 and 0x10, then 0x18..0x87 in seven 16-byte stores, then 0x88). The
   *    second pass is redundant on the machine and is transcribed anyway, because "the compiler
   *    emitted it" is the only claim this port is entitled to make about it.
   * 2. `movw` at 0x124dac2 writes TWO bytes at +0x10, not four, and nothing in this constructor
   *    writes +0x12 or +0x24..+0x27 — so those bytes are whatever `operator new` left. They are
   *    deliberately not modelled as zero.
   */
  constructor() {
    // @0x124daba  movq $0x0, 0x8(%rdi)
    this.field_08 = 0n;
    // @0x124dac2  movw $0x0, 0x10(%rdi) — 16-bit store.
    this.field_10 = 0;
    // @0x124dac8/@0x124dacf — install the vtable: 0x124dacf + 0x6d3531 = 0x1921000, the
    // "installed pointer" of the SurroundPanner vtable at @Flexo 0x1920ff0 (resolve.py: slot
    // *0x00 -> Process, *0x08 -> SetParameter, *0x10 -> Reset, *0x28/*0x30 -> ~SurroundPanner).
    this.vtable = SURROUND_PANNER_VTABLE_PTR;
    // @0x124dad2/@0x124dad9 — the 16 bytes at @Flexo 0x15831d0 stored across +0x14..+0x23.
    this.field_14 = SURROUND_PANNER_C2_CONST[0];
    this.field_18 = SURROUND_PANNER_C2_CONST[1];
    this.field_1c = SURROUND_PANNER_C2_CONST[2];
    this.field_20 = SURROUND_PANNER_C2_CONST[3];
    // @0x124dadd  movq $0x0, 0x28(%rdi) — the block pointer is cleared BEFORE the allocation.
    this.block = null;
    // @0x124dae5/@0x124daea  operator new[](0x90)
    const block = operatorNewArray(0x90);
    // @0x124daf2  movq %rax, 0x28(%rbx)
    this.block = block;
    // @0x124daf6/@0x124dafe  bzero(block, 0x90)
    bzero(block, 0x90);
    // @0x124db03  xorps %xmm0, %xmm0 — the zero vector every store below reuses.
    // @0x124db06  this->+0x30..+0x3f = 0   (offsets into zeroedTail are absolute minus 0x30)
    this.zeroedTail.fill(0, 0x30 - 0x30, 0x40 - 0x30);
    // @0x124db0a  this->+0x40 = 0
    this.zeroedTail.fill(0, 0x40 - 0x30, 0x48 - 0x30);
    // @0x124db12  block +0x00..+0x0f = 0
    block.fill(0, 0x00, 0x10);
    // @0x124db16  block +0x10 = 0
    block.fill(0, 0x10, 0x18);
    // @0x124db1e..@0x124db3f — this->+0xa8, +0x98, +0x88, +0x78, +0x68, +0x58, +0x48, in that
    // order (descending, as emitted).
    for (const off of [0xa8, 0x98, 0x88, 0x78, 0x68, 0x58, 0x48]) {
      this.zeroedTail.fill(0, off - 0x30, off - 0x30 + 0x10);
    }
    // @0x124db43  this->+0xb8 = 0
    this.zeroedTail.fill(0, 0xb8 - 0x30, 0xc0 - 0x30);
    // @0x124db4e..@0x124db6c — block +0x78, +0x68, +0x58, +0x48, +0x38, +0x28, +0x18.
    for (const off of [0x78, 0x68, 0x58, 0x48, 0x38, 0x28, 0x18]) {
      block.fill(0, off, off + 0x10);
    }
    // @0x124db71  block +0x88 = 0
    block.fill(0, 0x88, 0x90);
  }

  /**
   * `SurroundPanner::Create()` @Flexo 0x124d240
   * (`__ZN14SurroundPanner6CreateEv`).
   *
   * The machine allocates 0xf0 bytes with `operator new` @0x124d24c, then
   * emits the C2 constructor body inline: the stores, 0x90-byte `operator
   * new[]` @0x124d284, `_bzero` @0x124d298, and explicit zeroing sequence are
   * instruction-for-instruction the constructor transcribed above. It returns
   * the allocated object at @0x124d316.
   *
   * TypeScript's `new` is the object-allocation counterpart of the outer
   * `operator new(0xf0)` and runs that same constructor body. If the inner
   * value-producing `operator new[]` boundary throws, JavaScript discards the
   * partial object and propagates the exception, matching the landing pad at
   * @0x124d31e..@0x124d32c (`operator delete` then `_Unwind_Resume`).
   */
  static Create(): SurroundPanner {
    // @0x124d247/@0x124d24c — operator new(0xf0), followed by the inlined C2
    // body @0x124d254..@0x124d30b and return of the object @0x124d316.
    return new SurroundPanner();
  }

  /**
   * `SurroundPanner::AngleBisectionRatio(double angle, double b, double c)`
   * — @Flexo 0x12513a0 (__ZN14SurroundPanner19AngleBisectionRatioEddd).
   *
   * Where `angle` (radians, negatives brought up by one full turn) sits
   * between the two bounding angles, as a 0..1 ratio, clamped to 1.0 above the
   * range and 0.0 below it. `b` and `c` are NOT assumed to be in order — the
   * body takes their MAXSD and MINSD.
   *
   * Faithful transcription; see the file header for the full instruction
   * listing and for the three traps this body contains (the shared epilogue
   * that makes `ja` return 0.0, the SSE min/max semantics, and the unguarded
   * divide).
   */
  static AngleBisectionRatio(angle: number, b: number, c: number): number {
    // @0x12513a8/@0x12513b0 — movsd 2π ; addsd %xmm0, %xmm5. Computed
    // unconditionally by the machine; only used when the mask below is set.
    const wrapped = angle + SURROUND_PANNER_TWO_PI;

    // @0x12513b8 cmpltsd %xmm3, %xmm0 : mask = (angle < 0.0); NaN gives false.
    // @0x12513bd blendvpd %xmm0, %xmm5, %xmm4 : select on that mask.
    // Note `< 0.0`, not `<= 0.0`: -0.0 is NOT less than 0.0, so a negative
    // zero is left alone.
    const a = angle < 0.0 ? wrapped : angle;

    // @0x12513c2/@0x12513c6 — movapd %xmm1,%xmm0 ; maxsd %xmm2,%xmm0 :
    // dst = b, src = c.
    const hi = sseMaxSd(b, c);

    // @0x12513ca ucomisd %xmm0, %xmm4 ; @0x12513ce jbe 0x12513de.
    // `jbe` is taken when a <= hi OR the compare is unordered, so the fall
    // through — the return of 1.0 — happens only when a > hi is ORDERED-true.
    if (a > hi) {
      // @0x12513d0/@0x12513d8 — movsd 1.0 ; movapd %xmm3, %xmm0 ; retq
      return SURROUND_PANNER_ONE;
    }

    // @0x12513de — minsd %xmm1, %xmm2 : dst = c, src = b. Note the operands are
    // in the opposite order to the maxsd above; that is what the encoding says.
    const lo = sseMinSd(c, b);

    // @0x12513e2 ucomisd %xmm4, %xmm2 ; @0x12513e6 ja 0x12513d8.
    // `ja` needs CF=0 and ZF=0, i.e. lo > a ordered — false on NaN. It jumps
    // PAST the `movsd` of 1.0, so the value returned there is the 0.0 still
    // sitting in xmm3 from @0x12513b4.
    if (lo > a) {
      return SURROUND_PANNER_ZERO;
    }

    // @0x12513e8 subsd %xmm2, %xmm4 ; @0x12513ec subsd %xmm2, %xmm0 ;
    // @0x12513f0 divsd %xmm0, %xmm4 — AT&T `subsd src, dst` is `dst = dst -
    // src` and `divsd src, dst` is `dst = dst / src`, so this is
    // (a - lo) / (hi - lo). The binary does not guard the denominator and
    // neither does this port.
    return (a - lo) / (hi - lo);
  }
}
