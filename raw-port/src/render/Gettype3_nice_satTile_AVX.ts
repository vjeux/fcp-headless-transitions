// Gettype3_nice_satTile_AVX(HGTile*, HGToneCurve::State*, HGNode*)  @Helium 0x279470
//
// A file-local (`__ZL…`, nm class `t`) AVX tile kernel from the HGToneCurve translation unit:
// one of the `Gettype<N>_<quality>[_sat]Tile_AVX` family that HGToneCurve dispatches to once
// `AcceleratedState` has classified the curve (see raw-port/src/render/HGToneCurve.ts). Per
// PORTING_SPEC's naming rule a free function lives in a file named after it.
//
// Decode evidence (regenerate with
//   bash raw-port/tools/disasm.sh --sym __ZL25Gettype3_nice_satTile_AVXP6HGTilePN11HGToneCurve5StateEP6HGNode Helium
// ): 228 lines, a LEAF — no `call` of any kind, no vtable slot, no RIP-relative constant. Every
// constant it uses is read out of the `HGToneCurve::State` block through %rsi, so this port takes
// the State as a byte view and reads the same offsets rather than inventing numbers.
//
// WHAT IT COMPUTES (per RGBA float32 texel)
//   1. unpremultiply by alpha, using `vrcpps` + one Newton–Raphson step
//        r  = rcpps(max(a, K200)) * K220
//        r' = (r + r) - (a * r) * r                       [2r - a·r² — the NR refinement]
//        r' = (r' & K1E0) | K80                           [mask/force: the state supplies the
//                                                          pattern, so this port applies it as
//                                                          bits, exactly like the machine]
//        c  = texel * r'                                  [all four components, alpha included]
//   2. clamp:  t = min(max(c, K940), KA0)
//   3. gamma:  pow(t + S04, S00) evaluated as exp2(S00 * log2(x)) with the classic
//              log2 = (exponent) + poly(mantissa) / exp2 = 2^floor · poly(frac) pair whose
//              coefficients live at State +0x460..+0x520 (log2) and +0x540..+0x5c0 (exp2)
//   4. blend the linear segment (t * S20) in where t - S24 < K940, scale by S0C, clamp to KA0
//   5. re-premultiply by the UNPREMULTIPLIED alpha, then `vblendps` the alpha lane straight
//      through from step 1 (lanes 3 and 7), and store.
//
// The 8-wide body handles TWO texels per iteration; the odd texel left over at the end of a row
// (or a row narrower than 2 texels) goes through a 4-wide SSE body at @0x27971a. The two bodies
// are NOT the same instruction sequence — @0x279554 uses `vcmpltps` (ordered) where @0x27978b
// uses `vcmpnleps` (unordered-true), which differ on NaN — so they are transcribed separately
// rather than shared, and the difference is called out at both sites.
//
// AT&T operand order (PORTING_SPEC's cheat-sheet): `vop src2, src1, dst` is Intel
// `vop dst, src1, src2`, so `vmaxps 0x200(%rsi), %ymm1, %ymm2` is ymm2 = MAXPS(src1=ymm1,
// src2=mem) and MAXPS returns src2 when the operands are equal or unordered.

/** Scratch used only to reinterpret one f32 as its bit pattern and back — the machine's
 *  `vandps`/`vorps`/`vpslld`/`vpsrld` operate on the bits of the same register file, and JS has
 *  no other way to express that. Not an FCP function; pure plumbing. */
const bitScratch = new DataView(new ArrayBuffer(4));

function bitsOf(x: number): number {
  bitScratch.setFloat32(0, x, true);
  return bitScratch.getUint32(0, true);
}

function floatOf(bits: number): number {
  bitScratch.setUint32(0, bits >>> 0, true);
  return bitScratch.getFloat32(0, true);
}

/** MAXPS lane rule: `(src1 > src2) ? src1 : src2` — so src2 wins on equal AND on unordered. */
function maxps(src1: number, src2: number): number {
  return src1 > src2 ? src1 : src2;
}

/** MINPS lane rule: `(src1 < src2) ? src1 : src2` — src2 wins on equal AND on unordered. */
function minps(src1: number, src2: number): number {
  return src1 < src2 ? src1 : src2;
}

/** CMPPS lane result: all-ones on true, all-zero on false (consumed by vandps/vblendvps). */
const MASK_TRUE = 0xffffffff;
const MASK_FALSE = 0x00000000;

/**
 * `vrcpps` — the AVX fast reciprocal SEED. This is the one place this file is not bit-exact, and
 * it is not bit-exact because the instruction itself is implementation-defined: Intel specifies
 * only "relative error < 1.5·2^-12", and the actual bits differ per microarchitecture (and, on
 * this box, per Rosetta's translation).
 *
 * MEASURED on this machine (raw-port/re/oracle/Gettype3_nice_satTile_AVX_oracle.py extracts the
 * seed through this very kernel: with alpha ≈ 0 the Newton step @0x279504..0x27950c degenerates
 * to `2r`, which exposes the raw seed, and the recovery is UNIQUE):
 *
 *     rcpps(1.0)       = 0x3f7ff000 = 0.99975586   (NOT 1.0 — relative error -2^-12)
 *     rcpps(2.0)       = 0x3efff000 = 0.49987793   (-2^-12)
 *     rcpps(1.9999999) = 0x3f000800 = 0.50012207   (+2^-12)
 *     rcpps(4/3)       = 0x3f400000 = 0.75         (exact)
 *
 * Every recovered seed has its low 11 mantissa bits ZERO, i.e. 12 significant bits, with the sign
 * of the residual varying per input the way a lookup table does.
 *
 * This port models the seed as the IEEE quotient — the value the hardware is approximating, and
 * the same choice the landed `HgcBilateralFilterInterp_Divide.ts` made for `rcpps`. Two reasons it
 * is the right model rather than a shortcut: (1) the kernel applies a full Newton–Raphson step
 * `2r − a·r²` @0x279500..0x27950c, which squares the seed's relative error (2^-12 -> 2^-24), so
 * both seeds converge to the same correctly-rounded f32 reciprocal to within one ulp; (2) baking
 * in a table recovered from THIS box's translator would model Rosetta, not Final Cut Pro, and
 * would be wrong on any other machine.
 *
 * The consequence is measured rather than assumed. The oracle runs three differentials against
 * the live kernel (150 random tiles each):
 *   PASS 1  State AND/OR masks @+0x1e0/+0x80 pinned so the refined reciprocal is exactly 1.0,
 *           which removes this instruction from the comparison: 7,876 touched lanes,
 *           **0 divergences** — every other instruction in the kernel is bit-exact.
 *   PASS 2  live seed, including adversarial random polynomial coefficients: most lanes exact,
 *           the rest mostly 1-2 ulp, and a long tail where the log2/exp2 chain amplifies 2^-12.
 *   PASS 3  live seed, realistic State: 7,080 touched lanes, **worst case 4 ulp**.
 */
