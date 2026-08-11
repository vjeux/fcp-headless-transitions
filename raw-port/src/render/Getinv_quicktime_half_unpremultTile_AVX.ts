// Getinv_quicktime_half_unpremultTile_AVX(HGTile*, HGToneCurve::State*, HGNode*) @Helium 0x29f830
//
// A file-local (`__ZL…`, nm class `t`) AVX tile kernel from the HGToneCurve translation unit — the
// `inv_quicktime / half / unpremult` member of the `Get<curve>_<quality>[_unpremult]Tile_AVX`
// family HGToneCurve dispatches to once `AcceleratedState` has classified the curve. Per
// PORTING_SPEC's naming rule a free function lives in a file named after it.
//
// Decode evidence (regenerate with
//   bash raw-port/tools/disasm.sh --sym \
//     __ZL39Getinv_quicktime_half_unpremultTile_AVXP6HGTilePN11HGToneCurve5StateEP6HGNode Helium
// ): 112 lines, 0x29f830..0x29fa6d, a LEAF — no `call` of any kind, no vtable slot, and no
// RIP-relative constant. Every number it uses is read out of the `HGToneCurve::State` block
// through %rsi, so this port takes the State as a byte view and reads the same offsets rather than
// inventing values. Siblings on main for the family idioms and the HGTile layout:
// raw-port/src/render/Gettype1_half_unpremultTile_AVX.ts and Gettype3_nice_satTile_AVX.ts.
//
// WHAT IT COMPUTES (per RGBA float32 texel; the alpha lane is passed through untouched)
//   1. floor:  v = MAXPS(texel, K[0xb00])            — a per-lane lower clamp.
//   2. sign:   sgn = v < 0 ? K[0x15a0] : K[0xa0]     — selected by the SIGN BIT of v through
//              `vblendvps` @0x29f8b6, i.e. the odd-symmetry factor of the curve.
//   3. magnitude: t = MINPS(v & K[0x15c0], K[0xde0]) — `vandps` with the 0x15c0 vector (an
//              absolute-value mask in every State this kernel is dispatched with) then an upper
//              clamp.
//   4. polynomial in s = t·t, evaluated exactly in the machine's association:
//                 A = t·K[0x1be0] + K[0x1c00]
//                 B = t·K[0x1c20] + K[0x1c40]
//                 A = s·(A + s·K[0x1c60])
//                 out = sgn · ( s·(B + A) )
//   5. `vblendps` the ALPHA lane straight through from the untouched input (lanes 3 and 7 of the
//      8-wide body, lane 3 of the 4-wide forms), and store.
//
// NOTHING HERE IS IMPLEMENTATION-DEFINED, so this port is bit-exact and its oracle demands 0
// divergences rather than an ulp budget: the only operations are load/store, MAXPS, MINPS, ANDPS,
// multiply, add and the two blends. There is no `vrcpps` (the instruction the landed
// Gettype3_nice_satTile_AVX could not make bit-exact), no `vdivps` and no `vsqrtps` — and no
// reciprocal at all, despite the `unpremult` in the name, which matches what the landed
// Gettype1_half_unpremultTile_AVX header records about its own body.
//
// THREE BODIES, TRANSCRIBED SEPARATELY. The machine has an 8-wide loop (two texels), a 4-wide tail
// (one texel) for an odd trailing texel, and a THIRD, separate 4-wide loop @0x29f9e0 taken when the
// row is exactly one texel wide (`cmpl $0x2,%r9d ; jl` @0x29f85a, then `cmpl $0x1,%r9d ; jne` —
// a width of 0 or less returns). The width-1 loop computes the same values in a DIFFERENT ORDER
// (the sign select is deferred to @0x29fa2c/@0x29fa38, and the two independent multiplies at
// @0x29f9fc/@0x29fa04 are interleaved), so it is transcribed as its own body rather than folded
// into the tail — any future divergence between them stays visible, which is the reason the landed
// siblings do the same.
//
// DIFFERENTIAL vs the live binary — raw-port/re/oracle/
// Getinv_quicktime_half_unpremultTile_AVX_{oracle.py,driver.mts}. The symbol is LOCAL, so dlsym
// cannot reach it: the harness takes the x86_64 vmaddr from army/inventory/Helium.syms.txt, adds
// the slide dyld reports, and — before reporting any number — checks the 7 bytes there against the
// prologue transcribed above (`55 48 89 e5 41 56 53`), because an arm64-address run does not merely
// risk a wrong verdict, it hides the NaN-sign class and scores BETTER than the correct instrument.
// The TS side is THIS FILE, executed through `node --experimental-strip-types`, not a restatement.
//
// RESULT: 68 tile cases — widths 0..9 plus 16/17/1/2 and negative and zero extents, heights 1..3,
// destination strides wider than the row, a POISONED destination so a stray write is visible, and
// pixel/State values drawn from a pool of +-0, +-1, +-inf, +-NaN, subnormals and randoms — 4,116
// destination lanes compared as raw bit patterns: 0 REAL divergences. 1,587 lanes differ in NaN
// PAYLOAD only (both sides NaN) and are classified separately rather than excused: a NaN where the
// machine produced a finite number would count as a divergence. All 2,529 finite lanes are exact.
//
// THE STATE IS FUZZED PER LANE, which is what makes the corpus discriminating: this kernel reads
// all ten of its constants out of State, so a random State exercises the same instructions, and a
// LANE-UNIFORM one could not catch the thing that is easiest to get wrong here — in the 8-wide body
// the SECOND texel of each pair reads State lanes 4..7, not 0..3.
//
// NEGATIVE CONTROLS, evaluated in the same node process, with the unmutated base model reported
// alongside so the numbers can be read honestly (it kills 0, i.e. the controls measure their own
// defect and nothing else): MAXPS operands swapped 107 lanes, MINPS operands swapped 10, the sign
// test written as `v < 0` instead of the SIGN BIT 46 (the -0.0 class), the alpha passthrough
// dropped 645.
//
// AT&T operand order (PORTING_SPEC's cheat-sheet): `vop src2, src1, dst` is Intel
// `vop dst, src1, src2`. So `vmaxps 0xb00(%rsi), %ymm0, %ymm0` is ymm0 = MAXPS(src1 = ymm0,
// src2 = State[0xb00]) — which matters, because MAXPS returns src2 on equal and on unordered.

