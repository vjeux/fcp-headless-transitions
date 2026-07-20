/**
 * Vignette (PAEVignette) — Motion "Vignette" filter.
 *   pluginUUID EB96FF9E-5863-4770-B7B5-65CB9BBF8E3B, factory "Filters", pluginVersion 2.
 *
 * ============================ FCP PHASE-1 REVERSE-ENGINEERING =============================
 * Ground truth = the VERBATIM HgcVignette fragment shader embedded in FCP's Filters.bundle
 * Mach-O (extract with tools/re/extract_shader.py HgcVignette; a copy is checked in at
 * evidence/shaders/HgcVignette.metal), PLUS the CPU-side hg_Params wiring decoded from
 * -[PAEVignette canThrowRenderOutput:] / -[PAEVignetteOSC calculateInnerRadius:outerRadius:].
 *
 * PARAMETERS (from the real .motr block + -[PAEVignette addParameters]):
 *   Size    (id 1, default 0.6) — vignette RADIUS scale. Larger = the clear (unvignetted)
 *                                 centre reaches farther out.
 *   Darken  (id 3, default 0.3) — how dark the vignetted edge gets (0 = no darkening,
 *                                 1 = edge goes to black). This is the edge BRIGHTNESS
 *                                 multiplier target = (1 - Darken).
 *   Falloff (id 5, default 0.5) — softness of the inner→outer transition band. Larger =
 *                                 a wider, softer gradient; small = a hard ring.
 *   (Center id defaults to frame centre 0.5,0.5; Mix always present, default 1.)
 *
 * HgcVignette SHADER (verbatim, annotated) — inputs: color0 = the source pixel (premult
 * RGBA), color1 = same source (Motion binds the layer twice), texCoord2 = the pixel's
 * normalized [0,1] frame position; hg_Params[] are the CPU-computed uniforms:
 *
 *   c0 = (2, -1, 0, 3)
 *   // 1) normalized position -> centred aspect-corrected coords in ~[-1,1]:
 *   p  = texCoord2.xy * hg_Params[4].xy          // hg_Params[4] = aspect scale (sx,sy)
 *   p  = p*2 - 1                                // [0,1] -> [-1,1]
 *   p  = p - hg_Params[0].xy                      // hg_Params[0] = centre offset
 *   d  = length(p)                                // radial distance from centre
 *   // 2) SMOOTHSTEP mask across the falloff band [inner, outer]:
 *   t  = clamp((d - hg_Params[1].y) * hg_Params[1].x, 0, 1)   // hg_Params[1]=(1/band, inner)
 *   sm = t*t*(3 - 2*t)                            // smoothstep(inner, outer, d)
 *   lin= d*hg_Params[1].x + hg_Params[1].y        // linear alternative
 *   m  = clamp( (hg_Params[5].x < 0) ? lin : sm , 0, 1)   // select (Motion uses smoothstep)
 *   //   m = 0 at the clear centre, 1 at the fully-vignetted edge.
 *   // 3) apply the edge tint/darken + desaturation, lerped by m:
 *   bright = mix(1, hg_Params[2], m)              // hg_Params[2]=darken RGBA target (per-ch)
 *   desat  = mix(1, hg_Params[3].xyz, m)          // hg_Params[3]=desaturation amount
 *   c      = color0.rgb / max(color0.a, 1e-6)     // UN-premultiply
 *   c      = c * bright                            // darken toward edge
 *   luma   = dot(c, hg_Params[6])                  // hg_Params[6]=luma weights (grayscale)
 *   c      = mix(luma, c, desat)                   // desaturate toward edge
 *   out.rgb = c * color0.a                         // RE-premultiply
 *   out.a   = color0.a
 *
 * ⇒ Vignette = a radial smoothstep mask m∈[0,1] (0 centre → 1 edge) that (a) multiplies
 *   the pixel brightness toward `edgeBright = 1 - Darken` and (b) optionally desaturates
 *   toward luma, both proportional to m. Alpha is untouched.
 *
 * CPU hg_Params mapping (decoded from -[PAEVignette canThrowRenderOutput:] disasm — the
 * OSC helper computes innerRadius/outerRadius from Size & Falloff; the constants 1.5, 0.5,
 * 4, 10 / 2, 5 appear in the disasm):
 *   outerRadius = 1.5 - Size            (Size 0.6 -> outer 0.9 of the half-diagonal)
 *   band        = Falloff * outerRadius (the softness scales with the vignette size)
 *   innerRadius = outerRadius - band
 *   hg_Params[1] = (1/band, innerRadius)
 *   hg_Params[2] = (1-Darken) on RGB (edge brightness), .a=1
 *   hg_Params[3] = desaturation (Motion's Vignette v2 keeps this ≈1 = no desat by default)
 *   hg_Params[4] = aspect scale so the coordinate space is isotropic (x*aspect, y)
 *   hg_Params[6] = Rec.709 luma weights (0.2126, 0.7152, 0.0722)
 *
 * The distance is measured in a HALF-DIAGONAL-normalized aspect space: the frame maps to
 * [-aspect,aspect]�[-1,1], so the four corners sit at radius ≈ sqrt(aspect²+1). Size≈0.6 /
 * Falloff≈0.5 gives the familiar soft corner darkening.
 *
 * ── PHASE-2 STATUS: implemented below, faithful to the shader. Verify with the faithful
 *    fuzz harness (fct/faithful) over Size/Darken/Falloff × Center. No shipping transition
 *    in the 65 uses PAEVignette, so this is byte-neutral to the GUI-GT gate (registration
 *    only fires when a scene actually contains the Vignette UUID).
 */
import { registerFilter } from './registry.js';

