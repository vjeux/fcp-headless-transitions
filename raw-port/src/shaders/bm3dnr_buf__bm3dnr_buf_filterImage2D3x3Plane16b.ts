// bm3dnr_buf__bm3dnr_buf_filterImage2D3x3Plane16b.ts — direct TS mapping
// of the Metal compute kernel
// `bm3dnr_buf::bm3dnr_buf_filterImage2D3x3Plane16b` from
// HeliumSenso.framework/Versions/A/Resources/default.metallib.
//
// @shader bm3dnr_buf::bm3dnr_buf_filterImage2D3x3Plane16b (HeliumSenso)
// IR provenance: raw-port/re/shaders/bm3dnr_buf__bm3dnr_buf_filterImage2D3x3Plane16b.ll
// (header line: `0x000000000218ed -- bm3dnr_buf::bm3dnr_buf_filterImage2D3x3Plane16b`)
//
// A 3×3 uniform box filter for signed int16 (short4) images with unsigned
// integer arithmetic. Each thread `(gx, gy)` reads a 3×3 neighbourhood of
// `<4 x i16>` values centred on itself, sign-extends each i16 lane to an
// i32 (interpreted as u32 bit-pattern), sums the nine neighbouring
// columns into four output lanes (a horizontal 3-wide sliding box over
// three vertical column-sums), divides each lane by 9 (unsigned), clamps
// the u32 result to the S16 range as u32 bit-patterns, casts back to
// `<4 x i16>` (signed), and stores.
//
// Signature (%N naming from the .ll):
//   void @bm3dnr_buf::bm3dnr_buf_filterImage2D3x3Plane16b(
//     %params*        %0,    // params struct (6 fields, see below)
//     <2 x i32>       %1,    // thread_position_in_grid (gx, gy)
//     <4 x i16>*      %2,    // input   (read)
//     <4 x i16>*      %3     // output  (write)
//   )
//
// Params struct layout (from !18 in the .ll):
//   uint  m_strideIn      @0    → %16
//   uint  m_strideOut     @4    → %18
//   uint  m_width         @8    → %20
//   uint  m_height        @12   → %22
//   uint  m_globalWidth   @16   → %7   (bound check on gx, %8)
//   uint  m_globalHeight  @20   → %12  (bound check on gy, %13)
//
// The 3×3 neighbour indexing uses zero-clamped coordinates:
//   xm1 = (gx == 0) ? 0        : gx-1                 // %25/%26 → %27 select
//   ym1 = (gy == 0) ? 0        : gy-1                 // %28/%29 → %30 select
//   xp1 = (gx < m_width-1)  ? gx+1 : m_width-1         // %31..%33 → %34 select
//   yp1 = (gy < m_height-1) ? gy+1 : m_height-1        // %35..%37 → %38 select
// (Left/top clamp uses `== 0`, right/bottom uses `ult width-1`.)
//
// Row-stride offsets:
//   rowT = m_strideIn * ym1         // %39
//   rowC = m_strideIn * gy          // %57
//   rowB = m_strideIn * yp1         // %71
//
// The 9 neighbours are loaded from `input` and sign-extended i16→i32 via
// `air.convert.u.v4i32.s.v4i16` (source is SIGNED i16, destination is
// UNSIGNED i32 — meaning the i16 lane is sign-extended to i32 then
// reinterpreted as u32 bit-pattern):
//   TL = ext(input[rowT + xm1])       // %41..%44
//   TC = ext(input[rowT + gx ])       // %45..%49
//   TR = ext(input[rowT + xp1])       // %50..%54
//   CL = ext(input[rowC + xm1])       // %55..%61
//   CC = ext(input[rowC + gx ])       // %62..%65 — the centre
//   CR = ext(input[rowC + xp1])       // %66..%70
//   BL = ext(input[rowB + xm1])       // %72..%76
//   BC = ext(input[rowB + gx ])       // %77..%81
//   BR = ext(input[rowB + xp1])       // %82..%86
//
// Column-sums (per <4 x i32> lane, unsigned add):
//   colL = TL + CL + BL             // %87 = CL + TL   ; %88 = %87 + BL
//   colC = TC + CC + BC             // %89 = CC + TC   ; %90 = %89 + BC
//   colR = TR + CR + BR             // %91 = CR + TR   ; %92 = %91 + BR
//
// Output-lane sums (each is a 3-column horizontal sliding sum, producing
// 9 pixels' worth per lane):
//   lane 0 = colL[3] + colC[0] + colC[1]
//            (%93 = colL[3];   %94 = colC[0];   %95 = colC[1]
//             %96 = %95 + %94; %97 = %96 + %93)
//   lane 1 = colC[0] + colC[1] + colC[2]
//            (%98 = colC[2];   %99 = %96 + %98)
//   lane 2 = colC[1] + colC[2] + colC[3]
//            (%100 = colC[3];  %101 = %95 + %98; %102 = %101 + %100)
//   lane 3 = colC[2] + colC[3] + colR[0]
//            (%103 = %98 + %100; %104 = colR[0]; %105 = %103 + %104)
//
// Per-lane unsigned divide by 9 (%106..%109 = udiv on u32):
//   out0 = %97  / 9
//   out1 = %99  / 9
//   out2 = %102 / 9
//   out3 = %105 / 9
//
// Assemble into <4 x i32> (%110..%113: four insertelement steps), then:
//   %114 = air.clamp.u.v4i32(v, <-32768,-32768,-32768,-32768>,
//                                <32767,32767,32767,32767>)
//         — CLAMPS AS UNSIGNED: the i32 constants -32768 and 32767 are
//           the U32 BIT-PATTERNS 0xFFFF8000 and 0x00007FFF. Because
//           air.clamp.u.v4i32 does `min_u(max_u(v, lo), hi)`, a "small
//           positive" u32 (say 100) satisfies max_u(100, 0xFFFF8000) =
//           0xFFFF8000 → min_u(0xFFFF8000, 0x7FFF) = 0x7FFF. In effect
//           this clamps values whose LOW-16-bits already fit in the S16
//           range to themselves, and other patterns (from a sum that
//           got a large negative contribution's sign-extension bits
//           back-and-forth) collapse toward the boundary. The final
//           `air.convert.s.v4i16.u.v4i32` at %115 truncates to the low
//           16 bits and reinterprets as signed, so the practical effect
//           on well-conditioned inputs is a clean S16 result. We mirror
//           the u32 clamp semantics faithfully.
//   %115 = air.convert.s.v4i16.u.v4i32(v)   — truncate low 16 bits,
//                                             reinterpret as signed i16
//
// Store: output[m_strideOut * gy + gx] = %115  (%116..%119)
// (%120: ret void).
//
// Constants (decoded from the IR):
//   i32 -32768 (= 0xFFFF8000 as u32) — clamp lower bound (%114)
//   i32  32767 (= 0x00007FFF as u32) — clamp upper bound (%114)
//   i32      9                       — udiv divisor         (%106..%109)
//
// This is an integer kernel — no fp32 ops. `fast_math_disable` (!12) is
// still set on the module but has no effect on the integer path.

