// Faithful transcription @0x00000000002ba6 — no shortcut language of any kind.
// @shader MDP3DLineVertexFunc (MDPKit) @0x00000000002ba6
//
// Provenance: LLVM AIR IR at raw-port/re/shaders/MDP3DLineVertexFunc.ll,
// extracted via raw-port/tools/shader_disasm.sh from
// MDPKit.framework/Versions/A/Resources/default.metallib. The .ll
// header line reads `0x00000000002ba6 -- MDP3DLineVertexFunc:` —
// the shader's entry offset in the metallib. Debug info in the .ll
// cites source at MDPKit/Shaders/MDP3DLine.metal:43 (function scope).
// Compile options: `air.compile.denorms_disable`,
// `air.compile.fast_math_enable`,
// `air.compile.framebuffer_fetch_enable`. `fast_math_enable` marks
// every fadd/fmul/fdiv/fsub as `fast` and the rsqrt call as
// `air.fast_rsqrt.f32`; the fp32-narrowed transcription below uses
// Math.fround on every emitted op — the only reduction is the
// `air.dot.v4f32` at %40 which is transcribed as the strict
// left-to-right fp32 sum of the four fmul lanes (Math.fround on
// each partial sum).
//
// This is a VERTEX FUNCTION (!air.vertex/!29). Outputs per vertex:
//   position       : float4 (air.position)
//   color          : float4 (air.vertex_output, generated name
//                             "generated(5colorDv4_f)"; pass-through
//                             from the per-vertex buffer)
//   brushTexCoord  : float2 (air.vertex_output, generated name
//                             "generated(13brushTexCoordDv2_f)";
//                             pass-through from the per-vertex buffer)
//
// Buffer bindings (!34..!39):
//   uniforms       : MDP3DLineUniforms* (device AS 1, buffer 0,
//                    size 144, align 16). Field layout from !36:
//                      offset  0 : float2 gamma
//                      offset 16 : float4x4 modelViewMatrix
//                                  (four consecutive <4 x float>
//                                  columns; the IR indexes via
//                                  gep i32 1, i32 0, i64 0..3 —
//                                  see %7, %11, %16, %21).
//                      offset 80 : float4x4 projectionMatrix
//                                  (four consecutive <4 x float>
//                                  columns; the IR indexes via
//                                  gep i32 2, i32 0, i64 0..3 —
//                                  see %65, %69, %74, %79).
//   verts          : MDP3DLineVertex* (device AS 1, buffer 1,
//                    size 80, align 16). Field layout from !38:
//                      offset  0 : float  width         (i32 0)
//                      offset  4 : float  direction     (i32 1)
//                      offset 16 : float3 position      (i32 2)
//                      offset 32 : float3 otherPosition (i32 3)
//                      offset 48 : float4 color         (i32 4)
//                      offset 64 : float2 brushTexCoord (i32 5)
//                     (8 trailing padding bytes: [8 x i8].)
//   vert           : uint (air.vertex_id).
//
// Line-by-line map of the .ll body:
//
//   entry:
//     %4  = zext vert to i64                            -- vertex idx.
//     %5  = &verts[vert].position (i32 2, offset 16)
//     %6  = load <3 x float> position                   -- pos.xyz.
//
//     -- modelViewMatrix * float4(pos.xyz, 1.0):
//     %7  = &uniforms.mv[0]     ; %8  = load col0.
//     %9  = splat pos.x         ; %10 = col0 * <px,px,px,px>.
//     %11 = &uniforms.mv[1]     ; %12 = load col1.
//     %13 = splat pos.y         ; %14 = col1 * <py,py,py,py>.
//     %15 = %14 + %10.
//     %16 = &uniforms.mv[2]     ; %17 = load col2.
//     %18 = splat pos.z         ; %19 = col2 * <pz,pz,pz,pz>.
//     %20 = %15 + %19.
//     %21 = &uniforms.mv[3]     ; %22 = load col3.
//     %23 = %20 + col3                                  -- viewPos.
//
//     -- modelViewMatrix * float4(otherPosition.xyz, 1.0):
//     %24 = &verts[vert].otherPosition (i32 3, offset 32).
//     %25 = load <3 x float> otherPosition              -- other.xyz.
//     %26 = splat other.x     ; %27 = %26 * %8   (col0 * other.x).
//     %28 = splat other.y     ; %29 = %28 * %12  (col1 * other.y).
//     %30 = splat other.z     ; %31 = %30 * %17  (col2 * other.z).
//     %32 = %29 + %22   (col1*other.y + col3).
//     %33 = %32 + %27   (+ col0*other.x).
//     %34 = %33 + %31   (+ col2*other.z)                -- viewPosOther.
//        -- NOTE: the fadd order in the .ll is
//        --   ((col1*other.y + col3) + col0*other.x) + col2*other.z
//        -- rather than the "col0*other.x + col1*other.y + col2*other.z
//        --   + col3" order used for viewPos at %15/%20/%23. With
//        --   `fast` math, reassociating these would be legal for the
//        --   compiler, but the actual emitted order is preserved
//        --   literally below because we run without the fast-math
//        --   flag — Math.fround on each intermediate.
//
//     -- perspective divide (per-component divide by lane 3):
//     %35 = splat viewPos.w        ; %36 = viewPos / splat.w      -- viewNdc.
//     %37 = splat viewPosOther.w   ; %38 = viewPosOther / splat.w -- otherNdc.
//     %39 = otherNdc - viewNdc                                  -- ndcDiff.
//
//     -- normalize the .xyzw ndc-space delta (all four lanes).
//     %40 = air.dot.v4f32(ndcDiff, ndcDiff).
//     %41 = air.fast_rsqrt.f32(dot).
//     %42..%43 : splat rsqrt into <4 x float>.
//     %44 = ndcDiff * splat(rsqrt)                              -- unitDir.
//
//     -- build the perpendicular in xy: perp = <-unitDir.y, unitDir.x,
//     --                                        unitDir.z, unitDir.w>.
//     -- (The .zw lanes come through unchanged.)
//     %45 = extractelement unitDir, 1                           -- unitDir.y.
//     %46 = fneg fast %45                                       -- -unitDir.y.
//     %47 = insertelement undef, %46, 0.
//     %48 = shufflevector <%47>, unitDir, <0, 4, 6, 7>          -- perp
//          -- Lane pattern <0, 4, 6, 7>:
//             --   lane 0 <- %47[0] = -unitDir.y
//             --   lane 1 <- unitDir[0] =  unitDir.x
//             --   lane 2 <- unitDir[2] =  unitDir.z
//             --   lane 3 <- unitDir[3] =  unitDir.w
//
//     -- read per-vertex `direction` (float at offset 4, i32 1) and
//     -- `width` (float at offset 0, i32 0):
//     %49 = &verts[vert].direction ; %50 = load direction.
//     %51 = insertelement undef, direction, 0.
//     %52 = &verts[vert].width     ; %53 = load width.
//     %54 = insertelement undef, width, 0.
//     %55 = <direction, poison, poison, poison> * <0.5, poison, poison, poison>
//           -- lane 0 = direction * 0.5.
//     %56 = %55 * <width, poison, poison, poison>
//           -- lane 0 = direction * 0.5 * width  = halfWidthSigned.
//     %57 = shufflevector %56, poison, <0,0,0,0>                -- splat.
//     %58 = %57 * perp
//           -- offsetNdc = perp * halfWidthSigned  (in ndc space).
//     %59 = %58 + viewNdc
//           -- ndcOffsetPoint = viewNdc + offsetNdc.
//     %60 = %59 * splat(viewPos.w)
//           -- clipOffsetPoint = ndcOffsetPoint * viewPos.w    -- undo
//           --   the perspective divide so the projection matrix can
//           --   consume a clip-space (i.e. pre-divide) 4-vector.
//        -- NOTE: %35 is `splat viewPos.w` (shufflevector <3,3,3,3>),
//        --   which is what we multiply by here at %60.
//
//     -- projectionMatrix * clipOffsetPoint:
//     %65 = &uniforms.proj[0] ; %66 = load col0.
//     %67 = splat clip.x      ; %68 = col0 * <cx,cx,cx,cx>.
//     %69 = &uniforms.proj[1] ; %70 = load col1.
//     %71 = splat clip.y      ; %72 = col1 * <cy,cy,cy,cy>.
//     %73 = %68 + %72.
//     %74 = &uniforms.proj[2] ; %75 = load col2.
//     %76 = splat clip.z      ; %77 = col2 * <cz,cz,cz,cz>.
//     %78 = %73 + %77.
//     %79 = &uniforms.proj[3] ; %80 = load col3.
//     %81 = splat clip.w      ; %82 = col3 * <cw,cw,cw,cw>.
//     %83 = %78 + %82                                          -- outPos.
//        -- NOTE: unlike the two model-view products above, this one
//             --   multiplies col3 by clip.w rather than adding it
//             --   directly (i.e. clip is a full float4, not a
//             --   float4(xyz,1)). Preserve literally.
//
//     -- pass-through of the per-vertex color (offset 48, i32 4)
//     --   and brushTexCoord (offset 64, i32 5):
//     %61 = load <4 x float> color.
//     %63 = load <2 x float> brushTexCoord.
//
//     -- build return struct { outPos, color, brushTexCoord }:
//     %84 = insertvalue undef, outPos      , 0.
//     %85 = insertvalue %84  , color       , 1.
//     %86 = insertvalue %85  , brushTexCoord, 2.
//     ret %86.

