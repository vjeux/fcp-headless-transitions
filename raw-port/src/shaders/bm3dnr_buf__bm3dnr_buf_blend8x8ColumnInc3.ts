// bm3dnr_buf__bm3dnr_buf_blend8x8ColumnInc3.ts — direct TS mapping of the
// Metal compute kernel `bm3dnr_buf::bm3dnr_buf_blend8x8ColumnInc3` from
// HeliumSenso.framework/Versions/A/Resources/default.metallib.
//
// @shader bm3dnr_buf::bm3dnr_buf_blend8x8ColumnInc3 (HeliumSenso)
// IR provenance: raw-port/re/shaders/bm3dnr_buf::bm3dnr_buf_blend8x8ColumnInc3.ll
// (header line: `0x0000000000d00d -- bm3dnr_buf::bm3dnr_buf_blend8x8ColumnInc3`)
//
// This is a stride-3 variant of the 8x8 column-blend accumulator used by the
// BM3D-style denoiser. For a single (gx,gy) grid position it reads 5 scalar
// floats from `inOut`, 8 float4 vectors from `inNum`, and 2 float4 weight
// vectors from `weightBuffer`, computes 16 pair-wise fused updates, and
// stores 17 scalar floats back into `inOut`. The Inc3 suffix refers to the
// step increment `m_stepInc` @+8 in the params struct — it is loaded but
// only used as a byte-count for the address arithmetic (%23 → %28 → %29).
//
// Signature (%N naming from the .ll):
//   void @bm3dnr_buf::bm3dnr_buf_blend8x8ColumnInc3(
//     %params*         %0,  // params struct (6 x i32; see below)
//     <2 x i32>        %1,  // thread_position_in_grid    (gx, gy)
//     float*           %2,  // inOut          (float ; both read + write)
//     <4 x float>*     %3,  // inNum          (float4; read-only per-invocation)
//     <4 x float>*     %4   // weightBuffer   (float4; read-only per-invocation)
//   )
//
// Params struct layout (from !18 in the .ll):
//   i32  m_strideInOut     @0   → %17
//   i32  m_strideIn        @4   → %19
//   i32  m_stepInc         @8   → %21
//   i32  m_offsetX         @12  → %23
//   uint m_globalWidth     @16  → %8    (bound check on gx = %6)
//   uint m_globalHeight    @20  → %13   (bound check on gy = %11)
//
// Semantics recovered from the AIR (block ids from the .ll):
//   %5 → %10 → %15 → %169 (ret)
//     if (gx >= globalWidth)  return;                            // %9  unsigned-lt
//     if (gy >= globalHeight) return;                            // %14 unsigned-lt
//     // Base offsets:
//     colX      = m_offsetX + gx                                  // %24
//     stepBytes = (i64)m_stepInc << 2                             // %28 (stepInc * 4)
//     inOutBase = stepBytes * (u64)colX  +  (i64)m_strideInOut * (u64)gy   // %33
//     inNumBase = (u64)colX * 8          +  (i64)m_strideIn    * (u64)gy   // %55
//     weightIdx0 = (gy * 2) & 14                                  // %80
//     weightIdx1 = weightIdx0 | 1                                 // %84
//   Load-block:
//     inOut[0..4]   → scalar floats packed into two <4 x float>:
//       v48 = [inOut[base+0], inOut[base+1], inOut[base+2], inOut[base+3]]  // %36..%48
//       v52 = [inOut[base+4],       0,             0,             0     ]  // %51..%52
//     inNum[base..base+7]                                         // %57,%60,%63,%66,%69,%72,%75,%78
//     weight[weightIdx0], weight[weightIdx1]                      // %83, %87
//   Compute (8 lane-wise fmul + 16 pair-wise fadd across lanes/loads):
//     v88 = fmul v57, v83        v89 = fmul v60, v87
//     v90 = fmul v63, v83        v91 = fmul v66, v87
//     v92 = fmul v69, v83        v93 = fmul v72, v87
//     v94 = fmul v75, v83        v95 = fmul v78, v87
//     v96 = fadd v48, v88        v97 = fadd v52, v89
//     — then a 15-step zig-zag of `fadd float, float` (%98..%138) that peels
//       lanes from v96/v97/v90/v91/v92/v93/v94/v95 in the exact order the
//       compiler wants for the 17-scalar store pattern below.
//   Store (17 scalar float stores into inOut at base+{0..16}):
//     inOut[base+0]  = v96.x    (%139)
//     inOut[base+1]  = v96.y    (%140)
//     inOut[base+2]  = v96.z    (%141)
//     inOut[base+3]  = v100     (v96.w + v90.x)
//     inOut[base+4]  = v103     (v97.x + v90.y)
//     inOut[base+5]  = v106     (v97.y + v90.z)
//     inOut[base+6]  = v111     (v97.z + v90.w + v92.x)     ← two accumulated (%109 then %111)
//     inOut[base+7]  = v116     (v97.w + v91.x + v92.y)     ← two accumulated (%114 then %116)
//     inOut[base+8]  = v119     (v91.y + v92.z)
//     inOut[base+9]  = v124     (v91.z + v92.w + v94.x)     ← two accumulated (%122 then %124)
//     inOut[base+10] = v129     (v91.w + v93.x + v94.y)     ← two accumulated (%127 then %129)
//     inOut[base+11] = v132     (v93.y + v94.z)
//     inOut[base+12] = v135     (v93.z + v94.w)
//     inOut[base+13] = v138     (v93.w + v95.x)
//     inOut[base+14] = v95.y    (%160)
//     inOut[base+15] = v95.z    (%163)
//     inOut[base+16] = v95.w    (%166)
//
// The attribute string in the .ll is `"no-trapping-math"="true"` with the
// air-compile flags `denorms_disable` and `fast_math_disable`. The kernel
// uses only plain fmul/fadd on <4 x float> and scalar float — direct TS
// mapping via Math.fround on every fp32 op. No air.* intrinsics are used.

