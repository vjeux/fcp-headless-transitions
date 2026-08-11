// PCProjectionMapSquareToQuad.ts — raw transcription of ProCore's
// `PCProjectionMapSquareToQuad(PCVector2<double> const&, ..., PCVector2<double>&)`.
//
// One free function per file, named after the function (PORTING_SPEC naming rule).
//
// Provenance (ProCore framework, x86_64 slice):
//   /Applications/Final Cut Pro.app/Contents/Frameworks/ProCore.framework/Versions/A/ProCore
//
// Symbol ported in this file:
//   @0x678d6  PCProjectionMapSquareToQuad(PCVector2<double> const&, PCVector2<double> const&,
//                                         PCVector2<double> const&, PCVector2<double> const&,
//                                         PCVector2<double> const&, PCVector2<double>&)
//     __Z27PCProjectionMapSquareToQuadRK9PCVector2IdES2_S2_S2_S2_RS0_
//     (`t` in the symbol table — internal linkage.)
//
// Source disassembly (re-derived with `raw-port/tools/disasm.sh --sym ... ProCore`):
//   raw-port/re/disasm/ProCore.__Z27PCProjectionMapSquareToQuadRK9PCVector2IdES2_S2_S2_S2_RS0_.s
//   (83 lines)
//
// ─────────────────────────────────────────────────────────────────────────────
// WHAT IT COMPUTES
// ─────────────────────────────────────────────────────────────────────────────
// The classic square-to-quad projective map: it builds the homography taking the
// unit square's corners to the four given points and applies it to `uv`.
// Writing A, B, C, D for the four corner arguments (%rdi, %rsi, %rdx, %rcx) and
// (u, v) for the fifth (%r8):
//
//   S = A - B + C - D                       (the "non-parallelogram" residual)
//   if |S.x| < 1e-7 AND |S.y| < 1e-7:       (BOTH lanes — an affine quad)
//       g = h = 0
//       m1 = (B.x - A.x, C.y - B.y)
//       m2 = (C.x - B.x, B.y - A.y)
//   else:
//       g = ((D.y-C.y)*S.x - (D.x-C.x)*S.y) / det
//       h = ((B.x-C.x)*S.y - (B.y-C.y)*S.x) / det
//       det = (D.y-C.y)*(B.x-C.x) - (B.y-C.y)*(D.x-C.x)
//       m1 = ((1+g)*B.x - A.x, (1+h)*D.y - A.y)
//       m2 = ((1+h)*D.x - A.x, (1+g)*B.y - A.y)
//   den  = g*u + h*v + 1
//   out.x = (u*m1.x + v*m2.x + A.x) / den
//   out.y = (u*m2.y + v*m1.y + A.y) / den
//
// Note the LANE CROSSING in the last two lines — x takes the LOW lanes of m1 and
// m2, y takes the HIGH lane of m2 then of m1. That is not a typo in this comment;
// it is `mulsd %xmm1 / %xmm2` followed by `unpckhpd %xmm2 / %xmm1` at
// @0x679ea..@0x67a10, and swapping them silently transposes the map.
//
// ─────────────────────────────────────────────────────────────────────────────
// FULL DISASM — packed-double throughout; lanes tracked explicitly
// ─────────────────────────────────────────────────────────────────────────────
// Registers after the loads: xmm0 = A (%rdi), xmm3 = B (%rsi), xmm1 = C (%rdx),
// xmm6 = D (%rcx). Each `movupd` is an UNALIGNED 16-byte load of one
// PCVector2<double> = (x in lane 0, y in lane 1).
//
//   0x678da  movupd (%rsi),%xmm3            ; B
//   0x678de  movupd (%rdx),%xmm1            ; C
//   0x678e2  movupd (%rcx),%xmm6            ; D
//   0x678e6  movupd (%rdi),%xmm0            ; A
//   0x678ea  movapd %xmm0,%xmm2
//   0x678ee  subpd  %xmm3,%xmm2             ; S = A - B
//   0x678f2  addpd  %xmm1,%xmm2             ; S += C
//   0x678f6  subpd  %xmm6,%xmm2             ; S -= D
//   0x678fa  movapd 0xbad6e(%rip),%xmm4     ; ABS mask 0x7fffffffffffffff x2
//                                           ; (0x67902 + 0xbad6e = 0x122670)
//   0x67902  andpd  %xmm2,%xmm4             ; |S| per lane
//   0x67906  cmpltpd 0xbbd01(%rip),%xmm4    ; |S| < 1e-7 per lane
//                                           ; (0x6790f + 0xbbd01 = 0x123610)
//   0x6790f  movmskpd %xmm4,%eax            ; 2-bit mask of the lane results
//   0x67913  cmpl   $0x3,%eax               ; BOTH lanes must be below epsilon
//   0x67916  jne    0x67945                 ; otherwise the projective path
//
//   ; ── AFFINE PATH (both residual lanes below 1e-7) ──
//   0x67918  movapd %xmm3,%xmm2             ; xmm2 = B
//   0x6791c  movsd  %xmm1,%xmm2             ; xmm2 = (C.x, B.y)
//   0x67920  movsd  %xmm3,%xmm1             ; xmm1 = (B.x, C.y)
//   0x67924  movapd %xmm0,%xmm4
//   0x67928  movsd  %xmm3,%xmm4             ; xmm4 = (B.x, A.y)
//   0x6792c  subpd  %xmm4,%xmm2             ; m2 = (C.x - B.x, B.y - A.y)
//   0x67930  movsd  %xmm0,%xmm3             ; xmm3 = (A.x, B.y)
//   0x67934  subpd  %xmm3,%xmm1             ; m1 = (B.x - A.x, C.y - B.y)
//   0x67938  xorpd  %xmm4,%xmm4             ; g = h = 0   (packed)
//   0x6793c  xorpd  %xmm3,%xmm3             ; h = 0       (scalar copy)
//   0x67940  jmp    0x679cb                 ; -> the shared tail
//
//   ; ── PROJECTIVE PATH ──
//   0x67945  movapd %xmm6,%xmm5
//   0x67949  movsd  %xmm3,%xmm5             ; xmm5 = (B.x, D.y)
//   0x6794d  movapd %xmm5,%xmm7
//   0x67951  subpd  %xmm1,%xmm7             ; xmm7 = (B.x - C.x, D.y - C.y)
//   0x67955  movapd %xmm7,%xmm4
//   0x67959  shufpd $0x1,%xmm7,%xmm4        ; xmm4 = (D.y - C.y, B.x - C.x)  [swapped]
//   0x6795e  movsd  %xmm6,%xmm3             ; xmm3 = (D.x, B.y)
//   0x67962  movapd %xmm3,%xmm6
//   0x67966  subpd  %xmm1,%xmm6             ; xmm6 = (D.x - C.x, B.y - C.y)
//   0x6796a  movapd %xmm7,%xmm1
//   0x6796e  unpcklpd %xmm6,%xmm1           ; xmm1 = (B.x - C.x, D.x - C.x)
//   0x67972  unpckhpd %xmm6,%xmm7           ; xmm7 = (D.y - C.y, B.y - C.y)
//   0x67976  mulpd  %xmm1,%xmm7             ; xmm7 = ((D.y-C.y)(B.x-C.x),
//                                           ;         (B.y-C.y)(D.x-C.x))
//   0x6797a  movapd %xmm3,%xmm1
//   0x6797e  subpd  %xmm0,%xmm1             ; xmm1 = (D.x - A.x, B.y - A.y)
//   0x67982  movapd %xmm5,%xmm8
//   0x67987  subpd  %xmm0,%xmm8             ; xmm8 = (B.x - A.x, D.y - A.y)
//   0x6798c  mulpd  %xmm2,%xmm4             ; ((D.y-C.y)*S.x, (B.x-C.x)*S.y)
//   0x67990  shufpd $0x1,%xmm2,%xmm2        ; S swapped = (S.y, S.x)
//   0x67995  hsubpd %xmm7,%xmm7             ; det = xmm7.lo - xmm7.hi, both lanes
//   0x67999  mulpd  %xmm6,%xmm2             ; (S.y*(D.x-C.x), S.x*(B.y-C.y))
//   0x6799d  subpd  %xmm2,%xmm4             ; numerators of (g, h)
//   0x679a1  divpd  %xmm7,%xmm4             ; (g, h) = numerators / det
//   0x679a5  movapd %xmm4,%xmm2
//   0x679a9  shufpd $0x1,%xmm4,%xmm2        ; (h, g)
//   0x679ae  mulpd  %xmm3,%xmm2             ; (h*D.x, g*B.y)
//   0x679b2  addpd  %xmm1,%xmm2             ; m2 = ((1+h)D.x - A.x, (1+g)B.y - A.y)
//   0x679b6  mulpd  %xmm4,%xmm5             ; (g*B.x, h*D.y)
//   0x679ba  addpd  %xmm8,%xmm5             ; m1 = ((1+g)B.x - A.x, (1+h)D.y - A.y)
//   0x679bf  movapd %xmm4,%xmm3
//   0x679c3  unpckhpd %xmm4,%xmm3           ; xmm3.lo = h
//   0x679c7  movapd %xmm5,%xmm1             ; m1
//
//   ; ── SHARED TAIL ──
//   0x679cb  movsd  (%r8),%xmm5             ; u
//   0x679d0  movsd  0x8(%r8),%xmm6          ; v
//   0x679d6  mulsd  %xmm5,%xmm4             ; g*u        (xmm4.lo is g)
//   0x679da  mulsd  %xmm6,%xmm3             ; h*v
//   0x679de  addsd  %xmm4,%xmm3             ; g*u + h*v
//   0x679e2  addsd  0xbab46(%rip),%xmm3     ; + 1.0   (0x679ea + 0xbab46 = 0x122530)
//   0x679ea  mulsd  %xmm1,%xmm5             ; u * m1.x
//   0x679ee  mulsd  %xmm2,%xmm6             ; v * m2.x
//   0x679f2  addsd  %xmm5,%xmm6
//   0x679f6  addsd  %xmm0,%xmm6             ; + A.x
//   0x679fa  divsd  %xmm3,%xmm6             ; / den
//   0x679fe  movsd  %xmm6,(%r9)             ; out.x
//   0x67a03  unpckhpd %xmm2,%xmm2           ; m2.y
//   0x67a07  mulsd  (%r8),%xmm2             ; u * m2.y
//   0x67a0c  unpckhpd %xmm1,%xmm1           ; m1.y
//   0x67a10  mulsd  0x8(%r8),%xmm1          ; v * m1.y
//   0x67a16  addsd  %xmm2,%xmm1
//   0x67a1a  unpckhpd %xmm0,%xmm0           ; A.y
//   0x67a1e  addsd  %xmm1,%xmm0             ; + A.y
//   0x67a22  divsd  %xmm3,%xmm0             ; / den
//   0x67a26  movsd  %xmm0,0x8(%r9)          ; out.y
//   0x67a2c  popq   %rbp
//   0x67a2d  retq
//
// NUMERICS: every operation is DOUBLE precision (`subpd`/`mulpd`/`divpd`/
// `addsd`/`divsd`), which is exactly JS's native number arithmetic — so, unlike
// the fp32 kernels in this repo, NO `Math.fround` belongs anywhere in this file.
// The body uses no reciprocal-estimate instruction (no `rcpps`/`rsqrtps`) and no
// FMA — every multiply and every add is its own instruction — so the JS
// expressions round identically, operation for operation. The order of operations below is kept in the
// machine's order for that reason.
//
// CONSTANTS (each resolved as next-instruction address + displacement, then read
// out of ProCore's __TEXT,__const):
//   @0x122670  0x7fffffffffffffff x2 — the sign-clearing ABS mask
//   @0x123610  1e-07 x2              — the affine-vs-projective threshold
//   @0x122530  1.0                   — the homogeneous denominator's constant term
//
// CALLEES: none — no callq, no extern, no indirect or virtual dispatch
// (`depgraph.py deps` lists nothing).
//
// ─────────────────────────────────────────────────────────────────────────────
// ORACLE
// ─────────────────────────────────────────────────────────────────────────────
// raw-port/re/oracle/PCProjectionMapSquareToQuad_oracle.py calls the LIVE
// function (LOCAL symbol, reached at dyld slide + 0x678d6 through
// ozone_loader.py, under `arch -x86_64`) and pipes the identical inputs through
// THIS TypeScript with tsx, comparing both output doubles as RAW u64 BIT
// PATTERNS. 222 cases: 120 random projective quads, 60 EXACT parallelograms
// (A - B + C - D == 0, the affine path), 21 cases straddling the 1e-7 threshold
// in the x lane, the y lane and both (0, 5e-8, 9.9e-8, exactly 1e-7,
// 1.0000001e-7, 2e-7, 1e-6 — so the `cmpltpd`'s strict `<` is pinned at the
// boundary itself), 20 DEGENERATE quads with a zero determinant, and an
// all-corners-identical quad; uv points inside, outside and on the unit square,
// including -0.0. Result: 222/222 bit-identical, with the degenerate quads
// genuinely reaching the divide-by-zero (2 NaN outputs observed, not guarded).
//
// ONE MEASURED CAVEAT, stated because it is a real difference and not a rounding
// story: on those 2 NaN outputs the machine returns the SSE invalid-operation
// default QNaN, which is NEGATIVE (0xfff8000000000000), while the port yields
// the positive 0x7ff8000000000000. That is a JavaScript limit, not a
// transcription error — ECMAScript permits an implementation to canonicalise
// NaN on a Float64Array store and V8 does, so no JS program can produce or
// observe a NaN's sign through a double. Every non-NaN output, infinities
// included, matches bit-for-bit. The harness reports those cases separately as
// NAN_SIGN_ONLY rather than hiding them in a tolerance.

