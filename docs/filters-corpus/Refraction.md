# Refraction

- **pluginUUID:** `F6CC79AD-7C35-4AB0-BF10-527994BCD143`
- **PAE class:** `Refraction`
- **Display names seen:** Refraction (18), Refraction copy (1), Distortion (1)
- **Engine status:** ❌ not implemented
- **Corpus usage:** 20 instances across 19 files

## Parameters

| Parameter | Type | Default | Observed range | Keyframed | Seen |
|---|---|---|---|---|---|
| Softness | bool (0/1) | `0.25` | [0 … 1] | — | 20 |
| Refraction | float | `100` | [0 … 200] | 2 | 20 |
| Height Map | float | `0` | [0 … 3331531719] | — | 20 |
| Map Channel | float | `0` | [0 … 0] | — | 19 |
| Mix | menu/enum (int) | `1` | [1 … 1] | 1 | 19 |
| Flip | float | `0` | [0 … 0] | — | 17 |
| Input Points | menu/enum (int) | `1` | [1 … 1] | — | 17 |

---
_Auto-generated from the Motion corpus (`~/motr-collection`) by `docs/filters-corpus/gen_fct_filter_docs.py`. Ranges/defaults are EMPIRICAL (observed in real templates), not Apple-documented limits. Keyed by FxPlug pluginUUID per `engine/src/compositor/filters/registry.ts`._