# Spill Suppression

- **pluginUUID:** `4CE35227-69BA-4F0B-AF5E-299526610307`
- **PAE class:** `Spill Suppression`
- **Display names seen:** ss (4), Spill Suppression (1)
- **Engine status:** ❌ not implemented
- **Corpus usage:** 5 instances across 5 files

## Parameters

| Parameter | Type | Default | Observed range | Keyframed | Seen |
|---|---|---|---|---|---|
| Color | color (RGB/RGBA) | `—` | — | — | 5 |
| Level | float | `0.46000000000000002` | [0.46 … 0.46] | — | 5 |
| Spill Contrast | group (White, Black) | `—` | — | — | 5 |
| Tint | float | `0` | [0 … 0] | — | 5 |
| Saturation | menu/enum (int) | `1` | [1 … 1] | — | 5 |
| Mix | menu/enum (int) | `1` | [1 … 1] | — | 5 |
| Flip | float | `0` | [0 … 0] | — | 3 |
| Input Points | menu/enum (int) | `1` | [1 … 1] | — | 3 |

---
_Auto-generated from the Motion corpus (`~/motr-collection`) by `docs/filters-corpus/gen_fct_filter_docs.py`. Ranges/defaults are EMPIRICAL (observed in real templates), not Apple-documented limits. Keyed by FxPlug pluginUUID per `engine/src/compositor/filters/registry.ts`._