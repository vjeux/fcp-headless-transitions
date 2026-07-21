# Bad Film

- **pluginUUID:** `9B5C17D9-1AC3-4B04-B8F3-59C1420963BF`
- **PAE class:** `Bad Film`
- **Display names seen:** Bad Film (451), Bad Film copy (11), Bad Film 2 (11), Bad Film 1 (11), Bad Film 7 (2)
- **Engine status:** ❌ not implemented
- **Corpus usage:** 500 instances across 231 files

## Parameters

| Parameter | Type | Default | Observed range | Keyframed | Seen |
|---|---|---|---|---|---|
| Focus Amount | float | `0` | [0 … 64] | 1 | 348 |
| Focus Variance | float | `1` | [0 … 100] | 1 | 348 |
| Brightness Variance | float | `0.34000000000000002` | [0 … 2.5] | — | 348 |
| Saturate Variance | float | `5` | [0 … 100] | — | 348 |
| Scratches | menu/enum (int) | `1` | [0 … 20] | — | 348 |
| Hairs | menu/enum (int) | `1` | [0 … 10] | — | 348 |
| Jitter Variance | float | `0.050000000000000003` | [0 … 0.5] | — | 348 |
| Frequency of Change | float | `3` | [0 … 100] | — | 348 |
| Brightness Amount | float | `1` | [0.5 … 5] | — | 347 |
| Saturate Amount | float | `-50` | [-100 … 58] | — | 347 |
| Scratch Color | color (RGB/RGBA) | `—` | — | — | 347 |
| Dust | float | `4` | [0 … 100] | — | 347 |
| Random Seed | float | `25` | [0 … 915] | — | 347 |
| Mix | bool (0/1) | `1` | [0 … 1] | 45 | 347 |
| Jitter Amount | bool (0/1) | `0` | [0 … 1] | — | 346 |
| Grain | bool (0/1) | `0` | [0 … 1] | 126 | 346 |
| Flip | float | `0` | [0 … 0] | — | 300 |
| Input Points | menu/enum (int) | `1` | [1 … 1] | — | 300 |
| 焦点数量 | float | `0` | [0 … 0] | — | 150 |
| 焦点变化量 | float | `1` | [0 … 0] | — | 150 |
| 亮度值 | menu/enum (int) | `1` | [1 … 1] | — | 150 |
| 亮度变化量 | float | `0.34000000000000002` | [0 … 0] | — | 150 |
| 饱和量 | float | `-50` | [0 … 0] | — | 150 |
| 饱和变化量 | float | `5` | [0 … 0] | — | 150 |
| 刮擦 | float | `1` | [0 … 0] | — | 150 |
| 刮痕颜色 | group (红色, 绿色, 蓝色, 不透明度) | `—` | — | — | 150 |
| 毛发纤维 | menu/enum (int) | `1` | [0 … 10] | — | 150 |
| 灰尘 | float | `4` | [0 … 100] | — | 150 |
| 抖动量 | float | `0` | [0 … 0] | — | 150 |
| 抖动变化量 | float | `0.050000000000000003` | [0 … 0] | — | 150 |
| 颗粒 | float | `0` | [0 … 0] | 50 | 150 |
| 变化频率 | menu/enum (int) | `3` | [1 … 2] | — | 150 |
| 随机种子 | float | `25` | [0 … 1000] | — | 150 |
| 混合 | menu/enum (int) | `1` | [1 … 1] | — | 150 |
| 翻转 | float | `0` | [0 … 0] | — | 150 |
| 输入点 | menu/enum (int) | `1` | [1 … 1] | — | 150 |

---
_Auto-generated from the Motion corpus (`~/motr-collection`) by `docs/filters-corpus/gen_fct_filter_docs.py`. Ranges/defaults are EMPIRICAL (observed in real templates), not Apple-documented limits. Keyed by FxPlug pluginUUID per `engine/src/compositor/filters/registry.ts`._