# Soft Focus

- **pluginUUID:** `BE1A5748-322A-4D25-8107-F3961E0BC21A`
- **PAE class:** `Soft Focus`
- **Display names seen:** Soft Focus (104), Soft Focus copy (5), Soft_Focus (2)
- **Engine status:** ❌ not implemented
- **Corpus usage:** 111 instances across 73 files

## Parameters

| Parameter | Type | Default | Observed range | Keyframed | Seen |
|---|---|---|---|---|---|
| Amount | float | `2` | [2 … 330] | — | 111 |
| Strength | bool (0/1) | `0.5` | [0 … 1] | — | 111 |
| Mix | float | `1` | [0.05 … 1] | 4 | 111 |
| Horizontal | menu/enum (int) | `100` | [100 … 100] | — | 105 |
| Vertical | float | `100` | [0 … 100] | — | 105 |
| Crop | bool (0/1) | `0` | [0 … 1] | — | 105 |
| 360° Aware | float | `0` | [0 … 0] | — | 105 |
| Flip | float | `0` | [0 … 0] | — | 105 |
| Input Points | menu/enum (int) | `1` | [1 … 1] | — | 105 |

---
_Auto-generated from the Motion corpus (`~/motr-collection`) by `docs/filters-corpus/gen_fct_filter_docs.py`. Ranges/defaults are EMPIRICAL (observed in real templates), not Apple-documented limits. Keyed by FxPlug pluginUUID per `engine/src/compositor/filters/registry.ts`._