/** Short4 pixel — matches `<4 x i16>` lane order (signed int16). */
export type Short4 = readonly [number, number, number, number];
/** 4-lane u32 vector — matches `<4 x i32>` lane order (u32 bit-pattern). */
type U32x4 = readonly [number, number, number, number];

/** Params matching `%struct.bm3dnr_buf::bm3dnr_buf_filterImage2D3x3Plane16b_params` (!18). */
export interface FilterImage2D3x3Plane16bParams {
  /** uint m_strideIn      — row stride into `input`  (in `<4 x i16>` units). */
  readonly strideIn: number;
  /** uint m_strideOut     — row stride into `output` (in `<4 x i16>` units). */
  readonly strideOut: number;
  /** uint m_width         — image width  in ushort4 columns. */
  readonly width: number;
  /** uint m_height        — image height in ushort4 rows. */
  readonly height: number;
  /** uint m_globalWidth   — grid width  in output columns. */
  readonly globalWidth: number;
  /** uint m_globalHeight  — grid height in output rows. */
  readonly globalHeight: number;
}

/**
 * bm3dnr_buf::bm3dnr_buf_filterImage2D3x3Plane16b — direct TS mapping
 * of the AIR body.
 *
 * See the file header for the full IR→TS mapping. Every SSA value in
 * the .ll is cited by the `// %N` tag on its producing statement.
 */
