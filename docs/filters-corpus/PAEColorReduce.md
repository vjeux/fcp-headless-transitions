# PAEColorReduce

- **pluginUUID:** `3168D40C-AF34-401F-81DA-CB50EC5DD5D0`
- **PAE class:** `PAEColorReduce`
- **Display names seen:** Color Reduce (3), Reduction (1)
- **Engine status:** ❌ not implemented
- **Corpus usage:** 4 instances across 3 files

## Parameters

| Parameter | Type | Default | Observed range | Keyframed | Seen |
|---|---|---|---|---|---|
| Replace With | color (RGB/RGBA) | `—` | — | — | 14 |
| Match Color 3 | color (RGB/RGBA) | `—` | — | — | 4 |
| Match Color 4 | color (RGB/RGBA) | `—` | — | — | 4 |
| Smoothness | menu/enum (int) | `0.14999999999999999` | [1 … 1] | — | 3 |
| Reduce To | menu/enum (int) | `2` | [0 … 2] | — | 3 |
| Match Color 1 | float | `—` | — | — | 3 |
| Match Color 2 | color (RGB/RGBA) | `—` | — | — | 3 |
| Mix | float | `1` | [0.2257 … 1] | — | 3 |
| Flip | float | `0` | [0 … 0] | — | 3 |
| Input Points | menu/enum (int) | `1` | [1 … 1] | — | 3 |

---
_Auto-generated from the Motion corpus (`~/motr-collection`) by `docs/filters-corpus/gen_fct_filter_docs.py`. Ranges/defaults are EMPIRICAL (observed in real templates), not Apple-documented limits. Keyed by FxPlug pluginUUID per `engine/src/compositor/filters/registry.ts`._