// hg_span_write_4s_wxyz.ts — Helium framework (render layer).
//
// Source: /Applications/Final Cut Pro.app/Contents/Frameworks/Helium.framework/
//         Versions/A/Helium  (macOS FCP, x86_64 slice; VA == file offset).
//
// -----------------------------------------------------------------------------
// SYMBOL PORTED
// -----------------------------------------------------------------------------
//   * hg_span_write_4s_wxyz(void*, int, float vector[4] const*, int)   @Helium 0x1ea660
//     __ZL21hg_span_write_4s_wxyzPviPKDv4_fi
//
// A FREE function with internal linkage (`__ZL` / `nm` class `t`), so per PORTING_SPEC's naming
// rule the file is named after the function, matching the landed siblings `hg_span_read_1h.ts`
// @0x1e6d00 and `hg_span_read_null.ts` @0x1e8f90 in the same span family.
//
// re/disasm: raw-port/re/disasm/Helium.__ZL21hg_span_write_4s_wxyzPviPKDv4_fi.s  (95 instructions)
// Differential: raw-port/re/oracle/hg_span_write_4s_wxyz_probe.py
//               raw-port/re/oracle/hg_span_write_4s_wxyz_driver.mts
//
// -----------------------------------------------------------------------------
// FRONTIER CALLEES
// -----------------------------------------------------------------------------
// NONE. No `callq`, no dispatch; the only non-register operand is one rip-relative constant
// vector, read four times. `depgraph.py deps __ZL21hg_span_write_4s_wxyzPviPKDv4_fi` reports
// nothing.
//
// -----------------------------------------------------------------------------
// WHAT IT DOES
// -----------------------------------------------------------------------------
// Writes a span of `count` float4 samples as 16-bit unsigned integers, ROTATING the channels
// xyzw -> wxyz (that is the `_wxyz` in the name) and scaling by 65535 with an unsigned-saturating
// clamp. Per sample: 16 bytes in, 8 bytes out.
//
//   out[0..3] = packusdw( cvtps2dq( min(65535, fround(in[3,0,1,2] * 65535)) ) )
//
// Three details a paraphrase gets wrong, all of them transcribed below and all of them measured
// against the live function:
//
//   * THE CLAMP IS `minps %xmm0, %xmm1` WITH THE CONSTANT AS THE DESTINATION (@0x1ea681,
//     @0x1ea6ce, @0x1ea718, @0x1ea795). In Intel order that is `MINPS K, scaled`, which returns
//     `(K < scaled) ? K : scaled` — so an UNORDERED lane (a NaN input) yields the SECOND operand,
//     i.e. the NaN, not the constant. The NaN then reaches `cvtps2dq`, which answers the "integer
//     indefinite" 0x80000000, and `packusdw` saturates that to 0. NaN in, ZERO out — not 65535.
//   * `cvtps2dq` ROUNDS TO NEAREST, TIES TO EVEN (MXCSR default), which `Math.round` does not do:
//     `Math.round(0.5)` is 1 and `Math.round(2.5)` is 3, where the machine answers 0 and 2. The
//     port implements the machine's rule; the oracle's corpus contains exact ties on purpose.
//   * THE HEAD PEEL IS AN ALIGNMENT FIXUP, not an odd/even peel (@0x1ea665 `testb $0xf, %dil`):
//     when the destination is not 16-byte aligned, ONE sample is written with an 8-byte `movq`
//     first, which makes the pointer aligned for the `movntdq` stores that follow. `movntdq` is
//     non-temporal and would fault on a misaligned address, so this branch is load-bearing rather
//     than an optimisation.
//
// The FOURTH ARGUMENT IS NEVER READ. `%ecx` is not touched anywhere in the 95 instructions; the
// parameter is part of the span-writer family's shared signature. It is kept in the port's
// signature for that reason and documented, rather than dropped.
//
// -----------------------------------------------------------------------------
// CONSTANT
// -----------------------------------------------------------------------------
//   @Helium 0x3cb250   16 bytes  00 ff 7f 47 x4  =  { 65535.0f, 65535.0f, 65535.0f, 65535.0f }
// Read from the LIVE image at `slide + 0x3cb250` (probe section B), not inferred from the name.
// All four `movaps <rip>` loads resolve to this one address:
//   @0x1ea673 +0x1e0bd6 -> 0x3cb250   @0x1ea6b6 +0x1e0b93 -> 0x3cb250
//   @0x1ea6f8 +0x1e0b51 -> 0x3cb250   @0x1ea787 +0x1e0ac2 -> 0x3cb250
//
// -----------------------------------------------------------------------------
// FULL DISASM (@0x1ea660..@0x1ea7a6) — the shape of the control flow
// -----------------------------------------------------------------------------
//   0x1ea660  testl %esi,%esi ; setle %al          ; al = (count <= 0)   [SIGNED]
//   0x1ea665  testb $0xf,%dil ; sete %cl           ; cl = (dst is 16-byte aligned)
//   0x1ea66c  orb   %al,%cl ; jne 0x1ea69b         ; skip the peel if empty OR already aligned
//   0x1ea670  movaps (%rdx),%xmm0                  ; -- the peeled sample --
//   0x1ea673  movaps 0x1e0bd6(%rip),%xmm1          ; K = 65535.0f x4  (@0x3cb250)
//   0x1ea67a  shufps $0x93,%xmm0,%xmm0             ; xmm0 = xmm0[3,0,1,2]   (xyzw -> wxyz)
//   0x1ea67e  mulps %xmm1,%xmm0                    ; scaled = shuffled * K
//   0x1ea681  minps %xmm0,%xmm1                    ; xmm1 = (K < scaled) ? K : scaled
//   0x1ea684  cvtps2dq %xmm1,%xmm0                 ; round-to-nearest-even -> int32 x4
//   0x1ea688  packusdw %xmm0,%xmm0                 ; saturate to u16 x4 in the low half
//   0x1ea68d  movq %xmm0,(%rdi)                    ; ONE 8-byte store
//   0x1ea691  addq $0x8,%rdi ; addq $0x10,%rdx ; decl %esi
//   0x1ea69b  pushq %rbp ; movq %rsp,%rbp          ; the frame is set up AFTER the peel
//   0x1ea69f  cmpl $0x2,%esi ; jl 0x1ea77d         ; fewer than 2 left -> tail with eax = esi
//   0x1ea6a8  leal -0x2(%rsi),%eax                 ; eax = esi - 2
//   0x1ea6ab  testb $0x2,%al ; jne 0x1ea6ef        ; bit 1 of (esi-2) set -> skip the 2-block
//   0x1ea6af  <TWO samples: two movaps, two shuffle/mul/min/cvt, one packusdw of BOTH>
//   0x1ea6e1  movntdq %xmm0,(%rdi)                 ; one 16-byte NON-TEMPORAL store
//   0x1ea6e5  addq $0x10,%rdi ; addq $0x20,%rdx ; movl %eax,%esi
//   0x1ea6ef  cmpl $0x2,%eax ; jb 0x1ea77f         ; UNSIGNED compare -> tail
//   0x1ea6f8  movaps 0x1e0b51(%rip),%xmm0          ; K hoisted out of the loop
//   0x1ea700  <FOUR samples: two packusdw pairs, movntdq (%rdi) and movntdq 0x10(%rdi)>
//   0x1ea766  addq $0x20,%rdi ; addq $0x40,%rdx
//   0x1ea76e  leal -0x4(%rsi),%eax                 ; eax = esi - 4
//   0x1ea771  addl $-0x6,%esi                      ; esi = esi - 6      (only for the compare)
//   0x1ea774  cmpl $-0x4,%esi
//   0x1ea777  movl %eax,%esi                       ; esi = esi_prev - 4  (the compare kept its flags)
//   0x1ea779  jb 0x1ea700                          ; loop while (unsigned)(esi_prev - 6) < 0xfffffffc
//   0x1ea77b  jmp 0x1ea77f
//   0x1ea77d  movl %esi,%eax                       ; the "fewer than 2" entry
//   0x1ea77f  cmpl $0x1,%eax ; jne 0x1ea7a5        ; exactly one left?
//   0x1ea784  <ONE sample, movq store>             ; same shape as the peel
//   0x1ea7a5  popq %rbp ; retq
//
// Note @0x1ea777: the `movl` sits BETWEEN the `cmpl` and the `jb` and does not disturb the flags,
// so the branch tests `esi - 6` while `esi` already holds `esi - 4`. Reading the `jb` as a test of
// the assigned value is the easiest mistake to make here, and it changes the trip count.

