// Faithful transcription @0x000000000004c8 — @shader VelocityView_trackball_vs (Ozone)
//
// Provenance: LLVM AIR IR at raw-port/re/shaders/VelocityView_trackball_vs.ll,
// extracted via raw-port/tools/shader_disasm.sh from
// Ozone.framework/Versions/A/Resources/default.metallib. The .ll header
// line reads `0x000000000004c8 -- VelocityView_trackball_vs:` — that is
// the shader's entry offset in the metallib. Compile options:
// `air.compile.denorms_disable`, `air.compile.fast_math_enable`,
// `air.compile.framebuffer_fetch_enable`. `fast_math_enable` marks
// every fadd/fmul as `fast`; the fp32-narrowed transcription below
// uses Math.fround on every emitted op — the math is a pair of
// matrix-vector products plus a scalar smoothstep/mix, no reductions,
// so `fast` cannot legally reassociate any observable value.
//
// This is a VERTEX FUNCTION (!air.vertex/!15). Outputs per vertex:
//   position    : float4 (air.position)
//   color       : float4 (air.vertex_output, generated name
//                          "generated(5colorDv4_f)")
//   worldNormal : float3 (air.vertex_output, generated name
//                          "generated(11worldNormalDv3_f)")
//
// Note the AIR return struct is `<{ <4 x float>, <4 x float>, <3 x float> }>`
// but ONLY the two float4 slots (position, color) are ever assigned
// (via `insertvalue` at %67/%68 into an `undef` seed at %67). The
// worldNormal slot is left `undef` by the shader itself — every
// callable observation of that field must treat it as unspecified.
// Debug metadata !19 declares the slot but the IR never writes it.
//
// Buffer bindings (!21..!25):
//   vertexID  : uint (air.vertex_id).
//   vertexArray : OZVelocityViewTrackballVertex* (constant AS,
//                  buffer 0, size 32, align 16). Field layout from !23:
//                    offset  0 : float3 position
//                    offset 16 : float4 color
//   uniforms  : OZVelocityViewTrackballUniforms* (constant AS,
//                  buffer 1, size 176, align 16). Field layout from !25:
//                    offset   0 : float4x4 projection
//                    offset  64 : float4x4 modelview
//                    offset 128 : float    trackballDepthShadeRangeFar
//                    offset 132 : float    trackballDepthShadeRangeNear
//                    offset 144 : float4   trackballDarkColor
//                    offset 160 : float4   trackballLightColor
//
// Line-by-line map of the .ll body:
//
//   %4  = zext vertexID to i64
//   %5  = &vertexArray[vertexID].position (field 0)
//   %6  = load <3 x float> position
//
//   -- modelview * float4(position, 1.0) --  (uniforms field 1 = modelview)
//   %7  = &uniforms.modelview[0]        (column 0)
//   %8  = load col0
//   %9  = splat(px)
//   %10 = col0 * splat(px)
//   %11 = &uniforms.modelview[1]        (column 1)
//   %12 = load col1
//   %13 = splat(py)
//   %14 = col1 * splat(py)
//   %15 = %14 + %10
//   %16 = &uniforms.modelview[2]        (column 2)
//   %17 = load col2
//   %18 = splat(pz)
//   %19 = col2 * splat(pz)
//   %20 = %15 + %19
//   %21 = &uniforms.modelview[3]        (column 3)
//   %22 = load col3
//   %23 = %20 + %22                      -- eye-space position (w=1 implicit).
//
//   -- projection * eye-space           -- (uniforms field 0 = projection)
//   %24 = &uniforms.projection[0]
//   %25 = load pcol0
//   %26 = splat(eye.x)
//   %27 = pcol0 * splat(eye.x)
//   %28 = &uniforms.projection[1]
//   %29 = load pcol1
//   %30 = splat(eye.y)
//   %31 = pcol1 * splat(eye.y)
//   %32 = %27 + %31
//   %33 = &uniforms.projection[2]
//   %34 = load pcol2
//   %35 = splat(eye.z)
//   %36 = pcol2 * splat(eye.z)
//   %37 = %32 + %36
//   %38 = &uniforms.projection[3]
//   %39 = load pcol3
//   %40 = splat(eye.w)                   -- eye.w is the w component of
//                                            %23. Because %23 = mv*float4(p,1)
//                                            and column 3 of modelview
//                                            was added un-scaled at %23,
//                                            eye.w is `modelview[3].w`
//                                            (typically 1 for an affine
//                                            modelview, but the shader
//                                            propagates whatever value
//                                            the uniform actually holds).
//   %41 = pcol3 * splat(eye.w)
//   %42 = %37 + %41                      -- clip-space position.
//
//   -- vertex color pass-through with depth-shade mix --
//   %43 = &vertexArray[vertexID].color   (field 1)
//   %44 = load <4 x float> vColor
//   %45 = &uniforms.trackballDepthShadeRangeFar   (field 2)
//   %46 = load rangeFar
//   %47 = &uniforms.trackballDepthShadeRangeNear  (field 3)
//   %48 = load rangeNear
//
//   %49 = extractelement %23, 2         -- eye-space Z.
//   %50 = eye.z - rangeFar
//   %51 = rangeNear - rangeFar
//   %52 = %50 / %51                     -- normalised depth parameter.
//   %53 = air.fast_clamp(%52, 0.0, 1.0)
//   %54 = %53 * %53                     -- t*t
//   %55 = %53 * 2.0
//   %56 = 3.0 - %55                     -- (3 - 2t)
//   %57 = %54 * %56                     -- smoothstep polynomial t*t*(3-2t)
//
//   %58 = &uniforms.trackballDarkColor   (field 4)
//   %59 = load darkColor
//   %60 = &uniforms.trackballLightColor  (field 5)
//   %61 = load lightColor
//   %62..%63 = splat(%57) -> <4 x float>
//   %64 = air.mix(darkColor, lightColor, splat(smoothstep))
//              = darkColor + (lightColor - darkColor) * splat(smoothstep)
//   %65 = %64 * vColor                   -- mixed color modulated by per-vertex color.
//   %66 = insertelement %65, 1.0, 3      -- force alpha to 1.
//
//   %67 = insertvalue {undef, undef, undef}, %42, 0    -- position slot.
//   %68 = insertvalue %67,              %66, 1          -- color slot.
//   ret %68                              -- worldNormal slot stays undef.
//
// The two callee declarations (`@air.mix.v4f32`, `@air.fast_clamp.f32`)
// carry `mustprogress nofree nosync nounwind readnone willreturn` — they
// are pure per-lane intrinsics. `air.mix(a,b,t)` is `a + (b - a) * t`
// componentwise; `air.fast_clamp(x, lo, hi)` is `min(max(x, lo), hi)`
// with `fast` NaN treatment (the shader passes constant 0/1 endpoints
// which never NaN).

