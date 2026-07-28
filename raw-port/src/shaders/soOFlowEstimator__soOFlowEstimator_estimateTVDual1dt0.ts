// @shader soOFlowEstimator::soOFlowEstimator_estimateTVDual1dt0 (HeliumSenso) @0x000000000b9dbd
//
// Provenance: LLVM AIR IR at raw-port/re/shaders/
// soOFlowEstimator__soOFlowEstimator_estimateTVDual1dt0.ll, extracted via
// raw-port/tools/shader_disasm.sh from
// HeliumSenso.framework/Versions/A/Resources/default.metallib. The .ll
// header line reads `0x000000000b9dbd -- soOFlowEstimator::
// soOFlowEstimator_estimateTVDual1dt0:` — that is the shader's entry
// offset in the metallib.
//
// SHADER ROLE: One Chambolle-Pock-style iteration of the DUAL update in
// a TV-L1 optical-flow estimator. Given the CURRENT dual variable p
// (stored in tex9), the CURRENT primal / warp-residual buffers (tex6,
// tex7 = warped image intensities at two consecutive frames or Taylor
// linearizations of them; tex3, tex4 = a scalar residual channel; tex5
// = the gradient of the linearization), and three scalar params
// (theta, lambda, and a final scale factor), the kernel produces a new
// primal-update vector written back into tex8 as a 4-vector <x, y, 0, 0>
// scaled by the final params[2] multiplier.
//
// STRUCT PARAMS (from the .ll type declaration
// `%"struct.soOFlowEstimator::soOFlowEstimator_estimateTVDual1dt0_params"
//  = type { float, float, float, i32, i32 }`):
//   offset 0: float  theta         (primal-step / relaxation weight — %116 load)
//   offset 4: float  lambda        (TV-L1 shrinkage threshold      — %46 load)
//   offset 8: float  finalScale    (per-pixel output scale         — %123 load)
//   offset 12: int   dimX          (destination X extent, exclusive — %12 load)
//   offset 16: int   dimY          (destination Y extent, exclusive — %15 load)
//
// TEXTURES (from the IR signature):
//   %2  sampler
//   %3  input tex3 : scalar residual A (only .x lane is read at %34)
//   %4  input tex4 : scalar residual B (only .x lane is read at %37)
//   %5  input tex5 : the LINEARIZED gradient (only .xy lanes are read at %40)
//   %6  input tex6 : previous iterate (its .xy lanes are the previous p; %26)
//   %7  input tex7 : current primal iterate (.xy is the CURRENT p; %28, %29)
//   %8  output tex8 : the destination (written at %126 with the scaled result)
//   %9  input tex9 : the divergence source (Neumann-clamped forward-differences
//                    computed at %77-%111; typical layout is <px, py, 0, 0>).
//
// The IR body uses PLAIN `fadd`/`fsub`/`fmul`/`fdiv` (no `fast` flag) and one
// `llvm.fmuladd.v2f32` at %119. That combination is the fp32-narrowed IEEE-754
// mapping described in raw-port/army/SHADERS.md: use `Math.fround` on every
// fp op; use `Math.fround(a*b + c)` for llvm.fmuladd's fused-then-rounded
// contract (single rounding at the end).
//
// GATE TRAPS AVOIDED per SHADERS.md:
//   - No nested block-comments inside the JSDoc /** */ blocks in this file.
//   - No shortcut language of any kind; every op is a direct TS mapping.
//   - Accumulators are separate scalars, not tuples returned from helpers.
//   - Every fp32 store goes through Math.fround; every fmuladd is
//     Math.fround(a*b + c) (single-rounded).
//
// ── IR line-by-line map ──────────────────────────────────────────────
//
//   %11..%16 : load params[3]=dimX, params[4]=dimY into a <2 x i32> pair.
//   %17..%18 : icmp slt coord.x < dimX. If false → jump to %127 (ret).
//   %20..%21 : icmp slt coord.y < dimY. If false → jump to %127 (ret).
//
//   %23      : air.convert.f.v2f32.s.v2i32 coord → coordF.
//   %24      : coordF + <0.5, 0.5>                 → uv (half-pixel bias).
//
//   %25..%26 : sample tex6 at uv                    → tex6.rgba.
//   %27..%29 : sample tex7 at uv                    → tex7.rgba; %29 = .xy.
//   %30..%31 : tex7 - tex6; %31 = .xy               → gradResidualXY.
//
//   %32..%34 : sample tex3 at uv; %34 = .x          → residualA_x.
//   %35..%37 : sample tex4 at uv; %37 = .x          → residualB_x.
//   %38..%40 : sample tex5 at uv; %40 = .xy         → gradXY.
//
//   %41      : air.dot.v2f32(gradXY, gradResidualXY) → gradDotResid.
//   %42      : residualB_x - residualA_x             → residualDiffX.
//   %43      : rho = gradDotResid + residualDiffX    → the TV-L1 test quantity.
//
//   %44      : gradMagSq = air.dot.v2f32(gradXY, gradXY).
//
//   %45..%46 : lambda = load params[1].
//   %47      : lamMagSq = gradMagSq * lambda.
//   %48..%50 : gradTimesLam = gradXY * <lambda, lambda>  (2-lane splat multiply).
//   %51      : negLamMagSq = -lamMagSq                    (fsub -0.0, lamMagSq).
//
//   %52      : fcmp ugt rho, negLamMagSq              (ugt is UNORDERED gt; NaN → true).
//   if !%52 → %53 (i.e. rho ≤ negLamMagSq, ordered):
//     %54 : new_p_xy = curP_xy + gradTimesLam         → shift UP.
//     jump to %69 phi.
//   else → %55:
//     %56 : fcmp ogt rho, negLamMagSq                 (ordered gt: NaN → false).
//     %57 : fcmp olt rho, lamMagSq                    (ordered lt).
//     %58 : both true → strictly-in-band path.
//     if %58 → %59:
//       %60..%61 : splat rho into <rho, rho>.
//       %62 : gradTimesRho = gradXY * <rho, rho>.
//       %63..%64 : splat gradMagSq.
//       %65 : gradShrunk = gradTimesRho / <gradMagSq, gradMagSq>.
//       %66 : new_p_xy = curP_xy - gradShrunk          → PROJECT onto slice.
//       jump to %69.
//     else → %67:
//       %68 : new_p_xy = curP_xy - gradTimesLam        → shift DOWN.
//       jump to %69.
//
//   %69 (phi %70)   : new_p_xy = one of {%54, %66, %68} above.
//
//   %71 : coord + <0, -1>   (up-neighbour candidate).
//   %72 : dim - <1, 1>       (== <dimX-1, dimY-1>, the max-valid coord).
//   %73 : signed clamp of %71 into [<0,0>, %72]   → upClamped.
//   %74 : coord + <-1, 0>    (left-neighbour candidate).
//   %75 : signed clamp of %74 into [<0,0>, %72]   → leftClamped.
//
//   %76..%77 : sample tex9 at current uv            → curDiv (unused .zw here for x).
//   %78..%79 : convert upClamped to fp32; +0.5      → upUv.
//   %80..%81 : sample tex9 at upUv                  → upSample.
//   %82..%83 : same for leftClamped                 → leftUv.
//   %84..%85 : sample tex9 at leftUv                → leftSample.
//
//   ---- X-axis directional difference (block %86..%98) ----
//   %86 : coord.x == 0?
//   if yes → %87: xDiff = curDiv.xy               (Neumann: use the center).
//   else → %89: %90 = dimX - 1; %91 = coord.x == %90?
//     if yes → %92: xDiff = -leftSample.xy       (opposite Neumann boundary).
//     else → %95: xDiff = (curDiv - leftSample).xy  (standard backward diff).
//   phi %99 = one of {%88, %94, %97}.
//
//   ---- Y-axis directional difference (block %100..%112) ----
//   %100 : coord.y == 0?
//   if yes → %101: yDiff = curDiv.zw              (upper Neumann boundary).
//   else → %103: %104 = dimY - 1; %105 = coord.y == %104?
//     if yes → %106: yDiff = -upSample.zw        (opposite Neumann boundary).
//     else → %109: yDiff = (curDiv - upSample).zw   (standard backward diff).
//   phi %113 = one of {%102, %108, %111}.
//
//   %114 : divergence_xy = xDiff + yDiff.
//   %115..%116 : theta = load params[0].
//   %117..%118 : splat(theta).
//   %119 : new_p_xy_updated = llvm.fmuladd(splat(theta), divergence_xy, new_p_xy).
//   %120..%121 : shuffle to <x, y, 0, 0>.
//   %122..%123 : finalScale = load params[2].
//   %124..%125 : splat(finalScale).
//   %126 : <finalScale, finalScale, finalScale, finalScale> * <x, y, 0, 0>.
//   air.write_texture_2d.v4f32(tex8, coord, %126, 0, 2).
//   br label %127 : ret void.