/** The @Helium 0x3cb250 constant vector: 65535.0f in all four lanes. */
const K65535 = 65535;

/** Scratch used to force float32 rounding on the product, as `mulps` does. */
const F32 = new Float32Array(1);

/**
 * `cvtps2dq` on one lane: round to nearest with ties to even, then take the int32. A value that
 * does not fit in an int32 — which includes NaN, since the clamp above lets a NaN through —
 * answers the "integer indefinite" 0x80000000, i.e. INT32_MIN.
 */
function cvtps2dq_lane(x: number): number {
  if (!(x >= -2147483648 && x <= 2147483647)) {
    return -2147483648; // 0x80000000 — the x86 integer-indefinite result
  }
  const floor = Math.floor(x);
  const frac = x - floor;
  if (frac > 0.5) return floor + 1;
  if (frac < 0.5) return floor;
  return floor % 2 === 0 ? floor : floor + 1; // a tie goes to the EVEN neighbour
}

/** `packusdw`: saturate a signed int32 into an unsigned 16-bit word. */
function packusdw_lane(v: number): number {
  if (v < 0) return 0;
  if (v > 0xffff) return 0xffff;
  return v;
}

/**
 * One source lane read. The machine's `movaps (%rdx)` reads 16 bytes of the mapping whatever the
 * caller passed; TypeScript yields `undefined` past the end of the array, which would become NaN
 * and then — through cvtps2dq's integer-indefinite and packusdw's saturation — a perfectly
 * plausible ZERO. That is the #154 silent-wrong-answer class, so this refuses out loud instead:
 * the caller owes `4 * count` floats, exactly as the C caller owes the mapping.
 */
