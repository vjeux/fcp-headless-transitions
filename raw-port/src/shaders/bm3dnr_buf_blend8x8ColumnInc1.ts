// @shader bm3dnr_buf::bm3dnr_buf_blend8x8ColumnInc1 (HeliumSenso)
//
// Metal compute kernel from HeliumSenso.framework/Versions/A/Resources/default.metallib
// (BM3D denoiser buffer helper — column blend of an 8×1 float scratch
//  strip with per-lane weights from a small weight table). IR at
//  raw-port/re/shaders/bm3dnr_buf_blend8x8ColumnInc1.ll (header @0x0000000000bd7d).
//
// Direct TS mapping of the AIR IR. Params struct (metadata !18):
//   [0] strideInOut     (dst/src scalar float buffer row stride)
//   [1] strideIn        (src <4 x float> `inNum` buffer row stride)
//   [2] stepInc         (dst BLOCK stride — see below)
//   [3] offsetX         (integer shift added to gid.x for the dst base col)
//   [4] globalWidth     (bound on gid.x)
//   [5] globalHeight    (bound on gid.y)
//
// Buffers:
//   %2 = inOut         float*         scalar float scratch (READ-MODIFY-WRITE:
//                                     8 floats loaded at [base..base+6],
//                                     then 9 floats stored at [base..base+8])
//   %3 = inNum         <4 x float>*   4 consecutive <4 x float> tiles
//   %4 = weightBuffer  <4 x float>*   2 consecutive <4 x float> weights,
//                                     addressed by `((gid.y<<1) & 14)` and
//                                     `((gid.y<<1) & 14) | 1`
//   %1 = gid           <2 x i32>      thread position in grid
//
// Kernel logic (direct TS mapping):
//
//   1. bounds check gid.x < globalWidth and gid.y < globalHeight — else no-op
//
//   2. compute dst base index into inOut:
//        colBaseDst = strideInOut * gid.y                (%31,%32)
//        dstBlkOrig = (stepInc << 1) * (offsetX + gid.x) (%27,%28,%29)
//        baseDst    = dstBlkOrig + colBaseDst            (%33)
//      (stepInc<<1 = stepInc*2, matches IR %28 = shl stepInc,1 — note
//       this differs from the 4x4Column kernel which used shl 3.)
//
//   3. load 7 scalar floats from inOut and pack them into TWO <4 x float>
//      accumulator vectors (the IR does this via `insertelement` sequences):
//        L0 = <inOut[base+0], inOut[base+1], inOut[base+2], inOut[base+3]>   (%36,%40,%44,%48)
//        L1 = <inOut[base+4], inOut[base+5], inOut[base+6], 0.0>              (%52,%56,%60)
//      IR spells L1 as `<undef, undef, undef, 0.0>` splatted then filled
//      via insertelement — lane 3 is initialized to 0.0 explicitly so
//      the final store never reads uninitialized data. We express L1
//      with lane 3 = 0 verbatim.
//
//   4. compute src base index into inNum and load 4 tiles:
//        srcBlkOrig = gid.x * 4                        (%30 = shl gidX, 2)
//        srcRowBase = strideIn * gid.y                 (%61,%62)
//        baseSrc    = srcBlkOrig + srcRowBase          (%63)
//        for k in 0..3: N[k] = inNum[baseSrc + k]       (%65,%68,%71,%74)
//
//   5. compute weight base index into weightBuffer and load 2 weights:
//        wIdx0 = (gid.y << 1) & 14                     (%76)
//        wIdx1 = wIdx0 | 1                             (%80 — equivalent
//                                                       to wIdx0 + 1
//                                                       since wIdx0 has
//                                                       bit0 = 0 by mask)
//        W0 = weightBuffer[wIdx0]                      (%79)
//        W1 = weightBuffer[wIdx1]                      (%83)
//
//   6. weighted product of tiles by weights, then vector-add with the
//      accumulators (only 2 of the 4 muls feed into fadds; the other 2
//      contribute lane-extracts for the seam sums):
//        P0 = N[0] * W0                                (%84 = fmul)
//        P1 = N[1] * W1                                (%85 = fmul)
//        P2 = N[2] * W0                                (%86 = fmul)
//        P3 = N[3] * W1                                (%87 = fmul)
//        A0 = L0 + P0                                  (%88 = fadd <4xf>)
//        A1 = L1 + P1                                  (%89 = fadd <4xf>)
//
//   7. compute six inter-tile seam sums (lane N of A0/A1 + lane N-1 of
//      the next-tile product P2/P3):
//        s0 = P2.x + A0.y                              (%92 = fadd f)
//        s1 = P2.y + A0.z                              (%95)
//        s2 = P2.z + A0.w                              (%98)
//        s3 = P2.w + A1.x                              (%101)
//        s4 = P3.x + A1.y                              (%104)
//        s5 = P3.y + A1.z                              (%107)
//        s6 = P3.z + A1.w                              (%110)
//
//   8. write 9 scalar floats to inOut starting at baseDst:
//        offset 0: A0.x                                (%111 -> store @%34)
//        offset 1: s0                                  (store @%38)
//        offset 2: s1                                  (store @%42)
//        offset 3: s2                                  (store @%46)
//        offset 4: s3                                  (store @%50)
//        offset 5: s4                                  (store @%54)
//        offset 6: s5                                  (store @%58)
//        offset 7: s6                                  (store @%113)
//        offset 8: P3.w                                (%114 -> store @%116)
//
// The 9-scalar output is:
//   [A0.x, s0, s1, s2, s3, s4, s5, s6, P3.w]
// = [L0.x+P0.x,
//    P2.x + L0.y+P0.y,
//    P2.y + L0.z+P0.z,
//    P2.z + L0.w+P0.w,
//    P2.w + L1.x+P1.x,
//    P3.x + L1.y+P1.y,
//    P3.y + L1.z+P1.z,
//    P3.z + L1.w+P1.w,   (L1.w = 0)
//    P3.w]
// — a linear "column-wise" accumulation of 4 weighted tiles into a
// 9-float destination strip.
//
// Faithful transcription — every IR op maps to a direct TS operation.
// fp32-narrowed everywhere the AIR type is <4 x float> / .f32.

