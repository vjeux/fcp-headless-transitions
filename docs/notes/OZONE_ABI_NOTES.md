# Right abstraction level: use FCP's high-level frame API, not manual graph+ROI

## The problem (vjeux's critique, correct)
oz_render_frame() hand-drives the render at the GRAPH-NODE level:
  OZX_prepareForRender -> OZXGetRenderGraph -> HGRenderer::GetDOD -> HAND-COMPUTE ROI -> PGHelium::renderNodeToBitmap
The hand-computed readback ROI (centering a 1920x1080 window on the DOD/aperture) is the
source of ALL the 360/Squares/aperture geometry hacking. It re-implements, badly, what the
engine already does. For 360 the DOD is the moving union of two translating clone layers, so
the ROI chases empty canvas -> all black.

## The right entry points (C-linkage, what FCP export uses)
- _OZXGetFrame(handle, CMTime*, quality, field, f, f, matrix, depth, svctx, HGRenderer*, <stack outs>)
  - grabs OZX_getRenderEngineMutex, prepareForRender (SAME as us),
  - calls GLRenderer::render(OZScene*, OZRenderParams&)
      -> sets up PGContext/virtual screen/clearTexturePool  (context mgmt itself)
      -> getResolution from params
      -> GLRenderer::getFrameNode(OZScene*, params, HGRenderer*, long*)   <-- SAME graph build our
         OZXGetRenderGraph calls; our getHeliumGraphFromMediaRef A/B hook FIRES here identically
      -> composites through camera/output aperture and reads back at SCENE resolution (OZScene+0x98 = w,h)
  - _OZXGetFrameAsBitmap is a thin wrapper over _OZXGetFrame (bitmap out).
- Also: OZXGetFrameAsCGImageWithInput(scene, time, HGRef<HGNode>& input, rect, matrix, quality,...,CGImage**)
  takes an INPUT node directly + returns a finished CGImage.

## Why this fixes 360 for free
GLRenderer::render composites at the scene's own aperture WITH the camera/reorient stage that
produces the forward-facing equirect view. No ROI math, no getSceneBounds, no DOD chasing.
DELETE the GetDOD + ROI block entirely.

## A/B injection preserved
Both OZXGetRenderGraph (current) and GLRenderer::render (new) reach GLRenderer::getFrameNode,
which calls OZImageElement::getHeliumGraphFromMediaRef -> our global hook. So identity-based
A/B injection is unchanged.

## Plan
1. Add extern for _OZXGetFrame (or OZXGetFrameAsBitmap) + PCBitmap accessors already present.
2. Replace the manual OZXGetRenderGraph + GetDOD + ROI + renderNodeToBitmap block with ONE
   high-level call, install the media hook BEFORE it (same as now), read the returned PCBitmap.
3. DELETE: GetDOD block, ROI heuristic, OZ_ROI/OZ_DOD_DEBUG env overrides.
4. Verify: Push/Scale/etc unchanged (they share getFrameNode), 360 endpoints recover AND
   mid-frames get the camera reprojection. Score all 65 vs ~/fct-gui-gt.

## Risk
- Need the exact _OZXGetFrame handle layout (x0 = OZX container: [+0x10]=scene, [+0x18]=progress
  handler ptr, [+0x08]=vtable). Simpler: OZXGetFrameAsCGImageWithInput may be cleaner (takes
  scene + input node directly). Decide during impl.
- Shared oz_render.mm (pool serializes). Get explicit OK before editing.

## UPDATE (prototype result — GLRenderer::render is NOT enough for 360)
Tried: OZ_HLRENDER path calling OZRenderManager::getGLRenderer() + GLRenderer::render(scene,params),
reading the shared_ptr<PCImage> the engine stores at params+0x4f8.
- Builds + runs; our A/B hook fires.
- BUT 360 Push f0 came back 4096x2048, uniform grey [63,63,63] — i.e. GLRenderer::render renders the
  scene at its NATIVE equirect aperture (4096x2048), WITHOUT the front-facing equirect->rectilinear
  camera projection. Then it crashed on f6 (missing the mutex/autoreleasepool/process-control setup that
  _OZXGetFrame wraps around the call).
