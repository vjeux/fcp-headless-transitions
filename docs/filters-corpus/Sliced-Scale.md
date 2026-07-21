# Sliced Scale

- **pluginUUID:** `546352EB-956A-4DDA-9071-C82CC50B7F73`
- **PAE class:** `Sliced Scale`
- **Display names seen:** Sliced Scale (6), Scale (2), Width (1)
- **Engine status:** ❌ not implemented
- **Corpus usage:** 9 instances across 5 files

## Parameters

| Parameter | Type | Default | Observed range | Keyframed | Seen |
|---|---|---|---|---|---|
| Edit Slices | float | `0` | [0 … 0] | — | 9 |
| Slice Right Top | point2D (X,Y) | `—` | — | — | 9 |
| Slice Left Bottom | point2D (X,Y) | `—` | — | — | 9 |
| Scale Method | menu/enum (int) | `0` | [0 … 2] | — | 9 |
| Scale | point2D (X,Y) | `—` | — | — | 9 |
| Offset | point2D (X,Y) | `—` | — | — | 9 |
| Expand | group (Left, Right, Top, Bottom) | `—` | — | — | 9 |
| Debug | group (Ignore Offset values, Don't Auto-keyframe offset) | `—` | — | — | 9 |
| Mix | bool (0/1) | `1` | [0 … 1] | — | 9 |
| Flip | float | `0` | [0 … 0] | — | 9 |
| Input Points | menu/enum (int) | `1` | [1 … 1] | — | 9 |
| Publish OSC | bool (0/1) | `0` | [0 … 1] | — | 9 |

---
_Auto-generated from the Motion corpus (`~/motr-collection`) by `docs/filters-corpus/gen_fct_filter_docs.py`. Ranges/defaults are EMPIRICAL (observed in real templates), not Apple-documented limits. Keyed by FxPlug pluginUUID per `engine/src/compositor/filters/registry.ts`._