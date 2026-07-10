# GENERIC ENGINE POLICY (2026-07-05) — no per-transition hardcoding
# The goal is a GENERIC engine that renders ARBITRARY .motr files from PRIMITIVES.
# It must NEVER special-case a named/single transition.

## THE RULE
An engine code path that fires on exactly ONE of the 65 transitions is HARDCODING, not
engineering — even if its trigger is phrased as a "structural signature". If a detector
selects a single transition and its renderer replays that transition's decoded ground-truth
(a fixed storyboard of colors/timings/overlays), it is reproducing GT, not rendering the graph.

## WHAT IS ALLOWED (primitives — the building blocks)
- Node/behavior/filter/generator/replicator/mask/blend-mode implementations driven by the
  .motr's OWN parameters (read by ID, evaluated generically). Examples that are FINE:
  renderGradient, renderGaussianGradient, renderPerspectiveQuad, renderPageFlip, detectMask,
  channel mixer, directional/gaussian/radial blur, sRGB EOTF on generators, screen/add blend,
  particle-emitter with fill-color swatch, drop-zone frame conform, retime/wrap evaluation.
- A "family" primitive that fires on a STRUCTURAL CLASS of scenes (e.g. detect360Band fires on
  all 7 equirect 4096x2048 Type-1 + Align-To scenes) is acceptable IF its renderer is driven by
  the scene's parameters — but should be migrated toward pure primitives over time.

## WHAT IS BANNED
- A detect*/render* pair that fires on exactly 1 transition (e.g. the removed detectLightSweep).
- Any path whose renderer outputs values TRACED from that transition's GT rather than computed
  from the .motr graph (hardcoded navy color, fixed onset time, "return A centered", etc.).
- English-name / file-path matching in the parser or dispatch.
- Hardcoded pixel offsets/rectangles/colors observed from GT.

## ENFORCEMENT
- test/no-hardcode.test.ts: parses all 65 .motr, runs every registered scene detector, FAILS if
  any detector fires on < 2 transitions. (A detector that matches exactly one transition is a hardcode.)
- Agent spawn template + playbook: agents must build PRIMITIVES. "Detector fires on exactly 1/65"
  is a RED FLAG, not a safety proof (this was the mistaken framing that let Light Sweep through).
- Coordinator merge protocol: before merging, run the detector-cardinality check; reject any new
  detect* that fires on a single transition. A high single-transition PSNR gain from a bespoke
  path is REJECTED even though it "passes guards" — honest low PSNR from the generic path is preferred.

## MIGRATION BACKLOG (existing paths to make more generic)
- detectDropInCard/blitDropInCard (index.ts): keys on scene<output + A/B drop zones + Y-bounce.
  Fires on ~1-2; the card-conform + Y-bounce should be generic layer-render features, not a bespoke blit.
- detect360Band/render360Band: fires on 7 (a real family) but render path bakes family logic; migrate
  toward equirect-reprojection + generic push primitives driven by params.
- Verify detectPageFlip, detectFieldTexture cardinality and param-drive them.
