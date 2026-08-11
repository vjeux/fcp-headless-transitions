/**
 * PCMatrix44Tmpl<double> — ProCore's 4x4 double-precision homogeneous
 * transform matrix. Faithful transcription of the symbols shipped in the
 * x86_64 slice of
 *   /Applications/Final Cut Pro.app/Contents/Frameworks/
 *      ProCore.framework/Versions/A/ProCore
 * (thin slice cache: /tmp/ProCore.x86_64 — file offset == virtual address).
 *
 * This is the geometry class the polygon/pixel-transform family depends on;
 * transform<Vector2> is the unlock cited from PCSimplePolygon::transform
 * (@ProCore 0xc3ef1).
 *
 * ========================================================================
 * MEMORY LAYOUT (recovered from transform_v3, transform_v4, transpose,
 * operator*, leftTranslate, rightMult — 6 mutually confirming decodes):
 * ========================================================================
 *
 *   sizeof(PCMatrix44Tmpl<double>) = 128 bytes = 16 doubles, ROW-MAJOR:
 *
 *     +---------+---------+---------+---------+
 *     | 0x00 m00| 0x08 m01| 0x10 m02| 0x18 m03|   row 0
 *     +---------+---------+---------+---------+
 *     | 0x20 m10| 0x28 m11| 0x30 m12| 0x38 m13|   row 1
 *     +---------+---------+---------+---------+
 *     | 0x40 m20| 0x48 m21| 0x50 m22| 0x58 m23|   row 2
 *     +---------+---------+---------+---------+
 *     | 0x60 m30| 0x68 m31| 0x70 m32| 0x78 m33|   row 3  (perspective row)
 *     +---------+---------+---------+---------+
 *
 * Proof (see raw-port/re/disasm/ProCore.PCMatrix44Tmpl_double.transform_v3.s):
 *   the Vector3 transform reads x from *(rsi), y from 0x8(rsi), z from
 *   0x10(rsi), and computes
 *      out.x = (m00*x + m01*y + m02*z + m03) / w
 *      out.y = (m10*x + m11*y + m12*z + m13) / w
 *      out.z = (m20*x + m21*y + m22*z + m23) / w
 *      w     =  m30*x + m31*y + m32*z + m33
 *   with the m** loads at exactly the offsets shown above (0x00, 0x08,
 *   0x10, 0x18 for row0; 0x20+ for row1; etc.). See disasm addresses
 *   0x188d9..0x189 in that .s file.
 *
 * The matrix stores 16 doubles contiguously; there is no vtable and no
 * hidden header (a Vector2 transform passes rdi straight to *(rdi) with
 * no this-adjustment).  We therefore model the state as a length-16
 * `Float64Array` — this is a true byte-for-byte mirror of the C++ layout
 * (row-major doubles, no header) and lets `m[r*4+c]` map directly to
 * the offset `0x20*r + 0x08*c` in the assembly.
 *
 * NOTE ON PRECISION: every arithmetic op on this class is a full IEEE-754
 * f64 in the binary (movsd/mulsd/addsd/divsd/mulpd/addpd) — there is no
 * cvtsd2ss anywhere in the ported bodies below, so plain JS `number`
 * arithmetic already matches; NO Math.fround wrapping is required (nor
 * allowed — that would introduce single-precision rounding the binary
 * does not do).
 *
 * PORTED (fully transcribed, one method per @0xADDR):
 *   0x000c4b6a  transform<double>(PCVector2 const&, PCVector2&) — THE UNLOCK
 *   0x000188c4  transform<double>(PCVector3 const&, PCVector3&)
 *   0x00017520  transform<double>(PCVector4 const&, PCVector4&)
 *   0x00050dfa  transform<double>(PCVector2 const&, PCVector4&) — Vec2→Vec4
 *   0x0005b080  transform<double>(PCVector3&) — IN-PLACE single-arg (@Ozone)
 *                                                                (no divide)
 *   0x0004ef7e  isIdentity()
 *   0x0004f378  leftTranslate(tx, ty, tz)
 *   0x0004f444  rightTranslate(tx, ty, tz)
 *   0x0004f552  leftScale(sx, sy, sz)
 *   0x0004f5ec  rightScale(sx, sy, sz)
 *   0x0004ffd4  transpose()
 *   0x0005065c  leftMult(other)
 *   0x00050782  rightMult(other)
 *   0x00068210  operator*(other)
 *   @ProChannel
 *   0x000844d8  setRotationFromQuaternion(PCQuat<double> const&)
 *               — the ONLY method in this file taken from ProChannel's own
 *                 instantiation of the template (ProChannel links its own copy;
 *                 the symbol is `__ZN14PCMatrix44TmplIdE25setRotationFromQuaternionERK6PCQuatIdE`
 *                 at ProChannel 0x844d8). Same class, same 128-byte row-major
 *                 layout — only the framework the code was emitted into differs,
 *                 exactly like the @Ozone in-place transform<PCVector3> above.
 *                 Disasm: raw-port/re/disasm/ProChannel.__ZN14PCMatrix44TmplIdE25setRotationFromQuaternionERK6PCQuatIdE.s
 *
 * DECODED CONSTANTS (ProChannel.x86_64 rodata, for the method above):
 *   0x000b05f0 = 2.0   (`movsd 0x2c0d6(%rip),%xmm2` @0x84512 -> 0x8451a+0x2c0d6;
 *                       raw bytes 00 00 00 00 00 00 00 40)
 *   0x000af528 = 1.0   (`movsd 0x2afa0(%rip),%xmm7` @0x84580 -> 0x84588+0x2afa0;
 *                       raw bytes 00 00 00 00 00 00 f0 3f)
 *   0x3ff0000000000000 = 1.0 (immediate `movabsq` @0x8461a, stored to m33)
 *
 * DECODED CONSTANTS (from ProCore.x86_64 rodata; addresses are file
 * offsets in the thin slice):
 *   0x00122530 = 1.0                  (skip-when-scale-is-one sentinel,
 *                                       used by leftScale/rightScale)
 *   0x00122670 = 0x7fffffffffffffff   (IEEE-754 abs-value bit mask, used
 *                                       by isIdentity's andpd)
 *   0x00122880 = 1e-7                 (isIdentity epsilon)
 *
 * NOT YET TRANSCRIBED (throwing stubs — each cites its @0xADDR so
 * `frontier.py` sees the gap; PORTING_SPEC rule 3):
 *   0x0001ad8a  jacobianPost(v4)
 *   0x00030cbe  getTransformation(params, quat)
 *   0x0003150e  invert(other, det)
 *   0x0004f6c2  leftShear(sxy, syx)          — nontrivial angle-wrap+tan
 *   0x0004f85e  rightShear(sxy, syx)         — nontrivial angle-wrap+tan
 *   0x0004fa14  leftRotate(angle, axis)      — sincos_stret + axis switch
 *   0x0004fc90  rightRotate(angle, axis)     — sincos_stret + axis switch
 *   0x000501d4  getTransformation(params)
 *   0x00050a92  planarInverseZ(other, z)
 *   0x00050c5a  transformRect<double>(inRect, outRect)  — depends on
 *                                     PCRect::operator|= (@ProCore 0x2c78c),
 *                                     not yet ported (own class)
 *   0x00050e84  getPartialTransformation(params, remainder)
 *   0x000514bc  determinant()                — heavily SIMD, defer
 *   0x000c4bd5  transform<double>(PCVector4 const&, PCVector4&) — the
 *                                     variable-dim overload starting at
 *                                     0x000c4bd5 (fn ptr arg in %rcx);
 *                                     the "plain" v4 transform is 0x17520
 *                                     above.
 *
 * The stubs are intentional loud gaps.  A downstream caller that reaches
 * one must decode that method, not paper over it (PORTING_SPEC rule 3).
 *
 * See also (decoded reference disasm shipped in this diff):
 *   raw-port/re/disasm/ProCore.PCMatrix44Tmpl_double.transform_v2.s
 *   raw-port/re/disasm/ProCore.PCMatrix44Tmpl_double.transform_v3.s
 *   raw-port/re/disasm/ProCore.PCMatrix44Tmpl_double.transform_v4.s
 *   raw-port/re/disasm/ProCore.PCMatrix44Tmpl_double.isIdentity.s
 *   raw-port/re/disasm/ProCore.PCMatrix44Tmpl_double.leftTranslate.s
 *   raw-port/re/disasm/ProCore.PCMatrix44Tmpl_double.rightTranslate.s
 *   raw-port/re/disasm/ProCore.PCMatrix44Tmpl_double.leftScale.s
 *   raw-port/re/disasm/ProCore.PCMatrix44Tmpl_double.rightScale.s
 *   raw-port/re/disasm/ProCore.PCMatrix44Tmpl_double.transpose.s
 *   raw-port/re/disasm/ProCore.PCMatrix44Tmpl_double.leftMult.s
 *   raw-port/re/disasm/ProCore.PCMatrix44Tmpl_double.rightMult.s
 *   raw-port/re/disasm/ProCore.PCMatrix44Tmpl_double.operator_mul.s
 *   raw-port/re/disasm/ProCore.PCMatrix44Tmpl_double.determinant.s
 *   raw-port/re/disasm/ProCore.PCMatrix44Tmpl_double.leftShear.s
 *   raw-port/re/disasm/ProCore.PCMatrix44Tmpl_double.leftRotate.s
 *   raw-port/re/disasm/ProCore.PCMatrix44Tmpl_double.rightRotate.s
 *   raw-port/re/disasm/ProCore.PCMatrix44Tmpl_double.transformRect.s
 */

