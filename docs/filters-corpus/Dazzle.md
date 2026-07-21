# Dazzle

- **pluginUUID:** `E92A99A6-A2E5-44A0-B29C-80674F4003D0`
- **PAE class:** `Dazzle`
- **Display names seen:** Dazzle (28)
- **Engine status:** ❌ not implemented
- **Corpus usage:** 28 instances across 18 files

## Parameters

| Parameter | Type | Default | Observed range | Keyframed | Seen |
|---|---|---|---|---|---|
| Amount | float | `30` | [20 … 60] | — | 27 |
| Brightness | float | `100` | [50.3 … 100] | — | 27 |
| Threshold | float | `75` | [24 … 96] | — | 27 |
| Angle | float | `0.0068538919452009435` | [0 … 1.054] | — | 23 |
| Mix | bool (0/1) | `1` | [0 … 1] | 1 | 21 |
| Spike Count | menu/enum (int) | `3` | [3 … 10] | — | 20 |
| Clip to White | bool (0/1) | `0` | [0 … 1] | — | 16 |
| Crop | float | `0` | [0 … 0] | — | 16 |
| Flip | float | `0` | [0 … 0] | — | 9 |
| Input Points | menu/enum (int) | `1` | [1 … 1] | — | 9 |
| 数量 | menu/enum (int) | `30` | [40 … 40] | — | 1 |
| 角度 | float | `0.0068538919452009435` | [0.006854 … 0.006854] | — | 1 |
| 亮度 | menu/enum (int) | `100` | [100 … 100] | — | 1 |
| 阈值 | menu/enum (int) | `75` | [75 … 75] | — | 1 |
| 针点数 | menu/enum (int) | `3` | [3 … 3] | — | 1 |
| 剪辑到白色 | float | `0` | [0 … 0] | — | 1 |
| 裁剪 | float | `0` | [0 … 0] | — | 1 |
| 混合 | float | `—` | — | 1 | 1 |
| 翻转 | float | `0` | [0 … 0] | — | 1 |
| 输入点 | menu/enum (int) | `1` | [1 … 1] | — | 1 |

---
_Auto-generated from the Motion corpus (`~/motr-collection`) by `docs/filters-corpus/gen_fct_filter_docs.py`. Ranges/defaults are EMPIRICAL (observed in real templates), not Apple-documented limits. Keyed by FxPlug pluginUUID per `engine/src/compositor/filters/registry.ts`._