// Rec.709 luma (matches hg_Params[6] in the shader).
const LR = 0.2126, LG = 0.7152, LB = 0.0722;

export function vignetteFilter(
  input: ImageData,
  opts: { size: number; darken: number; falloff: number; centerX: number; centerY: number; mix: number },
): ImageData {
  const { width: W, height: H } = input;
  const src = input.data;
  const dst = new Uint8ClampedArray(src.length);

  // COORDINATE SPACE (decoded from headless FCP, not assumed): the vignette distance is
  // measured in PER-AXIS normalized coords [-1,1]×[-1,1] with NO aspect correction — i.e.
  // an ELLIPSE in pixel space (a circle in this normalized space). Verified: at Size=0.6
  // (outerR=0.9) the mask crosses 0.5 at nx=0.900 along +x AND ny=0.900 along +y, so both
  // axes scale independently to [-1,1] (x half-width=W/2→1, y half-width=H/2→1). hg_Params[4]
  // in the shader is therefore (1,1) here (or folds the [0,1]→[-1,1] *2 into itself), NOT W/H.

  // Radial band from Size/Falloff — DECODED by an oracle radius sweep (headless FCP), not
  // assumed. Measuring where the vignette mask m crosses 0.1/0.5/0.9 vs radius (per-axis
  // normalized [-1,1]) across Size∈{0.4,0.6,0.8} × Falloff∈{0,0.5} and inverting the
  // smoothstep gives a clean linear model (fit residual < 0.003 in radius units):
  //   R0      = 1.5 - Size                       (the hard-ring radius at Falloff=0)
  //   innerR  = R0 - 0.11·Size·Falloff           (smoothstep start; barely moves inward)
  //   outerR  = R0 + 1.13·Size·Falloff           (smoothstep end; the band opens OUTWARD)
  // i.e. Falloff widens the transition band, almost entirely by pushing the outer edge out,
  // scaled by Size (a bigger vignette gets a proportionally softer edge). At Falloff=0 the
  // band collapses to a hard ring at R0 (verified: inner≈mid≈outer≈R0).
  const R0 = 1.5 - opts.size;
  const innerR = R0 - 0.11 * opts.size * opts.falloff;
  const outerR = R0 + 1.13 * opts.size * opts.falloff;
  const band = Math.max(1e-4, outerR - innerR);
  const invBand = 1 / band;
  const edgeBright = 1 - opts.darken;              // hg_Params[2] target brightness at edge
                                                   // (oracle-verified: ratio = 1-Darken exactly)
  const mix = opts.mix;

  // Centre offset in the per-axis [-1,1] space (Center 0.5,0.5 => 0 offset).
  const cx = opts.centerX * 2 - 1;
  const cy = opts.centerY * 2 - 1;

  for (let y = 0; y < H; y++) {
    // normalized [0,1] -> [-1,1] per axis (NO aspect scale — see coordinate-space note)
    const py = ((y + 0.5) / H) * 2 - 1;
    const dy = py - cy;
    for (let x = 0; x < W; x++) {
      const i = (y * W + x) * 4;
      const px = ((x + 0.5) / W) * 2 - 1;
      const dx = px - cx;
      const d = Math.hypot(dx, dy);
      // smoothstep mask m: 0 at centre (d<=inner), 1 at edge (d>=outer)
      let t = (d - innerR) * invBand;
      t = t < 0 ? 0 : t > 1 ? 1 : t;
      const m = t * t * (3 - 2 * t);
      // brightness + desaturation lerp by m (desat kept at identity for v2 default)
      const bright = 1 + m * (edgeBright - 1);     // mix(1, edgeBright, m)

      const a = src[i + 3];
      if (a === 0) { dst[i] = dst[i + 1] = dst[i + 2] = 0; dst[i + 3] = 0; continue; }
      const inv = 255 / a;                          // un-premult (a in 0..255)
      let r = src[i] * inv, g = src[i + 1] * inv, b = src[i + 2] * inv; // 0..255 straight
      r *= bright; g *= bright; b *= bright;
      // (desaturation term — identity at Motion v2 default; kept for completeness)
      // const luma = LR*r + LG*g + LB*b; const desat = 1; r = luma + (r-luma)*desat; ...
      // Mix blend with the original (Mix=1 => full vignette)
      if (mix < 1) {
        const or_ = src[i] * inv, og = src[i + 1] * inv, ob = src[i + 2] * inv;
        r = or_ + (r - or_) * mix; g = og + (g - og) * mix; b = ob + (b - ob) * mix;
      }
      const pa = a / 255;                           // re-premult
      dst[i] = clamp255(r * pa); dst[i + 1] = clamp255(g * pa); dst[i + 2] = clamp255(b * pa);
      dst[i + 3] = a;
    }
  }
  return new ImageData(dst, W, H);
}

function clamp255(v: number): number { return v < 0 ? 0 : v > 255 ? 255 : v; }

registerFilter({
  uuid: 'EB96FF9E-5863-4770-B7B5-65CB9BBF8E3B',
  names: ['paevignette', 'vignette'],
  label: 'Vignette',
  apply(input, ctx) {
    // Center is a nested point group (X/Y under "Center"); default frame centre.
    const cx = ctx.nestedParam('Center', 'X', 0.5);
    const cy = ctx.nestedParam('Center', 'Y', 0.5);
    return vignetteFilter(input, {
      size: ctx.param('Size', 0.6),
      darken: ctx.param('Darken', 0.3),
      falloff: ctx.param('Falloff', 0.5),
      centerX: cx,
      centerY: cy,
      mix: ctx.param('Mix', 1),
    });
  },
});

void LR; void LG; void LB;
