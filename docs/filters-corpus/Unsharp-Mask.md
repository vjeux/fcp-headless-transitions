# Unsharp Mask

- **pluginUUID:** `710CFB1F-16B3-48A2-8366-67BE752695CF`
- **PAE class:** `Unsharp Mask`
- **Display names seen:** Unsharp Mask (41), Unsharp Mask copy (24), usm (5), Unsharp Mask 1 (1), um (1)
- **Engine status:** ❌ not implemented
- **Corpus usage:** 72 instances across 54 files

## Parameters

| Parameter | Type | Default | Observed range | Keyframed | Seen |
|---|---|---|---|---|---|
| Radius | float | `7` | [2 … 32] | — | 72 |
| Amount | menu/enum (int) | `1` | [0 … 2] | — | 71 |
| Threshold | float | `0` | [0 … 0.57] | — | 70 |
| Mix | menu/enum (int) | `1` | [1 … 1] | — | 70 |
| Horizontal | float | `100` | [0 … 100] | — | 69 |
| Vertical | menu/enum (int) | `100` | [100 … 100] | — | 69 |
| 360° Aware | bool (0/1) | `0` | [0 … 1] | — | 21 |
| Flip | float | `0` | [0 … 0] | — | 21 |
| Input Points | menu/enum (int) | `1` | [1 … 1] | — | 21 |

---
_Auto-generated from the Motion corpus (`~/motr-collection`) by `docs/filters-corpus/gen_fct_filter_docs.py`. Ranges/defaults are EMPIRICAL (observed in real templates), not Apple-documented limits. Keyed by FxPlug pluginUUID per `engine/src/compositor/filters/registry.ts`._