// ---------------------------------------------------------------------------
// Auxiliary vector types — PCVector2/3/4<double>
// ---------------------------------------------------------------------------
// Byte layout confirmed by the transform<T> disasms:
//   PCVector2<double>: 2 packed doubles at +0x00, +0x08 (16 B).
//   PCVector3<double>: 3 packed doubles at +0x00, +0x08, +0x10 (24 B).
//   PCVector4<double>: 4 packed doubles at +0x00, +0x08, +0x10, +0x18 (32 B).
// Proof: transform_v2.s reads (%rsi) and 0x8(%rsi); transform_v3.s adds
// 0x10(%rsi); transform_v4.s adds 0x18(%rsi). These matching Vector types
// are separate FCP classes; here we expose the minimal shapes needed to
// port the matrix's own transform<T> overloads.  When the real PCVectorN
// classes land they should replace these structural types.

export interface PCVector2Double {
  x: number;
  y: number;
}

export interface PCVector3Double {
  x: number;
  y: number;
  z: number;
}

export interface PCVector4Double {
  x: number;
  y: number;
  z: number;
  w: number;
}

// ---------------------------------------------------------------------------
// Axis enum — passed as %esi to leftRotate/rightRotate.  The switch at
// leftRotate+0x4fb0b (`testl %r14d,%r14d; je ...` then `cmpl $0x1`, `cmpl
// $0x2`) proves the encoding 0=X, 1=Y, 2=Z.  Defined here so callers can
// name axes even though rotate itself is a stub.
// ---------------------------------------------------------------------------
export enum PCMatrix44Axis {
  X = 0,
  Y = 1,
  Z = 2,
}

// ---------------------------------------------------------------------------
// PCQuat<double> — the 4-double quaternion `setRotationFromQuaternion`
// (@ProChannel 0x844d8) reads through %rsi.
// ---------------------------------------------------------------------------
// Byte layout confirmed by that body's loads: `movupd (%rsi),%xmm6` @0x844e9
// takes components 0/1 (+0x00,+0x08), `movupd 0x10(%rsi),%xmm0` @0x844dc takes
// components 2/3 (+0x10,+0x18) — 4 packed doubles, 32 bytes.
//
// WHICH COMPONENT IS THE SCALAR: component 0. Two independent confirmations —
//   (a) this body writes m00 = 1 - 2(c2^2 + c3^2)/|q|^2 @0x84592 and
//       m11 = 1 - 2(c3^2 + c1^2)/|q|^2 @0x845cd, the standard rotation matrix
//       ONLY when the scalar is component 0 and (c1,c2,c3) are (x,y,z);
//   (b) the landed OZChannelRotation3D::getValueAsQuatd port (@ProChannel
//       0x82062, raw-port/src/channels/OZChannelRotation3D.ts) fills the same
//       PCQuat<double> with q[0] = cx*cy*cz + sx*sy*sz — the scalar term of the
//       Euler→quaternion identity — and q[1..3] with the x/y/z terms.
// The fields are therefore named w,x,y,z (component 0..3) with their offsets
// documented, per PORTING_SPEC rule 5.
export interface PCQuatDouble {
  /** +0x00 — component 0, the scalar part. */
  w: number;
  /** +0x08 — component 1. */
  x: number;
  /** +0x10 — component 2. */
  y: number;
  /** +0x18 — component 3. */
  z: number;
}

// ---------------------------------------------------------------------------
// Class
// ---------------------------------------------------------------------------

/**
 * PCMatrix44Tmpl<double> — 4x4 row-major double matrix.
 *
 * Storage is a length-16 Float64Array.  Index mapping (r,c) -> m[r*4+c]
 * mirrors the byte offset `0x20*r + 0x08*c` used everywhere in the
 * ProCore disassembly.
 */
export class PCMatrix44Tmpl_double {
  /**
   * The 16 packed doubles.  Public for symmetry with the C++ struct
   * whose fields are directly addressed by every method below.
   */
  readonly m: Float64Array;

  /**
   * Default ctor — identity.  The binary doesn't expose an explicit
   * default ctor symbol (inlined into every construction site); the
   * identity pattern `m00 = m11 = m22 = m33 = 1, else 0` is the one
   * `PCMatrix44Tmpl<double>::operator*` writes at 0x68217..0x6822d
   * (movabsq $0x3ff0000000000000 to 0x00,0x28,0x50,0x78; xorps to the
   * rest), so we adopt it verbatim here.
   */
  constructor(elements?: ArrayLike<number>) {
    this.m = new Float64Array(16);
    if (elements === undefined) {
      // identity
      this.m[0] = 1;
      this.m[5] = 1;
      this.m[10] = 1;
      this.m[15] = 1;
    } else {
      if (elements.length !== 16) {
        throw new Error(
          "PCMatrix44Tmpl<double>: elements must have length 16 (row-major)",
        );
      }
      for (let i = 0; i < 16; i++) this.m[i] = elements[i];
    }
  }

  // -------------------------------------------------------------------------
  // Element access — trivial helpers keeping the row/col math readable.
  // No disasm citation: these are just addressing macros over the layout
  // already documented in the class header (offset 0x20*r + 0x08*c).
  // -------------------------------------------------------------------------
  get(r: number, c: number): number {
    return this.m[r * 4 + c];
  }
  set(r: number, c: number, v: number): void {
    this.m[r * 4 + c] = v;
  }

  /**
   * Reset to identity.  Mirrors operator*'s prologue at @ProCore 0x68217:
   *   movabsq $0x3ff0000000000000 (=1.0), (this)      # m00
   *                                     0x28(this)    # m11
   *                                     0x50(this)    # m22
   *                                     0x78(this)    # m33
   *   xorps %xmm0,%xmm0
   *   movups %xmm0, {0x08,0x18,0x30,0x40,0x58,0x68}   # rest -> 0
   */
  makeIdentity(): void {
    const m = this.m;
    m[0] = 1; m[1] = 0; m[2] = 0; m[3] = 0;
    m[4] = 0; m[5] = 1; m[6] = 0; m[7] = 0;
    m[8] = 0; m[9] = 0; m[10] = 1; m[11] = 0;
    m[12] = 0; m[13] = 0; m[14] = 0; m[15] = 1;
  }

