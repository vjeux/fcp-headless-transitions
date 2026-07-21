# Prism

- **pluginUUID:** `5A913CA7-CA5C-4EB5-951C-DDF4EDEC5B65`
- **PAE class:** `Prism`
- **Display names seen:** Prism (740), Prism copy (34), Prism 1 (13), Prism 2 (11), Prism  (5)
- **Engine status:** ❌ not implemented
- **Corpus usage:** 829 instances across 538 files

## Parameters

| Parameter | Type | Default | Observed range | Keyframed | Seen |
|---|---|---|---|---|---|
| Amount | float | `7` | [0 … 950] | 225 | 811 |
| Angle | float | `0` | [0 … 6.283] | 2 | 807 |
| Mix | bool (0/1) | `1` | [0 … 1] | 248 | 806 |
| Crop | bool (0/1) | `0` | [0 … 1] | — | 805 |
| OSC Center | float | `—` | — | — | 805 |
| Publish OSC | bool (0/1) | `0` | [0 … 1] | — | 615 |
| Flip | float | `0` | [0 … 0] | — | 596 |
| Input Points | menu/enum (int) | `1` | [1 … 1] | — | 596 |
| 数量 | float | `7` | [5 … 125] | 2 | 18 |
| 角度 | float | `0` | [0 … 1.571] | — | 18 |
| 裁剪 | float | `0` | [0 … 0] | — | 18 |
| OSC 中心 | float | `—` | — | — | 18 |
| 混合 | menu/enum (int) | `1` | [1 … 1] | 4 | 18 |
| 翻转 | float | `0` | [0 … 0] | — | 18 |
| 输入点 | menu/enum (int) | `1` | [1 … 1] | — | 18 |
| 发布 OSC | float | `0` | [0 … 0] | — | 18 |

---
_Auto-generated from the Motion corpus (`~/motr-collection`) by `docs/filters-corpus/gen_fct_filter_docs.py`. Ranges/defaults are EMPIRICAL (observed in real templates), not Apple-documented limits. Keyed by FxPlug pluginUUID per `engine/src/compositor/filters/registry.ts`._