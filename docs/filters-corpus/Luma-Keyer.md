# Luma Keyer

- **pluginUUID:** `7E9178C5-7B0F-4B86-884D-FE79F568B6CE`
- **PAE class:** `Luma Keyer`
- **Display names seen:** Luma Keyer (57), Luma Keyer copy (22), lk (1), Luma Keyer  (1)
- **Engine status:** ✅ implemented
- **Corpus usage:** 81 instances across 65 files

## Parameters

| Parameter | Type | Default | Observed range | Keyframed | Seen |
|---|---|---|---|---|---|
| Luma | float | `—` | — | 2 | 81 |
| Chroma | float | `—` | — | — | 81 |
| Graph | float | `—` | — | — | 79 |
| Histogram | float | `—` | — | — | 79 |
| Invert | bool (0/1) | `0` | [0 … 1] | — | 76 |
| OSC | float | `—` | — | — | 66 |
| Keyer::Autokey | float | `—` | — | — | 65 |
| Matte Tools | group (Edge Distance, Levels, Shrink/Expand, Erode, Fill Holes, Soften) | `—` | — | — | 65 |
| Preserve RGB | bool (0/1) | `0` | [0 … 1] | — | 65 |
| Mix | bool (0/1) | `1` | [0 … 1] | 2 | 65 |
| DefaultSoftness | menu/enum (int) | `9` | [9 … 9] | — | 64 |
| Luma Rolloff | bool (0/1) | `0` | [0 … 1] | — | 64 |
| Strength | menu/enum (int) | `1` | [1 … 1] | — | 64 |
| Keyer::ViewChannel | float | `0` | [0 … 0] | — | 64 |
| Spill Level | float | `0.46000000000000002` | [0.46 … 0.46] | — | 64 |
| Chroma Rolloff | float | `0.10000000000000001` | [0.1 … 0.1] | — | 64 |
| Chroma Erode | float | `0` | [0 … 0] | — | 64 |
| Fix Video | menu/enum (int) | `1` | [1 … 1] | — | 64 |
| MinGreen | float | `-3` | [-3 … -3] | — | 64 |
| MaxGreen | float | `-1.75` | [-1.75 … -1.7] | — | 64 |
| GreenChroma | float | `0.089999999999999997` | [0.09 … 0.09] | — | 64 |
| MinBlue | float | `-1.75` | [-1.75 … -1.25] | — | 64 |
| MaxBlue | float | `0.125` | [0.125 … 0.125] | — | 64 |
| BlueChroma | float | `0.089999999999999997` | [0.09 … 0.09] | — | 64 |
| Spill Contrast | float | `—` | — | — | 64 |
| Tint | float | `0.040000000000000001` | [0.04 … 0.04] | — | 64 |
| Saturation | float | `0.75` | [0.75 … 0.75] | — | 64 |
| Light Wrap | group (Amount, Intensity, Opacity, Mode) | `—` | — | — | 64 |
| Luma Erode | float | `0` | [0 … 0] | — | 64 |
| KeyerIsInitialized | menu/enum (int) | `1` | [1 … 1] | — | 64 |
| Flip | float | `0` | [0 … 0] | — | 21 |
| Input Points | menu/enum (int) | `1` | [1 … 1] | — | 21 |

---
_Auto-generated from the Motion corpus (`~/motr-collection`) by `docs/filters-corpus/gen_fct_filter_docs.py`. Ranges/defaults are EMPIRICAL (observed in real templates), not Apple-documented limits. Keyed by FxPlug pluginUUID per `engine/src/compositor/filters/registry.ts`._