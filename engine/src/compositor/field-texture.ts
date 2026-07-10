/**
 * Compositor — particle-field texture proxy.
 *
 * Some Stylized/Nature emitter transitions ship a full-frame bundled texture whose
 * particle field is faked by compositing that texture over the whole frame on a derived
 * envelope (rather than simulating particles). detectFieldTexture finds the texture +
 * its progress-space window; applyParticleFieldProxy composites it. Split out of
 * compositor/index.ts (ROADMAP item 7).
 */
import type { EvaluatedScene } from '../evaluator/index.js';
import type { RationalTime, Layer } from '../types.js';
import { smoothstep01 } from './blit.js';


/** Detected particle-field texture + its envelope window (progress space). */
export interface FieldTexture { img: ImageData; layerId: number; pin: number; pout: number; }

/**
 * Detect the full-frame bundled texture that stands in for a Stylized/Nature
 * Emitter transition's aggregate particle field. Returns null unless the scene
 * has a particle Emitter (factoryID 23), a resolvable frame-filling texture image,
 * and a mediaResolver. The envelope window is that texture layer's own parsed
 * timing (in→out) in progress space.
 */
export function detectFieldTexture(
  scene: EvaluatedScene,
  mediaResolver?: (url: string) => ImageData | null
): FieldTexture | null {
  if (!mediaResolver) return null;

  // 1. Require a particle Emitter (factoryID 23) somewhere in the scene.
  let hasEmitter = false;
  for (const l of scene.layerById.values()) { if (l.isParticleEmitter) { hasEmitter = true; break; } }
  if (!hasEmitter) return null;

  // 2. Find the largest resolvable full-frame texture image layer + its timing.
  const end = scene.animationEndSec || 1;
  let texImg: ImageData | null = null;
  let texArea = 0, texId = -1;
  let winIn = 0, winOut = end;
  const t2s = (rt: RationalTime): number => (rt.timescale > 0 ? rt.value / rt.timescale : 0);
  const scanTex = (l: Layer): void => {
    if (l.type === 'image' && l.source && l.source.type === 'media') {
      const img = mediaResolver(l.source.url);
      if (img) {
        const area = img.width * img.height;
        if (area > texArea && img.width >= scene.width * 0.5 && img.height >= scene.height * 0.5) {
          texImg = img; texArea = area; texId = l.id;
          if (l.timing) { winIn = t2s(l.timing.in); winOut = t2s(l.timing.out); }
        }
      }
    }
    for (const c of l.children) scanTex(c);
  };
  for (const l of scene.layerById.values()) scanTex(l);
  if (!texImg) return null;

  const pin = Math.max(0, winIn / end);
  const pout = Math.min(1, winOut / end);
  if (pout <= pin) return null;
  return { img: texImg, layerId: texId, pin, pout };
}

/**
 * Composite the bundled gray texture over the frame as a proxy for the aggregate
 * particle field of Stylized/Nature Emitter transitions. Motion spawns a dense
 * field of gray hexagon/bokeh particles over a bundled gray "paper" texture,
 * blending toward a near-uniform gray backdrop that hides the source photo through
 * the middle of the transition. The pure-JS engine does not run Motion's seeded
 * particle simulation, so this reconstructs the gray backdrop the field aggregates
 * to, using the texture's own visibility window and a symmetric smoothstep bell
 * (ramp = 35% of the window each side). Uses the UN-wrapped scene time so the
 * envelope follows the true transition progress even after the drop zones
 * retime-wrap back to source A.
 */
export function applyParticleFieldProxy(output: ImageData, scene: EvaluatedScene, field: FieldTexture): void {
  const end = scene.animationEndSec || 1;
  const { img: tex, pin, pout } = field;
  const fieldTime = scene.unwrappedTime ?? scene.time;
  const progress = Math.min(1, Math.max(0, fieldTime / end));
  if (progress <= pin || progress >= pout) return;
  const win = pout - pin;
  const ramp = Math.max(1e-3, 0.35 * win);
  const up = smoothstep01((progress - pin) / ramp);
  const dn = smoothstep01((pout - progress) / ramp);
  const o = Math.min(up, dn);
  if (o <= 0) return;

  const ow = output.width, oh = output.height;
  const tw = tex.width, th = tex.height;
  const sameSize = tw === ow && th === oh;
  for (let y = 0; y < oh; y++) {
    const sy = sameSize ? y : Math.min(th - 1, (y * th / oh) | 0);
    for (let x = 0; x < ow; x++) {
      const sx = sameSize ? x : Math.min(tw - 1, (x * tw / ow) | 0);
      const di = (y * ow + x) * 4;
      const si = (sy * tw + sx) * 4;
      output.data[di]   = output.data[di]   * (1 - o) + tex.data[si]   * o;
      output.data[di+1] = output.data[di+1] * (1 - o) + tex.data[si+1] * o;
      output.data[di+2] = output.data[di+2] * (1 - o) + tex.data[si+2] * o;
    }
  }
}
