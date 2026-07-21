# Fill

- **pluginUUID:** `47D6B897-5749-4A6A-B93B-00FABCF72B25`
- **PAE class:** `Fill`
- **Display names seen:** Fill (1224), Fill 1 (31), Fill copy (27), Fill 2 (27), Fill 3 (12)
- **Engine status:** ✅ implemented
- **Corpus usage:** 1351 instances across 531 files

## Parameters

| Parameter | Type | Default | Observed range | Keyframed | Seen |
|---|---|---|---|---|---|
| Fill With | bool (0/1) | `0` | [0 … 1] | — | 1346 |
| Color | color (RGB/RGBA) | `—` | — | 6 | 1346 |
| Gradient | group (RGB, Opacity, Start, End, Type) | `—` | — | — | 1346 |
| Mix | bool (0/1) | `1` | [0 … 1] | 30 | 1346 |
| Flip | float | `0` | [0 … 0] | — | 1327 |
| Input Points | menu/enum (int) | `1` | [1 … 1] | — | 1327 |
| 填充以 | float | `0` | [0 … 0] | — | 5 |
| 颜色 | group (红色, 绿色, 蓝色) | `—` | — | — | 5 |
| 渐变 | float | `—` | — | — | 5 |
| 混合 | menu/enum (int) | `1` | [1 … 1] | — | 5 |
| 翻转 | float | `0` | [0 … 0] | — | 5 |
| 输入点 | menu/enum (int) | `1` | [1 … 1] | — | 5 |

---
_Auto-generated from the Motion corpus (`~/motr-collection`) by `docs/filters-corpus/gen_fct_filter_docs.py`. Ranges/defaults are EMPIRICAL (observed in real templates), not Apple-documented limits. Keyed by FxPlug pluginUUID per `engine/src/compositor/filters/registry.ts`._