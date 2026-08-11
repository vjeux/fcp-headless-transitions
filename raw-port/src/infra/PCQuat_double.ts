// PCQuat_double.ts — ProCore/Ozone's `PCQuat<double>` (quaternion), the
// `setRotation(from, to, tolerance)` instantiation compiled into Ozone.
//
// FRAMEWORK: Ozone.framework (Final Cut Pro), x86_64 slice.
//   /Applications/Final Cut Pro.app/Contents/Frameworks/Ozone.framework/Versions/A/Ozone
//
// -----------------------------------------------------------------------------
// SYMBOL PORTED (this file's scope)
// -----------------------------------------------------------------------------
//   * PCQuat<double>::setRotation(PCVector3<double> const&, PCVector3<double> const&, double)
//     @Ozone 0x7bd30   __ZN6PCQuatIdE11setRotationERK9PCVector3IdES4_d
//     re/disasm: raw-port/re/disasm/__ZN6PCQuatIdE11setRotationERK9PCVector3IdES4_d.s (155 lines)
//
// Builds the quaternion that rotates vector `a` onto vector `b`, with a
// caller-supplied tolerance that decides when the two are "already aligned"
// (identity) or "opposite" (a 180° flip about some perpendicular axis).
//
// -----------------------------------------------------------------------------
// STRUCT LAYOUT — from the stores this function makes
// -----------------------------------------------------------------------------
//   PCQuat<double> {            (the sret/`this` pointer arrives in %rdi and is
//     +0x00  double w            copied to %rax @0x7bd34; every store is off %rax)
//     +0x08  double x           [@0x7bde9 / @0x7be85 / @0x7bece / @0x7bf30 / @0x7bfd5]
//     +0x10  double y           [@0x7be8a / @0x7bed3 / @0x7bf3e / @0x7bfd5 (pair with x)]
//     +0x18  double z           [@0x7bdee / @0x7bfde]
//   }
//   The w-slot stores prove the ordering: the identity path writes the raw
//   bit pattern 0x3ff0000000000000 (= 1.0) to +0x00 @0x7bde2, and the general
//   path writes `sqrt((1+cosθ)/2)` — the real part — to +0x00 @0x7bf5d.
//
//   `PCVector3<double>` is three packed doubles, as the loads show:
//   `movupd (%rsi)` @0x7bd4b takes (x, y) as a PAIR and `movsd 0x10(%rsi)`
//   @0x7bd57 takes z alone. Modelled here as a `Float64Array` indexed 0/1/2,
//   the same convention as the landed `PCVector3_double_normalize`.
//
// -----------------------------------------------------------------------------
// THE FOUR RIP-RELATIVE CONSTANTS — resolved, not guessed
// -----------------------------------------------------------------------------
// (VA = instr + len + disp, via raw-port/army/tools/resolve.py Ozone ripconst.)
//   @0x7bd37 movsd    0x6896a1(%rip) -> VA 0x7053e0 = 0x3ff0000000000000 = 1.0
//   @0x7bdf8 xorpd    0x68b760(%rip) -> VA 0x707560 = 0x8000000000000000 x2
//                                        (the sign-flip pair: negates a lane)
//   @0x7be12 movapd   0x68aff6(%rip) -> VA 0x706e10 = 0x7fffffffffffffff x2
//                                        (the absolute-value / sign-clear mask)
//   @0x7be1e cmpltsd  0x68b911(%rip) -> VA 0x707738 = 0x3e7ad7f2a0000000
//                                        = 1.0000000116860974e-07 (the double
//                                        nearest the float32 1e-7)
//   @0x7be27 movsd    0x6895b1(%rip) -> VA 0x7053e0 = 1.0            (again)
//   @0x7bf0c movapd   0x68aefc(%rip) -> VA 0x706e10 = the abs mask   (again)
//   @0x7bf19 movsd    0x68b817(%rip) -> VA 0x707738 = 1e-7           (again)
//   @0x7bf4d movsd    0x68af53(%rip) -> VA 0x706ea8 = 0x3fe0000000000000 = 0.5
//
// -----------------------------------------------------------------------------
// CONTROL FLOW — three cases, decided by two `ucomisd`s on cosθ
// -----------------------------------------------------------------------------
// The prologue computes, in packed SSE:
//   dot   = a.x*b.x + a.y*b.y + a.z*b.z      (@0x7bd53..@0x7bd7a)
//   |a|²,|b|² as the two lanes of one register (@0x7bd7f..@0x7bdb4)
//   denom = sqrt(|a|² * |b|²) = |a|·|b|       (@0x7bdb9..@0x7bdc8)
//   cosθ  = dot / denom                       (@0x7bdcd)
// then:
//   @0x7bdd2  ucomisd %xmm6, %xmm7  ; flags on cosθ - (1 - tol)
//   @0x7bdd6  jbe 0x7bdf8           ; NOT taken (cosθ > 1-tol) -> IDENTITY
//   @0x7bdf8  xmm6 = -(1 - tol)     ; xorpd with the sign-flip pair
//   @0x7be00  ucomisd %xmm7, %xmm6  ; flags on -(1-tol) - cosθ
//   @0x7be04  jbe 0x7bf45           ; taken (-(1-tol) <= cosθ) -> GENERAL
//                                   ; else -> ANTIPARALLEL (180°)
// AT&T note (PORTING_SPEC Rule 4): each `ucomisd src, dst` sets flags on
// `dst - src`, and `jbe` is CF|ZF — so the first test falls through exactly
// when `cosθ > 1 - tol` and the second jumps exactly when `-(1-tol) <= cosθ`.
// A NaN operand sets CF=ZF=PF=1, so BOTH `jbe`s are taken on NaN: a NaN cosθ
// lands in the GENERAL case, which is what the `> ` / `<= ` comparisons below
// reproduce (JS relational operators are false on NaN in exactly the matching
// direction). No `jp` guard is present, so no extra NaN handling is invented.
//
// FRONTIER CALLEES — none: no `callq`, no symbol stub, no indirect or virtual
// dispatch anywhere in the body. Pure SSE arithmetic (`sqrtsd`, `divsd`,
// `mulpd`, `blendvpd`, `cmpltsd`, shuffles) plus the four constants above.
//
// NUMERICS — every operation here is DOUBLE precision (`sd`/`pd` suffixes, no
// `ss`/`ps`), so nothing is `Math.fround`ed: JS numbers are IEEE-754 binary64
// and `Math.sqrt` is the correctly-rounded `sqrtsd`.
//
// Per PORTING_SPEC.md Rules 1, 2, 4, 5, 6.

