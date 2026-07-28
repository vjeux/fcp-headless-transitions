// project_util.ts — FCP namespace `project_util` from the Helium framework
// (/Applications/Final Cut Pro.app/Contents/Frameworks/Helium.framework/Versions/A/Helium).
// A small SIMD helper namespace used by the icosphere-generating projection nodes: builds
// `simd_float3`/`simd_float4`/`simd_float4x4` values, prints matrices, computes GL-style
// perspective and frustum matrices, computes an axis-angle rotation matrix, and — the two
// large routines — fills a flat float array from a triangle mesh and generates an
// icosphere mesh by recursive subdivision.
//
// Decode files (all in raw-port/re/disasm/):
//   Helium.project_util.make_vector_float4.s      (9 lines)
//   Helium.project_util.make_vector_float3.s      (8 lines)
//   Helium.project_util.print_matrix_float4x4.s   (80 lines)
//   Helium.project_util.perspective.s             (47 lines)
//   Helium.project_util.frustum.s                 (42 lines)
//   Helium.project_util.matrix_rotation.s         (82 lines)
//   Helium.project_util.fill_flat_array.s         (242 lines — not yet transcribed)
//   Helium.project_util.generateIcosphere.s       (1872 lines — not yet transcribed)
//
// Numeric layout conventions:
//   simd_float3  — three floats packed into an xmm register (lanes 0..2), lane 3 undefined.
//   simd_float4  — four floats packed into an xmm register (lanes 0..3).
//   simd_float4x4 — four consecutive `simd_float4` COLUMNS at struct offsets +0x00, +0x10,
//                   +0x20, +0x30.  This is Apple's column-major convention: writes
//                   `movaps col0, (rbx)` … `movaps col3, 0x30(rbx)`.
//
// RIP-relative constants referenced across these methods (all resolved via
// `raw-port/army/tools/resolve.py Helium const 0x...`):
//   0x85d3a0 : double 0.017453292519943295 = pi/180 (perspective degrees->radians factor)
//   0x3cc1c0 : double 0.5                            (perspective half-fovy factor)
//   0x3ca260 : double 1.0                            (perspective 1/tan numerator)
//   0x85dad0 : simd_float4 {0.0f, 0.0f, 0.0f, -1.0f} (perspective col2 base;
//                                                    also frustum blendps mem operand)
//   0x3ca0d0 : simd_float4 sign-mask u64x2 hi=0, lo=0x8000000080000000 — frustum's
//              xorps mask that negates the low 2 float lanes.
//   0x3c7cc8 : float32 0.5f (u32 0x3f000000)         (matrix_rotation Newton 0.5*x factor)
//   0x3c9fc0 : float32 +INF (u32 0x7f800000)         (matrix_rotation zero-norm guard)
//   0x3c9fd0 : simd_float4 {-INF, -INF, -INF, -INF}  (matrix_rotation blendvps replacement)
//   0x3c7cd0 : float32 1.5f (u32 0x3fc00000)         (matrix_rotation Newton constant)
//   0x3c7cc0 : float32 1.0f (u32 0x3f800000)         (matrix_rotation "1 - cos theta")
//   0x3c9fe0 : simd_float4 {0.0f, 0.0f, 0.0f, 1.0f}  (matrix_rotation row/col3 constant).

const F = Math.fround;

// -------- struct types --------

/** simd_float3 — three floats packed into a 4-lane vector.  Lane 3 is unspecified
 *  (the make_vector_float3 disasm never writes it). */
export interface simd_float3 { x: number; y: number; z: number; }

/** simd_float4 — four floats packed into a 4-lane vector. */
export interface simd_float4 { x: number; y: number; z: number; w: number; }

/** simd_float4x4 — four float4 COLUMNS.  Element (row r, col c) = columns[c][r]. */
export interface simd_float4x4 {
  columns: [simd_float4, simd_float4, simd_float4, simd_float4];
}

// -------- functions --------