/**
 * Params struct addressed at `%0` (six i32 fields). Names from metadata
 * !18 in the IR:
 *   [0] strideInOut     (float-buffer row stride)
 *   [1] strideIn        (<4 x float>-buffer row stride)
 *   [2] stepInc         (dst BLOCK stride — multiplied by 2 in the IR
 *                        (`shl 1`) and then by the destination base
 *                        column (offsetX + gid.x); see @%28)
 *   [3] offsetX         (signed shift added to gid.x for the dst base)
 *   [4] globalWidth     (bound on gid.x)
 *   [5] globalHeight    (bound on gid.y)
 *
 * @shader bm3dnr_buf::bm3dnr_buf_blend8x8ColumnInc1 (HeliumSenso)
 * @see %7   (field4 = globalWidth)
 * @see %12  (field5 = globalHeight)
 * @see %16  (field0 = strideInOut)
 * @see %18  (field1 = strideIn)
 * @see %20  (field2 = stepInc)
 * @see %22  (field3 = offsetX)
 */
export interface Bm3dnrBufBlend8x8ColumnInc1Params {
  strideInOut: number;
  strideIn: number;
  stepInc: number;
  offsetX: number;
  globalWidth: number;
  globalHeight: number;
}

/** `<4 x float>` load lane. */
export type Float4 = readonly [number, number, number, number];

/**
 * Read-only accessor for the `<4 x float>` source buffers `inNum` and
 * `weightBuffer`. Indexed by linear `<4 x float>` element index.
 */
export interface Float4Buffer {
  load(index: number): Float4;
}

/**
 * Read-write accessor for the scalar `float` destination buffer `inOut`.
 * Indexed by linear scalar-float element index.
 */
export interface Float1Buffer {
  load(index: number): number;
  store(index: number, value: number): void;
}

/**
 * Per-lane `fmul <4 x float>` (@%84, %85, %86, %87). fp32-narrowed.
 */
function fmulV4(a: Float4, b: Float4): Float4 {
  return [
    Math.fround(a[0] * b[0]),
    Math.fround(a[1] * b[1]),
    Math.fround(a[2] * b[2]),
    Math.fround(a[3] * b[3]),
  ];
}

/**
 * Per-lane `fadd <4 x float>` (@%88, %89). fp32-narrowed.
 */
function faddV4(a: Float4, b: Float4): Float4 {
  return [
    Math.fround(a[0] + b[0]),
    Math.fround(a[1] + b[1]),
    Math.fround(a[2] + b[2]),
    Math.fround(a[3] + b[3]),
  ];
}

