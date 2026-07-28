// raw-port: cc_YIQ — ProCore framework (channels layer)
//
// A packed 3-component (Y, I, Q) color triple in the YIQ analog TV color
// space, plus its multiply-by-3x3-matrix operator (used both as
// operator* to transform, operator*= to transform in place, and rgb()
// to convert to sRGB by multiplying against a global cc::matrix::YIQ2rgb
// matrix).
//
// Published entry points (all decoded here):
//   0x0009733a  cc_YIQ::rgb() const
//   0x0009736a  cc_YIQ::operator*=(cc_matrix const&)
//   0x000973a0  cc_YIQ::operator*(cc_matrix const&) const
//
// Object layout (proven by the load pattern in operator* @0x973a7-0x973ac):
//   +0x00  y  (f32)  — luminance
//   +0x04  i  (f32)  — in-phase chrominance
//   +0x08  q  (f32)  — quadrature chrominance
// Total size 12 bytes (0xc), stored with `movsd (rsi)` (Y,I as packed
// double) + `movss 0x8(rsi)` (Q as single).
//
// cc_matrix layout (proven by the load pattern in operator* @0x973b0-0x1c(rdx)):
//   9 floats at offsets 0..0x20, row-major:
//     +0x00 m[0]  +0x04 m[1]  +0x08 m[2]
//     +0x0c m[3]  +0x10 m[4]  +0x14 m[5]
//     +0x18 m[6]  +0x1c m[7]  +0x20 m[8]
//   Total size 0x24 (36 bytes).
//
// Semantic (decoded below): row-major matrix-times-column-vector:
//   out.y = m[0]*y + m[1]*i + m[2]*q
//   out.i = m[3]*y + m[4]*i + m[5]*q
//   out.q = m[6]*y + m[7]*i + m[8]*q

/**
 * cc_matrix — 3x3 row-major float matrix (9 f32s, 36 bytes in C++).
 * We surface it as a plain 9-element tuple for ergonomic use here.
 */
export type cc_matrix = readonly [
  number, number, number,
  number, number, number,
  number, number, number,
];

/**
 * cc_RGB — result of cc_YIQ::rgb() (return type of that function is a
 * 3-float struct, laid out identically to cc_YIQ: {r,g,b}=y,i,q packed).
 * Provenance: rgb() calls operator*() and returns via xmm0/xmm1 as a
 * struct-by-value (movsd (rbx),xmm0 + movss 8(rbx),xmm1 @0x97359..0x9735d).
 */
export type cc_RGB = { r: number; g: number; b: number };

/**
 * The `cc::matrix::YIQ2rgb` global — the 3x3 matrix used by rgb() to
 * transform a YIQ triple into an sRGB triple (mangled symbol
 * `__ZN2cc6matrix7YIQ2rgbE`, referenced @0x97346 as a RIP-relative lea).
 *
 * The MATRIX BYTES themselves live in a __const section and are NOT
 * disassembled here — they are undecoded data. We surface an injection
 * point so callers can supply the (published, standard) YIQ→RGB matrix
 * used by the FCP build without us fabricating one.
 *
 * Callers who have loaded the actual bytes from Ozone's `__DATA_CONST`
 * segment can pass them; otherwise this stays a throwing frontier.
 */
export type cc_matrix_YIQ2rgb_Provider = () => cc_matrix;

let _yiq2rgbProvider: cc_matrix_YIQ2rgb_Provider | null = null;
/**
 * Inject the runtime provider for `cc::matrix::YIQ2rgb`. Undecoded here
 * as a data-section constant — must be supplied by callers to enable
 * rgb().
 */
export function setYIQ2rgbProvider(fn: cc_matrix_YIQ2rgb_Provider | null): void {
  _yiq2rgbProvider = fn;
}

/**
 * cc_YIQ — three-component YIQ color.
 */
export class cc_YIQ {
  /** Field +0x00 — Y (luminance), f32. */
  y: number;
  /** Field +0x04 — I (in-phase chrominance), f32. */
  i: number;
  /** Field +0x08 — Q (quadrature chrominance), f32. */
  q: number;

  constructor(y: number = 0, i: number = 0, q: number = 0) {
    this.y = Math.fround(y);
    this.i = Math.fround(i);
    this.q = Math.fround(q);
  }

