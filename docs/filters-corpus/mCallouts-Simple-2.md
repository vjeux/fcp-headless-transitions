# mCallouts Simple 2

- **pluginUUID:** `A6CA56AA-0861-40BE-804D-F62FCC98B9C1`
- **PAE class:** `mCallouts Simple 2`
- **Display names seen:** mCallouts Simple 2 (34), mCallouts Simple 2 1 (16)
- **Engine status:** ❌ not implemented
- **Corpus usage:** 50 instances across 50 files

## Parameters

| Parameter | Type | Default | Observed range | Keyframed | Seen |
|---|---|---|---|---|---|
| Track | group (Position X, Position Y, Scale X, Scale Y, Z Angle) | `—` | — | — | 50 |
| Title | group (Movement, Far/Close, Position X, Position Y) | `—` | — | — | 50 |
| Image | group (Title, Track, Line, Actual Track) | `—` | — | — | 50 |
| OSC | group (?, Magnification , Dummy, Settings ) | `—` | — | — | 50 |
| ? | float | `—` | — | — | 50 |
| Mix | menu/enum (int) | `1` | [1 … 1] | — | 50 |
| Publish OSC | menu/enum (int) | `0` | [1 … 1] | — | 50 |

---
_Auto-generated from the Motion corpus (`~/motr-collection`) by `docs/filters-corpus/gen_fct_filter_docs.py`. Ranges/defaults are EMPIRICAL (observed in real templates), not Apple-documented limits. Keyed by FxPlug pluginUUID per `engine/src/compositor/filters/registry.ts`._