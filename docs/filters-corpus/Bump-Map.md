# Bump Map

- **pluginUUID:** `1E6F3535-CAD6-4F4A-8EFE-24C402488000`
- **PAE class:** `Bump Map`
- **Display names seen:** Bump Map (171), Distortion (110), Glitch 2 (67), Glitch 1 (66), Bump Map 1 (49)
- **Engine status:** ❌ not implemented
- **Corpus usage:** 780 instances across 257 files

## Parameters

| Parameter | Type | Default | Observed range | Keyframed | Seen |
|---|---|---|---|---|---|
| Map Image | float | `0` | [10009 … 3335299512] | — | 760 |
| Direction | float | `0.17453292519943295` | [-6.281 … 6.283] | — | 760 |
| Amount | float | `0.10000000000000001` | [-4 … 10] | 302 | 760 |
| Horizontal Scale | float | `0.10000000000000001` | [-10 … 10] | 172 | 760 |
| Vertical Scale | float | `0.10000000000000001` | [-10 … 10] | 131 | 760 |
| Mix | bool (0/1) | `1` | [0 … 1] | 22 | 757 |
| Controls | bool (0/1) | `0` | [0 … 1] | — | 755 |
| Repeat Edges | bool (0/1) | `0` | [0 … 1] | — | 755 |
| Flip | float | `0` | [0 … 0] | — | 692 |
| Input Points | menu/enum (int) | `1` | [1 … 1] | — | 692 |
| 映射图像 | float | `0` | [3295235243 … 3330999630] | — | 20 |
| 控制 | float | `0` | [0 … 0] | — | 20 |
| 方向 | float | `0.17453292519943295` | [0 … 3.84] | — | 20 |
| 数量 | float | `0.10000000000000001` | [0.3 … 10] | 14 | 20 |
| 水平缩放 | float | `0.10000000000000001` | [-0.8682 … 10] | — | 20 |
| 垂直缩放 | float | `0.10000000000000001` | [-4.924 … 10] | — | 20 |
| 重复边缘 | bool (0/1) | `0` | [0 … 1] | — | 20 |
| 混合 | menu/enum (int) | `1` | [1 … 1] | — | 20 |
| 翻转 | float | `0` | [0 … 0] | — | 20 |
| 输入点 | menu/enum (int) | `1` | [1 … 1] | — | 20 |

---
_Auto-generated from the Motion corpus (`~/motr-collection`) by `docs/filters-corpus/gen_fct_filter_docs.py`. Ranges/defaults are EMPIRICAL (observed in real templates), not Apple-documented limits. Keyed by FxPlug pluginUUID per `engine/src/compositor/filters/registry.ts`._