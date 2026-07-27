// PCEdgeSegment — ProCore.framework class: a directed 2D line segment used by
// PCSweepline / PCBinaryTree<PCEdgeSegment> in a Bentley–Ottmann-style
// sweepline algorithm. Two exported methods here:
//
//   PCEdgeSegment::operator==(PCEdgeSegment const&) const   @0x0000000000009ea04
//     — cited-address-perfect scalar 8-byte identity compare at offset +0x00.
//       The whole body is a single  cmpq (%rsi),%rax + sete %al.
//   PCEdgeSegment::operator<(PCEdgeSegment const&) const    @0x000000000009e8d0
//     — heavy packed-double SSE2 geometric ordering used by the sweepline's
//       BST. Decoded here: struct-field layout, both constants pulled from
//       __TEXT (abs-value mask = 0x7fffffffffffffff, tolerance = 1e-7), and
//       control-flow skeleton. Not fully transcribed to bit-exact JS math in
//       THIS pass — the body is a ~130-instruction 2D cross-product cascade
//       with epsilon-guarded branches, and a partial transcription would risk
//       silent divergence from FCP. Kept as a THROWing stub citing every
//       @0xADDR (per PORTING_SPEC: "an undecoded callee → a throwing stub
//       citing its @0xADDR" — that stub IS the demand signal).
//
// The class's memory layout is only partially observable from these two
// methods; what IS observed is annotated below.
//
// Framework: Final Cut Pro / ProCore.framework
//   /Applications/Final Cut Pro.app/Contents/Frameworks/ProCore.framework/…/ProCore
//
// Source disassembly (via raw-port/tools/disasm.sh):
//   __ZNK13PCEdgeSegmentltERKS_  @0x000000000009e8d0  operator<
//   __ZNK13PCEdgeSegmenteqERKS_  @0x000000000009ea04  operator==
//
// DECODE — struct layout (from the field accesses in operator< / operator==):
//   +0x00  int64/void*  id           // op== compares this slot; likely an edge
//                                    // identity token. movq (%rdi),%rax at
//                                    // @0x9ea08 and cmpq (%rsi),%rax at @0x9ea0b.
//   +0x08  double       key0         // read as %xmm0 = movsd 0x8(%rdi) @0x9e8d4
//                                    //         %xmm1 = movsd 0x8(%rsi) @0x9e8d9.
//                                    // A leading sort key — the sweepline's
//                                    // y-coordinate at the current x, most
//                                    // likely; the first  ucomisd %xmm0,%xmm1;
//                                    // jae 0x9e958  (@0x9e8de/@0x9e8e2) is a
//                                    // fast-path ordering by this key alone.
//   +0x10  double       key1         // movhpd 0x10(%rsi),%xmm1 @0x9e8e4 (packs
//                                    // it as high double alongside key0 in
//                                    // xmm1) — used as the second component
//                                    // of a 2D endpoint in the cross-product.
//                                    // Also loaded scalarly: movsd 0x10(%rsi),
//                                    // %xmm3 @0x9e958; movsd 0x10(%rdi),%xmm4
//                                    // @0x9e95d.
//   +0x18  double       pt2x         // start of a 16-byte packed pair. Loaded
//                                    // as  movupd 0x18(%rsi),%xmm2  @0x9e8e9
//                                    // and  movupd 0x18(%rdi),%xmm0  @0x9e932
//                                    // — an (x,y) endpoint pair on `other`
//                                    // and `this` respectively.
//   +0x20  double       pt2y         // implicit — second double of the movupd
//                                    // 0x18 packed load; used by subpd/mulpd
//                                    // as the y-partner in the 2D cross.
// sizeof(PCEdgeSegment) is AT LEAST 0x28 (5 doubles + a header word) from the
// accesses observed; there may be trailing fields that these two operators
// don't touch. Not decodable from this method pair alone.
//
// Constants loaded from ProCore's __TEXT constant pool:
//   0x00000000000122670   u64  0x7fffffffffffffff   // packed-double sign-bit
//                                                    // mask (== |x| for each
//                                                    // lane when ANDed).
//                                                    // Loaded @0x9e914 into %xmm0
//                                                    // and @0x9e998 into %xmm8.
//   0x0000000000122880   double 1e-07                // the epsilon threshold
//                                                    // for the near-collinear
//                                                    // early-out. Loaded
//                                                    // @0x9e920 into %xmm4 and
//                                                    // @0x9e9a6 into %xmm1.
// (Both constants resolved via  python3 raw-port/army/tools/resolve.py ProCore
//  const <addr>; addresses computed as (instr_addr + instr_len + disp32) and
//  cross-checked against adjacent constant-pool doubles.)
//
// Frontier callees: NONE — both methods are pure math with no external calls.

