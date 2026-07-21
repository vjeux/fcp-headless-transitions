# Stroke

- **pluginUUID:** `0CB21C8A-7983-418D-B7EC-EDBB20AF4732`
- **PAE class:** `Stroke`
- **Display names seen:** Stroke (60), Outline (6), Stroke copy (5), s (1)
- **Engine status:** ❌ not implemented
- **Corpus usage:** 72 instances across 61 files

## Parameters

| Parameter | Type | Default | Observed range | Keyframed | Seen |
|---|---|---|---|---|---|
| Stroke Type | menu/enum (int) | `0` | [0 … 2] | — | 72 |
| Color | color (RGB/RGBA) | `—` | — | — | 72 |
| Gradient | group (RGB, Opacity, Start, End) | `—` | — | — | 72 |
| Width | float | `10` | [1 … 300] | — | 72 |
| Position | menu/enum (int) | `0` | [0 … 2] | — | 72 |
| Offset | float | `0` | [-12 … 40] | 1 | 72 |
| Threshold | bool (0/1) | `0.50009999999999999` | [0 … 1] | — | 72 |
| Fade Inside | bool (0/1) | `0` | [0 … 1] | — | 72 |
| Fade Outside | bool (0/1) | `0` | [0 … 1] | — | 72 |
| Fade Width | bool (0/1) | `1` | [0 … 1] | — | 72 |
| Fade Falloff | float | `0` | [-100 … 100] | — | 72 |
| Hide Source | bool (0/1) | `0` | [0 … 1] | — | 72 |
| Blend Mode | menu/enum (int) | `0` | [0 … 16] | — | 72 |
| Mix | bool (0/1) | `1` | [0 … 1] | 1 | 72 |
| Flip | float | `0` | [0 … 0] | — | 72 |
| Input Points | menu/enum (int) | `1` | [1 … 1] | — | 72 |
| Hidden::ThresholdChanged | bool (0/1) | `0` | [0 … 1] | — | 71 |
| Hidden::PositionThreshUnlink | float | `0` | [0 … 0] | — | 1 |

---
_Auto-generated from the Motion corpus (`~/motr-collection`) by `docs/filters-corpus/gen_fct_filter_docs.py`. Ranges/defaults are EMPIRICAL (observed in real templates), not Apple-documented limits. Keyed by FxPlug pluginUUID per `engine/src/compositor/filters/registry.ts`._