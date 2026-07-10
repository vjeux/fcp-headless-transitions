/**
 * Parser — layer + link behavior parsing.
 *
 * Parses animation behaviors attached to a layer (Fade, Ramp, Throw, etc.) and the
 * Link behaviors that drive one object's parameters from another. Rig behaviors are
 * handled separately by the rig system. Split out of parser/index.ts (ROADMAP item 7).
 */
import type { LayerBehavior, LinkBehavior } from '../types.js';
import { directChildren, firstChild, getTextContent, parseTiming } from './xml.js';

/**
 * Parse animation behaviors (Fade, Ramp, etc.) attached as children of a layer.
 * Excludes Rig Behaviors (handled separately via the rig system).
 */
export function parseLayerBehaviors(el: Element, factories: Map<number, string>): LayerBehavior[] {
  const behaviors: LayerBehavior[] = [];
  for (const b of directChildren(el, 'behavior')) {
    const name = b.getAttribute('name') || '';
    if (name.startsWith('Rig Behavior')) continue; // handled by rig system

    const fid = parseInt(b.getAttribute('factoryID') || '0', 10);
    const ftype = factories.get(fid) || '';

    let type: LayerBehavior['type'] = 'other';
    if (ftype === 'Fade In/Fade Out') type = 'fade';
    else if (ftype === 'Ramp') type = 'ramp';
    else if (ftype === 'Oscillate') type = 'oscillate';
    else if (ftype === 'Spin') type = 'spin';

    // Collect params
    const params: Record<string, number> = {};
    let targetParam: string | undefined;
    for (const p of directChildren(b, 'parameter')) {
      const pname = p.getAttribute('name') || '';
      const pval = p.getAttribute('value');
      if (pval !== null) {
        const num = parseFloat(pval);
        if (!isNaN(num)) params[pname] = num;
      }
      if (pname === 'Apply To' || pname === 'Target') targetParam = p.getAttribute('value') || undefined;
    }

    behaviors.push({ type, params, targetParam, timing: parseTiming(b) });
  }
  return behaviors;
}

/**
 * Parse Link behaviors (factory "Link", id 7) attached to a layer.
 *
 * A Link drives one of the host layer's Position channels from a source object's
 * Position channel. Motion uses these for pushes/slides: a hidden driver node
 * (e.g. Push's "Color Solid") animates its position, and Links copy that motion
 * onto the visible transition group — one Link per axis, gated by the Direction rig.
 *
 * Channel refs like "./1/100/101/1" mean Properties(1)/Transform(100)/Position(101)/X(1);
 * the trailing 1/2/3 = X/Y/Z.
 */
