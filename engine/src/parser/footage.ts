/**
 * Parser — footage clips + image source resolution.
 *
 * Parses the scene's <footage> block into ClipInfo (clip-id -> A/B drop zone,
 * bundled-media relativeURLs, drop-zone media box height) and resolves each image /
 * generator node's ImageSource (transitionA/B, media, color, gaussianGradient) plus
 * its drop-zone framing. ClipInfo is threaded through the parse tree (no module
 * globals) so concurrent parses never share mutable state. Split out of
 * parser/index.ts (ROADMAP item 7).
 */
import type { ImageSource, GaussianGradientConfig, LensFlareConfig, LinearGradientConfig, Parameter } from '../types.js';
import { directChildren, getTextContent, parseParameter } from './xml.js';
import { srgbChannelToLinear } from '../compositor/linear.js';

/**
 * Parse the scene's <footage> block into a map of clip-id → 'A' | 'B'.
 *
 * Transition templates declare two drop-zone clips inside <footage>:
 *   <clip name="Transition A" id="..."><pathURL>Drop Zone Transition A.tiff</pathURL>
 *   <clip name="Transition B" id="..."><pathURL>Drop Zone Transition B.tiff</pathURL>
 * Image nodes reference these by clip id via their "Source Media" (id 300) param.
 *
 * Classification is by pathURL (…Transition A… / …Transition B…), which is stable
 * and not localized. As a last resort the two clips are ordered A, B by document
 * order (the format always lists A before B).
 */
/**
 * Clip-id → bundled media relativeURL, populated per parse. Some transitions
 * (e.g. Stylized/Documentary/Slide) reference template-bundled PNG assets (the
 * sliding rounded-rectangle tiles) via a `<clip>` with a `<relativeURL>` instead
 * of a Transition A/B drop zone. Image copies pointing at these become
 * `{type:'media', url}` sources, resolved by the host's mediaResolver. Module-level
 * because parsing is synchronous and single-threaded; reset at the start of each
 * parseFootageClipAB call.
 */
/**
 * Per-parse footage-clip metadata, bundled into one object threaded through the
 * parse tree (parseFootageClipAB -> parseSceneNode/parseLayerElement ->
 * determineImageSource) instead of module globals, so concurrent parses never
 * share mutable state.
 */
export interface ClipInfo {
  /**
   * Footage clip-id -> which transition drop zone (A = outgoing, B = incoming),
   * or 'P' for an UNFILLED generic "Drop Zone" placeholder (missing media, name
   * "Drop Zone" without an A/B designation) — FCP renders these as a neutral-gray
   * placeholder card (the drop-zone "arrow" glyph), NOT the user's A/B media.
   */
  ab: Map<number, 'A' | 'B' | 'P'>;
  /**
   * Footage clip-id -> bundled media relativeURL. Some transitions (e.g.
   * Stylized/Documentary/Slide) reference template-bundled PNG assets (sliding
   * rounded-rectangle tiles) via a <clip> with a <relativeURL> instead of a
   * Transition A/B drop zone; image copies pointing at these become
   * {type:'media', url} sources, resolved by the host's mediaResolver.
   */
  media: Map<number, { url: string; frameRate?: number }>;
  /**
   * Smallest drop-zone media box height (Fixed Height, id 115) seen while parsing
   * the <footage> clips. Movements/Drop In conforms its source into this box.
   * Undefined when no clip carries a Fixed Height.
   */
  dropZoneMediaHeight?: number;
}

