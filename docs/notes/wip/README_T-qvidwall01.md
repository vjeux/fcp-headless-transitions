# Video_Wall 4-part fix — DECODED + VERIFIED, blocked on tile geometry (2026-07-16, T-qvidwall01)

The 4 brief parts (wrap-cancel + far-pose + dense-wall/cell-fill + 3-key anchor path) are all
implemented and verified in isolation. Net on Video_Wall was only **+0.02 dB (10.16→10.18)**
and behavior-NEUTRAL elsewhere (serial re-measure), so it was reverted per Rule 2d. The four
diffs are saved here; apply them, then finish the ONE remaining blocker (tile-grid geometry).

## Apply
    cd <worktree>
    git apply docs/notes/wip/vw_T-qvidwall01_timemap.diff
    git apply docs/notes/wip/vw_T-qvidwall01_framing.diff
    git apply docs/notes/wip/vw_T-qvidwall01_evaluator.diff
    git apply docs/notes/wip/vw_T-qvidwall01_compositor_cellfill.diff

## What each diff does (all VERIFIED correct in isolation)
- **timemap** — PART 1. Adds `hasFramingCamera` scan; OR'd into the wrapSec cancel gate.
  Video_Wall wrapSec=0.367 << end=1.969 → fires, time advances (was frozen flat 84.1 mean).
  Clone_Spin has a framing cam but wrapSec≈end so the `endSec>wrapSec+frameSec` guard no-ops it.
- **framing** — PARTS 2+4. `resolveFramedWallPose` rewritten as a 3-KEY dolly (added
  `staticCamPos`, `frameWidth` params). key0 near-A = look straight down −Z at content plane
  from staticCamPos.xy at nearDist (COVER fit); key1 far = anchor + proxyFwd·farDist
  (proxyFwd=(0.069,0.422,0.904) → correct oblique); key2 near-B = straight down at content(B)
  tile centre. Ease-lerp key0→key1 over [0,proxyOut=0.9676], key1→key2 over [proxyOut,end].
  farDist = |proxyFramingPoint − anchor| projected on fwd (~4362, no constant). VERIFIED:
  f00 8→18.5 dB, f23 9→13.2 dB. Timing: proxy beh in=0 out=0.9676; content 'Frame B' in=0.8675
  out=1.9686. Motion Transition type=3.
- **evaluator** — passes `staticCamPos` (camera worldTransform xyz) + `frameWidth` into the pose.
- **compositor_cellfill** — PART 3. Uniform `cellFill = pitchX/tileWidth` (pitchX=sizeWidth/(cols-1))
  applied to each replicated instance's scale, gated `cols>1 && fillScale>1`. Fills the mid frame
  with tiles (was ~4 tiny tiles on black at far). Derived from grid geometry, NO fitted constant.

## The ONE remaining blocker (todo T-qd1814800)
Deep-dolly mid frames (f14–f17) score only 8.3–8.9 — the tile GRID at the far pose doesn't match
GT's tight regular 4×4. The pitch/cell-fill model is still wrong: pitch=span/(n-1)=4100 vs
span/cols=2733, and neither matches the touching-tile width (2133) implied by the vertical pitch.
Decode Motion's OZReplicator cell sizing to get the true pitch; verify which of the 13 scattered
edge replicators (±2000..6000) actually land in GT's frame vs are culled decorations.

## Gate caveat
`fct regress engine` is render-NONDETERMINISTIC (~0.5–1 dB) under parallel JOBS. Measure
Video_Wall SERIALLY (FCT_JOBS=1) to trust sub-dB deltas — the parallel gate produced phantom
regressions on slugs my change provably couldn't touch.

## NOTE (post-rebase 2026-07-16): the timemap diff is against an OLDER base
This task's worktree branched before commit 356a78f (harness-clobber guard + 3 restored
fixes). The framing / evaluator / compositor_cellfill diffs still apply against current
origin/main. The **timemap diff does NOT apply cleanly** (origin/main's timemap.ts grew new
cancel-gate logic). PART 1 is trivial to re-derive against the current file: add a
`hasFramingCamera` scan (any camera layer with camera.framing.length>0) right after the
`pureCrossfadeSettleB` block, then OR it into the existing wrapSec cancel gate
(`... || pureCrossfadeSettleB || hasFramingCamera) && endSec > wrapSec + frameSec`). The
old-base timemap diff is kept for reference of the exact edit shape.
