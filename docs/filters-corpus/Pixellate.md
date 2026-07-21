# Pixellate

- **pluginUUID:** `5E7CA164-3AAF-4C70-A377-567E5796528A`
- **PAE class:** `Pixellate`
- **Display names seen:** Pixellate (266), Pixellate 1 (10), Pixellate 2 (8), Pixellate copy (6), Pixellate 3 (3)
- **Engine status:** ✅ implemented
- **Corpus usage:** 296 instances across 162 files

## Parameters

| Parameter | Type | Default | Observed range | Keyframed | Seen |
|---|---|---|---|---|---|
| Scale | float | `8` | [1 … 320] | 29 | 290 |
| Center | point2D (X,Y) | `—` | — | — | 286 |
| Mix | bool (0/1) | `1` | [0 … 1] | 109 | 286 |
| Publish OSC | bool (0/1) | `0` | [0 … 1] | — | 281 |
| Flip | float | `0` | [0 … 0] | — | 270 |
| Input Points | menu/enum (int) | `1` | [1 … 1] | — | 270 |
| 居中 | float | `—` | — | — | 3 |
| 缩放 | menu/enum (int) | `8` | [6 … 12] | — | 3 |
| 混合 | menu/enum (int) | `1` | [1 … 1] | 1 | 3 |
| 翻转 | float | `0` | [0 … 0] | — | 3 |
| 输入点 | menu/enum (int) | `1` | [1 … 1] | — | 3 |
| 发布 OSC | float | `0` | [0 … 0] | — | 3 |

---
_Auto-generated from the Motion corpus (`~/motr-collection`) by `docs/filters-corpus/gen_fct_filter_docs.py`. Ranges/defaults are EMPIRICAL (observed in real templates), not Apple-documented limits. Keyed by FxPlug pluginUUID per `engine/src/compositor/filters/registry.ts`._