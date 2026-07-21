# Flop

- **pluginUUID:** `2FF8887B-E673-4727-9601-1B3353531C10`
- **PAE class:** `Flop`
- **Display names seen:** Flop (383), Flip (64), Flop copy (30), Flop 1 (4), Flop 2 (3)
- **Engine status:** ✅ implemented
- **Corpus usage:** 487 instances across 212 files

## Parameters

| Parameter | Type | Default | Observed range | Keyframed | Seen |
|---|---|---|---|---|---|
| Flop | menu/enum (int) | `0` | [0 … 2] | — | 473 |
| Mix | bool (0/1) | `1` | [0 … 1] | — | 413 |
| Flip | float | `0` | [0 … 0] | — | 403 |
| Input Points | menu/enum (int) | `1` | [1 … 1] | — | 403 |
| 落下 | float | `0` | [0 … 0] | — | 2 |
| 混合 | menu/enum (int) | `1` | [1 … 1] | — | 2 |
| 翻转 | float | `0` | [0 … 0] | — | 2 |
| 输入点 | menu/enum (int) | `1` | [1 … 1] | — | 2 |

---
_Auto-generated from the Motion corpus (`~/motr-collection`) by `docs/filters-corpus/gen_fct_filter_docs.py`. Ranges/defaults are EMPIRICAL (observed in real templates), not Apple-documented limits. Keyed by FxPlug pluginUUID per `engine/src/compositor/filters/registry.ts`._