# Levels

- **pluginUUID:** `2B221FA1-08A2-416E-998C-D7559E5509B5`
- **PAE class:** `Levels`
- **Display names seen:** Levels (617), Levels copy (30), Levels 1 (25), Levels 1 copy (22), Levels 2 (4)
- **Engine status:** ✅ implemented
- **Corpus usage:** 702 instances across 382 files

## Parameters

| Parameter | Type | Default | Observed range | Keyframed | Seen |
|---|---|---|---|---|---|
| Histogram | color (RGB/RGBA) | `—` | — | 11 | 642 |
| Mix | bool (0/1) | `1` | [0 … 1] | 31 | 614 |
| Levels::HDR In Rec. 709 | float | `0` | [0 … 0] | — | 501 |
| Flip | float | `0` | [0 … 0] | — | 472 |
| Input Points | menu/enum (int) | `1` | [1 … 1] | — | 472 |
| 直方图 | group (通道, RGB) | `—` | — | — | 59 |
| 混合 | menu/enum (int) | `1` | [1 … 1] | 1 | 59 |
| 翻转 | float | `0` | [0 … 0] | — | 59 |
| 输入点 | menu/enum (int) | `1` | [1 … 1] | — | 59 |

---
_Auto-generated from the Motion corpus (`~/motr-collection`) by `docs/filters-corpus/gen_fct_filter_docs.py`. Ranges/defaults are EMPIRICAL (observed in real templates), not Apple-documented limits. Keyed by FxPlug pluginUUID per `engine/src/compositor/filters/registry.ts`._