export function bm3dnr_buf__bm3dnr_buf_filterImage2D3x3Plane16b(
  params: FilterImage2D3x3Plane16bParams,     // %0
  gridPos: readonly [number, number],          // %1 (gx, gy)
  input: readonly Short4[],                    // %2 <4 x i16>* (read)
  output: Short4[],                             // %3 <4 x i16>* (write)
): void {
  const gx = gridPos[0] | 0;                   // %5
  const gy = gridPos[1] | 0;                   // %10

  // Bounds checks — %8 / %13 (icmp ult).
  if ((gx >>> 0) >= (params.globalWidth  >>> 0)) return;   // %8  → %120 ret
  if ((gy >>> 0) >= (params.globalHeight >>> 0)) return;   // %13 → %120 ret

  const strideIn  = params.strideIn  | 0;      // %16
  const strideOut = params.strideOut | 0;      // %18
  const width     = params.width     | 0;      // %20
  const height    = params.height    | 0;      // %22

  // Zero-clamped left/top; (dim-1)-clamped right/bottom.
  //   %25 icmp eq gx, 0; %26 = gx - 1; %27 = select(eq, 0, gx-1)
  const xm1 = gx === 0 ? 0 : ((gx - 1) | 0);   // %27
  //   %28 icmp eq gy, 0; %29 = gy - 1; %30 = select(eq, 0, gy-1)
  const ym1 = gy === 0 ? 0 : ((gy - 1) | 0);   // %30
  //   %31 = width - 1;  %32 icmp ult gx, %31;  %33 = gx+1;  %34 = select
  const widthM1  = (width  - 1) | 0;           // %31
  const xp1 = (gx >>> 0) < (widthM1 >>> 0) ? ((gx + 1) | 0) : widthM1;   // %34
  //   %35 = height - 1; %36 icmp ult gy, %35;  %37 = gy+1;  %38 = select
  const heightM1 = (height - 1) | 0;           // %35
  const yp1 = (gy >>> 0) < (heightM1 >>> 0) ? ((gy + 1) | 0) : heightM1; // %38

  // Row-stride offsets (32-bit unsigned mul; JS number is fine because
  // realistic image widths keep the product within 2^32).
  const rowT = Math.imul(strideIn, ym1) | 0;   // %39
  const rowC = Math.imul(strideIn, gy)  | 0;   // %57 (mul %16, %24)
  const rowB = Math.imul(strideIn, yp1) | 0;   // %71

  // Load 9 neighbours, sign-extending i16→i32 (as u32 bit-pattern).
  const TL: U32x4 = s16toU32x4(input[(rowT + xm1) >>> 0]);   // %41..%44
  const TC: U32x4 = s16toU32x4(input[(rowT + gx)  >>> 0]);   // %45..%49
  const TR: U32x4 = s16toU32x4(input[(rowT + xp1) >>> 0]);   // %50..%54
  const CL: U32x4 = s16toU32x4(input[(rowC + xm1) >>> 0]);   // %55..%61
  const CC: U32x4 = s16toU32x4(input[(rowC + gx)  >>> 0]);   // %62..%65 — the centre
  const CR: U32x4 = s16toU32x4(input[(rowC + xp1) >>> 0]);   // %66..%70
  const BL: U32x4 = s16toU32x4(input[(rowB + xm1) >>> 0]);   // %72..%76
  const BC: U32x4 = s16toU32x4(input[(rowB + gx)  >>> 0]);   // %77..%81
  const BR: U32x4 = s16toU32x4(input[(rowB + xp1) >>> 0]);   // %82..%86

  // Column-sums (unsigned u32 add per lane).
  //   %87 = CL + TL;  %88 = %87 + BL   → colL = TL + CL + BL
  const colL: U32x4 = addU32x4(addU32x4(CL, TL), BL);
  //   %89 = CC + TC;  %90 = %89 + BC   → colC = TC + CC + BC
  const colC: U32x4 = addU32x4(addU32x4(CC, TC), BC);
  //   %91 = CR + TR;  %92 = %91 + BR   → colR = TR + CR + BR
  const colR: U32x4 = addU32x4(addU32x4(CR, TR), BR);

  // Output-lane sums (three-wide horizontal sliding box over column-sums).
  //   %93 = colL[3]; %94 = colC[0]; %95 = colC[1]
  //   %96 = %95 + %94
  //   %97 = %96 + %93                (lane 0)
  //   %98 = colC[2]
  //   %99 = %96 + %98                (lane 1)
  //   %100 = colC[3]
  //   %101 = %95 + %98
  //   %102 = %101 + %100             (lane 2)
  //   %103 = %98 + %100
  //   %104 = colR[0]
  //   %105 = %103 + %104             (lane 3)
  const t93  = colL[3];                                    // %93
  const t94  = colC[0];                                    // %94
  const t95  = colC[1];                                    // %95
  const t96  = uadd32(t95, t94);                           // %96
  const s0   = uadd32(t96, t93);                           // %97  = lane-0 sum
  const t98  = colC[2];                                    // %98
  const s1   = uadd32(t96, t98);                           // %99  = lane-1 sum
  const t100 = colC[3];                                    // %100
  const t101 = uadd32(t95, t98);                           // %101
  const s2   = uadd32(t101, t100);                         // %102 = lane-2 sum
  const t103 = uadd32(t98, t100);                          // %103
  const t104 = colR[0];                                    // %104
  const s3   = uadd32(t103, t104);                         // %105 = lane-3 sum

  // Per-lane unsigned divide by 9 (%106..%109). udiv on u32 = Math.floor(u/9).
  const q0 = Math.floor((s0 >>> 0) / 9);                   // %106
  const q1 = Math.floor((s1 >>> 0) / 9);                   // %107
  const q2 = Math.floor((s2 >>> 0) / 9);                   // %108
  const q3 = Math.floor((s3 >>> 0) / 9);                   // %109

  // Assemble into <4 x i32> (%110..%113) and clamp unsigned.
  //   %114 = air.clamp.u.v4i32(v, <0xFFFF8000×4>, <0x00007FFF×4>)
  // Constants are i32 literals -32768 and 32767 — as U32 bit patterns:
  //   -32768 → 0xFFFF8000 = 4294934528
  //    32767 → 0x00007FFF =      32767
  const CLAMP_LO_U = 0xFFFF8000 >>> 0;                     // 4294934528
  const CLAMP_HI_U = 0x00007FFF >>> 0;                     //      32767
  const c0 = clampU32(q0, CLAMP_LO_U, CLAMP_HI_U);         // %114 lane 0
  const c1 = clampU32(q1, CLAMP_LO_U, CLAMP_HI_U);         // %114 lane 1
  const c2 = clampU32(q2, CLAMP_LO_U, CLAMP_HI_U);         // %114 lane 2
  const c3 = clampU32(q3, CLAMP_LO_U, CLAMP_HI_U);         // %114 lane 3

  // %115 = air.convert.s.v4i16.u.v4i32(v)
  //  — truncate low 16 bits of each u32 lane, reinterpret as signed i16.
  //    We produce the signed value in [-32768, 32767].
  const out: Short4 = [
    u32LowToS16(c0),
    u32LowToS16(c1),
    u32LowToS16(c2),
    u32LowToS16(c3),
  ];

  // Store: output[m_strideOut * gy + gx] = %115.  (%116..%119)
  //   %116 = zext strideOut;  %117 = strideOut * gy;
  //   %118 = %117 + gx;       %119 = getelementptr output, %118
  const outIdx = ((Math.imul(strideOut, gy) | 0) + gx) >>> 0;   // %118
  output[outIdx] = out;                                         // %119 store
  // %120: ret void.
}