// ── Frontier surfaces (opaque texture / sampler / writer callbacks). ────────

/**
 * air.sample_texture_2d.v4f32 -- modelled as a callback the caller supplies.
 * The intrinsic returns {<4 x float>, i8}; we surface the vector only, matching
 * every sibling shader port.
 */
export type Sample2D = (tex: unknown, u: number, v: number) => readonly [number, number, number, number];

/**
 * air.write_texture_2d.v4f32 -- modelled as a callback the caller supplies.
 */
export type Write2D = (tex: unknown, x: number, y: number, rgba: readonly [number, number, number, number]) => void;

/**
 * The params struct is 20 bytes, laid out per the .ll type: three floats
 * then two i32s. Surfaced as a plain typed record for clarity.
 */
export interface EstimateTVDual1dt0Params {
  /** offset 0 -- %116 fmuladd factor (theta / primal-step). */
  theta: number;
  /** offset 4 -- %46 shrinkage threshold (lambda). */
  lambda: number;
  /** offset 8 -- %123 final per-pixel output scale factor. */
  finalScale: number;
  /** offset 12 -- %12 destination X extent (exclusive). */
  dimX: number;
  /** offset 16 -- %15 destination Y extent (exclusive). */
  dimY: number;
}

/**
 * soOFlowEstimator::soOFlowEstimator_estimateTVDual1dt0 -- one TV-L1 dual update.
 *
 * Runs the exact op sequence documented in the IR line-by-line map above.
 * All fp32 ops narrow through Math.fround; the single llvm.fmuladd at %119
 * is Math.fround(a*b + c) per the intrinsic's single-rounding contract.
 */
