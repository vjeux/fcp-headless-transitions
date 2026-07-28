// @shader waveform_vertex_shader (Flexo)
// Transcribed from Flexo.framework/Versions/A/Resources/default.metallib.
// IR: raw-port/re/shaders/waveform_vertex_shader.ll (287 lines).
//
// This is the main VERTEX shader for the FCP video-scope waveform.  It
// shares the private "_Z19waveform_rasterizerPU11MTLconstantK16waveform
// _state_tfDv4_Dh" helper with waveform_bg_pass_vertex_shader.ts (same
// mangled name, identical body).  The two entry points differ in what
// they do with the rasterizer's `carriedColor` (field 1):
//   • waveform_bg_pass_vertex_shader → overwrites with a fixed gray.
//   • waveform_vertex_shader (THIS)  → keeps rasterizer's carriedColor
//     only for modes 3 and 6; otherwise replaces it with a
//     state-provided <4 x float> uniform (state.field6). It then
//     computes a smoothstep-scaled alpha from state.field3 and writes
//     that alpha into lane 3 of the output color.
//
// Modes (32-bit switch key at state[i32 7], same as _bg_pass variant):
//   0 → luminance channel  (r-lane)
//   1 → luminance channel  (g-lane)
//   2 → luminance channel  (b-lane)
//   3 → chroma-magnitude   (KEEP rasterizer color)
//   4 → chroma Cb + 0.5
//   5 → chroma Cr + 0.5
//   6 → per the switch table in %14, keeps rasterizer color
//   default (else) → replace rasterizer color with state.field6 uniform
//
// GATE NOTE: fast-math (reassoc/afn); plain JS float ops with Math.fround
// at fp32 boundaries.  No fp32-narrowed pow() constants — the two double
// bit patterns present are the alpha-curve coefficients:
//   0x3FD072B020000000 = fp32-narrowed 0.25699999928474426  (curve gain)
//   0x3FA0F27BC0000000 = fp32-narrowed 0.03310000151395798  (curve bias)

/**
 * A sample callback for texture reads.  See waveform_bg_pass_vertex_shader
 * for the AIR intrinsic mapping.
 * @shader waveform_vertex_shader (Flexo) IR %8
 */
export type TextureSample2D = (uv: [number, number]) => [number, number, number, number];

/**
 * Uniform state buffer.  Field names track the LLVM IR field indices.
 * @shader waveform_vertex_shader (Flexo)
 */
export interface WaveformState {
  /** i32 0: 4x4 mvp matrix.  IR: %92..%106 inside the private rasterizer. */
  mvp: [
    [number, number, number, number],
    [number, number, number, number],
    [number, number, number, number],
    [number, number, number, number],
  ];
  /** i32 1: 3x3 primary color matrix. */
  colorMatrix: [
    [number, number, number],
    [number, number, number],
    [number, number, number],
  ];
  /** i32 2: 3x3 secondary matrix used only by rasterizer mode-3. */
  chromaMatrix: [
    [number, number, number],
    [number, number, number],
    [number, number, number],
  ];
  /** i32 3: float — the alpha-curve control input.  IR %24 in entry. */
  alphaControl: number;
  /** i32 4: i8 chroma-fill enable (used only inside the rasterizer). */
  chromaFillEnable: number;
  /** i32 6: <4 x float> uniform that replaces the rasterizer's carried
   *          color for all modes except {3, 6}.  IR %17 in entry. */
  colorUniform: [number, number, number, number];
  /** i32 7: mode selector (switch key). */
  mode: number;
}

/**
 * Rasterizer output — matches Metal's `_rasterizer_data_t`:
 *   (position:vec4, color:vec4, uv:vec2, lum:float).
 * @shader waveform_vertex_shader (Flexo) IR %20..%22 in entry.
 */
export interface RasterizerData {
  position: [number, number, number, number];
  color: [number, number, number, number];
  uv: [number, number];
  lum: number;
}

// fp32 constants — decoded from the .ll's double-literal bit patterns.
// @shader waveform_vertex_shader (Flexo) IR %29 and %31
//   0x3FD072B020000000 → 0.25699999928474426 (fp32-narrowed alpha gain)
const K_ALPHA_GAIN: number = Math.fround(0.25699999928474426);
//   0x3FA0F27BC0000000 → 0.03310000151395798 (fp32-narrowed alpha bias)
const K_ALPHA_BIAS: number = Math.fround(0.03310000151395798);

/**
 * waveform_rasterizer — private helper (identical to the one described
 * in waveform_bg_pass_vertex_shader.ts).  See that file for the full
 * mode-by-mode annotation; the switch and math are byte-for-byte the
 * same LLVM function reachable by both entry points.
 *
 * Returns:
 *   position     — from state.mvp · preRotate  (IR %107)
 *   carriedColor — from the branch's payload   (IR %90 phi)
 *
 * @shader waveform_vertex_shader (Flexo) IR %4..%109 in the helper.
 */