/**
 * project_util::make_vector_float4(float x, float y, float z, float w) -> simd_float4
 * @Helium 0x00000000001bcba0  (__ZN12project_util18make_vector_float4Effff)
 *
 * DECODE (raw-port/re/disasm/Helium.project_util.make_vector_float4.s):
 *   0x1bcba4  insertps $0x10, %xmm1, %xmm0   ## xmm0 = {x, y, ?, ?}
 *   0x1bcbaa  insertps $0x20, %xmm2, %xmm0   ## xmm0 = {x, y, z, ?}
 *   0x1bcbb0  insertps $0x30, %xmm3, %xmm0   ## xmm0 = {x, y, z, w}
 *   0x1bcbb6  ret                            ## returns xmm0 = {x, y, z, w}
 *
 * Net effect: pack the four scalar `float` arguments into a single xmm register in
 * lane order 0,1,2,3.  We mirror this with each field Math.fround-ed to single precision.
 */
export function make_vector_float4(x: number, y: number, z: number, w: number): simd_float4 {
  return { x: F(x), y: F(y), z: F(z), w: F(w) };
}

/**
 * project_util::make_vector_float3(float x, float y, float z) -> simd_float3
 * @Helium 0x00000000001bcbc0  (__ZN12project_util18make_vector_float3Efff)
 *
 * DECODE (raw-port/re/disasm/Helium.project_util.make_vector_float3.s):
 *   0x1bcbc4  insertps $0x10, %xmm1, %xmm0   ## xmm0 = {x, y, ?, ?}
 *   0x1bcbca  insertps $0x20, %xmm2, %xmm0   ## xmm0 = {x, y, z, ?}
 *   0x1bcbd0  ret                            ## returns xmm0 = {x, y, z, undef}
 */
export function make_vector_float3(x: number, y: number, z: number): simd_float3 {
  return { x: F(x), y: F(y), z: F(z) };
}

/**
 * project_util::print_matrix_float4x4(simd_float4x4) -> void
 * @Helium 0x00000000001bcbe0  (__ZN12project_util21print_matrix_float4x4E13simd_float4x4)
 *
 * DECODE (raw-port/re/disasm/Helium.project_util.print_matrix_float4x4.s):
 *   Reads the four column xmm registers from the caller's stack (columns are passed by
 *   value on the stack at 0x10(%rbp), 0x20(%rbp), 0x30(%rbp), 0x40(%rbp) — the standard
 *   simd_float4x4-by-value ABI).  Each column's four floats are cvtss2sd-widened to
 *   double and passed to `fprintf(stderr, "%g %g %g %g\n", ...)` — one fprintf per
 *   ROW of the matrix (four total).  The format string is literal-pool "%g %g %g %g\n"
 *   at 0x1bcc4d's rip+0x737f54.
 *
 * Net effect: dumps the 4x4 matrix in ROW-major order to stderr for debugging.
 */
export function print_matrix_float4x4(m: simd_float4x4): void {
  const c = m.columns;
  for (let r = 0; r < 4; r++) {
    const row = [c[0], c[1], c[2], c[3]].map(col => [col.x, col.y, col.z, col.w][r]);
    // eslint-disable-next-line no-console
    console.error(`${row[0]} ${row[1]} ${row[2]} ${row[3]}`);
  }
}