/**
 * `bm3dnr_buf::bm3dnr_buf_blend8x8ColumnInc1` — column blend of an 8×1
 * float scratch strip with per-lane weights, producing 9 scalar float
 * outputs per thread.
 *
 * Per grid thread `(gid.x, gid.y)`: reads 7 scalars from `inOut`, 4
 * `<4 x float>` tiles from `inNum`, and 2 `<4 x float>` weights from
 * `weightBuffer`; combines them via per-lane fmul+fadd and lane-extract
 * seam sums; writes 9 scalars back to `inOut`.
 *
 * @shader bm3dnr_buf::bm3dnr_buf_blend8x8ColumnInc1 (HeliumSenso)
 * @see %5    entry
 * @see %9    icmp ult gid.x, globalWidth
 * @see %14   icmp ult gid.y, globalHeight
 * @see %24   offsetX + gid.x
 * @see %28   shl stepInc, 1 (stepInc * 2)
 * @see %33   dst base index
 * @see %35..%60  seven scalar dst loads packed into L0 (lanes 0..3) and L1 (lanes 0..2), L1.w = 0
 * @see %63   src base index for inNum
 * @see %65..%74  four <4 x float> N[0..3] loads
 * @see %76   (gid.y << 1) & 14  weight index base
 * @see %79/%83  W0, W1 weight loads
 * @see %84..%87 four fmul <4 x float>
 * @see %88/%89 two fadd <4 x float>
 * @see %92..%110 seven seam-sum fadds
 * @see %111..%116 nine scalar dst stores
 * @see %117  ret void
 */