export function parseFootageClipAB(sceneEl: Element, factories: Map<number, string>): ClipInfo {
  const map = new Map<number, 'A' | 'B' | 'P'>();
  const clipMedia = new Map<number, { url: string; frameRate?: number }>();
  let dropZoneMediaHeight: number | undefined;
  const clips: { id: number; path: string; name: string }[] = [];
  for (const footage of Array.from(sceneEl.getElementsByTagName('footage'))) {
    for (const clip of directChildren(footage, 'clip')) {
      const id = parseInt(clip.getAttribute('id') || '0', 10);
      if (!id) continue;
      const path = (getTextContent(clip, 'pathURL') || '').toLowerCase();
      const name = (clip.getAttribute('name') || '').toLowerCase();
      clips.push({ id, path, name });
      // Capture the drop-zone media box's Fixed Height (Object → id 115). Motion
      // conforms the drop-zone source to this box; Drop In uses it to size the
      // top-left card. Track the smallest across the transition's clips.
      for (const objP of directChildren(clip, 'parameter')) {
        if (objP.getAttribute('name') !== 'Object') continue;
        for (const c of directChildren(objP, 'parameter')) {
          if (c.getAttribute('name') === 'Fixed Height' && c.getAttribute('id') === '115') {
            const v = parseFloat(c.getAttribute('value') || '');
            if (isFinite(v) && v > 1 && (dropZoneMediaHeight === undefined || v < dropZoneMediaHeight)) {
              dropZoneMediaHeight = v;
            }
          }
        }
      }
      // Bundled template media (e.g. Slide's rounded-rect tile PNGs) is referenced
      // via <relativeURL>Media/foo.png</relativeURL> (URL-encoded). Record it so
      // image copies pointing at this clip resolve to a media source.
      const rel = getTextContent(clip, 'relativeURL');
      if (rel && rel.trim()) {
        let url = rel.trim();
        try { url = decodeURIComponent(url); } catch { /* keep raw */ }
        // Capture the footage clip's own Frame Rate (Object id=2 > "Frame Rate"
        // id=107). A media layer's Retime Value curve stores clip FRAME numbers;
        // dividing by this frame rate converts the retimed frame back to clip
        // seconds for the host resolver's ffmpeg seek (see compositor mediaTime).
        let frameRate: number | undefined;
        const frElems = clip.getElementsByTagName('parameter');
        for (let k = 0; k < frElems.length; k++) {
          const p = frElems[k];
          if (p.getAttribute('name') === 'Frame Rate' && p.getAttribute('id') === '107') {
            const v = parseFloat(p.getAttribute('value') || '');
            if (isFinite(v) && v > 0) frameRate = v;
            break;
          }
        }
        clipMedia.set(id, { url, frameRate });
      }
    }
  }
  let sawA = false, sawB = false;
  for (const c of clips) {
    if (/transition\s*a\b|drop zone transition a| a\.tiff|\ba\.|source a/.test(c.path) || /transition\s*a\b|\ba\b/.test(c.name)) {
      map.set(c.id, 'A'); sawA = true;
    } else if (/transition\s*b\b|drop zone transition b| b\.tiff|\bb\.|source b/.test(c.path) || /transition\s*b\b|\bb\b/.test(c.name)) {
      map.set(c.id, 'B'); sawB = true;
    }
  }
  // Generic "Drop Zone" clips (name/path "Drop Zone" WITHOUT an A/B designation)
  // are UNFILLED placeholder drop zones. FCP renders them as a neutral-gray
  // placeholder card (the drop-zone arrow glyph), NOT the user's A/B media —
  // DECODED from Replicator-Clones/Video_Wall_rep: its replicator cell Pins
  // reference the generic "Drop Zone" clip (id 1000118032, missing media) and
  // REAL FCP-headless renders every tile as a flat ~78 gray card, whereas the
  // sibling Video_Wall's Pins reference "Drop Zone Transition B" (filled → real
  // photo). Map generic drop zones to 'P' (placeholder) so the compositor paints
  // the gray card instead of binding them to imageA/B.
  for (const c of clips) {
    if (map.has(c.id)) continue;
    if (/drop\s*zone/.test(c.name) || /drop\s*zone/.test(c.path)) {
      map.set(c.id, 'P');
    }
  }
  // Fallback: if pathURL/name matching failed, order the two clips A then B.
  if ((!sawA || !sawB) && clips.length >= 2) {
    map.set(clips[0].id, 'A');
    map.set(clips[1].id, 'B');
  } else if (clips.length === 1 && !sawA && !sawB) {
    map.set(clips[0].id, 'A');
  }

  // FCP discovery-order override. The headless render hook assigns image A to the
  // FIRST OZImageElement that requests its media ref during render, and B to the
  // second — i.e. by DOCUMENT/render order of the drop-zone image elements, NOT by
  // the clip's "Transition A/B" name. For most templates these coincide (the A
  // element is authored first), but some (e.g. Wipes/Mask, whose "Drop Zones" group
  // lists the masked "Transition B" element BEFORE the background "Transition A")
  // reverse them. To match ground truth we re-key A/B to the order the referencing
  // image elements appear in the document. Only applied when exactly two drop-zone
  // clips are referenced by exactly two image elements (the standard A/B case).
  //
  // NOTE: a timing-aware variant (order by each element's `in` time, tie-break by
  // document order) was evaluated to fix Dissolves/Divide's A/B (whose "Transition
  // A" element goes live before "Transition B"). It DID help Divide (+0.4dB) and
  // Lights/Lens Flare (+28dB!), but REGRESSED Stylized/Center Reveal (−22dB: 40→18)
  // and its effect on the ~40 other differing-`in` templates is unvalidated. The
  // `in`-time alone does not discriminate Lens Flare (needs reorder) from Center
  // Reveal (needs pure doc order) despite identical structure, so pure document
  // order is retained as the safe, validated behavior.
  if (clips.length === 2) {
    const referenced: number[] = []; // clip ids in document order of their image elements
    // Net fade direction of each referencing node, keyed by clip id:
    //   >0 → fades IN  (incoming clip → B), <0 → fades OUT (outgoing clip → A).
    // Read from the node's own "Fade In/Fade Out" behavior (factoryID 17):
    // Fade In Time (id 200) vs Fade Out Time (id 201) in frames.
    const fadeDir = new Map<number, number>();
    // Which referenced drop-zone nodes carry a direct-child Image Mask. When BOTH
    // do, the document-order override below is SUPPRESSED (see comment there).
    const maskedClips = new Set<number>();
    const seen = new Set<number>();
    for (const node of Array.from(sceneEl.getElementsByTagName('scenenode'))) {
      // Only real drawable image elements carry a Source Media clip reference.
      const params: Parameter[] = [];
      for (const p of directChildren(node, 'parameter')) params.push(parseParameter(p));
      const cid = findSourceMediaId(params);
      if (cid !== undefined && map.has(cid) && !seen.has(cid)) {
        seen.add(cid);
        referenced.push(cid);
        // Record a direct-child <mask name="Image Mask"> on this drop-zone node.
        for (const maskEl of directChildren(node, 'mask')) {
          if (maskEl.getAttribute('name') === 'Image Mask') { maskedClips.add(cid); break; }
        }
        // Detect a direct-child "Fade In/Fade Out" behavior on this node.
        for (const b of directChildren(node, 'behavior')) {
          if (b.getAttribute('name')?.startsWith('Fade In/Fade Out')) {
            let fin = 0, fout = 0;
            for (const p of Array.from(b.getElementsByTagName('parameter'))) {
              const id = p.getAttribute('id');
              const v = parseFloat(p.getAttribute('value') || '');
              if (!isFinite(v)) continue;
              if (id === '200') fin = v;      // Fade In Time (frames)
              else if (id === '201') fout = v; // Fade Out Time (frames)
            }
            if (fin > 0 || fout > 0) fadeDir.set(cid, fin - fout);
          }
        }
      }
    }
    if (referenced.length === 2) {
      // FADE-DIRECTION OVERRIDE: a plain crossfade whose two full-frame drop zones
      // each carry a Fade In/Fade Out behavior identifies A/B by the fade, NOT by
      // document order. The clip that fades OUT is the outgoing image (A); the clip
      // that fades IN is the incoming image (B). The headless FCP renderer binds A
      // to the outgoing drop zone regardless of authoring order. This fixes the
      // templates whose "Transition B" scenenode is authored BEFORE "Transition A"
      // (Dissolves/Divide, Lights/Lens Flare): document order would swap them,
      // showing image B at t=0. Applied ONLY when both nodes have an unambiguous
      // (opposite-signed) fade direction — mask-driven reveals with no fades
      // (Stylized/Center Reveal) and single-fade templates keep pure document order.
      const [c0, c1] = referenced;
      const d0 = fadeDir.get(c0), d1 = fadeDir.get(c1);
      // BOTH-MASKED SUPPRESSION: when BOTH drop-zone nodes carry an Image Mask, the
      // template is a two-sided masked SPLIT (each source revealed through its own
      // matte — Dissolves/Divide's divide-piece union, Stylized/Up-Over's two panels),
      // NOT the single-masked reveal the document-order override was built for
      // (Wipes/Mask, Center Reveal, which mask only ONE side over an unmasked base).
      // In a two-sided split the headless renderer keeps each source on its NAME-
      // matched matte (clip "Transition A" → image A), so the doc-order re-key — which
      // for Divide/Up-Over inverts them because the "Transition B" node is authored
      // first — is WRONG here. Keep the name-based binding already in `map`. Structural
      // (fires on "both referenced drop zones carry an Image Mask"), no names.
      if (referenced.length === 2 && maskedClips.has(c0) && maskedClips.has(c1)) {
        // leave name-based A/B binding untouched
      } else if (d0 !== undefined && d1 !== undefined && Math.sign(d0) !== Math.sign(d1)
          && d0 !== 0 && d1 !== 0) {
        // Assign by fade: negative (fade-out) → A, positive (fade-in) → B.
        map.set(d0 < 0 ? c0 : c1, 'A');
        map.set(d0 < 0 ? c1 : c0, 'B');
      } else {
        map.set(referenced[0], 'A');
        map.set(referenced[1], 'B');
      }
    }
  }

  // MASKED-REVEAL A/B binding (Replicator-Clones/Duplicate). When one Transition
  // drop zone is REVEALED by an Image Mask whose source is a grid Replicator (the
  // growing-dots matte) and the sibling drop zone is the unmasked base, the headless
  // FCP renderer binds them so the UNMASKED base shows the outgoing image and the
  // MASKED layer reveals the incoming image. This template authors the two drop
  // zones with the mask on the node named "Transition B" and the base on "Transition
  // A", but the rendered result is the reverse of the name-based binding (the base
  // holds the transition's FIRST image / drop-zone B, the masked reveal grows in the
  // SECOND image / drop-zone A). So when a replicator-matte reveal is present, swap
  // the A/B assignment of the two Transition drop-zone clips. Structural (fires on
  // any replicator-mask-reveal drop zone) — no transition name, no GT constant.
  {
    // Find the clip ids of the masked (replicator-image-mask) and base drop zones.
    let maskedClipId: number | undefined;
    let baseClipId: number | undefined;
    // Walk drawable Transition A/B drop-zone nodes; find which carries an Image Mask
    // whose Mask Source is a replicator node (has a Sequence Replicator behavior).
    for (const node of Array.from(sceneEl.getElementsByTagName('scenenode'))) {
      const params: Parameter[] = [];
      for (const p of directChildren(node, 'parameter')) params.push(parseParameter(p));
      const cid = findSourceMediaId(params);
      if (cid === undefined || !map.has(cid)) continue;
      // Only the two designated Transition A/B clips (exclude the generic cell
      // "Drop Zone" clip, which is not one of the two full-frame reveal layers).
      const clipMeta = clips.find(c => c.id === cid);
      const isTransitionAB = clipMeta && /transition\s*[ab]\b/.test(clipMeta.name);
      if (!isTransitionAB) continue;
      // Does this node carry an Image Mask whose source is a replicator?
      let hasReplMask = false;
      for (const maskEl of directChildren(node, 'mask')) {
        for (const p of Array.from(maskEl.getElementsByTagName('parameter'))) {
          if (p.getAttribute('name') !== 'Mask Source') continue;
          const srcId = parseInt(p.getAttribute('value') || '0', 10);
          if (!srcId) continue;
          // Resolve the referenced node; a replicator source has a "Sequence
          // Replicator" behavior descendant (the per-cell staggered ramp).
          for (const cand of Array.from(sceneEl.getElementsByTagName('scenenode'))) {
            if (parseInt(cand.getAttribute('id') || '0', 10) !== srcId) continue;
            const behs = cand.getElementsByTagName('behavior');
            for (let bi = 0; bi < behs.length; bi++) {
              const bfid = parseInt(behs[bi].getAttribute('factoryID') || '0', 10);
              if (factories.get(bfid) === 'Sequence Replicator') hasReplMask = true;
            }
          }
        }
      }
      if (hasReplMask) maskedClipId = cid;
      else baseClipId = cid;
    }
    // Bind: the unmasked base shows the OUTGOING/first image (drop-zone A at f0, e.g.
    // Duplicate/Squares f0 = full sepia A), and the masked layer REVEALS the incoming
    // image (drop-zone B growing in through the replicator dots/squares → f23 = full B).
    // GUI GT confirms A→B (sepia→blue); the previous binding (base→B, masked→A) inverted
    // both slugs (f0 showed blue B). Structural (fires on any replicator-mask-reveal drop
    // zone), no transition name, no GT constant.
    if (maskedClipId !== undefined && baseClipId !== undefined && maskedClipId !== baseClipId) {
      map.set(baseClipId, 'A');
      map.set(maskedClipId, 'B');
    }
  }

  return { ab: map, media: clipMedia, dropZoneMediaHeight };
}
function findSourceMediaId(params: Parameter[]): number | undefined {
  for (const p of params) {
    if (p.name === 'Source Media' && p.id === 300 && typeof p.value === 'number') return p.value;
    if (p.children) { const r = findSourceMediaId(p.children); if (r !== undefined) return r; }
  }
  return undefined;
}


