# Gradient Blur

- **pluginUUID:** `7C7405BB-1B00-4811-A507-CB9F619CA522`
- **PAE class:** `Gradient Blur`
- **Display names seen:** Gradient Blur (217), osc 7 (6), osc 6 (6), osc 5 (6), osc 4 (6)
- **Engine status:** ❌ not implemented
- **Corpus usage:** 322 instances across 235 files

## Parameters

| Parameter | Type | Default | Observed range | Keyframed | Seen |
|---|---|---|---|---|---|
| Point 1 | point2D (X,Y) | `—` | — | 2 | 320 |
| Point 2 | point2D (X,Y) | `—` | — | 3 | 320 |
| Mix | bool (0/1) | `1` | [0 … 1] | 2 | 319 |
| Crop | bool (0/1) | `1` | [0 … 1] | — | 314 |
| Amount | float | `10` | [0 … 100] | 17 | 312 |
| Publish OSC | bool (0/1) | `0` | [0 … 1] | — | 299 |
| Flip | float | `0` | [0 … 0] | — | 267 |
| Input Points | menu/enum (int) | `1` | [1 … 1] | — | 267 |
| 点 1 | point2D (X,Y) | `—` | — | — | 2 |
| 点 2 | point2D (X,Y) | `—` | — | — | 2 |
| 数量 | menu/enum (int) | `10` | [10 … 10] | — | 2 |
| 裁剪 | menu/enum (int) | `1` | [1 … 1] | — | 2 |
| 混合 | float | `—` | — | 2 | 2 |
| 翻转 | float | `0` | [0 … 0] | — | 2 |
| 输入点 | menu/enum (int) | `1` | [1 … 1] | — | 2 |
| 发布 OSC | float | `0` | [0 … 0] | — | 2 |

---
_Auto-generated from the Motion corpus (`~/motr-collection`) by `docs/filters-corpus/gen_fct_filter_docs.py`. Ranges/defaults are EMPIRICAL (observed in real templates), not Apple-documented limits. Keyed by FxPlug pluginUUID per `engine/src/compositor/filters/registry.ts`._