/**
 * project_util::perspective(double fovyDeg, double aspect, double nearZ, double farZ)
 *                                                                       -> simd_float4x4
 * @Helium 0x00000000001bcd20  (__ZN12project_util11perspectiveEdddd)
 *
 * Classical GL right-handed perspective projection.  All fov/aspect/near/far arithmetic
 * happens in DOUBLE precision (movsd/mulsd/divsd/addsd/subsd + libm `_tan`); each stored
 * matrix lane is narrowed to float via cvtsd2ss just before the store.
 *
 * DECODE (raw-port/re/disasm/Helium.project_util.perspective.s):
 *   0x1bcd3b  mulsd  [0x85d3a0], xmm0        ## fovyDeg *= pi/180                     (double)
 *   0x1bcd43  mulsd  [0x3cc1c0], xmm0        ## *= 0.5                                (double)
 *   0x1bcd4b  callq  _tan                    ## xmm0 = tan(halfFov)                   (double)
 *   0x1bcd50  movsd  [0x3ca260], xmm1        ## xmm1 = 1.0                            (double)
 *   0x1bcd58  divsd  xmm0, xmm1              ## xmm1 = 1.0 / tan = f (cot)            (double)
 *   0x1bcd5f  cvtsd2ss xmm1 -> xmm0          ## xmm0 = float(f)
 *   0x1bcd63  divsd  -0x10(rbp), xmm1        ## xmm1 = f/aspect                        (double)
 *   0x1bcd68  cvtsd2ss xmm1 -> xmm1          ## xmm1 = float(f/aspect)
 *   0x1bcd6f  blendps $0x1, xmm1, xmm2       ## xmm2 = {f/aspect, 0, 0, 0}
 *   0x1bcd75  movaps xmm2, (rbx)             ## col0 = {f/aspect, 0, 0, 0}
 *   0x1bcd78  insertps $0x1d, xmm0, xmm0     ## xmm0 = {0, f, 0, 0}
 *   0x1bcda0  movaps xmm0, 0x10(rbx)         ## col1 = {0, f, 0, 0}
 *   -- col2 --
 *   0x1bcd7e  movsd  -0x18(rbp), xmm4        ## xmm4 = nearZ (double)
 *   0x1bcd87  movsd  -0x20(rbp), xmm3        ## xmm3 = farZ  (double)
 *   0x1bcd8c  addsd xmm3 -> xmm1(=xmm4+xmm3) ## xmm1 = near + far
 *   0x1bcd94  subsd xmm3 -> xmm2(=xmm4-xmm3) ## xmm2 = near - far
 *   0x1bcd98  divsd  xmm2, xmm1              ## xmm1 = (near+far)/(near-far)          (double)
 *   0x1bcd9c  cvtsd2ss xmm1 -> xmm1          ## float
 *   0x1bcda4  movaps [0x85dad0], xmm0        ## xmm0 = {0, 0, 0, -1}                  (16B)
 *   0x1bcdab  insertps $0x20, xmm1, xmm0     ## xmm0 = {0, 0, (n+f)/(n-f), -1}
 *   0x1bcdc4  movaps xmm0, 0x20(rbx)         ## col2 = {0, 0, (n+f)/(n-f), -1}
 *   -- col3 --
 *   0x1bcdb1  addsd  xmm3, xmm3              ## xmm3 = 2*far     (double)
 *   0x1bcdb5  mulsd  xmm4, xmm3              ## xmm3 = 2*far*near
 *   0x1bcdb9  divsd  xmm2, xmm3              ## xmm3 = 2*near*far / (near-far)
 *   0x1bcdc0  cvtsd2ss xmm3 -> xmm1          ## float
 *   0x1bcdc8  insertps $0x2b, xmm1, xmm0     ## xmm0 = {0, 0, 2nf/(n-f), 0}
 *   0x1bcdce  movaps xmm0, 0x30(rbx)         ## col3 = {0, 0, 2nf/(n-f), 0}
 */