/** `PCVector3<double>` — three packed doubles at +0x00/+0x08/+0x10, indexed
 *  0/1/2 (the same shape the landed `PCVector3_double_normalize` uses). */
export type PCVector3Double = Float64Array;

/** `PCQuat<double>` — four packed doubles: w at +0x00, x at +0x08, y at +0x10,
 *  z at +0x18 (see the layout block above). */
export type PCQuatDouble = Float64Array;

/** @0xADDR Ozone 0x7053e0 — the double `1.0`, loaded @0x7bd37 and @0x7be27. */
const K_ONE = 1.0;

/** @0xADDR Ozone 0x706ea8 — the double `0.5`, loaded @0x7bf4d. */
const K_HALF = 0.5;

/** @0xADDR Ozone 0x707738 — `0x3e7ad7f2a0000000`, the double nearest the
 *  float32 `1e-7`. Used twice as a degeneracy epsilon: against the source
 *  vector's length @0x7be1e (`cmpltsd`) and against the chosen axis's length
 *  @0x7bf19 (`ucomisd`). */
const K_EPS_1E7 = 1.0000000116860974e-7;

/**
 * `PCQuat<double>::setRotation(PCVector3<double> const& a,
 *                              PCVector3<double> const& b, double tol)`
 * — @Ozone 0x7bd30 (__ZN6PCQuatIdE11setRotationERK9PCVector3IdES4_d).
 *
 * ABI: `%rdi` = `this` (copied to `%rax` @0x7bd34 and used as the store base —
 * the function also leaves it in `%rax`, so it is returned), `%rsi` = `a`,
 * `%rdx` = `b`, `%xmm0` = `tol`.
 *
 * ── PROLOGUE, instruction by instruction ────────────────────────────────────
 *   0x7bd34  movq   %rdi, %rax               ; rax = this (store base)
 *   0x7bd37  movsd  1.0(%rip), %xmm1
 *   0x7bd3f  movapd %xmm1, %xmm6
 *   0x7bd43  subsd  %xmm0, %xmm6             ; xmm6 = 1 - tol
 *   0x7bd47  movsd  (%rdx), %xmm5            ; b.x
 *   0x7bd4b  movupd (%rsi), %xmm2            ; (a.x, a.y)
 *   0x7bd4f  movapd %xmm2, %xmm7
 *   0x7bd53  mulsd  %xmm5, %xmm7             ; a.x*b.x
 *   0x7bd57  movsd  0x10(%rsi), %xmm3        ; a.z
 *   0x7bd5c  movupd 0x8(%rdx), %xmm4         ; (b.y, b.z)
 *   0x7bd61  movsd  0x8(%rsi), %xmm8         ; a.y
 *   0x7bd67  mulsd  %xmm4, %xmm8             ; a.y*b.y
 *   0x7bd6c  addsd  %xmm7, %xmm8
 *   0x7bd71  movsd  0x10(%rdx), %xmm7        ; b.z
 *   0x7bd76  mulsd  %xmm3, %xmm7             ; a.z*b.z
 *   0x7bd7a  addsd  %xmm8, %xmm7             ; xmm7 = dot(a,b)
 *   0x7bd7f  movapd %xmm2, %xmm8
 *   0x7bd84  unpcklpd %xmm5, %xmm8           ; (a.x, b.x)
 *   0x7bd89  mulpd  %xmm8, %xmm8             ; (a.x², b.x²)
 *   0x7bd8e  movapd %xmm2, %xmm9
 *   0x7bd93  shufpd $0x1, %xmm4, %xmm9       ; (a.y, b.y)
 *   0x7bd99  mulpd  %xmm9, %xmm9             ; (a.y², b.y²)
 *   0x7bd9e  addpd  %xmm8, %xmm9
 *   0x7bda3  movapd %xmm4, %xmm8
 *   0x7bda8  blendpd $0x1, %xmm3, %xmm8      ; (a.z, b.z)
 *   0x7bdaf  mulpd  %xmm8, %xmm8             ; (a.z², b.z²)
 *   0x7bdb4  addpd  %xmm9, %xmm8             ; xmm8 = (|a|², |b|²)
 *   0x7bdb9  movapd %xmm8, %xmm9
 *   0x7bdbe  unpckhpd %xmm8, %xmm9           ; xmm9.lo = |b|²
 *   0x7bdc3  mulsd  %xmm8, %xmm9             ; |a|²·|b|²
 *   0x7bdc8  sqrtsd %xmm9, %xmm9             ; |a|·|b|
 *   0x7bdcd  divsd  %xmm9, %xmm7             ; xmm7 = cosθ = dot / (|a||b|)
 *
 * Note the products are formed PAIRWISE across the two vectors (lane 0 = a,
 * lane 1 = b) and the norm product is `sqrt(|a|²·|b|²)`, ONE square root of
 * the product — not `sqrt(|a|²)·sqrt(|b|²)`. Those differ in the last ulp, so
 * the port keeps the single `Math.sqrt(lenSqA * lenSqB)` form.
 *
 * ── CASE 1: already aligned (fall-through of `jbe` @0x7bdd6) ───────────────
 *   0x7bdd8  movabsq $0x3ff0000000000000, %rcx ; the bit pattern of 1.0
 *   0x7bde2  movq   %rcx, (%rax)              ; w = 1.0
 *   0x7bde5  xorpd  %xmm0, %xmm0
 *   0x7bde9  movupd %xmm0, 0x8(%rax)          ; x = y = 0
 *   0x7bdee  movq   $0x0, 0x18(%rax)          ; z = 0
 * i.e. the identity quaternion.
 *
 * ── CASE 2: antiparallel (fall-through of `jbe` @0x7be04) ──────────────────
 *   0x7be0a  xorps %xmm4,%xmm4 ; sqrtsd %xmm8,%xmm4   ; len = sqrt(|a|²)
 *   0x7be12  movapd absmask,%xmm1 ; andpd %xmm4,%xmm1 ; |len|
 *   0x7be1e  cmpltsd 1e-7(%rip), %xmm1                ; mask = (|len| < 1e-7)
 *   0x7be27  movsd  1.0(%rip), %xmm5
 *   0x7be2f  movapd %xmm0, %xmm7                      ; xmm7 = tol (reused reg)
 *   0x7be37  blendvpd %xmm0, %xmm5, %xmm4             ; len = mask ? 1.0 : len
 *   0x7be3c  divsd  %xmm4, %xmm3                      ; u.z = a.z / len
 *   0x7be4e  movddup %xmm4, %xmm1 ; divpd %xmm1, %xmm2 ; (u.x, u.y)
 *   ... then cross(u, X) with X = (1,0,0), the zero-lane multiplies
 *   (@0x7be49, @0x7be5a, @0x7be7b) being the compiler's folding of Xy = Xz = 0:
 *       c = (uy*0 - uz*0, uz*1 - ux*0, ux*0 - uy*1) = (0, u.z, -u.y)
 *   0x7be85  movsd  %xmm5, 0x8(%rax)  ; x = 0
 *   0x7be8a  movupd %xmm4, 0x10(%rax) ; y = u.z, z = -u.y
 *   0x7be8f..0x7beb6  |c| = sqrt(cx² + cy² + cz²)
 *   0x7bebb  ucomisd %xmm8, %xmm7 ; jbe 0x7bf05   ; tol <= |c| -> keep this axis
 *   -- otherwise retry with Y = (0,1,0) (@0x7bec2..@0x7bf01):
 *       c = (uy*0 - uz*1, uz*0 - ux*0, ux*1 - uy*0) = (-u.z, 0, u.x)
 *      stored the same way, and |c| recomputed identically.
 *   0x7bf05  movq $0x0, (%rax)                       ; w = 0 (a 180° rotation)
 *   0x7bf0c  movapd absmask,%xmm0 ; andpd %xmm8,%xmm0
 *   0x7bf19  movsd 1e-7(%rip),%xmm1 ; ucomisd %xmm0,%xmm1 ; ja 0x7bfe3
 *            ; if 1e-7 > ||c|| the axis is degenerate -> RETURN AS STORED
 *            ; (unnormalised, w already 0)
 *   0x7bf2b  divsd %xmm8,%xmm5 ; movsd %xmm5,0x8(%rax)      ; x = cx/|c|
 *   0x7bf35  movddup %xmm8,%xmm0 ; divpd %xmm0,%xmm4 ;
 *   0x7bf3e  movupd %xmm4,0x10(%rax)                        ; y,z = c.yz/|c|
 *
 * ── CASE 3: the general rotation (target of `jbe` @0x7be04) ────────────────
 *   0x7bf45  movapd %xmm7,%xmm0 ; addsd %xmm1,%xmm0   ; cosθ + 1   (xmm1 = 1.0)
 *   0x7bf4d  movsd 0.5(%rip),%xmm6 ; mulsd %xmm6,%xmm0 ; (1+cosθ)/2
 *   0x7bf59  sqrtsd %xmm0,%xmm0 ; movsd %xmm0,(%rax)  ; w = cos(θ/2)
 *   0x7bf61  subsd %xmm7,%xmm1 ; mulsd %xmm6,%xmm1    ; (1-cosθ)/2 = sin²(θ/2)
 *   0x7bf69..0x7bf87   c.xy = (a.y*b.z - a.z*b.y, a.z*b.x - a.x*b.z)
 *   0x7bf8b..0x7bfb1   c.z  = a.x*b.y - a.y*b.x   (the `subsd` @0x7bfb1 keeps
 *                      only the low lane; the paired `addpd` @0x7bfad is what
 *                      simultaneously produces cx²+cy² in the high lane)
 *   0x7bfb5..0x7bfc1   |c|² = cx² + cy² + cz²
 *   0x7bfc5  divsd %xmm2,%xmm1 ; sqrtsd %xmm1,%xmm1  ; s = sqrt(sin²(θ/2)/|c|²)
 *   0x7bfcd  movddup %xmm1,%xmm2 ; mulpd %xmm0,%xmm2
 *   0x7bfd5  movupd %xmm2, 0x8(%rax)                 ; x = s*cx, y = s*cy
 *   0x7bfda  mulsd %xmm1,%xmm4 ; movsd %xmm4,0x18(%rax) ; z = s*cz
 *
 * The scale is computed as `sqrt(((1-cosθ)/2) / |c|²)` — ONE division inside
 * ONE square root, not `sqrt((1-cosθ)/2) / |c|`. Again the two differ in the
 * last ulp, so the port keeps the machine's form.
 *
 * @param self the quaternion to write (`%rdi`), 4 doubles.
 * @param a    the source vector (`%rsi`), 3 doubles.
 * @param b    the destination vector (`%rdx`), 3 doubles.
 * @param tol  the alignment tolerance (`%xmm0`).
 * @returns `self` (the machine leaves `this` in `%rax`).
 */
