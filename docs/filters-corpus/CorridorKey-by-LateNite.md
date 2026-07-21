# CorridorKey by LateNite

- **pluginUUID:** `D29F6B10-4F3A-4C5E-B611-7A2E8D4C9F08`
- **PAE class:** `CorridorKey by LateNite`
- **Display names seen:** CorridorKey by LateNite (1)
- **Engine status:** ❌ not implemented
- **Corpus usage:** 1 instances across 1 files

## Parameters

| Parameter | Type | Default | Observed range | Keyframed | Seen |
|---|---|---|---|---|---|
| Analysis Data | float | `—` | — | — | 1 |
| Subject Points | float | `—` | — | — | 1 |
| Settings | group (Quality, Screen Colour, Upscale Method, Output, Hint, Show Subject Marker) | `—` | — | — | 1 |
| Interior Detail | group (Source Passthrough, Edge Erode, Edge Blur) | `—` | — | — | 1 |
| Matte | group (Black Point, White Point, Matte Erode, Softness, Gamma, Auto Despeckle) | `—` | — | — | 1 |
| Edge & Spill | group (Despill Strength, Spill Method) | `—` | — | — | 1 |
| Edge Refinement | group (Light Wrap, Wrap Strength, Wrap Radius, Edge Decontaminate, Decontam. Strength) | `—` | — | — | 1 |
| Temporal Stability | group (Reduce Edge Flicker, Stability Strength) | `—` | — | — | 1 |
| Mix | menu/enum (int) | `1` | [1 … 1] | — | 1 |
| Flip | float | `0` | [0 … 0] | — | 1 |
| Input Points | menu/enum (int) | `1` | [1 … 1] | — | 1 |
| Publish OSC | menu/enum (int) | `0` | [1 … 1] | — | 1 |

---
_Auto-generated from the Motion corpus (`~/motr-collection`) by `docs/filters-corpus/gen_fct_filter_docs.py`. Ranges/defaults are EMPIRICAL (observed in real templates), not Apple-documented limits. Keyed by FxPlug pluginUUID per `engine/src/compositor/filters/registry.ts`._