function srcLane(src: Float32Array, index: number): number {
  const v = src[index];
  if (v === undefined) {
    throw new Error(
      "hg_span_write_4s_wxyz @Helium 0x1ea660 read past the source span at float index " +
        index +
        " — the machine's movaps @0x1ea670 reads 16 bytes per sample, so the caller must supply " +
        "4*count floats",
    );
  }
  return v;
}

/**
 * One LANE: scale, clamp, convert, pack, store the 16-bit word.
 *
 * @0x1ea67e mulps / @0x1ea681 minps / @0x1ea684 cvtps2dq / @0x1ea688 packusdw — and the identical
 * sequence at @0x1ea6c1, @0x1ea70b, @0x1ea73e, @0x1ea792.
 */
function writeLane(dst: DataView, byteOffset: number, value: number): void {
  // @0x1ea67e mulps %xmm1,%xmm0 — a float32 multiply, so the product is rounded to float32.
  F32[0] = value * K65535;
  const scaled = F32[0] as number;
  // @0x1ea681 minps %xmm0,%xmm1 — Intel `MINPS K, scaled` = (K < scaled) ? K : scaled. An
  // unordered comparison is false, so a NaN lane yields the NaN (the second operand), which is why
  // a NaN reaches cvtps2dq at all.
  const clamped = K65535 < scaled ? K65535 : scaled;
  // @0x1ea684 cvtps2dq ; @0x1ea688 packusdw
  dst.setUint16(byteOffset, packusdw_lane(cvtps2dq_lane(clamped)), true);
}

/**
 * One SAMPLE: the `shufps $0x93` rotation xyzw -> wxyz, then the four lanes, written straight into
 * the destination in the order the packed register holds them.
 *
 * @0x1ea67a shufps $0x93,%xmm0,%xmm0 — xmm0[3,0,1,2]: lane 0 takes w, then x, y, z. The rotation
 * is spelled out rather than looped over an index table, so there is no computed read to get wrong.
 */
function sample(src: Float32Array, srcIndex: number, dst: DataView, dstByte: number): void {
  writeLane(dst, dstByte + 0, srcLane(src, srcIndex + 3)); // w
  writeLane(dst, dstByte + 2, srcLane(src, srcIndex + 0)); // x
  writeLane(dst, dstByte + 4, srcLane(src, srcIndex + 1)); // y
  writeLane(dst, dstByte + 6, srcLane(src, srcIndex + 2)); // z
}

/**
 * `hg_span_write_4s_wxyz(void* dst, int count, float4 const* src, int unused)` — @Helium 0x1ea660
 *
 * ABI: %rdi = dst, %esi = count, %rdx = src, %ecx = the unread fourth argument.
 *
 * @param dst        the destination span. The machine tests the low nibble of the ADDRESS
 *                   (@0x1ea665 `testb $0xf,%dil`) to decide whether to peel a sample, and
 *                   TypeScript has no addresses — so the model tests `dst.byteOffset & 0xf`,
 *                   i.e. the view's offset carries the alignment. A caller whose buffer starts
 *                   16-byte aligned therefore reproduces the machine's branch exactly, and the
 *                   differential drives BOTH paths by handing the live function a pointer with the
 *                   same low nibble as the view.
 * @param count      %esi. Compared SIGNED at the head (`setle`) and UNSIGNED inside the loop
 *                   (`jb`), which the port reproduces literally rather than normalising.
 * @param src        the float4 source span, four floats per sample, read from index 0.
 * @param unusedArg  %ecx. Never read by the body; present because the family's signature has it.
 */
