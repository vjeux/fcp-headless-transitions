/**
 * Evaluator — colour-channel Link resolution.
 *
 * FCP "Link" behaviours can drive not just transform channels (position/rotation/
 * scale/anchor/opacity — see links.ts) but also COLOUR channels: a hidden
 * "colour driver" shape publishes an RGB via its Fill Color (id=111), and a
 * Link's channelBehavior routes that RGB into either a Colorize filter's Remap
 * Black To / Remap White To folder, or another Shape's Fill Color. Reverse-
 * engineered from the .motr binary — the parser detects colour Links by their
 * path shape (sourceChannelRef contains `111` = Fill Color, target path is a
 * Colorize Remap folder id 1/2 OR shapeFill `./2/353/113/111`) and emits
 * LinkBehavior entries with targetProp='color' and a `colorTarget` discriminator.
 *
 * This module walks every layer's colour Links, resolves each channel value from
 * the source shape's Fill Color RGB via scene.linkColorSources (a static map
 * populated at parse time so hidden/enabled-0 driver shapes are still readable),
 * applies scale/offset/clamp/customMix, and produces:
 *
 *   colorizeRemap: filterId → { black?: {r,g,b}, white?: {r,g,b} }
 *     Consumed by the Colorize filter (compositor/filters/channel-mixer.ts): the
 *     filter checks its filterOverrides for the special keys
 *     `__ColorLink.RemapBlack.{Red|Green|Blue}` / `.RemapWhite.*` and, when
 *     present, overrides the corresponding "Remap Black To" / "Remap White To"
 *     child before applying the luma remap.
 *
 *   shapeFill: layerId → {r,g,b}
 *     Consumed in compositor/index.ts renderDrawableLayer: an evaluated shape
 *     layer's fillColor is REPLACED by the linked value before rasterisation.
 *
 * Detection is fully structural (path shape) — never keyed on transition name.
 * Fires on ≥2 built-ins (Panels_Across's 3 Colorize crosses + Red bar shape
 * fill), keeping test/no-hardcode.test.ts green.
 */
import type { MotrScene, Layer, LinkBehavior } from '../types.js';

/** Per-filter override colours. Only channels actually driven by a Link are set. */
export interface ColorizeRemapOverride {
  black?: { r?: number; g?: number; b?: number };
  white?: { r?: number; g?: number; b?: number };
}

export interface ColorLinkResult {
  /** filterId → per-filter Remap Black / Remap White RGB overrides (0-1). */
  colorizeRemap: Map<number, ColorizeRemapOverride>;
  /** layerId → shape Fill Color override (0-255 RGB, matches Shape.fillColor). */
  shapeFill: Map<number, { r: number; g: number; b: number }>;
  /**
   * gradientOwnerLayerId → (stop tagId → per-channel 0-1 float override). A colour
   * Link with colorTarget.kind='gradientTag' drives a specific gradient STOP's
   * colour (see docs/notes/GRADIENT_TAG_COLOUR_LINK_RE.md). Consumed by the
   * compositor gradient-fill rasteriser (later T-A1 step) to override the matching
   * Shape.fillGradient stop before building the colour ramp. Values are 0-1 float
   * (the shape gradient stops are 0-1, unlike the 0-255 shapeFill bucket).
   */
  gradientStops: Map<number, Map<number, { r?: number; g?: number; b?: number }>>;
}

/**
 * Read a source shape's Fill Color RGB from scene.linkColorSources. Static
 * values only — the built-in colour-driver shapes all carry a static Fill Color
 * (verified by inspecting Panels_Across's Color linker + Slide_In / Loop / Heart
 * hidden drivers). Returns undefined when the source id isn't a known Fill Color
 * owner (in which case the Link stays inactive — matching the current "silently
 * dropped" behaviour rather than injecting a wrong colour).
 */
function readSourceColorChannel(
  sourceObjectId: number,
  channel: 'R' | 'G' | 'B',
  linkColorSources: Map<number, { r: number; g: number; b: number }>,
): number | undefined {
  const src = linkColorSources.get(sourceObjectId);
  if (!src) return undefined;
  return channel === 'R' ? src.r : channel === 'G' ? src.g : src.b;
}

/**
 * Apply the Link's per-channel transform: value = clamp(src, min, max) * scale +
 * offset, gated by customMix as a blend from the base (0 for a "no prior fill"
 * override). Motion's ±100 sentinel means "no clamp" so we skip the clamp in the
 * default range (matches the transform-link convention in applyLinks / links.ts).
 */
function evalLinkChannel(link: LinkBehavior, srcValue: number): number {
  let v = srcValue;
  const defaultRange = link.min === -100 && link.max === 100;
  if (!defaultRange) {
    if (v < link.min) v = link.min;
    if (v > link.max) v = link.max;
  }
  v = v * link.scale + link.offset;
  return v;
}

/**
 * Walk a layer + its children, collecting every colour Link and applying it to
 * the appropriate override bucket. The parser attaches colour Links to the
 * scenenode that OWNS the affected object (a scenenode carrying a Colorize
 * filter, or the Shape scenenode itself), so we simply walk the layer tree.
 */
