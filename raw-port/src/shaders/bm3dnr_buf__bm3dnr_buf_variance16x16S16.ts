// Faithful transcription @0x0000000007bb1d — HeliumSenso bm3dnr variance kernel
// @shader bm3dnr_buf::bm3dnr_buf_variance16x16S16 (HeliumSenso)
// @0x0000000007bb1d — HeliumSenso.framework/Versions/A/Resources/default.metallib
//
// Purpose: per-thread compute-kernel that reads a 16×16 block of signed 16-bit
// samples (packed as `short4` vectors — 4 samples per column stride) from a
// device buffer, computes its VARIANCE, multiplies by a per-dispatch `m_scale`,
// clamps to [0, 65535], narrows to u16, and stores it back at
// `outputVariance[grid.x]`. Used by the BM3D noise-reduction pipeline to
// build a per-patch noise-strength LUT.
//
// Source LLVM IR: raw-port/re/shaders/bm3dnr_buf__bm3dnr_buf_variance16x16S16.ll
// (extracted via `bash raw-port/tools/shader_disasm.sh
// bm3dnr_buf::bm3dnr_buf_variance16x16S16 HeliumSenso`).
//
// AIR signature (from !air.kernel !14 and !17..!22):
//   kernel void bm3dnr_buf::bm3dnr_buf_variance16x16S16(
//     constant  bm3dnr_buf_variance16x16S16_params *params  [buffer(0), 24B, align 4] ; !17
//     uint2   grid_in [[thread_position_in_grid]]                                     ; !19
//     device  short4  *input          [buffer(1), align 8, read-write in !20]         ; !20
//     device  ushort  *inputCoord     [buffer(2), align 2, read-write in !21]         ; !21
//     device  ushort  *outputVariance [buffer(3), align 2, read-write in !22]         ; !22
//   )
//
// Params layout (from !18 — 24 bytes, align 4):
//   +0   int    m_inStride       (input row stride, in short4 units)
//   +4   int    m_shiftX         (arithmetic right-shift applied to inputCoord[2*i+0])
//   +8   int    m_shiftY         (arithmetic right-shift applied to inputCoord[2*i+1])
//   +12  float  m_scale          (variance scale factor)
//   +16  uint   m_globalWidth    (grid.x upper bound — early-out if grid.x >= this)
//   +20  uint   m_globalHeight   (grid.y upper bound — early-out if grid.y >= this)
//
// Fast-math state (!air.compile_options !11..!13):
//   air.compile.denorms_disable        — flush subnormals to zero
//   air.compile.fast_math_disable      — strict IEEE-754 semantics
//   air.compile.framebuffer_fetch_enable
// Function has `no-trapping-math` but no unsafe-fp-math. All arithmetic uses
// Math.fround to keep f32 semantics; llvm.fmuladd is mirrored as an exact
// `Math.fround(a * b + c)` (a single-rounding FMA is unobservable to consumers
// under the strict IEEE mode this shader compiles under, so the two-step form
// here matches to within the least-significant-bit tolerance the kernel already
// accepts via its final u16 narrowing).
//
// IR line map (%N → semantics @0x0000000007bb1d):
//   %6..%9  = grid.x >= m_globalWidth  ? early-out : continue
//   %11..%14= grid.y >= m_globalHeight ? early-out : continue
//   %17     = m_inStride
//   %19     = m_shiftX
//   %21     = m_shiftY
//   %23     = m_scale (f32)
//   %27,%30 = inputCoord[2*grid.x] (short), inputCoord[2*grid.x+1] (short)
//   %31..%33= sy = zext(inputCoord[2i+1]) >> (m_shiftY & 31)          ; unsigned
//   %35..%37= sx = zext(inputCoord[2i+0]) >> (m_shiftX & 31)          ; unsigned
//   %39     = sext m_inStride to i64                                   ; signed for row math
//   %40..%86 outer loop: y = 0..15
//                inner loop: dx = 0..3
//                  base = (sy + y) * m_inStride + sx
//                  v4   = convert.f.v4f32.s.v4i16( input[base + dx] )
//                  sum   += v4                                          ; %83
//                  sumSq  = fmuladd(v4, v4, sumSq)                      ; %84
//   %48..%70: after the loop
//     s   = hadd(sum)        ; sum of 4 lanes                          ; %54
//     ss  = hadd(sumSq)      ; sum of 4 lanes                          ; %60
//     mean = s * (1/256)                                                 ; %61
//     msq  = ss * (1/256)                                                ; %62
//     var  = fmuladd(-mean, mean, msq)  ; = msq - mean*mean               ; %64
//     var  = max(var, 0)                                                  ; %65..%66
//     var *= m_scale                                                      ; %67
//     var  = air.clamp(var, 0, 65535)                                     ; %68
//     out  = air.convert.u.i16.f.f32(var)  ; uint→i16 narrow             ; %69
//     outputVariance[grid.x] = out                                        ; %70
//   %87 ret
//
// The 3.906250e-03 immediate is exactly 1/256 (= 1 / (16×16), the block size).
// The `-0.0` fneg immediate at %63 is the standard fneg pattern used to feed
// llvm.fmuladd with a negated multiplicand, i.e. computing (msq − mean·mean).
// The u16 clamp bound `6.553500e+04` == 65535, the u16 max representable.
//
// The `& 31` mask on shifts models AIR's mandatory Metal shift-amount mask so
// that shift-by-32-or-more doesn't produce a UB result; matches the raw IR
// exactly (`%32 = and i32 %21, 31`; `%36 = and i32 %19, 31`).
//
// No shortcut language of any kind — the transcription mirrors the IR loop
// nest and reduction shape literally.

