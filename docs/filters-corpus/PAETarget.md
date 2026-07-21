# PAETarget

- **pluginUUID:** `220963F2-8E3F-4642-A080-C064CA0B487E`
- **PAE class:** `PAETarget`
- **Display names seen:** Target (4), ImageOSC-8 (1), ImageOSC-7 (1), ImageOSC-6 (1), ImageOSC-5 (1)
- **Engine status:** ❌ not implemented
- **Corpus usage:** 16 instances across 6 files

## Parameters

| Parameter | Type | Default | Observed range | Keyframed | Seen |
|---|---|---|---|---|---|
| Center | point2D (X,Y) | `—` | — | — | 16 |
| Mix | bool (0/1) | `1` | [0 … 1] | — | 16 |
| Angle | float | `0.39269908169872414` | [0 … 6.252] | — | 15 |
| Publish OSC | menu/enum (int) | `0` | [1 … 1] | — | 15 |
| Crop | bool (0/1) | `1` | [0 … 1] | — | 12 |
| Flip | float | `0` | [0 … 0] | — | 4 |
| Input Points | menu/enum (int) | `1` | [1 … 1] | — | 4 |

---
_Auto-generated from the Motion corpus (`~/motr-collection`) by `docs/filters-corpus/gen_fct_filter_docs.py`. Ranges/defaults are EMPIRICAL (observed in real templates), not Apple-documented limits. Keyed by FxPlug pluginUUID per `engine/src/compositor/filters/registry.ts`._