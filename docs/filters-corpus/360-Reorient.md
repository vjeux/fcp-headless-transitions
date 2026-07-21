# 360° Reorient

- **pluginUUID:** `E61FE95E-0108-47DA-8F29-3CB3C47428EF`
- **PAE class:** `360° Reorient`
- **Display names seen:** 360° Reorient (5), DistortionOrient (1)
- **Engine status:** ✅ implemented
- **Corpus usage:** 6 instances across 4 files

## Parameters

| Parameter | Type | Default | Observed range | Keyframed | Seen |
|---|---|---|---|---|---|
| Tilt (X) | float | `0` | [-1.571 … 0] | — | 6 |
| Pan (Y) | float | `0` | [0 … 3.142] | — | 6 |
| Roll (Z) | float | `0` | [0 … 3.142] | — | 6 |
| Mix | menu/enum (int) | `1` | [1 … 1] | — | 6 |
| Flip | float | `0` | [0 … 0] | — | 2 |
| Input Points | menu/enum (int) | `1` | [1 … 1] | — | 2 |

---
_Auto-generated from the Motion corpus (`~/motr-collection`) by `docs/filters-corpus/gen_fct_filter_docs.py`. Ranges/defaults are EMPIRICAL (observed in real templates), not Apple-documented limits. Keyed by FxPlug pluginUUID per `engine/src/compositor/filters/registry.ts`._