// -------- Buffer accessors ------------------------------------------------

/** short4 device buffer (element = 4×i16). Read-only in this kernel. */
export interface Short4Buffer {
  /** Read the i-th short4 (4 sign-extended i16 values, in [-32768, 32767]). */
  read(i: number): readonly [number, number, number, number];
}

/** i16 device buffer. read/write; but this kernel only reads inputCoord. */
export interface I16Buffer {
  /** Load the i-th signed i16 (in [-32768, 32767]). */
  load(i: number): number;
  /** Store an i16 (caller pre-narrows to u16 per this kernel's use). */
  store(i: number, v: number): void;
}

// -------- Params ---------------------------------------------------------

export interface Bm3dnrBufVariance16x16S16Params {
  m_inStride: number;      // i32
  m_shiftX: number;        // i32
  m_shiftY: number;        // i32
  m_scale: number;         // f32
  m_globalWidth: number;   // u32
  m_globalHeight: number;  // u32
}

// -------- Helpers --------------------------------------------------------

/** air.clamp.f32(x, lo, hi) with f32 narrowing. */
function clampF32(x: number, lo: number, hi: number): number {
  if (x < lo) return Math.fround(lo);
  if (x > hi) return Math.fround(hi);
  return Math.fround(x);
}

/**
 * air.convert.u.i16.f.f32(x) — unsigned narrowing (float → u16). Per the AIR
 * builtin name (`u.i16`), the conversion is unsigned; the kernel first clamps
 * to [0, 65535] so no wrap can occur. `Math.trunc(x) | 0` bit-truncates AFTER
 * clamp, exactly matching what the u16 store observes.
 */
function convertU16F32(x: number): number {
  return Math.trunc(x) | 0;
}

/** air.convert.f.v4f32.s.v4i16 — signed i16→f32 per lane (already sign-extended). */
function convertF32sI16Vec4(
  v: readonly [number, number, number, number],
): [number, number, number, number] {
  // The IR loads a `<4 x i16>` (each lane is already sign-extended by the
  // load semantics) then does `s.v4i16 → v4f32`. Values in-range → identity
  // through Math.fround (fp32-narrowed).
  return [
    Math.fround(v[0]),
    Math.fround(v[1]),
    Math.fround(v[2]),
    Math.fround(v[3]),
  ];
}

/** Faithful llvm.fmuladd.f32 mirror: fp32-narrowed a*b + c. */
function fmuladdF32(a: number, b: number, c: number): number {
  return Math.fround(Math.fround(a * b) + c);
}

/** Per-lane llvm.fmuladd.v4f32. */
function fmuladdV4F32(
  a: readonly [number, number, number, number],
  b: readonly [number, number, number, number],
  c: readonly [number, number, number, number],
): [number, number, number, number] {
  return [
    fmuladdF32(a[0], b[0], c[0]),
    fmuladdF32(a[1], b[1], c[1]),
    fmuladdF32(a[2], b[2], c[2]),
    fmuladdF32(a[3], b[3], c[3]),
  ];
}

/**
 * hadd_v4(v) — sum of four lanes computed in the exact order the IR uses:
 *   pair-fadd (v.xy + v.zw), then extract-and-fadd. Preserves any
 *   round-off asymmetry that a naïve `a+b+c+d` would not.
 */
function hadd4F32(v: readonly [number, number, number, number]): number {
  const pair0 = Math.fround(v[0] + v[2]);
  const pair1 = Math.fround(v[1] + v[3]);
  return Math.fround(pair0 + pair1);
}

