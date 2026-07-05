# motr-engine — Push transition progress

**Status: Push is pixel-accurate — 32.9 dB mean PSNR, motion pixel-exact.**

## Artifacts in this folder (regenerate with `tools/make_videos.py`)
- `push_comparison.mp4` — side-by-side (FCP left, engine right), labeled.
- `push_fcp_groundtruth.mp4` — the real Final Cut Pro render.
- `push_engine.mp4` — the browser `motr-engine` render.
- `push_diff.mp4` — |FCP − engine| amplified 4×, per-frame PSNR.
- `push_contact_sheet.png` — FCP-over-engine grid.
- `push_diff_sheet.png` — FCP / engine / diff×4 grid.

## How this was achieved
The full methodology (ground-truth rendering, sub-pixel "ruler" measurement,
editing the `.motr` to test hypotheses, and lldb reverse-engineering of Motion's
exact curve math) is documented in **`../docs/DEBUGGING.md`**. Tools live in `../tools/`.

Key breakthroughs, in order:
1. Correct time domain — animation ends at the last spatial keyframe (1.6683s for
   Push), not the scene duration (which wraps to black). 8→18 dB.
2. Link behaviors + clone rendering + Y-down coords + disabled-layer skip.
3. Footage-clip-based A/B source resolution (removed English-name hacks).
4. Keyframeless-curve `value` fix (removed the ghost B clone). →26 dB.
5. **The exact curve algorithm** (reverse-engineered via lldb): Catmull-Rom
   centered-difference tangents, zero at endpoints, handle-time = ½·(adjacent
   dt/3), time-bezier reparameterization. →32.9 dB, motion pixel-exact.

## Remaining residual
Sub-pixel edge resampling at the A/B seam + a 1 px white seam artifact FCP itself
emits. Not motion error.
