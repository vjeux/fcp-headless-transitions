"""Extract + CLASSIFY the REAL parameter schema of a Motion primitive from the .motr DOM.

The catalog must NOT guess param names/ranges (an earlier draft guessed 'RemapBlackR' etc.
that don't exist). This reads the actual <parameter> leaves of a primitive instance in a
host slug: name-path, authored value (the θ0 center point), whether animated (<curve>), AND
a semantic CLASS. Only CONTINUOUS params are fuzzable — flags/enums/colorspace selectors are
NOT continuous and fuzzing them samples meaningless regions (an earlier fuzz sampled
'flip'=0.78, 'colorspace'=1.4, 'hdrinrec.709'=0.51 as if continuous, polluting divergence).

Classes:
  CONTINUOUS  — real scalar the filter math reads (blur amount, hue, saturation, gamma,
                mix, color channels, angle, radius...). Fuzzed across its range.
  FLAG        — boolean toggle stored as 0/1 (flip, flop, crop, publishosc, 360 aware,
                hdrinrec.709, prescaleinput). Fuzzed DISCRETELY at 0 and 1 (it IS real
                filter behavior — a flip/crop toggle changes the output — so we verify it,
                but probe the two boolean states, never a nonsense 0.5).
  ENUM        — discrete non-ordinal selector (histogram/channel, *colorspace, inputpoints).
                NOT fuzzed yet (needs per-value handling); reported so the gap is explicit.
Ranges (for CONTINUOUS) come from the param's semantic name + authored value.
"""
import xml.etree.ElementTree as ET
import re, json
from fct.faithful import mutate

_NUM = re.compile(r'^-?\d+(\.\d+)?([eE][-+]?\d+)?$')

# name_path substrings that mark a NON-continuous param (flags/enums/selectors). Matched
# against the normalized name_path. These are structural/gate params, not filter math.
_FLAG_KEYS = ('flip', 'flop', 'crop', 'publishosc', 'aware', 'hdrinrec.709', 'prescaleinput',
              'inputpoints', 'colorspace', 'histogram/channel', 'usealpha', 'invert',
              'premultiply', 'antialias', 'clamp')

def classify(name_path, authored):
    """CONTINUOUS | FLAG | ENUM for a leaf, from its normalized name + authored value."""
    n = name_path.lower()
    for k in _FLAG_KEYS:
        if k in n:
            # a 0/1-valued 'flip'/'crop' is a FLAG; a *colorspace/channel/inputpoints is ENUM
            if any(e in k for e in ('colorspace', 'channel', 'inputpoints')):
                return 'ENUM'
            return 'FLAG'
    return 'CONTINUOUS'

def _range_for(name_path, authored):
    """Heuristic range for a CONTINUOUS leaf from its name + authored value. Conservative +
    semantic: normalized channels/opacity/mix -> [0,1]; angle(rad) -> [0,2pi]; hue -> signed;
    gamma -> [0.1,4]; else span around authored. The oracle is truth at ANY value, so the
    point is to exercise a WIDE span far from θ0 (strong param signal), not hit Motion's UI max."""
    n = name_path.lower()
    a = authored
    if any(k in n for k in ('red', 'green', 'blue', 'alpha', 'opacity', 'intensity', 'mix',
                            'saturation', 'threshold', 'whiteout', 'blackin', 'whitein',
                            'softness')) and -0.0001 <= a <= 1.0001:
        return [0.0, 1.0]
    if 'angle' in n or 'rotation' in n:
        return [0.0, 6.2831853]  # Motion stores angles in RADIANS in the .motr
    if 'hue' in n:
        return [-3.1415927, 3.1415927]
    if 'gamma' in n:
        return [0.1, 4.0]
    if 'saturation' in n or n.endswith('value'):
        return [-1.0, 2.0]
    if any(k in n for k in ('horizontal', 'vertical', 'amount', 'radius', 'brightness')):
        return [0.0, max(2.0 * abs(a), 100.0)]
    if a == 0:
        return [0.0, 1.0]
    if a < 0:
        return [2.0 * a, -2.0 * a]
    return [0.0, 2.0 * a]

def probe_values(cls, name_path, authored):
    """Values the sweep sets the param to (skipping ~authored=θ0 baseline). Unifies
    continuous + discrete-flag testing:
      CONTINUOUS -> range extremes + midpoint (wide span, strong signal far from θ0)
      FLAG       -> the two discrete states 0.0 and 1.0 (a horizontal flip / crop / 360-aware
                    toggle IS real filter behavior a faithful engine must match; sampling it
                    at 0.5 is nonsense, so probe the actual boolean states)
      ENUM       -> [] (discrete non-ordinal selector; needs per-value handling; excluded and
                    reported so the gap is explicit, never silently 'passed')."""
    if cls == 'FLAG':
        return [0.0, 1.0]
    if cls == 'ENUM':
        return []
    lo, hi = _range_for(name_path, authored)
    return [lo, hi, 0.5 * (lo + hi)]

def extract(host_motr_path, plugin_name, continuous_only=False, fuzzable_only=False):
    """Return {name_path: {authored, animated, cls, range?, probes}} for the primitive's
    numeric leaves.
      continuous_only=True -> only CONTINUOUS params (legacy callers).
      fuzzable_only=True   -> CONTINUOUS + FLAG (everything with probe values); the sweep uses
                              this so discrete flags (flip/flop/crop/360-aware) ARE verified,
                              not silently skipped."""
    root = ET.parse(host_motr_path).getroot()
    pelem = mutate.find_primitive_elem(root, plugin_name)
    if pelem is None:
        return {}
    out = {}
    for pel, name_path in mutate.leaf_scalar_params(pelem):
        v = pel.get('value')
        if not (v and _NUM.match(v.strip())):
            continue
        authored = float(v)
        cls = classify(name_path, authored)
        if continuous_only and cls != 'CONTINUOUS':
            continue
        probes = probe_values(cls, name_path, authored)
        if fuzzable_only and not probes:
            continue
        entry = {'authored': round(authored, 5),
                 'animated': pel.find('curve') is not None, 'cls': cls,
                 'probes': [round(x, 6) for x in probes]}
        if cls == 'CONTINUOUS':
            entry['range'] = _range_for(name_path, authored)
        out[name_path] = entry
    return out

if __name__ == '__main__':
    import sys
    m = json.load(open('fct/slug_map.json'))
    slug = sys.argv[1]; plugin = sys.argv[2]
    sch = extract(m[slug], plugin)
    print(json.dumps(sch, indent=2))
