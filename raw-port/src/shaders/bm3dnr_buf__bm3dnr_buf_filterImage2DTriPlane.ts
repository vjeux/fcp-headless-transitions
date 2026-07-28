// bm3dnr_buf__bm3dnr_buf_filterImage2DTriPlane.ts — direct TS mapping of the
// Metal compute kernel `bm3dnr_buf::bm3dnr_buf_filterImage2DTriPlane` from
// HeliumSenso.framework/Versions/A/Resources/default.metallib.
//
// @shader bm3dnr_buf::bm3dnr_buf_filterImage2DTriPlane (HeliumSenso)
// IR provenance: raw-port/re/shaders/bm3dnr_buf__bm3dnr_buf_filterImage2DTriPlane.ll
// (header line: `0x000000000262dd -- bm3dnr_buf::bm3dnr_buf_filterImage2DTriPlane`)
//
// The kernel applies a 3x3 separable Gaussian to a uchar4-packed image with
// edge-clamped borders, but the packing is unusual: each output pixel's four
// lanes represent four spatially-adjacent samples. To produce the four output
// values in a single vec4, the shader stitches source pixels via shufflevector:
//   - the "left" plane reuses the previous-column lane 3 as lane 0 (so the
//     four output lanes see samples shifted one channel to the left);
//   - the "right" plane reuses the next-column lane 0 as lane 3 (shift right);
//   - the "center" plane is the source pixel verbatim.
// This lets 3 packed uchar4 loads per row cover 6 logical samples, giving the
// 3x3 neighbourhood needed for a 1/16 - 1/8 - 1/16 stencil. Hence "TriPlane".
//
// Stencil weights per lane:
//   corners       (top-left, top-right, bot-left, bot-right)   1/16 each
//   edges         (top,  bottom,  left,  right)                1/8  each
//   center                                                     1/4
//   sum                                                        1
//
// Signature (%N naming from the .ll):
//   void @bm3dnr_buf::bm3dnr_buf_filterImage2DTriPlane(
//     %params*      %0,  // params struct (6 x i32; see below)
//     <2 x i32>     %1,  // thread_position_in_grid    (gx, gy)
//     <4 x i8>*     %2,  // input   (uchar4; read-only)
//     <4 x i8>*     %3   // output  (uchar4; write)
//   )
//
// Params struct layout (from !18 in the .ll):
//   uint m_strideIn       @0   -> %16
//   uint m_strideOut      @4   -> %18
//   uint m_width          @8   -> %20   (edge-clamp: x_right = width  - 1)
//   uint m_height         @12  -> %22   (edge-clamp: y_bot   = height - 1)
//   uint m_globalWidth    @16  -> %7    (bound check on gx = %5)
//   uint m_globalHeight   @20  -> %12   (bound check on gy = %10)
//
// Semantics recovered from the AIR (block ids from the .ll):
//   %4 -> %9 -> %14 -> %119 (ret)
//     if (gx >= globalWidth)  return;                            // %8   unsigned-lt
//     if (gy >= globalHeight) return;                            // %13  unsigned-lt
//     // Edge-clamped neighbour indices (unsigned):
//     x0 = (gx == 0)       ? 0            : gx - 1;              // %25..%27
//     y0 = (gy == 0)       ? 0            : gy - 1;              // %28..%30
//     x2 = (gx < width -1) ? gx + 1       : width  - 1;          // %32..%34
//     y2 = (gy < height-1) ? gy + 1       : height - 1;          // %36..%38
//   Nine uchar4 loads (row-major, one per (yN,xN) pair):
//     v43 = in[y0*strideIn + x0]      v47 = in[y0*strideIn + gx]      v51 = in[y0*strideIn + x2]
//     v57 = in[gy*strideIn + x0]      v60 = in[gy*strideIn + gx]      v64 = in[gy*strideIn + x2]
//     v69 = in[y2*strideIn + x0]      v73 = in[y2*strideIn + gx]      v77 = in[y2*strideIn + x2]
//   Nine cross-pixel channel-shifted shuffles (see comments below).
//   Convert 9 uchar4 -> float4 via air.convert.f.v4f32.u.v4i8.
//   Sums:
//     v95  = v79_f + v83_f            (top-left  + bot-left   planes)
//     v98  = v47_f + v73_f            (top       + bot        planes)
//     v101 = v86_f + v92_f            (top-right + bot-right  planes)
//     v105 = v95 + v101               (all four corner planes)
//     v106 = v105 * 0.0625            (corners weight = 1/16)
//     v107 = v98 + v102_f             (top+bot   +  left-mid  planes)
//     v108 = v107 + v104_f            (+ right-mid plane)
//     v109 = v108 * 0.125             (edges   weight = 1/8)
//     v110 = v103_f * 0.25            (center  weight = 1/4)
//     v111 = v110 + v109
//     v112 = v106 + v111              (final)
//     v113 = clamp(v112, 0, 255)      (air.clamp.v4f32)
//     v114 = convert v113 -> uchar4   (air.convert.u.v4i8.f.v4f32)
//     out[gy * strideOut + gx] = v114
//
// The attribute string in the .ll is `"no-trapping-math"="true"` with the
// air-compile flags `denorms_disable` and `fast_math_disable`. Only three
// air.* intrinsics are used: air.convert.f.v4f32.u.v4i8 (uchar4->float4),
// air.clamp.v4f32, and air.convert.u.v4i8.f.v4f32 (float4->uchar4). All
// three are direct TS mappings — no undecoded intrinsic remains.