export function perspective(
  fovyDeg: number, aspect: number, nearZ: number, farZ: number,
): simd_float4x4 {
  // Double-precision arithmetic block (mulsd/divsd/etc.).
  const DEG2RAD = 0.017453292519943295;      // @0x85d3a0
  const HALF    = 0.5;                        // @0x3cc1c0
  const ONE     = 1.0;                        // @0x3ca260
  const halfFovRad = fovyDeg * DEG2RAD * HALF;
  const t = Math.tan(halfFovRad);             // callq _tan (double)
  const f = ONE / t;                          // divsd -> "1/tan" scalar (double)

  // Each stored lane is narrowed to float via cvtsd2ss (mirrored with Math.fround).
  const col0: simd_float4 = { x: F(f / aspect), y: F(0), z: F(0), w: F(0) };
  const col1: simd_float4 = { x: F(0), y: F(f), z: F(0), w: F(0) };

  const denom = nearZ - farZ;                 // subsd
  const c2z   = (nearZ + farZ) / denom;       // (n+f)/(n-f)  (double)
  const col2: simd_float4 = { x: F(0), y: F(0), z: F(c2z), w: F(-1.0) };

  const c3z = (2.0 * nearZ * farZ) / denom;   // 2*n*f / (n-f)  (double)
  const col3: simd_float4 = { x: F(0), y: F(0), z: F(c3z), w: F(0) };

  return { columns: [col0, col1, col2, col3] };
}

/**
 * project_util::frustum(float left, float right, float bottom, float top,
 *                       float nearZ, float farZ) -> simd_float4x4
 * @Helium 0x00000000001bcde0  (__ZN12project_util7frustumEffffff)
 *
 * Classical GL right-handed off-axis frustum projection.  All arithmetic is SINGLE
 * precision (arguments arrive as float in xmm0..xmm5; all opcodes are *ss/*ps).
 *
 * DECODE (raw-port/re/disasm/Helium.project_util.frustum.s):
 *   xmm registers on entry: xmm0=left xmm1=right xmm2=bottom xmm3=top xmm4=near xmm5=far
 *
 *   0x1bcde7  movaps xmm0, xmm6              ## xmm6 = left
 *   0x1bcdea  addss  xmm1, xmm6              ## xmm6 = left+right
 *   0x1bcdee  subss  xmm0, xmm1              ## xmm1 = right-left   (= "rml")
 *   0x1bcdf2  divss  xmm1, xmm6              ## xmm6 = (l+r)/(r-l)  (= A: col2 row0)
 *   0x1bcdf6  movaps xmm2, xmm0              ## xmm0.l0 = bottom
 *   0x1bcdf9  addss  xmm3, xmm0              ## xmm0.l0 = bottom+top
 *   0x1bcdfd  insertps $0x10, xmm5, xmm3     ## xmm3 = {top, far, ?, ?}
 *   0x1bce03  insertps $0x10, xmm4, xmm2     ## xmm2 = {bottom, near, ?, ?}
 *   0x1bce09  subps  xmm2, xmm3              ## xmm3 = {t-b, f-n, ?, ?}
 *                                            ## xmm3.l0 = tmb, xmm3.l1 = fmn
 *   0x1bce0c  movaps xmm4, xmm7              ## xmm7 = near
 *   0x1bce0f  addss  xmm5, xmm7              ## xmm7 = near + far   (= "npf")
 *   0x1bce13  movaps [0x3ca0d0], xmm2        ## xmm2 = 16B sign-flip mask: low 2 lanes = -0.0f
 *                                            ## upper 2 lanes = 0
 *   0x1bce1a  xorps  xmm2, xmm7              ## xmm7.l0 = -(near+far)
 *   0x1bce1d  unpcklps xmm7, xmm0            ## xmm0 = {b+t, -(n+f), ?, ?}
 *   0x1bce20  divps  xmm3, xmm0              ## xmm0.l0 = (b+t)/tmb   (= B: col2 row1)
 *                                            ## xmm0.l1 = -(n+f)/fmn (= C: col2 row2)
 *   0x1bce23  addss  xmm5, xmm5              ## xmm5 = 2*far
 *   0x1bce27  xorps  xmm4, xmm2              ## xmm2.l0 = -near
 *   0x1bce2a  mulss  xmm5, xmm2              ## xmm2.l0 = -2*far*near
 *   0x1bce2e  movshdup xmm3, xmm5            ## xmm5.l0 = xmm3.l1 = fmn
 *   0x1bce32  divss  xmm5, xmm2              ## xmm2.l0 = -2*far*near / fmn
 *                                            ##          = 2*far*near / (near-far)
 *                                            ##          (= D: col3 row2)
 *   0x1bce36  addss  xmm4, xmm4              ## xmm4 = 2*near
 *   0x1bce3a  movaps xmm4, xmm5              ## xmm5 = 2*near
 *   0x1bce3d  divss  xmm1, xmm5              ## xmm5 = 2*near / (r-l) (= E: col0 row0)
 *   0x1bce41  divss  xmm3, xmm4              ## xmm4 = 2*near / (t-b) (= Fc: col1 row1)
 *   0x1bce48  blendps $0x1, xmm5, xmm1       ## xmm1 = {E, 0, 0, 0}
 *   0x1bce4e  movaps xmm1, (rdi)             ## col0 = {2n/rml, 0, 0, 0}
 *   0x1bce51  insertps $0x1d, xmm4, xmm1     ## xmm1 = {0, Fc, 0, 0}
 *   0x1bce57  movaps xmm1, 0x10(rdi)         ## col1 = {0, 2n/tmb, 0, 0}
 *   0x1bce5b  blendps $0xc, [0x85dad0], xmm6 ## xmm6 = {A, ?, 0, -1}  (lanes 2,3 from
 *                                            ##  const {0,0,0,-1} @0x85dad0)
 *   0x1bce65  shufps $0x4c, xmm0, xmm6       ## $0x4c = 01 00 11 00 -> {A, -1, B, C}
 *   0x1bce69  shufps $0x78, xmm6, xmm6       ## $0x78 = 01 11 10 00 -> {A, B, C, -1}
 *   0x1bce6d  movaps xmm6, 0x20(rdi)         ## col2 = {A, B, C, -1}
 *   0x1bce71  insertps $0x2b, xmm2, xmm0     ## xmm0 = {0, 0, D, 0}
 *   0x1bce77  movaps xmm0, 0x30(rdi)         ## col3 = {0, 0, D, 0}
 *
 * Result (columns):
 *   col0 = (2n/(r-l), 0,        0,              0)
 *   col1 = (0,        2n/(t-b), 0,              0)
 *   col2 = ((r+l)/(r-l), (t+b)/(t-b), -(f+n)/(f-n), -1)
 *   col3 = (0,        0,        2fn/(n-f),       0)
 */
