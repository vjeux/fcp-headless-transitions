# Page Curl

- **PAE class:** `Page Curl`
- **Plugin UUID:** `BA8D0B63-2F01-4DA6-9751-56D308A28F98`
- **Node names in corpus:** Page Curl (74), Page Curl copy (14), Page Curl 1 (13), Page Curl 2 (12), Animate (3), Page Curl In (3)
- **Corpus usage:** 50 files, 127 instances

## What it does

Page Curl peels the layer back like turning a page: a corner/edge set by Angle and Rotation lifts and curls with a given Radius, revealing a Back Color behind it, animated by Percent from flat to fully turned. It is the classic page-turn transition. Not implemented; described from the standard Motion "Page Curl".

> **Note.** Not implemented in the TS engine and no checked-in shader; described from the standard Motion "Page Curl" filter.

## Parameters

Only the creative parameters are listed. Ranges are the *typical values observed in the corpus*, not Apple-documented limits.

| Parameter | Type | Default | Typical range | What it controls |
|---|---|---|---|---|
| Percent | float (percent) | 50 | 12 .. 100 | How far the page is turned, 12-100 (default 50). Animated (87 keyframe curves) to drive the turn. *(keyframed in 87 instances)* |
| Angle | float (radians) | -0.3142 | -7.052 .. 4.102 | Direction the curl travels across the page. *(keyframed in 7 instances)* |
| Rotation | float (radians) | -0.4189 | -0.7854 .. 5.84 | Orientation of the curl axis / which corner lifts. *(keyframed in 4 instances)* |
| Radius | float (pixels) | 20 | 1 .. 100 | Tightness of the curl roll, 1-100 (default 20). Smaller = a tighter roll. *(keyframed in 4 instances)* |
| Animate | bool | 1 | 0 .. 1 | Toggle: drive the curl by the built-in animation vs the Percent param directly. |
| Direction | bool | 0 | 0 .. 1 | Toggle: which way the page turns. |
| Highlight Color | color | - | - | Color of the specular highlight along the curl (nested RGB). |
| Back Color | color | - | - | Color revealed on the back of the curled page (nested RGB + Opacity). |
| Shadow | float | 50 | 0 .. 100 | Strength of the shadow cast by the lifted page, 0-100. |
| Fade Out | float | 20 | 0 .. 41 | Fade of the curled-away area, 0-41. *(keyframed in 1 instance)* |
| Mix | float | 1 | 1 .. 1 | Wet/dry blend, 0-1 continuous. NOT a boolean (only 1 sampled). *(keyframed in 1 instance)* |

## FxPlug plumbing

Non-creative host parameters on this filter: `Publish OSC`, `Flip`, `Input Points`. These are standard FxPlug/host boilerplate parameters shared by every Motion filter (on-screen-control plumbing, input-point handshakes, edge cropping, 360-degree awareness, HDR/scaling flags). They are not creative controls -- see the [README](README.md#fxplug-plumbing-parameters) for the full explanation.

## Implementation status

**Not implemented** (corpus-exercised; no dedicated shader extracted yet).