function waveform_rasterizer(
  state: WaveformState,
  x: number,
  texel: [number, number, number, number],
): { position: [number, number, number, number]; carriedColor: [number, number, number, number] } {
  // %4 : base = <x, 0, 0, 1>  (lane 1 poison → filled by each branch).
  const base: [number, number, number, number] = [x, 0, 0, 1];
  const mode = state.mode | 0;

  const rF = Math.fround(texel[0]);
  const gF = Math.fround(texel[1]);
  const bF = Math.fround(texel[2]);

  let phiVec4: [number, number, number, number] = base;
  let phiCarry: [number, number, number, number] = [0, 0, 0, 0];

  if (mode === 0) {
    // %7..%10  luminance-r
    phiVec4 = [x, rF, 0, 1];
  } else if (mode === 1) {
    // %11..%14 luminance-g
    phiVec4 = [x, gF, 0, 1];
  } else if (mode === 2) {
    // %15..%18 luminance-b
    phiVec4 = [x, bF, 0, 1];
  } else {
    // Default (%19..): compute <3 x float> rgb3 = <rF,gF,bF>  (%29).
    const rgb3: [number, number, number] = [rF, gF, bF];
    if (mode > 5) {
      // %30..%44 RGB parade path.
      const row1 = state.colorMatrix[1];
      const row2 = state.colorMatrix[2];
      const d1 = Math.fround(Math.fround(rgb3[0] * row1[0]) + Math.fround(rgb3[1] * row1[1]) + Math.fround(rgb3[2] * row1[2]));
      const d2 = Math.fround(Math.fround(rgb3[0] * row2[0]) + Math.fround(rgb3[1] * row2[1]) + Math.fround(rgb3[2] * row2[2]));
      const y = Math.fround(Math.sqrt(Math.fround(Math.fround(d1 * d1) + Math.fround(d2 * d2))));
      phiVec4 = [x, y, 0, 1];
      phiCarry = [rF, gF, bF, 0];
    } else {
      // Modes 3, 4, 5 (chroma paths).  IR %45..%88.
      const row0 = state.colorMatrix[0];
      const row1 = state.colorMatrix[1];
      const row2 = state.colorMatrix[2];
      const d0 = Math.fround(Math.fround(rgb3[0] * row0[0]) + Math.fround(rgb3[1] * row0[1]) + Math.fround(rgb3[2] * row0[2]));
      const d1c = Math.fround(Math.fround(rgb3[0] * row1[0]) + Math.fround(rgb3[1] * row1[1]) + Math.fround(rgb3[2] * row1[2]));
      const d2c = Math.fround(Math.fround(rgb3[0] * row2[0]) + Math.fround(rgb3[1] * row2[1]) + Math.fround(rgb3[2] * row2[2]));

      if (mode === 3) {
        // %57..%82 chroma-magnitude path.
        // The IR literal 0x3FB99999A0000000 = fp32 0.10000000149011612
        // (identical clip constant used by the _bg_pass entry).
        const CHROMA_CLIP = Math.fround(0.10000000149011612);
        phiVec4 = [x, d0, 0, 1];
        if ((state.chromaFillEnable | 0) === 0) {
          const c0 = Math.fround(Math.max(d0, CHROMA_CLIP));
          let dotsX = c0;
          const dotsY = d1c;
          const dotsZ = d2c;
          const absSum = Math.fround(Math.abs(d1c) + Math.abs(d2c));
          if (absSum < CHROMA_CLIP) dotsX = 0.5;
          const cr0 = state.chromaMatrix[0];
          const cr1 = state.chromaMatrix[1];
          const cr2 = state.chromaMatrix[2];
          const e0 = Math.fround(Math.fround(dotsX * cr0[0]) + Math.fround(dotsY * cr0[1]) + Math.fround(dotsZ * cr0[2]));
          const e1 = Math.fround(Math.fround(dotsX * cr1[0]) + Math.fround(dotsY * cr1[1]) + Math.fround(dotsZ * cr1[2]));
          const e2 = Math.fround(Math.fround(dotsX * cr2[0]) + Math.fround(dotsY * cr2[1]) + Math.fround(dotsZ * cr2[2]));
          phiCarry = [e0, e1, e2, 0];
        } else {
          phiCarry = [1, 1, 1, 0];
        }
      } else if (mode === 4) {
        phiVec4 = [x, Math.fround(d1c + 0.5), 0, 1];
      } else if (mode === 5) {
        phiVec4 = [x, Math.fround(d2c + 0.5), 0, 1];
      } else {
        throw new Error(
          "waveform_vertex_shader waveform_rasterizer mode=" + mode +
          " reached unreachable branch (%45→%89 phi with undef) — see .ll %89 phi table."
        );
      }
    }
  }

  // %92..%107 : position = state.mvp · phiVec4  (four air.dot.v4f32 rows).
  const m = state.mvp;
  const dot4 = (row: [number, number, number, number], v: [number, number, number, number]): number =>
    Math.fround(
      Math.fround(row[0] * v[0]) +
      Math.fround(row[1] * v[1]) +
      Math.fround(row[2] * v[2]) +
      Math.fround(row[3] * v[3]),
    );
  const position: [number, number, number, number] = [
    dot4(m[0], phiVec4),
    dot4(m[1], phiVec4),
    dot4(m[2], phiVec4),
    dot4(m[3], phiVec4),
  ];
  return { position, carriedColor: phiCarry };
}