/** MAXPS lane rule: `(src1 > src2) ? src1 : src2` — src2 wins on equal AND on unordered (NaN).
 *  Mirrors the helper in the landed sibling Gettype1_half_unpremultTile_AVX.ts. */
function maxps(src1: number, src2: number): number {
  return src1 > src2 ? src1 : src2;
}

/** MINPS lane rule: `(src1 < src2) ? src1 : src2` — src2 wins on equal AND on unordered (NaN). */
function minps(src1: number, src2: number): number {
  return src1 < src2 ? src1 : src2;
}

/** Scratch used only to reinterpret one f32 as its bit pattern and back. `vandps` @0x29f8c0
 *  operates on the BITS of the register file and JS has no other way to express that. Not an FCP
 *  function; pure plumbing, mirroring the landed siblings. */
const bitScratch = new DataView(new ArrayBuffer(4));

function bitsOf(x: number): number {
  bitScratch.setFloat32(0, x, true);
  return bitScratch.getUint32(0, true);
}

function floatOf(bits: number): number {
  bitScratch.setUint32(0, bits >>> 0, true);
  return bitScratch.getFloat32(0, true);
}

/** `vandps` on one lane: a bitwise AND of the two f32 bit patterns. @0x29f8c0 / @0x29f962 /
 *  @0x29f9ec. */
function andps(a: number, b: number): number {
  return floatOf((bitsOf(a) & bitsOf(b)) >>> 0);
}

