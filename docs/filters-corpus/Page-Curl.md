# Page Curl

- **pluginUUID:** `BA8D0B63-2F01-4DA6-9751-56D308A28F98`
- **PAE class:** `Page Curl`
- **Display names seen:** Page Curl (74), Page Curl copy (14), Page Curl 1 (13), Page Curl 2 (12), Animate (3)
- **Engine status:** ❌ not implemented
- **Corpus usage:** 127 instances across 50 files

## Parameters

| Parameter | Type | Default | Observed range | Keyframed | Seen |
|---|---|---|---|---|---|
| Animate | bool (0/1) | `1` | [0 … 1] | — | 127 |
| Percent | float | `50` | [12 … 100] | 87 | 127 |
| Angle | float | `-0.31415926535897931` | [-7.052 … 4.102] | 7 | 126 |
| Mix | menu/enum (int) | `1` | [1 … 1] | 1 | 126 |
| Rotation | float | `-0.41887902047863912` | [-0.7854 … 5.84] | 4 | 121 |
| Radius | float | `20` | [1 … 100] | 4 | 121 |
| Highlight Color | color (RGB/RGBA) | `—` | — | — | 121 |
| Fade Out | float | `20` | [0 … 41] | 1 | 120 |
| Shadow | float | `50` | [0 … 100] | — | 120 |
| Back Color | color (RGB/RGBA) | `—` | — | — | 118 |
| Direction | bool (0/1) | `0` | [0 … 1] | — | 114 |
| Publish OSC | bool (0/1) | `0` | [0 … 1] | — | 71 |
| Flip | float | `0` | [0 … 0] | — | 66 |
| Input Points | menu/enum (int) | `1` | [1 … 1] | — | 66 |

---
_Auto-generated from the Motion corpus (`~/motr-collection`) by `docs/filters-corpus/gen_fct_filter_docs.py`. Ranges/defaults are EMPIRICAL (observed in real templates), not Apple-documented limits. Keyed by FxPlug pluginUUID per `engine/src/compositor/filters/registry.ts`._