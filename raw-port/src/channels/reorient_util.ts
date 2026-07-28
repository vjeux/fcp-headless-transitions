// reorient_util.ts — FCP Helium namespace `reorient_util`.
// Transcribed from the x86_64 disassembly of Helium in
//   /Applications/Final Cut Pro.app/Contents/Frameworks/Helium.framework/
//   Versions/A/Helium
// (see raw-port/re/disasm/Helium.reorient_util.matrix_rotation.s).
//
// PROVENANCE / DECODE:
//   Symbols found in Helium (from nm | c++filt):
//     0x38e0 t reorient_util::matrix_rotation(float, float, float, float)
//   (Signature per demangled name: takes angle + 3-vector axis. ABI: rdi = return-pointer to a
//    4x4 float matrix, xmm0 = angle, xmm1 = axis.x, xmm2 = axis.y, xmm3 = axis.z.)
//
// External stubs called:
//   0x3c502a  ___sincosf_stret        (libm; returns {sin, cos} in xmm0 as packed floats)
//
// RIP-relative single-precision constants (resolve.py Helium const <addr>):
//   effective addr 0x3c7cc0  (RIP+0x3c4356 @0x396a)  u32=0x3f800000  = 1.0f
//   effective addr 0x3c7cc8  (RIP+0x3c43ae @0x391a)  u32=0x3f000000  = 0.5f
//   effective addr 0x3c7cd0  (RIP+0x3c438d @0x3943)  u32=0x3fc00000  = 1.5f
//   effective addr 0x3c9fc0  (RIP+0x3c669e @0x3922)  u32=0x7f800000  = +Inf
//   effective addr 0x3c9fd0  (RIP+0x3c66a0 @0x3930)  u32=0xff800000  = -Inf (used by blendvps)
//   effective addr 0x3c9fe0  (RIP+0x3c65b9 @0x3a27)  16 bytes of 0x00 = four floats of 0.0f
//                                                     (written to the last matrix row 0x30(%rbx))
//
// Return matrix layout (recovered from the stores at rbx+0x00, +0x10, +0x20, +0x30):
//   4x4 packed-float matrix, ROW-major storage of 4 floats per 16-byte row.
//   Row 3 is always [0,0,0,0] (the RIP-loaded zero vector at 0x3a20/0x3a27).
//   The 4th column of the first three rows is written to 0 by the `zero` bits of the
//   `insertps $0x28, xxx, xmm6` ops (dst[3] = 0). So the "usable" content is a 3x3
//   rotation embedded in the upper-left of a 4x4 with a zero 4th column and zero 4th row.
//
// Algorithm (recognizable but transcribed line-for-line, NOT paraphrased):
//   The function computes an axis-angle rotation with an SSE-refined reciprocal square-root
//   normalization of the axis, then a Rodrigues-like expansion. The exact sign pattern of the
//   ± sin·axis terms in the off-diagonals reflects FCP's own convention and is preserved
//   bit-identically by mirroring each insertps/subss/addss below.
//
//   1. Pack axis into xmm1 = [x, y, z, ?].
//   2. sq = axis * axis; L2 = sq.x + sq.y + sq.z (horizontal sum via movshdup/movhlps/addps).
//   3. r = rsqrtss(L2)     ; single SSE instruction — 11-bit-accurate 1/sqrt(L2) estimate
//      mask = (+Inf <= r)  ; true iff r saturated to +Inf (i.e. L2 was 0 or a denormal that
//                            rounded to 0 through the 0.5·L2 multiply).
//      halfL2 = blendvps( 0.5·L2 , -Inf , mask )   ; if r saturated, force -Inf into the NR term
//      invNorm = r · (1.5 - halfL2·r·r)            ; classic one-step Newton-Raphson refinement
//                                                    of 1/sqrt(L2); on the saturation path this
//                                                    becomes r·(1.5 + Inf) = +Inf, i.e. the axis
//                                                    normalization "safely" explodes rather than
//                                                    producing a subnormal result.
//   4. n = axis · invNorm  (packed splat + mulps); n stored at rbp-0x20 as {nx, ny, nz, ?}.
//   5. Call ___sincosf_stret(angle) -> xmm0 = {sin(a), cos(a), ?, ?}; unpack cos via movshdup.
//   6. C = 1 - cos.
//   7. Row 0 = [ cos + C·nx²,  s·nz + C·nx·ny,  C·nx·nz - s·ny,  0 ]
//      Row 1 = [ (s·nz shuf, then subtracted from s of that lane) + C·nx·ny lane,
//                cos + C·ny²,
//                s·nx + C·ny·nz,  0 ]
//      Row 2 = [ C·nx·nz + s·ny,  C·ny·nz - s·nx,  cos + C·nz²,  0 ]
//      Row 3 = [ 0, 0, 0, 0 ]
//      (See the per-line comments in the ported body for the exact insertps/addss/subss
//       provenance of every off-diagonal.)
//
// -----------------------------------------------------------------------------
// External stub — ___sincosf_stret. Called via the Helium __stubs entry @0x3c502a
// from reorient_util::matrix_rotation @0x3959. Not yet transcribed. Returns
// {sin(a), cos(a)} as the low two single-precision lanes of xmm0.
// -----------------------------------------------------------------------------
function sincosf_stret_stub(_a: number): { sin: number; cos: number } {
  throw new Error(
    "___sincosf_stret @Helium stub 0x3c502a not yet transcribed " +
      "(libm intrinsic returning packed sin/cos as xmm0 low32/high32)",
  );
}

