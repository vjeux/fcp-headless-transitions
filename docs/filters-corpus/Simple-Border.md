# Simple Border

- **pluginUUID:** `8777A5DD-CDDA-4707-8454-D648943210D9`
- **PAE class:** `Simple Border`
- **Display names seen:** Simple Border (30), Simple Border 1 (16), Fill Colour (2), Outside 2nd Border (2), 2nd Border Filler  (2)
- **Engine status:** ❌ not implemented
- **Corpus usage:** 58 instances across 22 files

## Parameters

| Parameter | Type | Default | Observed range | Keyframed | Seen |
|---|---|---|---|---|---|
| Width | float | `10` | [0 … 1000] | — | 58 |
| Color | color (RGB/RGBA) | `—` | — | — | 57 |
| Mix | float | `1` | [0.3942 … 1] | — | 56 |
| Border Placement | menu/enum (int) | `0` | [0 … 2] | — | 55 |
| Flip | float | `0` | [0 … 0] | — | 20 |
| Input Points | menu/enum (int) | `1` | [1 … 1] | — | 20 |

---
_Auto-generated from the Motion corpus (`~/motr-collection`) by `docs/filters-corpus/gen_fct_filter_docs.py`. Ranges/defaults are EMPIRICAL (observed in real templates), not Apple-documented limits. Keyed by FxPlug pluginUUID per `engine/src/compositor/filters/registry.ts`._