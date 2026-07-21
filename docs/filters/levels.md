# Levels

- **PAE class:** `Levels`
- **Plugin UUID:** `2B221FA1-08A2-416E-998C-D7559E5509B5`
- **Node names in corpus:** Levels (617), Levels copy (30), Levels 1 (25), Levels 1 copy (22), Levels 2 (4), Levels 2 copy (2)
- **Corpus usage:** 382 files, 702 instances

## What it does

Levels is a tonal remap: it takes input black/white points and gamma and maps them to output black/white points, per channel or on RGB together, exactly like the Levels control in a photo editor. In the corpus the built-in transitions almost always drive only Gamma (via the Histogram > RGB > Gamma sub-parameter) to brighten or darken midtones. FCP internally runs a two-stage affine + power curve (HgcLevels); the TS engine implements the common single-stage form.

> **Note.** RE finding: the Motion UI `Gamma` is fed to the shader as its reciprocal, so a UI Gamma > 1 brightens midtones (net pow(x, 1/gamma)). The input/output black+white points are exposed as children of `Histogram` and are largely unexercised by the shipping transitions.

## Parameters

Only the creative parameters are listed. Ranges are the *typical values observed in the corpus*, not Apple-documented limits.

| Parameter | Type | Default | Typical range | What it controls |
|---|---|---|---|---|
| Histogram | color | - | - | The tonal-mapping controls, nested: Channel selects RGB or a single channel; RGB/Red/Green/Blue hold the black-in, white-in, gamma, black-out, white-out sub-parameters; Opacity blends. Gamma is the dominant driven knob. *(keyframed in 11 instances)* |
| Mix | float | 1 | 0 .. 1 | Wet/dry blend of the remapped result over the original, 0-1 continuous. *(keyframed in 32 instances)* |
| Levels::HDR In Rec. 709 | bool | 0 | 0 .. 0 | Working-space toggle: interpret input as Rec.709 HDR. Not a creative control. |

## FxPlug plumbing

Non-creative host parameters on this filter: `Flip`, `Input Points`. These are standard FxPlug/host boilerplate parameters shared by every Motion filter (on-screen-control plumbing, input-point handshakes, edge cropping, 360-degree awareness, HDR/scaling flags). They are not creative controls -- see the [README](README.md#fxplug-plumbing-parameters) for the full explanation.

## Implementation status

**Implemented.** TS module: [`engine/src/compositor/filters/levels.ts`](../../engine/src/compositor/filters/levels.ts).

> 1 localized (non-English) parameter duplicate(s) were merged/omitted from the parameter table above.