export function frustum(
  left: number, right: number, bottom: number, top: number,
  nearZ: number, farZ: number,
): simd_float4x4 {
  const l = F(left), r = F(right), b = F(bottom), t = F(top), n = F(nearZ), fz = F(farZ);
  // All operations single-precision (mirror *ss/*ps opcodes).
  const rml = F(r - l);   // 0x1bcdee subss
  const tmb = F(t - b);   // 0x1bce09 subps low lane
  const fmn = F(fz - n);  // 0x1bce09 subps high lane

  const A  = F(F(l + r) / rml);                       // xmm6 pipeline @0x1bcdea..0x1bcdf2
  const B  = F(F(b + t) / tmb);                       // xmm0.l0 pipeline @0x1bcdf9..0x1bce20
  const C  = F(F(-F(n + fz)) / fmn);                  // xmm0.l1 pipeline @0x1bce0f..0x1bce20
  const D  = F(F(-F(F(2) * F(fz * n))) / fmn);        // xmm2 pipeline @0x1bce23..0x1bce32
  const E  = F(F(F(2) * n) / rml);                    // xmm5 pipeline @0x1bce36..0x1bce3d
  const Fc = F(F(F(2) * n) / tmb);                    // xmm4 pipeline @0x1bce36..0x1bce41

  return {
    columns: [
      { x: E,    y: F(0), z: F(0), w: F(0)  },
      { x: F(0), y: Fc,   z: F(0), w: F(0)  },
      { x: A,    y: B,    z: C,    w: F(-1) },
      { x: F(0), y: F(0), z: D,    w: F(0)  },
    ],
  };
}

