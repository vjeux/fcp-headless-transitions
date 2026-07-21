# Gloom

- **pluginUUID:** `50387134-338C-42A2-8078-7DF9D7DB36EE`
- **PAE class:** `Gloom`
- **Display names seen:** Gloom (8), Gloom copy (3)
- **Engine status:** ❌ not implemented
- **Corpus usage:** 11 instances across 9 files

## Parameters

| Parameter | Type | Default | Observed range | Keyframed | Seen |
|---|---|---|---|---|---|
| Radius | float | `10` | [13 … 100] | — | 11 |
| Amount | float | `1` | [1 … 1.16] | — | 11 |
| Prescale Input | float | `0` | [0 … 0] | — | 10 |
| Mix | float | `1` | [0.7101 … 1] | — | 10 |
| 360° Aware | float | `0` | [0 … 0] | — | 7 |
| Flip | float | `0` | [0 … 0] | — | 7 |
| Input Points | menu/enum (int) | `1` | [1 … 1] | — | 7 |

---
_Auto-generated from the Motion corpus (`~/motr-collection`) by `docs/filters-corpus/gen_fct_filter_docs.py`. Ranges/defaults are EMPIRICAL (observed in real templates), not Apple-documented limits. Keyed by FxPlug pluginUUID per `engine/src/compositor/filters/registry.ts`._