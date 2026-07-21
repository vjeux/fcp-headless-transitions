# Neon

- **pluginUUID:** `176021CD-2DFB-40FF-B3D4-9399F25C36C4`
- **PAE class:** `Neon`
- **Display names seen:** Neon (22), Glow (2)
- **Engine status:** ❌ not implemented
- **Corpus usage:** 24 instances across 23 files

## Parameters

| Parameter | Type | Default | Observed range | Keyframed | Seen |
|---|---|---|---|---|---|
| Outer Brightness | menu/enum (int) | `2` | [1 … 2] | — | 24 |
| Outer Glow | float | `45` | [1 … 200] | — | 24 |
| Inner Brightness | menu/enum (int) | `2` | [1 … 2] | — | 24 |
| Inner Glow | menu/enum (int) | `50` | [50 … 65] | 2 | 24 |
| Edge Intensity | menu/enum (int) | `10` | [10 … 15] | — | 24 |
| Mix | float | `1` | [0.05 … 1] | — | 24 |
| Flip | float | `0` | [0 … 0] | — | 24 |
| Input Points | menu/enum (int) | `1` | [1 … 1] | — | 24 |

---
_Auto-generated from the Motion corpus (`~/motr-collection`) by `docs/filters-corpus/gen_fct_filter_docs.py`. Ranges/defaults are EMPIRICAL (observed in real templates), not Apple-documented limits. Keyed by FxPlug pluginUUID per `engine/src/compositor/filters/registry.ts`._