export function PCQuat_double_setRotation(
  self: PCQuatDouble,
  a: PCVector3Double,
  b: PCVector3Double,
  tol: number,
): PCQuatDouble {
  // @0x7bd43 — xmm6 = 1 - tol.
  const oneMinusTol = K_ONE - tol;

  // @0x7bd47..@0x7bd61 — the six component loads.
  const ax = a[0]; // movupd (%rsi) lane 0
  const ay = a[1]; // movupd (%rsi) lane 1 / movsd 0x8(%rsi)
  const az = a[2]; // movsd 0x10(%rsi)
  const bx = b[0]; // movsd (%rdx)
  const by = b[1]; // movupd 0x8(%rdx) lane 0
  const bz = b[2]; // movupd 0x8(%rdx) lane 1

  // @0x7bd53..@0x7bd7a — dot(a,b), accumulated x then y then z.
  const dot = ax * bx + ay * by + az * bz;
  // @0x7bd7f..@0x7bdb4 — the two squared norms, computed as packed lanes.
  const lenSqA = ax * ax + ay * ay + az * az;
  const lenSqB = bx * bx + by * by + bz * bz;
  // @0x7bdc3/@0x7bdc8 — ONE sqrt of the PRODUCT of the squared norms.
  const denom = Math.sqrt(lenSqA * lenSqB);
  // @0x7bdcd — cosθ.
  const cosTheta = dot / denom;

  // @0x7bdd2/@0x7bdd6 — ucomisd on (cosθ - (1 - tol)) ; jbe skips this arm.
  if (cosTheta > oneMinusTol) {
    // @0x7bdd8..@0x7bdee — the identity quaternion.
    self[0] = K_ONE; // w  (the movabsq bit pattern 0x3ff0000000000000)
    self[1] = 0; // x  \\ movupd of the xorpd-zeroed xmm0
    self[2] = 0; // y  /
    self[3] = 0; // z  (movq $0x0, 0x18(%rax))
    return self;
  }

  // @0x7bdf8 — xmm6 ^= (-0.0, -0.0): the sign flip of the low lane.
  const negOneMinusTol = -oneMinusTol;
  // @0x7be00/@0x7be04 — ucomisd on (-(1-tol) - cosθ) ; jbe -> the general case.
  //
  // The predicate is `>`, NOT the negation of `<=`, and the difference is only
  // visible on NaN. `jbe` is CF|ZF, and an UNORDERED compare sets CF=ZF=PF=1, so
  // `jbe` is TAKEN on NaN and a NaN cosθ (or a NaN tol) falls through to the
  // GENERAL case @0x7bf45. CASE 2 is the ORDERED fall-through, reached only when
  // `-(1-tol) > cosθ` with both operands ordered. Writing `!(negOneMinusTol <=
  // cosTheta)` inverts that: in JS `NaN <= x` is false, so the negation is true and
  // NaN would take CASE 2 — the opposite of the machine. (The FIRST branch
  // @0x7bdd6 needs no such care: `cosTheta > oneMinusTol` is already false on NaN,
  // which correctly skips the identity arm.)
  if (negOneMinusTol > cosTheta) {
    // ---- CASE 2: antiparallel (a 180° turn about a perpendicular axis) ----
    // @0x7be0a/@0x7be0d — len = sqrt(|a|²).
    let len = Math.sqrt(lenSqA);
    // @0x7be12..@0x7be37 — blendvpd: a degenerate length is replaced by 1.0
    //   (the mask is `|len| < 1e-7`, computed on the ABS value @0x7be1a).
    if (Math.abs(len) < K_EPS_1E7) {
      len = K_ONE;
    }
    // @0x7be3c/@0x7be52 — the normalised source direction.
    const ux = ax / len;
    const uy = ay / len;
    const uz = az / len;

    // @0x7be49..@0x7be80 — cross(u, X) with X = (1,0,0). The multiplies by the
    // xorpd-zeroed registers are the compiler folding Xy = Xz = 0, and they are
    // KEPT here rather than simplified away: `0 * ±Infinity` and `0 * NaN` are
    // NaN in IEEE-754, so dropping them would change the result for a
    // degenerate `u` exactly where the machine would not.
    //   @0x7be66  xmm5.lo = (0*uy) - (uz*0)
    let cx = 0 * uy - uz * 0;
    //   @0x7be80  xmm4.lo = uz - (ux*0)
    let cy = uz - ux * 0;
    //   @0x7be80  xmm4.hi = (0*ux) - uy
    let cz = 0 * ux - uy;
    // @0x7be85/@0x7be8a — stored immediately, before the length test.
    self[1] = cx;
    self[2] = cy;
    self[3] = cz;
    // @0x7be8f..@0x7beb6 — |c|.
    let axisLen = Math.sqrt(cx * cx + cy * cy + cz * cz);

    // @0x7bebb/@0x7bec0 — ucomisd on (tol - |c|) ; jbe keeps this axis.
    if (!(tol <= axisLen)) {
      // @0x7bec2..@0x7bed3 — retry with Y = (0,1,0), the same folded zeros:
      //   @0x7bec2  xmm1.lo = (0*uy) - uz
      cx = 0 * uy - uz;
      //   @0x7beca  xmm0.lo = (uz*0) - (0*ux)
      cy = uz * 0 - 0 * ux;
      //   @0x7beca  xmm0.hi = ux - (0*uy)
      cz = ux - 0 * uy;
      self[1] = cx;
      self[2] = cy;
      self[3] = cz;
      // @0x7bed8..@0x7bef8 — recompute |c| for the new axis.
      axisLen = Math.sqrt(cx * cx + cy * cy + cz * cz);
    }

    // @0x7bf05 — w = 0: a 180° rotation has zero real part.
    self[0] = 0;
    // @0x7bf0c..@0x7bf25 — ucomisd on (1e-7 - ||c||) ; `ja` returns early,
    //   leaving the UNNORMALISED axis in x/y/z.
    if (K_EPS_1E7 > Math.abs(axisLen)) {
      return self;
    }
    // @0x7bf2b..@0x7bf3e — normalise the axis in place.
    self[1] = cx / axisLen;
    self[2] = cy / axisLen;
    self[3] = cz / axisLen;
    return self;
  }

  // ---- CASE 3: the general rotation ----
  // @0x7bf45..@0x7bf5d — w = sqrt((1 + cosθ)/2) = cos(θ/2).
  self[0] = Math.sqrt((cosTheta + K_ONE) * K_HALF);
  // @0x7bf61/@0x7bf65 — sin²(θ/2) = (1 - cosθ)/2.
  const sinHalfSq = (K_ONE - cosTheta) * K_HALF;
  // @0x7bf69..@0x7bf87 — the first two cross-product lanes.
  const cx = ay * bz - az * by;
  const cy = az * bx - ax * bz;
  // @0x7bf8b..@0x7bfb1 — the third lane (`subsd` on the low lane only).
  const cz = ax * by - ay * bx;
  // @0x7bfb5..@0x7bfc1 — |c|², assembled as (cx² + cy²) + cz².
  const crossLenSq = cx * cx + cy * cy + cz * cz;
  // @0x7bfc5/@0x7bfc9 — ONE sqrt of the QUOTIENT: s = sqrt(sin²(θ/2) / |c|²).
  const s = Math.sqrt(sinHalfSq / crossLenSq);
  // @0x7bfcd..@0x7bfde — the imaginary part.
  self[1] = s * cx;
  self[2] = s * cy;
  self[3] = s * cz;
  return self;
}