export function bm3dnr_buf_blend8x8ColumnInc1(
  params: Bm3dnrBufBlend8x8ColumnInc1Params,
  gid: readonly [number, number],
  inOut: Float1Buffer,
  inNum: Float4Buffer,
  weightBuffer: Float4Buffer,
): void {
  // %6 = extractelement gid, 0   (gid.x)
  const gidX = gid[0];
  // %7,%8 = load field4 (globalWidth)
  const globalWidth = params.globalWidth;
  // %9 = icmp ult gid.x, globalWidth
  if (!(gidX >>> 0 < globalWidth >>> 0)) {
    return;
  }

  // %11 = extractelement gid, 1  (gid.y)
  const gidY = gid[1];
  // %12,%13 = load field5 (globalHeight)
  const globalHeight = params.globalHeight;
  // %14 = icmp ult gid.y, globalHeight
  if (!(gidY >>> 0 < globalHeight >>> 0)) {
    return;
  }

  // %16,%17 = load field0 (strideInOut)
  // %18,%19 = load field1 (strideIn)
  // %20,%21 = load field2 (stepInc)
  // %22,%23 = load field3 (offsetX)
  const strideInOut = params.strideInOut;
  const strideIn = params.strideIn;
  const stepInc = params.stepInc;
  const offsetX = params.offsetX;

  // %24 = add offsetX, gid.x     (dst base column)
  const dstBaseCol = (offsetX + gidX) | 0;
  // %28 = shl stepInc, 1  = stepInc * 2   (dst block stride)
  const dstBlockStride = (stepInc << 1) | 0;
  // %29 = mul (stepInc<<1), dstBaseCol   (dst block origin)
  const dstBlockOrigin = Math.imul(dstBlockStride, dstBaseCol) | 0;
  // %30 = shl gid.x, 2   = gid.x * 4   (src block stride into inNum)
  const srcBlockOrigin = (gidX << 2) | 0;

  // %31,%32 = mul strideInOut, gid.y   (dst row col base)
  const dstRowColBase = Math.imul(strideInOut, gidY) | 0;
  // %33 = add dstBlockOrigin, dstRowColBase   (baseDst)
  const baseDst = (dstBlockOrigin + dstRowColBase) | 0;

  // ─── 7 scalar loads from inOut → pack into L0 and L1 ──────────────
  //   %35 = inOut[base+0] ; %36 = insertelement <undef>, s0, lane 0
  //   %39 = inOut[base+1] ; %40 = insertelement L0, s1, lane 1
  //   %43 = inOut[base+2] ; %44 = insertelement L0, s2, lane 2
  //   %47 = inOut[base+3] ; %48 = insertelement L0, s3, lane 3
  //   %51 = inOut[base+4] ; %52 = insertelement <undef,undef,undef,0.0>, s4, lane 0
  //   %55 = inOut[base+5] ; %56 = insertelement L1, s5, lane 1
  //   %59 = inOut[base+6] ; %60 = insertelement L1, s6, lane 2
  //   (L1 lane 3 is the fixed 0.0 from the splat constant at %52.)
  const s0 = inOut.load(baseDst);
  const s1 = inOut.load((baseDst + 1) | 0);
  const s2 = inOut.load((baseDst + 2) | 0);
  const s3 = inOut.load((baseDst + 3) | 0);
  const s4 = inOut.load((baseDst + 4) | 0);
  const s5 = inOut.load((baseDst + 5) | 0);
  const s6 = inOut.load((baseDst + 6) | 0);
  const L0: Float4 = [s0, s1, s2, s3];
  const L1: Float4 = [s4, s5, s6, 0.0];

  // ─── 4 <4 x float> tile loads from inNum ──────────────────────────
  //   %61,%62 = mul strideIn, gid.y   (src row col base)
  //   %63 = add srcBlockOrigin, srcRowColBase   (baseSrc)
  //   for k in 0..3: N[k] = inNum[baseSrc + k]
  const srcRowColBase = Math.imul(strideIn, gidY) | 0;
  const baseSrc = (srcBlockOrigin + srcRowColBase) | 0;
  const N0 = inNum.load(baseSrc);
  const N1 = inNum.load((baseSrc + 1) | 0);
  const N2 = inNum.load((baseSrc + 2) | 0);
  const N3 = inNum.load((baseSrc + 3) | 0);

  // ─── 2 weight loads from weightBuffer ─────────────────────────────
  //   %75 = shl gid.y, 1
  //   %76 = and %75, 14
  //   %80 = or %76, 1   (== %76 + 1, since low bit of %76 is 0)
  //   W0 = weightBuffer[%76]
  //   W1 = weightBuffer[%80]
  const wIdx0 = ((gidY << 1) & 14) >>> 0;
  const wIdx1 = (wIdx0 | 1) >>> 0;
  const W0 = weightBuffer.load(wIdx0);
  const W1 = weightBuffer.load(wIdx1);

  // ─── 4 fmuls and 2 fadds ──────────────────────────────────────────
  const P0 = fmulV4(N0, W0); // %84
  const P1 = fmulV4(N1, W1); // %85
  const P2 = fmulV4(N2, W0); // %86
  const P3 = fmulV4(N3, W1); // %87
  const A0 = faddV4(L0, P0); // %88
  const A1 = faddV4(L1, P1); // %89

  // ─── 7 seam sums (each is a single-lane fadd f32) ─────────────────
  // %90 = A0.y ; %91 = P2.x ; %92 = fadd → seam s0'
  // %93 = A0.z ; %94 = P2.y ; %95 = fadd → seam s1'
  // %96 = A0.w ; %97 = P2.z ; %98 = fadd → seam s2'
  // %99 = A1.x ; %100= P2.w ; %101= fadd → seam s3'
  // %102= A1.y ; %103= P3.x ; %104= fadd → seam s4'
  // %105= A1.z ; %106= P3.y ; %107= fadd → seam s5'
  // %108= A1.w ; %109= P3.z ; %110= fadd → seam s6'
  const seam0 = Math.fround(P2[0] + A0[1]);
  const seam1 = Math.fround(P2[1] + A0[2]);
  const seam2 = Math.fround(P2[2] + A0[3]);
  const seam3 = Math.fround(P2[3] + A1[0]);
  const seam4 = Math.fround(P3[0] + A1[1]);
  const seam5 = Math.fround(P3[1] + A1[2]);
  const seam6 = Math.fround(P3[2] + A1[3]);

  // ─── 9 scalar stores back to inOut ────────────────────────────────
  //   offset 0: A0.x     (%111 extractelement A0, lane 0 → store @%34)
  //   offset 1: seam0    (%92  → store @%38)
  //   offset 2: seam1    (%95  → store @%42)
  //   offset 3: seam2    (%98  → store @%46)
  //   offset 4: seam3    (%101 → store @%50)
  //   offset 5: seam4    (%104 → store @%54)
  //   offset 6: seam5    (%107 → store @%58)
  //   offset 7: seam6    (%110 → store @%113 — GEP baseDst+7)
  //   offset 8: P3.w     (%114 → store @%116 — GEP baseDst+8)
  inOut.store(baseDst, A0[0]);
  inOut.store((baseDst + 1) | 0, seam0);
  inOut.store((baseDst + 2) | 0, seam1);
  inOut.store((baseDst + 3) | 0, seam2);
  inOut.store((baseDst + 4) | 0, seam3);
  inOut.store((baseDst + 5) | 0, seam4);
  inOut.store((baseDst + 6) | 0, seam5);
  inOut.store((baseDst + 7) | 0, seam6);
  inOut.store((baseDst + 8) | 0, P3[3]);

  // %117 = ret void
}
