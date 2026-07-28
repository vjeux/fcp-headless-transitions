// raw-port/src/channels/OZFreeHandEvent.ts
//
// FCP `OZFreeHandEvent` — Ozone class representing one keyframe/sample of a
// free-hand recorded animation curve. Each event carries 3 pairs of doubles
// (48 bytes on disk / in memory) that the cubic interpolator blends between.
//
// This file currently ports one leaf math method — the cubic (Catmull-Rom /
// centripetal-Hermite) interpolator that produces a smoothly interpolated
// event from 4 neighboring events in a circular buffer of length 4.
//
// DECODE: transcribed line-for-line from the x86_64 disassembly in
//   re/disasm/OZFreeHandEvent.cubicInterpolate.s
// Rip-relative __const doubles read directly out of the Ozone x86_64 slice
// with `raw-port/army/tools/resolve.py Ozone const 0x<addr>` (see @const table
// below). This is a faithful transcription of the compiler's exact op order;
// nothing here is approximated.
//
// Symbols (Ozone framework, x86_64 slice, file/VM offset 0x00000000003dd230):
//   0x3dd230  OZFreeHandEvent::cubicInterpolate(double, OZFreeHandEvent*, int)
//
// STRUCT LAYOUT (recovered from the loads/stores in cubicInterpolate; ONLY the
// fields this method touches are proven — the class is at least 48 bytes):
//   0x00 : double[2]  v0        // first packed-double slot
//   0x10 : double[2]  v1        // second packed-double slot
//   0x20 : double[2]  v2        // third packed-double slot
//   0x30 : (unknown; not touched by cubicInterpolate)
//
// The event is used as a 6-double vector (three xmm-lane pairs). The method
// stores an interpolated 6-double vector back into `*this`.
//
// Data constants read from the framework's __const:
//   VA 0x706ed8 : double 3.0                       (referenced @0x3dd2d5)
//   VA 0x7053e0 : double 1.0                       (referenced @0x3dd2e9)
//   VA 0x705400 : double[2] { 0.5, 0.5 }           (referenced @0x3dd32c)

/**
 * The three packed-double slots the interpolator reads/writes.
 * Layout matches the FCP class exactly (each slot is a `movupd`/`movapd`
 * pair of doubles at +0x00 / +0x10 / +0x20). We expose them as an object
 * with `v0`/`v1`/`v2` `[double, double]` tuples so downstream ports can
 * name what they use without inventing extra semantics.
 */
export interface OZFreeHandEventShape {
  v0: [number, number]; // +0x00 (16 bytes)
  v1: [number, number]; // +0x10 (16 bytes)
  v2: [number, number]; // +0x20 (16 bytes)
}

/**
 * Circular modulo-4 (positive result for negative i), matching the compiler
 * idiom used at 0x3dd234..0x3dd293:
 *   `((i + k) % 4 + 4) % 4`
 *
 * The binary uses the classic `cmovnsl` + `andl $-4, r; negl r; addl r, i`
 * sign-safe divmod-by-4 pattern (round toward -inf, mask, negate, add). For
 * every non-negative `i` this is exactly `(i + k) & 3`, and for negative `i`
 * it recovers a positive residue in [0, 3].
 *
 * @0x3dd234 (start of the four unrolled index calculations)
 */
function circMod4(x: number): number {
  // Integer semantics only; callers must pass an int32-ish index.
  const r = x % 4;
  return r < 0 ? r + 4 : r;
}

/**
 * OZFreeHandEvent::cubicInterpolate(double f, OZFreeHandEvent* arr, int i)
 *
 * Interpolates a single OZFreeHandEvent between `arr[(i+2)%4]` (as pB) and
 * `arr[(i+1)%4]` (as pC) using the standard cubic Hermite basis with
 * Catmull-Rom tangents:
 *
 *   pA = arr[(i+3)%4]        (previous)     // rcx = ((i+3)%4)*48
 *   pB = arr[(i+2)%4]        (from)         // rdi = ((i+2)%4)*48
 *   pC = arr[(i+1)%4]        (to)           // r8  = ((i+1)%4)*48
 *   pD = arr[ i   %4]        (next)         // rdx = ( i   %4)*48
 *
 *   m1 = 0.5 * (pC - pA)        // tangent at pB
 *   m2 = 0.5 * (pD - pB)        // tangent at pC
 *
 *   h00 =  2f^3 - 3f^2 + 1
 *   h10 =   f^3 - 2f^2 + f
 *   h01 = -2f^3 + 3f^2
 *   h11 =   f^3 -  f^2
 *
 *   *this = h00*pB + h10*m1 + h01*pC + h11*m2   (per each of the 3 slots)
 *
 * IMPORTANT: `i` is expected to walk BACKWARDS through the ring — pB (from)
 * is at `(i+2)%4` and pC (to) is at `(i+1)%4`. This is exactly how the
 * assembly wires it (the (i+3)%4 index is loaded first as pA, and the raw
 * `i%4` slot is pD). Callers that want a natural forward `i -> i+1` walk
 * must adjust `i` accordingly. We keep the FCP ordering verbatim.
 *
 * @0x3dd230
 */