/**
 * Uniforms buffer for `MDP3DLineVertexFunc` — mirrors the AIR struct
 * at !36 (144-byte record, align 16).
 *
 * Metal's `float4x4` is column-major; each matrix is stored as four
 * consecutive column vectors and indexed by column via `gep i64 0..3`.
 */
export interface MDP3DLineUniforms {
  gamma: [number, number];               // offset  0 : float2
  /** float4x4 modelViewMatrix at offset 16 — four column vectors. */
  modelViewMatrix: [
    [number, number, number, number], // column 0 (offset  16)
    [number, number, number, number], // column 1 (offset  32)
    [number, number, number, number], // column 2 (offset  48)
    [number, number, number, number], // column 3 (offset  64)
  ];
  /** float4x4 projectionMatrix at offset 80 — four column vectors. */
  projectionMatrix: [
    [number, number, number, number], // column 0 (offset  80)
    [number, number, number, number], // column 1 (offset  96)
    [number, number, number, number], // column 2 (offset 112)
    [number, number, number, number], // column 3 (offset 128)
  ];
}

/**
 * Per-vertex input buffer for `MDP3DLineVertexFunc` — mirrors !38
 * (80-byte record, align 16, with 8 trailing padding bytes).
 */
export interface MDP3DLineVertex {
  width: number;                              // offset  0 : float
  direction: number;                          // offset  4 : float
  position: [number, number, number];         // offset 16 : float3
  otherPosition: [number, number, number];    // offset 32 : float3
  color: [number, number, number, number];    // offset 48 : float4
  brushTexCoord: [number, number];            // offset 64 : float2
}

