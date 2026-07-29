// HGTransform — Helium 4x4 double-precision transform matrix.
// Class boundary matches Helium's `HGTransform` (see /tmp/Helium_demangled.txt).
// Base: HGObject (ref-counted). Struct size = 0x90 bytes.
//
// STRUCT LAYOUT (recovered from ctor @0x1b41d0 and every accessor):
//   +0x00  vtable pointer          (HGTransform vtable @0x872fb3+RIP -> stored via C1 ctor)
//   +0x08  HGObject base state     (refcount + rtti; managed by HGObject ctor)
//   +0x10..+0x88  16 doubles       = 4x4 matrix, column-major, stride 8 bytes.
//                                    m[i][j] lives at offset 0x10 + (i + 4*j)*8 == 0x10 + i*8 + j*32
//                                    Equivalently: column j occupies bytes [0x10+32*j .. 0x30+32*j).
//                                    identity: [0]=1.0 @0x10, [5]=1.0 @0x38,
//                                              [10]=1.0 @0x60, [15]=1.0 @0x88 (@0x1b4207-0x1b421d).
//   sizeof == 0x90.
//
// Column-major index mapping (used throughout this file, mirrors the offsets exactly):
//     m[i + 4*j] == matrix column j, row i   (i in [0..3], j in [0..3])
//     offset of m[i + 4*j] = 0x10 + (i + 4*j)*8
//
// Disasm sources: raw-port/re/disasm/Helium.HGTransform.*.s (all @Helium ~0x1b41d0..0x1b6920).
// vtable slots relevant here (raw-port/army/tools/resolve.py Helium vtable HGTransform):
//     *0x38 -> HGTransform::LoadIdentity()                       @0x1b4480
//     *0x40 -> HGTransform::LoadMatrixf(float const*)            @0x1b44f0
//     *0x48 -> HGTransform::LoadMatrixd(double const*)           @0x1b4540
//     *0xc0 -> HGTransform::Multiply(HGTransform const*)         @0x1b5020
//     *0xc8 -> HGTransform::PreMultiply(HGTransform const*)      @0x1b5240
//     *0xd0 -> HGTransform::Transform(float*, float const*, int) @0x1b55e0
//     *0xd8 -> HGTransform::Project(float*, int, int) const      @0x1b59d0
//     *0xe0 -> HGTransform::IsIdentity() const                   @0x1b63b0
//
// RIP-relative constants (resolved via raw-port/army/tools/resolve.py Helium const <addr>):
//     @Helium 0x3ca260  double 1.0                     (identity diagonal; used by IsIdentity, IsXYFlip)
//     @Helium 0x85d3b8  double 3.814697265625e-06 = 2^-18
//                                                     (HasPerspective epsilon @0x1b6823)
//     @Helium 0x85aad0  16-byte sign-abs mask 0x7FFFFFFF_FFFFFFFF x2
//                                                     (used to strip sign for |x| comparisons)
//     @Helium 0x85fce0  16-byte sign-negate mask 0x80000000_00000000 x2
//                                                     (xorpd -> negate double)

export const HG_TRANSFORM_STRUCT_SIZE = 0x90;

/**
 * HGTransform — 4x4 double matrix (column-major).
 * Ports HGTransform from Helium; see @Helium 0x1b4170..0x1b6920.
 * See raw-port/re/disasm/Helium.HGTransform.*.s for the source disassembly of every method.
 */
export class HGTransform {
  /** m[0..15], column-major. m[i + 4*j] == matrix column j, row i. */
  public readonly m: Float64Array;

  /** HGTransform::HGTransform() @Helium 0x1b41d0.
   *  Constructs an identity 4x4. Body:
   *    - HGObject::HGObject() (@0x1b41d9)
   *    - vtable slot store (@0x1b41de-0x1b41e5)
   *    - xorps xmm0,xmm0; movups xmm0,{0x18,0x28,0x38,0x48,0x58,0x68,0x78} on rbx
   *      (@0x1b41e8-0x1b4203)  -> zeros doubles [1..14] except we then overwrite diagonals.
   *    - movabsq 0x3ff0000000000000; movq rax->{0x10,0x38,0x60,0x88}
   *      (@0x1b4207-0x1b421d)  -> writes 1.0 to m[0],m[5],m[10],m[15].
   */
  public constructor() {
    this.m = new Float64Array(16);
    this.m[0] = 1.0;
    this.m[5] = 1.0;
    this.m[10] = 1.0;
    this.m[15] = 1.0;
  }

