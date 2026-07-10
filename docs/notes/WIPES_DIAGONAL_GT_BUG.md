# GT-INTEGRITY BUG: Wipes__Diagonal is mislabeled (found w3, 2026-07-09)

## The bug
- /tmp/slug_map.json maps BOTH `Wipes__Diagonal` AND `Stylized__Diagonal` to the SAME motr:
  `.../Stylized.localized/Nature.localized/Diagonal.localized/Diagonal.motr`
- The REAL `.../Wipes.localized/Diagonal.localized/Diagonal.motr` EXISTS but is orphaned (never mapped).
- Scope: EXACTLY ONE duplicate mapping among 65 slugs (64 unique paths). Other 64 transitions unaffected.

## Consequence
- GT_ALL_65.mov was RECORDED with this mislabel: the raw .mov frames 3036-3056 (the Wipes__Diagonal window)
  contain the Stylized/Nature transition (sepia-A -> green-Nature-B -> blue-C 3-phase animated), NOT a simple diagonal wipe.
  Verified by extracting raw .mov frames: f00-04 sepia(130,83,54), f08-17 green(up to 188,231,187), f19-21 blue(92,107,137).
- So ~/fct-gui-gt/Wipes__Diagonal/ is Nature content. Our headless render of the (same mislabeled) motr MATCHES it (19.80 = ceiling, byte-identical).
- The 19.80 "ceiling" is SELF-CONSISTENT but measures the WRONG transition. f117303's old "38.46" targeted a DIFFERENT (older) GT that no longer exists.

## Why NOT fixed yet (do not half-fix)
- Correcting slug_map -> Wipes/Diagonal.motr alone would make Wipes__Diagonal render the REAL wipe against the WRONG (Nature) GUI-GT => score CRATERS.
- Proper fix requires BOTH: (1) slug_map -> real Wipes/Diagonal/Diagonal.motr, AND (2) RE-RECORD the Wipes__Diagonal GUI GT from FCP (the GT_ALL_65.mov segment has Nature content; needs a fresh GUI capture of the true Wipes diagonal). (2) is a GUI-automation/re-record task outside the headless pipeline.

## Recommendation
- FLAG to vjeux: decide whether to re-record the Wipes__Diagonal GUI GT (and re-slice), or accept it as a known-mislabeled slot.
- Until then: Wipes__Diagonal 19.80 should be marked "GT MISLABELED - not a real measurement" on the board, NOT counted as at-ceiling.
- Stylized__Diagonal (correctly mapped to the same Nature motr) IS a valid measurement.

## RELATED GT-QUALITY ISSUES (consolidated 2026-07-09) — transitions whose GUI GT is itself defective:
1. Wipes__Diagonal: slug MISLABELED to Stylized/Nature/Diagonal.motr (real Wipes/Diagonal orphaned). GT is Nature content. 19.80 self-consistent but wrong transition.
2. Replicator-Clones__Multi: GUI GT shows GRAY PLACEHOLDER PANELS (unfilled Drop Zones + arrows) in FCP's OWN mid-transition. Headless renders MORE real content -> 12.3dB plateau floor imposed by corrupt GT. Ceiling 18.75 is against a defective reference.
Both are GT-QUALITY items (need re-record/re-map), NOT renderer defects. Our headless matches FCP's own (equally-flawed) headless-GT in both cases.
=> These are the ONLY 2 known GT-quality issues in 65 slugs. Flag to vjeux for the GT-quality backlog.
