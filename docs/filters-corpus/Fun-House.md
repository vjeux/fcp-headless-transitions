# Fun House

- **pluginUUID:** `448206B5-384F-4056-88C8-369B8AEEA2B0`
- **PAE class:** `Fun House`
- **Display names seen:** Fun House (27), Fun House copy (2)
- **Engine status:** ❌ not implemented
- **Corpus usage:** 29 instances across 17 files

## Parameters

| Parameter | Type | Default | Observed range | Keyframed | Seen |
|---|---|---|---|---|---|
| Center | point2D (X,Y) | `—` | — | 4 | 29 |
| Width | float | `400` | [232 … 40000] | 10 | 29 |
| Amount | float | `3` | [1.5 … 100] | 18 | 29 |
| Angle | float | `0` | [-0.5411 … 1.571] | 7 | 29 |
| Mix | menu/enum (int) | `1` | [1 … 1] | 12 | 29 |
| Flip | float | `0` | [0 … 0] | — | 25 |
| Input Points | menu/enum (int) | `1` | [1 … 1] | — | 25 |
| Publish OSC | float | `0` | [0 … 0] | — | 25 |

---
_Auto-generated from the Motion corpus (`~/motr-collection`) by `docs/filters-corpus/gen_fct_filter_docs.py`. Ranges/defaults are EMPIRICAL (observed in real templates), not Apple-documented limits. Keyed by FxPlug pluginUUID per `engine/src/compositor/filters/registry.ts`._