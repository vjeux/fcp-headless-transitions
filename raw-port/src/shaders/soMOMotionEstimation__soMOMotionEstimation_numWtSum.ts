// soMOMotionEstimation__soMOMotionEstimation_numWtSum.ts — direct TS mapping
// of the Metal compute kernel `soMOMotionEstimation::soMOMotionEstimation_numWtSum`
// from HeliumSenso.framework/Versions/A/Resources/default.metallib.
//
// @shader soMOMotionEstimation::soMOMotionEstimation_numWtSum (HeliumSenso) @0x000000000dbafd
// IR provenance: raw-port/re/shaders/soMOMotionEstimation__soMOMotionEstimation_numWtSum.ll
// (header: `0x000000000dbafd -- soMOMotionEstimation::soMOMotionEstimation_numWtSum`)
//
// Per-ROW accumulator kernel for FCP's motion-estimation label-consistency
// pass. Each dispatched thread processes ONE ROW of the input (thread grid
// is 1-D over image height); it walks the entire row's columns, and for
// pixels whose matte label equals `m_label` accumulates three counters
// against a per-row entry of a global int4 buffer `numPt`:
//   numPt[row] = int4( n_label_match, n_warp_in_bounds, n_weight_above_thresh, 0 )
//
// The transform mapping the source (cx, ry) pixel to a warped destination
// (wx, wy) depends on `m_order` (values 0, 1, 2 select three progressively
// richer parameterisations); an out-of-switch value writes zeros.
//
// -----------------------------------------------------------------------------
// Signature (%N naming from the .ll):
//   void @soMOMotionEstimation::soMOMotionEstimation_numWtSum(
//     %params*                   %0,   // params buffer  (see struct !18)
//     <2 x i32>                  %1,   // thread_position_in_grid (idx0=row, idx1 unused)
//     texture2d<float, sample>   %2,   // weight   (float RGBA; we only read .r)
//     texture2d<uint,  sample>   %3,   // matte    (uint4;      we only read .r)
//     <4 x i32>*                 %4    // numPt    (device buffer, one int4 per row)
//   )
//
// Denorms / fast-math state (from !air.compile_options !11..!13):
//   air.compile.denorms_disable
//   air.compile.fast_math_disable
//   air.compile.framebuffer_fetch_enable
// (Fast-math is DISABLED — use plain fp32 ops via Math.fround; fmuladd is
// modeled as `Math.fround(a * b + c)` per the SHADERS.md guidance.)
//
// -----------------------------------------------------------------------------
// Params struct layout (from !18 in the .ll):
//   i32   m_order      @  0    field  0   (switch dispatch — 0, 1, 2, else 0-write)
//   f32   m_xg         @  4    field  1   (x-gradient centre; only used in orders 1 and 2)
//   f32   m_yg         @  8    field  2   (y-gradient centre)
//   f32   m_threshold  @ 12    field  3   (weight threshold for hit counter)
//   u32   m_label      @ 16    field  4   (target matte label)
//   f32   m_tx         @ 20    field  5   (x-translation)
//   f32   m_ty         @ 24    field  6   (y-translation)
//   f32   m_a          @ 28    field  7
//   f32   m_b          @ 32    field  8
//   f32   m_c          @ 36    field  9
//   f32   m_d          @ 40    field 10
//   f32   m_q1         @ 44    field 11   (order-2 quadratic terms)
//   f32   m_q2         @ 48    field 12
//   f32   m_q3         @ 52    field 13
//   f32   m_q4         @ 56    field 14
//   f32   m_q5         @ 60    field 15
//   f32   m_q6         @ 64    field 16
//
// Sampler state (@__air_sampler_state, !23): raw 64-bit descriptor
// 0x8080000000000000 (signed i64 = -9188470239253725184). The kernel
// samples both textures at the same pixel-centred UV
// (cx + 0.5, ry + 0.5), which under the standard pixel-space
// nearest-neighbour + clamp-to-edge sampler returns the integer pixel
// (cx, ry). The JS `sampleFloat` / `sampleUint` callbacks below model
// that.
//
// -----------------------------------------------------------------------------
// Order 2 (%13 .. %105) — full affine + quadratic warp
//   dy    = float(ry) - m_yg                     ; %17
//   dy2   = dy * dy                              ; %18
//   dyB   = dy * m_b                             ; %21
//   dyD   = dy * m_d                             ; %24
//   ryPlusTy = float(ry) + m_ty                   ; %27
//   for cx in 0..width-1:                        ; loop %43
//     if matte(cx, ry).r != m_label: continue    ; %55
//     dx  = float(cx) - m_xg                     ; %58
//     dx2 = dx * dx                              ; %59
//     dxB = dx * m_b                             ; %60         (NOTE: reuses m_b)
//     wx  = float(cx) + fmuladd(dy, m_c, m_tx)
//                     +           m_b * dx
//                     + fmuladd(dx2, m_q1, ...)
//                     + fmuladd(dxB, m_q2, ...)
//                     + fmuladd(dy2, m_q3, ...)
//                                                 ; %64..%72
//     if fp32->i32(wx) < 0: continue              ; %73/%74
//     wy  = float(ry) + fmuladd(dx,  m_c, m_ty)  ; wait — see IR: this branch uses
//                                                 ; different fields; walk below.
//                                                 ;
//     Actually per IR %75..%84 (order-2 wy path):
//       wy = fmuladd(dy2, m_q6, ryPlusTy + dyD
//                                    + fmuladd(dx, m_c, 0)   ; = m_c * dx via %80
//                                    + fmuladd(dx2, m_q5, ..)
//                                    + fmuladd(dxB, m_q4, ..))
//     if fp32->i32(wy) < 0 or wx >= W or wy >= H: continue  ; %86..%90
//     if weight(cx,ry).r > m_threshold: hit_thresh += 1     ; %93..%99
//     inside_count += 1
//   label_count += 1
//
// Order 1 (%106 .. %177) — affine warp
//   dy    = float(ry) - m_yg                     ; %110
//   dyB   = dy * m_b                             ; %113
//   dyD   = dy * m_d                             ; %116
//   ryPlusTy = float(ry) + m_ty                   ; %119
//   for cx in 0..width-1:                        ; loop %129
//     if matte(cx, ry).r != m_label: continue
//     dx  = float(cx) - m_xg                     ; %144
//     wx  = float(cx) + fmuladd(dx, m_c, m_tx) + dyB   ; %146..%150  (m_c reused as x-shear-of-x)
//     if fp32->i32(wx) < 0: continue
//     wy  = float(ry) + fmuladd(dx, m_a, m_ty) + dyD   ; %154..%156  (m_a as x-shear-of-y)
//     if fp32->i32(wy) < 0 || wx >= W || wy >= H: continue
//     if weight(cx,ry).r > m_threshold: hit_thresh += 1
//     inside_count += 1
//   label_count += 1
//
// Order 0 (%178 .. %229) — translation only
//   ryPlusTy = m_ty + float(ry)                   ; %182
//   for cx in 0..width-1:                        ; loop %189
//     if matte(cx, ry).r != m_label: continue
//     wx = float(cx) + m_tx                       ; %205
//     if fp32->i32(wx) < 0: continue
//     wy = fp32->i32(ryPlusTy)                    ; %209
//     if wy < 0 || wx >= W || wy >= H: continue
//     if weight(cx,ry).r > m_threshold: hit_thresh += 1
//     inside_count += 1
//   label_count += 1
//
// Store (label 230):
//   numPt[row] = int4(label_count, hit_thresh, inside_count, 0)
//     - lane 0 = %233 = label_count       (# label matches in the row)
//     - lane 1 = %231 = hit_thresh        (# warped-in-bounds pixels whose weight > threshold)
//     - lane 2 = %232 = inside_count      (# warped-in-bounds pixels)
//     - lane 3 = 0                        (constant, %230 poison-slot pre-inserted)
//
// (The three phi lanes at %230 pick the {0,0,0} defaults when the switch
// fell through to `default`, or when the row was empty [width <= 0], or
// when the switch hit an unknown order.)