/**
 * A 4x4 single-precision matrix in the same row-major, 16-bytes-per-row layout the FCP
 * binary uses at rdi (@0x39df stores row0, @0x3a03 stores row1, @0x3a1c stores row2,
 * @0x3a27 stores the all-zero row3).
 */
export interface Mat4f {
  /** row 0 — stored at rbx+0x00 by `movaps %xmm6, (%rbx)` @0x39df. */
  r0: [number, number, number, number];
  /** row 1 — stored at rbx+0x10 by `movaps %xmm6, 0x10(%rbx)` @0x3a03. */
  r1: [number, number, number, number];
  /** row 2 — stored at rbx+0x20 by `movaps %xmm5, 0x20(%rbx)` @0x3a1c. */
  r2: [number, number, number, number];
  /** row 3 — stored at rbx+0x30 by `movaps %xmm0, 0x30(%rbx)` @0x3a27, loaded from
   *  the RIP-relative all-zero 16-byte constant @0x3c9fe0. */
  r3: [number, number, number, number];
}

/**
 * `rsqrtss` — SSE single-precision reciprocal-square-root estimator (11-bit accurate on
 * the low lane; produces +Inf for input 0.0f). Not implementable bit-exactly in portable
 * TS; hardware-model wrapper that returns 1/sqrt(x) from JS Math.sqrt. The subsequent
 * Newton-Raphson step in the FCP body @0x3937..0x3947 is what upgrades the result to
 * full float precision; when the oracle harness lands for reorient_util, this wrapper
 * is the place to install a bit-exact rsqrtss port.
 *
 * @Helium 0x390e  `rsqrtss %xmm2, %xmm3`  — the single rsqrtss instruction transcribed here.
 */
function rsqrtss_approx(x: number): number {
  // The hardware rsqrtss returns +Inf for x==0 (and for negative-flush inputs). The NR pass
  // in the caller relies on that saturation to trip the `+Inf <= r` cmpless mask.
  if (x === 0) return Number.POSITIVE_INFINITY;
  return Math.fround(1.0 / Math.fround(Math.sqrt(Math.fround(x))));
}

/**
 * `reorient_util::matrix_rotation(float angle, float x, float y, float z)` @Helium 0x38e0.
 *
 * Writes a 4x4 rotation matrix (float) representing rotation by `angle` radians about the
 * axis (x, y, z). The axis is normalized inside the function with an SSE rsqrtss+NR pass.
 *
 * Transcribed line-for-line from the 82-line disassembly. Each block below cites the
 * asm addresses it mirrors. The order of adds/subs matches the binary so a bit-exact
 * parity harness can compare TS floats against Helium's own output on random inputs.
 *
 * @param angle rotation angle in radians (xmm0)
 * @param x     axis x component  (xmm1)
 * @param y     axis y component  (xmm2)
 * @param z     axis z component  (xmm3)
 * @returns     a 4x4 float matrix (row-major); row3 is [0,0,0,0]; the 4th column of the
 *              first three rows is 0.
 */
