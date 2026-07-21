# Threshold

- **pluginUUID:** `96AFC322-287E-4014-9EFD-763CD9813E17`
- **PAE class:** `Threshold`
- **Display names seen:** Threshold (51), Luma (35), Threshold copy (8), ©idustrialrevolution.com (1), Luma Source (1)
- **Engine status:** ❌ not implemented
- **Corpus usage:** 97 instances across 81 files

## Parameters

| Parameter | Type | Default | Observed range | Keyframed | Seen |
|---|---|---|---|---|---|
| Threshold | bool (0/1) | `0.5` | [0 … 1] | 40 | 96 |
| Smoothness | bool (0/1) | `0.14999999999999999` | [0 … 1] | 1 | 96 |
| Light Color | color (RGB/RGBA) | `—` | — | 35 | 93 |
| Dark Color | color (RGB/RGBA) | `—` | — | 35 | 91 |
| Mix | float | `1` | [0.35 … 1] | 1 | 89 |
| Correct For Alpha | bool (0/1) | `0` | [0 … 1] | — | 81 |
| Flip | bool (0/1) | `0` | [0 … 1] | — | 71 |
| Input Points | bool (0/1) | `1` | [0 … 1] | — | 71 |
| 阈值 | float | `—` | — | 1 | 1 |
| 平滑度 | float | `0.14999999999999999` | [0 … 0] | — | 1 |
| 深色 | float | `—` | — | — | 1 |
| 浅色 | float | `—` | — | — | 1 |
| 纠正 Alpha | float | `0` | [0 … 0] | — | 1 |
| 混合 | menu/enum (int) | `1` | [1 … 1] | — | 1 |
| 翻转 | float | `0` | [0 … 0] | — | 1 |
| 输入点 | menu/enum (int) | `1` | [1 … 1] | — | 1 |

---
_Auto-generated from the Motion corpus (`~/motr-collection`) by `docs/filters-corpus/gen_fct_filter_docs.py`. Ranges/defaults are EMPIRICAL (observed in real templates), not Apple-documented limits. Keyed by FxPlug pluginUUID per `engine/src/compositor/filters/registry.ts`._