/**
 * Uniform buffer for `soMOMotionEstimation::soMOMotionEstimation_numWtSum`
 * — struct layout matches !18 (17 fields, i32 + 16 x f32/i32 in field
 * order; TS uses number for every scalar).
 */
export interface SoMOMotionEstimationNumWtSumParams {
  /** field  0 — i32 `m_order`     (switch dispatch: 0, 1, 2; other → zeros). */
  readonly order: number;
  /** field  1 — f32 `m_xg`. */
  readonly xg: number;
  /** field  2 — f32 `m_yg`. */
  readonly yg: number;
  /** field  3 — f32 `m_threshold`. */
  readonly threshold: number;
  /** field  4 — u32 `m_label`     (matte label to match). */
  readonly label: number;
  /** field  5 — f32 `m_tx`. */
  readonly tx: number;
  /** field  6 — f32 `m_ty`. */
  readonly ty: number;
  /** field  7 — f32 `m_a`. */
  readonly a: number;
  /** field  8 — f32 `m_b`. */
  readonly b: number;
  /** field  9 — f32 `m_c`. */
  readonly c: number;
  /** field 10 — f32 `m_d`. */
  readonly d: number;
  /** field 11 — f32 `m_q1`. */
  readonly q1: number;
  /** field 12 — f32 `m_q2`. */
  readonly q2: number;
  /** field 13 — f32 `m_q3`. */
  readonly q3: number;
  /** field 14 — f32 `m_q4`. */
  readonly q4: number;
  /** field 15 — f32 `m_q5`. */
  readonly q5: number;
  /** field 16 — f32 `m_q6`. */
  readonly q6: number;
}

