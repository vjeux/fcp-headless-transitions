"""fct.timing — the SINGLE per-transition timing model.

FCP plays a transition over its AUTHORED scene duration (sceneSettings/duration
frames / frameRate) and the timeline covers it as N EQUAL, HALF-OPEN slices:
frame i sits at progress i/N, so t = (i/N) * span. Frame 0 = pure A; the last
frame (N-1) lands INSIDE the transition (fully B) and must NOT be nudged to span
(span is the wrap point back to A). Verified on Push seam-fit (RMS 0.0006).

This replaces the closed i/(N-1) convention (which lagged the back half).
"""
from xml.dom.minidom import parse as _parse

def scene_duration_seconds(motr_path: str) -> float:
    """FCP's authored transition span (s) = sceneSettings/duration / frameRate.
    Returns 0.0 if unparseable (caller should fall back, e.g. to 2.0)."""
    try:
        doc = _parse(motr_path)
        ss = doc.getElementsByTagName("sceneSettings")
        if not ss:
            return 0.0
        dur_el = ss[0].getElementsByTagName("duration")
        fr_el = ss[0].getElementsByTagName("frameRate")
        if not (dur_el and fr_el and dur_el[0].firstChild and fr_el[0].firstChild):
            return 0.0
        dur = float(dur_el[0].firstChild.data)
        fr = float(fr_el[0].firstChild.data)
        return dur / fr if fr > 0 else 0.0
    except Exception:
        return 0.0

def sample_time(i: int, nframes: int, span: float) -> float:
    """Scene-time (s) for frame i of nframes over span: half-open (i/nframes)*span."""
    if nframes <= 1:
        return 0.0
    return (i / nframes) * span
