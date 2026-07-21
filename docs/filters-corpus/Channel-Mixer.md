# Channel Mixer

- **pluginUUID:** `B2E0DE39-119F-4AD6-8796-C18BF8FE27B8`
- **PAE class:** `Channel Mixer`
- **Display names seen:** Channel Mixer (382), Channel Mixer copy (3), mixer-green-blue2green (1), mixer-red (1)
- **Engine status:** ✅ implemented
- **Corpus usage:** 387 instances across 102 files

## Parameters

| Parameter | Type | Default | Observed range | Keyframed | Seen |
|---|---|---|---|---|---|
| Allow Mono > 1 | menu/enum (int) | `1` | [1 … 1] | — | 387 |
| Include Alpha | bool (0/1) | `0` | [0 … 1] | — | 387 |
| Red Output | group (Red - Blue, Red - Red, Red - Green, Red - Alpha) | `—` | — | 12 | 386 |
| Green Output | group (Green - Blue, Green - Red, Green - Green, Green - Alpha) | `—` | — | 12 | 386 |
| Blue Output | group (Blue - Green, Blue - Red, Blue - Blue, Blue - Alpha) | `—` | — | 12 | 386 |
| Alpha Output | group (Alpha - Alpha, Alpha - Red, Alpha - Green, Alpha - Blue) | `—` | — | 12 | 386 |
| Mix | menu/enum (int) | `1` | [1 … 1] | — | 386 |
| Monochrome | bool (0/1) | `0` | [0 … 1] | — | 374 |
| Flip | float | `0` | [0 … 0] | — | 372 |
| Input Points | menu/enum (int) | `1` | [1 … 1] | — | 372 |

---
_Auto-generated from the Motion corpus (`~/motr-collection`) by `docs/filters-corpus/gen_fct_filter_docs.py`. Ranges/defaults are EMPIRICAL (observed in real templates), not Apple-documented limits. Keyed by FxPlug pluginUUID per `engine/src/compositor/filters/registry.ts`._