/**
 * waveform_vertex_shader — main entry point.
 *
 * Signature (from .ll):
 *   (%0 i32 vertexId,
 *    %1 vec2* vertexBuffer,          per-vertex UV
 *    %2 WaveformState*,               uniform state
 *    %3 texture2d)                    source frame texture
 *
 * Body:
 *   %5..%7   : uv = vertexBuffer[vertexId]              (load <2 x float>)
 *   %8..%9   : texel = sample(tex, uv)                  (air.sample_texture_2d.v4f16)
 *   %10      : x = uv.x                                 (extractelement lane 0)
 *   %11      : call waveform_rasterizer(state, x, texel)
 *   %12      : color = rast.field1  (carriedColor)
 *   %13..%14 : load state.mode
 *   %14→switch : {6, 3} → keep %12; default → %17 = state.field6 uniform
 *   %19      : phi(color)  — %17 for the default arm, %12 for {6,3}
 *   %20..%22 : extract other rasterizer fields (lum=%20, uv=%21, position=%22)
 *   %23..%31 : alpha curve based on state.alphaControl (field3):
 *                c25 = clamp(alphaControl, 0, 1)
 *                c26 = c25 * 2.0
 *                c27 = 3.0 - c26                          ; smoothstep tail
 *                c28 = c25 * c25
 *                c29 = c28 * 0.257                        ; K_ALPHA_GAIN
 *                c30 = c29 * c27                          ; = 0.257 * c25²(3-2c25)
 *                c31 = c30 + 0.0331                       ; K_ALPHA_BIAS
 *   %32      : insertelement color, c31, lane 3          ; overwrite alpha
 *   %33..%36 : assemble return {position, color(with alpha), uv, lum}
 *
 * @shader waveform_vertex_shader (Flexo) IR %5..%36
 */
export function waveform_vertex_shader(
  vertexId: number,
  vertexBuffer: ReadonlyArray<[number, number]>,
  state: WaveformState,
  sample: TextureSample2D,
): RasterizerData {
  // %5..%7 : per-vertex UV load.
  const uv = vertexBuffer[vertexId | 0];
  // %8 : sample; ignore residency i8 lane.
  const rgba = sample(uv);
  // %10 : x from uv lane 0.
  const x = uv[0];
  // %11 : private rasterizer call.
  const rast = waveform_rasterizer(state, x, rgba);
  // %12 : color = rasterizer's carriedColor.
  const carriedColor = rast.carriedColor;
  // %13..%14 : mode read.
  const mode = state.mode | 0;
  // %14 switch : both `case 3` and `case 6` fall to %18 keeping %12; the
  // default block %15 reads state.field6 (colorUniform) and re-enters %18
  // with the phi picking %17 vs %12.
  let color: [number, number, number, number];
  if (mode === 3 || mode === 6) {
    color = carriedColor;
  } else {
    // %16..%17 : load state.colorUniform (the <4 x float> at field 6).
    const cu = state.colorUniform;
    color = [cu[0], cu[1], cu[2], cu[3]];
  }
  // %20..%22 : extract other rasterizer fields.
  //   The rasterizer helper we implemented only returns {position, carriedColor};
  //   the .ll also plucks fields 2 (uv-passthrough) and 3 (lum) which are
  //   `undef` in the helper.  The IR only USES field 3 (alpha overwrite site)
  //   for the returned uv/lum; those undefs are the caller's responsibility
  //   to interpret.  We mirror the safest mapping: uv = input uv, lum = 0.
  const uvOut: [number, number] = [uv[0], uv[1]];
  const lumOut = 0;
  const position = rast.position;
  // %23..%31 : alpha smoothstep curve.
  const t = state.alphaControl;
  //   %25 = fast_clamp(t, 0, 1)
  const c25 = Math.fround(Math.min(1, Math.max(0, t)));
  //   %26 = c25 * 2.0
  const c26 = Math.fround(c25 * 2);
  //   %27 = 3.0 - c26
  const c27 = Math.fround(3 - c26);
  //   %28 = c25 * c25
  const c28 = Math.fround(c25 * c25);
  //   %29 = c28 * K_ALPHA_GAIN (fp32-narrowed 0x3FD072B020000000)
  const c29 = Math.fround(c28 * K_ALPHA_GAIN);
  //   %30 = c29 * c27         = K_ALPHA_GAIN * c25² * (3 - 2·c25)
  const c30 = Math.fround(c29 * c27);
  //   %31 = c30 + K_ALPHA_BIAS (fp32-narrowed 0x3FA0F27BC0000000)
  const alpha = Math.fround(c30 + K_ALPHA_BIAS);
  //   %32 : insertelement color[3] = alpha
  const finalColor: [number, number, number, number] = [color[0], color[1], color[2], alpha];
  // %33..%36 : assemble.
  return {
    position,
    color: finalColor,
    uv: uvOut,
    lum: lumOut,
  };
}
