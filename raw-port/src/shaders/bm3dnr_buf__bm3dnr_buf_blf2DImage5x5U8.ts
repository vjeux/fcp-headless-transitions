// bm3dnr_buf__bm3dnr_buf_blf2DImage5x5U8.ts
// @shader bm3dnr_buf::bm3dnr_buf_blf2DImage5x5U8 (HeliumSenso)
// Direct TS mapping of the Metal compute kernel decompiled at
//   raw-port/re/shaders/bm3dnr_buf__bm3dnr_buf_blf2DImage5x5U8.ll (@0x0000000002002d)
//
// A 5x5 bilateral filter over a UCHAR8 image packed 4 pixels per vec4 slot.
// Each thread processes ONE vec4 slot (four consecutive u8 pixels along the
// x axis) at (gx, gy). The bilateral weight is
//     w(N) = exp2(sigma * (C - N)^2)
// where sigma comes as a scalar in `m_sigma` (typically <= 0 for a
// well-formed Gaussian). The center pixel has an implicit weight of 1.
// Output is `x + 0.5` (round-to-nearest) then clamp to [0, 255] then u8.
//
// This is the 5x5 sibling of the already-ported 3x3 kernel (see
// bm3dnr_buf_blf2DImage3x3U8.ts). It uses 15 vec4 loads to cover 5 rows
// (y-2, y-1, y, y+1, y+2) x 3 cols (x-1, x, x+1) and stitches the 24
// non-center neighbours across the four output pixels via shufflevector.
//
// Signature (%N naming from the .ll):
//   void @bm3dnr_buf::bm3dnr_buf_blf2DImage5x5U8(
//     %params*      %0,  // params struct (see below)
//     <2 x i32>     %1,  // thread_position_in_grid    (gx, gy)
//     <4 x i8>*     %2,  // input   (uchar4; read-only)
//     <4 x i8>*     %3   // output  (uchar4; write)
//   )
//
// Params struct layout (from !18 in the .ll):
//   i32 m_width         @0   -> %16    (vec4-column count of the image)
//   i32 m_height        @4   -> %18    (pixel-row count of the image)
//   i32 m_inputStride   @8   -> %20    (vec4-columns per input row)
//   i32 m_outputStride  @12  -> %22    (vec4-columns per output row)
//   f32 m_sigma         @16  -> %24    (bilateral exponent scale, typically <= 0)
//   u32 m_globalWidth   @20  -> %7     (grid.x upper bound; exclusive)
//   u32 m_globalHeight  @24  -> %12    (grid.y upper bound; exclusive)
//
// Semantics recovered from the AIR:
//   %4 -> %9 -> %14 -> %334 (ret)
//     if (gx >= globalWidth)  return;                       // %6..%8
//     if (gy >= globalHeight) return;                       // %11..%13
//
//   Neighbour x/y with edge clamping:
//     xL   = max(gx - 1, 0)                                  // %25, %31, %32
//     xR   = min(gx + 1, width  - 1)                          // %26, %33, %34, %35
//     yTT  = max(gy - 2, 0)                                   // %27, %38, %39
//     yT   = max(gy - 1, 0)                                   // %28, %36, %37
//     yB   = min(gy + 1, height - 1)                          // %29, %41, %42
//     yBB  = min(gy + 2, height - 1)                          // %30, %43, %44
//
//   15 loads (row-major, 5 rows x 3 cols):
//     v50=in[yTT,xL] v55=in[yTT,gx] v60=in[yTT,xR]         // %49/%50, %54/%55, %59/%60
//     v66=in[yT ,xL] v71=in[yT ,gx] v76=in[yT ,xR]         // %65/%66, %70/%71, %75/%76
//     v82=in[gy ,xL] v87=in[gy ,gx]=C v92=in[gy ,xR]       // %81/%82, %86/%87, %91/%92
//     v98=in[yB ,xL] v103=in[yB,gx] v108=in[yB,xR]         // %97/%98, %102/%103, %107/%108
//     v114=in[yBB,xL] v119=in[yBB,gx] v124=in[yBB,xR]      // %113/%114, %118/%119, %123/%124
//
//   sigma broadcast:
//     v126 = <sigma, sigma, sigma, sigma>                    // %125, %126
//
//   Accumulator layout: `num` (%149,%185,%217,%253,%289,%324) starts from C
//   plus the fmuladd of the four vertical-column neighbours (see below),
//   then adds four neighbours per pass; `den` starts from `1 + w(vertical)`
//   and adds one weight per neighbour. The bilateral formula is
//     num += N * w(N) ; den += w(N)
//   where w(N) = exp2(sigma * (C - N)^2).
//
//   Group 1 — 4 vertical same-column neighbours (%127..%150):
//     N in { v55 (yTT.same-col), v71 (yT.same-col), v103 (yB.same-col), v119 (yBB.same-col) }
//     num0 = C ; den0 = 1 (comes from `fadd wT + 1.0` at %144)
//     -> num=%149, den=%150.
//
//   Group 2 — "shift-left by 2 pixels" across 4 rows (%151..%186):
//     For each of rows {yTT, yT, yB, yBB} pair the far-left row-vec (v50, v66, v98, v114)
//     with the same-column row-vec (v55, v71, v103, v119) as
//         <L.z, L.w, C.x, C.y>
//     via the shuffle chain %151/%152/%153, %154/%155/%156, %157/%158/%159, %160/%161/%162.
//     Then fmuladd num, fadd den. -> num=%185, den=%186.
//
//   Group 3 — "shift-left by 1 pixel" across 4 rows (%187..%218):
//     Shuffle pattern <L.w, C.x, C.y, C.z> at %187..%194.
//     -> num=%217, den=%218.
//
//   Group 4 — "shift-right by 1 pixel" across 4 rows (%219..%254):
//     Shuffle pattern <C.y, C.z, C.w, R.x> at %219..%230
//     with R = far-right row-vec (v60, v76, v108, v124).
//     -> num=%253, den=%254.
//
//   Group 5 — "shift-right by 2 pixels" across 4 rows (%255..%290):
//     Shuffle pattern <C.z, C.w, R.x, R.y> at %255..%266.
//     -> num=%289, den=%290.
//
//   Group 6 — 4 horizontal neighbours in the center row (%291..%325):
//     v293 = <v82.z, v82.w, C.x, C.y>              (center-row shift-left-2)
//     v295 = <v82.w, C.x, C.y, C.z>                (center-row shift-left-1)
//     v298 = <C.y, C.z, C.w, v92.x>                (center-row shift-right-1)
//     v301 = <C.z, C.w, v92.x, v92.y>              (center-row shift-right-2)
//     -> num=%324, den=%325.
//
//   Finalise:
//     v326 = num / den                                     // %326 fdiv
//     v327 = v326 + 0.5                                    // %327
//     v328 = clamp(v327, 0, 255)                           // %328 air.clamp
//     v329 = convert v328 -> uchar4                        // %329 air.convert.u.v4i8.f.v4f32
//     output[gy * outputStride + gx] = v329                // %330..%333
//
// The .ll has `air.compile.fast_math_disable`. All lane arithmetic is fp32,
// Math.fround-wrapped on every operation. `llvm.fmuladd.v4f32` is written
// here as separate multiply + add (Metal may fuse; both encodings are
// permitted by the IR).
//
// air.exp2.v4f32 is a native f32 exp2 intrinsic; we spell it as
// `Math.fround(2 ** x)` per the SHADERS.md guidance.