/**
 * `PCVector2<double>` — two doubles, x at +0x00 and y at +0x08, loaded 16 bytes
 * at a time with `movupd` (UNALIGNED, so the callers do not guarantee alignment).
 * Declared locally, as the landed PCMatrix44Tmpl.ts / PCRect_double.ts do: the
 * template class itself is not ported.
 */
export interface PCVector2Double {
  x: number;
  y: number;
}

/** The affine-vs-projective threshold. @ProCore 0x123610 (1e-07, splat x2). */
const PROJECTION_EPSILON = 1e-7; // @ProCore 0x123610

/**
 * `PCProjectionMapSquareToQuad(A, B, C, D, uv, out)` — @ProCore 0x678d6.
 *
 * Maps the point `uv` in the unit square through the projective transform that
 * carries the square's corners onto A, B, C, D, writing the result into `out`.
 * See the file header for the instruction-by-instruction decode.
 *
 * @param a   corner A (SysV %rdi) — the map's origin.
 * @param b   corner B (SysV %rsi).
 * @param c   corner C (SysV %rdx).
 * @param d   corner D (SysV %rcx).
 * @param uv  the point to map (SysV %r8); `.x` is u, `.y` is v.
 * @param out the destination reference (SysV %r9); both fields are always written.
 */
export function PCProjectionMapSquareToQuad( // @ProCore 0x678d6
  a: PCVector2Double,
  b: PCVector2Double,
  c: PCVector2Double,
  d: PCVector2Double,
  uv: PCVector2Double,
  out: PCVector2Double,
): void {
  // @0x678ea..@0x678f6 — S = A - B + C - D, computed packed, lane by lane here.
  const sx = a.x - b.x + c.x - d.x;
  const sy = a.y - b.y + c.y - d.y;

  // @0x678fa..@0x67916 — |S| < 1e-7 in BOTH lanes (movmskpd == 3) selects the
  //   affine path. `andpd` with 0x7fff… is exactly Math.abs for every value
  //   except that it also clears the sign of a NaN, which cannot change a
  //   `cmpltpd` result (a NaN compares false either way).
  const affine =
    Math.abs(sx) < PROJECTION_EPSILON && Math.abs(sy) < PROJECTION_EPSILON;

  let g: number;
  let h: number;
  let m1x: number;
  let m1y: number;
  let m2x: number;
  let m2y: number;

  if (affine) {
    // @0x67938/@0x6793c — xorpd: the projective coefficients are exactly zero.
    g = 0;
    h = 0;
    // @0x67934 — m1 = (B.x - A.x, C.y - B.y)
    m1x = b.x - a.x;
    m1y = c.y - b.y;
    // @0x6792c — m2 = (C.x - B.x, B.y - A.y)
    m2x = c.x - b.x;
    m2y = b.y - a.y;
  } else {
    // @0x67976/@0x67995 — det = (D.y-C.y)(B.x-C.x) - (B.y-C.y)(D.x-C.x), formed
    //   as a packed product then `hsubpd`. No guard: a degenerate quad divides
    //   by zero here in the machine too, yielding +-inf or NaN, and the port
    //   reproduces that rather than inventing a fallback.
    const det = (d.y - c.y) * (b.x - c.x) - (b.y - c.y) * (d.x - c.x);
    // @0x6798c..@0x679a1 — the two numerators, then divpd.
    g = ((d.y - c.y) * sx - (d.x - c.x) * sy) / det;
    h = ((b.x - c.x) * sy - (b.y - c.y) * sx) / det;
    // @0x679b6/@0x679ba — m1 = (g*B.x + (B.x - A.x), h*D.y + (D.y - A.y))
    m1x = g * b.x + (b.x - a.x);
    m1y = h * d.y + (d.y - a.y);
    // @0x679ae/@0x679b2 — m2 = (h*D.x + (D.x - A.x), g*B.y + (B.y - A.y))
    m2x = h * d.x + (d.x - a.x);
    m2y = g * b.y + (b.y - a.y);
  }

  // @0x679cb/@0x679d0 — u and v are loaded as SCALARS from the fifth argument.
  const u = uv.x;
  const v = uv.y;

  // @0x679d6..@0x679e2 — den = g*u + h*v + 1.0 (the 1.0 is the constant at
  //   @ProCore 0x122530, added last, exactly as the machine orders it).
  const den = g * u + h * v + 1.0;

  // @0x679ea..@0x679fe — out.x uses the LOW lanes of m1 and m2.
  out.x = (u * m1x + v * m2x + a.x) / den;
  // @0x67a03..@0x67a26 — out.y uses the HIGH lane of m2 first, then of m1.
  out.y = (u * m2y + v * m1y + a.y) / den;
}
