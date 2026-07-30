// PCXYZColor_transform.ts — (anonymous namespace)::transform(double const* M, PCXYZColor const& in,
// PCXYZColor& out) from ProCore. A free function in the ICC color-space TU (siblings per
// /tmp/ProCore_symmap.tsv: invert, multiply, adaptXYZColors, computeAdaptationMatrix, addXYZToTag,
// getXYZFromTag). It computes `out = M * in` where M is a 3x3 row-major matrix of 9 doubles.
//
// STRUCT LAYOUT (recovered from this fn's offsets):
//   PCXYZColor (24 bytes, 3 doubles): +0x00 x, +0x08 y, +0x10 z
//   M (72 bytes, 9 doubles row-major):
//     +0x00 m00, +0x08 m01, +0x10 m02
//     +0x18 m10, +0x20 m11, +0x28 m12
//     +0x30 m20, +0x38 m21, +0x40 m22

/**
 * PCXYZColor triple. Row-major matches the FCP struct layout.
 * The disasm accesses lo=x@+0x00, hi=y@+0x08, z@+0x10.
 */
export interface PCXYZColor {
  x: number;
  y: number;
  z: number;
}

/**
 * (anonymous namespace)::transform(double const* M, PCXYZColor const& in, PCXYZColor& out)
 *   @ProCore 0x0af6fa
 *
 * Disassembly transcription (SSE2, packed doubles). Registers per the SysV AMD64 calling
 * convention: rdi=M, rsi=&in, rdx=&out.
 *
 *   @0x0af6fe  movsd 0x10(rsi),xmm1        ; xmm1 = in.z
 *   @0x0af703  movsd 0x40(rdi),xmm0        ; xmm0 = M[8]  (m22)
 *   @0x0af708  mulsd xmm1,xmm0             ; xmm0 = m22 * in.z
 *   @0x0af70c  movupd (rsi),xmm2           ; xmm2 = (in.x, in.y)
 *   @0x0af710  movupd (rdi),xmm3           ; xmm3 = (M[0]=m00, M[1]=m01)
 *   @0x0af714  movupd 0x10(rdi),xmm4       ; xmm4 = (M[2]=m02, M[3]=m10)
 *   @0x0af719  movupd 0x20(rdi),xmm5       ; xmm5 = (M[4]=m11, M[5]=m12)
 *   @0x0af71e  movapd xmm2,xmm6            ; xmm6 = (in.x, in.y)
 *   @0x0af722  shufpd \$1,xmm2,xmm6        ; xmm6 = (xmm6[1], xmm2[0]) = (in.y, in.x)
 *   @0x0af727  movapd xmm3,xmm7            ; xmm7 = (m00, m01)
 *   @0x0af72b  unpckhpd xmm4,xmm7          ; xmm7 = (xmm7[1], xmm4[1]) = (m01, m10)
 *   @0x0af72f  mulpd xmm6,xmm7             ; xmm7 = (m01*in.y, m10*in.x)
 *   @0x0af733  unpcklpd xmm5,xmm3          ; xmm3 = (xmm3[0], xmm5[0]) = (m00, m11)
 *   @0x0af737  mulpd xmm2,xmm3             ; xmm3 = (m00*in.x, m11*in.y)
 *   @0x0af73b  addpd xmm7,xmm3             ; xmm3 = (m00*x + m01*y, m11*y + m10*x)
 *   @0x0af73f  movddup xmm1,xmm1           ; xmm1 = (in.z, in.z)
 *   @0x0af743  movsd xmm4,xmm5             ; xmm5 = (xmm4[0], xmm5[1]) = (m02, m12)
 *   @0x0af747  mulpd xmm1,xmm5             ; xmm5 = (m02*z, m12*z)
 *   @0x0af74b  mulsd 0x30(rdi),xmm2        ; xmm2.lo = M[6]=m20 * in.x  (xmm2.hi undefined)
 *   @0x0af750  addpd xmm3,xmm5             ; xmm5 = (m00*x + m01*y + m02*z,
 *                                          ;         m10*x + m11*y + m12*z)
 *   @0x0af754  movsd 0x8(rsi),xmm1         ; xmm1 = in.y
 *   @0x0af759  mulsd 0x38(rdi),xmm1        ; xmm1 = M[7]=m21 * in.y
 *   @0x0af75e  addsd xmm2,xmm1             ; xmm1 = m20*in.x + m21*in.y
 *   @0x0af762  addsd xmm0,xmm1             ; xmm1 = m20*x + m21*y + m22*z
 *   @0x0af766  movsd xmm1,0x10(rdx)        ; out.z = xmm1
 *   @0x0af76b  movupd xmm5,(rdx)           ; (out.x, out.y) = xmm5
 *
 * So: out = M * in with M[0..8] as row-major 3x3. Doubles throughout; no fround.
 */
export function PCXYZColor_transform(
  M: ArrayLike<number>, // 9 doubles: m00 m01 m02 m10 m11 m12 m20 m21 m22
  input: PCXYZColor,
  out: PCXYZColor,
): void {
  const x = input.x; // @0x0af70c
  const y = input.y; // @0x0af70c (packed low)
  const z = input.z; // @0x0af6fe
  // out.x = m00*x + m01*y + m02*z   (xmm5 low  @0x0af750)
  out.x = M[0] * x + M[1] * y + M[2] * z;
  // out.y = m10*x + m11*y + m12*z   (xmm5 high @0x0af750)
  out.y = M[3] * x + M[4] * y + M[5] * z;
  // out.z = m20*x + m21*y + m22*z   (xmm1     @0x0af762)
  out.z = M[6] * x + M[7] * y + M[8] * z;
}
