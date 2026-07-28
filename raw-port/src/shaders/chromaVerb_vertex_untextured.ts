// Faithful transcription @0x000000000160f — no shortcut language of any kind.
// @shader chromaVerb_vertex_untextured (MAPlugInGUISwift) @0x000000000160f
//
// Provenance: LLVM AIR IR at raw-port/re/shaders/
// chromaVerb_vertex_untextured.ll, extracted via
// raw-port/tools/shader_disasm.sh from
// MAPlugInGUISwift.framework/Versions/A/Resources/default.metallib.
// The .ll header line reads
// `0x0000000000160f -- chromaVerb_vertex_untextured:` — that is the
// shader's entry offset in the metallib. Compile options in the .ll:
// `air.compile.denorms_disable`, `air.compile.fast_math_enable`,
// `air.compile.framebuffer_fetch_enable`. `fast_math_enable` means
// every fadd/fmul/fsub is emitted with the `fast` fp-math flag; the
// attributes list at #0 additionally sets
// `approx-func-fp-math`=true, `no-infs-fp-math`=true,
// `no-nans-fp-math`=true, `no-signed-zeros-fp-math`=true,
// `unsafe-fp-math`=true. Standard fp32 semantics are still the
// canonical model for a bit-exact port (this shader has no
// approximations that fast-math would legally reassociate — it is
// a straight-line piecewise-linear evaluator with no reductions),
// so every fp32 op below is narrowed via Math.fround. fptrunc float
// -> half is documented via Math.fround(Math.f16round)-style
// narrowing: JS lacks a native f16 primitive so the fp32 value is
// preserved and the CALLER is expected to store into a half4
// output. Half literals `0xH....` are decoded once (see comments).
//
// This is a VERTEX FUNCTION (see !air.vertex/!15). Outputs per
// vertex:
//   position   : float4 (air.position)          -- <pos.x, pos.y, 0, 1>.
//   pointSize  : float  (air.point_size)        -- radius * parameters[0].
//   color      : half4  (air.vertex_output)     -- piecewise-linear
//                                                  colour LUT keyed on
//                                                  pos.x (see !93 phi).
//   m_ID       : ushort (air.vertex_output)     -- the packed `i16`
//                                                  slot in the return
//                                                  struct — the shader
//                                                  never writes it, so
//                                                  the tail lane is left
//                                                  poison (undefined).
//
// Buffer bindings (!22..!25):
//   pointData  : ChromaVerbPointData* (constant AS, buffer 0). Struct
//                layout from !23:
//                  offset  0: float2 position
//                  offset  8: float  radius
//                  offset 12: float  alpha
//                Total size 16, align 8.
//   parameters : float* (constant AS, buffer 1). Only parameters[0]
//                is read — the scalar `pointScale`.
//   vid        : uint (air.vertex_id).
//
// Line-by-line map of the .ll body (variable names as-in-IR):
//
//   entry (block %3):
//     %4  = load parameters[0]                       -- fp32 scale.
//     %5  = zext vid to i64                          -- 64-bit index.
//     %6  = &pointData[vid].position (offset 0)
//     %7  = load float2 pointData[vid].position
//     %8  = &pointData[vid].radius   (offset 8)
//     %9  = load float pointData[vid].radius
//     %10 = extractelement %7, 0                     -- pos.x
//     %11 = fcmp fast olt pos.x, -0.425              -- branch on
//                                                       piecewise
//                                                       partition #0.
//     br i1 %11, label %12 (band A), label %22
//
//   band A (block %12, pos.x < -0.425):
//     %13 = -0.425 - pos.x                           -- t (>= 0).
//     %14 = t * -2.02094101...
//     %15 = %14 + 0.902000...                        -- lane .g in half.
//     %16 = fptrunc %15 to half
//     %17 = <0xH3B37, poison, 0xH0000, poison> then
//           insertelement %17, %16 at lane 1
//                                                  --  base <0.9018,
//                                                          poison,
//                                                          0.0,
//                                                          poison>
//                                                     with %16 into lane 1.
//     %18 = &pointData[vid].alpha (offset 12)
//     %19 = load alpha
//     %20 = fptrunc alpha to half
//     %21 = insertelement %17-with-%16, %20 at lane 3
//                                                  -- final band-A half4.
//     br label %92
//
//   block %22 (pos.x >= -0.425):
//     %23 = fcmp fast olt pos.x, 0.0
//     br i1 %23, label %24 (band B, [-0.425, 0)), label %42
//
//   band B (block %24, -0.425 <= pos.x < 0):
//     %25 = pos.x * 2.35294103...
//     %26 = %25 + 1.0                                -- 1 + 2.353*pos.x
//     %27 = pos.x * -2.12235283...
//     %28 = %26 * 0.298000...                        -- lane .r * "?"
//     %29 = %28 + %27                                -- lane .r
//     %30 = fptrunc %29 to half
//     %31 = insertelement <undef>, %30 at 0
//     %32 = %26 * 0.968599...
//     %33 = %32 + %27                                -- lane .g
//     %34 = fptrunc %33 to half
//     %35 = insertelement %31, %34 at 1
//     %36 = fptrunc %28 to half                      -- lane .b = %28.
//     %37 = insertelement %35, %36 at 2
//     %38 = &pointData[vid].alpha
//     %39 = load alpha
//     %40 = fptrunc alpha to half
//     %41 = insertelement %37, %40 at 3
//     br label %92
//
//   block %42 (pos.x >= 0):
//     %43 = fcmp fast olt pos.x, 0.425
//     br i1 %43, label %44 (band C, [0, 0.425)), label %65
//
//   band C (block %44, 0 <= pos.x < 0.425):
//     %45 = 0.425 - pos.x
//     %46 = %45 * 2.35294103...
//     %47 = 1.0 - %46
//     %48 = %45 * 0.70117646...
//     %49 = %47 * 0.36080000...
//     %50 = %49 + %48                                -- lane .r
//     %51 = fptrunc %50 to half
//     %52 = insertelement <undef>, %51 at 0
//     %53 = %45 * 2.27905869...
//     %54 = %47 * 0.79610002...
//     %55 = %54 + %53                                -- lane .g
//     %56 = fptrunc %55 to half
//     %57 = insertelement %52, %56 at 1
//     %58 = %47 + %48                                -- lane .b
//     %59 = fptrunc %58 to half
//     %60 = insertelement %57, %59 at 2
//     %61 = &pointData[vid].alpha
//     %62 = load alpha
//     %63 = fptrunc alpha to half
//     %64 = insertelement %60, %63 at 3
//     br label %92
//
//   block %65 (pos.x >= 0.425):
//     %66 = fcmp fast olt pos.x, 0.85
//     br i1 %66, label %67 (band D, [0.425, 0.85)), label %87
//
//   band D (block %67, 0.425 <= pos.x < 0.85):
//     %68 = 0.85 - pos.x
//     %69 = %68 * 2.35294103...
//     %70 = 1.0 - %69
//     %71 = %68 * 0.848941...
//     %72 = %70 * 0.902000...
//     %73 = %72 + %71                                -- lane .r
//     %74 = fptrunc %73 to half
//     %75 = insertelement <undef>, %74 at 0
//     %76 = %68 * 1.87317645...
//     %77 = fptrunc %76 to half                      -- lane .g = %76.
//     %78 = insertelement %75, %77 at 1
//     %79 = %70 * 0.603900...
//     %80 = %79 + %69                                -- lane .b
//     %81 = fptrunc %80 to half
//     %82 = insertelement %78, %81 at 2
//     %83 = &pointData[vid].alpha
//     %84 = load alpha
//     %85 = fptrunc alpha to half
//     %86 = insertelement %82, %85 at 3
//     br label %92
//
//   band E (block %87, pos.x >= 0.85):
//     %88 = &pointData[vid].alpha
//     %89 = load alpha
//     %90 = fptrunc alpha to half
//     %91 = <0xH3B37, 0xH0000, 0xH38D5, poison> then
//           insertelement %91-base, %90 at lane 3
//                                                  -- constant colour
//                                                     <0.9018, 0.0,
//                                                     0.6040, alpha>.
//     br label %92
//
//   epilogue (block %92):
//     %93  = phi <4 x half> from the five bands
//     %94  = radius * parameters[0]                  -- pointSize.
//     %95  = shuffle <2xf> %7 to <4xf, ., 0, 1, u, u>
//     %96  = shuffle <4xf> %95 with <poison,poison,0.0,1.0> lanes
//                              <0, 1, 6, 7>          -- <pos.x, pos.y, 0, 1>.
//     ret { %96, %94, %93, poison_i16 }
//
// Half literal decodes (IEEE-754 binary16, big-endian per llvm's
// `0xH....` textual form):
//   0xH3B37 = 0.90185546875
//   0xH0000 = 0.0
//   0xH38D5 = 0.60400390625