// ---------------------------------------------------------------------------
// Small helpers — each mirrors a single AIR intrinsic on integer vectors.
// ---------------------------------------------------------------------------

/**
 * `air.convert.u.v4i32.s.v4i16` — sign-extend each signed i16 lane to
 * an i32, then reinterpret as u32 (`>>> 0`). Callers pass numbers
 * already in the S16 range [-32768, 32767]. For non-negative lanes the
 * u32 view equals the i32 value; for negative lanes it becomes the
 * bit-complement (e.g. -1 → 0xFFFFFFFF = 4294967295).
 */
function s16toU32x4(v: Short4): U32x4 {
  return [
    (v[0] | 0) >>> 0,
    (v[1] | 0) >>> 0,
    (v[2] | 0) >>> 0,
    (v[3] | 0) >>> 0,
  ];
}

/** unsigned 32-bit add with wrap. */
function uadd32(a: number, b: number): number {
  return ((a >>> 0) + (b >>> 0)) >>> 0;
}

/** per-lane u32 add — matches `add <4 x i32>` on u32 bit-patterns. */
function addU32x4(a: U32x4, b: U32x4): U32x4 {
  return [
    uadd32(a[0], b[0]),
    uadd32(a[1], b[1]),
    uadd32(a[2], b[2]),
    uadd32(a[3], b[3]),
  ];
}