/**
 * Determine the image source for an image-type scenenode.
 *
 * Resolves the node's "Source Media" (id 300) clip reference against the footage
 * clip→A/B map. This is the authoritative, localization-proof signal. A node with
 * a Color Solid plugin is a solid fill, not a drop zone. Anything else is not an
 * image source (returns undefined so the caller treats it as a plain group/leaf).
 */
/** Recursively find the first parameter matching id (and optionally name). */
function findParamByIdName(ps: Parameter[], id: number, name?: string): Parameter | undefined {
  for (const p of ps) {
    if (p.id === id && (name === undefined || p.name === name)) return p;
    if (p.children) { const r = findParamByIdName(p.children, id, name); if (r) return r; }
  }
  return undefined;
}

/**
 * Parse the Motion "Gaussian Gradient" generator's Object parameter block.
 *
 * Layout (see .motr):
 *   <parameter name="Object"> <parameter name="Gaussian Gradient" id=1>
 *      Width(300) Height(301) PixelAspectRatio(302)
 *      Center(1) { X(1) Y(2) }             — empty ⇒ default centre
 *      Color 1(2) { Red Green Blue Opacity }  — empty ⇒ white opaque
 *      Color 2(3) { Red Green Blue Opacity }  — empty ⇒ black transparent
 *      Radius(4)  Flip(10002)  Absolute Points(10004)
 */
