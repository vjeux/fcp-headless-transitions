// bm3dnr_buf__bm3dnr_buf_ushort2fp16.ts — direct TS mapping of the
// Metal compute kernel `bm3dnr_buf::bm3dnr_buf_ushort2fp16` from
// HeliumSenso.framework/Versions/A/Resources/default.metallib.
//
// @shader bm3dnr_buf::bm3dnr_buf_ushort2fp16 (HeliumSenso)
// IR provenance: raw-port/re/shaders/bm3dnr_buf__bm3dnr_buf_ushort2fp16.ll
// (header: `0x0000000007aaad -- bm3dnr_buf::bm3dnr_buf_ushort2fp16`)
//
// Per-thread packed unpack-and-normalize:
//   read one ushort4 from `input` at (strideIn * gy + gx)
//   convert u16 → f32   (air.convert.f.v4f32.u.v4i16)
//   multiply each lane by the f32 constant 0x37800080 = 1.0/65535.0
//     (encoded in the .ll as the double literal 0x3EF0001000000000, whose
//      f32 narrowing round-trips exactly — see %27)
//   convert f32 → f16   (air.convert.f.v4f16.f.v4f32)
//   store the 4 half lanes as SCALAR halves at
//     (strideOut * gy + gx), (+1), (+2), (+3)   —  i.e. into 4 CONSECUTIVE
//     half slots. The output stride is expressed in half-scalar units and
//     the caller sizes the output allocation so that 4 output halves fit
//     inside a single "output pixel column" (see %32 .. %41).
//
// Signature (%N naming from the .ll):
//   void @bm3dnr_buf::bm3dnr_buf_ushort2fp16(
//     %params*      %0,   // params struct (4 fields, see below)
//     <2 x i32>     %1,   // thread_position_in_grid   (gx, gy)
//     <4 x i16>*    %2,   // input   (read)
//     half*         %3    // output  (write)
//   )
//
// Params struct layout (from !18 in the .ll):
//   uint m_strideIn      @0   → %16   (input row stride, in <4 x i16> vec4 units)
//   uint m_strideOut     @4   → %18   (output row stride, in HALF-scalar units)
//   uint m_globalWidth   @8   → %7    (grid.x upper bound, exclusive)
//   uint m_globalHeight  @12  → %12   (grid.y upper bound, exclusive)
//
// -----------------------------------------------------------------------------
// Denorms / fast-math state (from !air.compile_options !11..!13):
//   air.compile.denorms_disable
//   air.compile.fast_math_disable
//   air.compile.framebuffer_fetch_enable
// Only ordinary IEEE fmul / u16→f32 / f32→f16 conversions are used — the
// transcription is bit-exact against the AIR IR modulo the standard
// f32 rounding of TS Math.fround for the fmul, and the fp32→fp16 narrowing
// (Float16Array on modern JS, falling back to a manual round-to-nearest-even
// half encoder for older runtimes).

/** Ushort4 pixel — matches `<4 x i16>` lane order (u16-valued 0..65535). */
export type Ushort4 = readonly [number, number, number, number];

/** Params matching `%struct.bm3dnr_buf::bm3dnr_buf_ushort2fp16_params` (!18). */
export interface Ushort2Fp16Params {
  /** uint m_strideIn     — input row stride (in <4 x i16> vec4 units). */
  readonly strideIn: number;
  /** uint m_strideOut    — output row stride (in half-scalar units). */
  readonly strideOut: number;
  /** uint m_globalWidth  — grid.x upper bound, exclusive. */
  readonly globalWidth: number;
  /** uint m_globalHeight — grid.y upper bound, exclusive. */
  readonly globalHeight: number;
}

// f32 narrowing of the .ll's `float 0x3EF0001000000000` — Math.fround(1/65535).
// Verified: (1/65535) narrowed to f32 encodes to 0x37800080, which is exactly
// the value the metal compiler stored in the constant pool for this kernel.
const K_INV_65535_F32 = Math.fround(1 / 65535); // %27 constant

/**
 * Round a finite f32 (already fp32-narrowed) to IEEE 754 binary16 (fp16)
 * with round-to-nearest-even. Uses Float16Array when available (modern
 * V8 / JSC), falls back to a manual encoder — this is a well-known
 * bit-exact conversion, matching air.convert.f.v4f16.f.v4f32 semantics
 * for finite non-NaN inputs. Returns the fp16 value re-expanded to a
 * JS Number (i.e. the exact half rounded back to double).
 *
 * The scalar loop below hits this once per lane (4×/thread).
 */
type Float16ArrayCtor = { new (length: number): { [i: number]: number; length: number } };
const _F16A: Float16ArrayCtor | undefined =
  (globalThis as unknown as { Float16Array?: Float16ArrayCtor }).Float16Array;
const _f16buf: { [i: number]: number; length: number } | null =
  _F16A ? new _F16A(1) : null;

