# Channel Blur

- **pluginUUID:** `6C0F1215-6017-44F0-82C8-1B265FDC16CB`
- **PAE class:** `Channel Blur`
- **Display names seen:** Channel Blur (225), Channel Blur copy (2), Channel Blur Source (1)
- **Engine status:** ❌ not implemented
- **Corpus usage:** 228 instances across 185 files

## Parameters

| Parameter | Type | Default | Observed range | Keyframed | Seen |
|---|---|---|---|---|---|
| Amount | float | `4` | [0 … 750] | 6 | 228 |
| Blur Red | bool (0/1) | `1` | [0 … 1] | — | 228 |
| Blur Green | float | `1` | [0 … 0] | — | 228 |
| Blur Blue | bool (0/1) | `1` | [0 … 1] | — | 228 |
| Blur Alpha | bool (0/1) | `1` | [0 … 1] | — | 228 |
| Horizontal | float | `100` | [0 … 100] | — | 228 |
| Vertical | float | `100` | [0 … 100] | — | 228 |
| Crop | bool (0/1) | `0` | [0 … 1] | — | 228 |
| Mix | float | `1` | [0.4 … 1] | 214 | 228 |
| 360° Aware | float | `0` | [0 … 0] | — | 95 |
| Flip | float | `0` | [0 … 0] | — | 95 |
| Input Points | menu/enum (int) | `1` | [1 … 1] | — | 95 |

---
_Auto-generated from the Motion corpus (`~/motr-collection`) by `docs/filters-corpus/gen_fct_filter_docs.py`. Ranges/defaults are EMPIRICAL (observed in real templates), not Apple-documented limits. Keyed by FxPlug pluginUUID per `engine/src/compositor/filters/registry.ts`._