export interface Bm3dnrBufBlf2DImage5x5U8Params {
  m_width: number;         // i32 @0  — vec4-column count of the image
  m_height: number;        // i32 @4  — pixel-row count
  m_inputStride: number;   // i32 @8  — vec4-columns per input row
  m_outputStride: number;  // i32 @12 — vec4-columns per output row
  m_sigma: number;         // f32 @16 — bilateral exponent scale
  m_globalWidth: number;   // u32 @20 — grid.x upper bound (exclusive)
  m_globalHeight: number;  // u32 @24 — grid.y upper bound (exclusive)
}

export type Uchar4Buffer = Uint8Array;

// Reference float32 addition — mirrors AIR's f32 fadd.
function fadd(a: number, b: number): number {
  return Math.fround(Math.fround(a) + Math.fround(b));
}
// Reference float32 multiplication — mirrors AIR's f32 fmul.
function fmul(a: number, b: number): number {
  return Math.fround(Math.fround(a) * Math.fround(b));
}
// Reference float32 subtraction — mirrors AIR's f32 fsub.
function fsub(a: number, b: number): number {
  return Math.fround(Math.fround(a) - Math.fround(b));
}
// Reference float32 division — mirrors AIR's f32 fdiv.
function fdiv(a: number, b: number): number {
  return Math.fround(Math.fround(a) / Math.fround(b));
}
// air.exp2.v4f32 lane — direct f32 mapping.
function exp2f(x: number): number {
  return Math.fround(Math.pow(2, Math.fround(x)));
}

