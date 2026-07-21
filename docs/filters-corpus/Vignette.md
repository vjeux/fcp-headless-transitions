# Vignette

- **pluginUUID:** `EB96FF9E-5863-4770-B7B5-65CB9BBF8E3B`
- **PAE class:** `Vignette`
- **Display names seen:** Vignette (53), Vignette copy (1)
- **Engine status:** ✅ implemented
- **Corpus usage:** 54 instances across 48 files

## Parameters

| Parameter | Type | Default | Observed range | Keyframed | Seen |
|---|---|---|---|---|---|
| Mix | float | `1` | [0.0312 … 1] | 1 | 47 |
| Darken | bool (0/1) | `0.29999999999999999` | [0 … 1] | — | 44 |
| Falloff | float | `0.5` | [0.2129 … 1] | — | 41 |
| Size | float | `0.59999999999999998` | [0.4799 … 1.353] | — | 40 |
| Blur Amount | float | `4` | [0 … 47] | — | 36 |
| Saturation | float | `0.29999999999999999` | [-0.27 … 1] | — | 33 |
| Center | point2D (X,Y) | `—` | — | — | 32 |
| Prescale Input | float | `0` | [0 … 0] | — | 29 |
| Flip | bool (0/1) | `0` | [0 … 1] | — | 26 |
| Input Points | bool (0/1) | `1` | [0 … 1] | — | 26 |
| Publish OSC | float | `0` | [0 … 0] | — | 23 |

---
_Auto-generated from the Motion corpus (`~/motr-collection`) by `docs/filters-corpus/gen_fct_filter_docs.py`. Ranges/defaults are EMPIRICAL (observed in real templates), not Apple-documented limits. Keyed by FxPlug pluginUUID per `engine/src/compositor/filters/registry.ts`._