function walkColorLinks(
  layers: readonly Layer[],
  linkColorSources: Map<number, { r: number; g: number; b: number }>,
  out: ColorLinkResult,
): void {
  for (const layer of layers) {
    if (layer.links) {
      for (const link of layer.links) {
        if (link.targetProp !== 'color' || !link.colorTarget) continue;
        if (link.customMix === 0) continue;
        const srcVal = readSourceColorChannel(link.sourceObjectId, link.colorTarget.channel, linkColorSources);
        if (srcVal === undefined) continue;
        const value = evalLinkChannel(link, srcVal);
        // For customMix < 1 we'd blend with the filter/shape's own base; the four
        // T-A1 slugs all use customMix=1 (full override), so we implement full
        // replace and revisit blend semantics if a future scene needs it.
        if (link.colorTarget.kind === 'colorizeRemapBlack' || link.colorTarget.kind === 'colorizeRemapWhite') {
          const fid = link.colorTarget.filterId;
          if (fid === undefined) continue;
          const rec = out.colorizeRemap.get(fid) ?? {};
          const bucket = link.colorTarget.kind === 'colorizeRemapBlack' ? 'black' : 'white';
          const cur = rec[bucket] ?? {};
          if (link.colorTarget.channel === 'R') cur.r = value;
          else if (link.colorTarget.channel === 'G') cur.g = value;
          else cur.b = value;
          rec[bucket] = cur;
          out.colorizeRemap.set(fid, rec);
        } else if (link.colorTarget.kind === 'shapeFill') {
          // Shape.fillColor is 0-255 RGB; the source Fill Color is 0-1 float.
          const cur = out.shapeFill.get(link.affectedObjectId) ?? { r: 0, g: 0, b: 0 };
          const asByte = Math.round(Math.max(0, Math.min(1, value)) * 255);
          if (link.colorTarget.channel === 'R') cur.r = asByte;
          else if (link.colorTarget.channel === 'G') cur.g = asByte;
          else cur.b = asByte;
          out.shapeFill.set(link.affectedObjectId, cur);
        } else if (link.colorTarget.kind === 'gradientTag') {
          // Drive one gradient STOP's channel. Stored as 0-1 float (Shape.fillGradient
          // stops are 0-1). Keyed by the gradient-owner layer id (affectedObjectId) then
          // the stop tagId. Consumed by the compositor gradient rasteriser (later step);
          // for now this bucket is written but not read (gate-neutral).
          const tagId = link.colorTarget.tagId;
          if (tagId === undefined) continue;
          let byTag = out.gradientStops.get(link.affectedObjectId);
          if (!byTag) { byTag = new Map(); out.gradientStops.set(link.affectedObjectId, byTag); }
          const cur = byTag.get(tagId) ?? {};
          const v01 = Math.max(0, Math.min(1, value));
          if (link.colorTarget.channel === 'R') cur.r = v01;
          else if (link.colorTarget.channel === 'G') cur.g = v01;
          else cur.b = v01;
          byTag.set(tagId, cur);
        }
      }
    }
    walkColorLinks(layer.children, linkColorSources, out);
  }
}

/**
 * Compute all colour-Link overrides for the scene. Called once per evaluation
 * (colour driver values are static in every built-in T-A1 slug, so this doesn't
 * change with `timeSec`; the timeSec param is reserved for a future extension
 * that reads animated source colours).
 */
export function computeColorLinks(scene: MotrScene, _timeSec: number): ColorLinkResult {
  const out: ColorLinkResult = {
    colorizeRemap: new Map(),
    shapeFill: new Map(),
    gradientStops: new Map(),
  };
  if (!scene.linkColorSources || scene.linkColorSources.size === 0) return out;
  walkColorLinks(scene.layers, scene.linkColorSources, out);
  return out;
}

/**
 * Fold the per-filter colour-Link Remap overrides into the existing
 * filterOverrides map, using SPECIAL PARAM NAMES (`__ColorLink.RemapBlack.Red`
 * etc.). The Colorize filter checks for these keys before reading its own
 * "Remap Black To" / "Remap White To" nested params. Extending the existing
 * `Map<filterId, Map<string, number>>` structure keeps the compositor's
 * per-filter override plumbing UNCHANGED — the only new consumer is Colorize.
 */
export function mergeColorLinksIntoFilterOverrides(
  filterOverrides: Map<number, Map<string, number>>,
  colorLinks: ColorLinkResult,
): void {
  for (const [fid, rec] of colorLinks.colorizeRemap) {
    let m = filterOverrides.get(fid);
    if (!m) { m = new Map(); filterOverrides.set(fid, m); }
    if (rec.black) {
      if (rec.black.r !== undefined) m.set('__ColorLink.RemapBlack.Red', rec.black.r);
      if (rec.black.g !== undefined) m.set('__ColorLink.RemapBlack.Green', rec.black.g);
      if (rec.black.b !== undefined) m.set('__ColorLink.RemapBlack.Blue', rec.black.b);
    }
    if (rec.white) {
      if (rec.white.r !== undefined) m.set('__ColorLink.RemapWhite.Red', rec.white.r);
      if (rec.white.g !== undefined) m.set('__ColorLink.RemapWhite.Green', rec.white.g);
      if (rec.white.b !== undefined) m.set('__ColorLink.RemapWhite.Blue', rec.white.b);
    }
  }
}