/**
 * Return type of `MDP3DLineVertexFunc` — mirrors the AIR return
 * struct `<{ <4 x float>, <4 x float>, <2 x float> }>` per the
 * !air.vertex output declaration at !30 (position, color,
 * brushTexCoord).
 */
export interface MDP3DLineVertexOutput {
  position: [number, number, number, number]; // air.position
  color: [number, number, number, number];    // air.vertex_output "color"
  brushTexCoord: [number, number];            // air.vertex_output "brushTexCoord"
}

/**
 * Vertex kernel `MDP3DLineVertexFunc`.
 *
 * Renders a 3-D screen-space line ribbon. For each vertex:
 *
 *   1. viewPos       = modelViewMatrix * float4(position, 1.0).
 *   2. viewPosOther  = modelViewMatrix * float4(otherPosition, 1.0).
 *   3. viewNdc       = viewPos / viewPos.w         (per-component).
 *      otherNdc      = viewPosOther / viewPosOther.w.
 *   4. ndcDiff       = otherNdc - viewNdc.
 *   5. unitDir       = ndcDiff * fast_rsqrt(dot(ndcDiff, ndcDiff)).
 *   6. perp          = < -unitDir.y, unitDir.x, unitDir.z, unitDir.w >.
 *   7. offset        = perp * (0.5 * direction * width).
 *      ndcOffsetPt   = viewNdc + offset.
 *      clipOffsetPt  = ndcOffsetPt * viewPos.w.
 *   8. outPos        = projectionMatrix * clipOffsetPt.
 *
 * `color` and `brushTexCoord` are passed through from the per-vertex
 * buffer. `direction` is the signed lateral offset direction
 * (typically -1 for the left rail and +1 for the right rail); `width`
 * is the line thickness. The multiply by `viewPos.w` at step 7 undoes
 * the perspective divide from step 3 so that the final
 * projectionMatrix multiply consumes a proper clip-space vector.
 *
 * Faithful transcription of the IR at %6..%86; column loads at
 * %7/%11/%16/%21 (modelView) and %65/%69/%74/%79 (projection); the
 * unit-vector perpendicular at %45..%48; the offset scaling at
 * %55/%56; the un-divide at %60; the final matrix-vector product at
 * %66..%83.
 *
 * @shader MDP3DLineVertexFunc (MDPKit)
 */
