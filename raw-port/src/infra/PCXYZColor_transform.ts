// PCXYZColor_transform.ts — (anonymous namespace)::transform(double const* M,
// PCXYZColor const& in, PCXYZColor& out) from ProCore. Free function inside the
// ICC color-space translation unit. Computes `out = M * in` where M is a 3x3
// row-major matrix of 9 doubles.
//
// One symbol transcribed here:
//   @ProCore 0xaf6fa
//     (anonymous namespace)::transform(double const*, PCXYZColor const&, PCXYZColor&)
//     mangled: __ZN12_GLOBAL__N_19transformEPKdRK10PCXYZColorRS2_
//
// Source disassembly: raw-port/re/disasm/ProCore.__ZN12_GLOBAL__N_19transformEPKdRK10PCXYZColorRS2_.s
//
// STRUCT LAYOUT (recovered from this fn's memory-access offsets):
//   PCXYZColor (24 bytes, 3 doubles): +0x00 x, +0x08 y, +0x10 z
//   M          (72 bytes, 9 doubles row-major):
//     +0x00 M[0]=m00, +0x08 M[1]=m01, +0x10 M[2]=m02
//     +0x18 M[3]=m10, +0x20 M[4]=m11, +0x28 M[5]=m12
//     +0x30 M[6]=m20, +0x38 M[7]=m21, +0x40 M[8]=m22
//
// AT&T disasm (SSE2, packed doubles; SysV AMD64: rdi=M, rsi=&in, rdx=&out):
//
//   0xaf6fa  pushq %rbp                       ; prologue
//   0xaf6fb  movq  %rsp, %rbp
//   0xaf6fe  movsd 0x10(rsi), xmm1            ; xmm1.lo = in.z
//   0xaf703  movsd 0x40(rdi), xmm0            ; xmm0.lo = M[8]  (m22)
//   0xaf708  mulsd xmm1, xmm0                 ; xmm0 = m22 * in.z
//   0xaf70c  movupd (rsi),      xmm2          ; xmm2 = (in.x, in.y)
//   0xaf710  movupd (rdi),      xmm3          ; xmm3 = (M[0], M[1]) = (m00, m01)
//   0xaf714  movupd 0x10(rdi),  xmm4          ; xmm4 = (M[2], M[3]) = (m02, m10)
//   0xaf719  movupd 0x20(rdi),  xmm5          ; xmm5 = (M[4], M[5]) = (m11, m12)
//   0xaf71e  movapd xmm2, xmm6                ; xmm6 = (in.x, in.y)
//   0xaf722  shufpd $1, xmm2, xmm6            ; xmm6 = (xmm6[1], xmm2[0]) = (in.y, in.x)
//   0xaf727  movapd xmm3, xmm7                ; xmm7 = (m00, m01)
//   0xaf72b  unpckhpd xmm4, xmm7              ; xmm7 = (xmm7[1], xmm4[1]) = (m01, m10)
//   0xaf72f  mulpd xmm6, xmm7                 ; xmm7 = (m01*in.y, m10*in.x)
//   0xaf733  unpcklpd xmm5, xmm3              ; xmm3 = (xmm3[0], xmm5[0]) = (m00, m11)
//   0xaf737  mulpd xmm2, xmm3                 ; xmm3 = (m00*in.x, m11*in.y)
//   0xaf73b  addpd xmm7, xmm3                 ; xmm3 = (m00*x + m01*y,
//                                             ;         m11*y + m10*x)
//   0xaf73f  movddup xmm1, xmm1               ; xmm1 = (in.z, in.z)
//   0xaf743  movsd  xmm4, xmm5                ; xmm5 = (xmm4[0], xmm5[1]) = (m02, m12)
//   0xaf747  mulpd  xmm1, xmm5                ; xmm5 = (m02*z, m12*z)
//   0xaf74b  mulsd  0x30(rdi), xmm2           ; xmm2.lo = M[6]=m20 * in.x
//   0xaf750  addpd  xmm3, xmm5                ; xmm5 = (m00*x + m01*y + m02*z,
//                                             ;         m10*x + m11*y + m12*z)
//   0xaf754  movsd  0x8(rsi), xmm1            ; xmm1 = in.y
//   0xaf759  mulsd  0x38(rdi), xmm1           ; xmm1 = M[7]=m21 * in.y
//   0xaf75e  addsd  xmm2, xmm1                ; xmm1 = m20*x + m21*y
//   0xaf762  addsd  xmm0, xmm1                ; xmm1 = m20*x + m21*y + m22*z
//   0xaf766  movsd  xmm1, 0x10(rdx)           ; out.z = xmm1
//   0xaf76b  movupd xmm5, (rdx)               ; (out.x, out.y) = xmm5
//   0xaf76f  popq   %rbp
//   0xaf770  retq
//
// Net semantics: row-major 3x3 * column vector.
//   out.x = M[0]*in.x + M[1]*in.y + M[2]*in.z
//   out.y = M[3]*in.x + M[4]*in.y + M[5]*in.z
//   out.z = M[6]*in.x + M[7]*in.y + M[8]*in.z
//
// All ops are `sd`/`pd` (double-precision); no cvtss2sd anywhere — no Math.fround needed.

/**
 * PCXYZColor — 24-byte struct with three doubles.
 * Field offsets recovered from this fn's accesses (0x00 x, 0x08 y, 0x10 z).
 */
export interface PCXYZColor {
  x: number;
  y: number;
  z: number;
}

/**
 * (anonymous namespace)::transform — apply a 3x3 row-major matrix to a PCXYZColor.
 *
 * @ProCore 0xaf6fa
 *   (anonymous namespace)::transform(double const* M, PCXYZColor const& in, PCXYZColor& out)
 *
 * @param M   9 doubles, row-major (M[0]..M[8] = m00 m01 m02 m10 m11 m12 m20 m21 m22).
 * @param input   input PCXYZColor (read-only).
 * @param out     output PCXYZColor (mutated in place, same as `rdx` in the disasm).
 */
export function anon_transform_PCXYZColor(
  M: ArrayLike<number>,
  input: PCXYZColor,
  out: PCXYZColor,
): void {
  // 0xaf70c movupd (rsi),xmm2 loads (in.x, in.y); 0xaf6fe movsd 0x10(rsi) loads in.z.
  const x = input.x;
  const y = input.y;
  const z = input.z;
  // xmm5 low  @0xaf750: m00*x + m01*y + m02*z
  out.x = M[0] * x + M[1] * y + M[2] * z;
  // xmm5 high @0xaf750: m10*x + m11*y + m12*z
  out.y = M[3] * x + M[4] * y + M[5] * z;
  // xmm1     @0xaf762: m20*x + m21*y + m22*z
  out.z = M[6] * x + M[7] * y + M[8] * z;
}
