# Bloom

- **pluginUUID:** `5599C557-CDC0-4112-B2C4-355E9A1A902E`
- **PAE class:** `Bloom`
- **Display names seen:** Bloom (27), Bloom copy (4)
- **Engine status:** ✅ implemented
- **Corpus usage:** 31 instances across 18 files

## Parameters

| Parameter | Type | Default | Observed range | Keyframed | Seen |
|---|---|---|---|---|---|
| Amount | float | `7` | [10 … 32] | 1 | 23 |
| Brightness | float | `70` | [51 … 100] | 1 | 23 |
| Threshold | float | `75` | [0 … 94] | — | 22 |
| Mix | float | `1` | [0.15 … 1] | 2 | 20 |
| Horizontal | float | `100` | [0 … 100] | — | 19 |
| Vertical | float | `100` | [0 … 100] | — | 19 |
| Clip to White | bool (0/1) | `0` | [0 … 1] | — | 19 |
| Crop | float | `0` | [0 … 0] | — | 19 |
| Flip | bool (0/1) | `0` | [0 … 1] | — | 16 |
| Input Points | bool (0/1) | `1` | [0 … 1] | — | 16 |
| 360° Aware | float | `0` | [0 … 0] | — | 15 |
| 数量 | menu/enum (int) | `7` | [32 … 32] | — | 8 |
| 亮度 | menu/enum (int) | `70` | [100 … 100] | — | 8 |
| 阈值 | menu/enum (int) | `75` | [0 … 12] | — | 8 |
| 水平 | float | `100` | [30 … 100] | — | 8 |
| 垂直 | menu/enum (int) | `100` | [80 … 100] | — | 8 |
| 剪辑到白色 | float | `0` | [0 … 0] | — | 8 |
| 裁剪 | float | `0` | [0 … 0] | — | 8 |
| 360° 识别 | float | `0` | [0 … 0] | — | 8 |
| 混合 | menu/enum (int) | `1` | [1 … 1] | — | 8 |
| 翻转 | float | `0` | [0 … 0] | — | 8 |
| 输入点 | menu/enum (int) | `1` | [1 … 1] | — | 8 |

---
_Auto-generated from the Motion corpus (`~/motr-collection`) by `docs/filters-corpus/gen_fct_filter_docs.py`. Ranges/defaults are EMPIRICAL (observed in real templates), not Apple-documented limits. Keyed by FxPlug pluginUUID per `engine/src/compositor/filters/registry.ts`._