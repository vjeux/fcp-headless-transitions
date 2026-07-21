# Tint

- **pluginUUID:** `717D6E01-83F4-4A4B-AF92-42AABA4B176C`
- **PAE class:** `Tint`
- **Display names seen:** Tint (221), Tint copy (71), Tint Master (2), Card Tint (1), Backdrop Tint (1)
- **Engine status:** ✅ implemented
- **Corpus usage:** 296 instances across 85 files

## Parameters

| Parameter | Type | Default | Observed range | Keyframed | Seen |
|---|---|---|---|---|---|
| Color | color (RGB/RGBA) | `—` | — | 1 | 296 |
| Mix | bool (0/1) | `1` | [0 … 1] | — | 186 |
| Intensity | float | `1` | [0.24 … 1] | — | 134 |
| Flip | bool (0/1) | `0` | [0 … 1] | — | 90 |
| Input Points | bool (0/1) | `1` | [0 … 1] | — | 90 |

---
_Auto-generated from the Motion corpus (`~/motr-collection`) by `docs/filters-corpus/gen_fct_filter_docs.py`. Ranges/defaults are EMPIRICAL (observed in real templates), not Apple-documented limits. Keyed by FxPlug pluginUUID per `engine/src/compositor/filters/registry.ts`._