- GUI GT for 360 Push f0 is 1920x1080 sepia (a FRONT-FACING rectilinear view). So FCP's export applies
  the equirect camera projection at a HIGHER layer than GLRenderer::render — an OZViewer / export-session /
  HMD-style camera that sets the output viewport + PAEEquirectReorient front-facing projection.
- Symbols to investigate for the real projection layer: OZXEquirectProjectFilterSetFrontFacing,
  Li3DGroupForEquirect, OZViewer (shareEquirectRenderWithHMD), OZExportScene*, and how _OZXGetFrame's
  handle (OZX document: [+8]=scene,[+0x10]=GLRenderer,[+0x18]=progress) is constructed for a 360 export.
- REVERTED the prototype. oz_render.mm back to committed 9fddfa1 state.

## NET
- The abstraction critique is right for the NON-360 case (readback ROI hacking), but GLRenderer::render
  alone does not solve 360 — the equirect projection is a distinct viewer/export stage. Fixing 360
  properly = drive the actual OZX export handle (_OZXGetFrame) which wires that stage, OR replicate the
  PAEEquirectReorient front-facing projection in the readback. Both are more than a 5-line swap.
- The 63/65 non-360 slugs render correctly on the committed path.

## ROOT CAUSE NAILED (360 family) — it's an Object3DEnvironment scene
360 Push.motr sceneSettings: width=4096 height=2048, <Object3DEnvironments>100</Object3DEnvironments>.
publishSettings expose Start Longitude / Direction / Speed / Soften Edges.
=> The .motr is a 360 ENVIRONMENT (equirect sphere), NOT a flat 1920x1080 scene. FCP's GUI GT was made
   by dropping this 360 clip into a STANDARD 1080p timeline, where FCP renders the environment sphere
   THROUGH THE HOST PROJECT'S RECTILINEAR PERSPECTIVE CAMERA at 1920x1080 (forward-facing, FOV ~ default).
   Our headless harness renders the .motr's OWN scene = the raw 4096x2048 equirect canvas, with no
   rectilinear output camera => flat equirect (the "flat translate, black center" artifact).

The fix is NOT a readback ROI and NOT GLRenderer::render alone. It requires rendering the 360 scene as an
Object3DEnvironment viewed by a perspective camera at 1920x1080 — i.e. reproduce FCP's "360 clip in a 2D
project" compositing. Options:
  (A) Find/drive the OZ entry that renders a scene THROUGH a host camera/viewport (the export path
      _OZXGetFrame uses when the timeline resolution != scene aperture; likely sets up an OZViewer /
      Li3DGroupForEquirect perspective camera). Wire that.
  (B) Post-process: render the equirect canvas (what we get today) then do equirect->rectilinear
      reprojection at readback (forward camera, FOV, lon/lat sample + horizontal wrap). But mid-transition
      the equirect canvas has a content gap from the flat clone-layer translate, so (B) alone won't fully
      match unless the reorient pan also animates — i.e. (B) depends on the rig-driven pan too.
