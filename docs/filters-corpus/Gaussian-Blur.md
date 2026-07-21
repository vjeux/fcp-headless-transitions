# Gaussian Blur

- **pluginUUID:** `E472D646-2C92-464E-98A1-91CF8F162AD8`
- **PAE class:** `Gaussian Blur`
- **Display names seen:** Gaussian Blur (1416), Blur (43), Gaussian Blur Source (37), Gaussian Blur copy (31), Focus Change (19)
- **Engine status:** ✅ implemented
- **Corpus usage:** 1594 instances across 788 files

## Parameters

| Parameter | Type | Default | Observed range | Keyframed | Seen |
|---|---|---|---|---|---|
| Prescale Input | float | `0` | [0 … 0] | — | 1487 |
| Amount | float | `4` | [0 … 2326] | 131 | 1464 |
| Mix | bool (0/1) | `1` | [0 … 1] | 114 | 1386 |
| Crop | bool (0/1) | `0` | [0 … 1] | — | 1371 |
| Vertical | float | `100` | [0 … 100] | 4 | 1367 |
| Horizontal | float | `100` | [0 … 100] | 4 | 1361 |
| 360° Aware | bool (0/1) | `0` | [0 … 1] | — | 1006 |
| Flip | bool (0/1) | `0` | [0 … 1] | — | 1003 |
| Input Points | bool (0/1) | `1` | [0 … 1] | — | 1003 |
| 数量 | float | `4` | [0 … 500] | 2 | 126 |
| 水平 | float | `100` | [0 … 100] | — | 126 |
| 垂直 | float | `100` | [0 … 100] | — | 126 |
| 裁剪 | bool (0/1) | `0` | [0 … 1] | — | 126 |
| 360° 识别 | float | `0` | [0 … 0] | — | 126 |
| 混合 | float | `1` | [0.8 … 1] | 6 | 126 |
| 翻转 | float | `0` | [0 … 0] | — | 126 |
| 输入点 | menu/enum (int) | `1` | [1 … 1] | — | 126 |

---
_Auto-generated from the Motion corpus (`~/motr-collection`) by `docs/filters-corpus/gen_fct_filter_docs.py`. Ranges/defaults are EMPIRICAL (observed in real templates), not Apple-documented limits. Keyed by FxPlug pluginUUID per `engine/src/compositor/filters/registry.ts`._