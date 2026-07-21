# Motion Type Reference

Human-authored reference documentation for the Apple Motion / FCP type system this engine must
reproduce, built from a **5,365-file** corpus of real `.motr/.moti/.moef/.motn` templates
(`~/motr-collection`) fused with the repo's own reverse-engineering ground truth (decoded TS
modules, `Hgc*` shaders, RE write-ups). Corpus usage counts are empirical.

Motion scenes are built from three kinds of typed nodes:

| Type family | Reference | What it is |
|---|---|---|
| **Filters** (FxPlug effects) | [`../filters/README.md`](../filters/README.md) | Per-pixel image effects hosted on `ProPlugin Filter` nodes — blurs, color, distortions, stylize. Top 50 (by corpus usage) documented with per-parameter meaning, correct types, and implementation status. |
| **Components** (factory node types) | [`COMPONENTS.md`](COMPONENTS.md) | The 134 `<factory>` node types — Channel, Widget, Replicator, Shape, Generator, Camera, Text, Image Mask, Clone Layer, … — with corpus-scale usage. Extends `../CATALOG.md §2`. |
| **Behaviors** (procedural animation) | [`BEHAVIORS.md`](BEHAVIORS.md) | Motion's behavior system — Link, Rig Behavior, Clamp, Ramp, Oscillate, … — that computes parameter values each frame instead of keyframing. |

### How this relates to the other docs
- `../CATALOG.md` — the authoritative implementation status, tallied against the **65 shipping FCP
  transitions**. These type docs give the **corpus-scale** picture (1–2 orders of magnitude more
  usage) — i.e. the real scope for rendering arbitrary Motion content, not just the 65 built-ins.
- `../FILTER_UNIVERSE.md` — the filter RE/shader inventory + status legend.
- `../filters/` — the per-filter parameter reference (companion to FILTER_UNIVERSE).

### A note on parameters
Every filter/behavior carries FxPlug **plumbing** parameters (`Flip`, `Input Points`,
`Publish OSC`, `Crop`, `360° Aware`, …) that are host boilerplate, not creative controls; the
per-type docs separate these out. Localized (non-English) parameter duplicates present in the
corpus are merged into their English canonicals. Value ranges are **empirical** (observed in real
templates), not Apple-documented limits.