// air.convert.f.v4f32.u.v4i8 — unsigned u8->f32 lane-wise conversion.
function u8ToF32Vec4(buf: Uchar4Buffer, byteBase: number): Float32Array {
  const v = new Float32Array(4);
  v[0] = buf[byteBase + 0] | 0;
  v[1] = buf[byteBase + 1] | 0;
  v[2] = buf[byteBase + 2] | 0;
  v[3] = buf[byteBase + 3] | 0;
  return v;
}

// Vec4 lane helpers.
function vFsub(a: Float32Array, b: Float32Array): Float32Array {
  const r = new Float32Array(4);
  r[0] = fsub(a[0], b[0]); r[1] = fsub(a[1], b[1]);
  r[2] = fsub(a[2], b[2]); r[3] = fsub(a[3], b[3]);
  return r;
}
function vFmul(a: Float32Array, b: Float32Array): Float32Array {
  const r = new Float32Array(4);
  r[0] = fmul(a[0], b[0]); r[1] = fmul(a[1], b[1]);
  r[2] = fmul(a[2], b[2]); r[3] = fmul(a[3], b[3]);
  return r;
}
function vFadd(a: Float32Array, b: Float32Array): Float32Array {
  const r = new Float32Array(4);
  r[0] = fadd(a[0], b[0]); r[1] = fadd(a[1], b[1]);
  r[2] = fadd(a[2], b[2]); r[3] = fadd(a[3], b[3]);
  return r;
}
function vFmuladd(a: Float32Array, b: Float32Array, c: Float32Array): Float32Array {
  // llvm.fmuladd -> (a*b) + c ; may be fused by the target. We mirror the
  // plain unfused sequence for deterministic fp32 rounding on the JS side.
  const r = new Float32Array(4);
  r[0] = fadd(fmul(a[0], b[0]), c[0]);
  r[1] = fadd(fmul(a[1], b[1]), c[1]);
  r[2] = fadd(fmul(a[2], b[2]), c[2]);
  r[3] = fadd(fmul(a[3], b[3]), c[3]);
  return r;
}
function vExp2(x: Float32Array): Float32Array {
  const r = new Float32Array(4);
  r[0] = exp2f(x[0]); r[1] = exp2f(x[1]);
  r[2] = exp2f(x[2]); r[3] = exp2f(x[3]);
  return r;
}
function vBroadcast(s: number): Float32Array {
  const r = new Float32Array(4);
  r[0] = r[1] = r[2] = r[3] = Math.fround(s);
  return r;
}
// air.clamp.v4f32 lane-wise (post-clamp handles [0,255] for u8 convert).
function vClamp(x: Float32Array, lo: number, hi: number): Float32Array {
  const r = new Float32Array(4);
  const cl = (v: number): number => Math.fround(Math.min(Math.max(v, lo), hi));
  r[0] = cl(x[0]); r[1] = cl(x[1]); r[2] = cl(x[2]); r[3] = cl(x[3]);
  return r;
}
// air.convert.u.v4i8.f.v4f32 — pre-clamped f32 -> u8 truncation (matches Metal).
function f32ToU8Vec4(dst: Uchar4Buffer, byteBase: number, v: Float32Array): void {
  dst[byteBase + 0] = v[0] | 0;
  dst[byteBase + 1] = v[1] | 0;
  dst[byteBase + 2] = v[2] | 0;
  dst[byteBase + 3] = v[3] | 0;
}

/**
 * Direct TS mapping of the AIR kernel body for one output vec4 at (gx,gy).
 * `input` and `output` are Uint8Arrays of packed uchar4 pixels indexed by
 * vec4-slot (i.e. 4 bytes per slot).
 */
