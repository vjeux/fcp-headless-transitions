# Line Art

- **pluginUUID:** `3286E661-A40D-40BE-82AB-1852FFAF91E0`
- **PAE class:** `Line Art`
- **Display names seen:** Line Art (25), LA (2)
- **Engine status:** ❌ not implemented
- **Corpus usage:** 27 instances across 21 files

## Parameters

| Parameter | Type | Default | Observed range | Keyframed | Seen |
|---|---|---|---|---|---|
| Threshold | float | `0.070000000000000007` | [0.02 … 0.2] | — | 27 |
| Smoothness | float | `0.11` | [0 … 0.15] | — | 27 |
| Paper Color | color (RGB/RGBA) | `—` | — | — | 27 |
| Paper Opacity | bool (0/1) | `1` | [0 … 1] | — | 27 |
| Ink Color | color (RGB/RGBA) | `—` | — | — | 27 |
| Mix | bool (0/1) | `1` | [0 … 1] | 3 | 27 |
| Flip | float | `0` | [0 … 0] | — | 26 |
| Input Points | menu/enum (int) | `1` | [1 … 1] | — | 26 |

---
_Auto-generated from the Motion corpus (`~/motr-collection`) by `docs/filters-corpus/gen_fct_filter_docs.py`. Ranges/defaults are EMPIRICAL (observed in real templates), not Apple-documented limits. Keyed by FxPlug pluginUUID per `engine/src/compositor/filters/registry.ts`._