Recommendation: (A) is the correct-abstraction fix (let FCP's camera do it). It's a real dig, not a quick patch.

## EXACT MECHANISM (360 rectilinear projection) — mapped from disasm
- OZRenderParams::setCamera(PCPtr<LiCamera>) exists. When a 360 Object3DEnvironment scene is rendered
  with a CAMERA set on params, the environment sphere projects THROUGH that perspective camera
  (rectilinear front view = the GUI GT). With no camera, it renders the flat equirect canvas (what we get).
- Render360GroupAsEquirectSentry(OZGroup*, OZRenderParams&) toggles OZRenderParams byte @ +0xef
  ("render 360 group as equirect" flag): reads group's virtual is360 (vtable+0x680), saves old params[+0xef],
  sets new. This sentry FORCES equirect output; the camera path is the inverse (project to rectilinear).
- Li3DGroupForEquirect(PCPtr<LiCamera const>, LiLightSet, int, int) + LiEquirectProject(...) are the
  building blocks: a 3D group that renders the equirect sphere as seen by an LiCamera at (w,h).
- To match GUI: build an LiCamera (forward-facing, default FCP 360-viewer FOV), setCamera on params,
  render at 1920x1080 => the environment projects to the rectilinear front view WITH wraparound (the
  sphere is continuous, so no black center gap). The rig-driven reorient pan then rides the sphere.

## IMPLEMENTATION COST
This is NOT a readback fix. It needs: construct LiCamera (FOV/orientation matching FCP's 360-in-2D
default), OZRenderParams::setCamera before render, and ensure the environment (Object3DEnvironments=100)
projects through it (may need the Li3DGroupForEquirect path or just the camera + existing graph). Then
verify orientation/FOV against GUI GT. Multi-step, disasm-guided. Only affects the 2 pure-360 endpoints +
the 6 other 360 family slugs' mid-frames.

## CHEAP LEVERS RULED OUT (experiments, all reverted)
1. GLRenderer::render(scene,params) directly -> renders raw 4096x2048 equirect grey, no camera projection, crashes f6 (missing _OZXGetFrame's mutex/pool wrap). NO.
2. OZRenderParams::setResolution(1920x1080) before graph build -> output IS 1920x1080 but ALL BLACK
   (front view empty; resolution alone does not invoke the environment->camera projection). NO.
3. OZRenderParams::getResolution() by-value PCVector2<double> return -> ABI-mismatch stack smash
   (crashes in fprintf/flockfile). Avoid by-value struct-return externs for these.
CONCLUSION: the ONLY thing that produces the rectilinear front view is an actual perspective CAMERA
set on the render (OZRenderParams::setCamera, a LOCAL symbol 't') projecting the Object3DEnvironment.
That requires constructing an LiCamera (Li3DGroupForEquirect path) with FCP's default 360-in-2D FOV/orient
and calling the local setCamera by (file-offset + dyld slide). Substantial, disasm-guided build.
oz_render.mm reverted to committed 9fddfa1; 63/65 slugs correct; only pure-360 (Push, Slide) blocked.

## 360 STATE PINNED DOWN (2026-07-07, full-canvas readback OZ_ROI=0,0,4096,2048)
- 360ProjectMode (OZScene+0x90+0x10c) is ALREADY 0 for 360 transition templates — NOT the switch.
- Full 4096x2048 canvas content bbox:
    f0:  x[1088..3007] y[484..1563]  (source A, flat, CENTERED at canvas center 2048,1024)
    f12: x[0..4095]     (A pushed one side, B other, MIDDLE EMPTY = flat translate, no wraparound)
    f23: x[966..2886]   (source B, ~centered)
- CURRENT committed DOD-centered readback CHASES the moving DOD union (f0 DOD w6016 centered at 0;
  f12 centered at 2073; f23 at 3974) => lands on empty canvas => BLACK even at endpoints. This is a
  REGRESSION vs a fixed canvas-center readback (which the prior g2 finding measured at 17-19dB endpoints).

## TWO SEPARABLE 360 FIXES
1. ENDPOINT (real regression fix, defensible): for equirect canvases (DOD width >> frame, e.g. >3072),
   read a FIXED 1920x1080 window centered on the CANVAS CENTER (scene aperture center), NOT the moving
   DOD center. Recovers 360 endpoints black->~17-19dB. Justification: the front-facing view of an equirect
   panorama is at the canvas center; the DOD-union-center is meaningless for a translating-layer canvas.
2. MID-FRAME (hard): equirect->rectilinear projection WITH wraparound (OZImageNodeRender360 ->
   HGEquirectProject, getHelium builds it). Without it, f12 front view is empty (flat translate).
   The rig-driven reorient pan must also animate. This is the real STEP B.

## RECOMMENDATION
Fix #1 is a small, defensible change to the EXISTING DOD block (equirect => fixed canvas-center window,
not moving-DOD-center). It's not per-transition hardcoding — it keys on "DOD much wider than frame".
Fix #2 (projection) is the OZImageNodeRender360/HGEquirectProject build — substantial, do separately.

## SHIPPED (47e9f2c): 360 endpoint fix via aperture-center readback
For wide equirect canvases (OZScene::getSceneBounds aperture width >= 3072), the readback ROI
now anchors on the FIXED aperture center (-sb.x,-sb.y in readback space = 1088,484 for 4096x2048)
instead of the sliding DOD-union center. Recovers black endpoints:
  360 Push f0 7.74->36.92, mean 7.11->10.89 (+3.78); 360 Slide 9.29->13.58 (+4.29).
  6 other 360 slugs + Squares + 8 normal guards ALL unchanged (zero regression).
Mid-frames still low (flat-translate-no-wraparound) = STEP B (equirect front-camera projection),
still open. This was a real REGRESSION fix (h1's DOD-center broke 360 endpoints to black).

## REPLICATOR CELL-FILL (Video_Wall/Clone_Spin, ~13dB) — investigated, NOT a quick fix
Video_Wall GUI shows a grid of tiles each showing the A/B photo; headless shows the same grid
layout+animation but most tiles are Motion's gray "unfilled drop zone" placeholder (arrow icon).
- The cells ARE OZImageElements that reach oz_mediaref_pick: isDropZone()=1, isTransitionSourceA/B=0,
  isBackgroundDropZone=0, dzType=3 (vs top-level transition sources dzType=1/2), inputID=0.
- Injecting g_nodeA into these cells (OZ_CELLFILL prototype) REACHES them (isCell=1, injecting=1) but
  the gray placeholder PERSISTS and score is unchanged. So returning a plain HGRef image node from the
  media-ref hook is NOT sufficient for a replicator cell — the cell resolves/wraps its media differently
  (likely needs the drop-zone transform via getDropZoneTransform/getDropZoneSourceBounds applied, or a
  specific media-ref node format the replicator expects). Deeper than the top-level drop zones.
- Useful accessors (all exported, const NK): isDropZone, isBackgroundDropZone, getDropZoneInputID,
  getDropZoneType(15!), getDropZoneTransform, getDropZoneSourceBounds, getDropZoneTransformForMediaRef.
- Reverted the prototype; oz_render.mm clean at 2b678b6.

## REPLICATOR CELL-FILL — root cause deeper: cells resolve via getInput(), not the media-ref hook
Probed Video_Wall cells: isDropZone=1, isTransitionSourceA/B=0, isDropZoneReplaced=0, and each cell has
a NON-NULL getInput() pointer (0xa4a56...). The top-level B drop zone (isTransB=1) ALSO has
isDropZoneReplaced=0 yet renders correctly via our media-ref injection. So the discriminator is NOT
isDropZoneReplaced. The cells have a getInput() SOURCE element -> the replicator pulls cell content from
that input source's render, NOT from THIS element's getHeliumGraphFromMediaRef return. That's why our
media-ref injection reaches the cell (isCell=1) but the gray placeholder persists: we're patching the
wrong node. The fix requires resolving the cell's getInput() source (the replicator's per-cell media
binding) headless — a separate resolution path, genuinely deep. NOT a media-ref-hook point fix.
oz_render.mm clean at 2b678b6.

## 3D-CARD CLUSTER (Flip/Rotate/Switch/Multi-flip) — transforms RIGHT, timing curves OFF
Visual: Flip/Rotate render the 3D card transform CORRECTLY (Flip f0-f11 = 34-37dB, near-perfect front
half; Rotate visually matches at f4/f8/f16/f20). The gap is per-frame TIMING, not the transform:
- Flip: front half (f0-11) perfect @linear; back half (f12-23) lags — each GUI back frame matches
  headless at linT+~0.083s (best ~29dB). But a UNIFORM offset REGRESSES (front half was already
  perfect): offset 0.0->26.84, 0.04->20.5, 0.083->23.4. So it's an ASYMMETRIC rate (flip curve differs
  only in the 2nd half), needs a PIECEWISE/curve remap, not a global shift.
