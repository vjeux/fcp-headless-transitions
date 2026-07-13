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
 * Detect a colour-Link source path. A `sourceChannelRef` walking through Fill Color
 * (id 111) — e.g. `./2/353/113/111/{1,2,3}` (Object > Shape > Style > Fill Color >
 * Red/Green/Blue) — reads a shape's Fill Color RGB and is the SOURCE half of a
 * colour-channel Link. The trailing 1/2/3 selects R/G/B. Returns null if the path
 * does not name a Fill Color RGB channel.
 */
function parseColorSourcePath(path: string | null | undefined): 'R' | 'G' | 'B' | null {
  if (!path) return null;
  const segs = path.replace(/^\.\//, '').split('/').map(s => s.trim()).filter(Boolean);
  const i = segs.indexOf('111');
  if (i < 0) return null;
  const chSeg = segs[i + 1];
  if (chSeg === '1') return 'R';
  if (chSeg === '2') return 'G';
  if (chSeg === '3') return 'B';
  return null;
}

/**
 * Detect a colour-Link target from the Link's affectingChannel + the Affecting
 * Object's node type. Returns the ColorTarget kind or null.
 *
 * Two structural shapes cover the built-in colour Links:
 *   1. Colorize filter Remap folder: affectingChannel `./1` (Remap Black To id=1)
 *      or `./2` (Remap White To id=2) AND the affected object is a ProPlugin
 *      filter whose pluginName contains "colorize" (also matches PAEColorize).
 *      Panels_Across's 3 crosses each carry this pair.
 *   2. Shape Fill Color: affectingChannel `./2/353/113/111` — Object(2) > Shape(353)
 *      > Style(113) > Fill Color(111). Panels_Across's "Red bar" uses this.
 *
 * The channelBehavior's sliderRange=1 attribute also tags a colour-channel target
 * (channel domain is 0..1) but we don't rely on it — the path shape is the reliable
 * decode. Gradient-tag targets (`./2/353/113/104/1/<tagId>/3/{1,2,3}`) — used by
 * Slide_In/Loop/Heart — are not returned here yet (their renderer support is separate;
 * see ROADMAP S1/T-A1 note).
 */
function parseColorTarget(
  affectingChannel: string,
  affectingObjectId: number,
  filtersById: Map<number, { pluginName?: string; name?: string }>,
): 'colorizeRemapBlack' | 'colorizeRemapWhite' | 'shapeFill' | null {
  const path = affectingChannel.trim();
  const isColorizeFilter = (id: number): boolean => {
    const f = filtersById.get(id);
    if (!f) return false;
    const pn = (f.pluginName || '').toLowerCase();
    const nm = (f.name || '').toLowerCase();
    return pn.includes('colorize') || nm.includes('colorize');
  };
  if (path === './1' && isColorizeFilter(affectingObjectId)) return 'colorizeRemapBlack';
  if (path === './2' && isColorizeFilter(affectingObjectId)) return 'colorizeRemapWhite';
  if (path === './2/353/113/111') return 'shapeFill';
  return null;
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
 * the trailing 1/2/3 = X/Y/Z. COLOUR Links drive a Colorize filter's Remap Black/
 * White folder or a Shape's Fill Color from a source shape's Fill Color RGB
 * (sourceChannelRef contains `111` = Fill Color); see parseColorTarget +
 * parseColorSourcePath. Panels_Across is the canonical colour-Link user (Colorize
 * Remap + Red bar Fill).
 */
export function parseLinkBehaviors(
  el: Element,
  factories: Map<number, string>,
  filtersById?: Map<number, { pluginName?: string; name?: string }>,
): LinkBehavior[] {
  const links: LinkBehavior[] = [];

  for (const b of directChildren(el, 'behavior')) {
    const fid = parseInt(b.getAttribute('factoryID') || '0', 10);
    if (factories.get(fid) !== 'Link') continue;

    let sourceObjectId = 0, affectingObjectId = 0, scale = 1, customMix = 1, min = -Infinity, max = Infinity;
    let offsetX = 0, offsetY = 0, offsetZ = 0, offsetOpacity = 0;
    let redOffset = 0, greenOffset = 0, blueOffset = 0;
    let redMin: number | undefined, redMax: number | undefined;
    let greenMin: number | undefined, greenMax: number | undefined;
    let blueMin: number | undefined, blueMax: number | undefined;
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
      // Colour-Link routing needs the Affecting Object (Hidden) id (id=199) to
      // decide whether `./1`/`./2` targets a Colorize filter's Remap Black/White
      // folder. Ignored by transform links (redundant with the enclosing layer id).
      else if (pname === 'Affecting Object (Hidden)' && !isNaN(num)) affectingObjectId = num;
      else if (pname === 'Scale' && !isNaN(num)) scale = num;
      else if (pname === 'Custom Mix' && !isNaN(num)) customMix = num;
      // Per-channel R/G/B offsets and min/max — colour links use these instead of
      // X/Y/Z. Motion emits "Red offset", "Red min", "Red max" (and G/B).
      else if (pname === 'Red offset' && !isNaN(num)) redOffset = num;
      else if (pname === 'Green offset' && !isNaN(num)) greenOffset = num;
      else if (pname === 'Blue offset' && !isNaN(num)) blueOffset = num;
      else if (pname === 'Red min' && !isNaN(num)) redMin = num;
      else if (pname === 'Red max' && !isNaN(num)) redMax = num;
      else if (pname === 'Green min' && !isNaN(num)) greenMin = num;
      else if (pname === 'Green max' && !isNaN(num)) greenMax = num;
      else if (pname === 'Blue min' && !isNaN(num)) blueMin = num;
      else if (pname === 'Blue max' && !isNaN(num)) blueMax = num;
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
    // COLOUR-LINK DETECTION. If any expressionChannels sourceChannelRef reads a Fill
    // Color RGB (path ends in `.../111/{1,2,3}`) AND the target path is a recognised
    // colour target (Colorize Remap folder or a Shape's Fill Color), classify this
    // Link as a colour-channel Link and emit R/G/B specs instead of X/Y/Z position.
    // Detection is purely structural — path shape + affected node type — never per
    // transition. See parseColorTarget / parseColorSourcePath.
    const exprEls = directChildren(b, 'expressionChannels');
    const colorTargetKind = filtersById
      ? parseColorTarget(affPath, affectingObjectId, filtersById)
      : null;
    const anyColourSourceRef = exprEls.some(e => parseColorSourcePath(getTextContent(e, 'sourceChannelRef')) !== null);
    // A colour Link whose target we DON'T yet render (gradient colour tags — used
    // by Loop/Heart/Slide_In, affectingChannel `.../353/113/104/...`) has a colour
    // source path (`.../111/{1,2,3}`) but no `colorTargetKind` match here. Skip
    // the whole link: falling through to the transform-link path would decode the
    // Fill Color as a POSITION and drive a random transform channel with garbage.
    // Once gradient-tag rendering lands (S1/T-A1 follow-up), extend parseColorTarget
    // to return a 'gradientTag' kind and add a case above.
    if (anyColourSourceRef && !colorTargetKind) {
      continue;
    }
    if (colorTargetKind && anyColourSourceRef) {
      // Emit one LinkBehavior per RGB channel driven. sourceChannel/targetChannel
      // are represented as X/Y/Z (the shared LinkBehavior schema) with
      // colorTarget.channel carrying the true R/G/B — the evaluator's colour path
      // reads colorTarget.channel and ignores targetChannel for routing.
      for (const expr of exprEls) {
        const srcRef = getTextContent(expr, 'sourceChannelRef');
        const chan = parseColorSourcePath(srcRef);
        if (!chan) continue;
        const tgtChar: 'X' | 'Y' | 'Z' = chan === 'R' ? 'X' : chan === 'G' ? 'Y' : 'Z';
        const perChOffset = chan === 'R' ? redOffset : chan === 'G' ? greenOffset : blueOffset;
        const perChMin = chan === 'R' ? redMin : chan === 'G' ? greenMin : blueMin;
        const perChMax = chan === 'R' ? redMax : chan === 'G' ? greenMax : blueMax;
        // The colour-Link min/max apply per channel; a value that isn't emitted
        // stays at the LinkBehavior's default (±100 sentinel = no clamp).
        const linkMin = perChMin !== undefined ? perChMin : min;
        const linkMax = perChMax !== undefined ? perChMax : max;
        links.push({
          affectedObjectId: colorTargetKind === 'shapeFill' ? affectedId : affectingObjectId,
          sourceObjectId,
          targetChannel: tgtChar,
          targetProp: 'color',
          sourceProp: 'color',
          sourceChannel: tgtChar,
          scale,
          offset: perChOffset,
          customMix,
          min: linkMin,
          max: linkMax,
          colorTarget: {
            kind: colorTargetKind,
            channel: chan,
            filterId: colorTargetKind === 'shapeFill' ? undefined : affectingObjectId,
          },
        });
      }
      // Colour Link handled — skip the transform-link path below.
      continue;
    }
    // A single Link behavior may drive MULTIPLE channels (X/Y/Z), one per
    // <expressionChannels>. LinkPos/LinkAnchor carry three; LinkRot one. Reading
    // only the first (the old behavior) silently dropped the Y/Z position links —
    // e.g. Reflection's LinkPos.Z, which pulls the card group toward the camera.
    // Collect all expression channels; emit one LinkBehavior per channel below.
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
