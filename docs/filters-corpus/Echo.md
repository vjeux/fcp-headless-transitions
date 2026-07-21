# Echo

- **pluginUUID:** `EA4CD041-900C-4D48-90A6-E64CA1EB60CA`
- **PAE class:** `Echo`
- **Display names seen:** Echo (5)
- **Engine status:** ❌ not implemented
- **Corpus usage:** 5 instances across 4 files

## Parameters

| Parameter | Type | Default | Observed range | Keyframed | Seen |
|---|---|---|---|---|---|
| Amount | float | `0.80000000000000004` | [0 … 0.8] | — | 6 |
| Delay | float | `0.10000000000000001` | [0.1 … 0.21] | — | 4 |
| Number | menu/enum (int) | `4` | [2 … 4] | — | 4 |
| Decay | float | `0.80000000000000004` | [0 … 0.8] | — | 4 |
| Mix | menu/enum (int) | `1` | [1 … 1] | 1 | 4 |
| Flip | float | `0` | [0 … 0] | — | 2 |
| Input Points | menu/enum (int) | `1` | [1 … 1] | — | 2 |

---
_Auto-generated from the Motion corpus (`~/motr-collection`) by `docs/filters-corpus/gen_fct_filter_docs.py`. Ranges/defaults are EMPIRICAL (observed in real templates), not Apple-documented limits. Keyed by FxPlug pluginUUID per `engine/src/compositor/filters/registry.ts`._