export interface Bm3dnrBufFilterImage2DTriPlaneParams {
  m_strideIn: number;     // uint @0
  m_strideOut: number;    // uint @4
  m_width: number;        // uint @8
  m_height: number;       // uint @12
  m_globalWidth: number;  // uint @16
  m_globalHeight: number; // uint @20
}

// Reference float32 addition — mirrors AIR's f32 fadd.
function fadd(a: number, b: number): number {
  return Math.fround(Math.fround(a) + Math.fround(b));
}
// Reference float32 multiplication — mirrors AIR's f32 fmul.
function fmul(a: number, b: number): number {
  return Math.fround(Math.fround(a) * Math.fround(b));
}

// air.convert.f.v4f32.u.v4i8 — unsigned uchar4 -> float4 (values 0..255 as fp32).
function convertU4toF4(u: [number, number, number, number]): [number, number, number, number] {
  return [
    Math.fround(u[0] & 0xff),
    Math.fround(u[1] & 0xff),
    Math.fround(u[2] & 0xff),
    Math.fround(u[3] & 0xff),
  ];
}
// air.convert.u.v4i8.f.v4f32 — float4 -> unsigned uchar4 (Metal round-to-nearest-even
// + truncation to i8 unsigned). Callers pre-clamp to [0,255] via air.clamp before
// this intrinsic, matching the IR ordering %113 -> %114.
function convertF4toU4(f: [number, number, number, number]): [number, number, number, number] {
  // Metal spec: `convert_uchar(x)` uses default rte rounding and saturates elsewhere,
  // but the .ll pre-clamps to [0,255] so the range is already in-domain. Round-to-nearest-even.
  const round = (x: number): number => {
    const r = Math.round(x);
    // Fix rounding ties: Math.round rounds .5 up; Metal uses round-half-to-even.
    if (Math.abs(x - Math.trunc(x)) === 0.5) {
      const t = Math.trunc(x);
      return (t & 1) === 0 ? t : t + 1;
    }
    return r;
  };
  return [round(f[0]) & 0xff, round(f[1]) & 0xff, round(f[2]) & 0xff, round(f[3]) & 0xff];
}
// air.clamp.v4f32(x, lo, hi) — lane-wise clamp.
function clampV4(x: [number, number, number, number], lo: number, hi: number): [number, number, number, number] {
  const c = (v: number): number => Math.fround(Math.min(Math.max(v, lo), hi));
  return [c(x[0]), c(x[1]), c(x[2]), c(x[3])];
}

