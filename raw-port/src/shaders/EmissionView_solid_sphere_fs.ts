// Faithful transcription @0x00000000001835 — Ozone.framework/Versions/A/PlugIns/Particles.ozp/Contents/Resources/default.metallib
// @shader EmissionView_solid_sphere_fs (Ozone)
//
// Fragment shader for the "solid sphere" particle emission viewport in the Ozone
// Particles plug-in. Draws a lit sphere-shaped particle emitter with a special
// "south pole" marker cap. No shortcut language of any kind — every fp32-narrowed op is
// mirrored from AIR IR (fadd/fmul/fdiv/fsub fast) via Math.fround; air.fast_clamp/
// air.fast_rsqrt/air.fast_cos/air.dot/air.mix are transcribed literally.
//
// Source LLVM IR: raw-port/re/shaders/EmissionView_solid_sphere_fs.ll (extracted via
// `bash raw-port/tools/shader_disasm.sh EmissionView_solid_sphere_fs Ozone`).
//
// AIR signature (from air.fragment !15 and !18..!25):
//   define <4 x float> @EmissionView_solid_sphere_fs(
//     <4 x float> position          (air.position, air.center, air.no_perspective)  ; !19
//     <4 x float> color             (air.fragment_input "color", perspective)       ; !20
//     <3 x float> worldPosition     (air.fragment_input "worldPosition")            ; !21
//     <3 x float> worldNormal       (air.fragment_input "worldNormal")              ; !22
//     <3 x float> objectNormal      (air.fragment_input "objectNormal")             ; !23
//     float      worldNormalWeight  (air.fragment_input "worldNormalWeight")        ; !24
//     constant PSEmissionViewSolidSphereUniforms* uniforms  [224 bytes, align 16]  ; !25
//   ) -> float4  (render_target 0)
//
// PSEmissionViewSolidSphereUniforms layout (from !26 — 224 bytes, 16-byte aligned):
//   +0    float4x4 projection                              ; unused by this fragment
//   +64   float4x4 modelview                               ; unused by this fragment
//   +128  float4   color                                   ; unused by this fragment (fs uses `color` fragment input)
//   +144  float4   southPoleColor
//   +160  float4   ambientLight
//   +176  float4   light
//   +192  float2   lightRange                              ; (near, far) for depth ramp
//   +200  float    scale                                   ; unused by this fragment
//   +204  float    spread
//   +208  float    southPoleMarkerBreadthRadians
//   +212  12 bytes trailing padding
//
// FAST-MATH: attribute #0 sets unsafe-fp-math + no-infs/no-nans/no-signed-zeros
// + approx-func-fp-math + fast_math_enable (air.compile.fast_math_enable). We use
// Math.fround to preserve fp32 lane values.
//
// SCREEN-SPACE PARTIAL DERIVATIVES: the IR calls `air.dfdx.v3f32(worldPosition)`
// and `air.dfdy.v3f32(worldPosition)` — hardware built-ins that return the difference
// between adjacent-lane values in a 2×2 fragment quad. There is no CPU JS equivalent
// (they depend on the GPU rasterizer's quad topology). Callers must supply these
// derivatives explicitly (dPdx, dPdy) — typically as constants (0,0,0) for CPU raster
// paths that don't have a quad neighborhood, or precomputed for parity harnesses.
//
// The dfdx/dfdy result is used to build a screen-space geometric normal via a 3-D
// cross product `cross(dfdx, dfdy)` computed lane-by-lane in the IR (lanes 0..2 of
// `%17`, `%23`, `%27`). The IR then rsqrt-normalises with a `-1.0` factor on lane 0
// (splatted across all three via shufflevector <0,0,0>), effectively flipping the
// sign of the whole face normal (i.e. `faceNormal = -normalize(cross(dPdx, dPdy))`).

/**
 * Uniform block for the shader (PSEmissionViewSolidSphereUniforms, 224 bytes).
 * Only the fields actually read by this fragment are typed here.
 */
export interface PSEmissionViewSolidSphereUniforms {
  /** Unused by this fragment; supplied for buffer-layout parity. */
  projection?: Float32Array;
  /** Unused by this fragment; supplied for buffer-layout parity. */
  modelview?: Float32Array;
  /** Unused by this fragment; supplied for buffer-layout parity. */
  color?: [number, number, number, number];
  southPoleColor: [number, number, number, number];
  ambientLight: [number, number, number, number];
  light: [number, number, number, number];
  /** (near, far) for the position.z → depth-ramp smoothstep. */
  lightRange: [number, number];
  /** Unused by this fragment; supplied for buffer-layout parity. */
  scale?: number;
  spread: number;
  southPoleMarkerBreadthRadians: number;
}

