# Keyer

- **pluginUUID:** `41122549-B8A6-470E-94DA-211294D20B62`
- **PAE class:** `Keyer`
- **Display names seen:** Keyer (44), Green Screen Keyer (1)
- **Engine status:** ❌ not implemented
- **Corpus usage:** 45 instances across 22 files

## Parameters

| Parameter | Type | Default | Observed range | Keyframed | Seen |
|---|---|---|---|---|---|
| OSC | float | `—` | — | 4 | 45 |
| Keyer::Autokey | float | `—` | — | — | 45 |
| Color Selection | group (Graph, Chroma, Luma, Histogram, Chroma Rolloff, Luma Rolloff) | `—` | — | 4 | 45 |
| Spill Suppression | group (Tint, Saturation, Spill Contrast) | `—` | — | — | 45 |
| KeyerIsInitialized | bool (0/1) | `0` | [0 … 1] | — | 45 |
| Edge Distance | menu/enum (int) | `3` | [0 … 3] | — | 42 |
| DefaultSoftness | menu/enum (int) | `9` | [9 … 9] | — | 41 |
| Strength | bool (0/1) | `1` | [0 … 1] | — | 41 |
| Keyer::ViewChannel | bool (0/1) | `0` | [0 … 1] | — | 41 |
| Fill Holes | menu/enum (int) | `0` | [0 … 10] | — | 41 |
| Spill Level | float | `0.46000000000000002` | [0 … 0.73] | — | 41 |
| Invert | bool (0/1) | `0` | [0 … 1] | — | 41 |
| Matte Tools | group (Levels, Shrink/Expand, Soften, Erode) | `—` | — | — | 41 |
| MinGreen | float | `-3` | [-3 … -3] | — | 41 |
| MaxGreen | float | `-1.75` | [-1.75 … -1.7] | — | 41 |
| GreenChroma | float | `0.089999999999999997` | [0.09 … 0.09] | — | 41 |
| MinBlue | float | `-1.75` | [-1.75 … -1.25] | — | 41 |
| MaxBlue | float | `0.125` | [0.125 … 0.125] | — | 41 |
| BlueChroma | float | `0.089999999999999997` | [0.09 … 0.09] | — | 41 |
| Light Wrap | group (Amount, Intensity, Opacity, Mode) | `—` | — | — | 41 |
| Luma Erode | float | `0` | [0 … 0] | — | 41 |
| Preserve RGB | float | `0` | [0 … 0] | — | 41 |
| Mix | menu/enum (int) | `1` | [1 … 1] | — | 41 |
| Flip | float | `0` | [0 … 0] | — | 29 |
| Input Points | menu/enum (int) | `1` | [1 … 1] | — | 29 |

---
_Auto-generated from the Motion corpus (`~/motr-collection`) by `docs/filters-corpus/gen_fct_filter_docs.py`. Ranges/defaults are EMPIRICAL (observed in real templates), not Apple-documented limits. Keyed by FxPlug pluginUUID per `engine/src/compositor/filters/registry.ts`._