  /**
   * `PCMatrix44Tmpl<double>::setRotationFromQuaternion(PCQuat<double> const&)`
   *   — @ProChannel 0x000844d8
   *   — __ZN14PCMatrix44TmplIdE25setRotationFromQuaternionERK6PCQuatIdE
   *
   * Overwrites the WHOLE matrix (all 16 doubles) with the rotation the
   * quaternion `q` describes, normalising by |q|^2 as it goes. Transcribed
   * from the 77-line SSE body in
   * raw-port/re/disasm/ProChannel.__ZN14PCMatrix44TmplIdE25setRotationFromQuaternionERK6PCQuatIdE.s
   *
   * REGISTER TRACE — the packed ops in the order the machine performs them
   * (q0..q3 are the four components at %rsi +0x00/+0x08/+0x10/+0x18):
   *
   *   0x844dc movupd 0x10(%rsi),%xmm0        ; xmm0 = {q2, q3}
   *   0x844e1 movapd %xmm0,%xmm1
   *   0x844e5 mulpd  %xmm0,%xmm1             ; xmm1 = {q2*q2, q3*q3}
   *   0x844e9 movupd (%rsi),%xmm6            ; xmm6 = {q0, q1}
   *   0x844ed movapd %xmm6,%xmm2
   *   0x844f1 mulsd  %xmm6,%xmm2             ; xmm2 = q0*q0
   *   0x844f5 movsd  0x8(%rsi),%xmm7         ; xmm7 = q1
   *   0x844fa movapd %xmm7,%xmm3
   *   0x844fe mulsd  %xmm7,%xmm3             ; xmm3 = q1*q1
   *   0x84502 addsd  %xmm1,%xmm3             ; xmm3 = q1*q1 + q2*q2
   *   0x84506 unpckhpd %xmm1,%xmm1           ; xmm1 = q3*q3 (high lane -> low)
   *   0x8450a addsd  %xmm3,%xmm1             ; xmm1 = q3*q3 + (q1*q1 + q2*q2)
   *   0x8450e addsd  %xmm2,%xmm1             ; xmm1 = normSq = that + q0*q0
   *   0x84512 movsd  0x2c0d6(%rip),%xmm2     ; xmm2 = 2.0   (@0xb05f0)
   *   0x8451a divsd  %xmm1,%xmm2             ; xmm2 = 2.0 / normSq
   *   0x8451e xorpd  %xmm3,%xmm3             ; xmm3 = 0.0
   *   0x84522 cmpltsd %xmm1,%xmm3            ; xmm3 = (0.0 < normSq) ? ~0 : 0
   *   0x84527 andpd  %xmm2,%xmm3             ; s = (0.0 < normSq) ? 2/normSq : 0.0
   *   0x8452b-0x84541                        ; sq1 = q1*s, sq2 = q2*s, sq3 = s*q3
   *   0x84546 movddup %xmm2,%xmm4 ; mulpd %xmm6,%xmm4   ; xmm4 = {q0*sq2, q1*sq2}
   *   0x8454e movddup %xmm3,%xmm5 ; mulpd %xmm6,%xmm5   ; xmm5 = {q0*sq3, q1*sq3}
   *   0x84556 mulsd  %xmm1,%xmm6             ; xmm6 = q0*sq1
   *   0x8455a mulsd  %xmm7,%xmm1             ; xmm1 = sq1*q1
   *   0x8455e shufpd $0x1,%xmm4,%xmm9        ; xmm9 = {q1*sq2, q0*sq2}  (swapped)
   *   0x84569 mulsd  %xmm0,%xmm2             ; xmm2 = sq2*q2
   *   0x8456d mulsd  %xmm3,%xmm0             ; xmm0 = q2*sq3
   *   0x84571 mulsd  %xmm8,%xmm3             ; xmm3 = sq3*q3
   *
   * The nine products the stores are built from (named as in the body below):
   *   a = q0*sq1   b = sq1*q1   c = q0*sq2   d = q1*sq2   e = sq2*q2
   *   f = q0*sq3   g = q1*sq3   h = q2*sq3   i = sq3*q3
   *
   * STORES — every one of the 16 doubles, in machine order:
   *   0x84580 movsd 0x2afa0(%rip),%xmm7      ; xmm7 = 1.0 (@0xaf528)
   *   0x84592 movsd  %xmm10,(%rdi)           ; m00 = 1.0 - (e + i)
   *   0x84597-0x845ad                        ; xmm8 = {d-f, c+g} via
   *                                          ;   subpd/addpd + blendpd $0x2
   *           movupd %xmm8,0x8(%rdi)         ; m01 = d - f ; m02 = c + g
   *   0x845b3 xorl %eax,%eax ; movq %rax,0x18(%rdi)   ; m03 = 0.0
   *   0x845b9 movlpd %xmm9,0x20(%rdi)        ; m10 = d + f
   *   0x845bf addsd %xmm1,%xmm3              ; xmm3 = i + b
   *   0x845cd movsd  %xmm8,0x28(%rdi)        ; m11 = 1.0 - (i + b)
   *   0x845d7 subsd %xmm6,%xmm0
   *   0x845db movsd  %xmm0,0x30(%rdi)        ; m12 = h - a
   *   0x845e0 movq  %rax,0x38(%rdi)          ; m13 = 0.0
   *   0x845e4-0x845f4                        ; xmm5 = {g-c, a+h} via
   *                                          ;   unpckhpd/movddup/addpd/subpd/blendpd
   *   0x845fa movupd %xmm5,0x40(%rdi)        ; m20 = g - c ; m21 = a + h
   *   0x845ff addsd %xmm1,%xmm2              ; xmm2 = e + b
   *   0x84603 subsd %xmm2,%xmm7              ; xmm7 = 1.0 - (e + b)
   *   0x84607 movsd  %xmm7,0x50(%rdi)        ; m22
   *   0x8460c xorpd %xmm0,%xmm0
   *   0x84610 movupd %xmm0,0x58(%rdi)        ; m23 = 0.0 ; m30 = 0.0
   *   0x84615 movupd %xmm0,0x68(%rdi)        ; m31 = 0.0 ; m32 = 0.0
   *   0x8461a movabsq $0x3ff0000000000000,%rax
   *   0x84624 movq  %rax,0x78(%rdi)          ; m33 = 1.0
   *
   * DECODE NOTES:
   *   * THE NORM GUARD. `xorpd %xmm3,%xmm3 ; cmpltsd %xmm1,%xmm3 ; andpd
   *     %xmm2,%xmm3` computes `s = (0.0 < normSq) ? 2.0/normSq : 0.0`. AT&T
   *     `cmpltsd %src,%dst` evaluates `dst < src`, and dst is the zero
   *     register, so the predicate is `0.0 < normSq` — false for a zero
   *     quaternion AND for NaN (an unordered compare is false), in which case
   *     the `andpd` masks the quotient to +0.0 and the result is the identity
   *     matrix's diagonal 1.0s with zero off-diagonals. `0 < NaN` is likewise
   *     false in JS, so the ternary below reproduces it exactly; the divide
   *     itself is performed unconditionally in the machine (@0x8451a) and its
   *     result is discarded by the mask, which is why a normSq of 0 does not
   *     trap.
   *   * every operation is an f64 (movsd/mulsd/addsd/divsd/mulpd/addpd); there
   *     is no cvtsd2ss anywhere, so NO Math.fround — see the class header's
   *     precision note.
   *   * the packed ops are transcribed as their two scalar lanes; the
   *     `shufpd`/`blendpd`/`movddup`/`unpckhpd` shuffles only choose WHICH lane
   *     is stored where, which the per-lane expressions below encode directly.
   *   * grouping is preserved exactly as the adds are issued (IEEE-754 is not
   *     associative): normSq = ((q1*q1 + q2*q2) + q3*q3) + q0*q0.
   *   * the matrix is fully overwritten — the 3x3 rotation block, the zero
   *     translation column/row, and m33 = 1.0 — so no prior contents survive.
   *
   * Zero callees: no in-scope call, no extern, no indirect or virtual dispatch
   * (`depgraph.py deps` lists nothing).
   *
   * @param q the quaternion (component 0 is the scalar — see PCQuatDouble).
   */
  setRotationFromQuaternion(q: PCQuatDouble): void {
    const m = this.m;

    // @0x844dc / @0x844e9 / @0x844f5 — the four components as the body loads
    // them: {q2,q3} packed, {q0,q1} packed, and q1 again as a scalar.
    const q0 = q.w; // +0x00
    const q1 = q.x; // +0x08
    const q2 = q.y; // +0x10
    const q3 = q.z; // +0x18

    // @0x844e5/@0x844f1/@0x844fe — the four squares.
    // @0x84502/@0x8450a/@0x8450e — summed in EXACTLY this grouping.
    const normSq = q1 * q1 + q2 * q2 + q3 * q3 + q0 * q0;

    // @0x84512-0x84527 — s = (0.0 < normSq) ? 2.0/normSq : 0.0.
    // 2.0 is the rodata double @ProChannel 0xb05f0.
    const s = 0.0 < normSq ? 2.0 / normSq : 0.0;

    // @0x8452b-0x84541 — the three scaled components.
    const sq1 = q1 * s;
    const sq2 = q2 * s;
    const sq3 = s * q3;

    // @0x84546-0x84571 — the nine products every store is built from.
    const a = q0 * sq1; // xmm6 @0x84556
    const b = sq1 * q1; // xmm1 @0x8455a
    const c = q0 * sq2; // xmm4 low  @0x8454a
    const d = q1 * sq2; // xmm4 high @0x8454a
    const e = sq2 * q2; // xmm2 @0x84569
    const f = q0 * sq3; // xmm5 low  @0x84552
    const g = q1 * sq3; // xmm5 high @0x84552
    const h = q2 * sq3; // xmm0 @0x8456d
    const i = sq3 * q3; // xmm3 @0x84571

    // @0x84580 — the 1.0 rodata double @ProChannel 0xaf528.

    // @0x84592  m00 = 1.0 - (e + i)
    m[0] = 1.0 - (e + i);
    // @0x845ad  the 16-byte store of {d - f, c + g}
    m[1] = d - f;
    m[2] = c + g;
    // @0x845b5  the zeroed %rax
    m[3] = 0.0;

    // @0x845b9  movlpd of the ADD lane {d + f, ...}
    m[4] = d + f;
    // @0x845bf/@0x845cd  m11 = 1.0 - (i + b)
    m[5] = 1.0 - (i + b);
    // @0x845d7/@0x845db  m12 = h - a
    m[6] = h - a;
    // @0x845e0
    m[7] = 0.0;

    // @0x845fa  the 16-byte store of {g - c, a + h}
    m[8] = g - c;
    m[9] = a + h;
    // @0x845ff/@0x84603/@0x84607  m22 = 1.0 - (e + b)
    m[10] = 1.0 - (e + b);
    // @0x84610  the first zeroing 16-byte store covers m23 and m30
    m[11] = 0.0;
    m[12] = 0.0;

    // @0x84615  the second zeroing 16-byte store covers m31 and m32
    m[13] = 0.0;
    m[14] = 0.0;
    // @0x8461a/@0x84624  movabsq $0x3ff0000000000000 (= 1.0)
    m[15] = 1.0;
  }