/**
 * Per-vertex input record for `VelocityView_trackball_vs` — mirrors
 * !23 (32-byte record, align 16, constant address space).
 */
export interface OZVelocityViewTrackballVertex {
  position: [number, number, number];              // offset  0 : float3
  color: [number, number, number, number];         // offset 16 : float4
}

/**
 * Uniform block for `VelocityView_trackball_vs` — mirrors !25
 * (176-byte record, align 16, constant address space). Metal matrices
 * are column-major, so `projection[i]` / `modelview[i]` is the ith
 * column of the corresponding matrix.
 */
export interface OZVelocityViewTrackballUniforms {
  /** float4x4 projection — four columns, each a length-4 fp32 vector. */
  projection: [
    [number, number, number, number], // column 0 (offset   0)
    [number, number, number, number], // column 1 (offset  16)
    [number, number, number, number], // column 2 (offset  32)
    [number, number, number, number], // column 3 (offset  48)
  ];
  /** float4x4 modelview — four columns, each a length-4 fp32 vector. */
  modelview: [
    [number, number, number, number], // column 0 (offset  64)
    [number, number, number, number], // column 1 (offset  80)
    [number, number, number, number], // column 2 (offset  96)
    [number, number, number, number], // column 3 (offset 112)
  ];
  trackballDepthShadeRangeFar: number;              // offset 128 : float
  trackballDepthShadeRangeNear: number;             // offset 132 : float
  trackballDarkColor: [number, number, number, number];  // offset 144 : float4
  trackballLightColor: [number, number, number, number]; // offset 160 : float4
}

/**
 * Return type of `VelocityView_trackball_vs` — mirrors the AIR
 * return struct `<{ <4 x float>, <4 x float>, <3 x float> }>` per
 * !air.vertex output declaration at !16..!19.
 *
 * `worldNormal` is declared by the shader's !air.vertex_output metadata
 * but the IR never writes into that slot (only slots 0 and 1 are
 * touched by `insertvalue`). It is therefore left `undef`; downstream
 * stages that reference it are reading uninitialised lanes.
 */
