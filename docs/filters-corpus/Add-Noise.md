# Add Noise

- **pluginUUID:** `C423A28F-C016-4133-B120-22FF2E9A7862`
- **PAE class:** `Add Noise`
- **Display names seen:** Add Noise (122), Add Noise copy (53), Noise (6), Add Noise Source (4), Grain (2)
- **Engine status:** ❌ not implemented
- **Corpus usage:** 188 instances across 123 files

## Parameters

| Parameter | Type | Default | Observed range | Keyframed | Seen |
|---|---|---|---|---|---|
| Random Seed | float | `25` | [0 … 500] | — | 341 |
| Mix | float | `1` | [0.0043 … 1] | 35 | 179 |
| Amount | menu/enum (int) | `0.33000000000000002` | [0 … 4] | 1 | 170 |
| Blend Mode | menu/enum (int) | `0` | [0 … 17] | — | 166 |
| Autoanimate | bool (0/1) | `1` | [0 … 1] | — | 166 |
| Monochrome | bool (0/1) | `0` | [0 … 1] | — | 164 |
| Type | menu/enum (int) | `1` | [0 … 4] | — | 163 |
| Flip | bool (0/1) | `0` | [0 … 1] | — | 155 |
| Input Points | bool (0/1) | `1` | [0 … 1] | — | 155 |

---
_Auto-generated from the Motion corpus (`~/motr-collection`) by `docs/filters-corpus/gen_fct_filter_docs.py`. Ranges/defaults are EMPIRICAL (observed in real templates), not Apple-documented limits. Keyed by FxPlug pluginUUID per `engine/src/compositor/filters/registry.ts`._