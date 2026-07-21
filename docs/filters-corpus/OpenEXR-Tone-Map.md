# OpenEXR Tone Map

- **pluginUUID:** `ECA5A044-91D9-46F2-B03A-A4D411EA1D16`
- **PAE class:** `OpenEXR Tone Map`
- **Display names seen:** OpenEXR Tone Map (45), OpenEXR Tone Map applied (1)
- **Engine status:** ❌ not implemented
- **Corpus usage:** 46 instances across 16 files

## Parameters

| Parameter | Type | Default | Observed range | Keyframed | Seen |
|---|---|---|---|---|---|
| Exposure | float | `0` | [-10 … 2.5] | — | 46 |
| Defog | float | `0` | [0 … 0] | — | 45 |
| Knee Low | float | `0` | [0.3 … 3] | — | 45 |
| Knee High | float | `5` | [3.5 … 7.5] | — | 45 |
| Mix | menu/enum (int) | `1` | [1 … 1] | 2 | 45 |
| Flip | float | `0` | [0 … 0] | — | 45 |
| Input Points | menu/enum (int) | `1` | [1 … 1] | — | 45 |

---
_Auto-generated from the Motion corpus (`~/motr-collection`) by `docs/filters-corpus/gen_fct_filter_docs.py`. Ranges/defaults are EMPIRICAL (observed in real templates), not Apple-documented limits. Keyed by FxPlug pluginUUID per `engine/src/compositor/filters/registry.ts`._