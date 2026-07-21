# Highpass

- **pluginUUID:** `44CB7A9A-4E16-4B32-9567-C1EAD1C0693A`
- **PAE class:** `Highpass`
- **Display names seen:** Highpass (4), Edges (1)
- **Engine status:** ❌ not implemented
- **Corpus usage:** 5 instances across 5 files

## Parameters

| Parameter | Type | Default | Observed range | Keyframed | Seen |
|---|---|---|---|---|---|
| Amount | float | `15` | [0 … 30] | — | 7 |
| Radius | float | `10` | [5 … 100] | — | 5 |
| Mix | menu/enum (int) | `1` | [1 … 1] | — | 3 |
| Flip | float | `0` | [0 … 0] | — | 2 |
| Input Points | menu/enum (int) | `1` | [1 … 1] | — | 2 |

---
_Auto-generated from the Motion corpus (`~/motr-collection`) by `docs/filters-corpus/gen_fct_filter_docs.py`. Ranges/defaults are EMPIRICAL (observed in real templates), not Apple-documented limits. Keyed by FxPlug pluginUUID per `engine/src/compositor/filters/registry.ts`._