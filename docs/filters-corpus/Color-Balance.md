# Color Balance

- **pluginUUID:** `E9B93275-A56D-4012-BEF6-5DD59A74B344`
- **PAE class:** `Color Balance`
- **Display names seen:** Color Balance (255), Color Balance Master (2), Color Balance - Green (1), Color Balance - Blue (1), Color Balance Wheel (1)
- **Engine status:** ❌ not implemented
- **Corpus usage:** 262 instances across 196 files

## Parameters

| Parameter | Type | Default | Observed range | Keyframed | Seen |
|---|---|---|---|---|---|
| Shadows | color (RGB/RGBA) | `—` | — | 2 | 257 |
| Midtones | color (RGB/RGBA) | `—` | — | 2 | 256 |
| Highlights | color (RGB/RGBA) | `—` | — | 2 | 256 |
| Mix | bool (0/1) | `1` | [0 … 1] | 74 | 255 |
| Boost | float | `0` | [0 … 1.003] | 1 | 251 |
| Clip Color Values | menu/enum (int) | `0` | [0 … 3] | — | 251 |
| IOS Compatability Behavior | float | `0` | [0 … 0] | — | 247 |
| Flip | float | `0` | [0 … 0] | — | 176 |
| Input Points | menu/enum (int) | `1` | [1 … 1] | — | 176 |
| ColorBalance::HDR In Rec. 709 | float | `0` | [0 … 0] | — | 175 |

---
_Auto-generated from the Motion corpus (`~/motr-collection`) by `docs/filters-corpus/gen_fct_filter_docs.py`. Ranges/defaults are EMPIRICAL (observed in real templates), not Apple-documented limits. Keyed by FxPlug pluginUUID per `engine/src/compositor/filters/registry.ts`._