/**
 * project_util::matrix_rotation(float angleRad, float axisX, float axisY, float axisZ)
 *                                                                     -> simd_float4x4
 * @Helium 0x00000000001bce80  (__ZN12project_util15matrix_rotationEffff)
 *
 * Axis-angle rotation matrix via Rodrigues' formula, with the axis normalised via one
 * iteration of Newton-Raphson refinement of `rsqrtss` (the standard SIMD fast-inverse-
 * sqrt refinement).
 *
 * DECODE (raw-port/re/disasm/Helium.project_util.matrix_rotation.s):
 *   -- Pack the axis into xmm1 = {ax, ay, az, ?} --
 *   0x1bce8c  insertps $0x10, xmm2, xmm1     ## xmm1 = {ax, ay, ?, ?}
 *   0x1bce92  insertps $0x20, xmm3, xmm1     ## xmm1 = {ax, ay, az, ?}
 *
 *   -- dot = ax^2 + ay^2 + az^2 (horizontal add of xmm1*xmm1) --
 *   0x1bce9b  mulps  xmm1, xmm2              ## xmm2 = {ax^2, ay^2, az^2, ?^2}
 *   0x1bce9e  movshdup xmm2, xmm0            ## xmm0.l0 = ay^2
 *   0x1bcea2  addps  xmm2, xmm0              ## xmm0.l0 = ax^2 + ay^2
 *   0x1bcea5  movhlps xmm2, xmm2             ## xmm2.l0 = az^2
 *   0x1bcea8  addps  xmm0, xmm2              ## xmm2.l0 = ax^2 + ay^2 + az^2 = |a|^2
 *
 *   -- one-step Newton refinement of rsqrt(|a|^2) --
 *   0x1bceae  rsqrtss xmm2, xmm3             ## xmm3 = r ~ 1/sqrt(|a|^2)  (hw approx)
 *   0x1bceb2  mulss  [0x3c7cc8], xmm2        ## xmm2 = 0.5 * |a|^2       (@0x3c7cc8 = 0.5f)
 *   0x1bceba  movss  [0x3c9fc0], xmm0        ## xmm0 = +INF              (@0x3c9fc0)
 *   0x1bcec2  cmpless xmm3, xmm0             ## xmm0 = (+INF <= r) ? -1 : 0
 *                                            ## true only when r == +INF, i.e. |a| == 0
 *   0x1bcec7  blendvps xmm0, [0x3c9fd0], xmm2## if mask sign bit set, replace xmm2
 *                                            ## with -INF (@0x3c9fd0 = 4x -INF)
 *   0x1bced3  mulss  xmm3, xmm2              ## xmm2 = xmm2 * r
 *   0x1bced7  mulss  xmm3, xmm2              ## xmm2 = xmm2 * r^2  = 0.5 * x * r^2
 *                                            ## (or -INF path if |a|==0)
 *   0x1bcedb  movss  [0x3c7cd0], xmm0        ## xmm0 = 1.5f (@0x3c7cd0)
 *   0x1bcee3  subss  xmm2, xmm0              ## xmm0 = 1.5 - 0.5 * x * r^2
 *   0x1bcee7  mulss  xmm3, xmm0              ## xmm0 = r * (1.5 - 0.5 * x * r^2)
 *                                            ## = refined 1/sqrt(|a|^2)
 *   0x1bceeb  shufps $0x0, xmm0, xmm0        ## broadcast: xmm0 = {s, s, s, s}
 *   0x1bceef  mulps  xmm1, xmm0              ## xmm0 = normalised axis = {ux, uy, uz, ?}
 *   0x1bcef2  movaps xmm0, -0x20(rbp)        ## spill: local u = normalised axis
 *
 *   -- sincos(angle) — Apple's fused libm returns (sin, cos) packed in xmm0 --
 *   0x1bcef9  callq ___sincosf_stret         ## xmm0 = {sin(theta), cos(theta), ?, ?}
 *   0x1bcefe  movshdup xmm0, xmm6            ## xmm6.l0 = cos(theta)
 *   0x1bcf02  movss  [0x3c7cc0], xmm1        ## xmm1 = 1.0f (@0x3c7cc0 low-4 = 0x3f800000)
 *   0x1bcf0a  subss  xmm6, xmm1              ## xmm1 = 1 - cos(theta) = "omc"
 *
 *   -- Rodrigues formula: R = I + sin*K + (1-cos)*K^2, K = skew(u) --
 *   -- Entries (verified against the register plumbing at 0x1bcf0e..0x1bcfa7): let
 *      s = sin(theta), c = cos(theta), omc = 1-c, u = (ux, uy, uz).
 *        R00 = c + ux*ux*omc          R01 = ux*uy*omc - uz*s      R02 = ux*uz*omc + uy*s
 *        R10 = uy*ux*omc + uz*s       R11 = c + uy*uy*omc         R12 = uy*uz*omc - ux*s
 *        R20 = uz*ux*omc - uy*s       R21 = uz*uy*omc + ux*s      R22 = c + uz*uz*omc
 *
 *   -- Row-4 constant --
 *   0x1bcfc0  movaps [0x3c9fe0], xmm0        ## xmm0 = {0, 0, 0, 1}
 *   0x1bcfc7  movaps xmm0, 0x30(rbx)         ## col3 = {0, 0, 0, 1}
 *
 * Result (columns of R, column-major):
 *   col0 = (R00, R10, R20, 0)
 *   col1 = (R01, R11, R21, 0)
 *   col2 = (R02, R12, R22, 0)
 *   col3 = (0,   0,   0,   1)
 *
 * NOTE on the rsqrt+Newton chain: the exact hardware path is
 *     r  = rsqrtss(|a|^2)                                  // hw approx (~12-bit)
 *     x  = (|a|^2 == 0) ? -INF : 0.5 * |a|^2               // blendvps guard
 *     s  = r * (1.5 - x * r^2)                             // one Newton step
 * For nonzero |a|^2 the closed form is 1/sqrt(|a|^2) to within one ulp of the *ss result;
 * we emit that closed form and Math.fround-snap it to single precision.  For |a|^2 == 0
 * the -INF path yields NaN, so we return NaN for the normalised lanes — mirroring the
 * observable behaviour.
 */
