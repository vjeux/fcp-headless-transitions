// textureSamplingShaderWithZebras.ts — direct TS mapping of the Metal
// fragment shader `textureSamplingShaderWithZebras` from FCP's
// FFMetalVideoPainterShaders.metal, extracted as LLVM IR (AIR) from
// Flexo.framework/Versions/A/Resources/default.metallib.
//
// @shader textureSamplingShaderWithZebras (Flexo)
// IR provenance: raw-port/re/shaders/textureSamplingShaderWithZebras.ll
// (header line: `0x00000000018040 -- textureSamplingShaderWithZebras`)
//
// Signature from the IR (%%N naming from the .ll):
//   <4 x float> @textureSamplingShaderWithZebras(
//     <4 x float> %0,     // fragColor  (unused by the body — texture wins)
//     <2 x float> %1,     // texcoord0
//     texture_2d      %2, // input image
//     AAPLApplyZebra_TextureSamplerParams* %3
//   )
// The params struct (%struct.AAPLApplyZebra_TextureSamplerParams):
//   { float thresholdA;      // %3.0   -> %14  @ getelementptr i32 0
//     float stripeScale;     // %3.1   -> %16  @ getelementptr i32 1
//     float stripePeriod;    // %3.2   -> %20  @ getelementptr i32 2
//     float lineThickness;   // %3.3   -> %146 @ getelementptr i32 3
//     <2 x float> texScale;  // %3.4   -> %9   @ getelementptr i32 4
//     <4 x float> colorA;    // %3.5   -> %133/%189 @ getelementptr i32 5
//     <4 x float> colorB;    // %3.6   -> %50/%70/%74/%126/%184 @ getelementptr i32 6
//   }
// Four addrspace(2) fc_initializer-backed globals control mode/OOB behaviour:
//   _ZL8drawMode  (i32)  — which of 5 zebra styles to run
//   _ZL7oobLuma   (i8)   — treat oob-luma pixels specially
//   _ZL8oobColor  (i8)   — treat oob-color pixels specially
//   _ZL6luma90    (i8)   — draw the "90% luma" band
// Their init constants live in `air.fc_initializer` and are function-constants
// supplied by the client at pipeline-build time — the IR ctor at
// `_GLOBAL__sub_I_FFMetalVideoPainterShaders.metal` copies the .INIT variants
// into the plain globals at load. We model them as fields on a Uniforms object.
//
// Constants decoded from IR hex doubles (fp32-narrowed at the .f32 callsite):
//   0x3FD554C980000000 = 0.33329999446868896    (≈ 1/3, luma-average weight;   %44)
//   0x3FF6666660000000 = 1.399999976158142      (stripe-slope numerator;      %105)
//   0xBFD3333340000000 = -0.30000001192092896   (stripe-slope offset;         %106)
//   0x4027CCCCC0000000 = 11.899999618530273     (drawMode threshold;          %116)
//   0x4007333340000000 = 2.9000000953674316     (drawMode threshold;          %176)
// Plain hex floats in IR come as decimal literals ("1.950000e+01" = 19.5f,
// "2.550000e+02" = 255.0f, "0.5", "0.25" etc.) and are kept literal below.

/** RGBA float pixel — laid out as [r,g,b,a] to match `<4 x float>` lane 0..3. */
export type Vec4 = readonly [number, number, number, number];
/** UV coord — matches `<2 x float>`. */
export type Vec2 = readonly [number, number];

/** The `sample_texture_2d` callback the shader takes. Returns fp32 RGBA. */
export type SampleFn = (tex: unknown, uv: Vec2) => Vec4;

/** Mirrors `%struct.AAPLApplyZebra_TextureSamplerParams` (order-critical). */
export interface AAPLApplyZebra_TextureSamplerParams {
  readonly thresholdA: number;    // %3.0
  readonly stripeScale: number;   // %3.1
  readonly stripePeriod: number;  // %3.2
  readonly lineThickness: number; // %3.3
  readonly texScale: Vec2;        // %3.4  <2 x float>
  readonly colorA: Vec4;          // %3.5  <4 x float>
  readonly colorB: Vec4;          // %3.6  <4 x float>
}