export interface Bm3dnrBufBlend8x8ColumnInc3Params {
  m_strideInOut: number;   // int  @0
  m_strideIn: number;      // int  @4
  m_stepInc: number;       // int  @8
  m_offsetX: number;       // int  @12
  m_globalWidth: number;   // uint @16
  m_globalHeight: number;  // uint @20
}

/**
 * Reference float32 addition — mirrors AIR's f32 fadd.
 */
function fadd(a: number, b: number): number {
  return Math.fround(Math.fround(a) + Math.fround(b));
}

/**
 * Reference float32 multiplication — mirrors AIR's f32 fmul.
 */
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
export function bm3dnr_buf__bm3dnr_buf_blend8x8ColumnInc3(
  params: Bm3dnrBufBlend8x8ColumnInc3Params,
  grid_in: [number, number],
  inOut: Float32Array,
  inNum: Float32Array,      // logically <4 x float>[] laid out flat: 4 floats per vector
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
  // %28 : stepBytes = stepInc << 2      (i.e. stepInc * 4 as float count when we index inOut)
  // %29 : inOutRow = stepBytes * colX   → this is the *scalar float* stride into inOut
  //       (Note: LLVM computes the raw byte offset here because inOut is float* and each
  //        float is 4 bytes; the `<< 2` and later `getelementptr inbounds float` collapse
  //        the byte factor. In TS we index by scalar float, so we replay it as stepInc*4
  //        floats per column and use the result directly as a Float32Array index.)
  const inOutRow = (stepInc * 4) * colX;
  // %30 : colX * 8   → the *float4-vector* stride into inNum (each vector = 4 floats;
  //       the ptr arithmetic in the IR is `nuw nsw i64 %25, 3`, i.e. colX << 3, i.e.
  //       colX * 8 vectors of 16 bytes = colX * 128 bytes = colX * 32 floats. Since
  //       inNum is a `<4 x float>*`, index-by-vector is colX * 8.)
  const inNumColBase = colX * 8;
  // %31, %32 : sext m_strideIn to i64, mul by gy
  //             → row offset in inNum vector units
  const inNumRow = strideIn * gy;
  // %33 : inOutBase = inOutRow + strideInOut * gy
  const inOutBase = inOutRow + strideInOut * gy;
  // %55 : inNumBase = inNumColBase + inNumRow (vector units)
  const inNumBase = inNumColBase + inNumRow;

  // %79, %80 : weightIdx0 = (gy << 1) & 14  → picks 8 pairings across gy%8
  const weightIdx0 = ((gy << 1) & 14) >>> 0;
  // %84 : weightIdx1 = weightIdx0 | 1
  const weightIdx1 = (weightIdx0 | 1) >>> 0;

  // ---- LOADS ----
  // %35..%48 : v48 = [inOut[base+0..3]]
  const v48_0 = Math.fround(inOut[inOutBase + 0]);
  const v48_1 = Math.fround(inOut[inOutBase + 1]);
  const v48_2 = Math.fround(inOut[inOutBase + 2]);
  const v48_3 = Math.fround(inOut[inOutBase + 3]);
  // %51..%52 : v52 = [inOut[base+4], 0, 0, 0]
  const v52_0 = Math.fround(inOut[inOutBase + 4]);
  const v52_1 = 0;
  const v52_2 = 0;
  const v52_3 = 0;

  // %57 : v57 = inNum[inNumBase + 0]  (float4)
  const b57 = (inNumBase + 0) * 4;
  const v57_0 = Math.fround(inNum[b57 + 0]);
  const v57_1 = Math.fround(inNum[b57 + 1]);
  const v57_2 = Math.fround(inNum[b57 + 2]);
  const v57_3 = Math.fround(inNum[b57 + 3]);
  // %60 : v60 = inNum[inNumBase + 1]
  const b60 = (inNumBase + 1) * 4;
  const v60_0 = Math.fround(inNum[b60 + 0]);
  const v60_1 = Math.fround(inNum[b60 + 1]);
  const v60_2 = Math.fround(inNum[b60 + 2]);
  const v60_3 = Math.fround(inNum[b60 + 3]);
  // %63 : v63 = inNum[inNumBase + 2]
  const b63 = (inNumBase + 2) * 4;
  const v63_0 = Math.fround(inNum[b63 + 0]);
  const v63_1 = Math.fround(inNum[b63 + 1]);
  const v63_2 = Math.fround(inNum[b63 + 2]);
  const v63_3 = Math.fround(inNum[b63 + 3]);
  // %66 : v66 = inNum[inNumBase + 3]
  const b66 = (inNumBase + 3) * 4;
  const v66_0 = Math.fround(inNum[b66 + 0]);
  const v66_1 = Math.fround(inNum[b66 + 1]);
  const v66_2 = Math.fround(inNum[b66 + 2]);
  const v66_3 = Math.fround(inNum[b66 + 3]);
  // %69 : v69 = inNum[inNumBase + 4]
  const b69 = (inNumBase + 4) * 4;
  const v69_0 = Math.fround(inNum[b69 + 0]);
  const v69_1 = Math.fround(inNum[b69 + 1]);
  const v69_2 = Math.fround(inNum[b69 + 2]);
  const v69_3 = Math.fround(inNum[b69 + 3]);
  // %72 : v72 = inNum[inNumBase + 5]
  const b72 = (inNumBase + 5) * 4;
  const v72_0 = Math.fround(inNum[b72 + 0]);
  const v72_1 = Math.fround(inNum[b72 + 1]);
  const v72_2 = Math.fround(inNum[b72 + 2]);
  const v72_3 = Math.fround(inNum[b72 + 3]);
  // %75 : v75 = inNum[inNumBase + 6]
  const b75 = (inNumBase + 6) * 4;
  const v75_0 = Math.fround(inNum[b75 + 0]);
  const v75_1 = Math.fround(inNum[b75 + 1]);
  const v75_2 = Math.fround(inNum[b75 + 2]);
  const v75_3 = Math.fround(inNum[b75 + 3]);
  // %78 : v78 = inNum[inNumBase + 7]
  const b78 = (inNumBase + 7) * 4;
  const v78_0 = Math.fround(inNum[b78 + 0]);
  const v78_1 = Math.fround(inNum[b78 + 1]);
  const v78_2 = Math.fround(inNum[b78 + 2]);
  const v78_3 = Math.fround(inNum[b78 + 3]);

  // %83 : v83 = weightBuffer[weightIdx0]
  const bw0 = weightIdx0 * 4;
  const v83_0 = Math.fround(weightBuffer[bw0 + 0]);
  const v83_1 = Math.fround(weightBuffer[bw0 + 1]);
  const v83_2 = Math.fround(weightBuffer[bw0 + 2]);
  const v83_3 = Math.fround(weightBuffer[bw0 + 3]);
  // %87 : v87 = weightBuffer[weightIdx1]
  const bw1 = weightIdx1 * 4;
  const v87_0 = Math.fround(weightBuffer[bw1 + 0]);
  const v87_1 = Math.fround(weightBuffer[bw1 + 1]);
  const v87_2 = Math.fround(weightBuffer[bw1 + 2]);
  const v87_3 = Math.fround(weightBuffer[bw1 + 3]);

  // ---- COMPUTE ----
  // %88 : v88 = fmul v57, v83   (lane-wise)
  const v88_0 = fmul(v57_0, v83_0);
  const v88_1 = fmul(v57_1, v83_1);
  const v88_2 = fmul(v57_2, v83_2);
  const v88_3 = fmul(v57_3, v83_3);
  // %89 : v89 = fmul v60, v87
  const v89_0 = fmul(v60_0, v87_0);
  const v89_1 = fmul(v60_1, v87_1);
  const v89_2 = fmul(v60_2, v87_2);
  const v89_3 = fmul(v60_3, v87_3);
  // %90 : v90 = fmul v63, v83
  const v90_0 = fmul(v63_0, v83_0);
  const v90_1 = fmul(v63_1, v83_1);
  const v90_2 = fmul(v63_2, v83_2);
  const v90_3 = fmul(v63_3, v83_3);
  // %91 : v91 = fmul v66, v87
  const v91_0 = fmul(v66_0, v87_0);
  const v91_1 = fmul(v66_1, v87_1);
  const v91_2 = fmul(v66_2, v87_2);
  const v91_3 = fmul(v66_3, v87_3);
  // %92 : v92 = fmul v69, v83
  const v92_0 = fmul(v69_0, v83_0);
  const v92_1 = fmul(v69_1, v83_1);
  const v92_2 = fmul(v69_2, v83_2);
  const v92_3 = fmul(v69_3, v83_3);
  // %93 : v93 = fmul v72, v87
  const v93_0 = fmul(v72_0, v87_0);
  const v93_1 = fmul(v72_1, v87_1);
  const v93_2 = fmul(v72_2, v87_2);
  const v93_3 = fmul(v72_3, v87_3);
  // %94 : v94 = fmul v75, v83
  const v94_0 = fmul(v75_0, v83_0);
  const v94_1 = fmul(v75_1, v83_1);
  const v94_2 = fmul(v75_2, v83_2);
  const v94_3 = fmul(v75_3, v83_3);
  // %95 : v95 = fmul v78, v87
  const v95_0 = fmul(v78_0, v87_0);
  const v95_1 = fmul(v78_1, v87_1);
  const v95_2 = fmul(v78_2, v87_2);
  const v95_3 = fmul(v78_3, v87_3);

  // %96 : v96 = fadd v48, v88 (lane-wise)
  const v96_0 = fadd(v48_0, v88_0);
  const v96_1 = fadd(v48_1, v88_1);
  const v96_2 = fadd(v48_2, v88_2);
  const v96_3 = fadd(v48_3, v88_3);
  // %97 : v97 = fadd v52, v89 (lane-wise)
  const v97_0 = fadd(v52_0, v89_0);
  const v97_1 = fadd(v52_1, v89_1);
  const v97_2 = fadd(v52_2, v89_2);
  const v97_3 = fadd(v52_3, v89_3);

  // %98..%100 : v100 = v99 + v98 = v90_0 + v96_3
  const v100 = fadd(v90_0, v96_3);
  // %101..%103 : v103 = v102 + v101 = v90_1 + v97_0
  const v103 = fadd(v90_1, v97_0);
  // %104..%106 : v106 = v90_2 + v97_1
  const v106 = fadd(v90_2, v97_1);
  // %107..%109 : v109 = v90_3 + v97_2
  const v109 = fadd(v90_3, v97_2);
  // %110..%111 : v111 = v92_0 + v109
  const v111 = fadd(v92_0, v109);
  // %112..%114 : v114 = v91_0 + v97_3
  const v114 = fadd(v91_0, v97_3);
  // %115..%116 : v116 = v92_1 + v114
  const v116 = fadd(v92_1, v114);
  // %117..%119 : v119 = v92_2 + v91_1
  const v119 = fadd(v92_2, v91_1);
  // %120..%122 : v122 = v92_3 + v91_2
  const v122 = fadd(v92_3, v91_2);
  // %123..%124 : v124 = v94_0 + v122
  const v124 = fadd(v94_0, v122);
  // %125..%127 : v127 = v91_3 + v93_0
  const v127 = fadd(v91_3, v93_0);
  // %128..%129 : v129 = v94_1 + v127
  const v129 = fadd(v94_1, v127);
  // %130..%132 : v132 = v94_2 + v93_1
  const v132 = fadd(v94_2, v93_1);
  // %133..%135 : v135 = v94_3 + v93_2
  const v135 = fadd(v94_3, v93_2);
  // %136..%138 : v138 = v93_3 + v95_0
  const v138 = fadd(v93_3, v95_0);

  // ---- STORES ----
  // %139 : inOut[base+0] = v96_0
  inOut[inOutBase + 0] = v96_0;
  // %140 : inOut[base+1] = v96_1
  inOut[inOutBase + 1] = v96_1;
  // %141 : inOut[base+2] = v96_2
  inOut[inOutBase + 2] = v96_2;
  // store v100 at inOut[base+3]
  inOut[inOutBase + 3] = v100;
  // store v103 at inOut[base+4]
  inOut[inOutBase + 4] = v103;
  // %143 : inOut[base+5] = v106
  inOut[inOutBase + 5] = v106;
  // %145 : inOut[base+6] = v111
  inOut[inOutBase + 6] = v111;
  // %147 : inOut[base+7] = v116
  inOut[inOutBase + 7] = v116;
  // %149 : inOut[base+8] = v119
  inOut[inOutBase + 8] = v119;
  // %151 : inOut[base+9] = v124
  inOut[inOutBase + 9] = v124;
  // %153 : inOut[base+10] = v129
  inOut[inOutBase + 10] = v129;
  // %155 : inOut[base+11] = v132
  inOut[inOutBase + 11] = v132;
  // %157 : inOut[base+12] = v135
  inOut[inOutBase + 12] = v135;
  // %159 : inOut[base+13] = v138
  inOut[inOutBase + 13] = v138;
  // %160, %162 : inOut[base+14] = v95_1
  inOut[inOutBase + 14] = v95_1;
  // %163, %165 : inOut[base+15] = v95_2
  inOut[inOutBase + 15] = v95_2;
  // %166, %168 : inOut[base+16] = v95_3
  inOut[inOutBase + 16] = v95_3;
  // %169 : ret void
}