export function hg_span_write_4s_wxyz(
  dst: DataView,
  count: number,
  src: Float32Array,
  unusedArg: number,
): void {
  void unusedArg; // %ecx is not touched in any of the 95 instructions.

  let dstByte = 0; // %rdi, as an offset into `dst`
  let srcIdx = 0; // %rdx, as a float index into `src`
  let esi = count | 0;

  /** `movq %xmm0,(%rdi)` — the 8-byte store of ONE packed sample (@0x1ea68d, @0x1ea7a1). */
  const storeOne = (): void => {
    sample(src, srcIdx, dst, dstByte);
  };
  /**
   * `movntdq %xmm0,(%rdi)` — the 16-byte NON-TEMPORAL store of TWO packed samples. The two samples
   * are packed into one register (`packusdw %xmm1,%xmm0` @0x1ea6dc) and stored together; the port
   * writes the same eight words to the same eight offsets. Non-temporality is a cache hint with no
   * observable effect on the bytes, which is why it is documented rather than modelled.
   */
  const storeTwo = (byteOffset: number, srcOffset: number): void => {
    sample(src, srcIdx + srcOffset, dst, byteOffset);
    sample(src, srcIdx + srcOffset + 4, dst, byteOffset + 8);
  };

  // @0x1ea660..0x1ea66e — al = (count <= 0), cl = (dst aligned), skip the peel if either holds.
  const countIsEmpty = esi <= 0;
  const dstIsAligned = (dst.byteOffset & 0xf) === 0;
  if (!(countIsEmpty || dstIsAligned)) {
    // @0x1ea670..0x1ea699 — one sample, then dst += 8, src += 16, count -= 1.
    storeOne();
    dstByte += 8;
    srcIdx += 4;
    esi = (esi - 1) | 0;
  }

  // @0x1ea69f cmpl $0x2,%esi ; jl 0x1ea77d — a SIGNED compare.
  let eax: number;
  if (esi < 2) {
    // @0x1ea77d movl %esi,%eax
    eax = esi;
  } else {
    // @0x1ea6a8 leal -0x2(%rsi),%eax
    eax = (esi - 2) | 0;
    // @0x1ea6ab testb $0x2,%al ; jne 0x1ea6ef — bit 1 of (count-2) clear -> write two samples.
    if ((eax & 0x2) === 0) {
      // @0x1ea6af..0x1ea6ed — two samples in one 16-byte non-temporal store.
      storeTwo(dstByte, 0);
      dstByte += 16;
      srcIdx += 8;
      // @0x1ea6ed movl %eax,%esi
      esi = eax;
    }
    // @0x1ea6ef cmpl $0x2,%eax ; jb 0x1ea77f — UNSIGNED: (count-2) < 2 goes straight to the tail.
    if (eax >>> 0 >= 2) {
      // @0x1ea700..0x1ea779 — four samples per iteration, two 16-byte non-temporal stores.
      for (;;) {
        storeTwo(dstByte, 0); // @0x1ea72e movntdq %xmm2,(%rdi)
        storeTwo(dstByte + 16, 8); // @0x1ea761 movntdq %xmm2,0x10(%rdi)
        // @0x1ea766 addq $0x20,%rdi ; @0x1ea76a addq $0x40,%rdx
        dstByte += 32;
        srcIdx += 16;
        // @0x1ea76e leal -0x4(%rsi),%eax
        const next = (esi - 4) | 0;
        // @0x1ea771 addl $-0x6,%esi — this value is what the branch below tests…
        const tested = (esi - 6) | 0;
        // @0x1ea777 movl %eax,%esi — …while esi already holds esi-4 (the movl keeps the flags).
        esi = next;
        eax = next;
        // @0x1ea774 cmpl $-0x4,%esi ; @0x1ea779 jb 0x1ea700 — UNSIGNED against 0xfffffffc.
        if (!((tested >>> 0) < 0xfffffffc)) break;
      }
    }
  }

  // @0x1ea77f cmpl $0x1,%eax ; jne 0x1ea7a5 — exactly one sample left.
  if (eax === 1) {
    // @0x1ea784..0x1ea7a1 — the same shape as the peel, with the 8-byte movq store.
    storeOne();
  }
  // @0x1ea7a5 popq %rbp ; retq
}