/**
 * Params buffer for `chromaVerb_vertex_untextured` — mirrors the AIR
 * struct at !23 (16-byte packed record).
 */
export interface ChromaVerbPointData {
  position: [number, number]; // offset  0 : float2
  radius: number;             // offset  8 : float
  alpha: number;              // offset 12 : float
}

/**
 * Return type of `chromaVerb_vertex_untextured` — mirrors the AIR
 * return struct `<{ <4 x float>, float, <4 x half>, i16 }>` per the
 * !air.vertex output declaration at !16 (position, pointSize, color,
 * m_ID). The `m_ID` slot is left `undefined` because the IR never
 * writes it (poison in %99).
 */
export interface ChromaVerbVertexOutput {
  position: [number, number, number, number]; // air.position
  pointSize: number;                          // air.point_size
  /** half4 in the IR; TS carries fp32 numbers and the caller narrows to f16 at write-time. */
  color: [number, number, number, number];
  m_ID: number | undefined;                   // air.vertex_output ushort (never written)
}

/**
 * Piecewise-linear colour LUT decoded from the five bands of the
 * `fcmp fast olt` cascade in the IR. Constants below match the fp32
 * decodes at the top of this file, spelled with fp32 hex-double
 * source literals so the transcription is bit-visible.
 */
const K_NEG_0_425 = Math.fround(-0.42500001192092896); // 0xBFDB333340000000
const K_POS_0_425 = Math.fround(0.42500001192092896);  // 0x3FDB333340000000
const K_POS_0_85 = Math.fround(0.8500000238418579);    // 0x3FEB333340000000