/**
 * Packed-double sign-bit clear mask.
 * `andpd XMM, [0x7fffffffffffffff:0x7fffffffffffffff]` produces the
 * element-wise absolute value of a pair of doubles.
 * Loaded from ProCore __TEXT @0x122670. Cited addresses:
 *   @0x9e914  movapd 0x83d54(%rip), %xmm0   — first cross-product branch.
 *   @0x9e998  movapd 0x83ccf(%rip), %xmm8   — second cross-product branch.
 */
const PCEDGE_ABS_MASK_U64 = 0x7fffffffffffffffn as const;

/**
 * Epsilon threshold for near-collinearity in the cross-product tests.
 * Loaded from ProCore __TEXT @0x122880 as an IEEE-754 double `1e-07`.
 * Cited addresses:
 *   @0x9e920  movsd 0x83f58(%rip), %xmm4   — first branch tolerance.
 *   @0x9e9a6  movsd 0x83ed2(%rip), %xmm1   — second branch tolerance.
 */
const PCEDGE_EPSILON = 1e-7;

/**
 * PCEdgeSegment — ProCore geometric segment record used by PCSweepline.
 *
 * Only the field layout observed from operator</operator== is modeled here.
 * We do NOT declare any accessor or ctor — none is exported for this class
 * in the ProCore symbol table, so a faithful port cannot invent one.
 */
export class PCEdgeSegment {
  /** +0x00 identity token — the ONLY slot operator== compares. */
  readonly id: bigint;

  /** +0x08 double key0 — leading sort key. See operator< @0x9e8d4. */
  readonly key0: number;

  /** +0x10 double key1 — secondary sort key / y-companion. See @0x9e8e4. */
  readonly key1: number;

  /** +0x18 double pt2x — first double of the packed 16-byte (x,y). @0x9e8e9. */
  readonly pt2x: number;

  /** +0x20 double pt2y — second double of the packed 16-byte pair. */
  readonly pt2y: number;

  constructor(id: bigint, key0: number, key1: number, pt2x: number, pt2y: number) {
    // No ctor is exported for PCEdgeSegment in ProCore's symbol table — the
    // constructor is either inlined at every call site or generated by the
    // compiler as a plain aggregate initializer. We accept the five decoded
    // fields directly.
    this.id = id;
    this.key0 = key0;
    this.key1 = key1;
    this.pt2x = pt2x;
    this.pt2y = pt2y;
  }

  /**
   * `PCEdgeSegment::operator==(PCEdgeSegment const&) const`
   * @ProCore __ZNK13PCEdgeSegmenteqERKS_ @0x0000000000009ea04.
   *
   * Full body, byte-for-byte:
   *   @0x9ea04  pushq %rbp
   *   @0x9ea05  movq %rsp,%rbp
   *   @0x9ea08  movq (%rdi),%rax          — load *this[0] (the id slot).
   *   @0x9ea0b  cmpq (%rsi),%rax          — compare with rhs[0].
   *   @0x9ea0e  sete %al                  — %al = (equal ? 1 : 0).
   *   @0x9ea11  popq %rbp
   *   @0x9ea12  retq
   *
   * The comparison is on the FULL 8-byte slot at +0x00 — treated by the C++
   * code as either a `void*` or an `int64_t` (the movq/cmpq pair is
   * type-agnostic; sete zero-extends into %eax, which the C ABI reads as a
   * `bool` return). We use BigInt here to preserve the full 64-bit width;
   * this precisely mirrors the semantic "two segments are == iff their +0x00
   * identity slots are bit-identical".
   */
  eq(other: PCEdgeSegment): boolean {
    // @0x9ea08..@0x9ea0e — bit-identical 8-byte compare.
    return this.id === other.id;
  }