export function matrix_rotation(
  angleRad: number, axisX: number, axisY: number, axisZ: number,
): simd_float4x4 {
  const ax = F(axisX), ay = F(axisY), az = F(axisZ);

  // dot = |a|^2 (horizontal add, 0x1bce9b..0x1bcea8).
  const dot = F(F(ax * ax) + F(F(ay * ay) + F(az * az)));

  // rsqrt(dot) with one Newton step.  See NOTE above.
  const s = dot === 0 ? NaN : F(1 / Math.sqrt(dot));

  const ux = F(ax * s), uy = F(ay * s), uz = F(az * s);

  // sincos(angleRad) — matches ___sincosf_stret ABI (returns {sin, cos}).
  const angF = F(angleRad);
  const sinT = F(Math.sin(angF));
  const cosT = F(Math.cos(angF));
  const omc = F(F(1.0) - cosT);

  const uxux = F(ux * ux), uyuy = F(uy * uy), uzuz = F(uz * uz);
  const uxuy = F(ux * uy), uxuz = F(ux * uz), uyuz = F(uy * uz);

  const R00 = F(cosT + F(uxux * omc));
  const R11 = F(cosT + F(uyuy * omc));
  const R22 = F(cosT + F(uzuz * omc));

  const R01 = F(F(uxuy * omc) - F(uz * sinT));
  const R10 = F(F(uxuy * omc) + F(uz * sinT));

  const R02 = F(F(uxuz * omc) + F(uy * sinT));
  const R20 = F(F(uxuz * omc) - F(uy * sinT));

  const R12 = F(F(uyuz * omc) - F(ux * sinT));
  const R21 = F(F(uyuz * omc) + F(ux * sinT));

  return {
    columns: [
      { x: R00, y: R10, z: R20, w: F(0) },
      { x: R01, y: R11, z: R21, w: F(0) },
      { x: R02, y: R12, z: R22, w: F(0) },
      { x: F(0), y: F(0), z: F(0), w: F(1) },
    ],
  };
}