export function reorient_util_matrix_rotation(
  angle: number,
  x: number,
  y: number,
  z: number,
): Mat4f {
  // --- Normalize the axis ---------------------------------------------------
  // 0x38e9 movaps %xmm0, %xmm4                    ; save `angle` in xmm4 across call
  // 0x38ec insertps $0x10, %xmm2, %xmm1           ; xmm1 = [x, y, 0/x[2], 0/x[3]]
  // 0x38f2 insertps $0x20, %xmm3, %xmm1           ; xmm1 = [x, y, z, x[3]]
  //   The two insertps ops with imm[7:6]=00 (src=0) and dst=1, dst=2 and no ZMASK bits set
  //   simply pack (y,z) into slots 1 and 2 without zeroing others. We model the axis vector
  //   as an explicit tuple.
  const nx0 = Math.fround(x);
  const ny0 = Math.fround(y);
  const nz0 = Math.fround(z);

  // 0x38fb mulps %xmm1, %xmm2    ; xmm2 = axis*axis (packed)
  const sqx = Math.fround(nx0 * nx0);
  const sqy = Math.fround(ny0 * ny0);
  const sqz = Math.fround(nz0 * nz0);

  // 0x38fe movshdup %xmm2, %xmm0   ; xmm0 = [sq[1], sq[1], sq[3], sq[3]]
  // 0x3902 addps    %xmm2, %xmm0   ; xmm0.low = sq[0] + sq[1] = sqx + sqy
  // 0x3905 movhlps  %xmm2, %xmm2   ; xmm2.low = sq[2] = sqz
  // 0x3908 addps    %xmm0, %xmm2   ; xmm2.low = (sqx+sqy) + sqz = L2
  const L2 = Math.fround(Math.fround(sqx + sqy) + sqz);

  // 0x390b movaps %xmm2, %xmm3
  // 0x390e rsqrtss %xmm2, %xmm3    ; xmm3.low = rsqrt approx of L2
  const r = rsqrtss_approx(L2);

  // 0x3912 mulss   [0.5f], %xmm2   ; xmm2.low = 0.5 * L2
  // 0x391a movss   [+Inf], %xmm0   ; xmm0.low = +Inf
  // 0x3922 cmpless %xmm3, %xmm0    ; xmm0.low = (+Inf <= r) ? all-ones : 0
  // 0x3927 blendvps %xmm0, [-Inf(dqword)], %xmm2
  //                                ; xmm2.low = mask ? (-Inf) : 0.5*L2
  //   The cmpless mask is only set when r saturated to +Inf (i.e. L2 was zero-through-rsqrtss).
  //   On the saturation path, the NR polynomial below evaluates to r*(1.5 + Inf) = +Inf, so
  //   invNorm becomes +Inf; that intentional overflow matches the binary's own behavior.
  const halfL2 = Math.fround(0.5 * L2);
  const maskInfSat = r === Number.POSITIVE_INFINITY;
  const nrHalfL2 = maskInfSat ? Number.NEGATIVE_INFINITY : halfL2;

  // 0x3933 mulss %xmm3, %xmm2      ; xmm2.low = halfL2 * r
  // 0x3937 mulss %xmm3, %xmm2      ; xmm2.low = halfL2 * r * r
  // 0x393b movss [1.5f], %xmm0
  // 0x3943 subss %xmm2, %xmm0      ; xmm0.low = 1.5 - halfL2*r*r
  // 0x3947 mulss %xmm3, %xmm0      ; xmm0.low = r * (1.5 - halfL2*r*r)  = refined invNorm
  const invNorm = Math.fround(
    Math.fround(r) *
      Math.fround(1.5 - Math.fround(Math.fround(Math.fround(nrHalfL2 * r)) * r)),
  );

  // 0x394b shufps $0, %xmm0, %xmm0        ; broadcast invNorm to all 4 lanes
  // 0x394f mulps  %xmm1, %xmm0            ; xmm0 = axis * invNorm  = normalized axis
  // 0x3952 movaps %xmm0, -0x20(%rbp)      ; store {nx, ny, nz, ?} on stack
  const nx = Math.fround(nx0 * invNorm);
  const ny = Math.fround(ny0 * invNorm);
  const nz = Math.fround(nz0 * invNorm);
  // (The 4th lane -0x20(%rbp)[3] is `x[3]*invNorm`; x[3] came from the untouched high dword of
  //  the caller's xmm1 which by SysV ABI is unspecified. The subsequent code only reads
  //  lanes [0..2] of this stash, so its exact value is not observable in the output matrix.)

  // --- sin/cos of angle -----------------------------------------------------
  // 0x3956 movaps %xmm4, %xmm0
  // 0x3959 callq  0x3c502a                ; ___sincosf_stret(angle)
  //   Returns xmm0 = {sin(a), cos(a), ?, ?} per Apple ABI.
  const sc = sincosf_stret_stub(Math.fround(angle));
  const sinA = Math.fround(sc.sin);
  const cosA = Math.fround(sc.cos);

  // 0x395e movshdup %xmm0, %xmm6          ; xmm6.low = cos (= xmm0[1])
  // 0x3962 movss    [1.0f], %xmm1
  // 0x396a subss    %xmm6, %xmm1          ; xmm1.low = 1 - cos = C
  // 0x396e movaps   %xmm1, %xmm2          ; xmm2 = C (in low)
  // 0x3971 movaps   -0x20(%rbp), %xmm10   ; xmm10 = {nx, ny, nz, ?}
  // 0x3976 mulss    %xmm10, %xmm2         ; xmm2.low = C * nx
  const C = Math.fround(1.0 - cosA);
  const C_nx = Math.fround(C * nx);

  // 0x397b movshdup %xmm10, %xmm4         ; xmm4.low = ny
  // 0x3980 movaps   %xmm10, %xmm3
  // 0x3984 unpckhpd %xmm10, %xmm3         ; xmm3.low = high-half of xmm10 as double,
  //                                         which as float32 is nz (the third lane).
  // 0x3989 movsldup %xmm2, %xmm7          ; xmm7 = [C·nx, C·nx, ?, ?]
  // 0x398d mulps    %xmm10, %xmm7         ; xmm7 = [C·nx·nx, C·nx·ny, C·nx·nz, ...]
  const xmm4_ny = ny; // xmm4.low is ny (from movshdup slot [1])
  const xmm3_nz = nz; // xmm3.low is nz (from unpckhpd high-double low32)
  const xmm7_0 = Math.fround(C_nx * nx); // = C·nx²
  const xmm7_1 = Math.fround(C_nx * ny); // = C·nx·ny
  const xmm7_2 = Math.fround(C_nx * nz); // = C·nx·nz

  // 0x3991 movaps %xmm0, %xmm5            ; xmm5 = {sin, cos, ...}; xmm5.low = sin = s
  // 0x3994 mulss  %xmm0, %xmm10           ; xmm10.low = xmm10.low * sin = nx * sin
  //                                         (destructively — xmm10.low is now s·nx)
  // 0x3999 movaps %xmm0, %xmm8            ; xmm8 = {sin, cos, ...}
  // 0x399d mulss  %xmm3, %xmm8            ; xmm8.low = sin * nz = s·nz
  // 0x39a2 mulss  %xmm4, %xmm5            ; xmm5.low = sin * ny = s·ny
  const s = sinA;
  const s_nx = Math.fround(nx * s);
  const s_ny = Math.fround(s * xmm4_ny);
  const s_nz = Math.fround(s * xmm3_nz);

  // 0x39a6 movaps %xmm1, %xmm0            ; xmm0 = C (from xmm1 low)
  // 0x39a9 mulss  %xmm4, %xmm0            ; xmm0.low = C * ny  = C_ny
  // 0x39ad mulss  %xmm0, %xmm4            ; xmm4.low = ny * (C·ny) = C·ny²
  // 0x39b1 addss  %xmm6, %xmm4            ; xmm4.low = C·ny² + cos = m_yy diagonal
  const C_ny = Math.fround(C * xmm4_ny);
  const diag_yy = Math.fround(Math.fround(xmm4_ny * C_ny) + cosA);

  // 0x39b5 mulss %xmm3, %xmm1             ; xmm1.low = C * nz = C_nz
  // 0x39b9 mulss %xmm3, %xmm1             ; xmm1.low = C·nz * nz = C·nz²
  // 0x39bd addss %xmm6, %xmm1             ; xmm1.low = C·nz² + cos = m_zz diagonal
  const C_nz = Math.fround(C * xmm3_nz);
  const diag_zz = Math.fround(Math.fround(xmm3_nz * C_nz) + cosA);

  // --- Row 0 assemble and store ---------------------------------------------
  // 0x39c1 insertps $0x1c, %xmm8, %xmm6   ; xmm6 = [xmm6[0]=cos, xmm8[0]=s·nz, 0, 0]
  // 0x39c8 addps    %xmm7, %xmm6          ; xmm6 = [cos+C·nx², s·nz+C·nx·ny, C·nx·nz, ?]
  //                                         (the ? lane is xmm7[3]+0 which is unspecified,
  //                                          but it's overwritten to 0 by the next insertps.)
  // 0x39cb mulss    %xmm3, %xmm2          ; xmm2.low = C·nx * nz = C·nx·nz
  // 0x39cf movaps   %xmm2, %xmm9
  // 0x39d3 subss    %xmm5, %xmm9          ; xmm9.low = C·nx·nz - s·ny
  // 0x39d8 insertps $0x28, %xmm9, %xmm6   ; xmm6 = [xmm6[0], xmm6[1], xmm9[0], 0]
  //                                         imm 0x28 = src=0, dst=2, ZMASK=1000 -> dst[3]=0.
  // 0x39df movaps   %xmm6, (%rbx)         ; row 0 store
  const row0_0 = Math.fround(cosA + xmm7_0);            // cos + C·nx²
  const row0_1 = Math.fround(s_nz + xmm7_1);            // s·nz + C·nx·ny
  const C_nx_nz = Math.fround(C_nx * xmm3_nz);
  const row0_2 = Math.fround(C_nx_nz - s_ny);           // C·nx·nz - s·ny
  const row0_3 = 0;                                     // zero'd by insertps ZMASK
  const r0: [number, number, number, number] = [row0_0, row0_1, row0_2, row0_3];

  // --- Row 1 assemble and store ---------------------------------------------
  // 0x39e2 movshdup %xmm7, %xmm6          ; xmm6.low = xmm7[1] = C·nx·ny
  // 0x39e6 subss    %xmm8, %xmm6          ; xmm6.low = C·nx·ny - s·nz
  // 0x39eb insertps $0x1c, %xmm4, %xmm6   ; xmm6 = [xmm6[0]=C·nx·ny - s·nz,
  //                                                 xmm4[0]=diag_yy,
  //                                                 0, 0]
  // 0x39f1 mulss    %xmm3, %xmm0          ; xmm0.low = C_ny * nz = C·ny·nz
  // 0x39f5 movaps   %xmm10, %xmm3         ; xmm3 = {s·nx, ...} (xmm10.low was s·nx)
  // 0x39f9 addss    %xmm0, %xmm3          ; xmm3.low = s·nx + C·ny·nz
  // 0x39fd insertps $0x28, %xmm3, %xmm6   ; xmm6 = [xmm6[0,1], xmm3[0], 0]
  //                                         = [C·nx·ny - s·nz, diag_yy, s·nx + C·ny·nz, 0]
  // 0x3a03 movaps   %xmm6, 0x10(%rbx)     ; row 1 store
  const row1_0 = Math.fround(xmm7_1 - s_nz);            // C·nx·ny - s·nz
  const row1_1 = diag_yy;                                // C·ny² + cos
  const C_ny_nz = Math.fround(C_ny * xmm3_nz);
  const row1_2 = Math.fround(s_nx + C_ny_nz);           // s·nx + C·ny·nz
  const row1_3 = 0;
  const r1: [number, number, number, number] = [row1_0, row1_1, row1_2, row1_3];

  // --- Row 2 assemble and store ---------------------------------------------
  // 0x3a07 addss    %xmm2, %xmm5          ; xmm5.low = s·ny + C·nx·nz
  //                                         (xmm2.low was still C·nx·nz from @0x39cb)
  // 0x3a0b subss    %xmm10, %xmm0         ; xmm0.low = C·ny·nz - s·nx
  //                                         (xmm10.low was s·nx from @0x3994)
  // 0x3a10 insertps $0x1c, %xmm0, %xmm5   ; xmm5 = [xmm5[0]=s·ny + C·nx·nz,
  //                                                 xmm0[0]=C·ny·nz - s·nx,
  //                                                 0, 0]
  // 0x3a16 insertps $0x28, %xmm1, %xmm5   ; xmm5 = [xmm5[0,1], xmm1[0]=diag_zz, 0]
  // 0x3a1c movaps   %xmm5, 0x20(%rbx)     ; row 2 store
  const row2_0 = Math.fround(s_ny + C_nx_nz);           // s·ny + C·nx·nz
  const row2_1 = Math.fround(C_ny_nz - s_nx);           // C·ny·nz - s·nx
  const row2_2 = diag_zz;                                // C·nz² + cos
  const row2_3 = 0;
  const r2: [number, number, number, number] = [row2_0, row2_1, row2_2, row2_3];

  // --- Row 3: all zero (RIP-loaded 16-byte constant @0x3c9fe0) --------------
  // 0x3a20 movaps 0x3c65b9(%rip), %xmm0    ; xmm0 = [0,0,0,0]
  // 0x3a27 movaps %xmm0, 0x30(%rbx)        ; row 3 store
  const r3: [number, number, number, number] = [0, 0, 0, 0];

  // 0x3a2b movq %rbx, %rax                ; retval = rdi (matrix pointer)
  return { r0, r1, r2, r3 };
}
