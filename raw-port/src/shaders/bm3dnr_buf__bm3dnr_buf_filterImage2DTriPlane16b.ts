// bm3dnr_buf__bm3dnr_buf_filterImage2DTriPlane16b.ts — direct TS mapping of
// the Metal compute kernel `bm3dnr_buf::bm3dnr_buf_filterImage2DTriPlane16b`
// from HeliumSenso.framework/Versions/A/Resources/default.metallib.
//
// @shader bm3dnr_buf::bm3dnr_buf_filterImage2DTriPlane16b (HeliumSenso)
// IR provenance: raw-port/re/shaders/bm3dnr_buf__bm3dnr_buf_filterImage2DTriPlane16b.ll
// (header line: `0x00000000024fad -- bm3dnr_buf::bm3dnr_buf_filterImage2DTriPlane16b`)
//
// The kernel applies a 3x3 separable Gaussian (1/16 corner, 1/8 edge, 1/4
// centre) to a ushort4-packed image with edge-clamped borders. The lane
// packing is the "TriPlane" shape used by the u8 sibling
// (`bm3dnr_buf__bm3dnr_buf_filterImage2DTriPlane.ts`): each output pixel's
// four lanes represent four spatially-adjacent samples, and the shader
// stitches source pixels via shufflevector to give each output lane the
// 3x3 neighbourhood it needs.
//
// This 16b variant is a direct type-substitution of the u8 sibling:
//   * loads are `<4 x i16>` (ushort4) instead of `<4 x i8>` (uchar4);
//   * i16→f32 conversion via `air.convert.f.v4f32.u.v4i16` instead of the
//     `.u.v4i8` variant (same fp32-narrowing semantics);
//   * clamp constants are `[0, 65535]` (u16 range, `6.553500e+04`) instead
//     of `[0, 255]` (u8 range);
//   * f32→i16 conversion via `air.convert.u.v4i16.f.v4f32` instead of the
//     `.u.v4i8` variant (Metal spec: round-to-nearest-even then truncate);
//   * the shufflevectors are native <4 x i16> so their pattern reads more
//     directly than the u8 version (which needed a <3 x i32> widen);
//   * everything else — including the weight constants 0.0625, 0.125,
//     0.25 — matches bit-for-bit.
//
// Signature (%N naming from the .ll):
//   void @bm3dnr_buf::bm3dnr_buf_filterImage2DTriPlane16b(
//     %params*        %0,    // params struct (6 x i32; see below)
//     <2 x i32>       %1,    // thread_position_in_grid    (gx, gy)
//     <4 x i16>*      %2,    // input   (ushort4; read-only)
//     <4 x i16>*      %3     // output  (ushort4; write)
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
//   Nine ushort4 loads (row-major, one per (yN,xN) pair):
//     v43 = in[y0*strideIn + x0]     v47 = in[y0*strideIn + gx]      v51 = in[y0*strideIn + x2]
//     v57 = in[gy*strideIn + x0]     v60 = in[gy*strideIn + gx]      v64 = in[gy*strideIn + x2]
//     v69 = in[y2*strideIn + x0]     v73 = in[y2*strideIn + gx]      v77 = in[y2*strideIn + x2]
//   Nine cross-pixel channel-shifted shuffles (see comments below):
//     v79 = [v43.w, v47.x, v47.y, v47.z]  ; %78..%79    "top-left"  plane
//     v81 = [v57.w, v60.x, v60.y, v60.z]  ; %80..%81    "mid-left"  plane
//     v83 = [v69.w, v73.x, v73.y, v73.z]  ; %82..%83    "bot-left"  plane
//     v86 = [v47.y, v47.z, v47.w, v51.x]  ; %84..%86    "top-right" plane
//     v89 = [v60.y, v60.z, v60.w, v64.x]  ; %87..%89    "mid-right" plane
//     v92 = [v73.y, v73.z, v73.w, v77.x]  ; %90..%92    "bot-right" plane
//   Convert 9 ushort4 -> float4 via air.convert.f.v4f32.u.v4i16.
//   Weighted sums (all fadd/fmul <4 x float>, %95..%112):
//     v95  = v93_f + v94_f            (top-left  + bot-left   planes)
//     v98  = v96_f + v97_f            (top       + bot        planes)
//     v101 = v99_f + v100_f           (top-right + bot-right  planes)
//     v105 = v95 + v101               (all four corner planes)
//     v106 = v105 * 0.0625            (corners weight = 1/16)
//     v107 = v98 + v102_f             (top+bot   +  left-mid  planes)
//     v108 = v107 + v104_f            (+ right-mid plane)
//     v109 = v108 * 0.125             (edges   weight = 1/8)
//     v110 = v103_f * 0.25            (center  weight = 1/4)
//     v111 = v110 + v109
//     v112 = v106 + v111              (final)
//     v113 = air.clamp(v112, 0, 65535)                        (%113)
//     v114 = air.convert.u.v4i16.f.v4f32(v113)                (%114)
//     out[gy * strideOut + gx] = v114                          (%115..%118)
//   ret void                                                    (%119)
//
// The attribute string in the .ll is `"no-trapping-math"="true"` with the
// air-compile flags `denorms_disable` and `fast_math_disable`. Only three
// air.* intrinsics are used: air.convert.f.v4f32.u.v4i16 (ushort4->float4),
// air.clamp.v4f32, and air.convert.u.v4i16.f.v4f32 (float4->ushort4). All
// three are direct TS mappings — no undecoded intrinsic remains.
//
// Constants (decoded from the IR):
//   <float 6.250000e-02, ...>   — 0.0625 = 1/16 (corner weight, %106)
//   <float 1.250000e-01, ...>   — 0.125  = 1/8  (edge weight,   %109)
//   <float 2.500000e-01, ...>   — 0.25   = 1/4  (center weight, %110)
//   <float 6.553500e+04, ...>   — 65535.0 (UINT16_MAX clamp hi, %113)
//   zeroinitializer             — 0.0    (clamp lo, %113)