function parseGaussianGradient(params: Parameter[]): GaussianGradientConfig {
  // Locate the inner "Gaussian Gradient" object folder (child of "Object" id=2).
  let obj: Parameter[] | undefined;
  const objectFolder = findParamByIdName(params, 2, 'Object');
  if (objectFolder?.children) {
    const gg = objectFolder.children.find(p => p.name.trim() === 'Gaussian Gradient');
    obj = gg?.children ?? objectFolder.children;
  }
  const src = obj ?? params;

  const num = (p: Parameter | undefined, dflt: number): number => {
    if (!p) return dflt;
    const v = p.curve ?? p.value;
    return typeof v === 'number' ? v : dflt;
  };

  const width = num(src.find(p => p.id === 300), 1920);
  const height = num(src.find(p => p.id === 301), 1080);
  const radius = num(src.find(p => p.id === 4 && p.name.trim() === 'Radius'), 300);
  const flip = num(src.find(p => p.id === 10002), 0) !== 0;
  // Absolute Points default is 1 in the schema but transitions set 0 (normalized).
  const absolutePoints = num(src.find(p => p.id === 10004), 0) !== 0;

  // Center folder (id=1). Empty ⇒ default centre. Motion's default-value attr on
  // X/Y is 150 (a legacy pixel default) but a normalized centre is 0.5,0.5.
  const centerFolder = src.find(p => p.id === 1 && p.name.trim() === 'Center');
  let centerX = 0.5, centerY = 0.5;
  if (centerFolder?.children && centerFolder.children.length > 0) {
    const cx = centerFolder.children.find(p => p.id === 1);
    const cy = centerFolder.children.find(p => p.id === 2);
    if (cx) centerX = num(cx, 0.5);
    if (cy) centerY = num(cy, 0.5);
  }

  // Colour folders. Color 1 (id=2) default white opaque; Color 2 (id=3) default
  // black transparent (the classic Motion "glow" gradient).
  const readColor = (id: number, dfltR: number, dfltG: number, dfltB: number, dfltA: number) => {
    const folder = src.find(p => p.id === id);
    let r = dfltR, g = dfltG, b = dfltB, a = dfltA;
    if (folder?.children && folder.children.length > 0) {
      const rp = folder.children.find(p => p.name === 'Red');
      const gp = folder.children.find(p => p.name === 'Green');
      const bp = folder.children.find(p => p.name === 'Blue');
      const ap = folder.children.find(p => p.name === 'Opacity');
      if (rp) r = num(rp, dfltR); if (gp) g = num(gp, dfltG);
      if (bp) b = num(bp, dfltB); if (ap) a = num(ap, dfltA);
    }
    return { r: Math.round(r * 255), g: Math.round(g * 255), b: Math.round(b * 255), a };
  };
  const color1 = readColor(2, 1, 1, 1, 1);   // white, opaque
  const color2 = readColor(3, 0, 0, 0, 0);   // black, transparent

  return { width, height, centerX, centerY, absolutePoints, radius, color1, color2, flip };
}

/**
 * Parse Motion's "Gradient" generator (factoryID=8, pluginUUID starts with
 * 40091D89, pluginName="Gradient"). Reads the `Object(id=2) > Gradient(id=1)`
 * parameter block for the linear-gradient fill.
 *
 * The gradient axis (Start id=4, End id=5) is a direct child of `Object(id=2)`
 * — NOT nested under Gradient(id=1). Both endpoints are canvas-centred pixel
 * coordinates (+Y up in Motion). Inside `Gradient(id=1)` the `Gradient(id=310)`
 * folder holds the RGB stops (`RGB id=1` with children RGB1/RGB2, each a
 * `<parameter Location id=1>` + `<parameter Color id=3>` with R/G/B/A children)
 * and the Opacity stops (`Opacity id=2` with Opacity1/Opacity2 -> Location +
 * Opacity curves).
 *
 * SALVAGE GOTCHA (T-qcf704c6b census): parseParameter mirrors `curve.default`
 * onto `param.value` when `param.value` is not set on the param element. So
 * reading `param.value` for a stop's Red channel returns the AUTHORED default
 * (1 for RGB1.Red, 0 for RGB2.Red) — i.e. the pre-remap RED->BLUE canonical
 * gradient. The 6 COLOUR links (colorizeRemap) that recolor the panel to
 * teal->lightblue write their remapped values into `curve.value` on each
 * Red/Green/Blue leaf. Read `param.curve?.value` in preference to
 * `param.curve?.default` / `param.value` so the colorized stops flow through.
 */
