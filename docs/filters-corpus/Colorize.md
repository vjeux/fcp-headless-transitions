# Colorize

- **pluginUUID:** `D995BBCF-F766-4950-89D5-7A4828CD9B6F`
- **PAE class:** `Colorize`
- **Display names seen:** Colorize (2150), Global Color (327), Global Colorize (90), Colorize copy (53), U Curve Arrow (3)
- **Engine status:** ✅ implemented
- **Corpus usage:** 2667 instances across 921 files

## Parameters

| Parameter | Type | Default | Observed range | Keyframed | Seen |
|---|---|---|---|---|---|
| Remap White To | color (RGB/RGBA) | `—` | — | 1 | 2574 |
| Remap Black To | color (RGB/RGBA) | `—` | — | 4 | 2571 |
| Mix | bool (0/1) | `1` | [0 … 1] | 47 | 2554 |
| Intensity | bool (0/1) | `1` | [0 … 1] | 1 | 2490 |
| Flip | float | `0` | [0 … 0] | — | 2114 |
| Input Points | menu/enum (int) | `1` | [1 … 1] | — | 2114 |
| Colorize::HDR In Rec. 709 | float | `0` | [0 … 0] | — | 2093 |
| 将黑色重新映射到 | group (红色, 绿色, 蓝色) | `—` | — | — | 80 |
| 将白色重新映射到 | group (绿色, 蓝色, 红色) | `—` | — | — | 80 |
| 强度 | menu/enum (int) | `1` | [1 … 1] | — | 80 |
| 混合 | menu/enum (int) | `1` | [1 … 1] | 3 | 80 |
| 翻转 | float | `0` | [0 … 0] | — | 80 |
| 输入点 | menu/enum (int) | `1` | [1 … 1] | — | 80 |
| Schwarz neu zuordnen zu | group (Rot, Grün, Blau, Farbraum) | `—` | — | — | 13 |
| Weiß neu zuordnen zu | group (Grün, Blau, Rot, Farbraum) | `—` | — | — | 13 |
| Intensität | menu/enum (int) | `1` | [1 … 1] | — | 13 |
| Spiegeln | float | `0` | [0 … 0] | — | 13 |
| Eingabe-Punkte | menu/enum (int) | `1` | [1 … 1] | — | 13 |

---
_Auto-generated from the Motion corpus (`~/motr-collection`) by `docs/filters-corpus/gen_fct_filter_docs.py`. Ranges/defaults are EMPIRICAL (observed in real templates), not Apple-documented limits. Keyed by FxPlug pluginUUID per `engine/src/compositor/filters/registry.ts`._