export interface Bm3dnrBufFilterImage2DTriPlane16bParams {
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

// air.convert.f.v4f32.u.v4i16 — unsigned ushort4 -> float4 (values 0..65535
// as fp32; the widening to float is exact for the full u16 range).
function convertU16toF4(u: [number, number, number, number]): [number, number, number, number] {
  return [
    Math.fround(u[0] & 0xffff),
    Math.fround(u[1] & 0xffff),
    Math.fround(u[2] & 0xffff),
    Math.fround(u[3] & 0xffff),
  ];
}
// air.convert.u.v4i16.f.v4f32 — float4 -> unsigned ushort4 (Metal round-to-
// nearest-even then truncate to i16 unsigned). Callers pre-clamp to
// [0,65535] via air.clamp before this intrinsic (matching the IR ordering
// %113 -> %114), so the range is already in-domain.
function convertF4toU16(f: [number, number, number, number]): [number, number, number, number] {
  // Metal spec: `convert_ushort(x)` uses default round-to-nearest-even then
  // saturates. Round-half-to-even to match hardware exactly.
  const round = (x: number): number => {
    const r = Math.round(x);
    if (Math.abs(x - Math.trunc(x)) === 0.5) {
      const t = Math.trunc(x);
      return (t & 1) === 0 ? t : t + 1;
    }
    return r;
  };
  return [
    round(f[0]) & 0xffff,
    round(f[1]) & 0xffff,
    round(f[2]) & 0xffff,
    round(f[3]) & 0xffff,
  ];
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
 * coordinates and Uint16Array-shaped input/output buffers of packed
 * ushort4 pixels (i.e. one pixel occupies four consecutive u16 elements;
 * index-by-pixel for the getelementptr reads/writes).
 */
export function bm3dnr_buf__bm3dnr_buf_filterImage2DTriPlane16b(
  params: Bm3dnrBufFilterImage2DTriPlane16bParams,
  grid_in: [number, number],
  input: Uint16Array,   // logically <4 x i16>[]; 4 u16 elements per pixel
  output: Uint16Array,  // same layout
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

  // Load a ushort4 pixel by pixel index (each pixel is 4 u16 elements).
  const load4 = (px: number): [number, number, number, number] => {
    const b = px * 4;
    return [input[b + 0], input[b + 1], input[b + 2], input[b + 3]];
  };

  // %39..%77 : nine 3x3-stencil loads.
  //   %39 = y0*strideIn ; %40 = %39 + x0 ; %43 = in[%40]
  const v43 = load4(y0 * strideIn + x0);
  //   %44 = zext %39 ; %45 = %44 + gx ; %47 = in[%45]
  const v47 = load4(y0 * strideIn + gx);
  //   %48 = %39 + x2 ; %51 = in[%48]
  const v51 = load4(y0 * strideIn + x2);
  //   %52..%55 : gy*strideIn + x0 -> v57
  const v57 = load4(gy * strideIn + x0);
  //   %58 : gy*strideIn + gx -> v60
  const v60 = load4(gy * strideIn + gx);
  //   %61..%62 : gy*strideIn + x2 -> v64
  const v64 = load4(gy * strideIn + x2);
  //   %65..%67 : y2*strideIn + x0 -> v69
  const v69 = load4(y2 * strideIn + x0);
  //   %70..%71 : y2*strideIn + gx -> v73
  const v73 = load4(y2 * strideIn + gx);
  //   %74..%75 : y2*strideIn + x2 -> v77
  const v77 = load4(y2 * strideIn + x2);

  // Shufflevector composition — TriPlane packing (identical to u8 sibling).
  //   %78 = shuffle v43 -> <v43.w, undef, undef, undef>
  //   %79 = shuffle(%78, v47, <0,4,5,6>) = [v43.w, v47.x, v47.y, v47.z]
  const v79: [number, number, number, number] = [v43[3], v47[0], v47[1], v47[2]];
  //   %80/%81 : "mid-left" plane (v57.w, v60.x, v60.y, v60.z)
  const v81: [number, number, number, number] = [v57[3], v60[0], v60[1], v60[2]];
  //   %82/%83 : "bot-left" plane (v69.w, v73.x, v73.y, v73.z)
  const v83: [number, number, number, number] = [v69[3], v73[0], v73[1], v73[2]];
  //   %84..%86 : "top-right" plane (v47.y, v47.z, v47.w, v51.x)
  //     %84 = shuffle v47 -> <v47.y, v47.z, v47.w> (as <3 x i16>)
  //     %85 = widen to <4 x i16>
  //     %86 = shuffle(%85, v51, <0,1,2,4>)
  const v86: [number, number, number, number] = [v47[1], v47[2], v47[3], v51[0]];
  //   %87..%89 : "mid-right" plane (v60.y, v60.z, v60.w, v64.x)
  const v89: [number, number, number, number] = [v60[1], v60[2], v60[3], v64[0]];
  //   %90..%92 : "bot-right" plane (v73.y, v73.z, v73.w, v77.x)
  const v92: [number, number, number, number] = [v73[1], v73[2], v73[3], v77[0]];

  // %93..%104 : convert ushort4 -> float4 for the six "corner" planes plus the
  //             top-center and bot-center pixels used verbatim.
  const v93_f  = convertU16toF4(v79);   // top-left  (%93 = convert %79)
  const v94_f  = convertU16toF4(v83);   // bot-left  (%94 = convert %83)
  const v96_f  = convertU16toF4(v47);   // top-center (%96 = convert %47, no shift)
  const v97_f  = convertU16toF4(v73);   // bot-center (%97 = convert %73, no shift)
  const v99_f  = convertU16toF4(v86);   // top-right (%99 = convert %86)
  const v100_f = convertU16toF4(v92);   // bot-right (%100 = convert %92)
  const v102_f = convertU16toF4(v81);   // mid-left  (%102 = convert %81)
  const v103_f = convertU16toF4(v60);   // center    (%103 = convert %60, no shift)
  const v104_f = convertU16toF4(v89);   // mid-right (%104 = convert %89)

  // %95  = fadd v93, v94                 (top-left + bot-left)
  const v95 = vAdd(v93_f, v94_f);
  // %98  = fadd v96, v97                 (top      + bot)
  const v98 = vAdd(v96_f, v97_f);
  // %101 = fadd v99, v100                (top-right + bot-right)
  const v101 = vAdd(v99_f, v100_f);
  // %105 = fadd v95, v101                (all 4 corners)
  const v105 = vAdd(v95, v101);
  // %106 = fmul v105, 0.0625             (corner weight 1/16 — IEEE-754 exact)
  const v106 = vScale(v105, Math.fround(0.0625));
  // %107 = fadd v98, v102                (top + bot + mid-left)
  const v107 = vAdd(v98, v102_f);
  // %108 = fadd v107, v104               (+ mid-right)
  const v108 = vAdd(v107, v104_f);
  // %109 = fmul v108, 0.125              (edge weight 1/8 — IEEE-754 exact)
  const v109 = vScale(v108, Math.fround(0.125));
  // %110 = fmul v103, 0.25               (center weight 1/4 — IEEE-754 exact)
  const v110 = vScale(v103_f, Math.fround(0.25));
  // %111 = fadd v110, v109
  const v111 = vAdd(v110, v109);
  // %112 = fadd v106, v111               (final float4 result)
  const v112 = vAdd(v106, v111);

  // %113 = air.clamp.v4f32(v112, 0, 65535)
  const v113 = clampV4(v112, 0, 65535);
  // %114 = air.convert.u.v4i16.f.v4f32(v113)
  const v114 = convertF4toU16(v113);

  // %115..%118 : output[gy * strideOut + gx] = v114
  const outPx = gy * strideOut + gx;
  const ob = outPx * 4;
  output[ob + 0] = v114[0];
  output[ob + 1] = v114[1];
  output[ob + 2] = v114[2];
  output[ob + 3] = v114[3];
  // %119 : ret void
}
