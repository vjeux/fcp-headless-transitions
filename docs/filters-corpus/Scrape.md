# Scrape

- **pluginUUID:** `0D6E968B-0291-43E2-A8DA-88EB80E9C4B2`
- **PAE class:** `Scrape`
- **Display names seen:** Scrape (58), Scrape Down Out (9), Scrape Down In (9), Scrape Top (7), Scrape Bottom (7)
- **Engine status:** ✅ implemented
- **Corpus usage:** 135 instances across 48 files

## Parameters

| Parameter | Type | Default | Observed range | Keyframed | Seen |
|---|---|---|---|---|---|
| Center | point2D (X,Y) | `—` | — | 112 | 134 |
| Rotation | float | `0` | [0 … 6.283] | 2 | 134 |
| Amount | float | `50` | [0 … 200] | 9 | 134 |
| Mix | bool (0/1) | `1` | [0 … 1] | 27 | 134 |
| Crop | bool (0/1) | `1` | [0 … 1] | — | 132 |
| Flip | float | `0` | [0 … 0] | — | 126 |
| Input Points | menu/enum (int) | `1` | [1 … 1] | — | 126 |
| Publish OSC | bool (0/1) | `0` | [0 … 1] | — | 126 |
| 居中 | float | `—` | — | — | 1 |
| 旋转 | float | `0` | [1.571 … 1.571] | — | 1 |
| 数量 | menu/enum (int) | `50` | [200 … 200] | — | 1 |
| 裁剪 | menu/enum (int) | `1` | [1 … 1] | — | 1 |
| 混合 | float | `—` | — | 1 | 1 |
| 翻转 | float | `0` | [0 … 0] | — | 1 |
| 输入点 | menu/enum (int) | `1` | [1 … 1] | — | 1 |
| 发布 OSC | float | `0` | [0 … 0] | — | 1 |

---
_Auto-generated from the Motion corpus (`~/motr-collection`) by `docs/filters-corpus/gen_fct_filter_docs.py`. Ranges/defaults are EMPIRICAL (observed in real templates), not Apple-documented limits. Keyed by FxPlug pluginUUID per `engine/src/compositor/filters/registry.ts`._