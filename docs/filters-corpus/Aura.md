# Aura

- **pluginUUID:** `2E01612E-7A80-42B5-8767-9F3E58679DDD`
- **PAE class:** `Aura`
- **Display names seen:** Aura (21)
- **Engine status:** ❌ not implemented
- **Corpus usage:** 21 instances across 16 files

## Parameters

| Parameter | Type | Default | Observed range | Keyframed | Seen |
|---|---|---|---|---|---|
| Inner Radius | float | `2` | [0 … 22] | — | 21 |
| Outer Radius | float | `10` | [0 … 22] | — | 21 |
| Brightness | float | `70` | [40 … 100] | — | 21 |
| Flip | bool (0/1) | `0` | [0 … 1] | — | 16 |
| Input Points | bool (0/1) | `1` | [0 … 1] | — | 16 |
| Mix | bool (0/1) | `1` | [0 … 1] | 1 | 14 |
| Clip to White | bool (0/1) | `0` | [0 … 1] | — | 12 |
| Crop | float | `0` | [0 … 0] | — | 12 |
| 360° Aware | float | `0` | [0 … 0] | — | 10 |

---
_Auto-generated from the Motion corpus (`~/motr-collection`) by `docs/filters-corpus/gen_fct_filter_docs.py`. Ranges/defaults are EMPIRICAL (observed in real templates), not Apple-documented limits. Keyed by FxPlug pluginUUID per `engine/src/compositor/filters/registry.ts`._