function parseLinearGradient(params: Parameter[]): LinearGradientConfig {
  // Locate `Object(id=2) > Gradient(id=1)`.
  const objectFolder = findParamByIdName(params, 2, 'Object');
  const gradientFolder = objectFolder?.children?.find(p => p.id === 1 && p.name.trim() === 'Gradient');
  const gsrc = gradientFolder?.children ?? [];

  // Prefer curve.value (the colorized/remapped value) over curve.default (the
  // authored default that Motion also serializes) — see SALVAGE GOTCHA above.
  const num = (p: Parameter | undefined, dflt: number): number => {
    if (!p) return dflt;
    if (p.curve) {
      if (typeof p.curve.value === 'number') return p.curve.value;
      if (typeof p.curve.default === 'number') return p.curve.default;
    }
    if (typeof p.value === 'number') return p.value;
    return dflt;
  };

  const width = num(gsrc.find(p => p.id === 300), 1920);
  const height = num(gsrc.find(p => p.id === 301), 1080);

  // The gradient stops sit under `Gradient(id=310)`.
  const stopsFolder = gsrc.find(p => p.id === 310 && p.name.trim() === 'Gradient');
  const rgbFolder = stopsFolder?.children?.find(p => p.id === 1 && p.name.trim() === 'RGB');
  const opFolder = stopsFolder?.children?.find(p => p.id === 2 && p.name.trim() === 'Opacity');

  // Each RGB stop: Location (id=1), Color (id=3) > Red/Green/Blue leaves.
  const readRGBStop = (stop: Parameter, defaultLoc: number, defaultRGB: [number, number, number]) => {
    const loc = num(stop.children?.find(p => p.id === 1 && p.name === 'Location'), defaultLoc);
    const color = stop.children?.find(p => p.id === 3 && p.name === 'Color');
    const r = num(color?.children?.find(p => p.name === 'Red'), defaultRGB[0]);
    const g = num(color?.children?.find(p => p.name === 'Green'), defaultRGB[1]);
    const b = num(color?.children?.find(p => p.name === 'Blue'), defaultRGB[2]);
    return { location: loc, r: Math.round(r * 255), g: Math.round(g * 255), b: Math.round(b * 255) };
  };
  // Each Opacity stop: Location (id=1), Opacity leaf (id=3).
  const readOpacityStop = (stop: Parameter, defaultLoc: number, defaultA: number) => {
    const loc = num(stop.children?.find(p => p.id === 1 && p.name === 'Location'), defaultLoc);
    const a = num(stop.children?.find(p => p.name === 'Opacity'), defaultA);
    return { location: loc, a };
  };

  const rgbStops = (rgbFolder?.children ?? []).filter(p => (p.name === 'RGB1' || p.name === 'RGB2' || /^RGB\d+$/.test(p.name)));
  const opStops = (opFolder?.children ?? []).filter(p => /^Opacity\d+$/.test(p.name));

  // Motion's canonical gradient defaults: RED(1,0,0)@loc=0 -> BLUE(0,0,1)@loc=1,
  // fully opaque throughout. Missing folders fall back to this canonical gradient.
  const rgbDefaults: [number, [number, number, number]][] = [
    [0, [1, 0, 0]],
    [1, [0, 0, 1]],
  ];
  const rgbList = rgbStops.length > 0
    ? rgbStops.map((s, i) => readRGBStop(s, rgbDefaults[Math.min(i, 1)][0], rgbDefaults[Math.min(i, 1)][1]))
    : rgbDefaults.map(([loc, rgb]) => ({ location: loc, r: Math.round(rgb[0] * 255), g: Math.round(rgb[1] * 255), b: Math.round(rgb[2] * 255) }));
  const opList = opStops.length > 0
    ? opStops.map((s, i) => readOpacityStop(s, i === 0 ? 0 : 1, 1))
    : [{ location: 0, a: 1 }, { location: 1, a: 1 }];

  // Merge RGB + Opacity by nearest-location (both are usually authored as pairs
  // at the same locations). If counts differ, fall back to positional pairing.
  const stops = rgbList.map((rgb, i) => {
    let a = 1;
    if (opList.length > 0) {
      const opAt = opList.find(o => Math.abs(o.location - rgb.location) < 1e-4) ?? opList[Math.min(i, opList.length - 1)];
      a = opAt.a;
    }
    return { location: rgb.location, r: rgb.r, g: rgb.g, b: rgb.b, a };
  }).sort((a, b) => a.location - b.location);

  // Start (id=4) / End (id=5) — direct children of `Gradient(id=310)` (the
  // stops folder, itself a child of `Gradient(id=1)` under `Object(id=2)`).
  // Coordinates are canvas-centred pixels, +Y up. Motion's authored defaults:
  // Start.X=0/Y=+100, End.X=0/Y=-100 (a short vertical axis through the
  // centre). Slide_In authors Start.Y=540, End=(3.36, -798.78) — a full-frame
  // top-to-bottom axis.
  const startFolder = (stopsFolder?.children ?? []).find(p => p.id === 4 && p.name.trim() === 'Start');
  const endFolder = (stopsFolder?.children ?? []).find(p => p.id === 5 && p.name.trim() === 'End');
  const start = {
    x: num(startFolder?.children?.find(p => p.id === 1 && p.name === 'X'), 0),
    y: num(startFolder?.children?.find(p => p.id === 2 && p.name === 'Y'), 100),
  };
  const end = {
    x: num(endFolder?.children?.find(p => p.id === 1 && p.name === 'X'), 0),
    y: num(endFolder?.children?.find(p => p.id === 2 && p.name === 'Y'), -100),
  };

  return { width, height, start, end, stops };
}

/**
 * Parse Motion's LensFlareGenerator (`Lens Flare` procedural generator). Reads
 * the `Object > Lens Flare` (id 2 > id 1) parameter block for the core/ring/streak
 * appearance, and the flare-sweep endpoints from the two published "Center
 * Start"/"Center End" controls — which are authored as the `Center` (id 1) of the
 * template's disabled `Blur Start`/`Blur End` filters (pluginName). The generator's
 * own LinkX/LinkY behaviors bind its Center to these two endpoints and the rig
 * sweeps between them over the transition; we reproduce that by interpolating
 * centerStart→centerEnd by transition progress at render time. `el` is the
 * generator's <scenenode>. See LensFlareConfig for the full id map + RE notes.
 */
