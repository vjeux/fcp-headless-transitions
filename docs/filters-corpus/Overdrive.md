# Overdrive

- **pluginUUID:** `37C59CC3-8FD8-4460-A17E-71B32254FAD7`
- **PAE class:** `Overdrive`
- **Display names seen:** Overdrive (37), Glow (9)
- **Engine status:** ❌ not implemented
- **Corpus usage:** 46 instances across 37 files

## Parameters

| Parameter | Type | Default | Observed range | Keyframed | Seen |
|---|---|---|---|---|---|
| Intensity | float | `10` | [0 … 100] | — | 46 |
| Size | float | `30` | [1 … 32] | — | 46 |
| Rotation | float | `0.0068538919452009435` | [0 … 6.283] | — | 46 |
| Inner Glow | color (RGB/RGBA) | `—` | — | — | 46 |
| Outer Glow | color (RGB/RGBA) | `—` | — | — | 46 |
| Clip to White | bool (0/1) | `0` | [0 … 1] | — | 46 |
| Crop | float | `0` | [0 … 0] | — | 46 |
| Mix | float | `1` | [0 … 0.7] | 12 | 46 |
| Flip | float | `0` | [0 … 0] | — | 46 |
| Input Points | menu/enum (int) | `1` | [1 … 1] | — | 46 |

---
_Auto-generated from the Motion corpus (`~/motr-collection`) by `docs/filters-corpus/gen_fct_filter_docs.py`. Ranges/defaults are EMPIRICAL (observed in real templates), not Apple-documented limits. Keyed by FxPlug pluginUUID per `engine/src/compositor/filters/registry.ts`._