  /**
   * cc_YIQ::operator*(cc_matrix const&) const   @0x000973a0
   *
   * Faithful asm mirror. The function is an SSE4.1-implemented 3x3
   * matrix-vector multiply that stores 3 floats to `*rdi` and returns.
   * All floating math is single-precision (movss/movups/mulps/etc.),
   * so we use Math.fround at every boundary to preserve f32 rounding.
   *
   * Register→value map (SIMD trace):
   *   @0x973a7  xmm0 = [Q, 0, 0, 0]         movss 0x8(rsi)
   *   @0x973ac  xmm1 = [Y, I, 0, 0]         movsd (rsi)   — lane 0=Y, lane 1=I
   *   @0x973b0  xmm2 = [m0, m1, m2, m3]     movups (rdx)
   *   @0x973b3-b6  xmm3 = [I, Y, ·, ·]      movaps xmm1→xmm3; shufps 0xe1
   *                                          (imm=0b11_10_00_01 →
   *                                           lanes: dst[1], dst[0],
   *                                                  src[2], src[3])
   *   @0x973ba-bd  xmm4 = [m1, m3, m2, m3]  movaps xmm2→xmm4; shufps 0xed
   *                                          (imm=0b11_10_11_01 →
   *                                           lanes: dst[1], dst[3],
   *                                                  src[2], src[3])
   *   @0x973c1  xmm4 *= xmm3
   *             xmm4 = [m1·I, m3·Y, ·, ·]
   *   @0x973c4  xmm3 = [m4, m5, 0, 0]       movsd 0x10(rdx)
   *   @0x973c9  xmm2 = insertps 0x1c, xmm3, xmm2
   *             imm=0x1c = count_s=0, count_d=1, zmask=0b1100 →
   *             insert xmm3[0]=m4 into xmm2[1]; zero xmm2[2] and [3]
   *             xmm2 = [m0, m4, 0, 0]
   *   @0x973cf  xmm2 *= xmm1
   *             xmm2 = [m0·Y, m4·I, 0, 0]
   *   @0x973d2  xmm2 += xmm4
   *             xmm2 = [m0·Y+m1·I, m3·Y+m4·I, 0, 0]
   *   @0x973d5  xmm4 = movsldup xmm0 = [Q, Q, ·, ·]
   *   @0x973d9  xmm5 = [m2, m3, 0, 0]       movsd 0x8(rdx)
   *   @0x973de  xmm5 = insertps 0x50, xmm3, xmm5
   *             imm=0x50 = count_s=1, count_d=1, zmask=0 →
   *             insert xmm3[1]=m5 into xmm5[1]
   *             xmm5 = [m2, m5, 0, 0]
   *   @0x973e4  xmm5 *= xmm4
   *             xmm5 = [m2·Q, m5·Q, ·, ·]
   *   @0x973e7  xmm5 += xmm2
   *             xmm5 = [m0·Y+m1·I+m2·Q, m3·Y+m4·I+m5·Q, ·, ·]
   *   @0x973ea  movlps xmm5, (rdi)         — store 2 f32s: out.y, out.i
   *
   * Scalar Q output:
   *   @0x973ed  xmm2 = movss 0x18(rdx) = [m6, ·, ·, ·]
   *   @0x973f2  xmm2 *= xmm1                    ; xmm1[0]=Y → xmm2 = m6·Y
   *   @0x973f6  xmm1 = movshdup xmm1 = [I, I, ·, ·]  ; low lane = I
   *   @0x973fa  xmm1 *= 0x1c(rdx)                ; xmm1 = m7·I
   *   @0x973ff  xmm0 *= 0x20(rdx)                ; xmm0 = m8·Q
   *   @0x97404  xmm1 += xmm2                     ; xmm1 = m6·Y + m7·I
   *   @0x97408  xmm0 += xmm1                     ; xmm0 = m6·Y + m7·I + m8·Q
   *   @0x9740c  movss xmm0, 0x8(rdi)             ; out.q
   *
   * Return: %rax = rdi (in-out buffer). We return a new cc_YIQ instance.
   */
  mul(m: cc_matrix): cc_YIQ {
    const Y = Math.fround(this.y);
    const I = Math.fround(this.i);
    const Q = Math.fround(this.q);
    // Row-major 3x3 * column vector: out[row] = sum_c m[row*3 + c] * v[c]
    // Provenance: see the SIMD trace above — the two SIMD lanes materialize
    // rows 0 and 1, then the scalar tail materializes row 2.
    // NOTE on ordering: the asm uses two mulps then addps, computing lane 0
    // as m[0]·Y + m[1]·I and lane 1 as m[3]·Y + m[4]·I in parallel — then
    // adds the Q term. Because SSE mulps rounds each product to f32 and
    // addps sums two f32s at a time, the observable rounding is:
    //   lane0 = fround(fround(m[0]·Y) + fround(m[1]·I)) then + fround(m[2]·Q)
    //   lane1 = fround(fround(m[3]·Y) + fround(m[4]·I)) then + fround(m[5]·Q)
    //   q     = fround(fround(m[6]·Y) + fround(m[7]·I)) + fround(m[8]·Q)
    //           (add order: (m6·Y)+(m7·I) then + (m8·Q) — see @0x97404/@0x97408)
    const t0 = Math.fround(Math.fround(m[0] * Y) + Math.fround(m[1] * I));
    const outY = Math.fround(t0 + Math.fround(m[2] * Q));
    const t1 = Math.fround(Math.fround(m[3] * Y) + Math.fround(m[4] * I));
    const outI = Math.fround(t1 + Math.fround(m[5] * Q));
    // Q output: scalar mulss/addss chain (@0x973ed..0x97408).
    const p6 = Math.fround(m[6] * Y);
    const p7 = Math.fround(m[7] * I);
    const p8 = Math.fround(m[8] * Q);
    const s = Math.fround(p6 + p7);         // @0x97404 addss xmm2, xmm1
    const outQ = Math.fround(s + p8);       // @0x97408 addss xmm1, xmm0
    return new cc_YIQ(outY, outI, outQ);
  }

