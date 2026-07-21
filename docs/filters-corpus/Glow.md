# Glow

- **pluginUUID:** `73F69C87-7226-4F7A-81F2-F5E378501423`
- **PAE class:** `Glow`
- **Display names seen:** Glow (102), Glow copy (4), CRT Glow (1)
- **Engine status:** ✅ implemented
- **Corpus usage:** 107 instances across 78 files

## Parameters

| Parameter | Type | Default | Observed range | Keyframed | Seen |
|---|---|---|---|---|---|
| Radius | float | `10` | [7 … 100] | 1 | 105 |
| Opacity | float | `1.5` | [0.06 … 3] | 1 | 100 |
| Threshold | bool (0/1) | `0.75` | [0 … 1] | — | 99 |
| Softness | float | `0.20000000000000001` | [0.09 … 1] | — | 94 |
| Mix | bool (0/1) | `1` | [0 … 1] | 3 | 88 |
| Clip to White | bool (0/1) | `0` | [0 … 1] | — | 79 |
| Flip | bool (0/1) | `0` | [0 … 1] | — | 76 |
| Input Points | bool (0/1) | `1` | [0 … 1] | — | 76 |
| 360° Aware | float | `0` | [0 … 0] | — | 72 |

---
_Auto-generated from the Motion corpus (`~/motr-collection`) by `docs/filters-corpus/gen_fct_filter_docs.py`. Ranges/defaults are EMPIRICAL (observed in real templates), not Apple-documented limits. Keyed by FxPlug pluginUUID per `engine/src/compositor/filters/registry.ts`._