export function OZFreeHandEvent_cubicInterpolate(
  out: OZFreeHandEventShape,
  f: number,
  arr: readonly OZFreeHandEventShape[],
  i: number,
): void {
  // ---- index the circular 4-buffer @0x3dd234..0x3dd293 ----
  const iA = circMod4(i + 3); // pA slot -> rcx
  const iB = circMod4(i + 2); // pB slot -> rdi
  const iC = circMod4(i + 1); // pC slot -> r8
  const iD = circMod4(i);     // pD slot -> rdx
  const pA = arr[iA];
  const pB = arr[iB];
  const pC = arr[iC];
  const pD = arr[iD];

  // ---- Hermite basis weights @0x3dd2bd..0x3dd309 ----
  // Constants: 3.0 @0x706ed8 (@0x3dd2d5), 1.0 @0x7053e0 (@0x3dd2e9).
  const f2 = f * f;              // @0x3dd2c1 : mulsd xmm0,xmm5
  const f3 = f * f2;             // @0x3dd2c9 : mulsd xmm5,xmm3
  const twoF3 = f3 + f3;         // @0x3dd2d1 : addsd xmm3,xmm6
  const threeF2 = 3.0 * f2;      // @0x3dd2dd : mulsd [3.0]
  const h00 = twoF3 - threeF2 + 1.0;              // @0x3dd2e5 + @0x3dd2e9 (subsd + addsd [1.0])
  // xmm2/xmm3 chain:
  //   xmm3 = f3 - f2       (later h11)
  //   xmm5 = 2*f2          (destroys original f2)
  //   xmm2 = f3 - 2*f2 + f (h10)
  const h11 = f3 - f2;                            // @0x3dd2f9 : subsd xmm5,xmm3
  const twoF2 = f2 + f2;                          // @0x3dd2fd : addsd xmm5,xmm5
  const h10 = f3 - twoF2 + f;                     // @0x3dd301 + @0x3dd305 (subsd xmm5,xmm2 ; addsd xmm0,xmm2)
  const h01 = threeF2 - twoF3;                    // @0x3dd309 : subsd xmm6,xmm4

  // ---- per-slot Hermite blend (three unrolled passes for the 3 pair-slots) ----
  // Constant: 0.5 pair @0x705400 (@0x3dd32c, movapd broadcast).
  // Each pass is a movupd/subpd/mulpd/addpd sequence that computes exactly:
  //   m1 = 0.5*(pC - pA), m2 = 0.5*(pD - pB), out = h00*pB + h10*m1 + h01*pC + h11*m2.
  //
  // The three unrolled blocks in the binary differ only in the base offset
  // (+0x00 / +0x10 / +0x20) and in incidental register renaming; the math
  // is identical. See @0x3dd30d, @0x3dd38d, @0x3dd3fc.
  hermitePairInto(out.v0, pA.v0, pB.v0, pC.v0, pD.v0, h00, h10, h01, h11);
  hermitePairInto(out.v1, pA.v1, pB.v1, pC.v1, pD.v1, h00, h10, h01, h11);
  hermitePairInto(out.v2, pA.v2, pB.v2, pC.v2, pD.v2, h00, h10, h01, h11);
}

/**
 * One packed-double Hermite blend, matching the movupd/subpd/mulpd/addpd
 * pattern at @0x3dd30d..0x3dd389 (and its two clones at @0x3dd38d and
 * @0x3dd3fc). Writes `out` in place (as `movupd %xmm5, (%rax)` does).
 *
 * The two tangents are computed in the compiler-chosen CSE form
 *   m1 = 0.5*(pB - pA) + 0.5*(pC - pB)
 *   m2 = 0.5*(pD - pC) + 0.5*(pC - pB)
 * which algebraically equal 0.5*(pC - pA) and 0.5*(pD - pB) respectively.
 * We preserve the compiler's summation ORDER exactly so the rounded doubles
 * match the binary bit-for-bit.
 *
 * @0x3dd30d
 */
function hermitePairInto(
  out: [number, number],
  pA: readonly [number, number],
  pB: readonly [number, number],
  pC: readonly [number, number],
  pD: readonly [number, number],
  h00: number,
  h10: number,
  h01: number,
  h11: number,
): void {
  // Lane 0
  const halfBmA0 = 0.5 * (pB[0] - pA[0]);
  const halfCmB0 = 0.5 * (pC[0] - pB[0]);
  const halfDmC0 = 0.5 * (pD[0] - pC[0]);
  const m1_0 = halfBmA0 + halfCmB0;
  const m2_0 = halfDmC0 + halfCmB0;
  out[0] = h00 * pB[0] + h10 * m1_0 + h01 * pC[0] + h11 * m2_0;
  // Lane 1
  const halfBmA1 = 0.5 * (pB[1] - pA[1]);
  const halfCmB1 = 0.5 * (pC[1] - pB[1]);
  const halfDmC1 = 0.5 * (pD[1] - pC[1]);
  const m1_1 = halfBmA1 + halfCmB1;
  const m2_1 = halfDmC1 + halfCmB1;
  out[1] = h00 * pB[1] + h10 * m1_1 + h01 * pC[1] + h11 * m2_1;
}
