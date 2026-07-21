# Relief

- **PAE class:** `Relief`
- **Plugin UUID:** `267EDBAB-297C-4BF4-B741-A166B5997C9B`
- **Node names in corpus:** Relief (6), Relief 1 (5), Relief 1 copy 1 (4), Relief 1 copy 2 (1), Sweep (1), Relief 3 (1)
- **Corpus usage:** 11 files, 19 instances

## What it does

Relief is a directional emboss that carves the image into a raised/recessed surface lit from a direction defined by two OSC points (Front and Back). Fuzziness softens the relief and the Height Map/Map Channel select the surface source; the result is a chiselled, stone-carving look.

> **Note.** Not implemented; description is the standard Apple Motion "Relief" emboss filter. Front/Back Size and Height Map are internal wiring.

## Parameters

Only the creative parameters are listed. Ranges are the *typical values observed in the corpus*, not Apple-documented limits.

| Parameter | Type | Default | Typical range | What it controls |
|---|---|---|---|---|
| Front | point2D | - | - | One end of the relief lighting direction (OSC point). *(keyframed in 11 instances)* |
| Back | point2D | - | - | Other end of the relief lighting direction (OSC point). *(keyframed in 16 instances)* |
| Fuzziness | float | 0.1 | 0 .. 1 | Softness of the embossed relief, 0-1 (default 0.1). |
| Map Channel | enum(int) | 0 | 0 .. 3 | Which channel drives the height/relief (0-3). |
| Mix | float | 1 | 0.35 .. 1 | Wet/dry blend, 0-1 continuous. *(keyframed in 2 instances)* |
| Front Size | bool | 1 | 1 .. 1 | *(unverified)* *(keyframed in 11 instances)* |
| Back Size | bool | 1 | 1 .. 1 | *(unverified)* *(keyframed in 11 instances)* |
| Height Map | float | 0 | 0 .. 3148706917 | *(unverified)* |

## FxPlug plumbing

Non-creative host parameters on this filter: `Flip`, `Input Points`, `Publish OSC`. These are standard FxPlug/host boilerplate parameters shared by every Motion filter (on-screen-control plumbing, input-point handshakes, edge cropping, 360-degree awareness, HDR/scaling flags). They are not creative controls -- see the [README](README.md#fxplug-plumbing-parameters) for the full explanation.

## Implementation status

**Not implemented** (corpus-exercised; no dedicated shader extracted yet).
