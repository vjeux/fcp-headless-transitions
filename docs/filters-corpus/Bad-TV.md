# Bad TV

- **pluginUUID:** `32AB5EE1-BACB-4B81-B44E-6D1E643C8D00`
- **PAE class:** `Bad TV`
- **Display names seen:** Bad TV (129), Bad TV copy (14), Bad TV 1 (8), Bad TV 2 (7), Roll 3 (5)
- **Engine status:** ✅ implemented
- **Corpus usage:** 199 instances across 103 files

## Parameters

| Parameter | Type | Default | Observed range | Keyframed | Seen |
|---|---|---|---|---|---|
| Roll | float | `45` | [-100 … 400] | 48 | 191 |
| Waviness | float | `10` | [0 … 200] | 22 | 187 |
| Static | bool (0/1) | `0.10000000000000001` | [0 … 1] | 5 | 175 |
| Saturate | float | `-25` | [-100 … 100] | 4 | 173 |
| Number of Scan Lines | float | `100` | [1 … 1035] | 2 | 173 |
| Mix | bool (0/1) | `1` | [0 … 1] | 22 | 172 |
| Color Synch | bool (0/1) | `0.80000000000000004` | [0 … 1] | 5 | 171 |
| Scan Line Brightness | menu/enum (int) | `1.5` | [0 … 5] | 2 | 171 |
| Scan Line Percentage | bool (0/1) | `0.5` | [0 … 1] | 2 | 170 |
| Flip | float | `0` | [0 … 0] | — | 114 |
| Input Points | menu/enum (int) | `1` | [1 … 1] | — | 114 |
| 波纹度 | float | `10` | [0 … 53] | — | 8 |
| 胶卷 | float | `45` | [0 … 0] | 2 | 8 |
| 静电 | float | `0.10000000000000001` | [0 … 0.25] | — | 8 |
| 颜色同步 | float | `0.80000000000000004` | [0.8 … 1] | — | 8 |
| 饱和 | float | `-25` | [-25 … 1] | — | 8 |
| 扫描线亮度 | float | `1.5` | [0.4 … 2] | — | 8 |
| 扫描线百分比 | float | `0.5` | [0 … 0.5] | — | 8 |
| 扫描线数量 | float | `100` | [1 … 500] | — | 8 |
| 混合 | menu/enum (int) | `1` | [1 … 1] | 1 | 8 |
| 翻转 | float | `0` | [0 … 0] | — | 8 |
| 输入点 | menu/enum (int) | `1` | [1 … 1] | — | 8 |

---
_Auto-generated from the Motion corpus (`~/motr-collection`) by `docs/filters-corpus/gen_fct_filter_docs.py`. Ranges/defaults are EMPIRICAL (observed in real templates), not Apple-documented limits. Keyed by FxPlug pluginUUID per `engine/src/compositor/filters/registry.ts`._