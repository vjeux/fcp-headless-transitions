# MinMax

- **pluginUUID:** `D2342006-51C4-4439-8E89-E970F135E21C`
- **PAE class:** `MinMax`
- **Display names seen:** MinMax (272), MinMax 2 (2), MinMax 1 (1), MinMax copy (1)
- **Engine status:** ✅ implemented
- **Corpus usage:** 276 instances across 117 files

## Parameters

| Parameter | Type | Default | Observed range | Keyframed | Seen |
|---|---|---|---|---|---|
| Radius | float | `0` | [0 … 100] | 2 | 276 |
| Mode | bool (0/1) | `0` | [0 … 1] | — | 274 |
| Mix | float | `1` | [0.9343 … 1] | — | 272 |
| Flip | float | `0` | [0 … 0] | — | 243 |
| Input Points | menu/enum (int) | `1` | [1 … 1] | — | 243 |

---
_Auto-generated from the Motion corpus (`~/motr-collection`) by `docs/filters-corpus/gen_fct_filter_docs.py`. Ranges/defaults are EMPIRICAL (observed in real templates), not Apple-documented limits. Keyed by FxPlug pluginUUID per `engine/src/compositor/filters/registry.ts`._