export function bm3dnr_buf__bm3dnr_buf_blf2DImage5x5U8(
  params: Bm3dnrBufBlf2DImage5x5U8Params,
  grid_in: [number, number],
  input: Uchar4Buffer,
  output: Uchar4Buffer,
): void {
  // %5, %10 : gx, gy
  const gx = grid_in[0] | 0;
  const gy = grid_in[1] | 0;

  // %6..%8 : if (gx >= m_globalWidth)  return
  if ((gx >>> 0) >= (params.m_globalWidth >>> 0)) return;
  // %11..%13 : if (gy >= m_globalHeight) return
  if ((gy >>> 0) >= (params.m_globalHeight >>> 0)) return;

  const width = params.m_width | 0;
  const height = params.m_height | 0;
  const inputStride = params.m_inputStride | 0;
  const outputStride = params.m_outputStride | 0;
  const sigma = Math.fround(params.m_sigma);

  // Edge-clamped neighbour indices (signed compare per the .ll's `sgt`/`slt`).
  // %25 : xLraw = gx - 1     %31 : xLraw > 0  ->  %32 : xL
  const xL = (gx - 1) > 0 ? (gx - 1) : 0;
  // %26 : xRraw = gx + 1     %33..%35        ->  xR = min(gx+1, width-1)
  const xR = (gx + 1) < width ? (gx + 1) : (width - 1);
  // %28 : y-1                %36..%37        ->  yT = max(y-1, 0)
  const yT = (gy - 1) > 0 ? (gy - 1) : 0;
  // %27 : y-2                %38..%39        ->  yTT = max(y-2, 0)
  const yTT = (gy - 2) > 0 ? (gy - 2) : 0;
  // %29 : y+1                %41..%42        ->  yB = min(y+1, height-1)
  const yB = (gy + 1) < height ? (gy + 1) : (height - 1);
  // %30 : y+2                %43..%44        ->  yBB = min(y+2, height-1)
  const yBB = (gy + 2) < height ? (gy + 2) : (height - 1);

  // Load uchar4 vec4 at (row * inputStride + col). Each vec4 is 4 bytes.
  const loadRow = (row: number, col: number): Float32Array =>
    u8ToF32Vec4(input, (row * inputStride + col) * 4);

  // ---- LOADS (15 vec4 f32) ----
  // %45..%50  : row yTT
  const v50 = loadRow(yTT, xL);
  const v55 = loadRow(yTT, gx);
  const v60 = loadRow(yTT, xR);
  // %61..%76  : row yT
  const v66 = loadRow(yT, xL);
  const v71 = loadRow(yT, gx);
  const v76 = loadRow(yT, xR);
  // %77..%92  : row gy (center)
  const v82 = loadRow(gy, xL);
  const v87 = loadRow(gy, gx); // C
  const v92 = loadRow(gy, xR);
  // %93..%108 : row yB
  const v98 = loadRow(yB, xL);
  const v103 = loadRow(yB, gx);
  const v108 = loadRow(yB, xR);
  // %109..%124 : row yBB
  const v114 = loadRow(yBB, xL);
  const v119 = loadRow(yBB, gx);
  const v124 = loadRow(yBB, xR);

  // %125, %126 : sigma broadcast
  const vSigma = vBroadcast(sigma);

  // Helper: single bilateral update
  //   num := N * w(N) + num
  //   den := w(N)     + den
  // where w(N) = exp2(sigma * (C - N)^2). Mutates the {num, den} accumulator.
  interface Acc { num: Float32Array; den: Float32Array; }
  const step = (C: Float32Array, N: Float32Array, acc: Acc): void => {
    const diff = vFsub(C, N);
    const sq = vFmul(diff, diff);
    const arg = vFmul(vSigma, sq);
    const w = vExp2(arg);
    acc.num = vFmuladd(N, w, acc.num);
    acc.den = vFadd(acc.den, w);
  };

  // Small shuffle helpers matching the exact patterns used across groups.
  // Each returns a fresh Float32Array (no aliasing).
  const shufLL2 = (L: Float32Array, C: Float32Array): Float32Array => {
    // <L.z, L.w, C.x, C.y>
    const r = new Float32Array(4);
    r[0] = L[2]; r[1] = L[3]; r[2] = C[0]; r[3] = C[1];
    return r;
  };
  const shufLL1 = (L: Float32Array, C: Float32Array): Float32Array => {
    // <L.w, C.x, C.y, C.z>
    const r = new Float32Array(4);
    r[0] = L[3]; r[1] = C[0]; r[2] = C[1]; r[3] = C[2];
    return r;
  };
  const shufRR1 = (C: Float32Array, R: Float32Array): Float32Array => {
    // <C.y, C.z, C.w, R.x>
    const r = new Float32Array(4);
    r[0] = C[1]; r[1] = C[2]; r[2] = C[3]; r[3] = R[0];
    return r;
  };
  const shufRR2 = (C: Float32Array, R: Float32Array): Float32Array => {
    // <C.z, C.w, R.x, R.y>
    const r = new Float32Array(4);
    r[0] = C[2]; r[1] = C[3]; r[2] = R[0]; r[3] = R[1];
    return r;
  };

  // ---- Group 1 — 4 vertical same-column neighbours (%127..%150) ----
  // num0 starts as C (from %143 = fmuladd(v55, w55, C) i.e. C is the +c operand).
  // den0 starts as 1 (from %144 = fadd(w55, 1.0)).
  // But the first fmuladd already folds in v55 -> so we begin with num=C, den=(0)
  // and immediately step v55 (which the fmuladd matches by using C as the +c operand
  // and the fadd matching by using +1). Modelled directly: start num=C, den=<1,1,1,1>
  // BEFORE stepping v55, but we must not double-count v55. Instead: apply the .ll
  // exactly — start num=C, den=<0,0,0,0>, then step v55 with a fadd of 1 folded in
  // by initialising den to <1,1,1,1> AFTER the first step's fadd would have added w55.
  //
  // Cleaner-and-still-faithful approach: the IR does
  //     %143 = fmuladd(v55, w55, C)             -> num = C + v55*w55
  //     %144 = fadd(w55, 1.0)                   -> den = 1 + w55
  //     %145 = fmuladd(v71, w71, %143)          -> num += v71*w71
  //     %146 = fadd(%144, w71)                  -> den += w71
  //     ... (v103, v119)
  // So we initialise num=C, den=<1,1,1,1> and DO NOT run a step() for v55/v71/v103/v119;
  // instead we inline the four steps and let the +1 sit in the initial den.
  const acc: Acc = {
    num: new Float32Array(v87),        // start from C (%143 +c)
    den: new Float32Array([1, 1, 1, 1]), // start from 1 (%144 +1)
  };

  // v55 : yTT same-col
  {
    const diff = vFsub(v87, v55);           // %127
    const sq = vFmul(diff, diff);           // %131
    const arg = vFmul(vSigma, sq);          // %132
    const w = vExp2(arg);                   // %133
    acc.num = vFmuladd(v55, w, acc.num);    // %143 : (v55*w) + C
    acc.den = vFadd(acc.den, w);            // %144 : 1 + w
  }
  // v71 : yT same-col
  {
    const diff = vFsub(v87, v71);           // %128
    const sq = vFmul(diff, diff);           // %134
    const arg = vFmul(vSigma, sq);          // %135
    const w = vExp2(arg);                   // %136
    acc.num = vFmuladd(v71, w, acc.num);    // %145
    acc.den = vFadd(acc.den, w);            // %146
  }
  // v103 : yB same-col
  {
    const diff = vFsub(v87, v103);          // %129
    const sq = vFmul(diff, diff);           // %137
    const arg = vFmul(vSigma, sq);          // %138
    const w = vExp2(arg);                   // %139
    acc.num = vFmuladd(v103, w, acc.num);   // %147
    acc.den = vFadd(acc.den, w);            // %148
  }
  // v119 : yBB same-col
  {
    const diff = vFsub(v87, v119);          // %130
    const sq = vFmul(diff, diff);           // %140
    const arg = vFmul(vSigma, sq);          // %141
    const w = vExp2(arg);                   // %142
    acc.num = vFmuladd(v119, w, acc.num);   // %149
    acc.den = vFadd(acc.den, w);            // %150
  }

  // ---- Group 2 — "shift-left by 2 pixels" across 4 rows (%151..%186) ----
  // v153 = <v50.z, v50.w, v55.x, v55.y>   (top-2 row, shift-left-2)
  const v153 = shufLL2(v50, v55);           // %151/%152/%153
  const v156 = shufLL2(v66, v71);           // %154/%155/%156
  const v159 = shufLL2(v98, v103);          // %157/%158/%159
  const v162 = shufLL2(v114, v119);         // %160/%161/%162
  step(v87, v153, acc); // %179/%180
  step(v87, v156, acc); // %181/%182
  step(v87, v159, acc); // %183/%184
  step(v87, v162, acc); // %185/%186

  // ---- Group 3 — "shift-left by 1 pixel" across 4 rows (%187..%218) ----
  const v188 = shufLL1(v50, v55);           // %187/%188
  const v190 = shufLL1(v66, v71);           // %189/%190
  const v192 = shufLL1(v98, v103);          // %191/%192
  const v194 = shufLL1(v114, v119);         // %193/%194
  step(v87, v188, acc); // %211/%212
  step(v87, v190, acc); // %213/%214
  step(v87, v192, acc); // %215/%216
  step(v87, v194, acc); // %217/%218

  // ---- Group 4 — "shift-right by 1 pixel" across 4 rows (%219..%254) ----
  const v221 = shufRR1(v55, v60);           // %219/%220/%221
  const v224 = shufRR1(v71, v76);           // %222/%223/%224
  const v227 = shufRR1(v103, v108);         // %225/%226/%227
  const v230 = shufRR1(v119, v124);         // %228/%229/%230
  step(v87, v221, acc); // %247/%248
  step(v87, v224, acc); // %249/%250
  step(v87, v227, acc); // %251/%252
  step(v87, v230, acc); // %253/%254

  // ---- Group 5 — "shift-right by 2 pixels" across 4 rows (%255..%290) ----
  const v257 = shufRR2(v55, v60);           // %255/%256/%257
  const v260 = shufRR2(v71, v76);           // %258/%259/%260
  const v263 = shufRR2(v103, v108);         // %261/%262/%263
  const v266 = shufRR2(v119, v124);         // %264/%265/%266
  step(v87, v257, acc); // %283/%284
  step(v87, v260, acc); // %285/%286
  step(v87, v263, acc); // %287/%288
  step(v87, v266, acc); // %289/%290

  // ---- Group 6 — 4 horizontal neighbours in center row (%291..%325) ----
  const v293 = shufLL2(v82, v87);           // %291/%292/%293 : <v82.z, v82.w, C.x, C.y>
  const v295 = shufLL1(v82, v87);           // %294/%295       : <v82.w, C.x, C.y, C.z>
  const v298 = shufRR1(v87, v92);           // %296/%297/%298 : <C.y, C.z, C.w, v92.x>
  const v301 = shufRR2(v87, v92);           // %299/%300/%301 : <C.z, C.w, v92.x, v92.y>
  step(v87, v293, acc); // %318/%319
  step(v87, v295, acc); // %320/%321
  step(v87, v298, acc); // %322/%323
  step(v87, v301, acc); // %324/%325

  // ---- FINALISE ----
  // %326 : num / den
  const v326 = new Float32Array(4);
  v326[0] = fdiv(acc.num[0], acc.den[0]);
  v326[1] = fdiv(acc.num[1], acc.den[1]);
  v326[2] = fdiv(acc.num[2], acc.den[2]);
  v326[3] = fdiv(acc.num[3], acc.den[3]);
  // %327 : v326 + 0.5
  const v327 = new Float32Array(4);
  v327[0] = fadd(v326[0], 0.5);
  v327[1] = fadd(v326[1], 0.5);
  v327[2] = fadd(v326[2], 0.5);
  v327[3] = fadd(v326[3], 0.5);
  // %328 : clamp(v327, 0, 255)
  const v328 = vClamp(v327, 0, 255);
  // %329, %330..%333 : convert to u8 and store
  const outByteBase = (params.m_outputStride * gy + gx) * 4;
  f32ToU8Vec4(output, outByteBase, v328);
}
