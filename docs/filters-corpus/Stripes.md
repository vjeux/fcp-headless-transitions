# Stripes

- **pluginUUID:** `6968E691-88C2-4FAC-8864-674BD75C777F`
- **PAE class:** `Stripes`
- **Display names seen:** Stripes (25), Stripes 2 (1)
- **Engine status:** ❌ not implemented
- **Corpus usage:** 26 instances across 17 files

## Parameters

| Parameter | Type | Default | Observed range | Keyframed | Seen |
|---|---|---|---|---|---|
| Mix | menu/enum (int) | `1` | [1 … 1] | 11 | 24 |
| Center | point2D (X,Y) | `—` | — | — | 16 |
| Angle | float | `0` | [0 … 1.571] | — | 16 |
| Offset | float | `0` | [0 … 0] | — | 14 |
| Flip | float | `0` | [0 … 0] | — | 14 |
| Input Points | menu/enum (int) | `1` | [1 … 1] | — | 14 |
| Publish OSC | bool (0/1) | `0` | [0 … 1] | — | 14 |

---
_Auto-generated from the Motion corpus (`~/motr-collection`) by `docs/filters-corpus/gen_fct_filter_docs.py`. Ranges/defaults are EMPIRICAL (observed in real templates), not Apple-documented limits. Keyed by FxPlug pluginUUID per `engine/src/compositor/filters/registry.ts`._