  /**
   * cc_YIQ::operator*=(cc_matrix const&)   @0x0009736a
   *
   * Faithful asm mirror. Allocates a 12-byte stack slot at -0x1c(%rbp),
   * calls operator* to write the result into it, then copies the 12
   * bytes back into `this`.
   *
   *   @0x9736e-0x97371  stack setup, save regs; sub $0x10, %rsp  — carves out room
   *   @0x97375-0x97378  rdx = matrix (rsi original); rbx = this (rdi original)
   *   @0x9737b-0x9737f  r14 = &tmp (-0x1c(%rbp))
   *   @0x97382          rsi = rbx (this)      — 2nd arg of operator* is `*this`
   *   @0x97385          call cc_YIQ::operator*(cc_matrix const&) const
   *                     writes 12 bytes to *r14: [tmp.y, tmp.i] @tmp+0, tmp.q @tmp+8
   *   @0x9738a-0x9738e  eax = *(u32*)(r14+8) ; *(u32*)(this+8) = eax  — copy Q
   *   @0x97391-0x97394  rax = *(u64*)r14     ; *(u64*)this = rax      — copy Y+I
   *
   * Return: void (returns %rdi = this in %rax per ABI convention).
   *
   * We mirror this by delegating to mul() and copying the fields — the
   * "temp stack slot" is unnecessary in JS but the observable behavior
   * (this = *this * m) is identical.
   */
  mulAssign(m: cc_matrix): void {
    // @0x97385 — call operator*() into a temp cc_YIQ.
    const tmp = this.mul(m);
    // @0x9738a-0x9738e — copy Q (offset +8).
    this.q = tmp.q;
    // @0x97391-0x97394 — copy Y+I (offsets +0 and +4).
    this.y = tmp.y;
    this.i = tmp.i;
  }

  /**
   * cc_YIQ::rgb() const   @0x0009733a
   *
   * Faithful asm mirror. Multiplies `*this` by the global
   * `cc::matrix::YIQ2rgb` matrix and returns the 3-float result as a
   * struct-by-value in %xmm0/%xmm1.
   *
   *   @0x9733e-0x9733f  push %rbx ; sub $0x18, %rsp   — 24 bytes stack (12-byte tmp
   *                                                     + alignment padding)
   *   @0x97343          rsi = rdi (this)             — 2nd arg of operator*() = *this
   *   @0x97346          rdx = &cc::matrix::YIQ2rgb   — the global YIQ→RGB matrix
   *   @0x9734d          rbx = &tmp (-0x18(%rbp))
   *   @0x97351          rdi = rbx                    — 1st arg = out ptr
   *   @0x97354          call cc_YIQ::operator*(cc_matrix const&) const
   *                     writes 12 bytes to *rbx: [rgb.r, rgb.g] @+0, rgb.b @+8
   *   @0x97359          xmm0 = movsd (rbx)           — 8 bytes: r + g packed
   *   @0x9735d          xmm1 = movss 8(rbx)          — b
   *   ...ret
   *
   * The return convention here is the SysV AMD64 struct-in-registers
   * rule for {float, float, float}: xmm0 holds {r,g} (the low 64 bits)
   * and xmm1 holds {b}. Callers unpack from those. In JS we return a
   * cc_RGB record with named r/g/b fields.
   */
  rgb(): cc_RGB {
    // @0x97346 — lea global cc::matrix::YIQ2rgb. Undecoded data-section
    // constant — must be supplied by the injected provider.
    if (_yiq2rgbProvider === null) {
      throw new Error(
        "cc_YIQ.rgb: no YIQ2rgb matrix provider injected — undecoded frontier @0x97346 (data-section constant `cc::matrix::YIQ2rgb`)",
      );
    }
    const m = _yiq2rgbProvider();
    // @0x97354 — call operator*() into tmp.
    const tmp = this.mul(m);
    // @0x97359..0x9735d — return {r=tmp.y, g=tmp.i, b=tmp.q}. Field names
    // change because the RESULT is now sRGB, but the memory layout is
    // identical (same struct type, reinterpreted).
    return { r: tmp.y, g: tmp.i, b: tmp.q };
  }
}
