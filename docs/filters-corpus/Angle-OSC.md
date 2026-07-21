# Angle OSC

- **pluginUUID:** `6209E095-64E4-11D9-B08D-000A95AF90F2`
- **PAE class:** `Angle OSC`
- **Display names seen:** Angle OSC (2), Kaleidoscope (1)
- **Engine status:** ❌ not implemented
- **Corpus usage:** 3 instances across 3 files

## Parameters

| Parameter | Type | Default | Observed range | Keyframed | Seen |
|---|---|---|---|---|---|
| Center | point2D (X,Y) | `—` | — | — | 3 |
| Segment Angle | float | `0.39269908169872414` | [0.3927 … 2.531] | — | 3 |
| Offset Angle | float | `0.013707783890401887` | [0 … 0.01745] | — | 3 |
| Partial Segments | float | `0` | [0 … 0] | — | 3 |
| Mix | menu/enum (int) | `1` | [1 … 1] | — | 3 |
| Flip | float | `0` | [0 … 0] | — | 3 |
| Input Points | menu/enum (int) | `1` | [1 … 1] | — | 3 |
| Publish OSC | bool (0/1) | `0` | [0 … 1] | — | 3 |

---
_Auto-generated from the Motion corpus (`~/motr-collection`) by `docs/filters-corpus/gen_fct_filter_docs.py`. Ranges/defaults are EMPIRICAL (observed in real templates), not Apple-documented limits. Keyed by FxPlug pluginUUID per `engine/src/compositor/filters/registry.ts`._