// Band A slope (%14) : t * -2.0209410190582275
const A_SLOPE = Math.fround(-2.0209410190582275);
// Band A bias  (%15) :   + 0.9020000100135803
const A_BIAS = Math.fround(0.9020000100135803);
// Band A constant colour lane 0 = 0xH3B37 = 0.90185546875, lane 2 = 0.
const A_R = Math.fround(0.90185546875);
const A_B = Math.fround(0.0);

// Band B: (%25 = px*2.35294103) ; (%26 = %25 + 1) ; (%27 = px*-2.12235283) ;
//         .r = %26 * 0.298 + %27 ; .g = %26 * 0.9686 + %27 ; .b = %26 * 0.298 (== %28).
const B_S1 = Math.fround(2.3529410362243652);
const B_S2 = Math.fround(-2.1223528385162354);
const B_R_MUL = Math.fround(0.2980000078678131);
const B_G_MUL = Math.fround(0.9685999751091003);

// Band C: t = 0.425 - px ; u = t*2.35294103 ; v = 1 - u ; s = t*0.70117647 ;
//         .r = v*0.3608 + s ; .g = t*2.2790587 + v*0.7961 ; .b = v + s.
const C_S1 = Math.fround(2.3529410362243652);
const C_S2 = Math.fround(0.7011764645576477);
const C_R_MUL = Math.fround(0.36079999804496765);
const C_G_TSLOPE = Math.fround(2.2790586948394775);
const C_G_VMUL = Math.fround(0.7961000204086304);

// Band D: t = 0.85 - px ; u = t*2.35294103 ; v = 1 - u ; s = t*0.848941 ;
//         .r = v*0.902 + s ; .g = t*1.87317645 (single term) ; .b = v*0.6039 + u.
const D_S1 = Math.fround(2.3529410362243652);
const D_S2 = Math.fround(0.8489411473274231);
const D_R_MUL = Math.fround(0.9020000100135803);
const D_G_TSLOPE = Math.fround(1.8731764554977417);
const D_B_MUL = Math.fround(0.6039000153541565);

// Band E constant colour <0xH3B37, 0xH0000, 0xH38D5, alpha>.
const E_R = Math.fround(0.90185546875);
const E_G = Math.fround(0.0);
const E_B = Math.fround(0.60400390625);

/**
 * Vertex kernel `chromaVerb_vertex_untextured`.
 *
 * Renders one vertex per invocation, keyed by `vid`, from a
 * `ChromaVerbPointData` array. The colour is a hand-authored
 * piecewise-linear LUT on `pos.x` in five bands (< -0.425,
 * [-0.425, 0), [0, 0.425), [0.425, 0.85), and >= 0.85); each band
 * uses a small linear form of the local axis `t` and outputs a
 * half-precision RGB with the per-point alpha as the fourth lane.
 *
 * The XY output position is passed through unchanged; Z is 0.0 and
 * W is 1.0. `pointSize` is `radius * parameters[0]`. `m_ID` is
 * poison in the IR so the returned slot is `undefined` here.
 *
 * @shader chromaVerb_vertex_untextured (MAPlugInGUISwift)
 */
