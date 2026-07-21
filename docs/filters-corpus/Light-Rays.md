# Light Rays

- **pluginUUID:** `B074E0A5-BE6F-43B4-898A-AB0A44189CD9`
- **PAE class:** `Light Rays`
- **Display names seen:** Light Rays (112)
- **Engine status:** ❌ not implemented
- **Corpus usage:** 112 instances across 93 files

## Parameters

| Parameter | Type | Default | Observed range | Keyframed | Seen |
|---|---|---|---|---|---|
| Amount | float | `50` | [9 … 200] | 66 | 101 |
| Mix | bool (0/1) | `1` | [0 … 1] | 75 | 98 |
| Glow | float | `1.5` | [0.66 … 8] | 65 | 86 |
| Expansion | menu/enum (int) | `0.40000000000000002` | [0 … 2] | — | 83 |
| Center | point2D (X,Y) | `—` | — | 2 | 79 |
| Publish OSC | bool (0/1) | `0` | [0 … 1] | — | 77 |
| Clip to White | bool (0/1) | `0` | [0 … 1] | — | 76 |
| Flip | bool (0/1) | `0` | [0 … 1] | — | 75 |
| Input Points | bool (0/1) | `1` | [0 … 1] | — | 75 |

---
_Auto-generated from the Motion corpus (`~/motr-collection`) by `docs/filters-corpus/gen_fct_filter_docs.py`. Ranges/defaults are EMPIRICAL (observed in real templates), not Apple-documented limits. Keyed by FxPlug pluginUUID per `engine/src/compositor/filters/registry.ts`._