/**
 * HGTile — the tile descriptor Helium hands every `…Tile_AVX` kernel. Only the fields this kernel
 * touches are modelled; each cites the byte offset it is read from in THIS function. Pointers are
 * Float32Array views over the plane; the row strides stay in TEXELS (the machine sign-extends the
 * int32 with `movslq` and then `shlq $0x4`, i.e. 16 bytes = 4 float32 = one RGBA texel per unit).
 * Identical to the layout the landed Gettype1_half_unpremultTile_AVX.ts recovered, from the same
 * offsets.
 */
export interface HGTile {
  /** +0x00 — x0 (int32). Read @0x29f847 as the subtrahend of the width. */
  x0: number;
  /** +0x04 — y0 (int32). Read @0x29f83a as the subtrahend of the height. */
  y0: number;
  /** +0x08 — x1 (int32). Read @0x29f843. */
  x1: number;
  /** +0x0c — y1 (int32). Read @0x29f837. */
  y1: number;
  /** +0x10 — destination plane (RGBA f32, row-major). Read @0x29f84e. */
  outPtr: Float32Array;
  /** +0x18 — destination row stride in TEXELS (int32, sign-extended @0x29f852). */
  outRowStride: number;
  /** +0x50 — source plane (RGBA f32, row-major). Read @0x29f84a. */
  inPtr: Float32Array;
  /** +0x58 — source row stride in TEXELS (int32, sign-extended @0x29f856). */
  inRowStride: number;
}

// ── HGToneCurve::State offsets this kernel reads ────────────────────────────────────────────────
// Every one of these is READ from the State block through %rsi; none is a literal in the code
// stream, so this port reads them too rather than naming values it cannot ground. All are 32-byte
// vector loads in the 8-wide body and the same offsets as 16-byte loads in the two 4-wide bodies,
// so each is indexed PER LANE here — the port never assumes a slot is lane-uniform.
/** +0xa0 (vector) — the positive-sign factor; `vmovups 0xa0(%rsi)` @0x29f8ae, and the FALSE side
 *  of the sign blend @0x29f8b6. Same slot the landed siblings call V_ONE. */
const V_SIGN_POS = 0xa0;
/** +0xb00 (vector) — the lower clamp: MAXPS src2 @0x29f8a6 / @0x29f948 / @0x29f9e4. */
const V_FLOOR = 0xb00;
/** +0xde0 (vector) — the upper clamp on the magnitude: MINPS src2 @0x29f8c8 / @0x29f96a /
 *  @0x29f9f4. */
const V_MAG_CEIL = 0xde0;
/** +0x15a0 (vector) — the negative-sign factor; the TRUE side of the sign blend @0x29f8b6. */
const V_SIGN_NEG = 0x15a0;
/** +0x15c0 (vector) — ANDed with the floored texel to take its magnitude @0x29f8c0. */
const V_ABS_MASK = 0x15c0;
/** +0x1be0 (vector) — polynomial coefficient, multiplies t @0x29f8d0. */
const V_C_A1 = 0x1be0;
/** +0x1c00 (vector) — polynomial coefficient, added to t·C_A1 @0x29f8d8. */
const V_C_A0 = 0x1c00;
/** +0x1c20 (vector) — polynomial coefficient, multiplies t @0x29f8e4. */
const V_C_B1 = 0x1c20;
/** +0x1c40 (vector) — polynomial coefficient, added to t·C_B1 @0x29f8ec. */
const V_C_B0 = 0x1c40;
/** +0x1c60 (vector) — polynomial coefficient, multiplies s = t·t @0x29f8f4. */
const V_C_A2 = 0x1c60;

/** Read lane `i` of the 32-byte State vector at `off` (little-endian f32, as the loads are). */
function sv(state: DataView, off: number, lane: number): number {
  return state.getFloat32(off + 4 * lane, true);
}