- Rotate: uniformly ~12-13dB every frame -> small consistent rotation-angle/position offset.

## CONSOLIDATED: the dominant remaining gap is PER-TRANSITION TIMING-CURVE mismatch
Across Diagonal, Glide, Flip, Blurs, and the 3D cards: the MECHANISM renders correctly but the headless
progression RATE through the transition differs from FCP's GUI (best-match-time recovers 28-30dB where
linear gives 11-14). The systematic lever is a per-slug time-remap that matches each transition's headless
sampling to its GUI progression. Point-fixes and uniform offsets don't work (rates are non-linear/
asymmetric). This is the highest-leverage next project. Content-limited exceptions (procedural particles:
Glide/Diagonal mid-frames cap ~13-20 even at best-match-time) and structural (360 equirect, replicator
getInput cells) remain separate.

## TIMING-ALIGNMENT LEVER — PROTOTYPED AND RULED OUT (negative result)
Hypothesis: a per-slug monotonic time-warp (match headless sampling to GUI progression) would lift the
15-25dB band. TESTED on Flip (whose best-time curve IS smooth+monotonic, 0->1):
  linear MEAN 26.84 -> raw-warp 26.54 -> poly3-smoothed-warp 25.77  (NO gain, slightly worse).
Why: Flip's front half (f0-11) is ALREADY near-perfect (34-37dB) at linear timing; the back half's
~29dB "best-match-time" is only marginally above its linear score, and warping to capture it COSTS the
already-perfect front half. Net wash/negative. The per-frame "best time" values don't compose into a
better full sequence (they were found independently against a coarse bank).
Rotate's best-time curve is NON-monotonic/chaotic -> genuine content/geometry bug, not timing.
CONCLUSION: timing-alignment is NOT a systematic lever. Flip(26.84)/most 3D cards are near their
achievable ceiling; the truly-low slugs (Rotate, 360, replicators, procedural particles) have STRUCTURAL
content bugs that need real per-mechanism engineering, not remapping. No cheap systematic win remains.

