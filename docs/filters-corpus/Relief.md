# Relief

- **pluginUUID:** `267EDBAB-297C-4BF4-B741-A166B5997C9B`
- **PAE class:** `Relief`
- **Display names seen:** Relief (6), Relief 1 (5), Relief 1 copy 1 (4), Relief 1 copy 2 (1), Sweep (1)
- **Engine status:** ❌ not implemented
- **Corpus usage:** 19 instances across 11 files

## Parameters

| Parameter | Type | Default | Observed range | Keyframed | Seen |
|---|---|---|---|---|---|
| Front | point2D (X,Y) | `—` | — | 11 | 19 |
| Front Size | menu/enum (int) | `1` | [1 … 1] | 11 | 19 |
| Back | point2D (X,Y) | `—` | — | 16 | 19 |
| Back Size | menu/enum (int) | `1` | [1 … 1] | 11 | 19 |
| Fuzziness | bool (0/1) | `0.10000000000000001` | [0 … 1] | — | 19 |
| Height Map | float | `0` | [0 … 3148706917] | — | 19 |
| Map Channel | menu/enum (int) | `0` | [0 … 3] | — | 19 |
| Mix | float | `1` | [0.35 … 1] | 2 | 19 |
| Flip | float | `0` | [0 … 0] | — | 18 |
| Input Points | menu/enum (int) | `1` | [1 … 1] | — | 18 |
| Publish OSC | float | `0` | [0 … 0] | — | 18 |

---
_Auto-generated from the Motion corpus (`~/motr-collection`) by `docs/filters-corpus/gen_fct_filter_docs.py`. Ranges/defaults are EMPIRICAL (observed in real templates), not Apple-documented limits. Keyed by FxPlug pluginUUID per `engine/src/compositor/filters/registry.ts`._