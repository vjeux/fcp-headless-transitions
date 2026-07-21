# Sphere

- **pluginUUID:** `1E78D3E3-63AC-46E3-99F4-014129B9ECCC`
- **PAE class:** `Sphere`
- **Display names seen:** Sphere (16), On Screen Control (1), On Screen Controls (1)
- **Engine status:** ❌ not implemented
- **Corpus usage:** 18 instances across 16 files

## Parameters

| Parameter | Type | Default | Observed range | Keyframed | Seen |
|---|---|---|---|---|---|
| Radius | float | `400` | [15 … 915] | — | 18 |
| Mix | menu/enum (int) | `1` | [1 … 1] | — | 16 |
| Center | point2D (X,Y) | `—` | — | — | 13 |
| Crop | bool (0/1) | `0` | [0 … 1] | — | 13 |
| Publish OSC | bool (0/1) | `0` | [0 … 1] | — | 11 |
| Flip | float | `0` | [0 … 0] | — | 10 |
| Input Points | menu/enum (int) | `1` | [1 … 1] | — | 10 |

---
_Auto-generated from the Motion corpus (`~/motr-collection`) by `docs/filters-corpus/gen_fct_filter_docs.py`. Ranges/defaults are EMPIRICAL (observed in real templates), not Apple-documented limits. Keyed by FxPlug pluginUUID per `engine/src/compositor/filters/registry.ts`._