  /** HGTransform::GetMatrixPtr() const @Helium 0x1b4470.
   *  Leaf: `leaq 0x10(%rdi), %rax` — returns pointer to the 16-double column-major storage.
   *  In this port we hand back the Float64Array directly. */
  public GetMatrixPtr(): Float64Array {
    return this.m;
  }

  /** HGTransform::LoadIdentity() @Helium 0x1b4480.
   *  Zero every double slot then write 1.0 to m[0], m[5], m[10], m[15]
   *  (@0x1b4484-0x1b44b9). */
  public LoadIdentity(): void {
    this.m.fill(0);
    this.m[0] = 1.0;
    this.m[5] = 1.0;
    this.m[10] = 1.0;
    this.m[15] = 1.0;
  }

  /** HGTransform::LoadColumnf(float const*, int col) @Helium 0x1b44d0.
   *  Two `cvtps2pd` loads convert 4 f32s from `src` to 4 f64s and store them into column `col`
   *  at offsets 0x10+col*32 and 0x20+col*32 (@0x1b44d4-0x1b44e6).
   *  Effect: matrix.column[col] = (f64)src[0..3]. */
  public LoadColumnf(src: Float32Array, col: number): void {
    // shll $0x2, edx ; movslq -> col*4 index shift for stride-8 (rdi + rax*8 == rdi + col*32).
    const base = col * 4;
    this.m[base + 0] = src[0];
    this.m[base + 1] = src[1];
    this.m[base + 2] = src[2];
    this.m[base + 3] = src[3];
  }

  /** HGTransform::GetMatrixd(double*) const @Helium 0x1b42f0.
   *  Straight copy of 16 doubles from this+0x10..0x88 to dst+0..0x78. */
  public GetMatrixd(dst: Float64Array): void {
    for (let i = 0; i < 16; i++) dst[i] = this.m[i];
  }

  /** HGTransform::LoadMatrixd(double const*) @Helium 0x1b4540.
   *  Reverse of GetMatrixd — copy 16 doubles from src into this+0x10..0x88. */
  public LoadMatrixd(src: Float64Array | ReadonlyArray<number>): void {
    for (let i = 0; i < 16; i++) this.m[i] = src[i];
  }

  /** HGTransform::GetMatrixf(float*) const @Helium 0x1b4270.
   *  4 blocks of `cvtpd2ps` pack two columns (4 doubles) into 4 floats and unpcklpd combines
   *  them into a 4-float row of dst (@0x1b4274-0x1b42dd). Result: dst[k] = (float)m[k] for k in [0..15]. */
  public GetMatrixf(dst: Float32Array): void {
    for (let i = 0; i < 16; i++) dst[i] = Math.fround(this.m[i]);
  }

  /** HGTransform::LoadMatrixf(float const*) @Helium 0x1b44f0.
   *  8 `cvtps2pd` loads convert 16 floats to 16 doubles (@0x1b44f4-0x1b452f). */
  public LoadMatrixf(src: Float32Array | ReadonlyArray<number>): void {
    for (let i = 0; i < 16; i++) this.m[i] = Math.fround(src[i]);
  }

