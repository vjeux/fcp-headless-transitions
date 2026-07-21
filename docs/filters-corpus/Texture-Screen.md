# Texture Screen

- **pluginUUID:** `FBED5D89-8D51-451E-8331-D02F15DE3FA1`
- **PAE class:** `Texture Screen`
- **Display names seen:** Texture Screen (3)
- **Engine status:** ❌ not implemented
- **Corpus usage:** 3 instances across 3 files

## Parameters

| Parameter | Type | Default | Observed range | Keyframed | Seen |
|---|---|---|---|---|---|
| Map Image | float | `0` | [10145 … 11513] | — | 3 |
| Center | point2D (X,Y) | `—` | — | — | 3 |
| Angle | float | `0` | [0 … 0] | — | 3 |
| Skew | float | `0` | [0 … 0] | — | 3 |
| Stretch | float | `0` | [0 … 0] | — | 3 |
| Scale | float | `0` | [0 … 0] | — | 3 |
| Contrast | menu/enum (int) | `1` | [1 … 20] | — | 3 |
| Threshold | float | `0.5` | [-2 … 0] | — | 3 |
| Noise Contrast | float | `1` | [0.05 … 1] | — | 3 |
| Noisiness | menu/enum (int) | `1` | [6 … 20] | — | 3 |
| Mix | float | `1` | [0.091 … 1] | — | 3 |
| Flip | float | `0` | [0 … 0] | — | 2 |
| Input Points | menu/enum (int) | `1` | [1 … 1] | — | 2 |
| Publish OSC | float | `0` | [0 … 0] | — | 2 |

---
_Auto-generated from the Motion corpus (`~/motr-collection`) by `docs/filters-corpus/gen_fct_filter_docs.py`. Ranges/defaults are EMPIRICAL (observed in real templates), not Apple-documented limits. Keyed by FxPlug pluginUUID per `engine/src/compositor/filters/registry.ts`._