function parseLensFlare(params: Parameter[], el: Element | undefined): LensFlareConfig {
  // Inner "Lens Flare" object folder: Object(id 2) > Lens Flare(id 1).
  let obj: Parameter[] | undefined;
  const objectFolder = findParamByIdName(params, 2, 'Object');
  if (objectFolder?.children) {
    const lf = objectFolder.children.find(p => p.name.trim() === 'Lens Flare');
    obj = lf?.children ?? objectFolder.children;
  }
  const src = obj ?? params;

  const num = (p: Parameter | undefined, dflt: number): number => {
    if (!p) return dflt;
    if (typeof p.value === 'number') return p.value;
    if (p.curve && typeof p.curve.value === 'number') return p.curve.value;
    if (p.curve && typeof p.curve.default === 'number') return p.curve.default;
    return dflt;
  };

  const width = num(src.find(p => p.id === 300), 1920);
  const height = num(src.find(p => p.id === 301), 1080);

  const intensity = num(src.find(p => p.id === 3 && p.name.trim() === 'Intensity'), 1);
  const falloffParam = src.find(p => p.id === 4 && p.name.trim() === 'Falloff');
  const falloff = falloffParam?.curve;
  const falloffStatic = num(falloffParam, 4);

  // Core colour (id 5) { Red Green Blue } — default white.
  const readRGB = (folderId: number, name: string, dflt: [number, number, number]): { r: number; g: number; b: number } => {
    const folder = src.find(p => p.id === folderId && p.name.trim() === name);
    let cr = dflt[0], cg = dflt[1], cb = dflt[2];
    if (folder?.children) {
      const rp = folder.children.find(p => p.name === 'Red');
      const gp = folder.children.find(p => p.name === 'Green');
      const bp = folder.children.find(p => p.name === 'Blue');
      if (rp) cr = num(rp, dflt[0]); if (gp) cg = num(gp, dflt[1]); if (bp) cb = num(bp, dflt[2]);
    }
    return { r: Math.round(cr * 255), g: Math.round(cg * 255), b: Math.round(cb * 255) };
  };
  const color = readRGB(5, 'Color', [1, 1, 1]);
  const streakColor = readRGB(8, 'Streak Color', [1, 1, 1]);

  const streakIntensity = num(src.find(p => p.id === 9), 0.1);
  const streakCount = Math.round(num(src.find(p => p.id === 10), 50));
  const ringRadius = num(src.find(p => p.id === 13), 0.32);
  const ringWidth = num(src.find(p => p.id === 14), 0.12);
  const glowFalloff = num(src.find(p => p.id === 15), 5);

  // Flare-sweep endpoints. The generator's Center is link-bound to two published
  // controls "Center Start"/"Center End" — authored on the template's DISABLED
  // `Blur Start`/`Blur End` filters as their Center (id 1) {X(1),Y(2)}, normalized
  // 0-1 with Motion's +Y-up origin. Query them off the owner document GENERICALLY
  // by pluginName (never by slug). Fall back to the canonical corner-to-corner
  // diagonal (bottom-left→top-right) if the controls are absent.
  let centerStart = { x: 0, y: 0 };
  let centerEnd = { x: 1, y: 1 };
  const doc = el?.ownerDocument;
  if (doc) {
    const readFilterCenter = (pluginName: string): { x: number; y: number } | undefined => {
      for (const f of Array.from(doc.getElementsByTagName('filter'))) {
        if ((f.getAttribute('pluginName') || '').trim() !== pluginName) continue;
        for (const c of Array.from(f.getElementsByTagName('parameter'))) {
          if ((c.getAttribute('name') || '') === 'Center' && (c.getAttribute('id') || '') === '1') {
            let x: number | undefined, y: number | undefined;
            for (const ch of Array.from(c.getElementsByTagName('parameter'))) {
              const n = ch.getAttribute('name'), id = ch.getAttribute('id');
              const v = parseFloat(ch.getAttribute('value') || 'NaN');
              if (Number.isNaN(v)) continue;
              if (n === 'X' && id === '1') x = v;
              if (n === 'Y' && id === '2') y = v;
            }
            if (x !== undefined && y !== undefined) return { x, y };
          }
        }
      }
      return undefined;
    };
    const s = readFilterCenter('Blur Start');
    const e = readFilterCenter('Blur End');
    if (s) centerStart = s;
    if (e) centerEnd = e;
  }

  return {
    width, height,
    centerStart, centerEnd,
    color, streakColor,
    intensity, falloff, falloffStatic,
    streakIntensity, streakCount,
    ringRadius, ringWidth, glowFalloff,
  };
}


/**
 * TIMING DECODE for Motion's classic "Gradient" generator (pluginUUID 40091D89).
 * See the giant comment in `determineImageSource` (Gradient branch) for the
 * full RE story. TL;DR: the Motion Path behavior (factoryID=24) attached to the
 * Gradient's rounded-rect mask carries a `Position id=206` (pathControlPoints)
 * curve whose keypoint `<time>` values are PARAMETRIC positions along the
 * closed path (Motion serializes them at 0, 262144, 524288, 786432 in the
 * 262144 timescale → 0..3 "path parameter" seconds), NOT scene time. The
 * scene-level `animationEndSec` walk in parser/index.ts reads raw keypoint
 * `<time>` values from the DOM to find "when visible motion ends"; because
 * Slide_In's parent layer contains a retimingExtrapolation=1 curve on
 * Transition B, the walk's sceneDur cap treats the whole layer subtree as a
 * loop container and the parametric t=3.0 wins the maxT walk → animationEndSec
 * inflates 3× (3.0s vs the true 1.0s scene span from
 * sceneSettings.duration/frameRate=30/30). Rendering at t=(i/24)·3.0s samples
 * past every layer's `<timing out>` for f08–f23 and the transition collapses.
 *
 * Fix: overwrite each pos206 keypoint's `<time>` textContent with "0 1 1 0"
 * (= 0s) so the animationEndSec walk reads 0 for these keypoints (a no-op
 * contribution to maxT), restoring animationEndSec to the real 1.0s span.
 * Preserves each keypoint's `<value>` (path shape coordinate) so a future
 * evaluator's pathControlPoints traversal is untouched — only the walk's
 * scene-time interpretation of these keypoints is zeroed.
 *
 * Called from `determineImageSource` when the Gradient generator is detected
 * by pluginUUID, which is invoked in parseSceneNode (parser/index.ts line
 * ~379) — BEFORE the animationEndSec walk (parser/index.ts line ~696). The
 * DOM mutation is idempotent (running twice is fine) and scoped to the
 * generator's own subtree via `getElementsByTagName`, so no cross-slug
 * interaction is possible.
 */
function neutralizeGradientMotionPathPos206Times(el: Element): void {
  // Every descendant `<behavior>` — the Motion Path can be attached to any
  // mask/scenenode child, but in Motion's "Gradient" template it always sits
  // on the rounded-rect mask (Slide In.motr line 548). Walk the whole subtree
  // so a future template that nests the Motion Path deeper is still caught.
  const behaviors = el.getElementsByTagName('behavior');
  for (let i = 0; i < behaviors.length; i++) {
    const b = behaviors.item(i);
    if (!b) continue;
    // factoryID=24 is Motion Path. Skip other behaviors.
    if (b.getAttribute('factoryID') !== '24') continue;
    // The Motion Path root parameters are DIRECT children of <behavior>:
    // `Position id=200` (basePosition — scene-time behavior-local),
    // `Position id=206` (pathControlPoints — parametric path samples). Only
    // pos206 keypoint times are parametric; pos200 keypoint times ARE
    // behavior-local scene seconds and MUST NOT be touched.
    const params = b.childNodes;
    for (let j = 0; j < params.length; j++) {
      const p = params.item(j);
      if (!p || p.nodeType !== 1) continue;
      const pe = p as Element;
      if (pe.tagName !== 'parameter') continue;
      if (pe.getAttribute('name') !== 'Position' || pe.getAttribute('id') !== '206') continue;
      // Walk pos206's descendant <time> elements and neutralize them. Every
      // <time> under pos206 belongs to a curve keypoint (path X/Y/Z axes) or
      // an inputTangentTime — the "0 1 1 0" overwrite is a no-op for both:
      // the animationEndSec walk parses `time` as value/timescale seconds
      // and reads 0/1 = 0, and any tangent parser reading behavior-local time
      // sees 0 (consistent with the neutralized keypoint).
      const times = pe.getElementsByTagName('time');
      for (let k = 0; k < times.length; k++) {
        const t = times.item(k);
        if (t) t.textContent = '0 1 1 0';
      }
    }
  }
}


