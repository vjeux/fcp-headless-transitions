# Video_Wall 3-key camera build — SPEC (2026-07-15)

The 3-key build attempt was reverted (net-negative) and its raw code was NOT preserved
(the snapshots were taken after the revert by mistake). The approach is fully specified in
`fct/minimized/Replicator-Clones__Video_Wall/manifest.json` → `build_attempt_2026_07_15_3key`
and `decode_2026_07_15_*`. To reconstruct:

1. **timemap.ts** — add `hasFramingCamera(scene)` (any camera layer with `camera.framing.length>0`)
   and, right after the initial `wrapSec` scan, `if (wrapSec !== undefined && hasFramingCamera(scene)) wrapSec = undefined;`
   (the drop-zone wrap wrongly freezes the framing dolly at t=0).

2. **evaluator/framing.ts `resolveFramedWallPose`** — add a `staticCamPos` param and replace the
   single-anchor `nearDist + (farDist-nearDist)*f` dolly with a 3-KEY eye+target path:
   - key0 (t≤framerOut, near-A): eye at `[staticCamPos.x, staticCamPos.y, contentPlaneZ + nearDist]`,
     target `[staticCamPos.x, staticCamPos.y, contentPlaneZ]` (frames the outgoing A tile).
   - key1 (t=framerOut, far-wall): eye at `anchor + fwd*proxyEyeDist` (proxyEyeDist = proxy framePose
     eye distance from the wall anchor), target = wall anchor.
   - key2 (t=contentOut, near-B): eye `[cb.center.x, cb.center.y, cb.center.z + nearDist]`, target cb.center.
   Ease-lerp eye+target key0→key1 over [0,framerOut], key1→key2 over [framerOut,contentOut].

3. **evaluator/index.ts** — pass `staticCamPos = [camLayer.worldTransform[12..14]]` into
   resolveFramedWallPose.

## Measured result: Video_Wall 10.24 → 9.52 (gate: 1 reg, 0 improvements, 64 byte-identical).
- WORKS: near-B end settles on photo B (GT f23 match, was black); per-tile A/B renders.
- REMAINING: mid-wall too sparse/large. NEXT: frame ONLY the Pin-1 3×3 grid (computeWallCenter
  already picks the largest replicator = Pin-1 at origin; ALSO derive farDist from Pin-1's half-extent
  so the compact grid fills the frame, instead of the proxy-eye depth which over-zooms). Debug f0
  flat-sepia (A-tile content under the framed camera).
