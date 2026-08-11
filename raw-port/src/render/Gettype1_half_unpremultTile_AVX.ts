// Gettype1_half_unpremultTile_AVX(HGTile*, HGToneCurve::State*, HGNode*)  @Helium 0x2945e0
//
// A file-local (`__ZL…`, nm class `t`) AVX tile kernel from the HGToneCurve translation unit —
// the `type1 / half / unpremult` member of the `Gettype<N>_<quality>[_unpremult]Tile_AVX` family
// HGToneCurve dispatches to once `AcceleratedState` has classified the curve. Per PORTING_SPEC's
// naming rule a free function lives in a file named after it.
//
// Decode evidence (regenerate with
//   bash raw-port/tools/disasm.sh --sym \
//     __ZL31Gettype1_half_unpremultTile_AVXP6HGTilePN11HGToneCurve5StateEP6HGNode Helium
// ): 169 instructions, 0x2945e0..0x29493f, a LEAF — no `call` of any kind, no vtable slot, no
// RIP-relative constant. Every constant it uses is read out of the `HGToneCurve::State` block
// through %rsi, so this port takes the State as a byte view and reads the same offsets rather
// than inventing numbers. Sibling on main for the family idioms and the State layout:
// raw-port/src/render/Gettype3_nice_satTile_AVX.ts.
//
// WHAT IT COMPUTES (per RGBA float32 texel)
//   1. clamp:  t = min(max(texel, K940lane), K940[3])      — lower and upper clamp both come out
//              of the 0x940 vector: lanes 0..2 are the low clamp, lane 3 (+0x94c) the high one
//              (the 4-wide tail spells the same two values `vmovaps 0x940` + `vbroadcastss 0x94c`).
//   2. gamma:  pow(t + S04, S00) evaluated as exp2(S00 · log2(x)) with the classic
//              log2 = exponent + poly(mantissa) (coefficients at State +0x300..+0x360) and
//              exp2 = 2^floor · poly(frac) (coefficients at State +0x3a0..+0x3e0) pair.
//   3. scale by S0C, then select: where `t − S24 < K940` the output is the K940 lane-0 value
//      instead of the gamma result (`vblendvps` @0x2947a9 / @0x294921).
//   4. `vblendps` the ALPHA lane straight through from the untouched input (lanes 3 and 7 of the
//      8-wide body, lane 3 of the 4-wide tail), and store.
//
// DESPITE THE NAME, THERE IS NO RECIPROCAL IN THIS KERNEL. Other members of the family carry a
// `vrcpps` + Newton–Raphson unpremultiply — that is the one instruction the landed
// Gettype3_nice_satTile_AVX port could not make bit-exact, because `vrcpps` is
// implementation-defined. This body has no `vrcpps`, no `vdivps` and no `vsqrtps`: the ONLY
// operations are load/store, max/min, add/sub/mul, and/or, the integer exponent shuffles, round
// and the two converts. Every one of those is exactly specified by IEEE-754 or by integer
// semantics, so this port is bit-exact and its oracle demands 0 divergences rather than an ulp
// budget.
//
// THE 8-WIDE BODY AND THE 4-WIDE TAIL ARE THE SAME COMPUTATION. Unlike the `nice_sat` sibling
// (where @0x279554 uses `vcmpltps` and @0x27978b `vcmpnleps`, which differ on NaN), here both
// bodies use `vcmpltps` at all three compare sites and the same max/min/blend forms. They differ
// only in register allocation, in how the same constants are addressed (`vshufps $0xff` of the
// loaded 0x940 vector @0x294663 versus `vbroadcastss 0x94c` @0x2947fd; `vshufps $0x0` @0x29479f
// versus `vbroadcastss 0x940` @0x294913) and in the order of two INDEPENDENT operations around
// @0x2946da/@0x29485f. They are still transcribed separately, instruction by instruction, so any
// future divergence between them stays visible.
//
// AT&T operand order (PORTING_SPEC's cheat-sheet): `vop src2, src1, dst` is Intel
// `vop dst, src1, src2`, so `vmaxps %ymm1, %ymm0, %ymm2` is ymm2 = MAXPS(src1=ymm0, src2=ymm1),
// and MAXPS returns src2 when the operands are equal or unordered.
//
// ORACLE: raw-port/re/oracle/Gettype1_half_unpremultTile_AVX_oracle.py — 24 real tiles in process
// memory against the live Helium kernel (called at dyld slide + 0x2945e0, since the symbol is
// local), 1,588 f32 lanes compared bit-for-bit, 0 divergences, with every State slot and every
// input lane probed for sensitivity so the pass cannot be a blind one.

/** Scratch used only to reinterpret one f32 as its bit pattern and back — the machine's
 *  `vandps`/`vorps`/`vpslld`/`vpsrld` operate on the bits of the same register file, and JS has
 *  no other way to express that. Not an FCP function; pure plumbing. Mirrors the helper in the
 *  landed sibling Gettype3_nice_satTile_AVX.ts. */
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

/** CMPPS(LT) lane result: all-ones when `a < b` ORDERED, all-zero otherwise (NaN gives false). */
function cmpltps(a: number, b: number): number {
  return a < b ? 0xffffffff : 0x00000000;
}

