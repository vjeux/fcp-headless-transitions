# Tile

- **pluginUUID:** `1EFA89E8-CFDA-4D08-B833-33F01A4B9139`
- **PAE class:** `Tile`
- **Display names seen:** Tile (21)
- **Engine status:** ❌ not implemented
- **Corpus usage:** 21 instances across 16 files

## Parameters

| Parameter | Type | Default | Observed range | Keyframed | Seen |
|---|---|---|---|---|---|
| Center | point2D (X,Y) | `—` | — | 1 | 21 |
| Skew | float | `0` | [0 … 0] | — | 21 |
| Scale | menu/enum (int) | `3` | [1 … 10] | 4 | 21 |
| Stretch | float | `1` | [0.1 … 1] | — | 21 |
| Angle | float | `0` | [0 … 0] | — | 21 |
| Mix | menu/enum (int) | `1` | [1 … 1] | — | 21 |
| Flip | float | `0` | [0 … 0] | — | 21 |
| Input Points | menu/enum (int) | `1` | [1 … 1] | — | 21 |
| Publish OSC | bool (0/1) | `0` | [0 … 1] | — | 21 |

---
_Auto-generated from the Motion corpus (`~/motr-collection`) by `docs/filters-corpus/gen_fct_filter_docs.py`. Ranges/defaults are EMPIRICAL (observed in real templates), not Apple-documented limits. Keyed by FxPlug pluginUUID per `engine/src/compositor/filters/registry.ts`._