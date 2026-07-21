# Brightness

- **pluginUUID:** `2E4DBB0A-A950-4896-BC2D-A5B0CFF7FAC6`
- **PAE class:** `Brightness`
- **Display names seen:** Brightness (513), Brightness copy (55), Brightness copy 15 (3), Brightness copy 19 (2), Brightness copy 21 (2)
- **Engine status:** ✅ implemented
- **Corpus usage:** 586 instances across 259 files

## Parameters

| Parameter | Type | Default | Observed range | Keyframed | Seen |
|---|---|---|---|---|---|
| Brightness | float | `1` | [0 … 54.04] | 222 | 563 |
| Mix | bool (0/1) | `1` | [0 … 1] | 26 | 480 |
| Flip | bool (0/1) | `0` | [0 … 1] | — | 147 |
| Input Points | bool (0/1) | `1` | [0 … 1] | — | 147 |
| 亮度 | menu/enum (int) | `1` | [1 … 12] | 1 | 12 |
| 混合 | menu/enum (int) | `1` | [1 … 1] | 7 | 12 |
| 翻转 | float | `0` | [0 … 0] | — | 12 |
| 输入点 | menu/enum (int) | `1` | [1 … 1] | — | 12 |

---
_Auto-generated from the Motion corpus (`~/motr-collection`) by `docs/filters-corpus/gen_fct_filter_docs.py`. Ranges/defaults are EMPIRICAL (observed in real templates), not Apple-documented limits. Keyed by FxPlug pluginUUID per `engine/src/compositor/filters/registry.ts`._