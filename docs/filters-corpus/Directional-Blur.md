# Directional Blur

- **pluginUUID:** `2E7B1340-5D4F-4015-8AA0-53BEB9F2CA52`
- **PAE class:** `Directional Blur`
- **Display names seen:** Directional Blur (217), Directional Blur copy (41), Amount (20), Directional Blur copy 1 (15), Directional Blur 1 (10)
- **Engine status:** ✅ implemented
- **Corpus usage:** 456 instances across 187 files

## Parameters

| Parameter | Type | Default | Observed range | Keyframed | Seen |
|---|---|---|---|---|---|
| Amount | float | `7` | [0 … 4000] | 254 | 456 |
| Angle | float | `0` | [0 … 6.283] | 7 | 442 |
| Crop | bool (0/1) | `0` | [0 … 1] | — | 296 |
| Mix | bool (0/1) | `1` | [0 … 1] | 2 | 294 |
| OSC Center | float | `—` | — | — | 280 |
| Publish OSC | bool (0/1) | `0` | [0 … 1] | — | 124 |
| Flip | bool (0/1) | `0` | [0 … 1] | — | 123 |
| Input Points | bool (0/1) | `1` | [0 … 1] | — | 123 |

---
_Auto-generated from the Motion corpus (`~/motr-collection`) by `docs/filters-corpus/gen_fct_filter_docs.py`. Ranges/defaults are EMPIRICAL (observed in real templates), not Apple-documented limits. Keyed by FxPlug pluginUUID per `engine/src/compositor/filters/registry.ts`._