## STEP B PROTOTYPED (2026-07-09, w6): HGEquirectProject wrapping — node WORKS, framing params open
Implemented the equirect->rectilinear projection via HGEquirectProject (Helium), the exact engine
node whose Metal shader does equirect2uv + wrapXTexCoord (horizontal wraparound). Committed OPT-IN
(OZ_EQUIRECT=1, default OFF) in oz_render.mm; baseline flat readback (360 Slide 13.52, Push 10.91)
UNCHANGED when off (zero regression, gated on sb.w>=3072 && getenv).

MECHANISM (fully mapped from OZImageNodeRender360::getHelium arm64 disasm):
- new HGEquirectProject (0x240 bytes), C1 ctor (sets identity 3x3 orient @+0x198, FOV 45 @+0x1c0).
- Inject dims: this+0x1e0=inW, +0x1e4=inH (equirect canvas 4096x2048), +0x1e8=outW, +0x1ec=outH (1920x1080).
- setParams(this+0x198): reads dims + the +0x1f0 flag (0 => recompute); builds the GetROI/GetDOD
  projection coefficients (@+0x214..+0x230) from DIMS ONLY (FOV @+0x1c0 is UNUSED in this branch).
- HGNode::SetInput(0, graphOutput): wires the equirect canvas as the sphere texture.
- Read back the project node at {0,0,outW,outH}.
- Params dump @f0: orient=IDENTITY 3x3; [+0x24]=[+0x28]=45.0; coeffs map out[-960..960]x[-540..540],
  input center (2048,1024). => static front-facing, horizon-centered, no rotation.

WHY IT SCORES WORSE (10.06 < 13.52 flat) — three OPEN framing params:
1. VERTICAL: projected f0 fills the frame but the sky (upper hemisphere) renders DARK/compressed;
   GT f0 is the flat photo full-frame. The rectilinear view of the 2:1 equirect into 16:9 does not
   equal the flat crop unless FOV/pitch match FCP's viewer exactly.
2. LONGITUDE (Start Longitude): GT f4-f8 show A-on-both-sides / B-in-the-MIDDLE (a ROTATING 360
   camera panning through the sphere; A and B are opposite hemispheres). The static projection gives
   A-left/B-right — horizontally offset from GT by ~90-180 deg. This is the publishSettings
   Start Longitude / Direction / Speed the .motr exposes.
3. FOV: OZ_EQ_FOV has NO effect (the +0x1c0 FOV field is unused by the dims-only coefficient path);
   the effective FOV is fixed by the in/out dim ratio. To widen/narrow the view you must change the
   coefficient computation (e.g. scale the input dims fed to setParams) or set the +0x1f0 flag and
   supply explicit coefficients.
