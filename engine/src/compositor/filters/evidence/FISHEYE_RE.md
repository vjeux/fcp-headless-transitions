# PAEFisheye — Phase-1 RE (shader + CPU mapping; Phase-2 warp-exponent decode pending)

UUID C1278154-B061-453F-8BDE-9F70AB2E6066, pluginVersion 1. Params: Radius (id1, def 1),
Amount (id2, def 15), Center (id3), Mix. A RADIAL POWER warp (barrel/pincushion).

## HgcFisheye shader (verbatim, evidence/shaders/HgcFisheye.metal):
  p    = affine(texCoord, hg_Params[2..3])          // working coords
  d    = p - hg_Params[6].xy                         // relative to Center (hg_Params[6])
  q    = dot(d*d, hg_Params[5].xy)                   // hg_Params[5]=(1/sx^2,1/sy^2) aspect+radius norm
  invD = rsqrt(q)                                    // 1/|d|
  f    = pow(invD, -hg_Params[4].x)                  // = |d|^exponent
  factor = invD * f = |d|^(exponent-1)
  sampleP = affine(d*factor + Center, hg_Params[0..1]) then *hg_Params[7]
  out  = sample(source, sampleP)

## CPU mapping (from -[PAEFisheye canThrowRenderOutput:] disasm):
  a = Amount / 30                                    // (fdiv by 30.0)
  hg_Params[4].x (exponent) = a + 1  = Amount/30 + 1   (the `d0 = d0 + 1` after a=Amount/30)
  1/(1-a) also computed — likely a normalization / clamp for a->1.
  Radius (id1): d8*d0 with d0=1/Radius; hg_Params[5] = (1/(scaleX)^2, 1/(scaleY)^2) where
  scale folds Radius + frame aspect. Center default 0.5,0.5 (frame centre).

## Phase-2 status (measured active, exponent not yet pinned)
Oracle-active (Amount 15/30/60 → increasing warp, mean diff 40/45/49 vs Amount=0). Exact radial
r'(r) profile could NOT be pinned by template-matching on the photo source (repeated features →
ambiguous correlation). NEXT: inject a synthetic RADIAL-GRID / concentric-ring source (or read
hg_Params[5] scale constant from the binary) to fit r_src = |r_out|^(Amount/30) · sign, confirm
exponent = Amount/30+1, then implement as an inverse-map resample + verify. This is a genuine
spatial warp (same class as BlackHole) — needs the radial profile, not just the shader structure.

## corpus_filter_hosts.json (this dir)
Fast filter->host index: {PAE<name>: [corpus .mot* paths]} across 1896 files. Use it to locate a
host for any of the 52 corpus PAE filters instantly (avoids the slow recursive grep).
