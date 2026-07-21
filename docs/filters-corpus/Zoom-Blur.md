# Zoom Blur

- **pluginUUID:** `11C0E095-5F4F-46E2-AE28-F56ED7D38D7E`
- **PAE class:** `Zoom Blur`
- **Display names seen:** Zoom Blur (67), Zoom Blur 2 (6), Zoom Blur 3 (2), Zoom Blur 1 (2)
- **Engine status:** ✅ implemented
- **Corpus usage:** 77 instances across 58 files

## Parameters

| Parameter | Type | Default | Observed range | Keyframed | Seen |
|---|---|---|---|---|---|
| Swirl | float | `0` | [-0.03 … 1] | — | 77 |
| Amount | float | `2` | [0 … 50] | 36 | 76 |
| Center | point2D (X,Y) | `—` | — | — | 76 |
| Mix | bool (0/1) | `1` | [0 … 1] | 10 | 76 |
| Look | bool (0/1) | `0` | [0 … 1] | — | 73 |
| Crop | bool (0/1) | `0` | [0 … 1] | — | 73 |
| Flip | float | `0` | [0 … 0] | — | 58 |
| Input Points | bool (0/1) | `1` | [0 … 1] | — | 58 |
| Publish OSC | bool (0/1) | `0` | [0 … 1] | — | 57 |

---
_Auto-generated from the Motion corpus (`~/motr-collection`) by `docs/filters-corpus/gen_fct_filter_docs.py`. Ranges/defaults are EMPIRICAL (observed in real templates), not Apple-documented limits. Keyed by FxPlug pluginUUID per `engine/src/compositor/filters/registry.ts`._