/**
 * AIR `air.sample_texture_2d.v4f32` callback — nearest-neighbour +
 * clamp-to-edge in pixel-space (module sampler @__air_sampler_state).
 */
export type SampleFloatFn<T> = (texture: T, u: number, v: number) => [number, number, number, number];

/**
 * AIR `air.sample_texture_2d.u.v4i32` callback — same sampler as above,
 * uint-texture variant. Returns u32-valued lane numbers.
 */
export type SampleUintFn<T> = (texture: T, u: number, v: number) => [number, number, number, number];

/** AIR `air.get_width_texture_2d(tex, i32 0)` callback. */
export type TexWidthFn<T> = (texture: T) => number;

/** AIR `air.get_height_texture_2d(tex, i32 0)` callback. */
export type TexHeightFn<T> = (texture: T) => number;

/**
 * AIR `air.convert.s.i32.f.f32(x)` — truncate a f32 to a signed i32.
 * Corresponds to the AIR "signed float->int cast" (round toward zero).
 * The .s. suffix is the SIGNED variant (see SHADERS.md convert.f trap).
 */
function convertSI32FF32(x: number): number {
  return Math.trunc(x) | 0;
}

/** AIR `llvm.fmuladd.f32(a, b, c)` — fp32 fused multiply-add (fast-math OFF here, so
 *  we do the plain single-rounded fp32 sequence `fround(a*b + c)`). */
function fmuladd_f32(a: number, b: number, c: number): number {
  return Math.fround(Math.fround(Math.fround(a) * Math.fround(b)) + Math.fround(c));
}

/**
 * Compute kernel `soMOMotionEstimation::soMOMotionEstimation_numWtSum`.
 *
 * @param params        Uniform buffer (%0).
 * @param gridPos       Thread position in grid — element 0 is the ROW index
 *                      being processed (%6); element 1 is unused by the kernel.
 * @param weight        `texture2d<float, sample>` — %2 (only .r is read).
 * @param matte         `texture2d<uint,  sample>` — %3 (only .r is read).
 * @param numPt         `int4*` device buffer, one entry per row — %4.
 * @param sampleFloat   AIR `air.sample_texture_2d.v4f32` callback.
 * @param sampleUint    AIR `air.sample_texture_2d.u.v4i32` callback.
 * @param getWidth      AIR `air.get_width_texture_2d(weight, 0)` callback.
 * @param getHeight     AIR `air.get_height_texture_2d(weight, 0)` callback.
 *
 * @shader soMOMotionEstimation::soMOMotionEstimation_numWtSum (HeliumSenso)
 */
