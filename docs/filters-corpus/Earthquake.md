# Earthquake

- **pluginUUID:** `DEB7CD03-0C92-416A-B42A-656FB37530A1`
- **PAE class:** `Earthquake`
- **Display names seen:** Earthquake (122), Earthquake copy (2), Earthquake 3 (2), Earthquake 2 (2), Earthquake 1 (2)
- **Engine status:** ✅ implemented
- **Corpus usage:** 145 instances across 128 files

## Parameters

| Parameter | Type | Default | Observed range | Keyframed | Seen |
|---|---|---|---|---|---|
| Twist | float | `0.10000000000000001` | [0 … 0.43] | 74 | 95 |
| Horizontal Shake | bool (0/1) | `0.10000000000000001` | [0 … 1] | 74 | 95 |
| Vertical Shake | bool (0/1) | `0.10000000000000001` | [0 … 1] | 74 | 95 |
| Layers | menu/enum (int) | `1` | [1 … 5] | — | 93 |
| Mix | bool (0/1) | `1` | [0 … 1] | — | 93 |
| Epicenter | point2D (X,Y) | `—` | — | — | 92 |
| Random Seed | float | `0` | [0 … 1000] | — | 92 |
| Publish OSC | bool (0/1) | `0` | [0 … 1] | — | 78 |
| Flip | float | `0` | [0 … 0] | — | 77 |
| Input Points | menu/enum (int) | `1` | [1 … 1] | — | 77 |
| 扭曲 | float | `0.10000000000000001` | [0 … 0] | 45 | 49 |
| 水平摇动 | float | `0.10000000000000001` | [0 … 0] | 45 | 49 |
| 垂直摇动 | float | `—` | — | 49 | 49 |
| 层 | menu/enum (int) | `1` | [1 … 1] | — | 49 |
| 震中 | float | `—` | — | — | 49 |
| 随机种子 | float | `0` | [0 … 0] | — | 49 |
| 混合 | menu/enum (int) | `1` | [1 … 1] | — | 49 |
| 翻转 | float | `0` | [0 … 0] | — | 49 |
| 输入点 | menu/enum (int) | `1` | [1 … 1] | — | 49 |
| 发布 OSC | float | `0` | [0 … 0] | — | 49 |
| Drehung | float | `0.10000000000000001` | [0.31 … 0.31] | — | 1 |
| Horizontales Beben | float | `0.10000000000000001` | [0.1 … 0.1] | — | 1 |
| Vertikales Beben | float | `0.10000000000000001` | [0.1 … 0.1] | — | 1 |
| Ebenen | menu/enum (int) | `1` | [1 … 1] | — | 1 |
| Epizentrum | float | `—` | — | — | 1 |
| Zufällige Streuung | float | `0` | [0 … 0] | — | 1 |
| Spiegeln | float | `0` | [0 … 0] | — | 1 |
| Eingabe-Punkte | menu/enum (int) | `1` | [1 … 1] | — | 1 |
| OSC veröffentlichen | float | `0` | [0 … 0] | — | 1 |

---
_Auto-generated from the Motion corpus (`~/motr-collection`) by `docs/filters-corpus/gen_fct_filter_docs.py`. Ranges/defaults are EMPIRICAL (observed in real templates), not Apple-documented limits. Keyed by FxPlug pluginUUID per `engine/src/compositor/filters/registry.ts`._