/**
 * Getinv_quicktime_half_unpremultTile_AVX(HGTile* tile, HGToneCurve::State* state, HGNode* node)
 * @Helium 0x000000000029f830
 *   `__ZL39Getinv_quicktime_half_unpremultTile_AVXP6HGTilePN11HGToneCurve5StateEP6HGNode`
 *
 * `node` (%rdx) is never read by this function — it is part of the uniform kernel signature.
 *
 * @param tile   the tile descriptor (%rdi)
 * @param state  a byte view of the 32-byte-aligned HGToneCurve::State block (%rsi); every constant
 *               is read out of it at the documented offsets, little-endian
 * @param _node  %rdx — unused by this kernel
 */
export function Getinv_quicktime_half_unpremultTile_AVX(
  tile: HGTile,
  state: DataView,
  _node?: unknown,
): void {
  // @0x29f837 movl 0xc(%rdi),%eax ; @0x29f83a subl 0x4(%rdi),%eax : eax = y1 - y0
  const eax = (tile.y1 - tile.y0) | 0;
  // @0x29f83d jle 0x29fa66 : no rows, return before the loops.
  if (eax <= 0) return;

  // @0x29f843 movl 0x8(%rdi),%r9d ; @0x29f847 subl (%rdi),%r9d : r9d = x1 - x0
  const r9d = (tile.x1 - tile.x0) | 0;
  // @0x29f84a movq 0x50(%rdi),%rcx : rcx = src plane
  // @0x29f84e movq 0x10(%rdi),%rdx : rdx = dst plane
  const src = tile.inPtr;
  const dst = tile.outPtr;
  // @0x29f852 movslq 0x18(%rdi),%r8 : r8 = (int32)dstRowStride, sign-extended
  // @0x29f856 movslq 0x58(%rdi),%rdi : rdi = (int32)srcRowStride, sign-extended
  // Both are shifted left by 4 (bytes) at @0x29f864/@0x29f868 and again at @0x29f9cd/@0x29f9d1 on
  // the width-1 path; 16 bytes = 4 float32 = one texel, so as Float32Array indices the step is
  // stride*4.
  const rdiStep = ((tile.inRowStride | 0) * 4) | 0;
  const r8Step = ((tile.outRowStride | 0) * 4) | 0;
  // Float32Array indices standing in for the %rcx / %rdx byte pointers.
  let rcx = 0;
  let rdx = 0;

  // @0x29f85a cmpl $0x2,%r9d ; @0x29f85e jl 0x29f9c3 : rows narrower than 2 texels take the
  // separate width-1 loop below.
  if (r9d >= 2) {
    // @0x29f86c xorl %r10d,%r10d : r10d = the row counter.
    let r10d = 0;
    // @0x29f86f jmp 0x29f892 : enter at the row body, not at the increment block.
    for (;;) {
      // .row @0x29f892: xorl %ebx,%ebx ; xorl %r11d,%r11d
      let ebx = 0;
      let r11 = 0; // byte offset within the row; as an f32 index below, r11/4
      // .body8 @0x29f8a0 — 8 lanes = two RGBA texels per iteration.
      for (;;) {
        const ymm0 = new Float32Array(8);
        const ymm1 = new Float32Array(8);
        const ymm2 = new Float32Array(8);
        const ymm3 = new Float32Array(8);
        const ymm4 = new Float32Array(8);
        const ymm5 = new Float32Array(8);
        // @0x29f8a0 vmovups (%rcx,%r11),%ymm0
        for (let i = 0; i < 8; i++) ymm0[i] = src[rcx + (r11 >> 2) + i];
        // @0x29f8a6 vmaxps 0xb00(%rsi),%ymm0,%ymm0 : ymm0 = MAXPS(src1=ymm0, src2=State[0xb00])
        for (let i = 0; i < 8; i++) ymm0[i] = Math.fround(maxps(ymm0[i], sv(state, V_FLOOR, i)));
        // @0x29f8ae vmovups 0xa0(%rsi),%ymm1
        for (let i = 0; i < 8; i++) ymm1[i] = sv(state, V_SIGN_POS, i);
        // @0x29f8b6 vblendvps %ymm0,0x15a0(%rsi),%ymm1,%ymm1 : per lane, the SIGN BIT of ymm0
        // selects State[0x15a0]; otherwise ymm1 (State[0xa0]) is kept.
        for (let i = 0; i < 8; i++) {
          ymm1[i] = (bitsOf(ymm0[i]) & 0x80000000) !== 0 ? sv(state, V_SIGN_NEG, i) : ymm1[i];
        }
        // @0x29f8c0 vandps 0x15c0(%rsi),%ymm0,%ymm2
        for (let i = 0; i < 8; i++) ymm2[i] = andps(ymm0[i], sv(state, V_ABS_MASK, i));
        // @0x29f8c8 vminps 0xde0(%rsi),%ymm2,%ymm2 : MINPS(src1=ymm2, src2=State[0xde0])
        for (let i = 0; i < 8; i++) ymm2[i] = Math.fround(minps(ymm2[i], sv(state, V_MAG_CEIL, i)));
        // @0x29f8d0 vmulps 0x1be0(%rsi),%ymm2,%ymm3
        for (let i = 0; i < 8; i++) ymm3[i] = Math.fround(ymm2[i] * sv(state, V_C_A1, i));
        // @0x29f8d8 vaddps 0x1c00(%rsi),%ymm3,%ymm3
        for (let i = 0; i < 8; i++) ymm3[i] = Math.fround(ymm3[i] + sv(state, V_C_A0, i));
        // @0x29f8e0 vmulps %ymm2,%ymm2,%ymm4 : s = t·t
        for (let i = 0; i < 8; i++) ymm4[i] = Math.fround(ymm2[i] * ymm2[i]);
        // @0x29f8e4 vmulps 0x1c20(%rsi),%ymm2,%ymm2
        for (let i = 0; i < 8; i++) ymm2[i] = Math.fround(ymm2[i] * sv(state, V_C_B1, i));
        // @0x29f8ec vaddps 0x1c40(%rsi),%ymm2,%ymm2
        for (let i = 0; i < 8; i++) ymm2[i] = Math.fround(ymm2[i] + sv(state, V_C_B0, i));
        // @0x29f8f4 vmulps 0x1c60(%rsi),%ymm4,%ymm5
        for (let i = 0; i < 8; i++) ymm5[i] = Math.fround(ymm4[i] * sv(state, V_C_A2, i));
        // @0x29f8fc vaddps %ymm5,%ymm3,%ymm3
        for (let i = 0; i < 8; i++) ymm3[i] = Math.fround(ymm3[i] + ymm5[i]);
        // @0x29f900 vmulps %ymm3,%ymm4,%ymm3
        for (let i = 0; i < 8; i++) ymm3[i] = Math.fround(ymm4[i] * ymm3[i]);
        // @0x29f904 vaddps %ymm3,%ymm2,%ymm2
        for (let i = 0; i < 8; i++) ymm2[i] = Math.fround(ymm2[i] + ymm3[i]);
        // @0x29f908 vmulps %ymm2,%ymm4,%ymm2
        for (let i = 0; i < 8; i++) ymm2[i] = Math.fround(ymm4[i] * ymm2[i]);
        // @0x29f90c vmulps %ymm2,%ymm1,%ymm1
        for (let i = 0; i < 8; i++) ymm1[i] = Math.fround(ymm1[i] * ymm2[i]);
        // @0x29f910 vblendps $0x88,%ymm0,%ymm1,%ymm0 : lanes 3 and 7 (the two alpha channels) come
        // from ymm0, the untouched input; the other six from ymm1.
        for (let i = 0; i < 8; i++) ymm0[i] = (0x88 >> i) & 1 ? ymm0[i] : ymm1[i];
        // @0x29f916 vmovups %ymm0,(%rdx,%r11)
        for (let i = 0; i < 8; i++) dst[rdx + (r11 >> 2) + i] = ymm0[i];

        // @0x29f91c addq $0x20,%r11
        r11 = (r11 + 0x20) | 0;
        // @0x29f920 movl %ebx,%r14d ; @0x29f923 addl $-0x2,%ebx ; @0x29f926 addl %r9d,%r14d ;
        // @0x29f929 addl $-0x2,%r14d ; @0x29f92d cmpl $0x1,%r14d ; @0x29f931 jg .body8
        let r14d = ebx | 0;
        ebx = (ebx - 2) | 0;
        r14d = (r14d + r9d) | 0;
        r14d = (r14d - 2) | 0;
        if (r14d > 1) continue;
        break;
      }
      // @0x29f937 negl %ebx : ebx = 2 × (texel pairs done)
      ebx = -ebx | 0;
      // @0x29f939 cmpl %ebx,%r9d ; @0x29f93c jle 0x29f880 : flags on r9d - ebx; when the row is
      // fully covered, skip the tail and advance the row.
      if (r9d > ebx) {
        // .tail4 @0x29f942 — one trailing texel, the same computation on four lanes.
        const xmm0 = new Float32Array(4);
        const xmm1 = new Float32Array(4);
        const xmm2 = new Float32Array(4);
        const xmm3 = new Float32Array(4);
        const xmm4 = new Float32Array(4);
        const xmm5 = new Float32Array(4);
        // @0x29f942 vmovaps (%rcx,%r11),%xmm0
        for (let i = 0; i < 4; i++) xmm0[i] = src[rcx + (r11 >> 2) + i];
        // @0x29f948 vmaxps 0xb00(%rsi),%xmm0,%xmm0
        for (let i = 0; i < 4; i++) xmm0[i] = Math.fround(maxps(xmm0[i], sv(state, V_FLOOR, i)));
        // @0x29f950 vmovaps 0xa0(%rsi),%xmm1
        for (let i = 0; i < 4; i++) xmm1[i] = sv(state, V_SIGN_POS, i);
        // @0x29f958 vblendvps %xmm0,0x15a0(%rsi),%xmm1,%xmm1
        for (let i = 0; i < 4; i++) {
          xmm1[i] = (bitsOf(xmm0[i]) & 0x80000000) !== 0 ? sv(state, V_SIGN_NEG, i) : xmm1[i];
        }
        // @0x29f962 vandps 0x15c0(%rsi),%xmm0,%xmm2
        for (let i = 0; i < 4; i++) xmm2[i] = andps(xmm0[i], sv(state, V_ABS_MASK, i));
        // @0x29f96a vminps 0xde0(%rsi),%xmm2,%xmm2
        for (let i = 0; i < 4; i++) xmm2[i] = Math.fround(minps(xmm2[i], sv(state, V_MAG_CEIL, i)));
        // @0x29f972 vmulps 0x1be0(%rsi),%xmm2,%xmm3
        for (let i = 0; i < 4; i++) xmm3[i] = Math.fround(xmm2[i] * sv(state, V_C_A1, i));
        // @0x29f97a vaddps 0x1c00(%rsi),%xmm3,%xmm3
        for (let i = 0; i < 4; i++) xmm3[i] = Math.fround(xmm3[i] + sv(state, V_C_A0, i));
        // @0x29f982 vmulps %xmm2,%xmm2,%xmm4
        for (let i = 0; i < 4; i++) xmm4[i] = Math.fround(xmm2[i] * xmm2[i]);
        // @0x29f986 vmulps 0x1c20(%rsi),%xmm2,%xmm2
        for (let i = 0; i < 4; i++) xmm2[i] = Math.fround(xmm2[i] * sv(state, V_C_B1, i));
        // @0x29f98e vaddps 0x1c40(%rsi),%xmm2,%xmm2
        for (let i = 0; i < 4; i++) xmm2[i] = Math.fround(xmm2[i] + sv(state, V_C_B0, i));
        // @0x29f996 vmulps 0x1c60(%rsi),%xmm4,%xmm5
        for (let i = 0; i < 4; i++) xmm5[i] = Math.fround(xmm4[i] * sv(state, V_C_A2, i));
        // @0x29f99e vaddps %xmm5,%xmm3,%xmm3
        for (let i = 0; i < 4; i++) xmm3[i] = Math.fround(xmm3[i] + xmm5[i]);
        // @0x29f9a2 vmulps %xmm3,%xmm4,%xmm3
        for (let i = 0; i < 4; i++) xmm3[i] = Math.fround(xmm4[i] * xmm3[i]);
        // @0x29f9a6 vaddps %xmm3,%xmm2,%xmm2
        for (let i = 0; i < 4; i++) xmm2[i] = Math.fround(xmm2[i] + xmm3[i]);
        // @0x29f9aa vmulps %xmm2,%xmm4,%xmm2
        for (let i = 0; i < 4; i++) xmm2[i] = Math.fround(xmm4[i] * xmm2[i]);
        // @0x29f9ae vmulps %xmm2,%xmm1,%xmm1
        for (let i = 0; i < 4; i++) xmm1[i] = Math.fround(xmm1[i] * xmm2[i]);
        // @0x29f9b2 vblendps $0x8,%xmm0,%xmm1,%xmm0 : lane 3 (alpha) from the input.
        for (let i = 0; i < 4; i++) xmm0[i] = (0x8 >> i) & 1 ? xmm0[i] : xmm1[i];
        // @0x29f9b8 vmovaps %xmm0,(%rdx,%r11)
        for (let i = 0; i < 4; i++) dst[rdx + (r11 >> 2) + i] = xmm0[i];
        // @0x29f9be jmp 0x29f880
      }

      // .nextrow @0x29f880: incl %r10d ; addq %rdi,%rcx ; addq %r8,%rdx ; cmpl %eax,%r10d ; je end
      r10d = (r10d + 1) | 0;
      rcx = (rcx + rdiStep) | 0;
      rdx = (rdx + r8Step) | 0;
      if (r10d === eax) break;
    }
    // @0x29fa66 vzeroupper ; epilogue.
    return;
  }

  // @0x29f9c3 cmpl $0x1,%r9d ; @0x29f9c7 jne 0x29fa66 : only a width of exactly 1 reaches the
  // single-texel loop; 0 or negative returns.
  if (r9d !== 1) return;

  // .row1 @0x29f9e0 — one texel per row. Same values as the tail above, in the machine's own
  // (different) order: the two independent multiplies at @0x29f9fc/@0x29fa04 are interleaved with
  // their adds, and the sign select is deferred to @0x29fa2c/@0x29fa38.
  let eaxRows = eax;
  for (;;) {
    const xmm0 = new Float32Array(4);
    const xmm1 = new Float32Array(4);
    const xmm2 = new Float32Array(4);
    const xmm3 = new Float32Array(4);
    const xmm4 = new Float32Array(4);
    // @0x29f9e0 vmovaps (%rcx),%xmm0
    for (let i = 0; i < 4; i++) xmm0[i] = src[rcx + i];
    // @0x29f9e4 vmaxps 0xb00(%rsi),%xmm0,%xmm0
    for (let i = 0; i < 4; i++) xmm0[i] = Math.fround(maxps(xmm0[i], sv(state, V_FLOOR, i)));
    // @0x29f9ec vandps 0x15c0(%rsi),%xmm0,%xmm1
    for (let i = 0; i < 4; i++) xmm1[i] = andps(xmm0[i], sv(state, V_ABS_MASK, i));
    // @0x29f9f4 vminps 0xde0(%rsi),%xmm1,%xmm1
    for (let i = 0; i < 4; i++) xmm1[i] = Math.fround(minps(xmm1[i], sv(state, V_MAG_CEIL, i)));
    // @0x29f9fc vmulps 0x1be0(%rsi),%xmm1,%xmm2
    for (let i = 0; i < 4; i++) xmm2[i] = Math.fround(xmm1[i] * sv(state, V_C_A1, i));
    // @0x29fa04 vmulps 0x1c20(%rsi),%xmm1,%xmm3
    for (let i = 0; i < 4; i++) xmm3[i] = Math.fround(xmm1[i] * sv(state, V_C_B1, i));
    // @0x29fa0c vaddps 0x1c00(%rsi),%xmm2,%xmm2
    for (let i = 0; i < 4; i++) xmm2[i] = Math.fround(xmm2[i] + sv(state, V_C_A0, i));
    // @0x29fa14 vaddps 0x1c40(%rsi),%xmm3,%xmm3
    for (let i = 0; i < 4; i++) xmm3[i] = Math.fround(xmm3[i] + sv(state, V_C_B0, i));
    // @0x29fa1c vmulps %xmm1,%xmm1,%xmm1 : s = t·t (t is dead after this, as on the machine)
    for (let i = 0; i < 4; i++) xmm1[i] = Math.fround(xmm1[i] * xmm1[i]);
    // @0x29fa20 vmulps 0x1c60(%rsi),%xmm1,%xmm4
    for (let i = 0; i < 4; i++) xmm4[i] = Math.fround(xmm1[i] * sv(state, V_C_A2, i));
    // @0x29fa28 vaddps %xmm4,%xmm2,%xmm2
    for (let i = 0; i < 4; i++) xmm2[i] = Math.fround(xmm2[i] + xmm4[i]);
    // @0x29fa2c vmovaps 0xa0(%rsi),%xmm4
    for (let i = 0; i < 4; i++) xmm4[i] = sv(state, V_SIGN_POS, i);
    // @0x29fa34 vmulps %xmm2,%xmm1,%xmm2
    for (let i = 0; i < 4; i++) xmm2[i] = Math.fround(xmm1[i] * xmm2[i]);
    // @0x29fa38 vblendvps %xmm0,0x15a0(%rsi),%xmm4,%xmm4
    for (let i = 0; i < 4; i++) {
      xmm4[i] = (bitsOf(xmm0[i]) & 0x80000000) !== 0 ? sv(state, V_SIGN_NEG, i) : xmm4[i];
    }
    // @0x29fa42 vaddps %xmm2,%xmm3,%xmm2
    for (let i = 0; i < 4; i++) xmm2[i] = Math.fround(xmm3[i] + xmm2[i]);
    // @0x29fa46 vmulps %xmm2,%xmm1,%xmm1
    for (let i = 0; i < 4; i++) xmm1[i] = Math.fround(xmm1[i] * xmm2[i]);
    // @0x29fa4a vmulps %xmm1,%xmm4,%xmm1
    for (let i = 0; i < 4; i++) xmm1[i] = Math.fround(xmm4[i] * xmm1[i]);
    // @0x29fa4e vblendps $0x8,%xmm0,%xmm1,%xmm0 : lane 3 (alpha) from the input.
    for (let i = 0; i < 4; i++) xmm0[i] = (0x8 >> i) & 1 ? xmm0[i] : xmm1[i];
    // @0x29fa54 vmovaps %xmm0,(%rdx)
    for (let i = 0; i < 4; i++) dst[rdx + i] = xmm0[i];
    // @0x29fa58 addq %rdi,%rcx ; @0x29fa5b addq %r8,%rdx ; @0x29fa5e decl %eax ; @0x29fa60 jne
    rcx = (rcx + rdiStep) | 0;
    rdx = (rdx + r8Step) | 0;
    eaxRows = (eaxRows - 1) | 0;
    if (eaxRows === 0) break;
  }
  // @0x29fa66 vzeroupper ; @0x29fa69..@0x29fa6d epilogue ; retq (void).
}