  // ==========================================================================
  //  transform<Vector2>  @ProCore 0x000c4b6a  — THE UNLOCK
  // ==========================================================================
  /**
   * `PCVector2<double>& PCMatrix44Tmpl<double>::transform<double>(
   *      PCVector2<double> const& in, PCVector2<double>& out) const`
   *
   * @ProCore 0x000c4b6a  (mangled __ZNK14PCMatrix44TmplIdE9transformIdEE
   *                     R9PCVector2IT_ERKS4_S5_)
   *
   * Treats `in` as (x, y, 0, 1) in homogeneous space and returns the
   * perspective-divided (x/w, y/w).  Full transcription of the 28-instr
   * body in ProCore.PCMatrix44Tmpl_double.transform_v2.s:
   *
   *   movsd (%rsi), %xmm1           x = in.x
   *   movsd 0x8(%rsi), %xmm0        y = in.y
   *   movsd 0x60(%rdi), %xmm2       m30*x -> xmm2 (below)
   *   mulsd  %xmm1, %xmm2                    "
   *   movsd 0x68(%rdi), %xmm3       m31*y
   *   mulsd  %xmm0, %xmm3
   *   addsd  %xmm2, %xmm3           + m30*x
   *   addsd 0x78(%rdi), %xmm3       + m33   -> w = m30*x + m31*y + m33
   *   movsd (%rdi), %xmm2           m00
   *   mulsd  %xmm1, %xmm2
   *   movsd 0x8(%rdi), %xmm4        m01
   *   mulsd  %xmm0, %xmm4
   *   addsd  %xmm2, %xmm4
   *   addsd 0x18(%rdi), %xmm4       + m03
   *   divsd  %xmm3, %xmm4           / w
   *   movsd  %xmm4, (%rdx)          out.x = ...
   *   mulsd 0x20(%rdi), %xmm1       (reuse xmm1 = x) *= m10
   *   mulsd 0x28(%rdi), %xmm0       (reuse xmm0 = y) *= m11
   *   addsd  %xmm1, %xmm0
   *   addsd 0x38(%rdi), %xmm0       + m13
   *   divsd  %xmm3, %xmm0           / w
   *   movsd  %xmm0, 0x8(%rdx)
   *   retq
   */
  transformVec2(inV: PCVector2Double, out: PCVector2Double): PCVector2Double {
    const m = this.m;
    const x = inV.x;
    const y = inV.y;
    // w = m30*x + m31*y + m33      (row 3 dot (x, y, 0, 1))
    const w = m[12] * x + m[13] * y + m[15];
    // out.x = (m00*x + m01*y + m03) / w
    out.x = (m[0] * x + m[1] * y + m[3]) / w;
    // out.y = (m10*x + m11*y + m13) / w
    out.y = (m[4] * x + m[5] * y + m[7]) / w;
    return out;
  }

  // ==========================================================================
  //  transform<Vector3>  @ProCore 0x000188c4
  // ==========================================================================
  /**
   * `PCVector3<double>& PCMatrix44Tmpl<double>::transform<double>(
   *      PCVector3<double> const& in, PCVector3<double>& out) const`
   *
   * @ProCore 0x000188c4  (see transform_v3.s).
   *
   * Treats `in` as (x, y, z, 1) and returns (x/w, y/w, z/w).  Full
   * transcription: shares the same shape as v2 but with the extra z
   * multiplier loaded from m02/m12/m22/m32 at 0x10/0x30/0x50/0x70.
   */
  transformVec3(inV: PCVector3Double, out: PCVector3Double): PCVector3Double {
    const m = this.m;
    const x = inV.x;
    const y = inV.y;
    const z = inV.z;
    // w = m30*x + m31*y + m32*z + m33     (row 3 · (x,y,z,1))
    const w = m[12] * x + m[13] * y + m[14] * z + m[15];
    // out.x = (m00*x + m01*y + m02*z + m03) / w
    out.x = (m[0] * x + m[1] * y + m[2] * z + m[3]) / w;
    // out.y = (m10*x + m11*y + m12*z + m13) / w
    out.y = (m[4] * x + m[5] * y + m[6] * z + m[7]) / w;
    // out.z = (m20*x + m21*y + m22*z + m23) / w
    out.z = (m[8] * x + m[9] * y + m[10] * z + m[11]) / w;
    return out;
  }

  // ==========================================================================
  //  transform<Vector3>  IN-PLACE (single arg)  @Ozone 0x5b080
  // ==========================================================================
  /**
   * `PCVector3<double>& PCMatrix44Tmpl<double>::transform<double>(
   *      PCVector3<double>& v) const`
   *
   * @Ozone 0x5b080  (mangled __ZNK14PCMatrix44TmplIdE9transformIdEER9PCVector3IT_ES5_;
   *                  see raw-port/re/disasm/__ZNK14PCMatrix44TmplIdE9transformIdEER9PCVector3IT_ES5_.s).
   *
   * The SINGLE-ARGUMENT, IN-PLACE overload: reads (x,y,z) from `v`, treats it
   * as the homogeneous point (x,y,z,1), computes the perspective-divided
   * transform, and writes the result back into the SAME `v` (returning it).
   * Distinct from transformVec3 @0x188c4 (which has separate in/out refs).
   *
   * The machine loads x,y,z into registers (xmm2/xmm1/xmm0) at the top before
   * any store, so the in-place write of v.x cannot clobber the z read.
   *
   * Full instruction transcription (double precision throughout — every op is
   * movsd/mulsd/addsd/divsd, so NO Math.fround; the value is f64):
   *   0x5b084  movq   %rsi, %rax                 ; return value = &v
   *   0x5b087  movsd  (%rsi), %xmm2              ; x = v.x        (+0x00)
   *   0x5b08b  movsd  0x8(%rsi), %xmm1           ; y = v.y        (+0x08)
   *   0x5b090  movsd  0x10(%rsi), %xmm0          ; z = v.z        (+0x10)
   *   ; --- w = m30*x + m31*y + m32*z + m33  (row 3, the perspective row) ---
   *   0x5b095  movsd  0x60(%rdi), %xmm3 ; mulsd %xmm2 -> m[12]*x   (m30 @0x60)
   *   0x5b09e  movsd  0x68(%rdi), %xmm4 ; mulsd %xmm1 -> m[13]*y   (m31 @0x68)
   *   0x5b0a7  addsd  %xmm3, %xmm4
   *   0x5b0ab  movsd  0x70(%rdi), %xmm3 ; mulsd %xmm0 -> m[14]*z   (m32 @0x70)
   *   0x5b0b4  addsd  %xmm4, %xmm3
   *   0x5b0b8  addsd  0x78(%rdi), %xmm3            ; + m[15]        (m33 @0x78)
   *                                               ; xmm3 = w (kept for all divides)
   *   ; --- v.x = (m00*x + m01*y + m02*z + m03) / w ---
   *   0x5b0bd  movsd  (%rdi), %xmm4    ; mulsd %xmm2 -> m[0]*x     (m00 @0x00)
   *   0x5b0c5  movsd  0x8(%rdi), %xmm5 ; mulsd %xmm1 -> m[1]*y     (m01 @0x08)
   *   0x5b0ce  addsd  %xmm4, %xmm5
   *   0x5b0d2  movsd  0x10(%rdi), %xmm4; mulsd %xmm0 -> m[2]*z     (m02 @0x10)
   *   0x5b0db  addsd  %xmm5, %xmm4
   *   0x5b0df  addsd  0x18(%rdi), %xmm4           ; + m[3]         (m03 @0x18)
   *   0x5b0e4  divsd  %xmm3, %xmm4                ; / w
   *   0x5b0e8  movsd  %xmm4, (%rsi)               ; v.x = ...      (+0x00)
   *   ; --- v.y = (m10*x + m11*y + m12*z + m13) / w ---
   *   0x5b0ec  movsd  0x20(%rdi), %xmm4; mulsd %xmm2 -> m[4]*x     (m10 @0x20)
   *   0x5b0f5  movsd  0x28(%rdi), %xmm5; mulsd %xmm1 -> m[5]*y     (m11 @0x28)
   *   0x5b0fe  addsd  %xmm4, %xmm5
   *   0x5b102  movsd  0x30(%rdi), %xmm4; mulsd %xmm0 -> m[6]*z     (m12 @0x30)
   *   0x5b10b  addsd  %xmm5, %xmm4
   *   0x5b10f  addsd  0x38(%rdi), %xmm4           ; + m[7]         (m13 @0x38)
   *   0x5b114  divsd  %xmm3, %xmm4                ; / w
   *   0x5b118  movsd  %xmm4, 0x8(%rsi)            ; v.y = ...      (+0x08)
   *   ; --- v.z = (m20*x + m21*y + m22*z + m23) / w ---
   *   0x5b11d  mulsd  0x40(%rdi), %xmm2 -> m[8]*x                  (m20 @0x40)
   *   0x5b122  mulsd  0x48(%rdi), %xmm1 -> m[9]*y                  (m21 @0x48)
   *   0x5b127  mulsd  0x50(%rdi), %xmm0 -> m[10]*z                 (m22 @0x50)
   *   0x5b12c  addsd  %xmm2, %xmm1
   *   0x5b130  addsd  %xmm1, %xmm0
   *   0x5b134  addsd  0x58(%rdi), %xmm0           ; + m[11]        (m23 @0x58)
   *   0x5b139  divsd  %xmm3, %xmm0                ; / w
   *   0x5b13d  movsd  %xmm0, 0x10(%rsi)           ; v.z = ...      (+0x10)
   *   0x5b143  retq                               ; return &v (in %rax)
   */
  transformVec3InPlace(v: PCVector3Double): PCVector3Double {
    const m = this.m;
    // Read x,y,z first (registers xmm2/xmm1/xmm0) BEFORE any store, exactly as
    // the machine does @0x5b087–0x5b090 — so writing v.x can't clobber z.
    const x = v.x;
    const y = v.y;
    const z = v.z;
    // w = m30*x + m31*y + m32*z + m33   (row 3 · (x,y,z,1))  @0x5b095–0x5b0b8
    const w = m[12] * x + m[13] * y + m[14] * z + m[15];
    // v.x = (m00*x + m01*y + m02*z + m03) / w   @0x5b0bd–0x5b0e8
    v.x = (m[0] * x + m[1] * y + m[2] * z + m[3]) / w;
    // v.y = (m10*x + m11*y + m12*z + m13) / w   @0x5b0ec–0x5b118
    v.y = (m[4] * x + m[5] * y + m[6] * z + m[7]) / w;
    // v.z = (m20*x + m21*y + m22*z + m23) / w   @0x5b11d–0x5b13d
    v.z = (m[8] * x + m[9] * y + m[10] * z + m[11]) / w;
    // return &v  @0x5b084 (rax = rsi) / @0x5b143
    return v;
  }

