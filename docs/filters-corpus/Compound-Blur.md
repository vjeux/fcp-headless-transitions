# Compound Blur

- **pluginUUID:** `000BAA25-418E-412B-8649-CF5C7C2771E3`
- **PAE class:** `Compound Blur`
- **Display names seen:** Compound Blur (81), Compound Blur copy (1), Vignette Blur (1), Compound Blur 1 (1), Compound Blur Source (1)
- **Engine status:** ❌ not implemented
- **Corpus usage:** 85 instances across 83 files

## Parameters

| Parameter | Type | Default | Observed range | Keyframed | Seen |
|---|---|---|---|---|---|
| Amount | float | `7` | [0 … 300] | 7 | 84 |
| Blur Map | float | `0` | [0 … 3335359707] | — | 84 |
| Map Channel | menu/enum (int) | `4` | [3 … 4] | — | 84 |
| Invert Map | bool (0/1) | `0` | [0 … 1] | — | 84 |
| Stretch Map | bool (0/1) | `0` | [0 … 1] | — | 84 |
| Horizontal | float | `100` | [10 … 100] | — | 84 |
| Vertical | float | `100` | [10 … 100] | — | 84 |
| Mix | menu/enum (int) | `1` | [1 … 1] | 3 | 84 |
| Flip | float | `0` | [0 … 0] | — | 83 |
| Input Points | menu/enum (int) | `1` | [1 … 1] | — | 83 |
| 数量 | menu/enum (int) | `7` | [150 … 150] | — | 1 |
| 模糊贴图 | menu/enum (int) | `0` | [3330927277 … 3330927277] | — | 1 |
| 贴图通道 | menu/enum (int) | `4` | [4 … 4] | — | 1 |
| 反向贴图 | float | `0` | [0 … 0] | — | 1 |
| 拉伸贴图 | float | `0` | [0 … 0] | — | 1 |
| 水平 | menu/enum (int) | `100` | [100 … 100] | — | 1 |
| 垂直 | menu/enum (int) | `100` | [100 … 100] | — | 1 |
| 混合 | float | `—` | — | 1 | 1 |
| 翻转 | float | `0` | [0 … 0] | — | 1 |
| 输入点 | menu/enum (int) | `1` | [1 … 1] | — | 1 |

---
_Auto-generated from the Motion corpus (`~/motr-collection`) by `docs/filters-corpus/gen_fct_filter_docs.py`. Ranges/defaults are EMPIRICAL (observed in real templates), not Apple-documented limits. Keyed by FxPlug pluginUUID per `engine/src/compositor/filters/registry.ts`._