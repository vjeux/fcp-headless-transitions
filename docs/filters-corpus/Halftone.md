# Halftone

- **pluginUUID:** `10A46FDA-13E9-4167-B8AE-1A7204EB5139`
- **PAE class:** `Halftone`
- **Display names seen:** Halftone (17), Noir (1), ht (1)
- **Engine status:** ❌ not implemented
- **Corpus usage:** 19 instances across 17 files

## Parameters

| Parameter | Type | Default | Observed range | Keyframed | Seen |
|---|---|---|---|---|---|
| Scale | float | `6` | [2 … 35] | — | 19 |
| Contrast | float | `0.5` | [0.41 … 0.99] | — | 19 |
| Center | float | `—` | — | — | 18 |
| Angle | float | `0.78539816339744828` | [0.3491 … 0.8203] | — | 18 |
| Mix | bool (0/1) | `1` | [0 … 1] | 3 | 18 |
| Flip | float | `0` | [0 … 0] | — | 14 |
| Input Points | menu/enum (int) | `1` | [1 … 1] | — | 14 |
| Publish OSC | float | `0` | [0 … 0] | — | 14 |

---
_Auto-generated from the Motion corpus (`~/motr-collection`) by `docs/filters-corpus/gen_fct_filter_docs.py`. Ranges/defaults are EMPIRICAL (observed in real templates), not Apple-documented limits. Keyed by FxPlug pluginUUID per `engine/src/compositor/filters/registry.ts`._