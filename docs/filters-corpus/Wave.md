# Wave

- **pluginUUID:** `C67E6AD5-C16B-40CE-AA72-A4F88EDDD990`
- **PAE class:** `Wave`
- **Display names seen:** Wave (40), Wave copy (19), Wave copy 4 (1), Wave  (1)
- **Engine status:** ❌ not implemented
- **Corpus usage:** 61 instances across 33 files

## Parameters

| Parameter | Type | Default | Observed range | Keyframed | Seen |
|---|---|---|---|---|---|
| Amplitude | float | `10` | [0 … 468.8] | 3 | 61 |
| Wavelength | float | `100` | [4 … 500] | 1 | 61 |
| Offset | float | `100` | [-147 … 500] | 2 | 61 |
| Vertical | bool (0/1) | `0` | [0 … 1] | — | 60 |
| Repeat Edges | bool (0/1) | `1` | [0 … 1] | — | 60 |
| Mix | menu/enum (int) | `1` | [1 … 1] | — | 60 |
| Flip | float | `0` | [0 … 0] | — | 52 |
| Input Points | menu/enum (int) | `1` | [1 … 1] | — | 52 |

---
_Auto-generated from the Motion corpus (`~/motr-collection`) by `docs/filters-corpus/gen_fct_filter_docs.py`. Ranges/defaults are EMPIRICAL (observed in real templates), not Apple-documented limits. Keyed by FxPlug pluginUUID per `engine/src/compositor/filters/registry.ts`._