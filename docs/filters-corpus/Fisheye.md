# Fisheye

- **pluginUUID:** `C1278154-B061-453F-8BDE-9F70AB2E6066`
- **PAE class:** `Fisheye`
- **Display names seen:** Fisheye (69), Fisheye copy (1)
- **Engine status:** ✅ implemented
- **Corpus usage:** 70 instances across 41 files

## Parameters

| Parameter | Type | Default | Observed range | Keyframed | Seen |
|---|---|---|---|---|---|
| Radius | float | `1` | [0.23 … 2] | 2 | 70 |
| Amount | menu/enum (int) | `15` | [0 … 4] | 67 | 70 |
| Center | point2D (X,Y) | `—` | — | 28 | 70 |
| Mix | bool (0/1) | `1` | [0 … 1] | — | 70 |
| Flip | float | `0` | [0 … 0] | — | 52 |
| Input Points | menu/enum (int) | `1` | [1 … 1] | — | 52 |
| Publish OSC | float | `0` | [0 … 0] | — | 52 |

---
_Auto-generated from the Motion corpus (`~/motr-collection`) by `docs/filters-corpus/gen_fct_filter_docs.py`. Ranges/defaults are EMPIRICAL (observed in real templates), not Apple-documented limits. Keyed by FxPlug pluginUUID per `engine/src/compositor/filters/registry.ts`._