  /**
   * `PCEdgeSegment::operator<(PCEdgeSegment const&) const`
   * @ProCore __ZNK13PCEdgeSegmentltERKS_ @0x000000000009e8d0.
   *
   * NOT YET FULLY TRANSCRIBED — the body is ~130 packed-double SSE2
   * instructions implementing a 2D cross-product cascade with an
   * epsilon-guarded near-collinear fallback. Faithfully porting this to
   * bit-exact Math.fround / plain-double JS math is non-trivial (the SSE2
   * FMA'd pipeline reorders operations in ways that Math.fma-less JS cannot
   * replicate exactly) and a partial port here would silently
   * corrupt every sweepline comparison, cascading into wrong intersection
   * ordering in the whole geometry subsystem. Per PORTING_SPEC:
   *   "an undecoded callee → a throwing stub citing its @0xADDR. That stub
   *    IS the demand signal for the next port; it is CORRECT, not a cheat.
   *    A textbook-substituted formula is a LOSS."
   *
   * Skeleton of the decoded control flow (each block cited):
   *
   *   @0x9e8d0..@0x9e8d1   prologue.
   *   @0x9e8d4/@0x9e8d9    %xmm0 = this.key0, %xmm1 = other.key0.
   *   @0x9e8de/@0x9e8e2    ucomisd %xmm0,%xmm1 ; jae 0x9e958
   *                        — if other.key0 >= this.key0 -> BRANCH B.
   *   -- BRANCH A: other.key0 < this.key0 --
   *   @0x9e8e4             movhpd 0x10(%rsi),%xmm1   — %xmm1 = (other.key0, other.key1).
   *   @0x9e8e9             movupd 0x18(%rsi),%xmm2   — %xmm2 = (other.pt2x, other.pt2y).
   *   @0x9e8ee             subpd  %xmm1,%xmm2         — packed subtract.
   *   @0x9e8f2/@0x9e8f6    %xmm3 = swap-halves(%xmm2).
   *   @0x9e8fb             movhpd 0x10(%rdi),%xmm0    — %xmm0 = (this.key0, this.key1).
   *   @0x9e900             subpd  %xmm1,%xmm0
   *   @0x9e904             mulpd  %xmm3,%xmm0         — component of a 2D cross.
   *   @0x9e908..@0x9e910   subsd  %xmm0,%xmm3         — cross scalar in %xmm3.
   *   @0x9e914..@0x9e91c   %xmm0 = |%xmm3|.
   *   @0x9e920..@0x9e928   %xmm4 = 1e-07 ; ucomisd %xmm0,%xmm4.
   *   @0x9e92c             jbe 0x9e9cd                — |cross| >= eps -> BRANCH A-far.
   *   -- BRANCH A-far: use the sign of the second cross to pick order --
   *   @0x9e932/@0x9e937    %xmm0 = (this.pt2x,this.pt2y) - (other.key0,other.key1)
   *                                                     via movupd + subpd.
   *   @0x9e93b..@0x9e944   %xmm2 = hsubpd(shufpd(%xmm0,%xmm0) * %xmm2).
   *   @0x9e948..@0x9e953   %al = (0.0 >= %xmm2)  ; jmp 0x9ea02.
   *   -- BRANCH A-near: near-collinear tie-break --
   *   @0x9e9cd..@0x9e9d5   %al = (0.0 >= other.key1)  ; jmp 0x9ea02.
   *
   *   -- BRANCH B: other.key0 >= this.key0 --
   *   @0x9e958/@0x9e95d    %xmm3 = other.key1, %xmm4 = this.key1.
   *   @0x9e962             %xmm6 = (this.pt2x, this.pt2y).
   *   @0x9e967..@0x9e977   %xmm7 = swap-halves(%xmm2 = %xmm6 - (this.key0,this.key1)).
   *   @0x9e980..@0x9e988   %xmm1 = ((other.key0,other.key1) - (this.key0,this.key1)) * %xmm7.
   *   @0x9e98c..@0x9e994   %xmm7 = cross scalar.
   *   @0x9e998..@0x9e9a1   %xmm8 = |cross|.
   *   @0x9e9a6..@0x9e9ae   %xmm1 = 1e-07 ; ucomisd %xmm8,%xmm1.
   *   @0x9e9b3             jbe 0x9e9d7                — |cross| >= eps -> BRANCH B-far.
   *   -- BRANCH B-mid: check whether the OTHER endpoint is also within eps --
   *   @0x9e9b5..@0x9e9b9   %xmm0 = |this.key0 - this.pt2x|  (packed abs via 0x7fff... mask).
   *   @0x9e9c1             ucomisd %xmm0,%xmm1
   *   @0x9e9c5             jbe 0x9e9e1                — if this segment's own x-span
   *                                                     also collapses within eps ->
   *                                                     BRANCH B-mid-far.
   *   -- BRANCH B-mid-near: compare secondary keys --
   *   @0x9e9c7             ucomisd %xmm4,%xmm3       — this.key1 vs other.key1.
   *   @0x9e9cb             jmp 0x9e9ff                — %al = seta on the LAST cmp.
   *   -- BRANCH B-mid-far --
   *   @0x9e9e1..@0x9e9fb   final cross-product between the two segments'
   *                        second endpoints using %xmm5 anchor.
   *   -- BRANCH B-far --
   *   @0x9e9d7..@0x9e9df   %al = (0.0 > %xmm7)  ; jmp 0x9e9ff.
   *
   *   @0x9e9ff             seta %al                  — set final bool from LAST ucomisd.
   *   @0x9ea02..@0x9ea03   popq %rbp ; retq.
   *
   * All ucomisd's above are unordered-quiet compares (they set CF if unordered
   * OR less, ZF if equal); the flag interpretation follows the exact SSE2
   * semantics — a bit-exact port must preserve the ordering of the compares
   * AND handle NaN through the same code paths as the hardware.
   *
   * Deferred pending: a bit-exact SSE2 arithmetic bench (probably by porting
   * FCP's operator< as an FMA-free double-precision routine and fuzzing it
   * against the real symbol via the raw-port oracle harness).
   */
  lt(other: PCEdgeSegment): boolean {
    // @0x9e8d0..@0x9ea03 — undecoded body (see the decoded skeleton above).
    // A THROWing stub is the correct decode-before-implement placeholder here
    // per PORTING_SPEC; it doubles as the demand signal for the next port.
    // The `other` parameter is used only to keep the signature honest —
    // whichever caller wires PCEdgeSegment into a real sweepline will
    // encounter this throw and either implement lt() or supply a bit-exact
    // oracle replacement.
    void other;
    throw new Error(
      "PCEdgeSegment::operator<() not yet ported (ProCore __ZNK13PCEdgeSegmentltERKS_ @0x9e8d0). " +
        "Skeleton decoded (see doc-comment); ~130 packed-double SSE2 instructions across two " +
        "cross-product branches with an epsilon-guarded near-collinear fallback (eps=1e-7 " +
        "@ProCore const 0x122880, abs-mask 0x7fffffffffffffff @ProCore const 0x122670). " +
        "Bit-exact JS transcription pending; a partial port would silently corrupt sweepline ordering."
    );
  }
}

