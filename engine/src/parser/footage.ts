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
import type { ImageSource, GaussianGradientConfig, LensFlareConfig, Parameter } from '../types.js';
import { directChildren, getTextContent, parseParameter } from './xml.js';

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
  /** Footage clip-id -> which transition drop zone (A = outgoing, B = incoming). */
  ab: Map<number, 'A' | 'B'>;
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
  const map = new Map<number, 'A' | 'B'>();
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
  // carry the transition's primary (outgoing) media. Multi-drop-zone templates
  // such as Replicator/Video Wall reference these plain drop zones as the replicator
  // cell content (the tiled media), alongside the designated Transition A/B clips.
  // Map any still-unclassified generic drop zone to source A so its cell renders.
  for (const c of clips) {
    if (map.has(c.id)) continue;
    if (/drop\s*zone/.test(c.name) || /drop\s*zone/.test(c.path)) {
      map.set(c.id, 'A'); sawA = true;
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
    // Subset of maskedClips whose Image Mask is NON-INVERTED (a positive matte that
    // GROWS to reveal the masked layer's own source). The single-non-inverted-masked
    // reveal (Wipes/Mask, Stylized/Center Reveal) must keep its NAME-based binding
    // (see the SINGLE-MASKED-REVEAL SUPPRESSION below).
    const nonInvertedMaskClips = new Set<number>();
    const seen = new Set<number>();
    for (const node of Array.from(sceneEl.getElementsByTagName('scenenode'))) {
      // Only real drawable image elements carry a Source Media clip reference.
      const params: Parameter[] = [];
      for (const p of directChildren(node, 'parameter')) params.push(parseParameter(p));
      const cid = findSourceMediaId(params);
      if (cid !== undefined && map.has(cid) && !seen.has(cid)) {
        seen.add(cid);
        referenced.push(cid);
        // Record a direct-child <mask name="Image Mask"> on this drop-zone node,
        // and whether that mask is NON-INVERTED (Invert Mask != 1 AND Mask Blend
        // Mode != 1/SUBTRACT). A non-inverted mask is a positive matte that grows
        // to reveal the masked node's OWN source (Wipes/Mask, Center Reveal); an
        // inverted mask CUTS the masked node away to reveal the sibling base
        // (Objects/Arrows, Vertigo). The distinction drives the single-masked-reveal
        // binding suppression below.
        for (const maskEl of directChildren(node, 'mask')) {
          if (maskEl.getAttribute('name') !== 'Image Mask') continue;
          maskedClips.add(cid);
          let inv = false;
          for (const mp of Array.from(maskEl.getElementsByTagName('parameter'))) {
            if (mp.getAttribute('name') === 'Invert Mask' && parseInt(mp.getAttribute('value') || '0', 10) === 1) inv = true;
            if (mp.getAttribute('name') === 'Mask Blend Mode' && mp.getAttribute('id') === '103' && parseInt(mp.getAttribute('value') || '0', 10) === 1) inv = true;
          }
          if (!inv) nonInvertedMaskClips.add(cid);
          break;
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
      } else if (referenced.length === 2
          && ((nonInvertedMaskClips.has(c0) && !maskedClips.has(c1))
           || (nonInvertedMaskClips.has(c1) && !maskedClips.has(c0)))) {
        // SINGLE-MASKED-REVEAL SUPPRESSION (Wipes/Mask, Stylized/Center Reveal).
        // Exactly ONE of the two full-frame Transition drop zones carries a
        // NON-INVERTED Image Mask; the sibling is the UNMASKED base. Here the
        // headless FCP renderer binds each source to its NAME-matched clip: the
        // masked node reveals its OWN incoming source (clip "Transition B" → image
        // B) growing through the sweeping/growing matte over the unmasked outgoing
        // base (clip "Transition A" → image A). But these templates author the
        // masked "Transition B" node BEFORE the base "Transition A" node, so the
        // document-order re-key below would INVERT them (masked→A, base→B),
        // rendering the mask revealing the OUTGOING photo over an incoming base —
        // the reverse of GUI GT. Keeping the name-based binding fixes it.
        //
        // Discriminator (structural, no transition names): the masked clip's mask
        // is NON-INVERTED. This EXCLUDES the inverted-mask single-mask family
        // (Objects/Arrows, Replicator-Clones/Vertigo), where the masked node is
        // "Transition A" (INV mask) CUTTING A away to reveal the sibling B — those
        // are already name-correct (masked node "Transition A" → image A) and this
        // branch must not touch them (a naive unconditional swap here regressed
        // Arrows −16.7 and Vertigo −8.36). It also differs from the BOTH-masked
        // two-sided split above. Leave the name-based A/B binding in `map`.
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
    return { type: 'color', r: Math.round(r * 255), g: Math.round(g * 255), b: Math.round(b * 255), a: 1 };
  }

  // Resolve by footage clip reference (the authoritative signal).
  const clipId = findSourceMediaId(params);
  if (clipId !== undefined && clip.ab.has(clipId)) {
    return clip.ab.get(clipId) === 'A' ? { type: 'transitionA' } : { type: 'transitionB' };
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