function rcpps(x: number): number {
  return Math.fround(1 / x);
}

/**
 * HGTile — the tile descriptor Helium hands every RenderTile/`…Tile_AVX` kernel. Only the fields
 * this kernel touches are modelled; each cites the byte offset it is read from in THIS function.
 *
 * Pointers are modelled as Float32Array views over the plane, and the row strides stay in TEXELS
 * (the machine sign-extends the int32 with `movslq` and then `shlq $0x4`, i.e. 16 bytes = 4
 * float32 = one RGBA texel per stride unit).
 */
export interface HGTile {
  /** +0x00 — x0 (int32). Read @0x279486 as the subtrahend of the width. */
  x0: number;
  /** +0x04 — y0 (int32). Read @0x279473 as the subtrahend of the height. */
  y0: number;
  /** +0x08 — x1 (int32). Read @0x279483. */
  x1: number;
  /** +0x0c — y1 (int32). Read @0x279470. */
  y1: number;
  /** +0x10 — destination plane (RGBA f32, row-major). Read @0x27948c. */
  outPtr: Float32Array;
  /** +0x18 — destination row stride in TEXELS (int32, sign-extended @0x279488). */
  outRowStride: number;
  /** +0x50 — source plane (RGBA f32, row-major). Read @0x279490. */
  inPtr: Float32Array;
  /** +0x58 — source row stride in TEXELS (int32, sign-extended @0x279494). */
  inRowStride: number;
}

// ── HGToneCurve::State offsets this kernel reads ────────────────────────────────────────────
// Everything below is READ from the State block through %rsi; none of it is a literal in the
// code stream. Scalars are `vbroadcastss` (one f32 splatted to every lane); vectors are 32-byte
// (`ymm`) or 16-byte (`xmm`) loads whose lanes are read individually — so this port indexes each
// lane rather than assuming the block is lane-uniform.
/** +0x00 (scalar, `vbroadcastss (%rsi)`) — the gamma exponent: multiplies log2(x) @0x279624. */
const S_GAMMA = 0x00;
/** +0x04 (scalar) — pre-gamma offset added to the clamped texel @0x279547. */
const S_PRE_OFFSET = 0x04;
/** +0x0c (scalar) — post-gamma output scale @0x2796a8. */
const S_POST_SCALE = 0x0c;
/** +0x20 (scalar) — slope of the linear segment @0x2796b2. */
const S_LINEAR_SLOPE = 0x20;
/** +0x24 (scalar) — threshold subtracted before the linear-segment test @0x2796bc. */
const S_LINEAR_THRESHOLD = 0x24;
/** +0x80 (vector) — bit pattern OR'd into the refined reciprocal @0x279518. */
const V_RCP_OR = 0x80;
/** +0xa0 (vector) — the upper clamp / "one" the kernel compares and blends against @0x279530. */
const V_ONE = 0xa0;
/** +0x1e0 (vector) — bit mask AND'd into the refined reciprocal @0x279510. */
const V_RCP_AND = 0x1e0;
/** +0x200 (vector) — floor applied to alpha before the reciprocal @0x2794ec. */
const V_ALPHA_FLOOR = 0x200;
/** +0x220 (vector) — correction factor multiplied into the rcpps seed @0x2794f8. */
const V_RCP_FIXUP = 0x220;
/** +0x240 (vector) — mantissa mask for the log2 decomposition @0x27955f. */
const V_MANTISSA_MASK = 0x240;
/** +0x260 (vector) — denormal/low cutoff compared against @0x279567. */
const V_LOG_CUTOFF = 0x260;
/** +0x280 (vector) — exponent correction added below the cutoff @0x279570. */
const V_LOG_CUTOFF_ADJ = 0x280;
/** +0x2a0 (vector) — exponent bias subtracted @0x279596. */
const V_EXP_BIAS = 0x2a0;
/** +0x2c0 (vector) — mantissa split point (the "> sqrt2" test) @0x2795a2. */
const V_MANTISSA_SPLIT = 0x2c0;
/** +0x2e0 (vector) — factor applied to the split correction @0x2795b7. */
const V_SPLIT_SCALE = 0x2e0;
/** +0x380 (vector) — floor applied to gamma*log2(x) before exp2 @0x279628. */
const V_EXP_FLOOR = 0x380;
/** +0x400 (xmm, integer) — exponent bias added to the exp2 integer part @0x27967e. */
const V_EXP2_BIAS_I = 0x400;
/** +0x460..+0x520 (vectors) — log2 mantissa polynomial coefficients @0x2795cb..0x279614. */
const V_LOG_C0 = 0x460;
const V_LOG_C1 = 0x480;
const V_LOG_C2 = 0x4a0;
const V_LOG_C3 = 0x4c0;
const V_LOG_C4 = 0x4e0;
const V_LOG_C5 = 0x500;
const V_LOG_C6 = 0x520;
/** +0x540..+0x5c0 (vectors) — exp2 fractional polynomial coefficients @0x27963e..0x27966a. */
const V_EXP_C0 = 0x540;
const V_EXP_C1 = 0x560;
const V_EXP_C2 = 0x580;
const V_EXP_C3 = 0x5a0;
const V_EXP_C4 = 0x5c0;
/** +0x940 (vector) — the "zero"/lower clamp the kernel maxes against @0x279524. */
const V_ZERO = 0x940;

/**
 * Gettype3_nice_satTile_AVX(HGTile* tile, HGToneCurve::State* state, HGNode* node) @Helium 0x279470
 *
 * `node` (%rdx) is never read by this function — it is part of the uniform kernel signature.
 *
 * @param tile   the tile descriptor (%rdi)
 * @param state  a byte view of the 32-byte-aligned HGToneCurve::State block (%rsi); every
 *               constant is read out of it at the documented offsets, little-endian
 * @param _node  %rdx — unused by this kernel
 */
