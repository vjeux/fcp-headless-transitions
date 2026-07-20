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
// NOTE: threshold.ts holds the faithful HgcThreshold shader translation but is NOT registered
// yet — its Threshold->split-luma transfer is unverified (measured 0.6->0.465 ≈ Threshold^1.5,
// needs a gradient test source to confirm). Shipping it now would be diverged (~15 dB). See
// evidence/THRESHOLD_RE.md. Register once verified >=30 dB against headless FCP.

export {};