/**
 * `vcvttps2dq` — convert f32 to i32 with TRUNCATION toward zero. Out-of-range values and NaN
 * produce the "integer indefinite" value 0x80000000 (Intel SDM), which the exponent arithmetic
 * downstream then shifts like any other bit pattern; that path is reachable with an adversarial
 * State, so it is modelled rather than assumed away.
 */
function cvttps2dq(x: number): number {
  if (!(x > -2147483649 && x < 2147483648)) return -2147483648 | 0;
  return Math.trunc(x) | 0;
}

/**
 * HGTile — the tile descriptor Helium hands every `…Tile_AVX` kernel. Only the fields this kernel
 * touches are modelled; each cites the byte offset it is read from in THIS function. Pointers are
 * Float32Array views over the plane; the row strides stay in TEXELS (the machine sign-extends the
 * int32 with `movslq` and then `shlq $0x4`, i.e. 16 bytes = 4 float32 = one RGBA texel per unit).
 */
export interface HGTile {
  /** +0x00 — x0 (int32). Read @0x2945f6 as the subtrahend of the width. */
  x0: number;
  /** +0x04 — y0 (int32). Read @0x2945e3 as the subtrahend of the height. */
  y0: number;
  /** +0x08 — x1 (int32). Read @0x2945f3. */
  x1: number;
  /** +0x0c — y1 (int32). Read @0x2945e0. */
  y1: number;
  /** +0x10 — destination plane (RGBA f32, row-major). Read @0x2945fc. */
  outPtr: Float32Array;
  /** +0x18 — destination row stride in TEXELS (int32, sign-extended @0x2945f8). */
  outRowStride: number;
  /** +0x50 — source plane (RGBA f32, row-major). Read @0x294600. */
  inPtr: Float32Array;
  /** +0x58 — source row stride in TEXELS (int32, sign-extended @0x294604). */
  inRowStride: number;
}

// ── HGToneCurve::State offsets this kernel reads ────────────────────────────────────────────
// Everything below is READ from the State block through %rsi; none of it is a literal in the
// code stream. Scalars are `vbroadcastss` (one f32 splatted to every lane); vectors are 32-byte
// (`ymm`) or 16-byte (`xmm`) loads whose lanes are read individually — so this port indexes each
// lane rather than assuming the block is lane-uniform. Offsets and roles agree with the landed
// sibling Gettype3_nice_satTile_AVX.ts wherever the two kernels read the same slot.
/** +0x00 (scalar, `vbroadcastss (%rsi)`) — the gamma exponent; multiplies log2(x) @0x29471e. */
const S_GAMMA = 0x00;
/** +0x04 (scalar) — pre-gamma offset added to the clamped texel @0x294668. */
const S_PRE_OFFSET = 0x04;
/** +0x0c (scalar) — post-gamma output scale @0x29478b. */
const S_POST_SCALE = 0x0c;
/** +0x24 (scalar) — threshold subtracted before the low-clamp select @0x294795. */
const S_LINEAR_THRESHOLD = 0x24;
/** +0xa0 (vector) — the "one": OR'd into the mantissa @0x29468f and the exp2 constant term. */
const V_ONE = 0xa0;
/** +0x240 (vector) — mantissa mask for the log2 decomposition @0x294676. */
const V_MANTISSA_MASK = 0x240;
/** +0x260 (vector) — denormal/low cutoff compared against @0x294686. */
const V_LOG_CUTOFF = 0x260;
/** +0x280 (vector) — exponent correction subtracted below the cutoff @0x294693. */
const V_LOG_CUTOFF_ADJ = 0x280;
/** +0x2a0 (vector) — exponent bias subtracted @0x2946b9. */
const V_EXP_BIAS = 0x2a0;
/** +0x2c0 (vector) — mantissa split point (the "> sqrt2" test) @0x2946c1. */
const V_MANTISSA_SPLIT = 0x2c0;
/** +0x2e0 (vector) — factor applied to the split correction @0x2946d2. */
const V_SPLIT_SCALE = 0x2e0;
/** +0x300..+0x360 (vectors) — log2 mantissa polynomial coefficients @0x2946ea..@0x29470a. */
const V_LOG_C0 = 0x300;
const V_LOG_C1 = 0x320;
const V_LOG_C2 = 0x340;
const V_LOG_C3 = 0x360;
/** +0x380 (vector) — floor applied to gamma·log2(x) before exp2 @0x294727. */
const V_EXP_FLOOR = 0x380;
/** +0x3a0..+0x3e0 (vectors) — exp2 fractional polynomial coefficients @0x294739..@0x29474d. */
const V_EXP_C0 = 0x3a0;
const V_EXP_C1 = 0x3c0;
const V_EXP_C2 = 0x3e0;
/** +0x400 (xmm, integer) — exponent bias added to the exp2 integer part @0x294761. */
const V_EXP2_BIAS_I = 0x400;
/** +0x940 (vector) — lanes 0..2 the lower clamp, lane 3 (+0x94c) the upper clamp @0x294657. */
const V_CLAMP = 0x940;

