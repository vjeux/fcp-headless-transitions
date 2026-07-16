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

## SESSION 2026-07-16 (T-qd1814800) — the projection-clip hypothesis was WRONG

Investigated the "giant-plate" theory from the task briefing: that projected
Transition A/B plates whose center lands outside [−540,+540] still rasterize
across the whole frame. **REFUTED** by direct trace.

Instrumented `renderDrawableLayer` framed-image path + `renderReplicatorLayer`
framed-instance path with a `FCT_TRACE_FRAMED=1` env dump of every
projectFramed() result (sx, sy, ps, stamp size). At f11 (t=0.917), the wall
pose is eye=(315.85, 1806.55, 3922.92), target=(16.26,-18.95,0), aov=45.

Standalone "Transition B" at world (1313, 2298, 0) projects to sy=+813 (well
below the frame; y ∈ [1145, 1561] in dest pixels, all off-frame). The blit
`dstBBox` clips to frame bounds — **NO on-frame pixels are written for this
plate.** The projection sign convention is correct: `cam.up=(0,1,0)`, world Y
is Motion Y-DOWN, and blitTransformed treats m[13]=sy as center-relative Y-DOWN.
The bbox-clip loop in blit.ts is doing its job.

**Where the visible "giant blue plate" at f11 actually comes from:** it is
"Replicator Pin 2 copy" (cellSrc=Pin 2 → imageB=blue) whose grid is
`1×2 size=8260×2400` (cols=2, so pitchX=8260) at world (4103, 2401). With the
current CELL-FILL scale = pitchX/tileW = 8260/1854 = **4.46×**, the 1854×1042
tile scales to 8260×4640 in world, projects at ps≈0.24, and rasterizes as a
1966×1105 plate that overlaps most of the frame. **The bug is the cellFill
overshoot for wide-pitch replicators, not the projection.**

## Root cause (post-refutation)

`cellFill = pitchX/tileWidth` matches the main 3×3 wall's ~4100 pitch (fillScale
2.21) which HELPS. But the same formula on the 1×2/8260-pitch decorative
replicators produces 4.46× scales that PAINT NEAR-FULL-FRAME imageB plates.
GT does not show these — Motion evidently doesn't cell-fill those replicators
(or clips their instances to a tighter region).

## Attempts today (all reverted, gate re-green at 10.18)

1. **Cull standalone A/B** — REVERTED per the ROADMAP-verified fact that GT f00
   and f23 ARE full-frame standalone A/B (they aren't culled; near-key opacity
   is 1). Confirmed by reading GT f00 (full-frame sepia A) and f23 (full-frame
   blue B). The cull is gated & disabled in-code with a comment; DO NOT re-enable.
2. **Aspect-preserving cellFill (min of pitchX/tileW, pitchY/tileH)** — regressed
   Video_Wall 10.18 → 9.58 (Pin 1 tiles too small; ROADMAP measurement said GT
   screen pitch 630×350 has aspect 1.68 which is 16:9 tile-native, so my "MIN
   fit" gave the right per-cell shape but too small an overall size).
3. **farDist from wall bbox extent (wallHalfW+tileHalf)/tanH** — 10.18 → 9.89.
   Camera pulled too far; only ~5-6 tiles visible where GT shows a compact 12+.
   The wall bbox spans ±4100 including the "extras" and does not match the
   compact visible-tile cluster in GT.

## The remaining decode

The problem is NOT the framed projection (verified center-relative Y-DOWN, bbox
clipped) — it is the **Motion OZReplicator cell-instance scale + spatial
distribution**. Prior decode already established: GT screen pitch aspect (1.68)
matches native tile aspect (1.78, 16:9), NOT the pitch-derived aspect (3.42).
That means Motion tiles are drawn at NATIVE aspect (with clip against the
grid-cell pitch), not stretched to the pitch. My uniform cellFill=pitchX/tileW
stretches them.

**Concrete next investigation**: decompile OZReplicator::stamp() (or
OZReplicatorCell::compute*Scale) to see how Motion sizes the per-instance
stamp against its grid cell. Look for a `min(pitchX/w, pitchY/h)` cover-fit
(aspect-preserving, tile stays 16:9 but scales to fit the smaller pitch axis).
This would give ~1.15× for Pin 1 (pitchY/tileH=1200/1042) — matches GT's
smaller-than-4100-pitch visible tiles. But confirm with the binary first.

## State on disk

- Timemap wrap-cancel for framing scenes: LANDED, verified. (Time now advances.)
- 3-key dolly path (near-A → far → near-B): LANDED, near-keys score
  f00=18.54, f23=13.23 (correct settling).
- Wall centroid anchor: LANDED, main wall centred on origin.
- CELL-FILL scale = pitchX/tileW: LANDED (helps main wall, hurts decorative
  wide-pitch replicators — mid-frames 8.3-8.9 dB).
- Standalone A/B cull: gated & DISABLED per f00/f23 near-key evidence.

Net vs origin/main: +0.02 dB (10.16 → 10.18) — still Rule-2d neutral, but the
projection-clip hypothesis is now refuted with instrumented evidence. The gap
is now proven to be cellFill overshoot + spatial layout, not the framed camera
mathematics.