4. YAW override (OZ_EQ_YAW rotates the +0x198 3x3 about Y) had ~no effect on f0 framing => the
   RenderPageMetal vertex transform likely does NOT read the raw +0x198 3x3 at render time; the pan
   must be driven through the coefficient block (+0x214..) or a different orientation field, OR via
   the rig's own reorient (PAEEquirectReorient / HGEquirectReorient SetCol0/1/2 + SetInputPTX/PTY).

GT SLIDE MECHANIC (column analysis, A=sepia/reddish, B=blue):
  f0 all-A; f4 A|B(mid-band)|A; f8 A(half)|B(band)|A(sliver); f12 A(left half)|B(right half);
  f16 B(sliver)|A|B; f20 B|A(band)|B; f23 all-B. => B enters at the sphere-center longitude and the
  view pans, so B grows outward while A wraps to the edges. Classic rotating-360 pan, NOT a flat push.

NEXT (to close STEP B): reproduce FCP's 360-in-2D viewer camera precisely:
  (a) find the pan/orientation input the projection actually consumes at render time — likely
      HGEquirectReorient (SetCol0/1/2 = 3x3, SetInputPTX/PTY, SetWrapTexture(true)) inserted BEFORE
      HGEquirectProject, driven by the .motr's Start Longitude/Direction/Speed keyframes; and
  (b) match FOV/pitch (probably 90 deg horizontal, horizon-centered) by controlling the coefficient
      block rather than the ignored +0x1c0 FOV. Env hooks in place for iteration: OZ_EQUIRECT,
      OZ_EQ_OUT, OZ_EQ_FOV, OZ_EQ_YAW, OZ_EQ_DUMP.

## W1 UPDATE (2026-07-09): 360° Push mid-frame — node CONSTRUCTS headlessly, params are the blocker
- Confirmed baseline: 360° Push MEAN 10.91dB (f0=38.1 endpoint-fixed, mids 7-8dB). The 7.53dB seen
  earlier was a STALE dylib; ./build.sh restores 10.91. So the endpoint aperture-center fix works.
- OZ_NODEDUMP (new gated RTTI dump in oz_render.mm): graph OUTPUT node = **HGColorConform** = flat
  equirect composite, NO projection node. Confirms FCP applies the front-facing projection at the
  host-project camera layer (360 clip in 2D timeline), never invoked by a standalone .motr render.
- Full canvas (OZ_ROI=0,0,4096,2048): source layers are FLAT-CENTERED photos (not sphere-encoded).
  f12: A@x[0..960], B@x[3072..4096], black gap x[960..3072]. GUI f18 shows B on BOTH edges + A center
  = sphere rotation through a perspective cam. Flat wrapped crop maxes ~10dB. Projection REQUIRED.
- **HGEquirectProject (Helium.framework) CONSTRUCTS + RUNS HEADLESS, NO CRASH** (validated via OZ_EQUIRECT
  scaffold, committed 0d1ca6c). Build: HGObject::operator new(0x240) -> HGEquirectProjectC1Ev ->
  HGNode::SetInput(0, output) -> setParams. All symbols in Helium.framework (already linked).
- BLOCKER: HGEquirectProjectParams (~144B) needs the real view/projection matrices + footage bounds.
  Hand-filled (zeros+FOV) -> black/7dB. Param layout from OZImageNodeRender360::getHelium (Ozone
  0x384c9c): FOV @+0x1c0 (default 0x42340000=45°), resolution ints @+0x1e0..0x1ec, 4x4 matrices copied
  to node+0x198.. and @+0x5c/0x6c/0x7c/0x8c; setParams default-fills FOV=1.0 + resolution-derived
  offsets when the front-facing flag byte @+0x1f0 is clear. Also need the readback ROI to switch to
  0,0,1920,1080 for the projected node (currently still anchors equirect aperture center).
- Even with correct params, the FLAT-placed canvas may not carry the sphere-wrap the GUI shows —
  the projection likely must happen AS PART of the composite with the 360° Reorient (PAEEquirectReorient,
  UUID E61FE95E, registered via Filters.bundle) at the camera stage, i.e. OZRenderParams::setCamera
  (0x4f7994, local) with an LiCamera. That's the real STEP B: construct LiCamera + setCamera before
  the graph build so the Object3DEnvironment projects through it.
