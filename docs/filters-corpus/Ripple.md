# Ripple

- **pluginUUID:** `F6D546C6-5F27-4E9D-9814-960565D6F403`
- **PAE class:** `Ripple`
- **Display names seen:** Ripple (5)
- **Engine status:** ❌ not implemented
- **Corpus usage:** 5 instances across 5 files

## Parameters

| Parameter | Type | Default | Observed range | Keyframed | Seen |
|---|---|---|---|---|---|
| Amplitude | menu/enum (int) | `50` | [0 … 4] | 1 | 5 |
| Center | point2D (X,Y) | `—` | — | — | 4 |
| Mix | menu/enum (int) | `1` | [1 … 1] | — | 4 |
| Publish OSC | bool (0/1) | `0` | [0 … 1] | — | 4 |
| Crop | float | `0` | [0 … 0] | — | 3 |
| Flip | float | `0` | [0 … 0] | — | 3 |
| Input Points | menu/enum (int) | `1` | [1 … 1] | — | 3 |

---
_Auto-generated from the Motion corpus (`~/motr-collection`) by `docs/filters-corpus/gen_fct_filter_docs.py`. Ranges/defaults are EMPIRICAL (observed in real templates), not Apple-documented limits. Keyed by FxPlug pluginUUID per `engine/src/compositor/filters/registry.ts`._