  // ==========================================================================
  //  transform<Vector4>  @ProCore 0x00017520
  // ==========================================================================
  /**
   * `PCVector4<double>& PCMatrix44Tmpl<double>::transform<double>(
   *      PCVector4<double> const& in, PCVector4<double>& out) const`
   *
   * @ProCore 0x00017520  (see transform_v4.s).
   *
   * Pure matrix*vector: does NOT perspective-divide (returns raw
   * homogeneous coordinates, which is why w is a stored output rather
   * than a hidden divisor).  This is the overload transformRect uses
   * to detect w-sign crossings before dividing.
   */
  transformVec4(inV: PCVector4Double, out: PCVector4Double): PCVector4Double {
    const m = this.m;
    const x = inV.x;
    const y = inV.y;
    const z = inV.z;
    const w = inV.w;
    // out.x = m00*x + m01*y + m02*z + m03*w   (row 0 · in)
    out.x = m[0] * x + m[1] * y + m[2] * z + m[3] * w;
    // out.y = row 1 · in
    out.y = m[4] * x + m[5] * y + m[6] * z + m[7] * w;
    // out.z = row 2 · in
    out.z = m[8] * x + m[9] * y + m[10] * z + m[11] * w;
    // out.w = row 3 · in
    out.w = m[12] * x + m[13] * y + m[14] * z + m[15] * w;
    return out;
  }

  // ==========================================================================
  //  transform<Vector2 -> Vector4>  @ProCore 0x00050dfa
  // ==========================================================================
  /**
   * `PCVector4<double>& PCMatrix44Tmpl<double>::transform<double>(
   *      PCVector2<double> const& in, PCVector4<double>& out) const`
   *
   * @ProCore 0x00050dfa  (mangled __ZNK14PCMatrix44TmplIdE9transformIdEE
   *                     R9PCVector4IT_ERK9PCVector2IS3_ES5_)
   *
   * Treats `in` as (x, y, 0, 1) and computes the full 4-component result
   * WITHOUT perspective divide (unlike transformVec2, which does divide;
   * unlike transformVec4, which uses in.w — here w is implicitly 1 and z
   * is implicitly 0). Every row is dotted with (x, y, 0, 1) → row_i.0*x
   * + row_i.1*y + row_i.3, i.e. m02 (row·col 2) is skipped entirely.
   *
   * Full transcription of the 35-instr body in
   * raw-port/re/disasm/ProCore.__ZNK14PCMatrix44TmplIdE9transformIdEE
   * R9PCVector4IT_ERK9PCVector2IS3_ES5_.s:
   *
   *   0x50dfe  movq   %rdx, %rax                ; rax = &out (return value)
   *   0x50e01  movsd  (%rsi), %xmm1             ; xmm1 = in.x
   *   0x50e05  movsd  0x8(%rsi), %xmm0          ; xmm0 = in.y
   *   0x50e0a  movsd  (%rdi), %xmm2             ; xmm2 = m00
   *   0x50e0e  mulsd  %xmm1, %xmm2              ; xmm2 = m00*x
   *   0x50e12  movsd  0x8(%rdi), %xmm3          ; xmm3 = m01
   *   0x50e17  mulsd  %xmm0, %xmm3              ; xmm3 = m01*y
   *   0x50e1b  addsd  %xmm2, %xmm3              ; xmm3 = m00*x + m01*y
   *   0x50e1f  addsd  0x18(%rdi), %xmm3         ; xmm3 += m03
   *                                             ;   NOTE: 0x10(%rdi)=m02
   *                                             ;   is NOT loaded — z=0 is
   *                                             ;   folded away at compile
   *                                             ;   time.
   *   0x50e24  movsd  %xmm3, (%rdx)             ; out.x = row0·(x,y,0,1)
   *   0x50e28  movsd  0x20(%rdi), %xmm2         ; xmm2 = m10
   *   0x50e2d  mulsd  %xmm1, %xmm2              ; xmm2 = m10*x
   *   0x50e31  movsd  0x28(%rdi), %xmm3         ; xmm3 = m11
   *   0x50e36  mulsd  %xmm0, %xmm3              ; xmm3 = m11*y
   *   0x50e3a  addsd  %xmm2, %xmm3              ; xmm3 = m10*x + m11*y
   *   0x50e3e  addsd  0x38(%rdi), %xmm3         ; xmm3 += m13
   *                                             ;   (m12 at 0x30(%rdi)
   *                                             ;   skipped for the same
   *                                             ;   z=0 reason)
   *   0x50e43  movsd  %xmm3, 0x8(%rdx)          ; out.y = row1·(x,y,0,1)
   *   0x50e48  movsd  0x40(%rdi), %xmm2         ; xmm2 = m20
   *   0x50e4d  mulsd  %xmm1, %xmm2              ; xmm2 = m20*x
   *   0x50e51  movsd  0x48(%rdi), %xmm3         ; xmm3 = m21
   *   0x50e56  mulsd  %xmm0, %xmm3              ; xmm3 = m21*y
   *   0x50e5a  addsd  %xmm2, %xmm3              ; xmm3 = m20*x + m21*y
   *   0x50e5e  addsd  0x58(%rdi), %xmm3         ; xmm3 += m23
   *                                             ;   (m22 at 0x50 skipped)
   *   0x50e63  movsd  %xmm3, 0x10(%rdx)         ; out.z = row2·(x,y,0,1)
   *   0x50e68  mulsd  0x60(%rdi), %xmm1         ; xmm1 = m30*x
   *                                             ;   (in-place: reuses
   *                                             ;   xmm1 since x is not
   *                                             ;   needed again)
   *   0x50e6d  mulsd  0x68(%rdi), %xmm0         ; xmm0 = m31*y
   *                                             ;   (in-place: reuses
   *                                             ;   xmm0)
   *   0x50e72  addsd  %xmm1, %xmm0              ; xmm0 = m30*x + m31*y
   *   0x50e76  addsd  0x78(%rdi), %xmm0         ; xmm0 += m33
   *                                             ;   (m32 at 0x70 skipped)
   *   0x50e7b  movsd  %xmm0, 0x18(%rdx)         ; out.w = row3·(x,y,0,1)
   *   0x50e80  popq   %rbp                      ; epilogue
   *   0x50e81  retq                             ; return rax (&out)
   *
   * NO divsd anywhere → no perspective divide. NO cvtsd2ss → full IEEE-754
   * f64 (matches transformVec4's precision discipline).
   *
   * The return value is the same reference as `out` (rax = rdx @0x50dfe);
   * we mirror that by returning `out` at the end.
   */
  transformVec2ToVec4(
    inV: PCVector2Double,
    out: PCVector4Double,
  ): PCVector4Double {
    const m = this.m;
    // @0x50e01..0x50e05 — load in.x, in.y.
    const x = inV.x;
    const y = inV.y;
    // @0x50e0a..0x50e24 — out.x = m00*x + m01*y + m03  (row 0 · (x,y,0,1))
    out.x = m[0] * x + m[1] * y + m[3];
    // @0x50e28..0x50e43 — out.y = m10*x + m11*y + m13  (row 1 · ...)
    out.y = m[4] * x + m[5] * y + m[7];
    // @0x50e48..0x50e63 — out.z = m20*x + m21*y + m23  (row 2 · ...)
    out.z = m[8] * x + m[9] * y + m[11];
    // @0x50e68..0x50e7b — out.w = m30*x + m31*y + m33  (row 3 · ...)
    out.w = m[12] * x + m[13] * y + m[15];
    // @0x50e80..0x50e81 — retq (rax = rdx = &out; we return the reference).
    return out;
  }

