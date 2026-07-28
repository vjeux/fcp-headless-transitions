// @shader waveform_bg_pass_vertex_shader (Flexo)
// Transcribed from Flexo.framework/Versions/A/Resources/default.metallib.
// IR: raw-port/re/shaders/waveform_bg_pass_vertex_shader.ll (258 lines).
//
// This is the VERTEX shader for the FCP video-scope waveform background
// pass.  It reads a vertex-buffer entry, samples the source texture at
// that UV to fetch the pixel color, calls a private "waveform_rasterizer"
// that transforms the sampled color into (position, luminance/hue axis)
// depending on the waveform mode (mode field at struct offset i32 7), and
// returns:
//   .position (vec4) — clip-space position from state.mvp * transformed
//   .color    (vec4) — fixed gray fill  <c,c,c,1> with c = 0.08627449
//   .uv       (vec2) — pass-through of the input UV
//   .lum      (float) — undecoded scalar carried through (see below)
//
// Modes (32-bit switch key at %6 = state[i32 7]):
//   0 → luminance channel  (r-lane)         %7..%10
//   1 → luminance channel  (g-lane)         %11..%14
//   2 → luminance channel  (b-lane)         %15..%18
//   3 → chroma (Cb/Cr) magnitude waveform   %57..%82   (uses UV branch %62)
//   4 → chroma Cb + 0.5                     %83..%85
//   5 → chroma Cr + 0.5                     %86..%88
//   default (>5) → RGB-parade path          %30..%44
//
// GATE NOTE: "fast-math (reassoc/afn) — plain JS float ops throughout";
// no fp32-narrowed pow() constants in this shader.  The two double bit
// patterns present are:
//   0x3FB61615E0000000 = fp32-narrowed 0.08627449721097946  (~22/255 gray)
//   0x3FB99999A0000000 = fp32-narrowed 0.10000000149011612  (chroma clip)

/**
 * A sample callback for texture reads.  The Metal shader samples a
 * texture with a hard-coded linear/clamp sampler (see the .ll's
 * @__air_sampler_state constant); callers on the JS side supply a
 * function that maps a UV to a 4-lane color.
 *
 * The AIR intrinsic (@shader waveform_bg_pass_vertex_shader IR line %8)
 * returns `{<4 x half>, i8}` where the i8 is a "sample OK" residency
 * flag; we ignore the residency bit and hand back RGBA as f32.
 */
export type TextureSample2D = (uv: [number, number]) => [number, number, number, number];

/**
 * Uniform state buffer — the shader indexes this at compile-time-known
 * offsets.  Field names track the LLVM IR field indices (`i32 <n>`).
 * @shader waveform_bg_pass_vertex_shader (Flexo)
 */
export interface WaveformState {
  /** i32 0: 4x4 mvp matrix.  IR: %92..%106, air.dot.v4f32 per column. */
  mvp: [
    [number, number, number, number],
    [number, number, number, number],
    [number, number, number, number],
    [number, number, number, number],
  ];
  /** i32 1: 3x3 rgb→YCbCr-ish matrix (rows 0..2 sampled per mode).  IR: %31..%36 / %46..%55. */
  colorMatrix: [
    [number, number, number],
    [number, number, number],
    [number, number, number],
  ];
  /** i32 2: 3x3 secondary matrix used only by mode-3 chroma-magnitude path.  IR: %71..%79. */
  chromaMatrix: [
    [number, number, number],
    [number, number, number],
    [number, number, number],
  ];
  /** i32 3: float (unused in this shader body — reserved). */
  _unused_i32_3: number;
  /** i32 4: i8/bool controlling the mode-3 chroma branch (`%60==0` → do fill+matrix). */
  chromaFillEnable: number;
  /** i32 6: <4 x float> uniform (unused in this shader body — reserved). */
  _unused_i32_6: [number, number, number, number];
  /** i32 7: mode selector (switch key at IR line %6). */
  mode: number;
}

