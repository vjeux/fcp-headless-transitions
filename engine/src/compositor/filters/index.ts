/**
 * Filter registry barrel. Each import has the side-effect of registering a
 * UUID-keyed filter module (see registry.ts). Add new filters here — this is the
 * ONLY shared line an agent touches when adding a filter, and it's append-only
 * (one import line), which merges cleanly across parallel branches.
 *
 * Migrated to the UUID registry so far: fill, reorient360, noise, brightness.
 * The rest are still handled by the legacy name-matched fallback chain in
 * compositor/index.ts (being migrated incrementally). New filters should be added
 * as UUID-registering modules here.
 */
import './fill.js';
import './reorient360.js';
import './noise.js';
import './levels.js';   // registers Brightness (PAEBrightness)
import './bevel.js';    // registers Bevel
import './luma-keyer.js'; // registers Luma Keyer
import './glow.js';     // registers Glow + Bloom
import './channel-mixer.js'; // registers Channel Mixer + Tint
import './hue-saturation.js'; // registers HSV Adjust
import './gaussian-blur.js'; // registers Gaussian Blur
import './directional-blur.js'; // registers Directional + Radial + Zoom Blur
import './flop.js';           // registers Flop (geometric mirror)
import './minmax.js';         // registers MinMax (separable erode/dilate morphology)
import './scrape.js';         // registers Smear/Scrape (directional inverse-map warp)
import './earthquake.js';     // registers Earthquake (seeded RNG shake/twist transform)
import './blackhole.js';      // registers Black Hole (radial gravity-lens warp, mip pyramid)
import './badtv.js';          // registers Bad TV (scanlines + desaturate; roll/wave/static RNG)
import './vignette.js';       // registers Vignette (radial smoothstep darken; HgcVignette)
import './threshold.js';      // registers Threshold (soft luma binarize; HgcThreshold, split=Threshold verified)
import './contrast.js';       // registers Contrast (PAEContrast; affine-about-0.5 in gamma-1.958 WS, decoded 2026-07-22)
import './pixellate.js';      // registers Pixellate (Scale-px mosaic; HgcPixellate coord-quantize)
import './fisheye.js';        // registers Fisheye (anisotropic radial power warp; HgcFisheye, exp=Amount/30+1)
import './underwater.js';   // registers Underwater (10-octave sinusoid refraction; HgcUnderwaterRefractV2)

import './underwater.js';   // registers Underwater (10-octave sinusoid refraction; HgcUnderwaterRefractV2)

export {};