  // ==========================================================================
  //  isIdentity  @ProCore 0x0004ef7e
  // ==========================================================================
  /**
   * `bool PCMatrix44Tmpl<double>::isIdentity() const`  @ProCore 0x0004ef7e.
   *
   * Full transcription of isIdentity.s (bit-mask abs at
   * `andpd 0xd36e1(%rip)` = 0x122670 = 0x7fffffffffffffff twice; epsilon
   * loaded once at 0xd38e5(%rip) = 0x122880 = 1e-7).  Checks:
   *   |m33| < 1e-7                         -> not identity (m33 must be
   *                                            nearly 1; here we check
   *                                            that x<eps where x = m33
   *                                            AFTER the initial mask.
   *                                            Reading the disasm more
   *                                            carefully: xmm2 = |m33|,
   *                                            xmm0 = 1e-7, `ja` on
   *                                            `ucomisd %xmm2, %xmm0`
   *                                            branches when 1e-7 > |m33|.
   *                                            That's the "m33 nearly
   *                                            zero" bail: return false
   *                                            when m33 is (paradoxically)
   *                                            close to zero.  The rest
   *                                            of the checks are
   *                                            |m_ii - m33| < eps for
   *                                            diagonal ii=0,1,2 (that
   *                                            enforces m00 = m11 = m22
   *                                            = m33, close to 1 in
   *                                            practice), and |m_ij| < eps
   *                                            for every off-diagonal.
   *
   * The `abs < 1e-7` test uses the sign-mask constant at 0x122670 =
   * 0x7fffffffffffffff (two-lane 128-bit vector); the epsilon 1e-7 is
   * at 0x122880 (see the head comment).  Both cited by address above.
   *
   * Returns false as soon as ANY tolerance fails (all `jbe` -> 0x4f0f0
   * exit is a `xor %eax,%eax; ret`).  If every test passes, returns true.
   */
  isIdentity(): boolean {
    const m = this.m;
    const EPS = 1e-7;              // @ProCore rodata 0x122880
    // Emulate |x| via Math.abs — matches the andpd of the sign mask
    // 0x7fffffffffffffff at @ProCore rodata 0x122670 (clear sign bit).
    const abs = Math.abs;

    // Order taken verbatim from the disasm (0x4ef82 -> 0x4f0aa):
    //   check |m33|         (m[15])
    //   check |m00 - m33|   (diagonal equality)
    //   check |m11 - m33|
    //   check |m22 - m33|
    //   check |m01|, |m02|, |m03|                             row 0 off-diags
    //   check |m10|, |m12|, |m13|                             row 1 off-diags
    //   check |m20|, |m21|, |m23|                             row 2 off-diags
    //   check |m30|, |m31|, |m32|                             row 3 off-diags
    // Every `jbe 0x4f0f0` is a "-> return false" branch. In the disasm
    // the compare pattern is `ucomisd %xmm_abs, %xmm_eps` with `jbe`
    // meaning eps <= abs, i.e. the value is NOT small enough — return
    // false in that case.  We invert: `abs(...) >= EPS` -> return false.
    const m33 = m[15];
    if (abs(m33) < EPS) return false;                 // 0x4ef82..0x4ef9f
    if (abs(m[0]  - m33) >= EPS) return false;        // m00 vs m33   @0x4efa5
    if (abs(m[5]  - m33) >= EPS) return false;        // m11 vs m33   @0x4efbf
    if (abs(m[10] - m33) >= EPS) return false;        // m22 vs m33   @0x4efda
    if (abs(m[1])  >= EPS) return false;              // m01           @0x4eff5
    if (abs(m[2])  >= EPS) return false;              // m02           @0x4f00c
    if (abs(m[3])  >= EPS) return false;              // m03           @0x4f023
    if (abs(m[4])  >= EPS) return false;              // m10           @0x4f03a
    if (abs(m[6])  >= EPS) return false;              // m12           @0x4f051
    if (abs(m[7])  >= EPS) return false;              // m13           @0x4f068
    if (abs(m[8])  >= EPS) return false;              // m20           @0x4f07b
    if (abs(m[9])  >= EPS) return false;              // m21           @0x4f08e
    if (abs(m[11]) >= EPS) return false;              // m23           @0x4f0a1
    // Row-3 off-diagonals are checked in a tail block after the fall-through
    // (0x4f0b4-0x4f0e2 in the disasm) — same structure.
    if (abs(m[12]) >= EPS) return false;              // m30
    if (abs(m[13]) >= EPS) return false;              // m31
    if (abs(m[14]) >= EPS) return false;              // m32
    return true;
  }

  // ==========================================================================
  //  transpose  @ProCore 0x0004ffd4
  // ==========================================================================
  /**
   * `void PCMatrix44Tmpl<double>::transpose()`  @ProCore 0x0004ffd4.
   *
   * Full transcription of transpose.s — a straight-line series of 6
   * pair-swaps (movsd load/store) covering exactly the off-diagonal
   * pairs of a 4x4 transpose:
   *
   *   swap(0x08, 0x20)   => m01 <-> m10
   *   swap(0x10, 0x40)   => m02 <-> m20
   *   swap(0x18, 0x60)   => m03 <-> m30
   *   swap(0x30, 0x48)   => m12 <-> m21
   *   swap(0x38, 0x68)   => m13 <-> m31
   *   swap(0x58, 0x70)   => m23 <-> m32
   *
   * Diagonals m00,m11,m22,m33 are untouched.
   */
  transpose(): void {
    const m = this.m;
    let t: number;
    t = m[1]; m[1] = m[4]; m[4] = t;   // m01 <-> m10   (offsets 0x08 <-> 0x20)
    t = m[2]; m[2] = m[8]; m[8] = t;   // m02 <-> m20   (0x10 <-> 0x40)
    t = m[3]; m[3] = m[12]; m[12] = t; // m03 <-> m30   (0x18 <-> 0x60)
    t = m[6]; m[6] = m[9]; m[9] = t;   // m12 <-> m21   (0x30 <-> 0x48)
    t = m[7]; m[7] = m[13]; m[13] = t; // m13 <-> m31   (0x38 <-> 0x68)
    t = m[11]; m[11] = m[14]; m[14] = t; // m23 <-> m32 (0x58 <-> 0x70)
  }

  // ==========================================================================
  //  leftTranslate(tx, ty, tz)  @ProCore 0x0004f378
  // ==========================================================================
  /**
   * `void PCMatrix44Tmpl<double>::leftTranslate(double tx, double ty, double tz)`
   *  @ProCore 0x0004f378 — computes `this = T * this`, where
   *   T = [[1,0,0,tx],[0,1,0,ty],[0,0,1,tz],[0,0,0,1]].
   *
   * The binary special-cases each axis: `ucomisd %xmm3(=0), %xmm{arg};
   * jne/jnp -> skip` at 0x4f380, 0x4f3b8, 0x4f3f6 — the row is left
   * untouched when the corresponding translation is exactly 0.0.
   *
   * Per-axis body (movupd 16B-at-a-time):
   *   if (tx != 0) { row0 += tx * row3 }        <- 0x4f388..0x4f3b3
   *   if (ty != 0) { row1 += ty * row3 }        <- 0x4f3c0..0x4f3ed
   *   if (tz != 0) { row2 += tz * row3 }        <- 0x4f3fe..0x4f42b
   *
   * (This is the row 0-of-T*M = row0(M) + tx*row3(M) identity for a
   *  translation T with tx on col 3.)
   */
  leftTranslate(tx: number, ty: number, tz: number): void {
    const m = this.m;
    if (tx !== 0) {
      m[0]  += tx * m[12];
      m[1]  += tx * m[13];
      m[2]  += tx * m[14];
      m[3]  += tx * m[15];
    }
    if (ty !== 0) {
      m[4]  += ty * m[12];
      m[5]  += ty * m[13];
      m[6]  += ty * m[14];
      m[7]  += ty * m[15];
    }
    if (tz !== 0) {
      m[8]  += tz * m[12];
      m[9]  += tz * m[13];
      m[10] += tz * m[14];
      m[11] += tz * m[15];
    }
  }

  // ==========================================================================
  //  rightTranslate(tx, ty, tz)  @ProCore 0x0004f444
  // ==========================================================================
  /**
   * `void PCMatrix44Tmpl<double>::rightTranslate(double tx, double ty, double tz)`
   *  @ProCore 0x0004f444 — computes `this = this * T`, again with the
   *  per-axis "skip when zero" guard.  For M*T the effect is:
   *    col3(result) = col3(M) + tx*col0(M) + ty*col1(M) + tz*col2(M).
   *
   * Body (movsd/mulsd, one axis at a time, 4 rows each):
   *   if (tx != 0) { for r in 0..3: m[r][3] += tx * m[r][0] }
   *   if (ty != 0) { for r in 0..3: m[r][3] += ty * m[r][1] }
   *   if (tz != 0) { for r in 0..3: m[r][3] += tz * m[r][2] }
   * See disasm 0x4f454..0x4f53a.
   */
  rightTranslate(tx: number, ty: number, tz: number): void {
    const m = this.m;
    if (tx !== 0) {
      m[3]  += tx * m[0];
      m[7]  += tx * m[4];
      m[11] += tx * m[8];
      m[15] += tx * m[12];
    }
    if (ty !== 0) {
      m[3]  += ty * m[1];
      m[7]  += ty * m[5];
      m[11] += ty * m[9];
      m[15] += ty * m[13];
    }
    if (tz !== 0) {
      m[3]  += tz * m[2];
      m[7]  += tz * m[6];
      m[11] += tz * m[10];
      m[15] += tz * m[14];
    }
  }

  // ==========================================================================
  //  leftScale(sx, sy, sz)  @ProCore 0x0004f552
  // ==========================================================================
  /**
   * `void PCMatrix44Tmpl<double>::leftScale(double sx, double sy, double sz)`
   *  @ProCore 0x0004f552 — computes `this = S * this` for S=diag(sx,sy,sz,1).
   *
   * The disasm compares each arg to 1.0 (rodata @ProCore 0x00122530) and
   * SKIPS the row when the scale is exactly 1.0.  Otherwise it broadcasts
   * the scale via `movddup` and does `movupd row; mulpd; movupd back`.
   *
   *   if (sx != 1.0) { row0 *= sx }       <- 0x4f556..0x4f57b
   *   if (sy != 1.0) { row1 *= sy }       <- 0x4f580..0x4f5a7
   *   if (sz != 1.0) { row2 *= sz }       <- 0x4f5ac..0x4f5d3
   *   row3 is untouched (S has 1 in its lower-right slot).
   */
  leftScale(sx: number, sy: number, sz: number): void {
    const m = this.m;
    if (sx !== 1.0) {                         // @0x4f556 vs 1.0 @0x122530
      m[0] *= sx; m[1] *= sx; m[2] *= sx; m[3] *= sx;
    }
    if (sy !== 1.0) {                         // @0x4f580 vs 1.0
      m[4] *= sy; m[5] *= sy; m[6] *= sy; m[7] *= sy;
    }
    if (sz !== 1.0) {                         // @0x4f5ac vs 1.0
      m[8] *= sz; m[9] *= sz; m[10] *= sz; m[11] *= sz;
    }
  }