  /** HGTransform::GetMatrixdouble4x4(simd::double4x4*) const @Helium 0x1b4420.
   *  Reads columns 0..3 (offsets 0x10,0x20,0x30,0x40,0x50,0x60,0x70,0x80) and writes them
   *  swapping COLUMNS 2 and 3 in the destination — the code stores xmm4/xmm5 (columns 3,2 of source)
   *  at dst 0x40/0x50 and xmm6/xmm7 (columns 5,4... wait) — trace carefully:
   *    xmm0 = 0x10..0x1f  ; xmm1 = 0x20..0x2f  ; xmm2 = 0x30..0x3f ; xmm3 = 0x40..0x4f
   *    xmm4 = 0x60..0x6f  ; xmm5 = 0x50..0x5f  ; xmm6 = 0x80..0x8f ; xmm7 = 0x70..0x7f
   *    store xmm0..xmm3 at dst 0..0x30 (this = src cols 0,1 as-is)
   *    store xmm5,xmm4 at dst 0x40,0x50  (columns 2 stays, column 3 flipped -> WRONG that reading)
   *  Actually re-reading: dst 0x40 <- xmm5 (src 0x50..0x5f = col2 lo)
   *                       dst 0x50 <- xmm4 (src 0x60..0x6f = col2 hi)   -> col 2 preserved
   *                       dst 0x60 <- xmm7 (src 0x70..0x7f = col3 lo)
   *                       dst 0x70 <- xmm6 (src 0x80..0x8f = col3 hi)   -> col 3 preserved
   *  So this is a straight copy of all 16 doubles column-by-column into simd::double4x4 (also column-major). */
  public GetMatrixdouble4x4(dst: Float64Array): void {
    for (let i = 0; i < 16; i++) dst[i] = this.m[i];
  }

  /** HGTransform::LoadMatrixdouble4x4(simd::double4x4 const*) @Helium 0x1b4650.
   *  Copies 4 16-byte lanes (128 bytes total = 16 doubles) from src to a stack buffer,
   *  then calls vtable+0x48 (LoadMatrixd @0x1b4540) on that buffer. So the effect is
   *  the same as LoadMatrixd(src as double[16]). */
  public LoadMatrixdouble4x4(src: Float64Array | ReadonlyArray<number>): void {
    // @0x1b46ab-0x1b46b5 -> callq *0x48(%rax) == LoadMatrixd; behavior is a straight 16-double copy.
    this.LoadMatrixd(src);
  }

  /** HGTransform::GetMatrixfloat4x4(simd::float4x4*) const @Helium 0x1b43a0.
   *  Same shape as GetMatrixf: 16 doubles narrowed via cvtpd2ps into 16 floats
   *  (column-major, both source and destination). */
  public GetMatrixfloat4x4(dst: Float32Array): void {
    for (let i = 0; i < 16; i++) dst[i] = Math.fround(this.m[i]);
  }

  /** HGTransform::LoadMatrixfloat4x4(simd::float4x4 const*) @Helium 0x1b45f0.
   *  Copies 4 16-byte lanes (64 bytes = 16 floats) to a stack buffer, then calls
   *  vtable+0x40 == LoadMatrixf @0x1b44f0. Effective behavior: LoadMatrixf(src as float[16]). */
  public LoadMatrixfloat4x4(src: Float32Array | ReadonlyArray<number>): void {
    // @0x1b4625-0x1b462c -> callq *0x40(%rax) == LoadMatrixf.
    this.LoadMatrixf(src);
  }

  /** HGTransform::LoadTransform(HGTransform const*) @Helium 0x1b46e0.
   *  Copies bytes 0x10..0x8f from src to this in 8 x 16-byte movups (@0x1b46e4-0x1b4726).
   *  I.e. copies the full 16-double matrix. Does NOT touch the vtable or the HGObject header. */
  public LoadTransform(src: HGTransform): void {
    for (let i = 0; i < 16; i++) this.m[i] = src.m[i];
  }