/**
 * Rasterizer output — matches Metal's `_rasterizer_data_t`:
 * (position:vec4, color:vec4, uv:vec2, lum:float).  Only fields 0/2/3
 * are populated by the private helper; field 1 (color) is set to the
 * fixed gray by the entry point.
 * @shader waveform_bg_pass_vertex_shader (Flexo) IR %108..%109 in helper, %15..%18 in entry.
 */
export interface RasterizerData {
  position: [number, number, number, number];
  color: [number, number, number, number];
  uv: [number, number];
  lum: number;
}

// fp32 constants — decoded from the .ll's double-literal bit patterns.
// @shader waveform_bg_pass_vertex_shader (Flexo)
//   0x3FB61615E0000000 → 0.08627449721097946 (fp32-narrowed; ~22/255 gray).
const K_BG_GRAY: number = Math.fround(0.08627449721097946);
//   0x3FB99999A0000000 → 0.10000000149011612 (fp32-narrowed chroma clip).
const K_CHROMA_CLIP: number = Math.fround(0.10000000149011612);

/**
 * waveform_rasterizer — private helper called by the vertex shader.
 * Metal-mangled: `_Z19waveform_rasterizerPU11MTLconstantK16waveform_state_tfDv4_Dh`.
 *
 * Signature:
 *   (state: WaveformState, x: float, texel: [r,g,b,a] half4) → {position, color(unused), uv(unused), lum}
 *
 * Where `x` is the horizontal position (u0) and `texel` is the sampled
 * pixel (as fp16 half4, extended to fp32 here — matches AIR `fpext half → float`).
 *
 * The helper builds a preliminary <4 x float> = <x, ?, 0, 1> at IR %4
 * (the `?` — .y lane — is filled per branch), then dispatches on
 * `state.mode`.  After the mode branch it multiplies the resulting
 * vec4 by state.mvp column-by-column (via air.dot.v4f32) to produce
 * the clip-space position (%94, %98, %102, %106) — those four scalars
 * become the returned struct field 0 (%107).
 *
 * The returned struct field 1 (%90) carries a per-branch payload — for
 * mode 3 this is the fill/matrix-multiplied color vector, for the RGB-
 * parade (default >5) it's <r,g,b,0>, else `undef`; the entry-point
 * overwrites this field with the fixed gray so this value is dead-code
 * except in the default branch where it seeds the fill.
 *
 * @shader waveform_bg_pass_vertex_shader (Flexo)
 *   IR %4..%109 (all lines below refer to the .ll body).
 */