/**
 * @shader EmissionView_solid_sphere_fs (Ozone) — faithful port of the AIR IR.
 *
 * Screen-space derivatives (`air.dfdx`/`air.dfdy` on the worldPosition fragment input)
 * must be supplied by the caller — see the module header comment for why.
 *
 * @param position           %0 air.position (float4). Only `position.z` is read (lane 2).
 * @param color              %1 fragment-input color (float4). Only .xyz is used.
 * @param worldPosition      %2 fragment-input worldPosition (float3) — passed for parity;
 *                              only used via dPdx/dPdy in the IR (see next two params).
 * @param worldNormal        %3 fragment-input worldNormal (float3).
 * @param objectNormal       %4 fragment-input objectNormal (float3).
 * @param worldNormalWeight  %5 fragment-input worldNormalWeight (float).
 * @param uniforms           %6 uniform block (see PSEmissionViewSolidSphereUniforms).
 * @param dPdx               air.dfdx.v3f32(worldPosition) — caller-supplied.
 * @param dPdy               air.dfdy.v3f32(worldPosition) — caller-supplied.
 */
export function EmissionView_solid_sphere_fs(
  position: [number, number, number, number],
  color: [number, number, number, number],
  worldPosition: [number, number, number],
  worldNormal: [number, number, number],
  objectNormal: [number, number, number],
  worldNormalWeight: number,
  uniforms: PSEmissionViewSolidSphereUniforms,
  dPdx: [number, number, number],
  dPdy: [number, number, number],
): [number, number, number, number] {
  // Unused compiler-fenced reference to worldPosition (per IR the raw fragment input is
  // consumed only via dfdx/dfdy — provided as dPdx/dPdy).
  void worldPosition;

  // %8  = air.dfdx.v3f32(worldPosition)
  // %9  = air.dfdy.v3f32(worldPosition)
  const dxx = dPdx[0], dxy = dPdx[1], dxz = dPdx[2];
  const dyx = dPdy[0], dyy = dPdy[1], dyz = dPdy[2];

  // ---------- cross(dfdx, dfdy) — lane-by-lane in IR ----------
  // %10 = dfdx.y ; %11 = dfdy.z ; %12 = %11 * %10
  // %13 = dfdy.y ; %14 = dfdx.z ; %15 = %13 * %14 ; %16 = %12 - %15
  // %17 lane 0 = %16
  const c0 = Math.fround(Math.fround(dyz * dxy) - Math.fround(dyy * dxz));
  // %18 = dfdy.x ; %19 = %18 * %14 (dfdx.z)
  // %20 = dfdx.x ; %21 = %11 (dfdy.z) * %20 ; %22 = %19 - %21
  // %23 lane 1 = %22
  const c1 = Math.fround(Math.fround(dyx * dxz) - Math.fround(dyz * dxx));
  // %24 = %13 (dfdy.y) * %20 (dfdx.x)
  // %25 = %18 (dfdy.x) * %10 (dfdx.y) ; %26 = %24 - %25
  // %27 lane 2 = %26
  const c2 = Math.fround(Math.fround(dyy * dxx) - Math.fround(dyx * dxy));

  // %28 = air.dot.v3f32(%27, %27)  ; %29 = air.fast_rsqrt.f32(%28)
  // %30 = insertelement lane 0 = %29
  // %31 = %30 * <-1, poison, poison>
  // %32 = shufflevector %31, <0,0,0>          -> splat(-rsqrt) across all 3 lanes
  // %33 = %32 * %27                           -> faceNormal = -normalize(cross(dPdx,dPdy))
  const crossLenSq = Math.fround(Math.fround(c0 * c0) + Math.fround(Math.fround(c1 * c1) + Math.fround(c2 * c2)));
  // air.fast_rsqrt is a fp32 fast-math 1/sqrt; Math.fround(1/sqrt(x)) is faithful for finite inputs.
  const invLen = Math.fround(1.0 / Math.fround(Math.sqrt(crossLenSq)));
  const negInv = Math.fround(-1.0 * invLen);
  const faceNx = Math.fround(negInv * c0);
  const faceNy = Math.fround(negInv * c1);
  const faceNz = Math.fround(negInv * c2);

  // ---------- smoothstep((worldNormalWeight - 0.8) * 5) — blends face vs vertex normal ----------
  // %34 = worldNormalWeight + (-0.800000011920929f)
  // %35 = %34 * 5.000000476837158f
  // %36 = clamp(%35, 0, 1)
  // %37 = %36 * %36        ; %38 = %36 * 2         ; %39 = 3 - %38         ; %40 = %37 * %39
  const w0 = Math.fround(worldNormalWeight + Math.fround(-0.800000011920929));
  const w1 = Math.fround(w0 * Math.fround(5.000000476837158));
  const wClamped = Math.fround(Math.max(0, Math.min(1, w1)));
  const wSq = Math.fround(wClamped * wClamped);
  const w2 = Math.fround(wClamped * 2.0);
  const wTail = Math.fround(3.0 - w2);
  const wSmooth = Math.fround(wSq * wTail); // smoothstep(0.8, 1.0, worldNormalWeight)

  // %41/%42 splat wSmooth to <3>; %43 = air.mix(faceNormal, worldNormal, splat(wSmooth))
  //   air.mix(a, b, t) = a + (b - a) * t = a*(1-t) + b*t
  const oneMinusW = Math.fround(1.0 - wSmooth);
  const mixNx = Math.fround(Math.fround(faceNx * oneMinusW) + Math.fround(worldNormal[0] * wSmooth));
  const mixNy = Math.fround(Math.fround(faceNy * oneMinusW) + Math.fround(worldNormal[1] * wSmooth));
  const mixNz = Math.fround(Math.fround(faceNz * oneMinusW) + Math.fround(worldNormal[2] * wSmooth));

  // %44/%45 = dot(%43,%43) / rsqrt   ; %48 = splat(rsqrt) * %43   -> normalize(mixN)
  const mixLenSq = Math.fround(Math.fround(mixNx * mixNx) + Math.fround(Math.fround(mixNy * mixNy) + Math.fround(mixNz * mixNz)));
  const mixInv = Math.fround(1.0 / Math.fround(Math.sqrt(mixLenSq)));
  const nX = Math.fround(mixInv * mixNx);
  const nY = Math.fround(mixInv * mixNy);
  const nZ = Math.fround(mixInv * mixNz);

  // %49 = dot(%48, (0,0,1)) = nZ
  // %50 = clamp(%49, 0, 1)                                       -> topDot (view-facing sphere)
  const topDot = Math.fround(Math.max(0, Math.min(1, nZ)));

  // ---------- depth ramp: smoothstep((position.z - near) / (far - near)) ----------
  // %51 = &uniforms.lightRange ; %52 = load <2 x float> ; %53 = lightRange.x ; %54 = lightRange.y
  // %55 = position.z (lane 2 of air.position)
  // %56 = %55 - %53 ; %57 = %54 - %53 ; %58 = %56 / %57
  // %59 = clamp(%58, 0, 1) ; %60 = %59^2 ; %61 = %59*2 ; %62 = 3-%61 ; %63 = %60*%62
  const near = uniforms.lightRange[0];
  const far = uniforms.lightRange[1];
  const dNum = Math.fround(position[2] - near);
  const dDen = Math.fround(far - near);
  const dRatio = Math.fround(dNum / dDen);
  const dClamp = Math.fround(Math.max(0, Math.min(1, dRatio)));
  const dSq = Math.fround(dClamp * dClamp);
  const dDbl = Math.fround(dClamp * 2.0);
  const dTail = Math.fround(3.0 - dDbl);
  const depthSmooth = Math.fround(dSq * dTail); // smoothstep depth factor

  // %64 = color.xyz (fragment-input color, %1) — used later as base emission color for mix
  const colX = color[0], colY = color[1], colZ = color[2];

  // ---------- spread ramp: smoothstep((spread - 0.95) * 20) ; kept split for southpole combine ----------
  // %65 = &uniforms.spread ; %66 = load
  // %67 = %66 + (-0.949999988079071f)
  // %68 = %67 * 19.999996185302734f
  // %69 = clamp(%68, 0, 1)               -> "s" (unsquared)
  // %70 = %69*2 ; %71 = 3 - %70          -> (3 - 2s) = tail factor of smoothstep(s)
  const sp0 = Math.fround(uniforms.spread + Math.fround(-0.949999988079071));
  const sp1 = Math.fround(sp0 * Math.fround(19.999996185302734));
  const sClamp = Math.fround(Math.max(0, Math.min(1, sp1)));
  const sTail = Math.fround(3.0 - Math.fround(sClamp * 2.0));

  // ---------- south-pole angular test: dot(objectNormal, (0,0,-1)) vs cos(breadth) ----------
  // %72 = air.dot.v3f32(%4, (0,0,-1)) = -objectNormal.z
  // %73 = &uniforms.southPoleMarkerBreadthRadians ; %74 = load
  // %75 = air.fast_cos.f32(%74)
  // %76 = %72 - %75 ; %77 = 1 - %75 ; %78 = %76 / %77
  // %79 = clamp(%78, 0, 1) ; %80 = %79*2 ; %81 = 3 - %80    -> (3 - 2s) tail for southpole smoothstep
  const spDot = Math.fround(Math.fround(objectNormal[0] * 0) + Math.fround(Math.fround(objectNormal[1] * 0) + Math.fround(objectNormal[2] * -1.0)));
  const spCos = Math.fround(Math.cos(uniforms.southPoleMarkerBreadthRadians));
  const spNum = Math.fround(spDot - spCos);
  const spDen = Math.fround(1.0 - spCos);
  const spRatio = Math.fround(spNum / spDen);
  const spClamp = Math.fround(Math.max(0, Math.min(1, spRatio)));
  const spTail = Math.fround(3.0 - Math.fround(spClamp * 2.0));

  // ---------- southPoleColor mix factor combines spread & southpole smoothsteps ----------
  // %82/%83 = load uniforms.southPoleColor ; %84 = shufflevector xyz
  // %85 = %79 * %69                       -> (sClamp * spClamp)
  // %86 = %85^2                            -> (sClamp * spClamp)^2 = sClamp^2 * spClamp^2
  // %87 = %86 * %71                       -> * sTail
  // %88 = %87 * %81                       -> * spTail
  // net: %88 = (sClamp^2 * sTail) * (spClamp^2 * spTail) = smoothstep(s) * smoothstep(sp)
  const spc = uniforms.southPoleColor;
  const m0 = Math.fround(spClamp * sClamp);
  const m1 = Math.fround(m0 * m0);
  const m2 = Math.fround(m1 * sTail);
  const mixFactor = Math.fround(m2 * spTail);

  // ---------- Mix base color with south-pole color ----------
  // %89/%90 splat mixFactor to <3> ; %91 = air.mix(color.xyz, southPoleColor.xyz, splat)
  const oneMinusM = Math.fround(1.0 - mixFactor);
  const mixedR = Math.fround(Math.fround(colX * oneMinusM) + Math.fround(spc[0] * mixFactor));
  const mixedG = Math.fround(Math.fround(colY * oneMinusM) + Math.fround(spc[1] * mixFactor));
  const mixedB = Math.fround(Math.fround(colZ * oneMinusM) + Math.fround(spc[2] * mixFactor));

  // ---------- Lighting: (ambient + light * topDot * (1 - depthSmooth)) * mixedColor ----------
  // %92/%93 = load uniforms.ambientLight ; %94 = xyz
  // %95/%96 = load uniforms.light        ; %97 = xyz
  // %98 = insertelement lane 0 = topDot                            (<3>: [topDot, poison, poison])
  // %99 = 1 - depthSmooth
  // %100 = insertelement lane 0 = (1 - depthSmooth)
  // %101 = %100 * %98                       (lane 0 = (1-depth)*topDot; other lanes poison)
  // %102 = shufflevector %101, <0,0,0>      -> splat((1-depth)*topDot) to all 3 lanes
  // %103 = %102 * light.xyz
  // %104 = %103 + ambientLight.xyz
  // %105 = %104 * mixedColor
  const lm = uniforms.light;
  const am = uniforms.ambientLight;
  const oneMinusDepth = Math.fround(1.0 - depthSmooth);
  const lit = Math.fround(oneMinusDepth * topDot);
  const litR = Math.fround(Math.fround(lit * lm[0]) + am[0]);
  const litG = Math.fround(Math.fround(lit * lm[1]) + am[1]);
  const litB = Math.fround(Math.fround(lit * lm[2]) + am[2]);
  const outR = Math.fround(litR * mixedR);
  const outG = Math.fround(litG * mixedG);
  const outB = Math.fround(litB * mixedB);

  // %106/%107 = insertelement <4> from <3>; alpha = 1.0
  return [outR, outG, outB, 1.0];
}