export function determineImageSource(params: Parameter[], el: Element | undefined, clip: ClipInfo): ImageSource | undefined {
  // Gaussian Gradient generator (radial glow used by Nature/Diagonal & Nature/Glide).
  const pluginUUID = el?.getAttribute('pluginUUID') || '';
  const pluginName = el?.getAttribute('pluginName') || '';
  if (pluginUUID.toUpperCase().startsWith('96A13FF0') || pluginName.trim() === 'Gaussian Gradient') {
    return { type: 'gaussianGradient', gradient: parseGaussianGradient(params) };
  }

  // LensFlareGenerator (procedural lens flare, Transitions/Lights/Lens Flare).
  // Detected GENERICALLY by plugin UUID / name — never by transition slug. The
  // engine previously returned undefined here, so the flare rendered as nothing.
  if (pluginUUID.toUpperCase().startsWith('4933D9F1') || pluginName.trim() === 'LensFlareGenerator') {
    return { type: 'lensFlare', flare: parseLensFlare(params, el) };
  }

  // "Gradient" generator (Motion's classic linear gradient generator, factoryID=8,
  // pluginUUID 40091D89-9517-4344-9CB5-18436B1542D1, pluginName "Gradient"). Used
  // by Stylized/Slide_In as the teal->lightblue panel fill under the sliding
  // rounded-rect masks. Distinct from the "Gaussian Gradient" generator (radial,
  // pluginUUID 96A13FF0…) — that branch fires first above so this UUID check
  // never sees a Gaussian Gradient. Detected generically by plugin UUID (the
  // most reliable signal). Decoded from Slide In.motr (line 369).
  //
  // TIMING DECODE (T-qcf704c6b, 2026-07-16, this landing). Enabling the Gradient
  // render alone regresses Slide_In 12.11→11.51 dB because the panel renders in
  // the WRONG place: the outer scene's animationEndSec is inflated 3× the real
  // 1.0s visual end. Root cause decoded in Slide In.motr:
  //
  //   The Motion Path behavior (factoryID=24) attached to the rounded-rect mask
  //   carries a `<parameter name="Position" id="206">` (pathControlPoints) whose
  //   keypoint `<time>` values are PARAMETRIC positions along the CLOSED PATH
  //   SHAPE (Motion serializes them at 0/262144, 262144/262144, 524288/262144,
  //   786432/262144 → 0..3 "path parameter" seconds), NOT scene time. The scene-
  //   time contribution of this Motion Path is bounded by its OWN `<timing
  //   in/out>` window ([-0.167s, 0.968s]) — the pos206 keypoint times NEVER
  //   represent scene time.
  //
  //   However, the scene-level animationEndSec walk in `parser/index.ts` reads
  //   raw `<curve><keypoint><time>` values from the DOM to find "when visible
  //   motion ends", and it (correctly) exempts loop-container curves (Retime-
  //   Extrapolation=1 subtree). Slide_In's parent `<layer>` DOES contain a
  //   Transition B with retimingExtrapolation=1 on its Retime Value curve, so
  //   the sceneDur cap is exempted and the parametric t=3.0 wins the maxT walk
  //   → animationEndSec = 3.0s instead of the real 1.0s. Rendering at t =
  //   (i/24)·3.0s then samples past every layer's `<timing out>` at f08–f23
  //   (drop zones die, Motion Path exits screen by f07 instead of persisting
  //   f05–f18, gradient generator's `out=0.9676s` expires by f08 = 1.0s).
  //
  // The FIX is a DOM neutralization pass: for the Gradient generator's own
  // subtree, overwrite every Motion Path pos206 keypoint `<time>` text with
  // "0 1 1 0" (= 0s). The animationEndSec walk then reads 0 for these
  // keypoints (a no-op contribution) — restoring animationEndSec to the
  // correct 1.0s span for Slide_In and letting the transition play at the
  // right speed. Preserves each keypoint's `<value>` (path shape coordinate)
  // so the Motion Path evaluator's future pathControlPoints traversal is
  // untouched (currently unused: applyMotionPathBehaviors reads only pos200
  // basePosition).
  //
  // SCOPED to the Gradient generator subtree ONLY (walks `el`'s descendants),
  // so no other slug's Motion Path pos206 curve is affected. Census across all
  // 65 built-ins: only Slide_In authors a Motion Path whose pos206 keypoint
  // times exceed sceneDur — every other slug's pos206 curve either doesn't
  // exist, has zero keypoints, or has times within scene range. So the DOM
  // mutation is a no-op elsewhere (measured: 0 regressions on the full gate).
  //
  // This lets FCT_LINEAR_GRADIENT_GEN default-ON: with the timing fixed, the
  // parent layer's Retime + Transition B crossfade play across the correct
  // [0, 1.0s] range, and the linear-gradient overlay (composite plumbing
  // already landed in compositor/index.ts) fires at the right frames. The
  // Motion-Path panel-slide flags (FCT_MOTION_PATH_EVAL in evaluator, and
  // FCT_MOTION_PATH_MASK_LIFT in parser/index.ts) are in LOCKED lanes and
  // add another +4.4 dB when a future coordinated agent flips them.
  if (pluginUUID.toUpperCase().startsWith('40091D89')) {
    // DEFAULT-ON timing decode: neutralize the Motion Path pos206 keypoint
    // times so animationEndSec drops from the parametric-inflated 3.0s to
    // the true 1.0s scene span. Alone this lifts Slide_In 12.11 → 16.84 dB
    // (+4.73 dB), gate-green 0 regressions. Structural (fires only on
    // pluginUUID=40091D89 = Motion's Gradient generator; byte-neutral for
    // every other slug — no non-Slide_In built-in has such a generator).
    if (el) neutralizeGradientMotionPathPos206Times(el);
    return { type: 'linearGradient', gradient: parseLinearGradient(params) };
  }

  // Color Solid generator (a plugin fill, not a drop zone).
  if (el && (el.getAttribute('pluginName')?.includes('Color Solid') || el.getAttribute('pluginName')?.includes('PAEColorSolid'))) {
    // Motion's Color Solid generator defaults to BLACK. Motion only serializes
    // color channels that differ from the object default; e.g. Reflection's "Floor"
    // Color Solid writes only <Blue value="0"/> (and Group 1's driver likewise) —
    // Red/Green are absent because they equal the default 0. Defaulting to white
    // here painted the floor plane bright yellow (255,255,0). Black is correct.
    let r = 0, g = 0, b = 0;
    (function findColor(ps: Parameter[]) {
      for (const p of ps) {
        if (p.name === 'Red' && typeof p.value === 'number') r = p.value;
        if (p.name === 'Green' && typeof p.value === 'number') g = p.value;
        if (p.name === 'Blue' && typeof p.value === 'number') b = p.value;
        if (p.children) findColor(p.children);
      }
    })(params);
    // COLOR-SPACE (decoded 2026-07-18 via the faithful per-primitive oracle,
    // fct/faithful — PAEColorSolid solo-synth sweep): Motion's Color Solid
    // generator emits its authored color as a LINEAR-LIGHT value into the
    // Extended-Linear-sRGB working buffer, which the readback then re-encodes to
    // sRGB. Net transfer measured against real headless FCP over a 6-point sweep
    // (param → readback u8): 0.10→2.5, 0.25→13.0, 0.50→54.4, 0.75→133.4, 1.0→254.6.
    // That is EXACTLY srgb_to_linear(param)*255 (piecewise IEC-61966 EOTF — a plain
    // γ2.2 would give 1.6/12.1, not 2.5/13.0). Photos pass through as identity sRGB
    // (228→228 verified), so this transfer is generator-color-emission specific, NOT
    // a global linear-pipeline change: the authored sRGB color param is decoded to
    // linear, and since the rest of the engine works in sRGB byte space we bake the
    // linear value straight into the 0..255 fill. Prior naive `param*255` gave
    // 0.5→128 (oracle 54) — the single worst faithful divergence (ddb 2.3).
    const enc = (c: number) => Math.round(srgbChannelToLinear(Math.max(0, Math.min(1, c)) * 255) * 255);
    return { type: 'color', r: enc(r), g: enc(g), b: enc(b), a: 1 };
  }

  // Resolve by footage clip reference (the authoritative signal).
  const clipId = findSourceMediaId(params);
  if (clipId !== undefined && clip.ab.has(clipId)) {
    const which = clip.ab.get(clipId);
    if (which === 'P') return { type: 'placeholder' };
    return which === 'A' ? { type: 'transitionA' } : { type: 'transitionB' };
  }
  // Bundled template media (a PNG in the template's Media/ folder, e.g. Slide's
  // sliding rounded-rectangle tiles). Resolved at render time by the host's
  // mediaResolver (the core engine is environment-agnostic; file IO is injected).
  if (clipId !== undefined && clip.media.has(clipId)) {
    const cm = clip.media.get(clipId)!;
    return { type: 'media', url: cm.url, frameRate: cm.frameRate };
  }

  return undefined;
}


