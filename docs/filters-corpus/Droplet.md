# Droplet

- **pluginUUID:** `0ACFAE37-4FAF-4D60-A50C-46E422EE0CD7`
- **PAE class:** `Droplet`
- **Display names seen:** Droplet (8), Droplet 2 (4), Droplet 1 (4), Droplet 4 (3), Droplet 3 (3)
- **Engine status:** ❌ not implemented
- **Corpus usage:** 35 instances across 8 files

## Parameters

| Parameter | Type | Default | Observed range | Keyframed | Seen |
|---|---|---|---|---|---|
| Radius | float | `—` | — | 35 | 35 |
| Thickness | float | `40` | [30 … 100] | 17 | 31 |
| Height | float | `30` | [-50 … 50] | 18 | 29 |
| Mix | float | `1` | [0.9 … 1] | 9 | 27 |
| Crop | bool (0/1) | `0` | [0 … 1] | — | 19 |
| Flip | bool (0/1) | `0` | [0 … 1] | — | 19 |
| Input Points | bool (0/1) | `1` | [0 … 1] | — | 19 |
| Center | point2D (X,Y) | `—` | — | 1 | 18 |
| Publish OSC | float | `0` | [0 … 0] | — | 18 |

---
_Auto-generated from the Motion corpus (`~/motr-collection`) by `docs/filters-corpus/gen_fct_filter_docs.py`. Ranges/defaults are EMPIRICAL (observed in real templates), not Apple-documented limits. Keyed by FxPlug pluginUUID per `engine/src/compositor/filters/registry.ts`._