/**
 * project_util::fill_flat_array(vector<Triangle> const& tris, vector<float>& out) -> void
 * @Helium 0x00000000001bcfe0
 * (__ZN12project_util15fill_flat_arrayERKNSt3__16vectorINS_8TriangleENS0_9allocatorIS2_EEEERNS1_IfNS3_IfEEEE)
 *
 * Iterates a `std::vector<project_util::Triangle>` (48-byte elements = 3 x 16B vertices),
 * normalises each vertex via the same rsqrt+Newton pipeline as matrix_rotation, and
 * pushes its 3 float components onto a `std::vector<float>&` output — growing capacity
 * as needed via the libcxx `__push_back_slow_path`/`__vallocate` machinery.
 *
 * DECODE: raw-port/re/disasm/Helium.project_util.fill_flat_array.s (242 lines) —
 * NOT YET TRANSCRIBED for @0x00000000001bcfe0.  The vector-growth control flow (capacity doubling, throw on
 * length_error, allocator dispatch) hasn't been decoded elsewhere in the port yet, so
 * a faithful transcription requires that surrounding infrastructure first.
 */
export function fill_flat_array(
  _tris: readonly unknown[],
  _out: number[],
): void {
  throw new Error(
    "project_util::fill_flat_array @0x00000000001bcfe0 not yet transcribed " +
    "(Helium __ZN12project_util15fill_flat_arrayERKNSt3__16vectorINS_8TriangleENS0_9allocatorIS2_EEEERNS1_IfNS3_IfEEEE) — " +
    "raw-port/re/disasm/Helium.project_util.fill_flat_array.s (242 lines) awaits transcription."
  );
}

/**
 * project_util::generateIcosphere(int subdivisions, vector<float>& outVertices) -> void
 * @Helium 0x00000000001bd3c0
 * (__ZN12project_util17generateIcosphereEiRNSt3__16vectorIfNS0_9allocatorIfEEEE)
 *
 * Generates an icosphere (subdivided regular icosahedron) mesh at the requested
 * subdivision level and writes its normalised vertex positions as flat float triples
 * into the caller's `std::vector<float>`.  The disasm is 1872 lines: it allocates and
 * grows several intermediate vectors (starting with the 12-vertex icosahedron literal
 * embedded as movaps constants at 0x1bd3ee/0x1bd406/0x1bd42f/0x1bd455/0x1bd479/0x1bd4ae/
 * 0x1bd4ba/0x1bd4cd), then repeatedly halves edges and re-normalises via an
 * unordered_map for edge de-duplication.
 *
 * DECODE: raw-port/re/disasm/Helium.project_util.generateIcosphere.s (1872 lines) —
 * NOT YET TRANSCRIBED for @0x00000000001bd3c0.  The subdivision loop, edge hash map, and vertex-buffer growth
 * are large and require dedicated decode passes.  Callers today throw here so the gap
 * is loud.
 */
export function generateIcosphere(
  _subdivisions: number,
  _outVertices: number[],
): void {
  throw new Error(
    "project_util::generateIcosphere @0x00000000001bd3c0 not yet transcribed " +
    "(Helium __ZN12project_util17generateIcosphereEiRNSt3__16vectorIfNS0_9allocatorIfEEEE) — " +
    "raw-port/re/disasm/Helium.project_util.generateIcosphere.s (1872 lines) awaits transcription."
  );
}
