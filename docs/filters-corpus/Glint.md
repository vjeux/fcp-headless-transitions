# Glint

- **pluginUUID:** `D24138A3-1569-4771-8F4F-70F88ABB53B4`
- **PAE class:** `Glint`
- **Display names seen:** Glint (209), Glow: Glint (20), Glint 1 (5), Glint 2 (2), Glint 1 copy (1)
- **Engine status:** ❌ not implemented
- **Corpus usage:** 241 instances across 165 files

## Parameters

| Parameter | Type | Default | Observed range | Keyframed | Seen |
|---|---|---|---|---|---|
| Exposure | float | `2` | [-4.017 … 10] | 1 | 237 |
| Tint | bool (0/1) | `0` | [0 … 1] | — | 237 |
| Tint Color | color (RGB/RGBA) | `—` | — | — | 237 |
| Glint Size | float | `4` | [0 … 25] | — | 237 |
| Streaks | menu/enum (int) | `1` | [1 … 10] | — | 237 |
| Glint Softness | bool (0/1) | `0` | [0 … 1] | — | 237 |
| Glow Amount | float | `3` | [0 … 40] | — | 237 |
| Glint Angle | float | `0` | [-0.5236 … 1.798] | — | 237 |
| Intensity | float | `2.5` | [0 … 3.2] | — | 237 |
| Color Fringing | float | `6` | [0 … 27.9] | — | 237 |
| Crop | bool (0/1) | `0` | [0 … 1] | — | 237 |
| Mix | bool (0/1) | `1` | [0 … 1] | 5 | 237 |
| Flip | float | `0` | [0 … 0] | — | 113 |
| Input Points | menu/enum (int) | `1` | [1 … 1] | — | 113 |
| 曝光 | float | `2` | [-3 … -2.03] | — | 4 |
| 色调 | float | `0` | [0 … 0] | — | 4 |
| 色调颜色 | float | `—` | — | — | 4 |
| 闪光大小 | menu/enum (int) | `4` | [4 … 7] | — | 4 |
| 条痕 | menu/enum (int) | `1` | [1 … 1] | — | 4 |
| 闪光柔和度 | float | `0` | [0.5 … 1] | — | 4 |
| 光晕量 | float | `3` | [5 … 50] | — | 4 |
| 闪光角度 | float | `0` | [0 … 1.571] | — | 4 |
| 强度 | float | `2.5` | [2.5 … 2.5] | — | 4 |
| 颜色边纹 | float | `6` | [0 … 0] | — | 4 |
| 裁剪 | float | `0` | [0 … 0] | — | 4 |
| 混合 | float | `1` | [0.2 … 0.33] | — | 4 |
| 翻转 | float | `0` | [0 … 0] | — | 4 |
| 输入点 | menu/enum (int) | `1` | [1 … 1] | — | 4 |

---
_Auto-generated from the Motion corpus (`~/motr-collection`) by `docs/filters-corpus/gen_fct_filter_docs.py`. Ranges/defaults are EMPIRICAL (observed in real templates), not Apple-documented limits. Keyed by FxPlug pluginUUID per `engine/src/compositor/filters/registry.ts`._