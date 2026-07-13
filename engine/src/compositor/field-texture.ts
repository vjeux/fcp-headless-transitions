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
 * The green (or any) Tint that a particle-group ancestor applies to the WHOLE
 * particle subsystem. Motion authors the Nature/Stylized emitter transitions inside
 * a group carrying a TintFx (e.g. Diagonal's "Transition Diagonal" group tints the
 * texture backdrop + every emitted sprite green RGB(0.30,0.77,0.29)). The field
 * proxy and the sprite sim both render pieces of that group, so both must be tinted
 * by it. Returns 0-1 RGB + intensity + mix, or null if no ancestor TintFx.
 */
export interface ParticleGroupTint { r: number; g: number; b: number; intensity: number; mix: number; }

/**
 * Find the TintFx on the nearest ancestor GROUP that contains a particle Emitter.
 * Structural (a Tint filter on a group whose subtree has an emitter) — never keyed
 * on a transition name. Reads the tint colour from the filter's Color folder
 * (Red id1 / Green id2 / Blue id3) and Intensity/Mix, evaluated statically (the
 * built-in emitter-group tints are constant).
 */
export function detectParticleGroupTint(scene: EvaluatedScene): ParticleGroupTint | null {
  const subtreeHasEmitter = (l: Layer): boolean => {
    if ((l as { isParticleEmitter?: boolean }).isParticleEmitter) return true;
    for (const c of l.children) if (subtreeHasEmitter(c)) return true;
    return false;
  };
  const readTint = (l: Layer): ParticleGroupTint | null => {
    for (const f of l.filters ?? []) {
      const nm = (f.pluginName || '') + ' ' + ((f as { name?: string }).name || '');
      if (!/tint/i.test(nm)) continue;
      let r = 1, g = 1, b = 1, intensity = 1, mix = 1;
      for (const p of f.parameters) {
        const kids = (p as { children?: { id?: number; name?: string; value?: number }[] }).children;
        if (p.name === 'Color' && kids) {
          for (const c of kids) {
            if (c.id === 1 || c.name === 'Red') r = c.value ?? r;
            else if (c.id === 2 || c.name === 'Green') g = c.value ?? g;
            else if (c.id === 3 || c.name === 'Blue') b = c.value ?? b;
          }
        } else if (p.name === 'Intensity' && typeof p.value === 'number') intensity = p.value;
        else if (p.name === 'Mix' && typeof p.value === 'number') mix = p.value;
      }
      return { r, g, b, intensity, mix };
    }
    return null;
  };
  // The nearest ancestor GROUP that (a) carries a Tint filter and (b) contains an
  // emitter in its subtree is the particle-group tint. Walk the RAW parsed Layer tree
  // (scene.layerById holds every Layer with its .filters / .children / source), not the
  // EvaluatedLayer wrappers (which don't carry .filters).
  const roots: Layer[] = [];
  const seen = new Set<number>();
  for (const l of scene.layerById.values()) { void seen; roots.push(l); }
  let found: ParticleGroupTint | null = null;
  const walk = (l: Layer): void => {
    if (found) return;
    if (l.filters && l.filters.length && subtreeHasEmitter(l)) {
      const t = readTint(l);
      if (t) { found = t; return; }
    }
    for (const c of l.children) walk(c);
  };
  // layerById contains descendants too; walking every entry + recursing is safe because
  // `found` short-circuits on the first (outermost-encountered) tinted emitter group.
  for (const l of roots) { walk(l); if (found) break; }
  return found;
}

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
export function applyParticleFieldProxy(output: ImageData, scene: EvaluatedScene, field: FieldTexture, tint?: ParticleGroupTint | null): void {
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
  // The texture backdrop lives under the particle group's TintFx, so tint it the
  // same way (luma·tintColor lerp by intensity·mix) before compositing. Matches the
  // Tint filter model in channel-mixer.ts.
  const im = tint ? tint.intensity * tint.mix : 0;
  for (let y = 0; y < oh; y++) {
    const sy = sameSize ? y : Math.min(th - 1, (y * th / oh) | 0);
    for (let x = 0; x < ow; x++) {
      const sx = sameSize ? x : Math.min(tw - 1, (x * tw / ow) | 0);
      const di = (y * ow + x) * 4;
      const si = (sy * tw + sx) * 4;
      let tr = tex.data[si], tg = tex.data[si + 1], tb = tex.data[si + 2];
      if (tint && im > 0) {
        const lum = 0.299 * tr + 0.587 * tg + 0.114 * tb;
        tr = tr * (1 - im) + lum * tint.r * im;
        tg = tg * (1 - im) + lum * tint.g * im;
        tb = tb * (1 - im) + lum * tint.b * im;
      }
      output.data[di]   = output.data[di]   * (1 - o) + tr * o;
      output.data[di+1] = output.data[di+1] * (1 - o) + tg * o;
      output.data[di+2] = output.data[di+2] * (1 - o) + tb * o;
    }
  }
}