  // ==========================================================================
  //  rightScale(sx, sy, sz)  @ProCore 0x0004f5ec
  // ==========================================================================
  /**
   * `void PCMatrix44Tmpl<double>::rightScale(double sx, double sy, double sz)`
   *  @ProCore 0x0004f5ec — computes `this = this * S` for S=diag(sx,sy,sz,1).
   *
   * Column j of result is s_j * col_j.  Body (movsd/mulsd, one axis at
   * a time, skips when == 1.0):
   *   if (sx != 1.0) { for r in 0..3: m[r][0] *= sx }
   *   if (sy != 1.0) { for r in 0..3: m[r][1] *= sy }
   *   if (sz != 1.0) { for r in 0..3: m[r][2] *= sz }
   *   col 3 untouched.
   * See disasm 0x4f5fc..0x4f6a9.
   */
  rightScale(sx: number, sy: number, sz: number): void {
    const m = this.m;
    if (sx !== 1.0) {
      m[0]  *= sx; m[4]  *= sx; m[8]  *= sx; m[12] *= sx;
    }
    if (sy !== 1.0) {
      m[1]  *= sy; m[5]  *= sy; m[9]  *= sy; m[13] *= sy;
    }
    if (sz !== 1.0) {
      m[2]  *= sz; m[6]  *= sz; m[10] *= sz; m[14] *= sz;
    }
  }

  // ==========================================================================
  //  leftMult(other)  @ProCore 0x0005065c
  // ==========================================================================
  /**
   * `void PCMatrix44Tmpl<double>::leftMult(PCMatrix44Tmpl<double> const& other)`
   *  @ProCore 0x0005065c — `this = other * this`.
   *
   * The disasm walks 4 columns of `this` (rcx = 0xc..0xf, indexing by
   * `-0x60(%rax,%rcx,8)`, `-0x40(...)`, `-0x20(...)`, `(...,rcx,8)` —
   * i.e. offsets rcx*8-0x60, rcx*8-0x40, rcx*8-0x20, rcx*8 = the four
   * doubles at rows 0,1,2,3 of column k=rcx-0xc).  For each column k:
   *    a = this[0][k]  b = this[1][k]  c = this[2][k]  d = this[3][k]
   *    for i in 0..3:
   *      this[i][k] = other[i][0]*a + other[i][1]*b + other[i][2]*c + other[i][3]*d
   *
   * This is the standard result = other * this decomposed by column of
   * `this`, using `this`'s own storage as workspace.
   */
  leftMult(other: PCMatrix44Tmpl_double): void {
    const t = this.m;
    const o = other.m;
    for (let k = 0; k < 4; k++) {
      // Snapshot this's column k before writes clobber it.
      const a = t[0 * 4 + k];
      const b = t[1 * 4 + k];
      const c = t[2 * 4 + k];
      const d = t[3 * 4 + k];
      t[0 * 4 + k] = o[0] * a + o[1] * b + o[2]  * c + o[3]  * d;
      t[1 * 4 + k] = o[4] * a + o[5] * b + o[6]  * c + o[7]  * d;
      t[2 * 4 + k] = o[8] * a + o[9] * b + o[10] * c + o[11] * d;
      t[3 * 4 + k] = o[12] * a + o[13] * b + o[14] * c + o[15] * d;
    }
  }

  // ==========================================================================
  //  rightMult(other)  @ProCore 0x00050782
  // ==========================================================================
  /**
   * `void PCMatrix44Tmpl<double>::rightMult(PCMatrix44Tmpl<double> const& other)`
   *  @ProCore 0x00050782 — `this = this * other`.
   *
   * The disasm walks 4 rows of `this` (rcx = 0x18, 0x38, 0x58, 0x78,
   * step 0x20; indexing by `-0x18(%rax,%rcx)`.. `(%rax,%rcx)`, i.e. the
   * four doubles ending at row `rcx/0x20` col 3).  For each row i:
   *    (a,b,c,d) = this[i][0..3]
   *    this[i][j] = a*other[0][j] + b*other[1][j] + c*other[2][j] + d*other[3][j]
   *      for j in 0..3.
   */
  rightMult(other: PCMatrix44Tmpl_double): void {
    const t = this.m;
    const o = other.m;
    for (let i = 0; i < 4; i++) {
      const a = t[i * 4 + 0];
      const b = t[i * 4 + 1];
      const c = t[i * 4 + 2];
      const d = t[i * 4 + 3];
      t[i * 4 + 0] = a * o[0]  + b * o[4]  + c * o[8]  + d * o[12];
      t[i * 4 + 1] = a * o[1]  + b * o[5]  + c * o[9]  + d * o[13];
      t[i * 4 + 2] = a * o[2]  + b * o[6]  + c * o[10] + d * o[14];
      t[i * 4 + 3] = a * o[3]  + b * o[7]  + c * o[11] + d * o[15];
    }
  }

  // ==========================================================================
  //  operator*(other)  @ProCore 0x00068210
  // ==========================================================================
  /**
   * `PCMatrix44Tmpl<double> PCMatrix44Tmpl<double>::operator*(
   *      PCMatrix44Tmpl<double> const& other) const`
   *  @ProCore 0x00068210 — returns `this * other` in a fresh matrix
   *  (rdi = sret, rsi = this, rdx = other in the SysV ABI).
   *
   * The disasm first zeroes the return slot to identity (prologue at
   * 0x68217..0x68247 — dead, since the whole 128 B is overwritten in
   * the SIMD loop below, but we mirror it), then broadcasts each of
   * other's 16 doubles into xmm{0..15}/stack, and computes the product
   * two rows of `this` at a time via `movsd/movhpd` column packs and
   * `mulpd/addpd` accumulators.  The math is the standard 4x4 GEMM:
   *      result[i][j] = sum_k this[i][k] * other[k][j].
   */
  multiply(other: PCMatrix44Tmpl_double): PCMatrix44Tmpl_double {
    const a = this.m;
    const b = other.m;
    const out = new PCMatrix44Tmpl_double();
    const r = out.m;
    // Zero (the disasm's dead identity init would be overwritten anyway;
    // we just start from the default-identity result and stamp over it).
    for (let i = 0; i < 4; i++) {
      const ai0 = a[i * 4 + 0];
      const ai1 = a[i * 4 + 1];
      const ai2 = a[i * 4 + 2];
      const ai3 = a[i * 4 + 3];
      for (let j = 0; j < 4; j++) {
        r[i * 4 + j] =
          ai0 * b[0 * 4 + j] +
          ai1 * b[1 * 4 + j] +
          ai2 * b[2 * 4 + j] +
          ai3 * b[3 * 4 + j];
      }
    }
    return out;
  }

  // ==========================================================================
  //  UNPORTED — throwing stubs.  Each cites its @0xADDR so `frontier.py`
  //  reports the gap; each documents on the line the reason a hand-port
  //  needs more decode work.  PORTING_SPEC rule 3.
  // ==========================================================================

