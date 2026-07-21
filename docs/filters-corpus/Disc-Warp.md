# Disc Warp

- **pluginUUID:** `182BAC6C-B38A-4B1D-9269-8190FD1E5C42`
- **PAE class:** `Disc Warp`
- **Display names seen:** Controller (107), Disc Warp (100), Main OSC (8)
- **Engine status:** ❌ not implemented
- **Corpus usage:** 215 instances across 215 files

## Parameters

| Parameter | Type | Default | Observed range | Keyframed | Seen |
|---|---|---|---|---|---|
| Center | point2D (X,Y) | `—` | — | — | 215 |
| Radius | float | `150` | [61.58 … 605] | — | 215 |
| Crop | bool (0/1) | `0` | [0 … 1] | — | 215 |
| Mix | menu/enum (int) | `1` | [1 … 1] | — | 215 |
| Publish OSC | bool (0/1) | `0` | [0 … 1] | — | 215 |
| Flip | float | `0` | [0 … 0] | — | 135 |
| Input Points | menu/enum (int) | `1` | [1 … 1] | — | 135 |

---
_Auto-generated from the Motion corpus (`~/motr-collection`) by `docs/filters-corpus/gen_fct_filter_docs.py`. Ranges/defaults are EMPIRICAL (observed in real templates), not Apple-documented limits. Keyed by FxPlug pluginUUID per `engine/src/compositor/filters/registry.ts`._