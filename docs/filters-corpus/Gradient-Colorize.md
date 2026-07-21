# Gradient Colorize

- **pluginUUID:** `FB917FD2-68DF-4BE7-A313-82124F6DE776`
- **PAE class:** `Gradient Colorize`
- **Display names seen:** Gradient Colorize (31), Gradient Colorize copy (4), Gradient Colorize left (1), Gradient Colorize right (1), flagWave_h (1)
- **Engine status:** ❌ not implemented
- **Corpus usage:** 41 instances across 26 files

## Parameters

| Parameter | Type | Default | Observed range | Keyframed | Seen |
|---|---|---|---|---|---|
| Gradient | group (RGB, Opacity) | `—` | — | 1 | 41 |
| Mix | menu/enum (int) | `1` | [1 … 1] | 3 | 39 |
| Offset | float | `0` | [0 … 28.27] | — | 28 |
| Repeats | menu/enum (int) | `1` | [1 … 20] | — | 28 |
| Repeat Method | bool (0/1) | `1` | [0 … 1] | — | 26 |
| Map Channel | float | `0` | [0 … 0] | — | 26 |
| Saturation | menu/enum (int) | `1` | [1 … 1] | — | 26 |
| Flip | bool (0/1) | `0` | [0 … 1] | — | 25 |
| Input Points | bool (0/1) | `1` | [0 … 1] | — | 25 |

---
_Auto-generated from the Motion corpus (`~/motr-collection`) by `docs/filters-corpus/gen_fct_filter_docs.py`. Ranges/defaults are EMPIRICAL (observed in real templates), not Apple-documented limits. Keyed by FxPlug pluginUUID per `engine/src/compositor/filters/registry.ts`._