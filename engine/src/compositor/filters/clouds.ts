/**
 * PAECloudsV2 — Motion "Clouds" procedural generator (scenenode, factory "Generator",
 * pluginUUID EFCC7FE1-DE19-4D8C-A88F-A1A616C93962; legacy PAEClouds is the V1 class).
 *
 * ============================ FCP PHASE-1 REVERSE-ENGINEERING ============================
 * PAECloudsV2 is a GENERATOR scenenode (like PAEColorSolid / PAENoise): it emits its OWN
 * full-frame image which the host then composites. It is NOT a filter (registerFilter would
 * never fire for a scenenode). In Stylized__Close_and_Open it is the "Clouds" fill object.
 *
 * PARAMETERS (from the .motr Object>Clouds block + -[PAECloudsV2 addParameters]):
 *   Width (id 300, def 1920)   Height (id 301, def 1080)  — the generated image size
 *   Horizontal Scale (id 1, def 32)   Vertical Scale (id 2, def 32)  — noise cell size in px
 *   Speed (id 3, def 0.5)  — time evolution rate (animates the noise field / a z/seed axis)
 *   Gradient (id 4)  — an RGBA colour gradient (RGB1/RGB2/... stops, each Location/Middle/
 *     Interpolation/Color{R,G,B,ColorSpace}); getGradientSamples:numSamples:256 bakes it to a
 *     256×1 RGBA LUT (HGBitmap format 0x1d = RGBAf) that the shader samples as hg_Texture0.
 *
 * CPU SIDE (-[PAECloudsV2 canThrowRenderOutput:withInfo:] @0x51b48):
 *   1. Reads Horizontal Scale (parm 1), Vertical Scale (parm 2), Speed (parm 3) at fxTime.
 *   2. getGradientSamples:numSamples:256:depth:fromParm:4 → a 256-sample RGBA gradient LUT,
 *      loaded into an HGBitmap (256×1, format 0x1d) + HGBitmapLoader → hg_Texture0.
 *   3. Builds the per-vertex texCoord0..7 that feed the fragment program: these carry the
 *      value-noise LATTICE for FOUR octaves. For each octave k, texCoord{2k} = the fractional
 *      cell coordinate (fx,fy) and texCoord{2k+1} = the four surrounding lattice VALUES
 *      packed (x,y,z,w) = (v00,v10,v01,v11). The lattice values are the CPU-generated
 *      pseudo-random field sampled at that octave's grid (Horizontal/Vertical Scale set the
 *      base cell size; each octave doubles the frequency). Speed advances the field's evolution
 *      axis, so the field CHANGES every frame (procedural animation) — there is no static seed
 *      exposed in the .motr; the sequence is internal to FCP's generator.
 *
 * FRAGMENT SHADER — HgcClouds (VERBATIM, extract_shader.py HgcClouds):
 *   const float4 c0 = (6, -15, 10, 256);   // QUINTIC FADE coeffs + LUT size
 *   const float4 c1 = (0, 255, 0.5, 0);
 *   // Per octave k∈{0..3}: quintic smootherstep fade of the fractional coord, then bilinear
 *   // interpolation of the 4 lattice values (value noise):
 *   //   t^3, t^4, t^5 built from texCoord{2k}.xy (the fractional cell coord fx,fy)
 *   //   fade = 6·t^5 − 15·t^4 + 10·t^3          (Perlin/Ken-Perlin quintic smootherstep)
 *   //   rowMix = mix(V.xz, V.yw, fade.x)         // interpolate along x (V=texCoord{2k+1})
 *   //   octaveVal = mix(rowMix.x, rowMix.y, fade.y)  // then along y  -> r0[k]
 *   r0 = (octave0, octave1, octave2, octave3)
 *   r0.x = dot(r0, hg_Params[1])       // fBm/fractal SUM: per-octave amplitude weights
 *   r0.x = r0.x*hg_Params[0].x + hg_Params[0].y   // contrast (scale) + brightness (bias)
 *   r0.x = fabs(r0.x)*256              // -> gradient LUT index (|noise| mapped to 0..256)
 *   r0.x = clamp(idx, 0, 255)
 *   r0.xy = floor((idx,0)) + 0.5       // nearest-texel center in the 256×1 LUT
 *   r0.xy = (r0.xy + hg_Params[2].xy) * hg_Params[2].zw   // LUT texel->uv (offset+scale)
 *   r0 = gradientLUT.sample(r0.xy)     // RGBA colour from the gradient
 *   r0.xyz *= r0.www                   // PREMULTIPLY by the gradient's alpha
 *   output = r0
 *
 *   ⇒ Clouds = a 4-octave quintic-fade VALUE-NOISE field (base cell = Horizontal/Vertical
 *     Scale, doubling per octave, fBm-summed by hg_Params[1] amplitude weights), contrast/
 *     brightness-adjusted (hg_Params[0]), its |value| mapped through the authored RGBA
 *     gradient LUT, premultiplied. Speed advances the field per frame.
 *
 * ── PHASE-2 STATUS: NOT PIXEL-MATCHABLE (same class as PAENoise / PAECloudsV1).
 *   The noise LATTICE is generated CPU-side by FCP's internal pseudo-random sequence (the
 *   texCoord{2k+1} lattice values), which is NOT serialized in the .motr and NOT recoverable
 *   from the shader (the shader only INTERPOLATES a lattice it is handed). Two different
 *   value-noise fields with identical statistics cannot PSNR-match (a per-pixel stochastic
 *   ceiling), and the field also ANIMATES with Speed. So a faithful byte-match to headless is
 *   impossible without FCP's exact lattice RNG + evolution schedule. The per-primitive faithful
 *   sweep therefore reports PAECloudsV DIVERGED (worst ddb ~10) on the visible Close_and_Open
 *   fill; this is a FUNDAMENTAL stochastic-generator limitation (documented, not a bug), the
 *   same conclusion reached for PAENoise (see NOISE_DECOMPILE_REPORT.md). The ALGORITHM is
 *   fully decoded above (quintic value-noise fBm → gradient LUT → premult); only the exact RNG
 *   field is unrecoverable. If a visually-plausible (not byte-exact) clouds fill is ever wanted
 *   for the gate, implement the decoded pipeline with any value-noise lattice — but it will NOT
 *   raise the headless PSNR, so it stays unimplemented (renders absent) until there is gate ROI.
 * ========================================================================================
 */
export {};
