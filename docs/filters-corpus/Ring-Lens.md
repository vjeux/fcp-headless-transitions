# Ring Lens

- **pluginUUID:** `9F1EEA3B-85F9-4D8F-AAE4-E4134D502D2D`
- **PAE class:** `Ring Lens`
- **Display names seen:** Ring Lens (1), Ring Lens 2 (1), Ring Lens 3 (1)
- **Engine status:** ❌ not implemented
- **Corpus usage:** 3 instances across 2 files

## Parameters

| Parameter | Type | Default | Observed range | Keyframed | Seen |
|---|---|---|---|---|---|
| Center | point2D (X,Y) | `—` | — | 2 | 3 |
| Radius | float | `160` | [342.7 … 777] | — | 3 |
| Thickness | float | `0.42999999999999999` | [0.78 … 1] | — | 3 |
| Refraction | float | `1.7` | [-1.5 … 1.97] | — | 3 |
| Crop | float | `0` | [0 … 0] | — | 3 |
| Mix | menu/enum (int) | `1` | [1 … 1] | — | 3 |
| Flip | float | `0` | [0 … 0] | — | 3 |
| Input Points | menu/enum (int) | `1` | [1 … 1] | — | 3 |
| Publish OSC | float | `0` | [0 … 0] | — | 3 |

---
_Auto-generated from the Motion corpus (`~/motr-collection`) by `docs/filters-corpus/gen_fct_filter_docs.py`. Ranges/defaults are EMPIRICAL (observed in real templates), not Apple-documented limits. Keyed by FxPlug pluginUUID per `engine/src/compositor/filters/registry.ts`._