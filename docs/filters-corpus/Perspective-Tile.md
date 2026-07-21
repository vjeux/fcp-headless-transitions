# Perspective Tile

- **pluginUUID:** `A4519C66-916B-470E-B21F-9898EBEAE560`
- **PAE class:** `Perspective Tile`
- **Display names seen:** Perspective Tile (3), perst (2)
- **Engine status:** ❌ not implemented
- **Corpus usage:** 5 instances across 5 files

## Parameters

| Parameter | Type | Default | Observed range | Keyframed | Seen |
|---|---|---|---|---|---|
| Top Left | point2D (X,Y) | `—` | — | — | 5 |
| Top Right | point2D (X,Y) | `—` | — | — | 5 |
| Bottom Right | point2D (X,Y) | `—` | — | — | 5 |
| Bottom Left | point2D (X,Y) | `—` | — | — | 5 |
| Center | point2D (X,Y) | `—` | — | — | 5 |
| Angle | float | `0` | [0.09727 … 6.267] | — | 5 |
| Mix | bool (0/1) | `1` | [0 … 1] | — | 5 |
| Flip | float | `0` | [0 … 0] | — | 5 |
| Input Points | menu/enum (int) | `1` | [1 … 1] | — | 5 |
| Publish OSC | bool (0/1) | `0` | [0 … 1] | — | 5 |

---
_Auto-generated from the Motion corpus (`~/motr-collection`) by `docs/filters-corpus/gen_fct_filter_docs.py`. Ranges/defaults are EMPIRICAL (observed in real templates), not Apple-documented limits. Keyed by FxPlug pluginUUID per `engine/src/compositor/filters/registry.ts`._