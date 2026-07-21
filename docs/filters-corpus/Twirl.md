# Twirl

- **pluginUUID:** `42D649CE-8CAA-4BCC-8F59-50E1009B03CE`
- **PAE class:** `Twirl`
- **Display names seen:** Twirl (491), OSC (52), Control (40), PRS (34), Rotate (28)
- **Engine status:** ❌ not implemented
- **Corpus usage:** 693 instances across 492 files

## Parameters

| Parameter | Type | Default | Observed range | Keyframed | Seen |
|---|---|---|---|---|---|
| Twirl | float | `3.1415926535897931` | [-6.083 … 9.069] | 7 | 689 |
| Amount | bool (0/1) | `0.5` | [0 … 1] | 3 | 688 |
| Mix | bool (0/1) | `1` | [0 … 1] | — | 686 |
| Center | point2D (X,Y) | `—` | — | 2 | 683 |
| Publish OSC | bool (0/1) | `0` | [0 … 1] | — | 679 |
| Crop | bool (0/1) | `0` | [0 … 1] | — | 674 |
| Flip | float | `0` | [0 … 0] | — | 530 |
| Input Points | menu/enum (int) | `1` | [1 … 1] | — | 530 |
| 数量 | float | `0.5` | [0.001 … 0.05] | — | 4 |
| 旋转 | float | `3.1415926535897931` | [0 … 2.13] | — | 4 |
| 居中 | point2D (X,Y) | `—` | — | — | 4 |
| 裁剪 | float | `0` | [0 … 0] | — | 4 |
| 混合 | menu/enum (int) | `1` | [1 … 1] | — | 4 |
| 翻转 | float | `0` | [0 … 0] | — | 4 |
| 输入点 | menu/enum (int) | `1` | [1 … 1] | — | 4 |
| 发布 OSC | menu/enum (int) | `0` | [1 … 1] | — | 4 |

---
_Auto-generated from the Motion corpus (`~/motr-collection`) by `docs/filters-corpus/gen_fct_filter_docs.py`. Ranges/defaults are EMPIRICAL (observed in real templates), not Apple-documented limits. Keyed by FxPlug pluginUUID per `engine/src/compositor/filters/registry.ts`._