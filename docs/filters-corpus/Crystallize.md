# Crystallize

- **pluginUUID:** `9D6E32F9-7C04-4207-B1B5-A480780B2B9D`
- **PAE class:** `Crystallize`
- **Display names seen:** Crystallize (14), Crystallize Out (1), Crystallize In (1)
- **Engine status:** ❌ not implemented
- **Corpus usage:** 16 instances across 14 files

## Parameters

| Parameter | Type | Default | Observed range | Keyframed | Seen |
|---|---|---|---|---|---|
| Size | float | `8` | [3 … 64] | 4 | 14 |
| Speed | menu/enum (int) | `0.5` | [0 … 2] | — | 14 |
| Smooth | bool (0/1) | `1` | [0 … 1] | — | 14 |
| Feathering | menu/enum (int) | `0.25` | [0 … 2] | — | 14 |
| Mix | float | `1` | [0.9 … 1] | 4 | 14 |
| Flip | float | `0` | [0 … 0] | — | 9 |
| Input Points | menu/enum (int) | `1` | [1 … 1] | — | 9 |
| 大小 | menu/enum (int) | `8` | [6 … 6] | — | 2 |
| 速度 | float | `0.5` | [0 … 0] | — | 2 |
| 平滑 | menu/enum (int) | `1` | [1 … 1] | — | 2 |
| 羽化 | float | `0.25` | [0 … 0] | — | 2 |
| 混合 | menu/enum (int) | `1` | [1 … 1] | — | 2 |
| 翻转 | float | `0` | [0 … 0] | — | 2 |
| 输入点 | menu/enum (int) | `1` | [1 … 1] | — | 2 |

---
_Auto-generated from the Motion corpus (`~/motr-collection`) by `docs/filters-corpus/gen_fct_filter_docs.py`. Ranges/defaults are EMPIRICAL (observed in real templates), not Apple-documented limits. Keyed by FxPlug pluginUUID per `engine/src/compositor/filters/registry.ts`._