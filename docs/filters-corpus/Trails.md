# Trails

- **pluginUUID:** `2DB30B44-28E5-4A3C-BCBA-6B8D3966F4C6`
- **PAE class:** `Trails`
- **Display names seen:** Trails (31), Trails copy (1), Trails 2 (1), Trails 1 (1)
- **Engine status:** ❌ not implemented
- **Corpus usage:** 34 instances across 25 files

## Parameters

| Parameter | Type | Default | Observed range | Keyframed | Seen |
|---|---|---|---|---|---|
| Duration | float | `0.10000000000000001` | [0.01 … 0.9] | 3 | 34 |
| Echoes | menu/enum (int) | `4` | [2 … 12] | 3 | 34 |
| Decay | menu/enum (int) | `1` | [1 … 1] | — | 34 |
| Trail On | bool (0/1) | `0` | [0 … 1] | — | 34 |
| Mix | float | `1` | [0.209 … 1] | 14 | 34 |
| Flip | float | `0` | [0 … 0] | — | 30 |
| Input Points | menu/enum (int) | `1` | [1 … 1] | — | 30 |

---
_Auto-generated from the Motion corpus (`~/motr-collection`) by `docs/filters-corpus/gen_fct_filter_docs.py`. Ranges/defaults are EMPIRICAL (observed in real templates), not Apple-documented limits. Keyed by FxPlug pluginUUID per `engine/src/compositor/filters/registry.ts`._