export function soMOMotionEstimation__soMOMotionEstimation_numWtSum<TWeight, TMatte>(
  params: SoMOMotionEstimationNumWtSumParams, // %0
  gridPos: readonly [number, number],          // %1
  weight: TWeight,                              // %2
  matte: TMatte,                                // %3
  numPt: [number, number, number, number][],   // %4 — device int4 buffer
  sampleFloat: SampleFloatFn<TWeight>,
  sampleUint: SampleUintFn<TMatte>,
  getWidth: TexWidthFn<TWeight>,
  getHeight: TexHeightFn<TWeight>,
): void {
  const ry = gridPos[0] | 0; // %6 (row index)

  // %7 = get_width(weight), %8 = get_height(weight); %9 = icmp slt ry, height
  const W = getWidth(weight) | 0;
  const H = getHeight(weight) | 0;
  if (!(ry < H)) return; // br %9 -> %239 ret

  // Default store lanes (used by unknown-order and empty-row paths); see %230 phi.
  let labelCount = 0;   // %233 (numPt.x)
  let hitThresh  = 0;   // %231 (numPt.y)
  let insideCount = 0;  // %232 (numPt.z)

  // %11 = load %0.m_order ; switch %12
  const order = params.order | 0;

  if (order === 2) {
    // Order-2 branch (%13 .. %105).
    // %14 = float(ry)
    const fRy = Math.fround(ry);
    // %16 = m_yg ; %17 = float(ry) - m_yg
    const dy  = Math.fround(fRy - Math.fround(params.yg));
    // %18 = dy * dy
    const dy2 = Math.fround(dy * dy);
    // %20 = m_b ; %21 = dy * m_b
    const dyB = Math.fround(dy * Math.fround(params.b));
    // %23 = m_d ; %24 = dy * m_d
    const dyD = Math.fround(dy * Math.fround(params.d));
    // %26 = m_ty ; %27 = float(ry) + m_ty
    const ryPlusTy = Math.fround(fRy + Math.fround(params.ty));
    // %28 = icmp sgt %7, 0  — empty-row guard
    if (W > 0) {
      // %31 = m_label
      const labelId = params.label >>> 0;

      // Inner loop over cx (label %43 -> %100). Phi accumulators:
      //   %44 = label match count      (labelCount)
      //   %45 = warped-in-bounds count (insideCount)
      //   %46 = hit-threshold count    (hitThresh)
      //   %47 = cx
      for (let cx = 0; cx < W; cx++) {
        // %48 = float(cx)
        const fCx = Math.fround(cx);
        // uv = (float(cx) + 0.5, float(ry) + 0.5)
        const u = Math.fround(fCx + Math.fround(0.5));
        const v = Math.fround(fRy + Math.fround(0.5));
        // %52 = matte.u.v4i32 sample ; %54 = extractelement lane 0
        const matteR = sampleUint(matte, u, v)[0] >>> 0;
        // %55 = icmp eq %54, m_label
        if (matteR !== labelId) continue;

        // ---- matched-label path (%56 .. %99) ----
        // %57 = m_xg
        const xg  = Math.fround(params.xg);
        // %58 = float(cx) - m_xg
        const dx  = Math.fround(fCx - xg);
        // %59 = dx * dx
        const dx2 = Math.fround(dx * dx);
        // %60 = fmul %17 (dy), %58 (dx)  =>  dy * dx
        const dyDx = Math.fround(dy * dx);
        // %61 = labelCount + 1  (deferred to end of iter; matches phi ordering)
        //
        // ---- build wx (%62..%72) ----
        //   %62 = m_tx
        //   %63 = m_a
        //   %64 = fmuladd(dx, m_a, m_tx)
        //   %65 = dyB + %64                       ; %21 dyB (= dy * m_b) + %64
        //   %66 = m_q1
        //   %67 = fmuladd(dx2, m_q1, %65)
        //   %68 = m_q2
        //   %69 = fmuladd(dyDx, m_q2, %67)         ; %60 dy*dx * m_q2 + %67
        //   %70 = m_q3
        //   %71 = fmuladd(dy2, m_q3, %69)
        //   %72 = float(cx) + %71
        const wxAcc0 = fmuladd_f32(dx, Math.fround(params.a), Math.fround(params.tx));
        const wxAcc1 = Math.fround(dyB + wxAcc0);
        const wxAcc2 = fmuladd_f32(dx2, Math.fround(params.q1), wxAcc1);
        const wxAcc3 = fmuladd_f32(dyDx, Math.fround(params.q2), wxAcc2);
        const wxAcc4 = fmuladd_f32(dy2, Math.fround(params.q3), wxAcc3);
        const wxF    = Math.fround(fCx + wxAcc4);

        // %73 = fp32->i32 (signed) wx ; %74 = icmp sgt wxI, -1
        const wxI = convertSI32FF32(wxF);
        labelCount = (labelCount + 1) | 0; // %61 in IR (folded into loop tail phi)
        if (wxI < 0) continue; // fall through to %100 with %61 committed, others unchanged

        // ---- build wy (%75..%84) ----
        // IR body (verbatim, %76..%84):
        //   %76 = load m_q6        (field 16)
        //   %77 = load m_q5        (field 15)
        //   %78 = load m_q4        (field 14)
        //   %79 = load m_c         (field  9)
        //   %80 = fmuladd(dx,   m_c=%79, ryPlusTy=%27)
        //   %81 = fadd  dyD=%24, %80
        //   %82 = fmuladd(dx2,  m_q4=%78, %81)
        //   %83 = fmuladd(dyDx, m_q5=%77, %82)
        //   %84 = fmuladd(dy2,  m_q6=%76, %83)
        const wyAcc0 = fmuladd_f32(dx, Math.fround(params.c), ryPlusTy);
        const wyAcc1 = Math.fround(dyD + wyAcc0);
        const wyAcc2 = fmuladd_f32(dx2, Math.fround(params.q4), wyAcc1);
        const wyAcc3 = fmuladd_f32(dyDx, Math.fround(params.q5), wyAcc2);
        const wyF    = fmuladd_f32(dy2, Math.fround(params.q6), wyAcc3);

        // %85 = fp32->i32 wy
        const wyI = convertSI32FF32(wyF);
        // %86..%90 bounds: (wxI < W) && (wyI > -1) && (wyI < H)
        const inX = wxI < W;
        const wyPos = wyI > -1;
        const step1 = inX ? wyPos : false;        // %88 select
        const inY = wyI < H;
        const step2 = step1 ? inY : false;         // %90 select
        if (!step2) continue;

        // ---- inside-bounds path (%91..%99) ----
        insideCount = (insideCount + 1) | 0;       // %92
        // %93 = sample weight.v4f32 ; %95 = extractelement lane 0
        const wR = sampleFloat(weight, u, v)[0];
        // %96 = m_threshold ; %97 = fcmp ogt wR, thr
        if (Math.fround(wR) > Math.fround(params.threshold)) {
          hitThresh = (hitThresh + 1) | 0;         // %99
        }
      }
    }
  } else if (order === 1) {
    // Order-1 branch (%106 .. %177).
    // %107 = float(ry)
    const fRy = Math.fround(ry);
    // %109 = m_yg ; %110 = float(ry) - m_yg
    const dy  = Math.fround(fRy - Math.fround(params.yg));
    // %112 = m_b ; %113 = dy * m_b
    const dyB = Math.fround(dy * Math.fround(params.b));
    // %115 = m_d ; %116 = dy * m_d
    const dyD = Math.fround(dy * Math.fround(params.d));
    // %118 = m_ty ; %119 = float(ry) + m_ty
    const ryPlusTy = Math.fround(fRy + Math.fround(params.ty));

    if (W > 0) {
      // %123 = m_label
      const labelId = params.label >>> 0;

      // Inner loop %129 -> %172. Phi accumulators:
      //   %130 = labelCount, %131 = insideCount, %132 = hitThresh, %133 = cx
      for (let cx = 0; cx < W; cx++) {
        // %134 = float(cx)
        const fCx = Math.fround(cx);
        // uv = (fCx + 0.5, fRy + 0.5)
        const u = Math.fround(fCx + Math.fround(0.5));
        const v = Math.fround(fRy + Math.fround(0.5));
        // %138 sample matte ; %140 extract lane 0
        const matteR = sampleUint(matte, u, v)[0] >>> 0;
        // %141 = icmp eq matteR, m_label
        if (matteR !== labelId) continue;

        // ---- matched-label path (%142..%171) ----
        // %143 = m_xg ; %144 = fCx - m_xg
        const dx = Math.fround(fCx - Math.fround(params.xg));
        // %145 = labelCount + 1 (folded into loop tail)
        labelCount = (labelCount + 1) | 0;

        // Build wx: %146..%150
        //   %146 = m_tx ; %147 = m_a ; %148 = fmuladd(dx, m_a, m_tx)
        //   %149 = dyB + %148       ; %150 = float(cx) + %149
        const wxAcc = fmuladd_f32(dx, Math.fround(params.a), Math.fround(params.tx));
        const wxF   = Math.fround(fCx + Math.fround(dyB + wxAcc));

        // %151 = fp32->i32 wx ; %152 = icmp sgt wxI, -1
        const wxI = convertSI32FF32(wxF);
        if (wxI < 0) continue;

        // Build wy: %153..%156
        //   %154 = m_c ; %155 = fmuladd(dx, m_c, %119=ryPlusTy) ; %156 = dyD + %155
        //
        // Note: order-1 wy uses `m_c` (field 9) — this is the IR-observed field
        // (compare to order-2 which uses fields q4/q5/q6 additively). Cited
        // directly from IR line %154.
        const wyAcc = fmuladd_f32(dx, Math.fround(params.c), ryPlusTy);
        const wyF   = Math.fround(dyD + wyAcc);

        // %157 = fp32->i32 wy ; %158..%162 bounds
        const wyI = convertSI32FF32(wyF);
        const inX = wxI < W;
        const wyPos = wyI > -1;
        const step1 = inX ? wyPos : false;         // %160
        const inY = wyI < H;
        const step2 = step1 ? inY : false;          // %162
        if (!step2) continue;

        // ---- inside path (%163..%171) ----
        insideCount = (insideCount + 1) | 0;        // %164
        // %165 sample weight ; %167 lane 0
        const wR = sampleFloat(weight, u, v)[0];
        // %168 = m_threshold ; %169 = fcmp ogt wR, thr
        if (Math.fround(wR) > Math.fround(params.threshold)) {
          hitThresh = (hitThresh + 1) | 0;          // %171
        }
      }
    }
  } else if (order === 0) {
    // Order-0 branch (%178 .. %229).
    // %180 = m_ty ; %181 = float(ry) ; %182 = m_ty + float(ry) = ryPlusTy
    const fRy = Math.fround(ry);
    const ryPlusTy = Math.fround(Math.fround(params.ty) + fRy);

    if (W > 0) {
      // %186 = m_label
      const labelId = params.label >>> 0;

      // Inner loop %189 -> %224. Phi accumulators:
      //   %190 = labelCount, %191 = insideCount, %192 = hitThresh, %193 = cx
      for (let cx = 0; cx < W; cx++) {
        // %194 = float(cx)
        const fCx = Math.fround(cx);
        // uv = (fCx + 0.5, fRy + 0.5)
        const u = Math.fround(fCx + Math.fround(0.5));
        const v = Math.fround(fRy + Math.fround(0.5));
        // %198 sample matte ; %200 lane 0
        const matteR = sampleUint(matte, u, v)[0] >>> 0;
        // %201 = icmp eq matteR, m_label
        if (matteR !== labelId) continue;

        // ---- matched (%202..%223) ----
        labelCount = (labelCount + 1) | 0;          // %203
        // %204 = m_tx ; %205 = fCx + m_tx
        const wxF = Math.fround(fCx + Math.fround(params.tx));
        // %206 = fp32->i32 wx ; %207 = sgt -1
        const wxI = convertSI32FF32(wxF);
        if (wxI < 0) continue;

        // %209 = fp32->i32 (ryPlusTy)  (m_ty already folded into ryPlusTy)
        const wyI = convertSI32FF32(ryPlusTy);
        // %210..%214 bounds: (wxI < W) && (wyI > -1) && (wyI < H)
        const inX = wxI < W;
        const wyPos = wyI > -1;
        const step1 = inX ? wyPos : false;
        const inY = wyI < H;
        const step2 = step1 ? inY : false;
        if (!step2) continue;

        // ---- inside (%215..%223) ----
        insideCount = (insideCount + 1) | 0;        // %216
        const wR = sampleFloat(weight, u, v)[0];
        if (Math.fround(wR) > Math.fround(params.threshold)) {
          hitThresh = (hitThresh + 1) | 0;          // %223
        }
      }
    }
  }
  // else: unknown order — fall through to label %230 with zeros.

  // Store block (label %230):
  //   %234 = insertelement <undef,undef,undef,0>, labelCount, 0
  //   %235 = insertelement %234, hitThresh,    1
  //   %236 = insertelement %235, insideCount,  2
  //   %237 = sext ry to i64 ; %238 = &numPt[ry]
  //   store <4 x i32> %236, %238
  numPt[ry] = [labelCount | 0, hitThresh | 0, insideCount | 0, 0];
  // br label %239 ; ret void
}