export function parseLinkBehaviors(el: Element, factories: Map<number, string>): LinkBehavior[] {
  const links: LinkBehavior[] = [];

  for (const b of directChildren(el, 'behavior')) {
    const fid = parseInt(b.getAttribute('factoryID') || '0', 10);
    if (factories.get(fid) !== 'Link') continue;

    let sourceObjectId = 0, scale = 1, customMix = 1, min = -Infinity, max = Infinity;
    let offsetX = 0, offsetY = 0, offsetZ = 0, offsetOpacity = 0;
    // Motion nests LinkX/LinkY on the "Group" layer; their "Affecting Object" names
    // Transition A, but the observed effect is that the whole group (A + the B
    // clones) is driven together (so B enters as A leaves). We therefore apply the
    // link to the ENCLOSING layer, which carries both. (Applying it to A alone
    // leaves the clones static and B never enters — verified against ground truth.)
    const affectedId = parseInt(el.getAttribute('id') || '0', 10);
    for (const p of directChildren(b, 'parameter')) {
      const pname = p.getAttribute('name') || '';
      const v = p.getAttribute('value');
      const num = v !== null ? parseFloat(v) : NaN;
      if (pname === 'Source Object') sourceObjectId = parseInt(v || '0', 10);
      else if (pname === 'Scale' && !isNaN(num)) scale = num;
      else if (pname === 'Custom Mix' && !isNaN(num)) customMix = num;
      else if ((pname === 'X min' || pname === 'Y min' || pname === 'Z min' || pname === 'Opacity min') && !isNaN(num)) min = num;
      else if ((pname === 'X max' || pname === 'Y max' || pname === 'Z max' || pname === 'Opacity max') && !isNaN(num)) max = num;
      // Additive per-clone offset (linked = source*scale + offset). Only set when
      // present (default 0). Clothesline's Transition B carries "X offset"≈+2072.
      else if (pname === 'X offset' && !isNaN(num)) offsetX = num;
      else if (pname === 'Y offset' && !isNaN(num)) offsetY = num;
      else if (pname === 'Z offset' && !isNaN(num)) offsetZ = num;
      // Opacity offset (LinkBOF-style blend-opacity-fade links): linked opacity =
      // source*scale + opacityOffset, then clamped to [min,max]. Scale's Clone-B
      // fade uses scale=-1, offset=+1 → 1-source (fade-in as driver opacity 1→0).
      else if (pname === 'Opacity offset' && !isNaN(num)) offsetOpacity = num;
    }

    // Determine which channels are driven from expressionChannels.
    const chanName = (ref: string | null): 'X' | 'Y' | 'Z' | undefined => {
      if (!ref) return undefined;
      const last = ref.trim().split('/').pop();
      return last === '1' ? 'X' : last === '2' ? 'Y' : last === '3' ? 'Z' : undefined;
    };
    const propFromPath = (path: string): 'position' | 'rotation' | 'scale' | 'opacity' | 'anchor' => {
      const p = path.replace(/^\.\//, '').split('/').map(s => s.trim()).filter(Boolean);
      if (p[0] === '1' && p[1] === '100') {
        if (p[2] === '109') return 'rotation';
        if (p[2] === '105') return 'scale';
        // 107 = Anchor Point. LinkAnchor drives the layer's anchor on ALL axes.
        // Movements/Reflection copies the driver's anchor Z (=960) so the card
        // hinges on the shared "spine" plane; Movements/Switch copies the driver's
        // anchor X (the driver's self-linked positionX ≈2363) so the card pivots
        // about that far vertical hinge. Both are the anchor, not a position.
        if (p[2] === '107') return 'anchor';
      }
      // Blending > Opacity: "./1/200/202" (LinkAO/LinkBO/LinkBOF drive opacity).
      if (p[0] === '1' && p[1] === '200' && p[2] === '202') return 'opacity';
      return 'position';
    };
    // Per-channel anchor routing: LinkAnchor (./1/100/107/*) drives the anchor on
    // ALL axes (X/Y/Z). Only Reflection & Switch use LinkAnchor.
    const anchorProp = (affPath: string, _ch: 'X' | 'Y' | 'Z'): 'position' | 'rotation' | 'scale' | 'opacity' | 'anchor' => {
      // LinkAnchor drives the anchor point on ALL axes (X/Y/Z). Only Reflection
      // and Switch use LinkAnchor: Reflection's driver anchor X/Y are 0 (so anchor
      // vs position routing is a no-op there — its hinge is the Z=960 spine),
      // while Switch's driver anchor X=737 is the vertical hinge pivot and MUST
      // land on the anchor (not position, which would translate the card off-frame).
      return propFromPath(affPath);
    };
    const cbEl = firstChild(b, 'channelBehavior');
    const affPath = cbEl?.getAttribute('affectingChannel') || '';
    // A single Link behavior may drive MULTIPLE channels (X/Y/Z), one per
    // <expressionChannels>. LinkPos/LinkAnchor carry three; LinkRot one. Reading
    // only the first (the old behavior) silently dropped the Y/Z position links —
    // e.g. Reflection's LinkPos.Z, which pulls the card group toward the camera.
    // Collect all expression channels; emit one LinkBehavior per channel below.
    const exprEls = directChildren(b, 'expressionChannels');
    interface ChanSpec { targetChannel: 'X' | 'Y' | 'Z'; sourceChannel: 'X' | 'Y' | 'Z'; targetProp: 'position' | 'rotation' | 'scale' | 'opacity' | 'anchor'; sourceProp: 'position' | 'rotation' | 'scale' | 'opacity' | 'anchor'; }
    const chanSpecs: ChanSpec[] = [];
    for (const expr of exprEls) {
      const srcRef = getTextContent(expr, 'sourceChannelRef');
      const tgtId = getTextContent(expr, 'targetChannelID');
      const sourceChannel = chanName(srcRef);
      const targetChannel = tgtId === '1' ? 'X' : tgtId === '2' ? 'Y' : tgtId === '3' ? 'Z' : chanName(affPath || null);
      if (!targetChannel) continue;
      chanSpecs.push({
        targetChannel,
        sourceChannel: sourceChannel ?? targetChannel,
        targetProp: anchorProp(affPath, targetChannel),
        sourceProp: anchorProp(srcRef || affPath, (sourceChannel ?? targetChannel)),
      });
    }
    // Fallback: no expressionChannels — derive the single channel from affPath.
    if (chanSpecs.length === 0) {
      const prop = propFromPath(affPath);
      // Opacity is a scalar (single channel). LinkAO/LinkBO/LinkBOF reference
      // channel id 202 which has no X/Y/Z sub-index, so chanName(affPath) is
      // undefined; default to 'X' so the scalar opacity link is not dropped (the
      // opacity branch in applyLinks ignores the channel index).
      const targetChannel = prop === 'opacity' ? 'X' : chanName(affPath || null);
      if (targetChannel) {
        chanSpecs.push({ targetChannel, sourceChannel: targetChannel, targetProp: anchorProp(affPath, targetChannel), sourceProp: anchorProp(affPath, targetChannel) });
      }
    }
    if (chanSpecs.length === 0 || sourceObjectId === 0) continue;

    // Dedupe. A uniform-Scale Link (affectingChannel "./1/100/105" with no axis)
    // lists X/Y/Z expressionChannels, but the evaluator's scale branch already drives
    // ALL axes from one link — emitting three would triple-apply the mix blend
    // (regressed Movements/Scale 31.9→24.3dB). Collapse all 'scale' specs to a single
    // entry, and drop any exact (targetProp,targetChannel) duplicates.
    const seen = new Set<string>();
    const deduped: ChanSpec[] = [];
    for (const c of chanSpecs) {
      const key = (c.targetProp === 'scale' || c.targetProp === 'opacity') ? c.targetProp : `${c.targetProp}:${c.targetChannel}`;
      if (seen.has(key)) continue;
      seen.add(key);
      deduped.push(c);
    }
    chanSpecs.length = 0;
    chanSpecs.push(...deduped);

    // Sibling "Rig Behavior"s drive this Link's Custom Mix (channel "./207") AND
    // its Scale (channel "./204") per direction. Both are rig snapshot arrays
    // indexed by the Direction widget value. The Scale snapshots carry the
    // per-direction SIGN (e.g. Left→Right needs scale −1, Right→Left +1) — without
    // them only one direction renders correctly.
    let rigWidgetId: number | undefined;
    let rigCustomMix: number[] | undefined;
    let rigScale: number[] | undefined;
    const linkId = parseInt(b.getAttribute('id') || '0', 10);
    const parent = (el as any).parentNode as Element | null;
    const searchScope = parent ? Array.from(parent.getElementsByTagName('behavior')) : [];
    const readSnapshots = (rb: Element): number[] | undefined => {
      const snapsParam = directChildren(rb, 'parameter').find(p => p.getAttribute('name') === 'Snapshots');
      if (!snapsParam) return undefined;
      const out: number[] = [];
      for (const snap of directChildren(snapsParam, 'parameter')) {
        const curveEl = firstChild(snap, 'curve');
        const val = curveEl?.getAttribute('value');
        out.push(val !== null && val !== undefined ? parseFloat(val) : 0);
      }
      return out;
    };
    for (const rb of searchScope) {
      const nm = rb.getAttribute('name') || '';
      if (!nm.startsWith('Rig Behavior')) continue;
      const cb = firstChild(rb, 'channelBehavior');
      const affCh = cb?.getAttribute('affectingChannel') || '';
      let affObj = 0, widgetId = 0;
      for (const p of directChildren(rb, 'parameter')) {
        if (p.getAttribute('name') === 'Affecting Object (Hidden)') affObj = parseInt(p.getAttribute('value') || '0', 10);
        if (p.getAttribute('name') === 'Widget') widgetId = parseInt(p.getAttribute('value') || '0', 10);
      }
      if (affObj !== linkId) continue;
      if (affCh.endsWith('/207')) { rigCustomMix = readSnapshots(rb); rigWidgetId = widgetId; }
      else if (affCh.endsWith('/204')) { rigScale = readSnapshots(rb); rigWidgetId = widgetId; }
    }

    for (const spec of chanSpecs) {
      links.push({
        affectedObjectId: affectedId,
        sourceObjectId,
        targetChannel: spec.targetChannel,
        targetProp: spec.targetProp,
        sourceProp: spec.sourceProp,
        sourceChannel: spec.sourceChannel,
        scale,
        offset: spec.targetProp === 'opacity' ? offsetOpacity
          : spec.targetChannel === 'X' ? offsetX : spec.targetChannel === 'Y' ? offsetY : offsetZ,
        customMix,
        min,
        max,
        rigWidgetId,
        rigCustomMix,
        rigScale,
      });
    }
  }
  return links;
}
