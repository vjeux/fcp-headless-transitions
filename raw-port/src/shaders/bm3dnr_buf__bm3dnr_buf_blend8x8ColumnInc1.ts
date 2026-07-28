// bm3dnr_buf__bm3dnr_buf_blend8x8ColumnInc1.ts — direct TS mapping of the
// Metal compute kernel `bm3dnr_buf::bm3dnr_buf_blend8x8ColumnInc1` from
// HeliumSenso.framework/Versions/A/Resources/default.metallib.
//
// @shader bm3dnr_buf::bm3dnr_buf_blend8x8ColumnInc1 (HeliumSenso)
// IR provenance: raw-port/re/shaders/bm3dnr_buf__bm3dnr_buf_blend8x8ColumnInc1.ll
// (header line: `0x0000000000bd7d -- bm3dnr_buf::bm3dnr_buf_blend8x8ColumnInc1`)
//
// This is the stride-1 variant of the 8x8 column-blend accumulator used by
// the BM3D-style denoiser. For a single (gx,gy) grid position it reads 7
// scalar floats from `inOut`, 4 float4 vectors from `inNum`, and 2 float4
// weight vectors from `weightBuffer`, computes 8 pair-wise fused updates,
// and stores 9 scalar floats back into `inOut`. The Inc1 suffix refers to
// the step increment `m_stepInc` @+8 in the params struct — it is loaded
// but only used as a byte-count for the address arithmetic (%23 -> %28 ->
// %29). Unlike the Inc3 sibling (which produces 17 scalars from 8 inNum
// vectors), this variant halves the load/store counts.
//
// Signature (%N naming from the .ll):
//   void @bm3dnr_buf::bm3dnr_buf_blend8x8ColumnInc1(
//     %params*         %0,  // params struct (6 x i32; see below)
//     <2 x i32>        %1,  // thread_position_in_grid    (gx, gy)
//     float*           %2,  // inOut          (float ; both read + write)
//     <4 x float>*     %3,  // inNum          (float4; read-only per-invocation)
//     <4 x float>*     %4   // weightBuffer   (float4; read-only per-invocation)
//   )
//
// Params struct layout (from !18 in the .ll):
//   i32  m_strideInOut     @0   -> %17
//   i32  m_strideIn        @4   -> %19
//   i32  m_stepInc         @8   -> %21
//   i32  m_offsetX         @12  -> %23
//   uint m_globalWidth     @16  -> %8    (bound check on gx = %6)
//   uint m_globalHeight    @20  -> %13   (bound check on gy = %11)
//
// Semantics recovered from the AIR (block ids from the .ll):
//   %5 -> %10 -> %15 -> %117 (ret)
//     if (gx >= globalWidth)  return;                            // %9  unsigned-lt
//     if (gy >= globalHeight) return;                            // %14 unsigned-lt
//     // Base offsets:
//     colX      = m_offsetX + gx                                 // %24
//     stepScale = (i64)m_stepInc << 1                            // %28 (stepInc * 2)
//     inOutBase = stepScale * (u64)colX + (i64)m_strideInOut * (u64)gy   // %33
//     inNumBase = (u64)colX * 4        + (i64)m_strideIn    * (u64)gy   // %63
//     weightIdx0 = (gy * 2) & 14                                 // %76
//     weightIdx1 = weightIdx0 | 1                                // %80
//   Load-block:
//     inOut[base+0..3] -> v48 = [inOut[+0], inOut[+1], inOut[+2], inOut[+3]]  // %35..%48
//     inOut[base+4..6] -> v60 = [inOut[+4], inOut[+5], inOut[+6], 0]         // %51..%60
//       (per the IR the fourth lane starts as the constant 0.0 from
//        `<float undef, float undef, float undef, float 0.000000e+00>` at %52;
//        the first three lanes are then filled from inOut[base+4..+6].)
//     inNum[inNumBase + 0..3]                                    // %65, %68, %71, %74
//     weight[weightIdx0], weight[weightIdx1]                     // %79, %83
//   Compute (4 lane-wise vec4 fmul + 2 vec4 fadd + 7 scalar fadd):
//     v84 = fmul v65, v79        v85 = fmul v68, v83
//     v86 = fmul v71, v79        v87 = fmul v74, v83
//     v88 = fadd v48, v84        v89 = fadd v60, v85
//     v92 = v86.x + v88.y        (%91 + %90)
//     v95 = v86.y + v88.z        (%94 + %93)
//     v98 = v86.z + v88.w        (%97 + %96)
//     v101 = v86.w + v89.x       (%100 + %99)
//     v104 = v87.x + v89.y       (%103 + %102)
//     v107 = v87.y + v89.z       (%106 + %105)
//     v110 = v87.z + v89.w       (%109 + %108)
//   Store (9 scalar float stores into inOut at base+{0..8}):
//     inOut[base+0] = v88.x    (%111)
//     inOut[base+1] = v92
//     inOut[base+2] = v95
//     inOut[base+3] = v98
//     inOut[base+4] = v101
//     inOut[base+5] = v104
//     inOut[base+6] = v107
//     inOut[base+7] = v110     (address = base + 7  via %112)
//     inOut[base+8] = v87.w    (%114 -> %115 gepi at base+8)
//
// The attribute string in the .ll is `"no-trapping-math"="true"` with the
// air-compile flags `denorms_disable` and `fast_math_disable`. The kernel
// uses only plain fmul/fadd on <4 x float> and scalar float — direct TS
// mapping via Math.fround on every fp32 op. No air.* intrinsics are used.

