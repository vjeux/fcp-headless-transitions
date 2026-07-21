# Line Screen

- **pluginUUID:** `57174A04-8434-4179-A8EB-66C88B63F308`
- **PAE class:** `Line Screen`
- **Display names seen:** Line Screen (48)
- **Engine status:** ❌ not implemented
- **Corpus usage:** 48 instances across 5 files

## Parameters

| Parameter | Type | Default | Observed range | Keyframed | Seen |
|---|---|---|---|---|---|
| Center | group (Y) | `—` | — | — | 48 |
| Angle | float | `0.49916416607037828` | [0.4992 … 1.571] | — | 48 |
| Scale | menu/enum (int) | `10` | [10 … 22] | — | 48 |
| Skew | float | `0` | [0 … 0.21] | — | 48 |
| Stretch | float | `0` | [0 … 0.34] | — | 48 |
| Contrast | float | `0.5` | [0 … 0.5] | — | 48 |
| Mix | float | `1` | [0.5 … 1] | — | 48 |
| Flip | bool (0/1) | `0` | [0 … 1] | — | 46 |
| Input Points | bool (0/1) | `1` | [0 … 1] | — | 46 |
| Publish OSC | float | `0` | [0 … 0] | — | 2 |

---
_Auto-generated from the Motion corpus (`~/motr-collection`) by `docs/filters-corpus/gen_fct_filter_docs.py`. Ranges/defaults are EMPIRICAL (observed in real templates), not Apple-documented limits. Keyed by FxPlug pluginUUID per `engine/src/compositor/filters/registry.ts`._