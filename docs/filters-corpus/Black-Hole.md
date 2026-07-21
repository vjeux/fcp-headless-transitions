# Black Hole

- **pluginUUID:** `1A32EFEF-6687-401B-A078-300A7AE8F621`
- **PAE class:** `Black Hole`
- **Display names seen:** Black Hole (9), Black Hole In (2), infoOSC 2 (1), reflectX (1), Black Hole 1 (1)
- **Engine status:** ✅ implemented
- **Corpus usage:** 17 instances across 11 files

## Parameters

| Parameter | Type | Default | Observed range | Keyframed | Seen |
|---|---|---|---|---|---|
| Amount | float | `150` | [0 … 1000] | 6 | 17 |
| Center | point2D (X,Y) | `—` | — | — | 16 |
| Mix | bool (0/1) | `1` | [0 … 1] | — | 16 |
| Publish OSC | bool (0/1) | `0` | [0 … 1] | — | 13 |
| Flip | float | `0` | [0 … 0] | — | 10 |
| Input Points | menu/enum (int) | `1` | [1 … 1] | — | 10 |

---
_Auto-generated from the Motion corpus (`~/motr-collection`) by `docs/filters-corpus/gen_fct_filter_docs.py`. Ranges/defaults are EMPIRICAL (observed in real templates), not Apple-documented limits. Keyed by FxPlug pluginUUID per `engine/src/compositor/filters/registry.ts`._