/**
 * Gettype1_half_unpremultTile_AVX(HGTile* tile, HGToneCurve::State* state, HGNode* node)
 * @Helium 0x00000000002945e0
 *   `__ZL31Gettype1_half_unpremultTile_AVXP6HGTilePN11HGToneCurve5StateEP6HGNode`
 *
 * `node` (%rdx) is never read by this function — it is part of the uniform kernel signature.
 *
 * @param tile   the tile descriptor (%rdi)
 * @param state  a byte view of the 32-byte-aligned HGToneCurve::State block (%rsi); every
 *               constant is read out of it at the documented offsets, little-endian
 * @param _node  %rdx — unused by this kernel
 */
export function Gettype1_half_unpremultTile_AVX(
  tile: HGTile,
  state: DataView,
  _node?: unknown,
): void {
  // @0x2945e0/@0x2945e3: eax = tile[+0x0c] - tile[+0x04]
  const height = (tile.y1 - tile.y0) | 0;
  // @0x2945e6: jle 0x29493c — nothing to do; the function returns before it builds a frame.
  if (height <= 0) return;

  // @0x2945f3/@0x2945f6: ecx = tile[+0x08] - tile[+0x00]
  const width = (tile.x1 - tile.x0) | 0;
  // @0x2945f8/@0x294608: rdx = (int32)tile[+0x18] << 4 (bytes) == 4 float32 == 1 texel per unit
  const outRowStride = (tile.outRowStride | 0) * 4;
  // @0x294604/@0x29460c: rdi = (int32)tile[+0x58] << 4
  const inRowStride = (tile.inRowStride | 0) * 4;
  // @0x2945fc: r8 = tile[+0x10];  @0x294600: r9 = tile[+0x50]
  const outArr = tile.outPtr;
  const inArr = tile.inPtr;
  let outBase = 0; // r8, advanced by rdx per row @0x294623
  let inBase = 0; // r9, advanced by rdi per row @0x294620

  // Register file for the 8-wide body (its low four lanes double as the xmm tail's registers,
  // exactly as on the machine). Hoisted out of the loops so the transcription reads like the
  // machine's registers rather than allocating.
  const ymm0 = new Float32Array(8);
  const ymm1 = new Float32Array(8);
  const ymm2 = new Float32Array(8);
  const ymm3 = new Float32Array(8);
  const ymm4 = new Float32Array(8);
  const ymm5 = new Float32Array(8);
  const ymm6 = new Float32Array(8);
  const ymm7 = new Float32Array(8);
  const ymm8 = new Float32Array(8);
  // Integer lanes for the exponent shuffling (vpsrld/vpaddd/vpslld operate on i32 lanes).
  const iA = new Int32Array(8);
  // Comparison results are bit masks, not floats (vcmpps writes all-ones / all-zero).
  const m1 = new Uint32Array(8);
  const m6 = new Uint32Array(8);

  /** Read State lane `l` of the vector at `off` (little-endian f32). */
  const kv = (off: number, l: number): number => state.getFloat32(off + 4 * l, true);
  /** Read the State scalar at `off` — the `vbroadcastss` source. */
  const ks = (off: number): number => state.getFloat32(off, true);
  /** Read State lane `l` of the vector at `off` as raw i32 (the `vpaddd` operand). */
  const ki = (off: number, l: number): number => state.getInt32(off + 4 * l, true);

  // @0x294626..@0x29462c — `incl %r10d ; cmpl %eax,%r10d ; je 0x294938`: exactly `height` rows.
  for (let row = 0; row < height; row++) {
    // @0x294632: movl $0x0, %r11d
    let r11 = 0;

    // @0x294638/@0x29463b: `cmpl $0x2,%ecx ; jl 0x2947db` — fewer than 2 texels: tail only.
    if (width >= 2) {
      // @0x294641: ebx = 0x10; the loads are at -0x10(%r9,%rbx), i.e. byte offset 32*k.
      let k = 0;
      for (;;) {
        const p = inBase + 8 * k; // -0x10(%r9,%rbx) in float32 units
        const q = outBase + 8 * k; // -0x10(%r8,%rbx)

        // @0x294650: vmovups -0x10(%r9,%rbx),%ymm0 — two RGBA texels
        for (let l = 0; l < 8; l++) ymm0[l] = inArr[p + l] as number;
        // @0x294657: vmovups 0x940(%rsi),%ymm1 — the clamp vector
        for (let l = 0; l < 8; l++) ymm1[l] = kv(V_CLAMP, l);
        // @0x29465f: vmaxps %ymm1,%ymm0,%ymm2
        for (let l = 0; l < 8; l++) ymm2[l] = maxps(ymm0[l] as number, ymm1[l] as number);
        // @0x294663: vshufps $0xff,%ymm1,%ymm1,%ymm3 => ymm1[3,3,3,3,7,7,7,7] (the upper clamp)
        for (let l = 0; l < 4; l++) ymm3[l] = ymm1[3] as number;
        for (let l = 4; l < 8; l++) ymm3[l] = ymm1[7] as number;
        // @0x294668: vbroadcastss 0x4(%rsi),%ymm4
        for (let l = 0; l < 8; l++) ymm4[l] = ks(S_PRE_OFFSET);
        // @0x29466e: vminps %ymm3,%ymm2,%ymm2 — the clamped texel pair
        for (let l = 0; l < 8; l++) ymm2[l] = minps(ymm2[l] as number, ymm3[l] as number);
        // @0x294672: vaddps %ymm4,%ymm2,%ymm4 — x = clamped + S04
        for (let l = 0; l < 8; l++) {
          ymm4[l] = Math.fround((ymm2[l] as number) + (ymm4[l] as number));
        }

        // ── log2(x) ───────────────────────────────────────────────────────────────────────
        // @0x294676: vandps 0x240(%rsi),%ymm4,%ymm5 — mantissa bits
        for (let l = 0; l < 8; l++) {
          ymm5[l] = floatOf(bitsOf(ymm4[l] as number) & bitsOf(kv(V_MANTISSA_MASK, l)));
        }
        // @0x29467e: vmovups 0xa0(%rsi),%ymm3 — the "one"
        for (let l = 0; l < 8; l++) ymm3[l] = kv(V_ONE, l);
        // @0x294686: vcmpltps 0x260(%rsi),%ymm4,%ymm6 — x < cutoff ?
        for (let l = 0; l < 8; l++) m6[l] = cmpltps(ymm4[l] as number, kv(V_LOG_CUTOFF, l));
        // @0x29468f: vorps %ymm3,%ymm5,%ymm5 — mantissa | one  => m in [1,2)
        for (let l = 0; l < 8; l++) {
          ymm5[l] = floatOf(bitsOf(ymm5[l] as number) | bitsOf(ymm3[l] as number));
        }
        // @0x294693: vandps 0x280(%rsi),%ymm6,%ymm6 — the below-cutoff exponent correction
        for (let l = 0; l < 8; l++) {
          ymm6[l] = floatOf((m6[l] as number) & bitsOf(kv(V_LOG_CUTOFF_ADJ, l)));
        }
        // @0x29469b..@0x2946ab: vpsrld $0x17 on each 128-bit half, recombined — the exponent
        for (let l = 0; l < 8; l++) iA[l] = bitsOf(ymm4[l] as number) >>> 23;
        // @0x2946b1: vcvtdq2ps %ymm4,%ymm4
        for (let l = 0; l < 8; l++) ymm4[l] = Math.fround(iA[l] as number);
        // @0x2946b5: vsubps %ymm6,%ymm4,%ymm4
        for (let l = 0; l < 8; l++) {
          ymm4[l] = Math.fround((ymm4[l] as number) - (ymm6[l] as number));
        }
        // @0x2946b9: vsubps 0x2a0(%rsi),%ymm4,%ymm4 — remove the exponent bias
        for (let l = 0; l < 8; l++) {
          ymm4[l] = Math.fround((ymm4[l] as number) - kv(V_EXP_BIAS, l));
        }
        // @0x2946c1: vmovups 0x2c0(%rsi),%ymm6 ; @0x2946c9: vcmpltps %ymm5,%ymm6,%ymm6
        //   => mask = (split < m), i.e. the mantissa is above the split point
        for (let l = 0; l < 8; l++) m6[l] = cmpltps(kv(V_MANTISSA_SPLIT, l), ymm5[l] as number);
        // @0x2946ce: vandps %ymm3,%ymm6,%ymm6 — the correction is `one` where the mask is set
        for (let l = 0; l < 8; l++) {
          ymm6[l] = floatOf((m6[l] as number) & bitsOf(ymm3[l] as number));
        }
        // @0x2946d2: vmulps 0x2e0(%rsi),%ymm6,%ymm7
        for (let l = 0; l < 8; l++) {
          ymm7[l] = Math.fround((ymm6[l] as number) * kv(V_SPLIT_SCALE, l));
        }
        // @0x2946da: vaddps %ymm4,%ymm6,%ymm4 — exponent += correction
        for (let l = 0; l < 8; l++) {
          ymm4[l] = Math.fround((ymm6[l] as number) + (ymm4[l] as number));
        }
        // @0x2946de: vmulps %ymm5,%ymm7,%ymm6
        for (let l = 0; l < 8; l++) {
          ymm6[l] = Math.fround((ymm7[l] as number) * (ymm5[l] as number));
        }
        // @0x2946e2: vsubps %ymm3,%ymm5,%ymm5 — m - 1
        for (let l = 0; l < 8; l++) {
          ymm5[l] = Math.fround((ymm5[l] as number) - (ymm3[l] as number));
        }
        // @0x2946e6: vsubps %ymm6,%ymm5,%ymm5 — ... minus the split correction
        for (let l = 0; l < 8; l++) {
          ymm5[l] = Math.fround((ymm5[l] as number) - (ymm6[l] as number));
        }
        // @0x2946ea: vmulps 0x300(%rsi),%ymm5,%ymm6
        for (let l = 0; l < 8; l++) {
          ymm6[l] = Math.fround((ymm5[l] as number) * kv(V_LOG_C0, l));
        }
        // @0x2946f2: vaddps 0x320(%rsi),%ymm6,%ymm6
        for (let l = 0; l < 8; l++) {
          ymm6[l] = Math.fround((ymm6[l] as number) + kv(V_LOG_C1, l));
        }
        // @0x2946fa: vmulps %ymm5,%ymm5,%ymm7 — u²
        for (let l = 0; l < 8; l++) {
          ymm7[l] = Math.fround((ymm5[l] as number) * (ymm5[l] as number));
        }
        // @0x2946fe: vmulps %ymm6,%ymm7,%ymm6
        for (let l = 0; l < 8; l++) {
          ymm6[l] = Math.fround((ymm7[l] as number) * (ymm6[l] as number));
        }
        // @0x294702: vmulps 0x340(%rsi),%ymm5,%ymm7
        for (let l = 0; l < 8; l++) {
          ymm7[l] = Math.fround((ymm5[l] as number) * kv(V_LOG_C2, l));
        }
        // @0x29470a: vaddps 0x360(%rsi),%ymm7,%ymm7
        for (let l = 0; l < 8; l++) {
          ymm7[l] = Math.fround((ymm7[l] as number) + kv(V_LOG_C3, l));
        }
        // @0x294712: vaddps %ymm6,%ymm7,%ymm6
        for (let l = 0; l < 8; l++) {
          ymm6[l] = Math.fround((ymm7[l] as number) + (ymm6[l] as number));
        }
        // @0x294716: vmulps %ymm6,%ymm5,%ymm5
        for (let l = 0; l < 8; l++) {
          ymm5[l] = Math.fround((ymm5[l] as number) * (ymm6[l] as number));
        }
        // @0x29471a: vaddps %ymm5,%ymm4,%ymm4 — log2(x) complete
        for (let l = 0; l < 8; l++) {
          ymm4[l] = Math.fround((ymm4[l] as number) + (ymm5[l] as number));
        }

        // ── exp2(S00 · log2(x)) ───────────────────────────────────────────────────────────
        // @0x29471e: vbroadcastss (%rsi),%ymm5 ; @0x294723: vmulps %ymm4,%ymm5,%ymm4
        for (let l = 0; l < 8; l++) {
          ymm4[l] = Math.fround(ks(S_GAMMA) * (ymm4[l] as number));
        }
        // @0x294727: vmaxps 0x380(%rsi),%ymm4,%ymm4 — clamp the exponent from below
        for (let l = 0; l < 8; l++) ymm4[l] = maxps(ymm4[l] as number, kv(V_EXP_FLOOR, l));
        // @0x29472f: vroundps $0x9,%ymm4,%ymm5 — round toward -inf (floor)
        for (let l = 0; l < 8; l++) ymm5[l] = Math.fround(Math.floor(ymm4[l] as number));
        // @0x294735: vsubps %ymm5,%ymm4,%ymm4 — the fractional part
        for (let l = 0; l < 8; l++) {
          ymm4[l] = Math.fround((ymm4[l] as number) - (ymm5[l] as number));
        }
        // @0x294739: vmulps 0x3a0(%rsi),%ymm4,%ymm6
        for (let l = 0; l < 8; l++) {
          ymm6[l] = Math.fround((ymm4[l] as number) * kv(V_EXP_C0, l));
        }
        // @0x294741: vaddps 0x3c0(%rsi),%ymm6,%ymm6
        for (let l = 0; l < 8; l++) {
          ymm6[l] = Math.fround((ymm6[l] as number) + kv(V_EXP_C1, l));
        }
        // @0x294749: vmulps %ymm6,%ymm4,%ymm6
        for (let l = 0; l < 8; l++) {
          ymm6[l] = Math.fround((ymm4[l] as number) * (ymm6[l] as number));
        }
        // @0x29474d: vaddps 0x3e0(%rsi),%ymm6,%ymm6
        for (let l = 0; l < 8; l++) {
          ymm6[l] = Math.fround((ymm6[l] as number) + kv(V_EXP_C2, l));
        }
        // @0x294755: vmulps %ymm6,%ymm4,%ymm4
        for (let l = 0; l < 8; l++) {
          ymm4[l] = Math.fround((ymm4[l] as number) * (ymm6[l] as number));
        }
        // @0x294759: vaddps %ymm4,%ymm3,%ymm3 — one + poly(frac)
        for (let l = 0; l < 8; l++) {
          ymm3[l] = Math.fround((ymm3[l] as number) + (ymm4[l] as number));
        }
        // @0x29475d: vcvttps2dq %ymm5,%ymm4 — the integer part
        for (let l = 0; l < 8; l++) iA[l] = cvttps2dq(ymm5[l] as number);
        // @0x294761..@0x294781: vpaddd 0x400(%rsi) on each 128-bit half, vpslld $0x17, recombine
        //   — builds 2^n as a raw float bit pattern. The constant is a single 16-byte `vmovdqa`
        //   loaded once @0x294761 and applied to BOTH halves, so lane l uses lane (l & 3).
        for (let l = 0; l < 8; l++) {
          ymm4[l] = floatOf(((ki(V_EXP2_BIAS_I, l & 3) + (iA[l] as number)) | 0) << 23);
        }
        // @0x294787: vmulps %ymm4,%ymm3,%ymm3 — exp2 result
        for (let l = 0; l < 8; l++) {
          ymm3[l] = Math.fround((ymm3[l] as number) * (ymm4[l] as number));
        }
        // @0x29478b: vbroadcastss 0xc(%rsi),%ymm4 ; @0x294791: vmulps %ymm3,%ymm4,%ymm3
        for (let l = 0; l < 8; l++) {
          ymm3[l] = Math.fround(ks(S_POST_SCALE) * (ymm3[l] as number));
        }

        // ── low-clamp select and alpha passthrough ────────────────────────────────────────
        // @0x294795: vbroadcastss 0x24(%rsi),%ymm4 ; @0x29479b: vsubps %ymm4,%ymm2,%ymm2
        for (let l = 0; l < 8; l++) {
          ymm2[l] = Math.fround((ymm2[l] as number) - ks(S_LINEAR_THRESHOLD));
        }
        // @0x29479f: vshufps $0x0,%ymm1,%ymm1,%ymm4 => ymm1[0,0,0,0,4,4,4,4] (the lower clamp)
        for (let l = 0; l < 4; l++) ymm4[l] = ymm1[0] as number;
        for (let l = 4; l < 8; l++) ymm4[l] = ymm1[4] as number;
        // @0x2947a4: vcmpltps %ymm1,%ymm2,%ymm1 — (clamped - S24) < clampVector ?
        for (let l = 0; l < 8; l++) m1[l] = cmpltps(ymm2[l] as number, ymm1[l] as number);
        // @0x2947a9: vblendvps %ymm1,%ymm4,%ymm3,%ymm1 => mask ? lowerClamp : gamma
        for (let l = 0; l < 8; l++) {
          ymm1[l] = (m1[l] as number) >>> 31 ? (ymm4[l] as number) : (ymm3[l] as number);
        }
        // @0x2947af: vblendps $0x88,%ymm0,%ymm1,%ymm0 — lanes 3 and 7 (alpha) come from ymm0
        for (let l = 0; l < 8; l++) {
          if (l !== 3 && l !== 7) ymm0[l] = ymm1[l] as number;
        }
        // @0x2947b5: vmovups %ymm0,-0x10(%r8,%rbx)
        for (let l = 0; l < 8; l++) outArr[q + l] = ymm0[l] as number;

        // @0x2947bc: addq $0x20,%rbx  (advance 8 float32 == 2 texels)
        k++;
        // @0x2947c0..@0x2947d2: r14 = r11 ; r11 -= 2 ; r14 += ecx ; r14 -= 2 ; `jg` continues
        //   while r14 > 1. With r11 == -2·(k-1) on entry that is `width - 2k > 1`, i.e. keep
        //   going while at least two texels remain.
        r11 -= 2;
        if (!(width - 2 * k > 1)) break;
      }
      // @0x2947d8: negl %r11d — r11 becomes the number of texels the 8-wide body consumed.
      r11 = -r11;
    }

    // @0x2947db/@0x2947de: `cmpl %ecx,%r11d ; jge 0x294620` — nothing left over, next row.
    if (r11 < width) {
      // @0x2947e4/@0x2947e7: r11 = (uint32)r11 << 4 — byte offset of the leftover texel
      const p = inBase + 4 * r11;
      const q = outBase + 4 * r11;

      // @0x2947eb: vmovaps (%r9,%r11),%xmm0 — one RGBA texel
      for (let l = 0; l < 4; l++) ymm0[l] = inArr[p + l] as number;
      // @0x2947f1: vmovaps 0x940(%rsi),%xmm1
      for (let l = 0; l < 4; l++) ymm1[l] = kv(V_CLAMP, l);
      // @0x2947f9: vmaxps %xmm1,%xmm0,%xmm2
      for (let l = 0; l < 4; l++) ymm2[l] = maxps(ymm0[l] as number, ymm1[l] as number);
      // @0x2947fd: vbroadcastss 0x94c(%rsi),%xmm3 — the same upper clamp the 8-wide body
      //   reached with `vshufps $0xff` (lane 3 of the 0x940 vector)
      for (let l = 0; l < 4; l++) ymm3[l] = kv(V_CLAMP, 3);
      // @0x294806: vminps %xmm3,%xmm2,%xmm2
      for (let l = 0; l < 4; l++) ymm2[l] = minps(ymm2[l] as number, ymm3[l] as number);
      // @0x29480a: vbroadcastss 0x4(%rsi),%xmm3 ; @0x294810: vaddps %xmm3,%xmm2,%xmm4
      for (let l = 0; l < 4; l++) {
        ymm4[l] = Math.fround((ymm2[l] as number) + ks(S_PRE_OFFSET));
      }

      // ── log2 (4-wide) ───────────────────────────────────────────────────────────────────
      // @0x294814: vandps 0x240(%rsi),%xmm4,%xmm5
      for (let l = 0; l < 4; l++) {
        ymm5[l] = floatOf(bitsOf(ymm4[l] as number) & bitsOf(kv(V_MANTISSA_MASK, l)));
      }
      // @0x29481c: vmovaps 0xa0(%rsi),%xmm3
      for (let l = 0; l < 4; l++) ymm3[l] = kv(V_ONE, l);
      // @0x294824: vcmpltps 0x260(%rsi),%xmm4,%xmm6
      for (let l = 0; l < 4; l++) m6[l] = cmpltps(ymm4[l] as number, kv(V_LOG_CUTOFF, l));
      // @0x29482d: vorps %xmm3,%xmm5,%xmm5
      for (let l = 0; l < 4; l++) {
        ymm5[l] = floatOf(bitsOf(ymm5[l] as number) | bitsOf(ymm3[l] as number));
      }
      // @0x294831: vandps 0x280(%rsi),%xmm6,%xmm6
      for (let l = 0; l < 4; l++) {
        ymm6[l] = floatOf((m6[l] as number) & bitsOf(kv(V_LOG_CUTOFF_ADJ, l)));
      }
      // @0x294839: vpsrld $0x17,%xmm4,%xmm4 ; @0x29483e: vcvtdq2ps %xmm4,%xmm4
      for (let l = 0; l < 4; l++) iA[l] = bitsOf(ymm4[l] as number) >>> 23;
      for (let l = 0; l < 4; l++) ymm4[l] = Math.fround(iA[l] as number);
      // @0x294842: vsubps %xmm6,%xmm4,%xmm4
      for (let l = 0; l < 4; l++) {
        ymm4[l] = Math.fround((ymm4[l] as number) - (ymm6[l] as number));
      }
      // @0x294846: vsubps 0x2a0(%rsi),%xmm4,%xmm4
      for (let l = 0; l < 4; l++) {
        ymm4[l] = Math.fround((ymm4[l] as number) - kv(V_EXP_BIAS, l));
      }
      // @0x29484e: vmovaps 0x2c0(%rsi),%xmm6 ; @0x294856: vcmpltps %xmm5,%xmm6,%xmm6
      for (let l = 0; l < 4; l++) m6[l] = cmpltps(kv(V_MANTISSA_SPLIT, l), ymm5[l] as number);
      // @0x29485b: vandps %xmm3,%xmm6,%xmm6
      for (let l = 0; l < 4; l++) {
        ymm6[l] = floatOf((m6[l] as number) & bitsOf(ymm3[l] as number));
      }
      // @0x29485f: vaddps %xmm6,%xmm4,%xmm4 — NOTE the 8-wide body performs this add AFTER the
      //   0x2e0 multiply (@0x2946d2/@0x2946da); the two operations are independent, so this is a
      //   scheduling difference only.
      for (let l = 0; l < 4; l++) {
        ymm4[l] = Math.fround((ymm4[l] as number) + (ymm6[l] as number));
      }
      // @0x294863: vmulps 0x2e0(%rsi),%xmm6,%xmm6
      for (let l = 0; l < 4; l++) {
        ymm6[l] = Math.fround((ymm6[l] as number) * kv(V_SPLIT_SCALE, l));
      }
      // @0x29486b: vmulps %xmm5,%xmm6,%xmm6
      for (let l = 0; l < 4; l++) {
        ymm6[l] = Math.fround((ymm6[l] as number) * (ymm5[l] as number));
      }
      // @0x29486f: vsubps %xmm3,%xmm5,%xmm5 ; @0x294873: vsubps %xmm6,%xmm5,%xmm5
      for (let l = 0; l < 4; l++) {
        ymm5[l] = Math.fround((ymm5[l] as number) - (ymm3[l] as number));
      }
      for (let l = 0; l < 4; l++) {
        ymm5[l] = Math.fround((ymm5[l] as number) - (ymm6[l] as number));
      }
      // @0x294877: vmulps %xmm5,%xmm5,%xmm6 — u²
      for (let l = 0; l < 4; l++) {
        ymm6[l] = Math.fround((ymm5[l] as number) * (ymm5[l] as number));
      }
      // @0x29487b: vmulps 0x300(%rsi),%xmm5,%xmm7 ; @0x294883: vaddps 0x320(%rsi),%xmm7,%xmm7
      for (let l = 0; l < 4; l++) {
        ymm7[l] = Math.fround((ymm5[l] as number) * kv(V_LOG_C0, l));
      }
      for (let l = 0; l < 4; l++) {
        ymm7[l] = Math.fround((ymm7[l] as number) + kv(V_LOG_C1, l));
      }
      // @0x29488b: vmulps 0x340(%rsi),%xmm5,%xmm8
      for (let l = 0; l < 4; l++) {
        ymm8[l] = Math.fround((ymm5[l] as number) * kv(V_LOG_C2, l));
      }
      // @0x294893: vmulps %xmm7,%xmm6,%xmm6
      for (let l = 0; l < 4; l++) {
        ymm6[l] = Math.fround((ymm6[l] as number) * (ymm7[l] as number));
      }
      // @0x294897: vaddps 0x360(%rsi),%xmm8,%xmm7
      for (let l = 0; l < 4; l++) {
        ymm7[l] = Math.fround((ymm8[l] as number) + kv(V_LOG_C3, l));
      }
      // @0x29489f: vaddps %xmm6,%xmm7,%xmm6 ; @0x2948a3: vmulps %xmm6,%xmm5,%xmm5
      for (let l = 0; l < 4; l++) {
        ymm6[l] = Math.fround((ymm7[l] as number) + (ymm6[l] as number));
      }
      for (let l = 0; l < 4; l++) {
        ymm5[l] = Math.fround((ymm5[l] as number) * (ymm6[l] as number));
      }
      // @0x2948a7: vaddps %xmm5,%xmm4,%xmm4 — log2(x) complete
      for (let l = 0; l < 4; l++) {
        ymm4[l] = Math.fround((ymm4[l] as number) + (ymm5[l] as number));
      }

      // ── exp2 (4-wide) ───────────────────────────────────────────────────────────────────
      // @0x2948ab: vbroadcastss (%rsi),%xmm5 ; @0x2948b0: vmulps %xmm4,%xmm5,%xmm4
      for (let l = 0; l < 4; l++) {
        ymm4[l] = Math.fround(ks(S_GAMMA) * (ymm4[l] as number));
      }
      // @0x2948b4: vmaxps 0x380(%rsi),%xmm4,%xmm4
      for (let l = 0; l < 4; l++) ymm4[l] = maxps(ymm4[l] as number, kv(V_EXP_FLOOR, l));
      // @0x2948bc: vroundps $0x9,%xmm4,%xmm5 ; @0x2948c2: vsubps %xmm5,%xmm4,%xmm4
      for (let l = 0; l < 4; l++) ymm5[l] = Math.fround(Math.floor(ymm4[l] as number));
      for (let l = 0; l < 4; l++) {
        ymm4[l] = Math.fround((ymm4[l] as number) - (ymm5[l] as number));
      }
      // @0x2948c6: vmulps 0x3a0(%rsi),%xmm4,%xmm6 ; @0x2948ce: vaddps 0x3c0(%rsi),%xmm6,%xmm6
      for (let l = 0; l < 4; l++) {
        ymm6[l] = Math.fround((ymm4[l] as number) * kv(V_EXP_C0, l));
      }
      for (let l = 0; l < 4; l++) {
        ymm6[l] = Math.fround((ymm6[l] as number) + kv(V_EXP_C1, l));
      }
      // @0x2948d6: vmulps %xmm6,%xmm4,%xmm6 ; @0x2948da: vaddps 0x3e0(%rsi),%xmm6,%xmm6
      for (let l = 0; l < 4; l++) {
        ymm6[l] = Math.fround((ymm4[l] as number) * (ymm6[l] as number));
      }
      for (let l = 0; l < 4; l++) {
        ymm6[l] = Math.fround((ymm6[l] as number) + kv(V_EXP_C2, l));
      }
      // @0x2948e2: vmulps %xmm6,%xmm4,%xmm4 ; @0x2948e6: vaddps %xmm4,%xmm3,%xmm3
      for (let l = 0; l < 4; l++) {
        ymm4[l] = Math.fround((ymm4[l] as number) * (ymm6[l] as number));
      }
      for (let l = 0; l < 4; l++) {
        ymm3[l] = Math.fround((ymm3[l] as number) + (ymm4[l] as number));
      }
      // @0x2948ea: vcvttps2dq %xmm5,%xmm4 ; @0x2948ee: vpaddd 0x400(%rsi),%xmm4,%xmm4
      // @0x2948f6: vpslld $0x17,%xmm4,%xmm4
      for (let l = 0; l < 4; l++) iA[l] = cvttps2dq(ymm5[l] as number);
      for (let l = 0; l < 4; l++) {
        ymm4[l] = floatOf(((ki(V_EXP2_BIAS_I, l) + (iA[l] as number)) | 0) << 23);
      }
      // @0x2948fb: vmulps %xmm4,%xmm3,%xmm3
      for (let l = 0; l < 4; l++) {
        ymm3[l] = Math.fround((ymm3[l] as number) * (ymm4[l] as number));
      }
      // @0x2948ff: vbroadcastss 0xc(%rsi),%xmm4 ; @0x294905: vmulps %xmm3,%xmm4,%xmm3
      for (let l = 0; l < 4; l++) {
        ymm3[l] = Math.fround(ks(S_POST_SCALE) * (ymm3[l] as number));
      }

      // ── low-clamp select and alpha passthrough (4-wide) ─────────────────────────────────
      // @0x294909: vbroadcastss 0x24(%rsi),%xmm4 ; @0x29490f: vsubps %xmm4,%xmm2,%xmm2
      for (let l = 0; l < 4; l++) {
        ymm2[l] = Math.fround((ymm2[l] as number) - ks(S_LINEAR_THRESHOLD));
      }
      // @0x294913: vbroadcastss 0x940(%rsi),%xmm4 — the same lower clamp the 8-wide body
      //   reached with `vshufps $0x0`
      for (let l = 0; l < 4; l++) ymm4[l] = kv(V_CLAMP, 0);
      // @0x29491c: vcmpltps %xmm1,%xmm2,%xmm1
      for (let l = 0; l < 4; l++) m1[l] = cmpltps(ymm2[l] as number, ymm1[l] as number);
      // @0x294921: vblendvps %xmm1,%xmm4,%xmm3,%xmm1 => mask ? lowerClamp : gamma
      for (let l = 0; l < 4; l++) {
        ymm1[l] = (m1[l] as number) >>> 31 ? (ymm4[l] as number) : (ymm3[l] as number);
      }
      // @0x294927: vblendps $0x8,%xmm0,%xmm1,%xmm0 — lane 3 (alpha) comes from xmm0
      for (let l = 0; l < 3; l++) ymm0[l] = ymm1[l] as number;
      // @0x29492d: vmovaps %xmm0,(%r8,%r11)
      for (let l = 0; l < 4; l++) outArr[q + l] = ymm0[l] as number;
      // @0x294933: jmp 0x294620 — exactly ONE leftover texel is possible, so the tail runs once.
    }

    // @0x294620: addq %rdi,%r9 ; @0x294623: addq %rdx,%r8 — advance both planes by a row.
    inBase += inRowStride;
    outBase += outRowStride;
  }
  // @0x294938..@0x29493f: popq %rbx ; popq %r14 ; popq %rbp ; vzeroupper ; retq
}
