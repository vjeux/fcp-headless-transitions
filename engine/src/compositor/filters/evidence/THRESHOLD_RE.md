# PAEThreshold — Phase-1 RE (shader + partial decode; Phase-2 impl NOT shipped)

UUID 96AFC322-287E-4014-9EFD-763CD9813E17, pluginVersion 1. Params: Threshold (id1, def 0.5),
Smoothness (id2, def 0.15), Dark Color (id3 RGB), Light Color (id4 RGB), Mix.

## HgcThreshold shader (verbatim, evidence/shaders/HgcThreshold.metal)
  luma = dot(unpremult(rgb), [0.3086, 0.6094, 0.082])         // Motion Threshold luminance
  t    = clamp((luma - hg_Params[0].x)*hg_Params[1].x + 0.5, 0, 1)
  out  = mix(DarkColor, LightColor, t) * alpha
CPU: hg_Params[1].x = 1/Smoothness (verified: `1.0/d8` in canThrowRenderOutput).

## Phase-2 BLOCKER (measured, NOT shipped — would be fitted-not-faithful)
An impl of the literal shader (threshold on sRGB-code luma at the authored value) DIVERGES from
headless FCP: worst ddb ~15 dB. Root cause found by measurement:
- The binary split location vs the authored Threshold is NON-TRIVIAL:
    Threshold=0.6 -> actual sRGB-code-luma split = 0.465 (0% misclassification)
    Threshold=0.8 -> split = 0.985
  i.e. authored 0.6 does NOT split at luma 0.6; there's a remap (slope ~2.6 between 0.6 and 0.8).
- The split separates PERFECTLY on both sRGB-code luma (T=0.47) AND linear luma (T=0.19) at
  Threshold=0.6 — so luma is monotonic; the open question is the Threshold->split TRANSFER and
  whether the compare is in linear space. s2l(0.6)=0.318 ≠ 0.19, so it is NOT simply linearized.
- Dark output is (0,0,0) in the oracle vs (2,2,2) expected from DarkColor=0.00784 — the oracle
  appears to floor/round the low color differently (or applies in linear then encodes).
- Even at Smoothness=0 the oracle has a 1px antialiased transition band (a supersampled edge);
  a hard per-pixel step can't reproduce it.
NEXT: decode the exact Threshold->split transfer (dense sweep of Threshold vs split-luma over an
image whose luma spans [0,1]) + confirm the working color space + the AA. Then verify to >=30 dB.
threshold.ts holds the faithful shader translation but is NOT registered until the transfer is
decoded (shipping the literal-shader version would be fitted-not-faithful and wrong by 15 dB).

## Lead (2026-07-20): split ≈ Threshold^1.5
The one in-range data point is Threshold=0.6 → sRGB-luma split=0.465, and 0.6^1.5 = 0.4648 —
an exact match. Hypothesis: the effective split luma = Threshold^1.5 (or the compare is on a
gamma-1.5 luma). CONFIRM with a full [0,1] gradient test source (the corpus host is bimodal so
other thresholds fall outside its luma range and can't be measured). Once confirmed, set
`split = pow(Threshold, 1.5)` in thresholdFilter, re-add threshold.ts + register, verify >=30 dB.
threshold.ts was removed from the tree (dead code) pending verification; the faithful shader
translation is preserved in git history + this doc + evidence/shaders/HgcThreshold.metal.