export interface Bm3dnrBufBlend8x8ColumnInc1Params {
  m_strideInOut: number;   // int  @0
  m_strideIn: number;      // int  @4
  m_stepInc: number;       // int  @8
  m_offsetX: number;       // int  @12
  m_globalWidth: number;   // uint @16
  m_globalHeight: number;  // uint @20
}

// Reference float32 addition — mirrors AIR's f32 fadd.
function fadd(a: number, b: number): number {
  return Math.fround(Math.fround(a) + Math.fround(b));
}

// Reference float32 multiplication — mirrors AIR's f32 fmul.
function fmul(a: number, b: number): number {
  return Math.fround(Math.fround(a) * Math.fround(b));
}

/**
 * Direct TS mapping of the AIR kernel body. Callers supply the two grid
 * coordinates and typed-array-shaped buffers; the function performs the
 * bound checks, load/compute/store block, and returns.
 *
 * `inNum` and `weightBuffer` are indexed by float4-vector index (i.e. one
 * step advances 16 bytes / 4 floats). `inOut` is a plain float32 buffer
 * indexed by scalar float count.
 */
export function bm3dnr_buf__bm3dnr_buf_blend8x8ColumnInc1(
  params: Bm3dnrBufBlend8x8ColumnInc1Params,
  grid_in: [number, number],
  inOut: Float32Array,
  inNum: Float32Array,       // logically <4 x float>[] laid out flat: 4 floats per vector
  weightBuffer: Float32Array, // same layout
): void {
  // %6, %11 : gx, gy
  const gx = grid_in[0] >>> 0;
  const gy = grid_in[1] >>> 0;
  // %7..%9 : if (gx >= m_globalWidth) return
  if (gx >= (params.m_globalWidth >>> 0)) return;
  // %12..%14 : if (gy >= m_globalHeight) return
  if (gy >= (params.m_globalHeight >>> 0)) return;

  // %17 : m_strideInOut     (i32)
  const strideInOut = params.m_strideInOut | 0;
  // %19 : m_strideIn        (i32)
  const strideIn = params.m_strideIn | 0;
  // %21 : m_stepInc         (i32) — used as the vertical step multiplier for inOut
  const stepInc = params.m_stepInc | 0;
  // %23 : m_offsetX         (i32) — added to gx before indexing
  const offsetX = params.m_offsetX | 0;

  // %24 : colX = m_offsetX + gx
  const colX = (offsetX + gx) | 0;
  // %25, %26 : zext to i64  (JS numbers already carry that)
  // %27 : sext m_stepInc to i64
  // %28 : stepScale = stepInc << 1  (stepInc * 2 in scalar-float units for inOut indexing)
  // %29 : inOutRow = stepScale * colX
  //       In the IR, inOut is `float*` so the getelementptr already scales by
  //       sizeof(float)=4. Here we index Float32Array by scalar float count and
  //       replay stepScale directly as a float-index stride per column.
  const inOutRow = (stepInc * 2) * colX;
  // %30 : shl nuw nsw i64 %25, 2  -> colX << 2 = colX * 4  (float4-vector index into inNum)
  const inNumColBase = colX * 4;
  // %31, %32 : sext m_strideIn to i64, mul by gy  -> row offset in inNum vector units
  const inNumRow = strideIn * gy;
  // %33 : inOutBase = inOutRow + strideInOut * gy   (scalar-float index into inOut)
  const inOutBase = inOutRow + strideInOut * gy;
  // %63 : inNumBase = inNumColBase + inNumRow       (vector index into inNum)
  const inNumBase = inNumColBase + inNumRow;

  // %75, %76 : weightIdx0 = (gy << 1) & 14   -> picks pairings across gy%8
  const weightIdx0 = ((gy << 1) & 14) >>> 0;
  // %80 : weightIdx1 = weightIdx0 | 1
  const weightIdx1 = (weightIdx0 | 1) >>> 0;

  // ---- LOADS ----
  // %35..%48 : v48 = [inOut[base+0..3]]
  const v48_0 = Math.fround(inOut[inOutBase + 0]);
  const v48_1 = Math.fround(inOut[inOutBase + 1]);
  const v48_2 = Math.fround(inOut[inOutBase + 2]);
  const v48_3 = Math.fround(inOut[inOutBase + 3]);
  // %51..%60 : v60 = [inOut[base+4], inOut[base+5], inOut[base+6], 0.0]
  //   Note lane 3 originates from the IR constant `<float undef,undef,undef,0.0>`
  //   at the insertelement chain %52..%60; lanes 0..2 are then loaded.
  const v60_0 = Math.fround(inOut[inOutBase + 4]);
  const v60_1 = Math.fround(inOut[inOutBase + 5]);
  const v60_2 = Math.fround(inOut[inOutBase + 6]);
  const v60_3 = 0;

  // %65 : v65 = inNum[inNumBase + 0]  (float4)
  const b65 = (inNumBase + 0) * 4;
  const v65_0 = Math.fround(inNum[b65 + 0]);
  const v65_1 = Math.fround(inNum[b65 + 1]);
  const v65_2 = Math.fround(inNum[b65 + 2]);
  const v65_3 = Math.fround(inNum[b65 + 3]);
  // %68 : v68 = inNum[inNumBase + 1]
  const b68 = (inNumBase + 1) * 4;
  const v68_0 = Math.fround(inNum[b68 + 0]);
  const v68_1 = Math.fround(inNum[b68 + 1]);
  const v68_2 = Math.fround(inNum[b68 + 2]);
  const v68_3 = Math.fround(inNum[b68 + 3]);
  // %71 : v71 = inNum[inNumBase + 2]
  const b71 = (inNumBase + 2) * 4;
  const v71_0 = Math.fround(inNum[b71 + 0]);
  const v71_1 = Math.fround(inNum[b71 + 1]);
  const v71_2 = Math.fround(inNum[b71 + 2]);
  const v71_3 = Math.fround(inNum[b71 + 3]);
  // %74 : v74 = inNum[inNumBase + 3]
  const b74 = (inNumBase + 3) * 4;
  const v74_0 = Math.fround(inNum[b74 + 0]);
  const v74_1 = Math.fround(inNum[b74 + 1]);
  const v74_2 = Math.fround(inNum[b74 + 2]);
  const v74_3 = Math.fround(inNum[b74 + 3]);

  // %79 : v79 = weightBuffer[weightIdx0]  (float4)
  const b79 = weightIdx0 * 4;
  const v79_0 = Math.fround(weightBuffer[b79 + 0]);
  const v79_1 = Math.fround(weightBuffer[b79 + 1]);
  const v79_2 = Math.fround(weightBuffer[b79 + 2]);
  const v79_3 = Math.fround(weightBuffer[b79 + 3]);
  // %83 : v83 = weightBuffer[weightIdx1]
  const b83 = weightIdx1 * 4;
  const v83_0 = Math.fround(weightBuffer[b83 + 0]);
  const v83_1 = Math.fround(weightBuffer[b83 + 1]);
  const v83_2 = Math.fround(weightBuffer[b83 + 2]);
  const v83_3 = Math.fround(weightBuffer[b83 + 3]);

  // ---- COMPUTE ----
  // %84 : v84 = fmul v65, v79   (lane-wise vec4)
  const v84_0 = fmul(v65_0, v79_0);
  const v84_1 = fmul(v65_1, v79_1);
  const v84_2 = fmul(v65_2, v79_2);
  const v84_3 = fmul(v65_3, v79_3);
  // %85 : v85 = fmul v68, v83
  const v85_0 = fmul(v68_0, v83_0);
  const v85_1 = fmul(v68_1, v83_1);
  const v85_2 = fmul(v68_2, v83_2);
  const v85_3 = fmul(v68_3, v83_3);
  // %86 : v86 = fmul v71, v79
  const v86_0 = fmul(v71_0, v79_0);
  const v86_1 = fmul(v71_1, v79_1);
  const v86_2 = fmul(v71_2, v79_2);
  const v86_3 = fmul(v71_3, v79_3);
  // %87 : v87 = fmul v74, v83
  const v87_0 = fmul(v74_0, v83_0);
  const v87_1 = fmul(v74_1, v83_1);
  const v87_2 = fmul(v74_2, v83_2);
  const v87_3 = fmul(v74_3, v83_3);

  // %88 : v88 = fadd v48, v84   (lane-wise vec4)
  const v88_0 = fadd(v48_0, v84_0);
  const v88_1 = fadd(v48_1, v84_1);
  const v88_2 = fadd(v48_2, v84_2);
  const v88_3 = fadd(v48_3, v84_3);
  // %89 : v89 = fadd v60, v85
  const v89_0 = fadd(v60_0, v85_0);
  const v89_1 = fadd(v60_1, v85_1);
  const v89_2 = fadd(v60_2, v85_2);
  const v89_3 = fadd(v60_3, v85_3);

  // %90 : v88.y ; %91 : v86.x ; %92 = v91 + v90
  const v92 = fadd(v86_0, v88_1);
  // %93 : v88.z ; %94 : v86.y ; %95 = v94 + v93
  const v95 = fadd(v86_1, v88_2);
  // %96 : v88.w ; %97 : v86.z ; %98 = v97 + v96
  const v98 = fadd(v86_2, v88_3);
  // %99 : v89.x ; %100 : v86.w ; %101 = v100 + v99
  const v101 = fadd(v86_3, v89_0);
  // %102 : v89.y ; %103 : v87.x ; %104 = v103 + v102
  const v104 = fadd(v87_0, v89_1);
  // %105 : v89.z ; %106 : v87.y ; %107 = v106 + v105
  const v107 = fadd(v87_1, v89_2);
  // %108 : v89.w ; %109 : v87.z ; %110 = v109 + v108
  const v110 = fadd(v87_2, v89_3);

  // ---- STORES ----
  // %111 : store v88.x  -> inOut[base + 0]
  inOut[inOutBase + 0] = v88_0;
  // store v92           -> inOut[base + 1]  (address from %38)
  inOut[inOutBase + 1] = v92;
  // store v95           -> inOut[base + 2]  (address from %42)
  inOut[inOutBase + 2] = v95;
  // store v98           -> inOut[base + 3]  (address from %46)
  inOut[inOutBase + 3] = v98;
  // store v101          -> inOut[base + 4]  (address from %50)
  inOut[inOutBase + 4] = v101;
  // store v104          -> inOut[base + 5]  (address from %54)
  inOut[inOutBase + 5] = v104;
  // store v107          -> inOut[base + 6]  (address from %58)
  inOut[inOutBase + 6] = v107;
  // %112, %113 : gepi base + 7 ; store v110
  inOut[inOutBase + 7] = v110;
  // %114 : v87.w ; %115, %116 : gepi base + 8 ; store v87.w
  inOut[inOutBase + 8] = v87_3;
}
