# Variable Blur

- **pluginUUID:** `05DB4F81-7C57-4F33-A5B3-763C913ACAA3`
- **PAE class:** `Variable Blur`
- **Display names seen:** Variable Blur (78), Variable Blur copy (1), Variable Blur 2 (1), Variable Blur 3 (1)
- **Engine status:** ❌ not implemented
- **Corpus usage:** 81 instances across 78 files

## Parameters

| Parameter | Type | Default | Observed range | Keyframed | Seen |
|---|---|---|---|---|---|
| Amount | float | `10` | [0 … 100] | 11 | 80 |
| Inner Radius | float | `100` | [0 … 665] | — | 78 |
| Outer Radius | float | `400` | [0 … 1000] | — | 77 |
| Center | point2D (X,Y) | `—` | — | 5 | 76 |
| Crop | bool (0/1) | `1` | [0 … 1] | — | 75 |
| Mix | bool (0/1) | `1` | [0 … 1] | 3 | 75 |
| Flip | float | `0` | [0 … 0] | — | 74 |
| Input Points | menu/enum (int) | `1` | [1 … 1] | — | 74 |
| Publish OSC | float | `0` | [0 … 0] | — | 74 |

---
_Auto-generated from the Motion corpus (`~/motr-collection`) by `docs/filters-corpus/gen_fct_filter_docs.py`. Ranges/defaults are EMPIRICAL (observed in real templates), not Apple-documented limits. Keyed by FxPlug pluginUUID per `engine/src/compositor/filters/registry.ts`._