export interface OZVelocityViewTrackballVertexOutput {
  position: [number, number, number, number]; // air.position
  color: [number, number, number, number];    // air.vertex_output "color"
  /** Left undef by the shader — see header note. */
  worldNormal: [number, number, number];
}

/**
 * Vertex kernel `VelocityView_trackball_vs`.
 *
 * Transforms the per-vertex position by `uniforms.modelview` then
 * `uniforms.projection` to produce the clip-space position. Computes
 * a smoothstep-shaded depth mix between `trackballDarkColor` and
 * `trackballLightColor` based on the eye-space Z relative to
 * `[trackballDepthShadeRangeFar, trackballDepthShadeRangeNear]`,
 * modulates by the per-vertex color, and forces alpha to 1.
 *
 * Faithful transcription of the AIR IR line-by-line — see the header
 * for the %-numbered map. Every arithmetic op is emitted through
 * `Math.fround` to preserve fp32 semantics.
 *
 * @shader VelocityView_trackball_vs (Ozone)
 */
export function VelocityView_trackball_vs(
  vertexID: number,
  vertexArray: OZVelocityViewTrackballVertex[],
  uniforms: OZVelocityViewTrackballUniforms,
): OZVelocityViewTrackballVertexOutput {
  // %4 = zext vertexID to i64.
  const idx = vertexID >>> 0;

  // %5..%6 : load vertexArray[vertexID].position.
  const v = vertexArray[idx];
  const px = Math.fround(v.position[0]);
  const py = Math.fround(v.position[1]);
  const pz = Math.fround(v.position[2]);

  // -- %7..%23 : modelview * float4(position, 1.0) --
  // %7..%10 : mvcol0 * splat(px).
  const m0 = uniforms.modelview[0];
  const m0x = Math.fround(Math.fround(m0[0]) * px);
  const m0y = Math.fround(Math.fround(m0[1]) * px);
  const m0z = Math.fround(Math.fround(m0[2]) * px);
  const m0w = Math.fround(Math.fround(m0[3]) * px);

  // %11..%15 : mvcol1 * splat(py) + previous.
  const m1 = uniforms.modelview[1];
  const s1x = Math.fround(Math.fround(Math.fround(m1[0]) * py) + m0x);
  const s1y = Math.fround(Math.fround(Math.fround(m1[1]) * py) + m0y);
  const s1z = Math.fround(Math.fround(Math.fround(m1[2]) * py) + m0z);
  const s1w = Math.fround(Math.fround(Math.fround(m1[3]) * py) + m0w);

  // %16..%20 : mvcol2 * splat(pz) + previous.
  const m2 = uniforms.modelview[2];
  const s2x = Math.fround(Math.fround(Math.fround(m2[0]) * pz) + s1x);
  const s2y = Math.fround(Math.fround(Math.fround(m2[1]) * pz) + s1y);
  const s2z = Math.fround(Math.fround(Math.fround(m2[2]) * pz) + s1z);
  const s2w = Math.fround(Math.fround(Math.fround(m2[3]) * pz) + s1w);

  // %21..%23 : + mvcol3 (w=1 implicit — column 3 added un-scaled).
  const m3 = uniforms.modelview[3];
  const eyeX = Math.fround(s2x + Math.fround(m3[0]));
  const eyeY = Math.fround(s2y + Math.fround(m3[1]));
  const eyeZ = Math.fround(s2z + Math.fround(m3[2]));
  const eyeW = Math.fround(s2w + Math.fround(m3[3]));

  // -- %24..%42 : projection * eye-space --
  // %24..%27 : pcol0 * splat(eyeX).
  const p0 = uniforms.projection[0];
  const p0x = Math.fround(Math.fround(p0[0]) * eyeX);
  const p0y = Math.fround(Math.fround(p0[1]) * eyeX);
  const p0z = Math.fround(Math.fround(p0[2]) * eyeX);
  const p0w = Math.fround(Math.fround(p0[3]) * eyeX);

  // %28..%32 : pcol1 * splat(eyeY) + previous.
  const p1 = uniforms.projection[1];
  const t1x = Math.fround(Math.fround(Math.fround(p1[0]) * eyeY) + p0x);
  const t1y = Math.fround(Math.fround(Math.fround(p1[1]) * eyeY) + p0y);
  const t1z = Math.fround(Math.fround(Math.fround(p1[2]) * eyeY) + p0z);
  const t1w = Math.fround(Math.fround(Math.fround(p1[3]) * eyeY) + p0w);

  // %33..%37 : pcol2 * splat(eyeZ) + previous.
  const p2 = uniforms.projection[2];
  const t2x = Math.fround(Math.fround(Math.fround(p2[0]) * eyeZ) + t1x);
  const t2y = Math.fround(Math.fround(Math.fround(p2[1]) * eyeZ) + t1y);
  const t2z = Math.fround(Math.fround(Math.fround(p2[2]) * eyeZ) + t1z);
  const t2w = Math.fround(Math.fround(Math.fround(p2[3]) * eyeZ) + t1w);

  // %38..%42 : pcol3 * splat(eyeW) + previous.
  const p3 = uniforms.projection[3];
  const clipX = Math.fround(t2x + Math.fround(Math.fround(p3[0]) * eyeW));
  const clipY = Math.fround(t2y + Math.fround(Math.fround(p3[1]) * eyeW));
  const clipZ = Math.fround(t2z + Math.fround(Math.fround(p3[2]) * eyeW));
  const clipW = Math.fround(t2w + Math.fround(Math.fround(p3[3]) * eyeW));

  // -- %43..%44 : load per-vertex color --
  const vColor = v.color;
  const vc0 = Math.fround(vColor[0]);
  const vc1 = Math.fround(vColor[1]);
  const vc2 = Math.fround(vColor[2]);
  const vc3 = Math.fround(vColor[3]);

  // -- %45..%48 : load range scalars --
  const rangeFar = Math.fround(uniforms.trackballDepthShadeRangeFar);
  const rangeNear = Math.fround(uniforms.trackballDepthShadeRangeNear);

  // -- %49..%57 : smoothstep polynomial from eye-space Z --
  // %49 extracts lane 2 of %23 (the eye-space vector), i.e. eyeZ.
  const num = Math.fround(eyeZ - rangeFar);           // %50
  const den = Math.fround(rangeNear - rangeFar);      // %51
  const raw = Math.fround(num / den);                 // %52
  // %53 : air.fast_clamp(raw, 0.0, 1.0).
  const t =
    raw < 0.0 ? 0.0 :
    raw > 1.0 ? 1.0 :
    raw;
  const tSq = Math.fround(t * t);                     // %54
  const twoT = Math.fround(t * 2.0);                  // %55
  const three_minus_2t = Math.fround(3.0 - twoT);     // %56
  const smooth = Math.fround(tSq * three_minus_2t);   // %57 : t*t*(3 - 2t).

  // -- %58..%64 : mix(darkColor, lightColor, splat(smooth)) --
  const dark = uniforms.trackballDarkColor;
  const light = uniforms.trackballLightColor;
  // air.mix(a, b, t) = a + (b - a) * t componentwise (per Metal spec;
  // fp32 lanes, `fast` allowed but with a constant per-lane t there is
  // no reassociation to observe).
  const d0 = Math.fround(dark[0]);
  const d1 = Math.fround(dark[1]);
  const d2 = Math.fround(dark[2]);
  const d3 = Math.fround(dark[3]);
  const l0 = Math.fround(light[0]);
  const l1 = Math.fround(light[1]);
  const l2 = Math.fround(light[2]);
  const l3 = Math.fround(light[3]);
  const mix0 = Math.fround(d0 + Math.fround(Math.fround(l0 - d0) * smooth));
  const mix1 = Math.fround(d1 + Math.fround(Math.fround(l1 - d1) * smooth));
  const mix2 = Math.fround(d2 + Math.fround(Math.fround(l2 - d2) * smooth));
  const mix3 = Math.fround(d3 + Math.fround(Math.fround(l3 - d3) * smooth));

  // -- %65 : mixedColor * vColor --  (componentwise)
  const cr = Math.fround(mix0 * vc0);
  const cg = Math.fround(mix1 * vc1);
  const cb = Math.fround(mix2 * vc2);
  // -- %66 : insertelement <cr,cg,cb,cw>, 1.0, 3 --
  // The pre-insert alpha lane (Math.fround(mix3 * vc3)) is overwritten
  // by the constant 1.0 before the value escapes, so it is not computed
  // as an observable side effect.

  // -- %67..%68 : pack return struct; worldNormal slot stays undef. --
  return {
    position: [clipX, clipY, clipZ, clipW],
    color: [cr, cg, cb, 1.0],
    // worldNormal is undef in the IR — see header. Emitting NaN would
    // be a faithful transcription of "unspecified"; we emit NaN so any
    // downstream read is guaranteed to poison rather than silently
    // succeed with a plausible-looking zero.
    worldNormal: [NaN, NaN, NaN],
  };
}