export function MDP3DLineVertexFunc(
  uniforms: MDP3DLineUniforms,
  verts: MDP3DLineVertex[],
  vert: number,
): MDP3DLineVertexOutput {
  // %4 = zext vert to i64 ; index into the vertex buffer.
  const v = verts[vert >>> 0];

  // %5, %6 : load verts[vert].position (float3).
  const px = Math.fround(v.position[0]);
  const py = Math.fround(v.position[1]);
  const pz = Math.fround(v.position[2]);

  // %7..%23 : modelViewMatrix * float4(position, 1.0).
  const mv0 = uniforms.modelViewMatrix[0];
  const mv1 = uniforms.modelViewMatrix[1];
  const mv2 = uniforms.modelViewMatrix[2];
  const mv3 = uniforms.modelViewMatrix[3];

  // %8..%10 : col0 * splat(px).
  const a0_0 = Math.fround(Math.fround(mv0[0]) * px);
  const a0_1 = Math.fround(Math.fround(mv0[1]) * px);
  const a0_2 = Math.fround(Math.fround(mv0[2]) * px);
  const a0_3 = Math.fround(Math.fround(mv0[3]) * px);

  // %12..%15 : col1 * splat(py) + %10.
  const a1_0 = Math.fround(Math.fround(Math.fround(mv1[0]) * py) + a0_0);
  const a1_1 = Math.fround(Math.fround(Math.fround(mv1[1]) * py) + a0_1);
  const a1_2 = Math.fround(Math.fround(Math.fround(mv1[2]) * py) + a0_2);
  const a1_3 = Math.fround(Math.fround(Math.fround(mv1[3]) * py) + a0_3);

  // %17..%20 : col2 * splat(pz) + %15.
  const a2_0 = Math.fround(Math.fround(Math.fround(mv2[0]) * pz) + a1_0);
  const a2_1 = Math.fround(Math.fround(Math.fround(mv2[1]) * pz) + a1_1);
  const a2_2 = Math.fround(Math.fround(Math.fround(mv2[2]) * pz) + a1_2);
  const a2_3 = Math.fround(Math.fround(Math.fround(mv2[3]) * pz) + a1_3);

  // %22..%23 : col3 + %20  (implicit w = 1). viewPos.
  const view_0 = Math.fround(a2_0 + Math.fround(mv3[0]));
  const view_1 = Math.fround(a2_1 + Math.fround(mv3[1]));
  const view_2 = Math.fround(a2_2 + Math.fround(mv3[2]));
  const view_3 = Math.fround(a2_3 + Math.fround(mv3[3]));

  // %24, %25 : load verts[vert].otherPosition (float3).
  const ox = Math.fround(v.otherPosition[0]);
  const oy = Math.fround(v.otherPosition[1]);
  const oz = Math.fround(v.otherPosition[2]);

  // %26..%31 : compute col0*other.x (b0), col1*other.y (b1),
  //   col2*other.z (b2) — each as a lane-broadcast fmul.
  const b0_0 = Math.fround(Math.fround(mv0[0]) * ox);
  const b0_1 = Math.fround(Math.fround(mv0[1]) * ox);
  const b0_2 = Math.fround(Math.fround(mv0[2]) * ox);
  const b0_3 = Math.fround(Math.fround(mv0[3]) * ox);

  const b1_0 = Math.fround(Math.fround(mv1[0]) * oy);
  const b1_1 = Math.fround(Math.fround(mv1[1]) * oy);
  const b1_2 = Math.fround(Math.fround(mv1[2]) * oy);
  const b1_3 = Math.fround(Math.fround(mv1[3]) * oy);

  const b2_0 = Math.fround(Math.fround(mv2[0]) * oz);
  const b2_1 = Math.fround(Math.fround(mv2[1]) * oz);
  const b2_2 = Math.fround(Math.fround(mv2[2]) * oz);
  const b2_3 = Math.fround(Math.fround(mv2[3]) * oz);

  // %32 = b1 + col3.
  const s32_0 = Math.fround(b1_0 + Math.fround(mv3[0]));
  const s32_1 = Math.fround(b1_1 + Math.fround(mv3[1]));
  const s32_2 = Math.fround(b1_2 + Math.fround(mv3[2]));
  const s32_3 = Math.fround(b1_3 + Math.fround(mv3[3]));

  // %33 = %32 + b0.
  const s33_0 = Math.fround(s32_0 + b0_0);
  const s33_1 = Math.fround(s32_1 + b0_1);
  const s33_2 = Math.fround(s32_2 + b0_2);
  const s33_3 = Math.fround(s32_3 + b0_3);

  // %34 = %33 + b2.  viewPosOther.
  const other_0 = Math.fround(s33_0 + b2_0);
  const other_1 = Math.fround(s33_1 + b2_1);
  const other_2 = Math.fround(s33_2 + b2_2);
  const other_3 = Math.fround(s33_3 + b2_3);

  // %35, %36 : viewPos / splat(viewPos.w).
  const invW_view = view_3;
  const viewNdc_0 = Math.fround(view_0 / invW_view);
  const viewNdc_1 = Math.fround(view_1 / invW_view);
  const viewNdc_2 = Math.fround(view_2 / invW_view);
  const viewNdc_3 = Math.fround(view_3 / invW_view);

  // %37, %38 : viewPosOther / splat(viewPosOther.w).
  const invW_other = other_3;
  const otherNdc_0 = Math.fround(other_0 / invW_other);
  const otherNdc_1 = Math.fround(other_1 / invW_other);
  const otherNdc_2 = Math.fround(other_2 / invW_other);
  const otherNdc_3 = Math.fround(other_3 / invW_other);

  // %39 : ndcDiff = otherNdc - viewNdc.
  const d0 = Math.fround(otherNdc_0 - viewNdc_0);
  const d1 = Math.fround(otherNdc_1 - viewNdc_1);
  const d2 = Math.fround(otherNdc_2 - viewNdc_2);
  const d3 = Math.fround(otherNdc_3 - viewNdc_3);

  // %40 : air.dot.v4f32(ndcDiff, ndcDiff) — strict left-to-right
  //   fp32 sum. The intrinsic contract is a single implementation-
  //   defined reduction; here we transcribe it as
  //   (((d0*d0) + (d1*d1)) + (d2*d2)) + (d3*d3) with Math.fround on
  //   each partial. `fast_math_enable` does not permit us to invent
  //   a different order — we take the AIR-compiled canonical one.
  const d0sq = Math.fround(d0 * d0);
  const d1sq = Math.fround(d1 * d1);
  const d2sq = Math.fround(d2 * d2);
  const d3sq = Math.fround(d3 * d3);
  const dot = Math.fround(
    Math.fround(Math.fround(d0sq + d1sq) + d2sq) + d3sq,
  );

  // %41 : air.fast_rsqrt.f32(dot) — fp32-narrowed reciprocal sqrt.
  const rsqrt = Math.fround(1.0 / Math.fround(Math.sqrt(dot)));

  // %42..%44 : ndcDiff * splat(rsqrt) = unitDir (a <4 x float>).
  const unit_0 = Math.fround(d0 * rsqrt);
  const unit_1 = Math.fround(d1 * rsqrt);
  const unit_2 = Math.fround(d2 * rsqrt);
  const unit_3 = Math.fround(d3 * rsqrt);

  // %45..%48 : perp = < -unitDir.y, unitDir.x, unitDir.z, unitDir.w >.
  const perp_0 = Math.fround(-unit_1);
  const perp_1 = unit_0;
  const perp_2 = unit_2;
  const perp_3 = unit_3;

  // %49, %50 : load verts[vert].direction (float at offset 4, i32 1).
  const direction = Math.fround(v.direction);
  // %52, %53 : load verts[vert].width (float at offset 0, i32 0).
  const width = Math.fround(v.width);

  // %55, %56 : halfWidthSigned = direction * 0.5 * width.
  //   IR order: (direction * 0.5) first, then * width. Preserve.
  const halfWidthSigned = Math.fround(
    Math.fround(direction * Math.fround(0.5)) * width,
  );
  // %57, %58 : splat(halfWidthSigned) * perp = offsetNdc.
  const off_0 = Math.fround(halfWidthSigned * perp_0);
  const off_1 = Math.fround(halfWidthSigned * perp_1);
  const off_2 = Math.fround(halfWidthSigned * perp_2);
  const off_3 = Math.fround(halfWidthSigned * perp_3);

  // %59 : ndcOffsetPoint = offsetNdc + viewNdc.
  const ndcOff_0 = Math.fround(off_0 + viewNdc_0);
  const ndcOff_1 = Math.fround(off_1 + viewNdc_1);
  const ndcOff_2 = Math.fround(off_2 + viewNdc_2);
  const ndcOff_3 = Math.fround(off_3 + viewNdc_3);

  // %60 : clipOffsetPoint = ndcOffsetPoint * splat(viewPos.w) —
  //   undoes the perspective divide from %36 so the following
  //   projection multiply consumes a proper clip-space vector.
  const clip_0 = Math.fround(ndcOff_0 * view_3);
  const clip_1 = Math.fround(ndcOff_1 * view_3);
  const clip_2 = Math.fround(ndcOff_2 * view_3);
  const clip_3 = Math.fround(ndcOff_3 * view_3);

  // %61, %62 : load verts[vert].color (float4, i32 4).
  const colorOut: [number, number, number, number] = [
    Math.fround(v.color[0]),
    Math.fround(v.color[1]),
    Math.fround(v.color[2]),
    Math.fround(v.color[3]),
  ];
  // %63, %64 : load verts[vert].brushTexCoord (float2, i32 5).
  const brushTexCoordOut: [number, number] = [
    Math.fround(v.brushTexCoord[0]),
    Math.fround(v.brushTexCoord[1]),
  ];

  // %65..%83 : projectionMatrix * clipOffsetPoint.
  const pj0 = uniforms.projectionMatrix[0];
  const pj1 = uniforms.projectionMatrix[1];
  const pj2 = uniforms.projectionMatrix[2];
  const pj3 = uniforms.projectionMatrix[3];

  // %66..%68 : col0 * splat(clip.x).
  const p0_0 = Math.fround(Math.fround(pj0[0]) * clip_0);
  const p0_1 = Math.fround(Math.fround(pj0[1]) * clip_0);
  const p0_2 = Math.fround(Math.fround(pj0[2]) * clip_0);
  const p0_3 = Math.fround(Math.fround(pj0[3]) * clip_0);

  // %70..%73 : col1 * splat(clip.y) + %68.
  const p1_0 = Math.fround(p0_0 + Math.fround(Math.fround(pj1[0]) * clip_1));
  const p1_1 = Math.fround(p0_1 + Math.fround(Math.fround(pj1[1]) * clip_1));
  const p1_2 = Math.fround(p0_2 + Math.fround(Math.fround(pj1[2]) * clip_1));
  const p1_3 = Math.fround(p0_3 + Math.fround(Math.fround(pj1[3]) * clip_1));

  // %75..%78 : col2 * splat(clip.z) + %73.
  const p2_0 = Math.fround(p1_0 + Math.fround(Math.fround(pj2[0]) * clip_2));
  const p2_1 = Math.fround(p1_1 + Math.fround(Math.fround(pj2[1]) * clip_2));
  const p2_2 = Math.fround(p1_2 + Math.fround(Math.fround(pj2[2]) * clip_2));
  const p2_3 = Math.fround(p1_3 + Math.fround(Math.fround(pj2[3]) * clip_2));

  // %80..%83 : col3 * splat(clip.w) + %78. Note this is a FULL
  //   multiply — unlike the two model-view products above, clip has
  //   no implicit w = 1.
  const positionOut: [number, number, number, number] = [
    Math.fround(p2_0 + Math.fround(Math.fround(pj3[0]) * clip_3)),
    Math.fround(p2_1 + Math.fround(Math.fround(pj3[1]) * clip_3)),
    Math.fround(p2_2 + Math.fround(Math.fround(pj3[2]) * clip_3)),
    Math.fround(p2_3 + Math.fround(Math.fround(pj3[3]) * clip_3)),
  ];

  // %84..%86 : build return struct { position, color, brushTexCoord }.
  return {
    position: positionOut,
    color: colorOut,
    brushTexCoord: brushTexCoordOut,
  };
}
