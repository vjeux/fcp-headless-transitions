# Underwater

- **pluginUUID:** `9FA1F483-1E09-4DD0-870F-C32777D7F1B0`
- **PAE class:** `Underwater`
- **Display names seen:** Refraction (121), Underwater (55), Distortion (4), Underwater 1 (2), Animation (2)
- **Engine status:** ✅ implemented
- **Corpus usage:** 188 instances across 111 files

## Parameters

| Parameter | Type | Default | Observed range | Keyframed | Seen |
|---|---|---|---|---|---|
| Size | float | `2` | [0.02 … 72] | — | 187 |
| Speed | float | `0.5` | [0 … 100] | — | 187 |
| Repeat Edges | bool (0/1) | `0` | [0 … 1] | — | 185 |
| Mix | bool (0/1) | `1` | [0 … 1] | 6 | 183 |
| Refraction | float | `100` | [0 … 540] | 7 | 182 |
| Flip | float | `0` | [0 … 0] | — | 178 |
| Input Points | menu/enum (int) | `1` | [1 … 1] | — | 178 |
| 大小 | float | `2` | [0.35 … 0.35] | — | 1 |
| 速度 | menu/enum (int) | `0.5` | [2 … 2] | — | 1 |
| 折射 | menu/enum (int) | `100` | [25 … 25] | — | 1 |
| 重复边缘 | float | `0` | [0 … 0] | — | 1 |
| 混合 | menu/enum (int) | `1` | [1 … 1] | — | 1 |
| 翻转 | float | `0` | [0 … 0] | — | 1 |
| 输入点 | menu/enum (int) | `1` | [1 … 1] | — | 1 |

---
_Auto-generated from the Motion corpus (`~/motr-collection`) by `docs/filters-corpus/gen_fct_filter_docs.py`. Ranges/defaults are EMPIRICAL (observed in real templates), not Apple-documented limits. Keyed by FxPlug pluginUUID per `engine/src/compositor/filters/registry.ts`._