function f32ToF16(v: number): number {
  if (_f16buf) {
    _f16buf[0] = v;
    return _f16buf[0];
  }
  // Manual RNE encode → decode. Bit-layout: sign(1) | exp(5) | frac(10).
  const f32 = new Float32Array(1);
  const u32 = new Uint32Array(f32.buffer);
  f32[0] = v;
  const x = u32[0];
  const sign = (x >>> 16) & 0x8000;
  let exp = ((x >>> 23) & 0xff) - 127 + 15;
  const mant = x & 0x7fffff;
  let bits: number;
  if (exp >= 31) {
    bits = sign | 0x7c00 | (mant ? 0x200 : 0); // Inf / NaN
  } else if (exp <= 0) {
    if (exp < -10) {
      bits = sign;
    } else {
      // Subnormal: shift mantissa into fp16 subnormal range and RNE.
      const m = (mant | 0x800000) >>> (1 - exp);
      const round = ((m & 0x3fff) > 0x2000 || ((m & 0x3fff) === 0x2000 && ((m >>> 14) & 1) === 1)) ? 1 : 0;
      bits = sign | ((m >>> 13) + round);
    }
  } else {
    const round = ((mant & 0x1fff) > 0x1000 || ((mant & 0x1fff) === 0x1000 && ((mant >>> 13) & 1) === 1)) ? 1 : 0;
    let m = (mant >>> 13) + round;
    if (m >= 0x400) { m = 0; exp += 1; }
    if (exp >= 31) bits = sign | 0x7c00;
    else bits = sign | (exp << 10) | m;
  }
  // Decode fp16 back to Number.
  const s = (bits & 0x8000) ? -1 : 1;
  const e = (bits >>> 10) & 0x1f;
  const f = bits & 0x3ff;
  if (e === 0) return s * Math.pow(2, -14) * (f / 1024);
  if (e === 31) return f ? NaN : s * Infinity;
  return s * Math.pow(2, e - 15) * (1 + f / 1024);
}

/**
 * bm3dnr_buf::bm3dnr_buf_ushort2fp16 — direct TS mapping of the AIR body.
 * Every SSA value in the .ll is cited by the `// %N` tag on its producing
 * statement.
 */
export function bm3dnr_buf__bm3dnr_buf_ushort2fp16(
  params: Ushort2Fp16Params,           // %0
  gridPos: readonly [number, number],  // %1 (gx, gy)
  input: readonly Ushort4[],            // %2 <4 x i16>* (read)
  output: number[],                     // %3 half* (write, scalar half lanes)
): void {
  const gx = gridPos[0] | 0; // %5
  const gy = gridPos[1] | 0; // %10

  // Bounds checks — %8 / %13 (icmp ult, unsigned compare).
  if ((gx >>> 0) >= (params.globalWidth  >>> 0)) return; // %8  → %43 ret
  if ((gy >>> 0) >= (params.globalHeight >>> 0)) return; // %13 → %43 ret

  const strideIn  = params.strideIn  | 0; // %16
  const strideOut = params.strideOut | 0; // %18

  // %19  zext gx→i64
  // %20  zext gy→i64
  // %21  zext strideIn→i64
  // %22  = strideIn * gy   (row base, in ushort4 units)
  // %23  = %22 + gx        (input index)
  const idxIn = (Math.imul(strideIn, gy) + gx) | 0;
  // %24..%25  load <4 x i16>
  const in0 = input[idxIn];

  // %26  = air.convert.f.v4f32.u.v4i16(%25)  — unsigned u16 → f32
  //                                            (bit-exact, always representable).
  // JS numbers already carry the u16 exactly; wrapping through the u16 range
  // is a no-op for the values 0..65535 that this shader accepts.
  const f0 = (in0[0] & 0xffff);
  const f1 = (in0[1] & 0xffff);
  const f2 = (in0[2] & 0xffff);
  const f3 = (in0[3] & 0xffff);

  // %27  = fmul <4 x float> %26, <1/65535, 1/65535, 1/65535, 1/65535>
  const m0 = Math.fround(f0 * K_INV_65535_F32);
  const m1 = Math.fround(f1 * K_INV_65535_F32);
  const m2 = Math.fround(f2 * K_INV_65535_F32);
  const m3 = Math.fround(f3 * K_INV_65535_F32);

  // %28  = air.convert.f.v4f16.f.v4f32(%27)  — f32 → fp16 (RNE).
  const h0 = f32ToF16(m0); // %29
  const h1 = f32ToF16(m1); // %34
  const h2 = f32ToF16(m2); // %37
  const h3 = f32ToF16(m3); // %40

  // %30  = strideOut (i64)
  // %31  = strideOut * gy
  // %32  = %31 + gx     → output half index for lane 0
  const idxOut = (Math.imul(strideOut, gy) + gx) | 0;

  // store half %29, output[idxOut]      — %33
  output[idxOut]         = h0;
  // %35 = idxOut + 1 ; store half %34   — %36
  output[(idxOut + 1) | 0] = h1;
  // %38 = idxOut + 2 ; store half %37   — %39
  output[(idxOut + 2) | 0] = h2;
  // %41 = idxOut + 3 ; store half %40   — %42
  output[(idxOut + 3) | 0] = h3;

  // br label %43 ; ret void
}
