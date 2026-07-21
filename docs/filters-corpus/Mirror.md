# Mirror

- **pluginUUID:** `E1134541-27A1-45CD-972B-AD61D9528316`
- **PAE class:** `Mirror`
- **Display names seen:** Mirror (11), Mirror 2 (7), Mirror 1 (7), Mirror 3 (6), Bottom (3)
- **Engine status:** ❌ not implemented
- **Corpus usage:** 56 instances across 14 files

## Parameters

| Parameter | Type | Default | Observed range | Keyframed | Seen |
|---|---|---|---|---|---|
| Center | point2D (X,Y) | `—` | — | 15 | 56 |
| Angle | float | `0` | [0 … 4.712] | — | 56 |
| Repeat Border Pixels | menu/enum (int) | `1` | [1 … 1] | — | 56 |
| Mix | bool (0/1) | `1` | [0 … 1] | 1 | 56 |
| Flip | float | `0` | [0 … 0] | — | 51 |
| Input Points | menu/enum (int) | `1` | [1 … 1] | — | 51 |
| Publish OSC | float | `0` | [0 … 0] | — | 51 |

---
_Auto-generated from the Motion corpus (`~/motr-collection`) by `docs/filters-corpus/gen_fct_filter_docs.py`. Ranges/defaults are EMPIRICAL (observed in real templates), not Apple-documented limits. Keyed by FxPlug pluginUUID per `engine/src/compositor/filters/registry.ts`._