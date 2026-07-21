# Outer Glow

- **pluginUUID:** `A7077089-AA05-44F8-98E8-0C90E446F447`
- **PAE class:** `Outer Glow`
- **Display names seen:** Outer Glow (52), Outer Glow copy (6)
- **Engine status:** ❌ not implemented
- **Corpus usage:** 58 instances across 29 files

## Parameters

| Parameter | Type | Default | Observed range | Keyframed | Seen |
|---|---|---|---|---|---|
| Inner Color | color (RGB/RGBA) | `—` | — | — | 58 |
| Outer Color | color (RGB/RGBA) | `—` | — | — | 58 |
| Radius | float | `2` | [0 … 300] | 1 | 51 |
| Brightness | float | `15` | [0 … 100] | — | 50 |
| Range | bool (0/1) | `0.25` | [0 … 1] | — | 49 |
| Mix | float | `1` | [0.4 … 1] | — | 44 |
| Horizontal | menu/enum (int) | `100` | [100 … 100] | — | 40 |
| Vertical | float | `100` | [0 … 100] | — | 40 |
| Crop | float | `0` | [0 … 0] | — | 40 |
| Flip | bool (0/1) | `0` | [0 … 1] | — | 22 |
| Input Points | bool (0/1) | `1` | [0 … 1] | — | 22 |

---
_Auto-generated from the Motion corpus (`~/motr-collection`) by `docs/filters-corpus/gen_fct_filter_docs.py`. Ranges/defaults are EMPIRICAL (observed in real templates), not Apple-documented limits. Keyed by FxPlug pluginUUID per `engine/src/compositor/filters/registry.ts`._