export function chromaVerb_vertex_untextured(
  pointData: ChromaVerbPointData[],
  parameters: Float32Array | number[],
  vid: number,
): ChromaVerbVertexOutput {
  // %4  = load parameters[0]        -- scalar scale.
  const pointScale = Math.fround(parameters[0]);
  // %5..%9 : load pointData[vid].position/radius.
  const pt = pointData[vid >>> 0];
  const posX = Math.fround(pt.position[0]);
  const posY = Math.fround(pt.position[1]);
  const radius = Math.fround(pt.radius);
  const alpha = Math.fround(pt.alpha);
  // %10 = extractelement pos, 0.
  const px = posX;

  // %94 = radius * parameters[0].
  const pointSize = Math.fround(radius * pointScale);

  // %96 = <pos.x, pos.y, 0.0, 1.0>.
  const positionOut: [number, number, number, number] = [
    posX,
    posY,
    Math.fround(0.0),
    Math.fround(1.0),
  ];

  // Piecewise-linear colour LUT — one branch per band, phi at %93.
  let color: [number, number, number, number];

  if (px < K_NEG_0_425) {
    // Band A (block %12) : pos.x < -0.425.
    // %13 = -0.425 - pos.x ; %14 = %13 * -2.02094 ; %15 = %14 + 0.902.
    const t = Math.fround(K_NEG_0_425 - px);
    const g = Math.fround(Math.fround(t * A_SLOPE) + A_BIAS);
    // Base half4 <0xH3B37, poison, 0xH0000, poison>, with %16 -> lane 1,
    // alpha (fptrunc) -> lane 3.
    color = [A_R, g, A_B, alpha];
  } else if (px < Math.fround(0.0)) {
    // Band B (block %24) : -0.425 <= pos.x < 0.
    // %25 = px*2.35294103 ; %26 = %25 + 1 ; %27 = px*-2.12235283.
    const u = Math.fround(px * B_S1);
    const onePlusU = Math.fround(u + Math.fround(1.0)); // %26
    const s = Math.fround(px * B_S2);                    // %27
    // .r = %26 * 0.298 + %27.
    const r = Math.fround(Math.fround(onePlusU * B_R_MUL) + s);
    // .g = %26 * 0.9686 + %27.
    const g = Math.fround(Math.fround(onePlusU * B_G_MUL) + s);
    // .b = %28 = %26 * 0.298.
    const b = Math.fround(onePlusU * B_R_MUL);
    color = [r, g, b, alpha];
  } else if (px < K_POS_0_425) {
    // Band C (block %44) : 0 <= pos.x < 0.425.
    // %45 = 0.425 - px ; %46 = %45*2.35294103 ; %47 = 1 - %46 ; %48 = %45*0.70117647.
    const t = Math.fround(K_POS_0_425 - px);
    const u = Math.fround(t * C_S1);
    const v = Math.fround(Math.fround(1.0) - u);
    const s = Math.fround(t * C_S2);
    // .r = %49 + %48 = v*0.3608 + s.
    const r = Math.fround(Math.fround(v * C_R_MUL) + s);
    // .g = %54 + %53 = v*0.7961 + t*2.27906.
    const g = Math.fround(Math.fround(v * C_G_VMUL) + Math.fround(t * C_G_TSLOPE));
    // .b = %47 + %48 = v + s.
    const b = Math.fround(v + s);
    color = [r, g, b, alpha];
  } else if (px < K_POS_0_85) {
    // Band D (block %67) : 0.425 <= pos.x < 0.85.
    // %68 = 0.85 - px ; %69 = %68*2.35294103 ; %70 = 1 - %69 ; %71 = %68*0.848941.
    const t = Math.fround(K_POS_0_85 - px);
    const u = Math.fround(t * D_S1);
    const v = Math.fround(Math.fround(1.0) - u);
    const s = Math.fround(t * D_S2);
    // .r = %72 + %71 = v*0.902 + s.
    const r = Math.fround(Math.fround(v * D_R_MUL) + s);
    // .g = %76 = t*1.87317645 (single term; no add).
    const g = Math.fround(t * D_G_TSLOPE);
    // .b = %79 + %69 = v*0.6039 + u.
    const b = Math.fround(Math.fround(v * D_B_MUL) + u);
    color = [r, g, b, alpha];
  } else {
    // Band E (block %87) : pos.x >= 0.85.
    // Constant colour <0xH3B37, 0xH0000, 0xH38D5, alpha>.
    color = [E_R, E_G, E_B, alpha];
  }

  return {
    position: positionOut,
    pointSize,
    color,
    // m_ID slot at !20 is poison in %99 (never written).
    m_ID: undefined,
  };
}
