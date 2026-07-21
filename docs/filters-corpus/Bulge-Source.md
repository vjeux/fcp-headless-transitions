# Bulge Source

- **pluginUUID:** `6AFD20E9-70D0-48F2-A5DD-97FC7B3E2BC4`
- **PAE class:** `Bulge Source`
- **Display names seen:** Bulge (209), Distort 01 (10), Pointer OSC (8), Fix (1), Bulge copy (1)
- **Engine status:** ❌ not implemented
- **Corpus usage:** 236 instances across 204 files

## Parameters

| Parameter | Type | Default | Observed range | Keyframed | Seen |
|---|---|---|---|---|---|
| Amount | float | `300` | [0 … 14712] | 10 | 235 |
| Center | point2D (X,Y) | `—` | — | 2 | 234 |
| Scale | float | `0.5` | [-1.34 … 4.424] | 187 | 234 |
| Mix | bool (0/1) | `1` | [0 … 1] | 3 | 234 |
| Crop | bool (0/1) | `0` | [0 … 1] | — | 233 |
| Publish OSC | bool (0/1) | `0` | [0 … 1] | — | 227 |
| Flip | float | `0` | [0 … 0] | — | 206 |
| Input Points | menu/enum (int) | `1` | [1 … 1] | — | 206 |

---
_Auto-generated from the Motion corpus (`~/motr-collection`) by `docs/filters-corpus/gen_fct_filter_docs.py`. Ranges/defaults are EMPIRICAL (observed in real templates), not Apple-documented limits. Keyed by FxPlug pluginUUID per `engine/src/compositor/filters/registry.ts`._