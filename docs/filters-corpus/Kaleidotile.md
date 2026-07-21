# Kaleidotile

- **pluginUUID:** `7438BC75-716C-4D49-9613-7EE2834B9B7B`
- **PAE class:** `Kaleidotile`
- **Display names seen:** Kaleidotile (55), Kaleidotile copy (5), kt (3), rect5ctl (3), rect4ctl (3)
- **Engine status:** ❌ not implemented
- **Corpus usage:** 78 instances across 52 files

## Parameters

| Parameter | Type | Default | Observed range | Keyframed | Seen |
|---|---|---|---|---|---|
| Width | float | `64` | [28 … 4072] | 4 | 78 |
| Height | float | `64` | [64 … 4000] | 1 | 78 |
| Angle | float | `0` | [0 … 6.278] | — | 76 |
| Mix | bool (0/1) | `1` | [0 … 1] | 2 | 75 |
| Center | point2D (X,Y) | `—` | — | — | 74 |
| Publish OSC | bool (0/1) | `0` | [0 … 1] | — | 68 |
| Flip | float | `0` | [0 … 0] | — | 51 |
| Input Points | menu/enum (int) | `1` | [1 … 1] | — | 51 |

---
_Auto-generated from the Motion corpus (`~/motr-collection`) by `docs/filters-corpus/gen_fct_filter_docs.py`. Ranges/defaults are EMPIRICAL (observed in real templates), not Apple-documented limits. Keyed by FxPlug pluginUUID per `engine/src/compositor/filters/registry.ts`._