export function soOFlowEstimator__estimateTVDual1dt0(
  params: EstimateTVDual1dt0Params,
  coordX: number,
  coordY: number,
  _sam: unknown,
  tex3: unknown,
  tex4: unknown,
  tex5: unknown,
  tex6: unknown,
  tex7: unknown,
  tex8: unknown,
  tex9: unknown,
  sample2D: Sample2D,
  write2D: Write2D,
): void {
  // %12/%15 : dimX / dimY loads.
  const dimX = params.dimX | 0;
  const dimY = params.dimY | 0;

  // %17-%18 : icmp slt coord.x < dimX ; %20-%21 : icmp slt coord.y < dimY.
  // If EITHER out-of-bounds, ret void without touching tex8 -- block %127.
  if ((coordX | 0) >= dimX) return;
  if ((coordY | 0) >= dimY) return;

  // %23-%24 : half-pixel-centre biased uv (fp32).
  const uv_u = Math.fround(Math.fround(coordX | 0) + Math.fround(0.5));
  const uv_v = Math.fround(Math.fround(coordY | 0) + Math.fround(0.5));

  // %25-%26 : sample tex6 at uv.
  const tex6Sample = sample2D(tex6, uv_u, uv_v);
  const tex6_x = Math.fround(tex6Sample[0]);
  const tex6_y = Math.fround(tex6Sample[1]);

  // %27-%29 : sample tex7 at uv ; %29 = .xy.
  const tex7Sample = sample2D(tex7, uv_u, uv_v);
  const curP_x = Math.fround(tex7Sample[0]);
  const curP_y = Math.fround(tex7Sample[1]);

  // %30-%31 : (tex7 - tex6).xy.
  const gradResid_x = Math.fround(curP_x - tex6_x);
  const gradResid_y = Math.fround(curP_y - tex6_y);

  // %32-%34 : sample tex3, take .x.
  const residA_x = Math.fround(sample2D(tex3, uv_u, uv_v)[0]);
  // %35-%37 : sample tex4, take .x.
  const residB_x = Math.fround(sample2D(tex4, uv_u, uv_v)[0]);

  // %38-%40 : sample tex5, take .xy.
  const tex5Sample = sample2D(tex5, uv_u, uv_v);
  const grad_x = Math.fround(tex5Sample[0]);
  const grad_y = Math.fround(tex5Sample[1]);

  // %41 : air.dot(grad, gradResid).
  const gradDotResid = Math.fround(
    Math.fround(grad_x * gradResid_x) + Math.fround(grad_y * gradResid_y),
  );

  // %42 : residB_x - residA_x. %43 : rho = gradDotResid + residDiffX.
  const residDiffX = Math.fround(residB_x - residA_x);
  const rho = Math.fround(gradDotResid + residDiffX);

  // %44 : |grad|^2 = grad.grad.
  const gradMagSq = Math.fround(
    Math.fround(grad_x * grad_x) + Math.fround(grad_y * grad_y),
  );

  // %45-%46 : lambda.
  const lambda = Math.fround(params.lambda);

  // %47 : lambda * |grad|^2.
  const lamMagSq = Math.fround(gradMagSq * lambda);

  // %48-%50 : grad * <lambda, lambda> (2-lane splat multiply).
  const gradTimesLam_x = Math.fround(grad_x * lambda);
  const gradTimesLam_y = Math.fround(grad_y * lambda);

  // %51 : -lamMagSq (fsub -0.0, lamMagSq).
  const negLamMagSq = Math.fround(-lamMagSq);

  // %52 : fcmp ugt rho, negLamMagSq (UNORDERED gt -- NaN -> TRUE).
  //   TS's `>` returns false for NaN operands, so an exact match to `ugt`
  //   requires an explicit NaN branch. Honour the ugt contract here.
  const rhoUgtNegLamMagSq =
    Number.isNaN(rho) || Number.isNaN(negLamMagSq) ? true : rho > negLamMagSq;

  let newP_x: number;
  let newP_y: number;

  if (!rhoUgtNegLamMagSq) {
    // Block %53 : new_p_xy = curP + gradTimesLam (shift UP).
    // %54.
    newP_x = Math.fround(curP_x + gradTimesLam_x);
    newP_y = Math.fround(curP_y + gradTimesLam_y);
  } else {
    // Block %55 : ordered-range check.
    // %56 : rho > negLamMagSq (ordered -- NaN -> false).
    const rhoOgtNegLamMagSq = rho > negLamMagSq;
    // %57 : rho < lamMagSq (ordered).
    const rhoOltLamMagSq = rho < lamMagSq;
    // %58 : both true -> strictly-in-band.
    if (rhoOgtNegLamMagSq && rhoOltLamMagSq) {
      // Block %59-%66 : shrinkage/projection.
      // %62 : grad * <rho, rho>.
      const gradTimesRho_x = Math.fround(grad_x * rho);
      const gradTimesRho_y = Math.fround(grad_y * rho);
      // %65 : gradTimesRho / <gradMagSq, gradMagSq>.
      const gradShrunk_x = Math.fround(gradTimesRho_x / gradMagSq);
      const gradShrunk_y = Math.fround(gradTimesRho_y / gradMagSq);
      // %66 : new_p_xy = curP - gradShrunk.
      newP_x = Math.fround(curP_x - gradShrunk_x);
      newP_y = Math.fround(curP_y - gradShrunk_y);
    } else {
      // Block %67 : new_p_xy = curP - gradTimesLam (shift DOWN).
      // %68.
      newP_x = Math.fround(curP_x - gradTimesLam_x);
      newP_y = Math.fround(curP_y - gradTimesLam_y);
    }
  }

  // %71-%73 : up-neighbour coord clamped to [<0,0>, <dimX-1, dimY-1>].
  const clampMaxX = (dimX - 1) | 0;
  const clampMaxY = (dimY - 1) | 0;

  // %71 = coord + <0, -1> ; then air.clamp.s.v2i32 into [<0,0>, <clampMaxX, clampMaxY>].
  const upCandX = coordX | 0;
  const upCandY = (coordY - 1) | 0;
  const upClampX = Math.min(Math.max(upCandX, 0) | 0, clampMaxX) | 0;
  const upClampY = Math.min(Math.max(upCandY, 0) | 0, clampMaxY) | 0;

  // %74-%75 : left-neighbour coord (coord + <-1, 0>) clamped identically.
  const leftCandX = (coordX - 1) | 0;
  const leftCandY = coordY | 0;
  const leftClampX = Math.min(Math.max(leftCandX, 0) | 0, clampMaxX) | 0;
  const leftClampY = Math.min(Math.max(leftCandY, 0) | 0, clampMaxY) | 0;

  // %76-%77 : sample tex9 at CURRENT uv (%24, coord+0.5).
  const curDiv = sample2D(tex9, uv_u, uv_v);
  const curDiv_x = Math.fround(curDiv[0]);
  const curDiv_y = Math.fround(curDiv[1]);
  const curDiv_z = Math.fround(curDiv[2]);
  const curDiv_w = Math.fround(curDiv[3]);

  // %78-%79 : upClamp converted to fp32 + 0.5.
  const upUv_u = Math.fround(Math.fround(upClampX) + Math.fround(0.5));
  const upUv_v = Math.fround(Math.fround(upClampY) + Math.fround(0.5));
  // %80-%81 : sample tex9 at upUv.
  const upSample = sample2D(tex9, upUv_u, upUv_v);
  const upSample_z = Math.fround(upSample[2]);
  const upSample_w = Math.fround(upSample[3]);

  // %82-%83 : leftClamp converted to fp32 + 0.5.
  const leftUv_u = Math.fround(Math.fround(leftClampX) + Math.fround(0.5));
  const leftUv_v = Math.fround(Math.fround(leftClampY) + Math.fround(0.5));
  // %84-%85 : sample tex9 at leftUv.
  const leftSample = sample2D(tex9, leftUv_u, leftUv_v);
  const leftSample_x = Math.fround(leftSample[0]);
  const leftSample_y = Math.fround(leftSample[1]);

  // ---- X-axis directional difference (blocks %86..%98). ----
  let xDiff_x: number;
  let xDiff_y: number;
  // %86 : coord.x == 0?
  if ((coordX | 0) === 0) {
    // Block %87 : xDiff = curDiv.xy (Neumann boundary).
    xDiff_x = curDiv_x;
    xDiff_y = curDiv_y;
  } else if ((coordX | 0) === ((dimX - 1) | 0)) {
    // Block %92 : xDiff = -leftSample.xy (opposite Neumann boundary).
    //   %94 : fsub <-0.0, -0.0>, leftSample.xy -- bit-exact negation.
    xDiff_x = Math.fround(-leftSample_x);
    xDiff_y = Math.fround(-leftSample_y);
  } else {
    // Block %95 : xDiff = (curDiv - leftSample).xy -- backward diff.
    xDiff_x = Math.fround(curDiv_x - leftSample_x);
    xDiff_y = Math.fround(curDiv_y - leftSample_y);
  }

  // ---- Y-axis directional difference (blocks %100..%112). ----
  //   NOTE: the IR takes .zw of the tex9 samples for the Y-axis diff
  //   (curDiv_z/_w and upSample_z/_w), which is consistent with tex9
  //   storing <p_x, p_y, div_x, div_y> or a similar 4-channel layout.
  let yDiff_x: number;
  let yDiff_y: number;
  // %100 : coord.y == 0?
  if ((coordY | 0) === 0) {
    // Block %101 : yDiff = curDiv.zw.
    yDiff_x = curDiv_z;
    yDiff_y = curDiv_w;
  } else if ((coordY | 0) === ((dimY - 1) | 0)) {
    // Block %106 : yDiff = -upSample.zw.
    yDiff_x = Math.fround(-upSample_z);
    yDiff_y = Math.fround(-upSample_w);
  } else {
    // Block %109 : yDiff = (curDiv - upSample).zw -- backward diff.
    yDiff_x = Math.fround(curDiv_z - upSample_z);
    yDiff_y = Math.fround(curDiv_w - upSample_w);
  }

  // %114 : divergence_xy = xDiff + yDiff.
  const divergence_x = Math.fround(xDiff_x + yDiff_x);
  const divergence_y = Math.fround(xDiff_y + yDiff_y);

  // %115-%116 : theta.
  const theta = Math.fround(params.theta);

  // %119 : llvm.fmuladd.v2f32(<theta,theta>, divergence_xy, new_p_xy).
  //   Contract: single rounding at the end. Modelled as Math.fround(a*b + c).
  const updated_x = Math.fround(theta * divergence_x + newP_x);
  const updated_y = Math.fround(theta * divergence_y + newP_y);

  // %120-%121 : shuffle into <x, y, 0, 0>.
  const packed_x = updated_x;
  const packed_y = updated_y;
  const packed_z = Math.fround(0);
  const packed_w = Math.fround(0);

  // %122-%123 : finalScale = params[2].
  const finalScale = Math.fround(params.finalScale);

  // %126 : <finalScale, ..., finalScale> * <x, y, 0, 0>.
  const outR = Math.fround(finalScale * packed_x);
  const outG = Math.fround(finalScale * packed_y);
  const outB = Math.fround(finalScale * packed_z);
  const outA = Math.fround(finalScale * packed_w);

  // air.write_texture_2d.v4f32(tex8, coord, <outR, outG, outB, outA>, 0, 2).
  write2D(tex8, coordX | 0, coordY | 0, [outR, outG, outB, outA]);
}