  /** HGTransform::Multiply(HGTransform const*) @Helium 0x1b5020.
   *  Despite the plain name, this LEFT-multiplies: this = rhs * this.
   *  The disasm has 4 nearly-identical column-loops (one per output column j=0..3):
   *    - Load the FOUR broadcast scalars t[k] = this.m[i+4*j] for k=0..3, i=0..3 (offsets
   *      0x10+j*32, 0x18+j*32, 0x20+j*32, 0x28+j*32 — @0x1b502d,0x504a,0x505c,0x506e for j=0).
   *    - For each rhs column k=0..3 (offsets 0x10, 0x30, 0x50, 0x70 for rows 0-1 halves; 0x20,
   *      0x40, 0x60, 0x80 for rows 2-3 halves), do: sum += rhs.col[k] * t[k].
   *    - Store the 4-double result back into this.col[j] (offsets 0x10+j*32 rows 0-1 and
   *      0x20+j*32 rows 2-3 — see @0x1b50a4, 0x50a9 for j=0).
   *  Null-guard @0x1b5024: `testq %rsi, %rsi; je 0x1b523a` — if rhs is null, do nothing.
   *
   *  Semantics: (new this)[i][j] = sum_k (rhs[i][k]) * (this[k][j])
   *  == columns of rhs weighted by scalars taken from THIS's column j
   *  == matrix product `rhs * this`. Post-multiply on OpenGL-style column-vector convention:
   *  used by Scale/Translate/etc. to apply their transform AFTER the current one.
   */
  public Multiply(rhs: HGTransform | null): void {
    // @0x1b5024: testq %rsi,%rsi ; je pop-and-ret.
    if (rhs === null) return;
    const t = this.m;
    const r = rhs.m;
    // Buffer output into locals so aliasing this==rhs is safe (the SIMD version cannot alias since
    // rdi and rsi are distinct pointers; but we mirror the semantics by reading t before writing).
    const out = new Float64Array(16);
    for (let j = 0; j < 4; j++) {
      // t[i+4*j] broadcast; result column j = sum_k this.col[j][k] * rhs.col[k]
      const t0 = t[0 + 4 * j];
      const t1 = t[1 + 4 * j];
      const t2 = t[2 + 4 * j];
      const t3 = t[3 + 4 * j];
      out[0 + 4 * j] = t0 * r[0] + t1 * r[4] + t2 * r[8]  + t3 * r[12];
      out[1 + 4 * j] = t0 * r[1] + t1 * r[5] + t2 * r[9]  + t3 * r[13];
      out[2 + 4 * j] = t0 * r[2] + t1 * r[6] + t2 * r[10] + t3 * r[14];
      out[3 + 4 * j] = t0 * r[3] + t1 * r[7] + t2 * r[11] + t3 * r[15];
    }
    for (let i = 0; i < 16; i++) t[i] = out[i];
  }

  /** HGTransform::PreMultiply(HGTransform const*) @Helium 0x1b5240.
   *  Right-multiplies: this = this * rhs.
   *  Disasm structure @0x1b524d-0x5317: loads xmm3=this[0][0], xmm2=this[0][1], xmm1=this[0][2],
   *  xmm0=this[0][3] (= this row 0 across offsets 0x10, 0x30, 0x50, 0x70), then computes 4 dot
   *  products against rhs columns 0..3 to produce row 0 of the product; stores back to row 0
   *  (offsets 0x10, 0x30, 0x50, 0x70 of this — see @0x1b5317 store). The full disasm repeats
   *  this for each row (4 blocks total; the truncated view here just shows the first row).
   *  Null guard @0x1b5244: same testq/je as Multiply.
   *
   *  Semantics: (new this)[i][j] = sum_k this[i][k] * rhs[k][j] == `this * rhs`.
   */
  public PreMultiply(rhs: HGTransform | null): void {
    // @0x1b5244: testq %rsi,%rsi ; je pop-and-ret.
    if (rhs === null) return;
    const t = this.m;
    const r = rhs.m;
    const out = new Float64Array(16);
    for (let i = 0; i < 4; i++) {
      // row i of this: this[i][0]=t[i], this[i][1]=t[i+4], this[i][2]=t[i+8], this[i][3]=t[i+12].
      const a0 = t[i + 0];
      const a1 = t[i + 4];
      const a2 = t[i + 8];
      const a3 = t[i + 12];
      // out[i][j] = a0*r[0][j] + a1*r[1][j] + a2*r[2][j] + a3*r[3][j]; rhs is column-major so
      // r[k][j] = r[k + 4*j].
      out[i + 0]  = a0 * r[0]  + a1 * r[1]  + a2 * r[2]  + a3 * r[3];
      out[i + 4]  = a0 * r[4]  + a1 * r[5]  + a2 * r[6]  + a3 * r[7];
      out[i + 8]  = a0 * r[8]  + a1 * r[9]  + a2 * r[10] + a3 * r[11];
      out[i + 12] = a0 * r[12] + a1 * r[13] + a2 * r[14] + a3 * r[15];
    }
    for (let k = 0; k < 16; k++) t[k] = out[k];
  }
}