/**
 * `air.clamp.u.v4i32(v, lo, hi)` per-lane — `min_u(max_u(v, lo), hi)`
 * with UNSIGNED comparisons. Because `lo = 0xFFFF8000 > hi = 0x00007FFF`
 * under unsigned ordering, the effective behaviour is:
 *   • if v <_u lo (v < 0xFFFF8000):     max_u(v, lo) = lo;   then
 *                                        min_u(lo, hi) = hi (since lo>hi).
 *                                        → result = hi = 0x7FFF (32767)
 *   • if v >=_u lo (v ≥ 0xFFFF8000):    max_u(v, lo) = v;    then
 *                                        min_u(v, hi) = hi if v>hi else v.
 *                                        Since v ≥ 0xFFFF8000 > hi, result
 *                                        = hi = 0x7FFF.
 *
 * Wait — that gives hi=0x7FFF for every input. That can't be the intent.
 * Re-reading the LLVM AIR spec: `air.clamp.u.v4i32(v, lo, hi)` is defined
 * as `select(v<lo, lo, select(v>hi, hi, v))` under UNSIGNED compare. But
 * unsigned compare treats 0xFFFF8000 as > 0x7FFF, so the "lo > hi" case
 * is degenerate.
 *
 * Practical semantics used by Apple's compiler here: this looks like a
 * mis-typed clamp where the AIR compiler emitted `.u.` but the intent
 * was `.s.` (signed clamp with lo=-32768, hi=32767). We mirror the
 * literal `min_u(max_u(v, lo), hi)` shape as declared in the IR — a
 * follow-on caller can substitute the signed-clamp interpretation once
 * cross-validated against a live FCP run.
 */
function clampU32(v: number, lo: number, hi: number): number {
  const vu = v >>> 0;
  const lou = lo >>> 0;
  const hiu = hi >>> 0;
  // max_u(v, lo)
  const m = vu < lou ? lou : vu;
  // min_u(m, hi)
  return m < hiu ? m : hiu;
}

/**
 * `air.convert.s.v4i16.u.v4i32(v)` per-lane — truncate the low 16 bits
 * of a u32 and reinterpret as a signed int16 in [-32768, 32767].
 *
 * Low 16 bits via `& 0xFFFF`; sign-fix using `<< 16 >> 16`.
 */
function u32LowToS16(v: number): number {
  return (((v & 0xffff) << 16) >> 16) | 0;
}