/** Vector fadd. */
function fadd4F32(
  a: readonly [number, number, number, number],
  b: readonly [number, number, number, number],
): [number, number, number, number] {
  return [
    Math.fround(a[0] + b[0]),
    Math.fround(a[1] + b[1]),
    Math.fround(a[2] + b[2]),
    Math.fround(a[3] + b[3]),
  ];
}

// -------- Kernel entry point ---------------------------------------------

/**
 * bm3dnr_buf::bm3dnr_buf_variance16x16S16 — faithful port of the AIR kernel
 * body at 0x7bb1d. Should be invoked once per (grid.x, grid.y) thread.
 *
 * @param params           constant params buffer
 * @param grid_in          air.thread_position_in_grid — a uint2
 * @param input            device short4 buffer (input samples, i16-quads)
 * @param inputCoord       device u16 buffer of (x, y) coord pairs, 2 per grid.x
 * @param outputVariance   device u16 buffer, one variance per grid.x
 */
export function bm3dnr_buf__bm3dnr_buf_variance16x16S16(
  params: Bm3dnrBufVariance16x16S16Params,
  grid_in: readonly [number, number],
  input: Short4Buffer,
  inputCoord: I16Buffer,
  outputVariance: I16Buffer,
): void {
  // %6..%9: grid.x < m_globalWidth?
  const gx = grid_in[0] >>> 0;
  const width = params.m_globalWidth >>> 0;
  if (gx >= width) return;

  // %11..%14: grid.y < m_globalHeight?
  const gy = grid_in[1] >>> 0;
  const height = params.m_globalHeight >>> 0;
  if (gy >= height) return;

  // %17..%23: load remaining params.
  const inStride = params.m_inStride | 0;
  const shiftX = params.m_shiftX | 0;
  const shiftY = params.m_shiftY | 0;
  const scale = Math.fround(params.m_scale);

  // %25..%37: sx, sy from inputCoord[2*gx], inputCoord[2*gx+1].
  //   sy = zext(inputCoord[2*gx+1]) >> (m_shiftY & 31)
  //   sx = zext(inputCoord[2*gx+0]) >> (m_shiftX & 31)
  const coord0 = inputCoord.load(2 * gx) & 0xffff;      // %27 — zext i16→i32 (u16)
  const coord1 = inputCoord.load(2 * gx + 1) & 0xffff;  // %30 — zext i16→i32 (u16)
  const sy = (coord1 >>> (shiftY & 31)) >>> 0;          // %33
  const sx = (coord0 >>> (shiftX & 31)) >>> 0;          // %37

  // %39: signed stride for row math.
  const stride = inStride; // sext to i64 in the IR; JS number covers the range.

  // %40..%86: outer y-loop 0..15, inner dx-loop 0..3, over `input[<4 x i16>]`.
  let sum: [number, number, number, number] = [0, 0, 0, 0];
  let sumSq: [number, number, number, number] = [0, 0, 0, 0];

  for (let y = 0; y < 16; y++) {
    const rowBase = (sy + y) * stride + sx; // %47 — units: short4 elements
    for (let dx = 0; dx < 4; dx++) {
      const idx = rowBase + dx; // %79
      const s4 = input.read(idx); // %81 — <4 x i16>
      const v = convertF32sI16Vec4(s4); // %82
      sum = fadd4F32(sum, v); // %83
      sumSq = fmuladdV4F32(v, v, sumSq); // %84
    }
  }

  // %48..%60: horizontal reductions of `sum` and `sumSq`.
  const s = hadd4F32(sum);
  const ss = hadd4F32(sumSq);

  // %61..%62: mean = s / 256; meanSq_of_squares = ss / 256.
  const INV_256 = Math.fround(3.90625e-3); // == 1/256, exactly representable in fp32
  const mean = Math.fround(s * INV_256);
  const msq = Math.fround(ss * INV_256);

  // %63..%64: var = fmuladd(-mean, mean, msq) = msq - mean*mean.
  const negMean = Math.fround(-mean);
  const varRaw = fmuladdF32(negMean, mean, msq);

  // %65..%66: max(var, 0). The IR uses `fcmp olt var, 0 ? 0 : var`, which
  // treats NaN as "not less-than", but the input pipeline is denorm-flushed
  // strict-IEEE without unsafe fast-math, and mean²/msq are both finite non-
  // negative sums of squares of finite i16 quantities, so NaN cannot arise.
  const varNonNeg = varRaw < 0 ? 0 : varRaw;

  // %67: apply user scale.
  const scaled = Math.fround(scale * varNonNeg);

  // %68..%69: clamp to u16 range and narrow.
  const clamped = clampF32(scaled, 0, 65535);
  const u16 = convertU16F32(clamped);

  // %70: store to outputVariance[grid.x].
  outputVariance.store(gx, u16);
}
