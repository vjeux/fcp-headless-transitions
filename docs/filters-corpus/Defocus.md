# Defocus

- **pluginUUID:** `0F3B36EF-B955-4471-87C6-9EE2A74AFE5E`
- **PAE class:** `Defocus`
- **Display names seen:** Defocus (51), Source (31), Df (1), Defocus copy (1)
- **Engine status:** ❌ not implemented
- **Corpus usage:** 84 instances across 69 files

## Parameters

| Parameter | Type | Default | Observed range | Keyframed | Seen |
|---|---|---|---|---|---|
| Amount | float | `10` | [0 … 80] | 61 | 84 |
| Sides | menu/enum (int) | `3` | [3 … 8] | — | 84 |
| Rotation | float | `0` | [0 … 1.745] | — | 84 |
| Mix | bool (0/1) | `1` | [0 … 1] | 2 | 80 |
| Gain | float | `2` | [0.05 … 4] | — | 77 |
| Shape | bool (0/1) | `0` | [0 … 1] | — | 75 |
| Aspect Ratio | menu/enum (int) | `1` | [1 … 1] | — | 75 |
| Crop | bool (0/1) | `0` | [0 … 1] | — | 75 |
| Flip | float | `0` | [0 … 0] | — | 52 |
| Input Points | menu/enum (int) | `1` | [1 … 1] | — | 52 |

---
_Auto-generated from the Motion corpus (`~/motr-collection`) by `docs/filters-corpus/gen_fct_filter_docs.py`. Ranges/defaults are EMPIRICAL (observed in real templates), not Apple-documented limits. Keyed by FxPlug pluginUUID per `engine/src/compositor/filters/registry.ts`._