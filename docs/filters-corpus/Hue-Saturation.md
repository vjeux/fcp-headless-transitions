# Hue/Saturation

- **pluginUUID:** `D23AF030-B0BF-44DF-B622-7C9EA0DF5744`
- **PAE class:** `Hue/Saturation`
- **Display names seen:** Hue/Saturation (1516), Hue/Saturation Source (31), Hue/Saturation copy (28), hs (13), HSV Adjust copy (9)
- **Engine status:** ✅ implemented
- **Corpus usage:** 1620 instances across 827 files

## Parameters

| Parameter | Type | Default | Observed range | Keyframed | Seen |
|---|---|---|---|---|---|
| Saturation | float | `0` | [-1 … 3] | 70 | 1486 |
| Hue | float | `0` | [0 … 6.283] | 5 | 1471 |
| Value | menu/enum (int) | `1` | [0 … 2] | 2 | 1471 |
| Mix | bool (0/1) | `1` | [0 … 1] | 277 | 1442 |
| Flip | bool (0/1) | `0` | [0 … 1] | — | 1308 |
| Input Points | bool (0/1) | `1` | [0 … 1] | — | 1308 |
| 色相 | float | `0` | [0 … 3.927] | — | 100 |
| 饱和度 | float | `0` | [-1 … 0] | 1 | 100 |
| 数值 | float | `1` | [0.6 … 2] | 1 | 100 |
| 混合 | menu/enum (int) | `1` | [1 … 1] | 4 | 100 |
| 翻转 | float | `0` | [0 … 0] | — | 100 |
| 输入点 | menu/enum (int) | `1` | [1 … 1] | — | 100 |

---
_Auto-generated from the Motion corpus (`~/motr-collection`) by `docs/filters-corpus/gen_fct_filter_docs.py`. Ranges/defaults are EMPIRICAL (observed in real templates), not Apple-documented limits. Keyed by FxPlug pluginUUID per `engine/src/compositor/filters/registry.ts`._