/** Function-constant uniforms initialised from air.fc_initializer at load. */
export interface ZebrasFunctionConstants {
  readonly drawMode: number;   // i32   @_ZL8drawMode
  readonly oobLuma: boolean;   // i8!=0 @_ZL7oobLuma
  readonly oobColor: boolean;  // i8!=0 @_ZL8oobColor
  readonly luma90: boolean;    // i8!=0 @_ZL6luma90
}

/** fp32 helper — the IR is all `float`, so every fp op is Math.fround-narrowed. */
const f = Math.fround;

/**
 * textureSamplingShaderWithZebras — direct TS mapping of the AIR body.
 *
 * IR line references (%N) are from raw-port/re/shaders/textureSamplingShaderWithZebras.ll.
 *
 * Notes on transcription choices:
 *  - The IR samples with `air.sample_texture_2d.v4f16` and then converts to
 *    v4f32 (%5..%7). We fold that into a single fp32 sample() callback here;
 *    the half→float widening is exact and every downstream op is already f32.
 *  - `air.fast_fmod.f32` (%22, %26) is IEEE fmodf; we transcribe as
 *    `float32-narrowed IEEE fmod`: `Math.fround(a - Math.trunc(a/b)*b)`.
 *  - `air.fast_fabs.f32/v4f32` (%62, %104, %144) → `Math.abs` per lane, all
 *    fp32-narrowed.
 *  - `air.convert.s.i32.f.f32` (%33, %80, %152) is signed truncation toward
 *    zero, matching JS `x | 0` for the int32 range that (alpha*255) lives in.
 *  - `air.convert.f.f32.s.i32` (%28) is a widening int→float, exact for
 *    signed i32.
 *  - The huge phi at %200 fans in twelve br-target values; we emit that as an
 *    explicit early-return per branch (equivalent flow, cleaner in TS).
 *
 * Semantics summary (recovered from control flow, cited inline):
 *   drawMode >  19.5     → "false-color" family (%29 branch)  → %48/%60/%72/%51
 *   drawMode ∈ (9.5,19.5] → "luminance-tint" family (%76)     → %138/%77
 *   drawMode ≤  9.5      → "diagonal-zebra" family (%142)     → %181/%185/%190/%196/%198
 */