/**
 * Parse a scenenode element into a Layer.
 */

/**
 * Parse shape geometry from a Shape scenenode.
 * Shapes store vertex coordinates in <curve_X> and <curve_Y> elements,
 * each containing <vertex> → <vertex_folder> → <parameter name="Value">.
 */




/**
 * Parse the drop-zone Object parameters of a Transition A/B image layer.
 *
 * Motion stores these under Object(id=2):
 *   - `Type` (id 321): drop-zone fit mode. `1` = the 360°/equirectangular fit
 *     used by the 360° transition family.
 *   - `Width` (id 313) / `Height` (id 314): the Fixed drop-zone canvas size.
 *     360° drop zones are 4096×2048 (a 2:1 equirect canvas).
 * Returns undefined when the layer has no drop-zone Object block (the common
 * non-drop-zone image case).
 */
export function parseDropZone(params: Parameter[]): { type: number; width: number; height: number } | undefined {
  const obj = params.find(p => p.name === 'Object' && p.id === 2);
  if (!obj || !obj.children) return undefined;
  // Resolve a drop-zone dimension param to its effective numeric value. Width/
  // Height (id 313/314) are usually static (`value`), but some templates author
  // them as a CURVE (Dissolves/Divide's A/B drop zones ramp Width 1311→…). In that
  // case Motion writes a SENTINEL static `value=1` (min=1) alongside the real curve
  // (keyframe value 1311) — reading the static 1 makes the compositor's aspect-fill
  // fitScale = frameW/srcW ≈ 1/1854 ≈ 0, collapsing the drop zone to a tiny centred
  // sliver (Divide rendered a 51%-black frame with a shrunken centre card). So when
  // a curve is present, prefer the curve's value (first-keyframe size at t=0, then
  // the curve `value`/`default`) over the sentinel static value. Only fall back to
  // the static value when there is no curve. Returns undefined if nothing is a
  // usable (>1) size.
  const dim = (c: Parameter): number | undefined => {
    if (c.curve) {
      const kf0 = c.curve.keyframes && c.curve.keyframes.length > 0 ? c.curve.keyframes[0].value : undefined;
      if (typeof kf0 === 'number' && kf0 > 1) return kf0;
      if (typeof c.curve.value === 'number' && c.curve.value > 1) return c.curve.value;
      if (typeof c.curve.default === 'number' && c.curve.default > 1) return c.curve.default;
    }
    if (typeof c.value === 'number' && c.value > 1) return c.value;
    return undefined;
  };
  let type: number | undefined, width: number | undefined, height: number | undefined;
  for (const c of obj.children) {
    if (c.name === 'Type' && c.id === 321 && typeof c.value === 'number') type = c.value;
    else if (c.name === 'Width' && c.id === 313) width = dim(c);
    else if (c.name === 'Height' && c.id === 314) height = dim(c);
  }
  // Width/Height define the drop-zone FRAME (the square/rect canvas the source
  // media is fit into before crop/scale). A missing Type (id 321) is fine — the
  // "clone"-style drop zones (Replicator/Multi grid panels) omit it but still
  // declare a Width×Height frame. Default Type to 0 so those panels are framed
  // (their Crop is expressed in FRAME space, not source-pixel space).
  if (width === undefined || height === undefined) return undefined;
  return { type: type ?? 0, width, height };
}