export function Gettype3_nice_satTile_AVX(
  tile: HGTile,
  state: DataView,
  _node?: unknown,
): void {
  // @0x279470/0x279473: eax = tile[+0x0c] - tile[+0x04]
  const height = (tile.y1 - tile.y0) | 0;
  // @0x279476: jle 0x279900 — nothing to do (the function returns before it builds a frame)
  if (height <= 0) return;

  // @0x279483/0x279486: ecx = tile[+0x08] - tile[+0x00]
  const width = (tile.x1 - tile.x0) | 0;
  // @0x279488/0x279498: rdx = (int32)tile[+0x18] << 4  (bytes) == 4 float32 == 1 texel per unit
  const outRowStride = (tile.outRowStride | 0) * 4;
  // @0x279494/0x27949c: rdi = (int32)tile[+0x58] << 4
  const inRowStride = (tile.inRowStride | 0) * 4;
  // @0x27948c: r8 = tile[+0x10];  @0x279490: r9 = tile[+0x50]
  const outArr = tile.outPtr;
  const inArr = tile.inPtr;
  let outBase = 0; // r8, advanced by rdx per row @0x2794b3
  let inBase = 0; // r9, advanced by rdi per row @0x2794b0

  // Register file for the 8-wide body (and its low half for the 4-wide tail). Hoisted out of the
  // loops so the transcription reads like the machine's registers rather than allocating.
  const ymm0 = new Float32Array(8);
  const ymm1 = new Float32Array(8);
  const ymm2 = new Float32Array(8);
  const ymm3 = new Float32Array(8);
  const ymm4 = new Float32Array(8);
  const ymm5 = new Float32Array(8);
  const ymm6 = new Float32Array(8);
  const ymm7 = new Float32Array(8);
  const ymm8 = new Float32Array(8);
  const ymm9 = new Float32Array(8);
  const ymm10 = new Float32Array(8);
  // Integer views used by the exponent shuffling (vpsrld/vpaddd/vpslld operate on i32 lanes).
  const i5 = new Int32Array(8);
  const i6 = new Int32Array(4);
  const i7 = new Int32Array(4);
  // Comparison results are bit masks, not floats (vcmpps writes all-ones / all-zero).
  const m6 = new Uint32Array(8);
  const m7 = new Uint32Array(8);
  const m1 = new Uint32Array(8);

  /** Read State lane `l` of the 32-byte vector at `off` (little-endian f32). */
  const kv = (off: number, l: number): number => state.getFloat32(off + 4 * l, true);
  /** Read the State scalar at `off` — the `vbroadcastss` source. */
  const ks = (off: number): number => state.getFloat32(off, true);

  // @0x2794b6..0x2794bc — `incl %r10d ; cmpl %eax,%r10d ; je 0x2798fc`: exactly `height` rows.
  for (let row = 0; row < height; row++) {
    // @0x2794c2: movl $0x0, %r11d
    let r11 = 0;

    // @0x2794c8/0x2794cb: `cmpl $0x2,%ecx ; jl 0x27970a` — fewer than 2 texels: tail only.
    if (width >= 2) {
      // @0x2794d1: ebx = 0x10; the loads are at -0x10(%r9,%rbx), i.e. byte offset 32*k.
      let k = 0;
      for (;;) {
        const p = inBase + 8 * k; // -0x10(%r9,%rbx) in float32 units
        const q = outBase + 8 * k; // -0x10(%r8,%rbx)

        // @0x2794e0: vmovups -0x10(%r9,%rbx), %ymm0 — two RGBA texels
        for (let l = 0; l < 8; l++) ymm0[l] = inArr[p + l];

        // @0x2794e7: vshufps $0xff,%ymm0,%ymm0,%ymm1 => ymm0[3,3,3,3,7,7,7,7] (alpha per half)
        for (let l = 0; l < 4; l++) ymm1[l] = ymm0[3];
        for (let l = 4; l < 8; l++) ymm1[l] = ymm0[7];

        // @0x2794ec: vmaxps 0x200(%rsi),%ymm1,%ymm2
        for (let l = 0; l < 8; l++) ymm2[l] = maxps(ymm1[l], kv(V_ALPHA_FLOOR, l));
        // @0x2794f4: vrcpps %ymm2,%ymm2
        for (let l = 0; l < 8; l++) ymm2[l] = rcpps(ymm2[l]);
        // @0x2794f8: vmulps 0x220(%rsi),%ymm2,%ymm2
        for (let l = 0; l < 8; l++) ymm2[l] = Math.fround(ymm2[l] * kv(V_RCP_FIXUP, l));
        // @0x279500: vaddps %ymm2,%ymm2,%ymm3
        for (let l = 0; l < 8; l++) ymm3[l] = Math.fround(ymm2[l] + ymm2[l]);
        // @0x279504: vmulps %ymm2,%ymm1,%ymm1   (ymm1 = alpha * r)
        for (let l = 0; l < 8; l++) ymm1[l] = Math.fround(ymm1[l] * ymm2[l]);
        // @0x279508: vmulps %ymm1,%ymm2,%ymm1   (ymm1 = r * (alpha*r))
        for (let l = 0; l < 8; l++) ymm1[l] = Math.fround(ymm2[l] * ymm1[l]);
        // @0x27950c: vsubps %ymm1,%ymm3,%ymm1   (ymm1 = 2r - a*r^2)
        for (let l = 0; l < 8; l++) ymm1[l] = Math.fround(ymm3[l] - ymm1[l]);
        // @0x279510: vandps 0x1e0(%rsi),%ymm1,%ymm1
        for (let l = 0; l < 8; l++) {
          ymm1[l] = floatOf(bitsOf(ymm1[l]) & bitsOf(kv(V_RCP_AND, l)));
        }
        // @0x279518: vorps 0x80(%rsi),%ymm1,%ymm1
        for (let l = 0; l < 8; l++) {
          ymm1[l] = floatOf(bitsOf(ymm1[l]) | bitsOf(kv(V_RCP_OR, l)));
        }
        // @0x279520: vmulps %ymm1,%ymm0,%ymm0 — the unpremultiplied texel pair
        for (let l = 0; l < 8; l++) ymm0[l] = Math.fround(ymm0[l] * ymm1[l]);

        // @0x279524: vmovups 0x940(%rsi),%ymm1
        for (let l = 0; l < 8; l++) ymm1[l] = kv(V_ZERO, l);
        // @0x27952c: vmaxps %ymm1,%ymm0,%ymm3
        for (let l = 0; l < 8; l++) ymm3[l] = maxps(ymm0[l], ymm1[l]);
        // @0x279530: vmovups 0xa0(%rsi),%ymm2
        for (let l = 0; l < 8; l++) ymm2[l] = kv(V_ONE, l);
        // @0x279538: vminps %ymm2,%ymm3,%ymm3
        for (let l = 0; l < 8; l++) ymm3[l] = minps(ymm3[l], ymm2[l]);

        // @0x27953c: vbroadcastss 0x4(%rsi),%ymm5 ; @0x279542: vbroadcastss (%rsi),%ymm4
        const preOffset = ks(S_PRE_OFFSET);
        const gamma = ks(S_GAMMA);
        for (let l = 0; l < 8; l++) ymm5[l] = preOffset;
        for (let l = 0; l < 8; l++) ymm4[l] = gamma;
        // @0x279547: vaddps %ymm5,%ymm3,%ymm5
        for (let l = 0; l < 8; l++) ymm5[l] = Math.fround(ymm3[l] + ymm5[l]);
        // @0x27954b: vcmpeqps %ymm1,%ymm4,%ymm6      (gamma == zero-vector, ordered EQ)
        for (let l = 0; l < 8; l++) m6[l] = ymm4[l] === ymm1[l] ? MASK_TRUE : MASK_FALSE;
        // @0x279550: vandps %ymm2,%ymm6,%ymm6
        for (let l = 0; l < 8; l++) ymm6[l] = floatOf(m6[l] & bitsOf(ymm2[l]));
        // @0x279554: vcmpltps %ymm6,%ymm1,%ymm6      (zero-vector < that, ORDERED — the 4-wide
        //            tail spells the same test `vcmpnleps`, which is TRUE when unordered)
        for (let l = 0; l < 8; l++) m6[l] = ymm1[l] < ymm6[l] ? MASK_TRUE : MASK_FALSE;
        // @0x279559: vblendvps %ymm6,%ymm2,%ymm5,%ymm5 => mask ? ymm2 : ymm5
        for (let l = 0; l < 8; l++) ymm5[l] = m6[l] >>> 31 ? ymm2[l] : ymm5[l];

        // ── log2(ymm5) ────────────────────────────────────────────────────────────────────
        // @0x27955f: vandps 0x240(%rsi),%ymm5,%ymm6 — mantissa bits
        for (let l = 0; l < 8; l++) {
          ymm6[l] = floatOf(bitsOf(ymm5[l]) & bitsOf(kv(V_MANTISSA_MASK, l)));
        }
        // @0x279567: vcmpltps 0x260(%rsi),%ymm5,%ymm7
        for (let l = 0; l < 8; l++) {
          m7[l] = ymm5[l] < kv(V_LOG_CUTOFF, l) ? MASK_TRUE : MASK_FALSE;
        }
        // @0x279570: vandps 0x280(%rsi),%ymm7,%ymm7
        for (let l = 0; l < 8; l++) ymm7[l] = floatOf(m7[l] & bitsOf(kv(V_LOG_CUTOFF_ADJ, l)));
        // @0x279578..0x279588: vpsrld $0x17 on each 128-bit half, recombined
        for (let l = 0; l < 8; l++) i5[l] = bitsOf(ymm5[l]) >>> 23;
        // @0x27958e: vcvtdq2ps %ymm5,%ymm5
        for (let l = 0; l < 8; l++) ymm5[l] = Math.fround(i5[l] | 0);
        // @0x279592: vsubps %ymm7,%ymm5,%ymm5
        for (let l = 0; l < 8; l++) ymm5[l] = Math.fround(ymm5[l] - ymm7[l]);
        // @0x279596: vsubps 0x2a0(%rsi),%ymm5,%ymm5
        for (let l = 0; l < 8; l++) ymm5[l] = Math.fround(ymm5[l] - kv(V_EXP_BIAS, l));
        // @0x27959e: vorps %ymm2,%ymm6,%ymm6 — mantissa | one
        for (let l = 0; l < 8; l++) ymm6[l] = floatOf(bitsOf(ymm6[l]) | bitsOf(ymm2[l]));
        // @0x2795a2/0x2795aa: ymm7 = 0x2c0(%rsi) ; vcmpltps %ymm6,%ymm7,%ymm7  (split < mantissa)
        for (let l = 0; l < 8; l++) ymm7[l] = kv(V_MANTISSA_SPLIT, l);
        for (let l = 0; l < 8; l++) m7[l] = ymm7[l] < ymm6[l] ? MASK_TRUE : MASK_FALSE;
        // @0x2795af: vandps %ymm2,%ymm7,%ymm7
        for (let l = 0; l < 8; l++) ymm7[l] = floatOf(m7[l] & bitsOf(ymm2[l]));
        // @0x2795b3: vaddps %ymm5,%ymm7,%ymm5
        for (let l = 0; l < 8; l++) ymm5[l] = Math.fround(ymm7[l] + ymm5[l]);
        // @0x2795b7: vmulps 0x2e0(%rsi),%ymm7,%ymm7
        for (let l = 0; l < 8; l++) ymm7[l] = Math.fround(ymm7[l] * kv(V_SPLIT_SCALE, l));
        // @0x2795bf: vmulps %ymm6,%ymm7,%ymm7
        for (let l = 0; l < 8; l++) ymm7[l] = Math.fround(ymm7[l] * ymm6[l]);
        // @0x2795c3: vsubps %ymm2,%ymm6,%ymm6
        for (let l = 0; l < 8; l++) ymm6[l] = Math.fround(ymm6[l] - ymm2[l]);
        // @0x2795c7: vsubps %ymm7,%ymm6,%ymm6
        for (let l = 0; l < 8; l++) ymm6[l] = Math.fround(ymm6[l] - ymm7[l]);

        // polynomial @0x2795cb..0x27961c
        for (let l = 0; l < 8; l++) ymm7[l] = Math.fround(ymm6[l] * kv(V_LOG_C0, l));
        for (let l = 0; l < 8; l++) ymm7[l] = Math.fround(ymm7[l] + kv(V_LOG_C1, l));
        for (let l = 0; l < 8; l++) ymm8[l] = Math.fround(ymm6[l] * kv(V_LOG_C2, l));
        for (let l = 0; l < 8; l++) ymm8[l] = Math.fround(ymm8[l] + kv(V_LOG_C3, l));
        for (let l = 0; l < 8; l++) ymm9[l] = Math.fround(ymm6[l] * kv(V_LOG_C4, l));
        for (let l = 0; l < 8; l++) ymm10[l] = Math.fround(ymm6[l] * ymm6[l]);
        for (let l = 0; l < 8; l++) ymm9[l] = Math.fround(ymm9[l] + kv(V_LOG_C5, l));
        for (let l = 0; l < 8; l++) ymm8[l] = Math.fround(ymm10[l] * ymm8[l]);
        for (let l = 0; l < 8; l++) ymm7[l] = Math.fround(ymm8[l] + ymm7[l]);
        for (let l = 0; l < 8; l++) ymm7[l] = Math.fround(ymm10[l] * ymm7[l]);
        for (let l = 0; l < 8; l++) ymm7[l] = Math.fround(ymm9[l] + ymm7[l]);
        for (let l = 0; l < 8; l++) ymm7[l] = Math.fround(ymm6[l] * ymm7[l]);
        for (let l = 0; l < 8; l++) ymm7[l] = Math.fround(ymm7[l] + kv(V_LOG_C6, l));
        for (let l = 0; l < 8; l++) ymm6[l] = Math.fround(ymm6[l] * ymm7[l]);
        // @0x279620: vaddps %ymm6,%ymm5,%ymm5 — log2(x) = exponent + poly(mantissa)
        for (let l = 0; l < 8; l++) ymm5[l] = Math.fround(ymm5[l] + ymm6[l]);
        // @0x279624: vmulps %ymm5,%ymm4,%ymm4 — gamma * log2(x)
        for (let l = 0; l < 8; l++) ymm4[l] = Math.fround(ymm4[l] * ymm5[l]);
        // @0x279628: vmaxps 0x380(%rsi),%ymm4,%ymm4
        for (let l = 0; l < 8; l++) ymm4[l] = maxps(ymm4[l], kv(V_EXP_FLOOR, l));

        // ── exp2(ymm4) ────────────────────────────────────────────────────────────────────
        // @0x279630: vroundps $0x9,%ymm4,%ymm5 — round toward -inf (floor)
        for (let l = 0; l < 8; l++) ymm5[l] = Math.fround(Math.floor(ymm4[l]));
        // @0x279636: vsubps %ymm5,%ymm4,%ymm4 — fractional part
        for (let l = 0; l < 8; l++) ymm4[l] = Math.fround(ymm4[l] - ymm5[l]);
        // @0x27963a..0x279672
        for (let l = 0; l < 8; l++) ymm6[l] = Math.fround(ymm4[l] * ymm4[l]);
        for (let l = 0; l < 8; l++) ymm7[l] = Math.fround(ymm4[l] * kv(V_EXP_C0, l));
        for (let l = 0; l < 8; l++) ymm7[l] = Math.fround(ymm7[l] + kv(V_EXP_C1, l));
        for (let l = 0; l < 8; l++) ymm8[l] = Math.fround(ymm4[l] * kv(V_EXP_C2, l));
        for (let l = 0; l < 8; l++) ymm6[l] = Math.fround(ymm6[l] * ymm7[l]);
        for (let l = 0; l < 8; l++) ymm7[l] = Math.fround(ymm8[l] + kv(V_EXP_C3, l));
        for (let l = 0; l < 8; l++) ymm6[l] = Math.fround(ymm6[l] + ymm7[l]);
        for (let l = 0; l < 8; l++) ymm6[l] = Math.fround(ymm4[l] * ymm6[l]);
        for (let l = 0; l < 8; l++) ymm6[l] = Math.fround(ymm6[l] + kv(V_EXP_C4, l));
        for (let l = 0; l < 8; l++) ymm4[l] = Math.fround(ymm4[l] * ymm6[l]);
        // @0x279676: vaddps %ymm4,%ymm2,%ymm4
        for (let l = 0; l < 8; l++) ymm4[l] = Math.fround(ymm2[l] + ymm4[l]);
        // @0x27967a: vcvttps2dq %ymm5,%ymm5 — the integer part
        for (let l = 0; l < 8; l++) i5[l] = Math.trunc(ymm5[l]) | 0;
        // @0x27967e: vmovdqa 0x400(%rsi),%xmm6 — ONE 4-lane bias vector, added to BOTH halves
        for (let l = 0; l < 4; l++) i6[l] = state.getInt32(V_EXP2_BIAS_I + 4 * l, true);
        // @0x279686: vpaddd %xmm5,%xmm6,%xmm7 (low half) ; @0x279690: same for the high half
        for (let l = 0; l < 4; l++) i7[l] = (i6[l] + i5[l]) | 0;
        const i5hi = [i5[4], i5[5], i5[6], i5[7]];
        const i5hiSum = [0, 0, 0, 0];
        for (let l = 0; l < 4; l++) i5hiSum[l] = (i6[l] + i5hi[l]) | 0;
        // @0x279694/0x279699: vpslld $0x17 on both halves ; @0x27969e: recombine
        for (let l = 0; l < 4; l++) ymm5[l] = floatOf(i7[l] << 23);
        for (let l = 0; l < 4; l++) ymm5[4 + l] = floatOf(i5hiSum[l] << 23);
        // @0x2796a4: vmulps %ymm5,%ymm4,%ymm4 — poly * 2^i
        for (let l = 0; l < 8; l++) ymm4[l] = Math.fround(ymm4[l] * ymm5[l]);

        // ── output blend ──────────────────────────────────────────────────────────────────
        // @0x2796a8/0x2796ae: vbroadcastss 0xc(%rsi) ; vmulps %ymm4,%ymm5,%ymm4
        const postScale = ks(S_POST_SCALE);
        for (let l = 0; l < 8; l++) ymm5[l] = postScale;
        for (let l = 0; l < 8; l++) ymm4[l] = Math.fround(ymm5[l] * ymm4[l]);
        // @0x2796b2/0x2796b8: vbroadcastss 0x20(%rsi) ; vmulps %ymm5,%ymm3,%ymm5
        const linearSlope = ks(S_LINEAR_SLOPE);
        for (let l = 0; l < 8; l++) ymm5[l] = linearSlope;
        for (let l = 0; l < 8; l++) ymm5[l] = Math.fround(ymm3[l] * ymm5[l]);
        // @0x2796bc/0x2796c2: vbroadcastss 0x24(%rsi) ; vsubps %ymm6,%ymm3,%ymm3
        const linearThreshold = ks(S_LINEAR_THRESHOLD);
        for (let l = 0; l < 8; l++) ymm6[l] = linearThreshold;
        for (let l = 0; l < 8; l++) ymm3[l] = Math.fround(ymm3[l] - ymm6[l]);
        // @0x2796c6: vcmpltps %ymm1,%ymm3,%ymm1   (ymm3 < zero-vector, ordered)
        for (let l = 0; l < 8; l++) m1[l] = ymm3[l] < ymm1[l] ? MASK_TRUE : MASK_FALSE;
        // @0x2796cb: vblendvps %ymm1,%ymm5,%ymm4,%ymm1 => mask ? linear : gamma
        for (let l = 0; l < 8; l++) ymm1[l] = m1[l] >>> 31 ? ymm5[l] : ymm4[l];
        // @0x2796d1: vminps %ymm2,%ymm1,%ymm1
        for (let l = 0; l < 8; l++) ymm1[l] = minps(ymm1[l], ymm2[l]);
        // @0x2796d5: vshufps $0xff,%ymm0,%ymm0,%ymm2 — the UNPREMULTIPLIED alpha per half
        for (let l = 0; l < 4; l++) ymm2[l] = ymm0[3];
        for (let l = 4; l < 8; l++) ymm2[l] = ymm0[7];
        // @0x2796da: vmulps %ymm2,%ymm1,%ymm1 — re-premultiply
        for (let l = 0; l < 8; l++) ymm1[l] = Math.fround(ymm1[l] * ymm2[l]);
        // @0x2796de: vblendps $0x88,%ymm0,%ymm1,%ymm0 — lanes 3 and 7 come from ymm0
        for (let l = 0; l < 8; l++) ymm0[l] = l === 3 || l === 7 ? ymm0[l] : ymm1[l];
        // @0x2796e4: vmovups %ymm0,-0x10(%r8,%rbx)
        for (let l = 0; l < 8; l++) outArr[q + l] = ymm0[l];

        // @0x2796eb..0x279701 — `addq $0x20,%rbx ; r14d = r11d ; r11d -= 2 ; r14d += ecx ;
        // r14d -= 2 ; cmpl $1,%r14d ; jg` — keep going while at least two more texels remain.
        const r11old = r11;
        r11 = (r11 - 2) | 0;
        k++;
        const r14 = (r11old + width - 2) | 0;
        if (!(r14 > 1)) break;
      }
      // @0x279707: negl %r11d — r11 becomes the count of texels already processed
      r11 = -r11 | 0;
    }

    // @0x27970a/0x27970d: `cmpl %ecx,%r11d ; jge 0x2794b0` — signed; the odd trailing texel
    // (or the whole row when width < 2) goes through the 4-wide body.
    if (r11 < width) {
      // @0x279713/0x279716: movl %r11d,%r11d ; shlq $0x4,%r11 — zero-extend, 16 bytes per texel
      const p = inBase + 4 * (r11 >>> 0);
      const q = outBase + 4 * (r11 >>> 0);

      // @0x27971a: vbroadcastss 0xc(%r9,%r11),%xmm0 — alpha of this texel, splatted
      const alpha = inArr[p + 3];
      for (let l = 0; l < 4; l++) ymm0[l] = alpha;
      // @0x279721: vmaxps 0x200(%rsi),%xmm0,%xmm1
      for (let l = 0; l < 4; l++) ymm1[l] = maxps(ymm0[l], kv(V_ALPHA_FLOOR, l));
      // @0x279729: vrcpps %xmm1,%xmm1
      for (let l = 0; l < 4; l++) ymm1[l] = rcpps(ymm1[l]);
      // @0x27972d: vmulps 0x220(%rsi),%xmm1,%xmm1
      for (let l = 0; l < 4; l++) ymm1[l] = Math.fround(ymm1[l] * kv(V_RCP_FIXUP, l));
      // @0x279735: vaddps %xmm1,%xmm1,%xmm2
      for (let l = 0; l < 4; l++) ymm2[l] = Math.fround(ymm1[l] + ymm1[l]);
      // @0x279739: vmulps %xmm1,%xmm0,%xmm0
      for (let l = 0; l < 4; l++) ymm0[l] = Math.fround(ymm0[l] * ymm1[l]);
      // @0x27973d: vmulps %xmm0,%xmm1,%xmm0
      for (let l = 0; l < 4; l++) ymm0[l] = Math.fround(ymm1[l] * ymm0[l]);
      // @0x279741: vsubps %xmm0,%xmm2,%xmm0
      for (let l = 0; l < 4; l++) ymm0[l] = Math.fround(ymm2[l] - ymm0[l]);
      // @0x279745: vandps 0x1e0(%rsi),%xmm0,%xmm0
      for (let l = 0; l < 4; l++) ymm0[l] = floatOf(bitsOf(ymm0[l]) & bitsOf(kv(V_RCP_AND, l)));
      // @0x27974d: vorps 0x80(%rsi),%xmm0,%xmm0
      for (let l = 0; l < 4; l++) ymm0[l] = floatOf(bitsOf(ymm0[l]) | bitsOf(kv(V_RCP_OR, l)));
      // @0x279755: vmulps (%r9,%r11),%xmm0,%xmm0 — the unpremultiplied texel
      for (let l = 0; l < 4; l++) ymm0[l] = Math.fround(inArr[p + l] * ymm0[l]);

      // @0x27975b: vmovaps 0x940(%rsi),%xmm1
      for (let l = 0; l < 4; l++) ymm1[l] = kv(V_ZERO, l);
      // @0x279763: vmaxps %xmm1,%xmm0,%xmm3
      for (let l = 0; l < 4; l++) ymm3[l] = maxps(ymm0[l], ymm1[l]);
      // @0x279767: vmovaps 0xa0(%rsi),%xmm2
      for (let l = 0; l < 4; l++) ymm2[l] = kv(V_ONE, l);
      // @0x27976f: vminps %xmm2,%xmm3,%xmm3
      for (let l = 0; l < 4; l++) ymm3[l] = minps(ymm3[l], ymm2[l]);
      // @0x279773: vbroadcastss 0x4(%rsi),%xmm4  (NOTE: the 4-wide body broadcasts the pre-offset
      //            into xmm4 and only afterwards overwrites xmm4 with the gamma @0x27977d)
      const preOffset = ks(S_PRE_OFFSET);
      for (let l = 0; l < 4; l++) ymm4[l] = preOffset;
      // @0x279779: vaddps %xmm4,%xmm3,%xmm5
      for (let l = 0; l < 4; l++) ymm5[l] = Math.fround(ymm3[l] + ymm4[l]);
      // @0x27977d: vbroadcastss (%rsi),%xmm4
      const gamma = ks(S_GAMMA);
      for (let l = 0; l < 4; l++) ymm4[l] = gamma;
      // @0x279782: vcmpeqps %xmm1,%xmm4,%xmm6
      for (let l = 0; l < 4; l++) m6[l] = ymm4[l] === ymm1[l] ? MASK_TRUE : MASK_FALSE;
      // @0x279787: vandps %xmm2,%xmm6,%xmm6
      for (let l = 0; l < 4; l++) ymm6[l] = floatOf(m6[l] & bitsOf(ymm2[l]));
      // @0x27978b: vcmpnleps %xmm1,%xmm6,%xmm6 — NOT(xmm6 <= xmm1), i.e. TRUE when UNORDERED.
      //            The 8-wide body spells this `vcmpltps %ymm6,%ymm1,%ymm6` (ordered), so the two
      //            paths genuinely differ on NaN; each is transcribed as written.
      for (let l = 0; l < 4; l++) m6[l] = !(ymm6[l] <= ymm1[l]) ? MASK_TRUE : MASK_FALSE;
      // @0x279790: vblendvps %xmm6,%xmm2,%xmm5,%xmm5
      for (let l = 0; l < 4; l++) ymm5[l] = m6[l] >>> 31 ? ymm2[l] : ymm5[l];

      // ── log2 (4-wide) ───────────────────────────────────────────────────────────────────
      // @0x279796: vandps 0x240(%rsi),%xmm5,%xmm6
      for (let l = 0; l < 4; l++) {
        ymm6[l] = floatOf(bitsOf(ymm5[l]) & bitsOf(kv(V_MANTISSA_MASK, l)));
      }
      // @0x27979e: vcmpltps 0x260(%rsi),%xmm5,%xmm7
      for (let l = 0; l < 4; l++) m7[l] = ymm5[l] < kv(V_LOG_CUTOFF, l) ? MASK_TRUE : MASK_FALSE;
      // @0x2797a7: vandps 0x280(%rsi),%xmm7,%xmm7
      for (let l = 0; l < 4; l++) ymm7[l] = floatOf(m7[l] & bitsOf(kv(V_LOG_CUTOFF_ADJ, l)));
      // @0x2797af: vpsrld $0x17,%xmm5,%xmm5 ; @0x2797b4: vcvtdq2ps
      for (let l = 0; l < 4; l++) i5[l] = bitsOf(ymm5[l]) >>> 23;
      for (let l = 0; l < 4; l++) ymm5[l] = Math.fround(i5[l] | 0);
      // @0x2797b8: vsubps %xmm7,%xmm5,%xmm5
      for (let l = 0; l < 4; l++) ymm5[l] = Math.fround(ymm5[l] - ymm7[l]);
      // @0x2797bc: vsubps 0x2a0(%rsi),%xmm5,%xmm5
      for (let l = 0; l < 4; l++) ymm5[l] = Math.fround(ymm5[l] - kv(V_EXP_BIAS, l));
      // @0x2797c4: vorps %xmm2,%xmm6,%xmm6
      for (let l = 0; l < 4; l++) ymm6[l] = floatOf(bitsOf(ymm6[l]) | bitsOf(ymm2[l]));
      // @0x2797c8/0x2797d0: xmm7 = 0x2c0(%rsi) ; vcmpltps %xmm6,%xmm7,%xmm7
      for (let l = 0; l < 4; l++) ymm7[l] = kv(V_MANTISSA_SPLIT, l);
      for (let l = 0; l < 4; l++) m7[l] = ymm7[l] < ymm6[l] ? MASK_TRUE : MASK_FALSE;
      // @0x2797d5: vandps %xmm2,%xmm7,%xmm7
      for (let l = 0; l < 4; l++) ymm7[l] = floatOf(m7[l] & bitsOf(ymm2[l]));
      // @0x2797d9: vaddps %xmm7,%xmm5,%xmm5
      for (let l = 0; l < 4; l++) ymm5[l] = Math.fround(ymm5[l] + ymm7[l]);
      // @0x2797dd: vmulps 0x2e0(%rsi),%xmm7,%xmm7
      for (let l = 0; l < 4; l++) ymm7[l] = Math.fround(ymm7[l] * kv(V_SPLIT_SCALE, l));
      // @0x2797e5: vmulps %xmm6,%xmm7,%xmm7
      for (let l = 0; l < 4; l++) ymm7[l] = Math.fround(ymm7[l] * ymm6[l]);
      // @0x2797e9: vsubps %xmm2,%xmm6,%xmm6
      for (let l = 0; l < 4; l++) ymm6[l] = Math.fround(ymm6[l] - ymm2[l]);
      // @0x2797ed: vsubps %xmm7,%xmm6,%xmm6
      for (let l = 0; l < 4; l++) ymm6[l] = Math.fround(ymm6[l] - ymm7[l]);
      // @0x2797f1..0x279842 — same polynomial as the 8-wide body
      for (let l = 0; l < 4; l++) ymm7[l] = Math.fround(ymm6[l] * kv(V_LOG_C0, l));
      for (let l = 0; l < 4; l++) ymm7[l] = Math.fround(ymm7[l] + kv(V_LOG_C1, l));
      for (let l = 0; l < 4; l++) ymm8[l] = Math.fround(ymm6[l] * kv(V_LOG_C2, l));
      for (let l = 0; l < 4; l++) ymm8[l] = Math.fround(ymm8[l] + kv(V_LOG_C3, l));
      for (let l = 0; l < 4; l++) ymm9[l] = Math.fround(ymm6[l] * kv(V_LOG_C4, l));
      for (let l = 0; l < 4; l++) ymm10[l] = Math.fround(ymm6[l] * ymm6[l]);
      for (let l = 0; l < 4; l++) ymm9[l] = Math.fround(ymm9[l] + kv(V_LOG_C5, l));
      for (let l = 0; l < 4; l++) ymm8[l] = Math.fround(ymm10[l] * ymm8[l]);
      for (let l = 0; l < 4; l++) ymm7[l] = Math.fround(ymm8[l] + ymm7[l]);
      for (let l = 0; l < 4; l++) ymm7[l] = Math.fround(ymm10[l] * ymm7[l]);
      for (let l = 0; l < 4; l++) ymm7[l] = Math.fround(ymm9[l] + ymm7[l]);
      for (let l = 0; l < 4; l++) ymm7[l] = Math.fround(ymm6[l] * ymm7[l]);
      for (let l = 0; l < 4; l++) ymm7[l] = Math.fround(ymm7[l] + kv(V_LOG_C6, l));
      for (let l = 0; l < 4; l++) ymm6[l] = Math.fround(ymm6[l] * ymm7[l]);
      // @0x279846: vaddps %xmm6,%xmm5,%xmm5
      for (let l = 0; l < 4; l++) ymm5[l] = Math.fround(ymm5[l] + ymm6[l]);
      // @0x27984a: vmulps %xmm5,%xmm4,%xmm4
      for (let l = 0; l < 4; l++) ymm4[l] = Math.fround(ymm4[l] * ymm5[l]);
      // @0x27984e: vmaxps 0x380(%rsi),%xmm4,%xmm4
      for (let l = 0; l < 4; l++) ymm4[l] = maxps(ymm4[l], kv(V_EXP_FLOOR, l));

      // ── exp2 (4-wide) ───────────────────────────────────────────────────────────────────
      // @0x279856: vroundps $0x9,%xmm4,%xmm5
      for (let l = 0; l < 4; l++) ymm5[l] = Math.fround(Math.floor(ymm4[l]));
      // @0x27985c: vsubps %xmm5,%xmm4,%xmm4
      for (let l = 0; l < 4; l++) ymm4[l] = Math.fround(ymm4[l] - ymm5[l]);
      for (let l = 0; l < 4; l++) ymm6[l] = Math.fround(ymm4[l] * ymm4[l]);
      for (let l = 0; l < 4; l++) ymm7[l] = Math.fround(ymm4[l] * kv(V_EXP_C0, l));
      for (let l = 0; l < 4; l++) ymm7[l] = Math.fround(ymm7[l] + kv(V_EXP_C1, l));
      for (let l = 0; l < 4; l++) ymm8[l] = Math.fround(ymm4[l] * kv(V_EXP_C2, l));
      for (let l = 0; l < 4; l++) ymm6[l] = Math.fround(ymm6[l] * ymm7[l]);
      for (let l = 0; l < 4; l++) ymm7[l] = Math.fround(ymm8[l] + kv(V_EXP_C3, l));
      for (let l = 0; l < 4; l++) ymm6[l] = Math.fround(ymm6[l] + ymm7[l]);
      for (let l = 0; l < 4; l++) ymm6[l] = Math.fround(ymm4[l] * ymm6[l]);
      for (let l = 0; l < 4; l++) ymm6[l] = Math.fround(ymm6[l] + kv(V_EXP_C4, l));
      for (let l = 0; l < 4; l++) ymm4[l] = Math.fround(ymm4[l] * ymm6[l]);
      // @0x27989c: vaddps %xmm4,%xmm2,%xmm4
      for (let l = 0; l < 4; l++) ymm4[l] = Math.fround(ymm2[l] + ymm4[l]);
      // @0x2798a0: vcvttps2dq %xmm5,%xmm5
      for (let l = 0; l < 4; l++) i5[l] = Math.trunc(ymm5[l]) | 0;
      // @0x2798a4: vpaddd 0x400(%rsi),%xmm5,%xmm5 ; @0x2798ac: vpslld $0x17,%xmm5,%xmm5
      for (let l = 0; l < 4; l++) {
        i5[l] = (i5[l] + state.getInt32(V_EXP2_BIAS_I + 4 * l, true)) | 0;
      }
      for (let l = 0; l < 4; l++) ymm5[l] = floatOf(i5[l] << 23);
      // @0x2798b1: vmulps %xmm5,%xmm4,%xmm4
      for (let l = 0; l < 4; l++) ymm4[l] = Math.fround(ymm4[l] * ymm5[l]);
      // @0x2798b5/0x2798bb: vbroadcastss 0xc(%rsi),%xmm5 ; vmulps %xmm4,%xmm5,%xmm4
      const postScale = ks(S_POST_SCALE);
      for (let l = 0; l < 4; l++) ymm5[l] = postScale;
      for (let l = 0; l < 4; l++) ymm4[l] = Math.fround(ymm5[l] * ymm4[l]);
      // @0x2798bf/0x2798c5: vbroadcastss 0x20(%rsi),%xmm5 ; vmulps %xmm5,%xmm3,%xmm5
      const linearSlope = ks(S_LINEAR_SLOPE);
      for (let l = 0; l < 4; l++) ymm5[l] = linearSlope;
      for (let l = 0; l < 4; l++) ymm5[l] = Math.fround(ymm3[l] * ymm5[l]);
      // @0x2798c9/0x2798cf: vbroadcastss 0x24(%rsi),%xmm6 ; vsubps %xmm6,%xmm3,%xmm3
      const linearThreshold = ks(S_LINEAR_THRESHOLD);
      for (let l = 0; l < 4; l++) ymm6[l] = linearThreshold;
      for (let l = 0; l < 4; l++) ymm3[l] = Math.fround(ymm3[l] - ymm6[l]);
      // @0x2798d3: vcmpltps %xmm1,%xmm3,%xmm1
      for (let l = 0; l < 4; l++) m1[l] = ymm3[l] < ymm1[l] ? MASK_TRUE : MASK_FALSE;
      // @0x2798d8: vblendvps %xmm1,%xmm5,%xmm4,%xmm1
      for (let l = 0; l < 4; l++) ymm1[l] = m1[l] >>> 31 ? ymm5[l] : ymm4[l];
      // @0x2798de: vminps %xmm2,%xmm1,%xmm1
      for (let l = 0; l < 4; l++) ymm1[l] = minps(ymm1[l], ymm2[l]);
      // @0x2798e2: vshufps $0xff,%xmm0,%xmm0,%xmm2 — unpremultiplied alpha
      for (let l = 0; l < 4; l++) ymm2[l] = ymm0[3];
      // @0x2798e7: vmulps %xmm1,%xmm2,%xmm1
      for (let l = 0; l < 4; l++) ymm1[l] = Math.fround(ymm2[l] * ymm1[l]);
      // @0x2798eb: vblendps $0x8,%xmm0,%xmm1,%xmm0 — lane 3 comes from xmm0
      for (let l = 0; l < 4; l++) ymm0[l] = l === 3 ? ymm0[l] : ymm1[l];
      // @0x2798f1: vmovaps %xmm0,(%r8,%r11)
      for (let l = 0; l < 4; l++) outArr[q + l] = ymm0[l];
      // @0x2798f7: jmp 0x2794b0 — exactly ONE trailing texel, then the next row
    }

    // @0x2794b0/0x2794b3: r9 += inRowStride ; r8 += outRowStride
    inBase += inRowStride;
    outBase += outRowStride;
  }
  // @0x2798fc..0x279903: pops, vzeroupper, ret
}
