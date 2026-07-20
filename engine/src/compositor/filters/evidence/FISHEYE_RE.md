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

## Radial-grid probe (2026-07-20) — KEY HARNESS + exponent data (not yet pinned)
BREAKTHROUGH METHOD: ozengine.render_frame(doc, img_a, img_b, ...) takes ARBITRARY source image
paths, so a synthetic RADIAL-RING test image can be fed to BOTH oracle and engine to decode any
spatial warp precisely (no photo-content ambiguity). Reusable for ALL warp filters (BlackHole,
Poke, Target, Sphere, Fisheye). Script pattern: /tmp/fe_exp.py.

Fisheye is a radial POWER expansion: source-ring at Rin appears at output Rout with Rin ∝ Rout^exp
(barrel). Measured exp vs Amount (fit log Rin = exp·log Rout + c):
  Amount 10 -> exp 1.46
  Amount 15 -> exp 2.48
  Amount 30 -> exp 2.84 (60px rings) / 3.65 (30px rings)  <-- UNSTABLE
  Amount 45 -> exp 5.37
The exponent GROWS with Amount but the ring-edge-PAIRING method is biased (near-edge rings compress
and merge, so the Nth output edge != Nth input ring for strong warps). NEXT: fit the INVERSE map
directly — for each output radius sample the source radius via local cross-correlation of the ring
pattern (not edge counting), across Amount, to pin exp(Amount) + the Radius normalization. Then
implement inverse-map resample + verify. The shader gives factor=|d|^(exp-1) with exp from the CPU
(Amount/30-derived); the clean exp(Amount) law is the remaining unknown.

## POWER-LAW REFUTED (2026-07-20) — exact shader normalization needed
Dense radial-ramp fit (source-radius from a monotonic brightness ramp, 850 radii): the map is
NOT a clean power law. Best power fit Rsrc = Rout^(1+p)/N^p has maxresid 23-27px (p=Amount/~26.7,
N≈1700) — good mid-radius, badly off in the tails → a shipped power-law impl scored only 16 dB
(identity Amount=0 was 35 dB, confirming the harness + centre are right; the WARP shape is wrong).
So the shader's `factor = |d|_norm^(exponent-1)` uses a normalization (hg_Params[5] = 1/scale²,
plus the hg_Params[0..3] affine matrices) that does NOT reduce to Rout^const in pixel space —
likely the norm scale mixes x/y aspect differently, or the exponent applies to a rescaled radius.
NEXT: read hg_Params[5] scale + the affine matrices exactly from -[PAEFisheye frameSetup:] /
canThrowRenderOutput disasm (the constants that build hg_Params from Radius+frame dims), OR fit a
2-parameter model r_src = a·r_out + b·r_out^n per-radius that hits <2px everywhere. fisheye.ts
removed (was a 16-dB approximation — fitted-not-faithful); the shader + this analysis are preserved.
