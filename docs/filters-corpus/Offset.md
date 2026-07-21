# Offset

- **pluginUUID:** `D6245DC0-5D17-4847-ABB0-C4D01C3FA3F7`
- **PAE class:** `Offset`
- **Display names seen:** Offset (347), Offset copy (13), Offset 1 (3), Offset 2 (3), Ofst (1)
- **Engine status:** ❌ not implemented
- **Corpus usage:** 374 instances across 228 files

## Parameters

| Parameter | Type | Default | Observed range | Keyframed | Seen |
|---|---|---|---|---|---|
| Horizontal Offset | float | `0` | [-4945 … 1000] | 63 | 367 |
| Mix | bool (0/1) | `1` | [0 … 1] | 7 | 367 |
| Vertical Offset | float | `0` | [-169 … 1000] | 72 | 366 |
| Flip | float | `0` | [0 … 0] | — | 343 |
| Input Points | menu/enum (int) | `1` | [1 … 1] | — | 343 |
| 水平偏移 | float | `0` | [0 … 0] | 2 | 7 |
| 垂直偏移 | float | `0` | [0 … 0] | 2 | 7 |
| 混合 | menu/enum (int) | `1` | [1 … 1] | — | 7 |
| 翻转 | float | `0` | [0 … 0] | — | 7 |
| 输入点 | menu/enum (int) | `1` | [1 … 1] | — | 7 |

---
_Auto-generated from the Motion corpus (`~/motr-collection`) by `docs/filters-corpus/gen_fct_filter_docs.py`. Ranges/defaults are EMPIRICAL (observed in real templates), not Apple-documented limits. Keyed by FxPlug pluginUUID per `engine/src/compositor/filters/registry.ts`._