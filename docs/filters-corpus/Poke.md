# Poke

- **pluginUUID:** `70471B0A-5D9D-4699-AEEE-CCFC84045B4B`
- **PAE class:** `Poke`
- **Display names seen:** Poke (127), Poke 2 (60), Poke 1 (59), CP2 (13), CP1 (13)
- **Engine status:** ❌ not implemented
- **Corpus usage:** 397 instances across 177 files

## Parameters

| Parameter | Type | Default | Observed range | Keyframed | Seen |
|---|---|---|---|---|---|
| Center | point2D (X,Y) | `—` | — | 50 | 392 |
| Mix | bool (0/1) | `1` | [0 … 1] | 4 | 390 |
| Scale | bool (0/1) | `0.5` | [0 … 1] | 116 | 377 |
| Radius | float | `300` | [0 … 1000] | 1 | 376 |
| Publish OSC | bool (0/1) | `0` | [0 … 1] | — | 375 |
| Flip | float | `0` | [0 … 0] | — | 294 |
| Input Points | menu/enum (int) | `1` | [1 … 1] | — | 294 |
| 居中 | float | `—` | — | — | 1 |
| 半径 | float | `300` | [0 … 0] | — | 1 |
| 缩放 | float | `0.5` | [0 … 0] | — | 1 |
| 混合 | float | `1` | [0 … 0] | — | 1 |
| 翻转 | float | `0` | [0 … 0] | — | 1 |
| 输入点 | menu/enum (int) | `1` | [1 … 1] | — | 1 |
| 发布 OSC | menu/enum (int) | `0` | [1 … 1] | — | 1 |

---
_Auto-generated from the Motion corpus (`~/motr-collection`) by `docs/filters-corpus/gen_fct_filter_docs.py`. Ranges/defaults are EMPIRICAL (observed in real templates), not Apple-documented limits. Keyed by FxPlug pluginUUID per `engine/src/compositor/filters/registry.ts`._