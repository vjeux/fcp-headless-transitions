# Radial Blur

- **pluginUUID:** `8F9F88CF-F1DC-4C7E-8946-1A8B53B4F53A`
- **PAE class:** `Radial Blur`
- **Display names seen:** Radial Blur (54), Amount (13), Radial BlurLeft (1), Angle (1)
- **Engine status:** ✅ implemented
- **Corpus usage:** 69 instances across 49 files

## Parameters

| Parameter | Type | Default | Observed range | Keyframed | Seen |
|---|---|---|---|---|---|
| Center | point2D (X,Y) | `—` | — | 1 | 69 |
| Angle | float | `0.52359877559829882` | [0 … 0.5236] | 25 | 69 |
| Crop | bool (0/1) | `1` | [0 … 1] | — | 69 |
| Mix | bool (0/1) | `1` | [0 … 1] | 8 | 69 |
| Flip | float | `0` | [0 … 0] | — | 24 |
| Input Points | menu/enum (int) | `1` | [1 … 1] | — | 24 |
| Publish OSC | bool (0/1) | `0` | [0 … 1] | — | 24 |

---
_Auto-generated from the Motion corpus (`~/motr-collection`) by `docs/filters-corpus/gen_fct_filter_docs.py`. Ranges/defaults are EMPIRICAL (observed in real templates), not Apple-documented limits. Keyed by FxPlug pluginUUID per `engine/src/compositor/filters/registry.ts`._