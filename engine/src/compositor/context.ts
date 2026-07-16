/**
 * Compositor — shared render context types.
 *
 * RenderContext is the per-render state bundle threaded through the compositor's
 * render graph (source images, camera/framing pose, mask-source ids, media resolver +
 * cache, timing, and per-render memos). Split into its own module (ROADMAP item 7)
 * so the mask/render helper modules can share these types without an import cycle
 * through index.ts.
 */
import type { Layer } from '../types.js';
import type { EvaluatedLayer } from '../evaluator/index.js';

/**
 * Render context set per composite() call. Holds the object-ID map so clone
 * layers can resolve the image of the object they mirror.
 */
export interface RenderContext {
  layerById: Map<number, Layer>;
  evalLayerById: Map<number, EvaluatedLayer>;
  imageA: ImageData;
  imageB: ImageData;
  /**
   * Camera framing distance for 3D perspective projection. When the scene has a
   * Camera node, this is (frameHeight/2)/tan(AOV/2) so content at Z=0 renders 1:1
   * and layers with world-Z get perspective foreshortening. Falls back to the
   * legacy default (2000) when no camera is present.
   */
  cameraZ: number;
  /** Camera node's animated world Z position (dolly). Undefined when no camera. */
  cameraPosZ?: number;
  /**
   * Framing camera pose (OZScene::computeFraming), present only when the camera
   * carries Framing behaviors (factory 3, "Framing"). When present the tile wall
   * (replicator instances / clones) is routed through this moving camera: world
   * coords are shifted by −(viewX,viewY) so the framed region is centered, and
   * perspective uses `framingDistance`. Gated so origin-camera transitions are
   * untouched (see renderLayer's replicator branch).
   */
  framed?: { viewX: number; viewY: number; viewZ: number; framingDistance: number; eye: [number, number, number]; target: [number, number, number]; aov: number };
  /**
   * Set of object IDs referenced as an Image Mask `Mask Source` by some layer.
   * A group in this set is a hidden geometry provider (it clips its owning layer
   * via the Image Mask), NOT a sibling-clip "Masks" group, so `isMaskGroup` must
   * NOT lift it to clip the enclosing group.
   */
  imageMaskSourceIds: Set<number>;
  /**
   * Host-injected resolver for bundled-media relativeURLs. Still images (e.g.
   * Slide's tile PNGs) ignore the second arg; VIDEO media (e.g. Objects/Veil's
   * `Media/Veil.mov` overlay + wipe-matte) uses `timeSec` (current scene time)
   * to pick the correct mov frame. The resolver owns its own decode cache.
   */
  mediaResolver?: (url: string, timeSec?: number, absolute?: boolean) => ImageData | null;
  /** Per-frame cache of resolved media (avoids re-decoding a tile per layer/frame). */
  mediaCache: Map<string, ImageData | null>;
  /** Animation end (seconds) so replicator sequencing can normalize global time. */
  animationEndSec: number;
  /** Current scene time (seconds) — threaded to the media resolver for video media. */
  time: number;
  /**
   * Un-wrapped scene time (seconds) used for VIDEO media resolution. The host's
   * drop-zone retime wraps `scene.time` back to 0 for the tail frames (see
   * unwrappedTime); a .mov overlay/matte must keep advancing through those frames,
   * so the media resolver is fed the un-wrapped time instead. Falls back to `time`.
   */
  mediaTime: number;
  /**
   * Filter-curve evaluation time (seconds). A filter's keyframes animate on the
   * effect's OWN timeline in true (un-retimed) scene time — the drop-zone retime-wrap
   * that loops `time` back to 0 (source-media playback) must NOT warp a filter's
   * parameter animation. So filter param curves are evaluated at this un-wrapped time
   * while geometry/content stays on the wrapped `time`. Falls back to `time`.
   * (Same principle already applied to lensFlare/video overlays via mediaTime.)
   */
  filterTime: number;
  /**
   * Object ID of the full-frame bundled texture that the particle-field proxy owns
   * (Stylized/Nature emitter transitions). When set, renderLayer SKIPS that image
   * layer's normal render — the proxy composites the texture over the whole frame on
   * a derived envelope, so rendering it twice (once dim, once via the proxy) would
   * double-count. Undefined when the scene has no particle-field proxy.
   */
  fieldTextureLayerId?: number;
  /**
   * Per-render memo for the size-keyed drop-zone placeholder cell (a flat gray
   * Ozone createDropZoneGridBitmap fill). Kept on the context rather than a module
   * global so concurrent renders don't share mutable state. Lazily populated by
   * dropZonePlaceholderCell.
   */
  dzPlaceholder?: { w: number; h: number; img: ImageData };
  /**
   * True only for a GENUINE wide-equirect (360°/VR panorama) SCENE — where BOTH
   * transition drop zones are authored at the wide (≥3072 px) panorama resolution
   * (see isEquirectScene in capabilities.ts). A ≥3072-wide canvas that composites a
   * plain HD transition (Movements/Smear: a 1920×1080 Transition-A card inside a
   * 4096×2160 project) is NOT equirect — its drop-zone sources must still be
   * fill-conformed so the settled tail fills the frame instead of letterboxing.
   */
  equirectScene?: boolean;
  /**
   * Set of layer ids for STANDALONE Transition A/B drop-zone image scenenodes
   * (Object.Type=1 or 2) that FCP CULLS from the framed-camera render because their
   * A/B content is already provided to the scene through a Replicator wall whose
   * Cell `Object Source` (id=128) references a Type=3 drop-zone well ("Pin N" —
   * FCPX binds the two transition clips into these Type-3 pins per the Motion
   * Template drop-zone convention). Without the cull those standalone off-canvas
   * plates project through the framing camera as giant lone tiles overlapping the
   * wall (engine f11 showed a full-height blue Transition-B plate; GT shows only
   * the tile grid). Populated once per composite() from a structural scene scan
   * (hasReplicatorWallWithDropZoneRefs, no slug names / fitted constants). Gated
   * behind rctx.framed so origin-camera scenes are untouched.
   */
  culledStandaloneAB?: Set<number>;
}
