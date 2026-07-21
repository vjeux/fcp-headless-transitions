# Glass Distortion

- **pluginUUID:** `ACDB3E3B-DEEA-4973-B918-2E355750B995`
- **PAE class:** `Glass Distortion`
- **Display names seen:** Glass Distortion (3)
- **Engine status:** ❌ not implemented
- **Corpus usage:** 3 instances across 3 files

## Parameters

| Parameter | Type | Default | Observed range | Keyframed | Seen |
|---|---|---|---|---|---|
| Center | float | `—` | — | — | 3 |
| Distort Input | float | `0` | [0 … 3099128836] | — | 3 |
| Fit | menu/enum (int) | `1` | [1 … 1] | — | 3 |
| X Scale | menu/enum (int) | `1` | [1 … 1] | — | 3 |
| Y Scale | menu/enum (int) | `1` | [1 … 1] | — | 3 |
| Amount | menu/enum (int) | `110` | [110 … 110] | 2 | 3 |
| Softness | float | `0` | [0 … 0] | — | 3 |
| Mix | menu/enum (int) | `1` | [1 … 1] | 1 | 3 |
| Flip | float | `0` | [0 … 0] | — | 3 |
| Input Points | menu/enum (int) | `1` | [1 … 1] | — | 3 |
| Publish OSC | float | `0` | [0 … 0] | — | 3 |

---
_Auto-generated from the Motion corpus (`~/motr-collection`) by `docs/filters-corpus/gen_fct_filter_docs.py`. Ranges/defaults are EMPIRICAL (observed in real templates), not Apple-documented limits. Keyed by FxPlug pluginUUID per `engine/src/compositor/filters/registry.ts`._