export function textureSamplingShaderWithZebras(
  _fragColor: Vec4,                          // %0 (unused — kept for signature parity)
  texcoord0: Vec2,                           // %1
  tex: unknown,                              // %2
  params: AAPLApplyZebra_TextureSamplerParams, // %3
  sample: SampleFn,                          // sample_texture_2d wrapper
  fc: ZebrasFunctionConstants,               // fc_initializer-backed globals
): Vec4 {
  // %5..%7: sample_texture_2d.v4f16 then convert to v4f32. Direct sample() here.
  const sampled = sample(tex, texcoord0);
  const r0 = f(sampled[0]);
  const g0 = f(sampled[1]);
  const b0 = f(sampled[2]);
  const a0 = f(sampled[3]);
  const s: Vec4 = [r0, g0, b0, a0]; // == %7

  // %8..%12: %12 = texScale.x * texcoord.x
  const texScaleX = f(params.texScale[0]);      // %10
  const texScaleY = f(params.texScale[1]);      // %23
  const tcX = f(texcoord0[0]);                  // %11
  const tcY = f(texcoord0[1]);                  // %24
  const p12 = f(texScaleX * tcX);               // %12

  // %13..%18: %18 = thresholdA*stripeScale + %12  ==  stripeScale*thresholdA + texScale.x*tc.x
  const thresholdA = f(params.thresholdA);      // %14
  const stripeScale = f(params.stripeScale);    // %16
  const p17 = f(stripeScale * thresholdA);      // %17
  const p18 = f(p17 + p12);                     // %18

  // %19..%21: %21 = stripePeriod * stripeScale
  const stripePeriod = f(params.stripePeriod);  // %20
  const p21 = f(stripePeriod * stripeScale);    // %21

  // %22: %22 = air.fast_fmod.f32(%18, %21)   — fp32 IEEE remainder
  const p22 = fmodF32(p18, p21);                // %22

  // %25: %25 = texScale.y * texcoord.y
  const p25 = f(texScaleY * tcY);               // %25
  // %26: %26 = fmod(%25, %21)
  const p26 = fmodF32(p25, p21);                // %26

  // %27..%28: drawMode as float
  const drawModeF = f(fc.drawMode);             // %28

  // %29: drawMode > 19.5 ?
  if (drawModeF > f(19.5)) {                    // %29 fcmp ogt 1.950000e+01
    // -- Branch %30: false-color family --
    const alpha255 = f(a0 * f(255.0));          // %32
    const lumaCode = alpha255 | 0;              // %33 convert.s.i32.f.f32 → truncate toward 0
    // %34: insert 1.0 into lane 3 of %7
    const s1: Vec4 = [r0, g0, b0, 1.0];         // %34

    const p35 = lumaCode > 127;                 // %35 icmp sgt 127
    const p38 = p35 && fc.oobLuma;              // %38 select %35, %37, false

    // %41..%44: %44 = (r+g+b) * 0.3333f  (fp32-narrowed decoded from IR double)
    const rgSum = f(r0 + g0);                   // %41
    const rgbSum = f(rgSum + b0);               // %43
    const gray = f(rgbSum * f(0.33329999446868896)); // %44 (0x3FD554C980000000)
    // %47: <gray, gray, gray, 1.0>
    const grayVec: Vec4 = [gray, gray, gray, 1.0]; // %47

    if (p38) {
      // %48..%50: return colorB
      return copyVec4(params.colorB);           // %50
    }
    // %51: %52 = lumaCode - 128; %53 = %35 ? %52 : lumaCode
    const p52 = (lumaCode - 128) | 0;           // %52
    const p53 = p35 ? p52 : lumaCode;           // %53
    const p54 = p53 > 63;                       // %54 icmp sgt 63
    const p57 = p54 && fc.oobColor;             // %57 select %54, %56, false

    if (!p57) {
      // %51 fallthrough with p57 false → %199 with %47 (grayVec)
      return grayVec;                           // phi lane for %51
    }

    // %58: drawMode > 20.5 ?
    if (drawModeF > f(20.5)) {                  // %59 fcmp ogt 2.050000e+01
      // %60: %61 = s1 - grayVec; %62 = |%61|; %65 = |x|+|y|; %67 = %65+|z|
      const diffR = f(s1[0] - grayVec[0]);      // %61.x
      const diffG = f(s1[1] - grayVec[1]);      // %61.y
      const diffB = f(s1[2] - grayVec[2]);      // %61.z
      // (diffA lane is 1.0-1.0=0 and never read)
      const absR = f(Math.abs(diffR));          // %62.x
      const absG = f(Math.abs(diffG));          // %62.y
      const absB = f(Math.abs(diffB));          // %62.z
      const sum2 = f(absR + absG);              // %65
      const sum3 = f(sum2 + absB);              // %67
      const cond = sum3 < f(0.25);              // %68 fcmp olt 0.25
      return cond ? copyVec4(params.colorB)     // %70/%71
                  : s1;                          // %71 else
    }
    // %72: return colorB
    return copyVec4(params.colorB);             // %74
  }

  // %75: drawMode > 9.5 ?
  if (drawModeF > f(9.5)) {                     // %76 fcmp ogt 9.500000e+00
    // -- Branch %77: luminance-tint family --
    const alpha255 = f(a0 * f(255.0));          // %79
    const lumaCode = alpha255 | 0;              // %80
    const s1: Vec4 = [r0, g0, b0, 1.0];         // %81

    const p82 = lumaCode > 127;                 // %82
    const p83 = (lumaCode - 128) | 0;           // %83
    const p86 = p82 ? p83 : lumaCode;           // %86
    const p87 = p82 && fc.oobLuma;              // %87
    const p88 = p86 > 63;                       // %88
    const p89 = (p86 - 64) | 0;                 // %89
    const p91 = fc.oobColor;                    // %91
    const p92 = p88 ? p89 : p86;                // %92
    const p93 = p92 > 31;                       // %93
    const p96 = p93 && fc.luma90;               // %96
    const p97 = p88 && p91;                     // %97
    const p98 = p97 ? true : p87;               // %98 select %97, true, %87
    const p99 = p98 || p96;                     // %99

    if (!p99) {
      // %199 with s1 (%81)
      return s1;                                 // phi lane for %77
    }

    // %100 body: build the luminance ramp
    const p101 = f(thresholdA * 2.0);           // %101
    const p102 = f(p101 / stripePeriod);        // %102
    const p103 = f(1.0 - p102);                 // %103
    const p104 = f(Math.abs(p103));             // %104
    // %105 = %104 * 1.399999976158142f  (0x3FF6666660000000)
    const p105 = f(p104 * f(1.399999976158142));// %105
    // %106 = %105 + (-0.30000001192092896f)  (0xBFD3333340000000)
    const p106 = f(p105 + f(-0.30000001192092896)); // %106
    // %107/%108/%109/%111 phi — clamp to [0,1]
    let p112: number;
    if (p106 < 0.0) {                           // %107 fcmp olt 0.0
      p112 = 0.0;                                // phi ← 0.0 from %100
    } else if (p106 > 1.0) {                    // %109 fcmp ogt 1.0
      p112 = 1.0;                                // phi ← 1.0 from %110
    } else {
      p112 = p106;                               // phi ← %106 from %108
    }
    // %114: splat p112 into first 3 lanes; %115 = splat * s1
    const s1r = f(p112 * s1[0]);                // %115.x
    const s1g = f(p112 * s1[1]);                // %115.y
    const s1b = f(p112 * s1[2]);                // %115.z
    const s1a = f(p112 * s1[3]);                // %115.w (== p112*1.0)

    // %116: drawMode < 11.899999618530273 ?  (0x4027CCCCC0000000)
    const oneMinus = f(1.0 - p112);             // %119/%127/%134
    let out: Vec4;                              // %139 phi
    if (drawModeF < f(11.899999618530273)) {    // %116
      // %117 branch: %118 = 1 - s1 (per lane); %122 = oneMinus * (1 - s1)
      const invR = f(1.0 - s1[0]);              // %118.x
      const invG = f(1.0 - s1[1]);              // %118.y
      const invB = f(1.0 - s1[2]);              // %118.z
      const invA = f(1.0 - s1[3]);              // %118.w (== 0)
      out = [
        f(oneMinus * invR),                     // %122.x
        f(oneMinus * invG),
        f(oneMinus * invB),
        f(oneMinus * invA),
      ];
    } else if (p98) {                           // %123 br p98
      // %124: colorB * oneMinus
      const cB = params.colorB;                 // %126
      out = [
        f(f(cB[0]) * oneMinus),                 // %130.x
        f(f(cB[1]) * oneMinus),
        f(f(cB[2]) * oneMinus),
        f(f(cB[3]) * oneMinus),
      ];
    } else {
      // %131: colorA * oneMinus
      const cA = params.colorA;                 // %133
      out = [
        f(f(cA[0]) * oneMinus),                 // %137.x
        f(f(cA[1]) * oneMinus),
        f(f(cA[2]) * oneMinus),
        f(f(cA[3]) * oneMinus),
      ];
    }
    // %140: out + %115; %141: insert 1.0 into lane 3
    const finalR = f(out[0] + s1r);             // %140.x
    const finalG = f(out[1] + s1g);
    const finalB = f(out[2] + s1b);
    // out.w + s1a is dropped by the insertelement lane-3 = 1.0
    return [finalR, finalG, finalB, 1.0];       // %141
  }

  // -- Branch %142: diagonal-zebra family (drawMode <= 9.5) --
  const p143 = f(p22 - p26);                    // %143
  const p144 = f(Math.abs(p143));               // %144
  const lineThickness = f(params.lineThickness);// %146
  const p147 = f(lineThickness * stripeScale);  // %147
  const p148 = p144 < p147;                     // %148

  if (!p148) {
    // %197: %198 = insert 1.0 lane 3 of s
    return [r0, g0, b0, 1.0];                   // %198
  }

  // %149 body: mirror of the false-color / luminance selection
  const alpha255 = f(a0 * f(255.0));            // %151
  const lumaCode = alpha255 | 0;                // %152
  const s1: Vec4 = [r0, g0, b0, 1.0];           // %153

  const p154 = lumaCode > 127;                  // %154
  const p155 = (lumaCode - 128) | 0;            // %155
  const p157 = fc.oobLuma;                      // %157
  const p158 = p154 ? p155 : lumaCode;          // %158
  const p159 = p154 && p157;                    // %159
  // %160 = zext %159 to i8
  const p160 = p159 ? 1 : 0;                    // %160

  const p161 = p158 > 63;                       // %161
  const p162 = (p158 - 64) | 0;                 // %162
  const p164 = !fc.oobColor;                    // %164 icmp eq %163, 0
  const p165 = p164 ? p160 : 1;                 // %165 select %164, %160, 1
  const p166 = p161 ? p162 : p158;              // %166
  const p167 = p161 ? p165 : p160;              // %167
  const p168 = p166 > 31;                       // %168
  const p171 = p168 && fc.luma90;               // %171
  const p172 = drawModeF > 0.5;                 // %172 fcmp ogt 0.5
  const p173 = p167 === 0;                      // %173

  if (p172) {
    // %174 branch (drawMode > 0.5)
    if (!p173) {
      // %175: drawMode > 2.9000000953674316 ?  (0x4007333340000000)
      if (drawModeF > f(2.9000000953674316)) {
        // %177: inverse RGB
        return [
          f(1.0 - r0),                          // %179.x
          f(1.0 - g0),
          f(1.0 - b0),
          1.0,                                   // %181 lane 3 = 1.0
        ];
      }
      // %182: colorB with lane 3 replaced by 1.0
      const cB = params.colorB;                 // %184
      return [f(cB[0]), f(cB[1]), f(cB[2]), 1.0]; // %185
    }
    // %186 (p173 true): if p171 → %187, else %199 with s1
    if (p171) {
      // %187: colorA lane3=1.0
      const cA = params.colorA;                 // %189
      return [f(cA[0]), f(cA[1]), f(cA[2]), 1.0]; // %190
    }
    return s1;                                   // phi ← %153 from %186
  }
  // %191 branch (drawMode ≤ 0.5)
  const invR = f(1.0 - r0);                     // %193.x
  const invG = f(1.0 - g0);
  const invB = f(1.0 - b0);
  const p195: Vec4 = [invR, invG, invB, 1.0];   // %195
  // %196 = select p173, s1, %195
  return p173 ? s1 : p195;                       // %196
}

/**
 * fp32-narrowed IEEE fmod, matching air.fast_fmod.f32.
 * Equivalent to `fmodf(a, b)`: `a - truncf(a/b) * b`, single-precision.
 */
function fmodF32(a: number, b: number): number {
  // %22/%26 in the IR. Do the divide + truncation in fp32 to preserve
  // bit-exact behaviour with the AIR intrinsic.
  const q = f(a / b);
  const t = Math.trunc(q); // fmodf truncates toward zero
  return f(a - f(t * b));
}

/** Cheap defensive copy — the IR loads its param vectors fresh each branch. */
function copyVec4(v: Vec4): Vec4 {
  return [f(v[0]), f(v[1]), f(v[2]), f(v[3])];
}
