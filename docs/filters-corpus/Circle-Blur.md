# Circle Blur

- **pluginUUID:** `8B8B4934-BD85-43BC-A63B-D7A01C4C0191`
- **PAE class:** `Circle Blur`
- **Display names seen:** Circle Blur (54), OSC (2), Circle Blur copy (1), OSC 15 (1), OSC 14 (1)
- **Engine status:** ❌ not implemented
- **Corpus usage:** 72 instances across 19 files

## Parameters

| Parameter | Type | Default | Observed range | Keyframed | Seen |
|---|---|---|---|---|---|
| Center | point2D (X,Y) | `—` | — | — | 72 |
| Amount | float | `10` | [0 … 100] | 1 | 72 |
| Radius | float | `400` | [25 … 2594] | — | 72 |
| Crop | bool (0/1) | `1` | [0 … 1] | — | 72 |
| Mix | menu/enum (int) | `1` | [1 … 1] | 1 | 72 |
| Publish OSC | bool (0/1) | `0` | [0 … 1] | — | 72 |
| Flip | float | `0` | [0 … 0] | — | 66 |
| Input Points | menu/enum (int) | `1` | [1 … 1] | — | 66 |

---
_Auto-generated from the Motion corpus (`~/motr-collection`) by `docs/filters-corpus/gen_fct_filter_docs.py`. Ranges/defaults are EMPIRICAL (observed in real templates), not Apple-documented limits. Keyed by FxPlug pluginUUID per `engine/src/compositor/filters/registry.ts`._