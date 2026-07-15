# Video_Wall 3-key camera build WIP (2026-07-15)

Net-negative reference (reverted per Rule 2d). See
`fct/minimized/Replicator-Clones__Video_Wall/manifest.json` → `build_attempt_2026_07_15_3key`
for what worked / what's left.

Files are `.ts.txt` snapshots of the WIP engine changes:
- `vw_timemap_3key.ts.txt`   — hasFramingCamera() + wrap-cancel for framing scenes
- `vw_framing_3key.ts.txt`   — resolveFramedWallPose rewritten as a 3-key anchor path
                               (near-A static-cam → far proxy-eye @ wall centroid → near-B content pose)
- `vw_index_3key.ts.txt`     — computeWallCenter → all-instance centroid; pass staticCamPos

Gate when applied: Video_Wall 10.24→9.52 (−0.72), 0 improvements, 64 others byte-identical.
Near-B end now settles on photo B correctly; remaining gap is the sparse/oversized mid-wall
(likely: frame ONLY the Pin-1 3×3 main grid, exclude the scattered 2000–6000 decorations) and
the f0 flat-sepia near-A render.
