# Extrude

- **pluginUUID:** `85C01B33-3560-45E5-959E-5C265B0A8977`
- **PAE class:** `Extrude`
- **Display names seen:** Extrude (91), Extrude  copy (20), Direction (2), Extrude copy (2), Extrude  (1)
- **Engine status:** ❌ not implemented
- **Corpus usage:** 120 instances across 60 files

## Parameters

| Parameter | Type | Default | Observed range | Keyframed | Seen |
|---|---|---|---|---|---|
| Distance | float | `50` | [0 … 500] | 3 | 120 |
| Gradient | group (RGB, Opacity) | `—` | — | — | 120 |
| Angle | float | `0.78539816339744828` | [0 … 6.265] | 1 | 119 |
| Extrude Style | bool (0/1) | `0` | [0 … 1] | — | 114 |
| Mix | bool (0/1) | `1` | [0 … 1] | 1 | 94 |
| Clipping | float | `0` | [0 … 99] | 4 | 92 |
| Back Brightness | menu/enum (int) | `0.29999999999999999` | [0 … 2] | — | 92 |
| Front Brightness | float | `0.69999999999999996` | [0 … 1.42] | — | 91 |
| Back Size | float | `1` | [0.78 … 1] | 1 | 90 |
| Face Brightness | menu/enum (int) | `1` | [0 … 8] | — | 89 |
| Flip | bool (0/1) | `0` | [0 … 1] | — | 68 |
| Input Points | bool (0/1) | `1` | [0 … 1] | — | 68 |
| Publish OSC | bool (0/1) | `0` | [0 … 1] | — | 68 |

---
_Auto-generated from the Motion corpus (`~/motr-collection`) by `docs/filters-corpus/gen_fct_filter_docs.py`. Ranges/defaults are EMPIRICAL (observed in real templates), not Apple-documented limits. Keyed by FxPlug pluginUUID per `engine/src/compositor/filters/registry.ts`._