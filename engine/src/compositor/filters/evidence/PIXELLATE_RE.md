# PAEPixellate — Phase-1 RE (shader + host; Phase-2 impl pending)

UUID 5E7CA164-3AAF-4C70-A377-567E5796528A, pluginVersion 0. Params: Center (id1, point),
Scale (id2, default 8), Mix (10001), Flip (10002), Input Points (10003).

## HgcPixellate shader (verbatim, evidence/shaders/HgcPixellate.metal) — a COORD-QUANTIZE warp:
  p    = affine(texCoord, hg_Params[0..1])          // to a working space (identity for axis-aligned)
  cell = floor((p - hg_Params[4].xy) * hg_Params[5].x)   // hg_Params[5].x = grid density (1/cellSize)
  c    = (cell + 0.5) * hg_Params[5].y + hg_Params[4].xy  // hg_Params[5].y = cellSize; sample cell CENTRE
  uv   = affine(c, hg_Params[2..3]) then *hg_Params[6]    // back to texture space
  out  = sample(source, uv)
So Pixellate = snap each output pixel's sample coord to the centre of a Scale-sized grid cell
(nearest-neighbour block). hg_Params[4] = Center offset; hg_Params[5] = (1/cellSize, cellSize).
CPU: reads Scale (id2); computes 1/Scale (fdiv 1.0/d1 in canThrowRenderOutput).

## Phase-2 status (measured, NOT yet shipped)
Oracle-active confirmed (Scale=50 synth: 12 unique values in a 60x60 region = blocky; vs-src
diff 14.7). Block SIZE vs Scale still needs a clean measurement (JPEG within-block noise defeated
the naive run-length detector — use a flat-region or downsample-compare). The coord space is
normalized [0,1] with an aspect factor in the affine; decode cellSize(Scale) precisely (likely
cellSize = Scale/frameDim or Scale px), implement as nearest-cell-centre resample, verify vs
headless. This is a clean coordinate warp (no AA-edge ceiling like Threshold; samples the source).
