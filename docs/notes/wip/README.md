# Video_Wall framing-camera build — SPEC + findings (2026-07-15)

Two build attempts (both net-negative, reverted per Rule 2d). The engine is at HEAD
(16.76 baseline). Full data in `fct/minimized/Replicator-Clones__Video_Wall/manifest.json`
→ `build_attempt_2026_07_15_3key` and `..._3key_v2` and the `decode_2026_07_15_*` keys.

## Confirmed-correct building blocks (validated by measurement)
1. **timemap wrap-cancel for framing scenes** — add `hasFramingCamera(scene)` (any camera
   layer with `camera.framing.length>0`); right after the initial wrapSec scan:
   `if (wrapSec !== undefined && hasFramingCamera(scene)) wrapSec = undefined;`
   The drop-zone wrap (Video_Wall wrapSec=0.367s) wrongly froze the whole 1.97s camera
   dolly + staggered replicator windows at t=0. VERIFIED: unfreezes time.
2. **3-key camera path** in `resolveFramedWallPose` (add `staticCamPos` param):
   - key0 (t≤framerOut, near-A): eye `[staticCamPos.x, staticCamPos.y, contentPlaneZ+nearDist]`,
     target `[staticCamPos.x, staticCamPos.y, contentPlaneZ]`. **VERIFIED: f0 8→18.2 dB.**
     (Do NOT use the static camera's own Z ≈23 as the eye distance — it's a rig depth, far
     too close, and blows the A tile up to a flat colour.)
   - key1 (t=framerOut, far): eye = anchor + fwd*farDist, target = wall anchor.
   - key2 (t=contentOut, near-B): eye `[cb.center.x, cb.center.y, cb.center.z+nearDist]`,
     target cb.center. **VERIFIED: near-B settles on photo B (was black).**
   Ease-lerp eye+target key0→key1 over [0,framerOut], key1→key2 over [framerOut,contentOut].
3. **wall centroid = ALL-instance centroid** (≈1016,1903), NOT the largest-replicator/Pin-1
   origin. MEASURED: all-instance 9.57 > Pin-1-only 9.07 (the scattered 2000–6000
   replicators ARE part of the visible wall).
4. Pass `staticCamPos = [camLayer.worldTransform[12..14]]` from resolveCamera.

## THE REMAINING BLOCKER + the decoded (no-constant) fix
`farDist` from the proxy framePose eye (~5109) is TOO FAR: the mid-wall zooms out so much
that only ~4 of ~13 live tiles land in view (41–66% of the frame is BLACK) while GT shows
~9–12 tiles filling the frame. Far-distance sweep (FCT_FARK × proxyEyeDist): 1.5→9.50,
1.0→9.57, 0.6→9.71, 0.4→9.84, 0.3→9.94, **0.25→9.98 (peak)**, 0.20→9.97 — still < 10.24,
and 0.25 is a fitted constant (banned fit-scaffolding).

**NEXT (principled fix, no constant):** derive `farDist` by fitting the bbox of the
currently-LIVE (op>0) replicator instances to the frame at each time, instead of the proxy
depth. Pass the live-instance half-extent (w,h) into resolveFramedWallPose and set
`farDist = max(halfW/tanH, halfH/tanHalf)` so the compact live-tile cluster fills the frame
— this should both remove the fitted constant AND match GT's mid-wall tile density (the
reason the peak plateaus at 9.98 is the tiles are spread over ±5000 while GT's visible wall
is a compact cluster; framing the live bbox tightly concentrates them). Then re-measure the
full gate; only ship if net-positive (≥10.24) with no fitted constants.
