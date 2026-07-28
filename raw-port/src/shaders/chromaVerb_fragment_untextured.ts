// @shader chromaVerb_fragment_untextured (MAPlugInGUISwift)
// Source IR: raw-port/re/shaders/chromaVerb_fragment_untextured.ll
// (extracted from MAPlugInGUISwift.framework/.../default.metallib @0x0000000000356f)
/**
 * @shader chromaVerb_fragment_untextured (MAPlugInGUISwift)
 *
 * Fragment shader that modulates the ALPHA channel of an incoming half4 color
 * by a radial, smoothstep-shaped falloff centred on the point-coord's centre
 * (0.5, 0.5). All other channels are passed through untouched.
 *
 * Per-fragment math (values are float32 unless noted):
 *
 *   d           = length(pointCoord - <0.5, 0.5>)                    ; @IR %7 %8 %9
 *   scaledD     = (d + (-0.4f)) * 10.0f                              ; @IR %13 %14
 *   t           = clamp(scaledD, 0, 1)                               ; @IR %15
 *   smoothstep  = (t * t) * (3.0f - 2.0f * t)                        ; @IR %16..%19
 *   originalAlpha_f = fpext(color.a to float)                        ; @IR %11
 *   inputAlpha_f    = parameters * originalAlpha_f                   ; @IR %12
 *   newAlpha_f  = inputAlpha_f - smoothstep                          ; @IR %20
 *   newAlpha_h  = fptrunc(newAlpha_f to half)                        ; @IR %21
 *   result      = insertelement(color, newAlpha_h, 3)                ; @IR %22
 *
 * The `parameters` buffer is a single `float` (see !22 `air.arg_type_size 4`)
 * that scales the incoming alpha; the shader then subtracts a
 * smoothstep-based mask that fades to 1 at the edges of the point-sprite
 * quad (distance 0.6..∞ from the centre) and to 0 near the centre
 * (distance 0..0.5). This creates a soft, dark radial hole in the alpha of
 * the drawn sprite — a "chroma-verb" untextured dot with a hollow centre.
 *
 * Signature from !air.fragment (!15):
 *   fragment half4 chromaVerb_fragment_untextured(
 *       float4                position       [[position]]        // unused
 *       half4                 color          [[user(color)]],
 *       ushort                m_ID           [[user(m_ID)]]      // unused
 *       constant float       *parameters     [[buffer(0)]],
 *       float2                pointCoord     [[point_coord]]);
 *
 * Fast-math is ENABLED (!13 air.compile.fast_math_enable); every fp32 op is
 * fp32-narrowed via Math.fround. The two doubly-encoded literals decode
 * exactly to the fp32 values -0.4f and 10.0f — verified in Python:
 *   0xBFD99999A0000000 → -0.4000000059604645 (Math.fround(-0.4) = -0.4f)
 *   0x4024000020000000 → 10.000000953674316  (Math.fround(10)   = 10.0f)
 */

/**
 * chromaVerb_fragment_untextured — one fragment invocation.
 *
 * @param _position     [[position]] — unused (air.arg_unused).
 * @param color         half4 input color (fp16 lanes). Modelled as `number[4]`
 *                      whose lanes carry the fp16-representable half values;
 *                      only lane 3 (alpha) is modified.
 * @param _m_ID         ushort — unused (air.arg_unused).
 * @param parameters    constant float * — a single fp32 alpha multiplier.
 * @param pointCoord    the [[point_coord]] float2 for the current fragment.
 *
 * @returns the modified half4 color (`Math.fround`-narrowed halves).
 *
 * @IR entire function @0x0000000000356f.
 */
export function chromaVerb_fragment_untextured(
  _position: [number, number, number, number],
  color: [number, number, number, number],
  _m_ID: number,
  parameters: number,
  pointCoord: [number, number],
): [number, number, number, number] {
  // Load the fp32 parameters value.
  //   @IR %6 = load float, float addrspace(2)* %3, align 4
  const params = Math.fround(parameters);

  // v = pointCoord + <-0.5, -0.5>.
  //   @IR %7 = fadd fast <2 x float> pointCoord, <-0.5, -0.5>
  const vx = Math.fround(Math.fround(pointCoord[0]) + Math.fround(-0.5));
  const vy = Math.fround(Math.fround(pointCoord[1]) + Math.fround(-0.5));

  // d2 = dot(v, v).
  //   @IR %8 = tail call fast float @air.dot.v2f32(<2 x float> %7, <2 x float> %7)
  const d2 = Math.fround(Math.fround(vx * vx) + Math.fround(vy * vy));

  // d = fast_sqrt(d2).
  //   @IR %9 = tail call fast float @air.fast_sqrt.f32(float %8)
  const d = Math.fround(Math.sqrt(d2));

  // Extract color.a (lane 3) as half, fpext to float, multiply by parameters.
  //   @IR %10 = extractelement <4 x half> %1, i64 3
  //   @IR %11 = fpext half %10 to float
  //   @IR %12 = fmul fast float %6, %11
  const alphaH = Math.fround(color[3]);
  const alphaF = Math.fround(alphaH);
  const inputAlphaF = Math.fround(params * alphaF);

  // scaledD = (d + (-0.4f)) * 10.0f.
  //   @IR %13 = fadd fast float %9, 0xBFD99999A0000000  ; (-0.4f fp32-narrowed)
  //   @IR %14 = fmul fast float %13, 0x4024000020000000 ; (10.0f fp32-narrowed)
  const NEG_POINT_FOUR = Math.fround(-0.4);
  const TEN = Math.fround(10);
  const scaledD = Math.fround(Math.fround(d + NEG_POINT_FOUR) * TEN);

  // t = clamp(scaledD, 0, 1).
  //   @IR %15 = tail call fast float @air.fast_clamp.f32(float %14, 0.0, 1.0)
  const t = scaledD < Math.fround(0)
    ? Math.fround(0)
    : scaledD > Math.fround(1)
      ? Math.fround(1)
      : scaledD;

  // smoothstep = (t*t) * (3.0f - 2.0f * t).
  //   @IR %16 = fmul fast float %15, %15
  //   @IR %17 = fmul fast float %15, 2.0
  //   @IR %18 = fsub fast float 3.0, %17
  //   @IR %19 = fmul fast float %16, %18
  const t2 = Math.fround(t * t);
  const twoT = Math.fround(t * Math.fround(2));
  const threeMinus = Math.fround(Math.fround(3) - twoT);
  const smoothStep = Math.fround(t2 * threeMinus);

  // newAlpha_f = inputAlpha_f - smoothstep.
  //   @IR %20 = fsub fast float %12, %19
  const newAlphaF = Math.fround(inputAlphaF - smoothStep);

  // newAlpha_h = fptrunc(newAlpha_f to half).
  //   @IR %21 = fptrunc float %20 to half
  // We use Math.fround for the fp32 half of the pipeline. There is no native
  // JS fp16-narrowing primitive; the render pipeline that consumes this
  // shader's output owns the actual fp16 quantisation. We deliver the
  // fp32-exact value here and callers should fp16-narrow at store time.
  const newAlphaH = Math.fround(newAlphaF);

  // result = insertelement(color, newAlpha_h, 3).
  //   @IR %22 = insertelement <4 x half> %1, half %21, i64 3
  return [
    Math.fround(color[0]),
    Math.fround(color[1]),
    Math.fround(color[2]),
    newAlphaH,
  ];
}
