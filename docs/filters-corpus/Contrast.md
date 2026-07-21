# Contrast

- **pluginUUID:** `B13B57AC-811B-4A24-BB5A-2167A3C66F5F`
- **PAE class:** `Contrast`
- **Display names seen:** Contrast (165), Contrast copy (49), Contrast 1 (3), C (2), c 2 (1)
- **Engine status:** ❌ not implemented
- **Corpus usage:** 224 instances across 136 files

## Parameters

| Parameter | Type | Default | Observed range | Keyframed | Seen |
|---|---|---|---|---|---|
| Contrast | float | `1` | [0.3 … 3] | 3 | 209 |
| Pivot | bool (0/1) | `0.5` | [0 … 1] | 2 | 185 |
| Mix | menu/enum (int) | `1` | [1 … 1] | 3 | 175 |
| Smooth Contrast | bool (0/1) | `0` | [0 … 1] | — | 139 |
| Luminance Only | bool (0/1) | `0` | [0 … 1] | — | 132 |
| Clip Color Values | menu/enum (int) | `0` | [0 … 3] | — | 131 |
| Flip | float | `0` | [0 … 0] | — | 73 |
| Input Points | bool (0/1) | `1` | [0 … 1] | — | 73 |
| 对比度 | float | `1` | [0.6 … 2] | — | 11 |
| 轴旋转 | float | `0.5` | [0.35 … 1] | — | 11 |
| 使对比度平滑 | float | `0` | [0 … 0] | — | 11 |
| 仅亮度 | float | `0` | [0 … 0] | — | 11 |
| 片段颜色值 | float | `0` | [0 … 0] | — | 11 |
| 混合 | menu/enum (int) | `1` | [1 … 1] | 2 | 11 |
| 翻转 | float | `0` | [0 … 0] | — | 11 |
| 输入点 | menu/enum (int) | `1` | [1 … 1] | — | 11 |

---
_Auto-generated from the Motion corpus (`~/motr-collection`) by `docs/filters-corpus/gen_fct_filter_docs.py`. Ranges/defaults are EMPIRICAL (observed in real templates), not Apple-documented limits. Keyed by FxPlug pluginUUID per `engine/src/compositor/filters/registry.ts`._