function waveform_rasterizer(
  state: WaveformState,
  x: number,
  texel: [number, number, number, number],
): { position: [number, number, number, number]; carriedColor: [number, number, number, number] } {
  // %4  : insertelement <poison, 0, 0, 1>, x, 0  → base = <x, 0, 0, 1>
  //       (the .y lane is undef until each branch fills it)
  const base: [number, number, number, number] = [x, 0, 0, 1];

  // %6  : load i32 state->mode  (state at i32 field 7)
  const mode = state.mode | 0;

  // Per-branch fills.  All lane-1 writes happen via insertelement into `base`.
  // We track two 4-vectors that will be reduced to (position, carriedColor)
  // through the phi at %90..%91.
  let phiVec4: [number, number, number, number] = base; // → %91 (goes through mvp)
  let phiCarry: [number, number, number, number] = [0, 0, 0, 0]; // → %90 (fill payload)

  // fpext texel half→float (%8/%12/%16/%21/%24/%27) — already fp32 in this port.
  const rF = Math.fround(texel[0]);
  const gF = Math.fround(texel[1]);
  const bF = Math.fround(texel[2]);

  if (mode === 0) {
    // %7..%10  luminance-r
    phiVec4 = [x, rF, 0, 1];
    // %90 in this arm = undef → 0.
  } else if (mode === 1) {
    // %11..%14 luminance-g
    phiVec4 = [x, gF, 0, 1];
  } else if (mode === 2) {
    // %15..%18 luminance-b
    phiVec4 = [x, bF, 0, 1];
  } else {
    // Default (%19..): compute <3 x float> RGB = <rF,gF,bF> (%29).
    const rgb3: [number, number, number] = [rF, gF, bF];
    if (mode > 5) {
      // %30..%44 RGB parade path.
      //   %31: state.colorMatrix[1]   (row 1)   → dot(rgb3, row1) = %33
      //   %34: state.colorMatrix[2]   (row 2)   → dot(rgb3, row2) = %36
      //   %37..%39: rebuild <r,g,b,0> as %39 (carriedColor).
      //   %40..%43: y = sqrt(%33² + %36²)
      //   %44: base with .y = y   (position seed)
      const row1 = state.colorMatrix[1];
      const row2 = state.colorMatrix[2];
      const d1 = Math.fround(Math.fround(rgb3[0] * row1[0]) + Math.fround(rgb3[1] * row1[1]) + Math.fround(rgb3[2] * row1[2]));
      const d2 = Math.fround(Math.fround(rgb3[0] * row2[0]) + Math.fround(rgb3[1] * row2[1]) + Math.fround(rgb3[2] * row2[2]));
      const y = Math.fround(Math.sqrt(Math.fround(Math.fround(d1 * d1) + Math.fround(d2 * d2))));
      phiVec4 = [x, y, 0, 1];
      phiCarry = [rF, gF, bF, 0];
    } else {
      // Modes 3, 4, 5 (chroma paths).  IR %45..%88.
      //   Precompute all three colorMatrix·rgb3 dots (%48, %51, %55) into a
      //   <3 x float> `dots` = <d0, d1, d2>.
      const row0 = state.colorMatrix[0];
      const row1 = state.colorMatrix[1];
      const row2 = state.colorMatrix[2];
      const d0 = Math.fround(Math.fround(rgb3[0] * row0[0]) + Math.fround(rgb3[1] * row0[1]) + Math.fround(rgb3[2] * row0[2]));
      const d1c = Math.fround(Math.fround(rgb3[0] * row1[0]) + Math.fround(rgb3[1] * row1[1]) + Math.fround(rgb3[2] * row1[2]));
      const d2c = Math.fround(Math.fround(rgb3[0] * row2[0]) + Math.fround(rgb3[1] * row2[1]) + Math.fround(rgb3[2] * row2[2]));
      // dots[0] = poison (%52 keeps lane 0 as poison until %64 overwrites it).
      // dots[1] = d1c (%52 insert), dots[2] = d2c (%56 insert).

      if (mode === 3) {
        // %57..%82 chroma-magnitude path.
        //   %58: base .y = d0 (%48) — position seed
        //   %59..%61: read state.chromaFillEnable (i8 at field 4). Only if 0 do we compute the fill.
        //   %62..%82: fill computation branch, gated on chromaFillEnable == 0.
        phiVec4 = [x, d0, 0, 1];
        if ((state.chromaFillEnable | 0) === 0) {
          // %63: c0 = fast_fmax(d0, 0.1)
          const c0 = Math.fround(Math.max(d0, K_CHROMA_CLIP));
          // dots after %64: <c0, d1c, d2c>
          let dotsY = d1c;
          let dotsZ = d2c;
          let dotsX = c0;
          // %65..%67: |d1c| + |d2c|
          const absSum = Math.fround(Math.abs(d1c) + Math.abs(d2c));
          // %68: absSum < 0.1  → replace lane 0 with 0.5
          if (absSum < K_CHROMA_CLIP) {
            dotsX = 0.5;
          }
          // %71..%79 chromaMatrix · dots  → <e0, e1, e2>
          const cr0 = state.chromaMatrix[0];
          const cr1 = state.chromaMatrix[1];
          const cr2 = state.chromaMatrix[2];
          const e0 = Math.fround(Math.fround(dotsX * cr0[0]) + Math.fround(dotsY * cr0[1]) + Math.fround(dotsZ * cr0[2]));
          const e1 = Math.fround(Math.fround(dotsX * cr1[0]) + Math.fround(dotsY * cr1[1]) + Math.fround(dotsZ * cr1[2]));
          const e2 = Math.fround(Math.fround(dotsX * cr2[0]) + Math.fround(dotsY * cr2[1]) + Math.fround(dotsZ * cr2[2]));
          // %80..%82: <e0, e1, e2, 0>
          phiCarry = [e0, e1, e2, 0];
        } else {
          // %89 phi for the %57→%89 edge picks constant <1,1,1,0> for %90.
          phiCarry = [1, 1, 1, 0];
        }
      } else if (mode === 4) {
        // %83..%85: base .y = d1c + 0.5
        phiVec4 = [x, Math.fround(d1c + 0.5), 0, 1];
      } else if (mode === 5) {
        // %86..%88: base .y = d2c + 0.5
        phiVec4 = [x, Math.fround(d2c + 0.5), 0, 1];
      } else {
        // Unreachable per switch semantics (mode∈{3,4,5} inside this branch).
        // IR %89's phi allows an undef edge from %45; keep undefined behavior
        // as a throwable-guard so a bug is visible rather than silent.
        throw new Error(
          "waveform_bg_pass_vertex_shader waveform_rasterizer mode=" + mode +
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
  // %108..%109 : insertvalue position at 0, carriedColor at 1.
  return { position, carriedColor: phiCarry };
}

/**
 * waveform_bg_pass_vertex_shader — main entry point.
 *
 * Signature (from .ll):
 *   (%0 i32 vertexId,
 *    %1 vec2* vertexBuffer,          // per-vertex UV
 *    %2 WaveformState*,               // uniform state
 *    %3 texture2d)                    // source frame texture
 *
 * Body:
 *   %5..%7 : uv = vertexBuffer[vertexId]              (load <2 x float>)
 *   %8..%9 : texel = sample(tex, uv)                  (air.sample_texture_2d.v4f16)
 *   %10    : x = uv.x                                 (extractelement lane 0)
 *   %11    : call waveform_rasterizer(state, x, texel)
 *   %12/%13/%14 : extract position/uv/lum fields
 *   %15..%18 : build return record {position, GRAY, uv, lum}
 *
 * Return `.color` is hardcoded to <K_BG_GRAY, K_BG_GRAY, K_BG_GRAY, 1.0>
 * (0.08627449 gray) — the fill color of the waveform-scope background.
 *
 * @shader waveform_bg_pass_vertex_shader (Flexo) IR %5..%18
 */
export function waveform_bg_pass_vertex_shader(
  vertexId: number,
  vertexBuffer: ReadonlyArray<[number, number]>,
  state: WaveformState,
  sample: TextureSample2D,
): RasterizerData {
  // %5..%7 : load per-vertex UV.
  const uv = vertexBuffer[vertexId | 0];
  // %8 : sample.  The sampler is a constant linear/clamp pair; we ignore
  //      the i8 residency lane returned alongside the half4 color.
  const rgba = sample(uv);
  // %9 : extractvalue rgba (result of sample_texture_2d, tuple lane 0).
  //      IR uses fpext at each downstream use; here we already have fp32.
  // %10 : x = uv.x.
  const x = uv[0];
  // %11 : private tail-call into the rasterizer.
  const rast = waveform_rasterizer(state, x, rgba);
  // %12 : position = rast.field0.
  const position = rast.position;
  // %13 : uv-out = rast.field2.  In the .ll this comes from the private
  //       helper's field 2 (%108/%109 record initializer), but the helper
  //       above only populates position and carry.  The IR builds the
  //       full rasterizer_data_t from `%108/%109` with fields 2/3 left
  //       as poison — those are then overwritten here by %15..%18 with:
  //         field 2 → rast.uv    (which equals the input uv, per the
  //                                helper's contract inspected in the .ll
  //                                phi table: uv is passed through)
  //         field 3 → rast.lum   (undecoded scalar; %14 in the .ll)
  //       In this port we mirror what the .ll actually produces: the
  //       out-record's uv is the sampled `uv` (pass-through) and `lum`
  //       is 0 (undef → 0 in JS's safest float mapping).  If a later
  //       consumer proves lum has a real source we can revisit.
  const uvOut: [number, number] = [uv[0], uv[1]];
  const lumOut = 0;
  // %15..%18 : assemble return record.
  return {
    position,
    color: [K_BG_GRAY, K_BG_GRAY, K_BG_GRAY, 1],
    uv: uvOut,
    lum: lumOut,
  };
}
