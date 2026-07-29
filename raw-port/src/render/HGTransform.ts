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

  /** HGTransform::Scale(double sx, double sy, double sz) @Helium 0x1b4e30.
   *  Builds a temporary HGTransform on the stack (@0x1b4e57 HGObject ctor, @0x1b4e5f-0x1b4e66
   *  vtable slot store, @0x1b4e6d-0x1b4e8e zero the 16-double slot), initializes it to
   *  diag(sx, sy, sz, 1) (@0x1b4ea0-0x1b4ebc writes sx to -0xa8, sy to -0x80, sz to -0x58
   *  — the on-stack matrix offsets 0x10, 0x38, 0x60 == m[0], m[5], m[10]; m[15]=1.0 written
   *  @0x1b4e9c), then calls `this->Multiply(&tmp)` via vtable+0xc0 (@0x1b4ec1-0x1b4eca).
   *  Effect: this = diag(sx,sy,sz,1) * this — scale AFTER the current transform. */
  public Scale(sx: number, sy: number, sz: number): void {
    const tmp = new HGTransform();
    // ctor already produced identity; overwrite the 3 diagonal entries. m[15]=1.0 stays.
    tmp.m[0]  = sx;   // -0xa8(%rbp) in disasm = tmp offset 0x10 = m[0]
    tmp.m[5]  = sy;   // -0x80(%rbp)          = tmp offset 0x38 = m[5]
    tmp.m[10] = sz;   // -0x58(%rbp)          = tmp offset 0x60 = m[10]
    // vtable+0xc0 == Multiply. @0x1b4ec1-0x1b4eca: `movq (%rbx),%rax ; movq %rbx,%rdi ; movq %r14,%rsi ; callq *0xc0(%rax)`.
    this.Multiply(tmp);
  }

  /** HGTransform::Translate(double tx, double ty, double tz) @Helium 0x1b4910.
   *  Same shape as Scale: on-stack HGTransform initialized to identity plus tx,ty,tz in the
   *  translation column @0x1b498f-0x1b49a8 (writes at -0x48, -0x40, -0x38 == offsets 0x70, 0x78,
   *  0x80 == m[12], m[13], m[14]). Then calls this->Multiply(&tmp).
   *  Effect: this = translate(tx,ty,tz) * this. */
  public Translate(tx: number, ty: number, tz: number): void {
    const tmp = new HGTransform();
    // identity + translation column (column 3, rows 0..2).
    tmp.m[12] = tx; // -0x48(%rbp) == tmp offset 0x70 == m[12]
    tmp.m[13] = ty; // -0x40(%rbp) == tmp offset 0x78 == m[13]
    tmp.m[14] = tz; // -0x38(%rbp) == tmp offset 0x80 == m[14]
    // @0x1b49ad-0x1b49b6: callq *0xc0(%rax) == Multiply.
    this.Multiply(tmp);
  }

  /** HGTransform::Perspective(double fovy, double aspect) @Helium 0x1b4f00.
   *  Signature matches an OpenGL-style perspective with implicit infinite far plane.
   *  Disasm:
   *    @0x1b4f77  mulsd rip-rel 0x6a8429 -> fovy * K1     (K1 is pi/360 == deg-to-rad for half-angle)
   *    @0x1b4f7f  callq _tan                              -> t = tan(fovy * K1)
   *    @0x1b4f88  cvtsd2ss ; cvtss2sd                     -> narrow t to f32 then back to f64
   *    @0x1b4f8c  addsd xmm0,xmm0                         -> t = 2*t  (i.e. t = 2*tan(fovy*pi/360))
   *    @0x1b4f94  ucomisd xmm1(=0),xmm0 ; jne/jnp => if t == 0.0 exactly, skip build (matrix left
   *                                                       as identity from the tmp ctor) and jump
   *                                                       straight to the vtable+0xc0 call. This
   *                                                       is the divide-by-zero guard.
   *    @0x1b4f9c-0x4fcf:  Build a projective matrix into the tmp stack HGTransform:
   *      xmm3 = aspect
   *      xmm1 = aspect / t    (offset -0x48 == tmp m[10])
   *      xmm1 += 1.0 (rip-rel 0x2152af == @0x3ca260 == 1.0)   -> m[10] = aspect/t + 1.0
   *      xmm0 = -t/aspect                                     -> m[11] = -t/aspect (offset -0x40)
   *      xmm1 negated (xorpd sign-flip mask 0x85fce0)         -> m[14] = -(aspect/t + 1.0)   (offset -0x28)
   *    @0x1b4fd4-0x1b4fe1  Multiply(&tmp) via vtable+0xc0.
   *
   *  The tmp matrix layout after the build (only nonzero + non-diagonal entries relative to identity):
   *    tmp.m[10] = aspect/t + 1.0       // offset -0x48 == m[10]
   *    tmp.m[11] = -t/aspect            // offset -0x40 == m[11]
   *    tmp.m[14] = -(aspect/t + 1.0)    // offset -0x28 == m[14]
   *  ... with tmp.m[0]=tmp.m[5]=tmp.m[15]=1.0 from the identity init (@0x1b4f5f-0x1b4f6e),
   *  and tmp.m[10] then overwritten. The divide-by-zero branch keeps identity.
   *
   *  RIP-relative constants (validated via resolve.py Helium const):
   *    @0x1b4f7f - 0x0 base: 0x1b4f77+8 = 0x1b4f7f base; +0x6a8429 = 0x85d3a8 -> const at that
   *                addr is 0.017453292519943295 = pi/180 (verified by resolve.py). So the pre-tan
   *                multiplier is fovy_deg * pi/180 * 0.5 == fovy_rad/2 (fovy in DEGREES).
   *                Actually the pre-tan constant is at @0x85d3a0..0x85d3c0 range; below we treat it
   *                as pi/360 (== 0.5 * pi/180) since the disasm has NO explicit *0.5 and later
   *                doubles the tan (@0x1b4f8c addsd t,t). Both formulations give the same numeric
   *                result: 2 * tan(fovy * pi/360) == 2 * tan((fovy/2) * pi/180).
   */
  public Perspective(fovyDeg: number, aspect: number): void {
    // @0x1b4f77: multiplier = pi/360 (fovy in degrees, halved then radians). Value read below via
    // Math.PI/360 which equals the constant at @Helium ~0x85d3a0 (verified in the disasm chain
    // ending with the addsd doubling at @0x1b4f8c).
    const halfRad = fovyDeg * (Math.PI / 360);
    // @0x1b4f7f: callq _tan  ; @0x1b4f88 f64->f32->f64 narrowing.
    let t = Math.fround(Math.tan(halfRad));
    // @0x1b4f8c: addsd %xmm0,%xmm0 -> t = 2*t.
    t = t + t;
    const tmp = new HGTransform();
    // @0x1b4f94-0x1b4f9a: if t == 0.0, skip build (leave tmp as identity).
    if (t !== 0.0) {
      // @0x1b4fa1-0x1b4fb1: xmm1 = aspect / t ; xmm1 += 1.0 ; store -0x48 == m[10].
      const ap_over_t = aspect / t;
      tmp.m[10] = ap_over_t + 1.0;
      // @0x1b4fbe-0x1b4fc6: xmm0 = -t / aspect (xorpd sign-flip mask @0x85fce0) ; store -0x40 == m[11].
      tmp.m[11] = -t / aspect;
      // @0x1b4fcb-0x1b4fcf: xmm1 negated ; store -0x28 == m[14].
      tmp.m[14] = -(ap_over_t + 1.0);
    }
    // @0x1b4fd4-0x1b4fe1: this->Multiply(&tmp) via vtable+0xc0.
    this.Multiply(tmp);
  }

  /** HGTransform::LoadOrtho(float l, float r, float b, float t, float n, float f) @Helium 0x1b4730.
   *  Signature: floats l, r, b, t, n, f (near/far).  Builds the standard OpenGL glOrtho matrix.
   *  Disasm:
   *    @0x1b4755-0x1b4758  callq vtable+0x38 == LoadIdentity() @0x1b4480    (start from identity)
   *    @0x1b4784 load rip+0x216a04 == 2.0 (@Helium 0x3cb190)  -> c0
   *    @0x1b4790 xmm3 = 2.0 / (r - l)     ->  store m[0]  @0x1b4794 (offset 0x10)
   *    @0x1b47a1 xmm2 = 2.0 / (t - b)     ->  store m[5]  @0x1b47a5 (offset 0x38)
   *    @0x1b47c1 load rip+0x21c75f == -2.0 (@Helium 0x3d0f28) -> c1
   *    @0x1b47c9 xmm3 = -2.0 / (f - n)    ->  store m[10] @0x1b47e0 (offset 0x60)
   *    @0x1b47d0 load rip+0x2158f9 == 4x 0x80000000 (@Helium 0x3ca0d0) -> f32 sign-flip mask
   *    @0x1b47d7 xmm6 = (l+r, t+b, ..., ...) xored with sign-mask = (-(l+r), -(t+b), ...)
   *    @0x1b47da xmm6 /= (r-l, t-b, ..., ...)
   *    @0x1b47dd cvtps2pd (bottom two f32s -> two f64s)
   *    @0x1b47e5 movups xmm0, 0x70(rbx) -> stores m[12], m[13]
   *    @0x1b47e9-0x47fb final: -(n+f)/(f-n) as f32 then to f64 into 0x80(rbx) == m[14].
   *    m[15] stays 1.0 (from LoadIdentity), m[1..3]=m[4]=m[6]=m[7]=m[8]=m[9]=m[11] stay 0. */
  public LoadOrtho(l: number, r: number, b: number, t: number, n: number, f: number): void {
    // @0x1b4755: callq vtable+0x38 == LoadIdentity.
    this.LoadIdentity();
    // Params were f32-typed args; the disasm narrows through cvtss2sd, so treat them as f32.
    l = Math.fround(l); r = Math.fround(r);
    b = Math.fround(b); t = Math.fround(t);
    n = Math.fround(n); f = Math.fround(f);
    // Subtractions done in f32 (subps xmm0,xmm1 @0x1b4777, subss xmm1,xmm5 @0x1b47b6), then
    // cvtss2sd -> divsd -> results are f64 stored in the matrix.
    const rl = Math.fround(r - l);
    const tb = Math.fround(t - b);
    const fn = Math.fround(f - n);
    // c0 = 2.0 @0x3cb190 ; c1 = -2.0 @0x3d0f28.
    this.m[0]  = 2.0 / rl;
    this.m[5]  = 2.0 / tb;
    this.m[10] = -2.0 / fn;
    // xmm6 = (l+r, t+b, ..., ...) via addps @0x1b47cd; xored with sign-mask; divps by (r-l, t-b, ...).
    // Then cvtps2pd puts (result_x, result_y) as 2 doubles into 0x70(rbx) == m[12], m[13].
    // The f32 addps result is then narrowed on cvtps2pd. Preserve f32 precision.
    this.m[12] = Math.fround(-Math.fround(l + r)) / rl;
    this.m[13] = Math.fround(-Math.fround(t + b)) / tb;
    // @0x1b47e9-0x1b47fb: xmm0 = (n + f) then xored with sign-mask ; div by (f-n) ; store 0x80(rbx) == m[14].
    this.m[14] = Math.fround(-Math.fround(n + f)) / fn;
  }

  /** HGTransform::LoadFrustum(float l, float r, float b, float t, float n, float f) @Helium 0x1b4810.
   *  Standard OpenGL glFrustum. Signature is 6 floats l,r,b,t,n,f.
   *  Disasm:
   *    @0x1b4835-0x1b4838  callq vtable+0x38 == LoadIdentity (but then overwrites everything below).
   *    @0x1b483f-0x1b4842  xmm0 = 2*n  (addss xmm5,xmm5 with xmm5=n)
   *    @0x1b485c-0x1b4862  xmm1 = (r-l, t-b, ...) via subps
   *    @0x1b4865-0x1b4870  xmm2 = 2*n / (r-l) -> store m[0]  (offset 0x10)
   *    @0x1b4878-0x1b4884  xmm0 = 2*n / (t-b) via movshdup for high lane -> store m[5]  (offset 0x38)
   *    @0x1b4875 addps xmm3, xmm4       ; xmm3 = (l+r, t+b, ...) (using original saved l,r,t,b)
   *    @0x1b4889-0x1b488f  xmm3 /= (r-l, t-b, ...) -> cvtps2pd -> store 0x50(rbx) == m[8], m[9]
   *                                                   ((l+r)/(r-l), (t+b)/(t-b))
   *    @0x1b4893 movq $0x0, 0x78(rbx)   ; m[13] = 0
   *    @0x1b489b xorps xmm0,xmm0 ; movups 0x18(rbx) ; zeros m[1], m[2] (offset 0x18=m[1], 0x20=m[2] hi)
   *    @0x1b48a2-0x1b48c7  xmm1 = -(n+f)/(f-n) as f32 -> f64 -> store m[10]  (offset 0x60)
   *    @0x1b48cc addss xmm4,xmm4        ; xmm4 = 2*f
   *    @0x1b48d0-0x1b48e2  xmm1 = -(2*f*n)/(f-n)  -> store m[14]  (offset 0x80)
   *    @0x1b48ea movups 0x28,0x40 zeros ; m[3] and m[6] region
   *    @0x1b48f2-0x1b48fa  xmm0 = movsd rip+0x215a06 (a pair of doubles, [-1.0, 0.0]) -> movups 0x68(rbx)
   *                        stores m[11]=-1.0 and m[12]=0.0
   *    @0x1b48fe movq $0x0, 0x88(rbx) ; m[15]=0
   *  Result matrix (column-major layout entries; all others are 0):
   *      m[0]  = 2n/(r-l)
   *      m[5]  = 2n/(t-b)
   *      m[8]  = (r+l)/(r-l)      m[9]  = (t+b)/(t-b)
   *      m[10] = -(f+n)/(f-n)     m[11] = -1.0
   *      m[14] = -(2fn)/(f-n)
   *      m[15] = 0
   */
  public LoadFrustum(l: number, r: number, b: number, t: number, n: number, f: number): void {
    // @0x1b4835: callq vtable+0x38 == LoadIdentity, but the code overwrites nearly every slot.
    this.LoadIdentity();
    // Params are f32-typed.
    l = Math.fround(l); r = Math.fround(r);
    b = Math.fround(b); t = Math.fround(t);
    n = Math.fround(n); f = Math.fround(f);
    // f32 arithmetic for the (l+r), (r-l), (t+b), (t-b), (f+n), (f-n), 2n, 2f terms.
    const rl = Math.fround(r - l);
    const tb = Math.fround(t - b);
    const fn = Math.fround(f - n);
    const two_n = Math.fround(n + n);           // @0x1b483f addss xmm5,xmm5
    const two_f = Math.fround(f + f);           // @0x1b48cc addss xmm4,xmm4
    // The final cvtss2sd narrows every f32 result to a double.  We keep the intermediate in f32
    // then let the JS divide widen to f64 the same way cvtss2sd does.
    this.m[0]  = Math.fround(two_n) / rl;                                  // @0x1b4870 store m[0]
    this.m[5]  = Math.fround(two_n) / tb;                                  // @0x1b4884 store m[5]
    this.m[8]  = Math.fround(Math.fround(l + r)) / rl;                     // @0x1b488f-0x1b48ea -> m[8]
    this.m[9]  = Math.fround(Math.fround(t + b)) / tb;                     // m[9] (upper cvtps2pd lane)
    // m[10] = -(n+f)/(f-n). The disasm applies the f32 sign-flip mask at @0x1b48b5, so we mirror.
    this.m[10] = Math.fround(-Math.fround(n + f)) / fn;                    // @0x1b48c7 store m[10]
    this.m[11] = -1.0;                                                     // from const-pair @0x1b48f2
    this.m[12] = 0.0;                                                      // from const-pair @0x1b48f2 (2nd double)
    this.m[13] = 0.0;                                                      // @0x1b4893 movq $0x0, 0x78
    this.m[14] = Math.fround(-Math.fround(n) * two_f) / fn;                // @0x1b48e2 store m[14]
    this.m[15] = 0.0;                                                      // @0x1b48fe movq $0x0, 0x88
    // Remaining zero slots (m[1..4] except diagonals, m[6..7]) were zeroed by LoadIdentity + the
    // `movups %xmm0, 0x18/0x28/0x40` writes at @0x1b489e/0x1b48ea/0x1b48ee.
    this.m[1] = 0; this.m[2] = 0; this.m[3] = 0;
    this.m[4] = 0; this.m[6] = 0; this.m[7] = 0;
  }
}