// Vec4 helpers to keep the AIR lane-arithmetic obvious.
function vAdd(a: [number, number, number, number], b: [number, number, number, number]): [number, number, number, number] {
  return [fadd(a[0], b[0]), fadd(a[1], b[1]), fadd(a[2], b[2]), fadd(a[3], b[3])];
}
function vScale(a: [number, number, number, number], s: number): [number, number, number, number] {
  return [fmul(a[0], s), fmul(a[1], s), fmul(a[2], s), fmul(a[3], s)];
}

/**
 * Direct TS mapping of the AIR kernel body. Callers supply the two grid
 * coordinates and Uint8Array-shaped input/output buffers of packed uchar4
 * pixels (i.e. one pixel occupies four consecutive bytes; index-by-pixel
 * for the getelementptr reads/writes).
 */
export function bm3dnr_buf__bm3dnr_buf_filterImage2DTriPlane(
  params: Bm3dnrBufFilterImage2DTriPlaneParams,
  grid_in: [number, number],
  input: Uint8Array,   // logically <4 x i8>[]; 4 bytes per pixel
  output: Uint8Array,  // same layout
): void {
  // %5, %10 : gx, gy
  const gx = grid_in[0] >>> 0;
  const gy = grid_in[1] >>> 0;
  // %6..%8 : if (gx >= m_globalWidth) return
  if (gx >= (params.m_globalWidth >>> 0)) return;
  // %11..%13 : if (gy >= m_globalHeight) return
  if (gy >= (params.m_globalHeight >>> 0)) return;

  // %16, %18, %20, %22
  const strideIn = params.m_strideIn >>> 0;
  const strideOut = params.m_strideOut >>> 0;
  const width = params.m_width >>> 0;
  const height = params.m_height >>> 0;

  // Edge-clamped neighbour indices (unsigned):
  // %25..%27 : x0 = (gx == 0) ? 0 : gx - 1
  const x0 = (gx === 0) ? 0 : (gx - 1);
  // %28..%30 : y0 = (gy == 0) ? 0 : gy - 1
  const y0 = (gy === 0) ? 0 : (gy - 1);
  // %31..%34 : x2 = (gx < width  - 1) ? gx + 1 : width  - 1
  const x2 = (gx < (width - 1) >>> 0) ? (gx + 1) : (width - 1);
  // %35..%38 : y2 = (gy < height - 1) ? gy + 1 : height - 1
  const y2 = (gy < (height - 1) >>> 0) ? (gy + 1) : (height - 1);

  // Load a uchar4 pixel by pixel index (each pixel is 4 bytes).
  const load4 = (px: number): [number, number, number, number] => {
    const b = px * 4;
    return [input[b + 0], input[b + 1], input[b + 2], input[b + 3]];
  };

  // %39..%77 : nine 3x3-stencil loads.
  // %39 = y0*strideIn ; %40 = %39 + x0 ; %43 = in[%40]
  const v43 = load4(y0 * strideIn + x0);
  // %44 = zext %39 ; %45 = %44 + gx ; %47 = in[%45]
  const v47 = load4(y0 * strideIn + gx);
  // %48 = %39 + x2 ; %51 = in[%48]
  const v51 = load4(y0 * strideIn + x2);
  // %52..%55 : gy*strideIn + x0 -> v57
  const v57 = load4(gy * strideIn + x0);
  // %58 : gy*strideIn + gx -> v60
  const v60 = load4(gy * strideIn + gx);
  // %61..%62 : gy*strideIn + x2 -> v64
  const v64 = load4(gy * strideIn + x2);
  // %65..%67 : y2*strideIn + x0 -> v69
  const v69 = load4(y2 * strideIn + x0);
  // %70..%71 : y2*strideIn + gx -> v73
  const v73 = load4(y2 * strideIn + gx);
  // %74..%75 : y2*strideIn + x2 -> v77
  const v77 = load4(y2 * strideIn + x2);

  // Shufflevector composition — see header comment on the "TriPlane" packing.
  // %78 = shuffle v43 -> <v43.w, undef, undef, undef> ;
  // %79 = shuffle(%78, v47, <0,4,5,6>) = [v43.w, v47.x, v47.y, v47.z]
  //   -> "top-left" plane: lane N reads column x-1..x+2 stagger, top row.
  const v79: [number, number, number, number] = [v43[3], v47[0], v47[1], v47[2]];
  // %80 = shuffle v57 -> <v57.w, u, u, u> ; %81 = shuffle(%80, v60, <0,4,5,6>)
  //   -> "mid-left" plane
  const v81: [number, number, number, number] = [v57[3], v60[0], v60[1], v60[2]];
  // %82 = shuffle v69 -> <v69.w, u, u, u> ; %83 = shuffle(%82, v73, <0,4,5,6>)
  //   -> "bot-left" plane
  const v83: [number, number, number, number] = [v69[3], v73[0], v73[1], v73[2]];

  // %84 = shuffle v47 -> <v47.y, v47.z, v47.w, undef> (i32 shuffle mask <1,2,3>)
  // %85 = %84 widened to <4 x i8> (lane 3 undef)
  // %86 = shuffle(%85, v51, <0,1,2,4>) = [v47.y, v47.z, v47.w, v51.x]
  //   -> "top-right" plane
  const v86: [number, number, number, number] = [v47[1], v47[2], v47[3], v51[0]];
  // %87..%89 : same pattern (v60 / v64) -> "mid-right" plane
  const v89: [number, number, number, number] = [v60[1], v60[2], v60[3], v64[0]];
  // %90..%92 : same pattern (v73 / v77) -> "bot-right" plane
  const v92: [number, number, number, number] = [v73[1], v73[2], v73[3], v77[0]];

  // %93..%97 : convert uchar4 -> float4 for the six "corner" planes plus the
  //            top-center and bot-center pixels used verbatim.
  const v93_f  = convertU4toF4(v79);   // top-left
  const v94_f  = convertU4toF4(v83);   // bot-left
  const v96_f  = convertU4toF4(v47);   // top-center (no shift)
  const v97_f  = convertU4toF4(v73);   // bot-center (no shift)
  const v99_f  = convertU4toF4(v86);   // top-right
  const v100_f = convertU4toF4(v92);   // bot-right
  const v102_f = convertU4toF4(v81);   // mid-left
  const v103_f = convertU4toF4(v60);   // center (no shift)
  const v104_f = convertU4toF4(v89);   // mid-right

  // %95  = fadd v93, v94                 (top-left + bot-left)
  const v95 = vAdd(v93_f, v94_f);
  // %98  = fadd v96, v97                 (top      + bot)
  const v98 = vAdd(v96_f, v97_f);
  // %101 = fadd v99, v100                (top-right + bot-right)
  const v101 = vAdd(v99_f, v100_f);
  // %105 = fadd v95, v101                (all 4 corners)
  const v105 = vAdd(v95, v101);
  // %106 = fmul v105, 0.0625             (corner weight 1/16 -- IEEE-754 exact)
  const v106 = vScale(v105, Math.fround(0.0625));
  // %107 = fadd v98, v102                (top + bot + mid-left)
  const v107 = vAdd(v98, v102_f);
  // %108 = fadd v107, v104               (+ mid-right)
  const v108 = vAdd(v107, v104_f);
  // %109 = fmul v108, 0.125              (edge weight 1/8 -- IEEE-754 exact)
  const v109 = vScale(v108, Math.fround(0.125));
  // %110 = fmul v103, 0.25               (center weight 1/4 -- IEEE-754 exact)
  const v110 = vScale(v103_f, Math.fround(0.25));
  // %111 = fadd v110, v109
  const v111 = vAdd(v110, v109);
  // %112 = fadd v106, v111               (final float4 result)
  const v112 = vAdd(v106, v111);

  // %113 = air.clamp.v4f32(v112, 0, 255)
  const v113 = clampV4(v112, 0, 255);
  // %114 = air.convert.u.v4i8.f.v4f32(v113)
  const v114 = convertF4toU4(v113);

  // %115..%118 : output[gy * strideOut + gx] = v114
  const outPx = gy * strideOut + gx;
  const ob = outPx * 4;
  output[ob + 0] = v114[0];
  output[ob + 1] = v114[1];
  output[ob + 2] = v114[2];
  output[ob + 3] = v114[3];
}