  /**
   * `PCMatrix44Tmpl<double>::determinant() const` — ProChannel @0x00085f64
   * (__ZNK14PCMatrix44TmplIdE11determinantEv). The same TU is emitted into
   * ProCore @0x000514bc; the ProChannel copy is the one the dep queue handed.
   *
   * FAITHFUL SIMD TRANSCRIPTION of the packed-double dataflow. Each xmm
   * register is modelled as a two-lane `[lo, hi]` pair (lane 0 = low qword,
   * lane 1 = high qword). All ops are IEEE double — no Math.fround. The
   * layout maps memory offset `0x20*r + 0x08*c` to `m[r*4+c]`, so:
   *   0x00→m0  0x10→m2  0x20→m4  0x28→m5  0x30→m6  0x38→m7
   *   0x40→m8  0x48→m9  0x50→m10 0x58→m11 0x60→m12 0x68→m13 0x70→m14 0x78→m15
   * A packed `movupd 0xNN` loads (m[NN], m[NN+8]); `movddup 0xNN` broadcasts
   * m[NN] to both lanes.
   *
   * Verified: this dataflow reproduces the analytic 4×4 determinant to
   * machine precision (rand matrix: disasm −0.0141702204356511 vs
   * numpy.linalg.det −0.0141702204356511, |Δ|=1.7e-18).
   */
  determinant(): number {
    const m = this.m;
    // packed load: movupd 0xNN -> [m[NN>>3+0], m[NN>>3+1]] (lo,hi)
    const L = (off: number): [number, number] => [
      m[off >> 3],
      m[(off >> 3) + 1],
    ];
    // movddup 0xNN -> broadcast m[NN] to both lanes
    const dd = (off: number): [number, number] => {
      const v = m[off >> 3];
      return [v, v];
    };
    const shuf01 = (x: [number, number]): [number, number] => [x[1], x[0]]; // shufpd $1 -> [1,0]
    const mul = (a: [number, number], b: [number, number]): [number, number] => [a[0] * b[0], a[1] * b[1]];
    const sub = (a: [number, number], b: [number, number]): [number, number] => [a[0] - b[0], a[1] - b[1]];
    const add = (a: [number, number], b: [number, number]): [number, number] => [a[0] + b[0], a[1] + b[1]];
    const hsub = (a: [number, number]): [number, number] => {
      const d = a[0] - a[1];
      return [d, d]; // hsubpd a,a -> (a0-a1, a0-a1)
    };
    const unpckh = (a: [number, number], b: [number, number]): [number, number] => [a[1], b[1]];
    const unpckl = (a: [number, number], b: [number, number]): [number, number] => [a[0], b[0]];

    let xmm0: [number, number], xmm1: [number, number], xmm2: [number, number];
    let xmm3: [number, number], xmm4: [number, number], xmm5: [number, number];
    let xmm6: [number, number], xmm7: [number, number];

    xmm1 = L(0x40); // 0x85f68  movupd 0x40(%rdi),%xmm1
    xmm0 = L(0x60); // 0x85f6d  movupd 0x60(%rdi),%xmm0
    xmm0 = shuf01(xmm0); // 0x85f72  shufpd $1,%xmm0,%xmm0
    xmm0 = mul(xmm0, xmm1); // 0x85f77  mulpd %xmm1,%xmm0
    xmm5 = L(0x70); // 0x85f7b  movupd 0x70(%rdi),%xmm5
    xmm4 = L(0x50); // 0x85f80  movupd 0x50(%rdi),%xmm4
    xmm2 = dd(0x48); // 0x85f85  movddup 0x48(%rdi),%xmm2
    xmm2 = mul(xmm2, xmm5); // 0x85f8a  mulpd %xmm5,%xmm2
    xmm1 = dd(0x40); // 0x85f8e  movddup 0x40(%rdi),%xmm1
    xmm1 = mul(xmm1, xmm5); // 0x85f93  mulpd %xmm5,%xmm1
    xmm5 = shuf01(xmm5); // 0x85f97  shufpd $1,%xmm5,%xmm5
    xmm5 = mul(xmm5, xmm4); // 0x85f9c  mulpd %xmm4,%xmm5
    xmm3 = dd(0x68); // 0x85fa0  movddup 0x68(%rdi),%xmm3
    xmm3 = mul(xmm3, xmm4); // 0x85fa5  mulpd %xmm4,%xmm3
    xmm2 = sub(xmm2, xmm3); // 0x85fa9  subpd %xmm3,%xmm2
    xmm3 = dd(0x60); // 0x85fad  movddup 0x60(%rdi),%xmm3
    xmm3 = mul(xmm3, xmm4); // 0x85fb2  mulpd %xmm4,%xmm3
    xmm1 = sub(xmm1, xmm3); // 0x85fb6  subpd %xmm3,%xmm1
    xmm3 = L(0x00); // 0x85fba  movupd (%rdi),%xmm3
    xmm0 = hsub(xmm0); // 0x85fbe  hsubpd %xmm0,%xmm0
    xmm4 = L(0x20); // 0x85fc2  movupd 0x20(%rdi),%xmm4
    xmm5 = hsub(xmm5); // 0x85fc7  hsubpd %xmm5,%xmm5
    xmm6 = L(0x30); // 0x85fcb  movupd 0x30(%rdi),%xmm6
    xmm0 = mul(xmm0, xmm6); // 0x85fd0  mulpd %xmm6,%xmm0
    xmm4 = shuf01(xmm4); // 0x85fd4  shufpd $1,%xmm4,%xmm4
    xmm4 = mul(xmm4, xmm5); // 0x85fd9  mulpd %xmm5,%xmm4
    xmm5 = dd(0x30); // 0x85fdd  movddup 0x30(%rdi),%xmm5
    xmm6 = [xmm2[0], xmm2[1]]; // 0x85fe2  movapd %xmm2,%xmm6
    xmm7 = dd(0x20); // 0x85fe6  movddup 0x20(%rdi),%xmm7
    xmm7 = mul(xmm7, xmm2); // 0x85feb  mulpd %xmm2,%xmm7
    xmm2 = unpckh(xmm2, xmm1); // 0x85fef  unpckhpd %xmm1,%xmm2
    xmm2 = mul(xmm2, xmm5); // 0x85ff3  mulpd %xmm5,%xmm2
    xmm5 = L(0x10); // 0x85ff7  movupd 0x10(%rdi),%xmm5
    xmm4 = sub(xmm4, xmm2); // 0x85ffc  subpd %xmm2,%xmm4
    xmm6 = unpckl(xmm6, xmm1); // 0x86000  unpcklpd %xmm1,%xmm6
    xmm2 = dd(0x38); // 0x86004  movddup 0x38(%rdi),%xmm2
    xmm2 = mul(xmm2, xmm6); // 0x86009  mulpd %xmm6,%xmm2
    xmm2 = add(xmm2, xmm4); // 0x8600d  addpd %xmm4,%xmm2
    xmm2 = mul(xmm2, xmm3); // 0x86011  mulpd %xmm3,%xmm2
    xmm3 = dd(0x28); // 0x86015  movddup 0x28(%rdi),%xmm3
    xmm3 = mul(xmm3, xmm1); // 0x8601a  mulpd %xmm1,%xmm3
    xmm7 = sub(xmm7, xmm3); // 0x8601e  subpd %xmm3,%xmm7
    xmm7 = add(xmm7, xmm0); // 0x86022  addpd %xmm0,%xmm7
    xmm5 = shuf01(xmm5); // 0x86026  shufpd $1,%xmm5,%xmm5
    xmm5 = mul(xmm5, xmm7); // 0x8602b  mulpd %xmm7,%xmm5
    xmm2 = hsub(xmm2); // 0x8602f  hsubpd %xmm2,%xmm2
    xmm0 = [xmm5[0], xmm5[1]]; // 0x86033  movapd %xmm5,%xmm0
    xmm0 = unpckh(xmm0, xmm5); // 0x86037  unpckhpd %xmm5,%xmm0 -> (xmm0.hi, xmm5.hi)
    // 0x8603b  addsd %xmm2,%xmm0 : lane0 += xmm2.lo
    xmm0 = [xmm0[0] + xmm2[0], xmm0[1]];
    // 0x8603f  subsd %xmm5,%xmm0 : lane0 -= xmm5.lo
    xmm0 = [xmm0[0] - xmm5[0], xmm0[1]];
    // 0x86043 retq : return xmm0 lane 0
    return xmm0[0];
  }

  invert(_from: PCMatrix44Tmpl_double, _det: number): void {
    throw new Error("PCMatrix44Tmpl<double>::invert(other, det) @ProCore 0x0003150e not yet transcribed");
  }

  leftShear(_sxy: number, _syx: number): void {
    throw new Error("PCMatrix44Tmpl<double>::leftShear(sxy, syx) @ProCore 0x0004f6c2 not yet transcribed (angle-wrap + libm tan)");
  }

  rightShear(_sxy: number, _syx: number): void {
    throw new Error("PCMatrix44Tmpl<double>::rightShear(sxy, syx) @ProCore 0x0004f85e not yet transcribed (angle-wrap + libm tan)");
  }

  leftRotate(_angle: number, _axis: PCMatrix44Axis): void {
    throw new Error("PCMatrix44Tmpl<double>::leftRotate(angle, axis) @ProCore 0x0004fa14 not yet transcribed (__sincos_stret + near-axis clamp)");
  }

  rightRotate(_angle: number, _axis: PCMatrix44Axis): void {
    throw new Error("PCMatrix44Tmpl<double>::rightRotate(angle, axis) @ProCore 0x0004fc90 not yet transcribed (__sincos_stret + near-axis clamp)");
  }

  jacobianPost(_v: PCVector4Double): void {
    throw new Error("PCMatrix44Tmpl<double>::jacobianPost(v4) @ProCore 0x0001ad8a not yet transcribed");
  }

  getTransformation(_out: unknown, _quat?: unknown): void {
    // Two overloads share a name: 0x00030cbe (with PCQuat out) and
    // 0x000501d4 (without).  Both are unported.
    throw new Error("PCMatrix44Tmpl<double>::getTransformation @ProCore 0x00030cbe / 0x000501d4 not yet transcribed");
  }

  getPartialTransformation(_params: unknown, _remainder: PCMatrix44Tmpl_double): void {
    throw new Error("PCMatrix44Tmpl<double>::getPartialTransformation(params, remainder) @ProCore 0x00050e84 not yet transcribed");
  }

  planarInverseZ(_other: PCMatrix44Tmpl_double, _z: number): void {
    throw new Error("PCMatrix44Tmpl<double>::planarInverseZ(other, z) @ProCore 0x00050a92 not yet transcribed");
  }

  transformRect(_inRect: unknown, _outRect: unknown): boolean {
    throw new Error("PCMatrix44Tmpl<double>::transformRect<double>(inRect, outRect) @ProCore 0x00050c5a not yet transcribed (needs PCRect::operator|= @ProCore 0x0002c78c ported first)");
  }
}
